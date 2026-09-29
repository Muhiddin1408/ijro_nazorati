"use client";

import { Download, FileText, Megaphone, MessageCircle } from "lucide-react";
import type { RefObject } from "react";
import { useI18n } from "../../../lib/i18n";
import { avatarColor, formatDateTime, humanSize, initials } from "../../ui-helpers";
import type { ChatMessage } from "./chat-types";

/** Messages of the open channel; negative ids are optimistic sends still in flight. */
export function ChatMessageList({
  messages,
  actorId,
  endRef,
}: {
  messages: ChatMessage[];
  actorId: number;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  const { t, tx } = useI18n();
  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <div
          className={`chat-message ${message.sender.id === actorId ? "mine" : ""} ${message.type === "announcement" ? "announcement" : ""} ${message.id < 0 ? "sending" : ""}`}
          key={message.id}
        >
          <span className={`person-avatar ${avatarColor(message.sender.id)}`}>{initials(message.sender.name)}</span>
          <div>
            <div className="message-meta">
              <strong>{message.sender.id === actorId ? t("Siz") : tx(message.sender.name)}</strong>
              <time>{message.id < 0 ? t("Yuborilmoqda...") : formatDateTime(message.createdAt)}</time>
            </div>
            {message.type === "announcement" ? (
              <span className="announcement-label">
                <Megaphone size={13} /> {t("Umumiy e’lon")}
              </span>
            ) : null}
            {/* Message bodies stay as written (they may contain codes, logins or links). */}
            {message.body ? <p data-alphabet-static="true">{message.body}</p> : null}
            {message.attachments.map((attachment) => (
              <div className="chat-file" key={attachment.id}>
                {attachment.contentType.startsWith("image/") ? (
                  <a href={`/api/chat/files?id=${attachment.id}`} target="_blank" rel="noreferrer">
                    {/* Authenticated private media cannot use the public image optimizer. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/chat/files?id=${attachment.id}`} alt={attachment.fileName} loading="lazy" />
                  </a>
                ) : attachment.contentType.startsWith("video/") ? (
                  <video controls preload="metadata" src={`/api/chat/files?id=${attachment.id}`} />
                ) : null}
                <a href={`/api/chat/files?id=${attachment.id}`}>
                  <FileText size={19} />
                  <span>
                    <strong>{attachment.fileName}</strong>
                    <small>{humanSize(attachment.size)}</small>
                  </span>
                  <Download size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
      {messages.length === 0 ? (
        <div className="chat-empty">
          <MessageCircle size={29} />
          <strong>{t("Suhbatni boshlang")}</strong>
          <span>{t("Xabar yoki fayl yuboring.")}</span>
        </div>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}
