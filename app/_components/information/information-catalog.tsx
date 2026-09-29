"use client";

import { useI18n } from "../../../lib/i18n";
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Eye,
  Layers3,
  ListFilter,
  LockKeyhole,
  Pencil,
  TableProperties,
} from "lucide-react";
import { type ReactNode } from "react";
import type { InformationField, InformationTemplate, InformationDomain } from "./information-types";
import {
  cadenceLabels,
  domainIcons,
  domainIconMap,
  toneForDomain,
  InfoPill,
  EmptyState,
  templateFlowLabels,
} from "./information-helpers";

export function InfoSummaryCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  note: string;
  tone: string;
}) {
  const i18n = useI18n();
  return (
    <article className={`info-summary-card info-summary-${tone}`}>
      <span>{icon}</span>
      <div>
        <small>{i18n.t(label)}</small>
        <strong>{new Intl.NumberFormat("uz-UZ").format(value)}</strong>
        <p>{i18n.tx(note)}</p>
      </div>
    </article>
  );
}

export function DomainGrid({
  domains,
  query,
  onOpen,
}: {
  domains: InformationDomain[];
  query: string;
  onOpen: (domain: InformationDomain) => void;
}) {
  const i18n = useI18n();
  const needle = query.trim().toLocaleLowerCase("uz");
  const visible = domains.filter(
    (domain) =>
      !needle ||
      [domain.name, domain.ownerLabel, domain.ownerDepartment?.name].join(" ").toLocaleLowerCase("uz").includes(needle),
  );
  return (
    <div className="info-section">
      <div className="info-section-heading">
        <div>
          <p>{i18n.t("MARKAZIY APPARAT")}</p>
          <h3>{i18n.t("Boshqarmalar va ularning ma’lumotlari")}</h3>
        </div>
        <span>
          {visible.length} {i18n.t("ta boshqarma")}
        </span>
      </div>
      {visible.length ? (
        <div className="info-domain-grid">
          {visible.map((domain, index) => {
            const Icon =
              domainIconMap[domain.icon as keyof typeof domainIconMap] ?? domainIcons[index % domainIcons.length];
            const color = toneForDomain(domain, index);
            return (
              <button
                className="info-domain-card"
                key={domain.id}
                onClick={() => onOpen(domain)}
                style={{ "--domain-color": color } as React.CSSProperties}
              >
                <span className="info-domain-icon">
                  <Icon size={21} />
                </span>
                <span className="info-domain-main">
                  <span className="info-domain-owner">
                    {i18n.t(domain.ownerLabel) || i18n.tx(domain.ownerDepartment?.name) || i18n.t("Markaziy apparat")}
                  </span>
                  <strong>{i18n.tx(domain.name)}</strong>
                </span>
                <span className="info-domain-stats">
                  <span>
                    <b>{domain.templateCount}</b>
                    <small>{i18n.t("shakl")}</small>
                  </span>
                  <span>
                    <b>{domain.indicatorCount}</b>
                    <small>{i18n.t("ko‘rsatkich")}</small>
                  </span>
                </span>
                <span className="info-domain-footer">
                  {domain.visibility === "restricted" ? (
                    <InfoPill tone="red">
                      <LockKeyhole size={12} /> {i18n.t("Cheklangan")}
                    </InfoPill>
                  ) : (
                    <InfoPill tone="blue">
                      <Eye size={12} /> {i18n.t("Ichki")}
                    </InfoPill>
                  )}
                  {domain.demoRecordCount ? (
                    <InfoPill tone="amber">
                      {i18n.t("DEMO ·")} {domain.demoRecordCount}
                    </InfoPill>
                  ) : null}
                  <span className="info-open-hint">
                    {i18n.t("Ochish")} <ArrowRight size={15} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={domains.length ? i18n.t("Boshqarma topilmadi") : i18n.t("Ma’lumotlar katalogi biriktirilmagan")}
          text={
            domains.length
              ? "Qidiruv so‘zini o‘zgartirib ko‘ring."
              : "Administrator tegishli ma’lumotlar katalogiga kirish huquqini biriktiradi."
          }
        />
      )}
    </div>
  );
}

export function TemplateDirectory({
  domain,
  templates,
  onOpen,
}: {
  domain: InformationDomain | null;
  templates: InformationTemplate[];
  onOpen: (template: InformationTemplate) => void;
}) {
  const i18n = useI18n();
  return (
    <div className="info-section">
      <div
        className="info-domain-banner"
        style={{ "--domain-color": domain ? toneForDomain(domain) : "#1957d2" } as React.CSSProperties}
      >
        <span>
          <Layers3 size={24} />
        </span>
        <div>
          <small>
            {i18n.t(domain?.ownerLabel ?? "") || i18n.tx(domain?.ownerDepartment?.name) || i18n.t("Markaziy apparat")}
          </small>
          <h3>{i18n.tx(domain?.name)}</h3>
        </div>
        <div>
          <strong>{templates.length}</strong>
          <span>{i18n.t("ma’lumot shakli")}</span>
        </div>
      </div>
      <div className="info-section-heading">
        <div>
          <p>{i18n.t("MA’LUMOT GURUHLARI")}</p>
          <h3>{i18n.t("Kerakli ma’lumot jadvalini oching")}</h3>
        </div>
        {domain?.canEdit ? (
          <InfoPill tone="green">
            <Pencil size={12} /> {i18n.t("Kiritish vakolati bor")}
          </InfoPill>
        ) : (
          <InfoPill>
            <Eye size={12} /> {i18n.t("Ko‘rish rejimi")}
          </InfoPill>
        )}
      </div>
      {templates.length ? (
        <div className="info-template-grid">
          {templates.map((template) => {
            const flow = templateFlowLabels(template);
            return (
              <button className="info-template-card" key={template.id} onClick={() => onOpen(template)}>
                <span className="info-template-top">
                  <span className="info-template-code">
                    {i18n.tx(template.presentation?.group) || i18n.t("BOSHQARMA MA’LUMOTI")}
                  </span>
                </span>
                <strong>{i18n.tx(template.name)}</strong>
                <span className="info-template-metrics">
                  <span>
                    <TableProperties size={14} />
                    {i18n.t("Mavzuga mos jadval")}
                  </span>
                  <span>
                    <ListFilter size={14} />
                    {i18n.t("Dinamik filtrlar")}
                  </span>
                  <span>
                    <Clock3 size={14} />
                    {i18n.t(cadenceLabels[template.cadence]) ?? i18n.tx(template.cadence)}
                  </span>
                </span>
                <span className="info-field-preview">
                  {(template.presentation?.tableColumns?.length
                    ? template.presentation.tableColumns
                        .map((code) => template.fields.find((field) => field.code === code))
                        .filter((field): field is InformationField => Boolean(field))
                    : template.fields
                  )
                    .slice(0, 4)
                    .map((field) => (
                      <em key={field.code}>{i18n.t(field.label)}</em>
                    ))}
                </span>
                <span className="info-template-flow">
                  <b>{i18n.tx(flow[0])}</b>
                  <ChevronRight size={12} />
                  <b>{i18n.tx(flow[1])}</b>
                  <ChevronRight size={12} />
                  <b>{i18n.tx(flow[2])}</b>
                </span>
                <span className="info-template-footer">
                  <span>{i18n.t("Jadvalni ochish")}</span>
                  <ChevronRight size={17} />
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={i18n.t("Ma’lumot shakli topilmadi")}
          text="Qidiruvni tozalang yoki boshqa yo‘nalishni tanlang."
        />
      )}
    </div>
  );
}
