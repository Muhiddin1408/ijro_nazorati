export function captureActivationLocation(href: string, previouslyCapturedToken: string | null) {
  if (previouslyCapturedToken !== null) {
    return { token: previouslyCapturedToken, sanitizedUrl: null as string | null };
  }
  const url = new URL(href);
  const token = url.searchParams.get("activate") ?? "";
  if (!url.searchParams.has("activate")) return { token, sanitizedUrl: null as string | null };
  url.searchParams.delete("activate");
  return { token, sanitizedUrl: `${url.pathname}${url.search}${url.hash}` };
}
