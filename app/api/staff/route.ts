import { getD1 } from "../../../db";
import { apiError, requireActor } from "../../../lib/auth";
import { authorize } from "../../../lib/policy";
import {
  canViewEmployeeContacts,
  canViewLoginConfigured,
  directoryGlobalScope,
  staffOrganizationView,
  staffView,
} from "../../../lib/policy/admin";

type Row = Record<string, unknown>;
type StaffOccupancy = {
  id: number;
  name: string;
  position: string;
  fteRate: number;
  internalExtension?: string | null;
  mobilePhone?: string | null;
  loginConfigured?: boolean;
};
type StaffPositionRole = {
  departmentId: number;
  department: string;
  roleType: string;
  note: string;
};

async function canAccessOrganization(actor: Awaited<ReturnType<typeof requireActor>>, organizationId: number) {
  if (directoryGlobalScope(actor)) return true;
  if (!actor.organizationId) return false;
  return Boolean(
    await (
      await getD1()
    )
      .prepare(
        `WITH RECURSIVE scope(id) AS (
       SELECT id FROM app_organizations WHERE id=? AND active=1
       UNION ALL SELECT child.id FROM app_organizations child JOIN scope parent ON child.parent_id=parent.id WHERE child.active=1
     ) SELECT id FROM scope WHERE id=? LIMIT 1`,
      )
      .bind(actor.organizationId, organizationId)
      .first(),
  );
}

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const db = await getD1();
    await authorize(staffView(actor));
    const showLoginConfigured = canViewLoginConfigured(actor);
    const showEmployeeContacts = canViewEmployeeContacts(actor);
    const url = new URL(request.url);
    const organizationId = Number(url.searchParams.get("organizationId")) || null;
    const departmentId = Number(url.searchParams.get("departmentId")) || null;
    const cursor = Math.max(0, Number(url.searchParams.get("cursor")) || 0);
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit")) || 30));
    const hasGlobalScope = directoryGlobalScope(actor);
    if (organizationId) await authorize(staffOrganizationView(await canAccessOrganization(actor, organizationId)));

    if (!organizationId) {
      const scopePrefix = hasGlobalScope
        ? ""
        : `WITH RECURSIVE organization_scope(id) AS (
        SELECT id FROM app_organizations WHERE id=? AND active=1
        UNION ALL SELECT child.id FROM app_organizations child JOIN organization_scope parent ON child.parent_id=parent.id WHERE child.active=1
      )`;
      const scopeCondition = hasGlobalScope ? "1=1" : "id IN (SELECT id FROM organization_scope)";
      const scopeBinds = hasGlobalScope ? [] : [actor.organizationId ?? -1];
      const summary = await db
        .prepare(
          `${scopePrefix}
         SELECT
          (SELECT COUNT(*) FROM app_organizations WHERE active=1 AND tax_id IS NOT NULL AND ${scopeCondition}) AS organizations,
          (SELECT COUNT(*) FROM app_departments WHERE active=1 AND organization_id IN (SELECT id FROM app_organizations WHERE ${scopeCondition})) AS departments,
          (SELECT COUNT(*) FROM app_staff_positions WHERE active=1 AND organization_id IN (SELECT id FROM app_organizations WHERE ${scopeCondition})) AS position_rows,
          (SELECT COALESCE(SUM(headcount_units),0) FROM app_staff_positions WHERE active=1 AND organization_id IN (SELECT id FROM app_organizations WHERE ${scopeCondition})) AS staff_units,
          (SELECT COUNT(*) FROM app_employees WHERE active=1 AND organization_id IN (SELECT id FROM app_organizations WHERE ${scopeCondition})) AS employees,
          (SELECT COUNT(*) FROM app_user_credentials c JOIN app_employees e ON e.id=c.employee_id WHERE e.organization_id IN (SELECT id FROM app_organizations WHERE ${scopeCondition})) AS accounts,
          (SELECT COUNT(*) FROM app_staff_positions p WHERE p.active=1 AND p.organization_id IN (SELECT id FROM app_organizations WHERE ${scopeCondition}) AND
            COALESCE((SELECT SUM(x.fte_rate) FROM app_position_occupancies x WHERE x.staff_position_id=p.id AND x.ends_at IS NULL),0)<p.headcount_units
          ) AS vacant_rows`,
        )
        .bind(...scopeBinds)
        .first<Row>();
      const regions = await db
        .prepare(
          `${scopePrefix}
         SELECT COALESCE(region_code,'other') AS region_code,COUNT(*) AS organizations,
                SUM((SELECT COUNT(*) FROM app_employees e WHERE e.organization_id=o.id AND e.active=1)) AS employees,
                SUM((SELECT COALESCE(SUM(headcount_units),0) FROM app_staff_positions p WHERE p.organization_id=o.id AND p.active=1)) AS staff_units
           FROM app_organizations o WHERE o.active=1 AND ${hasGlobalScope ? "1=1" : "o.id IN (SELECT id FROM organization_scope)"} GROUP BY region_code ORDER BY region_code`,
        )
        .bind(...scopeBinds)
        .all<Row>();
      const coverageScopePrefix = hasGlobalScope
        ? `WITH scoped_organizations AS (
             SELECT id,type FROM app_organizations WHERE active=1
           )`
        : `WITH RECURSIVE organization_scope(id) AS (
             SELECT id FROM app_organizations WHERE id=? AND active=1
             UNION ALL SELECT child.id FROM app_organizations child JOIN organization_scope parent ON child.parent_id=parent.id WHERE child.active=1
           ), scoped_organizations AS (
             SELECT organization.id,organization.type FROM app_organizations organization
              WHERE organization.active=1 AND organization.id IN (SELECT id FROM organization_scope)
           )`;
      const coverageRows = await db
        .prepare(
          `${coverageScopePrefix},
         occupancy AS (
           SELECT x.staff_position_id,COUNT(DISTINCT x.employee_id) AS occupied_slots
             FROM app_position_occupancies x
             JOIN app_employees employee ON employee.id=x.employee_id AND employee.active=1
            WHERE x.ends_at IS NULL GROUP BY x.staff_position_id
         ), position_stats AS (
           SELECT p.id,p.organization_id,p.source_file,p.headcount_units,
             CAST(p.headcount_units AS INTEGER)+CASE WHEN p.headcount_units>CAST(p.headcount_units AS INTEGER) THEN 1 ELSE 0 END AS credential_slots,
             COALESCE(occupancy.occupied_slots,0) AS occupied_slots
           FROM app_staff_positions p LEFT JOIN occupancy ON occupancy.staff_position_id=p.id
           WHERE p.active=1 AND p.organization_id IN (SELECT id FROM scoped_organizations)
         ), employee_stats AS (
           SELECT organization_id,COUNT(*) AS active_employees FROM app_employees
            WHERE active=1 AND organization_id IN (SELECT id FROM scoped_organizations) GROUP BY organization_id
         )
         SELECT organization.id,organization.type,
           MAX(CASE WHEN position.id IS NOT NULL AND position.source_file<>'Tizim tomonidan yaratilgan' THEN 1 ELSE 0 END) AS official_covered,
           MAX(CASE WHEN position.id IS NOT NULL THEN 1 ELSE 0 END) AS operational_ready,
           MAX(CASE WHEN position.source_file='Tizim tomonidan yaratilgan' THEN 1 ELSE 0 END) AS provisional,
           COUNT(position.id) AS position_rows,COALESCE(SUM(position.headcount_units),0) AS headcount_units,
           COALESCE(SUM(position.credential_slots),0) AS credential_slots,COALESCE(SUM(position.occupied_slots),0) AS occupied_slots,
           COALESCE(SUM(MAX(0,position.credential_slots-position.occupied_slots)),0) AS vacant_slots,
           COALESCE(employee_stats.active_employees,0) AS active_employees,
           SUM(CASE WHEN position.occupied_slots>position.credential_slots THEN 1 ELSE 0 END) AS over_allocated_positions,
           COALESCE(SUM(CASE WHEN position.source_file='Tizim tomonidan yaratilgan' THEN position.credential_slots ELSE 0 END),0) AS provisional_credential_slots
         FROM scoped_organizations organization
         LEFT JOIN position_stats position ON position.organization_id=organization.id
         LEFT JOIN employee_stats ON employee_stats.organization_id=organization.id
         GROUP BY organization.id,organization.type,employee_stats.active_employees ORDER BY organization.type,organization.id`,
        )
        .bind(...scopeBinds)
        .all<Row>();
      const add = (field: string) => coverageRows.results.reduce((total, row) => total + Number(row[field] ?? 0), 0);
      const totalOrganizations = coverageRows.results.length;
      const officialCoveredOrganizations = add("official_covered");
      const operationalReadyOrganizations = add("operational_ready");
      const byType = new Map<
        string,
        {
          type: string;
          organizations: number;
          coveredOrganizations: number;
          operationalReadyOrganizations: number;
          positionRows: number;
          credentialSlots: number;
          occupiedSlots: number;
        }
      >();
      for (const row of coverageRows.results) {
        const type = String(row.type);
        const entry = byType.get(type) ?? {
          type,
          organizations: 0,
          coveredOrganizations: 0,
          operationalReadyOrganizations: 0,
          positionRows: 0,
          credentialSlots: 0,
          occupiedSlots: 0,
        };
        entry.organizations += 1;
        entry.coveredOrganizations += Number(row.official_covered ?? 0);
        entry.operationalReadyOrganizations += Number(row.operational_ready ?? 0);
        entry.positionRows += Number(row.position_rows ?? 0);
        entry.credentialSlots += Number(row.credential_slots ?? 0);
        entry.occupiedSlots += Number(row.occupied_slots ?? 0);
        byType.set(type, entry);
      }
      return Response.json(
        {
          summary: {
            organizations: Number(summary?.organizations ?? 0),
            departments: Number(summary?.departments ?? 0),
            positionRows: Number(summary?.position_rows ?? 0),
            staffUnits: Number(summary?.staff_units ?? 0),
            employees: Number(summary?.employees ?? 0),
            accounts: showLoginConfigured ? Number(summary?.accounts ?? 0) : 0,
            vacantRows: Number(summary?.vacant_rows ?? 0),
          },
          regions: regions.results.map((row: Row) => ({
            id: String(row.region_code),
            organizations: Number(row.organizations ?? 0),
            employees: Number(row.employees ?? 0),
            staffUnits: Number(row.staff_units ?? 0),
          })),
          coverage: {
            totalOrganizations,
            coveredOrganizations: officialCoveredOrganizations,
            officialCoveredOrganizations,
            officialMissingOrganizations: Math.max(0, totalOrganizations - officialCoveredOrganizations),
            missingOrganizations: Math.max(0, totalOrganizations - officialCoveredOrganizations),
            missingOfficialSchedules: Math.max(0, totalOrganizations - officialCoveredOrganizations),
            operationalReadyOrganizations,
            missingOperationalAccess: Math.max(0, totalOrganizations - operationalReadyOrganizations),
            provisionalOrganizations: add("provisional"),
            totalPositionRows: add("position_rows"),
            headcountUnits: add("headcount_units"),
            credentialSlots: add("credential_slots"),
            occupiedSlots: add("occupied_slots"),
            vacantSlots: add("vacant_slots"),
            activeEmployees: add("active_employees"),
            overAllocatedPositions: add("over_allocated_positions"),
            provisionalCredentialSlots: add("provisional_credential_slots"),
            byOrganizationType: [...byType.values()],
          },
        },
        { headers: { "Cache-Control": "private, max-age=30", Vary: "Cookie" } },
      );
    }

    const organization = await db
      .prepare(
        `SELECT id,name,short_name,type,parent_id,region_code,tax_id,data_status,hierarchy_verified
         FROM app_organizations WHERE id=? AND active=1`,
      )
      .bind(organizationId)
      .first<Row>();
    if (!organization) return Response.json({ error: "Tashkilot topilmadi" }, { status: 404 });

    const departments = await db
      .prepare(
        `SELECT d.id,d.name,d.parent_id,
              (SELECT COALESCE(SUM(p.headcount_units),0) FROM app_staff_positions p WHERE p.department_id=d.id AND p.active=1) AS direct_staff_units,
              (SELECT COALESCE(SUM(p.headcount_units),0) FROM app_staff_positions p
                WHERE p.active=1 AND p.department_id<>d.id AND EXISTS (
                  SELECT 1 FROM app_staff_position_roles role WHERE role.staff_position_id=p.id AND role.department_id=d.id
                )) AS secondary_manager_units,
              (SELECT COUNT(*) FROM app_staff_positions p WHERE p.department_id=d.id AND p.active=1) AS direct_position_rows,
              (SELECT COUNT(*) FROM app_staff_positions p
                WHERE p.active=1 AND p.department_id<>d.id AND EXISTS (
                  SELECT 1 FROM app_staff_position_roles role WHERE role.staff_position_id=p.id AND role.department_id=d.id
                )) AS secondary_manager_rows,
              (SELECT COUNT(DISTINCT e.id) FROM app_employees e WHERE e.active=1 AND (
                e.department_id=d.id OR EXISTS (
                  SELECT 1 FROM app_position_occupancies occupancy
                  JOIN app_staff_position_roles role ON role.staff_position_id=occupancy.staff_position_id AND role.department_id=d.id
                  JOIN app_staff_positions position ON position.id=occupancy.staff_position_id AND position.active=1 AND position.department_id<>d.id
                  WHERE occupancy.employee_id=e.id AND occupancy.ends_at IS NULL
                )
              )) AS employees
         FROM app_departments d WHERE d.organization_id=? AND d.active=1 ORDER BY d.parent_id,d.name`,
      )
      .bind(organizationId)
      .all<Row>();
    if (departmentId && !departments.results.some((row: Row) => Number(row.id) === departmentId)) {
      return Response.json({ error: "Bo‘lim ushbu tashkilot tarkibida topilmadi" }, { status: 404 });
    }
    const conditions = ["p.organization_id=?", "p.active=1", "p.id>?"];
    const binds: unknown[] = [organizationId, cursor];
    if (departmentId) {
      conditions.push(`(p.department_id=? OR EXISTS (
        SELECT 1 FROM app_staff_position_roles role WHERE role.staff_position_id=p.id AND role.department_id=?
      ))`);
      binds.push(departmentId, departmentId);
    }
    const positions = await db
      .prepare(
        `SELECT p.id,p.department_id,p.department_name,p.subunit_name,p.title,p.employee_category,p.position_status,
              p.headcount_units,p.fte_rate,p.grade,p.effective_from,p.document_type,p.source_file,p.data_status,
              COALESCE((SELECT SUM(x.fte_rate) FROM app_position_occupancies x WHERE x.staff_position_id=p.id AND x.ends_at IS NULL),0) AS occupied_units
         FROM app_staff_positions p
        WHERE ${conditions.join(" AND ")} ORDER BY p.id LIMIT ?`,
      )
      .bind(...binds, limit + 1)
      .all<Row>();
    const hasMore = positions.results.length > limit;
    const page = positions.results.slice(0, limit);
    const positionIds = page.map((row: Row) => Number(row.id));
    const loginConfiguredSelect = showLoginConfigured
      ? ",CASE WHEN c.employee_id IS NULL THEN 0 ELSE 1 END AS login_configured"
      : "";
    const credentialsJoin = showLoginConfigured ? "LEFT JOIN app_user_credentials c ON c.employee_id=e.id" : "";
    const occupancyRows = positionIds.length
      ? await db
          .prepare(
            `SELECT x.staff_position_id,x.employee_id,x.fte_rate,e.full_name,e.position,
              e.department_id,profile.internal_extension,
              ${showEmployeeContacts ? "profile.mobile_phone" : "NULL"} AS mobile_phone${loginConfiguredSelect}
         FROM app_position_occupancies x
         JOIN app_employees e ON e.id=x.employee_id AND e.active=1
         LEFT JOIN app_employee_profiles profile ON profile.employee_id=e.id
         ${credentialsJoin}
        WHERE x.ends_at IS NULL AND x.staff_position_id IN (${positionIds.map(() => "?").join(",")})
        ORDER BY x.staff_position_id,e.full_name`,
          )
          .bind(...positionIds)
          .all<Row>()
      : { results: [] as Row[] };
    const roleRows = positionIds.length
      ? await db
          .prepare(
            `SELECT role.staff_position_id,role.department_id,role.role_type,role.note,department.name AS department_name
         FROM app_staff_position_roles role
         JOIN app_departments department ON department.id=role.department_id AND department.active=1
        WHERE role.staff_position_id IN (${positionIds.map(() => "?").join(",")})
        ORDER BY role.staff_position_id,department.name,role.role_type`,
          )
          .bind(...positionIds)
          .all<Row>()
      : { results: [] as Row[] };
    const occupancies = new Map<number, StaffOccupancy[]>();
    for (const row of occupancyRows.results) {
      const staffPositionId = Number(row.staff_position_id);
      const list = occupancies.get(staffPositionId) ?? [];
      const occupancy: StaffOccupancy = {
        id: Number(row.employee_id),
        name: String(row.full_name),
        position: String(row.position ?? ""),
        fteRate: Number(row.fte_rate ?? 0),
        internalExtension: row.internal_extension ? String(row.internal_extension) : null,
        mobilePhone: row.mobile_phone ? String(row.mobile_phone) : null,
      };
      if (showLoginConfigured) occupancy.loginConfigured = Boolean(row.login_configured);
      list.push(occupancy);
      occupancies.set(staffPositionId, list);
    }
    const roles = new Map<number, StaffPositionRole[]>();
    for (const row of roleRows.results) {
      const staffPositionId = Number(row.staff_position_id);
      const list = roles.get(staffPositionId) ?? [];
      list.push({
        departmentId: Number(row.department_id),
        department: String(row.department_name ?? ""),
        roleType: String(row.role_type),
        note: String(row.note ?? ""),
      });
      roles.set(staffPositionId, list);
    }
    return Response.json(
      {
        capabilities: { viewLoginConfigured: showLoginConfigured, viewEmployeeContacts: showEmployeeContacts },
        organization: {
          id: Number(organization.id),
          name: String(organization.name),
          shortName: String(organization.short_name ?? ""),
          type: String(organization.type),
          parentId: organization.parent_id == null ? null : Number(organization.parent_id),
          regionCode: organization.region_code ? String(organization.region_code) : null,
          taxId: organization.tax_id ? String(organization.tax_id) : null,
          dataStatus: String(organization.data_status ?? "manual"),
          hierarchyVerified: Boolean(organization.hierarchy_verified),
        },
        departments: departments.results.map((row: Row) => ({
          ...(() => {
            const directStaffUnits = Number(row.direct_staff_units ?? 0);
            const secondaryManagerUnits = Number(row.secondary_manager_units ?? 0);
            const directPositionRows = Number(row.direct_position_rows ?? 0);
            const secondaryManagerRows = Number(row.secondary_manager_rows ?? 0);
            return {
              staffUnits: directStaffUnits + secondaryManagerUnits,
              positionRows: directPositionRows + secondaryManagerRows,
              directStaffUnits,
              directPositionRows,
              secondaryManagerUnits,
              secondaryManagerRows,
            };
          })(),
          id: Number(row.id),
          name: String(row.name),
          parentId: row.parent_id == null ? null : Number(row.parent_id),
          employees: Number(row.employees ?? 0),
        })),
        positions: page.map((row: Row) => {
          const positionOccupancies = occupancies.get(Number(row.id)) ?? [];
          return {
            id: Number(row.id),
            departmentId: row.department_id == null ? null : Number(row.department_id),
            department: String(row.department_name ?? ""),
            subunit: String(row.subunit_name ?? ""),
            title: String(row.title),
            category: String(row.employee_category ?? ""),
            status: String(row.position_status ?? ""),
            headcountUnits: Number(row.headcount_units ?? 0),
            fteRate: Number(row.fte_rate ?? 0),
            grade: String(row.grade ?? ""),
            occupiedUnits: Number(row.occupied_units ?? 0),
            vacantUnits: Math.max(0, Number(row.headcount_units ?? 0) - Number(row.occupied_units ?? 0)),
            effectiveFrom: row.effective_from ? String(row.effective_from) : null,
            documentType: String(row.document_type ?? ""),
            sourceFile: String(row.source_file ?? ""),
            dataStatus: String(row.data_status ?? ""),
            roles: roles.get(Number(row.id)) ?? [],
            occupancies: positionOccupancies,
            employee: positionOccupancies[0] ?? null,
          };
        }),
        nextCursor: hasMore ? Number(page.at(-1)?.id ?? 0) : null,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
