"use client";

/** Every dashboard modal and the API call behind its submit button. */
import type { Dispatch, SetStateAction } from "react";
import { readJson } from "../../dashboard-kit";
import { type Alphabet } from "../../ui-helpers";
import { MeetingModal, TaskDetail, TaskEditModal, TaskModal, patchTask } from "../../task-meeting-modals";
import {
  DepartmentModal,
  EmployeeModal,
  OrganizationModal,
  RoleModal,
  TelegramLinkModal,
  TopicModal,
} from "../../admin-modals";
import type { Bootstrap, Employee, ModalState, Task } from "./dashboard-types";

export type RunAction = (action: () => Promise<unknown>, success: string, close?: boolean) => Promise<boolean>;
export type Notify = (text: string, tone?: "ok" | "error") => void;

export function DashboardModals({
  modal,
  setModal,
  data,
  employees,
  assignableEmployees,
  run,
  refresh,
  notify,
}: {
  modal: ModalState;
  setModal: Dispatch<SetStateAction<ModalState>>;
  data: Bootstrap;
  /** Kept for callers; modals read the alphabet from the dashboard context. */
  alphabet?: Alphabet;
  employees: Employee[];
  assignableEmployees: Employee[];
  run: RunAction;
  refresh: () => Promise<void>;
  notify: Notify;
}) {
  return (
    <>
      {modal?.type === "task-new" ? (
        <TaskModal
          employees={assignableEmployees}
          organizations={data.organizations.filter((organization) => organization.active)}
          departments={data.departments.filter((department) => department.active)}
          topics={data.topics.filter((topic) => topic.active)}
          onClose={() => setModal(null)}
          onSubmit={async (form, files) => {
            try {
              const response = await readJson<{
                task?: Task;
                recipientSummary?: { employees: number; audiences: number };
              }>(
                await fetch("/api/tasks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(form),
                }),
              );
              if (!response.task) throw new Error("Topshiriq saqlanganini tasdiqlab bo‘lmadi");
              const uploads = await Promise.allSettled(
                files.map(async (file) => {
                  const upload = new FormData();
                  upload.append("taskId", String(response.task!.id));
                  upload.append("file", file);
                  await readJson(await fetch("/api/files", { method: "POST", body: upload }));
                }),
              );
              const failed = uploads.filter((item) => item.status === "rejected").length;
              setModal(null);
              await refresh();
              const recipientText = response.recipientSummary
                ? `${response.recipientSummary.employees} xodim${response.recipientSummary.audiences ? ` va ${response.recipientSummary.audiences} ta tuzilma` : ""}`
                : "tanlangan ijrochilar";
              notify(
                failed
                  ? `Topshiriq ${recipientText} uchun saqlandi, ${failed} ta fayl yuklanmadi`
                  : `Topshiriq ${recipientText} uchun saqlandi va yuborildi`,
                failed ? "error" : "ok",
              );
              return true;
            } catch (error) {
              notify(error instanceof Error ? error.message : "Topshiriq saqlanmadi", "error");
              return false;
            }
          }}
        />
      ) : null}
      {modal?.type === "task-edit" ? (
        <TaskEditModal
          task={modal.task}
          topics={data.topics.filter((topic) => topic.active || topic.id === modal.task.topic?.id)}
          onClose={() => setModal(null)}
          onSubmit={(payload) =>
            run(() => patchTask(modal.task.id, { action: "update", ...payload }), "Topshiriq ma’lumotlari yangilandi")
          }
        />
      ) : null}
      {modal?.type === "meeting-new" ? (
        <MeetingModal
          meeting={modal.meeting}
          defaultDate={modal.defaultDate}
          employees={employees.filter((employee) => employee.active)}
          organizations={data.organizations.filter((organization) => organization.active)}
          departments={data.departments.filter((department) => department.active)}
          onClose={() => setModal(null)}
          onSubmit={(form) =>
            run(
              async () => {
                await readJson(
                  await fetch("/api/meetings", {
                    method: modal.meeting ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(modal.meeting ? { ...form, id: modal.meeting.id } : form),
                  }),
                );
              },
              modal.meeting ? "Yig‘ilish ma’lumotlari yangilandi" : "Yig‘ilish taqvimga kiritildi",
            )
          }
        />
      ) : null}
      {modal?.type === "task-detail"
        ? (() => {
            const task = data.tasks.find((item) => item.id === modal.taskId);
            return task ? (
              <TaskDetail
                key={`${task.id}-${task.progress}-${task.status}-${task.assignments.map((assignment) => `${assignment.id}:${assignment.progress}:${assignment.status}`).join(",")}`}
                task={task}
                assignableEmployees={assignableEmployees}
                organizations={data.organizations.filter((organization) => organization.active)}
                departments={data.departments.filter((department) => department.active)}
                onClose={() => setModal(null)}
                onEdit={() => setModal({ type: "task-edit", task })}
              />
            ) : null;
          })()
        : null}
      {modal?.type === "employee" ? (
        <EmployeeModal
          employee={modal.employee}
          roles={data.roles.filter((role) => role.active)}
          departments={data.departments.filter((department) => department.active)}
          organizations={data.organizations.filter((organization) => organization.active)}
          employees={employees.filter((employee) => employee.active && employee.id !== modal.employee?.id)}
          onClose={() => setModal(null)}
          onSubmit={(payload) =>
            void run(
              async () => {
                await readJson(
                  await fetch("/api/admin/employees", {
                    method: modal.employee ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(modal.employee ? { ...payload, id: modal.employee.id } : payload),
                  }),
                );
              },
              modal.employee ? "Xodim ma’lumotlari yangilandi" : "Yangi xodim qo‘shildi",
            )
          }
        />
      ) : null}
      {modal?.type === "role" ? (
        <RoleModal
          role={modal.role}
          onClose={() => setModal(null)}
          onSubmit={(payload) =>
            void run(
              async () => {
                await readJson(
                  await fetch("/api/admin/roles", {
                    method: modal.role ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(modal.role ? { ...payload, id: modal.role.id } : payload),
                  }),
                );
              },
              modal.role ? "Rol vakolatlari yangilandi" : "Yangi rol yaratildi",
            )
          }
        />
      ) : null}
      {modal?.type === "department" ? (
        <DepartmentModal
          department={modal.department}
          departments={data.departments.filter((department) => department.active)}
          organizations={data.organizations.filter((organization) => organization.active)}
          onClose={() => setModal(null)}
          onSubmit={(payload) =>
            void run(
              async () => {
                await readJson(
                  await fetch("/api/admin/departments", {
                    method: modal.department ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(modal.department ? { ...payload, id: modal.department.id } : payload),
                  }),
                );
              },
              modal.department ? "Bo‘lim ma’lumotlari yangilandi" : "Yangi bo‘lim yaratildi",
            )
          }
        />
      ) : null}
      {modal?.type === "organization" ? (
        <OrganizationModal
          organization={modal.organization}
          organizations={data.organizations.filter((organization) => organization.active)}
          onClose={() => setModal(null)}
          onSubmit={(payload) =>
            void run(
              async () => {
                await readJson(
                  await fetch("/api/admin/organizations", {
                    method: modal.organization ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(modal.organization ? { ...payload, id: modal.organization.id } : payload),
                  }),
                );
              },
              modal.organization ? "Tashkilot ma’lumotlari yangilandi" : "Yangi tashkilot yaratildi",
            )
          }
        />
      ) : null}
      {modal?.type === "topic" ? (
        <TopicModal
          topic={modal.topic}
          onClose={() => setModal(null)}
          onSubmit={(payload) =>
            void run(
              async () => {
                await readJson(
                  await fetch("/api/admin/topics", {
                    method: modal.topic ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(modal.topic ? { ...payload, id: modal.topic.id } : payload),
                  }),
                );
              },
              modal.topic ? "Tematika yangilandi" : "Yangi tematika yaratildi",
            )
          }
        />
      ) : null}
      {modal?.type === "telegram-link" ? (
        <TelegramLinkModal
          state={modal}
          configured={data.telegram.configured}
          onClose={() => setModal(null)}
          onCreate={async () => {
            try {
              const payload = await readJson<{
                link: { token: string; url: string | null; expiresAt: string };
              }>(
                await fetch("/api/telegram/link", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ employeeId: modal.employee.id }),
                }),
              );
              setModal({ ...modal, link: payload.link });
            } catch (error) {
              notify(error instanceof Error ? error.message : "Telegram ulash havolasi yaratilmadi", "error");
            }
          }}
          onTest={() =>
            void run(
              async () => {
                await readJson(
                  await fetch("/api/telegram/test", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ employeeId: modal.employee.id }),
                  }),
                );
              },
              "Sinov xabari yuborildi",
              false,
            )
          }
        />
      ) : null}
    </>
  );
}
