"use client";

import { useI18n } from "../lib/i18n";
type RoadLoaderProps = {
  label?: string;
  detail?: string;
  compact?: boolean;
};

export function RoadLoader({
  label = "Ma’lumotlar yuklanmoqda",
  detail = "Yo‘l infratuzilmasi va boshqaruv ma’lumotlari tayyorlanmoqda…",
  compact = false,
}: RoadLoaderProps) {
  const { t } = useI18n();
  return (
    <div
      className={`road-loader ${compact ? "road-loader-compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    >
      <div className="road-loader-engineering" aria-hidden="true">
        <div className="road-loader-chainage">
          <span>0+000</span>
          <span>25+000</span>
          <span>50+000</span>
        </div>
        <div className="road-loader-alignment">
          <span className="road-loader-centerline" />
          <span className="road-loader-scan" />
        </div>
        <div className="road-loader-scale">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="road-loader-caption">
          <span>{t("MA’LUMOTLAR YO‘NALISHI")}</span>
          <span className="road-loader-state">
            <i /> {t("TEKSHIRILMOQDA")}
          </span>
        </div>
      </div>
      <strong>{t(label)}</strong>
      <span>{t(detail)}</span>
    </div>
  );
}
