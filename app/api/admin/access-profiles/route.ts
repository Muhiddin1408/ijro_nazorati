import { getD1 } from "../../../../db";
import { apiError, requireActor } from "../../../../lib/auth";
import { authorize } from "../../../../lib/policy";
import { accessProfilesManage } from "../../../../lib/policy/admin";

type Row = Record<string, unknown>;

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    await authorize(accessProfilesManage(actor));
    const url = new URL(request.url);
    const principalType = url.searchParams.get("principalType") === "staff_position" ? "staff_position" : "employee";
    const cursor = Math.max(0, Number(url.searchParams.get("cursor")) || 0);
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit")) || 50));
    const organizationId = Number(url.searchParams.get("organizationId")) || null;
    const db = await getD1();
    const [profileRows, roleRows] = await Promise.all([
      db.prepare("SELECT * FROM app_access_profiles WHERE active=1 ORDER BY id").all<Row>(),
      db
        .prepare("SELECT code,name,level,permissions_json FROM app_roles WHERE active=1 ORDER BY level,name")
        .all<Row>(),
    ]);
    const conditions = ["a.principal_type=?", "a.active=1", "a.id>?"];
    const binds: unknown[] = [principalType, cursor];
    if (organizationId) {
      conditions.push(principalType === "employee" ? "e.organization_id=?" : "s.organization_id=?");
      binds.push(organizationId);
    }
    const join =
      principalType === "employee"
        ? `JOIN app_employees e ON e.id=a.principal_id AND e.active=1
         JOIN app_organizations o ON o.id=e.organization_id
         LEFT JOIN app_departments d ON d.id=e.department_id`
        : `JOIN app_staff_positions s ON s.id=a.principal_id AND s.active=1
         JOIN app_organizations o ON o.id=s.organization_id
         LEFT JOIN app_departments d ON d.id=s.department_id`;
    const identitySelect =
      principalType === "employee"
        ? "e.full_name AS principal_name,e.position,e.organization_id,e.department_id"
        : "CASE WHEN s.data_status='provisional_requires_staff_import' THEN 'Operatsion rezerv' ELSE 'Vakant lavozim' END AS principal_name,s.title AS position,s.organization_id,s.department_id";
    const assignments = await db
      .prepare(
        `SELECT a.id,a.principal_type,a.principal_id,a.scope_type,a.scope_id,a.include_descendants,a.grant_source,
              p.code AS profile_code,p.name AS profile_name,${identitySelect},o.name AS organization_name,d.name AS department_name
         FROM app_access_profile_assignments a
         JOIN app_access_profiles p ON p.id=a.access_profile_id AND p.active=1
         ${join}
        WHERE ${conditions.join(" AND ")} ORDER BY a.id LIMIT ?`,
      )
      .bind(...binds, limit + 1)
      .all<Row>();
    const hasMore = assignments.results.length > limit;
    const page = assignments.results.slice(0, limit);
    return Response.json(
      {
        profiles: profileRows.results.map((row) => ({
          id: Number(row.id),
          code: String(row.code),
          name: String(row.name),
          organizationType: String(row.organization_type),
          viewScope: String(row.view_scope),
          informationScope: String(row.information_scope),
          canEnter: Boolean(row.can_enter_information),
          canSubmit: Boolean(row.can_submit_information),
          canVerify: Boolean(row.can_verify_information),
          canApprove: Boolean(row.can_approve_information),
          canViewAll: Boolean(row.can_view_all_information),
          description: String(row.description ?? ""),
        })),
        roleMatrix: roleRows.results.map((row) => {
          let permissions: Record<string, unknown> = {};
          try {
            permissions = JSON.parse(String(row.permissions_json ?? "{}"));
          } catch {
            permissions = {};
          }
          return { code: String(row.code), name: String(row.name), level: Number(row.level), permissions };
        }),
        assignments: page.map((row) => ({
          id: Number(row.id),
          principalType: String(row.principal_type),
          principalId: Number(row.principal_id),
          principalName: String(row.principal_name ?? ""),
          position: String(row.position ?? ""),
          organizationId: Number(row.organization_id),
          organization: String(row.organization_name ?? ""),
          departmentId: row.department_id == null ? null : Number(row.department_id),
          department: String(row.department_name ?? ""),
          profileCode: String(row.profile_code),
          profileName: String(row.profile_name),
          scopeType: String(row.scope_type),
          scopeId: Number(row.scope_id),
          includeDescendants: Boolean(row.include_descendants),
          grantSource: String(row.grant_source),
        })),
        nextCursor: hasMore ? Number(page.at(-1)?.id ?? 0) : null,
      },
      { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
