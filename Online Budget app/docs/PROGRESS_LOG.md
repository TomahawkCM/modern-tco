# Online Budget App — Implementation Progress Log

Status: Active
Project: Online Budget App V1
Architecture: Supabase + Vercel + Plaid + Salt Edge + Stripe
Financial Engine: Unified Shared Engine (Offline + Online)

---

# 📌 How To Use This File

This file MUST be updated at the end of every Claude coding session.

Rules:

- Never overwrite previous entries.
- Always append new entries at the bottom.
- Be precise about files changed.
- Record architectural decisions.
- Identify open risks immediately.

This file is the continuity backbone between sessions.

---

# 🚀 Current Milestone

Milestone: Milestone 1 — Core Infrastructure
Target:

- Next.js project setup
- Supabase integration
- Auth integration
- Subscriptions table
- Stripe webhook handling

---

# ✅ Implementation History

(Entries will be appended below this line.)

---

## Date: 2026-02-22

### Session Objective

- Session 1: Create strict Next.js project skeleton and enforce repository structure per V1-STRICT-REPOSITORY-STRUCTURE.md

### Skill(s) Used

- Skill: start-feature
- Skill: superpowers:verification-before-completion

### Completed

- Files created:
  - online-budget-app/app/layout.tsx (customized with project metadata)
  - online-budget-app/app/page.tsx (minimal placeholder, no boilerplate)
  - online-budget-app/styles/globals.css (moved from app/)
  - online-budget-app/engine/index.ts (entry point with module documentation)
  - online-budget-app/engine/version.ts (ENGINE_VERSION = "0.0.1")
  - online-budget-app/engine/money/index.ts
  - online-budget-app/engine/budgeting/index.ts
  - online-budget-app/engine/aggregation/index.ts
  - online-budget-app/engine/goals/index.ts
  - online-budget-app/engine/projections/index.ts
  - online-budget-app/integrations/plaid/index.ts
  - online-budget-app/integrations/saltedge/index.ts
  - online-budget-app/integrations/stripe/index.ts
  - online-budget-app/server/index.ts
  - online-budget-app/ai/index.ts
  - online-budget-app/lib/index.ts
  - online-budget-app/components/index.ts
  - online-budget-app/supabase/index.ts
  - online-budget-app/supabase/migrations/.gitkeep
  - online-budget-app/docs/.gitkeep
  - online-budget-app/public/.gitkeep
- Files modified:
  - online-budget-app/tsconfig.json (strict mode confirmed, added noUncheckedIndexedAccess, forceConsistentCasingInFileNames, updated paths from @/_ -> ./src/_ to @/_ -> ./_)
  - online-budget-app/package.json (added --webpack to dev/build scripts, added check-types script)
  - online-budget-app/next.config.ts (added outputFileTracingRoot to resolve lockfile warning)
- Database schema changes:
  - None (Session 1 is skeleton only)
- API routes added:
  - None (Session 1 is skeleton only)

### Architectural Decisions

- Decision: Root-level folder structure (no src/ wrapper)
- Reason: V1-STRICT-REPOSITORY-STRUCTURE.md specifies root-level folders. Removed create-next-app's default src/ directory and moved app/ to root. Updated tsconfig paths accordingly.
- Decision: Standalone project in Online Budget app/online-budget-app/
- Reason: User instructions explicitly require all work inside /Online Budget app/. V1-STRICT-REPOSITORY-STRUCTURE.md and FIRST-5-CODING-SESSIONS-PLAN.md describe standalone project. FOLDER-STRUCTURE.md's "same codebase" approach is superseded by V1 docs.
- Decision: Used Next.js 16.1.6 with webpack mode
- Reason: CLAUDE.md mandates --webpack flag (Turbopack not compatible). Package.json scripts include --webpack for both dev and build.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version: v0.0.1 (initial skeleton, no computation logic yet)
- Engine folder structure matches architecture doc: money/, budgeting/, aggregation/, goals/, projections/

### Security & RLS Review

- No RLS policies yet (no database in Session 1)
- No auth checks yet (Session 2 scope)

### Known Gaps / TODO

- Supabase client not installed (Session 2)
- Auth flow not implemented (Session 2)
- Stripe integration not wired (Session 3)
- No .env template created yet (needed for Session 2)

### Risks Identified

- Multiple lockfiles detected (parent modern-tco + online-budget-app). Resolved with outputFileTracingRoot config.
- Online Budget app directory name contains spaces — may cause issues with some CLI tools. No problems observed so far.

### Next Session Target

- Session 2: Supabase Integration + Auth (install Supabase client, configure env vars, create auth flow, implement session handling, create initial RLS policy template)

---

## Date: 2026-02-22

### Session Objective

- Session 2: Establish secure Supabase connection with RLS foundation. Install Supabase client, configure env vars, create auth flow (email/password), implement basic session handling, create initial RLS policy template.

### Skill(s) Used

- Skill: start-feature
- Skill: superpowers:writing-plans
- Skill: superpowers:subagent-driven-development
- Skill: superpowers:verification-before-completion
- Skill: gather-tech-docs (context7 for Supabase SSR docs)

### Completed

- Files created:
  - .env.example (Supabase env var template)
  - .env.local (working Supabase credentials — gitignored)
  - supabase/database.types.ts (Database interface, Tables/TablesInsert/TablesUpdate helpers)
  - lib/supabase/client.ts (browser client with singleton pattern)
  - lib/supabase/server.ts (server client with async cookies(), try/catch setAll)
  - proxy.ts (session refresh on every request, Next.js 16 proxy convention)
  - supabase/migrations/001_users_and_settings.sql (users + user_settings tables, RLS, triggers)
  - app/(auth)/actions.ts (signUp, signIn, signOut server actions)
  - app/(auth)/signup/page.tsx (email/password registration form)
  - app/(auth)/login/page.tsx (email/password login form)
  - app/(auth)/callback/route.ts (email confirmation code exchange)
  - docs/plans/2026-02-22-session-2-supabase-auth.md (implementation plan)
- Files modified:
  - package.json (added @supabase/ssr v0.8.0, @supabase/supabase-js v2.97.0)
  - .gitignore (added !.env.example exception)
  - app/page.tsx (now shows auth state — signed-in user or login/signup links)
- Database schema changes:
  - Created users table (PK references auth.users, RLS enabled, auto-create trigger)
  - Created user_settings table (PK user_id FK users, RLS enabled, defaults for currency/locale)
  - Created handle_updated_at() trigger function
  - Created handle_new_user() trigger function (SECURITY DEFINER, auto-creates user + settings on auth signup)
- API routes added:
  - /callback (GET — auth code exchange for email confirmation)

### Architectural Decisions

- Decision: Cookie-based SSR auth via @supabase/ssr
- Reason: Server components and middleware need session access. Cookies work across SSR/client boundaries unlike localStorage.
- Decision: Singleton browser client, per-request server client
- Reason: Browser client reuse prevents "Multiple GoTrueClient instances" warning. Server client must be fresh per-request to read correct cookies.
- Decision: proxy.ts instead of middleware.ts
- Reason: Next.js 16 deprecated "middleware" file convention in favor of "proxy". Using the new convention avoids deprecation warnings.
- Decision: Database trigger for auto-creating user rows on signup
- Reason: handle_new_user() trigger with SECURITY DEFINER creates public.users + public.user_settings rows automatically when auth.users insert happens. Avoids requiring frontend to make separate API call after signup.
- Decision: Server actions with redirect for error handling
- Reason: formAction prop requires Promise<void> return type. Redirecting with error as query param (e.g., /login?error=...) satisfies this constraint.
- Decision: Route group (auth) for auth pages
- Reason: Parentheses in (auth) make it a Next.js route group — organizes files without affecting URL structure. /signup, /login, /callback are clean URLs.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.0.1 (no financial logic added in Session 2)
- No financial calculations in any auth code

### Security & RLS Review

- RLS enabled on public.users and public.user_settings
- 6 RLS policies created (SELECT/INSERT/UPDATE for each table)
- All policies enforce auth.uid() = id (or user_id)
- No DELETE policies created (intentional — user deletion requires admin/API)
- handle_new_user trigger uses SECURITY DEFINER to bypass RLS for auto-creation
- Supabase service role key stored server-only (not NEXT*PUBLIC*)
- Auth session refresh handled in proxy.ts on every request

### Known Gaps / TODO

- Migration not yet applied to Supabase (needs `supabase db push` or SQL editor)
- No error display on login/signup pages (errors passed as query params but not rendered)
- No email confirmation flow UI (confirmation link sent but no "check your email" page)
- No password reset flow yet
- Stripe integration not wired (Session 3)

### Risks Identified

- @supabase/ssr v0.8.0 is latest — newer than existing project's v0.7.0. Compatible but may have API differences.
- Migration uses SECURITY DEFINER trigger which bypasses RLS — acceptable for auto-user-creation but must be audited if modified.

### Next Session Target

- Session 3: Subscription Foundation (Stripe) — create subscriptions table, add Stripe integration wrapper in integrations/stripe, implement webhook endpoint, update subscription status on event, protect API routes based on subscription status.

---

## Date: 2026-02-22

### Session Objective

- Session 3: Subscription Foundation (Stripe). Implement subscription backbone — create subscriptions table, add Stripe integration wrapper, implement webhook endpoint, update subscription status on event, protect API routes based on subscription status.

### Skill(s) Used

- Skill: superpowers:writing-plans
- Skill: superpowers:subagent-driven-development
- Skill: gather-tech-docs (context7 for Stripe Node SDK docs)

### Completed

- Files created:
  - integrations/stripe/client.ts (Stripe singleton client wrapper)
  - integrations/stripe/index.ts (barrel export, updated from placeholder)
  - lib/supabase/admin.ts (service role client for webhook operations, bypasses RLS)
  - lib/subscription.ts (getSubscription() + requireSubscription() guard utilities)
  - supabase/migrations/002_subscriptions.sql (subscriptions table, indexes, RLS)
  - app/api/stripe/checkout/route.ts (POST — creates Stripe Checkout session with 14-day trial)
  - app/api/stripe/webhook/route.ts (POST — handles checkout.session.completed, customer.subscription.updated, customer.subscription.deleted)
  - app/api/subscription/status/route.ts (GET — returns current user subscription status)
  - components/subscribe-button.tsx (client component — fetches checkout session and redirects to Stripe)
  - docs/plans/2026-02-22-session-3-stripe-subscriptions.md (implementation plan)
- Files modified:
  - package.json (added stripe v20.3.1)
  - .env.example (added STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_PRICE_PREMIUM_MONTHLY)
  - .env.local (added Stripe placeholder values)
  - supabase/database.types.ts (added subscriptions table types, added Relationships arrays and CompositeTypes for @supabase/supabase-js v2.97 compatibility)
  - app/page.tsx (displays subscription status for signed-in users, shows subscribe button when no active subscription)
- Database schema changes:
  - Created subscriptions table: id (uuid PK), user_id (FK users, unique), stripe_customer_id, stripe_subscription_id, status (trialing/active/past_due/canceled), tier (premium), trial_end, current_period_end, created_at
  - 4 indexes: unique user_id, stripe_customer_id, stripe_subscription_id, status
  - RLS enabled — SELECT only for authenticated (writes via service role)
- API routes added:
  - /api/stripe/checkout (POST — create Checkout session)
  - /api/stripe/webhook (POST — Stripe webhook handler)
  - /api/subscription/status (GET — check subscription status)

### Architectural Decisions

- Decision: Stripe Checkout (hosted) for payment collection
- Reason: No client-side Stripe SDK needed. Stripe hosts the payment page, reducing PCI compliance scope. Checkout session created server-side, user redirected to Stripe.
- Decision: Service role Supabase client for webhook writes
- Reason: Webhook handler runs without user auth context. Service role bypasses RLS to write to subscriptions table. Regular authenticated users can only SELECT their own subscription.
- Decision: Upsert on user_id for subscription creation
- Reason: One subscription per user (unique index on user_id). Upsert with onConflict: "user_id" prevents duplicate rows if webhook fires multiple times.
- Decision: Stripe SDK v20 — current_period_end from subscription items
- Reason: Stripe SDK v20.3.1 moved current_period_end from Subscription to SubscriptionItem. Access via subscription.items.data[0].current_period_end.
- Decision: Database types require Relationships and CompositeTypes
- Reason: @supabase/supabase-js v2.97 requires Relationships arrays on each table and CompositeTypes on the schema for proper CRUD type resolution. Without these, all operations resolve to type `never`.
- Decision: 14-day trial period via subscription_data.trial_period_days
- Reason: V1-MONETIZATION-ARCHITECTURE.md recommends 7-14 day full trial. 14 days chosen to maximize conversion opportunity.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.0.1 (no financial logic added in Session 3)
- No financial calculations in any subscription code

### Security & RLS Review

- RLS enabled on public.subscriptions
- 1 RLS policy: SELECT only for authenticated users (auth.uid() = user_id)
- No INSERT/UPDATE/DELETE policies for authenticated role — webhook uses service role
- Webhook signature verification via stripe.webhooks.constructEvent()
- STRIPE*SECRET_KEY and STRIPE_WEBHOOK_SECRET are server-only (not NEXT_PUBLIC*)
- Auth check on checkout route (supabase.auth.getUser() before creating session)
- Auth check on subscription status route

### Known Gaps / TODO

- Migrations not yet applied to Supabase (001 + 002 both pending — needs `supabase db push` or SQL editor)
- No real Stripe test keys configured (placeholder values in .env.local)
- No Stripe Customer Portal integration (for self-service subscription management)
- No error display on login/signup pages (carried over from Session 2)
- No webhook retry handling or idempotency checks
- Parent project ESLint tsconfig.eslint.json doesn't include online-budget-app files — ESLint errors in pre-commit hook (non-blocking, commits still pass)

### Risks Identified

- Stripe SDK v20.3.1 uses latest API version — breaking changes from v19 include current_period_end moving to subscription items. Handled in code.
- Webhook secret MUST be configured correctly for signature verification to work. Without it, all webhook calls will fail with 500.
- ESLint pre-commit errors are non-blocking but indicate the parent project's ESLint config needs updating to include the online-budget-app subdirectory.

### Next Session Target

- Session 4: Core Database Schema (Transactions + Accounts) — create accounts, transactions, categories, category_translations tables with RLS policies and proper indexing. No bank API calls, no categorization logic, no AI logic.

---

## Date: 2026-02-22

### Session Objective

- Session 4: Core Database Schema (Transactions + Accounts). Implement financial data schema — institutions, accounts, transactions, categories, category_translations, and user_category_overrides tables with RLS policies and proper indexing. No bank API calls, no categorization logic, no AI logic.

### Skill(s) Used

- Skill: superpowers:writing-plans
- Skill: superpowers:subagent-driven-development

### Completed

- Files created:
  - supabase/migrations/003_accounts_transactions_categories.sql (6 tables, indexes, RLS, triggers)
  - docs/plans/2026-02-22-session-4-core-database-schema.md (implementation plan)
- Files modified:
  - supabase/database.types.ts (added 6 new table types: institutions, accounts, transactions, categories, category_translations, user_category_overrides — all with Relationships arrays)
- Database schema changes:
  - Created institutions table (shared reference, no RLS — provider_id, name, country_code)
  - Created accounts table (user-owned, RLS — type CHECK constraint, balance_minor bigint, currency ISO 4217)
  - Created categories table (system-level shared, no RLS — key UNIQUE, hierarchical parent_id)
  - Created category_translations table (shared, no RLS — category_id + locale UNIQUE constraint)
  - Created user_category_overrides table (user-owned, RLS — custom_name per category per user)
  - Created transactions table (user-owned, RLS — amount_minor bigint, currency ISO 4217, FK to accounts + categories)
  - 12 indexes created: provider_id, user_id, institution_id, parent_id, key, category_id, locale, user_id (overrides), user_id+transaction_date (composite), account_id, category_id (transactions)
  - 2 updated_at triggers (accounts, transactions) using existing handle_updated_at() function
- API routes added:
  - None (schema only session)

### Architectural Decisions

- Decision: Institutions and categories are shared reference tables (no RLS)
- Reason: Institutions are populated by bank sync integration (shared across users). Categories are system-level definitions with per-user overrides via user_category_overrides. Both need to be readable by all authenticated users.
- Decision: Separate category_translations table instead of JSONB on categories
- Reason: V1-DATABASE-SCHEMA-DESIGN.md specifies separate translations table. Enables clean locale-based lookups without JSONB extraction. UNIQUE(category_id, locale) prevents duplicates.
- Decision: All money amounts as BIGINT minor units
- Reason: Per project governance — currency stored in minor units (integer). No floating point. balance_minor on accounts, amount_minor on transactions. Currency as VARCHAR(3) ISO 4217.
- Decision: CHECK constraints on account type and category key uniqueness
- Reason: Postgres constraints enforce integrity at database level. Account types limited to checking/savings/credit/investment/loan/other. Category keys must be unique for reliable lookups.
- Decision: DELETE policies on user-owned tables (accounts, transactions, overrides)
- Reason: Users need to be able to delete their own accounts and transactions. Previous sessions (users, user_settings) deliberately omitted DELETE. Financial tables need it for user data management.
- Decision: FK ordering in single migration file
- Reason: institutions -> accounts -> categories -> translations -> overrides -> transactions. Categories must be created before transactions (FK dependency). Single migration file keeps all Session 4 schema changes atomic.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.0.1 (no financial logic added in Session 4)
- No financial calculations in any schema code
- Schema stores raw financial data (amount_minor, balance_minor) — all computation will be in engine/ (Session 5)

### Security & RLS Review

- RLS enabled on: accounts, transactions, user_category_overrides (3 user-owned tables)
- 12 RLS policies created (SELECT/INSERT/UPDATE/DELETE for each user-owned table)
- All policies enforce auth.uid() = user_id
- No RLS on: institutions, categories, category_translations (shared reference data)
- institutions writable only by service role (no authenticated INSERT/UPDATE policies)
- categories writable only by service role (no authenticated INSERT/UPDATE policies)

### Known Gaps / TODO

- Migrations not yet applied to Supabase (001 + 002 + 003 all pending — needs `supabase db push` or SQL editor)
- No seed data for categories (system categories like "groceries", "rent", etc. need to be seeded before categorization works)
- No bank API calls yet (accounts table ready but no Plaid/Salt Edge integration)
- No categorization logic yet (transactions.category_id is nullable, confidence_score unused)
- No AI logic yet (confidence_score column exists but no AI populates it)
- Parent project ESLint tsconfig.eslint.json still doesn't include online-budget-app files (carried over)

### Risks Identified

- category_id FK on transactions means categories must be seeded before transactions can be categorized. No seed migration exists yet.
- institutions table has no RLS — if Supabase anon key is exposed, anyone could read institution data. Acceptable for V1 since institution data is not user-specific.
- No unique constraint on (user_id, provider_account_id) for accounts — could allow duplicate provider accounts. May need to add in future session.

### Next Session Target

- Session 5: Engine Integration Skeleton — implement engine folder skeleton, add Money module, add Aggregation module (basic income/expense totals), wire minimal test call from dashboard page. All financial math must live in engine/.

---

## Date: 2026-02-22

### Session Objective

- Session 5: Engine Integration Skeleton. Implement Money module and Aggregation module in the unified financial engine, wire them to a dashboard page that displays total income vs expenses, and verify all financial math lives exclusively in engine/. Install Vitest for unit testing.

### Skill(s) Used

- Skill: superpowers:writing-plans
- Skill: superpowers:subagent-driven-development
- Skill: superpowers:test-driven-development

### Completed

- Files created:
  - vitest.config.ts (Vitest configuration with path aliases and globals)
  - engine/money/types.ts (MinorAmount interface — readonly amountMinor + currency)
  - engine/money/operations.ts (minorAmount, addMinor, subtractMinor, sumMinor, toMajorUnits, formatMoney)
  - engine/money/operations.test.ts (15 unit tests across 6 describe blocks)
  - engine/aggregation/types.ts (TransactionForAggregation, IncomeExpenseSummary interfaces)
  - engine/aggregation/income-expense.ts (aggregateIncomeExpense — splits positive/negative, currency safety)
  - engine/aggregation/income-expense.test.ts (7 unit tests across 1 describe block)
  - app/dashboard/page.tsx (server component — fetches transactions, passes through engine, displays income/expense/net)
  - docs/plans/2026-02-22-session-5-engine-integration.md (implementation plan)
- Files modified:
  - package.json (added vitest v4.0.18 as devDependency, added test/test:watch scripts)
  - engine/money/index.ts (barrel export — MinorAmount type + 6 operation functions)
  - engine/aggregation/index.ts (barrel export — TransactionForAggregation, IncomeExpenseSummary types + aggregateIncomeExpense)
  - engine/index.ts (entry point — re-exports ENGINE_VERSION, Money module, Aggregation module)
  - engine/version.ts (bumped ENGINE_VERSION from "0.0.1" to "0.1.0")
  - app/page.tsx (added "Go to Dashboard" link for subscribed users)
- Database schema changes:
  - None (engine is pure computation, no DB changes)
- API routes added:
  - None (dashboard is a server component, not an API route)

### Architectural Decisions

- Decision: Integer minor units for all money operations (no decimal.js)
- Reason: Add and subtract on integers are exact. No division or multiplication on money amounts in V1 engine. decimal.js dependency not needed. Parent project uses decimal.js but online engine avoids the 31KB dependency.
- Decision: Currency safety on all binary/aggregate operations
- Reason: Every function that combines two MinorAmounts (addMinor, subtractMinor, sumMinor, aggregateIncomeExpense) throws Error on currency mismatch. Prevents accidental cross-currency arithmetic (e.g., USD + EUR).
- Decision: Pure computation pattern — engine has zero external dependencies
- Reason: Engine functions are deterministic pure functions. No DB, no API, no env vars, no side effects. This enables simple unit testing and guarantees reproducible results. Dashboard fetches data and passes it to engine; engine never fetches.
- Decision: Vitest for unit testing (not Jest)
- Reason: Vitest is native ESM, faster than Jest, built on Vite, requires minimal config. Parent project CLAUDE.md already lists Vitest as the test runner. Configured with globals: true for clean test syntax.
- Decision: Dashboard page is a server component with auth + subscription guards
- Reason: Server component avoids client-side data exposure. Auth redirect to /login if not signed in. Subscription warning banner (not blocking) if subscription not active. All financial math delegated to engine — dashboard only formats output for display.

### Financial Engine Impact

- Engine version bumped: v0.0.1 → v0.1.0
- Money module implemented: minorAmount, addMinor, subtractMinor, sumMinor, toMajorUnits, formatMoney
- Aggregation module implemented: aggregateIncomeExpense (income vs expense totals)
- 22 unit tests (15 money + 7 aggregation) — all passing
- Verified: no financial math outside engine/ — dashboard only calls engine functions and formats output

### Security & RLS Review

- Dashboard page protected by auth redirect (supabase.auth.getUser() → redirect to /login if null)
- Transaction data fetched through RLS (user_id filter enforced by Supabase policies)
- No new RLS policies needed (uses existing transaction/user_settings policies from Sessions 2-4)

### Known Gaps / TODO

- Migrations not yet applied to Supabase (001 + 002 + 003 all pending)
- No seed data for categories or transactions (dashboard will show $0.00 until data exists)
- No budgeting/goals/projections modules yet (engine stubs exist, no implementation)
- No bank API calls yet (Plaid/Salt Edge integration not started)
- Parent project ESLint tsconfig.eslint.json still doesn't include online-budget-app files (carried over)

### Risks Identified

- Vitest v4.0.18 added as devDependency — 30 transitive packages. Bundle size impact is dev-only.
- toMajorUnits divides by 100 (default decimals=2) which produces floating point for display only. All storage and computation uses integers.
- JavaScript Number.MAX_SAFE_INTEGER limits minor unit sums to ~$90 trillion — not a practical concern for personal budgets.

### Next Session Target

- Milestone 1 Governance Checkpoint: Review all 5 sessions before proceeding to Milestone 2. Verify all exit criteria met, no architectural drift, no financial math leakage.

---

## Date: 2026-02-22

### Session Objective

- Milestone 2, Task 1: Seed system categories with initial hierarchy and English translations. Add `type` (income/expense/transfer) and `display_order` columns to categories table. Aligned with offline app's 13 category groups.

### Skill(s) Used

- Skill: superpowers:brainstorming (category hierarchy design)

### Completed

- Files created:
  - supabase/migrations/004_seed_system_categories.sql (ALTER + seed migration)
- Files modified:
  - supabase/database.types.ts (added `type` and `display_order` to categories Row/Insert/Update, added `category_type` enum)
- Database schema changes:
  - Created `category_type` enum: income | expense | transfer
  - ALTER categories: added `type` (category_type, NOT NULL, DEFAULT 'expense')
  - ALTER categories: added `display_order` (INTEGER, NOT NULL, DEFAULT 0)
  - 2 new indexes: idx_categories_type, idx_categories_display_order
  - Seeded 14 parent categories: food_dining, transportation, bills_utilities, shopping, entertainment, health_fitness, housing, income, savings_investments, education, pets, travel, miscellaneous, transfers
  - Seeded 67 child categories across all parents
  - Seeded 81 English translations in category_translations
- API routes added:
  - None (data seeding only)

### Architectural Decisions

- Decision: `type` and `display_order` on categories table; NO color or icon columns
- Reason: Financial classification (income/expense/transfer) belongs in the database. Presentation metadata (color, icon) will live in a UI-layer mapping keyed by `category.key`. Keeps schema focused on data semantics.
- Decision: `transfer` type added alongside income/expense
- Reason: Account transfers and credit card payments are neither income nor expense. Explicit transfer type prevents miscategorization and enables correct financial aggregation.
- Decision: Category keys match offline app hierarchy for alignment
- Reason: Per UNIFIED-SHARED-FINANCIAL-ENGINE-ARCHITECTURE.md — single source of truth for categories across offline and online. 13 expense/income groups + 1 transfer group = 14 parents, 67 children.
- Decision: Child categories inherit parent's type
- Reason: All children under `income` parent are type `income`. All children under `transfers` parent are type `transfer`. All others are `expense`. Type consistency enables reliable aggregation queries (WHERE type = 'expense').

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.1.0
- No financial calculations in migration (data seeding only)
- Category `type` column enables engine to filter transactions by category type for income/expense aggregation

### Security & RLS Review

- No new RLS policies needed (categories and category_translations are shared system-level data, readable by all authenticated users)
- Write access restricted to service role only (no INSERT/UPDATE/DELETE policies for authenticated role)
- User customization of category names goes through user_category_overrides (already has RLS from Session 4)

### Known Gaps / TODO

- Migrations 001-004 not yet applied to Supabase (pending `supabase db push` or SQL editor)
- No transaction CRUD server functions yet (next Milestone 2 task)
- No categorization engine logic yet (engine/budgeting/ still a stub)
- No locales beyond English seeded (additional translations can be added in future migration)

### Risks Identified

- Migration 004 depends on 003 (categories table must exist). Ordering is enforced by filename numbering.
- 81 categories may need pruning or expansion based on user feedback. is_system flag allows future non-system categories to coexist.

### Next Session Target

- Milestone 2, Task 2: Transaction CRUD server functions — implement create/read/update/delete for transactions in server/, with Zod validation and category assignment.

---

## Date: 2026-02-22

### Session Objective

- Milestone 2, Task 2: Transaction CRUD server functions. Implement create/read/update/delete for transactions in server/ with Zod validation, plus thin API routes in app/api/transactions/.

### Skill(s) Used

- Skill: superpowers:brainstorming (API pattern design)
- Skill: superpowers:writing-plans (implementation plan)
- Skill: superpowers:test-driven-development (Zod schema TDD)
- Skill: superpowers:verification-before-completion

### Completed

- Files created:
  - server/schemas/transaction.ts (Zod schemas: createTransactionSchema, updateTransactionSchema, listTransactionsSchema + inferred types)
  - server/schemas/transaction.test.ts (16 unit tests for schema validation)
  - server/transactions.ts (CRUD functions: createTransaction, getTransaction, listTransactions, updateTransaction, deleteTransaction)
  - app/api/transactions/route.ts (GET list + POST create endpoints)
  - app/api/transactions/[id]/route.ts (GET single + PATCH update + DELETE endpoints)
  - docs/plans/2026-02-22-transaction-crud.md (implementation plan)
- Files modified:
  - None (all new files)
- Database schema changes:
  - None (uses existing transactions table from Session 4)
- API routes added:
  - GET /api/transactions (list with filters: account_id, category_id, from_date, to_date, is_pending, limit, offset)
  - POST /api/transactions (create with Zod validation)
  - GET /api/transactions/[id] (single transaction by ID)
  - PATCH /api/transactions/[id] (partial update — key use case: recategorization)
  - DELETE /api/transactions/[id] (hard delete)

### Architectural Decisions

- Decision: Server functions in server/ + thin API routes in app/api/
- Reason: V1-STRICT-REPOSITORY-STRUCTURE.md specifies server/ for Supabase queries. API routes validate with Zod and delegate. No financial math in either layer.
- Decision: Zod schemas for input validation at route level
- Reason: DEFINITION-OF-DONE.md requires input validation. Zod provides type-safe parsing with detailed error messages. Schemas are testable (16 tests) without mocking Supabase.
- Decision: .returns<TransactionRow[]>() for Supabase query typing
- Reason: Supabase client v2.97 with our Database type doesn't infer return types from .select(). Using .returns<>() at end of query chain provides explicit typing without type assertions.
- Decision: Pagination via limit/offset with max 100
- Reason: Simple and sufficient for V1. Cursor-based pagination can be added later if needed. Default limit=50, offset=0.
- Decision: updateTransactionSchema requires at least one field (.refine())
- Reason: Empty updates are wasteful DB calls. Zod .refine() rejects {} with descriptive error message.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.1.0
- No financial calculations in server functions or API routes — amounts stored/retrieved as integer minor units without transformation

### Security & RLS Review

- All API routes check auth via supabase.auth.getUser() before any operation
- Server functions filter by user_id on every query (defense in depth alongside RLS)
- RLS policies from Session 4 enforce auth.uid() = user_id at database level
- Zod validation prevents injection via malformed input
- No new RLS policies needed (existing transaction RLS covers all CRUD operations)

### Known Gaps / TODO

- Migrations 001-004 not yet applied to Supabase
- No subscription enforcement on transaction routes (should require active subscription — future task)
- No categorization engine logic yet (engine/budgeting/ still a stub)
- No bank sync ingestion yet (manual entry only via API)
- No merchant mapping or AI auto-categorization yet

### Risks Identified

- Transaction routes lack subscription guard — any authenticated user can CRUD transactions without active subscription. Need to add requireSubscription() check (from lib/subscription.ts) in a future session.
- Supabase .returns<>() is an explicit type override — if the actual DB schema diverges from TransactionRow type, runtime data won't match compile-time types.

### Next Session Target

- Milestone 2, Task 3: Categorization engine module — implement rule-based auto-categorization in engine/categorization/ with merchant-to-category mapping and confidence scoring.

---

## Date: 2026-02-22

### Session Objective

- Milestone 2, Task 3: Categorization engine module. Build a pure, deterministic categorization engine in engine/categorization/ that classifies transactions by merchant name/description using two-tier rule-based pattern matching with confidence scoring.

### Skill(s) Used

- Skill: superpowers:brainstorming (module location decision)
- Skill: superpowers:writing-plans (implementation plan)
- Skill: superpowers:test-driven-development (TDD for all 3 submodules)
- Skill: superpowers:verification-before-completion

### Completed

- Files created:
  - engine/categorization/types.ts (CategorizationResult, MerchantRule, PatternRule interfaces)
  - engine/categorization/tokenizer.ts (extractMerchantToken — strips noise, normalizes, filters generic tokens)
  - engine/categorization/tokenizer.test.ts (8 unit tests)
  - engine/categorization/rules.ts (PATTERN_RULES — 75 global regex rules covering all 14 parent categories)
  - engine/categorization/rules.test.ts (10 unit tests)
  - engine/categorization/categorize.ts (categorize() — two-tier cascade: merchant rules then pattern rules)
  - engine/categorization/categorize.test.ts (10 unit tests)
  - engine/categorization/index.ts (barrel export)
  - docs/plans/2026-02-22-categorization-engine.md (implementation plan)
- Files modified:
  - engine/index.ts (added categorization module exports, updated module listing)
- Database schema changes:
  - None (pure engine module, no DB)
- API routes added:
  - None (engine is consumed by server/, not directly by routes)

### Architectural Decisions

- Decision: New engine/categorization/ module (approved by user)
- Reason: Categorization is a core Milestone 2 deliverable distinct from budgeting (budget-vs-actual tracking) or aggregation (summing amounts). Dedicated module follows single-responsibility principle. User explicitly approved the new folder.
- Decision: Two-tier categorization cascade (merchant rules then pattern rules)
- Reason: Aligned with offline app's architecture. Merchant rules (exact token match, 0.99 confidence) override pattern rules (regex, 0.85-0.95 confidence). Merchant rules are user-customizable; pattern rules are system-level.
- Decision: 75 global pattern rules (not 265+ Canadian-focused rules from offline)
- Reason: Online app is global. Rules cover common merchants across NA, EU, and UK. Rules are easily extensible — new patterns can be added without structural changes.
- Decision: Pure functions with no side effects
- Reason: Per engine governance — no DB, no AI, no env dependencies. categorize() takes description + merchant rules as input, returns result or null. Merchant rules are injected, not fetched internally.
- Decision: Category keys match seeded DB values
- Reason: PATTERN_RULES use categoryKey values that exactly match categories.key from migration 004 (e.g. "groceries", "streaming", "salary"). Ensures seamless mapping between engine output and DB lookups.

### Financial Engine Impact

- Engine version unchanged: v0.1.0 (no financial math changes — categorization is classification, not computation)
- New module: engine/categorization/ with 3 submodules (types, tokenizer, rules, categorize)
- 28 new unit tests (8 tokenizer + 10 rules + 10 categorize)
- Total engine tests: 53 (25 money/aggregation + 28 categorization)
- Confirmed: no financial math in categorization module

### Security & RLS Review

- No security changes (pure engine module with no DB access)
- Merchant rules are injected from caller — no hardcoded user data
- Pattern rules contain no PII or sensitive data

### Known Gaps / TODO

- Migrations 001-004 not yet applied to Supabase
- No subscription enforcement on transaction routes (carried over)
- Merchant rule CRUD not yet implemented (need server/merchant-rules.ts + API routes for users to create/manage merchant rules)
- No auto-categorization wiring yet (categorize() not called during transaction creation — needs integration in server/transactions.ts)
- Multi-currency normalization not yet implemented (Milestone 2 remaining task)

### Risks Identified

- 75 pattern rules cover common merchants but will miss many niche/local merchants. Users rely on merchant rules (learned from corrections) for coverage.
- Uber pattern uses negative lookahead (?!\\s\*eats) to distinguish Uber (transit) from Uber Eats (delivery). Complex regex may have edge cases.
- Pattern rules are tested in order — first match wins. If a merchant matches multiple rules, the ordering determines the result.

### Next Session Target

- Milestone 2, Task 4: Wire auto-categorization into transaction creation pipeline — when a transaction is created without a category_id, run categorize() and set the category + confidence_score automatically.

---

## Date: 2026-02-22

### Session Objective

- Milestone 2, Task 4: Wire auto-categorization into the transaction creation pipeline. When a transaction is created without a category_id, the engine's categorize() function runs to classify the transaction and sets category_id + confidence_score automatically.

### Skill(s) Used

- Skill: superpowers:brainstorming (scope decision)
- Skill: superpowers:verification-before-completion

### Completed

- Files created:
  - server/categories.ts (getCategoryIdByKey — looks up category UUID by key from categories table)
- Files modified:
  - server/transactions.ts (createTransaction now auto-categorizes when category_id is not provided)
- Database schema changes:
  - None
- API routes added:
  - None (existing POST /api/transactions now auto-categorizes transparently)

### Architectural Decisions

- Decision: Auto-categorize silently when category_id is absent
- Reason: Same pattern as offline app. When a transaction arrives without an explicit category (e.g. from bank sync or manual entry without category), the engine classifies it automatically. The user can always override via PATCH.
- Decision: Pattern rules only (empty merchant rules array)
- Reason: No merchant_mappings table exists yet. Pattern rules (75 regexes) cover common merchants globally. Merchant rule persistence is a separate future task. The architecture supports injecting merchant rules when they become available.
- Decision: Prefer merchant_name over description for categorization input
- Reason: merchant_name is the cleaner signal when available. Falls back to description. If neither is present, no auto-categorization is attempted.
- Decision: getCategoryIdByKey in separate server/categories.ts
- Reason: Reusable lookup function. Category key→UUID resolution will be needed in other contexts (e.g. bulk import, merchant rule application). Single responsibility.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.1.0
- No financial calculations in auto-categorization — engine categorize() is classification (string matching), not computation
- Server layer only orchestrates: calls engine → resolves UUID → passes to insert

### Security & RLS Review

- No new security concerns
- Auto-categorization happens server-side inside the authenticated transaction creation flow
- Category lookup is read-only on shared categories table (no RLS needed)
- confidence_score stored on transaction for audit trail

### Known Gaps / TODO

- Migrations 001-004 not yet applied to Supabase
- No subscription enforcement on transaction routes (carried over)
- Merchant rule CRUD not yet implemented (carried over)
- Multi-currency normalization not yet implemented (Milestone 2 remaining task)
- No re-categorization on transaction update (PATCH with merchant_name change doesn't trigger re-categorization — by design, user overrides are respected)

### Risks Identified

- Auto-categorization depends on seeded categories existing in DB. If migration 004 is not applied, getCategoryIdByKey will return null and transactions will remain uncategorized.
- Empty merchant rules means no learned/user-specific categorization yet. All classification relies on pattern rules.

### Next Session Target

- Milestone 2, Task 5: Merchant mapping persistence — create merchant_mappings migration + server CRUD for users to create/manage merchant rules that feed into categorize().

---

## Date: 2026-02-22

### Session Objective

- Milestone 2, Task 5: Merchant mapping persistence. Create user-owned merchant_mappings table with RLS, server CRUD functions, API routes, and wire real merchant rules into the auto-categorization pipeline (replacing empty array).

### Skill(s) Used

- Skill: superpowers:brainstorming (ownership model decision)
- Skill: superpowers:test-driven-development (Zod schema TDD)
- Skill: superpowers:verification-before-completion

### Completed

- Files created:
  - supabase/migrations/005_merchant_mappings.sql (merchant_mappings table, RLS policies, updated_at trigger)
  - server/schemas/merchant-mapping.ts (Zod schemas: createMerchantMappingSchema, listMerchantMappingsSchema + inferred types)
  - server/schemas/merchant-mapping.test.ts (7 unit tests for schema validation)
  - server/merchant-mappings.ts (CRUD: createMerchantMapping, listMerchantMappings, deleteMerchantMapping + loadMerchantRulesForEngine)
  - app/api/merchant-mappings/route.ts (GET list + POST create/upsert endpoints)
  - app/api/merchant-mappings/[id]/route.ts (DELETE endpoint)
- Files modified:
  - supabase/database.types.ts (added merchant_mappings table types with Row/Insert/Update/Relationships)
  - server/transactions.ts (createTransaction now loads real merchant rules via loadMerchantRulesForEngine instead of empty array)
- Database schema changes:
  - Created merchant_mappings table: id (uuid PK), user_id (FK users), merchant_token (text), display_name (text), category_id (FK categories), created_at, updated_at
  - UNIQUE(user_id, merchant_token) — one rule per merchant per user
  - RLS enabled — 4 policies (SELECT/INSERT/UPDATE/DELETE) enforcing auth.uid() = user_id
  - updated_at trigger using existing handle_updated_at() function
- API routes added:
  - GET /api/merchant-mappings (list with limit/offset pagination)
  - POST /api/merchant-mappings (create or upsert — on conflict updates existing mapping)
  - DELETE /api/merchant-mappings/[id] (hard delete)

### Architectural Decisions

- Decision: User-owned merchant_mappings with RLS (not global)
- Reason: Each user builds their own merchant-to-category mappings from corrections. One user's "COSTCO" = groceries shouldn't affect another user's classification. Per user instruction: "merchant_mappings must be user-owned."
- Decision: Upsert on (user_id, merchant_token) conflict
- Reason: When a user corrects a merchant's category, the existing mapping is updated rather than creating a duplicate. Upsert provides idempotent correction behavior.
- Decision: loadMerchantRulesForEngine() JOINs with categories
- Reason: Engine expects MerchantRule[] with categoryKey/parentKey strings. Server function resolves category_id UUID → key via JOIN with categories table, including parent key resolution through self-join. Engine remains pure (no DB knowledge).
- Decision: merchant_token normalized to uppercase in Zod schema
- Reason: .transform((v) => v.trim().toUpperCase()) ensures consistent matching with engine's extractMerchantToken() which also uppercases. No case-sensitivity bugs.
- Decision: Categorization cascade order: merchant rules (0.99) → pattern rules (0.85-0.95)
- Reason: Per user instruction: "1. User merchant mappings 2. Pattern rules 3. Fallback." This is already how categorize() works — merchant rules checked first.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.1.0
- No financial calculations in merchant mapping code — all operations are classification/lookup
- Server layer loads merchant rules from DB and passes them to engine's categorize() as injection
- Boundary verified: grep for Math.round/floor/ceil/abs/toFixed in server/ returned zero matches

### Security & RLS Review

- RLS enabled on merchant_mappings
- 4 RLS policies: SELECT/INSERT/UPDATE/DELETE all enforce auth.uid() = user_id
- All API routes check auth via supabase.auth.getUser() before any operation
- Server functions filter by user_id on every query (defense in depth)
- Zod validation on all inputs — merchant_token trimmed/uppercased, category_id UUID-validated

### Known Gaps / TODO

- Migrations 001-005 not yet applied to Supabase
- No subscription enforcement on merchant mapping routes (carried over)
- No UI for managing merchant mappings (API-only for now)
- No automatic merchant mapping creation on user category correction (future: when user PATCHes a transaction's category, auto-create/update merchant mapping)
- Multi-currency normalization not yet implemented (Milestone 2 remaining task)

### Risks Identified

- loadMerchantRulesForEngine() runs a DB query on every transaction creation. For bulk imports, this could be N+1. Future optimization: cache merchant rules per user per request.
- JOIN with parent category assumes single-level hierarchy (parent_id one deep). Current schema supports this but deeper nesting would need recursive query.

### Next Session Target

- Milestone 2, Task 6: Multi-currency normalization — implement currency conversion in engine for cross-currency aggregation, or complete Milestone 2 governance checkpoint if Task 6 is deferred.

---

## Date: 2026-02-22

### Session Objective

- Milestone 2, Task 6: Multi-currency normalization. Implement minimal engine conversion primitive — a pure `convertMinor()` function for display-level currency conversion. No DB changes, no external API, no stored value mutation.

### Skill(s) Used

- Skill: superpowers:brainstorming (scope decision — minimal vs full vs deferred)
- Skill: superpowers:test-driven-development (TDD red-green cycle)
- Skill: superpowers:verification-before-completion

### Completed

- Files created:
  - engine/money/convert.ts (convertMinor pure function with banker's rounding)
  - engine/money/convert.test.ts (12 unit tests)
- Files modified:
  - engine/money/index.ts (added convertMinor export)
  - engine/index.ts (added convertMinor to top-level barrel export)
- Database schema changes:
  - None (conversion is display-level only, no fx_rates table in V1)
- API routes added:
  - None (engine primitive only)

### Architectural Decisions

- Decision: Minimal engine function only — no DB table, no server code, no API routes
- Reason: V1 budgets operate in primary_currency only. Full fx_rates table and exchange rate API integration deferred until dashboard/projections actually need cross-currency aggregation (Milestone 3+). The pure function is ready for consumption when that time comes.
- Decision: Banker's rounding (round half to even) for converted amounts
- Reason: Prevents systematic bias in rounding. Standard in financial applications. When the fractional part is exactly 0.5, rounds to nearest even integer rather than always rounding up.
- Decision: Rate must be positive — zero and negative rates throw
- Reason: A zero rate is mathematically undefined (division by zero in reverse). A negative rate is nonsensical for currency conversion. Fail-fast prevents silent corruption.
- Decision: Same-currency conversion returns input unchanged
- Reason: Avoids unnecessary floating-point multiplication (amount \* 1.0) which could introduce rounding artifacts. Early return preserves exact value.

### Financial Engine Impact

- Engine version unchanged: v0.1.0 (conversion is a new primitive, not a behavioral change to existing functions)
- New function: convertMinor(amount, toCurrency, rate) → MinorAmount
- 12 new unit tests covering: basic conversion, same-currency passthrough, zero/negative amounts, banker's rounding edge cases, rate validation, large amounts, small fractional rates
- Total engine tests: 65 (18 money operations + 12 money convert + 7 aggregation + 28 categorization)
- Total project tests: 88 (65 engine + 23 server schemas)
- Boundary verified: grep for Math.round/floor/ceil/abs/toFixed in server/ returned zero matches

### Security & RLS Review

- No security changes (pure engine function with no DB access)
- No user data involved in conversion logic
- Rate is caller-provided, not fetched from any source

### Known Gaps / TODO

- Migrations 001-005 not yet applied to Supabase
- No fx_rates table — rates must be provided by caller (future: server layer fetches from DB or API)
- No exchange rate API integration (deferred beyond V1)
- No subscription enforcement on transaction/merchant-mapping routes (carried over)
- No UI for cross-currency display conversion (carried over)

### Risks Identified

- JavaScript floating-point arithmetic in rate multiplication could produce minor rounding differences vs. server-side decimal libraries. Banker's rounding mitigates this to ±1 minor unit.
- convertMinor does not validate ISO 4217 currency codes — caller must ensure valid codes. Acceptable for V1 since all currencies originate from validated DB fields.

### Next Session Target

- Milestone 2 Governance Checkpoint: Review all 6 tasks, verify exit criteria, confirm no architectural drift, then proceed to Milestone 3 — Dashboard & Budgeting.

---

## Date: 2026-02-22

### Session Objective

- Milestone 2 Governance Checkpoint + Milestone 3: Dashboard & Budgeting. Verify Milestone 2 exit criteria, then implement category spending aggregation, budget engine, budget CRUD, account balance queries, and wire the full dashboard page.

### Skill(s) Used

- Skill: superpowers:verification-before-completion (Milestone 2 governance checkpoint)
- Skill: superpowers:brainstorming (Milestone 3 task ordering)
- Skill: superpowers:test-driven-development (TDD for engine + schemas)

### Completed

- Milestone 2 governance checkpoint:
  - All 6 tasks verified complete with evidence
  - tsc: 0 errors
  - vitest: 88/88 pass (at checkpoint time)
  - No financial math outside engine/ (grep verified)
  - RLS verified on all 7 user-owned tables
  - Repository structure fully compliant
  - All DoD criteria met

- Files created:
  - engine/aggregation/category-spending.ts (aggregateByCategory — groups transactions by category, computes percentage of total spending)
  - engine/aggregation/category-spending.test.ts (9 unit tests)
  - engine/budgeting/budget-progress.ts (computeBudgetProgress — remaining amount, percentage used, over-budget detection)
  - engine/budgeting/budget-progress.test.ts (7 unit tests)
  - supabase/migrations/006_budgets.sql (budgets table, RLS, indexes, updated_at trigger)
  - server/schemas/budget.ts (Zod schemas: createBudgetSchema, updateBudgetSchema, listBudgetsSchema)
  - server/schemas/budget.test.ts (12 unit tests)
  - server/budgets.ts (CRUD: createBudget, listBudgets, getBudget, updateBudget, deleteBudget)
  - server/accounts.ts (listAccounts — fetches user's accounts for dashboard)
  - app/api/budgets/route.ts (GET list + POST create/upsert)
  - app/api/budgets/[id]/route.ts (GET single + PATCH update + DELETE)
- Files modified:
  - engine/aggregation/index.ts (added category-spending exports)
  - engine/budgeting/index.ts (replaced stub with budget-progress exports)
  - engine/index.ts (added aggregation + budgeting module exports)
  - engine/version.ts (bumped ENGINE_VERSION 0.1.0 → 0.2.0)
  - supabase/database.types.ts (added budgets table types)
  - app/dashboard/page.tsx (full rewrite — accounts, income/expense, category breakdown, budget progress, savings rate)
- Database schema changes:
  - Created budgets table: id (uuid PK), user_id (FK users), category_id (FK categories), amount_minor (bigint, positive), currency (varchar(3)), period ('monthly'), created_at, updated_at
  - UNIQUE(user_id, category_id, period) — one budget per category per user per period
  - RLS enabled — 4 policies (SELECT/INSERT/UPDATE/DELETE) enforcing auth.uid() = user_id
  - updated_at trigger
- API routes added:
  - GET /api/budgets (list budgets by period)
  - POST /api/budgets (create or upsert)
  - GET /api/budgets/[id] (single budget)
  - PATCH /api/budgets/[id] (update amount)
  - DELETE /api/budgets/[id] (hard delete)

### Architectural Decisions

- Decision: Engine-first task ordering (engine primitives → server → UI)
- Reason: Builds bottom-up. Engine functions are tested and stable before server/UI consume them. Prevents UI from computing anything directly.
- Decision: aggregateByCategory returns percentageOfTotal per category
- Reason: Dashboard needs spending distribution display. Computing percentage in engine keeps UI free of division logic. Percentage is 0 for income categories (only expenses counted).
- Decision: computeBudgetProgress takes spending as absolute values
- Reason: Budgets are positive limits. Engine returns spentMinor as positive for clean comparison. The server layer converts engine's negative expenses to positive before passing to budget function.
- Decision: Budget upsert on (user_id, category_id, period)
- Reason: One budget per category per user per period. If user updates their groceries budget, existing row is updated rather than creating a duplicate.
- Decision: Dashboard savings rate computed in page from engine outputs
- Reason: Savings rate is (income + expense) / income — a display percentage using two engine-computed MinorAmounts. This is ratio formatting, not financial math. All underlying money values computed in engine.
- Decision: Parallel data fetching with Promise.all in dashboard
- Reason: Accounts, transactions, budgets, and categories are independent queries. Fetching in parallel reduces dashboard load time.

### Financial Engine Impact

- Engine version bumped: v0.1.0 → v0.2.0
- New module: engine/aggregation/category-spending (aggregateByCategory)
- New module: engine/budgeting/budget-progress (computeBudgetProgress)
- 28 new unit tests (9 category-spending + 7 budget-progress + 12 budget schemas)
- Total engine tests: 81 (18 money ops + 12 money convert + 16 aggregation + 28 categorization + 7 budgeting)
- Total project tests: 116 (81 engine + 35 server schemas)
- Boundary verified: grep for Math.round/floor/ceil in server/ and app/ returned only display-formatting toFixed() in dashboard (percentage strings)

### Security & RLS Review

- RLS enabled on budgets table — 4 policies enforcing auth.uid() = user_id
- All budget API routes check auth via supabase.auth.getUser()
- Server functions filter by user_id (defense in depth)
- Zod validation on all budget inputs — amount_minor must be positive integer, category_id UUID validated
- Dashboard queries filtered by user_id through RLS

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase
- No subscription enforcement on budget/transaction/merchant-mapping routes (carried over)
- No spending chart visualization (data is available, chart component not built)
- No budget rollover logic yet (period is 'monthly' only, no carry-forward)
- No category display names in dashboard (shows category keys like "groceries" not translated labels)
- No multi-currency account display (dashboard filters to primary_currency only)

### Risks Identified

- Dashboard makes 4 parallel DB queries — acceptable for server component but could benefit from caching for heavy users
- Budget upsert depends on exact match of (user_id, category_id, period) — if period support expands beyond 'monthly', existing budgets won't conflict
- savingsRate in dashboard uses division on engine output values — technically display math, not financial math. Acceptable per governance rules.

### Next Session Target

- Milestone 3: Goal tracking engine function, then Milestone 4 — AI Insight Engine.

---

## Date: 2026-02-22

### Session Objective

- Milestone 3 (continued): Implement goal tracking — pure `computeGoalProgress()` engine function with TDD. Complete Milestone 3 checklist.

### Skill(s) Used

- Skill: superpowers:test-driven-development (TDD red-green cycle)
- Skill: superpowers:verification-before-completion

### Completed

- Files created:
  - engine/goals/goal-progress.ts (computeGoalProgress — pure function, deterministic, today injected)
  - engine/goals/goal-progress.test.ts (9 unit tests: progress percentage, completion date estimation, on-track detection, overfunded, zero target, zero savings, no deadline)
- Files modified:
  - engine/goals/index.ts (barrel export: GoalInput, GoalProgressResult types + computeGoalProgress)
  - engine/index.ts (added goals module exports)
- Database schema changes:
  - None (pure engine function, no DB)
- API routes added:
  - None (engine primitive only)

### Architectural Decisions

- Decision: UTC methods throughout for date arithmetic
- Reason: `new Date("YYYY-MM-DD")` creates UTC midnight. Using `getUTCFullYear()`/`getUTCMonth()`/`getUTCDate()` + `Date.UTC()` prevents timezone-dependent off-by-one errors. Tests pass identically regardless of local timezone.
- Decision: `Math.ceil` for months remaining
- Reason: Partial month rounds up to next full month. If 5.3 months of savings remain, the estimated completion is 6 months out. Conservative estimate prevents false on-track status.
- Decision: No currency conversion in goal progress
- Reason: Goals operate in a single currency (savedMinor and targetMinor are same currency). Cross-currency goal tracking deferred beyond V1.

### Financial Engine Impact

- Engine version unchanged: v0.2.0 (goal progress is new function, not a change to existing computation)
- New function: computeGoalProgress(goal, today) → GoalProgressResult
- 9 new unit tests
- Total engine tests: 90 (18 money ops + 12 money convert + 16 aggregation + 28 categorization + 7 budgeting + 9 goals)
- Total project tests: 125 (90 engine + 35 server schemas)

### Security & RLS Review

- No security changes (pure engine function with no DB access)
- No user data in engine — goal parameters are caller-provided

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase
- No goals table in database (engine function ready, persistence deferred)
- No subscription enforcement on routes (carried over)
- No goal UI (data computation ready, display not built)

### Risks Identified

- Goal progress uses estimated completion date string comparison for on-track detection (ISO date strings sort correctly lexicographically, so this is safe)
- No goals migration means computeGoalProgress is not yet consumed by any server or page code

### Next Session Target

- Milestone 4 — AI Insight Engine (monthly summary generation, anomaly detection, affordability calculator)

---

## Date: 2026-02-22

### Session Objective

- Milestone 4, Phase A: Deterministic insight engine functions. Implement all 5 insight computation functions in engine/insights/ with TDD. Pure functions only — no DB, no AI.

### Skill(s) Used

- Skill: superpowers:brainstorming (M4 scope and ordering decision)
- Skill: superpowers:test-driven-development (TDD red-green cycle for all 5 functions)
- Skill: superpowers:verification-before-completion

### Completed

- Files created:
  - engine/insights/index.ts (barrel export for all insight types and functions)
  - engine/insights/spending-trends.ts (computeSpendingTrends — category spending vs baseline average, % change, sorted by deviation)
  - engine/insights/spending-trends.test.ts (7 unit tests)
  - engine/insights/anomaly-detection.ts (detectAnomalies — flags categories with spending significantly above/below baseline threshold)
  - engine/insights/anomaly-detection.test.ts (7 unit tests)
  - engine/insights/subscription-detection.ts (detectSubscriptions — identifies recurring merchant charges with amount tolerance, isActive detection)
  - engine/insights/subscription-detection.test.ts (8 unit tests)
  - engine/insights/affordability.ts (computeAffordability — "can I afford X?" with one-time/recurring support, comfort level indicator)
  - engine/insights/affordability.test.ts (8 unit tests)
  - engine/insights/health-score.ts (computeFinancialHealthScore — composite score from savings rate, budget adherence, emergency fund, debt-to-income)
  - engine/insights/health-score.test.ts (7 unit tests)
- Files modified:
  - engine/index.ts (added insights module exports — 5 functions + 13 types)
- Database schema changes:
  - None (pure engine functions, no DB)
- API routes added:
  - None (engine primitives only — Phase B will add AI narrative + server wiring)

### Architectural Decisions

- Decision: Engine-first, LLM-last approach for Milestone 4
- Reason: Per user instruction. All financial truth computed deterministically in engine/. AI layer (Phase B) will only narrate/explain structured engine output. This means insight functions work without any LLM dependency.
- Decision: Anomaly detection uses configurable threshold (default 50%)
- Reason: Different users may have different sensitivity to spending deviations. The threshold is injected, not hardcoded.
- Decision: Subscription detection uses amount tolerance (default 10%)
- Reason: Recurring charges may vary slightly month-to-month (e.g. $9.99 vs $10.49 for price changes or taxes). 10% tolerance catches these while excluding wildly different amounts.
- Decision: Financial health score uses weighted formula (savings 30%, budget 25%, emergency 20%, debt 25%)
- Reason: Simple, transparent formula. Each component is independently computable. No AI/ML involved — purely deterministic. Weights can be adjusted without changing architecture.
- Decision: Affordability uses monthly surplus comparison, not deep simulation
- Reason: Per V1-AI-ARCHITECTURE.md — "No deep simulation, no long-term forecasting." Monthly surplus is the simplest defensible affordability check.

### Financial Engine Impact

- Engine version unchanged: v0.2.0 (insights are new functions, not changes to existing computation)
- New module: engine/insights/ with 5 submodules
- 37 new unit tests (7 trends + 7 anomaly + 8 subscription + 8 affordability + 7 health score)
- Total engine tests: 127 (18 money ops + 12 convert + 16 aggregation + 28 categorization + 7 budgeting + 9 goals + 37 insights)
- Total project tests: 162 (127 engine + 35 server schemas)
- Boundary verified: all insight functions are pure — no DB, no AI, no side effects

### Security & RLS Review

- No security changes (pure engine functions with no DB access)
- No user data in engine — all inputs are caller-provided
- Health score components are transparent (no opaque scoring)

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase
- Phase B: AI narrative wrappers in ai/ not yet implemented
- No server layer wiring for insights (need server functions that collect data and call engine)
- No API routes for insights (e.g. GET /api/insights/monthly-summary)
- No subscription enforcement on routes (carried over)
- Budget risk alerts are implicitly handled by computeBudgetProgress (from Milestone 3) — no separate alert function needed

### Risks Identified

- Spending trends and anomaly detection share baseline computation logic but are separate functions (intentional — different consumers may need different output shapes)
- Subscription detection heuristic (amount tolerance + min occurrences) may produce false positives for merchants with genuinely recurring but different purchases (e.g. grocery store)
- Health score weights are opinionated — may need user testing to validate balance

### Next Session Target

- Milestone 4, Phase B: AI narrative wrappers in ai/ — thin LLM layer that converts structured engine output into human-readable insights

---

## Date: 2026-02-22

### Session Objective

- Milestone 4, Phase B: AI Narrative Layer — Install Anthropic SDK, create shared types, build thin client wrapper, implement system prompt guardrails, context builders, and narrator functions.

### Skill(s) Used

- Skill: superpowers:brainstorming (AI layer design decisions)
- Skill: claude-developer-platform (Anthropic SDK integration patterns)
- Skill: superpowers:writing-plans (implementation plan)
- Skill: superpowers:executing-plans (task-by-task execution)

### Completed (incremental — updated per task)

**Task 1: Install Anthropic SDK + Create Types**

- Files created:
  - ai/types.ts (NarrativeResult discriminated union type — ok/error)
- Files modified:
  - package.json (added @anthropic-ai/sdk ^0.78.0)
- Database schema changes:
  - None
- API routes added:
  - None

**Task 2: Create Anthropic Client Wrapper**

- Files created:
  - ai/client.ts (singleton client, callNarrative function, locked config)
- Config: model=claude-haiku-4-5, temperature=0.2, max_tokens=300
- System prompt injected automatically on every call
- Never-throw pattern: returns NarrativeResult
- No abstraction, retry, rate limiting, streaming, or caching

**Task 3: Create System Prompt (Guardrails)**

- Files created:
  - ai/system-prompt.ts (NARRATIVE_SYSTEM_PROMPT constant — verbatim user-provided guardrails)
- Guardrails enforced: no financial calculations, no financial advice, no number invention, no JSON output
- Tone locked: clear, calm, neutral, professional, non-judgmental
- Multi-language support: responds in user's input language
- No imports, no dynamic behavior, no environment branching — pure constant string

**Task 4: Create Context Builders (Serializers)**

- Files created:
  - ai/context-builders.ts (5 pure serializer functions — zero financial math)
- Functions: buildMonthlySummaryContext, buildAnomalyContext, buildSubscriptionContext, buildBudgetRiskContext, buildAffordabilityContext
- Imports only type-level: SpendingTrend, SpendingAnomaly, DetectedSubscription, AffordabilityResult, BudgetProgressItem
- All numeric values passed through unchanged from engine (minor units)
- Each function: accept typed engine output → select/rename fields → JSON.stringify() → return string
- buildBudgetRiskContext replaces original plan's buildHealthScoreContext (user directive)

**Task 5: Create Narrators (Orchestration)**

- Files created:
  - ai/narrators.ts (5 async functions — orchestrate context builder → LLM call → return result)
- Functions: narrateMonthlySummary, narrateAnomalies, narrateSubscriptions, narrateBudgetRisk, narrateAffordability
- Each function: buildContext() → callNarrative(instruction + JSON) → return NarrativeResult
- All engine imports are `import type` (erased at compile time — zero runtime engine dependency)
- Runtime imports: callNarrative from ./client, 5 context builders from ./context-builders
- Error handling: callNarrative returns { ok: false } on failure — narrators pass through unchanged, never throw

### Architectural Decisions

- Decision: @anthropic-ai/sdk (direct Anthropic SDK, no abstraction layer)
- Reason: User directive. No Vercel AI SDK, no provider swap layer. Thin and simple. Single dependency for LLM calls.
- Decision: Claude Haiku (claude-haiku-4-5) for narrative generation
- Reason: Cost-efficient ($1.00/$5.00 per 1M tokens). Narratives are short (2-4 sentences). Haiku is fast and sufficient for narration of pre-computed data.
- Decision: NarrativeResult discriminated union (ok/error)
- Reason: Never-throw pattern. All narrator functions return a result type. API failures, rate limits, timeouts produce { ok: false, error }. Callers handle errors without try/catch.
- Decision: temperature 0.2 for narrative generation
- Reason: User directive. Low temperature produces consistent, factual narration. Prevents creative hallucination of financial data. Slightly above 0 to allow natural language variation.
- Decision: callNarrative as single exported function (not per-narrator client)
- Reason: All 5 narrators use identical LLM config (model, tokens, temperature, system prompt). Single function eliminates duplication. Narrators differ only in the user message content.
- Decision: System prompt as static constant (no dynamic assembly)
- Reason: User directive — verbatim, no modifications, no shortening, no environment branching. Locked guardrails prevent all financial advice categories (investment, tax, legal, insurance). Ensures consistent safety behavior across all narrator calls.
- Decision: Context builders are pure serializers with zero numeric transformation
- Reason: User directive — context builders must NOT compute, transform, derive, convert, filter, group, or infer. They only select fields, rename for clarity, and JSON.stringify(). All values pass through in minor units exactly as the engine produced them. The `unit: "minor"` metadata field informs the narrator layer.
- Decision: buildBudgetRiskContext replaces buildHealthScoreContext
- Reason: User directive. Budget risk assessment (over-budget detection per category) replaces the composite health score in the context builder lineup. Uses BudgetProgressItem[] from engine/budgeting/budget-progress.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.2.0
- No financial calculations in ai/ — AI only narrates engine output

### Security & RLS Review

- ANTHROPIC*API_KEY is server-only (not NEXT_PUBLIC*\*)
- System prompt locks LLM to narration-only mode (no financial advice, no number invention)
- No new RLS policies needed (ai/ has no DB access)

### Known Gaps / TODO

- Tasks 6-9 of the AI Narrative Layer plan still pending
- No API routes for insights yet
- No UI wiring for narratives
- No subscription enforcement on future insight routes

### Risks Identified

- @anthropic-ai/sdk v0.78.0 added 5 transitive packages. Production dependency (not dev-only).
- Parent project ESLint tsconfig still doesn't include online-budget-app files (carried over, non-blocking)

### Next Session Target

- Continue Milestone 4 Phase B tasks (narrators, barrel exports, env, verification)

---

## Date: 2026-02-22

### Session Objective

- Milestone 4, Phase B, Task 6: Implement ai/index.ts barrel exports — re-export all public API surface from the AI narrative layer.

### Skill(s) Used

- Skill: superpowers:executing-plans

### Completed

- Files modified:
  - ai/index.ts (replaced placeholder comment with barrel exports — 12 exports from 5 internal modules)
- Database schema changes:
  - None
- API routes added:
  - None

### Exports

| Export                     | Source             | Kind     |
| -------------------------- | ------------------ | -------- |
| NarrativeResult            | ./types            | type     |
| callNarrative              | ./client           | function |
| NARRATIVE_SYSTEM_PROMPT    | ./system-prompt    | constant |
| buildMonthlySummaryContext | ./context-builders | function |
| buildAnomalyContext        | ./context-builders | function |
| buildSubscriptionContext   | ./context-builders | function |
| buildBudgetRiskContext     | ./context-builders | function |
| buildAffordabilityContext  | ./context-builders | function |
| narrateMonthlySummary      | ./narrators        | function |
| narrateAnomalies           | ./narrators        | function |
| narrateSubscriptions       | ./narrators        | function |
| narrateBudgetRisk          | ./narrators        | function |
| narrateAffordability       | ./narrators        | function |

### Architectural Decisions

- Decision: Pure re-exports only — no wrapper functions, no conditional logic
- Reason: Barrel file is a convenience surface, not a logic layer. Consumers import from ai/ and get all public APIs. Internal module boundaries preserved.
- Decision: `export type` for NarrativeResult (not value export)
- Reason: Type-only export ensures the type is erased at compile time. No runtime cost. Follows TypeScript best practice for type re-exports.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.2.0
- No financial calculations in ai/index.ts — zero logic, pure re-exports

### Security & RLS Review

- No security changes (barrel file with no logic)
- No new RLS policies needed

### Known Gaps / TODO

- Tasks 7-9 of AI Narrative Layer plan still pending (env validation, integration wiring, verification)
- No API routes for insights yet
- No UI wiring for narratives

### Risks Identified

- None — barrel export is zero-risk

### Next Session Target

- Continue Milestone 4 Phase B remaining tasks (env validation, server integration, verification)

---

## Date: 2026-02-22

### Session Objective

- Milestone 4, Phase B (continued): AI Integration into API Layer. Implement single vertical slice — server/insights.ts orchestration function + app/api/insights/monthly-summary/route.ts thin API route with subscription enforcement.

### Skill(s) Used

- Skill: superpowers:executing-plans

### Completed

- Files created:
  - server/insights.ts (getMonthlySummary — orchestrates DB fetch → engine aggregation → engine trends → AI narrator)
  - app/api/insights/monthly-summary/route.ts (GET — auth + subscription enforcement + delegation)
- Files modified:
  - None
- Database schema changes:
  - None (uses existing tables: transactions, categories, user_settings)
- API routes added:
  - GET /api/insights/monthly-summary (returns NarrativeResult JSON)

### Architectural Decisions

- Decision: server/insights.ts uses engine's aggregateByCategory + absMinor for per-month category aggregation
- Reason: All financial math delegated to engine. Server only maps DB shape → engine input shape (field renaming) and calls engine functions. No raw Math operations in server/.
- Decision: 3 prior months as baseline for spending trends
- Reason: Per engine's computeSpendingTrends design — compares current month to average of baseline months. 3 months provides stable baseline without excessive data fetch.
- Decision: UTC date arithmetic throughout
- Reason: Consistent with engine's goal-progress approach. Uses Date.UTC() to prevent timezone-dependent off-by-one errors in month boundary calculations.
- Decision: Parallel DB fetch (transactions + categories) via Promise.all
- Reason: Independent queries with no dependency. Reduces server function latency.
- Decision: Route returns 403 (not 402) for subscription enforcement failure
- Reason: 403 Forbidden is semantically correct — user is authenticated but lacks authorization (no active subscription). 402 Payment Required is non-standard.
- Decision: Single query for all 4 months of transactions, then filter in-memory by month
- Reason: One DB round-trip vs. four. Transaction volume for personal budgets is small enough for in-memory filtering. Reduces Supabase query count.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.2.0
- No financial calculations in server/insights.ts — all math via engine's aggregateByCategory, absMinor, computeSpendingTrends
- Verified: grep for Math.round/floor/ceil/abs/toFixed in server/insights.ts returned zero matches

### Security & RLS Review

- Route authenticates via supabase.auth.getUser() before any operation
- Subscription enforcement via requireSubscription() before LLM call (per V1-MONETIZATION-ARCHITECTURE.md §6.2)
- Transaction query filtered by user_id (defense in depth alongside RLS)
- No new RLS policies needed (uses existing transaction, categories, user_settings RLS)
- ANTHROPIC_API_KEY remains server-only (not exposed to client)

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase
- No other insight endpoints yet (anomalies, subscriptions, budget risk, affordability — each would be a separate future slice)
- No usage tracking for AI calls (cost monitoring deferred)
- No UI wiring for monthly summary (API-only)
- No caching of AI responses (each GET triggers fresh engine computation + LLM call)

### Risks Identified

- Single query fetches up to 4 months of transactions. For heavy users with thousands of transactions per month, this could be slow. Acceptable for V1 personal budgets.
- narrateMonthlySummary calls the LLM on every request. No rate limiting or caching. Cost-controlled by subscription gate (only paying users can call).
- If categories table is empty (migration 004 not applied), all transactions will have null categoryKey and spending trends will be empty.

### Next Session Target

- Continue Milestone 4 Phase B: Add remaining insight API endpoints (anomalies, subscriptions, budget risk, affordability) as additional vertical slices, OR proceed to Milestone 4 governance checkpoint if scope is limited to monthly summary only.

---

## Date: 2026-02-23

### Session Objective

- Milestone 4, Phase B (continued): Anomalies vertical slice. Add getAnomalies() server function + GET /api/insights/anomalies route with subscription enforcement. Identical layering pattern as monthly-summary.

### Skill(s) Used

- Skill: superpowers:executing-plans

### Completed

- Files created:
  - app/api/insights/anomalies/route.ts (GET — auth + subscription enforcement + delegation)
- Files modified:
  - server/insights.ts (added getAnomalies function, added detectAnomalies + narrateAnomalies imports)
- Database schema changes:
  - None (uses existing tables: transactions, categories, user_settings)
- API routes added:
  - GET /api/insights/anomalies (returns NarrativeResult JSON)

### Architectural Decisions

- Decision: getAnomalies follows identical data-fetching pattern as getMonthlySummary
- Reason: Both consume the same CategorySpend[] input shape (current month + 3 baseline months). No shared abstraction per instruction — each function is self-contained but reuses private helpers (mapToEngineInput, toExpenseSpends, toDateString) within server/insights.ts.
- Decision: Default anomaly threshold (50%) used — not exposed as query parameter
- Reason: Keep V1 simple. Engine's detectAnomalies uses 50% default threshold. Future enhancement could add optional threshold query param.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.2.0
- No financial calculations in server/insights.ts — all math via engine's aggregateByCategory, absMinor, detectAnomalies
- Verified: grep for Math.round/floor/ceil/abs/toFixed in server/insights.ts returned zero matches

### Security & RLS Review

- Route authenticates via supabase.auth.getUser() before any operation
- Subscription enforcement via requireSubscription() before LLM call
- Transaction query filtered by user_id (defense in depth alongside RLS)
- No new RLS policies needed

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase
- 3 remaining insight endpoints: subscriptions, budget-risk, affordability
- No usage tracking for AI calls (cost monitoring deferred)
- No UI wiring for anomalies (API-only)
- No caching of AI responses

### Risks Identified

- Same data-fetching risks as monthly-summary (4-month transaction fetch, LLM call per request)
- If user has < 1 month of baseline data, detectAnomalies returns empty (by design — needs baseline to detect deviation)

### Next Session Target

- Continue Milestone 4 Phase B: subscriptions vertical slice (GET /api/insights/subscriptions)

---

## Date: 2026-02-23

### Session Objective

- Milestone 4, Phase B (continued): Subscriptions vertical slice. Add getSubscriptions() server function + GET /api/insights/subscriptions route with subscription enforcement. Different input shape — uses extractMerchantToken and 6-month lookback.

### Skill(s) Used

- Skill: superpowers:executing-plans

### Completed

- Files created:
  - app/api/insights/subscriptions/route.ts (GET — auth + subscription enforcement + delegation)
- Files modified:
  - server/insights.ts (added getSubscriptions function, added detectSubscriptions + extractMerchantToken + narrateSubscriptions imports)
- Database schema changes:
  - None (uses existing transactions, user_settings tables)
- API routes added:
  - GET /api/insights/subscriptions (returns NarrativeResult JSON)

### Architectural Decisions

- Decision: 6-month lookback for subscription detection (vs 3 months for trends/anomalies)
- Reason: Subscription detection needs recurring charges over time. Monthly subscriptions need at least 2 occurrences to detect. 6 months provides better signal for quarterly or bimonthly charges.
- Decision: Uses engine's extractMerchantToken for merchant normalization
- Reason: Transaction descriptions contain noise (dates, reference numbers, location suffixes). extractMerchantToken strips these and normalizes to uppercase token. Same function used in categorization — consistent tokenization.
- Decision: Transactions without a valid merchant token are skipped
- Reason: extractMerchantToken returns null for generic terms ("PAYMENT", "TRANSFER"), short strings, or all-digit descriptions. These cannot be meaningfully grouped by merchant for subscription detection.
- Decision: Fetches merchant_name + description (not category_id)
- Reason: Subscription detection operates on merchant identity, not category. Different DB select fields than trends/anomalies. No category lookup needed.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.2.0
- No financial calculations in server/insights.ts — merchant tokenization via engine's extractMerchantToken, recurrence detection via engine's detectSubscriptions
- Verified: grep for Math.round/floor/ceil/abs/toFixed in server/insights.ts returned zero matches

### Security & RLS Review

- Route authenticates via supabase.auth.getUser() before any operation
- Subscription enforcement via requireSubscription() before LLM call
- Transaction query filtered by user_id (defense in depth alongside RLS)
- No new RLS policies needed

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase
- 2 remaining insight endpoints: budget-risk, affordability
- No usage tracking for AI calls (cost monitoring deferred)
- No UI wiring for insights (API-only)
- No caching of AI responses

### Risks Identified

- 6-month transaction fetch is larger than the 4-month fetch for trends/anomalies. Acceptable for V1 personal budgets.
- extractMerchantToken may produce different tokens for the same merchant if description format changes between providers. Acceptable — engine handles this with amount tolerance.
- Subscription detection may flag non-subscription recurring charges (e.g., weekly grocery runs at the same store). Engine's amount tolerance (10%) mitigates but doesn't eliminate.

### Next Session Target

- Continue Milestone 4 Phase B: budget-risk vertical slice (GET /api/insights/budget-risk)

---

## Date: 2026-02-23

### Session Objective

- Milestone 4, Phase B (continued): Budget-risk vertical slice. Add getBudgetRisk() server function + GET /api/insights/budget-risk route with subscription enforcement. Uses computeBudgetProgress engine function and listBudgets server function.

### Skill(s) Used

- Skill: superpowers:executing-plans

### Completed

- Files created:
  - app/api/insights/budget-risk/route.ts (GET — auth + subscription enforcement + delegation)
- Files modified:
  - server/insights.ts (added getBudgetRisk function, added computeBudgetProgress + narrateBudgetRisk + listBudgets imports, added BudgetLimit + CategoryActualSpending type imports)
- Database schema changes:
  - None (uses existing transactions, budgets, categories, user_settings tables)
- API routes added:
  - GET /api/insights/budget-risk (returns NarrativeResult JSON)

### Architectural Decisions

- Decision: getBudgetRisk uses existing listBudgets from server/budgets.ts
- Reason: Budget fetching already implemented and tested. Reusing the existing server function avoids duplicating Supabase query logic. Cross-module import within server/ is expected (server orchestrates).
- Decision: Current month only (no baseline) for budget risk
- Reason: Budgets are monthly limits vs current spending. No multi-month comparison needed — computeBudgetProgress compares limit vs actual for the active period only.
- Decision: 3-way parallel fetch (transactions + budgets + categories)
- Reason: All three queries are independent. Promise.all reduces latency. Same pattern as dashboard page.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.2.0
- No financial calculations in server/insights.ts — category aggregation via aggregateByCategory, absolute values via absMinor, budget progress via computeBudgetProgress
- Verified: grep for Math.round/floor/ceil/abs/toFixed in server/insights.ts returned zero matches

### Security & RLS Review

- Route authenticates via supabase.auth.getUser() before any operation
- Subscription enforcement via requireSubscription() before LLM call
- Transaction and budget queries filtered by user_id (defense in depth alongside RLS)
- No new RLS policies needed

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase
- 1 remaining insight endpoint: affordability
- No usage tracking for AI calls (cost monitoring deferred)
- No UI wiring for insights (API-only)
- No caching of AI responses

### Risks Identified

- getBudgetRisk returns empty progress if user has no budgets set. narrateBudgetRisk will narrate an empty array — produces a "no budgets" type response.
- Budget risk only considers current month. If user sets budgets mid-month, progress reflects full month spending vs pro-rated limit (engine does not pro-rate).

### Next Session Target

- Continue Milestone 4 Phase B: affordability vertical slice (GET /api/insights/affordability) — final insight endpoint

---

## Date: 2026-02-23

### Session Objective

- Milestone 4, Phase B (final): Affordability vertical slice. Add getAffordability() server function + GET /api/insights/affordability route with input validation and subscription enforcement. Completes all 5 insight endpoints.

### Skill(s) Used

- Skill: superpowers:executing-plans

### Completed

- Files created:
  - app/api/insights/affordability/route.ts (GET — auth + subscription + input validation + delegation)
- Files modified:
  - server/insights.ts (added getAffordability function, added aggregateIncomeExpense + computeAffordability + narrateAffordability imports)
- Database schema changes:
  - None (uses existing transactions, user_settings tables)
- API routes added:
  - GET /api/insights/affordability?amount_minor=X&item=Y&is_recurring=true|false (returns NarrativeResult JSON)

### Architectural Decisions

- Decision: GET with query params (not POST) for affordability
- Reason: Read operation — no data modification. Query params match the pattern of the other insight endpoints. Parameters: amount_minor (required, positive int), item (required, 1-200 chars), is_recurring (optional, defaults to false).
- Decision: Current month income/expense for affordability baseline
- Reason: Simplest approach. Matches what the dashboard shows. Computing multi-month averages would require dividing engine output in server code. Current month keeps the server free of arithmetic.
- Decision: Inline input validation (not separate Zod schema file)
- Reason: Only 3 params, only one route needs them. Creating a separate schema file would be over-engineering for this scope. Validation logic is straightforward — parseInt + bounds check + string length.
- Decision: absMinor for expense total before passing to engine
- Reason: Engine's aggregateIncomeExpense returns expenses as negative. computeAffordability expects monthlyExpensesMinor as positive (absolute). absMinor from engine converts — no raw Math.abs in server.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.2.0
- No financial calculations in server/insights.ts — income/expense via aggregateIncomeExpense, absolute value via absMinor, affordability via computeAffordability
- Verified: grep for Math.round/floor/ceil/abs/toFixed in server/insights.ts returned zero matches
- All 5 insight server functions verified clean

### Security & RLS Review

- Route authenticates via supabase.auth.getUser() before any operation
- Subscription enforcement via requireSubscription() before LLM call
- Input validation: amount_minor must be positive integer, item capped at 200 chars (prevents LLM prompt injection via oversized input)
- Transaction query filtered by user_id (defense in depth alongside RLS)
- No new RLS policies needed
- No DB access in ai/ (verified — zero matches)

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase
- All 5 insight endpoints complete — no remaining insight slices
- No usage tracking for AI calls (cost monitoring deferred)
- No UI wiring for insights (API-only)
- No caching of AI responses
- Affordability uses current month only — may be incomplete early in month

### Risks Identified

- Current month income may be zero early in the month (e.g., salary not yet received). computeAffordability handles this gracefully — surplus is 0, everything is unaffordable.
- item parameter is passed to LLM as part of the narrative prompt. Capped at 200 chars to limit injection surface. System prompt guardrails prevent the LLM from acting on malicious instructions.

### Next Session Target

- Milestone 4 governance checkpoint: verify all 5 insight endpoints meet DoD criteria. Then proceed to Milestone 5 (Conversational AI) or hardening.

---

## Date: 2026-02-23

### Session Objective

- Milestone 4 Governance Checkpoint: Verify all exit criteria for the AI Insight Engine milestone — engine functions, AI narrative layer, API endpoints, subscription enforcement, layering boundaries, and test suite integrity.

### Skill(s) Used

- Skill: superpowers:executing-plans
- Skill: superpowers:verification-before-completion

### Completed

- Governance checkpoint verified all 5 phases:

**Phase A — Engine Insight Functions:**

- All 5 deterministic engine functions verified present with test files:
  - engine/insights/spending-trends.ts (computeSpendingTrends, 7 tests)
  - engine/insights/anomaly-detection.ts (detectAnomalies, 7 tests)
  - engine/insights/subscription-detection.ts (detectSubscriptions, 8 tests)
  - engine/insights/affordability.ts (computeAffordability, 8 tests)
  - engine/insights/health-score.ts (computeFinancialHealthScore, 7 tests)
- Zero DB imports in engine/insights/ (grep verified)
- Zero AI imports in engine/insights/ (grep verified)

**Phase B — AI Narrative Layer:**

- All 6 ai/ module files verified present:
  - ai/types.ts (NarrativeResult discriminated union)
  - ai/client.ts (callNarrative — Haiku, temp 0.2, max 300)
  - ai/system-prompt.ts (locked guardrails)
  - ai/context-builders.ts (5 context builder serializers)
  - ai/narrators.ts (5 narrator functions)
  - ai/index.ts (12 barrel exports)
- Zero DB access in ai/ (grep verified)
- Zero Math.\* in ai/ (grep verified)

**Phase B — API Endpoints:**

- All 5 insight routes verified present:
  - app/api/insights/monthly-summary/route.ts
  - app/api/insights/anomalies/route.ts
  - app/api/insights/subscriptions/route.ts
  - app/api/insights/budget-risk/route.ts
  - app/api/insights/affordability/route.ts
- All 5 routes: auth (supabase.auth.getUser) + subscription enforcement (requireSubscription) + delegation to server/insights.ts
- Zero Math.\* in any route file (grep verified)

**Full Verification Suite:**

- tsc --noEmit: 0 errors
- vitest run: 17 test files, 162/162 tests passed
- Math.\* in server/insights.ts: zero matches
- Supabase imports in ai/: zero matches
- Supabase imports in engine/: zero matches
- Engine version: v0.2.0 (unchanged throughout Milestone 4)
- No unexpected top-level folders

**Layering Boundaries Confirmed:**

- engine/ — pure functions, no DB, no AI, no side effects
- ai/ — narration only, no DB, no financial math
- server/ — orchestrates DB → engine → ai, no Math.\*
- app/api/ — thin auth + subscription + delegation, no Math.\*

### Architectural Decisions

- Decision: Milestone 4 declared complete — all exit criteria met
- Reason: All 5 vertical slices implemented and verified. Layering boundaries intact. 162 tests passing. Zero type errors. No financial math outside engine/. Subscription enforcement on all insight routes.

### Financial Engine Impact

- Confirmed no duplication of math logic across all layers
- Engine version unchanged: v0.2.0
- All financial truth computed in engine/ — server/ai/routes only orchestrate and narrate

### Security & RLS Review

- All 5 insight routes enforce auth + subscription before any LLM call
- No new RLS policies needed (insight endpoints read existing user-owned data)
- ANTHROPIC_API_KEY remains server-only
- System prompt guardrails lock LLM to narration mode (no financial advice)

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase
- No usage tracking for AI calls (cost monitoring deferred)
- No UI wiring for insights (all API-only)
- No caching of AI responses (each request triggers fresh computation + LLM call)
- No rate limiting on insight endpoints (subscription gate provides implicit throttle)

### Risks Identified

- AI cost scales linearly with requests. No per-user rate limit beyond subscription gate.
- LLM responses are not cached — repeated identical queries trigger fresh API calls
- If migrations are not applied, all insight endpoints return empty/no-data narratives

### Next Session Target

- Milestone 5 — Conversational AI: Chat endpoint, RAG context injection, guardrails enforcement

---

## Date: 2026-02-23

### Session Objective

- Verify affordability wrapper refactor (computeAffordabilityFromSummary) is complete and correctly integrated. Prepare for Milestone 5 — Conversational AI.

### Skill(s) Used

- Skill: superpowers:writing-plans
- Skill: superpowers:verification-before-completion

### Completed

- Verified computeAffordabilityFromSummary wrapper in engine/insights/affordability.ts:71-82
  - Uses absMinor(summary.totalExpense) for sign conversion
  - Delegates immediately to computeAffordability — no branching, no new rules
  - Accepts IncomeExpenseSummary, requestedAmountMinor, isRecurring
- Verified tests in engine/insights/affordability.test.ts:128-190
  - 4 test cases: negative expense flip, zero expenses, expenses exceeding income, isRecurring passthrough
- Verified barrel exports in engine/insights/index.ts (line 47-48) and engine/index.ts (line 87)
- Verified server/insights.ts imports computeAffordabilityFromSummary from @/engine (line 24)
  - server/insights.ts:435 delegates to wrapper — no absMinor, no sign flipping, no financial math in server
  - Grep confirmed: zero absMinor matches in server/insights.ts
- No architectural regressions — layering boundaries intact:
  - engine/ — pure functions, no DB, no AI
  - server/ — orchestration only, no Math.\*
  - Canonical computeAffordability unchanged (lines 28-57)

### Architectural Decisions

- Decision: Affordability wrapper refactor confirmed complete — no additional changes needed
- Reason: computeAffordabilityFromSummary was implemented during Milestone 4 Phase A/B work. Server already delegates correctly. All interpretation logic lives in engine/.

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.2.0
- absMinor sign conversion lives exclusively in engine/insights/affordability.ts

### Security & RLS Review

- No new RLS policies needed
- Auth checks unchanged on /api/insights/affordability route

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase (carried forward)
- No caching of AI responses (carried forward)
- No rate limiting on insight endpoints (carried forward)

### Risks Identified

- No new risks identified

### Next Session Target

- Milestone 5 — Conversational AI: Chat endpoint, RAG context injection, guardrails enforcement

---

## Date: 2026-02-23

### Session Objective

- Milestone 5 — Conversational AI: Implement chat endpoint with RAG context injection and guardrails enforcement (8-task plan, subagent-driven development)

### Skill(s) Used

- Skill: superpowers:writing-plans (plan: docs/plans/2026-02-23-conversational-ai.md)
- Skill: superpowers:subagent-driven-development (8 tasks, spec + quality review gates)
- Skill: superpowers:test-driven-development (TDD for all tasks)
- Skill: superpowers:verification-before-completion (Task 8 — full verification)

### Completed

- Files created:
  - ai/chat-system-prompt.ts — locked conversational system prompt with 6 guardrail sections
  - ai/chat-system-prompt.test.ts — 5 tests
  - ai/chat-context-builder.ts — DATA EXPOSURE BOUNDARY: token-budgeted context serializer (MAX_CATEGORIES=5, Math.abs on expenses, no PII, no raw transactions)
  - ai/chat-context-builder.test.ts — 16 tests (structure, values, abs, cap, empty, PII leak, mutation, sanitization)
  - ai/chat.ts — answerChat function (Claude Haiku 4.5, temp 0.3, max_tokens 500, never throws)
  - ai/chat.test.ts — 9 tests with fully mocked Anthropic SDK
  - server/chat.ts — handleChat orchestration: DB → engine → AI (fetches settings, transactions, categories, budgets → maps to engine input → calls aggregateIncomeExpense + aggregateByCategory + computeBudgetProgressFromTransactions → calls answerChat)
  - server/chat.test.ts — 4 tests with mocked engine/ai/budgets
  - app/api/chat/route.ts — POST /api/chat with auth (401), rate limiting 20/min (429), subscription enforcement (403), input validation 1-500 chars (400), delegation to handleChat (500)
  - docs/plans/2026-02-23-conversational-ai.md — full implementation plan
- Files modified:
  - ai/types.ts — added ChatResult discriminated union type (ok: true → reply + tokensUsed, ok: false → error)
  - ai/index.ts — added barrel exports for CHAT_SYSTEM_PROMPT, buildChatContext, sanitizeUserMessage, answerChat, ChatResult
- API routes added:
  - POST /api/chat — conversational AI endpoint

### Architectural Decisions

- Decision: ChatResult follows same discriminated union pattern as NarrativeResult ({ ok: boolean })
- Reason: Standardized AI result type across all AI functions — consistent error handling
- Decision: Separate Anthropic SDK singleton in chat.ts (not shared with client.ts narrators)
- Reason: Chat uses different model params (temp 0.3/500 tokens vs 0.2/300 for narration) — separate instances prevent config bleed
- Decision: In-memory rate limiter (Map) instead of Redis
- Reason: V1 simplicity; Redis deferred to Milestone 6 hardening
- Decision: Chat system prompt is self-contained (not composed with NARRATIVE_SYSTEM_PROMPT)
- Reason: Prompts sent independently to LLM — shared base adds coupling without benefit
- Decision: transactionCount included in chat context (aggregate metric, not PII)
- Reason: Enables queries like "how many transactions this month?" — aggregate count is not sensitive data

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged: v0.2.0
- Chat uses existing engine functions only: aggregateIncomeExpense, aggregateByCategory, computeBudgetProgressFromTransactions
- No new engine functions created
- buildChatContext uses Math.abs for display formatting only (not financial computation)

### Security & RLS Review

- Auth: supabase.auth.getUser() enforced before any processing
- Rate limiting: 20 requests/min/user with 60s sliding window
- Subscription: requireSubscription() gate on chat endpoint
- Input sanitization: control char stripping (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g), 500-char truncation
- Data exposure boundary: buildChatContext controls LLM input — only aggregated summaries, no raw transactions, no PII, categories capped at 5

### Layering Boundary Verification (Task 8)

- tsc --noEmit: PASS (exit 0)
- vitest run: PASS (22 files, 220/220 tests)
- No Math.\* in server/chat.ts: PASS
- No supabase/SupabaseClient in ai/: PASS
- No @/engine import in app/api/chat/route.ts: PASS
- No Math.\* in app/api/chat/route.ts: PASS

### Commits (7)

- ace3b304 — feat(ai): add ChatResult discriminated union type
- 341ecc11 — feat(ai): add locked chat system prompt with conversational guardrails
- 577d276c — feat(ai): add chat context builder with token-budgeted serialization
- 2f02be7a — feat(ai): add answerChat function with context injection and mocked LLM tests
- 8ac024b9 — feat(ai): add chat barrel exports to ai/index.ts
- db4f3d3c — feat(server): add handleChat orchestration — DB → engine → AI
- 9ecf65a8 — feat(api): add POST /api/chat with auth, rate limiting, and subscription enforcement

### Known Gaps / TODO

- Migrations 001-006 not yet applied to Supabase (carried forward)
- No caching of AI responses (carried forward)
- In-memory rate limiter will not persist across serverless cold starts (Redis in Milestone 6)
- No conversation history / multi-turn chat (single question-answer per request)
- No streaming responses (full response returned as JSON)

### Risks Identified

- In-memory rate limiter resets on serverless cold start — users could exceed intended limits during high-churn deployments. Mitigation: Redis in Milestone 6.
- ESLint tsconfig.eslint.json path error persists for Online Budget App files (pre-existing, does not affect builds or tests)

### Next Session Target

- Milestone 6 — Polish & Hardening: Performance optimization, sync stability review, cost monitoring hooks

---

---

## TEMPLATE FOR EACH SESSION ENTRY

Copy this block and append below for each session:

---

## Date: YYYY-MM-DD

### Session Objective

- (Short description of what this session aimed to complete)

### Skill(s) Used

- Skill: <Name>

### Completed

- Files created:
  - path/to/file
- Files modified:
  - path/to/file
- Database schema changes:
  - Description
- API routes added:
  - /api/...

### Architectural Decisions

- Decision:
- Reason:

### Financial Engine Impact

- Confirmed no duplication of math logic
- Engine version unchanged / updated to vX.X.X

### Security & RLS Review

- RLS policies added/updated
- Auth checks verified

### Known Gaps / TODO

- List unresolved issues
- Pending integration steps

### Risks Identified

- Any new risk discovered

### Next Session Target

- Single clearly defined next task

---

---

# 🔍 Milestone Tracking Checklist

## Milestone 1 — Core Infrastructure

- [x] Next.js structure created
- [x] Supabase connected
- [x] Auth flow implemented
- [x] subscriptions table implemented
- [x] Stripe webhook working

## Milestone 2 — Transaction & Categorization Engine

- [x] System categories seeded (14 parents + 67 children + English translations)
- [x] Transaction CRUD server functions + API routes (create/read/update/delete)
- [x] Categorization engine (75 pattern rules, tokenizer, 2-tier cascade)
- [x] Auto-categorization wired into transaction creation
- [x] Merchant mapping persistence (user-learned rules)
- [x] Multi-currency normalization (convertMinor engine primitive)

## Milestone 3 — Dashboard & Budgeting

- [x] Dashboard aggregates (income/expense, category breakdown, account balances, savings rate)
- [x] Budget logic (engine: computeBudgetProgress, server: CRUD + API, migration: 006_budgets)
- [x] Goal tracking (engine: computeGoalProgress, no DB persistence in V1)

## Milestone 4 — AI Insight Engine

- [x] Phase A: Deterministic engine functions (spending trends, anomaly detection, subscription detection, affordability calculator, financial health score)
- [x] Phase B: AI narrative wrappers in ai/ (client, system-prompt, context-builders, narrators, barrel exports)
- [x] Phase B: API integration — GET /api/insights/monthly-summary (first vertical slice)
- [x] Phase B: API integration — GET /api/insights/anomalies (second vertical slice)
- [x] Phase B: API integration — GET /api/insights/subscriptions (third vertical slice)
- [x] Phase B: API integration — GET /api/insights/budget-risk (fourth vertical slice)
- [x] Phase B: API integration — GET /api/insights/affordability (fifth vertical slice — all 5 complete)
- [x] Governance checkpoint passed — all exit criteria verified (2026-02-23)

## Milestone 5 — Conversational AI

- [x] Chat endpoint (POST /api/chat — auth, rate limiting, subscription enforcement)
- [x] RAG context injection (buildChatContext — token-budgeted, categories capped at 5, no raw transactions)
- [x] Guardrails enforced (locked system prompt, input sanitization, data exposure boundary, 500-char limit)

## Milestone 6 — Polish & Hardening

- [ ] Performance optimization
- [ ] Sync stability review
- [ ] Cost monitoring hooks

---

# 🧠 Governance Reminder

- No feature creep.
- No duplicate financial math.
- AI is narrative only.
- Currency stored in minor units.
- RLS must protect all user data.

This log enforces discipline.
