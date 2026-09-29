/**
 * Report workflow service: template creation, executor fill/submit, delegation
 * to subordinate organizations and reviewer decisions. Authorization comes from
 * lib/policy/reports; the HTTP route only parses, dispatches and serializes.
 */
import { getD1 } from "../db";
import type { Actor } from "../lib/auth";
import { runInBackground } from "../lib/background";
import { ApiError } from "../lib/errors";
import { authorize } from "../lib/policy";
import {
  reportAssignmentView,
  reportDelegate,
  reportFill,
  reportRecipientOrganization,
  reportReview,
  reportTemplateCreate,
} from "../lib/policy/reports";
import { normalizedReportHeader } from "../lib/report-excel";
import { replaceReportRows, reportMutationAudit, REPORT_EDITABLE_SQL } from "../lib/report-mutations";
import { reportCycleParts } from "../lib/report-periods";
import { cleanReportRows } from "../lib/report-sheet";
import {
  canAccessReportAssignment,
  cleanReportColumns,
  reportAssignmentCapabilities,
  reportAssignmentFacts,
  reportCycleStatusStatement,
  reportFrequencies,
  summarizeReportRows,
  type ReportColumn,
  type ReportDataRow,
} from "../lib/reports";
import { random48BitId } from "../lib/shared/ids";
import { enqueueReportNotification, processNotificationJobs } from "../lib/telegram";

type Row = Record<string, unknown>;
type JsonRecord = Record<string, unknown>;

/** Thrown when the client's expectedVersion is stale; the route adds a machine-readable code. */
export class ReportVersionConflictError extends ApiError {
  readonly code = "REPORT_VERSION_CONFLICT";
  constructor() {
    super(409, "Hisobot boshqa oynada o‘zgargan. Jadvalni qayta ochib yangi holat bilan solishtiring.");
  }
}

/** An assignment joined with its cycle and template: everything mutations need. */
type AssignmentRecord = {
  id: number;
  cycleId: number;
  organizationId: number;
  parentAssignmentId: number | null;
  responsibleEmployeeId: number;
  status: string;
  version: number;
  title: string;
  deadlineAt: string;
  columns: ReportColumn[];
  requireAttachment: boolean;
  templateCreatorEmployeeId: number;
  row: Row;
};

function mapAssignment(row: Row): AssignmentRecord {
  let columns: ReportColumn[] = [];
  try {
    columns = JSON.parse(String(row.columns_json ?? "[]")) as ReportColumn[];
  } catch {
    columns = [];
  }
  return {
    id: Number(row.id),
    cycleId: Number(row.cycle_id),
    organizationId: Number(row.organization_id),
    parentAssignmentId: row.parent_assignment_id == null ? null : Number(row.parent_assignment_id),
    responsibleEmployeeId: Number(row.responsible_employee_id),
    status: String(row.status),
    version: Number(row.version),
    title: String(row.title),
    deadlineAt: String(row.deadline_at),
    columns,
    requireAttachment: Boolean(row.require_attachment),
    templateCreatorEmployeeId: Number(row.created_by_employee_id),
    row,
  };
}

async function loadAssignment(db: D1Database, id: number) {
  const row = await db
    .prepare(
      `SELECT a.*,c.template_id,c.deadline_at,t.title,t.columns_json,t.allow_delegation,t.require_attachment,
            t.owner_department_id,t.created_by_employee_id,
            (SELECT responsible_employee_id FROM app_report_assignments parent WHERE parent.id=a.parent_assignment_id) AS parent_responsible_employee_id
       FROM app_report_assignments a
       JOIN app_report_cycles c ON c.id=a.cycle_id
       JOIN app_report_templates t ON t.id=c.template_id
      WHERE a.id=?`,
    )
    .bind(id)
    .first<Row>();
  return row ? mapAssignment(row) : null;
}

type Recipient = { organizationId: number; employeeId: number };

function parseRecipients(value: unknown): Recipient[] {
  return Array.isArray(value)
    ? value
        .map((item) => (item && typeof item === "object" ? (item as JsonRecord) : {}))
        .map((item) => ({ organizationId: Number(item.organizationId), employeeId: Number(item.employeeId) }))
        .filter((item) => item.organizationId && item.employeeId)
    : [];
}

function notifyInBackground(label: string, work: () => Promise<void>) {
  runInBackground(async () => {
    try {
      await work();
    } catch (error) {
      console.error(label, error);
    }
  });
}

export async function getReportAssignmentDetail(actor: Actor, assignmentId: number) {
  await authorize(reportAssignmentView(await canAccessReportAssignment(actor, assignmentId)));
  const db = await getD1();
  const snapshot = await db.batch([
    db
      .prepare(
        `SELECT a.*,t.allow_delegation,t.created_by_employee_id,t.owner_department_id,
      (SELECT responsible_employee_id FROM app_report_assignments parent WHERE parent.id=a.parent_assignment_id) AS parent_responsible_employee_id
      FROM app_report_assignments a JOIN app_report_cycles c ON c.id=a.cycle_id JOIN app_report_templates t ON t.id=c.template_id WHERE a.id=?`,
      )
      .bind(assignmentId),
    db
      .prepare("SELECT values_json FROM app_report_data_rows WHERE assignment_id=? ORDER BY row_order LIMIT 1000")
      .bind(assignmentId),
    db
      .prepare("SELECT id,file_name AS fileName,size FROM app_report_files WHERE assignment_id=? ORDER BY id")
      .bind(assignmentId),
  ]);
  const current = snapshot[0].results[0] as Row | undefined;
  if (!current) throw new ApiError(404, "Hisobot topilmadi");
  let rows = snapshot[1].results.map((row) => {
    try {
      return JSON.parse(String((row as Row).values_json)) as ReportDataRow;
    } catch {
      return {};
    }
  });
  if (!rows.length) {
    try {
      const legacy = JSON.parse(String(current.values_json ?? "{}")) as JsonRecord;
      rows = Array.isArray(legacy.__rows)
        ? (legacy.__rows.slice(0, 1000) as ReportDataRow[])
        : Object.keys(legacy).length
          ? [legacy as ReportDataRow]
          : [];
    } catch {
      rows = [];
    }
  }
  return {
    rows,
    version: Number(current.version),
    status: String(current.status),
    comment: String(current.comment ?? ""),
    reviewComment: String(current.review_comment ?? ""),
    capabilities: reportAssignmentCapabilities(actor, current),
    files: snapshot[2].results,
  };
}

export async function createReportTemplate(actor: Actor, payload: JsonRecord, organizationScope: Set<number>) {
  await authorize(reportTemplateCreate(actor));
  const title = String(payload.title ?? "").trim();
  const instructions = String(payload.instructions ?? "")
    .trim()
    .slice(0, 8000);
  const frequency = reportFrequencies.has(String(payload.frequency)) ? String(payload.frequency) : "monthly";
  const firstDeadline = new Date(String(payload.firstDeadlineAt ?? ""));
  const columns = cleanReportColumns(payload.columns);
  const recipients = parseRecipients(payload.recipients);
  if (!Array.isArray(payload.recipients) || recipients.length !== payload.recipients.length || recipients.length > 250)
    throw new ApiError(400, "Har bir qatorda tashkilot va mas’ul xodimni tanlang; ko‘pi bilan 250 ta tashkilot");
  if (title.length < 3 || title.length > 240)
    throw new ApiError(400, "Hisobot nomi 3–240 belgidan iborat bo‘lishi kerak");
  if (
    !columns.length ||
    !Array.isArray(payload.columns) ||
    payload.columns.length > 32 ||
    columns.some((column) => !column.label)
  )
    throw new ApiError(400, "1–32 ta ustun kiriting va har biriga nom bering");
  if (new Set(columns.map((column) => normalizedReportHeader(column.label))).size !== columns.length) {
    throw new ApiError(400, "Hisobot ustunlari nomi takrorlanmasligi kerak");
  }
  if (Number.isNaN(firstDeadline.getTime()) || firstDeadline <= new Date())
    throw new ApiError(400, "Birinchi muddat kelajak vaqtga belgilanadi");
  if (!recipients.length) throw new ApiError(400, "Kamida bitta tashkilot va mas’ul xodimni tanlang");
  if (new Set(recipients.map((item) => item.organizationId)).size !== recipients.length) {
    throw new ApiError(400, "Bir tashkilot faqat bir marta tanlanadi");
  }
  const db = await getD1();
  for (const recipient of recipients) {
    await authorize(reportRecipientOrganization(organizationScope.has(recipient.organizationId)));
    const employee = await db
      .prepare(
        `SELECT e.id FROM app_employees e JOIN app_organizations o ON o.id=e.organization_id
        WHERE e.id=? AND e.organization_id=? AND e.active=1 AND o.active=1`,
      )
      .bind(recipient.employeeId, recipient.organizationId)
      .first();
    if (!employee) throw new ApiError(400, "Tanlangan tashkilotning faol mas’ul xodimini belgilang");
  }
  const ownerDepartmentId =
    payload.ownerDepartmentId && actor.permissions.canManageRoles
      ? Number(payload.ownerDepartmentId)
      : actor.departmentId;
  const requestId = String(payload.requestId ?? crypto.randomUUID());
  if (!/^[0-9a-f-]{36}$/i.test(requestId)) throw new ApiError(400, "So‘rov identifikatori noto‘g‘ri");
  const code = `RPT-${requestId}`;
  const existing = await db
    .prepare(
      "SELECT t.id,c.id AS cycle_id,t.created_by_employee_id FROM app_report_templates t JOIN app_report_cycles c ON c.template_id=t.id WHERE t.code=? LIMIT 1",
    )
    .bind(code)
    .first<Row>();
  if (existing) {
    if (Number(existing.created_by_employee_id) !== actor.id) throw new ApiError(409, "So‘rov identifikatori band");
    return { created: false as const, templateId: Number(existing.id), cycleId: Number(existing.cycle_id) };
  }
  const templateId = random48BitId(),
    cycleId = random48BitId();
  const period = reportCycleParts(firstDeadline, frequency);
  await db.batch([
    db
      .prepare(
        `INSERT INTO app_report_templates
      (id,code,title,instructions,columns_json,frequency,first_deadline_at,owner_department_id,allow_delegation,require_attachment,created_by_employee_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .bind(
        templateId,
        code,
        title,
        instructions,
        JSON.stringify(columns),
        frequency,
        firstDeadline.toISOString(),
        ownerDepartmentId,
        payload.allowDelegation === false ? 0 : 1,
        Boolean(payload.requireAttachment) ? 1 : 0,
        actor.id,
      ),
    db
      .prepare(
        `INSERT INTO app_report_template_recipients (template_id,organization_id,responsible_employee_id)
      SELECT ?,json_extract(value,'$.organizationId'),json_extract(value,'$.employeeId') FROM json_each(?)`,
      )
      .bind(templateId, JSON.stringify(recipients)),
    db
      .prepare(
        "INSERT INTO app_report_cycles (id,template_id,period_key,period_label,period_start,period_end,deadline_at) VALUES (?,?,?,?,?,?,?)",
      )
      .bind(
        cycleId,
        templateId,
        period.periodKey,
        period.periodLabel,
        period.periodStart,
        period.periodEnd,
        firstDeadline.toISOString(),
      ),
    db
      .prepare(
        `INSERT INTO app_report_assignments (cycle_id,organization_id,responsible_employee_id,assigned_by_employee_id)
      SELECT ?,organization_id,responsible_employee_id,? FROM app_report_template_recipients WHERE template_id=?`,
      )
      .bind(cycleId, actor.id, templateId),
    db
      .prepare(
        "INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,'report.template_created','report_template',?,?)",
      )
      .bind(
        actor.id,
        templateId,
        JSON.stringify({ code, frequency, recipients: recipients.length, columns: columns.length }),
      ),
  ]);
  notifyInBackground("Report creation notification failed", async () => {
    const assignments = await db
      .prepare("SELECT id,responsible_employee_id FROM app_report_assignments WHERE cycle_id=?")
      .bind(cycleId)
      .all<{ id: number; responsible_employee_id: number }>();
    for (const assignment of assignments.results)
      await enqueueReportNotification({
        assignmentId: Number(assignment.id),
        employeeId: Number(assignment.responsible_employee_id),
        title,
        deadlineAt: firstDeadline.toISOString(),
        kind: "report_assigned",
      });
    await processNotificationJobs(50);
  });
  return { created: true as const, templateId, cycleId };
}

type MutationContext = {
  db: D1Database;
  actor: Actor;
  payload: JsonRecord;
  current: AssignmentRecord;
  expectedVersion: number;
  mutationKey: string;
  version: number;
};

async function fillReport(ctx: MutationContext, action: "submit" | "save") {
  const { db, actor, payload, current, expectedVersion, mutationKey, version } = ctx;
  await authorize(reportFill(actor, reportAssignmentFacts(current.row)));
  let rows;
  try {
    rows = cleanReportRows(
      current.columns,
      payload.rows ?? (payload.values ? [payload.values] : []),
      action === "submit",
    );
  } catch (error) {
    throw new ApiError(400, error instanceof Error ? error.message : "Jadval noto‘g‘ri");
  }
  if (action === "submit" && current.requireAttachment) {
    const file = await db
      .prepare("SELECT id FROM app_report_files WHERE assignment_id=? LIMIT 1")
      .bind(current.id)
      .first();
    if (!file) throw new ApiError(400, "Tasdiqlovchi fayl biriktiring");
  }
  const summary = summarizeReportRows(current.columns, rows);
  const submitterComment =
    payload.comment === undefined || payload.comment === null ? null : String(payload.comment).trim().slice(0, 4000);
  const nextStatus =
    action === "submit" ? "submitted" : ["new", "draft"].includes(current.status) ? "draft" : current.status;
  const results = await db.batch([
    // The submitter's comment changes only when sent; the reviewer's return
    // reason (review_comment) stays visible until the report is resubmitted.
    db
      .prepare(
        `UPDATE app_report_assignments SET values_json=?,comment=CASE WHEN ? IS NULL THEN comment ELSE ? END,status=?,row_count=?,
      review_comment=CASE WHEN ?='submit' THEN '' ELSE review_comment END,
      submitted_by_employee_id=CASE WHEN ?='submit' THEN ? ELSE submitted_by_employee_id END,
      submitted_at=CASE WHEN ?='submit' THEN CURRENT_TIMESTAMP ELSE submitted_at END,
      reviewed_by_employee_id=CASE WHEN ?='submit' THEN NULL ELSE reviewed_by_employee_id END,
      reviewed_at=CASE WHEN ?='submit' THEN NULL ELSE reviewed_at END,
      version=version+1,mutation_key=?,updated_at=CURRENT_TIMESTAMP
      WHERE id=? AND version=? AND ${REPORT_EDITABLE_SQL}`,
      )
      .bind(
        JSON.stringify(summary),
        submitterComment,
        submitterComment,
        nextStatus,
        rows.length,
        action,
        action,
        actor.id,
        action,
        action,
        action,
        mutationKey,
        current.id,
        expectedVersion,
      ),
    ...replaceReportRows(db, current.id, mutationKey, rows),
    reportCycleStatusStatement(db, current.cycleId),
    reportMutationAudit(
      db,
      actor.id,
      current.id,
      mutationKey,
      action === "submit" ? "report.submitted" : "report.draft_saved",
      { rows: rows.length, version },
    ),
  ]);
  if (Number(results[0].meta.changes) !== 1)
    throw new ApiError(409, "Hisobot parallel o‘zgargan; ma’lumot ustiga yozilmadi");
  if (action === "submit")
    notifyInBackground("Report submission notification failed", async () => {
      await db
        .prepare(
          "UPDATE app_notification_jobs SET status='cancelled',last_error='Hisobot yuborildi' WHERE entity_type='report' AND entity_id=? AND status IN ('pending','failed','waiting_link','processing')",
        )
        .bind(current.id)
        .run();
      const parent = current.parentAssignmentId
        ? await db
            .prepare("SELECT responsible_employee_id FROM app_report_assignments WHERE id=?")
            .bind(current.parentAssignmentId)
            .first<{ responsible_employee_id: number }>()
        : null;
      const reviewerId = parent?.responsible_employee_id ?? current.templateCreatorEmployeeId;
      if (reviewerId && reviewerId !== actor.id)
        await enqueueReportNotification({
          assignmentId: current.id,
          employeeId: reviewerId,
          title: current.title,
          deadlineAt: current.deadlineAt,
          kind: "report_submitted",
        });
      await processNotificationJobs(20);
    });
  return { ok: true, version, status: nextStatus, rowCount: rows.length };
}

async function delegateReport(ctx: MutationContext) {
  const { db, actor, payload, current, expectedVersion, mutationKey, version } = ctx;
  await authorize(reportDelegate(actor, reportAssignmentFacts(current.row)));
  const recipients = parseRecipients(payload.recipients);
  if (!recipients.length) throw new ApiError(400, "Kamida bitta quyi tashkilotni tanlang");
  for (const recipient of recipients) {
    const valid = await db
      .prepare(
        `SELECT e.id FROM app_organizations o JOIN app_employees e ON e.organization_id=o.id AND e.active=1
        WHERE o.id=? AND o.parent_id=? AND o.active=1 AND e.id=?`,
      )
      .bind(recipient.organizationId, current.organizationId, recipient.employeeId)
      .first();
    if (!valid) throw new ApiError(400, "Faqat bevosita quyi tashkilot va uning mas’ul xodimini tanlash mumkin");
  }
  if (recipients.length > 250 || new Set(recipients.map((item) => item.organizationId)).size !== recipients.length)
    throw new ApiError(400, "Tashkilotni takror tanlamang; ko‘pi bilan 250 ta tashkilot");
  for (const recipient of recipients) {
    const exists = await db
      .prepare("SELECT id FROM app_report_assignments WHERE cycle_id=? AND organization_id=?")
      .bind(current.cycleId, recipient.organizationId)
      .first();
    if (exists)
      throw new ApiError(
        409,
        "Tanlangan tashkilotga hisobot avval biriktirilgan. Mavjud jadval va mas’ul o‘zgartirilmadi.",
      );
  }
  let result: D1Result<unknown>[];
  try {
    result = await db.batch([
      db
        .prepare(
          `UPDATE app_report_assignments SET status='collecting',version=version+1,mutation_key=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=? AND ${REPORT_EDITABLE_SQL}`,
        )
        .bind(mutationKey, current.id, expectedVersion),
      ...recipients.map((recipient) =>
        db
          .prepare(
            `INSERT INTO app_report_assignments (cycle_id,organization_id,responsible_employee_id,assigned_by_employee_id,parent_assignment_id)
        SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM app_report_assignments WHERE id=? AND mutation_key=?)`,
          )
          .bind(
            current.cycleId,
            recipient.organizationId,
            recipient.employeeId,
            actor.id,
            current.id,
            current.id,
            mutationKey,
          ),
      ),
      reportMutationAudit(db, actor.id, current.id, mutationKey, "report.delegated", { recipients, version }),
      reportCycleStatusStatement(db, current.cycleId),
    ]);
  } catch (error) {
    if (/UNIQUE constraint failed: app_report_assignments/i.test(String(error)))
      throw new ApiError(409, "Hisobot boshqa oynada biriktirildi. Ro‘yxatni yangilang");
    throw error;
  }
  if (Number(result[0].meta.changes) !== 1) throw new ApiError(409, "Hisobot parallel o‘zgargan. Ro‘yxatni yangilang");
  notifyInBackground("Report delegation notification failed", async () => {
    for (const recipient of recipients) {
      const child = await db
        .prepare("SELECT id FROM app_report_assignments WHERE cycle_id=? AND organization_id=?")
        .bind(current.cycleId, recipient.organizationId)
        .first<{ id: number }>();
      if (child)
        await enqueueReportNotification({
          assignmentId: Number(child.id),
          employeeId: recipient.employeeId,
          title: current.title,
          deadlineAt: current.deadlineAt,
          kind: "report_assigned",
        });
    }
    await processNotificationJobs(50);
  });
  return { ok: true, version };
}

async function reviewReport(ctx: MutationContext, action: "approve" | "return") {
  const { db, actor, payload, current, expectedVersion, mutationKey, version } = ctx;
  await authorize(reportReview(actor, reportAssignmentFacts(current.row)));
  const nextStatus = action === "approve" ? "approved" : "returned";
  const comment = String(payload.comment ?? "")
    .trim()
    .slice(0, 4000);
  if (action === "return" && comment.length < 3)
    throw new ApiError(400, "Qaytarish sababini kamida 3 belgi bilan yozing");
  const results = await db.batch([
    // The reviewer's note lives in review_comment; the submitter's comment is kept.
    db
      .prepare(
        `UPDATE app_report_assignments SET status=?,review_comment=?,
      reviewed_by_employee_id=?,reviewed_at=CURRENT_TIMESTAMP,version=version+1,mutation_key=?,updated_at=CURRENT_TIMESTAMP
      WHERE id=? AND version=? AND status='submitted'`,
      )
      .bind(nextStatus, comment, actor.id, mutationKey, current.id, expectedVersion),
    reportMutationAudit(db, actor.id, current.id, mutationKey, `report.${nextStatus}`, { version, comment }),
    reportCycleStatusStatement(db, current.cycleId),
  ]);
  if (Number(results[0].meta.changes) !== 1) throw new ApiError(409, "Hisobot parallel o‘zgargan; qaror saqlanmadi");
  notifyInBackground("Report review notification failed", async () => {
    await enqueueReportNotification({
      assignmentId: current.id,
      employeeId: current.responsibleEmployeeId,
      title: current.title,
      deadlineAt: current.deadlineAt,
      kind: action === "approve" ? "report_approved" : "report_returned",
    });
    await processNotificationJobs(20);
  });
  return { ok: true, version, status: nextStatus };
}

export async function mutateReportAssignment(actor: Actor, payload: JsonRecord) {
  const assignmentId = Number(payload.assignmentId);
  const action = String(payload.action ?? "");
  if (!assignmentId) throw new ApiError(400, "Hisobot topshirig‘i ID majburiy");
  await authorize(reportAssignmentView(await canAccessReportAssignment(actor, assignmentId)));
  const db = await getD1();
  const current = await loadAssignment(db, assignmentId);
  if (!current) throw new ApiError(404, "Hisobot topilmadi");
  const expectedVersion = payload.expectedVersion;
  if (
    typeof expectedVersion !== "number" ||
    !Number.isSafeInteger(expectedVersion) ||
    expectedVersion !== current.version
  ) {
    throw new ReportVersionConflictError();
  }
  const ctx: MutationContext = {
    db,
    actor,
    payload,
    current,
    expectedVersion,
    mutationKey: crypto.randomUUID(),
    version: expectedVersion + 1,
  };
  if (action === "submit" || action === "save") return fillReport(ctx, action);
  if (action === "delegate") return delegateReport(ctx);
  if (action === "approve" || action === "return") return reviewReport(ctx, action);
  throw new ApiError(400, "Noma’lum amal");
}
