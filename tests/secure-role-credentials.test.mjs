import { readSource, flat } from './fixtures/source.mjs';
import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import ts from "typescript";

const migrationsDirectory = new URL("../drizzle/", import.meta.url);
const migrationPath = new URL("../drizzle/0021_secure_role_credentials.sql", import.meta.url);
const reconciliationPath = new URL("../drizzle/0023_secure_role_reconciliation.sql", import.meta.url);

async function applyMigrations() {
  const database = new DatabaseSync(":memory:");
  const names = withSyntheticSeed((await readdir(migrationsDirectory)).filter((name) => /^\d{4}.*\.sql$/.test(name)).sort());
  for (const name of names) database.exec(await readFile(new URL(name, migrationsDirectory), "utf8"));
  return database;
}

async function loadAccessControlModule() {
  const source = (await readFile(new URL("../lib/access-control.ts", import.meta.url), "utf8"))
    .replace(/^import \{ getD1 \} from "\.\.\/db";\s*/m, "");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

test("secure role migration covers every position without storing plaintext secrets", async () => {
  const [migration, database] = await Promise.all([readFile(migrationPath, "utf8"), applyMigrations()]);
  const positionCount = Number(database.prepare("SELECT COUNT(*) AS count FROM app_staff_positions WHERE active=1").get().count);
  const assignedCount = Number(database.prepare(`SELECT COUNT(DISTINCT principal_id) AS count
    FROM app_access_profile_assignments WHERE principal_type='staff_position' AND active=1`).get().count);
  assert.equal(assignedCount, positionCount);
  assert.equal(Number(database.prepare("SELECT COUNT(*) AS count FROM app_access_profiles").get().count), 14);

  const credentialColumns = database.prepare("PRAGMA table_info(app_position_credentials)").all().map((column) => String(column.name));
  assert.ok(credentialColumns.includes("password_hash"));
  assert.ok(credentialColumns.includes("password_salt"));
  assert.ok(!credentialColumns.some((column) => /plain|temporary_password|cleartext/i.test(column)));
  assert.match(migration, /Temporary plaintext passwords are deliberately absent/);
  assert.doesNotMatch(migration, /INSERT INTO `app_(?:user|position)_credentials`/);
});

test("provisional operational roles make every organization routable without pretending to be official staff", async () => {
  const database = await applyMigrations();
  const coverage = database.prepare(`SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN EXISTS (SELECT 1 FROM app_staff_positions p WHERE p.organization_id=o.id AND p.active=1
        AND p.source_file<>'Tizim tomonidan yaratilgan') THEN 1 ELSE 0 END) AS official,
      SUM(CASE WHEN EXISTS (SELECT 1 FROM app_staff_positions p WHERE p.organization_id=o.id AND p.active=1) THEN 1 ELSE 0 END) AS operational,
      SUM(CASE WHEN EXISTS (SELECT 1 FROM app_staff_positions p WHERE p.organization_id=o.id AND p.active=1 AND p.data_status='provisional_requires_staff_import') THEN 1 ELSE 0 END) AS provisional
    FROM app_organizations o WHERE o.active=1`).get();
  assert.ok(Number(coverage.total) >= 242);
  const provisionalBridge = database.prepare(`SELECT * FROM app_organizations
    WHERE active=1 AND type='territorial' AND region_code='tashkent_region'`).get();
  assert.equal(provisionalBridge.data_status, "provisional_requires_admin_confirmation");
  assert.equal(Number(provisionalBridge.hierarchy_verified), 0);
  assert.equal(Number(coverage.official), 10);
  assert.equal(Number(coverage.operational), Number(coverage.total));
  assert.equal(Number(coverage.provisional), Number(coverage.total) - Number(coverage.official));

  const official = database.prepare(`SELECT COUNT(*) AS position_rows,
    SUM(CAST(headcount_units AS INTEGER)+CASE WHEN headcount_units>CAST(headcount_units AS INTEGER) THEN 1 ELSE 0 END) AS credential_slots
    FROM app_staff_positions WHERE active=1 AND source_file<>'Tizim tomonidan yaratilgan'`).get();
  assert.equal(Number(official.position_rows), 588);
  assert.equal(Number(official.credential_slots), 989);
  const provisionalCount = Number(database.prepare("SELECT COUNT(*) AS count FROM app_staff_positions WHERE data_status='provisional_requires_staff_import'").get().count);
  assert.equal(provisionalCount, (Number(coverage.total) - Number(coverage.official)) * 2
    + Number(database.prepare("SELECT COUNT(*) AS count FROM app_organizations WHERE active=1 AND type='territorial' AND NOT EXISTS (SELECT 1 FROM app_staff_positions p WHERE p.organization_id=app_organizations.id AND p.active=1 AND p.source_file<>'Tizim tomonidan yaratilgan')").get().count));
  assert.equal(Number(database.prepare("SELECT COUNT(*) AS count FROM app_staff_positions WHERE title='Hududiy bo‘lim tasdiqlovchisi'").get().count), 13);

  const routeGaps = database.prepare(`WITH RECURSIVE route(origin_id,id,type,parent_id,depth) AS (
      SELECT id,id,type,parent_id,0 FROM app_organizations WHERE active=1 AND type='district'
      UNION ALL SELECT route.origin_id,parent.id,parent.type,parent.parent_id,route.depth+1
      FROM app_organizations parent JOIN route ON route.parent_id=parent.id WHERE parent.active=1 AND route.depth<20
    ) SELECT origin_id,SUM(CASE WHEN type='territorial' THEN 1 ELSE 0 END) AS territorial_count
      FROM route GROUP BY origin_id HAVING territorial_count<>1`).all();
  assert.deepEqual(routeGaps, []);
});

test("secure role reconciliation is idempotent for already-applied checkpoints", async () => {
  const database = await applyMigrations();
  const before = database.prepare(`SELECT
    (SELECT COUNT(*) FROM app_staff_positions WHERE active=1) AS positions,
    (SELECT COUNT(*) FROM app_staff_positions WHERE active=1 AND source_file='Tizim tomonidan yaratilgan') AS provisional,
    (SELECT COUNT(*) FROM app_access_profile_assignments WHERE active=1) AS assignments`).get();
  database.exec(await readFile(reconciliationPath, "utf8"));
  const after = database.prepare(`SELECT
    (SELECT COUNT(*) FROM app_staff_positions WHERE active=1) AS positions,
    (SELECT COUNT(*) FROM app_staff_positions WHERE active=1 AND source_file='Tizim tomonidan yaratilgan') AS provisional,
    (SELECT COUNT(*) FROM app_access_profile_assignments WHERE active=1) AS assignments`).get();
  assert.deepEqual(after, before);
});

test("database keeps one active administrator under concurrent-style demotion and deletion", async () => {
  const database = await applyMigrations();
  const adminRole = Number(database.prepare("SELECT id FROM app_roles WHERE code='admin'").get().id);
  const employeeRole = Number(database.prepare("SELECT id FROM app_roles WHERE code='xodim'").get().id);
  database.prepare(`INSERT INTO app_employees
    (full_name,email,position,role_id,department_id,organization_id,manager_id,active)
    SELECT 'Ikkinchi administrator',NULL,'Administrator',role_id,department_id,organization_id,NULL,1
      FROM app_employees WHERE active=1 AND role_id=? LIMIT 1`).run(adminRole);
  const admins = database.prepare(`SELECT id FROM app_employees
    WHERE active=1 AND role_id=? ORDER BY id LIMIT 2`).all(adminRole).map((row) => Number(row.id));
  assert.equal(admins.length, 2);
  database.prepare("UPDATE app_employees SET role_id=? WHERE id=?").run(employeeRole, admins[0]);
  assert.throws(
    () => database.prepare("UPDATE app_employees SET role_id=? WHERE id=?").run(employeeRole, admins[1]),
    /last_active_admin/,
  );
  assert.throws(() => database.prepare("DELETE FROM app_employees WHERE id=?").run(admins[1]), /last_active_admin/);
});

test("least privilege keeps service positions personal and committee assistants outside leadership", async () => {
  const database = await applyMigrations();
  const profileForTitle = (title) => database.prepare(`SELECT profile.code
      FROM app_staff_positions position
      JOIN app_access_profile_assignments assignment ON assignment.principal_type='staff_position' AND assignment.principal_id=position.id AND assignment.active=1
      JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id
     WHERE position.title=? LIMIT 1`).get(title)?.code;
  assert.equal(profileForTitle("Махсус автотранспорт ҳайдовчиси"), "employee_personal");
  assert.equal(profileForTitle("Қоровул"), "employee_personal");
  assert.equal(profileForTitle("Директор ҳайдовчиси (Captiva)"), "employee_personal");
  assert.equal(profileForTitle("Раҳбар котиби"), "employee_personal");
  assert.equal(profileForTitle("Ёқилғи-мойлаш материаллари хизмати бошлиғи"), "employee_personal");
  assert.equal(profileForTitle("Марказий лаборатория бошлиғи"), "employee_personal");
  assert.equal(profileForTitle("Компрессор станцияси бошлиғи"), "employee_personal");
  assert.equal(profileForTitle("Қўриқлаш хизмати бошлиғи"), "employee_personal");
  assert.equal(profileForTitle("Бош мутахассис"), "direct_org_editor");
  assert.equal(profileForTitle("Hududiy rahbariyat tasdiqlovchisi"), "territorial_leadership");
  assert.equal(profileForTitle("Hududiy bo‘lim tasdiqlovchisi"), "territorial_unit_reviewer");

  const leadership = database.prepare(`SELECT position.title FROM app_staff_positions position
    JOIN app_access_profile_assignments assignment ON assignment.principal_type='staff_position' AND assignment.principal_id=position.id
    JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id
    WHERE assignment.active=1 AND profile.code='committee_leadership' ORDER BY position.title`).all().map((row) => String(row.title));
  assert.equal(leadership.length, 3);
  assert.ok(leadership.every((title) => /Qo‘mita raisi|Rais o‘rinbosari/.test(title)));
  assert.ok(!leadership.some((title) => /yordamchi|maslahatchi/i.test(title)));
});

test("runtime role inference rejects executive-support false positives", async () => {
  const { inferAccessProfileCode, applicationRoleForProfile } = await loadAccessControlModule();
  const direct = (position) => inferAccessProfileCode({ roleCode: "xodim", organizationType: "direct_subordinate", position });
  assert.equal(direct("Директор ҳайдовчиси (Captiva)"), "employee_personal");
  assert.equal(direct("Раҳбар котиби"), "employee_personal");
  assert.equal(direct("Марказий лаборатория бошлиғи"), "employee_personal");
  assert.equal(direct("Қўриқлаш хизмати бошлиғи"), "employee_personal");
  assert.equal(direct("Директор"), "direct_org_leadership");
  assert.equal(direct("Директорнинг биринчи ўринбосари"), "direct_org_leadership");
  assert.equal(inferAccessProfileCode({ roleCode: "xodim", organizationType: "central", position: "Rais yordamchisi" }), "employee_personal");
  assert.equal(applicationRoleForProfile("committee_leadership", "xodim", "Qo‘mita raisi"), "rahbar");
  assert.equal(applicationRoleForProfile("committee_leadership", "xodim", "Rais o‘rinbosari - bosh muhandis"), "orinbosar");
});

test("every active information owner has an occupied department-scoped approver", async () => {
  const database = await applyMigrations();
  const missing = database.prepare(`SELECT workflow.owner_department_id
    FROM app_information_template_workflows workflow
    JOIN app_information_templates template ON template.id=workflow.template_id AND template.active=1
    WHERE workflow.active=1 AND workflow.owner_department_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM app_employees employee
        WHERE employee.active=1 AND EXISTS (
          SELECT 1 FROM app_access_profile_assignments assignment
          JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id
            AND profile.active=1 AND profile.can_approve_information=1
          WHERE assignment.active=1 AND assignment.scope_type='department'
            AND assignment.scope_id=workflow.owner_department_id
            AND ((assignment.principal_type='employee' AND assignment.principal_id=employee.id)
              OR (assignment.principal_type='staff_position' AND EXISTS (
                SELECT 1 FROM app_position_occupancies occupancy
                WHERE occupancy.staff_position_id=assignment.principal_id
                  AND occupancy.employee_id=employee.id AND occupancy.ends_at IS NULL
              )))
        )
      )
    LIMIT 1`).get();
  assert.equal(missing, undefined);

  const secondaryManager = database.prepare(`SELECT COUNT(*) AS count
    FROM app_access_profile_assignments
    WHERE principal_type='staff_position' AND grant_source='secondary_department_management' AND active=1`).get();
  assert.equal(Number(secondaryManager.count), 2);
});

test("bulk provisioning is one-time, hashed, paginated and invalidates old sessions", async () => {
  const [route, activation, employeeAdmin, password, auth, bootstrap, changePassword, login] = await Promise.all([
    // Provisioning and employee administration live in services/ (thin routes, see lib/policy/admin.ts).
    Promise.all([
      readSource(new URL("../app/api/admin/accounts/provision/route.ts", import.meta.url)),
      readFile(new URL("../services/accounts.ts", import.meta.url), "utf8"),
    ]).then((parts) => parts.join("\n")),
    readSource(new URL("../app/api/admin/accounts/activate-reserved/route.ts", import.meta.url)),
    readFile(new URL("../services/employees.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/password.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/auth.ts", import.meta.url), "utf8"),
    readSource(new URL("../app/api/bootstrap/route.ts", import.meta.url)),
    readFile(new URL("../services/accounts.ts", import.meta.url), "utf8"),
    readFile(new URL("../services/accounts.ts", import.meta.url), "utf8"),
  ]);
  assert.match(route, /authorize\(accountProvision\(actor\)\)/);
  assert.match(route, /randomTemporaryPassword\(\)/);
  assert.match(route, /hashPassword\(temporaryPassword, undefined, PASSWORD_ITERATIONS\)/);
  assert.doesNotMatch(route, /\.bind\([^\n]*temporaryPassword/);
  assert.match(route, /oneTimeDownload: true/);
  assert.match(route, /"Cache-Control": "private, no-store, max-age=0"/);
  assert.match(route, /DELETE FROM app_sessions WHERE employee_id=\?/);
  assert.match(route, /TEMPORARY_PASSWORD_DAYS = 30/);
  assert.match(route, /lastScannedPositionId \* POSITION_CURSOR_FACTOR \+ POSITION_CURSOR_FACTOR - 1/);
  assert.match(route, /Math\.ceil\(Number\(position\.headcount_units/);
  assert.match(route, /occupiedSlots \+ 1/);
  assert.match(route, /o‘rin rezerv akkaunti avval yaratilgan/);
  assert.match(route, /MAX_EMPLOYEE_ACCOUNTS_PER_RESPONSE = 6/);
  assert.match(route, /MAX_VACANCY_ACCOUNTS_PER_RESPONSE = 10/);
  assert.match(route, /MAX_ATOMIC_STATEMENTS = 40/);
  assert.match(route, /await db\.batch\(statements\)/);
  assert.doesNotMatch(route, /runStatementChunks/);

  assert.match(password, /PASSWORD_ITERATIONS = 600_000/);
  assert.match(password, /MIN_SUPPORTED_PASSWORD_ITERATIONS = 100_000/);
  assert.match(password, /MAX_SUPPORTED_PASSWORD_ITERATIONS = 600_000/);
  assert.match(password, /isSupportedPasswordIterations\(iterations\)/);
  assert.match(activation, /isSupportedPasswordIterations\(Number\(reserved\.password_iterations\)\)/);
  assert.match(auth, /allowPasswordChangeRequired/);
  assert.match(auth, /ApiError\(428/);
  assert.match(bootstrap, /requireActor\(\{ allowPasswordChangeRequired: true \}\)/);
  assert.match(changePassword, /temporary_expires_at=NULL/);
  assert.match(changePassword, /DELETE FROM app_sessions WHERE employee_id=\?/);
  // Throttling is reserved atomically before verification (behaviour: tests/auth-hardening.test.mjs).
  assert.match(login, /INSERT INTO app_login_attempts[\s\S]*RETURNING attempts/);
  assert.doesNotMatch(login, /const attempts = Number\(credential\.failed_attempts/);
  assert.match(activation, /status='assigned'/);
  assert.match(activation, /passwordReturned: false/);
  assert.match(flat(activation), /applicationRoleForProfile\(String\(profile\.code\), String\(occupancy\.role_code\), String\(occupancy\.title/);
  assert.match(activation, /RESERVED_SECRET_MAX_AGE_DAYS = 90/);
  assert.match(employeeAdmin, /TEMPORARY_PASSWORD_DAYS = 30/);
  assert.match(employeeAdmin, /must_change_password,temporary_expires_at/);
  assert.doesNotMatch(employeeAdmin, /payload\.mustChangePassword === false/);
  assert.match(employeeAdmin, /refreshAutomaticAccessProfileAssignment/);
});

test("staff coverage and access-profile APIs expose source quality separately from readiness", async () => {
  const [staff, access] = await Promise.all([
    readSource(new URL("../app/api/staff/route.ts", import.meta.url)),
    readSource(new URL("../app/api/admin/access-profiles/route.ts", import.meta.url)),
  ]);
  for (const field of [
    "officialCoveredOrganizations", "officialMissingOrganizations", "operationalReadyOrganizations",
    "provisionalOrganizations", "provisionalCredentialSlots", "credentialSlots", "occupiedSlots",
    "vacantSlots", "overAllocatedPositions", "byOrganizationType",
  ]) assert.match(staff, new RegExp(field));
  assert.match(staff, /source_file<>'Tizim tomonidan yaratilgan'/);
  assert.match(access, /authorize\(accessProfilesManage\(actor\)\)/);
  assert.match(access, /roleMatrix/);
  assert.match(access, /assignments/);
});
