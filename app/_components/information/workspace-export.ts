import type { InformationField, InformationTemplate } from "../../information-center";
import { embeddedRecordTitle, ratioOfSums, spreadsheetCell } from "../../../lib/table-values";
import { loadXlsx } from "../../excel-client";
import { tNow } from "../../../lib/i18n/core";
import type { WorkspaceRecord, DrillDimension, GroupRow } from "./workspace-types";
import {
  statusLabel,
  formatDate,
  aggregateMetric,
  oavSummary,
  orderedFieldsFor,
  safeFileName,
} from "./workspace-model";
import { recordNoun } from "./workspace-samples";

export async function exportWorkspace(
  template: InformationTemplate,
  records: WorkspaceRecord[],
  groups: GroupRow[],
  currentDimension: DrillDimension | null,
  metrics: InformationField[],
  scope: string,
  coverageNote = "",
) {
  const XLSX = await loadXlsx();
  const sourceProfile = template.presentation?.profile ?? "";
  const isOavSummary = sourceProfile === "oav_region_detail" && Boolean(currentDimension);
  const hideCountColumn = Boolean(template.presentation?.hideCountColumn || sourceProfile === "road_elements_matrix");
  const embeddedTitleCode =
    sourceProfile === "construction_programs" ? "obyekt_nomi" : sourceProfile === "oav_region_detail" ? "nomi" : null;
  const exportFields = orderedFieldsFor(template).filter((field) => field.code !== embeddedTitleCode);
  const totalLabel = coverageNote
    ? tNow("Yuklangan qatorlar jami")
    : scope === "Barcha ma’lumotlar"
      ? tNow("Respublika jami")
      : tNow("{scope} jami", { scope });
  const headers = currentDimension
    ? isOavSummary
      ? [
          tNow("T/r"),
          tNow(currentDimension.rowLabel),
          tNow("Materiallar soni"),
          tNow("OAVlar soni"),
          tNow("Birinchi e’lon sanasi"),
          tNow("So‘nggi e’lon sanasi"),
        ]
      : [
          tNow("T/r"),
          tNow(currentDimension.rowLabel),
          ...(!hideCountColumn ? [tNow("{noun} soni", { noun: recordNoun(template) })] : []),
          ...metrics.map((field) => tNow(field.label)),
        ]
    : [
        tNow("T/r"),
        tNow("Nomi"),
        ...exportFields.map((field) => tNow(field.label)),
        tNow("Holat"),
        tNow("Yangilangan"),
      ];
  const body = currentDimension
    ? isOavSummary
      ? [
          [
            "",
            totalLabel,
            oavSummary(records).materialCount,
            oavSummary(records).mediaCount,
            oavSummary(records).firstDate,
            oavSummary(records).lastDate,
          ],
          ...groups.map((group, index) => {
            const summary = oavSummary(group.records);
            return [
              index + 1,
              group.value,
              summary.materialCount,
              summary.mediaCount,
              summary.firstDate,
              summary.lastDate,
            ];
          }),
        ]
      : [
          ...(sourceProfile
            ? [
                [
                  "",
                  totalLabel,
                  ...(!hideCountColumn ? [records.length] : []),
                  ...metrics.map((field) => aggregateMetric(records, field)),
                ],
              ]
            : []),
          ...groups.map((group, index) => [
            index + 1,
            group.value,
            ...(!hideCountColumn ? [group.count] : []),
            ...metrics.map((field) => group.metrics[field.code] ?? 0),
          ]),
        ]
    : records.map((record, index) => [
        index + 1,
        embeddedRecordTitle(record, embeddedTitleCode),
        ...exportFields.map((field) => spreadsheetCell(record.values[field.code])),
        tNow(statusLabel(record.status)),
        formatDate(record.updatedAt),
      ]);
  if (currentDimension && sourceProfile === "construction_programs") {
    headers.push(tNow("Bajarilish (%)"));
    body.forEach((row, index) => {
      const ratio = ratioOfSums(
        index === 0 ? records : groups[index - 1].records,
        "SUM(amalda_qiymat) / SUM(reja_qiymat)",
      );
      row.push(ratio == null ? "" : ratio * 100);
    });
  }
  const sheet = XLSX.utils.aoa_to_sheet([
    [template.name],
    [`${tNow("Kesim: {scope}", { scope })}${coverageNote ? ` · ${coverageNote}` : ""}`],
    [tNow("Eksport sanasi: {date}", { date: formatDate(new Date().toISOString()) })],
    [],
    headers,
    ...body.map((row) => row.map(spreadsheetCell)),
  ]);
  const lastColumn = Math.max(0, headers.length - 1);
  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastColumn } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastColumn } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: lastColumn } },
  ];
  sheet["!freeze"] = { xSplit: 2, ySplit: 5 };
  sheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({ s: { r: 4, c: 0 }, e: { r: 4 + body.length, c: lastColumn } }),
  };
  sheet["!cols"] = headers.map((header, index) => ({
    wch: index === 1 ? 42 : Math.max(12, Math.min(24, String(header).length + 4)),
  }));
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1:A1");
  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let column = range.s.c; column <= range.e.c; column += 1) {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
      if (!cell) continue;
      cell.s = {
        font: {
          name: "Arial",
          sz: row === 0 ? 16 : 10,
          bold: row === 0 || row === 4,
          color: { rgb: row === 4 ? "FFFFFF" : "243B5A" },
        },
        fill:
          row === 4
            ? { fgColor: { rgb: "1957D2" } }
            : row > 4 && row % 2 === 0
              ? { fgColor: { rgb: "F4F7FB" } }
              : undefined,
        alignment: { vertical: "center", wrapText: true, horizontal: row === 0 ? "center" : "left" },
        border:
          row >= 4
            ? {
                top: { style: "thin", color: { rgb: "D9E2EF" } },
                bottom: { style: "thin", color: { rgb: "D9E2EF" } },
                left: { style: "thin", color: { rgb: "D9E2EF" } },
                right: { style: "thin", color: { rgb: "D9E2EF" } },
              }
            : undefined,
      };
    }
  }
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, tNow("Ma’lumotlar"));
  XLSX.writeFile(workbook, `${safeFileName(template.name)}${coverageNote ? "-yuklangan-qatorlar" : ""}.xlsx`);
}
