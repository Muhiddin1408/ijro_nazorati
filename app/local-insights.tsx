"use client";

import {
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useI18n } from "../lib/i18n";

type InsightTask = {
  id: number;
  title: string;
  status: string;
  progress: number;
  priority: string;
  deadlineIso: string | null;
  assignments: Array<{ employeeId: number; name: string }>;
};

type InsightMeeting = {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string | null;
};

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function localDay(value: string | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function LocalInsightsPanel({ tasks, meetings }: { tasks: InsightTask[]; meetings: InsightMeeting[] }) {
  const { t, tx } = useI18n();
  const [view, setView] = useState<"risk" | "recommendation">("risk");
  const [analysisNow] = useState(() => Date.now());
  const analysis = useMemo(() => {
    const now = analysisNow;
    const active = tasks.filter((task) => task.status !== "Bajarildi" && task.status !== "Arxivlandi");
    const overdue = active.filter((task) => task.deadlineIso && new Date(task.deadlineIso).getTime() < now);
    const dueSoon = active.filter((task) => {
      if (!task.deadlineIso) return false;
      const remaining = new Date(task.deadlineIso).getTime() - now;
      return remaining >= 0 && remaining <= 48 * 60 * 60 * 1000;
    });
    const progressValues = active.map((task) => Number(task.progress) || 0);
    const progressMedian = median(progressValues);
    const deviation = median(progressValues.map((value) => Math.abs(value - progressMedian))) || 1;
    const anomalous = active
      .filter((task) => task.progress < progressMedian - 2 * deviation)
      .sort((a, b) => a.progress - b.progress);
    const unassigned = active.filter((task) => task.assignments.length === 0);
    const today = localDay(new Date(analysisNow));
    const todayMeetings = meetings
      .filter((meeting) => localDay(meeting.startsAt) === today)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const conflicts = todayMeetings.filter((meeting, index) => {
      const next = todayMeetings[index + 1];
      if (!next) return false;
      const meetingEnd = meeting.endsAt
        ? new Date(meeting.endsAt).getTime()
        : new Date(meeting.startsAt).getTime() + 60 * 60 * 1000;
      return meetingEnd > new Date(next.startsAt).getTime();
    });
    const riskScore = Math.min(
      100,
      overdue.length * 16 + dueSoon.length * 8 + anomalous.length * 7 + unassigned.length * 10 + conflicts.length * 12,
    );
    const risks = [
      overdue.length
        ? {
            icon: <CircleAlert size={17} />,
            title: t("{n} ta topshiriq kechikkan", { n: overdue.length }),
            text: overdue
              .slice(0, 2)
              .map((task) => tx(task.title))
              .join("; "),
            tone: "red",
          }
        : null,
      dueSoon.length
        ? {
            icon: <CalendarClock size={17} />,
            title: t("{n} ta muddat 48 soat ichida", { n: dueSoon.length }),
            text: t("Ijrochilardan oraliq natijani so‘rash tavsiya etiladi."),
            tone: "amber",
          }
        : null,
      anomalous.length
        ? {
            icon: <TrendingDown size={17} />,
            title: t("{n} ta noodatiy past ijro", { n: anomalous.length }),
            text: t("Median {median}%, eng past {lowest}%.", {
              median: Math.round(progressMedian),
              lowest: anomalous[0]?.progress ?? 0,
            }),
            tone: "violet",
          }
        : null,
      unassigned.length
        ? {
            icon: <ShieldCheck size={17} />,
            title: t("{n} ta topshiriqda shaxsiy ijrochi yo‘q", { n: unassigned.length }),
            text: t("Tashkilot auditoriyasidan mas’ul xodimni aniqlashtiring."),
            tone: "blue",
          }
        : null,
      conflicts.length
        ? {
            icon: <CalendarClock size={17} />,
            title: t("{n} ta yig‘ilish vaqti ustma-ust", { n: conflicts.length }),
            text: t("Bugungi taqvim vaqtlarini qayta ko‘rib chiqing."),
            tone: "amber",
          }
        : null,
    ].filter(Boolean) as Array<{ icon: ReactNode; title: string; text: string; tone: string }>;
    const recommendations = [
      overdue.length
        ? t("Avval {tasks} topshiriqlarini nazoratga oling.", {
            tasks: overdue
              .slice(0, 3)
              .map((task) => `“${tx(task.title)}”`)
              .join(", "),
          })
        : t("Kechikkan topshiriq yo‘q — joriy nazorat ritmini saqlang."),
      dueSoon.length
        ? t("{n} ta yaqin muddatli topshiriq bo‘yicha Telegram eslatmasini tekshiring.", { n: dueSoon.length })
        : t("Keyingi 48 soatda keskin muddat xavfi aniqlanmadi."),
      anomalous.length
        ? t("Past progressli {n} ta vazifada to‘siq va resurs ehtiyojini aniqlashtiring.", { n: anomalous.length })
        : t("Ijro sur’atida keskin og‘ish aniqlanmadi."),
    ];
    return { risks, recommendations, riskScore };
  }, [analysisNow, meetings, tasks, t, tx]);

  return (
    <section className="local-ai-panel panel" aria-label={t("Lokal aqlli tahlil")}>
      <header>
        <div className="local-ai-heading">
          <span>
            <BrainCircuit size={21} />
          </span>
          <div>
            <small>{t("BEPUL · TASHQI API-SIZ")}</small>
            <h2>{t("Aqlli tahlil")}</h2>
          </div>
        </div>
        <div className="local-ai-score">
          <strong>{analysis.riskScore}</strong>
          <span>{t("/100 xavf")}</span>
        </div>
        <div className="local-ai-tabs" role="tablist">
          <button
            id="local-insights-risk-tab"
            className={view === "risk" ? "active" : ""}
            onClick={() => setView("risk")}
            role="tab"
            aria-selected={view === "risk"}
            aria-controls="local-insights-panel"
          >
            {t("Xavflar")}
          </button>
          <button
            id="local-insights-recommendation-tab"
            className={view === "recommendation" ? "active" : ""}
            onClick={() => setView("recommendation")}
            role="tab"
            aria-selected={view === "recommendation"}
            aria-controls="local-insights-panel"
          >
            {t("Tavsiyalar")}
          </button>
        </div>
      </header>
      {view === "risk" ? (
        <div
          id="local-insights-panel"
          role="tabpanel"
          aria-labelledby="local-insights-risk-tab"
          className="local-ai-findings"
        >
          {analysis.risks.length ? (
            analysis.risks.slice(0, 4).map((item) => (
              <article key={item.title} className={`tone-${item.tone}`}>
                <span>{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </div>
              </article>
            ))
          ) : (
            <article className="tone-green">
              <span>
                <CheckCircle2 size={17} />
              </span>
              <div>
                <strong>{t("Keskin xavf aniqlanmadi")}</strong>
                <small>{t("Topshiriq va yig‘ilishlar joriy holati me’yorda.")}</small>
              </div>
            </article>
          )}
        </div>
      ) : (
        <div
          id="local-insights-panel"
          role="tabpanel"
          aria-labelledby="local-insights-recommendation-tab"
          className="local-ai-recommendations"
        >
          {analysis.recommendations.map((text, index) => (
            <article key={text}>
              <span>
                <Sparkles size={16} />
              </span>
              <div>
                <small>0{index + 1}</small>
                <strong>{text}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
      <footer>
        {t("Hisoblash brauzer ichida bajariladi; hech qanday ma’lumot tashqi AI xizmatiga yuborilmaydi.")}
      </footer>
    </section>
  );
}
