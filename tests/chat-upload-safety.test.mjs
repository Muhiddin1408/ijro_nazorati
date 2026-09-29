import { readSource } from './fixtures/source.mjs';
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[a-z]+$/i.test(specifier)) {
      for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
        const url = new URL(candidate, context.parentURL);
        if (existsSync(fileURLToPath(url))) return nextResolve(url.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const {
  cleanupExpiredChatUploads,
  DAILY_CHAT_UPLOAD_BYTES_PER_USER,
  MAX_ACTIVE_CHAT_UPLOADS_PER_USER,
  MAX_DIRECT_CHAT_UPLOAD_BYTES,
  reserveChatUploadSession,
  validateDirectChatUploadSize,
} = await import("../lib/chat-uploads.ts");

function asD1(database) {
  return {
    prepare(sql) {
      let bindings = [];
      const statement = {
        bind(...values) { bindings = values; return statement; },
        async first() { return database.prepare(sql).get(...bindings) ?? null; },
        async all() { return { results: database.prepare(sql).all(...bindings) }; },
        async run() {
          const result = database.prepare(sql).run(...bindings);
          return { meta: { changes: result.changes, last_row_id: result.lastInsertRowid } };
        },
      };
      return statement;
    },
  };
}

function uploadDatabase() {
  const database = new DatabaseSync(":memory:");
  database.exec(`
    CREATE TABLE app_chat_upload_sessions (
      id TEXT PRIMARY KEY,channel_id INTEGER NOT NULL,employee_id INTEGER NOT NULL,object_key TEXT NOT NULL UNIQUE,
      multipart_upload_id TEXT NOT NULL,file_name TEXT NOT NULL,content_type TEXT NOT NULL,size INTEGER NOT NULL,
      message_body TEXT NOT NULL,status TEXT NOT NULL,expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,completed_at TEXT
    );
    CREATE TABLE app_chat_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,message_id INTEGER NOT NULL,object_key TEXT NOT NULL UNIQUE,
      file_name TEXT NOT NULL,content_type TEXT,size INTEGER NOT NULL,uploaded_by_employee_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return database;
}

function reservation(id, overrides = {}) {
  return {
    id,
    channelId: 1,
    employeeId: 77,
    objectKey: `chat/${id}`,
    multipartUploadId: "pending",
    fileName: `${id}.pptx`,
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    size: 40 * 1024 * 1024,
    messageBody: "",
    status: "reserving",
    expiresAt: "2099-01-01T00:00:00.000Z",
    ...overrides,
  };
}

test("chat upload reservations atomically cap each employee at three active sessions", async () => {
  const database = uploadDatabase();
  const db = asD1(database);
  const results = await Promise.all(Array.from({ length: 4 }, (_, index) => reserveChatUploadSession(db, reservation(`r${index + 1}`))));
  assert.equal(results.filter((result) => result.ok).length, MAX_ACTIVE_CHAT_UPLOADS_PER_USER);
  const rejected = results.find((result) => !result.ok);
  assert.equal(rejected?.reason, "concurrency");
  assert.equal(database.prepare("SELECT COUNT(*) count FROM app_chat_upload_sessions").get().count, 3);
});

test("direct upload size headers fail closed before storage and accept an exact small body", async () => {
  assert.deepEqual(validateDirectChatUploadSize(null, "1024"), {
    ok: false, status: 411, error: "Content-Length sarlavhasi majburiy",
  });
  assert.equal(validateDirectChatUploadSize("1025", "1024").status, 400);
  assert.equal(validateDirectChatUploadSize(String(MAX_DIRECT_CHAT_UPLOAD_BYTES + 1), String(MAX_DIRECT_CHAT_UPLOAD_BYTES + 1)).status, 413);
  assert.equal(validateDirectChatUploadSize("Infinity", "Infinity").status, 400);
  assert.deepEqual(validateDirectChatUploadSize("1024", "1024"), { ok: true, size: 1024 });

  const route = await readSource(new URL("../app/api/chat/files/route.ts", import.meta.url));
  const directStart = route.indexOf("async function directUpload");
  const validationAt = route.indexOf("validateDirectChatUploadSize", directStart);
  const reserveAt = route.indexOf("reserveChatUploadSession", directStart);
  const bucketAt = route.indexOf("BUCKET", directStart);
  assert.ok(directStart >= 0 && validationAt > directStart && reserveAt > validationAt && bucketAt > reserveAt,
    "missing or mismatched size must return before quota reservation and R2 storage");
});

test("chat upload reservations enforce a rolling daily byte budget without charging failed sessions", async () => {
  const database = uploadDatabase();
  const db = asD1(database);
  database.prepare(`INSERT INTO app_chat_upload_sessions
    (id,channel_id,employee_id,object_key,multipart_upload_id,file_name,content_type,size,message_body,status,expires_at)
    VALUES ('used',1,77,'chat/used','done','used.bin','application/octet-stream',?,'','completed','2099-01-01')`)
    .run(DAILY_CHAT_UPLOAD_BYTES_PER_USER - 10);
  const rejected = await reserveChatUploadSession(db, reservation("over", { size: 11 }));
  assert.equal(rejected.ok, false);
  assert.equal(rejected.reason, "daily_quota");

  database.prepare("UPDATE app_chat_upload_sessions SET status='failed' WHERE id='used'").run();
  const accepted = await reserveChatUploadSession(db, reservation("after-failure", { size: 11 }));
  assert.equal(accepted.ok, true);
});

test("expired multipart and direct uploads are removed from storage and marked expired", async () => {
  const database = uploadDatabase();
  const db = asD1(database);
  for (const [id, multipart, status] of [["multi", "upload-1", "uploading"], ["direct", "direct", "direct_uploading"]]) {
    database.prepare(`INSERT INTO app_chat_upload_sessions
      (id,channel_id,employee_id,object_key,multipart_upload_id,file_name,content_type,size,message_body,status,expires_at)
      VALUES (?,1,77,?,?,?,'application/octet-stream',10,'',?,'2020-01-01T00:00:00.000Z')`)
      .run(id, `chat/${id}`, multipart, `${id}.bin`, status);
  }
  database.prepare(`INSERT INTO app_chat_upload_sessions
    (id,channel_id,employee_id,object_key,multipart_upload_id,file_name,content_type,size,message_body,status,expires_at)
    VALUES ('finishing',1,77,'chat/finishing','upload-2','finishing.bin','application/octet-stream',10,'','completing',strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 minute'))`).run();
  const aborted = [];
  const deleted = [];
  const bucket = {
    resumeMultipartUpload(key, uploadId) {
      return { async abort() { aborted.push([key, uploadId]); } };
    },
    async delete(key) { deleted.push(key); },
  };
  const result = await cleanupExpiredChatUploads(10, { db, bucket });
  assert.deepEqual(result, { scanned: 2, expired: 2, failed: 0 });
  assert.deepEqual(aborted, [["chat/multi", "upload-1"]]);
  assert.deepEqual(deleted, ["chat/direct"]);
  assert.equal(database.prepare("SELECT COUNT(*) count FROM app_chat_upload_sessions WHERE status='expired'").get().count, 2);
  assert.equal(database.prepare("SELECT status FROM app_chat_upload_sessions WHERE id='finishing'").get().status, "completing");
});

test("failed storage cleanup is retryable and the authorized worker invokes it", async () => {
  const database = uploadDatabase();
  const db = asD1(database);
  database.prepare(`INSERT INTO app_chat_upload_sessions
    (id,channel_id,employee_id,object_key,multipart_upload_id,file_name,content_type,size,message_body,status,expires_at)
    VALUES ('retry',1,77,'chat/retry','direct','retry.bin','application/octet-stream',10,'','direct_uploading','2020-01-01')`).run();
  const result = await cleanupExpiredChatUploads(10, { db, bucket: { async delete() { throw new Error("R2 unavailable"); } } });
  assert.deepEqual(result, { scanned: 1, expired: 0, failed: 1 });
  assert.equal(database.prepare("SELECT status FROM app_chat_upload_sessions WHERE id='retry'").get().status, "direct_uploading");

  const worker = await readSource(new URL("../app/api/reminders/process/route.ts", import.meta.url));
  assert.match(worker, /cleanupExpiredChatUploads/);
  const route = await readSource(new URL("../app/api/chat/files/route.ts", import.meta.url));
  const directStart = route.indexOf("async function directUpload");
  const reserveAt = route.indexOf("reserveChatUploadSession", directStart);
  const messageAt = route.indexOf("INSERT INTO app_chat_messages", directStart);
  assert.ok(directStart >= 0 && reserveAt > directStart && messageAt > reserveAt, "direct upload must reserve before creating a message");
  assert.match(route, /status='completing'.*status='direct_uploading'/s);
});
