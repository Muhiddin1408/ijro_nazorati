import { type NumericStats } from "../../../lib/report-sheet";

export type ReportColumn = {
  id: string;
  label: string;
  type: "number" | "text" | "date" | "boolean";
  unit: string;
  required: boolean;
  aggregation: "sum" | "average" | "last" | "none";
};

export type ReportFile = {
  id: number;
  templateId: number | null;
  assignmentId: number | null;
  purpose: string;
  fileName: string;
  contentType: string;
  size: number;
  uploadedByEmployeeId: number;
  createdAt: string;
};

export type ReportOrganization = {
  id: number;
  name: string;
  shortName: string;
  type: string;
  parentId: number | null;
  active: boolean;
};

export type ReportAssignment = {
  id: number;
  version: number;
  capabilities: { edit: boolean; delegate: boolean; review: boolean };
  numericStats: NumericStats;
  cycleId: number;
  templateId: number;
  parentAssignmentId: number | null;
  organization: ReportOrganization;
  responsible: { id: number; name: string };
  assignedByEmployeeId: number;
  status: string;
  values: Record<string, string | number | boolean>;
  rows: Array<Record<string, string | number | boolean>>;
  rowCount: number;
  comment: string;
  /** Reviewer's note (return reason); kept until the report is resubmitted. */
  reviewComment: string;
  /** Deadline passed and the report is not submitted/approved (server-computed). */
  overdue: boolean;
  submittedBy: { id: number; name: string } | null;
  submittedAt: string | null;
  reviewedBy: { id: number; name: string } | null;
  reviewedAt: string | null;
  period: { label: string; start: string; end: string; deadlineAt: string; status: string };
  template: {
    id: number;
    code: string;
    title: string;
    instructions: string;
    columns: ReportColumn[];
    frequency: string;
    allowDelegation: boolean;
    requireAttachment: boolean;
    ownerDepartmentId: number | null;
    ownerDepartment: string;
    creatorId: number;
    creatorName: string;
  };
  files: ReportFile[];
  templateFiles: ReportFile[];
  createdAt: string;
  updatedAt: string;
};

export type ReportsPayload = {
  nextCursor: number | null;
  canManageReports: boolean;
  organizations: ReportOrganization[];
  employees: { id: number; name: string; position: string; organizationId: number | null; organization: string }[];
  assignments: ReportAssignment[];
};

export type ReportsPageTask = {
  status: string;
  deadlineIso: string | null;
  assignments: Array<{ department: string; progress: number }>;
};

export type ReportsPageActor = {
  id: number;
  permissions: {
    viewScope: string;
    canManageReports: boolean;
  };
};

export type ReportsPageDepartment = { id: number; name: string };

export type ReportSheetRow = Record<string, string | number | boolean>;
