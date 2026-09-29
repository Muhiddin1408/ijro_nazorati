import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Real task/meeting handlers against in-memory SQLite with every migration.
// Only authentication, outbound Telegram delivery and background work are mocked.
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
      'test:db': 'export async function getD1(){return globalThis.taskRuntime.db} export async function getRuntimeEnv(){return {}}',
      'test:background': 'export function runInBackground(){}',
      'test:telegram': `export async function enqueueTaskNotifications(){} export async function enqueueTaskAudienceNotifications(){}
        export async function enqueueTaskChangeNotifications(){} export async function enqueueTaskReviewRequested(){} export async function processNotificationJobs(){}
        export async function enqueueMeetingNotifications(){} export async function enqueueMeetingAudienceNotifications(){}
        export async function enqueueMeetingChangeNotifications(){}`,
      'test:auth': `export class ApiError extends Error {constructor(status,message){super(message);this.status=status}}
        export function apiError(error){return Response.json({error:error.message},{status:error.status??500})}
        export function assertSameOrigin(){} export function isSecureRequest(){return false} export function publicOrigin(request){return new URL(request.url).origin} export function requirePermission(actor,key){if(!actor.permissions[key])throw new ApiError(403,'Denied')}
        export async function requireActor(){return globalThis.taskRuntime.actor}
        export async function canAccessTask(){return true}
        export async function organizationScopeIds(){return globalThis.taskRuntime.organizationIds}
        export async function employeeIdsInScopes(){return true} export async function audit(){}`,
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const tasks = await import('../app/api/tasks/route.ts');
const data = await import('../lib/data.ts');

function fixture() {
  const database = new DatabaseSync(':memory:');
  const dir = new URL('../drizzle/', import.meta.url);
  for (const name of withSyntheticSeed(readdirSync(dir).filter(name => /^\d{4}.*\.sql$/.test(name)).sort())) database.exec(readFileSync(new URL(name, dir), 'utf8'));
  let queue = Promise.resolve();
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
    batch(statements) {
      const operation = queue.then(async () => {
        database.exec('BEGIN');
        try { const results = []; for (const statement of statements) results.push(await statement.run()); database.exec('COMMIT'); return results; }
        catch (error) { database.exec('ROLLBACK'); throw error; }
      });
      queue = operation.catch(() => {});
      return operation;
    },
  };
  const organizationId = database.prepare('SELECT id FROM app_organizations ORDER BY id LIMIT 1').get().id;
  const department = database.prepare("INSERT INTO app_departments (name,organization_id,active) VALUES ('Sinov bo‘limi',?,1)").run(organizationId);
  const departmentId = Number(department.lastInsertRowid);
  const roleId = database.prepare("SELECT id FROM app_roles WHERE code='xodim'").get().id;
  const person = (name) => {
    const id = Number(database.prepare('INSERT INTO app_employees (full_name,email,role_id,department_id,organization_id,active) VALUES (?,NULL,?,?,?,1)')
      .run(name, roleId, departmentId, organizationId).lastInsertRowid);
    return { id, name, organizationId, departmentId, roleCode: 'xodim', permissions: { viewScope: 'own', assignScope: 'none', canCreateTask: false, canUpdateAnyTask: false } };
  };
  const creator = person('Topshiriq beruvchi');
  creator.permissions = { ...creator.permissions, viewScope: 'all', assignScope: 'all', canCreateTask: true };
  const executor = person('Birinchi ijrochi');
  const second = person('Ikkinchi ijrochi');
  const member = person('Bo‘lim a’zosi');
  globalThis.taskRuntime = { db, actor: creator, organizationIds: [organizationId] };
  return { database, creator, executor, second, member, departmentId };
}

const request = (method, body) => new Request('https://test.local/api/tasks', { method, headers: { 'Content-Type': 'application/json', Origin: 'https://test.local' }, body: JSON.stringify(body) });
async function as(actor, method, body) {
  globalThis.taskRuntime.actor = actor;
  const response = await (method === 'POST' ? tasks.POST : tasks.PATCH)(request(method, body));
  return { status: response.status, body: await response.json() };
}
const future = () => new Date(Date.now() + 7 * 86_400_000).toISOString();
const taskRow = (database, id) => database.prepare('SELECT status,progress FROM app_tasks WHERE id=?').get(id);

test('executor 100% submits for review; only the task giver accepts', async () => {
  const { database, creator, executor, second } = fixture();
  const created = await as(creator, 'POST', { title: 'Hisobot tayyorlash', assigneeIds: [executor.id, second.id], deadlineIso: future() });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const id = created.body.task.id;

  assert.equal((await as(executor, 'PATCH', { id, action: 'progress', progress: 100, status: 'Bajarildi' })).status, 200);
  assert.notEqual(taskRow(database, id).status, 'Bajarildi');
  assert.equal(database.prepare('SELECT assignment_status FROM app_task_assignments WHERE task_id=? AND employee_id=?').get(id, executor.id).assignment_status, 'Ko‘rib chiqilmoqda');
  await as(second, 'PATCH', { id, action: 'progress', progress: 100 });
  assert.equal(taskRow(database, id).status, 'Ko‘rib chiqilmoqda');

  assert.equal((await as(executor, 'PATCH', { id, action: 'accept' })).status, 403);
  assert.equal(taskRow(database, id).status, 'Ko‘rib chiqilmoqda');

  const returned = await as(creator, 'PATCH', { id, action: 'return', note: 'Jadval to‘liq emas' });
  assert.equal(returned.status, 200);
  assert.equal(taskRow(database, id).status, 'Jarayonda');
  assert.ok(taskRow(database, id).progress < 100);

  await as(executor, 'PATCH', { id, action: 'progress', progress: 100 });
  await as(second, 'PATCH', { id, action: 'progress', progress: 100 });
  assert.equal((await as(creator, 'PATCH', { id, action: 'accept' })).status, 200);
  assert.deepEqual({ ...taskRow(database, id) }, { status: 'Bajarildi', progress: 100 });
  assert.equal((await as(executor, 'PATCH', { id, action: 'progress', progress: 10 })).status, 409);
});

test('an audience member reports individually and cannot close the task for everyone', async () => {
  const { database, creator, member, departmentId } = fixture();
  const created = await as(creator, 'POST', { title: 'Bo‘lim bo‘yicha topshiriq', audiences: [{ targetType: 'department', targetId: departmentId }], deadlineIso: future() });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const id = created.body.task.id;

  assert.equal((await as(member, 'PATCH', { id, action: 'progress', progress: 100 })).status, 200);
  assert.notEqual(taskRow(database, id).status, 'Bajarildi');
  assert.notEqual(taskRow(database, id).status, 'Ko‘rib chiqilmoqda');
  assert.equal((await as(member, 'PATCH', { id, action: 'accept' })).status, 403);

  // The task giver's own department is the audience, yet they cannot claim it as an executor.
  assert.equal((await as(creator, 'PATCH', { id, action: 'progress', progress: 100 })).status, 403);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM app_task_assignments WHERE task_id=? AND employee_id=?').get(id, creator.id).count, 0);
});

test('task creation is atomic: an invalid related row leaves no orphan task', async () => {
  const { database, creator, executor } = fixture();
  const before = database.prepare('SELECT COUNT(*) AS count FROM app_tasks').get().count;
  database.exec(`CREATE TRIGGER fail_routes BEFORE INSERT ON app_task_routes BEGIN SELECT RAISE(ABORT, 'route failure'); END`);
  const result = await as(creator, 'POST', { title: 'Yarim yaratilmasin', assigneeIds: [executor.id], deadlineIso: future() });
  assert.equal(result.status, 500);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM app_tasks').get().count, before);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM app_task_assignments').get().count, 0);
});

test('pagination keeps new and undated tasks visible beyond 300 old completed ones', async () => {
  const { database, creator, executor } = fixture();
  const insert = database.prepare(`INSERT INTO app_tasks (title,description,deadline_iso,priority,status,progress,created_by_employee_id,updated_at)
    VALUES (?,'', ?, 'Oddiy', 'Bajarildi', 100, ?, datetime('now','-90 days'))`);
  for (let index = 0; index < 320; index += 1) insert.run(`Eski ${index}`, new Date(Date.UTC(2020, 0, 1 + index)).toISOString(), creator.id);
  const undated = await as(creator, 'POST', { title: 'Muddatsiz yangi topshiriq', assigneeIds: [executor.id] });
  const dated = await as(creator, 'POST', { title: 'Muddatli yangi topshiriq', assigneeIds: [executor.id], deadlineIso: future() });

  const current = await data.listTasksPage(creator);
  const ids = current.tasks.map((task) => task.id);
  assert.ok(ids.includes(undated.body.task.id));
  assert.ok(ids.includes(dated.body.task.id));
  assert.equal(current.hasMore, false);

  const all = await data.listTasksPage(creator, { scope: 'all', limit: 200 });
  assert.equal(all.tasks.length, 200);
  assert.equal(all.hasMore, true);
  assert.deepEqual(all.tasks.slice(0, 2).map((task) => task.status).includes('Bajarildi'), false);
  const rest = await data.listTasksPage(creator, { scope: 'all', offset: all.nextOffset, limit: 200 });
  assert.equal(all.tasks.length + rest.tasks.length, 322);
  assert.equal(rest.hasMore, false);
});
