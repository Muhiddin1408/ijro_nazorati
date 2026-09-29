"use client";

import "./styles/information.css";
import { useI18n } from "../lib/i18n";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Gauge,
  FlaskConical,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TableProperties,
  X,
} from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { InformationDataWorkspace } from "./information-dashboard";
import { RoadLoader } from "./road-loader";
import { DIGITALIZATION_DOMAIN_CODE, type InformationOpenTarget } from "../lib/information-search-types";
import type {
  InformationTemplate,
  InformationDomain,
  InformationPayload,
  NoticeTone,
} from "./_components/information/information-types";
import {
  normalizeSummary,
  responseJson,
  LoadingState,
  EmptyState,
} from "./_components/information/information-helpers";
import { InformationRecordForm } from "./_components/information/record-form";
import { RecordDrawer } from "./_components/information/record-drawer";
import { InfoSummaryCard, DomainGrid, TemplateDirectory } from "./_components/information/information-catalog";

export type {
  InformationField,
  InformationTemplate,
  InformationDomain,
  InformationRecord,
} from "./_components/information/information-types";

const ResearchReports = lazy(() =>
  import("./research-reports").then((module) => ({ default: module.ResearchReports })),
);

export function InformationCenter({
  notify,
  initialTarget,
  onSearch,
}: {
  notify?: (text: string, tone?: NoticeTone) => void;
  initialTarget?: InformationOpenTarget;
  onSearch?: () => void;
}) {
  const i18n = useI18n();
  const [payload, setPayload] = useState<InformationPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(initialTarget?.domainId ?? null);
  const [researchOpen, setResearchOpen] = useState(initialTarget?.kind === "research");
  const [researchProjectId, setResearchProjectId] = useState<number | undefined>(
    initialTarget?.kind === "research" ? initialTarget.id : undefined,
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    initialTarget?.kind === "template" ? (initialTarget.templateId ?? initialTarget.id) : null,
  );
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [recordDetail, setRecordDetail] = useState<InformationPayload | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [formMode, setFormMode] = useState<"new" | "edit" | null>(null);
  const [formDefaults, setFormDefaults] = useState<Record<string, unknown>>({});
  const [reviewComment, setReviewComment] = useState("");
  const catalogRequestSequence = useRef(0);
  const catalogRequestController = useRef<AbortController | null>(null);
  const loadMoreRequestSequence = useRef(0);
  const loadMoreRequestController = useRef<AbortController | null>(null);
  const selectedTemplateIdRef = useRef<number | null>(
    initialTarget?.kind === "template" ? (initialTarget.templateId ?? initialTarget.id) : null,
  );
  const detailRequestSequence = useRef(0);
  const detailRequestController = useRef<AbortController | null>(null);

  const flash = useCallback(
    (text: string, tone: NoticeTone = "ok") => {
      if (notify) notify(i18n.tx(text), tone);
      else if (tone === "error") setError(i18n.tx(text));
    },
    [notify, i18n],
  );

  const load = useCallback(
    async (view: "domains" | "domain" | "template" = "domains", targetId?: number | null) => {
      const requestSequence = ++catalogRequestSequence.current;
      catalogRequestController.current?.abort();
      loadMoreRequestSequence.current += 1;
      loadMoreRequestController.current?.abort();
      setLoadingMore(false);
      const controller = new AbortController();
      catalogRequestController.current = controller;
      const params = new URLSearchParams({
        view,
        includeDemo: "0",
        limit: "50",
      });
      if (view === "domain" && targetId) params.set("domainId", String(targetId));
      if (view === "template" && targetId) params.set("templateId", String(targetId));
      try {
        setLoading(true);
        setError("");
        const next = await responseJson<InformationPayload>(
          await fetch(`/api/information?${params.toString()}`, {
            cache: view === "template" ? "no-store" : "default",
            signal: controller.signal,
          }),
        );
        if (controller.signal.aborted || requestSequence !== catalogRequestSequence.current) return;
        if (view === "template" && selectedTemplateIdRef.current !== targetId) return;
        if (targetId && view === "domain" && !next.domains?.some((domain) => domain.id === targetId)) {
          setError(i18n.t("Bu boshqarma mavjud emas yoki uni ko‘rish huquqingiz bekor qilingan."));
        } else if (targetId && view === "template" && !next.templates?.some((template) => template.id === targetId)) {
          setError(i18n.t("Bu ma’lumot shakli mavjud emas yoki uni ko‘rish huquqingiz bekor qilingan."));
        }
        setPayload((current) => {
          if (!current) return next;
          const domains = new Map((current.domains ?? []).map((item) => [item.id, item]));
          const templates = new Map((current.templates ?? []).map((item) => [item.id, item]));
          next.domains?.forEach((item) => domains.set(item.id, item));
          next.templates?.forEach((item) => templates.set(item.id, item));
          return {
            ...current,
            ...next,
            domains: [...domains.values()].sort(
              (left, right) => left.sortOrder - right.sortOrder || left.id - right.id,
            ),
            templates: [...templates.values()],
            summary: view === "domains" ? (next.summary ?? current.summary) : current.summary,
            records: view === "template" ? (next.records ?? []) : (current.records ?? []),
            totalCount: view === "template" ? (next.totalCount ?? next.records?.length ?? 0) : current.totalCount,
            nextCursor: view === "template" ? (next.nextCursor ?? null) : (current.nextCursor ?? null),
          };
        });
      } catch (loadError) {
        if (
          (loadError as { name?: string }).name !== "AbortError" &&
          requestSequence === catalogRequestSequence.current
        ) {
          setError(loadError instanceof Error ? i18n.tx(loadError.message) : i18n.t("Ma’lumotlar yuklanmadi"));
        }
      } finally {
        if (requestSequence === catalogRequestSequence.current) {
          if (catalogRequestController.current === controller) catalogRequestController.current = null;
          setLoading(false);
        }
      }
    },
    [i18n],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (initialTarget?.kind === "research") void load("domain", initialTarget.domainId);
      else if (initialTarget?.kind === "template") void load("template", initialTarget.templateId ?? initialTarget.id);
      else if (initialTarget?.kind === "record") void load("domain", initialTarget.domainId);
      else void load("domains", null);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      catalogRequestSequence.current += 1;
      loadMoreRequestSequence.current += 1;
      catalogRequestController.current?.abort();
      loadMoreRequestController.current?.abort();
      detailRequestSequence.current += 1;
      detailRequestController.current?.abort();
    };
  }, [load, initialTarget]);

  useEffect(() => {
    if (!selectedRecordId && !formMode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [formMode, selectedRecordId]);

  const openRecord = useCallback(
    async (id: number) => {
      const sequence = ++detailRequestSequence.current;
      detailRequestController.current?.abort();
      const controller = new AbortController();
      detailRequestController.current = controller;
      setSelectedRecordId(id);
      setRecordDetail(null);
      setDetailLoading(true);
      setReviewComment("");
      try {
        const detail = await responseJson<InformationPayload>(
          await fetch(`/api/information?recordId=${id}`, { cache: "no-store", signal: controller.signal }),
        );
        if (controller.signal.aborted || sequence !== detailRequestSequence.current) return;
        setRecordDetail(detail);
      } catch (detailError) {
        if (controller.signal.aborted || sequence !== detailRequestSequence.current) return;
        setSelectedRecordId(null);
        flash(detailError instanceof Error ? detailError.message : "Yozuv ochilmadi", "error");
      } finally {
        if (sequence === detailRequestSequence.current) setDetailLoading(false);
      }
    },
    [flash],
  );

  useEffect(() => {
    if (initialTarget?.kind !== "record") return;
    const timer = window.setTimeout(() => void openRecord(initialTarget.id), 0);
    return () => window.clearTimeout(timer);
  }, [initialTarget, openRecord]);

  async function loadMore() {
    if (!payload?.nextCursor || loadingMore) return;
    const templateId = selectedTemplateIdRef.current;
    if (!templateId) return;
    const requestSequence = ++loadMoreRequestSequence.current;
    loadMoreRequestController.current?.abort();
    const controller = new AbortController();
    loadMoreRequestController.current = controller;
    const params = new URLSearchParams({
      view: "template",
      includeDemo: "0",
      limit: "50",
      cursor: String(payload.nextCursor),
      catalog: "0",
    });
    if (selectedDomainId) params.set("domainId", String(selectedDomainId));
    params.set("templateId", String(templateId));
    try {
      setLoadingMore(true);
      const next = await responseJson<InformationPayload>(
        await fetch(`/api/information?${params.toString()}`, { cache: "no-store", signal: controller.signal }),
      );
      if (
        controller.signal.aborted ||
        requestSequence !== loadMoreRequestSequence.current ||
        selectedTemplateIdRef.current !== templateId
      )
        return;
      setPayload((current) => {
        if (!current) return next;
        const currentRecords = current.records ?? [];
        const existingIds = new Set(currentRecords.map((record) => record.id));
        return {
          ...current,
          ...next,
          domains: current.domains,
          templates: current.templates,
          summary: next.summary ?? current.summary,
          records: [...currentRecords, ...(next.records ?? []).filter((record) => !existingIds.has(record.id))],
        };
      });
    } catch (moreError) {
      if (
        (moreError as { name?: string }).name !== "AbortError" &&
        requestSequence === loadMoreRequestSequence.current
      ) {
        flash(moreError instanceof Error ? moreError.message : "Keyingi yozuvlar yuklanmadi", "error");
      }
    } finally {
      if (requestSequence === loadMoreRequestSequence.current) {
        if (loadMoreRequestController.current === controller) loadMoreRequestController.current = null;
        setLoadingMore(false);
      }
    }
  }

  const closeRecord = () => {
    if (busyAction) return;
    detailRequestSequence.current += 1;
    detailRequestController.current?.abort();
    setDetailLoading(false);
    setSelectedRecordId(null);
    setRecordDetail(null);
    setReviewComment("");
  };

  const summary = normalizeSummary(payload?.summary);
  const domains = payload?.domains ?? [];
  const templates = payload?.templates ?? [];
  const records = payload?.records ?? [];
  const selectedDomain = domains.find((domain) => domain.id === selectedDomainId) ?? null;
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? null;
  const domainTemplates = templates.filter(
    (template) =>
      !template.presentation?.hiddenFromCatalog && (!selectedDomainId || template.domainId === selectedDomainId),
  );
  const filteredTemplates = (() => {
    const needle = query.trim().toLocaleLowerCase("uz");
    if (!needle) return domainTemplates;
    return domainTemplates.filter((template) =>
      [template.name, template.presentation?.group, ...template.fields.map((field) => field.label)]
        .join(" ")
        .toLocaleLowerCase("uz")
        .includes(needle),
    );
  })();
  const selectedDetail = recordDetail?.record;
  const detailTemplate = recordDetail?.templates?.find((template) => template.id === selectedDetail?.templateId);
  const canEditSelectedDomain = selectedDomain?.canEdit ?? false;

  function enterDomain(domain: InformationDomain) {
    setResearchOpen(false);
    setResearchProjectId(undefined);
    setSelectedDomainId(domain.id);
    selectedTemplateIdRef.current = null;
    setSelectedTemplateId(null);
    setQuery("");
    void load("domain", domain.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function enterTemplate(template: InformationTemplate) {
    setResearchOpen(false);
    setResearchProjectId(undefined);
    setSelectedDomainId(template.domainId);
    selectedTemplateIdRef.current = template.id;
    setSelectedTemplateId(template.id);
    setPayload((current) => (current ? { ...current, records: [], totalCount: 0, nextCursor: null } : current));
    setQuery("");
    void load("template", template.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (researchOpen) {
      setResearchOpen(false);
      setResearchProjectId(undefined);
      if (selectedDomainId) void load("domain", selectedDomainId);
    } else if (selectedTemplateId) {
      cancelPendingInformationRequests();
      setSelectedTemplateId(null);
      setQuery("");
    } else if (selectedDomainId) {
      cancelPendingInformationRequests();
      setSelectedDomainId(null);
      setQuery("");
      void load("domains", null);
    }
  }

  function cancelPendingInformationRequests() {
    catalogRequestSequence.current += 1;
    loadMoreRequestSequence.current += 1;
    catalogRequestController.current?.abort();
    loadMoreRequestController.current?.abort();
    selectedTemplateIdRef.current = null;
    setLoading(false);
    setLoadingMore(false);
  }

  function returnToDomains() {
    setResearchOpen(false);
    setResearchProjectId(undefined);
    cancelPendingInformationRequests();
    setSelectedDomainId(null);
    setSelectedTemplateId(null);
    setQuery("");
    void load("domains", null);
  }

  async function recordAction(action: "return" | "publish" | "archive") {
    if (!selectedDetail || busyAction) return;
    if (action === "return" && reviewComment.trim().length < 3) {
      flash("Qaytarish sababini kamida 3 belgi bilan yozing", "error");
      return;
    }
    try {
      setBusyAction(action);
      const result = await responseJson<{ status: string }>(
        await fetch("/api/information", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedDetail.id,
            expectedVersion: selectedDetail.version,
            action,
            comment: reviewComment,
          }),
        }),
      );
      flash(
        action === "publish"
          ? result.status === "published"
            ? "Yozuv to‘liq tasdiqlandi"
            : "Bosqich tasdiqlandi, keyingi mas’ulga yuborildi"
          : action === "return"
            ? "Yozuv tahrir uchun qaytarildi"
            : "Yozuv arxivlandi",
      );
      await Promise.all([load("template", selectedDetail.templateId), openRecord(selectedDetail.id)]);
    } catch (actionError) {
      flash(actionError instanceof Error ? actionError.message : "Amal bajarilmadi", "error");
    } finally {
      setBusyAction("");
    }
  }

  if (!payload && loading)
    return (
      <section className="info-center-page">
        <LoadingState />
      </section>
    );

  return (
    <section className="info-center-page">
      {!selectedTemplate && !researchOpen ? (
        <div className="info-hero">
          <div className="info-hero-copy">
            <div className="info-hero-kicker">
              <Sparkles size={15} /> {i18n.t("MARKAZIY APPARAT · YAGONA MA’LUMOT MAYDONI")}
            </div>
            <h2>{i18n.t("Ma’lumotlar markazi")}</h2>
            <p>
              {i18n.t(
                "Qo‘mita boshqarmalari kesimidagi ma’lumot guruhlari, jadvallar va rahbar uchun asosiy ko‘rsatkichlar.",
              )}
            </p>
          </div>
          <div className="info-hero-actions">
            {onSearch ? (
              <button className="primary-button" onClick={onSearch}>
                <Sparkles size={17} /> {i18n.t("AI qidiruv")}
              </button>
            ) : null}
            <button
              className="secondary-button"
              onClick={() =>
                void load(
                  selectedTemplateId ? "template" : selectedDomainId ? "domain" : "domains",
                  selectedTemplateId ?? selectedDomainId,
                )
              }
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} /> {i18n.t("Yangilash")}
            </button>
            {selectedTemplate && canEditSelectedDomain ? (
              <button className="primary-button" onClick={() => setFormMode("new")}>
                <Plus size={17} /> {i18n.t("Ma’lumot kiritish")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="info-alert info-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{i18n.tx(error)}</span>
          <button
            onClick={() =>
              void load(
                selectedTemplateId ? "template" : selectedDomainId ? "domain" : "domains",
                selectedTemplateId ?? selectedDomainId,
              )
            }
          >
            {i18n.t("Qayta urinish")}
          </button>
        </div>
      ) : null}

      {!selectedTemplate && !researchOpen ? (
        <div className="info-summary-grid" aria-label={i18n.t("Ma’lumotlar markazi statistikasi")}>
          <InfoSummaryCard
            icon={<Layers3 size={20} />}
            label="Boshqarmalar"
            value={summary.domains || domains.length}
            note="markaziy apparat kesimida"
            tone="blue"
          />
          <InfoSummaryCard
            icon={<TableProperties size={20} />}
            label="Ma’lumot guruhlari"
            value={summary.templates || templates.length}
            note="mavzusiga mos jadvallar"
            tone="violet"
          />
          <InfoSummaryCard
            icon={<Gauge size={20} />}
            label="Ko‘rsatkichlar"
            value={summary.indicators || templates.reduce((sum, template) => sum + template.indicators.length, 0)}
            note="real ma’lumotdan hisoblanadi"
            tone="green"
          />
        </div>
      ) : null}

      <div className="info-breadcrumbs" aria-label={i18n.t("Sahifa yo‘li")}>
        {selectedDomainId || selectedTemplateId ? (
          <button
            className="info-back-button"
            onClick={goBack}
            aria-label={
              selectedTemplateId || researchOpen
                ? i18n.t("Boshqarma ma’lumotlariga qaytish")
                : i18n.t("Barcha boshqarmalarga qaytish")
            }
          >
            <ArrowLeft size={18} />{" "}
            <span>
              {selectedTemplateId || researchOpen
                ? i18n.t("Boshqarma ma’lumotlariga qaytish")
                : i18n.t("Barcha boshqarmalarga qaytish")}
            </span>
          </button>
        ) : null}
        <button className={!selectedDomainId ? "current" : ""} onClick={returnToDomains}>
          {i18n.t("Barcha boshqarmalar")}
        </button>
        {selectedDomain ? (
          <>
            <ChevronRight size={14} />
            <button
              className={!selectedTemplate ? "current" : ""}
              onClick={() => {
                if (selectedTemplateId || researchOpen) goBack();
              }}
            >
              {i18n.tx(selectedDomain.name)}
            </button>
          </>
        ) : null}
        {selectedTemplate ? (
          <>
            <ChevronRight size={14} />
            <span>{i18n.tx(selectedTemplate.name)}</span>
          </>
        ) : null}
        {researchOpen ? (
          <>
            <ChevronRight size={14} />
            <span>{i18n.t("Ilmiy tadqiqotlar")}</span>
          </>
        ) : null}
      </div>

      {!selectedTemplate && !researchOpen ? (
        <div className="info-toolbar">
          <label className="info-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                selectedTemplate
                  ? i18n.t("Yozuv nomi yoki qiymati bo‘yicha qidirish…")
                  : i18n.t("Boshqarma, ma’lumot guruhi yoki ko‘rsatkichni qidirish…")
              }
            />
            {query ? (
              <button onClick={() => setQuery("")} aria-label={i18n.t("Qidiruvni tozalash")}>
                <X size={15} />
              </button>
            ) : null}
          </label>
        </div>
      ) : null}

      {researchOpen && selectedDomain?.code === DIGITALIZATION_DOMAIN_CODE ? (
        <div className="research-report-panel">
          <Suspense fallback={<RoadLoader compact label="Ilmiy tadqiqotlar ochilmoqda" />}>
            <ResearchReports initialProjectId={researchProjectId} />
          </Suspense>
        </div>
      ) : selectedDomainId && !selectedDomain && !loading ? (
        <EmptyState
          title={i18n.t("Boshqarma ochilmadi")}
          text="Boshqarma mavjud emas yoki uni ko‘rish vakolatingiz o‘zgargan."
          action={
            <button className="secondary-button" onClick={returnToDomains}>
              {i18n.t("Barcha boshqarmalarga qaytish")}
            </button>
          }
        />
      ) : !selectedDomainId ? (
        <DomainGrid domains={domains} onOpen={enterDomain} query={query} />
      ) : !selectedTemplateId ? (
        loading && !filteredTemplates.length ? (
          <LoadingState />
        ) : (
          <div>
            {selectedDomain?.code === DIGITALIZATION_DOMAIN_CODE ? (
              <button
                className="info-research-entry"
                onClick={() => {
                  cancelPendingInformationRequests();
                  setSelectedTemplateId(null);
                  setResearchProjectId(undefined);
                  setResearchOpen(true);
                }}
              >
                <span>
                  <FlaskConical size={24} />
                </span>
                <span>
                  <strong>{i18n.t("Ilmiy tadqiqotlar va innovatsiyalar")}</strong>
                  <small>{i18n.t("Loyihalar, bosqichlar, muammolar va xorijiy tajriba")}</small>
                </span>
                <ArrowRight size={20} />
              </button>
            ) : null}
            <TemplateDirectory domain={selectedDomain} templates={filteredTemplates} onOpen={enterTemplate} />
          </div>
        )
      ) : selectedTemplate ? (
        <InformationDataWorkspace
          key={selectedTemplate.id}
          domain={selectedDomain}
          template={selectedTemplate}
          records={records}
          loading={loading}
          canCreate={canEditSelectedDomain}
          onCreate={(defaults = {}) => {
            setFormDefaults(defaults);
            setFormMode("new");
          }}
          onOpen={openRecord}
          hasMore={Boolean(payload?.nextCursor)}
          totalCount={payload?.totalCount ?? records.length}
          loadingMore={loadingMore}
          onLoadMore={() => void loadMore()}
        />
      ) : loading ? (
        <LoadingState />
      ) : (
        <EmptyState
          title={i18n.t("Ma’lumot shakli ochilmadi")}
          text="Ma’lumot shakli mavjud emas yoki uni ko‘rish vakolatingiz o‘zgargan."
          action={
            <button className="secondary-button" onClick={returnToDomains}>
              {i18n.t("Barcha boshqarmalarga qaytish")}
            </button>
          }
        />
      )}

      {selectedRecordId ? (
        <RecordDrawer
          payload={recordDetail}
          loading={detailLoading}
          comment={reviewComment}
          onComment={setReviewComment}
          onClose={closeRecord}
          onEdit={() => setFormMode("edit")}
          onAction={(action) => void recordAction(action)}
          busyAction={busyAction}
        />
      ) : null}

      {formMode && (formMode === "new" ? selectedTemplate : detailTemplate) ? (
        <InformationRecordForm
          mode={formMode}
          template={(formMode === "new" ? selectedTemplate : detailTemplate)!}
          domain={
            (formMode === "new"
              ? selectedDomain
              : recordDetail?.domains?.find((domain) => domain.id === selectedDetail?.domainId)) ?? selectedDomain
          }
          record={formMode === "edit" ? selectedDetail : undefined}
          defaults={formMode === "new" ? formDefaults : undefined}
          canSave={
            formMode === "edit"
              ? Boolean(selectedDetail?.allowedActions?.includes("save"))
              : Boolean(payload?.capabilities.enter)
          }
          canSubmit={
            formMode === "edit"
              ? Boolean(selectedDetail?.allowedActions?.includes("submit"))
              : Boolean(payload?.capabilities.submit)
          }
          canMarkDemo={payload?.capabilities.manage ?? false}
          onClose={() => setFormMode(null)}
          onSaved={async (id, submitted) => {
            setFormMode(null);
            flash(submitted ? "Ma’lumot ko‘rib chiqish uchun yuborildi" : "Qoralama saqlandi");
            await load("template", selectedDetail?.templateId ?? selectedTemplate?.id ?? null);
            if (formMode === "edit" || selectedRecordId) await openRecord(id);
          }}
          onError={(message) => flash(message, "error")}
        />
      ) : null}
    </section>
  );
}
