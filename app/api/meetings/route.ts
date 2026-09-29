import { getD1 } from "../../../db";
import { type Actor, apiError, assertSameOrigin, audit, employeeIdsInScopes, requireActor } from "../../../lib/auth";
import { runInBackground } from "../../../lib/background";
import { listMeetingsPage } from "../../../lib/data";
import {
  enqueueMeetingAudienceNotifications,
  enqueueMeetingChangeNotifications,
  enqueueMeetingNotifications,
  processNotificationJobs,
} from "../../../lib/telegram";
import { authorizeAudiences } from "../../../lib/audiences";
import { authorize } from "../../../lib/policy";
import { meetingCreate, meetingDelete, meetingUpdate } from "../../../lib/policy/meetings";
import { MEETING_FORMATS, createMeeting, deleteMeeting, loadMeeting, updateMeeting } from "../../../services/meetings";

async function validateParticipants(actor: Actor, participantIds: number[]) {
  if (!participantIds.length) throw new Error("Kamida bitta ishtirokchini tanlang");
  const externalIds = participantIds.filter((id) => id !== actor.id);
  if (!(await employeeIdsInScopes(actor, externalIds, [actor.permissions.viewScope, actor.permissions.assignScope]))) {
    throw new Error("Noma’lum yoki faol bo‘lmagan ishtirokchi tanlandi");
  }
}

function meetingValidationError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return ["Kamida bitta ishtirokchini tanlang", "Noma’lum yoki faol bo‘lmagan ishtirokchi tanlandi"].includes(message)
    ? Response.json({ error: message }, { status: 400 })
    : null;
}

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const url = new URL(request.url);
    const page = await listMeetingsPage(actor, {
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
      offset: Number(url.searchParams.get("offset") ?? 0),
      limit: Number(url.searchParams.get("limit") ?? 0),
    });
    return Response.json(page, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(meetingCreate(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const title = String(payload.title ?? "").trim();
    const place = String(payload.place ?? "").trim();
    const startsAt = new Date(String(payload.startsAt ?? ""));
    const endsAt = payload.endsAt ? new Date(String(payload.endsAt)) : null;
    const participantIds = Array.from(
      new Set([
        actor.id,
        ...(Array.isArray(payload.participantIds) ? payload.participantIds.map(Number).filter(Boolean) : []),
      ]),
    );
    const audiences = await authorizeAudiences(actor, payload.audiences, [
      actor.permissions.viewScope,
      actor.permissions.assignScope,
    ]);
    if (
      title.length < 3 ||
      title.length > 240 ||
      place.length < 2 ||
      place.length > 500 ||
      Number.isNaN(startsAt.getTime())
    ) {
      return Response.json({ error: "Yig‘ilish mavzusi, vaqti va joyi to‘liq kiritilishi kerak" }, { status: 400 });
    }
    if (endsAt && (Number.isNaN(endsAt.getTime()) || endsAt <= startsAt)) {
      return Response.json(
        { error: "Yig‘ilish tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak" },
        { status: 400 },
      );
    }
    if (startsAt <= new Date())
      return Response.json({ error: "Yig‘ilish vaqti kelajak vaqtga belgilanadi" }, { status: 400 });
    await validateParticipants(actor, participantIds);
    const requestedReminder = Number(payload.reminderMinutes ?? 30);
    if (!Number.isFinite(requestedReminder))
      return Response.json({ error: "Eslatma vaqti noto‘g‘ri" }, { status: 400 });
    const reminderMinutes = Math.round(Math.max(0, Math.min(10080, requestedReminder)));
    const meetingId = await createMeeting(await getD1(), actor.id, {
      title,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt?.toISOString() ?? null,
      place,
      format: MEETING_FORMATS.has(String(payload.format)) ? String(payload.format) : "Oflayn",
      reminderMinutes,
      notifyTelegram: payload.notifyTelegram !== false,
      participantIds,
      audiences,
    });
    if (payload.notifyTelegram !== false) {
      runInBackground(async () => {
        await enqueueMeetingNotifications(
          { id: meetingId, title, startsAt: startsAt.toISOString(), place, reminderMinutes },
          participantIds,
        );
        if (audiences.length)
          await enqueueMeetingAudienceNotifications({
            id: meetingId,
            title,
            startsAt: startsAt.toISOString(),
            place,
            reminderMinutes,
          });
        await processNotificationJobs(10);
      });
    }
    await audit(actor, "meeting.created", "meeting", meetingId, {
      participantIds,
      audiences,
      startsAt: startsAt.toISOString(),
    });
    const [meeting] = (await listMeetingsPage(actor, { meetingId })).meetings;
    return Response.json({ meeting }, { status: 201 });
  } catch (error) {
    const validation = meetingValidationError(error);
    if (validation) return validation;
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(meetingCreate(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const id = Number(payload.id);
    if (!id) return Response.json({ error: "Yig‘ilish ID majburiy" }, { status: 400 });
    const db = await getD1();
    const current = await loadMeeting(db, id);
    await authorize(meetingUpdate(actor, current));
    if (!current) return Response.json({ error: "Yig‘ilish topilmadi" }, { status: 404 });

    const title = String(payload.title ?? current.title).trim();
    const place = String(payload.place ?? current.place).trim();
    const startsAt = payload.startsAt ? new Date(String(payload.startsAt)) : new Date(current.startsAt);
    const endsAt =
      payload.endsAt === null
        ? null
        : payload.endsAt
          ? new Date(String(payload.endsAt))
          : current.endsAt
            ? new Date(current.endsAt)
            : null;
    const participantIds = Array.from(
      new Set([
        current.createdByEmployeeId,
        ...(Array.isArray(payload.participantIds) ? payload.participantIds.map(Number).filter(Boolean) : []),
      ]),
    );
    const audiences = await authorizeAudiences(actor, payload.audiences, [
      actor.permissions.viewScope,
      actor.permissions.assignScope,
    ]);
    if (
      title.length < 3 ||
      title.length > 240 ||
      place.length < 2 ||
      place.length > 500 ||
      Number.isNaN(startsAt.getTime())
    ) {
      return Response.json({ error: "Yig‘ilish mavzusi, vaqti va joyi to‘liq kiritilishi kerak" }, { status: 400 });
    }
    if (startsAt <= new Date())
      return Response.json({ error: "Yig‘ilish vaqti kelajak vaqtga belgilanadi" }, { status: 400 });
    if (endsAt && (Number.isNaN(endsAt.getTime()) || endsAt <= startsAt)) {
      return Response.json(
        { error: "Yig‘ilish tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak" },
        { status: 400 },
      );
    }
    await validateParticipants(actor, participantIds);
    const requestedReminder = Number(payload.reminderMinutes ?? current.reminderMinutes);
    if (!Number.isFinite(requestedReminder))
      return Response.json({ error: "Eslatma vaqti noto‘g‘ri" }, { status: 400 });
    const reminderMinutes = Math.round(Math.max(0, Math.min(10080, requestedReminder)));
    const notifyTelegram = payload.notifyTelegram == null ? current.notifyTelegram : Boolean(payload.notifyTelegram);
    const format = MEETING_FORMATS.has(String(payload.format)) ? String(payload.format) : current.format;
    const removedIds = await updateMeeting(db, current, actor.id, {
      title,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt?.toISOString() ?? null,
      place,
      format,
      reminderMinutes,
      notifyTelegram,
      participantIds,
      audiences,
    });
    const meeting = { id, title, startsAt: startsAt.toISOString(), place, reminderMinutes };
    if (notifyTelegram) {
      runInBackground(async () => {
        if (removedIds.length) await enqueueMeetingChangeNotifications(meeting, removedIds, "removed");
        await enqueueMeetingChangeNotifications(meeting, participantIds, "updated");
        await enqueueMeetingNotifications(meeting, participantIds);
        if (audiences.length) await enqueueMeetingAudienceNotifications(meeting);
        await processNotificationJobs(20);
      });
    }
    await audit(actor, "meeting.updated", "meeting", id, {
      participantIds,
      audiences,
      startsAt: startsAt.toISOString(),
    });
    return Response.json({ ok: true });
  } catch (error) {
    const validation = meetingValidationError(error);
    if (validation) return validation;
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(meetingCreate(actor));
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "Yig‘ilish ID majburiy" }, { status: 400 });
    const meeting = await loadMeeting(await getD1(), id);
    await authorize(meetingDelete(actor, meeting));
    if (!meeting) return Response.json({ error: "Yig‘ilish topilmadi" }, { status: 404 });
    const participantIds = await deleteMeeting(await getD1(), meeting);
    if (meeting.notifyTelegram && participantIds.length) {
      runInBackground(async () => {
        await enqueueMeetingChangeNotifications(
          {
            id,
            title: meeting.title,
            startsAt: meeting.startsAt,
            place: meeting.place,
          },
          participantIds,
          "cancelled",
        );
        await processNotificationJobs(20);
      });
    }
    await audit(actor, "meeting.deleted", "meeting", id, { participantIds, startsAt: meeting.startsAt });
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
