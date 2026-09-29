"use client";

import { Check, Palette } from "lucide-react";
import { tNow, useI18n, type Locale } from "../lib/i18n";

/** The interface language (kept under its historical name for existing props). */
export type Alphabet = Locale;
export type ColorTheme = "blue" | "indigo" | "emerald" | "teal" | "amber" | "graphite";
export type ColorMode = "light" | "dark" | "system";

export const COLOR_MODE_STORAGE_KEY = "internal-reports-color-mode";

export const numberFormatter = new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 });

export const colorThemes: Array<{ id: ColorTheme; label: string; color: string }> = [
  { id: "blue", label: "Ko‘k", color: "#1957d2" },
  { id: "indigo", label: "Indigo", color: "#6552d9" },
  { id: "emerald", label: "Yashil", color: "#087f5b" },
  { id: "teal", label: "Moviy-yashil", color: "#087f8c" },
  { id: "amber", label: "Oltin", color: "#b96508" },
  { id: "graphite", label: "Grafit", color: "#46566c" },
];

export { latinToCyrillic } from "../lib/shared/transliterate";
import { latinToCyrillic } from "../lib/shared/transliterate";

/** @deprecated Prefer `useI18n().t` / `tx`. Russian keeps the value unchanged. */
export function alphabetText(value: string, alphabet: Alphabet) {
  return alphabet === "kiril" ? latinToCyrillic(value) : value;
}

export function searchMatches(query: string, values: Array<string | null | undefined>) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  const needleForms = [needle, latinToCyrillic(needle).toLocaleLowerCase()];
  return values.some((value) => {
    const text = String(value ?? "").toLocaleLowerCase();
    const forms = [text, latinToCyrillic(text).toLocaleLowerCase()];
    return needleForms.some((item) => forms.some((candidate) => candidate.includes(item)));
  });
}

export const timeZone = "Asia/Tashkent";
export const monthNames = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];
export const weekdayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
export const weekdayShort = ["Yak", "Du", "Se", "Ch", "Pa", "Ju", "Sha"];

export function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span className="brand-mark-image" />
    </div>
  );
}

export function ThemePicker({ value, onChange }: { value: ColorTheme; onChange: (theme: ColorTheme) => void }) {
  const { t } = useI18n();
  return (
    <details className="theme-picker">
      <summary aria-label={t("Interfeys rangini tanlash")} title={t("Interfeys rangi")}>
        <Palette size={18} />
        <span>{t("Rang")}</span>
      </summary>
      <div className="theme-picker-menu" role="group" aria-label={t("Rang mavzulari")}>
        <strong>{t("Interfeys rangi")}</strong>
        <div>
          {colorThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={value === theme.id ? "active" : ""}
              onClick={(event) => {
                event.preventDefault();
                onChange(theme.id);
                event.currentTarget.closest("details")?.removeAttribute("open");
              }}
              aria-pressed={value === theme.id}
            >
              <i style={{ background: theme.color }} />
              <span>{t(theme.label)}</span>
              {value === theme.id ? <Check size={14} /> : null}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function avatarColor(id: number) {
  return ["blue", "amber", "violet", "green", "red"][Math.abs(id) % 5];
}

export function usernameStem(fullName: string) {
  const transliteration: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "j",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "x",
    ц: "s",
    ч: "ch",
    ш: "sh",
    щ: "sh",
    ъ: "",
    ы: "i",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    ў: "o",
    қ: "q",
    ғ: "g",
    ҳ: "h",
  };
  const latin = fullName
    .toLocaleLowerCase("uz")
    .split("")
    .map((letter) => transliteration[letter] ?? letter)
    .join("")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ");
  const parts = latin
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);
  if (!parts.length) return "xodim";
  const familyName = parts[0];
  const givenName = parts[1] ?? "x";
  return `${givenName[0]}.${familyName}`.slice(0, 28);
}

export function toDate(value: string | Date) {
  if (value instanceof Date) return value;
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? `${value.replace(" ", "T")}Z` : value;
  return new Date(normalized);
}

export function localDateKey(value: Date | string = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    toDate(value),
  );
}

export function dateFromKey(key: string) {
  return new Date(`${key}T12:00:00Z`);
}

export function keyFromDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: string, amount: number) {
  const date = dateFromKey(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return keyFromDate(date);
}

export function startOfWeek(key: string) {
  const date = dateFromKey(key);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return keyFromDate(date);
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(
    toDate(value),
  );
}

export function formatDateTime(value: string | Date, dateOnly = false) {
  const key = localDateKey(value);
  const label = `${Number(key.slice(8, 10))}-${tNow(monthNames[Number(key.slice(5, 7)) - 1])}`;
  return dateOnly ? label : `${label}, ${formatTime(value)}`;
}

export function formatFullDate(key: string) {
  const date = dateFromKey(key);
  return `${tNow(weekdayNames[date.getUTCDay()])}, ${Number(key.slice(8, 10))}-${tNow(monthNames[Number(key.slice(5, 7)) - 1])} ${key.slice(0, 4)}`;
}

export function localDateTimeParts(value: string | Date) {
  return { date: localDateKey(value), time: formatTime(value) };
}

export function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function organizationTypeLabel(type: string) {
  return tNow(
    (
      {
        committee: "Qo‘mita",
        central: "Qo‘mita markaziy apparati",
        territorial: "Hududiy bosh boshqarma",
        district: "Tuman tashkiloti",
        direct_subordinate: "Qo‘mitaga to‘g‘ridan-to‘g‘ri bo‘ysunuvchi",
        all: "Barcha tashkilotlar",
      } as Record<string, string>
    )[type] ?? type,
  );
}

export function scopeLabel(scope: string) {
  return tNow(
    (
      {
        all: "Barchasi",
        subtree: "Quyi tuzilma",
        organization: "O‘z tashkiloti",
        department: "O‘z bo‘limi",
        own: "Faqat o‘zi",
        none: "Yo‘q",
      } as Record<string, string>
    )[scope] ?? scope,
  );
}

export const regionLabels: Record<string, string> = {
  karakalpakstan: "Qoraqalpog‘iston Respublikasi",
  andijan: "Andijon",
  bukhara: "Buxoro",
  jizzakh: "Jizzax",
  kashkadarya: "Qashqadaryo",
  navoi: "Navoiy",
  namangan: "Namangan",
  samarkand: "Samarqand",
  surkhandarya: "Surxondaryo",
  syrdarya: "Sirdaryo",
  tashkent_region: "Toshkent viloyati",
  fergana: "Farg‘ona",
  khorezm: "Xorazm",
  tashkent_city: "Toshkent shahri",
  other: "Boshqa",
};

/** Resolve light|dark|system to concrete light|dark for DOM. */
export function resolveColorMode(mode: ColorMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

/** Apply color mode to <html data-theme="...">. Safe for SSR (no-op). */
export function applyColorMode(mode: ColorMode) {
  if (typeof document === "undefined") return;
  const resolved = resolveColorMode(mode);
  document.documentElement.setAttribute("data-theme", resolved);
}
