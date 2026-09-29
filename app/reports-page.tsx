"use client";

import "./styles/reports.css";
import { useI18n } from "../lib/i18n";
/**
 * Hierarchical reports workspace: cycle list, svod, fill/delegate/create modals.
 * Extracted from dashboard.tsx so the shell only mounts the page.
 */

import {
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageIntro, readJson } from "./dashboard-kit";
import { formatDateTime, humanSize } from "./ui-helpers";
import type {
  ReportAssignment,
  ReportsPayload,
  ReportsPageTask,
  ReportsPageActor,
  ReportsPageDepartment,
} from "./_components/reports/report-types";
import {
  departmentPerformance,
  Summary,
  reportStatusLabel,
  reportFrequencyLabel,
  reportDeadlineTone,
  reportDepth,
  aggregateReportValues,
  reportAggregateRows,
  downloadReportRegister,
  uploadReportFile,
} from "./_components/reports/report-helpers";
import { NewReportModal } from "./_components/reports/new-report-modal";
import { ReportFillModal } from "./_components/reports/report-fill-modal";
import { ReportDelegateModal } from "./_components/reports/report-delegate-modal";
import { promptDialog } from "./_components/ui/confirm-dialog";
export { ReportDelegateModal } from "./_components/reports/report-delegate-modal";
export { ReportFillModal } from "./_components/reports/report-fill-modal";
export { NewReportModal } from "./_components/reports/new-report-modal";
export type {
  ReportColumn,
  ReportFile,
  ReportOrganization,
  ReportAssignment,
  ReportsPayload,
  ReportsPageTask,
  ReportsPageActor,
  ReportsPageDepartment,
} from "./_components/reports/report-types";

export function ReportsPage({
  tasks,
  departments,
  onExport,
  notify,
}: {
  actor: ReportsPageActor;
  tasks: ReportsPageTask[];
  departments: ReportsPageDepartment[];
  onExport: () => void;
  notify: (text: string, tone?: "ok" | "error") => void;
}) {
  const i18n = useI18n();
  const [tab, setTab] = useState<"periodic" | "analytics">("periodic");
  const [payload, setPayload] = useState<ReportsPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [reportModal, setReportModal] = useState<
    | { type: "new"; templateId?: number }
    | { type: "fill"; assignment: ReportAssignment }
    | { type: "delegate"; assignment: ReportAssignment }
    | null
  >(null);
  const overviewRequest = useRef(0);

  const refreshReports = useCallback(async () => {
    const request = ++overviewRequest.current;
    try {
      const result = await readJson<ReportsPayload>(await fetch("/api/reports", { cache: "no-store" }));
      if (request !== overviewRequest.current) return;
      setPayload(result);
      setSelectedCycleId((current) =>
        current && result.assignments.some((item) => item.cycleId === current)
          ? current
          : (result.assignments[0]?.cycleId ?? null),
      );
    } catch (error) {
      if (request !== overviewRequest.current) return;
      notify(error instanceof Error ? i18n.tx(error.message) : i18n.t("Hisobotlarni yuklab bo‘lmadi"), "error");
    }
  }, [notify, i18n]);

  async function loadMoreReports() {
    if (!payload?.nextCursor || loadingMore) return;
    const request = overviewRequest.current;
    const cursor = payload.nextCursor;
    setLoadingMore(true);
    try {
      const result = await readJson<ReportsPayload>(
        await fetch(`/api/reports?cursor=${cursor}`, { cache: "no-store" }),
      );
      if (request !== overviewRequest.current) return;
      setPayload((current) =>
        current?.nextCursor === cursor
          ? {
              ...current,
              nextCursor: result.nextCursor,
              assignments: [
                ...current.assignments,
                ...result.assignments.filter(
                  (item) => !current.assignments.some((existing) => existing.id === item.id),
                ),
              ],
            }
          : current,
      );
    } catch (error) {
      notify(error instanceof Error ? i18n.tx(error.message) : i18n.t("Keyingi hisobotlar yuklanmadi"), "error");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshReports(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshReports]);

  async function perform(action: () => Promise<void>, success: string) {
    try {
      setBusy(true);
      await action();
      setReportModal(null);
      await refreshReports();
      notify(i18n.tx(success));
    } catch (error) {
      notify(error instanceof Error ? i18n.tx(error.message) : i18n.t("Amal bajarilmadi"), "error");
    } finally {
      setBusy(false);
    }
  }

  const completed = tasks.filter((task) => task.status === "Bajarildi").length;
  const overdue = tasks.filter(
    (task) => task.status !== "Bajarildi" && task.deadlineIso && new Date(task.deadlineIso) < new Date(),
  ).length;
  const stats = departmentPerformance(tasks);
  const groups = payload
    ? Array.from(
        new Map(
          payload.assignments.map((assignment) => [
            assignment.cycleId,
            {
              cycleId: assignment.cycleId,
              title: assignment.template.title,
              code: assignment.template.code,
              period: assignment.period,
              frequency: assignment.template.frequency,
              assignments: payload.assignments.filter((item) => item.cycleId === assignment.cycleId),
            },
          ]),
        ).values(),
      )
    : [];
  const selectedGroup = groups.find((group) => group.cycleId === selectedCycleId) ?? groups[0];
  const groupAssignments = selectedGroup?.assignments ?? [];
  const selectedTemplate = groupAssignments[0]?.template;
  const officialRows = reportAggregateRows(groupAssignments);
  const aggregate =
    selectedTemplate && !payload?.nextCursor ? aggregateReportValues(selectedTemplate.columns, officialRows) : {};
  const submittedCount = groupAssignments.filter((item) => ["submitted", "approved"].includes(item.status)).length;
  const lateCount = payload?.assignments.filter((item) => item.overdue).length ?? 0;

  return (
    <section className="module-page report-module">
      <PageIntro
        kicker="IERARXIK HISOBOTLAR"
        title={i18n.t("Hisobotlarni shakllantirish va boshqarish")}
        description="Qo‘mita, hududiy bosh boshqarmalar va tuman tashkilotlari bo‘yicha topshirish, svod va chuqurlashtirilgan nazorat."
        actions={
          <>
            {tab === "periodic" && payload?.canManageReports ? (
              <button className="primary-button" onClick={() => setReportModal({ type: "new" })}>
                <Plus size={17} /> {i18n.t("Namunaviy hisobot")}
              </button>
            ) : null}
          </>
        }
      />
      <div className="report-tabs" role="tablist" aria-label={i18n.t("Hisobot turlari")}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "periodic"}
          className={tab === "periodic" ? "active" : ""}
          onClick={() => setTab("periodic")}
        >
          <FileSpreadsheet size={16} /> {i18n.t("Davriy hisobotlar")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "analytics"}
          className={tab === "analytics" ? "active" : ""}
          onClick={() => setTab("analytics")}
        >
          <BarChart3 size={16} /> {i18n.t("Ijro tahlili")}
        </button>
      </div>
      {tab === "analytics" ? (
        <div role="tabpanel" className="report-grid">
          <article className="panel report-chart wide">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">{i18n.t("BO‘LIMLAR")}</p>
                <h2>{i18n.t("Topshiriqlar ijrosi")}</h2>
              </div>
              <button className="secondary-button" onClick={onExport}>
                <FileSpreadsheet size={16} /> {i18n.t("Excel")}
              </button>
            </div>
            <div className="ranking-list">
              {stats.length
                ? stats.map((row, index) => (
                    <div key={row.name}>
                      <span className="rank-number">{index + 1}</span>
                      <strong>{i18n.tx(row.name)}</strong>
                      <span className="rank-bar">
                        <i style={{ width: `${row.progress}%` }} />
                      </span>
                      <em>{row.progress}%</em>
                    </div>
                  ))
                : departments.slice(0, 4).map((department, index) => (
                    <div key={department.id}>
                      <span className="rank-number">{index + 1}</span>
                      <strong>{i18n.tx(department.name)}</strong>
                      <span className="rank-bar">
                        <i style={{ width: "0%" }} />
                      </span>
                      <em>0%</em>
                    </div>
                  ))}
            </div>
          </article>
          <article className="panel report-chart">
            <div className="panel-heading compact">
              <div>
                <p className="section-kicker">{i18n.t("HOLATLAR")}</p>
                <h2>{i18n.t("Tezkor ko‘rsatkichlar")}</h2>
              </div>
            </div>
            <div className="quick-stats">
              <div>
                <strong>{tasks.length}</strong>
                <span>{i18n.t("Jami topshiriq")}</span>
              </div>
              <div>
                <strong>{completed}</strong>
                <span>{i18n.t("Bajarilgan")}</span>
              </div>
              <div>
                <strong>{overdue}</strong>
                <span>{i18n.t("Kechikkan")}</span>
              </div>
            </div>
          </article>
        </div>
      ) : (
        <div role="tabpanel">
          {payload?.nextCursor ? (
            <div className="info-alert" role="status">
              <span>
                {payload.assignments.length}{" "}
                {i18n.t("ta topshiriq yuklangan. To‘liq svod va eksport uchun qolganlarini yuklang.")}
              </span>
              <button
                type="button"
                className="secondary-button"
                disabled={loadingMore}
                onClick={() => void loadMoreReports()}
              >
                {loadingMore ? i18n.t("Yuklanmoqda…") : i18n.t("Keyingi 500 ta topshiriq")}
              </button>
            </div>
          ) : null}
          <div className="summary-strip report-summary">
            <Summary
              icon={<FileSpreadsheet size={20} />}
              tone="blue"
              label="Hisobot davrlari"
              value={`${groups.length} ta`}
            />
            <Summary
              icon={<Send size={20} />}
              tone="violet"
              label="Yuborilgan"
              value={`${payload?.assignments.filter((item) => ["submitted", "approved"].includes(item.status)).length ?? 0} ta`}
            />
            <Summary icon={<CircleAlert size={20} />} tone="red" label="Muddati o‘tgan" value={`${lateCount} ta`} />
            <Summary
              icon={<Building2 size={20} />}
              tone="green"
              label="Tashkilotlar"
              value={`${payload?.organizations.filter((item) => item.active).length ?? 0} ta`}
            />
          </div>
          {!payload ? (
            <article className="panel report-loading">
              <RefreshCw className="spin" size={22} />
              <span>{i18n.t("Hisobotlar yuklanmoqda...")}</span>
            </article>
          ) : groups.length === 0 ? (
            <article className="panel empty-state report-empty">
              <FileSpreadsheet size={30} />
              <strong>{i18n.t("Hisobot topshirig‘i hali yo‘q")}</strong>
              <span>
                {payload.canManageReports
                  ? i18n.t("Birinchi namunaviy hisobotni yarating va mas’ul tashkilotlarga yuboring.")
                  : i18n.t("Sizga hisobot biriktirilganda shu yerda ko‘rinadi.")}
              </span>
              {payload.canManageReports ? (
                <button className="primary-button" onClick={() => setReportModal({ type: "new" })}>
                  <Plus size={16} /> {i18n.t("Hisobot yaratish")}
                </button>
              ) : null}
            </article>
          ) : (
            <div className="reports-workspace">
              <aside className="panel report-cycle-list">
                <div className="report-list-head">
                  <div>
                    <p className="section-kicker">{i18n.t("DAVRLAR")}</p>
                    <h3>{i18n.t("Hisobotlar reyestri")}</h3>
                  </div>
                  <span>{groups.length}</span>
                </div>
                {groups.map((group) => {
                  const done = group.assignments.filter((item) =>
                    ["submitted", "approved"].includes(item.status),
                  ).length;
                  const late = group.assignments.some((item) => item.overdue);
                  return (
                    <button
                      key={group.cycleId}
                      className={selectedGroup?.cycleId === group.cycleId ? "active" : ""}
                      onClick={() => setSelectedCycleId(group.cycleId)}
                    >
                      <span className="report-list-icon">
                        <FileSpreadsheet size={18} />
                      </span>
                      <span>
                        <strong>{i18n.tx(group.title)}</strong>
                        <small>
                          {i18n.t(group.period.label)} · {i18n.t(reportFrequencyLabel(group.frequency))}
                        </small>
                        <em className={late ? "late" : ""}>
                          {done}/{group.assignments.length} {i18n.t("yuborilgan")}
                        </em>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })}
              </aside>
              <article className="panel report-detail-panel">
                {selectedGroup && selectedTemplate ? (
                  <>
                    <header className="report-detail-head">
                      <div>
                        <span className="report-code">{selectedGroup.code}</span>
                        <h3>{i18n.tx(selectedGroup.title)}</h3>
                        <p>
                          {i18n.tx(selectedTemplate.ownerDepartment) || i18n.t("Mas’ul boshqarma")} ·{" "}
                          {i18n.tx(selectedTemplate.creatorName)}
                        </p>
                      </div>
                      <div className="report-head-actions">
                        <button
                          className="secondary-button compact-button"
                          disabled={Boolean(payload.nextCursor)}
                          onClick={() =>
                            void downloadReportRegister(
                              groupAssignments,
                              selectedTemplate,
                              selectedGroup.period.label,
                            ).catch((error) =>
                              notify(
                                error instanceof Error ? i18n.tx(error.message) : i18n.t("Yig‘ma Excel tayyorlanmadi"),
                                "error",
                              ),
                            )
                          }
                        >
                          <Download size={15} /> {i18n.t("Yig‘ma Excel")}
                        </button>
                        <div
                          className={`report-deadline ${groupAssignments.some((item) => reportDeadlineTone(item) === "late") ? "late" : ""}`}
                        >
                          <Clock3 size={17} />
                          <span>
                            <small>{i18n.t("Topshirish muddati")}</small>
                            <strong>{formatDateTime(selectedGroup.period.deadlineAt)}</strong>
                          </span>
                        </div>
                      </div>
                    </header>
                    {selectedTemplate.instructions ? (
                      <div className="report-instruction">
                        <FileText size={18} />
                        <div>
                          <strong>{i18n.t("Hisobotni to‘ldirish bo‘yicha ko‘rsatma")}</strong>
                          <p>{i18n.tx(selectedTemplate.instructions)}</p>
                        </div>
                      </div>
                    ) : null}
                    {groupAssignments[0]?.templateFiles.length ? (
                      <div className="report-template-files">
                        {groupAssignments[0].templateFiles.map((file) => (
                          <a key={file.id} href={`/api/reports/files?id=${file.id}`}>
                            <Paperclip size={15} />
                            <span>{file.fileName}</span>
                            <small>{humanSize(file.size)}</small>
                            <Download size={14} />
                          </a>
                        ))}
                      </div>
                    ) : null}
                    <div className="report-detail-metrics">
                      <div>
                        <small>{i18n.t("Tashkilotlar")}</small>
                        <strong>{groupAssignments.length}</strong>
                      </div>
                      <div>
                        <small>{i18n.t("Yuborilgan")}</small>
                        <strong>{submittedCount}</strong>
                      </div>
                      <div>
                        <small>{i18n.t("Bajarilish")}</small>
                        <strong>
                          {groupAssignments.length ? Math.round((submittedCount / groupAssignments.length) * 100) : 0}%
                        </strong>
                      </div>
                    </div>
                    <section className="report-svod">
                      <div className="detail-heading">
                        <h3>
                          <BarChart3 size={17} /> {i18n.t("Avtomatik svod")}
                        </h3>
                        <span>
                          {payload.nextCursor
                            ? i18n.t("Svod uchun barcha sahifalarni yuklang")
                            : i18n.t("Yuborilgan qatorlar asosida hisoblangan")}
                        </span>
                      </div>
                      <div className="svod-grid">
                        {selectedTemplate.columns.map((column) => (
                          <div key={column.id}>
                            <small>{i18n.t(column.label)}</small>
                            <strong>{aggregate[column.id] === undefined ? "—" : String(aggregate[column.id])}</strong>
                            <em>
                              {i18n.tx(column.unit) || (column.aggregation === "average" ? i18n.t("o‘rtacha") : "")}
                            </em>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="report-breakdown">
                      <div className="detail-heading">
                        <h3>
                          <Building2 size={17} /> {i18n.t("Tashkilotlar va tumanlar kesimida")}
                        </h3>
                        <span>{i18n.t("Barcha ustunlar, kim to‘ldirgani va yuborilgan vaqt ko‘rinadi")}</span>
                      </div>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>{i18n.t("Tashkilot")}</th>
                              <th>{i18n.t("Mas’ul / to‘ldirgan")}</th>
                              {selectedTemplate.columns.map((column) => (
                                <th key={column.id}>{i18n.t(column.label)}</th>
                              ))}
                              <th>{i18n.t("Holat")}</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {groupAssignments
                              .slice()
                              .sort(
                                (a, b) =>
                                  reportDepth(a, groupAssignments) - reportDepth(b, groupAssignments) ||
                                  a.organization.name.localeCompare(b.organization.name),
                              )
                              .map((assignment) => {
                                const depth = reportDepth(assignment, groupAssignments);
                                const canFill = assignment.capabilities.edit;
                                const hasChildren = payload.organizations.some(
                                  (organization) =>
                                    organization.parentId === assignment.organization.id && organization.active,
                                );
                                const canReview = assignment.capabilities.review;
                                return (
                                  <tr key={assignment.id}>
                                    <td>
                                      <div className="report-org-cell" style={{ paddingLeft: `${depth * 18}px` }}>
                                        {depth ? <ChevronRight size={14} /> : <Building2 size={14} />}
                                        <span>
                                          <strong>
                                            {i18n.tx(assignment.organization.shortName) ||
                                              i18n.tx(assignment.organization.name)}
                                          </strong>
                                          <small>
                                            {assignment.organization.type === "district"
                                              ? i18n.t("Tuman tashkiloti")
                                              : assignment.organization.type === "territorial"
                                                ? i18n.t("Hududiy bosh boshqarma")
                                                : assignment.organization.type === "direct_subordinate"
                                                  ? i18n.t("To‘g‘ridan-to‘g‘ri bo‘ysunuvchi")
                                                  : i18n.t("Markaziy apparat")}
                                          </small>
                                        </span>
                                      </div>
                                    </td>
                                    <td>
                                      <strong>{i18n.tx(assignment.responsible.name)}</strong>
                                      <small className="table-subline">
                                        {assignment.submittedBy
                                          ? i18n.t("{name} · {p1} qator · {p2}", {
                                              name: i18n.tx(assignment.submittedBy.name),
                                              p1: assignment.rowCount || 1,
                                              p2: i18n.tx(
                                                assignment.submittedAt ? formatDateTime(assignment.submittedAt) : "",
                                              ),
                                            })
                                          : i18n.t("Hali yuborilmagan")}
                                      </small>
                                    </td>
                                    {selectedTemplate.columns.map((column) => (
                                      <td key={column.id}>
                                        {assignment.values[column.id] === undefined
                                          ? "—"
                                          : i18n.t("{p0}{p1}", {
                                              p0: i18n.tx(String(assignment.values[column.id])),
                                              p1: i18n.tx(column.unit ? ` ${column.unit}` : ""),
                                            })}
                                      </td>
                                    ))}
                                    <td>
                                      <span className={`report-status ${assignment.status}`}>
                                        {i18n.t(reportStatusLabel(assignment.status))}
                                      </span>
                                      {assignment.overdue ? (
                                        <span className="report-status returned report-overdue-badge">
                                          {i18n.t("Muddati o‘tgan")}
                                        </span>
                                      ) : null}
                                    </td>
                                    <td>
                                      <div className="report-row-actions">
                                        {canFill ? (
                                          <button
                                            title={i18n.t("Hisobotni to‘ldirish")}
                                            onClick={() => setReportModal({ type: "fill", assignment })}
                                          >
                                            <Pencil size={14} />
                                          </button>
                                        ) : (
                                          <button
                                            title={i18n.t("Hisobot qatorlarini ko‘rish")}
                                            onClick={() => setReportModal({ type: "fill", assignment })}
                                          >
                                            <Eye size={14} />
                                          </button>
                                        )}
                                        {assignment.capabilities.delegate && hasChildren ? (
                                          <button
                                            title={i18n.t("Quyi tashkilotga yuborish")}
                                            onClick={() => setReportModal({ type: "delegate", assignment })}
                                          >
                                            <Send size={14} />
                                          </button>
                                        ) : null}
                                        {canReview ? (
                                          <>
                                            <button
                                              className="approve"
                                              title={i18n.t("Tasdiqlash")}
                                              disabled={busy}
                                              onClick={() =>
                                                void perform(async () => {
                                                  await readJson(
                                                    await fetch("/api/reports", {
                                                      method: "PATCH",
                                                      headers: { "Content-Type": "application/json" },
                                                      body: JSON.stringify({
                                                        action: "approve",
                                                        assignmentId: assignment.id,
                                                        expectedVersion: assignment.version,
                                                      }),
                                                    }),
                                                  );
                                                }, "Hisobot tasdiqlandi")
                                              }
                                            >
                                              <Check size={14} />
                                            </button>
                                            <button
                                              className="return"
                                              title={i18n.t("Qaytarish")}
                                              disabled={busy}
                                              onClick={async () => {
                                                const comment = await promptDialog({
                                                  title: i18n.t("Hisobotni qaytarish"),
                                                  message: i18n.t("“{name}” hisobotini tuzatish uchun qaytarasizmi?", {
                                                    name: i18n.tx(assignment.organization.name),
                                                  }),
                                                  inputLabel: i18n.t("Qaytarish sababi"),
                                                  confirmLabel: i18n.t("Qaytarish"),
                                                  tone: "danger",
                                                });
                                                if (comment == null) return;
                                                void perform(async () => {
                                                  await readJson(
                                                    await fetch("/api/reports", {
                                                      method: "PATCH",
                                                      headers: { "Content-Type": "application/json" },
                                                      body: JSON.stringify({
                                                        action: "return",
                                                        assignmentId: assignment.id,
                                                        expectedVersion: assignment.version,
                                                        comment,
                                                      }),
                                                    }),
                                                  );
                                                }, "Hisobot tuzatish uchun qaytarildi");
                                              }}
                                            >
                                              <RefreshCw size={14} />
                                            </button>
                                          </>
                                        ) : null}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </>
                ) : null}
              </article>
            </div>
          )}
        </div>
      )}
      {reportModal?.type === "new" && payload ? (
        <NewReportModal
          createdTemplateId={reportModal.templateId}
          organizations={payload.organizations.filter((item) => item.active)}
          employees={payload.employees}
          busy={busy}
          onClose={() => setReportModal(null)}
          onSubmit={(form, file) =>
            void perform(async () => {
              const created = reportModal.templateId
                ? { templateId: reportModal.templateId }
                : await readJson<{ templateId: number }>(
                    await fetch("/api/reports", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(form),
                    }),
                  );
              setReportModal({ type: "new", templateId: created.templateId });
              if (file) await uploadReportFile(file, `templateId=${created.templateId}`);
            }, "Namunaviy hisobot yaratildi va mas’ullarga yuborildi")
          }
        />
      ) : null}
      {reportModal?.type === "fill" ? (
        <ReportFillModal
          assignment={reportModal.assignment}
          busy={busy}
          notify={notify}
          onClose={() => setReportModal(null)}
          onSaved={async () => {
            setReportModal(null);
            await refreshReports();
          }}
        />
      ) : null}
      {reportModal?.type === "delegate" && payload ? (
        <ReportDelegateModal
          assignment={reportModal.assignment}
          organizations={payload.organizations}
          employees={payload.employees}
          busy={busy}
          onClose={() => setReportModal(null)}
          onSubmit={(recipients) =>
            void perform(async () => {
              await readJson(
                await fetch("/api/reports", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "delegate",
                    assignmentId: reportModal.assignment.id,
                    expectedVersion: reportModal.assignment.version,
                    recipients,
                  }),
                }),
              );
            }, "Hisobot quyi tashkilotlarga yuborildi")
          }
        />
      ) : null}
    </section>
  );
}
