import { apiError, assertSameOrigin, organizationScopeIds, requireActor } from "../../../lib/auth";
import { listReportOverview } from "../../../lib/reports";
import { readJsonBody } from "../../../lib/shared/body";
import {
  createReportTemplate,
  getReportAssignmentDetail,
  mutateReportAssignment,
  ReportVersionConflictError,
} from "../../../services/reports";

const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const url = new URL(request.url);
    const assignmentId = Number(url.searchParams.get("assignmentId"));
    if (!assignmentId) {
      return Response.json(await listReportOverview(actor, Math.max(0, Number(url.searchParams.get("cursor")) || 0)), {
        headers: NO_STORE,
      });
    }
    return Response.json(await getReportAssignmentDetail(actor, assignmentId), { headers: NO_STORE });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const payload = await readJsonBody(request);
    const scope = new Set(await organizationScopeIds(actor, actor.permissions.canManageRoles));
    const result = await createReportTemplate(actor, payload, scope);
    return result.created
      ? Response.json({ templateId: result.templateId, cycleId: result.cycleId }, { status: 201 })
      : Response.json({ templateId: result.templateId, cycleId: result.cycleId, alreadyCreated: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    return Response.json(await mutateReportAssignment(actor, await readJsonBody(request)));
  } catch (error) {
    if (error instanceof ReportVersionConflictError) {
      return Response.json({ error: error.message, code: error.code }, { status: 409 });
    }
    return apiError(error);
  }
}
