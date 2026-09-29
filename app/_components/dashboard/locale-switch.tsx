"use client";

import { LOCALES, type Locale } from "../../../lib/i18n";

/** Lotin / Кирилл / Рус switch; option names are shown in their own script. */
export function LocaleSwitch({
  locale,
  onChange,
  className = "topbar-alphabet",
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  className?: string;
}) {
  return (
    <div className={className} role="group" aria-label="Til / Тил / Язык">
      {LOCALES.map((option) => (
        <button
          key={option.id}
          type="button"
          lang={option.lang}
          className={locale === option.id ? "active" : ""}
          onClick={() => onChange(option.id)}
          aria-pressed={locale === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Reads a persisted locale; accepts the older two-value alphabet setting. */
export function parseStoredLocale(value: string | null | undefined): Locale | null {
  return value === "lotin" || value === "kiril" || value === "rus" ? value : null;
}
