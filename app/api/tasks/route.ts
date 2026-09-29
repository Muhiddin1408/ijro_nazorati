import { getD1 } from "../../../db";
import {
  type Actor,
  apiError,
  assertSameOrigin,
  audit,
  canAccessTask,
  employeeIdsInScopes,
  requireActor,
} from "../../../lib/auth";
import { listTasks, listTasksPage, taskListOptionsFromUrl } from "../../../lib/data";
import { runInBackground } from "../../../lib/background";
import { authorizeAudiences } from "../../../lib/audiences";
import { authorize } from "../../../lib/policy";
import {
  taskAccept,
  taskArchive,
  taskAssignees,
  taskCreate,
  taskEdit,
  taskForward,
  taskPin,
  taskReturn,
  taskUpdateProgress,
} from "../../../lib/policy/tasks";
import {
  enqueueTaskAudienceNotifications,
  enqueueTaskChangeNotifications,
  enqueueTaskNotifications,
  enqueueTaskReviewRequested,
  processNotificationJobs,
} from "../../../lib/telegram";
import {
  MAX_DIRECT_ASSIGNEES,
  TASK_PRIORITIES,
  TASK_RECURRENCES,
  acceptTask,
  archiveTask,
  createTask,
  forwardTask,
  loadTaskContext,
  reportTaskProgress,
  returnTask,
  setTaskPin,
  updateTaskDetails,
} from "../../../services/tasks";
import { TASK_DONE, TASK_REVIEW } from "../../../services/task-rows";

type Payload = Record<string, unknown>;

function employeeIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0)));
}

function optionalPositiveInteger(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

async function activeTopic(db: D1Database, topicId: number | null) {
  return (
    !topicId ||
    Boolean(await db.prepare("SELECT id FROM app_task_topics WHERE id=? AND active=1").bind(topicId).first())
  );
}

export async function GET(request: Request) {
  try {
    const page = await listTasksPage(await requireActor(), taskListOptionsFromUrl(new URL(request.url)));
    return Response.json(page, {
      headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(taskCreate(actor));
    const payload = (await request.json()) as Payload;
    const title = String(payload.title ?? "").trim();
    const assigneeIds = employeeIds(payload.assigneeIds);
    const audiences = await authorizeAudiences(actor, payload.audiences, [actor.permissions.assignScope]);
    if (title.length < 3 || title.length > 240)
      return badRequest("Topshiriq nomi 3–240 belgidan iborat bo‘lishi kerak");
    if (!assigneeIds.length && !audiences.length)
      return badRequest("Kamida bitta ijrochi, bo‘lim yoki tashkilotni tanlang");
    if (assigneeIds.length > MAX_DIRECT_ASSIGNEES)
      return badRequest(
        `Bitta topshiriqqa ko‘pi bilan ${MAX_DIRECT_ASSIGNEES} ta bevosita ijrochi tanlang; katta qamrov uchun tashkilot yoki bo‘limni belgilang`,
      );
    await authorize(
      taskAssignees(actor, assigneeIds, await employeeIdsInScopes(actor, assigneeIds, [actor.permissions.assignScope])),
    );

    const deadline = payload.deadlineIso ? new Date(String(payload.deadlineIso)) : null;
    if (deadline && Number.isNaN(deadline.getTime())) return badRequest("Muddat sanasi noto‘g‘ri");
    if (deadline && deadline <= new Date()) return badRequest("Topshiriq muddati kelajak vaqtga belgilanadi");
    const priority = TASK_PRIORITIES.has(String(payload.priority)) ? String(payload.priority) : "O‘rta";
    const topicId = optionalPositiveInteger(payload.topicId);
    if (Number.isNaN(topicId)) return badRequest("Topshiriq tematikasi noto‘g‘ri");
    const db = await getD1();
    if (!(await activeTopic(db, topicId))) return badRequest("Tanlangan tematika mavjud emas yoki faol emas");
    const recurring = Boolean(payload.recurring);
    const recurrence = TASK_RECURRENCES.has(String(payload.recurrence)) ? String(payload.recurrence) : "Har hafta";
    if (recurring && !deadline) return badRequest("Davomiy topshiriq uchun birinchi muddatni kiriting");
    const deadlineIso = deadline?.toISOString() ?? null;
    const notifyTelegram = payload.notifyTelegram !== false;
    const taskId = await createTask(db, actor.id, {
      title,
      description: String(payload.description ?? "")
        .trim()
        .slice(0, 5000),
      deadlineIso,
      priority,
      recurring,
      recurrence,
      notifyTelegram,
      topicId,
      assigneeIds,
      audiences,
      pinned: Boolean(payload.pinned),
      routeNote: String(payload.routeNote ?? "")
        .trim()
        .slice(0, 1000),
    });
    if (notifyTelegram) {
      runInBackground(async () => {
        await enqueueTaskNotifications(
          { id: taskId, title, deadlineIso, priority },
          [...assigneeIds, actor.id],
          actor.id,
        );
        if (audiences.length) await enqueueTaskAudienceNotifications({ id: taskId, title, deadlineIso, priority });
        await processNotificationJobs(10);
      });
    }
    await audit(actor, "task.created", "task", taskId, { assigneeIds, audiences, priority, recurring, topicId });
    const [task] = await listTasks(actor, { taskId });
    return Response.json(
      {
        task,
        recipientSummary: { employees: assigneeIds.length, audiences: audiences.length },
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}

async function updateDetails(db: D1Database, actor: Actor, taskId: number, payload: Payload) {
  const ctx = await loadTaskContext(db, taskId, actor.id, () => canAccessTask(actor, taskId));
  await authorize(taskEdit(actor, ctx));
  const current = ctx!.task;
  const title = String(payload.title ?? current.title).trim();
  const description = String(payload.description ?? current.description)
    .trim()
    .slice(0, 5000);
  const priority = TASK_PRIORITIES.has(String(payload.priority)) ? String(payload.priority) : current.priority;
  const topicId = payload.topicId === undefined ? current.topicId : optionalPositiveInteger(payload.topicId);
  if (Number.isNaN(topicId)) return badRequest("Topshiriq tematikasi noto‘g‘ri");
  if (!(await activeTopic(db, topicId))) return badRequest("Tanlangan tematika mavjud emas yoki faol emas");
  const deadline =
    payload.deadlineIso === null
      ? null
      : payload.deadlineIso
        ? new Date(String(payload.deadlineIso))
        : current.deadlineIso
          ? new Date(current.deadlineIso)
          : null;
  if (title.length < 3 || title.length > 240) return badRequest("Topshiriq nomi 3–240 belgidan iborat bo‘lishi kerak");
  if (deadline && Number.isNaN(deadline.getTime())) return badRequest("Topshiriq muddati noto‘g‘ri");
  // Only a newly set deadline must lie in the future; an overdue task stays editable.
  const deadlineChanged =
    (deadline?.toISOString() ?? null) !== (current.deadlineIso ? new Date(current.deadlineIso).toISOString() : null);
  if (deadline && deadlineChanged && deadline <= new Date())
    return badRequest("Topshiriq muddati kelajak vaqtga belgilanadi");
  const recurring = payload.recurring == null ? current.recurring : Boolean(payload.recurring);
  const recurrence = TASK_RECURRENCES.has(String(payload.recurrence))
    ? String(payload.recurrence)
    : (current.recurrence ?? "Har hafta");
  if (recurring && !deadline) return badRequest("Davomiy topshiriq uchun muddat majburiy");
  const notifyTelegram = payload.notifyTelegram == null ? current.notifyTelegram : Boolean(payload.notifyTelegram);
  const deadlineIso = deadline?.toISOString() ?? null;
  const { recipients, hasAudiences } = await updateTaskDetails(db, ctx!, {
    title,
    description,
    deadlineIso,
    priority,
    topicId,
    recurring,
    recurrence,
    notifyTelegram,
  });
  if (notifyTelegram) {
    runInBackground(async () => {
      await enqueueTaskChangeNotifications({ id: taskId, title, deadlineIso, priority }, recipients);
      await enqueueTaskNotifications(
        { id: taskId, title, deadlineIso, priority },
        recipients,
        current.createdByEmployeeId,
      );
      // Edits cancel queued jobs; audience reminders are recreated for the new deadline.
      if (hasAudiences) await enqueueTaskAudienceNotifications({ id: taskId, title, deadlineIso, priority });
      await processNotificationJobs(10);
    });
  }
  await audit(actor, "task.updated", "task", taskId, { title, deadlineIso, priority, recurring, topicId });
  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const payload = (await request.json()) as Payload;
    const taskId = Number(payload.id);
    const action = String(payload.action ?? "update");
    if (!taskId) return badRequest("Topshiriq ID majburiy");
    const db = await getD1();
    const loadContext = () => loadTaskContext(db, taskId, actor.id, () => canAccessTask(actor, taskId));

    if (action === "pin") {
      await authorize(taskPin(actor, await loadContext()));
      await setTaskPin(db, taskId, actor.id, Boolean(payload.pinned));
      return Response.json({ ok: true });
    }

    if (action === "progress") {
      const ctx = await loadContext();
      await authorize(taskUpdateProgress(actor, ctx));
      const requested = Number(payload.progress);
      if (!Number.isFinite(requested)) return badRequest("Bajarilish foizi noto‘g‘ri");
      const submitAll = String(payload.status) === TASK_REVIEW;
      const result = await reportTaskProgress(
        db,
        ctx!,
        actor.id,
        () => (submitAll ? 100 : requested),
        "Tashkilot yoki bo‘lim auditoriyasi orqali",
      );
      if (result.submitted && ctx!.task.createdByEmployeeId !== actor.id && ctx!.task.notifyTelegram) {
        const task = { id: taskId, title: ctx!.task.title, creatorEmployeeId: ctx!.task.createdByEmployeeId };
        runInBackground(async () => {
          await enqueueTaskReviewRequested(task, actor.id);
          await processNotificationJobs(10);
        });
      }
      await audit(actor, result.submitted ? "task.submitted" : "task.progress", "task", taskId, {
        progress: result.progress,
        status: result.assignmentStatus,
      });
      return Response.json({ ok: true, status: result.taskStatus });
    }

    if (action === "accept") {
      const ctx = await loadContext();
      await authorize(taskAccept(actor, ctx));
      const note = String(payload.note ?? "")
        .trim()
        .slice(0, 1000);
      const next = await acceptTask(db, ctx!);
      if (next?.created && next.notifyTelegram && (next.employeeIds.length || next.hasAudiences)) {
        runInBackground(async () => {
          await enqueueTaskNotifications(next, [...next.employeeIds, next.creatorEmployeeId], next.creatorEmployeeId);
          if (next.hasAudiences) await enqueueTaskAudienceNotifications(next);
          await processNotificationJobs(10);
        });
      }
      await audit(actor, "task.accepted", "task", taskId, { note });
      return Response.json({ ok: true, status: TASK_DONE });
    }

    if (action === "return") {
      const ctx = await loadContext();
      await authorize(taskReturn(actor, ctx));
      const note = String(payload.note ?? "")
        .trim()
        .slice(0, 1000);
      const result = await returnTask(db, ctx!, actor.id, note);
      await audit(actor, "task.returned", "task", taskId, { note, employeeIds: result.employeeIds });
      return Response.json({ ok: true, status: result.status });
    }

    if (action === "update") return await updateDetails(db, actor, taskId, payload);

    if (action === "forward") {
      const ctx = await loadContext();
      await authorize(taskForward(actor, ctx));
      const assigneeIds = employeeIds(payload.assigneeIds);
      if (!assigneeIds.length) return badRequest("Yo‘naltirish uchun ijrochini tanlang");
      if (assigneeIds.length > MAX_DIRECT_ASSIGNEES)
        return badRequest(`Bir urinishda ko‘pi bilan ${MAX_DIRECT_ASSIGNEES} ta ijrochini tanlang`);
      await authorize(
        taskAssignees(
          actor,
          assigneeIds,
          await employeeIdsInScopes(actor, assigneeIds, [actor.permissions.assignScope]),
          "Tanlangan ijrochi vakolatingiz doirasiga kirmaydi",
        ),
      );
      const note = String(payload.note ?? "")
        .trim()
        .slice(0, 1000);
      await forwardTask(db, ctx!, actor.id, assigneeIds, note);
      const task = ctx!.task;
      if (task.notifyTelegram) {
        runInBackground(async () => {
          await enqueueTaskNotifications(
            { id: taskId, title: task.title, deadlineIso: task.deadlineIso, priority: task.priority },
            [...new Set([...assigneeIds, actor.id, task.createdByEmployeeId].filter(Boolean))],
            task.createdByEmployeeId,
          );
          await processNotificationJobs(10);
        });
      }
      await audit(actor, "task.forwarded", "task", taskId, { assigneeIds, note });
      return Response.json({ ok: true });
    }

    if (action === "archive") {
      await authorize(taskArchive(actor, await loadContext()));
      await archiveTask(db, taskId);
      await audit(actor, "task.archived", "task", taskId);
      return Response.json({ ok: true });
    }

    return badRequest("Noma’lum amal");
  } catch (error) {
    return apiError(error);
  }
}
