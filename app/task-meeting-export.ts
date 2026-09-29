import { formatTime, localDateKey, type Alphabet } from "./ui-helpers";
import { tNow, translate, transliterateData, type TranslateParams } from "../lib/i18n";
import type {
  ClientAssignment,
  ClientAttachment,
  ClientAudienceTarget,
  ClientMeeting,
  ClientTask,
} from "../lib/shared/types";
import { loadXlsx, type XlsxModule } from "./excel-client";

// Export reads only the displayed columns of the shared payload shapes.
type Task = Pick<
  ClientTask,
  | "id"
  | "title"
  | "description"
  | "deadlineIso"
  | "priority"
  | "status"
  | "progress"
  | "recurring"
  | "recurrence"
  | "notifyTelegram"
  | "createdAt"
> & {
  topic: { name: string } | null;
  creator: { name: string };
  assignments: Array<Pick<ClientAssignment, "name" | "department">>;
  audiences: Array<Pick<ClientAudienceTarget, "targetName">>;
  attachments: Array<Pick<ClientAttachment, "fileName">>;
};

type Meeting = Pick<
  ClientMeeting,
  "id" | "title" | "startsAt" | "endsAt" | "place" | "format" | "reminderMinutes" | "notifyTelegram" | "creator"
> & {
  participants: Array<{ name: string; department: string }>;
  audiences: Array<Pick<ClientAudienceTarget, "targetName">>;
};

function reportDateTime(value: string | Date) {
  const key = localDateKey(value);
  return `${key.slice(8, 10)}.${key.slice(5, 7)}.${key.slice(0, 4)} ${formatTime(value)}`;
}

function styleTableSheet(
  XLSX: XlsxModule,
  sheet: import("xlsx-js-style").WorkSheet,
  rowCount: number,
  columnCount: number,
  statusColumn?: number,
  priorityColumn?: number,
) {
  const thinBorder = {
    top: { style: "thin", color: { rgb: "DCE4EF" } },
    bottom: { style: "thin", color: { rgb: "DCE4EF" } },
    left: { style: "thin", color: { rgb: "DCE4EF" } },
    right: { style: "thin", color: { rgb: "DCE4EF" } },
  };
  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: column });
      const cell = sheet[address];
      if (!cell) continue;
      if (row === 0) {
        cell.s = {
          font: { name: "Aptos", bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
          fill: { patternType: "solid", fgColor: { rgb: "1957D2" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: thinBorder,
        };
      } else {
        cell.s = {
          font: { name: "Aptos", color: { rgb: "253047" }, sz: 10 },
          fill: { patternType: "solid", fgColor: { rgb: row % 2 === 0 ? "F7F9FC" : "FFFFFF" } },
          alignment: { vertical: "top", wrapText: true },
          border: thinBorder,
        };
      }
    }
  }

  const statusColors: Record<string, { background: string; text: string }> = {
    Bajarildi: { background: "E7F6EF", text: "087A4F" },
    [tNow("Bajarildi")]: { background: "E7F6EF", text: "087A4F" },
    Kechikkan: { background: "FDECEB", text: "B42318" },
    [tNow("Kechikkan")]: { background: "FDECEB", text: "B42318" },
    Jarayonda: { background: "EAF1FF", text: "1957D2" },
    [tNow("Jarayonda")]: { background: "EAF1FF", text: "1957D2" },
    "Ko‘rib chiqilmoqda": { background: "F0EDFF", text: "5B4BB7" },
    [tNow("Ko‘rib chiqilmoqda")]: { background: "F0EDFF", text: "5B4BB7" },
    Faol: { background: "FFF4E5", text: "B35F00" },
    [tNow("Faol")]: { background: "FFF4E5", text: "B35F00" },
    Davomiy: { background: "F0EDFF", text: "5B4BB7" },
    [tNow("Davomiy")]: { background: "F0EDFF", text: "5B4BB7" },
  };
  if (statusColumn !== undefined) {
    for (let row = 1; row < rowCount; row += 1) {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: statusColumn })];
      const colors = cell ? statusColors[String(cell.v)] : undefined;
      if (cell && colors) {
        cell.s = {
          ...cell.s,
          font: { name: "Aptos", bold: true, color: { rgb: colors.text }, sz: 10 },
          fill: { patternType: "solid", fgColor: { rgb: colors.background } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
        };
      }
    }
  }

  const priorityColors: Record<string, { background: string; text: string }> = {
    Yuqori: { background: "FDECEB", text: "B42318" },
    [tNow("Yuqori")]: { background: "FDECEB", text: "B42318" },
    "O‘rta": { background: "FFF4E5", text: "B35F00" },
    [tNow("O‘rta")]: { background: "FFF4E5", text: "B35F00" },
    Oddiy: { background: "E7F6EF", text: "087A4F" },
    [tNow("Oddiy")]: { background: "E7F6EF", text: "087A4F" },
  };
  if (priorityColumn !== undefined) {
    for (let row = 1; row < rowCount; row += 1) {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: priorityColumn })];
      const colors = cell ? priorityColors[String(cell.v)] : undefined;
      if (cell && colors) {
        cell.s = {
          ...cell.s,
          font: { name: "Aptos", bold: true, color: { rgb: colors.text }, sz: 10 },
          fill: { patternType: "solid", fgColor: { rgb: colors.background } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }
  }

  sheet["!rows"] = [{ hpt: 34 }, ...Array.from({ length: Math.max(0, rowCount - 1) }, () => ({ hpt: 31 }))];
  sheet["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(columnCount - 1)}${rowCount}` };
  sheet["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft", state: "frozen" };
  sheet["!sheetViews"] = [{ showGridLines: false }];
}

export async function exportExcel(tasks: Task[], meetings: Meeting[], alphabet: Alphabet) {
  const XLSX = await loadXlsx();
  // UI labels are translated; user data is only transliterated (Cyrillic).
  const tr = (value: string, params?: TranslateParams) => translate(alphabet, value, params);
  const tx = (value: string | null | undefined) => transliterateData(alphabet, value);
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: tr("Ichki hisobotlarni boshqarish tizimi hisoboti"),
    Subject: tr("Topshiriqlar va yig‘ilishlar bo‘yicha jamlanma"),
    Author: "Ichki hisobotlarni boshqarish tizimi",
    Company: tr("Avtomobil yo‘llari qo‘mitasi"),
    CreatedDate: new Date(),
  };

  const completed = tasks.filter((task) => task.status === "Bajarildi").length;
  const overdue = tasks.filter(
    (task) => task.status !== "Bajarildi" && task.deadlineIso && new Date(task.deadlineIso) < new Date(),
  ).length;
  const recurring = tasks.filter((task) => task.recurring).length;
  const averageProgress = tasks.length
    ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)
    : 0;
  const upcomingMeetings = meetings.filter((meeting) => new Date(meeting.startsAt) >= new Date()).length;
  const summaryRows = [
    [tr("ICHKI HISOBOTLARNI BOSHQARISH TIZIMI — UMUMIY HISOBOT"), "", "", "", "", ""],
    [tr("Hisobot shakllantirilgan vaqt"), reportDateTime(new Date()), "", "", "", ""],
    [],
    [tr("ASOSIY KO‘RSATKICHLAR"), "", "", "", "", ""],
    [
      tr("Jami topshiriq"),
      tr("Bajarilgan"),
      tr("Kechikkan"),
      tr("Davomiy"),
      tr("O‘rtacha ijro"),
      tr("Kelgusi yig‘ilish"),
    ],
    [tasks.length, completed, overdue, recurring, averageProgress / 100, upcomingMeetings],
    [],
    [tr("HISOBOT TARKIBI"), "", "", "", "", ""],
    [tr("Topshiriqlar"), tr("Barcha ko‘rinadigan topshiriqlar, ijrochilar, muddatlar va fayllar")],
    [tr("Yig‘ilishlar"), tr("Sana, vaqt, joy, format va ishtirokchilar ro‘yxati")],
    [],
    [
      tr("Izoh"),
      tr("Hisobot foydalanuvchining tizimdagi vakolati doirasidagi ma’lumotlardan avtomatik shakllantirildi."),
    ],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet["!merges"] = [
    XLSX.utils.decode_range("A1:F1"),
    XLSX.utils.decode_range("A4:F4"),
    XLSX.utils.decode_range("A8:F8"),
    XLSX.utils.decode_range("B9:F9"),
    XLSX.utils.decode_range("B10:F10"),
    XLSX.utils.decode_range("B12:F12"),
  ];
  summarySheet["!cols"] = [{ wch: 23 }, { wch: 23 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 22 }];
  summarySheet["!rows"] = [
    { hpt: 38 },
    { hpt: 24 },
    { hpt: 10 },
    { hpt: 27 },
    { hpt: 32 },
    { hpt: 42 },
    { hpt: 10 },
    { hpt: 27 },
    { hpt: 30 },
    { hpt: 30 },
    { hpt: 10 },
    { hpt: 38 },
  ];
  summarySheet["!sheetViews"] = [{ showGridLines: false }];
  for (const range of ["A1", "A4", "A8"]) {
    summarySheet[range].s = {
      font: { name: "Aptos Display", bold: true, color: { rgb: "FFFFFF" }, sz: range === "A1" ? 18 : 11 },
      fill: { patternType: "solid", fgColor: { rgb: range === "A1" ? "123B84" : "1957D2" } },
      alignment: { horizontal: "left", vertical: "center" },
    };
  }
  for (let column = 0; column < 6; column += 1) {
    const header = summarySheet[XLSX.utils.encode_cell({ r: 4, c: column })];
    const value = summarySheet[XLSX.utils.encode_cell({ r: 5, c: column })];
    header.s = {
      font: { name: "Aptos", bold: true, color: { rgb: "334155" }, sz: 10 },
      fill: { patternType: "solid", fgColor: { rgb: "EAF1FF" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: { bottom: { style: "thin", color: { rgb: "C7D7F4" } } },
    };
    value.s = {
      font: {
        name: "Aptos Display",
        bold: true,
        color: { rgb: column === 2 && overdue ? "B42318" : "123B84" },
        sz: 20,
      },
      fill: { patternType: "solid", fgColor: { rgb: "F8FAFD" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: { bottom: { style: "thin", color: { rgb: "DCE4EF" } } },
    };
  }
  summarySheet["E6"].z = "0%";
  for (const address of ["A2", "B2", "A9", "B9", "A10", "B10", "A12", "B12"]) {
    if (!summarySheet[address]) continue;
    summarySheet[address].s = {
      font: {
        name: "Aptos",
        bold: address.startsWith("A"),
        color: { rgb: address.startsWith("A") ? "334155" : "667085" },
        sz: 10,
      },
      alignment: { vertical: "top", wrapText: true },
    };
  }
  XLSX.utils.book_append_sheet(workbook, summarySheet, tr("Qisqa hisobot"));

  const taskHeaders = [
    "№",
    "ID",
    "Topshiriq nomi",
    "Tematika",
    "Batafsil izoh",
    "Topshiriq beruvchi",
    "Ijrochilar",
    "Bo‘limlar",
    "Yaratilgan sana",
    "Muddat",
    "Holat",
    "Bajarilish (%)",
    "Ustuvorlik",
    "Davomiy",
    "Takrorlanish",
    "Fayllar soni",
    "Fayl nomlari",
    "Telegram",
  ].map((header) => tr(header));
  const taskRows = tasks.map((task, index) => [
    index + 1,
    task.id,
    tx(task.title),
    task.topic?.name ? tx(task.topic.name) : tr("Tanlanmagan"),
    task.description ? tx(task.description) : "—",
    tx(task.creator.name),
    tx(task.assignments.map((item) => item.name).join(", ")) ||
      tx(task.audiences.map((item) => item.targetName).join(", ")) ||
      tr("Ijrochi biriktirilmagan"),
    tx([...new Set(task.assignments.map((item) => item.department).filter(Boolean))].join(", ") || "—"),
    reportDateTime(task.createdAt),
    task.deadlineIso ? reportDateTime(task.deadlineIso) : tr("Belgilanmagan"),
    tr(task.status),
    task.progress,
    tr(task.priority),
    tr(task.recurring ? "Ha" : "Yo‘q"),
    task.recurrence ? tr(task.recurrence) : "—",
    task.attachments.length,
    task.attachments.map((item) => item.fileName).join(", ") || "—",
    tr(task.notifyTelegram ? "Yoqilgan" : "O‘chirilgan"),
  ]);
  const taskSheet = XLSX.utils.aoa_to_sheet([taskHeaders, ...taskRows]);
  taskSheet["!cols"] = [
    { wch: 6 },
    { wch: 7 },
    { wch: 34 },
    { wch: 28 },
    { wch: 42 },
    { wch: 25 },
    { wch: 38 },
    { wch: 29 },
    { wch: 19 },
    { wch: 19 },
    { wch: 19 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 30 },
    { wch: 14 },
  ];
  styleTableSheet(XLSX, taskSheet, taskRows.length + 1, taskHeaders.length, 10, 12);
  for (let row = 1; row <= taskRows.length; row += 1) {
    const progressCell = taskSheet[XLSX.utils.encode_cell({ r: row, c: 11 })];
    if (progressCell) {
      progressCell.z = '0"%"';
      progressCell.s = {
        ...progressCell.s,
        font: { name: "Aptos", bold: true, color: { rgb: "1957D2" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }
  XLSX.utils.book_append_sheet(workbook, taskSheet, tr("Topshiriqlar"));

  const meetingHeaders = [
    "№",
    "ID",
    "Yig‘ilish mavzusi",
    "Sana",
    "Boshlanish",
    "Tugash",
    "O‘tkazilish joyi",
    "Format",
    "Ishtirokchilar",
    "Bo‘limlar",
    "Eslatma",
    "Telegram",
    "Yaratuvchi",
  ].map((header) => tr(header));
  const meetingRows = meetings.map((meeting, index) => [
    index + 1,
    meeting.id,
    tx(meeting.title),
    reportDateTime(meeting.startsAt).slice(0, 10),
    formatTime(meeting.startsAt),
    meeting.endsAt ? formatTime(meeting.endsAt) : "—",
    tx(meeting.place),
    tr(meeting.format),
    tx(meeting.participants.map((item) => item.name).join(", ")) ||
      tx(meeting.audiences.map((item) => item.targetName).join(", ")) ||
      tr("Ishtirokchi biriktirilmagan"),
    tx([...new Set(meeting.participants.map((item) => item.department).filter(Boolean))].join(", ") || "—"),
    tr("{n} daqiqa oldin", { n: meeting.reminderMinutes }),
    tr(meeting.notifyTelegram ? "Yoqilgan" : "O‘chirilgan"),
    tx(meeting.creator),
  ]);
  const meetingSheet = XLSX.utils.aoa_to_sheet([meetingHeaders, ...meetingRows]);
  meetingSheet["!cols"] = [
    { wch: 6 },
    { wch: 7 },
    { wch: 36 },
    { wch: 14 },
    { wch: 13 },
    { wch: 13 },
    { wch: 35 },
    { wch: 15 },
    { wch: 40 },
    { wch: 28 },
    { wch: 20 },
    { wch: 14 },
    { wch: 25 },
  ];
  styleTableSheet(XLSX, meetingSheet, meetingRows.length + 1, meetingHeaders.length);
  XLSX.utils.book_append_sheet(workbook, meetingSheet, tr("Yig‘ilishlar"));

  XLSX.writeFile(workbook, `ichki-hisobotlar-${localDateKey()}.xlsx`, {
    bookType: "xlsx",
    compression: true,
    cellStyles: true,
  });
}
