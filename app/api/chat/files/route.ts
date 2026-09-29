import { getD1, getRuntimeEnv } from "../../../../db";
import { ApiError, apiError, assertSameOrigin, audit, requireActor, type Actor } from "../../../../lib/auth";
import { runInBackground } from "../../../../lib/background";
import { SQL_NOW_ISO } from "../../../../lib/sql-time";
import { authorize } from "../../../../lib/policy";
import { chatChannelView, chatUpload } from "../../../../lib/policy/chat";
import { chatSendCounts, loadVisibleChatChannel } from "../../../../services/chat";
import { publishChatEvent } from "../../../../lib/chat-events";
import {
  cleanupExpiredChatUploads,
  DAILY_CHAT_UPLOAD_BYTES_PER_USER,
  MAX_ACTIVE_CHAT_UPLOADS_PER_USER,
  MAX_DIRECT_CHAT_UPLOAD_BYTES,
  reserveChatUploadSession,
  validateDirectChatUploadSize,
} from "../../../../lib/chat-uploads";
import { enqueueChatNotifications, processNotificationJobs } from "../../../../lib/telegram";

/** Uploading creates a message: same visibility, broadcast and rate rules as posting text. */
async function authorizeChatUpload(actor: Actor, channelId: number) {
  const db = await getD1();
  const channel = await loadVisibleChatChannel(db, actor, channelId);
  await authorize(
    chatUpload(actor, channel, channel ? await chatSendCounts(db, actor.id) : { perMinute: 0, broadcastPerHour: 0 }),
  );
  return channel!;
}

async function canViewChatChannel(actor: Actor, channelId: number) {
  return chatChannelView(await loadVisibleChatChannel(await getD1(), actor, channelId)).allowed;
}

const MAX_CHAT_FILE_BYTES = 500 * 1024 * 1024;
const MULTIPART_CHUNK_BYTES = 8 * 1024 * 1024;
const MAX_PART_BYTES = 16 * 1024 * 1024;

type UploadRow = {
  id: string;
  channel_id: number;
  employee_id: number;
  object_key: string;
  multipart_upload_id: string;
  file_name: string;
  content_type: string;
  size: number;
  message_body: string;
  status: string;
  expires_at: string;
};

function decodedHeader(request: Request, name: string) {
  const value = request.headers.get(name) ?? "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function safeContentType(fileName: string, value: string) {
  const raw = value.toLowerCase().split(";", 1)[0].trim();
  const extension = fileName.toLowerCase().split(".").pop() ?? "";
  if (["svg", "svgz", "html", "htm", "xhtml", "xml", "js", "mjs"].includes(extension))
    return "application/octet-stream";
  if (!raw || raw.includes("html") || raw.includes("xml") || raw.includes("javascript") || raw === "image/svg+xml")
    return "application/octet-stream";
  return raw.slice(0, 200);
}

function canInline(contentType: string) {
  return (
    contentType.startsWith("image/") ||
    contentType.startsWith("video/") ||
    contentType.startsWith("audio/") ||
    contentType === "application/pdf"
  );
}

function parseByteRange(value: string | null, size: number) {
  const match = value?.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;
  let start = match[1] ? Number(match[1]) : Number.NaN;
  let end = match[2] ? Number(match[2]) : Number.NaN;
  if (Number.isNaN(start) && !Number.isNaN(end)) {
    start = Math.max(0, size - end);
    end = size - 1;
  } else {
    if (Number.isNaN(start)) return null;
    if (Number.isNaN(end)) end = size - 1;
  }
  if (start < 0 || end < start || start >= size) return null;
  end = Math.min(end, size - 1);
  return { offset: start, length: end - start + 1, end };
}

/** Largest allowed size of `partNumber` for a file of `declared` bytes; 0 = no such part. */
export function multipartPartLimit(declared: number, partNumber: number, chunk = MULTIPART_CHUNK_BYTES) {
  const parts = Math.ceil(declared / chunk);
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > parts) return 0;
  return partNumber < parts ? chunk : declared - chunk * (parts - 1);
}

/** Fails the stream when the body is longer than the declared Content-Length. */
function limitBody(body: ReadableStream<Uint8Array>, maxBytes: number) {
  let seen = 0;
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        seen += chunk.byteLength;
        if (seen > maxBytes) controller.error(new ApiError(413, "Fayl qismi e’lon qilingan hajmdan katta"));
        else controller.enqueue(chunk);
      },
    }),
  );
}

async function uploadSession(actor: Actor, sessionId: string) {
  const row = await (
    await getD1()
  )
    .prepare(
      `SELECT * FROM app_chat_upload_sessions
      WHERE id=? AND employee_id=? AND status='uploading' AND expires_at>${SQL_NOW_ISO}`,
    )
    .bind(sessionId, actor.id)
    .first<UploadRow>();
  return row ?? null;
}

function notificationTask(input: {
  messageId: number;
  channelId: number;
  senderEmployeeId: number;
  senderName: string;
  channelName: string;
  body: string;
  fileName: string;
}) {
  publishChatEvent({ channelId: input.channelId, messageId: input.messageId });
  runInBackground(async () => {
    await enqueueChatNotifications(input);
    await processNotificationJobs(100);
  });
}

function uploadLimitResponse(result: { reason: "concurrency" | "daily_quota"; active: number; dailyBytes: number }) {
  const concurrency = result.reason === "concurrency";
  return Response.json(
    {
      error: concurrency
        ? `Bir vaqtda ko‘pi bilan ${MAX_ACTIVE_CHAT_UPLOADS_PER_USER} ta fayl yuklash mumkin`
        : "Bir kunlik fayl yuklash limiti tugadi",
      code: concurrency ? "UPLOAD_CONCURRENCY_LIMIT" : "UPLOAD_DAILY_QUOTA",
      activeUploads: result.active,
      dailyBytes: result.dailyBytes,
      dailyLimitBytes: DAILY_CHAT_UPLOAD_BYTES_PER_USER,
    },
    { status: 429, headers: { "Retry-After": concurrency ? "900" : "86400", "Cache-Control": "private, no-store" } },
  );
}

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const id = Number(new URL(request.url).searchParams.get("id"));
    const row = await (
      await getD1()
    )
      .prepare(
        `SELECT f.*,m.channel_id FROM app_chat_attachments f
        JOIN app_chat_messages m ON m.id=f.message_id WHERE f.id=? AND m.deleted_at IS NULL`,
      )
      .bind(id)
      .first<Record<string, unknown>>();
    if (!row || !(await canViewChatChannel(actor, Number(row.channel_id))))
      return Response.json({ error: "Fayl topilmadi" }, { status: 404 });
    const bucket = (await getRuntimeEnv()).BUCKET;
    const totalSize = Number(row.size ?? 0);
    const rangeHeader = request.headers.get("range");
    const range = parseByteRange(rangeHeader, totalSize);
    if (rangeHeader && !range) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${totalSize}`, "Cache-Control": "private, no-store" },
      });
    }
    const object = await bucket.get(
      String(row.object_key),
      range ? { range: { offset: range.offset, length: range.length } } : undefined,
    );
    if (!object) return Response.json({ error: "Fayl omborda topilmadi" }, { status: 404 });
    const name = String(row.file_name).replace(/[\r\n"]/g, "_");
    const contentType = safeContentType(name, String(row.content_type ?? "application/octet-stream"));
    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Length": String(range?.length ?? object.size),
      "Content-Disposition": `${canInline(contentType) ? "inline" : "attachment"}; filename="${name}"; filename*=UTF-8''${encodeURIComponent(String(row.file_name))}`,
      "Cache-Control": "private, max-age=3600",
      Vary: "Cookie",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
    });
    if (range) headers.set("Content-Range", `bytes ${range.offset}-${range.end}/${totalSize}`);
    return new Response(object.body, { status: range ? 206 : 200, headers });
  } catch (error) {
    return apiError(error);
  }
}

async function initializeMultipart(request: Request, actor: Actor) {
  const payload = (await request.json()) as Record<string, unknown>;
  const channelId = Number(payload.channelId);
  const fileName = String(payload.fileName ?? "")
    .trim()
    .slice(0, 255);
  const size = Number(payload.size);
  const body = String(payload.body ?? "")
    .trim()
    .slice(0, 5000);
  const contentType = safeContentType(fileName, String(payload.contentType ?? "application/octet-stream"));
  if (
    !channelId ||
    !fileName ||
    !Number.isSafeInteger(size) ||
    size <= MAX_DIRECT_CHAT_UPLOAD_BYTES ||
    size > MAX_CHAT_FILE_BYTES
  ) {
    return Response.json({ error: "Katta fayl hajmi 12–500 MB oralig‘ida bo‘lishi kerak" }, { status: 400 });
  }
  await authorizeChatUpload(actor, channelId);
  const db = await getD1();
  const sessionId = crypto.randomUUID();
  const safeName =
    fileName
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .slice(-120) || "file";
  const objectKey = `chat/${channelId}/multipart/${actor.id}/${sessionId}-${safeName}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60_000).toISOString();
  const reservation = await reserveChatUploadSession(db, {
    id: sessionId,
    channelId,
    employeeId: actor.id,
    objectKey,
    multipartUploadId: "pending",
    fileName,
    contentType,
    size,
    messageBody: body,
    status: "reserving",
    expiresAt,
  });
  if (!reservation.ok) return uploadLimitResponse(reservation);
  runInBackground(() => cleanupExpiredChatUploads(25).catch(() => undefined));
  let multipart: R2MultipartUpload | null = null;
  try {
    multipart = await (
      await getRuntimeEnv()
    ).BUCKET.createMultipartUpload(objectKey, { httpMetadata: { contentType } });
    const activated = await db
      .prepare(
        "UPDATE app_chat_upload_sessions SET multipart_upload_id=?,status='uploading' WHERE id=? AND employee_id=? AND status='reserving'",
      )
      .bind(multipart.uploadId, sessionId, actor.id)
      .run();
    if (Number(activated.meta.changes ?? 0) !== 1) throw new Error("Yuklash rezervatsiyasini faollashtirib bo‘lmadi");
  } catch (error) {
    if (multipart) await multipart.abort().catch(() => undefined);
    await db
      .prepare("UPDATE app_chat_upload_sessions SET status='failed' WHERE id=? AND status IN ('reserving','uploading')")
      .bind(sessionId)
      .run();
    throw error;
  }
  return Response.json(
    {
      sessionId,
      chunkSize: MULTIPART_CHUNK_BYTES,
      maxSize: MAX_CHAT_FILE_BYTES,
      maxActiveUploads: MAX_ACTIVE_CHAT_UPLOADS_PER_USER,
      dailyLimitBytes: DAILY_CHAT_UPLOAD_BYTES_PER_USER,
    },
    { status: 201, headers: { "Cache-Control": "private, no-store" } },
  );
}

async function uploadMultipartPart(request: Request, actor: Actor) {
  const url = new URL(request.url);
  const sessionId = String(url.searchParams.get("sessionId") ?? "");
  const partNumber = Number(url.searchParams.get("partNumber"));
  const size = Number(request.headers.get("content-length") ?? 0);
  if (!sessionId || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10_000 || !request.body) {
    return Response.json({ error: "Fayl qismi ma’lumotlari noto‘g‘ri" }, { status: 400 });
  }
  if (!size || size > MAX_PART_BYTES)
    return Response.json({ error: "Fayl qismi 16 MB dan oshmasligi kerak" }, { status: 413 });
  const session = await uploadSession(actor, sessionId);
  if (!session || !(await canViewChatChannel(actor, Number(session.channel_id))))
    return Response.json({ error: "Yuklash sessiyasi topilmadi" }, { status: 404 });
  // Parts are bounded by the declared file size: part numbers stop at the expected
  // count and each part is at most its own slice, so the total cannot exceed it.
  const maxBytes = multipartPartLimit(Number(session.size), partNumber);
  if (maxBytes === 0)
    return Response.json({ error: "Fayl qismlari soni e’lon qilingan hajmdan oshdi" }, { status: 400 });
  if (size > maxBytes) return Response.json({ error: "Fayl qismi e’lon qilingan hajmdan katta" }, { status: 413 });
  const multipart = (await getRuntimeEnv()).BUCKET.resumeMultipartUpload(
    session.object_key,
    session.multipart_upload_id,
  );
  const part = await multipart.uploadPart(partNumber, limitBody(request.body, size));
  return Response.json({ partNumber, etag: part.etag });
}

async function completeMultipart(request: Request, actor: Actor) {
  const url = new URL(request.url);
  const sessionId = String(url.searchParams.get("sessionId") ?? "");
  const payload = (await request.json()) as { parts?: Array<{ partNumber?: number; etag?: string }> };
  const session = await uploadSession(actor, sessionId);
  if (!session || !(await canViewChatChannel(actor, Number(session.channel_id))))
    return Response.json({ error: "Yuklash sessiyasi topilmadi" }, { status: 404 });
  const parts = Array.isArray(payload.parts)
    ? payload.parts.map((part) => ({ partNumber: Number(part.partNumber), etag: String(part.etag ?? "") }))
    : [];
  const expectedParts = Math.ceil(Number(session.size) / MULTIPART_CHUNK_BYTES);
  const validParts =
    parts.length === expectedParts &&
    parts.every((part, index) => part.partNumber === index + 1 && part.etag.length > 0);
  if (!validParts) return Response.json({ error: "Fayl qismlari to‘liq kelmadi" }, { status: 400 });
  const db = await getD1();
  const claimed = await db
    .prepare(
      `UPDATE app_chat_upload_sessions SET status='completing' WHERE id=? AND employee_id=? AND status='uploading' AND expires_at>${SQL_NOW_ISO}`,
    )
    .bind(session.id, actor.id)
    .run();
  if (Number(claimed.meta.changes ?? 0) !== 1) {
    return Response.json({ error: "Yuklash yakunlanmoqda yoki sessiya eskirgan" }, { status: 409 });
  }
  const env = await getRuntimeEnv();
  const multipart = env.BUCKET.resumeMultipartUpload(session.object_key, session.multipart_upload_id);
  let completed: { size: number };
  try {
    completed = (await multipart.complete(parts)) as { size: number };
  } catch (error) {
    await db
      .prepare(
        `UPDATE app_chat_upload_sessions SET status='uploading' WHERE id=? AND status='completing' AND expires_at>${SQL_NOW_ISO}`,
      )
      .bind(session.id)
      .run();
    throw error;
  }
  if (Number(completed.size) !== Number(session.size)) {
    await Promise.all([
      env.BUCKET.delete(session.object_key),
      db.prepare("UPDATE app_chat_upload_sessions SET status='failed' WHERE id=?").bind(session.id).run(),
    ]);
    return Response.json({ error: "Yuklangan fayl hajmi mos kelmadi, qayta urinib ko‘ring" }, { status: 409 });
  }
  const channel = await db
    .prepare("SELECT type,name FROM app_chat_channels WHERE id=?")
    .bind(session.channel_id)
    .first<{ type: string; name: string }>();
  let messageId = 0;
  try {
    const message = await db
      .prepare("INSERT INTO app_chat_messages (channel_id,sender_employee_id,message_type,body) VALUES (?,?,?,?)")
      .bind(session.channel_id, actor.id, channel?.type === "broadcast" ? "announcement" : "file", session.message_body)
      .run();
    messageId = Number(message.meta.last_row_id);
    const attachment = await db
      .prepare(
        "INSERT INTO app_chat_attachments (message_id,object_key,file_name,content_type,size,uploaded_by_employee_id) VALUES (?,?,?,?,?,?)",
      )
      .bind(messageId, session.object_key, session.file_name, session.content_type, session.size, actor.id)
      .run();
    const attachmentId = Number(attachment.meta.last_row_id);
    await db.batch([
      db.prepare("UPDATE app_chat_channels SET updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(session.channel_id),
      db
        .prepare("UPDATE app_chat_upload_sessions SET status='completed',completed_at=CURRENT_TIMESTAMP WHERE id=?")
        .bind(session.id),
    ]);
    await audit(actor, "chat.file_uploaded", "chat_attachment", attachmentId, {
      channelId: session.channel_id,
      messageId,
      fileName: session.file_name,
      size: session.size,
      multipart: true,
    });
    notificationTask({
      messageId,
      channelId: Number(session.channel_id),
      senderEmployeeId: actor.id,
      senderName: actor.name,
      channelName: channel?.type === "direct" ? "Shaxsiy suhbat" : (channel?.name ?? "Muloqot"),
      body: session.message_body,
      fileName: session.file_name,
    });
    const created = await db
      .prepare("SELECT created_at FROM app_chat_messages WHERE id=?")
      .bind(messageId)
      .first<{ created_at: string }>();
    return Response.json(
      {
        message: {
          id: messageId,
          channelId: Number(session.channel_id),
          sender: { id: actor.id, name: actor.name, position: actor.position },
          type: channel?.type === "broadcast" ? "announcement" : "file",
          body: session.message_body,
          createdAt: created?.created_at ?? new Date().toISOString(),
          attachments: [
            {
              id: attachmentId,
              fileName: session.file_name,
              contentType: session.content_type,
              size: Number(session.size),
              createdAt: created?.created_at ?? new Date().toISOString(),
            },
          ],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    await Promise.all([
      env.BUCKET.delete(session.object_key),
      messageId
        ? db.prepare("DELETE FROM app_chat_attachments WHERE message_id=?").bind(messageId).run()
        : Promise.resolve(),
      messageId ? db.prepare("DELETE FROM app_chat_messages WHERE id=?").bind(messageId).run() : Promise.resolve(),
      db.prepare("UPDATE app_chat_upload_sessions SET status='failed' WHERE id=?").bind(session.id).run(),
    ]);
    throw error;
  }
}

async function directUpload(request: Request, actor: Actor) {
  const url = new URL(request.url);
  const channelId = Number(url.searchParams.get("channelId"));
  const fileName = decodedHeader(request, "x-file-name").trim().slice(0, 255);
  const body = decodedHeader(request, "x-message-body").trim().slice(0, 5000);
  const contentType = safeContentType(fileName, request.headers.get("content-type") ?? "application/octet-stream");
  if (!channelId || !fileName || !request.body)
    return Response.json({ error: "Fayl va suhbat majburiy" }, { status: 400 });
  const sizeValidation = validateDirectChatUploadSize(
    request.headers.get("content-length"),
    request.headers.get("x-file-size"),
  );
  if (!sizeValidation.ok) return Response.json({ error: sizeValidation.error }, { status: sizeValidation.status });
  const declaredSize = sizeValidation.size;
  const channel = await authorizeChatUpload(actor, channelId);
  const db = await getD1();
  const sessionId = crypto.randomUUID();
  const safeName =
    fileName
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .slice(-120) || "file";
  const objectKey = `chat/${channelId}/direct/${actor.id}/${sessionId}-${safeName}`;
  const reservation = await reserveChatUploadSession(db, {
    id: sessionId,
    channelId,
    employeeId: actor.id,
    objectKey,
    multipartUploadId: "direct",
    fileName,
    contentType,
    size: declaredSize,
    messageBody: body,
    status: "direct_uploading",
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
  });
  if (!reservation.ok) return uploadLimitResponse(reservation);
  runInBackground(() => cleanupExpiredChatUploads(25).catch(() => undefined));
  let messageId = 0;
  try {
    const bucket = (await getRuntimeEnv()).BUCKET;
    const stored = (await bucket.put(objectKey, request.body, { httpMetadata: { contentType } })) as
      | { size?: number }
      | undefined;
    if (stored?.size != null && Number(stored.size) !== declaredSize)
      throw new Error("Yuklangan fayl hajmi mos kelmadi");
    const claimed = await db
      .prepare(
        `UPDATE app_chat_upload_sessions SET status='completing' WHERE id=? AND employee_id=? AND status='direct_uploading' AND expires_at>${SQL_NOW_ISO}`,
      )
      .bind(sessionId, actor.id)
      .run();
    if (Number(claimed.meta.changes ?? 0) !== 1)
      throw new ApiError(409, "Fayl yuklash sessiyasi eskirgan, qayta urinib ko‘ring");
    const message = await db
      .prepare("INSERT INTO app_chat_messages (channel_id,sender_employee_id,message_type,body) VALUES (?,?,?,?)")
      .bind(channelId, actor.id, channel?.type === "broadcast" ? "announcement" : "file", body)
      .run();
    messageId = Number(message.meta.last_row_id);
    const result = await db
      .prepare(
        "INSERT INTO app_chat_attachments (message_id,object_key,file_name,content_type,size,uploaded_by_employee_id) VALUES (?,?,?,?,?,?)",
      )
      .bind(messageId, objectKey, fileName, contentType, declaredSize, actor.id)
      .run();
    await db.batch([
      db.prepare("UPDATE app_chat_channels SET updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(channelId),
      db
        .prepare(
          "UPDATE app_chat_upload_sessions SET status='completed',completed_at=CURRENT_TIMESTAMP WHERE id=? AND status='completing'",
        )
        .bind(sessionId),
    ]);
    const attachmentId = Number(result.meta.last_row_id);
    await audit(actor, "chat.file_uploaded", "chat_attachment", attachmentId, {
      channelId,
      messageId,
      fileName,
      size: declaredSize,
    });
    notificationTask({
      messageId,
      channelId,
      senderEmployeeId: actor.id,
      senderName: actor.name,
      channelName: channel?.type === "direct" ? "Shaxsiy suhbat" : (channel?.name ?? "Muloqot"),
      body,
      fileName,
    });
    const created = await db
      .prepare("SELECT created_at FROM app_chat_messages WHERE id=?")
      .bind(messageId)
      .first<{ created_at: string }>();
    return Response.json(
      {
        message: {
          id: messageId,
          channelId,
          sender: { id: actor.id, name: actor.name, position: actor.position },
          type: channel?.type === "broadcast" ? "announcement" : "file",
          body,
          createdAt: created?.created_at ?? new Date().toISOString(),
          attachments: [
            {
              id: attachmentId,
              fileName,
              contentType,
              size: declaredSize,
              createdAt: created?.created_at ?? new Date().toISOString(),
            },
          ],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    await Promise.all([
      messageId
        ? db.prepare("DELETE FROM app_chat_attachments WHERE message_id=?").bind(messageId).run()
        : Promise.resolve(),
      messageId ? db.prepare("DELETE FROM app_chat_messages WHERE id=?").bind(messageId).run() : Promise.resolve(),
      db
        .prepare(
          "UPDATE app_chat_upload_sessions SET status='failed' WHERE id=? AND status IN ('direct_uploading','completing')",
        )
        .bind(sessionId)
        .run(),
      (await getRuntimeEnv()).BUCKET.delete(objectKey),
    ]);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const action = new URL(request.url).searchParams.get("action");
    if (action === "init") return await initializeMultipart(request, actor);
    if (action === "part") return await uploadMultipartPart(request, actor);
    if (action === "complete") return await completeMultipart(request, actor);
    return await directUpload(request, actor);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const sessionId = String(new URL(request.url).searchParams.get("sessionId") ?? "");
    const session = await uploadSession(actor, sessionId);
    if (!session) return Response.json({ ok: true });
    await (
      await getRuntimeEnv()
    ).BUCKET.resumeMultipartUpload(session.object_key, session.multipart_upload_id)
      .abort()
      .catch(() => undefined);
    await (await getD1())
      .prepare("UPDATE app_chat_upload_sessions SET status='aborted' WHERE id=?")
      .bind(session.id)
      .run();
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
