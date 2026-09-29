/** Bounded upload helpers for task evidence files (plan item 14). */
import { ApiError } from "../lib/errors";

export const MAX_TASK_FILE_BYTES = 25 * 1024 * 1024;
/** Room for multipart boundaries and part headers around one file. */
export const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

export function sizeError() {
  return new ApiError(413, "Fayl hajmi 1 bayt–25 MB oralig‘ida bo‘lishi kerak");
}

/** Declared request size, required before any body byte is read. */
export function declaredLength(request: Request) {
  const header = request.headers.get("content-length");
  if (header == null || !/^\d+$/.test(header))
    throw new ApiError(411, "Fayl hajmi (Content-Length) ko‘rsatilishi kerak");
  return Number(header);
}

/** Passes at most `maxBytes` through; a longer body fails the stream (and the upload). */
export function limitStream(body: ReadableStream<Uint8Array>, maxBytes: number) {
  let seen = 0;
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        seen += chunk.byteLength;
        if (seen > maxBytes) controller.error(sizeError());
        else controller.enqueue(chunk);
      },
    }),
  );
}

const MB = 1024 * 1024;

export function taskFileQuota() {
  const perTask = Number(process.env.TASK_FILES_MAX_BYTES);
  const perEmployeeDaily = Number(process.env.TASK_FILES_DAILY_BYTES);
  return {
    perTask: Number.isFinite(perTask) && perTask > 0 ? perTask : 200 * MB,
    perEmployeeDaily: Number.isFinite(perEmployeeDaily) && perEmployeeDaily > 0 ? perEmployeeDaily : 1024 * MB,
  };
}

export type AttachmentReservation = {
  taskId: number;
  objectKey: string;
  fileName: string;
  contentType: string;
  size: number;
  employeeId: number;
};

/**
 * Reserves an attachment row before any byte is stored. One INSERT…SELECT
 * checks both quotas, so parallel uploads cannot overshoot them. The caller
 * deletes the row if storing the object fails.
 */
export async function reserveTaskAttachment(db: D1Database, input: AttachmentReservation) {
  const quota = taskFileQuota();
  const result = await db
    .prepare(
      `INSERT INTO app_attachments (task_id, object_key, file_name, content_type, size, uploaded_by_employee_id)
       SELECT ?, ?, ?, ?, ?, ?
        WHERE (SELECT COALESCE(SUM(size), 0) FROM app_attachments WHERE task_id = ?) + ? <= ?
          AND (SELECT COALESCE(SUM(size), 0) FROM app_attachments
                WHERE uploaded_by_employee_id = ? AND created_at >= datetime('now', '-1 day')) + ? <= ?`,
    )
    .bind(
      input.taskId,
      input.objectKey,
      input.fileName,
      input.contentType,
      input.size,
      input.employeeId,
      input.taskId,
      input.size,
      quota.perTask,
      input.employeeId,
      input.size,
      quota.perEmployeeDaily,
    )
    .run();
  if (Number(result.meta.changes ?? 0) === 1) return Number(result.meta.last_row_id);
  const taskTotal = await db
    .prepare("SELECT COALESCE(SUM(size), 0) AS total FROM app_attachments WHERE task_id = ?")
    .bind(input.taskId)
    .first<{ total: number }>();
  if (Number(taskTotal?.total ?? 0) + input.size > quota.perTask) {
    throw new ApiError(413, `Topshiriq fayllari jami ${Math.round(quota.perTask / MB)} MB dan oshmasligi kerak`);
  }
  throw new ApiError(429, `Bir kunda ${Math.round(quota.perEmployeeDaily / MB)} MB dan ortiq fayl yuklab bo‘lmaydi`);
}
