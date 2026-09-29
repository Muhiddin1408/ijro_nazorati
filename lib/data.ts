import { getD1 } from "../db";
import { type Actor } from "./auth";
import { ApiError } from "./errors";
import type { AssignmentRow, AttachmentRow, MeetingRow, TaskRow } from "../services/task-rows";

type DbRow = Record<string, unknown>;

/** Joined rows read by the task and meeting lists. */
type TaskListRow = TaskRow & {
  creator_name: string;
  creator_position: string | null;
  topic_name: string | null;
  topic_color: string | null;
  pinned: number;
  attachments_count: number;
  sort_k1: number;
  sort_k2: number;
  sort_k3: string;
  sort_k4: number;
  sort_k5: string;
  sort_k6: string;
};
type AssignmentListRow = AssignmentRow & { employee_name: string; position: string | null; role_name: string; department: string | null };
type RouteListRow = {
  id: number;
  task_id: number;
  parent_route_id: number | null;
  from_employee_id: number | null;
  to_employee_id: number;
  action: string;
  note: string | null;
  created_at: string;
  from_name: string | null;
  from_role: string | null;
  to_name: string;
  to_role: string;
};
type AttachmentListRow = Omit<AttachmentRow, "object_key">;
type AudienceListRow = { target_type: string; target_id: number; include_descendants: number; target_name: string };
type TaskAudienceListRow = AudienceListRow & { task_id: number };
type MeetingAudienceListRow = AudienceListRow & { meeting_id: number };
type MeetingListRow = MeetingRow & { creator_name: string };
type ParticipantListRow = {
  meeting_id: number;
  employee_id: number;
  response_status: string;
  full_name: string;
  position: string | null;
  department: string | null;
};

function placeholders(values: unknown[]) {
  return values.map(() => "?").join(",");
}

async function queryInChunks<T = DbRow>(
  db: D1Database,
  ids: number[],
  statement: (chunk: number[]) => D1PreparedStatement,
) {
  const results: T[] = [];
  for (let index = 0; index < ids.length; index += 80) {
    const response = await statement(ids.slice(index, index + 80)).all<T>();
    results.push(...response.results);
  }
  return results;
}

function taskScope(actor: Actor) {
  if (actor.permissions.viewScope === "all") return { prefix: "", condition: "t.archived=0", prefixBinds: [] as unknown[], conditionBinds: [] as unknown[] };
  if (actor.permissions.viewScope === "own") return {
    prefix: `WITH RECURSIVE actor_org_ancestors(id) AS (
      SELECT ? UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN actor_org_ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
    )`,
    condition: `t.archived=0 AND (t.created_by_employee_id=? OR EXISTS (
      SELECT 1 FROM app_task_assignments scope_a WHERE scope_a.task_id=t.id AND scope_a.employee_id=?
    ) OR EXISTS (
      SELECT 1 FROM app_task_audiences audience WHERE audience.task_id=t.id AND (
        (audience.target_type='department' AND audience.target_id=?)
        OR (audience.target_type='organization' AND (
          audience.target_id=? OR (audience.include_descendants=1 AND audience.target_id IN (SELECT id FROM actor_org_ancestors))
        ))
      )
    ))`,
    prefixBinds: [actor.organizationId ?? -1] as unknown[],
    conditionBinds: [actor.id, actor.id, actor.departmentId ?? -1, actor.organizationId ?? -1] as unknown[],
  };
  if (actor.permissions.viewScope === "department") return {
    prefix: `WITH RECURSIVE actor_org_ancestors(id) AS (
      SELECT ? UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN actor_org_ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
    )`,
    condition: `t.archived=0 AND (t.created_by_employee_id=? OR EXISTS (
      SELECT 1 FROM app_task_assignments scope_a
      JOIN app_employees scope_e ON scope_e.id=scope_a.employee_id AND scope_e.active=1
      WHERE scope_a.task_id=t.id AND scope_e.department_id=?
        AND (? IS NULL OR scope_e.organization_id=?)
    ) OR EXISTS (
      SELECT 1 FROM app_task_audiences audience WHERE audience.task_id=t.id AND (
        (audience.target_type='department' AND audience.target_id=?)
        OR (audience.target_type='organization' AND (
          audience.target_id=? OR (audience.include_descendants=1 AND audience.target_id IN (SELECT id FROM actor_org_ancestors))
        ))
      )
    ))`,
    prefixBinds: [actor.organizationId ?? -1] as unknown[],
    conditionBinds: [actor.id, actor.departmentId ?? -1, actor.organizationId, actor.organizationId, actor.departmentId ?? -1, actor.organizationId ?? -1] as unknown[],
  };
  return {
    prefix: `WITH RECURSIVE employee_scope(id) AS (
      SELECT id FROM app_employees WHERE id=? AND active=1
      UNION ALL SELECT child.id FROM app_employees child JOIN employee_scope parent ON child.manager_id=parent.id WHERE child.active=1
    ), organization_scope(id) AS (
      SELECT id FROM app_organizations WHERE id=? AND active=1
      UNION ALL SELECT child.id FROM app_organizations child JOIN organization_scope parent ON child.parent_id=parent.id WHERE child.active=1
    ), actor_org_ancestors(id) AS (
      SELECT ? UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN actor_org_ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
    )`,
    condition: `t.archived=0 AND (t.created_by_employee_id IN (SELECT id FROM employee_scope) OR EXISTS (
      SELECT 1 FROM app_task_assignments scope_a JOIN app_employees scope_e ON scope_e.id=scope_a.employee_id
      WHERE scope_a.task_id=t.id AND (scope_e.id IN (SELECT id FROM employee_scope) OR scope_e.organization_id IN (SELECT id FROM organization_scope))
    ) OR EXISTS (
      SELECT 1 FROM app_task_audiences audience WHERE audience.task_id=t.id AND (
        (audience.target_type='department' AND EXISTS (
          SELECT 1 FROM app_departments target_department WHERE target_department.id=audience.target_id AND target_department.organization_id IN (SELECT id FROM organization_scope)
        ))
        OR (audience.target_type='organization' AND (
          audience.target_id IN (SELECT id FROM organization_scope)
          OR (audience.include_descendants=1 AND audience.target_id IN (SELECT id FROM actor_org_ancestors))
        ))
      )
    ))`,
    prefixBinds: [actor.id, actor.organizationId ?? -1, actor.organizationId ?? -1] as unknown[],
    conditionBinds: [] as unknown[],
  };
}

function meetingScope(actor: Actor) {
  if (actor.permissions.viewScope === "all") return { prefix: "", condition: "1=1", binds: [] as unknown[] };
  if (actor.permissions.viewScope === "own") return {
    prefix: `WITH RECURSIVE actor_org_ancestors(id) AS (
      SELECT ? UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN actor_org_ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
    )`,
    condition: `(m.created_by_employee_id=? OR EXISTS (
      SELECT 1 FROM app_meeting_participants scope_p WHERE scope_p.meeting_id=m.id AND scope_p.employee_id=?
    ) OR EXISTS (
      SELECT 1 FROM app_meeting_audiences audience WHERE audience.meeting_id=m.id AND (
        (audience.target_type='department' AND audience.target_id=?)
        OR (audience.target_type='organization' AND (
          audience.target_id=? OR (audience.include_descendants=1 AND audience.target_id IN (SELECT id FROM actor_org_ancestors))
        ))
      )
    ))`,
    binds: [actor.organizationId ?? -1, actor.id, actor.id, actor.departmentId ?? -1, actor.organizationId ?? -1] as unknown[],
  };
  if (actor.permissions.viewScope === "department") return {
    prefix: `WITH RECURSIVE actor_org_ancestors(id) AS (
      SELECT ? UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN actor_org_ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
    )`,
    condition: `(m.created_by_employee_id=? OR EXISTS (
      SELECT 1 FROM app_meeting_participants scope_p
      JOIN app_employees scope_e ON scope_e.id=scope_p.employee_id AND scope_e.active=1
      WHERE scope_p.meeting_id=m.id AND scope_e.department_id=?
        AND (? IS NULL OR scope_e.organization_id=?)
    ) OR EXISTS (
      SELECT 1 FROM app_meeting_audiences audience WHERE audience.meeting_id=m.id AND (
        (audience.target_type='department' AND audience.target_id=?)
        OR (audience.target_type='organization' AND (
          audience.target_id=? OR (audience.include_descendants=1 AND audience.target_id IN (SELECT id FROM actor_org_ancestors))
        ))
      )
    ))`,
    binds: [actor.organizationId ?? -1, actor.id, actor.departmentId ?? -1, actor.organizationId, actor.organizationId, actor.departmentId ?? -1, actor.organizationId ?? -1] as unknown[],
  };
  return {
    prefix: `WITH RECURSIVE employee_scope(id) AS (
      SELECT id FROM app_employees WHERE id=? AND active=1
      UNION ALL SELECT child.id FROM app_employees child JOIN employee_scope parent ON child.manager_id=parent.id WHERE child.active=1
    ), organization_scope(id) AS (
      SELECT id FROM app_organizations WHERE id=? AND active=1
      UNION ALL SELECT child.id FROM app_organizations child JOIN organization_scope parent ON child.parent_id=parent.id WHERE child.active=1
    ), actor_org_ancestors(id) AS (
      SELECT ? UNION ALL SELECT parent.parent_id FROM app_organizations parent JOIN actor_org_ancestors current ON parent.id=current.id WHERE parent.parent_id IS NOT NULL
    )`,
    condition: `(m.created_by_employee_id IN (SELECT id FROM employee_scope) OR EXISTS (
      SELECT 1 FROM app_meeting_participants scope_p JOIN app_employees scope_e ON scope_e.id=scope_p.employee_id
      WHERE scope_p.meeting_id=m.id AND (scope_e.id IN (SELECT id FROM employee_scope) OR scope_e.organization_id IN (SELECT id FROM organization_scope))
    ) OR EXISTS (
      SELECT 1 FROM app_meeting_audiences audience WHERE audience.meeting_id=m.id AND (
        (audience.target_type='department' AND EXISTS (
          SELECT 1 FROM app_departments target_department WHERE target_department.id=audience.target_id AND target_department.organization_id IN (SELECT id FROM organization_scope)
        ))
        OR (audience.target_type='organization' AND (
          audience.target_id IN (SELECT id FROM organization_scope)
          OR (audience.include_descendants=1 AND audience.target_id IN (SELECT id FROM actor_org_ancestors))
        ))
      )
    ))`,
    binds: [actor.id, actor.organizationId ?? -1, actor.organizationId ?? -1] as unknown[],
  };
}

export const TASK_PAGE_LIMIT = 200;
export type TaskListScope = "current" | "active" | "done" | "all";
export type TaskListOptions = { scope?: TaskListScope; offset?: number; limit?: number; taskId?: number; cursor?: string | null };

/*
 * Keyset pagination. The list order is expressed as seven NULL-free sort keys
 * (NULL → '' keeps SQLite's NULLs-first ordering), so a page can continue
 * strictly after the last row it returned: inserts or deletions between page
 * loads never shift items into or out of the next page.
 */
const TASK_SORT_KEYS: Array<{ sql: string; direction: "asc" | "desc" }> = [
  { sql: "CASE WHEN t.status='Bajarildi' THEN 1 ELSE 0 END", direction: "asc" },
  { sql: "CASE WHEN pin.task_id IS NULL THEN 0 ELSE 1 END", direction: "desc" },
  { sql: "CASE WHEN t.status='Bajarildi' THEN COALESCE(t.updated_at,'') ELSE '' END", direction: "desc" },
  { sql: "CASE WHEN t.deadline_iso IS NULL THEN 1 ELSE 0 END", direction: "asc" },
  { sql: "COALESCE(t.deadline_iso,'')", direction: "asc" },
  { sql: "COALESCE(t.created_at,'')", direction: "desc" },
  { sql: "t.id", direction: "desc" },
];
type TaskCursorKeys = [number, number, string, number, string, string, number];

export function encodeTaskCursor(scope: TaskListScope, keys: TaskCursorKeys) {
  return Buffer.from(JSON.stringify([scope, ...keys])).toString("base64url");
}

export function decodeTaskCursor(value: string | null | undefined, scope: TaskListScope): TaskCursorKeys | null {
  if (!value || value.length > 1024) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown[];
    if (!Array.isArray(parsed) || parsed.length !== 8 || parsed[0] !== scope) return null;
    const keys = parsed.slice(1);
    const types = ["number", "number", "string", "number", "string", "string", "number"];
    if (!keys.every((key, index) => typeof key === types[index])) return null;
    return keys as TaskCursorKeys;
  } catch {
    return null;
  }
}

/** `(k1,…,k7) strictly after cursor` under the mixed asc/desc order. */
function taskCursorCondition(keys: TaskCursorKeys) {
  const clauses: string[] = [];
  const binds: unknown[] = [];
  TASK_SORT_KEYS.forEach((key, index) => {
    const parts: string[] = [];
    for (let prior = 0; prior < index; prior += 1) {
      parts.push(`${TASK_SORT_KEYS[prior].sql}=?`);
      binds.push(keys[prior]);
    }
    parts.push(`${key.sql}${key.direction === "asc" ? ">" : "<"}?`);
    binds.push(keys[index]);
    clauses.push(`(${parts.join(" AND ")})`);
  });
  return { sql: `(${clauses.join(" OR ")})`, binds };
}

function pageLimit(value: unknown, fallback: number) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, TASK_PAGE_LIMIT) : fallback;
}

function pageOffset(value: unknown) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 1_000_000) : 0;
}

export function taskListOptionsFromUrl(url: URL): TaskListOptions {
  const scope = url.searchParams.get("scope");
  return {
    scope: scope === "active" || scope === "done" || scope === "all" ? scope : "current",
    offset: pageOffset(url.searchParams.get("offset")),
    limit: pageLimit(url.searchParams.get("limit"), TASK_PAGE_LIMIT),
    cursor: url.searchParams.get("cursor"),
  };
}

export async function listTasks(actor: Actor, options: TaskListOptions = {}) {
  return (await listTasksPage(actor, options)).tasks;
}

/**
 * Paged task list. Active tasks come first (pinned, then by deadline with
 * undated tasks after dated ones); accepted tasks follow, newest first.
 * The default "current" scope hides tasks accepted more than 30 days ago.
 */
export async function listTasksPage(actor: Actor, options: TaskListOptions = {}) {
  const db = await getD1();
  const scope = taskScope(actor);
  const limit = pageLimit(options.limit, TASK_PAGE_LIMIT);
  const offset = pageOffset(options.offset);
  const listScope = options.scope ?? "current";
  const filters: string[] = [];
  const filterBinds: unknown[] = [];
  if (options.taskId) { filters.push("t.id=?"); filterBinds.push(options.taskId); }
  else if (listScope === "active") filters.push("t.status!='Bajarildi'");
  else if (listScope === "done") filters.push("t.status='Bajarildi'");
  else if (listScope === "current") filters.push("(t.status!='Bajarildi' OR t.updated_at >= datetime('now','-30 days'))");
  // A valid cursor replaces the offset; `offset` stays supported for older clients.
  const cursorKeys = options.taskId ? null : decodeTaskCursor(options.cursor, listScope);
  if (options.cursor && !cursorKeys && !options.taskId) throw new ApiError(400, "Ro‘yxat sahifasi eskirgan. Sahifani yangilang.");
  if (cursorKeys) {
    const condition = taskCursorCondition(cursorKeys);
    filters.push(condition.sql);
    filterBinds.push(...condition.binds);
  }
  const effectiveOffset = cursorKeys ? 0 : offset;
  const tasksResult = await db.prepare(
    `${scope.prefix}
     SELECT t.*, creator.full_name AS creator_name, creator.position AS creator_position,
            topic.name AS topic_name, topic.color AS topic_color,
            CASE WHEN pin.task_id IS NULL THEN 0 ELSE 1 END AS pinned,
            (SELECT COUNT(*) FROM app_attachments f WHERE f.task_id=t.id) AS attachments_count,
            ${TASK_SORT_KEYS.slice(0, 6).map((key, index) => `${key.sql} AS sort_k${index + 1}`).join(", ")}
       FROM app_tasks t
       JOIN app_employees creator ON creator.id=t.created_by_employee_id
       LEFT JOIN app_task_topics topic ON topic.id=t.topic_id
       LEFT JOIN app_task_pins pin ON pin.task_id=t.id AND pin.employee_id=?
      WHERE ${scope.condition}${filters.map((filter) => ` AND ${filter}`).join("")}
      ORDER BY ${TASK_SORT_KEYS.map((key) => `${key.sql} ${key.direction.toUpperCase()}`).join(", ")}
      LIMIT ? OFFSET ?`,
  ).bind(...scope.prefixBinds, actor.id, ...scope.conditionBinds, ...filterBinds, limit + 1, effectiveOffset).all<TaskListRow>();
  const hasMore = tasksResult.results.length > limit;
  if (hasMore) tasksResult.results.length = limit;
  const last = tasksResult.results.at(-1);
  const nextCursor = hasMore && last
    ? encodeTaskCursor(listScope, [Number(last.sort_k1), Number(last.sort_k2), String(last.sort_k3), Number(last.sort_k4), String(last.sort_k5), String(last.sort_k6), Number(last.id)])
    : null;
  const tasks = await hydrateTasks(db, actor, tasksResult.results);
  return { tasks, hasMore, nextOffset: hasMore ? effectiveOffset + limit : null, nextCursor, scope: listScope };
}

async function hydrateTasks(db: D1Database, actor: Actor, taskRows: TaskListRow[]) {
  const tasksResult = { results: taskRows };
  const taskIds = tasksResult.results.map((row) => Number(row.id));
  if (!taskIds.length) return [];
  const actorOrganizationAncestors = actor.organizationId == null
    ? Promise.resolve({ results: [] as Array<{ id: number }> })
    : db.prepare(
      `WITH RECURSIVE ancestors(id) AS (
         SELECT ?
         UNION ALL
         SELECT parent.parent_id FROM app_organizations parent
         JOIN ancestors current ON parent.id=current.id
         WHERE parent.parent_id IS NOT NULL
       ) SELECT id FROM ancestors`,
    ).bind(actor.organizationId).all<{ id: number }>();
  const [assignmentRows, routeRows, fileRows, audienceRows, actorAncestorRows] = await Promise.all([
    queryInChunks<AssignmentListRow>(db, taskIds, (chunk) => db.prepare(
      `SELECT a.*, e.full_name AS employee_name, e.position, r.name AS role_name,
              d.name AS department
         FROM app_task_assignments a
         JOIN app_employees e ON e.id=a.employee_id
         JOIN app_roles r ON r.id=e.role_id
         LEFT JOIN app_departments d ON d.id=e.department_id
        WHERE a.task_id IN (${placeholders(chunk)}) ORDER BY a.id`,
    ).bind(...chunk)),
    queryInChunks<RouteListRow>(db, taskIds, (chunk) => db.prepare(
      `SELECT tr.*, f.full_name AS from_name, fr.name AS from_role,
              e.full_name AS to_name, er.name AS to_role
         FROM app_task_routes tr
         LEFT JOIN app_employees f ON f.id=tr.from_employee_id
         LEFT JOIN app_roles fr ON fr.id=f.role_id
         JOIN app_employees e ON e.id=tr.to_employee_id
         JOIN app_roles er ON er.id=e.role_id
        WHERE tr.task_id IN (${placeholders(chunk)}) ORDER BY tr.id`,
    ).bind(...chunk)),
    queryInChunks<AttachmentListRow>(db, taskIds, (chunk) => db.prepare(
      `SELECT id, task_id, file_name, content_type, size, uploaded_by_employee_id, created_at FROM app_attachments
        WHERE task_id IN (${placeholders(chunk)}) ORDER BY created_at`,
    ).bind(...chunk)),
    queryInChunks<TaskAudienceListRow>(db, taskIds, (chunk) => db.prepare(
      `SELECT audience.task_id,audience.target_type,audience.target_id,audience.include_descendants,
              COALESCE(organization.name,department.name,'Noma’lum auditoriya') AS target_name
         FROM app_task_audiences audience
         LEFT JOIN app_organizations organization ON audience.target_type='organization' AND organization.id=audience.target_id
         LEFT JOIN app_departments department ON audience.target_type='department' AND department.id=audience.target_id
        WHERE audience.task_id IN (${placeholders(chunk)}) ORDER BY audience.id`,
    ).bind(...chunk)),
    actorOrganizationAncestors,
  ]);

  const indexByTask = <T extends { task_id: number }>(rows: T[]) => {
    const indexed = new Map<number, T[]>();
    for (const row of rows) {
      const taskId = Number(row.task_id);
      const bucket = indexed.get(taskId) ?? [];
      bucket.push(row);
      indexed.set(taskId, bucket);
    }
    return indexed;
  };
  const assignmentsByTask = indexByTask(assignmentRows);
  const routesByTask = indexByTask(routeRows);
  const filesByTask = indexByTask(fileRows);
  const audiencesByTask = indexByTask(audienceRows);
  const actorAncestorIds = new Set(actorAncestorRows.results.map((item) => Number(item.id)));

  const scopedSet = new Set([actor.id]);
  return tasksResult.results.map((row) => {
    const taskId = Number(row.id);
    const assignments = (assignmentsByTask.get(taskId) ?? []).map((item) => ({
      id: Number(item.id),
      employeeId: Number(item.employee_id),
      name: String(item.employee_name),
      position: String(item.position ?? ""),
      role: String(item.role_name),
      department: String(item.department ?? ""),
      status: String(item.assignment_status),
      progress: Number(item.progress ?? 0),
    }));
    const taskAudiences = audiencesByTask.get(taskId) ?? [];
    const claimableByActor = taskAudiences.some((item) => {
      const targetId = Number(item.target_id);
      if (String(item.target_type) === "department") return actor.departmentId != null && targetId === actor.departmentId;
      return String(item.target_type) === "organization"
        && actor.organizationId != null
        && (targetId === actor.organizationId || Boolean(item.include_descendants) && actorAncestorIds.has(targetId));
    });
    let routes = routesByTask.get(taskId) ?? [];
    if (actor.permissions.viewScope === "own") {
      const byId = new Map(routes.map((item) => [Number(item.id), item]));
      const keep = new Set<number>();
      for (const route of routes.filter((item) => scopedSet.has(Number(item.to_employee_id)))) {
        let current: RouteListRow | undefined = route;
        while (current) {
          keep.add(Number(current.id));
          current = current.parent_route_id == null ? undefined : byId.get(Number(current.parent_route_id));
        }
      }
      routes = routes.filter((item) => keep.has(Number(item.id)));
    }
    return {
      id: taskId,
      title: String(row.title),
      description: String(row.description ?? ""),
      deadlineIso: row.deadline_iso ? String(row.deadline_iso) : null,
      priority: String(row.priority),
      status: String(row.status),
      progress: Number(row.progress ?? 0),
      recurring: Boolean(row.recurring),
      recurrence: row.recurrence ? String(row.recurrence) : null,
      notifyTelegram: Boolean(row.notify_telegram),
      topic: row.topic_id == null ? null : {
        id: Number(row.topic_id),
        name: String(row.topic_name ?? "Noma’lum tematika"),
        color: String(row.topic_color ?? "#1957D2"),
      },
      pinned: Boolean(row.pinned),
      creator: { id: Number(row.created_by_employee_id), name: String(row.creator_name), position: String(row.creator_position ?? "") },
      assignments,
      audiences: taskAudiences.map((item) => ({
        targetType: String(item.target_type),
        targetId: Number(item.target_id),
        targetName: String(item.target_name),
        includeDescendants: Boolean(item.include_descendants),
      })),
      claimableByActor,
      routes: routes.map((item) => ({
        id: Number(item.id),
        parentRouteId: item.parent_route_id == null ? null : Number(item.parent_route_id),
        fromEmployeeId: item.from_employee_id == null ? null : Number(item.from_employee_id),
        fromName: String(item.from_name ?? "Tizim"),
        fromRole: String(item.from_role ?? ""),
        toEmployeeId: Number(item.to_employee_id),
        toName: String(item.to_name),
        toRole: String(item.to_role),
        action: String(item.action),
        note: String(item.note ?? ""),
        createdAt: String(item.created_at),
      })),
      attachments: (filesByTask.get(taskId) ?? []).map((item) => ({
        id: Number(item.id),
        fileName: String(item.file_name),
        contentType: item.content_type ? String(item.content_type) : null,
        size: Number(item.size ?? 0),
        uploadedByEmployeeId: Number(item.uploaded_by_employee_id),
        createdAt: String(item.created_at),
      })),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  });
}

export type MeetingListOptions = { from?: string | null; to?: string | null; offset?: number; limit?: number; meetingId?: number };

export async function listMeetings(actor: Actor, from?: string | null, to?: string | null) {
  return (await listMeetingsPage(actor, { from, to })).meetings;
}

/**
 * Paged meetings. Without an explicit range the list starts 30 days ago, so
 * past meetings can never push upcoming ones out of the page.
 */
export async function listMeetingsPage(actor: Actor, options: MeetingListOptions = {}) {
  const db = await getD1();
  const scope = meetingScope(actor);
  const limit = pageLimit(options.limit, TASK_PAGE_LIMIT);
  const offset = pageOffset(options.offset);
  const conditions = [scope.condition];
  const binds: unknown[] = [...scope.binds];
  const from = options.from || (options.to || options.meetingId ? null : new Date(Date.now() - 30 * 86_400_000).toISOString());
  if (options.meetingId) { conditions.push("m.id=?"); binds.push(options.meetingId); }
  if (from) { conditions.push("m.starts_at >= ?"); binds.push(from); }
  if (options.to) { conditions.push("m.starts_at <= ?"); binds.push(options.to); }
  const meetings = await db.prepare(
    `${scope.prefix}
     SELECT m.*, e.full_name AS creator_name FROM app_meetings m
      JOIN app_employees e ON e.id=m.created_by_employee_id
      WHERE ${conditions.join(" AND ")} ORDER BY m.starts_at, m.id LIMIT ? OFFSET ?`,
  ).bind(...binds, limit + 1, offset).all<MeetingListRow>();
  const hasMore = meetings.results.length > limit;
  if (hasMore) meetings.results.length = limit;
  return { meetings: await hydrateMeetings(db, meetings.results), hasMore, nextOffset: hasMore ? offset + limit : null, from };
}

async function hydrateMeetings(db: D1Database, meetingRows: MeetingListRow[]) {
  const meetings = { results: meetingRows };
  const ids = meetings.results.map((row) => Number(row.id));
  if (!ids.length) return [];
  const participants = await queryInChunks<ParticipantListRow>(db, ids, (chunk) => db.prepare(
    `SELECT p.meeting_id, p.employee_id, p.response_status, e.full_name, e.position,
            d.name AS department FROM app_meeting_participants p
      JOIN app_employees e ON e.id=p.employee_id
      LEFT JOIN app_departments d ON d.id=e.department_id
      WHERE p.meeting_id IN (${placeholders(chunk)}) ORDER BY e.full_name`,
  ).bind(...chunk));
  const audiences = await queryInChunks<MeetingAudienceListRow>(db, ids, (chunk) => db.prepare(
    `SELECT audience.meeting_id,audience.target_type,audience.target_id,audience.include_descendants,
            COALESCE(organization.name,department.name,'Noma’lum auditoriya') AS target_name
       FROM app_meeting_audiences audience
       LEFT JOIN app_organizations organization ON audience.target_type='organization' AND organization.id=audience.target_id
       LEFT JOIN app_departments department ON audience.target_type='department' AND department.id=audience.target_id
      WHERE audience.meeting_id IN (${placeholders(chunk)}) ORDER BY audience.id`,
  ).bind(...chunk));
  const participantsByMeeting = new Map<number, ParticipantListRow[]>();
  for (const participant of participants) {
    const meetingId = Number(participant.meeting_id);
    const bucket = participantsByMeeting.get(meetingId) ?? [];
    bucket.push(participant);
    participantsByMeeting.set(meetingId, bucket);
  }
  const audiencesByMeeting = new Map<number, MeetingAudienceListRow[]>();
  for (const audience of audiences) {
    const meetingId = Number(audience.meeting_id);
    const bucket = audiencesByMeeting.get(meetingId) ?? [];
    bucket.push(audience);
    audiencesByMeeting.set(meetingId, bucket);
  }
  return meetings.results.map((row) => ({
    id: Number(row.id),
    title: String(row.title),
    startsAt: String(row.starts_at),
    endsAt: row.ends_at ? String(row.ends_at) : null,
    timezone: String(row.timezone),
    place: String(row.place),
    format: String(row.format),
    reminderMinutes: Number(row.reminder_minutes),
    notifyTelegram: Boolean(row.notify_telegram),
    creatorId: Number(row.created_by_employee_id),
    creator: String(row.creator_name),
    participants: (participantsByMeeting.get(Number(row.id)) ?? []).map((item) => ({
      employeeId: Number(item.employee_id),
      name: String(item.full_name),
      position: String(item.position ?? ""),
      department: String(item.department ?? ""),
      responseStatus: String(item.response_status),
    })),
    audiences: (audiencesByMeeting.get(Number(row.id)) ?? []).map((item) => ({
      targetType: String(item.target_type),
      targetId: Number(item.target_id),
      targetName: String(item.target_name),
      includeDescendants: Boolean(item.include_descendants),
    })),
    createdAt: String(row.created_at),
  }));
}

export const AUDIT_PAGE_LIMIT = 100;
export const AUDIT_EXPORT_LIMIT = 10_000;
export type AuditListOptions = { offset?: number; limit?: number; action?: string | null; entityType?: string | null; from?: string | null; to?: string | null };

/** Audit log visible to the actor: everything for system-wide viewers, otherwise their subtree and organization. */
export async function listAuditLogs(actor: Actor, options: AuditListOptions = {}, maxLimit = AUDIT_PAGE_LIMIT) {
  const db = await getD1();
  const parsedLimit = Math.floor(Number(options.limit));
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, maxLimit) : Math.min(AUDIT_PAGE_LIMIT, maxLimit);
  const offset = pageOffset(options.offset);
  const conditions: string[] = [];
  const binds: unknown[] = [];
  let prefix = "";
  if (actor.permissions.viewScope !== "all") {
    prefix = `WITH RECURSIVE employee_scope(id) AS (
       SELECT id FROM app_employees WHERE id=?
       UNION ALL SELECT child.id FROM app_employees child JOIN employee_scope parent ON child.manager_id=parent.id WHERE child.active=1
     ), organization_scope(id) AS (
       SELECT id FROM app_organizations WHERE id=?
       UNION ALL SELECT child.id FROM app_organizations child JOIN organization_scope parent ON child.parent_id=parent.id WHERE child.active=1
     )`;
    conditions.push("(l.actor_employee_id IN (SELECT id FROM employee_scope) OR e.organization_id IN (SELECT id FROM organization_scope))");
  }
  const action = options.action?.trim().slice(0, 80);
  if (action) { conditions.push("l.action LIKE ?"); binds.push(`${action.replace(/[%_]/g, "")}%`); }
  const entityType = options.entityType?.trim().slice(0, 40);
  if (entityType) { conditions.push("l.entity_type=?"); binds.push(entityType); }
  if (options.from) { conditions.push("l.created_at >= datetime(?)"); binds.push(options.from); }
  if (options.to) { conditions.push("l.created_at <= datetime(?)"); binds.push(options.to); }
  const result = await db.prepare(
    `${prefix}
     SELECT l.*, e.full_name AS actor_name FROM app_audit_logs l
       LEFT JOIN app_employees e ON e.id=l.actor_employee_id
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY l.created_at DESC, l.id DESC LIMIT ? OFFSET ?`,
  ).bind(...(prefix ? [actor.id, actor.organizationId ?? -1] : []), ...binds, limit + 1, offset).all<DbRow>();
  const hasMore = result.results.length > limit;
  if (hasMore) result.results.length = limit;
  return {
    items: result.results.map((row) => {
      let detail: unknown = {};
      try { detail = JSON.parse(String(row.detail_json ?? "{}")); } catch { detail = {}; }
      return {
        id: Number(row.id),
        actorName: String(row.actor_name ?? "Tizim"),
        action: String(row.action),
        entityType: String(row.entity_type),
        entityId: row.entity_id == null ? null : Number(row.entity_id),
        detail,
        createdAt: String(row.created_at),
      };
    }),
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  };
}
