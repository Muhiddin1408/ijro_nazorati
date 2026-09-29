"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readJson, SessionExpiredError } from "../../../lib/shared/http";
import type { ChatChannel, ChatMessage, ChatNotify } from "./chat-types";

/**
 * Channel list, the open channel's messages and the live connection (SSE with
 * polling fallback). Content is always fetched through the access-checked API;
 * the stream only says which channel changed.
 */
export function useChatFeed(notify: ChatNotify) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [channelsBusy, setChannelsBusy] = useState(true);
  const [channelsError, setChannelsError] = useState("");
  const [broadcastAllowed, setBroadcastAllowed] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const latestMessageId = useRef(0);
  const lastMarkedReadId = useRef(0);
  const selectedChannelId = useRef<number | null>(null);
  const channelRefreshPromise = useRef<Promise<ChatChannel[]> | null>(null);
  const messageRequestsInFlight = useRef(new Set<number>());
  // Channels whose refresh was requested while a request was already running.
  const messageRefreshQueued = useRef(new Set<number>());
  // True while the live event stream works; otherwise the page falls back to slow polling.
  const [streamHealthy, setStreamHealthy] = useState(true);
  // Set between a stream error and the next successful (re)connection.
  const [streamReconnecting, setStreamReconnecting] = useState(false);
  // Last background refresh failure; cleared by the next successful refresh.
  const [backgroundError, setBackgroundError] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Background refreshes retry on their own schedule; failures surface as a
  // small inline notice, and an expired session returns the user to login.
  const onBackgroundError = useCallback((error: unknown) => {
    if (error instanceof SessionExpiredError) {
      window.location.reload();
      return;
    }
    if (error instanceof DOMException && error.name === "AbortError") return;
    setBackgroundError(error instanceof Error ? error.message : "Aloqa uzildi");
  }, []);

  const refreshChannels = useCallback(async (force = false) => {
    if (channelRefreshPromise.current) {
      try {
        await channelRefreshPromise.current;
      } catch {
        // A forced refresh below retries a failed or stale request immediately.
      }
      if (!force) return;
    }
    setChannelsBusy(true);
    setChannelsError("");
    const request = (async () => {
      const result = await readJson<{ channels: ChatChannel[]; canPostToBroadcast?: boolean }>(
        await fetch("/api/chat", { cache: "no-store" }),
      );
      setChannels(result.channels);
      setBackgroundError("");
      setBroadcastAllowed(Boolean(result.canPostToBroadcast));
      setSelectedId((current) => current ?? result.channels[0]?.id ?? null);
      return result.channels;
    })();
    channelRefreshPromise.current = request;
    try {
      await request;
    } catch (error) {
      setChannelsError(error instanceof Error ? error.message : "Suhbatlar yuklanmadi");
      throw error;
    } finally {
      if (channelRefreshPromise.current === request) {
        channelRefreshPromise.current = null;
        setChannelsBusy(false);
      }
    }
  }, []);

  const refreshMessages = useCallback(async (channelId: number, reset = false, signal?: AbortSignal): Promise<void> => {
    if (!reset && messageRequestsInFlight.current.has(channelId)) {
      messageRefreshQueued.current.add(channelId);
      return;
    }
    messageRequestsInFlight.current.add(channelId);
    let replace = reset;
    try {
      // Re-run while refreshes were requested during the previous fetch, so no pushed message is missed.
      do {
        messageRefreshQueued.current.delete(channelId);
        const since = replace ? 0 : latestMessageId.current;
        const response = await fetch(`/api/chat?channelId=${channelId}&since=${since}`, { cache: "no-store", signal });
        // 204: nothing newer than `since`.
        const result =
          response.status === 204
            ? { messages: [] as ChatMessage[] }
            : await readJson<{ messages: ChatMessage[] }>(response);
        if (selectedChannelId.current !== channelId) return;
        setBackgroundError("");
        const last = result.messages.at(-1)?.id ?? 0;
        if (last > 0) latestMessageId.current = Math.max(latestMessageId.current, last);
        const replaceAll = replace;
        setMessages((current) => {
          if (replaceAll) return result.messages;
          const known = new Set(current.map((message) => message.id));
          return [...current, ...result.messages.filter((message) => !known.has(message.id))].slice(-250);
        });
        replace = false;
        if (last > lastMarkedReadId.current) {
          lastMarkedReadId.current = last;
          setChannels((current) =>
            current.map((channel) => (channel.id === channelId ? { ...channel, unreadCount: 0 } : channel)),
          );
          void fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "markRead", channelId, messageId: last }),
          });
        }
      } while (messageRefreshQueued.current.has(channelId) && selectedChannelId.current === channelId);
    } finally {
      messageRequestsInFlight.current.delete(channelId);
      messageRefreshQueued.current.delete(channelId);
    }
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => {
      void refreshChannels().catch((error) =>
        error instanceof SessionExpiredError
          ? onBackgroundError(error)
          : notify(error instanceof Error ? error.message : "Suhbatlar yuklanmadi", "error"),
      );
    }, 0);
    const interval = window.setInterval(
      () => {
        if (!document.hidden) void refreshChannels().catch(onBackgroundError);
      },
      streamHealthy ? 120_000 : 30_000,
    );
    const onVisible = () => {
      if (!document.hidden) void refreshChannels().catch(onBackgroundError);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [notify, onBackgroundError, refreshChannels, streamHealthy]);

  useEffect(() => {
    selectedChannelId.current = selectedId;
    latestMessageId.current = 0;
    lastMarkedReadId.current = 0;
    if (!selectedId) return;
    const controller = new AbortController();
    const start = window.setTimeout(() => {
      setMessages([]);
      void refreshMessages(selectedId, true, controller.signal).catch((error) => {
        if (error instanceof SessionExpiredError) onBackgroundError(error);
        else if (!controller.signal.aborted)
          notify(error instanceof Error ? error.message : "Xabarlar yuklanmadi", "error");
      });
    }, 0);
    const interval = streamHealthy
      ? null
      : window.setInterval(() => {
          if (!document.hidden) void refreshMessages(selectedId).catch(onBackgroundError);
        }, 30_000);
    const onVisible = () => {
      if (!document.hidden) void refreshMessages(selectedId).catch(onBackgroundError);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      controller.abort();
      window.clearTimeout(start);
      if (interval != null) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [notify, onBackgroundError, refreshMessages, selectedId, streamHealthy]);

  // Live updates: the server pushes { channelId, messageId }; content is then
  // fetched incrementally through the access-checked API. The stream is closed
  // while the tab is hidden. After repeated failures the page falls back to polling.
  useEffect(() => {
    if (typeof EventSource === "undefined") {
      const fallback = window.setTimeout(() => setStreamHealthy(false), 0);
      return () => window.clearTimeout(fallback);
    }
    let source: EventSource | null = null;
    let failures = 0;
    let channelTimer: number | undefined;
    let retryTimer: number | undefined;
    const scheduleChannelRefresh = () => {
      window.clearTimeout(channelTimer);
      channelTimer = window.setTimeout(() => void refreshChannels(true).catch(onBackgroundError), 1_500);
    };
    const open = () => {
      if (source || document.hidden) return;
      source = new EventSource("/api/chat/stream");
      source.onopen = () => {
        failures = 0;
        setStreamHealthy(true);
        setStreamReconnecting(false);
      };
      source.addEventListener("message", (event) => {
        try {
          const data = JSON.parse((event as MessageEvent<string>).data) as { channelId: number; messageId: number };
          if (data.channelId === selectedChannelId.current && data.messageId > latestMessageId.current) {
            void refreshMessages(data.channelId).catch(onBackgroundError);
          }
          scheduleChannelRefresh();
        } catch {
          // Ignore malformed events.
        }
      });
      source.onerror = () => {
        failures += 1;
        setStreamReconnecting(true);
        if (failures >= 3) {
          // Stop hammering a broken stream; poll slowly and retry the stream later.
          close();
          setStreamHealthy(false);
          window.clearTimeout(retryTimer);
          retryTimer = window.setTimeout(() => {
            failures = 0;
            open();
          }, 120_000);
        }
      };
    };
    const close = () => {
      source?.close();
      source = null;
    };
    const onVisibility = () => {
      if (document.hidden) {
        close();
        return;
      }
      open();
      // Catch up on anything sent while the stream was closed.
      if (selectedChannelId.current) void refreshMessages(selectedChannelId.current).catch(onBackgroundError);
      scheduleChannelRefresh();
    };
    open();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(channelTimer);
      window.clearTimeout(retryTimer);
      close();
    };
  }, [onBackgroundError, refreshChannels, refreshMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, selectedId]);

  /** Replaces an optimistic message with the stored one and advances the incremental cursor. */
  const acceptSentMessage = useCallback((temporaryId: number, message: ChatMessage) => {
    latestMessageId.current = Math.max(latestMessageId.current, message.id);
    setMessages((current) => {
      const withoutTemporary = current.filter((item) => item.id !== temporaryId);
      const existing = withoutTemporary.findIndex((item) => item.id === message.id);
      if (existing === -1) return [...withoutTemporary, message].slice(-250);
      return withoutTemporary.map((item) => (item.id === message.id ? message : item));
    });
  }, []);

  return {
    channels,
    setChannels,
    channelsBusy,
    channelsError,
    broadcastAllowed,
    selectedId,
    setSelectedId,
    messages,
    setMessages,
    acceptSentMessage,
    streamHealthy,
    streamReconnecting,
    backgroundError,
    onBackgroundError,
    refreshChannels,
    messageEndRef,
  };
}
