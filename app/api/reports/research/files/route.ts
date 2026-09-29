import { getD1, getRuntimeEnv } from "@/db";
import { ApiError, apiError, assertSameOrigin, requireActor } from "@/lib/auth";
import { authorize } from "@/lib/policy";
import {
  researchFileDownload,
  researchProjectFileUpload,
  researchProjectView,
  researchUploadKind,
} from "@/lib/policy/research";
import { researchAccessContext, researchProjectById } from "@/lib/research-server";

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const TYPES: Record<string, { type: string; accepted: string[] }> = {
  pdf: { type: "application/pdf", accepted: ["application/pdf"] },
  docx: {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    accepted: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  },
  xlsx: {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    accepted: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  },
  zip: { type: "application/zip", accepted: ["application/zip", "application/x-zip-compressed"] },
  jpg: { type: "image/jpeg", accepted: ["image/jpeg"] },
  jpeg: { type: "image/jpeg", accepted: ["image/jpeg"] },
  png: { type: "image/png", accepted: ["image/png"] },
  webp: { type: "image/webp", accepted: ["image/webp"] },
};

function id(value: string | null) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

function decoded(request: Request, name: string) {
  const value = request.headers.get(name) ?? "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function descriptor(fileName: string, inputType: string) {
  const extension = fileName.toLowerCase().split(".").pop() ?? "";
  const found = TYPES[extension];
  const normalized = inputType.toLowerCase().split(";", 1)[0].trim();
  if (!found || (normalized !== "application/octet-stream" && !found.accepted.includes(normalized))) return null;
  return { extension, contentType: found.type };
}

function contentDispositionNames(fileName: string) {
  const ascii =
    fileName
      .normalize("NFKD")
      .replace(/[^\x20-\x7e]/g, "_")
      .replace(/["\\;]/g, "_")
      .slice(0, 180) || "research-file";
  const encoded = encodeURIComponent(fileName).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return { ascii, encoded };
}

function assertReportsFileRoute(request: Request) {
  // Served only under the information center URL; the implementation path itself stays private.
  if (new URL(request.url).pathname !== "/api/information/research/files") {
    throw new ApiError(404, "Fayl Ma’lumotlar markazidagi Ilmiy tadqiqotlardan ochiladi.");
  }
}

export async function GET(request: Request) {
  try {
    assertReportsFileRoute(request);
    const actor = await requireActor();
    const fileId = id(new URL(request.url).searchParams.get("id"));
    const DB = await getD1();
    const row = fileId
      ? await DB.prepare(
          `SELECT file.*,project.executor_organization_id AS executorOrganizationId,
              project.responsible_employee_id AS responsibleEmployeeId,
              project.coordinator_department_id AS coordinatorDepartmentId,
              project.created_by_employee_id AS createdByEmployeeId,project.status
         FROM app_research_files file JOIN app_research_projects project ON project.id=file.project_id
        WHERE file.id=? LIMIT 1`,
        )
          .bind(fileId)
          .first<Record<string, unknown>>()
      : null;
    if (!row) return Response.json({ error: "Fayl topilmadi" }, { status: 404 });
    const context = await researchAccessContext(actor, DB);
    const project = {
      executorOrganizationId: Number(row.executorOrganizationId),
      responsibleEmployeeId: Number(row.responsibleEmployeeId),
      coordinatorDepartmentId: Number(row.coordinatorDepartmentId),
      createdByEmployeeId: Number(row.createdByEmployeeId),
      status: String(row.status),
    };
    await authorize(researchFileDownload(actor, project, context));
    const object = await (await getRuntimeEnv()).BUCKET.get(String(row.object_key));
    if (!object) return Response.json({ error: "Fayl topilmadi" }, { status: 404 });
    const fileName = String(row.file_name).replace(/[\r\n]/g, "_");
    const disposition = contentDispositionNames(fileName);
    return new Response(object.body, {
      headers: {
        "Content-Type": descriptor(fileName, String(row.content_type))?.contentType ?? "application/octet-stream",
        "Content-Length": String(row.size ?? object.size),
        "Content-Disposition": `attachment; filename="${disposition.ascii}"; filename*=UTF-8''${disposition.encoded}`,
        "Cache-Control": "private, no-store",
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
    assertReportsFileRoute(request);
    assertSameOrigin(request);
    const actor = await requireActor();
    const url = new URL(request.url);
    const projectId = id(url.searchParams.get("projectId"));
    const milestoneId = id(url.searchParams.get("milestoneId")) || null;
    const purpose = String(url.searchParams.get("purpose") || "evidence");
    const fileName = decoded(request, "x-file-name").normalize("NFKC").trim().slice(0, 255);
    const declaredSize = Number(request.headers.get("x-file-size"));
    const contentLength = Number(request.headers.get("content-length"));
    const fileType = descriptor(fileName, request.headers.get("content-type") ?? "application/octet-stream");
    if (!projectId || !fileName || !request.body || !fileType)
      return Response.json({ error: "Fayl turi yoki loyiha manzili noto‘g‘ri" }, { status: 400 });
    if (
      !Number.isSafeInteger(declaredSize) ||
      !Number.isSafeInteger(contentLength) ||
      declaredSize <= 0 ||
      declaredSize > MAX_FILE_BYTES ||
      contentLength !== declaredSize
    ) {
      return Response.json({ error: "Fayl hajmi aniq ko‘rsatilishi va 15 MB dan oshmasligi kerak" }, { status: 413 });
    }
    const DB = await getD1();
    const project = await researchProjectById(DB, projectId);
    if (!project) return Response.json({ error: "Loyiha topilmadi" }, { status: 404 });
    const context = await researchAccessContext(actor, DB);
    await authorize(researchProjectView(actor, project, context));
    const uploadKind = researchUploadKind(actor, project, context, purpose, Boolean(milestoneId));
    await authorize(researchProjectFileUpload(uploadKind));
    const evidenceUpload = uploadKind === "evidence";
    let milestoneSnapshot: { id: number; status: string; version: number } | null = null;
    if (evidenceUpload) {
      const milestone = await DB.prepare(
        "SELECT id,status,version FROM app_research_milestones WHERE id=? AND project_id=? AND stage=? AND status IN ('active','returned') LIMIT 1",
      )
        .bind(milestoneId, projectId, project.currentStage)
        .first<{ id: number; status: string; version: number }>();
      if (!milestone) return Response.json({ error: "Fayl faqat joriy bosqichga biriktiriladi" }, { status: 409 });
      milestoneSnapshot = {
        id: Number(milestone.id),
        status: String(milestone.status),
        version: Number(milestone.version),
      };
    }
    const safeName =
      fileName
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(-120) || `research.${fileType.extension}`;
    const objectKey = `research/project-${projectId}/${crypto.randomUUID()}-${safeName}`;
    const BUCKET = (await getRuntimeEnv()).BUCKET;
    const stored = (await BUCKET.put(objectKey, request.body, {
      httpMetadata: { contentType: fileType.contentType },
    })) as { size?: number } | undefined;
    if (stored?.size == null || Number(stored.size) !== declaredSize) {
      await BUCKET.delete(objectKey);
      return Response.json({ error: "Yuklangan fayl hajmi mos kelmadi" }, { status: 409 });
    }
    const insertFile =
      uploadKind === "owner"
        ? DB.prepare(
            `INSERT INTO app_research_files
          (project_id,milestone_id,purpose,object_key,file_name,content_type,size,uploaded_by_employee_id)
         SELECT ?,?,?,?,?,?,?,?
          WHERE EXISTS (
            SELECT 1 FROM app_research_projects project
             WHERE project.id=? AND project.version=? AND project.status=?
               AND project.current_stage=?
          )`,
          ).bind(
            projectId,
            null,
            purpose,
            objectKey,
            fileName,
            fileType.contentType,
            declaredSize,
            actor.id,
            projectId,
            project.version,
            project.status,
            project.currentStage,
          )
        : DB.prepare(
            `INSERT INTO app_research_files
          (project_id,milestone_id,purpose,object_key,file_name,content_type,size,uploaded_by_employee_id)
         SELECT ?,?,?,?,?,?,?,?
          WHERE EXISTS (
            SELECT 1
              FROM app_research_projects project
              JOIN app_research_milestones milestone
                ON milestone.project_id=project.id AND milestone.stage=project.current_stage
             WHERE project.id=? AND project.version=? AND project.status=?
               AND project.current_stage=?
               AND milestone.id=? AND milestone.version=? AND milestone.status=?
          )`,
          ).bind(
            projectId,
            milestoneId,
            purpose,
            objectKey,
            fileName,
            fileType.contentType,
            declaredSize,
            actor.id,
            projectId,
            project.version,
            project.status,
            project.currentStage,
            milestoneSnapshot?.id ?? -1,
            milestoneSnapshot?.version ?? -1,
            milestoneSnapshot?.status ?? "",
          );

    let fileId = 0;
    try {
      const results = await DB.batch([
        insertFile,
        DB.prepare(
          `INSERT INTO app_audit_logs
            (actor_employee_id,action,entity_type,entity_id,detail_json)
           SELECT ?,'research.file_uploaded','research_project',?,
                  json_object(
                    'fileId',file.id,
                    'milestoneId',file.milestone_id,
                    'purpose',file.purpose,
                    'size',file.size
                  )
             FROM app_research_files file
            WHERE file.object_key=?`,
        ).bind(actor.id, projectId, objectKey),
      ]);
      if (Number(results[0].meta.changes ?? 0) !== 1) {
        await BUCKET.delete(objectKey);
        return Response.json(
          { error: "Loyiha yoki bosqich holati o‘zgargan. Sahifani yangilab qayta urinib ko‘ring" },
          { status: 409 },
        );
      }
      fileId = Number(results[0].meta.last_row_id);
      if (!Number.isSafeInteger(fileId) || fileId <= 0 || Number(results[1].meta.changes ?? 0) !== 1) {
        await DB.prepare("DELETE FROM app_research_files WHERE object_key=?").bind(objectKey).run();
        await BUCKET.delete(objectKey);
        return Response.json({ error: "Fayl yozuvi va audit qaydi yakunlanmadi" }, { status: 500 });
      }
    } catch (error) {
      await BUCKET.delete(objectKey);
      throw error;
    }
    return Response.json({ id: fileId }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
