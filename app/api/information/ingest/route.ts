import { getD1, getRuntimeEnv } from "../../../../db";
import { apiError } from "../../../../lib/auth";
import {
  INFORMATION_INTEGRATION_ACTOR_SQL,
  informationValueStatements,
  isStrictCalendarDate,
  parseInformationFields,
  sanitizeInformationValues,
  type InformationTemplateRow,
} from "../../../../lib/information";
import {
  informationValidationStatements,
  informationWorkflowConfig,
  validateInformationCandidate,
} from "../../../../lib/information-workflow";
import { random48BitId } from "../../../../lib/shared/ids";
import { readJsonBody } from "../../../../lib/shared/body";
import { isEditableRecordStatus } from "../../../../lib/shared/statuses";

const INGEST_BODY_LIMIT = 20 * 1024 * 1024;
const INGEST_MAX_RECORDS = 100;

type IngestItem = Record<string, unknown>;

const newRecordId = random48BitId;

async function sameSecret(left: string, right: string) {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const first = new Uint8Array(a);
  const second = new Uint8Array(b);
  let difference = first.length ^ second.length;
  for (let index = 0; index < first.length; index += 1) difference |= first[index] ^ (second[index] ?? 0);
  return difference === 0;
}

function cleanDate(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (!isStrictCalendarDate(text)) throw new Error("Hisobot davri sanasi noto‘g‘ri");
  return text;
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > INGEST_BODY_LIMIT)
      return Response.json({ error: "Integratsiya paketi 20 MB dan oshmasligi kerak" }, { status: 413 });
    const env = await getRuntimeEnv();
    const expected = String(env.INFORMATION_INGEST_SECRET ?? process.env.INFORMATION_INGEST_SECRET ?? "");
    const authorization = request.headers.get("authorization") ?? "";
    const provided = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
    if (!expected)
      return Response.json({ error: "Ma’lumot integratsiyasi maxfiy kaliti sozlanmagan" }, { status: 503 });
    if (!provided || !(await sameSecret(provided, expected)))
      return Response.json({ error: "Integratsiya kaliti noto‘g‘ri" }, { status: 401 });
    // Enforced while streaming too: chunked bodies carry no Content-Length.
    const body = await readJsonBody<{ records?: IngestItem[] }>(request, INGEST_BODY_LIMIT);
    const records = Array.isArray(body.records) ? body.records : [];
    if (!records.length) return Response.json({ error: "1–100 ta yozuv yuboring" }, { status: 400 });
    // Never drop records silently: the caller must split larger payloads.
    if (records.length > INGEST_MAX_RECORDS)
      return Response.json(
        {
          error: "Bir so‘rovda ko‘pi bilan 100 ta yozuv yuborish mumkin",
          maxRecords: INGEST_MAX_RECORDS,
          received: records.length,
        },
        { status: 413 },
      );
    const db = await getD1();
    const systemEmployee = await db.prepare(INFORMATION_INTEGRATION_ACTOR_SQL).first<{ id: number }>();
    if (!systemEmployee)
      return Response.json({ error: "Integratsiya uchun faol ma’lumot boshqaruvchisi topilmadi" }, { status: 503 });
    const actorId = Number(systemEmployee.id);
    const results: Array<{
      index: number;
      id?: number;
      status?: string;
      action?: string;
      validationErrors?: number;
      validationWarnings?: number;
      error?: string;
    }> = [];

    for (let index = 0; index < records.length; index += 1) {
      const item = records[index];
      try {
        const templateCode = String(item.templateCode ?? "")
          .trim()
          .slice(0, 100);
        const sourceMode = ["api", "telemetry", "xlsx"].includes(String(item.sourceMode))
          ? String(item.sourceMode)
          : "api";
        const sourceRecordKey = String(item.sourceRecordKey ?? "")
          .trim()
          .slice(0, 180);
        const title = String(item.title ?? "")
          .trim()
          .slice(0, 240);
        if (!templateCode || !sourceRecordKey || title.length < 3)
          throw new Error("templateCode, sourceRecordKey va sarlavha majburiy");
        const template = await db
          .prepare(
            `SELECT t.*,d.owner_department_id,department.organization_id AS owner_organization_id
             FROM app_information_templates t JOIN app_information_domains d ON d.id=t.domain_id AND d.active=1 AND d.catalog_state='current'
             LEFT JOIN app_departments department ON department.id=d.owner_department_id
            WHERE t.code=? AND t.active=1 AND t.catalog_state='current' LIMIT 1`,
          )
          .bind(templateCode)
          .first<
            InformationTemplateRow & { owner_department_id: number | null; owner_organization_id: number | null }
          >();
        if (!template) throw new Error("Shakl kodi topilmadi");
        const requestedOrganizationId = Number(item.organizationId);
        const organizationId =
          Number.isSafeInteger(requestedOrganizationId) && requestedOrganizationId > 0
            ? requestedOrganizationId
            : template.owner_organization_id == null
              ? null
              : Number(template.owner_organization_id);
        const departmentId =
          organizationId != null && organizationId === Number(template.owner_organization_id)
            ? template.owner_department_id == null
              ? null
              : Number(template.owner_department_id)
            : null;
        if (organizationId != null) {
          const organization = await db
            .prepare("SELECT id FROM app_organizations WHERE id=? AND active=1 LIMIT 1")
            .bind(organizationId)
            .first<{ id: number }>();
          if (!organization) throw new Error("Tashkilot faol ierarxiyada topilmadi");
        }
        const existing = await db
          .prepare(
            `SELECT r.id,r.status,r.title,r.period_start,r.period_end,r.values_json,r.is_demo,r.organization_id,r.updated_by_employee_id,
                    (SELECT COALESCE(MAX(version),0) FROM app_information_record_history h WHERE h.record_id=r.id) AS version
               FROM app_information_records r WHERE r.template_id=? AND r.source_mode=? AND r.source_record_key=? LIMIT 1`,
          )
          .bind(template.id, sourceMode, sourceRecordKey)
          .first<{
            id: number;
            status: string;
            title: string;
            period_start: string | null;
            period_end: string | null;
            values_json: string;
            is_demo: number;
            organization_id: number | null;
            updated_by_employee_id: number | null;
            version: number;
          }>();
        const fields = parseInformationFields(template.fields_json);
        const sanitized = sanitizeInformationValues(fields, item.values);
        const periodStart = cleanDate(item.periodStart);
        const periodEnd = cleanDate(item.periodEnd);
        if (periodStart && periodEnd && periodStart > periodEnd) throw new Error("Davr boshlanishi yakunidan keyin");
        // Integrations may stage data, but may never impersonate a human
        // submitter or bypass the normal approval route. The regular PATCH
        // submit action rechecks references, permissions, required files and
        // builds the district -> territorial -> central workflow.
        const status = "draft";
        const isDemo = item.isDemo === true ? 1 : 0;
        const workflow = await informationWorkflowConfig(db, Number(template.id));
        const validationIssues = await validateInformationCandidate(db, fields, workflow, {
          organizationId,
          periodStart,
          periodEnd,
          values: sanitized.values,
          isDemo: Boolean(isDemo),
          validationStage: "submit",
        });
        const validationErrors = validationIssues.filter((issue) => issue.severity === "error").length;
        const validationWarnings = validationIssues.filter((issue) => issue.severity === "warning").length;
        if (existing) {
          const existingId = Number(existing.id);
          const unchanged =
            existing.title === title &&
            (existing.period_start ?? null) === periodStart &&
            (existing.period_end ?? null) === periodEnd &&
            Number(existing.is_demo) === isDemo &&
            (existing.organization_id == null ? null : Number(existing.organization_id)) === organizationId &&
            existing.values_json === JSON.stringify(sanitized.values);
          if (unchanged) {
            results.push({ index, id: existingId, status: String(existing.status), action: "unchanged" });
            continue;
          }
          // Records already in the approval route, or edited by a person since the
          // last import, are never overwritten by an integration.
          if (!isEditableRecordStatus(existing.status)) {
            results.push({
              index,
              id: existingId,
              status: String(existing.status),
              action: "locked",
              error: "Yozuv tasdiqlash jarayonida — integratsiya uni o‘zgartira olmaydi",
            });
            continue;
          }
          if (existing.updated_by_employee_id != null && Number(existing.updated_by_employee_id) !== actorId) {
            results.push({
              index,
              id: existingId,
              status: String(existing.status),
              action: "locked",
              error: "Yozuv xodim tomonidan tahrirlangan — integratsiya uni ustiga yozmaydi",
            });
            continue;
          }
          const nextVersion = Number(existing.version) + 1;
          const updateSnapshot = JSON.stringify({
            title,
            periodStart,
            periodEnd,
            status: existing.status,
            sourceMode,
            sourceRecordKey,
            values: sanitized.values,
            completenessScore: sanitized.completeness,
            isDemo: Boolean(isDemo),
          });
          await db.batch([
            db
              .prepare(
                `UPDATE app_information_records SET title=?,organization_id=?,department_id=?,period_start=?,period_end=?,values_json=?,
                   completeness_score=?,is_demo=?,updated_by_employee_id=?,updated_at=CURRENT_TIMESTAMP
                 WHERE id=? AND status=?`,
              )
              .bind(
                title,
                organizationId,
                departmentId,
                periodStart,
                periodEnd,
                JSON.stringify(sanitized.values),
                sanitized.completeness,
                isDemo,
                actorId,
                existingId,
                existing.status,
              ),
            db
              .prepare(
                "INSERT INTO app_information_record_history (record_id,version,action,status,snapshot_json,actor_employee_id) VALUES (?,?,?,?,?,?)",
              )
              .bind(existingId, nextVersion, "integration_draft_updated", existing.status, updateSnapshot, actorId),
            ...informationValueStatements(db, existingId, fields, sanitized.values),
            ...informationValidationStatements(db, existingId, validationIssues),
            db
              .prepare(
                "INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,?,?,?,?)",
              )
              .bind(
                actorId,
                "information.integration_draft_updated",
                "information_record",
                existingId,
                JSON.stringify({ templateCode, sourceMode, sourceRecordKey, version: nextVersion, validationErrors }),
              ),
          ]);
          results.push({
            index,
            id: existingId,
            status: String(existing.status),
            action: "updated",
            validationErrors,
            validationWarnings,
          });
          continue;
        }
        const id = newRecordId();
        const snapshot = JSON.stringify({
          title,
          periodStart,
          periodEnd,
          status,
          sourceMode,
          sourceRecordKey,
          values: sanitized.values,
          completenessScore: sanitized.completeness,
          isDemo: Boolean(isDemo),
        });
        await db.batch([
          db
            .prepare(
              `INSERT INTO app_information_records
              (id,template_id,organization_id,department_id,title,period_start,period_end,status,priority,source_mode,source_record_key,values_json,completeness_score,is_demo,created_by_employee_id,updated_by_employee_id,submitted_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL)`,
            )
            .bind(
              id,
              template.id,
              organizationId,
              departmentId,
              title,
              periodStart,
              periodEnd,
              status,
              "normal",
              sourceMode,
              sourceRecordKey,
              JSON.stringify(sanitized.values),
              sanitized.completeness,
              isDemo,
              actorId,
              actorId,
            ),
          db
            .prepare(
              "INSERT INTO app_information_record_history (record_id,version,action,status,snapshot_json,actor_employee_id) VALUES (?,?,?,?,?,?)",
            )
            .bind(id, 1, "integration_draft_created", status, snapshot, actorId),
          ...informationValueStatements(db, id, fields, sanitized.values),
          ...informationValidationStatements(db, id, validationIssues),
        ]);
        await db
          .prepare(
            "INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,?,?,?,?)",
          )
          .bind(
            actorId,
            "information.integration_draft_created",
            "information_record",
            id,
            JSON.stringify({
              templateCode,
              sourceMode,
              sourceRecordKey,
              organizationId,
              status,
              validationErrors: validationIssues.filter((issue) => issue.severity === "error").length,
            }),
          )
          .run();
        results.push({
          index,
          id,
          status,
          action: item.submit === true ? "draft_requires_human_submit" : "created",
          validationErrors: validationIssues.filter((issue) => issue.severity === "error").length,
          validationWarnings: validationIssues.filter((issue) => issue.severity === "warning").length,
        });
      } catch (error) {
        results.push({
          index,
          error: error instanceof Error ? error.message.slice(0, 300) : "Yozuvni qabul qilib bo‘lmadi",
        });
      }
    }
    const failed = results.filter((item) => item.error && item.action !== "locked").length;
    const locked = results.filter((item) => item.action === "locked").length;
    return Response.json(
      { accepted: results.length - failed - locked, failed, locked, results },
      { status: failed === results.length ? 422 : 200 },
    );
  } catch (error) {
    return apiError(error);
  }
}
