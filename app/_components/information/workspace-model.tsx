"use client";

import { tNow } from "../../../lib/i18n";
import type { InformationField, InformationRecord, InformationTemplate } from "../../information-center";
import { ratioOfSums } from "../../../lib/table-values";
import type { WorkspaceRecord, DrillDimension, GroupRow } from "./workspace-types";

export const numberFormatter = new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 });

export function normalized(value: string) {
  return value
    .toLocaleLowerCase("uz")
    .replace(/[ʻ’‘`]/g, "'")
    .replace(/[^a-zа-яёқғҳў0-9]+/gi, " ")
    .trim();
}

const ROAD_ELEMENT_METRIC_CONFIG: Array<{ field: InformationField; matcher: RegExp; legacyCodes: string[] }> = [
  {
    field: { code: "__road_element_signs", label: "Yo‘l belgilari", type: "number", unit: "ta" },
    matcher: /yo'l belg|yol belg|йўл белг|йол белг/,
    legacyCodes: ["yol_belgilari", "yol_belgilari_soni"],
  },
  {
    field: { code: "__road_element_lighting", label: "Yoritish qurilmalari", type: "number", unit: "ta" },
    matcher: /yorit|ёрит|йорит/,
    legacyCodes: ["yoritish", "yoritish_soni"],
  },
  {
    field: { code: "__road_element_drainage", label: "Suv qochirish inshootlari", type: "number", unit: "ta" },
    matcher: /suv qoch|drenaj|сув қоч|дренаж/,
    legacyCodes: ["suv_qochirish", "suv_qochirish_soni"],
  },
  {
    field: { code: "__road_element_stops", label: "Bekatlar", type: "number", unit: "ta" },
    matcher: /bekat|бекат/,
    legacyCodes: ["bekatlar", "bekatlar_soni"],
  },
  {
    field: { code: "__road_element_barriers", label: "To‘siqlar", type: "number", unit: "ta" },
    matcher: /to'siq|tosiq|тўсиқ|тосиқ/,
    legacyCodes: ["tosiqlar", "tosiqlar_soni"],
  },
  {
    field: { code: "__road_element_lights", label: "Svetoforlar", type: "number", unit: "ta" },
    matcher: /svetofor|светофор/,
    legacyCodes: ["svetoforlar", "svetoforlar_soni"],
  },
];

export function fieldText(field: InformationField) {
  return normalized(`${field.code} ${field.label}`);
}

export function findField(fields: InformationField[], expressions: RegExp[], omitted = new Set<string>()) {
  return fields.find(
    (field) => !omitted.has(field.code) && expressions.some((expression) => expression.test(fieldText(field))),
  );
}

export function statusLabel(value: string) {
  return value === "published"
    ? "Tasdiqlangan"
    : value === "submitted"
      ? "Ko‘rib chiqishda"
      : value === "returned"
        ? "Qaytarilgan"
        : value === "rejected"
          ? "Rad etilgan"
          : value === "archived"
            ? "Arxivlangan"
            : "Qoralama";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function numericValue(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const normalizedValue = String(value ?? "")
    .replace(/[\s\u00a0]+/g, "")
    .replace(",", ".");
  const direct = Number(normalizedValue);
  if (Number.isFinite(direct)) return direct;
  const firstNumber = normalizedValue.match(/-?\d+(?:\.\d+)?/);
  return firstNumber ? Number(firstNumber[0]) : 0;
}

export function isAverageMetric(field: InformationField) {
  return field.type === "percentage" || /foiz|ulush|daraja|ijro|bajarilish|tayyorlik/.test(fieldText(field));
}

export function aggregateMetric(records: WorkspaceRecord[], field: InformationField) {
  if (field.aggregationFormula) return ratioOfSums(records, field.aggregationFormula) ?? NaN;
  const roadElementMetric = ROAD_ELEMENT_METRIC_CONFIG.find((item) => item.field.code === field.code);
  if (roadElementMetric) {
    return records.reduce((sum, record) => {
      const category = normalized(String(record.values.element_turi ?? ""));
      const legacyValue = roadElementMetric.legacyCodes
        .map((code) => record.values[code])
        .find((value) => value != null && value !== "");
      if (
        category &&
        roadElementMetric.matcher.test(category) &&
        record.values.mavjud_soni != null &&
        record.values.mavjud_soni !== ""
      )
        return sum + numericValue(record.values.mavjud_soni);
      if (!category || legacyValue != null) return sum + numericValue(legacyValue);
      return sum;
    }, 0);
  }
  const values = records
    .map((record) => record.values[field.code])
    .filter((value) => value != null && value !== "")
    .map(numericValue);
  if (!values.length) return NaN;
  const total = values.reduce((sum, value) => sum + value, 0);
  return isAverageMetric(field) ? total / values.length : total;
}

export function displayFieldLabel(field: InformationField) {
  return field.label ? `${field.label.charAt(0).toLocaleUpperCase("uz")}${field.label.slice(1)}` : field.code;
}

export function dimensionListLabel(dimension?: DrillDimension) {
  const key = normalized(dimension?.label ?? "");
  if (/hudud|viloyat|region/.test(key)) return "Hududlar";
  if (/tuman|district/.test(key)) return "Tumanlar";
  if (/tashkilot|korxona|organization/.test(key)) return "Tashkilotlar";
  if (/davlat|country|mamlakat/.test(key)) return "Davlatlar";
  return dimension?.label
    ? `${dimension.label.charAt(0).toLocaleUpperCase("uz")}${dimension.label.slice(1)}`
    : "Oldingi bosqich";
}

export function formatMetric(value: number, field?: InformationField) {
  if (!Number.isFinite(value)) return "—";
  if (field?.type === "currency") {
    if (field.unit && /mln/.test(normalized(field.unit))) return `${numberFormatter.format(value)} ${field.unit}`;
    if (Math.abs(value) >= 1_000_000_000) return `${numberFormatter.format(value / 1_000_000_000)} mlrd so‘m`;
    if (Math.abs(value) >= 1_000_000) return `${numberFormatter.format(value / 1_000_000)} mln so‘m`;
    return `${numberFormatter.format(value)} so‘m`;
  }
  const unit = field?.unit ? ` ${field.unit}` : field && isAverageMetric(field) ? "%" : "";
  return `${numberFormatter.format(value)}${unit}`;
}

export function formatCell(value: unknown, field?: InformationField) {
  if (value == null || value === "") return "—";
  if (field?.type === "boolean") return value ? "Ha" : "Yo‘q";
  if (field && ["number", "currency", "percentage"].includes(field.type))
    return formatMetric(numericValue(value), field);
  if (field && ["date", "datetime"].includes(field.type)) return formatDate(String(value));
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export function renderCell(value: unknown, field?: InformationField) {
  if (field?.type === "url" && value) {
    const href = String(value);
    if (/^https?:\/\//i.test(href))
      return (
        <a className="info-data-link" href={href} target="_blank" rel="noopener noreferrer">
          {tNow("Havolani ochish")}
        </a>
      );
  }
  return formatCell(value, field);
}

export function asWorkspaceRecord(record: InformationRecord): WorkspaceRecord {
  return {
    key: `record-${record.id}`,
    recordId: record.id,
    title: record.title,
    values: record.values,
    status: record.status,
    updatedAt: record.updatedAt,
    periodStart: record.periodStart,
    periodEnd: record.periodEnd,
    isDemo: record.isDemo,
    organization: record.organization.name,
    department: record.department.name,
  };
}

export function matchesPresentationTab(record: WorkspaceRecord, profile: string, tabField: string, value: string) {
  const explicit = String(record.values[tabField] ?? "").trim();
  if (explicit) return explicit === value;
  if (profile === "road_operations_funding") {
    const legacyType = normalized(String(record.values.ish_turi ?? ""));
    const isDisaster =
      /tabiiy|ofat/.test(legacyType) ||
      ["hodisa_turi", "hodisa_sanasi", "zarar_tavsifi", "zarar_bahosi", "tiklangan_hajm", "foto_va_dalolatnoma"].some(
        (code) => record.values[code] != null && record.values[code] !== "",
      );
    const isRepair =
      /tamir|ta'mir/.test(legacyType) ||
      ["tamir_turi", "pudratchi", "reja_mablagi", "fizik_ijro", "moliyaviy_ijro"].some(
        (code) => record.values[code] != null && record.values[code] !== "",
      );
    if (value === "Tabiiy ofatlarni bartaraf etish") return isDisaster;
    if (value === "Ta’mirlash") return !isDisaster && isRepair;
    if (value === "Saqlash") return !isDisaster && !isRepair;
    return false;
  }
  if (profile === "sports_youth_tabs") {
    if (value === "Sport musobaqalari") return Boolean(record.values.sport_musobaqasi);
    if (value === "Rahbar va yoshlar uchrashuvlari") return Boolean(record.values.yoshlar_uchrashuvi);
    if (value === "Iqtidorli yoshlar") return Boolean(record.values.iqtidorli_yosh);
    if (value === "Sport mashg‘ulotlari")
      return !record.values.sport_musobaqasi && !record.values.yoshlar_uchrashuvi && !record.values.iqtidorli_yosh;
  }
  return false;
}

export function drillDimensions(template: InformationTemplate, records: WorkspaceRecord[]): DrillDimension[] {
  const fields = template.fields;
  const used = new Set<string>();
  const key = normalized(`${template.code} ${template.name}`);
  const result: DrillDimension[] = [];
  const add = (field: InformationField | undefined, icon: DrillDimension["icon"], rowLabel?: string) => {
    if (!field || used.has(field.code)) return;
    used.add(field.code);
    result.push({ code: field.code, label: field.label, rowLabel: rowLabel ?? field.label, icon });
  };
  if (template.presentation?.drilldown?.length) {
    for (const code of template.presentation.drilldown) {
      const field = fields.find((item) => item.code === code);
      if (!field) continue;
      const fieldKey = fieldText(field);
      const icon: DrillDimension["icon"] = /davlat|country|mamlakat/.test(fieldKey)
        ? "country"
        : /hudud|viloyat|tuman|region|district/.test(fieldKey)
          ? "region"
          : /tashkilot|korxona|organization/.test(fieldKey)
            ? "organization"
            : "category";
      add(field, icon, /hudud|viloyat|region/.test(fieldKey) ? "Hudud nomi" : undefined);
    }
    return result.slice(0, 4);
  }
  const country = findField(fields, [/davlat|country|mamlakat/], used);
  const region = findField(fields, [/hudud|viloyat|region/], used);
  const district = findField(fields, [/tuman|district/], used);
  const organization = findField(fields, [/tashkilot|korxona|buyurtmachi|organization/], used);
  const department = findField(fields, [/boshqarma|bo'lim|bolim|department/], used);
  const road = findField(fields, [/(^| )yo'l( |$)|(^| )yol( |$)|road/], used);
  const category = findField(fields, [/turi|toifa|kategoriya|mavzu|yo'nalish|yonalish/], used);
  if (country && /xorij|foreign|meeting|uchrashuv|safar|trip/.test(key)) {
    add(country, "country", "Davlat nomi");
    add(organization ?? category, organization ? "organization" : "category");
  } else if (region) {
    add(region, "region", "Hudud nomi");
    if (district) add(district, "region", "Tuman nomi");
    else if (records.some((record) => record.values.__district))
      result.push({ code: "__district", label: "Tuman", rowLabel: "Tuman nomi", icon: "region" });
    else add(organization ?? road, organization ? "organization" : "category");
  } else if (organization) {
    add(organization, "organization", "Tashkilot nomi");
    add(department ?? category ?? road, department ? "organization" : "category");
  } else if (country) {
    add(country, "country", "Davlat nomi");
    add(category, "category");
  } else if (category) {
    add(category, "category");
  } else if (template.dimensions.includes("organization")) {
    result.push({ code: "__organization", label: "Tashkilot", rowLabel: "Tashkilot nomi", icon: "organization" });
  }
  return result.slice(0, 4);
}

export function metricFields(template: InformationTemplate) {
  if (template.presentation?.profile === "road_elements_matrix")
    return ROAD_ELEMENT_METRIC_CONFIG.map((item) => item.field);
  const configured = (template.presentation?.metricFields ?? [])
    .map((code) => template.fields.find((field) => field.code === code))
    .filter((field): field is InformationField => Boolean(field));
  if (configured.length)
    return configured.map((field) => ({
      ...field,
      aggregationFormula: template.presentation?.aggregation?.[field.code]?.formula,
    }));
  const numeric = template.fields.filter(
    (field) =>
      ["number", "currency", "percentage"].includes(field.type) ||
      (field.type === "text" && /foiz|ulush|daraja|ijro|bajarilish|tayyorlik/.test(fieldText(field))),
  );
  const scored = numeric.map((field, index) => {
    const key = fieldText(field);
    let score = 100 - index;
    if (/reja|quvvat|ajratilgan|shartnomaviy|jami/.test(key)) score += 70;
    if (/amalda|bajarilgan|o'zlasht|ozlasht|natija/.test(key)) score += 65;
    if (/foiz|ulush|daraja|ijro|bajarilish|tayyorlik/.test(key)) score += 58;
    return { field, score };
  });
  return scored
    .sort((left, right) => right.score - left.score)
    .map((item) => item.field)
    .slice(0, 3);
}

export function configuredPeriodValue(record: WorkspaceRecord, template: InformationTemplate) {
  const periodField = template.fields.find((field) => /^(davr|hisobot_davri|period)$/.test(field.code));
  const rawValue = periodField ? String(record.values[periodField.code] ?? "").trim() : "";
  return rawValue.match(/^\d{4}(?:-\d{2}(?:-\d{2})?)?/)?.[0] ?? "";
}

export function dimensionValue(record: WorkspaceRecord, dimension: DrillDimension) {
  if (dimension.code === "__organization") return record.organization || "Tashkilot ko‘rsatilmagan";
  if (dimension.code === "__district")
    return String(record.values.__district ?? record.values.tuman ?? record.values.district ?? "Tuman ko‘rsatilmagan");
  const value = record.values[dimension.code];
  return value == null || value === "" ? "Ko‘rsatilmagan" : String(value);
}

export function aggregateRows(
  records: WorkspaceRecord[],
  dimension: DrillDimension,
  metrics: InformationField[],
): GroupRow[] {
  const groups = new Map<string, WorkspaceRecord[]>();
  for (const record of records) {
    const value = dimensionValue(record, dimension);
    groups.set(value, [...(groups.get(value) ?? []), record]);
  }
  return [...groups.entries()]
    .map(([value, items]) => ({
      value,
      count: items.length,
      metrics: Object.fromEntries(metrics.map((field) => [field.code, aggregateMetric(items, field)])),
      records: items,
    }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value, "uz"));
}

export function oavSummary(records: WorkspaceRecord[]) {
  const dates = records
    .map((record) => String(record.values.elon_sanasi ?? ""))
    .filter(Boolean)
    .sort();
  return {
    materialCount: records.length,
    mediaCount: new Set(records.map((record) => String(record.values.oav_nomi ?? "")).filter(Boolean)).size,
    firstDate: dates[0] ?? "",
    lastDate: dates.at(-1) ?? "",
  };
}

export function filterCandidates(template: InformationTemplate, dimensions: DrillDimension[]) {
  const selected = new Set<string>();
  const result: InformationField[] = [];
  const add = (field?: InformationField) => {
    if (!field || selected.has(field.code)) return;
    if (template.presentation?.periodMode !== "none" && /^(davr|hisobot_davri|period)$/.test(field.code)) return;
    selected.add(field.code);
    result.push(field);
  };
  const key = normalized(`${template.code} ${template.name}`);
  const resolveConfigured = (code: string) => {
    const exact = template.fields.find((field) => field.code === code);
    if (exact) return exact;
    const alias =
      code === "region"
        ? /hudud|viloyat|region/
        : code === "organization"
          ? /tashkilot|korxona|organization/
          : code === "road"
            ? /yo'l|yol|road/
            : code === "country"
              ? /davlat|country|mamlakat/
              : code === "period"
                ? /davr|sana|period/
                : new RegExp(normalized(code).replace(/\s+/g, "|"));
    return findField(template.fields, [alias]);
  };
  const configuredFilters = template.presentation?.filters ?? [];
  configuredFilters.map(resolveConfigured).forEach(add);
  // Versioned thematic profiles are the source of truth. Do not append legacy
  // heuristic/select filters: they duplicate controls and can expose unrelated
  // fields on a carefully curated dashboard.
  if (configuredFilters.length) return result.slice(0, 6);

  if (/development programs|qurilish|rekonstruksiya/.test(key)) {
    add(findField(template.fields, [/dastur qaror|dastur|program/]));
    add(findField(template.fields, [/ish turi|ob'ekt turi|obekt turi/]));
    add(findField(template.fields, [/pudrat|pudratchi/]));
    add(findField(template.fields, [/amalga oshirish muddati|muddat/]));
  } else if (/road condition|yol holati|yo'l holati|koprik|ko'prik|bridge/.test(key)) {
    add(findField(template.fields, [/yol tasnifi|yo'l tasnifi|umumiy va ichki/]));
    add(findField(template.fields, [/qoplama turi/]));
    add(findField(template.fields, [/texnik toifa/]));
    add(findField(template.fields, [/texnik holat|holat bahosi|tamirtalab/]));
  } else if (/winter readiness|kuz qish/.test(key)) {
    add(findField(template.fields, [/tashkilot|korxona/]));
    add(findField(template.fields, [/taminlanganlik|ta'minlanganlik/]));
    add(findField(template.fields, [/tayyor texnika/]));
  } else if (
    /maintenance works|repair works|disaster recovery|saqlash ishlari|tamirlash ishlari|tabiiy ofat/.test(key)
  ) {
    add(findField(template.fields, [/ish yonalishi|ish yo'nalishi|ish turi/]));
    add(findField(template.fields, [/yol|yo'l/]));
    add(findField(template.fields, [/bajaruvchi|pudratchi/]));
    add(findField(template.fields, [/ajratilgan mablag|reja mablag/]));
  } else if (/road element|yol element|yo'l element/.test(key)) {
    add(findField(template.fields, [/element turi/]));
    add(findField(template.fields, [/holat/]));
  } else if (/service object|servis ob/.test(key)) {
    add(findField(template.fields, [/obekt turi|ob'ekt turi|turi/]));
    add(findField(template.fields, [/joriy bosqich|faoliyat holati|holat/]));
    add(findField(template.fields, [/yol|yo'l/]));
  } else if (/machinery|texnika/.test(key)) {
    add(findField(template.fields, [/turi|marka model/]));
    add(findField(template.fields, [/texnik holat/]));
    add(findField(template.fields, [/gps/]));
    add(findField(template.fields, [/tashkilot|korxona/]));
  } else if (/information systems|axborot tizim/.test(key)) {
    add(findField(template.fields, [/joriy bosqich|holat/]));
    add(findField(template.fields, [/ishlab chiquvchi/]));
    add(findField(template.fields, [/buyurtmachi/]));
    add(findField(template.fields, [/integrasiya|integratsiya/]));
  } else if (/normative technical|normativ texnik/.test(key)) {
    add(findField(template.fields, [/^turi$|hujjat turi/]));
    add(findField(template.fields, [/joriy bosqich|holat/]));
    add(findField(template.fields, [/ishlab chiquvchi/]));
    add(findField(template.fields, [/tasdiqlovchi organ/]));
  } else if (/foreign meetings|xorijiy uchrashuv/.test(key)) {
    add(findField(template.fields, [/davlat|country|mamlakat/]));
    add(findField(template.fields, [/uchrashuv turi|mavzu|yo'nalish|yonalish/]));
    add(findField(template.fields, [/tashkilot|delegatsiya|organization/]));
  } else if (/ppp|dxsh|ifi|xmi|investment|investits|istiqbolli loyiha/.test(key)) {
    add(findField(template.fields, [/joriy bosqich|loyiha holati|holat/]));
    add(findField(template.fields, [/xmi|xususiy sherik|investor|hamkor/]));
    add(findField(template.fields, [/moliyalashtirish|kredit grant/]));
    add(findField(template.fields, [/umumiy qiymat|taxminiy qiymat/]));
  } else if (/qarzdor|sof foyda|ish haqi|aktiv|asset|finance|economy/.test(key)) {
    add(findField(template.fields, [/soliq turi|aktiv turi|qarz yoshi/]));
    add(findField(template.fields, [/nizo holati|davo holati|holati/]));
    add(findField(template.fields, [/jami summa|sof foyda|ortacha ish haqi|qoldiq qiymat/]));
    add(findField(template.fields, [/kreditor|debitor|egalik huquqi/]));
  } else if (/xodim|employee|davomat|safar|trip/.test(key)) {
    add(findField(template.fields, [/boshqarma|bo'lim|bolim|department/]));
    add(findField(template.fields, [/lavozim|position/]));
    add(findField(template.fields, [/davlat|country|mamlakat|holat|status/]));
    add(findField(template.fields, [/jins|malumot|ma'lumot|bandlik/]));
  } else if (/sport|yoshlar|iqtidor/.test(key)) {
    add(findField(template.fields, [/malumot turi|ma'lumot turi|tadbir turi/]));
    add(findField(template.fields, [/tashkilotchi|tashkilot/]));
    add(findField(template.fields, [/iqtidor yonalishi|yo'nalish/]));
    add(findField(template.fields, [/til/]));
  } else {
    dimensions.slice(1).forEach((dimension) => add(template.fields.find((field) => field.code === dimension.code)));
  }
  template.fields
    .filter((field) => field.type === "select")
    .slice(0, 2)
    .forEach(add);
  return result.slice(0, 6);
}

export function orderedFieldsFor(template: InformationTemplate) {
  const preferred = template.presentation?.detailColumns ?? template.presentation?.tableColumns ?? [];
  const byCode = new Map(template.fields.map((field) => [field.code, field]));
  if (template.presentation?.profile && preferred.length) {
    return preferred.map((code) => byCode.get(code)).filter((field): field is InformationField => Boolean(field));
  }
  if (template.presentation?.drilldown?.length && preferred.length) {
    return [
      ...preferred.map((code) => byCode.get(code)).filter((field): field is InformationField => Boolean(field)),
      ...template.fields.filter((field) => !preferred.includes(field.code)),
    ];
  }
  const key = normalized(`${template.code} ${template.name}`);
  const semanticPatterns = /development programs|qurilish|rekonstruksiya/.test(key)
    ? [
        /pudratchi/,
        /yo'l km|yol km|road/,
        /ish turi/,
        /uzunlik/,
        /boshlanish tugash|muddat/,
        /^qiymat | qiymat$/,
        /reja amal/,
        /fizik moliyaviy ijro|bajarilish/,
        /moliyalashtirish/,
      ]
    : /foreign meetings|xorijiy uchrashuv/.test(key)
      ? [
          /sana/,
          /davlat|country/,
          /xorijiy tashkilot|tashkilot/,
          /delegatsiya/,
          /ishtirok/,
          /taklif/,
          /keyingi qadam/,
          /masul/,
          /holat|status/,
        ]
      : /ppp|dxsh|ifi|xmi|investment|investits/.test(key)
        ? [
            /davlat|hudud/,
            /investor|hamkor|tashkilot/,
            /qiymat|mablag/,
            /ozlasht|amalda/,
            /bosqich|holat/,
            /ijro|foiz/,
            /muddat|yakun/,
            /xavf|muammo/,
            /keyingi qadam/,
          ]
        : /employee|xodim|davomat|safar|trip/.test(key)
          ? [
              /lavozim/,
              /boshqarma|bo'lim|bolim/,
              /tashkilot|korxona/,
              /telefon/,
              /email|pochta/,
              /ishga qabul|boshlanish/,
              /davlat|country/,
              /holat|status/,
              /masul/,
            ]
          : /machinery|texnika/.test(key)
            ? [
                /turi|model/,
                /inventar|davlat raqami/,
                /hudud|viloyat/,
                /tashkilot|korxona/,
                /ishlab chiqarilgan yil/,
                /sozlik|holat/,
                /quvvat/,
                /gps/,
                /servis|tamir/,
              ]
            : [];
  const semantic: InformationField[] = [];
  const semanticCodes = new Set<string>();
  semanticPatterns.forEach((expression) => {
    const field = findField(template.fields, [expression], semanticCodes);
    if (field) {
      semanticCodes.add(field.code);
      semantic.push(field);
    }
  });
  return [
    ...semantic,
    ...preferred
      .map((code) => byCode.get(code))
      .filter((field): field is InformationField => field !== undefined && !semanticCodes.has(field.code)),
    ...template.fields.filter((field) => !preferred.includes(field.code) && !semanticCodes.has(field.code)),
  ];
}

export function optionsForField(field: InformationField, records: WorkspaceRecord[]) {
  const values = records
    .map((record) => record.values[field.code])
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value) => value != null && value !== "")
    .map(String);
  return [...new Set([...(field.options ?? []), ...values])].slice(0, 80);
}

export function isNumericFacet(field: InformationField) {
  return ["number", "currency", "percentage"].includes(field.type);
}

export function isDateFacet(field: InformationField) {
  return ["date", "datetime"].includes(field.type);
}

export function isSelectFacet(field: InformationField) {
  return ["select", "multiselect", "boolean", "region", "country", "organization", "road"].includes(field.type);
}

export function recordMatchesFacets(
  record: WorkspaceRecord,
  template: InformationTemplate,
  filters: Record<string, string>,
) {
  return Object.entries(filters).every(([rawCode, filterValue]) => {
    if (!filterValue) return true;
    const suffix = rawCode.endsWith("__min") ? "min" : rawCode.endsWith("__max") ? "max" : "value";
    const code = rawCode.replace(/__(?:min|max)$/, "");
    const field = template.fields.find((item) => item.code === code);
    if (!field) return true;
    const rawValue = record.values[code];
    if ((suffix === "min" || suffix === "max") && (rawValue == null || String(rawValue).trim() === "")) return false;
    if (suffix === "min")
      return isDateFacet(field) ? String(rawValue) >= filterValue : numericValue(rawValue) >= numericValue(filterValue);
    if (suffix === "max")
      return isDateFacet(field) ? String(rawValue) <= filterValue : numericValue(rawValue) <= numericValue(filterValue);
    if (field.type === "boolean") return Boolean(rawValue) === (filterValue === "Ha");
    const values = Array.isArray(rawValue) ? rawValue.map(String) : [String(rawValue ?? "")];
    if (isSelectFacet(field)) return values.includes(filterValue);
    return values.some((value) => normalized(value).includes(normalized(filterValue)));
  });
}

export function safeFileName(value: string) {
  return normalized(value).replace(/\s+/g, "-").slice(0, 70) || "malumot";
}
