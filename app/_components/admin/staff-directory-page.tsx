"use client";

import {
  ArrowLeft,
  Building2,
  ChevronRight,
  CircleAlert,
  Database,
  Download,
  FileSpreadsheet,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageIntro, readJson } from "../../dashboard-kit";
import { avatarColor, formatDateTime, initials, numberFormatter, regionLabels, searchMatches } from "../../ui-helpers";
import { loadXlsx } from "../../excel-client";
import type {
  AdminOrganization,
  RequestProvisioning,
  DownloadProvisioningWorkbook,
  StaffSummaryPayload,
  StaffDetailPayload,
} from "./admin-types";
import { organizationTypeLabel, Summary } from "./admin-helpers";
import { confirmDialog } from "../ui/confirm-dialog";
import { useI18n } from "../../../lib/i18n";
import { useVirtualList, virtualItemProps } from "../ui/use-virtual-list";

export function StaffOccupancyCell({
  position,
  onActivateReserved,
}: {
  position: StaffDetailPayload["positions"][number];
  onActivateReserved?: (employeeId: number) => void;
}) {
  const { t, tx } = useI18n();
  if (!position.occupancies.length)
    return (
      <span className="connection-pill">
        <UserPlus size={13} /> {t("{n} birlik vakant", { n: numberFormatter.format(position.headcountUnits) })}
      </span>
    );
  return (
    <div className="staff-occupancy-cell">
      <div className="staff-occupancy-people">
        {position.occupancies.slice(0, 2).map((employee) => (
          <span
            key={employee.id}
            title={[
              tx(employee.name),
              t("{n} stavka", { n: employee.fteRate }),
              employee.internalExtension ? t("ichki {ext}", { ext: employee.internalExtension }) : "",
              employee.mobilePhone ?? "",
            ]
              .filter(Boolean)
              .join(" · ")}
          >
            <i className={`person-avatar ${avatarColor(employee.id)}`}>{initials(employee.name)}</i>
            <b>{tx(employee.name)}</b>
          </span>
        ))}
        {position.occupancies.length > 2 ? <em>+{position.occupancies.length - 2}</em> : null}
      </div>
      <small>
        {t("{busy} / {total} birlik band", {
          busy: numberFormatter.format(position.occupiedUnits),
          total: numberFormatter.format(position.headcountUnits),
        })}
        {position.vacantUnits ? ` · ${t("{n} vakant", { n: numberFormatter.format(position.vacantUnits) })}` : ""}
      </small>
      {onActivateReserved
        ? position.occupancies
            .filter((employee) => employee.loginConfigured === false)
            .map((employee) => (
              <button
                type="button"
                className="staff-activate-reserved"
                key={employee.id}
                onClick={() => onActivateReserved(employee.id)}
              >
                <KeyRound size={12} /> {t("{name} uchun rezervni faollashtirish", { name: tx(employee.name) })}
              </button>
            ))
        : null}
    </div>
  );
}

export function StaffDirectoryPage({
  organizations,
  canProvision,
  requestProvisioning,
  downloadProvisioningWorkbook,
}: {
  organizations: AdminOrganization[];
  canProvision: boolean;
  requestProvisioning: RequestProvisioning;
  downloadProvisioningWorkbook: DownloadProvisioningWorkbook;
}) {
  const { t, tx } = useI18n();
  const [summary, setSummary] = useState<StaffSummaryPayload | null>(null);
  const [detail, setDetail] = useState<StaffDetailPayload | null>(null);
  const [region, setRegion] = useState("all");
  const [query, setQuery] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [selectedVacancies, setSelectedVacancies] = useState<number[]>([]);
  const [provisionBusy, setProvisionBusy] = useState(false);
  const [provisionNotice, setProvisionNotice] = useState("");
  const cancelSystemProvision = useRef(false);
  const [systemProvision, setSystemProvision] = useState<{
    phase: string;
    created: number;
    estimated: number;
    cancelling: boolean;
  } | null>(null);
  const [systemReissueMode, setSystemReissueMode] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/staff", { cache: "no-store", signal: controller.signal })
      .then((response) => readJson<StaffSummaryPayload>(response))
      .then((result) => {
        setSummary(result);
        setError("");
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Shtatlar yuklanmadi");
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, []);

  const filteredOrganizations = organizations.filter(
    (organization) =>
      organization.active &&
      (region === "all" || organization.regionCode === region) &&
      searchMatches(query, [organization.name, organization.shortName, organization.taxId, organization.dataStatus]),
  );
  // All matching organizations are listed; only the cards near the viewport render.
  const { attach: attachOrganizationCards, ...organizationCards } = useVirtualList({
    count: filteredOrganizations.length,
    estimateRowHeight: 76,
    threshold: 60,
    columns: "auto",
  });
  const { attach: attachPositionRows, ...positionRows } = useVirtualList({
    count: detail?.positions.length ?? 0,
    estimateRowHeight: 58,
    threshold: 80,
  });

  async function openOrganization(id: number, nextDepartmentId: number | null = null, cursor = 0, append = false) {
    try {
      setBusy(true);
      const params = new URLSearchParams({ organizationId: String(id), limit: "40" });
      if (nextDepartmentId) params.set("departmentId", String(nextDepartmentId));
      if (cursor) params.set("cursor", String(cursor));
      const result = await readJson<StaffDetailPayload>(await fetch(`/api/staff?${params}`, { cache: "no-store" }));
      setDetail((current) =>
        append && current ? { ...result, positions: [...current.positions, ...result.positions] } : result,
      );
      if (!append) setSelectedVacancies([]);
      setDepartmentId(nextDepartmentId);
      setError("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Shtat ma’lumoti yuklanmadi");
    } finally {
      setBusy(false);
    }
  }

  async function createVacancyCredentialPack() {
    if (!canProvision || !selectedVacancies.length || provisionBusy) return;
    if (
      !(await confirmDialog({
        title: t("Rezerv kirishlar"),
        message: t(
          "{n} ta vakant shtat qatori uchun rezerv login va parol yaratiladi. Rezerv hisoblar xodim biriktirilmaguncha tizimga kira olmaydi. Davom etasizmi?",
          { n: selectedVacancies.length },
        ),
        confirmLabel: t("Yaratish"),
      }))
    )
      return;
    try {
      setProvisionBusy(true);
      const spreadsheetReady = loadXlsx();
      const result = await requestProvisioning({ kind: "vacancies", staffPositionIds: selectedVacancies });
      await spreadsheetReady;
      await downloadProvisioningWorkbook(result);
      setProvisionNotice(
        [
          t("{n} ta rezerv kirish bir martalik Excel faylga yuklandi", { n: result.accounts.length }),
          result.failure ? t("Jarayon qisman bajarildi: {reason}", { reason: result.failure }) : "",
          result.skipped.length ? t("{n} ta qator o‘tkazib yuborildi", { n: result.skipped.length }) : "",
        ]
          .filter(Boolean)
          .join(". ") + ".",
      );
      setSelectedVacancies([]);
    } catch (failure) {
      setProvisionNotice(failure instanceof Error ? failure.message : t("Rezerv kirishlarni yaratib bo‘lmadi"));
    } finally {
      setProvisionBusy(false);
    }
  }

  async function createAllCredentialPack() {
    if (!canProvision || !summary?.coverage || systemProvision) return;
    const estimated = summary.coverage.activeEmployees + summary.coverage.vacantSlots;
    if (systemReissueMode) {
      const confirmed = await confirmDialog({
        title: t("Barcha parollarni yangilash"),
        message: t("{n} tagacha faol xodimning amaldagi paroli bekor qilinadi va ular eski parol bilan kira olmaydi.", {
          n: summary.coverage.activeEmployees,
        }),
        confirmLabel: t("Parollarni yangilash"),
        tone: "danger",
        // The phrase is shown in the user's language; every spelling is accepted.
        requireText: t("PAROLNI YANGILASH"),
        requireTextAlternatives: ["PAROLNI YANGILASH", "ПАРОЛНИ ЯНГИЛАШ", "ОБНОВИТЬ ПАРОЛИ"],
      });
      if (!confirmed) return;
    } else {
      const confirmed = await confirmDialog({
        title: t("Tizim bo‘yicha kirishlar"),
        message: t(
          "Tizim bo‘yicha hali yaratilmagan xodim va vakant shtat kirishlari shakllantiriladi. Mavjud login va parollar o‘zgarmaydi. {n} ta tashkilotda faqat vaqtinchalik operatsion rollar qamrab olinadi. Davom etasizmi?",
          { n: summary.coverage.missingOfficialSchedules },
        ),
        confirmLabel: t("Shakllantirish"),
      });
      if (!confirmed) return;
    }
    cancelSystemProvision.current = false;
    setSystemProvision({ phase: "Xodimlar", created: 0, estimated, cancelling: false });
    const spreadsheetReady = loadXlsx();
    try {
      const employeeResult = await requestProvisioning(
        { kind: "employees", reissue: systemReissueMode },
        {
          shouldContinue: () => !cancelSystemProvision.current,
          onProgress: (created) =>
            setSystemProvision((current) => (current ? { ...current, phase: "Xodimlar", created } : current)),
        },
      );
      let vacancyResult: Awaited<ReturnType<typeof requestProvisioning>> | null = null;
      if (!employeeResult.cancelled && !cancelSystemProvision.current) {
        vacancyResult = await requestProvisioning(
          { kind: "vacancies", reissue: systemReissueMode },
          {
            shouldContinue: () => !cancelSystemProvision.current,
            onProgress: (created) =>
              setSystemProvision((current) =>
                current
                  ? { ...current, phase: "Vakant shtatlar", created: employeeResult.accounts.length + created }
                  : current,
              ),
          },
        );
      }
      const combined = {
        accounts: [...employeeResult.accounts, ...(vacancyResult?.accounts ?? [])],
        skipped: [...employeeResult.skipped, ...(vacancyResult?.skipped ?? [])],
        profiles: vacancyResult?.profiles.length ? vacancyResult.profiles : employeeResult.profiles,
        generatedAt: vacancyResult?.generatedAt ?? employeeResult.generatedAt,
        cancelled: employeeResult.cancelled || Boolean(vacancyResult?.cancelled) || cancelSystemProvision.current,
        failure: vacancyResult?.failure || employeeResult.failure,
      };
      await spreadsheetReady;
      await downloadProvisioningWorkbook(combined);
      setProvisionNotice(
        [
          t("{n} ta kirish bitta maxfiy Excel faylga yuklandi", { n: combined.accounts.length }),
          combined.cancelled ? t("Jarayon xavfsiz to‘xtatildi; faqat yaratilgan qism faylga kiritildi") : "",
          combined.failure ? t("Sabab: {reason}", { reason: combined.failure }) : "",
          combined.skipped.length ? t("{n} ta qator o‘tkazib yuborildi", { n: combined.skipped.length }) : "",
        ]
          .filter(Boolean)
          .join(". ") + ".",
      );
    } catch (failure) {
      setProvisionNotice(failure instanceof Error ? failure.message : t("Umumiy kirishlar faylini yaratib bo‘lmadi"));
    } finally {
      cancelSystemProvision.current = false;
      setSystemProvision(null);
    }
  }

  async function activateReservedAccount(staffPositionId: number, employeeId: number) {
    if (!canProvision || provisionBusy || !detail) return;
    const employee = detail.positions
      .flatMap((position) => position.occupancies)
      .find((item) => item.id === employeeId);
    if (
      !(await confirmDialog({
        title: t("Rezerv kirishni faollashtirish"),
        message: t("{name} uchun ushbu lavozimning rezerv kirishini faollashtirasizmi?", {
          name: employee ? tx(employee.name) : t("Xodim"),
        }),
        confirmLabel: t("Faollashtirish"),
      }))
    )
      return;
    try {
      setProvisionBusy(true);
      await readJson(
        await fetch("/api/admin/accounts/activate-reserved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffPositionId, employeeId }),
        }),
      );
      setProvisionNotice(
        t("{name} uchun rezerv kirish faollashtirildi.", { name: employee ? tx(employee.name) : t("Xodim") }),
      );
      await openOrganization(detail.organization.id, departmentId);
    } catch (failure) {
      setProvisionNotice(failure instanceof Error ? failure.message : t("Rezerv kirishni faollashtirib bo‘lmadi"));
    } finally {
      setProvisionBusy(false);
    }
  }

  return (
    <section className="module-page staff-directory-page">
      <PageIntro
        kicker={t("YAGONA SHTATLAR REESTRI")}
        title={detail ? tx(detail.organization.name) : t("Tashkilotlar va shtat birliklari")}
        description={
          detail
            ? t(
                "Bo‘limdan lavozim va aniq xodimgacha chuqurlashing. Vakant birlik uchun rezerv kirish xodim tayinlanguncha faol bo‘lmaydi.",
              )
            : t("Tasdiqlangan shtat hujjatlari, bandlik va rezerv akkauntlarni yagona ierarxiyada boshqaring.")
        }
        actions={
          detail ? (
            <>
              <button
                className="secondary-button"
                onClick={() => {
                  setDetail(null);
                  setDepartmentId(null);
                  setSelectedVacancies([]);
                }}
              >
                <ArrowLeft size={16} /> {t("Tashkilotlar ro‘yxati")}
              </button>
              {canProvision ? (
                <button
                  className="primary-button"
                  disabled={!selectedVacancies.length || provisionBusy}
                  onClick={() => void createVacancyCredentialPack()}
                >
                  <Download size={16} />
                  {provisionBusy
                    ? t("Tayyorlanmoqda…")
                    : `${t("Rezerv login-parol")}${selectedVacancies.length ? ` (${selectedVacancies.length})` : ""}`}
                </button>
              ) : null}
            </>
          ) : null
        }
      />
      {error ? (
        <div className="warning-note">
          <CircleAlert size={17} />
          <span>{t(error)}</span>
        </div>
      ) : null}
      {provisionNotice ? (
        <div className="secure-note">
          <ShieldCheck size={18} />
          <div>
            <strong>{t("Rezerv kirishlar")}</strong>
            <span>{provisionNotice}</span>
          </div>
          <button className="icon-button" onClick={() => setProvisionNotice("")} aria-label={t("Xabarni yopish")}>
            <X size={15} />
          </button>
        </div>
      ) : null}
      {!detail ? (
        <>
          <div className="summary-strip">
            <Summary
              icon={<Building2 size={20} />}
              tone="blue"
              label={t("Tashkilot")}
              value={t("{n} ta", { n: summary?.summary.organizations ?? organizations.length })}
            />
            <Summary
              icon={<Users size={20} />}
              tone="green"
              label={t("Shtat birligi")}
              value={`${numberFormatter.format(summary?.summary.staffUnits ?? 0)}`}
            />
            <Summary
              icon={<UserCog size={20} />}
              tone="violet"
              label={t("Band xodim")}
              value={t("{n} nafar", { n: numberFormatter.format(summary?.summary.employees ?? 0) })}
            />
            <Summary
              icon={<KeyRound size={20} />}
              tone="amber"
              label={t("Faol akkaunt")}
              value={t("{n} ta", { n: numberFormatter.format(summary?.summary.accounts ?? 0) })}
            />
          </div>
          {summary?.coverage ? (
            <article className="panel staff-coverage-panel">
              <header>
                <div>
                  <p className="section-kicker">{t("MA’LUMOTLAR QAMROVI")}</p>
                  <h2>{t("Rasmiy shtat va operatsion kirish tayyorligi")}</h2>
                  <span>
                    {t("Rasmiy shtat qamrovi va vaqtinchalik operatsion kirishlar bir-biridan qat’iy ajratilgan.")}
                  </span>
                </div>
                <div className="staff-coverage-actions">
                  <div className="staff-coverage-pairs">
                    <strong>
                      {summary.coverage.officialCoveredOrganizations}/{summary.coverage.totalOrganizations}
                      <small>{t("rasmiy shtat mavjud")}</small>
                    </strong>
                    <strong>
                      {summary.coverage.operationalReadyOrganizations}/{summary.coverage.totalOrganizations}
                      <small>{t("operatsion kirish tayyor")}</small>
                    </strong>
                  </div>
                  {canProvision ? (
                    <>
                      <label className={`system-reissue-toggle ${systemReissueMode ? "active" : ""}`}>
                        <input
                          type="checkbox"
                          checked={systemReissueMode}
                          disabled={Boolean(systemProvision)}
                          onChange={(event) => setSystemReissueMode(event.target.checked)}
                        />
                        <span>
                          <strong>{t("Mavjud parollarni ham yangilash")}</strong>
                          <small>{t("Odatda o‘chirilgan bo‘lishi kerak")}</small>
                        </span>
                      </label>
                      <button
                        className={`primary-button ${systemReissueMode ? "danger-button" : ""}`}
                        disabled={Boolean(systemProvision)}
                        onClick={() => void createAllCredentialPack()}
                      >
                        <Download size={16} />{" "}
                        {systemReissueMode
                          ? t("Barcha parollarni qayta berish")
                          : t("Barcha yangi kirishlarni yaratish")}
                      </button>
                    </>
                  ) : null}
                </div>
              </header>
              <div className="staff-coverage-progress-group">
                <span>
                  <b>{t("Rasmiy shtat jadvali")}</b>
                  <em>
                    {summary.coverage.officialCoveredOrganizations}/{summary.coverage.totalOrganizations}
                  </em>
                </span>
                <div
                  className="staff-coverage-progress"
                  role="progressbar"
                  aria-label={t("Rasmiy shtat jadvallari qamrovi")}
                  aria-valuemin={0}
                  aria-valuemax={summary.coverage.totalOrganizations}
                  aria-valuenow={summary.coverage.officialCoveredOrganizations}
                >
                  <i
                    style={{
                      width: `${summary.coverage.totalOrganizations ? Math.round((summary.coverage.officialCoveredOrganizations / summary.coverage.totalOrganizations) * 100) : 0}%`,
                    }}
                  />
                </div>
                <span>
                  <b>{t("Operatsion kirish tayyorligi")}</b>
                  <em>
                    {summary.coverage.operationalReadyOrganizations}/{summary.coverage.totalOrganizations}
                  </em>
                </span>
                <div
                  className="staff-coverage-progress operational"
                  role="progressbar"
                  aria-label={t("Operatsion kirish tayyorligi")}
                  aria-valuemin={0}
                  aria-valuemax={summary.coverage.totalOrganizations}
                  aria-valuenow={summary.coverage.operationalReadyOrganizations}
                >
                  <i
                    style={{
                      width: `${summary.coverage.totalOrganizations ? Math.round((summary.coverage.operationalReadyOrganizations / summary.coverage.totalOrganizations) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="staff-coverage-kpis">
                <span>
                  <b>{summary.coverage.totalPositionRows}</b> {t("jami faol qator")}
                </span>
                <span>
                  <b>{numberFormatter.format(summary.coverage.headcountUnits)}</b> {t("hisobiy birlik")}
                </span>
                <span>
                  <b>{summary.coverage.credentialSlots}</b> {t("kirish o‘rni")}
                  <small>{t("{n} tasi vaqtinchalik", { n: summary.coverage.provisionalCredentialSlots })}</small>
                </span>
                <span>
                  <b>{summary.coverage.occupiedSlots}</b> {t("band")} ·{" "}
                  {t("{n} vakant", { n: summary.coverage.vacantSlots })}
                </span>
              </div>
              <div className="staff-coverage-types">
                {summary.coverage.byOrganizationType.map((item) => (
                  <span key={item.type}>
                    <strong>{t(organizationTypeLabel(item.type))}</strong>
                    <small>
                      {t("Rasmiy: {covered}/{total} · kirish tayyor: {ready}/{total}", {
                        covered: item.coveredOrganizations,
                        ready: item.operationalReadyOrganizations,
                        total: item.organizations,
                      })}
                    </small>
                    <small>
                      {t("{rows} qator · {busy}/{slots} band", {
                        rows: item.positionRows,
                        busy: item.occupiedSlots,
                        slots: item.credentialSlots,
                      })}
                    </small>
                  </span>
                ))}
              </div>
              {summary.coverage.provisionalOrganizations > 0 ? (
                <div className="staff-provisional-note">
                  <CircleAlert size={17} />
                  <span>
                    <strong>
                      {t("{n} ta tashkilotga vaqtinchalik operatsion kirish o‘rni ochilgan.", {
                        n: summary.coverage.provisionalOrganizations,
                      })}
                    </strong>{" "}
                    {t(
                      "Bular rasmiy shtat lavozimi emas. Tasdiqlangan shtat jadvali import qilingach vaqtinchalik qatorlar haqiqiy lavozimlar bilan almashtiriladi.",
                    )}
                  </span>
                </div>
              ) : null}
              {summary.coverage.missingOfficialSchedules > 0 ? (
                <div className="warning-note">
                  <FileSpreadsheet size={17} />
                  <span>
                    <strong>
                      {t("{n} ta tashkilotning rasmiy shtat jadvali hali tizimga kiritilmagan.", {
                        n: summary.coverage.missingOfficialSchedules,
                      })}
                    </strong>{" "}
                    {t("Ushbu tashkilotlarda faqat cheklangan vaqtinchalik operatsion rollar mavjud.")}
                  </span>
                </div>
              ) : null}
              {summary.coverage.overAllocatedPositions > 0 ? (
                <div className="warning-note">
                  <Users size={17} />
                  <span>
                    <strong>
                      {t("{n} ta lavozimda band xodimlar soni tasdiqlangan shtat birligidan ortiq.", {
                        n: summary.coverage.overAllocatedPositions,
                      })}
                    </strong>{" "}
                    {t("Loginlarni ommaviy tarqatishdan oldin ushbu qatorlarni administrator tekshirishi kerak.")}
                  </span>
                </div>
              ) : null}
            </article>
          ) : null}
          {systemProvision ? (
            <article className="panel system-provision-progress" role="status" aria-live="polite">
              <div>
                <LockKeyhole size={19} />
                <span>
                  <strong>{t("{phase} bo‘yicha kirishlar yaratilmoqda", { phase: t(systemProvision.phase) })}</strong>
                  <small>
                    {t("{created}/{estimated} tagacha hisob tayyorlandi. Ochiq parollar ekranga chiqarilmaydi.", {
                      created: systemProvision.created,
                      estimated: systemProvision.estimated,
                    })}
                  </small>
                </span>
              </div>
              <div className="staff-coverage-progress">
                <i
                  style={{
                    width: `${Math.min(100, Math.round((systemProvision.created / Math.max(1, systemProvision.estimated)) * 100))}%`,
                  }}
                />
              </div>
              <button
                className="secondary-button"
                disabled={systemProvision.cancelling}
                onClick={() => {
                  cancelSystemProvision.current = true;
                  setSystemProvision((current) => (current ? { ...current, cancelling: true } : current));
                }}
              >
                {systemProvision.cancelling ? t("Joriy qism yakunlanmoqda…") : t("Xavfsiz to‘xtatish")}
              </button>
            </article>
          ) : null}
          <article className="panel directory-toolbar">
            <label>
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Tashkilot nomi, STIR yoki holat...")}
              />
            </label>
            <select value={region} onChange={(event) => setRegion(event.target.value)} aria-label={t("Hudud")}>
              <option value="all">{t("Respublika bo‘yicha")}</option>
              {summary?.regions.map((item) => (
                <option key={item.id} value={item.id}>
                  {tx(regionLabels[item.id] ?? item.id)} · {t("{n} ta", { n: item.organizations })}
                </option>
              ))}
            </select>
            <span>{t("{n} ta natija", { n: filteredOrganizations.length })}</span>
          </article>
          <div className="staff-organization-grid" ref={attachOrganizationCards}>
            {organizationCards.padTop ? (
              <div aria-hidden="true" style={{ gridColumn: "1 / -1", height: organizationCards.padTop }} />
            ) : null}
            {filteredOrganizations.slice(organizationCards.start, organizationCards.end).map((organization, offset) => (
              <button
                className="panel staff-organization-card"
                key={organization.id}
                {...virtualItemProps(organizationCards.start + offset)}
                onClick={() => void openOrganization(organization.id)}
              >
                <span className="metric-icon blue">
                  <Building2 size={19} />
                </span>
                <div>
                  <strong>{tx(organization.name)}</strong>
                  <small>
                    {tx(regionLabels[organization.regionCode ?? "other"] ?? organization.regionCode)} ·{" "}
                    {organization.taxId ? t("STIR {tin}", { tin: organization.taxId }) : t("STIR kiritilmagan")}
                  </small>
                </div>
                <span className={`connection-badge ${organization.hierarchyVerified ? "connected" : ""}`}>
                  {organization.hierarchyVerified
                    ? t("Tasdiqlangan")
                    : organization.dataStatus
                      ? tx(organization.dataStatus)
                      : t("Tekshiruvda")}
                </span>
                <ChevronRight size={18} />
              </button>
            ))}
            {organizationCards.padBottom ? (
              <div aria-hidden="true" style={{ gridColumn: "1 / -1", height: organizationCards.padBottom }} />
            ) : null}
          </div>
        </>
      ) : (
        <>
          <nav className="executive-breadcrumbs">
            <button onClick={() => setDetail(null)}>{t("Respublika")}</button>
            <ChevronRight size={14} />
            <button onClick={() => void openOrganization(detail.organization.id)}>
              {tx(detail.organization.shortName || detail.organization.name)}
            </button>
            {departmentId ? (
              <>
                <ChevronRight size={14} />
                <span>{tx(detail.departments.find((item) => item.id === departmentId)?.name)}</span>
              </>
            ) : null}
          </nav>
          <article className="panel staff-source-banner">
            <div>
              <Database size={20} />
              <span>
                <strong>{tx(detail.organization.dataStatus)}</strong>
                <small>
                  {detail.organization.taxId
                    ? t("STIR {tin}", { tin: detail.organization.taxId })
                    : t("STIR kiritilmagan")}{" "}
                  ·{" "}
                  {detail.organization.hierarchyVerified
                    ? t("Ierarxiya tasdiqlangan")
                    : t("Ierarxiya administrator tasdig‘ini kutmoqda")}
                </small>
              </span>
            </div>
            <span className="connection-badge">{t("Excel manbasi")}</span>
          </article>
          <div className="staff-department-strip">
            <button
              className={departmentId == null ? "active" : ""}
              onClick={() => void openOrganization(detail.organization.id)}
            >
              <strong>{t("Barcha bo‘limlar")}</strong>
              <small>{t("{n} qator", { n: detail.positions.length })}</small>
            </button>
            {detail.departments.map((department) => (
              <button
                key={department.id}
                className={departmentId === department.id ? "active" : ""}
                onClick={() => void openOrganization(detail.organization.id, department.id)}
              >
                <strong>{tx(department.name)}</strong>
                <small>
                  {t("{units} birlik · {n} xodim", {
                    units: numberFormatter.format(department.staffUnits),
                    n: department.employees,
                  })}
                </small>
              </button>
            ))}
          </div>
          <div className="credential-security-note staff-reserved-note">
            <LockKeyhole size={18} />
            <div>
              <strong>{t("Vakant lavozimlar uchun rezerv hisob")}</strong>
              <span>
                {t(
                  "Rezerv login hozir faol bo‘lmaydi. Xodim ushbu shtatga biriktirilgach administrator hisobni uning nomiga xavfsiz faollashtiradi.",
                )}
              </span>
            </div>
          </div>
          <article className="panel executive-table-panel">
            <header className="executive-table-head">
              <div>
                <p className="section-kicker">{t("LAVOZIMDAN XODIMGACHA")}</p>
                <h2>
                  {departmentId
                    ? tx(detail.departments.find((item) => item.id === departmentId)?.name)
                    : t("Barcha shtat qatorlari")}
                </h2>
                <span>
                  {t("{n} ta qator yuklandi", { n: detail.positions.length })}
                  {canProvision ? ` · ${t("{n} ta vakant qator tanlandi", { n: selectedVacancies.length })}` : ""}
                </span>
              </div>
            </header>
            <div className="table-wrap">
              <table className="staff-position-table" aria-rowcount={detail.positions.length + 1}>
                <thead>
                  <tr>
                    {canProvision ? (
                      <th>
                        <input
                          type="checkbox"
                          aria-label={t("Barcha vakant qatorlarni tanlash")}
                          checked={
                            detail.positions.some((position) => position.vacantUnits > 0) &&
                            detail.positions
                              .filter((position) => position.vacantUnits > 0)
                              .every((position) => selectedVacancies.includes(position.id))
                          }
                          onChange={(event) =>
                            setSelectedVacancies(
                              event.target.checked
                                ? detail.positions
                                    .filter((position) => position.vacantUnits > 0)
                                    .map((position) => position.id)
                                : [],
                            )
                          }
                        />
                      </th>
                    ) : null}
                    <th>{t("Bo‘lim / lavozim")}</th>
                    <th>{t("Birlik")}</th>
                    <th>{t("Razryad")}</th>
                    <th>{t("Bandlik")}</th>
                    <th>{t("Manba holati")}</th>
                    <th>{t("Kuchga kirgan")}</th>
                  </tr>
                </thead>
                <tbody ref={attachPositionRows}>
                  {positionRows.padTop ? (
                    <tr aria-hidden="true" style={{ height: positionRows.padTop }}>
                      <td colSpan={canProvision ? 7 : 6} style={{ padding: 0, border: 0 }} />
                    </tr>
                  ) : null}
                  {detail.positions.slice(positionRows.start, positionRows.end).map((position, offset) => (
                    <tr
                      key={position.id}
                      aria-rowindex={positionRows.start + offset + 2}
                      {...virtualItemProps(positionRows.start + offset)}
                    >
                      {canProvision ? (
                        <td>
                          <input
                            type="checkbox"
                            aria-label={t("{title} vakant shtatini tanlash", { title: tx(position.title) })}
                            disabled={position.vacantUnits <= 0}
                            checked={selectedVacancies.includes(position.id)}
                            onChange={(event) =>
                              setSelectedVacancies((current) =>
                                event.target.checked
                                  ? [...current, position.id]
                                  : current.filter((id) => id !== position.id),
                              )
                            }
                          />
                        </td>
                      ) : null}
                      <td>
                        <div className="employee-cell">
                          <span className="metric-icon blue">
                            <UserCog size={16} />
                          </span>
                          <span>
                            <strong>{tx(position.title)}</strong>
                            <small>
                              {position.subunit || position.department
                                ? tx(position.subunit || position.department)
                                : t("Bo‘lim ko‘rsatilmagan")}
                            </small>
                            {position.roles?.map((role) => (
                              <small key={`${position.id}-${role.departmentId}`} className="staff-secondary-role">
                                {t("Qo‘shma rahbarlik: {department}", { department: tx(role.department) })}
                              </small>
                            ))}
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong>{numberFormatter.format(position.headcountUnits)}</strong>
                        <small className="table-subtext">{t("{n} stavka", { n: position.fteRate })}</small>
                      </td>
                      <td>{position.grade || "—"}</td>
                      <td>
                        <StaffOccupancyCell
                          position={position}
                          onActivateReserved={
                            canProvision
                              ? (employeeId) => void activateReservedAccount(position.id, employeeId)
                              : undefined
                          }
                        />
                      </td>
                      <td>
                        <span className="connection-badge">{tx(position.dataStatus)}</span>
                        <small className="table-subtext">{position.sourceFile}</small>
                      </td>
                      <td>{position.effectiveFrom ? formatDateTime(position.effectiveFrom, true) : t("Sana yo‘q")}</td>
                    </tr>
                  ))}
                  {positionRows.padBottom ? (
                    <tr aria-hidden="true" style={{ height: positionRows.padBottom }}>
                      <td colSpan={canProvision ? 7 : 6} style={{ padding: 0, border: 0 }} />
                    </tr>
                  ) : null}
                </tbody>
              </table>
              {!detail.positions.length ? (
                <div className="empty-state">
                  <Users size={26} />
                  <strong>{t("Batafsil shtat qatori yo‘q")}</strong>
                  <span>{t("Bu tashkilot reestrda mavjud, ammo manbada lavozimlar kesimi berilmagan.")}</span>
                </div>
              ) : null}
            </div>
          </article>
          {detail.nextCursor ? (
            <button
              className="secondary-button staff-more"
              disabled={busy}
              onClick={() => void openOrganization(detail.organization.id, departmentId, detail.nextCursor!, true)}
            >
              {busy ? t("Yuklanmoqda...") : t("Keyingi 40 qator")}
            </button>
          ) : null}
        </>
      )}
      {busy ? (
        <div className="directory-loading">
          <RefreshCw className="spin" size={18} /> {t("Ma’lumot yangilanmoqda...")}
        </div>
      ) : null}
    </section>
  );
}
