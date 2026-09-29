import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Policy functions are pure; the security items run the real route handlers
// against SQLite with every migration applied (auth/session lookup mocked).
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
      'test:db': 'export async function getD1(){return globalThis.policyRuntime.db} export async function getRuntimeEnv(){return {}}',
      'test:telegram': 'export async function createTelegramLink(){return {url:"https://t.me/x",expiresAt:"2099-01-01T00:00:00Z"}} export async function sendTelegram(){return {ok:true}}',
      'test:auth': `export class ApiError extends Error {constructor(status,message){super(message);this.status=status}}
        export function apiError(error){return Response.json({error:error.message},{status:error.status??500})}
        export function assertSameOrigin(){} export function isSecureRequest(){return false} export function publicOrigin(request){return new URL(request.url).origin}
        export async function requireActor(){return globalThis.policyRuntime.actor}
        export async function organizationScopeIds(){return globalThis.policyRuntime.organizationIds}
        export async function audit(actor,action,entityType,entityId,detail={}){globalThis.policyRuntime.database.prepare('INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,?,?,?,?)').run(actor?.id??null,action,entityType,entityId,JSON.stringify(detail))}`,
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const policy = await import('../lib/policy/admin.ts');
const { sessionIdleExpired } = await import('../lib/session.ts');
const password = await import('../lib/password.ts');
const login = await import('../app/api/auth/login/route.ts');
const changePassword = await import('../app/api/auth/change-password/route.ts');
const roles = await import('../app/api/admin/roles/route.ts');

const perms = (overrides = {}) => ({
  viewScope: 'own', assignScope: 'none', canCreateTask: false, canCreateMeeting: false, canExport: false,
  canManageOrganization: false, canManageRoles: false, canConfigure: false, canViewAudit: false, canUpdateAnyTask: false,
  canManageReports: false, canManageInformation: false, canViewRestrictedInformation: false, informationScope: 'assigned',
  canEnterInformation: false, canSubmitInformation: false, canVerifyInformation: false, canApproveInformation: false,
  ...overrides,
});
const orgAdmin = { id: 10, organizationId: 5, permissions: perms({ canManageOrganization: true }) };
const roleAdmin = { id: 11, organizationId: 5, permissions: perms({ canManageOrganization: true, canManageRoles: true }) };
const plain = { id: 12, organizationId: 5, permissions: perms() };

const cases = [
  // [name, decision, expected allowed, expected status]
  ['organizationAdmin: org admin', policy.organizationAdmin(orgAdmin), true],
  ['organizationAdmin: plain', policy.organizationAdmin(plain), false, 403],
  ['roleManage: org admin', policy.roleManage(orgAdmin), false, 403],
  ['roleManage: role admin', policy.roleManage(roleAdmin), true],
  ['accountProvision: org admin', policy.accountProvision(orgAdmin), false, 403],
  ['auditView: plain', policy.auditView(plain), false, 403],
  ['auditView: auditor', policy.auditView({ ...plain, permissions: perms({ canViewAudit: true }) }), true],
  ['telegramConfigure: plain', policy.telegramConfigure(plain), false, 403],
  ['organizationCreate: district under own org', policy.organizationCreate(orgAdmin, { type: 'district', parentId: 5, parentInScope: true }), true],
  ['organizationCreate: territorial by org admin', policy.organizationCreate(orgAdmin, { type: 'territorial', parentId: 5, parentInScope: true }), false, 403],
  ['organizationCreate: district under another org', policy.organizationCreate(orgAdmin, { type: 'district', parentId: 6, parentInScope: true }), false, 403],
  ['organizationCreate: system-wide', policy.organizationCreate(roleAdmin, { type: 'territorial', parentId: null, parentInScope: false }), true],
  ['organizationUpdate: out of scope', policy.organizationUpdate(false), false, 403],
  ['departmentUpdate: moved out of scope', policy.departmentUpdate({ nextOrganizationInScope: true, currentOrganizationInScope: false }), false, 403],
  ['employeeCreate: xodim in scope', policy.employeeCreate(orgAdmin, { organizationInScope: true, roleCode: 'xodim', positionRaisesAccess: false }), true],
  ['employeeCreate: out of scope', policy.employeeCreate(orgAdmin, { organizationInScope: false, roleCode: 'xodim', positionRaisesAccess: false }), false, 403],
  ['employeeCreate: leader role by org admin', policy.employeeCreate(orgAdmin, { organizationInScope: true, roleCode: 'rahbar', positionRaisesAccess: false }), false, 403],
  ['employeeCreate: approval title by org admin (Y3b)', policy.employeeCreate(orgAdmin, { organizationInScope: true, roleCode: 'xodim', positionRaisesAccess: true }), false, 403],
  ['employeeCreate: approval title by role admin', policy.employeeCreate(roleAdmin, { organizationInScope: true, roleCode: 'rahbar', positionRaisesAccess: true }), true],
  ['employeeManage: leader by org admin', policy.employeeManage(orgAdmin, { inScope: true, roleCode: 'hudud_rahbari' }), false, 403],
  ['employeeManage: out of scope', policy.employeeManage(roleAdmin, { inScope: false, roleCode: 'xodim' }), false, 403],
  ['employeeManage: xodim in scope', policy.employeeManage(orgAdmin, { inScope: true, roleCode: 'xodim' }), true],
  ['employeeChangeEmail: org admin', policy.employeeChangeEmail(orgAdmin, true), false, 403],
  ['employeeChangeEmail: unchanged', policy.employeeChangeEmail(orgAdmin, false), true],
  ['employeeChangeRole: org admin', policy.employeeChangeRole(orgAdmin, true), false, 403],
  ['employeeAssignRole: rahbar by org admin', policy.employeeAssignRole(orgAdmin, 'rahbar'), false, 403],
  ['employeeAssignRole: rahbar by role admin', policy.employeeAssignRole(roleAdmin, 'rahbar'), true],
  ['employeeDeactivate: self', policy.employeeDeactivate(orgAdmin, { employeeId: 10, active: false }), false, 409],
  ['employeeDeactivate: other', policy.employeeDeactivate(orgAdmin, { employeeId: 99, active: false }), true],
  ['positionAssign: unchanged raising title', policy.positionAssign(orgAdmin, { changed: false, raisesAccess: true }), true],
  ['positionAssign: changed raising title', policy.positionAssign(orgAdmin, { changed: true, raisesAccess: true }), false, 403],
  ['employeeResetCredentials: elevated target (Y3a)', policy.employeeResetCredentials(orgAdmin, { employeeId: 99, requested: true, elevated: true }), false, 403],
  ['employeeResetCredentials: ordinary target', policy.employeeResetCredentials(orgAdmin, { employeeId: 99, requested: true, elevated: false }), true],
  ['employeeResetCredentials: self', policy.employeeResetCredentials(orgAdmin, { employeeId: 10, requested: true, elevated: true }), true],
  ['employeeResetCredentials: role admin', policy.employeeResetCredentials(roleAdmin, { employeeId: 99, requested: true, elevated: true }), true],
  ['accountActivate: xodim (K2)', policy.accountActivate(orgAdmin, { inScope: true, roleCode: 'xodim', ownerBound: false }), true],
  ['accountActivate: leader by org admin (K2)', policy.accountActivate(orgAdmin, { inScope: true, roleCode: 'hudud_rahbari', ownerBound: false }), false, 403],
  ['accountActivate: owner never (K2)', policy.accountActivate(roleAdmin, { inScope: true, roleCode: 'admin', ownerBound: true }), false, 403],
  ['accountActivate: out of scope', policy.accountActivate(roleAdmin, { inScope: false, roleCode: 'xodim', ownerBound: false }), false, 403],
  ['accountProvisionTarget: admin skipped (Y3c)', policy.accountProvisionTarget(roleAdmin, { employeeId: 1, roleCode: 'admin', ownerBound: false }), false, 403],
  ['accountProvisionTarget: owner skipped', policy.accountProvisionTarget(roleAdmin, { employeeId: 2, roleCode: 'xodim', ownerBound: true }), false, 403],
  ['accountProvisionTarget: self skipped', policy.accountProvisionTarget(roleAdmin, { employeeId: 11, roleCode: 'xodim', ownerBound: false }), false, 403],
  ['accountProvisionTarget: employee', policy.accountProvisionTarget(roleAdmin, { employeeId: 3, roleCode: 'rahbar', ownerBound: false }), true],
  ['telegramLinkFor: self', policy.telegramLinkFor(plain, 12), true],
  ['telegramLinkFor: other by org admin (Y13)', policy.telegramLinkFor(orgAdmin, 99), false, 403],
  ['telegramLinkFor: other by role admin', policy.telegramLinkFor(roleAdmin, 99), true],
  ['telegramTestFor: other without configure', policy.telegramTestFor(orgAdmin, 99), false, 403],
  ['staffView: plain', policy.staffView(plain), false, 403],
  ['staffView: reports manager', policy.staffView({ ...plain, permissions: perms({ canManageReports: true }) }), true],
];

test('admin policies: every rule allows and denies as audited', () => {
  for (const [name, decision, allowed, status] of cases) {
    assert.equal(decision.allowed, allowed, name);
    if (!allowed) {
      assert.equal(decision.status, status, `${name}: status`);
      assert.ok(decision.message.length > 10, `${name}: message`);
    }
  }
  assert.equal(policy.canViewEmployeeContacts({ ...plain, permissions: perms({ viewScope: 'all' }) }), true);
  assert.equal(policy.canViewLoginConfigured({ ...plain, permissions: perms({ viewScope: 'all' }) }), false);
  assert.equal(policy.directoryGlobalScope({ ...plain, permissions: perms({ canConfigure: true }) }), true);
  assert.equal(policy.organizationSystemWide(orgAdmin), false);
});

test('sessions end after inactivity; remembered sessions get a longer idle window', () => {
  const now = Date.parse('2026-09-29T20:00:00Z');
  const normal = { created_at: '2026-09-29 08:00:00', expires_at: '2026-09-29T20:30:00.000Z' };
  assert.equal(sessionIdleExpired({ ...normal, last_seen_at: '2026-09-29 13:00:00' }, now), false, '7h idle');
  assert.equal(sessionIdleExpired({ ...normal, last_seen_at: '2026-09-29 11:00:00' }, now), true, '9h idle');
  assert.equal(sessionIdleExpired({ ...normal, last_seen_at: '2026-09-29T11:00:00.000Z' }, now), true, 'ISO format');
  const remembered = { created_at: '2026-09-20 08:00:00', expires_at: '2026-10-20T08:00:00.000Z' };
  assert.equal(sessionIdleExpired({ ...remembered, last_seen_at: '2026-09-27 08:00:00' }, now), false, 'remembered, 2.5d idle');
  assert.equal(sessionIdleExpired({ ...remembered, last_seen_at: '2026-09-21 08:00:00' }, now), true, 'remembered, 8.5d idle');
});

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
    async batch(statements) {
      database.exec('BEGIN');
      try { const results = []; for (const statement of statements) results.push(await statement.run()); database.exec('COMMIT'); return results; }
      catch (error) { database.exec('ROLLBACK'); throw error; }
    },
  };
  const organization = database.prepare("SELECT id FROM app_organizations WHERE active=1 ORDER BY id LIMIT 1").get();
  const roleId = code => database.prepare('SELECT id FROM app_roles WHERE code=?').get(code).id;
  const employee = (name, role = 'xodim') => Number(database.prepare(
    'INSERT INTO app_employees (full_name,position,role_id,organization_id,active) VALUES (?,?,?,?,1)',
  ).run(name, 'Mutaxassis', roleId(role), organization.id).lastInsertRowid);
  const runtime = { database, db, organizationIds: [organization.id], actor: null };
  globalThis.policyRuntime = runtime;
  return { database, employee, runtime };
}

const post = (url, body, headers = {}) => new Request(`https://test.local${url}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://test.local', ...headers }, body: JSON.stringify(body),
});

async function withCredential(database, employeeId, username, secret, iterations = password.PASSWORD_ITERATIONS) {
  const hashed = await password.hashPassword(secret, undefined, iterations);
  database.prepare(`INSERT INTO app_user_credentials (employee_id,username,username_normalized,password_hash,password_salt,password_iterations,must_change_password)
    VALUES (?,?,?,?,?,?,0)`).run(employeeId, username, password.normalizeUsername(username), hashed.hash, hashed.salt, hashed.iterations);
}

test('a legacy 100k hash is transparently upgraded to 600k on successful login', async () => {
  const { database, employee } = fixture();
  const id = employee('Eski xesh');
  await withCredential(database, id, 'eski.xesh', 'Eski-Parol-2026', 100_000);
  const response = await login.POST(post('/api/auth/login', { username: 'eski.xesh', password: 'Eski-Parol-2026' }, { 'x-real-ip': '198.51.100.1' }));
  assert.equal(response.status, 200);
  const row = database.prepare('SELECT password_iterations,password_hash,password_salt FROM app_user_credentials WHERE employee_id=?').get(id);
  assert.equal(row.password_iterations, 600_000);
  assert.equal(await password.verifyPassword('Eski-Parol-2026', row.password_hash, row.password_salt, row.password_iterations), true);
});

test('unknown logins spend the same PBKDF2 work as real ones', async () => {
  const { database, employee } = fixture();
  await withCredential(database, employee('Mavjud'), 'mavjud.login', 'Togri-Parol-2026');
  const timed = async (username) => {
    const started = performance.now();
    const response = await login.POST(post('/api/auth/login', { username, password: 'notogri-parol' }, { 'x-real-ip': `203.0.113.${username.length}` }));
    assert.equal(response.status, 401);
    return performance.now() - started;
  };
  const known = await timed('mavjud.login');
  const unknown = await timed('umuman.yoq');
  assert.ok(unknown > known * 0.5, `unknown ${unknown.toFixed(0)}ms vs known ${known.toFixed(0)}ms`);
  assert.equal(await password.dummyVerifyPassword('x'), false);
});

test('wrong current passwords are limited per employee and a success resets the counter', async () => {
  const { database, employee, runtime } = fixture();
  const id = employee('Sessiya egasi');
  await withCredential(database, id, 'sessiya.egasi', 'Joriy-Parol-2026');
  runtime.actor = { id, name: 'Sessiya egasi', permissions: perms() };
  const attempt = (currentPassword) => changePassword.POST(post('/api/auth/change-password', { currentPassword, newPassword: 'Yangi-Parol-2027' }));
  const statuses = [];
  for (let index = 0; index < 6; index += 1) statuses.push((await attempt('notogri')).status);
  assert.deepEqual(statuses, [401, 401, 401, 401, 401, 429]);
  // Even the right password is refused while the window is exhausted.
  assert.equal((await attempt('Joriy-Parol-2026')).status, 429);
  database.prepare("UPDATE app_login_attempts SET window_start=datetime('now','-16 minutes') WHERE key=?").run(`password:${id}`);
  assert.equal((await attempt('Joriy-Parol-2026')).status, 200);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_login_attempts WHERE key=?').get(`password:${id}`).n, 0);
});

test('role permission changes are audited with a before/after diff', async () => {
  const { database, runtime } = fixture();
  runtime.actor = { id: 1, name: 'Tizim administratori', permissions: perms({ canManageRoles: true }) };
  const created = await roles.POST(post('/api/admin/roles', { name: 'Sinov roli', code: 'sinov_roli', level: 50, permissions: { canExport: true } }));
  assert.equal(created.status, 201);
  const { id } = await created.json();
  const createdLog = JSON.parse(database.prepare("SELECT detail_json FROM app_audit_logs WHERE action='role.created' AND entity_id=?").get(id).detail_json);
  assert.equal(createdLog.permissions.canExport, true);
  const patch = new Request('https://test.local/api/admin/roles', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Origin: 'https://test.local' },
    body: JSON.stringify({ id, level: 40, permissions: { canExport: false, canViewAudit: true, viewScope: 'all' } }),
  });
  assert.equal((await roles.PATCH(patch)).status, 200);
  const log = JSON.parse(database.prepare("SELECT detail_json FROM app_audit_logs WHERE action='role.updated' AND entity_id=?").get(id).detail_json);
  assert.deepEqual(log.permissions.canExport, { from: true, to: false });
  assert.deepEqual(log.permissions.canViewAudit, { from: false, to: true });
  assert.deepEqual(log.permissions.viewScope, { from: 'own', to: 'all' });
  assert.equal(log.permissions.canCreateTask, undefined, 'unchanged rights are not listed');
  assert.deepEqual(log.level, { from: 50, to: 40 });
});
