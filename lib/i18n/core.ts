/**
 * Pure localization logic (no React). See lib/i18n/index.tsx for the hooks.
 */
import { latinToCyrillic } from "../shared/transliterate";
import { ru } from "./ru";

export type Locale = "lotin" | "kiril" | "rus";

export const LOCALES: ReadonlyArray<{ id: Locale; label: string; lang: string }> = [
  { id: "lotin", label: "Lotin", lang: "uz-Latn" },
  { id: "kiril", label: "Кирилл", lang: "uz-Cyrl" },
  { id: "rus", label: "Рус", lang: "ru" },
];

/** Cookie mirroring the chosen locale so the server renders the right <html lang>. */
export const LOCALE_COOKIE = "ijro-locale";

export function parseLocale(value: string | null | undefined): Locale | null {
  return value === "lotin" || value === "kiril" || value === "rus" ? value : null;
}

export type TranslateParams = Record<string, string | number | null | undefined>;

function fill(template: string, params?: TranslateParams) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? match : String(value);
  });
}

export function translate(locale: Locale, text: string, params?: TranslateParams) {
  if (locale === "rus") return fill(ru[text] ?? text, params);
  // Placeholders are filled after transliteration so parameter values are not altered.
  if (locale === "kiril") {
    const keys: string[] = [];
    const masked = text.replace(/\{(\w+)\}/g, (_match, key: string) => `\uE100${keys.push(key) - 1}\uE101`);
    const converted = latinToCyrillic(masked).replace(
      /\uE100(\d+)\uE101/g,
      (_match, index: string) => `{${keys[Number(index)]}}`,
    );
    return fill(converted, params);
  }
  return fill(text, params);
}

export function transliterateData(locale: Locale, value: string | null | undefined) {
  if (!value) return value ?? "";
  return locale === "kiril" ? latinToCyrillic(value) : value;
}

export function localeLang(locale: Locale) {
  return LOCALES.find((item) => item.id === locale)?.lang ?? "uz-Latn";
}

/** Non-React callers (confirm dialogs, exports) read the current locale here. */
let currentLocale: Locale = "lotin";
export function setCurrentLocale(locale: Locale) {
  currentLocale = locale;
}
export function getCurrentLocale(): Locale {
  return currentLocale;
}
export function tNow(text: string, params?: TranslateParams) {
  return translate(currentLocale, text, params);
}
