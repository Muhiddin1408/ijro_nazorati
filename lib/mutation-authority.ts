import type { Actor } from "./auth";

type MutationActor = Pick<Actor, "id" | "departmentId" | "permissions">;

/** Read-all is deliberately excluded from every mutation decision here. */
export function canAdministerAnyReport(actor: MutationActor) {
  return actor.permissions.canManageRoles && actor.permissions.canManageReports;
}

export function canSubmitOrDelegateReport(actor: MutationActor, responsibleEmployeeId: number) {
  return actor.id === responsibleEmployeeId || canAdministerAnyReport(actor);
}

export function canDelegateReportStatus(status: string) {
  return status === "new" || status === "draft" || status === "collecting" || status === "returned";
}

export function canReviewReport(actor: MutationActor, context: {
  templateCreatorEmployeeId: number;
  ownerDepartmentId: number | null;
  parentResponsibleEmployeeId: number | null;
  /** The reviewer may never be the person who is responsible for or submitted the report. */
  responsibleEmployeeId: number | null;
  submittedByEmployeeId: number | null;
}) {
  if (actor.id === context.responsibleEmployeeId || actor.id === context.submittedByEmployeeId) return false;
  return actor.id === context.templateCreatorEmployeeId
    || actor.id === context.parentResponsibleEmployeeId
    || (actor.permissions.canManageReports
      && actor.departmentId != null
      && actor.departmentId === context.ownerDepartmentId);
}

export function canManageReportTemplateFile(actor: MutationActor, context: {
  templateCreatorEmployeeId: number;
  ownerDepartmentId: number | null;
}) {
  return actor.id === context.templateCreatorEmployeeId
    || canAdministerAnyReport(actor)
    || (actor.permissions.canManageReports
      && actor.departmentId != null
      && actor.departmentId === context.ownerDepartmentId);
}

export function canMutateMeeting(actor: Pick<Actor, "id" | "permissions">, organizerEmployeeId: number) {
  return actor.id === organizerEmployeeId || actor.permissions.canManageRoles;
}

export function canUploadInformationFile(actor: MutationActor, domainEditable: boolean) {
  return actor.permissions.canEnterInformation && domainEditable;
}

export function canDeleteInformationFile(actor: MutationActor, context: {
  domainEditable: boolean;
  uploadedByEmployeeId: number;
}) {
  if (!canUploadInformationFile(actor, context.domainEditable)) return false;
  const explicitAdministrator = actor.permissions.canManageInformation && actor.permissions.canManageRoles;
  return explicitAdministrator || actor.id === context.uploadedByEmployeeId;
}
