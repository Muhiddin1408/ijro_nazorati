export const REPORT_TIME_ZONE = "Asia/Tashkent";

type CalendarParts = { year: number; month: number; day: number };

const calendarFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: REPORT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function localDateTimeParts(date: Date) {
  const values = Object.fromEntries(calendarFormatter.formatToParts(date)
    .filter((part) => part.type !== "literal")
    .map((part) => [part.type, Number(part.value)]));
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function shiftedCalendar(parts: CalendarParts, input: { days?: number; months?: number; years?: number }) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (input.years) date.setUTCFullYear(date.getUTCFullYear() + input.years);
  if (input.months) date.setUTCMonth(date.getUTCMonth() + input.months);
  if (input.days) date.setUTCDate(date.getUTCDate() + input.days);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/** Convert a Tashkent wall-clock time into its UTC instant without using the host timezone. */
function tashkentInstant(parts: CalendarParts, hour = 0, minute = 0, second = 0) {
  const target = Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute, second);
  let candidate = target;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const local = localDateTimeParts(new Date(candidate));
    const represented = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
    const correction = target - represented;
    candidate += correction;
    if (correction === 0) break;
  }
  return new Date(candidate);
}

function dateKey(parts: CalendarParts) {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

/** Always anchor repeated deadlines to the original Tashkent calendar day. */
export function nextReportDeadline(first: Date, after: Date, frequency: string): Date | null {
  if (!Number.isFinite(first.getTime()) || !Number.isFinite(after.getTime())) throw new Error("Hisobot muddati noto‘g‘ri");
  if (frequency === "one_time") return null;
  if (frequency === "weekly") {
    const week = 7 * 86_400_000;
    return new Date(first.getTime() + Math.max(1, Math.floor((after.getTime() - first.getTime()) / week) + 1) * week);
  }
  const stride = frequency === "monthly" ? 1 : frequency === "quarterly" ? 3 : frequency === "yearly" ? 12 : 0;
  if (!stride) return null;
  const anchor = localDateTimeParts(first), current = localDateTimeParts(after);
  let occurrence = Math.max(1, Math.floor(((current.year - anchor.year) * 12 + current.month - anchor.month) / stride));
  for (;;) {
    const target = shiftedCalendar({ year: anchor.year, month: anchor.month, day: 1 }, { months: occurrence * stride });
    target.day = Math.min(anchor.day, new Date(Date.UTC(target.year, target.month, 0)).getUTCDate());
    const next = tashkentInstant(target, anchor.hour, anchor.minute, anchor.second);
    next.setUTCMilliseconds(first.getUTCMilliseconds());
    if (next > after) return next;
    occurrence += 1;
  }
}

export function reportCycleParts(deadline: Date, frequency: string) {
  if (Number.isNaN(deadline.getTime())) throw new Error("Hisobot muddati noto‘g‘ri");
  const local = localDateTimeParts(deadline);
  const localDate = { year: local.year, month: local.month, day: local.day };
  let startParts: CalendarParts = { year: local.year, month: local.month, day: 1 };
  let nextParts = shiftedCalendar(startParts, { months: 1 });
  let label = new Intl.DateTimeFormat("uz-UZ", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "long",
  }).format(deadline);

  if (frequency === "weekly") {
    const weekday = (new Date(Date.UTC(local.year, local.month - 1, local.day)).getUTCDay() + 6) % 7;
    startParts = shiftedCalendar(localDate, { days: -weekday });
    nextParts = shiftedCalendar(startParts, { days: 7 });
  } else if (frequency === "quarterly") {
    const quarter = Math.floor((local.month - 1) / 3);
    startParts = { year: local.year, month: quarter * 3 + 1, day: 1 };
    nextParts = shiftedCalendar(startParts, { months: 3 });
    label = `${local.year}-yil ${quarter + 1}-chorak`;
  } else if (frequency === "yearly") {
    startParts = { year: local.year, month: 1, day: 1 };
    nextParts = { year: local.year + 1, month: 1, day: 1 };
    label = `${local.year}-yil`;
  } else if (frequency === "one_time") {
    return {
      periodKey: `${frequency}:${dateKey(localDate)}`,
      periodLabel: "Bir martalik hisobot",
      periodStart: deadline.toISOString(),
      periodEnd: deadline.toISOString(),
    };
  }

  const start = tashkentInstant(startParts);
  const end = new Date(tashkentInstant(nextParts).getTime() - 1000);
  if (frequency === "weekly") {
    const dayMonth = new Intl.DateTimeFormat("uz-UZ", { timeZone: REPORT_TIME_ZONE, day: "2-digit", month: "short" });
    const dayMonthYear = new Intl.DateTimeFormat("uz-UZ", { timeZone: REPORT_TIME_ZONE, day: "2-digit", month: "short", year: "numeric" });
    label = `${dayMonth.format(start)} — ${dayMonthYear.format(end)}`;
  }
  return {
    periodKey: `${frequency}:${dateKey(localDate)}`,
    periodLabel: label,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
}
