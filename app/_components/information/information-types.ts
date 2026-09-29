type InformationFieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "percentage"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "boolean"
  | "url"
  | "country"
  | "employee"
  | "employees"
  | "organization"
  | "region"
  | "road"
  | "geo"
  | "file";

export type InformationField = {
  code: string;
  label: string;
  type: InformationFieldType;
  required?: boolean;
  unit?: string;
  options?: string[];
  placeholder?: string;
  help?: string;
  sensitive?: boolean;
  min?: number;
  max?: number;
  aggregationFormula?: string;
};

type InformationIndicator = {
  code: string;
  label: string;
  role: "outcome" | "driver" | "guardrail";
  unit?: string;
  direction?: "up" | "down" | "neutral" | "higher_is_better" | "lower_is_better" | "contextual";
};

export type InformationTemplate = {
  id: number;
  domainId: number;
  code: string;
  name: string;
  description: string;
  recordType: string;
  cadence: string;
  statusSet: string;
  drillProfile: string;
  sourceMode: string;
  sourceSystemCode: string | null;
  freshnessSlaHours: number;
  visibility: string;
  icon: string;
  fields: InformationField[];
  indicators: InformationIndicator[];
  dimensions: string[];
  presentation?: {
    profile?: string;
    sourceBacked?: boolean;
    sourceCells?: string;
    group?: string;
    kpiCards?: string[];
    tableColumns?: string[];
    summaryColumns?: string[];
    detailColumns?: string[];
    metricFields?: string[];
    frozenColumns?: string[];
    filters?: string[];
    drilldown?: string[];
    tabField?: string;
    periodMode?: "month" | "month-range" | "date" | "date-range" | "year" | "none";
    periodLabel?: string;
    showTotal?: boolean;
    aggregation?: Record<string, { formula?: string; weightField?: string; label?: string }>;
    hideCountColumn?: boolean;
    demoMode?: "sample" | "schema-only";
    integration?: { system: string; purpose?: string; status?: "planned" | "active" };
    tabs?: Array<{ id: string; label: string; value?: string; filters?: string[]; columns?: string[] }>;
    hiddenFromCatalog?: boolean;
    consolidatedInto?: string;
    chart?: { type?: string; groupBy?: string };
    supplementary?: boolean;
  };
  sourceRow?: number | null;
  sourceScopeText?: string;
  providerPrimary?: string | null;
  providerSecondary?: string | null;
  version: number;
  active: boolean;
};

export type InformationDomain = {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
  visibility: string;
  ownerLabel: string;
  ownerDepartment: { id: number; name: string } | null;
  ownerOrganization: string;
  templateCount: number;
  indicatorCount: number;
  recordCount: number;
  realRecordCount: number;
  demoRecordCount: number;
  submittedCount: number;
  publishedCount: number;
  needsWorkCount: number;
  completeness: number | null;
  latestAt: string | null;
  canEdit: boolean;
  canReview: boolean;
};

export type InformationRecord = {
  id: number;
  version: number;
  templateId: number;
  domainId: number;
  title: string;
  periodStart: string | null;
  periodEnd: string | null;
  status: string;
  priority: string;
  sourceMode: string;
  sourceRecordKey: string | null;
  values: Record<string, unknown>;
  /** Sensitive field codes whose values the server withheld from this viewer. */
  redactedFields?: string[];
  completenessScore: number;
  isDemo: boolean;
  department: { id: number | null; name: string };
  organization: { id: number | null; name: string };
  creator: { id: number; name: string };
  reviewer: { id: number; name: string } | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  comment: string;
  createdAt: string;
  updatedAt: string;
  workflow: { round: number; sequence: number; stepCode: string; stepName: string } | null;
  validation: { errors: number; warnings: number };
  allowedActions?: string[];
};

export type InformationSummary = {
  domains: number;
  templates: number;
  indicators: number;
  records: number;
  realRecords: number;
  demoRecords: number;
  submitted: number;
  published: number;
};

export type InformationPayload = {
  capabilities: {
    manage: boolean;
    enter?: boolean;
    submit?: boolean;
    editableDomainIds?: number[];
    reviewableDomainIds?: number[];
  };
  summary?: Partial<InformationSummary>;
  domains?: InformationDomain[];
  templates?: InformationTemplate[];
  records?: InformationRecord[];
  totalCount?: number;
  nextCursor?: number | null;
  record?: InformationRecord;
  approvalSteps?: Array<{
    id: number;
    round: number;
    sequence: number;
    name: string;
    status: string;
    actor: { name: string } | null;
    comment: string;
    decidedAt: string | null;
  }>;
  validationIssues?: Array<{ id: number; severity: string; message: string; fields: string[] }>;
  history?: Array<{
    id: number;
    version: number;
    action: string;
    status: string;
    actor: string;
    createdAt: string;
  }>;
  participants?: Array<{
    id: number;
    type: string;
    employeeId: number | null;
    name: string;
    organization: string;
    position: string;
    countryCode: string | null;
  }>;
  actions?: Array<{
    id: number;
    title: string;
    ownerEmployeeId: number | null;
    ownerName: string;
    deadlineAt: string | null;
    status: string;
    linkedTaskId: number | null;
  }>;
  files?: Array<{
    id: number;
    fileName: string;
    contentType: string;
    size: number;
    createdAt: string;
  }>;
};

export type NoticeTone = "ok" | "error";

export type DirectoryEmployee = {
  id: number;
  name: string;
  position: string;
  department: string;
  organization: string;
};

export type DirectoryOrganization = {
  id: number;
  name: string;
  shortName: string;
  type: string;
  parentId: number | null;
  regionCode: string | null;
  childCount: number;
};
