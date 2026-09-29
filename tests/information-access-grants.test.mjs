import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/headers") return nextResolve("next/headers.js", context);
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[a-z]+$/i.test(specifier)) {
      for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
        const url = new URL(candidate, context.parentURL);
        if (existsSync(fileURLToPath(url))) return nextResolve(url.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const { informationDomainAccess } = await import("../lib/information.ts");
const { canActorApproveInformationStep } = await import("../lib/information-workflow.ts");
const migrationsDirectory = new URL("../drizzle/", import.meta.url);

async function databaseWithMigrations() {
  const database = new DatabaseSync(":memory:");
  const names = withSyntheticSeed((await readdir(migrationsDirectory)).filter((name) => /^\d{4}.*\.sql$/.test(name)).sort());
  for (const name of names) database.exec(await readFile(new URL(name, migrationsDirectory), "utf8"));
  return database;
}

function asD1(database) {
  return {
    prepare(sql) {
      let bindings = [];
      const statement = {
        bind(...values) { bindings = values; return statement; },
        async first() { return database.prepare(sql).get(...bindings) ?? null; },
        async all() { return { results: database.prepare(sql).all(...bindings) }; },
        async run() {
          const result = database.prepare(sql).run(...bindings);
          return { meta: { changes: result.changes, last_row_id: result.lastInsertRowid } };
        },
      };
      return statement;
    },
  };
}

const permissions = {
  viewScope: "own", assignScope: "none", canCreateTask: false, canCreateMeeting: false,
  canExport: false, canManageOrganization: false, canManageRoles: false, canConfigure: false,
  canViewAudit: false, canUpdateAnyTask: false, canManageReports: false, canManageInformation: false,
  canViewRestrictedInformation: false, informationScope: "assigned", canEnterInformation: false,
  canSubmitInformation: false, canVerifyInformation: false, canApproveInformation: false,
};

function actorFor(employee, roleCode, organizationType, overrides = {}) {
  return {
    id: Number(employee.id), name: String(employee.full_name), email: "", position: String(employee.position ?? ""),
    departmentId: employee.department_id == null ? null : Number(employee.department_id), department: "",
    organizationId: Number(employee.organization_id), organization: "", organizationType, managerId: null,
    roleId: Number(employee.role_id), roleCode, roleName: "", roleLevel: 45, username: null,
    mustChangePassword: false, permissions: { ...permissions, ...overrides },
  };
}

function hierarchicalDomains(database) {
  return database.prepare(`SELECT DISTINCT domain.id
    FROM app_information_domains domain
    JOIN app_information_templates template ON template.domain_id=domain.id AND template.active=1
    JOIN app_information_template_workflows workflow ON workflow.template_id=template.id
      AND workflow.active=1 AND workflow.entry_scope='hierarchical'
    WHERE domain.active=1 AND domain.visibility<>'restricted' AND template.visibility<>'restricted'
    ORDER BY domain.id LIMIT 2`).all();
}

test("position thematic grants activate on occupancy, stay theme-scoped, transfer and revoke immediately", async () => {
  const database = await databaseWithMigrations();
  const organization = database.prepare("SELECT id FROM app_organizations WHERE active=1 AND type='district' ORDER BY id LIMIT 1").get();
  const position = database.prepare(`SELECT id FROM app_staff_positions
    WHERE active=1 AND organization_id=? AND title='Ma’lumot kirituvchi' LIMIT 1`).get(organization.id);
  const role = database.prepare("SELECT id FROM app_roles WHERE code='malumot_kirituvchi'").get();
  const first = database.prepare(`INSERT INTO app_employees
    (full_name,position,role_id,organization_id,active) VALUES ('Birinchi sinovchi','Ma’lumot kirituvchi',?,?,1) RETURNING *`)
    .get(role.id, organization.id);
  const second = database.prepare(`INSERT INTO app_employees
    (full_name,position,role_id,organization_id,active) VALUES ('Ikkinchi sinovchi','Ma’lumot kirituvchi',?,?,1) RETURNING *`)
    .get(role.id, organization.id);
  const [domainA, domainB] = hierarchicalDomains(database);
  assert.ok(domainA && domainB);
  database.prepare("UPDATE app_information_domain_assignments SET active=0 WHERE principal_type='staff_position' AND principal_id=?")
    .run(position.id);
  database.prepare(`UPDATE app_information_domain_assignments
    SET active=1,member_role='editor',grant_source='manual_admin',updated_at=CURRENT_TIMESTAMP
    WHERE principal_type='staff_position' AND principal_id=? AND domain_id=?`).run(position.id, domainA.id);

  const firstActor = actorFor(first, "malumot_kirituvchi", "district", { canEnterInformation: true, canSubmitInformation: true });
  const secondActor = actorFor(second, "malumot_kirituvchi", "district", { canEnterInformation: true, canSubmitInformation: true });
  assert.deepEqual((await informationDomainAccess(firstActor, asD1(database))).visible, []);

  database.prepare("INSERT INTO app_position_occupancies (staff_position_id,employee_id) VALUES (?,?)").run(position.id, first.id);
  const occupiedAccess = await informationDomainAccess(firstActor, asD1(database));
  assert.ok(occupiedAccess.visible.includes(Number(domainA.id)));
  assert.ok(occupiedAccess.editable.includes(Number(domainA.id)));
  assert.ok(!occupiedAccess.visible.includes(Number(domainB.id)));
  assert.deepEqual((await informationDomainAccess(secondActor, asD1(database))).visible, []);

  database.prepare("UPDATE app_position_occupancies SET ends_at=CURRENT_TIMESTAMP WHERE staff_position_id=? AND employee_id=? AND ends_at IS NULL")
    .run(position.id, first.id);
  database.prepare("INSERT INTO app_position_occupancies (staff_position_id,employee_id) VALUES (?,?)").run(position.id, second.id);
  assert.deepEqual((await informationDomainAccess(firstActor, asD1(database))).visible, []);
  assert.ok((await informationDomainAccess(secondActor, asD1(database))).editable.includes(Number(domainA.id)));

  database.prepare("UPDATE app_information_domain_assignments SET active=0 WHERE principal_type='staff_position' AND principal_id=? AND domain_id=?")
    .run(position.id, domainA.id);
  assert.deepEqual((await informationDomainAccess(secondActor, asD1(database))).visible, []);
});

test("territorial reviewer grants drive approval and restricted themes require an explicit manual grant", async () => {
  const database = await databaseWithMigrations();
  const organization = database.prepare("SELECT id FROM app_organizations WHERE active=1 AND type='territorial' ORDER BY id LIMIT 1").get();
  const position = database.prepare(`SELECT id FROM app_staff_positions
    WHERE active=1 AND organization_id=? AND title='Hududiy bo‘lim tasdiqlovchisi' LIMIT 1`).get(organization.id);
  const role = database.prepare("SELECT id FROM app_roles WHERE code='hudud_tasdiqlovchi'").get();
  const employee = database.prepare(`INSERT INTO app_employees
    (full_name,position,role_id,organization_id,active) VALUES ('Hududiy sinovchi','Hududiy bo‘lim tasdiqlovchisi',?,?,1) RETURNING *`)
    .get(role.id, organization.id);
  database.prepare("INSERT INTO app_position_occupancies (staff_position_id,employee_id) VALUES (?,?)").run(position.id, employee.id);
  const [domain] = hierarchicalDomains(database);
  const actor = actorFor(employee, "hudud_tasdiqlovchi", "territorial", {
    canEnterInformation: true, canSubmitInformation: true, canVerifyInformation: true,
  });
  const step = { step_code: "territorial_approval", organization_id: organization.id, department_id: null };
  assert.ok((await informationDomainAccess(actor, asD1(database))).reviewable.includes(Number(domain.id)));
  assert.equal(await canActorApproveInformationStep(asD1(database), actor, Number(domain.id), -1, step), true);

  database.prepare("UPDATE app_information_domains SET visibility='restricted' WHERE id=?").run(domain.id);
  const restricted = await informationDomainAccess(actor, asD1(database));
  assert.ok(!restricted.visible.includes(Number(domain.id)));
  assert.equal(await canActorApproveInformationStep(asD1(database), actor, Number(domain.id), -1, step), false);

  database.prepare(`UPDATE app_information_domain_assignments
    SET grant_source='manual_admin',active=1,updated_at=CURRENT_TIMESTAMP
    WHERE principal_type='staff_position' AND principal_id=? AND domain_id=?`).run(position.id, domain.id);
  const explicitlyGranted = await informationDomainAccess(actor, asD1(database));
  assert.ok(explicitlyGranted.reviewable.includes(Number(domain.id)));
  assert.ok(explicitlyGranted.restricted.includes(Number(domain.id)));
  assert.equal(await canActorApproveInformationStep(asD1(database), actor, Number(domain.id), -1, step), true);

  database.prepare("UPDATE app_information_domain_assignments SET active=0 WHERE principal_type='staff_position' AND principal_id=? AND domain_id=?")
    .run(position.id, domain.id);
  assert.equal(await canActorApproveInformationStep(asD1(database), actor, Number(domain.id), -1, step), false);
});

test("a personal support position cannot mutate its department-owned theme", async () => {
  const database = await databaseWithMigrations();
  const row = database.prepare(`SELECT employee.*,role.code AS role_code,organization.type AS organization_type,domain.id AS domain_id
    FROM app_employees employee
    JOIN app_roles role ON role.id=employee.role_id
    JOIN app_organizations organization ON organization.id=employee.organization_id
    JOIN app_information_domains domain ON domain.owner_department_id=employee.department_id AND domain.active=1
    WHERE employee.active=1 AND EXISTS (
      SELECT 1 FROM app_access_profile_assignments assignment
      JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id AND profile.code='employee_personal'
      WHERE assignment.active=1 AND assignment.principal_type='employee' AND assignment.principal_id=employee.id
    ) AND NOT EXISTS (
      SELECT 1 FROM app_access_profile_assignments assignment
      JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id
      WHERE assignment.active=1 AND assignment.principal_type='employee' AND assignment.principal_id=employee.id
        AND (profile.can_enter_information=1 OR profile.can_submit_information=1 OR profile.can_verify_information=1 OR profile.can_approve_information=1)
    ) ORDER BY employee.id LIMIT 1`).get();
  assert.ok(row, "the imported central schedule must retain at least one support/personal employee in an owner department");
  const access = await informationDomainAccess(actorFor(row, String(row.role_code), String(row.organization_type)), asD1(database));
  assert.ok(!access.editable.includes(Number(row.domain_id)));
  assert.ok(!access.reviewable.includes(Number(row.domain_id)));
});
