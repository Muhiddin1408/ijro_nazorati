import { getD1 } from "../../../../db";
import { apiError, assertSameOrigin, audit, organizationScopeIds, requireActor } from "../../../../lib/auth";
import { authorize } from "../../../../lib/policy";
import { departmentManage, departmentUpdate, organizationInScope } from "../../../../lib/policy/admin";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(departmentManage(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const name = String(payload.name ?? "").trim();
    const parentId = payload.parentId ? Number(payload.parentId) : null;
    const organizationId = payload.organizationId ? Number(payload.organizationId) : actor.organizationId;
    if (name.length < 2 || name.length > 160)
      return Response.json({ error: "Bo‘lim nomi 2–160 belgidan iborat bo‘lishi kerak" }, { status: 400 });
    if (!organizationId) return Response.json({ error: "Bo‘lim uchun tashkilotni tanlang" }, { status: 400 });
    const db = await getD1();
    const scope = new Set(await organizationScopeIds(actor, actor.permissions.canManageRoles));
    await authorize(organizationInScope(scope.has(organizationId), "Tanlangan tashkilot vakolat doirangizga kirmaydi"));
    if (
      parentId &&
      !(await db
        .prepare("SELECT id FROM app_departments WHERE id=? AND organization_id=? AND active=1")
        .bind(parentId, organizationId)
        .first())
    ) {
      return Response.json({ error: "Yuqori bo‘lim shu tashkilotga tegishli bo‘lishi kerak" }, { status: 400 });
    }
    const result = await db
      .prepare("INSERT INTO app_departments (name, organization_id, parent_id) VALUES (?, ?, ?)")
      .bind(name, organizationId, parentId)
      .run();
    await audit(actor, "department.created", "department", Number(result.meta.last_row_id), {
      name,
      organizationId,
      parentId,
    });
    return Response.json({ id: Number(result.meta.last_row_id) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE"))
      return Response.json({ error: "Bunday bo‘lim mavjud" }, { status: 409 });
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(departmentManage(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const id = Number(payload.id);
    if (!id) return Response.json({ error: "Bo‘lim ID majburiy" }, { status: 400 });
    const db = await getD1();
    const current = await db
      .prepare("SELECT * FROM app_departments WHERE id=?")
      .bind(id)
      .first<Record<string, unknown>>();
    if (!current) return Response.json({ error: "Bo‘lim topilmadi" }, { status: 404 });
    const name = String(payload.name ?? current.name).trim();
    const organizationId =
      payload.organizationId === null
        ? null
        : payload.organizationId
          ? Number(payload.organizationId)
          : current.organization_id == null
            ? actor.organizationId
            : Number(current.organization_id);
    const parentId =
      payload.parentId === null
        ? null
        : payload.parentId
          ? Number(payload.parentId)
          : current.parent_id == null
            ? null
            : Number(current.parent_id);
    const active = payload.active == null ? Boolean(current.active) : Boolean(payload.active);
    if (name.length < 2 || name.length > 160)
      return Response.json({ error: "Bo‘lim nomi 2–160 belgidan iborat bo‘lishi kerak" }, { status: 400 });
    if (!organizationId) return Response.json({ error: "Bo‘lim uchun tashkilotni tanlang" }, { status: 400 });
    const scope = new Set(await organizationScopeIds(actor, actor.permissions.canManageRoles));
    await authorize(
      departmentUpdate({
        nextOrganizationInScope: scope.has(organizationId),
        currentOrganizationInScope: current.organization_id == null || scope.has(Number(current.organization_id)),
      }),
    );
    if (parentId === id) return Response.json({ error: "Bo‘lim o‘ziga yuqori bo‘lim bo‘la olmaydi" }, { status: 400 });
    if (parentId != null) {
      const parent = await db
        .prepare("SELECT id FROM app_departments WHERE id=? AND organization_id=? AND active=1")
        .bind(parentId, organizationId)
        .first();
      if (!parent) return Response.json({ error: "Tanlangan yuqori bo‘lim topilmadi yoki faol emas" }, { status: 400 });
      const cycle = await db
        .prepare(
          `WITH RECURSIVE ancestors(id, parent_id) AS (
           SELECT id, parent_id FROM app_departments WHERE id=?
           UNION
           SELECT d.id, d.parent_id FROM app_departments d JOIN ancestors a ON d.id=a.parent_id
         ) SELECT id FROM ancestors WHERE id=? LIMIT 1`,
        )
        .bind(parentId, id)
        .first();
      if (cycle)
        return Response.json(
          { error: "Yuqori bo‘lim tanlovi tashkiliy tuzilmada aylana hosil qiladi" },
          { status: 409 },
        );
    }
    if (current.organization_id != null && organizationId !== Number(current.organization_id)) {
      const related = await db
        .prepare(
          `SELECT
          (SELECT COUNT(*) FROM app_employees WHERE department_id=? AND active=1) AS employees,
          (SELECT COUNT(*) FROM app_departments WHERE parent_id=? AND active=1) AS children`,
        )
        .bind(id, id)
        .first<{ employees: number; children: number }>();
      if (Number(related?.employees ?? 0) || Number(related?.children ?? 0)) {
        return Response.json(
          { error: "Bo‘lim tashkilotini almashtirishdan oldin xodimlar va quyi bo‘limlarni ko‘chiring" },
          { status: 409 },
        );
      }
    }
    if (!active) {
      const [employees, children] = await Promise.all([
        db
          .prepare("SELECT COUNT(*) AS count FROM app_employees WHERE department_id=? AND active=1")
          .bind(id)
          .first<{ count: number }>(),
        db
          .prepare("SELECT COUNT(*) AS count FROM app_departments WHERE parent_id=? AND active=1")
          .bind(id)
          .first<{ count: number }>(),
      ]);
      if (Number(employees?.count ?? 0) > 0)
        return Response.json({ error: "Avval bo‘lim xodimlarini boshqa bo‘limga o‘tkazing" }, { status: 409 });
      if (Number(children?.count ?? 0) > 0)
        return Response.json({ error: "Avval quyi bo‘limlarni boshqa yuqori bo‘limga o‘tkazing" }, { status: 409 });
    }
    await db
      .prepare("UPDATE app_departments SET name=?, organization_id=?, parent_id=?, active=? WHERE id=?")
      .bind(name, organizationId, parentId, active ? 1 : 0, id)
      .run();
    await audit(actor, "department.updated", "department", id, { name, organizationId, parentId, active });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE"))
      return Response.json({ error: "Bunday bo‘lim nomi mavjud" }, { status: 409 });
    return apiError(error);
  }
}
