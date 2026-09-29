import { getD1 } from "../../../db";
import { ApiError, apiError, assertSameOrigin, audit, requireActor } from "../../../lib/auth";
import { runInBackground } from "../../../lib/background";
import { publishChatEvent } from "../../../lib/chat-events";
import { authorize } from "../../../lib/policy";
import {
  canPostToBroadcast,
  chatChannelView,
  chatDirectOpen,
  chatGroupManage,
  chatPost,
} from "../../../lib/policy/chat";
import { enqueueChatNotifications, processNotificationJobs } from "../../../lib/telegram";
import {
  allEmployeesAreActive,
  chatSendCounts,
  createChatGroup,
  ensureDefaultChatChannels,
  findActiveEmployee,
  listChannelMessages,
  listChatChannels,
  loadVisibleChatChannel,
  markChatRead,
  openDirectChat,
  sendChatMessage,
} from "../../../services/chat";

const NO_STORE = { "Cache-Control": "private, no-store", Vary: "Cookie" };

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const db = await getD1();
    await ensureDefaultChatChannels(db, actor);
    const url = new URL(request.url);
    const channelId = Number(url.searchParams.get("channelId"));
    // `since` (preferred) and the older `afterId` both mean "messages newer than this id".
    const since = Number(url.searchParams.get("since") ?? url.searchParams.get("afterId") ?? 0);
    const afterId = Number.isSafeInteger(since) && since > 0 ? since : 0;
    if (channelId) {
      const channel = await loadVisibleChatChannel(db, actor, channelId);
      await authorize(chatChannelView(channel));
      const messages = await listChannelMessages(db, channelId, afterId);
      // Nothing new since the client's last message: an empty 204 keeps polling cheap.
      if (afterId > 0 && !messages.length) return new Response(null, { status: 204, headers: NO_STORE });
      return Response.json({ messages }, { headers: NO_STORE });
    }
    return Response.json(
      {
        canPostToBroadcast: canPostToBroadcast(actor),
        channels: await listChatChannels(db, actor),
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const payload = (await request.json()) as Record<string, unknown>;
    const action = String(payload.action ?? "send");
    const db = await getD1();

    if (action === "createGroup") {
      const name = String(payload.name ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 100);
      const requestedIds = Array.isArray(payload.memberIds) ? payload.memberIds : [];
      const memberIds = [
        ...new Set(requestedIds.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0 && id !== actor.id)),
      ];
      if (name.length < 3) throw new ApiError(400, "Guruh nomi kamida 3 belgidan iborat bo‘lsin");
      const withinLimits = memberIds.length > 0 && memberIds.length < 250;
      await authorize(
        chatGroupManage(actor, {
          memberIds,
          allMembersActive: withinLimits ? await allEmployeesAreActive(db, memberIds) : true,
        }),
      );
      const channel = await createChatGroup(db, actor.id, name, memberIds);
      await audit(actor, "chat.group_created", "chat_channel", channel.id, { name, memberCount: channel.memberCount });
      return Response.json({ channelId: channel.id, channel }, { status: 201 });
    }

    if (action === "openDirect") {
      const employeeId = Number(payload.employeeId);
      const employee = employeeId && employeeId !== actor.id ? await findActiveEmployee(db, employeeId) : null;
      await authorize(chatDirectOpen(actor, employeeId, employee));
      const channel = await openDirectChat(db, actor.id, employee!);
      return Response.json({ channelId: channel.id, channel });
    }

    const channelId = Number(payload.channelId);
    const channel = await loadVisibleChatChannel(db, actor, channelId);
    await authorize(chatChannelView(channel));

    if (action === "markRead") {
      await markChatRead(db, actor.id, channelId, Number(payload.messageId));
      return Response.json({ ok: true });
    }

    const body = String(payload.body ?? "").trim();
    if (!body || body.length > 5000)
      return Response.json({ error: "Xabar 1–5000 belgidan iborat bo‘lsin" }, { status: 400 });
    await authorize(chatPost(actor, channel, await chatSendCounts(db, actor.id)));
    const visible = channel!;
    const replyToMessageId = payload.replyToMessageId ? Number(payload.replyToMessageId) : null;
    const message = await sendChatMessage(db, actor.id, visible, { body, replyToMessageId });
    if (visible.type === "broadcast")
      await audit(actor, "chat.broadcast_sent", "chat_message", message.messageId, { channelId });
    publishChatEvent({ channelId, messageId: message.messageId });
    runInBackground(async () => {
      await enqueueChatNotifications({
        messageId: message.messageId,
        channelId,
        senderEmployeeId: actor.id,
        senderName: actor.name,
        channelName: visible.type === "direct" ? "Shaxsiy suhbat" : visible.name || "Muloqot",
        body,
      });
      await processNotificationJobs(100);
    });
    return Response.json(
      {
        message: {
          id: message.messageId,
          channelId,
          sender: { id: actor.id, name: actor.name, position: actor.position },
          type: message.type,
          body,
          createdAt: message.createdAt,
          attachments: [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
