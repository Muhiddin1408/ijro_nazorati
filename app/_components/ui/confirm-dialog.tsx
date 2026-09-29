"use client";

import { AlertTriangle, HelpCircle } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useI18n } from "../../../lib/i18n";
import { useFocusTrap } from "./use-focus-trap";

/**
 * Accessible replacement for window.confirm / window.prompt.
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title, message, confirmLabel, tone: "danger" }))) return;
 *   const reason = await promptDialog({ title, message, inputLabel }); // string | null
 *
 * Callers pass Uzbek Latin texts; the dialog localizes them at render time
 * (t()), so callers need no change for Cyrillic or Russian.
 */
export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  /** When set, the confirm button stays disabled until the user types this phrase. */
  requireText?: string;
  /** Other spellings of `requireText` that are also accepted (e.g. Cyrillic). */
  requireTextAlternatives?: string[];
};

export type PromptOptions = Omit<ConfirmOptions, "requireText" | "requireTextAlternatives"> & {
  inputLabel: string;
  placeholder?: string;
  /** Minimum trimmed length (default 1: an answer is required). */
  minLength?: number;
  maxLength?: number;
};

type Request =
  | (ConfirmOptions & { kind: "confirm"; id: number; resolve: (value: boolean) => void })
  | (PromptOptions & { kind: "prompt"; id: number; resolve: (value: string | null) => void });

let queue: Request[] = [];
let nextId = 1;
let hostCount = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function current() {
  return queue[0] ?? null;
}

/** `value` null = cancelled; true/string = confirmed (string for prompts). */
function settle(id: number, value: string | true | null) {
  const request = queue.find((item) => item.id === id);
  if (!request) return;
  queue = queue.filter((item) => item.id !== id);
  if (request.kind === "prompt") request.resolve(typeof value === "string" ? value : null);
  else request.resolve(value !== null);
  emit();
}

function cancelAll() {
  const pending = queue;
  queue = [];
  for (const item of pending) {
    if (item.kind === "prompt") item.resolve(null);
    else item.resolve(false);
  }
  emit();
}

/** Opens a confirmation dialog; resolves true only when the user confirms. */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  if (hostCount === 0) {
    // Without a mounted host nothing could answer; refusing is the safe default.
    console.error("confirmDialog called without <ConfirmHost />:", options.title);
    return Promise.resolve(false);
  }
  return new Promise<boolean>((resolve) => {
    queue = [...queue, { ...options, kind: "confirm", id: nextId++, resolve }];
    emit();
  });
}

/** Asks for a short text (e.g. a return reason); resolves the trimmed text or null if cancelled. */
export function promptDialog(options: PromptOptions): Promise<string | null> {
  if (hostCount === 0) {
    console.error("promptDialog called without <ConfirmHost />:", options.title);
    return Promise.resolve(null);
  }
  return new Promise<string | null>((resolve) => {
    queue = [...queue, { ...options, kind: "prompt", id: nextId++, resolve }];
    emit();
  });
}

export function useConfirm() {
  return confirmDialog;
}

function normalizePhrase(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleUpperCase();
}

function ConfirmDialogView({ request }: { request: Request }) {
  const { t } = useI18n();
  const titleId = useId();
  const messageId = useId();
  const inputId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState("");
  const cancel = useCallback(() => settle(request.id, null), [request.id]);
  useFocusTrap(true, sheetRef, cancel);
  const isPrompt = request.kind === "prompt";
  const requireText = request.kind === "confirm" ? request.requireText : undefined;
  const accepted =
    request.kind === "confirm"
      ? [request.requireText, ...(request.requireTextAlternatives ?? [])]
          .filter((value): value is string => Boolean(value))
          // The phrase is shown in the current locale, so its translation is accepted too.
          .flatMap((value) => [value, t(value)])
          .map(normalizePhrase)
      : [];
  const blocked = isPrompt
    ? typed.trim().length < (request.minLength ?? 1)
    : accepted.length > 0 && !accepted.includes(normalizePhrase(typed));
  const danger = request.tone === "danger";
  return (
    <div
      className="modal-backdrop confirm-backdrop"
      style={{ zIndex: 1000 }}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) cancel();
      }}
    >
      <div
        ref={sheetRef}
        className="modal-sheet confirm-sheet"
        style={{ width: "min(480px, 100%)" }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!blocked) settle(request.id, isPrompt ? typed.trim() : true);
          }}
        >
          <div className="modal-header">
            <div>
              <p className="section-kicker">{danger ? t("DIQQAT") : t("TASDIQLASH")}</p>
              <h2 id={titleId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {danger ? <AlertTriangle size={19} aria-hidden="true" /> : <HelpCircle size={19} aria-hidden="true" />}
                {t(request.title)}
              </h2>
            </div>
          </div>
          <div className="modal-body">
            <p id={messageId} style={{ margin: 0, whiteSpace: "pre-line", lineHeight: 1.55 }}>
              {t(request.message)}
            </p>
            {requireText ? (
              <label htmlFor={inputId} style={{ display: "grid", gap: 6, marginTop: 14 }}>
                <span>
                  {t("Tasdiqlash uchun")} <strong>{t(requireText)}</strong> {t("deb yozing")}
                </span>
                <input
                  id={inputId}
                  data-dialog-initial-focus
                  value={typed}
                  onChange={(event) => setTyped(event.target.value)}
                  autoComplete="off"
                />
              </label>
            ) : null}
            {request.kind === "prompt" ? (
              <label htmlFor={inputId} style={{ display: "grid", gap: 6, marginTop: 14 }}>
                <span>{t(request.inputLabel)}</span>
                <textarea
                  id={inputId}
                  data-dialog-initial-focus
                  rows={3}
                  value={typed}
                  maxLength={request.maxLength ?? 1000}
                  placeholder={request.placeholder ? t(request.placeholder) : undefined}
                  onChange={(event) => setTyped(event.target.value)}
                  required={(request.minLength ?? 1) > 0}
                />
              </label>
            ) : null}
          </div>
          <div className="modal-footer">
            <span />
            <div>
              <button
                type="button"
                className="secondary-button"
                onClick={cancel}
                data-dialog-initial-focus={requireText || isPrompt ? undefined : true}
              >
                {t(request.cancelLabel ?? "Bekor qilish")}
              </button>
              <button type="submit" className={danger ? "danger-button" : "primary-button"} disabled={blocked}>
                {t(request.confirmLabel ?? "Tasdiqlash")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Mount once near the app root (inside the alphabet-rendered container). */
export function ConfirmHost() {
  const request = useSyncExternalStore(subscribe, current, () => null);
  useEffect(() => {
    hostCount += 1;
    return () => {
      hostCount -= 1;
      // Unmounted shell (e.g. logout): pending questions are answered "no".
      if (hostCount === 0) cancelAll();
    };
  }, []);
  return request ? <ConfirmDialogView key={request.id} request={request} /> : null;
}
