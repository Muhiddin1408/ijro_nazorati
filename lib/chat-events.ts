import { EventEmitter } from "node:events";
import type { Actor } from "./auth";
import { CHAT_CHANNEL_ACCESS_SQL } from "./chat";

/** Only identifiers travel on the bus; clients fetch content through the access-checked API. */
export type ChatEvent = { channelId: number; messageId: number };

const CHANNEL = "message";

// One emitter per server process, shared by every route bundle.
const globalBus = globalThis as typeof globalThis & { __ijroChatEvents?: EventEmitter };

function bus() {
  if (!globalBus.__ijroChatEvents) {
    globalBus.__ijroChatEvents = new EventEmitter();
    globalBus.__ijroChatEvents.setMaxListeners(0);
  }
  return globalBus.__ijroChatEvents;
}

export function publishChatEvent(event: ChatEvent) {
  bus().emit(CHANNEL, event);
}

export function subscribeChatEvents(listener: (event: ChatEvent) => void) {
  bus().on(CHANNEL, listener);
  return () => {
    bus().off(CHANNEL, listener);
  };
}

/** Accessible channels are re-read at most this often, so department moves and removals apply. */
export const CHAT_ACCESS_REFRESH_MS = 60_000;

/**
 * Per-connection filter: decides whether an event may be forwarded to this actor.
 * Uses the same access predicate as the chat API. Known channels are cached in an
 * allow set and a deny set; an unknown channel costs one query. Both sets are
 * cleared every CHAT_ACCESS_REFRESH_MS.
 */
export function createChatEventFilter(db: D1Database, actor: Pick<Actor, "id" | "departmentId">, now: () => number = Date.now) {
  let allowed = new Set<number>();
  let denied = new Set<number>();
  let loadedAt = -Infinity;

  async function reload() {
    const rows = await db.prepare(
      `SELECT c.id FROM app_chat_channels c WHERE c.active=1 AND ${CHAT_CHANNEL_ACCESS_SQL}`,
    ).bind(actor.departmentId, actor.id).all<{ id: number }>();
    allowed = new Set(rows.results.map((row) => Number(row.id)));
    denied = new Set();
    loadedAt = now();
  }

  return async function mayReceive(event: ChatEvent) {
    if (now() - loadedAt >= CHAT_ACCESS_REFRESH_MS) await reload();
    if (allowed.has(event.channelId)) return true;
    if (denied.has(event.channelId)) return false;
    const row = await db.prepare(
      `SELECT c.id FROM app_chat_channels c WHERE c.id=? AND c.active=1 AND ${CHAT_CHANNEL_ACCESS_SQL} LIMIT 1`,
    ).bind(event.channelId, actor.departmentId, actor.id).first();
    (row ? allowed : denied).add(event.channelId);
    return Boolean(row);
  };
}
