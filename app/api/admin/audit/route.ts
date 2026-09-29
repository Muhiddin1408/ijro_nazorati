import { apiError, requireActor } from "../../../../lib/auth";
import { AUDIT_EXPORT_LIMIT, listAuditLogs } from "../../../../lib/data";
import { authorize } from "../../../../lib/policy";
import { auditView } from "../../../../lib/policy/admin";

export const dynamic = "force-dynamic";

/** Paged, filterable audit log. `export=1` returns up to 10 000 rows and flags truncation. */
export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    await authorize(auditView(actor));
    const url = new URL(request.url);
    const exporting = url.searchParams.get("export") === "1";
    const page = await listAuditLogs(
      actor,
      {
        offset: exporting ? 0 : Number(url.searchParams.get("offset") ?? 0),
        limit: exporting ? AUDIT_EXPORT_LIMIT : Number(url.searchParams.get("limit") ?? 0),
        action: url.searchParams.get("action"),
        entityType: url.searchParams.get("entityType"),
        from: url.searchParams.get("from"),
        to: url.searchParams.get("to"),
      },
      exporting ? AUDIT_EXPORT_LIMIT : undefined,
    );
    return Response.json(
      { ...page, truncated: exporting && page.hasMore },
      {
        headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
      },
    );
  } catch (error) {
    return apiError(error);
  }
}
