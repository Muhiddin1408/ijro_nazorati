"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { applyColorMode, COLOR_MODE_STORAGE_KEY, type ColorMode } from "./ui-helpers";
import { useI18n } from "../lib/i18n";

/**
 * Light / Dark / System toggle.
 * Persists to localStorage (internal-reports-color-mode).
 * Apply CSS via html[data-theme="dark"].
 */
export function ThemeModeToggle() {
  const { t } = useI18n();
  const [mode, setMode] = useState<ColorMode>(() => {
    if (typeof window === "undefined") return "system";
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    } catch {
      // Storage may be blocked (private mode, policy); fall back to the system mode.
    }
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  });

  useEffect(() => {
    applyColorMode(mode);
    if (mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyColorMode("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  function choose(next: ColorMode) {
    setMode(next);
    try {
      window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
    } catch {
      // Best effort: the choice still applies for this page view.
    }
    applyColorMode(next);
  }

  return (
    <div className="theme-mode-toggle" role="group" aria-label={t("Rang rejimi")}>
      <button
        type="button"
        className={mode === "light" ? "active" : ""}
        onClick={() => choose("light")}
        aria-pressed={mode === "light"}
        title={t("Yorug‘ rejim")}
      >
        <Sun size={15} />
        <span className="sr-only">{t("Yorug‘")}</span>
      </button>
      <button
        type="button"
        className={mode === "dark" ? "active" : ""}
        onClick={() => choose("dark")}
        aria-pressed={mode === "dark"}
        title={t("Qorong‘u rejim")}
      >
        <Moon size={15} />
        <span className="sr-only">{t("Qorong‘u")}</span>
      </button>
      <button
        type="button"
        className={mode === "system" ? "active" : ""}
        onClick={() => choose("system")}
        aria-pressed={mode === "system"}
        title={t("Tizim sozlamasi")}
      >
        <Monitor size={15} />
        <span className="sr-only">{t("Tizim")}</span>
      </button>
    </div>
  );
}
