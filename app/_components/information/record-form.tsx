"use client";

import { useI18n } from "../../../lib/i18n";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  FilePenLine,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Search,
  Send,
  ShieldCheck,
  TableProperties,
  Users,
  X,
} from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { joinCoordinates } from "../../../lib/information-input";
import type {
  InformationField,
  InformationTemplate,
  InformationDomain,
  InformationRecord,
  DirectoryEmployee,
  DirectoryOrganization,
} from "./information-types";
import {
  cadenceLabels,
  humanFileSize,
  responseJson,
  InfoPill,
  useDialogFocus,
  uploadInformationFile,
} from "./information-helpers";
import { confirmDialog } from "../ui/confirm-dialog";

export function InformationRecordForm({
  mode,
  template,
  domain,
  record,
  defaults,
  canSave,
  canSubmit,
  canMarkDemo,
  onClose,
  onSaved,
  onError,
}: {
  mode: "new" | "edit";
  template: InformationTemplate;
  domain: InformationDomain | null;
  record?: InformationRecord;
  defaults?: Record<string, unknown>;
  canSave: boolean;
  canSubmit: boolean;
  canMarkDemo: boolean;
  onClose: () => void;
  onSaved: (id: number, submitted: boolean) => void;
  onError: (message: string) => void;
}) {
  const i18n = useI18n();
  const [busy, setBusy] = useState<"draft" | "submit" | "">("");
  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...(record?.values ?? defaults ?? {}) }));
  const [files, setFiles] = useState<Record<string, File>>({});
  const [formError, setFormError] = useState("");
  const [dirty, setDirty] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const createdRecordIdRef = useRef<number | null>(mode === "edit" ? (record?.id ?? null) : null);
  const uploadedFieldsRef = useRef(new Set<string>());
  const versionRef = useRef(record?.version ?? 0);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  const requestClose = useCallback(async () => {
    if (busy) return;
    if (
      dirty &&
      !(await confirmDialog({
        title: i18n.t("Saqlanmagan o‘zgarishlar"),
        message: i18n.t("Kiritilgan o‘zgarishlar saqlanmagan. Oynani yopishni xohlaysizmi?"),
        confirmLabel: i18n.t("Yopish"),
        cancelLabel: i18n.t("Tahrirlashda davom etish"),
        tone: "danger",
      }))
    )
      return;
    onClose();
  }, [busy, dirty, onClose, i18n]);
  useDialogFocus(true, layerRef, requestClose);

  function setField(field: InformationField, value: unknown) {
    setDirty(true);
    setValues((current) => ({ ...current, [field.code]: value }));
  }

  function setFile(field: InformationField, file: File | null) {
    setDirty(true);
    uploadedFieldsRef.current.delete(field.code);
    setFiles((current) => {
      const next = { ...current };
      if (file) next[field.code] = file;
      else delete next[field.code];
      return next;
    });
    setValues((current) => ({ ...current, [field.code]: file?.name ?? record?.values[field.code] ?? "" }));
  }

  async function submit(formElement: HTMLFormElement, submitNow: boolean) {
    if (busy || (submitNow ? !canSubmit : !canSave)) return;
    if (Object.keys(files).length && !canSave) {
      setFormError(i18n.t("Fayl biriktirish uchun ma’lumot kiritish vakolati kerak"));
      return;
    }
    const form = new FormData(formElement);
    const normalizedValues = Object.fromEntries(
      template.fields.map((field) => {
        const value = values[field.code];
        if (field.type === "multiselect" && typeof value === "string")
          return [
            field.code,
            value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          ];
        return [field.code, value];
      }),
    );
    const details = {
      title: form.get("title"),
      periodStart: form.get("periodStart"),
      periodEnd: form.get("periodEnd"),
      values: normalizedValues,
    };
    const hasFiles = Object.keys(files).length > 0;
    try {
      setBusy(submitNow ? "submit" : "draft");
      setFormError("");
      if (!createdRecordIdRef.current) {
        const result = await responseJson<{ id: number; version: number }>(
          await fetch("/api/information", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...details,
              templateId: template.id,
              priority: form.get("priority"),
              isDemo: form.get("isDemo") === "on",
              submit: submitNow && !hasFiles,
            }),
          }),
        );
        createdRecordIdRef.current = result.id;
        versionRef.current = result.version;
      } else {
        const result = await responseJson<{ version: number }>(
          await fetch("/api/information", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...details,
              id: createdRecordIdRef.current,
              expectedVersion: versionRef.current,
              action: submitNow && !hasFiles ? "submit" : "save",
            }),
          }),
        );
        versionRef.current = result.version;
      }
      const recordId = createdRecordIdRef.current;
      for (const [fieldCode, file] of Object.entries(files)) {
        if (uploadedFieldsRef.current.has(fieldCode)) continue;
        const result = await uploadInformationFile(recordId, fieldCode, file, versionRef.current);
        versionRef.current = result.version;
        uploadedFieldsRef.current.add(fieldCode);
      }
      if (submitNow && hasFiles) {
        const result = await responseJson<{ version: number }>(
          await fetch("/api/information", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...details, id: recordId, expectedVersion: versionRef.current, action: "submit" }),
          }),
        );
        versionRef.current = result.version;
      }
      setDirty(false);
      await onSaved(recordId, submitNow);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Ma’lumot saqlanmadi";
      setFormError(i18n.tx(message));
      onError(i18n.tx(message));
    } finally {
      setBusy("");
    }
  }

  return (
    <div
      ref={layerRef}
      className="info-form-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="information-form-dialog-title"
      tabIndex={-1}
    >
      <button type="button" className="info-form-scrim" onClick={requestClose} aria-label={i18n.t("Yopish")} />
      <form
        className="info-form-modal"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(event.currentTarget, false);
        }}
        onInput={() => setDirty(true)}
        onChange={() => setDirty(true)}
      >
        <div className="info-form-header">
          <span className="info-form-icon">
            <FilePenLine size={22} />
          </span>
          <div>
            <small>{i18n.tx(domain?.name) || i18n.t("Ma’lumotlar markazi")}</small>
            <h3 id="information-form-dialog-title">
              {mode === "new" ? i18n.t("Yangi yozuv kiritish") : i18n.t("Yozuvni tahrirlash")}
            </h3>
            <p>{i18n.tx(template.name)}</p>
          </div>
          <button type="button" onClick={requestClose} aria-label={i18n.t("Yopish")}>
            <X size={20} />
          </button>
        </div>
        <fieldset className="info-form-scroll info-input-fieldset" disabled={Boolean(busy)} aria-busy={Boolean(busy)}>
          <div className="info-form-context">
            <InfoPill tone="blue">
              <TableProperties size={12} /> {template.code}
            </InfoPill>
            <InfoPill>
              <Clock3 size={12} /> {i18n.t(cadenceLabels[template.cadence]) ?? i18n.tx(template.cadence)}
            </InfoPill>
            <InfoPill>
              {i18n.t("Majburiy maydonlar:")}{" "}
              {
                template.fields.filter(
                  (field) => field.required && values[field.code] != null && String(values[field.code]).trim() !== "",
                ).length
              }{" "}
              / {template.fields.filter((field) => field.required).length}
            </InfoPill>
          </div>
          <div className="info-form-section">
            <div className="info-form-section-title">
              <span>01</span>
              <div>
                <strong>{i18n.t("Yozuv rekvizitlari")}</strong>
                <small>{i18n.t("Davr va hujjatni aniqlovchi asosiy ma’lumotlar")}</small>
              </div>
            </div>
            <div className="info-form-grid">
              <label className="wide">
                <span>{i18n.t("Sarlavha *")}</span>
                <input
                  data-dialog-initial-focus
                  name="title"
                  required
                  minLength={3}
                  maxLength={240}
                  defaultValue={record?.title ?? ""}
                  placeholder={i18n.t("Yozuvni aniq ifodalovchi nom")}
                />
              </label>
              <label>
                <span>{i18n.t("Davr boshlanishi")}</span>
                <input name="periodStart" type="date" defaultValue={record?.periodStart?.slice(0, 10) ?? ""} />
              </label>
              <label>
                <span>{i18n.t("Davr yakuni")}</span>
                <input name="periodEnd" type="date" defaultValue={record?.periodEnd?.slice(0, 10) ?? ""} />
              </label>
              {mode === "new" ? (
                <label>
                  <span>{i18n.t("Muhimlik")}</span>
                  <select name="priority" defaultValue={record?.priority ?? "normal"}>
                    <option value="low">{i18n.t("Past")}</option>
                    <option value="normal">{i18n.t("Odatiy")}</option>
                    <option value="high">{i18n.t("Yuqori")}</option>
                    <option value="critical">{i18n.t("Kritik")}</option>
                  </select>
                </label>
              ) : null}
              {mode === "new" && canMarkDemo ? (
                <label className="info-form-demo">
                  <span>{i18n.t("Ma’lumot turi")}</span>
                  <span>
                    <input type="checkbox" name="isDemo" />
                    <i>
                      <Check size={12} />
                    </i>{" "}
                    {i18n.t("Demo sifatida belgilash")}
                  </span>
                  <small>{i18n.t("Demo yozuv real hisobotga qo‘shilmaydi.")}</small>
                </label>
              ) : null}
            </div>
          </div>
          <div className="info-form-section">
            <div className="info-form-section-title">
              <span>02</span>
              <div>
                <strong>{i18n.t("Shakl maydonlari")}</strong>
                <small>
                  {template.fields.length} {i18n.t("ta maydon · * belgisi majburiy")}
                </small>
              </div>
            </div>
            <div className="info-form-grid">
              {template.fields.map((field) => (
                <DynamicField
                  key={field.code}
                  field={field}
                  value={values[field.code]}
                  file={files[field.code]}
                  onChange={(value) => setField(field, value)}
                  onFile={(file) => setFile(field, file)}
                />
              ))}
            </div>
          </div>
          <div className="info-form-integrity">
            <ShieldCheck size={19} />
            <div>
              <strong>{i18n.t("Ma’lumotlar nazorati")}</strong>
              <span>
                {i18n.t(
                  "Saqlanganda maydonlar tekshiriladi, o‘zgarishlar tarixi va kiritgan xodim avtomatik qayd etiladi.",
                )}
              </span>
            </div>
          </div>
          {formError ? (
            <div className="info-alert info-alert-error" role="alert">
              <AlertCircle size={17} />
              {i18n.tx(formError)}
            </div>
          ) : null}
        </fieldset>
        <div className="info-form-actions">
          <button type="button" className="secondary-button" onClick={requestClose}>
            {i18n.t("Bekor qilish")}
          </button>
          <span />
          {canSave ? (
            <button
              type="button"
              className="secondary-button"
              disabled={Boolean(busy)}
              onClick={(event) => {
                const form = event.currentTarget.form;
                if (form) void submit(form, false);
              }}
            >
              {busy === "draft" ? <LoaderCircle size={16} className="spin" /> : <FilePenLine size={16} />}{" "}
              {i18n.t("Qoralama saqlash")}
            </button>
          ) : null}
          {canSubmit ? (
            <button
              type="button"
              className="primary-button"
              disabled={Boolean(busy)}
              onClick={(event) => {
                const form = event.currentTarget.form;
                if (form?.reportValidity()) void submit(form, true);
              }}
            >
              {busy === "submit" ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />}{" "}
              {i18n.t("Ko‘rib chiqishga yuborish")}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function DynamicField({
  field,
  value,
  file,
  onChange,
  onFile,
}: {
  field: InformationField;
  value: unknown;
  file?: File;
  onChange: (value: unknown) => void;
  onFile: (file: File | null) => void;
}) {
  const i18n = useI18n();
  const isWide =
    ["textarea", "employees", "file", "organization", "road", "geo"].includes(field.type) ||
    (field.type === "multiselect" && (field.options?.length ?? 0) > 5);
  const common = {
    id: `information-${field.code}`,
    required: field.required,
  };
  const labelId = `${common.id}-label`;
  let control: ReactNode;
  if (field.type === "textarea") {
    control = (
      <textarea
        {...common}
        rows={4}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        placeholder={i18n.tx(field.placeholder)}
      />
    );
  } else if (field.type === "select" && field.options?.length) {
    control = (
      <select {...common} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
        <option value="">{i18n.t("Tanlang")}</option>
        {field.options?.map((option) => (
          <option value={option} key={option}>
            {i18n.tx(option)}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "select") {
    control = (
      <div className="info-input-with-unit info-open-select">
        <input
          {...common}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder={i18n.tx(field.placeholder) || i18n.t("Ro‘yxat hali sozlanmagan — qiymatni kiriting")}
        />
        <span>{i18n.t("Erkin")}</span>
      </div>
    );
  } else if (field.type === "multiselect" && field.options?.length) {
    const selected = Array.isArray(value)
      ? value.map(String)
      : String(value ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
    control = (
      <div className="info-multiselect" role="group" aria-labelledby={labelId}>
        {field.options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) =>
                onChange(event.target.checked ? [...selected, option] : selected.filter((item) => item !== option))
              }
            />
            <span>
              <Check size={11} />
            </span>
            {i18n.tx(option)}
          </label>
        ))}
      </div>
    );
  } else if (field.type === "multiselect") {
    control = (
      <input
        {...common}
        value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        placeholder={i18n.t("Qiymatlarni vergul bilan ajrating")}
      />
    );
  } else if (field.type === "boolean") {
    control = (
      <select
        {...common}
        value={value == null || value === "" ? "" : String(value)}
        onChange={(event) => onChange(event.target.value === "" ? "" : event.target.value === "true")}
      >
        <option value="">{i18n.t("Tanlang")}</option>
        <option value="true">{i18n.t("Ha")}</option>
        <option value="false">{i18n.t("Yo‘q")}</option>
      </select>
    );
  } else if (field.type === "employee" || field.type === "employees") {
    control = (
      <DirectoryEmployeeField
        id={common.id}
        required={field.required}
        multiple={field.type === "employees"}
        value={value}
        onChange={onChange}
      />
    );
  } else if (field.type === "organization") {
    control = <DirectoryOrganizationField id={common.id} required={field.required} value={value} onChange={onChange} />;
  } else if (field.type === "region") {
    control = (
      <select {...common} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
        <option value="">{i18n.t("Hududni tanlang")}</option>
        {uzbekRegions.map((region) => (
          <option key={region} value={region}>
            {i18n.tx(region)}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "road") {
    control = <RoadField id={common.id} required={field.required} value={String(value ?? "")} onChange={onChange} />;
  } else if (field.type === "geo") {
    control = <GeoField id={common.id} required={field.required} value={String(value ?? "")} onChange={onChange} />;
  } else if (field.type === "file") {
    control = (
      <InformationFileField
        id={common.id}
        required={field.required}
        value={String(value ?? "")}
        file={file}
        onFile={onFile}
      />
    );
  } else {
    const inputType =
      field.type === "date"
        ? "date"
        : field.type === "datetime"
          ? "datetime-local"
          : ["number", "currency", "percentage"].includes(field.type)
            ? "number"
            : field.type === "url"
              ? "url"
              : "text";
    control = (
      <div className="info-input-with-unit">
        <input
          {...common}
          type={inputType}
          value={String(value ?? "")}
          min={field.min}
          max={field.max}
          step={["number", "currency", "percentage"].includes(field.type) ? "any" : undefined}
          onChange={(event) => onChange(event.target.value)}
          placeholder={i18n.tx(field.placeholder)}
        />
        {field.unit ? <span>{i18n.tx(field.unit)}</span> : null}
      </div>
    );
  }
  return (
    <div
      className={`info-form-field ${isWide ? "wide" : ""}`}
      role={
        ["multiselect", "employees", "organization", "road", "geo", "file"].includes(field.type) ? "group" : undefined
      }
      aria-labelledby={labelId}
    >
      {["boolean", "multiselect", "employees", "organization", "road", "geo", "file"].includes(field.type) ? (
        <span id={labelId} className="info-field-label">
          {i18n.t(field.label)}
          {field.required ? " *" : ""}
          {field.sensitive ? <LockKeyhole size={12} /> : null}
        </span>
      ) : (
        <label id={labelId} className="info-field-label" htmlFor={common.id}>
          {i18n.t(field.label)}
          {field.required ? " *" : ""}
          {field.sensitive ? <LockKeyhole size={12} /> : null}
        </label>
      )}
      {control}
      {field.help ? <small className="info-field-help">{i18n.tx(field.help)}</small> : null}
    </div>
  );
}

const uzbekRegions = [
  "Qoraqalpog‘iston Respublikasi",
  "Andijon viloyati",
  "Buxoro viloyati",
  "Jizzax viloyati",
  "Qashqadaryo viloyati",
  "Navoiy viloyati",
  "Namangan viloyati",
  "Samarqand viloyati",
  "Surxondaryo viloyati",
  "Sirdaryo viloyati",
  "Toshkent viloyati",
  "Farg‘ona viloyati",
  "Xorazm viloyati",
  "Toshkent shahri",
];

function DirectoryEmployeeField({
  id,
  required,
  multiple,
  value,
  onChange,
}: {
  id: string;
  required?: boolean;
  multiple: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const i18n = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DirectoryEmployee[]>([]);
  const [busy, setBusy] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<Record<number, string>>({});
  const selected = (Array.isArray(value) ? value : value == null || value === "" ? [] : [value])
    .map((item) => Number(typeof item === "string" ? item.split(/[—;,]/, 1)[0].trim() : item))
    .filter((item) => Number.isSafeInteger(item) && item > 0);
  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setBusy(true);
      const params = new URLSearchParams({ scope: "staff", q: normalized, limit: "12" });
      void fetch(`/api/directory?${params}`, { cache: "no-store", signal: controller.signal })
        .then((response) => responseJson<{ employees: DirectoryEmployee[] }>(response))
        .then((result) => setResults(result.employees))
        .catch(() => {
          if (!controller.signal.aborted) setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setBusy(false);
        });
    }, 240);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  const choose = (employee: DirectoryEmployee) => {
    setSelectedLabels((current) => ({ ...current, [employee.id]: employee.name }));
    onChange(multiple ? [...selected.filter((item) => item !== employee.id), employee.id] : employee.id);
    setQuery("");
    setResults([]);
  };
  const listId = `${id}-results`;
  return (
    <div className="info-directory-field">
      {selected.length ? (
        <div className="info-lookup-chips">
          {selected.map((item) => (
            <span key={item}>
              <Users size={12} />
              {i18n.t(selectedLabels[item]) || i18n.t("Xodim #{item}", { item })}
              <button
                type="button"
                onClick={() => onChange(multiple ? selected.filter((selectedItem) => selectedItem !== item) : "")}
                aria-label={i18n.t("Xodim #{item}ni olib tashlash", { item })}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="info-lookup-input">
        <Search size={15} />
        <input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={results.length > 0}
          required={Boolean(required && !selected.length)}
          value={query}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            if (next.trim().length < 2) {
              setResults([]);
              setBusy(false);
            }
          }}
          placeholder={
            selected.length && !multiple
              ? i18n.t("Xodimni almashtirish…")
              : i18n.t("F.I.Sh. yoki lavozim bo‘yicha qidiring…")
          }
        />
        {busy ? <LoaderCircle size={14} className="spin" /> : null}
      </div>
      {results.length ? (
        <div id={listId} className="info-lookup-results" role="listbox">
          {results.map((employee) => (
            <button
              type="button"
              role="option"
              aria-selected={selected.includes(employee.id)}
              key={employee.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(employee)}
            >
              <span>{i18n.tx(employee.name)}</span>
              <small>
                {i18n.tx(employee.position) || i18n.t("Lavozim ko‘rsatilmagan")} · {i18n.tx(employee.organization)}
              </small>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DirectoryOrganizationField({
  id,
  required,
  value,
  onChange,
}: {
  id: string;
  required?: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const i18n = useI18n();
  const [open, setOpen] = useState(false);
  const [nodes, setNodes] = useState<DirectoryOrganization[]>([]);
  const [trail, setTrail] = useState<Array<{ id: number; name: string }>>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const initializedRef = useRef(false);
  const branchRequest = useRef(0);
  const selectedId = Number(value) || 0;
  const load = useCallback(async (parentId: number | null) => {
    const request = ++branchRequest.current;
    setBusy(true);
    try {
      const params = new URLSearchParams({ kind: "branches" });
      if (parentId != null) params.set("parentId", String(parentId));
      const result = await responseJson<{ organizations: DirectoryOrganization[] }>(
        await fetch(`/api/directory?${params}`, { cache: "no-store" }),
      );
      if (request === branchRequest.current) setNodes(result.organizations);
    } catch {
      if (request === branchRequest.current) setNodes([]);
    } finally {
      if (request === branchRequest.current) setBusy(false);
    }
  }, []);
  useEffect(() => {
    if (!open || initializedRef.current) return;
    initializedRef.current = true;
    void load(null);
  }, [load, open]);
  const goChildren = (organization: DirectoryOrganization) => {
    setTrail((current) => [...current, { id: organization.id, name: organization.shortName || organization.name }]);
    setNodes([]);
    setQuery("");
    void load(organization.id);
  };
  const goBack = () => {
    const next = trail.slice(0, -1);
    setTrail(next);
    setNodes([]);
    setQuery("");
    void load(next.at(-1)?.id ?? null);
  };
  const filtered = nodes.filter(
    (organization) =>
      !query.trim() ||
      `${organization.name} ${organization.shortName}`
        .toLocaleLowerCase("uz")
        .includes(query.trim().toLocaleLowerCase("uz")),
  );
  return (
    <div className="info-directory-field info-organization-field">
      {selectedId ? (
        <div className="info-lookup-chips">
          <span>
            <Building2 size={12} />
            {i18n.tx(selectedName) || i18n.t("Tashkilot #{selectedId}", { selectedId })}
            <button
              type="button"
              onClick={() => {
                setSelectedName("");
                onChange("");
              }}
              aria-label={i18n.t("Tashkilotni olib tashlash")}
            >
              <X size={12} />
            </button>
          </span>
        </div>
      ) : null}
      <button
        id={id}
        type="button"
        className="info-organization-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={`${id}-organizations`}
        data-invalid={required && !selectedId ? "true" : undefined}
      >
        <Building2 size={15} />
        <span>{selectedId ? i18n.t("Tashkilotni almashtirish") : i18n.t("Tashkilotni ierarxiyadan tanlash")}</span>
        <ChevronRight size={15} />
      </button>
      <input
        className="info-required-proxy"
        tabIndex={-1}
        aria-label={i18n.t("Tashkilot tanlanishi shart")}
        required={Boolean(required && !selectedId)}
        value={selectedId || ""}
        onInvalid={(event) => {
          event.preventDefault();
          setOpen(true);
          window.requestAnimationFrame(() => document.getElementById(id)?.focus());
        }}
        onChange={() => undefined}
      />
      {open ? (
        <div id={`${id}-organizations`} className="info-organization-popover">
          <div className="info-organization-nav">
            {trail.length ? (
              <button type="button" onClick={goBack} aria-label={i18n.t("Yuqori tashkilotga qaytish")}>
                <ArrowLeft size={14} />
              </button>
            ) : null}
            <span>{i18n.tx(trail.at(-1)?.name) || i18n.t("Yuqori tashkilotlar")}</span>
          </div>
          <label>
            <Search size={14} />
            <input
              id={`${id}-search`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={i18n.t("Shu bosqichdan qidirish…")}
            />
          </label>
          <div className="info-organization-options">
            {busy ? (
              <span className="info-inline-loading">
                <LoaderCircle size={15} className="spin" /> {i18n.t("Yuklanmoqda…")}
              </span>
            ) : (
              filtered.map((organization) => (
                <div key={organization.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedName(organization.name);
                      onChange(organization.id);
                      setOpen(false);
                    }}
                  >
                    {i18n.tx(organization.shortName) || i18n.tx(organization.name)}
                    <small>{i18n.tx(organization.type)}</small>
                  </button>
                  {organization.childCount ? (
                    <button
                      type="button"
                      onClick={() => goChildren(organization)}
                      aria-label={i18n.t("{name} quyi tashkilotlarini ochish", { name: i18n.tx(organization.name) })}
                    >
                      <ChevronRight size={15} />
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RoadField({
  id,
  required,
  value,
  onChange,
}: {
  id: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const i18n = useI18n();
  const [road = "", kilometer = ""] = value.split(/\s*· km /);
  const update = (nextRoad: string, nextKilometer: string) =>
    onChange(`${nextRoad}${nextKilometer ? ` · km ${nextKilometer}` : ""}`);
  return (
    <div className="info-structured-pair">
      <label>
        <span>{i18n.t("Yo‘l indeksi yoki nomi")}</span>
        <input
          id={id}
          required={required}
          value={road}
          onChange={(event) => update(event.target.value, kilometer)}
          placeholder={i18n.t("Masalan: A-380")}
        />
      </label>
      <label>
        <span>{i18n.t("Kilometr / uchastka")}</span>
        <input
          inputMode="decimal"
          value={kilometer}
          onChange={(event) => update(road, event.target.value)}
          placeholder="245+500"
        />
      </label>
    </div>
  );
}

function GeoField({
  id,
  required,
  value,
  onChange,
}: {
  id: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const i18n = useI18n();
  const [latitude = "", longitude = ""] = value.split(",").map((item) => item.trim());
  const update = (lat: string, lon: string) => onChange(joinCoordinates(lat, lon));
  return (
    <div className="info-structured-pair">
      <label>
        <span>{i18n.t("Kenglik")}</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="-90"
          max="90"
          step="any"
          required={required}
          value={latitude}
          onChange={(event) => update(event.target.value, longitude)}
          placeholder="41.3111"
        />
      </label>
      <label>
        <span>{i18n.t("Uzunlik")}</span>
        <input
          type="number"
          inputMode="decimal"
          min="-180"
          max="180"
          step="any"
          required={required}
          value={longitude}
          onChange={(event) => update(latitude, event.target.value)}
          placeholder="69.2797"
        />
      </label>
    </div>
  );
}

function InformationFileField({
  id,
  required,
  value,
  file,
  onFile,
}: {
  id: string;
  required?: boolean;
  value: string;
  file?: File;
  onFile: (file: File | null) => void;
}) {
  const i18n = useI18n();
  return (
    <div className="info-file-field">
      <input
        id={id}
        type="file"
        required={Boolean(required && !value)}
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
      <label htmlFor={id}>
        <FileText size={18} />
        <span>
          <strong>{i18n.tx(file?.name) || i18n.tx(value) || i18n.t("Faylni tanlang")}</strong>
          <small>
            {file
              ? humanFileSize(file.size)
              : value
                ? i18n.t("Avval biriktirilgan fayl")
                : i18n.t("PDF, Office, rasm, video yoki arxiv")}
          </small>
        </span>
        <em>{file || value ? i18n.t("Almashtirish") : i18n.t("Tanlash")}</em>
      </label>
      {file ? (
        <button type="button" onClick={() => onFile(null)}>
          <X size={13} /> {i18n.t("Tanlovni bekor qilish")}
        </button>
      ) : null}
    </div>
  );
}
