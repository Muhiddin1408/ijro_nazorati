"use client";
import { loadXlsx } from "./excel-client";
import { tNow } from "../lib/i18n/core";

/**
 * Audit log Excel export (client-side).
 * Uses xlsx-js-style already in package.json.
 * AuditPage: import { exportAuditExcel } from "./audit-export";
 */

export type AuditExportRow = {
  id?: number | null;
  createdAt?: string | null;
  actorName?: string | null;
  actorEmployeeId?: number | null;
  action?: string | null;
  actionLabel?: string | null;
  entityType?: string | null;
  entityId?: number | null;
  detailJson?: string | null;
  detail?: unknown;
};

function safeDetail(row: AuditExportRow): string {
  if (row.detailJson != null && String(row.detailJson).trim()) {
    try {
      const parsed = typeof row.detailJson === "string" ? JSON.parse(row.detailJson) : row.detailJson;
      return JSON.stringify(parsed);
    } catch {
      return String(row.detailJson);
    }
  }
  if (row.detail != null) {
    try {
      return typeof row.detail === "string" ? row.detail : JSON.stringify(row.detail);
    } catch {
      return String(row.detail);
    }
  }
  return "";
}

function stampFileName(prefix = "audit-log") {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${prefix}-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.xlsx`;
}

/** Build and download an Excel workbook for audit rows. Returns filename. */
export async function exportAuditLogsExcel(
  rows: AuditExportRow[],
  options?: { fileName?: string; sheetName?: string },
): Promise<string> {
  const XLSX = await loadXlsx();

  const header = [
    "№",
    tNow("Vaqt"),
    tNow("Xodim"),
    tNow("Xodim ID"),
    tNow("Amal kodi"),
    tNow("Amal"),
    tNow("Obyekt turi"),
    tNow("Obyekt ID"),
    tNow("Tafsilot"),
  ];

  const body = rows.map((row, index) => [
    index + 1,
    row.createdAt ?? "",
    row.actorName ?? "",
    row.actorEmployeeId ?? "",
    row.action ?? "",
    row.actionLabel ?? row.action ?? "",
    row.entityType ?? "",
    row.entityId ?? "",
    safeDetail(row),
  ]);

  const sheet = XLSX.utils.aoa_to_sheet([header, ...body]);

  sheet["!cols"] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 28 },
    { wch: 10 },
    { wch: 22 },
    { wch: 28 },
    { wch: 16 },
    { wch: 10 },
    { wch: 48 },
  ];

  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "1957D2" } },
    alignment: { vertical: "center", horizontal: "left" },
  };
  for (let c = 0; c < header.length; c += 1) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c });
    if (sheet[cellRef]) {
      sheet[cellRef].s = headerStyle;
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, options?.sheetName ?? tNow("Audit"));

  const fileName = options?.fileName ?? stampFileName();
  XLSX.writeFile(workbook, fileName);
  return fileName;
}

/** Alias for shorter call sites. */
export const exportAuditExcel = exportAuditLogsExcel;
