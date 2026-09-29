"use client";

import { useI18n } from "../../../lib/i18n";
import { ArrowLeft, BarChart3, Building2, FileText, MapPin, Sparkles, X } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { useFocusTrap } from "../ui/use-focus-trap";
import type { InformationField, InformationTemplate } from "../../information-center";
import type { WorkspaceRecord, DrillDimension } from "./workspace-types";
import {
  normalized,
  statusLabel,
  displayFieldLabel,
  renderCell,
  optionsForField,
  isNumericFacet,
  isDateFacet,
  isSelectFacet,
} from "./workspace-model";

export function SummaryCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  const i18n = useI18n();
  return (
    <article className={`info-data-kpi tone-${tone}`}>
      <span>{icon}</span>
      <div>
        <small>{i18n.t(label)}</small>
        <strong>{i18n.tx(value)}</strong>
        <em>{i18n.tx(note)}</em>
      </div>
    </article>
  );
}

export function FacetFilterControl({
  field,
  records,
  values,
  onChange,
}: {
  field: InformationField;
  records: WorkspaceRecord[];
  values: Record<string, string>;
  onChange: (code: string, value: string) => void;
}) {
  const i18n = useI18n();
  const options = optionsForField(field, records);
  if (isNumericFacet(field)) {
    return (
      <label className="info-data-period">
        <span>
          {i18n.t(displayFieldLabel(field))}
          {field.unit ? i18n.t(" ({unit})", { unit: i18n.tx(field.unit) }) : ""}
        </span>
        <div>
          <input
            type="number"
            inputMode="decimal"
            value={values[`${field.code}__min`] ?? ""}
            onChange={(event) => onChange(`${field.code}__min`, event.target.value)}
            placeholder={i18n.t("Eng kam")}
          />
          <i>—</i>
          <input
            type="number"
            inputMode="decimal"
            value={values[`${field.code}__max`] ?? ""}
            onChange={(event) => onChange(`${field.code}__max`, event.target.value)}
            placeholder={i18n.t("Eng ko‘p")}
          />
        </div>
      </label>
    );
  }
  if (isDateFacet(field)) {
    const type = field.type === "datetime" ? "datetime-local" : "date";
    return (
      <label className="info-data-period">
        <span>{i18n.t(displayFieldLabel(field))}</span>
        <div>
          <input
            type={type}
            value={values[`${field.code}__min`] ?? ""}
            onChange={(event) => onChange(`${field.code}__min`, event.target.value)}
          />
          <i>—</i>
          <input
            type={type}
            value={values[`${field.code}__max`] ?? ""}
            onChange={(event) => onChange(`${field.code}__max`, event.target.value)}
          />
        </div>
      </label>
    );
  }
  if (isSelectFacet(field)) {
    const selectOptions = field.type === "boolean" ? ["Ha", "Yo‘q"] : options;
    return (
      <label>
        <span>{i18n.t(displayFieldLabel(field))}</span>
        <select value={values[field.code] ?? ""} onChange={(event) => onChange(field.code, event.target.value)}>
          <option value="">{i18n.t("Barchasi")}</option>
          {selectOptions.map((option) => (
            <option value={option} key={option}>
              {i18n.tx(option)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  const listId = `info-filter-${field.code}`;
  return (
    <label>
      <span>{i18n.t(displayFieldLabel(field))}</span>
      <input
        list={listId}
        value={values[field.code] ?? ""}
        onChange={(event) => onChange(field.code, event.target.value)}
        placeholder={i18n.t("Qidirish…")}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option value={option} key={option} />
        ))}
      </datalist>
    </label>
  );
}

function countryFlag(value = "") {
  const key = normalized(value);
  if (/germaniya|germany/.test(key)) return "🇩🇪";
  if (/turkiya|turkey/.test(key)) return "🇹🇷";
  if (/xitoy|china/.test(key)) return "🇨🇳";
  if (/janubiy koreya|south korea/.test(key)) return "🇰🇷";
  if (/italiya|italy/.test(key)) return "🇮🇹";
  if (/belgiya|belgium/.test(key)) return "🇧🇪";
  if (/yaponiya|japan/.test(key)) return "🇯🇵";
  return "🌐";
}

export function DimensionIcon({ dimension, value }: { dimension: DrillDimension; value?: string }) {
  const i18n = useI18n();
  return dimension.icon === "region" ? (
    <MapPin size={16} />
  ) : dimension.icon === "organization" ? (
    <Building2 size={16} />
  ) : dimension.icon === "country" ? (
    <span className="info-country-marker">{i18n.tx(countryFlag(value))}</span>
  ) : (
    <BarChart3 size={16} />
  );
}

export function PreviewDrawer({
  record,
  template,
  onClose,
}: {
  record: WorkspaceRecord;
  template: InformationTemplate;
  onClose: () => void;
}) {
  const i18n = useI18n();
  const layerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, layerRef, onClose, { inertSiblings: true, lockScroll: false });
  return (
    <div
      ref={layerRef}
      tabIndex={-1}
      className="info-preview-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-preview-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="info-preview-drawer">
        <header>
          <span>
            <FileText size={20} />
          </span>
          <div>
            <small>{i18n.t("MA’LUMOT KARTOCHKASI · NAMUNA")}</small>
            <strong id="info-preview-title">{i18n.tx(record.title)}</strong>
          </div>
          <button onClick={onClose} aria-label={i18n.t("Yopish")}>
            <X size={19} />
          </button>
        </header>
        <div className="info-preview-scroll">
          <div className="info-preview-note">
            <Sparkles size={16} />
            <span>
              {i18n.t(
                "Bu namuna ma’lumot ko‘rinishini baholash uchun. Real yozuv kiritilganda aynan shu jadval va kartochkada chiqadi.",
              )}
            </span>
          </div>
          <div className="info-preview-context">
            <span>{i18n.t(statusLabel(record.status))}</span>
          </div>
          <div className="info-preview-values">
            {template.fields.map((field) => (
              <div key={field.code} className={field.type === "textarea" ? "wide" : ""}>
                <small>{i18n.t(field.label)}</small>
                <strong>{renderCell(record.values[field.code], field)}</strong>
              </div>
            ))}
          </div>
        </div>
        <footer>
          <button className="secondary-button" onClick={onClose}>
            <ArrowLeft size={16} /> {i18n.t("Jadvalga qaytish")}
          </button>
        </footer>
      </aside>
    </div>
  );
}
