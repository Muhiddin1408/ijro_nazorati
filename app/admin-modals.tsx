"use client";

/**
 * Administrator CRUD modals. The implementations live in
 * app/_components/admin/modals/; this entry point keeps existing imports working.
 */

export type {
  AdminModalOrganization,
  AdminModalDepartment,
  AdminModalEmployee,
  AdminPermissionSet,
  AdminModalRole,
  AdminModalTopic,
  TelegramLinkModalState,
} from "./_components/admin/modals/admin-modal-types";
export { EmployeeModal } from "./_components/admin/modals/employee-modal";
export { RoleModal } from "./_components/admin/modals/role-modal";
export { DepartmentModal } from "./_components/admin/modals/department-modal";
export { OrganizationModal } from "./_components/admin/modals/organization-modal";
export { TelegramLinkModal, TopicModal } from "./_components/admin/modals/small-modals";
