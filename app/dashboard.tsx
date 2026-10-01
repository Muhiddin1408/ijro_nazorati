"use client";

import {
  Bell,
  CalendarDays,
  Check,
  CircleAlert,
  RefreshCw,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { RoadLoader } from "./road-loader";
import { ThemeModeToggle } from "./theme-mode-toggle";
import {
  BrandMark,
  colorThemes,
  formatFullDate,
  initials,
  localDateKey,
  searchMatches,
  ThemePicker,
  type ColorTheme,
} from "./ui-helpers";
import {
  I18nProvider,
  LOCALE_COOKIE,
  localeLang,
  setCurrentLocale,
  translate,
  transliterateData,
  type Locale,
  type TranslateParams,
} from "../lib/i18n";
import { LocaleSwitch, parseStoredLocale } from "./_components/dashboard/locale-switch";
import { readJson } from "./dashboard-kit";
import { SessionExpiredError } from "../lib/shared/http";
import { readStored, writeStored } from "./_components/dashboard/storage";
import { LoginScreen } from "./login-screen";
import { exportExcel } from "./task-meeting-export";
import { SecurityPage } from "./admin-pages";
import type {
  Identity,
  Task,
  Bootstrap,
  BootstrapPayload,
  EmployeeDirectory,
  OrgStructure,
  TaskListScope,
  ModalState,
} from "./_components/dashboard/dashboard-types";
import { ConfirmHost } from "./_components/ui/confirm-dialog";
import { DashboardProvider } from "./_components/dashboard/dashboard-context";
import { conditionalCache, conditionalJson, requestBootstrap } from "./_components/dashboard/bootstrap-client";
import { DashboardModals } from "./_components/dashboard/dashboard-modals";
import { DashboardPages, type InformationRequest } from "./_components/dashboard/dashboard-pages";
import { BirthdayGreeting, birthdaySeenKey } from "./_components/dashboard/birthday";
import {
  ADMIN_SECTION_START,
  buildNavItems,
  EMPLOYEE_MODALS,
  EMPLOYEE_PAGES,
  NAV_LABELS,
  STRUCTURE_MODALS,
  STRUCTURE_PAGES,
  TASK_CREATE_PAGES,
  TASK_SEARCH_PAGES,
  type NavKey,
} from "./_components/dashboard/navigation";

const AUDIT_SEEN_KEY = "ijro-audit-seen-at";

const noopSubscribe = () => () => {};

function writeLocaleCookie(value: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    // Cookies may be blocked; localStorage still keeps the preference.
  }
}

export default function Dashboard({
  identity,
  initialSession = "unknown",
  initialData = null,
  initialEtag = null,
  initialLocale,
}: {
  identity: Identity | null;
  /** Resolved on the server by app/page.tsx: "unknown" falls back to the client fetch. */
  initialSession?: "ok" | "anonymous" | "unknown";
  initialData?: BootstrapPayload | null;
  initialEtag?: string | null;
  initialLocale?: Locale;
}) {
  void identity;
  const [data, setData] = useState<BootstrapPayload | null>(initialData);
  const [loading, setLoading] = useState(initialSession === "unknown");
  // Server-provided data skips the first /api/bootstrap request.
  const skipInitialFetch = useRef(initialSession !== "unknown");
  // The dashboard itself renders after hydration (dates/time zones differ between
  // server and browser); the data is already here, so no request is waited on.
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [loadError, setLoadError] = useState("");
  const [activeNav, setActiveNav] = useState<NavKey>("home");
  const [search, setSearch] = useState("");
  const [informationRequest, setInformationRequest] = useState<InformationRequest>(null);
  const [searchOpened, setSearchOpened] = useState(false);
  const [taskFilter, setTaskFilter] = useState("Barchasi");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<{
    tone: "ok" | "error";
    text: string;
  } | null>(null);
  const [locale, setLocale] = useState<Locale>(initialLocale ?? "lotin");
  // Existing components still receive the locale through their `alphabet` prop.
  const alphabet = locale;
  // Non-React helpers (dates, exports, dialogs) read the same locale synchronously.
  setCurrentLocale(locale);
  const { t, tx } = useMemo(
    () => ({
      t: (text: string, params?: TranslateParams) => translate(locale, text, params),
      tx: (value: string | null | undefined) => transliterateData(locale, value),
    }),
    [locale],
  );
  const [colorTheme, setColorTheme] = useState<ColorTheme>("blue");
  const [authBusy, setAuthBusy] = useState(false);
  const [taskListScope, setTaskListScope] = useState<TaskListScope>("current");
  const [tasksLoadingMore, setTasksLoadingMore] = useState(false);
  const [directoryState, setDirectoryState] = useState<(EmployeeDirectory & { actorId: number }) | null>(null);
  const [structureState, setStructureState] = useState<(OrgStructure & { actorId: number }) | null>(null);
  const structureRequest = useRef<{ actorId: number; promise: Promise<void> } | null>(null);
  const [auditSeenAt, setAuditSeenAt] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const directoryRequest = useRef<{ actorId: number; promise: Promise<void> } | null>(null);
  // A ref, not state: the refresh effect must not re-run (and re-fetch) on every refresh.
  const lastBootstrapAt = useRef(0);
  // What the task list currently shows, so a refresh keeps the user's scope and loaded pages.
  const taskListView = useRef<{ scope: TaskListScope; loaded: number }>({
    scope: "current",
    loaded: initialData?.tasks.length ?? 0,
  });
  const actorId = data?.actor.id;
  // A different account never sees the previous account's directory.
  const directory = directoryState && directoryState.actorId === actorId ? directoryState : null;
  const structure = structureState && structureState.actorId === actorId ? structureState : null;
  // Pages and dialogs receive one object; the structure part stays empty until loaded.
  const view = useMemo<Bootstrap | null>(
    () =>
      data
        ? { ...data, departments: structure?.departments ?? [], organizations: structure?.organizations ?? [] }
        : null,
    [data, structure],
  );
  const assignableEmployeeIds = directory?.assignableEmployeeIds;
  const allEmployees = directory?.employees;
  const employees = useMemo(() => allEmployees ?? [], [allEmployees]);
  const assignableEmployeeSet = useMemo(() => new Set(assignableEmployeeIds ?? []), [assignableEmployeeIds]);
  const assignableEmployees = useMemo(
    () => (allEmployees ?? []).filter((employee) => assignableEmployeeSet.has(employee.id) && employee.active),
    [allEmployees, assignableEmployeeSet],
  );
  // Legacy DOM renderer: only Cyrillic, until every screen renders through t()/tx().

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // The cookie (read by the server) wins; localStorage covers older sessions.
      const saved = initialLocale ?? parseStoredLocale(readStored("ijro-alphabet"));
      if (saved) {
        setLocale(saved);
        writeLocaleCookie(saved);
      }
      const savedTheme = readStored("internal-reports-color-theme");
      if (colorThemes.some((theme) => theme.id === savedTheme)) setColorTheme(savedTheme as ColorTheme);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.colorTheme = colorTheme;
    return () => {
      delete document.documentElement.dataset.colorTheme;
    };
  }, [colorTheme]);

  useEffect(() => {
    setCurrentLocale(locale);
    document.documentElement.lang = localeLang(locale);
  }, [locale]);

  function chooseAlphabet(value: Locale) {
    setCurrentLocale(value);
    setLocale(value);
    writeStored("ijro-alphabet", value);
    writeLocaleCookie(value);
  }

  function chooseColorTheme(value: ColorTheme) {
    setColorTheme(value);
    writeStored("internal-reports-color-theme", value);
  }

  // The employee directory is fetched only when a screen needs it, then kept
  // current on each refresh (a 304 when nothing changed).
  const loadDirectory = useCallback((forActorId: number, revalidate = false): Promise<void> => {
    const current = directoryRequest.current;
    if (current && current.actorId === forActorId && !revalidate) return current.promise;
    if (!current || current.actorId !== forActorId) conditionalCache.delete("/api/bootstrap/employees");
    const promise = conditionalJson<EmployeeDirectory>("/api/bootstrap/employees")
      .then((next) => setDirectoryState({ ...next, actorId: forActorId }))
      .catch(() => {
        if (directoryRequest.current?.promise === promise) directoryRequest.current = null;
      });
    if (!current || current.actorId !== forActorId) directoryRequest.current = { actorId: forActorId, promise };
    return promise;
  }, []);

  // Organizations/departments (~270 KB) follow the same on-demand pattern.
  const loadStructure = useCallback((forActorId: number, revalidate = false): Promise<void> => {
    const current = structureRequest.current;
    if (current && current.actorId === forActorId && !revalidate) return current.promise;
    if (!current || current.actorId !== forActorId) conditionalCache.delete("/api/bootstrap/structure");
    const promise = conditionalJson<OrgStructure>("/api/bootstrap/structure")
      .then((next) => setStructureState({ ...next, actorId: forActorId }))
      .catch(() => {
        if (structureRequest.current?.promise === promise) structureRequest.current = null;
      });
    if (!current || current.actorId !== forActorId) structureRequest.current = { actorId: forActorId, promise };
    return promise;
  }, []);

  const expireSession = useCallback((message: string) => {
    conditionalCache.clear();
    directoryRequest.current = null;
    structureRequest.current = null;
    setStructureState(null);
    taskListView.current = { scope: "current", loaded: 0 };
    setDirectoryState(null);
    setModal(null);
    setData(null);
    setLoadError(message);
  }, []);

  const refresh = useCallback(
    async (forceFresh = true): Promise<void> => {
      try {
        let payload = await requestBootstrap(forceFresh);
        const view = taskListView.current;
        // Bootstrap carries the first "current" page; reload what the user had open instead.
        if (view.scope !== "current" || view.loaded > payload.tasks.length) {
          const limit = Math.min(200, Math.max(view.loaded, payload.tasks.length));
          const page = await readJson<{ tasks: Task[]; hasMore: boolean; nextCursor: string | null }>(
            await fetch(`/api/tasks?scope=${view.scope}&limit=${limit}`, { cache: "no-store" }),
          );
          payload = {
            ...payload,
            tasks: page.tasks,
            lists: {
              ...(payload.lists ?? { meetingsHasMore: false }),
              tasksHasMore: page.hasMore,
              tasksNextCursor: page.nextCursor,
            },
          };
        }
        taskListView.current = { scope: view.scope, loaded: payload.tasks.length };
        setData(payload);
        setRefreshTick((tick) => tick + 1);
        setTaskListScope(view.scope);
        setLoadError("");
        lastBootstrapAt.current = Date.now();
      } catch (error) {
        if (error instanceof SessionExpiredError) {
          expireSession(error.message);
          return;
        }
        setLoadError(error instanceof Error ? error.message : "Tizim ma’lumotlarini yuklab bo‘lmadi");
      } finally {
        setLoading(false);
      }
    },
    [expireSession],
  );

  // After each refresh, revalidate the directory if a screen already loaded it.
  useEffect(() => {
    if (!refreshTick || actorId == null || directoryRequest.current?.actorId !== actorId) return;
    void loadDirectory(actorId, true);
  }, [actorId, loadDirectory, refreshTick]);

  useEffect(() => {
    if (!refreshTick || actorId == null || structureRequest.current?.actorId !== actorId) return;
    void loadStructure(actorId, true);
  }, [actorId, loadStructure, refreshTick]);

  useEffect(() => {
    if (skipInitialFetch.current && initialData && initialEtag && !conditionalCache.has("/api/bootstrap")) {
      // Later refreshes send If-None-Match and get a 304 while nothing changed.
      conditionalCache.set("/api/bootstrap", { etag: initialEtag, payload: initialData });
    }
    const timer = window.setTimeout(() => {
      if (skipInitialFetch.current) {
        skipInitialFetch.current = false;
        lastBootstrapAt.current = Date.now();
        return;
      }
      void refresh(false);
    }, 0);
    const interval = window.setInterval(() => {
      if (!document.hidden) void refresh(false);
    }, 300_000);
    const onVisibility = () => {
      if (!document.hidden && Date.now() - lastBootstrapAt.current >= 300_000) void refresh(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [initialData, initialEtag, refresh]);

  const modalType = modal?.type;
  useEffect(() => {
    if (actorId == null) return;
    if (EMPLOYEE_PAGES.has(activeNav) || (modalType && EMPLOYEE_MODALS.has(modalType))) void loadDirectory(actorId);
    if (STRUCTURE_PAGES.has(activeNav) || (modalType && STRUCTURE_MODALS.has(modalType))) void loadStructure(actorId);
  }, [activeNav, actorId, loadDirectory, loadStructure, modalType]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAuditSeenAt(readStored(AUDIT_SEEN_KEY) ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  // The greeting opens once per day: the key is read only after hydration, so the
  // server render and the first client render agree.
  const birthdayKey = actorId != null && data?.birthdays?.mine ? birthdaySeenKey(actorId, data.birthdays.date) : null;
  const [birthdaySeen, setBirthdaySeen] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!birthdayKey) return;
    const timer = window.setTimeout(() => {
      setBirthdaySeen((current) => ({ ...current, [birthdayKey]: readStored(birthdayKey) === "1" }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [birthdayKey]);
  const latestAuditAt = data?.counters?.latestAuditAt ?? null;
  useEffect(() => {
    if (activeNav !== "audit" || !latestAuditAt) return;
    const timer = window.setTimeout(() => {
      setAuditSeenAt(latestAuditAt);
      writeStored(AUDIT_SEEN_KEY, latestAuditAt);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeNav, latestAuditAt]);

  const toastTimer = useRef<number | undefined>(undefined);
  const notify = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    setToast({ text, tone });
    // A new message restarts the timer instead of being closed by the previous one.
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), tone === "error" ? 6000 : 3800);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Logging out only reloads once the server confirmed it; otherwise the user is told.
  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok && response.status !== 401) throw new Error();
      window.location.reload();
    } catch {
      notify("Tizimdan chiqib bo‘lmadi. Aloqani tekshirib, qayta urinib ko‘ring.", "error");
    }
  }, [notify]);

  // The server returns tasks page by page; the first page comes with bootstrap.
  async function loadTasks(scope: TaskListScope, append: boolean) {
    if (!data || tasksLoadingMore) return;
    try {
      setTasksLoadingMore(true);
      // Continue after the last loaded row (keyset cursor); offset is only a fallback.
      const cursor = append ? data.lists?.tasksNextCursor : null;
      const position = !append ? "" : cursor ? `&cursor=${encodeURIComponent(cursor)}` : `&offset=${data.tasks.length}`;
      const page = await readJson<{ tasks: Task[]; hasMore: boolean; nextCursor: string | null }>(
        await fetch(`/api/tasks?scope=${scope}${position}`, { cache: "no-store" }),
      );
      setTaskListScope(scope);
      setData((current) => {
        if (!current) return current;
        const known = new Set(append ? current.tasks.map((task) => task.id) : []);
        const tasks = append ? [...current.tasks, ...page.tasks.filter((task) => !known.has(task.id))] : page.tasks;
        taskListView.current = { scope, loaded: tasks.length };
        return {
          ...current,
          tasks,
          lists: {
            ...(current.lists ?? { meetingsHasMore: false }),
            tasksHasMore: page.hasMore,
            tasksNextCursor: page.nextCursor,
          },
        };
      });
    } catch (error) {
      if (error instanceof SessionExpiredError) return expireSession(error.message);
      notify(error instanceof Error ? error.message : "Topshiriqlarni yuklab bo‘lmadi", "error");
    } finally {
      setTasksLoadingMore(false);
    }
  }

  async function run(action: () => Promise<unknown>, success: string, close = true) {
    try {
      await action();
      if (close) setModal(null);
      await refresh();
      notify(success);
      return true;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        expireSession(error.message);
        return false;
      }
      notify(error instanceof Error ? error.message : "Amal bajarilmadi", "error");
      return false;
    }
  }

  if (loading || (data && !hydrated))
    return (
      <I18nProvider locale={locale}>
        <RoadLoader
          label={t("Tizim va vakolatlar tekshirilmoqda")}
          detail={t("Yo‘l boshqaruvi ish maydoni tayyorlanmoqda…")}
        />
      </I18nProvider>
    );
  if (!data) {
    return (
      <I18nProvider locale={locale}>
        <LoginScreen
          busy={authBusy}
          error={loadError}
          alphabet={alphabet}
          onAlphabet={chooseAlphabet}
          onLogin={async (username, password, remember) => {
            try {
              setAuthBusy(true);
              await readJson(
                await fetch("/api/auth/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ username, password, remember }),
                }),
              );
              setLoadError("");
              setLoading(true);
              await refresh();
            } catch (error) {
              setLoadError(error instanceof Error ? error.message : "Tizimga kirib bo‘lmadi");
            } finally {
              setAuthBusy(false);
            }
          }}
        />
      </I18nProvider>
    );
  }
  const { actor } = data;
  if (actor.mustChangePassword) {
    return (
      <I18nProvider locale={locale}>
        <div className="password-change-gate">
          <header>
            <div className="brand-row">
              <BrandMark />
              <div>
                <strong>{t("Ichki hisobotlarni boshqarish tizimi")}</strong>
                <span>{t("Shaxsiy kirishni himoyalash")}</span>
              </div>
            </div>
            <div className="password-gate-actions">
              <LocaleSwitch locale={locale} onChange={chooseAlphabet} />
              <ThemePicker value={colorTheme} onChange={chooseColorTheme} />
              <ThemeModeToggle />
              <button className="secondary-button" onClick={() => void logout()}>
                <LogOut size={16} /> {t("Chiqish")}
              </button>
            </div>
          </header>
          <main>
            <div className="password-required-note">
              <ShieldCheck size={20} />
              <div>
                <strong>{t("Vaqtinchalik parolni yangilang")}</strong>
                <span>
                  {t(
                    "Administrator bergan parol faqat birinchi kirish uchun. Davom etishdan oldin shaxsiy parolingizni belgilang.",
                  )}
                </span>
              </div>
            </div>
            <SecurityPage
              actor={actor}
              onSaved={async () => {
                await refresh();
                notify("Shaxsiy parol muvaffaqiyatli yangilandi");
              }}
              notify={notify}
            />
          </main>
          {toast ? (
            <div
              className={`toast ${toast.tone === "error" ? "toast-error" : ""}`}
              role={toast.tone === "error" ? "alert" : "status"}
              aria-live={toast.tone === "error" ? "assertive" : "polite"}
            >
              {toast.tone === "ok" ? <Check size={18} /> : <CircleAlert size={18} />}
              {t(toast.text)}
            </div>
          ) : null}
        </div>
      </I18nProvider>
    );
  }
  if (birthdayKey && birthdaySeen[birthdayKey] === false) {
    return (
      <I18nProvider locale={locale}>
        <div className="password-change-gate">
          <header>
            <div className="brand-row">
              <BrandMark />
              <div>
                <strong>{t("Ichki hisobotlarni boshqarish tizimi")}</strong>
                <span>{t("Yagona boshqaruv portali")}</span>
              </div>
            </div>
            <div className="password-gate-actions">
              <LocaleSwitch locale={locale} onChange={chooseAlphabet} />
              <ThemeModeToggle />
            </div>
          </header>
          <BirthdayGreeting
            name={actor.name}
            onContinue={() => {
              writeStored(birthdayKey, "1");
              setBirthdaySeen((current) => ({ ...current, [birthdayKey]: true }));
            }}
          />
        </div>
      </I18nProvider>
    );
  }
  const navItems = buildNavItems(actor, data);
  const visibleTasks = data.tasks.filter((task) => {
    const matchesSearch = searchMatches(search, [
      task.title,
      task.description,
      task.topic?.name,
      task.creator.name,
      ...task.assignments.flatMap((assignment) => [assignment.name, assignment.department, assignment.position]),
      `#${task.id}`,
    ]);
    const matchesFilter =
      taskFilter === "Barchasi" ||
      (taskFilter === "Bugun" && task.deadlineIso && localDateKey(task.deadlineIso) === localDateKey()) ||
      (taskFilter === "Kechikkan" &&
        task.status !== "Bajarildi" &&
        task.deadlineIso &&
        new Date(task.deadlineIso) < new Date()) ||
      (taskFilter === "Davomiy" && task.recurring) ||
      task.status === taskFilter;
    return matchesSearch && matchesFilter;
  });
  const completion = data.tasks.length
    ? Math.round(data.tasks.reduce((sum, task) => sum + task.progress, 0) / data.tasks.length)
    : 0;
  const overdue = data.tasks.filter(
    (task) => task.status !== "Bajarildi" && task.deadlineIso && new Date(task.deadlineIso) < new Date(),
  ).length;
  const reportTasks = data.tasks;
  const reportMeetings = data.meetings;
  async function downloadExcel() {
    try {
      await exportExcel(reportTasks, reportMeetings, alphabet);
      notify("Excel hisoboti chiroyli shaklda tayyorlandi");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Excel hisobotini tayyorlab bo‘lmadi", "error");
    }
  }

  return (
    <I18nProvider locale={locale}>
      <DashboardProvider value={{ actor, alphabet, notify, refresh, run }}>
        <div className="app-shell">
          <ConfirmHost />
          <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
            <div className="brand-row">
              <BrandMark />
              <div>
                <strong>{t("Ichki hisobotlarni boshqarish tizimi")}</strong>
                <span>{t("Yagona boshqaruv portali")}</span>
              </div>
              <button
                className="icon-button sidebar-close"
                onClick={() => setSidebarOpen(false)}
                aria-label={t("Menyuni yopish")}
              >
                <X size={19} />
              </button>
            </div>
            <nav className="main-nav" aria-label={t("Asosiy menyu")}>
              <p className="nav-label">{t("Boshqaruv")}</p>
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const adminStart = navItems.findIndex((nav) => nav.key === ADMIN_SECTION_START);
                return (
                  <div key={item.key}>
                    {index === adminStart ? <p className="nav-label secondary-label">{t("Administrator")}</p> : null}
                    <button
                      className={`nav-item ${activeNav === item.key ? "active" : ""}`}
                      onClick={() => {
                        setActiveNav(item.key);
                        if (item.key === "search") setSearchOpened(true);
                        if (item.key === "information") setInformationRequest(null);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon size={19} />
                      <span>{t(item.label)}</span>
                      {item.count !== undefined ? <em>{item.count}</em> : null}
                    </button>
                  </div>
                );
              })}
            </nav>
            <div className="profile-card">
              <span className="profile-avatar">{initials(actor.name)}</span>
              <span className="profile-copy">
                <strong>{tx(actor.name)}</strong>
                <small data-alphabet-static="true">{actor.username ? `@${actor.username}` : actor.email}</small>
              </span>
              <button className="profile-logout" aria-label={t("Tizimdan chiqish")} onClick={() => void logout()}>
                <LogOut size={17} />
              </button>
            </div>
          </aside>
          {sidebarOpen ? (
            <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label={t("Menyuni yopish")} />
          ) : null}

          <main className={activeNav === "chat" ? "main-content chat-active" : "main-content"}>
            <header className="topbar">
              <div className="greeting-wrap">
                <button
                  className="icon-button menu-button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label={t("Menyuni ochish")}
                >
                  <Menu size={21} />
                </button>
                <div>
                  <p className="eyebrow">
                    {formatFullDate(localDateKey())} · {t(NAV_LABELS[activeNav])}
                  </p>
                  <h1>
                    {activeNav === "home"
                      ? t("Xayrli kun, {name}", { name: tx(actor.name.split(" ")[0]) })
                      : t(NAV_LABELS[activeNav])}
                  </h1>
                </div>
              </div>
              <div className="topbar-actions">
                <LocaleSwitch locale={locale} onChange={chooseAlphabet} />
                <ThemePicker value={colorTheme} onChange={chooseColorTheme} />
                <ThemeModeToggle />
                <button
                  className="secondary-button global-ai-search"
                  onClick={() => {
                    setSearchOpened(true);
                    setActiveNav("search");
                  }}
                  aria-label={t("Barcha boshqarmalar bo‘yicha AI qidiruv")}
                >
                  <Sparkles size={18} />
                  <span>{t("AI qidiruv")}</span>
                </button>
                {TASK_SEARCH_PAGES.has(activeNav) ? (
                  <label className="search-box">
                    <Search size={19} />
                    <input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setTaskFilter("Barchasi");
                      }}
                      placeholder={t("Topshiriq, tematika yoki ijrochini qidirish...")}
                    />
                    {search ? (
                      <button type="button" onClick={() => setSearch("")} aria-label={t("Qidiruvni tozalash")}>
                        <X size={15} />
                      </button>
                    ) : null}
                  </label>
                ) : null}
                {actor.permissions.canViewAudit ? (
                  <button
                    className="icon-button notification-button"
                    onClick={() => setActiveNav("audit")}
                    aria-label={t("Audit jurnalini ochish")}
                  >
                    <Bell size={20} />
                    {latestAuditAt && latestAuditAt > auditSeenAt ? <span /> : null}
                  </button>
                ) : null}
                {activeNav === "meetings" && actor.permissions.canCreateMeeting ? (
                  <button className="primary-button" onClick={() => setModal({ type: "meeting-new" })}>
                    <Plus size={18} /> {t("Yangi yig‘ilish")}
                  </button>
                ) : actor.permissions.canCreateTask && TASK_CREATE_PAGES.has(activeNav) ? (
                  <button className="primary-button" onClick={() => setModal({ type: "task-new" })}>
                    <Plus size={18} /> {t("Yangi topshiriq")}
                  </button>
                ) : null}
              </div>
            </header>

            {loadError ? (
              <div className="refresh-error-banner" role="alert">
                <CircleAlert size={17} />
                <span>
                  {t("Aloqa uzildi — ma’lumotlar yangilanmadi.")} {t(loadError)}
                </span>
                <button type="button" className="secondary-button compact-button" onClick={() => void refresh()}>
                  <RefreshCw size={14} /> {t("Qayta urinish")}
                </button>
              </div>
            ) : null}

            <DashboardPages
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              data={view ?? { ...data, departments: [], organizations: [] }}
              alphabet={alphabet}
              searchOpened={searchOpened}
              setSearchOpened={setSearchOpened}
              informationRequest={informationRequest}
              setInformationRequest={setInformationRequest}
              taskFilter={taskFilter}
              setTaskFilter={setTaskFilter}
              visibleTasks={visibleTasks}
              completion={completion}
              overdue={overdue}
              taskListScope={taskListScope}
              tasksLoadingMore={tasksLoadingMore}
              loadTasks={loadTasks}
              employees={employees}
              setModal={setModal}
              run={run}
              refresh={refresh}
              notify={notify}
              downloadExcel={downloadExcel}
            />
          </main>
          <nav className="mobile-bottom-nav" aria-label={t("Mobil menyu")}>
            <button className={activeNav === "home" ? "active" : ""} onClick={() => setActiveNav("home")}>
              <Home size={20} />
              <span>{t("Bosh sahifa")}</span>
            </button>
            <button className={activeNav === "tasks" ? "active" : ""} onClick={() => setActiveNav("tasks")}>
              <ClipboardList size={20} />
              <span>{t("Topshiriqlar")}</span>
            </button>
            <button className={activeNav === "chat" ? "active" : ""} onClick={() => setActiveNav("chat")}>
              <MessageCircle size={20} />
              <span>{t("Muloqot")}</span>
            </button>
            <button className={activeNav === "meetings" ? "active" : ""} onClick={() => setActiveNav("meetings")}>
              <CalendarDays size={20} />
              <span>{t("Yig‘ilishlar")}</span>
            </button>
            <button onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
              <span>{t("Menyu")}</span>
            </button>
          </nav>

          <DashboardModals
            modal={modal}
            setModal={setModal}
            data={view ?? { ...data, departments: [], organizations: [] }}
            alphabet={alphabet}
            employees={employees}
            assignableEmployees={assignableEmployees}
            run={run}
            refresh={refresh}
            notify={notify}
          />
          {toast ? (
            <div
              className={`toast ${toast.tone === "error" ? "toast-error" : ""}`}
              role={toast.tone === "error" ? "alert" : "status"}
              aria-live={toast.tone === "error" ? "assertive" : "polite"}
            >
              {toast.tone === "ok" ? <Check size={18} /> : <CircleAlert size={18} />}
              {t(toast.text)}
            </div>
          ) : null}
        </div>
      </DashboardProvider>
    </I18nProvider>
  );
}
