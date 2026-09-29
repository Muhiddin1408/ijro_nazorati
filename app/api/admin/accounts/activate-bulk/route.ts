import { apiError, assertSameOrigin, publicOrigin, requireActor } from "../../../../../lib/auth";
import { authorize } from "../../../../../lib/policy";
import { accountActivateBulk } from "../../../../../lib/policy/admin";
import { createActivationLinks } from "../../../../../services/accounts";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(accountActivateBulk(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await createActivationLinks(actor, payload.employeeIds, publicOrigin(request));
    return Response.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
