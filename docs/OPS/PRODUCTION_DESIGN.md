# Production Architecture & Operations Design – Modern TCO LMS

This document describes the production‑ready design for the Modern TCO LMS, including architecture, environment layout, deployment, security, observability, data strategy, testing, and SLOs.

## 1) Architecture Overview

- Frontend: Next.js (App Router) + TypeScript, shadcn/ui + Radix
- Data: Supabase Postgres + RLS, RPC for weighted mock selection
- Content:
  - Runtime questions: Supabase `public.questions`
  - Learning modules: MDX files under `src/content/modules/`
  - JSON question bank as import/export artifact (`src/content/questions/`)
- Analytics & Monitoring:
  - PostHog (client analytics with opt‑in key)
  - Sentry (client error tracking, env‑guarded)
  - Custom lightweight `trackEvent` (optional; recommend PostHog for prod)

## 2) Environments & Branching

- Development: local `.env.local`; Supabase dev project
- Staging: preview deploys on PRs; Supabase staging project
- Production: main branch → Vercel prod; Supabase prod project

Branching strategy
- `main` = production
- Feature branches → PR → preview → merge to main

## 3) Configuration & Secrets

- Runtime configuration through env vars (no secrets committed).
- Required vars:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server‑only for scripts/migrations)
  - `NEXT_PUBLIC_POSTHOG_KEY` (optional)
  - `NEXT_PUBLIC_SENTRY_DSN` (optional)
  - Stripe keys if enabling checkout
- See `env.example` and `docs/OPS/SECRETS.md`.

## 4) Database & Data Strategy

- Runtime source of truth: `public.questions`
- RPC: `public.get_weighted_random_questions(question_count integer)` for TCO‑weighted mock exams
- RLS:
  - `questions`: `select` for anon/auth; no write without service role
  - Others: user‑scoped tables (e.g., progress) restricted by `auth.uid()`
- Migrations:
  - Versioned under `supabase/migrations/`
  - Ad hoc SQL: `supabase/sql/` (apply via SQL editor/CLI and then capture into a migration)
- Imports:
  - `npm run content:import-json` to upsert JSON bank into DB

## 5) Deployment & Delivery

- Platform: Vercel (basePath `/tanium` in prod)
- Redirects: `/exam` → `/mock` (and `/tanium/exam` → `/tanium/mock`)
- CI/CD:
  - GitHub Actions: lint → typecheck → tests → build
  - Gate merges on green CI

## 6) Security & Compliance

- Secrets in env only; rotate keys on exposure (Supabase anon/service, Stripe, Sentry)
- RLS enforced for all user data tables
- Security headers:
  - X‑Content‑Type‑Options, Referrer‑Policy, X‑Frame‑Options, Permissions‑Policy
  - CSP to be finalized after whitelisting all origins (YouTube, PostHog, Sentry, Supabase)
- PII: avoid sending PII to analytics; Sentry configured with low sample rate

## 7) Observability

- PostHog for behavior analytics (optional; enable via key)
- Sentry for client errors (optional; `NEXT_PUBLIC_SENTRY_DSN`)
- Custom monitoring events disabled by default (RLS will block anon inserts unless configured)

## 8) Performance Targets

- Lighthouse: Performance ≥ 90, A11Y ≥ 95, Best Practices ≥ 95
- Bundle hygiene: split heavy pages, lazy load non‑critical modules
- RPC fallback: graceful degraded behavior if RPC unavailable

## 9) Testing & QA

- Unit: core logic (exam, transforms, wrappers)
- Integration: practice/mock update ProgressContext; review flow
- E2E (Playwright): quick drill, mock start/finish, review empty-state and content
- CI: run unit/integration on every commit; E2E on protected branches or nightly

## 10) SLOs & Runbooks

- SLOs
  - Availability: 99.9% front‑end availability (Vercel)
  - Response: initial route interactive < 2s on mid‑tier devices
- Runbooks
  - Incident response (triage, rollback): see `docs/OPS/RUNBOOK.md`
  - Key rotation: see `docs/OPS/SECRETS.md`
  - Migrations & rollback: versioned SQL; use staging first

## 11) Risks & Mitigations

- RPC changes breaking client: maintain fallback to local weighted selection
- Analytics causing regressions: analytics wrappers are no‑ops without keys
- Key leakage: rotate immediately; secrets only in env; set Vercel/CI envs

## 12) Roadmap to Production

- Short‑term (1–2 weeks)
  - Finalize RPC and RLS in Supabase
  - Expand E2E for practice finish & review assertions
  - Add Sentry DSN in staging; verify
  - Lighthouse pass and tune
- Mid‑term (2–4 weeks)
  - Harden CSP for prod
  - Expand monitoring dashboards; error budgets
  - Stripe checkout if needed (guarded by keys)

