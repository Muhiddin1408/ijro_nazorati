"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Alphabet } from "../../ui-helpers";
import type { Actor } from "./dashboard-types";

/**
 * Shell-wide values that deep components need (who is acting, which alphabet,
 * how to report results). Replaces passing the same props through every modal.
 */
export type DashboardContextValue = {
  actor: Actor;
  alphabet: Alphabet;
  notify: (text: string, tone?: "ok" | "error") => void;
  refresh: (forceFresh?: boolean) => Promise<void>;
  /** Runs a mutation, refreshes the shell and reports success or failure. */
  run: (action: () => Promise<unknown>, success: string, close?: boolean) => Promise<boolean>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ value, children }: { value: DashboardContextValue; children: ReactNode }) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

/** The shell context; throws when used outside the dashboard. */
export function useDashboard(): DashboardContextValue {
  const value = useContext(DashboardContext);
  if (!value) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return value;
}

/** Same as useDashboard, but null outside the dashboard (for components that also render standalone). */
export function useOptionalDashboard(): DashboardContextValue | null {
  return useContext(DashboardContext);
}

/**
 * Toast reporting for components that may render with or without the shell.
 * Outside the dashboard messages fall back to the console.
 */
export function useNotify(): DashboardContextValue["notify"] {
  const value = useContext(DashboardContext);
  return value?.notify ?? fallbackNotify;
}

function fallbackNotify(text: string, tone: "ok" | "error" = "ok") {
  if (tone === "error") console.error(text);
  else console.info(text);
}
