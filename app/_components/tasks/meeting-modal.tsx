"use client";

import { CalendarClock, CalendarDays, Send } from "lucide-react";
import { type FormEvent, useState } from "react";
import { ModalFrame, ModalHeader } from "../../dashboard-kit";
import { localDateKey, localDateTimeParts } from "../../ui-helpers";
import type {
  ModalOrganization,
  ModalDepartment,
  ModalEmployee,
  AudienceTarget,
  ModalMeeting,
} from "./task-meeting-types";
import { PeoplePicker } from "./people-picker";
import { useI18n } from "../../../lib/i18n";

export function MeetingModal({
  meeting,
  defaultDate,
  employees,
  organizations,
  departments,
  onClose,
  onSubmit,
}: {
  meeting?: ModalMeeting;
  defaultDate?: string;
  employees: ModalEmployee[];
  organizations: ModalOrganization[];
  departments: ModalDepartment[];
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<boolean>;
}) {
  const { t } = useI18n();
  const start = meeting ? localDateTimeParts(meeting.startsAt) : { date: defaultDate ?? localDateKey(), time: "10:00" };
  const end = meeting?.endsAt ? localDateTimeParts(meeting.endsAt) : null;
  const [selected, setSelected] = useState<number[]>(meeting?.participants.map((item) => item.employeeId) ?? []);
  const [audiences, setAudiences] = useState<AudienceTarget[]>(meeting?.audiences ?? []);
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if ((!selected.length && !audiences.length) || submitting) return;
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date"));
    const endTime = String(form.get("endTime") ?? "");
    setSubmitting(true);
    const ok = await onSubmit({
      title: form.get("title"),
      place: form.get("place"),
      format: form.get("format"),
      startsAt: new Date(`${date}T${form.get("time")}:00+05:00`).toISOString(),
      endsAt: endTime ? new Date(`${date}T${endTime}:00+05:00`).toISOString() : null,
      reminderMinutes: Number(form.get("reminderMinutes")),
      notifyTelegram: form.get("telegram") === "on",
      participantIds: selected,
      audiences: audiences.map(({ targetType, targetId, includeDescendants }) => ({
        targetType,
        targetId,
        includeDescendants,
      })),
    });
    if (!ok) setSubmitting(false);
  }
  return (
    <ModalFrame onClose={onClose} wide>
      <form onSubmit={submit}>
        <ModalHeader
          kicker={t("YIG‘ILISHLAR")}
          title={meeting ? t("Yig‘ilishni tahrirlash") : t("Yig‘ilish kiritish")}
          subtitle={t("Taqvim va Telegram eslatmalari bir vaqtda yangilanadi")}
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-grid">
            <label className="full">
              <span>{t("Yig‘ilish mavzusi *")}</span>
              <input name="title" defaultValue={meeting?.title} required minLength={3} maxLength={240} />
            </label>
            <label>
              <span>{t("Sana *")}</span>
              <input type="date" name="date" min={localDateKey()} defaultValue={start.date} required />
            </label>
            <label>
              <span>{t("Boshlanish vaqti *")}</span>
              <input type="time" name="time" defaultValue={start.time} required />
            </label>
            <label>
              <span>{t("Tugash vaqti")}</span>
              <input type="time" name="endTime" defaultValue={end?.time ?? ""} />
            </label>
            <label>
              <span>{t("O‘tkazilish joyi *")}</span>
              <input name="place" defaultValue={meeting?.place} required maxLength={500} />
            </label>
            <label>
              <span>{t("Format")}</span>
              <select name="format" defaultValue={meeting?.format ?? "Oflayn"}>
                <option value="Oflayn">{t("Oflayn")}</option>
                <option value="Onlayn">{t("Onlayn")}</option>
                <option value="Aralash">{t("Aralash")}</option>
              </select>
            </label>
            <label className="full">
              <span>{t("Asosiy eslatma")}</span>
              <select name="reminderMinutes" defaultValue={String(meeting?.reminderMinutes ?? 60)}>
                <option value="15">{t("15 daqiqa oldin")}</option>
                <option value="30">{t("30 daqiqa oldin")}</option>
                <option value="60">{t("1 soat oldin")}</option>
                <option value="1440">{t("1 kun oldin")}</option>
              </select>
            </label>
          </div>
          <PeoplePicker
            employees={employees}
            organizations={organizations}
            departments={departments}
            audiences={audiences}
            setAudiences={setAudiences}
            scope="meeting"
            selected={selected}
            setSelected={setSelected}
            compact
          />
          <div className="option-row one">
            <label>
              <input type="checkbox" name="telegram" defaultChecked={meeting?.notifyTelegram ?? true} />
              <span>
                <Send size={16} />
                <strong>{t("Telegram orqali eslatish")}</strong>
                <small>{t("Faqat botga ulangan ishtirokchilarga")}</small>
              </span>
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <span>
            <CalendarClock size={15} /> {t("Taqvim sanalari Asia/Tashkent vaqtida")}
          </span>
          <div>
            <button type="button" className="secondary-button" onClick={onClose}>
              {t("Bekor qilish")}
            </button>
            <button className="primary-button" disabled={(!selected.length && !audiences.length) || submitting}>
              <CalendarDays size={17} />
              {submitting ? t("Saqlanmoqda...") : meeting ? t("O‘zgarishlarni saqlash") : t("Taqvimga kiritish")}
            </button>
          </div>
        </div>
      </form>
    </ModalFrame>
  );
}
