"use client";

import "./styles/tasks.css";
import {
  CalendarClock,
  CircleAlert,
  ClipboardList,
  FileSpreadsheet,
  Pin,
  Plus,
  RefreshCw,
  Repeat2,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { PageIntro } from "./dashboard-kit";
import { isTaskAwaitingReview } from "../lib/shared/statuses";
import { addDays, avatarColor, formatDateTime, formatTime, initials, localDateKey } from "./ui-helpers";
import { tNow, useI18n } from "../lib/i18n";

export type TasksPageTask = {
  id: number;
  title: string;
  deadlineIso: string | null;
  priority: string;
  status: string;
  progress: number;
  recurring: boolean;
  recurrence: string | null;
  topic: { id: number; name: string; color: string } | null;
  pinned: boolean;
  creator?: { id: number };
  assignments: Array<{ employeeId: number; name: string; status?: string }>;
  audiences: Array<{ targetName: string }>;
};

type TaskModule = "all" | "single" | "recurring" | "review";

/** Placeholder cards shown while a page of tasks is loading. */
export function TaskSkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <article className="task-detail-card skeleton-card" aria-hidden="true" key={`skeleton-${index}`}>
          <span className="skeleton-line short" />
          <span className="skeleton-line" />
          <span className="skeleton-line medium" />
          <span className="skeleton-line short" />
        </article>
      ))}
    </>
  );
}

export function deadlineLabel(task: Pick<TasksPageTask, "deadlineIso" | "recurring" | "recurrence">) {
  if (!task.deadlineIso) return tNow(task.recurring ? (task.recurrence ?? "Davomiy") : "Muddat belgilanmagan");
  const key = localDateKey(task.deadlineIso);
  const today = localDateKey();
  const prefix =
    key === today ? tNow("Bugun") : key === addDays(today, 1) ? tNow("Ertaga") : formatDateTime(task.deadlineIso, true);
  return `${prefix}, ${formatTime(task.deadlineIso)}`;
}

function Summary({ icon, tone, label, value }: { icon: ReactNode; tone: string; label: string; value: string }) {
  return (
    <div>
      <span className={`metric-icon ${tone}`}>{icon}</span>
      <p>
        <small>{label}</small>
        <strong>{value}</strong>
      </p>
    </div>
  );
}

export function TasksPage({
  tasks,
  hasMore = false,
  loadingMore = false,
  includeClosed = false,
  onLoadMore,
  onToggleClosed,
  permissions,
  onNew,
  onExport,
  onOpen,
  onPin,
  actorId,
}: {
  tasks: TasksPageTask[];
  /** Current user; tasks they issued that await their acceptance are highlighted. */
  actorId?: number;
  hasMore?: boolean;
  loadingMore?: boolean;
  includeClosed?: boolean;
  onLoadMore?: () => void;
  onToggleClosed?: () => void;
  permissions: { canExport: boolean; canCreateTask: boolean };
  onNew: () => void;
  onExport: () => void;
  onOpen: (id: number) => void;
  onPin: (task: TasksPageTask) => void;
}) {
  const { t, tx } = useI18n();
  const [module, setModule] = useState<TaskModule>("all");
  const [visibleCount, setVisibleCount] = useState(36);
  const reviewTasks = tasks.filter((task) => isTaskAwaitingReview(task));
  const awaitingMine = (task: TasksPageTask) =>
    actorId != null && task.creator?.id === actorId && isTaskAwaitingReview(task);
  const awaitingMineCount = tasks.filter(awaitingMine).length;
  const displayedTasks = tasks.filter((task) => {
    if (module === "all") return true;
    if (module === "review") return isTaskAwaitingReview(task);
    return module === "recurring" ? task.recurring : !task.recurring;
  });
  const visibleTasks = displayedTasks.slice(0, visibleCount);
  function chooseModule(value: TaskModule) {
    setModule(value);
    setVisibleCount(36);
  }
  return (
    <section className="module-page">
      <PageIntro
        kicker={t("IJRO JARAYONI")}
        title={t("Topshiriqlar")}
        description={t(
          "Bir martalik va davomiy topshiriqlarni bitta reyestrda muddat, ijrochi va holat bo‘yicha boshqaring.",
        )}
        actions={
          <>
            {onToggleClosed ? (
              <button className="secondary-button" disabled={loadingMore} onClick={onToggleClosed}>
                <Repeat2 size={17} />{" "}
                {includeClosed ? t("Faqat joriy topshiriqlar") : t("Eski bajarilganlarni ham ko‘rsatish")}
              </button>
            ) : null}
            {permissions.canExport ? (
              <button className="secondary-button" onClick={onExport}>
                <FileSpreadsheet size={17} /> {t("Excel’ga eksport")}
              </button>
            ) : null}
            {permissions.canCreateTask ? (
              <button className="primary-button" onClick={onNew}>
                <Plus size={17} /> {t("Topshiriq qo‘shish")}
              </button>
            ) : null}
          </>
        }
      />
      <div className="summary-strip">
        <Summary
          icon={<ClipboardList size={20} />}
          tone="blue"
          label={t("Ko‘rsatilmoqda")}
          value={t("{n} ta", { n: displayedTasks.length })}
        />
        <Summary
          icon={<CircleAlert size={20} />}
          tone="red"
          label={t("Kechikkan")}
          value={t("{n} ta", {
            n: displayedTasks.filter(
              (task) => task.deadlineIso && new Date(task.deadlineIso) < new Date() && task.status !== "Bajarildi",
            ).length,
          })}
        />
        <Summary
          icon={<UserCheck size={20} />}
          tone="amber"
          label={awaitingMineCount ? t("Qabulingizni kutmoqda") : t("Tekshiruvda")}
          value={t("{n} ta", { n: awaitingMineCount || reviewTasks.length })}
        />
        <Summary
          icon={<Pin size={20} />}
          tone="green"
          label={t("Mahkamlangan")}
          value={t("{n} ta", { n: tasks.filter((task) => task.pinned).length })}
        />
      </div>
      <article className="panel management-panel">
        <div className="management-toolbar">
          <div className="toolbar-title">
            <SlidersHorizontal size={17} />
            <span>{t("Topshiriqlar reyestri")}</span>
          </div>
          <div className="task-module-switch" role="tablist" aria-label={t("Topshiriq turi")}>
            <button
              role="tab"
              aria-selected={module === "all"}
              className={module === "all" ? "active" : ""}
              onClick={() => chooseModule("all")}
            >
              {t("Barchasi")} <em>{tasks.length}</em>
            </button>
            <button
              role="tab"
              aria-selected={module === "single"}
              className={module === "single" ? "active" : ""}
              onClick={() => chooseModule("single")}
            >
              {t("Bir martalik")} <em>{tasks.filter((task) => !task.recurring).length}</em>
            </button>
            <button
              role="tab"
              aria-selected={module === "recurring"}
              className={module === "recurring" ? "active" : ""}
              onClick={() => chooseModule("recurring")}
            >
              <Repeat2 size={14} /> {t("Davomiy")} <em>{tasks.filter((task) => task.recurring).length}</em>
            </button>
            <button
              role="tab"
              aria-selected={module === "review"}
              className={module === "review" ? "active" : ""}
              onClick={() => chooseModule("review")}
              title={
                awaitingMineCount
                  ? t("{n} ta topshiriq sizning qabulingizni kutmoqda", { n: awaitingMineCount })
                  : undefined
              }
            >
              <UserCheck size={14} /> {t("Tekshiruvda")} <em>{reviewTasks.length}</em>
            </button>
          </div>
        </div>
        <div className="task-card-grid">
          {visibleTasks.map((task) => (
            <article
              className={`task-detail-card clickable-card ${awaitingMine(task) ? "awaiting-acceptance" : ""}`}
              key={task.id}
              tabIndex={0}
              aria-label={t("{title} — topshiriqni ochish", { title: tx(task.title) })}
              onClick={() => onOpen(task.id)}
              onKeyDown={(event) => {
                // Only the card itself: nested buttons keep their own Enter/Space behaviour.
                if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onOpen(task.id);
                }
              }}
            >
              {awaitingMine(task) ? (
                <span className="acceptance-badge">
                  <UserCheck size={13} /> {t("Qabulingizni kutmoqda")}
                </span>
              ) : null}
              <div className="task-detail-top">
                <span className={`priority priority-${task.priority.toLowerCase().replace("‘", "")}`}>
                  {t(task.priority ?? "")}
                </span>
                <button
                  className={`pin-button ${task.pinned ? "pinned" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onPin(task);
                  }}
                >
                  <Pin size={16} />
                </button>
              </div>
              {task.topic ? (
                <span
                  className="topic-badge"
                  style={{
                    borderColor: task.topic.color,
                    color: task.topic.color,
                  }}
                >
                  {tx(task.topic.name)}
                </span>
              ) : null}
              <h3>{tx(task.title)}</h3>
              <div className="task-meta-line">
                <CalendarClock size={15} />
                <span>{deadlineLabel(task)}</span>
              </div>
              {task.recurring ? (
                <div className="task-meta-line recurring">
                  <Repeat2 size={15} />
                  <span>{t(task.recurrence ?? "")}</span>
                </div>
              ) : null}
              <div className="task-assignees-line">
                <div className="avatar-stack">
                  {task.assignments.slice(0, 4).map((person) => (
                    <span key={person.employeeId} className={`person-avatar ${avatarColor(person.employeeId)}`}>
                      {initials(person.name)}
                    </span>
                  ))}
                </div>
                <span>
                  {tx(task.assignments.map((person) => person.name).join(", ")) ||
                    tx(task.audiences.map((item) => item.targetName).join(", ")) ||
                    t("Ijrochi yo‘q")}
                </span>
              </div>
              <div className="task-detail-bottom">
                <span className={`status status-${task.status.toLowerCase().replaceAll("‘", "").replaceAll(" ", "-")}`}>
                  {t(task.status ?? "")}
                </span>
                <div className="card-progress">
                  <span>
                    <i style={{ width: `${task.progress}%` }} />
                  </span>
                  <strong>{task.progress}%</strong>
                </div>
              </div>
            </article>
          ))}
          {loadingMore ? <TaskSkeletonCards /> : null}
        </div>
        {visibleCount < displayedTasks.length ? (
          <div className="task-list-pagination">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setVisibleCount((current) => Math.min(displayedTasks.length, current + 36))}
            >
              <RefreshCw size={15} />{" "}
              {t("Yana {n} ta ko‘rsatish", { n: Math.min(36, displayedTasks.length - visibleCount) })}
            </button>
            <span>
              {visibleTasks.length} / {displayedTasks.length}
            </span>
          </div>
        ) : null}
        {hasMore && visibleCount >= displayedTasks.length && onLoadMore ? (
          <div className="task-list-pagination" role="status">
            <span>{t("Ro‘yxat to‘liq emas — serverda yana topshiriqlar bor.")}</span>
            <button type="button" className="secondary-button" disabled={loadingMore} onClick={onLoadMore}>
              <RefreshCw size={15} /> {loadingMore ? t("Yuklanmoqda...") : t("Yana yuklash")}
            </button>
          </div>
        ) : null}
        {displayedTasks.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={26} />
            <strong>{t("Topshiriqlar yo‘q")}</strong>
            <span>{t("Yangi topshiriq berilganda shu yerda ko‘rinadi.")}</span>
          </div>
        ) : null}
      </article>
    </section>
  );
}

export default TasksPage;
