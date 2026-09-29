/**
 * Information Center record workflow: create, save/submit, approval decisions
 * and archiving. Authorization comes from lib/policy/information; handlers
 * return Responses because validation failures carry structured payloads.
 */
import { getD1 } from "../db";
import { employeeIdsInScopes, organizationScopeIds, type Actor } from "../lib/auth";
import { ApiError } from "../lib/errors";
import { informationVersionMatches, inferInformationPeriod } from "../lib/information-input";
import {
  canViewSensitiveInformation,
  informationActionMutatesValues,
  informationDomainAccess,
  informationRecordScope,
  informationValueStatements,
  isStrictCalendarDate,
  parseInformationFields,
  preserveSensitiveValues,
  sanitizeInformationValues,
  sensitiveFieldCodes,
  type InformationTemplateRow,
} from "../lib/information";
import {
  approvalStepStatements,
  assertInformationEntryAllowed,
  assertInformationProfileCapability,
  buildInformationApprovalSteps,
  currentInformationApprovalStep,
  informationBusinessKeyStatements,
  informationRecordAllowedActions,
  informationValidationStatements,
  informationWorkflowConfig,
  nextInformationWorkflowRound,
  validateInformationCandidate,
  validationErrorResponse,
} from "../lib/information-workflow";
import { authorize } from "../lib/policy";
import {
  informationRecordAction,
  informationRecordArchive,
  informationRecordCreate,
  informationRecordOpen,
  informationStepDecide,
} from "../lib/policy/information";
import { random48BitId } from "../lib/shared/ids";

type Row = Record<string, unknown>;
type JsonRecord = Record<string, unknown>;

const DUPLICATE_BUSINESS_KEY = "Shu tashkilot va davr uchun bunday yozuv allaqachon yuborilgan";

function duplicateBusinessKey(error: unknown) {
  return /UNIQUE constraint failed: app_information_business_keys/i.test(String(error));
}

export function parseObject(value: unknown) {
  try {
    const parsed = JSON.parse(String(value ?? "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

export function parseArray(value: unknown) {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function dateOrNull(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (!isStrictCalendarDate(text)) throw new Error("INVALID_DATE");
  return text;
}

export function applyValuePeriod(
  periodStart: string | null,
  periodEnd: string | null,
  values: Record<string, unknown>,
) {
  const value = String(values.davr ?? values.period ?? "").trim();
  if (isStrictCalendarDate(value)) {
    return { periodStart: periodStart ?? value, periodEnd: periodEnd ?? value };
  }
  try { return inferInformationPeriod(periodStart, periodEnd, values); }
  catch { throw new ApiError(400, "Hisobot davri noto‘g‘ri: haqiqiy oy yoki yilni kiriting"); }
}

export const informationRecordId = random48BitId;

export async function validateInformationReferences(actor: Actor, fields: ReturnType<typeof parseInformationFields>, values: Record<string, unknown>) {
  const employeeIds = fields.flatMap((field) => {
    const value = values[field.code];
    if (field.type === "employee") return value == null ? [] : [Number(value)];
    if (field.type === "employees") return Array.isArray(value) ? value.map(Number) : [];
    return [];
  });
  if (employeeIds.length && !(await employeeIdsInScopes(actor, employeeIds, [actor.permissions.viewScope, actor.permissions.assignScope]))) {
    throw new ApiError(400, "Tanlangan xodimlardan biri vakolat doirangizga kirmaydi");
  }
  const organizationIds = fields.filter((field) => field.type === "organization").map((field) => Number(values[field.code])).filter((id) => Number.isSafeInteger(id) && id > 0);
  if (organizationIds.length) {
    const allowed = new Set(await organizationScopeIds(actor, actor.permissions.canManageOrganization || actor.permissions.canManageRoles));
    if (organizationIds.some((id) => !allowed.has(id))) throw new ApiError(400, "Tanlangan tashkilot vakolat doirangizga kirmaydi");
  }
}

async function createRecord(actor: Actor, payload: JsonRecord): Promise<Response> {
  const db = await getD1();
  const templateId = Number(payload.templateId);
  const title = String(payload.title ?? "").trim().slice(0, 240);
  if (!templateId || title.length < 3) return Response.json({ error: "Shakl va kamida 3 belgili sarlavha majburiy" }, { status: 400 });
  const template = await db.prepare(
    `SELECT t.*,d.owner_department_id,d.visibility AS domain_visibility,department.organization_id AS owner_organization_id
     FROM app_information_templates t JOIN app_information_domains d ON d.id=t.domain_id AND d.active=1 AND d.catalog_state='current'
     LEFT JOIN app_departments department ON department.id=d.owner_department_id
     WHERE t.id=? AND t.active=1 AND t.catalog_state='current'`,
  ).bind(templateId).first<InformationTemplateRow & { owner_department_id: number | null; owner_organization_id: number | null }>();
  if (!template) return Response.json({ error: "Ma’lumot shakli topilmadi" }, { status: 404 });
  const access = await informationDomainAccess(actor);
  await authorize(informationRecordCreate(access, { domainId: Number(template.domain_id), visibility: String(template.visibility) }));
  const workflow = await informationWorkflowConfig(db, templateId);
  assertInformationEntryAllowed(actor, workflow);
  await assertInformationProfileCapability(db, actor, payload.submit ? "submit" : "enter");
  const fields = parseInformationFields(template.fields_json);
  const sanitized = sanitizeInformationValues(fields, payload.values);
  await validateInformationReferences(actor, fields, sanitized.values);
  const status = payload.submit ? "submitted" : "draft";
  const requiredFileCodes = fields.filter((field) => field.type === "file" && field.required).map((field) => field.code);
  if (status === "submitted" && requiredFileCodes.length) {
    return Response.json({ error: "Avval qoralamani saqlang, majburiy faylni yuklang, keyin yuboring" }, { status: 400 });
  }
  if (status === "submitted" && sanitized.completeness < 100) {
    return Response.json({ error: "Yuborishdan oldin barcha majburiy maydonlarni to‘ldiring" }, { status: 400 });
  }
  const priority = ["low", "normal", "high", "critical"].includes(String(payload.priority)) ? String(payload.priority) : "normal";
  let periodStart: string | null;
  let periodEnd: string | null;
  try { periodStart = dateOrNull(payload.periodStart); periodEnd = dateOrNull(payload.periodEnd); } catch { return Response.json({ error: "Hisobot davri sanasi noto‘g‘ri" }, { status: 400 }); }
  ({ periodStart, periodEnd } = applyValuePeriod(periodStart, periodEnd, sanitized.values));
  if (periodStart && periodEnd && periodStart > periodEnd) return Response.json({ error: "Davr boshlanishi yakunidan keyin bo‘la olmaydi" }, { status: 400 });
  const isDemo = actor.permissions.canManageInformation && Boolean(payload.isDemo);
  const validationIssues = await validateInformationCandidate(db, fields, workflow, {
    organizationId: actor.organizationId,
    periodStart,
    periodEnd,
    values: sanitized.values,
    isDemo,
    validationStage: status === "submitted" ? "submit" : "draft",
  });
  if (status === "submitted" && validationIssues.some((issue) => issue.severity === "error")) return validationErrorResponse(validationIssues);
  const recordId = informationRecordId();
  const approvalSteps = status === "submitted" ? await buildInformationApprovalSteps(db, actor, workflow) : [];
  const createStatements = [db.prepare(
    `INSERT INTO app_information_records
      (id,template_id,organization_id,department_id,title,period_start,period_end,status,priority,source_mode,values_json,completeness_score,is_demo,created_by_employee_id,updated_by_employee_id,submitted_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).bind(recordId, templateId, actor.organizationId, actor.departmentId, title, periodStart, periodEnd, status, priority, "manual", JSON.stringify(sanitized.values), sanitized.completeness, isDemo ? 1 : 0, actor.id, actor.id, status === "submitted" ? new Date().toISOString() : null)];
  const snapshot = JSON.stringify({ title, periodStart, periodEnd, status, priority, values: sanitized.values, completenessScore: sanitized.completeness, isDemo });
  await db.batch([
    ...createStatements,
    db.prepare("INSERT INTO app_information_record_history (record_id,version,action,status,snapshot_json,actor_employee_id) VALUES (?,1,?,?,?,?)")
      .bind(recordId, status === "submitted" ? "submitted" : "created", status, snapshot, actor.id),
    ...informationValueStatements(db, recordId, fields, sanitized.values),
    ...approvalStepStatements(db, recordId, 1, approvalSteps),
    ...informationValidationStatements(db, recordId, validationIssues),
    ...informationBusinessKeyStatements(db, recordId, workflow, { organizationId: actor.organizationId, periodStart, periodEnd, values: sanitized.values, isDemo }, status),
    db.prepare("INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,'information.record_created','information_record',?,?)").bind(actor.id, recordId, JSON.stringify({ templateId, status, isDemo })),
  ]);
  return Response.json({
    id: recordId, version: 1, status, completenessScore: sanitized.completeness,
    workflow: { round: status === "submitted" ? 1 : 0, steps: approvalSteps.length, currentStep: approvalSteps[0] ?? null },
    validation: { errors: validationIssues.filter((issue) => issue.severity === "error"), warnings: validationIssues.filter((issue) => issue.severity === "warning") },
  }, { status: 201 });
}

async function mutateRecord(actor: Actor, payload: JsonRecord): Promise<Response> {
  const db = await getD1();
  const id = Number(payload.id);
  const requestedAction = String(payload.action ?? "save");
  const action = requestedAction === "publish" ? "approve" : requestedAction;
  if (!id) return Response.json({ error: "Ma’lumot yozuvi ID majburiy" }, { status: 400 });
  const recordScope = informationRecordScope(actor);
  const current = await db.prepare(
    `SELECT r.*,t.domain_id,t.fields_json,t.name AS template_name,t.visibility AS template_visibility,
      (SELECT COALESCE(MAX(version),0) FROM app_information_record_history history WHERE history.record_id=r.id) AS record_version
     FROM app_information_records r JOIN app_information_templates t ON t.id=r.template_id AND t.active=1
     JOIN app_information_domains d ON d.id=t.domain_id AND d.active=1 WHERE r.id=? AND ${recordScope.sql}`,
  ).bind(id, ...recordScope.binds).first<Row>();
  if (!current) return Response.json({ error: "Ma’lumot yozuvi topilmadi" }, { status: 404 });
  if (!informationVersionMatches(payload.expectedVersion, Number(current.record_version ?? 0))) {
    return Response.json({ error: "Yozuv boshqa oynada o‘zgargan. Kiritgan ma’lumotingiz saqlab turildi; yangi holatni qayta ochib solishtiring.", code: "INFORMATION_VERSION_CONFLICT" }, { status: 409 });
  }
  const domainId = Number(current.domain_id);
  const access = await informationDomainAccess(actor);
  await authorize(informationRecordOpen(access, { recordId: id, domainId, templateVisibility: String(current.template_visibility) }));
  const workflow = await informationWorkflowConfig(db, Number(current.template_id));
  const allowedActions = await informationRecordAllowedActions(db, actor, current, access.editable, workflow);
  await authorize(informationRecordAction(allowedActions, action));
  const oldStatus = String(current.status);
  let nextStatus = oldStatus;
  let currentStep: Row | null = null;
  let nextWorkflowStep: Row | null = null;
  let workflowRound = 0;
  let newApprovalSteps: Awaited<ReturnType<typeof buildInformationApprovalSteps>> = [];

  if (["save", "submit"].includes(action)) {
    assertInformationEntryAllowed(actor, workflow);
    await assertInformationProfileCapability(db, actor, action === "submit" ? "submit" : "enter");
    if (action === "submit") {
      nextStatus = "submitted";
      workflowRound = await nextInformationWorkflowRound(db, id);
      newApprovalSteps = await buildInformationApprovalSteps(db, actor, workflow, {
        organizationId: current.organization_id == null ? null : Number(current.organization_id),
        departmentId: current.department_id == null ? null : Number(current.department_id),
        creatorId: Number(current.created_by_employee_id),
      });
    }
  } else if (["approve", "return", "reject"].includes(action)) {
    if (oldStatus !== "submitted") return Response.json({ error: "Faqat ko‘rib chiqishdagi yozuv bo‘yicha qaror qabul qilinadi" }, { status: 409 });
    currentStep = await currentInformationApprovalStep(db, id);
    if (!currentStep) return Response.json({ error: "Faol tasdiqlash bosqichi topilmadi" }, { status: 409 });
    await authorize(informationStepDecide(db, actor, { domainId, creatorEmployeeId: Number(current.created_by_employee_id) }, currentStep));
    workflowRound = Number(currentStep.workflow_round);
    if (action === "approve") {
      nextWorkflowStep = await db.prepare(
        `SELECT * FROM app_information_record_approval_steps
         WHERE record_id=? AND workflow_round=? AND sequence_no>? AND status='pending'
         ORDER BY sequence_no LIMIT 1`,
      ).bind(id, workflowRound, Number(currentStep.sequence_no)).first<Row>();
      nextStatus = nextWorkflowStep ? "submitted" : "published";
    } else {
      nextStatus = action === "return" ? "returned" : "rejected";
    }
  } else if (action === "archive") {
    if (oldStatus !== "published") return Response.json({ error: "Faqat tasdiqlangan yozuv arxivlanadi" }, { status: 409 });
    await authorize(informationRecordArchive(actor, workflow));
    nextStatus = "archived";
  } else return Response.json({ error: "Noma’lum amal" }, { status: 400 });

  const fields = parseInformationFields(current.fields_json);
  const storedValues = parseObject(current.values_json);
  const submittedValues = payload.values ?? storedValues;
  const sanitized = ["save", "submit"].includes(action)
    ? sanitizeInformationValues(fields, canViewSensitiveInformation(actor)
      ? submittedValues
      : preserveSensitiveValues(submittedValues, storedValues, sensitiveFieldCodes(current.fields_json)))
    : { values: parseObject(current.values_json), completeness: Number(current.completeness_score ?? 0) };
  // Reviewers decide on the immutable submitted snapshot. Re-validating its
  // employee/organization references against a territorial or central
  // reviewer's own scope would incorrectly reject valid district data.
  if (informationActionMutatesValues(action)) await validateInformationReferences(actor, fields, sanitized.values);
  if ((action === "submit" || action === "approve") && sanitized.completeness < 100) {
    return Response.json({ error: "Tasdiqlash jarayonidan oldin barcha majburiy maydonlar to‘ldirilishi kerak" }, { status: 400 });
  }
  if (action === "submit" || action === "approve") {
    const requiredFileCodes = fields.filter((field) => field.type === "file" && (field.required || sanitized.values[field.code])).map((field) => field.code);
    if (requiredFileCodes.length) {
      const uploaded = await db.prepare(
        `SELECT field_code,file_name FROM app_information_files WHERE record_id=? AND field_code IN (${requiredFileCodes.map(() => "?").join(",")})`,
      ).bind(id, ...requiredFileCodes).all<{ field_code: string; file_name: string }>();
      const uploadedCodes = new Set(uploaded.results.filter((row) => String(sanitized.values[row.field_code] ?? "") === row.file_name).map((row) => String(row.field_code)));
      if (requiredFileCodes.some((code) => !uploadedCodes.has(code))) {
        return Response.json({ error: "Barcha majburiy fayllarni yuklang" }, { status: 400 });
      }
    }
  }
  const title = ["save", "submit"].includes(action) ? String(payload.title ?? current.title).trim().slice(0, 240) : String(current.title);
  if (title.length < 3) return Response.json({ error: "Sarlavha kamida 3 belgidan iborat bo‘lishi kerak" }, { status: 400 });
  let periodStart = current.period_start ? String(current.period_start) : null;
  let periodEnd = current.period_end ? String(current.period_end) : null;
  try {
    if (["save", "submit"].includes(action)) {
      if (Object.hasOwn(payload, "periodStart")) periodStart = dateOrNull(payload.periodStart);
      if (Object.hasOwn(payload, "periodEnd")) periodEnd = dateOrNull(payload.periodEnd);
    }
  } catch { return Response.json({ error: "Hisobot davri sanasi noto‘g‘ri" }, { status: 400 }); }
  ({ periodStart, periodEnd } = applyValuePeriod(periodStart, periodEnd, sanitized.values));
  if (periodStart && periodEnd && periodStart > periodEnd) return Response.json({ error: "Davr boshlanishi yakunidan keyin bo‘la olmaydi" }, { status: 400 });
  const comment = String(payload.comment ?? current.comment ?? "").trim().slice(0, 3000);
  if (["return", "reject"].includes(action) && comment.length < 3) return Response.json({ error: action === "return" ? "Qaytarish sababini yozing" : "Rad etish sababini yozing" }, { status: 400 });
  const validationIssues = await validateInformationCandidate(db, fields, workflow, {
    recordId: id,
    organizationId: current.organization_id == null ? null : Number(current.organization_id),
    periodStart,
    periodEnd,
    values: sanitized.values,
    isDemo: Boolean(current.is_demo),
    validationStage: action === "approve" ? (nextStatus === "published" ? "final_approval" : "approval") : action === "submit" ? "submit" : "draft",
  });
  if (["submit", "approve"].includes(action) && validationIssues.some((issue) => issue.severity === "error")) return validationErrorResponse(validationIssues);
  const version = Number(current.record_version ?? 0) + 1;
  const now = new Date().toISOString();
  const workflowStatements: D1PreparedStatement[] = [];
  if (action === "submit") workflowStatements.push(...approvalStepStatements(db, id, workflowRound, newApprovalSteps));
  if (currentStep && action === "approve") {
    workflowStatements.push(db.prepare(
      "UPDATE app_information_record_approval_steps SET status='approved',acted_by_employee_id=?,decision_comment=?,decided_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'",
    ).bind(actor.id, comment, now, Number(currentStep.id)));
  } else if (currentStep && ["return", "reject"].includes(action)) {
    workflowStatements.push(
      db.prepare("UPDATE app_information_record_approval_steps SET status=?,acted_by_employee_id=?,decision_comment=?,decided_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'")
        .bind(action === "return" ? "returned" : "rejected", actor.id, comment, now, Number(currentStep.id)),
      db.prepare("UPDATE app_information_record_approval_steps SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE record_id=? AND workflow_round=? AND sequence_no>? AND status='pending'")
        .bind(id, workflowRound, Number(currentStep.sequence_no)),
    );
  }

  let results: D1Result<unknown>[];
  try {
    results = await db.batch([
    db.prepare(
    `UPDATE app_information_records SET title=?,period_start=?,period_end=?,status=?,values_json=?,completeness_score=?,comment=?,updated_by_employee_id=?,
     submitted_at=CASE WHEN ?='submit' THEN ? ELSE submitted_at END,
     reviewed_by_employee_id=CASE WHEN ? IN ('approve','return','reject','archive') THEN ? ELSE reviewed_by_employee_id END,
     reviewed_at=CASE WHEN ? IN ('approve','return','reject','archive') THEN ? ELSE reviewed_at END,
     published_at=CASE WHEN ?='published' THEN ? ELSE published_at END,updated_at=CURRENT_TIMESTAMP
     WHERE id=? AND status=? AND values_json=? AND COALESCE(reviewed_at,'')=COALESCE(?,'')`,
  ).bind(title, periodStart, periodEnd, nextStatus, JSON.stringify(sanitized.values), sanitized.completeness, comment, actor.id,
    action, now, action, actor.id, action, now, nextStatus, now, id, oldStatus, String(current.values_json), current.reviewed_at ?? null),
    db.prepare("INSERT INTO app_information_record_history (record_id,version,action,status,snapshot_json,actor_employee_id) VALUES (?,?,?,?,?,?)")
      .bind(id, version, action, nextStatus, JSON.stringify({ title, periodStart, periodEnd, status: nextStatus, values: sanitized.values, completenessScore: sanitized.completeness, comment }), actor.id),
    ...informationValueStatements(db, id, fields, sanitized.values),
    ...workflowStatements,
    ...informationValidationStatements(db, id, validationIssues),
    ...informationBusinessKeyStatements(db, id, workflow, { recordId: id, organizationId: current.organization_id == null ? null : Number(current.organization_id), periodStart, periodEnd, values: sanitized.values, isDemo: Boolean(current.is_demo) }, nextStatus),
    db.prepare("INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,?,'information_record',?,?)").bind(actor.id, `information.record_${action}`, id, JSON.stringify({ from: oldStatus, to: nextStatus, version })),
    ]);
  } catch (error) {
    if (/UNIQUE constraint failed: app_information_record_history/i.test(String(error))) {
      return Response.json({ error: "Yozuv parallel ravishda o‘zgargan, sahifani yangilang" }, { status: 409 });
    }
    throw error;
  }
  if (Number(results[0]?.meta?.changes ?? 0) !== 1) return Response.json({ error: "Yozuv parallel ravishda o‘zgargan, sahifani yangilang" }, { status: 409 });
  const submittedStep = newApprovalSteps[0];
  const pendingStep = nextStatus === "submitted" ? action === "submit" && submittedStep ? { workflow_round: workflowRound, sequence_no: submittedStep.sequenceNo, step_code: submittedStep.stepCode, step_name: submittedStep.stepName } : nextWorkflowStep : null;
  return Response.json({
    ok: true, version, status: nextStatus, completenessScore: sanitized.completeness,
    workflow: pendingStep ? { round: Number(pendingStep.workflow_round), sequence: Number(pendingStep.sequence_no), stepCode: String(pendingStep.step_code), stepName: String(pendingStep.step_name) } : null,
    validation: { errors: validationIssues.filter((issue) => issue.severity === "error"), warnings: validationIssues.filter((issue) => issue.severity === "warning") },
  });
}

export async function createInformationRecord(actor: Actor, payload: JsonRecord): Promise<Response> {
  try {
    return await createRecord(actor, payload);
  } catch (error) {
    if (duplicateBusinessKey(error)) throw new ApiError(409, DUPLICATE_BUSINESS_KEY);
    throw error;
  }
}

export async function mutateInformationRecord(actor: Actor, payload: JsonRecord): Promise<Response> {
  try {
    return await mutateRecord(actor, payload);
  } catch (error) {
    if (duplicateBusinessKey(error)) throw new ApiError(409, DUPLICATE_BUSINESS_KEY);
    throw error;
  }
}
