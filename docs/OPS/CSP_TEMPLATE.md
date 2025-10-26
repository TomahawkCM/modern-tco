
# CSP Template & Guidance – Modern TCO LMS

A starting point for Content Security Policy (CSP) headers. Adjust to your integrations and test thoroughly.

## Suggested CSP (baseline)

Note: If you use YouTube embeds, Supabase, Sentry, and PostHog, whitelist their origins. Start permissive, then tighten.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://browser.sentry-cdn.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://i.ytimg.com https://img.youtube.com;
  frame-src https://www.youtube.com https://www.youtube-nocookie.com;
  connect-src 'self' https://*.supabase.co https://*.posthog.com https://sentry.io https://*.sentry.io;
```

## How to apply
- In `next.config.js`, set the header for all routes (remove comment). Example:
```
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://i.ytimg.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self' https://*.supabase.co;"
}
```
- Test with browser devtools; check console for CSP violations.

## Tips
- Avoid over‑permissive rules; whitelist exact domains.
- Separate staging vs prod CSPs if needed.
- If using Sentry/PostHog, add their API endpoints to `connect-src`.
