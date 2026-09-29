import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Real route handlers against an in-memory SQLite database with every
// migration applied. Only the session lookup and Telegram delivery are mocked.
registerHooks({
  resolve(specifier, context, next) {
    if (/(?:^|\/)db$/.test(specifier)) return { url: 'test:db', shortCircuit: true };
    if (/(?:^|\/)lib\/auth$/.test(specifier) || (context.parentURL?.includes('/lib/') && specifier === './auth')) return { url: 'test:auth', shortCircuit: true };
    if (/(?:^|\/)(?:lib\/)?telegram$/.test(specifier)) return { url: 'test:telegram', shortCircuit: true };
    if (/(?:^|\/)(?:lib\/)?background$/.test(specifier)) return { url: 'test:background', shortCircuit: true };
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    const sources = {
      'test:db': 'export async function getD1(){return globalThis.authRuntime.db} export async function getRuntimeEnv(){return {}}',
      'test:telegram': 'export async function createTelegramLink(){return {url:"https://t.me/test?start=x",expiresAt:"2099-01-01T00:00:00Z"}} export async function enqueueChatNotifications(){} export async function processNotificationJobs(){}',
      'test:background': 'export function runInBackground(){}',
      'test:auth': `export class ApiError extends Error {constructor(status,message){super(message);this.status=status}}
        export function apiError(error){if(!(error instanceof ApiError))console.error(error);return Response.json({error:error.message},{status:error.status??500})}
        export function assertSameOrigin(){} export function isSecureRequest(){return false} export function publicOrigin(request){return new URL(request.url).origin} export function requirePermission(actor,key){if(!actor.permissions[key])throw new ApiError(403,'Denied')}
        export async function requireActor(){return globalThis.authRuntime.actor}
        export async function organizationScopeIds(){return globalThis.authRuntime.organizationIds}
        export async function audit(actor,action,entityType,entityId,detail={}){globalThis.authRuntime.database.prepare('INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,?,?,?,?)').run(actor?.id??null,action,entityType,entityId,JSON.stringify(detail))}`,
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const employees = await import('../app/api/admin/employees/route.ts');
const { pruneRetainedData } = await import('../lib/maintenance.ts');
const { multipartPartLimit } = await import('../app/api/chat/files/route.ts');

function fixture() {
  const database = new DatabaseSync(':memory:');
  const dir = new URL('../drizzle/', import.meta.url);
  for (const name of withSyntheticSeed(readdirSync(dir).filter(name => /^\d{4}.*\.sql$/.test(name) && !name.includes('_private_')).sort())) database.exec(readFileSync(new URL(name, dir), 'utf8'));
  const db = {
    prepare(sql) {
      let bindings = [];
      return {
        bind(...values) { bindings = values; return this; },
        async first() { return database.prepare(sql).get(...bindings) ?? null; },
        async all() { return { results: database.prepare(sql).all(...bindings) }; },
        async run() {
          const statement = database.prepare(sql);
          if (statement.columns().length) return { results: statement.all(...bindings), meta: { changes: 0 } };
          const result = statement.run(...bindings);
          return { results: [], meta: { changes: result.changes, last_row_id: Number(result.lastInsertRowid) } };
        },
      };
    },
    async batch(statements) {
      database.exec('BEGIN');
      try { const results = []; for (const statement of statements) results.push(await statement.run()); database.exec('COMMIT'); return results; }
      catch (error) { database.exec('ROLLBACK'); throw error; }
    },
  };
  const organization = database.prepare("SELECT id,type FROM app_organizations WHERE type='territorial' AND active=1 ORDER BY id LIMIT 1").get();
  const roleId = code => database.prepare('SELECT id FROM app_roles WHERE code=?').get(code).id;
  const employee = (name, role = 'xodim', position = 'Mutaxassis') => Number(database.prepare(
    'INSERT INTO app_employees (full_name,position,role_id,organization_id,active) VALUES (?,?,?,?,1)',
  ).run(name, position, roleId(role), organization.id).lastInsertRowid);
  const actorFor = (id, permissions) => ({ id, name: 'Sinov admin', organizationId: organization.id, departmentId: null, roleCode: 'admin', permissions: { canManageOrganization: true, canManageRoles: false, ...permissions } });
  const runtime = { database, db, organizationIds: [organization.id], actor: null };
  globalThis.authRuntime = runtime;
  return { database, db, organization, roleId, employee, actorFor, runtime };
}

const patch = (body) => new Request('https://test.local/api/admin/employees', {
  method: 'PATCH', headers: { 'Content-Type': 'application/json', Origin: 'https://test.local' }, body: JSON.stringify(body),
});

test('audit log is append-only; only the retention job deletes rows older than a year', async () => {
  const { database, db } = fixture();
  const insert = database.prepare("INSERT INTO app_audit_logs (action,entity_type,detail_json,created_at) VALUES ('t','x','{}',?)");
  const fresh = Number(insert.run(new Date().toISOString().slice(0, 19).replace('T', ' ')).lastInsertRowid);
  const ancient = Number(insert.run('2019-01-01 00:00:00').lastInsertRowid);
  assert.throws(() => database.prepare("UPDATE app_audit_logs SET action='x' WHERE id=?").run(fresh), /o‘zgartirib bo‘lmaydi/);
  assert.throws(() => database.prepare('DELETE FROM app_audit_logs WHERE id=?').run(ancient), /o‘chirib bo‘lmaydi/);
  // Even with the lock held, rows younger than a year stay protected.
  database.prepare("INSERT INTO app_maintenance_lock (id,reason) VALUES (1,'audit_retention')").run();
  assert.throws(() => database.prepare('DELETE FROM app_audit_logs WHERE id=?').run(fresh), /o‘chirib bo‘lmaydi/);
  database.prepare('DELETE FROM app_maintenance_lock').run();

  database.prepare("INSERT INTO app_sessions (token_hash,employee_id,expires_at) VALUES ('old',1,'2020-01-01T00:00:00.000Z'),('live',1,'2099-01-01T00:00:00.000Z')").run();
  database.prepare("INSERT INTO app_notification_jobs (kind,entity_type,entity_id,recipient_employee_id,scheduled_at,next_attempt_at,status,idempotency_key,payload_json,created_at) VALUES ('k','task',1,1,'2020-01-01T00:00:00.000Z','2020-01-01T00:00:00.000Z','sent','old-sent','{}','2020-01-01T00:00:00.000Z'),('k','task',1,1,'2020-01-01T00:00:00.000Z','2020-01-01T00:00:00.000Z','pending','old-pending','{}','2020-01-01T00:00:00.000Z')").run();
  database.prepare("INSERT INTO app_login_attempts (key,window_start,attempts) VALUES ('ip:old','2020-01-01 00:00:00',3),('ip:new',CURRENT_TIMESTAMP,1)").run();

  const removed = await pruneRetainedData(db, new Date());
  assert.equal(removed.audit, 1);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_audit_logs WHERE id IN (?,?)').get(fresh, ancient).n, 1);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_maintenance_lock').get().n, 0, 'lock is released in the same transaction');
  assert.deepEqual(database.prepare('SELECT token_hash FROM app_sessions ORDER BY token_hash').all().map((row) => row.token_hash).filter((hash) => ['old', 'live'].includes(hash)), ['live']);
  assert.deepEqual(database.prepare("SELECT idempotency_key FROM app_notification_jobs WHERE idempotency_key LIKE 'old-%'").all().map((row) => row.idempotency_key), ['old-pending']);
  assert.deepEqual(database.prepare("SELECT key FROM app_login_attempts WHERE key LIKE 'ip:%'").all().map((row) => row.key), ['ip:new']);
  assert.throws(() => database.prepare('DELETE FROM app_audit_logs').run(), /o‘chirib bo‘lmaydi/, 'the lock does not linger');
});

test('status, priority and progress guards reject invalid values and accept the workflow values', () => {
  const { database, employee } = fixture();
  const creator = employee('Guard Creator');
  const task = Number(database.prepare("INSERT INTO app_tasks (title,created_by_employee_id) VALUES ('T',?)").run(creator).lastInsertRowid);
  for (const status of ['Jarayonda', 'Davomiy', 'Ko‘rib chiqilmoqda', 'Bajarildi']) database.prepare('UPDATE app_tasks SET status=? WHERE id=?').run(status, task);
  assert.throws(() => database.prepare("UPDATE app_tasks SET status='Nomalum' WHERE id=?").run(task), /noto‘g‘ri/);
  assert.throws(() => database.prepare('UPDATE app_tasks SET progress=101 WHERE id=?').run(task), /noto‘g‘ri/);
  assert.throws(() => database.prepare("UPDATE app_tasks SET priority='Zo‘r' WHERE id=?").run(task), /noto‘g‘ri/);
  const assignment = Number(database.prepare('INSERT INTO app_task_assignments (task_id,employee_id,assigned_by_employee_id) VALUES (?,?,?)').run(task, employee('Guard Exec'), creator).lastInsertRowid);
  for (const status of ['Ko‘rib chiqilmoqda', 'Qaytarildi', 'Qabul qilindi', 'Yo‘naltirildi', 'Faol']) database.prepare('UPDATE app_task_assignments SET assignment_status=? WHERE id=?').run(status, assignment);
  assert.throws(() => database.prepare('UPDATE app_task_assignments SET progress=-1 WHERE id=?').run(assignment), /noto‘g‘ri/);
  assert.throws(() => database.prepare("UPDATE app_task_assignments SET assignment_status='done' WHERE id=?").run(assignment), /noto‘g‘ri/);
  const triggers = new Set(database.prepare("SELECT name FROM sqlite_master WHERE type='trigger'").all().map((row) => row.name));
  for (const name of ['app_report_assignments_status_insert', 'app_report_assignments_status_update', 'app_information_records_values_insert', 'app_information_records_values_update']) assert.ok(triggers.has(name), name);
});

test('employee manager chain rejects self and indirect cycles, including the recovered-create path', async () => {
  const { database, employee, actorFor, runtime } = fixture();
  const a = employee('Chain A');
  const b = employee('Chain B');
  runtime.actor = actorFor(employee('Chain Admin', 'admin'), { canManageRoles: true });
  let response = await employees.PATCH(patch({ id: a, managerId: a }));
  assert.equal(response.status, 400);
  response = await employees.PATCH(patch({ id: b, managerId: a }));
  assert.equal(response.status, 200, await response.clone().text());
  response = await employees.PATCH(patch({ id: a, managerId: b }));
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /aylana/);
  assert.throws(() => database.prepare('UPDATE app_employees SET manager_id=id WHERE id=?').run(a), /o‘ziga rahbar/);

  // Recovered create: an unfinished account (same email, no login) is completed in place;
  // its new manager must not be one of its own subordinates.
  const admin = runtime.actor.id;
  const pending = Number(database.prepare(
    "INSERT INTO app_employees (full_name,email,position,role_id,organization_id,active,created_by_employee_id) VALUES ('Chain R','chain.r@test.uz','Mutaxassis',(SELECT id FROM app_roles WHERE code='xodim'),?,1,?)",
  ).run(runtime.organizationIds[0], admin).lastInsertRowid);
  const subordinate = employee('Chain S');
  database.prepare('UPDATE app_employees SET manager_id=? WHERE id=?').run(pending, subordinate);
  response = await employees.POST(new Request('https://test.local/api/admin/employees', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://test.local' },
    body: JSON.stringify({ name: 'Chain R', email: 'chain.r@test.uz', roleId: database.prepare("SELECT id FROM app_roles WHERE code='xodim'").get().id, organizationId: runtime.organizationIds[0], managerId: subordinate, username: 'chain.r', password: 'Yangi-Parol-2026!' }),
  }));
  assert.equal(response.status, 400, await response.clone().text());
  assert.match((await response.json()).error, /aylana/);
  assert.equal(database.prepare('SELECT manager_id FROM app_employees WHERE id=?').get(pending).manager_id, null);
});

test('multipart parts are bounded by the declared file size', () => {
  const chunk = 8 * 1024 * 1024;
  const declared = 13 * 1024 * 1024;
  assert.equal(multipartPartLimit(declared, 1), chunk);
  assert.equal(multipartPartLimit(declared, 2), declared - chunk);
  assert.equal(multipartPartLimit(declared, 3), 0, 'no third part for a 13 MB file');
  assert.equal(multipartPartLimit(declared, 0), 0);
  assert.equal(multipartPartLimit(2 * chunk, 2), chunk);
});

test('Drizzle ORM leftovers are gone; plain SQL migrations are the schema source', () => {
  const root = new URL('../', import.meta.url);
  for (const path of ['db/schema.ts', 'drizzle.config.ts', 'drizzle/meta']) assert.equal(existsSync(new URL(path, root)), false, path);
  const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  assert.equal(pkg.dependencies['drizzle-orm'], undefined);
  assert.equal(pkg.devDependencies['drizzle-kit'], undefined);
  const upload = readFileSync(new URL('lib/chat-uploads.ts', root), 'utf8') + readFileSync(new URL('app/api/chat/files/route.ts', root), 'utf8');
  assert.doesNotMatch(upload, /datetime\(\w*\.?expires_at\)/, 'expiry filters stay index-friendly');
});
