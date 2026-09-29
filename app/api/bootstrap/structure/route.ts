import { getD1 } from "../../../../db";
import { apiError, organizationScopeIds, requireActor } from "../../../../lib/auth";
import { jsonWithEtag } from "../../../../lib/shared/etag";

export const dynamic = "force-dynamic";

/**
 * Organizations and departments visible to the actor (same scope bootstrap used
 * to embed). Loaded on demand by pickers and admin pages; ETag/304 on refresh.
 */
export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const db = await getD1();
    const [organizationIds, departmentsResult, organizationsResult] = await Promise.all([
      organizationScopeIds(actor, actor.permissions.canManageRoles || actor.permissions.canConfigure),
      db
        .prepare(
          `SELECT d.*,o.name AS organization_name FROM app_departments d
        LEFT JOIN app_organizations o ON o.id=d.organization_id ORDER BY o.name,d.name`,
        )
        .all<Record<string, unknown>>(),
      db
        .prepare(
          `SELECT id,name,short_name,type,parent_id,region_code,tax_id,data_status,hierarchy_verified,active
        FROM app_organizations ORDER BY type,name`,
        )
        .all<Record<string, unknown>>(),
    ]);
    const organizationSet = new Set(organizationIds);
    return jsonWithEtag(request, {
      departments: departmentsResult.results
        .filter((row) => row.organization_id == null || organizationSet.has(Number(row.organization_id)))
        .map((row) => ({
          id: Number(row.id),
          name: String(row.name),
          organizationId: row.organization_id == null ? null : Number(row.organization_id),
          organization: String(row.organization_name ?? ""),
          parentId: row.parent_id == null ? null : Number(row.parent_id),
          active: Boolean(row.active),
        })),
      organizations: organizationsResult.results
        .filter((row) => organizationSet.has(Number(row.id)))
        .map((row) => ({
          id: Number(row.id),
          name: String(row.name),
          shortName: String(row.short_name ?? ""),
          type: String(row.type),
          parentId: row.parent_id == null ? null : Number(row.parent_id),
          regionCode: row.region_code ? String(row.region_code) : null,
          taxId: row.tax_id ? String(row.tax_id) : null,
          dataStatus: String(row.data_status ?? "manual"),
          hierarchyVerified: Boolean(row.hierarchy_verified),
          active: Boolean(row.active),
        })),
    });
  } catch (error) {
    return apiError(error);
  }
}
