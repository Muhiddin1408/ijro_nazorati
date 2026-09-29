/** Quiet-hours helpers for Telegram delivery. Wall clock is Asia/Tashkent (UTC+5, no DST). */

export const QUIET_HOURS_TIME_ZONE = "Asia/Tashkent";
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;
const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function normalizeClock(value: unknown, fallback = "22:00"): string {
  if (typeof value !== "string") return fallback;
  const match = CLOCK.exec(value.trim());
  return match ? `${match[1]}:${match[2]}` : fallback;
}

export function isValidClock(value: unknown): value is string {
  return typeof value === "string" && CLOCK.test(value.trim());
}

export function clockMinutes(value: string): number | null {
  const match = CLOCK.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function zonedClockMinutes(date: Date, timeZone = QUIET_HOURS_TIME_ZONE): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

export function isWithinQuietHours(
  now: Date,
  start: string,
  end: string,
  timeZone = QUIET_HOURS_TIME_ZONE,
): boolean {
  const startMin = clockMinutes(start);
  const endMin = clockMinutes(end);
  if (startMin == null || endMin == null || startMin === endMin) return false;
  const nowMin = zonedClockMinutes(now, timeZone);
  if (startMin < endMin) return nowMin >= startMin && nowMin < endMin;
  return nowMin >= startMin || nowMin < endMin;
}

export function nextQuietHoursEnd(now: Date, end: string): Date {
  const endMin = clockMinutes(end);
  if (endMin == null) return new Date(now.getTime() + 60 * 60 * 1000);
  const tashkent = new Date(now.getTime() + TASHKENT_OFFSET_MS);
  const endUtc = Date.UTC(
    tashkent.getUTCFullYear(),
    tashkent.getUTCMonth(),
    tashkent.getUTCDate(),
    Math.floor(endMin / 60),
    endMin % 60,
  ) - TASHKENT_OFFSET_MS;
  if (endUtc > now.getTime()) return new Date(endUtc);
  return new Date(endUtc + 24 * 60 * 60 * 1000);
}
