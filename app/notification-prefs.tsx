"use client";

import { Bell, BellOff, Clock3, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { readJson } from "../lib/shared/http";
import { useI18n } from "../lib/i18n";

/**
 * Notification preferences UI.
 * Backed by GET/PATCH /api/telegram/preferences
 * → app_telegram_accounts.notifications_enabled + quiet hours (Asia/Tashkent).
 */

export type NotificationPrefsValue = {
  notificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  telegramLinked: boolean;
};

const DEFAULT_PREFS: NotificationPrefsValue = {
  notificationsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  telegramLinked: false,
};

type Props = {
  initial?: Partial<NotificationPrefsValue>;
  apiPath?: string;
  onSaved?: (value: NotificationPrefsValue) => void;
  className?: string;
};

export function NotificationPrefsPanel({ initial, apiPath, onSaved, className }: Props) {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState<NotificationPrefsValue>({
    ...DEFAULT_PREFS,
    ...initial,
  });
  const [hydrated, setHydrated] = useState(!apiPath);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiPath) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(apiPath, { cache: "no-store" });
        const data = await readJson<Partial<NotificationPrefsValue>>(response, "Sozlamalarni yuklab bo‘lmadi");
        if (cancelled) return;
        setPrefs((prev) => ({
          ...prev,
          notificationsEnabled:
            typeof data.notificationsEnabled === "boolean" ? data.notificationsEnabled : prev.notificationsEnabled,
          telegramLinked: typeof data.telegramLinked === "boolean" ? data.telegramLinked : prev.telegramLinked,
          quietHoursEnabled:
            typeof data.quietHoursEnabled === "boolean" ? data.quietHoursEnabled : prev.quietHoursEnabled,
          quietHoursStart: typeof data.quietHoursStart === "string" ? data.quietHoursStart : prev.quietHoursStart,
          quietHoursEnd: typeof data.quietHoursEnd === "string" ? data.quietHoursEnd : prev.quietHoursEnd,
        }));
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Sozlamalarni yuklab bo‘lmadi");
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiPath]);

  const update = useCallback(<K extends keyof NotificationPrefsValue>(key: K, value: NotificationPrefsValue[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
    setError(null);
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      if (apiPath) {
        const response = await fetch(apiPath, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationsEnabled: prefs.notificationsEnabled,
            quietHoursEnabled: prefs.quietHoursEnabled,
            quietHoursStart: prefs.quietHoursStart,
            quietHoursEnd: prefs.quietHoursEnd,
          }),
        });
        const data = await readJson<Partial<NotificationPrefsValue>>(response, "Sozlamalarni saqlab bo‘lmadi");
        if (typeof data.telegramLinked === "boolean") {
          setPrefs((prev) => ({ ...prev, telegramLinked: data.telegramLinked! }));
        }
      }
      setMessage(apiPath ? "Sozlamalar saqlandi" : "Mahalliy saqlandi (API ulanmagan)");
      onSaved?.(prefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlashda xato");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={className ?? "notification-prefs-panel"}>
      <header className="notification-prefs-header">
        <div>
          <strong>{t("Bildirishnoma sozlamalari")}</strong>
          <p className="section-kicker">{t("Telegram va tizim eslatmalari")}</p>
        </div>
        {prefs.notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
      </header>

      {hydrated ? null : <p className="notification-prefs-hint">{t("Sozlamalar yuklanmoqda…")}</p>}

      {hydrated && !prefs.telegramLinked ? (
        <p className="notification-prefs-hint">
          {t("Telegram hisobi ulanmagan. Avval bot orqali hisobni ulang, so‘ng bildirishnomalarni boshqaring.")}
        </p>
      ) : null}

      <label className="notification-prefs-row">
        <span>
          <strong>{t("Telegram bildirishnomalari")}</strong>
          <small>{t("Topshiriq, yig‘ilish va eslatmalar")}</small>
        </span>
        <input
          type="checkbox"
          checked={prefs.notificationsEnabled}
          onChange={(event) => update("notificationsEnabled", event.target.checked)}
          disabled={!hydrated || (!prefs.telegramLinked && Boolean(apiPath))}
        />
      </label>

      <label className="notification-prefs-row">
        <span>
          <strong>{t("Tinch soatlar")}</strong>
          <small>{t("Bu oralikda avtomatik Telegram xabar yuborilmaydi (Toshkent vaqti)")}</small>
        </span>
        <input
          type="checkbox"
          checked={prefs.quietHoursEnabled}
          onChange={(event) => update("quietHoursEnabled", event.target.checked)}
          disabled={!hydrated}
        />
      </label>

      {prefs.quietHoursEnabled ? (
        <div className="notification-prefs-hours">
          <label>
            <Clock3 size={14} />
            <span>{t("Boshlanish")}</span>
            <input
              type="time"
              value={prefs.quietHoursStart}
              onChange={(event) => update("quietHoursStart", event.target.value)}
              disabled={!hydrated}
            />
          </label>
          <label>
            <Clock3 size={14} />
            <span>{t("Tugash")}</span>
            <input
              type="time"
              value={prefs.quietHoursEnd}
              onChange={(event) => update("quietHoursEnd", event.target.value)}
              disabled={!hydrated}
            />
          </label>
        </div>
      ) : null}

      <div className="notification-prefs-actions">
        <button type="button" className="secondary-button" onClick={save} disabled={saving || !hydrated}>
          <Save size={16} />
          <span>{saving ? t("Saqlanmoqda…") : t("Saqlash")}</span>
        </button>
        {message ? <small className="notification-prefs-ok">{t(message)}</small> : null}
        {error ? <small className="notification-prefs-error">{t(error)}</small> : null}
      </div>
    </section>
  );
}

export default NotificationPrefsPanel;
