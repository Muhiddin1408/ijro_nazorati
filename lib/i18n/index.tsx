"use client";

/**
 * Render-time localization (replaces the DOM-mutating alphabet renderer).
 *
 * - `t(text)`   — UI strings written in Uzbek Latin in the source. Latin: as is;
 *                 Cyrillic: transliterated; Russian: looked up in the dictionary
 *                 (falls back to the Latin original when a string is missing).
 *                 `{name}` placeholders are filled from `params` after lookup.
 * - `tx(value)` — user data (names, titles, organization names). Latin: as is;
 *                 Cyrillic: transliterated; Russian: unchanged (data has no translation).
 * - Identifiers (logins, emails, URLs, tokens, codes) are rendered raw — never
 *   through `t` or `tx`.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { translate, transliterateData, type Locale, type TranslateParams } from "./core";

export * from "./core";

export type I18n = {
  locale: Locale;
  t: (text: string, params?: TranslateParams) => string;
  tx: (value: string | null | undefined) => string;
};

function create(locale: Locale): I18n {
  return {
    locale,
    t: (text, params) => translate(locale, text, params),
    tx: (value) => transliterateData(locale, value),
  };
}

const I18nContext = createContext<I18n>(create("lotin"));

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => create(locale), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
