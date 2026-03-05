---
name: production-hardening
description: Use when implementing CSP headers, HSTS, env validation, error monitoring, health checks, or other production readiness infrastructure for the Online Budget App.
---

# Production Hardening

## Overview

Patterns and checklists for making the Online Budget App production-ready: security headers, environment validation, error monitoring, health checks, and operational observability.

## When to Use

- Adding or modifying Content-Security-Policy (CSP) headers
- Configuring HSTS or other transport security
- Setting up error monitoring (Sentry)
- Creating health check endpoints
- Validating environment variables at startup
- Performance monitoring and alerting

## CSP Header Guidelines

### Required Directives for This App

The Online Budget App connects to these external services:

| Service | Domains | Directives |
|---------|---------|------------|
| Supabase | `*.supabase.co` | `connect-src`, `img-src` |
| Stripe | `*.stripe.com`, `js.stripe.com` | `script-src`, `connect-src`, `frame-src` |
| Plaid | `*.plaid.com`, `cdn.plaid.com` | `script-src`, `connect-src`, `frame-src` |
| Anthropic | `api.anthropic.com` | `connect-src` |
| Vercel | `*.vercel-insights.com`, `*.vercel-scripts.com` | `script-src`, `connect-src` |
| Sentry | `*.sentry.io`, `*.ingest.sentry.io` | `script-src`, `connect-src` |

### CSP Best Practices
- Start with `default-src 'self'` as baseline
- Use `'unsafe-inline'` for `style-src` (required by Tailwind/shadcn)
- Use `'unsafe-eval'` only if absolutely necessary (avoid if possible)
- Allow `blob:` and `data:` for `img-src` (charts export, OCR)
- Test CSP in report-only mode first (`Content-Security-Policy-Report-Only`)

## HSTS Configuration

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- `max-age=31536000` = 1 year
- `includeSubDomains` — applies to all subdomains
- `preload` — eligible for browser preload lists (submit to hstspreload.org after stable)

## Environment Validation Pattern

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Public (available in browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Server-only
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // ... etc
});

// Validate at import time — app crashes early if invalid
export const env = envSchema.parse(process.env);
```

### Rules
- Validate ALL required env vars, not just some
- Fail at startup, not at first use — crash early with clear error
- Separate public vs server-only vars
- Optional vars should use `.optional()` or `.default()`
- Log which var is missing (but never log the value)

## Health Check Endpoint

### Standard Response Format
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "ISO-8601",
  "services": {
    "database": { "status": "up", "latency_ms": 12 },
    "stripe": { "status": "up" },
    "plaid": { "status": "up" }
  },
  "version": "0.1.0"
}
```

### Rules
- Return 200 for healthy/degraded, 503 for unhealthy
- Check DB with a lightweight query (`SELECT 1`)
- Don't check external services on every call — cache status for 60s
- Include response time for each service
- Never expose sensitive info (connection strings, keys)

## Sentry Configuration

### Key Settings
- `environment`: match Vercel deployment (production, preview, development)
- `tracesSampleRate`: 0.1 in production (10% of requests)
- `replaysSessionSampleRate`: 0.1 (10% of sessions)
- `replaysOnErrorSampleRate`: 1.0 (100% of error sessions)
- Filter out known non-issues (ResizeObserver, cancelled fetch)

### Source Maps
- Upload source maps during build (`withSentryConfig` in next.config.ts)
- Hide source maps from browser (don't serve `.map` files)

## Verification Checklist

After implementing production hardening:

- [ ] `curl -I https://app-url/` shows CSP header
- [ ] `curl -I https://app-url/` shows HSTS header
- [ ] `curl https://app-url/api/health` returns 200 with service status
- [ ] Remove a required env var → app fails to start with clear error
- [ ] Trigger a test error → appears in Sentry dashboard
- [ ] CSP doesn't break: Supabase auth, Stripe checkout, Plaid Link, AI chat
- [ ] No console CSP violation errors on dashboard page
