"use client";

import { useI18n } from "../../../lib/i18n";
import { Database, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { Role, Project } from "./research-types";

const STATUS_LABELS: Record<string, string> = {
  draft: "Qoralama",
  active: "Jarayonda",
  review: "Tekshiruvda",
  institute_review: "Tashkilot tekshiruvida",
  committee_review: "Qo‘mita tekshiruvida",
  completed: "Yakunlangan",
  implementation: "Joriy etishda",
  archived: "Arxivlangan",
  open: "Arizalar ochiq",
  selection: "Tanlovda",
  assigned: "Loyiha yaratilgan",
  submitted: "Yuborilgan",
  selected: "Tanlangan",
  not_selected: "Tanlanmagan",
  rejected: "Rad etilgan",
  converted: "Loyihaga aylantirilgan",
  pending: "Kutilmoqda",
  approved: "Tasdiqlangan",
  returned: "Qaytarilgan",
  piloted: "Pilotga olingan",
};

export const ROLE_LABELS: Record<Role, string> = {
  committee: "Qo‘mita mas’ul boshqarmasi",
  institute: "Ijrochi tashkilot",
  leadership: "Qo‘mita rahbariyati",
};

export const AREA_OPTIONS = [
  "Qoplama",
  "Ko‘prik",
  "Yo‘l aktivlari",
  "Yo‘l xavfsizligi",
  "Yo‘l diagnostikasi",
  "Ekologiya",
  "Raqamlashtirish",
];

function statusClass(status: string) {
  if (["completed", "approved", "implementation", "selected", "converted", "piloted"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (["review", "institute_review", "committee_review", "submitted", "selection"].includes(status)) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (["returned", "archived", "not_selected"].includes(status)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (["active", "open"].includes(status)) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function StatusBadge({ status }: { status: string }) {
  const i18n = useI18n();
  return (
    <Badge variant="outline" className={statusClass(status)}>
      {i18n.t(STATUS_LABELS[status]) ?? i18n.tx(status)}
    </Badge>
  );
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const normalizedValue = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value.includes("T")
      ? value
      : `${value}T00:00:00Z`;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value || 0);
}

export function formatFileSize(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function daysUntil(value: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Math.ceil((Date.parse(`${value}T00:00:00Z`) - today.getTime()) / 86_400_000);
}

export function deadlineLabel(project: Project) {
  if (["completed", "implementation", "archived"].includes(project.status)) return null;
  const days = daysUntil(project.endDate);
  if (days < 0) return { label: "{days} kun kechikkan", days: Math.abs(days), tone: "danger" };
  if (days <= 30) return { label: "{days} kun qoldi", days, tone: "warning" };
  return null;
}

export function normalize(value: string) {
  return value
    .toLocaleLowerCase("uz")
    .replace(/[ʻ’‘`]/g, "'")
    .replace(/[^a-zа-яё0-9'\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="text-xs font-semibold text-slate-600">
      {children}
    </Label>
  );
}

export function SubmitButton({
  pending,
  disabled = false,
  children,
}: {
  pending: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      {children}
    </Button>
  );
}

export function EmptyState({ icon: Icon, title, text }: { icon: typeof Search; title: string; text: string }) {
  const i18n = useI18n();
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50 px-6 text-center">
      <Icon className="mb-3 size-8 text-slate-400" />
      <p className="font-semibold text-slate-700">{i18n.tx(title)}</p>
      <p className="mt-1 max-w-md text-sm text-slate-500">{i18n.tx(text)}</p>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-[420px] rounded-2xl bg-slate-100">
      <div className="space-y-6 p-5 sm:p-6">
        <Skeleton className="h-20 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[430px] rounded-2xl" />
      </div>
    </div>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: typeof Database;
  label: string;
  value: string | number;
  detail: string;
  accent: string;
}) {
  const i18n = useI18n();
  return (
    <Card className="gap-3 border-0 py-5 shadow-[0_8px_24px_rgba(34,60,84,0.07)]">
      <CardContent className="px-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{i18n.t(label)}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{i18n.tx(detail)}</p>
          </div>
          <div className={`grid size-10 place-items-center rounded-xl ${accent}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
