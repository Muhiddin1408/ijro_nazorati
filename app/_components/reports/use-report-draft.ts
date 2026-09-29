"use client";

import { tNow } from "../../../lib/i18n";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { confirmDialog } from "../ui/confirm-dialog";
import type { ReportColumn, ReportOrganization } from "./report-types";
import { readExcelTable, inferExcelColumnType } from "./report-helpers";

// Editable rows carry a client-only key so React keeps each input's state with
// its row when rows are removed or reordered; it is stripped before submitting.
let rowKeySequence = 0;
export const nextRowKey = () => `row-${++rowKeySequence}`;
export type DraftColumn = Omit<ReportColumn, "id"> & { rowKey: string };
export type DraftRecipient = { organizationId: number; employeeId: number; rowKey: string };

const MAX_TEMPLATE_FILE_BYTES = 100 * 1024 * 1024;

/**
 * State and rules of the report-template builder: default columns and first
 * recipient, Excel header import (≤ 32 columns), unsaved-change confirmation
 * and submit validation (file size, Tashkent-time deadline, client keys stripped).
 */
export function useReportDraft({
  organizations,
  busy,
  createdTemplateId,
  onClose,
  onSubmit,
}: {
  organizations: ReportOrganization[];
  busy: boolean;
  createdTemplateId?: number;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>, file: File | null) => void;
}) {
  const requestId = useRef(crypto.randomUUID());
  const [columns, setColumns] = useState<DraftColumn[]>(() => [
    {
      rowKey: nextRowKey(),
      label: "Ko‘rsatkich nomi",
      type: "text",
      unit: "",
      required: true,
      aggregation: "none",
    },
    {
      rowKey: nextRowKey(),
      label: "Miqdori",
      type: "number",
      unit: "",
      required: true,
      aggregation: "sum",
    },
  ]);
  const scopedOrganizationIds = new Set(organizations.map((item) => item.id));
  const scopeRoot = organizations.find((item) => item.parentId == null || !scopedOrganizationIds.has(item.parentId));
  const targetOrganizations = organizations.filter((item) => item.parentId === scopeRoot?.id && item.active);
  const [recipients, setRecipients] = useState<DraftRecipient[]>(() => [
    {
      rowKey: nextRowKey(),
      organizationId: targetOrganizations[0]?.id ?? organizations[0]?.id ?? 0,
      employeeId: 0,
    },
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [excelBusy, setExcelBusy] = useState(false);
  const [excelNotice, setExcelNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty || createdTemplateId) return;
    const protect = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty, createdTemplateId]);
  async function close() {
    if (busy || excelBusy) return;
    if (
      dirty &&
      !createdTemplateId &&
      !(await confirmDialog({
        title: tNow("Saqlanmagan hisobot shakli"),
        message: tNow("Saqlanmagan hisobot shakli o‘chadi. Yopilsinmi?"),
        confirmLabel: tNow("Yopish"),
        cancelLabel: tNow("Tahrirlashda davom etish"),
        tone: "danger",
      }))
    )
      return;
    onClose();
  }
  async function importColumns(fileToRead: File) {
    try {
      setExcelBusy(true);
      const table = await readExcelTable(fileToRead);
      if (table.headers.length > 32)
        throw new Error("Excel faylida 32 tadan ko‘p ustun bor; shaklni bir nechta hisobotga ajrating");
      const imported = table.headers
        .slice(0, 32)
        .map((header, index) => {
          const type = inferExcelColumnType(table.rows.map((row) => row[index]));
          return {
            rowKey: nextRowKey(),
            label: header || `Ustun ${index + 1}`,
            type,
            unit: "",
            required: true,
            aggregation: type === "number" ? ("sum" as const) : ("none" as const),
          };
        })
        .filter((column) => column.label.trim());
      if (!imported.length) throw new Error("Excel faylining birinchi qatorida ustun nomlari topilmadi");
      setColumns(imported);
      setExcelNotice(`${imported.length} ta ustun Excel faylidan olindi`);
    } catch (error) {
      setExcelNotice(error instanceof Error ? error.message : "Excel faylini o‘qib bo‘lmadi");
    } finally {
      setExcelBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || excelBusy) return;
    if (file && (file.size <= 0 || file.size > MAX_TEMPLATE_FILE_BYTES)) {
      setExcelNotice("Fayl hajmi 1 baytdan 100 MB gacha bo‘lsin");
      return;
    }
    if (createdTemplateId) {
      onSubmit({}, file);
      return;
    }
    const form = new FormData(event.currentTarget);
    const firstDeadlineLocal = String(form.get("firstDeadlineAt") ?? "");
    onSubmit(
      {
        requestId: requestId.current,
        title: form.get("title"),
        instructions: form.get("instructions"),
        frequency: form.get("frequency"),
        firstDeadlineAt: firstDeadlineLocal ? new Date(`${firstDeadlineLocal}:00+05:00`).toISOString() : "",
        allowDelegation: form.get("allowDelegation") === "on",
        requireAttachment: form.get("requireAttachment") === "on",
        columns: columns.map(({ rowKey, ...column }) => {
          void rowKey;
          return column;
        }),
        recipients: recipients.map(({ rowKey, ...recipient }) => {
          void rowKey;
          return recipient;
        }),
      },
      file,
    );
  }

  return {
    columns,
    setColumns,
    recipients,
    setRecipients,
    targetOrganizations,
    file,
    setFile,
    excelBusy,
    excelNotice,
    setDirty,
    close,
    importColumns,
    submit,
  };
}
