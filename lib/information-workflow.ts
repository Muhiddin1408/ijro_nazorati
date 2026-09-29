import { ApiError, type Actor } from "./auth";
import { isStrictCalendarDate, type InformationField } from "./information";
import { isEditableRecordStatus } from "./shared/statuses";

type Row = Record<string, unknown>;

export type InformationWorkflowConfig = {
  templateId: number;
  templateCode: string;
  domainId: number;
  ownerDepartmentId: number | null;
  ownerOrganizationId: number | null;
  entryScope: "hierarchical" | "central_only";
  workflowCode: string;
  validationRules: ValidationRule[];
};

export type ApprovalStepDraft = {
  sequenceNo: number;
  stepCode: "organization_approval" | "territorial_approval" | "central_owner_approval";
  stepName: string;
  organizationId: number | null;
  departmentId: number | null;
};

export type ValidationIssue = {
  ruleCode: string;
  severity: "error" | "warning";
  fieldCodes: string[];
  message: string;
  actual: Record<string, unknown>;
  expected: Record<string, unknown>;
};

type ValidationRule = {
  code?: string;
  type?: string;
  severity?: "error" | "warning";
  missingSeverity?: "error" | "warning";
  numerator?: string;
  denominator?: string;
  result?: string;
  sourceField?: string;
  targetTemplateCode?: string;
  targetDistinctField?: string;
  tolerancePercent?: number;
  tolerance?: number;
  totalField?: string;
  componentFields?: string[];
  keyFields?: string[];
};

type ValidationCandidate = {
  recordId?: number;
  organizationId: number | null;
  periodStart: string | null;
  periodEnd: string | null;
  values: Record<string, unknown>;
  isDemo?: boolean;
  validationStage?: "draft" | "submit" | "approval" | "final_approval";
};

function parseRules(value: unknown): ValidationRule[] {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed.slice(0, 30) as ValidationRule[] : [];
  } catch {
    return [];
  }
}

export async function informationWorkflowConfig(db: D1Database, templateId: number): Promise<InformationWorkflowConfig> {
  const row = await db.prepare(
    `SELECT t.id,t.code,t.domain_id,
      COALESCE(w.owner_department_id,d.owner_department_id) AS workflow_owner_department_id,
      owner_department.organization_id AS workflow_owner_organization_id,
      COALESCE(w.entry_scope,'hierarchical') AS entry_scope,
      COALESCE(w.workflow_code,'organization_territorial_central') AS workflow_code,
      COALESCE(w.validation_rules_json,'[]') AS validation_rules_json
     FROM app_information_templates t
     JOIN app_information_domains d ON d.id=t.domain_id AND d.active=1
     LEFT JOIN app_information_template_workflows w ON w.template_id=t.id AND w.active=1
     LEFT JOIN app_departments owner_department ON owner_department.id=COALESCE(w.owner_department_id,d.owner_department_id)
     WHERE t.id=? AND t.active=1 LIMIT 1`,
  ).bind(templateId).first<Row>();
  if (!row) throw new ApiError(404, "Ma’lumot shakli topilmadi");
  return {
    templateId: Number(row.id),
    templateCode: String(row.code),
    domainId: Number(row.domain_id),
    ownerDepartmentId: row.workflow_owner_department_id == null ? null : Number(row.workflow_owner_department_id),
    ownerOrganizationId: row.workflow_owner_organization_id == null ? null : Number(row.workflow_owner_organization_id),
    entryScope: String(row.entry_scope) === "central_only" ? "central_only" : "hierarchical",
    workflowCode: String(row.workflow_code),
    validationRules: parseRules(row.validation_rules_json),
  };
}

export function assertInformationEntryAllowed(actor: Actor, workflow: InformationWorkflowConfig) {
  if (workflow.entryScope !== "central_only" || actor.roleCode === "admin") return;
  const isCentral = ["central", "committee"].includes(String(actor.organizationType));
  if (!isCentral || workflow.ownerDepartmentId == null || actor.departmentId !== workflow.ownerDepartmentId) {
    throw new ApiError(403, "Ushbu ko‘rsatkichni faqat Qo‘mita markaziy apparatining mas’ul bo‘linmasi kiritadi");
  }
}

export async function assertInformationProfileCapability(
  db: D1Database,
  actor: Actor,
  capability: "enter" | "submit",
) {
  if (actor.roleCode === "admin") return;
  const column = capability === "submit" ? "profile.can_submit_information" : "profile.can_enter_information";
  const allowed = await db.prepare(
    `SELECT 1 AS allowed
     FROM app_access_profile_assignments assignment
     JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id AND profile.active=1
     WHERE assignment.active=1 AND ${column}=1
       AND ((assignment.principal_type='employee' AND assignment.principal_id=?) OR
         (assignment.principal_type='staff_position' AND EXISTS (
           SELECT 1 FROM app_position_occupancies occupancy
           WHERE occupancy.staff_position_id=assignment.principal_id AND occupancy.employee_id=? AND occupancy.ends_at IS NULL
         ))) LIMIT 1`,
  ).bind(actor.id, actor.id).first<{ allowed: number }>();
  if (!allowed) {
    throw new ApiError(403, capability === "submit"
      ? "Sizning kirish profilingizda ma’lumotni tasdiqlashga yuborish vakolati yo‘q"
      : "Sizning kirish profilingizda ma’lumot kiritish vakolati yo‘q");
  }
}

export async function informationEntryCapabilities(db: D1Database, actor: Actor) {
  const capabilities = { enter: false, submit: false };
  for (const capability of ["enter", "submit"] as const) {
    try { await assertInformationProfileCapability(db, actor, capability); capabilities[capability] = true; }
    catch (error) { if (!(error instanceof ApiError && error.status === 403)) throw error; }
  }
  return capabilities;
}

export async function informationRecordAllowedActions(
  db: D1Database,
  actor: Actor,
  record: Row,
  editableDomainIds: number[],
  workflow: InformationWorkflowConfig,
) {
  const actions: string[] = [];
  const domainId = Number(record.domain_id);
  const sameOrganization = actor.organizationId != null && actor.organizationId === Number(record.organization_id);
  const mayEdit = actor.roleCode === "admin" || (editableDomainIds.includes(domainId) && (Number(record.created_by_employee_id) === actor.id || sameOrganization));
  if (mayEdit && isEditableRecordStatus(record.status)) {
    for (const action of ["save", "submit"] as const) {
      try {
        assertInformationEntryAllowed(actor, workflow);
        await assertInformationProfileCapability(db, actor, action === "save" ? "enter" : "submit");
        actions.push(action);
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 403)) throw error;
      }
    }
  }
  if (record.status === "submitted") {
    const step = await currentInformationApprovalStep(db, Number(record.id ?? record.record_id));
    if (step && await canActorApproveInformationStep(db, actor, domainId, Number(record.created_by_employee_id), step)) actions.push("approve", "return", "reject");
  }
  if (record.status === "published" && (actor.roleCode === "admin" || (workflow.ownerDepartmentId != null && actor.departmentId === workflow.ownerDepartmentId && actor.roleLevel <= 30))) actions.push("archive");
  return actions;
}

async function organizationRoute(db: D1Database, organizationId: number) {
  const rows = await db.prepare(
    `WITH RECURSIVE ancestors(id,name,type,parent_id,depth) AS (
       SELECT id,name,type,parent_id,0 FROM app_organizations WHERE id=? AND active=1
       UNION ALL
       SELECT parent.id,parent.name,parent.type,parent.parent_id,child.depth+1
       FROM app_organizations parent JOIN ancestors child ON child.parent_id=parent.id
       WHERE parent.active=1 AND child.depth<12
     )
     SELECT id,name,type,parent_id,depth FROM ancestors ORDER BY depth`,
  ).bind(organizationId).all<Row>();
  return rows.results.map((row) => ({
    id: Number(row.id), name: String(row.name), type: String(row.type),
    parentId: row.parent_id == null ? null : Number(row.parent_id), depth: Number(row.depth),
  }));
}

async function hasApprovedDirectRouteException(db: D1Database, organizationId: number) {
  return Boolean(await db.prepare(
    `SELECT 1 AS allowed FROM app_information_route_exceptions
     WHERE organization_id=? AND route_mode='direct_central' AND active=1
       AND approved_by_employee_id IS NOT NULL AND TRIM(reason)<>''
       AND (expires_at IS NULL OR expires_at>CURRENT_TIMESTAMP)
     LIMIT 1`,
  ).bind(organizationId).first<{ allowed: number }>());
}

async function assertApprovalStepsHaveReviewers(
  db: D1Database,
  workflow: InformationWorkflowConfig,
  creatorEmployeeId: number,
  steps: ApprovalStepDraft[],
) {
  for (const step of steps) {
    const row = await eligibleReviewerCount(db, workflow.domainId, step, creatorEmployeeId);
    if (Number(row?.reviewer_count ?? 0) > 0) continue;
    const organization = step.organizationId == null ? null : await db.prepare("SELECT name FROM app_organizations WHERE id=? LIMIT 1")
      .bind(step.organizationId).first<{ name: string }>();
    const department = step.departmentId == null ? null : await db.prepare("SELECT name FROM app_departments WHERE id=? LIMIT 1")
      .bind(step.departmentId).first<{ name: string }>();
    const scopeName = department?.name ?? organization?.name ?? step.stepName;
    throw new ApiError(409, `“${scopeName}” uchun ma’lumot tasdiqlovchi xodim tayinlanmagan. Administrator avval reviewer rolini biriktirishi kerak.`);
  }
}

async function eligibleReviewerCount(
  db: D1Database,
  domainId: number,
  step: Pick<ApprovalStepDraft, "stepCode" | "organizationId" | "departmentId"> | Row,
  excludedEmployeeId: number,
  onlyEmployeeId?: number,
) {
  const stepCode = String("stepCode" in step ? step.stepCode : step.step_code);
  const organizationId = ("organizationId" in step ? step.organizationId : step.organization_id) == null
    ? null : Number("organizationId" in step ? step.organizationId : step.organization_id);
  const departmentId = ("departmentId" in step ? step.departmentId : step.department_id) == null
    ? null : Number("departmentId" in step ? step.departmentId : step.department_id);
  const capabilityColumn = stepCode === "territorial_approval"
    ? "(profile.can_verify_information=1 OR profile.can_approve_information=1)"
    : "profile.can_approve_information=1";
  const scopeClause = stepCode === "central_owner_approval"
    ? `(assignment.scope_type='department' AND assignment.scope_id IN (
        WITH RECURSIVE owner_department_scope(id,parent_id) AS (
          SELECT id,parent_id FROM app_departments WHERE id=? AND active=1
          UNION ALL
          SELECT parent.id,parent.parent_id FROM app_departments parent
          JOIN owner_department_scope child ON child.parent_id=parent.id
          WHERE parent.active=1
        ) SELECT id FROM owner_department_scope
      ))`
    : stepCode === "territorial_approval"
      ? `((assignment.scope_type='organization' AND assignment.scope_id=?) OR assignment.scope_type='department')
          AND (EXISTS (
            SELECT 1 FROM app_information_members member
            WHERE member.domain_id=? AND member.employee_id=employee.id AND member.member_role='reviewer' AND member.active=1
          ) OR EXISTS (
            SELECT 1 FROM app_information_domain_assignments member
            WHERE member.domain_id=? AND member.member_role='reviewer' AND member.active=1
              AND (member.grant_source='manual_admin' OR NOT EXISTS (
                SELECT 1 FROM app_information_domains restricted_domain
                WHERE restricted_domain.id=member.domain_id AND restricted_domain.visibility='restricted'
              ))
              AND ((member.principal_type='employee' AND member.principal_id=employee.id) OR
                (member.principal_type='staff_position' AND EXISTS (
                  SELECT 1 FROM app_position_occupancies member_occupancy
                  JOIN app_staff_positions member_position
                    ON member_position.id=member_occupancy.staff_position_id AND member_position.active=1
                  WHERE member_occupancy.staff_position_id=member.principal_id
                    AND member_occupancy.employee_id=employee.id AND member_occupancy.ends_at IS NULL
                    AND member_position.organization_id=employee.organization_id
                )))
          ))`
      : "(assignment.scope_type='global' OR (assignment.scope_type='organization' AND assignment.scope_id=?))";
  const scopeBinds = stepCode === "central_owner_approval" ? [departmentId ?? -1]
    : stepCode === "territorial_approval" ? [organizationId ?? -1, domainId, domainId]
      : [organizationId ?? -1];
  return db.prepare(
    `SELECT COUNT(DISTINCT employee.id) AS reviewer_count
     FROM app_employees employee
     WHERE employee.active=1 AND employee.id<>?
       AND (? IS NULL OR employee.id=?)
       AND (? IS NULL OR employee.organization_id=?)
       AND EXISTS (
         SELECT 1 FROM app_access_profile_assignments assignment
         JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id AND profile.active=1
         WHERE assignment.active=1
           AND ((assignment.principal_type='employee' AND assignment.principal_id=employee.id) OR
             (assignment.principal_type='staff_position' AND EXISTS (
               SELECT 1 FROM app_position_occupancies occupancy
               WHERE occupancy.staff_position_id=assignment.principal_id AND occupancy.employee_id=employee.id AND occupancy.ends_at IS NULL
             )))
           AND ${capabilityColumn}
           AND ${scopeClause}
       )`,
  ).bind(excludedEmployeeId, onlyEmployeeId ?? null, onlyEmployeeId ?? null, organizationId, organizationId, ...scopeBinds)
    .first<{ reviewer_count: number }>();
}

export async function buildInformationApprovalSteps(
  db: D1Database,
  actor: Actor,
  workflow: InformationWorkflowConfig,
  source: { organizationId: number | null; departmentId: number | null; creatorId: number } = {
    organizationId: actor.organizationId, departmentId: actor.departmentId, creatorId: actor.id,
  },
): Promise<ApprovalStepDraft[]> {
  if (source.organizationId == null) throw new ApiError(400, "Yozuvga tashkilot biriktirilmagan");
  assertInformationEntryAllowed(actor, workflow);
  const route = await organizationRoute(db, source.organizationId);
  if (!route.length) throw new ApiError(400, "Xodim tashkiloti faol tuzilmada topilmadi");
  const origin = route[0];
  const territorial = route.find((organization) => organization.type === "territorial") ?? null;
  if (origin.type === "district" && !territorial && !(await hasApprovedDirectRouteException(db, origin.id))) {
    throw new ApiError(
      409,
      "Tuman tashkiloti hududiy bosh boshqarmaga biriktirilmagan. Administrator tashkilot ierarxiyasini tasdiqlashi yoki asoslangan bevosita yuborish istisnosini rasmiylashtirishi kerak.",
    );
  }
  const steps: ApprovalStepDraft[] = [];
  const add = (step: Omit<ApprovalStepDraft, "sequenceNo">) => steps.push({ ...step, sequenceNo: steps.length + 1 });

  if (workflow.entryScope === "central_only" || ["central", "committee"].includes(origin.type)) {
    add({
      stepCode: "central_owner_approval",
      stepName: "Qo‘mita mas’ul boshqarmasi tasdig‘i",
      organizationId: workflow.ownerOrganizationId,
      departmentId: workflow.ownerDepartmentId,
    });
    await assertApprovalStepsHaveReviewers(db, workflow, source.creatorId, steps);
    return steps;
  }

  if (territorial) {
    if (origin.type !== "territorial") {
      add({
        stepCode: "organization_approval",
        stepName: "Tuman yoki quyi tashkilot tasdig‘i",
        organizationId: origin.id,
        departmentId: null,
      });
    }
    add({
      stepCode: "territorial_approval",
      stepName: "Hududiy bosh boshqarma tasdig‘i",
      organizationId: territorial.id,
      departmentId: origin.type === "territorial" ? source.departmentId : null,
    });
  } else {
    add({
      stepCode: "organization_approval",
      stepName: "Tizim tashkiloti tasdig‘i",
      organizationId: origin.id,
      departmentId: source.departmentId,
    });
  }
  add({
    stepCode: "central_owner_approval",
    stepName: "Qo‘mita mas’ul boshqarmasi tasdig‘i",
    organizationId: workflow.ownerOrganizationId,
    departmentId: workflow.ownerDepartmentId,
  });
  await assertApprovalStepsHaveReviewers(db, workflow, source.creatorId, steps);
  return steps;
}

export function approvalStepStatements(
  db: D1Database,
  recordId: number,
  workflowRound: number,
  steps: ApprovalStepDraft[],
) {
  return steps.map((step) => db.prepare(
    `INSERT INTO app_information_record_approval_steps
      (record_id,workflow_round,sequence_no,step_code,step_name,organization_id,department_id,status)
     VALUES (?,?,?,?,?,?,?,'pending')`,
  ).bind(recordId, workflowRound, step.sequenceNo, step.stepCode, step.stepName, step.organizationId, step.departmentId));
}

export async function nextInformationWorkflowRound(db: D1Database, recordId: number) {
  const row = await db.prepare(
    "SELECT COALESCE(MAX(workflow_round),0)+1 AS next_round FROM app_information_record_approval_steps WHERE record_id=?",
  ).bind(recordId).first<{ next_round: number }>();
  return Math.max(1, Number(row?.next_round ?? 1));
}

export async function currentInformationApprovalStep(db: D1Database, recordId: number) {
  return db.prepare(
    `SELECT step.* FROM app_information_record_approval_steps step
     WHERE step.record_id=?
       AND step.workflow_round=(SELECT MAX(workflow_round) FROM app_information_record_approval_steps WHERE record_id=?)
       AND step.status='pending'
       AND NOT EXISTS (
         SELECT 1 FROM app_information_record_approval_steps previous
         WHERE previous.record_id=step.record_id AND previous.workflow_round=step.workflow_round
           AND previous.sequence_no<step.sequence_no AND previous.status<>'approved'
       )
     ORDER BY step.sequence_no LIMIT 1`,
  ).bind(recordId, recordId).first<Row>();
}

export async function canActorApproveInformationStep(
  db: D1Database,
  actor: Actor,
  domainId: number,
  creatorEmployeeId: number,
  step: Row,
) {
  // Separation of duties comes first: nobody, administrators included, approves
  // a record they created (audit Y8).
  if (actor.id === creatorEmployeeId) return false;
  if (actor.roleCode === "admin") return true;
  const row = await eligibleReviewerCount(db, domainId, step, creatorEmployeeId, actor.id);
  return Number(row?.reviewer_count ?? 0) === 1;
}

function issue(
  ruleCode: string,
  severity: "error" | "warning",
  fieldCodes: string[],
  message: string,
  actual: Record<string, unknown> = {},
  expected: Record<string, unknown> = {},
): ValidationIssue {
  return { ruleCode, severity, fieldCodes, message, actual, expected };
}

function finiteNumber(value: unknown) {
  if (value == null || (typeof value === "string" && !value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function missingValue(value: unknown) {
  return value == null || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && !value.length);
}

function requiresCompleteValidation(candidate: ValidationCandidate) {
  return ["submit", "approval", "final_approval"].includes(String(candidate.validationStage));
}

function configuredPeriod(values: Record<string, unknown>) {
  const value = String(values.davr ?? values.period ?? "").trim();
  if (/^(19|20)\d{2}$/.test(value) || /^(19|20)\d{2}-(?:0[1-9]|1[0-2])$/.test(value)) return value;
  return /^(19|20)\d{2}-\d{2}-\d{2}$/.test(value) && isStrictCalendarDate(value) ? value : null;
}

function configuredPeriodBounds(values: Record<string, unknown>) {
  const period = configuredPeriod(values);
  if (!period) return { start: null, end: null };
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return { start: period, end: period };
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return { start: `${period}-01`, end: `${period}-${String(lastDay).padStart(2, "0")}` };
  }
  return { start: `${period}-01-01`, end: `${period}-12-31` };
}

function resolvedPeriod(candidate: ValidationCandidate) {
  if (candidate.periodStart && candidate.periodEnd) return { start: candidate.periodStart, end: candidate.periodEnd };
  return configuredPeriodBounds(candidate.values);
}

async function validateUniqueBusinessKey(
  db: D1Database,
  workflow: InformationWorkflowConfig,
  candidate: ValidationCandidate,
  rule: ValidationRule,
) {
  if (candidate.organizationId == null) return null;
  const keyFields = Array.isArray(rule.keyFields) ? rule.keyFields.map(String).filter(Boolean).slice(0, 8) : [];
  // Drafts and returned corrections do not reserve a key. Only submitted or
  // published records compete, matching the transactional reservation table.
  const conditions = ["record.template_id=?", "record.organization_id=?", "record.status IN ('submitted','published')"];
  conditions.push("record.is_demo=?");
  const binds: unknown[] = [workflow.templateId, candidate.organizationId, candidate.isDemo ? 1 : 0];
  if (candidate.recordId) { conditions.push("record.id<>?"); binds.push(candidate.recordId); }
  const period = resolvedPeriod(candidate);
  const periodStart = period.start;
  const periodEnd = period.end;
  conditions.push("COALESCE(record.period_start,'')=COALESCE(?,'')", "COALESCE(record.period_end,'')=COALESCE(?,'')");
  binds.push(periodStart, periodEnd);
  for (const fieldCode of keyFields) {
    const value = candidate.values[fieldCode];
    if (value == null || value === "") return null;
    conditions.push(`EXISTS (SELECT 1 FROM app_information_values key_value
      WHERE key_value.record_id=record.id AND key_value.field_code=?
        AND COALESCE(key_value.value_text,CAST(key_value.value_number AS TEXT),key_value.value_date,'')=?)`);
    binds.push(fieldCode, String(value));
  }
  const duplicate = await db.prepare(`SELECT record.id FROM app_information_records record WHERE ${conditions.join(" AND ")} LIMIT 1`)
    .bind(...binds).first<{ id: number }>();
  if (!duplicate) return null;
  return issue(
    String(rule.code ?? "duplicate_business_key"), rule.severity ?? "error", keyFields,
    "Shu tashkilot, davr va biznes kaliti bo‘yicha boshqa faol yozuv mavjud.",
    { duplicateRecordId: Number(duplicate.id), key: Object.fromEntries(keyFields.map((code) => [code, candidate.values[code]])) },
    { uniqueWithin: ["template", "organization", "period", ...keyFields] },
  );
}

async function validateCrossTemplateDistinctCount(
  db: D1Database,
  candidate: ValidationCandidate,
  rule: ValidationRule,
): Promise<ValidationIssue | null> {
  const sourceField = String(rule.sourceField ?? "");
  const targetTemplateCode = String(rule.targetTemplateCode ?? "");
  const targetDistinctField = String(rule.targetDistinctField ?? "");
  const sourceValue = finiteNumber(candidate.values[sourceField]);
  if (!sourceField || !targetTemplateCode || !targetDistinctField || sourceValue == null || candidate.organizationId == null) return null;
  const period = resolvedPeriod(candidate);
  if (!period.start || !period.end) return null;
  const row = await db.prepare(
    `SELECT COUNT(DISTINCT r.id) AS registry_record_count,
      COUNT(DISTINCT NULLIF(TRIM(value.value_text),'')) AS matched_count
     FROM app_information_records r
     JOIN app_information_templates t ON t.id=r.template_id
     LEFT JOIN app_information_values value ON value.record_id=r.id AND value.field_code=?
     WHERE t.code=? AND r.organization_id=? AND r.is_demo=? AND r.status='published'
       AND COALESCE(r.period_start,'')=COALESCE(?,'')
       AND COALESCE(r.period_end,'')=COALESCE(?,'')`,
  ).bind(targetDistinctField, targetTemplateCode, candidate.organizationId, candidate.isDemo ? 1 : 0,
    period.start, period.end).first<{ registry_record_count: number; matched_count: number }>();
  const registryRecordCount = Number(row?.registry_record_count ?? 0);
  const matchedCount = Number(row?.matched_count ?? 0);
  if (registryRecordCount === 0) {
    return issue(
      String(rule.code ?? "cross_template_count_missing"), candidate.validationStage === "final_approval" ? "error" : rule.missingSeverity ?? "warning", [sourceField],
      candidate.validationStage === "final_approval"
        ? "Yakuniy tasdiqlashdan oldin shu tashkilot va davr bo‘yicha xodimlar reestri tasdiqlangan bo‘lishi kerak."
        : "Shu tashkilot va davr bo‘yicha tasdiqlangan xodimlar reestri hali shakllanmagan; xodimlar sonini avtomatik solishtirib bo‘lmadi.",
      { [sourceField]: sourceValue }, { targetTemplateCode, targetDistinctField },
    );
  }
  if (matchedCount === 0) {
    return issue(
      String(rule.code ?? "cross_template_count_missing_identifiers"), "error", [sourceField, targetDistinctField],
      "Tasdiqlangan xodimlar reestrida xodim ID ma’lumoti yo‘q; sonni ishonchli solishtirib bo‘lmaydi.",
      { [sourceField]: sourceValue, registryRecordCount }, { targetDistinctField, nonEmptyIdentifiers: true },
    );
  }
  if (Math.abs(sourceValue - matchedCount) > 0.0001) {
    return issue(
      String(rule.code ?? "cross_template_count_mismatch"), rule.severity ?? "error", [sourceField],
      "Ish haqi hisoblangan xodimlar soni xodimlar reestridagi shu davr xodimlar soniga teng emas.",
      { [sourceField]: sourceValue }, { employeeRegistryCount: matchedCount },
    );
  }
  return null;
}

export async function validateInformationCandidate(
  db: D1Database,
  fields: InformationField[],
  workflow: InformationWorkflowConfig,
  candidate: ValidationCandidate,
): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const start = candidate.values.boshlanish_sanasi;
  const end = candidate.values.tugash_sanasi;
  if (typeof start === "string" && typeof end === "string" && start > end) issues.push(issue("date_order", "error", ["boshlanish_sanasi", "tugash_sanasi"], "Boshlanish sanasi tugash sanasidan keyin bo‘la olmaydi.", { start, end }, {}));
  for (const field of fields) {
    if (field.required && missingValue(candidate.values[field.code]) && requiresCompleteValidation(candidate)) {
      issues.push(issue("required_field", "error", [field.code], `“${field.label}” maydonini to‘ldiring.`, {}, { required: true }));
    }
    if (candidate.values[field.code] == null) continue;
    if (field.type === "percentage") {
      const value = finiteNumber(candidate.values[field.code]);
      if (value == null || value < 0 || value > 100) {
        issues.push(issue("percentage_range", "error", [field.code], `“${field.label}” 0 dan 100 gacha bo‘lishi kerak.`, { value }, { min: 0, max: 100 }));
      }
    }
    const numericValue = ["number", "currency", "percentage"].includes(field.type) ? finiteNumber(candidate.values[field.code]) : null;
    const countLike = field.type === "number" && (/(?:^|_)(?:soni|dona|nafar|count)$/i.test(field.code) || /\b(?:soni|dona|nafar)\b/i.test(String(field.unit ?? "")));
    const nonnegativeLike = field.type === "percentage" || field.type === "currency" || countLike
      || /(miqdor|uzunlik|masofa|maydon|reja|amalda|qiymat|mablag|qarzdorlik|fond|quvvat)/i.test(field.code);
    if (numericValue != null && countLike && (!Number.isInteger(numericValue) || numericValue < 0)) {
      issues.push(issue("count_nonnegative_integer", "error", [field.code], `“${field.label}” manfiy bo‘lmagan butun son bo‘lishi kerak.`, { value: numericValue }, { integer: true, min: 0 }));
    } else if (numericValue != null && numericValue < 0 && nonnegativeLike && !/(farq|tafovut|saldo|foyda|zarar|ozgarish|o_zgarish)/i.test(field.code)) {
      issues.push(issue("nonnegative_value", "error", [field.code], `“${field.label}” manfiy bo‘lishi mumkin emas.`, { value: numericValue }, { min: 0 }));
    }
  }

  const periodValue = configuredPeriod(candidate.values);
  const expectedPeriod = configuredPeriodBounds(candidate.values);
  if (periodValue && requiresCompleteValidation(candidate)
    && (candidate.periodStart !== expectedPeriod.start || candidate.periodEnd !== expectedPeriod.end)) {
    issues.push(issue(
      "period_grain_mismatch", "error", ["davr"], "Jadvaldagi davr hisobot davri bilan aniq mos emas.",
      { periodValue, periodStart: candidate.periodStart, periodEnd: candidate.periodEnd },
      { periodStart: expectedPeriod.start, periodEnd: expectedPeriod.end },
    ));
  }

  for (const rule of workflow.validationRules) {
    const code = String(rule.code ?? rule.type ?? "validation_rule");
    if (rule.type === "period_required") {
      const period = resolvedPeriod(candidate);
      if (requiresCompleteValidation(candidate) && (!period.start || !period.end)) {
        issues.push(issue(code, rule.severity ?? "error", ["davr"], "Ushbu hisobot uchun davr majburiy.", {}, { periodRequired: true }));
      }
    } else if (rule.type === "ratio_equals") {
      const numeratorCode = String(rule.numerator ?? "");
      const denominatorCode = String(rule.denominator ?? "");
      const resultCode = String(rule.result ?? "");
      const operandCodes = [numeratorCode, denominatorCode, resultCode].filter(Boolean);
      const missingCodes = operandCodes.filter((fieldCode) => missingValue(candidate.values[fieldCode]));
      if (requiresCompleteValidation(candidate) && missingCodes.length) {
        issues.push(issue(
          `${code}_required_operands`, "error", missingCodes,
          "Ish haqi fondi, xodimlar soni va o‘rtacha ish haqi tasdiqlashdan oldin to‘liq kiritilishi kerak.",
          { missingFields: missingCodes }, { requiredFields: operandCodes },
        ));
        continue;
      }
      const numerator = finiteNumber(candidate.values[numeratorCode]);
      const denominator = finiteNumber(candidate.values[denominatorCode]);
      const actualResult = finiteNumber(candidate.values[resultCode]);
      if (numerator == null || denominator == null || actualResult == null) continue;
      if (!Number.isInteger(denominator) || denominator < 0) {
        issues.push(issue(`${code}_employee_count`, "error", [denominatorCode], "Ish haqi hisoblangan xodimlar soni manfiy bo‘lmagan butun son bo‘lishi kerak.", { employeeCount: denominator }, { integer: true, min: 0 }));
      } else if (denominator === 0 && (numerator !== 0 || actualResult !== 0)) {
        issues.push(issue(code, rule.severity ?? "error", [numeratorCode, denominatorCode, resultCode], "Xodimlar soni 0 bo‘lganda ish haqi fondi ham, o‘rtacha ish haqi ham 0 bo‘lishi kerak.", { numerator, denominator, actualResult }, { numerator: 0, actualResult: 0 }));
      } else if (denominator !== 0) {
        const expected = numerator / denominator;
        const tolerance = Math.max(Math.abs(expected) * (Number(rule.tolerancePercent ?? 2) / 100), 0.01);
        if (Math.abs(actualResult - expected) > tolerance) {
          issues.push(issue(code, rule.severity ?? "error", [numeratorCode, denominatorCode, resultCode], "O‘rtacha ish haqi ish haqi fondini xodimlar soniga bo‘lish natijasiga mos emas.", { numerator, denominator, actualResult }, { calculatedAverage: expected, tolerance }));
        }
      }
    } else if (rule.type === "cross_template_distinct_count") {
      const crossIssue = await validateCrossTemplateDistinctCount(db, candidate, rule);
      if (crossIssue) issues.push(crossIssue);
    } else if (rule.type === "unique_business_key") {
      const duplicateIssue = await validateUniqueBusinessKey(db, workflow, candidate, rule);
      if (duplicateIssue) issues.push(duplicateIssue);
    } else if (rule.type === "components_sum") {
      const totalField = String(rule.totalField ?? "");
      const componentFields = Array.isArray(rule.componentFields) ? rule.componentFields.map(String).filter(Boolean).slice(0, 30) : [];
      const missing = [totalField, ...componentFields].filter((fieldCode) => missingValue(candidate.values[fieldCode]));
      if (requiresCompleteValidation(candidate) && missing.length) {
        issues.push(issue(`${code}_required_operands`, "error", missing, "Jami va barcha tarkibiy qismlarni to‘ldiring; mavjud bo‘lmasa 0 kiriting.", { missingFields: missing }, { requiredFields: [totalField, ...componentFields] }));
        continue;
      }
      const total = finiteNumber(candidate.values[totalField]);
      const components = componentFields.map((code) => finiteNumber(candidate.values[code]));
      if (total != null && components.every((value) => value != null)) {
        const componentTotal = components.reduce<number>((sum, value) => sum + Number(value), 0);
        if (Math.abs(total - componentTotal) > Number(rule.tolerance ?? 0.01)) {
          issues.push(issue(code, rule.severity ?? "error", [totalField, ...componentFields], "Жами кўрсаткич унинг таркибий қисмлари йиғиндисига тенг эмас.", { total, componentTotal }, { totalEqualsComponents: true }));
        }
      }
    }
  }
  return issues.slice(0, 50);
}

export function informationBusinessKeyStatements(db: D1Database, recordId: number, workflow: InformationWorkflowConfig, candidate: ValidationCandidate, status: string) {
  const statements = [db.prepare("DELETE FROM app_information_business_keys WHERE record_id=?").bind(recordId)];
  if (!["submitted", "published"].includes(status) || candidate.organizationId == null) return statements;
  for (const rule of workflow.validationRules.filter((item) => item.type === "unique_business_key")) {
    const fields = rule.keyFields ?? [];
    if (fields.some((field) => missingValue(candidate.values[field]))) continue;
    const period = resolvedPeriod(candidate);
    const key = JSON.stringify([workflow.templateId, candidate.organizationId, Boolean(candidate.isDemo), period.start, period.end, fields.map((field) => [field, String(candidate.values[field])])]);
    statements.push(db.prepare("INSERT INTO app_information_business_keys (business_key,record_id) VALUES (?,?)").bind(key, recordId));
  }
  return statements;
}

export function informationValidationStatements(db: D1Database, recordId: number, issues: ValidationIssue[]) {
  return [
    db.prepare("UPDATE app_information_validation_issues SET resolved_at=CURRENT_TIMESTAMP WHERE record_id=? AND resolved_at IS NULL").bind(recordId),
    ...issues.map((item) => db.prepare(
      `INSERT INTO app_information_validation_issues
        (record_id,rule_code,severity,field_codes_json,message,actual_json,expected_json)
       VALUES (?,?,?,?,?,?,?)`,
    ).bind(recordId, item.ruleCode, item.severity, JSON.stringify(item.fieldCodes), item.message, JSON.stringify(item.actual), JSON.stringify(item.expected))),
  ];
}

export function validationErrorResponse(issues: ValidationIssue[]) {
  const errors = issues.filter((item) => item.severity === "error");
  return Response.json({
    error: errors[0]?.message ?? "Ma’lumotlar mantiqiy nazoratdan o‘tmadi",
    code: "INFORMATION_VALIDATION_FAILED",
    validation: { errors, warnings: issues.filter((item) => item.severity === "warning") },
  }, { status: 422 });
}
