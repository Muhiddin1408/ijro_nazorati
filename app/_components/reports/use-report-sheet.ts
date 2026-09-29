"use client";

import { tNow, transliterateData, getCurrentLocale } from "../../../lib/i18n";
import { type ClipboardEvent, type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";
import { cleanReportRows, clipboardRows } from "../../../lib/report-sheet";
import { reportHeaderIndexes } from "../../../lib/report-excel";
import { readJson } from "../../../lib/shared/http";
import { confirmDialog } from "../ui/confirm-dialog";
import type { ReportFile, ReportAssignment, ReportSheetRow } from "./report-types";
import {
  emptyReportSheetRow,
  padReportSheetRows,
  readExcelTable,
  excelCellValue,
  uploadReportFile,
} from "./report-helpers";

export type ReportSheetOptions = {
  assignment: ReportAssignment;
  busy: boolean;
  notify: (text: string, tone?: "ok" | "error") => void;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

/**
 * State and rules of the report worksheet: loading with optimistic-lock version,
 * cell editing, keyboard navigation, paste and Excel import, unsaved-change
 * confirmation, and save/submit validation.
 */
export function useReportSheet({ assignment, busy, notify, onClose, onSaved }: ReportSheetOptions) {
  const initialRows = assignment.rows.length
    ? assignment.rows
    : Object.keys(assignment.values).length
      ? [assignment.values]
      : [];
  const [rows, setRows] = useState<ReportSheetRow[]>(() =>
    padReportSheetRows(initialRows, assignment.template.columns),
  );
  const [file, setFile] = useState<File | null>(null);
  const [excelBusy, setExcelBusy] = useState(false);
  const [sheetLoading, setSheetLoading] = useState(true);
  const [activeCell, setActiveCell] = useState({ row: 0, column: 0 });
  const [sheetPage, setSheetPage] = useState(0);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [comment, setComment] = useState(assignment.comment);
  const [editable, setEditable] = useState(false);
  const [existingFiles, setExistingFiles] = useState(assignment.files);
  const versionRef = useRef(assignment.version);
  const uploadedFileRef = useRef<File | null>(null);
  const notifyRef = useRef(notify);
  const locked = busy || saving || excelBusy || sheetLoading || Boolean(loadError);
  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);
  const requestClose = async () => {
    if (busy || saving || excelBusy) return;
    if (
      dirty &&
      !(await confirmDialog({
        title: tNow("Saqlanmagan o‘zgarishlar"),
        message: tNow("Jadvaldagi o‘zgarishlar saqlanmagan. Yopishni xohlaysizmi?"),
        confirmLabel: tNow("Yopish"),
        cancelLabel: tNow("Tahrirlashda davom etish"),
        tone: "danger",
      }))
    )
      return;
    onClose();
  };
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    void (async () => {
      try {
        setSheetLoading(true);
        setLoadError("");
        const result = await readJson<{
          rows: ReportSheetRow[];
          version: number;
          comment: string;
          capabilities: { edit: boolean };
          files: ReportFile[];
        }>(
          await fetch(`/api/reports?assignmentId=${assignment.id}`, {
            cache: "no-store",
            signal: controller.signal,
          }),
        );
        if (!active) return;
        versionRef.current = result.version;
        setEditable(result.capabilities.edit);
        setComment(result.comment);
        setExistingFiles(result.files);
        setRows(padReportSheetRows(result.rows, assignment.template.columns, Math.max(50, result.rows.length + 10)));
      } catch (error) {
        if (active)
          setLoadError(error instanceof Error ? txNow(error.message) : tNow("Hisobot qatorlarini yuklab bo‘lmadi"));
      } finally {
        if (active) setSheetLoading(false);
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [assignment.id, assignment.template.columns, loadAttempt]);

  function setCell(rowIndex: number, columnId: string, value: string | number | boolean) {
    if (locked || !editable) return;
    setDirty(true);
    setRows((current) => current.map((row, index) => (index === rowIndex ? { ...row, [columnId]: value } : row)));
  }

  function appendRows(count: number) {
    if (locked || !editable) return;
    setDirty(true);
    setRows((current) => {
      const available = Math.max(0, 1000 - current.length);
      return [
        ...current,
        ...Array.from({ length: Math.min(count, available) }, () => emptyReportSheetRow(assignment.template.columns)),
      ];
    });
  }

  function trimEmptyRows() {
    if (locked || !editable) return;
    setDirty(true);
    setRows((current) => {
      const filled = current.filter((row) =>
        assignment.template.columns.some((column) => String(row[column.id] ?? "").trim()),
      );
      return padReportSheetRows(filled, assignment.template.columns, Math.max(30, filled.length + 10));
    });
  }

  function focusSheetCell(rowIndex: number, columnIndex: number) {
    const row = Math.max(0, Math.min(999, rowIndex));
    const column = Math.max(0, Math.min(assignment.template.columns.length - 1, columnIndex));
    setSheetPage(Math.floor(row / 100));
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[data-sheet-row="${row}"][data-sheet-column="${column}"]`)?.focus();
      }),
    );
  }

  function handleCellKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    rowIndex: number,
    columnIndex: number,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (rowIndex === rows.length - 1 && rows.length < 1000) appendRows(10);
      focusSheetCell(rowIndex + 1, columnIndex);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      focusSheetCell(rowIndex + 1, columnIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusSheetCell(rowIndex - 1, columnIndex);
    } else if (
      event.key === "Tab" &&
      !event.shiftKey &&
      rowIndex === rows.length - 1 &&
      columnIndex === assignment.template.columns.length - 1 &&
      rows.length < 1000
    ) {
      appendRows(10);
    }
  }

  function pasteCells(
    event: ClipboardEvent<HTMLInputElement | HTMLSelectElement>,
    rowIndex: number,
    columnIndex: number,
  ) {
    const text = event.clipboardData.getData("text");
    if (!text.includes("\t") && !text.includes("\n")) return;
    event.preventDefault();
    if (locked || !editable) return;
    let pastedRows: string[][];
    try {
      pastedRows = clipboardRows(text, rowIndex, columnIndex, assignment.template.columns.length);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Kataklar ko‘chirilmadi");
      return;
    }
    setDirty(true);
    setRows((current) => {
      const next = current.map((row) => ({ ...row }));
      while (next.length < rowIndex + pastedRows.length && next.length < 1000)
        next.push(emptyReportSheetRow(assignment.template.columns));
      pastedRows.forEach((cells, pastedRowIndex) => {
        cells.forEach((cell, pastedColumnIndex) => {
          const column = assignment.template.columns[columnIndex + pastedColumnIndex];
          const target = next[rowIndex + pastedRowIndex];
          if (column && target) target[column.id] = excelCellValue(cell, column.type);
        });
      });
      return next;
    });
  }

  async function importRows(fileToRead: File) {
    if (locked || !editable) return;
    if (
      filledRowCount &&
      !(await confirmDialog({
        title: tNow("Excel importi"),
        message: tNow("Excel importi hozirgi jadval qatorlarini almashtiradi. Davom etilsinmi?"),
        confirmLabel: tNow("Almashtirish"),
        tone: "danger",
      }))
    )
      return;
    try {
      setExcelBusy(true);
      const table = await readExcelTable(fileToRead);
      if (table.rows.length > 1000) throw new Error("Excel faylida 1000 tadan ko‘p qator bor; faylni bo‘lib yuklang");
      const headerIndexes = reportHeaderIndexes(table.headers, assignment.template.columns);
      const missing = assignment.template.columns.filter((_, index) => headerIndexes[index] < 0);
      if (missing.length)
        throw new Error(
          `Excel ustunlari mos kelmadi: ${missing
            .slice(0, 3)
            .map((column) => column.label)
            .join(", ")}`,
        );
      const imported = table.rows
        .slice(0, 1000)
        .map((source) =>
          Object.fromEntries(
            assignment.template.columns.map((column, index) => [
              column.id,
              excelCellValue(source[headerIndexes[index]], column.type),
            ]),
          ),
        )
        .filter((row) => Object.values(row).some((value) => String(value).trim()));
      if (!imported.length) throw new Error("Excel faylida to‘ldirilgan qator topilmadi");
      setRows(padReportSheetRows(imported, assignment.template.columns, Math.max(50, imported.length + 10)));
      setSheetPage(0);
      setDirty(true);
      notify(tNow("{length} ta qator Excel faylidan jadvalga o‘tkazildi", { length: imported.length }));
    } catch (error) {
      notify(error instanceof Error ? txNow(error.message) : tNow("Excel faylini o‘qib bo‘lmadi"), "error");
    } finally {
      setExcelBusy(false);
    }
  }

  async function save(submitNow: boolean) {
    if (locked || !editable) return;
    try {
      setSaveError("");
      const cleanedRows = cleanReportRows(assignment.template.columns, rows, submitNow);
      if (submitNow && assignment.template.requireAttachment && !file && !existingFiles.length)
        throw new Error("Tasdiqlovchi faylni biriktiring");
      setSaving(true);
      if (file && uploadedFileRef.current !== file) {
        const uploaded = await uploadReportFile(file, `assignmentId=${assignment.id}`, versionRef.current);
        versionRef.current = uploaded.version;
        uploadedFileRef.current = file;
      }
      const result = await readJson<{ version: number }>(
        await fetch("/api/reports", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: submitNow ? "submit" : "save",
            assignmentId: assignment.id,
            expectedVersion: versionRef.current,
            rows: cleanedRows,
            comment,
          }),
        }),
      );
      versionRef.current = result.version;
      setDirty(false);
      notifyRef.current(submitNow ? "Hisobot ko‘rib chiqishga yuborildi" : "Qoralama saqlandi");
      await onSaved();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Hisobot saqlanmadi");
    } finally {
      setSaving(false);
    }
  }

  const activeColumn = assignment.template.columns[activeCell.column];
  const filledRowCount = rows.filter((row) =>
    assignment.template.columns.some((column) => String(row[column.id] ?? "").trim()),
  ).length;
  const activeValue = activeColumn ? String(rows[activeCell.row]?.[activeColumn.id] ?? "") : "";
  const pageCount = Math.max(1, Math.ceil(rows.length / 100));
  const currentPage = Math.min(sheetPage, pageCount - 1);
  const visibleStart = currentPage * 100;
  const visibleRows = rows.slice(visibleStart, visibleStart + 100);

  return {
    rows,
    setRows,
    file,
    setFile,
    excelBusy,
    sheetLoading,
    activeCell,
    setActiveCell,
    setSheetPage,
    setLoadAttempt,
    loadError,
    saveError,
    saving,
    setDirty,
    comment,
    setComment,
    editable,
    existingFiles,
    locked,
    requestClose,
    setCell,
    appendRows,
    trimEmptyRows,
    handleCellKeyDown,
    pasteCells,
    importRows,
    save,
    activeColumn,
    filledRowCount,
    activeValue,
    pageCount,
    currentPage,
    visibleStart,
    visibleRows,
  };
}

export type ReportSheet = ReturnType<typeof useReportSheet>;

function txNow(value: string | null | undefined) {
  return transliterateData(getCurrentLocale(), value);
}
