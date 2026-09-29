"use client";

import { useI18n } from "../../../lib/i18n";
import { type ReactNode } from "react";
import { readJson } from "../../dashboard-kit";
import { aggregateReportSheets, parseReportCell } from "../../../lib/report-sheet";
import { readReportWorkbook } from "../../../lib/report-excel";
import { formatTime, localDateKey } from "../../ui-helpers";
import { loadXlsx } from "../../excel-client";
import { tNow } from "../../../lib/i18n/core";
import type { ReportColumn, ReportAssignment, ReportsPageTask, ReportSheetRow } from "./report-types";

function reportDateTime(value: string | Date) {
  const key = localDateKey(value);
  return `${key.slice(8, 10)}.${key.slice(5, 7)}.${key.slice(0, 4)} ${formatTime(value)}`;
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

export function departmentPerformance(tasks: ReportsPageTask[]) {
  const groups = new Map<string, number[]>();
  for (const task of tasks)
    for (const assignment of task.assignments) {
      const values = groups.get(assignment.department) ?? [];
      values.push(assignment.progress);
      groups.set(assignment.department, values);
    }
  return [...groups.entries()]
    .filter(([name]) => name)
    .map(([name, values]) => ({
      name,
      progress: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    }))
    .sort((a, b) => b.progress - a.progress);
}

export function Summary({ icon, tone, label, value }: { icon: ReactNode; tone: string; label: string; value: string }) {
  const i18n = useI18n();
  return (
    <div>
      <span className={`metric-icon ${tone}`}>{icon}</span>
      <p>
        <small>{i18n.t(label)}</small>
        <strong>{i18n.tx(value)}</strong>
      </p>
    </div>
  );
}

export function reportStatusLabel(status: string) {
  return (
    (
      {
        new: "Yangi",
        draft: "Qoralama",
        collecting: "Quyi tashkilotlardan kutilmoqda",
        submitted: "Yuborilgan",
        approved: "Tasdiqlangan",
        returned: "Qaytarilgan",
      } as Record<string, string>
    )[status] ?? status
  );
}

export function reportFrequencyLabel(value: string) {
  return (
    (
      {
        one_time: "Bir martalik",
        weekly: "Har hafta",
        monthly: "Har oy",
        quarterly: "Har chorak",
        yearly: "Har yil",
      } as Record<string, string>
    )[value] ?? value
  );
}

export function reportDeadlineTone(assignment: ReportAssignment) {
  if (assignment.status === "approved") return "ok";
  return new Date(assignment.period.deadlineAt) < new Date() ? "late" : "soon";
}

export function reportDepth(assignment: ReportAssignment, all: ReportAssignment[]) {
  let current = assignment;
  let depth = 0;
  const visited = new Set<number>();
  while (current.parentAssignmentId != null && !visited.has(current.id)) {
    visited.add(current.id);
    const parent = all.find((item) => item.id === current.parentAssignmentId);
    if (!parent) break;
    depth += 1;
    current = parent;
  }
  return depth;
}

export function aggregateReportValues(columns: ReportColumn[], sheets: ReportAssignment[]) {
  return aggregateReportSheets(columns, sheets);
}

export function reportAggregateRows(assignments: ReportAssignment[]) {
  const selected: ReportAssignment[] = [];
  const seen = new Set<number>();
  const visit = (assignment: ReportAssignment) => {
    if (seen.has(assignment.id)) return;
    seen.add(assignment.id);
    if (["submitted", "approved"].includes(assignment.status) && Object.keys(assignment.values).length)
      selected.push(assignment);
    else assignments.filter((child) => child.parentAssignmentId === assignment.id).forEach(visit);
  };
  assignments
    .filter(
      (item) =>
        item.parentAssignmentId == null || !assignments.some((candidate) => candidate.id === item.parentAssignmentId),
    )
    .forEach(visit);
  return selected;
}

export function spreadsheetColumnName(index: number) {
  let value = index + 1;
  let output = "";
  while (value > 0) {
    value -= 1;
    output = String.fromCharCode(65 + (value % 26)) + output;
    value = Math.floor(value / 26);
  }
  return output;
}

export function emptyReportSheetRow(columns: ReportColumn[]): ReportSheetRow {
  return Object.fromEntries(columns.map((column) => [column.id, ""]));
}

export function padReportSheetRows(rows: ReportSheetRow[], columns: ReportColumn[], minimum = 50) {
  const next = rows.map((row) => ({ ...emptyReportSheetRow(columns), ...row }));
  while (next.length < minimum) next.push(emptyReportSheetRow(columns));
  return next.slice(0, 1000);
}

export async function readExcelTable(file: File) {
  return readReportWorkbook(await file.arrayBuffer());
}

export function inferExcelColumnType(values: unknown[]): ReportColumn["type"] {
  const rawSamples = values.filter((value) => value !== "" && value != null).slice(0, 20);
  if (rawSamples.length && rawSamples.every((value) => value instanceof Date)) return "date";
  if (rawSamples.length && rawSamples.every((value) => typeof value === "boolean")) return "boolean";
  const samples = rawSamples.map((value) => String(value).trim());
  if (!samples.length) return "text";
  if (samples.every((value) => Number.isFinite(Number(value.replaceAll(" ", "").replace(",", "."))))) return "number";
  if (samples.every((value) => ["ha", "yo‘q", "yo'q", "true", "false", "1", "0"].includes(value.toLocaleLowerCase())))
    return "boolean";
  if (samples.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))) return "date";
  return "text";
}

export function excelCellValue(value: unknown, type: ReportColumn["type"]) {
  try {
    return parseReportCell(value, type);
  } catch {
    return String(value ?? "").trim();
  }
}

export async function downloadReportSheetTemplate(assignment: ReportAssignment, currentRows?: ReportSheetRow[]) {
  const XLSX = await loadXlsx();
  const headers = assignment.template.columns.map((column) => column.label);
  const rows = currentRows ?? assignment.rows;
  const sourceRows = rows.length
    ? rows
        .filter((row) => assignment.template.columns.some((column) => String(row[column.id] ?? "").trim()))
        .map((row) => assignment.template.columns.map((column) => row[column.id] ?? ""))
    : [];
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...sourceRows]);
  sheet["!cols"] = assignment.template.columns.map((column) => ({
    wch: Math.max(16, Math.min(38, column.label.length + 6)),
  }));
  for (let columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: columnIndex })];
    if (!cell) continue;
    cell.s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1957D2" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "D7E0EB" } },
        bottom: { style: "thin", color: { rgb: "D7E0EB" } },
        left: { style: "thin", color: { rgb: "D7E0EB" } },
        right: { style: "thin", color: { rgb: "D7E0EB" } },
      },
    };
  }
  sheet["!rows"] = [{ hpt: 30 }];
  sheet["!autofilter"] = {
    ref: `A1:${spreadsheetColumnName(headers.length - 1)}${Math.max(2, sourceRows.length + 1)}`,
  };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, tNow("Hisobot"));
  XLSX.writeFile(workbook, `${assignment.template.code}-${assignment.period.label.replaceAll(" ", "-")}.xlsx`, {
    bookType: "xlsx",
    compression: true,
  });
}

export async function downloadReportRegister(
  assignments: ReportAssignment[],
  template: ReportAssignment["template"],
  periodLabel: string,
) {
  const XLSX = await loadXlsx();
  const fixedHeaders = [
    "Tashkilot",
    "Turi",
    "Yuqori tashkilot",
    "Mas’ul xodim",
    "To‘ldirgan",
    "Holat",
    "Yuborilgan vaqt",
    "Qatorlar",
  ].map((header) => tNow(header));
  const headers = [
    ...fixedHeaders,
    ...template.columns.map((column) => (column.unit ? `${column.label} (${column.unit})` : column.label)),
  ];
  const rows = assignments.map((assignment) => {
    const parent =
      assignments.find((item) => item.organization.id === assignment.organization.parentId)?.organization.name ?? "—";
    return [
      assignment.organization.name,
      tNow(organizationTypeLabel(assignment.organization.type)),
      parent,
      assignment.responsible.name,
      assignment.submittedBy?.name ?? "—",
      tNow(reportStatusLabel(assignment.status)),
      assignment.submittedAt ? reportDateTime(assignment.submittedAt) : "—",
      assignment.rowCount,
      ...template.columns.map((column) => assignment.values[column.id] ?? ""),
    ];
  });
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  sheet["!freeze"] = { xSplit: 1, ySplit: 1 };
  sheet["!autofilter"] = { ref: `A1:${spreadsheetColumnName(headers.length - 1)}${Math.max(2, rows.length + 1)}` };
  sheet["!cols"] = headers.map((header, index) => ({
    wch: index === 0 ? 34 : Math.max(14, Math.min(28, header.length + 4)),
  }));
  for (let index = 0; index < headers.length; index += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: index })];
    if (!cell) continue;
    cell.s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: index < fixedHeaders.length ? "174A9C" : "168249" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "CCD6E3" } },
        bottom: { style: "thin", color: { rgb: "CCD6E3" } },
        left: { style: "thin", color: { rgb: "CCD6E3" } },
        right: { style: "thin", color: { rgb: "CCD6E3" } },
      },
    };
  }
  sheet["!rows"] = [{ hpt: 34 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, tNow("Hududlar va tumanlar"));
  XLSX.writeFile(workbook, `${template.code}-${periodLabel.replaceAll(" ", "-")}-svod.xlsx`, {
    bookType: "xlsx",
    compression: true,
  });
}

export async function uploadReportFile(file: File, target: string, version?: number) {
  return readJson<{ id: number; version: number }>(
    await fetch(`/api/reports/files?${target}`, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-File-Name": encodeURIComponent(file.name),
        "X-File-Size": String(file.size),
        ...(version == null ? {} : { "X-Record-Version": String(version) }),
      },
      body: file,
    }),
  );
}
