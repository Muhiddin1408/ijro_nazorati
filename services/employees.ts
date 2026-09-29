/**
 * Employee administration: creating and editing employees with their profile,
 * credentials and automatic access profiles. Authorization decisions come from
 * lib/policy/admin.ts; this module resolves the facts they need and performs
 * the writes. Errors are ApiError with user-facing Uzbek messages.
 */
import { getD1 } from "../db";
import { ApiError, audit, organizationScopeIds, type Actor } from "../lib/auth";
import { automaticAccessProfileRefreshStatements, inferAccessProfileCode, refreshAutomaticAccessProfileAssignment } from "../lib/access-control";
import { hashPassword, normalizeUsername, PASSWORD_ITERATIONS, validatePassword, validateUsername } from "../lib/password";
import { authorize } from "../lib/policy";
import {
  employeeAssignRole, employeeChangeEmail, employeeChangeRole, employeeCreate, employeeDeactivate, employeeManage,
  employeeResetCredentials, organizationInScope, positionAssign,
} from "../lib/policy/admin";

const TEMPORARY_PASSWORD_DAYS = 30;

/** app_employees joined with role code and profile, as read for editing. */
export type EmployeeEditRow = {
  id: number;
  full_name: string;
  email: string | null;
  position: string | null;
  role_id: number;
  role_code: string;
  department_id: number | null;
  organization_id: number | null;
  manager_id: number | null;
  active: number;
  full_name_cyrillic: string | null;
  birth_date: string | null;
  internal_extension: string | null;
  mobile_phone: string | null;
};

type CredentialRow = { employee_id: number; username: string };

export type EmployeeProfileInput = {
  fullNameCyrillic: string | null;
  birthDate: string | null;
  internalExtension: string | null;
  mobilePhone: string | null;
};

function temporaryPasswordExpiresAt() {
  return new Date(Date.now() + TEMPORARY_PASSWORD_DAYS * 24 * 60 * 60_000).toISOString();
}

function nullableNumber(value: unknown) {
  return value == null ? null : Number(value);
}

/**
 * A position title can imply approval rights (e.g. "Direktor" → territorial
 * leadership). Only role managers may store such titles, otherwise a later,
 * unrelated edit by a role manager would silently grant them.
 */
export function positionRaisesAccess(organizationType: string, position: string) {
  const base = inferAccessProfileCode({ roleCode: "xodim", organizationType, position: "" });
  const next = inferAccessProfileCode({ roleCode: "xodim", organizationType, position });
  return next !== base && !next.endsWith("_editor");
}

async function organizationType(db: D1Database, organizationId: number) {
  const row = await db.prepare("SELECT type FROM app_organizations WHERE id=?").bind(organizationId).first<{ type: string }>();
  return String(row?.type ?? "");
}

/**
 * Whether the employee holds anything beyond the default personal profile,
 * directly or through an occupied staff position.
 */
export async function hasElevatedAccess(db: D1Database, employeeId: number) {
  const row = await db.prepare(
    `SELECT 1 AS found WHERE EXISTS (
       SELECT 1 FROM app_access_profile_assignments a JOIN app_access_profiles p ON p.id=a.access_profile_id
        WHERE a.active=1 AND p.code!='employee_personal'
          AND ((a.principal_type='employee' AND a.principal_id=?)
            OR (a.principal_type='staff_position' AND a.principal_id IN
                 (SELECT staff_position_id FROM app_position_occupancies WHERE employee_id=? AND ends_at IS NULL)))
     ) OR EXISTS (
       SELECT 1 FROM app_information_domain_assignments d
        WHERE d.active=1
          AND ((d.principal_type='employee' AND d.principal_id=?)
            OR (d.principal_type='staff_position' AND d.principal_id IN
                 (SELECT staff_position_id FROM app_position_occupancies WHERE employee_id=? AND ends_at IS NULL)))
     ) OR EXISTS (SELECT 1 FROM app_owner_identities WHERE employee_id=?)`,
  ).bind(employeeId, employeeId, employeeId, employeeId, employeeId).first();
  return Boolean(row);
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function profileText(payload: Record<string, unknown>, key: string, existing: unknown, maxLength: number) {
  if (payload[key] === undefined) return existing == null ? null : String(existing);
  const value = String(payload[key] ?? "").trim();
  return value ? value.slice(0, maxLength) : null;
}

export function employeeProfileInput(payload: Record<string, unknown>, existing: Partial<EmployeeEditRow> = {}): EmployeeProfileInput {
  const birthDate = profileText(payload, "birthDate", existing.birth_date, 10);
  if (birthDate) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
    const year = Number(match?.[1]);
    const month = Number(match?.[2]);
    const day = Number(match?.[3]);
    const parsed = match ? new Date(Date.UTC(year, month - 1, day)) : null;
    if (!parsed || parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
      throw new ApiError(400, "Tug‘ilgan sana noto‘g‘ri kiritilgan");
    }
  }
  const internalExtension = profileText(payload, "internalExtension", existing.internal_extension, 10);
  if (internalExtension && !/^\d{1,10}$/.test(internalExtension)) {
    throw new ApiError(400, "Ichki telefon faqat raqamlardan iborat bo‘lishi kerak");
  }
  const rawPhone = profileText(payload, "mobilePhone", existing.mobile_phone, 32);
  let mobilePhone: string | null = null;
  if (rawPhone) {
    const digits = rawPhone.replace(/\D/g, "");
    if (digits.length === 9) mobilePhone = `+998${digits}`;
    else if (digits.length === 12 && digits.startsWith("998")) mobilePhone = `+${digits}`;
    else throw new ApiError(400, "Telefon raqamini +998901234567 ko‘rinishida kiriting");
  }
  return {
    fullNameCyrillic: profileText(payload, "fullNameCyrillic", existing.full_name_cyrillic, 240),
    birthDate,
    internalExtension,
    mobilePhone,
  };
}

function profileUpsert(db: D1Database, employeeId: number, profile: EmployeeProfileInput) {
  return db.prepare(
    `INSERT INTO app_employee_profiles (employee_id,full_name_cyrillic,birth_date,internal_extension,mobile_phone)
     VALUES (?,?,?,?,?)
     ON CONFLICT(employee_id) DO UPDATE SET
       full_name_cyrillic=excluded.full_name_cyrillic,birth_date=excluded.birth_date,
       internal_extension=excluded.internal_extension,mobile_phone=excluded.mobile_phone,updated_at=CURRENT_TIMESTAMP`,
  ).bind(employeeId, profile.fullNameCyrillic, profile.birthDate, profile.internalExtension, profile.mobilePhone);
}

function credentialInsert(db: D1Database, employeeId: number, username: string, secret: { hash: string; salt: string; iterations: number }) {
  return db.prepare(
    `INSERT INTO app_user_credentials
      (employee_id,username,username_normalized,password_hash,password_salt,password_iterations,must_change_password,temporary_expires_at)
     VALUES (?,?,?,?,?,?,1,?)`,
  ).bind(employeeId, username, normalizeUsername(username), secret.hash, secret.salt, secret.iterations, temporaryPasswordExpiresAt());
}

async function validateRelations(db: D1Database, roleId: number, departmentId: number | null, organizationId: number | null, managerId: number | null, employeeId?: number) {
  const role = await db.prepare("SELECT id, code FROM app_roles WHERE id=? AND active=1").bind(roleId).first<{ id: number; code: string }>();
  if (!role) throw new ApiError(400, "Tanlangan rol mavjud emas yoki faol emas");
  if (departmentId != null) {
    const department = await db.prepare("SELECT id,organization_id FROM app_departments WHERE id=? AND active=1").bind(departmentId).first<{ id: number; organization_id: number | null }>();
    if (!department) throw new ApiError(400, "Tanlangan bo‘lim mavjud emas yoki faol emas");
    if (organizationId != null && department.organization_id != null && Number(department.organization_id) !== organizationId) {
      throw new ApiError(400, "Tanlangan bo‘lim xodim tashkilotiga tegishli emas");
    }
  }
  if (organizationId != null) {
    const organization = await db.prepare("SELECT id FROM app_organizations WHERE id=? AND active=1").bind(organizationId).first();
    if (!organization) throw new ApiError(400, "Tanlangan tashkilot mavjud emas yoki faol emas");
  }
  if (managerId != null) {
    if (managerId === employeeId) throw new ApiError(400, "Xodim o‘ziga rahbar bo‘la olmaydi");
    const manager = await db.prepare("SELECT id,organization_id FROM app_employees WHERE id=? AND active=1").bind(managerId)
      .first<{ id: number; organization_id: number | null }>();
    if (!manager) throw new ApiError(400, "Tanlangan rahbar mavjud emas yoki faol emas");
    if (organizationId != null && Number(manager.organization_id) !== organizationId) {
      throw new ApiError(400, "Tanlangan rahbar xodim bilan bir tashkilotda bo‘lishi kerak");
    }
    if (employeeId) {
      const cycle = await db.prepare(
        `WITH RECURSIVE managers(id,manager_id) AS (
           SELECT id,manager_id FROM app_employees WHERE id=?
           UNION SELECT parent.id,parent.manager_id FROM app_employees parent JOIN managers child ON parent.id=child.manager_id
         ) SELECT id FROM managers WHERE id=? LIMIT 1`,
      ).bind(managerId, employeeId).first();
      if (cycle) throw new ApiError(400, "Rahbarlik zanjirida aylana hosil bo‘ladi");
    }
  }
  return role;
}

/** Access refresh never derives rights from a title stored by a non-role-manager. */
function trustedPosition(actor: Actor, position: string) {
  return actor.permissions.canManageRoles ? position : "";
}

export async function createEmployee(actor: Actor, payload: Record<string, unknown>) {
  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const roleId = Number(payload.roleId);
  const username = String(payload.username ?? "").trim();
  const password = String(payload.password ?? "");
  const position = String(payload.position ?? "");
  const createCredentials = Boolean(username || password);
  const departmentId = payload.departmentId ? Number(payload.departmentId) : null;
  const organizationId = payload.organizationId ? Number(payload.organizationId) : null;
  const managerId = payload.managerId ? Number(payload.managerId) : null;
  const profile = employeeProfileInput(payload);
  if (name.length < 3 || !roleId) throw new ApiError(400, "F.I.Sh. va rol to‘liq kiritilishi kerak");
  if (email && !validEmail(email)) throw new ApiError(400, "Email manzili noto‘g‘ri kiritilgan");
  if (createCredentials && (!username || !password)) throw new ApiError(400, "Login va parolni birga kiriting yoki xavfsiz faollashtirishni tanlang");
  if (createCredentials && !validateUsername(username)) throw new ApiError(400, "Login 4–32 belgi: lotin harfi bilan boshlanib, raqam, nuqta, chiziq ishlatilishi mumkin");
  const passwordError = createCredentials ? validatePassword(password) : null;
  if (passwordError) throw new ApiError(400, passwordError);
  const db = await getD1();
  const selectedRole = await validateRelations(db, roleId, departmentId, organizationId, managerId);
  const organizationScope = new Set(await organizationScopeIds(actor, actor.permissions.canManageRoles));
  const inScope = Boolean(organizationId && organizationScope.has(organizationId));
  await authorize(employeeCreate(actor, {
    organizationInScope: inScope,
    roleCode: selectedRole.code,
    positionRaisesAccess: inScope && positionRaisesAccess(await organizationType(db, organizationId!), position),
  }));
  const orgId = organizationId!;
  const secret = createCredentials ? await hashPassword(password, undefined, PASSWORD_ITERATIONS) : null;
  if (email && createCredentials) {
    const recoverable = await db.prepare(
      `SELECT e.id FROM app_employees e
        LEFT JOIN app_user_credentials c ON c.employee_id=e.id
       WHERE lower(e.email)=? AND e.organization_id=? AND e.created_by_employee_id=?
         AND e.active=1 AND c.employee_id IS NULL
       ORDER BY e.id DESC LIMIT 1`,
    ).bind(email, orgId, actor.id).first<{ id: number }>();
    if (recoverable) {
      const employeeId = Number(recoverable.id);
      // The recovered row already exists: re-check the manager chain against its id.
      await validateRelations(db, roleId, departmentId, orgId, managerId, employeeId);
      const accessRefresh = await automaticAccessProfileRefreshStatements({
        principalType: "employee", principalId: employeeId, roleCode: selectedRole.code,
        organizationType: await organizationType(db, orgId),
        organizationId: orgId, departmentId,
        position: trustedPosition(actor, position),
      }, actor.id);
      await db.batch([
        db.prepare(
          `UPDATE app_employees SET full_name=?,position=?,role_id=?,department_id=?,organization_id=?,
            manager_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        ).bind(name, position, roleId, departmentId, orgId, managerId, employeeId),
        credentialInsert(db, employeeId, username, secret!),
        db.prepare("UPDATE app_account_activation_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE employee_id=? AND used_at IS NULL AND revoked_at IS NULL").bind(employeeId),
        profileUpsert(db, employeeId, profile),
        ...accessRefresh.statements,
      ]);
      try {
        await audit(actor, "employee.recovered", "employee", employeeId, { name, email, roleId, username });
      } catch (auditError) {
        console.error("Employee recovery audit log failed", auditError);
      }
      return { id: employeeId, recovered: true as const };
    }
  }
  const result = await db.prepare(
    `INSERT INTO app_employees
      (full_name, email, position, role_id, department_id, organization_id, manager_id, active, created_by_employee_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
  ).bind(name, email || null, position, roleId, departmentId, orgId, managerId, actor.id).run();
  const employeeId = Number(result.meta.last_row_id);
  try {
    const setupStatements = [profileUpsert(db, employeeId, profile)];
    if (createCredentials) setupStatements.push(credentialInsert(db, employeeId, username, secret!));
    await db.batch(setupStatements);
    const organization = await db.prepare("SELECT type FROM app_organizations WHERE id=? AND active=1")
      .bind(orgId).first<{ type: string }>();
    if (!organization) throw new ApiError(400, "Xodim tashkiloti topilmadi");
    await refreshAutomaticAccessProfileAssignment({
      principalType: "employee", principalId: employeeId, roleCode: selectedRole.code,
      organizationType: String(organization.type), organizationId: orgId, departmentId,
      position: trustedPosition(actor, position),
    }, actor.id);
  } catch (error) {
    await db.batch([
      db.prepare("DELETE FROM app_access_profile_assignments WHERE principal_type='employee' AND principal_id=?").bind(employeeId),
      db.prepare("DELETE FROM app_user_credentials WHERE employee_id=?").bind(employeeId),
      db.prepare("DELETE FROM app_employee_profiles WHERE employee_id=?").bind(employeeId),
      db.prepare("DELETE FROM app_employees WHERE id=?").bind(employeeId),
    ]);
    throw error;
  }
  try {
    await audit(actor, "employee.created", "employee", employeeId, { name, email: email || null, roleId, username: createCredentials ? username : null, activationRequired: !createCredentials });
  } catch (auditError) {
    console.error("Employee audit log failed", auditError);
  }
  return { id: employeeId };
}

export async function updateEmployee(actor: Actor, payload: Record<string, unknown>) {
  const id = Number(payload.id);
  if (!id) throw new ApiError(400, "Xodim ID majburiy");
  const db = await getD1();
  const employee = await db.prepare(
    `SELECT e.id,e.full_name,e.email,e.position,e.role_id,e.department_id,e.organization_id,e.manager_id,e.active,
            r.code AS role_code,profile.full_name_cyrillic,profile.birth_date,
            profile.internal_extension,profile.mobile_phone
       FROM app_employees e JOIN app_roles r ON r.id=e.role_id
       LEFT JOIN app_employee_profiles profile ON profile.employee_id=e.id
      WHERE e.id=?`,
  ).bind(id).first<EmployeeEditRow>();
  if (!employee) throw new ApiError(404, "Xodim topilmadi");
  const organizationScope = new Set(await organizationScopeIds(actor, actor.permissions.canManageRoles));
  await authorize(employeeManage(actor, {
    inScope: employee.organization_id != null && organizationScope.has(Number(employee.organization_id)),
    roleCode: String(employee.role_code),
  }));

  const currentEmail = String(employee.email ?? "").trim().toLowerCase();
  const name = String(payload.name ?? employee.full_name).trim();
  const email = payload.email === undefined ? currentEmail : String(payload.email ?? "").trim().toLowerCase();
  const roleId = Number(payload.roleId ?? employee.role_id);
  const departmentId = payload.departmentId === null ? null : payload.departmentId ? Number(payload.departmentId) : nullableNumber(employee.department_id);
  const organizationId = payload.organizationId === null ? null : payload.organizationId ? Number(payload.organizationId) : nullableNumber(employee.organization_id);
  const managerId = payload.managerId === null ? null : payload.managerId ? Number(payload.managerId) : nullableNumber(employee.manager_id);
  const active = payload.active == null ? Boolean(employee.active) : Boolean(payload.active);
  const username = payload.username == null ? null : String(payload.username).trim();
  const password = String(payload.password ?? "");
  const profile = employeeProfileInput(payload, employee);
  if (username !== null && !validateUsername(username)) throw new ApiError(400, "Login 4–32 belgi: lotin harfi bilan boshlanishi kerak");
  if (password) {
    const passwordError = validatePassword(password);
    if (passwordError) throw new ApiError(400, passwordError);
  }
  await authorize(employeeChangeEmail(actor, email !== String(employee.email ?? "").toLowerCase()));
  await authorize(employeeChangeRole(actor, roleId !== Number(employee.role_id)));
  await authorize(organizationInScope(Boolean(organizationId && organizationScope.has(organizationId))));
  const orgId = organizationId!;
  await authorize(employeeDeactivate(actor, { employeeId: id, active }));
  if (name.length < 3) throw new ApiError(400, "F.I.Sh. kamida 3 belgidan iborat bo‘lishi kerak");
  if (email && !validEmail(email)) throw new ApiError(400, "Email manzili noto‘g‘ri kiritilgan");
  if (!active) {
    const related = await db.prepare(
      `SELECT
        (SELECT COUNT(*) FROM app_employees WHERE manager_id=? AND active=1) AS reports,
        (SELECT COUNT(*) FROM app_task_assignments a JOIN app_tasks t ON t.id=a.task_id
          WHERE a.employee_id=? AND t.archived=0 AND t.status!='Bajarildi') AS tasks,
        (SELECT COUNT(*) FROM app_report_assignments WHERE responsible_employee_id=? AND status NOT IN ('approved')) AS report_assignments`,
    ).bind(id, id, id).first<{ reports: number; tasks: number; report_assignments: number }>();
    if (Number(related?.reports ?? 0) > 0) throw new ApiError(409, "Avval ushbu xodimga bo‘ysunuvchi xodimlarni boshqa rahbarga o‘tkazing");
    if (Number(related?.tasks ?? 0) || Number(related?.report_assignments ?? 0)) {
      throw new ApiError(409, "Avval xodimning ochiq topshiriq va hisobotlarini boshqa mas’ulga o‘tkazing");
    }
  }

  const position = String(payload.position ?? employee.position ?? "");
  const positionOrOrganizationChanged = position !== String(employee.position ?? "")
    || orgId !== nullableNumber(employee.organization_id);
  await authorize(positionAssign(actor, {
    changed: positionOrOrganizationChanged,
    raisesAccess: positionOrOrganizationChanged && !actor.permissions.canManageRoles
      && positionRaisesAccess(await organizationType(db, orgId), position),
  }));
  const credentialUpdateRequested = username !== null || Boolean(password);
  await authorize(employeeResetCredentials(actor, {
    employeeId: id,
    requested: credentialUpdateRequested,
    elevated: credentialUpdateRequested && id !== actor.id && !actor.permissions.canManageRoles && await hasElevatedAccess(db, id),
  }));

  const nextRole = await db.prepare("SELECT code FROM app_roles WHERE id=? AND active=1").bind(roleId).first<{ code: string }>();
  if (!nextRole) throw new ApiError(400, "Tanlangan rol faol emas");
  await authorize(employeeAssignRole(actor, nextRole.code));
  if (String(employee.role_code) === "admin" && (!active || nextRole.code !== "admin")) {
    const count = await db.prepare(
      `SELECT COUNT(*) AS count FROM app_employees e JOIN app_roles r ON r.id=e.role_id WHERE r.code='admin' AND e.active=1`,
    ).first<{ count: number }>();
    if (Number(count?.count ?? 0) <= 1) throw new ApiError(409, "Tizimda kamida bitta faol administrator qolishi shart");
  }
  await validateRelations(db, roleId, departmentId, orgId, managerId, id);
  const currentCredential = credentialUpdateRequested
    ? await db.prepare("SELECT employee_id,username FROM app_user_credentials WHERE employee_id=?").bind(id).first<CredentialRow>()
    : null;
  if (credentialUpdateRequested && !currentCredential && (!username || !password)) {
    throw new ApiError(400, "Akkaunt uchun login va vaqtinchalik parolni birga kiriting");
  }
  const nextSecret = password ? await hashPassword(password, undefined, PASSWORD_ITERATIONS) : null;
  const accessScopeChanged = roleId !== Number(employee.role_id)
    || departmentId !== nullableNumber(employee.department_id)
    || orgId !== nullableNumber(employee.organization_id)
    || position !== String(employee.position ?? "")
    || active !== Boolean(employee.active);
  const accessRefresh = active && (actor.permissions.canManageRoles || accessScopeChanged)
    ? await automaticAccessProfileRefreshStatements({
        principalType: "employee", principalId: id, roleCode: nextRole.code,
        organizationType: await organizationType(db, orgId),
        organizationId: orgId, departmentId,
        position: trustedPosition(actor, position),
      }, actor.id)
    : null;
  const statements = [db.prepare(
    `UPDATE app_employees SET full_name=?, email=?, position=?, role_id=?, department_id=?, organization_id=?, manager_id=?, active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
  ).bind(name, email || null, position, roleId, departmentId, orgId, managerId, active ? 1 : 0, id), profileUpsert(db, id, profile)];
  if (!active) {
    statements.push(
      db.prepare("UPDATE app_telegram_accounts SET notifications_enabled=0, blocked_at=COALESCE(blocked_at,CURRENT_TIMESTAMP) WHERE employee_id=?").bind(id),
      db.prepare("DELETE FROM app_telegram_link_tokens WHERE employee_id=? AND used_at IS NULL").bind(id),
      db.prepare("DELETE FROM app_sessions WHERE employee_id=?").bind(id),
      db.prepare(`UPDATE app_notification_jobs SET status='cancelled', last_error='Xodim faolsizlantirildi'
        WHERE recipient_employee_id=? AND status IN ('pending','failed','waiting_link','processing')`).bind(id),
    );
  }
  if (accessRefresh) statements.push(...accessRefresh.statements);
  if (!active) {
    statements.push(db.prepare(
      "UPDATE app_access_profile_assignments SET active=0,updated_at=CURRENT_TIMESTAMP WHERE principal_type='employee' AND principal_id=?",
    ).bind(id));
  }
  if (credentialUpdateRequested) {
    if (currentCredential) {
      if (nextSecret) {
        const nextUsername = username ?? String(currentCredential.username);
        statements.push(db.prepare(
          `UPDATE app_user_credentials SET username=?,username_normalized=?,password_hash=?,password_salt=?,
            password_iterations=?,must_change_password=1,temporary_expires_at=?,failed_attempts=0,locked_until=NULL,
            password_updated_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE employee_id=?`,
        ).bind(nextUsername, normalizeUsername(nextUsername), nextSecret.hash, nextSecret.salt, nextSecret.iterations, temporaryPasswordExpiresAt(), id),
        db.prepare("DELETE FROM app_sessions WHERE employee_id=?").bind(id),
        db.prepare("UPDATE app_account_activation_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE employee_id=? AND used_at IS NULL AND revoked_at IS NULL").bind(id));
      } else if (username) {
        statements.push(db.prepare("UPDATE app_user_credentials SET username=?,username_normalized=?,updated_at=CURRENT_TIMESTAMP WHERE employee_id=?")
          .bind(username, normalizeUsername(username), id));
      }
    } else {
      statements.push(credentialInsert(db, id, username!, nextSecret!));
    }
  }
  statements.push(db.prepare(
    "INSERT INTO app_audit_logs (actor_employee_id, action, entity_type, entity_id, detail_json) VALUES (?, ?, ?, ?, ?)",
  ).bind(actor.id, "employee.updated", "employee", id, JSON.stringify({ name, email: email || null, roleId, active, loginUpdated: credentialUpdateRequested })));
  await db.batch(statements);
  return { ok: true as const };
}
