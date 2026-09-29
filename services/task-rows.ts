/**
 * Typed rows for the task, meeting and attachment tables plus the mappers that
 * turn raw SQLite rows into camelCase records. Code outside this file never
 * reads `row.some_column` from an untyped record.
 */

export const TASK_DONE = "Bajarildi";
export const TASK_REVIEW = "Ko‘rib chiqilmoqda";
export const TASK_IN_PROGRESS = "Jarayonda";
export const TASK_RECURRING_ACTIVE = "Davomiy";

/** `app_tasks` as stored. */
export interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  deadline_iso: string | null;
  priority: string;
  status: string;
  progress: number | null;
  recurring: number;
  recurrence: string | null;
  notify_telegram: number;
  topic_id: number | null;
  created_by_employee_id: number;
  /** Day of month (Asia/Tashkent) monthly/quarterly recurrences return to; see lib/recurrence.ts. */
  recurrence_anchor_day?: number | null;
  archived: number;
  created_at: string;
  updated_at: string;
}

export interface TaskRecord {
  id: number;
  title: string;
  description: string;
  deadlineIso: string | null;
  priority: string;
  status: string;
  progress: number;
  recurring: boolean;
  recurrence: string | null;
  notifyTelegram: boolean;
  topicId: number | null;
  createdByEmployeeId: number;
  archived: boolean;
}

export function mapTask(row: TaskRow): TaskRecord {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description ?? ""),
    deadlineIso: row.deadline_iso ? String(row.deadline_iso) : null,
    priority: String(row.priority),
    status: String(row.status),
    progress: Number(row.progress ?? 0),
    recurring: Boolean(row.recurring),
    recurrence: row.recurrence ? String(row.recurrence) : null,
    notifyTelegram: Boolean(row.notify_telegram),
    topicId: row.topic_id == null ? null : Number(row.topic_id),
    createdByEmployeeId: Number(row.created_by_employee_id),
    archived: Boolean(row.archived),
  };
}

/** `app_task_assignments` as stored. */
export interface AssignmentRow {
  id: number;
  task_id: number;
  employee_id: number;
  assigned_by_employee_id: number;
  parent_assignment_id: number | null;
  assignment_status: string;
  progress: number | null;
}

export interface AssignmentRecord {
  id: number;
  taskId: number;
  employeeId: number;
  assignedByEmployeeId: number;
  parentAssignmentId: number | null;
  status: string;
  progress: number;
}

export function mapAssignment(row: AssignmentRow): AssignmentRecord {
  return {
    id: Number(row.id),
    taskId: Number(row.task_id),
    employeeId: Number(row.employee_id),
    assignedByEmployeeId: Number(row.assigned_by_employee_id),
    parentAssignmentId: row.parent_assignment_id == null ? null : Number(row.parent_assignment_id),
    status: String(row.assignment_status),
    progress: Number(row.progress ?? 0),
  };
}

/** `app_attachments` as stored. */
export interface AttachmentRow {
  id: number;
  task_id: number;
  object_key: string;
  file_name: string;
  content_type: string | null;
  size: number | null;
  uploaded_by_employee_id: number;
  created_at: string;
}

export interface AttachmentRecord {
  id: number;
  taskId: number;
  objectKey: string;
  fileName: string;
  contentType: string | null;
  size: number;
  uploadedByEmployeeId: number;
  createdAt: string;
}

export function mapAttachment(row: AttachmentRow): AttachmentRecord {
  return {
    id: Number(row.id),
    taskId: Number(row.task_id),
    objectKey: String(row.object_key),
    fileName: String(row.file_name),
    contentType: row.content_type ? String(row.content_type) : null,
    size: Number(row.size ?? 0),
    uploadedByEmployeeId: Number(row.uploaded_by_employee_id),
    createdAt: String(row.created_at),
  };
}

/** `app_meetings` as stored. */
export interface MeetingRow {
  id: number;
  title: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string | null;
  place: string;
  format: string;
  reminder_minutes: number;
  notify_telegram: number;
  created_by_employee_id: number;
  created_at: string;
}

export interface MeetingRecord {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string | null;
  place: string;
  format: string;
  reminderMinutes: number;
  notifyTelegram: boolean;
  createdByEmployeeId: number;
}

export function mapMeeting(row: MeetingRow): MeetingRecord {
  return {
    id: Number(row.id),
    title: String(row.title),
    startsAt: String(row.starts_at),
    endsAt: row.ends_at ? String(row.ends_at) : null,
    place: String(row.place),
    format: String(row.format),
    reminderMinutes: Number(row.reminder_minutes),
    notifyTelegram: Boolean(row.notify_telegram),
    createdByEmployeeId: Number(row.created_by_employee_id),
  };
}

/** Everything a task policy needs to decide, loaded once per request. */
export interface TaskContext {
  task: TaskRecord;
  /** The actor may see the task (view scope, or participation for Telegram). */
  visible: boolean;
  /** The actor's own assignment on this task, if any. */
  assignment: AssignmentRecord | null;
  /** The actor belongs to one of the task's audiences (never true for the creator). */
  audienceMember: boolean;
}
