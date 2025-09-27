# Secrets & Configuration – Modern TCO LMS

Keep all secrets in environment variables. Never commit secrets to the repo.

## Required
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anonymous key for client reads
- `SUPABASE_SERVICE_ROLE_KEY`: service role (server‑only) for scripts/migrations

## Optional
- `NEXT_PUBLIC_POSTHOG_KEY`: PostHog client analytics key
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN for client error tracking
- Stripe keys: `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_TEAM`
- Testing hooks: `NEXT_PUBLIC_TEST_HOOKS=1` (enables e2e helpers like practice autofinish)

## Placement
- Local dev: `modern-tco/.env.local`
- Staging/Prod: hosting provider environment (e.g., Vercel project settings)

## Rotation
- Rotate keys immediately on exposure; update environment configs and restart builds
- Verify by running `npm run content:stats` and RPC test
