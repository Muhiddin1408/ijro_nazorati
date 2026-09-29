"use client";

/** Organization create/edit form. */

import { Building2, Save } from "lucide-react";
import { type FormEvent, useState } from "react";
import { ModalFrame, ModalHeader } from "../../../dashboard-kit";
import type { AdminModalOrganization } from "./admin-modal-types";
import { useI18n } from "../../../../lib/i18n";

export function OrganizationModal({
  organization,
  organizations,
  onClose,
  onSubmit,
}: {
  organization?: AdminModalOrganization;
  organizations: AdminModalOrganization[];
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const { t, tx } = useI18n();
  const [type, setType] = useState(organization?.type ?? "territorial");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: form.get("name"),
      shortName: form.get("shortName"),
      type,
      parentId: type === "central" ? null : form.get("parentId") ? Number(form.get("parentId")) : null,
      regionCode: form.get("regionCode"),
      active: organization ? form.get("active") === "on" : true,
    });
  }
  const parents = organizations.filter(
    (item) =>
      item.id !== organization?.id &&
      (type === "district"
        ? item.type === "territorial"
        : ["territorial", "direct_subordinate"].includes(type)
          ? item.type === "central"
          : false),
  );
  return (
    <ModalFrame onClose={onClose}>
      <form onSubmit={submit}>
        <ModalHeader
          kicker={t("TASHKILOT TUZILMASI")}
          title={organization ? t("Tashkilotni tahrirlash") : t("Yangi tashkilot")}
          subtitle={t("Vertikal bo‘ysunish zanjiri hisobotlar va vakolatlarda qo‘llanadi")}
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-grid single">
            <label>
              <span>{t("Tashkilotning to‘liq nomi")} *</span>
              <input name="name" defaultValue={organization?.name} required minLength={3} maxLength={240} />
            </label>
            <label>
              <span>{t("Qisqa nomi")}</span>
              <input
                name="shortName"
                defaultValue={organization?.shortName}
                maxLength={80}
                placeholder={t("Masalan: Toshkent VYBB")}
              />
            </label>
            <label>
              <span>{t("Tashkilot turi")} *</span>
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="central">{t("Qo‘mita markaziy apparati")}</option>
                <option value="territorial">{t("Hududiy bosh boshqarma")}</option>
                <option value="district">{t("Tuman tashkiloti")}</option>
                <option value="direct_subordinate">{t("To‘g‘ridan-to‘g‘ri bo‘ysunuvchi tashkilot")}</option>
              </select>
            </label>
            {type !== "central" ? (
              <label>
                <span>{t("Yuqori tashkilot")} *</span>
                <select name="parentId" defaultValue={organization?.parentId ?? ""} required>
                  <option value="">{t("Tanlang")}</option>
                  {parents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {tx(item.name)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              <span>{t("Hudud kodi")}</span>
              <input
                name="regionCode"
                defaultValue={organization?.regionCode ?? ""}
                maxLength={20}
                placeholder={t("Ixtiyoriy")}
              />
            </label>
          </div>
          {organization ? (
            <label className="switch-row">
              <input type="checkbox" name="active" defaultChecked={organization.active} />
              <span>
                <strong>{t("Faol tashkilot")}</strong>
                <small>{t("Faolsizlantirishdan oldin xodimlar va quyi tashkilotlarni ko‘chiring")}</small>
              </span>
            </label>
          ) : null}
        </div>
        <div className="modal-footer">
          <span>
            <Building2 size={15} /> {t("Bo‘ysunish zanjiri serverda tekshiriladi")}
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
