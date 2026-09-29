import { getD1 } from "../../../../db";
import { apiError, assertSameOrigin, audit, requireActor } from "../../../../lib/auth";
import { isValidClock, normalizeClock } from "../../../../lib/quiet-hours";

/**
 * Telegram notification preferences.
 * Backed by app_telegram_accounts: mute + quiet hours (Asia/Tashkent).
 */

type TelegramPrefsRow = {
  notifications_enabled: number;
  quiet_hours_enabled: number | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  username: string | null;
  blocked_at: string | null;
};

function serializePrefs(account: TelegramPrefsRow | null) {
  return {
    telegramLinked: Boolean(account) && !account?.blocked_at,
    notificationsEnabled: account ? Boolean(account.notifications_enabled) : true,
    telegramUsername: account?.username ?? null,
    quietHoursEnabled: Boolean(account?.quiet_hours_enabled),
    quietHoursStart: normalizeClock(account?.quiet_hours_start, "22:00"),
    quietHoursEnd: normalizeClock(account?.quiet_hours_end, "07:00"),
  };
}

export async function GET(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const account = await (
      await getD1()
    )
      .prepare(
        `SELECT notifications_enabled, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, username, blocked_at
           FROM app_telegram_accounts
          WHERE employee_id = ?`,
      )
      .bind(actor.id)
      .first<TelegramPrefsRow>();

    return Response.json(serializePrefs(account));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const payload = (await request.json()) as {
      notificationsEnabled?: boolean;
      quietHoursEnabled?: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
    };

    if (typeof payload.notificationsEnabled !== "boolean") {
      return Response.json({ error: "notificationsEnabled boolean talab etiladi" }, { status: 400 });
    }

    const quietHoursEnabled = Boolean(payload.quietHoursEnabled);
    const quietHoursStart = payload.quietHoursStart == null ? "22:00" : payload.quietHoursStart;
    const quietHoursEnd = payload.quietHoursEnd == null ? "07:00" : payload.quietHoursEnd;
    if (!isValidClock(quietHoursStart) || !isValidClock(quietHoursEnd)) {
      return Response.json({ error: "Tinch soatlar HH:MM formatida bo‘lishi kerak" }, { status: 400 });
    }
    if (quietHoursEnabled && quietHoursStart === quietHoursEnd) {
      return Response.json({ error: "Tinch soatlar boshlanishi va tugashi bir xil bo‘lmasin" }, { status: 400 });
    }

    const db = await getD1();
    const account = await db
      .prepare(
        `SELECT notifications_enabled, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, username, blocked_at
           FROM app_telegram_accounts
          WHERE employee_id = ?`,
      )
      .bind(actor.id)
      .first<TelegramPrefsRow>();

    if (!account) {
      return Response.json({ error: "Avval Telegram hisobini ulang" }, { status: 409 });
    }
    if (account.blocked_at) {
      return Response.json({ error: "Telegram aloqasi bloklangan; qayta ulang" }, { status: 409 });
    }

    await db
      .prepare(
        `UPDATE app_telegram_accounts
            SET notifications_enabled = ?,
                quiet_hours_enabled = ?,
                quiet_hours_start = ?,
                quiet_hours_end = ?
          WHERE employee_id = ?`,
      )
      .bind(payload.notificationsEnabled ? 1 : 0, quietHoursEnabled ? 1 : 0, quietHoursStart, quietHoursEnd, actor.id)
      .run();

    await audit(actor, "telegram.preferences_updated", "employee", actor.id, {
      notificationsEnabled: payload.notificationsEnabled,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
    });

    return Response.json({
      ok: true,
      ...serializePrefs({
        ...account,
        notifications_enabled: payload.notificationsEnabled ? 1 : 0,
        quiet_hours_enabled: quietHoursEnabled ? 1 : 0,
        quiet_hours_start: quietHoursStart,
        quiet_hours_end: quietHoursEnd,
      }),
    });
  } catch (error) {
    return apiError(error);
  }
}
