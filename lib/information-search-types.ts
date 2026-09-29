export const DIGITALIZATION_DOMAIN_CODE = "SRC_DIGITALIZATION_INNOVATION";
export type InformationSearchKind = "all" | "record" | "template" | "research";
export type InformationOpenTarget = { kind: Exclude<InformationSearchKind, "all">; id: number; domainId: number; templateId?: number };
export type InformationSearchResult = {
  key: string;
  target: InformationOpenTarget;
  title: string;
  domain: string;
  template: string;
  organization: string;
  status: string;
  updatedAt: string | null;
  excerpt: string;
  /** Text that may leave the server for AI answers: titles, labels and opted-in (aiAllowed) values only. */
  aiExcerpt?: string;
  restricted: boolean;
};
export type InformationSearchResponse = {
  query: string;
  terms: string[];
  kind: InformationSearchKind;
  status: "all" | "published";
  results: InformationSearchResult[];
  total: number;
  counts: Record<Exclude<InformationSearchKind, "all">, number>;
  page: number;
  pageSize: number;
  hasMore: boolean;
  generatedAt: string;
  mode: "search" | "ai";
  aiStatus: "not_configured" | "ready" | "unavailable" | "no_sources";
  answer: { text: string; sourceKeys: string[] } | null;
};
