import { apiError, assertSameOrigin } from "../../../../lib/auth";
import { activateAccount } from "../../../../services/accounts";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const payload = (await request.json()) as Record<string, unknown>;
    const { name } = await activateAccount({
      token: payload.token,
      username: payload.username,
      password: payload.password,
    });
    return Response.json({ ok: true, name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE")) return Response.json({ error: "Bu login band" }, { status: 409 });
    return apiError(error);
  }
}
