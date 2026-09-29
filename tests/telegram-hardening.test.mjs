import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Real lib/telegram.ts against an in-memory SQLite with every migration
// applied. Only the runtime environment, auth helpers and the Telegram HTTP
// API (global fetch) are replaced.
registerHooks({
  resolve(specifier, context, next) {
    if (/(?:^|\/)db$/.test(specifier)) return { url: 'test:db', shortCircuit: true };
    if (/(?:^|\/)lib\/auth$/.test(specifier) || (context.parentURL?.includes('/lib/') && specifier === './auth')) return { url: 'test:auth', shortCircuit: true };
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    const sources = {
      'test:db': 'export async function getD1(){return globalThis.tg.db} export async function getRuntimeEnv(){return globalThis.tg.env}',
      'test:auth': `export class ApiError extends Error {constructor(status,message){super(message);this.status=status}}
        export async function organizationScopeIds(){return []}`,
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
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
          const result = database.prepare(sql).run(...bindings);
          return { results: [], meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } };
        },
      };
    },
    async batch(statements) {
      database.exec('BEGIN');
      try { const results = []; for (const statement of statements) results.push(await statement.run()); database.exec('COMMIT'); return results; }
      catch (error) { database.exec('ROLLBACK'); throw error; }
    },
  };
  const sent = [];
  let respond = () => ({ status: 200, body: { ok: true, result: { message_id: 1 } } });
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    if (String(url).endsWith('/answerCallbackQuery')) return Response.json({ ok: true });
    sent.push(body);
    const reply = respond(body);
    return Response.json(reply.body, { status: reply.status });
  };
  globalThis.tg = { db, env: { TELEGRAM_BOT_TOKEN: 'test', TELEGRAM_WEBHOOK_SECRET: 's', SITE_BASE_URL: 'https://ijro.example.uz/' } };
  const admin = database.prepare("SELECT id,role_id,department_id,organization_id FROM app_employees WHERE email='admin@ijro.local'").get();
  const employee = (name, telegram = true) => {
    const id = Number(database.prepare('INSERT INTO app_employees (full_name,role_id,department_id,organization_id,active) VALUES (?,?,?,?,1)')
      .run(name, admin.role_id, admin.department_id, admin.organization_id).lastInsertRowid);
    if (telegram) database.prepare('INSERT INTO app_telegram_accounts (employee_id,telegram_user_id,chat_id) VALUES (?,?,?)').run(id, `u${id}`, `c${id}`);
    return id;
  };
  const task = (title, extra = {}) => Number(database.prepare(`INSERT INTO app_tasks (title,created_by_employee_id,status,progress,archived,deadline_iso) VALUES (?,?,?,?,?,?)`)
    .run(title, extra.creator ?? admin.id, extra.status ?? 'Jarayonda', 0, extra.archived ?? 0, extra.deadline ?? null).lastInsertRowid);
  const jobs = () => database.prepare('SELECT * FROM app_notification_jobs ORDER BY id').all();
  return { database, db, admin, employee, task, jobs, sent, setResponder(fn) { respond = fn; } };
}

const telegram = await import('../lib/telegram.ts');
const { addInformationAiAnswer, reserveAiDailyBudget } = await import('../lib/information-ai.ts');

let updateId = 1000;
const press = (employeeId, data) => telegram.handleTelegramUpdate({ update_id: ++updateId, callback_query: { id: `cb${updateId}`, data, from: { id: `u${employeeId}` }, message: { chat: { id: `c${employeeId}` } } } });

test('Telegram review button submits for review and never closes the task', async () => {
  const f = fixture();
  const executor = f.employee('Ijrochi Bir');
  const taskId = f.task('Hisobot tayyorlash');
  f.database.prepare('INSERT INTO app_task_assignments (task_id,employee_id,assigned_by_employee_id) VALUES (?,?,?)').run(taskId, executor, f.admin.id);
  await press(executor, `task:${taskId}:review`);
  const task = f.database.prepare('SELECT status,progress FROM app_tasks WHERE id=?').get(taskId);
  assert.equal(task.status, 'Ko‘rib chiqilmoqda');
  assert.equal(task.progress, 100);
  assert.equal(f.database.prepare('SELECT assignment_status FROM app_task_assignments WHERE task_id=?').get(taskId).assignment_status, 'Ko‘rib chiqilmoqda');
  assert.equal(f.database.prepare('SELECT COUNT(*) AS n FROM app_tasks').get().n, 1, 'no recurring successor is created by the executor');
  const review = f.jobs().find(job => job.kind === 'task_review_requested');
  assert.equal(review.recipient_employee_id, f.admin.id);

  // Legacy "done" keyboards behave the same way.
  const legacy = f.task('Eski tugma');
  f.database.prepare('INSERT INTO app_task_assignments (task_id,employee_id,assigned_by_employee_id) VALUES (?,?,?)').run(legacy, executor, f.admin.id);
  await press(executor, `task:${legacy}:done`);
  assert.equal(f.database.prepare('SELECT status FROM app_tasks WHERE id=?').get(legacy).status, 'Ko‘rib chiqilmoqda');

  // Archived and closed tasks are refused.
  for (const extra of [{ archived: 1 }, { status: 'Bajarildi' }]) {
    const closed = f.task('Yopilgan', extra);
    f.database.prepare('INSERT INTO app_task_assignments (task_id,employee_id,assigned_by_employee_id,progress) VALUES (?,?,?,0)').run(closed, executor, f.admin.id);
    await press(executor, `task:${closed}:review`);
    assert.equal(f.database.prepare('SELECT progress FROM app_task_assignments WHERE task_id=?').get(closed).progress, 0);
  }
  f.database.close();
});

test('audience submission cannot close the organisation task and creator cannot self-enrol', async () => {
  const f = fixture();
  const member = f.employee('Auditoriya Xodimi');
  const taskId = f.task('Tashkilot topshirig‘i');
  f.database.prepare("INSERT INTO app_task_audiences (task_id,target_type,target_id,created_by_employee_id) VALUES (?,'organization',?,?)").run(taskId, f.admin.organization_id, f.admin.id);
  await press(member, `task:${taskId}:review`);
  assert.notEqual(f.database.prepare('SELECT status FROM app_tasks WHERE id=?').get(taskId).status, 'Bajarildi');
  assert.notEqual(f.database.prepare('SELECT status FROM app_tasks WHERE id=?').get(taskId).status, 'Ko‘rib chiqilmoqda');
  f.database.close();
});

test('audience jobs are created only for linked employees and waiting_link jobs expire', async () => {
  const f = fixture();
  const linked = f.employee('Ulangan');
  const unlinked = f.employee('Ulanmagan', false);
  const taskId = f.task('Auditoriya');
  f.database.prepare("INSERT INTO app_task_audiences (task_id,target_type,target_id,created_by_employee_id) VALUES (?,'organization',?,?)").run(taskId, f.admin.organization_id, f.admin.id);
  await telegram.enqueueTaskAudienceNotifications({ id: taskId, title: 'Auditoriya', deadlineIso: null, priority: 'O‘rta' });
  const recipients = f.jobs().map(job => job.recipient_employee_id);
  assert.ok(recipients.includes(linked));
  assert.ok(!recipients.includes(unlinked));

  f.database.prepare(`INSERT INTO app_notification_jobs (kind,entity_type,entity_id,recipient_employee_id,scheduled_at,next_attempt_at,idempotency_key,payload_json,status,created_at)
    VALUES ('task_created','task',?,?,datetime('now'),datetime('now'),'old-waiting','{"text":"x"}','waiting_link',datetime('now','-2 days'))`).run(taskId, unlinked);
  await telegram.processNotificationJobs(50);
  assert.equal(f.database.prepare("SELECT status FROM app_notification_jobs WHERE idempotency_key='old-waiting'").get().status, 'cancelled');
  f.database.close();
});

test('stale and superseded reminders are cancelled instead of sent', async () => {
  const f = fixture();
  const executor = f.employee('Eslatma');
  const taskId = f.task('Muddatli', { deadline: new Date(Date.now() - 60_000).toISOString() });
  const insert = (key, kind, minutesAgo) => f.database.prepare(`INSERT INTO app_notification_jobs (kind,entity_type,entity_id,recipient_employee_id,scheduled_at,next_attempt_at,idempotency_key,payload_json)
    VALUES (?,'task',?,?,?,datetime('now','-1 minute'),?,'{"text":"eslatma"}')`).run(kind, taskId, executor, new Date(Date.now() - minutesAgo * 60_000).toISOString(), key);
  insert('r3h', 'due_3h', 181);
  insert('r1h', 'due_1h', 61);
  insert('r15', 'due_15m', 16);
  const future = f.task('Kelajak', { deadline: new Date(Date.now() + 50 * 60_000).toISOString() });
  f.database.prepare(`INSERT INTO app_notification_jobs (kind,entity_type,entity_id,recipient_employee_id,scheduled_at,next_attempt_at,idempotency_key,payload_json)
    VALUES ('due_3h','task',?,?,?,datetime('now','-1 minute'),'fresh-old',?)`).run(future, executor, new Date(Date.now() - 130 * 60_000).toISOString(), '{"text":"a"}');
  f.database.prepare(`INSERT INTO app_notification_jobs (kind,entity_type,entity_id,recipient_employee_id,scheduled_at,next_attempt_at,idempotency_key,payload_json)
    VALUES ('due_1h','task',?,?,?,datetime('now','-1 minute'),'fresh-new',?)`).run(future, executor, new Date(Date.now() - 10 * 60_000).toISOString(), '{"text":"b"}');
  await telegram.processNotificationJobs(50);
  const status = key => f.database.prepare('SELECT status FROM app_notification_jobs WHERE idempotency_key=?').get(key).status;
  for (const key of ['r3h', 'r1h', 'r15', 'fresh-old']) assert.equal(status(key), 'cancelled', key);
  assert.equal(status('fresh-new'), 'sent');
  assert.equal(f.sent.length, 1);
  assert.equal(telegram.reminderIsStale('meeting_15m', new Date(Date.now() - 20 * 60_000).toISOString(), new Date()), true);
  assert.equal(telegram.reminderIsStale('task_created', new Date(0).toISOString(), new Date()), false);
  f.database.close();
});

test('chat notifications reveal only the channel name and a link', async () => {
  const f = fixture();
  const sender = f.employee('Yuboruvchi');
  const reader = f.employee('O‘quvchi');
  const channel = Number(f.database.prepare("INSERT INTO app_chat_channels (name,type,active) VALUES ('Umumiy','broadcast',1)").run().lastInsertRowid);
  const message = Number(f.database.prepare("INSERT INTO app_chat_messages (channel_id,sender_employee_id,body) VALUES (?,?,'MAXFIY_MATN')").run(channel, sender).lastInsertRowid);
  await telegram.enqueueChatNotifications({ messageId: message, channelId: channel, senderEmployeeId: sender, senderName: 'Yuboruvchi', channelName: 'Umumiy', body: 'MAXFIY_MATN', fileName: 'shartnoma.pdf' });
  const job = f.jobs().find(item => item.recipient_employee_id === reader);
  const text = JSON.parse(job.payload_json).text;
  assert.equal(text, '💬 Yangi xabar: #Umumiy\nhttps://ijro.example.uz');
  assert.doesNotMatch(text, /MAXFIY|shartnoma|Yuboruvchi/);
  f.database.close();
});

test('delivery errors: 400 fails one job, 403 blocks the account, 429 stops the batch', async () => {
  const f = fixture();
  const a = f.employee('A');
  const b = f.employee('B');
  const taskId = f.task('Xabar');
  const job = (key, recipient) => f.database.prepare(`INSERT INTO app_notification_jobs (kind,entity_type,entity_id,recipient_employee_id,scheduled_at,next_attempt_at,idempotency_key,payload_json)
    VALUES ('task_created','task',?,?,datetime('now'),datetime('now','-1 minute'),?,'{"text":"x"}')`).run(taskId, recipient, key);
  job('bad-request', a);
  f.setResponder(() => ({ status: 400, body: { ok: false, description: 'Bad Request: message is too long' } }));
  await telegram.processNotificationJobs(10);
  assert.equal(f.database.prepare("SELECT status FROM app_notification_jobs WHERE idempotency_key='bad-request'").get().status, 'failed_permanent');
  assert.equal(f.database.prepare('SELECT blocked_at FROM app_telegram_accounts WHERE employee_id=?').get(a).blocked_at, null);

  job('limited-1', a); job('limited-2', b);
  f.setResponder(() => ({ status: 429, body: { ok: false, description: 'Too Many Requests', parameters: { retry_after: 7 } } }));
  const before = f.sent.length;
  await telegram.processNotificationJobs(10);
  assert.equal(f.sent.length - before, 1, 'the batch stops after the first 429');
  const limited = f.database.prepare("SELECT status,attempts FROM app_notification_jobs WHERE idempotency_key='limited-1'").get();
  assert.deepEqual({ ...limited }, { status: 'pending', attempts: 0 });

  f.database.prepare("UPDATE app_notification_jobs SET status='cancelled' WHERE idempotency_key LIKE 'limited%'").run();
  job('blocked', b);
  f.setResponder(() => ({ status: 403, body: { ok: false, description: 'Forbidden: bot was blocked by the user' } }));
  await telegram.processNotificationJobs(10);
  assert.notEqual(f.database.prepare('SELECT blocked_at FROM app_telegram_accounts WHERE employee_id=?').get(b).blocked_at, null);
  f.database.close();
});

test('a failed webhook update is never executed twice', async () => {
  const f = fixture();
  const executor = f.employee('Takror');
  let calls = 0;
  f.setResponder(() => { calls += 1; throw new Error('network down'); });
  const update = { update_id: 555, message: { text: '/vazifalar', chat: { id: `c${executor}`, type: 'private' }, from: { id: `u${executor}` } } };
  f.database.prepare("DROP TABLE app_task_audiences").run(); // force the handler to fail after side effects
  const first = await telegram.handleTelegramUpdate(update);
  assert.equal(first.ok, false);
  const again = await telegram.handleTelegramUpdate(update);
  assert.equal(again.duplicate, true);
  assert.equal(calls, 0);
  f.database.close();
});

test('long bot replies are split under the Telegram limit', () => {
  const lines = Array.from({ length: 300 }, (_, index) => `• ${index} ${'x'.repeat(40)}`);
  const parts = telegram.splitTelegramText(lines.join('\n'));
  assert.ok(parts.length > 1);
  assert.ok(parts.every(part => part.length <= telegram.TELEGRAM_MESSAGE_LIMIT));
  assert.equal(parts.join('\n'), lines.join('\n'));
});

test('AI receives only opted-in values and respects the global daily budget', async () => {
  const f = fixture();
  const result = { query: 'yo‘l', terms: ['yo‘l'], kind: 'all', status: 'all', total: 1, counts: { record: 1, template: 0, research: 0 }, page: 0, pageSize: 20, hasMore: false, generatedAt: '', mode: 'search', aiStatus: 'ready', answer: null,
    results: [{ key: 'record:1', target: { kind: 'record', id: 1, domainId: 1 }, title: 'Yo‘l', domain: 'D', template: 'T', organization: 'O', status: 'published', updatedAt: null, excerpt: 'Summa: 999 MAXFIY', aiExcerpt: 'Summa', restricted: false }] };
  let body = '';
  const ok = async (_url, options) => { body = options.body; return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ text: 'Javob', sourceKeys: ['record:1'] }) }] }] }); };
  const answered = await addInformationAiAnswer(result, { OPENAI_API_KEY: 'k', OPENAI_DAILY_REQUEST_LIMIT: '1', DB: f.db }, undefined, ok);
  assert.equal(answered.aiStatus, 'ready');
  assert.doesNotMatch(body, /MAXFIY|999/);
  const second = await addInformationAiAnswer(result, { OPENAI_API_KEY: 'k', OPENAI_DAILY_REQUEST_LIMIT: '1', DB: f.db }, undefined, ok);
  assert.equal(second.aiStatus, 'unavailable');
  assert.equal(await reserveAiDailyBudget(f.db, 0), false);
  f.database.close();
});
