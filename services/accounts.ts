/**
 * Account lifecycle: password login with throttling, password change,
 * activation links, one-time bulk provisioning. Routes only parse the request,
 * authorize the coarse capability and turn results into HTTP responses.
 */
import { getD1 } from "../db";
import { ApiError, audit, organizationScopeIds, type Actor } from "../lib/auth";
import { applicationRoleForProfile, inferAccessProfileCode, type AccessProfile } from "../lib/access-control";
import {
  dummyVerifyPassword, hashPassword, needsRehash, normalizeUsername, PASSWORD_ITERATIONS, PasswordResetRequiredError,
  randomSessionToken, randomTemporaryPassword, sha256, validatePassword, validateUsername, verifyPassword,
} from "../lib/password";
import { accountActivate, accountProvisionTarget } from "../lib/policy/admin";
import { SQL_NOW_ISO } from "../lib/sql-time";

type Db = Awaited<ReturnType<typeof getD1>>;

// ── Attempt throttling ─────────────────────────────────────────────────────

// Limits per 15-minute window. A single IP may fail 5 times for one login; the
// account-wide limit is deliberately much higher so an outsider guessing a
// leader's login cannot lock the real owner out from every other network.
export const LOGIN_WINDOW_MINUTES = 15;
export const PAIR_LIMIT = 5;
// Offices share one NAT address, so the IP limit is generous and successful
// logins give their reserved attempt back.
export const IP_LIMIT = 100;
export const ACCOUNT_LIMIT = 50;
/** Wrong current-password guesses per signed-in employee and window. */
export const PASSWORD_CHANGE_LIMIT = 5;

/** Atomically counts one attempt for the key and returns the count inside the current window. */
async function reserveAttempt(db: Db, key: string) {
  const row = await db.prepare(
    `INSERT INTO app_login_attempts (key,window_start,attempts) VALUES (?,CURRENT_TIMESTAMP,1)
     ON CONFLICT(key) DO UPDATE SET
       attempts=CASE WHEN window_start<=datetime('now','-${LOGIN_WINDOW_MINUTES} minutes') THEN 1 ELSE attempts+1 END,
       window_start=CASE WHEN window_start<=datetime('now','-${LOGIN_WINDOW_MINUTES} minutes') THEN CURRENT_TIMESTAMP ELSE window_start END
     RETURNING attempts`,
  ).bind(key).first<{ attempts: number }>();
  return Number(row?.attempts ?? 0);
}

// ── Login ──────────────────────────────────────────────────────────────────

type LoginCredentialRow = {
  employee_id: number;
  password_hash: string;
  password_salt: string;
  password_iterations: number;
  must_change_password: number;
  temporary_expires_at: string | null;
  locked_until: string | null;
  active: number;
};

export type LoginResult = { token: string; maxAge: number; mustChangePassword: boolean };

export async function loginWithPassword(input: { username: unknown; password: unknown; remember: unknown; ip: string }): Promise<LoginResult> {
  const username = normalizeUsername(String(input.username ?? ""));
  const password = String(input.password ?? "");
  if (!username || !password) throw new ApiError(400, "Login va parolni kiriting");
  const db = await getD1();
  const { ip } = input;
  // Reserve before any credential lookup: the check and the increment are one
  // statement, so concurrent guesses are counted even before verification.
  const ipAttempts = await reserveAttempt(db, `ip:${ip}`);
  const pairAttempts = await reserveAttempt(db, `pair:${ip}|${username}`);
  const accountAttempts = await reserveAttempt(db, `account:${username}`);
  if (ipAttempts > IP_LIMIT) throw new ApiError(429, "Juda ko‘p urinish bo‘ldi. 15 daqiqadan so‘ng qayta kiring");
  if (pairAttempts > PAIR_LIMIT || accountAttempts > ACCOUNT_LIMIT) {
    throw new ApiError(423, "Ko‘p marta noto‘g‘ri urinish bo‘ldi. 15 daqiqadan so‘ng qayta kiring");
  }
  const credential = await db.prepare(
    `SELECT c.employee_id,c.password_hash,c.password_salt,c.password_iterations,c.must_change_password,
            c.temporary_expires_at,c.locked_until,e.active
       FROM app_user_credentials c
       JOIN app_employees e ON e.id=c.employee_id
      WHERE c.username_normalized=? LIMIT 1`,
  ).bind(username).first<LoginCredentialRow>();
  if (!credential || !Boolean(credential.active)) {
    // Same PBKDF2 cost as a real check, so timing does not reveal which logins exist.
    await dummyVerifyPassword(password);
    throw new ApiError(401, "Login yoki parol noto‘g‘ri");
  }
  if (credential.locked_until && new Date(String(credential.locked_until)) > new Date()) {
    throw new ApiError(423, "Ko‘p marta noto‘g‘ri urinish bo‘ldi. 15 daqiqadan so‘ng qayta kiring");
  }
  let valid = false;
  try {
    valid = await verifyPassword(password, String(credential.password_hash), String(credential.password_salt), Number(credential.password_iterations));
  } catch (error) {
    if (error instanceof PasswordResetRequiredError) throw new ApiError(409, "Ushbu akkaunt parolini administrator yangilashi kerak");
    throw error;
  }
  const employeeId = Number(credential.employee_id);
  if (!valid) {
    // Informational counter only; throttling lives in app_login_attempts and an
    // administrator-set locked_until is preserved.
    await db.prepare(
      `UPDATE app_user_credentials SET failed_attempts=failed_attempts+1,updated_at=CURRENT_TIMESTAMP WHERE employee_id=?`,
    ).bind(employeeId).run();
    throw new ApiError(401, "Login yoki parol noto‘g‘ri");
  }
  if (Boolean(credential.must_change_password) && credential.temporary_expires_at
    && new Date(String(credential.temporary_expires_at)) <= new Date()) {
    throw new ApiError(410, "Vaqtinchalik parol muddati tugagan. Administratordan yangi parol oling");
  }

  const token = randomSessionToken();
  const tokenHash = await sha256(token);
  const maxAge = Boolean(input.remember) ? 30 * 24 * 60 * 60 : 12 * 60 * 60;
  const expiresAt = new Date(Date.now() + maxAge * 1000).toISOString();
  const statements = [
    db.prepare(`DELETE FROM app_sessions WHERE expires_at<=${SQL_NOW_ISO}`),
    db.prepare("DELETE FROM app_sessions WHERE employee_id=? AND created_at<datetime('now','-30 days')").bind(employeeId),
    db.prepare("INSERT INTO app_sessions (token_hash,employee_id,expires_at) VALUES (?,?,?)").bind(tokenHash, employeeId, expiresAt),
    db.prepare("UPDATE app_user_credentials SET failed_attempts=0,locked_until=NULL,updated_at=CURRENT_TIMESTAMP WHERE employee_id=?").bind(employeeId),
    db.prepare("DELETE FROM app_login_attempts WHERE key IN (?,?)").bind(`pair:${ip}|${username}`, `account:${username}`),
    db.prepare("UPDATE app_login_attempts SET attempts=MAX(attempts-1,0) WHERE key=?").bind(`ip:${ip}`),
    db.prepare("DELETE FROM app_login_attempts WHERE window_start<datetime('now','-1 day')"),
  ];
  if (needsRehash(Number(credential.password_iterations))) {
    // Transparent upgrade of legacy (100k) hashes to the current iteration count.
    const upgraded = await hashPassword(password, undefined, PASSWORD_ITERATIONS);
    statements.push(db.prepare(
      `UPDATE app_user_credentials SET password_hash=?,password_salt=?,password_iterations=?,
        password_updated_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE employee_id=?`,
    ).bind(upgraded.hash, upgraded.salt, upgraded.iterations, employeeId));
  }
  await db.batch(statements);
  return { token, maxAge, mustChangePassword: Boolean(credential.must_change_password) };
}

// ── Password change ────────────────────────────────────────────────────────

export async function changePassword(actor: Actor, input: { currentPassword: unknown; newPassword: unknown; username: unknown; sessionToken: string | null }) {
  const currentPassword = String(input.currentPassword ?? "");
  const nextPassword = String(input.newPassword ?? "");
  const username = String(input.username ?? "").trim();
  const invalid = validatePassword(nextPassword);
  if (invalid) throw new ApiError(400, invalid);
  const db = await getD1();
  const credential = await db.prepare(
    "SELECT employee_id,password_hash,password_salt,password_iterations FROM app_user_credentials WHERE employee_id=?",
  ).bind(actor.id).first<Pick<LoginCredentialRow, "employee_id" | "password_hash" | "password_salt" | "password_iterations">>();
  if (!credential) {
    if (!validateUsername(username)) throw new ApiError(400, "Login 4–32 belgi bo‘lib, lotin harfi bilan boshlanishi kerak");
    const next = await hashPassword(nextPassword, undefined, PASSWORD_ITERATIONS);
    await db.prepare(
      `INSERT INTO app_user_credentials
        (employee_id,username,username_normalized,password_hash,password_salt,password_iterations,must_change_password)
       VALUES (?,?,?,?,?,?,0)`,
    ).bind(actor.id, username, normalizeUsername(username), next.hash, next.salt, next.iterations).run();
    await audit(actor, "auth.credentials_claimed", "employee", actor.id, { username });
    return;
  }
  // A stolen session must not become an unlimited oracle for the current password.
  const attemptKey = `password:${actor.id}`;
  if (await reserveAttempt(db, attemptKey) > PASSWORD_CHANGE_LIMIT) {
    throw new ApiError(429, "Joriy parol ko‘p marta noto‘g‘ri kiritildi. 15 daqiqadan so‘ng qayta urinib ko‘ring");
  }
  let currentPasswordValid = false;
  try {
    currentPasswordValid = await verifyPassword(
      currentPassword, String(credential.password_hash), String(credential.password_salt), Number(credential.password_iterations),
    );
  } catch (error) {
    if (error instanceof PasswordResetRequiredError) throw new ApiError(409, "Ushbu akkaunt parolini administrator yangilashi kerak");
    throw error;
  }
  if (!currentPasswordValid) throw new ApiError(401, "Joriy parol noto‘g‘ri");
  const next = await hashPassword(nextPassword, undefined, PASSWORD_ITERATIONS);
  const currentTokenHash = input.sessionToken ? await sha256(input.sessionToken) : null;
  await db.batch([
    db.prepare(
      `UPDATE app_user_credentials SET password_hash=?,password_salt=?,password_iterations=?,
        must_change_password=0,failed_attempts=0,locked_until=NULL,password_updated_at=CURRENT_TIMESTAMP,
        temporary_expires_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE employee_id=?`,
    ).bind(next.hash, next.salt, next.iterations, actor.id),
    currentTokenHash
      ? db.prepare("DELETE FROM app_sessions WHERE employee_id=? AND token_hash<>?").bind(actor.id, currentTokenHash)
      : db.prepare("DELETE FROM app_sessions WHERE employee_id=?").bind(actor.id),
    db.prepare("DELETE FROM app_login_attempts WHERE key=?").bind(attemptKey),
  ]);
  await audit(actor, "auth.password_changed", "employee", actor.id);
}

// ── Activation links ───────────────────────────────────────────────────────

export async function activateAccount(input: { token: unknown; username: unknown; password: unknown }) {
  const token = String(input.token ?? "").trim();
  const username = String(input.username ?? "").trim();
  const password = String(input.password ?? "");
  if (token.length < 32) throw new ApiError(400, "Faollashtirish havolasi noto‘g‘ri");
  if (!validateUsername(username)) throw new ApiError(400, "Login 4–32 belgi: lotin harfi bilan boshlanishi kerak");
  const passwordError = validatePassword(password);
  if (passwordError) throw new ApiError(400, passwordError);
  const db = await getD1();
  const tokenHash = await sha256(token);
  const activation = await db.prepare(
    `SELECT t.id,t.employee_id,e.full_name FROM app_account_activation_tokens t
     JOIN app_employees e ON e.id=t.employee_id AND e.active=1
     WHERE t.token_hash=? AND t.used_at IS NULL AND t.revoked_at IS NULL AND t.expires_at>${SQL_NOW_ISO} LIMIT 1`,
  ).bind(tokenHash).first<{ id: number; employee_id: number; full_name: string }>();
  if (!activation) throw new ApiError(410, "Havola eskirgan, ishlatilgan yoki bekor qilingan");
  const exists = await db.prepare("SELECT employee_id FROM app_user_credentials WHERE username_normalized=? OR employee_id=? LIMIT 1")
    .bind(normalizeUsername(username), activation.employee_id).first();
  if (exists) throw new ApiError(409, "Bu login band yoki akkaunt allaqachon faollashtirilgan");
  const secret = await hashPassword(password, undefined, PASSWORD_ITERATIONS);
  await db.batch([
    db.prepare(
      `INSERT INTO app_user_credentials
        (employee_id,username,username_normalized,password_hash,password_salt,password_iterations,must_change_password)
       VALUES (?,?,?,?,?,?,0)`,
    ).bind(activation.employee_id, username, normalizeUsername(username), secret.hash, secret.salt, secret.iterations),
    db.prepare("UPDATE app_account_activation_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?").bind(activation.id),
    db.prepare("UPDATE app_account_activation_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE employee_id=? AND id!=? AND used_at IS NULL AND revoked_at IS NULL")
      .bind(activation.employee_id, activation.id),
  ]);
  await audit(null, "account.activated", "employee", activation.employee_id, { username });
  return { name: activation.full_name };
}

type ActivationCandidateRow = {
  id: number;
  full_name: string;
  organization_id: number | null;
  organization_name: string | null;
  role_code: string;
  owner_bound: number;
};

export type ActivationLink = { employeeId: number; name: string; organization: string; activationUrl: string; expiresAt: string };

export async function createActivationLinks(actor: Actor, employeeIds: unknown, origin: string) {
  const requestedIds = Array.from(new Set(Array.isArray(employeeIds) ? employeeIds.map(Number).filter(Boolean) : [])).slice(0, 250);
  if (!requestedIds.length) throw new ApiError(400, "Faollashtiriladigan xodimlarni tanlang");
  const allowedOrganizations = new Set(await organizationScopeIds(actor, actor.permissions.canManageRoles));
  const db = await getD1();
  const employees: ActivationCandidateRow[] = [];
  for (let index = 0; index < requestedIds.length; index += 80) {
    const ids = requestedIds.slice(index, index + 80);
    const result = await db.prepare(
      `SELECT e.id,e.full_name,e.organization_id,o.name AS organization_name,r.code AS role_code,
              EXISTS (SELECT 1 FROM app_owner_identities owner WHERE owner.employee_id=e.id) AS owner_bound
         FROM app_employees e
         JOIN app_roles r ON r.id=e.role_id
         LEFT JOIN app_organizations o ON o.id=e.organization_id
         LEFT JOIN app_user_credentials c ON c.employee_id=e.id
        WHERE e.active=1 AND c.employee_id IS NULL
          AND e.id IN (${ids.map(() => "?").join(",")})`,
    ).bind(...ids).all<ActivationCandidateRow>();
    employees.push(...result.results);
  }
  // Owner-SSO identities never receive activation links, and only actors who
  // may manage roles can activate anything above an ordinary employee (K2).
  const eligible = employees.filter((employee) => accountActivate(actor, {
    inScope: employee.organization_id != null && allowedOrganizations.has(Number(employee.organization_id)),
    roleCode: String(employee.role_code),
    ownerBound: Boolean(employee.owner_bound),
  }).allowed);
  if (!eligible.length) throw new ApiError(400, "Tanlangan xodimlarda faollashtiriladigan akkaunt topilmadi");
  const expiresAt = new Date(Date.now() + 72 * 60 * 60_000).toISOString();
  const links: ActivationLink[] = [];
  for (const employee of eligible) {
    const token = randomSessionToken();
    const tokenHash = await sha256(token);
    await db.batch([
      db.prepare("UPDATE app_account_activation_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE employee_id=? AND used_at IS NULL AND revoked_at IS NULL").bind(employee.id),
      db.prepare(
        `INSERT INTO app_account_activation_tokens (token_hash,employee_id,expires_at,created_by_employee_id)
         VALUES (?,?,?,?)`,
      ).bind(tokenHash, employee.id, expiresAt, actor.id),
    ]);
    links.push({
      employeeId: Number(employee.id),
      name: String(employee.full_name),
      organization: String(employee.organization_name ?? ""),
      activationUrl: `${origin}/?activate=${encodeURIComponent(token)}`,
      expiresAt,
    });
  }
  await audit(actor, "accounts.activation_bulk_created", "employee", null, { employeeIds: eligible.map((item) => item.id), count: eligible.length, expiresAt });
  return { links, expiresAt, skipped: requestedIds.length - eligible.length };
}

// ── One-time bulk provisioning ─────────────────────────────────────────────

type Row = Record<string, unknown>;
export type AccountKind = "employees" | "vacancies";
export type ProvisionedAccount = {
  accountKind: "employee" | "vacant_position";
  employeeId: number | null;
  staffPositionId: number | null;
  slotNumber: number | null;
  fullName: string;
  organization: string;
  department: string;
  position: string;
  username: string;
  temporaryPassword: string;
  roleCode: string;
  roleName: string;
  accessProfileCode: string;
  accessProfileName: string;
  canLogin: boolean;
  mustChangePassword: true;
};

type ProvisionEmployeeRow = {
  id: number;
  full_name: string;
  position: string | null;
  department_id: number | null;
  organization_id: number;
  organization_name: string;
  organization_type: string;
  department_name: string | null;
  role_code: string;
  role_name: string;
  credential_username: string | null;
  owner_bound: number;
};

type AccessProfileRow = {
  id: number; code: string; name: string; organization_type: string; view_scope: string; information_scope: string;
  can_enter_information: number; can_submit_information: number; can_verify_information: number;
  can_approve_information: number; can_view_all_information: number;
};

const MAX_PROVISION_COUNT = 100;
const MAX_EMPLOYEE_ACCOUNTS_PER_RESPONSE = 6;
const MAX_VACANCY_ACCOUNTS_PER_RESPONSE = 10;
const MAX_ATOMIC_STATEMENTS = 40;
const POSITION_CURSOR_FACTOR = 10_000;
const TEMPORARY_PASSWORD_DAYS = 30;

/** Thrown for provisioning input errors the route maps to HTTP 400. */
export class ProvisionInputError extends ApiError {
  constructor(message: string) {
    super(400, message);
  }
}

function safeIds(value: unknown, label: string) {
  if (!Array.isArray(value)) return [];
  const ids = [...new Set(value.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))];
  if (ids.length > MAX_PROVISION_COUNT) throw new ProvisionInputError(`${label} bir so‘rovda ${MAX_PROVISION_COUNT} tadan oshmasligi kerak`);
  return ids;
}

function latinSlug(value: string, fallback: string) {
  const replacements: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "x", ц: "s", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
    қ: "q", ғ: "g", ў: "o", ҳ: "h",
  };
  const transliterated = [...value.normalize("NFKC").toLocaleLowerCase("uz-UZ")]
    .map((character) => replacements[character] ?? character).join("");
  const slug = transliterated.normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[’ʻ']/g, "").replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
  return (slug || fallback).slice(0, 18).replace(/\.$/, "");
}

function employeeUsername(id: number, name: string) {
  return `u${id}.${latinSlug(name, "xodim")}`.slice(0, 32).replace(/\.$/, "");
}

function positionUsername(id: number, slot: number, title: string) {
  return `v${id}.${slot}.${latinSlug(title, "lavozim")}`.slice(0, 32).replace(/\.$/, "");
}

async function availableUsername(db: Db, preferred: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = attempt ? `.${attempt + 1}` : "";
    const candidate = `${preferred.slice(0, 32 - suffix.length)}${suffix}`;
    const normalized = normalizeUsername(candidate);
    const used = await db.prepare(
      `SELECT username_normalized FROM app_user_credentials WHERE username_normalized=?
       UNION ALL SELECT username_normalized FROM app_position_credentials WHERE username_normalized=? LIMIT 1`,
    ).bind(normalized, normalized).first();
    if (!used) return candidate;
  }
  throw new Error("Takrorlanmaydigan login yaratib bo‘lmadi");
}

async function inChunks<T, R>(values: T[], size: number, worker: (value: T) => Promise<R>) {
  const results: R[] = [];
  for (let index = 0; index < values.length; index += size) {
    results.push(...await Promise.all(values.slice(index, index + size).map(worker)));
  }
  return results;
}

async function runAtomicStatements(db: Db, statements: D1PreparedStatement[]) {
  if (!statements.length) return;
  if (statements.length > MAX_ATOMIC_STATEMENTS) {
    throw new Error("Bir martalik login-parol to‘plami atomar limitdan oshdi");
  }
  await db.batch(statements);
}

function accessProfile(row: AccessProfileRow): AccessProfile {
  return {
    id: Number(row.id), code: String(row.code), name: String(row.name), organizationType: String(row.organization_type),
    viewScope: String(row.view_scope), informationScope: String(row.information_scope) as AccessProfile["informationScope"],
    canEnter: Boolean(row.can_enter_information), canSubmit: Boolean(row.can_submit_information),
    canVerify: Boolean(row.can_verify_information), canApprove: Boolean(row.can_approve_information),
    canViewAll: Boolean(row.can_view_all_information),
  };
}

function assignmentStatement(db: Db, principalType: "employee" | "staff_position", principalId: number, profile: AccessProfile, organizationId: number, departmentId: number | null, actorId: number) {
  const global = ["system_administrator", "committee_leadership"].includes(profile.code);
  const departmentScoped = !global && departmentId != null && profile.informationScope === "assigned";
  const scopeType = global ? "global" : departmentScoped ? "department" : "organization";
  const scopeId = global ? 0 : departmentScoped ? departmentId : organizationId;
  return db.prepare(
    `INSERT INTO app_access_profile_assignments
      (principal_type,principal_id,access_profile_id,scope_type,scope_id,include_descendants,grant_source,created_by_employee_id)
     VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(principal_type,principal_id,access_profile_id,scope_type,scope_id) DO UPDATE SET
       active=1,updated_at=CURRENT_TIMESTAMP`,
  ).bind(principalType, principalId, profile.id, scopeType, scopeId, profile.code.endsWith("_leadership") || global ? 1 : 0, "credential_provisioning", actorId);
}

function resetAutomaticAssignmentsStatement(db: Db, principalType: "employee" | "staff_position", principalId: number) {
  return db.prepare(
    `UPDATE app_access_profile_assignments SET active=0,updated_at=CURRENT_TIMESTAMP
      WHERE principal_type=? AND principal_id=?
        AND grant_source IN ('migration_role_mapping','staff_schedule_mapping','credential_provisioning','position_occupancy')`,
  ).bind(principalType, principalId);
}

async function organizationIds(db: Db, organizationId: number | null, includeDescendants: boolean) {
  if (!organizationId) return null;
  const organization = await db.prepare("SELECT id FROM app_organizations WHERE id=? AND active=1").bind(organizationId).first();
  if (!organization) throw new ProvisionInputError("Tashkilot topilmadi");
  if (!includeDescendants) return [organizationId];
  const result = await db.prepare(
    `WITH RECURSIVE scope(id) AS (
       SELECT id FROM app_organizations WHERE id=? AND active=1
       UNION ALL SELECT child.id FROM app_organizations child JOIN scope parent ON child.parent_id=parent.id WHERE child.active=1
     ) SELECT id FROM scope ORDER BY id`,
  ).bind(organizationId).all<{ id: number }>();
  return result.results.map((item) => Number(item.id));
}

async function provisionEmployees(db: Db, actor: Actor, payload: Record<string, unknown>, profiles: Map<string, AccessProfile>, roleNames: Map<string, string>) {
  const employeeIds = safeIds(payload.employeeIds, "Xodimlar");
  const cursor = Math.max(0, Number(payload.cursor) || 0);
  const limit = Math.max(1, Math.min(MAX_EMPLOYEE_ACCOUNTS_PER_RESPONSE, Number(payload.limit) || MAX_EMPLOYEE_ACCOUNTS_PER_RESPONSE));
  const reissue = Boolean(payload.reissue);
  const selectedOrganizations = await organizationIds(db, Number(payload.organizationId) || null, payload.includeDescendants !== false);
  const conditions = ["e.active=1"];
  const binds: unknown[] = [];
  if (employeeIds.length) {
    conditions.push(`e.id IN (${employeeIds.map(() => "?").join(",")})`);
    binds.push(...employeeIds);
  }
  conditions.push("e.id>?");
  binds.push(cursor);
  if (selectedOrganizations) {
    conditions.push(`e.organization_id IN (${selectedOrganizations.map(() => "?").join(",")})`);
    binds.push(...selectedOrganizations);
  }
  const result = await db.prepare(
    `SELECT e.id,e.full_name,e.position,e.department_id,e.organization_id,
            o.name AS organization_name,o.type AS organization_type,d.name AS department_name,
            r.code AS role_code,r.name AS role_name,c.username AS credential_username,
            EXISTS (SELECT 1 FROM app_owner_identities owner WHERE owner.employee_id=e.id) AS owner_bound
       FROM app_employees e
       JOIN app_roles r ON r.id=e.role_id
       JOIN app_organizations o ON o.id=e.organization_id AND o.active=1
       LEFT JOIN app_departments d ON d.id=e.department_id
       LEFT JOIN app_user_credentials c ON c.employee_id=e.id
      WHERE ${conditions.join(" AND ")} ORDER BY e.id LIMIT ?`,
  ).bind(...binds, limit + 1).all<ProvisionEmployeeRow>();
  const hasMore = result.results.length > limit;
  const rows = result.results.slice(0, limit);
  const skipped: Array<{ targetId: number; reason: string }> = [];
  const candidates = rows.filter((row) => {
    const target = accountProvisionTarget(actor, { employeeId: Number(row.id), roleCode: String(row.role_code), ownerBound: Boolean(row.owner_bound) });
    if (!target.allowed) {
      skipped.push({ targetId: Number(row.id), reason: target.message });
      return false;
    }
    if (row.credential_username && !reissue) {
      skipped.push({ targetId: Number(row.id), reason: "Akkaunt avval yaratilgan; yangi parol uchun qayta chiqarishni tanlang" });
      return false;
    }
    return true;
  });
  const generated = await inChunks(candidates, 10, async (row) => {
    const temporaryPassword = randomTemporaryPassword();
    const secret = await hashPassword(temporaryPassword, undefined, PASSWORD_ITERATIONS);
    const username = row.credential_username
      ? String(row.credential_username)
      : await availableUsername(db, employeeUsername(Number(row.id), String(row.full_name)));
    const profileCode = inferAccessProfileCode({
      roleCode: String(row.role_code), organizationType: String(row.organization_type), position: String(row.position ?? ""),
    });
    const profile = profiles.get(profileCode);
    if (!profile) throw new Error(`Vakolat profili topilmadi: ${profileCode}`);
    return { row, temporaryPassword, secret, username, profile };
  });
  const expiresAt = new Date(Date.now() + TEMPORARY_PASSWORD_DAYS * 24 * 60 * 60_000).toISOString();
  const statements: D1PreparedStatement[] = [];
  const accounts: ProvisionedAccount[] = [];
  for (const item of generated) {
    const employeeId = Number(item.row.id);
    const inferredRoleCode = applicationRoleForProfile(item.profile.code, String(item.row.role_code), String(item.row.position ?? ""));
    if (item.row.credential_username) {
      statements.push(db.prepare(
        `UPDATE app_user_credentials SET password_hash=?,password_salt=?,password_iterations=?,must_change_password=1,
          temporary_expires_at=?,failed_attempts=0,locked_until=NULL,password_updated_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP
         WHERE employee_id=?`,
      ).bind(item.secret.hash, item.secret.salt, item.secret.iterations, expiresAt, employeeId));
    } else {
      statements.push(db.prepare(
        `INSERT INTO app_user_credentials
          (employee_id,username,username_normalized,password_hash,password_salt,password_iterations,must_change_password,temporary_expires_at)
         VALUES (?,?,?,?,?,?,1,?)`,
      ).bind(employeeId, item.username, normalizeUsername(item.username), item.secret.hash, item.secret.salt, item.secret.iterations, expiresAt));
    }
    statements.push(
      db.prepare("DELETE FROM app_sessions WHERE employee_id=?").bind(employeeId),
      db.prepare("UPDATE app_account_activation_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE employee_id=? AND used_at IS NULL AND revoked_at IS NULL").bind(employeeId),
      resetAutomaticAssignmentsStatement(db, "employee", employeeId),
      assignmentStatement(db, "employee", employeeId, item.profile, Number(item.row.organization_id), item.row.department_id == null ? null : Number(item.row.department_id), actor.id),
      db.prepare(
        `UPDATE app_employees SET role_id=COALESCE((SELECT id FROM app_roles WHERE code=? AND active=1 LIMIT 1),role_id),
          updated_at=CURRENT_TIMESTAMP
         WHERE id=? AND role_id IN (SELECT id FROM app_roles WHERE code IN ('xodim','malumot_kirituvchi'))`,
      ).bind(inferredRoleCode, employeeId),
    );
    accounts.push({
      accountKind: "employee", employeeId, staffPositionId: null, slotNumber: null,
      fullName: String(item.row.full_name), organization: String(item.row.organization_name), department: String(item.row.department_name ?? ""),
      position: String(item.row.position ?? ""), username: item.username, temporaryPassword: item.temporaryPassword,
      roleCode: inferredRoleCode, roleName: roleNames.get(inferredRoleCode) ?? String(item.row.role_name),
      accessProfileCode: item.profile.code, accessProfileName: item.profile.name, canLogin: true, mustChangePassword: true,
    });
  }
  await runAtomicStatements(db, statements);
  return { accounts, skipped, nextCursor: hasMore ? Number(rows.at(-1)?.id ?? 0) : null };
}

async function provisionVacancies(db: Db, actor: Actor, payload: Record<string, unknown>, profiles: Map<string, AccessProfile>, roleNames: Map<string, string>) {
  const staffPositionIds = safeIds(payload.staffPositionIds, "Lavozimlar");
  const rawCursor = Math.max(0, Number(payload.cursor) || 0);
  const cursorPositionId = Math.floor(rawCursor / POSITION_CURSOR_FACTOR);
  const cursorSlot = rawCursor % POSITION_CURSOR_FACTOR;
  const limit = Math.max(1, Math.min(MAX_VACANCY_ACCOUNTS_PER_RESPONSE, Number(payload.limit) || MAX_VACANCY_ACCOUNTS_PER_RESPONSE));
  const reissue = Boolean(payload.reissue);
  const selectedOrganizations = await organizationIds(db, Number(payload.organizationId) || null, payload.includeDescendants !== false);
  const conditions = ["p.active=1"];
  const binds: unknown[] = [];
  if (staffPositionIds.length) {
    conditions.push(`p.id IN (${staffPositionIds.map(() => "?").join(",")})`);
    binds.push(...staffPositionIds);
  } else {
    conditions.push("p.id>=?");
    binds.push(cursorPositionId || 0);
  }
  if (selectedOrganizations) {
    conditions.push(`p.organization_id IN (${selectedOrganizations.map(() => "?").join(",")})`);
    binds.push(...selectedOrganizations);
  }
  const positions = await db.prepare(
    `SELECT p.id,p.title,p.department_id,p.department_name,p.organization_id,p.headcount_units,p.data_status,
            o.name AS organization_name,o.type AS organization_type,d.name AS department_name_resolved,
            (SELECT COUNT(*) FROM app_position_occupancies x
              JOIN app_employees e ON e.id=x.employee_id AND e.active=1
             WHERE x.staff_position_id=p.id AND x.ends_at IS NULL) AS occupied_slots
       FROM app_staff_positions p
       JOIN app_organizations o ON o.id=p.organization_id AND o.active=1
       LEFT JOIN app_departments d ON d.id=p.department_id
      WHERE ${conditions.join(" AND ")} ORDER BY p.id LIMIT 150`,
  ).bind(...binds).all<Row>();
  const positionIds = positions.results.map((row) => Number(row.id));
  const existingRows = positionIds.length ? await db.prepare(
    `SELECT * FROM app_position_credentials WHERE staff_position_id IN (${positionIds.map(() => "?").join(",")})`,
  ).bind(...positionIds).all<Row>() : { results: [] as Row[] };
  const existingBySlot = new Map(existingRows.results.map((row) => [`${row.staff_position_id}:${row.slot_number}`, row]));
  const candidateSlots: Array<{ position: Row; slotNumber: number; existing: Row | null }> = [];
  let moreCandidates = false;
  let lastScannedPositionId = cursorPositionId;
  const skipped: Array<{ targetId: number; reason: string }> = [];
  outer: for (const position of positions.results) {
    const positionId = Number(position.id);
    lastScannedPositionId = positionId;
    const credentialSlots = Math.max(0, Math.ceil(Number(position.headcount_units ?? 0)));
    const occupiedSlots = Math.max(0, Number(position.occupied_slots ?? 0));
    for (let slotNumber = occupiedSlots + 1; slotNumber <= credentialSlots; slotNumber += 1) {
      const encodedCursor = positionId * POSITION_CURSOR_FACTOR + slotNumber;
      if (encodedCursor <= rawCursor || positionId === cursorPositionId && slotNumber <= cursorSlot) continue;
      const existing = existingBySlot.get(`${positionId}:${slotNumber}`) ?? null;
      if (existing && String(existing.status) !== "reserved") continue;
      if (existing && !reissue) {
        skipped.push({ targetId: positionId, reason: `${slotNumber}-o‘rin rezerv akkaunti avval yaratilgan` });
        continue;
      }
      if (candidateSlots.length >= limit) {
        moreCandidates = true;
        break outer;
      }
      candidateSlots.push({ position, slotNumber, existing });
    }
  }
  const generated = await inChunks(candidateSlots, 10, async (candidate) => {
    const temporaryPassword = randomTemporaryPassword();
    const secret = await hashPassword(temporaryPassword, undefined, PASSWORD_ITERATIONS);
    const username = candidate.existing
      ? String(candidate.existing.username)
      : await availableUsername(db, positionUsername(Number(candidate.position.id), candidate.slotNumber, String(candidate.position.title)));
    const profileCode = inferAccessProfileCode({
      roleCode: null, organizationType: String(candidate.position.organization_type), position: String(candidate.position.title),
    });
    const profile = profiles.get(profileCode);
    if (!profile) throw new Error(`Vakolat profili topilmadi: ${profileCode}`);
    return { ...candidate, temporaryPassword, secret, username, profile };
  });
  const statements: D1PreparedStatement[] = [];
  const accounts: ProvisionedAccount[] = [];
  for (const item of generated) {
    const positionId = Number(item.position.id);
    if (item.existing) {
      statements.push(db.prepare(
        `UPDATE app_position_credentials SET password_hash=?,password_salt=?,password_iterations=?,must_change_password=1,
          generated_by_employee_id=?,generated_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP
         WHERE id=? AND status='reserved'`,
      ).bind(item.secret.hash, item.secret.salt, item.secret.iterations, actor.id, Number(item.existing.id)));
    } else {
      statements.push(db.prepare(
        `INSERT INTO app_position_credentials
          (staff_position_id,slot_number,username,username_normalized,password_hash,password_salt,password_iterations,status,must_change_password,generated_by_employee_id)
         VALUES (?,?,?,?,?,?,?,'reserved',1,?)`,
      ).bind(positionId, item.slotNumber, item.username, normalizeUsername(item.username), item.secret.hash, item.secret.salt, item.secret.iterations, actor.id));
    }
    statements.push(
      resetAutomaticAssignmentsStatement(db, "staff_position", positionId),
      assignmentStatement(
        db, "staff_position", positionId, item.profile, Number(item.position.organization_id),
        item.position.department_id == null ? null : Number(item.position.department_id), actor.id,
      ),
    );
    const roleCode = applicationRoleForProfile(item.profile.code, "xodim", String(item.position.title ?? ""));
    accounts.push({
      accountKind: "vacant_position", employeeId: null, staffPositionId: positionId, slotNumber: item.slotNumber,
      fullName: "Vakant", organization: String(item.position.organization_name),
      department: String(item.position.department_name_resolved ?? item.position.department_name ?? ""), position: String(item.position.title),
      username: item.username, temporaryPassword: item.temporaryPassword, roleCode,
      roleName: roleNames.get(roleCode) ?? item.profile.name, accessProfileCode: item.profile.code, accessProfileName: item.profile.name,
      canLogin: false, mustChangePassword: true,
    });
  }
  await runAtomicStatements(db, statements);
  const scannedToEnd = positions.results.length < 150;
  const nextCursor = moreCandidates
    ? Number(accounts.at(-1)!.staffPositionId) * POSITION_CURSOR_FACTOR + Number(accounts.at(-1)!.slotNumber)
    : !scannedToEnd
      ? lastScannedPositionId * POSITION_CURSOR_FACTOR + POSITION_CURSOR_FACTOR - 1
      : null;
  return { accounts, skipped, nextCursor };
}

/**
 * Generates one-time temporary passwords. They are returned once and only the
 * PBKDF2 result is stored; every issued account gets its own audit entry.
 */
export async function provisionAccounts(actor: Actor, payload: Record<string, unknown>) {
  const kind = String(payload.kind ?? "") as AccountKind;
  if (!(["employees", "vacancies"] as string[]).includes(kind)) {
    throw new ApiError(400, "Akkaunt turi employees yoki vacancies bo‘lishi kerak");
  }
  const db = await getD1();
  const [profileRows, roleRows] = await Promise.all([
    db.prepare("SELECT * FROM app_access_profiles WHERE active=1 ORDER BY id").all<AccessProfileRow>(),
    db.prepare("SELECT code,name FROM app_roles WHERE active=1").all<{ code: string; name: string }>(),
  ]);
  const profiles = new Map(profileRows.results.map((row) => [String(row.code), accessProfile(row)]));
  const roleNames = new Map(roleRows.results.map((row) => [String(row.code), String(row.name)]));
  const result = kind === "employees"
    ? await provisionEmployees(db, actor, payload, profiles, roleNames)
    : await provisionVacancies(db, actor, payload, profiles, roleNames);
  await audit(actor, "accounts.credentials_provisioned", kind === "employees" ? "employee" : "staff_position", null, {
    kind, generatedCount: result.accounts.length, skippedCount: result.skipped.length,
    reissue: Boolean(payload.reissue), organizationId: Number(payload.organizationId) || null,
    targets: result.accounts.map((account) => account.employeeId ?? `${account.staffPositionId}:${account.slotNumber}`),
  });
  // One entry per affected account, so each person's history shows who issued their password.
  for (const account of result.accounts) {
    await audit(
      actor,
      account.employeeId != null ? "account.credentials_issued" : "position_account.credentials_issued",
      account.employeeId != null ? "employee" : "staff_position",
      account.employeeId ?? account.staffPositionId,
      { username: account.username, reissue: Boolean(payload.reissue), slotNumber: account.slotNumber },
    );
  }
  return { generatedAt: new Date().toISOString(), ...result };
}
