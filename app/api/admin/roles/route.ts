import { getD1 } from "../../../../db";
import { apiError, assertSameOrigin, audit, requireActor, type PermissionSet } from "../../../../lib/auth";
import { authorize } from "../../../../lib/policy";
import { roleManage } from "../../../../lib/policy/admin";

const allowedScopes = new Set(["all", "subtree", "department", "own"]);
const allowedAssignScopes = new Set(["all", "subtree", "department", "none"]);
const allowedInformationScopes = new Set(["all", "organization", "department", "assigned"]);

function cleanLevel(value: unknown, fallback = 100) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(Math.max(1, Math.min(999, number))) : fallback;
}

function cleanPermissions(input: unknown): PermissionSet {
  const value = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  return {
    viewScope: allowedScopes.has(String(value.viewScope))
      ? (String(value.viewScope) as PermissionSet["viewScope"])
      : "own",
    assignScope: allowedAssignScopes.has(String(value.assignScope))
      ? (String(value.assignScope) as PermissionSet["assignScope"])
      : "none",
    canCreateTask: Boolean(value.canCreateTask),
    canCreateMeeting: Boolean(value.canCreateMeeting),
    canExport: Boolean(value.canExport),
    canManageOrganization: Boolean(value.canManageOrganization),
    canManageRoles: Boolean(value.canManageRoles),
    canConfigure: Boolean(value.canConfigure),
    canViewAudit: Boolean(value.canViewAudit),
    canUpdateAnyTask: Boolean(value.canUpdateAnyTask),
    canManageReports: Boolean(value.canManageReports),
    canManageInformation: Boolean(value.canManageInformation),
    canViewRestrictedInformation: Boolean(value.canViewRestrictedInformation),
    informationScope: allowedInformationScopes.has(String(value.informationScope))
      ? (String(value.informationScope) as PermissionSet["informationScope"])
      : "assigned",
    canEnterInformation: Boolean(value.canEnterInformation),
    canSubmitInformation: Boolean(value.canSubmitInformation),
    canVerifyInformation: Boolean(value.canVerifyInformation),
    canApproveInformation: Boolean(value.canApproveInformation),
  };
}

/** Field-by-field before/after of a role's permissions, for the audit trail. */
function permissionDiff(before: Partial<PermissionSet>, after: Partial<PermissionSet>) {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const from = before[key as keyof PermissionSet] ?? null;
    const to = after[key as keyof PermissionSet] ?? null;
    if (from !== to) changes[key] = { from, to };
  }
  return changes;
}

function storedPermissions(value: unknown): Partial<PermissionSet> {
  try {
    const parsed = JSON.parse(String(value ?? "{}"));
    return parsed && typeof parsed === "object" ? (parsed as Partial<PermissionSet>) : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(roleManage(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const name = String(payload.name ?? "").trim();
    const code = String(payload.code ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "_")).replace(/^_+|_+$/g, "");
    const level = cleanLevel(payload.level);
    if (name.length < 2 || name.length > 100 || !/^[a-z][a-z0-9_]{2,29}$/.test(code)) {
      return Response.json({ error: "Rol nomi va kodi to‘g‘ri kiritilishi kerak" }, { status: 400 });
    }
    const result = await (
      await getD1()
    )
      .prepare("INSERT INTO app_roles (code, name, level, permissions_json, is_system) VALUES (?, ?, ?, ?, 0)")
      .bind(code, name, level, JSON.stringify(cleanPermissions(payload.permissions)))
      .run();
    const permissions = cleanPermissions(payload.permissions);
    await audit(actor, "role.created", "role", Number(result.meta.last_row_id), { code, name, level, permissions });
    return Response.json({ id: Number(result.meta.last_row_id) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rol saqlanmadi";
    if (message.includes("UNIQUE"))
      return Response.json({ error: "Bunday rol kodi allaqachon mavjud" }, { status: 409 });
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(roleManage(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const id = Number(payload.id);
    if (!id) return Response.json({ error: "Rol ID majburiy" }, { status: 400 });
    const db = await getD1();
    const role = await db.prepare("SELECT * FROM app_roles WHERE id=?").bind(id).first<Record<string, unknown>>();
    if (!role) return Response.json({ error: "Rol topilmadi" }, { status: 404 });
    if (String(role.code) === "admin")
      return Response.json({ error: "Administrator roli himoyalangan" }, { status: 409 });
    const name = String(payload.name ?? role.name).trim();
    const active = payload.active == null ? Boolean(role.active) : Boolean(payload.active);
    if (!active) {
      const used = await db
        .prepare("SELECT COUNT(*) AS count FROM app_employees WHERE role_id=? AND active=1")
        .bind(id)
        .first<{ count: number }>();
      if (Number(used?.count ?? 0) > 0)
        return Response.json({ error: "Avval ushbu roldagi xodimlarni boshqa rolga o‘tkazing" }, { status: 409 });
    }
    const previousPermissions = storedPermissions(role.permissions_json);
    const permissions = payload.permissions ? cleanPermissions(payload.permissions) : previousPermissions;
    if (name.length < 2 || name.length > 100)
      return Response.json({ error: "Rol nomi 2–100 belgidan iborat bo‘lishi kerak" }, { status: 400 });
    const level = cleanLevel(payload.level, Number(role.level));
    await db
      .prepare(
        "UPDATE app_roles SET name=?, level=?, permissions_json=?, active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
      .bind(name, level, JSON.stringify(permissions), active ? 1 : 0, id)
      .run();
    // Record exactly which rights changed, so "who granted what" can be answered later.
    await audit(actor, "role.updated", "role", id, {
      code: String(role.code),
      name: { from: String(role.name), to: name },
      level: { from: Number(role.level), to: level },
      active: { from: Boolean(role.active), to: active },
      permissions: permissionDiff(previousPermissions, permissions),
    });
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
