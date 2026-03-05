import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { LOCALE_METADATA, getValidLocale, type SupportedLocale } from "@/i18n/config";
import "@/styles/globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Online Budget App",
  description: "AI-powered, bank-connected global budgeting app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value ?? "en-US";
  const locale = getValidLocale(localeCookie) as SupportedLocale;
  const lang = locale.split("-")[0] || "en";
  const dir = LOCALE_METADATA[locale]?.dir ?? "ltr";

  return (
    <html lang={lang} dir={dir}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
