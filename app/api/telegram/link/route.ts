import { getD1 } from "../../../../db";
import { apiError, assertSameOrigin, audit, requireActor } from "../../../../lib/auth";
import { authorize } from "../../../../lib/policy";
import { telegramLinkFor } from "../../../../lib/policy/admin";
import { createTelegramLink } from "../../../../lib/telegram";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    const payload = (await request.json()) as { employeeId?: number };
    const employeeId = Number(payload.employeeId ?? actor.id);
    const forAnotherEmployee = employeeId !== actor.id;
    await authorize(telegramLinkFor(actor, employeeId));
    const employee = await (await getD1())
      .prepare("SELECT id FROM app_employees WHERE id=? AND active=1")
      .bind(employeeId)
      .first();
    if (!employee) return Response.json({ error: "Faol xodim topilmadi" }, { status: 404 });
    const link = await createTelegramLink(employeeId, actor.id);
    await audit(
      actor,
      forAnotherEmployee ? "telegram.link_created_for_employee" : "telegram.link_created",
      "employee",
      employeeId,
      {
        expiresAt: link.expiresAt,
        createdByEmployeeId: actor.id,
        createdByName: actor.name,
        targetEmployeeId: employeeId,
      },
    );
    return Response.json({ link });
  } catch (error) {
    return apiError(error);
  }
}
