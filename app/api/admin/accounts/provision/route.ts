import { apiError, assertSameOrigin, requireActor } from "../../../../../lib/auth";
import { authorize } from "../../../../../lib/policy";
import { accountProvision } from "../../../../../lib/policy/admin";
import { provisionAccounts } from "../../../../../services/accounts";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(accountProvision(actor));
    const result = await provisionAccounts(actor, (await request.json()) as Record<string, unknown>);
    return Response.json(
      {
        generatedAt: result.generatedAt,
        oneTimeDownload: true,
        notice:
          "Vaqtinchalik parollar serverda ochiq ko‘rinishda saqlanmaydi. Ushbu javob yopilgach ularni faqat qayta chiqarish mumkin.",
        accounts: result.accounts,
        skipped: result.skipped,
        nextCursor: result.nextCursor,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "X-Content-Type-Options": "nosniff",
          Vary: "Cookie",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Akkauntlar yaratilmadi";
    if (message.includes("UNIQUE"))
      return Response.json({ error: "Login to‘qnashuvi yuz berdi; qayta urinib ko‘ring" }, { status: 409 });
    return apiError(error);
  }
}
