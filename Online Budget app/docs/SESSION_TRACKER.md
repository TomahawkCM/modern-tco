# Session Tracker

## Current State

- **Current Sprint**: Sprint 2 — Multi-Currency + i18n (COMPLETE)
- **Current Session**: S6 — i18n Completion (COMPLETE)
- **Last Updated**: 2026-03-04

## Completed Sessions

### Session 0 — Pre-work (2026-03-03)

- [x] Create `session-continuity` skill
- [x] Create `SESSION_TRACKER.md`
- [x] Create `production-hardening` skill
- **Files**: `.claude/Skills/session-continuity.md`, `Online Budget app/docs/SESSION_TRACKER.md`, `.claude/Skills/production-hardening.md`

### Session 1 — Security Headers & Monitoring (2026-03-03)

- [x] Add CSP header to `next.config.ts`
- [x] Add HSTS header to `next.config.ts`
- [x] Add Sentry error monitoring (`@sentry/nextjs`)
- [x] Create `/api/health` endpoint
- [x] Create Zod env validation in `lib/env.ts`
- [x] Fix all pre-existing lint errors (6 errors → 0 errors, 30 warnings → 10 warnings)
- **Files created**: `lib/env.ts`, `app/api/health/route.ts`, `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`
- **Files modified**: `next.config.ts`, `app/global-error.tsx`, `package.json`
- **Pre-existing fixes**: `components/calculators/currency-input.tsx`, `components/calculators/percent-input.tsx`, `components/review/friday-review-wizard.tsx`, `components/export/export-form.tsx`, `components/net-worth/net-worth-dashboard.tsx`, `components/splits/splits-dashboard.tsx`, `components/properties/property-detail.tsx`, `components/settings/merchant-rules-list.tsx`, `components/planning/paycheck-planner.tsx`, `components/scenarios/scenarios-dashboard.tsx`, `server/schemas/budget.test.ts`, `server/schemas/merchant-mapping.test.ts`, `app/(app)/calculators/net-worth-forecast/page.tsx`, `app/(app)/calculators/subscription-cost/page.tsx`, `app/(app)/friday-review/page.tsx`, `app/(app)/transactions/page.tsx`

### Session 2 — Auth Rate Limiting & Email Verification (2026-03-03)

- [x] Create `auth-hardening` skill (`.claude/Skills/auth-hardening.md`)
- [x] Move rate limiting from in-memory to Supabase (`rate_limits` table with TTL cleanup)
- [x] Add auth-specific rate limits: login (5/min), signup (3/min), forgot-password (2/min)
- [x] Enforce email verification — block login until email confirmed, redirect to `/verify-email`
- [x] Add "resend verification email" flow
- [x] Add auth event audit logging to `audit_log` table (login success/failure, signup, password reset, logout)
- [x] Add session management UI in settings ("Log out of all devices" button)
- [x] Add `role` column to `users` table (owner/admin/member/viewer)

**Files created**:

- `.claude/Skills/auth-hardening.md` — auth hardening skill
- `supabase/migrations/013_rate_limits_and_audit_log.sql` — rate_limits, audit_log tables, users.role column
- `server/audit-log.ts` — auth event logging utility
- `app/(auth)/verify-email/page.tsx` — email verification pending page
- `components/settings/session-management.tsx` — session management UI component

**Files modified**:

- `lib/rate-limit.ts` — rewrote to use Supabase-backed storage with in-memory fallback
- `app/(auth)/actions.ts` — added rate limiting, email verification check, audit logging, signOutAllDevices, resendVerificationEmail
- `app/(auth)/login/page.tsx` — added error display, forgot password link
- `app/(app)/settings/page.tsx` — added SessionManagement component
- `supabase/database.types.ts` — added rate_limits, audit_log types, users.role field

**Decisions**:

- Rate limiting uses Supabase `rate_limits` table with in-memory fallback if DB unavailable
- Email verification enforced by checking `email_confirmed_at` on login, signing out and redirecting to `/verify-email` if null
- Audit logging uses admin client (service role) to bypass RLS — server-side only
- "Logout all devices" uses `supabase.auth.admin.signOut(userId, 'global')` via admin client
- RBAC roles: owner/admin/member/viewer — added to users table via migration 013

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all new/modified files (0 errors)
- [x] `vitest run` — 331 tests pass (35 files)

### Session 3 — Admin Dashboard (Fresh Build) (2026-03-03)

- [x] Create `server/admin.ts` with all admin server actions (RBAC guard, stats, user management, audit log)
- [x] Create `app/(admin)/layout.tsx` with RBAC guard (checks `users.role` for admin/owner)
- [x] Build admin dashboard page with stat cards (Total Users, MRR, Active Subscriptions, Active Trials) + signup trend chart
- [x] Build user management page with search, paginated table, action buttons (extend trial, suspend/unsuspend, toggle admin role)
- [x] Create `/api/admin/action` API route for user management mutations
- [x] Build audit log viewer with filters (action type, date range) and pagination

**Files created**:

- `server/admin.ts` — admin server actions: `assertAdmin`, `getAdminStats`, `listUsers`, `suspendUser`, `unsuspendUser`, `extendTrial`, `changeUserRole`, `getAuditLog`
- `app/(admin)/layout.tsx` — RBAC guard layout with sidebar nav (Dashboard, Users, Audit Log) + mobile nav
- `app/(admin)/dashboard/page.tsx` — stat cards + signup trend chart (server component)
- `app/(admin)/dashboard/signup-chart.tsx` — Recharts bar chart (client component)
- `app/(admin)/users/page.tsx` — user management server component
- `app/(admin)/users/users-table.tsx` — user management client component (search, table, actions, pagination)
- `app/(admin)/audit-log/page.tsx` — audit log server component
- `app/(admin)/audit-log/audit-log-table.tsx` — audit log client component (filters, table, pagination)
- `app/api/admin/action/route.ts` — API route for suspend/unsuspend/extend_trial/change_role

**Architecture decisions**:

- Fresh build for Supabase cloud-first (NOT ported from embedded app's 52KB monolithic admin)
- RBAC via `users.role` column (owner/admin/member/viewer), NOT env var email list
- Server components for data fetching, client components for interactivity
- Admin mutations via `/api/admin/action` POST endpoint (used by users-table client component)
- Stripe MRR calculated server-side from active subscriptions (monthly + yearly/12)
- Signup trend: 30-day aggregation from `users.created_at`
- Audit log enriched with user emails via separate query (not join, for flexibility)
- All admin actions logged via `logAuthEvent('admin_action', ...)` with metadata

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all admin files (0 errors)

### Session 4 — Encryption Hardening (2026-03-03)

- [x] Verify `ENCRYPTION_KEY` mandatory in production (already enforced in `lib/env.ts` + `lib/encryption.ts`)
- [x] Add `ENCRYPTION_KEY_PREVIOUS` env var support for key rotation
- [x] Rewrite `lib/encryption.ts` with key rotation: encrypt with current key, decrypt tries all keys
- [x] Add `reEncrypt()` for migrating data from old keys to new key
- [x] Add `isEncryptionConfigured()` utility
- [x] Verify Plaid tokens already encrypted at rest (confirmed: `encrypt()` called before DB write, column is `NOT NULL`)
- [x] Write 22 encryption integration tests (roundtrip, rotation, production enforcement, tamper detection, error handling)

**Files created**:

- `lib/__tests__/encryption.test.ts` — 22 tests covering encrypt/decrypt roundtrip, key rotation, production enforcement, reEncrypt, tamper detection, error handling

**Files modified**:

- `lib/encryption.ts` — rewrote with key rotation support (`getAllKeys()`, `reEncrypt()`, `isEncryptionConfigured()`)
- `lib/env.ts` — added `ENCRYPTION_KEY_PREVIOUS` validation (comma-separated 64-char hex strings)

**Key rotation workflow**:

1. Generate new 64-char hex key
2. Set `ENCRYPTION_KEY_PREVIOUS` to old key(s), comma-separated
3. Set `ENCRYPTION_KEY` to new key
4. Deploy — new encryptions use new key, old data still decryptable
5. (Optional) Run `reEncrypt()` on stored data, then remove old keys

**Decisions**:

- Skipped 24-word recovery phrase (stretch goal) — not needed for production readiness
- Plaid token encryption was already enforced — no changes needed
- Key rotation uses try-all-keys approach: simple, no ciphertext versioning needed

**Verification**:

- [x] `vitest run` — 22 encryption tests pass
- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all modified files (0 errors)

### Session 5 — Multi-Currency Engine + USD Hardcode Elimination (2026-03-04)

- [x] Task 5.1: FX Rate Service — `lib/currency/fx-rates.ts` with `getRates()` + `convertAmount()`, Supabase cache (24h TTL), frankfurter.app API
- [x] Task 5.2: Fix all hardcoded USD defaults (7 files)
  - `server/schemas/budget.ts` — removed `.default("USD")` from createBudgetSchema
  - `app/api/budgets/route.ts` — inject user's `primary_currency` if not provided
  - `app/(app)/import/page.tsx` — default currency from user settings instead of hardcoded "USD"
  - `app/api/plaid/sync/route.ts` — use user's `primary_currency` for placeholder accounts
  - `integrations/plaid/index.ts` — accept `countryCodes` + `language` parameters
  - `app/api/plaid/link-token/route.ts` — derive Plaid country code from user locale
  - `components/ocr/ocr-dashboard.tsx` — use `getCurrencySymbol()` instead of hardcoded symbols
- [x] Task 5.3: Net Worth multi-currency aggregation
  - `app/(app)/net-worth/page.tsx` — collect unique currencies, fetch FX rates, convert to primary_currency
  - `components/net-worth/net-worth-dashboard.tsx` — show "(converted)" indicator + FX warning
- [x] Task 5.4: Calculator currency source fix — created `contexts/currency-context.tsx` with `CurrencyProvider` + `usePrimaryCurrency()`, updated all 13 calculator pages
- [x] Task 5.5: Updated `supabase/database.types.ts` with `fx_rates` table types

**Files created**:

- `lib/currency/fx-rates.ts`, `lib/currency/index.ts` — FX rate service
- `lib/currency/fx-rates.test.ts` — 9 tests
- `app/api/fx-rates/route.ts` — GET endpoint for client-side FX lookups
- `supabase/migrations/014_fx_rates_cache.sql` — fx_rates table
- `contexts/currency-context.tsx` — CurrencyProvider + usePrimaryCurrency hook

**Files modified** (22):

- `server/schemas/budget.ts`, `app/api/budgets/route.ts`, `app/(app)/import/page.tsx`
- `app/api/plaid/sync/route.ts`, `integrations/plaid/index.ts`, `app/api/plaid/link-token/route.ts`
- `components/ocr/ocr-dashboard.tsx`, `app/(app)/layout.tsx`
- `app/(app)/net-worth/page.tsx`, `components/net-worth/net-worth-dashboard.tsx`
- `supabase/database.types.ts`, `i18n/messages/en.json`
- 13 calculator pages (replaced `LOCALE_METADATA[locale].currency` with `usePrimaryCurrency()`)

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all new/modified files (0 errors, 2 pre-existing warnings)
- [x] `vitest run lib/currency/` — 9 tests pass

### Session 6 — i18n Completion (2026-03-04)

- [x] Task 6.1: Admin pages i18n — wrapped admin layout with I18nProvider, replaced all hardcoded English in 6 admin files
- [x] Task 6.2: Error pages + landing page i18n — error.tsx uses `useTranslations("errors")` with English fallback, landing page uses `getTranslations("landing")`, global-error.tsx kept English (catastrophic boundary) with cookie-based lang
- [x] Task 6.3: Fixed all bare locale formatting calls — 9 files total (users-table, audit-log-table, import/page, monte-carlo/page, landing page, sync-status, splits-dashboard, session-management)
- [x] Task 6.4: Dynamic `<html lang>` attribute — root layout reads locale from cookies, sets `lang` + `dir` for RTL; global-error.tsx reads lang from document cookie
- [x] Task 6.5: Calculator "Loading chart..." i18n — 9 calculator pages now use `tc("loadingChart")` via prop to ChartSkeleton
- [x] Task 6.6: Updated budget schema test to reflect removed USD default

**Files modified** (~18):

- `app/layout.tsx` — dynamic `<html lang>` + `dir`
- `app/page.tsx` — landing page i18n with `getTranslations("landing")`
- `app/error.tsx` — `useTranslations("errors")` with fallback
- `app/global-error.tsx` — cookie-based lang detection + comment
- `app/(admin)/layout.tsx` — I18nProvider wrapping + nav i18n
- `app/(admin)/dashboard/page.tsx` — `getTranslations("admin.dashboard")`
- `app/(admin)/users/page.tsx` — `getTranslations("admin.users")`
- `app/(admin)/users/users-table.tsx` — `useTranslations("admin.users")` + `useLocale()`
- `app/(admin)/audit-log/page.tsx` — `getTranslations("admin.auditLog")`
- `app/(admin)/audit-log/audit-log-table.tsx` — `useTranslations("admin.auditLog")` + `useLocale()`
- `app/(app)/import/page.tsx` — `useLocale()` + `formatCurrency()`
- `app/(app)/calculators/monte-carlo/page.tsx` — `.toLocaleString(locale)`
- `components/bank-sync/sync-status.tsx` — `useLocale()`
- `components/splits/splits-dashboard.tsx` — `useLocale()`
- `components/settings/session-management.tsx` — `useLocale()`
- 9 calculator pages — ChartSkeleton i18n
- `i18n/messages/en.json` — added ~80 keys: `admin.*`, `errors.*`, `landing.*`, `common.loadingChart`
- `server/schemas/budget.test.ts` — updated test for removed USD default

**New i18n keys** (~80):

- `common.loadingChart` (1 key)
- `admin.*` (~50 keys: nav, dashboard, users, auditLog)
- `errors.*` (4 keys)
- `landing.*` (8 keys)
- `netWorth.converted`, `netWorth.fxWarning` (2 keys, from Session 5)

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all new/modified files (0 errors)
- [x] `vitest run` — 362 tests pass (37 files)
- [x] `grep 'toLocaleDateString()' app/ components/ --include='*.tsx'` → 0 hits
- [x] `grep '"Loading chart' app/ --include='*.tsx'` → 0 hits
- [x] `grep 'toLocaleString()' app/ components/ --include='*.tsx'` → 0 hits

## Next Session: S7 — OAuth & Social Login

**Tasks**:

- [ ] Google OAuth integration
- [ ] GitHub OAuth integration

## Blockers

- None
