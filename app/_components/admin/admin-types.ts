export type AdminOrganization = {
  id: number;
  name: string;
  shortName: string;
  type: string;
  parentId: number | null;
  regionCode: string | null;
  taxId?: string | null;
  dataStatus?: string;
  hierarchyVerified?: boolean;
  active: boolean;
};

export type AdminDepartment = {
  id: number;
  name: string;
  organizationId: number | null;
  organization: string;
  parentId: number | null;
  active: boolean;
};

export type AdminEmployee = {
  id: number;
  name: string;
  email: string;
  position: string;
  fullNameCyrillic: string | null;
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
  active: boolean;
  telegramLinked: boolean;
  telegramUsername: string | null;
  username: string | null;
  loginConfigured: boolean;
};

export type AdminRole = {
  id: number;
  code: string;
  name: string;
  level: number;
  permissions: {
    viewScope: string;
    assignScope: string;
    canManageOrganization: boolean;
    canManageRoles: boolean;
    canConfigure: boolean;
    canEnterInformation?: boolean;
    canVerifyInformation?: boolean;
    canApproveInformation?: boolean;
  };
  isSystem: boolean;
  active: boolean;
};

export type AdminTopic = { id: number; name: string; description: string; color: string; active: boolean };
export type AdminIntegration = { id: number; code: string; name: string; category: string; enabled: boolean };
export type AdminActor = { username: string | null };
export type TelegramStatus = {
  configured: boolean;
  botUsername: string | null;
  linkedEmployees: number;
  pendingJobs: number;
};

export type AccessProfile = {
  code: string;
  name: string;
  organizationType: string;
  viewScope: string;
  informationScope: string;
  canEnter: boolean;
  canSubmit: boolean;
  canVerify: boolean;
  canApprove: boolean;
  canViewAll: boolean;
};
export type AccessProfilesPayload = { profiles: AccessProfile[]; assignments: Array<Record<string, unknown>> };
type InformationAccessDomain = { id: number; code: string; name: string; visibility: string };
type InformationAccessPrincipal = {
  principalType: "staff_position" | "employee";
  principalId: number;
  name: string;
  organizationId: number;
  organization: string;
  department: string;
  position: string;
  occupied: boolean;
  provisional: boolean;
};
export type InformationAccessGrant = {
  id: number;
  principalType: "staff_position" | "employee";
  principalId: number;
  domainId: number;
  domainName: string;
  memberRole: "editor" | "reviewer";
  grantSource: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
export type InformationAccessPayload = {
  domains: InformationAccessDomain[];
  principals: InformationAccessPrincipal[];
  grants: InformationAccessGrant[];
  nextCursor?: number | null;
};

export type ProvisioningRequest = {
  kind: "employees" | "vacancies";
  employeeIds?: number[];
  staffPositionIds?: number[];
  organizationId?: number;
  includeDescendants?: boolean;
  reissue?: boolean;
};

export type ProvisioningResult = {
  accounts: Array<{
    accountKind: "employee" | "vacant_position";
    employeeId: number | null;
    staffPositionId: number | null;
    slotNumber: number | null;
    fullName: string;
    organization: string;
    department: string;
    position: string;
    username: string;
    temporaryPassword: string;
    roleCode: string;
    roleName: string;
    accessProfileCode: string;
    accessProfileName: string;
    canLogin: boolean;
    mustChangePassword: true;
  }>;
  skipped: Array<{ targetId: number; reason: string }>;
  profiles: AccessProfile[];
  generatedAt: string;
  cancelled?: boolean;
  failure?: string;
};

export type RequestProvisioning = (
  body: ProvisioningRequest,
  options?: { onProgress?: (created: number, skipped: number) => void; shouldContinue?: () => boolean },
) => Promise<ProvisioningResult>;

export type DownloadProvisioningWorkbook = (result: ProvisioningResult) => Promise<void>;

export type StaffSummaryPayload = {
  summary: {
    organizations: number;
    departments: number;
    positionRows: number;
    staffUnits: number;
    employees: number;
    accounts: number;
    vacantRows: number;
  };
  regions: Array<{ id: string; organizations: number; employees: number; staffUnits: number }>;
  coverage?: {
    totalOrganizations: number;
    coveredOrganizations: number;
    officialCoveredOrganizations: number;
    missingOrganizations: number;
    missingOfficialSchedules: number;
    operationalReadyOrganizations: number;
    missingOperationalAccess: number;
    provisionalOrganizations: number;
    totalPositionRows: number;
    headcountUnits: number;
    credentialSlots: number;
    occupiedSlots: number;
    vacantSlots: number;
    activeEmployees: number;
    overAllocatedPositions: number;
    provisionalCredentialSlots: number;
    byOrganizationType: Array<{
      type: string;
      organizations: number;
      coveredOrganizations: number;
      operationalReadyOrganizations: number;
      positionRows: number;
      credentialSlots: number;
      occupiedSlots: number;
    }>;
  };
};
export type StaffDetailPayload = {
  organization: {
    id: number;
    name: string;
    shortName: string;
    type: string;
    parentId: number | null;
    regionCode: string | null;
    taxId: string | null;
    dataStatus: string;
    hierarchyVerified: boolean;
  };
  departments: Array<{
    id: number;
    name: string;
    parentId: number | null;
    staffUnits: number;
    positionRows: number;
    employees: number;
  }>;
  positions: Array<{
    id: number;
    departmentId: number | null;
    department: string;
    subunit: string;
    title: string;
    category: string;
    status: string;
    headcountUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    fteRate: number;
    grade: string;
    effectiveFrom: string | null;
    documentType: string;
    sourceFile: string;
    dataStatus: string;
    roles: Array<{ departmentId: number; department: string; roleType: string; note: string }>;
    occupancies: Array<{
      id: number;
      name: string;
      position: string;
      fteRate: number;
      internalExtension?: string | null;
      mobilePhone?: string | null;
      loginConfigured?: boolean;
    }>;
    employee: {
      id: number;
      name: string;
      position: string;
      fteRate: number;
      internalExtension?: string | null;
      mobilePhone?: string | null;
      loginConfigured?: boolean;
    } | null;
  }>;
  nextCursor: number | null;
};
