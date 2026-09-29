import { readSource } from './fixtures/source.mjs';
import { withSyntheticSeed } from './fixtures/migrations.mjs';
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

const migrationPath = new URL("../drizzle/0020_information_catalog_clarifications.sql", import.meta.url);
const migrationsDirectory = new URL("../drizzle/", import.meta.url);
const samplesPath = new URL("../data/information-source-samples.json", import.meta.url);
const dashboardPath = new URL("../app/information-dashboard.tsx", import.meta.url);

async function migrationNames() {
  return withSyntheticSeed((await readdir(migrationsDirectory)).filter((name) => /^\d{4}.*\.sql$/.test(name)).sort());
}

async function applyMigrations(database, predicate = () => true) {
  for (const name of (await migrationNames()).filter(predicate)) {
    database.exec(await readFile(new URL(name, migrationsDirectory), "utf8"));
  }
}

test("catalog clarification workbook is registered without invented facts", async () => {
  const [migration, samplesText] = await Promise.all([
    readFile(migrationPath, "utf8"),
    readFile(samplesPath, "utf8"),
  ]);
  const samples = JSON.parse(samplesText);
  const checksum = "9c81f59079ca7205c7063223a6a92ee3f7bef9da5ac2f5184f55d993bdac30a5";

  assert.match(migration, new RegExp(checksum));
  assert.equal(samples._catalogClarifications_2026_08_11, undefined);
  assert.match(migration, /"demoMode":"schema-only"/);
  assert.match(migration, /8 ta aniqlashtirish varag‘i/);
});

test("clarified catalogue exposes thematic hierarchy, filters and four sports views", async () => {
  const migration = await readFile(migrationPath, "utf8");

  assert.match(migration, /"profile":"road_condition"[\s\S]*?"drilldown":\["hudud","tuman","yol_tasnifi"\]/);
  assert.match(migration, /"filters":\["yol_tasnifi","qoplama_turi","texnik_toifa","holat_bahosi"\]/);
  assert.match(migration, /"profile":"finance_hierarchy"[\s\S]*?"drilldown":\["hudud","tashkilot"\]/);
  assert.match(migration, /"profile":"road_elements_matrix"[\s\S]*?"hideCountColumn":true/);
  assert.match(migration, /"profile":"sports_youth_tabs"/);
  for (const label of ["Sport mashg‘ulotlari", "Sport musobaqalari", "Rahbar va yoshlar uchrashuvlari", "Iqtidorli yoshlar"]) {
    assert.match(migration, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const eightWorkbookAreas = [
    "SRC_FINANCE_ECONOMY_ASSETS",
    "SRC_MAINTENANCE_REPAIR_ROAD_CONDITION",
    "SRC_ROADSIDE_INFRASTRUCTURE_SERVICE_OBJECTS_IN_PROGRESS",
    "SRC_ROAD_MACHINERY_MACHINERY_UTILIZATION",
    "SRC_DIGITALIZATION_INNOVATION_INFORMATION_SYSTEMS",
    "SRC_INVESTMENTS_PPP_PPP_PROJECTS",
    "SRC_HUMAN_RESOURCES_EMPLOYEE_REGISTRY",
    "SRC_SPORTS_YOUTH_SPORTS_YOUTH_EVENTS",
  ];
  for (const code of eightWorkbookAreas) assert.match(migration, new RegExp(code));
});

test("maintenance consolidation migrates legacy rows before hiding old cards", async () => {
  const migration = await readFile(migrationPath, "utf8");
  assert.match(migration, /consolidatedInto[^\n]+SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS/);
  assert.match(migration, /SET template_id=\(SELECT id FROM app_information_templates WHERE code='SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS'\)/);
  assert.match(migration, /INSERT OR IGNORE INTO app_information_values/);
  assert.match(migration, /NOT EXISTS \(SELECT 1 FROM app_information_records r WHERE r\.template_id=app_information_templates\.id\)/);
});

test("information workspace supports deep drilldown and typed filters", async () => {
  const dashboard = await readSource(dashboardPath);
  assert.match(dashboard, /return result\.slice\(0, 4\)/);
  assert.match(dashboard, /function recordMatchesFacets/);
  assert.match(dashboard, /function FacetFilterControl/);
  assert.match(dashboard, /if \(configuredFilters\.length\) return result\.slice\(0, 6\)/);
  assert.match(dashboard, /template\.presentation\?\.demoMode === "schema-only"/);
  assert.match(dashboard, /ROAD_ELEMENT_METRIC_CONFIG/);
  assert.match(dashboard, /record\.values\.mavjud_soni/);
  assert.match(dashboard, /function configuredPeriodValue/);
  assert.match(dashboard, /profile === "road_operations_funding"/);
  for (const legacyCode of ["yol_belgilari", "yoritish", "suv_qochirish", "bekatlar", "tosiqlar", "svetoforlar"]) {
    assert.match(dashboard, new RegExp(`"${legacyCode}"`));
  }
  assert.match(dashboard, /йўл белг/);
  assert.match(dashboard, /aggregateMetric\(scopedRecords, field\)/);
  assert.match(dashboard, /value=\{`\$\{scopedRecords\.length\} ta`\}/);
  assert.match(dashboard, /if \(configuredFilters\.length\) return result\.slice\(0, 6\)/);
  assert.doesNotMatch(dashboard, /metricTotals[\s\S]{0,180}aggregateMetric\(filteredRecords, field\)/);
});

test("clean migrations leave clarified presentations internally consistent", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database);

  const rows = database.prepare(`SELECT code,fields_json,presentation_json
    FROM app_information_templates
    WHERE catalog_version='catalog-clarifications-2026-08-11'
      AND COALESCE(json_extract(presentation_json,'$.hiddenFromCatalog'),0)<>1`).all();
  assert.ok(rows.length >= 19);

  for (const row of rows) {
    const fields = JSON.parse(row.fields_json);
    const fieldByCode = new Map(fields.map((field) => [field.code, field]));
    const presentation = JSON.parse(row.presentation_json);
    const references = [];
    for (const key of ["drilldown", "filters", "metricFields", "tableColumns", "detailColumns", "summaryColumns", "frozenColumns"]) {
      for (const code of presentation[key] ?? []) references.push(`${key}:${code}`);
    }
    if (presentation.tabField) references.push(`tabField:${presentation.tabField}`);
    for (const tab of presentation.tabs ?? []) {
      for (const code of tab.filters ?? []) references.push(`tab.${tab.id}.filters:${code}`);
      for (const code of tab.columns ?? []) references.push(`tab.${tab.id}.columns:${code}`);
    }
    const missing = references.filter((reference) => !fieldByCode.has(reference.slice(reference.indexOf(":") + 1)));
    assert.deepEqual(missing, [], `${row.code} has missing presentation field references`);
    for (const code of presentation.metricFields ?? []) {
      assert.ok(["number", "currency", "percentage"].includes(fieldByCode.get(code)?.type), `${row.code}.${code} must be numeric`);
    }
  }

  const service = database.prepare("SELECT fields_json,presentation_json FROM app_information_templates WHERE code='SRC_ROADSIDE_INFRASTRUCTURE_SERVICE_OBJECTS_IN_PROGRESS'").get();
  assert.equal(JSON.parse(service.fields_json).some((field) => field.code === "yol"), false);
  assert.deepEqual(JSON.parse(service.presentation_json).drilldown, ["hudud", "tuman", "yol_km"]);

  const roadElements = database.prepare("SELECT fields_json,presentation_json FROM app_information_templates WHERE code='SRC_MAINTENANCE_REPAIR_ROAD_ELEMENTS'").get();
  assert.deepEqual(JSON.parse(roadElements.presentation_json).metricFields, ["mavjud_soni"]);
  assert.equal(JSON.parse(roadElements.fields_json).some((field) => field.code === "yol_belgilari_soni"), false);
});

test("legacy maintenance records migrate in place without losing specialized values", async () => {
  const database = new DatabaseSync(":memory:");
  await applyMigrations(database, (name) => name < "0020");

  const employeeId = Number(database.prepare("SELECT id FROM app_employees ORDER BY id LIMIT 1").get().id);
  const templateId = (code) => Number(database.prepare("SELECT id FROM app_information_templates WHERE code=?").get(code).id);
  const maintenanceId = templateId("SRC_MAINTENANCE_REPAIR_MAINTENANCE_WORKS");
  const repairId = templateId("SRC_MAINTENANCE_REPAIR_REPAIR_WORKS");
  const disasterId = templateId("SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY");
  const insertRecord = database.prepare(`INSERT INTO app_information_records
    (id,template_id,title,source_mode,source_record_key,values_json,created_by_employee_id,updated_by_employee_id)
    VALUES (?,?,?,?,?,?,?,?)`);
  insertRecord.run(920001, maintenanceId, "Legacy saqlash", "import", "shared-key", JSON.stringify({ yol: "A-380", ishlar: "Saqlash" }), employeeId, employeeId);
  insertRecord.run(920002, repairId, "Legacy ta’mirlash", "import", "shared-key", JSON.stringify({ yol: "A-373", tamir_turi: "Kapital", reja_mablagi: 12 }), employeeId, employeeId);
  insertRecord.run(920003, disasterId, "Legacy ofat", "import", "shared-key", JSON.stringify({ yol: "M-37", hodisa_turi: "Sel", zarar_bahosi: 4 }), employeeId, employeeId);
  database.prepare("INSERT INTO app_information_values (record_id,field_code,value_type,value_text) VALUES (?,?,?,?)")
    .run(920002, "tamir_turi", "text", "Kapital");

  const beforeFields = JSON.parse(database.prepare("SELECT fields_json FROM app_information_templates WHERE id=?").get(maintenanceId).fields_json);
  database.prepare("UPDATE app_information_templates SET fields_json=json_insert(fields_json,'$[#]',json(?)) WHERE id=?")
    .run(JSON.stringify({ code: "yaxshi_uzunlik", label: "Yaxshi holatdagi yo‘llar", type: "number" }), templateId("SRC_MAINTENANCE_REPAIR_ROAD_CONDITION"));
  assert.equal(beforeFields.some((field) => field.code === "ish_yonalishi"), false);

  database.exec(await readFile(migrationPath, "utf8"));

  const migrated = database.prepare("SELECT id,template_id,source_record_key,values_json FROM app_information_records WHERE id BETWEEN 920001 AND 920003 ORDER BY id").all();
  assert.deepEqual(migrated.map((row) => Number(row.template_id)), [maintenanceId, maintenanceId, maintenanceId]);
  assert.equal(new Set(migrated.map((row) => row.source_record_key)).size, 3);
  assert.deepEqual(migrated.map((row) => JSON.parse(row.values_json).ish_yonalishi), ["Saqlash", "Ta’mirlash", "Tabiiy ofatlarni bartaraf etish"]);
  assert.equal(JSON.parse(migrated[1].values_json).tamir_turi, "Kapital");
  assert.equal(JSON.parse(migrated[2].values_json).hodisa_turi, "Sel");

  const unifiedFields = new Set(JSON.parse(database.prepare("SELECT fields_json FROM app_information_templates WHERE id=?").get(maintenanceId).fields_json).map((field) => field.code));
  for (const code of ["ish_yonalishi", "tamir_turi", "hodisa_turi"]) assert.ok(unifiedFields.has(code));
  const normalizedDirections = database.prepare("SELECT value_text FROM app_information_values WHERE field_code='ish_yonalishi' AND record_id BETWEEN 920001 AND 920003 ORDER BY record_id").all();
  assert.deepEqual(normalizedDirections.map((row) => row.value_text), ["Saqlash", "Ta’mirlash", "Tabiiy ofatlarni bartaraf etish"]);
  const hiddenLegacyCount = database.prepare(`SELECT COUNT(*) AS count FROM app_information_templates
    WHERE code IN ('SRC_MAINTENANCE_REPAIR_REPAIR_WORKS','SRC_MAINTENANCE_REPAIR_DISASTER_RECOVERY')
      AND json_extract(presentation_json,'$.hiddenFromCatalog')=1`).get();
  assert.equal(Number(hiddenLegacyCount.count), 2);

  const roadConditionFields = new Set(JSON.parse(database.prepare("SELECT fields_json FROM app_information_templates WHERE code='SRC_MAINTENANCE_REPAIR_ROAD_CONDITION'").get().fields_json).map((field) => field.code));
  assert.ok(roadConditionFields.has("yaxshi_uzunlik"));
  assert.ok(roadConditionFields.has("tamirtalab_uzunlik"));
});
