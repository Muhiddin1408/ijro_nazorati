import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// lib/auth runs for real against a file-backed SqliteD1Database; only the
// request headers and the db module lookup are replaced.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'next/headers') return { url: 'test:next-headers', shortCircuit: true };
    if (/(?:^|\/)db$/.test(specifier) && context.parentURL?.includes('/lib/')) return { url: 'test:db', shortCircuit: true };
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    const sources = {
      'test:next-headers': 'export async function headers(){return globalThis.perfRuntime.headers}',
      'test:db': 'export async function getD1(){return globalThis.perfRuntime.db} export async function getRuntimeEnv(){return {DB:globalThis.perfRuntime.db}}',
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const { SqliteD1Database } = await import('../db/sqlite-d1.ts');
const auth = await import('../lib/auth.ts');

const dir = mkdtempSync(join(tmpdir(), 'ijro-perf-'));
const db = new SqliteD1Database(join(dir, 'perf.sqlite'));
const migrations = new URL('../drizzle/', import.meta.url);
const names = readdirSync(migrations).filter((name) => /^\d{4}.*\.sql$/.test(name)).sort();
for (const name of names.filter((name) => name < '0036')) db.database.exec(readFileSync(new URL(name, migrations), 'utf8'));
globalThis.perfRuntime = { db, headers: new Headers() };

test.after(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

function plan(sql, ...binds) {
  return db.database.prepare(`EXPLAIN QUERY PLAN ${sql}`).all(...binds).map((row) => row.detail).join(' | ');
}

test('0036 normalizes legacy CURRENT_TIMESTAMP values to ISO so plain comparisons stay correct', () => {
  const admin = db.database.prepare("SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local'").get();
  db.database.prepare(`INSERT INTO app_notification_jobs
    (kind,entity_type,entity_id,recipient_employee_id,scheduled_at,next_attempt_at,idempotency_key,payload_json)
    VALUES ('chat_message','chat',1,?,'2026-01-02 03:04:05','2026-01-02 03:04:05','legacy-format','{}')`).run(admin.id);
  db.database.prepare("INSERT INTO app_sessions (token_hash,employee_id,expires_at) VALUES ('legacy',?,'2099-01-01 00:00:00')").run(admin.id);
  db.database.exec(readFileSync(new URL('0036_timestamp_formats_and_indexes.sql', migrations), 'utf8'));
  for (const name of names.filter((name) => name > '0036')) db.database.exec(readFileSync(new URL(name, migrations), 'utf8'));
  const job = db.database.prepare("SELECT scheduled_at,next_attempt_at FROM app_notification_jobs WHERE idempotency_key='legacy-format'").get();
  assert.deepEqual({ ...job }, { scheduled_at: '2026-01-02T03:04:05.000Z', next_attempt_at: '2026-01-02T03:04:05.000Z' });
  assert.equal(db.database.prepare("SELECT expires_at FROM app_sessions WHERE token_hash='legacy'").get().expires_at, '2099-01-01T00:00:00.000Z');
});

test('session lookup honors the exact expiry boundary without datetime() on the column', async () => {
  const admin = db.database.prepare("SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local'").get();
  const session = (token, expiresAt) => {
    const hash = createHash('sha256').update(token).digest('hex');
    db.database.prepare('INSERT INTO app_sessions (token_hash,employee_id,expires_at) VALUES (?,?,?)').run(hash, admin.id, expiresAt);
  };
  session('alive-token', new Date(Date.now() + 2_000).toISOString());
  session('expired-token', new Date(Date.now() - 2_000).toISOString());

  globalThis.perfRuntime.headers = new Headers({ cookie: 'ijro_session=alive-token' });
  assert.equal((await auth.requireActor()).id, admin.id);
  globalThis.perfRuntime.headers = new Headers({ cookie: 'ijro_session=expired-token' });
  await assert.rejects(auth.requireActor(), (error) => error.status === 401);

  const source = readFileSync(new URL('../lib/auth.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /datetime\(expires_at\)/);
});

test('hot queries are index searches, not table scans', () => {
  const now = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";
  assert.match(plan(`SELECT employee_id FROM app_sessions WHERE token_hash=? AND expires_at>${now}`, 'x'), /SEARCH app_sessions USING (COVERING )?INDEX/);
  assert.match(
    plan("SELECT COUNT(*) FROM app_audit_logs WHERE actor_employee_id=? AND action='information.ai_request' AND created_at>=datetime('now','-1 day')", 1),
    /SEARCH app_audit_logs USING (COVERING )?INDEX app_audit_logs_actor_created_idx \(actor_employee_id=\? AND created_at>\?\)/,
  );
  assert.match(
    plan(`SELECT id FROM app_notification_jobs WHERE status IN ('pending','failed') AND next_attempt_at <= ${now} ORDER BY next_attempt_at LIMIT 10`),
    /SEARCH app_notification_jobs USING (COVERING )?INDEX app_notification_jobs_due_idx \(status=\? AND next_attempt_at<\?\)/,
  );
  assert.match(plan('SELECT id FROM app_employees WHERE lower(email)=?', 'a@b.c'), /USING (COVERING )?INDEX app_employees_email_lower_idx/);
  assert.match(plan('SELECT id FROM app_task_assignments WHERE parent_assignment_id=?', 1), /USING (COVERING )?INDEX app_task_assignments_parent_idx/);
  assert.match(plan('SELECT id FROM app_information_records WHERE organization_id=? ORDER BY created_at DESC', 1), /USING (COVERING )?INDEX app_information_records_organization_idx/);
  assert.match(plan('SELECT deadline_at FROM app_report_cycles WHERE template_id=? ORDER BY deadline_at DESC LIMIT 1', 1), /USING (COVERING )?INDEX app_report_cycles_template_deadline_idx/);
});

test('one active occupancy per employee and position is enforced', () => {
  const position = db.database.prepare('SELECT id FROM app_staff_positions LIMIT 1').get();
  const admin = db.database.prepare("SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local'").get();
  const insert = db.database.prepare("INSERT INTO app_position_occupancies (staff_position_id,employee_id,fte_rate,starts_at,ends_at) VALUES (?,?,1,'2026-01-01',NULL)");
  insert.run(position.id, admin.id);
  assert.throws(() => insert.run(position.id, admin.id), /UNIQUE/);
});

test('adapter reuses compiled statements and logs slow queries', async () => {
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (message) => warnings.push(String(message));
  try {
    const statement = db.prepare('SELECT ? AS value');
    for (let index = 0; index < 50; index += 1) assert.equal(await statement.bind(index).first('value'), index);
    await db.prepare(`WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<3000000) SELECT COUNT(*) AS c FROM n`).first();
  } finally {
    console.warn = originalWarn;
  }
  assert.ok(warnings.some((message) => message.startsWith('Slow SQL') && message.includes('WITH RECURSIVE')));
  assert.equal(db.database.prepare('PRAGMA temp_store').get().temp_store, 2);
  assert.equal(db.database.prepare('PRAGMA cache_size').get().cache_size, -65536);
  db.optimize();
});
