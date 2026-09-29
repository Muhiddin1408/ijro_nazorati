import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Server-rendered first screen (app/page.tsx → services/bootstrap.ts) against the real
// bootstrap handler on in-memory SQLite. Authentication and Telegram are mocked.
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
        export async function requireActor(){const r=globalThis.taskRuntime;if(r.authError)throw r.authError;if(!r.actor)throw new ApiError(401,'Login va parol orqali tizimga kiring');return r.actor}
        export async function scopedEmployeeIds(){return []}
        export async function canAccessTask(){return true}
        export async function organizationScopeIds(){return globalThis.taskRuntime.organizationIds}
        export async function employeeIdsInScopes(){return true} export async function audit(){}`,
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const bootstrap = await import('../app/api/bootstrap/route.ts');
const { loadInitialBootstrap } = await import('../services/bootstrap.ts');

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

test('server first render gets the same payload and ETag as GET /api/bootstrap', async () => {
  fixture();
  const initial = await loadInitialBootstrap();
  assert.equal(initial.session, 'ok');
  const response = await bootstrap.GET(new Request('http://test.local/api/bootstrap'));
  assert.equal(response.status, 200);
  assert.deepEqual(initial.payload, await response.json());
  // The client seeds its conditional cache with this ETag, so its first refresh is a 304.
  assert.equal(initial.etag, response.headers.get('etag'));
  const revalidated = await bootstrap.GET(new Request('http://test.local/api/bootstrap', { headers: { 'If-None-Match': initial.etag } }));
  assert.equal(revalidated.status, 304);
});

test('no session renders the login screen directly; unexpected errors fall back to the client fetch', async () => {
  fixture();
  globalThis.taskRuntime.actor = null;
  assert.deepEqual(await loadInitialBootstrap(), { session: 'anonymous' });
  globalThis.taskRuntime.authError = new Error('database is locked');
  const originalError = console.error;
  console.error = () => {};
  try {
    assert.deepEqual(await loadInitialBootstrap(), { session: 'unknown' });
  } finally {
    console.error = originalError;
    delete globalThis.taskRuntime.authError;
  }
});

test('page, layout and dashboard are wired for the server-provided first screen', () => {
  const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
  const page = read('../app/page.tsx');
  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.match(page, /loadInitialBootstrap\(\)/);
  assert.match(page, /initialData=\{initial\.session === "ok"/);
  assert.match(page, /initialEtag=/);
  const dashboard = read('../app/dashboard.tsx');
  assert.match(dashboard, /useState<BootstrapPayload \| null>\(initialData\)/);
  assert.match(dashboard, /skipInitialFetch/);
  assert.match(dashboard, /conditionalCache\.set\("\/api\/bootstrap"/);
  assert.match(dashboard, /LOCALE_COOKIE/);
  assert.match(read('../app/layout.tsx'), /<html lang=\{lang\}/);
});
