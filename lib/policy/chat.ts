/**
 * Chat authorization. Pure decisions over already-loaded facts; the queries that
 * load those facts (channel visibility, recent send counts) live in services/chat.ts.
 *
 * Rules (Y6/Y7):
 * - broadcast is readable by everyone; a department channel only by the employee's
 *   CURRENT department; group/direct channels only by explicit members;
 * - only organisation managers, configurators and leadership roles post to broadcast;
 * - every employee may send at most CHAT_MESSAGES_PER_MINUTE messages per minute,
 *   and at most BROADCAST_MESSAGES_PER_HOUR announcements per hour.
 */
import type { Actor } from "../auth";
import { all, ALLOW, deny, when, type Decision } from "./index";

export const CHAT_MESSAGES_PER_MINUTE = 30;
export const BROADCAST_MESSAGES_PER_HOUR = 5;
export const MAX_GROUP_MEMBERS = 250;

type ChatActor = Pick<Actor, "id" | "roleCode" | "permissions">;

/** A channel the actor can see (null when it does not exist or is not visible). */
export type VisibleChatChannel = { id: number; type: string; name: string } | null;

export type ChatSendCounts = { perMinute: number; broadcastPerHour: number };

const NOT_FOUND = "Suhbat topilmadi";

/** May the actor post to the organisation-wide "Umumiy e’lonlar" channel? */
export function canPostToBroadcast(actor: ChatActor) {
  return actor.permissions.canManageOrganization
    || actor.permissions.canConfigure
    || actor.roleCode === "admin"
    || actor.roleCode === "rahbar";
}

export function chatChannelView(channel: VisibleChatChannel): Decision {
  return channel ? ALLOW : deny(NOT_FOUND, 404);
}

export function chatBroadcast(actor: ChatActor): Decision {
  return when(canPostToBroadcast(actor), "Umumiy e’lonlar kanaliga faqat rahbariyat va tashkilot administratorlari yoza oladi");
}

/** Posting a message (text or file) right now: visibility, broadcast right, rate limits. */
export function chatPost(actor: ChatActor, channel: VisibleChatChannel, counts: ChatSendCounts): Decision {
  if (!channel) return deny(NOT_FOUND, 404);
  const broadcast = channel.type === "broadcast";
  return all(
    broadcast ? chatBroadcast(actor) : ALLOW,
    when(counts.perMinute < CHAT_MESSAGES_PER_MINUTE, "Juda ko‘p xabar yuborildi. Bir daqiqadan so‘ng qayta urinib ko‘ring", 429),
    broadcast
      ? when(counts.broadcastPerHour < BROADCAST_MESSAGES_PER_HOUR, `Umumiy e’lonlar kanaliga soatiga ko‘pi bilan ${BROADCAST_MESSAGES_PER_HOUR} ta xabar yuborish mumkin`, 429)
      : ALLOW,
  );
}

/** Uploading an attachment creates a message, so it follows exactly the posting rules. */
export function chatUpload(actor: ChatActor, channel: VisibleChatChannel, counts: ChatSendCounts): Decision {
  return chatPost(actor, channel, counts);
}

/**
 * Creating a group: any employee may, with 1–249 other active employees. Corporate
 * chat intentionally follows the full active directory (like `/api/directory?scope=chat`),
 * independent of task scope.
 */
export function chatGroupManage(_actor: ChatActor, group: { memberIds: number[]; allMembersActive: boolean }): Decision {
  if (!group.memberIds.length) return deny("Guruhga kamida bitta xodim tanlang", 400);
  if (group.memberIds.length > MAX_GROUP_MEMBERS - 1) return deny(`Bitta guruhga ko‘pi bilan ${MAX_GROUP_MEMBERS} a’zo qo‘shish mumkin`, 400);
  return when(group.allMembersActive, "Tanlangan xodimlardan biri faol emas yoki topilmadi", 400);
}

/** Opening a direct conversation with another active employee. */
export function chatDirectOpen(actor: ChatActor, employeeId: number, target: { id: number } | null): Decision {
  if (!employeeId || employeeId === actor.id) return deny("Suhbatdoshni tanlang", 400);
  return when(Boolean(target), "Xodim topilmadi", 404);
}
