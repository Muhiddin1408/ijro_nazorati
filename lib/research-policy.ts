import type { Actor } from "./auth";

export type ResearchProjectPolicyRow = {
  executorOrganizationId: number;
  responsibleEmployeeId: number;
  coordinatorDepartmentId: number;
  createdByEmployeeId: number;
  status: string;
};

export type ResearchPolicyContext = {
  domainVisible?: boolean;
  ownerDepartmentId: number;
  domainEditable: boolean;
  domainReviewable: boolean;
};

export function isExplicitResearchAdmin(actor: Actor) {
  return actor.roleCode === "admin"
    && actor.permissions.canManageRoles
    && actor.permissions.canManageReports
    && actor.permissions.canManageInformation;
}

export function isReadOnlyCommitteeLeadership(actor: Actor) {
  return ["rahbar", "orinbosar"].includes(actor.roleCode) && !isExplicitResearchAdmin(actor);
}

export function canCreateResearchProject(actor: Actor, context: ResearchPolicyContext) {
  if (isReadOnlyCommitteeLeadership(actor)) return false;
  return isExplicitResearchAdmin(actor)
    || (actor.departmentId === context.ownerDepartmentId
      && context.domainEditable
      && (actor.permissions.canEnterInformation || actor.permissions.canSubmitInformation));
}

export function canReviewResearchProject(actor: Actor, context: ResearchPolicyContext) {
  if (isReadOnlyCommitteeLeadership(actor)) return false;
  return isExplicitResearchAdmin(actor)
    || (actor.departmentId === context.ownerDepartmentId
      && context.domainReviewable
      && (actor.permissions.canVerifyInformation || actor.permissions.canApproveInformation));
}

export function canContributeResearchProject(
  actor: Actor,
  project: ResearchProjectPolicyRow,
  context?: ResearchPolicyContext,
) {
  if (isReadOnlyCommitteeLeadership(actor)) return false;
  if (isExplicitResearchAdmin(actor)) return true;
  return actor.organizationId === project.executorOrganizationId
    && actor.id === project.responsibleEmployeeId
    && (context == null || context.domainEditable)
    && (actor.permissions.canEnterInformation || actor.permissions.canSubmitInformation);
}

export function canVerifyResearchProject(
  actor: Actor,
  project: ResearchProjectPolicyRow,
  context?: ResearchPolicyContext,
) {
  if (isReadOnlyCommitteeLeadership(actor) || isExplicitResearchAdmin(actor)) {
    return isExplicitResearchAdmin(actor);
  }
  return actor.organizationId === project.executorOrganizationId
    && actor.id !== project.responsibleEmployeeId
    && (context == null || context.domainReviewable)
    && (actor.permissions.canVerifyInformation || actor.permissions.canApproveInformation);
}

export function canViewResearchProject(
  actor: Actor,
  project: ResearchProjectPolicyRow,
  context: ResearchPolicyContext,
) {
  if (context.domainVisible === false) return false;
  if (isExplicitResearchAdmin(actor) || isReadOnlyCommitteeLeadership(actor)) return true;
  if (project.status === "institute_review" && canVerifyResearchProject(actor, project, context)) return true;
  if (actor.id === project.createdByEmployeeId || actor.id === project.responsibleEmployeeId) return true;
  return actor.departmentId === project.coordinatorDepartmentId
    && (context.domainEditable || context.domainReviewable);
}

export function canUploadResearchFile(
  actor: Actor,
  project: ResearchProjectPolicyRow,
  context: ResearchPolicyContext,
) {
  if (project.status === "draft") return canCreateResearchProject(actor, context);
  if (project.status === "active") return canContributeResearchProject(actor, project, context);
  if (project.status === "returned") {
    return canCreateResearchProject(actor, context) || canContributeResearchProject(actor, project, context);
  }
  return false;
}
