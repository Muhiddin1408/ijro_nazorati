/** Project passport lifecycle: create, edit, activate, start implementation, archive. */
import { ApiError } from "../../lib/errors";
import { cleanText, researchProjectById, researchStageDates, strictResearchDate } from "../../lib/research-server";
import { isEditableRecordStatus } from "../../lib/shared/statuses";
import { authorize } from "../../lib/policy";
import { researchProjectCreate, researchProjectReview } from "../../lib/policy/research";
import { required, requiredId, requiredVersion, nonNegativeInteger, projectKind, assertProjectVersionChanged, assertAuditInserted, type ResearchActionContext } from "./common";
import { projectAuditById } from "./audit";
import { resolveDirectorySelection } from "./directory";
import { createProject } from "./projects";

export async function createProjectAction(ctx: ResearchActionContext): Promise<Response> {
  const { actor, payload, db, context } = ctx;
  const origin = ["problem", "topic", "foreign"].includes(String(payload.origin))
    ? String(payload.origin) as "problem" | "topic" | "foreign"
    : "manual";
  if (origin !== "manual") {
    await authorize(researchProjectReview(actor, context, "Tashabbusni loyihaga aylantirish uchun tasdiqlovchi vakolati kerak."));
  }
  const requestedSourceId = origin === "manual"
    ? null
    : requiredId(payload.sourceIntakeId, "Manba yozuv ID si");
  let canonicalSourceId = requestedSourceId;
  let sourceVersion: number | null = null;
  let proposalId: number | null = null;
  let proposalVersion: number | null = null;
  let problemId: number | null = null;
  if (requestedSourceId) {
    const source = await db.prepare(
      `SELECT id,kind,parent_id,status,version,converted_project_id
         FROM app_research_intake_items WHERE id=? LIMIT 1`,
    ).bind(requestedSourceId).first<Record<string, unknown>>();
    const expectedKind = origin === "problem" ? "proposal" : origin;
    if (!source || String(source.kind) !== expectedKind) {
      throw new ApiError(400, "Loyiha manbasi tanlangan turga mos emas.");
    }
    if (source.converted_project_id != null || !["open", "submitted"].includes(String(source.status))) {
      throw new ApiError(409, "Bu manba bo‘yicha loyiha avval yaratilgan.");
    }
    if (origin === "problem") {
      proposalId = Number(source.id);
      proposalVersion = Number(source.version);
      problemId = requiredId(source.parent_id, "Muammo ID si");
      const problem = await db.prepare(
        `SELECT id,status,version,converted_project_id FROM app_research_intake_items
          WHERE id=? AND kind='problem' LIMIT 1`,
      ).bind(problemId).first<Record<string, unknown>>();
      if (!problem || problem.converted_project_id != null || !["open", "submitted"].includes(String(problem.status))) {
        throw new ApiError(409, "Ushbu muammo bo‘yicha loyiha avval yaratilgan.");
      }
      canonicalSourceId = problemId;
      sourceVersion = Number(problem.version);
    } else {
      sourceVersion = Number(source.version);
    }
  }

  const id = await createProject(db, actor, context, payload, {
    origin,
    sourceIntakeId: canonicalSourceId,
    sourceVersion,
    proposalId,
    proposalVersion,
  });
  return Response.json({ ok: true, id }, { status: 201 });
}

export async function updateProject(ctx: ResearchActionContext): Promise<Response> {
  const { actor, payload, db, context } = ctx;
  const id = requiredId(payload.id, "Loyiha ID si");
  const version = requiredVersion(payload.version);
  const project = await researchProjectById(db, id);
  if (!project) throw new ApiError(404, "Loyiha topilmadi.");
  await authorize(researchProjectCreate(actor, context));
  if (!isEditableRecordStatus(project.status)) {
    throw new ApiError(409, "Faqat qoralama yoki tuzatishga qaytarilgan loyiha pasporti o‘zgartiriladi.");
  }
  const directory = await resolveDirectorySelection(db, payload, context.domainId);
  const title = required(payload.title, "Loyiha nomi", 280);
  const area = required(payload.area, "Yo‘nalish", 120);
  const problem = required(payload.problem, "Muammo", 2000);
  const objective = required(payload.objective, "Maqsad", 2000);
  const expectedResult = required(payload.expectedResult, "Kutilayotgan natija", 2000);
  const novelty = cleanText(payload.novelty, 2000);
  const startDate = strictResearchDate(payload.startDate);
  const endDate = strictResearchDate(payload.endDate);
  if (!startDate || !endDate || endDate <= startDate) {
    throw new ApiError(400, "Loyiha muddatlarini tekshiring.");
  }
  const budget = nonNegativeInteger(payload.budget, "Budjet");
  if (budget < Number(project.spent)) {
    throw new ApiError(400, "Budjet tasdiqlangan amaldagi xarajatdan kam bo‘lishi mumkin emas.");
  }
  const dates = researchStageDates(startDate, endDate);
  const milestoneRows = await db.prepare(
    "SELECT stage,status,version FROM app_research_milestones WHERE project_id=? ORDER BY stage",
  ).bind(id).all<{ stage: number; status: string; version: number }>();
  if (milestoneRows.results.length !== dates.length
    || milestoneRows.results.some((row, index) => Number(row.stage) !== index + 1)) {
    throw new ApiError(409, "Loyiha bosqichlari to‘liq topilmadi. Administratorga murojaat qiling.");
  }
  const mutableMilestones = milestoneRows.results.filter(
    (row) => Number(row.stage) >= Number(project.currentStage) && row.status !== "approved",
  );
  if (!mutableMilestones.length) {
    throw new ApiError(409, "Tahrirlanadigan loyiha bosqichi topilmadi.");
  }
  const milestoneCase = mutableMilestones.map(() => "WHEN ? THEN ?").join(" ");
  const milestoneStages = mutableMilestones.map(() => "?").join(",");
  const milestoneVersionGuard = mutableMilestones
    .map(() => "(stage=? AND version=? AND status<>'approved')")
    .join(" OR ");
  const statements = [db.prepare(
    `UPDATE app_research_milestones
        SET planned_date=CASE stage ${milestoneCase} ELSE planned_date END,
            updated_at=CURRENT_TIMESTAMP,version=version+1
      WHERE project_id=? AND stage IN (${milestoneStages}) AND status<>'approved'
        AND EXISTS (
          SELECT 1 FROM app_research_projects
           WHERE id=? AND version=? AND status IN ('draft','returned')
        )
        AND (
          SELECT COUNT(*) FROM app_research_milestones
           WHERE project_id=? AND (${milestoneVersionGuard})
        )=?`,
  ).bind(
    ...mutableMilestones.flatMap((row) => [Number(row.stage), dates[Number(row.stage) - 1]]),
    id,
    ...mutableMilestones.map((row) => Number(row.stage)),
    id,
    version,
    id,
    ...mutableMilestones.flatMap((row) => [Number(row.stage), Number(row.version)]),
    mutableMilestones.length,
  )];
  const milestoneCompletionGuard = mutableMilestones
    .map(() => "(stage=? AND version=? AND planned_date=?)")
    .join(" OR ");
  statements.push(db.prepare(
      `UPDATE app_research_projects SET
         title=?,kind=?,area=?,executor_organization_id=?,responsible_employee_id=?,
         coordinator_department_id=?,problem=?,objective=?,novelty=?,expected_result=?,
         start_date=?,end_date=?,budget=?,updated_by_employee_id=?,
         updated_at=CURRENT_TIMESTAMP,version=version+1
       WHERE id=? AND version=? AND status IN ('draft','returned')
         AND (
           SELECT COUNT(*) FROM app_research_milestones
            WHERE project_id=? AND (${milestoneCompletionGuard})
         )=?`,
    ).bind(
      title, projectKind(payload.kind), area, directory.organizationId, directory.employeeId,
      context.ownerDepartmentId, problem, objective, novelty, expectedResult,
      startDate, endDate, budget, actor.id, id, version,
      id,
      ...mutableMilestones.flatMap((row) => [Number(row.stage), Number(row.version) + 1, dates[Number(row.stage) - 1]]),
      mutableMilestones.length,
    ),
  );
  statements.push(projectAuditById(
    db,
    actor,
    context,
    "project_updated",
    id,
    version + 1,
    project.status,
    {
      fromStatus: project.status,
      toStatus: project.status,
      comment: "Loyiha pasporti yangilandi.",
    },
  ));
  const results = await db.batch(statements);
  assertProjectVersionChanged(results[1], "Loyiha boshqa foydalanuvchi tomonidan yangilangan. Sahifani yangilang.");
  if (Number(results[0].meta.changes ?? 0) !== mutableMilestones.length) {
    throw new ApiError(409, "Loyiha bosqichlari o‘zgargan. Sahifani yangilang.");
  }
  assertAuditInserted(results[2]);
  return Response.json({ ok: true });
}

export async function activateProject(ctx: ResearchActionContext): Promise<Response> {
  const { actor, payload, db, context } = ctx;
  const id = requiredId(payload.id, "Loyiha ID si");
  const version = requiredVersion(payload.version);
  const project = await researchProjectById(db, id);
  if (!project) throw new ApiError(404, "Loyiha topilmadi.");
  await authorize(researchProjectCreate(actor, context));
  if (project.status !== "draft") throw new ApiError(409, "Faqat qoralama loyiha ijroga yuboriladi.");
  const attachment = await db.prepare(
    "SELECT COUNT(*) AS count FROM app_research_files WHERE project_id=? AND purpose IN ('passport','technical_task')",
  ).bind(id).first<{ count: number }>();
  if (Number(attachment?.count ?? 0) < 1) {
    throw new ApiError(400, "Ijroga yuborishdan oldin loyiha pasporti yoki texnik topshiriq faylini biriktiring.");
  }
  const firstMilestone = await db.prepare(
    `SELECT id,version,status FROM app_research_milestones
      WHERE project_id=? AND stage=1 AND status IN ('pending','active') LIMIT 1`,
  ).bind(id).first<{ id: number; version: number; status: string }>();
  if (!firstMilestone) {
    throw new ApiError(409, "Loyihaning birinchi bosqichi topilmadi. Administratorga murojaat qiling.");
  }
  const comment = cleanText(payload.comment, 1000) || "Loyiha ijrochi tashkilotga yuborildi.";
  const results = await db.batch([
    db.prepare(
      `UPDATE app_research_milestones SET status='active',updated_at=CURRENT_TIMESTAMP,version=version+1
        WHERE id=? AND project_id=? AND version=? AND status IN ('pending','active')
         AND EXISTS (
           SELECT 1 FROM app_research_projects
            WHERE id=? AND version=? AND status='draft'
         )`,
    ).bind(firstMilestone.id, id, firstMilestone.version, id, version),
    db.prepare(
      `UPDATE app_research_projects SET status='active',updated_by_employee_id=?,
         updated_at=CURRENT_TIMESTAMP,version=version+1
       WHERE id=? AND version=? AND status='draft'
         AND EXISTS (
           SELECT 1 FROM app_research_milestones
            WHERE id=? AND project_id=? AND version=? AND status='active'
         )`,
      ).bind(actor.id, id, version, firstMilestone.id, id, firstMilestone.version + 1),
    projectAuditById(
      db,
      actor,
      context,
      "project_activated",
      id,
      version + 1,
      "active",
      {
        fromStatus: "draft",
        toStatus: "active",
        comment,
      },
    ),
  ]);
  assertProjectVersionChanged(results[1], "Loyiha holati o‘zgargan. Sahifani yangilang.");
  assertProjectVersionChanged(results[0], "Loyihaning birinchi bosqichi topilmadi. Administratorga murojaat qiling.");
  assertAuditInserted(results[2]);
  return Response.json({ ok: true });
}

export async function startImplementation(ctx: ResearchActionContext): Promise<Response> {
  const { actor, payload, db, context } = ctx;
  const id = requiredId(payload.id, "Loyiha ID si");
  const version = requiredVersion(payload.version);
  const project = await researchProjectById(db, id);
  if (!project) throw new ApiError(404, "Loyiha topilmadi.");
  await authorize(researchProjectReview(actor, context));
  if (project.status !== "completed") {
    throw new ApiError(409, "Faqat yakunlangan loyiha joriy etishga o‘tkaziladi.");
  }
  const comment = cleanText(payload.comment, 1000) || "Natijani amaliyotga joriy etish boshlandi.";
  const results = await db.batch([
    db.prepare(
      `UPDATE app_research_projects SET status='implementation',updated_by_employee_id=?,
         updated_at=CURRENT_TIMESTAMP,version=version+1
       WHERE id=? AND version=? AND status='completed'`,
    ).bind(actor.id, id, version),
    projectAuditById(
      db,
      actor,
      context,
      "implementation_started",
      id,
      version + 1,
      "implementation",
      {
        fromStatus: "completed",
        toStatus: "implementation",
        comment,
      },
    ),
  ]);
  assertProjectVersionChanged(results[0], "Loyiha holati o‘zgargan. Sahifani yangilang.");
  assertAuditInserted(results[1]);
  return Response.json({ ok: true });
}

export async function archiveProject(ctx: ResearchActionContext): Promise<Response> {
  const { actor, payload, db, context } = ctx;
  const id = requiredId(payload.id, "Loyiha ID si");
  const version = requiredVersion(payload.version);
  const project = await researchProjectById(db, id);
  if (!project) throw new ApiError(404, "Loyiha topilmadi.");
  await authorize(researchProjectCreate(actor, context));
  if (!["draft", "returned", "completed", "implementation"].includes(project.status)) {
    throw new ApiError(409, "Faqat qoralama, qaytarilgan yoki yakunlangan loyiha arxivlanadi.");
  }
  const comment = required(payload.comment, "Arxivlash sababi", 1000);
  if (comment.length < 10) throw new ApiError(400, "Arxivlash sababi kamida 10 ta belgidan iborat bo‘lsin.");
  const results = await db.batch([
    db.prepare(
      `UPDATE app_research_projects SET status='archived',updated_by_employee_id=?,
         updated_at=CURRENT_TIMESTAMP,version=version+1
       WHERE id=? AND version=? AND status=?`,
    ).bind(actor.id, id, version, project.status),
    projectAuditById(
      db,
      actor,
      context,
      "project_archived",
      id,
      version + 1,
      "archived",
      {
        fromStatus: project.status,
        toStatus: "archived",
        comment,
      },
    ),
  ]);
  assertProjectVersionChanged(results[0], "Loyiha holati o‘zgargan. Sahifani yangilang.");
  assertAuditInserted(results[1]);
  return Response.json({ ok: true });
}
