/**
 * Task business operations. Web routes and the Telegram bot call these, so a
 * rule such as "executors submit, only the task giver accepts" (audit Y4) has
 * exactly one implementation. Authorization is decided beforehand by
 * lib/policy/tasks.ts; these functions assume the caller already authorized.
 */
import type { AudienceTarget } from "../lib/audiences";
import { employeeMatchesTaskAudience } from "../lib/audiences";
import { ApiError } from "../lib/errors";
import { createNextRecurringTask, recurrenceAnchorDay } from "../lib/recurrence";
import { SQL_NOW_ISO } from "../lib/sql-time";
import {
  TASK_DONE,
  TASK_IN_PROGRESS,
  TASK_RECURRING_ACTIVE,
  TASK_REVIEW,
  mapAssignment,
  mapTask,
  type AssignmentRow,
  type TaskContext,
  type TaskRow,
} from "./task-rows";

export const TASK_PRIORITIES = new Set(["Yuqori", "O‘rta", "Oddiy"]);
export const TASK_RECURRENCES = new Set(["Har kuni", "Har hafta", "Har oy", "Har chorak"]);
export const MAX_DIRECT_ASSIGNEES = 250;

const CANCELLABLE_JOBS = "status IN ('pending','failed','waiting_link','processing')";

function activeStatus(recurring: boolean) {
  return recurring ? TASK_RECURRING_ACTIVE : TASK_IN_PROGRESS;
}

function cancelTaskJobs(db: D1Database, taskId: number, reason: string) {
  return db
    .prepare(
      `UPDATE app_notification_jobs SET status='cancelled', last_error=?
      WHERE entity_type='task' AND entity_id=? AND ${CANCELLABLE_JOBS}`,
    )
    .bind(reason, taskId);
}

async function actorAssignment(db: D1Database, taskId: number, employeeId: number) {
  const row = await db
    .prepare(
      `SELECT id,task_id,employee_id,assigned_by_employee_id,parent_assignment_id,assignment_status,progress
       FROM app_task_assignments WHERE task_id=? AND employee_id=?`,
    )
    .bind(taskId, employeeId)
    .first<AssignmentRow>();
  return row ? mapAssignment(row) : null;
}

/**
 * Loads what task policies need. `resolveVisible` answers the view-scope
 * question for web actors; without it (Telegram) visibility means taking part
 * in the task: creator, executor or audience member.
 */
export async function loadTaskContext(
  db: D1Database,
  taskId: number,
  employeeId: number,
  resolveVisible?: () => Promise<boolean>,
): Promise<TaskContext | null> {
  if (!Number.isSafeInteger(taskId) || taskId <= 0) return null;
  const row = await db
    .prepare(
      `SELECT id,title,description,deadline_iso,priority,status,progress,recurring,recurrence,notify_telegram,
            topic_id,created_by_employee_id,archived,created_at,updated_at
       FROM app_tasks WHERE id=?`,
    )
    .bind(taskId)
    .first<TaskRow>();
  if (!row) return null;
  const task = mapTask(row);
  const assignment = await actorAssignment(db, taskId, employeeId);
  const creator = task.createdByEmployeeId === employeeId;
  const audienceMember = !assignment && !creator && (await employeeMatchesTaskAudience(taskId, employeeId));
  const visible = resolveVisible ? await resolveVisible() : creator || Boolean(assignment) || audienceMember;
  return { task, visible, assignment, audienceMember };
}

async function leafProgress(db: D1Database, taskId: number) {
  return db
    .prepare(
      `SELECT CAST(AVG(a.progress) AS INTEGER) AS progress, MIN(a.progress) AS min_progress
       FROM app_task_assignments a
      WHERE a.task_id=? AND NOT EXISTS (
        SELECT 1 FROM app_task_assignments child WHERE child.parent_assignment_id=a.id
      )`,
    )
    .bind(taskId)
    .first<{ progress: number | null; min_progress: number | null }>();
}

export type NewTaskInput = {
  title: string;
  description: string;
  deadlineIso: string | null;
  priority: string;
  recurring: boolean;
  recurrence: string | null;
  notifyTelegram: boolean;
  topicId: number | null;
  assigneeIds: number[];
  audiences: AudienceTarget[];
  pinned: boolean;
  routeNote: string;
};

/** Task plus every related row in one transaction (audit Y15). */
export async function createTask(db: D1Database, creatorId: number, input: NewTaskInput) {
  const creationKey = crypto.randomUUID();
  const taskIdSql = "(SELECT id FROM app_tasks WHERE creation_key=?)";
  await db.batch([
    db
      .prepare(
        `INSERT INTO app_tasks
        (title, description, deadline_iso, priority, status, progress, recurring, recurrence, notify_telegram, topic_id, created_by_employee_id, creation_key, recurrence_anchor_day)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.title,
        input.description,
        input.deadlineIso,
        input.priority,
        activeStatus(input.recurring),
        input.recurring ? 1 : 0,
        input.recurring ? input.recurrence : null,
        input.notifyTelegram ? 1 : 0,
        input.topicId,
        creatorId,
        creationKey,
        input.recurring && input.deadlineIso ? recurrenceAnchorDay(input.deadlineIso) : null,
      ),
    ...input.assigneeIds.flatMap((employeeId) => [
      db
        .prepare(
          `INSERT INTO app_task_assignments (task_id, employee_id, assigned_by_employee_id) VALUES (${taskIdSql}, ?, ?)`,
        )
        .bind(creationKey, employeeId, creatorId),
      db
        .prepare(
          `INSERT INTO app_task_routes (task_id, from_employee_id, to_employee_id, action, note) VALUES (${taskIdSql}, ?, ?, 'Topshiriq berildi', ?)`,
        )
        .bind(creationKey, creatorId, employeeId, input.routeNote),
    ]),
    ...input.audiences.map((audience) =>
      db
        .prepare(
          `INSERT INTO app_task_audiences (task_id,target_type,target_id,include_descendants,created_by_employee_id)
       VALUES (${taskIdSql},?,?,?,?)`,
        )
        .bind(creationKey, audience.targetType, audience.targetId, audience.includeDescendants ? 1 : 0, creatorId),
    ),
    ...(input.pinned
      ? [
          db
            .prepare(`INSERT OR IGNORE INTO app_task_pins (task_id, employee_id) VALUES (${taskIdSql}, ?)`)
            .bind(creationKey, creatorId),
        ]
      : []),
  ]);
  const created = await db
    .prepare("SELECT id FROM app_tasks WHERE creation_key=?")
    .bind(creationKey)
    .first<{ id: number }>();
  if (!created) throw new ApiError(500, "Topshiriq saqlanmadi");
  return Number(created.id);
}

export async function setTaskPin(db: D1Database, taskId: number, employeeId: number, pinned: boolean) {
  if (pinned)
    await db
      .prepare("INSERT OR IGNORE INTO app_task_pins (task_id, employee_id) VALUES (?, ?)")
      .bind(taskId, employeeId)
      .run();
  else await db.prepare("DELETE FROM app_task_pins WHERE task_id=? AND employee_id=?").bind(taskId, employeeId).run();
}

export type ProgressResult = {
  progress: number;
  assignmentStatus: string;
  taskStatus: string;
  submitted: boolean;
  enrolled: boolean;
};

/**
 * An executor reports progress; 100% submits their share for review. Audience
 * members are enrolled individually on first report. The task becomes
 * "Ko‘rib chiqilmoqda" only when every direct leaf executor submitted and the
 * task has no audience; it never becomes "Bajarildi" here.
 */
export async function reportTaskProgress(
  db: D1Database,
  ctx: TaskContext,
  employeeId: number,
  nextProgress: (current: number) => number,
  enrolmentNote: string,
): Promise<ProgressResult> {
  const taskId = ctx.task.id;
  let assignment = ctx.assignment;
  let enrolled = false;
  if (!assignment && ctx.audienceMember) {
    const owner = ctx.task.createdByEmployeeId;
    await db.batch([
      db
        .prepare(
          "INSERT OR IGNORE INTO app_task_assignments (task_id,employee_id,assigned_by_employee_id) VALUES (?,?,?)",
        )
        .bind(taskId, employeeId, owner),
      db
        .prepare(
          "INSERT INTO app_task_routes (task_id,from_employee_id,to_employee_id,action,note) VALUES (?,?,?,'Auditoriyadan qabul qilindi',?)",
        )
        .bind(taskId, owner, employeeId, enrolmentNote),
    ]);
    assignment = await actorAssignment(db, taskId, employeeId);
    enrolled = true;
  }
  if (!assignment) throw new ApiError(403, "Faqat o‘zingizga biriktirilgan topshiriq ijrosini yangilashingiz mumkin");
  const progress = Math.max(0, Math.min(100, Math.round(nextProgress(assignment.progress))));
  const assignmentStatus = progress === 100 ? TASK_REVIEW : TASK_IN_PROGRESS;
  await db
    .prepare("UPDATE app_task_assignments SET progress=?, assignment_status=? WHERE id=?")
    .bind(progress, assignmentStatus, assignment.id)
    .run();
  const average = await leafProgress(db, taskId);
  const hasAudience = await db
    .prepare("SELECT 1 AS present FROM app_task_audiences WHERE task_id=? LIMIT 1")
    .bind(taskId)
    .first();
  const allSubmitted = !hasAudience && Number(average?.min_progress ?? progress) === 100;
  const taskStatus = allSubmitted ? TASK_REVIEW : activeStatus(ctx.task.recurring);
  await db
    .prepare(
      "UPDATE app_tasks SET progress=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND archived=0 AND status!=?",
    )
    .bind(Number(average?.progress ?? progress), taskStatus, taskId, TASK_DONE)
    .run();
  return { progress, assignmentStatus, taskStatus, submitted: progress === 100, enrolled };
}

/** Closes the task, cancels its reminders and creates the next recurring period. */
export async function acceptTask(db: D1Database, ctx: TaskContext) {
  const taskId = ctx.task.id;
  await db.batch([
    db
      .prepare(
        "UPDATE app_task_assignments SET assignment_status='Qabul qilindi' WHERE task_id=? AND assignment_status=?",
      )
      .bind(taskId, TASK_REVIEW),
    db
      .prepare("UPDATE app_tasks SET status=?, progress=100, updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(TASK_DONE, taskId),
    cancelTaskJobs(db, taskId, "Topshiriq bajarildi"),
  ]);
  return createNextRecurringTask(taskId, db);
}

/** Sends submitted shares back to work with the giver's note. */
export async function returnTask(db: D1Database, ctx: TaskContext, actorId: number, note: string) {
  const taskId = ctx.task.id;
  const submitted = await db
    .prepare("SELECT employee_id FROM app_task_assignments WHERE task_id=? AND assignment_status=?")
    .bind(taskId, TASK_REVIEW)
    .all<{ employee_id: number }>();
  const employeeIds = submitted.results.map((row) => Number(row.employee_id));
  if (!employeeIds.length && ctx.task.status !== TASK_REVIEW) throw new ApiError(409, "Qaytariladigan ijro topilmadi");
  const status = activeStatus(ctx.task.recurring);
  await db.batch([
    db
      .prepare(
        "UPDATE app_task_assignments SET assignment_status='Qaytarildi', progress=MIN(progress,99) WHERE task_id=? AND assignment_status=?",
      )
      .bind(taskId, TASK_REVIEW),
    db
      .prepare("UPDATE app_tasks SET status=?, progress=MIN(progress,99), updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(status, taskId),
    ...employeeIds.map((employeeId) =>
      db
        .prepare(
          "INSERT INTO app_task_routes (task_id,from_employee_id,to_employee_id,action,note) VALUES (?,?,?,'Qayta ishlashga qaytarildi',?)",
        )
        .bind(taskId, actorId, employeeId, note),
    ),
  ]);
  return { status, employeeIds };
}

export type TaskDetailsInput = {
  title: string;
  description: string;
  deadlineIso: string | null;
  priority: string;
  topicId: number | null;
  recurring: boolean;
  recurrence: string | null;
  notifyTelegram: boolean;
};

/** Edits task fields and cancels queued reminders; returns everyone to re-notify. */
export async function updateTaskDetails(db: D1Database, ctx: TaskContext, input: TaskDetailsInput) {
  const taskId = ctx.task.id;
  // The monthly anchor follows the deadline only when it (or recurrence) is set now.
  const resetAnchor =
    input.recurring && input.deadlineIso && (input.deadlineIso !== ctx.task.deadlineIso || !ctx.task.recurring);
  await db.batch([
    db
      .prepare(
        `UPDATE app_tasks SET title=?, description=?, deadline_iso=?, priority=?, topic_id=?, recurring=?, recurrence=?,
        notify_telegram=?, status=CASE WHEN ?=1 THEN 'Davomiy' WHEN status='Davomiy' THEN 'Jarayonda' ELSE status END,
        recurrence_anchor_day=CASE WHEN ?=1 THEN COALESCE(?, recurrence_anchor_day) ELSE NULL END,
        updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      )
      .bind(
        input.title,
        input.description,
        input.deadlineIso,
        input.priority,
        input.topicId,
        input.recurring ? 1 : 0,
        input.recurring ? input.recurrence : null,
        input.notifyTelegram ? 1 : 0,
        input.recurring ? 1 : 0,
        input.recurring ? 1 : 0,
        resetAnchor ? recurrenceAnchorDay(input.deadlineIso!) : null,
        taskId,
      ),
    cancelTaskJobs(db, taskId, "Topshiriq yangilandi"),
  ]);
  const assignments = await db
    .prepare("SELECT employee_id FROM app_task_assignments WHERE task_id=?")
    .bind(taskId)
    .all<{ employee_id: number }>();
  const audience = await db
    .prepare("SELECT 1 AS present FROM app_task_audiences WHERE task_id=? LIMIT 1")
    .bind(taskId)
    .first();
  return {
    recipients: [
      ...new Set([...assignments.results.map((row) => Number(row.employee_id)), ctx.task.createdByEmployeeId]),
    ],
    hasAudiences: Boolean(audience),
  };
}

/** Hands the actor's share (or the whole task, for its giver) to new executors. */
export async function forwardTask(
  db: D1Database,
  ctx: TaskContext,
  actorId: number,
  assigneeIds: number[],
  note: string,
) {
  const taskId = ctx.task.id;
  const alreadyAssigned = await db
    .prepare(
      `SELECT employee_id FROM app_task_assignments WHERE task_id=? AND employee_id IN (${assigneeIds.map(() => "?").join(",")}) LIMIT 1`,
    )
    .bind(taskId, ...assigneeIds)
    .first();
  if (alreadyAssigned) throw new ApiError(409, "Tanlangan xodimlardan biri bu topshiriqqa allaqachon biriktirilgan");
  const parentRoute = await db
    .prepare("SELECT id FROM app_task_routes WHERE task_id=? AND to_employee_id=? ORDER BY id DESC LIMIT 1")
    .bind(taskId, actorId)
    .first<{ id: number }>();
  await db.batch([
    ...assigneeIds.flatMap((employeeId) => [
      db
        .prepare(
          `INSERT INTO app_task_assignments (task_id, employee_id, assigned_by_employee_id, parent_assignment_id)
        VALUES (?, ?, ?, (SELECT id FROM app_task_assignments WHERE task_id=? AND employee_id=? LIMIT 1))
        ON CONFLICT(task_id,employee_id) DO UPDATE SET assigned_by_employee_id=excluded.assigned_by_employee_id, assignment_status='Faol'`,
        )
        .bind(taskId, employeeId, actorId, taskId, actorId),
      db
        .prepare(
          "INSERT INTO app_task_routes (task_id, from_employee_id, to_employee_id, parent_route_id, action, note) VALUES (?, ?, ?, ?, 'Yo‘naltirildi', ?)",
        )
        .bind(taskId, actorId, employeeId, parentRoute?.id ?? null, note),
    ]),
    ...(ctx.assignment
      ? [
          db
            .prepare("UPDATE app_task_assignments SET assignment_status='Yo‘naltirildi' WHERE id=?")
            .bind(ctx.assignment.id),
        ]
      : []),
  ]);
}

export async function archiveTask(db: D1Database, taskId: number) {
  await db.batch([
    db.prepare("UPDATE app_tasks SET archived=1, updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(taskId),
    cancelTaskJobs(db, taskId, "Topshiriq arxivlandi"),
  ]);
}

export type EmployeeTaskFilter = "active" | "today" | "overdue";

export type EmployeeTaskLine = {
  id: number;
  title: string;
  deadlineIso: string | null;
  status: string;
  progress: number;
};

/** An employee's own open tasks (direct or via audience), never archived ones. */
export async function listEmployeeTasks(
  db: D1Database,
  employeeId: number,
  filter: EmployeeTaskFilter,
  limit = 15,
): Promise<EmployeeTaskLine[]> {
  const condition =
    filter === "today"
      ? "AND date(t.deadline_iso, '+5 hours')=date('now', '+5 hours')"
      : filter === "overdue"
        ? `AND t.deadline_iso < ${SQL_NOW_ISO} AND t.status != 'Bajarildi'`
        : "AND t.status != 'Bajarildi'";
  const rows = await db
    .prepare(
      `SELECT t.id,t.title,t.deadline_iso,t.status,COALESCE(a.progress,t.progress) AS progress
       FROM app_tasks t
       JOIN app_employees recipient ON recipient.id=? AND recipient.active=1
       LEFT JOIN app_task_assignments a ON a.task_id=t.id AND a.employee_id=recipient.id
      WHERE (a.id IS NOT NULL OR EXISTS (
        SELECT 1 FROM app_task_audiences audience WHERE audience.task_id=t.id AND (
          (audience.target_type='department' AND audience.target_id=recipient.department_id)
          OR (audience.target_type='organization' AND (
            audience.target_id=recipient.organization_id
            OR (audience.include_descendants=1 AND audience.target_id IN (
              WITH RECURSIVE ancestors(id) AS (
                SELECT recipient.organization_id
                UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
              ) SELECT id FROM ancestors
            ))
          ))
        )
      )) AND t.archived=0 ${condition} ORDER BY t.deadline_iso LIMIT ?`,
    )
    .bind(employeeId, limit)
    .all<{ id: number; title: string; deadline_iso: string | null; status: string; progress: number | null }>();
  return rows.results.map((row) => ({
    id: Number(row.id),
    title: String(row.title),
    deadlineIso: row.deadline_iso ? String(row.deadline_iso) : null,
    status: String(row.status),
    progress: Number(row.progress ?? 0),
  }));
}
