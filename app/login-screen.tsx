"use client";

import {
  Check,
  CheckCircle2,
  CircleAlert,
  KeyRound,
  LockKeyhole,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { captureActivationLocation } from "../lib/activation-url";
import { readJson } from "./dashboard-kit";
import { ThemeModeToggle } from "./theme-mode-toggle";
import { BrandMark } from "./ui-helpers";
import { useI18n, type Locale } from "../lib/i18n";
import { LocaleSwitch } from "./_components/dashboard/locale-switch";

export function LoginScreen({
  busy,
  error,
  alphabet,
  onAlphabet,
  onLogin,
}: {
  busy: boolean;
  error: string;
  alphabet: Locale;
  onAlphabet: (locale: Locale) => void;
  onLogin: (username: string, password: string, remember: boolean) => Promise<void>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [activationToken, setActivationToken] = useState("");
  const [activationError, setActivationError] = useState("");
  const [activationBusy, setActivationBusy] = useState(false);
  const [activatedName, setActivatedName] = useState("");
  const capturedActivationToken = useRef<string | null>(null);
  const { t, tx } = useI18n();
  useEffect(() => {
    const capture = captureActivationLocation(window.location.href, capturedActivationToken.current);
    capturedActivationToken.current = capture.token;
    if (capture.sanitizedUrl !== null) window.history.replaceState(window.history.state, "", capture.sanitizedUrl);
    const timer = window.setTimeout(() => setActivationToken(capture.token), 0);
    return () => window.clearTimeout(timer);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await onLogin(
      String(form.get("username") ?? ""),
      String(form.get("password") ?? ""),
      form.get("remember") === "on",
    );
  }
  async function activate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activationBusy) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirmPassword") ?? "")) {
      setActivationError("Parollar bir xil emas");
      return;
    }
    try {
      setActivationBusy(true);
      const result = await readJson<{ name: string }>(
        await fetch("/api/auth/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: activationToken, username: form.get("username"), password }),
        }),
      );
      setActivatedName(result.name);
      setActivationError("");
    } catch (activationFailure) {
      setActivationError(activationFailure instanceof Error ? activationFailure.message : "Akkaunt faollashtirilmadi");
    } finally {
      setActivationBusy(false);
    }
  }
  if (activationToken) {
    return (
      <main className="login-screen">
        <section className="login-brand-panel">
          <div className="login-brand">
            <BrandMark />
            <span>
              <strong>{t("ICHKI HISOBOTLARNI BOSHQARISH TIZIMI")}</strong>
              <small>{t("Xavfsiz akkaunt faollashtirish")}</small>
            </span>
          </div>
          <div className="login-message">
            <span className="login-shield">
              <ShieldCheck size={28} />
            </span>
            <h1>{t("Shaxsiy kirish ma’lumotlaringizni o‘zingiz belgilang")}</h1>
            <p>{t("Bir martalik havola 72 soat amal qiladi va muvaffaqiyatli faollashtirilgach qayta ishlamaydi.")}</p>
          </div>
        </section>
        <section className="login-form-panel">
          {activatedName ? (
            <div className="login-card activation-success">
              <span className="metric-icon green">
                <CheckCircle2 size={23} />
              </span>
              <h2>{t("Akkaunt faollashtirildi")}</h2>
              <p>{tx(activatedName)}</p>
              <button className="primary-button login-submit" onClick={() => setActivationToken("")}>
                <LogOut size={18} />
                {t("Tizimga kirish")}
              </button>
            </div>
          ) : (
            <form className="login-card" onSubmit={activate}>
              <LocaleSwitch className="topbar-alphabet login-alphabet" locale={alphabet} onChange={onAlphabet} />
              <div className="login-card-heading">
                <span className="metric-icon blue">
                  <KeyRound size={23} />
                </span>
                <h2>{t("Akkauntni faollashtirish")}</h2>
                <p>{t("Login va faqat siz biladigan kuchli parol yarating.")}</p>
              </div>
              {activationError ? (
                <div className="login-error">
                  <CircleAlert size={17} />
                  <span>{t(activationError)}</span>
                </div>
              ) : null}
              <label>
                <span>{t("Yangi login")}</span>
                <div className="login-input">
                  <UserCog size={18} />
                  <input
                    name="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    required
                    minLength={4}
                    maxLength={32}
                  />
                </div>
              </label>
              <label>
                <span>{t("Yangi parol")}</span>
                <div className="login-input">
                  <KeyRound size={18} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={10}
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? t("Yashirish") : t("Ko‘rsatish")}
                  </button>
                </div>
              </label>
              <label>
                <span>{t("Parolni takrorlang")}</span>
                <div className="login-input">
                  <ShieldCheck size={18} />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={10}
                  />
                </div>
              </label>
              <button className="primary-button login-submit" disabled={activationBusy}>
                {activationBusy ? <RefreshCw className="spin" size={18} /> : <ShieldCheck size={18} />}
                {activationBusy ? t("Faollashtirilmoqda...") : t("Akkauntni faollashtirish")}
              </button>
            </form>
          )}
        </section>
      </main>
    );
  }
  return (
    <main className="login-screen">
      <section className="login-brand-panel">
        <div className="login-brand">
          <BrandMark />
          <span>
            <strong>{t("ICHKI HISOBOTLARNI BOSHQARISH TIZIMI")}</strong>
            <small>{t("Rahbariyat va xodimlar uchun yagona ish maydoni")}</small>
          </span>
        </div>
        <div className="login-message">
          <span className="login-shield">
            <ShieldCheck size={28} />
          </span>
          <h1>{t("Ichki hisobot, topshiriq va hujjatlar — bir tizimda")}</h1>
          <p>
            {t(
              "Ichki hisobotlar, ierarxik topshiriqlar, Telegram eslatmalari, korporativ muloqot va elektron fayl almashinuvi.",
            )}
          </p>
          <ul>
            <li>
              <Check size={17} />
              {t("Shaxsiy login va xavfsiz parol")}
            </li>
            <li>
              <Check size={17} />
              {t("Mobil qurilmalarga mos interfeys")}
            </li>
            <li>
              <Check size={17} />
              {t("Rol va vakolat bo‘yicha himoya")}
            </li>
          </ul>
        </div>
        <small className="login-copyright">
          {t("ICHKI HISOBOTLARNI BOSHQARISH")} · {t("XIZMAT TIZIMI")}
        </small>
      </section>
      <section className="login-form-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="login-toolbar">
            <LocaleSwitch className="topbar-alphabet login-alphabet" locale={alphabet} onChange={onAlphabet} />
            <ThemeModeToggle />
          </div>
          <div className="login-card-heading">
            <span className="metric-icon blue">
              <LockKeyhole size={23} />
            </span>
            <h2>{t("Tizimga kirish")}</h2>
            <p>{t("Administrator bergan login va parolni kiriting.")}</p>
          </div>
          {error ? (
            <div className="login-error">
              <CircleAlert size={17} />
              <span>{t(error)}</span>
            </div>
          ) : null}
          <label>
            <span>{t("Login")}</span>
            <div className="login-input">
              <UserCog size={18} />
              <input
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                placeholder={t("Loginni kiriting")}
              />
            </div>
          </label>
          <label>
            <span>{t("Parol")}</span>
            <div className="login-input">
              <KeyRound size={18} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder={t("Parolni kiriting")}
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? t("Yashirish") : t("Ko‘rsatish")}
              </button>
            </div>
          </label>
          <label className="remember-row">
            <input type="checkbox" name="remember" />
            <span>{t("Ushbu qurilmada 30 kun eslab qolish")}</span>
          </label>
          <button className="primary-button login-submit" disabled={busy}>
            {busy ? <RefreshCw className="spin" size={18} /> : <LogOut size={18} />}
            {busy ? t("Kirilmoqda...") : t("Kirish")}
          </button>
          <small className="security-caption">{t("Parol serverda ochiq ko‘rinishda saqlanmaydi.")}</small>
        </form>
      </section>
    </main>
  );
}
