import { getD1 } from "../db";
import { ApiError, type Actor } from "./auth";
import { informationDomainAccess, informationRecordScope } from "./information";
import {
  canContributeResearchProject,
  canCreateResearchProject,
  canReviewResearchProject,
  canUploadResearchFile,
  canVerifyResearchProject,
  canViewResearchProject,
  isReadOnlyCommitteeLeadership,
  type ResearchPolicyContext,
  type ResearchProjectPolicyRow,
} from "./research-policy";
import { SQL_NOW_ISO } from "./sql-time";
import { authorize } from "./policy";
import { researchDomainView } from "./policy/research";
import { isEditableRecordStatus } from "./shared/statuses";

export const RESEARCH_DOMAIN_CODE = "SRC_DIGITALIZATION_INNOVATION";
export const RESEARCH_TEMPLATE_CODE = "SRC_DIGITALIZATION_INNOVATION_RESEARCH_INNOVATION";
export const RESEARCH_INSTITUTE_TAX_ID = "205340218";
export const RESEARCH_OWNER_DEPARTMENT = "Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi";

export const RESEARCH_STAGE_NAMES = [
  "Muammo va texnik topshiriq",
  "Metodika va dastlabki tadqiqot",
  "Laboratoriya yoki dala sinovi",
  "Natijalarni tahlil qilish",
  "Tajriba-sinov va tavsiya",
  "Yakuniy hisobot va joriy etish",
] as const;

export const RESEARCH_STAGE_PROGRESS = [0, 10, 30, 50, 70, 85, 100] as const;

export type ResearchAccessContext = ResearchPolicyContext & {
  domainId: number;
  templateId: number;
  ownerDepartmentName: string;
};

export type ResearchProjectRow = Record<string, unknown> & ResearchProjectPolicyRow & {
  id: number;
  code: string;
  title: string;
  currentStage: number;
  version: number;
};

export function cleanText(value: unknown, max = 4000) {
  return String(value ?? "").normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, max);
}

export function positiveInteger(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export function strictResearchDate(value: unknown) {
  const text = cleanText(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text ? null : text;
}

export function makeResearchCode(prefix = "IT") {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  return `${prefix}-${stamp}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function researchStageDates(startDate: string, endDate: string) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  const span = end - start;
  return RESEARCH_STAGE_NAMES.map((_, index) => {
    const point = new Date(start + (span * (index + 1)) / RESEARCH_STAGE_NAMES.length);
    return point.toISOString().slice(0, 10);
  });
}

export function researchMilestoneStatements(db: D1Database, projectId: number, startDate: string, endDate: string) {
  const dates = researchStageDates(startDate, endDate);
  return RESEARCH_STAGE_NAMES.map((name, index) => db.prepare(
    `INSERT INTO app_research_milestones
      (project_id,stage,name,planned_date,status)
     VALUES (?,?,?,?,?)`,
  ).bind(projectId, index + 1, name, dates[index], index === 0 ? "active" : "pending"));
}

export async function researchAccessContext(actor: Actor, database?: D1Database): Promise<ResearchAccessContext> {
  const db = database ?? await getD1();
  const canonical = await db.prepare(
    `SELECT domain.id AS domain_id,template.id AS template_id,
            COALESCE(domain.owner_department_id,workflow.owner_department_id) AS owner_department_id,
            department.name AS owner_department_name
       FROM app_information_domains domain
       JOIN app_information_templates template ON template.domain_id=domain.id AND template.active=1
       LEFT JOIN app_information_template_workflows workflow ON workflow.template_id=template.id AND workflow.active=1
       LEFT JOIN app_departments department ON department.id=COALESCE(domain.owner_department_id,workflow.owner_department_id)
      WHERE domain.code=? AND domain.active=1 AND template.code=?
      ORDER BY template.version DESC,template.id DESC LIMIT 1`,
  ).bind(RESEARCH_DOMAIN_CODE, RESEARCH_TEMPLATE_CODE).first<Record<string, unknown>>();
  if (!canonical?.domain_id || !canonical?.template_id || !canonical?.owner_department_id) {
    throw new ApiError(503, "Ilmiy tadqiqotlar uchun rasmiy ma’lumot egasi sozlanmagan.");
  }
  const access = await informationDomainAccess(actor, db);
  const domainId = Number(canonical.domain_id);
  return {
    domainId,
    domainVisible: access.visible.includes(domainId),
    templateId: Number(canonical.template_id),
    ownerDepartmentId: Number(canonical.owner_department_id),
    ownerDepartmentName: String(canonical.owner_department_name || RESEARCH_OWNER_DEPARTMENT),
    domainEditable: access.editable.includes(domainId),
    domainReviewable: access.reviewable.includes(domainId),
  };
}

const RESEARCH_EXECUTOR_ELIGIBILITY = `
  JOIN app_roles role ON role.id=employee.role_id AND role.active=1
  JOIN app_information_domains domain ON domain.id=? AND domain.active=1
  JOIN app_user_credentials credential ON credential.employee_id=employee.id
 WHERE employee.active=1 AND employee.organization_id IS NOT NULL
   AND (credential.must_change_password=0 OR credential.temporary_expires_at IS NULL
        OR credential.temporary_expires_at>${SQL_NOW_ISO})
   AND (
     COALESCE(json_extract(role.permissions_json,'$.canEnterInformation'),0)=1
     OR COALESCE(json_extract(role.permissions_json,'$.canSubmitInformation'),0)=1
     OR EXISTS (
       SELECT 1 FROM app_access_profile_assignments access_assignment
       JOIN app_access_profiles profile ON profile.id=access_assignment.access_profile_id AND profile.active=1
      WHERE access_assignment.active=1
        AND (profile.can_enter_information=1 OR profile.can_submit_information=1)
        AND ((access_assignment.principal_type='employee' AND access_assignment.principal_id=employee.id)
          OR (access_assignment.principal_type='staff_position' AND EXISTS (
            SELECT 1 FROM app_position_occupancies occupancy
            JOIN app_staff_positions position ON position.id=occupancy.staff_position_id AND position.active=1
           WHERE occupancy.staff_position_id=access_assignment.principal_id
             AND occupancy.employee_id=employee.id AND occupancy.ends_at IS NULL
             AND position.organization_id=employee.organization_id
          )))
     )
   )
   AND (
     employee.department_id=domain.owner_department_id
     OR EXISTS (
       SELECT 1 FROM app_information_members member
        WHERE member.domain_id=domain.id AND member.employee_id=employee.id
          AND member.member_role='editor' AND member.active=1
     )
     OR EXISTS (
       SELECT 1 FROM app_information_domain_assignments domain_assignment
        WHERE domain_assignment.domain_id=domain.id AND domain_assignment.member_role='editor'
          AND domain_assignment.active=1
          AND ((domain_assignment.principal_type='employee' AND domain_assignment.principal_id=employee.id)
            OR (domain_assignment.principal_type='staff_position' AND EXISTS (
              SELECT 1 FROM app_position_occupancies occupancy
              JOIN app_staff_positions position ON position.id=occupancy.staff_position_id AND position.active=1
             WHERE occupancy.staff_position_id=domain_assignment.principal_id
               AND occupancy.employee_id=employee.id AND occupancy.ends_at IS NULL
               AND position.organization_id=employee.organization_id
            )))
     )
   )`;

export async function eligibleResearchEmployee(
  db: D1Database,
  domainId: number,
  employeeId: number,
  organizationId: number,
) {
  return db.prepare(
    `SELECT employee.id,employee.full_name,employee.position,employee.organization_id
       FROM app_employees employee
       ${RESEARCH_EXECUTOR_ELIGIBILITY}
      AND employee.id=? AND employee.organization_id=? LIMIT 1`,
  ).bind(domainId, employeeId, organizationId).first<{
    id: number; full_name: string; position: string; organization_id: number;
  }>();
}

export async function researchExecutorDirectory(db: D1Database, domainId: number) {
  const rows = await db.prepare(
    `SELECT employee.id,employee.full_name,employee.position,employee.organization_id,
            organization.name AS organization_name,organization.short_name,
            organization.tax_id,organization.type AS organization_type
       FROM app_employees employee
       JOIN app_organizations organization ON organization.id=employee.organization_id AND organization.active=1
       ${RESEARCH_EXECUTOR_ELIGIBILITY}
      ORDER BY CASE WHEN organization.tax_id=? THEN 0 ELSE 1 END,
               organization.name,employee.full_name`,
  ).bind(domainId, RESEARCH_INSTITUTE_TAX_ID).all<Record<string, unknown>>();
  const organizations = new Map<number, Record<string, unknown>>();
  for (const row of rows.results) {
    const id = Number(row.organization_id);
    if (!organizations.has(id)) organizations.set(id, {
      id,
      name: String(row.organization_name),
      shortName: String(row.short_name || row.organization_name),
      taxId: String(row.tax_id || ""),
      type: String(row.organization_type || ""),
    });
  }
  return {
    organizations: [...organizations.values()],
    employees: rows.results.map((row) => ({
      id: Number(row.id), name: String(row.full_name), position: String(row.position || ""),
      organizationId: Number(row.organization_id),
    })),
  };
}

function policyRow(row: Record<string, unknown>): ResearchProjectPolicyRow {
  return {
    executorOrganizationId: Number(row.executorOrganizationId ?? row.executor_organization_id),
    responsibleEmployeeId: Number(row.responsibleEmployeeId ?? row.responsible_employee_id),
    coordinatorDepartmentId: Number(row.coordinatorDepartmentId ?? row.coordinator_department_id),
    createdByEmployeeId: Number(row.createdByEmployeeId ?? row.created_by_employee_id),
    status: String(row.status),
  };
}

export async function researchProjectById(db: D1Database, id: number): Promise<ResearchProjectRow | null> {
  const row = await db.prepare(
    `SELECT project.*,
            project.executor_organization_id AS executorOrganizationId,
            project.responsible_employee_id AS responsibleEmployeeId,
            project.coordinator_department_id AS coordinatorDepartmentId,
            project.created_by_employee_id AS createdByEmployeeId,
            project.current_stage AS currentStage,
            organization.name AS organization,
            organization.tax_id AS organizationTaxId,
            responsible.full_name AS leader,
            coordinator.name AS coordinator,
            creator.full_name AS createdBy
       FROM app_research_projects project
       JOIN app_organizations organization ON organization.id=project.executor_organization_id
       JOIN app_employees responsible ON responsible.id=project.responsible_employee_id
       JOIN app_departments coordinator ON coordinator.id=project.coordinator_department_id
       JOIN app_employees creator ON creator.id=project.created_by_employee_id
      WHERE project.id=? LIMIT 1`,
  ).bind(id).first<Record<string, unknown>>();
  if (!row) return null;
  return Object.assign(row, policyRow(row), {
    id: Number(row.id),
    code: String(row.code),
    title: String(row.title),
    currentStage: Number(row.currentStage),
    version: Number(row.version),
  });
}

function projectCapabilities(actor: Actor, row: ResearchProjectRow, context: ResearchAccessContext) {
  const project = policyRow(row);
  const owner = canCreateResearchProject(actor, context);
  const reviewer = canReviewResearchProject(actor, context);
  const contributor = canContributeResearchProject(actor, project, context);
  const verifier = canVerifyResearchProject(actor, project, context);
  const submittedBy = Number(row.currentSubmittedByEmployeeId ?? 0);
  const verifiedBy = Number(row.currentVerifiedByEmployeeId ?? 0);
  return {
    edit: owner && isEditableRecordStatus(project.status),
    activate: owner && project.status === "draft",
    contribute: contributor && ["active", "returned"].includes(project.status),
    verify: verifier && project.status === "institute_review" && actor.id !== submittedBy,
    review: reviewer
      && project.status === "committee_review"
      && ![project.createdByEmployeeId, submittedBy, verifiedBy].includes(actor.id),
    implement: reviewer && project.status === "completed",
    archive: owner && ["draft", "returned", "completed", "implementation"].includes(project.status),
    upload: canUploadResearchFile(actor, project, context),
  };
}

function parsePayload(value: unknown) {
  try {
    const parsed = JSON.parse(String(value ?? "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function actorRoleLabel(actor: Actor, context: ResearchAccessContext) {
  if (canCreateResearchProject(actor, context) || canReviewResearchProject(actor, context)) return "committee";
  if (isReadOnlyCommitteeLeadership(actor)) return "leadership";
  return "institute";
}

/** Latest events returned per project; older ones are paged per project. */
export const RESEARCH_EVENTS_PER_PROJECT = 20;
const RESEARCH_EVENTS_PAGE = 50;

export type ResearchDashboardOptions = {
  /** Page older events of one project (ids strictly below `eventsBefore`). */
  eventsProjectId?: number | null;
  eventsBefore?: number | null;
};

export async function getResearchDashboard(actor: Actor, database?: D1Database, options: ResearchDashboardOptions = {}) {
  const db = database ?? await getD1();
  const context = await researchAccessContext(actor, db);
  await authorize(researchDomainView(context));
  const catalogScope = informationRecordScope(actor, "record");
  const rows = await db.prepare(
    `SELECT project.*,
            project.executor_organization_id AS executorOrganizationId,
            project.responsible_employee_id AS responsibleEmployeeId,
            project.coordinator_department_id AS coordinatorDepartmentId,
            project.created_by_employee_id AS createdByEmployeeId,
            project.current_stage AS currentStage,
            project.source_intake_id AS sourceIntakeId,
            organization.name AS organization,
            organization.tax_id AS organizationTaxId,
            responsible.full_name AS leader,
            coordinator.name AS coordinator,
            creator.full_name AS createdBy,
            current_milestone.submitted_by_employee_id AS currentSubmittedByEmployeeId,
            current_milestone.verified_by_employee_id AS currentVerifiedByEmployeeId
       FROM app_research_projects project
       JOIN app_organizations organization ON organization.id=project.executor_organization_id
       JOIN app_employees responsible ON responsible.id=project.responsible_employee_id
       JOIN app_departments coordinator ON coordinator.id=project.coordinator_department_id
       JOIN app_employees creator ON creator.id=project.created_by_employee_id
       LEFT JOIN app_research_milestones current_milestone
         ON current_milestone.project_id=project.id AND current_milestone.stage=project.current_stage
      ORDER BY CASE project.status WHEN 'committee_review' THEN 0 WHEN 'institute_review' THEN 1 WHEN 'active' THEN 2 ELSE 3 END,
               project.updated_at DESC,project.id DESC`,
  ).all<Record<string, unknown>>();
  const visibleRows = rows.results
    .map((row) => Object.assign(row, policyRow(row), {
      id: Number(row.id), code: String(row.code), title: String(row.title),
      currentStage: Number(row.currentStage), version: Number(row.version),
    }) as ResearchProjectRow)
    .filter((row) => canViewResearchProject(actor, policyRow(row), context));
  const projectIds = new Set(visibleRows.map((row) => row.id));
  const visibleIdsJson = JSON.stringify([...projectIds]);
  const eventsPage = options.eventsProjectId && projectIds.has(options.eventsProjectId)
    ? { projectId: options.eventsProjectId, before: options.eventsBefore ?? Number.MAX_SAFE_INTEGER }
    : null;
  const canCreate = canCreateResearchProject(actor, context);
  const canReview = canReviewResearchProject(actor, context);
  const fullIntakeAccess = canCreate || canReview || isReadOnlyCommitteeLeadership(actor);

  const [milestoneRows, fileRows, eventRows, intakeRows, executorDirectory, sourceOrganizations, catalogRows] = await Promise.all([
    // Child rows are read only for projects this actor may see (json_each keeps it one statement).
    db.prepare(
      `SELECT * FROM app_research_milestones
        WHERE project_id IN (SELECT value FROM json_each(?))
        ORDER BY project_id,stage`,
    ).bind(visibleIdsJson).all<Record<string, unknown>>(),
    db.prepare(
      `SELECT file.*,employee.full_name AS uploaded_by
         FROM app_research_files file
         JOIN app_employees employee ON employee.id=file.uploaded_by_employee_id
        WHERE file.project_id IN (SELECT value FROM json_each(?))
        ORDER BY file.id DESC`,
    ).bind(visibleIdsJson).all<Record<string, unknown>>(),
    eventsPage
      ? db.prepare(
        `SELECT log.*,employee.full_name AS actor_name,0 AS event_rank
           FROM app_audit_logs log
           LEFT JOIN app_employees employee ON employee.id=log.actor_employee_id
          WHERE log.entity_type='research_project' AND log.entity_id=? AND log.id<?
          ORDER BY log.id DESC LIMIT ?`,
      ).bind(eventsPage.projectId, eventsPage.before, RESEARCH_EVENTS_PAGE + 1).all<Record<string, unknown>>()
      : db.prepare(
        `SELECT * FROM (
           SELECT log.*,employee.full_name AS actor_name,
                  ROW_NUMBER() OVER (PARTITION BY log.entity_id ORDER BY log.id DESC) AS event_rank
             FROM app_audit_logs log
             LEFT JOIN app_employees employee ON employee.id=log.actor_employee_id
            WHERE log.entity_type='research_project'
              AND log.entity_id IN (SELECT value FROM json_each(?))
         ) WHERE event_rank<=?
         ORDER BY id DESC`,
      ).bind(visibleIdsJson, RESEARCH_EVENTS_PER_PROJECT + 1).all<Record<string, unknown>>(),
    db.prepare(
      `SELECT item.*,organization.name AS source_organization,employee.full_name AS source_employee,
              (SELECT COUNT(*) FROM app_research_intake_items proposal
                WHERE proposal.kind='proposal' AND proposal.parent_id=item.id
                  AND proposal.status IN ('submitted','selected','converted')) AS proposal_count
         FROM app_research_intake_items item
         LEFT JOIN app_organizations organization ON organization.id=item.source_organization_id
         LEFT JOIN app_employees employee ON employee.id=item.source_employee_id
        WHERE item.kind='problem' OR ?=1
           OR (item.kind='proposal' AND item.source_employee_id=?)
        ORDER BY item.created_at DESC,item.id DESC`,
    ).bind(fullIntakeAccess ? 1 : 0, actor.id).all<Record<string, unknown>>(),
    (canCreate || canReview) ? researchExecutorDirectory(db, context.domainId) : Promise.resolve({ organizations: [], employees: [] }),
    db.prepare(
      `SELECT organization.id,organization.name,organization.short_name,organization.tax_id,organization.type
         FROM app_organizations organization
        WHERE organization.active=1 AND ?=1
        ORDER BY organization.name`,
    ).bind(canCreate ? 1 : 0).all<Record<string, unknown>>(),
    db.prepare(
      `SELECT record.id,record.title,record.period_start,record.period_end,record.status,
              record.values_json,record.published_at,record.updated_at
         FROM app_information_records record
         JOIN app_information_templates template ON template.id=record.template_id
        WHERE template.id=? AND record.status='published' AND record.is_demo=0 AND ${catalogScope.sql}
        ORDER BY COALESCE(record.published_at,record.updated_at) DESC,record.id DESC LIMIT 200`,
    ).bind(context.templateId, ...catalogScope.binds).all<Record<string, unknown>>(),
  ]);

  const projects = visibleRows.map((row) => ({
    id: row.id,
    code: String(row.code),
    title: String(row.title),
    kind: String(row.kind),
    area: String(row.area),
    executorOrganizationId: Number(row.executorOrganizationId),
    responsibleEmployeeId: Number(row.responsibleEmployeeId),
    organization: String(row.organization),
    leader: String(row.leader),
    coordinator: String(row.coordinator),
    problem: String(row.problem),
    objective: String(row.objective),
    novelty: String(row.novelty ?? ""),
    expectedResult: String(row.expected_result),
    startDate: String(row.start_date),
    endDate: String(row.end_date),
    budget: Number(row.budget),
    spent: Number(row.spent),
    status: String(row.status),
    stage: Number(row.currentStage),
    progress: Number(row.progress),
    origin: String(row.origin),
    sourceId: row.sourceIntakeId == null ? null : Number(row.sourceIntakeId),
    createdBy: String(row.createdBy),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    version: Number(row.version),
    capabilities: projectCapabilities(actor, row, context),
  }));

  const intake: Array<Record<string, unknown> & { payload: Record<string, unknown> }> = intakeRows.results
    .map((row) => ({ ...row, payload: parsePayload(row.payload_json) }));
  const problems = intake.filter((row) => row.kind === "problem").map((row) => ({
    id: Number(row.id), code: String(row.code), title: String(row.title), area: String(row.area),
    sourceOrganization: String(row.source_organization || row.payload.sourceOrganization || "—"),
    description: String(row.summary), expectedResult: String(row.payload.expectedResult || ""),
    deadline: String(row.payload.deadline || ""), priority: String(row.payload.priority || "medium"),
    status: String(row.status),
    proposalCount: Number(row.proposal_count || 0),
  }));
  const proposals = intake.filter((row) => row.kind === "proposal").map((row) => ({
    id: Number(row.id), problemId: Number(row.parent_id), applicant: String(row.source_employee || row.payload.applicant || "—"),
    organization: String(row.source_organization || row.payload.organization || "—"), solutionTitle: String(row.title),
    summary: String(row.summary), expectedEffect: String(row.payload.expectedEffect || ""), status: String(row.status),
    submittedAt: String(row.created_at),
  }));
  const topics = intake.filter((row) => row.kind === "topic").map((row) => ({
    id: Number(row.id), title: String(row.title), area: String(row.area),
    sourceOrganization: String(row.source_organization || row.payload.sourceOrganization || "—"),
    priority: String(row.payload.priority || "medium"), rationale: String(row.summary), status: String(row.status),
    selectedProjectId: row.converted_project_id == null ? null : Number(row.converted_project_id),
  }));
  const foreignProjects = intake.filter((row) => row.kind === "foreign").map((row) => ({
    id: Number(row.id), title: String(row.title), country: String(row.payload.country || "—"), area: String(row.area),
    impact: String(row.payload.impact || row.summary), adaptation: String(row.payload.adaptation || ""),
    readiness: Number(row.payload.readiness || 0), status: String(row.status),
    pilotProjectId: row.converted_project_id == null ? null : Number(row.converted_project_id),
  }));

  return {
    role: actorRoleLabel(actor, context),
    capabilities: {
      createProject: canCreate,
      selectIntake: canReview,
      manageIntake: canCreate,
      submitProposal: Boolean(actor.organizationId)
        && !isReadOnlyCommitteeLeadership(actor)
        && context.domainEditable
        && (actor.permissions.canEnterInformation || actor.permissions.canSubmitInformation),
      viewOnly: isReadOnlyCommitteeLeadership(actor),
    },
    projects,
    milestones: milestoneRows.results.filter((row) => projectIds.has(Number(row.project_id))).map((row) => ({
      id: Number(row.id), projectId: Number(row.project_id), stage: Number(row.stage), name: String(row.name),
      plannedDate: String(row.planned_date), actualDate: row.actual_date ? String(row.actual_date) : null,
      status: String(row.status), resultSummary: String(row.result_summary), kpiValue: String(row.kpi_value),
      expenditure: Number(row.expenditure), reviewerComment: String(row.reviewer_comment), version: Number(row.version),
    })),
    events: eventRows.results.filter((row, index) => projectIds.has(Number(row.entity_id)) && (eventsPage
      ? index < RESEARCH_EVENTS_PAGE
      : Number(row.event_rank) <= RESEARCH_EVENTS_PER_PROJECT)).map((row) => {
      const detail = parsePayload(row.detail_json);
      return {
        id: Number(row.id), projectId: Number(row.entity_id), eventType: String(detail.eventType || row.action),
        fromStatus: String(detail.fromStatus || ""), toStatus: String(detail.toStatus || ""),
        actorRole: String(detail.actorRole || "xodim"), actorName: String(row.actor_name || "Tizim"),
        comment: String(detail.comment || row.action), createdAt: String(row.created_at),
      };
    }),
    /** Project ids with older events available via `eventsProjectId`/`eventsBefore`. */
    eventsHasMore: eventsPage
      ? (eventRows.results.length > RESEARCH_EVENTS_PAGE ? [eventsPage.projectId] : [])
      : [...new Set(eventRows.results
        .filter((row) => Number(row.event_rank) > RESEARCH_EVENTS_PER_PROJECT)
        .map((row) => Number(row.entity_id)))],
    problems,
    proposals,
    topics,
    foreignProjects,
    attachments: fileRows.results.filter((row) => projectIds.has(Number(row.project_id))).map((row) => ({
      id: Number(row.id), projectId: Number(row.project_id), milestoneId: row.milestone_id == null ? null : Number(row.milestone_id),
      purpose: String(row.purpose), fileName: String(row.file_name), contentType: String(row.content_type),
      sizeBytes: Number(row.size), uploadedBy: String(row.uploaded_by), createdAt: String(row.created_at),
    })),
    catalog: catalogRows.results.map((row) => ({
      id: Number(row.id), title: String(row.title), status: String(row.status),
      periodStart: row.period_start ? String(row.period_start) : null,
      periodEnd: row.period_end ? String(row.period_end) : null,
      values: parsePayload(row.values_json),
      publishedAt: row.published_at ? String(row.published_at) : null,
      updatedAt: String(row.updated_at),
    })),
    directory: {
      organizations: executorDirectory.organizations,
      sourceOrganizations: sourceOrganizations.results.map((row) => ({
        id: Number(row.id), name: String(row.name), shortName: String(row.short_name || row.name),
        taxId: String(row.tax_id || ""), type: String(row.type),
      })),
      employees: executorDirectory.employees,
      coordinator: { id: context.ownerDepartmentId, name: context.ownerDepartmentName },
    },
    stages: [...RESEARCH_STAGE_NAMES],
    generatedAt: new Date().toISOString(),
  };
}
