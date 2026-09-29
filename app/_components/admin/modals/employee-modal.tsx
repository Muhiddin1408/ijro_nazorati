"use client";

/** Employee create/edit form with login, access and contact fields. */

import { KeyRound, Save, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { ModalFrame, ModalHeader } from "../../../dashboard-kit";
import { usernameStem } from "../../../ui-helpers";
import { useI18n } from "../../../../lib/i18n";
import type {
  AdminModalOrganization,
  AdminModalDepartment,
  AdminModalEmployee,
  AdminModalRole,
} from "./admin-modal-types";

export function EmployeeModal({
  employee,
  roles,
  departments,
  organizations,
  employees,
  onClose,
  onSubmit,
}: {
  employee?: AdminModalEmployee;
  roles: AdminModalRole[];
  departments: AdminModalDepartment[];
  organizations: AdminModalOrganization[];
  employees: AdminModalEmployee[];
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const { t, tx } = useI18n();
  const [fullName, setFullName] = useState(employee?.name ?? "");
  const [username, setUsername] = useState(employee?.username ?? "");
  const [password, setPassword] = useState("");
  const [createAccountNow, setCreateAccountNow] = useState(Boolean(employee?.loginConfigured) || !employee);
  const [organizationId, setOrganizationId] = useState<number | null>(
    employee?.organizationId ?? organizations[0]?.id ?? null,
  );
  const [departmentId, setDepartmentId] = useState<number | null>(employee?.departmentId ?? null);
  const [managerId, setManagerId] = useState<number | null>(employee?.managerId ?? null);
  function generatePassword() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
    const bytes = crypto.getRandomValues(new Uint8Array(14));
    setPassword(Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join(""));
  }
  function generateUsername() {
    const stem = usernameStem(fullName);
    const occupied = new Set(
      employees
        .filter((item) => item.id !== employee?.id)
        .map((item) => item.username?.toLocaleLowerCase())
        .filter(Boolean),
    );
    let candidate = stem;
    let suffix = 2;
    while (occupied.has(candidate.toLocaleLowerCase())) {
      candidate = `${stem.slice(0, Math.max(1, 31 - String(suffix).length))}${suffix}`;
      suffix += 1;
    }
    setUsername(candidate);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: form.get("name"),
      email: String(form.get("email") ?? "").trim() || null,
      birthDate: String(form.get("birthDate") ?? "").trim() || null,
      internalExtension: String(form.get("internalExtension") ?? "").trim() || null,
      mobilePhone: String(form.get("mobilePhone") ?? "").trim() || null,
      position: form.get("position"),
      roleId: Number(form.get("roleId")),
      departmentId,
      organizationId,
      managerId,
      active: employee ? form.get("active") === "on" : true,
      username: createAccountNow ? username : undefined,
      password: createAccountNow ? password || undefined : undefined,
      mustChangePassword: form.get("mustChangePassword") === "on",
    });
  }
  const defaultRoleId = employee?.roleId ?? roles.find((role) => role.code === "xodim")?.id ?? roles[0]?.id;
  const availableDepartments = departments.filter((department) => department.organizationId === organizationId);
  const availableManagers = employees.filter((item) => item.organizationId === organizationId);
  return (
    <ModalFrame onClose={onClose}>
      <form onSubmit={submit}>
        <ModalHeader
          kicker={t("ADMINISTRATOR")}
          title={employee ? t("Xodim va kirish ma’lumotlari") : t("Yangi xodim")}
          subtitle={t("Har bir xodimga alohida login va xavfsiz parol beriladi")}
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-grid">
            <label className="full">
              <span>{t("F.I.Sh.")} *</span>
              <input
                name="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                minLength={3}
              />
            </label>
            <label>
              <span>{t("Email (ixtiyoriy)")}</span>
              <input
                type="email"
                name="email"
                defaultValue={employee?.email}
                placeholder={t("masalan: {login}", { login: "xodim@tashkilot.uz" })}
              />
            </label>
            <label>
              <span>{t("Tug‘ilgan sana")}</span>
              <input type="date" name="birthDate" defaultValue={employee?.birthDate ?? ""} />
            </label>
            <label>
              <span>{t("Ichki telefon")}</span>
              <input
                name="internalExtension"
                inputMode="numeric"
                pattern="[0-9]{1,10}"
                defaultValue={employee?.internalExtension ?? ""}
                placeholder={t("Masalan: {value}", { value: "159" })}
              />
            </label>
            <label>
              <span>{t("Telefon raqami")}</span>
              <input
                type="tel"
                name="mobilePhone"
                defaultValue={employee?.mobilePhone ?? ""}
                placeholder="+998901234567"
              />
            </label>
            <label>
              <span>{t("Lavozim")}</span>
              <input name="position" defaultValue={employee?.position} />
            </label>
            <label>
              <span>{t("Rol")} *</span>
              <select name="roleId" defaultValue={defaultRoleId}>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {tx(role.name)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("Tashkilot")} *</span>
              <select
                name="organizationId"
                value={organizationId ?? ""}
                onChange={(event) => {
                  setOrganizationId(event.target.value ? Number(event.target.value) : null);
                  setDepartmentId(null);
                  setManagerId(null);
                }}
                required
              >
                <option value="">{t("Tashkilotni tanlang")}</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {tx(organization.name)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("Bo‘lim")}</span>
              <select
                name="departmentId"
                value={departmentId ?? ""}
                onChange={(event) => setDepartmentId(event.target.value ? Number(event.target.value) : null)}
                disabled={!organizationId}
              >
                <option value="">{t("Biriktirilmagan")}</option>
                {availableDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {tx(department.name)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("Bevosita rahbar")}</span>
              <select
                name="managerId"
                value={managerId ?? ""}
                onChange={(event) => setManagerId(event.target.value ? Number(event.target.value) : null)}
                disabled={!organizationId}
              >
                <option value="">{t("Biriktirilmagan")}</option>
                {availableManagers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {tx(item.name)} — {tx(item.roleName)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset className="credential-box">
            <legend>
              <KeyRound size={15} /> {t("Tizimga kirish")}
            </legend>
            {!employee?.loginConfigured ? (
              <label className="switch-row compact-switch">
                <input
                  type="checkbox"
                  checked={createAccountNow}
                  onChange={(event) => setCreateAccountNow(event.target.checked)}
                />
                <span>
                  <strong>{t("Login va parolni hozir yaratish")}</strong>
                  <small>
                    {t("O‘chirilsa xodim keyin bir martalik xavfsiz havola orqali akkauntini o‘zi faollashtiradi")}
                  </small>
                </span>
              </label>
            ) : null}
            {createAccountNow ? (
              <div className="form-grid">
                <label>
                  <span>{t("Login")} *</span>
                  <div className="credential-input-action">
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required={createAccountNow && !employee?.loginConfigured}
                      minLength={4}
                      maxLength={32}
                      pattern="[A-Za-z][A-Za-z0-9._-]{3,31}"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder={t("masalan: {login}", { login: "a.karimov" })}
                    />
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={!fullName.trim()}
                      onClick={generateUsername}
                    >
                      {t("Yaratish")}
                    </button>
                  </div>
                </label>
                <label>
                  <span>
                    {employee?.loginConfigured ? t("Yangi parol (ixtiyoriy)") : `${t("Vaqtinchalik parol")} *`}
                  </span>
                  <div className="password-generator">
                    <input
                      type="text"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required={createAccountNow && !employee?.loginConfigured}
                      minLength={10}
                      maxLength={128}
                      autoComplete="new-password"
                    />
                    <button type="button" className="secondary-button" onClick={generatePassword}>
                      {t("Yaratish")}
                    </button>
                  </div>
                </label>
              </div>
            ) : (
              <div className="secure-note">
                <ShieldCheck size={18} />
                <div>
                  <strong>{t("Xavfsiz faollashtirish")}</strong>
                  <span>
                    {t("Xodim saqlangach ro‘yxatdan tanlab, bir martalik havolalar Excel paketini yarating.")}
                  </span>
                </div>
              </div>
            )}
            {createAccountNow ? (
              <label className="switch-row compact-switch">
                <input type="checkbox" name="mustChangePassword" defaultChecked />
                <span>
                  <strong>{t("Birinchi kirishda parolni almashtirsin")}</strong>
                  <small>{t("Vaqtinchalik paroldan keyin shaxsiy parol belgilaydi")}</small>
                </span>
              </label>
            ) : null}
          </fieldset>
          {employee ? (
            <label className="switch-row">
              <input type="checkbox" name="active" defaultChecked={employee.active} />
              <span>
                <strong>{t("Faol akkaunt")}</strong>
                <small>{t("Faolsizlantirilgan xodim tizimga kira olmaydi")}</small>
              </span>
            </label>
          ) : null}
        </div>
        <div className="modal-footer">
          <span>
            <ShieldCheck size={15} /> {t("Parol faqat xesh ko‘rinishida saqlanadi")}
          </span>
          <div>
            <button type="button" className="secondary-button" onClick={onClose}>
              {t("Bekor qilish")}
            </button>
            <button className="primary-button">
              <Save size={16} /> {t("Saqlash")}
            </button>
          </div>
        </div>
      </form>
    </ModalFrame>
  );
}
