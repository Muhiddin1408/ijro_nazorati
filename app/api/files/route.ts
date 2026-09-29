import { getD1, getRuntimeEnv } from "../../../db";
import { type Actor, apiError, assertSameOrigin, audit, canAccessTask, requireActor } from "../../../lib/auth";
import { ApiError } from "../../../lib/errors";
import { authorize } from "../../../lib/policy";
import { fileDelete, fileDownload, fileUpload } from "../../../lib/policy/tasks";
import { loadTaskContext } from "../../../services/tasks";
import { mapAttachment, type AttachmentRecord, type AttachmentRow } from "../../../services/task-rows";
import {
  MAX_TASK_FILE_BYTES,
  MULTIPART_OVERHEAD_BYTES,
  declaredLength,
  limitStream,
  sizeError,
  reserveTaskAttachment,
} from "../../../services/task-files";

function safeDownloadType(fileName: string, value: unknown) {
  const extension = fileName.toLowerCase().split(".").pop() ?? "";
  const contentType = String(value || "application/octet-stream")
    .toLowerCase()
    .split(";", 1)[0]
    .trim();
  if (["svg", "svgz", "html", "htm", "xhtml", "xml", "js", "mjs"].includes(extension))
    return "application/octet-stream";
  if (!contentType || contentType.includes("html") || contentType.includes("xml") || contentType.includes("javascript"))
    return "application/octet-stream";
  return contentType.slice(0, 200);
}

async function loadAttachment(db: D1Database, id: number): Promise<AttachmentRecord | null> {
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const row = await db
    .prepare(
      "SELECT id,task_id,object_key,file_name,content_type,size,uploaded_by_employee_id,created_at FROM app_attachments WHERE id=?",
    )
    .bind(id)
    .first<AttachmentRow>();
  return row ? mapAttachment(row) : null;
}

function contextFor(db: D1Database, actor: Actor, taskId: number) {
  return loadTaskContext(db, taskId, actor.id, () => canAccessTask(actor, taskId));
}

type IncomingFile = { name: string; type: string; size: number; stream: ReadableStream<Uint8Array> };

/**
 * Two upload forms, both bounded before the body is read:
 * - raw body with `?taskId=&fileName=` (streamed straight to storage);
 * - multipart/form-data (the current UI), rejected by Content-Length first.
 */
async function incomingFile(request: Request): Promise<{ taskId: number; file: IncomingFile }> {
  const length = declaredLength(request);
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    const url = new URL(request.url);
    if (length <= 0 || length > MAX_TASK_FILE_BYTES) throw sizeError();
    if (!request.body) throw new ApiError(400, "Fayl va topshiriq ID majburiy");
    return {
      taskId: Number(url.searchParams.get("taskId")),
      file: {
        name: String(url.searchParams.get("fileName") ?? ""),
        type: contentType,
        size: length,
        stream: limitStream(request.body, length),
      },
    };
  }
  if (length > MAX_TASK_FILE_BYTES + MULTIPART_OVERHEAD_BYTES) throw sizeError();
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "Fayl va topshiriq ID majburiy");
  return {
    taskId: Number(form.get("taskId")),
    file: { name: file.name, type: file.type, size: file.size, stream: file.stream() },
  };
}

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "Fayl ID majburiy" }, { status: 400 });
    const db = await getD1();
    const attachment = await loadAttachment(db, id);
    await authorize(fileDownload(actor, attachment ? await contextFor(db, actor, attachment.taskId) : null));
    const object = await (await getRuntimeEnv()).BUCKET.get(attachment!.objectKey);
    if (!object) return Response.json({ error: "Fayl omborda topilmadi" }, { status: 404 });
    const safeName = attachment!.fileName.replace(/[\r\n"]/g, "_");
    return new Response(object.body, {
      headers: {
        "Content-Type": safeDownloadType(attachment!.fileName, attachment!.contentType),
        "Content-Length": String(attachment!.size || object.size),
        "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(attachment!.fileName)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const { taskId, file } = await incomingFile(request);
    if (!taskId) return Response.json({ error: "Fayl va topshiriq ID majburiy" }, { status: 400 });
    if (!file.name.trim() || file.name.length > 255)
      return Response.json({ error: "Fayl nomi 1–255 belgidan iborat bo‘lishi kerak" }, { status: 400 });
    const db = await getD1();
    await authorize(fileUpload(actor, await contextFor(db, actor, taskId)));
    if (file.size <= 0 || file.size > MAX_TASK_FILE_BYTES) throw sizeError();
    const safeName =
      file.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(-120) || "file";
    const objectKey = `tasks/${taskId}/${crypto.randomUUID()}-${safeName}`;
    const contentType = safeDownloadType(file.name, file.type);
    const bucket = (await getRuntimeEnv()).BUCKET;
    // Quotas are reserved before the upload is stored (see reserveTaskAttachment).
    const id = await reserveTaskAttachment(db, {
      taskId,
      objectKey,
      fileName: file.name,
      contentType,
      size: file.size,
      employeeId: actor.id,
    });
    const release = async () => {
      await db.prepare("DELETE FROM app_attachments WHERE id=?").bind(id).run();
      await bucket.delete(objectKey);
    };
    let stored: { size?: number } | undefined;
    try {
      stored = (await bucket.put(objectKey, file.stream, { httpMetadata: { contentType } })) as
        | { size?: number }
        | undefined;
    } catch (error) {
      await release();
      throw error instanceof ApiError ? error : sizeError();
    }
    if (stored?.size != null && Number(stored.size) !== file.size) {
      await release();
      return Response.json({ error: "Yuklangan fayl hajmi mos kelmadi, qayta urinib ko‘ring" }, { status: 409 });
    }
    await audit(actor, "file.uploaded", "attachment", id, { taskId, fileName: file.name, size: file.size });
    return Response.json(
      { attachment: { id, taskId, fileName: file.name, contentType, size: file.size } },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const id = Number(new URL(request.url).searchParams.get("id"));
    const db = await getD1();
    const attachment = await loadAttachment(db, id);
    await authorize(fileDelete(actor, attachment ? await contextFor(db, actor, attachment.taskId) : null, attachment));
    // The row goes first: a failed storage delete leaves an orphan object, never a dangling row.
    await db.prepare("DELETE FROM app_attachments WHERE id=?").bind(id).run();
    await (await getRuntimeEnv()).BUCKET.delete(attachment!.objectKey);
    await audit(actor, "file.deleted", "attachment", id, {
      taskId: attachment!.taskId,
      fileName: attachment!.fileName,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
