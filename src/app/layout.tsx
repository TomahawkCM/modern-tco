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
import { AccessibilityInitializer } from "@/components/AccessibilityInitializer";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

// Force dynamic rendering to prevent static generation issues with React hooks
export const dynamic = 'force-dynamic';

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
    <html lang="en" className={inter.className}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://qnwcwoutgarhqxlgsjzs.supabase.co" />
        <link rel="dns-prefetch" href="https://qnwcwoutgarhqxlgsjzs.supabase.co" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://app.posthog.com" />
        <link rel="dns-prefetch" href="https://app.posthog.com" />
      </head>
      <body className="font-sans antialiased">
        {/* HYDRATION FIX: AccessibilityInitializer applies settings AFTER React hydration
            Previously had inline script in <head> that caused React Error #418
            See HYDRATION_FIX_SUMMARY.md and AccessibilityInitializer.tsx for details */}
        <AccessibilityInitializer />
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
        {/* Accessibility global styles - CSS-based to avoid hydration errors */}
        <style>{`
          html[data-large-text="1"] { font-size: 18px; }
          html[data-high-contrast="1"] body { filter: contrast(1.15) saturate(1.1); }
          html[data-high-contrast="1"] :focus-visible { outline: 2px solid #38bdf8; outline-offset: 2px; }
        `}</style>
      </body>
    </html>
  );
}
