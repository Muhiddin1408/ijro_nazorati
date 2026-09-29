import { getD1 } from "../db";
import { type Actor } from "./auth";
import { canViewLoginConfigured as policyCanViewLoginConfigured, directoryGlobalScope } from "./policy/admin";

export type DirectoryScope = "chat" | "task" | "meeting" | "staff";

type DirectoryQuery = {
  scope: DirectoryScope;
  q?: string;
  organizationId?: number | null;
  departmentId?: number | null;
  cursor?: number;
  limit?: number;
};

function employeeScope(actor: Actor, requestedScope: DirectoryScope) {
  if (requestedScope === "chat" || requestedScope === "staff" && directoryGlobalScope(actor)) {
    return { prefix: "", condition: "1=1", binds: [] as unknown[] };
  }
  const scope = requestedScope === "task" ? actor.permissions.assignScope
    : actor.permissions.assignScope !== "none" ? actor.permissions.assignScope : actor.permissions.viewScope;
  if (scope === "all") return { prefix: "", condition: "1=1", binds: [] as unknown[] };
  if (scope === "department") return {
    prefix: "",
    condition: "e.department_id=? AND (? IS NULL OR e.organization_id=?)",
    binds: [actor.departmentId ?? -1, actor.organizationId, actor.organizationId] as unknown[],
  };
  if (scope === "subtree") return {
    prefix: `WITH RECURSIVE employee_scope(id) AS (
      SELECT id FROM app_employees WHERE id=? AND active=1
      UNION ALL SELECT child.id FROM app_employees child JOIN employee_scope parent ON child.manager_id=parent.id WHERE child.active=1
    ), organization_scope(id) AS (
      SELECT id FROM app_organizations WHERE id=? AND active=1
      UNION ALL SELECT child.id FROM app_organizations child JOIN organization_scope parent ON child.parent_id=parent.id WHERE child.active=1
    )`,
    condition: "(e.id IN (SELECT id FROM employee_scope) OR e.organization_id IN (SELECT id FROM organization_scope))",
    binds: [actor.id, actor.organizationId ?? -1] as unknown[],
  };
  return { prefix: "", condition: "e.id=?", binds: [actor.id] as unknown[] };
}

export async function searchDirectory(actor: Actor, query: DirectoryQuery) {
  const db = await getD1();
  const scope = employeeScope(actor, query.scope);
  const canViewLoginConfigured = policyCanViewLoginConfigured(actor);
  const limit = Math.max(1, Math.min(100, Math.floor(query.limit ?? 25)));
  const conditions = ["e.active=1", scope.condition, "e.id>?"];
  const binds: unknown[] = [...scope.binds, Math.max(0, query.cursor ?? 0)];
  if (query.organizationId) {
    conditions.push("e.organization_id=?");
    binds.push(query.organizationId);
  }
  if (query.departmentId) {
    conditions.push("e.department_id=?");
    binds.push(query.departmentId);
  }
  const normalized = String(query.q ?? "").trim().slice(0, 100);
  if (normalized) {
    conditions.push("(e.full_name LIKE ? ESCAPE '\\' OR profile.full_name_cyrillic LIKE ? ESCAPE '\\' OR e.position LIKE ? ESCAPE '\\' OR o.name LIKE ? ESCAPE '\\' OR d.name LIKE ? ESCAPE '\\')");
    const escaped = `%${normalized.replace(/[\\%_]/g, "\\$&")}%`;
    binds.push(escaped, escaped, escaped, escaped, escaped);
  }
  const result = await db.prepare(
    `${scope.prefix}
     SELECT e.id,e.full_name,e.position,e.department_id,e.organization_id,e.manager_id,
            d.name AS department,o.name AS organization,r.name AS role_name,
            ${canViewLoginConfigured ? "CASE WHEN c.employee_id IS NULL THEN 0 ELSE 1 END" : "0"} AS login_configured
       FROM app_employees e
       JOIN app_roles r ON r.id=e.role_id
       LEFT JOIN app_employee_profiles profile ON profile.employee_id=e.id
       LEFT JOIN app_departments d ON d.id=e.department_id
       LEFT JOIN app_organizations o ON o.id=e.organization_id
       ${canViewLoginConfigured ? "LEFT JOIN app_user_credentials c ON c.employee_id=e.id" : ""}
      WHERE ${conditions.join(" AND ")}
      ORDER BY e.id LIMIT ?`,
  ).bind(...binds, limit + 1).all<Record<string, unknown>>();
  const hasMore = result.results.length > limit;
  const rows = result.results.slice(0, limit);
  return {
    employees: rows.map((row) => ({
      id: Number(row.id),
      name: String(row.full_name),
      position: String(row.position ?? ""),
      departmentId: row.department_id == null ? null : Number(row.department_id),
      department: String(row.department ?? "Bo‘lim biriktirilmagan"),
      organizationId: row.organization_id == null ? null : Number(row.organization_id),
      organization: String(row.organization ?? "Tashkilot biriktirilmagan"),
      managerId: row.manager_id == null ? null : Number(row.manager_id),
      roleName: String(row.role_name),
      loginConfigured: Boolean(row.login_configured),
    })),
    nextCursor: hasMore ? Number(rows.at(-1)?.id ?? 0) : null,
  };
}

export async function directoryBranches(actor: Actor, parentId: number | null) {
  const db = await getD1();
  const hasGlobalScope = directoryGlobalScope(actor);
  const organizationCondition = hasGlobalScope
    ? "1=1"
    : `o.id IN (
      WITH RECURSIVE scope(id) AS (
        SELECT id FROM app_organizations WHERE id=?
        UNION ALL SELECT child.id FROM app_organizations child JOIN scope parent ON child.parent_id=parent.id WHERE child.active=1
      ) SELECT id FROM scope
    )`;
  const organizations = await db.prepare(
    `SELECT o.id,o.name,o.short_name,o.type,o.parent_id,o.region_code,o.data_status,o.hierarchy_verified,
            (SELECT COUNT(*) FROM app_organizations child WHERE child.parent_id=o.id AND child.active=1) AS child_count,
            (SELECT COUNT(*) FROM app_employees e WHERE e.organization_id=o.id AND e.active=1) AS employee_count,
            (SELECT COALESCE(SUM(headcount_units),0) FROM app_staff_positions p WHERE p.organization_id=o.id AND p.active=1) AS staff_units
       FROM app_organizations o
      WHERE o.active=1 AND ${parentId == null ? (hasGlobalScope ? "o.parent_id IS NULL" : "o.id=?") : "o.parent_id=?"} AND ${organizationCondition}
      ORDER BY o.type,o.name LIMIT 100`,
  ).bind(...(parentId == null ? (hasGlobalScope ? [] : [actor.organizationId ?? -1]) : [parentId]), ...(hasGlobalScope ? [] : [actor.organizationId ?? -1])).all<Record<string, unknown>>();
  return organizations.results.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    shortName: String(row.short_name ?? ""),
    type: String(row.type),
    parentId: row.parent_id == null ? null : Number(row.parent_id),
    regionCode: row.region_code ? String(row.region_code) : null,
    dataStatus: String(row.data_status ?? "manual"),
    hierarchyVerified: Boolean(row.hierarchy_verified),
    childCount: Number(row.child_count ?? 0),
    employeeCount: Number(row.employee_count ?? 0),
    staffUnits: Number(row.staff_units ?? 0),
  }));
}
