import { getD1, getRuntimeEnv } from "../db";
import { SQL_NOW_ISO } from "./sql-time";

/** A session still completing gets 15 more minutes before cleanup may claim it. */
const SQL_COMPLETING_GRACE = "strftime('%Y-%m-%dT%H:%M:%fZ','now','-15 minutes')";

export const MAX_ACTIVE_CHAT_UPLOADS_PER_USER = 3;
export const DAILY_CHAT_UPLOAD_BYTES_PER_USER = 2 * 1024 * 1024 * 1024;
export const MAX_DIRECT_CHAT_UPLOAD_BYTES = 12 * 1024 * 1024;

export function validateDirectChatUploadSize(contentLengthHeader: string | null, declaredSizeHeader: string | null) {
  if (contentLengthHeader === null) {
    return { ok: false as const, status: 411, error: "Content-Length sarlavhasi majburiy" };
  }
  if (declaredSizeHeader === null) {
    return { ok: false as const, status: 400, error: "X-File-Size sarlavhasi majburiy" };
  }
  if (!/^\d+$/.test(contentLengthHeader) || !/^\d+$/.test(declaredSizeHeader)) {
    return { ok: false as const, status: 400, error: "Fayl hajmi butun musbat son bo‘lishi kerak" };
  }
  const contentLength = Number(contentLengthHeader);
  const declaredSize = Number(declaredSizeHeader);
  if (!Number.isSafeInteger(contentLength) || !Number.isSafeInteger(declaredSize) || contentLength <= 0 || declaredSize <= 0) {
    return { ok: false as const, status: 400, error: "Fayl hajmi noto‘g‘ri" };
  }
  if (contentLength > MAX_DIRECT_CHAT_UPLOAD_BYTES || declaredSize > MAX_DIRECT_CHAT_UPLOAD_BYTES) {
    return { ok: false as const, status: 413, error: "12 MB dan katta fayl bo‘lib yuklanishi kerak" };
  }
  if (contentLength !== declaredSize) {
    return { ok: false as const, status: 400, error: "Fayl hajmi so‘rov ma’lumotiga mos kelmadi" };
  }
  return { ok: true as const, size: contentLength };
}

export type ChatUploadReservation = {
  id: string;
  channelId: number;
  employeeId: number;
  objectKey: string;
  multipartUploadId: string;
  fileName: string;
  contentType: string;
  size: number;
  messageBody: string;
  status: "reserving" | "direct_uploading";
  expiresAt: string;
};

export async function chatUploadUsage(db: D1Database, employeeId: number) {
  const row = await db.prepare(
    `SELECT
       (SELECT COUNT(*) FROM app_chat_upload_sessions session
         WHERE session.employee_id=?
           AND session.status IN ('reserving','uploading','completing','direct_uploading')
           AND session.expires_at>${SQL_NOW_ISO}) AS active_count,
       COALESCE((SELECT SUM(session.size) FROM app_chat_upload_sessions session
         WHERE session.employee_id=? AND session.created_at>=datetime('now','-1 day')
           AND session.status NOT IN ('failed','expired','aborted')),0)
       + COALESCE((SELECT SUM(attachment.size) FROM app_chat_attachments attachment
         WHERE attachment.uploaded_by_employee_id=? AND attachment.created_at>=datetime('now','-1 day')
           AND NOT EXISTS (SELECT 1 FROM app_chat_upload_sessions session WHERE session.object_key=attachment.object_key)),0)
         AS daily_bytes`,
  ).bind(employeeId, employeeId, employeeId).first<{ active_count: number; daily_bytes: number }>();
  return { active: Number(row?.active_count ?? 0), dailyBytes: Number(row?.daily_bytes ?? 0) };
}

/** The COUNT + quota checks and reservation insert execute as one SQLite statement. */
export async function reserveChatUploadSession(db: D1Database, input: ChatUploadReservation) {
  const inserted = await db.prepare(
    `INSERT INTO app_chat_upload_sessions
      (id,channel_id,employee_id,object_key,multipart_upload_id,file_name,content_type,size,message_body,status,expires_at)
     SELECT ?,?,?,?,?,?,?,?,?,?,?
      WHERE (SELECT COUNT(*) FROM app_chat_upload_sessions active
              WHERE active.employee_id=?
                AND active.status IN ('reserving','uploading','completing','direct_uploading')
                AND active.expires_at>${SQL_NOW_ISO})<?
        AND COALESCE((SELECT SUM(session.size) FROM app_chat_upload_sessions session
              WHERE session.employee_id=? AND session.created_at>=datetime('now','-1 day')
                AND session.status NOT IN ('failed','expired','aborted')),0)
          + COALESCE((SELECT SUM(attachment.size) FROM app_chat_attachments attachment
              WHERE attachment.uploaded_by_employee_id=? AND attachment.created_at>=datetime('now','-1 day')
                AND NOT EXISTS (SELECT 1 FROM app_chat_upload_sessions session WHERE session.object_key=attachment.object_key)),0)
          + ?<=?
     RETURNING id`,
  ).bind(
    input.id, input.channelId, input.employeeId, input.objectKey, input.multipartUploadId,
    input.fileName, input.contentType, input.size, input.messageBody, input.status, input.expiresAt,
    input.employeeId, MAX_ACTIVE_CHAT_UPLOADS_PER_USER,
    input.employeeId, input.employeeId, input.size, DAILY_CHAT_UPLOAD_BYTES_PER_USER,
  ).first<{ id: string }>();
  if (inserted) return { ok: true as const };
  const usage = await chatUploadUsage(db, input.employeeId);
  return {
    ok: false as const,
    reason: usage.active >= MAX_ACTIVE_CHAT_UPLOADS_PER_USER ? "concurrency" as const : "daily_quota" as const,
    ...usage,
  };
}

type CleanupRow = {
  id: string;
  object_key: string;
  multipart_upload_id: string;
  status: string;
};

export async function cleanupExpiredChatUploads(limit = 50, dependencies?: { db?: D1Database; bucket?: R2Bucket }) {
  const db = dependencies?.db ?? await getD1();
  const bucket = dependencies?.bucket ?? (await getRuntimeEnv()).BUCKET;
  const rows = await db.prepare(
    `SELECT id,object_key,multipart_upload_id,status FROM app_chat_upload_sessions
      WHERE status IN ('reserving','uploading','completing','direct_uploading')
        AND expires_at<=${SQL_NOW_ISO}
        AND (status<>'completing' OR expires_at<=${SQL_COMPLETING_GRACE})
      ORDER BY expires_at,id LIMIT ?`,
  ).bind(Math.max(1, Math.min(200, limit))).all<CleanupRow>();
  let expired = 0;
  let failed = 0;
  for (const row of rows.results) {
    const claimed = await db.prepare(
      `UPDATE app_chat_upload_sessions SET status='cleanup_in_progress'
        WHERE id=? AND status=? AND expires_at<=${SQL_NOW_ISO}
          AND (status<>'completing' OR expires_at<=${SQL_COMPLETING_GRACE})`,
    ).bind(row.id, row.status).run();
    if (Number(claimed.meta.changes ?? 0) !== 1) continue;
    try {
      if (row.multipart_upload_id && row.multipart_upload_id !== "pending" && row.multipart_upload_id !== "direct") {
        try {
          await bucket.resumeMultipartUpload(row.object_key, row.multipart_upload_id).abort();
        } catch {
          // A completion may win immediately before the cleanup claim. Delete the
          // now-complete object so an expired upload can never become orphaned.
          await bucket.delete(row.object_key);
        }
      } else if (row.multipart_upload_id === "direct") {
        await bucket.delete(row.object_key);
      }
      await db.prepare("UPDATE app_chat_upload_sessions SET status='expired',completed_at=CURRENT_TIMESTAMP WHERE id=? AND status='cleanup_in_progress'")
        .bind(row.id).run();
      expired += 1;
    } catch {
      await db.prepare("UPDATE app_chat_upload_sessions SET status=? WHERE id=? AND status='cleanup_in_progress'")
        .bind(row.status, row.id).run();
      failed += 1;
    }
  }
  return { scanned: rows.results.length, expired, failed };
}
