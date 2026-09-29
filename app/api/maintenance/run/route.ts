import { timingSafeEqual } from "node:crypto";
import { runDailyMaintenance } from "../../../../lib/maintenance";

function authorized(request: Request) {
  const secret = process.env.REMINDER_JOB_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret || !header.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Scheduler-only endpoint (see instrumentation.ts). */
export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Ruxsat yo‘q" }, { status: 401 });
  try {
    return Response.json({ ok: true, ...(await runDailyMaintenance()) });
  } catch (error) {
    console.error("Daily maintenance failed", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
