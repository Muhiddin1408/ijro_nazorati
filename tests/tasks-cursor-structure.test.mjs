import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Tasks keyset pagination and the on-demand structure endpoint (real handlers, in-memory SQLite).
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
        export async function enqueueMeetingChangeNotifications(){}
        export async function telegramStatus(){return {configured:false,botUsername:null,linkedEmployees:0,pendingJobs:0}}`,
      'test:auth': `export class ApiError extends Error {constructor(status,message){super(message);this.status=status}}
        export function apiError(error){return Response.json({error:error.message},{status:error.status??500})}
        export function assertSameOrigin(){} export function isSecureRequest(){return false} export function publicOrigin(request){return new URL(request.url).origin} export function requirePermission(actor,key){if(!actor.permissions[key])throw new ApiError(403,'Denied')}
        export async function requireActor(){return globalThis.taskRuntime.actor}
        export async function scopedEmployeeIds(){return []}
        export async function canAccessTask(){return true}
        export async function organizationScopeIds(){return globalThis.taskRuntime.organizationIds}
        export async function employeeIdsInScopes(){return true} export async function audit(){}`,
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const tasks = await import('../app/api/tasks/route.ts');
const bootstrap = await import('../app/api/bootstrap/route.ts');
const structure = await import('../app/api/bootstrap/structure/route.ts');

function fixture() {
  const database = new DatabaseSync(':memory:');
  const dir = new URL('../drizzle/', import.meta.url);
  for (const name of withSyntheticSeed(readdirSync(dir).filter(name => /^\d{4}.*\.sql$/.test(name)).sort())) database.exec(readFileSync(new URL(name, dir), 'utf8'));
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
    async batch(statements) { const results = []; for (const statement of statements) results.push(await statement.run()); return results; },
  };
  const admin = database.prepare(`SELECT e.id,e.full_name,e.organization_id,e.department_id,r.permissions_json FROM app_employees e
    JOIN app_roles r ON r.id=e.role_id WHERE r.code='admin' ORDER BY e.id LIMIT 1`).get();
  const organizationIds = database.prepare('SELECT id FROM app_organizations').all().map((row) => row.id);
  const actor = {
    id: admin.id, name: admin.full_name, organizationId: admin.organization_id, departmentId: admin.department_id,
    roleCode: 'admin', mustChangePassword: false,
    permissions: { ...JSON.parse(admin.permissions_json), viewScope: 'all', canViewAudit: false, canConfigure: false },
  };
  globalThis.taskRuntime = { db, actor, organizationIds };
  return { database, actor };
}

const get = async (handler, url) => {
  const response = await handler.GET(new Request(`https://test.local${url}`));
  return { status: response.status, body: response.status === 200 ? JSON.parse(await response.text()) : null, text: response.status === 200 ? '' : await response.text() };
};

test('cursor pages neither skip nor duplicate tasks when a task is inserted between loads', async () => {
  const { database, actor } = fixture();
  const insert = database.prepare(`INSERT INTO app_tasks (title,deadline_iso,status,created_by_employee_id,created_at)
    VALUES (?,?,'Jarayonda',?,?)`);
  // Mixed keys: dated and undated deadlines, equal deadlines broken by created_at/id.
  for (let index = 0; index < 23; index += 1) {
    const deadline = index % 5 === 0 ? null : `2027-01-${String(1 + (index % 7)).padStart(2, '0')}T09:00:00.000Z`;
    insert.run(`Vazifa ${index}`, deadline, actor.id, `2026-09-${String(1 + (index % 9)).padStart(2, '0')}T08:00:00.000Z`);
  }
  const first = await get(tasks, '/api/tasks?scope=all&limit=10');
  assert.equal(first.status, 200);
  assert.equal(first.body.tasks.length, 10);
  assert.ok(first.body.nextCursor);

  // A new task sorting before the cursor would shift an offset page by one.
  insert.run('Yangi shoshilinch vazifa', '2026-12-01T09:00:00.000Z', actor.id, '2026-09-29T08:00:00.000Z');
  const seen = first.body.tasks.map((task) => task.id);
  let cursor = first.body.nextCursor;
  while (cursor) {
    const page = await get(tasks, `/api/tasks?scope=all&limit=10&cursor=${encodeURIComponent(cursor)}`);
    assert.equal(page.status, 200);
    seen.push(...page.body.tasks.map((task) => task.id));
    cursor = page.body.nextCursor;
  }
  const original = database.prepare("SELECT id FROM app_tasks WHERE title LIKE 'Vazifa %'").all().map((row) => row.id);
  assert.equal(new Set(seen).size, seen.length, 'no duplicates');
  for (const id of original) assert.ok(seen.includes(id), `task ${id} was skipped`);

  // The cursor order equals the full single-page order.
  const full = await get(tasks, '/api/tasks?scope=all&limit=200');
  const expected = full.body.tasks.map((task) => task.id).filter((id) => seen.includes(id));
  assert.deepEqual(seen.filter((id) => expected.includes(id)), expected);

  // Offset stays supported; a cursor for another scope is rejected.
  assert.equal((await get(tasks, '/api/tasks?scope=all&limit=5&offset=5')).body.tasks.length, 5);
  assert.equal((await get(tasks, `/api/tasks?scope=current&cursor=${encodeURIComponent(first.body.nextCursor)}`)).status, 400);
  assert.equal((await get(tasks, '/api/tasks?scope=all&cursor=bm9uc2Vuc2U')).status, 400);
});

test('bootstrap no longer embeds the organization structure; /api/bootstrap/structure serves it with ETag', async () => {
  fixture();
  const boot = await get(bootstrap, '/api/bootstrap');
  assert.equal(boot.status, 200);
  assert.equal(boot.body.organizations, undefined);
  assert.equal(boot.body.departments, undefined);
  const bootBytes = JSON.stringify(boot.body).length;

  const response = await structure.GET(new Request('https://test.local/api/bootstrap/structure'));
  assert.equal(response.status, 200);
  const etag = response.headers.get('etag');
  const text = await response.text();
  const body = JSON.parse(text);
  assert.ok(body.organizations.length > 100 && body.departments.length > 10);
  const revalidated = await structure.GET(new Request('https://test.local/api/bootstrap/structure', { headers: { 'If-None-Match': `W/${etag.replace(/"$/, '-gzip"')}` } }));
  assert.equal(revalidated.status, 304);
  console.log(`# bootstrap ${bootBytes} B (was ${bootBytes + text.length - 2} B); structure ${text.length} B`);
  assert.ok(bootBytes < text.length, 'bootstrap is now smaller than the structure it used to embed');
});
