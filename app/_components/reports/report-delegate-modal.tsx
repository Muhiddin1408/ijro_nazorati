"use client";

import { useI18n } from "../../../lib/i18n";
import { Activity, Building2, Send } from "lucide-react";
import { useState } from "react";
import { ModalFrame, ModalHeader } from "../../dashboard-kit";
import type { ReportOrganization, ReportAssignment, ReportsPayload } from "./report-types";
import { ReportResponsibleSelect } from "./new-report-modal";

export function ReportDelegateModal({
  assignment,
  organizations,
  employees,
  busy,
  onClose,
  onSubmit,
}: {
  assignment: ReportAssignment;
  organizations: ReportOrganization[];
  employees: ReportsPayload["employees"];
  busy: boolean;
  onClose: () => void;
  onSubmit: (recipients: Array<{ organizationId: number; employeeId: number }>) => void;
}) {
  const i18n = useI18n();
  const children = organizations.filter((item) => item.active && item.parentId === assignment.organization.id);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const close = () => {
    if (!busy) onClose();
  };
  return (
    <ModalFrame onClose={close}>
      <ModalHeader
        kicker="QUYI TASHKILOTLARGA TAQSIMLASH"
        title={i18n.tx(assignment.template.title)}
        subtitle={`${assignment.organization.name} tasarrufidagi tashkilotlarni tanlang`}
        onClose={close}
      />
      <div className="modal-body">
        <div className="delegate-list">
          {children.map((organization) => {
            const checked = Object.hasOwn(selected, organization.id);
            return (
              <div className={`delegate-recipient ${checked ? "selected" : ""}`} key={organization.id}>
                <input
                  type="checkbox"
                  aria-label={i18n.tx(organization.name)}
                  checked={checked}
                  disabled={busy}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? { ...current, [organization.id]: 0 }
                        : Object.fromEntries(
                            Object.entries(current).filter(([key]) => Number(key) !== organization.id),
                          ),
                    )
                  }
                />
                <span>
                  <strong>{i18n.tx(organization.name)}</strong>
                  <small>
                    {organization.type === "district" ? i18n.t("Tuman tashkiloti") : i18n.t("Quyi tashkilot")}
                  </small>
                </span>
                {checked ? (
                  <ReportResponsibleSelect
                    organizationId={organization.id}
                    employees={employees}
                    value={selected[organization.id]}
                    disabled={busy}
                    onChange={(id) => setSelected((current) => ({ ...current, [organization.id]: id }))}
                  />
                ) : null}
              </div>
            );
          })}
          {children.length === 0 ? (
            <div className="empty-state">
              <Building2 size={25} />
              <strong>{i18n.t("Quyi tashkilot topilmadi")}</strong>
              <span>{i18n.t("Administrator avval tashkilotlar tuzilmasini va mas’ul xodimlarni kiritsin.")}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="modal-footer">
        <span>
          <Activity size={15} /> {i18n.t("Tumanlar yuborgan ma’lumot svodda avtomatik ko‘rinadi")}
        </span>
        <div>
          <button className="secondary-button" disabled={busy} onClick={close}>
            {i18n.t("Bekor qilish")}
          </button>
          <button
            className="primary-button"
            disabled={busy || !Object.keys(selected).length || Object.values(selected).some((id) => !id)}
            onClick={() =>
              onSubmit(
                Object.entries(selected).map(([organizationId, employeeId]) => ({
                  organizationId: Number(organizationId),
                  employeeId,
                })),
              )
            }
          >
            <Send size={16} /> {i18n.t("Yuborish")}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}
