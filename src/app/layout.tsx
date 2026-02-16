import { AnalyticsClient } from "@/app/analytics-client";
import { MonitoringClient } from "@/app/monitoring-client";
import { AccessibilityInitializer } from "@/components/AccessibilityInitializer";
import MonitoringErrorBoundary from "@/components/MonitoringErrorBoundary";
import { SkipLinks } from "@/components/accessibility/skip-links";
import { MainLayout } from "@/components/layout/main-layout";
import { Toaster } from "@/components/ui/toaster";
import { LOCALE_METADATA } from "@/i18n/config";
import { getLocalePreferences } from "@/lib/locale-storage";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import "../styles/touch-targets.css";
import { Providers } from "./providers";

// Client-side sync UI wrapper
import SyncClientWrapper from "@/components/SyncClientWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// PERFORMANCE FIX: Removed 'force-dynamic' to enable static generation
// Pages that need dynamic rendering should set it at page level
// export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Tanium Certified Operator Exam System",
  description:
    "Master the Tanium Certified Operator certification with interactive practice and comprehensive study modules",
  keywords: ["Tanium", "TCO", "Certification", "Training", "Exam Preparation"],
  authors: [{ name: "TCO Study Platform" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#14B8A6" },
    { media: "(prefers-color-scheme: light)", color: "#0D9488" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Get locale preferences for dynamic lang and dir attributes
  const locale = getLocalePreferences().locale || "en-US";
  const dir = LOCALE_METADATA[locale]?.dir || "ltr";
  const langCode = locale.split("-")[0]; // Extract language code (e.g., 'en' from 'en-US')

  return (
    <html
      lang={langCode}
      dir={dir}
      className={`${inter.className}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Budget" />
        <link rel="apple-touch-icon" href="/icons/budget-app-192.png" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://qnwcwoutgarhqxlgsjzs.supabase.co" />
        <link rel="dns-prefetch" href="https://qnwcwoutgarhqxlgsjzs.supabase.co" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://app.posthog.com" />
        <link rel="dns-prefetch" href="https://app.posthog.com" />

        {/* PDF.js from CDN for OCR functionality - bypasses webpack bundling issues */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
      </head>
      <body
        className="layout-safe bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        {/* Load PDF.js from CDN - bypasses webpack bundling issues */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          strategy="beforeInteractive"
        />

        {/* HYDRATION FIX: AccessibilityInitializer applies settings AFTER React hydration
            Previously had inline script in <head> that caused React Error #418
            See HYDRATION_FIX_SUMMARY.md and AccessibilityInitializer.tsx for details */}
        <AccessibilityInitializer />
        <div className="min-h-screen bg-background">
          <Providers>
            {/* Client wrapper renders Sync UI, Onboarding, Command Palette (uses LANSyncContext internally) */}
            <SyncClientWrapper />

            <MainLayout asGlobal>
              <SkipLinks />
              <MonitoringErrorBoundary>{children}</MonitoringErrorBoundary>
              <Suspense fallback={null}>
                <AnalyticsClient />
                <MonitoringClient />
              </Suspense>
            </MainLayout>
            <Toaster />
          </Providers>
        </div>
        {/* Accessibility global styles - CSS-based to avoid hydration errors */}
        <style>{`
          html[data-large-text="1"] { font-size: 18px; }
          html[data-high-contrast="1"] body { filter: contrast(1.15) saturate(1.1); }
          html[data-high-contrast="1"] :focus-visible { outline: 2px solid #14b8a6; outline-offset: 2px; }
        `}</style>
        {/* Register service worker on client side */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
        >{`if('serviceWorker' in navigator){navigator.serviceWorker.register('/service-worker.js').catch(()=>{});}`}</Script>
      </body>
    </html>
  );
}
