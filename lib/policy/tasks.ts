import type { PermissionSet } from "../auth";
import { TASK_DONE, type AttachmentRecord, type TaskContext } from "../../services/task-rows";
import { ALLOW, all, deny, when, type Decision } from "./index";

/**
 * Who is acting on a task. Web requests pass the full Actor; the Telegram bot
 * passes the linked employee with no elevated permissions (it may only submit).
 */
export type TaskActor = {
  id: number;
  permissions: Pick<PermissionSet, "canCreateTask" | "canUpdateAnyTask">;
};

const isCreator = (actor: TaskActor, ctx: TaskContext) => ctx.task.createdByEmployeeId === actor.id;
const managesTask = (actor: TaskActor, ctx: TaskContext) => isCreator(actor, ctx) || actor.permissions.canUpdateAnyTask;

export function taskCreate(actor: TaskActor): Decision {
  return when(actor.permissions.canCreateTask, "Bu amal uchun vakolatingiz yetarli emas");
}

/**
 * Direct assignees must be inside the actor's assign scope (`inScope`, computed
 * by the caller) and never the actor themself.
 */
export function taskAssignees(actor: TaskActor, assigneeIds: number[], inScope: boolean, message = "Tanlangan ijrochilardan biri vakolatingiz doirasiga kirmaydi"): Decision {
  return when(!assigneeIds.includes(actor.id) && inScope, message);
}

export function taskView(_actor: TaskActor, ctx: TaskContext | null): Decision {
  return ctx?.visible ? ALLOW : deny("Topshiriq topilmadi", 404);
}

function notArchived(ctx: TaskContext): Decision {
  return when(!ctx.task.archived, "Arxivlangan topshiriqni o‘zgartirib bo‘lmaydi", 409);
}

/** Pinning is personal and stays available on archived tasks. */
export function taskPin(actor: TaskActor, ctx: TaskContext | null): Decision {
  return taskView(actor, ctx);
}

/**
 * Executors (direct or audience members) report progress and submit for
 * review. The task giver cannot enrol through an audience to close their own task.
 */
export function taskUpdateProgress(actor: TaskActor, ctx: TaskContext | null): Decision {
  if (!ctx) return taskView(actor, ctx);
  return all(
    taskView(actor, ctx),
    notArchived(ctx),
    when(ctx.task.status !== TASK_DONE, "Topshiriq allaqachon qabul qilingan", 409),
    when(Boolean(ctx.assignment) || (ctx.audienceMember && !isCreator(actor, ctx)), "Faqat o‘zingizga biriktirilgan topshiriq ijrosini yangilashingiz mumkin"),
  );
}

export const taskSubmit = taskUpdateProgress;

/** Only the task giver (or canUpdateAnyTask) closes a task. */
export function taskAccept(actor: TaskActor, ctx: TaskContext | null): Decision {
  if (!ctx) return taskView(actor, ctx);
  return all(
    taskView(actor, ctx),
    notArchived(ctx),
    when(managesTask(actor, ctx), "Ijroni faqat topshiriq beruvchi yoki vakolatli rahbar qabul qiladi"),
    when(ctx.task.status !== TASK_DONE, "Topshiriq allaqachon qabul qilingan", 409),
  );
}

export const taskReturn = taskAccept;

export function taskEdit(actor: TaskActor, ctx: TaskContext | null): Decision {
  if (!ctx) return taskView(actor, ctx);
  return all(
    taskView(actor, ctx),
    notArchived(ctx),
    when(managesTask(actor, ctx), "Topshiriq ma’lumotlarini faqat topshiriq beruvchi yoki vakolatli rahbar o‘zgartira oladi"),
    when(ctx.task.status !== TASK_DONE, "Bajarilgan topshiriq ma’lumotlarini o‘zgartirib bo‘lmaydi", 409),
  );
}

export function taskForward(actor: TaskActor, ctx: TaskContext | null): Decision {
  if (!ctx) return taskView(actor, ctx);
  return all(
    taskView(actor, ctx),
    notArchived(ctx),
    taskCreate(actor),
    when(
      managesTask(actor, ctx) || Boolean(ctx.assignment),
      "Topshiriqni faqat topshiriq beruvchi, joriy ijrochi yoki vakolatli rahbar yo‘naltira oladi",
    ),
  );
}

export function taskArchive(actor: TaskActor, ctx: TaskContext | null): Decision {
  if (!ctx) return taskView(actor, ctx);
  return all(
    taskView(actor, ctx),
    notArchived(ctx),
    when(actor.permissions.canUpdateAnyTask, "Arxivlash uchun vakolat yetarli emas"),
  );
}

export function fileDownload(actor: TaskActor, ctx: TaskContext | null): Decision {
  return ctx?.visible ? ALLOW : deny("Fayl topilmadi", 404);
}

/** Participants (giver, executors) and task managers attach files to open tasks. */
export function fileUpload(actor: TaskActor, ctx: TaskContext | null): Decision {
  if (!ctx) return taskView(actor, ctx);
  return all(
    taskView(actor, ctx),
    notArchived(ctx),
    when(
      managesTask(actor, ctx) || Boolean(ctx.assignment),
      "Bu topshiriqqa fayl yuklash vakolatingiz yo‘q",
    ),
  );
}

/**
 * Evidence stays once a task is accepted or archived. Before that, only the
 * uploader (or canUpdateAnyTask) removes a file.
 */
export function fileDelete(actor: TaskActor, ctx: TaskContext | null, attachment: AttachmentRecord | null): Decision {
  if (!ctx || !attachment) return deny("Fayl topilmadi", 404);
  return all(
    fileDownload(actor, ctx),
    when(!ctx.task.archived && ctx.task.status !== TASK_DONE, "Yopilgan yoki arxivlangan topshiriq isbot fayllarini o‘chirib bo‘lmaydi", 409),
    when(actor.permissions.canUpdateAnyTask || attachment.uploadedByEmployeeId === actor.id, "Faqat o‘zingiz yuklagan faylni o‘chira olasiz"),
  );
}
