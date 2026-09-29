import { getD1, getRuntimeEnv } from "../../../../db";
import { ApiError, apiError, assertSameOrigin, requireActor } from "../../../../lib/auth";
import { reportMutationAudit, REPORT_EDITABLE_SQL } from "../../../../lib/report-mutations";
import { canAccessReportAssignment as canAccessAssignment } from "../../../../lib/reports";
import { authorize } from "../../../../lib/policy";
import {
  reportAssignmentFileAttach,
  reportAssignmentView,
  reportTemplateFileManage,
} from "../../../../lib/policy/reports";
import { isEditableReportStatus } from "../../../../lib/shared/statuses";

const MAX_REPORT_FILE_BYTES = 100 * 1024 * 1024;

function safeContentType(fileName: string, value: string) {
  const raw = value.toLowerCase().split(";", 1)[0].trim();
  const extension = fileName.toLowerCase().split(".").pop() ?? "";
  if (["svg", "svgz", "html", "htm", "xhtml", "xml", "js", "mjs"].includes(extension))
    return "application/octet-stream";
  if (!raw || raw.includes("html") || raw.includes("xml") || raw.includes("javascript") || raw === "image/svg+xml")
    return "application/octet-stream";
  return raw.slice(0, 200);
}

function decodedHeader(request: Request, name: string) {
  try {
    return decodeURIComponent(request.headers.get(name) ?? "");
  } catch {
    return request.headers.get(name) ?? "";
  }
}

async function canAccessTemplate(actor: Awaited<ReturnType<typeof requireActor>>, templateId: number) {
  if (actor.permissions.viewScope === "all") return true;
  const row = await (
    await getD1()
  )
    .prepare(
      `SELECT t.id FROM app_report_templates t
      WHERE t.id=? AND (
        t.created_by_employee_id=?
        OR (?=1 AND t.owner_department_id=?)
        OR EXISTS (
          SELECT 1 FROM app_report_cycles c JOIN app_report_assignments a ON a.cycle_id=c.id
           WHERE c.template_id=t.id AND a.responsible_employee_id=?
        )
      ) LIMIT 1`,
    )
    .bind(templateId, actor.id, actor.permissions.canManageReports ? 1 : 0, actor.departmentId ?? -1, actor.id)
    .first();
  return Boolean(row);
}

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const id = Number(new URL(request.url).searchParams.get("id"));
    const row = await (await getD1())
      .prepare("SELECT * FROM app_report_files WHERE id=?")
      .bind(id)
      .first<Record<string, unknown>>();
    if (!row) return Response.json({ error: "Fayl topilmadi" }, { status: 404 });
    const allowed = row.assignment_id
      ? await canAccessAssignment(actor, Number(row.assignment_id))
      : row.template_id
        ? await canAccessTemplate(actor, Number(row.template_id))
        : false;
    if (!allowed) return Response.json({ error: "Fayl topilmadi" }, { status: 404 });
    const object = await (await getRuntimeEnv()).BUCKET.get(String(row.object_key));
    if (!object) return Response.json({ error: "Fayl omborda topilmadi" }, { status: 404 });
    const name = String(row.file_name).replace(/[\r\n"]/g, "_");
    return new Response(object.body, {
      headers: {
        "Content-Type": safeContentType(String(row.file_name), String(row.content_type ?? "application/octet-stream")),
        "Content-Length": String(row.size ?? object.size),
        "Content-Disposition": `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(String(row.file_name))}`,
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
    const url = new URL(request.url);
    const templateId = Number(url.searchParams.get("templateId")) || null;
    const assignmentId = Number(url.searchParams.get("assignmentId")) || null;
    const expectedHeader = request.headers.get("x-record-version");
    const expectedVersion = expectedHeader == null ? null : Number(expectedHeader);
    const mutationKey = crypto.randomUUID();
    const fileName = decodedHeader(request, "x-file-name").trim().slice(0, 255);
    const declaredSize = Number(request.headers.get("x-file-size") ?? request.headers.get("content-length") ?? 0);
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    const contentType = safeContentType(fileName, request.headers.get("content-type") ?? "application/octet-stream");
    if ((!templateId && !assignmentId) || (templateId && assignmentId) || !fileName || !request.body) {
      return Response.json({ error: "Fayl va hisobot manzili majburiy" }, { status: 400 });
    }
    if (!Number.isSafeInteger(declaredSize) || declaredSize <= 0 || declaredSize > MAX_REPORT_FILE_BYTES) {
      return Response.json({ error: "Fayl hajmi 100 MB dan oshmasligi kerak" }, { status: 413 });
    }
    if (contentLength && contentLength !== declaredSize) {
      return Response.json({ error: "Fayl hajmi so‘rov ma’lumotiga mos kelmadi" }, { status: 400 });
    }
    if (templateId) {
      await authorize(reportAssignmentView(await canAccessTemplate(actor, templateId)));
      const template = await (await getD1())
        .prepare("SELECT created_by_employee_id,owner_department_id FROM app_report_templates WHERE id=? AND active=1")
        .bind(templateId)
        .first<{ created_by_employee_id: number; owner_department_id: number | null }>();
      await authorize(
        reportTemplateFileManage(
          actor,
          template
            ? {
                templateCreatorEmployeeId: Number(template.created_by_employee_id),
                ownerDepartmentId: template.owner_department_id == null ? null : Number(template.owner_department_id),
              }
            : null,
        ),
      );
    }
    if (assignmentId) {
      await authorize(reportAssignmentView(await canAccessAssignment(actor, assignmentId)));
      const assignment = await (await getD1())
        .prepare("SELECT responsible_employee_id,status,version FROM app_report_assignments WHERE id=?")
        .bind(assignmentId)
        .first<{ responsible_employee_id: number; status: string; version: number }>();
      await authorize(
        reportAssignmentFileAttach(actor, assignment ? Number(assignment.responsible_employee_id) : null),
      );
      if (!isEditableReportStatus(assignment!.status))
        return Response.json(
          { error: "Yuborilgan yoki tasdiqlangan hisobotga fayl qo‘shib bo‘lmaydi" },
          { status: 409 },
        );
      if (!Number.isSafeInteger(expectedVersion) || expectedVersion !== Number(assignment!.version))
        return Response.json({ error: "Hisobot boshqa oynada o‘zgargan. Jadvalni qayta oching" }, { status: 409 });
    }
    const safeName =
      fileName
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(-120) || "file";
    const objectKey = `reports/${templateId ? `template-${templateId}` : `assignment-${assignmentId}`}/${crypto.randomUUID()}-${safeName}`;
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
      if (assignmentId) {
        const results = await db.batch([
          db
            .prepare(
              `UPDATE app_report_assignments SET version=version+1,mutation_key=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=? AND ${REPORT_EDITABLE_SQL}`,
            )
            .bind(mutationKey, assignmentId, expectedVersion),
          db
            .prepare(
              `INSERT INTO app_report_files (template_id,assignment_id,purpose,object_key,file_name,content_type,size,uploaded_by_employee_id)
            SELECT NULL,?,'evidence',?,?,?,?,? WHERE EXISTS (SELECT 1 FROM app_report_assignments WHERE id=? AND mutation_key=?)`,
            )
            .bind(assignmentId, objectKey, fileName, contentType, declaredSize, actor.id, assignmentId, mutationKey),
          reportMutationAudit(db, actor.id, assignmentId, mutationKey, "report.file_uploaded", {
            fileName,
            size: declaredSize,
          }),
        ]);
        if (Number(results[0].meta.changes) !== 1)
          throw new ApiError(409, "Hisobot parallel o‘zgargan; fayl biriktirilmadi");
        id = Number(results[1].meta.last_row_id);
      } else {
        const results = await db.batch([
          db
            .prepare(
              `INSERT INTO app_report_files (template_id,assignment_id,purpose,object_key,file_name,content_type,size,uploaded_by_employee_id) VALUES (?,NULL,'instruction',?,?,?,?,?)`,
            )
            .bind(templateId, objectKey, fileName, contentType, declaredSize, actor.id),
          db
            .prepare(
              "INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,'report.file_uploaded','report_file',last_insert_rowid(),?)",
            )
            .bind(actor.id, JSON.stringify({ templateId, fileName, size: declaredSize })),
        ]);
        id = Number(results[0].meta.last_row_id);
      }
    } catch (error) {
      await bucket.delete(objectKey);
      throw error;
    }
    return Response.json({ id, ...(assignmentId ? { version: Number(expectedVersion) + 1 } : {}) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
