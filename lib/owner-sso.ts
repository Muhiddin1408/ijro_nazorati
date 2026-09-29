import { getD1, getRuntimeEnv } from "../db";

/** Only the verified Sites dispatcher may enable these forwarded headers. */
export async function ownerSsoEmployeeId(requestHeaders: Headers): Promise<number | null> {
  const subject = requestHeaders.get("oai-authenticated-user-id")?.trim();
  if (!subject || subject.length > 512) return null;
  const env = await getRuntimeEnv();
  if (env.TRUST_OAI_AUTHENTICATED_USER_HEADER !== "true") return null;
  const ownerEmail = env.OWNER_SSO_EMAIL?.trim().toLowerCase();
  const email = requestHeaders.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!ownerEmail) return null;
  const db = await getD1();
  const existing = await db.prepare("SELECT employee_id FROM app_owner_identities WHERE subject=? AND owner_email=?")
    .bind(subject, ownerEmail).first<{ employee_id: number }>();
  if (existing) return Number(existing.employee_id);
  // Email is used only to enroll the explicitly configured owner once. All
  // later authorization uses the stable, Site-scoped platform subject.
  if (email !== ownerEmail) return null;
  const employee = await db.prepare(`SELECT e.id FROM app_employees e
    JOIN app_roles r ON r.id=e.role_id AND r.active=1
    WHERE lower(e.email)=? AND e.active=1 LIMIT 1`).bind(ownerEmail).first<{ id: number }>();
  if (!employee) return null;
  await db.prepare(`INSERT INTO app_owner_identities (subject,employee_id,owner_email)
    VALUES (?,?,?) ON CONFLICT DO NOTHING`).bind(subject, employee.id, ownerEmail).run();
  const bound = await db.prepare("SELECT employee_id FROM app_owner_identities WHERE subject=? AND employee_id=? AND owner_email=?")
    .bind(subject, employee.id, ownerEmail).first<{ employee_id: number }>();
  return bound ? Number(bound.employee_id) : null;
}
