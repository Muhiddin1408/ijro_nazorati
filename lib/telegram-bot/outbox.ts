import { getD1, getRuntimeEnv } from "../../db";
import { isWithinQuietHours, nextQuietHoursEnd } from "../quiet-hours";
import { SQL_NOW_ISO, SQL_NOW_ISO_OFFSET } from "../sql-time";
import { json, sendTelegram } from "./api";
import { formatTashkent, siteLink } from "./messages";

/** Notification outbox: enqueueing, reminder hygiene and delivery. */

/** Jobs for employees who never link Telegram expire instead of piling up forever. */
const WAITING_LINK_TTL_HOURS = 24;

export async function telegramStatus() {
  const env = await getRuntimeEnv();
  const db = await getD1();
  const linked = await db
    .prepare("SELECT COUNT(*) AS count FROM app_telegram_accounts WHERE blocked_at IS NULL")
    .first<{ count: number }>();
  const pending = await db
    .prepare("SELECT COUNT(*) AS count FROM app_notification_jobs WHERE status IN ('pending','failed','waiting_link')")
    .first<{ count: number }>();
  return {
    configured: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_WEBHOOK_SECRET),
    botUsername: env.TELEGRAM_BOT_USERNAME ?? null,
    linkedEmployees: Number(linked?.count ?? 0),
    pendingJobs: Number(pending?.count ?? 0),
  };
}

export async function enqueueNotification(input: {
  kind: string;
  entityType: "task" | "meeting" | "chat" | "report";
  entityId: number;
  recipientEmployeeId: number;
  scheduledAt: string;
  idempotencyKey: string;
  text: string;
  replyMarkup?: unknown;
}) {
  await (
    await getD1()
  )
    .prepare(
      `INSERT INTO app_notification_jobs
      (kind, entity_type, entity_id, recipient_employee_id, scheduled_at, next_attempt_at, idempotency_key, payload_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(idempotency_key) DO UPDATE SET
       scheduled_at=excluded.scheduled_at,
       next_attempt_at=excluded.next_attempt_at,
       payload_json=excluded.payload_json,
       status=CASE
         WHEN app_notification_jobs.status IN ('sent','failed_permanent') THEN app_notification_jobs.status
         ELSE 'pending'
       END,
       attempts=CASE
         WHEN app_notification_jobs.status IN ('sent','failed_permanent') THEN app_notification_jobs.attempts
         ELSE 0
       END,
       last_error=CASE
         WHEN app_notification_jobs.status IN ('sent','failed_permanent') THEN app_notification_jobs.last_error
         ELSE NULL
       END`,
    )
    .bind(
      input.kind,
      input.entityType,
      input.entityId,
      input.recipientEmployeeId,
      input.scheduledAt,
      input.scheduledAt,
      input.idempotencyKey,
      json({ text: input.text, replyMarkup: input.replyMarkup }),
    )
    .run();
}

export async function enqueueChatNotifications(input: {
  messageId: number;
  channelId: number;
  senderEmployeeId: number;
  senderName: string;
  channelName: string;
  body: string;
  fileName?: string | null;
}) {
  const db = await getD1();
  // Bot chats are not end-to-end encrypted: only announce that something is
  // waiting in the system. Body, sender and file names stay on our server.
  const text = `💬 Yangi xabar: #${input.channelName}${await siteLink()}`;
  const payload = json({ text });
  await db
    .prepare(
      `INSERT INTO app_notification_jobs
      (kind,entity_type,entity_id,recipient_employee_id,scheduled_at,next_attempt_at,idempotency_key,payload_json)
     SELECT 'chat_message','chat',?,e.id,${SQL_NOW_ISO},${SQL_NOW_ISO},
            'chat:' || ? || ':employee:' || e.id,?
       FROM app_chat_channels c
       JOIN app_employees e ON e.active=1 AND e.id!=?
       JOIN app_telegram_accounts ta
         ON ta.employee_id=e.id AND ta.blocked_at IS NULL AND ta.notifications_enabled=1
      WHERE c.id=? AND c.active=1 AND (
        c.type='broadcast'
        OR (c.type='department' AND c.department_id=e.department_id)
        OR EXISTS (
          SELECT 1 FROM app_chat_members member
           WHERE member.channel_id=c.id AND member.employee_id=e.id
        )
      )
     ON CONFLICT(idempotency_key) DO NOTHING`,
    )
    .bind(input.messageId, input.messageId, payload, input.senderEmployeeId, input.channelId)
    .run();
}

export async function enqueueTaskNotifications(
  task: {
    id: number;
    title: string;
    deadlineIso: string | null;
    priority: string;
  },
  employeeIds: number[],
  creatorEmployeeId?: number,
) {
  const now = new Date();
  const deadline = task.deadlineIso ? new Date(task.deadlineIso) : null;
  for (const employeeId of [...new Set(employeeIds)]) {
    const isCreator = creatorEmployeeId === employeeId;
    const keyboard = isCreator
      ? undefined
      : {
          inline_keyboard: [
            [
              { text: "✅ Qabul qildim", callback_data: `task:${task.id}:accepted` },
              { text: "📤 Tekshiruvga yuborish", callback_data: `task:${task.id}:review` },
            ],
          ],
        };
    await enqueueNotification({
      kind: "task_created",
      entityType: "task",
      entityId: task.id,
      recipientEmployeeId: employeeId,
      scheduledAt: now.toISOString(),
      idempotencyKey: `task:${task.id}:employee:${employeeId}:created`,
      text: isCreator
        ? `✅ Topshiriq ijrochilarga yuborildi\n${task.title}\nUstuvorlik: ${task.priority}${deadline ? `\nMuddat: ${formatTashkent(deadline)}` : ""}`
        : `📌 Yangi topshiriq\n${task.title}\nUstuvorlik: ${task.priority}${deadline ? `\nMuddat: ${formatTashkent(deadline)}` : ""}`,
      replyMarkup: keyboard,
    });
    if (deadline) {
      for (const [kind, offset, label] of [
        ["due_3d", 3 * 24 * 60, "3 kun"],
        ["due_24h", 24 * 60, "1 kun"],
        ["due_3h", 3 * 60, "3 soat"],
        ["due_1h", 60, "1 soat"],
        ["due_15m", 15, "15 daqiqa"],
      ] as const) {
        const at = new Date(deadline.getTime() - offset * 60_000);
        if (at > now)
          await enqueueNotification({
            kind,
            entityType: "task",
            entityId: task.id,
            recipientEmployeeId: employeeId,
            scheduledAt: at.toISOString(),
            idempotencyKey: `task:${task.id}:employee:${employeeId}:${kind}:${deadline.toISOString()}`,
            text: `${isCreator ? "📊 Nazorat eslatmasi" : "⏰ Topshiriq muddati yaqinlashmoqda"}\n${task.title}\nMuddatgacha: ${label}\nMuddat: ${formatTashkent(deadline)}`,
            replyMarkup: keyboard,
          });
      }
    }
  }
}

async function enqueueAudienceNotification(input: {
  entityType: "task" | "meeting";
  entityId: number;
  kind: string;
  scheduledAt: string;
  idempotencySuffix: string;
  text: string;
}) {
  const db = await getD1();
  const audienceTable = input.entityType === "task" ? "app_task_audiences" : "app_meeting_audiences";
  const entityColumn = input.entityType === "task" ? "task_id" : "meeting_id";
  await db
    .prepare(
      `WITH RECURSIVE organization_targets(target_id,id) AS (
       SELECT target_id,target_id FROM ${audienceTable}
        WHERE ${entityColumn}=? AND target_type='organization'
       UNION ALL
       SELECT scope.target_id,child.id FROM app_organizations child
        JOIN organization_targets scope ON child.parent_id=scope.id
        JOIN ${audienceTable} audience ON audience.${entityColumn}=? AND audience.target_type='organization'
          AND audience.target_id=scope.target_id AND audience.include_descendants=1
        WHERE child.active=1
     ), recipients(id) AS (
       SELECT DISTINCT employee.id FROM app_employees employee
        JOIN app_telegram_accounts ta ON ta.employee_id=employee.id
          AND ta.blocked_at IS NULL AND ta.notifications_enabled=1
        WHERE employee.active=1 AND (
          employee.organization_id IN (SELECT id FROM organization_targets)
          OR EXISTS (SELECT 1 FROM ${audienceTable} audience
            WHERE audience.${entityColumn}=? AND audience.target_type='department' AND audience.target_id=employee.department_id)
        )
     )
     INSERT INTO app_notification_jobs
       (kind,entity_type,entity_id,recipient_employee_id,scheduled_at,next_attempt_at,idempotency_key,payload_json)
     SELECT ?,?,?,recipient.id,?,?,? || recipient.id || ?,? FROM recipients recipient
      WHERE 1=1 -- required: without WHERE SQLite parses ON CONFLICT as a join constraint
     -- An edit cancels queued jobs first; re-enqueueing the same key revives it
     -- (already sent or permanently failed jobs are left alone).
     ON CONFLICT(idempotency_key) DO UPDATE SET
       scheduled_at=excluded.scheduled_at,
       next_attempt_at=excluded.next_attempt_at,
       payload_json=excluded.payload_json,
       status=CASE WHEN app_notification_jobs.status IN ('sent','failed_permanent') THEN app_notification_jobs.status ELSE 'pending' END,
       attempts=CASE WHEN app_notification_jobs.status IN ('sent','failed_permanent') THEN app_notification_jobs.attempts ELSE 0 END,
       last_error=CASE WHEN app_notification_jobs.status IN ('sent','failed_permanent') THEN app_notification_jobs.last_error ELSE NULL END`,
    )
    .bind(
      input.entityId,
      input.entityId,
      input.entityId,
      input.kind,
      input.entityType,
      input.entityId,
      input.scheduledAt,
      input.scheduledAt,
      `${input.entityType}:${input.entityId}:employee:`,
      input.idempotencySuffix,
      json({ text: input.text }),
    )
    .run();
}

export async function enqueueTaskAudienceNotifications(task: {
  id: number;
  title: string;
  deadlineIso: string | null;
  priority: string;
}) {
  const now = new Date();
  const deadline = task.deadlineIso ? new Date(task.deadlineIso) : null;
  await enqueueAudienceNotification({
    entityType: "task",
    entityId: task.id,
    kind: "task_created",
    scheduledAt: now.toISOString(),
    idempotencySuffix: ":created",
    text: `📌 Yangi topshiriq\n${task.title}\nUstuvorlik: ${task.priority}${deadline ? `\nMuddat: ${formatTashkent(deadline)}` : ""}`,
  });
  if (!deadline) return;
  for (const [kind, offset, label] of [
    ["due_3d", 3 * 24 * 60, "3 kun"],
    ["due_24h", 24 * 60, "1 kun"],
    ["due_3h", 3 * 60, "3 soat"],
    ["due_1h", 60, "1 soat"],
    ["due_15m", 15, "15 daqiqa"],
  ] as const) {
    const at = new Date(deadline.getTime() - offset * 60_000);
    if (at <= now) continue;
    await enqueueAudienceNotification({
      entityType: "task",
      entityId: task.id,
      kind,
      scheduledAt: at.toISOString(),
      idempotencySuffix: `:${kind}:${deadline.toISOString()}`,
      text: `⏰ Topshiriq muddati yaqinlashmoqda\n${task.title}\nMuddatgacha: ${label}\nMuddat: ${formatTashkent(deadline)}`,
    });
  }
}

export async function enqueueTaskChangeNotifications(
  task: {
    id: number;
    title: string;
    deadlineIso: string | null;
    priority: string;
  },
  employeeIds: number[],
) {
  const changeId = crypto.randomUUID();
  for (const employeeId of employeeIds) {
    await enqueueNotification({
      kind: "task_updated",
      entityType: "task",
      entityId: task.id,
      recipientEmployeeId: employeeId,
      scheduledAt: new Date().toISOString(),
      idempotencyKey: `task:${task.id}:employee:${employeeId}:updated:${changeId}`,
      text: `✏️ Topshiriq yangilandi\n${task.title}\nUstuvorlik: ${task.priority}${task.deadlineIso ? `\nMuddat: ${formatTashkent(new Date(task.deadlineIso))}` : ""}`,
    });
  }
}

/** Tells the task giver an executor submitted their share (web and Telegram alike). */
export async function enqueueTaskReviewRequested(
  task: { id: number; title: string; creatorEmployeeId: number },
  submittedByEmployeeId: number,
) {
  await enqueueNotification({
    kind: "task_review_requested",
    entityType: "task",
    entityId: task.id,
    recipientEmployeeId: task.creatorEmployeeId,
    scheduledAt: new Date().toISOString(),
    idempotencyKey: `task:${task.id}:employee:${task.creatorEmployeeId}:review:${submittedByEmployeeId}:${crypto.randomUUID()}`,
    text: `📥 Topshiriq tekshiruvga yuborildi\n${task.title}${await siteLink()}`,
  });
}

export async function enqueueMeetingNotifications(
  meeting: {
    id: number;
    title: string;
    startsAt: string;
    place: string;
    reminderMinutes: number;
  },
  employeeIds: number[],
) {
  const startsAt = new Date(meeting.startsAt);
  const offsets = Array.from(new Set([1440, 60, 15, meeting.reminderMinutes]))
    .filter((value) => value > 0)
    .sort((a, b) => b - a);
  for (const employeeId of employeeIds) {
    await enqueueNotification({
      kind: "meeting_created",
      entityType: "meeting",
      entityId: meeting.id,
      recipientEmployeeId: employeeId,
      scheduledAt: new Date().toISOString(),
      idempotencyKey: `meeting:${meeting.id}:employee:${employeeId}:created`,
      text: `📅 Yangi yig‘ilish\n${meeting.title}\n${formatTashkent(startsAt)}`,
    });
    for (const offset of offsets) {
      const at = new Date(startsAt.getTime() - offset * 60_000);
      if (at > new Date())
        await enqueueNotification({
          kind: `meeting_${offset}m`,
          entityType: "meeting",
          entityId: meeting.id,
          recipientEmployeeId: employeeId,
          scheduledAt: at.toISOString(),
          idempotencyKey: `meeting:${meeting.id}:employee:${employeeId}:${offset}:${startsAt.toISOString()}`,
          text: `🔔 Yig‘ilish eslatmasi\n${meeting.title}\n${formatTashkent(startsAt)}`,
        });
    }
  }
}

export async function enqueueMeetingAudienceNotifications(meeting: {
  id: number;
  title: string;
  startsAt: string;
  place: string;
  reminderMinutes: number;
}) {
  const startsAt = new Date(meeting.startsAt);
  const now = new Date();
  const text = `📅 Yangi yig‘ilish\n${meeting.title}\n${formatTashkent(startsAt)}`;
  await enqueueAudienceNotification({
    entityType: "meeting",
    entityId: meeting.id,
    kind: "meeting_created",
    scheduledAt: now.toISOString(),
    idempotencySuffix: ":created",
    text,
  });
  const offsets = Array.from(new Set([1440, 60, 15, meeting.reminderMinutes]))
    .filter((value) => value > 0)
    .sort((a, b) => b - a);
  for (const offset of offsets) {
    const at = new Date(startsAt.getTime() - offset * 60_000);
    if (at <= now) continue;
    await enqueueAudienceNotification({
      entityType: "meeting",
      entityId: meeting.id,
      kind: `meeting_${offset}m`,
      scheduledAt: at.toISOString(),
      idempotencySuffix: `:${offset}:${startsAt.toISOString()}`,
      text: `🔔 Yig‘ilish eslatmasi\n${meeting.title}\n${formatTashkent(startsAt)}`,
    });
  }
}

export async function enqueueMeetingChangeNotifications(
  meeting: {
    id: number;
    title: string;
    startsAt: string;
    place: string;
  },
  employeeIds: number[],
  change: "updated" | "cancelled" | "removed" = "updated",
) {
  const changeId = crypto.randomUUID();
  for (const employeeId of employeeIds) {
    await enqueueNotification({
      kind:
        change === "cancelled"
          ? "meeting_cancelled"
          : change === "removed"
            ? "meeting_participant_removed"
            : "meeting_updated",
      entityType: "meeting",
      entityId: meeting.id,
      recipientEmployeeId: employeeId,
      scheduledAt: new Date().toISOString(),
      idempotencyKey: `meeting:${meeting.id}:employee:${employeeId}:${change}:${changeId}`,
      text:
        change === "cancelled"
          ? `❌ Yig‘ilish bekor qilindi\n${meeting.title}\n${formatTashkent(new Date(meeting.startsAt))}`
          : change === "removed"
            ? `ℹ️ Siz yig‘ilish ishtirokchilari ro‘yxatidan chiqarildingiz\n${meeting.title}\n${formatTashkent(new Date(meeting.startsAt))}`
            : `✏️ Yig‘ilish ma’lumotlari yangilandi\n${meeting.title}\n${formatTashkent(new Date(meeting.startsAt))}`,
    });
  }
}

export async function enqueueReportNotification(input: {
  assignmentId: number;
  employeeId: number;
  title: string;
  deadlineAt: string;
  kind: "report_assigned" | "report_submitted" | "report_approved" | "report_returned";
}) {
  const deadline = new Date(input.deadlineAt);
  const labels: Record<typeof input.kind, string> = {
    report_assigned: "📊 Yangi hisobot topshirig‘i",
    report_submitted: "📥 Hisobot ko‘rib chiqish uchun yuborildi",
    report_approved: "✅ Hisobot tasdiqlandi",
    report_returned: "↩️ Hisobot tuzatish uchun qaytarildi",
  };
  await enqueueNotification({
    kind: input.kind,
    entityType: "report",
    entityId: input.assignmentId,
    recipientEmployeeId: input.employeeId,
    scheduledAt: new Date().toISOString(),
    idempotencyKey: `report:${input.assignmentId}:employee:${input.employeeId}:${input.kind}:${crypto.randomUUID()}`,
    text: `${labels[input.kind]}\n${input.title}\nMuddat: ${formatTashkent(deadline)}`,
  });
  if (input.kind !== "report_assigned") return;
  for (const [kind, offset, label] of [
    ["report_due_3d", 3 * 24 * 60, "3 kun"],
    ["report_due_24h", 24 * 60, "1 kun"],
    ["report_due_3h", 3 * 60, "3 soat"],
  ] as const) {
    const at = new Date(deadline.getTime() - offset * 60_000);
    if (at <= new Date()) continue;
    await enqueueNotification({
      kind,
      entityType: "report",
      entityId: input.assignmentId,
      recipientEmployeeId: input.employeeId,
      scheduledAt: at.toISOString(),
      idempotencyKey: `report:${input.assignmentId}:employee:${input.employeeId}:${kind}:${deadline.toISOString()}`,
      text: `⏰ Hisobot muddati yaqinlashmoqda\n${input.title}\nMuddatgacha: ${label}\nMuddat: ${formatTashkent(deadline)}`,
    });
  }
}

const REMINDER_KIND_SQL = `(kind LIKE 'due\\_%' ESCAPE '\\' OR kind LIKE 'report\\_due\\_%' ESCAPE '\\' OR kind GLOB 'meeting_[0-9]*m')`;

/** Minutes between a reminder's scheduled time and the deadline it announces. */
export function reminderLeadMinutes(kind: string): number | null {
  const fixed: Record<string, number> = {
    due_3d: 4320,
    due_24h: 1440,
    due_3h: 180,
    due_1h: 60,
    due_15m: 15,
    report_due_3d: 4320,
    report_due_24h: 1440,
    report_due_3h: 180,
  };
  if (kind in fixed) return fixed[kind];
  const meeting = /^meeting_(\d+)m$/.exec(kind);
  return meeting ? Number(meeting[1]) : null;
}

/** A reminder that can only arrive after the deadline it warns about is noise. */
export function reminderIsStale(kind: string, scheduledAt: string, deliverAt: Date) {
  const lead = reminderLeadMinutes(kind);
  if (lead == null) return false;
  const scheduled = new Date(scheduledAt).getTime();
  if (!Number.isFinite(scheduled)) return false;
  return deliverAt.getTime() >= scheduled + lead * 60_000;
}

async function expireStaleNotificationJobs(db: D1Database) {
  await db.batch([
    db
      .prepare(
        `UPDATE app_notification_jobs SET status='cancelled', last_error='Telegram ulanmagan: muddati tugadi'
        WHERE status='waiting_link' AND created_at <= datetime('now', ?)`,
      )
      .bind(`-${WAITING_LINK_TTL_HOURS} hours`),
    // When several reminders for the same item are already due (quiet hours,
    // downtime), only the most recent one is still meaningful.
    db.prepare(
      `UPDATE app_notification_jobs SET status='cancelled', last_error='Keyingi eslatma bilan almashtirildi'
        WHERE status IN ('pending','failed','waiting_link') AND ${REMINDER_KIND_SQL}
          AND EXISTS (
            SELECT 1 FROM app_notification_jobs newer
             WHERE newer.id<>app_notification_jobs.id AND newer.entity_type=app_notification_jobs.entity_type
               AND newer.entity_id=app_notification_jobs.entity_id
               AND newer.recipient_employee_id=app_notification_jobs.recipient_employee_id
               AND newer.status IN ('pending','failed','waiting_link')
               AND (newer.kind LIKE 'due\\_%' ESCAPE '\\' OR newer.kind LIKE 'report\\_due\\_%' ESCAPE '\\' OR newer.kind GLOB 'meeting_[0-9]*m')
               AND newer.scheduled_at > app_notification_jobs.scheduled_at
               AND newer.scheduled_at <= ${SQL_NOW_ISO}
          )`,
    ),
  ]);
}

export async function processNotificationJobs(limit = 25) {
  const db = await getD1();
  await expireStaleNotificationJobs(db);
  const result = await db
    .prepare(
      `SELECT j.*, ta.chat_id, ta.quiet_hours_enabled, ta.quiet_hours_start, ta.quiet_hours_end
       FROM app_notification_jobs j
       JOIN app_employees recipient ON recipient.id=j.recipient_employee_id AND recipient.active=1
       LEFT JOIN app_telegram_accounts ta ON ta.employee_id=j.recipient_employee_id AND ta.blocked_at IS NULL AND ta.notifications_enabled=1
      WHERE j.status IN ('pending','failed','waiting_link','processing')
        AND j.next_attempt_at <= ${SQL_NOW_ISO} AND j.attempts < 6
        AND (
          (j.entity_type='task' AND EXISTS (
            SELECT 1 FROM app_tasks t WHERE t.id=j.entity_id AND t.archived=0 AND t.status!='Bajarildi'
          ))
          OR
          (j.entity_type='meeting' AND (
            j.kind IN ('meeting_cancelled','meeting_participant_removed')
            OR EXISTS (
              SELECT 1 FROM app_meetings m WHERE m.id=j.entity_id AND m.starts_at >= strftime('%Y-%m-%dT%H:%M:%fZ','now','-5 minutes')
            )
          ))
          OR
          (j.entity_type='chat' AND EXISTS (
            SELECT 1 FROM app_chat_messages message
             WHERE message.id=j.entity_id AND message.deleted_at IS NULL
          ))
          OR
          (j.entity_type='report' AND EXISTS (
            SELECT 1 FROM app_report_assignments report
             WHERE report.id=j.entity_id AND (
               j.kind IN ('report_approved','report_returned')
               OR report.status NOT IN ('approved')
             )
          ))
        )
      ORDER BY j.next_attempt_at LIMIT ?`,
    )
    .bind(limit)
    .all<Record<string, unknown>>();

  let sent = 0;
  for (const job of result.results) {
    const id = Number(job.id);
    const claimed = await db
      .prepare(
        `UPDATE app_notification_jobs SET status='processing', next_attempt_at=strftime('%Y-%m-%dT%H:%M:%fZ','now','+10 minutes')
        WHERE id=? AND status IN ('pending','failed','waiting_link','processing') AND next_attempt_at <= ${SQL_NOW_ISO}`,
      )
      .bind(id)
      .run();
    if (!claimed.meta.changes) continue;
    const kind = String(job.kind);
    const cancelStale = () =>
      db
        .prepare(
          "UPDATE app_notification_jobs SET status='cancelled', last_error='Muddat o‘tib ketgan eslatma' WHERE id=?",
        )
        .bind(id)
        .run();
    if (reminderIsStale(kind, String(job.scheduled_at), new Date())) {
      await cancelStale();
      continue;
    }
    if (!job.chat_id) {
      await db
        .prepare(
          "UPDATE app_notification_jobs SET status='waiting_link', next_attempt_at=strftime('%Y-%m-%dT%H:%M:%fZ','now','+1 hour') WHERE id=?",
        )
        .bind(id)
        .run();
      continue;
    }
    if (Number(job.quiet_hours_enabled) === 1) {
      const start = String(job.quiet_hours_start ?? "22:00");
      const end = String(job.quiet_hours_end ?? "07:00");
      const now = new Date();
      if (isWithinQuietHours(now, start, end)) {
        const resumeAt = nextQuietHoursEnd(now, end);
        if (reminderIsStale(kind, String(job.scheduled_at), resumeAt)) await cancelStale();
        else
          await db
            .prepare("UPDATE app_notification_jobs SET status='pending', next_attempt_at=? WHERE id=?")
            .bind(resumeAt.toISOString(), id)
            .run();
        continue;
      }
    }
    let payload: { text: string; replyMarkup?: unknown };
    try {
      payload = JSON.parse(String(job.payload_json)) as { text: string; replyMarkup?: unknown };
      if (!payload || typeof payload.text !== "string" || !payload.text.trim()) throw new Error("Xabar matni yo‘q");
    } catch {
      await db
        .prepare(
          "UPDATE app_notification_jobs SET status='failed_permanent', attempts=attempts+1, last_error='Xabar ma’lumoti buzilgan' WHERE id=?",
        )
        .bind(id)
        .run();
      continue;
    }
    const delivered = await sendTelegram(String(job.chat_id), payload.text, payload.replyMarkup);
    if (delivered.ok) {
      sent += 1;
      await db
        .prepare(
          "UPDATE app_notification_jobs SET status='sent', sent_at=CURRENT_TIMESTAMP, telegram_message_id=?, last_error=NULL WHERE id=?",
        )
        .bind(delivered.messageId ?? null, id)
        .run();
    } else if (delivered.rateLimited) {
      // Telegram throttles the whole bot: retry this job later without spending
      // an attempt, and stop the batch instead of hammering the API.
      const delay = Math.max(1, Math.min(3600, Number(delivered.retryAfter ?? 30)));
      await db
        .prepare(
          `UPDATE app_notification_jobs SET status='pending', last_error=?, next_attempt_at=${SQL_NOW_ISO_OFFSET} WHERE id=?`,
        )
        .bind(delivered.error ?? "Telegram 429", `+${delay} seconds`, id)
        .run();
      break;
    } else if (delivered.permanent) {
      const statements = [
        db
          .prepare(
            "UPDATE app_notification_jobs SET status='failed_permanent', attempts=attempts+1, last_error=? WHERE id=?",
          )
          .bind(delivered.error ?? "Telegram rad etdi", id),
      ];
      if (delivered.blockAccount) {
        statements.push(
          db
            .prepare("UPDATE app_telegram_accounts SET blocked_at=CURRENT_TIMESTAMP WHERE employee_id=?")
            .bind(Number(job.recipient_employee_id)),
        );
      }
      await db.batch(statements);
    } else {
      const attempts = Number(job.attempts ?? 0) + 1;
      const delay = delivered.retryAfter ?? Math.min(3600, 30 * 2 ** attempts);
      await db
        .prepare(
          `UPDATE app_notification_jobs SET status=?, attempts=?, last_error=?, next_attempt_at=${SQL_NOW_ISO_OFFSET}
          WHERE id=?`,
        )
        .bind(
          attempts >= 6 ? "failed_permanent" : "failed",
          attempts,
          delivered.error ?? "Yuborilmadi",
          `+${delay} seconds`,
          id,
        )
        .run();
    }
  }
  return { processed: result.results.length, sent };
}
