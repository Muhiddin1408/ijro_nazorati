"use client";

import "./styles/admin.css";
/**
 * Staff directory and administrator pages extracted from dashboard.tsx.
 * Credential provisioning helpers stay in the shell and are passed in as props.
 */

import {
  Check,
  CircleAlert,
  KeyRound,
  Link2,
  LockKeyhole,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Target,
  Wifi,
  WifiOff,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { NotificationPrefsPanel } from "./notification-prefs";
import { PageIntro, readJson } from "./dashboard-kit";
import { avatarColor, initials } from "./ui-helpers";
import { useI18n } from "../lib/i18n";
import type { AdminEmployee, AdminActor, TelegramStatus } from "./_components/admin/admin-types";
export {
  IntegrationsPage,
  DepartmentsPage,
  OrganizationsPage,
  TopicsPage,
} from "./_components/admin/organization-pages";
export { InformationAccessManager, RolesPage } from "./_components/admin/roles-page";
export { EmployeesPage } from "./_components/admin/employees-page";
export { StaffOccupancyCell, StaffDirectoryPage } from "./_components/admin/staff-directory-page";
export type {
  AdminOrganization,
  AdminDepartment,
  AdminEmployee,
  AdminRole,
  AdminTopic,
  AdminIntegration,
  AdminActor,
  TelegramStatus,
  ProvisioningRequest,
  ProvisioningResult,
  RequestProvisioning,
  DownloadProvisioningWorkbook,
} from "./_components/admin/admin-types";

export function KpiPage() {
  const { t } = useI18n();
  return (
    <section className="module-page">
      <PageIntro
        kicker={t("ERP MODULI")}
        title={t("KPI boshqaruvi")}
        description={t(
          "KPI ssenariysi, hisoblash formulalari va tasdiqlash jarayoni BPR asosida keyingi bosqichda sozlanadi.",
        )}
      />
      <article className="panel future-module">
        <span className="future-module-icon">
          <Target size={30} />
        </span>
        <h3>{t("KPI moduli ochildi")}</h3>
        <p>
          {t(
            "Hozircha ma’lumot kiritish yopiq. Keyingi bosqichda lavozim, bo‘lim va tashkilot kesimidagi ko‘rsatkichlar shu yerda boshqariladi.",
          )}
        </p>
        <span className="connection-badge">{t("BPR kutilmoqda")}</span>
      </article>
    </section>
  );
}

export function SecurityPage({
  actor,
  onSaved,
  notify,
}: {
  actor: AdminActor;
  onSaved: () => Promise<void>;
  notify: (text: string, tone?: "ok" | "error") => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const next = String(form.get("newPassword") ?? "");
    if (next !== String(form.get("confirmPassword") ?? "")) {
      notify(t("Yangi parollar bir xil emas"), "error");
      return;
    }
    try {
      setBusy(true);
      await readJson(
        await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.get("username"),
            currentPassword: form.get("currentPassword"),
            newPassword: next,
          }),
        }),
      );
      formElement.reset();
      await onSaved();
    } catch (error) {
      notify(error instanceof Error ? error.message : t("Parol yangilanmadi"), "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="module-page security-page">
      <PageIntro
        kicker={t("XAVFSIZLIK")}
        title={t("Kirish xavfsizligi")}
        description={t("Shaxsiy login va parolingizni boshqaring. Parol hech qachon ochiq ko‘rinishda saqlanmaydi.")}
      />
      <div className="security-layout">
        <article className="panel security-summary">
          <span className="security-hero">
            <LockKeyhole size={26} />
          </span>
          <h3>
            {actor.username ? (
              <span data-alphabet-static="true">@{actor.username}</span>
            ) : (
              t("Login hali belgilanmagan")
            )}
          </h3>
          <p>
            {actor.username
              ? t("Oddiy login va parol orqali kirish faol.")
              : t("Shaxsiy login-parolni bir marta yarating.")}
          </p>
          <div>
            <ShieldCheck size={17} />
            <span>
              <strong>{t("Himoyalangan sessiya")}</strong>
              <small>{t("HttpOnly cookie va avtomatik muddat tugashi")}</small>
            </span>
          </div>
          <div>
            <KeyRound size={17} />
            <span>
              <strong>{t("Kuchli xesh")}</strong>
              <small>{t("PBKDF2-SHA256, {n} iteratsiya", { n: "600 000" })}</small>
            </span>
          </div>
        </article>
        <form className="panel password-form" onSubmit={submit}>
          <h3>{actor.username ? t("Parolni yangilash") : t("Login va parol yaratish")}</h3>
          {!actor.username ? (
            <label>
              <span>{t("Yangi login")} *</span>
              <input
                name="username"
                required
                minLength={4}
                maxLength={32}
                pattern="[A-Za-z][A-Za-z0-9._-]{3,31}"
                placeholder={t("masalan: {login}", { login: "a.karimov" })}
                autoCapitalize="none"
              />
            </label>
          ) : null}
          {actor.username ? (
            <label>
              <span>{t("Joriy parol")} *</span>
              <input type="password" name="currentPassword" required autoComplete="current-password" />
            </label>
          ) : null}
          <label>
            <span>{t("Yangi parol")} *</span>
            <input
              type="password"
              name="newPassword"
              required
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
            />
          </label>
          <label>
            <span>{t("Yangi parolni takrorlang")} *</span>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
            />
          </label>
          <div className="password-rules">
            <Check size={14} /> {t("Kamida 10 belgi, harf va raqam ishlating")}
          </div>
          <button className="primary-button" disabled={busy}>
            <Save size={17} />
            {busy ? t("Saqlanmoqda...") : actor.username ? t("Parolni yangilash") : t("Kirish ma’lumotlarini yaratish")}
          </button>
        </form>
      </div>
      <NotificationPrefsPanel
        apiPath="/api/telegram/preferences"
        onSaved={() => notify(t("Bildirishnoma sozlamalari saqlandi"))}
      />
    </section>
  );
}

export function TelegramPage({
  status,
  employees,
  onActivate,
  onProcess,
  onLink,
}: {
  status: TelegramStatus;
  employees: AdminEmployee[];
  onActivate: () => void;
  onProcess: () => void;
  onLink: (employee: AdminEmployee) => void;
}) {
  const { t, tx } = useI18n();
  return (
    <section className="module-page settings-page">
      <PageIntro
        kicker={t("INTEGRATSIYA")}
        title={t("Telegram bot boshqaruvi")}
        description={t(
          "Bot xodimlarni bir martalik xavfsiz havola bilan ulaydi, shaxsiy topshiriq va yig‘ilish eslatmalarini yuboradi.",
        )}
        actions={
          <span className={`connection-badge ${status.configured ? "connected" : ""}`}>
            {status.configured ? <Wifi size={15} /> : <WifiOff size={15} />}
            {status.configured ? t("Server sozlangan") : t("Token talab etiladi")}
          </span>
        }
      />
      <div className="settings-grid">
        <article className="panel telegram-setup">
          <div className="setup-hero">
            <span className="telegram-large">
              <Send size={25} />
            </span>
            <div>
              <h3>{t("Ichki hisobotlarni boshqarish Telegram boti")}</h3>
              <p>
                {t("{commands} buyruqlari va tugmalar orqali ijro holatini yangilash mavjud.", {
                  commands: "/vazifalar, /bugun, /kechikkan, /yigilishlar",
                })}
              </p>
            </div>
          </div>
          <div className="telegram-kpis">
            <div>
              <strong>{status.linkedEmployees}</strong>
              <span>{t("ulangan xodim")}</span>
            </div>
            <div>
              <strong>{status.pendingJobs}</strong>
              <span>{t("navbatdagi xabar")}</span>
            </div>
          </div>
          <div className="secure-note">
            <ShieldCheck size={18} />
            <div>
              <strong>{t("Token brauzerga chiqmaydi")}</strong>
              <span>
                {t("{token} va webhook siri faqat serverning maxfiy muhitida saqlanadi.", {
                  token: "TELEGRAM_BOT_TOKEN",
                })}
              </span>
            </div>
          </div>
          <div className="module-actions">
            <button className="primary-button" disabled={!status.configured} onClick={onActivate}>
              <Wifi size={17} /> {t("Webhookni faollashtirish")}
            </button>
            <button className="secondary-button" disabled={!status.configured} onClick={onProcess}>
              <RefreshCw size={17} /> {t("Navbatni ishlash")}
            </button>
          </div>
          {!status.configured ? (
            <div className="warning-note">
              <CircleAlert size={17} />
              <span>{t("BotFather tokeni hali kiritilmagan. Token sozlangach ushbu tugma faol bo‘ladi.")}</span>
            </div>
          ) : null}
        </article>
        <article className="panel notification-rules">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">{t("XODIMLAR")}</p>
              <h2>{t("Ulanish holati")}</h2>
            </div>
          </div>
          <div className="telegram-employee-list">
            {employees
              .filter((employee) => employee.active)
              .map((employee) => (
                <button key={employee.id} onClick={() => onLink(employee)}>
                  <span className={`person-avatar ${avatarColor(employee.id)}`}>{initials(employee.name)}</span>
                  <span>
                    <strong>{tx(employee.name)}</strong>
                    <small>
                      {employee.telegramLinked ? (
                        employee.telegramUsername ? (
                          <span data-alphabet-static="true">@{employee.telegramUsername}</span>
                        ) : (
                          t("Ulangan")
                        )
                      ) : (
                        t("Ulanmagan")
                      )}
                    </small>
                  </span>
                  <em className={employee.telegramLinked ? "online" : ""}>
                    {employee.telegramLinked ? <Wifi size={13} /> : <Link2 size={13} />}
                  </em>
                </button>
              ))}
          </div>
        </article>
      </div>
    </section>
  );
}
