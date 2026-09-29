export type ApiErrorPayload = {
  error?: string;
  validation?: { errors?: Array<{ message: string }> };
};

/** Thrown for HTTP 401 so the shell can drop stale data and show the login screen. */
export class SessionExpiredError extends Error {
  constructor(message = "Sessiya tugagan. Qaytadan tizimga kiring.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

const NON_JSON_MESSAGE = "Server kutilmagan javob qaytardi. Sahifani yangilab, qayta urinib ko‘ring.";

function statusMessage(status: number) {
  if (status === 401) return "Sessiya tugagan. Qaytadan tizimga kiring.";
  if (status === 403) return "Bu amal uchun vakolatingiz yo‘q";
  if (status === 404) return "Ma’lumot topilmadi";
  if (status === 413) return "Yuborilgan ma’lumot juda katta";
  if (status === 429) return "So‘rovlar juda ko‘p. Birozdan keyin qayta urinib ko‘ring.";
  if (status >= 500) return "Serverda xatolik yuz berdi. Birozdan keyin qayta urinib ko‘ring.";
  return NON_JSON_MESSAGE;
}

/**
 * Parses an API response. Non-JSON bodies (proxy error pages, HTML) never leak
 * as "Unexpected token '<'"; they become a readable Uzbek message instead.
 */
export async function readJson<T>(response: Response, fallbackError = "Amal bajarilmadi"): Promise<T> {
  const text = await response.text();
  let payload: (T & ApiErrorPayload) | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as T & ApiErrorPayload;
    } catch {
      if (response.status === 401) throw new SessionExpiredError();
      throw new Error(response.ok ? NON_JSON_MESSAGE : statusMessage(response.status));
    }
  }
  if (response.status === 401) throw new SessionExpiredError(payload?.error || undefined);
  if (!response.ok) {
    const issues = payload?.validation?.errors;
    if (issues?.length) throw new Error(issues.slice(0, 8).map((issue) => issue.message).join("\n"));
    throw new Error(payload?.error || (response.status >= 500 ? statusMessage(response.status) : fallbackError));
  }
  return (payload ?? {}) as T;
}
