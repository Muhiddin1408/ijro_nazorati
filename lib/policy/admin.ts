/**
 * Administration, account and staff-directory policies. Every rule here encodes
 * an audited decision (K2, Y1–Y3, Y13); routes and services call these instead
 * of reading `actor.permissions` directly. Callers resolve the facts (scope
 * membership, target role, elevated access) and pass them in, so the functions
 * stay synchronous and table-testable.
 */
import type { Actor, PermissionSet } from "../auth";
import { ALLOW, all, when, type Decision } from "./index";

export const NOT_PERMITTED = "Bu amal uchun vakolatingiz yetarli emas";
export const ORGANIZATION_OUT_OF_SCOPE = "Tanlangan tashkilot vakolatingiz doirasiga kirmaydi";
export const POSITION_RAISES_ACCESS = "Bu lavozim tasdiqlash vakolatini beradi; uni rollarni boshqarish vakolati bor administrator kiritadi";
export const BULK_ADMIN_SKIPPED = "Administrator akkaunti ommaviy tarzda yaratilmaydi; u o‘z parolini o‘zi o‘rnatadi";

type PolicyActor = Pick<Actor, "id" | "organizationId"> & { permissions: PermissionSet };
type Flag = keyof { [K in keyof PermissionSet as PermissionSet[K] extends boolean ? K : never]: true };

function has(actor: PolicyActor, flag: Flag): Decision {
  return when(Boolean(actor.permissions[flag]), NOT_PERMITTED);
}

const managesRoles = (actor: PolicyActor) => Boolean(actor.permissions.canManageRoles);

// ── Coarse capabilities ────────────────────────────────────────────────────

export const organizationAdmin = (actor: PolicyActor) => has(actor, "canManageOrganization");
export const roleManage = (actor: PolicyActor) => has(actor, "canManageRoles");
export const accessProfilesManage = roleManage;
export const informationAccessManage = roleManage;
export const accountProvision = roleManage;
export const accountActivateReserved = roleManage;
export const accountActivateBulk = organizationAdmin;
export const topicManage = organizationAdmin;
export const departmentManage = organizationAdmin;
export const auditView = (actor: PolicyActor) => has(actor, "canViewAudit");
export const telegramConfigure = (actor: PolicyActor) => has(actor, "canConfigure");

/** Whole-system organization scope: role managers and "all" viewers. */
export function organizationSystemWide(actor: PolicyActor) {
  return managesRoles(actor) || actor.permissions.viewScope === "all";
}

/** Staff and branch listings are not narrowed to the actor's organization subtree. */
export function directoryGlobalScope(actor: PolicyActor) {
  return actor.permissions.viewScope === "all" || managesRoles(actor) || Boolean(actor.permissions.canConfigure);
}

export function organizationInScope(inScope: boolean, message = ORGANIZATION_OUT_OF_SCOPE): Decision {
  return when(inScope, message);
}

// ── Organizations and departments ──────────────────────────────────────────

/** A territorial admin may only add districts under their own organization. */
export function organizationCreate(actor: PolicyActor, target: { type: string; parentId: number | null; parentInScope: boolean }): Decision {
  if (organizationSystemWide(actor)) return ALLOW;
  return when(
    target.type === "district" && target.parentId === actor.organizationId && target.parentInScope,
    "Hududiy administrator faqat o‘z boshqarmasiga tegishli tuman tashkilotini yaratishi mumkin",
  );
}

export function organizationUpdate(inScope: boolean): Decision {
  return when(inScope, "Bu tashkilot vakolat doirangizga kirmaydi");
}

export function departmentUpdate(target: { nextOrganizationInScope: boolean; currentOrganizationInScope: boolean }): Decision {
  return when(target.nextOrganizationInScope && target.currentOrganizationInScope, "Bu bo‘lim vakolat doirangizga kirmaydi");
}

// ── Employees ──────────────────────────────────────────────────────────────

/** Titles implying approval rights may only be stored by role managers (Y3b). */
export function positionAssign(actor: PolicyActor, target: { raisesAccess: boolean; changed: boolean }): Decision {
  return when(managesRoles(actor) || !target.changed || !target.raisesAccess, POSITION_RAISES_ACCESS);
}

export function employeeCreate(actor: PolicyActor, target: { organizationInScope: boolean; roleCode: string; positionRaisesAccess: boolean }): Decision {
  return all(
    organizationInScope(target.organizationInScope),
    when(managesRoles(actor) || target.roleCode === "xodim", "Rol tanlash uchun rollarni boshqarish vakolati kerak"),
    positionAssign(actor, { raisesAccess: target.positionRaisesAccess, changed: true }),
  );
}

/** May the actor open this employee record for editing at all. */
export function employeeManage(actor: PolicyActor, target: { inScope: boolean; roleCode: string }): Decision {
  return all(
    when(target.inScope, "Bu xodim vakolat doirangizga kirmaydi"),
    when(target.roleCode === "xodim" || managesRoles(actor), "Rahbariyat akkauntlarini o‘zgartirish uchun rollarni boshqarish vakolati kerak"),
  );
}

export function employeeChangeEmail(actor: PolicyActor, changed: boolean): Decision {
  return when(!changed || managesRoles(actor), "Tizimga kirish emailini o‘zgartirish uchun rollarni boshqarish vakolati kerak");
}

export function employeeChangeRole(actor: PolicyActor, changed: boolean): Decision {
  return when(!changed || managesRoles(actor), "Xodim rolini o‘zgartirish uchun rollarni boshqarish vakolati kerak");
}

export function employeeAssignRole(actor: PolicyActor, nextRoleCode: string): Decision {
  return when(managesRoles(actor) || nextRoleCode === "xodim", "Siz faqat xodim rolini biriktira olasiz");
}

export function employeeDeactivate(actor: PolicyActor, target: { employeeId: number; active: boolean }): Decision {
  return when(target.active || target.employeeId !== actor.id, "O‘z akkauntingizni faolsizlantira olmaysiz", 409);
}

/**
 * Setting someone else's login/password takes over their account; for anyone
 * holding more than the personal profile this needs role management (Y3a).
 */
export function employeeResetCredentials(actor: PolicyActor, target: { employeeId: number; requested: boolean; elevated: boolean }): Decision {
  return when(
    !target.requested || target.employeeId === actor.id || managesRoles(actor) || !target.elevated,
    "Kengaytirilgan vakolatli xodimning login-parolini faqat rollarni boshqarish vakolati bor administrator o‘zgartiradi",
  );
}

// ── Accounts ───────────────────────────────────────────────────────────────

/** Activation links go to ordinary employees only, never to the SSO owner (K2). */
export function accountActivate(actor: PolicyActor, target: { inScope: boolean; roleCode: string; ownerBound: boolean }): Decision {
  return all(
    when(target.inScope, ORGANIZATION_OUT_OF_SCOPE),
    when(!target.ownerBound, "Tizim egasi akkauntiga faollashtirish havolasi berilmaydi"),
    when(target.roleCode === "xodim" || managesRoles(actor), "Rahbariyat akkauntini faollashtirish uchun rollarni boshqarish vakolati kerak"),
  );
}

/** Bulk (re)issue never hands out administrator, owner or self passwords (Y3c). */
export function accountProvisionTarget(actor: PolicyActor, target: { employeeId: number; roleCode: string; ownerBound: boolean }): Decision {
  return when(target.roleCode !== "admin" && !target.ownerBound && target.employeeId !== actor.id, BULK_ADMIN_SKIPPED);
}

// ── Telegram ───────────────────────────────────────────────────────────────

/** The link's opener receives the employee's notifications, so linking others is a role-manager action (Y13). */
export function telegramLinkFor(actor: PolicyActor, employeeId: number): Decision {
  return when(
    employeeId === actor.id || managesRoles(actor),
    "Boshqa xodim uchun havola yaratish vakolatingiz yo‘q. Xodim havolani o‘z akkauntidan yaratadi",
  );
}

export function telegramTestFor(actor: PolicyActor, employeeId: number): Decision {
  return when(employeeId === actor.id || Boolean(actor.permissions.canConfigure), "Boshqa xodimga sinov yuborish vakolatingiz yo‘q");
}

// ── Staff register and directory ───────────────────────────────────────────

export function staffView(actor: PolicyActor): Decision {
  return when(
    Boolean(actor.permissions.canManageOrganization || actor.permissions.canManageReports || actor.permissions.canManageRoles),
    "Shtatlar reestrini ko‘rish vakolatingiz yo‘q",
  );
}

export function staffOrganizationView(inScope: boolean): Decision {
  return when(inScope, "Tashkilot vakolat doirangizga kirmaydi");
}

export function canViewLoginConfigured(actor: PolicyActor) {
  return Boolean(actor.permissions.canManageOrganization || managesRoles(actor));
}

export function canViewEmployeeContacts(actor: PolicyActor) {
  return canViewLoginConfigured(actor) || actor.permissions.viewScope === "all";
}
