"use client";

import "./styles/meetings.css";
import {
  CalendarClock,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageIntro, readJson } from "./dashboard-kit";
import {
  addDays,
  avatarColor,
  dateFromKey,
  formatDateTime,
  formatFullDate,
  formatTime,
  localDateKey,
  startOfWeek,
  weekdayShort,
} from "./ui-helpers";
import { useI18n } from "../lib/i18n";

export type MeetingsPageMeeting = {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string | null;
  place: string;
  format: string;
  reminderMinutes: number;
  notifyTelegram: boolean;
  creatorId: number;
  participants: Array<{ name: string }>;
  audiences: Array<{ targetName: string }>;
};

type MeetingsPageResponse = { meetings: MeetingsPageMeeting[]; hasMore?: boolean; nextOffset?: number | null };

// A busy week is fetched page by page (the API caps each page); beyond this the user loads more.
const AUTO_PAGES = 5;

function weekRange(weekStart: string) {
  return {
    from: new Date(`${weekStart}T00:00:00+05:00`).toISOString(),
    to: new Date(`${addDays(weekStart, 6)}T23:59:59+05:00`).toISOString(),
  };
}

async function fetchMeetingsPage(weekStart: string, offset: number): Promise<MeetingsPageResponse> {
  const { from, to } = weekRange(weekStart);
  return readJson<MeetingsPageResponse>(
    await fetch(`/api/meetings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&offset=${offset}`, {
      cache: "no-store",
    }),
  );
}

export function MeetingsPage({
  meetings: initialMeetings,
  actorId,
  canEditAll,
  canCreate,
  onNew,
  onEdit,
  onDelete,
}: {
  meetings: MeetingsPageMeeting[];
  actorId: number;
  canEditAll: boolean;
  canCreate: boolean;
  onNew: (date: string) => void;
  onEdit: (meeting: MeetingsPageMeeting) => void;
  onDelete: (meeting: MeetingsPageMeeting) => void;
}) {
  const { t, tx } = useI18n();
  const [selectedDate, setSelectedDate] = useState(localDateKey());
  const [meetings, setMeetings] = useState(initialMeetings);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  // Re-runs on every dashboard refresh (new initialMeetings), keeping the selected week.
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const collected: MeetingsPageMeeting[] = [];
        let offset: number | null = 0;
        for (let page = 0; page < AUTO_PAGES && offset != null; page += 1) {
          const result: MeetingsPageResponse = await fetchMeetingsPage(weekStart, offset);
          collected.push(...result.meetings);
          offset = result.hasMore ? (result.nextOffset ?? offset + result.meetings.length) : null;
        }
        if (!active) return;
        setMeetings(collected);
        setNextOffset(offset);
        setLoadError("");
      } catch (error) {
        if (!active) return;
        setMeetings(
          initialMeetings.filter(
            (meeting) =>
              localDateKey(meeting.startsAt) >= weekStart && localDateKey(meeting.startsAt) <= addDays(weekStart, 6),
          ),
        );
        setNextOffset(null);
        setLoadError(error instanceof Error ? error.message : "Yig‘ilishlarni yuklab bo‘lmadi");
      }
    })();
    return () => {
      active = false;
    };
  }, [initialMeetings, weekStart]);

  async function loadMore() {
    if (nextOffset == null || loadingMore) return;
    const week = weekStart;
    try {
      setLoadingMore(true);
      const result = await fetchMeetingsPage(week, nextOffset);
      if (week !== weekStart) return;
      setMeetings((current) => {
        const known = new Set(current.map((meeting) => meeting.id));
        return [...current, ...result.meetings.filter((meeting) => !known.has(meeting.id))];
      });
      setNextOffset(result.hasMore ? (result.nextOffset ?? nextOffset + result.meetings.length) : null);
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Yig‘ilishlarni yuklab bo‘lmadi");
    } finally {
      setLoadingMore(false);
    }
  }

  const selectedMeetings = meetings.filter((meeting) => localDateKey(meeting.startsAt) === selectedDate);
  const upcoming = meetings
    .filter((meeting) => new Date(meeting.startsAt) > new Date())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

  return (
    <section className="module-page">
      <PageIntro
        kicker={t("YIG‘ILISHLAR MODULI")}
        title={t("Yig‘ilishlar taqvimi")}
        description={t(
          "Istalgan hafta va kunni tanlang; vaqt, joy, ishtirokchilar va eslatmalar shu kun bo‘yicha ko‘rsatiladi.",
        )}
        actions={
          canCreate ? (
            <button className="primary-button" onClick={() => onNew(selectedDate)}>
              <Plus size={17} /> {t("Yig‘ilish kiritish")}
            </button>
          ) : undefined
        }
      />
      <div className="calendar-navigation">
        <button className="secondary-button" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
          <ChevronLeft size={17} /> {t("Oldingi hafta")}
        </button>
        <strong>
          {formatFullDate(weekStart)} — {formatFullDate(addDays(weekStart, 6))}
        </strong>
        <button className="secondary-button" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
          {t("Keyingi hafta")} <ChevronRight size={17} />
        </button>
      </div>
      <div className="calendar-strip">
        {days.map((key) => {
          const count = meetings.filter((meeting) => localDateKey(meeting.startsAt) === key).length;
          const dayName = t(weekdayShort[dateFromKey(key).getUTCDay()]);
          return (
            <button className={selectedDate === key ? "active" : ""} key={key} onClick={() => setSelectedDate(key)}>
              <small>{dayName}</small>
              <strong>{Number(key.slice(-2))}</strong>
              <span>{key === localDateKey() ? t("Bugun") : count ? t("{n} ta", { n: count }) : "—"}</span>
            </button>
          );
        })}
      </div>
      {loadError ? (
        <div className="refresh-error-banner" role="alert">
          <span>
            {t("Yig‘ilishlar serverdan yangilanmadi:")} {t(loadError)}
          </span>
        </div>
      ) : null}
      {nextOffset != null ? (
        <div className="list-truncated-note">
          <span>{t("Bu haftadagi yig‘ilishlar ro‘yxati to‘liq emas.")}</span>
          <button
            type="button"
            className="secondary-button compact-button"
            disabled={loadingMore}
            onClick={() => void loadMore()}
          >
            <RefreshCw size={14} /> {loadingMore ? t("Yuklanmoqda...") : t("Yana yuklash")}
          </button>
        </div>
      ) : null}
      <div className="meetings-layout">
        <article className="panel agenda-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">{formatFullDate(selectedDate).toUpperCase()}</p>
              <h2>{t("Kun tartibi")}</h2>
            </div>
            <span className="agenda-count">{t("{n} ta yig‘ilish", { n: selectedMeetings.length })}</span>
          </div>
          <div className="agenda-list">
            {selectedMeetings.map((meeting) => (
              <article className="agenda-item" key={meeting.id}>
                <div className="agenda-time">
                  <strong>{formatTime(meeting.startsAt)}</strong>
                  <span>
                    {meeting.endsAt ? `${formatTime(meeting.endsAt)} gacha` : `${meeting.reminderMinutes} daqiqa oldin`}
                  </span>
                </div>
                <span className={`agenda-line ${avatarColor(meeting.id)}`} />
                <div className="agenda-copy">
                  <div>
                    <span className={`format-badge ${meeting.format.toLowerCase()}`}>
                      {meeting.format === "Onlayn" ? <Video size={12} /> : <MapPin size={12} />}
                      {t(meeting.format ?? "")}
                    </span>
                    {meeting.notifyTelegram ? (
                      <span className="telegram-mini">
                        <Send size={11} /> {t("Eslatma faol")}
                      </span>
                    ) : null}
                  </div>
                  <h3>{tx(meeting.title)}</h3>
                  <p>
                    <MapPin size={14} />
                    {tx(meeting.place)}
                  </p>
                  <p>
                    <Users size={14} />
                    {meeting.participants.map((item) => item.name).join(", ") ||
                      meeting.audiences.map((item) => item.targetName).join(", ") ||
                      t("Ishtirokchi yo‘q")}
                  </p>
                  {canCreate && (canEditAll || meeting.creatorId === actorId) ? (
                    <div className="agenda-actions">
                      <button className="secondary-button compact-button" onClick={() => onEdit(meeting)}>
                        <Pencil size={14} /> {t("Tahrirlash")}
                      </button>
                      <button className="danger-button compact-button" onClick={() => onDelete(meeting)}>
                        <Trash2 size={14} /> {t("Bekor qilish")}
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
            {selectedMeetings.length === 0 ? (
              <div className="empty-state">
                <CalendarDays size={27} />
                <strong>{t("Bu kunda yig‘ilish yo‘q")}</strong>
                <span>{t("Boshqa kunni tanlang yoki yangi yig‘ilish kiriting.")}</span>
              </div>
            ) : null}
          </div>
        </article>
        <aside className="meeting-side-stack">
          <article className="panel assistant-card">
            <span className="metric-icon blue">
              <CalendarClock size={23} />
            </span>
            <h3>{t("Keyingi yig‘ilish")}</h3>
            {upcoming ? (
              <>
                <p>{formatDateTime(upcoming.startsAt)}</p>
                <strong>{tx(upcoming.title)}</strong>
                <div className="assistant-next">
                  <small>{formatTime(upcoming.startsAt)}</small>
                  <span>{tx(upcoming.place)}</span>
                </div>
              </>
            ) : (
              <p>{t("Rejalashtirilgan yig‘ilish yo‘q")}</p>
            )}
          </article>
          <article className="panel reminder-rules">
            <div className="panel-heading compact">
              <div>
                <p className="section-kicker">{t("AVTOMATIK")}</p>
                <h2>{t("Eslatma qoidalari")}</h2>
              </div>
              <Send size={18} />
            </div>
            <ul>
              <li>
                <Check size={14} />
                {t("Bir kun oldin — kun tartibi")}
              </li>
              <li>
                <Check size={14} />
                {t("Bir soat oldin — joy va vaqt")}
              </li>
              <li>
                <Check size={14} />
                {t("15 daqiqa oldin — tezkor eslatma")}
              </li>
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default MeetingsPage;
