import { headers } from "next/headers";
import { getD1 } from "../db";
import { ownerSsoEmployeeId } from "./owner-sso";
import { SQL_NOW_ISO } from "./sql-time";
import { ApiError } from "./errors";
import { sessionIdleExpired, utcTimestamp } from "./session";

export type ViewScope = "all" | "subtree" | "department" | "own";
export type AssignScope = "all" | "subtree" | "department" | "none";
export type InformationScope = "all" | "organization" | "department" | "assigned";

export type PermissionSet = {
  viewScope: ViewScope;
  assignScope: AssignScope;
  canCreateTask: boolean;
  canCreateMeeting: boolean;
  canExport: boolean;
  canManageOrganization: boolean;
  canManageRoles: boolean;
  canConfigure: boolean;
  canViewAudit: boolean;
  canUpdateAnyTask: boolean;
  canManageReports: boolean;
  canManageInformation: boolean;
  canViewRestrictedInformation: boolean;
  informationScope: InformationScope;
  canEnterInformation: boolean;
  canSubmitInformation: boolean;
  canVerifyInformation: boolean;
  canApproveInformation: boolean;
};

export type Actor = {
  id: number;
  name: string;
  email: string;
  position: string;
  departmentId: number | null;
  department: string;
  organizationId: number | null;
  organization: string;
  organizationType: string | null;
  managerId: number | null;
  roleId: number;
  roleCode: string;
  roleName: string;
  roleLevel: number;
  username: string | null;
  mustChangePassword: boolean;
  permissions: PermissionSet;
};

const defaultPermissions: PermissionSet = {
  viewScope: "own",
  assignScope: "none",
  canCreateTask: false,
  canCreateMeeting: false,
  canExport: false,
  canManageOrganization: false,
  canManageRoles: false,
  canConfigure: false,
  canViewAudit: false,
  canUpdateAnyTask: false,
  canManageReports: false,
  canManageInformation: false,
  canViewRestrictedInformation: false,
  informationScope: "assigned",
  canEnterInformation: false,
  canSubmitInformation: false,
  canVerifyInformation: false,
  canApproveInformation: false,
};

export { ApiError };

function parsePermissions(value: unknown): PermissionSet {
  try {
    const parsed = JSON.parse(String(value ?? "{}")) as Partial<PermissionSet>;
    return { ...defaultPermissions, ...parsed };
  } catch {
    return defaultPermissions;
  }
}

/**
 * Local development only: impersonation is opt-in through DEV_IMPERSONATE_EMAIL.
 * Request headers are never trusted, and production builds always return null.
 */
export function currentIdentityEmail(): string | null {
  if (process.env.NODE_ENV !== "development") return null;
  const email = process.env.DEV_IMPERSONATE_EMAIL?.trim().toLowerCase();
  return email || null;
}

function cookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) {
      const encoded = value.join("=");
      try {
        return decodeURIComponent(encoded);
      } catch {
        return null;
      }
    }
  }
  return null;
}

async function actorFromEmployeeId(employeeId: number): Promise<Actor | null> {
  const db = await getD1();
  const row = await db.prepare(
    `SELECT e.id, e.full_name, e.email, e.position, e.department_id, e.organization_id, e.manager_id,
            d.name AS department_name, r.id AS role_id, r.code AS role_code,
            r.name AS role_name, r.level AS role_level, r.permissions_json,
            o.name AS organization_name, o.type AS organization_type,
            c.username, COALESCE(c.must_change_password,0) AS must_change_password
       FROM app_employees e
       JOIN app_roles r ON r.id = e.role_id AND r.active = 1
       LEFT JOIN app_departments d ON d.id = e.department_id
       LEFT JOIN app_organizations o ON o.id = e.organization_id
       LEFT JOIN app_user_credentials c ON c.employee_id=e.id
      WHERE e.id=? AND e.active=1 LIMIT 1`,
  ).bind(employeeId).first<Record<string, unknown>>();
  if (!row) return null;
  const profileRows = await db.prepare(
    `SELECT p.information_scope,p.can_enter_information,p.can_submit_information,p.can_verify_information,
            p.can_approve_information,p.can_view_all_information
       FROM app_access_profile_assignments a
       JOIN app_access_profiles p ON p.id=a.access_profile_id AND p.active=1
      WHERE a.principal_type='employee' AND a.principal_id=? AND a.active=1`,
  ).bind(employeeId).all<Record<string, unknown>>();
  const permissions = parsePermissions(row.permissions_json);
  const informationScopeRank: Record<InformationScope, number> = { assigned: 0, department: 1, organization: 2, all: 3 };
  for (const profile of profileRows.results) {
    const scope = String(profile.information_scope) as InformationScope;
    if (scope in informationScopeRank && informationScopeRank[scope] > informationScopeRank[permissions.informationScope]) {
      permissions.informationScope = scope;
    }
    permissions.canEnterInformation ||= Boolean(profile.can_enter_information);
    permissions.canSubmitInformation ||= Boolean(profile.can_submit_information);
    permissions.canVerifyInformation ||= Boolean(profile.can_verify_information);
    permissions.canApproveInformation ||= Boolean(profile.can_approve_information);
    permissions.canViewRestrictedInformation ||= Boolean(profile.can_view_all_information);
  }
  return {
    id: Number(row.id),
    name: String(row.full_name),
    email: String(row.email ?? ""),
    position: String(row.position ?? ""),
    departmentId: row.department_id == null ? null : Number(row.department_id),
    department: String(row.department_name ?? "Bo‘lim biriktirilmagan"),
    organizationId: row.organization_id == null ? null : Number(row.organization_id),
    organization: String(row.organization_name ?? "Tashkilot biriktirilmagan"),
    organizationType: row.organization_type ? String(row.organization_type) : null,
    managerId: row.manager_id == null ? null : Number(row.manager_id),
    roleId: Number(row.role_id),
    roleCode: String(row.role_code),
    roleName: String(row.role_name),
    roleLevel: Number(row.role_level),
    username: row.username ? String(row.username) : null,
    mustChangePassword: Boolean(row.must_change_password),
    permissions,
  };
}

export async function requireActor(options: { allowPasswordChangeRequired?: boolean } = {}): Promise<Actor> {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");
  const token = cookieValue(cookieHeader, "ijro_session");
  if (token) {
    const { sha256 } = await import("./password");
    const db = await getD1();
    const tokenHash = await sha256(token);
    const found = await db.prepare(
      `SELECT employee_id,last_seen_at,created_at,expires_at FROM app_sessions
        WHERE token_hash=? AND expires_at>${SQL_NOW_ISO} LIMIT 1`,
    ).bind(tokenHash).first<{ employee_id: number; last_seen_at: string; created_at: string; expires_at: string }>();
    let session = found;
    if (found && sessionIdleExpired(found)) {
      await db.prepare("DELETE FROM app_sessions WHERE token_hash=?").bind(tokenHash).run();
      session = null;
    }
    if (session) {
      const actor = await actorFromEmployeeId(Number(session.employee_id));
      if (actor) {
        if (Date.now() - utcTimestamp(session.last_seen_at) > 5 * 60_000) {
          await db.prepare("UPDATE app_sessions SET last_seen_at=CURRENT_TIMESTAMP WHERE token_hash=?").bind(tokenHash).run();
        }
        if (actor.mustChangePassword && !options.allowPasswordChangeRequired) {
          throw new ApiError(428, "Avval vaqtinchalik parolni shaxsiy parolga almashtiring");
        }
        return actor;
      }
    }
  }

  if (cookieValue(cookieHeader, "ijro_login_only") === "1") {
    throw new ApiError(401, "Login va parol orqali tizimga kiring");
  }
  const ownerId = await ownerSsoEmployeeId(requestHeaders);
  if (ownerId != null) {
    const owner = await actorFromEmployeeId(ownerId);
    if (!owner) throw new ApiError(403, "Shaxsiy kirish o‘chirilgan. Administratorga murojaat qiling.");
    // The password-change requirement still applies to password sessions.
    return { ...owner, mustChangePassword: false };
  }
  const email = currentIdentityEmail();
  if (!email) throw new ApiError(401, "Login va parol orqali tizimga kiring");
  const legacy = await (await getD1()).prepare("SELECT id FROM app_employees WHERE lower(email)=? AND active=1 LIMIT 1")
    .bind(email).first<{ id: number }>();
  const actor = legacy ? await actorFromEmployeeId(Number(legacy.id)) : null;
  if (!actor) {
    throw new ApiError(403, "Siz hali tashkilot xodimlari ro‘yxatiga kiritilmagansiz. Administratorga murojaat qiling.");
  }
  if (actor.mustChangePassword && !options.allowPasswordChangeRequired) {
    throw new ApiError(428, "Avval vaqtinchalik parolni shaxsiy parolga almashtiring");
  }
  return actor;
}

export async function activeEmployees(employeeIds?: number[], limit?: number) {
  if (employeeIds && employeeIds.length === 0) return [];
  const db = await getD1();
  const selectedIds = employeeIds ? [...new Set(employeeIds)].slice(0, limit ?? employeeIds.length) : null;
  const chunks = selectedIds ? Array.from({ length: Math.ceil(selectedIds.length / 80) }, (_, index) => selectedIds.slice(index * 80, index * 80 + 80)) : [null];
  const rows: Record<string, unknown>[] = [];
  for (const chunk of chunks) {
    const where = chunk ? `WHERE e.id IN (${chunk.map(() => "?").join(",")})` : "";
    const result = await db.prepare(
    `SELECT e.id, e.full_name, e.email, e.position, e.department_id, e.organization_id, e.manager_id,
            e.active, d.name AS department, r.id AS role_id, r.code AS role_code,
            r.name AS role_name, r.level AS role_level,
            o.name AS organization, o.type AS organization_type,
            profile.full_name_cyrillic,profile.birth_date,profile.internal_extension,profile.mobile_phone,
            profile.source_employee_number,profile.source_row,
            CASE WHEN ta.employee_id IS NULL THEN 0 ELSE 1 END AS telegram_linked,
            ta.username AS telegram_username, c.username,
            CASE WHEN c.employee_id IS NULL THEN 0 ELSE 1 END AS login_configured
       FROM app_employees e
       JOIN app_roles r ON r.id=e.role_id
       LEFT JOIN app_departments d ON d.id=e.department_id
       LEFT JOIN app_organizations o ON o.id=e.organization_id
       LEFT JOIN app_employee_profiles profile ON profile.employee_id=e.id
       LEFT JOIN app_telegram_accounts ta ON ta.employee_id=e.id AND ta.blocked_at IS NULL
      LEFT JOIN app_user_credentials c ON c.employee_id=e.id
      ${where}
      ORDER BY e.active DESC, r.level, e.full_name
      ${limit && !chunk ? "LIMIT ?" : ""}`,
    ).bind(...(chunk ?? []), ...(limit && !chunk ? [limit] : [])).all<Record<string, unknown>>();
    rows.push(...result.results);
  }
  rows.sort((a, b) => Number(b.active) - Number(a.active) || Number(a.role_level) - Number(b.role_level) || String(a.full_name).localeCompare(String(b.full_name)));
  return rows.slice(0, limit ?? rows.length).map((row) => ({
    id: Number(row.id),
    name: String(row.full_name),
    email: String(row.email ?? ""),
    position: String(row.position ?? ""),
    fullNameCyrillic: row.full_name_cyrillic ? String(row.full_name_cyrillic) : null,
    birthDate: row.birth_date ? String(row.birth_date) : null,
    internalExtension: row.internal_extension ? String(row.internal_extension) : null,
    mobilePhone: row.mobile_phone ? String(row.mobile_phone) : null,
    sourceEmployeeNumber: row.source_employee_number == null ? null : Number(row.source_employee_number),
    sourceRow: row.source_row == null ? null : Number(row.source_row),
    departmentId: row.department_id == null ? null : Number(row.department_id),
    department: String(row.department ?? "Bo‘lim biriktirilmagan"),
    organizationId: row.organization_id == null ? null : Number(row.organization_id),
    organization: String(row.organization ?? "Tashkilot biriktirilmagan"),
    organizationType: row.organization_type ? String(row.organization_type) : null,
    managerId: row.manager_id == null ? null : Number(row.manager_id),
    roleId: Number(row.role_id),
    roleCode: String(row.role_code),
    roleName: String(row.role_name),
    roleLevel: Number(row.role_level),
    active: Boolean(row.active),
    telegramLinked: Boolean(row.telegram_linked),
    telegramUsername: row.telegram_username ? String(row.telegram_username) : null,
    username: row.username ? String(row.username) : null,
    loginConfigured: Boolean(row.login_configured),
  }));
}

export async function scopedEmployeeIds(actor: Actor, scope: ViewScope | AssignScope, limit?: number) {
  if (scope === "none") return [];
  if (scope === "own") return [actor.id];
  const db = await getD1();
  const rowLimit = limit == null ? null : Math.max(1, Math.min(1000, Math.floor(limit)));
  if (scope === "all") {
    const result = await db.prepare(`SELECT id FROM app_employees WHERE active=1 ORDER BY id${rowLimit ? " LIMIT ?" : ""}`)
      .bind(...(rowLimit ? [rowLimit] : [])).all<{ id: number }>();
    return result.results.map((item) => Number(item.id));
  }
  if (scope === "department") {
    if (actor.departmentId == null) return [actor.id];
    const result = await db.prepare(
      `SELECT id FROM app_employees
        WHERE active=1 AND department_id=?
          AND (? IS NULL OR organization_id=?) ORDER BY id${rowLimit ? " LIMIT ?" : ""}`,
    ).bind(actor.departmentId, actor.organizationId, actor.organizationId, ...(rowLimit ? [rowLimit] : [])).all<{ id: number }>();
    return result.results.map((item) => Number(item.id));
  }
  const result = await db.prepare(
    `WITH RECURSIVE descendants(id) AS (
       SELECT id FROM app_employees WHERE id=? AND active=1
       UNION
       SELECT employee.id FROM app_employees employee
       JOIN descendants parent ON employee.manager_id=parent.id
       WHERE employee.active=1
     ), organization_scope(id) AS (
       SELECT id FROM app_organizations WHERE id=? AND active=1
       UNION ALL
       SELECT organization.id FROM app_organizations organization
       JOIN organization_scope parent ON organization.parent_id=parent.id
       WHERE organization.active=1
     )
     SELECT id FROM app_employees
      WHERE active=1 AND (
        id IN (SELECT id FROM descendants)
        OR organization_id IN (SELECT id FROM organization_scope)
      ) ORDER BY id${rowLimit ? " LIMIT ?" : ""}`,
  ).bind(actor.id, actor.organizationId ?? -1, ...(rowLimit ? [rowLimit] : [])).all<{ id: number }>();
  return result.results.map((item) => Number(item.id));
}

export async function employeeIdsInScopes(
  actor: Actor,
  employeeIds: number[],
  scopes: Array<ViewScope | AssignScope>,
) {
  const uniqueIds = [...new Set(employeeIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (!uniqueIds.length) return true;
  const activeScopes = [...new Set(scopes.filter((scope) => scope !== "none"))];
  if (!activeScopes.length) return false;
  const hasAll = activeScopes.includes("all");
  const hasSubtree = activeScopes.includes("subtree");
  const hasDepartment = activeScopes.includes("department");
  const hasOwn = activeScopes.includes("own");
  const db = await getD1();
  for (let index = 0; index < uniqueIds.length; index += 60) {
    const chunk = uniqueIds.slice(index, index + 60);
    const prefix = hasSubtree ? `WITH RECURSIVE employee_scope(id) AS (
      SELECT id FROM app_employees WHERE id=? AND active=1
      UNION ALL SELECT child.id FROM app_employees child JOIN employee_scope parent ON child.manager_id=parent.id WHERE child.active=1
    ), organization_scope(id) AS (
      SELECT id FROM app_organizations WHERE id=? AND active=1
      UNION ALL SELECT child.id FROM app_organizations child JOIN organization_scope parent ON child.parent_id=parent.id WHERE child.active=1
    )` : "";
    const scopeConditions: string[] = [];
    const scopeBinds: unknown[] = [];
    if (hasAll) scopeConditions.push("1=1");
    if (hasOwn) {
      scopeConditions.push("e.id=?");
      scopeBinds.push(actor.id);
    }
    if (hasDepartment) {
      scopeConditions.push("(e.department_id=? AND (? IS NULL OR e.organization_id=?))");
      scopeBinds.push(actor.departmentId ?? -1, actor.organizationId, actor.organizationId);
    }
    if (hasSubtree) scopeConditions.push("(e.id IN (SELECT id FROM employee_scope) OR e.organization_id IN (SELECT id FROM organization_scope))");
    const result = await db.prepare(
      `${prefix}
       SELECT COUNT(*) AS count FROM app_employees e
        WHERE e.active=1 AND e.id IN (${chunk.map(() => "?").join(",")})
          AND (${scopeConditions.join(" OR ")})`,
    ).bind(...(hasSubtree ? [actor.id, actor.organizationId ?? -1] : []), ...chunk, ...scopeBinds).first<{ count: number }>();
    if (Number(result?.count ?? 0) !== chunk.length) return false;
  }
  return true;
}

export async function organizationScopeIds(actor: Actor, systemWide = false) {
  const db = await getD1();
  if (systemWide || actor.roleCode === "admin" || actor.permissions.viewScope === "all") {
    const result = await db.prepare("SELECT id FROM app_organizations WHERE active=1 ORDER BY id").all<{ id: number }>();
    return result.results.map((item) => Number(item.id));
  }
  if (actor.organizationId == null) return [];
  const result = await db.prepare(
    `WITH RECURSIVE scope(id) AS (
       SELECT id FROM app_organizations WHERE id=? AND active=1
       UNION ALL
       SELECT child.id FROM app_organizations child JOIN scope parent ON child.parent_id=parent.id
        WHERE child.active=1
     ) SELECT id FROM scope ORDER BY id`,
  ).bind(actor.organizationId).all<{ id: number }>();
  return result.results.map((item) => Number(item.id));
}

export async function canAccessTask(actor: Actor, taskId: number) {
  if (actor.permissions.viewScope === "all") {
    return Boolean(await (await getD1()).prepare("SELECT id FROM app_tasks WHERE id=? LIMIT 1").bind(taskId).first());
  }
  const db = await getD1();
  if (actor.permissions.viewScope === "own") {
    const row = await db.prepare(
      `SELECT t.id FROM app_tasks t WHERE t.id=? AND (t.created_by_employee_id=? OR EXISTS (
        SELECT 1 FROM app_task_assignments a WHERE a.task_id=t.id AND a.employee_id=?
      ) OR EXISTS (
        SELECT 1 FROM app_task_audiences audience WHERE audience.task_id=t.id AND (
          (audience.target_type='department' AND audience.target_id=?)
          OR (audience.target_type='organization' AND (
            audience.target_id=? OR (audience.include_descendants=1 AND audience.target_id IN (
              WITH RECURSIVE ancestors(id) AS (
                SELECT ? UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
              ) SELECT id FROM ancestors
            ))
          ))
        )
      )) LIMIT 1`,
    ).bind(taskId, actor.id, actor.id, actor.departmentId ?? -1, actor.organizationId ?? -1, actor.organizationId ?? -1).first();
    return Boolean(row);
  }
  if (actor.permissions.viewScope === "department") {
    const row = await db.prepare(
      `SELECT t.id FROM app_tasks t WHERE t.id=? AND (t.created_by_employee_id=? OR EXISTS (
        SELECT 1 FROM app_task_assignments a JOIN app_employees e ON e.id=a.employee_id AND e.active=1
        WHERE a.task_id=t.id AND e.department_id=? AND (? IS NULL OR e.organization_id=?)
      ) OR EXISTS (
        SELECT 1 FROM app_task_audiences audience WHERE audience.task_id=t.id AND (
          (audience.target_type='department' AND audience.target_id=?)
          OR (audience.target_type='organization' AND (
            audience.target_id=? OR (audience.include_descendants=1 AND audience.target_id IN (
              WITH RECURSIVE ancestors(id) AS (
                SELECT ? UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
              ) SELECT id FROM ancestors
            ))
          ))
        )
      )) LIMIT 1`,
    ).bind(taskId, actor.id, actor.departmentId ?? -1, actor.organizationId, actor.organizationId, actor.departmentId ?? -1, actor.organizationId ?? -1, actor.organizationId ?? -1).first();
    return Boolean(row);
  }
  const row = await db.prepare(
    `WITH RECURSIVE employee_scope(id) AS (
       SELECT id FROM app_employees WHERE id=? AND active=1
       UNION ALL SELECT child.id FROM app_employees child JOIN employee_scope parent ON child.manager_id=parent.id WHERE child.active=1
     ), organization_scope(id) AS (
       SELECT id FROM app_organizations WHERE id=? AND active=1
       UNION ALL SELECT child.id FROM app_organizations child JOIN organization_scope parent ON child.parent_id=parent.id WHERE child.active=1
     ), actor_org_ancestors(id) AS (
       SELECT ? UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN actor_org_ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
     )
     SELECT t.id FROM app_tasks t WHERE t.id=? AND (
       t.created_by_employee_id IN (SELECT id FROM employee_scope)
       OR EXISTS (SELECT 1 FROM app_task_assignments a JOIN app_employees e ON e.id=a.employee_id
         WHERE a.task_id=t.id AND (e.id IN (SELECT id FROM employee_scope) OR e.organization_id IN (SELECT id FROM organization_scope)))
       OR EXISTS (SELECT 1 FROM app_task_audiences audience WHERE audience.task_id=t.id AND (
         (audience.target_type='department' AND EXISTS (
           SELECT 1 FROM app_departments target_department WHERE target_department.id=audience.target_id AND target_department.organization_id IN (SELECT id FROM organization_scope)
         ))
         OR (audience.target_type='organization' AND (
           audience.target_id IN (SELECT id FROM organization_scope)
           OR (audience.include_descendants=1 AND audience.target_id IN (SELECT id FROM actor_org_ancestors))
         ))
       ))
     ) LIMIT 1`,
  ).bind(actor.id, actor.organizationId ?? -1, actor.organizationId ?? -1, taskId).first();
  return Boolean(row);
}

export function requirePermission(actor: Actor, permission: keyof PermissionSet) {
  if (!actor.permissions[permission]) throw new ApiError(403, "Bu amal uchun vakolatingiz yetarli emas");
}

/**
 * The public origin users see. Behind the reverse proxy `request.url` is the
 * internal http://host:3000 address, so prefer SITE_BASE_URL, then the proxy's
 * forwarded headers.
 */
export function publicOrigin(request: Request) {
  const configured = process.env.SITE_BASE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Fall through to the request-derived origin.
    }
  }
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host");
  if ((proto === "https" || proto === "http") && host) {
    try {
      return new URL(`${proto}://${host}`).origin;
    } catch {
      return url.origin;
    }
  }
  return url.origin;
}

export function isSecureRequest(request: Request) {
  return publicOrigin(request).startsWith("https:");
}

export function assertSameOrigin(request: Request) {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") throw new ApiError(403, "Tashqi so‘rov bloklandi");
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== publicOrigin(request)) {
        throw new ApiError(403, "So‘rov manbasi tasdiqlanmadi");
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(403, "So‘rov manbasi tasdiqlanmadi");
    }
  } else if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !secFetchSite) {
    throw new ApiError(403, "So‘rov manbasi tasdiqlanmadi");
  }
}

export async function audit(actor: Actor | null, action: string, entityType: string, entityId: number | null, detail: unknown = {}) {
  await (await getD1()).prepare(
    "INSERT INTO app_audit_logs (actor_employee_id, action, entity_type, entity_id, detail_json) VALUES (?, ?, ?, ?, ?)",
  ).bind(actor?.id ?? null, action, entityType, entityId, JSON.stringify(detail)).run();
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status });
  console.error("Unhandled API error", error);
  return Response.json({ error: "Serverda kutilmagan xatolik" }, { status: 500 });
}
