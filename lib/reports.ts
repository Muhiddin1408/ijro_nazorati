import { getD1 } from "../db";
import { type Actor } from "./auth";
import { runInBackground } from "./background";
import { nextReportDeadline, reportCycleParts } from "./report-periods";
import { enqueueReportNotification, processNotificationJobs } from "./telegram";
import { reportCapabilities, type ReportAssignmentFacts } from "./policy/reports";
import { reportNumericStats, type NumericStats } from "./report-sheet";

export type ReportColumn = {
  id: string;
  label: string;
  type: "number" | "text" | "date" | "boolean";
  unit: string;
  required: boolean;
  aggregation: "sum" | "average" | "last" | "none";
};

type Row = Record<string, unknown>;

const nullableId = (value: unknown) => (value == null ? null : Number(value));

/** Maps an assignment row (joined with its template) to the facts report policies decide on. */
export function reportAssignmentFacts(row: Row): ReportAssignmentFacts {
  return {
    status: String(row.status),
    responsibleEmployeeId: Number(row.responsible_employee_id),
    submittedByEmployeeId: nullableId(row.submitted_by_employee_id),
    templateCreatorEmployeeId: Number(row.created_by_employee_id),
    ownerDepartmentId: nullableId(row.owner_department_id),
    parentResponsibleEmployeeId: nullableId(row.parent_responsible_employee_id),
    allowDelegation: Boolean(row.allow_delegation),
  };
}

export function reportAssignmentCapabilities(actor: Actor, row: Row) {
  return reportCapabilities(actor, reportAssignmentFacts(row));
}

export const reportFrequencies = new Set(["one_time", "weekly", "monthly", "quarterly", "yearly"]);

export function cleanReportColumns(input: unknown): ReportColumn[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 32).map((raw, index) => {
    const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const type = ["number", "text", "date", "boolean"].includes(String(item.type))
      ? (String(item.type) as ReportColumn["type"])
      : "number";
    const aggregation =
      type === "number" && ["sum", "average", "last", "none"].includes(String(item.aggregation))
        ? (String(item.aggregation) as ReportColumn["aggregation"])
        : "none";
    return {
      id: `f${index + 1}`,
      label: String(item.label ?? "")
        .trim()
        .slice(0, 160),
      type,
      unit: String(item.unit ?? "")
        .trim()
        .slice(0, 40),
      required: item.required !== false,
      aggregation,
    };
  });
}

export async function createReportCycle(templateId: number, deadline: Date, assignedByEmployeeId: number) {
  const db = await getD1();
  const template = await db
    .prepare("SELECT frequency FROM app_report_templates WHERE id=? AND active=1")
    .bind(templateId)
    .first<{ frequency: string }>();
  if (!template) return null;
  const period = reportCycleParts(deadline, template.frequency);
  const inserted = await db
    .prepare(
      `INSERT OR IGNORE INTO app_report_cycles
      (template_id,period_key,period_label,period_start,period_end,deadline_at)
     VALUES (?,?,?,?,?,?)`,
    )
    .bind(
      templateId,
      period.periodKey,
      period.periodLabel,
      period.periodStart,
      period.periodEnd,
      deadline.toISOString(),
    )
    .run();
  const cycle = await db
    .prepare("SELECT id FROM app_report_cycles WHERE template_id=? AND period_key=?")
    .bind(templateId, period.periodKey)
    .first<{ id: number }>();
  if (!cycle) return null;
  await db
    .prepare(
      `INSERT INTO app_report_assignments
      (cycle_id,organization_id,responsible_employee_id,assigned_by_employee_id)
     SELECT ?,organization_id,responsible_employee_id,?
       FROM app_report_template_recipients
      WHERE template_id=?
     ON CONFLICT(cycle_id,organization_id) DO NOTHING`,
    )
    .bind(cycle.id, assignedByEmployeeId, templateId)
    .run();
  return {
    id: Number(cycle.id),
    created: Boolean(inserted.meta.changes),
    ...period,
    deadlineAt: deadline.toISOString(),
  };
}

/** Assignment statuses that count as "delivered" for deadline purposes. */
const DELIVERED_SQL = "('submitted','approved')";

/**
 * Cycle lifecycle, recomputed from assignment state:
 * - closed  — the cycle has assignments and every one of them is approved;
 * - overdue — the deadline passed and at least one assignment is not delivered
 *             (not submitted/approved);
 * - open    — otherwise (before the deadline, or everything delivered and awaiting review).
 * Without `cycleId`, every cycle that is not closed yet is refreshed.
 */
export function reportCycleStatusStatement(db: D1Database, cycleId?: number, now = new Date()) {
  const nowIso = now.toISOString();
  const closedCondition = `EXISTS (SELECT 1 FROM app_report_assignments a WHERE a.cycle_id=app_report_cycles.id)
    AND NOT EXISTS (SELECT 1 FROM app_report_assignments a WHERE a.cycle_id=app_report_cycles.id AND a.status!='approved')`;
  return db
    .prepare(
      `UPDATE app_report_cycles SET
       status=CASE
         WHEN ${closedCondition} THEN 'closed'
         WHEN deadline_at < ? AND EXISTS (SELECT 1 FROM app_report_assignments a
           WHERE a.cycle_id=app_report_cycles.id AND a.status NOT IN ${DELIVERED_SQL}) THEN 'overdue'
         ELSE 'open' END,
       closed_at=CASE WHEN ${closedCondition} THEN COALESCE(closed_at, ?) ELSE NULL END
     WHERE ${cycleId == null ? "status!='closed'" : "id=?"}`,
    )
    .bind(nowIso, nowIso, ...(cycleId == null ? [] : [cycleId]));
}

/** An assignment is overdue when its cycle deadline passed and it was not delivered. */
export function isReportAssignmentOverdue(status: string, deadlineAt: string, now = new Date()) {
  return !["submitted", "approved"].includes(status) && new Date(deadlineAt).getTime() < now.getTime();
}

export async function ensureReportCycles() {
  const db = await getD1();
  const templates = await db
    .prepare(
      `SELECT t.id,t.title,t.frequency,t.first_deadline_at,t.created_by_employee_id,
            (SELECT deadline_at FROM app_report_cycles c WHERE c.template_id=t.id ORDER BY c.deadline_at DESC LIMIT 1) AS latest_deadline
       FROM app_report_templates t WHERE t.active=1`,
    )
    .all<Row>();
  for (const template of templates.results) {
    let current = new Date(String(template.latest_deadline ?? template.first_deadline_at));
    if (!template.latest_deadline) {
      const first = await createReportCycle(Number(template.id), current, Number(template.created_by_employee_id));
      if (first?.created) await notifyCycleAssignments(first.id, String(template.title), first.deadlineAt);
    }
    if (String(template.frequency) === "one_time") continue;
    let guard = 0;
    while (current.getTime() <= Date.now() && guard < 24) {
      const next = nextReportDeadline(
        new Date(String(template.first_deadline_at)),
        current,
        String(template.frequency),
      );
      if (!next) break;
      const created = await createReportCycle(Number(template.id), next, Number(template.created_by_employee_id));
      if (created?.created) await notifyCycleAssignments(created.id, String(template.title), created.deadlineAt);
      current = next;
      guard += 1;
    }
  }
  await reportCycleStatusStatement(db).run();
}

async function notifyCycleAssignments(cycleId: number, title: string, deadlineAt: string) {
  const assignments = await (await getD1())
    .prepare("SELECT id,responsible_employee_id FROM app_report_assignments WHERE cycle_id=?")
    .bind(cycleId)
    .all<{ id: number; responsible_employee_id: number }>();
  for (const assignment of assignments.results) {
    await enqueueReportNotification({
      assignmentId: Number(assignment.id),
      employeeId: Number(assignment.responsible_employee_id),
      title,
      deadlineAt,
      kind: "report_assigned",
    });
  }
  runInBackground(() =>
    processNotificationJobs(50).catch((error) => console.error("Recurring report Telegram delivery failed", error)),
  );
}

function safeJson(value: unknown, fallback: unknown) {
  try {
    return JSON.parse(String(value ?? ""));
  } catch {
    return fallback;
  }
}

export type ReportCellValue = string | number | boolean;
export type ReportDataRow = Record<string, ReportCellValue>;

/** Column-wise summary ("svod") of a report table, per each column's aggregation rule. */
export function summarizeReportRows(columns: ReportColumn[], rows: ReportDataRow[]) {
  const summary: ReportDataRow = {};
  for (const column of columns) {
    const values = rows
      .map((row) => row[column.id])
      .filter((value) => value !== undefined && String(value).trim() !== "");
    if (!values.length) continue;
    if (column.type === "number") {
      const numbers = values.map(Number).filter(Number.isFinite);
      if (!numbers.length) continue;
      if (column.aggregation === "average") {
        summary[column.id] = Math.round((numbers.reduce((sum, value) => sum + value, 0) / numbers.length) * 100) / 100;
      } else if (column.aggregation === "last" || column.aggregation === "none") {
        summary[column.id] = numbers[numbers.length - 1];
      } else {
        summary[column.id] = numbers.reduce((sum, value) => sum + value, 0);
      }
    } else {
      summary[column.id] = values.length === 1 ? values[0] : values[values.length - 1];
    }
  }
  return summary;
}

function readStoredReportData(value: unknown, columns: ReportColumn[]) {
  const parsed = safeJson(value, {}) as Record<string, unknown>;
  if (parsed && Array.isArray(parsed.__rows)) {
    const rows = parsed.__rows
      .slice(0, 1000)
      .filter((row): row is ReportDataRow => Boolean(row) && typeof row === "object" && !Array.isArray(row));
    return { rows, values: summarizeReportRows(columns, rows) };
  }
  const legacy = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as ReportDataRow) : {};
  return {
    rows: Object.keys(legacy).length ? [legacy] : [],
    values: legacy,
  };
}

function reportAccessCtes(actor: Actor) {
  const ctes: string[] = [];
  const binds: unknown[] = [];
  if (actor.organizationId != null) {
    ctes.push(`org_scope(id) AS (
      SELECT id FROM app_organizations WHERE id=?
      UNION ALL
      SELECT child.id FROM app_organizations child JOIN org_scope parent ON child.parent_id=parent.id
      WHERE child.active=1
    )`);
    binds.push(actor.organizationId);
  }
  ctes.push(`assignment_scope(id) AS (
    SELECT id FROM app_report_assignments WHERE responsible_employee_id=?
    UNION ALL
    SELECT child.id FROM app_report_assignments child
      JOIN assignment_scope parent ON child.parent_assignment_id=parent.id
  )`);
  binds.push(actor.id);
  return { prefix: `WITH RECURSIVE ${ctes.join(",")}`, binds };
}

function visibleReportCondition(actor: Actor) {
  if (actor.permissions.viewScope === "all") return "1=1";
  const conditions = [
    "a.responsible_employee_id=?",
    "a.id IN (SELECT id FROM assignment_scope)",
    "t.created_by_employee_id=?",
  ];
  if (actor.permissions.canManageReports && actor.departmentId != null) conditions.push("t.owner_department_id=?");
  if (actor.permissions.canManageReports && actor.organizationId != null)
    conditions.push("a.organization_id IN (SELECT id FROM org_scope)");
  return conditions.join(" OR ");
}

function visibleReportBinds(actor: Actor) {
  if (actor.permissions.viewScope === "all") return [];
  const binds: unknown[] = [actor.id, actor.id];
  if (actor.permissions.canManageReports && actor.departmentId != null) binds.push(actor.departmentId);
  return binds;
}

export async function listReportOverview(actor: Actor, cursor = 0) {
  const db = await getD1();
  const access = reportAccessCtes(actor);
  const condition = visibleReportCondition(actor);
  const conditionBinds = visibleReportBinds(actor);
  const assignmentsResult = await db
    .prepare(
      `${access.prefix}
     SELECT a.*,c.template_id,c.period_label,c.period_start,c.period_end,c.deadline_at,c.status AS cycle_status,
            (SELECT responsible_employee_id FROM app_report_assignments parent WHERE parent.id=a.parent_assignment_id) AS parent_responsible_employee_id,
            t.code,t.title,t.instructions,t.columns_json,t.frequency,t.allow_delegation,t.require_attachment,
            t.owner_department_id,t.created_by_employee_id,
            o.name AS organization_name,o.short_name AS organization_short_name,o.type AS organization_type,o.parent_id AS organization_parent_id,
            responsible.full_name AS responsible_name,submitter.full_name AS submitted_by_name,
            reviewer.full_name AS reviewed_by_name,creator.full_name AS creator_name,
            d.name AS owner_department_name
       FROM app_report_assignments a
       JOIN app_report_cycles c ON c.id=a.cycle_id
       JOIN app_report_templates t ON t.id=c.template_id
       JOIN app_organizations o ON o.id=a.organization_id
       JOIN app_employees responsible ON responsible.id=a.responsible_employee_id
       JOIN app_employees creator ON creator.id=t.created_by_employee_id
       LEFT JOIN app_employees submitter ON submitter.id=a.submitted_by_employee_id
       LEFT JOIN app_employees reviewer ON reviewer.id=a.reviewed_by_employee_id
       LEFT JOIN app_departments d ON d.id=t.owner_department_id
      WHERE (${condition}) AND (?=0 OR a.id<?)
      ORDER BY a.id DESC
      LIMIT 501`,
    )
    .bind(...access.binds, ...conditionBinds, cursor, cursor)
    .all<Row>();
  const hasMore = assignmentsResult.results.length > 500;
  assignmentsResult.results = assignmentsResult.results.slice(0, 500);
  const assignmentIds = assignmentsResult.results.map((row) => Number(row.id));
  const numericStatsByAssignment = new Map<number, NumericStats>();
  for (let offset = 0; offset < assignmentIds.length; offset += 80) {
    const ids = assignmentIds.slice(offset, offset + 80);
    const result = await db
      .prepare(
        `SELECT sheet.assignment_id,cell.key,SUM(cell.value) AS total,COUNT(*) AS count
      FROM app_report_data_rows sheet,json_each(sheet.values_json) cell
      WHERE sheet.assignment_id IN (${ids.map(() => "?").join(",")}) AND cell.type IN ('integer','real')
      GROUP BY sheet.assignment_id,cell.key`,
      )
      .bind(...ids)
      .all<Row>();
    for (const row of result.results) {
      const stats = numericStatsByAssignment.get(Number(row.assignment_id)) ?? {};
      stats[String(row.key)] = { sum: Number(row.total), count: Number(row.count) };
      numericStatsByAssignment.set(Number(row.assignment_id), stats);
    }
  }
  const templateIds = [...new Set(assignmentsResult.results.map((row) => Number(row.template_id)))];
  const fileRows: Row[] = [];
  for (const [column, ids] of [
    ["assignment_id", assignmentIds],
    ["template_id", templateIds],
  ] as const) {
    for (let index = 0; index < ids.length; index += 80) {
      const chunk = ids.slice(index, index + 80);
      const result = await db
        .prepare(
          `SELECT id,template_id,assignment_id,purpose,file_name,content_type,size,uploaded_by_employee_id,created_at
        FROM app_report_files WHERE ${column} IN (${chunk.map(() => "?").join(",")}) ORDER BY created_at`,
        )
        .bind(...chunk)
        .all<Row>();
      for (const row of result.results)
        if (!fileRows.some((existing) => Number(existing.id) === Number(row.id))) fileRows.push(row);
    }
  }
  const assignments = assignmentsResult.results.map((row) => {
    const columns = safeJson(row.columns_json, []) as ReportColumn[];
    const reportData = readStoredReportData(row.values_json, columns);
    return {
      id: Number(row.id),
      version: Number(row.version),
      capabilities: reportAssignmentCapabilities(actor, row),
      numericStats:
        numericStatsByAssignment.get(Number(row.id)) ??
        reportNumericStats(columns, reportData.rows.length ? reportData.rows : [reportData.values]),
      cycleId: Number(row.cycle_id),
      templateId: Number(row.template_id),
      parentAssignmentId: row.parent_assignment_id == null ? null : Number(row.parent_assignment_id),
      organization: {
        id: Number(row.organization_id),
        name: String(row.organization_name),
        shortName: String(row.organization_short_name ?? ""),
        type: String(row.organization_type),
        parentId: row.organization_parent_id == null ? null : Number(row.organization_parent_id),
      },
      responsible: { id: Number(row.responsible_employee_id), name: String(row.responsible_name) },
      assignedByEmployeeId: Number(row.assigned_by_employee_id),
      status: String(row.status),
      values: reportData.values,
      rows: [],
      rowCount: Number(row.row_count ?? reportData.rows.length),
      comment: String(row.comment ?? ""),
      reviewComment: String(row.review_comment ?? ""),
      overdue: isReportAssignmentOverdue(String(row.status), String(row.deadline_at)),
      submittedBy:
        row.submitted_by_employee_id == null
          ? null
          : {
              id: Number(row.submitted_by_employee_id),
              name: String(row.submitted_by_name ?? ""),
            },
      submittedAt: row.submitted_at ? String(row.submitted_at) : null,
      reviewedBy:
        row.reviewed_by_employee_id == null
          ? null
          : {
              id: Number(row.reviewed_by_employee_id),
              name: String(row.reviewed_by_name ?? ""),
            },
      reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
      period: {
        label: String(row.period_label),
        start: String(row.period_start),
        end: String(row.period_end),
        deadlineAt: String(row.deadline_at),
        status: String(row.cycle_status),
      },
      template: {
        id: Number(row.template_id),
        code: String(row.code),
        title: String(row.title),
        instructions: String(row.instructions ?? ""),
        columns,
        frequency: String(row.frequency),
        allowDelegation: Boolean(row.allow_delegation),
        requireAttachment: Boolean(row.require_attachment),
        ownerDepartmentId: row.owner_department_id == null ? null : Number(row.owner_department_id),
        ownerDepartment: String(row.owner_department_name ?? ""),
        creatorId: Number(row.created_by_employee_id),
        creatorName: String(row.creator_name),
      },
      files: fileRows.filter((file) => Number(file.assignment_id) === Number(row.id)).map(mapFile),
      templateFiles: fileRows
        .filter((file) => Number(file.template_id) === Number(row.template_id) && file.assignment_id == null)
        .map(mapFile),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  });

  const organizationsResult =
    actor.permissions.viewScope === "all" || actor.permissions.canManageRoles
      ? await db
          .prepare(
            "SELECT id,name,short_name,type,parent_id,region_code,active FROM app_organizations ORDER BY type,name",
          )
          .all<Row>()
      : actor.organizationId == null
        ? { results: [] as Row[] }
        : await db
            .prepare(
              `WITH RECURSIVE scoped(id) AS (
           SELECT id FROM app_organizations WHERE id=?
           UNION ALL SELECT o.id FROM app_organizations o JOIN scoped p ON o.parent_id=p.id WHERE o.active=1
         )
         SELECT id,name,short_name,type,parent_id,region_code,active FROM app_organizations WHERE id IN (SELECT id FROM scoped) ORDER BY type,name`,
            )
            .bind(actor.organizationId)
            .all<Row>();

  const needsDelegationDirectory =
    actor.permissions.canManageReports ||
    assignments.some((assignment) => assignment.responsible.id === actor.id && assignment.template.allowDelegation);
  const employeesResult = needsDelegationDirectory
    ? actor.permissions.viewScope === "all" || actor.organizationId == null
      ? await db
          .prepare(
            `SELECT e.id,e.full_name,e.position,e.organization_id,o.name AS organization_name
           FROM app_employees e LEFT JOIN app_organizations o ON o.id=e.organization_id
          WHERE e.active=1 ORDER BY o.name,e.full_name LIMIT 500`,
          )
          .all<Row>()
      : await db
          .prepare(
            `WITH RECURSIVE org_scope(id) AS (
           SELECT id FROM app_organizations WHERE id=?
           UNION ALL SELECT child.id FROM app_organizations child JOIN org_scope parent ON child.parent_id=parent.id
            WHERE child.active=1
         )
         SELECT e.id,e.full_name,e.position,e.organization_id,o.name AS organization_name
           FROM app_employees e LEFT JOIN app_organizations o ON o.id=e.organization_id
          WHERE e.active=1 AND e.organization_id IN (SELECT id FROM org_scope)
          ORDER BY o.name,e.full_name LIMIT 500`,
          )
          .bind(actor.organizationId)
          .all<Row>()
    : { results: [] as Row[] };

  return {
    canManageReports: actor.permissions.canManageReports,
    organizations: organizationsResult.results.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      shortName: String(row.short_name ?? ""),
      type: String(row.type),
      parentId: row.parent_id == null ? null : Number(row.parent_id),
      regionCode: row.region_code ? String(row.region_code) : null,
      active: Boolean(row.active),
    })),
    employees: employeesResult.results.map((row) => ({
      id: Number(row.id),
      name: String(row.full_name),
      position: String(row.position ?? ""),
      organizationId: row.organization_id == null ? null : Number(row.organization_id),
      organization: String(row.organization_name ?? ""),
    })),
    assignments,
    nextCursor: hasMore ? Number(assignmentsResult.results.at(-1)?.id) : null,
  };
}

function mapFile(row: Row) {
  return {
    id: Number(row.id),
    templateId: row.template_id == null ? null : Number(row.template_id),
    assignmentId: row.assignment_id == null ? null : Number(row.assignment_id),
    purpose: String(row.purpose),
    fileName: String(row.file_name),
    contentType: String(row.content_type ?? "application/octet-stream"),
    size: Number(row.size ?? 0),
    uploadedByEmployeeId: Number(row.uploaded_by_employee_id),
    createdAt: String(row.created_at),
  };
}

export async function canAccessReportAssignment(actor: Actor, assignmentId: number) {
  if (actor.permissions.viewScope === "all") {
    return Boolean(
      await (await getD1()).prepare("SELECT id FROM app_report_assignments WHERE id=?").bind(assignmentId).first(),
    );
  }
  const db = await getD1();
  const row = await db
    .prepare(
      `WITH RECURSIVE ancestors(id,parent_assignment_id,responsible_employee_id) AS (
       SELECT id,parent_assignment_id,responsible_employee_id FROM app_report_assignments WHERE id=?
       UNION ALL
       SELECT parent.id,parent.parent_assignment_id,parent.responsible_employee_id
         FROM app_report_assignments parent JOIN ancestors child ON child.parent_assignment_id=parent.id
     ),
     org_scope(id) AS (
       SELECT id FROM app_organizations WHERE id=?
       UNION ALL SELECT child.id FROM app_organizations child JOIN org_scope parent ON child.parent_id=parent.id
     )
     SELECT a.id FROM app_report_assignments a
       JOIN app_report_cycles c ON c.id=a.cycle_id
       JOIN app_report_templates t ON t.id=c.template_id
      WHERE a.id=? AND (
        a.responsible_employee_id=?
        OR EXISTS (SELECT 1 FROM ancestors WHERE responsible_employee_id=?)
        OR t.created_by_employee_id=?
        OR (?=1 AND t.owner_department_id=?)
        OR (?=1 AND a.organization_id IN (SELECT id FROM org_scope))
      ) LIMIT 1`,
    )
    .bind(
      assignmentId,
      actor.organizationId ?? -1,
      assignmentId,
      actor.id,
      actor.id,
      actor.id,
      actor.permissions.canManageReports ? 1 : 0,
      actor.departmentId ?? -1,
      actor.permissions.canManageReports ? 1 : 0,
    )
    .first();
  return Boolean(row);
}
