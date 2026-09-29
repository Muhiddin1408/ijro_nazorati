import { getD1 } from "../../../../db";
import { apiError, assertSameOrigin, requireActor } from "../../../../lib/auth";
import { authorize } from "../../../../lib/policy";
import { telegramTestFor } from "../../../../lib/policy/admin";
import { sendTelegram } from "../../../../lib/telegram";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const payload = (await request.json()) as { employeeId?: number };
    const employeeId = Number(payload.employeeId ?? actor.id);
    await authorize(telegramTestFor(actor, employeeId));
    const account = await (
      await getD1()
    )
      .prepare(
        `SELECT ta.chat_id FROM app_telegram_accounts ta
        JOIN app_employees e ON e.id=ta.employee_id AND e.active=1
       WHERE ta.employee_id=? AND ta.blocked_at IS NULL AND ta.notifications_enabled=1`,
      )
      .bind(employeeId)
      .first<{ chat_id: string }>();
    if (!account) return Response.json({ error: "Xodim Telegram botiga ulanmagan" }, { status: 409 });
    const delivered = await sendTelegram(
      account.chat_id,
      "✅ Ichki hisobotlarni boshqarish tizimi bilan aloqa ishlayapti. Topshiriq va yig‘ilish eslatmalari shu chatga yuboriladi.",
    );
    if (!delivered.ok)
      return Response.json({ error: delivered.error ?? "Telegram xabari yuborilmadi" }, { status: 502 });
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
