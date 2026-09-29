import { getRuntimeEnv } from "../../../../db";
import { apiError, assertSameOrigin, requireActor, requirePermission } from "../../../../lib/auth";
import { cleanupExpiredChatUploads } from "../../../../lib/chat-uploads";
import { ensureReportCycles } from "../../../../lib/reports";
import { processNotificationJobs } from "../../../../lib/telegram";

function safeEqual(a: string, b: string) {
  const aa = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let index = 0; index < aa.length; index += 1) diff |= aa[index] ^ bb[index];
  return diff === 0;
}

export async function POST(request: Request) {
  try {
    const { REMINDER_JOB_SECRET } = await getRuntimeEnv();
    const authorization = request.headers.get("authorization") ?? "";
    const secretAuthorized = Boolean(
      REMINDER_JOB_SECRET &&
        authorization.startsWith("Bearer ") &&
        safeEqual(authorization.slice(7), REMINDER_JOB_SECRET),
    );
    if (!secretAuthorized) {
      assertSameOrigin(request);
      requirePermission(await requireActor(), "canConfigure");
    }
    const [notifications, chatUploads, reportCycles] = await Promise.all([
      processNotificationJobs(100),
      cleanupExpiredChatUploads(100),
      // Only the scheduler (secret) advances report cycles, as the old cron did.
      secretAuthorized
        ? ensureReportCycles().then(
            () => "ok",
            (error) => {
              console.error("Recurring report cycle processing failed", error);
              return "failed";
            },
          )
        : Promise.resolve("skipped"),
    ]);
    return Response.json({ ok: true, ...notifications, chatUploads, reportCycles });
  } catch (error) {
    return apiError(error);
  }
}
