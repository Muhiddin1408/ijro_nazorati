import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Run the real route handlers against SQLite transactions and a controllable
// object store. Only authentication, environment and outbound delivery are mocked.
registerHooks({
  resolve(specifier, context, next) {
    if (/(?:^|\/)db$/.test(specifier)) return { url: 'test:db', shortCircuit: true };
    if (/(?:^|\/)lib\/auth$/.test(specifier) || (context.parentURL?.includes('/lib/') && specifier === './auth')) return { url: 'test:auth', shortCircuit: true };
    if (/(?:^|\/)(?:lib\/)?telegram$/.test(specifier)) return { url: 'test:telegram', shortCircuit: true };
    if (/(?:^|\/)(?:lib\/)?background$/.test(specifier)) return { url: 'test:background', shortCircuit: true };
    if (specifier.startsWith('.')) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    const sources = {
      'test:db': 'export async function getD1(){return globalThis.tableRuntime.db} export async function getRuntimeEnv(){return {BUCKET:globalThis.tableRuntime.bucket}}',
      'test:background': 'export function runInBackground(){}',
      'test:telegram': 'export async function enqueueReportNotification(){} export async function processNotificationJobs(){}',
      'test:auth': `export class ApiError extends Error {constructor(status,message){super(message);this.status=status}}
        export function apiError(error){return Response.json({error:error.message},{status:error.status??500})}
        export function assertSameOrigin(){} export function isSecureRequest(){return false} export function publicOrigin(request){return new URL(request.url).origin} export function requirePermission(actor,key){if(!actor.permissions[key])throw new ApiError(403,'Denied')}
        export async function requireActor(){return globalThis.tableRuntime.actor}
        export async function organizationScopeIds(){return globalThis.tableRuntime.organizationIds}
        export async function employeeIdsInScopes(){return true} export async function audit(){}`,
    };
    if (url in sources) return { format: 'module', source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const sheet = await import('../lib/report-sheet.ts');
const excel = await import('../lib/report-excel.ts');
const input = await import('../lib/information-input.ts');
const table = await import('../lib/table-values.ts');
const info = await import('../lib/information.ts');
const workflow = await import('../lib/information-workflow.ts');
const reports = await import('../app/api/reports/route.ts');
const reportFiles = await import('../app/api/reports/files/route.ts');
const information = await import('../app/api/information/route.ts');
const informationFiles = await import('../app/api/information/files/route.ts');

function fixture() {
  const database = new DatabaseSync(':memory:');
  database.exec('PRAGMA foreign_keys=ON');
  const dir = new URL('../drizzle/', import.meta.url);
  for (const name of withSyntheticSeed(readdirSync(dir).filter(name => /^\d{4}.*\.sql$/.test(name)).sort())) database.exec(readFileSync(new URL(name, dir), 'utf8'));
  const db = {
    prepare(sql) {
      let bindings = [];
      return {
        bind(...values) { bindings = values; return this; },
        async first() { return database.prepare(sql).get(...bindings) ?? null; },
        async all() { return { results: database.prepare(sql).all(...bindings) }; },
        async run() {
          const statement = database.prepare(sql);
          if (statement.columns().length) return { results: statement.all(...bindings), meta: { changes: 0 } };
          const result = statement.run(...bindings);
          return { results: [], meta: { changes: result.changes, last_row_id: Number(result.lastInsertRowid) } };
        },
      };
    },
    batch(statements) {
      const operation = queue.then(async () => {
        database.exec('BEGIN');
        try { const results = []; for (const statement of statements) results.push(await statement.run()); database.exec('COMMIT'); return results; }
        catch (error) { database.exec('ROLLBACK'); throw error; }
      });
      queue = operation.catch(() => {});
      return operation;
    },
  };
  let queue = Promise.resolve();
  const person = database.prepare('SELECT * FROM app_employees WHERE active=1 AND organization_id IS NOT NULL ORDER BY id LIMIT 1').get();
  const actor = { id: person.id, name: person.full_name, organizationId: person.organization_id, departmentId: person.department_id, organizationType: 'committee', roleCode: 'admin', roleLevel: 1, permissions: { viewScope: 'all', assignScope: 'all', informationScope: 'all', canManageRoles: true, canManageReports: true, canManageOrganization: true, canManageInformation: true, canViewRestrictedInformation: true, canEnterInformation: true, canSubmitInformation: true, canVerifyInformation: true, canApproveInformation: true } };
  const removed = [];
  const bucket = { async put(_key, body) { return { size: (await new Response(body).arrayBuffer()).byteLength }; }, async delete(key) { removed.push(key); } };
  globalThis.tableRuntime = { db, actor, bucket, organizationIds: database.prepare('SELECT id FROM app_organizations').all().map(row => row.id) };
  return { database, db, actor, bucket, removed };
}

const request = (method, body, url = '/api/reports') => new Request(`https://test.local${url}`, { method, headers: { 'Content-Type': 'application/json', Origin: 'https://test.local' }, body: JSON.stringify(body) });
const columns = [{ id: 'f1', label: 'Miqdor', type: 'number', required: true, aggregation: 'average' }, { id: 'f2', label: 'Izoh', type: 'text', required: true, aggregation: 'none' }];
async function createReport(actor, requestId = crypto.randomUUID()) {
  const response = await reports.POST(request('POST', { requestId, title: 'Sinov hisoboti', firstDeadlineAt: '2027-06-15T12:00:00Z', frequency: 'monthly', columns, recipients: [{ organizationId: actor.organizationId, employeeId: actor.id }] }));
  assert.equal(response.status, 201, JSON.stringify(await response.clone().json()));
  return { ...(await response.json()), requestId };
}

test('locale cells, quoted multiline paste, blank rows and overflow are lossless', () => {
  assert.equal(sheet.parseReportCell('1 234,5', 'number'), 1234.5);
  for (const value of ['Yo‘q', 'Yo’q', "yo'q", false, '0']) assert.equal(sheet.parseReportCell(value, 'boolean'), false);
  assert.equal(sheet.parseReportCell('Ha', 'boolean'), true);
  assert.throws(() => sheet.parseReportCell('2026-02-30', 'date'));
  assert.throws(() => sheet.parseReportCell(true, 'number'));
  assert.deepEqual(sheet.clipboardRows('"Line 1\nLine 2"\t4\nOther\t5\n', 0, 0, 2), [['Line 1\nLine 2', '4'], ['Other', '5']]);
  assert.deepEqual(sheet.clipboardRows('a\n\nb', 0, 0, 2), [['a'], [''], ['b']]);
  assert.throws(() => sheet.clipboardRows('a\tb', 0, 1, 2));
  assert.throws(() => sheet.clipboardRows('a\nb', 999, 0, 2));
});

test('draft permits missing required cells; submission identifies original row/column', () => {
  assert.deepEqual(sheet.cleanReportRows(columns, [{ f1: '0' }, {}], false), [{ f1: 0 }]);
  assert.throws(() => sheet.cleanReportRows(columns, [{}, { f1: 0 }], true), /2-qator · Izoh/);
  assert.throws(() => sheet.cleanReportRows(columns, [], true));
});

test('averages weight individual nonempty cells and salary uses ratio of sums', () => {
  const a = [{ f1: 100 }], b = Array.from({ length: 9 }, () => ({ f1: 0 }));
  const result = sheet.aggregateReportSheets(columns, [{ values: { f1: 100 }, numericStats: sheet.reportNumericStats(columns, a) }, { values: { f1: 0 }, numericStats: sheet.reportNumericStats(columns, b) }]);
  assert.equal(result.f1, 10);
  assert.equal(table.ratioOfSums([{ values: { fund: 100, count: 10 } }, { values: { fund: 2000, count: 100 } }], 'SUM(fund) / SUM(count)'), 2100 / 110);
  assert.equal(table.ratioOfSums([{ values: { fund: 100 } }], 'SUM(fund) / SUM(count)'), null);
  assert.equal(table.ratioOfSums([{ values: { fund: 0, count: 0 } }], 'SUM(fund) / SUM(count)'), null);
});

test('Excel exports arrays as text and preserves actual object names', async () => {
  const XLSX = (await import('xlsx-js-style')).default;
  const worksheet = XLSX.utils.aoa_to_sheet([[table.spreadsheetCell(['Bir', 'Ikki']), table.spreadsheetCell([12, 34])]]);
  const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  const restored = XLSX.read(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer' });
  assert.equal(restored.Sheets.Data.A1.v, 'Bir, Ikki'); assert.equal(restored.Sheets.Data.A1.f, undefined);
  assert.equal(restored.Sheets.Data.B1.v, '12, 34');
  assert.equal(table.embeddedRecordTitle({ title: 'Hisobot', values: { obyekt_nomi: 'Ko‘prik' } }, 'obyekt_nomi'), 'Ko‘prik');
});

test('information validates primitives, coordinates, periods and revision tokens', () => {
  const field = type => [{ code: 'value', label: 'Maydon', type, required: true, options: ['A', 'B'] }];
  for (const value of [true, [], [5], {}]) assert.throws(() => info.sanitizeInformationValues(field('number'), { value }));
  assert.throws(() => info.sanitizeInformationValues(field('boolean'), { value: 'yes' }));
  assert.throws(() => info.sanitizeInformationValues(field('employees'), { value: [1, 'wrong', 2] }));
  assert.throws(() => info.sanitizeInformationValues(field('multiselect'), { value: ['invalid'] }));
  assert.throws(() => info.sanitizeInformationValues(field('geo'), { value: '91, 0' }));
  assert.equal(input.joinCoordinates('', '69.2'), ', 69.2');
  assert.equal(input.joinCoordinates('0', ''), '0, ');
  assert.equal(input.informationVersionMatches(1, 2), false);
  for (const period of ['2026-00', '2026-13', '2026-02-30']) assert.throws(() => input.inferInformationPeriod(null, null, { davr: period }));
  assert.equal(input.inferInformationPeriod(null, null, { davr: '2024-02' }).periodEnd, '2024-02-29');
});

test('real report handlers preserve drafts, reject stale editors and freeze submitted evidence', async () => {
  const { database, actor } = fixture();
  const created = await createReport(actor);
  const assignment = database.prepare('SELECT * FROM app_report_assignments WHERE cycle_id=?').get(created.cycleId);
  let response = await reports.PATCH(request('PATCH', { action: 'save', assignmentId: assignment.id, expectedVersion: 1, rows: [{ f1: '12,5' }] }));
  assert.equal(response.status, 200); assert.equal((await response.json()).version, 2);
  response = await reports.PATCH(request('PATCH', { action: 'save', assignmentId: assignment.id, expectedVersion: 1, rows: [{ f1: 999 }] }));
  assert.equal(response.status, 409);
  assert.equal(JSON.parse(database.prepare('SELECT values_json FROM app_report_data_rows WHERE assignment_id=?').get(assignment.id).values_json).f1, 12.5);
  const detail = await (await reports.GET(new Request(`https://test.local/api/reports?assignmentId=${assignment.id}`))).json();
  assert.equal(detail.version, 2); assert.equal(detail.capabilities.edit, true); assert.equal(detail.rows.length, 1);
  response = await reports.PATCH(request('PATCH', { action: 'submit', assignmentId: assignment.id, expectedVersion: 2, rows: [{ f1: 12.5, f2: 'Tayyor' }] }));
  assert.equal(response.status, 200);
  response = await reports.PATCH(request('PATCH', { action: 'save', assignmentId: assignment.id, expectedVersion: 3, rows: [] }));
  assert.equal(response.status, 409);
  response = await reportFiles.POST(new Request(`https://test.local/api/reports/files?assignmentId=${assignment.id}`, { method: 'POST', headers: { 'X-File-Name': 'proof.txt', 'X-File-Size': '3', 'X-Record-Version': '3' }, body: 'abc' }));
  assert.equal(response.status, 409);
  // The responsible submitter can never approve their own report (audit Y8).
  response = await reports.PATCH(request('PATCH', { action: 'approve', assignmentId: assignment.id, expectedVersion: 3 }));
  assert.equal(response.status, 403);
  const other = database.prepare('SELECT id,full_name FROM app_employees WHERE id<>? ORDER BY id LIMIT 1').get(actor.id);
  globalThis.tableRuntime.actor = { ...actor, id: other.id, name: other.full_name };
  response = await reports.PATCH(request('PATCH', { action: 'return', assignmentId: assignment.id, expectedVersion: 3, comment: '' }));
  assert.equal(response.status, 400);
  response = await reports.PATCH(request('PATCH', { action: 'approve', assignmentId: assignment.id, expectedVersion: 2 }));
  assert.equal(response.status, 409);
  response = await reports.PATCH(request('PATCH', { action: 'approve', assignmentId: assignment.id, expectedVersion: 3 }));
  assert.equal(response.status, 200);
  assert.equal(database.prepare('SELECT status FROM app_report_assignments WHERE id=?').get(assignment.id).status, 'approved');
});

test('creation retries reuse the original template and every creation is complete', async () => {
  const { database, actor } = fixture();
  const created = await createReport(actor);
  const response = await reports.POST(request('POST', { requestId: created.requestId, title: 'Sinov hisoboti', firstDeadlineAt: '2027-06-15T12:00:00Z', frequency: 'monthly', columns, recipients: [{ organizationId: actor.organizationId, employeeId: actor.id }] }));
  assert.equal(response.status, 200); assert.equal((await response.json()).templateId, created.templateId);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_report_templates WHERE id=?').get(created.templateId).n, 1);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_report_assignments WHERE cycle_id=?').get(created.cycleId).n, 1);
});

test('simultaneous report saves commit one whole table and never mix rows', async () => {
  const { database, actor } = fixture();
  const created = await createReport(actor);
  const assignment = database.prepare('SELECT id FROM app_report_assignments WHERE cycle_id=?').get(created.cycleId);
  const results = await Promise.all([100, 200].map(value => reports.PATCH(request('PATCH', { action: 'save', assignmentId: assignment.id, expectedVersion: 1, rows: [{ f1: value }, { f1: value + 1 }] }))));
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  const values = database.prepare('SELECT values_json FROM app_report_data_rows WHERE assignment_id=? ORDER BY row_order').all(assignment.id).map(row => JSON.parse(row.values_json).f1);
  assert.ok(JSON.stringify(values) === '[100,101]' || JSON.stringify(values) === '[200,201]');
  assert.equal(database.prepare('SELECT version FROM app_report_assignments WHERE id=?').get(assignment.id).version, 2);
});

test('report evidence uploaded against a changed revision leaves no attachment', async () => {
  const { database, actor, bucket, removed } = fixture();
  const created = await createReport(actor);
  const assignment = database.prepare('SELECT id FROM app_report_assignments WHERE cycle_id=?').get(created.cycleId);
  bucket.put = async () => { database.prepare('UPDATE app_report_assignments SET version=version+1 WHERE id=?').run(assignment.id); return { size: 3 }; };
  const response = await reportFiles.POST(new Request(`https://test.local/api/reports/files?assignmentId=${assignment.id}`, { method: 'POST', headers: { 'X-File-Name': 'proof.txt', 'X-File-Size': '3', 'X-Record-Version': '1' }, body: 'abc' }));
  assert.equal(response.status, 409);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_report_files WHERE assignment_id=?').get(assignment.id).n, 0);
  assert.equal(removed.length, 1);
});

test('information route rejects an old editor and preserves omitted dates', async () => {
  const { database } = fixture();
  const template = database.prepare("SELECT id FROM app_information_templates WHERE active=1 AND catalog_state='current' ORDER BY id LIMIT 1").get();
  const createdResponse = await information.POST(request('POST', { templateId: template.id, title: 'Sinov yozuvi', periodStart: '2026-01-01', periodEnd: '2026-12-31', values: {} }, '/api/information'));
  assert.equal(createdResponse.status, 201, JSON.stringify(await createdResponse.clone().json()));
  const created = await createdResponse.json();
  let response = await information.PATCH(request('PATCH', { id: created.id, expectedVersion: 1, action: 'save', title: 'Yangi sarlavha', values: {} }, '/api/information'));
  assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
  response = await information.PATCH(request('PATCH', { id: created.id, expectedVersion: 1, action: 'save', title: 'Eskisi', values: {} }, '/api/information'));
  assert.equal(response.status, 409);
  const row = database.prepare('SELECT title,period_start,period_end FROM app_information_records WHERE id=?').get(created.id);
  assert.equal(row.title, 'Yangi sarlavha'); assert.equal(row.period_start, '2026-01-01'); assert.equal(row.period_end, '2026-12-31');
});

test('attachment upload racing a new information revision rolls back and removes only its own blob', async () => {
  const { database, bucket, removed } = fixture();
  const template = database.prepare("SELECT id FROM app_information_templates WHERE active=1 AND catalog_state='current' ORDER BY id LIMIT 1").get();
  const created = await (await information.POST(request('POST', { templateId: template.id, title: 'Faylli yozuv', values: {} }, '/api/information'))).json();
  bucket.put = async () => {
    database.prepare("INSERT INTO app_information_record_history (record_id,version,action,status,snapshot_json,actor_employee_id) VALUES (?,2,'save','draft','{}',?)").run(created.id, globalThis.tableRuntime.actor.id);
    return { size: 3 };
  };
  const response = await informationFiles.POST(new Request(`https://test.local/api/information/files?recordId=${created.id}`, { method: 'POST', headers: { 'X-File-Name': 'proof.txt', 'X-File-Size': '3', 'X-Record-Version': '1' }, body: 'abc' }));
  assert.equal(response.status, 409, JSON.stringify(await response.clone().json()));
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_information_files WHERE record_id=?').get(created.id).n, 0);
  assert.equal(removed.length, 1);
});

test('current form schemas preserve legacy attachments and separate dates, places and certificates', () => {
  const { database } = fixture();
  const sports = JSON.parse(database.prepare("SELECT fields_json FROM app_information_templates WHERE code='SRC_SPORTS_YOUTH_SPORTS_YOUTH_EVENTS'").get().fields_json);
  assert.equal(sports.find(field => field.code === 'sertifikat_nomi_darajasi').type, 'file');
  assert.equal(sports.find(field => field.code === 'tadbir_joyi').type, 'text');
  assert.equal(sports.find(field => field.code === 'sertifikat_nomi').type, 'text');
  const templates = database.prepare("SELECT code,fields_json,presentation_json FROM app_information_templates WHERE active=1 AND catalog_state='current'").all();
  for (const template of templates) {
    const fields = JSON.parse(template.fields_json), presentation = JSON.parse(template.presentation_json);
    const codes = new Set(fields.map(field => field.code));
    assert.equal(codes.size, fields.length, template.code);
    for (const code of [...(presentation.tableColumns ?? []), ...(presentation.tabs ?? []).flatMap(tab => tab.columns ?? [])]) assert.ok(codes.has(code), `${template.code}: ${code}`);
  }
});

test('revoked editors cannot mutate owned records; required fields and totals are revalidated', async () => {
  const { db, actor } = fixture();
  const config = { templateId: 1, domainId: 1, entryScope: 'hierarchical', validationRules: [{ type: 'components_sum', totalField: 'total', componentFields: ['a', 'b'] }] };
  assert.deepEqual(await workflow.informationRecordAllowedActions(db, { ...actor, roleCode: 'xodim' }, { id: 10, domain_id: 1, created_by_employee_id: actor.id, organization_id: actor.organizationId, status: 'draft' }, [], config), []);
  const issues = await workflow.validateInformationCandidate(db, [{ code: 'name', label: 'Nom', type: 'text', required: true }], config, { organizationId: actor.organizationId, periodStart: null, periodEnd: null, values: { total: 10, a: 50 }, validationStage: 'approval' });
  assert.ok(issues.some(issue => issue.ruleCode === 'required_field'));
  assert.ok(issues.some(issue => issue.ruleCode === 'components_sum_required_operands'));
});

test('Excel dates keep their calendar day in Tashkent and both Excel date systems', async () => {
  const xlsxModule = await import('xlsx-js-style');
  const XLSX = xlsxModule.default ?? xlsxModule;
  const previousTimezone = process.env.TZ;
  process.env.TZ = 'Asia/Tashkent';
  try {
    for (const date1904 of [false, true]) {
      const book = XLSX.utils.book_new();
      const page = XLSX.utils.aoa_to_sheet([['Sana'], [date1904 ? 44820 : 46282]]);
      page.A2.z = 'yyyy-mm-dd';
      XLSX.utils.book_append_sheet(book, page, 'Hisobot');
      book.Workbook = { WBProps: { date1904 } };
      const parsed = await excel.readReportWorkbook(XLSX.write(book, { type: 'array', bookType: 'xlsx' }));
      assert.deepEqual(parsed.rows, [['2026-09-17']]);
    }
    assert.throws(() => excel.reportHeaderIndexes(['Sana', ' sana '], [{ label: 'Sana' }]));
    assert.throws(() => excel.reportHeaderIndexes(['Sana'], [{ label: 'Sana' }, { label: ' sana ' }]));
  } finally { if (previousTimezone == null) delete process.env.TZ; else process.env.TZ = previousTimezone; }
});

function keyedInformationFixture() {
  const state = fixture();
  const { database, actor } = state;
  const template = database.prepare("SELECT id FROM app_information_templates WHERE active=1 AND catalog_state='current' ORDER BY id LIMIT 1").get();
  const department = database.prepare('SELECT id FROM app_departments WHERE organization_id=? AND active=1 LIMIT 1').get(actor.organizationId);
  const reviewer = database.prepare('SELECT id FROM app_employees WHERE id<>? AND active=1 LIMIT 1').get(actor.id);
  database.prepare('UPDATE app_employees SET organization_id=? WHERE id=?').run(actor.organizationId, reviewer.id);
  const profile = database.prepare("INSERT INTO app_access_profiles (code,name,can_approve_information) VALUES ('test_reviewer','Test',1)").run();
  database.prepare("INSERT INTO app_access_profile_assignments (principal_type,principal_id,access_profile_id,scope_type,scope_id) VALUES ('employee',?,?,'department',?)").run(reviewer.id, Number(profile.lastInsertRowid), department.id);
  database.prepare('UPDATE app_information_templates SET fields_json=? WHERE id=?').run(JSON.stringify([{ code: 'key', label: 'Kalit', type: 'text', required: true }]), template.id);
  database.prepare(`INSERT INTO app_information_template_workflows (template_id,owner_department_id,entry_scope,validation_rules_json)
    VALUES (?,?,'central_only',?) ON CONFLICT(template_id) DO UPDATE SET owner_department_id=excluded.owner_department_id,entry_scope=excluded.entry_scope,validation_rules_json=excluded.validation_rules_json,active=1`).run(template.id, department.id, JSON.stringify([{ type: 'unique_business_key', keyFields: ['key'] }]));
  const draft = async (isDemo = false) => {
    const response = await information.POST(request('POST', { templateId: template.id, title: 'Bir xil kalit', isDemo, values: { key: 'K' } }, '/api/information'));
    assert.equal(response.status, 201, JSON.stringify(await response.clone().json()));
    return response.json();
  };
  const submit = id => information.PATCH(request('PATCH', { id, expectedVersion: 1, action: 'submit', values: { key: 'K' } }, '/api/information'));
  // Approval is done by a distinct department approver; the creator can never approve (audit Y8).
  const reviewerActor = { ...actor, id: reviewer.id, roleCode: 'xodim', roleLevel: 90 };
  const asReviewer = async (operation) => {
    globalThis.tableRuntime.actor = reviewerActor;
    try { return await operation(); } finally { globalThis.tableRuntime.actor = actor; }
  };
  return { ...state, draft, submit, asReviewer };
}

test('duplicate drafts do not block approval; submitted keys reject later duplicates and isolate demo data', async () => {
  const { database, draft, submit, asReviewer } = keyedInformationFixture();
  const a = await draft(), b = await draft();
  let response = await submit(a.id);
  assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
  response = await information.PATCH(request('PATCH', { id: a.id, expectedVersion: 2, action: 'approve' }, '/api/information'));
  assert.equal(response.status, 403, 'the creator (even an administrator) cannot approve their own record');
  response = await asReviewer(() => information.PATCH(request('PATCH', { id: a.id, expectedVersion: 2, action: 'approve' }, '/api/information')));
  assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
  assert.equal(database.prepare('SELECT status FROM app_information_records WHERE id=?').get(a.id).status, 'published');
  response = await submit(b.id);
  assert.equal(response.status, 422);
  const demo = await draft(true);
  response = await submit(demo.id);
  assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
});

test('simultaneous matching information submissions roll back the losing revision completely', async () => {
  const { database, draft, submit } = keyedInformationFixture();
  const a = await draft(), b = await draft();
  const responses = await Promise.all([submit(a.id), submit(b.id)]);
  assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);
  const loser = responses[0].status === 409 ? a.id : b.id;
  assert.equal(database.prepare('SELECT status FROM app_information_records WHERE id=?').get(loser).status, 'draft');
  assert.equal(database.prepare('SELECT MAX(version) AS version FROM app_information_record_history WHERE record_id=?').get(loser).version, 1);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_information_record_approval_steps WHERE record_id=?').get(loser).n, 0);
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM app_information_business_keys').get().n, 1);
});

test('report creation preserves single-character columns and rejects ambiguous or unfinished definitions', async () => {
  const { database, actor } = fixture();
  const base = { title: 'Ustunlar hisoboti', firstDeadlineAt: '2027-06-15T12:00:00Z', frequency: 'monthly', recipients: [{ organizationId: actor.organizationId, employeeId: actor.id }] };
  const one = { label: 'X', type: 'number', aggregation: 'sum' };
  let response = await reports.POST(request('POST', { ...base, columns: [one] }));
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(JSON.parse(database.prepare('SELECT columns_json FROM app_report_templates WHERE id=?').get(result.templateId).columns_json)[0].label, 'X');
  for (const invalid of [
    { columns: [one, { ...one, label: ' x ' }] },
    { columns: [one, { ...one, label: ' ' }] },
    { columns: [one], recipients: [...base.recipients, { organizationId: actor.organizationId, employeeId: 0 }] },
  ]) {
    response = await reports.POST(request('POST', { ...base, ...invalid }));
    assert.equal(response.status, 400);
  }
});

test('report overview pagination retrieves every assignment without overlap', async () => {
  const { database, actor } = fixture();
  const created = await createReport(actor);
  const before = database.prepare('SELECT COUNT(*) AS n FROM app_report_assignments').get().n;
  database.exec('BEGIN');
  for (let index = 0; index < 503; index += 1) {
    const cycle = database.prepare("INSERT INTO app_report_cycles (template_id,period_key,period_label,period_start,period_end,deadline_at) VALUES (?,?,?,'2027-01-01','2027-01-31','2027-06-15T12:00:00Z')").run(created.templateId, `test-${index}`, `Sinov ${index}`);
    database.prepare('INSERT INTO app_report_assignments (cycle_id,organization_id,responsible_employee_id,assigned_by_employee_id) VALUES (?,?,?,?)').run(Number(cycle.lastInsertRowid), actor.organizationId, actor.id, actor.id);
  }
  database.exec('COMMIT');
  const seen = new Set();
  let cursor = 0;
  do {
    const response = await reports.GET(new Request(`https://test.local/api/reports?cursor=${cursor}`));
    assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
    const page = await response.json();
    assert.ok(page.assignments.length <= 500);
    for (const assignment of page.assignments) { assert.ok(!seen.has(assignment.id)); seen.add(assignment.id); }
    cursor = page.nextCursor;
  } while (cursor);
  assert.equal(seen.size, before + 503);
});
