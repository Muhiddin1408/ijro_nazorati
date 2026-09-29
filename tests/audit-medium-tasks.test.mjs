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
      'test:db': 'export async function getD1(){return globalThis.taskRuntime.db} export async function getRuntimeEnv(){return {TELEGRAM_BOT_TOKEN:""}}',
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
const { nextRecurringDeadline, recurrenceAnchorDay } = await import('../lib/recurrence.ts');
const { meetingDelete, meetingUpdate } = await import('../lib/policy/meetings.ts');
const { reserveTaskAttachment } = await import('../services/task-files.ts');
// The real outbox (the route-level telegram module stays mocked above).
const outbox = await import('../lib/telegram-bot/outbox.ts');

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
const PAST = new Date('2000-01-01T00:00:00Z');

test('monthly recurrence returns to the anchor day in Tashkent time', () => {
  // 31 Jan 2027 18:00 Tashkent = 13:00Z.
  let deadline = '2027-01-31T13:00:00.000Z';
  const anchor = recurrenceAnchorDay(deadline, 'Asia/Tashkent');
  assert.equal(anchor, 31);
  const chain = [];
  for (let i = 0; i < 4; i += 1) {
    deadline = nextRecurringDeadline(deadline, 'Har oy', PAST, anchor, 'Asia/Tashkent');
    chain.push(deadline);
  }
  assert.deepEqual(chain, ['2027-02-28T13:00:00.000Z', '2027-03-31T13:00:00.000Z', '2027-04-30T13:00:00.000Z', '2027-05-31T13:00:00.000Z']);
  assert.equal(nextRecurringDeadline('2028-01-31T13:00:00.000Z', 'Har oy', PAST, 31, 'Asia/Tashkent'), '2028-02-29T13:00:00.000Z');
  assert.equal(nextRecurringDeadline('2027-01-31T13:00:00.000Z', 'Har chorak', PAST, 31, 'Asia/Tashkent'), '2027-04-30T13:00:00.000Z');
  // Weekly and daily keep the time of day.
  assert.equal(nextRecurringDeadline('2027-01-31T13:00:00.000Z', 'Har hafta', PAST, null, 'Asia/Tashkent'), '2027-02-07T13:00:00.000Z');
  assert.equal(nextRecurringDeadline('2027-01-31T13:00:00.000Z', 'Har kuni', PAST, null, 'Asia/Tashkent'), '2027-02-01T13:00:00.000Z');
});

test('a 23:30 Tashkent deadline keeps its local date', () => {
  // 31 Mar 2027 23:30 Tashkent = 18:30Z; in UTC it is still 31 Mar, but 00:30 on 1 Apr would be 19:30Z on 31 Mar.
  assert.equal(recurrenceAnchorDay('2027-03-31T19:30:00.000Z', 'Asia/Tashkent'), 1);
  assert.equal(nextRecurringDeadline('2027-03-31T18:30:00.000Z', 'Har oy', PAST, 31, 'Asia/Tashkent'), '2027-04-30T18:30:00.000Z');
  // 00:30 on 1 Apr Tashkent → 00:30 on 1 May Tashkent (not 30 Apr).
  assert.equal(nextRecurringDeadline('2027-03-31T19:30:00.000Z', 'Har oy', PAST, 1, 'Asia/Tashkent'), '2027-04-30T19:30:00.000Z');
});

test('recurring task creation stores the anchor day', async () => {
  const { database, creator, executor } = fixture();
  const created = await as(creator, 'POST', { title: 'Oylik hisobot', assigneeIds: [executor.id], deadlineIso: '2099-01-31T13:00:00.000Z', recurring: true, recurrence: 'Har oy' });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(database.prepare('SELECT recurrence_anchor_day AS day FROM app_tasks WHERE id=?').get(created.body.task.id).day, 31);
});

test('an overdue task stays editable; only a new deadline must be in the future', async () => {
  const { database, creator, executor } = fixture();
  const created = await as(creator, 'POST', { title: 'Muddati o‘tadigan topshiriq', assigneeIds: [executor.id], deadlineIso: future() });
  const id = created.body.task.id;
  database.prepare("UPDATE app_tasks SET deadline_iso='2020-01-01T09:00:00.000Z' WHERE id=?").run(id);
  const renamed = await as(creator, 'PATCH', { id, title: 'Yangi nom bilan topshiriq' });
  assert.equal(renamed.status, 200, JSON.stringify(renamed.body));
  assert.equal(database.prepare('SELECT title FROM app_tasks WHERE id=?').get(id).title, 'Yangi nom bilan topshiriq');
  const pastDeadline = await as(creator, 'PATCH', { id, deadlineIso: '2021-01-01T09:00:00.000Z' });
  assert.equal(pastDeadline.status, 400);
});

test('re-enqueueing after an edit revives cancelled audience reminders', async () => {
  const { database, creator, member, departmentId } = fixture();
  database.prepare("INSERT INTO app_telegram_accounts (employee_id,telegram_user_id,chat_id,notifications_enabled) VALUES (?,'u1','c1',1)").run(member.id);
  const startsAt = new Date(Date.now() + 3 * 86_400_000).toISOString();
  const meetingId = Number(database.prepare("INSERT INTO app_meetings (title,starts_at,place,format,reminder_minutes,notify_telegram,created_by_employee_id) VALUES ('Kengash',?, 'Zal','Oflayn',30,1,?)").run(startsAt, creator.id).lastInsertRowid);
  database.prepare("INSERT INTO app_meeting_audiences (meeting_id,target_type,target_id,include_descendants,created_by_employee_id) VALUES (?,'department',?,0,?)").run(meetingId, departmentId, creator.id);
  const meeting = { id: meetingId, title: 'Kengash', startsAt, place: 'Zal', reminderMinutes: 30 };
  await outbox.enqueueMeetingAudienceNotifications(meeting);
  const pending = () => database.prepare("SELECT COUNT(*) AS n FROM app_notification_jobs WHERE entity_type='meeting' AND entity_id=? AND recipient_employee_id=? AND status='pending'").get(meetingId, member.id).n;
  const before = pending();
  assert.ok(before >= 3, `expected reminders, got ${before}`);
  // An edit cancels every queued job (services/meetings.ts) …
  database.prepare("UPDATE app_notification_jobs SET status='cancelled' WHERE entity_type='meeting' AND entity_id=?").run(meetingId);
  assert.equal(pending(), 0);
  // … and re-enqueueing the same schedule must bring them back.
  await outbox.enqueueMeetingAudienceNotifications(meeting);
  assert.equal(pending(), before);
  // Sent jobs are never re-sent.
  database.prepare("UPDATE app_notification_jobs SET status='sent' WHERE entity_type='meeting' AND entity_id=? AND kind='meeting_created'").run(meetingId);
  await outbox.enqueueMeetingAudienceNotifications(meeting);
  assert.equal(database.prepare("SELECT status FROM app_notification_jobs WHERE entity_type='meeting' AND entity_id=? AND kind='meeting_created'").get(meetingId).status, 'sent');
});

test('past meetings can be neither edited nor deleted, except delete by a configurator', () => {
  const organizer = { id: 7, permissions: { canCreateMeeting: true, canConfigure: false, canUpdateAnyTask: false } };
  const configurator = { id: 9, permissions: { canCreateMeeting: true, canConfigure: true, canUpdateAnyTask: true, canManageRoles: true } };
  const past = { id: 1, startsAt: '2020-01-01T09:00:00.000Z', createdByEmployeeId: 7 };
  const upcoming = { ...past, startsAt: '2099-01-01T09:00:00.000Z' };
  assert.equal(meetingUpdate(organizer, upcoming).allowed, true);
  assert.deepEqual(meetingUpdate(organizer, past), { allowed: false, status: 409, message: 'Boshlangan yoki o‘tgan yig‘ilishni o‘zgartirib bo‘lmaydi' });
  assert.equal(meetingDelete(organizer, upcoming).allowed, true);
  assert.equal(meetingDelete(organizer, past).status, 409);
  assert.equal(meetingDelete(configurator, past).allowed, true);
  assert.equal(meetingUpdate(configurator, past).status, 409);
});

test('task attachments respect per-task and per-employee daily quotas atomically', async () => {
  const { database, creator, executor } = fixture();
  const one = await as(creator, 'POST', { title: 'Fayllar bilan topshiriq', assigneeIds: [executor.id], deadlineIso: future() });
  const two = await as(creator, 'POST', { title: 'Ikkinchi topshiriq', assigneeIds: [executor.id], deadlineIso: future() });
  process.env.TASK_FILES_MAX_BYTES = '100';
  process.env.TASK_FILES_DAILY_BYTES = '150';
  const db = globalThis.taskRuntime.db;
  const file = (taskId, key, size) => ({ taskId, objectKey: key, fileName: key, contentType: 'text/plain', size, employeeId: executor.id });
  try {
    assert.ok(await reserveTaskAttachment(db, file(one.body.task.id, 'a', 60)));
    await assert.rejects(reserveTaskAttachment(db, file(one.body.task.id, 'b', 50)), (error) => error.status === 413);
    assert.ok(await reserveTaskAttachment(db, file(two.body.task.id, 'c', 80)));
    await assert.rejects(reserveTaskAttachment(db, file(two.body.task.id, 'd', 20)), (error) => error.status === 429);
    // Parallel reservations cannot overshoot the per-task cap.
    const results = await Promise.allSettled([1, 2, 3].map((i) => reserveTaskAttachment(db, { ...file(two.body.task.id, `p${i}`, 10), employeeId: creator.id })));
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 2);
    assert.equal(database.prepare('SELECT SUM(size) AS s FROM app_attachments WHERE task_id=?').get(two.body.task.id).s, 100);
  } finally {
    delete process.env.TASK_FILES_MAX_BYTES;
    delete process.env.TASK_FILES_DAILY_BYTES;
  }
});
