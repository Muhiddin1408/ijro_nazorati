/** Research request validation helpers and the action context type. */
import { readJsonBody } from "../../lib/shared/body";
import { ApiError } from "../../lib/errors";
import type { Actor } from "../../lib/auth";
import { cleanText, type ResearchAccessContext } from "../../lib/research-server";
import { canCreateResearchProject, canReviewResearchProject, isReadOnlyCommitteeLeadership } from "../../lib/research-policy";

export type JsonRecord = Record<string, unknown>;

export type DirectorySelection = {
  organizationId: number;
  organizationName: string;
  employeeId: number;
  employeeName: string;
};

export type CreateProjectOptions = {
  origin?: "manual" | "problem" | "topic" | "foreign";
  sourceIntakeId?: number | null;
  sourceVersion?: number | null;
  proposalId?: number | null;
  proposalVersion?: number | null;
  directory?: DirectorySelection;
};

export function required(value: unknown, label: string, max = 4000) {
  const text = cleanText(value, max);
  if (!text) throw new ApiError(400, `${label} kiritilishi shart.`);
  return text;
}

export function requiredId(value: unknown, label: string) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(400, `${label} noto‘g‘ri.`);
  return id;
}

export function optionalId(value: unknown, label: string) {
  if (value == null || value === "") return null;
  return requiredId(value, label);
}

export function requiredVersion(value: unknown) {
  const version = Number(value);
  if (!Number.isSafeInteger(version) || version <= 0) {
    throw new ApiError(400, "Ma’lumot versiyasi ko‘rsatilmagan. Sahifani yangilang.");
  }
  return version;
}

export function nonNegativeInteger(value: unknown, label: string, fallback = 0) {
  if ((value == null || value === "") && fallback >= 0) return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new ApiError(400, `${label} musbat butun son bo‘lishi kerak.`);
  }
  return number;
}

export function projectKind(value: unknown) {
  const kind = String(value ?? "research");
  return ["research", "innovation", "pilot"].includes(kind) ? kind : "research";
}

export function priorityValue(value: unknown) {
  const priority = String(value ?? "high");
  return ["medium", "high", "very_high"].includes(priority) ? priority : "high";
}

export function parseObject(value: unknown) {
  try {
    const parsed = JSON.parse(String(value ?? "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as JsonRecord
      : {};
  } catch {
    return {};
  }
}

export async function requestPayload(request: Request) {
  return readJsonBody<JsonRecord>(request);
}

export function actorRoleLabel(actor: Actor, context: ResearchAccessContext) {
  if (canCreateResearchProject(actor, context) || canReviewResearchProject(actor, context)) return "committee";
  if (isReadOnlyCommitteeLeadership(actor)) return "leadership";
  return "institute";
}


export function assertReportsResearchRoute(request: Request) {
  // Served only under the information center URL; the implementation path itself stays private.
  if (new URL(request.url).pathname !== "/api/information/research") {
    throw new ApiError(404, "Ilmiy tadqiqotlar Ma’lumotlar markazi orqali ochiladi.");
  }
}

export function assertProjectVersionChanged(result: D1Result<unknown>, message: string) {
  if (Number(result.meta.changes ?? 0) !== 1) throw new ApiError(409, message);
}

export function assertAuditInserted(result: D1Result<unknown>) {
  if (Number(result.meta.changes ?? 0) !== 1) {
    throw new ApiError(500, "Amal bajarildi, ammo majburiy audit qaydi yaratilmadi.");
  }
}

export type ResearchActionContext = {
  action: string;
  actor: Actor;
  payload: JsonRecord;
  db: D1Database;
  context: ResearchAccessContext;
};
