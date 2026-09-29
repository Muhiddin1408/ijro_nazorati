import { readJson } from "../../dashboard-kit";
import type { BootstrapPayload } from "./dashboard-types";

type Cached<T> = { etag: string; payload: T };
export const conditionalCache = new Map<string, Cached<unknown>>();

/** GET with If-None-Match: a 304 reuses the last payload instead of re-downloading it. */
export async function conditionalJson<T>(url: string): Promise<T> {
  const cached = conditionalCache.get(url) as Cached<T> | undefined;
  const response = await fetch(url, { cache: "no-store", headers: cached ? { "If-None-Match": cached.etag } : {} });
  if (response.status === 304 && cached) return cached.payload;
  const payload = await readJson<T>(response);
  const etag = response.headers.get("etag");
  if (etag) conditionalCache.set(url, { etag, payload });
  else conditionalCache.delete(url);
  return payload;
}

let pendingBootstrapRequest: Promise<BootstrapPayload> | null = null;
export function requestBootstrap(forceFresh = false): Promise<BootstrapPayload> {
  if (pendingBootstrapRequest) {
    const current = pendingBootstrapRequest;
    return forceFresh ? current.then(() => requestBootstrap(false)) : current;
  }
  const request = conditionalJson<BootstrapPayload>("/api/bootstrap");
  pendingBootstrapRequest = request;
  return request.finally(() => {
    if (pendingBootstrapRequest === request) pendingBootstrapRequest = null;
  });
}
