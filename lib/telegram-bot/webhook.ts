import { getD1, getRuntimeEnv } from "../../db";
import { loadTaskContext, reportTaskProgress } from "../../services/tasks";
import { taskSubmit } from "../policy/tasks";
import { answerCallback, json, sendTelegram } from "./api";
import { handleCommand } from "./commands";
import { enqueueTaskReviewRequested, processNotificationJobs } from "./outbox";

/** Webhook entry: update de-duplication, command and callback dispatch. */

export type TelegramUpdate = {
  update_id: number;
  message?: {
    text?: string;
    chat: { id: number; type: string };
    from?: { id: number; username?: string };
  };
  callback_query?: {
    id: string;
    data?: string;
    from: { id: number; username?: string };
    message?: { chat: { id: number } };
  };
};

export async function verifyWebhookSecret(value: string | null) {
  const { TELEGRAM_WEBHOOK_SECRET } = await getRuntimeEnv();
  if (!TELEGRAM_WEBHOOK_SECRET || !value) return false;
  const a = new TextEncoder().encode(TELEGRAM_WEBHOOK_SECRET);
  const b = new TextEncoder().encode(value);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const db = await getD1();
  const inserted = await db.prepare("INSERT OR IGNORE INTO app_telegram_updates (update_id, status) VALUES (?, 'processing')")
    .bind(update.update_id).run();
  // Every update is executed at most once. A handler may already have
  // changed data or sent messages before failing, so a Telegram retry of the
  // same update_id must never run it again.
  if (!inserted.meta.changes) return { duplicate: true };

  try {
    if (update.callback_query) await handleCallback(update.callback_query);
    else if (update.message?.text && update.message.from && update.message.chat.type === "private") {
      await handleCommand(update.message.text.trim(), String(update.message.chat.id), String(update.message.from.id), update.message.from.username);
    }
    await db.prepare("UPDATE app_telegram_updates SET status='processed', processed_at=CURRENT_TIMESTAMP WHERE update_id=?").bind(update.update_id).run();
  } catch (error) {
    await db.prepare("UPDATE app_telegram_updates SET status='failed', detail=?, processed_at=CURRENT_TIMESTAMP WHERE update_id=?")
      .bind(error instanceof Error ? error.message.slice(0, 500) : "Noma’lum xato", update.update_id).run();
    console.error("Telegram update failed", update.update_id, error);
    return { ok: false };
  }
  await processNotificationJobs(10).catch((error) => console.error("Telegram queue processing failed", error));
  return { ok: true };
}

async function handleCallback(callback: NonNullable<TelegramUpdate["callback_query"]>) {
  const chatId = String(callback.message?.chat.id ?? callback.from.id);
  const db = await getD1();
  const account = await db.prepare("SELECT employee_id FROM app_telegram_accounts WHERE telegram_user_id=? AND blocked_at IS NULL")
    .bind(String(callback.from.id)).first<{ employee_id: number }>();
  // "done" is accepted from keyboards sent before the review step existed.
  const match = callback.data?.match(/^task:(\d+):(accepted|review|done)$/);
  if (!account || !match) {
    await answerCallback(callback.id, "Amal tasdiqlanmadi");
    return;
  }
  const taskId = Number(match[1]);
  const employeeId = Number(account.employee_id);
  // The bot acts as the linked employee with no elevated rights: it can only
  // acknowledge or submit for review, never accept (services/tasks.ts).
  const telegramActor = { id: employeeId, permissions: { canCreateTask: false, canUpdateAnyTask: false } };
  const ctx = await loadTaskContext(db, taskId, employeeId);
  if (!ctx || ctx.task.archived || ctx.task.status === "Bajarildi") {
    await answerCallback(callback.id, "Topshiriq yopilgan yoki arxivlangan");
    return;
  }
  if (!taskSubmit(telegramActor, ctx).allowed) {
    await answerCallback(callback.id, "Bu topshiriq sizga biriktirilmagan");
    return;
  }
  const review = match[2] !== "accepted";
  const result = await reportTaskProgress(
    db,
    ctx,
    employeeId,
    (current) => review ? 100 : Math.min(99, Math.max(10, current)),
    "Telegram orqali auditoriyadan",
  );
  if (result.submitted && ctx.task.createdByEmployeeId !== employeeId) {
    await enqueueTaskReviewRequested({ id: taskId, title: ctx.task.title, creatorEmployeeId: ctx.task.createdByEmployeeId }, employeeId);
  }
  await db.prepare("INSERT INTO app_audit_logs (actor_employee_id, action, entity_type, entity_id, detail_json) VALUES (?, ?, 'task', ?, ?)")
    .bind(employeeId, review ? "task.telegram_review_requested" : "task.telegram_accepted", taskId, json({ source: "telegram", progress: result.progress })).run();
  await answerCallback(callback.id, review ? "Tekshiruvga yuborildi" : "Topshiriq qabul qilindi");
  await sendTelegram(chatId, review
    ? `📤 #${taskId} topshiriq tekshiruvga yuborildi. Topshiriq beruvchi qabul qilgach yopiladi.`
    : `✅ #${taskId} topshiriq qabul qilindi.`);
}
