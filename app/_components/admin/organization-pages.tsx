"use client";

import { Building2, CheckCircle2, Database, Megaphone, Pencil, PlugZap, Plus, SlidersHorizontal } from "lucide-react";
import { PageIntro } from "../../dashboard-kit";
import type { AdminOrganization, AdminDepartment, AdminEmployee, AdminTopic, AdminIntegration } from "./admin-types";
import { organizationTypeLabel, Summary } from "./admin-helpers";
import { useI18n } from "../../../lib/i18n";

export function IntegrationsPage({ integrations }: { integrations: AdminIntegration[] }) {
  const { t, tx } = useI18n();
  return (
    <section className="module-page">
      <PageIntro
        kicker={t("ERP PLATFORMASI")}
        title={t("Integratsiyalar markazi")}
        description={t(
          "Tashqi tizimlar uchun alohida ulanish, navbat, qayta urinish va audit arxitekturasi tayyorlandi.",
        )}
      />
      <div className="integration-grid">
        {integrations.map((integration) => (
          <article className="panel integration-card" key={integration.id}>
            <span className="metric-icon blue">
              {integration.category === "government" ? <Database size={20} /> : <PlugZap size={20} />}
            </span>
            <div>
              <h3>{tx(integration.name)}</h3>
              <p>{integration.code}</p>
            </div>
            <span className={`connection-badge ${integration.enabled ? "connected" : ""}`}>
              {integration.enabled ? t("Faol") : t("Rejalashtirilgan")}
            </span>
          </article>
        ))}
      </div>
      {integrations.length === 0 ? (
        <article className="panel future-module">
          <PlugZap size={28} />
          <h3>{t("Integratsiyalar ro‘yxati tayyorlanmoqda")}</h3>
        </article>
      ) : null}
    </section>
  );
}

export function DepartmentsPage({
  departments,
  employees,
  onAdd,
  onEdit,
}: {
  departments: AdminDepartment[];
  employees: AdminEmployee[];
  onAdd: () => void;
  onEdit: (department: AdminDepartment) => void;
}) {
  const { t, tx } = useI18n();
  return (
    <section className="module-page">
      <PageIntro
        kicker={t("ADMINISTRATOR")}
        title={t("Bo‘limlar boshqaruvi")}
        description={t(
          "Har bir korxona bo‘yicha bo‘limlarni kiriting, yuqori bo‘limini belgilang va xodimlarni to‘g‘ri tuzilmaga biriktiring.",
        )}
        actions={
          <button className="primary-button" onClick={onAdd}>
            <Plus size={17} /> {t("Bo‘lim qo‘shish")}
          </button>
        }
      />
      <div className="department-grid">
        {departments.map((department) => {
          const parent = departments.find((item) => item.id === department.parentId);
          const count = employees.filter(
            (employee) => employee.departmentId === department.id && employee.active,
          ).length;
          return (
            <article
              className={`panel department-card ${!department.active ? "inactive-card" : ""}`}
              key={department.id}
            >
              <div className="department-card-head">
                <span className="metric-icon blue">
                  <Building2 size={20} />
                </span>
                <div>
                  <h3>{tx(department.name)}</h3>
                  <span>
                    {department.organization ? tx(department.organization) : t("Tashkilot biriktirilmagan")} ·{" "}
                    {t("{n} nafar xodim", { n: count })} · {department.active ? t("Faol") : t("Faol emas")}
                  </span>
                </div>
                <button
                  className="icon-button"
                  onClick={() => onEdit(department)}
                  aria-label={t("{name} bo‘limini tahrirlash", { name: tx(department.name) })}
                  title={t("Bo‘limni tahrirlash")}
                >
                  <SlidersHorizontal size={16} />
                </button>
              </div>
              <p className="department-parent">
                {t("Yuqori bo‘lim")}: <strong>{parent ? tx(parent.name) : t("Tashkilot")}</strong>
              </p>
              <button className="wide-secondary department-edit-button" onClick={() => onEdit(department)}>
                <SlidersHorizontal size={16} /> {t("Tahrirlash")}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function OrganizationsPage({
  organizations,
  employees,
  onAdd,
  onEdit,
}: {
  organizations: AdminOrganization[];
  employees: AdminEmployee[];
  onAdd: () => void;
  onEdit: (organization: AdminOrganization) => void;
}) {
  const { t, tx } = useI18n();
  const ordered = organizations.slice().sort((a, b) => {
    const order: Record<string, number> = {
      central: 0,
      territorial: 1,
      district: 2,
      direct_subordinate: 3,
    };
    return (order[a.type] ?? 9) - (order[b.type] ?? 9) || a.name.localeCompare(b.name);
  });
  return (
    <section className="module-page">
      <PageIntro
        kicker={t("TASHKILOT TUZILMASI")}
        title={t("Qo‘mita tizimidagi tashkilotlar")}
        description={t(
          "Markaziy apparat, hududiy bosh boshqarmalar, tuman tashkilotlari va to‘g‘ridan-to‘g‘ri bo‘ysunuvchi tashkilotlarni boshqaring.",
        )}
        actions={
          <button className="primary-button" onClick={onAdd}>
            <Plus size={17} /> {t("Tashkilot qo‘shish")}
          </button>
        }
      />
      <div className="organization-legend">
        <span>
          <i className="central" />
          {t("Markaziy apparat")}
        </span>
        <span>
          <i className="territorial" />
          {t("Hududiy boshqarma")}
        </span>
        <span>
          <i className="district" />
          {t("Tuman tashkiloti")}
        </span>
        <span>
          <i className="direct_subordinate" />
          {t("To‘g‘ridan-to‘g‘ri bo‘ysunuvchi")}
        </span>
      </div>
      <div className="organization-tree-grid">
        {ordered.map((organization) => {
          const parent = organizations.find((item) => item.id === organization.parentId);
          const count = employees.filter(
            (employee) => employee.organizationId === organization.id && employee.active,
          ).length;
          const depth = organization.type === "district" ? 2 : organization.type === "central" ? 0 : 1;
          return (
            <article
              className={`panel organization-card type-${organization.type} ${!organization.active ? "inactive-card" : ""}`}
              key={organization.id}
              style={{ marginLeft: `${depth * 20}px` }}
            >
              <span className="organization-rail" />
              <span className="metric-icon blue">
                <Building2 size={20} />
              </span>
              <div>
                <small>{t(organizationTypeLabel(organization.type))}</small>
                <h3>{tx(organization.name)}</h3>
                <p>
                  {parent ? t("{name}ga bo‘ysunadi", { name: tx(parent.name) }) : t("Yuqori boshqaruv bo‘g‘ini")} ·{" "}
                  {t("{n} nafar xodim", { n: count })}
                </p>
              </div>
              <button
                className="icon-button"
                onClick={() => onEdit(organization)}
                aria-label={t("{name} tashkilotini tahrirlash", { name: tx(organization.name) })}
              >
                <Pencil size={15} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function TopicsPage({
  topics,
  onAdd,
  onEdit,
}: {
  topics: AdminTopic[];
  onAdd: () => void;
  onEdit: (topic: AdminTopic) => void;
}) {
  const { t, tx } = useI18n();
  return (
    <section className="module-page">
      <PageIntro
        kicker={t("ADMINISTRATOR")}
        title={t("Topshiriq tematikalari")}
        description={t(
          "Topshiriqlarni kelib chiqish manbasi yoki yo‘nalishi bo‘yicha guruhlash uchun tematikalarni boshqaring.",
        )}
        actions={
          <button className="primary-button" onClick={onAdd}>
            <Plus size={17} /> {t("Tematika qo‘shish")}
          </button>
        }
      />
      <div className="summary-strip">
        <Summary
          icon={<Megaphone size={20} />}
          tone="blue"
          label={t("Jami tematika")}
          value={t("{n} ta", { n: topics.length })}
        />
        <Summary
          icon={<CheckCircle2 size={20} />}
          tone="green"
          label={t("Faol")}
          value={t("{n} ta", { n: topics.filter((topic) => topic.active).length })}
        />
      </div>
      <div className="topic-grid">
        {topics.map((topic) => (
          <article className={`panel topic-card ${topic.active ? "" : "inactive-card"}`} key={topic.id}>
            <span className="topic-color" style={{ backgroundColor: topic.color }} />
            <div>
              <h3>{tx(topic.name)}</h3>
              <p>{topic.description ? tx(topic.description) : t("Izoh kiritilmagan")}</p>
              <small>{topic.active ? t("Faol tematika") : t("Faol emas")}</small>
            </div>
            <button className="icon-button" onClick={() => onEdit(topic)} aria-label={t("Tematikani tahrirlash")}>
              <Pencil size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
