/** Intake registry: problems, solution proposals, topics and foreign practices. */
import { ApiError } from "../../lib/errors";
import { makeResearchCode, strictResearchDate } from "../../lib/research-server";
import { authorize } from "../../lib/policy";
import { researchProjectCreate, researchProposalSubmit } from "../../lib/policy/research";
import { required, requiredId, nonNegativeInteger, priorityValue, parseObject, assertAuditInserted, type ResearchActionContext } from "./common";
import { intakeAuditByCode } from "./audit";
import { resolveSourceOrganization } from "./directory";

export async function createProblem(ctx: ResearchActionContext): Promise<Response> {
  const { actor, payload, db, context } = ctx;
  await authorize(researchProjectCreate(actor, context));
  const source = await resolveSourceOrganization(db, payload);
  const deadline = strictResearchDate(payload.deadline);
  const today = new Date().toISOString().slice(0, 10);
  if (!deadline || deadline <= today) {
    throw new ApiError(400, "Ariza muddati bugundan keyingi sana bo‘lishi kerak.");
  }
  const title = required(payload.title, "Muammo nomi", 280);
  const area = required(payload.area, "Yo‘nalish", 120);
  const summary = required(payload.description, "Muammo tavsifi", 2500);
  const expectedResult = required(payload.expectedResult, "Kutilayotgan natija", 1800);
  const priority = priorityValue(payload.priority);
  const code = makeResearchCode("MU");
  const results = await db.batch([
    db.prepare(
      `INSERT INTO app_research_intake_items
        (kind,code,title,area,summary,payload_json,status,source_organization_id,
         created_by_employee_id,updated_by_employee_id)
       VALUES ('problem',?,?,?,?,?,'open',?,?,?)`,
    ).bind(
      code, title, area, summary,
      JSON.stringify({ expectedResult, deadline, priority, sourceOrganization: source.name }),
      source.id, actor.id, actor.id,
    ),
    intakeAuditByCode(
      db,
      actor,
      "problem_created",
      code,
      "problem",
      "open",
      1,
      { sourceOrganizationId: source.id },
    ),
  ]);
  if (Number(results[0].meta.changes ?? 0) !== 1) throw new ApiError(500, "Muammo yaratilmadi.");
  assertAuditInserted(results[1]);
  const id = Number(results[0].meta.last_row_id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(500, "Muammo ID si aniqlanmadi.");
  return Response.json({ ok: true, id }, { status: 201 });
}

export async function submitProposal(ctx: ResearchActionContext): Promise<Response> {
  const { actor, payload, db, context } = ctx;
  await authorize(researchProposalSubmit(actor, context));
  const problemId = requiredId(payload.problemId, "Muammo ID si");
  const problem = await db.prepare(
    `SELECT id,title,area,payload_json,status,version FROM app_research_intake_items
      WHERE id=? AND kind='problem' LIMIT 1`,
  ).bind(problemId).first<Record<string, unknown>>();
  if (!problem) throw new ApiError(404, "Muammo topilmadi.");
  if (!["open", "submitted"].includes(String(problem.status))) {
    throw new ApiError(409, "Ushbu muammo bo‘yicha ariza qabul qilinmaydi.");
  }
  const problemPayload = parseObject(problem.payload_json);
  const deadline = strictResearchDate(problemPayload.deadline);
  if (!deadline || deadline <= new Date().toISOString().slice(0, 10)) {
    throw new ApiError(409, "Ariza topshirish muddati tugagan.");
  }
  const duplicate = await db.prepare(
    `SELECT id FROM app_research_intake_items
      WHERE kind='proposal' AND parent_id=? AND source_employee_id=?
        AND status IN ('submitted','selected','converted') LIMIT 1`,
  ).bind(problemId, actor.id).first();
  if (duplicate) throw new ApiError(409, "Siz ushbu muammo bo‘yicha ariza yuborgansiz.");
  // Applicant identity comes only from the authenticated directory record.
  const applicant = actor.name;
  const organization = actor.organization;
  const title = required(payload.solutionTitle, "Yechim nomi", 280);
  const summary = required(payload.summary, "Yechim tavsifi", 2500);
  const expectedEffect = required(payload.expectedEffect, "Kutilayotgan samara", 1600);
  const code = makeResearchCode("TA");
  let results: D1Result<unknown>[];
  try {
    results = await db.batch([
      db.prepare(
        `INSERT INTO app_research_intake_items
          (kind,parent_id,code,title,area,summary,payload_json,status,source_organization_id,
           source_employee_id,created_by_employee_id,updated_by_employee_id)
         SELECT 'proposal',problem.id,?, ?,problem.area,?,?,'submitted',?,?,?,?
           FROM app_research_intake_items problem
          WHERE problem.id=? AND problem.kind='problem' AND problem.version=?
            AND problem.converted_project_id IS NULL
            AND problem.status IN ('open','submitted')`,
      ).bind(
        code, title, summary,
        JSON.stringify({ applicant, organization, expectedEffect }),
        actor.organizationId, actor.id, actor.id, actor.id,
        problemId, Number(problem.version),
      ),
      db.prepare(
        `UPDATE app_research_intake_items SET status='submitted',updated_by_employee_id=?,
           updated_at=CURRENT_TIMESTAMP,version=version+1
         WHERE id=? AND version=? AND status='open' AND converted_project_id IS NULL
           AND EXISTS (
             SELECT 1 FROM app_research_intake_items proposal
              WHERE proposal.code=? AND proposal.kind='proposal'
                AND proposal.parent_id=app_research_intake_items.id
                AND proposal.status='submitted'
           )`,
      ).bind(actor.id, problemId, Number(problem.version), code),
      intakeAuditByCode(
        db,
        actor,
        "proposal_submitted",
        code,
        "proposal",
        "submitted",
        1,
        { problemId },
      ),
    ]);
  } catch (error) {
    if (String(error).includes("app_research_proposal_active_unique")) {
      throw new ApiError(409, "Siz ushbu muammo bo‘yicha ariza yuborgansiz.");
    }
    throw error;
  }
  if (Number(results[0].meta.changes ?? 0) !== 1) {
    throw new ApiError(409, "Ushbu muammo bo‘yicha ariza qabul qilish yakunlangan.");
  }
  if (![0, 1].includes(Number(results[1].meta.changes ?? 0))) {
    throw new ApiError(500, "Muammo holatini yangilash yakunlanmadi.");
  }
  assertAuditInserted(results[2]);
  const id = Number(results[0].meta.last_row_id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(500, "Ariza ID si aniqlanmadi.");
  return Response.json({ ok: true, id }, { status: 201 });
}

export async function createTopic(ctx: ResearchActionContext): Promise<Response> {
  const { actor, payload, db, context } = ctx;
  await authorize(researchProjectCreate(actor, context));
  const source = await resolveSourceOrganization(db, payload);
  const title = required(payload.title, "Mavzu nomi", 280);
  const area = required(payload.area, "Yo‘nalish", 120);
  const rationale = required(payload.rationale, "Mavzu asosi", 2000);
  const priority = priorityValue(payload.priority);
  const code = makeResearchCode("MV");
  const results = await db.batch([
    db.prepare(
      `INSERT INTO app_research_intake_items
        (kind,code,title,area,summary,payload_json,status,source_organization_id,
         created_by_employee_id,updated_by_employee_id)
       VALUES ('topic',?,?,?,?,?,'open',?,?,?)`,
    ).bind(
      code, title, area, rationale,
      JSON.stringify({ priority, sourceOrganization: source.name }),
      source.id, actor.id, actor.id,
    ),
    intakeAuditByCode(
      db,
      actor,
      "topic_created",
      code,
      "topic",
      "open",
      1,
      { sourceOrganizationId: source.id },
    ),
  ]);
  if (Number(results[0].meta.changes ?? 0) !== 1) throw new ApiError(500, "Mavzu yaratilmadi.");
  assertAuditInserted(results[1]);
  const id = Number(results[0].meta.last_row_id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(500, "Mavzu ID si aniqlanmadi.");
  return Response.json({ ok: true, id }, { status: 201 });
}

export async function createForeign(ctx: ResearchActionContext): Promise<Response> {
  const { actor, payload, db, context } = ctx;
  await authorize(researchProjectCreate(actor, context));
  const title = required(payload.title, "Loyiha nomi", 280);
  const country = required(payload.country, "Mamlakat", 120);
  const area = required(payload.area, "Yo‘nalish", 120);
  const impact = required(payload.impact, "Asosiy samara", 1800);
  const adaptation = required(payload.adaptation, "Mahalliylashtirish taklifi", 2000);
  if (payload.readiness == null || payload.readiness === "") {
    throw new ApiError(400, "Tayyorgarlik darajasi kiritilishi shart.");
  }
  const readiness = nonNegativeInteger(payload.readiness, "Tayyorgarlik darajasi");
  if (readiness > 100) throw new ApiError(400, "Tayyorgarlik darajasi 0 dan 100 gacha bo‘lishi kerak.");
  const code = makeResearchCode("XL");
  const results = await db.batch([
    db.prepare(
      `INSERT INTO app_research_intake_items
        (kind,code,title,area,summary,payload_json,status,source_organization_id,
         source_employee_id,created_by_employee_id,updated_by_employee_id)
       VALUES ('foreign',?,?,?,?,?,'submitted',?,?,?,?)`,
    ).bind(
      code, title, area, impact,
      JSON.stringify({ country, impact, adaptation, readiness }),
      actor.organizationId, actor.id, actor.id, actor.id,
    ),
    intakeAuditByCode(
      db,
      actor,
      "foreign_created",
      code,
      "foreign",
      "submitted",
      1,
      { country },
    ),
  ]);
  if (Number(results[0].meta.changes ?? 0) !== 1) throw new ApiError(500, "Xorijiy loyiha yaratilmadi.");
  assertAuditInserted(results[1]);
  const id = Number(results[0].meta.last_row_id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(500, "Xorijiy loyiha ID si aniqlanmadi.");
  return Response.json({ ok: true, id }, { status: 201 });
}
