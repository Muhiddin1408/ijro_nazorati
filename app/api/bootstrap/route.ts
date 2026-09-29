import { apiError, requireActor } from "../../../lib/auth";
import { jsonWithEtag } from "../../../lib/shared/etag";
import { buildBootstrap } from "../../../services/bootstrap";

export const dynamic = "force-dynamic";

/** First-screen payload; see services/bootstrap.ts. */
export async function GET(request: Request) {
  try {
    const actor = await requireActor({ allowPasswordChangeRequired: true });
    const payload = await buildBootstrap(actor);
    if (actor.mustChangePassword) {
      return Response.json(payload, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
    }
    return jsonWithEtag(request, payload);
  } catch (error) {
    return apiError(error);
  }
}
