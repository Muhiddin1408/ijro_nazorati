import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, localeLang, parseLocale } from "../lib/i18n/core";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./dark-theme.css";
import "./information-search.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ichki hisobotlarni boshqarish tizimi",
  description: "Ichki hisobotlar, topshiriqlar, yig‘ilishlar va korporativ hujjatlarni yagona tizimda boshqarish.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1957d2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

const themeInitScript = `
(function () {
  try {
    var key = "internal-reports-color-mode";
    var mode = localStorage.getItem(key) || "system";
    var dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Per-request CSP nonce from proxy.ts; reading headers keeps the shell dynamic.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const lang = localeLang(parseLocale((await cookies()).get(LOCALE_COOKIE)?.value) ?? "lotin");
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
