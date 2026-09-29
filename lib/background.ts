import { after } from "next/server";

/** Runs work after the response is sent; outside a request it simply starts it. */
export function runInBackground(task: () => Promise<unknown>) {
  const guarded = () => task().catch((error) => console.error("Background task failed", error));
  try {
    after(guarded);
  } catch {
    void guarded();
  }
}
