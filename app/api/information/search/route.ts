import { getRuntimeEnv } from "../../../../db";
import { ApiError, apiError, assertSameOrigin, requireActor } from "../../../../lib/auth";
import { searchInformation } from "../../../../lib/information-search";
import { addInformationAiAnswer, aiSearchSources } from "../../../../lib/information-ai";

async function readQuery(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Savol yuborilmadi");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > 4096) {
      await reader.cancel();
      throw new ApiError(413, "Savol juda uzun");
    }
    chunks.push(chunk.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const input = JSON.parse(new TextDecoder().decode(bytes));
    if (!input || typeof input !== "object" || Array.isArray(input) || typeof input.query !== "string")
      throw new Error();
    return input as { query: string; kind?: string; status?: string; page?: number; answer?: boolean };
  } catch {
    throw new ApiError(400, "Qidiruv so‘rovi noto‘g‘ri");
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const input = await readQuery(request);
    const env = await getRuntimeEnv();
    let result = await searchInformation(env.DB, actor, input);
    result.aiStatus = !env.OPENAI_API_KEY ? "not_configured" : aiSearchSources(result).length ? "ready" : "no_sources";
    if (input.answer === true && env.OPENAI_API_KEY && aiSearchSources(result).length) {
      // Atomic, per-user budget: maximum six attempts per minute and 100 per day.
      const reservation = await env.DB.prepare(
        `INSERT INTO app_audit_logs (actor_employee_id,action,entity_type,entity_id,detail_json)
        SELECT ?,'information.ai_request','information_search',0,'{}'
        WHERE (SELECT COUNT(*) FROM app_audit_logs WHERE actor_employee_id=? AND action='information.ai_request' AND created_at>=datetime('now','-1 minute'))<6
          AND (SELECT COUNT(*) FROM app_audit_logs WHERE actor_employee_id=? AND action='information.ai_request' AND created_at>=datetime('now','-1 day'))<100`,
      )
        .bind(actor.id, actor.id, actor.id)
        .run();
      if (Number(reservation.meta.changes) !== 1)
        throw new ApiError(
          429,
          "AI so‘rovlari chegarasiga yetdingiz. Birozdan keyin qayta urinib ko‘ring. Oddiy qidiruv ishlashda davom etadi.",
        );
      result = await addInformationAiAnswer(result, env, request.signal);
    }
    return Response.json(result, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
  } catch (error) {
    return apiError(error);
  }
}
