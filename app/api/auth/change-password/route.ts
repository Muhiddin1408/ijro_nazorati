import { apiError, assertSameOrigin, requireActor } from "../../../../lib/auth";
import { changePassword } from "../../../../services/accounts";

function sessionToken(request: Request) {
  for (const part of String(request.headers.get("cookie") ?? "").split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name !== "ijro_session") continue;
    try {
      return decodeURIComponent(value.join("="));
    } catch {
      return null;
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor({ allowPasswordChangeRequired: true });
    const payload = (await request.json()) as Record<string, unknown>;
    await changePassword(actor, {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      username: payload.username,
      sessionToken: sessionToken(request),
    });
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
