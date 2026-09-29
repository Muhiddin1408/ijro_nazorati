/** Audit statements written atomically with research mutations (version/status guarded). */
import type { Actor } from "../../lib/auth";
import { type ResearchAccessContext } from "../../lib/research-server";
import { type JsonRecord, actorRoleLabel } from "./common";

export function projectAuditDetail(
  actor: Actor,
  context: ResearchAccessContext,
  eventType: string,
  detail: JsonRecord,
) {
  return JSON.stringify({
    eventType,
    actorRole: actorRoleLabel(actor, context),
    ...detail,
  });
}

export function projectAuditById(
  db: D1Database,
  actor: Actor,
  context: ResearchAccessContext,
  eventType: string,
  projectId: number,
  expectedVersion: number,
  expectedStatus: string,
  detail: JsonRecord,
) {
  return db.prepare(
    `INSERT INTO app_audit_logs
      (actor_employee_id,action,entity_type,entity_id,detail_json)
     SELECT ?,?,'research_project',project.id,?
       FROM app_research_projects project
      WHERE project.id=? AND project.version=? AND project.status=?
        AND project.updated_by_employee_id=?`,
  ).bind(
    actor.id,
    `research.${eventType}`,
    projectAuditDetail(actor, context, eventType, detail),
    projectId,
    expectedVersion,
    expectedStatus,
    actor.id,
  );
}

export function projectAuditByCode(
  db: D1Database,
  actor: Actor,
  context: ResearchAccessContext,
  eventType: string,
  projectCode: string,
  expectedVersion: number,
  expectedStatus: string,
  detail: JsonRecord,
) {
  return db.prepare(
    `INSERT INTO app_audit_logs
      (actor_employee_id,action,entity_type,entity_id,detail_json)
     SELECT ?,?,'research_project',project.id,?
       FROM app_research_projects project
      WHERE project.code=? AND project.version=? AND project.status=?
        AND project.updated_by_employee_id=?
        AND (SELECT COUNT(*) FROM app_research_milestones milestone
              WHERE milestone.project_id=project.id)=6`,
  ).bind(
    actor.id,
    `research.${eventType}`,
    projectAuditDetail(actor, context, eventType, detail),
    projectCode,
    expectedVersion,
    expectedStatus,
    actor.id,
  );
}

export function intakeAuditByCode(
  db: D1Database,
  actor: Actor,
  action: string,
  intakeCode: string,
  expectedKind: string,
  expectedStatus: string,
  expectedVersion: number,
  detail: JsonRecord = {},
) {
  return db.prepare(
    `INSERT INTO app_audit_logs
      (actor_employee_id,action,entity_type,entity_id,detail_json)
     SELECT ?,?,'research_intake',item.id,?
       FROM app_research_intake_items item
      WHERE item.code=? AND item.kind=? AND item.status=? AND item.version=?
        AND item.updated_by_employee_id=?`,
  ).bind(
    actor.id,
    `research.${action}`,
    JSON.stringify(detail),
    intakeCode,
    expectedKind,
    expectedStatus,
    expectedVersion,
    actor.id,
  );
}
