import {
  Activity,
  Building2,
  CalendarDays,
  ClipboardList,
  Database,
  FileSpreadsheet,
  Home,
  Layers3,
  LockKeyhole,
  Megaphone,
  MessageCircle,
  PlugZap,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Actor, Bootstrap } from "./dashboard-types";

/**
 * Dashboard screens. Logic keys off these stable ids; the Uzbek labels are only
 * for display, so renaming a label never changes behavior.
 */
export const NAV_LABELS = {
  home: "Bosh sahifa",
  tasks: "Topshiriqlar",
  meetings: "Yig‘ilishlar",
  chat: "Muloqot",
  security: "Kirish xavfsizligi",
  information: "Ma’lumotlar markazi",
  search: "AI qidiruv",
  reports: "Hisobotlar",
  kpi: "KPI",
  employees: "Xodimlar",
  roles: "Rollar",
  departments: "Bo‘limlar",
  organizations: "Tashkilotlar",
  staff: "Shtatlar",
  topics: "Tematikalar",
  telegram: "Telegram",
  integrations: "Integratsiyalar",
  audit: "Audit jurnali",
} as const;

export type NavKey = keyof typeof NAV_LABELS;

/** Screens and modals that need the full employee directory; everything else renders without it. */
export const EMPLOYEE_PAGES: ReadonlySet<NavKey> = new Set<NavKey>([
  "employees",
  "roles",
  "departments",
  "organizations",
  "telegram",
]);
export const EMPLOYEE_MODALS: ReadonlySet<string> = new Set(["task-new", "task-detail", "meeting-new", "employee"]);
/** Screens and dialogs that need the organization/department structure. */
export const STRUCTURE_PAGES: ReadonlySet<NavKey> = new Set<NavKey>([
  "chat",
  "reports",
  "employees",
  "roles",
  "departments",
  "organizations",
  "staff",
]);
export const STRUCTURE_MODALS: ReadonlySet<string> = new Set([
  "task-new",
  "task-detail",
  "meeting-new",
  "employee",
  "department",
  "organization",
]);

/** Screens where the task search box is shown in the top bar. */
export const TASK_SEARCH_PAGES: ReadonlySet<NavKey> = new Set<NavKey>(["home", "tasks"]);

/** Screens that offer the "new task" shortcut (meetings shows "new meeting" instead). */
export const TASK_CREATE_PAGES: ReadonlySet<NavKey> = new Set<NavKey>(["home", "tasks", "meetings", "staff"]);

/** First administrator screen; the sidebar shows the "Administrator" heading above it. */
export const ADMIN_SECTION_START: NavKey = "employees";

export type NavItem = { key: NavKey; label: string; icon: LucideIcon; count?: number };

export function buildNavItems(actor: Actor, data: Pick<Bootstrap, "tasks" | "meetings">, now = new Date()): NavItem[] {
  const { permissions } = actor;
  const items: Array<NavItem & { show: boolean }> = [
    { key: "home", label: NAV_LABELS.home, icon: Home, show: true },
    { key: "tasks", label: NAV_LABELS.tasks, icon: ClipboardList, show: true, count: data.tasks.length },
    {
      key: "meetings",
      label: NAV_LABELS.meetings,
      icon: CalendarDays,
      show: true,
      count: data.meetings.filter((meeting) => new Date(meeting.startsAt) >= now).length,
    },
    { key: "chat", label: NAV_LABELS.chat, icon: MessageCircle, show: true },
    { key: "security", label: NAV_LABELS.security, icon: LockKeyhole, show: true },
    { key: "information", label: NAV_LABELS.information, icon: Layers3, show: true },
    { key: "search", label: NAV_LABELS.search, icon: Sparkles, show: true },
    { key: "reports", label: NAV_LABELS.reports, icon: FileSpreadsheet, show: true },
    { key: "kpi", label: NAV_LABELS.kpi, icon: Target, show: true },
    { key: "employees", label: NAV_LABELS.employees, icon: UserCog, show: permissions.canManageOrganization },
    { key: "roles", label: NAV_LABELS.roles, icon: ShieldCheck, show: permissions.canManageRoles },
    { key: "departments", label: NAV_LABELS.departments, icon: Building2, show: permissions.canManageOrganization },
    { key: "organizations", label: NAV_LABELS.organizations, icon: Database, show: permissions.canManageOrganization },
    {
      key: "staff",
      label: NAV_LABELS.staff,
      icon: Users,
      show: permissions.canManageOrganization || permissions.canManageReports,
    },
    { key: "topics", label: NAV_LABELS.topics, icon: Megaphone, show: permissions.canManageOrganization },
    { key: "telegram", label: NAV_LABELS.telegram, icon: Send, show: permissions.canConfigure },
    { key: "integrations", label: NAV_LABELS.integrations, icon: PlugZap, show: permissions.canConfigure },
    { key: "audit", label: NAV_LABELS.audit, icon: Activity, show: permissions.canViewAudit },
  ];
  return items.filter((item) => item.show).map(({ key, label, icon, count }) => ({ key, label, icon, count }));
}
