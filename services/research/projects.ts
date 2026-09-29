/** Research project creation shared by several actions. */
import { ApiError } from "../../lib/errors";
import type { Actor } from "../../lib/auth";
import { RESEARCH_STAGE_NAMES, cleanText, makeResearchCode, researchStageDates, strictResearchDate, type ResearchAccessContext, type ResearchProjectRow } from "../../lib/research-server";
import { authorize } from "../../lib/policy";
import { researchProjectCreate, researchProjectReview } from "../../lib/policy/research";
import { type JsonRecord, type CreateProjectOptions, required, nonNegativeInteger, projectKind, assertAuditInserted } from "./common";
import { projectAuditByCode } from "./audit";
import { resolveDirectorySelection } from "./directory";

export async function createProject(
  db: D1Database,
  actor: Actor,
  context: ResearchAccessContext,
  payload: JsonRecord,
  options: CreateProjectOptions = {},
) {
  const origin = options.origin ?? "manual";
  await authorize(origin === "manual" ? researchProjectCreate(actor, context) : researchProjectReview(actor, context));
  const title = required(payload.title, "Loyiha nomi", 280);
  const area = required(payload.area, "Yo‘nalish", 120);
  const directory = options.directory ?? await resolveDirectorySelection(db, payload, context.domainId);
  const problem = required(payload.problem, "Muammo", 2000);
  const objective = required(payload.objective, "Maqsad", 2000);
  const expectedResult = required(payload.expectedResult, "Kutilayotgan natija", 2000);
  const novelty = cleanText(payload.novelty, 2000);
  const startDate = strictResearchDate(payload.startDate);
  const endDate = strictResearchDate(payload.endDate);
  if (!startDate || !endDate) throw new ApiError(400, "Loyiha sanalari to‘g‘ri formatda bo‘lishi kerak.");
  if (endDate <= startDate) throw new ApiError(400, "Tugash sanasi boshlanish sanasidan keyin bo‘lishi kerak.");
  const budget = nonNegativeInteger(payload.budget, "Budjet");
  const code = cleanText(payload.code, 40) || makeResearchCode("IT");
  const duplicate = await db.prepare(
    "SELECT id FROM app_research_projects WHERE code=? LIMIT 1",
  ).bind(code).first();
  if (duplicate) throw new ApiError(409, "Ushbu loyiha kodi allaqachon mavjud.");
  const projectValues = [
    code,
    title,
    projectKind(payload.kind),
    area,
    directory.organizationId,
    directory.employeeId,
    context.ownerDepartmentId,
    problem,
    objective,
    novelty,
    expectedResult,
    startDate,
    endDate,
    budget,
    origin,
    options.sourceIntakeId ?? null,
    actor.id,
    actor.id,
  ];
  const projectInsert = options.sourceIntakeId
    ? db.prepare(
      `INSERT INTO app_research_projects
        (code,title,kind,area,executor_organization_id,responsible_employee_id,
         coordinator_department_id,problem,objective,novelty,expected_result,
         start_date,end_date,budget,status,current_stage,progress,origin,source_intake_id,
         created_by_employee_id,updated_by_employee_id)
       SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,'draft',1,0,?,?,?,?
         FROM app_research_intake_items source
        WHERE source.id=? AND source.version=? AND source.converted_project_id IS NULL
          AND source.status IN ('open','submitted')
          AND source.kind=CASE WHEN ?='problem' THEN 'problem' ELSE ? END
          AND (?<>'problem' OR EXISTS (
            SELECT 1 FROM app_research_intake_items proposal
             WHERE proposal.id=? AND proposal.parent_id=source.id AND proposal.kind='proposal'
               AND proposal.version=? AND proposal.status='submitted'
               AND proposal.converted_project_id IS NULL
          ))`,
    ).bind(
      ...projectValues,
      options.sourceIntakeId,
      options.sourceVersion,
      origin,
      origin,
      origin,
      options.proposalId,
      options.proposalVersion,
    )
    : db.prepare(
    `INSERT INTO app_research_projects
      (code,title,kind,area,executor_organization_id,responsible_employee_id,
       coordinator_department_id,problem,objective,novelty,expected_result,
       start_date,end_date,budget,status,current_stage,progress,origin,source_intake_id,
       created_by_employee_id,updated_by_employee_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'draft',1,0,?,?,?,?)`,
    ).bind(...projectValues);

  const dates = researchStageDates(startDate, endDate);
  const statements: D1PreparedStatement[] = [
    projectInsert,
    ...RESEARCH_STAGE_NAMES.map((name, index) => db.prepare(
      `INSERT INTO app_research_milestones (project_id,stage,name,planned_date,status)
       SELECT project.id,?,?,?,? FROM app_research_projects project WHERE project.code=?`,
    ).bind(index + 1, name, dates[index], index === 0 ? "active" : "pending", code)),
  ];

  if (options.sourceIntakeId && origin === "problem") {
    statements.push(
      db.prepare(
        `UPDATE app_research_intake_items SET status='selected',
           converted_project_id=(SELECT id FROM app_research_projects WHERE code=?),
           updated_by_employee_id=?,updated_at=CURRENT_TIMESTAMP,version=version+1
         WHERE id=? AND parent_id=? AND kind='proposal' AND version=? AND status='submitted'
           AND converted_project_id IS NULL
           AND EXISTS (SELECT 1 FROM app_research_projects WHERE code=?)`,
      ).bind(code, actor.id, options.proposalId, options.sourceIntakeId, options.proposalVersion, code),
      db.prepare(
        `UPDATE app_research_intake_items SET status='rejected',updated_by_employee_id=?,
           updated_at=CURRENT_TIMESTAMP,version=version+1
         WHERE kind='proposal' AND parent_id=? AND id<>? AND status='submitted'
           AND EXISTS (SELECT 1 FROM app_research_intake_items selected
             WHERE selected.id=? AND selected.status='selected'
               AND selected.converted_project_id=(SELECT id FROM app_research_projects WHERE code=?))`,
      ).bind(actor.id, options.sourceIntakeId, options.proposalId, options.proposalId, code),
      db.prepare(
        `UPDATE app_research_intake_items SET status='converted',
           converted_project_id=(SELECT id FROM app_research_projects WHERE code=?),
           updated_by_employee_id=?,updated_at=CURRENT_TIMESTAMP,version=version+1
         WHERE id=? AND kind='problem' AND version=? AND converted_project_id IS NULL
           AND status IN ('open','submitted')
           AND EXISTS (SELECT 1 FROM app_research_intake_items selected
             WHERE selected.id=? AND selected.status='selected'
               AND selected.converted_project_id=(SELECT id FROM app_research_projects WHERE code=?))`,
      ).bind(code, actor.id, options.sourceIntakeId, options.sourceVersion, options.proposalId, code),
    );
  } else if (options.sourceIntakeId) {
    statements.push(db.prepare(
      `UPDATE app_research_intake_items SET status='converted',
         converted_project_id=(SELECT id FROM app_research_projects WHERE code=?),
         updated_by_employee_id=?,updated_at=CURRENT_TIMESTAMP,version=version+1
       WHERE id=? AND version=? AND kind=? AND converted_project_id IS NULL
         AND status IN ('open','submitted')
         AND EXISTS (SELECT 1 FROM app_research_projects WHERE code=?)`,
    ).bind(code, actor.id, options.sourceIntakeId, options.sourceVersion, origin, code));
  }

  const sourceEnd = statements.length;
  statements.push(projectAuditByCode(
    db,
    actor,
    context,
    "project_created",
    code,
    1,
    "draft",
    {
      toStatus: "draft",
      origin,
      sourceIntakeId: options.sourceIntakeId ?? null,
      comment: origin === "manual"
        ? "Loyiha pasporti yaratildi."
        : "Tashabbus asosida loyiha pasporti yaratildi.",
    },
  ));
  const results = await db.batch(statements);
  if (Number(results[0].meta.changes ?? 0) !== 1) {
    throw new ApiError(409, "Loyiha manbasi o‘zgargan yoki loyiha kodi band. Sahifani yangilang.");
  }
  for (const result of results.slice(1, 7)) {
    if (Number(result.meta.changes ?? 0) !== 1) {
      throw new ApiError(500, "Loyihaning 6 bosqichi to‘liq yaratilmagan.");
    }
  }
  const sourceResults = results.slice(7, sourceEnd);
  if (options.sourceIntakeId) {
    const requiredIndex = origin === "problem" ? 2 : 0;
    if (Number(sourceResults[requiredIndex]?.meta.changes ?? 0) !== 1) {
      throw new ApiError(409, "Loyiha manbasi o‘zgargan. Sahifani yangilang.");
    }
  }
  assertAuditInserted(results[sourceEnd]);
  const inserted = await db.prepare("SELECT id FROM app_research_projects WHERE code=? LIMIT 1")
    .bind(code).first<{ id: number }>();
  if (!inserted?.id) throw new ApiError(500, "Loyiha yaratilmadi.");
  return Number(inserted.id);
}

export async function currentMilestone(db: D1Database, project: ResearchProjectRow) {
  return db.prepare(
    `SELECT id,status,expenditure,version,submitted_by_employee_id,verified_by_employee_id FROM app_research_milestones
      WHERE project_id=? AND stage=? LIMIT 1`,
  ).bind(project.id, project.currentStage).first<{
    id: number;
    status: string;
    expenditure: number;
    version: number;
    submitted_by_employee_id: number | null;
    verified_by_employee_id: number | null;
  }>();
}
