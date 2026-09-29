import { getD1 } from "../../db";
import { listEmployeeTasks, type EmployeeTaskFilter } from "../../services/tasks";
import { SQL_NOW_ISO } from "../sql-time";
import { sendLongTelegram, sendTelegram } from "./api";
import { sha256 } from "./link";
import { formatTashkent } from "./messages";

/** Private-chat bot commands (/start linking, task and meeting lists). */

export async function handleCommand(text: string, chatId: string, telegramUserId: string, username?: string) {
  const db = await getD1();
  const [command, argument] = text.split(/\s+/, 2);
  if (command === "/start" && argument) {
    const tokenHash = await sha256(argument);
    const token = await db.prepare(
      `SELECT * FROM app_telegram_link_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at > ${SQL_NOW_ISO} LIMIT 1`,
    ).bind(tokenHash).first<Record<string, unknown>>();
    if (!token) {
      await sendTelegram(chatId, "Ulash havolasi yaroqsiz yoki muddati tugagan. Administrator yangi havola yaratishi kerak.");
      return;
    }
    const claimed = await db.prepare("UPDATE app_telegram_link_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=? AND used_at IS NULL")
      .bind(Number(token.id)).run();
    if (!claimed.meta.changes) {
      await sendTelegram(chatId, "Ulash havolasi allaqachon ishlatilgan. Administrator yangi havola yaratishi kerak.");
      return;
    }
    await db.batch([
      db.prepare("DELETE FROM app_telegram_accounts WHERE telegram_user_id=? AND employee_id!=?")
        .bind(telegramUserId, Number(token.employee_id)),
      db.prepare("DELETE FROM app_telegram_accounts WHERE chat_id=? AND employee_id!=?")
        .bind(chatId, Number(token.employee_id)),
      db.prepare(`INSERT INTO app_telegram_accounts (employee_id, telegram_user_id, chat_id, username)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(employee_id) DO UPDATE SET telegram_user_id=excluded.telegram_user_id, chat_id=excluded.chat_id,
          username=excluded.username, notifications_enabled=1, blocked_at=NULL, last_seen_at=CURRENT_TIMESTAMP`)
        .bind(Number(token.employee_id), telegramUserId, chatId, username ?? null),
      db.prepare(`UPDATE app_notification_jobs SET status='pending', next_attempt_at=${SQL_NOW_ISO} WHERE recipient_employee_id=? AND status='waiting_link'`).bind(Number(token.employee_id)),
    ]);
    const employee = await db.prepare("SELECT full_name FROM app_employees WHERE id=?").bind(Number(token.employee_id)).first<{ full_name: string }>();
    await sendTelegram(chatId, `✅ ${employee?.full_name ?? "Xodim"}, Ichki hisobotlarni boshqarish tizimi botiga muvaffaqiyatli ulandingiz.\n\n/vazifalar — topshiriqlar\n/bugun — bugungi muddatlar\n/yigilishlar — yig‘ilishlar\n/yordam — barcha buyruqlar`);
    return;
  }

  const account = await db.prepare(
    `SELECT ta.employee_id, e.full_name FROM app_telegram_accounts ta
      JOIN app_employees e ON e.id=ta.employee_id AND e.active=1
      WHERE ta.telegram_user_id=? AND ta.blocked_at IS NULL LIMIT 1`,
  ).bind(telegramUserId).first<Record<string, unknown>>();
  if (!account) {
    await sendTelegram(chatId, "Avval administrator bergan havola orqali botga ulaning.");
    return;
  }
  await db.prepare("UPDATE app_telegram_accounts SET last_seen_at=CURRENT_TIMESTAMP, username=? WHERE employee_id=?")
    .bind(username ?? null, Number(account.employee_id)).run();

  if (["/vazifalar", "/tasks", "/bugun", "/kechikkan"].includes(command)) {
    const filter: EmployeeTaskFilter = command === "/bugun" ? "today" : command === "/kechikkan" ? "overdue" : "active";
    const tasks = await listEmployeeTasks(db, Number(account.employee_id), filter);
    const lines = tasks.map((task) => `• #${task.id} ${task.title} — ${task.progress}%${task.deadlineIso ? `, ${formatTashkent(new Date(task.deadlineIso))}` : ""}`);
    await sendLongTelegram(chatId, lines.length ? `📌 Sizning topshiriqlaringiz\n${lines.join("\n")}` : "Sizda ushbu bo‘lim bo‘yicha topshiriq yo‘q.");
    return;
  }
  if (["/yigilishlar", "/meetings"].includes(command)) {
    const meetings = await db.prepare(
      `SELECT m.title,m.starts_at FROM app_meetings m
        JOIN app_employees recipient ON recipient.id=? AND recipient.active=1
        LEFT JOIN app_meeting_participants p ON p.meeting_id=m.id AND p.employee_id=recipient.id
       WHERE (p.employee_id IS NOT NULL OR EXISTS (
         SELECT 1 FROM app_meeting_audiences audience WHERE audience.meeting_id=m.id AND (
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
       )) AND m.starts_at >= ${SQL_NOW_ISO} ORDER BY m.starts_at LIMIT 10`,
    ).bind(Number(account.employee_id)).all<Record<string, unknown>>();
    const lines = meetings.results.map((meeting) => `• ${formatTashkent(new Date(String(meeting.starts_at)))} — ${meeting.title}`);
    await sendLongTelegram(chatId, lines.length ? `📅 Yaqin yig‘ilishlar\n${lines.join("\n")}` : "Yaqin yig‘ilish topilmadi.");
    return;
  }
  if (command === "/uzish") {
    await db.prepare("DELETE FROM app_telegram_accounts WHERE employee_id=?").bind(Number(account.employee_id)).run();
    await sendTelegram(chatId, "Telegram hisobi tizimdan uzildi. Qayta ulash uchun yangi havola oling.");
    return;
  }
  await sendTelegram(chatId, `Salom, ${account.full_name}!\n\n/vazifalar — faol topshiriqlar\n/bugun — bugungi muddatlar\n/kechikkan — kechikkan topshiriqlar\n/yigilishlar — yaqin yig‘ilishlar\n/uzish — hisobni uzish`);
}
