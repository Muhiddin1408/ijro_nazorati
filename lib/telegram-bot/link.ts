import { getD1, getRuntimeEnv } from "../../db";
import { SQL_NOW_ISO } from "../sql-time";

/** One-time deep links that bind an employee to their Telegram chat. */

export async function createTelegramLink(employeeId: number, createdByEmployeeId: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const token = base64Url(bytes);
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
  const db = await getD1();
  await db.batch([
    db.prepare(`DELETE FROM app_telegram_link_tokens WHERE expires_at <= ${SQL_NOW_ISO} OR used_at IS NOT NULL`),
    db.prepare("DELETE FROM app_telegram_link_tokens WHERE employee_id=? AND used_at IS NULL").bind(employeeId),
    db.prepare(
      "INSERT INTO app_telegram_link_tokens (token_hash, employee_id, expires_at, created_by_employee_id) VALUES (?, ?, ?, ?)",
    ).bind(tokenHash, employeeId, expiresAt, createdByEmployeeId),
  ]);
  const { TELEGRAM_BOT_USERNAME } = await getRuntimeEnv();
  return {
    token,
    expiresAt,
    url: TELEGRAM_BOT_USERNAME ? `https://t.me/${TELEGRAM_BOT_USERNAME.replace(/^@/, "")}?start=${token}` : null,
  };
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function sha256(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
