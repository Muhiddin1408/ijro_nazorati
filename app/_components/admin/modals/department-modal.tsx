"use client";

/** Department create/edit form. */

import { Building2, Save } from "lucide-react";
import { type FormEvent, useState } from "react";
import { ModalFrame, ModalHeader } from "../../../dashboard-kit";
import type { AdminModalOrganization, AdminModalDepartment } from "./admin-modal-types";
import { useI18n } from "../../../../lib/i18n";

export function DepartmentModal({
  department,
  departments,
  organizations,
  onClose,
  onSubmit,
}: {
  department?: AdminModalDepartment;
  departments: AdminModalDepartment[];
  organizations: AdminModalOrganization[];
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const { t, tx } = useI18n();
  const [organizationId, setOrganizationId] = useState<number | null>(
    department?.organizationId ?? organizations[0]?.id ?? null,
  );
  const [parentId, setParentId] = useState<number | null>(department?.parentId ?? null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: form.get("name"),
      organizationId,
      parentId,
      active: department ? form.get("active") === "on" : true,
    });
  }
  const parentOptions = departments.filter(
    (item) => item.id !== department?.id && item.organizationId === organizationId,
  );
  return (
    <ModalFrame onClose={onClose}>
      <form onSubmit={submit}>
        <ModalHeader
          kicker={t("ADMINISTRATOR")}
          title={department ? t("Bo‘limni tahrirlash") : t("Yangi bo‘lim")}
          subtitle={
            department
              ? t("Nomi, yuqori bo‘limi va faollik holatini o‘zgartiring")
              : t("Tashkiliy tuzilmaga yangi bo‘lim kiriting")
          }
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-grid single">
            <label>
              <span>{t("Bo‘lim nomi")} *</span>
              <input name="name" defaultValue={department?.name} required minLength={2} maxLength={160} />
            </label>
            <label>
              <span>{t("Tashkilot")} *</span>
              <select
                value={organizationId ?? ""}
                onChange={(event) => {
                  setOrganizationId(event.target.value ? Number(event.target.value) : null);
                  setParentId(null);
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
              <span>{t("Yuqori bo‘lim")}</span>
              <select
                name="parentId"
                value={parentId ?? ""}
                onChange={(event) => setParentId(event.target.value ? Number(event.target.value) : null)}
                disabled={!organizationId}
              >
                <option value="">{t("Tashkilot")}</option>
                {parentOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {tx(item.name)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {department ? (
            <label className="switch-row">
              <input type="checkbox" name="active" defaultChecked={department.active} />
              <span>
                <strong>{t("Faol bo‘lim")}</strong>
                <small>{t("Faolsizlantirishdan oldin xodimlar va quyi bo‘limlarni boshqa joyga o‘tkazing")}</small>
              </span>
            </label>
          ) : null}
        </div>
        <div className="modal-footer">
          <span>
            <Building2 size={15} /> {t("Tashkiliy tuzilma serverda tekshiriladi")}
          </span>
          <div>
            <button type="button" className="secondary-button" onClick={onClose}>
              {t("Bekor qilish")}
            </button>
            <button className="primary-button">
              <Save size={16} /> {department ? t("O‘zgarishlarni saqlash") : t("Saqlash")}
            </button>
          </div>
        </div>
      </form>
    </ModalFrame>
  );
}
