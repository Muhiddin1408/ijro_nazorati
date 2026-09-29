"use client";

import { ChevronLeft, CircleAlert, Megaphone, MessageCircle, RefreshCw, Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import { readJson } from "../../../lib/shared/http";
import { useI18n } from "../../../lib/i18n";
import { PageIntro } from "../../dashboard-kit";
import { useOptionalDashboard } from "../dashboard/dashboard-context";
import { ChatComposer } from "./chat-composer";
import { ChatMessageList } from "./chat-message-list";
import { ChatSidebar } from "./chat-sidebar";
import type { ChatActor, ChatChannel, ChatDepartment, ChatMessage, ChatNotify, ChatOrganization } from "./chat-types";
import { GroupChatModal } from "./group-chat-modal";
import { uploadChatFile } from "./upload-chat-file";
import { useChatContacts } from "./use-chat-contacts";
import { useChatFeed } from "./use-chat-feed";

/**
 * Corporate chat. `actor` and `notify` come from the dashboard context; the
 * props remain accepted so existing callers keep working.
 */
export function ChatPage({
  organizations,
  departments,
  ...overrides
}: {
  actor?: ChatActor;
  organizations: ChatOrganization[];
  departments: ChatDepartment[];
  notify?: ChatNotify;
}) {
  const dashboard = useOptionalDashboard();
  const actor = overrides.actor ?? dashboard?.actor;
  const notify = overrides.notify ?? dashboard?.notify;
  if (!actor || !notify) throw new Error("ChatPage needs an actor and notify (props or DashboardProvider)");
  return <ChatWorkspace actor={actor} organizations={organizations} departments={departments} notify={notify} />;
}

function ChatWorkspace({
  actor,
  organizations,
  departments,
  notify,
}: {
  actor: ChatActor;
  organizations: ChatOrganization[];
  departments: ChatDepartment[];
  notify: ChatNotify;
}) {
  const { t, tx } = useI18n();
  const feed = useChatFeed(notify);
  const {
    channels,
    setChannels,
    channelsBusy,
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
  } = feed;
  const contacts = useChatContacts(actor.id, organizations, departments);
  const [file, setFile] = useState<File | null>(null);
  const [pendingSends, setPendingSends] = useState(0);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showChannels, setShowChannels] = useState(true);
  const [groupOpen, setGroupOpen] = useState(false);
  const selected = channels.find((channel) => channel.id === selectedId);

  async function openDirect(employeeId: number) {
    try {
      const result = await readJson<{ channelId: number; channel?: ChatChannel }>(
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "openDirect", employeeId }),
        }),
      );
      if (result.channel) {
        setChannels((current) => [result.channel!, ...current.filter((channel) => channel.id !== result.channel!.id)]);
      } else {
        await refreshChannels(true);
      }
      setSelectedId(result.channelId);
      setShowChannels(false);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Suhbat ochilmadi", "error");
    }
  }

  async function groupCreated(channel: ChatChannel) {
    setChannels((current) => [channel, ...current.filter((item) => item.id !== channel.id)]);
    setSelectedId(channel.id);
    setShowChannels(false);
    setGroupOpen(false);
    notify("Yangi guruh yaratildi");
    void refreshChannels(true).catch(onBackgroundError);
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || !selected) return;
    const form = event.currentTarget;
    const textarea = form.elements.namedItem("body") as HTMLTextAreaElement | null;
    const body = textarea?.value.trim() ?? "";
    const fileToSend = file;
    if (fileToSend && fileUploading) return;
    if (!body && !fileToSend) return;
    const temporaryId = -Date.now();
    const optimistic: ChatMessage = {
      id: temporaryId,
      channelId: selectedId,
      sender: { id: actor.id, name: actor.name, position: actor.position },
      type: selected.type === "broadcast" ? "announcement" : fileToSend ? "file" : "text",
      body,
      createdAt: new Date().toISOString(),
      attachments: [],
    };
    setMessages((current) => [...current, optimistic]);
    form.reset();
    setFile(null);
    setPendingSends((current) => current + 1);
    if (fileToSend) setFileUploading(true);
    setUploadProgress(fileToSend ? 0 : null);
    try {
      const message = fileToSend
        ? await uploadChatFile(fileToSend, selectedId, body, setUploadProgress)
        : (
            await readJson<{ message: ChatMessage }>(
              await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channelId: selectedId, body }),
              }),
            )
          ).message;
      acceptSentMessage(temporaryId, message);
      void refreshChannels(true).catch(onBackgroundError);
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== temporaryId));
      if (textarea) textarea.value = body;
      if (fileToSend) setFile((current) => current ?? fileToSend);
      notify(error instanceof Error ? error.message : "Xabar yuborilmadi", "error");
    } finally {
      setPendingSends((current) => Math.max(0, current - 1));
      if (fileToSend) {
        setFileUploading(false);
        setUploadProgress(null);
      }
    }
  }

  return (
    <section className="module-page chat-page">
      <PageIntro
        kicker={t("KORPORATIV MULOQOT")}
        title={t("Xabarlar va hujjatlar")}
        description={t(
          "Tezkor xabarlar, Telegram nusxasi va 500 MB gacha uzilib qolsa qayta urinadigan bo‘lakli fayl uzatish.",
        )}
      />
      <div className={`chat-shell ${showChannels ? "channels-open" : ""}`}>
        <ChatSidebar
          feed={feed}
          contacts={contacts}
          organizations={organizations}
          onSelect={(channelId) => {
            setChannels((current) =>
              current.map((item) => (item.id === channelId ? { ...item, unreadCount: 0 } : item)),
            );
            setSelectedId(channelId);
            setShowChannels(false);
          }}
          onOpenDirect={openDirect}
          onCreateGroup={() => setGroupOpen(true)}
        />
        <article className="chat-room panel">
          {selected ? (
            <>
              <header className="chat-room-head">
                <button
                  type="button"
                  className="icon-button chat-back"
                  aria-label={t("Suhbatlar ro‘yxatiga qaytish")}
                  onClick={() => setShowChannels(true)}
                >
                  <ChevronLeft size={19} />
                </button>
                <span className={`chat-channel-icon ${selected.type}`}>
                  {selected.type === "broadcast" ? (
                    <Megaphone size={19} />
                  ) : ["department", "group"].includes(selected.type) ? (
                    <Users size={19} />
                  ) : (
                    <MessageCircle size={19} />
                  )}
                </span>
                <div>
                  <h3>{tx(selected.name)}</h3>
                  <small>
                    {selected.type === "broadcast"
                      ? t("Bu xabar barcha xodimlarga va ulangan Telegram hisoblariga boradi")
                      : selected.type === "group"
                        ? t("{count} a’zo · yangi xabar Telegram botda ham ko‘rinadi", { count: selected.memberCount })
                        : t("Yangi xabar Telegram botda ham ko‘rinadi")}
                  </small>
                </div>
                <span className="chat-connection" role="status" aria-live="polite">
                  {!streamHealthy || streamReconnecting ? (
                    <>
                      <RefreshCw size={13} className="spin" />{" "}
                      {streamHealthy ? t("Qayta ulanmoqda…") : t("Qayta ulanmoqda… (yangilanish 30 soniyada)")}
                    </>
                  ) : null}
                </span>
              </header>
              {backgroundError ? (
                <div className="chat-background-error" role="status" aria-live="polite">
                  <CircleAlert size={14} /> {t(backgroundError)}. {t("Avtomatik qayta urinilmoqda.")}
                </div>
              ) : null}
              <ChatMessageList messages={messages} actorId={actor.id} endRef={messageEndRef} />
              {selected.type === "broadcast" && !broadcastAllowed ? (
                <div className="chat-composer chat-readonly" role="note">
                  <Megaphone size={16} />{" "}
                  {t("Umumiy e’lonlar faqat o‘qish uchun. E’lonni rahbariyat va tashkilot administratorlari yuboradi.")}
                </div>
              ) : (
                <ChatComposer
                  broadcast={selected.type === "broadcast"}
                  file={file}
                  setFile={setFile}
                  fileUploading={fileUploading}
                  uploadProgress={uploadProgress}
                  pendingSends={pendingSends}
                  notify={notify}
                  onSubmit={send}
                />
              )}
            </>
          ) : (
            <div className="chat-empty">
              {channelsBusy ? <RefreshCw className="spin" size={30} /> : <MessageCircle size={30} />}
              <strong>{channelsBusy ? t("Suhbatlar yuklanmoqda") : t("Suhbat tanlang")}</strong>
            </div>
          )}
        </article>
      </div>
      {groupOpen ? (
        <GroupChatModal
          organizations={organizations}
          departments={departments}
          onClose={() => setGroupOpen(false)}
          onCreated={groupCreated}
        />
      ) : null}
    </section>
  );
}
