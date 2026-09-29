"use client";

import { useI18n } from "../../../lib/i18n";
import {
  AlertCircle,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  FileClock,
  FileText,
  History,
  LockKeyhole,
  Network,
  Pencil,
  RotateCcw,
  Route,
  Sparkles,
  TableProperties,
  Users,
  X,
} from "lucide-react";
import { useRef } from "react";
import type { InformationPayload } from "./information-types";
import {
  dateTime,
  humanFileSize,
  statusLabel,
  recordFreshness,
  valueLabel,
  InfoPill,
  useDialogFocus,
  LoadingState,
} from "./information-helpers";

export function RecordDrawer({
  payload,
  loading,
  comment,
  onComment,
  onClose,
  onEdit,
  onAction,
  busyAction,
}: {
  payload: InformationPayload | null;
  loading: boolean;
  comment: string;
  onComment: (value: string) => void;
  onClose: () => void;
  onEdit: () => void;
  onAction: (action: "return" | "publish" | "archive") => void;
  busyAction: string;
}) {
  const i18n = useI18n();
  const record = payload?.record;
  const template = payload?.templates?.find((item) => item.id === record?.templateId);
  const domain = payload?.domains?.find((item) => item.id === record?.domainId);
  const canEdit = Boolean(record?.allowedActions?.some((action) => action === "save" || action === "submit"));
  const canReview = Boolean(record?.allowedActions?.includes("approve"));
  const freshness = record ? recordFreshness(record, template) : null;
  const layerRef = useRef<HTMLDivElement>(null);
  useDialogFocus(true, layerRef, onClose);
  return (
    <div
      ref={layerRef}
      className="info-drawer-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="information-record-dialog-title"
      tabIndex={-1}
    >
      <button className="info-drawer-scrim" onClick={onClose} aria-label={i18n.t("Yopish")} />
      <aside className="info-drawer">
        <div className="info-drawer-top">
          <div>
            <small>{i18n.t("YOZUV KARTOCHKASI")}</small>
            <strong id="information-record-dialog-title">{i18n.tx(template?.name) || i18n.t("Ma’lumot yozuvi")}</strong>
          </div>
          <button data-dialog-initial-focus onClick={onClose} aria-label={i18n.t("Yopish")}>
            <X size={20} />
          </button>
        </div>
        {loading || !record ? (
          <LoadingState />
        ) : (
          <div className="info-drawer-scroll">
            {record.isDemo ? (
              <div className="info-demo-banner">
                <Sparkles size={17} />
                <div>
                  <strong>{i18n.t("Demo ma’lumot")}</strong>
                  <span>{i18n.t("Bu yozuv interfeysni sinash uchun. U real statistikaga tenglashtirilmaydi.")}</span>
                </div>
              </div>
            ) : null}
            <div className="info-detail-heading">
              <div className="info-record-badges">
                <InfoPill
                  tone={
                    record.status === "published"
                      ? "green"
                      : record.status === "submitted"
                        ? "amber"
                        : record.status === "returned"
                          ? "red"
                          : "neutral"
                  }
                >
                  {i18n.t(statusLabel(record.status))}
                </InfoPill>
                {freshness ? <InfoPill tone={freshness.tone}>{i18n.t(freshness.label)}</InfoPill> : null}
                <InfoPill>{i18n.tx(record.priority)}</InfoPill>
              </div>
              <h3>{i18n.tx(record.title)}</h3>
              <p>
                {i18n.tx(record.organization.name)} · {i18n.tx(record.department.name)}
              </p>
            </div>
            <section className="info-detail-section">
              <div className="info-detail-section-title">
                <TableProperties size={17} />
                <h4>{i18n.t("Kiritilgan ma’lumotlar")}</h4>
                <span>
                  {template?.fields.length ?? 0} {i18n.t("maydon")}
                </span>
              </div>
              <div className="info-value-grid">
                {template?.fields.map((field) => (
                  <div className={`info-value-item ${field.type === "textarea" ? "wide" : ""}`} key={field.code}>
                    <small>
                      {i18n.t(field.label)}
                      {field.required ? " *" : ""}
                    </small>
                    {record.redactedFields?.includes(field.code) ? (
                      <strong className="empty">{i18n.t("Ko‘rish huquqi yo‘q")}</strong>
                    ) : (
                      <strong
                        className={record.values[field.code] == null || record.values[field.code] === "" ? "empty" : ""}
                      >
                        {i18n.t(valueLabel(record.values[field.code], field))}
                      </strong>
                    )}
                    {field.sensitive ? (
                      <em>
                        <LockKeyhole size={11} /> {i18n.t("Himoyalangan maydon")}
                      </em>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
            <section className="info-detail-section">
              <div className="info-detail-section-title">
                <Route size={17} />
                <h4>{i18n.t("Tasdiqlash jarayoni")}</h4>
                <span>
                  {i18n.t("Yozuv v")}
                  {record.version}
                </span>
              </div>
              <p>
                {record.workflow
                  ? i18n.t("Hozirgi bosqich: {stepName}", { stepName: i18n.tx(record.workflow.stepName) })
                  : record.status === "published"
                    ? i18n.t("Barcha bosqichlar tasdiqlangan")
                    : i18n.t("Yuborilgach tasdiqlash bosqichlari ko‘rinadi")}
              </p>
              <ol className="info-workflow-steps">
                {payload?.approvalSteps?.map((step) => (
                  <li key={step.id}>
                    <strong>
                      {step.round}
                      {i18n.t("-davr ·")} {step.sequence}. {i18n.tx(step.name)}
                    </strong>
                    <span>
                      {i18n.tx(
                        (
                          {
                            pending: "Kutilmoqda",
                            approved: "Tasdiqlangan",
                            returned: "Qaytarilgan",
                            rejected: "Rad etilgan",
                            cancelled: "Bekor qilingan",
                          } as Record<string, string>
                        )[step.status],
                      ) ?? i18n.tx(step.status)}
                      {step.actor ? i18n.t(" · {name}", { name: i18n.tx(step.actor.name) }) : ""}
                    </span>
                    {step.comment ? <p>{i18n.tx(step.comment)}</p> : null}
                  </li>
                ))}
              </ol>
              {payload?.validationIssues?.map((issue) => (
                <div
                  key={issue.id}
                  className={`info-alert ${issue.severity === "error" ? "info-alert-error" : ""}`}
                  role="status"
                >
                  <AlertCircle size={16} />
                  {i18n.tx(issue.message)}
                </div>
              ))}
            </section>
            {template?.indicators.length ? (
              <section className="info-detail-section">
                <div className="info-detail-section-title">
                  <BarChart3 size={17} />
                  <h4>{i18n.t("Ko‘rsatkichlar modeli")}</h4>
                  <span>
                    {template.indicators.length} {i18n.t("ta")}
                  </span>
                </div>
                <div className="info-indicator-list">
                  {template.indicators.map((indicator) => (
                    <span key={indicator.code} className={`role-${indicator.role}`}>
                      <i /> <b>{i18n.t(indicator.label)}</b>
                      <small>
                        {indicator.role === "outcome"
                          ? i18n.t("Natija")
                          : indicator.role === "driver"
                            ? i18n.t("Drayver")
                            : i18n.t("Cheklov")}
                        {indicator.unit ? i18n.t(" · {unit}", { unit: i18n.tx(indicator.unit) }) : ""}
                      </small>
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
            <section className="info-detail-section">
              <div className="info-detail-section-title">
                <Network size={17} />
                <h4>{i18n.t("Kelib chiqish zanjiri")}</h4>
              </div>
              <div className="info-lineage">
                <span>
                  <i>
                    <Building2 size={14} />
                  </i>
                  <small>{i18n.t("Ma’lumot egasi")}</small>
                  <strong>
                    {i18n.tx(record.department.name) ||
                      i18n.tx(domain?.ownerDepartment?.name) ||
                      i18n.t("Belgilanmagan")}
                  </strong>
                </span>
                <span>
                  <i>
                    <Users size={14} />
                  </i>
                  <small>{i18n.t("Kiritgan xodim")}</small>
                  <strong>{i18n.tx(record.creator.name)}</strong>
                </span>
                <span>
                  <i>
                    <Clock3 size={14} />
                  </i>
                  <small>{i18n.t("Oxirgi yangilanish")}</small>
                  <strong>{dateTime(record.updatedAt)}</strong>
                </span>
              </div>
            </section>
            {payload?.participants?.length || payload?.actions?.length || payload?.files?.length ? (
              <section className="info-detail-section">
                <div className="info-detail-section-title">
                  <Users size={17} />
                  <h4>{i18n.t("Bog‘langan ma’lumotlar")}</h4>
                </div>
                <div className="info-related-grid">
                  {payload.participants?.map((participant) => (
                    <span key={`p-${participant.id}`}>
                      <Users size={14} />
                      <b>{i18n.tx(participant.name)}</b>
                      <small>
                        {i18n.tx([participant.position, participant.organization].filter(Boolean).join(" · "))}
                      </small>
                    </span>
                  ))}
                  {payload.actions?.map((action) => (
                    <span key={`a-${action.id}`}>
                      <CheckCircle2 size={14} />
                      <b>{i18n.tx(action.title)}</b>
                      <small>
                        {i18n.tx(action.ownerName) || i18n.t("Mas’ul belgilanmagan")}
                        {action.deadlineAt ? i18n.t(" · {p0}", { p0: i18n.tx(dateTime(action.deadlineAt)) }) : ""}
                      </small>
                    </span>
                  ))}
                  {payload.files?.map((file) => (
                    <a
                      key={`f-${file.id}`}
                      href={`/api/information/files?id=${file.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText size={14} />
                      <b>{file.fileName}</b>
                      <small>
                        {humanFileSize(file.size)} · {dateTime(file.createdAt)}
                      </small>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
            <section className="info-detail-section">
              <div className="info-detail-section-title">
                <History size={17} />
                <h4>{i18n.t("O‘zgarishlar tarixi")}</h4>
                <span>
                  {i18n.t("v")}
                  {template?.version ?? 1} {i18n.t("shakl")}
                </span>
              </div>
              <div className="info-history-list">
                {payload?.history?.map((item) => (
                  <span key={item.id}>
                    <i />
                    <div>
                      <strong>
                        {i18n.t(statusLabel(item.status))} · {i18n.tx(item.actor)}
                      </strong>
                      <small>
                        {i18n.t("v")}
                        {item.version} · {dateTime(item.createdAt)}
                      </small>
                    </div>
                  </span>
                ))}
              </div>
            </section>
            {record.comment ? (
              <div className="info-review-comment">
                <strong>{i18n.t("Izoh")}</strong>
                <p>{i18n.tx(record.comment)}</p>
              </div>
            ) : null}
            {canReview && record.status === "submitted" ? (
              <div className="info-review-box">
                <label>
                  <span>{i18n.t("Ko‘rib chiqish izohi")}</span>
                  <textarea
                    value={comment}
                    onChange={(event) => onComment(event.target.value)}
                    rows={3}
                    placeholder={i18n.t("Qaytarilsa, sababini yozing…")}
                  />
                </label>
                <div>
                  <button className="danger-button" disabled={Boolean(busyAction)} onClick={() => onAction("return")}>
                    <RotateCcw size={15} /> {i18n.t("Tahrirga qaytarish")}
                  </button>
                  <button className="primary-button" disabled={Boolean(busyAction)} onClick={() => onAction("publish")}>
                    <BadgeCheck size={15} /> {i18n.t("Tasdiqlash")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
        {record ? (
          <div className="info-drawer-actions">
            {canEdit ? (
              <button className="secondary-button" onClick={onEdit}>
                <Pencil size={16} /> {i18n.t("Tahrirlash")}
              </button>
            ) : null}
            {record.allowedActions?.includes("archive") ? (
              <button className="secondary-button" disabled={Boolean(busyAction)} onClick={() => onAction("archive")}>
                <FileClock size={16} /> {i18n.t("Arxivlash")}
              </button>
            ) : null}
            <span />
            <button className="secondary-button" onClick={onClose}>
              {i18n.t("Yopish")}
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
