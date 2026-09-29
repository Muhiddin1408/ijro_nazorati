/** Canonical directory lookups for research executors and sources. */
import { ApiError } from "../../lib/errors";
import { eligibleResearchEmployee } from "../../lib/research-server";
import { type JsonRecord, type DirectorySelection, required, optionalId } from "./common";

export async function activeOrganizationById(db: D1Database, id: number) {
  const row = await db.prepare(
    "SELECT id,name,tax_id FROM app_organizations WHERE id=? AND active=1 LIMIT 1",
  ).bind(id).first<{ id: number; name: string; tax_id: string | null }>();
  if (!row) throw new ApiError(400, "Tanlangan ijrochi tashkilot faol katalogdan topilmadi.");
  return { id: Number(row.id), name: String(row.name), taxId: String(row.tax_id ?? "") };
}

export async function activeOrganizationByExactName(db: D1Database, value: unknown) {
  const name = required(value, "Ijrochi tashkilot", 220);
  const rows = await db.prepare(
    `SELECT id,name,tax_id FROM app_organizations
      WHERE active=1 AND (lower(name)=lower(?) OR lower(short_name)=lower(?))
      ORDER BY CASE WHEN lower(name)=lower(?) THEN 0 ELSE 1 END,id LIMIT 2`,
  ).bind(name, name, name).all<{ id: number; name: string; tax_id: string | null }>();
  if (rows.results.length !== 1) {
    throw new ApiError(400, rows.results.length
      ? "Tashkilot nomi bir nechta yozuvga mos keldi. Katalogdan tashkilot ID sini tanlang."
      : "Ijrochi tashkilot faol katalogdan topilmadi. Katalogdan tanlang.");
  }
  return { id: Number(rows.results[0].id), name: String(rows.results[0].name), taxId: String(rows.results[0].tax_id ?? "") };
}

export async function activeEmployeeById(db: D1Database, id: number, organizationId: number) {
  const row = await db.prepare(
    `SELECT id,full_name FROM app_employees
      WHERE id=? AND organization_id=? AND active=1 LIMIT 1`,
  ).bind(id, organizationId).first<{ id: number; full_name: string }>();
  if (!row) throw new ApiError(400, "Tanlangan loyiha rahbari ijrochi tashkilotning faol xodimi emas.");
  return { id: Number(row.id), name: String(row.full_name) };
}

export async function activeEmployeeByExactName(
  db: D1Database,
  value: unknown,
  organizationId: number,
) {
  const name = required(value, "Loyiha rahbari", 160);
  const rows = await db.prepare(
    `SELECT id,full_name FROM app_employees
      WHERE organization_id=? AND active=1 AND lower(full_name)=lower(?)
      ORDER BY id LIMIT 2`,
  ).bind(organizationId, name).all<{ id: number; full_name: string }>();
  if (rows.results.length !== 1) {
    throw new ApiError(400, rows.results.length
      ? "Xodim nomi bir nechta yozuvga mos keldi. Katalogdan xodim ID sini tanlang."
      : "Loyiha rahbari ijrochi tashkilotning faol xodimlar katalogidan topilmadi.");
  }
  return { id: Number(rows.results[0].id), name: String(rows.results[0].full_name) };
}

export async function resolveDirectorySelection(
  db: D1Database,
  payload: JsonRecord,
  domainId: number,
): Promise<DirectorySelection> {
  const organizationId = optionalId(payload.executorOrganizationId, "Ijrochi tashkilot ID si");
  const organization = organizationId
    ? await activeOrganizationById(db, organizationId)
    : await activeOrganizationByExactName(db, payload.organization);
  const employeeId = optionalId(payload.responsibleEmployeeId, "Loyiha rahbari ID si");
  const employee = employeeId
    ? await activeEmployeeById(db, employeeId, organization.id)
    : await activeEmployeeByExactName(db, payload.leader, organization.id);
  const eligible = await eligibleResearchEmployee(db, domainId, employee.id, organization.id);
  if (!eligible) {
    throw new ApiError(400, "Tanlangan loyiha rahbari ilmiy ma’lumotlar yo‘nalishida faol ijrochi sifatida biriktirilmagan.");
  }
  return {
    organizationId: organization.id,
    organizationName: organization.name,
    employeeId: employee.id,
    employeeName: employee.name,
  };
}

export async function resolveSourceOrganization(db: D1Database, payload: JsonRecord) {
  const id = optionalId(payload.sourceOrganizationId, "Manba tashkilot ID si");
  return id
    ? activeOrganizationById(db, id)
    : activeOrganizationByExactName(db, payload.sourceOrganization);
}
