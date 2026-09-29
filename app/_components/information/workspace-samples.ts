import type { InformationField, InformationTemplate } from "../../information-center";
import type { WorkspaceRecord } from "./workspace-types";
import { normalized, fieldText, findField, numericValue } from "./workspace-model";

const REGIONS = [
  { name: "Qoraqalpog‘iston Respublikasi", districts: ["Qo‘ng‘irot tumani", "Beruniy tumani"] },
  { name: "Toshkent viloyati", districts: ["Ohangaron tumani", "Bo‘stonliq tumani"] },
  { name: "Samarqand viloyati", districts: ["Samarqand tumani", "Kattaqo‘rg‘on tumani"] },
  { name: "Farg‘ona viloyati", districts: ["Quva tumani", "Rishton tumani"] },
];

const COUNTRIES = ["Germaniya", "Turkiya", "Xitoy", "Janubiy Koreya"];
const RESPONSIBLES = ["A. Karimov", "D. Rahimov", "M. Xolmatov", "S. Ergashev", "N. Aliyeva", "B. Qodirov"];
const ROAD_NAMES = [
  "A-380 G‘uzor–Buxoro–Nukus–Beyneu",
  "A-373 Toshkent–O‘sh",
  "M-37 Samarqand–Buxoro–Turkmanboshi",
  "4R105 Dushanbe–Tursunzoda–O‘zbekiston chegarasi",
];
const DIRECT_ORGANIZATIONS = [
  "Avtoyo‘linvest agentligi",
  "Avtoyo‘lqurilish kompaniyasi",
  "Avtomobil yo‘llari ilmiy-tadqiqot instituti",
];

export function recordNoun(template: InformationTemplate) {
  const key = normalized(`${template.code} ${template.name}`);
  if (/murojaat|appeal|call markaz/.test(key)) return "Murojaatlar";
  if (/uchrashuv|meeting/.test(key)) return "Uchrashuvlar";
  if (/xodim|employee|davomat|safar|training/.test(key)) return "Xodimlar";
  if (/texnika|machinery/.test(key)) return "Texnikalar";
  if (/hujjat|document|legal/.test(key)) return "Hujjatlar";
  if (/hodisa|accident/.test(key)) return "Hodisalar";
  if (/koprik|ko'prik|bridge/.test(key)) return "Ko‘priklar";
  if (/yol element|yo'l element|road element/.test(key)) return "Elementlar";
  if (/yol holati|yo'l holati|road condition/.test(key)) return "Yo‘llar";
  if (/axborot tizim|information system/.test(key)) return "Axborot tizimlari";
  if (/qarzdor|debt|profit|salary/.test(key)) return "Tashkilotlar";
  if (/press|oav|media/.test(key)) return "Materiallar";
  if (/loyiha|project|program|qurilish|rekonstruksiya|repair|maintenance/.test(key)) return "Obyektlar";
  if (/servis|asset|aktiv|plant|zavod|karer|laborator/.test(key)) return "Obyektlar";
  return "Yozuvlar";
}

function sampleTitles(template: InformationTemplate) {
  const key = normalized(`${template.code} ${template.name}`);
  if (/development programs|qurilish|rekonstruksiya/.test(key))
    return [
      "A-380 avtomobil yo‘lining 698–753 km qismini rekonstruksiya qilish",
      "4R105 avtomobil yo‘lining 5–70 km qismini ta’mirlash",
      "A-373 avtomobil yo‘lining 102–118 km qismini rekonstruksiya qilish",
      "M-37 avtomobil yo‘lining 310–324 km qismini ta’mirlash",
      "4R100 avtomobil yo‘lining 128–174 km qismini rekonstruksiya qilish",
      "Hududiy ko‘priklarni tiklash dasturi — 08-obyekt",
    ];
  if (/foreign meetings|xorijiy uchrashuv/.test(key))
    return [
      "Toll Collect vakillari bilan uchrashuv",
      "Autostrade per l’Italia bilan muzokara",
      "Viapass ekspertlari bilan uchrashuv",
      "Koreya yo‘l korporatsiyasi delegatsiyasi",
      "JICA ekspertlari bilan texnik uchrashuv",
      "AIIB missiyasi bilan loyiha muhokamasi",
    ];
  if (/ppp|dxsh/.test(key))
    return [
      "Toshkent–Andijon pullik avtomobil yo‘li",
      "Toshkent–Samarqand pullik avtomobil yo‘li",
      "Toshkent halqa yo‘li servis hududi",
      "Qamchiq tunnelini ekspluatatsiya qilish loyihasi",
      "Yo‘l bo‘yi servis majmuasi",
      "BRT bekatlarini DXSh asosida boshqarish",
    ];
  if (/ifi|xmi|investment|investits/.test(key))
    return [
      "A-380 yo‘lini rekonstruksiya qilish loyihasi",
      "Hududiy yo‘llarni rivojlantirish loyihasi",
      "Ko‘priklar barqarorligi dasturi",
      "Yashil yo‘l infratuzilmasi loyihasi",
      "Shahar transport koridori loyihasi",
      "Yo‘l aktivlarini boshqarish loyihasi",
    ];
  if (/employee registry|xodimlar/.test(key))
    return [
      "Abdullayev Jasur Rustamovich",
      "Karimov Aziz Anvarovich",
      "Rahimova Dilnoza Sobirovna",
      "Xolmatov Murod Ilhomovich",
      "Ergashev Sardor Baxtiyorovich",
      "Aliyeva Nilufar Akmalovna",
    ];
  if (/foreign business trips|xorijiy xizmat/.test(key))
    return [
      "Germaniyaga xizmat safari",
      "Turkiyaga xizmat safari",
      "Xitoyga xizmat safari",
      "Janubiy Koreyaga xizmat safari",
      "Italiyaga xizmat safari",
      "Belgiyaga xizmat safari",
    ];
  if (/accounts payable|kreditor/.test(key))
    return [
      "Qurilish materiallari bo‘yicha kreditor qarz",
      "Yoqilg‘i yetkazib berish bo‘yicha qarz",
      "Lizing to‘lovi bo‘yicha qarz",
      "Elektr energiyasi bo‘yicha qarz",
      "Subpudrat ishlari bo‘yicha qarz",
      "Ehtiyot qismlar bo‘yicha qarz",
    ];
  if (/accounts receivable|debitor/.test(key))
    return [
      "Bajarilgan ishlar bo‘yicha debitor qarz",
      "Ijara to‘lovi bo‘yicha qarz",
      "Material yetkazib berish bo‘yicha qarz",
      "Xizmat ko‘rsatish bo‘yicha qarz",
      "Ichki hisob-kitob qarzdorligi",
      "Da’vo ishlari yuritilayotgan qarz",
    ];
  if (/machinery|texnika/.test(key))
    return [
      "Avtogreyder №041",
      "Asfalt yotqizgich №118",
      "Avtosamosval №207",
      "Yo‘l frezasi №015",
      "Katok №092",
      "Qor tozalash texnikasi №033",
    ];
  if (/service object|servis/.test(key))
    return [
      "M-37 yo‘lidagi ko‘p tarmoqli servis majmuasi",
      "A-373 yo‘lidagi AYoQSh va dam olish maskani",
      "A-380 yo‘lidagi Service Area",
      "4R105 yo‘lidagi ovqatlanish shoxobchasi",
      "Toshkent halqa yo‘lidagi zaryadlash stansiyasi",
      "Samarqand kirish yo‘lidagi logistika punkti",
    ];
  if (/press tour/.test(key))
    return [
      "A-380 qurilish obyektiga press-tur",
      "Qamchiq dovonidagi qishki tayyorgarlik press-turi",
      "Yo‘l muhandislari markaziga press-tur",
      "Yangi ko‘prik ochilishiga press-tur",
      "Asfalt zavodiga press-tur",
      "Toshkent halqa yo‘liga press-tur",
    ];
  if (/media coverage|oav/.test(key))
    return [
      "Yo‘l qurilishi bo‘yicha telelavha",
      "Qishki saqlash ishlari bo‘yicha reportaj",
      "Pullik yo‘l loyihasi bo‘yicha maqola",
      "Ko‘prik ta’miri bo‘yicha axborot",
      "Shaffof yo‘l platformasi bo‘yicha lavha",
      "Yo‘l xavfsizligi bo‘yicha intervyu",
    ];
  if (/road accident|hodisa/.test(key))
    return [
      "A-373 yo‘lining 108-kmidagi YTH",
      "M-37 yo‘lining 318-kmidagi YTH",
      "4R105 yo‘lining 22-kmidagi YTH",
      "A-380 yo‘lining 712-kmidagi YTH",
      "Tuman ichki yo‘lidagi YTH",
      "Toshkent halqa yo‘lidagi YTH",
    ];
  if (/legal|normativ huquqiy/.test(key))
    return [
      "Avtomobil yo‘llari to‘g‘risidagi qonun loyihasi",
      "Pullik yo‘llar nizomi",
      "Yo‘l aktivlari hisobi bo‘yicha qaror",
      "Og‘irlik-gabarit nazorati tartibi",
      "Yo‘l bo‘yi servis obyektlari nizomi",
      "Raqamli yo‘l pasporti reglamenti",
    ];
  return Array.from({ length: 6 }, (_, index) => `${template.name} — ${String(index + 1).padStart(2, "0")}`);
}

function sampleFieldValue(field: InformationField, index: number, template: InformationTemplate) {
  const key = fieldText(field);
  const templateKey = normalized(`${template.code} ${template.name}`);
  const region = REGIONS[index % REGIONS.length];
  const district = region.districts[index % region.districts.length];
  const usesOrganizationHierarchy =
    /finance|economy|qarzdor|foyda|ish haqi|asset|aktiv|machinery|texnika|employee registry|xodimlar/.test(templateKey);
  const isDirectOrganization = usesOrganizationHierarchy && index === 5;
  const organization = isDirectOrganization
    ? DIRECT_ORGANIZATIONS[index % DIRECT_ORGANIZATIONS.length]
    : `${region.name} avtomobil yo‘llari bosh boshqarmasi`;
  if (/hudud|viloyat|region/.test(key))
    return isDirectOrganization ? "Qo‘mitaga to‘g‘ridan-to‘g‘ri bo‘ysunuvchi tashkilotlar" : region.name;
  if (/tuman|district/.test(key)) return isDirectOrganization ? "—" : district;
  if (/davlat|country|mamlakat/.test(key)) return COUNTRIES[index % COUNTRIES.length];
  if (/foreign meetings|xorijiy uchrashuv/.test(templateKey) && /kompaniya|tashkilot/.test(key)) {
    if (/turi|toifa/.test(key))
      return ["Xususiy kompaniya", "Xalqaro moliya instituti", "Davlat tashkiloti"][index % 3];
    return [
      "Toll Collect GmbH",
      "Autostrade per l’Italia",
      "Korea Expressway Corporation",
      "JICA",
      "AIIB",
      "PowerChina",
    ][index % 6];
  }
  if (/foreign meetings|xorijiy uchrashuv/.test(templateKey) && /muhokama|mavzu|maqsad/.test(key))
    return [
      "Pullik yo‘l va tolling texnologiyasi",
      "Yo‘l aktivlarini raqamli boshqarish",
      "Loyiha moliyalashtirish modeli",
      "Ko‘priklar diagnostikasi",
    ][index % 4];
  if (/tashkilot|korxona|buyurtmachi|organization/.test(key)) return organization;
  if (/pudratchi/.test(key))
    return [
      "Qoraqalpoq yo‘l qurilish MChJ",
      "Road Construction Group",
      "Samarkand Yo‘l Qurilish",
      "Farg‘ona Yo‘l Servis",
    ][index % 4];
  if (/loyihachi/.test(key)) return ["Yo‘l loyiha byurosi", "Boshtransloyiha", "Infra Project Consulting"][index % 3];
  if (/texnik nazorat/.test(key)) return ["Texnik nazorat markazi", "Yo‘l ekspertiza markazi"][index % 2];
  if (/moliyalashtirish/.test(key))
    return ["Respublika budjeti", "Xalqaro moliya instituti", "Mahalliy budjet"][index % 3];
  if (/boshqarma|bo'lim|bolim|department/.test(key))
    return template.name.includes("Xodim") ? "Sohani raqamlashtirish boshqarmasi" : "Markaziy apparat";
  if (/yo'l|yol|road/.test(key) && !/yo'llan|yollan/.test(key)) return ROAD_NAMES[index % ROAD_NAMES.length];
  if (/dastur|program/.test(key))
    return ["Respublika investitsiya dasturi", "Hududiy infratuzilma dasturi", "Xalqaro moliya instituti dasturi"][
      index % 3
    ];
  if (/ish turi|ob'ekt turi|obekt turi/.test(key))
    return ["Rekonstruksiya", "Yangi qurilish", "Kapital ta’mirlash"][index % 3];
  if (/qurilish/.test(key)) return index % 3 === 1 ? "Yangi qurilish" : "—";
  if (/rekonstruksiya/.test(key)) return index % 3 === 1 ? "—" : "Rekonstruksiya";
  if (/mas'ul|masul|ijrochi|rahbar|xodim|operator|tarozibon/.test(key))
    return RESPONSIBLES[index % RESPONSIBLES.length];
  if (/telefon/.test(key)) return `+998 90 12${index} 45 6${index}`;
  if (/email|pochta/.test(key)) return `xodim${index + 1}@uzavtoyul.uz`;
  if (/sana vaqt/.test(key) || field.type === "datetime")
    return `2026-0${(index % 8) + 1}-${String(10 + index).padStart(2, "0")}T10:00`;
  if (/sana|muddat|date/.test(key) || field.type === "date")
    return `2026-0${(index % 8) + 1}-${String(10 + index).padStart(2, "0")}`;
  if (/fizik moliyaviy ijro/.test(key)) return `${62 + index * 5}% / ${55 + index * 5}%`;
  if (/holat|status|bosqich/.test(key))
    return ["Jarayonda", "Yakunlangan", "Rejalashtirilgan", "E’tibor talab qiladi"][index % 4];
  if (/turi|toifa|kategoriya|mavzu/.test(key) && field.options?.length)
    return field.options[index % field.options.length];
  if (/reja|planned|shartnomaviy/.test(key) && ["number", "currency", "percentage"].includes(field.type))
    return field.type === "currency"
      ? 66_400_000_000 + index * 4_800_000_000
      : field.type === "percentage"
        ? 100
        : 15 + index * 3;
  if (/amalda|bajarilgan|fact|o'zlasht|ozlasht/.test(key) && ["number", "currency", "percentage"].includes(field.type))
    return field.type === "currency"
      ? 42_800_000_000 + index * 3_300_000_000
      : field.type === "percentage"
        ? 62 + index * 5
        : 9 + index * 2;
  if (/foiz|ulush|daraja|progress/.test(key) || field.type === "percentage") return 62 + index * 5;
  if (field.type === "currency") return 18_500_000_000 + index * 2_750_000_000;
  if (field.type === "number") return 8 + index * 4;
  if (field.type === "boolean") return index % 2 === 0;
  if (field.type === "select")
    return (
      field.options?.[index % Math.max(1, field.options.length)] ??
      ["Jarayonda", "Yakunlangan", "Rejalashtirilgan"][index % 3]
    );
  if (field.type === "multiselect") return field.options?.slice(0, 2) ?? ["Asosiy", "Qo‘shimcha"];
  if (field.type === "url") return "https://uzavtoyul.uz";
  if (field.type === "file") return `tasdiqlovchi-hujjat-${index + 1}.pdf`;
  if (field.type === "geo") return `${41.31 + index / 100}, ${69.24 + index / 100}`;
  if (/taklif/.test(key)) return "Texnik yechim va moliyalashtirish modelini birgalikda ishlab chiqish";
  if (/keyingi qadam/.test(key)) return "Mas’ullarni belgilash va yo‘l xaritasini tasdiqlash";
  if (/maqsad|mazmun|natija|xulosa|chora/.test(key) || field.type === "textarea")
    return "Masala o‘rganildi, zarur choralar va keyingi nazorat bosqichi belgilandi.";
  return `${field.label} bo‘yicha ${index + 1}-namuna`;
}

export type SourceSamples = Record<
  string,
  {
    records?: Array<{ title: string; values: Record<string, unknown> }>;
    metadata?: { totals?: { report_date?: string } };
  }
>;

// Source workbook samples (~65 KB) are demo-only; fetch them on first demo view
// instead of shipping them in the information center bundle.
export let sourceSamplesCache: SourceSamples | null = null;
let sourceSamplesLoading: Promise<SourceSamples> | null = null;
export function loadSourceSamples(): Promise<SourceSamples> {
  sourceSamplesLoading ??= import("../../../data/information-source-samples.json").then(
    (module) => {
      sourceSamplesCache = module.default as unknown as SourceSamples;
      return sourceSamplesCache;
    },
    (error) => {
      sourceSamplesLoading = null;
      throw error;
    },
  );
  return sourceSamplesLoading;
}

export function makeSampleRecords(template: InformationTemplate, sourceSamples: SourceSamples): WorkspaceRecord[] {
  const exactSource = (sourceSamples as SourceSamples)[template.code];
  if (exactSource?.records?.length) {
    return exactSource.records.map((sourceRecord, index) => {
      const values = { ...sourceRecord.values };
      if (template.presentation?.profile === "call_center_regional" && numericValue(values.ulushi) <= 1)
        values.ulushi = numericValue(values.ulushi) * 100;
      const sourceDate =
        template.presentation?.profile === "oav_region_detail"
          ? String(values.elon_sanasi ?? "")
          : template.presentation?.profile === "call_center_regional"
            ? String(exactSource.metadata?.totals?.report_date ?? "")
            : "";
      const annualPeriod = template.presentation?.profile?.startsWith("appeals") ? "2025" : "";
      return {
        key: `source-sample-${template.id}-${index}`,
        recordId: null,
        title: sourceRecord.title,
        values,
        status: "published",
        updatedAt: String(values.elon_sanasi ?? "2026-08-08T10:00:00Z"),
        periodStart: sourceDate || (annualPeriod ? `${annualPeriod}-01-01` : null),
        periodEnd: sourceDate || (annualPeriod ? `${annualPeriod}-12-31` : null),
        isDemo: true,
        organization: String(values.hudud ?? "Avtomobil yo‘llari qo‘mitasi"),
        department: template.name,
      };
    });
  }
  const titles = sampleTitles(template);
  const templateKey = normalized(`${template.code} ${template.name}`);
  return titles.map((title, index) => {
    const region = REGIONS[index % REGIONS.length];
    const values = Object.fromEntries(
      template.fields.map((field) => [field.code, sampleFieldValue(field, index, template)]),
    );
    const titleField = findField(template.fields, [/ob.?ekt|^nomi$|^nomi |loyiha nomi|hujjat nomi|uchrashuv nomi/]);
    if (titleField) values[titleField.code] = title;
    if (/development programs|qurilish|rekonstruksiya/.test(templateKey)) {
      values.__district = region.districts[index % region.districts.length];
    }
    return {
      key: `sample-${template.id}-${index}`,
      recordId: null,
      title,
      values,
      status: index % 4 === 1 ? "published" : index % 4 === 2 ? "submitted" : "draft",
      updatedAt: `2026-08-0${(index % 5) + 1}T10:00:00Z`,
      periodStart: "2026-01-01",
      periodEnd: "2026-12-31",
      isDemo: true,
      organization: `${region.name} avtomobil yo‘llari bosh boshqarmasi`,
      department: template.name,
    };
  });
}
