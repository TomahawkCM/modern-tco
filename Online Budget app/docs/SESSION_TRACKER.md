# Session Tracker

## Current State

- **Current Sprint**: Sprint 6 — Phase 1 Completion
- **Current Session**: S10 — Safe-to-Spend + Budget Methodology (COMPLETE)
- **Last Updated**: 2026-03-05

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

### Session 7 — OAuth & Social Login (2026-03-04)

- [x] Google OAuth integration via Supabase Auth (`signInWithOAuth({ provider: "google" })`)
- [x] GitHub OAuth integration via Supabase Auth (`signInWithOAuth({ provider: "github" })`)
- [x] Login page UI: social login buttons (Google + GitHub) with branded SVG icons, "Or continue with email" divider
- [x] Audit logging: callback route logs OAuth `login_success`/`login_failure` with `provider` metadata
- [x] i18n: all login page strings use `getTranslations("auth")`, added 11 `auth.*` keys to en.json
- [x] Login page fully i18n'd (was previously hardcoded English)

**Files created**: (none — all changes in existing files)

**Files modified**:

- `app/(auth)/actions.ts` — added `signInWithGoogle()`, `signInWithGitHub()` server actions
- `app/(auth)/callback/route.ts` — added audit logging with `provider` from `app_metadata`
- `app/(auth)/login/page.tsx` — social login buttons, divider, full i18n with `getTranslations("auth")`
- `server/audit-log.ts` — added `oauth_login` to `AuditAction` union type
- `i18n/messages/en.json` — added `auth.*` namespace (11 keys: login, loginDescription, continueWithGoogle, continueWithGithub, orContinueWithEmail, email, password, forgotPassword, noAccount, signUp, callbackFailed)

**Architecture decisions**:

- OAuth uses Supabase PKCE flow (`signInWithOAuth` → redirect → `/callback` → `exchangeCodeForSession`)
- Login page remains a server component — social buttons use `formAction` with server actions (no client JS needed)
- `NEXT_PUBLIC_SITE_URL` env var used for OAuth redirect URL (falls back to `http://localhost:3000`)
- Provider detection in callback via `data.user.app_metadata.provider` (set by Supabase automatically)

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all modified files (0 errors)

### Session 8 — Passkey Authentication / WebAuthn (2026-03-05)

- [x] Install `@simplewebauthn/server@13.2.3` + `@simplewebauthn/browser@13.2.2`
- [x] Create Supabase migration `015_user_passkeys.sql` (credential_id, public_key, counter, transports, device_name, user_id, created_at) with RLS
- [x] Create `/api/auth/passkey/register-options` route (generateRegistrationOptions, challenge cookie)
- [x] Create `/api/auth/passkey/register-verify` route (verifyRegistrationResponse, store credential)
- [x] Create `/api/auth/passkey/login-options` route (generateAuthenticationOptions, discoverable credentials)
- [x] Create `/api/auth/passkey/login-verify` route (verifyAuthenticationResponse, counter update, magic link session)
- [x] Add `PasskeyManagement` component to settings page (list/register/delete passkeys)
- [x] Add `PasskeyLoginButton` client component to login page (fingerprint icon, alongside Google/GitHub/email)
- [x] Audit logging: `passkey_registered` + `passkey_deleted` types, login events logged with `provider: "passkey"`
- [x] i18n: 13 keys — `auth.signInWithPasskey`, `settings.passkeys.*` (title, description, addPasskey, registering, deviceNamePlaceholder, registerSuccess, alreadyRegistered, cancelled, addedOn, remove)

**Files created**:

- `supabase/migrations/015_user_passkeys.sql` — user_passkeys table with RLS policies
- `lib/passkey/config.ts` — RP config (rpName, getRpID, getOrigin)
- `app/api/auth/passkey/register-options/route.ts` — registration options endpoint
- `app/api/auth/passkey/register-verify/route.ts` — registration verification endpoint
- `app/api/auth/passkey/login-options/route.ts` — authentication options endpoint
- `app/api/auth/passkey/login-verify/route.ts` — authentication verification + session creation
- `components/settings/passkey-management.tsx` — passkey CRUD in settings
- `components/auth/passkey-login-button.tsx` — passkey login button for login page

**Files modified**:

- `app/(auth)/login/page.tsx` — added PasskeyLoginButton
- `app/(app)/settings/page.tsx` — added PasskeyManagement component
- `server/audit-log.ts` — added `passkey_registered`, `passkey_deleted` to AuditAction
- `supabase/database.types.ts` — added `user_passkeys` table types
- `i18n/messages/en.json` — added 13 passkey i18n keys
- `package.json` + `package-lock.json` — SimpleWebAuthn dependencies

**Architecture decisions**:

- Passkeys use discoverable credential flow (resident keys required) for true passwordless login
- Challenge stored in httpOnly cookie (5-min TTL) — no server-side session storage needed
- Session creation via Supabase `admin.generateLink({ type: "magiclink" })` → client-side `verifyOtp({ token_hash })` — creates a real Supabase session
- Counter updated after each login to prevent replay attacks
- RLS on user_passkeys: users can select/insert/delete their own, admin client bypasses for login verification

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all new/modified files (0 errors)
- [x] `vitest run` — 362 tests pass (37 files)

### Session 9 — Accessibility Hardening + Plan Document Cleanup (2026-03-05)

- [x] Skip navigation link — `<a href="#main-content">` with sr-only/focus:not-sr-only (WCAG 2.4.1)
- [x] Main content landmark — `<main id="main-content">` added to app layout
- [x] ARIA labels on icon-only buttons — fixed chat send button + paycheck remove button
- [x] `aria-label` on `<nav>` elements — admin nav, sidebar, mobile nav (3 elements)
- [x] `role="alert"` on auth error messages — login, reset-password, forgot-password, verify-email, passkey-management (5 files)
- [x] `role="status"` on success messages — passkey-management
- [x] Focus indicators verified — shadcn/ui Button already has `focus-visible:ring-[3px]` on all variants
- [x] Archived 10 stale/superseded plan documents to `Plans/archived/` and `Online Budget app/docs/archived/`

**Files modified**:

- `app/(app)/layout.tsx` — skip nav link + `id="main-content"` on `<main>`
- `app/(admin)/layout.tsx` — `aria-label="Admin navigation"` on `<nav>`
- `app/(auth)/login/page.tsx` — `role="alert"` on error message
- `app/(auth)/reset-password/page.tsx` — `role="alert"` on error message
- `app/(auth)/forgot-password/page.tsx` — `role="alert"` on error message
- `app/(auth)/verify-email/page.tsx` — `role="alert"` on error message
- `components/chat/chat-panel.tsx` — `aria-label="Send message"` on send button
- `components/planning/paycheck-planner.tsx` — `aria-label` on remove allocation button
- `components/settings/passkey-management.tsx` — `role="alert"` + `role="status"` on messages
- `components/layout/app-sidebar.tsx` — `aria-label="Main navigation"` on `<nav>`
- `components/layout/mobile-nav.tsx` — `aria-label="Mobile navigation"` on `<nav>`
- `i18n/messages/en.json` — added `allocations.remove` key

**Plan documents archived** (10):

- `Plans/archived/`: BUDGET_APP_AUTHORITATIVE_PLAN, CLAUDE_CODE_EXECUTION_PLAN, BUDGET_APP_ONLINE_VERSION_PLAN_UPDATED, BUDGET_APP_COMPLETE_IMPLEMENTATION_PLAN, BUDGET_APP_UI_UX_PLAN_2026, UI_UX_CROSS_PLATFORM_ADDENDUM, BUDGET_APP_EXPANSION_SECTIONS
- `Online Budget app/docs/archived/`: ONLINE-BUDGET-APP-MASTER-PLAN, V1-ONLINE-PLAN-AND-MILESTONES, FIRST-5-CODING-SESSIONS-PLAN

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all modified files (0 errors)
- [x] `vitest run` — 362 tests pass (37 files)

### Session 10 — Safe-to-Spend + Budget Methodology (2026-03-05)

- [x] Safe-to-Spend engine — `engine/budgeting/safe-to-spend.ts` with `computeSafeToSpend()` (monthly + daily amounts, overspent detection)
- [x] Safe-to-Spend dashboard widget — `components/dashboard/safe-to-spend-card.tsx` (daily/monthly display, overspent warning)
- [x] Dashboard integration — safe-to-spend section between health score and alerts
- [x] Budget methodology engine — `engine/budgeting/methodology.ts` with `computeFiftyThirtyTwenty()`, `computePayYourselfFirst()`, `computeZeroBasedStatus()`
- [x] Budget methodology selector — `components/budgets/methodology-selector.tsx` (4 methods: Envelope, Zero-Based, 50/30/20, Pay-Yourself-First)
- [x] Migration `016_budget_methodology.sql` — `budget_methodology` column on `user_settings`
- [x] Updated `database.types.ts`, `server/settings.ts`, `server/schemas/settings.ts` for methodology support
- [x] i18n: 16 new keys — `dashboard.safeToSpend.*` (4), `dashboard.sections.safeToSpend` (1), `budgets.methodology.*` (11)
- [x] Gap analysis updated: Safe-to-Spend → DONE, Budget methodology → DONE

**Files created**:

- `engine/budgeting/safe-to-spend.ts` — safe-to-spend computation
- `engine/budgeting/safe-to-spend.test.ts` — 5 tests
- `engine/budgeting/methodology.ts` — budget methodology allocation engine
- `engine/budgeting/methodology.test.ts` — 10 tests
- `components/dashboard/safe-to-spend-card.tsx` — dashboard widget
- `components/budgets/methodology-selector.tsx` — methodology picker UI
- `supabase/migrations/016_budget_methodology.sql` — schema migration

**Files modified**:

- `engine/budgeting/index.ts` — re-exports for safe-to-spend + methodology
- `engine/index.ts` — re-exports for safe-to-spend + methodology
- `app/(app)/dashboard/page.tsx` — safe-to-spend computation + widget
- `app/(app)/budgets/page.tsx` — methodology selector + settings integration
- `server/settings.ts` — budget_methodology field
- `server/schemas/settings.ts` — budget_methodology Zod validation
- `supabase/database.types.ts` — budget_methodology column type
- `i18n/messages/en.json` — 16 new keys
- `docs/BUDGET_APP_GAP_ANALYSIS_2026-03-03.md` — S10 marked done

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all new/modified files (0 errors)
- [x] `vitest run` — 377 tests pass (39 files, +15 new tests)

### Session 11 — OCR Pipeline Internationalization (2026-03-04)

- [x] Remove ASCII whitelist from Tesseract config (pdf-ocr-parser.ts) — was stripping all non-Latin characters
- [x] Wire `language` parameter into `extractBankStatementData()` (bank-statement-ocr.ts) — replaces hardcoded "eng"
- [x] Wire `language` parameter into `extractReceiptData()` (receipt-ocr.ts) — replaces hardcoded "eng" in 2 locations
- [x] Replace English-only date parsing in bank-statement-ocr.ts with `intl-date-parser` (supports 30+ languages)
- [x] Replace English-only amount parsing in bank-statement-ocr.ts with `intl-amount-parser` (supports all number formats)
- [x] Replace English-only date parsing in receipt-ocr.ts with `intl-date-parser`
- [x] Replace English-only amount parsing in receipt-ocr.ts with `intl-amount-parser`
- [x] Wire locale through import page → OCR functions via `getOCRLanguage(locale)`
- [x] Write 41 new tests: intl-amount-parser (17), intl-date-parser (12), tesseract-lang-map (12)

**Files modified**:

- `src/lib/parsers/pdf-ocr-parser.ts` — removed `tessedit_char_whitelist`
- `src/lib/bank-statement-ocr.ts` — added `language` param, replaced `extractDateFromLine` and `extractAmountFromLine` with intl parsers, removed `getMonthNumber`
- `src/lib/receipt-ocr.ts` — added `language` param to 3 functions, replaced `extractAmount` and `extractDate` with intl parsers, removed `getMonthNumber`
- `src/app/budget-app/import/page.tsx` — added `useLocale()`, passes `getOCRLanguage(locale)` to OCR

**Files created**:

- `src/lib/parsers/__tests__/intl-amount-parser.test.ts` — 17 tests
- `src/lib/parsers/__tests__/intl-date-parser.test.ts` — 12 tests
- `src/lib/parsers/__tests__/tesseract-lang-map.test.ts` — 12 tests
- `docs/plans/2026-03-04-s11-ocr-internationalization.md` — session plan

**Architecture decisions**:

- Existing i18n parsers (`intl-amount-parser.ts`, `intl-date-parser.ts`, `tesseract-lang-map.ts`) were already built but not wired into OCR pipeline — this session integrated them
- Receipt total label patterns expanded to include international labels (SUMA, MONTANT, BETRAG, TOTALE, GESAMT)
- Bank statement amount parsing now splits on column whitespace and tries each segment with intl parser (preserves rightmost-amount heuristic)

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all new/modified files (0 errors)
- [x] `vitest run` — 1454 tests pass (86 files, +41 new tests)

### Session 12 — PDF Text Extraction Integration + Parser Tests (2026-03-04)

- [x] Write 18 tests for transaction-normalizer (normalize descriptions, dates, amounts, currency detection, sorting, parseRawTransaction)
- [x] Write 4 tests for pdf-text-extractor (module exports, error handling in non-browser env)
- [x] Integrate text extraction detection into import page (pdfHasText check before OCR)
- [x] Import page shows whether PDF has text layer or requires OCR scan

**Files created**:

- `src/lib/parsers/__tests__/transaction-normalizer.test.ts` — 18 tests
- `src/lib/parsers/__tests__/pdf-text-extractor.test.ts` — 4 tests
- `docs/plans/2026-03-04-s12-pdf-text-extraction.md` — session plan

**Files modified**:

- `src/app/budget-app/import/page.tsx` — added pdfHasText() check before OCR, shows text layer vs OCR status

**Architecture decisions**:

- Text extraction detection added as foundation — full text-to-parse pipeline (bypassing OCR entirely) deferred to when bank-statement parser is refactored to accept pre-extracted text
- pdf-text-extractor and transaction-normalizer were already complete — only needed tests
- Column keywords in pdf-bank-parser.ts already support 20+ languages — no changes needed

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all new/modified files (0 errors)
- [x] `vitest run` — 1476 tests pass (88 files, +22 new tests)

### Session 13 — Format Parser Integration (QIF, MT940, CAMT.053) (2026-03-05)

- [x] Write 15 tests for QIF parser (parsing, format detection, account type extraction)
- [x] Write 4 tests for MT940 parser (format detection)
- [x] Write 15 tests for CAMT.053 parser (parsing, debit/credit, dates, descriptions, currency, fitid, format detection)
- [x] Wire QIF processing into import page (dynamic import, locale-aware)
- [x] Wire MT940 processing into import page (async parsing)
- [x] Wire CAMT.053 processing into import page
- [x] Update error message to list all supported formats

**Files created**:

- `src/lib/parsers/__tests__/qif-parser.test.ts` — 15 tests
- `src/lib/parsers/__tests__/mt940-parser.test.ts` — 4 tests
- `src/lib/parsers/__tests__/camt053-parser.test.ts` — 15 tests
- `docs/plans/2026-03-05-s13-format-parser-integration.md` — session plan

**Files modified**:

- `src/app/budget-app/import/page.tsx` — added QIF, MT940, CAMT.053 processing blocks in format dispatch

**Architecture decisions**:

- QIF, MT940, CAMT.053 parsers were already complete — only needed tests and import page wiring
- Format detector already detects all 3 formats — no changes needed
- All parsers loaded via dynamic `import()` to keep initial bundle small
- MT940 uses mt940-js library with manual fallback parser

**Verification**:

- [x] `tsc --noEmit` passes (0 errors)
- [x] `eslint` passes on all new/modified files (0 errors)
- [x] `vitest run` — 1510 tests pass (91 files, +34 new tests)

## Next Session: S14

**Tasks**: Import Pipeline Phase 4 — UI Redesign (format selection, language override, smart PDF flow)

## Blockers

- None
