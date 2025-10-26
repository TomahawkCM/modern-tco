# Production Readiness Playbook – Modern TCO LMS

This playbook is a session‑by‑session guide to take the app from “feature‑complete beta” to “production‑ready”, with clear phases, owners, acceptance criteria, and copy‑paste commands.

Status snapshot (now)
- Runtime source of truth: Supabase `public.questions` (425 items, TCO‑weighted RPC live)
- Practice: DB‑backed, domain filter, 25/50/75/100 presets, reveal answers
- Mock exam: 105 questions + 105 minutes, variants A/B/C, server‑weighted RPC with fallback
- Dashboard: Quick drills, domain analytics, trends, recent sessions, weakest‑domain callout

Key paths (for reference)
- Content (MDX): `src/content/modules/`
- Questions (JSON): `src/content/questions/`
- Knowledge base: `docs/knowledge-base/`
- Weighted RPC SQL: `supabase/sql/get_weighted_random_questions.sql`
- Seeder & tools: `scripts/seed-questions.ts`, `scripts/report-question-stats.ts`, `scripts/test-weighted-rpc.ts`

Commands (dev shell)
```
set -a; source .env.local 2>/dev/null || true; set +a

# Question seed & stats
npm run content:seed
npm run content:stats

# Weighted RPC test (prints domain breakdown)
npx tsx scripts/test-weighted-rpc.ts 105

# Apply SQL via API (if direct DB networking blocked)
npm run db:apply-sql:api -- --file supabase/sql/get_weighted_random_questions.sql

# Lint / types / tests / e2e
npm run lint
npm run typecheck
npm run test
```

---

## Phase 1 — Data & Content Alignment

Goal: Single source of truth for exam questions; content parity across app, JSON, and DB.

Tasks
1) Import JSON bank → DB (if needed)
   - Owner: Content/DB
   - Action: add importer `scripts/import-questions-from-json.ts` to parse `src/content/questions/comprehensive-assessment-bank.json` and upsert into `public.questions` (coerce domain/difficulty/category; normalize correct answer ids).
   - Verify: `npm run content:stats` shows expected totals and per‑domain distribution.

2) Decide JSON role (artifact vs. live source)
   - Option A (recommended): Treat JSON as import/export artifact; DB is the runtime source.
   - Update README accordingly (done).

Acceptance criteria
- DB contains the authoritative set; RPC returns correct TCO weights on repeated calls.
- README reflects DB reality; JSON path documented as artifact.

Status (complete)
- MDX study modules render via loader/schema (including Foundation).
- MDX→DB seeding available for study modules/sections with ETA extraction.

Commands
```
# Seed study modules + sections from MDX (requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
npm run content:seed:modules
```

---

## Phase 2 — Supabase Schema & Policies

Goal: Harden DB and RPC usage for prod.

Tasks
1) Review `public.questions` enums/constraints
   - Confirm difficulty/category/domain types; ensure text casting in RPC for enum safety (done in function).

2) Finalize RLS & roles
   - Questions: `select` for anon/auth; no `insert/update/delete` without service role.
   - Ensure no leakage of service role to the browser.

3) Migrations hygiene
   - Move ad‑hoc SQL to versioned files; name consistently under `supabase/migrations/`.

Acceptance criteria
- All SQL applied via migrations or explicitly documented.
- RLS verified with a non‑authed client; writes blocked, reads allowed.

---

## Phase 3 — App UX Polish & Accessibility

Goal: Consistent, accessible UI; clear navigation.

Tasks
1) Nav overlap fix (done)
   - Sidebar offset synchronized with header height.

2) Route aliasing for “/exam”
   - Add `/exam` → `/mock` redirect for parity with docs.

3) Accessibility pass (WCAG 2.1 AA)
   - Keyboard focus, landmarks, color contrast, skip links (in place), form labels.

Acceptance criteria
- Axe/lighthouse A11Y score ≥ 95 on core pages.

Status (study modules)
- TOC with active highlight and deep‑link hashes (mobile TOC toggle included).
- Sticky header with current section and ETA; HUD shows remaining time.
- Section progress (complete/needs review) with local persistence and DB upsert.
- Resume: grid and module continue, DB‑backed lastViewed with local fallback.
- Review Center: `/study/review` lists needs‑review sections across modules with deep links; per‑module and mixed‑review practice CTAs.
- Bulk actions: mark all complete, clear review flags, reset progress.

---

## Phase 4 — Testing Strategy

Goal: Confidence via unit, integration, and E2E tests.

Tasks
1) Unit tests
   - exam logic, question service transforms, analytics wrappers.

2) Integration tests
   - Practice flow: start → answer → finish → review recorded.
   - Mock flow: variant selection → auto‑submit on time → results.

3) E2E (Playwright)
   - `/practice` happy path and domain filter paths.
   - `/mock` full start/submit; ensure timer and finish states.
   - `/review` shows incorrect answers from previous session.

Acceptance criteria
- ≥ 80% coverage on core logic; Playwright green on CI.

---

## Phase 5 — Performance & Reliability

Goal: Fast startups, efficient bundles, resilient runtime.

Tasks
1) Lighthouse & Next build analysis
   - Score targets: Performance ≥ 90, Best practices ≥ 95.
   - Split heavy modules; defer non‑critical JS.
   - Completed: code‑split QuestionCard/ExamTimer; deferred particles, Sentry, analytics; avoided loading heavy contexts on non‑content routes.

2) Cache & RPC resiliency
   - Ensure graceful fallback when RPC fails (already implemented); add minimal retry/backoff.

Acceptance criteria
- Lighthouse budgets met; time‑to‑interactive acceptable on mid‑tier hardware.

---

## Phase 6 — Observability & Analytics

Goal: Track issues and behavior in production.

Tasks
1) Error tracking
   - Integrate Sentry or similar; mask PII.

2) Analytics
   - PostHog key configured; confirm pageviews, practice/mock events shipped (existing wrapper in `src/lib/analytics.ts`).

3) Logs & RPC metrics
   - Add minimal logging of RPC timings (client‑side dev only), remove noisy logs for prod.

Acceptance criteria
- Error dashboards connected; analytics sampled in staging before prod.

---

## Phase 7 — Security & Secrets

Goal: Secure handling of keys and RLS.

Tasks
1) Rotate any exposed keys
   - Supabase anon/service; Stripe publishable/secret.

2) Verify env separation
   - `.env.local` for dev; Vercel env vars for prod; no secrets in repo.

3) CSP & headers
   - Add CSP, X‑Frame‑Options, HSTS via Next headers if applicable.

Acceptance criteria
- Vulnerability scan passes; secrets managed in platform vault.

---

## Phase 8 — CI/CD & Deployment

Goal: Reliable builds and releases.

Tasks
1) GitHub Actions (or Vercel CI)
   - Steps: install → lint → typecheck → tests → build → (preview) → deploy.

2) Vercel deploy
   - Ensure `basePath: '/tanium'` is set for production; redirects tested (`vercel.json`).

3) Release process
   - Tagging, changelog, rollback instructions.

Acceptance criteria
- Green CI pipeline; one‑click rollbacks in hosting.

---

## Phase 9 — Go‑Live Checklist

1) Data
   - [ ] question bank verified via `npm run content:stats`
   - [ ] weighted RPC returns correct distribution (`npx tsx scripts/test-weighted-rpc.ts 105`)

2) UX
   - [ ] nav spacing OK across devices
   - [ ] dashboard widgets populate with real data

3) A11Y & Performance
   - [ ] WCAG checks pass (Axe/Lighthouse)
   - [ ] Lighthouse ≥ 90 performance

4) Security
   - [ ] Keys rotated; secrets only in env vars
   - [ ] RLS policies validated

5) Releases
   - [ ] CI green; preview validated
   - [ ] Production deploy executed

---

## Appendix — Quick Links & Paths

- README quick start: `README.md`
- Content modules: `src/content/modules/`
- JSON question bank: `src/content/questions/comprehensive-assessment-bank.json`
- Knowledge base: `docs/knowledge-base/`
- RPC SQL: `supabase/sql/get_weighted_random_questions.sql`
- Seeder: `scripts/seed-questions.ts`
- Stats: `scripts/report-question-stats.ts`
- RPC test: `scripts/test-weighted-rpc.ts`
