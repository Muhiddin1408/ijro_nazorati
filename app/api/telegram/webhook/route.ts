import { apiError } from "../../../../lib/auth";
import { handleTelegramUpdate, verifyWebhookSecret } from "../../../../lib/telegram";

export async function POST(request: Request) {
  try {
    if (!(await verifyWebhookSecret(request.headers.get("x-telegram-bot-api-secret-token")))) {
      return Response.json({ error: "Webhook tasdiqlanmadi" }, { status: 401 });
    }
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return Response.json({ error: "JSON talab etiladi" }, { status: 415 });
    }
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > 1024 * 1024) return Response.json({ error: "So‘rov juda katta" }, { status: 413 });
    const update = (await request.json()) as { update_id?: number };
    if (!Number.isInteger(update.update_id))
      return Response.json({ error: "Telegram update_id yo‘q" }, { status: 400 });
    await handleTelegramUpdate(update as Parameters<typeof handleTelegramUpdate>[0]);
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
