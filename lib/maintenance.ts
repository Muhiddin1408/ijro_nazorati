import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { getD1 } from "../db";

const BACKUP_PATTERN = /^ijro-\d{4}-\d{2}-\d{2}\.sqlite$/;

function backupDirectory() {
  const databasePath = resolve(process.env.DATABASE_PATH ?? "data/ijro.sqlite");
  return process.env.BACKUP_DIR ? resolve(process.env.BACKUP_DIR) : join(dirname(databasePath), "backups");
}

const DAY_MS = 24 * 60 * 60_000;
/** The audit trigger refuses to delete rows younger than a year, whatever is configured. */
const MIN_AUDIT_RETENTION_DAYS = 365;

function daysBefore(now: Date, days: number) {
  return new Date(now.getTime() - days * DAY_MS).toISOString();
}

async function existingTables(db: D1Database, names: string[]) {
  const rows = await db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name IN (${names.map(() => "?").join(",")})`)
    .bind(...names)
    .all<{ name: string }>();
  return new Set(rows.results.map((row) => row.name));
}

/**
 * Retention: audit rows older than AUDIT_RETENTION_DAYS (default 3 years, never under 1),
 * expired sessions, spent activation/Telegram link tokens (after 30 days), finished
 * notification jobs (after 90 days) and stale login-attempt windows. Comparisons use
 * julianday() because these columns mix ISO and CURRENT_TIMESTAMP formats; the job
 * runs once a day, so the full scan is acceptable.
 */
export async function pruneRetainedData(db: D1Database, now = new Date()) {
  const tables = await existingTables(db, [
    "app_audit_logs",
    "app_maintenance_lock",
    "app_sessions",
    "app_account_activation_tokens",
    "app_telegram_link_tokens",
    "app_notification_jobs",
    "app_login_attempts",
  ]);
  const nowIso = now.toISOString();
  const auditDays = Math.max(MIN_AUDIT_RETENTION_DAYS, Number(process.env.AUDIT_RETENTION_DAYS ?? 1095) || 1095);
  const removed: Record<string, number> = {};
  const changes = (result: D1Result) => Number(result.meta.changes ?? 0);

  if (tables.has("app_audit_logs") && tables.has("app_maintenance_lock")) {
    // The only sanctioned delete path: the trigger allows it while this lock row exists.
    const [, audit] = await db.batch([
      db.prepare("INSERT OR REPLACE INTO app_maintenance_lock (id,reason) VALUES (1,'audit_retention')"),
      db.prepare("DELETE FROM app_audit_logs WHERE julianday(created_at) < julianday(?)").bind(daysBefore(now, auditDays)),
      db.prepare("DELETE FROM app_maintenance_lock WHERE id=1"),
    ]);
    removed.audit = changes(audit);
  }
  if (tables.has("app_sessions")) {
    removed.sessions = changes(
      await db.prepare("DELETE FROM app_sessions WHERE julianday(expires_at) < julianday(?)").bind(nowIso).run(),
    );
  }
  if (tables.has("app_account_activation_tokens")) {
    removed.activationTokens = changes(
      await db
        .prepare(
          `DELETE FROM app_account_activation_tokens
            WHERE (used_at IS NOT NULL OR revoked_at IS NOT NULL OR julianday(expires_at) < julianday(?))
              AND julianday(created_at) < julianday(?)`,
        )
        .bind(nowIso, daysBefore(now, 30))
        .run(),
    );
  }
  if (tables.has("app_telegram_link_tokens")) {
    removed.telegramLinkTokens = changes(
      await db
        .prepare(
          `DELETE FROM app_telegram_link_tokens
            WHERE (used_at IS NOT NULL OR julianday(expires_at) < julianday(?)) AND julianday(created_at) < julianday(?)`,
        )
        .bind(nowIso, daysBefore(now, 30))
        .run(),
    );
  }
  if (tables.has("app_notification_jobs")) {
    removed.notificationJobs = changes(
      await db
        .prepare(
          `DELETE FROM app_notification_jobs
            WHERE status IN ('sent','cancelled','failed_permanent') AND julianday(created_at) < julianday(?)`,
        )
        .bind(daysBefore(now, 90))
        .run(),
    );
  }
  if (tables.has("app_login_attempts")) {
    removed.loginAttempts = changes(
      await db
        .prepare("DELETE FROM app_login_attempts WHERE julianday(window_start) < julianday(?)")
        .bind(daysBefore(now, 1))
        .run(),
    );
  }
  return removed;
}

/**
 * Daily database maintenance: a consistent online snapshot (VACUUM INTO),
 * retention of the newest `keepDays` snapshots, data retention and PRAGMA optimize.
 */
export async function runDailyMaintenance(now = new Date(), keepDays = Number(process.env.BACKUP_KEEP_DAYS ?? 14)) {
  const db = await getD1();
  const directory = backupDirectory();
  await mkdir(directory, { recursive: true });
  const name = `ijro-${now.toISOString().slice(0, 10)}.sqlite`;
  const target = join(directory, name);
  let created = false;
  try {
    await stat(target);
  } catch {
    // VACUUM INTO refuses to overwrite, so a same-day rerun is a no-op.
    await db.prepare("VACUUM INTO ?").bind(target).run();
    created = true;
  }
  const backups = (await readdir(directory)).filter((file) => BACKUP_PATTERN.test(file)).sort();
  const expired = backups.slice(0, Math.max(0, backups.length - Math.max(1, keepDays)));
  for (const file of expired) await rm(join(directory, file), { force: true });
  // Prune only after the day's snapshot exists, so deleted rows remain recoverable.
  const pruned = await pruneRetainedData(db, now);
  await db.prepare("PRAGMA optimize").run();
  return { backup: name, created, removed: expired.length, pruned };
}
