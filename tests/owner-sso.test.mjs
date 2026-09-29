import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV = 'production';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'next/headers') return { url: 'test:headers', shortCircuit: true };
    if (/(?:^|\/)db$/.test(specifier)) return { url: 'test:db', shortCircuit: true };
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === 'test:headers') return { format: 'module', source: 'export async function headers(){return globalThis.ownerTest.headers}', shortCircuit: true };
    if (url === 'test:db') return { format: 'module', source: 'export async function getD1(){return globalThis.ownerTest.db} export async function getRuntimeEnv(){return globalThis.ownerTest.env}', shortCircuit: true };
    return next(url, context);
  },
});

const { requireActor } = await import('../lib/auth.ts');
const { sha256 } = await import('../lib/password.ts');
const logout = await import('../app/api/auth/logout/route.ts');

function fixture() {
  const database = new DatabaseSync(':memory:');
  database.exec('PRAGMA foreign_keys=ON');
  const dir = new URL('../drizzle/', import.meta.url);
  for (const name of withSyntheticSeed(readdirSync(dir).filter(name => /^\d{4}.*\.sql$/.test(name)).sort())) database.exec(readFileSync(new URL(name, dir), 'utf8'));
  const owner = database.prepare("SELECT id FROM app_employees WHERE lower(email)='admin@ijro.local'").get();
  const db = { prepare(sql) { let args = []; return {
    bind(...values) { args = values; return this; },
    async first() { return database.prepare(sql).get(...args) ?? null; },
    async all() { return { results: database.prepare(sql).all(...args) }; },
    async run() { const result = database.prepare(sql).run(...args); return { meta: { changes: result.changes } }; },
  }; } };
  const env = { TRUST_OAI_AUTHENTICATED_USER_HEADER: 'true', OWNER_SSO_EMAIL: 'admin@ijro.local' };
  const headers = new Headers({ 'oai-authenticated-user-id': 'verified-site-owner-subject', 'oai-authenticated-user-email': env.OWNER_SSO_EMAIL });
  globalThis.ownerTest = { database, db, env, headers, owner };
  return globalThis.ownerTest;
}

test('verified owner enters passwordlessly and binding follows stable subject, not later email changes', async () => {
  const { database, owner, headers } = fixture();
  database.prepare(`INSERT INTO app_user_credentials (employee_id,username,username_normalized,password_hash,password_salt,must_change_password)
    VALUES (?,'sso_test','sso_test','test_hash','test_salt',1) ON CONFLICT(employee_id) DO UPDATE SET must_change_password=1`).run(owner.id);
  assert.equal((await requireActor()).id, owner.id);
  assert.equal((await requireActor()).mustChangePassword, false);
  assert.equal(database.prepare('SELECT must_change_password FROM app_user_credentials WHERE employee_id=?').get(owner.id).must_change_password, 1);
  headers.set('oai-authenticated-user-email', 'changed-contact@example.com');
  assert.equal((await requireActor()).id, owner.id);
  headers.delete('oai-authenticated-user-email');
  assert.equal((await requireActor()).id, owner.id);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_owner_identities').get().n, 1);
});

test('disabled trust, email-only spoofing, wrong owner and a second subject cannot gain access', async () => {
  const { env, headers } = fixture();
  env.TRUST_OAI_AUTHENTICATED_USER_HEADER = 'false';
  await assert.rejects(requireActor(), error => error.status === 401);
  env.TRUST_OAI_AUTHENTICATED_USER_HEADER = 'true';
  headers.delete('oai-authenticated-user-id');
  await assert.rejects(requireActor(), error => error.status === 401);
  headers.set('oai-authenticated-user-id', 'verified-site-owner-subject');
  headers.set('oai-authenticated-user-email', 'other@example.com');
  await assert.rejects(requireActor(), error => error.status === 401);
  headers.set('oai-authenticated-user-email', env.OWNER_SSO_EMAIL);
  await requireActor();
  headers.set('oai-authenticated-user-id', 'different-subject');
  await assert.rejects(requireActor(), error => error.status === 401);
});

test('disabled owner and inactive roles stay blocked after identity enrollment', async () => {
  const { database, owner } = fixture();
  await requireActor();
  // Preserve the last-active-administrator invariant while testing revocation.
  database.prepare("UPDATE app_employees SET role_id=(SELECT id FROM app_roles WHERE code='admin') WHERE id=(SELECT id FROM app_employees WHERE active=1 AND id<>? LIMIT 1)").run(owner.id);
  database.prepare('UPDATE app_employees SET active=0 WHERE id=?').run(owner.id);
  await assert.rejects(requireActor(), error => error.status === 403);
  database.prepare('UPDATE app_employees SET active=1 WHERE id=?').run(owner.id);
  database.prepare('UPDATE app_roles SET active=0 WHERE id=(SELECT role_id FROM app_employees WHERE id=?)').run(owner.id);
  await assert.rejects(requireActor(), error => error.status === 403);
});

test('ordinary sessions retain identity and password-change rules; deliberate SSO clears both old cookies', async () => {
  const { database, headers, owner } = fixture();
  database.prepare(`INSERT INTO app_user_credentials (employee_id,username,username_normalized,password_hash,password_salt,must_change_password)
    VALUES (?,'sso_test','sso_test','test_hash','test_salt',1) ON CONFLICT(employee_id) DO UPDATE SET must_change_password=1`).run(owner.id);
  database.prepare("INSERT INTO app_sessions (token_hash,employee_id,expires_at) VALUES (?,?,strftime('%Y-%m-%dT%H:%M:%fZ','now','+1 hour'))").run(await sha256('test-session'), owner.id);
  headers.set('cookie', 'ijro_session=test-session');
  await assert.rejects(requireActor(), error => error.status === 428);
  const other = database.prepare('SELECT id FROM app_employees WHERE active=1 AND id<>? LIMIT 1').get(owner.id);
  database.prepare('UPDATE app_sessions SET employee_id=? WHERE token_hash=?').run(other.id, await sha256('test-session'));
  assert.equal((await requireActor({ allowPasswordChangeRequired: true })).id, other.id);
  headers.delete('cookie');
  assert.equal((await requireActor()).id, owner.id);
});

test('logout suppresses automatic SSO until the owner deliberately signs in again', async () => {
  const { headers } = fixture();
  await requireActor();
  const response = await logout.POST(new Request('https://test.local/api/auth/logout', { method: 'POST', headers: { origin: 'https://test.local' } }));
  assert.equal(response.status, 200);
  assert.ok(response.headers.getSetCookie().some(value => value.startsWith('ijro_login_only=1')));
  headers.set('cookie', 'ijro_login_only=1');
  await assert.rejects(requireActor(), error => error.status === 401);
  headers.delete('cookie');
  assert.ok(await requireActor());
});
