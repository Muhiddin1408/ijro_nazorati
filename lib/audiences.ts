import { getD1 } from "../db";
import { ApiError, type Actor, type AssignScope, type ViewScope, organizationScopeIds } from "./auth";

export type AudienceTarget = {
  targetType: "organization" | "department";
  targetId: number;
  includeDescendants: boolean;
};

export async function authorizeAudiences(
  actor: Actor,
  value: unknown,
  scopes: Array<ViewScope | AssignScope>,
) {
  const rows = Array.isArray(value) ? value : [];
  const audiences: AudienceTarget[] = [];
  const seen = new Set<string>();
  for (const item of rows.slice(0, 50)) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const targetType = record.targetType === "organization" || record.targetType === "department" ? record.targetType : null;
    const targetId = Number(record.targetId);
    if (!targetType || !Number.isInteger(targetId) || targetId <= 0) continue;
    const key = `${targetType}:${targetId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    audiences.push({ targetType, targetId, includeDescendants: targetType === "organization" && record.includeDescendants !== false });
  }
  if (!audiences.length) return [];

  const activeScopes = new Set(scopes.filter((scope) => scope !== "none"));
  const global = activeScopes.has("all");
  const subtree = activeScopes.has("subtree");
  const departmentOnly = activeScopes.has("department");
  const organizationTargets = audiences.filter((item) => item.targetType === "organization");
  const departmentTargets = audiences.filter((item) => item.targetType === "department");

  let allowedOrganizations = new Set<number>();
  if (global) allowedOrganizations = new Set(await organizationScopeIds(actor, true));
  else if (subtree) allowedOrganizations = new Set(await organizationScopeIds(actor));
  if (organizationTargets.some((item) => !allowedOrganizations.has(item.targetId))) {
    throw new ApiError(403, "Tanlangan tashkilot vakolatingiz doirasiga kirmaydi");
  }

  if (departmentTargets.length) {
    const ids = departmentTargets.map((item) => item.targetId);
    const departments = await (await getD1()).prepare(
      `SELECT id,organization_id FROM app_departments WHERE active=1 AND id IN (${ids.map(() => "?").join(",")})`,
    ).bind(...ids).all<{ id: number; organization_id: number | null }>();
    const allowed = new Set(departments.results.filter((row) => {
      if (global) return true;
      if (subtree) return row.organization_id != null && allowedOrganizations.has(Number(row.organization_id));
      if (departmentOnly) return Number(row.id) === actor.departmentId && Number(row.organization_id) === actor.organizationId;
      return false;
    }).map((row) => Number(row.id)));
    if (ids.some((id) => !allowed.has(id))) throw new ApiError(403, "Tanlangan bo‘lim vakolatingiz doirasiga kirmaydi");
  }
  return audiences;
}

export async function employeeMatchesTaskAudience(taskId: number, employeeId: number) {
  const row = await (await getD1()).prepare(
    `SELECT employee.id FROM app_employees employee
      WHERE employee.id=? AND employee.active=1 AND EXISTS (
        SELECT 1 FROM app_task_audiences audience WHERE audience.task_id=? AND (
          (audience.target_type='department' AND audience.target_id=employee.department_id)
          OR (audience.target_type='organization' AND (
            audience.target_id=employee.organization_id
            OR (audience.include_descendants=1 AND audience.target_id IN (
              WITH RECURSIVE ancestors(id) AS (
                SELECT employee.organization_id
                UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
              ) SELECT id FROM ancestors
            ))
          ))
        )
      ) LIMIT 1`,
  ).bind(employeeId, taskId).first();
  return Boolean(row);
}
