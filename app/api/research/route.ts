import { getD1 } from "../../../db";
import { ApiError, apiError, assertSameOrigin, requireActor } from "../../../lib/auth";
import { cleanText, getResearchDashboard, researchAccessContext } from "../../../lib/research-server";
import { assertReportsResearchRoute, handleResearchAction, requestPayload } from "../../../services/research";

export async function GET(request: Request) {
  try {
    assertReportsResearchRoute(request);
    const actor = await requireActor();
    const db = await getD1();
    const url = new URL(request.url);
    return Response.json(
      await getResearchDashboard(actor, db, {
        eventsProjectId: Number(url.searchParams.get("eventsProjectId")) || null,
        eventsBefore: Number(url.searchParams.get("eventsBefore")) || null,
      }),
      {
        headers: { "cache-control": "private, no-store", Vary: "Cookie" },
      },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertReportsResearchRoute(request);
    assertSameOrigin(request);
    const actor = await requireActor();
    const payload = await requestPayload(request);
    const action = cleanText(payload.action, 60);
    if (!action) throw new ApiError(400, "Amal turi ko‘rsatilmagan.");
    const db = await getD1();
    const context = await researchAccessContext(actor, db);
    return await handleResearchAction({ action, actor, payload, db, context });
  } catch (error) {
    return apiError(error);
  }
}
