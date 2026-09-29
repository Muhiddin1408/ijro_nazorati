import { getRuntimeEnv } from "../../db";

/** Low-level Telegram Bot API calls and delivery-error classification. */

/** Telegram rejects messages longer than 4096 characters. */
export const TELEGRAM_MESSAGE_LIMIT = 4000;

type TelegramResponse = {
  ok: boolean;
  result?: { message_id?: number };
  description?: string;
  parameters?: { retry_after?: number };
};

export type TelegramDelivery = {
  ok: boolean;
  messageId?: string;
  permanent?: boolean;
  blockAccount?: boolean;
  rateLimited?: boolean;
  retryAfter?: number;
  error?: string;
};

export function json(value: unknown) {
  return JSON.stringify(value);
}

export async function sendTelegram(chatId: string, text: string, replyMarkup?: unknown): Promise<TelegramDelivery> {
  const { TELEGRAM_BOT_TOKEN } = await getRuntimeEnv();
  if (!TELEGRAM_BOT_TOKEN) return { ok: false, permanent: false, error: "Bot tokeni sozlanmagan" };

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json({ chat_id: chatId, text, reply_markup: replyMarkup }),
      signal: AbortSignal.timeout(12_000),
    });
    const body = await response.json() as TelegramResponse;
    if (response.ok && body.ok) return { ok: true, messageId: String(body.result?.message_id ?? "") };
    return {
      ok: false,
      // 400 means this one message is unusable; only 403 means the user blocked the bot.
      permanent: response.status === 400 || response.status === 403,
      blockAccount: response.status === 403,
      rateLimited: response.status === 429,
      retryAfter: body.parameters?.retry_after,
      error: body.description ?? `Telegram ${response.status}`,
    };
  } catch (error) {
    return { ok: false, permanent: false, error: error instanceof Error ? error.message : "Telegram tarmoq xatosi" };
  }
}

/** Splits a list reply on line boundaries so every part fits Telegram's limit. */
export function splitTelegramText(text: string, limit = TELEGRAM_MESSAGE_LIMIT) {
  const parts: string[] = [];
  let current = "";
  for (const rawLine of text.split("\n")) {
    const line = rawLine.length > limit ? `${rawLine.slice(0, limit - 1)}…` : rawLine;
    if (current && current.length + 1 + line.length > limit) {
      parts.push(current);
      current = line;
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }
  if (current) parts.push(current);
  return parts;
}

export async function sendLongTelegram(chatId: string, text: string) {
  for (const part of splitTelegramText(text)) {
    const delivered = await sendTelegram(chatId, part);
    if (!delivered.ok) return delivered;
  }
  return { ok: true };
}

export async function answerCallback(callbackQueryId: string, text: string) {
  const { TELEGRAM_BOT_TOKEN } = await getRuntimeEnv();
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json({ callback_query_id: callbackQueryId, text }),
  }).catch(() => undefined);
}
