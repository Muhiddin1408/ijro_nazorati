import assert from "node:assert/strict";
import { existsSync } from "node:fs";
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

const { createNextRecurringTask } = await import("../lib/recurrence.ts");

function asD1(database, options = {}) {
  let failBatch = Boolean(options.failBatch);
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
    async batch(statements) {
      if (failBatch) {
        failBatch = false;
        throw new Error("injected assignment failure");
      }
      return Promise.all(statements.map((statement) => statement.run()));
    },
  };
}

function recurrenceDatabase() {
  const database = new DatabaseSync(":memory:");
  database.exec(`
    CREATE TABLE app_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description TEXT DEFAULT '',deadline_iso TEXT,
      priority TEXT DEFAULT 'O‘rta',status TEXT DEFAULT 'Jarayonda',progress INTEGER DEFAULT 0,
      recurring INTEGER DEFAULT 0,recurrence TEXT,notify_telegram INTEGER DEFAULT 1,topic_id INTEGER,
      created_by_employee_id INTEGER NOT NULL,recurrence_parent_task_id INTEGER,recurrence_anchor_day INTEGER,archived INTEGER DEFAULT 0
    );
    CREATE UNIQUE INDEX recurrence_parent_unique ON app_tasks(recurrence_parent_task_id) WHERE recurrence_parent_task_id IS NOT NULL;
    CREATE TABLE app_task_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,task_id INTEGER NOT NULL,employee_id INTEGER NOT NULL,
      assigned_by_employee_id INTEGER NOT NULL,parent_assignment_id INTEGER
    );
    CREATE UNIQUE INDEX task_assignment_unique ON app_task_assignments(task_id,employee_id);
    CREATE TABLE app_task_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,task_id INTEGER NOT NULL,from_employee_id INTEGER,to_employee_id INTEGER NOT NULL,
      action TEXT NOT NULL,note TEXT DEFAULT ''
    );
    CREATE TABLE app_task_audiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,task_id INTEGER NOT NULL,target_type TEXT NOT NULL,target_id INTEGER NOT NULL,
      include_descendants INTEGER DEFAULT 0,created_by_employee_id INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX task_audience_unique ON app_task_audiences(task_id,target_type,target_id);
    CREATE TABLE app_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,actor_employee_id INTEGER,action TEXT NOT NULL,entity_type TEXT NOT NULL,
      entity_id INTEGER,detail_json TEXT DEFAULT '{}'
    );
  `);
  database.prepare(`INSERT INTO app_tasks
    (id,title,description,deadline_iso,priority,status,progress,recurring,recurrence,notify_telegram,topic_id,created_by_employee_id,archived)
    VALUES (1,'Yo‘l holati','Haftalik nazorat','2099-01-01T04:00:00.000Z','Yuqori','Bajarildi',100,1,'Har hafta',1,3,10,0)`).run();
  database.prepare("INSERT INTO app_task_assignments (task_id,employee_id,assigned_by_employee_id) VALUES (1,20,10)").run();
  database.prepare("INSERT INTO app_task_audiences (task_id,target_type,target_id,include_descendants,created_by_employee_id) VALUES (1,'organization',7,1,10)").run();
  return database;
}

test("recurring task retry repairs one partially-created child without duplicates", async () => {
  const database = recurrenceDatabase();
  await assert.rejects(
    createNextRecurringTask(1, asD1(database, { failBatch: true })),
    /injected assignment failure/,
  );
  assert.equal(database.prepare("SELECT COUNT(*) count FROM app_tasks WHERE recurrence_parent_task_id=1").get().count, 1);
  assert.equal(database.prepare("SELECT COUNT(*) count FROM app_task_assignments WHERE task_id=2").get().count, 0);

  const repaired = await createNextRecurringTask(1, asD1(database));
  assert.equal(repaired.created, false);
  assert.deepEqual(repaired.employeeIds, [20]);
  assert.equal(repaired.hasAudiences, true);

  const repeated = await createNextRecurringTask(1, asD1(database));
  assert.equal(repeated.created, false);
  assert.equal(database.prepare("SELECT COUNT(*) count FROM app_tasks WHERE recurrence_parent_task_id=1").get().count, 1);
  assert.equal(database.prepare("SELECT COUNT(*) count FROM app_task_assignments WHERE task_id=2").get().count, 1);
  assert.equal(database.prepare("SELECT COUNT(*) count FROM app_task_routes WHERE task_id=2").get().count, 1);
  assert.equal(database.prepare("SELECT COUNT(*) count FROM app_task_audiences WHERE task_id=2").get().count, 1);
  assert.equal(database.prepare("SELECT COUNT(*) count FROM app_audit_logs WHERE entity_type='task' AND entity_id=2").get().count, 1);
});
