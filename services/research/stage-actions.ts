/** Stage results: executor submission, institute verification and committee review. */
import { ApiError } from "../../lib/errors";
import { RESEARCH_STAGE_PROGRESS, cleanText, researchProjectById } from "../../lib/research-server";
import { authorize } from "../../lib/policy";
import { researchStageSubmit, researchStageVerify, researchStageFinalReview } from "../../lib/policy/research";
import { required, requiredId, requiredVersion, nonNegativeInteger, assertProjectVersionChanged, assertAuditInserted, type ResearchActionContext } from "./common";
import { projectAuditById } from "./audit";
import { currentMilestone } from "./projects";

export async function submitStage(ctx: ResearchActionContext): Promise<Response> {
  const { actor, payload, db, context } = ctx;
  const id = requiredId(payload.id, "Loyiha ID si");
  const version = requiredVersion(payload.version);
  const project = await researchProjectById(db, id);
  if (!project) throw new ApiError(404, "Loyiha topilmadi.");
  await authorize(researchStageSubmit(actor, project, context));
  if (!["active", "returned"].includes(project.status)) {
    throw new ApiError(409, "Bosqich natijasini faqat jarayondagi yoki tuzatishga qaytarilgan loyiha bo‘yicha yuborish mumkin.");
  }
  const summary = required(payload.summary, "Bajarilgan ishlar", 4000);
  if (summary.length < 20) throw new ApiError(400, "Bajarilgan ishlar kamida 20 ta belgidan iborat bo‘lsin.");
  const kpi = required(payload.kpi, "Erishilgan natija yoki KPI", 800);
  const expenditure = nonNegativeInteger(payload.expenditure, "Davr xarajati");
  const milestone = await currentMilestone(db, project);
  if (!milestone || !["active", "returned"].includes(milestone.status)) {
    throw new ApiError(409, "Joriy bosqich yuborishga tayyor emas.");
  }
  const files = await db.prepare(
    `SELECT COUNT(*) AS count FROM app_research_files
      WHERE project_id=? AND milestone_id=? AND purpose IN ('evidence','result')`,
  ).bind(id, milestone.id).first<{ count: number }>();
  if (Number(files?.count ?? 0) < 1) {
    throw new ApiError(400, "Progressni tasdiqlash uchun kamida bitta dalil fayli biriktirilishi kerak.");
  }
  const otherSpend = await db.prepare(
    `SELECT COALESCE(SUM(expenditure),0) AS total FROM app_research_milestones
      WHERE project_id=? AND id<>?`,
  ).bind(id, milestone.id).first<{ total: number }>();
  const totalSpend = Number(otherSpend?.total ?? 0) + expenditure;
  if ((Number(project.budget) === 0 && totalSpend > 0) || totalSpend > Number(project.budget)) {
    throw new ApiError(400, "Kiritilgan xarajat loyiha budjetidan oshib ketdi.");
  }
  const results = await db.batch([
    db.prepare(
      `UPDATE app_research_projects SET status='institute_review',spent=?,updated_by_employee_id=?,
         updated_at=CURRENT_TIMESTAMP,version=version+1
       WHERE id=? AND version=? AND status IN ('active','returned')
         AND EXISTS (
           SELECT 1 FROM app_research_milestones
            WHERE id=? AND project_id=? AND version=? AND status IN ('active','returned')
         )`,
    ).bind(totalSpend, actor.id, id, version, milestone.id, id, milestone.version),
    db.prepare(
      `UPDATE app_research_milestones SET status='institute_review',result_summary=?,kpi_value=?,
         expenditure=?,reviewer_comment='',submitted_by_employee_id=?,submitted_at=CURRENT_TIMESTAMP,
         verified_by_employee_id=NULL,verified_at=NULL,reviewed_by_employee_id=NULL,reviewed_at=NULL,
         updated_at=CURRENT_TIMESTAMP,version=version+1
       WHERE id=? AND version=? AND status IN ('active','returned')
         AND EXISTS (
           SELECT 1 FROM app_research_projects
            WHERE id=? AND version=? AND status='institute_review'
      )`,
    ).bind(summary, kpi, expenditure, actor.id, milestone.id, milestone.version, id, version + 1),
    projectAuditById(
      db,
      actor,
      context,
      "stage_submitted",
      id,
      version + 1,
      "institute_review",
      {
        fromStatus: project.status,
        toStatus: "institute_review",
        stage: project.currentStage,
        comment: `${project.currentStage}-bosqich ijrochi tashkilot tekshiruviga yuborildi. ${kpi}`,
      },
    ),
  ]);
  assertProjectVersionChanged(results[0], "Loyiha ma’lumoti o‘zgargan. Sahifani yangilang.");
  assertProjectVersionChanged(results[1], "Bosqich ma’lumoti o‘zgargan. Sahifani yangilang.");
  assertAuditInserted(results[2]);
  return Response.json({ ok: true });
}

export async function reviewStage(ctx: ResearchActionContext): Promise<Response> {
  const { action, actor, payload, db, context } = ctx;
  const id = requiredId(payload.id, "Loyiha ID si");
  const version = requiredVersion(payload.version);
  const decision = String(payload.decision ?? "");
  if (!['approve', 'return'].includes(decision)) throw new ApiError(400, "Tekshiruv qarori noto‘g‘ri.");
  const comment = cleanText(payload.comment, 1500);
  if (decision === "return" && comment.length < 10) {
    throw new ApiError(400, "Qaytarish sababi kamida 10 ta belgidan iborat bo‘lsin.");
  }
  const project = await researchProjectById(db, id);
  if (!project) throw new ApiError(404, "Loyiha topilmadi.");
  const verificationAction = action === "verify_stage";
  const expectedReviewStatus = verificationAction ? "institute_review" : "committee_review";
  if (project.status !== expectedReviewStatus) throw new ApiError(409, "Loyiha ushbu tekshiruv navbatida emas.");
  const milestone = await currentMilestone(db, project);
  if (!milestone || milestone.status !== project.status) {
    throw new ApiError(409, "Tekshiruvga yuborilgan bosqich topilmadi.");
  }
  await authorize(verificationAction
    ? researchStageVerify(actor, project, milestone, context)
    : researchStageFinalReview(actor, project, milestone, context));

  if (decision === "return") {
    const milestoneReturn = verificationAction
      ? db.prepare(
        `UPDATE app_research_milestones SET status='returned',reviewer_comment=?,
           verified_by_employee_id=?,verified_at=CURRENT_TIMESTAMP,
           updated_at=CURRENT_TIMESTAMP,version=version+1
         WHERE id=? AND version=? AND status=?
           AND EXISTS (
             SELECT 1 FROM app_research_projects
              WHERE id=? AND version=? AND status='returned'
           )`,
      ).bind(comment, actor.id, milestone.id, milestone.version, project.status, id, version + 1)
      : db.prepare(
        `UPDATE app_research_milestones SET status='returned',reviewer_comment=?,
           reviewed_by_employee_id=?,reviewed_at=CURRENT_TIMESTAMP,
           updated_at=CURRENT_TIMESTAMP,version=version+1
         WHERE id=? AND version=? AND status=?
           AND EXISTS (
             SELECT 1 FROM app_research_projects
              WHERE id=? AND version=? AND status='returned'
           )`,
      ).bind(comment, actor.id, milestone.id, milestone.version, project.status, id, version + 1);
    const results = await db.batch([
      db.prepare(
        `UPDATE app_research_projects SET status='returned',updated_by_employee_id=?,
           updated_at=CURRENT_TIMESTAMP,version=version+1
         WHERE id=? AND version=? AND status=?
           AND EXISTS (
             SELECT 1 FROM app_research_milestones
              WHERE id=? AND project_id=? AND version=? AND status=?
           )`,
      ).bind(actor.id, id, version, project.status, milestone.id, id, milestone.version, project.status),
      milestoneReturn,
      projectAuditById(
        db,
        actor,
        context,
        "stage_returned",
        id,
        version + 1,
        "returned",
        {
          fromStatus: project.status,
          toStatus: "returned",
          stage: project.currentStage,
          comment,
        },
      ),
    ]);
    assertProjectVersionChanged(results[0], "Loyiha holati o‘zgargan. Sahifani yangilang.");
    assertProjectVersionChanged(results[1], "Bosqich holati o‘zgargan. Sahifani yangilang.");
    assertAuditInserted(results[2]);
    return Response.json({ ok: true });
  }

  // Institute verification is a mandatory, separate step. Committee
  // review cannot approve a result directly from institute_review.
  if (verificationAction) {
    const results = await db.batch([
      db.prepare(
        `UPDATE app_research_projects SET status='committee_review',updated_by_employee_id=?,
           updated_at=CURRENT_TIMESTAMP,version=version+1
         WHERE id=? AND version=? AND status='institute_review'
           AND EXISTS (
             SELECT 1 FROM app_research_milestones
              WHERE id=? AND project_id=? AND version=? AND status='institute_review'
           )`,
      ).bind(actor.id, id, version, milestone.id, id, milestone.version),
      db.prepare(
        `UPDATE app_research_milestones SET status='committee_review',verified_by_employee_id=?,
           verified_at=CURRENT_TIMESTAMP,reviewer_comment=?,updated_at=CURRENT_TIMESTAMP,
           version=version+1
         WHERE id=? AND version=? AND status='institute_review'
           AND EXISTS (
             SELECT 1 FROM app_research_projects
              WHERE id=? AND version=? AND status='committee_review'
           )`,
      ).bind(actor.id, comment, milestone.id, milestone.version, id, version + 1),
      projectAuditById(
        db,
        actor,
        context,
        "stage_verified",
        id,
        version + 1,
        "committee_review",
        {
          fromStatus: "institute_review",
          toStatus: "committee_review",
          stage: project.currentStage,
          comment: comment || `${project.currentStage}-bosqich ijrochi tashkilot tomonidan tekshirildi.`,
        },
      ),
    ]);
    assertProjectVersionChanged(results[0], "Loyiha holati o‘zgargan. Sahifani yangilang.");
    assertProjectVersionChanged(results[1], "Bosqich holati o‘zgargan. Sahifani yangilang.");
    assertAuditInserted(results[2]);
    return Response.json({ ok: true, verified: true });
  }

  const isFinal = project.currentStage >= 6;
  const nextStatus = isFinal ? "completed" : "active";
  const nextStage = isFinal ? 6 : project.currentStage + 1;
  const nextProgress = RESEARCH_STAGE_PROGRESS[project.currentStage] ?? 100;
  const expectedStatus = project.status;
  const statements = [
    db.prepare(
      `UPDATE app_research_projects SET status=?,current_stage=?,progress=?,updated_by_employee_id=?,
         updated_at=CURRENT_TIMESTAMP,version=version+1
       WHERE id=? AND version=? AND status=?
         AND EXISTS (
           SELECT 1 FROM app_research_milestones
            WHERE id=? AND project_id=? AND version=? AND status=?
         )
         AND (?=1 OR EXISTS (
           SELECT 1 FROM app_research_milestones
            WHERE project_id=? AND stage=? AND status='pending'
         ))`,
    ).bind(
      nextStatus, nextStage, nextProgress, actor.id, id, version, expectedStatus,
      milestone.id, id, milestone.version, expectedStatus,
      isFinal ? 1 : 0, id, nextStage,
    ),
    db.prepare(
      `UPDATE app_research_milestones SET status='approved',actual_date=date('now'),
         reviewer_comment=?,reviewed_by_employee_id=?,reviewed_at=CURRENT_TIMESTAMP,
         updated_at=CURRENT_TIMESTAMP,version=version+1
       WHERE id=? AND version=? AND status=?
         AND EXISTS (
           SELECT 1 FROM app_research_projects
            WHERE id=? AND version=? AND status=? AND current_stage=?
         )`,
    ).bind(
      comment || "Bosqich natijalari qabul qilindi.", actor.id,
      milestone.id, milestone.version, expectedStatus,
      id, version + 1, nextStatus, nextStage,
    ),
  ];
  if (!isFinal) {
    statements.push(db.prepare(
      `UPDATE app_research_milestones SET status='active',updated_at=CURRENT_TIMESTAMP,
         version=version+1 WHERE project_id=? AND stage=? AND status='pending'
         AND EXISTS (
           SELECT 1 FROM app_research_projects
            WHERE id=? AND version=? AND status='active' AND current_stage=?
         )
         AND EXISTS (
           SELECT 1 FROM app_research_milestones
            WHERE id=? AND status='approved'
         )`,
    ).bind(id, nextStage, id, version + 1, nextStage, milestone.id));
  }
  const auditIndex = statements.length;
  statements.push(projectAuditById(
    db,
    actor,
    context,
    isFinal ? "project_completed" : "stage_approved",
    id,
    version + 1,
    nextStatus,
    {
      fromStatus: expectedStatus,
      toStatus: nextStatus,
      stage: project.currentStage,
      comment: comment || `${project.currentStage}-bosqich natijalari tasdiqlandi.`,
    },
  ));
  const results = await db.batch(statements);
  assertProjectVersionChanged(results[0], "Loyiha holati o‘zgargan. Sahifani yangilang.");
  assertProjectVersionChanged(results[1], "Bosqich holati o‘zgargan. Sahifani yangilang.");
  if (!isFinal) {
    assertProjectVersionChanged(results[2], "Keyingi loyiha bosqichi topilmadi. Administratorga murojaat qiling.");
  }
  assertAuditInserted(results[auditIndex]);
  return Response.json({ ok: true, completed: isFinal });
}
