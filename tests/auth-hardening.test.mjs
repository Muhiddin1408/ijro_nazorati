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
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    const sources = {
      'test:db': 'export async function getD1(){return globalThis.authRuntime.db} export async function getRuntimeEnv(){return {}}',
      'test:telegram': 'export async function createTelegramLink(){return {url:"https://t.me/test?start=x",expiresAt:"2099-01-01T00:00:00Z"}}',
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

const password = await import('../lib/password.ts');
const login = await import('../app/api/auth/login/route.ts');
const activateBulk = await import('../app/api/admin/accounts/activate-bulk/route.ts');
const employees = await import('../app/api/admin/employees/route.ts');
const provision = await import('../app/api/admin/accounts/provision/route.ts');
const telegramLink = await import('../app/api/telegram/link/route.ts');

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

const post = (url, body, headers = {}) => new Request(`https://test.local${url}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://test.local', ...headers }, body: JSON.stringify(body),
});
const patch = (url, body) => new Request(`https://test.local${url}`, {
  method: 'PATCH', headers: { 'Content-Type': 'application/json', Origin: 'https://test.local' }, body: JSON.stringify(body),
});

async function withCredential(database, employeeId, username, secret) {
  const hashed = await password.hashPassword(secret, undefined, password.PASSWORD_ITERATIONS);
  database.prepare(`INSERT INTO app_user_credentials (employee_id,username,username_normalized,password_hash,password_salt,password_iterations,must_change_password)
    VALUES (?,?,?,?,?,?,0)`).run(employeeId, username, password.normalizeUsername(username), hashed.hash, hashed.salt, hashed.iterations);
}

test('parallel wrong passwords cannot exceed the per-IP login limit, and other networks stay usable', async () => {
  const { database, employee } = fixture();
  const leader = employee('Hudud rahbari', 'hudud_rahbari', 'Boshqarma boshlig‘i');
  await withCredential(database, leader, 'u1.rahbar', 'Togri-Parol-2026!');
  const attacker = { 'x-real-ip': '203.0.113.9' };
  const responses = await Promise.all(Array.from({ length: 20 }, () => login.POST(post('/api/auth/login', { username: 'u1.rahbar', password: 'notogri' }, attacker))));
  const statuses = responses.map(response => response.status);
  assert.equal(statuses.filter(status => status === 401).length, 5, statuses.join(','));
  assert.equal(statuses.filter(status => status === 423).length, 15);
  // The attacker's address stays blocked even with the right password…
  assert.equal((await login.POST(post('/api/auth/login', { username: 'u1.rahbar', password: 'Togri-Parol-2026!' }, attacker))).status, 423);
  // …but the real leader on another network is not locked out (Y2).
  const own = await login.POST(post('/api/auth/login', { username: 'u1.rahbar', password: 'Togri-Parol-2026!' }, { 'x-real-ip': '198.51.100.7' }));
  assert.equal(own.status, 200, JSON.stringify(await own.clone().json()));
  assert.equal(database.prepare('SELECT locked_until FROM app_user_credentials WHERE employee_id=?').get(leader).locked_until, null);
});

test('unknown logins are throttled per IP too', async () => {
  fixture();
  const statuses = [];
  for (let index = 0; index < 7; index += 1) {
    statuses.push((await login.POST(post('/api/auth/login', { username: 'mavjud.emas', password: 'x' }, { 'x-real-ip': '192.0.2.1' }))).status);
  }
  assert.deepEqual(statuses, [401, 401, 401, 401, 401, 423, 423]);
});

test('K2: an organization admin without role management only activates ordinary employees', async () => {
  const { database, employee, actorFor, runtime } = fixture();
  const admin = employee('Hududiy admin');
  const worker = employee('Oddiy xodim');
  const leader = employee('Rahbar', 'hudud_rahbari', 'Boshqarma boshlig‘i');
  const owner = employee('SSO egasi', 'admin', 'Tizim administratori');
  database.prepare("INSERT INTO app_owner_identities (subject,employee_id,owner_email) VALUES ('sub',?,'owner@example.test')").run(owner);
  runtime.actor = actorFor(admin, { canManageRoles: false });
  let response = await activateBulk.POST(post('/api/admin/accounts/activate-bulk', { employeeIds: [worker, leader, owner] }));
  assert.equal(response.status, 201);
  assert.deepEqual((await response.json()).links.map(link => link.employeeId), [worker]);
  runtime.actor = actorFor(admin, { canManageRoles: true });
  response = await activateBulk.POST(post('/api/admin/accounts/activate-bulk', { employeeIds: [leader, owner] }));
  assert.equal(response.status, 201);
  assert.deepEqual((await response.json()).links.map(link => link.employeeId), [leader], 'SSO-bound owner never gets an activation link');
});

test('Y3a: resetting the password of an elevated employee requires role management', async () => {
  const { database, employee, actorFor, runtime } = fixture();
  const admin = employee('Hududiy admin');
  const plain = employee('Oddiy xodim');
  const reviewer = employee('Tasdiqlovchi xodim');
  const profile = database.prepare("SELECT id FROM app_access_profiles WHERE code!='employee_personal' ORDER BY id LIMIT 1").get();
  database.prepare(`INSERT INTO app_access_profile_assignments (principal_type,principal_id,access_profile_id,scope_type,scope_id,grant_source)
    VALUES ('employee',?,?,'organization',0,'manual_admin')`).run(reviewer, profile.id);
  runtime.actor = actorFor(admin, { canManageRoles: false });
  let response = await employees.PATCH(patch('/api/admin/employees', { id: reviewer, username: 'u9.tasdiq', password: 'Yangi-Parol-2026!' }));
  assert.equal(response.status, 403);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_user_credentials WHERE employee_id=?').get(reviewer).n, 0);
  response = await employees.PATCH(patch('/api/admin/employees', { id: plain, username: 'u8.oddiy', password: 'Yangi-Parol-2026!' }));
  assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
});

test('Y3b: only role managers may store a position title that implies approval rights', async () => {
  const { database, organization, roleId, employee, actorFor, runtime } = fixture();
  const admin = employee('Hududiy admin');
  runtime.actor = actorFor(admin, { canManageRoles: false });
  const body = { name: 'Yangi direktor', roleId: roleId('xodim'), organizationId: organization.id, position: 'Direktor' };
  let response = await employees.POST(post('/api/admin/employees', body));
  assert.equal(response.status, 403);
  response = await employees.POST(post('/api/admin/employees', { ...body, name: 'Yangi mutaxassis', position: 'Bosh mutaxassis' }));
  assert.equal(response.status, 201, JSON.stringify(await response.clone().json()));
  const created = (await response.json()).id;
  response = await employees.PATCH(patch('/api/admin/employees', { id: created, position: 'Direktor' }));
  assert.equal(response.status, 403);
  assert.equal(database.prepare('SELECT position FROM app_employees WHERE id=?').get(created).position, 'Bosh mutaxassis');
});

test('Y3c: credential reissue skips administrators and audits every issued account', async () => {
  const { database, employee, actorFor, runtime } = fixture();
  const actor = employee('Bosh admin', 'admin', 'Tizim administratori');
  const otherAdmin = employee('Ikkinchi admin', 'admin', 'Tizim administratori');
  const worker = employee('Oddiy xodim');
  await withCredential(database, otherAdmin, 'u2.admin', 'Eski-Parol-2026!');
  await withCredential(database, worker, 'u3.xodim', 'Eski-Parol-2026!');
  runtime.actor = actorFor(actor, { canManageRoles: true });
  const response = await provision.POST(post('/api/admin/accounts/provision', { kind: 'employees', employeeIds: [actor, otherAdmin, worker], reissue: true }));
  assert.equal(response.status, 201, JSON.stringify(await response.clone().json()));
  const body = await response.json();
  assert.deepEqual(body.accounts.map(account => account.employeeId), [worker]);
  assert.deepEqual(body.skipped.map(item => item.targetId).sort(), [actor, otherAdmin].sort());
  const issued = database.prepare("SELECT entity_id FROM app_audit_logs WHERE action='account.credentials_issued'").all().map(row => row.entity_id);
  assert.deepEqual(issued, [worker]);
});

test('Y13: linking Telegram for another employee needs role management and names the creator', async () => {
  const { database, employee, actorFor, runtime } = fixture();
  const admin = employee('Hududiy admin');
  const target = employee('Oddiy xodim');
  runtime.actor = actorFor(admin, { canManageRoles: false });
  assert.equal((await telegramLink.POST(post('/api/telegram/link', { employeeId: target }))).status, 403);
  assert.equal((await telegramLink.POST(post('/api/telegram/link', {}))).status, 200, 'own link stays allowed');
  runtime.actor = actorFor(admin, { canManageRoles: true });
  assert.equal((await telegramLink.POST(post('/api/telegram/link', { employeeId: target }))).status, 200);
  const entry = database.prepare("SELECT entity_id,detail_json FROM app_audit_logs WHERE action='telegram.link_created_for_employee'").get();
  assert.equal(entry.entity_id, target);
  assert.equal(JSON.parse(entry.detail_json).createdByEmployeeId, admin);
});
