# Operations Runbook – Modern TCO LMS

## Purpose
Step‑by‑step guidance for common operational tasks: incidents, rollbacks, migrations, keys, and checks.

## Incident Response
1) Detect & Triage
- Monitor Sentry (errors) and hosting logs
- Check Vercel status, Supabase status

2) Mitigate
- If a deploy caused errors, roll back to previous Vercel build
- If RPC errors: verify Supabase health; app will fallback to local weighted selection

3) Communicate
- Post a short incident summary; ETA updates every 30–60 min if major

4) Resolve
- Root cause analysis; add tests or guards

## Rollback Procedure (Vercel)
- In Vercel dashboard: Deployments → select previous successful → Promote
- Verify smoke tests (practice start, mock start, review page)

## DB Migrations
- Apply in staging first: Supabase SQL editor with migration files under `supabase/migrations/`
- For ad‑hoc: place SQL under `supabase/sql/` and then capture into a numbered migration

## Key Rotation
- Supabase: rotate anon + service role; update Vercel env and `.env.local`
- Sentry/PostHog/Stripe: rotate per vendor portals; update env vars
- After rotation: `npm run content:stats` and `npx tsx scripts/test-weighted-rpc.ts 105`

## Smoke Checklist
- /practice: start, see question, finish
- /mock: start, finish early, see results
- /review: empty state visible (before any wrong answers)
- Weighted RPC: `npx tsx scripts/test-weighted-rpc.ts 105` prints domain breakdown

## Performance & A11Y Quick Checks
- Lighthouse: Performance ≥ 90, A11Y ≥ 95
- Keyboard focus visible; skip links present

## Support
- Ownership: Frontend (Next.js) / Data (Supabase) / Ops (Vercel)
- Update this runbook after each incident
