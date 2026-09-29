"use client";

import { CircleAlert, MessageCircle, Megaphone, Plus, RefreshCw, Search, UserPlus, Users } from "lucide-react";
import { useI18n } from "../../../lib/i18n";
import { OrganizationCascadePicker } from "../../dashboard-kit";
import { avatarColor, initials } from "../../ui-helpers";
import type { ChatOrganization } from "./chat-types";
import type { useChatContacts } from "./use-chat-contacts";
import type { useChatFeed } from "./use-chat-feed";

type Feed = ReturnType<typeof useChatFeed>;
type Contacts = ReturnType<typeof useChatContacts>;

/** Conversation list plus the directory for opening a direct chat. */
export function ChatSidebar({
  feed,
  contacts,
  organizations,
  onSelect,
  onOpenDirect,
  onCreateGroup,
}: {
  feed: Pick<Feed, "channels" | "selectedId" | "channelsBusy" | "channelsError" | "refreshChannels">;
  contacts: Contacts;
  organizations: ChatOrganization[];
  onSelect: (channelId: number) => void;
  onOpenDirect: (employeeId: number) => Promise<void>;
  onCreateGroup: () => void;
}) {
  const { t, tx } = useI18n();
  const { channels, selectedId, channelsBusy, channelsError, refreshChannels } = feed;
  const {
    directSearch,
    setDirectSearch,
    directoryOrganization,
    setDirectoryOrganization,
    directoryDepartment,
    setDirectoryDepartment,
    directoryDepartments,
    directorySearchActive,
    displayedContacts,
    contactsBusy,
    contactsError,
    contactsCursor,
    loadContacts,
  } = contacts;
  return (
    <aside className="chat-sidebar panel">
      <div className="chat-sidebar-head">
        <div>
          <h3>{t("Suhbatlar")}</h3>
          <span>{t("{count} yangi", { count: channels.reduce((sum, channel) => sum + channel.unreadCount, 0) })}</span>
        </div>
        <button type="button" onClick={() => onCreateGroup()}>
          <UserPlus size={15} /> {t("Guruh yaratish")}
        </button>
      </div>
      <div className="chat-channel-list">
        {channels.map((channel) => (
          <button
            key={channel.id}
            className={selectedId === channel.id ? "active" : ""}
            onClick={() => onSelect(channel.id)}
          >
            <span className={`chat-channel-icon ${channel.type}`}>
              {channel.type === "broadcast" ? (
                <Megaphone size={18} />
              ) : ["department", "group"].includes(channel.type) ? (
                <Users size={18} />
              ) : (
                <MessageCircle size={18} />
              )}
            </span>
            <span>
              <strong>{tx(channel.name)}</strong>
              <small>
                {channel.lastMessage ||
                  (channel.type === "broadcast"
                    ? t("Barcha xodimlarga e’lon")
                    : channel.type === "group"
                      ? t("{count} a’zoli guruh", { count: channel.memberCount })
                      : t("Yangi suhbat"))}
              </small>
            </span>
            {channel.unreadCount ? <em>{channel.unreadCount}</em> : null}
          </button>
        ))}
        {channelsBusy && !channels.length ? (
          <div className="chat-directory-hint" role="status">
            <RefreshCw size={14} className="spin" /> {t("Suhbatlar yuklanmoqda…")}
          </div>
        ) : null}
        {channelsError ? (
          <div className="chat-directory-hint error" role="alert">
            <CircleAlert size={14} />
            {t(channelsError)}
            <button type="button" onClick={() => void refreshChannels(true)}>
              {t("Qayta urinish")}
            </button>
          </div>
        ) : null}
      </div>
      <div className="chat-contacts">
        <div className="chat-directory-filters">
          <OrganizationCascadePicker
            organizations={organizations}
            value={directoryOrganization}
            onChange={(next) => {
              setDirectoryOrganization(next);
              setDirectoryDepartment("all");
            }}
            ariaLabel={t("Suhbat uchun tashkilot")}
          />
          <label>
            <Users size={15} />
            <select
              aria-label={t("Suhbat uchun bo‘lim")}
              value={directoryDepartment}
              disabled={directoryOrganization === "all"}
              onChange={(event) => setDirectoryDepartment(event.target.value)}
            >
              <option value="all">
                {directoryOrganization === "all" ? t("Avval tashkilotni tanlang") : t("Barcha bo‘limlar")}
              </option>
              {directoryDepartments.map((department) => (
                <option key={department.id} value={department.id}>
                  {tx(department.name)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          <Search size={16} />
          <input
            aria-label={t("Suhbatdoshni qidirish")}
            value={directSearch}
            onChange={(event) => setDirectSearch(event.target.value)}
            placeholder={t("F.I.Sh. yoki lavozim bo‘yicha qidiring...")}
          />
        </label>
        <div>
          {displayedContacts.map((employee) => (
            <button key={employee.id} onClick={() => void onOpenDirect(employee.id)}>
              <span className={`person-avatar ${avatarColor(employee.id)}`}>{initials(employee.name)}</span>
              <span>
                <strong>{tx(employee.name)}</strong>
                <small>{tx(employee.department)}</small>
              </span>
              <Plus size={15} />
            </button>
          ))}
          {!displayedContacts.length && !contactsError ? (
            <small className="chat-directory-hint">
              {directorySearchActive && contactsBusy
                ? t("Qidirilmoqda...")
                : t("Tanlangan kesimda faol xodim topilmadi.")}
            </small>
          ) : null}
          {contactsError ? (
            <small className="chat-directory-hint error">
              <CircleAlert size={14} />
              {t(contactsError)}
              <button type="button" onClick={() => void loadContacts()}>
                {t("Qayta urinish")}
              </button>
            </small>
          ) : null}
          {contactsCursor ? (
            <button
              type="button"
              className="chat-directory-more"
              disabled={contactsBusy}
              onClick={() => void loadContacts(contactsCursor, true)}
            >
              <RefreshCw size={14} className={contactsBusy ? "spin" : ""} /> {t("Yana ko‘rsatish")}
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
