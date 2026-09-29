"use client";

import { type ReactNode } from "react";

export function scopeLabel(scope: string) {
  return (
    (
      {
        all: "Barchasi",
        subtree: "Quyi tuzilma",
        organization: "O‘z tashkiloti",
        department: "O‘z bo‘limi",
        own: "Faqat o‘zi",
        none: "Yo‘q",
      } as Record<string, string>
    )[scope] ?? scope
  );
}

export function organizationTypeLabel(type: string) {
  return (
    (
      {
        committee: "Qo‘mita",
        central: "Qo‘mita markaziy apparati",
        territorial: "Hududiy bosh boshqarma",
        district: "Tuman tashkiloti",
        direct_subordinate: "Qo‘mitaga to‘g‘ridan-to‘g‘ri bo‘ysunuvchi",
        all: "Barcha tashkilotlar",
      } as Record<string, string>
    )[type] ?? type
  );
}

export function Summary({ icon, tone, label, value }: { icon: ReactNode; tone: string; label: string; value: string }) {
  return (
    <div>
      <span className={`metric-icon ${tone}`}>{icon}</span>
      <p>
        <small>{label}</small>
        <strong>{value}</strong>
      </p>
    </div>
  );
}
