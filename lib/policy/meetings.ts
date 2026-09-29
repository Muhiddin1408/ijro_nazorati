import type { Actor } from "../auth";
import { canMutateMeeting } from "../mutation-authority";
import type { MeetingRecord } from "../../services/task-rows";
import { all, deny, when, type Decision } from "./index";

type MeetingActor = Pick<Actor, "id" | "permissions">;

export function meetingCreate(actor: MeetingActor): Decision {
  return when(actor.permissions.canCreateMeeting, "Bu amal uchun vakolatingiz yetarli emas");
}

/**
 * Past meetings are a record: there are no minutes-type fields, so a meeting
 * that has started can be neither edited (by anyone) nor deleted — except by a
 * system configurator (canConfigure) cleaning up mistakes.
 */
function started(meeting: MeetingRecord, now: Date) {
  return new Date(meeting.startsAt).getTime() <= now.getTime();
}

/** The organizer (or a role manager) changes a meeting; creating rights are still required. */
export function meetingUpdate(actor: MeetingActor, meeting: MeetingRecord | null, now = new Date()): Decision {
  if (!meeting) return all(meetingCreate(actor), deny("Yig‘ilish topilmadi", 404));
  return all(
    meetingCreate(actor),
    when(
      canMutateMeeting(actor, meeting.createdByEmployeeId),
      "Yig‘ilishni faqat tashkilotchi yoki tizim administratori o‘zgartira oladi",
    ),
    when(!started(meeting, now), "Boshlangan yoki o‘tgan yig‘ilishni o‘zgartirib bo‘lmaydi", 409),
  );
}

export function meetingDelete(actor: MeetingActor, meeting: MeetingRecord | null, now = new Date()): Decision {
  if (!meeting) return all(meetingCreate(actor), deny("Yig‘ilish topilmadi", 404));
  return all(
    meetingCreate(actor),
    when(
      canMutateMeeting(actor, meeting.createdByEmployeeId),
      "Yig‘ilishni faqat tashkilotchi yoki tizim administratori bekor qila oladi",
    ),
    when(!started(meeting, now) || actor.permissions.canConfigure, "O‘tgan yig‘ilishni o‘chirib bo‘lmaydi", 409),
  );
}
