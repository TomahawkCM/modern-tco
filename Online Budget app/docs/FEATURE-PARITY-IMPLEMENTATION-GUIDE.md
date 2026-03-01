# Online Budget App — Full Feature Parity Implementation Guide

> **Save location:** `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md`

## Context

The Online Budget App (`Online Budget app/online-budget-app/`) currently has **8 pages** while the Offline Budget App (`src/app/budget-app/`) has **55 pages**. The online version needs ALL offline features plus online-exclusive features (bank sync, AI chat, AI insights, Stripe billing). Every page must support **all languages and currencies** (113 locales) using `next-intl`, matching the offline app's i18n system.

**Architecture pattern**: Server components fetch from Supabase → pass data as props to client components (matching existing online app pattern in `dashboard/page.tsx`).

**i18n pattern**: All user-facing strings use `useTranslations()` from `next-intl`. Zero hardcoded English strings. Message files in `i18n/messages/`. Locale driven by `user_settings.locale` column (already exists in DB).

All paths relative to `Online Budget app/online-budget-app/` unless stated otherwise.

### Agent & Skill Assignments

Each task specifies the recommended agent type:
- **Explore** — Research and find existing patterns/files before coding
- **Plan** — Architect complex multi-file changes
- **general-purpose** — Execute implementation (write code, create files)
- **code-reviewer** — Review completed phase against plan
- **Skill: brainstorming** — Design complex UX flows (import wizard, onboarding)

### Progress Tracking

Each task has a checkbox. Sessions should mark tasks `[x]` when complete and commit the updated plan file. The next session reads this file to know where to resume.

---

## What Already Exists Online

**Pages (8):** `/` (landing), `/login`, `/signup`, `/dashboard`, `/transactions`, `/budgets`, `/insights`, `/chat`

**Supabase Tables (11):** `users`, `user_settings` (has `locale` + `language` columns), `subscriptions` (billing), `institutions`, `accounts`, `transactions`, `categories`, `category_translations`, `user_category_overrides`, `merchant_mappings`, `budgets`

**Server Functions:** `listAccounts` | full transaction CRUD | full budget CRUD | merchant mapping CRUD | 5 AI insight functions | `handleChat` | `getCategoryIdByKey`

**API Routes (22):** Full REST for transactions, budgets, merchant-mappings | AI insights (5) | chat | Stripe checkout/webhook | subscription status

**Engine:** Money math, aggregation, categorization, budgeting, goals, all insight functions

**Integrations:** Stripe (complete), Plaid (stub), Salt Edge (stub)

**i18n:** None — zero infrastructure, all strings hardcoded in English. DB has `user_settings.locale` and `user_settings.language` columns already.

---

## New Supabase Tables Master List

All tables need `user_id UUID REFERENCES users(id)` and RLS policies. Run as a single migration before Phase 3.

```sql
-- Phase 3: Financial Tracking
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  merchant_name TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  category_id UUID REFERENCES categories(id),
  next_billing_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE excluded_subscription_merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  merchant_token TEXT NOT NULL,
  UNIQUE(user_id, merchant_token)
);

CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  original_balance_minor INTEGER NOT NULL,
  current_balance_minor INTEGER NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL,
  minimum_payment_minor INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount_minor INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  principal_minor INTEGER,
  interest_minor INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE investment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  institution TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  investment_account_id UUID NOT NULL REFERENCES investment_accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  shares NUMERIC(12,4) NOT NULL,
  purchase_price_minor INTEGER NOT NULL,
  purchase_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  address TEXT NOT NULL,
  purchase_price_minor INTEGER,
  current_value_minor INTEGER,
  mortgage_balance_minor INTEGER DEFAULT 0,
  monthly_expenses_minor INTEGER DEFAULT 0,
  purchase_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  snapshot_date DATE NOT NULL,
  total_assets_minor INTEGER NOT NULL,
  total_liabilities_minor INTEGER NOT NULL,
  net_worth_minor INTEGER NOT NULL,
  breakdown JSONB,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Phase 4: Planning
CREATE TABLE future_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  target_amount_minor INTEGER NOT NULL,
  current_savings_minor INTEGER NOT NULL DEFAULT 0,
  monthly_savings_minor INTEGER NOT NULL DEFAULT 0,
  target_date DATE,
  priority TEXT DEFAULT 'medium',
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE retirement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  current_age INTEGER NOT NULL,
  retirement_age INTEGER NOT NULL DEFAULT 65,
  current_savings_minor INTEGER NOT NULL DEFAULT 0,
  monthly_contribution_minor INTEGER NOT NULL DEFAULT 0,
  expected_return_percent NUMERIC(5,2) NOT NULL DEFAULT 7.0,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE paycheck_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  schedule_type TEXT NOT NULL,
  pay_amount_minor INTEGER NOT NULL,
  next_pay_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  allocations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE debt_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  strategy TEXT NOT NULL,
  extra_payment_minor INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 5: Advanced
CREATE TABLE financial_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE event_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  total_budget_minor INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE event_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_budget_id UUID NOT NULL REFERENCES event_budgets(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  budget_minor INTEGER NOT NULL,
  spent_minor INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);

CREATE TABLE split_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  transaction_id UUID REFERENCES transactions(id),
  person_id UUID NOT NULL REFERENCES split_persons(id),
  amount_minor INTEGER NOT NULL,
  is_settled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE import_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  filename TEXT NOT NULL,
  bank_slug TEXT,
  row_count INTEGER NOT NULL,
  imported_count INTEGER NOT NULL,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  imported_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE imported_fitids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  fitid TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id),
  UNIQUE(user_id, fitid)
);

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  transaction_id UUID REFERENCES transactions(id),
  storage_path TEXT NOT NULL,
  extracted_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE connected_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  institution_id UUID REFERENCES institutions(id),
  last_synced_at TIMESTAMPTZ,
  sync_cursor TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Phase 1: i18n Foundation + Navigation Overhaul

**Goal:** Set up `next-intl` i18n infrastructure and replace the flat top bar with a grouped sidebar + mobile nav. This is the foundation for ALL subsequent phases — every phase builds on the i18n system and navigation.

### Task 1.1: Install and configure next-intl
**Agent:** general-purpose

- [x] Install `next-intl`: `npm install next-intl`
- [x] Create `i18n/config.ts` — port locale list from offline `src/i18n/config.ts` (113 locales with currency, dir, numberingSystem metadata)
- [x] Create `i18n/messages/en.json` — base English message file with all namespaces (start with: `common`, `nav`, `sidebar`, `dashboard`, `transactions`, `budgets`, `insights`, `chat`, `auth`, `settings`)
- [x] Create `components/i18n-provider.tsx` — `"use client"` wrapper around `NextIntlClientProvider`, reads locale from `user_settings` via prop, dynamically imports locale message files
- [x] Update `app/(app)/layout.tsx` — wrap children in `I18nProvider`, pass user's locale from `user_settings` table
- [x] Create `i18n/request.ts` — server-side next-intl config for `getTranslations()` in server components
- [x] Update `next.config.ts` — integrate next-intl plugin

**Reference:** Offline's `src/components/budget/ClientI18nProvider.tsx` for dynamic import pattern

### Task 1.2: Extract all existing hardcoded strings
**Agent:** general-purpose

- [x] Extract strings from `components/app-nav.tsx` → `nav` namespace
- [x] Extract strings from `app/(app)/dashboard/page.tsx` + dashboard components → `dashboard` namespace
- [x] Extract strings from `components/dashboard/account-cards.tsx` → `dashboard.accounts` namespace
- [x] Extract strings from `components/dashboard/income-expense-summary.tsx` → `dashboard.incomeExpense` namespace
- [x] Extract strings from `components/dashboard/budget-progress-list.tsx` → `dashboard.budgetProgress` namespace
- [x] Extract strings from `components/dashboard/category-breakdown.tsx` → `dashboard.categories` namespace
- [x] Extract strings from `components/dashboard/insight-alerts.tsx` → `insights.alerts` namespace
- [x] Extract strings from `app/(app)/transactions/page.tsx` + transaction components → `transactions` namespace
- [x] Extract strings from `app/(app)/budgets/page.tsx` + budget components → `budgets` namespace
- [x] Extract strings from `app/(app)/insights/page.tsx` + insight components → `insights` namespace
- [x] Extract strings from `app/(app)/chat/page.tsx` + chat components → `chat` namespace
- [x] Extract strings from `components/subscribe-button.tsx` → `common.subscribe` namespace
- [x] Extract strings from `components/insights/subscription-gate.tsx` → `insights.gate` namespace
- [ ] Extract strings from auth pages (`login`, `signup`) → `auth` namespace
- [ ] Extract strings from landing page → `landing` namespace

### Task 1.3: Generate locale message files
**Agent:** general-purpose

- [x] Create a generation script `scripts/generate-locales.ts` that takes `en.json` and produces all 113 locale files (initially with English fallback — translations can be added later via translation service)
- [x] Generate all 113 locale JSON files in `i18n/messages/`
- [x] Verify `I18nProvider` loads correct locale based on `user_settings.locale`

### Task 1.4: Add shadcn Sheet component
**Agent:** general-purpose

- [x] Run `npx shadcn@latest add sheet` (needed for mobile nav drawer)
- [x] Verify `components/ui/sheet.tsx` exists

### Task 1.5: Create sidebar navigation
**Agent:** general-purpose

- [x] Create `components/layout/app-sidebar.tsx` — desktop sidebar with grouped nav items:
  - **Core**: Dashboard (LayoutDashboard), Transactions (Receipt), Accounts (Landmark), Categories (Tags)
  - **Planning**: Budgets (PieChart), Subscriptions (Repeat), Loans (CreditCard)
  - **Wealth**: Investments (Wallet), Properties (Building2), Net Worth (TrendingUp)
  - **Analysis**: Reports (BarChart3), Insights (Lightbulb), Calculators (Calculator)
  - **Planning**: Future Plans (Target), Retirement (TrendingUp), Scenarios (FlaskConical)
  - **Footer**: Import (Upload), Settings (Settings), AI Chat (MessageCircle)
  - Desktop lg+: `w-60` expanded / `w-16` collapsed (toggle button)
  - Tablet md: icon-only `w-16`
  - All labels via `useTranslations("sidebar")`
  - Reference: offline's `src/components/budget/layout/Sidebar.tsx`
- [x] Create `components/layout/mobile-header.tsx` — sticky top bar for mobile with hamburger button + logo, `md:hidden`
- [x] Create `components/layout/mobile-sheet.tsx` — Sheet (side="left") containing full nav list, triggered from hamburger
- [x] Create `components/layout/mobile-nav.tsx` — fixed bottom tab bar, `md:hidden`, 5 tabs: Home, Budgets, Accounts, Transactions, More. Safe area inset padding. All labels via `useTranslations("mobileNav")`
  - Reference: offline's `src/components/budget/layout/MobileNav.tsx`

### Task 1.6: Create shared layout components
**Agent:** general-purpose

- [x] Create `components/layout/breadcrumb.tsx` — auto-generated from pathname, Home icon start. All segment labels via i18n. Reference: offline's `src/components/budget/Breadcrumb.tsx`
- [x] Create `components/layout/page-header.tsx` — title, description, action buttons. Reference: offline's `src/components/budget/PageHeader.tsx`

### Task 1.7: Update app layout
**Agent:** general-purpose

- [x] Modify `app/(app)/layout.tsx` — sidebar + mobile layout + breadcrumb + I18nProvider
- [ ] Delete `components/app-nav.tsx` (replaced by sidebar) — kept for now as fallback reference
- [ ] Update all existing pages to use `PageHeader` component — deferred to Phase 3+

### Task 1.8: Verify Phase 1
**Agent:** code-reviewer

- [x] Desktop (lg+): sidebar visible with all groups, collapsible
- [x] Tablet (md): icon-only sidebar
- [x] Mobile (<md): hamburger header + bottom tab bar + sheet drawer
- [x] All existing pages still accessible and functional
- [x] Locale switching works (change `user_settings.locale` → UI language changes)
- [x] `npm run check-types && npm test` — 220/220 tests pass, clean compile
- [x] Commit updated plan with Phase 1 tasks checked off

---

## Phase 2: Calculators + Chart Infrastructure

**Goal:** Port all 14 calculators and shared chart/calculator components. Pure client-side — no new tables, no new API routes. High user value.

**Prerequisites:** Phase 1 (navigation shows calculator links)

### Task 2.1: Install dependencies
**Agent:** general-purpose

- [x] `npm install recharts date-fns`

### Task 2.2: Port calculator engines
**Agent:** general-purpose

- [x] Create `engine/calculators/` — 15 modules ported: types, compounding, amortization, retirement, fire, inflation, monte-carlo, tax-model, net-worth-forecast, emergency-fund, savings-goal, debt-payoff, subscription-cost, budget-analyzer, index
- [x] Write tests for all ported engine functions — 13 test files, 111 tests passing

### Task 2.3: Create chart infrastructure
**Agent:** general-purpose

- [x] Create `components/charts/lazy-charts.tsx` — dynamic imports for recharts components (AreaChart, BarChart, LineChart, PieChart) with `{ ssr: false }`

### Task 2.4: Create shared calculator components
**Agent:** general-purpose

- [x] Create `components/calculators/currency-input.tsx` — locale-aware with prefix/suffix symbol detection, RTL support
- [x] Create `components/calculators/percent-input.tsx` — locale-aware with RTL support
- [x] Create `components/calculators/results-panel.tsx` — supports currency/number/percent/date/months/text types
- [x] Create `components/calculators/transparency-panel.tsx` — collapsible assumptions + formula display
- [x] Create `lib/format.ts` — formatting utilities (formatCurrency, formatNumber, formatPercent, parseFormattedNumber, getCurrencyDecimals, getCurrencySymbol)

### Task 2.5: Add calculator i18n namespace
**Agent:** general-purpose

- [x] Add `calculators` and `duration` namespaces to `i18n/messages/en.json` — all calculator labels, descriptions, input labels, result labels
- [x] Regenerate locale files — enhanced `generate-locales.ts` with deep merge, updated 111 locale files

### Task 2.6: Create calculator pages (all `"use client"`)
**Agent:** general-purpose

- [x] Create `app/(app)/calculators/page.tsx` — hub page with 3 sections (Core, Financial Planning, Tools & Analysis)
- [x] Create `app/(app)/calculators/mortgage/page.tsx` — two-mode (payment/affordability) + amortization table + AreaChart
- [x] Create `app/(app)/calculators/retirement/page.tsx` — collapsible advanced settings + status badge + two-phase chart
- [x] Create `app/(app)/calculators/fire/page.tsx` — milestones (Lean/Coast/FIRE/Fat) + AreaChart
- [x] Create `app/(app)/calculators/compound-interest/page.tsx` — compounding frequency select + AreaChart
- [x] Create `app/(app)/calculators/savings-goal/page.tsx` — two-mode (when/howMuch) + stacked AreaChart
- [x] Create `app/(app)/calculators/emergency-fund/page.tsx` — range slider + progress bar + tips
- [x] Create `app/(app)/calculators/debt-payoff/page.tsx` — dynamic debt list + snowball vs avalanche + BarChart
- [x] Create `app/(app)/calculators/tax-estimator/page.tsx` — filing status select + bracket breakdown
- [x] Create `app/(app)/calculators/net-worth-forecast/page.tsx` — dynamic asset/liability lists + AreaChart
- [x] Create `app/(app)/calculators/inflation/page.tsx` — presets (2/3/5%) + LineChart + year-by-year table
- [x] Create `app/(app)/calculators/subscription-cost/page.tsx` — dynamic subscription list + category breakdown
- [x] Create `app/(app)/calculators/monte-carlo/page.tsx` — mode toggle + success rate gauge + percentile bands
- [x] Create `app/(app)/calculators/budget-analyzer/page.tsx` — 50/30/20 rule + three progress bars

### Task 2.7: Verify Phase 2
**Agent:** code-reviewer

- [x] All 14 calculators render with form inputs, compute results, show charts
- [x] All calculator labels are translated via `useTranslations("calculators")`
- [x] Currency inputs respect user's locale/currency
- [x] `npm run check-types && npm test` — 0 TS errors, 331/331 tests pass (35 test files)
- [x] Commit updated plan with Phase 2 tasks checked off

---

## Phase 3: Core CRUD Pages

**Goal:** Accounts, Categories, Settings, Import, Export, Merchant Rules.

**Prerequisites:** Phase 1

### Task 3.1: Run Supabase migration for import tables
**Agent:** general-purpose

- [ ] Create migration file `supabase/migrations/XXX_import_tables.sql` with `import_metadata` and `imported_fitids` tables (see Master List)
- [ ] Run migration: `npx supabase db push` or apply via dashboard
- [ ] Add RLS policies for both tables

### Task 3.2: Create server functions
**Agent:** general-purpose

- [ ] Extend `server/accounts.ts`: add `createAccount`, `updateAccount`, `deleteAccount`
- [ ] Extend `server/categories.ts`: add `listCategories` (with translations), `listUserCategoryOverrides`, `createUserCategoryOverride`
- [ ] Create `server/settings.ts`: `getUserSettings`, `updateUserSettings`
- [ ] Create `server/import.ts`: `bulkCreateTransactions`, `checkDuplicateFitids`, `recordImport`, `saveFitids`

### Task 3.3: Create API routes
**Agent:** general-purpose

- [ ] `app/api/accounts/route.ts` — GET (list), POST (create)
- [ ] `app/api/accounts/[id]/route.ts` — PATCH (update), DELETE
- [ ] `app/api/categories/route.ts` — GET (list with translations)
- [ ] `app/api/settings/route.ts` — GET, PATCH
- [ ] `app/api/import/transactions/route.ts` — POST (bulk create)
- [ ] `app/api/import/check-duplicates/route.ts` — POST (check fitids)

### Task 3.4: Port import parsers
**Agent:** general-purpose

- [ ] Create `lib/parsers/csv-parser.ts` — port from offline `src/lib/parsers/csv-parser.ts`
- [ ] Create `lib/parsers/ofx-parser.ts` — port from offline `src/lib/parsers/ofx-parser.ts`
- [ ] Create `lib/parsers/format-detector.ts` — port from offline `src/lib/parsers/format-detector.ts`
- [ ] Create `lib/parsers/bank-configs.ts` — port bank column mapping configs

### Task 3.5: Add i18n namespaces
**Agent:** general-purpose

- [ ] Add `accounts`, `categories`, `settings`, `import`, `export`, `merchantRules` namespaces to `en.json`
- [ ] Regenerate locale files

### Task 3.6: Create pages
**Agent:** general-purpose

- [ ] Create `app/(app)/accounts/page.tsx` — server component, fetches accounts + tx counts, renders account cards with create/edit/delete modals. Reference: offline `src/app/budget-app/accounts/page.tsx`
- [ ] Create `app/(app)/categories/page.tsx` — server component, lists system categories grouped by type + user overrides. Reference: offline `src/app/budget-app/categories/page.tsx`
- [ ] Create `app/(app)/settings/page.tsx` — server component, tabs: General (currency, locale), Notifications. Locale change triggers i18n provider reload. Reference: offline settings (simplified)
- [ ] Create `app/(app)/settings/merchant-rules/page.tsx` — server component, lists merchant_mappings, add/delete. Uses existing `listMerchantMappings`. Reference: offline merchant-rules page
- [ ] Create `app/(app)/import/page.tsx` — `"use client"`, multi-step wizard: file upload → format detection → column mapping → preview → import. Uses client-side parsers + server bulk insert. Reference: offline import page. **Use Skill: brainstorming** to design the import wizard UX before implementing.
- [ ] Create `app/(app)/export/page.tsx` — server component, date range selector, CSV/JSON export buttons

### Task 3.7: Verify Phase 3
**Agent:** code-reviewer

- [ ] CRUD accounts: create, edit, delete from `/accounts`
- [ ] View categories with overrides from `/categories`
- [ ] Update currency/locale from `/settings` — UI language changes
- [ ] Import a CSV file → preview → transactions appear in `/transactions`
- [ ] Export transactions as CSV
- [ ] Merchant rules list, add, delete
- [ ] All pages use `useTranslations()` — no hardcoded strings
- [ ] `npm run check-types && npm test`
- [ ] Commit updated plan with Phase 3 tasks checked off

---

## Phase 4: Financial Tracking

**Goal:** Subscriptions, Loans (4 pages), Investments, Properties (2 pages), Net Worth.

**Prerequisites:** Phase 3 (accounts infrastructure)

### Task 4.1: Run Supabase migration
**Agent:** general-purpose

- [ ] Create migration with tables: `user_subscriptions`, `excluded_subscription_merchants`, `loans`, `loan_payments`, `investment_accounts`, `holdings`, `properties`, `net_worth_snapshots` (see Master List)
- [ ] Add RLS policies for all tables

### Task 4.2: Create server functions
**Agent:** general-purpose

- [ ] Create `server/user-subscriptions.ts`: full CRUD + `detectSubscriptionsFromTransactions`
- [ ] Create `server/loans.ts`: full CRUD for loans + loan payments
- [ ] Create `server/investments.ts`: full CRUD for investment accounts + holdings
- [ ] Create `server/properties.ts`: full CRUD
- [ ] Create `server/net-worth.ts`: `getLatestNetWorth`, `listNetWorthSnapshots`, `createNetWorthSnapshot`

### Task 4.3: Create API routes
**Agent:** general-purpose

- [ ] Full CRUD routes for: `/api/user-subscriptions/[id]`, `/api/loans/[id]`, `/api/loans/[id]/payments`, `/api/investments/[id]`, `/api/investments/[id]/holdings/[holdingId]`, `/api/properties/[id]`, `/api/net-worth`, `/api/net-worth/snapshot`

### Task 4.4: Port engine functions
**Agent:** general-purpose

- [ ] Create `engine/loans/calculations.ts`: `generateAmortizationSchedule`, `analyzeLoanCost` (can reuse from Phase 2 calculator engine)

### Task 4.5: Add i18n namespaces
**Agent:** general-purpose

- [ ] Add `subscriptions`, `loans`, `investments`, `properties`, `netWorth` namespaces to `en.json`. Port from offline's `en-US.json`
- [ ] Regenerate locale files

### Task 4.6: Create pages
**Agent:** general-purpose

- [ ] `app/(app)/subscriptions/page.tsx` — manual + auto-detected subscriptions, cost chart, CRUD modals. Components: `SubscriptionCard`, `SubscriptionModal`, `SubscriptionCostChart` (recharts PieChart). Reference: offline subscriptions page
- [ ] `app/(app)/loans/page.tsx` — loan list with summary stats. Reference: offline loans page
- [ ] `app/(app)/loans/new/page.tsx` — loan creation form (`LoanForm` component)
- [ ] `app/(app)/loans/[id]/page.tsx` — loan detail: amortization chart, payment history, extra payment calculator. Components: `AmortizationChart`, `PaymentHistory`, `ExtraPaymentCalculator`
- [ ] `app/(app)/loans/[id]/edit/page.tsx` — edit loan (reuse `LoanForm`)
- [ ] `app/(app)/investments/page.tsx` — investment accounts + holdings, portfolio chart. Components: `InvestmentAccountModal`, `HoldingModal`, `InvestmentCharts`
- [ ] `app/(app)/properties/page.tsx` — property list with values, add/edit modal
- [ ] `app/(app)/properties/[id]/page.tsx` — property detail (value, equity, expenses)
- [ ] `app/(app)/net-worth/page.tsx` — current net worth (aggregated), historical chart, breakdown

### Task 4.7: Verify Phase 4
**Agent:** code-reviewer

- [ ] CRUD for subscriptions, loans, investments, properties all work
- [ ] Loan detail shows amortization chart
- [ ] Net worth aggregates all financial data correctly
- [ ] Charts render with recharts
- [ ] All pages use `useTranslations()` with correct namespaces
- [ ] Currency formatting respects user's locale
- [ ] `npm run check-types && npm test`
- [ ] Commit updated plan with Phase 4 tasks checked off

---

## Phase 5: Reports + Planning

**Goal:** Reports/analytics page and all planning features.

**Prerequisites:** Phase 4 (reports need all financial data; debt payoff needs loans)

### Task 5.1: Run Supabase migration
**Agent:** general-purpose

- [ ] Create migration with tables: `future_purchases`, `retirement_plans`, `paycheck_plans`, `debt_scenarios` (see Master List)
- [ ] Add RLS policies

### Task 5.2: Create server functions
**Agent:** general-purpose

- [ ] Create `server/reports.ts`: `getMonthlyTotals`, `getCategorySpendingOverTime`
- [ ] Create `server/planning.ts`: CRUD for `future_purchases`, `retirement_plans`, `paycheck_plans`
- [ ] Create `server/debt-payoff.ts`: CRUD for `debt_scenarios`, `getDebtPayoffData`

### Task 5.3: Install dependencies
**Agent:** general-purpose

- [ ] `npm install html-to-image`

### Task 5.4: Port chart components
**Agent:** general-purpose

- [ ] Create `components/charts/spending-heatmap.tsx` — port from offline
- [ ] Create `components/charts/spending-trend-chart.tsx` — port from offline
- [ ] Create `components/charts/sankey-diagram.tsx` — port from offline `src/components/charts/SankeyWithAccessibility.tsx`

### Task 5.5: Add i18n namespaces
**Agent:** general-purpose

- [ ] Add `reports`, `planning`, `debtPayoff` namespaces to `en.json`
- [ ] Regenerate locale files

### Task 5.6: Create pages
**Agent:** general-purpose

- [ ] `app/(app)/reports/page.tsx` — time range selector, spending by category (PieChart + table), income vs expense trend (LineChart), spending heatmap, Sankey money flow, PNG/SVG export. Reference: offline reports page
- [ ] `app/(app)/planning/future/page.tsx` — future purchase goals list, progress bars, CRUD modal. Uses engine `computeGoalProgress`
- [ ] `app/(app)/planning/retirement/page.tsx` — retirement plan form + projection chart. Uses `calculateRetirement`
- [ ] `app/(app)/planning/paycheck/page.tsx` — paycheck allocation planner, visual breakdown
- [ ] `app/(app)/debt-payoff/page.tsx` — reads loans, strategy configurator (avalanche/snowball), payoff timeline chart, scenario save/load. Uses `calculateDebtPayoff`

### Task 5.7: Verify Phase 5
**Agent:** code-reviewer

- [ ] Reports page shows all chart types with real data
- [ ] Sankey exports to PNG/SVG
- [ ] Planning pages CRUD works
- [ ] Debt payoff reads real loans and computes payoff timelines
- [ ] All translated, all currency-formatted correctly
- [ ] `npm run check-types && npm test`
- [ ] Commit updated plan with Phase 5 tasks checked off

---

## Phase 6: Advanced Features

**Goal:** Scenarios, Events, Splits, Reviews, Friday Review, OCR.

**Prerequisites:** Phase 4

### Task 6.1: Run Supabase migration
**Agent:** general-purpose

- [ ] Create migration with tables: `financial_scenarios`, `event_budgets`, `event_budget_items`, `split_persons`, `expense_splits`, `receipts` (see Master List)
- [ ] Create Supabase Storage bucket `receipt-images`
- [ ] Add RLS policies

### Task 6.2: Create server functions
**Agent:** general-purpose

- [ ] Create server CRUD for all new tables: `server/scenarios.ts`, `server/events.ts`, `server/splits.ts`, `server/receipts.ts`

### Task 6.3: Add i18n namespaces
**Agent:** general-purpose

- [ ] Add `scenarios`, `events`, `splits`, `review`, `weeklyRecap`, `ocr` namespaces to `en.json`
- [ ] Regenerate locale files

### Task 6.4: Create pages
**Agent:** general-purpose

- [ ] `app/(app)/scenarios/page.tsx` — what-if financial scenario modeling
- [ ] `app/(app)/events/page.tsx` — event/project budget tracking, CRUD
- [ ] `app/(app)/splits/page.tsx` — expense splitting, balance summary
- [ ] `app/(app)/review/page.tsx` — uncategorized transaction review queue
- [ ] `app/(app)/friday-review/page.tsx` — weekly guided review wizard

### Task 6.5: Create OCR page (lower priority)
**Agent:** general-purpose

- [ ] `npm install tesseract.js`
- [ ] `app/(app)/ocr/page.tsx` — receipt photo upload → client-side Tesseract OCR → create transaction, store receipt in Supabase Storage

### Task 6.6: Verify Phase 6
**Agent:** code-reviewer

- [ ] Each page renders and CRUD works
- [ ] Expense splits track balances correctly
- [ ] Review page filters uncategorized transactions
- [ ] All translated
- [ ] `npm run check-types && npm test`
- [ ] Commit updated plan with Phase 6 tasks checked off

---

## Phase 7: Polish + Onboarding

**Goal:** Command palette, onboarding wizard, mobile FAB, More page, auth flows.

**Prerequisites:** All prior phases

### Task 7.1: Add shadcn Command component
**Agent:** general-purpose

- [ ] `npx shadcn@latest add command`

### Task 7.2: Create UX components
**Agent:** general-purpose

- [ ] Create `components/layout/command-palette.tsx` — Cmd/Ctrl+K, navigation commands for all pages, theme switching. Reference: offline `src/components/budget/CommandPalette.tsx`. Use `useTranslations("commandPalette")`
- [ ] Create `components/layout/floating-action-button.tsx` — mobile-only FAB for "Add Transaction", fixed above bottom tab bar. Reference: offline FAB

### Task 7.3: Add i18n namespaces
**Agent:** general-purpose

- [ ] Add `commandPalette`, `onboarding`, `morePage` namespaces to `en.json`
- [ ] Regenerate locale files

### Task 7.4: Create pages
**Agent:** general-purpose

- [ ] `app/(app)/onboarding/page.tsx` — step wizard: Welcome → Import → Categories → First Budget → Done. Marks onboarding complete in `user_settings`. Use **Skill: brainstorming** to design wizard flow.
- [ ] `app/(app)/more/page.tsx` — mobile overflow page, groups all non-primary links. Reference: offline `src/app/budget-app/more/MorePageClient.tsx`
- [ ] `app/(auth)/forgot-password/page.tsx` — Supabase `resetPasswordForEmail()`
- [ ] `app/(auth)/reset-password/page.tsx` — Supabase `updateUser({ password })`

### Task 7.5: Wire command palette into layout
**Agent:** general-purpose

- [ ] Add `CommandPalette` to `app/(app)/layout.tsx`
- [ ] Add keyboard shortcut listener (Cmd/Ctrl+K)
- [ ] Add `FloatingActionButton` to layout (mobile only)

### Task 7.6: Verify Phase 7
**Agent:** code-reviewer

- [ ] Cmd+K opens command palette, navigation works
- [ ] Onboarding wizard completes and marks user as onboarded
- [ ] Mobile "More" page shows all links
- [ ] FAB creates new transaction on mobile
- [ ] Forgot/reset password flow works
- [ ] All translated
- [ ] `npm run check-types && npm test && npm run build`
- [ ] Commit updated plan with Phase 7 tasks checked off

---

## Phase 8: Bank Sync (Online-Exclusive)

**Goal:** Implement Plaid and/or Salt Edge bank sync.

**Prerequisites:** Phase 3 (accounts + transactions)

### Task 8.1: Implement Plaid integration
**Agent:** general-purpose — **Use Explore agent first** to research Plaid API patterns

- [ ] Complete `integrations/plaid/index.ts`: `createLinkToken`, `exchangePublicToken`, `syncTransactions`, `getAccounts`
- [ ] `npm install plaid` (or `@plaid/link`)
- [ ] Create API routes: `POST /api/plaid/link-token`, `POST /api/plaid/exchange-token`, `POST /api/plaid/sync`
- [ ] Create `components/bank-sync/plaid-link-button.tsx` — Plaid Link UI component
- [ ] Create `components/bank-sync/sync-status.tsx` — sync status indicator
- [ ] Add `connected_banks` table migration (see Master List)

### Task 8.2: Add i18n namespace
**Agent:** general-purpose

- [ ] Add `bankSync` namespace to `en.json`
- [ ] Regenerate locale files

### Task 8.3: Integrate into accounts page
**Agent:** general-purpose

- [ ] Add "Connect Bank" button to `/accounts` page using Plaid Link
- [ ] Show sync status on connected accounts
- [ ] Add manual sync trigger button

### Task 8.4: Verify Phase 8
**Agent:** code-reviewer

- [ ] Plaid Link opens and connects sandbox bank
- [ ] Accounts created from Plaid data
- [ ] Transactions sync from Plaid
- [ ] All translated
- [ ] `npm run check-types && npm test`
- [ ] Commit updated plan with Phase 8 tasks checked off

---

## Summary

| Phase | Pages Added | New Tables | Key Deliverable |
|-------|------------|------------|-----------------|
| 1 | 0 (modify existing) | 0 | i18n + Sidebar + Mobile nav |
| 2 | 15 | 0 | All 14 calculators + hub |
| 3 | 6 | 2 | Accounts, Categories, Settings, Import, Export, Merchant Rules |
| 4 | 9 | 7 | Subscriptions, Loans, Investments, Properties, Net Worth |
| 5 | 5 | 4 | Reports, Future Plans, Retirement, Paycheck, Debt Payoff |
| 6 | 6 | 5+bucket | Scenarios, Events, Splits, Reviews, OCR |
| 7 | 4 | 0 | Command palette, Onboarding, More, Auth flows |
| 8 | 0 | 1 | Plaid bank sync |

**Total: ~45 new pages, ~19 new tables, full feature parity + online exclusives, all 113 locales**

---

## Key References (Offline App Source Paths)

| Feature | Offline Source Path |
|---------|-------------------|
| i18n config | `src/i18n/config.ts` |
| i18n provider | `src/components/budget/ClientI18nProvider.tsx` |
| Message files | `src/i18n/messages/*.json` (113 files) |
| Sidebar | `src/components/budget/layout/Sidebar.tsx` |
| Mobile Nav | `src/components/budget/layout/MobileNav.tsx` |
| More page | `src/app/budget-app/more/MorePageClient.tsx` |
| Command Palette | `src/components/budget/CommandPalette.tsx` |
| Breadcrumb | `src/components/budget/Breadcrumb.tsx` |
| PageHeader | `src/components/budget/PageHeader.tsx` |
| Calculator components | `src/components/budget/calculators/` |
| Financial engine | `src/lib/financial-engine.ts` |
| Calculator engines | `src/lib/calculators/*.ts` |
| CSV/OFX parsers | `src/lib/parsers/` |
| Loan calculations | `src/lib/loans/calculations.ts` |
| Subscription detection | `src/lib/subscription-detector.ts` |
| Reports charts | `src/components/budget/charts/` + `src/components/charts/` |
| Sankey diagram | `src/components/charts/SankeyWithAccessibility.tsx` |
| Accounts page | `src/app/budget-app/accounts/page.tsx` |
| Categories page | `src/app/budget-app/categories/page.tsx` |
| Settings page | `src/app/budget-app/settings/page.tsx` |
| Import page | `src/app/budget-app/import/page.tsx` |
| Subscriptions page | `src/app/budget-app/subscriptions/page.tsx` |
| Loans pages | `src/app/budget-app/loans/` |
| Investments page | `src/app/budget-app/investments/page.tsx` |
| Properties pages | `src/app/budget-app/properties/` |
| Net Worth page | `src/app/budget-app/net-worth/page.tsx` |
| Reports page | `src/app/budget-app/reports/page.tsx` |
| Debt Payoff page | `src/app/budget-app/debt-payoff/page.tsx` |

## Implementation Notes for Claude Sessions

1. **Read this file first** — check which tasks are `[x]` complete, start on the next unchecked task
2. **Mark tasks done** — after completing a task, edit this file to change `[ ]` to `[x]`, then commit
3. **Always use `useTranslations()`** — no hardcoded English strings on any page
4. **Follow existing patterns** — `dashboard/page.tsx` for server components, `insights/` cards for client components
5. **Use the engine** — never do financial math outside `engine/` directory
6. **Supabase RLS** — all new tables need `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policies
7. **shadcn components** — use existing UI primitives in `components/ui/`; add new ones via `npx shadcn@latest add <component>`
8. **Port logic, adapt styling** — offline uses dark glass effects; online uses shadcn/zinc defaults
9. **Run verification** — every phase ends with `npm run check-types && npm test`
10. **Currency formatting** — always use `formatMoney()` from engine with user's locale