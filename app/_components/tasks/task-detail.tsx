"use client";

import {
  Activity,
  Archive,
  Building2,
  CalendarClock,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  Download,
  FileText,
  Paperclip,
  Pencil,
  Save,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import { useState } from "react";
import { ModalFrame, ModalHeader, readJson } from "../../dashboard-kit";
import { avatarColor, formatDateTime, humanSize, initials } from "../../ui-helpers";
import type { ModalOrganization, ModalDepartment, ModalEmployee, ModalTask } from "./task-meeting-types";
import { patchTask, deadlineLabel, EmptyMini } from "./task-helpers";
import { PeoplePicker } from "./people-picker";
import { confirmDialog } from "../ui/confirm-dialog";
import { useDashboard } from "../dashboard/dashboard-context";
import { useI18n } from "../../../lib/i18n";

export function TaskDetail({
  task,
  assignableEmployees,
  organizations,
  departments,
  onClose,
  onEdit,
}: {
  task: ModalTask;
  assignableEmployees: ModalEmployee[];
  organizations: ModalOrganization[];
  departments: ModalDepartment[];
  onClose: () => void;
  onEdit: () => void;
}) {
  const { t, tx } = useI18n();
  const { actor, notify, refresh, run } = useDashboard();
  const onChanged = async (message: string) => {
    await refresh();
    notify(message);
  };
  const onFailed = (message: string) => notify(message, "error");
  const onArchive = async () => {
    if (
      !(await confirmDialog({
        title: t("Topshiriqni arxivlash"),
        message: t("“{title}” topshirig‘ini arxivlaysizmi?", { title: tx(task.title) }),
        confirmLabel: t("Arxivlash"),
        tone: "danger",
      }))
    )
      return;
    void run(() => patchTask(task.id, { action: "archive" }), "Topshiriq arxivlandi");
  };
  const ownAssignment = task.assignments.find((item) => item.employeeId === actor.id);
  const isCreator = task.creator.id === actor.id;
  const closed = task.status === "Bajarildi";
  // Evidence and routing are frozen once a task is accepted or archived (the server answers 409).
  const locked = closed || ("archived" in task && Boolean(task.archived));
  // Executors report and submit; only the task giver (or canUpdateAnyTask) accepts.
  const canUpdate = !closed && Boolean(ownAssignment || (task.claimableByActor && !isCreator));
  const canEdit = isCreator || actor.permissions.canUpdateAnyTask;
  const canReview = canEdit && !closed;
  const awaitingReview =
    task.status === "Ko‘rib chiqilmoqda" || task.assignments.some((item) => item.status === "Ko‘rib chiqilmoqda");
  const canUploadFile = Boolean(ownAssignment || canEdit);
  const [progress, setProgress] = useState(ownAssignment?.progress ?? task.progress);
  const [reviewNote, setReviewNote] = useState("");
  const [forwardIds, setForwardIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const forwardCandidates = assignableEmployees.filter(
    (employee) => !task.assignments.some((assignment) => assignment.employeeId === employee.id),
  );
  async function perform(action: () => Promise<unknown>, message: string) {
    try {
      setBusy(true);
      await action();
      await onChanged(message);
    } catch (error) {
      onFailed(error instanceof Error ? error.message : "Amal bajarilmadi");
    } finally {
      setBusy(false);
    }
  }
  return (
    <ModalFrame onClose={onClose} wide>
      <ModalHeader
        kicker={t("TOPSHIRIQ #{id}", { id: task.id })}
        title={tx(task.title)}
        subtitle={t("{name} tomonidan {date} da yaratilgan", {
          name: tx(task.creator.name),
          date: formatDateTime(task.createdAt),
        })}
        onClose={onClose}
      />
      <div className="modal-body task-detail-body">
        <div className="task-detail-summary">
          {task.topic ? (
            <span className="topic-badge" style={{ borderColor: task.topic.color, color: task.topic.color }}>
              {tx(task.topic.name)}
            </span>
          ) : null}
          <span className={`priority priority-${task.priority.toLowerCase().replace("‘", "")}`}>
            {t(task.priority ?? "")}
          </span>
          <span className={`status status-${task.status.toLowerCase().replaceAll("‘", "").replaceAll(" ", "-")}`}>
            {t(task.status ?? "")}
          </span>
          <span>
            <CalendarClock size={15} />
            {deadlineLabel(task)}
          </span>
          <span>
            <Activity size={15} />
            {task.progress}%
          </span>
          {canEdit && task.status !== "Bajarildi" ? (
            <button className="secondary-button compact-button" disabled={busy} onClick={onEdit}>
              <Pencil size={14} /> {t("Tahrirlash")}
            </button>
          ) : null}
        </div>
        {task.description ? (
          <article className="detail-section">
            <h3>{t("Topshiriq mazmuni")}</h3>
            <p>{tx(task.description)}</p>
          </article>
        ) : null}
        <article className="detail-section">
          <h3>
            <Users size={17} /> {t("Ijrochilar")}
          </h3>
          <div className="detail-assignees">
            {task.assignments.map((assignment) => (
              <div key={assignment.id}>
                <span className={`person-avatar ${avatarColor(assignment.employeeId)}`}>
                  {initials(assignment.name)}
                </span>
                <span>
                  <strong>{tx(assignment.name)}</strong>
                  <small>
                    {assignment.role} · {tx(assignment.department)}
                  </small>
                </span>
                <em>
                  {assignment.progress}% · {t(assignment.status ?? "")}
                </em>
              </div>
            ))}
            {!task.assignments.length && !task.audiences.length ? (
              <EmptyMini text={t("Ijrochi biriktirilmagan")} />
            ) : null}
          </div>
          {task.audiences.length ? (
            <div className="audience-target-chips detail-audiences">
              {task.audiences.map((audience) => (
                <span key={`${audience.targetType}-${audience.targetId}`}>
                  <i>{audience.targetType === "organization" ? <Building2 size={13} /> : <Users size={13} />}</i>
                  <strong>{tx(audience.targetName)}</strong>
                  {audience.includeDescendants ? <small>{t("+ quyi tuzilma")}</small> : null}
                </span>
              ))}
            </div>
          ) : null}
        </article>
        <article className="detail-section route-section">
          <div className="detail-heading">
            <h3>
              <Activity size={17} /> {t("Topshiriq yo‘nalishi")}
            </h3>
            <span>{t("Faqat ushbu topshiriq tarixi")}</span>
          </div>
          <div className="route-timeline">
            {task.routes.map((route, index) => (
              <div className="route-step" key={route.id}>
                <span className="route-index">{index + 1}</span>
                <div>
                  <strong>{tx(route.fromName)}</strong>
                  <small>{tx(route.fromRole)}</small>
                </div>
                <ChevronRight size={18} />
                <div>
                  <strong>{tx(route.toName)}</strong>
                  <small>{tx(route.toRole)}</small>
                </div>
                <div className="route-meta">
                  <em>{t(route.action ?? "")}</em>
                  <time>{formatDateTime(route.createdAt)}</time>
                  {route.note ? <p>{tx(route.note)}</p> : null}
                </div>
              </div>
            ))}
            {task.routes.length === 0 ? <EmptyMini text={t("Yo‘nalish tarixi hali mavjud emas")} /> : null}
          </div>
        </article>
        <article className="detail-section">
          <div className="detail-heading">
            <h3>
              <Paperclip size={17} /> {t("Biriktirilgan fayllar")}
            </h3>
            <label className="compact-upload">
              <UploadCloud size={15} /> {t("Fayl qo‘shish")}
              <input
                type="file"
                disabled={!canUploadFile || busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.currentTarget.value = "";
                  if (!file) return;
                  if (!file.name.trim() || file.name.length > 255 || file.size <= 0 || file.size > 25 * 1024 * 1024) {
                    onFailed("Fayl 25 MB dan oshmasligi va nomi 255 belgidan qisqa bo‘lishi kerak");
                    return;
                  }
                  void perform(async () => {
                    const upload = new FormData();
                    upload.append("taskId", String(task.id));
                    upload.append("file", file);
                    await readJson(await fetch("/api/files", { method: "POST", body: upload }));
                  }, "Fayl yuklandi");
                }}
              />
            </label>
          </div>
          <div className="attachment-list">
            {task.attachments.map((file) => (
              <div className="attachment-row" key={file.id}>
                <a href={`/api/files?id=${file.id}`}>
                  <FileText size={17} />
                  <span>
                    <strong>{file.fileName}</strong>
                    <small>{humanSize(file.size)}</small>
                  </span>
                  <Download size={15} />
                </a>
                {!locked && (actor.permissions.canUpdateAnyTask || file.uploadedByEmployeeId === actor.id) ? (
                  <button
                    className="icon-button attachment-delete"
                    disabled={busy}
                    aria-label={t("{file} faylini o‘chirish", { file: file.fileName })}
                    onClick={async () => {
                      if (
                        !(await confirmDialog({
                          title: t("Faylni o‘chirish"),
                          message: t("“{file}” faylini o‘chirasizmi?", { file: file.fileName }),
                          confirmLabel: t("O‘chirish"),
                          tone: "danger",
                        }))
                      )
                        return;
                      void perform(async () => {
                        await readJson(await fetch(`/api/files?id=${file.id}`, { method: "DELETE" }));
                      }, "Fayl o‘chirildi");
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                ) : null}
              </div>
            ))}
            {task.attachments.length === 0 ? <EmptyMini text={t("Fayl biriktirilmagan")} /> : null}
          </div>
        </article>
        {canUpdate ? (
          <article className="detail-section progress-editor">
            <h3>
              <SlidersHorizontal size={17} /> {t("Ijro holatini yangilash")}
            </h3>
            <div className="form-grid three">
              <label>
                <span>
                  {t("Bajarilish:")} {progress}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={progress}
                  onChange={(event) => setProgress(Number(event.target.value))}
                />
              </label>
              <button
                className="secondary-button align-end"
                disabled={busy || progress >= 100}
                onClick={() =>
                  void perform(() => patchTask(task.id, { action: "progress", progress }), "Ijro holati yangilandi")
                }
              >
                <Save size={16} /> {t("Saqlash")}
              </button>
              <button
                className="primary-button align-end"
                disabled={busy || ownAssignment?.status === "Ko‘rib chiqilmoqda"}
                onClick={() =>
                  void perform(
                    () => patchTask(task.id, { action: "progress", progress: 100, status: "Ko‘rib chiqilmoqda" }),
                    "Ijro tekshiruvga yuborildi",
                  )
                }
              >
                <Send size={16} /> {t("Tekshiruvga yuborish")}
              </button>
            </div>
            {ownAssignment?.status === "Ko‘rib chiqilmoqda" ? (
              <p className="muted-note">{t("Ijro topshiriq beruvchi tomonidan ko‘rib chiqilmoqda.")}</p>
            ) : null}
          </article>
        ) : null}
        {canReview ? (
          <article className="detail-section progress-editor">
            <h3>
              <CheckCircle2 size={17} /> {t("Ijroni qabul qilish")}
            </h3>
            <label>
              <span>{t("Izoh (ixtiyoriy)")}</span>
              <textarea
                rows={2}
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder={awaitingReview ? t("Qaytarish sababi yoki qabul izohi") : t("Qabul izohi")}
              />
            </label>
            <div className="form-grid three">
              <button
                className="primary-button"
                disabled={busy}
                onClick={async () => {
                  if (
                    !awaitingReview &&
                    !(await confirmDialog({
                      title: t("Ijroni qabul qilish"),
                      message: t("Ijrochilar hali tekshiruvga yubormagan. Topshiriqni bajarilgan deb qabul qilasizmi?"),
                      confirmLabel: t("Qabul qilish"),
                    }))
                  )
                    return;
                  void perform(
                    () => patchTask(task.id, { action: "accept", note: reviewNote }),
                    "Topshiriq bajarilgan deb qabul qilindi",
                  );
                }}
              >
                <CheckCircle2 size={16} /> {t("Qabul qilish")}
              </button>
              {awaitingReview ? (
                <button
                  className="secondary-button"
                  disabled={busy || !reviewNote.trim()}
                  title={reviewNote.trim() ? undefined : t("Qaytarish sababini yozing")}
                  onClick={() =>
                    void perform(
                      () => patchTask(task.id, { action: "return", note: reviewNote }),
                      "Topshiriq qayta ishlashga qaytarildi",
                    )
                  }
                >
                  <RotateCcw size={16} /> {t("Qaytarish")}
                </button>
              ) : null}
            </div>
          </article>
        ) : null}
        {actor.permissions.canCreateTask && !locked ? (
          <article className="detail-section forward-section">
            <h3>
              <Send size={17} /> {t("Topshiriqni keyingi ijrochiga yo‘naltirish")}
            </h3>
            <PeoplePicker
              employees={forwardCandidates}
              organizations={organizations}
              departments={departments}
              selected={forwardIds}
              setSelected={setForwardIds}
              excludedIds={[actor.id, ...task.assignments.map((assignment) => assignment.employeeId)]}
              maxSelected={250}
              compact
            />
            <label>
              <span>{t("Yo‘naltirish izohi")}</span>
              <textarea id={`forward-note-${task.id}`} rows={2} placeholder={t("Keyingi ijrochiga ko‘rsatma")} />
            </label>
            <button
              className="primary-button"
              disabled={!forwardIds.length || busy}
              onClick={() => {
                const note =
                  (document.getElementById(`forward-note-${task.id}`) as HTMLTextAreaElement | null)?.value ?? "";
                void perform(
                  () => patchTask(task.id, { action: "forward", assigneeIds: forwardIds, note }),
                  `${forwardIds.length} ta ijrochiga yo‘naltirildi`,
                );
              }}
            >
              <Send size={16} />{" "}
              {forwardIds.length ? `${forwardIds.length} ta ijrochiga yo‘naltirish` : t("Yo‘naltirish")}
            </button>
          </article>
        ) : null}
      </div>
      <div className="modal-footer">
        <span>
          <ShieldCheck size={15} /> {t("Kirish va o‘zgarishlar serverda tekshiriladi")}
        </span>
        <div>
          {actor.permissions.canUpdateAnyTask ? (
            <button className="danger-button" disabled={busy} onClick={onArchive}>
              <Archive size={15} /> {t("Arxivlash")}
            </button>
          ) : null}
          <button className="secondary-button" onClick={onClose}>
            {t("Yopish")}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}
