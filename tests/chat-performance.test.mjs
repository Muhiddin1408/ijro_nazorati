import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Plan item 4: cheap chat reads (lazy defaults, one-statement channel list,
// incremental `since`, 204) and the SSE access filter, against real handlers.
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
      'test:db': 'export async function getD1(){return globalThis.hardening.db} export async function getRuntimeEnv(){return {BUCKET:globalThis.hardening.bucket}}',
      'test:background': 'export function runInBackground(){}',
      'test:telegram': 'export async function enqueueChatNotifications(){} export async function enqueueReportNotification(){} export async function processNotificationJobs(){}',
      'test:auth': `export class ApiError extends Error {constructor(status,message){super(message);this.status=status}}
        export function apiError(error){return Response.json({error:error.message},{status:error.status??500})}
        export function assertSameOrigin(){} export function isSecureRequest(){return false} export function publicOrigin(request){return new URL(request.url).origin} export function requirePermission(actor,key){if(!actor.permissions[key])throw new ApiError(403,'Denied')}
        export async function requireActor(){return globalThis.hardening.actor}
        export async function organizationScopeIds(){return globalThis.hardening.organizationIds}
        export async function employeeIdsInScopes(){return true} export async function audit(){}`,
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const chat = await import('../app/api/chat/route.ts');
const events = await import('../lib/chat-events.ts');

function fixture() {
  const database = new DatabaseSync(':memory:');
  const dir = new URL('../drizzle/', import.meta.url);
  for (const name of withSyntheticSeed(readdirSync(dir).filter(name => /^\d{4}.*\.sql$/.test(name)).sort())) database.exec(readFileSync(new URL(name, dir), 'utf8'));
  const queries = [];
  const db = {
    prepare(sql) {
      queries.push(sql);
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
  globalThis.hardening = { db, bucket: {}, actor: null, organizationIds: [] };
  return { database, db, queries };
}

const basePermissions = { viewScope: 'all', assignScope: 'none', informationScope: 'assigned', canCreateTask: false, canCreateMeeting: false, canExport: false, canManageOrganization: false, canManageRoles: false, canConfigure: false, canViewAudit: false, canUpdateAnyTask: false, canManageReports: false, canManageInformation: false, canViewRestrictedInformation: false, canEnterInformation: false, canSubmitInformation: false, canVerifyInformation: false, canApproveInformation: false };

function employee(database, departmentId, name = 'Sinov xodimi') {
  const role = database.prepare("SELECT id,level FROM app_roles WHERE code='xodim'").get();
  const organizationId = database.prepare('SELECT organization_id FROM app_departments WHERE id=?').get(departmentId)?.organization_id ?? null;
  const row = database.prepare('INSERT INTO app_employees (full_name,position,role_id,department_id,organization_id,active) VALUES (?,?,?,?,?,1) RETURNING id')
    .get(name, 'Mutaxassis', role.id, departmentId, organizationId);
  return { id: row.id, name, email: '', position: 'Mutaxassis', departmentId, department: '', organizationId, organization: '', organizationType: 'committee', managerId: null, roleId: role.id, roleCode: 'xodim', roleName: 'xodim', roleLevel: role.level, username: null, mustChangePassword: false, permissions: { ...basePermissions } };
}

function twoDepartments(database) {
  const [a, b] = database.prepare('SELECT id FROM app_departments WHERE active=1 AND organization_id IS NOT NULL ORDER BY id LIMIT 2').all();
  return [a.id, b.id];
}

const get = (url) => chat.GET(new Request(`https://test.local${url}`));
const post = (body) => chat.POST(new Request('https://test.local/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://test.local' }, body: JSON.stringify(body) }));
const ensureQuery = (sql) => /type='broadcast' AND active=1 ORDER BY id LIMIT 1/.test(sql);

test('default channels are ensured once, not on every chat GET', async () => {
  const { database, queries } = fixture();
  const [departmentId] = twoDepartments(database);
  globalThis.hardening.actor = employee(database, departmentId);
  assert.equal((await get('/api/chat')).status, 200);
  assert.equal(queries.filter(ensureQuery).length, 1);
  for (let index = 0; index < 5; index += 1) assert.equal((await get('/api/chat')).status, 200);
  assert.equal(queries.filter(ensureQuery).length, 1, 'repeated GETs skip the default-channel lookups');
  // A department change re-ensures the new department channel.
  const [, otherDepartment] = twoDepartments(database);
  globalThis.hardening.actor = { ...globalThis.hardening.actor, departmentId: otherDepartment };
  await get('/api/chat');
  assert.equal(queries.filter(ensureQuery).length, 2);
  assert.ok(database.prepare("SELECT id FROM app_chat_channels WHERE type='department' AND department_id=?").get(otherDepartment));
});

test('channel list is one statement with last message, unread and member counts', async () => {
  const { database, queries } = fixture();
  const [departmentId] = twoDepartments(database);
  const reader = employee(database, departmentId, 'O‘quvchi');
  const writer = employee(database, departmentId, 'Yozuvchi');
  globalThis.hardening.actor = reader;
  await get('/api/chat');
  const channelId = database.prepare("SELECT id FROM app_chat_channels WHERE type='department' AND department_id=?").get(departmentId).id;
  globalThis.hardening.actor = writer;
  for (const body of ['birinchi', 'ikkinchi', 'uchinchi']) assert.equal((await post({ channelId, body })).status, 201);
  globalThis.hardening.actor = reader;
  const before = queries.length;
  const listing = await (await get('/api/chat')).json();
  assert.equal(queries.length - before, 1, 'listing channels issues a single query');
  const channel = listing.channels.find((item) => item.id === channelId);
  assert.equal(channel.lastMessage, 'uchinchi');
  assert.equal(channel.unreadCount, 3);
  assert.equal(channel.memberCount, 0);
  const lastId = database.prepare('SELECT MAX(id) AS id FROM app_chat_messages').get().id;
  assert.equal((await post({ action: 'markRead', channelId, messageId: lastId })).status, 200);
  const after = await (await get('/api/chat')).json();
  assert.equal(after.channels.find((item) => item.id === channelId).unreadCount, 0);
  const broadcast = after.channels.find((item) => item.type === 'broadcast');
  assert.equal(broadcast.lastMessage, '');
  assert.equal(broadcast.lastMessageAt, null);
});

test('since returns only newer messages and 204 when there is nothing new', async () => {
  const { database } = fixture();
  const [departmentId] = twoDepartments(database);
  const actor = employee(database, departmentId);
  globalThis.hardening.actor = actor;
  await get('/api/chat');
  const channelId = database.prepare("SELECT id FROM app_chat_channels WHERE type='department' AND department_id=?").get(departmentId).id;
  const first = await (await post({ channelId, body: 'bir' })).json();
  await post({ channelId, body: 'ikki' });
  const full = await (await get(`/api/chat?channelId=${channelId}`)).json();
  assert.deepEqual(full.messages.map((message) => message.body), ['bir', 'ikki']);
  const newer = await (await get(`/api/chat?channelId=${channelId}&since=${first.message.id}`)).json();
  assert.deepEqual(newer.messages.map((message) => message.body), ['ikki']);
  const legacy = await (await get(`/api/chat?channelId=${channelId}&afterId=${first.message.id}`)).json();
  assert.deepEqual(legacy.messages.map((message) => message.body), ['ikki']);
  const lastId = full.messages.at(-1).id;
  const empty = await get(`/api/chat?channelId=${channelId}&since=${lastId}`);
  assert.equal(empty.status, 204);
  assert.equal(await empty.text(), '');
});

test('new messages are published and the SSE filter forwards only accessible channels', async () => {
  const { database, db } = fixture();
  const [departmentA, departmentB] = twoDepartments(database);
  const alice = employee(database, departmentA, 'Alisa');
  const bob = employee(database, departmentB, 'Bobur');
  globalThis.hardening.actor = alice;
  await get('/api/chat');
  globalThis.hardening.actor = bob;
  await get('/api/chat');
  const channelA = database.prepare("SELECT id FROM app_chat_channels WHERE type='department' AND department_id=?").get(departmentA).id;
  const channelB = database.prepare("SELECT id FROM app_chat_channels WHERE type='department' AND department_id=?").get(departmentB).id;
  const broadcast = database.prepare("SELECT id FROM app_chat_channels WHERE type='broadcast'").get().id;

  const received = [];
  const unsubscribe = events.subscribeChatEvents((event) => received.push(event));
  globalThis.hardening.actor = alice;
  const sent = await (await post({ channelId: channelA, body: 'salom' })).json();
  unsubscribe();
  assert.deepEqual(received, [{ channelId: channelA, messageId: sent.message.id }]);

  let clock = 0;
  const bobMay = events.createChatEventFilter(db, bob, () => clock);
  assert.equal(await bobMay({ channelId: channelA, messageId: 1 }), false, 'other department is filtered out');
  assert.equal(await bobMay({ channelId: channelB, messageId: 2 }), true);
  assert.equal(await bobMay({ channelId: broadcast, messageId: 3 }), true);
  // Unknown channels are checked once: a new group Bob belongs to is allowed…
  const group = database.prepare("INSERT INTO app_chat_channels (name,type,created_by_employee_id) VALUES ('Guruh','group',?) RETURNING id").get(alice.id).id;
  database.prepare('INSERT INTO app_chat_members (channel_id,employee_id) VALUES (?,?)').run(group, bob.id);
  assert.equal(await bobMay({ channelId: group, messageId: 4 }), true);
  // …and a department move takes effect after the refresh interval (Y7).
  const moved = { ...bob, departmentId: departmentA };
  const movedMay = events.createChatEventFilter(db, moved, () => clock);
  assert.equal(await movedMay({ channelId: channelB, messageId: 5 }), false);
  database.prepare('DELETE FROM app_chat_members WHERE channel_id=? AND employee_id=?').run(group, bob.id);
  assert.equal(await bobMay({ channelId: group, messageId: 6 }), true, 'cached until refresh');
  clock += events.CHAT_ACCESS_REFRESH_MS;
  assert.equal(await bobMay({ channelId: group, messageId: 7 }), false, 'membership removal applies after refresh');
});

test('SSE stream forwards accessible events, drops others and cleans up on abort', async () => {
  const stream = await import('../app/api/chat/stream/route.ts');
  const { database } = fixture();
  const [departmentA, departmentB] = twoDepartments(database);
  const actor = employee(database, departmentA);
  globalThis.hardening.actor = actor;
  await get('/api/chat');
  globalThis.hardening.actor = employee(database, departmentB, 'Boshqa');
  await get('/api/chat');
  globalThis.hardening.actor = actor;
  const own = database.prepare("SELECT id FROM app_chat_channels WHERE type='department' AND department_id=?").get(departmentA).id;
  const foreign = database.prepare("SELECT id FROM app_chat_channels WHERE type='department' AND department_id=?").get(departmentB).id;

  const controller = new AbortController();
  const response = await stream.GET(new Request('https://test.local/api/chat/stream', { signal: controller.signal }));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/event-stream/);
  assert.equal(response.headers.get('x-accel-buffering'), 'no');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  assert.match(decoder.decode((await reader.read()).value), /retry: 5000/);
  events.publishChatEvent({ channelId: foreign, messageId: 10 });
  events.publishChatEvent({ channelId: own, messageId: 11 });
  const chunk = decoder.decode((await reader.read()).value);
  assert.equal(chunk, `event: message\ndata: {"channelId":${own},"messageId":11}\n\n`, 'foreign channel event is not forwarded');
  controller.abort();
  assert.equal((await reader.read()).done, true);
});
