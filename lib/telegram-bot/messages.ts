import { getRuntimeEnv } from "../../db";

/** Text helpers shared by notification builders and bot commands. */

export async function siteLink() {
  const { SITE_BASE_URL } = await getRuntimeEnv();
  const base = SITE_BASE_URL?.trim().replace(/\/+$/, "");
  return base ? `\n${base}` : "";
}

export function formatTashkent(date: Date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
