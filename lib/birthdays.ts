import { getD1 } from "../db";

/** Wall clock is Asia/Tashkent (UTC+5, no DST), like the rest of the scheduling code. */
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export type BirthdayPerson = { id: number; name: string; position: string; department: string };
export type TodaysBirthdays = { date: string; mine: boolean; people: BirthdayPerson[] };

/** Today's Tashkent date (`YYYY-MM-DD`) and the `MM-DD` keys celebrated on it; 29 Feb moves to 28 Feb in common years. */
export function birthdayKeysFor(now = new Date()) {
  const date = new Date(now.getTime() + TASHKENT_OFFSET_MS).toISOString().slice(0, 10);
  const year = Number(date.slice(0, 4));
  const key = date.slice(5);
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return { date, keys: key === "02-28" && !leap ? [key, "02-29"] : [key] };
}

/**
 * Active colleagues (same organization) whose birthday is today, plus whether it is the viewer's own.
 * Only names and positions leave the server: birth dates and ages are restricted profile data.
 */
export async function todaysBirthdays(
  actor: { id: number; organizationId: number | null },
  now = new Date(),
): Promise<TodaysBirthdays> {
  const { date, keys } = birthdayKeysFor(now);
  const db = await getD1();
  const result = await db
    .prepare(
      `SELECT e.id, e.full_name, e.position, d.name AS department
         FROM app_employee_profiles p
         JOIN app_employees e ON e.id=p.employee_id
         LEFT JOIN app_departments d ON d.id=e.department_id
        WHERE e.active=1 AND substr(p.birth_date,6,5) IN (${keys.map(() => "?").join(",")})
          AND (e.id=? OR ? IS NULL OR e.organization_id=?)
        ORDER BY e.full_name
        LIMIT 50`,
    )
    .bind(...keys, actor.id, actor.organizationId, actor.organizationId)
    .all<Record<string, unknown>>();
  const rows = result.results.map((row) => ({
    id: Number(row.id),
    name: String(row.full_name),
    position: String(row.position ?? ""),
    department: String(row.department ?? ""),
  }));
  return { date, mine: rows.some((row) => row.id === actor.id), people: rows.filter((row) => row.id !== actor.id) };
}
