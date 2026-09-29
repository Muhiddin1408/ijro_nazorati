"use client";

import { useCallback, useEffect, useState } from "react";
import { readJson } from "../../../lib/shared/http";
import { defaultDirectoryOrganizationId } from "../../dashboard-kit";
import type { ChatDepartment, ChatDirectoryEmployee, ChatOrganization } from "./chat-types";

/** Directory search for starting a direct conversation (organization → department → name). */
export function useChatContacts(actorId: number, organizations: ChatOrganization[], departments: ChatDepartment[]) {
  const [directSearch, setDirectSearch] = useState("");
  const [directoryOrganization, setDirectoryOrganization] = useState(() =>
    defaultDirectoryOrganizationId(organizations),
  );
  const [directoryDepartment, setDirectoryDepartment] = useState("all");
  const [contacts, setContacts] = useState<ChatDirectoryEmployee[]>([]);
  const [contactsBusy, setContactsBusy] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [contactsCursor, setContactsCursor] = useState<number | null>(null);
  const directoryDepartments =
    directoryOrganization === "all"
      ? []
      : departments.filter((department) => department.organizationId === Number(directoryOrganization));
  const directorySearchActive =
    directSearch.trim().length >= 1 || directoryOrganization !== "all" || directoryDepartment !== "all";
  const displayedContacts = directorySearchActive ? contacts : [];

  const loadContacts = useCallback(
    async (cursor = 0, append = false, signal?: AbortSignal) => {
      const normalized = directSearch.trim();
      const params = new URLSearchParams({ scope: "chat", limit: "50" });
      if (normalized) params.set("q", normalized);
      if (directoryOrganization !== "all") params.set("organizationId", directoryOrganization);
      if (directoryDepartment !== "all") params.set("departmentId", directoryDepartment);
      if (cursor) params.set("cursor", String(cursor));
      setContactsBusy(true);
      setContactsError("");
      if (!append) setContacts([]);
      try {
        const result = await readJson<{ employees: ChatDirectoryEmployee[]; nextCursor: number | null }>(
          await fetch(`/api/directory?${params}`, { signal, cache: "no-store" }),
        );
        setContacts((current) => {
          const combined = append ? [...current, ...result.employees] : result.employees;
          return combined.filter(
            (employee, index, rows) =>
              employee.id !== actorId && rows.findIndex((item) => item.id === employee.id) === index,
          );
        });
        setContactsCursor(result.nextCursor);
      } catch (error) {
        if (!signal?.aborted) {
          if (!append) setContacts([]);
          setContactsError(error instanceof Error ? error.message : "Xodimlar ro‘yxati yuklanmadi");
        }
      } finally {
        if (!signal?.aborted) setContactsBusy(false);
      }
    },
    [actorId, directSearch, directoryDepartment, directoryOrganization],
  );

  useEffect(() => {
    if (!directorySearchActive) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadContacts(0, false, controller.signal);
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [directorySearchActive, loadContacts]);

  return {
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
  };
}
