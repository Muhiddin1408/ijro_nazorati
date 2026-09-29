import { readSource } from './fixtures/source.mjs';
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
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[a-z]+$/i.test(specifier)) {
      for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
        const url = new URL(candidate, context.parentURL);
        if (existsSync(fileURLToPath(url))) return nextResolve(url.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const policy = await import("../lib/research-policy.ts");
const migrationsDirectory = new URL("../drizzle/", import.meta.url);

async function applyMigrations(database) {
  const names = withSyntheticSeed((await readdir(migrationsDirectory)).filter((name) => /^\d{4}.*\.sql$/.test(name)).sort());
  for (const name of names) database.exec(await readFile(new URL(name, migrationsDirectory), "utf8"));
}

const permissions = {
  viewScope: "own", assignScope: "none", canCreateTask: false, canCreateMeeting: false,
  canExport: false, canManageOrganization: false, canManageRoles: false, canConfigure: false,
  canViewAudit: false, canUpdateAnyTask: false, canManageReports: false,
  canManageInformation: false, canViewRestrictedInformation: false, informationScope: "assigned",
  canEnterInformation: false, canSubmitInformation: false, canVerifyInformation: false, canApproveInformation: false,
};

function actor(id, overrides = {}) {
  return {
    id, name: `Xodim ${id}`, email: "", position: "", departmentId: null, department: "",
    organizationId: null, organization: "", organizationType: null, managerId: null,
    roleId: 1, roleCode: "xodim", roleName: "", roleLevel: 50, username: null,
    mustChangePassword: false, permissions: { ...permissions }, ...overrides,
  };
}

test("research migration is additive, constrained and contains no demo rows", async () => {
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys=ON");
  await applyMigrations(database);
  const tables = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%research%' ORDER BY name").all().map((row) => row.name);
  assert.deepEqual(tables, [
    "app_research_files",
    "app_research_intake_items",
    "app_research_milestones",
    "app_research_projects",
  ]);
  assert.equal(Number(database.prepare("SELECT COUNT(*) AS count FROM app_research_projects").get().count), 0);
  assert.equal(Number(database.prepare("SELECT COUNT(*) AS count FROM app_research_intake_items").get().count), 0);

  const directoryRow = database.prepare(`SELECT organization.id AS organization_id,employee.id AS employee_id
    FROM app_organizations organization
    JOIN app_employees employee ON employee.organization_id=organization.id AND employee.active=1
    WHERE organization.active=1 ORDER BY organization.id,employee.id LIMIT 1`).get();
  assert.ok(directoryRow, "Kamida bitta real tashkilot-xodim juftligi bo‘lishi kerak");
  const organizationId = Number(directoryRow.organization_id);
  const responsibleId = Number(directoryRow.employee_id);
  const creatorId = Number(database.prepare("SELECT id FROM app_employees WHERE active=1 ORDER BY id LIMIT 1").get().id);
  const coordinatorId = Number(database.prepare("SELECT id FROM app_departments WHERE name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi' AND active=1 LIMIT 1").get().id);
  const projectId = Number(database.prepare(`INSERT INTO app_research_projects
    (code,title,kind,area,executor_organization_id,responsible_employee_id,coordinator_department_id,
     problem,objective,expected_result,start_date,end_date,budget,created_by_employee_id,updated_by_employee_id)
    VALUES ('TEST-RESEARCH-1','Sinov loyihasi','research','Qoplama',?,?,?,?,?,?, '2026-01-01','2026-12-31',100,?,?) RETURNING id`)
    .get(organizationId, responsibleId, coordinatorId, "Muammo", "Maqsad", "Natija", creatorId, creatorId).id);
  database.prepare("INSERT INTO app_research_milestones (project_id,stage,name,planned_date,status) VALUES (?,?,?,?,?)")
    .run(projectId, 1, "Birinchi", "2026-02-01", "active");
  const milestoneId = Number(database.prepare(
    "SELECT id FROM app_research_milestones WHERE project_id=? AND stage=1",
  ).get(projectId).id);
  const zeroBudgetProjectId = Number(database.prepare(`INSERT INTO app_research_projects
    (code,title,kind,area,executor_organization_id,responsible_employee_id,coordinator_department_id,
     problem,objective,expected_result,start_date,end_date,budget,created_by_employee_id,updated_by_employee_id)
    VALUES ('TEST-RESEARCH-ZERO','Nol budjetli loyiha','research','Qoplama',?,?,?,?,?,?, '2026-01-01','2026-12-31',0,?,?) RETURNING id`)
    .get(organizationId, responsibleId, coordinatorId, "Muammo", "Maqsad", "Natija", creatorId, creatorId).id);
  assert.throws(
    () => database.prepare("UPDATE app_research_projects SET spent=1 WHERE id=?").run(zeroBudgetProjectId),
    /CHECK constraint failed/,
  );
  assert.throws(() => database.prepare("INSERT INTO app_research_milestones (project_id,stage,name,planned_date) VALUES (?,?,?,?)").run(projectId, 7, "Noto‘g‘ri", "2026-03-01"));
  assert.throws(() => database.prepare("INSERT INTO app_research_milestones (project_id,stage,name,planned_date) VALUES (?,?,?,?)").run(projectId, 1, "Takror", "2026-03-01"));
  assert.throws(() => database.prepare(`INSERT INTO app_research_intake_items
    (kind,code,title,area,summary,payload_json,created_by_employee_id,updated_by_employee_id)
    VALUES ('topic','BAD-JSON','Mavzu','Qoplama','Asos','{',?,?)`).run(creatorId, creatorId));
  assert.throws(() => database.prepare(`INSERT INTO app_research_files
    (project_id,purpose,object_key,file_name,content_type,size,uploaded_by_employee_id)
    VALUES (?,'passport','bad-size','x.pdf','application/pdf',15728641,?)`).run(projectId, creatorId));
  assert.throws(() => database.prepare(`INSERT INTO app_research_files
    (project_id,milestone_id,purpose,object_key,file_name,content_type,size,uploaded_by_employee_id)
    VALUES (?,?,'evidence','cross-project','x.pdf','application/pdf',1,?)`)
    .run(zeroBudgetProjectId, milestoneId, creatorId), /FOREIGN KEY constraint failed/);
  assert.equal(database.prepare(`INSERT INTO app_research_files
    (project_id,milestone_id,purpose,object_key,file_name,content_type,size,uploaded_by_employee_id)
    VALUES (?,?,'evidence','same-project','x.pdf','application/pdf',1,?)`)
    .run(projectId, milestoneId, creatorId).changes, 1);
});

test("research policy keeps leadership read-only and scopes every mutation to exact owners", () => {
  const context = { ownerDepartmentId: 40, domainEditable: true, domainReviewable: true };
  const project = { executorOrganizationId: 80, responsibleEmployeeId: 12, coordinatorDepartmentId: 40, createdByEmployeeId: 5, status: "active" };
  const ownerEditor = actor(5, { departmentId: 40, permissions: { ...permissions, canEnterInformation: true } });
  const ownerReviewer = actor(6, { departmentId: 40, permissions: { ...permissions, canVerifyInformation: true } });
  const responsible = actor(12, { organizationId: 80, permissions: { ...permissions, canSubmitInformation: true } });
  const verifier = actor(13, { organizationId: 80, permissions: { ...permissions, canVerifyInformation: true } });
  const sibling = actor(14, { organizationId: 81, permissions: { ...permissions, canSubmitInformation: true, canVerifyInformation: true } });
  const leadership = actor(20, { roleCode: "rahbar", permissions: { ...permissions, viewScope: "all", canManageReports: true, canManageInformation: true, canEnterInformation: true, canVerifyInformation: true } });

  assert.equal(policy.canCreateResearchProject(ownerEditor, context), true);
  assert.equal(policy.canReviewResearchProject(ownerReviewer, context), true);
  assert.equal(policy.canContributeResearchProject(responsible, project, context), true);
  assert.equal(policy.canVerifyResearchProject(verifier, project, context), true);
  assert.equal(policy.canVerifyResearchProject(responsible, project, context), false);
  assert.equal(policy.canContributeResearchProject(sibling, project, context), false);
  assert.equal(policy.canVerifyResearchProject(sibling, project, context), false);
  assert.equal(policy.canViewResearchProject(sibling, project, context), false);
  assert.equal(policy.canViewResearchProject(leadership, project, context), true);
  assert.equal(policy.canCreateResearchProject(leadership, context), false);
  assert.equal(policy.canReviewResearchProject(leadership, context), false);
  assert.equal(policy.canUploadResearchFile(leadership, project, context), false);
  assert.equal(policy.canViewResearchProject(responsible, project, { ...context, domainVisible: false }), false);
  assert.equal(policy.canViewResearchProject(leadership, project, { ...context, domainVisible: false }), false);
});

test("research workspace is embedded in its Information Center domain and uses secured server contracts", async () => {
  const researchServiceFiles = ["common", "audit", "directory", "projects", "index", "projects-actions", "stage-actions", "intake-actions"];
  const [researchPolicy, ...researchServices] = await Promise.all([
    readFile(new URL("../lib/policy/research.ts", import.meta.url), "utf8"),
    ...researchServiceFiles.map((name) => readFile(new URL(`../services/research/${name}.ts`, import.meta.url), "utf8")),
  ]);
  const [dashboard, reportsPage, ui, routeFile, server, fileRoute, migration, darkTheme, center] = await Promise.all([
    readSource(new URL("../app/dashboard.tsx", import.meta.url)),
    readSource(new URL("../app/reports-page.tsx", import.meta.url)),
    readSource(new URL("../app/research-reports.tsx", import.meta.url)),
    readSource(new URL("../app/api/research/route.ts", import.meta.url)),
    readFile(new URL("../lib/research-server.ts", import.meta.url), "utf8"),
    readSource(new URL("../app/api/reports/research/files/route.ts", import.meta.url)),
    readFile(new URL("../drizzle/0026_research_workflow.sql", import.meta.url), "utf8"),
    readSource(new URL("../app/dark-theme.css", import.meta.url)),
    readSource(new URL("../app/information-center.tsx", import.meta.url)),
  ]);
  // The route is a thin dispatcher; the workflow lives in services/research and lib/policy/research.
  const route = [routeFile, researchPolicy, ...researchServices].join("\n");
  const routeOnly = await readFile(new URL("../app/api/research/route.ts", import.meta.url), "utf8");
  assert.ok(routeOnly.split("\n").length < 80, "research route must stay a thin dispatcher");
  assert.match(routeFile, /handleResearchAction/);
  // The navigation registry lives in app/_components/dashboard/navigation.ts (typed keys → labels → items).
  const navStart = dashboard.indexOf("export const NAV_LABELS = {");
  const navEnd = dashboard.indexOf("return items.filter((item) => item.show)", navStart);
  assert.ok(navStart >= 0 && navEnd > navStart, "Top-level navigation registry must be present");
  const topLevelNavigation = dashboard.slice(navStart, navEnd);
  assert.match(topLevelNavigation, /reports: "Hisobotlar"/);
  assert.match(topLevelNavigation, /label: NAV_LABELS\.reports/);
  assert.doesNotMatch(topLevelNavigation, /Ilmiy tadqiqotlar/);
  assert.doesNotMatch(dashboard, /activeNav === "Ilmiy tadqiqotlar"/);
  assert.doesNotMatch(reportsPage, /<ResearchReports|tab === "research"/);
  assert.match(center, /selectedDomain\?\.code === DIGITALIZATION_DOMAIN_CODE/);
  assert.match(center, /<ResearchReports/);
  assert.match(center, /<InformationDataWorkspace/);
  assert.match(dashboard, /import\("(?:\.\/|(?:\.\.\/)+)reports-page"\)/);
  assert.doesNotMatch(dashboard, /<ResearchReports/);
  assert.match(ui, /\/api\/information\/research/);
  assert.doesNotMatch(ui, /\/api\/research/);
  assert.match(route, /requireActor/);
  assert.match(route, /assertSameOrigin/);
  assert.match(route, /action === "verify_stage"/);
  assert.match(route, /canVerifyResearchProject/);
  assert.match(route, /canReviewResearchProject/);
  assert.match(route, /function projectAuditById/);
  assert.match(route, /function intakeAuditByCode/);
  assert.doesNotMatch(route, /await projectEvent|await intakeEvent/);
  assert.ok(
    (route.match(/assertAuditInserted/g) ?? []).length >= 14,
    "every research mutation must validate its in-batch audit statement",
  );
  assert.match(route, /submit_proposal: submitProposal/);
  assert.match(route, /export async function submitProposal[\s\S]{0,400}researchProposalSubmit\(actor, context\)/);
  assert.match(researchPolicy, /export function researchProposalSubmit[\s\S]{0,400}context\.domainEditable/);
  assert.match(server, /record\.values_json/);
  assert.match(server, /record\.is_demo=0/);
  assert.match(server, /catalogScope = informationRecordScope\(actor, "record"\)/);
  assert.match(server, /authorize\(researchDomainView\(context\)\)/);
  assert.match(researchPolicy, /context\.domainVisible !== false/);
  assert.match(server, /submitProposal:\s*Boolean\(actor\.organizationId\)[\s\S]{0,240}context\.domainEditable/);
  assert.doesNotMatch(server, /record\.record_date|record\.summary_json/);
  assert.doesNotMatch(route, /ensureResearchSeed|researchRoleForActor|INSERT OR IGNORE INTO research_/);
  assert.doesNotMatch(fileRoute, /request\.formData\(/);
  assert.match(fileRoute, /content-length/);
  assert.match(fileRoute, /researchFileDownload\(actor, project, context\)/);
  assert.match(fileRoute, /researchProjectView\(actor, project, context\)/);
  assert.match(researchPolicy, /export function researchFileDownload[\s\S]{0,200}canViewResearchProject/);
  assert.match(fileRoute, /BUCKET\.delete\(objectKey\)/);
  assert.doesNotMatch(migration, /CREATE TABLE IF NOT EXISTS `research_/);
  assert.match(ui, /research-dialog-content/);
  assert.match(darkTheme, /\.research-report-panel \.research-workspace/);
  assert.match(darkTheme, /\.research-dialog-content/);
  assert.match(darkTheme, /body:has\(\.research-report-panel\) \[data-slot="select-content"\]/);
});
