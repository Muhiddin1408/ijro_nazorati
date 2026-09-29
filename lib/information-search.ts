import type { Actor } from "./auth";
import { ApiError } from "./auth";
import { informationDomainAccess, informationRecordAccessSql, informationRecordScope, parseInformationFields } from "./information";
import { canVerifyResearchProject, isExplicitResearchAdmin, isReadOnlyCommitteeLeadership } from "./research-policy";
import { researchAccessContext, RESEARCH_TEMPLATE_CODE } from "./research-server";
import { searchExcerpt, searchPlan } from "./search-language";
import type { InformationSearchKind, InformationSearchResponse, InformationSearchResult } from "./information-search-types";

type Row = Record<string, unknown>;
const kinds = new Set<InformationSearchKind>(["all", "record", "template", "research"]);
function safeValues(raw: unknown, fields: unknown) {
  let values: Record<string, unknown> = {};
  try { values = JSON.parse(String(raw ?? "{}")); } catch { return ""; }
  return parseInformationFields(fields).filter(field => !field.sensitive && !["file", "employee", "employees"].includes(field.type))
    .flatMap(field => {
      const value = values?.[field.code];
      if (value == null || value === "") return [];
      return [`${field.label}: ${Array.isArray(value) ? value.join(", ") : String(value)}`];
    }).join(" · ");
}

/**
 * External AI providers receive field values only when the template field is
 * explicitly marked `aiAllowed: true`. Other non-sensitive fields contribute
 * their label only, so the model knows what exists without seeing the data.
 */
function aiSafeValues(raw: unknown, fields: unknown) {
  let values: Record<string, unknown> = {};
  try { values = JSON.parse(String(raw ?? "{}")); } catch { return ""; }
  return parseInformationFields(fields).filter(field => !field.sensitive && !["file", "employee", "employees"].includes(field.type))
    .flatMap(field => {
      const value = values?.[field.code];
      if (value == null || value === "") return [];
      if ((field as { aiAllowed?: unknown }).aiAllowed !== true) return [field.label];
      return [`${field.label}: ${Array.isArray(value) ? value.join(", ") : String(value)}`];
    }).join(" · ");
}

export async function searchInformation(db: D1Database, actor: Actor, input: { query: string; kind?: string; page?: number; status?: string }): Promise<InformationSearchResponse> {
  const query = String(input.query ?? "").trim();
  if (query.length < 2 || query.length > 400) throw new ApiError(400, "Savolni 2–400 belgi bilan kiriting");
  const plan = searchPlan(query);
  if (!plan.expression) throw new ApiError(400, "Qidirilayotgan mavzu, hudud yoki ma’lumot nomini ham yozing");
  const kind = kinds.has(input.kind as InformationSearchKind) ? input.kind as InformationSearchKind : "all";
  const page = Number.isSafeInteger(input.page) && Number(input.page) >= 0 ? Math.min(Number(input.page), 5000) : 0;
  const pageSize = 20;
  const status = input.status === "published" || plan.published ? "published" : "all";
  const response: InformationSearchResponse = { query, terms: plan.terms, kind, status, results: [], total: 0, counts: { record: 0, template: 0, research: 0 }, page, pageSize, hasMore: false, generatedAt: new Date().toISOString(), mode: "search", aiStatus: "not_configured", answer: null };
  const access = await informationDomainAccess(actor, db);
  if (!access.visible.length) return response;
  const scope = informationRecordScope(actor);
  const recordAccess = informationRecordAccessSql(access);
  const context = await researchAccessContext(actor, db).catch(error => {
    // An inactive research registry must not disable other departments' search.
    if (error instanceof ApiError && error.status === 503) return null;
    throw error;
  });
  const researchBinds: unknown[] = [];
  let projectScope = "0=1";
  if (context?.domainVisible) {
    if (isExplicitResearchAdmin(actor) || isReadOnlyCommitteeLeadership(actor)) projectScope = "1=1";
    else {
      const clauses = ["p.created_by_employee_id=?", "p.responsible_employee_id=?"];
      researchBinds.push(actor.id, actor.id);
      if (context.domainEditable || context.domainReviewable) {
        clauses.push("p.coordinator_department_id=?");
        researchBinds.push(actor.departmentId ?? -1);
      }
      // Use the same verifier predicate as project/file access; exclude the submitter.
      const canVerify = canVerifyResearchProject(actor, { executorOrganizationId: actor.organizationId ?? -1, responsibleEmployeeId: -1, coordinatorDepartmentId: context.ownerDepartmentId, createdByEmployeeId: -1, status: "institute_review" }, context);
      if (canVerify) {
        clauses.push("(p.status='institute_review' AND p.executor_organization_id=? AND p.responsible_employee_id<>?)");
        researchBinds.push(actor.organizationId, actor.id);
      }
      projectScope = `(${clauses.join(" OR ")})`;
    }
  }
  const centralOnly = ["central", "committee"].includes(String(actor.organizationType)) ? "1=1" : "NOT EXISTS (SELECT 1 FROM app_information_template_workflows w WHERE w.template_id=t.id AND w.active=1 AND w.entry_scope='central_only')";
  const restricted = access.restricted.length ? `(t.visibility<>'restricted' OR t.domain_id IN (${access.restricted.map(() => "?").join(",")}))` : "t.visibility<>'restricted'";
  const from = `FROM app_center_search s
    LEFT JOIN app_information_records r ON s.kind='record' AND r.id=s.source_id
    LEFT JOIN app_research_projects p ON s.kind='research' AND p.id=s.source_id
    JOIN app_information_templates t ON (s.kind='record' AND t.id=r.template_id) OR (s.kind='template' AND t.id=s.source_id) OR (s.kind='research' AND t.code=?)
    JOIN app_information_domains d ON d.id=t.domain_id
    LEFT JOIN app_organizations o ON o.id=COALESCE(r.organization_id,p.executor_organization_id)`;
  const conditions = ["app_center_search MATCH ?", "t.active=1", "d.active=1", `d.id IN (${access.visible.map(() => "?").join(",")})`, restricted,
    `((s.kind='record' AND r.is_demo=0 AND ${recordAccess.sql} AND ${scope.sql}) OR
      (s.kind='template' AND t.catalog_state='current' AND d.catalog_state='current' AND COALESCE(json_extract(t.presentation_json,'$.hiddenFromCatalog'),0)<>1 AND ${centralOnly}) OR
      (s.kind='research' AND p.id IS NOT NULL AND ${projectScope}))`];
  const binds: unknown[] = [RESEARCH_TEMPLATE_CODE, plan.expression, ...access.visible, ...access.restricted, ...recordAccess.binds, ...scope.binds, ...researchBinds];
  if (status === "published") conditions.push("((s.kind='record' AND r.status='published') OR (s.kind='research' AND p.status IN ('completed','implementation')))");
  const where = `WHERE ${conditions.join(" AND ")}`;
  const countRows = await db.prepare(`SELECT s.kind,COUNT(*) AS n ${from} ${where} GROUP BY s.kind`).bind(...binds).all<Row>();
  for (const row of countRows.results) response.counts[String(row.kind) as Exclude<InformationSearchKind, "all">] = Number(row.n);
  response.total = kind === "all" ? Object.values(response.counts).reduce((sum, n) => sum + n, 0) : response.counts[kind];
  if (!response.total) return response;
  const rows = await db.prepare(`SELECT s.kind,s.source_id,t.id AS template_id,d.id AS domain_id,d.name AS domain_name,
    t.name AS template_name,t.description,t.fields_json,t.visibility,d.visibility AS domain_visibility,
    COALESCE(r.title,p.title,t.name) AS title,COALESCE(o.name,'') AS organization,
    COALESCE(r.status,p.status,'catalog') AS status,COALESCE(r.updated_at,p.updated_at) AS updated_at,
    r.values_json,p.problem,p.objective,p.expected_result,p.code,p.area
    ${from} ${where} ${kind === "all" ? "" : "AND s.kind=?"}
    ORDER BY bm25(app_center_search,0,0,6,1),s.rowid DESC LIMIT ? OFFSET ?`)
    .bind(...binds, ...(kind === "all" ? [] : [kind]), pageSize, page * pageSize).all<Row>();
  response.results = rows.results.map(row => {
    const sourceKind = String(row.kind) as InformationSearchResult["target"]["kind"];
    const text = sourceKind === "record" ? safeValues(row.values_json, row.fields_json)
      : sourceKind === "research" ? [row.code, row.area, row.problem, row.objective, row.expected_result].filter(Boolean).join(" · ") : String(row.description ?? "");
    const aiText = sourceKind === "record" ? aiSafeValues(row.values_json, row.fields_json)
      : sourceKind === "research" ? [row.code, row.area].filter(Boolean).join(" · ") : String(row.description ?? "");
    return { aiExcerpt: searchExcerpt(aiText, plan.terms), key: `${sourceKind}:${row.source_id}`, target: { kind: sourceKind, id: Number(row.source_id), domainId: Number(row.domain_id), templateId: Number(row.template_id) }, title: String(row.title), domain: String(row.domain_name), template: sourceKind === "research" ? "Ilmiy tadqiqotlar" : String(row.template_name), organization: String(row.organization), status: String(row.status), updatedAt: row.updated_at ? String(row.updated_at) : null, excerpt: searchExcerpt(text, plan.terms), restricted: row.visibility === "restricted" || row.domain_visibility === "restricted" };
  });
  response.hasMore = (page + 1) * pageSize < response.total;
  return response;
}
