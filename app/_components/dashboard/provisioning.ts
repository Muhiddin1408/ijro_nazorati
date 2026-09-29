import { formatDateTime, localDateKey } from "../../ui-helpers";
import { readJson } from "../../dashboard-kit";
import { type ProvisioningResult } from "../../admin-pages";
import { loadXlsx } from "../../excel-client";

type AccessProfile = {
  code: string;
  name: string;
  organizationType: string;
  viewScope: string;
  informationScope: string;
  canEnter: boolean;
  canSubmit: boolean;
  canVerify: boolean;
  canApprove: boolean;
  canViewAll: boolean;
};
type AccessProfilesPayload = {
  profiles: AccessProfile[];
  assignments: Array<Record<string, unknown>>;
};
type ProvisionedAccount = {
  accountKind: "employee" | "vacant_position";
  employeeId: number | null;
  staffPositionId: number | null;
  slotNumber: number | null;
  fullName: string;
  organization: string;
  department: string;
  position: string;
  username: string;
  temporaryPassword: string;
  roleCode: string;
  roleName: string;
  accessProfileCode: string;
  accessProfileName: string;
  canLogin: boolean;
  mustChangePassword: true;
};
type ProvisioningResponse = {
  generatedAt: string;
  oneTimeDownload: true;
  accounts: ProvisionedAccount[];
  skipped: Array<{ targetId: number; reason: string }>;
  nextCursor: number | null;
};
type ProvisioningRequest = {
  kind: "employees" | "vacancies";
  employeeIds?: number[];
  staffPositionIds?: number[];
  organizationId?: number;
  includeDescendants?: boolean;
  reissue?: boolean;
};

export async function requestProvisioning(
  body: ProvisioningRequest,
  options: {
    onProgress?: (created: number, skipped: number) => void;
    shouldContinue?: () => boolean;
  } = {},
) {
  // Fetch the manifest before rotating or creating any credential. A partial
  // workbook without its role/capability sheet is not a safe hand-off.
  const { profiles } = await readJson<AccessProfilesPayload>(
    await fetch("/api/admin/access-profiles", { cache: "no-store" }),
  );
  const accounts: ProvisionedAccount[] = [];
  const skipped: ProvisioningResponse["skipped"] = [];
  const targetIds = body.kind === "employees" ? body.employeeIds : body.staffPositionIds;
  const batches = targetIds?.length
    ? Array.from({ length: Math.ceil(targetIds.length / 100) }, (_, index) =>
        targetIds.slice(index * 100, index * 100 + 100),
      )
    : [undefined];
  let generatedAt = new Date().toISOString();
  let cancelled = false;
  let failure = "";
  for (const batch of batches) {
    let cursor: number | null = 0;
    do {
      let result: ProvisioningResponse;
      try {
        result = await readJson<ProvisioningResponse>(
          await fetch("/api/admin/accounts/provision", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({
              ...body,
              employeeIds: body.kind === "employees" ? batch : undefined,
              staffPositionIds: body.kind === "vacancies" ? batch : undefined,
              cursor: cursor || undefined,
              limit: 100,
            }),
          }),
        );
      } catch (error) {
        if (!accounts.length) throw error;
        failure = error instanceof Error ? error.message : "Keyingi kirishlar yaratilmay qoldi";
        cancelled = true;
        cursor = null;
        break;
      }
      generatedAt = result.generatedAt;
      accounts.push(...result.accounts);
      skipped.push(...result.skipped);
      options.onProgress?.(accounts.length, skipped.length);
      cursor = result.nextCursor;
      if (options.shouldContinue && !options.shouldContinue()) {
        cancelled = true;
        cursor = null;
      }
    } while (cursor);
    if (cancelled) break;
  }
  return { accounts, skipped, profiles, generatedAt, cancelled, failure };
}

export async function downloadProvisioningWorkbook({ accounts, skipped, profiles, generatedAt }: ProvisioningResult) {
  if (!accounts.length) throw new Error(skipped[0]?.reason || "Yangi kirish ma’lumoti yaratilmadi");
  const XLSX = await loadXlsx();
  const accountRows = [
    ["ICHKI HISOBOTLARNI BOSHQARISH TIZIMI · KIRISH MA’LUMOTLARI"],
    ["MAXFIY HUJJAT", "Parollar faqat shu yuklashda ko‘rsatiladi. Faylni himoyalangan tartibda topshiring."],
    [
      "Yaratilgan vaqt",
      formatDateTime(generatedAt),
      "Yaratildi",
      accounts.length,
      "O‘tkazib yuborildi",
      skipped.length,
    ],
    [],
    [
      "№",
      "Hisob turi",
      "F.I.Sh. / rezerv shtat",
      "Tashkilot",
      "Bo‘lim",
      "Lavozim",
      "Login",
      "Vaqtinchalik parol",
      "Rol",
      "Kirish profili",
      "Kirish holati",
      "Birinchi kirish",
    ],
    ...accounts.map((account, index) => [
      index + 1,
      account.accountKind === "employee"
        ? "Xodim"
        : `Rezerv shtat${account.slotNumber ? ` · ${account.slotNumber}-o‘rin` : ""}`,
      account.fullName,
      account.organization,
      account.department,
      account.position,
      account.username,
      account.temporaryPassword,
      account.roleName,
      account.accessProfileName,
      account.canLogin ? "Faol" : "Xodim biriktirilgach faollashadi",
      account.mustChangePassword ? "Parolni almashtiradi" : "Talab etilmaydi",
    ]),
  ];
  const accountSheet = XLSX.utils.aoa_to_sheet(accountRows);
  accountSheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
    { s: { r: 1, c: 1 }, e: { r: 1, c: 11 } },
  ];
  accountSheet["!freeze"] = { xSplit: 0, ySplit: 5 };
  accountSheet["!autofilter"] = { ref: `A5:L${accounts.length + 5}` };
  accountSheet["!cols"] = [
    { wch: 6 },
    { wch: 17 },
    { wch: 31 },
    { wch: 38 },
    { wch: 31 },
    { wch: 32 },
    { wch: 22 },
    { wch: 23 },
    { wch: 22 },
    { wch: 28 },
    { wch: 27 },
    { wch: 22 },
  ];
  accountSheet["!rows"] = [{ hpt: 31 }, { hpt: 27 }, { hpt: 21 }, {}, { hpt: 32 }];
  if (accountSheet.A1)
    accountSheet.A1.s = {
      font: { bold: true, sz: 16, color: { rgb: "163B6D" } },
      fill: { fgColor: { rgb: "EAF1FB" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  if (accountSheet.A2)
    accountSheet.A2.s = {
      font: { bold: true, color: { rgb: "991B1B" } },
      fill: { fgColor: { rgb: "FEECEC" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  if (accountSheet.B2)
    accountSheet.B2.s = {
      font: { bold: true, color: { rgb: "7F1D1D" } },
      fill: { fgColor: { rgb: "FEECEC" } },
      alignment: { wrapText: true, vertical: "center" },
    };
  for (let column = 0; column < 12; column += 1) {
    const header = accountSheet[XLSX.utils.encode_cell({ r: 4, c: column })];
    if (header)
      header.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "174A83" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
      };
  }
  for (let row = 5; row < accounts.length + 5; row += 1)
    for (let column = 0; column < 12; column += 1) {
      const cell = accountSheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (cell)
        cell.s = {
          fill: { fgColor: { rgb: row % 2 ? "F7FAFD" : "FFFFFF" } },
          alignment: { vertical: "center", wrapText: true },
          border: { bottom: { style: "hair", color: { rgb: "DCE4ED" } } },
          ...(column === 6 || column === 7
            ? {
                font: { bold: true, color: { rgb: column === 7 ? "8B1E2D" : "164E87" } },
                fill: { fgColor: { rgb: column === 7 ? "FFF1F2" : "EEF5FC" } },
              }
            : {}),
        };
    }

  const capabilityRows = [
    ["ROLLAR VA MA’LUMOTLAR OQIMI"],
    ["Ushbu jadval tizimdagi faol kirish profillarini ko‘rsatadi."],
    [],
    [
      "№",
      "Kirish profili",
      "Tashkilot turi",
      "Ko‘rish doirasi",
      "Ma’lumot doirasi",
      "Kiritadi",
      "Yuboradi",
      "Tekshiradi",
      "Tasdiqlaydi",
      "Barchasini ko‘radi",
    ],
    ...profiles.map((profile, index) => [
      index + 1,
      profile.name,
      organizationTypeLabel(profile.organizationType),
      scopeLabel(profile.viewScope),
      profile.informationScope,
      profile.canEnter ? "Ha" : "Yo‘q",
      profile.canSubmit ? "Ha" : "Yo‘q",
      profile.canVerify ? "Ha" : "Yo‘q",
      profile.canApprove ? "Ha" : "Yo‘q",
      profile.canViewAll ? "Ha" : "Yo‘q",
    ]),
  ];
  const capabilitySheet = XLSX.utils.aoa_to_sheet(capabilityRows);
  capabilitySheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
  ];
  capabilitySheet["!freeze"] = { xSplit: 0, ySplit: 4 };
  capabilitySheet["!autofilter"] = { ref: `A4:J${Math.max(5, profiles.length + 4)}` };
  capabilitySheet["!cols"] = [
    { wch: 6 },
    { wch: 29 },
    { wch: 28 },
    { wch: 22 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 19 },
  ];
  if (capabilitySheet.A1)
    capabilitySheet.A1.s = {
      font: { bold: true, sz: 15, color: { rgb: "163B6D" } },
      fill: { fgColor: { rgb: "EAF1FB" } },
      alignment: { horizontal: "center" },
    };
  for (let column = 0; column < 10; column += 1) {
    const header = capabilitySheet[XLSX.utils.encode_cell({ r: 3, c: column })];
    if (header)
      header.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "174A83" } },
        alignment: { horizontal: "center", wrapText: true },
      };
  }

  const workflowSheet = XLSX.utils.aoa_to_sheet([
    ["MA’LUMOTNI KIRITISH VA TASDIQLASH YO‘LI"],
    ["Bosqich", "Mas’ul", "Asosiy amal", "Natija"],
    [
      1,
      "Tuman korxonasi mas’ul xodimi",
      "Ma’lumotni kiritadi va yuboradi",
      "Hududiy boshqarmaning tegishli bo‘limiga o‘tadi",
    ],
    [
      2,
      "Tuman yoki tizim tashkiloti rahbari",
      "Tashkilot ma’lumotini tekshiradi va tasdiqlaydi",
      "Hududiy boshqarmaning tegishli bo‘limiga o‘tadi",
    ],
    [
      3,
      "Hududiy boshqarma bo‘limi yoki sho‘basi",
      "Yo‘nalish bo‘yicha tekshiradi va tasdiqlaydi",
      "Xato bo‘lsa qaytaradi, to‘g‘ri bo‘lsa Qo‘mitaga uzatadi",
    ],
    [
      4,
      "Qo‘mitaning mas’ul boshqarmasi",
      "O‘z yo‘nalishini yakuniy tasdiqlaydi",
      "Rahbariyat uchun yakuniy ko‘rinishga keladi",
    ],
    [
      5,
      "Qo‘mita rahbariyati",
      "Barcha tasdiqlangan ma’lumotlarni ko‘radi va nazorat qiladi",
      "Respublika, hudud va tashkilot kesimida kuzatadi",
    ],
    [],
    [
      "Markaziy apparatning o‘zi kiritadigan ko‘rsatkichlar",
      "Ilmiy ishlar, axborot tizimlari, loyihaviy yechimlar va faqat markazda shakllanadigan boshqa ma’lumotlar tegishli boshqarma tomonidan kiritilib tasdiqlanadi.",
    ],
  ]);
  workflowSheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 8, c: 1 }, e: { r: 8, c: 3 } },
  ];
  workflowSheet["!cols"] = [{ wch: 12 }, { wch: 38 }, { wch: 45 }, { wch: 58 }];
  workflowSheet["!rows"] = [
    { hpt: 29 },
    { hpt: 28 },
    { hpt: 40 },
    { hpt: 40 },
    { hpt: 40 },
    { hpt: 40 },
    { hpt: 40 },
    {},
    { hpt: 52 },
  ];
  if (workflowSheet.A1)
    workflowSheet.A1.s = {
      font: { bold: true, sz: 15, color: { rgb: "163B6D" } },
      fill: { fgColor: { rgb: "EAF1FB" } },
      alignment: { horizontal: "center" },
    };
  for (let column = 0; column < 4; column += 1) {
    const header = workflowSheet[XLSX.utils.encode_cell({ r: 1, c: column })];
    if (header)
      header.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "174A83" } },
        alignment: { horizontal: "center", wrapText: true },
      };
  }
  for (let row = 2; row <= 8; row += 1)
    for (let column = 0; column < 4; column += 1) {
      const cell = workflowSheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (cell)
        cell.s = {
          alignment: { vertical: "center", wrapText: true },
          fill: { fgColor: { rgb: row % 2 ? "F7FAFD" : "FFFFFF" } },
          border: { bottom: { style: "hair", color: { rgb: "DCE4ED" } } },
        };
    }
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, accountSheet, "Login va parollar");
  XLSX.utils.book_append_sheet(workbook, capabilitySheet, "Rollar va vakolatlar");
  XLSX.utils.book_append_sheet(workbook, workflowSheet, "Tasdiqlash yo‘li");
  XLSX.writeFile(workbook, `maxfiy-kirishlar-${localDateKey(generatedAt)}.xlsx`, { compression: true });
}

function scopeLabel(scope: string) {
  return (
    (
      {
        all: "Barchasi",
        subtree: "Quyi tuzilma",
        organization: "O‘z tashkiloti",
        department: "O‘z bo‘limi",
        own: "Faqat o‘zi",
        none: "Yo‘q",
      } as Record<string, string>
    )[scope] ?? scope
  );
}

function organizationTypeLabel(type: string) {
  return (
    (
      {
        committee: "Qo‘mita",
        central: "Qo‘mita markaziy apparati",
        territorial: "Hududiy bosh boshqarma",
        district: "Tuman tashkiloti",
        direct_subordinate: "Qo‘mitaga to‘g‘ridan-to‘g‘ri bo‘ysunuvchi",
        all: "Barcha tashkilotlar",
      } as Record<string, string>
    )[type] ?? type
  );
}
