import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale } from "../lib/i18n/core";
import { loadInitialBootstrap } from "../services/bootstrap";
import type { BootstrapPayload } from "./_components/dashboard/dashboard-types";
import Dashboard from "./dashboard";

// Reads the session cookie; every request renders fresh.
export const dynamic = "force-dynamic";

export default async function Home() {
  // The first screen's data is resolved on the server, so the browser renders
  // it (or the login screen) without waiting for a separate /api/bootstrap call.
  const [initial, cookieStore] = await Promise.all([loadInitialBootstrap(), cookies()]);
  const initialLocale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value) ?? undefined;
  return (
    <Dashboard
      identity={null}
      initialSession={initial.session}
      // Same JSON the API returns; the client type is a narrower view of the server Actor.
      initialData={initial.session === "ok" ? (initial.payload as unknown as BootstrapPayload) : null}
      initialEtag={initial.session === "ok" ? initial.etag : null}
      initialLocale={initialLocale}
    />
  );
}
