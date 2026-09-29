import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
});

const policy = await import('../lib/policy/chat.ts');
const service = await import('../services/chat.ts');

const permissions = (overrides = {}) => ({ canManageOrganization: false, canConfigure: false, ...overrides });
const actor = (overrides = {}) => ({ id: 10, roleCode: 'xodim', permissions: permissions(), ...overrides });
const quiet = { perMinute: 0, broadcastPerHour: 0 };
const department = { id: 1, type: 'department', name: 'Bo‘lim suhbati' };
const broadcast = { id: 2, type: 'broadcast', name: 'Umumiy e’lonlar' };

const outcome = (decision) => (decision.allowed ? 'allow' : decision.status);

test('chatPost / chatUpload decision table', () => {
  const cases = [
    ['invisible channel', actor(), null, quiet, 404],
    ['employee posts to own department', actor(), department, quiet, 'allow'],
    ['employee posts to broadcast', actor(), broadcast, quiet, 403],
    ['rahbar posts to broadcast', actor({ roleCode: 'rahbar' }), broadcast, quiet, 'allow'],
    ['admin role posts to broadcast', actor({ roleCode: 'admin' }), broadcast, quiet, 'allow'],
    ['organisation manager posts to broadcast', actor({ permissions: permissions({ canManageOrganization: true }) }), broadcast, quiet, 'allow'],
    ['configurator posts to broadcast', actor({ permissions: permissions({ canConfigure: true }) }), broadcast, quiet, 'allow'],
    ['30 messages in the last minute', actor(), department, { perMinute: 30, broadcastPerHour: 0 }, 429],
    ['29 messages in the last minute', actor(), department, { perMinute: 29, broadcastPerHour: 0 }, 'allow'],
    ['5 announcements this hour', actor({ roleCode: 'rahbar' }), broadcast, { perMinute: 0, broadcastPerHour: 5 }, 429],
    ['announcement cap does not apply to department chats', actor(), department, { perMinute: 0, broadcastPerHour: 9 }, 'allow'],
    ['broadcast right is checked before the rate limit', actor(), broadcast, { perMinute: 99, broadcastPerHour: 99 }, 403],
  ];
  for (const [name, who, channel, counts, expected] of cases) {
    assert.equal(outcome(policy.chatPost(who, channel, counts)), expected, name);
    assert.equal(outcome(policy.chatUpload(who, channel, counts)), expected, `${name} (upload)`);
  }
});

test('chatChannelView, chatGroupManage and chatDirectOpen decision table', () => {
  assert.equal(outcome(policy.chatChannelView(null)), 404);
  assert.equal(outcome(policy.chatChannelView(department)), 'allow');
  const groups = [
    [[], true, 400],
    [[11], true, 'allow'],
    [Array.from({ length: 249 }, (_, index) => index + 100), true, 'allow'],
    [Array.from({ length: 250 }, (_, index) => index + 100), true, 400],
    [[11, 12], false, 400],
  ];
  for (const [memberIds, allMembersActive, expected] of groups) {
    assert.equal(outcome(policy.chatGroupManage(actor(), { memberIds, allMembersActive })), expected, `${memberIds.length} members, active=${allMembersActive}`);
  }
  assert.equal(outcome(policy.chatDirectOpen(actor(), 0, null)), 400);
  assert.equal(outcome(policy.chatDirectOpen(actor(), 10, { id: 10 })), 400, 'not with yourself');
  assert.equal(outcome(policy.chatDirectOpen(actor(), 11, null)), 404, 'inactive or missing employee');
  assert.equal(outcome(policy.chatDirectOpen(actor(), 11, { id: 11 })), 'allow');
});

function database() {
  const sqlite = new DatabaseSync(':memory:');
  const dir = new URL('../drizzle/', import.meta.url);
  for (const name of readdirSync(dir).filter((file) => /^\d{4}.*\.sql$/.test(file)).sort()) sqlite.exec(readFileSync(new URL(name, dir), 'utf8'));
  const db = {
    prepare(sql) {
      let bindings = [];
      return {
        bind(...values) { bindings = values; return this; },
        async first() { const row = sqlite.prepare(sql).get(...bindings); return row ? { ...row } : null; },
        async all() { return { results: sqlite.prepare(sql).all(...bindings).map((row) => ({ ...row })) }; },
        async run() {
          const statement = sqlite.prepare(sql);
          if (statement.columns().length) return { results: statement.all(...bindings), meta: { changes: 0 } };
          const result = statement.run(...bindings);
          return { results: [], meta: { changes: result.changes, last_row_id: Number(result.lastInsertRowid) } };
        },
      };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try { const results = []; for (const statement of statements) results.push(await statement.run()); sqlite.exec('COMMIT'); return results; }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { sqlite, db };
}

test('channel visibility: broadcast for all, department by CURRENT department, groups by explicit membership', async () => {
  const { sqlite, db } = database();
  const departments = sqlite.prepare('SELECT id FROM app_departments ORDER BY id LIMIT 2').all().map((row) => Number(row.id));
  assert.equal(departments.length, 2);
  const [ownDepartment, otherDepartment] = departments;
  const insertChannel = sqlite.prepare("INSERT INTO app_chat_channels (name,type,department_id,created_by_employee_id,active) VALUES (?,?,?,1,?)");
  const broadcastId = Number(insertChannel.run('Umumiy e’lonlar', 'broadcast', null, 1).lastInsertRowid);
  const ownId = Number(insertChannel.run('Own', 'department', ownDepartment, 1).lastInsertRowid);
  const otherId = Number(insertChannel.run('Other', 'department', otherDepartment, 1).lastInsertRowid);
  const groupId = Number(insertChannel.run('Group', 'group', null, 1).lastInsertRowid);
  const closedId = Number(insertChannel.run('Closed', 'group', null, 0).lastInsertRowid);
  sqlite.prepare('INSERT INTO app_chat_members (channel_id,employee_id) VALUES (?,?)').run(groupId, 1);
  sqlite.prepare('INSERT INTO app_chat_members (channel_id,employee_id) VALUES (?,?)').run(closedId, 1);

  const member = { id: 1, departmentId: ownDepartment };
  const stranger = { id: 2, departmentId: otherDepartment };
  const cases = [
    [member, broadcastId, true], [stranger, broadcastId, true],
    [member, ownId, true], [stranger, ownId, false],
    [member, otherId, false], [stranger, otherId, true],
    [member, groupId, true], [stranger, groupId, false],
    [member, closedId, false], [member, 999_999, false], [member, 0, false],
  ];
  for (const [who, channelId, visible] of cases) {
    const channel = await service.loadVisibleChatChannel(db, who, channelId);
    assert.equal(Boolean(channel), visible, `employee ${who.id} → channel ${channelId}`);
    assert.equal(outcome(policy.chatChannelView(channel)), visible ? 'allow' : 404);
  }

  // A read marker in another department's channel never grants access (Y7).
  await assert.rejects(service.markChatRead(db, 1, otherId, 12345), /tegishli emas/);
  sqlite.prepare("INSERT INTO app_chat_read_state (channel_id,employee_id,last_read_message_id) VALUES (?,?,0)").run(otherId, 1);
  assert.equal(await service.loadVisibleChatChannel(db, member, otherId), null);

  // After a transfer, only the new department channel is visible.
  const transferred = { id: 1, departmentId: otherDepartment };
  assert.equal(await service.loadVisibleChatChannel(db, transferred, ownId), null);
  assert.ok(await service.loadVisibleChatChannel(db, transferred, otherId));
});

test('send counts feed the rate-limit decision', async () => {
  const { sqlite, db } = database();
  const channelId = Number(sqlite.prepare("INSERT INTO app_chat_channels (name,type,created_by_employee_id) VALUES ('Umumiy','broadcast',1)").run().lastInsertRowid);
  const insert = sqlite.prepare("INSERT INTO app_chat_messages (channel_id,sender_employee_id,message_type,body) VALUES (?,1,'announcement','x')");
  for (let index = 0; index < 5; index += 1) insert.run(channelId);
  const counts = await service.chatSendCounts(db, 1);
  assert.deepEqual(counts, { perMinute: 5, broadcastPerHour: 5 });
  const channel = await service.loadVisibleChatChannel(db, { id: 1, departmentId: null }, channelId);
  assert.equal(outcome(policy.chatPost({ id: 1, roleCode: 'rahbar', permissions: permissions() }, channel, counts)), 429);
  assert.deepEqual(await service.chatSendCounts(db, 2), { perMinute: 0, broadcastPerHour: 0 });
});
