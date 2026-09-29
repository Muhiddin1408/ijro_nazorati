"use client";

import "./styles/dashboard-home.css";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  Download,
  MapPin,
  Paperclip,
  Pin,
  Search,
  Send,
} from "lucide-react";
import { LocalInsightsPanel } from "./local-insights";
import { addDays, avatarColor, formatDateTime, formatTime, initials, localDateKey } from "./ui-helpers";
import { tNow, useI18n } from "../lib/i18n";

type HomeTask = {
  id: number;
  title: string;
  status: string;
  progress: number;
  priority: string;
  deadlineIso: string | null;
  overdue?: boolean;
  recurring?: boolean;
  recurrence?: string | null;
  pinned: boolean;
  topic?: { name: string; color: string } | null;
  attachments: Array<{ fileName?: string }>;
  assignments: Array<{ employeeId: number; name: string; department?: string; progress?: number }>;
  audiences: Array<{ targetName: string }>;
};

type HomeMeeting = {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string | null;
  place: string;
};

type HomeData = {
  tasks: HomeTask[];
  meetings: HomeMeeting[];
  actor: { permissions: { canExport: boolean } };
  telegram: { configured: boolean; linkedEmployees: number; pendingJobs: number };
};

function deadlineLabel(task: HomeTask) {
  if (!task.deadlineIso) return tNow(task.recurring ? (task.recurrence ?? "Davomiy") : "Muddat belgilanmagan");
  const key = localDateKey(task.deadlineIso);
  const today = localDateKey();
  const prefix =
    key === today ? tNow("Bugun") : key === addDays(today, 1) ? tNow("Ertaga") : formatDateTime(task.deadlineIso, true);
  return `${prefix}, ${formatTime(task.deadlineIso)}`;
}

function deadlineTone(task: HomeTask) {
  if (task.status === "Bajarildi" || !task.deadlineIso) return "";
  if (new Date(task.deadlineIso) < new Date()) return "danger";
  if (localDateKey(task.deadlineIso) === localDateKey()) return "warning";
  return "";
}

export function MetricCards({
  tasks,
  overdue,
  completion,
}: {
  tasks: HomeTask[];
  overdue: number;
  completion: number;
}) {
  const { t } = useI18n();
  const today = tasks.filter((task) => task.deadlineIso && localDateKey(task.deadlineIso) === localDateKey()).length;
  return (
    <section className="metric-grid" aria-label={t("Asosiy ko‘rsatkichlar")}>
      <article className="metric-card">
        <span className="metric-icon blue">
          <ClipboardList size={23} />
        </span>
        <div>
          <span>{t("Ko‘rinadigan topshiriqlar")}</span>
          <strong>{tasks.length}</strong>
          <small className="positive">{t("Server vakolati bo‘yicha")}</small>
        </div>
      </article>
      <article className="metric-card">
        <span className="metric-icon amber">
          <Clock3 size={23} />
        </span>
        <div>
          <span>{t("Bugun muddati")}</span>
          <strong className="amber-text">{today}</strong>
          <small>{t("Kunlik nazorat")}</small>
        </div>
      </article>
      <article className="metric-card danger-card">
        <span className="metric-icon red">
          <CircleAlert size={23} />
        </span>
        <div>
          <span>{t("Kechikkan")}</span>
          <strong className="red-text">{overdue}</strong>
          <small className="negative">{t("Nazorat talab etadi")}</small>
        </div>
      </article>
      <article className="metric-card progress-card">
        <span className="metric-icon green">
          <CheckCircle2 size={23} />
        </span>
        <div>
          <span>{t("Bajarilish")}</span>
          <strong>{completion}%</strong>
          <small className="positive">{t("O‘rtacha ijro darajasi")}</small>
        </div>
        <div className="metric-progress">
          <i style={{ width: `${completion}%` }} />
        </div>
      </article>
    </section>
  );
}

export function DashboardHome({
  data,
  tasks,
  overdue,
  completion,
  filter,
  setFilter,
  onOpenTask,
  onPin,
  onCalendar,
  onExport,
}: {
  data: HomeData;
  tasks: HomeTask[];
  overdue: number;
  completion: number;
  filter: string;
  setFilter: (value: string) => void;
  onOpenTask: (id: number) => void;
  onPin: (task: HomeTask) => void;
  onCalendar: () => void;
  onExport: () => void;
}) {
  const { t, tx } = useI18n();
  const todayMeetings = data.meetings.filter((meeting) => localDateKey(meeting.startsAt) === localDateKey());
  const departmentStats = departmentPerformance(data.tasks);
  return (
    <>
      <MetricCards tasks={data.tasks} overdue={overdue} completion={completion} />
      <LocalInsightsPanel tasks={data.tasks} meetings={data.meetings} />
      <section className="workspace-grid">
        <div className="workspace-main">
          {data.tasks.some((task) => task.pinned) ? (
            <article className="pinned-strip">
              <div className="pinned-title">
                <span>
                  <Pin size={16} />
                </span>
                <div>
                  <strong>{t("Ish stoliga mahkamlangan")}</strong>
                  <small>{t("Shaxsiy muhim topshiriqlar")}</small>
                </div>
              </div>
              <div className="pinned-items">
                {data.tasks
                  .filter((task) => task.pinned)
                  .slice(0, 3)
                  .map((task) => (
                    <button key={task.id} className="pinned-item" onClick={() => onOpenTask(task.id)}>
                      <span>{tx(task.title)}</span>
                      <small>{deadlineLabel(task)}</small>
                    </button>
                  ))}
              </div>
            </article>
          ) : null}
          <article className="panel tasks-panel">
            <div className="tasks-header">
              <div>
                <p className="section-kicker">{t("KUNLIK NAZORAT")}</p>
                <h2>{t("Faol topshiriqlar")}</h2>
              </div>
              <div className="task-tools">
                <div className="filter-group">
                  {["Barchasi", "Bugun", "Kechikkan", "Davomiy"].map((item) => (
                    <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                      {t(item)}
                    </button>
                  ))}
                </div>
                {data.actor.permissions.canExport ? (
                  <button className="secondary-button" onClick={onExport}>
                    <Download size={16} /> {t("Excel")}
                  </button>
                ) : null}
              </div>
            </div>
            <TaskTable tasks={tasks} onOpen={onOpenTask} onPin={onPin} />
          </article>
        </div>
        <aside className="workspace-side">
          <article className="panel meetings-card">
            <div className="panel-heading compact">
              <div>
                <p className="section-kicker">{t("BUGUN")}</p>
                <h2>{t("Yig‘ilishlar")}</h2>
              </div>
              <span className="agenda-count">{t("{n} ta", { n: todayMeetings.length })}</span>
            </div>
            <div className="meeting-list">
              {todayMeetings.length ? (
                todayMeetings.slice(0, 4).map((meeting) => (
                  <button className="meeting-item" key={meeting.id} onClick={onCalendar}>
                    <span className={`meeting-time ${avatarColor(meeting.id)}`}>{formatTime(meeting.startsAt)}</span>
                    <span>
                      <strong>{tx(meeting.title)}</strong>
                      <small>
                        <MapPin size={13} />
                        {tx(meeting.place)}
                      </small>
                    </span>
                  </button>
                ))
              ) : (
                <EmptyMini text={t("Bugun yig‘ilish yo‘q")} />
              )}
            </div>
            <button className="wide-secondary" onClick={onCalendar}>
              <CalendarDays size={16} /> {t("Taqvimni ochish")}
            </button>
          </article>
          <article className="panel control-card">
            <div className="panel-heading compact">
              <div>
                <p className="section-kicker">{t("BO‘LIMLAR KESIMIDA")}</p>
                <h2>{t("Ijro holati")}</h2>
              </div>
            </div>
            <div className="department-list">
              {departmentStats.slice(0, 5).map((item) => (
                <div className="department-row" key={item.name}>
                  <div>
                    <span>{tx(item.name)}</span>
                    <strong>{item.progress}%</strong>
                  </div>
                  <span className="department-progress">
                    <i style={{ width: `${item.progress}%` }} />
                  </span>
                </div>
              ))}
            </div>
          </article>
          <article className="telegram-notice">
            <span className="telegram-large">
              <Send size={22} />
            </span>
            <div>
              <strong>{t("Telegram eslatmalari")}</strong>
              <p>
                {data.telegram.configured
                  ? `${data.telegram.linkedEmployees} xodim ulangan, ${data.telegram.pendingJobs} xabar navbatda.`
                  : t("Bot kodi tayyor. Token kiritilgach webhook faollashtiriladi.")}
              </p>
            </div>
          </article>
        </aside>
      </section>
    </>
  );
}

function TaskTable({
  tasks,
  onOpen,
  onPin,
}: {
  tasks: HomeTask[];
  onOpen: (id: number) => void;
  onPin: (task: HomeTask) => void;
}) {
  const { t, tx } = useI18n();
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t("Topshiriq")}</th>
            <th>{t("Ijrochilar")}</th>
            <th>{t("Muddat")}</th>
            <th>{t("Holat")}</th>
            <th>{t("Jarayon")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="clickable-row"
              tabIndex={0}
              aria-label={t("{title} — topshiriqni ochish", { title: tx(task.title) })}
              onClick={() => onOpen(task.id)}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onOpen(task.id);
                }
              }}
            >
              <td>
                <div className="task-title-cell">
                  <button
                    className={`pin-button ${task.pinned ? "pinned" : ""}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onPin(task);
                    }}
                    aria-label={t("Topshiriqni mahkamlash")}
                  >
                    <Pin size={15} />
                  </button>
                  <div>
                    <strong>{tx(task.title)}</strong>
                    <span>
                      <em className={`priority priority-${task.priority.toLowerCase().replace("‘", "")}`}>
                        {t(task.priority ?? "")}
                      </em>
                      {task.topic ? (
                        <small className="topic-mini">
                          <i style={{ backgroundColor: task.topic.color }} />
                          {tx(task.topic.name)}
                        </small>
                      ) : null}
                      {task.attachments.length ? (
                        <small>
                          <Paperclip size={13} />
                          {t("{n} ta fayl", { n: task.attachments.length })}
                        </small>
                      ) : null}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <div className="assignee-cell">
                  <div className="avatar-stack">
                    {task.assignments.slice(0, 3).map((person) => (
                      <span
                        key={person.employeeId}
                        className={`person-avatar ${avatarColor(person.employeeId)}`}
                        title={person.name}
                      >
                        {initials(person.name)}
                      </span>
                    ))}
                  </div>
                  <span>
                    {task.assignments[0]?.name ??
                      (task.audiences.map((item) => item.targetName).join(", ") || t("Ijrochi biriktirilmagan"))}
                    {task.assignments.length > 1 ? ` +${task.assignments.length - 1}` : ""}
                  </span>
                </div>
              </td>
              <td>
                <span className={`deadline ${deadlineTone(task)}`}>
                  <CalendarDays size={15} />
                  {deadlineLabel(task)}
                </span>
              </td>
              <td>
                <span className={`status status-${task.status.toLowerCase().replaceAll("‘", "").replaceAll(" ", "-")}`}>
                  {t(task.status ?? "")}
                </span>
              </td>
              <td>
                <div className="progress-cell">
                  <strong>{task.progress}%</strong>
                  <span>
                    <i style={{ width: `${task.progress}%` }} />
                  </span>
                </div>
              </td>
              <td>
                <ChevronRight size={17} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 ? (
        <div className="empty-state">
          <Search size={25} />
          <strong>{t("Topshiriq topilmadi")}</strong>
          <span>{t("Qidiruv yoki filtrni o‘zgartirib ko‘ring.")}</span>
        </div>
      ) : null}
    </div>
  );
}

function departmentPerformance(tasks: HomeTask[]) {
  const groups = new Map<string, number[]>();
  for (const task of tasks)
    for (const assignment of task.assignments) {
      const values = groups.get(assignment.department ?? "") ?? [];
      values.push(assignment.progress ?? task.progress);
      groups.set(assignment.department ?? "", values);
    }
  return [...groups.entries()]
    .filter(([name]) => name)
    .map(([name, values]) => ({ name, progress: Math.round(values.reduce((a, b) => a + b, 0) / values.length) }))
    .sort((a, b) => b.progress - a.progress);
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="empty-mini">
      <span>—</span>
      {text}
    </div>
  );
}
