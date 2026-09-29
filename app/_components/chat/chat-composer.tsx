"use client";

import { Paperclip, Send, X } from "lucide-react";
import type { FormEvent } from "react";
import { useI18n } from "../../../lib/i18n";
import { humanSize } from "../../ui-helpers";
import type { ChatNotify } from "./chat-types";

const MAX_CHAT_FILE_BYTES = 500 * 1024 * 1024;

/** Message form with an optional attachment; Enter sends, Shift+Enter adds a line. */
export function ChatComposer({
  broadcast,
  file,
  setFile,
  fileUploading,
  uploadProgress,
  pendingSends,
  notify,
  onSubmit,
}: {
  broadcast: boolean;
  file: File | null;
  setFile: (file: File | null) => void;
  fileUploading: boolean;
  uploadProgress: number | null;
  pendingSends: number;
  notify: ChatNotify;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useI18n();
  return (
    <form className="chat-composer" onSubmit={onSubmit}>
      {file ? (
        <div className="composer-file">
          <Paperclip size={15} />
          <span>
            {file.name} · {humanSize(file.size)}
          </span>
          <button type="button" onClick={() => setFile(null)} aria-label={t("Faylni olib tashlash")}>
            <X size={14} />
          </button>
        </div>
      ) : null}
      {uploadProgress != null ? (
        <div className="upload-progress">
          <span>
            <i style={{ width: `${uploadProgress}%` }} />
          </span>
          <strong>{uploadProgress}%</strong>
        </div>
      ) : null}
      <div className="chat-composer-row">
        <label className="chat-attach" aria-label={t("Fayl biriktirish")}>
          <Paperclip size={20} />
          <input
            type="file"
            aria-label={t("Fayl biriktirish")}
            disabled={fileUploading}
            onChange={(event) => {
              const chosen = event.target.files?.[0] ?? null;
              event.currentTarget.value = "";
              if (chosen && chosen.size > MAX_CHAT_FILE_BYTES) {
                notify("Fayl hajmi 500 MB dan oshmasligi kerak", "error");
                return;
              }
              setFile(chosen);
            }}
          />
        </label>
        <textarea
          name="body"
          rows={3}
          maxLength={5000}
          aria-label={t("Xabar matni")}
          aria-describedby="chat-composer-hint"
          placeholder={broadcast ? t("Barcha xodimlar uchun e’lon yozing...") : t("Xabar yozing...")}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button className="primary-button" disabled={fileUploading && Boolean(file)} aria-label={t("Xabarni yuborish")}>
          <Send size={18} />
          <span>{fileUploading ? t("Yuklanmoqda") : pendingSends ? t("Yuborilmoqda") : t("Yuborish")}</span>
        </button>
      </div>
      <small className="composer-hint" id="chat-composer-hint" aria-live="polite">
        {t("Enter — yuborish · Shift+Enter — yangi qator")}
      </small>
    </form>
  );
}
