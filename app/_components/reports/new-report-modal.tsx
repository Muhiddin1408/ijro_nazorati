"use client";

import { useI18n } from "../../../lib/i18n";
import { FileSpreadsheet, Plus, RefreshCw, Save, Send, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { ModalFrame, ModalHeader, readJson } from "../../dashboard-kit";
import { humanSize } from "../../ui-helpers";
import type { ReportColumn, ReportOrganization, ReportsPayload } from "./report-types";
import { nextRowKey, useReportDraft } from "./use-report-draft";

export function NewReportModal({
  organizations,
  employees,
  busy,
  createdTemplateId,
  onClose,
  onSubmit,
}: {
  organizations: ReportOrganization[];
  employees: ReportsPayload["employees"];
  busy: boolean;
  createdTemplateId?: number;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>, file: File | null) => void;
}) {
  const i18n = useI18n();
  const {
    columns,
    setColumns,
    recipients,
    setRecipients,
    targetOrganizations,
    file,
    setFile,
    excelBusy,
    excelNotice,
    setDirty,
    close,
    importColumns,
    submit,
  } = useReportDraft({ organizations, busy, createdTemplateId, onClose, onSubmit });
  return (
    <ModalFrame onClose={close} wide>
      <form onSubmit={submit} onChange={() => setDirty(true)}>
        <ModalHeader
          kicker="NAMUNAVIY HISOBOT"
          title={i18n.t("Yangi hisobot shaklini yaratish")}
          subtitle="Ustunlar, davriylik, muddat va birlamchi mas’ul tashkilotlarni belgilang"
          onClose={close}
        />
        <div className="modal-body report-builder">
          {createdTemplateId ? (
            <div className="info-alert" role="status">
              {i18n.t("Hisobot shakli yaratildi. Endi tanlangan faylni qayta yuklash mumkin.")}
            </div>
          ) : null}
          <fieldset className="report-builder-lock" disabled={busy || excelBusy || Boolean(createdTemplateId)}>
            <div className="form-grid">
              <label className="full">
                <span>{i18n.t("Hisobot nomi *")}</span>
                <input
                  name="title"
                  required
                  minLength={3}
                  maxLength={240}
                  placeholder={i18n.t("Masalan: Yo‘llarni saqlash ishlari bo‘yicha oylik hisobot")}
                />
              </label>
              <label>
                <span>{i18n.t("Takrorlanish")}</span>
                <select name="frequency" defaultValue="monthly">
                  <option value="one_time">{i18n.t("Bir martalik")}</option>
                  <option value="weekly">{i18n.t("Har hafta")}</option>
                  <option value="monthly">{i18n.t("Har oy")}</option>
                  <option value="quarterly">{i18n.t("Har chorak")}</option>
                  <option value="yearly">{i18n.t("Har yil")}</option>
                </select>
              </label>
              <label>
                <span>{i18n.t("Birinchi topshirish muddati *")}</span>
                <input type="datetime-local" name="firstDeadlineAt" required />
              </label>
              <label className="full">
                <span>{i18n.t("To‘ldirish bo‘yicha ko‘rsatma")}</span>
                <textarea
                  name="instructions"
                  rows={3}
                  maxLength={8000}
                  placeholder={i18n.t("Hisobotga qaysi ma’lumotlar va qay tartibda kiritilishini yozing...")}
                />
              </label>
            </div>
            <fieldset className="report-builder-section">
              <legend>{i18n.t("Hisobot ustunlari")}</legend>
              <div className="report-excel-import">
                <span className="report-excel-icon">
                  <FileSpreadsheet size={20} />
                </span>
                <span>
                  <strong>{i18n.t("Ustunlarni Excel’dan avtomatik olish")}</strong>
                  <small>
                    {i18n.t(
                      "Birinchi qator ustun nomlari sifatida qabul qilinadi. Keyin ularni shu yerda tahrirlash mumkin.",
                    )}
                  </small>
                  {excelNotice ? <em>{i18n.tx(excelNotice)}</em> : null}
                </span>
                <label className="secondary-button">
                  <UploadCloud size={15} />
                  {excelBusy ? i18n.t("O‘qilmoqda...") : i18n.t("Excel tanlash")}
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    disabled={excelBusy}
                    onChange={(event) => {
                      const selected = event.target.files?.[0];
                      event.currentTarget.value = "";
                      if (selected) void importColumns(selected);
                    }}
                  />
                </label>
              </div>
              <div className="report-column-builder">
                {columns.map((column, index) => (
                  <div key={column.rowKey}>
                    <input
                      value={column.label}
                      onChange={(event) =>
                        setColumns((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item,
                          ),
                        )
                      }
                      required
                      placeholder={i18n.t("Ustun nomi")}
                    />
                    <select
                      value={column.type}
                      onChange={(event) =>
                        setColumns((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  type: event.target.value as ReportColumn["type"],
                                  aggregation: event.target.value === "number" ? "sum" : "none",
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="number">{i18n.t("Raqam")}</option>
                      <option value="text">{i18n.t("Matn")}</option>
                      <option value="date">{i18n.t("Sana")}</option>
                      <option value="boolean">{i18n.t("Ha / yo‘q")}</option>
                    </select>
                    <input
                      value={column.unit}
                      onChange={(event) =>
                        setColumns((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, unit: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder={i18n.t("O‘lchov birligi")}
                    />
                    <select
                      value={column.aggregation}
                      disabled={column.type !== "number"}
                      onChange={(event) =>
                        setColumns((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  aggregation: event.target.value as ReportColumn["aggregation"],
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="sum">{i18n.t("Yig‘indi")}</option>
                      <option value="average">{i18n.t("O‘rtacha")}</option>
                      <option value="last">{i18n.t("Oxirgi qiymat")}</option>
                      <option value="none">{i18n.t("Jamlanmasin")}</option>
                    </select>
                    <label className="mini-check">
                      <input
                        type="checkbox"
                        checked={column.required}
                        onChange={(event) =>
                          setColumns((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, required: event.target.checked } : item,
                            ),
                          )
                        }
                      />
                      <span>{i18n.t("Majburiy")}</span>
                    </label>
                    <button
                      type="button"
                      className="icon-button"
                      disabled={columns.length === 1}
                      onClick={() => setColumns((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="secondary-button"
                disabled={columns.length >= 32}
                onClick={() =>
                  setColumns((current) => [
                    ...current,
                    {
                      rowKey: nextRowKey(),
                      label: "",
                      type: "number",
                      unit: "",
                      required: true,
                      aggregation: "sum",
                    },
                  ])
                }
              >
                <Plus size={15} /> {i18n.t("Ustun qo‘shish")}
              </button>
            </fieldset>
            <fieldset className="report-builder-section">
              <legend>{i18n.t("Birlamchi qabul qiluvchilar")}</legend>
              <p className="fieldset-note">
                {i18n.t(
                  "Hududiy bosh boshqarma yoki to‘g‘ridan-to‘g‘ri bo‘ysunuvchi tashkilot va uning mas’ul xodimini tanlang.",
                )}
              </p>
              <div className="report-recipient-builder">
                {recipients.map((recipient, index) => {
                  return (
                    <div key={recipient.rowKey}>
                      <select
                        value={recipient.organizationId}
                        onChange={(event) =>
                          setRecipients((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    organizationId: Number(event.target.value),
                                    employeeId: 0,
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        <option value="0">{i18n.t("Tashkilotni tanlang")}</option>
                        {targetOrganizations.map((organization) => (
                          <option key={organization.id} value={organization.id}>
                            {i18n.tx(organization.name)}
                          </option>
                        ))}
                      </select>
                      <ReportResponsibleSelect
                        key={recipient.organizationId}
                        organizationId={recipient.organizationId}
                        employees={employees}
                        value={recipient.employeeId}
                        disabled={busy || excelBusy || Boolean(createdTemplateId)}
                        onChange={(employeeId) =>
                          setRecipients((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    employeeId,
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="icon-button"
                        disabled={recipients.length === 1}
                        onClick={() =>
                          setRecipients((current) => current.filter((_, itemIndex) => itemIndex !== index))
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setRecipients((current) => [...current, { organizationId: 0, employeeId: 0, rowKey: nextRowKey() }])
                }
              >
                <Plus size={15} /> {i18n.t("Tashkilot qo‘shish")}
              </button>
            </fieldset>
            <div className="report-options">
              <label className="switch-row">
                <input type="checkbox" name="allowDelegation" defaultChecked />
                <span>
                  <strong>{i18n.t("Quyi tashkilotlarga yuborishga ruxsat")}</strong>
                  <small>{i18n.t("Viloyat mas’uli hisobotni tuman tashkilotlariga taqsimlay oladi")}</small>
                </span>
              </label>
              <label className="switch-row">
                <input type="checkbox" name="requireAttachment" />
                <span>
                  <strong>{i18n.t("Tasdiqlovchi fayl majburiy")}</strong>
                  <small>{i18n.t("Hisobot faylsiz yuborilmaydi")}</small>
                </span>
              </label>
            </div>
          </fieldset>
          <label className="report-file-picker">
            <UploadCloud size={19} />
            <span>
              <strong>{file ? i18n.tx(file.name) : i18n.t("Namunaviy fayl yoki topshiriq xatini biriktirish")}</strong>
              <small>
                {file ? humanSize(file.size) : i18n.t("PDF, Word, Excel, PPTX va boshqa fayllar — 100 MB gacha")}
              </small>
            </span>
            <input
              type="file"
              disabled={busy || excelBusy}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div className="modal-footer">
          <span>
            <Send size={15} /> {i18n.t("Yaratilgach mas’ullarga sayt va Telegram orqali xabar beriladi")}
          </span>
          <div>
            <button type="button" className="secondary-button" onClick={close} disabled={busy || excelBusy}>
              {i18n.t("Bekor qilish")}
            </button>
            <button className="primary-button" disabled={busy || excelBusy}>
              {busy ? <RefreshCw className="spin" size={16} /> : <Save size={16} />} {i18n.t("Yaratish va yuborish")}
            </button>
          </div>
        </div>
      </form>
    </ModalFrame>
  );
}

export function ReportResponsibleSelect({
  organizationId,
  employees,
  value,
  disabled,
  onChange,
}: {
  organizationId: number;
  employees: ReportsPayload["employees"];
  value: number;
  disabled?: boolean;
  onChange: (id: number) => void;
}) {
  const i18n = useI18n();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState(() =>
    employees.filter((employee) => employee.organizationId === organizationId),
  );
  const [selected, setSelected] = useState(() => employees.find((employee) => employee.id === value));
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!organizationId) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({
        scope: "chat",
        organizationId: String(organizationId),
        q: query,
        limit: "100",
      });
      void fetch(`/api/directory?${params}`, { cache: "no-store", signal: controller.signal })
        .then((response) => readJson<{ employees: ReportsPayload["employees"]; nextCursor: number | null }>(response))
        .then((result) => {
          if (controller.signal.aborted) return;
          setOptions(result.employees);
          setNotice(
            result.nextCursor
              ? i18n.t("Boshqa xodimni topish uchun ismini yozing")
              : result.employees.length
                ? ""
                : i18n.t("Xodim topilmadi"),
          );
        })
        .catch(() => {
          if (!controller.signal.aborted) setNotice(i18n.t("Ro‘yxat yuklanmadi. Qidiruvni qayta kiriting"));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [organizationId, query, i18n]);
  const visible =
    selected?.id === value && !options.some((option) => option.id === value) ? [selected, ...options] : options;
  return (
    <div className="report-responsible-select">
      <input
        aria-label={i18n.t("Mas’ul xodimni qidirish")}
        placeholder={i18n.t("Xodimni ismi bo‘yicha qidiring")}
        value={query}
        disabled={disabled || !organizationId}
        onChange={(event) => setQuery(event.target.value)}
      />
      <select
        aria-label={i18n.t("Mas’ul xodim")}
        value={value}
        disabled={disabled || !organizationId}
        onChange={(event) => {
          const id = Number(event.target.value);
          setSelected(options.find((option) => option.id === id));
          onChange(id);
        }}
      >
        <option value="0">{i18n.t("Mas’ul xodimni tanlang")}</option>
        {visible.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {i18n.tx(employee.name)} — {i18n.tx(employee.position)}
          </option>
        ))}
      </select>
      {loading || notice ? <small role="status">{loading ? i18n.t("Qidirilmoqda…") : i18n.tx(notice)}</small> : null}
    </div>
  );
}
