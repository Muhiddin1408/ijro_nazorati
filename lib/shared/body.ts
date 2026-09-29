import { ApiError } from "../errors";

/** Default ceiling for JSON request bodies (reports, information records, research). */
export const DEFAULT_JSON_BODY_LIMIT = 2 * 1024 * 1024;

const TOO_LARGE = "So‘rov hajmi juda katta. Ma’lumotni qismlarga bo‘lib yuboring.";

/**
 * Reads a JSON object body without buffering more than `maxBytes`: a declared
 * Content-Length is rejected up front, and the stream is cut off once the
 * limit is exceeded (chunked bodies carry no length).
 */
export async function readJsonBody<T = Record<string, unknown>>(
  request: Request,
  maxBytes = DEFAULT_JSON_BODY_LIMIT,
  invalidMessage = "So‘rov ma’lumotlari noto‘g‘ri.",
): Promise<T> {
  const declared = Number(request.headers.get("content-length") ?? NaN);
  if (Number.isFinite(declared) && declared > maxBytes) throw new ApiError(413, TOO_LARGE);
  if (!request.body) throw new ApiError(400, invalidMessage);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new ApiError(413, TOO_LARGE);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ApiError(400, invalidMessage);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new ApiError(400, invalidMessage);
  return parsed as T;
}
