import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Audit Y6–Y10: real route handlers against SQLite. Only authentication,
// environment, background work and Telegram delivery are mocked.
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
const chatLib = await import('../lib/chat.ts');
const information = await import('../app/api/information/route.ts');
const informationFiles = await import('../app/api/information/files/route.ts');
const info = await import('../lib/information.ts');
const workflow = await import('../lib/information-workflow.ts');

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
  const bucket = { async put(_key, body) { return { size: (await new Response(body).arrayBuffer()).byteLength }; }, async delete() {}, async get() { return { body: 'secret-bytes', size: 12 }; } };
  globalThis.hardening = { db, bucket, actor: null, organizationIds: database.prepare('SELECT id FROM app_organizations').all().map(row => row.id) };
  return { database, db };
}

const basePermissions = { viewScope: 'all', assignScope: 'none', informationScope: 'assigned', canCreateTask: false, canCreateMeeting: false, canExport: false, canManageOrganization: false, canManageRoles: false, canConfigure: false, canViewAudit: false, canUpdateAnyTask: false, canManageReports: false, canManageInformation: false, canViewRestrictedInformation: false, canEnterInformation: false, canSubmitInformation: false, canVerifyInformation: false, canApproveInformation: false };

function employee(database, { departmentId, roleCode = 'xodim', name = 'Sinov xodimi' }) {
  const role = database.prepare('SELECT id,level FROM app_roles WHERE code=?').get(roleCode);
  const organizationId = database.prepare('SELECT organization_id FROM app_departments WHERE id=?').get(departmentId)?.organization_id ?? null;
  const row = database.prepare('INSERT INTO app_employees (full_name,position,role_id,department_id,organization_id,active) VALUES (?,?,?,?,?,1) RETURNING id')
    .get(name, 'Mutaxassis', role.id, departmentId, organizationId);
  return { id: row.id, name, email: '', position: 'Mutaxassis', departmentId, department: '', organizationId, organization: '', organizationType: 'committee', managerId: null, roleId: role.id, roleCode, roleName: roleCode, roleLevel: role.level, username: null, mustChangePassword: false, permissions: { ...basePermissions } };
}

const post = (url, body) => new Request(`https://test.local${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://test.local' }, body: JSON.stringify(body) });
const patch = (url, body) => new Request(`https://test.local${url}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Origin: 'https://test.local' }, body: JSON.stringify(body) });

function twoDepartments(database) {
  const [a, b] = database.prepare('SELECT id FROM app_departments WHERE active=1 AND organization_id IS NOT NULL ORDER BY id LIMIT 2').all();
  return [a.id, b.id];
}

async function broadcastChannelId(actor) {
  globalThis.hardening.actor = actor;
  await chat.GET(new Request('https://test.local/api/chat'));
  return (await globalThis.hardening.db.prepare("SELECT id FROM app_chat_channels WHERE type='broadcast'").first()).id;
}

test('Y6: only leadership and organisation managers post to the broadcast channel', async () => {
  const { database } = fixture();
  const [departmentId] = twoDepartments(database);
  const ordinary = employee(database, { departmentId });
  const channelId = await broadcastChannelId(ordinary);
  let response = await chat.POST(post('/api/chat', { channelId, body: 'Soxta rasmiy e’lon' }));
  assert.equal(response.status, 403);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_chat_messages').get().n, 0);
  const listing = await (await chat.GET(new Request('https://test.local/api/chat'))).json();
  assert.equal(listing.canPostToBroadcast, false);

  const manager = { ...employee(database, { departmentId, name: 'Tashkilot boshqaruvchisi' }), permissions: { ...basePermissions, canManageOrganization: true } };
  globalThis.hardening.actor = manager;
  response = await chat.POST(post('/api/chat', { channelId, body: 'Rasmiy e’lon' }));
  assert.equal(response.status, 201);
  const leader = employee(database, { departmentId, roleCode: 'rahbar', name: 'Rahbar' });
  assert.equal(chatLib.canPostToBroadcast(leader), true);
  assert.equal(chatLib.canPostToBroadcast(ordinary), false);
});

test('Y6: per-employee send rate limits apply to every channel and to broadcasts', async () => {
  const { database } = fixture();
  const [departmentId] = twoDepartments(database);
  const sender = employee(database, { departmentId });
  const broadcastId = await broadcastChannelId(sender);
  const departmentChannel = database.prepare("SELECT id FROM app_chat_channels WHERE type='department' AND department_id=?").get(departmentId).id;
  const insert = database.prepare("INSERT INTO app_chat_messages (channel_id,sender_employee_id,message_type,body) VALUES (?,?,'text','x')");
  for (let index = 0; index < chatLib.CHAT_MESSAGES_PER_MINUTE; index += 1) insert.run(departmentChannel, sender.id);
  let response = await chat.POST(post('/api/chat', { channelId: departmentChannel, body: 'yana bitta' }));
  assert.equal(response.status, 429);
  database.prepare("UPDATE app_chat_messages SET created_at=datetime('now','-2 minutes')").run();
  response = await chat.POST(post('/api/chat', { channelId: departmentChannel, body: 'bir daqiqadan keyin' }));
  assert.equal(response.status, 201);

  const leader = employee(database, { departmentId, roleCode: 'rahbar', name: 'E’lon beruvchi' });
  globalThis.hardening.actor = leader;
  for (let index = 0; index < chatLib.BROADCAST_MESSAGES_PER_HOUR; index += 1) {
    database.prepare("INSERT INTO app_chat_messages (channel_id,sender_employee_id,message_type,body,created_at) VALUES (?,?,'announcement','e',datetime('now','-10 minutes'))").run(broadcastId, leader.id);
  }
  response = await chat.POST(post('/api/chat', { channelId: broadcastId, body: 'oltinchi e’lon' }));
  assert.equal(response.status, 429);
});

test('Y7: a read marker never keeps access after the employee changes department', async () => {
  const { database } = fixture();
  const [departmentA, departmentB] = twoDepartments(database);
  const mover = employee(database, { departmentId: departmentA });
  const colleague = employee(database, { departmentId: departmentA, name: 'Hamkasb' });
  globalThis.hardening.actor = colleague;
  await chat.GET(new Request('https://test.local/api/chat'));
  const channelId = database.prepare("SELECT id FROM app_chat_channels WHERE type='department' AND department_id=?").get(departmentA).id;
  assert.equal((await chat.POST(post('/api/chat', { channelId, body: 'Bo‘lim xabari' }))).status, 201);
  const messageId = database.prepare('SELECT MAX(id) AS id FROM app_chat_messages').get().id;

  globalThis.hardening.actor = mover;
  assert.equal((await chat.POST(post('/api/chat', { action: 'markRead', channelId, messageId }))).status, 200);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_chat_members WHERE channel_id=?').get(channelId).n, 0);
  assert.equal(database.prepare('SELECT last_read_message_id AS id FROM app_chat_read_state WHERE channel_id=? AND employee_id=?').get(channelId, mover.id).id, messageId);

  // Department transfer: the old channel, its messages and posting close immediately.
  database.prepare('UPDATE app_employees SET department_id=? WHERE id=?').run(departmentB, mover.id);
  globalThis.hardening.actor = { ...mover, departmentId: departmentB };
  assert.equal(await chatLib.canAccessChatChannel(globalThis.hardening.actor, channelId), false);
  assert.equal((await chat.GET(new Request(`https://test.local/api/chat?channelId=${channelId}`))).status, 404);
  assert.equal((await chat.POST(post('/api/chat', { channelId, body: 'eski bo‘limga' }))).status, 404);
  const channels = (await (await chat.GET(new Request('https://test.local/api/chat'))).json()).channels;
  assert.ok(!channels.some(channel => channel.id === channelId));

  // Even a stray membership insert cannot re-open a department channel.
  database.prepare('INSERT INTO app_chat_members (channel_id,employee_id) VALUES (?,?)').run(channelId, mover.id);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_chat_members WHERE channel_id=?').get(channelId).n, 0);
});

function sensitiveInformationFixture() {
  const state = fixture();
  const { database } = state;
  const template = database.prepare("SELECT id,domain_id FROM app_information_templates WHERE active=1 AND catalog_state='current' AND visibility<>'restricted' ORDER BY id LIMIT 1").get();
  database.prepare('UPDATE app_information_domains SET visibility=\'internal\' WHERE id=? AND visibility=\'restricted\'').run(template.domain_id);
  database.prepare('UPDATE app_information_templates SET fields_json=? WHERE id=?').run(JSON.stringify([
    { code: 'nomi', label: 'Nomi', type: 'text', required: true },
    { code: 'pasport', label: 'Pasport', type: 'text', required: false, sensitive: true },
    { code: 'hujjat', label: 'Hujjat', type: 'file', required: false, sensitive: true },
  ]), template.id);
  database.prepare('DELETE FROM app_information_template_workflows WHERE template_id=?').run(template.id);
  const [departmentId] = twoDepartments(database);
  const admin = { ...employee(database, { departmentId, roleCode: 'admin', name: 'Axborot administratori' }), organizationType: 'committee' };
  const informationPermissions = { ...basePermissions, viewScope: 'all', informationScope: 'all', canManageRoles: true, canManageInformation: true, canEnterInformation: true, canSubmitInformation: true, canVerifyInformation: true, canApproveInformation: true };
  const privileged = { ...admin, permissions: { ...informationPermissions, canViewRestrictedInformation: true } };
  const unprivileged = { ...admin, permissions: { ...informationPermissions, canViewRestrictedInformation: false } };
  return { ...state, template, privileged, unprivileged };
}

test('Y9: sensitive values, their search and their files are hidden without the restricted right', async () => {
  const { database, template, privileged, unprivileged } = sensitiveInformationFixture();
  globalThis.hardening.actor = privileged;
  const created = await information.POST(post('/api/information', { templateId: template.id, title: 'Maxfiy yozuv', values: { nomi: 'Ochiq', pasport: 'AA1234567' } }));
  assert.equal(created.status, 201, JSON.stringify(await created.clone().json()));
  const recordId = (await created.json()).id;
  const file = database.prepare("INSERT INTO app_information_files (record_id,field_code,object_key,file_name,content_type,size,uploaded_by_employee_id) VALUES (?,'hujjat','k','pasport.pdf','application/pdf',12,?) RETURNING id").get(recordId, privileged.id);

  let detail = await (await information.GET(new Request(`https://test.local/api/information?recordId=${recordId}`))).json();
  assert.equal(detail.record.values.pasport, 'AA1234567');
  assert.equal(detail.files.length, 1);
  assert.equal((await informationFiles.GET(new Request(`https://test.local/api/information/files?id=${file.id}`))).status, 200);

  globalThis.hardening.actor = unprivileged;
  detail = await (await information.GET(new Request(`https://test.local/api/information?recordId=${recordId}`))).json();
  assert.equal(detail.record.values.nomi, 'Ochiq');
  assert.equal('pasport' in detail.record.values, false);
  assert.deepEqual(detail.record.redactedFields, ['pasport']);
  assert.equal(detail.files.length, 0);
  assert.equal((await informationFiles.GET(new Request(`https://test.local/api/information/files?id=${file.id}`))).status, 404);
  const list = await (await information.GET(new Request(`https://test.local/api/information?templateId=${template.id}&view=template`))).json();
  const listed = list.records.find(record => record.id === recordId);
  assert.ok(listed && !('pasport' in listed.values));
  const bySecret = await (await information.GET(new Request(`https://test.local/api/information?templateId=${template.id}&view=template&q=AA1234`))).json();
  assert.equal(bySecret.records.length, 0, 'sensitive values are not searchable without the right');
  const byOpenValue = await (await information.GET(new Request(`https://test.local/api/information?templateId=${template.id}&view=template&q=Ochiq`))).json();
  assert.equal(byOpenValue.records.length, 1);

  // Saving without seeing the sensitive field keeps its stored value intact.
  const saved = await information.PATCH(patch('/api/information', { id: recordId, expectedVersion: 1, action: 'save', values: { nomi: 'Yangilangan', pasport: '' } }));
  assert.equal(saved.status, 200, JSON.stringify(await saved.clone().json()));
  const stored = JSON.parse(database.prepare('SELECT values_json FROM app_information_records WHERE id=?').get(recordId).values_json);
  assert.equal(stored.nomi, 'Yangilangan');
  assert.equal(stored.pasport, 'AA1234567');
});

test('Y8: nobody, administrators included, approves an information record they created', async () => {
  const { db, database } = fixture();
  const [departmentId] = twoDepartments(database);
  const admin = employee(database, { departmentId, roleCode: 'admin', name: 'Administrator' });
  const step = { step_code: 'central_owner_approval', organization_id: admin.organizationId, department_id: departmentId };
  assert.equal(await workflow.canActorApproveInformationStep(db, admin, 1, admin.id, step), false);
  assert.equal(await workflow.canActorApproveInformationStep(db, admin, 1, admin.id + 1, step), true);
});

test('Y10: a pending approval opens only that record, never the rest of its theme', () => {
  const access = { visible: [1, 2], editable: [], reviewable: [], restricted: [], recordDomains: [1], queueRecordIds: [77] };
  assert.equal(info.canOpenInformationRecord(access, { recordId: 77, domainId: 2, templateVisibility: 'restricted' }), true);
  assert.equal(info.canOpenInformationRecord(access, { recordId: 78, domainId: 2, templateVisibility: 'internal' }), false);
  assert.equal(info.canOpenInformationRecord(access, { recordId: 5, domainId: 1, templateVisibility: 'internal' }), true);
  assert.equal(info.canOpenInformationRecord(access, { recordId: 6, domainId: 1, templateVisibility: 'restricted' }), false);
  const predicate = info.informationRecordAccessSql(access);
  assert.match(predicate.sql, /t\.domain_id IN \(\?\)/);
  assert.match(predicate.sql, /r\.id IN \(\?\)/);
  assert.deepEqual(predicate.binds, [1, 77]);
  assert.equal(info.informationRecordAccessSql({ ...access, recordDomains: [], queueRecordIds: [] }).sql, '0=1');
});

test('Y10: the review queue uses the same predicate as the approval handler', async () => {
  const { db, database } = fixture();
  const [departmentId] = twoDepartments(database);
  const template = database.prepare("SELECT id,domain_id FROM app_information_templates WHERE active=1 AND visibility<>'restricted' ORDER BY id LIMIT 1").get();
  const creator = employee(database, { departmentId, name: 'Kirituvchi' });
  const reviewer = employee(database, { departmentId, name: 'Navbat tekshiruvchisi' });
  const profile = database.prepare("INSERT INTO app_access_profiles (code,name,can_approve_information) VALUES ('queue_reviewer','Navbat',1)").run();
  database.prepare("INSERT INTO app_access_profile_assignments (principal_type,principal_id,access_profile_id,scope_type,scope_id) VALUES ('employee',?,?,'department',?)")
    .run(reviewer.id, Number(profile.lastInsertRowid), departmentId);
  const record = (status) => database.prepare(`INSERT INTO app_information_records
    (template_id,organization_id,department_id,title,status,values_json,created_by_employee_id,updated_by_employee_id)
    VALUES (?,?,?,?,?,'{}',?,?) RETURNING id`).get(template.id, creator.organizationId, departmentId, `Yozuv ${status}`, status, creator.id, creator.id).id;
  const queued = record('submitted');
  const otherDraft = record('draft');
  database.prepare(`INSERT INTO app_information_record_approval_steps (record_id,sequence_no,step_code,step_name,organization_id,department_id)
    VALUES (?,1,'central_owner_approval','Egasi tasdig‘i',?,?)`).run(queued, creator.organizationId, departmentId);

  const queue = await info.informationReviewQueue(db, reviewer);
  assert.deepEqual(queue.map(item => item.recordId), [queued]);
  const step = database.prepare('SELECT * FROM app_information_record_approval_steps WHERE record_id=?').get(queued);
  assert.equal(await workflow.canActorApproveInformationStep(db, reviewer, template.domain_id, creator.id, step), true);
  // The creator is never in their own queue.
  assert.deepEqual(await info.informationReviewQueue(db, creator), []);

  const access = await info.informationDomainAccess(reviewer, db);
  assert.deepEqual(access.queueRecordIds, [queued]);
  assert.ok(access.visible.includes(template.domain_id), 'the theme is listed for navigation');
  assert.ok(!access.recordDomains.includes(template.domain_id), 'but its other records stay closed');
  assert.ok(!access.restricted.includes(template.domain_id));
  assert.equal(info.canOpenInformationRecord(access, { recordId: queued, domainId: template.domain_id, templateVisibility: 'internal' }), true);
  assert.equal(info.canOpenInformationRecord(access, { recordId: otherDraft, domainId: template.domain_id, templateVisibility: 'internal' }), false);

  // Once the step is decided the record leaves the queue and access closes.
  database.prepare("UPDATE app_information_record_approval_steps SET status='approved' WHERE record_id=?").run(queued);
  assert.deepEqual((await info.informationDomainAccess(reviewer, db)).queueRecordIds, []);
});
