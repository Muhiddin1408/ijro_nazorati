export type Role = "committee" | "institute" | "leadership";

type ProjectCapabilities = {
  edit: boolean;
  activate: boolean;
  contribute: boolean;
  verify: boolean;
  review: boolean;
  implement: boolean;
  archive: boolean;
  upload: boolean;
};

export type Project = {
  id: number;
  code: string;
  title: string;
  kind: string;
  area: string;
  executorOrganizationId: number;
  responsibleEmployeeId: number;
  organization: string;
  leader: string;
  coordinator: string;
  problem: string;
  objective: string;
  novelty: string;
  expectedResult: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: string;
  stage: number;
  progress: number;
  origin: string;
  sourceId: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  capabilities: ProjectCapabilities;
};

export type Milestone = {
  id: number;
  projectId: number;
  stage: number;
  name: string;
  plannedDate: string;
  actualDate: string | null;
  status: string;
  resultSummary: string;
  kpiValue: string;
  expenditure: number;
  reviewerComment: string;
};

type ResearchEvent = {
  id: number;
  projectId: number;
  eventType: string;
  fromStatus: string;
  toStatus: string;
  actorRole: string;
  actorName: string;
  comment: string;
  createdAt: string;
};

type Problem = {
  id: number;
  code: string;
  title: string;
  area: string;
  sourceOrganization: string;
  description: string;
  expectedResult: string;
  deadline: string;
  priority: string;
  status: string;
  proposalCount: number;
};

type Proposal = {
  id: number;
  problemId: number;
  applicant: string;
  organization: string;
  solutionTitle: string;
  summary: string;
  expectedEffect: string;
  status: string;
  submittedAt: string;
};

type Topic = {
  id: number;
  title: string;
  area: string;
  sourceOrganization: string;
  priority: string;
  rationale: string;
  status: string;
  selectedProjectId: number | null;
};

type ForeignProject = {
  id: number;
  title: string;
  country: string;
  area: string;
  impact: string;
  adaptation: string;
  readiness: number;
  status: string;
  pilotProjectId: number | null;
};

type Attachment = {
  id: number;
  projectId: number;
  milestoneId: number | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
  createdAt: string;
};

type CatalogRecord = {
  id: number;
  title: string;
  status: string;
  periodStart: string | null;
  periodEnd: string | null;
  values: Record<string, unknown>;
  publishedAt: string | null;
  updatedAt: string;
};

export type Dashboard = {
  role: Role;
  capabilities: {
    createProject: boolean;
    selectIntake: boolean;
    manageIntake: boolean;
    submitProposal: boolean;
    viewOnly: boolean;
  };
  projects: Project[];
  milestones: Milestone[];
  events: ResearchEvent[];
  problems: Problem[];
  proposals: Proposal[];
  topics: Topic[];
  foreignProjects: ForeignProject[];
  attachments: Attachment[];
  catalog: CatalogRecord[];
  directory: {
    organizations: Array<{ id: number; name: string; shortName: string; taxId: string; type: string }>;
    sourceOrganizations: Array<{ id: number; name: string; shortName: string; taxId: string; type: string }>;
    employees: Array<{ id: number; name: string; position: string; organizationId: number }>;
    coordinator: { id: number; name: string };
  };
  stages: string[];
  generatedAt: string;
};

export type ProjectPrefill = {
  title: string;
  area: string;
  problem: string;
  objective: string;
  expectedResult: string;
  origin: "problem" | "topic" | "foreign";
  sourceIntakeId: number;
  kind?: "research" | "innovation" | "pilot";
};

export type ModalState =
  | { type: "project"; projectId: number }
  | { type: "projectForm"; project?: Project; prefill?: ProjectPrefill }
  | { type: "stageSubmit"; project: Project }
  | { type: "stageVerify"; project: Project }
  | { type: "stageReview"; project: Project }
  | { type: "archive"; project: Project }
  | { type: "problemForm" }
  | { type: "problem"; problem: Problem }
  | { type: "proposal"; problem: Problem }
  | { type: "topicForm" }
  | { type: "foreignForm" }
  | null;

export type SearchResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  body: string;
  score: number;
  matched: string[];
};
