import { getRuntimeEnv } from "../../../../../db";
import { apiError, assertSameOrigin, audit, publicOrigin, requireActor } from "../../../../../lib/auth";
import { authorize } from "../../../../../lib/policy";
import { telegramConfigure } from "../../../../../lib/policy/admin";

type TelegramApiResponse = { ok: boolean; description?: string; result?: { username?: string } | boolean };

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(telegramConfigure(actor));
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, SITE_BASE_URL } = await getRuntimeEnv();
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_WEBHOOK_SECRET) {
      return Response.json({ error: "Bot tokeni va webhook siri server muhitida sozlanmagan" }, { status: 503 });
    }
    const baseUrl = (SITE_BASE_URL || publicOrigin(request)).replace(/\/$/, "");
    const getMeResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const getMe = (await getMeResponse.json()) as TelegramApiResponse;
    if (!getMeResponse.ok || !getMe.ok)
      return Response.json({ error: getMe.description ?? "Bot tokeni tasdiqlanmadi" }, { status: 502 });
    const webhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `${baseUrl}/api/telegram/webhook`,
        secret_token: TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: false,
      }),
    });
    const webhook = (await webhookResponse.json()) as TelegramApiResponse;
    if (!webhookResponse.ok || !webhook.ok)
      return Response.json({ error: webhook.description ?? "Webhook o‘rnatilmadi" }, { status: 502 });
    const username = typeof getMe.result === "object" ? (getMe.result.username ?? null) : null;
    await audit(actor, "telegram.webhook_configured", "integration", null, { username, baseUrl });
    return Response.json({ ok: true, username, webhookUrl: `${baseUrl}/api/telegram/webhook` });
  } catch (error) {
    return apiError(error);
  }
}
