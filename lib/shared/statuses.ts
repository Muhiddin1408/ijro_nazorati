/** Workflow statuses in which a record (information, research) can still be edited. */
export const EDITABLE_RECORD_STATUSES: readonly string[] = ["draft", "returned"];

export function isEditableRecordStatus(status: unknown) {
  return EDITABLE_RECORD_STATUSES.includes(String(status));
}

/** Report assignment statuses in which the responsible executor may still edit (matches REPORT_EDITABLE_SQL). */
export const REPORT_EDITABLE_STATUSES: readonly string[] = ["new", "draft", "collecting", "returned"];

export function isEditableReportStatus(status: unknown) {
  return REPORT_EDITABLE_STATUSES.includes(String(status));
}

/** Task/assignment status after an executor submits the work for the issuer's acceptance. */
export const TASK_REVIEW_STATUS = "Ko‘rib chiqilmoqda";

export function isTaskAwaitingReview(task: { status: string; assignments?: ReadonlyArray<{ status?: string }> }) {
  return task.status === TASK_REVIEW_STATUS || Boolean(task.assignments?.some((assignment) => assignment.status === TASK_REVIEW_STATUS));
}
