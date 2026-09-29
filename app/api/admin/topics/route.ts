import { getD1 } from "../../../../db";
import { apiError, assertSameOrigin, audit, requireActor } from "../../../../lib/auth";
import { authorize } from "../../../../lib/policy";
import { topicManage } from "../../../../lib/policy/admin";

function validColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(topicManage(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const name = String(payload.name ?? "").trim();
    const description = String(payload.description ?? "")
      .trim()
      .slice(0, 500);
    const color = validColor(String(payload.color)) ? String(payload.color).toUpperCase() : "#1957D2";
    if (name.length < 3 || name.length > 160)
      return Response.json({ error: "Tematika nomi 3–160 belgidan iborat bo‘lsin" }, { status: 400 });
    const result = await (await getD1())
      .prepare("INSERT INTO app_task_topics (name,description,color,created_by_employee_id) VALUES (?,?,?,?)")
      .bind(name, description, color, actor.id)
      .run();
    const id = Number(result.meta.last_row_id);
    await audit(actor, "topic.created", "task_topic", id, { name, color });
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE"))
      return Response.json({ error: "Bu nomdagi tematika allaqachon mavjud" }, { status: 409 });
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(topicManage(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const id = Number(payload.id);
    const db = await getD1();
    const current = await db
      .prepare("SELECT * FROM app_task_topics WHERE id=?")
      .bind(id)
      .first<Record<string, unknown>>();
    if (!current) return Response.json({ error: "Tematika topilmadi" }, { status: 404 });
    const name = String(payload.name ?? current.name).trim();
    const description = String(payload.description ?? current.description ?? "")
      .trim()
      .slice(0, 500);
    const color = validColor(String(payload.color)) ? String(payload.color).toUpperCase() : String(current.color);
    const active = payload.active == null ? Boolean(current.active) : Boolean(payload.active);
    if (name.length < 3 || name.length > 160)
      return Response.json({ error: "Tematika nomi 3–160 belgidan iborat bo‘lsin" }, { status: 400 });
    await db
      .prepare(
        "UPDATE app_task_topics SET name=?,description=?,color=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
      .bind(name, description, color, active ? 1 : 0, id)
      .run();
    await audit(actor, "topic.updated", "task_topic", id, { name, color, active });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE"))
      return Response.json({ error: "Bu nomdagi tematika allaqachon mavjud" }, { status: 409 });
    return apiError(error);
  }
}
