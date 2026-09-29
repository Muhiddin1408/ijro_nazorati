/**
 * Timestamp conventions for SQL comparisons.
 *
 * Two text formats exist in the database and must never be compared with each
 * other lexically:
 *  - ISO-8601 written by JS `toISOString()`: `2026-09-29T10:00:00.000Z`
 *    (session/token expiries, deadlines, meeting starts, notification jobs);
 *  - SQLite `CURRENT_TIMESTAMP`: `2026-09-29 10:00:00` (`created_at`,
 *    `updated_at` defaults, login rate-limit windows).
 *
 * Compare a column only with "now" in its own format and never wrap the column
 * in `datetime(...)`: a bare column comparison lets SQLite use its index.
 */

/** Current time in the ISO format JS writes; constant within one statement. */
export const SQL_NOW_ISO = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";

/** ISO "now" shifted by a bound modifier such as `'+10 minutes'`. */
export const SQL_NOW_ISO_OFFSET = "strftime('%Y-%m-%dT%H:%M:%fZ','now',?)";

/** Current time in `CURRENT_TIMESTAMP` format, for columns with that default. */
export const SQL_NOW = "datetime('now')";

export function nowIso() {
  return new Date().toISOString();
}
