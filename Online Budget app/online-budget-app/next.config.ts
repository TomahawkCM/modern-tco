import type { NextConfig } from "next";
import { resolve } from "path";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Content Security Policy directives.
 *
 * Services allowed:
 * - Supabase: auth, database, storage, realtime
 * - Stripe: checkout, payment elements
 * - Plaid: Link widget
 * - Anthropic: AI chat API
 * - Vercel: analytics, speed insights
 * - Sentry: error monitoring
 * - Google Fonts: font loading
 */
const cspDirectives = [
  "default-src 'self'",
  // Scripts: self + inline (Next.js hydration) + Stripe + Plaid + Vercel + Sentry
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' js.stripe.com cdn.plaid.com *.vercel-scripts.com *.sentry-cdn.com",
  // Styles: self + inline (Tailwind/shadcn dynamic classes)
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  // Images: self + data URIs (charts) + blobs (OCR/export) + Supabase storage
  "img-src 'self' data: blob: *.supabase.co",
  // Fonts: self + Google Fonts
  "font-src 'self' fonts.gstatic.com",
  // Connect: API calls to all services
  "connect-src 'self' *.supabase.co wss://*.supabase.co api.anthropic.com *.stripe.com *.plaid.com *.vercel-insights.com *.ingest.sentry.io",
  // Frames: Stripe checkout + Plaid Link
  "frame-src 'self' js.stripe.com *.plaid.com",
  // Workers: self (service worker, OCR)
  "worker-src 'self' blob:",
  // Object: none (no Flash/plugins)
  "object-src 'none'",
  // Base URI: restrict to self
  "base-uri 'self'",
  // Form action: restrict to self + Stripe
  "form-action 'self' *.stripe.com",
  // Frame ancestors: none (prevent clickjacking)
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(__dirname),
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  // Suppress Sentry CLI logs during build
  silent: !process.env.CI,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Source maps: upload to Sentry but don't serve to browser
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Disable Sentry telemetry
  disableLogger: true,
});
