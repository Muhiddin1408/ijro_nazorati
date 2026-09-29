import fs from "node:fs";

const catalogPath = new URL("../data/information-center-catalog-v2.json", import.meta.url);
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const departmentNames = {
  press_service: "Matbuot kotibi",
  appeals: "Murojaatlar bilan ishlash bo‘yicha bosh mutaxassis",
  finance_economy: "Moliya-iqtisodiyot boshqarmasi",
  design_cost_analysis: "Loyihaviy yechimlar va narxlar shakllanishini tahlil qilish bo‘limi",
  maintenance_repair: "Avtomobil yo‘llarini saqlash va ta’mirlash ishlarini tashkil qilish boshqarmasi",
  roadside_infrastructure: "Yo‘l bo‘yi infratuzilmasini rivojlantirish bo‘limi",
  road_machinery: "Yo‘l texnikalaridan foydalanish bo‘limi",
  execution_discipline: "Ijro intizomi va tashkiliy nazorat bo‘limi",
  road_network_development: "Avtomobil yo‘llari tarmog‘ini rivojlantirish boshqarmasi",
  industrial_infrastructure: "Sanoat infratuzilmasini rivojlantirish bo‘limi",
  digitalization_innovation: "Sohani raqamlashtirish va ilg‘or xorijiy tajribalarni tatbiq etish boshqarmasi",
  investments_ppp: "Xorijiy investitsiyalar, grantlar va davlat-xususiy sheriklikni rivojlantirish bo‘limi",
  human_resources: "Inson resurslarini rivojlantirish va boshqarish bo‘limi",
  anti_corruption: "Korrupsiyaga qarshi ichki nazorat bo‘limi",
  legal_service: "Yuridik xizmat",
  sports_youth: "Sport targ‘ibotchisi va yoshlar yetakchisi",
};

const ownerDepartments = {
  press_service: "Rahbariyat",
  appeals: "Rahbariyat",
  finance_economy: departmentNames.finance_economy,
  design_cost_analysis: departmentNames.design_cost_analysis,
  maintenance_repair: departmentNames.maintenance_repair,
  roadside_infrastructure: departmentNames.roadside_infrastructure,
  road_machinery: departmentNames.road_machinery,
  execution_discipline: departmentNames.execution_discipline,
  road_network_development: departmentNames.road_network_development,
  industrial_infrastructure: departmentNames.industrial_infrastructure,
  digitalization_innovation: departmentNames.digitalization_innovation,
  investments_ppp: departmentNames.investments_ppp,
  human_resources: departmentNames.human_resources,
  anti_corruption: departmentNames.anti_corruption,
  legal_service: departmentNames.legal_service,
  sports_youth: "Rahbariyat",
};

const colors = ["#1957D2", "#7254CE", "#0F766E", "#B45309", "#C2415A", "#087A50", "#2563A7", "#9A5D23", "#0E7490", "#7C3AED", "#4F46E5", "#0F766E", "#9A5D23", "#C72C3B", "#405B82", "#168249"];
const icons = ["Megaphone", "MessageCircle", "WalletCards", "BarChart3", "Wrench", "Building2", "Truck", "ClipboardCheck", "Route", "Factory", "Cpu", "Landmark", "Users", "ShieldCheck", "Scale", "Activity"];

const pairs = [
  ["Е", "E"], ["е", "e"], ["Ё", "Yo"], ["ё", "yo"], ["Ж", "J"], ["ж", "j"], ["Х", "X"], ["х", "x"],
  ["Ц", "S"], ["ц", "s"], ["Ч", "Ch"], ["ч", "ch"], ["Ш", "Sh"], ["ш", "sh"], ["Щ", "Sh"], ["щ", "sh"],
  ["Ю", "Yu"], ["ю", "yu"], ["Я", "Ya"], ["я", "ya"], ["Ў", "O‘"], ["ў", "o‘"], ["Қ", "Q"], ["қ", "q"],
  ["Ғ", "G‘"], ["ғ", "g‘"], ["Ҳ", "H"], ["ҳ", "h"], ["А", "A"], ["а", "a"], ["Б", "B"], ["б", "b"],
  ["В", "V"], ["в", "v"], ["Г", "G"], ["г", "g"], ["Д", "D"], ["д", "d"], ["З", "Z"], ["з", "z"],
  ["И", "I"], ["и", "i"], ["Й", "Y"], ["й", "y"], ["К", "K"], ["к", "k"], ["Л", "L"], ["л", "l"],
  ["М", "M"], ["м", "m"], ["Н", "N"], ["н", "n"], ["О", "O"], ["о", "o"], ["П", "P"], ["п", "p"],
  ["Р", "R"], ["р", "r"], ["С", "S"], ["с", "s"], ["Т", "T"], ["т", "t"], ["У", "U"], ["у", "u"],
  ["Ф", "F"], ["ф", "f"], ["Ъ", "’"], ["ъ", "’"], ["Ь", ""], ["ь", ""], ["Ы", "I"], ["ы", "i"], ["Э", "E"], ["э", "e"],
];

function latin(value) {
  let result = String(value ?? "");
  for (const [from, to] of pairs) result = result.split(from).join(to);
  return result
    .replace(/[’ʻ`']/g, "‘")
    .replace(/\s+([,;:.])/g, "$1")
    .replace(/;+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value, fallback = "field") {
  const result = latin(value).toLowerCase().replace(/[‘’ʻ`']/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 54);
  return result || fallback;
}

function q(value) {
  if (value == null) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function json(value) {
  return q(JSON.stringify(value));
}

function cadence(value, sourceRow) {
  if (value === "ойлик") return "monthly";
  if (value === "доимий") return "continuous";
  return sourceRow === 17 ? "monthly" : "event";
}

function fieldType(label) {
  const value = latin(label).toLowerCase();
  if (/havola|url/.test(value)) return "url";
  if (/koordinata|geo/.test(value)) return "geo";
  if (/davlat|mamlakat/.test(value) && !/davlat raqami|davlat-xususiy|davlat majburiyati/.test(value)) return "country";
  if (/foto|dalolatnoma|bayonnoma|prezentatsiya|sertifikat|pasport|hujjatlar$|fayl|sxema/.test(value)) return "file";
  if (/sana-vaqt|sana va vaqt|uchrashuv vaqti/.test(value)) return "datetime";
  if (/sana|muddati|boshlanish|tugash|oxirgi ko‘rik|o‘rganilgan|qabul kuni/.test(value) && !/muddati o‘tgan summa|muddat bo‘yicha/.test(value)) return "date";
  if (/foiz|ulushi|rentabellik|tayyorlik|progress|bajarilish|darajasi|marja|uptime/.test(value) && !/ijrochi/.test(value)) return "percentage";
  if (/summa|qiymat|mablag‘|byudjet|qarzdorlik|qarz|daromad|xarajat|tushum|foyda|ish haqi|capex|opex|jarima/.test(value)) return "currency";
  if (/soni|miqdori|miqdor|uzunligi|uzunlik|maydoni|maydon|quvvat|hajmi|hajm|yoshi|xodimlar|ishtirokchilar|ko‘rishlar|qatnov|soat|kun|ball|o‘rinlari|zaxira/.test(value)) return "number";
  if (/holat|bosqich|turi$|toifa|natijasi|natija turi|manba turi|mulk turi|qoplama turi|texnik holat|tonallik/.test(value)) return "select";
  if (/mas’ul|keyingi qadam|muammo|sabab|izoh|mazmun|tavsif|talablar|taklif|xulosa|natija|maqsad|yechim|risk|to‘siq|choralar|kelishuv/.test(value)) return "textarea";
  return "text";
}

function fieldUnit(label, type) {
  const value = latin(label).toLowerCase();
  if (type === "percentage") return "%";
  if (type === "currency") return "so‘m/valyuta";
  if (/uzunlik|km|yo‘l/.test(value) && type === "number") return "km";
  if (/maydon/.test(value) && type === "number") return "m²";
  if (/soat/.test(value) && type === "number") return "soat";
  if (/kun/.test(value) && type === "number") return "kun";
  if (type === "number" && /soni|xodim|ishtirokchi|obyekt|qoidabuzarlik|o‘rin/.test(value)) return "ta";
  return undefined;
}

function selectOptions(label) {
  const value = latin(label).toLowerCase();
  if (/holat|bosqich/.test(value)) return ["Rejalashtirilgan", "Jarayonda", "Yakunlangan", "To‘xtatilgan"];
  if (/tonallik/.test(value)) return ["Ijobiy", "Neytral", "Salbiy"];
  return undefined;
}

function buildFields(report) {
  const fields = [];
  const usedCodes = new Set();
  const seenLabels = new Set();
  const add = (rawLabel, fromSource) => {
    const label = latin(rawLabel);
    const normalized = label.toLowerCase().replace(/[^a-z0-9‘]+/g, " ").trim();
    if (!label || seenLabels.has(normalized)) return;
    seenLabels.add(normalized);
    let code = slug(label);
    let suffix = 2;
    while (usedCodes.has(code)) code = `${slug(label).slice(0, 50)}_${suffix++}`;
    usedCodes.add(code);
    const type = fieldType(label);
    const options = type === "select" ? selectOptions(label) : undefined;
    fields.push({
      code,
      label,
      type,
      required: false,
      ...(fieldUnit(label, type) ? { unit: fieldUnit(label, type) } : {}),
      ...(options ? { options } : {}),
      help: fromSource ? "Excel manbasida aniq ko‘rsatilgan maydon" : "Tizim uchun tavsiya etilgan qo‘shimcha maydon",
    });
  };
  for (const label of report.sourceExplicitFields ?? []) add(label, true);
  for (const label of report.recommendedAdditionalFields ?? []) add(label, false);
  return fields.slice(0, 80);
}

function recordType(code, title) {
  const value = `${code} ${latin(title)}`.toLowerCase();
  if (/project|loyiha|program|dastur/.test(value)) return "project";
  if (/meeting|uchrashuv|event|tadbir|qabul/.test(value)) return "event";
  if (/finance|debt|payable|receivable|profit|salary|asset|qarz|foyda|ish haqi|aktiv/.test(value)) return "financial";
  if (/registry|reestr|condition|holati|building|machinery|plant|quarry|system/.test(value)) return "asset";
  if (/appeal|murojaat|call|case|conflict/.test(value)) return "case";
  return "record";
}

function dimensions(fields) {
  const result = ["period"];
  for (const field of fields) {
    if (field.type === "region" || /hudud|viloyat|tuman/.test(field.code)) result.push("region");
    if (/tashkilot|korxona|boshqarma/.test(field.code)) result.push("organization");
    if (field.type === "country") result.push("country");
    if (/yo_l|yol|road|ko_prik|koprik/.test(field.code)) result.push("road");
  }
  return [...new Set(result)].slice(0, 30);
}

const lines = [];
// Wrangler splits D1 migrations on SQL semicolons. The Drizzle marker is only
// metadata, so every generated statement must still end with a semicolon.
const stmt = (sql) => {
  const normalized = sql.trim().replace(/;+$/u, "");
  lines.push(`${normalized};`, "--> statement-breakpoint");
};

lines.push(
  "-- Information Center catalogue v2 generated from the user-supplied маълумотлар.xlsx workbook.",
  `-- Source SHA-256: ${catalog.workbook.sha256}; sheet ${catalog.workbook.sheet}; range ${catalog.workbook.logicalDataRange}.`,
  "-- 16 current central-apparatus units, 49 source-backed tables and 5 clearly labelled supplementary tables.",
  "-- Legacy catalogue rows remain intact for historical records; API defaults to catalog_state=current.",
);

stmt(`CREATE TABLE IF NOT EXISTS app_information_catalog_imports (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  file_name text NOT NULL,
  sheet_name text NOT NULL,
  source_range text NOT NULL,
  checksum text NOT NULL,
  catalog_version text NOT NULL,
  source_department_count integer NOT NULL,
  source_template_count integer NOT NULL,
  supplementary_template_count integer DEFAULT 0 NOT NULL,
  anomalies_json text DEFAULT '[]' NOT NULL,
  status text DEFAULT 'validated' NOT NULL,
  created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
)`);
stmt("CREATE UNIQUE INDEX IF NOT EXISTS app_information_catalog_imports_checksum_unique ON app_information_catalog_imports(checksum)");
stmt("ALTER TABLE app_information_domains ADD COLUMN catalog_state text NOT NULL DEFAULT 'legacy'");
stmt("ALTER TABLE app_information_domains ADD COLUMN catalog_version text NOT NULL DEFAULT 'v1'");
stmt("ALTER TABLE app_information_domains ADD COLUMN source_import_id integer");
stmt("ALTER TABLE app_information_domains ADD COLUMN owner_label text DEFAULT '' NOT NULL");
stmt("ALTER TABLE app_information_domains ADD COLUMN presentation_json text DEFAULT '{}' NOT NULL");
stmt("ALTER TABLE app_information_templates ADD COLUMN catalog_state text NOT NULL DEFAULT 'legacy'");
stmt("ALTER TABLE app_information_templates ADD COLUMN catalog_version text NOT NULL DEFAULT 'v1'");
stmt("ALTER TABLE app_information_templates ADD COLUMN source_import_id integer");
stmt("ALTER TABLE app_information_templates ADD COLUMN source_row integer");
stmt("ALTER TABLE app_information_templates ADD COLUMN provider_primary text");
stmt("ALTER TABLE app_information_templates ADD COLUMN provider_secondary text");
stmt("ALTER TABLE app_information_templates ADD COLUMN source_scope_text text DEFAULT '' NOT NULL");
stmt("ALTER TABLE app_information_templates ADD COLUMN presentation_json text DEFAULT '{}' NOT NULL");
stmt("CREATE INDEX IF NOT EXISTS app_information_domains_catalog_idx ON app_information_domains(catalog_state,active,sort_order,id)");
stmt("CREATE INDEX IF NOT EXISTS app_information_templates_catalog_idx ON app_information_templates(catalog_state,domain_id,active,id)");
stmt("CREATE INDEX IF NOT EXISTS app_information_templates_source_row_idx ON app_information_templates(source_import_id,source_row)");
stmt(`INSERT OR IGNORE INTO app_information_catalog_imports
  (file_name,sheet_name,source_range,checksum,catalog_version,source_department_count,source_template_count,supplementary_template_count,anomalies_json,status)
VALUES (${q(catalog.workbook.file)},${q(catalog.workbook.sheet)},${q(catalog.workbook.logicalDataRange)},${q(catalog.workbook.sha256)},'workbook-v2',16,49,5,${json(catalog.anomalies)},'validated')`);
stmt("UPDATE app_information_domains SET catalog_state='legacy',catalog_version='v1' WHERE code NOT LIKE 'SRC_%'");
stmt("UPDATE app_information_templates SET catalog_state='legacy',catalog_version='v1' WHERE code NOT LIKE 'SRC_%'");

for (const [index, department] of catalog.departments.entries()) {
  const code = `SRC_${department.code.toUpperCase()}`;
  const displayName = departmentNames[department.code] ?? latin(department.sourceDepartmentName);
  const groups = department.inferredPresentation.uiGroups.map(latin);
  const cards = department.inferredPresentation.summaryCards.map(latin);
  const description = `${department.reportCount} ta manba jadvali: ${groups.join(", ")}.`;
  const visibility = department.code === "anti_corruption" ? "restricted" : "internal";
  const ownerName = ownerDepartments[department.code];
  const ownerSql = ownerName ? `(SELECT id FROM app_departments WHERE organization_id=(SELECT id FROM app_organizations WHERE tax_id='200541754' LIMIT 1) AND name=${q(ownerName)} AND active=1 ORDER BY id DESC LIMIT 1)` : "NULL";
  const presentation = { sourceRows: department.sourceRows, groups, summaryCards: cards, sourceDepartmentName: department.sourceDepartmentName, reportCount: department.reportCount };
  stmt(`INSERT INTO app_information_domains
    (code,name,description,owner_department_id,color,icon,sort_order,visibility,active,catalog_state,catalog_version,source_import_id,owner_label,presentation_json)
  VALUES (${q(code)},${q(displayName)},${q(description)},${ownerSql},${q(colors[index])},${q(icons[index])},${(index + 1) * 10},${q(visibility)},1,'current','workbook-v2',(SELECT id FROM app_information_catalog_imports WHERE checksum=${q(catalog.workbook.sha256)} LIMIT 1),${q(displayName)},${json(presentation)})
  ON CONFLICT(code) DO UPDATE SET name=excluded.name,description=excluded.description,owner_department_id=COALESCE(excluded.owner_department_id,app_information_domains.owner_department_id),color=excluded.color,icon=excluded.icon,sort_order=excluded.sort_order,visibility=excluded.visibility,active=1,catalog_state='current',catalog_version='workbook-v2',source_import_id=excluded.source_import_id,owner_label=excluded.owner_label,presentation_json=excluded.presentation_json,updated_at=CURRENT_TIMESTAMP`);
}

for (const department of catalog.departments) {
  const domainCode = `SRC_${department.code.toUpperCase()}`;
  const reportsByRow = new Map(department.sourceFacts.reports.map((report) => [report.sourceRow, report]));
  const kpisByReport = new Map(department.inferredPresentation.reports.map((_, index) => [index, []]));
  department.inferredPresentation.summaryCards.map(latin).forEach((card, index) => kpisByReport.get(index % department.inferredPresentation.reports.length).push(card));
  department.inferredPresentation.reports.forEach((report, reportIndex) => {
    const source = reportsByRow.get(report.sourceRow);
    const fields = buildFields(report);
    const assignedKpis = kpisByReport.get(reportIndex);
    if (!assignedKpis.length) assignedKpis.push(`${latin(report.title)} bo‘yicha jami`);
    const indicators = assignedKpis.map((label, index) => ({ code: `${report.code.toUpperCase()}_KPI_${index + 1}`, label, role: index === 0 ? "outcome" : "driver", unit: /foiz|ulushi|darajasi|ijrosi|tayyorlik/i.test(label) ? "%" : "count", direction: "contextual" }));
    const sourceCadence = cadence(source?.cadence, report.sourceRow);
    const group = latin(department.inferredPresentation.uiGroups[reportIndex % department.inferredPresentation.uiGroups.length]);
    const presentation = {
      sourceBacked: true,
      sourceCells: source?.sourceCells,
      group,
      kpiCards: assignedKpis,
      tableColumns: fields.map((field) => field.code),
      filters: dimensions(fields),
      chart: { type: fields.some((field) => ["number", "currency", "percentage"].includes(field.type)) ? "bar" : "status", groupBy: dimensions(fields)[1] ?? "period" },
      sourceCadenceOriginal: source?.cadence,
      cadenceAssumption: source?.cadence == null,
    };
    const code = `${domainCode}_${report.code.toUpperCase()}`;
    const description = `${latin(source?.coverage ?? report.title)} Manba: yuklangan Excel faylining ${report.sourceRow}-qatori.`;
    stmt(`INSERT INTO app_information_templates
      (domain_id,code,name,description,record_type,cadence,status_set,drill_profile,source_mode,source_system_code,freshness_sla_hours,visibility,fields_json,indicators_json,dimensions_json,version,active,catalog_state,catalog_version,source_import_id,source_row,provider_primary,provider_secondary,source_scope_text,presentation_json)
    VALUES ((SELECT id FROM app_information_domains WHERE code=${q(domainCode)} LIMIT 1),${q(code)},${q(latin(report.title))},${q(description)},${q(recordType(report.code, report.title))},${q(sourceCadence)},'ACTION','CONTEXTUAL','manual',NULL,${sourceCadence === "continuous" ? 168 : 744},${q(department.code === "anti_corruption" ? "restricted" : "internal")},${json(fields)},${json(indicators)},${json(dimensions(fields))},2,1,'current','workbook-v2',(SELECT id FROM app_information_catalog_imports WHERE checksum=${q(catalog.workbook.sha256)} LIMIT 1),${report.sourceRow},${q(source?.provider1)},${q(source?.provider2)},${q(source?.coverage ?? "")},${json(presentation)})
    ON CONFLICT(code) DO UPDATE SET domain_id=excluded.domain_id,name=excluded.name,description=excluded.description,record_type=excluded.record_type,cadence=excluded.cadence,status_set=excluded.status_set,drill_profile=excluded.drill_profile,source_mode=excluded.source_mode,freshness_sla_hours=excluded.freshness_sla_hours,visibility=excluded.visibility,fields_json=excluded.fields_json,indicators_json=excluded.indicators_json,dimensions_json=excluded.dimensions_json,version=2,active=1,catalog_state='current',catalog_version='workbook-v2',source_import_id=excluded.source_import_id,source_row=excluded.source_row,provider_primary=excluded.provider_primary,provider_secondary=excluded.provider_secondary,source_scope_text=excluded.source_scope_text,presentation_json=excluded.presentation_json,updated_at=CURRENT_TIMESTAMP`);
  });
}

for (const item of catalog.inferredSupplementaryDatasetsNotExplicitlyListedInWorkbook) {
  const domainCode = `SRC_${item.departmentCode.toUpperCase()}`;
  const code = `${domainCode}_EXTRA_${slug(item.dataset).toUpperCase()}`;
  const fields = buildFields({ sourceExplicitFields: [], recommendedAdditionalFields: item.fields });
  const label = latin(item.dataset);
  const indicators = [
    { code: `${slug(item.dataset).toUpperCase()}_TOTAL`, label: `${label} bo‘yicha jami`, role: "outcome", unit: "count", direction: "contextual" },
    { code: `${slug(item.dataset).toUpperCase()}_CURRENT`, label: "Yangilangan ma’lumotlar ulushi", role: "driver", unit: "%", direction: "higher_is_better" },
  ];
  const presentation = { sourceBacked: false, supplementary: true, group: "Qo‘shimcha tavsiya", kpiCards: indicators.map((indicator) => indicator.label), tableColumns: fields.map((field) => field.code), filters: dimensions(fields), chart: { type: "bar", groupBy: dimensions(fields)[1] ?? "period" } };
  stmt(`INSERT INTO app_information_templates
    (domain_id,code,name,description,record_type,cadence,status_set,drill_profile,source_mode,source_system_code,freshness_sla_hours,visibility,fields_json,indicators_json,dimensions_json,version,active,catalog_state,catalog_version,source_import_id,source_row,provider_primary,provider_secondary,source_scope_text,presentation_json)
  VALUES ((SELECT id FROM app_information_domains WHERE code=${q(domainCode)} LIMIT 1),${q(code)},${q(label)},'Yuklangan fayldagi ma’lumotlarni to‘ldiruvchi qo‘shimcha tavsiya.','record','continuous','ACTION','CONTEXTUAL','manual',NULL,168,'internal',${json(fields)},${json(indicators)},${json(dimensions(fields))},2,1,'current','workbook-v2',(SELECT id FROM app_information_catalog_imports WHERE checksum=${q(catalog.workbook.sha256)} LIMIT 1),NULL,NULL,NULL,'',${json(presentation)})
  ON CONFLICT(code) DO UPDATE SET domain_id=excluded.domain_id,name=excluded.name,description=excluded.description,record_type=excluded.record_type,cadence=excluded.cadence,fields_json=excluded.fields_json,indicators_json=excluded.indicators_json,dimensions_json=excluded.dimensions_json,version=2,active=1,catalog_state='current',catalog_version='workbook-v2',source_import_id=excluded.source_import_id,source_row=NULL,presentation_json=excluded.presentation_json,updated_at=CURRENT_TIMESTAMP`);
}

stmt("UPDATE app_information_domains SET active=1 WHERE catalog_state IN ('legacy','current')");
stmt("UPDATE app_information_templates SET active=1 WHERE catalog_state IN ('legacy','current')");

process.stdout.write(`${lines.join("\n")}\n`);
