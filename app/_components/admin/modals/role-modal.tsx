"use client";

/** Role editor: permission matrix and scopes. */

import { Check, Save, ShieldCheck } from "lucide-react";
import { type FormEvent } from "react";
import { ModalFrame, ModalHeader } from "../../../dashboard-kit";
import type { AdminPermissionSet, AdminModalRole } from "./admin-modal-types";
import { useI18n } from "../../../../lib/i18n";

export function RoleModal({
  role,
  onClose,
  onSubmit,
}: {
  role?: AdminModalRole;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const { t } = useI18n();
  const permissions = role?.permissions;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: form.get("name"),
      code: form.get("code"),
      level: Number(form.get("level")),
      active: role ? form.get("active") === "on" : true,
      permissions: {
        viewScope: form.get("viewScope"),
        assignScope: form.get("assignScope"),
        informationScope: form.get("informationScope"),
        canEnterInformation: form.get("canEnterInformation") === "on",
        canSubmitInformation: form.get("canSubmitInformation") === "on",
        canVerifyInformation: form.get("canVerifyInformation") === "on",
        canApproveInformation: form.get("canApproveInformation") === "on",
        canCreateTask: form.get("canCreateTask") === "on",
        canCreateMeeting: form.get("canCreateMeeting") === "on",
        canExport: form.get("canExport") === "on",
        canManageOrganization: form.get("canManageOrganization") === "on",
        canManageRoles: form.get("canManageRoles") === "on",
        canConfigure: form.get("canConfigure") === "on",
        canViewAudit: form.get("canViewAudit") === "on",
        canUpdateAnyTask: form.get("canUpdateAnyTask") === "on",
        canManageReports: form.get("canManageReports") === "on",
        canManageInformation: form.get("canManageInformation") === "on",
        canViewRestrictedInformation: form.get("canViewRestrictedInformation") === "on",
      },
    });
  }
  const toggles: [keyof AdminPermissionSet, string][] = [
    ["canEnterInformation", "Ma’lumot kiritish"],
    ["canSubmitInformation", "Ma’lumotni keyingi bosqichga yuborish"],
    ["canVerifyInformation", "Ma’lumotni tekshirish yoki qaytarish"],
    ["canApproveInformation", "Ma’lumotni rasman tasdiqlash"],
    ["canCreateTask", "Topshiriq berish"],
    ["canCreateMeeting", "Yig‘ilish kiritish"],
    ["canExport", "Excel eksport"],
    ["canManageReports", "Hisobot shakllarini yaratish va boshqarish"],
    ["canManageInformation", "Ma’lumotlar markazini boshqarish va tasdiqlash"],
    ["canViewRestrictedInformation", "Yopiq ma’lumot yo‘nalishlarini ko‘rish"],
    ["canManageOrganization", "Xodim va bo‘limlarni boshqarish"],
    ["canManageRoles", "Rollarni boshqarish"],
    ["canConfigure", "Telegram integratsiyasi"],
    ["canViewAudit", "Audit jurnalini ko‘rish"],
    ["canUpdateAnyTask", "Barcha topshiriqlarni yangilash"],
  ];
  return (
    <ModalFrame onClose={onClose} wide>
      <form onSubmit={submit}>
        <ModalHeader
          kicker={t("ADMINISTRATOR")}
          title={role ? t("Rol vakolatlarini tahrirlash") : t("Yangi rol yaratish")}
          subtitle={t("Vakolatlar barcha API so‘rovlarida server tomonidan tekshiriladi")}
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-grid three">
            <label>
              <span>{t("Rol nomi")} *</span>
              <input name="name" defaultValue={role?.name} required />
            </label>
            <label>
              <span>{t("Rol kodi")} *</span>
              <input
                name="code"
                defaultValue={role?.code}
                disabled={Boolean(role)}
                required
                pattern="[a-z][a-z0-9_]{2,29}"
              />
            </label>
            <label>
              <span>{t("Daraja")}</span>
              <input type="number" name="level" defaultValue={role?.level ?? 100} min="1" max="999" />
            </label>
            <label>
              <span>{t("Ma’lumot ko‘rish doirasi")}</span>
              <select name="viewScope" defaultValue={permissions?.viewScope ?? "own"}>
                <option value="own">{t("Faqat o‘ziga berilgan")}</option>
                <option value="department">{t("O‘z bo‘limi")}</option>
                <option value="subtree">{t("Quyi tuzilma")}</option>
                <option value="all">{t("Barcha ma’lumot")}</option>
              </select>
            </label>
            <label>
              <span>{t("Topshiriq berish doirasi")}</span>
              <select name="assignScope" defaultValue={permissions?.assignScope ?? "none"}>
                <option value="none">{t("Ruxsat yo‘q")}</option>
                <option value="department">{t("O‘z bo‘limi")}</option>
                <option value="subtree">{t("Quyi tuzilma")}</option>
                <option value="all">{t("Barcha xodimlar")}</option>
              </select>
            </label>
            <label>
              <span>{t("Ma’lumotlar doirasi")}</span>
              <select
                name="informationScope"
                defaultValue={permissions?.informationScope ?? permissions?.viewScope ?? "own"}
              >
                <option value="own">{t("Faqat o‘zi kiritgani")}</option>
                <option value="department">{t("O‘z bo‘limi")}</option>
                <option value="organization">{t("O‘z tashkiloti")}</option>
                <option value="subtree">{t("Quyi tashkilotlar")}</option>
                <option value="all">{t("Barcha ma’lumot")}</option>
              </select>
            </label>
          </div>
          <fieldset className="permission-matrix">
            <legend>{t("Amaliy vakolatlar")}</legend>
            <div>
              {toggles.map(([key, label]) => (
                <label key={key}>
                  <input type="checkbox" name={key} defaultChecked={Boolean(permissions?.[key])} />
                  <span>
                    <Check size={14} />
                    {t(label)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {role ? (
            <label className="switch-row">
              <input type="checkbox" name="active" defaultChecked={role.active} />
              <span>
                <strong>{t("Faol rol")}</strong>
                <small>{t("Rolni o‘chirishdan oldin xodimlarni boshqa rolga o‘tkazing")}</small>
              </span>
            </label>
          ) : null}
        </div>
        <div className="modal-footer">
          <span>
            <ShieldCheck size={15} /> {t("Administrator roli himoyalangan")}
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
