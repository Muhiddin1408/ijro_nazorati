import { getD1 } from "../../../../db";
import { apiError, assertSameOrigin, isSecureRequest } from "../../../../lib/auth";
import { sha256 } from "../../../../lib/password";

function sessionCookie(request: Request) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === "ijro_session") return decodeURIComponent(value.join("="));
  }
  return null;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const token = sessionCookie(request);
    if (token)
      await (
        await getD1()
      )
        .prepare("DELETE FROM app_sessions WHERE token_hash=?")
        .bind(await sha256(token))
        .run();
    const responseHeaders = new Headers();
    const secure = isSecureRequest(request) ? "; Secure" : "";
    responseHeaders.append("Set-Cookie", `ijro_session=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`);
    responseHeaders.append("Set-Cookie", `ijro_login_only=1${secure}; SameSite=Lax; Path=/; Max-Age=31536000`);
    return Response.json({ ok: true }, { headers: responseHeaders });
  } catch (error) {
    return apiError(error);
  }
}
