/**
 * In-process scheduler (replaces the Cloudflare cron trigger). Every minute the
 * server calls its own authenticated job endpoint, so the jobs run inside the
 * same process that owns the SQLite connection.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const secret = process.env.REMINDER_JOB_SECRET;
  if (!secret || process.env.DISABLE_SCHEDULER === "true") {
    console.warn("Scheduler disabled: set REMINDER_JOB_SECRET to run Telegram reminders and report cycles.");
    return;
  }
  const port = process.env.PORT ?? "3000";
  const intervalMs = Math.max(15_000, Number(process.env.SCHEDULER_INTERVAL_MS ?? 60_000));
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/reminders/process`, {
        method: "POST",
        headers: { authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(55_000),
      });
      if (!response.ok) console.error("Scheduled job failed", response.status, await response.text().catch(() => ""));
    } catch (error) {
      console.error("Scheduled job failed", error);
    } finally {
      running = false;
    }
  };
  // Hourly call; the endpoint makes at most one snapshot per UTC day.
  const maintenance = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/maintenance/run`, {
        method: "POST",
        headers: { authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(600_000),
      });
      if (!response.ok) console.error("Daily maintenance failed", response.status);
    } catch (error) {
      console.error("Daily maintenance failed", error);
    }
  };
  setTimeout(() => {
    void tick();
    setInterval(() => void tick(), intervalMs).unref();
    void maintenance();
    setInterval(() => void maintenance(), 60 * 60_000).unref();
  }, 10_000).unref();
}
