"use client";

import { useI18n } from "../../../lib/i18n";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { ModalFrame, ModalHeader } from "../../dashboard-kit";
import { formatDateTime } from "../../ui-helpers";
import { useNotify } from "../dashboard/dashboard-context";
import type { ReportAssignment } from "./report-types";
import { spreadsheetColumnName, downloadReportSheetTemplate } from "./report-helpers";
import { ReportSheetExtras } from "./report-sheet-extras";
import { ReportSheetGrid } from "./report-sheet-grid";
import { useReportSheet } from "./use-report-sheet";

export function ReportFillModal({
  assignment,
  busy,
  notify: notifyProp,
  onClose,
  onSaved,
}: {
  assignment: ReportAssignment;
  busy: boolean;
  /** Defaults to the dashboard's toast. */
  notify?: (text: string, tone?: "ok" | "error") => void;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const i18n = useI18n();
  const contextNotify = useNotify();
  const notify = notifyProp ?? contextNotify;
  const sheet = useReportSheet({ assignment, busy, notify, onClose, onSaved });
  const {
    rows,
    excelBusy,
    sheetLoading,
    activeCell,
    setSheetPage,
    setLoadAttempt,
    loadError,
    saveError,
    saving,
    setDirty,
    editable,
    locked,
    requestClose,
    setCell,
    appendRows,
    trimEmptyRows,
    importRows,
    save,
    activeColumn,
    filledRowCount,
    activeValue,
    pageCount,
    currentPage,
    visibleStart,
  } = sheet;

  return (
    <ModalFrame onClose={requestClose} extraWide>
      <form
        className="report-console-form"
        onSubmit={(event) => {
          event.preventDefault();
          void save(true);
        }}
        onChange={() => {
          if (editable && !locked) setDirty(true);
        }}
      >
        <ModalHeader
          kicker={assignment.organization.shortName || assignment.organization.name}
          title={i18n.tx(assignment.template.title)}
          subtitle={`${assignment.period.label} · ${i18n.t("Muddat")}: ${formatDateTime(assignment.period.deadlineAt)}`}
          onClose={requestClose}
        />

        {assignment.status === "returned" && assignment.reviewComment ? (
          <div className="info-alert" role="note">
            <strong>{i18n.t("Qaytarish sababi")}:</strong> {i18n.tx(assignment.reviewComment)}
          </div>
        ) : null}
        {loadError ? (
          <div className="info-alert info-alert-error" role="alert">
            {i18n.tx(loadError)}
            <button type="button" className="secondary-button" onClick={() => setLoadAttempt((value) => value + 1)}>
              {i18n.t("Qayta yuklash")}
            </button>
          </div>
        ) : null}
        {saveError ? (
          <div className="info-alert info-alert-error" role="alert">
            {i18n.tx(saveError)}
          </div>
        ) : null}
        {!editable && !sheetLoading && !loadError ? (
          <div className="info-alert" role="status">
            {i18n.t("Ko‘rish rejimi. Barcha qatorlarni ochish va Excel’ga yuklash mumkin.")}
          </div>
        ) : null}
        <fieldset className="report-input-fieldset" disabled={locked} aria-busy={locked}>
          <div className="report-sheet-ribbon">
            <div className="sheet-workbook-title">
              <span className="excel-app-mark">{i18n.t("X")}</span>
              <span>
                <strong>{i18n.t("Hisobot ishchi jadvali")}</strong>
                <small>
                  {sheetLoading
                    ? i18n.t("Ma’lumotlar yuklanmoqda...")
                    : i18n.t("{code} · Excel konsoli", { code: assignment.template.code })}
                </small>
              </span>
            </div>
            <div className="sheet-ribbon-actions">
              <button
                type="button"
                className="secondary-button compact-button"
                disabled={!editable || rows.length >= 1000}
                onClick={() => appendRows(10)}
              >
                <Plus size={14} /> {i18n.t("10 qator")}
              </button>
              <button
                type="button"
                className="secondary-button compact-button"
                disabled={!editable || rows.length >= 1000}
                onClick={() => appendRows(50)}
              >
                <Plus size={14} /> {i18n.t("50 qator")}
              </button>
              <button
                type="button"
                className="secondary-button compact-button"
                disabled={!editable}
                onClick={trimEmptyRows}
              >
                <Trash2 size={14} /> {i18n.t("Bo‘shlarni yig‘ish")}
              </button>
              <button
                type="button"
                className="secondary-button compact-button"
                disabled={excelBusy}
                onClick={() =>
                  void downloadReportSheetTemplate(assignment, rows).catch((error) =>
                    notify(
                      error instanceof Error ? i18n.tx(error.message) : i18n.t("Excel fayli tayyorlanmadi"),
                      "error",
                    ),
                  )
                }
              >
                <Download size={14} /> {i18n.t("Excel yuklab olish")}
              </button>
              <label className="secondary-button compact-button sheet-import-button">
                <UploadCloud size={14} />
                {excelBusy ? i18n.t("O‘qilmoqda...") : i18n.t("Excel’dan olish")}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  disabled={!editable || excelBusy || sheetLoading}
                  onChange={(event) => {
                    const selected = event.target.files?.[0];
                    event.currentTarget.value = "";
                    if (selected) void importRows(selected);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="sheet-formula-bar">
            <span className="sheet-name-box">
              {i18n.tx(spreadsheetColumnName(activeCell.column))}
              {activeCell.row + 1}
            </span>
            <span className="sheet-fx">{i18n.t("fx")}</span>
            <input
              value={activeValue}
              readOnly={!editable}
              aria-label={i18n.t("Tanlangan katak qiymati")}
              placeholder={i18n.t("Tanlangan katak qiymati")}
              onChange={(event) => {
                if (activeColumn) setCell(activeCell.row, activeColumn.id, event.target.value);
              }}
            />
          </div>

          <div className="modal-body report-sheet-body">
            <ReportSheetGrid assignment={assignment} sheet={sheet} />

            <div className="sheet-status-bar">
              <div>
                <button type="button" className="sheet-tab active">
                  <FileSpreadsheet size={14} /> {i18n.t("Hisobot")}
                </button>
                <button
                  type="button"
                  className="sheet-add-tab"
                  disabled={!editable || rows.length >= 1000}
                  onClick={() => appendRows(10)}
                  title={i18n.t("10 qator qo‘shish")}
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="sheet-pagination">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setSheetPage((page) => Math.max(0, page - 1))}
                >
                  <ChevronLeft size={14} />
                </button>
                <strong>
                  {currentPage + 1} / {pageCount}
                </strong>
                <button
                  type="button"
                  disabled={currentPage >= pageCount - 1}
                  onClick={() => setSheetPage((page) => Math.min(pageCount - 1, page + 1))}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <span>
                <strong>{filledRowCount}</strong> {i18n.t("ta to‘ldirilgan ·")} <strong>{rows.length}</strong>{" "}
                {i18n.t("ta qator · ekranda")} {visibleStart + 1}–{Math.min(rows.length, visibleStart + 100)}{" "}
                {i18n.t("· Excel’dan kataklarni joylang")}
              </span>
            </div>

            <ReportSheetExtras assignment={assignment} sheet={sheet} />
          </div>
        </fieldset>
        <div className="modal-footer">
          <span>
            <ShieldCheck size={15} /> {i18n.t("Faqat to‘ldirilgan qatorlar sayt bazasiga saqlanadi")}
          </span>
          <div>
            <button type="button" className="secondary-button" onClick={requestClose}>
              {i18n.t("Yopish")}
            </button>
            {editable ? (
              <button type="button" className="secondary-button" disabled={locked} onClick={() => void save(false)}>
                <Save size={16} /> {i18n.t("Qoralama saqlash")}
              </button>
            ) : null}
            {editable ? (
              <button className="primary-button" disabled={locked}>
                {saving || sheetLoading ? <RefreshCw className="spin" size={16} /> : <Save size={16} />}{" "}
                {i18n.t("Saqlash va yuborish")}
              </button>
            ) : null}
          </div>
        </div>
      </form>
    </ModalFrame>
  );
}
