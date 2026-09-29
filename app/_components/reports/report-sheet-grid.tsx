"use client";

import { useI18n } from "../../../lib/i18n";
import { Trash2 } from "lucide-react";
import type { ReportAssignment } from "./report-types";
import { spreadsheetColumnName } from "./report-helpers";
import type { ReportSheet } from "./use-report-sheet";

/** The editable 100-row page of the worksheet (only visible rows are rendered). */
export function ReportSheetGrid({ assignment, sheet }: { assignment: ReportAssignment; sheet: ReportSheet }) {
  const i18n = useI18n();
  const {
    visibleRows,
    visibleStart,
    activeCell,
    setActiveCell,
    editable,
    pasteCells,
    handleCellKeyDown,
    setCell,
    setDirty,
    setRows,
  } = sheet;
  return (
    <div className="report-spreadsheet-wrap">
      <table className="report-spreadsheet">
        <thead>
          <tr className="sheet-letters">
            <th className="sheet-corner" />
            {assignment.template.columns.map((column, index) => (
              <th key={column.id}>{i18n.tx(spreadsheetColumnName(index))}</th>
            ))}
            <th className="sheet-action-column" />
          </tr>
          <tr className="sheet-headings">
            <th>#</th>
            {assignment.template.columns.map((column) => (
              <th key={column.id}>
                <strong>
                  {i18n.t(column.label)}
                  {column.required ? " *" : ""}
                </strong>
                <small>
                  {i18n.tx(column.unit) ||
                    (column.type === "number"
                      ? i18n.t("Raqam")
                      : column.type === "date"
                        ? i18n.t("Sana")
                        : column.type === "boolean"
                          ? i18n.t("Ha / yo‘q")
                          : i18n.t("Matn"))}
                </small>
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, visibleIndex) => {
            const rowIndex = visibleStart + visibleIndex;
            return (
              <tr key={rowIndex}>
                <th>{rowIndex + 1}</th>
                {assignment.template.columns.map((column, columnIndex) => (
                  <td
                    className={activeCell.row === rowIndex && activeCell.column === columnIndex ? "active-cell" : ""}
                    key={column.id}
                  >
                    {column.type === "boolean" ? (
                      <select
                        disabled={!editable}
                        onPaste={(event) => pasteCells(event, rowIndex, columnIndex)}
                        data-sheet-row={rowIndex}
                        data-sheet-column={columnIndex}
                        aria-label={i18n.t("{p0}-qator, {label}", { p0: rowIndex + 1, label: i18n.t(column.label) })}
                        value={String(row[column.id] ?? "")}
                        onFocus={() =>
                          setActiveCell({
                            row: rowIndex,
                            column: columnIndex,
                          })
                        }
                        onKeyDown={(event) => handleCellKeyDown(event, rowIndex, columnIndex)}
                        onChange={(event) => setCell(rowIndex, column.id, event.target.value)}
                      >
                        <option value="">—</option>
                        <option value="true">{i18n.t("Ha")}</option>
                        <option value="false">{i18n.t("Yo‘q")}</option>
                        {!["", "true", "false"].includes(String(row[column.id] ?? "")) ? (
                          <option value={String(row[column.id])}>
                            {String(row[column.id])} {i18n.t("— tekshiring")}
                          </option>
                        ) : null}
                      </select>
                    ) : (
                      <input
                        readOnly={!editable}
                        data-sheet-row={rowIndex}
                        data-sheet-column={columnIndex}
                        aria-label={i18n.t("{p0}-qator, {label}", { p0: rowIndex + 1, label: i18n.t(column.label) })}
                        type="text"
                        placeholder={column.type === "date" ? i18n.t("YYYY-MM-DD") : undefined}
                        inputMode={column.type === "number" ? "decimal" : undefined}
                        step={column.type === "number" ? "any" : undefined}
                        value={String(row[column.id] ?? "")}
                        onFocus={() =>
                          setActiveCell({
                            row: rowIndex,
                            column: columnIndex,
                          })
                        }
                        onKeyDown={(event) => handleCellKeyDown(event, rowIndex, columnIndex)}
                        onChange={(event) => setCell(rowIndex, column.id, event.target.value)}
                        onPaste={(event) => pasteCells(event, rowIndex, columnIndex)}
                      />
                    )}
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    className="sheet-delete-row"
                    disabled={!editable}
                    title={i18n.t("{p0}-qatorni o‘chirish", { p0: rowIndex + 1 })}
                    onClick={() => {
                      setDirty(true);
                      setRows((current) => current.filter((_, index) => index !== rowIndex));
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
