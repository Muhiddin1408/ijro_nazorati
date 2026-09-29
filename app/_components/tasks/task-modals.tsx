"use client";

import {
  CheckCircle2,
  CircleAlert,
  FileText,
  Pin,
  Repeat2,
  Save,
  Send,
  ShieldCheck,
  UploadCloud,
  Users,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { ModalFrame, ModalHeader } from "../../dashboard-kit";
import { addDays, localDateKey, localDateTimeParts } from "../../ui-helpers";
import type {
  ModalOrganization,
  ModalDepartment,
  ModalEmployee,
  ModalTopic,
  AudienceTarget,
  ModalTask,
} from "./task-meeting-types";
import { PeoplePicker } from "./people-picker";
import { useDashboard } from "../dashboard/dashboard-context";
import { useI18n } from "../../../lib/i18n";

export function TaskModal({
  employees,
  organizations = [],
  departments = [],
  topics,
  onClose,
  onSubmit,
}: {
  employees: ModalEmployee[];
  organizations: ModalOrganization[];
  departments: ModalDepartment[];
  topics: ModalTopic[];
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>, files: File[]) => Promise<boolean>;
}) {
  const { t, tx } = useI18n();
  const actorId = useDashboard().actor.id;
  const [selected, setSelected] = useState<number[]>([]);
  const [audiences, setAudiences] = useState<AudienceTarget[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recurring, setRecurring] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if ((!selected.length && !audiences.length) || submitting) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    const ok = await onSubmit(
      {
        title: form.get("title"),
        description: form.get("description"),
        priority: form.get("priority"),
        topicId: form.get("topicId") ? Number(form.get("topicId")) : null,
        deadlineIso: form.get("deadlineDate")
          ? new Date(`${form.get("deadlineDate")}T${form.get("deadlineTime") || "18:00"}:00+05:00`).toISOString()
          : null,
        recurring,
        recurrence: recurring ? form.get("recurrence") : null,
        pinned: form.get("pinned") === "on",
        notifyTelegram: form.get("telegram") === "on",
        routeNote: form.get("routeNote"),
        assigneeIds: selected,
        audiences: audiences.map(({ targetType, targetId, includeDescendants }) => ({
          targetType,
          targetId,
          includeDescendants,
        })),
      },
      files,
    );
    if (!ok) setSubmitting(false);
  }
  return (
    <ModalFrame onClose={onClose} wide>
      <form onSubmit={submit}>
        <ModalHeader
          kicker={t("YANGI TOPSHIRIQ")}
          title={t("Topshiriq berish")}
          subtitle={t("Standart holatda topshiriq bir martalik; kerak bo‘lsa davomiy turini yoqing")}
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-grid">
            <label className="full">
              <span>{t("Topshiriq nomi *")}</span>
              <input name="title" required minLength={3} placeholder={t("Aniq va o‘lchanadigan natijani yozing")} />
            </label>
            <label className="full">
              <span>{t("Batafsil izoh")}</span>
              <textarea name="description" rows={3} placeholder={t("Talablar, natija va qo‘shimcha ko‘rsatmalar")} />
            </label>
            <label>
              <span>{t("Tematika")}</span>
              <select name="topicId" defaultValue="">
                <option value="">{t("Tematika tanlanmagan")}</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {tx(topic.name)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("Ustuvorlik")}</span>
              <select name="priority" defaultValue="O‘rta">
                <option value="Yuqori">{t("Yuqori")}</option>
                <option value="O‘rta">{t("O‘rta")}</option>
                <option value="Oddiy">{t("Oddiy")}</option>
              </select>
            </label>
            <label className="full">
              <span>{t("Ijrochilarga ko‘rsatma")}</span>
              <input name="routeNote" placeholder={t("Natija, nazorat yoki ijro tartibi bo‘yicha qisqa ko‘rsatma")} />
            </label>
          </div>
          <PeoplePicker
            employees={employees}
            organizations={organizations}
            departments={departments}
            audiences={audiences}
            setAudiences={setAudiences}
            scope="task"
            selected={selected}
            setSelected={setSelected}
            excludedIds={[actorId]}
            maxSelected={250}
          />
          <div className="task-kind-note task-recipient-confirmation" role="status" aria-live="polite">
            <Users size={18} />
            <div>
              <strong>
                {selected.length || audiences.length
                  ? `${selected.length} ta xodim, ${audiences.length} ta tuzilma tanlandi`
                  : t("Ijrochi yoki mas’ul tuzilmani tanlang")}
              </strong>
              <span>{t("Bir topshiriqni bir nechta xodim, bo‘lim va tashkilotga bir vaqtda yuborish mumkin.")}</span>
            </div>
          </div>
          <div className={`form-grid ${recurring ? "three" : ""}`}>
            <label>
              <span>{t("Muddat sanasi")}</span>
              <input type="date" name="deadlineDate" min={localDateKey()} defaultValue={addDays(localDateKey(), 1)} />
            </label>
            <label>
              <span>{t("Vaqt")}</span>
              <input type="time" name="deadlineTime" defaultValue="18:00" />
            </label>
            {recurring ? (
              <label>
                <span>{t("Takrorlanish davri *")}</span>
                <select name="recurrence" defaultValue="Har hafta">
                  <option value="Har kuni">{t("Har kuni")}</option>
                  <option value="Har hafta">{t("Har hafta")}</option>
                  <option value="Har oy">{t("Har oy")}</option>
                  <option value="Har chorak">{t("Har chorak")}</option>
                </select>
              </label>
            ) : null}
          </div>
          <div className="task-kind-note">
            <CheckCircle2 size={18} />
            <div>
              <strong>{recurring ? t("Davomiy topshiriq") : t("Bir martalik topshiriq")}</strong>
              <span>
                {recurring
                  ? t("Bajarilgach tanlangan davr bo‘yicha keyingi topshiriq avtomatik yaratiladi.")
                  : t("Bajarilgach yopiladi va qayta yaratilmaydi.")}
              </span>
            </div>
          </div>
          <label className="upload-zone">
            <UploadCloud size={24} />
            <strong>{t("Fayllarni biriktiring")}</strong>
            <span>{t("Har bir fayl 25 MB gacha")}</span>
            <input
              type="file"
              multiple
              onChange={(event) => {
                const chosen = Array.from(event.target.files ?? []);
                const invalid = chosen.find(
                  (file) =>
                    !file.name.trim() || file.name.length > 255 || file.size <= 0 || file.size > 25 * 1024 * 1024,
                );
                if (invalid) {
                  setFiles([]);
                  setFileError(
                    `“${invalid.name || "Fayl"}” 25 MB dan oshmasligi va nomi 255 belgidan qisqa bo‘lishi kerak.`,
                  );
                  event.currentTarget.value = "";
                  return;
                }
                setFileError("");
                setFiles(chosen);
              }}
            />
          </label>
          {fileError ? (
            <div className="picker-error" role="alert">
              <CircleAlert size={15} />
              <span>{fileError}</span>
            </div>
          ) : null}
          {files.length ? (
            <div className="selected-files">
              {files.map((file) => (
                <span key={`${file.name}-${file.size}`}>
                  <FileText size={14} />
                  {tx(file.name)}
                </span>
              ))}
            </div>
          ) : null}
          <div className="option-row">
            <label>
              <input
                type="checkbox"
                name="recurring"
                checked={recurring}
                onChange={(event) => setRecurring(event.target.checked)}
              />
              <span>
                <Repeat2 size={16} />
                <strong>{t("Davomiy topshiriq")}</strong>
                <small>{t("Faqat takrorlanadigan topshiriqda yoqing")}</small>
              </span>
            </label>
            <label>
              <input type="checkbox" name="pinned" />
              <span>
                <Pin size={16} />
                <strong>{t("Ish stoliga mahkamlash")}</strong>
                <small>{t("Faqat sizning panelingizda")}</small>
              </span>
            </label>
            <label>
              <input type="checkbox" name="telegram" defaultChecked />
              <span>
                <Send size={16} />
                <strong>{t("Telegram orqali yuborish")}</strong>
                <small>{t("Ijrochilar va topshiriq beruvchiga")}</small>
              </span>
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <span>
            <ShieldCheck size={15} /> {t("Barcha yo‘nalishlar auditda saqlanadi")}
          </span>
          <div>
            <button type="button" className="secondary-button" onClick={onClose}>
              {t("Bekor qilish")}
            </button>
            <button
              className="primary-button"
              disabled={(!selected.length && !audiences.length) || Boolean(fileError) || submitting}
            >
              <Send size={17} />
              {submitting ? t("Saqlanmoqda...") : t("Topshiriqni yuborish")}
            </button>
          </div>
        </div>
      </form>
    </ModalFrame>
  );
}

export function TaskEditModal({
  task,
  topics,
  onClose,
  onSubmit,
}: {
  task: ModalTask;
  topics: ModalTopic[];
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<boolean>;
}) {
  const { t, tx } = useI18n();
  const deadline = task.deadlineIso ? localDateTimeParts(task.deadlineIso) : null;
  const [submitting, setSubmitting] = useState(false);
  const [recurring, setRecurring] = useState(task.recurring);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    const ok = await onSubmit({
      title: form.get("title"),
      description: form.get("description"),
      priority: form.get("priority"),
      topicId: form.get("topicId") ? Number(form.get("topicId")) : null,
      deadlineIso: form.get("deadlineDate")
        ? new Date(`${form.get("deadlineDate")}T${form.get("deadlineTime") || "18:00"}:00+05:00`).toISOString()
        : null,
      recurring,
      recurrence: recurring ? form.get("recurrence") : null,
      notifyTelegram: form.get("telegram") === "on",
    });
    if (!ok) setSubmitting(false);
  }
  return (
    <ModalFrame onClose={onClose} wide>
      <form onSubmit={submit}>
        <ModalHeader
          kicker={t("TOPSHIRIQ #{id}", { id: task.id })}
          title={t("Topshiriqni tahrirlash")}
          subtitle={t("Mazmuni, muddati, turi va eslatmalarini yangilang")}
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-grid">
            <label className="full">
              <span>{t("Topshiriq nomi *")}</span>
              <input name="title" defaultValue={task.title} required minLength={3} maxLength={240} />
            </label>
            <label className="full">
              <span>{t("Batafsil izoh")}</span>
              <textarea name="description" rows={4} defaultValue={task.description} maxLength={5000} />
            </label>
            <label>
              <span>{t("Tematika")}</span>
              <select name="topicId" defaultValue={task.topic?.id ?? ""}>
                <option value="">{t("Tematika tanlanmagan")}</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {tx(topic.name)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("Ustuvorlik")}</span>
              <select name="priority" defaultValue={task.priority}>
                <option value="Yuqori">{t("Yuqori")}</option>
                <option value="O‘rta">{t("O‘rta")}</option>
                <option value="Oddiy">{t("Oddiy")}</option>
              </select>
            </label>
            <label>
              <span>{t("Muddat sanasi")}</span>
              <input type="date" name="deadlineDate" min={localDateKey()} defaultValue={deadline?.date ?? ""} />
            </label>
            <label>
              <span>{t("Vaqt")}</span>
              <input type="time" name="deadlineTime" defaultValue={deadline?.time ?? "18:00"} />
            </label>
            {recurring ? (
              <label>
                <span>{t("Takrorlanish davri")}</span>
                <select name="recurrence" defaultValue={task.recurrence ?? "Har hafta"}>
                  <option value="Har kuni">{t("Har kuni")}</option>
                  <option value="Har hafta">{t("Har hafta")}</option>
                  <option value="Har oy">{t("Har oy")}</option>
                  <option value="Har chorak">{t("Har chorak")}</option>
                </select>
              </label>
            ) : null}
          </div>
          <div className="task-kind-note">
            <CheckCircle2 size={18} />
            <div>
              <strong>{recurring ? t("Davomiy topshiriq") : t("Bir martalik topshiriq")}</strong>
              <span>
                {recurring ? t("Bajarilgach keyingi davr avtomatik yaratiladi.") : t("Bajarilgach yopiladi.")}
              </span>
            </div>
          </div>
          <div className="option-row one">
            <label>
              <input
                type="checkbox"
                name="recurring"
                checked={recurring}
                onChange={(event) => setRecurring(event.target.checked)}
              />
              <span>
                <Repeat2 size={16} />
                <strong>{t("Davomiy topshiriq")}</strong>
                <small>{t("Faqat takrorlanadigan topshiriqda yoqing")}</small>
              </span>
            </label>
            <label>
              <input type="checkbox" name="telegram" defaultChecked={task.notifyTelegram} />
              <span>
                <Send size={16} />
                <strong>{t("Telegram eslatmalari")}</strong>
                <small>{t("Ijrochilar va topshiriq beruvchiga yuboriladi")}</small>
              </span>
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <span>
            <ShieldCheck size={15} /> {t("O‘zgarishlar audit jurnalida saqlanadi")}
          </span>
          <div>
            <button type="button" className="secondary-button" onClick={onClose}>
              {t("Bekor qilish")}
            </button>
            <button className="primary-button" disabled={submitting}>
              <Save size={16} />
              {submitting ? t("Saqlanmoqda...") : t("O‘zgarishlarni saqlash")}
            </button>
          </div>
        </div>
      </form>
    </ModalFrame>
  );
}
