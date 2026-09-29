import { getD1 } from "../../../../db";
import { apiError, assertSameOrigin, audit, organizationScopeIds, requireActor } from "../../../../lib/auth";
import { authorize } from "../../../../lib/policy";
import {
  organizationAdmin,
  organizationCreate,
  organizationSystemWide,
  organizationUpdate,
} from "../../../../lib/policy/admin";

const types = new Set(["central", "territorial", "district", "direct_subordinate"]);

async function validateParent(type: string, parentId: number | null, ownId?: number) {
  const db = await getD1();
  if (type === "central") {
    if (parentId != null) return "Markaziy apparat yuqori tashkilotga ega bo‘lmaydi";
    const existing = await db
      .prepare("SELECT id FROM app_organizations WHERE type='central' AND active=1 AND id!=? LIMIT 1")
      .bind(ownId ?? -1)
      .first();
    if (existing) return "Tizimda markaziy apparat allaqachon mavjud";
    return null;
  }
  if (!parentId) return "Yuqori tashkilotni tanlang";
  if (parentId === ownId) return "Tashkilot o‘ziga bo‘ysuna olmaydi";
  const parent = await db
    .prepare("SELECT id,type,parent_id FROM app_organizations WHERE id=? AND active=1")
    .bind(parentId)
    .first<Record<string, unknown>>();
  if (!parent) return "Yuqori tashkilot topilmadi";
  if (type === "territorial" && String(parent.type) !== "central") return "Hududiy bosh boshqarma Qo‘mitaga bo‘ysunadi";
  if (type === "district" && String(parent.type) !== "territorial")
    return "Tuman tashkiloti hududiy bosh boshqarmaga bo‘ysunadi";
  if (type === "direct_subordinate" && String(parent.type) !== "central")
    return "To‘g‘ridan-to‘g‘ri bo‘ysunuvchi tashkilot Qo‘mitaga biriktiriladi";
  let current: Record<string, unknown> | null = parent;
  const visited = new Set<number>();
  while (current) {
    const id = Number(current.id);
    if (id === ownId) return "Tashkilotlar zanjirida aylana hosil bo‘ladi";
    if (visited.has(id) || current.parent_id == null) break;
    visited.add(id);
    current =
      (await db
        .prepare("SELECT id,type,parent_id FROM app_organizations WHERE id=?")
        .bind(Number(current.parent_id))
        .first<Record<string, unknown>>()) ?? null;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(organizationAdmin(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const name = String(payload.name ?? "").trim();
    const shortName = String(payload.shortName ?? "")
      .trim()
      .slice(0, 80);
    const type = String(payload.type ?? "");
    const parentId = payload.parentId ? Number(payload.parentId) : null;
    if (name.length < 3 || name.length > 240 || !types.has(type))
      return Response.json({ error: "Tashkilot nomi va turi to‘g‘ri kiritilishi kerak" }, { status: 400 });
    const systemWide = organizationSystemWide(actor);
    const scope = new Set(await organizationScopeIds(actor, systemWide));
    await authorize(organizationCreate(actor, { type, parentId, parentInScope: scope.has(parentId ?? -1) }));
    const parentError = await validateParent(type, parentId);
    if (parentError) return Response.json({ error: parentError }, { status: 400 });
    const result = await (
      await getD1()
    )
      .prepare("INSERT INTO app_organizations (name,short_name,type,parent_id,region_code) VALUES (?,?,?,?,?)")
      .bind(name, shortName, type, parentId, String(payload.regionCode ?? "").trim() || null)
      .run();
    const id = Number(result.meta.last_row_id);
    await audit(actor, "organization.created", "organization", id, { name, type, parentId });
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE"))
      return Response.json({ error: "Bunday tashkilot allaqachon mavjud" }, { status: 409 });
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(organizationAdmin(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const id = Number(payload.id);
    const db = await getD1();
    const current = await db
      .prepare("SELECT * FROM app_organizations WHERE id=?")
      .bind(id)
      .first<Record<string, unknown>>();
    if (!current) return Response.json({ error: "Tashkilot topilmadi" }, { status: 404 });
    const systemWide = organizationSystemWide(actor);
    const scope = new Set(await organizationScopeIds(actor, systemWide));
    await authorize(organizationUpdate(scope.has(id)));
    const name = String(payload.name ?? current.name).trim();
    const type = systemWide && types.has(String(payload.type)) ? String(payload.type) : String(current.type);
    const parentId = systemWide
      ? payload.parentId === null
        ? null
        : payload.parentId
          ? Number(payload.parentId)
          : current.parent_id == null
            ? null
            : Number(current.parent_id)
      : current.parent_id == null
        ? null
        : Number(current.parent_id);
    const active = payload.active == null ? Boolean(current.active) : Boolean(payload.active);
    const parentError = await validateParent(type, parentId, id);
    if (parentError) return Response.json({ error: parentError }, { status: 400 });
    if (type !== String(current.type)) {
      const children = await db
        .prepare("SELECT COUNT(*) AS count FROM app_organizations WHERE parent_id=? AND active=1")
        .bind(id)
        .first<{ count: number }>();
      if (Number(children?.count ?? 0)) {
        return Response.json(
          { error: "Tashkilot turini almashtirishdan oldin quyi tashkilotlarni ko‘chiring" },
          { status: 409 },
        );
      }
    }
    if (!active) {
      const related = await db
        .prepare(
          `SELECT
          (SELECT COUNT(*) FROM app_organizations WHERE parent_id=? AND active=1) AS children,
          (SELECT COUNT(*) FROM app_employees WHERE organization_id=? AND active=1) AS employees`,
        )
        .bind(id, id)
        .first<{ children: number; employees: number }>();
      if (Number(related?.children ?? 0) || Number(related?.employees ?? 0)) {
        return Response.json(
          { error: "Avval quyi tashkilotlar va xodimlarni boshqa tashkilotga o‘tkazing" },
          { status: 409 },
        );
      }
    }
    await db
      .prepare(
        `UPDATE app_organizations SET name=?,short_name=?,type=?,parent_id=?,region_code=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      )
      .bind(
        name,
        String(payload.shortName ?? current.short_name ?? "")
          .trim()
          .slice(0, 80),
        type,
        parentId,
        String(payload.regionCode ?? current.region_code ?? "").trim() || null,
        active ? 1 : 0,
        id,
      )
      .run();
    await audit(actor, "organization.updated", "organization", id, { name, type, parentId, active });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE"))
      return Response.json({ error: "Bunday tashkilot allaqachon mavjud" }, { status: 409 });
    return apiError(error);
  }
}
