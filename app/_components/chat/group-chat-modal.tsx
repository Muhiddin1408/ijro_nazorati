"use client";

import { Check, CircleAlert, Plus, RefreshCw, Search, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../lib/i18n";
import { readJson } from "../../../lib/shared/http";
import { OrganizationCascadePicker, defaultDirectoryOrganizationId, ModalFrame } from "../../dashboard-kit";
import { avatarColor, initials } from "../../ui-helpers";
import { useDashboard, useNotify } from "../dashboard/dashboard-context";
import type { ChatChannel, ChatDepartment, ChatDirectoryEmployee, ChatOrganization } from "./chat-types";

/** Group creation: pick members through the organization cascade or name search. */
export function GroupChatModal({
  organizations,
  departments,
  onClose,
  onCreated,
}: {
  organizations: ChatOrganization[];
  departments: ChatDepartment[];
  onClose: () => void;
  onCreated: (channel: ChatChannel) => Promise<void>;
}) {
  const { actor } = useDashboard();
  const { t, tx } = useI18n();
  const notify = useNotify();
  const [name, setName] = useState("");
  const [organizationId, setOrganizationId] = useState(() => defaultDirectoryOrganizationId(organizations));
  const [departmentId, setDepartmentId] = useState("all");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ChatDirectoryEmployee[]>([]);
  const [selected, setSelected] = useState<ChatDirectoryEmployee[]>([]);
  const [searching, setSearching] = useState(false);
  const [directoryError, setDirectoryError] = useState("");
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const visibleDepartments =
    organizationId === "all"
      ? []
      : departments.filter((department) => department.organizationId === Number(organizationId));
  const selectedIds = useMemo(() => new Set(selected.map((employee) => employee.id)), [selected]);
  const searchActive = query.trim().length >= 1 || organizationId !== "all" || departmentId !== "all";

  const loadGroupDirectory = useCallback(
    async (cursor = 0, append = false, signal?: AbortSignal) => {
      const params = new URLSearchParams({ scope: "chat", limit: "60" });
      if (query.trim()) params.set("q", query.trim());
      if (organizationId !== "all") params.set("organizationId", organizationId);
      if (departmentId !== "all") params.set("departmentId", departmentId);
      if (cursor) params.set("cursor", String(cursor));
      setSearching(true);
      setDirectoryError("");
      if (!append) setResults([]);
      try {
        const payload = await readJson<{ employees: ChatDirectoryEmployee[]; nextCursor: number | null }>(
          await fetch(`/api/directory?${params}`, { signal, cache: "no-store" }),
        );
        setResults((current) => {
          const combined = append ? [...current, ...payload.employees] : payload.employees;
          return combined.filter(
            (employee, index, rows) =>
              employee.id !== actor.id && rows.findIndex((item) => item.id === employee.id) === index,
          );
        });
        setNextCursor(payload.nextCursor);
      } catch (error) {
        if (!signal?.aborted) {
          if (!append) setResults([]);
          setDirectoryError(error instanceof Error ? error.message : "Xodimlar ro‘yxati yuklanmadi");
        }
      } finally {
        if (!signal?.aborted) setSearching(false);
      }
    },
    [actor.id, departmentId, organizationId, query],
  );

  useEffect(() => {
    if (!searchActive) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadGroupDirectory(0, false, controller.signal);
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadGroupDirectory, searchActive]);

  function toggle(employee: ChatDirectoryEmployee) {
    setSelected((current) =>
      current.some((item) => item.id === employee.id)
        ? current.filter((item) => item.id !== employee.id)
        : current.length >= 249
          ? current
          : [...current, employee],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 3) {
      notify("Guruh nomini kiriting", "error");
      return;
    }
    if (!selected.length) {
      notify("Kamida bitta a’zo tanlang", "error");
      return;
    }
    try {
      setBusy(true);
      const result = await readJson<{ channelId: number; channel: ChatChannel }>(
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "createGroup", name, memberIds: selected.map((employee) => employee.id) }),
        }),
      );
      await onCreated(result.channel);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Guruh yaratilmadi", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalFrame onClose={onClose} wide>
      <form className="modal-form group-chat-modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <span>{t("KORPORATIV MULOQOT")}</span>
            <h2>{t("Yangi guruh yaratish")}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label={t("Yopish")}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-scroll">
          <label className="group-name-field">
            <span>{t("Guruh nomi")} *</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={3}
              maxLength={100}
              required
              placeholder={t("Masalan: 2026-yil yo‘l dasturi ishchi guruhi")}
              autoFocus
            />
          </label>
          <div className="group-member-heading">
            <div>
              <strong>{t("A’zolarni tanlang")}</strong>
              <small>{t("Tuzilma bo‘yicha bosqichma-bosqich tanlang yoki F.I.Sh. orqali qidiring.")}</small>
            </div>
            <span>{t("{count} a’zo", { count: selected.length + 1 })}</span>
          </div>
          <div className="group-directory-filters">
            <OrganizationCascadePicker
              organizations={organizations}
              value={organizationId}
              onChange={(next) => {
                setOrganizationId(next);
                setDepartmentId("all");
              }}
              ariaLabel={t("Guruh uchun tashkilot")}
            />
            <label>
              <Users size={15} />
              <select
                aria-label={t("Guruh uchun bo‘lim")}
                value={departmentId}
                disabled={organizationId === "all"}
                onChange={(event) => setDepartmentId(event.target.value)}
              >
                <option value="all">
                  {organizationId === "all" ? t("Avval tashkilotni tanlang") : t("Barcha bo‘limlar")}
                </option>
                {visibleDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {tx(department.name)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <Search size={15} />
              <input
                aria-label={t("Guruh a’zosini qidirish")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("F.I.Sh. yoki lavozim…")}
              />
            </label>
          </div>
          <div className="group-selected-members">
            <span className="group-owner-chip">
              <ShieldCheck size={13} /> {tx(actor.name)} · {t("guruh egasi")}
            </span>
            {selected.map((employee) => (
              <button type="button" key={employee.id} onClick={() => toggle(employee)}>
                <span className={`person-avatar ${avatarColor(employee.id)}`}>{initials(employee.name)}</span>
                <span>{tx(employee.name)}</span>
                <X size={13} />
              </button>
            ))}
          </div>
          <div className="group-directory-results">
            {!searchActive ? (
              <div className="group-search-hint">
                <Search size={23} />
                <strong>{t("Xodimlarni qidiring")}</strong>
                <span>{t("Tashkilot yoki bo‘limni tanlang, yoxud F.I.Sh. bo‘yicha qidiring.")}</span>
              </div>
            ) : null}
            {searchActive && searching && !results.length ? (
              <div className="group-search-hint">
                <RefreshCw className="spin" size={22} />
                <span>{t("Qidirilmoqda…")}</span>
              </div>
            ) : null}
            {searchActive
              ? results.map((employee) => (
                  <button
                    type="button"
                    className={selectedIds.has(employee.id) ? "selected" : ""}
                    key={employee.id}
                    onClick={() => toggle(employee)}
                  >
                    <span className={`person-avatar ${avatarColor(employee.id)}`}>{initials(employee.name)}</span>
                    <span>
                      <strong>{tx(employee.name)}</strong>
                      <small>
                        {tx(employee.position)} · {tx(employee.department || employee.organization)}
                      </small>
                    </span>
                    <span className="group-member-check">
                      {selectedIds.has(employee.id) ? <Check size={15} /> : <Plus size={15} />}
                    </span>
                  </button>
                ))
              : null}
            {directoryError ? (
              <div className="group-search-hint error">
                <CircleAlert size={22} />
                <strong>{t("Xodimlar yuklanmadi")}</strong>
                <span>{t(directoryError)}</span>
                <button type="button" onClick={() => void loadGroupDirectory()}>
                  {t("Qayta urinish")}
                </button>
              </div>
            ) : null}
            {searchActive && !searching && !results.length && !directoryError ? (
              <div className="group-search-hint">
                <Users size={22} />
                <span>
                  {t("Tanlangan kesimda faol xodim topilmadi. Admin ushbu shtatga xodim biriktirishi kerak.")}
                </span>
              </div>
            ) : null}
            {results.length ? (
              <div className="group-results-actions">
                <button
                  type="button"
                  onClick={() =>
                    setSelected((current) =>
                      [
                        ...current,
                        ...results.filter((employee) => !current.some((item) => item.id === employee.id)),
                      ].slice(0, 249),
                    )
                  }
                >
                  <Check size={14} /> {t("Ko‘rinayotganlarni tanlash")}
                </button>
                {nextCursor ? (
                  <button type="button" disabled={searching} onClick={() => void loadGroupDirectory(nextCursor, true)}>
                    <RefreshCw size={14} className={searching ? "spin" : ""} /> {t("Yana ko‘rsatish")}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            {t("Bekor qilish")}
          </button>
          <button className="primary-button" disabled={busy || selected.length === 0}>
            <UserPlus size={17} />
            {busy ? t("Yaratilmoqda…") : t("Guruh yaratish ({count})", { count: selected.length + 1 })}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}
