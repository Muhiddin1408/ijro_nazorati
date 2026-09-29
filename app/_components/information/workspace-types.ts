export type WorkspaceRecord = {
  key: string;
  recordId: number | null;
  title: string;
  values: Record<string, unknown>;
  status: string;
  updatedAt: string;
  periodStart: string | null;
  periodEnd: string | null;
  isDemo: boolean;
  organization: string;
  department: string;
};

export type DrillDimension = {
  code: string;
  label: string;
  rowLabel: string;
  icon: "region" | "organization" | "country" | "category";
};

export type GroupRow = {
  value: string;
  count: number;
  metrics: Record<string, number>;
  records: WorkspaceRecord[];
};
