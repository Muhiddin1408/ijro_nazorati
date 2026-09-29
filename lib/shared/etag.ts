/**
 * Weak comparison (RFC 9110 §8.8.3.2) that also tolerates the suffix a
 * compressing proxy adds: Caddy/nginx turn "abc" into "abc-gzip" or W/"abc".
 */
export function etagMatches(ifNoneMatch: string | null, etag: string) {
  if (!ifNoneMatch) return false;
  const opaque = (value: string) =>
    value
      .trim()
      .replace(/^W\//, "")
      .replace(/^"(.*)"$/, "$1")
      .replace(/-(gzip|zstd|br|deflate)$/, "");
  const wanted = opaque(etag);
  return ifNoneMatch.split(",").some((value) => value.trim() === "*" || opaque(value) === wanted);
}

/** Strong ETag of a serialized body (first 128 bits of SHA-256). */
export async function etagFor(text: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  let hex = "";
  for (const byte of digest.slice(0, 16)) hex += byte.toString(16).padStart(2, "0");
  return `"${hex}"`;
}

/**
 * JSON response with a strong ETag over the serialized body. A matching
 * If-None-Match returns 304 so periodic refreshes skip the transfer.
 */
export async function jsonWithEtag(request: Request, body: unknown, headers: Record<string, string> = {}) {
  const text = JSON.stringify(body);
  const etag = await etagFor(text);
  const common = { ...headers, ETag: etag, "Cache-Control": "private, no-cache", Vary: "Cookie" };
  if (etagMatches(request.headers.get("if-none-match"), etag)) {
    return new Response(null, { status: 304, headers: common });
  }
  return new Response(text, { status: 200, headers: { ...common, "Content-Type": "application/json" } });
}
