import type { SheetColumn } from "./report-sheet";

export function normalizedReportHeader(value: unknown) {
  return String(value ?? "").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

export function reportHeaderIndexes(headers: string[], columns: Pick<SheetColumn, "label">[]) {
  const normalized = headers.map(normalizedReportHeader);
  const names = columns.map((column) => normalizedReportHeader(column.label));
  if (new Set(names).size !== names.length || normalized.some((name, index) => name && normalized.indexOf(name) !== index)) {
    throw new Error("Excel yoki hisobot shaklida bir xil nomli ustunlar bor. Ustun nomlarini farqlang");
  }
  return names.map((name) => normalized.indexOf(name));
}

export async function readReportWorkbook(data: ArrayBuffer) {
  const xlsxModule = await import("xlsx-js-style");
  const XLSX = xlsxModule.default ?? xlsxModule;
  // Excel stores calendar dates as serial numbers. Converting them through a
  // JavaScript Date shifts the day in some timezones (including Asia/Tashkent).
  const workbook = XLSX.read(data, { type: "array", cellDates: false, cellNF: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Excel faylida varaq topilmadi");
  const worksheet = workbook.Sheets[sheetName];
  for (const [address, cell] of Object.entries(worksheet)) {
    if (address.startsWith("!") || cell.t !== "n" || !cell.z || !XLSX.SSF.is_date(cell.z)) continue;
    const date = XLSX.SSF.parse_date_code(Number(cell.v), { date1904: Boolean(workbook.Workbook?.WBProps?.date1904) });
    if (!date) continue;
    cell.t = "s";
    cell.v = `${String(date.y).padStart(4, "0")}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
    delete cell.w;
  }
  const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: true }) as unknown[][];
  const firstRowIndex = matrix.findIndex((row) => row.some((cell) => String(cell ?? "").trim()));
  if (firstRowIndex < 0) throw new Error("Excel fayli bo‘sh");
  return {
    headers: matrix[firstRowIndex].map((cell) => String(cell ?? "").trim()),
    rows: matrix.slice(firstRowIndex + 1).filter((row) => row.some((cell) => String(cell ?? "").trim())),
  };
}
