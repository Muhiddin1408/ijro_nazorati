import type { DepartmentOption, OrganizationOption } from "../../dashboard-kit";

export type ChatActor = {
  id: number;
  name: string;
  position: string;
};
export type ChatOrganization = OrganizationOption;
export type ChatDepartment = DepartmentOption;
export type ChatNotify = (text: string, tone?: "ok" | "error") => void;

export type ChatChannel = {
  id: number;
  name: string;
  type: string;
  departmentId: number | null;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  memberCount: number;
};
export type ChatDirectoryEmployee = {
  id: number;
  name: string;
  position: string;
  department: string;
  organization: string;
};
export type ChatMessage = {
  id: number;
  channelId: number;
  sender: { id: number; name: string; position: string };
  type: string;
  body: string;
  createdAt: string;
  attachments: { id: number; fileName: string; contentType: string; size: number; createdAt: string }[];
};
