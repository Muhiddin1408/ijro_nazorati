"use client";

import { useI18n } from "../lib/i18n";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Database,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  ListFilter,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { InformationDomain, InformationRecord, InformationTemplate } from "./information-center";
import { RoadLoader } from "./road-loader";
import { embeddedRecordTitle } from "../lib/table-values";
import type { WorkspaceRecord } from "./_components/information/workspace-types";
import {
  numberFormatter,
  normalized,
  statusLabel,
  formatDate,
  numericValue,
  isAverageMetric,
  aggregateMetric,
  displayFieldLabel,
  dimensionListLabel,
  formatMetric,
  formatCell,
  renderCell,
  asWorkspaceRecord,
  matchesPresentationTab,
  drillDimensions,
  metricFields,
  configuredPeriodValue,
  dimensionValue,
  aggregateRows,
  oavSummary,
  filterCandidates,
  orderedFieldsFor,
  recordMatchesFacets,
} from "./_components/information/workspace-model";
import {
  recordNoun,
  sourceSamplesCache,
  loadSourceSamples,
  makeSampleRecords,
} from "./_components/information/workspace-samples";
import type { SourceSamples } from "./_components/information/workspace-samples";
import { exportWorkspace } from "./_components/information/workspace-export";
import { SummaryCard, FacetFilterControl, DimensionIcon, PreviewDrawer } from "./_components/information/workspace-ui";

export function InformationDataWorkspace({
  domain,
  template,
  records,
  loading,
  canCreate,
  onCreate,
  onOpen,
  hasMore,
  totalCount,
  loadingMore,
  onLoadMore,
}: {
  domain: InformationDomain | null;
  template: InformationTemplate;
  records: InformationRecord[];
  loading: boolean;
  canCreate: boolean;
  onCreate: (defaults?: Record<string, unknown>) => void;
  onOpen: (id: number) => void;
  hasMore: boolean;
  totalCount: number;
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  const i18n = useI18n();
  const sourceProfile = template.presentation?.profile ?? "";
  const tabs = template.presentation?.tabs ?? [];
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? null;
  const effectiveTemplate = useMemo<InformationTemplate>(
    () => ({
      ...template,
      presentation: {
        ...template.presentation,
        filters: activeTab?.filters ?? template.presentation?.filters,
        detailColumns: activeTab?.columns ?? template.presentation?.detailColumns,
        tableColumns: activeTab?.columns ?? template.presentation?.tableColumns,
        drilldown:
          sourceProfile === "appeals_consolidated"
            ? [activeTab?.id === "mavzu" ? "murojaat_mavzusi" : "hudud"]
            : sourceProfile === "appeals_special_control"
              ? ["__leaf_only"]
              : template.presentation?.drilldown,
      },
    }),
    [activeTab, sourceProfile, template],
  );
  const [drillPath, setDrillPath] = useState<Array<{ code: string; value: string }>>([]);
  const [search, setSearch] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [facetFilters, setFacetFilters] = useState<Record<string, string>>({});
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(
    () =>
      new Set(
        orderedFieldsFor(effectiveTemplate)
          .slice(0, 9)
          .map((field) => field.code),
      ),
  );
  const [previewRecord, setPreviewRecord] = useState<WorkspaceRecord | null>(null);
  const [notice, setNotice] = useState("");
  const [showExample, setShowExample] = useState(false);

  const actualRecords = useMemo(() => records.map(asWorkspaceRecord), [records]);
  const emptyActualData = !loading && actualRecords.length === 0;
  const demoMode = emptyActualData && showExample;
  const isPartiallyLoaded = !demoMode && (hasMore || totalCount > actualRecords.length);
  const loadedScopeCount =
    totalCount > actualRecords.length ? `${actualRecords.length} / ${totalCount}` : String(actualRecords.length);
  const exportCoverageNote = isPartiallyLoaded
    ? `Qamrov: ${loadedScopeCount} ta manba yozuvi yuklangan; eksport faqat yuklangan qatorlardan tuzildi`
    : demoMode
      ? "NAMUNA: bu ma’lumotlar real hisobotga kirmaydi"
      : "";
  const schemaOnlyMode = demoMode && template.presentation?.demoMode === "schema-only";
  const [sourceSamples, setSourceSamples] = useState<SourceSamples | null>(sourceSamplesCache);
  const needsSamples = demoMode && !schemaOnlyMode;
  useEffect(() => {
    if (!needsSamples || sourceSamples) return;
    let cancelled = false;
    void loadSourceSamples().then(
      (samples) => {
        if (!cancelled) setSourceSamples(samples);
      },
      () => {
        if (!cancelled) setSourceSamples({});
      },
    );
    return () => {
      cancelled = true;
    };
  }, [needsSamples, sourceSamples]);
  const allRecords = useMemo(
    () => (needsSamples ? (sourceSamples ? makeSampleRecords(template, sourceSamples) : []) : actualRecords),
    [actualRecords, needsSamples, sourceSamples, template],
  );
  const tabField = template.presentation?.tabField ?? "kesim";
  const tabRecords = useMemo(
    () =>
      activeTab?.value
        ? allRecords.filter((record) => matchesPresentationTab(record, sourceProfile, tabField, activeTab.value ?? ""))
        : allRecords,
    [activeTab, allRecords, sourceProfile, tabField],
  );
  const dimensions = useMemo(() => drillDimensions(effectiveTemplate, tabRecords), [effectiveTemplate, tabRecords]);
  const metrics = useMemo(() => metricFields(effectiveTemplate), [effectiveTemplate]);
  const facets = useMemo(() => filterCandidates(effectiveTemplate, dimensions), [dimensions, effectiveTemplate]);
  const orderedFields = useMemo(() => orderedFieldsFor(effectiveTemplate), [effectiveTemplate]);
  const periodMode = template.presentation?.periodMode ?? "month-range";

  const filteredRecords = useMemo(
    () =>
      tabRecords.filter((record) => {
        const needle = normalized(search);
        if (
          needle &&
          !normalized(`${record.title} ${Object.values(record.values).join(" ")} ${record.organization}`).includes(
            needle,
          )
        )
          return false;
        const periodSlice = periodMode === "year" ? 4 : periodMode === "date" || periodMode === "date-range" ? 10 : 7;
        const fieldPeriod = configuredPeriodValue(record, effectiveTemplate);
        const recordPeriodStart = record.periodStart || fieldPeriod || record.periodEnd;
        const recordPeriodEnd = record.periodEnd || fieldPeriod || record.periodStart;
        if ((periodFrom || periodTo) && (!recordPeriodStart || !recordPeriodEnd)) return false;
        if (periodFrom && recordPeriodEnd && recordPeriodEnd.slice(0, periodSlice) < periodFrom) return false;
        if (periodTo && recordPeriodStart && recordPeriodStart.slice(0, periodSlice) > periodTo) return false;
        return recordMatchesFacets(record, effectiveTemplate, facetFilters);
      }),
    [effectiveTemplate, facetFilters, periodFrom, periodMode, periodTo, search, tabRecords],
  );

  const scopedRecords = useMemo(
    () =>
      filteredRecords.filter((record) =>
        drillPath.every((step) => {
          const dimension = dimensions.find((item) => item.code === step.code);
          return dimension ? dimensionValue(record, dimension) === step.value : true;
        }),
      ),
    [dimensions, drillPath, filteredRecords],
  );
  const currentDimension = dimensions[drillPath.length] ?? null;
  const groups = useMemo(
    () => (currentDimension ? aggregateRows(scopedRecords, currentDimension, metrics) : []),
    [currentDimension, metrics, scopedRecords],
  );
  const metricTotals = useMemo(
    () => Object.fromEntries(metrics.map((field) => [field.code, aggregateMetric(scopedRecords, field)])),
    [metrics, scopedRecords],
  );
  const primaryDimensionCount = useMemo(
    () => (dimensions[0] ? new Set(scopedRecords.map((record) => dimensionValue(record, dimensions[0]))).size : 0),
    [dimensions, scopedRecords],
  );
  const secondaryDimensionCount = useMemo(
    () => (dimensions[1] ? new Set(scopedRecords.map((record) => dimensionValue(record, dimensions[1]))).size : 0),
    [dimensions, scopedRecords],
  );
  const scopeLabel = drillPath.length ? drillPath.map((step) => step.value).join(" → ") : "Barcha ma’lumotlar";
  const embeddedTitleCode =
    sourceProfile === "construction_programs" ? "obyekt_nomi" : sourceProfile === "oav_region_detail" ? "nomi" : null;
  const leafFields = (
    sourceProfile ? orderedFields : orderedFields.filter((field) => visibleCodes.has(field.code))
  ).filter((field) => field.code !== embeddedTitleCode);

  function resetFilters() {
    setSearch("");
    setPeriodFrom("");
    setPeriodTo("");
    setFacetFilters({});
    setDrillPath([]);
  }

  function openWorkspaceRecord(record: WorkspaceRecord) {
    if (record.recordId) onOpen(record.recordId);
    else setPreviewRecord(record);
  }

  const additiveMetrics = metrics.filter((field) => !isAverageMetric(field));
  const progressMetric = metrics.find(isAverageMetric);
  const templateKey = normalized(`${template.code} ${template.name}`);
  const isOavMonitoring = sourceProfile === "oav_region_detail" || /media coverage|oav monitoring/.test(templateKey);
  const isConstruction = sourceProfile === "construction_programs";
  const oavCount = new Set(scopedRecords.map((record) => String(record.values.oav_nomi ?? "")).filter(Boolean)).size;
  const latestOavDate =
    scopedRecords
      .map((record) => String(record.values.elon_sanasi ?? ""))
      .filter(Boolean)
      .sort()
      .at(-1) ?? "";
  const totalOavSummary = useMemo(() => oavSummary(scopedRecords), [scopedRecords]);
  const constructionPlanKm = scopedRecords.reduce((sum, record) => sum + numericValue(record.values.reja_km), 0);
  const constructionActualKm = scopedRecords.reduce((sum, record) => sum + numericValue(record.values.amalda_km), 0);
  const constructionPlanValue = scopedRecords.reduce((sum, record) => sum + numericValue(record.values.reja_qiymat), 0);
  const constructionActualValue = scopedRecords.reduce(
    (sum, record) => sum + numericValue(record.values.amalda_qiymat),
    0,
  );
  const constructionPerformance =
    constructionPlanValue > 0 ? (constructionActualValue / constructionPlanValue) * 100 : NaN;
  const showRepublicTotal =
    drillPath.length === 0 &&
    (template.presentation?.showTotal ??
      ["oav_region_detail", "call_center_regional", "construction_programs", "appeals_consolidated"].includes(
        sourceProfile,
      ));
  const hideCountColumn = Boolean(template.presentation?.hideCountColumn || sourceProfile === "road_elements_matrix");
  const secondCard = isConstruction
    ? {
        label: "Reja",
        value: `${numberFormatter.format(constructionPlanKm)} km`,
        note: `${numberFormatter.format(constructionPlanValue)} mln so‘m`,
      }
    : additiveMetrics[0]
      ? {
          label: displayFieldLabel(additiveMetrics[0]),
          value: formatMetric(metricTotals[additiveMetrics[0].code] ?? 0, additiveMetrics[0]),
          note: "tanlangan davr bo‘yicha",
        }
      : {
          label: dimensionListLabel(dimensions[0]),
          value: `${primaryDimensionCount} ta`,
          note: "ma’lumotda mavjud kesim",
        };
  const thirdCard = isConstruction
    ? {
        label: "Amalda",
        value: `${numberFormatter.format(constructionActualKm)} km`,
        note: `${numberFormatter.format(constructionActualValue)} mln so‘m`,
      }
    : isOavMonitoring
      ? { label: "OAVlar", value: `${oavCount} ta`, note: "takrorlanmagan OAV nomlari" }
      : additiveMetrics[1]
        ? {
            label: displayFieldLabel(additiveMetrics[1]),
            value: formatMetric(metricTotals[additiveMetrics[1].code] ?? 0, additiveMetrics[1]),
            note: "jami hisoblangan",
          }
        : dimensions[1]
          ? {
              label: dimensionListLabel(dimensions[1]),
              value: `${secondaryDimensionCount} ta`,
              note: "faqat mavjud ma’lumotlar",
            }
          : {
              label: "Tasdiqlangan",
              value: `${scopedRecords.filter((record) => record.status === "published").length} ta`,
              note: "rahbar ko‘rigidan o‘tgan",
            };
  const fourthCard = isConstruction
    ? {
        label: "Umumiy bajarilish",
        value: `${Number.isFinite(constructionPerformance) ? `${Number.isFinite(constructionPerformance) ? `${numberFormatter.format(constructionPerformance)}%` : "—"}` : "—"}`,
        note: "amalda qiymat / reja qiymati",
        tone: constructionPerformance < 70 ? "red" : "green",
      }
    : isOavMonitoring
      ? {
          label: "So‘nggi e’lon",
          value: latestOavDate ? formatDate(latestOavDate) : "—",
          note: "tanlangan davr bo‘yicha",
          tone: "amber",
        }
      : progressMetric
        ? {
            label: displayFieldLabel(progressMetric),
            value: formatMetric(metricTotals[progressMetric.code] ?? 0, progressMetric),
            note: "o‘rtacha bajarilish",
            tone: (metricTotals[progressMetric.code] ?? 0) < 70 ? "red" : "amber",
          }
        : additiveMetrics[2]
          ? {
              label: displayFieldLabel(additiveMetrics[2]),
              value: formatMetric(metricTotals[additiveMetrics[2].code] ?? 0, additiveMetrics[2]),
              note: "tanlangan davr bo‘yicha",
              tone: "amber",
            }
          : {
              label: "Tasdiqlangan",
              value: `${scopedRecords.filter((record) => record.status === "published").length} ta`,
              note: "rahbar ko‘rigidan o‘tgan",
              tone: "amber",
            };

  return (
    <div className="info-data-workspace">
      <div className="info-data-titlebar">
        <span>
          <FileSpreadsheet size={24} />
        </span>
        <div>
          <small>{i18n.tx(domain?.name)}</small>
          <h3>{i18n.tx(template.name)}</h3>
        </div>
        <div className="info-data-title-actions">
          {canCreate ? (
            <button
              className="primary-button"
              onClick={() => onCreate(activeTab?.value ? { [tabField]: activeTab.value } : {})}
            >
              <Plus size={16} /> {i18n.t("Ma’lumot kiritish")}
            </button>
          ) : null}
        </div>
      </div>

      {emptyActualData ? (
        <div className="info-data-demo">
          <Database size={16} />
          <span>
            <strong>{demoMode ? i18n.t("Faqat namuna ko‘rsatilmoqda.") : i18n.t("Hali ma’lumot kiritilmagan.")}</strong>{" "}
            {demoMode
              ? i18n.t("Bu qatorlar hisobot bazasiga saqlanmagan.")
              : i18n.t("Jadvalni to‘ldirish uchun yangi yozuv kiriting.")}
          </span>
          {template.presentation?.demoMode !== "schema-only" ? (
            <button type="button" className="secondary-button" onClick={() => setShowExample((value) => !value)}>
              {demoMode ? i18n.t("Namunani yashirish") : i18n.t("To‘ldirish namunasini ko‘rish")}
            </button>
          ) : null}
        </div>
      ) : null}
      {template.presentation?.integration ? (
        <div className="info-data-demo">
          <Database size={16} />
          <span>
            <strong>
              {i18n.tx(template.presentation.integration.system)} {i18n.t("integratsiyasi.")}
            </strong>{" "}
            {i18n.tx(template.presentation.integration.purpose) || i18n.t("Ma’lumotlarni avtomatik yangilash")} ·{" "}
            {template.presentation.integration.status === "active" ? i18n.t("faol") : i18n.t("ulash uchun tayyor")}.
          </span>
        </div>
      ) : null}

      {tabs.length ? (
        <div className="info-source-tabs" role="tablist" aria-label={i18n.t("Jadval ko‘rinishi")}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab?.id === tab.id}
              className={activeTab?.id === tab.id ? "active" : ""}
              onClick={() => {
                setActiveTabId(tab.id);
                setDrillPath([]);
                setFacetFilters({});
                setVisibleCodes(
                  new Set(
                    (
                      tab.columns ??
                      template.presentation?.detailColumns ??
                      template.presentation?.tableColumns ??
                      []
                    ).slice(0, 9),
                  ),
                );
              }}
            >
              {i18n.t(tab.label)}
            </button>
          ))}
        </div>
      ) : null}

      {drillPath.length ? (
        <button className="info-data-back" onClick={() => setDrillPath((current) => current.slice(0, -1))}>
          <ArrowLeft size={18} /> {i18n.t(dimensionListLabel(dimensions[drillPath.length - 1]))}{" "}
          {i18n.t("ro‘yxatiga qaytish")}
        </button>
      ) : null}

      <div className="info-data-kpis">
        <SummaryCard
          icon={<MapPin size={20} />}
          label={recordNoun(effectiveTemplate)}
          value={`${scopedRecords.length} ta`}
          note={
            dimensions[0]
              ? `${primaryDimensionCount} ta ${dimensions[0].label.toLocaleLowerCase("uz")} kesimida`
              : "tanlangan shartlar bo‘yicha"
          }
          tone="violet"
        />
        <SummaryCard
          icon={<BarChart3 size={20} />}
          label={secondCard.label}
          value={secondCard.value}
          note={secondCard.note}
          tone="blue"
        />
        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          label={thirdCard.label}
          value={thirdCard.value}
          note={thirdCard.note}
          tone="green"
        />
        <SummaryCard
          icon={<Gauge size={20} />}
          label={fourthCard.label}
          value={fourthCard.value}
          note={fourthCard.note}
          tone={fourthCard.tone}
        />
      </div>

      <article className="info-data-panel">
        <header>
          <div>
            <Filter size={17} />
            <strong>{i18n.t("Filtrlar")}</strong>
          </div>
          <span>
            {filteredRecords.length} {i18n.t("ta mos yozuv")}
          </span>
        </header>
        <div className="info-data-filters">
          {!currentDimension ? (
            <label className="info-data-search">
              <span>{i18n.t("Tezkor qidiruv")}</span>
              <div>
                <Search size={15} />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setDrillPath([]);
                  }}
                  placeholder={i18n.t("{p0}, nomi yoki qiymati...", { p0: i18n.tx(recordNoun(effectiveTemplate)) })}
                />
                {search ? (
                  <button onClick={() => setSearch("")} aria-label={i18n.t("Qidiruvni tozalash")}>
                    <X size={14} />
                  </button>
                ) : null}
              </div>
            </label>
          ) : null}
          {facets.map((field) => (
            <FacetFilterControl
              key={field.code}
              field={field}
              records={tabRecords}
              values={facetFilters}
              onChange={(code, value) => {
                setFacetFilters((current) => ({ ...current, [code]: value }));
                setDrillPath([]);
              }}
            />
          ))}
          {periodMode !== "none" ? (
            periodMode === "month" || periodMode === "date" || periodMode === "year" ? (
              <label>
                <span>{i18n.t(template.presentation?.periodLabel ?? "") || i18n.t("Davr")}</span>
                <input
                  type={periodMode === "year" ? "number" : periodMode}
                  min={periodMode === "year" ? 2000 : undefined}
                  max={periodMode === "year" ? 2100 : undefined}
                  value={periodFrom}
                  onChange={(event) => {
                    setPeriodFrom(event.target.value);
                    setPeriodTo(event.target.value);
                    setDrillPath([]);
                  }}
                />
              </label>
            ) : (
              <label className="info-data-period">
                <span>
                  {i18n.t(template.presentation?.periodLabel ?? "") ||
                    (periodMode === "date-range" ? i18n.t("Sana oralig‘i") : i18n.t("Davr (oylar)"))}
                </span>
                <div>
                  <input
                    type={periodMode === "date-range" ? "date" : "month"}
                    value={periodFrom}
                    onChange={(event) => {
                      setPeriodFrom(event.target.value);
                      setDrillPath([]);
                    }}
                  />
                  <i>—</i>
                  <input
                    type={periodMode === "date-range" ? "date" : "month"}
                    value={periodTo}
                    onChange={(event) => {
                      setPeriodTo(event.target.value);
                      setDrillPath([]);
                    }}
                  />
                </div>
              </label>
            )
          ) : null}
          <button className="info-data-reset" onClick={resetFilters}>
            <RotateCcw size={15} /> {i18n.t("Tozalash")}
          </button>
        </div>
      </article>
      {isPartiallyLoaded ? (
        <div className="info-data-demo">
          <Database size={16} />
          <span>
            <strong>
              {i18n.tx(loadedScopeCount)} {i18n.t("ta yozuv yuklangan.")}
            </strong>{" "}
            {i18n.t(
              "Filtrlar, jamlanmalar va Excel hozir yuklangan qatorlar bo‘yicha ishlaydi. To‘liq natija uchun keyingi sahifalarni yuklang.",
            )}
          </span>
        </div>
      ) : null}

      <article className="info-data-table-panel">
        <header className="info-data-table-head">
          <div>
            <p>
              {currentDimension
                ? i18n.t("{p0} KESIMIDA", { p0: i18n.tx(currentDimension.label.toLocaleUpperCase("uz")) })
                : i18n.t("BIRLAMCHI MA’LUMOTLAR")}
            </p>
            <h3>{i18n.t(scopeLabel)}</h3>
            <span>
              {currentDimension
                ? i18n.t("{length} ta kesim · faqat ma’lumot mavjud qatorlar", { length: groups.length })
                : i18n.t("{length} ta batafsil yozuv", { length: scopedRecords.length })}
            </span>
          </div>
          <div>
            {!currentDimension && !sourceProfile ? (
              <details className="info-data-columns">
                <summary>
                  <SlidersHorizontal size={15} /> {i18n.t("Ustunlar")}
                </summary>
                <div>
                  {orderedFields.map((field) => (
                    <label key={field.code}>
                      <input
                        type="checkbox"
                        checked={visibleCodes.has(field.code)}
                        onChange={(event) =>
                          setVisibleCodes((current) => {
                            const next = new Set(current);
                            if (event.target.checked) next.add(field.code);
                            else next.delete(field.code);
                            return next;
                          })
                        }
                      />
                      {i18n.t(field.label)}
                    </label>
                  ))}
                </div>
              </details>
            ) : null}
            <button
              className="secondary-button"
              onClick={() =>
                void exportWorkspace(
                  effectiveTemplate,
                  scopedRecords,
                  groups,
                  currentDimension,
                  metrics,
                  scopeLabel,
                  exportCoverageNote,
                ).then(() => {
                  setNotice(
                    isPartiallyLoaded
                      ? i18n.t("Yuklangan qatorlar Excel formatida yuklandi")
                      : i18n.t("Jadval Excel formatida yuklandi"),
                  );
                  window.setTimeout(() => setNotice(""), 3000);
                })
              }
            >
              <FileSpreadsheet size={15} /> {isPartiallyLoaded ? i18n.t("Yuklanganlarini Excel") : i18n.t("Excel")}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="info-data-loading">
            <RoadLoader
              compact
              label="Jadval yuklanmoqda"
              detail="Hudud, tashkilot va ko‘rsatkichlar tayyorlanmoqda…"
            />
          </div>
        ) : currentDimension ? (
          <div className="info-data-table-wrap">
            <table className={`info-data-table ${isConstruction ? "construction-summary-table" : ""}`}>
              <thead>
                <tr>
                  <th>{i18n.t("T/r")}</th>
                  <th>{i18n.t(currentDimension.rowLabel)}</th>
                  {isOavMonitoring ? (
                    <>
                      <th>{i18n.t("Materiallar soni")}</th>
                      <th>{i18n.t("OAVlar soni")}</th>
                      <th>{i18n.t("Birinchi e’lon")}</th>
                      <th>{i18n.t("So‘nggi e’lon")}</th>
                    </>
                  ) : (
                    <>
                      {!hideCountColumn ? (
                        <th>
                          {i18n.tx(recordNoun(effectiveTemplate))} {i18n.t("soni")}
                        </th>
                      ) : null}
                      {metrics.map((field) => (
                        <th key={field.code}>
                          {i18n.t(displayFieldLabel(field))}
                          <small>
                            {i18n.tx(field.unit) ||
                              (isAverageMetric(field) ? "%" : field.type === "currency" ? i18n.t("so‘m") : "")}
                          </small>
                        </th>
                      ))}
                    </>
                  )}
                  {isConstruction ? (
                    <th>
                      {i18n.t("Bajarilish")}
                      <small>%</small>
                    </th>
                  ) : null}
                  <th />
                </tr>
              </thead>
              <tbody data-alphabet-static>
                {showRepublicTotal ? (
                  <tr className="info-data-total-row">
                    <td>—</td>
                    <td>
                      <strong>{isPartiallyLoaded ? "Yuklangan qatorlar jami" : "Respublika jami"}</strong>
                    </td>
                    {isOavMonitoring ? (
                      <>
                        <td>
                          <b className="info-data-count">{totalOavSummary.materialCount}</b>
                        </td>
                        <td>
                          <strong>{totalOavSummary.mediaCount}</strong>
                        </td>
                        <td>{totalOavSummary.firstDate ? formatDate(totalOavSummary.firstDate) : "—"}</td>
                        <td>{totalOavSummary.lastDate ? formatDate(totalOavSummary.lastDate) : "—"}</td>
                      </>
                    ) : (
                      <>
                        {!hideCountColumn ? (
                          <td>
                            <b className="info-data-count">{filteredRecords.length}</b>
                          </td>
                        ) : null}
                        {metrics.map((field) => (
                          <td key={field.code}>
                            <strong>{formatMetric(metricTotals[field.code] ?? 0, field)}</strong>
                          </td>
                        ))}
                      </>
                    )}
                    {isConstruction ? (
                      <td>
                        <strong>
                          {Number.isFinite(constructionPerformance)
                            ? `${numberFormatter.format(constructionPerformance)}%`
                            : "—"}
                        </strong>
                      </td>
                    ) : null}
                    <td />
                  </tr>
                ) : null}
                {groups.map((group, index) => {
                  const groupPlan = group.metrics.reja_qiymat ?? 0;
                  const groupProgress = groupPlan > 0 ? ((group.metrics.amalda_qiymat ?? 0) / groupPlan) * 100 : NaN;
                  const groupOav = oavSummary(group.records);
                  return (
                    <tr key={group.value}>
                      <td>{index + 1}</td>
                      <td>
                        <button
                          className="info-data-row-title"
                          onClick={() =>
                            setDrillPath((current) => [...current, { code: currentDimension.code, value: group.value }])
                          }
                        >
                          <span>
                            <DimensionIcon dimension={currentDimension} value={group.value} />
                          </span>
                          <strong>{group.value}</strong>
                        </button>
                      </td>
                      {isOavMonitoring ? (
                        <>
                          <td>
                            <b className="info-data-count">{groupOav.materialCount}</b>
                          </td>
                          <td>
                            <strong>{groupOav.mediaCount}</strong>
                          </td>
                          <td>{groupOav.firstDate ? formatDate(groupOav.firstDate) : "—"}</td>
                          <td>{groupOav.lastDate ? formatDate(groupOav.lastDate) : "—"}</td>
                        </>
                      ) : (
                        <>
                          {!hideCountColumn ? (
                            <td>
                              <b className="info-data-count">{group.count}</b>
                            </td>
                          ) : null}
                          {metrics.map((field) => (
                            <td key={field.code}>
                              <strong>{formatMetric(group.metrics[field.code] ?? 0, field)}</strong>
                            </td>
                          ))}
                        </>
                      )}
                      {isConstruction ? (
                        <td>
                          <span className="info-progress-inline">
                            <i style={{ width: `${Math.min(100, groupProgress)}%` }} />
                            <strong>
                              {Number.isFinite(groupProgress) ? `${numberFormatter.format(groupProgress)}%` : "—"}
                            </strong>
                          </span>
                        </td>
                      ) : null}
                      <td>
                        <button
                          className="info-data-open"
                          onClick={() =>
                            setDrillPath((current) => [...current, { code: currentDimension.code, value: group.value }])
                          }
                          aria-label={`${group.value} bo‘yicha batafsil`}
                        >
                          <ChevronRight size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="info-data-mobile-list" data-alphabet-static>
              {showRepublicTotal ? (
                <article className="info-mobile-total">
                  <strong>{isPartiallyLoaded ? "Yuklangan qatorlar jami" : "Respublika jami"}</strong>
                  <span>
                    {hideCountColumn
                      ? `${metrics.length} ta ko‘rsatkich`
                      : `${filteredRecords.length} ta ${recordNoun(effectiveTemplate).toLocaleLowerCase("uz")}`}
                  </span>
                </article>
              ) : null}
              {groups.map((group) => {
                const groupOav = oavSummary(group.records);
                return (
                  <button
                    key={group.value}
                    onClick={() =>
                      setDrillPath((current) => [...current, { code: currentDimension.code, value: group.value }])
                    }
                  >
                    <div>
                      <span>
                        <DimensionIcon dimension={currentDimension} value={group.value} />
                      </span>
                      <strong>{group.value}</strong>
                      <ChevronRight size={17} />
                    </div>
                    <dl>
                      {!hideCountColumn ? (
                        <div>
                          <dt>{recordNoun(effectiveTemplate)}</dt>
                          <dd>{group.count} ta</dd>
                        </div>
                      ) : null}
                      {isOavMonitoring ? (
                        <>
                          <div>
                            <dt>{i18n.t("OAVlar")}</dt>
                            <dd>{groupOav.mediaCount} ta</dd>
                          </div>
                          <div>
                            <dt>{i18n.t("So‘nggi e’lon")}</dt>
                            <dd>{groupOav.lastDate ? formatDate(groupOav.lastDate) : "—"}</dd>
                          </div>
                        </>
                      ) : (
                        metrics.slice(0, 2).map((field) => (
                          <div key={field.code}>
                            <dt>{field.label}</dt>
                            <dd>{formatMetric(group.metrics[field.code] ?? 0, field)}</dd>
                          </div>
                        ))
                      )}
                    </dl>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="info-data-table-wrap">
            <table
              className={`info-data-table info-data-leaf-table ${sourceProfile ? `source-profile-${sourceProfile}` : ""}`}
            >
              <thead>
                <tr>
                  <th>{i18n.t("T/r")}</th>
                  <th>
                    {i18n.tx(recordNoun(effectiveTemplate))} {i18n.t("nomi")}
                  </th>
                  {leafFields.map((field) => (
                    <th key={field.code}>
                      {i18n.t(displayFieldLabel(field))}
                      <small>{i18n.tx(field.unit)}</small>
                    </th>
                  ))}
                  <th>{i18n.t("Holat")}</th>
                  <th>{i18n.t("Yangilangan")}</th>
                  <th />
                </tr>
              </thead>
              <tbody data-alphabet-static>
                {scopedRecords.map((record, index) => (
                  <tr key={record.key}>
                    <td>{index + 1}</td>
                    <td>
                      <button className="info-data-row-title" onClick={() => openWorkspaceRecord(record)}>
                        <span>
                          <FileText size={16} />
                        </span>
                        <span>
                          <strong>{embeddedRecordTitle(record, embeddedTitleCode)}</strong>
                          {!sourceProfile ? <small>{record.organization}</small> : null}
                        </span>
                      </button>
                    </td>
                    {leafFields.map((field) => (
                      <td key={field.code}>{renderCell(record.values[field.code], field)}</td>
                    ))}
                    {true ? (
                      <>
                        <td>
                          <span className={`info-data-status status-${record.status}`}>
                            {record.status === "published" ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}
                            {statusLabel(record.status)}
                          </span>
                        </td>
                        <td>{formatDate(record.updatedAt)}</td>
                        <td>
                          <button
                            className="info-data-open"
                            onClick={() => openWorkspaceRecord(record)}
                            aria-label={`${record.title} kartochkasini ochish`}
                          >
                            <ChevronRight size={17} />
                          </button>
                        </td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="info-data-mobile-list" data-alphabet-static>
              {scopedRecords.map((record) => (
                <button key={record.key} onClick={() => openWorkspaceRecord(record)}>
                  <div>
                    <span>
                      <FileText size={16} />
                    </span>
                    <strong>{embeddedRecordTitle(record, embeddedTitleCode)}</strong>
                    <ChevronRight size={17} />
                  </div>
                  {!sourceProfile ? <p>{record.organization}</p> : null}
                  <dl>
                    {leafFields.slice(0, 4).map((field) => (
                      <div key={field.code}>
                        <dt>{field.label}</dt>
                        <dd>{formatCell(record.values[field.code], field)}</dd>
                      </div>
                    ))}
                  </dl>
                  {true ? (
                    <footer>
                      <span className={`info-data-status status-${record.status}`}>{statusLabel(record.status)}</span>
                      <small>{formatDate(record.updatedAt)}</small>
                    </footer>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && (currentDimension ? groups.length === 0 : scopedRecords.length === 0) ? (
          <div className="info-data-empty">
            <ListFilter size={24} />
            <strong>{i18n.t("Filtrga mos ma’lumot topilmadi")}</strong>
            <span>{i18n.t("Filtrlarni tozalang yoki boshqa davrni tanlang.")}</span>
          </div>
        ) : null}
        {!demoMode && hasMore ? (
          <button className="info-data-load-more" disabled={loadingMore} onClick={onLoadMore}>
            {loadingMore
              ? i18n.t("Yuklanmoqda…")
              : i18n.t("Keyingi 50 ta yozuvni qo‘shish ({loadedScopeCount} yuklangan)", {
                  loadedScopeCount: i18n.tx(loadedScopeCount),
                })}
          </button>
        ) : null}
      </article>

      {notice ? (
        <div className="info-data-notice">
          <CheckCircle2 size={15} />
          {i18n.tx(notice)}
        </div>
      ) : null}
      {previewRecord ? (
        <PreviewDrawer record={previewRecord} template={template} onClose={() => setPreviewRecord(null)} />
      ) : null}
    </div>
  );
}
