import type {
  ClientActor,
  ClientEmployee,
  ClientMeeting,
  ClientPermissionSet,
  ClientTask,
} from "../../../lib/shared/types";

export type Identity = { name: string; email: string };
type PermissionSet = ClientPermissionSet;
export type Actor = ClientActor;
export type Employee = ClientEmployee;
export type Role = {
  id: number;
  code: string;
  name: string;
  level: number;
  permissions: PermissionSet;
  isSystem: boolean;
  active: boolean;
};
type Department = {
  id: number;
  name: string;
  organizationId: number | null;
  organization: string;
  parentId: number | null;
  active: boolean;
};
type Organization = {
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
type Topic = { id: number; name: string; description: string; color: string; active: boolean };
type Integration = {
  id: number;
  code: string;
  name: string;
  category: string;
  status: string;
  enabled: boolean;
  lastSyncAt: string | null;
};
export type Task = ClientTask;
export type Meeting = ClientMeeting;
export type Bootstrap = {
  actor: Actor;
  tasks: Task[];
  meetings: Meeting[];
  roles: Role[];
  departments: Department[];
  organizations: Organization[];
  topics: Topic[];
  integrations: Integration[];
  telegram: { configured: boolean; botUsername: string | null; linkedEmployees: number; pendingJobs: number };
  counters?: { latestAuditAt: string | null };
  lists?: { tasksHasMore: boolean; meetingsHasMore: boolean; tasksNextCursor?: string | null };
};
/** Organizations and departments, loaded on demand from /api/bootstrap/structure. */
export type OrgStructure = { departments: Department[]; organizations: Organization[] };
/** What /api/bootstrap returns: everything except the on-demand structure. */
export type BootstrapPayload = Omit<Bootstrap, "departments" | "organizations">;
export type EmployeeDirectory = { employees: Employee[]; assignableEmployeeIds: number[]; truncated: boolean };

export type TaskListScope = "current" | "all";
export type ModalState =
  | { type: "task-new" }
  | { type: "task-edit"; task: Task }
  | { type: "meeting-new"; meeting?: Meeting; defaultDate?: string }
  | { type: "task-detail"; taskId: number }
  | { type: "employee"; employee?: Employee }
  | { type: "role"; role?: Role }
  | { type: "department"; department?: Department }
  | { type: "organization"; organization?: Organization }
  | { type: "topic"; topic?: Topic }
  | { type: "telegram-link"; employee: Employee; link?: { token: string; url: string | null; expiresAt: string } }
  | null;
