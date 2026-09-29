"use client";

import { useI18n } from "../../../lib/i18n";
import { Download, Paperclip, UploadCloud } from "lucide-react";
import { humanSize } from "../../ui-helpers";
import type { ReportAssignment } from "./report-types";
import type { ReportSheet } from "./use-report-sheet";

/** Comment and supporting files, collapsed under the worksheet. */
export function ReportSheetExtras({ assignment, sheet }: { assignment: ReportAssignment; sheet: ReportSheet }) {
  const i18n = useI18n();
  const { file, setFile, existingFiles, comment, setComment, editable } = sheet;
  return (
    <details className="report-sheet-extras">
      <summary>
        <Paperclip size={15} /> {i18n.t("Izoh va tasdiqlovchi fayllar")}{" "}
        <span>
          {file
            ? i18n.t("1 ta yangi fayl tanlangan")
            : existingFiles.length
              ? i18n.t("{length} ta fayl mavjud", { length: existingFiles.length })
              : i18n.t("ixtiyoriy")}
        </span>
      </summary>
      <div>
        <label className="full report-comment">
          <span>{i18n.t("Izoh")}</span>
          <textarea
            name="comment"
            rows={3}
            value={comment}
            readOnly={!editable}
            onChange={(event) => setComment(event.target.value)}
            placeholder={i18n.t("Qo‘shimcha tushuntirish yoki muammo haqida yozing...")}
          />
        </label>
        <div className="report-existing-files">
          {existingFiles.map((item) => (
            <a key={item.id} href={`/api/reports/files?id=${item.id}`}>
              <Paperclip size={15} />
              {item.fileName}
              <Download size={14} />
            </a>
          ))}
        </div>
        <label className="report-file-picker">
          <UploadCloud size={19} />
          <span>
            <strong>{file ? i18n.tx(file.name) : i18n.t("Tasdiqlovchi fayl biriktirish")}</strong>
            <small>
              {file
                ? humanSize(file.size)
                : i18n.t("{p0} · 100 MB gacha", {
                    p0: i18n.tx(assignment.template.requireAttachment ? "Majburiy" : "Ixtiyoriy"),
                  })}
            </small>
          </span>
          <input type="file" disabled={!editable} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </label>
      </div>
    </details>
  );
}
