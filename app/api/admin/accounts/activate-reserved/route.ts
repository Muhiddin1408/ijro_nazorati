import { getD1 } from "../../../../../db";
import { applicationRoleForProfile } from "../../../../../lib/access-control";
import { apiError, assertSameOrigin, audit, requireActor } from "../../../../../lib/auth";
import { isSupportedPasswordIterations } from "../../../../../lib/password";
import { authorize } from "../../../../../lib/policy";
import { accountActivateReserved } from "../../../../../lib/policy/admin";

const TEMPORARY_PASSWORD_DAYS = 30;
const RESERVED_SECRET_MAX_AGE_DAYS = 90;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireActor();
    await authorize(accountActivateReserved(actor));
    const payload = (await request.json()) as Record<string, unknown>;
    const staffPositionId = Number(payload.staffPositionId);
    const employeeId = Number(payload.employeeId);
    const slotNumber = payload.slotNumber == null ? null : Number(payload.slotNumber);
    if (
      !Number.isSafeInteger(staffPositionId) ||
      staffPositionId <= 0 ||
      !Number.isSafeInteger(employeeId) ||
      employeeId <= 0
    ) {
      return Response.json({ error: "Lavozim va xodimni tanlang" }, { status: 400 });
    }
    if (slotNumber != null && (!Number.isSafeInteger(slotNumber) || slotNumber <= 0)) {
      return Response.json({ error: "Lavozim o‘rni raqami noto‘g‘ri" }, { status: 400 });
    }
    const db = await getD1();
    const occupancy = await db
      .prepare(
        `SELECT x.id,p.title,p.organization_id,p.department_id,e.full_name,e.role_id,r.code AS role_code
         FROM app_position_occupancies x
         JOIN app_staff_positions p ON p.id=x.staff_position_id AND p.active=1
         JOIN app_employees e ON e.id=x.employee_id AND e.active=1
         JOIN app_roles r ON r.id=e.role_id
        WHERE x.staff_position_id=? AND x.employee_id=? AND x.ends_at IS NULL LIMIT 1`,
      )
      .bind(staffPositionId, employeeId)
      .first<Record<string, unknown>>();
    if (!occupancy) {
      return Response.json({ error: "Xodim ushbu lavozimga amalda biriktirilmagan" }, { status: 409 });
    }
    const existing = await db
      .prepare("SELECT employee_id FROM app_user_credentials WHERE employee_id=?")
      .bind(employeeId)
      .first();
    if (existing) {
      return Response.json(
        { error: "Xodimning shaxsiy akkaunti mavjud. Yangi parol kerak bo‘lsa qayta chiqarishdan foydalaning" },
        { status: 409 },
      );
    }
    const reserved = await db
      .prepare(
        `SELECT * FROM app_position_credentials
        WHERE staff_position_id=? AND status='reserved' ${slotNumber == null ? "" : "AND slot_number=?"}
        ORDER BY slot_number LIMIT 1`,
      )
      .bind(staffPositionId, ...(slotNumber == null ? [] : [slotNumber]))
      .first<Record<string, unknown>>();
    if (!reserved) return Response.json({ error: "Ushbu lavozim uchun rezerv akkaunt topilmadi" }, { status: 404 });
    const generatedAt = Date.parse(String(reserved.generated_at ?? ""));
    if (!Number.isFinite(generatedAt) || generatedAt < Date.now() - RESERVED_SECRET_MAX_AGE_DAYS * 24 * 60 * 60_000) {
      return Response.json(
        {
          error: "Rezerv parol xavfsizlik muddati tugagan. Avval ushbu o‘rin uchun login-parolni qayta chiqaring",
          reissueRequired: true,
        },
        { status: 410 },
      );
    }
    if (!isSupportedPasswordIterations(Number(reserved.password_iterations))) {
      return Response.json(
        {
          error: "Rezerv parol joriy server xavfsizlik formatiga mos emas. Avval login-parolni qayta chiqaring",
          reissueRequired: true,
        },
        { status: 409 },
      );
    }

    const profile = await db
      .prepare(
        `SELECT p.id,p.code FROM app_access_profile_assignments a
       JOIN app_access_profiles p ON p.id=a.access_profile_id AND p.active=1
       WHERE a.principal_type='staff_position' AND a.principal_id=? AND a.active=1
       ORDER BY p.can_approve_information DESC,p.can_verify_information DESC,p.can_enter_information DESC LIMIT 1`,
      )
      .bind(staffPositionId)
      .first<{ id: number; code: string }>();
    if (!profile) return Response.json({ error: "Lavozimning vakolat profili aniqlanmagan" }, { status: 409 });
    const roleCode = applicationRoleForProfile(
      String(profile.code),
      String(occupancy.role_code),
      String(occupancy.title ?? ""),
    );
    const expiresAt = new Date(Date.now() + TEMPORARY_PASSWORD_DAYS * 24 * 60 * 60_000).toISOString();
    await db.batch([
      db
        .prepare(
          `INSERT INTO app_user_credentials
          (employee_id,username,username_normalized,password_hash,password_salt,password_iterations,must_change_password,temporary_expires_at)
         VALUES (?,?,?,?,?,?,1,?)`,
        )
        .bind(
          employeeId,
          reserved.username,
          reserved.username_normalized,
          reserved.password_hash,
          reserved.password_salt,
          reserved.password_iterations,
          expiresAt,
        ),
      db
        .prepare(
          `UPDATE app_position_credentials SET status='assigned',assigned_employee_id=?,activated_at=CURRENT_TIMESTAMP,
          updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='reserved'`,
        )
        .bind(employeeId, Number(reserved.id)),
      db
        .prepare(
          `UPDATE app_access_profile_assignments SET active=0,updated_at=CURRENT_TIMESTAMP
          WHERE principal_type='employee' AND principal_id=?
            AND grant_source IN ('migration_role_mapping','credential_provisioning','position_occupancy')`,
        )
        .bind(employeeId),
      db
        .prepare(
          `INSERT INTO app_access_profile_assignments
          (principal_type,principal_id,access_profile_id,scope_type,scope_id,include_descendants,grant_source,created_by_employee_id)
         SELECT 'employee',?,access_profile_id,scope_type,scope_id,include_descendants,'position_occupancy',?
           FROM app_access_profile_assignments
          WHERE principal_type='staff_position' AND principal_id=? AND active=1
         ON CONFLICT(principal_type,principal_id,access_profile_id,scope_type,scope_id) DO UPDATE SET
           active=1,updated_at=CURRENT_TIMESTAMP`,
        )
        .bind(employeeId, actor.id, staffPositionId),
      db
        .prepare(
          `UPDATE app_employees SET role_id=COALESCE((SELECT id FROM app_roles WHERE code=? AND active=1 LIMIT 1),role_id),
          updated_at=CURRENT_TIMESTAMP
         WHERE id=? AND role_id IN (SELECT id FROM app_roles WHERE code IN ('xodim','malumot_kirituvchi'))`,
        )
        .bind(roleCode, employeeId),
      db
        .prepare(
          "UPDATE app_account_activation_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE employee_id=? AND used_at IS NULL AND revoked_at IS NULL",
        )
        .bind(employeeId),
      db.prepare("DELETE FROM app_sessions WHERE employee_id=?").bind(employeeId),
    ]);
    await audit(actor, "accounts.reserved_activated", "employee", employeeId, {
      staffPositionId,
      slotNumber: Number(reserved.slot_number),
      roleCode,
      accessProfileCode: String(profile.code),
    });
    return Response.json(
      {
        ok: true,
        employeeId,
        staffPositionId,
        slotNumber: Number(reserved.slot_number),
        username: String(reserved.username),
        roleCode,
        accessProfileCode: String(profile.code),
        canLogin: true,
        mustChangePassword: true,
        temporaryExpiresAt: expiresAt,
        passwordReturned: false,
        notice:
          "Rezerv parol ochiq ko‘rinishda qaytarilmaydi. Yo‘qolgan bo‘lsa xodim uchun qayta chiqarishdan foydalaning.",
      },
      { headers: { "Cache-Control": "private, no-store", Pragma: "no-cache", Vary: "Cookie" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rezerv akkaunt faollashtirilmadi";
    if (message.includes("UNIQUE"))
      return Response.json({ error: "Rezerv login boshqa akkauntga biriktirilgan" }, { status: 409 });
    return apiError(error);
  }
}
