import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Policies are tested as pure functions; the files route runs for real against
// SQLite and the local bucket with only auth, background and Telegram mocked.
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
      'test:db': 'export async function getD1(){return globalThis.fileRuntime.db} export async function getRuntimeEnv(){return {BUCKET:globalThis.fileRuntime.bucket}}',
      'test:background': 'export function runInBackground(){}',
      'test:telegram': 'export async function processNotificationJobs(){}',
      'test:auth': `export class ApiError extends Error {constructor(status,message){super(message);this.status=status}}
        export function apiError(error){return Response.json({error:error.message},{status:error.status??500})}
        export function assertSameOrigin(){} export async function requireActor(){return globalThis.fileRuntime.actor}
        export async function canAccessTask(){return globalThis.fileRuntime.visible}
        export async function organizationScopeIds(){return []} export async function audit(){}`,
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const policy = await import('../lib/policy/tasks.ts');
const meetings = await import('../lib/policy/meetings.ts');
const { limitStream, declaredLength, MAX_TASK_FILE_BYTES } = await import('../services/task-files.ts');
const { LocalBucket } = await import('../db/local-bucket.ts');
const files = await import('../app/api/files/route.ts');

const CREATOR = 1, ASSIGNEE = 2, MEMBER = 3, OUTSIDER = 4, MANAGER = 5;
const actor = (id, extra = {}) => ({ id, permissions: { canCreateTask: false, canUpdateAnyTask: false, ...extra } });
const actors = {
  creator: actor(CREATOR, { canCreateTask: true }),
  assignee: actor(ASSIGNEE),
  forwardingAssignee: actor(ASSIGNEE, { canCreateTask: true }),
  member: actor(MEMBER, { canCreateTask: true }),
  outsider: actor(OUTSIDER),
  manager: actor(MANAGER, { canCreateTask: true, canUpdateAnyTask: true }),
};

/** The context each actor would load for one task. */
function ctxFor(who, task = {}) {
  const base = { id: 9, title: 'T', description: '', deadlineIso: null, priority: 'O‘rta', status: 'Jarayonda', progress: 0, recurring: false, recurrence: null, notifyTelegram: true, topicId: null, createdByEmployeeId: CREATOR, archived: false, ...task };
  const id = actors[who].id;
  if (who === 'outsider') return { task: base, visible: false, assignment: null, audienceMember: false };
  return {
    task: base,
    visible: true,
    assignment: id === ASSIGNEE ? { id: 70, taskId: 9, employeeId: ASSIGNEE, assignedByEmployeeId: CREATOR, parentAssignmentId: null, status: 'Faol', progress: 0 } : null,
    audienceMember: id === MEMBER,
  };
}

const outcome = (decision) => decision.allowed ? 'allow' : decision.status;

const cases = [
  // [policy, actor key, task overrides, expected]
  ['taskView', 'creator', {}, 'allow'], ['taskView', 'member', {}, 'allow'], ['taskView', 'outsider', {}, 404],
  ['taskPin', 'creator', { archived: true }, 'allow'], ['taskPin', 'outsider', {}, 404],
  ['taskUpdateProgress', 'assignee', {}, 'allow'], ['taskUpdateProgress', 'member', {}, 'allow'],
  ['taskUpdateProgress', 'creator', {}, 403], ['taskUpdateProgress', 'manager', {}, 403], ['taskUpdateProgress', 'outsider', {}, 404],
  ['taskUpdateProgress', 'assignee', { archived: true }, 409], ['taskUpdateProgress', 'assignee', { status: 'Bajarildi' }, 409],
  ['taskSubmit', 'assignee', {}, 'allow'],
  ['taskAccept', 'creator', {}, 'allow'], ['taskAccept', 'manager', {}, 'allow'], ['taskAccept', 'assignee', {}, 403],
  ['taskAccept', 'member', {}, 403], ['taskAccept', 'outsider', {}, 404], ['taskAccept', 'creator', { archived: true }, 409],
  ['taskAccept', 'creator', { status: 'Bajarildi' }, 409],
  ['taskReturn', 'creator', {}, 'allow'], ['taskReturn', 'assignee', {}, 403],
  ['taskEdit', 'creator', {}, 'allow'], ['taskEdit', 'assignee', {}, 403], ['taskEdit', 'creator', { status: 'Bajarildi' }, 409],
  ['taskForward', 'creator', {}, 'allow'], ['taskForward', 'forwardingAssignee', {}, 'allow'], ['taskForward', 'assignee', {}, 403],
  ['taskForward', 'member', {}, 403], ['taskForward', 'manager', {}, 'allow'], ['taskForward', 'outsider', {}, 404],
  ['taskForward', 'creator', { archived: true }, 409],
  ['taskArchive', 'manager', {}, 'allow'], ['taskArchive', 'creator', {}, 403], ['taskArchive', 'manager', { archived: true }, 409],
  ['fileUpload', 'creator', {}, 'allow'], ['fileUpload', 'assignee', {}, 'allow'], ['fileUpload', 'manager', {}, 'allow'],
  ['fileUpload', 'member', {}, 403], ['fileUpload', 'outsider', {}, 404], ['fileUpload', 'assignee', { archived: true }, 409],
  ['fileDownload', 'member', {}, 'allow'], ['fileDownload', 'outsider', {}, 404],
];

test('task policies decide for creator, assignee, audience member, outsider, manager and archived tasks', () => {
  for (const [name, who, task, expected] of cases) {
    assert.equal(outcome(policy[name](actors[who], ctxFor(who, task))), expected, `${name} as ${who} ${JSON.stringify(task)}`);
  }
  assert.equal(outcome(policy.taskAccept(actors.creator, null)), 404, 'missing task is not found');
  assert.equal(outcome(policy.taskCreate(actors.assignee)), 403);
  assert.equal(outcome(policy.taskCreate(actors.creator)), 'allow');
  assert.equal(outcome(policy.taskAssignees(actors.creator, [ASSIGNEE], true)), 'allow');
  assert.equal(outcome(policy.taskAssignees(actors.creator, [CREATOR, ASSIGNEE], true)), 403, 'the giver cannot assign themself');
  assert.equal(outcome(policy.taskAssignees(actors.creator, [ASSIGNEE], false)), 403, 'assignees must be in scope');
});

test('evidence files cannot be deleted from accepted or archived tasks', () => {
  const file = (uploader) => ({ id: 1, taskId: 9, objectKey: 'k', fileName: 'a.pdf', contentType: null, size: 1, uploadedByEmployeeId: uploader, createdAt: '' });
  assert.equal(outcome(policy.fileDelete(actors.assignee, ctxFor('assignee'), file(ASSIGNEE))), 'allow');
  assert.equal(outcome(policy.fileDelete(actors.creator, ctxFor('creator'), file(ASSIGNEE))), 403, 'only the uploader');
  assert.equal(outcome(policy.fileDelete(actors.manager, ctxFor('manager'), file(ASSIGNEE))), 'allow');
  assert.equal(outcome(policy.fileDelete(actors.assignee, ctxFor('assignee', { status: 'Bajarildi' }), file(ASSIGNEE))), 409);
  assert.equal(outcome(policy.fileDelete(actors.manager, ctxFor('manager', { archived: true }), file(ASSIGNEE))), 409);
  assert.equal(outcome(policy.fileDelete(actors.outsider, ctxFor('outsider'), file(OUTSIDER))), 404);
  assert.equal(outcome(policy.fileDelete(actors.assignee, ctxFor('assignee'), null)), 404);
});

test('meeting policies require create rights and the organizer or a role manager', () => {
  const meeting = { id: 1, title: 'Y', startsAt: '', endsAt: null, place: 'X', format: 'Oflayn', reminderMinutes: 30, notifyTelegram: true, createdByEmployeeId: CREATOR };
  const perms = (extra) => ({ canCreateMeeting: true, canManageRoles: false, ...extra });
  assert.equal(outcome(meetings.meetingCreate({ id: 2, permissions: perms({ canCreateMeeting: false }) })), 403);
  assert.equal(outcome(meetings.meetingUpdate({ id: CREATOR, permissions: perms() }, meeting)), 'allow');
  assert.equal(outcome(meetings.meetingUpdate({ id: 2, permissions: perms() }, meeting)), 403);
  assert.equal(outcome(meetings.meetingDelete({ id: 2, permissions: perms({ canManageRoles: true }) }, meeting)), 'allow');
  assert.equal(outcome(meetings.meetingDelete({ id: CREATOR, permissions: perms() }, null)), 404);
});

test('upload size is bounded before and while the body is read', async () => {
  assert.throws(() => declaredLength(new Request('https://t/', { method: 'POST', body: 'x', duplex: 'half' })), (error) => error.status === 411);
  assert.equal(declaredLength(new Request('https://t/', { method: 'POST', body: 'x', headers: { 'content-length': '1' }, duplex: 'half' })), 1);
  const chunks = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(6)); controller.enqueue(new Uint8Array(6)); controller.close(); } });
  await assert.rejects(new Response(limitStream(chunks, 10)).arrayBuffer(), (error) => error.status === 413);
  const small = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(4)); controller.close(); } });
  assert.equal((await new Response(limitStream(small, 10)).arrayBuffer()).byteLength, 4);
});

function fileFixture() {
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
  const storage = mkdtempSync(join(tmpdir(), 'ijro-task-files-'));
  const admin = database.prepare("SELECT id FROM app_employees WHERE email='admin@ijro.local'").get().id;
  const roleId = database.prepare("SELECT id FROM app_roles WHERE code='xodim'").get().id;
  const executor = Number(database.prepare('INSERT INTO app_employees (full_name,role_id,active) VALUES (?,?,1)').run('Ijrochi', roleId).lastInsertRowid);
  const taskId = Number(database.prepare("INSERT INTO app_tasks (title,created_by_employee_id,status) VALUES ('Isbot',?, 'Jarayonda')").run(admin).lastInsertRowid);
  database.prepare('INSERT INTO app_task_assignments (task_id,employee_id,assigned_by_employee_id) VALUES (?,?,?)').run(taskId, executor, admin);
  globalThis.fileRuntime = {
    db,
    bucket: new LocalBucket(storage),
    visible: true,
    actor: { id: executor, permissions: { canCreateTask: false, canUpdateAnyTask: false } },
  };
  return { database, storage, taskId, cleanup() { database.close(); rmSync(storage, { recursive: true, force: true }); } };
}

const neverRead = () => new ReadableStream({ pull() { throw new Error('body must not be read'); } });
const upload = (query, body, headers) => files.POST(new Request(`https://test.local/api/files?${query}`, { method: 'POST', body, headers, duplex: 'half' }));

test('task file uploads stream to storage and are rejected by size before reading', async () => {
  const f = fileFixture();
  try {
    const tooLarge = await upload(`taskId=${f.taskId}&fileName=big.bin`, neverRead(), { 'content-length': String(MAX_TASK_FILE_BYTES + 1), 'content-type': 'application/octet-stream' });
    assert.equal(tooLarge.status, 413);
    const multipartTooLarge = await upload('', neverRead(), { 'content-length': String(MAX_TASK_FILE_BYTES * 2), 'content-type': 'multipart/form-data; boundary=x' });
    assert.equal(multipartTooLarge.status, 413);

    const lying = await upload(`taskId=${f.taskId}&fileName=lie.txt`, new Blob(['0123456789ABCDEF']).stream(), { 'content-length': '4', 'content-type': 'text/plain' });
    assert.equal(lying.status, 413, 'a body longer than declared is cut off');
    assert.equal(f.database.prepare('SELECT COUNT(*) AS n FROM app_attachments').get().n, 0);

    const ok = await upload(`taskId=${f.taskId}&fileName=dalil.txt`, new Blob(['dalil']).stream(), { 'content-length': '5', 'content-type': 'text/plain' });
    assert.equal(ok.status, 201, await ok.clone().text());
    const { attachment } = await ok.json();
    const download = await files.GET(new Request(`https://test.local/api/files?id=${attachment.id}`));
    assert.equal(await download.text(), 'dalil');

    // Once the task is accepted the evidence file stays.
    f.database.prepare("UPDATE app_tasks SET status='Bajarildi' WHERE id=?").run(f.taskId);
    const removed = await files.DELETE(new Request(`https://test.local/api/files?id=${attachment.id}`, { method: 'DELETE' }));
    assert.equal(removed.status, 409);
    assert.equal(f.database.prepare('SELECT COUNT(*) AS n FROM app_attachments').get().n, 1);

    globalThis.fileRuntime.visible = false;
    globalThis.fileRuntime.actor = { id: 999999, permissions: { canCreateTask: false, canUpdateAnyTask: false } };
    assert.equal((await files.GET(new Request(`https://test.local/api/files?id=${attachment.id}`))).status, 404);
  } finally {
    f.cleanup();
  }
});
