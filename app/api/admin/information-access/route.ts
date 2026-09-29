import { getD1 } from "../../../../db";
import { apiError, assertSameOrigin, audit, requireActor } from "../../../../lib/auth";
import { authorize } from "../../../../lib/policy";
import { informationAccessManage } from "../../../../lib/policy/admin";

type Row = Record<string, unknown>;
type PrincipalType = "employee" | "staff_position";

const POSITION_CURSOR_OFFSET = 1_000_000_000;

function principalType(value: unknown): PrincipalType | null {
  return value === "employee" || value === "staff_position" ? value : null;
}

function mapGrant(row: Row) {
  return {
    id: Number(row.id),
    principalType: String(row.principal_type) as PrincipalType,
    principalId: Number(row.principal_id),
    domainId: Number(row.domain_id),
    domainName: String(row.domain_name ?? ""),
    memberRole: String(row.member_role) as "editor" | "reviewer",
    active: Boolean(row.active),
    grantSource: String(row.grant_source),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    await authorize(informationAccessManage(actor));
    const url = new URL(request.url);
    const requestedType = principalType(url.searchParams.get("principalType"));
    const organizationId = Math.max(0, Number(url.searchParams.get("organizationId")) || 0) || null;
    const domainId = Math.max(0, Number(url.searchParams.get("domainId")) || 0) || null;
    const cursor = Math.max(0, Number(url.searchParams.get("cursor")) || 0);
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit")) || 50));
    const includeInactive = url.searchParams.get("includeInactive") === "true";
    const query = String(url.searchParams.get("q") ?? "")
      .trim()
      .slice(0, 100);
    const db = await getD1();

    const conditions = ["principal.sort_key>?", includeInactive ? "1=1" : "principal.active=1"];
    const binds: unknown[] = [cursor];
    if (requestedType) {
      conditions.push("principal.principal_type=?");
      binds.push(requestedType);
    }
    if (organizationId) {
      conditions.push("principal.organization_id=?");
      binds.push(organizationId);
    }
    if (query) {
      conditions.push("(principal.name LIKE ? OR principal.position LIKE ? OR principal.department LIKE ?)");
      const pattern = `%${query}%`;
      binds.push(pattern, pattern, pattern);
    }
    const [domainRows, principalRows] = await Promise.all([
      db
        .prepare(
          `SELECT id,code,name,visibility,catalog_state
           FROM app_information_domains
          WHERE active=1 ORDER BY CASE WHEN catalog_state='current' THEN 0 ELSE 1 END,sort_order,id`,
        )
        .all<Row>(),
      db
        .prepare(
          `WITH principal AS (
           SELECT employee.id AS sort_key,'employee' AS principal_type,employee.id AS principal_id,
             employee.full_name AS name,employee.organization_id,organization.name AS organization,
             employee.department_id,COALESCE(department.name,'') AS department,employee.position,
             employee.active,CASE WHEN EXISTS (
               SELECT 1 FROM app_position_occupancies occupancy
               JOIN app_staff_positions staff ON staff.id=occupancy.staff_position_id AND staff.active=1
               WHERE occupancy.employee_id=employee.id AND occupancy.ends_at IS NULL
                 AND staff.organization_id=employee.organization_id
             ) THEN 1 ELSE 0 END AS occupied,0 AS provisional
           FROM app_employees employee
           JOIN app_organizations organization ON organization.id=employee.organization_id AND organization.active=1
           LEFT JOIN app_departments department ON department.id=employee.department_id
           UNION ALL
           SELECT ?+staff.id AS sort_key,'staff_position' AS principal_type,staff.id AS principal_id,
             CASE WHEN staff.data_status='provisional_requires_staff_import' THEN 'Operatsion rezerv' ELSE staff.title END AS name,
             staff.organization_id,organization.name AS organization,staff.department_id,
             COALESCE(department.name,staff.department_name,'') AS department,staff.title AS position,
             staff.active,CASE WHEN EXISTS (
               SELECT 1 FROM app_position_occupancies occupancy
               JOIN app_employees employee ON employee.id=occupancy.employee_id AND employee.active=1
               WHERE occupancy.staff_position_id=staff.id AND occupancy.ends_at IS NULL
                 AND employee.organization_id=staff.organization_id
             ) THEN 1 ELSE 0 END AS occupied,
             CASE WHEN staff.data_status='provisional_requires_staff_import' THEN 1 ELSE 0 END AS provisional
           FROM app_staff_positions staff
           JOIN app_organizations organization ON organization.id=staff.organization_id AND organization.active=1
           LEFT JOIN app_departments department ON department.id=staff.department_id
         )
         SELECT * FROM principal WHERE ${conditions.join(" AND ")} ORDER BY sort_key LIMIT ?`,
        )
        .bind(POSITION_CURSOR_OFFSET, ...binds, limit + 1)
        .all<Row>(),
    ]);
    const hasMore = principalRows.results.length > limit;
    const page = principalRows.results.slice(0, limit);

    let grants: Row[] = [];
    if (page.length) {
      const employeeIds = page
        .filter((row) => row.principal_type === "employee")
        .map((row) => Number(row.principal_id));
      const positionIds = page
        .filter((row) => row.principal_type === "staff_position")
        .map((row) => Number(row.principal_id));
      const grantConditions: string[] = [];
      const grantBinds: unknown[] = [];
      if (employeeIds.length) {
        grantConditions.push(
          `(assignment.principal_type='employee' AND assignment.principal_id IN (${employeeIds.map(() => "?").join(",")}))`,
        );
        grantBinds.push(...employeeIds);
      }
      if (positionIds.length) {
        grantConditions.push(
          `(assignment.principal_type='staff_position' AND assignment.principal_id IN (${positionIds.map(() => "?").join(",")}))`,
        );
        grantBinds.push(...positionIds);
      }
      if (domainId) {
        grantConditions.push("assignment.domain_id=?");
        grantBinds.push(domainId);
      }
      const activeCondition = includeInactive ? "" : "AND assignment.active=1";
      const grantRows = await db
        .prepare(
          `SELECT assignment.*,domain.name AS domain_name
           FROM app_information_domain_assignments assignment
           JOIN app_information_domains domain ON domain.id=assignment.domain_id
          WHERE (${grantConditions.slice(0, employeeIds.length && positionIds.length ? 2 : 1).join(" OR ")})
            ${domainId ? "AND assignment.domain_id=?" : ""} ${activeCondition}
          ORDER BY assignment.principal_type,assignment.principal_id,domain.sort_order,domain.id`,
        )
        .bind(...grantBinds)
        .all<Row>();
      grants = grantRows.results;
    }
    return Response.json(
      {
        domains: domainRows.results.map((row) => ({
          id: Number(row.id),
          code: String(row.code),
          name: String(row.name),
          visibility: String(row.visibility),
        })),
        principals: page.map((row) => ({
          principalType: String(row.principal_type) as PrincipalType,
          principalId: Number(row.principal_id),
          name: String(row.name),
          organizationId: Number(row.organization_id),
          organization: String(row.organization),
          departmentId: row.department_id == null ? null : Number(row.department_id),
          department: String(row.department ?? ""),
          position: String(row.position ?? ""),
          occupied: Boolean(row.occupied),
          provisional: Boolean(row.provisional),
        })),
        grants: grants.map(mapGrant),
        nextCursor: hasMore ? Number(page.at(-1)?.sort_key ?? 0) : null,
      },
      { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(informationAccessManage(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const type = principalType(payload.principalType);
    const principalId = Number(payload.principalId);
    const domainId = Number(payload.domainId);
    const memberRole =
      payload.memberRole === "reviewer" ? "reviewer" : payload.memberRole === "editor" ? "editor" : null;
    if (
      !type ||
      !Number.isSafeInteger(principalId) ||
      principalId <= 0 ||
      !Number.isSafeInteger(domainId) ||
      domainId <= 0 ||
      !memberRole
    ) {
      return Response.json({ error: "Xodim/lavozim, mavzu va vakolat turini to‘g‘ri tanlang" }, { status: 400 });
    }
    const db = await getD1();
    const [domain, principal] = await Promise.all([
      db.prepare("SELECT id FROM app_information_domains WHERE id=? AND active=1").bind(domainId).first(),
      db
        .prepare(
          type === "employee"
            ? "SELECT id FROM app_employees WHERE id=? AND active=1"
            : "SELECT id FROM app_staff_positions WHERE id=? AND active=1",
        )
        .bind(principalId)
        .first(),
    ]);
    if (!domain) return Response.json({ error: "Faol ma’lumot mavzusi topilmadi" }, { status: 404 });
    if (!principal)
      return Response.json(
        { error: type === "employee" ? "Faol xodim topilmadi" : "Faol shtat lavozimi topilmadi" },
        { status: 404 },
      );
    const existing = await db
      .prepare(
        "SELECT id FROM app_information_domain_assignments WHERE domain_id=? AND principal_type=? AND principal_id=?",
      )
      .bind(domainId, type, principalId)
      .first<{ id: number }>();
    await db
      .prepare(
        `INSERT INTO app_information_domain_assignments
        (domain_id,principal_type,principal_id,member_role,grant_source,active,created_by_employee_id,updated_by_employee_id)
       VALUES (?,?,?,?,'manual_admin',1,?,?)
       ON CONFLICT(domain_id,principal_type,principal_id) DO UPDATE SET
         member_role=excluded.member_role,grant_source='manual_admin',active=1,
         updated_by_employee_id=excluded.updated_by_employee_id,updated_at=CURRENT_TIMESTAMP`,
      )
      .bind(domainId, type, principalId, memberRole, actor.id, actor.id)
      .run();
    const row = await db
      .prepare(
        `SELECT assignment.*,domain.name AS domain_name
         FROM app_information_domain_assignments assignment
         JOIN app_information_domains domain ON domain.id=assignment.domain_id
        WHERE assignment.domain_id=? AND assignment.principal_type=? AND assignment.principal_id=?`,
      )
      .bind(domainId, type, principalId)
      .first<Row>();
    await audit(actor, existing ? "information_access.updated" : "information_access.created", type, principalId, {
      domainId,
      memberRole,
    });
    return Response.json(
      { grant: mapGrant(row!), created: !existing },
      {
        status: existing ? 200 : 201,
        headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
      },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(informationAccessManage(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const grantId = Number(payload.grantId);
    if (!Number.isSafeInteger(grantId) || grantId <= 0)
      return Response.json({ error: "Vakolat ID noto‘g‘ri" }, { status: 400 });
    const db = await getD1();
    const grant = await db
      .prepare("SELECT * FROM app_information_domain_assignments WHERE id=?")
      .bind(grantId)
      .first<Row>();
    if (!grant) return Response.json({ error: "Tematik vakolat topilmadi" }, { status: 404 });
    await db
      .prepare(
        "UPDATE app_information_domain_assignments SET active=0,updated_by_employee_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
      .bind(actor.id, grantId)
      .run();
    await audit(actor, "information_access.revoked", String(grant.principal_type), Number(grant.principal_id), {
      grantId,
      domainId: Number(grant.domain_id),
      memberRole: String(grant.member_role),
    });
    return Response.json(
      { ok: true, grantId, active: false },
      {
        headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
      },
    );
  } catch (error) {
    return apiError(error);
  }
}
