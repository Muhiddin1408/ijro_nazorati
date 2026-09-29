import { flat, readSource, readAllCss } from './fixtures/source.mjs';
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("unified staff migration contains the validated workbook snapshot", async () => {
  const sql = await readFile(new URL("../drizzle/0011_unified_staff_seed.sql", import.meta.url), "utf8");
  assert.equal((sql.match(/INSERT INTO app_organizations /g) ?? []).length, 241);
  assert.equal((sql.match(/INSERT OR IGNORE INTO app_staff_positions/g) ?? []).length, 536);
  assert.match(sql, /imported_positions=\(SELECT COUNT\(\*\) FROM app_staff_positions/);
  assert.match(sql, /type='committee'/);
});

test("official central apparatus migration reconciles to the source order", async () => {
  const sql = await readFile(new URL("../drizzle/0012_central_apparatus_staff.sql", import.meta.url), "utf8");
  assert.match(sql, /efe0a2d47bb6069321859c776dc2b9a0d2fdf004706c7a1e13bfe43447f8a07e/);
  assert.match(sql, /2026-05-01/);
  assert.equal((sql.match(/INSERT INTO app_departments /g) ?? []).length, 19);
  assert.equal((sql.match(/INSERT OR IGNORE INTO app_staff_positions/g) ?? []).length, 57);
  assert.match(sql, /SUM\(headcount_units\),0\).*?=76/s);
  assert.match(sql, /app_staff_position_roles/);
  assert.match(sql, /position\.source_row_id=23/);
  assert.match(sql, /position\.source_row_id=36/);
  assert.match(sql, /Transport Ministry worksheet.*excluded/);
});

test("central apparatus employee directory imports identities without inventing credentials", async () => {
  const [migration, employeesApi, auth, staffApi, dashboard, adminPages] = await Promise.all([
    readFile(new URL("../drizzle/0016_central_apparatus_employees.sql", import.meta.url), "utf8"),
    readFile(new URL("../services/employees.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/auth.ts", import.meta.url), "utf8"),
    readSource(new URL("../app/api/staff/route.ts", import.meta.url)),
    readSource(new URL("../app/dashboard.tsx", import.meta.url)),
    readSource(new URL("../app/admin-pages.tsx", import.meta.url)),
  ]);
  // Personal data (names, birth dates, phones) must never be part of tracked migrations.
  assert.match(migration, /CREATE TABLE IF NOT EXISTS `app_employee_profiles`/);
  assert.doesNotMatch(migration, /INSERT INTO app_employees/);
  assert.doesNotMatch(migration, /\+998|birth_date','|\d{4}-\d{2}-\d{2}'/);
  assert.doesNotMatch(migration, /@gmail\.com/);
  assert.doesNotMatch(migration, /INSERT INTO app_user_credentials/);
  const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");
  assert.match(gitignore, /^\/private-seed\/\*\.sql$/m);
  assert.match(employeesApi, /app_employee_profiles/);
  assert.match(employeesApi, /mobilePhone/);
  assert.match(auth, /profile\.internal_extension/);
  assert.match(staffApi, /viewEmployeeContacts/);
  assert.match(dashboard + adminPages, /Aloqa ma’lumotlari/);
});

test("information center catalog is source-backed, versioned and production safe", async () => {
  const [schema, legacyCatalog, catalog, cleanup, hardening, route, fileRoute, ingestRoute, informationAccess, ui, dataWorkspace, sourceCatalog] = await Promise.all([
    readFile(new URL("../drizzle/0013_information_center.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0014_information_catalog.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0017_information_catalog_v2.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0018_information_center_cleanup.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0015_information_center_hardening.sql", import.meta.url), "utf8"),
    readSource(new URL("../app/api/information/route.ts", import.meta.url)),
    readSource(new URL("../app/api/information/files/route.ts", import.meta.url)),
    readSource(new URL("../app/api/information/ingest/route.ts", import.meta.url)),
    readFile(new URL("../lib/information.ts", import.meta.url), "utf8"),
    readSource(new URL("../app/information-center.tsx", import.meta.url)),
    readSource(new URL("../app/information-dashboard.tsx", import.meta.url)),
    readFile(new URL("../data/information-center-catalog-v2.json", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /CREATE TABLE `app_information_records`/);
  assert.match(schema, /CREATE TABLE `app_information_record_history`/);
  assert.equal((legacyCatalog.match(/INSERT INTO app_information_domains /g) ?? []).length, 14);
  assert.equal((legacyCatalog.match(/INSERT INTO app_information_templates /g) ?? []).length, 78);
  assert.match(catalog, /9a4ebfd9299d0627e327e5d9cb2589787248ea1b72486c612656d501e7381f89/);
  assert.match(catalog, /49 source-backed tables/);
  assert.equal((catalog.match(/INSERT INTO app_information_domains/g) ?? []).length, 16);
  assert.equal((catalog.match(/INSERT INTO app_information_templates/g) ?? []).length, 49 + 5);
  assert.equal((cleanup.match(/'_EXTRA_|_EXTRA_/g) ?? []).length, 5);
  assert.match(cleanup, /active=0/);
  assert.match(cleanup, /catalog_state='removed'/);
  assert.match(cleanup, /SRC_PRESS_SERVICE_MEDIA_COVERAGE/);
  assert.match(cleanup, /'\$\.drilldown',json\('\["hudud"\]'\)/);
  const migrationStatements = catalog.split("--> statement-breakpoint").map((statement) => statement.trim()).filter(Boolean);
  assert.ok(migrationStatements.every((statement) => statement.endsWith(";")), "every D1 statement must be semicolon terminated");
  assert.ok(Math.max(...migrationStatements.map((statement) => Buffer.byteLength(statement))) < 10_000, "generated D1 statements must remain bounded");
  assert.match(catalog, /catalog_state='current'/);
  assert.doesNotMatch(catalog, /INSERT INTO app_information_records/);
  assert.equal(JSON.parse(sourceCatalog).departments.length, 16);
  assert.equal(JSON.parse(sourceCatalog).departments.reduce((sum, department) => sum + department.reportCount, 0), 49);
  assert.match(hardening, /ADD COLUMN `field_code`/);
  assert.match(hardening, /canViewRestrictedInformation/);
  assert.match(route, /Yuborishdan oldin barcha majburiy maydonlarni/);
  assert.match(route, /visibility<>'restricted'/);
  assert.match(route, /catalogView === "domains"/);
  assert.match(route, /includeRecords/);
  assert.match(route, /await db\.batch\(\[\s*\.\.\.createStatements/s);
  assert.match(fileRoute, /MAX_INFORMATION_FILE_BYTES = 100 \* 1024 \* 1024/);
  assert.match(fileRoute, /information\.file_uploaded/);
  assert.match(ingestRoute, /INFORMATION_INGEST_SECRET/);
  assert.match(ingestRoute, /sourceRecordKey/);
  assert.match(ingestRoute, /const status = "draft"/);
  assert.match(ingestRoute, /validationStage: "submit"/);
  assert.match(ingestRoute, /informationValidationStatements/);
  assert.match(ingestRoute, /action: "unchanged"/);
  // Integrations may refresh their own drafts, but never records in the approval
  // route or records edited by a person (behavior covered in audit-medium-reports).
  assert.match(ingestRoute, /isEditableRecordStatus\(existing\.status\)/);
  assert.match(ingestRoute, /WHERE id=\? AND status=\?/);
  assert.match(ingestRoute, /action: "locked"/);
  assert.match(informationAccess, /canViewRestrictedInformation/);
  assert.match(informationAccess, /presentation: jsonObject<InformationPresentation>/);
  assert.match(informationAccess, /SELECT id,owner_department_id,visibility FROM app_information_domains WHERE active=1 ORDER BY/);
  assert.match(route, /JOIN app_information_templates t ON t\.id=r\.template_id AND t\.active=1\n JOIN app_information_domains domain ON domain\.id=t\.domain_id AND domain\.active=1/);
  assert.doesNotMatch(fileRoute, /t\.active=1 AND t\.catalog_state='current'/);
  assert.match(ui, /Boshqarmalar va ularning ma’lumotlari/);
  assert.match(ui, /InformationDataWorkspace/);
  assert.doesNotMatch(ui, /Jadval ustunlari/);
  assert.match(dataWorkspace, /faqat ma’lumot mavjud qatorlar/);
  assert.match(dataWorkspace, /drillDimensions/);
  assert.match(dataWorkspace, /info-data-filters/);
  assert.match(dataWorkspace, /loadXlsx\(\)/);
  assert.match(dataWorkspace, /To‘ldirish namunasini ko‘rish/);
  assert.match(dataWorkspace, /const \[showExample, setShowExample\] = useState\(false\)/);
  assert.doesNotMatch(dataWorkspace, /To‘liqlik|to‘liq|Ma’lumot to‘liqligi/);
  assert.doesNotMatch(ui, /Majburiy maydonlar to‘liqligi|info-method-note|template\.description/);
  assert.match(ui, /Barcha boshqarmalarga qaytish/);
  assert.match(ui, /Demo yozuv real hisobotga qo‘shilmaydi/);
});

test("uploaded workbook profiles preserve exact source tables and consolidated totals", async () => {
  const [migration, sampleJson, informationRoute, workspace] = await Promise.all([
    readFile(new URL("../drizzle/0019_source_workbook_profiles.sql", import.meta.url), "utf8"),
    readFile(new URL("../data/information-source-samples.json", import.meta.url), "utf8"),
    readSource(new URL("../app/api/information/route.ts", import.meta.url)),
    readSource(new URL("../app/information-dashboard.tsx", import.meta.url)),
  ]);
  const samples = JSON.parse(sampleJson);
  const sampleKeys = [
    "SRC_APPEALS_APPEAL_RESULTS",
    "SRC_APPEALS_CALL_CENTER_APPEALS",
    "SRC_APPEALS_LEADERSHIP_RECEPTIONS",
    "SRC_PRESS_SERVICE_MEDIA_COVERAGE",
    "SRC_ROAD_NETWORK_DEVELOPMENT_DEVELOPMENT_PROGRAMS",
  ];
  assert.deepEqual(Object.keys(samples).sort(), sampleKeys.sort());
  assert.match(migration, /source-workbooks-2026-08/);
  assert.equal((migration.match(/,'validated'\)/g) ?? []).length, 4);
  assert.match(migration, /"profile":"oav_region_detail"/);
  assert.match(migration, /"profile":"construction_programs"/);
  assert.match(migration, /"profile":"appeals_consolidated"/);
  assert.match(migration, /"profile":"appeals_special_control"/);
  assert.match(migration, /"profile":"call_center_regional"/);
  assert.match(migration, /'\$\.hiddenFromCatalog',1,'\$\.consolidatedInto','SRC_APPEALS_APPEAL_RESULTS'/);
  assert.match(migration, /"frozenColumns":\["obyekt_nomi","pudrat_tashkiloti"\]/);
  assert.match(migration, /"summaryColumns":\["hudud","materiallar_soni","oavlar_soni","birinchi_elon_sanasi","oxirgi_elon_sanasi"\]/);
  assert.match(migration, /Hudud va murojaatchi profili/);
  assert.match(migration, /Mavzu va ko‘rib chiqish natijalari/);
  assert.match(migration, /Rahbariyat qabullari/);
  assert.match(migration, /Xalq va Virtual qabulxona/);
  assert.doesNotMatch(migration, /2024 yil|2025 yil|2024 йил|2025 йил/);

  const sum = (records, field) => records.reduce((total, record) => total + Number(record.values[field] ?? 0), 0);
  const construction = samples.SRC_ROAD_NETWORK_DEVELOPMENT_DEVELOPMENT_PROGRAMS;
  assert.equal(construction.records.length, 2);
  assert.equal(sum(construction.records, "reja_km"), 15);
  assert.ok(Math.abs(sum(construction.records, "reja_qiymat") - 109_542.23) < 0.001);
  assert.equal(sum(construction.records, "amalda_km"), 0);
  assert.ok(Math.abs(sum(construction.records, "amalda_qiymat") - 1.52) < 0.001);
  assert.deepEqual([...new Set(construction.records.map((record) => record.values.tuman))], ["Tuman ko‘rsatilmagan"]);
  assert.deepEqual(construction.metadata.zeroSummarySheetsExcluded.sort(), ["туман кесимида", "ҳудуд кесимида"].sort());

  const callCenter = samples.SRC_APPEALS_CALL_CENTER_APPEALS;
  assert.equal(callCenter.records.length, 14);
  assert.equal(sum(callCenter.records, "murojaatlar_soni"), 5_525);
  assert.equal(["yol_tamirlash", "qamchiq_dovonidagi_holat", "tarozi", "hududlardagi_ob_havo", "yol_holati", "boshqalar"]
    .reduce((total, field) => total + sum(callCenter.records, field), 0), 5_525);
  assert.ok(callCenter.records.every((record) => record.values.ulushi >= 0 && record.values.ulushi <= 1));

  const appeals = samples.SRC_APPEALS_APPEAL_RESULTS;
  const appealRegions = appeals.records.filter((record) => record.values.kesim === "hudud");
  const appealTopics = appeals.records.filter((record) => record.values.kesim === "mavzu");
  assert.equal(appealRegions.length, 15);
  assert.equal(appealTopics.length, 12);
  assert.equal(sum(appealRegions, "jami_asosiy"), 1_315);
  assert.equal(sum(appealRegions, "jami_taqqoslash"), 1_494);
  assert.equal(sum(appealTopics, "muddati_buzilgan"), 0);
  assert.deepEqual(appeals.metadata.refErrorColumnsExcluded, ["X", "Y", "Z", "AA", "AC", "AD"]);

  const special = samples.SRC_APPEALS_LEADERSHIP_RECEPTIONS;
  assert.deepEqual(special.metadata.countsByKesim, { rahbariyat: 4, qabulxona: 2, javobgarlik: 5 });
  const media = samples.SRC_PRESS_SERVICE_MEDIA_COVERAGE;
  assert.equal(media.records.length, 2);
  assert.equal(new Set(media.records.map((record) => record.values.hudud)).size, 1);
  assert.equal(media.records.map((record) => record.values.elon_sanasi).sort().at(-1), "2026-05-14");

  assert.match(informationRoute, /hiddenFromCatalog/);
  assert.match(workspace, /import\("(?:\.\.\/)+data\/information-source-samples\.json"\)/);
  assert.match(workspace, /sourceSamples as SourceSamples/);
  assert.match(workspace, /Respublika jami/);
  assert.match(workspace, /info-source-tabs/);
  assert.match(workspace, /source-profile-\$\{sourceProfile\}/);
  assert.match(workspace, /Tuman ko‘rsatilmagan/);
});

test("staff directory represents every occupied and vacant unit", async () => {
  const [route, dashboard, adminPages] = await Promise.all([
    readSource(new URL("../app/api/staff/route.ts", import.meta.url)),
    readSource(new URL("../app/dashboard.tsx", import.meta.url)),
    readSource(new URL("../app/admin-pages.tsx", import.meta.url)),
  ]);
  assert.match(route, /SUM\(x\.fte_rate\)/);
  assert.match(route, /occupancies: positionOccupancies/);
  assert.match(route, /vacantUnits:/);
  assert.match(adminPages, /StaffOccupancyCell/);
  assert.match(dashboard + adminPages, /Aloqa ma’lumotlari/);
});

test("group chat creation, safe read markers and full-width composer are enabled", async () => {
  const [route, dashboard, chatPage, css] = await Promise.all([
    // The chat route authorizes through lib/policy/chat.ts and writes through services/chat.ts.
    Promise.all(["../app/api/chat/route.ts", "../lib/policy/chat.ts", "../services/chat.ts"].map((path) => readFile(new URL(path, import.meta.url), "utf8"))).then((parts) => parts.join("\n")),
    readSource(new URL("../app/dashboard.tsx", import.meta.url)),
    readSource(new URL("../app/chat-page.tsx", import.meta.url)),
    readAllCss(),
  ]);
  const ui = dashboard + chatPage;
  assert.match(route, /action === "createGroup"/);
  assert.match(route, /MAX_GROUP_MEMBERS = 250/);
  assert.match(route, /memberIds\.length > MAX_GROUP_MEMBERS - 1/);
  assert.match(route, /allEmployeesAreActive/);
  assert.match(route, /index \+= 60/);
  assert.match(route, /DELETE FROM app_chat_members WHERE channel_id=\?/);
  assert.doesNotMatch(route, /employeeIdsInScopes/);
  assert.match(route, /O‘qilgan xabar ushbu suhbatga tegishli emas/);
  assert.match(route, /Javob berilayotgan xabar ushbu suhbatga tegishli emas/);
  assert.match(route, /"?Vary"?: "Cookie"/);
  assert.match(ui, /Yangi guruh yaratish/);
  assert.match(ui, /Guruh yaratish/);
  assert.match(ui, /className="chat-composer-row"/);
  assert.match(ui, /aria-label=\{t\("Suhbatlar ro‘yxatiga qaytish"\)\}/);
  assert.match(ui, /channelRefreshPromise/);
  assert.match(ui, /messageRequestsInFlight/);
  assert.match(ui, /refreshChannels\(true\)/);
  assert.match(ui, /controller\.abort\(\)/);
  assert.doesNotMatch(ui, /className="chat-attach" tabIndex/);
  assert.match(dashboard, /import\("(?:\.\/|(?:\.\.\/)+)chat-page"\)/);
  assert.match(css, /\.chat-composer-row \{ width:100%; display:grid; grid-template-columns:46px minmax\(0,1fr\) auto/);
});

test("leader task assignment validates recipients and keeps hierarchical forwarding", async () => {
  const [routeSource, taskService, data, chatData, dashboard, dashboardKit, tasksPage, taskMeetingModals, directory] = await Promise.all([
    readSource(new URL("../app/api/tasks/route.ts", import.meta.url)),
    readFile(new URL("../services/tasks.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/data.ts", import.meta.url), "utf8"),
    // Chat queries live in services/chat.ts; lib/chat.ts is the compatibility layer.
    Promise.all(["../lib/chat.ts", "../services/chat.ts"].map((path) => readFile(new URL(path, import.meta.url), "utf8"))).then((parts) => parts.join("\n")),
    readSource(new URL("../app/dashboard.tsx", import.meta.url)),
    readSource(new URL("../app/dashboard-kit.tsx", import.meta.url)),
    readSource(new URL("../app/tasks-page.tsx", import.meta.url)),
    readSource(new URL("../app/task-meeting-modals.tsx", import.meta.url)),
    readSource(new URL("../app/api/directory/route.ts", import.meta.url)),
  ]);
  // Task writes live in services/tasks.ts; the route validates and authorizes.
  const route = routeSource + taskService;
  const ui = dashboard + tasksPage + taskMeetingModals;
  assert.match(route, /MAX_DIRECT_ASSIGNEES = 250/);
  assert.match(route, /Number\.isSafeInteger\(id\) && id > 0/);
  assert.match(route, /recipientSummary: \{ employees: assigneeIds\.length, audiences: audiences\.length \}/);
  // Creation is one transaction; there is no follow-up manual rollback batch.
  assert.match(route, /SELECT id FROM app_tasks WHERE creation_key=\?/);
  assert.doesNotMatch(route, /\.catch\(\(\) => undefined\)/);
  assert.match(route, /"Cache-Control": "private, no-store", "?Vary"?: "Cookie"/);
  assert.match(data, /claimableByActor/);
  assert.match(data, /actorOrganizationAncestors/);
  assert.match(data, /participantsByMeeting/);
  assert.match(data, /audiencesByMeeting/);
  assert.match(chatData, /attachmentsByMessage/);
  assert.match(ui, /task\.claimableByActor/);
  assert.match(ui, /task-recipient-confirmation/);
  assert.match(flat(ui), /organizations=\{organizations\} departments=\{departments\}/);
  assert.match(ui, /excludedIds=\{\[actor\.id, \.\.\.task\.assignments/);
  assert.match(dashboardKit, /export function defaultDirectoryOrganizationId/);
  assert.match(dashboardKit, /scoped-organization-cascade/);
  assert.match(dashboard, /pendingBootstrapRequest/);
  assert.match(dashboard, /Date\.now\(\) - lastBootstrapAt\.current >= 300_000/);
  // Regression: the refresh effect must not depend on the timestamp it updates (endless bootstrap loop).
  assert.doesNotMatch(dashboard, /useState\(0\);?\s*\/\/.*lastBootstrapAt|\[lastBootstrapAt, refresh\]/);
  assert.match(dashboard, /const lastBootstrapAt = useRef\(0\)/);
  // Alphabet switching is render-time (lib/i18n), not a batched DOM observer.
  assert.match(dashboard, /<I18nProvider locale=\{locale\}>/);
  assert.match(ui, /const \[visibleCount, setVisibleCount\] = useState\(36\)/);
  assert.match(dashboard, /import\("(?:\.\/|(?:\.\.\/)+)tasks-page"\)/);
  assert.match(dashboard, /from "(?:\.\/|(?:\.\.\/)+)task-meeting-modals"/);
  assert.match(dashboard, /main-content chat-active/);
  assert.match(dashboard, /<RoadLoader/);
  assert.match(directory, /"?Vary"?: "Cookie"/);
});

test("hierarchical audiences and capped directory search stay enabled", async () => {
  const [directory, tasks, meetings, dashboard, dashboardKit, chatPage, taskMeetingModals, css, localInsights, worker, emblem, logo, dashboardHome] = await Promise.all([
    readFile(new URL("../lib/directory.ts", import.meta.url), "utf8"),
    Promise.all([
      readSource(new URL("../app/api/tasks/route.ts", import.meta.url)),
      readFile(new URL("../services/tasks.ts", import.meta.url), "utf8"),
    ]).then((sources) => sources.join("\n")),
    Promise.all([
      readSource(new URL("../app/api/meetings/route.ts", import.meta.url)),
      readFile(new URL("../services/meetings.ts", import.meta.url), "utf8"),
    ]).then((sources) => sources.join("\n")),
    readSource(new URL("../app/dashboard.tsx", import.meta.url)),
    readSource(new URL("../app/dashboard-kit.tsx", import.meta.url)),
    readSource(new URL("../app/chat-page.tsx", import.meta.url)),
    readSource(new URL("../app/task-meeting-modals.tsx", import.meta.url)),
    readAllCss(),
    readSource(new URL("../app/local-insights.tsx", import.meta.url)),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/uzavtoyul-emblem.png", import.meta.url)),
    readFile(new URL("../public/uzavtoyul-logo.png", import.meta.url)),
    readSource(new URL("../app/dashboard-home.tsx", import.meta.url)),
  ]);
  const ui = dashboard + chatPage + taskMeetingModals + dashboardHome;
  assert.match(directory, /Math\.min\(100/);
  assert.match(directory, /LEFT JOIN app_employee_profiles profile ON profile\.employee_id=e\.id/);
  assert.match(directory, /profile\.full_name_cyrillic LIKE/);
  assert.doesNotMatch(directory, /normalized\.length\s*</);
  assert.match(tasks, /app_task_audiences/);
  assert.match(meetings, /app_meeting_audiences/);
  assert.match(tasks, /employeeIdsInScopes/);
  assert.match(meetings, /employeeIdsInScopes/);
  assert.match(dashboardKit, /export function OrganizationCascadePicker/);
  assert.match(dashboardKit, /organization\.type !== "committee"/);
  assert.match(dashboardKit, /Qo‘mita markaziy apparati/);
  assert.match(dashboardKit, /Tizimdagi korxonalar/);
  assert.match(dashboardKit, /Hududiy boshqarmalar/);
  assert.match(dashboardKit, /To‘g‘ridan-to‘g‘ri bo‘ysunuvchi/);
  assert.ok((ui.match(/trim\(\)\.length >= 1/g) ?? []).length >= 3, "chat, group and assignee pickers must accept a one-character query");
  assert.match(ui, /Ko‘rinayotganlarni tanlash/);
  assert.match(ui, /Yana 60 ta ko‘rsatish/);
  assert.doesNotMatch(dashboard, /Kamida 2 belgi|2 ta harf|2 belgi bilan/);

  assert.match(dashboardHome, /<LocalInsightsPanel tasks=\{data\.tasks\} meetings=\{data\.meetings\}/);
  assert.match(localInsights, /BEPUL · TASHQI API-SIZ/);
  assert.match(localInsights, /48 \* 60 \* 60 \* 1000/);
  assert.match(localInsights, /median\(progressValues/);
  assert.doesNotMatch(localInsights, /\bfetch\s*\(/);
  assert.match(css, /background:url\('\/uzavtoyul-emblem\.png'\)/);
  assert.match(css, /background:url\('\/uzavtoyul-logo\.png'\)/);
  assert.equal(emblem.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(logo.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.ok(emblem.length > 1_000);
  assert.ok(logo.length > 1_000);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.info-data-table-wrap > \.info-data-table \{ display:none; \}[\s\S]*\.info-data-mobile-list \{ display:grid; \}/);
  assert.match(css, /\.organization-cascade select[\s\S]*min-height:44px !important; font-size:16px !important/);
  assert.match(worker, /source: "\/api\/:path\*",\s*headers: \[\{ key: "Cache-Control", value: "private, no-store" \}\]/);
});
