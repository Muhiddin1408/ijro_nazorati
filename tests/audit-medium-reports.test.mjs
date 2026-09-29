import { withSyntheticSeed } from "./fixtures/migrations.mjs";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { registerHooks } from "node:module";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Run the real route handlers against SQLite transactions and a controllable
// object store. Only authentication, environment and outbound delivery are mocked.
registerHooks({
  resolve(specifier, context, next) {
    if (/(?:^|\/)db$/.test(specifier)) return { url: "test:db", shortCircuit: true };
    if (/(?:^|\/)lib\/auth$/.test(specifier) || (context.parentURL?.includes("/lib/") && specifier === "./auth"))
      return { url: "test:auth", shortCircuit: true };
    if (/(?:^|\/)(?:lib\/)?telegram$/.test(specifier)) return { url: "test:telegram", shortCircuit: true };
    if (/(?:^|\/)(?:lib\/)?background$/.test(specifier)) return { url: "test:background", shortCircuit: true };
    if (specifier.startsWith("."))
      for (const suffix of [".ts", "/index.ts"]) {
        const url = new URL(specifier + suffix, context.parentURL);
        if (existsSync(fileURLToPath(url))) return next(url.href, context);
      }
    return next(specifier, context);
  },
  load(url, context, next) {
    const sources = {
      "test:db":
        "export async function getD1(){return globalThis.tableRuntime.db} export async function getRuntimeEnv(){return {BUCKET:globalThis.tableRuntime.bucket}}",
      "test:background": "export function runInBackground(){}",
      "test:telegram":
        "export async function enqueueReportNotification(){} export async function processNotificationJobs(){}",
      "test:auth": `export class ApiError extends Error {constructor(status,message){super(message);this.status=status}}
        export function apiError(error){return Response.json({error:error.message},{status:error.status??500})}
        export function assertSameOrigin(){} export function isSecureRequest(){return false} export function publicOrigin(request){return new URL(request.url).origin} export function requirePermission(actor,key){if(!actor.permissions[key])throw new ApiError(403,'Denied')}
        export async function requireActor(){return globalThis.tableRuntime.actor}
        export async function organizationScopeIds(){return globalThis.tableRuntime.organizationIds}
        export async function employeeIdsInScopes(){return true} export async function audit(){}`,
    };
    if (url in sources) return { format: "module", source: sources[url], shortCircuit: true };
    return next(url, context);
  },
});

const reports = await import("../app/api/reports/route.ts");
const ingest = await import("../app/api/information/ingest/route.ts");
const reportLib = await import("../lib/reports.ts");

function fixture() {
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys=ON");
  const dir = new URL("../drizzle/", import.meta.url);
  for (const name of withSyntheticSeed(
    readdirSync(dir)
      .filter((name) => /^\d{4}.*\.sql$/.test(name))
      .sort(),
  ))
    database.exec(readFileSync(new URL(name, dir), "utf8"));
  const db = {
    prepare(sql) {
      let bindings = [];
      return {
        bind(...values) {
          bindings = values;
          return this;
        },
        async first() {
          return database.prepare(sql).get(...bindings) ?? null;
        },
        async all() {
          return { results: database.prepare(sql).all(...bindings) };
        },
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
        database.exec("BEGIN");
        try {
          const results = [];
          for (const statement of statements) results.push(await statement.run());
          database.exec("COMMIT");
          return results;
        } catch (error) {
          database.exec("ROLLBACK");
          throw error;
        }
      });
      queue = operation.catch(() => {});
      return operation;
    },
  };
  let queue = Promise.resolve();
  const person = database
    .prepare("SELECT * FROM app_employees WHERE active=1 AND organization_id IS NOT NULL ORDER BY id LIMIT 1")
    .get();
  const actor = {
    id: person.id,
    name: person.full_name,
    organizationId: person.organization_id,
    departmentId: person.department_id,
    organizationType: "committee",
    roleCode: "admin",
    roleLevel: 1,
    permissions: {
      viewScope: "all",
      assignScope: "all",
      informationScope: "all",
      canManageRoles: true,
      canManageReports: true,
      canManageOrganization: true,
      canManageInformation: true,
      canViewRestrictedInformation: true,
      canEnterInformation: true,
      canSubmitInformation: true,
      canVerifyInformation: true,
      canApproveInformation: true,
    },
  };
  const removed = [];
  const bucket = {
    async put(_key, body) {
      return { size: (await new Response(body).arrayBuffer()).byteLength };
    },
    async delete(key) {
      removed.push(key);
    },
  };
  globalThis.tableRuntime = {
    db,
    actor,
    bucket,
    organizationIds: database
      .prepare("SELECT id FROM app_organizations")
      .all()
      .map((row) => row.id),
  };
  return { database, db, actor, bucket, removed };
}

const request = (method, body, url = "/api/reports") =>
  new Request(`https://test.local${url}`, {
    method,
    headers: { "Content-Type": "application/json", Origin: "https://test.local" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const columns = [{ id: "f1", label: "Miqdor", type: "number", required: true, aggregation: "sum" }];
async function createReport(actor) {
  const response = await reports.POST(
    request("POST", {
      requestId: crypto.randomUUID(),
      title: "Muddat sinovi",
      firstDeadlineAt: "2027-06-15T12:00:00Z",
      frequency: "one_time",
      columns,
      recipients: [{ organizationId: actor.organizationId, employeeId: actor.id }],
    }),
  );
  assert.equal(response.status, 201, JSON.stringify(await response.clone().json()));
  return response.json();
}
const patch = (body) => reports.PATCH(request("PATCH", body));
function asEmployee(database, actor, excludeId) {
  const other = database
    .prepare("SELECT id,full_name FROM app_employees WHERE id<>? AND active=1 ORDER BY id LIMIT 1")
    .get(excludeId);
  globalThis.tableRuntime.actor = { ...actor, id: other.id, name: other.full_name };
}

test("report cycles move open → overdue → open (delivered) → closed and the overview flags overdue", async () => {
  const { database, db, actor } = fixture();
  const created = await createReport(actor);
  const cycle = () =>
    database.prepare("SELECT status,closed_at FROM app_report_cycles WHERE id=?").get(created.cycleId);
  const assignment = database.prepare("SELECT * FROM app_report_assignments WHERE cycle_id=?").get(created.cycleId);
  await reportLib.reportCycleStatusStatement(db).run();
  assert.equal(cycle().status, "open");

  database
    .prepare("UPDATE app_report_cycles SET deadline_at='2020-01-01T00:00:00.000Z' WHERE id=?")
    .run(created.cycleId);
  await reportLib.reportCycleStatusStatement(db).run();
  assert.equal(cycle().status, "overdue");
  let overview = await (await reports.GET(request("GET"))).json();
  assert.equal(overview.assignments.find((item) => item.id === assignment.id).overdue, true);

  let response = await patch({ action: "submit", assignmentId: assignment.id, expectedVersion: 1, rows: [{ f1: 5 }] });
  assert.equal(response.status, 200);
  assert.equal(cycle().status, "open", "delivered but not yet approved");
  overview = await (await reports.GET(request("GET"))).json();
  assert.equal(overview.assignments.find((item) => item.id === assignment.id).overdue, false);

  asEmployee(database, actor, actor.id);
  response = await patch({ action: "approve", assignmentId: assignment.id, expectedVersion: 2 });
  assert.equal(response.status, 200);
  assert.equal(cycle().status, "closed");
  assert.ok(cycle().closed_at);
  // The scheduler never reopens a closed cycle.
  await reportLib.reportCycleStatusStatement(db).run();
  assert.equal(cycle().status, "closed");
});

test("the reviewer return reason survives draft saves and clears on resubmission", async () => {
  const { database, actor } = fixture();
  const created = await createReport(actor);
  const assignment = database.prepare("SELECT * FROM app_report_assignments WHERE cycle_id=?").get(created.cycleId);
  const row = () =>
    database
      .prepare("SELECT status,comment,review_comment,version FROM app_report_assignments WHERE id=?")
      .get(assignment.id);
  let response = await patch({
    action: "submit",
    assignmentId: assignment.id,
    expectedVersion: 1,
    rows: [{ f1: 1 }],
    comment: "Ijrochi izohi",
  });
  assert.equal(response.status, 200);
  asEmployee(database, actor, actor.id);
  response = await patch({
    action: "return",
    assignmentId: assignment.id,
    expectedVersion: 2,
    comment: "Jami noto‘g‘ri",
  });
  assert.equal(response.status, 200);
  assert.equal(row().review_comment, "Jami noto‘g‘ri");
  assert.equal(row().comment, "Ijrochi izohi", "the submitter comment is not overwritten by the reviewer");

  globalThis.tableRuntime.actor = actor;
  response = await patch({
    action: "save",
    assignmentId: assignment.id,
    expectedVersion: 3,
    rows: [{ f1: 2 }],
    comment: "Tuzatilmoqda",
  });
  assert.equal(response.status, 200);
  assert.equal(row().review_comment, "Jami noto‘g‘ri", "a draft save keeps the return reason");
  assert.equal(row().comment, "Tuzatilmoqda");
  response = await patch({ action: "save", assignmentId: assignment.id, expectedVersion: 4, rows: [{ f1: 3 }] });
  assert.equal(row().comment, "Tuzatilmoqda", "omitting the comment keeps it");
  const detail = await (
    await reports.GET(request("GET", undefined, `/api/reports?assignmentId=${assignment.id}`))
  ).json();
  assert.equal(detail.reviewComment, "Jami noto‘g‘ri");

  response = await patch({ action: "submit", assignmentId: assignment.id, expectedVersion: 5, rows: [{ f1: 3 }] });
  assert.equal(response.status, 200);
  assert.equal(row().review_comment, "");
});

test("ingest rejects oversize batches and upserts integration drafts without touching workflow or human edits", async () => {
  const { database } = fixture();
  process.env.INFORMATION_INGEST_SECRET = "ingest-secret-for-tests";
  const template = database
    .prepare(
      "SELECT t.code FROM app_information_templates t JOIN app_information_domains d ON d.id=t.domain_id WHERE t.active=1 AND t.catalog_state='current' AND d.active=1 AND d.catalog_state='current' ORDER BY t.id LIMIT 1",
    )
    .get();
  assert.ok(template, "a current template exists");
  const send = (records) =>
    ingest.POST(
      new Request("https://test.local/api/information/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer ingest-secret-for-tests" },
        body: JSON.stringify({ records }),
      }),
    );
  const item = (title) => ({ templateCode: template.code, sourceRecordKey: "EXT-1", title, values: {} });

  let response = await send(
    Array.from({ length: 101 }, (_, index) => ({ ...item("Ko‘p yozuv"), sourceRecordKey: `K-${index}` })),
  );
  assert.equal(response.status, 413);
  assert.equal((await response.json()).received, 101);
  assert.equal(
    database.prepare("SELECT COUNT(*) AS n FROM app_information_records WHERE source_record_key LIKE 'K-%'").get().n,
    0,
  );

  response = await send([item("Birinchi nom")]);
  let result = (await response.json()).results[0];
  assert.equal(result.action, "created");
  const id = result.id;
  result = (await (await send([item("Birinchi nom")])).json()).results[0];
  assert.equal(result.action, "unchanged");

  result = (await (await send([item("Yangilangan nom")])).json()).results[0];
  assert.equal(result.action, "updated");
  assert.equal(
    database.prepare("SELECT title FROM app_information_records WHERE id=?").get(id).title,
    "Yangilangan nom",
  );
  assert.equal(
    database.prepare("SELECT MAX(version) AS v FROM app_information_record_history WHERE record_id=?").get(id).v,
    2,
  );
  assert.equal(
    database
      .prepare(
        "SELECT COUNT(*) AS n FROM app_audit_logs WHERE action='information.integration_draft_updated' AND entity_id=?",
      )
      .get(id).n,
    1,
  );

  const human = database
    .prepare(
      "SELECT id FROM app_employees WHERE id<>(SELECT updated_by_employee_id FROM app_information_records WHERE id=?) ORDER BY id LIMIT 1",
    )
    .get(id);
  database.prepare("UPDATE app_information_records SET updated_by_employee_id=? WHERE id=?").run(human.id, id);
  result = (await (await send([item("Integratsiya ustiga yozmoqchi")])).json()).results[0];
  assert.equal(result.action, "locked");
  assert.equal(
    database.prepare("SELECT title FROM app_information_records WHERE id=?").get(id).title,
    "Yangilangan nom",
  );

  database
    .prepare(
      "UPDATE app_information_records SET status='submitted',updated_by_employee_id=(SELECT created_by_employee_id FROM app_information_records WHERE id=?) WHERE id=?",
    )
    .run(id, id);
  response = await send([item("Tasdiqlashdagi yozuv")]);
  result = (await response.json()).results[0];
  assert.equal(result.action, "locked");
  assert.equal(
    database.prepare("SELECT title FROM app_information_records WHERE id=?").get(id).title,
    "Yangilangan nom",
  );
});
