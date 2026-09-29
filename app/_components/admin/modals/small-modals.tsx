"use client";

/** Topic editor and Telegram link dialog. */

import {
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Link2,
  Megaphone,
  Save,
  Send,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { ModalFrame, ModalHeader } from "../../../dashboard-kit";
import { avatarColor, formatDateTime, initials } from "../../../ui-helpers";
import type { AdminModalTopic, TelegramLinkModalState } from "./admin-modal-types";
import { useI18n } from "../../../../lib/i18n";

export function TopicModal({
  topic,
  onClose,
  onSubmit,
}: {
  topic?: AdminModalTopic;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const { t } = useI18n();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: form.get("name"),
      description: form.get("description"),
      color: form.get("color"),
      active: topic ? form.get("active") === "on" : true,
    });
  }
  return (
    <ModalFrame onClose={onClose}>
      <form onSubmit={submit}>
        <ModalHeader
          kicker={t("ADMINISTRATOR")}
          title={topic ? t("Tematikani tahrirlash") : t("Yangi tematika")}
          subtitle={t("Topshiriqlarni manba va yo‘nalish bo‘yicha tartiblang")}
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-grid single">
            <label>
              <span>{t("Tematika nomi")} *</span>
              <input
                name="name"
                defaultValue={topic?.name}
                required
                minLength={3}
                maxLength={160}
                placeholder={t("Masalan: Apparat yig‘ilishi")}
              />
            </label>
            <label>
              <span>{t("Izoh")}</span>
              <textarea
                name="description"
                rows={3}
                defaultValue={topic?.description}
                maxLength={500}
                placeholder={t("Tematika qachon qo‘llanishini yozing")}
              />
            </label>
            <label>
              <span>{t("Rang belgisi")}</span>
              <div className="color-input">
                <input type="color" name="color" defaultValue={topic?.color ?? "#1957D2"} />
                <span>{t("Kartochka va hisobotlarda ko‘rinadi")}</span>
              </div>
            </label>
          </div>
          {topic ? (
            <label className="switch-row">
              <input type="checkbox" name="active" defaultChecked={topic.active} />
              <span>
                <strong>{t("Faol tematika")}</strong>
                <small>{t("Faol bo‘lmagan tematika yangi topshiriqda tanlanmaydi")}</small>
              </span>
            </label>
          ) : null}
        </div>
        <div className="modal-footer">
          <span>
            <Megaphone size={15} /> {t("Tematika mavjud topshiriqlarda saqlanib qoladi")}
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

export function TelegramLinkModal({
  state,
  configured,
  onClose,
  onCreate,
  onTest,
}: {
  state: TelegramLinkModalState;
  configured: boolean;
  onClose: () => void;
  onCreate: () => Promise<void>;
  onTest: () => void;
}) {
  const { t, tx } = useI18n();
  const [loading, setLoading] = useState(false);
  return (
    <ModalFrame onClose={onClose}>
      <ModalHeader
        kicker="TELEGRAM"
        title={t("{name}ni ulash", { name: tx(state.employee.name) })}
        subtitle={t("Bir martalik havola 30 daqiqa amal qiladi")}
        onClose={onClose}
      />
      <div className="modal-body">
        <div className="employee-link-profile">
          <span className={`person-avatar ${avatarColor(state.employee.id)}`}>{initials(state.employee.name)}</span>
          <div>
            <strong>{tx(state.employee.name)}</strong>
            <small>
              {tx(state.employee.roleName)} · {tx(state.employee.department)}
            </small>
          </div>
          <span className={`connection-badge ${state.employee.telegramLinked ? "connected" : ""}`}>
            {state.employee.telegramLinked ? <Wifi size={14} /> : <WifiOff size={14} />}
            {state.employee.telegramLinked ? t("Ulangan") : t("Ulanmagan")}
          </span>
        </div>
        {state.link ? (
          <div className="link-result">
            <CheckCircle2 size={22} />
            <div>
              <strong>{t("Ulash havolasi tayyor")}</strong>
              {state.link.url ? (
                <p data-alphabet-static="true">{state.link.url}</p>
              ) : (
                <p>
                  {t("Botga quyidagi buyruqni yuboring:")}{" "}
                  <code data-alphabet-static="true">/start {state.link.token}</code>
                </p>
              )}
              <small>{t("{date} gacha amal qiladi", { date: formatDateTime(state.link.expiresAt) })}</small>
            </div>
            {state.link.url ? (
              <a className="primary-button" href={state.link.url} target="_blank" rel="noreferrer">
                {t("Telegram’da ochish")} <ExternalLink size={15} />
              </a>
            ) : null}
          </div>
        ) : (
          <div className="secure-note">
            <ShieldCheck size={18} />
            <div>
              <strong>{t("Xavfsiz bog‘lash")}</strong>
              <span>
                {t("Chat ID qo‘lda kiritilmaydi. Xodim havolani ochgach Telegram hisobi avtomatik tasdiqlanadi.")}
              </span>
            </div>
          </div>
        )}
        {!configured ? (
          <div className="warning-note">
            <CircleAlert size={17} />
            <span>
              {t("Bot tokeni sozlanmagan. Havola kodi yaratiladi, lekin bot token kiritilmaguncha ishlamaydi.")}
            </span>
          </div>
        ) : null}
      </div>
      <div className="modal-footer">
        <span>
          <Link2 size={15} /> {t("Havola bir marta ishlatiladi")}
        </span>
        <div>
          <button className="secondary-button" onClick={onClose}>
            {t("Yopish")}
          </button>
          {state.employee.telegramLinked ? (
            <button className="primary-button" disabled={!configured} onClick={onTest}>
              <Send size={16} /> {t("Sinov xabari")}
            </button>
          ) : (
            <button
              className="primary-button"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                void onCreate().finally(() => setLoading(false));
              }}
            >
              <Link2 size={16} />
              {loading ? t("Yaratilmoqda...") : t("Havola yaratish")}
            </button>
          )}
        </div>
      </div>
    </ModalFrame>
  );
}
