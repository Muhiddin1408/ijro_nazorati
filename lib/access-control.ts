import { getD1 } from "../db";

export type InformationScope = "all" | "organization" | "department" | "assigned";

export type AccessProfile = {
  id: number;
  code: string;
  name: string;
  organizationType: string;
  viewScope: string;
  informationScope: InformationScope;
  canEnter: boolean;
  canSubmit: boolean;
  canVerify: boolean;
  canApprove: boolean;
  canViewAll: boolean;
};

type AccessSubject = {
  principalType: "employee" | "staff_position";
  principalId: number;
  roleCode?: string | null;
  organizationType: string;
  organizationId: number;
  departmentId: number | null;
  position: string;
};

function normalizedPosition(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("uz-UZ")
    .replace(/[’ʻ`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function isOrganizationLeader(title: string) {
  // Support/service titles often contain an executive word (for example
  // "Direktor haydovchisi" or "Rahbar kotibi"). They must never inherit the
  // executive's organization-wide approval scope.
  if (/(haydovchi|kotib|yordamchi|maslahatchi|driver|secretar|assistant|adviser|advisor|ҳайдовчи|котиб|ёрдамчи|маслаҳатчи|секретар)/u.test(title)) {
    return false;
  }
  if (/(bosh boshqarma boshlig|korxona boshlig|бош бошқарма бошли|корхона бошли)/u.test(title)) return true;
  if (/^(rahbar|раҳбар|rektor|ректор|начальник)$/u.test(title)) return true;
  if (/^(bosh |ijrochi |генерал(?:ьный)? )?(direktor|директор)$/u.test(title)) return true;
  return /((direktor|директор)(ning|нинг)?[^\n]*(o'rinbosari|ўринбосари)|(bo'yicha|бўйича) (direktor|директор) (o'rinbosari|ўринбосари))/u.test(title);
}

function isCommitteeLeader(title: string) {
  if (/(haydovchi|kotib|yordamchi|maslahatchi|driver|secretar|assistant|adviser|advisor|ҳайдовчи|котиб|ёрдамчи|маслаҳатчи|секретар)/u.test(title)) return false;
  return /(qo'mita raisi|қўмита раиси|rais o'rinbosari|раис ўринбосари)/u.test(title);
}

function isUnitReviewer(title: string) {
  return /(boshqarma boshlig|bo'lim boshlig|sho'ba boshlig|bosh muhandis|bosh hisobchi|o'rinbosari|бошқарма бошли|бўлим бошли|шуъба бошли|бош муҳандис|бош ҳисобчи|ўринбосари)/u.test(title);
}

function canNormallyEnterData(title: string) {
  return /(mutaxassis|muhandis|hisobchi|iqtisodchi|auditor|yuriskonsult|operator|dispetcher|inspektor|kadr|texnik-hisobchi|мутахассис|муҳандис|ҳисобчи|иқтисодчи|аудитор|юрисконсульт|оператор|диспетчер|инспектор|кадр|техник-ҳисобчи)/u.test(title);
}

export function inferAccessProfileCode(subject: Pick<AccessSubject, "roleCode" | "organizationType" | "position">) {
  const title = normalizedPosition(subject.position);
  if (subject.roleCode === "admin") return "system_administrator";
  if (subject.roleCode === "rahbar" || subject.roleCode === "orinbosar") return "committee_leadership";
  if (subject.roleCode === "hudud_rahbari" && subject.organizationType === "territorial") return "territorial_leadership";
  if (subject.roleCode === "hudud_tasdiqlovchi" && subject.organizationType === "territorial") return "territorial_unit_reviewer";
  if (subject.roleCode === "tuman_rahbari" && subject.organizationType === "district") return "district_leadership";
  if (subject.roleCode === "tashkilot_rahbari") {
    return subject.organizationType === "direct_subordinate" ? "direct_org_leadership" : "organization_leadership";
  }
  if (subject.roleCode === "malumot_kirituvchi") {
    if (subject.organizationType === "central") return "central_unit_editor";
    if (subject.organizationType === "territorial") return "territorial_unit_editor";
    if (subject.organizationType === "district") return "district_editor";
    if (subject.organizationType === "direct_subordinate") return "direct_org_editor";
    return "organization_editor";
  }
  // Provisional operational positions are deliberately explicit: their names
  // describe the workflow duty and must not depend on broad title heuristics.
  if (title === "hududiy rahbariyat tasdiqlovchisi" && subject.organizationType === "territorial") {
    return "territorial_leadership";
  }
  if (title === "hududiy bo'lim tasdiqlovchisi" && subject.organizationType === "territorial") {
    return "territorial_unit_reviewer";
  }
  if (title === "tashkilot tasdiqlovchisi") {
    if (subject.organizationType === "district") return "district_leadership";
    if (subject.organizationType === "direct_subordinate") return "direct_org_leadership";
    return "organization_leadership";
  }
  if (title === "ma'lumot kirituvchi") {
    if (subject.organizationType === "central") return "central_unit_editor";
    if (subject.organizationType === "territorial") return "territorial_unit_editor";
    if (subject.organizationType === "district") return "district_editor";
    if (subject.organizationType === "direct_subordinate") return "direct_org_editor";
    return "organization_editor";
  }
  if (subject.organizationType === "central") {
    if (isCommitteeLeader(title)) return "committee_leadership";
    if (subject.roleCode === "boshqarma" || isUnitReviewer(title)) return "central_unit_approver";
    return canNormallyEnterData(title) ? "central_unit_editor" : "employee_personal";
  }
  if (subject.organizationType === "territorial") {
    if (isOrganizationLeader(title)) return "territorial_leadership";
    if (isUnitReviewer(title)) return "territorial_unit_reviewer";
    return canNormallyEnterData(title) ? "territorial_unit_editor" : "employee_personal";
  }
  if (subject.organizationType === "district") {
    if (isOrganizationLeader(title)) return "district_leadership";
    return canNormallyEnterData(title) ? "district_editor" : "employee_personal";
  }
  if (subject.organizationType === "direct_subordinate") {
    if (isOrganizationLeader(title)) return "direct_org_leadership";
    return canNormallyEnterData(title) || isUnitReviewer(title) ? "direct_org_editor" : "employee_personal";
  }
  if (isOrganizationLeader(title)) return "organization_leadership";
  if (canNormallyEnterData(title) || isUnitReviewer(title)) return "organization_editor";
  return "employee_personal";
}

function profileFromRow(row: Record<string, unknown>): AccessProfile {
  return {
    id: Number(row.id),
    code: String(row.code),
    name: String(row.name),
    organizationType: String(row.organization_type),
    viewScope: String(row.view_scope),
    informationScope: String(row.information_scope) as InformationScope,
    canEnter: Boolean(row.can_enter_information),
    canSubmit: Boolean(row.can_submit_information),
    canVerify: Boolean(row.can_verify_information),
    canApprove: Boolean(row.can_approve_information),
    canViewAll: Boolean(row.can_view_all_information),
  };
}

async function resolvedAssignment(subject: AccessSubject) {
  const db = await getD1();
  const profileCode = inferAccessProfileCode(subject);
  const profile = await db.prepare("SELECT * FROM app_access_profiles WHERE code=? AND active=1 LIMIT 1")
    .bind(profileCode).first<Record<string, unknown>>();
  if (!profile) throw new Error(`Access profile is not configured: ${profileCode}`);
  const global = profileCode === "system_administrator" || profileCode === "committee_leadership";
  const departmentScoped = !global && subject.departmentId != null && [
    "central_unit_approver",
    "central_unit_editor",
    "territorial_unit_reviewer",
    "territorial_unit_editor",
    "district_editor",
    "direct_org_editor",
    "organization_editor",
  ].includes(profileCode);
  const scopeType = global ? "global" : departmentScoped ? "department" : "organization";
  const scopeId = global ? 0 : departmentScoped ? Number(subject.departmentId) : subject.organizationId;
  return { db, profileCode, profile, scopeType, scopeId, global };
}

function assignmentInsert(
  db: D1Database,
  subject: AccessSubject,
  profile: Record<string, unknown>,
  profileCode: string,
  scopeType: string,
  scopeId: number,
  global: boolean,
  createdByEmployeeId?: number,
) {
  return db.prepare(
    `INSERT INTO app_access_profile_assignments
      (principal_type,principal_id,access_profile_id,scope_type,scope_id,include_descendants,grant_source,created_by_employee_id)
     VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(principal_type,principal_id,access_profile_id,scope_type,scope_id) DO UPDATE SET
       active=1,updated_at=CURRENT_TIMESTAMP`,
  ).bind(
    subject.principalType,
    subject.principalId,
    Number(profile.id),
    scopeType,
    scopeId,
    global || profileCode.endsWith("_leadership") ? 1 : 0,
    "credential_provisioning",
    createdByEmployeeId ?? null,
  );
}

export async function ensureAccessProfileAssignment(subject: AccessSubject, createdByEmployeeId?: number) {
  const { db, profileCode, profile, scopeType, scopeId, global } = await resolvedAssignment(subject);
  await assignmentInsert(db, subject, profile, profileCode, scopeType, scopeId, global, createdByEmployeeId).run();
  return profileFromRow(profile);
}

export async function refreshAutomaticAccessProfileAssignment(subject: AccessSubject, createdByEmployeeId?: number) {
  const { db, profile, statements } = await automaticAccessProfileRefreshStatements(subject, createdByEmployeeId);
  await db.batch(statements);
  return profileFromRow(profile);
}

/**
 * Resolve the automatic assignment before a caller starts mutating its
 * principal.  Employee administration can then commit the employee and RBAC
 * changes in one D1 batch, so a failed profile lookup can never leave an old
 * privileged assignment behind after a downgrade.
 */
export async function automaticAccessProfileRefreshStatements(subject: AccessSubject, createdByEmployeeId?: number) {
  const { db, profileCode, profile, scopeType, scopeId, global } = await resolvedAssignment(subject);
  return {
    db,
    profile,
    statements: [
    db.prepare(
      `UPDATE app_access_profile_assignments SET active=0,updated_at=CURRENT_TIMESTAMP
        WHERE principal_type=? AND principal_id=?
          AND grant_source IN ('migration_role_mapping','staff_schedule_mapping','credential_provisioning','position_occupancy')`,
    ).bind(subject.principalType, subject.principalId),
    assignmentInsert(db, subject, profile, profileCode, scopeType, scopeId, global, createdByEmployeeId),
    ],
  };
}

export function applicationRoleForProfile(profileCode: string, fallback = "xodim", position = "") {
  if (profileCode === "system_administrator") return "admin";
  if (profileCode === "committee_leadership") {
    const title = normalizedPosition(position);
    return fallback === "orinbosar" || /(rais o'rinbosari|раис ўринбосари|bosh muhandis|бош муҳандис)/u.test(title)
      ? "orinbosar"
      : "rahbar";
  }
  if (profileCode === "central_unit_approver") return "boshqarma";
  if (profileCode === "territorial_leadership") return "hudud_rahbari";
  if (profileCode === "territorial_unit_reviewer") return "hudud_tasdiqlovchi";
  if (profileCode === "district_leadership") return "tuman_rahbari";
  if (profileCode === "direct_org_leadership" || profileCode === "organization_leadership") return "tashkilot_rahbari";
  if (profileCode.endsWith("_editor")) return "malumot_kirituvchi";
  return fallback;
}
