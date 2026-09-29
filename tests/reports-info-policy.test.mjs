import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Policies are pure; routes run with authentication, Telegram and background work mocked.
registerHooks({
  resolve(specifier, context, next) {
    if (/(?:^|\/)lib\/auth$/.test(specifier) || (context.parentURL?.includes('/lib/') && specifier === './auth')) return { url: 'test:auth', shortCircuit: true };
    if (/(?:^|\/)(?:lib\/)?telegram$/.test(specifier)) return { url: 'test:telegram', shortCircuit: true };
    if (/(?:^|\/)(?:lib\/)?background$/.test(specifier)) return { url: 'test:background', shortCircuit: true };
    if (specifier === 'next/headers') return { url: 'test:headers', shortCircuit: true };
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    const sources = {
      'test:headers': 'export async function headers(){return new Headers()}',
      'test:background': 'export function runInBackground(){}',
      'test:telegram': 'export async function enqueueReportNotification(){} export async function processNotificationJobs(){}',
      'test:auth': `export { ApiError } from ${JSON.stringify(new URL('../lib/errors.ts', import.meta.url).href)};
        export function apiError(error){return Response.json({error:error.message},{status:error.status??500})}
        export function assertSameOrigin(){} export function isSecureRequest(){return false}
        export function publicOrigin(request){return new URL(request.url).origin}
        export function requirePermission(actor,key){if(!actor.permissions[key])throw Object.assign(new Error('Denied'),{status:403})}
        export async function requireActor(){return globalThis.policyRuntime.actor}
        export async function organizationScopeIds(){return globalThis.policyRuntime.organizationIds ?? []}
        export async function employeeIdsInScopes(){return true} export async function audit(){}`,
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const reportPolicy = await import('../lib/policy/reports.ts');
const infoPolicy = await import('../lib/policy/information.ts');
const researchPolicy = await import('../lib/policy/research.ts');
const { readJsonBody } = await import('../lib/shared/body.ts');
const { SqliteD1Database } = await import('../db/sqlite-d1.ts');

const basePermissions = {
  viewScope: 'own', assignScope: 'none', canCreateTask: false, canCreateMeeting: false, canExport: false,
  canManageOrganization: false, canManageRoles: false, canConfigure: false, canViewAudit: false,
  canUpdateAnyTask: false, canManageReports: false, canManageInformation: false,
  canViewRestrictedInformation: false, informationScope: 'assigned', canEnterInformation: false,
  canSubmitInformation: false, canVerifyInformation: false, canApproveInformation: false,
};

function actor(id, overrides = {}) {
  const { permissions, ...rest } = overrides;
  return {
    id, name: `Xodim ${id}`, email: '', position: '', departmentId: null, department: '', organizationId: null,
    organization: '', organizationType: null, managerId: null, roleId: 1, roleCode: 'xodim', roleName: '',
    roleLevel: 50, username: null, mustChangePassword: false,
    permissions: { ...basePermissions, ...permissions }, ...rest,
  };
}

const outcome = (decision) => decision.allowed ? 'allow' : decision.status;

test('report policies: fill, delegate and review are separated (Y8) with the original status codes', () => {
  const report = {
    status: 'submitted', responsibleEmployeeId: 10, submittedByEmployeeId: 10, templateCreatorEmployeeId: 1,
    ownerDepartmentId: 7, parentResponsibleEmployeeId: 20, allowDelegation: true,
  };
  const creator = actor(1);
  const responsible = actor(10);
  const parent = actor(20);
  const ownerManager = actor(30, { departmentId: 7, permissions: { canManageReports: true } });
  const stranger = actor(40);
  const cases = [
    ['review', creator, report, 'allow'],
    ['review', parent, report, 'allow'],
    ['review', ownerManager, report, 'allow'],
    ['review', responsible, report, 403],
    ['review', actor(1), { ...report, submittedByEmployeeId: 1, templateCreatorEmployeeId: 1 }, 403],
    ['review', stranger, report, 403],
    ['review', creator, { ...report, status: 'draft' }, 409],
    ['fill', responsible, { ...report, status: 'draft' }, 'allow'],
    ['fill', responsible, report, 409],
    ['fill', stranger, { ...report, status: 'draft' }, 403],
    ['delegate', responsible, { ...report, status: 'new' }, 'allow'],
    ['delegate', responsible, { ...report, status: 'new', allowDelegation: false }, 409],
    ['delegate', stranger, { ...report, status: 'new' }, 403],
    ['delegate', responsible, { ...report, status: 'approved' }, 409],
  ];
  const decide = { review: reportPolicy.reportReview, fill: reportPolicy.reportFill, delegate: reportPolicy.reportDelegate };
  for (const [action, who, facts, expected] of cases) {
    assert.equal(outcome(decide[action](who, facts)), expected, `${action} by #${who.id} on ${facts.status}`);
  }
  assert.deepEqual(reportPolicy.reportCapabilities(responsible, report), { edit: false, delegate: false, review: false });
  assert.deepEqual(reportPolicy.reportCapabilities(creator, report), { edit: false, delegate: false, review: true });
  assert.equal(outcome(reportPolicy.reportAssignmentView(false)), 404);
});

test('information policies: domain entry, record-only queue access (Y10), sensitive files (Y9), archive', () => {
  const access = { editable: [5], restricted: [], recordDomains: [5], queueRecordIds: [99], visible: [5, 6], reviewable: [] };
  assert.equal(outcome(infoPolicy.informationRecordCreate(access, { domainId: 5, visibility: 'internal' })), 'allow');
  assert.equal(outcome(infoPolicy.informationRecordCreate(access, { domainId: 6, visibility: 'internal' })), 403);
  assert.equal(outcome(infoPolicy.informationRecordCreate(access, { domainId: 5, visibility: 'restricted' })), 403);
  // A queued record opens even in a domain the reviewer cannot otherwise browse; its neighbours do not.
  assert.equal(outcome(infoPolicy.informationRecordOpen(access, { recordId: 99, domainId: 6, templateVisibility: 'restricted' })), 'allow');
  assert.equal(outcome(infoPolicy.informationRecordOpen(access, { recordId: 100, domainId: 6, templateVisibility: 'internal' })), 403);
  assert.equal(outcome(infoPolicy.informationRecordOpen(access, { recordId: 101, domainId: 5, templateVisibility: 'restricted' })), 403);
  assert.equal(outcome(infoPolicy.informationRecordAction(['save'], 'approve')), 403);

  const fields = JSON.stringify([{ code: 'passport', type: 'file', sensitive: true }, { code: 'photo', type: 'file' }]);
  const plain = actor(1);
  const cleared = actor(2, { permissions: { canViewRestrictedInformation: true } });
  assert.equal(outcome(infoPolicy.informationFileDownload(plain, { fieldCode: 'passport', templateFieldsJson: fields })), 404);
  assert.equal(outcome(infoPolicy.informationFileDownload(cleared, { fieldCode: 'passport', templateFieldsJson: fields })), 'allow');
  assert.equal(outcome(infoPolicy.informationFileDownload(plain, { fieldCode: 'photo', templateFieldsJson: fields })), 'allow');

  const enterer = actor(3, { permissions: { canEnterInformation: true } });
  assert.equal(outcome(infoPolicy.informationFileUpload(enterer, { domainEditable: true, status: 'draft' })), 'allow');
  assert.equal(outcome(infoPolicy.informationFileUpload(enterer, { domainEditable: true, status: 'submitted' })), 409);
  assert.equal(outcome(infoPolicy.informationFileDelete(enterer, { domainEditable: true, status: 'draft' }, { uploadedByEmployeeId: 3 })), 'allow');
  assert.equal(outcome(infoPolicy.informationFileDelete(enterer, { domainEditable: true, status: 'draft' }, { uploadedByEmployeeId: 4 })), 403);

  assert.equal(outcome(infoPolicy.informationRecordArchive(actor(5, { roleCode: 'admin' }), { ownerDepartmentId: null })), 'allow');
  assert.equal(outcome(infoPolicy.informationRecordArchive(actor(6, { departmentId: 8, roleLevel: 30 }), { ownerDepartmentId: 8 })), 'allow');
  assert.equal(outcome(infoPolicy.informationRecordArchive(actor(7, { departmentId: 8, roleLevel: 40 }), { ownerDepartmentId: 8 })), 403);
});

test('research stage policies keep submitter, verifier and committee reviewer distinct', () => {
  const context = { ownerDepartmentId: 40, domainEditable: true, domainReviewable: true };
  const project = { executorOrganizationId: 80, responsibleEmployeeId: 12, coordinatorDepartmentId: 40, createdByEmployeeId: 5, status: 'institute_review' };
  const verifier = actor(13, { organizationId: 80, permissions: { canVerifyInformation: true } });
  const committee = actor(6, { departmentId: 40, permissions: { canVerifyInformation: true } });
  const milestone = { submitted_by_employee_id: 12, verified_by_employee_id: null };
  assert.equal(outcome(researchPolicy.researchStageVerify(verifier, project, milestone, context)), 'allow');
  assert.equal(outcome(researchPolicy.researchStageVerify(verifier, project, { ...milestone, submitted_by_employee_id: 13 }, context)), 403);
  assert.equal(outcome(researchPolicy.researchStageFinalReview(committee, project, { ...milestone, verified_by_employee_id: 13 }, context)), 'allow');
  assert.equal(outcome(researchPolicy.researchStageFinalReview(committee, project, { ...milestone, verified_by_employee_id: 6 }, context)), 403);
  assert.equal(outcome(researchPolicy.researchStageFinalReview(actor(5, { departmentId: 40, permissions: { canVerifyInformation: true } }), project, milestone, context)), 403);
  assert.equal(outcome(researchPolicy.researchDomainView({ ...context, domainVisible: false })), 403);
  assert.equal(researchPolicy.researchUploadKind(actor(12, { organizationId: 80, permissions: { canSubmitInformation: true } }), { ...project, status: 'active' }, context, 'evidence', true), 'evidence');
  assert.equal(researchPolicy.researchUploadKind(actor(12, { organizationId: 80, permissions: { canSubmitInformation: true } }), { ...project, status: 'active' }, context, 'passport', false), null);
});

function jsonRequest(body, headers = {}) {
  return new Request('http://test.local/api/reports', { method: 'PATCH', body, headers: { 'content-type': 'application/json', ...headers } });
}

test('JSON bodies are capped (413) by declared length and while streaming', async () => {
  assert.deepEqual(await readJsonBody(jsonRequest('{"a":1}')), { a: 1 });
  await assert.rejects(readJsonBody(jsonRequest('{"a":1}', { 'content-length': String(3 * 1024 * 1024) })), (error) => error.status === 413);
  const big = new ReadableStream({
    start(controller) {
      for (let index = 0; index < 5; index += 1) controller.enqueue(new Uint8Array(1024).fill(32));
      controller.close();
    },
  });
  const streamed = new Request('http://test.local/', { method: 'POST', body: big, duplex: 'half' });
  await assert.rejects(readJsonBody(streamed, 4096), (error) => error.status === 413);
  await assert.rejects(readJsonBody(jsonRequest('[1,2]')), (error) => error.status === 400);
  await assert.rejects(readJsonBody(jsonRequest('{broken')), (error) => error.status === 400);

  globalThis.policyRuntime = { actor: actor(1) };
  const reports = await import('../app/api/reports/route.ts');
  const response = await reports.PATCH(jsonRequest('{"assignmentId":1}', { 'content-length': String(64 * 1024 * 1024) }));
  assert.equal(response.status, 413);
  assert.match((await response.json()).error, /hajmi juda katta/);
});

function researchDatabase() {
  const db = new SqliteD1Database(':memory:');
  const dir = new URL('../drizzle/', import.meta.url);
  for (const name of withSyntheticSeed(readdirSync(dir).filter((name) => /^\d{4}.*\.sql$/.test(name)).sort())) {
    db.database.exec(readFileSync(new URL(name, dir), 'utf8'));
  }
  return db;
}

test('research dashboard reads child rows only for visible projects and pages events per project', async () => {
  const db = researchDatabase();
  const raw = db.database;
  const { getResearchDashboard, RESEARCH_EVENTS_PER_PROJECT } = await import('../lib/research-server.ts');
  const pair = raw.prepare(`SELECT organization.id AS organization_id,employee.id AS employee_id FROM app_organizations organization
    JOIN app_employees employee ON employee.organization_id=organization.id AND employee.active=1
    WHERE organization.active=1 ORDER BY organization.id,employee.id LIMIT 1`).get();
  const coordinator = raw.prepare("SELECT id FROM app_departments WHERE name='Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi' AND active=1 LIMIT 1").get();
  const admin = raw.prepare("SELECT e.id FROM app_employees e JOIN app_roles r ON r.id=e.role_id WHERE r.code='admin' ORDER BY e.id LIMIT 1").get();
  const insertProject = raw.prepare(`INSERT INTO app_research_projects
    (code,title,kind,area,executor_organization_id,responsible_employee_id,coordinator_department_id,
     problem,objective,expected_result,start_date,end_date,budget,created_by_employee_id,updated_by_employee_id)
    VALUES (?,?,'research','Qoplama',?,?,?,'Muammo','Maqsad','Natija','2026-01-01','2026-12-31',100,?,?) RETURNING id`);
  const projectA = Number(insertProject.get('DASH-A', 'A loyiha', pair.organization_id, pair.employee_id, coordinator.id, admin.id, admin.id).id);
  const projectB = Number(insertProject.get('DASH-B', 'B loyiha', pair.organization_id, pair.employee_id, coordinator.id, admin.id, admin.id).id);
  const milestone = raw.prepare("INSERT INTO app_research_milestones (project_id,stage,name,planned_date,status) VALUES (?,?,?,?,?)");
  milestone.run(projectA, 1, 'Birinchi', '2026-02-01', 'active');
  milestone.run(projectB, 1, 'Birinchi', '2026-02-01', 'active');
  const event = raw.prepare("INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json) VALUES (?,?,'research_project',?,?)");
  for (let index = 0; index < 30; index += 1) event.run(admin.id, 'research.note', projectA, JSON.stringify({ eventType: 'note', comment: `A${index}` }));
  for (let index = 0; index < 3; index += 1) event.run(admin.id, 'research.note', projectB, JSON.stringify({ eventType: 'note', comment: `B${index}` }));
  // An event for a project id nobody can see must never be read into the response.
  event.run(admin.id, 'research.note', 999999, JSON.stringify({ eventType: 'note', comment: 'hidden' }));

  const researchAdmin = actor(Number(admin.id), {
    roleCode: 'admin',
    permissions: { viewScope: 'all', informationScope: 'all', canManageRoles: true, canManageReports: true, canManageInformation: true, canViewRestrictedInformation: true, canEnterInformation: true, canSubmitInformation: true, canVerifyInformation: true, canApproveInformation: true },
  });
  const dashboard = await getResearchDashboard(researchAdmin, db);
  const byProject = (events, id) => events.filter((item) => item.projectId === id);
  assert.equal(byProject(dashboard.events, projectA).length, RESEARCH_EVENTS_PER_PROJECT);
  assert.equal(byProject(dashboard.events, projectB).length, 3);
  assert.ok(!dashboard.events.some((item) => item.comment === 'hidden'));
  assert.deepEqual(dashboard.eventsHasMore, [projectA]);
  assert.deepEqual(new Set(dashboard.milestones.map((item) => item.projectId)), new Set([projectA, projectB]));

  const oldest = Math.min(...byProject(dashboard.events, projectA).map((item) => item.id));
  const older = await getResearchDashboard(researchAdmin, db, { eventsProjectId: projectA, eventsBefore: oldest });
  assert.equal(older.events.length, 30 - RESEARCH_EVENTS_PER_PROJECT);
  assert.ok(older.events.every((item) => item.projectId === projectA && item.id < oldest));
  assert.deepEqual(older.eventsHasMore, []);
  db.close();
});
