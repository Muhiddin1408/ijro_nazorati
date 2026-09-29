"use client";

/**
 * Shared dashboard primitives extracted so page modules (Chat, Tasks, …)
 * can import without circularly depending on the monolith.
 */

import { X } from "lucide-react";
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../lib/i18n";
import { useFocusTrap } from "./_components/ui/use-focus-trap";

export type OrganizationOption = {
  id: number;
  name: string;
  shortName: string;
  type: string;
  parentId: number | null;
  regionCode?: string | null;
  active: boolean;
};

export type DepartmentOption = {
  id: number;
  name: string;
  organizationId: number | null;
  organization: string;
  parentId: number | null;
  active: boolean;
};

// One JSON reader for the whole UI; see lib/shared/http.ts.
export { readJson } from "../lib/shared/http";

export function hierarchicalOrganizationOptions(organizations: OrganizationOption[]) {
  const active = organizations.filter((organization) => organization.active && organization.type !== "committee");
  const idSet = new Set(active.map((organization) => organization.id));
  const byParent = new Map<number | null, OrganizationOption[]>();
  for (const organization of active) {
    const parentId = organization.parentId != null && idSet.has(organization.parentId) ? organization.parentId : null;
    const children = byParent.get(parentId) ?? [];
    children.push(organization);
    byParent.set(parentId, children);
  }
  for (const children of byParent.values()) children.sort((a, b) => a.name.localeCompare(b.name));
  const result: Array<{ organization: OrganizationOption; depth: number }> = [];
  const visited = new Set<number>();
  const walk = (parentId: number | null, depth: number) => {
    for (const organization of byParent.get(parentId) ?? []) {
      if (visited.has(organization.id)) continue;
      visited.add(organization.id);
      result.push({ organization, depth });
      walk(organization.id, depth + 1);
    }
  };
  walk(null, 0);
  for (const organization of active) if (!visited.has(organization.id)) result.push({ organization, depth: 0 });
  return result;
}

export function defaultDirectoryOrganizationId(organizations: OrganizationOption[]) {
  const active = organizations.filter((organization) => organization.active && organization.type !== "committee");
  const preferred =
    active.find((organization) => organization.type === "central") ??
    active.find((organization) => organization.type === "territorial") ??
    active.find((organization) => !active.some((candidate) => candidate.id === organization.parentId)) ??
    active[0];
  return preferred ? String(preferred.id) : "all";
}

const territorialOrganizationTypes = new Set(["territorial"]);

export function OrganizationCascadePicker({
  organizations,
  value,
  onChange,
  ariaLabel = "Tashkilotni tanlash",
}: {
  organizations: OrganizationOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  const { t, tx } = useI18n();
  const selectable = useMemo(
    () => organizations.filter((organization) => organization.active && organization.type !== "committee"),
    [organizations],
  );
  const byId = useMemo(() => new Map(selectable.map((organization) => [organization.id, organization])), [selectable]);
  const central = selectable.find((organization) => organization.type === "central") ?? null;
  const selected = value === "all" ? null : (byId.get(Number(value)) ?? null);
  const selectedParent = selected?.parentId ? (byId.get(selected.parentId) ?? null) : null;
  const selectedTerritorial =
    selected?.type === "territorial" ? selected : selectedParent?.type === "territorial" ? selectedParent : null;
  const selectedIsDirect = Boolean(selected && !selectedTerritorial && selected.type !== "central");
  const initialRoot = selected?.type === "central" ? "central" : selected ? "system" : central ? "central" : "system";
  const [root, setRoot] = useState(initialRoot);
  const [systemGroup, setSystemGroup] = useState(
    selectedTerritorial ? "territorial" : selectedIsDirect ? "direct" : "territorial",
  );
  const [territorialId, setTerritorialId] = useState(selectedTerritorial ? String(selectedTerritorial.id) : "");
  const territorial = selectable
    .filter((organization) => territorialOrganizationTypes.has(organization.type))
    .sort((left, right) => left.name.localeCompare(right.name, "uz"));
  const direct = selectable
    .filter((organization) => {
      if (!central || organization.parentId !== central.id) return false;
      return organization.type !== "territorial";
    })
    .sort((left, right) => left.name.localeCompare(right.name, "uz"));
  const territorialChildren = territorialId
    ? selectable
        .filter((organization) => organization.parentId === Number(territorialId))
        .sort((left, right) => left.name.localeCompare(right.name, "uz"))
    : [];

  function setTerritorialIdSafely(next: string) {
    setTerritorialId(next);
    onChange(next || "all");
  }

  if (!central) {
    return (
      <div className="organization-cascade scoped-organization-cascade" aria-label={t(ariaLabel)}>
        <label>
          <span>{t("Tashkilot")}</span>
          <select value={selected ? String(selected.id) : "all"} onChange={(event) => onChange(event.target.value)}>
            <option value="all">{t("Tashkilotni tanlang")}</option>
            {hierarchicalOrganizationOptions(selectable).map(({ organization, depth }) => (
              <option key={organization.id} value={organization.id}>
                {`${"— ".repeat(depth)}${tx(organization.shortName || organization.name)}`}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  return (
    <div className="organization-cascade" aria-label={t(ariaLabel)}>
      <label>
        <span>{t("Tuzilma")}</span>
        <select
          value={root}
          onChange={(event) => {
            const next = event.target.value;
            setRoot(next);
            if (next === "central" && central) onChange(String(central.id));
            else onChange("all");
          }}
        >
          {central ? <option value="central">{t("Qo‘mita markaziy apparati")}</option> : null}
          <option value="system">{t("Tizimdagi korxonalar")}</option>
        </select>
      </label>
      {root === "system" ? (
        <>
          <label>
            <span>{t("Korxonalar guruhi")}</span>
            <select
              value={systemGroup}
              onChange={(event) => {
                const next = event.target.value;
                setSystemGroup(next);
                setTerritorialId("");
                onChange("all");
              }}
            >
              <option value="territorial">{t("Hududiy boshqarmalar")}</option>
              <option value="direct">{t("To‘g‘ridan-to‘g‘ri bo‘ysunuvchi")}</option>
            </select>
          </label>
          {systemGroup === "territorial" ? (
            <label>
              <span>{t("Hududiy boshqarma")}</span>
              <select
                value={territorialId}
                onChange={(event) => {
                  setTerritorialIdSafely(event.target.value);
                }}
              >
                <option value="">{t("Hududni tanlang")}</option>
                {territorial.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {tx(organization.shortName || organization.name)}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              <span>{t("Tashkilot")}</span>
              <select
                value={selectedIsDirect ? String(selected?.id ?? "") : ""}
                onChange={(event) => onChange(event.target.value || "all")}
              >
                <option value="">{t("Tashkilotni tanlang")}</option>
                {direct.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {tx(organization.shortName || organization.name)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {systemGroup === "territorial" && territorialId ? (
            <label>
              <span>{t("Hudud tashkiloti")}</span>
              <select
                value={selected && selected.parentId === Number(territorialId) ? String(selected.id) : ""}
                onChange={(event) => onChange(event.target.value || territorialId)}
              >
                <option value="">{t("Bosh boshqarmaning o‘zi")}</option>
                {territorialChildren.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {tx(organization.shortName || organization.name)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function PageIntro({
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
  // Callers may pass either localized or Uzbek Latin text; t() is idempotent for both.
  const { t } = useI18n();
  return (
    <div className="module-intro">
      <div>
        <p className="section-kicker">{t(kicker)}</p>
        <h2>{t(title)}</h2>
        <p>{t(description)}</p>
      </div>
      {actions ? <div className="module-actions">{actions}</div> : null}
    </div>
  );
}

// ModalHeader renders the title with this id so the dialog is announced by its heading.
const ModalTitleContext = createContext<string | undefined>(undefined);

export function ModalFrame({
  children,
  onClose,
  wide = false,
  extraWide = false,
  label,
}: {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  extraWide?: boolean;
  label?: string;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const fallbackLabel = t("Muloqot oynasi");
  // Focus moves in, Tab stays inside, Escape closes, focus returns on close, page scroll is locked.
  useFocusTrap(true, sheetRef, onClose);
  // Modals without <ModalHeader>: label the dialog by its first heading instead.
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || label || document.getElementById(titleId)) return;
    const heading = sheet.querySelector<HTMLElement>("h1,h2,h3");
    if (heading) {
      if (!heading.id) heading.id = titleId;
      sheet.setAttribute("aria-labelledby", heading.id);
    } else {
      sheet.removeAttribute("aria-labelledby");
      sheet.setAttribute("aria-label", fallbackLabel);
    }
  }, [fallbackLabel, label, titleId]);
  return (
    <ModalTitleContext.Provider value={titleId}>
      <div
        className="modal-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          ref={sheetRef}
          className={`modal-sheet ${extraWide ? "extra-wide-modal" : wide ? "wide-modal" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={label ? undefined : titleId}
          aria-label={label ? t(label) : undefined}
          tabIndex={-1}
        >
          {children}
        </div>
      </div>
    </ModalTitleContext.Provider>
  );
}

export function ModalHeader({
  kicker,
  title,
  subtitle,
  onClose,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  const titleId = useContext(ModalTitleContext);
  const { t } = useI18n();
  return (
    <div className="modal-header">
      <div>
        <p className="section-kicker">{t(kicker)}</p>
        <h2 id={titleId}>{t(title)}</h2>
        <span>{t(subtitle)}</span>
      </div>
      <button type="button" className="icon-button" onClick={onClose} aria-label={t("Oynani yopish")}>
        <X size={19} />
      </button>
    </div>
  );
}
