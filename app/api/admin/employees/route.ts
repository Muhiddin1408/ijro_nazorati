import { apiError, assertSameOrigin, requireActor } from "../../../../lib/auth";
import { authorize } from "../../../../lib/policy";
import { organizationAdmin } from "../../../../lib/policy/admin";
import { createEmployee, updateEmployee } from "../../../../services/employees";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(organizationAdmin(actor));
    const result = await createEmployee(actor, (await request.json()) as Record<string, unknown>);
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xodim saqlanmadi";
    if (message.includes("UNIQUE"))
      return Response.json({ error: "Bu email yoki login allaqachon ishlatilmoqda" }, { status: 409 });
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(organizationAdmin(actor));
    return Response.json(await updateEmployee(actor, (await request.json()) as Record<string, unknown>));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xodim yangilanmadi";
    if (message.includes("last_active_admin"))
      return Response.json({ error: "Tizimda kamida bitta faol administrator qolishi shart" }, { status: 409 });
    if (message.includes("UNIQUE"))
      return Response.json({ error: "Bu email yoki login boshqa xodimga tegishli" }, { status: 409 });
    return apiError(error);
  }
}
