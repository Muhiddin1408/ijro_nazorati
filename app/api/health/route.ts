import { getD1 } from "../../../db";

/** Liveness + database check for Docker healthcheck and uptime monitors. No data is exposed. */
export async function GET() {
  try {
    const row = await (await getD1()).prepare("SELECT 1 AS ok").first<{ ok: number }>();
    if (row?.ok !== 1) throw new Error("database check failed");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Health check failed", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
