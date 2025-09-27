import { Suspense } from "react";
import { Providers } from "./providers";
import MonitoringErrorBoundary from "@/components/MonitoringErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MainLayout } from "@/components/layout/main-layout";
import { SkipLinks } from "@/components/accessibility/skip-links";
import { AnalyticsClient } from "@/app/analytics-client";
import { MonitoringClient } from "@/app/monitoring-client";

export const metadata: Metadata = {
  title: "Tanium Certified Operator Exam System",
  description: "Master the Tanium Certified Operator certification with interactive practice and comprehensive study modules",
  keywords: ["Tanium", "TCO", "Certification", "Training", "Exam Preparation"],
  authors: [{ name: "TCO Study Platform" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://qnwcwoutgarhqxlgsjzs.supabase.co" />
        <link rel="dns-prefetch" href="https://qnwcwoutgarhqxlgsjzs.supabase.co" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://app.posthog.com" />
        <link rel="dns-prefetch" href="https://app.posthog.com" />
        
        {/* Preload critical font */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        {/* Initialize large-text mode early to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { var v = localStorage.getItem('tco-large-text'); if (v === '1') { document.documentElement.style.fontSize='18px'; document.documentElement.setAttribute('data-large-text','1'); } var hc = localStorage.getItem('tco-high-contrast'); if (hc === '1') { document.documentElement.setAttribute('data-high-contrast','1'); } } catch (e) {} })();`,
          }}
        />
        <div className="min-h-screen bg-gradient-to-br from-black via-black to-black">
          <Providers>
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
        {/* High-contrast minimal global styles */}
        <style>{`
          html[data-high-contrast="1"] body { filter: contrast(1.15) saturate(1.1); }
          html[data-high-contrast="1"] :focus-visible { outline: 2px solid #38bdf8; outline-offset: 2px; }
        `}</style>
      </body>
    </html>
  );
}
