// Shapes the administrator modals receive from the dashboard shell.

export type AdminModalOrganization = {
  id: number;
  name: string;
  shortName: string;
  type: string;
  parentId: number | null;
  regionCode: string | null;
  active: boolean;
};

export type AdminModalDepartment = {
  id: number;
  name: string;
  organizationId: number | null;
  organization: string;
  parentId: number | null;
  active: boolean;
};

export type AdminModalEmployee = {
  id: number;
  name: string;
  email: string;
  position: string;
  birthDate: string | null;
  internalExtension: string | null;
  mobilePhone: string | null;
  departmentId: number | null;
  department: string;
  organizationId: number | null;
  organization: string;
  managerId: number | null;
  roleId: number;
  roleName: string;
  username: string | null;
  loginConfigured: boolean;
  telegramLinked: boolean;
  telegramUsername: string | null;
  active: boolean;
};

export type AdminPermissionSet = {
  viewScope: string;
  assignScope: string;
  informationScope?: string;
  canEnterInformation?: boolean;
  canSubmitInformation?: boolean;
  canVerifyInformation?: boolean;
  canApproveInformation?: boolean;
  canCreateTask: boolean;
  canCreateMeeting: boolean;
  canExport: boolean;
  canManageOrganization: boolean;
  canManageRoles: boolean;
  canConfigure: boolean;
  canViewAudit: boolean;
  canUpdateAnyTask: boolean;
  canManageReports: boolean;
  canManageInformation: boolean;
  canViewRestrictedInformation: boolean;
};

export type AdminModalRole = {
  id: number;
  code: string;
  name: string;
  level: number;
  permissions: AdminPermissionSet;
  isSystem: boolean;
  active: boolean;
};

export type AdminModalTopic = {
  id: number;
  name: string;
  description: string;
  color: string;
  active: boolean;
};

export type TelegramLinkModalState = {
  type: "telegram-link";
  employee: AdminModalEmployee;
  link?: { token: string; url: string | null; expiresAt: string };
};
