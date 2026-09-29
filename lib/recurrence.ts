import { getD1 } from "../db";
import { mapTask, type TaskRow } from "../services/task-rows";

const recurrences = new Set(["Har kuni", "Har hafta", "Har oy", "Har chorak"]);

export const DEFAULT_TIMEZONE = "Asia/Tashkent";

type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ms: number;
};

/** Wall-clock parts of an instant in a time zone (month is 1-based). */
export function zonedParts(date: Date, timeZone: string): LocalParts {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    ms: date.getUTCMilliseconds(),
  };
}

/** The instant whose wall-clock time in `timeZone` equals `local` (two-pass offset correction). */
function fromZoned(local: LocalParts, timeZone: string) {
  const wallAsUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second, local.ms);
  let instant = wallAsUtc;
  for (let pass = 0; pass < 2; pass += 1) {
    const seen = zonedParts(new Date(instant), timeZone);
    const seenAsUtc = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute, seen.second, seen.ms);
    instant += wallAsUtc - seenAsUtc;
  }
  return new Date(instant);
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Day of month (1–31) of a deadline in the application time zone — the monthly anchor. */
export function recurrenceAnchorDay(deadlineIso: string, timeZone = DEFAULT_TIMEZONE) {
  const date = new Date(deadlineIso);
  return Number.isNaN(date.getTime()) ? null : zonedParts(date, timeZone).day;
}

function advance(local: LocalParts, recurrence: string, anchorDay: number): LocalParts {
  if (recurrence === "Har kuni" || recurrence === "Har hafta") {
    const shifted = new Date(Date.UTC(local.year, local.month - 1, local.day + (recurrence === "Har kuni" ? 1 : 7)));
    return { ...local, year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
  }
  const months = recurrence === "Har oy" ? 1 : 3;
  const index = local.year * 12 + (local.month - 1) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  // Clamp to the month length but always start from the anchor, so 31 Jan → 28 Feb → 31 Mar.
  return { ...local, year, month, day: Math.min(anchorDay, daysInMonth(year, month)) };
}

/**
 * Next deadline of a recurring task, computed on the wall clock of `timeZone`
 * (time of day is preserved) and never earlier than `now`.
 */
export function nextRecurringDeadline(
  deadlineIso: string,
  recurrence: string,
  now = new Date(),
  anchorDay?: number | null,
  timeZone = process.env.APP_TIMEZONE || DEFAULT_TIMEZONE,
) {
  if (!recurrences.has(recurrence)) return null;
  const start = new Date(deadlineIso);
  if (Number.isNaN(start.getTime())) return null;
  let local = zonedParts(start, timeZone);
  const anchor = anchorDay && anchorDay >= 1 && anchorDay <= 31 ? anchorDay : local.day;
  let next = fromZoned((local = advance(local, recurrence, anchor)), timeZone);
  for (let index = 0; index < 1000 && next <= now; index += 1)
    next = fromZoned((local = advance(local, recurrence, anchor)), timeZone);
  return next.toISOString();
}

export async function createNextRecurringTask(sourceTaskId: number, database?: D1Database) {
  const db = database ?? (await getD1());
  const sourceRow = await db
    .prepare(
      `SELECT * FROM app_tasks
      WHERE id=? AND recurring=1 AND archived=0 AND status='Bajarildi'
        AND deadline_iso IS NOT NULL AND recurrence IS NOT NULL`,
    )
    .bind(sourceTaskId)
    .first<TaskRow>();
  if (!sourceRow) return null;
  const source = mapTask(sourceRow);

  const anchorDay =
    sourceRow.recurrence_anchor_day != null
      ? Number(sourceRow.recurrence_anchor_day)
      : recurrenceAnchorDay(source.deadlineIso ?? "", process.env.APP_TIMEZONE || DEFAULT_TIMEZONE);
  const deadlineIso = nextRecurringDeadline(source.deadlineIso ?? "", source.recurrence ?? "", new Date(), anchorDay);
  if (!deadlineIso) return null;

  const result = await db
    .prepare(
      `INSERT OR IGNORE INTO app_tasks
      (title, description, deadline_iso, priority, status, progress, recurring, recurrence,
       notify_telegram, topic_id, created_by_employee_id, recurrence_parent_task_id, recurrence_anchor_day)
     VALUES (?, ?, ?, ?, 'Davomiy', 0, 1, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      source.title,
      source.description,
      deadlineIso,
      source.priority,
      source.recurrence,
      source.notifyTelegram ? 1 : 0,
      source.topicId,
      source.createdByEmployeeId,
      sourceTaskId,
      anchorDay,
    )
    .run();

  const nextRow = await db
    .prepare("SELECT * FROM app_tasks WHERE recurrence_parent_task_id=? LIMIT 1")
    .bind(sourceTaskId)
    .first<TaskRow>();
  if (!nextRow) return null;
  const nextTask = mapTask(nextRow);

  const assignments = await db
    .prepare(
      `SELECT employee_id, assigned_by_employee_id
       FROM app_task_assignments
      WHERE task_id=? AND parent_assignment_id IS NULL
        -- Audience members join each period themselves; only direct executors carry over.
        AND NOT EXISTS (
          SELECT 1 FROM app_task_routes route
           WHERE route.task_id=app_task_assignments.task_id AND route.to_employee_id=app_task_assignments.employee_id
             AND route.action='Auditoriyadan qabul qilindi'
        )
      ORDER BY id`,
    )
    .bind(sourceTaskId)
    .all<{ employee_id: number; assigned_by_employee_id: number }>();
  const employeeIds = assignments.results.map((row) => Number(row.employee_id));
  for (let offset = 0; offset < assignments.results.length; offset += 40) {
    const chunk = assignments.results.slice(offset, offset + 40);
    await db.batch(
      chunk.flatMap((row) => [
        db
          .prepare(
            "INSERT OR IGNORE INTO app_task_assignments (task_id, employee_id, assigned_by_employee_id) VALUES (?, ?, ?)",
          )
          .bind(nextTask.id, Number(row.employee_id), Number(row.assigned_by_employee_id)),
        db
          .prepare(
            `INSERT INTO app_task_routes (task_id, from_employee_id, to_employee_id, action, note)
         SELECT ?,?,?, 'Davomiy topshiriq yangilandi',?
          WHERE NOT EXISTS (
            SELECT 1 FROM app_task_routes
             WHERE task_id=? AND from_employee_id=? AND to_employee_id=?
               AND action='Davomiy topshiriq yangilandi'
          )`,
          )
          .bind(
            nextTask.id,
            Number(row.assigned_by_employee_id),
            Number(row.employee_id),
            `${sourceTaskId}-topshiriqning keyingi davri`,
            nextTask.id,
            Number(row.assigned_by_employee_id),
            Number(row.employee_id),
          ),
      ]),
    );
  }
  await db
    .prepare(
      `INSERT OR IGNORE INTO app_task_audiences
      (task_id,target_type,target_id,include_descendants,created_by_employee_id)
     SELECT ?,target_type,target_id,include_descendants,created_by_employee_id
       FROM app_task_audiences WHERE task_id=?`,
    )
    .bind(nextTask.id, sourceTaskId)
    .run();
  const audienceCount = await db
    .prepare("SELECT COUNT(*) AS count FROM app_task_audiences WHERE task_id=?")
    .bind(nextTask.id)
    .first<{ count: number }>();

  await db
    .prepare(
      `INSERT INTO app_audit_logs (actor_employee_id, action, entity_type, entity_id, detail_json)
     SELECT NULL,'task.recurrence_created','task',?,?
      WHERE NOT EXISTS (
        SELECT 1 FROM app_audit_logs
         WHERE action='task.recurrence_created' AND entity_type='task' AND entity_id=?
      )`,
    )
    .bind(nextTask.id, JSON.stringify({ sourceTaskId, deadlineIso }), nextTask.id)
    .run();

  return {
    id: nextTask.id,
    title: nextTask.title,
    deadlineIso,
    priority: nextTask.priority,
    notifyTelegram: nextTask.notifyTelegram,
    creatorEmployeeId: source.createdByEmployeeId,
    employeeIds,
    hasAudiences: Number(audienceCount?.count ?? 0) > 0,
    created: Boolean(result.meta.changes),
  };
}
