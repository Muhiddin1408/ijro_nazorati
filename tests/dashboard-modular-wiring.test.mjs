import { readSource } from './fixtures/source.mjs';
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dashboardUrl = new URL("../app/dashboard.tsx", import.meta.url);
const auditPageUrl = new URL("../app/audit-page.tsx", import.meta.url);
const themeToggleUrl = new URL("../app/theme-mode-toggle.tsx", import.meta.url);
const prefsUrl = new URL("../app/notification-prefs.tsx", import.meta.url);
const chatPageUrl = new URL("../app/chat-page.tsx", import.meta.url);
const kitUrl = new URL("../app/dashboard-kit.tsx", import.meta.url);

test("dashboard wires extracted Audit, theme toggle and notification prefs modules", async () => {
  const [dashboard, auditPage, themeToggle, prefs, adminPages] = await Promise.all([
    readSource(dashboardUrl),
    readSource(auditPageUrl),
    readSource(themeToggleUrl),
    readSource(prefsUrl),
    readSource(new URL("../app/admin-pages.tsx", import.meta.url)),
  ]);

  assert.match(dashboard, /import \{ AuditPage as AuditJournalPage \} from "(?:\.\/|(?:\.\.\/)+)audit-page"/);
  assert.match(dashboard, /import \{ ThemeModeToggle \} from "(?:\.\/|(?:\.\.\/)+)theme-mode-toggle"/);
  assert.match(adminPages, /import \{ NotificationPrefsPanel \} from "(?:\.\/|(?:\.\.\/)+)notification-prefs"/);
  assert.match(dashboard, /<AuditJournalPage/);
  assert.match(dashboard, /formatDateTime=\{formatDateTime\}/);
  assert.match(dashboard, /<ThemeModeToggle \/>/);
  assert.ok(
    ((dashboard.match(/<ThemeModeToggle \/>/g) ?? []).length
      + ((await readSource(new URL("../app/login-screen.tsx", import.meta.url))).match(/<ThemeModeToggle \/>/g) ?? []).length) >= 3,
    "toggle must appear on login, password-gate and main topbar",
  );
  assert.match(adminPages, /<NotificationPrefsPanel/);
  assert.match(adminPages, /apiPath="\/api\/telegram\/preferences"/);
  assert.doesNotMatch(dashboard, /function AuditPage\(/);

  assert.match(auditPage, /export function AuditPage/);
  assert.match(auditPage, /Excel’ga eksport/);
  assert.match(auditPage, /exportAuditExcel/);
  assert.match(themeToggle, /COLOR_MODE_STORAGE_KEY/);
  assert.match(themeToggle, /Yorug‘ rejim/);
  assert.match(prefs, /notificationsEnabled/);
  assert.match(prefs, /\/api\/telegram\/preferences/);
});

test("ChatPage is a standalone lazy-loaded module", async () => {
  const [dashboard, chatPage, kit] = await Promise.all([
    readSource(dashboardUrl),
    readSource(chatPageUrl),
    readSource(kitUrl),
  ]);

  assert.match(dashboard, /import\("(?:\.\/|(?:\.\.\/)+)chat-page"\)/);
  assert.match(dashboard, /Muloqot ochilmoqda/);
  assert.doesNotMatch(dashboard, /function ChatPage\(/);
  assert.doesNotMatch(dashboard, /function GroupChatModal\(/);
  assert.doesNotMatch(dashboard, /function uploadChatFile\(/);

  assert.match(chatPage, /export function ChatPage|function ChatPage/);
  assert.match(chatPage, /channelRefreshPromise/);
  assert.match(chatPage, /messageRequestsInFlight/);
  assert.match(chatPage, /className="chat-composer-row"/);
  assert.match(chatPage, /Yangi guruh yaratish/);
  assert.match(chatPage, /from "(?:\.\/|(?:\.\.\/)+)dashboard-kit"/);
  assert.match(chatPage, /from "(?:\.\/|(?:\.\.\/)+)ui-helpers"/);

  assert.match(kit, /export function OrganizationCascadePicker/);
  assert.match(kit, /export \{ readJson \} from "..\/lib\/shared\/http"/);
  assert.match(kit, /export function ModalFrame/);
  assert.match(kit, /export function PageIntro/);
});

test("TasksPage is a standalone lazy-loaded module", async () => {
  const dashboard = await readSource(dashboardUrl);
  const tasksPage = await readSource(new URL("../app/tasks-page.tsx", import.meta.url));

  assert.match(dashboard, /import\("(?:\.\/|(?:\.\.\/)+)tasks-page"\)/);
  assert.match(dashboard, /Topshiriqlar ochilmoqda/);
  assert.doesNotMatch(dashboard, /function TasksPage\(/);
  assert.match(tasksPage, /export function TasksPage/);
  assert.match(tasksPage, /const \[visibleCount, setVisibleCount\] = useState\(36\)/);
  assert.match(tasksPage, /Topshiriqlar reyestri/);
  assert.match(tasksPage, /from "(?:\.\/|(?:\.\.\/)+)dashboard-kit"/);
  assert.match(tasksPage, /from "(?:\.\/|(?:\.\.\/)+)ui-helpers"/);
});

test("MeetingsPage is a standalone lazy-loaded module", async () => {
  const dashboard = await readSource(dashboardUrl);
  const meetingsPage = await readSource(new URL("../app/meetings-page.tsx", import.meta.url));

  assert.match(dashboard, /import\("(?:\.\/|(?:\.\.\/)+)meetings-page"\)/);
  assert.match(dashboard, /Yig‘ilishlar ochilmoqda/);
  assert.doesNotMatch(dashboard, /function MeetingsPage\(/);
  assert.match(meetingsPage, /export function MeetingsPage/);
  assert.match(meetingsPage, /Yig‘ilishlar taqvimi/);
  assert.match(meetingsPage, /Kun tartibi/);
  assert.match(meetingsPage, /Eslatma qoidalari/);
  assert.match(meetingsPage, /from "(?:\.\/|(?:\.\.\/)+)dashboard-kit"/);
  assert.match(meetingsPage, /from "(?:\.\/|(?:\.\.\/)+)ui-helpers"/);
});

test("dashboard uses shared ui-helpers instead of local alphabet/date copies", async () => {
  const [dashboard, helpers, kit] = await Promise.all([
    readSource(dashboardUrl),
    readSource(new URL("../app/ui-helpers.tsx", import.meta.url)),
    readSource(kitUrl),
  ]);

  assert.match(dashboard, /from "(?:\.\/|(?:\.\.\/)+)ui-helpers"/);
  assert.doesNotMatch(dashboard, /function OrganizationCascadePicker/);
  assert.match(kit, /export function OrganizationCascadePicker/);
  // The single transliteration implementation lives in lib/shared/transliterate.ts.
  const { readFile: readRaw } = await import("node:fs/promises");
  assert.doesNotMatch(await readRaw(dashboardUrl, "utf8"), /function latinToCyrillic\(/);
  assert.match(await readRaw(new URL("../lib/shared/transliterate.ts", import.meta.url), "utf8"), /export function latinToCyrillic\(/);
  assert.doesNotMatch(dashboard, /function ThemePicker\(/);
  assert.doesNotMatch(dashboard, /function BrandMark\(/);
  assert.doesNotMatch(dashboard, /function humanSize\(/);
  assert.doesNotMatch(dashboard, /function localDateKey\(/);
  assert.match(helpers, /export \{ latinToCyrillic \} from "..\/lib\/shared\/transliterate"/);
  assert.match(helpers, /export function ThemePicker/);
  assert.match(helpers, /export function BrandMark/);
  assert.match(helpers, /export function humanSize/);
});

test("Task and Meeting modals live in a standalone module", async () => {
  const dashboard = await readSource(dashboardUrl);
  const modals = await readSource(new URL("../app/task-meeting-modals.tsx", import.meta.url));

  assert.match(dashboard, /from "(?:\.\/|(?:\.\.\/)+)task-meeting-modals"/);
  assert.match(dashboard, /<TaskModal/);
  assert.match(dashboard, /<TaskEditModal/);
  assert.match(dashboard, /<MeetingModal/);
  assert.match(dashboard, /<TaskDetail/);
  assert.doesNotMatch(dashboard, /function TaskModal\(/);
  assert.doesNotMatch(dashboard, /function TaskEditModal\(/);
  assert.doesNotMatch(dashboard, /function MeetingModal\(/);
  assert.doesNotMatch(dashboard, /function TaskDetail\(/);
  assert.doesNotMatch(dashboard, /function PeoplePicker\(/);

  assert.match(modals, /export function TaskModal/);
  assert.match(modals, /export function TaskEditModal/);
  assert.match(modals, /export function MeetingModal/);
  assert.match(modals, /export function TaskDetail/);
  assert.match(modals, /export function PeoplePicker/);
  assert.match(modals, /task-recipient-confirmation/);
  assert.match(modals, /YANGI TOPSHIRIQ/);
  assert.match(modals, /YIG‘ILISHLAR/);
  assert.match(modals, /from "(?:\.\/|(?:\.\.\/)+)dashboard-kit"/);
  assert.match(modals, /from "(?:\.\/|(?:\.\.\/)+)ui-helpers"/);
});

test("ReportsPage is a standalone lazy-loaded module", async () => {
  const dashboard = await readSource(dashboardUrl);
  const reportsPage = await readSource(new URL("../app/reports-page.tsx", import.meta.url));

  assert.match(dashboard, /import\("(?:\.\/|(?:\.\.\/)+)reports-page"\)/);
  assert.match(dashboard, /Hisobotlar ochilmoqda/);
  assert.doesNotMatch(dashboard, /function ReportsPage\(/);
  assert.doesNotMatch(dashboard, /function NewReportModal\(/);
  assert.doesNotMatch(dashboard, /function ReportFillModal\(/);
  assert.doesNotMatch(dashboard, /function ReportDelegateModal\(/);

  assert.match(reportsPage, /export function ReportsPage/);
  assert.match(reportsPage, /export function NewReportModal/);
  assert.match(reportsPage, /export function ReportFillModal/);
  assert.match(reportsPage, /IERARXIK HISOBOTLAR/);
  assert.match(reportsPage, /Hisobotlar reyestri/);
  assert.match(reportsPage, /from "(?:\.\/|(?:\.\.\/)+)dashboard-kit"/);
  assert.match(reportsPage, /from "(?:\.\/|(?:\.\.\/)+)ui-helpers"/);
});

test("Staff and Admin pages live in a standalone module", async () => {
  const dashboard = await readSource(dashboardUrl);
  const adminPages = await readSource(new URL("../app/admin-pages.tsx", import.meta.url));

  assert.match(dashboard, /from "(?:\.\/|(?:\.\.\/)+)admin-pages"/);
  assert.match(dashboard, /<StaffDirectoryPage/);
  assert.match(dashboard, /<EmployeesPage/);
  assert.match(dashboard, /<RolesPage/);
  assert.match(dashboard, /<SecurityPage/);
  assert.doesNotMatch(dashboard, /function StaffDirectoryPage\(/);
  assert.doesNotMatch(dashboard, /function EmployeesPage\(/);
  assert.doesNotMatch(dashboard, /function RolesPage\(/);
  assert.doesNotMatch(dashboard, /function InformationAccessManager\(/);
  assert.doesNotMatch(dashboard, /function KpiPage\(/);

  assert.match(adminPages, /export function StaffDirectoryPage/);
  assert.match(adminPages, /export function EmployeesPage/);
  assert.match(adminPages, /export function RolesPage/);
  assert.match(adminPages, /export function InformationAccessManager/);
  assert.match(adminPages, /YAGONA SHTATLAR REESTRI/);
  assert.match(adminPages, /Aloqa ma’lumotlari/);
  assert.match(adminPages, /Umumiy vakolat berilmaydi/);
  assert.match(adminPages, /from "(?:\.\/|(?:\.\.\/)+)dashboard-kit"/);
  assert.match(adminPages, /from "(?:\.\/|(?:\.\.\/)+)ui-helpers"/);
});

test("Admin CRUD modals live in a standalone module", async () => {
  const dashboard = await readSource(dashboardUrl);
  const adminModals = await readSource(new URL("../app/admin-modals.tsx", import.meta.url));

  assert.match(dashboard, /from "(?:\.\/|(?:\.\.\/)+)admin-modals"/);
  assert.match(dashboard, /<EmployeeModal/);
  assert.match(dashboard, /<RoleModal/);
  assert.match(dashboard, /<DepartmentModal/);
  assert.match(dashboard, /<OrganizationModal/);
  assert.match(dashboard, /<TopicModal/);
  assert.match(dashboard, /<TelegramLinkModal/);
  assert.doesNotMatch(dashboard, /function EmployeeModal\(/);
  assert.doesNotMatch(dashboard, /function RoleModal\(/);
  assert.doesNotMatch(dashboard, /function DepartmentModal\(/);
  assert.doesNotMatch(dashboard, /function OrganizationModal\(/);
  assert.doesNotMatch(dashboard, /function TopicModal\(/);
  assert.doesNotMatch(dashboard, /function TelegramLinkModal\(/);

  assert.match(adminModals, /export function EmployeeModal/);
  assert.match(adminModals, /export function RoleModal/);
  assert.match(adminModals, /export function TelegramLinkModal/);
  assert.match(adminModals, /Yangi xodim/);
  assert.match(adminModals, /canEnterInformation/);
  assert.match(adminModals, /from "(?:\.\/|(?:\.\.\/)+)dashboard-kit"/);
});

test("Login, home and Excel export live outside the dashboard shell", async () => {
  const [dashboard, loginScreen, home, excel] = await Promise.all([
    readSource(dashboardUrl),
    readSource(new URL("../app/login-screen.tsx", import.meta.url)),
    readSource(new URL("../app/dashboard-home.tsx", import.meta.url)),
    readSource(new URL("../app/task-meeting-export.ts", import.meta.url)),
  ]);

  assert.match(dashboard, /from "(?:\.\/|(?:\.\.\/)+)login-screen"/);
  assert.match(dashboard, /from "(?:\.\/|(?:\.\.\/)+)dashboard-home"/);
  assert.match(dashboard, /from "(?:\.\/|(?:\.\.\/)+)task-meeting-export"/);
  assert.match(dashboard, /<LoginScreen/);
  assert.match(dashboard, /<DashboardHome/);
  assert.doesNotMatch(dashboard, /function LoginScreen\(/);
  assert.doesNotMatch(dashboard, /function DashboardHome\(/);
  assert.doesNotMatch(dashboard, /async function exportExcel\(/);

  assert.match(loginScreen, /export function LoginScreen/);
  assert.match(loginScreen, /captureActivationLocation/);
  assert.match(home, /export function DashboardHome/);
  assert.match(home, /KUNLIK NAZORAT/);
  assert.match(excel, /export async function exportExcel/);
  assert.match(excel, /Ichki hisobotlarni boshqarish tizimi hisoboti/);
});



test("dashboard navigation keys off typed ids, never Uzbek label text", async () => {
  const dashboard = await readSource(dashboardUrl);
  assert.match(dashboard, /useState<NavKey>\("home"\)/);
  assert.match(dashboard, /export type NavKey = keyof typeof NAV_LABELS/);
  assert.doesNotMatch(dashboard, /activeNav\.includes\(/);
  assert.doesNotMatch(dashboard, /activeNav\s*[!=]==\s*"[A-ZА-Яa-z’‘ ]*[ A-Z‘’][^"]*"/, "compare activeNav with NavKey ids only");
  assert.doesNotMatch(dashboard, /setActiveNav\("[A-Z]/);
});
