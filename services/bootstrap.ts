import { getD1 } from "../db";
import { ApiError, requireActor, type Actor } from "../lib/auth";
import { birthdayKeysFor, todaysBirthdays } from "../lib/birthdays";
import { listAuditLogs, listMeetingsPage, listTasksPage } from "../lib/data";
import { etagFor } from "../lib/shared/etag";
import { telegramStatus } from "../lib/telegram";

/**
 * First-screen payload only: actor, small reference lists and the first page of
 * tasks and meetings. The employee directory (/api/bootstrap/employees), the
 * organization/department structure (/api/bootstrap/structure) and the audit
 * journal (/api/admin/audit) load on demand.
 *
 * Shared by GET /api/bootstrap and the server-rendered page (app/page.tsx).
 */
export async function buildBootstrap(actor: Actor) {
  const db = await getD1();
  if (actor.mustChangePassword) {
    return {
      actor,
      tasks: [],
      meetings: [],
      roles: [],
      topics: [],
      integrations: [],
      counters: { latestAuditAt: null },
      lists: { tasksHasMore: false, meetingsHasMore: false },
      telegram: { configured: false, botUsername: null, linkedEmployees: 0, pendingJobs: 0 },
      birthdays: { date: birthdayKeysFor().date, mine: false, people: [] },
    };
  }
  const [tasksPage, meetingsPage, latestAudit, rolesResult, topicsResult, integrationsResult, telegram, birthdays] =
    await Promise.all([
      listTasksPage(actor),
      listMeetingsPage(actor),
      actor.permissions.canViewAudit
        ? listAuditLogs(actor, { limit: 1 })
        : Promise.resolve({ items: [] as Array<{ createdAt: string }>, hasMore: false, nextOffset: null }),
      db.prepare("SELECT * FROM app_roles ORDER BY level, name").all<Record<string, unknown>>(),
      db.prepare("SELECT * FROM app_task_topics ORDER BY active DESC, name").all<Record<string, unknown>>(),
      actor.permissions.canConfigure || actor.roleCode === "rahbar"
        ? db
            .prepare(
              "SELECT id,code,name,category,status,enabled,last_sync_at FROM app_integration_connectors ORDER BY id",
            )
            .all<Record<string, unknown>>()
        : Promise.resolve({ results: [] as Record<string, unknown>[] }),
      actor.permissions.canConfigure
        ? telegramStatus()
        : Promise.resolve({ configured: false, botUsername: null, linkedEmployees: 0, pendingJobs: 0 }),
      todaysBirthdays(actor),
    ]);
  return {
    actor,
    tasks: tasksPage.tasks,
    meetings: meetingsPage.meetings,
    // Every list above is bounded; the UI shows "load more" when a flag is set.
    lists: {
      tasksHasMore: tasksPage.hasMore,
      tasksNextCursor: tasksPage.nextCursor,
      meetingsHasMore: meetingsPage.hasMore,
    },
    // The bell shows a dot only when there is audit activity the viewer has not opened yet.
    counters: { latestAuditAt: latestAudit.items[0]?.createdAt ?? null },
    roles:
      actor.permissions.canManageRoles || actor.permissions.canManageOrganization
        ? rolesResult.results
            .filter((row) => actor.permissions.canManageRoles || String(row.code) === "xodim")
            .map((row) => ({
              id: Number(row.id),
              code: String(row.code),
              name: String(row.name),
              level: Number(row.level),
              permissions: JSON.parse(String(row.permissions_json ?? "{}")),
              isSystem: Boolean(row.is_system),
              active: Boolean(row.active),
            }))
        : [],
    topics: topicsResult.results.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      description: String(row.description ?? ""),
      color: String(row.color ?? "#1957D2"),
      active: Boolean(row.active),
    })),
    integrations: integrationsResult.results.map((row) => ({
      id: Number(row.id),
      code: String(row.code),
      name: String(row.name),
      category: String(row.category),
      status: String(row.status),
      enabled: Boolean(row.enabled),
      lastSyncAt: row.last_sync_at ? String(row.last_sync_at) : null,
    })),
    telegram,
    // Today's birthdays (Tashkent date): the viewer's own opens a greeting page, colleagues' show on the home page.
    birthdays,
  };
}

export type BootstrapResult = Awaited<ReturnType<typeof buildBootstrap>>;

export type InitialBootstrap =
  | { session: "ok"; payload: BootstrapResult; etag: string | null }
  | { session: "anonymous" }
  | { session: "unknown" };

/**
 * Server-side first render: resolves the session from the request cookies.
 * "anonymous" lets the client show the login screen without a failing
 * /api/bootstrap round trip; "unknown" (unexpected error) falls back to the
 * client fetch.
 */
export async function loadInitialBootstrap(): Promise<InitialBootstrap> {
  let actor: Actor;
  try {
    actor = await requireActor({ allowPasswordChangeRequired: true });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return { session: "anonymous" };
    console.error("Initial bootstrap: session check failed", error);
    return { session: "unknown" };
  }
  try {
    // Round-trip through JSON so the RSC payload is exactly what the API would send.
    const text = JSON.stringify(await buildBootstrap(actor));
    const payload = JSON.parse(text) as BootstrapResult;
    // The password-change gate response is never cached by the API either.
    const etag = actor.mustChangePassword ? null : await etagFor(text);
    return { session: "ok", payload, etag };
  } catch (error) {
    console.error("Initial bootstrap failed", error);
    return { session: "unknown" };
  }
}
