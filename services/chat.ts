/**
 * Chat business operations. Authorization is decided by lib/policy/chat.ts;
 * this module only loads the facts those decisions need and performs the writes.
 */
import type { Actor } from "../lib/auth";
import { ApiError } from "../lib/errors";
import type { ChatSendCounts, VisibleChatChannel } from "../lib/policy/chat";

type Row = Record<string, unknown>;
type ChatDb = D1Database;
type ChatActor = Pick<Actor, "id" | "departmentId">;

/**
 * Channel visibility. Broadcast is visible to everyone, a department channel only
 * to the employee's CURRENT department, and group/direct channels to their
 * explicit members. Read markers live in app_chat_read_state and never grant access.
 * Bind order: (actor.departmentId, actor.id).
 */
export const CHAT_CHANNEL_ACCESS_SQL = `(
  c.type='broadcast'
  OR (c.type='department' AND c.department_id=?)
  OR (c.type IN ('group','direct') AND EXISTS (SELECT 1 FROM app_chat_members m WHERE m.channel_id=c.id AND m.employee_id=?))
)`;

export type ChatChannelSummary = {
  id: number;
  name: string;
  type: string;
  departmentId: number | null;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  memberCount: number;
};

/** The channel if it exists, is active and is visible to the actor; otherwise null. */
export async function loadVisibleChatChannel(db: ChatDb, actor: ChatActor, channelId: number): Promise<VisibleChatChannel> {
  if (!Number.isSafeInteger(channelId) || channelId <= 0) return null;
  const row = await db.prepare(
    `SELECT c.id,c.type,c.name FROM app_chat_channels c
      WHERE c.id=? AND c.active=1 AND ${CHAT_CHANNEL_ACCESS_SQL} LIMIT 1`,
  ).bind(channelId, actor.departmentId, actor.id).first<{ id: number; type: string; name: string }>();
  return row ? { id: Number(row.id), type: String(row.type), name: String(row.name) } : null;
}

/** Messages the actor sent in the last minute, and announcements in the last hour. */
export async function chatSendCounts(db: ChatDb, actorId: number): Promise<ChatSendCounts> {
  const recent = await db.prepare(
    `SELECT
       (SELECT COUNT(*) FROM app_chat_messages WHERE sender_employee_id=? AND created_at>=datetime('now','-1 minute')) AS per_minute,
       (SELECT COUNT(*) FROM app_chat_messages m JOIN app_chat_channels bc ON bc.id=m.channel_id AND bc.type='broadcast'
         WHERE m.sender_employee_id=? AND m.created_at>=datetime('now','-1 hour')) AS broadcast_per_hour`,
  ).bind(actorId, actorId).first<{ per_minute: number; broadcast_per_hour: number }>();
  return { perMinute: Number(recent?.per_minute ?? 0), broadcastPerHour: Number(recent?.broadcast_per_hour ?? 0) };
}

// Default channels only need to be ensured once per employee+department per
// database and process; later GETs skip the lookups entirely.
const ensuredDefaults = new WeakMap<object, Set<string>>();

export async function ensureDefaultChatChannels(db: ChatDb, actor: ChatActor) {
  const key = `${actor.id}:${actor.departmentId ?? "-"}`;
  let ensured = ensuredDefaults.get(db);
  if (!ensured) {
    ensured = new Set();
    ensuredDefaults.set(db, ensured);
  }
  if (ensured.has(key)) return;
  await createDefaultChatChannels(db, actor);
  ensured.add(key);
}

async function createDefaultChatChannels(db: ChatDb, actor: ChatActor) {
  const broadcast = await db.prepare("SELECT id FROM app_chat_channels WHERE type='broadcast' AND active=1 ORDER BY id LIMIT 1")
    .first<{ id: number }>();
  if (!broadcast) {
    await db.prepare("INSERT INTO app_chat_channels (name,type,created_by_employee_id) VALUES ('Umumiy e’lonlar','broadcast',?)")
      .bind(actor.id).run();
  }
  if (actor.departmentId != null) {
    const existing = await db.prepare("SELECT id FROM app_chat_channels WHERE type='department' AND department_id=? AND active=1 LIMIT 1")
      .bind(actor.departmentId).first();
    if (!existing) {
      await db.prepare(
        `INSERT OR IGNORE INTO app_chat_channels (name,type,department_id,created_by_employee_id)
         SELECT name || ' suhbati','department',id,? FROM app_departments WHERE id=?`,
      ).bind(actor.id, actor.departmentId).run();
    }
  }
}

/**
 * The actor's channel list in one statement: each channel's last message id is
 * looked up once through the (channel_id,id) index and joined by primary key;
 * unread messages are counted only where something is newer than the read marker.
 */
export async function listChatChannels(db: ChatDb, actor: ChatActor): Promise<ChatChannelSummary[]> {
  const channels = await db.prepare(
    `WITH visible AS (
       SELECT c.id,c.name,c.type,c.department_id,c.created_at,
              (SELECT MAX(lm.id) FROM app_chat_messages lm WHERE lm.channel_id=c.id AND lm.deleted_at IS NULL) AS last_id,
              COALESCE(rs.last_read_message_id,0) AS read_id
         FROM app_chat_channels c
         LEFT JOIN app_chat_read_state rs ON rs.channel_id=c.id AND rs.employee_id=?
        WHERE c.active=1 AND ${CHAT_CHANNEL_ACCESS_SQL}
     )
     SELECT v.id,v.name,v.type,v.department_id,
            CASE WHEN v.type='direct' THEN (
              SELECT e.full_name FROM app_chat_members other
              JOIN app_employees e ON e.id=other.employee_id
              WHERE other.channel_id=v.id AND other.employee_id!=? LIMIT 1
            ) ELSE v.name END AS display_name,
            CASE WHEN lm.id IS NULL THEN NULL ELSE COALESCE(NULLIF(lm.body,''),(
              SELECT file_name FROM app_chat_attachments attachment WHERE attachment.message_id=lm.id ORDER BY attachment.id LIMIT 1
            ),'Fayl') END AS last_message,
            lm.created_at AS last_message_at,
            CASE WHEN v.type IN ('group','direct')
              THEN (SELECT COUNT(*) FROM app_chat_members members WHERE members.channel_id=v.id) ELSE 0 END AS member_count,
            CASE WHEN v.last_id IS NULL OR v.last_id<=v.read_id THEN 0 ELSE (
              SELECT COUNT(*) FROM app_chat_messages um
               WHERE um.channel_id=v.id AND um.id>v.read_id AND um.deleted_at IS NULL AND um.sender_employee_id!=?
            ) END AS unread_count
       FROM visible v
       LEFT JOIN app_chat_messages lm ON lm.id=v.last_id
      ORDER BY CASE v.type WHEN 'broadcast' THEN 0 WHEN 'department' THEN 1 ELSE 2 END,
        COALESCE(lm.created_at,v.created_at) DESC
      LIMIT 200`,
  ).bind(actor.id, actor.departmentId, actor.id, actor.id, actor.id).all<Row>();
  return channels.results.map((row) => ({
    id: Number(row.id),
    name: String(row.display_name ?? row.name),
    type: String(row.type),
    departmentId: row.department_id == null ? null : Number(row.department_id),
    lastMessage: String(row.last_message ?? ""),
    lastMessageAt: row.last_message_at ? String(row.last_message_at) : null,
    unreadCount: Number(row.unread_count ?? 0),
    memberCount: Number(row.member_count ?? 0),
  }));
}

/** Messages of a channel the caller has already authorized; `afterId` > 0 returns only newer ones. */
export async function listChannelMessages(db: ChatDb, channelId: number, afterId = 0) {
  const incremental = afterId > 0;
  const result = await db.prepare(
    `SELECT m.id,m.channel_id,m.sender_employee_id,m.message_type,m.body,m.reply_to_message_id,
            m.edited_at,m.created_at,e.full_name AS sender_name,e.position AS sender_position
       FROM app_chat_messages m
       JOIN app_employees e ON e.id=m.sender_employee_id
      WHERE m.channel_id=? AND m.deleted_at IS NULL AND m.id>?
      ORDER BY m.id ${incremental ? "ASC" : "DESC"} LIMIT 100`,
  ).bind(channelId, afterId).all<Row>();
  const rows = incremental ? result.results : result.results.reverse();
  const ids = rows.map((row) => Number(row.id));
  const attachments = ids.length ? await db.prepare(
    `SELECT id,message_id,file_name,content_type,size,created_at
       FROM app_chat_attachments WHERE message_id IN (${ids.map(() => "?").join(",")}) ORDER BY id`,
  ).bind(...ids).all<Row>() : { results: [] as Row[] };
  const attachmentsByMessage = new Map<number, Row[]>();
  for (const file of attachments.results) {
    const messageId = Number(file.message_id);
    const bucket = attachmentsByMessage.get(messageId) ?? [];
    bucket.push(file);
    attachmentsByMessage.set(messageId, bucket);
  }
  return rows.map((row) => ({
    id: Number(row.id),
    channelId: Number(row.channel_id),
    sender: {
      id: Number(row.sender_employee_id),
      name: String(row.sender_name),
      position: String(row.sender_position ?? ""),
    },
    type: String(row.message_type),
    body: String(row.body ?? ""),
    replyToMessageId: row.reply_to_message_id == null ? null : Number(row.reply_to_message_id),
    editedAt: row.edited_at ? String(row.edited_at) : null,
    createdAt: String(row.created_at),
    attachments: (attachmentsByMessage.get(Number(row.id)) ?? []).map((file) => ({
      id: Number(file.id),
      fileName: String(file.file_name),
      contentType: String(file.content_type ?? "application/octet-stream"),
      size: Number(file.size ?? 0),
      createdAt: String(file.created_at),
    })),
  }));
}

/** Read markers are kept apart from membership so they never grant access. */
export async function markChatRead(db: ChatDb, actorId: number, channelId: number, messageId: number) {
  const message = await db.prepare("SELECT id FROM app_chat_messages WHERE id=? AND channel_id=? AND deleted_at IS NULL")
    .bind(messageId, channelId).first<{ id: number }>();
  if (!message) throw new ApiError(400, "O‘qilgan xabar ushbu suhbatga tegishli emas");
  await db.prepare(
    `INSERT INTO app_chat_read_state (channel_id,employee_id,last_read_message_id) VALUES (?,?,?)
     ON CONFLICT(channel_id,employee_id) DO UPDATE SET
       last_read_message_id=MAX(app_chat_read_state.last_read_message_id,excluded.last_read_message_id),
       updated_at=CURRENT_TIMESTAMP`,
  ).bind(channelId, actorId, messageId).run();
}

/** Inserts an authorized text message and returns its id and timestamp. */
export async function sendChatMessage(
  db: ChatDb,
  actorId: number,
  channel: NonNullable<VisibleChatChannel>,
  input: { body: string; replyToMessageId: number | null },
) {
  if (input.replyToMessageId) {
    const reply = await db.prepare("SELECT id FROM app_chat_messages WHERE id=? AND channel_id=? AND deleted_at IS NULL")
      .bind(input.replyToMessageId, channel.id).first<{ id: number }>();
    if (!reply) throw new ApiError(400, "Javob berilayotgan xabar ushbu suhbatga tegishli emas");
  }
  const type = channel.type === "broadcast" ? "announcement" : "text";
  const result = await db.prepare(
    "INSERT INTO app_chat_messages (channel_id,sender_employee_id,message_type,body,reply_to_message_id) VALUES (?,?,?,?,?)",
  ).bind(channel.id, actorId, type, input.body, input.replyToMessageId).run();
  const messageId = Number(result.meta.last_row_id);
  await db.prepare("UPDATE app_chat_channels SET updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(channel.id).run();
  const created = await db.prepare("SELECT created_at FROM app_chat_messages WHERE id=?").bind(messageId).first<{ created_at: string }>();
  return { messageId, type, createdAt: created?.created_at ?? new Date().toISOString() };
}

export async function allEmployeesAreActive(db: ChatDb, employeeIds: number[]) {
  for (let index = 0; index < employeeIds.length; index += 60) {
    const chunk = employeeIds.slice(index, index + 60);
    const result = await db.prepare(
      `SELECT COUNT(*) AS count FROM app_employees
        WHERE active=1 AND id IN (${chunk.map(() => "?").join(",")})`,
    ).bind(...chunk).first<{ count: number }>();
    if (Number(result?.count ?? 0) !== chunk.length) return false;
  }
  return true;
}

/** Creates a group with the actor plus the given (already validated) members. */
export async function createChatGroup(db: ChatDb, actorId: number, name: string, memberIds: number[]): Promise<ChatChannelSummary> {
  const result = await db.prepare(
    "INSERT INTO app_chat_channels (name,type,created_by_employee_id) VALUES (?,'group',?)",
  ).bind(name, actorId).run();
  const channelId = Number(result.meta.last_row_id);
  try {
    const members = [actorId, ...memberIds];
    for (let index = 0; index < members.length; index += 60) {
      await db.batch(members.slice(index, index + 60).map((employeeId) => db.prepare(
        "INSERT INTO app_chat_members (channel_id,employee_id) VALUES (?,?)",
      ).bind(channelId, employeeId)));
    }
  } catch (error) {
    await db.batch([
      db.prepare("DELETE FROM app_chat_members WHERE channel_id=?").bind(channelId),
      db.prepare("DELETE FROM app_chat_channels WHERE id=?").bind(channelId),
    ]);
    throw error;
  }
  return {
    id: channelId,
    name,
    type: "group",
    departmentId: null,
    lastMessage: "",
    lastMessageAt: null,
    unreadCount: 0,
    memberCount: memberIds.length + 1,
  };
}

export async function findActiveEmployee(db: ChatDb, employeeId: number) {
  if (!Number.isSafeInteger(employeeId) || employeeId <= 0) return null;
  const row = await db.prepare("SELECT id,full_name FROM app_employees WHERE id=? AND active=1")
    .bind(employeeId).first<{ id: number; full_name: string }>();
  return row ? { id: Number(row.id), fullName: String(row.full_name) } : null;
}

/** Opens (or reuses) the one direct channel between two employees. */
export async function openDirectChat(db: ChatDb, actorId: number, employee: { id: number; fullName: string }): Promise<ChatChannelSummary> {
  const directKey = [actorId, employee.id].sort((a, b) => a - b).join(":");
  await db.prepare(
    "INSERT OR IGNORE INTO app_chat_channels (name,type,direct_key,created_by_employee_id) VALUES (?,'direct',?,?)",
  ).bind(employee.fullName, directKey, actorId).run();
  const channel = await db.prepare("SELECT id FROM app_chat_channels WHERE direct_key=?").bind(directKey).first<{ id: number }>();
  if (!channel) throw new ApiError(500, "Suhbatni ochib bo‘lmadi");
  await db.batch([
    db.prepare("INSERT OR IGNORE INTO app_chat_members (channel_id,employee_id) VALUES (?,?)").bind(channel.id, actorId),
    db.prepare("INSERT OR IGNORE INTO app_chat_members (channel_id,employee_id) VALUES (?,?)").bind(channel.id, employee.id),
  ]);
  return {
    id: Number(channel.id),
    name: employee.fullName,
    type: "direct",
    departmentId: null,
    lastMessage: "",
    lastMessageAt: null,
    unreadCount: 0,
    memberCount: 2,
  };
}
