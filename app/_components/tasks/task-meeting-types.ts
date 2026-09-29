import { type DepartmentOption, type OrganizationOption } from "../../dashboard-kit";
import type {
  ClientAssignment,
  ClientAttachment,
  ClientAudienceTarget,
  ClientMeeting,
  ClientRouteStep,
  ClientTask,
} from "../../../lib/shared/types";

export type ModalOrganization = OrganizationOption;
export type ModalDepartment = DepartmentOption;

export type ModalEmployee = {
  id: number;
  name: string;
  position: string;
  departmentId: number | null;
  department: string;
  organizationId: number | null;
  organization: string;
  managerId: number | null;
  roleName: string;
};

export type ModalTopic = { id: number; name: string; color?: string; active?: boolean };

export type AudienceTarget = ClientAudienceTarget;

export type ModalAssignment = ClientAssignment;

export type ModalRouteStep = ClientRouteStep;

export type ModalAttachment = ClientAttachment;

export type ModalTask = ClientTask;

export type ModalMeeting = ClientMeeting;

export type ModalActor = {
  id: number;
  name: string;
  permissions: {
    canCreateTask: boolean;
    canUpdateAnyTask: boolean;
  };
};
