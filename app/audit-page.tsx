"use client";

import "./styles/audit.css";
import { Activity, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { exportAuditExcel } from "./audit-export";
import { readJson } from "./dashboard-kit";
import { useI18n } from "../lib/i18n";

type AuditPagePayload = { items: AuditItem[]; hasMore: boolean; truncated?: boolean };

export type AuditItem = {
  id: number;
  actorName: string;
  action: string;
  entityType: string;
  entityId: number | null;
  detail: unknown;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  "task.created": "Topshiriq yaratildi",
  "task.updated": "Topshiriq yangilandi",
  "task.forwarded": "Topshiriq yo‘naltirildi",
  "task.progress": "Ijro yangilandi",
  "task.submitted": "Ijro tekshiruvga yuborildi",
  "task.accepted": "Topshiriq qabul qilindi",
  "task.returned": "Topshiriq qayta ishlashga qaytarildi",
  "task.archived": "Topshiriq arxivlandi",
  "task.recurrence_created": "Davomiy topshiriqning yangi davri yaratildi",
  "employee.created": "Xodim qo‘shildi",
  "employee.updated": "Xodim yangilandi",
  "role.created": "Rol yaratildi",
  "role.updated": "Rol yangilandi",
  "meeting.created": "Yig‘ilish yaratildi",
  "meeting.updated": "Yig‘ilish yangilandi",
  "meeting.deleted": "Yig‘ilish bekor qilindi",
  "file.uploaded": "Fayl yuklandi",
  "file.deleted": "Fayl o‘chirildi",
  "telegram.link_created": "Telegram ulash havolasi yaratildi",
  "telegram.webhook_configured": "Telegram webhook sozlandi",
  "telegram.preferences_updated": "Telegram bildirishnoma sozlamalari yangilandi",
};

type Props = {
  items: AuditItem[];
  hasMore?: boolean;
  /** Fetch the first page when the page opens (the journal is not part of bootstrap). */
  loadOnMount?: boolean;
  formatDateTime: (value: string | Date, dateOnly?: boolean) => string;
  notify?: (text: string, tone?: "ok" | "error") => void;
  PageIntro?: (props: { kicker: string; title: string; description: string; actions?: ReactNode }) => ReactNode;
};

function DefaultPageIntro({
  kicker,
  title,
  description,
  actions,
}: {
  kicker: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="module-intro">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions ? <div className="module-actions">{actions}</div> : null}
    </div>
  );
}

function auditQuery(filters: { action: string; entityType: string }, extra: Record<string, string>) {
  const params = new URLSearchParams(extra);
  if (filters.action.trim()) params.set("action", filters.action.trim());
  if (filters.entityType) params.set("entityType", filters.entityType);
  return `/api/admin/audit?${params.toString()}`;
}

export function AuditPage({
  items: initialItems,
  hasMore: initialHasMore = false,
  loadOnMount = false,
  formatDateTime,
  notify,
  PageIntro = DefaultPageIntro,
}: Props) {
  const { t, tx } = useI18n();
  const [exporting, setExporting] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(loadOnMount);
  const [filters, setFilters] = useState({ action: "", entityType: "" });

  useEffect(() => {
    if (!loadOnMount) return;
    const controller = new AbortController();
    void fetch(auditQuery({ action: "", entityType: "" }, { offset: "0" }), {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => readJson<AuditPagePayload>(response))
      .then((page) => {
        setItems(page.items);
        setHasMore(page.hasMore);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          notify?.(error instanceof Error ? error.message : t("Audit jurnalini yuklab bo‘lmadi"), "error");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // The first page loads once; changing the language must not refetch it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOnMount, notify]);

  async function load(append: boolean) {
    if (loading) return;
    try {
      setLoading(true);
      const page = await readJson<AuditPagePayload>(
        await fetch(auditQuery(filters, { offset: String(append ? items.length : 0) }), { cache: "no-store" }),
      );
      setItems((current) => (append ? [...current, ...page.items] : page.items));
      setHasMore(page.hasMore);
    } catch (error) {
      notify?.(error instanceof Error ? error.message : t("Audit jurnalini yuklab bo‘lmadi"), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    if (exporting) return;
    try {
      setExporting(true);
      // Export the full filtered journal from the server, not just the loaded page.
      const full = await readJson<AuditPagePayload>(
        await fetch(auditQuery(filters, { export: "1" }), { cache: "no-store" }),
      );
      if (!full.items.length) {
        notify?.(t("Eksport uchun audit yozuvlari yo‘q"), "error");
        return;
      }
      await exportAuditExcel(
        full.items.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          actorName: item.actorName,
          action: item.action,
          actionLabel: ACTION_LABELS[item.action] ? t(ACTION_LABELS[item.action]) : item.action,
          entityType: item.entityType,
          entityId: item.entityId,
          detail: item.detail,
        })),
      );
      notify?.(
        full.truncated
          ? t("Excel faylga dastlabki 10 000 ta yozuv yuklandi — ro‘yxat to‘liq emas, filtrni toraytiring")
          : t("Audit jurnali Excel faylga yuklandi"),
      );
    } catch (error) {
      notify?.(error instanceof Error ? error.message : t("Audit eksporti bajarilmadi"), "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="module-page">
      <PageIntro
        kicker={t("XAVFSIZLIK")}
        title={t("Audit jurnali")}
        description={t("Muhim amallar kim, qachon va qaysi obyekt ustida bajargani bilan qayd etiladi.")}
        actions={
          <button type="button" className="secondary-button" disabled={exporting} onClick={() => void handleExport()}>
            <FileSpreadsheet size={17} />
            {exporting ? t("Eksport...") : t("Excel’ga eksport")}
          </button>
        }
      />
      <form
        className="task-list-pagination"
        onSubmit={(event) => {
          event.preventDefault();
          void load(false);
        }}
      >
        <input
          value={filters.action}
          placeholder={t("Amal kodi, masalan {example}", { example: "task." })}
          aria-label={t("Amal bo‘yicha filtr")}
          onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value }))}
        />
        <select
          value={filters.entityType}
          aria-label={t("Obyekt turi bo‘yicha filtr")}
          onChange={(event) => setFilters((current) => ({ ...current, entityType: event.target.value }))}
        >
          <option value="">{t("Barcha obyektlar")}</option>
          <option value="task">{t("Topshiriq")}</option>
          <option value="meeting">{t("Yig‘ilish")}</option>
          <option value="employee">{t("Xodim")}</option>
          <option value="role">{t("Rol")}</option>
          <option value="file">{t("Fayl")}</option>
          <option value="report">{t("Hisobot")}</option>
        </select>
        <button type="submit" className="secondary-button" disabled={loading}>
          {t("Filtrlash")}
        </button>
      </form>
      <article className="panel audit-list">
        {items.map((item) => (
          <div className="audit-row" key={item.id}>
            <span className="audit-icon">
              <Activity size={16} />
            </span>
            <div>
              <strong>{ACTION_LABELS[item.action] ? t(ACTION_LABELS[item.action]) : item.action}</strong>
              <small>
                {tx(item.actorName)} · <span data-alphabet-static="true">{item.entityType}</span>
                {item.entityId ? ` #${item.entityId}` : ""}
              </small>
            </div>
            <time>{formatDateTime(item.createdAt)}</time>
          </div>
        ))}
        {loading ? (
          <div role="status" aria-label={t("Audit jurnali yuklanmoqda")}>
            {Array.from({ length: items.length ? 3 : 6 }, (_, index) => (
              <div className="audit-row skeleton-row" aria-hidden="true" key={`skeleton-${index}`}>
                <span className="skeleton-circle" />
                <div>
                  <span className="skeleton-line" />
                  <span className="skeleton-line short" />
                </div>
                <span className="skeleton-line short" />
              </div>
            ))}
          </div>
        ) : null}
        {hasMore ? (
          <div className="task-list-pagination" role="status">
            <span>{t("Ro‘yxat to‘liq emas — yana yozuvlar bor.")}</span>
            <button type="button" className="secondary-button" disabled={loading} onClick={() => void load(true)}>
              <RefreshCw size={15} /> {loading ? t("Yuklanmoqda...") : t("Yana yuklash")}
            </button>
          </div>
        ) : null}
        {items.length === 0 && !loading ? (
          <div className="empty-state">
            <Activity size={25} />
            <strong>{t("Audit yozuvlari yo‘q")}</strong>
            <span>{t("Yangi amallar bajarilganda shu yerda paydo bo‘ladi.")}</span>
          </div>
        ) : null}
      </article>
    </section>
  );
}

export default AuditPage;
