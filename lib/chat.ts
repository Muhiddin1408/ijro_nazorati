/**
 * Chat helpers kept for callers outside the chat routes (SSE filter, tests).
 * Rules live in lib/policy/chat.ts; queries and writes in services/chat.ts.
 */
import { getD1 } from "../db";
import {
  chatSendCounts,
  ensureDefaultChatChannels as ensureDefaults,
  listChannelMessages,
  loadVisibleChatChannel,
} from "../services/chat";
import type { Actor } from "./auth";
import { authorize } from "./policy";
import { chatPost } from "./policy/chat";

export { CHAT_CHANNEL_ACCESS_SQL } from "../services/chat";
export { BROADCAST_MESSAGES_PER_HOUR, CHAT_MESSAGES_PER_MINUTE, canPostToBroadcast } from "./policy/chat";

export async function canAccessChatChannel(actor: Actor, channelId: number) {
  return Boolean(await loadVisibleChatChannel(await getD1(), actor, channelId));
}

/**
 * Validates that the actor may post a new message to the channel right now
 * (access, broadcast right, rate limits) and returns the channel.
 */
export async function assertCanPostToChatChannel(actor: Actor, channelId: number) {
  const db = await getD1();
  const channel = await loadVisibleChatChannel(db, actor, channelId);
  await authorize(chatPost(actor, channel, channel ? await chatSendCounts(db, actor.id) : { perMinute: 0, broadcastPerHour: 0 }));
  return channel!;
}

export async function ensureDefaultChatChannels(actor: Actor) {
  await ensureDefaults(await getD1(), actor);
}

export async function listChatMessages(actor: Actor, channelId: number, afterId = 0) {
  const db = await getD1();
  if (!(await loadVisibleChatChannel(db, actor, channelId))) return null;
  return listChannelMessages(db, channelId, afterId);
}
