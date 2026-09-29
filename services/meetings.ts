/** Meeting business operations; authorization is decided by lib/policy/meetings.ts. */
import type { AudienceTarget } from "../lib/audiences";
import { ApiError } from "../lib/errors";
import { mapMeeting, type MeetingRecord, type MeetingRow } from "./task-rows";

export const MEETING_FORMATS = new Set(["Oflayn", "Onlayn", "Aralash"]);

export type MeetingInput = {
  title: string;
  startsAt: string;
  endsAt: string | null;
  place: string;
  format: string;
  reminderMinutes: number;
  notifyTelegram: boolean;
  participantIds: number[];
  audiences: AudienceTarget[];
};

function cancelMeetingJobs(db: D1Database, meetingId: number, reason: string) {
  return db.prepare(
    `UPDATE app_notification_jobs SET status='cancelled', last_error=?
      WHERE entity_type='meeting' AND entity_id=? AND status IN ('pending','failed','waiting_link','processing')`,
  ).bind(reason, meetingId);
}

export async function loadMeeting(db: D1Database, meetingId: number): Promise<MeetingRecord | null> {
  if (!Number.isSafeInteger(meetingId) || meetingId <= 0) return null;
  const row = await db.prepare(
    `SELECT id,title,starts_at,ends_at,timezone,place,format,reminder_minutes,notify_telegram,created_by_employee_id,created_at
       FROM app_meetings WHERE id=?`,
  ).bind(meetingId).first<MeetingRow>();
  return row ? mapMeeting(row) : null;
}

export async function meetingParticipantIds(db: D1Database, meetingId: number) {
  const rows = await db.prepare("SELECT employee_id FROM app_meeting_participants WHERE meeting_id=?")
    .bind(meetingId).all<{ employee_id: number }>();
  return rows.results.map((row) => Number(row.employee_id));
}

/** Meeting, participants and audiences in one transaction (audit Y15). */
export async function createMeeting(db: D1Database, organizerId: number, input: MeetingInput) {
  const creationKey = crypto.randomUUID();
  const meetingIdSql = "(SELECT id FROM app_meetings WHERE creation_key=?)";
  await db.batch([
    db.prepare(
      `INSERT INTO app_meetings
        (title, starts_at, ends_at, place, format, reminder_minutes, notify_telegram, created_by_employee_id, creation_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(input.title, input.startsAt, input.endsAt, input.place, input.format, input.reminderMinutes, input.notifyTelegram ? 1 : 0, organizerId, creationKey),
    ...input.participantIds.map((employeeId) => db.prepare(`INSERT INTO app_meeting_participants (meeting_id, employee_id) VALUES (${meetingIdSql}, ?)`).bind(creationKey, employeeId)),
    ...input.audiences.map((audience) => db.prepare(
      `INSERT INTO app_meeting_audiences (meeting_id,target_type,target_id,include_descendants,created_by_employee_id)
       VALUES (${meetingIdSql},?,?,?,?)`,
    ).bind(creationKey, audience.targetType, audience.targetId, audience.includeDescendants ? 1 : 0, organizerId)),
  ]);
  const created = await db.prepare("SELECT id FROM app_meetings WHERE creation_key=?").bind(creationKey).first<{ id: number }>();
  if (!created) throw new ApiError(500, "Yig‘ilish saqlanmadi");
  return Number(created.id);
}

/** Replaces fields, participants and audiences; returns participants who were removed. */
export async function updateMeeting(db: D1Database, meeting: MeetingRecord, actorId: number, input: MeetingInput) {
  const previousIds = await meetingParticipantIds(db, meeting.id);
  const removedIds = previousIds.filter((employeeId) => !input.participantIds.includes(employeeId));
  await db.batch([
    db.prepare(
      `UPDATE app_meetings SET title=?, starts_at=?, ends_at=?, place=?, format=?, reminder_minutes=?,
        notify_telegram=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    ).bind(input.title, input.startsAt, input.endsAt, input.place, input.format, input.reminderMinutes, input.notifyTelegram ? 1 : 0, meeting.id),
    db.prepare("DELETE FROM app_meeting_participants WHERE meeting_id=?").bind(meeting.id),
    db.prepare("DELETE FROM app_meeting_audiences WHERE meeting_id=?").bind(meeting.id),
    ...input.participantIds.map((employeeId) => db.prepare(
      "INSERT INTO app_meeting_participants (meeting_id, employee_id) VALUES (?, ?)",
    ).bind(meeting.id, employeeId)),
    ...input.audiences.map((audience) => db.prepare(
      `INSERT INTO app_meeting_audiences (meeting_id,target_type,target_id,include_descendants,created_by_employee_id)
       VALUES (?,?,?,?,?)`,
    ).bind(meeting.id, audience.targetType, audience.targetId, audience.includeDescendants ? 1 : 0, actorId)),
    cancelMeetingJobs(db, meeting.id, "Yig‘ilish yangilandi"),
  ]);
  return removedIds;
}

/** Deletes the meeting and returns who should hear it was cancelled. */
export async function deleteMeeting(db: D1Database, meeting: MeetingRecord) {
  const participantIds = await meetingParticipantIds(db, meeting.id);
  await db.batch([
    cancelMeetingJobs(db, meeting.id, "Yig‘ilish bekor qilindi"),
    db.prepare("DELETE FROM app_meeting_participants WHERE meeting_id=?").bind(meeting.id),
    db.prepare("DELETE FROM app_meeting_audiences WHERE meeting_id=?").bind(meeting.id),
    db.prepare("DELETE FROM app_meetings WHERE id=?").bind(meeting.id),
  ]);
  return participantIds;
}
