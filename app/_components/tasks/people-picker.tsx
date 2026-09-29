"use client";

import { Building2, Check, CheckCircle2, CircleAlert, Plus, RefreshCw, Search, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OrganizationCascadePicker, defaultDirectoryOrganizationId, readJson } from "../../dashboard-kit";
import { avatarColor, initials } from "../../ui-helpers";
import type { ModalOrganization, ModalDepartment, ModalEmployee, AudienceTarget } from "./task-meeting-types";
import { useI18n } from "../../../lib/i18n";
import { useVirtualList, virtualItemProps } from "../ui/use-virtual-list";

export function PeoplePicker({
  employees,
  organizations = [],
  departments = [],
  audiences = [],
  setAudiences,
  selected,
  setSelected,
  excludedIds = [],
  maxSelected = 250,
  scope = "task",
  compact = false,
}: {
  employees: ModalEmployee[];
  organizations?: ModalOrganization[];
  departments?: ModalDepartment[];
  audiences?: AudienceTarget[];
  setAudiences?: (value: AudienceTarget[]) => void;
  selected: number[];
  setSelected: (value: number[]) => void;
  excludedIds?: number[];
  maxSelected?: number;
  scope?: "task" | "meeting";
  compact?: boolean;
}) {
  const { t, tx } = useI18n();
  const [query, setQuery] = useState("");
  const [organizationId, setOrganizationId] = useState(() => defaultDirectoryOrganizationId(organizations));
  const [departmentId, setDepartmentId] = useState("all");
  const [includeDescendants, setIncludeDescendants] = useState(true);
  const [remoteEmployees, setRemoteEmployees] = useState<
    Array<
      Pick<
        ModalEmployee,
        | "id"
        | "name"
        | "position"
        | "departmentId"
        | "department"
        | "organizationId"
        | "organization"
        | "managerId"
        | "roleName"
      >
    >
  >([]);
  const [knownRemoteEmployees, setKnownRemoteEmployees] = useState<typeof remoteEmployees>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [pickerError, setPickerError] = useState("");
  const [searching, setSearching] = useState(false);
  const excludedIdsKey = excludedIds.join(",");
  const excludedIdSet = useMemo(
    () =>
      new Set(
        excludedIdsKey
          .split(",")
          .map(Number)
          .filter((id) => Number.isSafeInteger(id) && id > 0),
      ),
    [excludedIdsKey],
  );
  const filteredDepartments =
    organizationId === "all"
      ? []
      : departments.filter((department) => department.organizationId === Number(organizationId));
  const directorySearchActive = query.trim().length >= 1 || organizationId !== "all" || departmentId !== "all";

  const loadDirectory = useCallback(
    async (cursor = 0, append = false, signal?: AbortSignal) => {
      const normalized = query.trim();
      const params = new URLSearchParams({ scope, limit: "60" });
      if (normalized.length >= 1) params.set("q", normalized);
      if (organizationId !== "all") params.set("organizationId", organizationId);
      if (departmentId !== "all") params.set("departmentId", departmentId);
      if (cursor) params.set("cursor", String(cursor));
      setSearching(true);
      setPickerError("");
      if (!append) setRemoteEmployees([]);
      try {
        const result = await readJson<{ employees: typeof remoteEmployees; nextCursor: number | null }>(
          await fetch(`/api/directory?${params}`, { signal, cache: "no-store" }),
        );
        setRemoteEmployees((current) => {
          const combined = append ? [...current, ...result.employees] : result.employees;
          return combined.filter(
            (employee, index, rows) =>
              !excludedIdSet.has(employee.id) && rows.findIndex((item) => item.id === employee.id) === index,
          );
        });
        setKnownRemoteEmployees((current) =>
          [...current, ...result.employees].filter(
            (employee, index, rows) =>
              !excludedIdSet.has(employee.id) && rows.findIndex((item) => item.id === employee.id) === index,
          ),
        );
        setNextCursor(result.nextCursor);
      } catch (directoryError) {
        if (!signal?.aborted) {
          if (!append) setRemoteEmployees([]);
          setPickerError(directoryError instanceof Error ? directoryError.message : "Xodimlar ro‘yxati yuklanmadi");
        }
      } finally {
        if (!signal?.aborted) setSearching(false);
      }
    },
    [departmentId, excludedIdSet, organizationId, query, scope],
  );

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 1 && organizationId === "all" && departmentId === "all") {
      const resetTimer = window.setTimeout(() => {
        setRemoteEmployees([]);
        setNextCursor(null);
        setPickerError("");
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadDirectory(0, false, controller.signal);
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [departmentId, directorySearchActive, loadDirectory, organizationId, query]);
  const options = directorySearchActive ? remoteEmployees.filter((employee) => !excludedIdSet.has(employee.id)) : [];
  // The results box scrolls by itself; only the rows in view are rendered.
  // "Select visible" below still uses the full `options` list.
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const { attach: attachResults, ...results } = useVirtualList({
    count: options.length,
    estimateRowHeight: 52,
    threshold: 60,
    columns: "auto",
    scrollRef: resultsRef,
  });
  const setResultsElement = useCallback(
    (element: HTMLDivElement | null) => {
      resultsRef.current = element;
      attachResults(element);
    },
    [attachResults],
  );
  const selectedPeople = [...employees, ...knownRemoteEmployees].filter(
    (employee, index, array) =>
      selected.includes(employee.id) &&
      !excludedIdSet.has(employee.id) &&
      array.findIndex((item) => item.id === employee.id) === index,
  );
  function addAudience(targetType: "organization" | "department") {
    if (!setAudiences) return;
    const targetId = Number(targetType === "organization" ? organizationId : departmentId);
    if (!targetId) return;
    const targetName =
      targetType === "organization"
        ? organizations.find((item) => item.id === targetId)?.name
        : departments.find((item) => item.id === targetId)?.name;
    if (!targetName || audiences.some((item) => item.targetType === targetType && item.targetId === targetId)) return;
    setAudiences([
      ...audiences,
      {
        targetType,
        targetId,
        targetName,
        includeDescendants: targetType === "organization" && includeDescendants,
      },
    ]);
  }
  return (
    <fieldset className={`people-picker ${compact ? "compact-picker" : ""}`}>
      <legend>
        {t("Ijrochilar / ishtirokchilar *")}{" "}
        <small>{t("Ierarxiya yoki qidiruv orqali tanlang · ko‘pi bilan {n} ta", { n: maxSelected })}</small>
      </legend>
      <div className="audience-picker-toolbar">
        <OrganizationCascadePicker
          organizations={organizations}
          value={organizationId}
          onChange={(next) => {
            setOrganizationId(next);
            setDepartmentId("all");
          }}
          ariaLabel={t("Ijrochi tashkilotini tanlash")}
        />
        <label>
          <Users size={15} />
          <select
            value={departmentId}
            disabled={organizationId === "all"}
            onChange={(event) => setDepartmentId(event.target.value)}
          >
            <option value="all">
              {organizationId === "all" ? t("Avval tashkilotni tanlang") : t("Barcha bo‘limlar")}
            </option>
            {filteredDepartments.map((department) => (
              <option key={department.id} value={department.id}>
                {tx(department.name)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("F.I.Sh. yoki lavozim bo‘yicha qidiring...")}
          />
        </label>
      </div>
      {setAudiences ? (
        <div className="audience-target-toolbar">
          <div>
            <button type="button" disabled={organizationId === "all"} onClick={() => addAudience("organization")}>
              <Building2 size={14} /> {t("Tashkilotni belgilash")}
            </button>
            <button type="button" disabled={departmentId === "all"} onClick={() => addAudience("department")}>
              <Users size={14} /> {t("Bo‘limni belgilash")}
            </button>
          </div>
          <label>
            <input
              type="checkbox"
              checked={includeDescendants}
              onChange={(event) => setIncludeDescendants(event.target.checked)}
            />{" "}
            {t("Quyi tashkilotlar bilan")}
          </label>
        </div>
      ) : null}
      {audiences.length ? (
        <div className="audience-target-chips">
          {audiences.map((audience) => (
            <span key={`${audience.targetType}-${audience.targetId}`}>
              <i>{audience.targetType === "organization" ? <Building2 size={13} /> : <Users size={13} />}</i>
              <strong>{tx(audience.targetName)}</strong>
              {audience.includeDescendants ? <small>{t("+ quyi tuzilma")}</small> : null}
              <button
                type="button"
                onClick={() => setAudiences?.(audiences.filter((item) => item !== audience))}
                aria-label={t("{name} auditoriyasini olib tashlash", { name: tx(audience.targetName) })}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      {selected.length ? (
        <div className="audience-selection-summary">
          <span>
            <CheckCircle2 size={15} />
            <strong>{t("{n} ta tanlandi", { n: selected.length })}</strong>
            {selectedPeople.slice(0, 3).map((employee) => (
              <em key={employee.id}>{tx(employee.name)}</em>
            ))}
            {selected.length > 3 ? <em>+{selected.length - 3}</em> : null}
          </span>
          <button type="button" onClick={() => setSelected([])}>
            {t("Tozalash")}
          </button>
        </div>
      ) : null}
      <div className="people-picker-results" ref={setResultsElement}>
        {results.padTop ? <div aria-hidden="true" style={{ gridColumn: "1 / -1", height: results.padTop }} /> : null}
        {options.slice(results.start, results.end).map((employee, offset) => (
          <button
            type="button"
            key={employee.id}
            {...virtualItemProps(results.start + offset)}
            className={selected.includes(employee.id) ? "selected" : ""}
            disabled={!selected.includes(employee.id) && selected.length >= maxSelected}
            onClick={() =>
              setSelected(
                selected.includes(employee.id)
                  ? selected.filter((id) => id !== employee.id)
                  : [...selected, employee.id].slice(0, maxSelected),
              )
            }
          >
            <span className={`person-avatar ${avatarColor(employee.id)}`}>{initials(employee.name)}</span>
            <span>
              <strong>{tx(employee.name)}</strong>
              <small>
                {employee.position || employee.roleName} · {tx(employee.department)} · {tx(employee.organization)}
              </small>
            </span>
            <em>{selected.includes(employee.id) ? <Check size={14} /> : <Plus size={14} />}</em>
          </button>
        ))}
        {results.padBottom ? (
          <div aria-hidden="true" style={{ gridColumn: "1 / -1", height: results.padBottom }} />
        ) : null}
      </div>
      {options.length ? (
        <div className="audience-picker-footer">
          <button
            type="button"
            className="audience-select-visible"
            disabled={selected.length >= maxSelected}
            onClick={() =>
              setSelected(
                Array.from(new Set([...selected, ...options.map((employee) => employee.id)])).slice(0, maxSelected),
              )
            }
          >
            <Check size={14} /> {t("Ko‘rinayotgan {n} xodimni tanlash", { n: options.length })}
          </button>
          {directorySearchActive && nextCursor ? (
            <button
              type="button"
              className="audience-load-more"
              disabled={searching}
              onClick={() => void loadDirectory(nextCursor, true)}
            >
              <RefreshCw size={14} className={searching ? "spin" : ""} />{" "}
              {searching ? t("Yuklanmoqda…") : t("Yana 60 ta ko‘rsatish")}
            </button>
          ) : null}
        </div>
      ) : null}
      {pickerError ? (
        <div className="picker-error">
          <CircleAlert size={15} />
          <span>{t(pickerError)}</span>
          <button type="button" onClick={() => void loadDirectory(0, false)}>
            {t("Qayta urinish")}
          </button>
        </div>
      ) : null}
      {!directorySearchActive && employees.length > options.length ? (
        <div className="picker-guidance">
          <Search size={14} /> {t("Tashkilot yoki bo‘limni tanlang yoxud ism bo‘yicha qidiring.")}
        </div>
      ) : null}
      {!options.length ? (
        <div className="picker-empty">
          {directorySearchActive && searching && !pickerError
            ? t("Qidirilmoqda...")
            : pickerError
              ? ""
              : t(
                  "Filtrga mos faol xodim topilmadi. Bo‘sh shtatga emas, tashkilot yoki bo‘limga topshiriq berishingiz mumkin.",
                )}
        </div>
      ) : null}
    </fieldset>
  );
}
