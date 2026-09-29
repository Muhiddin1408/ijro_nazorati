"use client";

/**
 * Task / meeting create-edit-detail modals and the shared PeoplePicker.
 * Extracted from dashboard.tsx so the shell stays a coordinator.
 */

export { TaskDetail } from "./_components/tasks/task-detail";
export { MeetingModal } from "./_components/tasks/meeting-modal";
export { TaskModal, TaskEditModal } from "./_components/tasks/task-modals";
export { PeoplePicker } from "./_components/tasks/people-picker";
export { patchTask } from "./_components/tasks/task-helpers";
export type {
  ModalOrganization,
  ModalDepartment,
  ModalEmployee,
  ModalTopic,
  AudienceTarget,
  ModalAssignment,
  ModalRouteStep,
  ModalAttachment,
  ModalTask,
  ModalMeeting,
  ModalActor,
} from "./_components/tasks/task-meeting-types";
