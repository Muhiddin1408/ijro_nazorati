export type SheetColumn = { id: string; label: string; type: "number" | "text" | "date" | "boolean"; required?: boolean; aggregation?: "sum" | "average" | "last" | "none" };
export type SheetRow = Record<string, string | number | boolean>;
export type NumericStats = Record<string, { sum: number; count: number }>;

export function parseReportCell(raw: unknown, type: SheetColumn["type"]): string | number | boolean {
  if (raw == null || (typeof raw === "string" && !raw.trim())) return "";
  if (!["string", "number", "boolean"].includes(typeof raw) && !(raw instanceof Date)) throw new Error("Oddiy qiymat kiriting");
  const text = String(raw).trim();
  if (type === "number") {
    if (typeof raw === "boolean") throw new Error("Raqam kiriting");
    const normalized = text.replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized) || !Number.isFinite(Number(normalized))) throw new Error("Raqam kiriting");
    return Number(normalized);
  }
  if (type === "boolean") {
    const normalized = text.toLocaleLowerCase().replace(/[‘’ʻʼ`]/g, "'");
    if (["true", "1", "ha"].includes(normalized)) return true;
    if (["false", "0", "yo'q"].includes(normalized)) return false;
    throw new Error("Ha yoki Yo‘qni tanlang");
  }
  if (type === "date") {
    const value = raw instanceof Date && !Number.isNaN(raw.getTime()) ? raw.toISOString().slice(0, 10) : text;
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new Error("Sanani YYYY-MM-DD shaklida kiriting");
    return value;
  }
  if (text.length > 4000) throw new Error("Matn 4000 belgidan oshmasin");
  return text;
}

export function cleanReportRows(columns: SheetColumn[], input: unknown, complete: boolean): SheetRow[] {
  if (!Array.isArray(input) || input.length > 1000) throw new Error("Hisobot 1000 tagacha qatordan iborat bo‘lishi kerak");
  const rows: SheetRow[] = [];
  input.forEach((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error(`${index + 1}-qator noto‘g‘ri`);
    if (!columns.some((column) => raw[column.id] != null && String(raw[column.id]).trim())) return;
    const row: SheetRow = {};
    for (const column of columns) {
      try {
        const value = parseReportCell(raw[column.id], column.type);
        if (complete && column.required && value === "") throw new Error("Majburiy maydonni to‘ldiring");
        if (value !== "") row[column.id] = value;
      } catch (error) { throw new Error(`${index + 1}-qator · ${column.label}: ${error instanceof Error ? error.message : "Qiymat noto‘g‘ri"}`); }
    }
    rows.push(row);
  });
  if (complete && !rows.length) throw new Error("Kamida bitta qatorni to‘ldiring");
  return rows;
}

export function reportNumericStats(columns: SheetColumn[], rows: SheetRow[]): NumericStats {
  return Object.fromEntries(columns.filter((column) => column.type === "number").map((column) => {
    const values = rows.map((row) => row[column.id]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    return [column.id, { sum: values.reduce((sum, value) => sum + value, 0), count: values.length }];
  }));
}

export function aggregateReportSheets(columns: SheetColumn[], sheets: Array<{ values: SheetRow; numericStats: NumericStats }>): SheetRow {
  const output: SheetRow = {};
  for (const column of columns) {
    const available = sheets.filter((sheet) => sheet.values[column.id] != null && sheet.values[column.id] !== "");
    if (!available.length) continue;
    const values = available.map((sheet) => sheet.values[column.id]);
    if (column.type === "number" && column.aggregation === "average") {
      const stats = available.map((sheet) => sheet.numericStats[column.id]).filter((stat) => stat?.count > 0);
      const count = stats.reduce((sum, stat) => sum + stat.count, 0);
      if (count) output[column.id] = Math.round(stats.reduce((sum, stat) => sum + stat.sum, 0) / count * 100) / 100;
    } else if (column.type === "number" && column.aggregation === "sum") output[column.id] = values.reduce<number>((sum, value) => sum + Number(value), 0);
    else if (column.type === "number" || column.aggregation === "last" || values.length === 1) output[column.id] = values.at(-1)!;
    else output[column.id] = `${values.length} ta yozuv`;
  }
  return output;
}

export function clipboardRows(text: string, row: number, column: number, columnCount: number) {
  const source = text.replace(/\r\n?/g, "\n");
  const rows: string[][] = [[]];
  let cell = "", quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"' && (quoted || cell === "")) {
      if (quoted && source[index + 1] === '"') { cell += '"'; index += 1; }
      else quoted = !quoted;
    } else if (!quoted && (char === "\t" || char === "\n")) {
      rows.at(-1)!.push(cell); cell = "";
      if (char === "\n") rows.push([]);
    } else cell += char;
  }
  if (quoted) throw new Error("Ko‘chirilgan jadvalda qo‘shtirnoq yopilmagan");
  if (cell || rows.at(-1)!.length || !source.endsWith("\n")) rows.at(-1)!.push(cell);
  else rows.pop();
  if (row + rows.length > 1000 || rows.some((cells) => column + cells.length > columnCount)) throw new Error("Ko‘chirilgan kataklar jadval chegarasidan oshadi. Kichikroq oraliqni tanlang");
  return rows;
}
