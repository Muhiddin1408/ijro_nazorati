import { getD1 } from "../../../db";
import { apiError, assertSameOrigin, requireActor } from "../../../lib/auth";
import {
  canViewSensitiveInformation,
  informationDomainAccess,
  informationRecordAccessSql,
  informationRecordScope,
  mapInformationTemplate,
  redactSensitiveValues,
  sensitiveFieldCodes,
  type InformationTemplateRow,
} from "../../../lib/information";
import {
  informationEntryCapabilities,
  informationRecordAllowedActions,
  informationWorkflowConfig,
} from "../../../lib/information-workflow";
import { readJsonBody } from "../../../lib/shared/body";
import {
  createInformationRecord,
  mutateInformationRecord,
  parseArray,
  parseObject,
} from "../../../services/information";

type Row = Record<string, unknown>;

function mapRecord(row: Row, canViewSensitive: boolean) {
  const { values, redactedFields } = canViewSensitive
    ? { values: parseObject(row.values_json), redactedFields: [] as string[] }
    : redactSensitiveValues(parseObject(row.values_json), sensitiveFieldCodes(row.template_fields_json));
  return {
    id: Number(row.id),
    version: Number(row.record_version ?? 0),
    templateId: Number(row.template_id),
    domainId: Number(row.domain_id),
    title: String(row.title),
    periodStart: row.period_start ? String(row.period_start) : null,
    periodEnd: row.period_end ? String(row.period_end) : null,
    status: String(row.status),
    priority: String(row.priority),
    sourceMode: String(row.source_mode),
    sourceRecordKey: row.source_record_key ? String(row.source_record_key) : null,
    values,
    redactedFields,
    completenessScore: Number(row.completeness_score ?? 0),
    isDemo: Boolean(row.is_demo),
    department: {
      id: row.department_id == null ? null : Number(row.department_id),
      name: String(row.department_name ?? ""),
    },
    organization: {
      id: row.organization_id == null ? null : Number(row.organization_id),
      name: String(row.organization_name ?? ""),
    },
    creator: { id: Number(row.created_by_employee_id), name: String(row.creator_name ?? "") },
    reviewer:
      row.reviewed_by_employee_id == null
        ? null
        : { id: Number(row.reviewed_by_employee_id), name: String(row.reviewer_name ?? "") },
    submittedAt: row.submitted_at ? String(row.submitted_at) : null,
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    comment: String(row.comment ?? ""),
    workflow: row.current_step_code
      ? {
          round: Number(row.workflow_round ?? 1),
          sequence: Number(row.current_step_sequence ?? 1),
          stepCode: String(row.current_step_code),
          stepName: String(row.current_step_name ?? ""),
        }
      : null,
    validation: {
      errors: Number(row.validation_error_count ?? 0),
      warnings: Number(row.validation_warning_count ?? 0),
    },
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

const RECORD_SELECT = `SELECT r.*,t.domain_id,t.fields_json AS template_fields_json,
  (SELECT COALESCE(MAX(version),0) FROM app_information_record_history history WHERE history.record_id=r.id) AS record_version,
  d.name AS department_name,o.name AS organization_name,
  creator.full_name AS creator_name,reviewer.full_name AS reviewer_name,
  current_step.workflow_round AS workflow_round,current_step.sequence_no AS current_step_sequence,
  current_step.step_code AS current_step_code,current_step.step_name AS current_step_name,
  (SELECT COUNT(*) FROM app_information_validation_issues issue WHERE issue.record_id=r.id AND issue.resolved_at IS NULL AND issue.severity='error') AS validation_error_count,
  (SELECT COUNT(*) FROM app_information_validation_issues issue WHERE issue.record_id=r.id AND issue.resolved_at IS NULL AND issue.severity='warning') AS validation_warning_count
 FROM app_information_records r
 JOIN app_information_templates t ON t.id=r.template_id AND t.active=1
 JOIN app_information_domains domain ON domain.id=t.domain_id AND domain.active=1
 LEFT JOIN app_departments d ON d.id=r.department_id
 LEFT JOIN app_organizations o ON o.id=r.organization_id
 JOIN app_employees creator ON creator.id=r.created_by_employee_id
 LEFT JOIN app_employees reviewer ON reviewer.id=r.reviewed_by_employee_id
 LEFT JOIN app_information_record_approval_steps current_step ON current_step.id=(
   SELECT step.id FROM app_information_record_approval_steps step
   WHERE step.record_id=r.id AND step.status='pending'
   ORDER BY step.workflow_round DESC,step.sequence_no LIMIT 1
 )`;

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const db = await getD1();
    const access = await informationDomainAccess(actor);
    const entryCapabilities = await informationEntryCapabilities(db, actor);
    const recordScope = informationRecordScope(actor);
    const recordAccess = informationRecordAccessSql(access);
    const canViewSensitive = canViewSensitiveInformation(actor);
    if (!access.visible.length)
      return Response.json({
        capabilities: { manage: false },
        summary: {},
        domains: [],
        templates: [],
        records: [],
        totalCount: 0,
        nextCursor: null,
      });
    const url = new URL(request.url);
    const recordId = Number(url.searchParams.get("recordId")) || null;
    const domainId = Number(url.searchParams.get("domainId")) || null;
    const templateId = Number(url.searchParams.get("templateId")) || null;
    const cursor = Math.max(0, Number(url.searchParams.get("cursor")) || 0);
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit")) || 40));
    const status = String(url.searchParams.get("status") ?? "all").slice(0, 30);
    const source = String(url.searchParams.get("source") ?? "all").slice(0, 30);
    const query = String(url.searchParams.get("q") ?? "")
      .trim()
      .slice(0, 100);
    const includeDemo = url.searchParams.get("includeDemo") !== "0";
    const requestedView = String(url.searchParams.get("view") ?? "full");
    const catalogView = recordId
      ? "none"
      : (["domains", "domain", "template", "full"] as const).includes(
            requestedView as "domains" | "domain" | "template" | "full",
          )
        ? (requestedView as "domains" | "domain" | "template" | "full")
        : "full";
    const includeCatalog = catalogView !== "none" && url.searchParams.get("catalog") !== "0";
    const includeRecords =
      !recordId && (catalogView === "template" || catalogView === "full" || url.searchParams.get("records") === "1");
    const placeholders = access.visible.map(() => "?").join(",");
    const restrictedVisibility = access.restricted.length
      ? `(visibility<>'restricted' OR domain_id IN (${access.restricted.map(() => "?").join(",")}))`
      : "visibility<>'restricted'";

    const domainConditions = ["domain.active=1", "domain.catalog_state='current'", `domain.id IN (${placeholders})`];
    const domainBinds: unknown[] = [...access.visible];
    if ((catalogView === "domain" || catalogView === "template") && domainId) {
      domainConditions.push("domain.id=?");
      domainBinds.push(domainId);
    } else if (catalogView === "template" && templateId) {
      domainConditions.push(
        "domain.id=(SELECT domain_id FROM app_information_templates WHERE id=? AND active=1 AND catalog_state='current')",
      );
      domainBinds.push(templateId);
    }

    const templateConditions = [
      "active=1",
      "catalog_state='current'",
      `domain_id IN (${placeholders})`,
      restrictedVisibility,
    ];
    const hierarchicalTemplatesOnly = !["central", "committee"].includes(String(actor.organizationType));
    if (hierarchicalTemplatesOnly) {
      templateConditions.push(
        "NOT EXISTS (SELECT 1 FROM app_information_template_workflows workflow_scope WHERE workflow_scope.template_id=app_information_templates.id AND workflow_scope.active=1 AND workflow_scope.entry_scope='central_only')",
      );
    }
    if (catalogView !== "template")
      templateConditions.push("COALESCE(json_extract(presentation_json,'$.hiddenFromCatalog'),0)<>1");
    const templateBinds: unknown[] = [...access.visible, ...access.restricted];
    if (catalogView === "domain" && domainId) {
      templateConditions.push("domain_id=?");
      templateBinds.push(domainId);
    } else if (catalogView === "template" && templateId) {
      templateConditions.push("id=?");
      templateBinds.push(templateId);
    }

    const catalogRows = includeCatalog
      ? await Promise.all([
          db
            .prepare(
              `SELECT domain.*,department.name AS owner_department_name,organization.name AS owner_organization_name
           FROM app_information_domains domain
           LEFT JOIN app_departments department ON department.id=domain.owner_department_id
           LEFT JOIN app_organizations organization ON organization.id=department.organization_id
          WHERE ${domainConditions.join(" AND ")} ORDER BY domain.sort_order,domain.id`,
            )
            .bind(...domainBinds)
            .all<Row>(),
          catalogView === "domains"
            ? Promise.resolve({ results: [] as InformationTemplateRow[] })
            : db
                .prepare(
                  `SELECT t.*,workflow.workflow_code,workflow.entry_scope,
            workflow.owner_department_id AS workflow_owner_department_id,workflow_department.name AS workflow_owner_department_name
          FROM app_information_templates t
          LEFT JOIN app_information_template_workflows workflow ON workflow.template_id=t.id AND workflow.active=1
          LEFT JOIN app_departments workflow_department ON workflow_department.id=workflow.owner_department_id
          WHERE t.id IN (SELECT id FROM app_information_templates WHERE ${templateConditions.join(" AND ")}) ORDER BY t.domain_id,t.name`,
                )
                .bind(...templateBinds)
                .all<InformationTemplateRow>(),
          db
            .prepare(
              `SELECT domain_id,COUNT(*) AS template_count,
          SUM(COALESCE(json_array_length(indicators_json),0)) AS indicator_count
         FROM app_information_templates
         WHERE active=1 AND catalog_state='current' AND COALESCE(json_extract(presentation_json,'$.hiddenFromCatalog'),0)<>1 AND domain_id IN (${placeholders}) AND ${restrictedVisibility}
           ${hierarchicalTemplatesOnly ? "AND NOT EXISTS (SELECT 1 FROM app_information_template_workflows workflow_scope WHERE workflow_scope.template_id=app_information_templates.id AND workflow_scope.active=1 AND workflow_scope.entry_scope='central_only')" : ""}
         GROUP BY domain_id`,
            )
            .bind(...access.visible, ...access.restricted)
            .all<Row>(),
        ])
      : null;

    const templates = (catalogRows?.[1].results ?? []).map(mapInformationTemplate);
    const aggregateByDomain = new Map((catalogRows?.[2].results ?? []).map((row) => [Number(row.domain_id), row]));
    const domains = (catalogRows?.[0].results ?? []).map((row) => {
      const ownTemplates = templates.filter((template) => template.domainId === Number(row.id));
      const aggregate = aggregateByDomain.get(Number(row.id));
      return {
        id: Number(row.id),
        code: String(row.code),
        name: String(row.name),
        description: String(row.description ?? ""),
        ownerLabel: String(row.owner_label ?? ""),
        color: String(row.color),
        icon: String(row.icon),
        sortOrder: Number(row.sort_order),
        visibility: String(row.visibility),
        ownerDepartment:
          row.owner_department_id == null
            ? null
            : { id: Number(row.owner_department_id), name: String(row.owner_department_name ?? "") },
        ownerOrganization: String(row.owner_organization_name ?? ""),
        templateCount: Number(aggregate?.template_count ?? ownTemplates.length),
        indicatorCount: Number(
          aggregate?.indicator_count ?? ownTemplates.reduce((sum, template) => sum + template.indicators.length, 0),
        ),
        recordCount: 0,
        realRecordCount: 0,
        demoRecordCount: 0,
        submittedCount: 0,
        publishedCount: 0,
        needsWorkCount: 0,
        completeness: null,
        latestAt: null,
        canEdit: access.editable.includes(Number(row.id)),
        canReview: access.reviewable.includes(Number(row.id)),
      };
    });

    if (recordId) {
      const row = await db
        .prepare(`${RECORD_SELECT} WHERE r.id=? AND ${recordAccess.sql} AND ${recordScope.sql} LIMIT 1`)
        .bind(recordId, ...recordAccess.binds, ...recordScope.binds)
        .first<Row>();
      if (!row) return Response.json({ error: "Ma’lumot yozuvi topilmadi" }, { status: 404 });
      const [
        history,
        participants,
        actions,
        files,
        approvalSteps,
        validationIssues,
        detailTemplateRow,
        detailDomainRow,
      ] = await Promise.all([
        db
          .prepare(
            `SELECT h.id,h.version,h.action,h.status,h.created_at,e.full_name AS actor_name
          FROM app_information_record_history h JOIN app_employees e ON e.id=h.actor_employee_id
          WHERE h.record_id=? ORDER BY h.version DESC LIMIT 50`,
          )
          .bind(recordId)
          .all<Row>(),
        db
          .prepare("SELECT * FROM app_information_participants WHERE record_id=? ORDER BY id")
          .bind(recordId)
          .all<Row>(),
        db
          .prepare("SELECT * FROM app_information_actions WHERE record_id=? ORDER BY status,deadline_at,id")
          .bind(recordId)
          .all<Row>(),
        db
          .prepare(
            "SELECT id,field_code,file_name,content_type,size,created_at FROM app_information_files WHERE record_id=? ORDER BY id DESC",
          )
          .bind(recordId)
          .all<Row>(),
        db
          .prepare(
            `SELECT step.id,step.workflow_round,step.sequence_no,step.step_code,step.step_name,step.status,
          step.organization_id,organization.name AS organization_name,step.department_id,department.name AS department_name,
          step.acted_by_employee_id,actor.full_name AS actor_name,step.decision_comment,step.decided_at,step.created_at
          FROM app_information_record_approval_steps step
          LEFT JOIN app_organizations organization ON organization.id=step.organization_id
          LEFT JOIN app_departments department ON department.id=step.department_id
          LEFT JOIN app_employees actor ON actor.id=step.acted_by_employee_id
          WHERE step.record_id=? ORDER BY step.workflow_round DESC,step.sequence_no`,
          )
          .bind(recordId)
          .all<Row>(),
        db
          .prepare(
            `SELECT id,rule_code,severity,field_codes_json,message,actual_json,expected_json,detected_at
          FROM app_information_validation_issues WHERE record_id=? AND resolved_at IS NULL ORDER BY severity,id`,
          )
          .bind(recordId)
          .all<Row>(),
        db
          .prepare(
            `SELECT t.*,workflow.workflow_code,workflow.entry_scope,
          workflow.owner_department_id AS workflow_owner_department_id,workflow_department.name AS workflow_owner_department_name
          FROM app_information_templates t
          LEFT JOIN app_information_template_workflows workflow ON workflow.template_id=t.id AND workflow.active=1
          LEFT JOIN app_departments workflow_department ON workflow_department.id=workflow.owner_department_id
          WHERE t.id=? AND t.active=1 LIMIT 1`,
          )
          .bind(Number(row.template_id))
          .first<InformationTemplateRow>(),
        db
          .prepare(
            `SELECT domain.*,department.name AS owner_department_name,organization.name AS owner_organization_name
          FROM app_information_domains domain LEFT JOIN app_departments department ON department.id=domain.owner_department_id
          LEFT JOIN app_organizations organization ON organization.id=department.organization_id WHERE domain.id=? AND domain.active=1 LIMIT 1`,
          )
          .bind(Number(row.domain_id))
          .first<Row>(),
      ]);
      const detailTemplates = detailTemplateRow ? [mapInformationTemplate(detailTemplateRow)] : [];
      const hiddenFieldCodes = canViewSensitive ? new Set<string>() : sensitiveFieldCodes(row.template_fields_json);
      const visibleFiles = files.results.filter(
        (item) => !item.field_code || !hiddenFieldCodes.has(String(item.field_code)),
      );
      const allowedActions = await informationRecordAllowedActions(
        db,
        actor,
        row,
        access.editable,
        await informationWorkflowConfig(db, Number(row.template_id)),
      );
      const detailDomains = detailDomainRow
        ? [
            {
              id: Number(detailDomainRow.id),
              code: String(detailDomainRow.code),
              name: String(detailDomainRow.name),
              description: String(detailDomainRow.description ?? ""),
              ownerLabel: String(detailDomainRow.owner_label ?? ""),
              color: String(detailDomainRow.color),
              icon: String(detailDomainRow.icon),
              sortOrder: Number(detailDomainRow.sort_order),
              visibility: String(detailDomainRow.visibility),
              ownerDepartment:
                detailDomainRow.owner_department_id == null
                  ? null
                  : {
                      id: Number(detailDomainRow.owner_department_id),
                      name: String(detailDomainRow.owner_department_name ?? ""),
                    },
              ownerOrganization: String(detailDomainRow.owner_organization_name ?? ""),
              templateCount: detailTemplates.length,
              indicatorCount: detailTemplates.reduce((sum, template) => sum + template.indicators.length, 0),
              recordCount: 0,
              realRecordCount: 0,
              demoRecordCount: 0,
              submittedCount: 0,
              publishedCount: 0,
              needsWorkCount: 0,
              completeness: null,
              latestAt: null,
              canEdit: access.editable.includes(Number(detailDomainRow.id)),
              canReview: access.reviewable.includes(Number(detailDomainRow.id)),
            },
          ]
        : [];
      return Response.json(
        {
          capabilities: {
            ...entryCapabilities,
            manage: actor.permissions.canManageInformation,
            editableDomainIds: access.editable,
            reviewableDomainIds: access.reviewable,
          },
          domains: detailDomains,
          templates: detailTemplates,
          record: { ...mapRecord(row, canViewSensitive), allowedActions },
          history: history.results.map((item) => ({
            id: Number(item.id),
            version: Number(item.version),
            action: String(item.action),
            status: String(item.status),
            actor: String(item.actor_name),
            createdAt: String(item.created_at),
          })),
          participants: participants.results.map((item) => ({
            id: Number(item.id),
            type: String(item.participant_type),
            employeeId: item.employee_id == null ? null : Number(item.employee_id),
            name: String(item.full_name),
            organization: String(item.organization),
            position: String(item.position),
            countryCode: item.country_code ? String(item.country_code) : null,
          })),
          actions: actions.results.map((item) => ({
            id: Number(item.id),
            title: String(item.title),
            ownerEmployeeId: item.owner_employee_id == null ? null : Number(item.owner_employee_id),
            ownerName: String(item.owner_name),
            deadlineAt: item.deadline_at ? String(item.deadline_at) : null,
            status: String(item.status),
            linkedTaskId: item.linked_task_id == null ? null : Number(item.linked_task_id),
          })),
          approvalSteps: approvalSteps.results.map((item) => ({
            id: Number(item.id),
            round: Number(item.workflow_round),
            sequence: Number(item.sequence_no),
            code: String(item.step_code),
            name: String(item.step_name),
            status: String(item.status),
            organization:
              item.organization_id == null
                ? null
                : { id: Number(item.organization_id), name: String(item.organization_name ?? "") },
            department:
              item.department_id == null
                ? null
                : { id: Number(item.department_id), name: String(item.department_name ?? "") },
            actor:
              item.acted_by_employee_id == null
                ? null
                : { id: Number(item.acted_by_employee_id), name: String(item.actor_name ?? "") },
            comment: String(item.decision_comment ?? ""),
            decidedAt: item.decided_at ? String(item.decided_at) : null,
            createdAt: String(item.created_at),
          })),
          validationIssues: validationIssues.results.map((item) => {
            const issueFields = parseArray(item.field_codes_json);
            const hidden = issueFields.some((code) => hiddenFieldCodes.has(String(code)));
            return {
              id: Number(item.id),
              ruleCode: String(item.rule_code),
              severity: String(item.severity),
              fields: issueFields,
              message: String(item.message),
              actual: hidden ? {} : parseObject(item.actual_json),
              expected: hidden ? {} : parseObject(item.expected_json),
              detectedAt: String(item.detected_at),
            };
          }),
          files: visibleFiles.map((item) => ({
            id: Number(item.id),
            fieldCode: item.field_code ? String(item.field_code) : null,
            fileName: String(item.file_name),
            contentType: String(item.content_type ?? ""),
            size: Number(item.size),
            createdAt: String(item.created_at),
            url: `/api/information/files?id=${Number(item.id)}`,
          })),
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const recordConditions = [recordAccess.sql, recordScope.sql];
    const recordBinds: unknown[] = [...recordAccess.binds, ...recordScope.binds];
    if (domainId) {
      recordConditions.push("t.domain_id=?");
      recordBinds.push(domainId);
    }
    if (templateId) {
      recordConditions.push("r.template_id=?");
      recordBinds.push(templateId);
    }
    if (status !== "all") {
      recordConditions.push("r.status=?");
      recordBinds.push(status);
    }
    if (source !== "all") {
      recordConditions.push("r.source_mode=?");
      recordBinds.push(source);
    }
    if (!includeDemo) recordConditions.push("r.is_demo=0");
    if (query.length >= 2) {
      // Without the restricted-information right, sensitive field values are not searchable.
      recordConditions.push(
        canViewSensitive
          ? "(r.title LIKE ? OR EXISTS (SELECT 1 FROM app_information_values search_value WHERE search_value.record_id=r.id AND search_value.value_text LIKE ?))"
          : `(r.title LIKE ? OR EXISTS (SELECT 1 FROM app_information_values search_value WHERE search_value.record_id=r.id AND search_value.value_text LIKE ?
            AND NOT EXISTS (SELECT 1 FROM json_each(t.fields_json) field
              WHERE json_extract(field.value,'$.code')=search_value.field_code AND COALESCE(json_extract(field.value,'$.sensitive'),0) IN (1,'true'))))`,
      );
      recordBinds.push(`%${query}%`, `%${query}%`);
    }
    const pageConditions = [...recordConditions];
    const pageBinds = [...recordBinds];
    // Ids are random, so recency is (created_at, id); the cursor is the last row's id.
    if (cursor) {
      pageConditions.push(`(r.created_at<(SELECT created_at FROM app_information_records WHERE id=?)
        OR (r.created_at=(SELECT created_at FROM app_information_records WHERE id=?) AND r.id<?))`);
      pageBinds.push(cursor, cursor, cursor);
    }
    const [recordRows, totalRow] = includeRecords
      ? await Promise.all([
          db
            .prepare(
              `${RECORD_SELECT} WHERE ${pageConditions.join(" AND ")} ORDER BY r.created_at DESC, r.id DESC LIMIT ?`,
            )
            .bind(...pageBinds, limit + 1)
            .all<Row>(),
          db
            .prepare(
              `SELECT COUNT(*) AS total_count
          FROM app_information_records r
          JOIN app_information_templates t ON t.id=r.template_id AND t.active=1
          JOIN app_information_domains domain ON domain.id=t.domain_id AND domain.active=1
          WHERE ${recordConditions.join(" AND ")}`,
            )
            .bind(...recordBinds)
            .first<Row>(),
        ])
      : ([{ results: [] as Row[] }, null] as const);
    const hasMore = recordRows.results.length > limit;
    const page = recordRows.results.slice(0, limit);
    const totalCount = includeRecords ? Number(totalRow?.total_count ?? 0) : undefined;
    const summary = domains.reduce(
      (total, domain) => ({
        domains: total.domains + 1,
        templates: total.templates + domain.templateCount,
        indicators: total.indicators + domain.indicatorCount,
        records: total.records + domain.recordCount,
        realRecords: total.realRecords + domain.realRecordCount,
        demoRecords: total.demoRecords + domain.demoRecordCount,
        submitted: total.submitted + domain.submittedCount,
        published: total.published + domain.publishedCount,
      }),
      {
        domains: 0,
        templates: 0,
        indicators: 0,
        records: 0,
        realRecords: 0,
        demoRecords: 0,
        submitted: 0,
        published: 0,
      },
    );
    return Response.json(
      {
        capabilities: {
          ...entryCapabilities,
          manage: actor.permissions.canManageInformation,
          editableDomainIds: access.editable,
          reviewableDomainIds: access.reviewable,
        },
        summary: includeCatalog ? summary : undefined,
        domains,
        templates,
        records: page.map((row) => mapRecord(row, canViewSensitive)),
        totalCount,
        nextCursor: hasMore ? Number(page.at(-1)?.id ?? 0) : null,
      },
      {
        headers: {
          "Cache-Control": includeRecords ? "private, no-store" : "private, max-age=60, stale-while-revalidate=300",
          Vary: "Cookie",
        },
      },
    );
  } catch (error) {
    if (/UNIQUE constraint failed: app_information_business_keys/i.test(String(error)))
      return Response.json(
        { error: "Shu tashkilot va davr uchun bunday yozuv allaqachon yuborilgan" },
        { status: 409 },
      );
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    return await createInformationRecord(actor, await readJsonBody(request));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    return await mutateInformationRecord(actor, await readJsonBody(request));
  } catch (error) {
    return apiError(error);
  }
}
