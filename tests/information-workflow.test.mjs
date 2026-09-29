import { readSource, flat } from './fixtures/source.mjs';
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

const {
  informationActionMutatesValues,
  informationDomainAccess,
  informationRecordScope,
  INFORMATION_INTEGRATION_ACTOR_SQL,
  isStrictCalendarDate,
  isStrictInformationDateTime,
  sanitizeInformationValues,
} = await import("../lib/information.ts");
const {
  buildInformationApprovalSteps,
  validateInformationCandidate,
} = await import("../lib/information-workflow.ts");

const migrationsDirectory = new URL("../drizzle/", import.meta.url);
const migrationPath = new URL("../drizzle/0022_information_workflow_and_quality.sql", import.meta.url);

async function applyMigrations(database) {
  const names = withSyntheticSeed((await readdir(migrationsDirectory)).filter((name) => /^\d{4}.*\.sql$/.test(name)).sort());
  for (const name of names) database.exec(await readFile(new URL(name, migrationsDirectory), "utf8"));
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

const basePermissions = {
  viewScope: "own", assignScope: "none", canCreateTask: false, canCreateMeeting: false,
  canExport: false, canManageOrganization: false, canManageRoles: false, canConfigure: false,
  canViewAudit: false, canUpdateAnyTask: false, canManageReports: false,
  canManageInformation: false, canViewRestrictedInformation: false, informationScope: "assigned",
  canEnterInformation: true, canSubmitInformation: true, canVerifyInformation: false, canApproveInformation: false,
};

function actorFor(employee, overrides = {}) {
  return {
    id: Number(employee.id), name: String(employee.full_name ?? "Sinov xodimi"), email: "", position: String(employee.position ?? ""),
    departmentId: employee.department_id == null ? null : Number(employee.department_id), department: "",
    organizationId: employee.organization_id == null ? null : Number(employee.organization_id), organization: "",
    organizationType: employee.organization_type == null ? null : String(employee.organization_type), managerId: null,
    roleId: Number(employee.role_id ?? 0), roleCode: String(employee.role_code ?? "xodim"), roleName: "", roleLevel: Number(employee.role_level ?? 50),
    username: null, mustChangePassword: false, permissions: { ...basePermissions }, ...overrides,
  };
}

test("information workflow migration is additive and configures every active template", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);

  const tableNames = database.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'app_information_%'`).all().map((row) => row.name);
  assert.ok(tableNames.includes("app_information_template_workflows"));
  assert.ok(tableNames.includes("app_information_record_approval_steps"));
  assert.ok(tableNames.includes("app_information_validation_issues"));

  const counts = database.prepare(`SELECT
    (SELECT COUNT(*) FROM app_information_templates WHERE active=1) AS templates,
    (SELECT COUNT(*) FROM app_information_template_workflows WHERE active=1) AS workflows`).get();
  assert.equal(Number(counts.workflows), Number(counts.templates));

  const centralOnly = database.prepare(`SELECT template.code
    FROM app_information_template_workflows workflow
    JOIN app_information_templates template ON template.id=workflow.template_id
    WHERE workflow.entry_scope='central_only' ORDER BY template.code`).all().map((row) => row.code);
  assert.deepEqual(centralOnly, [
    "SRC_DESIGN_COST_ANALYSIS_PROJECT_COST_OPTIMIZATION",
    "SRC_DIGITALIZATION_INNOVATION_INFORMATION_SYSTEMS",
    "SRC_DIGITALIZATION_INNOVATION_RESEARCH_INNOVATION",
  ]);
});

test("average salary workflow has period, formula and employee-count reconciliation rules", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);
  const row = database.prepare(`SELECT workflow.validation_rules_json
    FROM app_information_template_workflows workflow
    JOIN app_information_templates template ON template.id=workflow.template_id
    WHERE template.code='SRC_FINANCE_ECONOMY_AVERAGE_SALARY'`).get();
  const rules = JSON.parse(row.validation_rules_json);
  assert.deepEqual(rules.map((rule) => rule.type), ["period_required", "ratio_equals", "cross_template_distinct_count", "unique_business_key"]);
  assert.equal(rules[1].numerator, "ish_haqi_fondi");
  assert.equal(rules[1].denominator, "xodimlar_soni");
  assert.equal(rules[1].result, "ortacha_ish_haqi");
  assert.equal(rules[2].targetTemplateCode, "SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY");
  assert.equal(rules[2].targetDistinctField, "xodim_id");
  const averageFields = JSON.parse(database.prepare("SELECT fields_json FROM app_information_templates WHERE code='SRC_FINANCE_ECONOMY_AVERAGE_SALARY'").get().fields_json);
  for (const fieldCode of ["davr", "xodimlar_soni", "ish_haqi_fondi", "ortacha_ish_haqi"]) {
    assert.equal(averageFields.find((field) => field.code === fieldCode)?.required, true, `${fieldCode} must be required`);
  }
  const presentation = JSON.parse(database.prepare("SELECT presentation_json FROM app_information_templates WHERE code='SRC_FINANCE_ECONOMY_AVERAGE_SALARY'").get().presentation_json);
  assert.equal(presentation.aggregation.ortacha_ish_haqi.formula, "SUM(ish_haqi_fondi) / SUM(xodimlar_soni)");
  assert.equal(presentation.aggregation.ortacha_ish_haqi.weightField, "xodimlar_soni");

  const employeeRegistry = database.prepare(`SELECT template.fields_json,workflow.validation_rules_json
    FROM app_information_templates template JOIN app_information_template_workflows workflow ON workflow.template_id=template.id
    WHERE template.code='SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY'`).get();
  const employeeFields = JSON.parse(employeeRegistry.fields_json);
  assert.equal(employeeFields.find((field) => field.code === "davr")?.required, true);
  assert.equal(employeeFields.find((field) => field.code === "xodim_id")?.required, true);
  assert.ok(JSON.parse(employeeRegistry.validation_rules_json).some((rule) => rule.type === "unique_business_key"));
});

test("information values are normalized before required completeness and dates are calendar-strict", () => {
  const fields = [
    { code: "matn", label: "Matn", type: "text", required: true },
    { code: "son", label: "Son", type: "number", required: true },
    { code: "royxat", label: "Ro‘yxat", type: "multiselect", required: true },
  ];
  const empty = sanitizeInformationValues(fields, { matn: "   ", son: "  ", royxat: [" ", "\t"] });
  assert.deepEqual(empty.values, {});
  assert.equal(empty.completeness, 0);

  const normalized = sanitizeInformationValues(fields, { matn: "  Yo‘l  ", son: "0", royxat: [" ", "Birinchi", " Ikkinchi "] });
  assert.deepEqual(normalized.values, { matn: "Yo‘l", son: 0, royxat: ["Birinchi", "Ikkinchi"] });
  assert.equal(normalized.completeness, 100);

  assert.equal(isStrictCalendarDate("2026-02-28"), true);
  assert.equal(isStrictCalendarDate("2026-02-30"), false);
  assert.equal(isStrictCalendarDate("2026-13-01"), false);
  assert.equal(isStrictCalendarDate("2026-01-01extra"), false);
  assert.equal(isStrictInformationDateTime("2026-02-28T23:59"), true);
  assert.equal(isStrictInformationDateTime("2026-02-30T10:00"), false);
  assert.equal(isStrictInformationDateTime("2026-02-28 10:00"), false);
  assert.equal(isStrictInformationDateTime("2026-02-28T10:00+05:00junk"), false);
});

test("legacy information decisions are retained as auditable workflow steps", async () => {
  const database = new DatabaseSync(":memory:");
  const names = withSyntheticSeed((await readdir(migrationsDirectory)).filter((name) => /^\d{4}.*\.sql$/.test(name) && name < "0022").sort());
  for (const name of names) database.exec(await readFile(new URL(name, migrationsDirectory), "utf8"));
  const employeeId = Number(database.prepare("SELECT id FROM app_employees ORDER BY id LIMIT 1").get().id);
  const templateId = Number(database.prepare("SELECT id FROM app_information_templates WHERE active=1 ORDER BY id LIMIT 1").get().id);
  database.prepare(`INSERT INTO app_information_records
    (id,template_id,title,status,created_by_employee_id,updated_by_employee_id,reviewed_by_employee_id,reviewed_at,comment)
    VALUES (970001,?,'Oldingi tasdiqlangan hisobot','published',?,?,?,'2026-08-01T09:00:00Z','Tasdiqlangan')`)
    .run(templateId, employeeId, employeeId, employeeId);
  database.exec(await readFile(migrationPath, "utf8"));

  const step = database.prepare("SELECT * FROM app_information_record_approval_steps WHERE record_id=970001").get();
  assert.equal(step.step_code, "legacy_review");
  assert.equal(step.status, "approved");
  assert.equal(Number(step.acted_by_employee_id), employeeId);
  assert.equal(step.decision_comment, "Tasdiqlangan");
});

test("a non-central profile grants no theme until an explicit thematic membership is assigned", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);
  const organizationId = Number(database.prepare("SELECT id FROM app_organizations WHERE type='district' ORDER BY id LIMIT 1").get().id);
  const roleId = Number(database.prepare("SELECT id FROM app_roles WHERE code='malumot_kirituvchi'").get().id);
  const profileId = Number(database.prepare("SELECT id FROM app_access_profiles WHERE code='district_editor'").get().id);
  const employee = database.prepare(`INSERT INTO app_employees
    (full_name,position,role_id,organization_id,active) VALUES ('Sinov tuman operatori','Ma’lumot kirituvchi',?,?,1) RETURNING id`)
    .get(roleId, organizationId);
  database.prepare(`INSERT INTO app_access_profile_assignments
    (principal_type,principal_id,access_profile_id,scope_type,scope_id,grant_source)
    VALUES ('employee',?,?, 'organization',?,'test_activation')`).run(employee.id, profileId, organizationId);

  const capability = database.prepare(`SELECT 1 AS allowed
    FROM app_access_profile_assignments assignment
    JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id AND profile.active=1
    WHERE assignment.active=1 AND assignment.principal_type='employee' AND assignment.principal_id=?
      AND profile.can_enter_information=1`).get(employee.id);
  assert.equal(Number(capability.allowed), 1);
  const domain = database.prepare(`SELECT DISTINCT template.domain_id
    FROM app_information_templates template
    JOIN app_information_template_workflows workflow ON workflow.template_id=template.id AND workflow.active=1
    JOIN app_information_domains domain ON domain.id=template.domain_id AND domain.active=1
    WHERE template.active=1 AND workflow.entry_scope='hierarchical'
      AND template.visibility<>'restricted' AND domain.visibility<>'restricted' ORDER BY template.domain_id LIMIT 1`).get();
  const actor = actorFor({
    ...employee, organization_id: organizationId, organization_type: "district", department_id: null,
    role_id: roleId, role_code: "malumot_kirituvchi", role_level: 45,
  });

  const unassigned = await informationDomainAccess(actor, asD1(database));
  assert.deepEqual(unassigned.visible, []);
  assert.deepEqual(unassigned.editable, []);

  database.prepare(`INSERT INTO app_information_members
    (domain_id,employee_id,member_role,active,created_by_employee_id) VALUES (?,?, 'editor',1,?)`)
    .run(domain.domain_id, employee.id, employee.id);
  const assignedEditor = await informationDomainAccess(actor, asD1(database));
  assert.deepEqual(assignedEditor.visible, [Number(domain.domain_id)]);
  assert.deepEqual(assignedEditor.editable, [Number(domain.domain_id)]);
  assert.deepEqual(assignedEditor.reviewable, []);

  database.prepare("UPDATE app_information_members SET member_role='reviewer' WHERE domain_id=? AND employee_id=?")
    .run(domain.domain_id, employee.id);
  const assignedReviewer = await informationDomainAccess(actor, asD1(database));
  assert.deepEqual(assignedReviewer.visible, [Number(domain.domain_id)]);
  assert.deepEqual(assignedReviewer.editable, []);
  // A thematic label cannot escalate an editor profile into an approver.
  assert.deepEqual(assignedReviewer.reviewable, []);
});

test("committee leadership profiles read all themes while an ordinary subtree role does not", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);
  const domainCount = Number(database.prepare("SELECT COUNT(*) AS count FROM app_information_domains WHERE active=1").get().count);
  for (const roleCode of ["rahbar", "orinbosar"]) {
    const employee = database.prepare(`SELECT employee.*,organization.type AS organization_type,role.code AS role_code,role.level AS role_level
      FROM app_employees employee JOIN app_roles role ON role.id=employee.role_id
      LEFT JOIN app_organizations organization ON organization.id=employee.organization_id
      WHERE role.code=? AND employee.active=1 ORDER BY employee.id LIMIT 1`).get(roleCode);
    assert.ok(employee, `${roleCode} employee must exist`);
    const access = await informationDomainAccess(actorFor(employee, {
      permissions: { ...basePermissions, canEnterInformation: false, canSubmitInformation: false },
    }), asD1(database));
    assert.equal(access.visible.length, domainCount);
    assert.equal(access.restricted.length, domainCount);
    assert.deepEqual(access.editable, []);
    assert.deepEqual(access.reviewable, []);
  }

  const territorialId = Number(database.prepare("SELECT id FROM app_organizations WHERE type='territorial' ORDER BY id LIMIT 1").get().id);
  const role = database.prepare("SELECT id,code,level FROM app_roles WHERE code='hudud_rahbari'").get();
  const profileId = Number(database.prepare("SELECT id FROM app_access_profiles WHERE code='territorial_leadership'").get().id);
  const ordinary = database.prepare(`INSERT INTO app_employees
    (full_name,position,role_id,organization_id,active) VALUES ('Oddiy hududiy rahbar','Rahbar',?,?,1) RETURNING *`).get(role.id, territorialId);
  database.prepare(`INSERT INTO app_access_profile_assignments
    (principal_type,principal_id,access_profile_id,scope_type,scope_id,include_descendants,grant_source)
    VALUES ('employee',?,?, 'organization',?,1,'test')`).run(ordinary.id, profileId, territorialId);
  const ordinaryAccess = await informationDomainAccess(actorFor({
    ...ordinary, organization_type: "territorial", role_code: role.code, role_level: role.level,
  }, { permissions: { ...basePermissions, viewScope: "subtree", informationScope: "organization" } }), asD1(database));
  assert.deepEqual(ordinaryAccess.visible, []);
  assert.deepEqual(ordinaryAccess.restricted, []);
});

test("integration staging identity can never fall back to committee leadership", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);
  const selected = database.prepare(INFORMATION_INTEGRATION_ACTOR_SQL).get();
  assert.ok(selected);
  assert.ok(["admin", "integration_service"].includes(String(selected.role_code)));
  assert.notEqual(String(selected.role_code), "rahbar");
  assert.notEqual(String(selected.role_code), "orinbosar");
});

test("average salary cannot bypass required operands and reconciles an exact published employee registry period", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);
  const average = database.prepare(`SELECT template.id,template.domain_id,template.fields_json,workflow.owner_department_id,
      workflow.entry_scope,workflow.workflow_code,workflow.validation_rules_json
    FROM app_information_templates template JOIN app_information_template_workflows workflow ON workflow.template_id=template.id
    WHERE template.code='SRC_FINANCE_ECONOMY_AVERAGE_SALARY'`).get();
  const organizationId = Number(database.prepare("SELECT id FROM app_organizations WHERE type='district' ORDER BY id LIMIT 1").get().id);
  const workflow = {
    templateId: Number(average.id), templateCode: "SRC_FINANCE_ECONOMY_AVERAGE_SALARY", domainId: Number(average.domain_id),
    ownerDepartmentId: Number(average.owner_department_id), ownerOrganizationId: 2,
    entryScope: average.entry_scope, workflowCode: average.workflow_code,
    validationRules: JSON.parse(average.validation_rules_json),
  };
  const fields = JSON.parse(average.fields_json);
  const validate = (values, validationStage = "submit", period = {}) => validateInformationCandidate(asD1(database), fields, workflow, {
    organizationId, periodStart: period.start ?? null, periodEnd: period.end ?? null, values, isDemo: false, validationStage,
  });

  const middleOfMonth = await validate(
    { davr: "2026-07", xodimlar_soni: 2, ish_haqi_fondi: 200, ortacha_ish_haqi: 100 },
    "submit",
    { start: "2026-07-15", end: "2026-07-31" },
  );
  assert.ok(middleOfMonth.some((item) => item.ruleCode === "period_grain_mismatch"));
  const partialYear = await validate(
    { davr: "2026", xodimlar_soni: 2, ish_haqi_fondi: 200, ortacha_ish_haqi: 100 },
    "submit",
    { start: "2026-02-01", end: "2026-12-31" },
  );
  assert.ok(partialYear.some((item) => item.ruleCode === "period_grain_mismatch"));
  const exactMonth = await validate(
    { davr: "2026-07", xodimlar_soni: 2, ish_haqi_fondi: 200, ortacha_ish_haqi: 100 },
    "submit",
    { start: "2026-07-01", end: "2026-07-31" },
  );
  assert.ok(!exactMonth.some((item) => item.ruleCode === "period_grain_mismatch"));

  const missing = await validate({ davr: "2026-07" });
  assert.ok(missing.some((item) => item.ruleCode === "average_salary_formula_required_operands" && item.severity === "error"));

  const invalidZero = await validate({ davr: "2026-07", xodimlar_soni: 0, ish_haqi_fondi: 0, ortacha_ish_haqi: 1 });
  assert.ok(invalidZero.some((item) => item.ruleCode === "average_salary_formula" && item.severity === "error"));

  const fractional = await validate({ davr: "2026-07", xodimlar_soni: 1.5, ish_haqi_fondi: 150, ortacha_ish_haqi: 100 });
  assert.ok(fractional.some((item) => item.ruleCode === "average_salary_formula_employee_count"));

  const missingRegistry = await validate({ davr: "2026-07", xodimlar_soni: 2, ish_haqi_fondi: 200, ortacha_ish_haqi: 100 }, "final_approval");
  assert.ok(missingRegistry.some((item) => item.ruleCode === "payroll_employee_count" && item.severity === "error"));

  const registryTemplateId = Number(database.prepare("SELECT id FROM app_information_templates WHERE code='SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY'").get().id);
  const creatorId = Number(database.prepare("SELECT id FROM app_employees WHERE active=1 ORDER BY id LIMIT 1").get().id);
  for (const [index, employeeCode] of ["EMP-001", "EMP-002"].entries()) {
    const recordId = 980001 + index;
    database.prepare(`INSERT INTO app_information_records
      (id,template_id,organization_id,title,period_start,period_end,status,values_json,completeness_score,created_by_employee_id,updated_by_employee_id,published_at)
      VALUES (?,?,?,'Xodim reestri','2026-07-01','2026-07-31','published',?,100,?,?,CURRENT_TIMESTAMP)`)
      .run(recordId, registryTemplateId, organizationId, JSON.stringify({ davr: "2026-07", xodim_id: employeeCode }), creatorId, creatorId);
    database.prepare(`INSERT INTO app_information_values (record_id,field_code,value_type,value_text)
      VALUES (?,'xodim_id','text',?)`).run(recordId, employeeCode);
  }

  const matching = await validate({ davr: "2026-07", xodimlar_soni: 2, ish_haqi_fondi: 200, ortacha_ish_haqi: 100 }, "final_approval");
  assert.ok(!matching.some((item) => item.ruleCode === "payroll_employee_count"));
  const mismatching = await validate({ davr: "2026-07", xodimlar_soni: 3, ish_haqi_fondi: 300, ortacha_ish_haqi: 100 }, "final_approval");
  assert.ok(mismatching.some((item) => item.ruleCode === "payroll_employee_count" && item.severity === "error"));
  const wrongPeriod = await validate({ davr: "2026-08", xodimlar_soni: 2, ish_haqi_fondi: 200, ortacha_ish_haqi: 100 }, "final_approval");
  assert.ok(wrongPeriod.some((item) => item.ruleCode === "payroll_employee_count" && item.severity === "error"));
});

test("every active template has an explicit owner-department editor and a distinct eligible approver", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);
  const templates = database.prepare(`SELECT template.code,workflow.owner_department_id,department.organization_id
    FROM app_information_templates template JOIN app_information_template_workflows workflow ON workflow.template_id=template.id AND workflow.active=1
    JOIN app_departments department ON department.id=workflow.owner_department_id
    WHERE template.active=1`).all();
  const failures = [];
  for (const template of templates) {
    const ancestors = database.prepare(`WITH RECURSIVE scope(id,parent_id) AS (
      SELECT id,parent_id FROM app_departments WHERE id=? AND active=1
      UNION ALL SELECT parent.id,parent.parent_id FROM app_departments parent JOIN scope child ON child.parent_id=parent.id WHERE parent.active=1
    ) SELECT id FROM scope`).all(template.owner_department_id).map((row) => Number(row.id));
    const effective = database.prepare(`SELECT DISTINCT employee.id,profile.can_enter_information,profile.can_approve_information,assignment.scope_id
      FROM app_employees employee
      JOIN app_access_profile_assignments assignment ON assignment.active=1 AND (
        (assignment.principal_type='employee' AND assignment.principal_id=employee.id) OR
        (assignment.principal_type='staff_position' AND EXISTS (
          SELECT 1 FROM app_position_occupancies occupancy WHERE occupancy.staff_position_id=assignment.principal_id
            AND occupancy.employee_id=employee.id AND occupancy.ends_at IS NULL
        )))
      JOIN app_access_profiles profile ON profile.id=assignment.access_profile_id AND profile.active=1
      WHERE employee.active=1 AND employee.organization_id=? AND assignment.scope_type='department'`)
      .all(template.organization_id);
    const editors = effective.filter((row) => Number(row.can_enter_information) === 1 && Number(row.scope_id) === Number(template.owner_department_id));
    const approvers = effective.filter((row) => Number(row.can_approve_information) === 1 && ancestors.includes(Number(row.scope_id)));
    if (!editors.some((editor) => approvers.some((approver) => Number(approver.id) !== Number(editor.id)))) failures.push(template.code);
  }
  assert.deepEqual(failures, []);
});

test("district submissions follow district to territorial to central and invalid hierarchy is blocked", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);
  assert.equal(informationActionMutatesValues("save"), true);
  assert.equal(informationActionMutatesValues("submit"), true);
  assert.equal(informationActionMutatesValues("approve"), false);
  assert.equal(informationActionMutatesValues("return"), false);

  const routeRows = database.prepare(`WITH RECURSIVE route(origin_id,id,type,parent_id,depth) AS (
      SELECT id,id,type,parent_id,0 FROM app_organizations WHERE active=1 AND type='district'
      UNION ALL SELECT route.origin_id,parent.id,parent.type,parent.parent_id,route.depth+1
      FROM app_organizations parent JOIN route ON route.parent_id=parent.id WHERE parent.active=1 AND route.depth<12
    )
    SELECT district.id,district.name,
      MAX(CASE WHEN route.type='territorial' THEN route.id END) AS territorial_id
    FROM app_organizations district JOIN route ON route.origin_id=district.id
    WHERE district.active=1 AND district.type='district' GROUP BY district.id ORDER BY district.id`).all();
  assert.equal(routeRows.length, Number(database.prepare("SELECT COUNT(*) AS count FROM app_organizations WHERE active=1 AND type='district'").get().count));
  const invalidRoutes = routeRows.filter((row) => row.territorial_id == null);
  assert.ok(invalidRoutes.every((row) => database.prepare("SELECT 1 FROM app_information_route_exceptions WHERE organization_id=? AND active=1").get(row.id)));

  const validRoute = routeRows.find((row) => row.territorial_id != null);
  assert.ok(validRoute);
  const template = database.prepare(`SELECT template.id,template.code,template.domain_id,workflow.owner_department_id,department.organization_id owner_organization_id
    FROM app_information_templates template JOIN app_information_template_workflows workflow ON workflow.template_id=template.id
    JOIN app_departments department ON department.id=workflow.owner_department_id
    WHERE template.active=1 AND workflow.entry_scope='hierarchical' ORDER BY template.id LIMIT 1`).get();
  const editorRole = Number(database.prepare("SELECT id FROM app_roles WHERE code='malumot_kirituvchi'").get().id);
  const districtLeaderRole = Number(database.prepare("SELECT id FROM app_roles WHERE code='tuman_rahbari'").get().id);
  const territorialReviewerRole = Number(database.prepare("SELECT id FROM app_roles WHERE code='hudud_tasdiqlovchi'").get().id);
  const insertEmployee = (name, roleId, organizationId) => database.prepare(`INSERT INTO app_employees
    (full_name,position,role_id,organization_id,active) VALUES (?,'Sinov roli',?,?,1) RETURNING *`).get(name, roleId, organizationId);
  const assignProfile = (employeeId, profileCode, scopeType, scopeId) => database.prepare(`INSERT INTO app_access_profile_assignments
    (principal_type,principal_id,access_profile_id,scope_type,scope_id,grant_source)
    SELECT 'employee',?,id,?,?, 'workflow_test' FROM app_access_profiles WHERE code=?`).run(employeeId, scopeType, scopeId, profileCode);

  const editor = insertEmployee("Tuman ma’lumot kirituvchisi", editorRole, validRoute.id);
  const districtApprover = insertEmployee("Tuman tasdiqlovchisi", districtLeaderRole, validRoute.id);
  const territorialReviewer = insertEmployee("Hududiy mavzu tekshiruvchisi", territorialReviewerRole, validRoute.territorial_id);
  assignProfile(editor.id, "district_editor", "organization", validRoute.id);
  assignProfile(districtApprover.id, "district_leadership", "organization", validRoute.id);
  assignProfile(territorialReviewer.id, "territorial_unit_reviewer", "organization", validRoute.territorial_id);
  database.prepare(`INSERT INTO app_information_members (domain_id,employee_id,member_role,active,created_by_employee_id)
    VALUES (?,?,'editor',1,?),(?,?,'reviewer',1,?)`).run(
    template.domain_id, editor.id, editor.id, template.domain_id, territorialReviewer.id, editor.id,
  );
  const workflow = {
    templateId: Number(template.id), templateCode: String(template.code), domainId: Number(template.domain_id),
    ownerDepartmentId: Number(template.owner_department_id), ownerOrganizationId: Number(template.owner_organization_id),
    entryScope: "hierarchical", workflowCode: "organization_territorial_central", validationRules: [],
  };
  const steps = await buildInformationApprovalSteps(asD1(database), actorFor({
    ...editor, organization_type: "district", role_code: "malumot_kirituvchi", role_level: 45,
  }), workflow);
  assert.deepEqual(steps.map((step) => step.stepCode), ["organization_approval", "territorial_approval", "central_owner_approval"]);

  const centralId = Number(database.prepare("SELECT id FROM app_organizations WHERE active=1 AND type='central' ORDER BY id LIMIT 1").get().id);
  const invalid = database.prepare(`INSERT INTO app_organizations
    (name,short_name,type,parent_id,region_code,hierarchy_verified,active)
    VALUES ('Sinov noto‘g‘ri tuman tashkiloti','Sinov tuman','district',?,'invalid_route_test',0,1) RETURNING id,name`).get(centralId);
  await assert.rejects(
    buildInformationApprovalSteps(asD1(database), actorFor({
      id: 990000 + Number(invalid.id), full_name: "Noto‘g‘ri ierarxiya operatori", position: "Operator",
      organization_id: invalid.id, organization_type: "district", department_id: null,
      role_id: editorRole, role_code: "malumot_kirituvchi", role_level: 45,
    }), workflow),
    /hududiy bosh boshqarmaga biriktirilmagan/,
    String(invalid.name),
  );
});

test("an integration source key is immutable after its first staged record", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);
  const templateId = Number(database.prepare("SELECT id FROM app_information_templates WHERE active=1 ORDER BY id LIMIT 1").get().id);
  const employeeId = Number(database.prepare("SELECT id FROM app_employees WHERE active=1 ORDER BY id LIMIT 1").get().id);
  database.prepare(`INSERT INTO app_information_records
    (id,template_id,title,status,source_mode,source_record_key,values_json,created_by_employee_id,updated_by_employee_id)
    VALUES (990001,?,'Integratsiya qoralamasi','draft','api','IMMUTABLE-001','{"value":1}',?,?)`)
    .run(templateId, employeeId, employeeId);
  assert.throws(() => database.prepare(`INSERT INTO app_information_records
    (id,template_id,title,status,source_mode,source_record_key,values_json,created_by_employee_id,updated_by_employee_id)
    VALUES (990002,?,'Takror urinish','draft','api','IMMUTABLE-001','{"value":2}',?,?)`)
    .run(templateId, employeeId, employeeId), /UNIQUE constraint failed/);
  const original = database.prepare("SELECT status,values_json FROM app_information_records WHERE id=990001").get();
  assert.equal(original.status, "draft");
  assert.equal(original.values_json, '{"value":1}');
});

test("information record scope prevents sibling-district attachment access while parents and creators remain authorized", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);
  const pair = database.prepare(`SELECT first.parent_id,
      MIN(first.id) AS first_id,MAX(first.id) AS second_id
    FROM app_organizations first
    WHERE first.active=1 AND first.type='district' AND first.parent_id IS NOT NULL
    GROUP BY first.parent_id HAVING COUNT(*)>1 ORDER BY first.parent_id LIMIT 1`).get();
  assert.ok(pair && Number(pair.first_id) !== Number(pair.second_id));
  const templateId = Number(database.prepare("SELECT id FROM app_information_templates WHERE active=1 ORDER BY id LIMIT 1").get().id);
  const creatorId = Number(database.prepare("SELECT id FROM app_employees WHERE active=1 ORDER BY id LIMIT 1").get().id);
  database.prepare(`INSERT INTO app_information_records
    (id,template_id,organization_id,title,status,values_json,created_by_employee_id,updated_by_employee_id)
    VALUES (991101,?,?,'Birinchi tuman','draft','{}',?,?),
           (991102,?,?,'Ikkinchi tuman','draft','{}',?,?)`).run(
      templateId, Number(pair.first_id), creatorId, creatorId,
      templateId, Number(pair.second_id), creatorId, creatorId,
    );
  const scopedIds = (actor) => {
    const scope = informationRecordScope(actor);
    return database.prepare(`SELECT r.id FROM app_information_records r WHERE r.id IN (991101,991102) AND ${scope.sql} ORDER BY r.id`)
      .all(...scope.binds).map((row) => Number(row.id));
  };
  const districtActor = actorFor({ id: 991201, organization_id: pair.first_id }, {
    organizationId: Number(pair.first_id), permissions: { ...basePermissions, viewScope: "subtree" },
  });
  assert.deepEqual(scopedIds(districtActor), [991101]);
  const territorialActor = actorFor({ id: 991202, organization_id: pair.parent_id }, {
    organizationId: Number(pair.parent_id), permissions: { ...basePermissions, viewScope: "subtree" },
  });
  assert.deepEqual(scopedIds(territorialActor), [991101, 991102]);
  const globalActor = actorFor({ id: 991203, organization_id: null }, {
    organizationId: null, permissions: { ...basePermissions, viewScope: "all" },
  });
  assert.deepEqual(scopedIds(globalActor), [991101, 991102]);
  const creatorActor = actorFor({ id: creatorId, organization_id: pair.first_id }, {
    id: creatorId, organizationId: Number(pair.first_id), permissions: { ...basePermissions, viewScope: "own" },
  });
  assert.deepEqual(scopedIds(creatorActor), [991101, 991102]);

  const fileRoute = await readSource(new URL("../app/api/information/files/route.ts", import.meta.url));
  assert.match(fileRoute, /informationRecordScope\(actor, "r"\)/);
  assert.match(fileRoute, /informationDomainAccess\(actor\)/);
  assert.match(fileRoute, /WHERE r\.id=\? AND \$\{recordScope\.sql\}/);
  assert.match(flat(fileRoute), /informationFileUpload\(actor, \{ domainEditable: target\.access\.editable\.includes\(target\.domainId\)/);
  assert.match(fileRoute, /informationFileDelete\(\s*actor,\s*\{ domainEditable: target\.access\.editable\.includes\(target\.domainId\)/);
  assert.match(fileRoute, /canUploadInformationFile\(actor, record\.domainEditable\)/);
  assert.match(fileRoute, /canDeleteInformationFile\(actor, \{ domainEditable: record\.domainEditable/);
});

test("information API enforces origin ownership, ordered approval and persisted validation", async () => {
  const [route, workflow, access, ingest] = await Promise.all([
    readSource(new URL("../app/api/information/route.ts", import.meta.url)),
    readFile(new URL("../lib/information-workflow.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/information.ts", import.meta.url), "utf8"),
    readSource(new URL("../app/api/information/ingest/route.ts", import.meta.url)),
  ]);
  assert.match(route, /actor\.organizationId, actor\.departmentId, title/);
  assert.match(route, /requestedAction === "publish" \? "approve"/);
  assert.match(route, /\["approve", "return", "reject"\]/);
  assert.match(route, /currentInformationApprovalStep/);
  assert.match(route, /informationValidationStatements/);
  assert.match(route, /INFORMATION_VALIDATION_FAILED|validationErrorResponse/);
  assert.match(route, /workflow_scope\.entry_scope='central_only'/);
  assert.match(workflow, /organization_approval/);
  assert.match(workflow, /territorial_approval/);
  assert.match(workflow, /central_owner_approval/);
  assert.match(workflow, /Tuman yoki quyi tashkilot tasdig‘i/);
  assert.match(workflow, /tasdiqlovchi xodim tayinlanmagan/);
  assert.match(workflow, /actor\.id === creatorEmployeeId/);
  const approvalPolicy = workflow.slice(workflow.indexOf("export async function canActorApproveInformationStep("), workflow.indexOf("\nfunction issue("));
  assert.doesNotMatch(approvalPolicy, /actor\.roleLevel\s*<=\s*30/);
  assert.match(workflow, /app_access_profile_assignments/);
  assert.match(workflow, /cross_template_distinct_count/);
  assert.match(workflow, /r\.status='published'/);
  assert.match(workflow, /validationStage === "final_approval"/);
  assert.match(workflow, /unique_business_key/);
  assert.match(workflow, /components_sum/);
  assert.match(access, /workflowQueueDomains/);
  assert.doesNotMatch(access, /profileEntryDomains/);
  assert.match(access, /safe empty catalogue/);
  assert.match(access, /profile\.can_view_all_information=1/);
  assert.match(route, /informationActionMutatesValues\(action\)/);
  assert.match(ingest, /INFORMATION_INTEGRATION_ACTOR_SQL/);
  assert.match(access, /r\.code='admin'[\s\S]*canManageRoles/);
  assert.match(access, /r\.code='integration_service'[\s\S]*canConfigure/);
  assert.doesNotMatch(ingest, /ORDER BY CASE WHEN r\.code='admin' THEN 0 ELSE 1 END/);
});
