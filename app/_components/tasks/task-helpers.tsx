"use client";

import { readJson } from "../../dashboard-kit";
import { addDays, formatDateTime, formatTime, localDateKey } from "../../ui-helpers";
import type { ModalTask } from "./task-meeting-types";
import { tNow } from "../../../lib/i18n";

export async function patchTask(id: number, payload: Record<string, unknown>) {
  await readJson(
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    }),
  );
}

export function deadlineLabel(task: Pick<ModalTask, "deadlineIso" | "recurring" | "recurrence">) {
  if (!task.deadlineIso) return tNow(task.recurring ? (task.recurrence ?? "Davomiy") : "Muddat belgilanmagan");
  const key = localDateKey(task.deadlineIso);
  const today = localDateKey();
  const prefix =
    key === today ? tNow("Bugun") : key === addDays(today, 1) ? tNow("Ertaga") : formatDateTime(task.deadlineIso, true);
  return `${prefix}, ${formatTime(task.deadlineIso)}`;
}

export function EmptyMini({ text }: { text: string }) {
  return (
    <div className="empty-mini">
      <span>—</span>
      {text}
    </div>
  );
}
