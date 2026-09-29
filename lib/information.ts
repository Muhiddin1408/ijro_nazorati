import { getD1 } from "../db";
import { ApiError, type Actor } from "./auth";

export type InformationFieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "percentage"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "boolean"
  | "url"
  | "country"
  | "employee"
  | "employees"
  | "organization"
  | "region"
  | "road"
  | "geo"
  | "file";

export type InformationField = {
  code: string;
  label: string;
  type: InformationFieldType;
  required?: boolean;
  unit?: string;
  options?: string[];
  placeholder?: string;
  help?: string;
  sensitive?: boolean;
  min?: number;
  max?: number;
};

export type InformationIndicator = {
  code: string;
  label: string;
  role: "outcome" | "driver" | "guardrail";
  unit?: string;
  direction?: "up" | "down" | "neutral" | "higher_is_better" | "lower_is_better" | "contextual";
};

export type InformationTemplateRow = Record<string, unknown> & {
  id: number;
  domain_id: number;
  fields_json: string;
  indicators_json: string;
  dimensions_json: string;
};

export type InformationPresentation = {
  profile?: string;
  sourceBacked?: boolean;
  sourceCells?: string;
  group?: string;
  kpiCards?: string[];
  tableColumns?: string[];
  summaryColumns?: string[];
  detailColumns?: string[];
  metricFields?: string[];
  frozenColumns?: string[];
  filters?: string[];
  drilldown?: string[];
  tabField?: string;
  periodMode?: "month" | "month-range" | "date" | "date-range" | "year" | "none";
  periodLabel?: string;
  showTotal?: boolean;
  hideCountColumn?: boolean;
  demoMode?: "sample" | "schema-only";
  integration?: { system: string; purpose?: string; status?: "planned" | "active" };
  tabs?: Array<{ id: string; label: string; value?: string; filters?: string[]; columns?: string[] }>;
  hiddenFromCatalog?: boolean;
  consolidatedInto?: string;
  chart?: { type?: string; groupBy?: string };
  aggregation?: Record<string, { formula: string; weightField?: string; label?: string }>;
  sourceCadenceOriginal?: string;
  cadenceAssumption?: boolean;
  supplementary?: boolean;
};

export const INFORMATION_INTEGRATION_ACTOR_SQL = `SELECT e.id,r.code AS role_code
  FROM app_employees e JOIN app_roles r ON r.id=e.role_id
 WHERE e.active=1 AND r.active=1
   AND COALESCE(json_extract(r.permissions_json,'$.canManageInformation'),0)=1
   AND ((r.code='admin' AND COALESCE(json_extract(r.permissions_json,'$.canManageRoles'),0)=1)
     OR (r.code='integration_service' AND COALESCE(json_extract(r.permissions_json,'$.canConfigure'),0)=1))
 ORDER BY CASE WHEN r.code='integration_service' THEN 0 ELSE 1 END,e.id LIMIT 1`;

function jsonArray<T>(value: unknown): T[] {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

function jsonObject<T extends Record<string, unknown>>(value: unknown): T {
  try {
    const parsed = JSON.parse(String(value ?? "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as T : {} as T;
  } catch {
    return {} as T;
  }
}

export function mapInformationTemplate(row: InformationTemplateRow) {
  return {
    id: Number(row.id),
    domainId: Number(row.domain_id),
    code: String(row.code),
    name: String(row.name),
    description: String(row.description ?? ""),
    recordType: String(row.record_type ?? "record"),
    cadence: String(row.cadence ?? "event"),
    statusSet: String(row.status_set ?? "ACTION"),
    drillProfile: String(row.drill_profile ?? "D_PROJECT"),
    sourceMode: String(row.source_mode ?? "manual"),
    sourceSystemCode: row.source_system_code ? String(row.source_system_code) : null,
    freshnessSlaHours: Number(row.freshness_sla_hours ?? 720),
    visibility: String(row.visibility ?? "internal"),
    fields: jsonArray<InformationField>(row.fields_json).slice(0, 80),
    indicators: jsonArray<InformationIndicator>(row.indicators_json).slice(0, 40),
    dimensions: jsonArray<string>(row.dimensions_json).slice(0, 30),
    presentation: jsonObject<InformationPresentation>(row.presentation_json),
    workflow: row.workflow_code ? {
      code: String(row.workflow_code),
      entryScope: String(row.entry_scope ?? "hierarchical"),
      ownerDepartmentId: row.workflow_owner_department_id == null ? null : Number(row.workflow_owner_department_id),
      ownerDepartment: String(row.workflow_owner_department_name ?? ""),
    } : null,
    sourceRow: row.source_row == null ? null : Number(row.source_row),
    sourceScopeText: String(row.source_scope_text ?? ""),
    providerPrimary: row.provider_primary ? String(row.provider_primary) : null,
    providerSecondary: row.provider_secondary ? String(row.provider_secondary) : null,
    version: Number(row.version ?? 1),
    active: Boolean(row.active),
  };
}

export async function informationDomainAccess(actor: Actor, database?: D1Database) {
  const db = database ?? await getD1();
  const domains = await db.prepare(
    // Current catalogue rows drive the visible catalogue, while legacy domain
    // IDs stay in the authorization set so historical records and membership
    // assignments remain reachable after a catalogue upgrade.
    "SELECT id,owner_department_id,visibility FROM app_information_domains WHERE active=1 ORDER BY sort_order,id",
  ).all<Record<string, unknown>>();
  const allIds = domains.results.map((row) => Number(row.id));
  const globalAccessProfile = await db.prepare(
    `SELECT profile.can_view_all_information
     FROM app_access_profile_assignments assignment
     JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id AND profile.active=1
     WHERE assignment.active=1 AND assignment.scope_type='global' AND profile.can_view_all_information=1
       AND ((assignment.principal_type='employee' AND assignment.principal_id=?) OR
         (assignment.principal_type='staff_position' AND EXISTS (
           SELECT 1 FROM app_position_occupancies occupancy
           JOIN app_staff_positions position ON position.id=occupancy.staff_position_id AND position.active=1
           JOIN app_employees employee ON employee.id=occupancy.employee_id AND employee.active=1
           WHERE occupancy.staff_position_id=assignment.principal_id AND occupancy.employee_id=? AND occupancy.ends_at IS NULL
             AND employee.organization_id=position.organization_id
         ))) LIMIT 1`,
  ).bind(actor.id, actor.id).first<{ can_view_all_information: number }>();
  const canAdministerAllInformation = actor.permissions.canManageInformation && actor.permissions.canManageRoles;
  const canViewAll = canAdministerAllInformation || Boolean(globalAccessProfile?.can_view_all_information);
  if (canViewAll) {
    const canViewRestricted = actor.permissions.canViewRestrictedInformation || Boolean(globalAccessProfile?.can_view_all_information);
    const visible = canViewRestricted
      ? allIds
      : domains.results.filter((row) => String(row.visibility) !== "restricted").map((row) => Number(row.id));
    const restricted = canViewRestricted ? allIds : [];
    return {
      visible,
      editable: canAdministerAllInformation ? visible : [],
      reviewable: canAdministerAllInformation ? visible : [],
      restricted,
      recordDomains: visible,
      queueRecordIds: [] as number[],
    };
  }

  const effectiveCapabilities = await db.prepare(
    `SELECT MAX(profile.can_enter_information) AS can_enter,
            MAX(profile.can_submit_information) AS can_submit,
            MAX(profile.can_verify_information) AS can_verify,
            MAX(profile.can_approve_information) AS can_approve
       FROM app_access_profile_assignments assignment
       JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id AND profile.active=1
      WHERE assignment.active=1 AND (
        (assignment.principal_type='employee' AND assignment.principal_id=?) OR
        (assignment.principal_type='staff_position' AND EXISTS (
          SELECT 1 FROM app_position_occupancies occupancy
          JOIN app_staff_positions position ON position.id=occupancy.staff_position_id AND position.active=1
          JOIN app_employees employee ON employee.id=occupancy.employee_id AND employee.active=1
          WHERE occupancy.staff_position_id=assignment.principal_id AND occupancy.employee_id=?
            AND occupancy.ends_at IS NULL AND employee.organization_id=position.organization_id
        ))
      )`,
  ).bind(actor.id, actor.id).first<{ can_enter: number; can_submit: number; can_verify: number; can_approve: number }>();
  const canEnterAssignedDomain = Boolean(effectiveCapabilities?.can_enter || effectiveCapabilities?.can_submit);
  const canReviewAssignedDomain = Boolean(effectiveCapabilities?.can_verify || effectiveCapabilities?.can_approve);
  const memberRows = await db.prepare(
    `SELECT member.domain_id,member.member_role
       FROM app_information_members member
       JOIN app_information_domains domain ON domain.id=member.domain_id AND domain.active=1
      WHERE member.employee_id=? AND member.active=1
     UNION ALL
     SELECT assignment.domain_id,assignment.member_role
       FROM app_information_domain_assignments assignment
       JOIN app_information_domains domain ON domain.id=assignment.domain_id AND domain.active=1
      WHERE assignment.active=1
        AND (domain.visibility<>'restricted' OR assignment.grant_source='manual_admin') AND (
        (assignment.principal_type='employee' AND assignment.principal_id=?) OR
        (assignment.principal_type='staff_position' AND EXISTS (
          SELECT 1 FROM app_position_occupancies occupancy
          JOIN app_staff_positions position ON position.id=occupancy.staff_position_id AND position.active=1
          JOIN app_employees employee ON employee.id=occupancy.employee_id AND employee.active=1
          WHERE occupancy.staff_position_id=assignment.principal_id AND occupancy.employee_id=?
            AND occupancy.ends_at IS NULL AND employee.organization_id=position.organization_id
        ))
      )`,
  ).bind(actor.id, actor.id, actor.id).all<{ domain_id: number; member_role: string }>();
  const memberVisible = new Set(memberRows.results.map((row) => Number(row.domain_id)));
  const memberEditable = new Set(canEnterAssignedDomain
    ? memberRows.results.filter((row) => String(row.member_role) === "editor").map((row) => Number(row.domain_id))
    : []);
  const memberReviewable = new Set(canReviewAssignedDomain
    ? memberRows.results.filter((row) => String(row.member_role) === "reviewer").map((row) => Number(row.domain_id))
    : []);

  const departmentRows = await db.prepare(
    `WITH RECURSIVE effective_department_scope(assignment_id,id,depth) AS (
       SELECT assignment.id,assignment.scope_id,0
         FROM app_access_profile_assignments assignment
         JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id AND profile.active=1
        WHERE assignment.active=1 AND assignment.scope_type='department'
          AND (profile.can_enter_information=1 OR profile.can_submit_information=1
            OR profile.can_verify_information=1 OR profile.can_approve_information=1)
          AND ((assignment.principal_type='employee' AND assignment.principal_id=?) OR
            (assignment.principal_type='staff_position' AND EXISTS (
              SELECT 1 FROM app_position_occupancies occupancy
              JOIN app_staff_positions position ON position.id=occupancy.staff_position_id AND position.active=1
              JOIN app_employees employee ON employee.id=occupancy.employee_id AND employee.active=1
              WHERE occupancy.staff_position_id=assignment.principal_id AND occupancy.employee_id=?
                AND occupancy.ends_at IS NULL AND employee.organization_id=position.organization_id
            )))
       UNION ALL
       SELECT scope.assignment_id,child.id,scope.depth+1
         FROM app_departments child
         JOIN effective_department_scope scope ON child.parent_id=scope.id
        WHERE child.active=1 AND scope.depth<20
     )
     SELECT domain.id,
       MAX(profile.can_enter_information) AS can_enter,
       MAX(profile.can_submit_information) AS can_submit,
       MAX(profile.can_verify_information) AS can_verify,
       MAX(profile.can_approve_information) AS can_approve
       FROM effective_department_scope scope
       JOIN app_access_profile_assignments assignment ON assignment.id=scope.assignment_id AND assignment.active=1
       JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id AND profile.active=1
       JOIN app_information_domains domain ON domain.owner_department_id=scope.id
         AND domain.active=1 AND domain.visibility<>'restricted'
      GROUP BY domain.id`,
  ).bind(actor.id, actor.id).all<{ id: number; can_enter: number; can_submit: number; can_verify: number; can_approve: number }>();
  const departmentVisible = departmentRows.results.map((row) => Number(row.id));
  const departmentEditable = departmentRows.results
    .filter((row) => Boolean(row.can_enter || row.can_submit)).map((row) => Number(row.id));
  const departmentReviewable = departmentRows.results
    .filter((row) => Boolean(row.can_verify || row.can_approve)).map((row) => Number(row.id));

  const queueRecords = await informationReviewQueue(db, actor);
  const workflowQueueDomains = [...new Set(queueRecords.map((row) => row.domainId))];

  // A broad organization or subtree profile controls which records may be
  // seen inside a theme; it must never grant every theme by itself. Themes
  // are granted explicitly through membership or central ownership. A pending
  // workflow step grants access to THAT record only (audit Y10): its theme is
  // listed for navigation, but other records, drafts and restricted templates
  // of the theme stay closed. An unassigned non-central account therefore has
  // a safe empty catalogue until an administrator assigns its subject area.
  const recordDomains = new Set([...memberVisible, ...departmentVisible]);
  const visible = new Set([...recordDomains, ...workflowQueueDomains]);
  const editable = new Set([...memberEditable, ...departmentEditable]);
  const restricted = new Set([...memberVisible]);
  return {
    visible: [...visible], editable: [...editable],
    reviewable: [...new Set([...memberReviewable, ...departmentReviewable])],
    restricted: [...restricted],
    recordDomains: [...recordDomains],
    queueRecordIds: queueRecords.map((row) => row.recordId),
  };
}

export type InformationAccess = Awaited<ReturnType<typeof informationDomainAccess>>;

/**
 * Records whose CURRENT pending approval step this actor may decide. Uses the
 * very same predicate as the approve/return/reject handler
 * (`canActorApproveInformationStep`), so the queue never shows a record that
 * would then be refused with 403.
 */
export async function informationReviewQueue(db: D1Database, actor: Actor) {
  if (actor.organizationId == null && actor.departmentId == null) return [];
  const candidates = await db.prepare(
    `SELECT step.*,record.id AS queue_record_id,record.created_by_employee_id AS record_creator_id,template.domain_id AS queue_domain_id
       FROM app_information_record_approval_steps step
       JOIN app_information_records record ON record.id=step.record_id AND record.status='submitted'
       JOIN app_information_templates template ON template.id=record.template_id AND template.active=1
       JOIN app_information_domains domain ON domain.id=template.domain_id AND domain.active=1
      WHERE step.status='pending' AND record.created_by_employee_id<>?
        AND (step.organization_id=? OR step.department_id=?)
        AND NOT EXISTS (
          SELECT 1 FROM app_information_record_approval_steps previous
          WHERE previous.record_id=step.record_id AND previous.workflow_round=step.workflow_round
            AND previous.sequence_no<step.sequence_no AND previous.status<>'approved'
        )
      ORDER BY step.id DESC LIMIT 500`,
  ).bind(actor.id, actor.organizationId ?? -1, actor.departmentId ?? -1).all<Record<string, unknown>>();
  if (!candidates.results.length) return [];
  const { canActorApproveInformationStep } = await import("./information-workflow");
  const queue: Array<{ recordId: number; domainId: number }> = [];
  // The creator is already excluded in SQL, so eligibility depends only on the
  // step's code, scope and theme; evaluate each distinct combination once.
  const decisions = new Map<string, boolean>();
  for (const step of candidates.results) {
    const domainId = Number(step.queue_domain_id);
    const key = `${step.step_code}|${step.organization_id ?? ""}|${step.department_id ?? ""}|${domainId}`;
    let allowed = decisions.get(key);
    if (allowed === undefined) {
      allowed = await canActorApproveInformationStep(db, actor, domainId, Number(step.record_creator_id), step);
      decisions.set(key, allowed);
    }
    if (allowed) queue.push({ recordId: Number(step.queue_record_id), domainId });
  }
  return queue;
}

/**
 * SQL predicate for records the actor may open: records of fully granted
 * themes (restricted templates only with an explicit grant), plus individual
 * records waiting for this actor's approval. `recordScope` still applies.
 */
export function informationRecordAccessSql(access: InformationAccess, recordAlias = "r", templateAlias = "t") {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(recordAlias) || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(templateAlias)) throw new Error("Invalid SQL alias");
  const parts: string[] = [];
  const binds: unknown[] = [];
  if (access.recordDomains.length) {
    const restrictedCondition = access.restricted.length
      ? `(${templateAlias}.visibility<>'restricted' OR ${templateAlias}.domain_id IN (${access.restricted.map(() => "?").join(",")}))`
      : `${templateAlias}.visibility<>'restricted'`;
    parts.push(`(${templateAlias}.domain_id IN (${access.recordDomains.map(() => "?").join(",")}) AND ${restrictedCondition})`);
    binds.push(...access.recordDomains, ...access.restricted);
  }
  if (access.queueRecordIds.length) {
    parts.push(`${recordAlias}.id IN (${access.queueRecordIds.map(() => "?").join(",")})`);
    binds.push(...access.queueRecordIds);
  }
  return { sql: parts.length ? `(${parts.join(" OR ")})` : "0=1", binds };
}

/** Same rule as informationRecordAccessSql for an already loaded record. */
export function canOpenInformationRecord(access: InformationAccess, record: { recordId: number; domainId: number; templateVisibility: string }) {
  if (access.queueRecordIds.includes(record.recordId)) return true;
  if (!access.recordDomains.includes(record.domainId)) return false;
  return record.templateVisibility !== "restricted" || access.restricted.includes(record.domainId);
}

function cleanString(value: unknown, limit: number) {
  return String(value ?? "").trim().slice(0, limit);
}

function isEmpty(value: unknown) {
  return value == null
    || (typeof value === "string" && value.trim() === "")
    || (Array.isArray(value) && value.length === 0);
}

/** Accepts a calendar date only when the text round-trips exactly. */
export function isStrictCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1000 || month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Datetime policy: ISO calendar date + 24-hour time is required. Values from
 * `datetime-local` are preserved as Uzbekistan organisation-local wall time;
 * integrations may instead append Z or an explicit UTC offset.
 */
export function isStrictInformationDateTime(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,3}))?)?(Z|[+-](?:0\d|1[0-3]):[0-5]\d|[+-]14:00)?$/.exec(value);
  return Boolean(match && isStrictCalendarDate(match[1]));
}

export function sanitizeInformationValues(fields: InformationField[], payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new ApiError(400, "Ma’lumot maydonlari noto‘g‘ri yuborildi");
  const raw = payload as Record<string, unknown>;
  const values: Record<string, unknown> = {};
  let required = 0;
  let completed = 0;
  for (const field of fields.slice(0, 80)) {
    if (!/^[a-zA-Z0-9_]{1,64}$/.test(field.code)) continue;
    const rawValue = raw[field.code];
    if (field.required) required += 1;
    let value: unknown;
    if (["number", "currency", "percentage"].includes(field.type)) {
      if (rawValue == null || (typeof rawValue === "string" && rawValue.trim() === "")) continue;
      if (typeof rawValue !== "number" && typeof rawValue !== "string") throw new ApiError(400, `“${field.label}” raqam bo‘lishi kerak`);
      const number = Number(rawValue);
      if (!Number.isFinite(number)) throw new ApiError(400, `“${field.label}” raqam bo‘lishi kerak`);
      if (field.min != null && number < field.min) throw new ApiError(400, `“${field.label}” eng kam qiymatdan kichik`);
      if (field.max != null && number > field.max) throw new ApiError(400, `“${field.label}” eng yuqori qiymatdan katta`);
      value = number;
    } else if (field.type === "boolean") {
      if (rawValue == null || (typeof rawValue === "string" && rawValue.trim() === "")) continue;
      if (![true, false, "true", "false", "1", "0", 1, 0].includes(rawValue as string | number | boolean)) throw new ApiError(400, `“${field.label}” uchun Ha yoki Yo‘qni tanlang`);
      value = rawValue === true || rawValue === "true" || rawValue === "1" || rawValue === 1;
    } else if (field.type === "employee" || field.type === "organization") {
      if (rawValue == null || (typeof rawValue === "string" && rawValue.trim() === "")) continue;
      if (typeof rawValue !== "number" && typeof rawValue !== "string") throw new ApiError(400, `“${field.label}” ro‘yxatdan tanlanishi kerak`);
      const id = Number(rawValue);
      if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(400, `“${field.label}” ro‘yxatdan tanlanishi kerak`);
      value = id;
    } else if (field.type === "employees") {
      if (isEmpty(rawValue)) continue;
      const list = Array.isArray(rawValue) ? rawValue : String(rawValue).split(",");
      if (list.length > 100 || list.some((item) => !["number", "string"].includes(typeof item) || !Number.isSafeInteger(Number(item)) || Number(item) <= 0)) throw new ApiError(400, `“${field.label}” uchun barcha xodimlarni ro‘yxatdan tanlang (ko‘pi bilan 100 ta)`);
      const ids = [...new Set(list.map(Number))];
      if (!ids.length) throw new ApiError(400, `“${field.label}” uchun kamida bitta xodimni tanlang`);
      value = ids;
    } else if (field.type === "multiselect") {
      if (isEmpty(rawValue)) continue;
      const list = Array.isArray(rawValue) ? rawValue : String(rawValue).split(",");
      if (list.some((item) => typeof item !== "string") || list.length > 30) throw new ApiError(400, `“${field.label}” ro‘yxati noto‘g‘ri`);
      const selected = [...new Set(list.map((item) => cleanString(item, 120)).filter(Boolean))];
      if (field.options?.length && selected.some((item) => !field.options!.includes(item))) throw new ApiError(400, `“${field.label}” uchun ro‘yxatdagi qiymatlarni tanlang`);
      value = selected;
    } else if (field.type === "select" && field.options?.length) {
      const selected = cleanString(rawValue, 160);
      if (!selected) continue;
      if (!field.options.includes(selected)) throw new ApiError(400, `“${field.label}” uchun ro‘yxatdagi qiymatni tanlang`);
      value = selected;
    } else if (["date", "datetime"].includes(field.type)) {
      const date = cleanString(rawValue, 40);
      if (!date) continue;
      const valid = field.type === "date" ? isStrictCalendarDate(date) : isStrictInformationDateTime(date);
      if (!valid) throw new ApiError(400, `“${field.label}” sanasi noto‘g‘ri`);
      value = date;
    } else if (field.type === "geo") {
      const coordinates = cleanString(rawValue, 100);
      if (!coordinates) continue;
      const parts = coordinates.split(",").map((part) => part.trim());
      if (parts.length !== 2 || parts.some((part) => !part || !Number.isFinite(Number(part))) || Math.abs(Number(parts[0])) > 90 || Math.abs(Number(parts[1])) > 180) throw new ApiError(400, `“${field.label}” uchun kenglik (−90…90) va uzunlikni (−180…180) kiriting`);
      value = `${Number(parts[0])}, ${Number(parts[1])}`;
    } else if (field.type === "url") {
      const url = cleanString(rawValue, 1000);
      if (!url) continue;
      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("protocol");
      } catch {
        throw new ApiError(400, `“${field.label}” uchun to‘g‘ri havola kiriting`);
      }
      value = url;
    } else {
      value = cleanString(rawValue, field.type === "textarea" ? 8000 : 700);
    }
    // Required-field completion is calculated only after type-aware
    // normalisation. Whitespace and filtered-empty arrays can never count as
    // completed data.
    if (isEmpty(value)) continue;
    values[field.code] = value;
    if (field.required) completed += 1;
  }
  const json = JSON.stringify(values);
  if (new TextEncoder().encode(json).byteLength > 160_000) throw new ApiError(413, "Bitta yozuv ma’lumoti 160 KB dan oshmasligi kerak");
  return { values, completeness: required ? Math.round(completed / required * 100) : Object.keys(values).length ? 100 : 0 };
}

export function informationValueStatements(
  db: D1Database,
  recordId: number,
  fields: InformationField[],
  values: Record<string, unknown>,
) {
  const statements: D1PreparedStatement[] = [db.prepare("DELETE FROM app_information_values WHERE record_id=?").bind(recordId)];
  for (const field of fields) {
    const value = values[field.code];
    if (isEmpty(value)) continue;
    const valueType = field.type;
    const valueText = ["number", "currency", "percentage", "boolean", "date", "datetime"].includes(field.type)
      ? null
      : Array.isArray(value) ? JSON.stringify(value) : String(value);
    const valueNumber = ["number", "currency", "percentage"].includes(field.type) ? Number(value) : null;
    const valueDate = ["date", "datetime"].includes(field.type) ? String(value) : null;
    const valueBoolean = field.type === "boolean" ? (value ? 1 : 0) : null;
    statements.push(db.prepare(
      `INSERT INTO app_information_values
        (record_id,field_code,value_type,value_text,value_number,value_date,value_boolean,unit)
       VALUES (?,?,?,?,?,?,?,?)`,
    ).bind(recordId, field.code, valueType, valueText, valueNumber, valueDate, valueBoolean, field.unit ?? null));
  }
  return statements;
}

export function parseInformationFields(value: unknown) {
  return jsonArray<InformationField>(value).slice(0, 80);
}

export function informationActionMutatesValues(action: unknown) {
  return action === "save" || action === "submit";
}

/**
 * Row-level information scope shared by record and attachment endpoints.
 * Theme access is necessary but never sufficient: an actor must also own the
 * record or be allowed to see its organisation branch.
 */
export function informationRecordScope(actor: Actor, recordAlias = "r") {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(recordAlias)) throw new Error("Invalid SQL alias");
  if (actor.permissions.viewScope === "all") return { sql: "1=1", binds: [] as unknown[] };
  if (actor.organizationId == null || ["own", "none"].includes(actor.permissions.viewScope)) {
    return { sql: `${recordAlias}.created_by_employee_id=?`, binds: [actor.id] as unknown[] };
  }
  if (actor.permissions.viewScope === "department") {
    return actor.departmentId == null
      ? { sql: `${recordAlias}.created_by_employee_id=?`, binds: [actor.id] as unknown[] }
      : {
          sql: `(${recordAlias}.created_by_employee_id=? OR (${recordAlias}.organization_id=? AND ${recordAlias}.department_id=?))`,
          binds: [actor.id, actor.organizationId, actor.departmentId] as unknown[],
        };
  }
  if (actor.permissions.viewScope !== "subtree") {
    return { sql: `${recordAlias}.created_by_employee_id=?`, binds: [actor.id] as unknown[] };
  }
  return {
    sql: `(${recordAlias}.created_by_employee_id=? OR ${recordAlias}.organization_id IN (
      WITH RECURSIVE organization_scope(id) AS (
        SELECT id FROM app_organizations WHERE id=? AND active=1
        UNION ALL
        SELECT child.id FROM app_organizations child JOIN organization_scope parent ON child.parent_id=parent.id WHERE child.active=1
      ) SELECT id FROM organization_scope
    ))`,
    binds: [actor.id, actor.organizationId] as unknown[],
  };
}

/**
 * Sensitive (🔒) fields are readable only with canViewRestrictedInformation
 * (audit Y9). Everyone else gets the record without those values and files.
 */
export function canViewSensitiveInformation(actor: Actor) {
  return actor.permissions.canViewRestrictedInformation;
}

export function sensitiveFieldCodes(fieldsJson: unknown) {
  return new Set(parseInformationFields(fieldsJson).filter((field) => field.sensitive).map((field) => field.code));
}

export function redactSensitiveValues(values: Record<string, unknown>, codes: Set<string>) {
  if (!codes.size) return { values, redactedFields: [] as string[] };
  const visible: Record<string, unknown> = {};
  const redactedFields: string[] = [];
  for (const [code, value] of Object.entries(values)) {
    if (codes.has(code)) redactedFields.push(code);
    else visible[code] = value;
  }
  return { values: visible, redactedFields };
}

/** Keeps stored sensitive values when an actor who cannot see them saves the record. */
export function preserveSensitiveValues(submitted: unknown, stored: Record<string, unknown>, codes: Set<string>) {
  const next = submitted && typeof submitted === "object" && !Array.isArray(submitted) ? { ...submitted as Record<string, unknown> } : {};
  for (const code of codes) {
    if (code in stored) next[code] = stored[code];
    else delete next[code];
  }
  return next;
}
