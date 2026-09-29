"use client";

import { useI18n } from "../../../lib/i18n";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Building2,
  CalendarDays,
  Database,
  FileClock,
  Gauge,
  Layers3,
  Landmark,
  Link2,
  LockKeyhole,
  Network,
  Send,
  ShieldCheck,
  Route,
  Scale,
  TableProperties,
  Truck,
  Users,
  Wrench,
  Factory,
  Cpu,
} from "lucide-react";
import { type ReactNode, type RefObject } from "react";
import { RoadLoader } from "../../road-loader";
import { useFocusTrap } from "../ui/use-focus-trap";
import { readJson } from "../../../lib/shared/http";
import type {
  InformationField,
  InformationTemplate,
  InformationDomain,
  InformationRecord,
  InformationSummary,
} from "./information-types";

const emptySummary: InformationSummary = {
  domains: 0,
  templates: 0,
  indicators: 0,
  records: 0,
  realRecords: 0,
  demoRecords: 0,
  submitted: 0,
  published: 0,
};

const statusLabels: Record<string, string> = {
  draft: "Qoralama",
  submitted: "Ko‘rib chiqishda",
  returned: "Qaytarilgan",
  rejected: "Rad etilgan",
  published: "Tasdiqlangan",
  archived: "Arxivlangan",
};

export const cadenceLabels: Record<string, string> = {
  event: "Voqea bo‘yicha",
  daily: "Har kuni",
  weekly: "Har hafta",
  monthly: "Har oy",
  quarterly: "Har chorak",
  yearly: "Har yil",
  continuous: "Doimiy",
};

export const domainIcons = [
  Building2,
  BarChart3,
  Network,
  Database,
  TableProperties,
  ShieldCheck,
  Users,
  Gauge,
  FileClock,
  BookOpenCheck,
  Layers3,
  Link2,
  CalendarDays,
  LockKeyhole,
];

export const domainIconMap = {
  Megaphone: Send,
  MessageCircle: Network,
  WalletCards: BarChart3,
  BarChart3,
  Wrench,
  Building2,
  Truck,
  ClipboardCheck: BookOpenCheck,
  Route,
  Factory,
  Cpu,
  Landmark,
  Users,
  ShieldCheck,
  Scale,
  Activity,
} as const;

export function normalizeSummary(summary?: Partial<InformationSummary>): InformationSummary {
  return { ...emptySummary, ...summary };
}

function parseSystemDate(value: string | null | undefined) {
  if (!value) return null;
  let normalized = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) normalized = `${normalized}T12:00:00+05:00`;
  else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(normalized))
    normalized = `${normalized.replace(" ", "T")}Z`;
  else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) normalized = `${normalized}:00+05:00`;
  else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(normalized)) normalized = `${normalized}+05:00`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dateTime(value: string | null | undefined, withTime = true) {
  if (!value) return "—";
  const date = parseSystemDate(value);
  if (!date) return value;
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function humanFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function responseJson<T>(response: Response): Promise<T> {
  return readJson<T>(response, "Amalni bajarib bo‘lmadi");
}

export function toneForDomain(domain: InformationDomain, index = 0) {
  const color = domain.color?.match(/^#[0-9a-fA-F]{6}$/)?.[0];
  return color ?? ["#1957d2", "#0d8b65", "#7c4dce", "#c26a12", "#d13b34", "#137da1"][index % 6];
}

export function statusLabel(value: string) {
  return statusLabels[value] ?? value;
}

export function recordFreshness(record: InformationRecord, template?: InformationTemplate) {
  const updatedAt = parseSystemDate(record.updatedAt);
  if (!updatedAt) return { label: "Sana tekshirilsin", tone: "warning" };
  const ageHours = Math.max(0, (Date.now() - updatedAt.getTime()) / 3_600_000);
  const sla = Math.max(1, template?.freshnessSlaHours ?? 720);
  if (ageHours <= sla * 0.65) return { label: "Dolzarb", tone: "fresh" };
  if (ageHours <= sla) return { label: "Yangilash yaqin", tone: "warning" };
  return { label: "Eskirgan", tone: "stale" };
}

export function valueLabel(value: unknown, field?: InformationField) {
  if (value == null || value === "") return "Ma’lumot kiritilmagan";
  if (typeof value === "boolean") return value ? "Ha" : "Yo‘q";
  if (Array.isArray(value)) return value.join(", ");
  if (field?.type === "date" || field?.type === "datetime") return dateTime(String(value), field.type === "datetime");
  if (typeof value === "number") {
    const formatted = new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 3 }).format(value);
    return `${formatted}${field?.unit ? ` ${field.unit}` : ""}`;
  }
  return String(value);
}

export function InfoPill({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  return <span className={`info-pill info-pill-${tone}`}>{children}</span>;
}

export function useDialogFocus(active: boolean, layerRef: RefObject<HTMLElement | null>, onClose: () => void) {
  // Drawers hide the page behind them; the shared hook keeps Tab/Escape on the topmost dialog.
  useFocusTrap(active, layerRef, onClose, { inertSiblings: true, lockScroll: false });
}

export function LoadingState() {
  return (
    <RoadLoader label="Ma’lumotlar markazi yuklanmoqda" detail="Vakolatlar va katalog shakllari tekshirilmoqda…" />
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  const i18n = useI18n();
  return (
    <div className="info-empty">
      <span>
        <TableProperties size={26} />
      </span>
      <strong>{i18n.tx(title)}</strong>
      <p>{i18n.tx(text)}</p>
      {action}
    </div>
  );
}

export function templateFlowLabels(template: InformationTemplate) {
  if (template.presentation?.tabs?.length) return ["Bo‘limlar", "Aqlli filtr", "Jadval"];
  const drillLabels = (template.presentation?.drilldown ?? [])
    .map((code) => template.fields.find((field) => field.code === code)?.label)
    .filter((label): label is string => Boolean(label));
  if (drillLabels.length >= 2) return [drillLabels[0], drillLabels[1], "Batafsil"];
  if (drillLabels.length === 1) return ["Jami", drillLabels[0], "Batafsil"];
  return ["Ko‘rsatkich", "Filtr", "Jadval"];
}

export async function uploadInformationFile(recordId: number, fieldCode: string, file: File, version: number) {
  const response = await fetch(`/api/information/files?recordId=${recordId}`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "X-File-Name": encodeURIComponent(file.name),
      "X-File-Size": String(file.size),
      "X-Field-Code": encodeURIComponent(fieldCode),
      "X-Record-Version": String(version),
    },
    body: file,
  });
  return responseJson<{ version: number }>(response);
}
