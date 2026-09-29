/** Keep both coordinates in their original position while a form is incomplete. */
export function joinCoordinates(latitude: string, longitude: string) {
  if (!latitude.trim() && !longitude.trim()) return "";
  return `${latitude.trim()}, ${longitude.trim()}`;
}

/** A client must save the revision it actually read, never silently refresh it. */
export function informationVersionMatches(expected: unknown, current: number) {
  return typeof expected === "number" && Number.isSafeInteger(expected) && expected >= 0 && expected === current;
}

export function inferInformationPeriod(
  periodStart: string | null,
  periodEnd: string | null,
  values: Record<string, unknown>,
) {
  const value = String(values.davr ?? values.period ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number(value.slice(0, 4)) < 1000 || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error("INVALID_PERIOD");
    return { periodStart: periodStart ?? value, periodEnd: periodEnd ?? value };
  }
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    if (year < 1000 || month < 1 || month > 12) throw new Error("INVALID_PERIOD");
    const date = new Date(0);
    date.setUTCFullYear(year, month, 0);
    const lastDay = date.getUTCDate();
    return { periodStart: periodStart ?? `${value}-01`, periodEnd: periodEnd ?? `${value}-${String(lastDay).padStart(2, "0")}` };
  }
  if (/^\d{4}$/.test(value)) {
    if (Number(value) < 1000) throw new Error("INVALID_PERIOD");
    return { periodStart: periodStart ?? `${value}-01-01`, periodEnd: periodEnd ?? `${value}-12-31` };
  }
  return { periodStart, periodEnd };
}
