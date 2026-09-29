import { getD1, getRuntimeEnv } from "../../../../db";
import { ApiError, apiError, assertSameOrigin, requireActor, type Actor } from "../../../../lib/auth";
import { runInBackground } from "../../../../lib/background";
import {
  canOpenInformationRecord,
  informationDomainAccess,
  informationRecordScope,
  parseInformationFields,
} from "../../../../lib/information";
import { authorize } from "../../../../lib/policy";
import {
  informationFileDelete,
  informationFileDownload,
  informationFileRevise,
  informationFileUpload,
} from "../../../../lib/policy/information";
import { informationRecordAllowedActions, informationWorkflowConfig } from "../../../../lib/information-workflow";
import { informationVersionMatches } from "../../../../lib/information-input";

const MAX_INFORMATION_FILE_BYTES = 100 * 1024 * 1024;

type InformationFileRow = Record<string, unknown> & {
  id: number;
  record_id: number;
  domain_id: number;
  created_by_employee_id: number;
  status: string;
  template_visibility: string;
  fields_json: string;
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

async function recordForFile(actor: Actor, recordId: number) {
  const recordScope = informationRecordScope(actor, "r");
  const row = await (
    await getD1()
  )
    .prepare(
      `SELECT r.*,r.id AS record_id,t.domain_id,t.visibility AS template_visibility,t.fields_json,
       (SELECT COALESCE(MAX(version),0) FROM app_information_record_history h WHERE h.record_id=r.id) AS record_version
       FROM app_information_records r
       JOIN app_information_templates t ON t.id=r.template_id AND t.active=1
       JOIN app_information_domains d ON d.id=t.domain_id AND d.active=1
      WHERE r.id=? AND ${recordScope.sql} LIMIT 1`,
    )
    .bind(recordId, ...recordScope.binds)
    .first<InformationFileRow>();
  if (!row) return null;
  const access = await informationDomainAccess(actor);
  const domainId = Number(row.domain_id);
  if (!canOpenInformationRecord(access, { recordId, domainId, templateVisibility: String(row.template_visibility) }))
    return null;
  return { row, access, domainId };
}

function attachmentHistory(db: D1Database, row: InformationFileRow, actor: Actor, action: string) {
  const version = Number(row.record_version ?? 0) + 1;
  // The existing unique(record_id,version) constraint makes this the batch's
  // atomic lock against save, submit, approval and other file changes.
  return db
    .prepare(
      "INSERT INTO app_information_record_history (record_id,version,action,status,snapshot_json,actor_employee_id) VALUES (?,?,?,?,?,?)",
    )
    .bind(
      Number(row.record_id),
      version,
      action,
      String(row.status),
      JSON.stringify({
        title: row.title,
        periodStart: row.period_start,
        periodEnd: row.period_end,
        status: row.status,
        values: JSON.parse(String(row.values_json)),
        completenessScore: row.completeness_score,
        comment: row.comment,
      }),
      actor.id,
    );
}

async function assertFileRevision(
  request: Request,
  target: NonNullable<Awaited<ReturnType<typeof recordForFile>>>,
  actor: Actor,
) {
  const db = await getD1();
  const allowed = await informationRecordAllowedActions(
    db,
    actor,
    target.row,
    target.access.editable,
    await informationWorkflowConfig(db, Number(target.row.template_id)),
  );
  await authorize(informationFileRevise(allowed));
  const expected = request.headers.get("x-record-version");
  if (expected == null || !informationVersionMatches(Number(expected), Number(target.row.record_version ?? 0)))
    throw new ApiError(409, "Yozuv boshqa oynada o‘zgargan. Yangi holatni qayta oching");
}

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "Fayl ID majburiy" }, { status: 400 });
    const row = await (
      await getD1()
    )
      .prepare(
        `SELECT f.*,r.created_by_employee_id,r.status,t.domain_id,t.visibility AS template_visibility,t.fields_json
         FROM app_information_files f
         JOIN app_information_records r ON r.id=f.record_id
         JOIN app_information_templates t ON t.id=r.template_id AND t.active=1
        WHERE f.id=? LIMIT 1`,
      )
      .bind(id)
      .first<InformationFileRow>();
    if (!row || !(await recordForFile(actor, Number(row.record_id))))
      return Response.json({ error: "Fayl topilmadi" }, { status: 404 });
    // Files attached to a sensitive (🔒) field follow the field's protection (audit Y9).
    await authorize(
      informationFileDownload(actor, {
        fieldCode: row.field_code ? String(row.field_code) : null,
        templateFieldsJson: row.fields_json,
      }),
    );
    const object = await (await getRuntimeEnv()).BUCKET.get(String(row.object_key));
    if (!object) return Response.json({ error: "Fayl omborda topilmadi" }, { status: 404 });
    const fileName = String(row.file_name).replace(/[\r\n"]/g, "_");
    return new Response(object.body, {
      headers: {
        "Content-Type": safeContentType(fileName, String(row.content_type ?? "application/octet-stream")),
        "Content-Length": String(row.size ?? object.size),
        "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(String(row.file_name))}`,
        "Cache-Control": "private, max-age=3600",
        Vary: "Cookie",
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
    const recordId = Number(new URL(request.url).searchParams.get("recordId"));
    const fileName = decodedHeader(request, "x-file-name").trim().slice(0, 255);
    const fieldCode = decodedHeader(request, "x-field-code").trim().slice(0, 64) || null;
    const declaredSize = Number(request.headers.get("x-file-size") ?? request.headers.get("content-length") ?? 0);
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    const contentType = safeContentType(fileName, request.headers.get("content-type") ?? "application/octet-stream");
    if (!recordId || !fileName || !request.body)
      return Response.json({ error: "Yozuv va fayl majburiy" }, { status: 400 });
    if (!Number.isSafeInteger(declaredSize) || declaredSize <= 0 || declaredSize > MAX_INFORMATION_FILE_BYTES) {
      return Response.json({ error: "Fayl hajmi 100 MB dan oshmasligi kerak" }, { status: 413 });
    }
    if (contentLength && contentLength !== declaredSize)
      return Response.json({ error: "Fayl hajmi so‘rov ma’lumotiga mos kelmadi" }, { status: 400 });
    const target = await recordForFile(actor, recordId);
    if (!target) return Response.json({ error: "Ma’lumot yozuvi topilmadi" }, { status: 404 });
    await assertFileRevision(request, target, actor);
    await authorize(
      informationFileUpload(actor, {
        domainEditable: target.access.editable.includes(target.domainId),
        status: target.row.status,
      }),
    );
    if (fieldCode) {
      const field = parseInformationFields(target.row.fields_json).find(
        (item) => item.code === fieldCode && item.type === "file",
      );
      if (!field) return Response.json({ error: "Fayl maydoni shaklga mos emas" }, { status: 400 });
    }
    const safeName =
      fileName
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(-120) || "file";
    const objectKey = `information/${recordId}/${crypto.randomUUID()}-${safeName}`;
    const bucket = (await getRuntimeEnv()).BUCKET;
    const stored = (await bucket.put(objectKey, request.body, { httpMetadata: { contentType } })) as
      | { size?: number }
      | undefined;
    if (stored?.size != null && Number(stored.size) !== declaredSize) {
      await bucket.delete(objectKey);
      return Response.json({ error: "Yuklangan fayl hajmi mos kelmadi, qayta urinib ko‘ring" }, { status: 409 });
    }
    let id = 0;
    try {
      const db = await getD1();
      const results = await db.batch([
        attachmentHistory(db, target.row, actor, "file_uploaded"),
        db
          .prepare(
            "UPDATE app_information_records SET updated_by_employee_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
          )
          .bind(actor.id, recordId),
        db
          .prepare(
            `INSERT INTO app_information_files (record_id,field_code,object_key,file_name,content_type,size,uploaded_by_employee_id)
         VALUES (?,?,?,?,?,?,?)`,
          )
          .bind(recordId, fieldCode, objectKey, fileName, contentType, declaredSize, actor.id),
        db
          .prepare(
            "INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,'information.file_uploaded','information_file',last_insert_rowid(),?)",
          )
          .bind(actor.id, JSON.stringify({ recordId, fieldCode, fileName, size: declaredSize })),
      ]);
      id = Number(results[2].meta.last_row_id);
    } catch (error) {
      await bucket.delete(objectKey);
      if (/UNIQUE constraint failed: app_information_record_history/i.test(String(error)))
        throw new ApiError(409, "Yozuv parallel o‘zgargan; fayl biriktirilmadi. Yangi holatni qayta oching");
      throw error;
    }
    return Response.json(
      {
        version: Number(target.row.record_version ?? 0) + 1,
        file: {
          id,
          recordId,
          fieldCode,
          fileName,
          contentType,
          size: declaredSize,
          url: `/api/information/files?id=${id}`,
        },
      },
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
    const row = await db
      .prepare("SELECT * FROM app_information_files WHERE id=?")
      .bind(id)
      .first<Record<string, unknown>>();
    if (!row) return Response.json({ error: "Fayl topilmadi" }, { status: 404 });
    const target = await recordForFile(actor, Number(row.record_id));
    if (!target) return Response.json({ error: "Fayl topilmadi" }, { status: 404 });
    await assertFileRevision(request, target, actor);
    await authorize(
      informationFileDelete(
        actor,
        { domainEditable: target.access.editable.includes(target.domainId), status: target.row.status },
        { uploadedByEmployeeId: Number(row.uploaded_by_employee_id) },
      ),
    );
    try {
      await db.batch([
        attachmentHistory(db, target.row, actor, "file_deleted"),
        db.prepare("DELETE FROM app_information_files WHERE id=?").bind(id),
        db
          .prepare(
            "UPDATE app_information_records SET updated_by_employee_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
          )
          .bind(actor.id, Number(row.record_id)),
        db
          .prepare(
            "INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,'information.file_deleted','information_file',?,?)",
          )
          .bind(actor.id, id, JSON.stringify({ recordId: Number(row.record_id), fileName: String(row.file_name) })),
      ]);
    } catch (error) {
      if (/UNIQUE constraint failed: app_information_record_history/i.test(String(error)))
        throw new ApiError(409, "Yozuv parallel o‘zgargan; fayl o‘chirilmadi");
      throw error;
    }
    const bucket = (await getRuntimeEnv()).BUCKET;
    runInBackground(() =>
      bucket
        .delete(String(row.object_key))
        .catch((error: unknown) => console.error("Information file cleanup failed", error)),
    );
    return Response.json({ ok: true, version: Number(target.row.record_version ?? 0) + 1 });
  } catch (error) {
    return apiError(error);
  }
}
