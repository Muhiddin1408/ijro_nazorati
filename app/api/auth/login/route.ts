import { apiError, assertSameOrigin, isSecureRequest } from "../../../../lib/auth";
import { loginWithPassword } from "../../../../services/accounts";

/** Caddy/nginx set X-Real-IP from the TCP peer and overwrite any client-supplied value. */
function clientIp(request: Request) {
  const value = request.headers.get("x-real-ip")?.trim();
  return value && value.length <= 64 ? value : "unknown";
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const payload = (await request.json()) as Record<string, unknown>;
    const session = await loginWithPassword({
      username: payload.username,
      password: payload.password,
      remember: payload.remember,
      ip: clientIp(request),
    });
    const responseHeaders = new Headers();
    const secure = isSecureRequest(request) ? "; Secure" : "";
    responseHeaders.append(
      "Set-Cookie",
      `ijro_session=${encodeURIComponent(session.token)}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${session.maxAge}`,
    );
    responseHeaders.append("Set-Cookie", `ijro_login_only=1${secure}; SameSite=Lax; Path=/; Max-Age=31536000`);
    return Response.json({ ok: true, mustChangePassword: session.mustChangePassword }, { headers: responseHeaders });
  } catch (error) {
    return apiError(error);
  }
}
