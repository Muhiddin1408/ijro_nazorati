"use client";

/** The screen for the active navigation entry. Heavy screens stay lazy-loaded. */
import { Suspense, lazy, type Dispatch, type SetStateAction } from "react";
import type { InformationOpenTarget } from "../../../lib/information-search-types";
import { RoadLoader } from "../../road-loader";
import { AuditPage as AuditJournalPage } from "../../audit-page";
import { formatDateTime, type Alphabet } from "../../ui-helpers";
import { PageIntro, readJson } from "../../dashboard-kit";
import { patchTask } from "../../task-meeting-modals";
import { DashboardHome } from "../../dashboard-home";
import {
  DepartmentsPage,
  EmployeesPage,
  IntegrationsPage,
  KpiPage,
  OrganizationsPage,
  RolesPage,
  SecurityPage,
  StaffDirectoryPage,
  TelegramPage,
  TopicsPage,
} from "../../admin-pages";
import type { Bootstrap, Employee, Meeting, ModalState, Role, Task, TaskListScope } from "./dashboard-types";
import type { NavKey } from "./navigation";
import { downloadProvisioningWorkbook, requestProvisioning } from "./provisioning";
import type { Notify, RunAction } from "./dashboard-modals";
import { confirmDialog } from "../ui/confirm-dialog";
import { useI18n } from "../../../lib/i18n";

const InformationSearch = lazy(() =>
  import("../../information-search").then((module) => ({ default: module.InformationSearch })),
);
const InformationCenter = lazy(() =>
  import("../../information-center").then((module) => ({ default: module.InformationCenter })),
);
const ChatPage = lazy(() => import("../../chat-page").then((module) => ({ default: module.ChatPage })));
const TasksPage = lazy(() => import("../../tasks-page").then((module) => ({ default: module.TasksPage })));
const MeetingsPage = lazy(() => import("../../meetings-page").then((module) => ({ default: module.MeetingsPage })));
const ReportsPage = lazy(() => import("../../reports-page").then((module) => ({ default: module.ReportsPage })));

export type InformationRequest = { target: InformationOpenTarget; nonce: number } | null;

export function DashboardPages({
  activeNav,
  setActiveNav,
  data,
  searchOpened,
  setSearchOpened,
  informationRequest,
  setInformationRequest,
  taskFilter,
  setTaskFilter,
  visibleTasks,
  completion,
  overdue,
  taskListScope,
  tasksLoadingMore,
  loadTasks,
  employees,
  setModal,
  run,
  refresh,
  notify,
  downloadExcel,
}: {
  activeNav: NavKey;
  setActiveNav: (key: NavKey) => void;
  data: Bootstrap;
  /** Still passed by the shell; dialogs now follow the alphabet through the DOM renderer. */
  alphabet: Alphabet;
  searchOpened: boolean;
  setSearchOpened: (opened: boolean) => void;
  informationRequest: InformationRequest;
  setInformationRequest: Dispatch<SetStateAction<InformationRequest>>;
  taskFilter: string;
  setTaskFilter: (filter: string) => void;
  visibleTasks: Task[];
  completion: number;
  overdue: number;
  taskListScope: TaskListScope;
  tasksLoadingMore: boolean;
  loadTasks: (scope: TaskListScope, append: boolean) => Promise<void>;
  employees: Employee[];
  setModal: Dispatch<SetStateAction<ModalState>>;
  run: RunAction;
  refresh: () => Promise<void>;
  notify: Notify;
  downloadExcel: () => Promise<void>;
}) {
  const { t, tx } = useI18n();
  const { actor } = data;
  return (
    <div className="page-content">
      {searchOpened ? (
        <div hidden={activeNav !== "search"}>
          <Suspense fallback={<RoadLoader compact label={t("Qidiruv ochilmoqda")} />}>
            <InformationSearch
              key={actor.id}
              onOpen={(target) => {
                setInformationRequest((current) => ({ target, nonce: (current?.nonce ?? 0) + 1 }));
                setActiveNav("information");
              }}
            />
          </Suspense>
        </div>
      ) : null}
      {activeNav === "home" ? (
        <DashboardHome
          data={data}
          completion={completion}
          overdue={overdue}
          tasks={visibleTasks.slice(0, 8)}
          setFilter={setTaskFilter}
          filter={taskFilter}
          onOpenTask={(taskId) => setModal({ type: "task-detail", taskId })}
          onPin={(task) =>
            void run(
              () => patchTask(task.id, { action: "pin", pinned: !task.pinned }),
              task.pinned ? "Topshiriq ish stolidan olindi" : "Topshiriq ish stoliga mahkamlandi",
              false,
            )
          }
          onCalendar={() => setActiveNav("meetings")}
          onExport={() => void downloadExcel()}
        />
      ) : null}
      {activeNav === "tasks" ? (
        <Suspense
          fallback={
            <RoadLoader
              compact
              label={t("Topshiriqlar ochilmoqda")}
              detail={t("Reyestr va filtrlar tayyorlanmoqda…")}
            />
          }
        >
          <TasksPage
            tasks={visibleTasks}
            actorId={data.actor.id}
            hasMore={Boolean(data.lists?.tasksHasMore)}
            loadingMore={tasksLoadingMore}
            includeClosed={taskListScope === "all"}
            onLoadMore={() => void loadTasks(taskListScope, true)}
            onToggleClosed={() => void loadTasks(taskListScope === "all" ? "current" : "all", false)}
            permissions={actor.permissions}
            onNew={() => setModal({ type: "task-new" })}
            onExport={() => void downloadExcel()}
            onOpen={(taskId) => setModal({ type: "task-detail", taskId })}
            onPin={(task) =>
              void run(
                () => patchTask(task.id, { action: "pin", pinned: !task.pinned }),
                task.pinned ? "Topshiriq ish stolidan olindi" : "Topshiriq ish stoliga mahkamlandi",
                false,
              )
            }
          />
        </Suspense>
      ) : null}
      {activeNav === "meetings" ? (
        <Suspense
          fallback={
            <RoadLoader
              compact
              label={t("Yig‘ilishlar ochilmoqda")}
              detail={t("Taqvim va kun tartibi tayyorlanmoqda…")}
            />
          }
        >
          <MeetingsPage
            meetings={data.meetings}
            actorId={actor.id}
            canEditAll={actor.permissions.viewScope === "all"}
            canCreate={actor.permissions.canCreateMeeting}
            onNew={(date) => setModal({ type: "meeting-new", defaultDate: date })}
            onEdit={(meeting) => setModal({ type: "meeting-new", meeting: meeting as Meeting })}
            onDelete={async (meeting) => {
              if (
                !(await confirmDialog({
                  title: t("Yig‘ilishni bekor qilish"),
                  message: t("“{title}” yig‘ilishini bekor qilasizmi?", { title: tx(meeting.title) }),
                  confirmLabel: t("Bekor qilish"),
                  cancelLabel: t("Orqaga"),
                  tone: "danger",
                }))
              )
                return;
              void run(
                async () => {
                  await readJson(
                    await fetch(`/api/meetings?id=${meeting.id}`, {
                      method: "DELETE",
                    }),
                  );
                },
                "Yig‘ilish bekor qilindi",
                false,
              );
            }}
          />
        </Suspense>
      ) : null}
      {activeNav === "chat" ? (
        <Suspense
          fallback={
            <RoadLoader compact label={t("Muloqot ochilmoqda")} detail={t("Suhbatlar va fayllar tayyorlanmoqda…")} />
          }
        >
          <ChatPage
            actor={actor}
            organizations={data.organizations.filter((organization) => organization.active)}
            departments={data.departments.filter((department) => department.active)}
            notify={notify}
          />
        </Suspense>
      ) : null}
      {activeNav === "security" ? (
        <SecurityPage
          actor={actor}
          onSaved={async () => {
            await refresh();
            notify("Kirish ma’lumotlari xavfsiz saqlandi");
          }}
          notify={notify}
        />
      ) : null}
      {activeNav === "information" ? (
        <Suspense
          fallback={
            <RoadLoader
              compact
              label={t("Ma’lumotlar markazi ochilmoqda")}
              detail={t("Jadvallar va filtrlar tayyorlanmoqda…")}
            />
          }
        >
          <InformationCenter
            key={informationRequest?.nonce ?? "catalog"}
            notify={notify}
            initialTarget={informationRequest?.target}
            onSearch={() => {
              setSearchOpened(true);
              setActiveNav("search");
            }}
          />
        </Suspense>
      ) : null}
      {activeNav === "reports" ? (
        <Suspense
          fallback={
            <RoadLoader compact label={t("Hisobotlar ochilmoqda")} detail={t("Davrlar va svod tayyorlanmoqda…")} />
          }
        >
          <ReportsPage
            actor={actor}
            tasks={data.tasks}
            departments={data.departments}
            onExport={() => void downloadExcel()}
            notify={notify}
          />
        </Suspense>
      ) : null}
      {activeNav === "kpi" ? <KpiPage /> : null}
      {activeNav === "employees" ? (
        <EmployeesPage
          employees={employees}
          roles={data.roles}
          organizations={data.organizations}
          canProvision={actor.permissions.canManageRoles}
          onAdd={() => setModal({ type: "employee" })}
          onEdit={(employee) => setModal({ type: "employee", employee: employee as Employee })}
          onLink={(employee) => setModal({ type: "telegram-link", employee: employee as Employee })}
          requestProvisioning={requestProvisioning}
          downloadProvisioningWorkbook={downloadProvisioningWorkbook}
        />
      ) : null}
      {activeNav === "roles" ? (
        <RolesPage
          roles={data.roles}
          employees={employees}
          organizations={data.organizations}
          canManageRoles={actor.permissions.canManageRoles}
          onAdd={() => setModal({ type: "role" })}
          onEdit={(role) => setModal({ type: "role", role: role as Role })}
        />
      ) : null}
      {activeNav === "departments" ? (
        <DepartmentsPage
          departments={data.departments}
          employees={employees}
          onAdd={() => setModal({ type: "department" })}
          onEdit={(department) => setModal({ type: "department", department })}
        />
      ) : null}
      {activeNav === "organizations" ? (
        <OrganizationsPage
          organizations={data.organizations}
          employees={employees}
          onAdd={() => setModal({ type: "organization" })}
          onEdit={(organization) => setModal({ type: "organization", organization })}
        />
      ) : null}
      {activeNav === "staff" ? (
        <StaffDirectoryPage
          organizations={data.organizations}
          canProvision={actor.permissions.canManageRoles}
          requestProvisioning={requestProvisioning}
          downloadProvisioningWorkbook={downloadProvisioningWorkbook}
        />
      ) : null}
      {activeNav === "topics" ? (
        <TopicsPage
          topics={data.topics}
          onAdd={() => setModal({ type: "topic" })}
          onEdit={(topic) => setModal({ type: "topic", topic })}
        />
      ) : null}
      {activeNav === "telegram" ? (
        <TelegramPage
          status={data.telegram}
          employees={employees}
          onActivate={() =>
            void run(
              async () => {
                await readJson(
                  await fetch("/api/admin/telegram/setup", {
                    method: "POST",
                  }),
                );
              },
              "Telegram webhooki faollashtirildi",
              false,
            )
          }
          onProcess={() =>
            void run(
              async () => {
                await readJson(await fetch("/api/reminders/process", { method: "POST" }));
              },
              "Eslatma navbati qayta ishlandi",
              false,
            )
          }
          onLink={(employee) => setModal({ type: "telegram-link", employee: employee as Employee })}
        />
      ) : null}
      {activeNav === "integrations" ? <IntegrationsPage integrations={data.integrations} /> : null}
      {activeNav === "audit" ? (
        <AuditJournalPage
          items={[]}
          loadOnMount
          formatDateTime={formatDateTime}
          notify={notify}
          PageIntro={PageIntro}
        />
      ) : null}
    </div>
  );
}
