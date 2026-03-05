# Online Budget App: Plans vs Production Gap Analysis

**Date**: 2026-03-03 | **Type**: Analysis (read-only, no code changes) | **Verified against codebase**
**Updated**: 2026-03-04 — Sessions 1-7 completed, gap items marked done

### Completed Since Original Analysis (Sessions 1-7)

| Session | Sprint         | What was done                                                                                           |
| ------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| S1      | Security       | CSP/HSTS headers, Sentry monitoring, health endpoint, env validation                                    |
| S2      | Security       | Auth rate limiting (Supabase-backed), email verification, audit logging, session management, RBAC roles |
| S3      | Security       | Admin dashboard (stats, user management, audit log viewer)                                              |
| S4      | Security       | Encryption key rotation, 22 encryption tests                                                            |
| S5      | Multi-Currency | FX rate service, USD hardcode elimination, net worth multi-currency, CurrencyProvider                   |
| S6      | i18n           | Full i18n completion — admin, errors, landing, locale-aware formatting, html lang/dir                   |
| S7      | OAuth          | Google + GitHub OAuth via Supabase PKCE, login page i18n                                                |

---

## 1. Executive Summary

The Online Budget App has significantly outpaced its planning documents. Production spans **two separate applications** — a fact no planning document captures:

| App                          | Location                               | Pages | API Routes    | AI            | Bank Sync | Storage              |
| ---------------------------- | -------------------------------------- | ----- | ------------- | ------------- | --------- | -------------------- |
| **Embedded** (offline-first) | `src/app/budget-app/`                  | 56    | 25 (7 budget) | OpenAI GPT-4o | SimpleFIN | IndexedDB (Dexie.js) |
| **Online** (cloud-first)     | `Online Budget app/online-budget-app/` | 52    | 60            | Claude SDK    | Plaid     | Supabase PostgreSQL  |

Combined: **108 pages, 85 API routes, 188+ components, 14 calculator engines, and dual AI integrations**.

The authoritative plan's Pre-Phase 0 (migrate to Vite + Mantine) was never executed. Instead, a **second Next.js 16 + shadcn/ui app** was built alongside the original — same stack, different architecture (cloud-first vs offline-first). The Vite + Mantine migration plan is obsolete.

~40-50% of Phase 1-3 features are built, Phases 4-5 have substantial coverage, and Phases 6-9 are untouched. The planning documents are stale and contradictory — they describe a different app on a different stack.

---

## 2. Strategic Pivot: Migration Plan Is Dead

The authoritative plan called for a ground-up migration to a new stack:

| Planned Stack                     | Actual Production Stack (Both Apps)     |
| --------------------------------- | --------------------------------------- |
| React + Vite 7.x                  | **Next.js 16** (App Router)             |
| Mantine v7 + CSS-in-JS            | **shadcn/ui + Radix UI + Tailwind CSS** |
| React Router v7 / TanStack Router | **Next.js file-based routing**          |
| Hono.js on Cloudflare Workers     | **Next.js API routes**                  |
| Cloudflare Pages                  | **Vercel**                              |
| New standalone SPA                | **Second Next.js app in same monorepo** |

Both apps run Next.js 16.1.6 + React 19 + TypeScript + shadcn/ui + Tailwind. **Pre-Phase 0 should be formally retired.** The online app was built as `Online Budget app/online-budget-app/` using the exact same stack as the embedded app, not the planned Vite + Mantine SPA.

---

## 3. Dual-App Architecture (Undocumented)

No planning document describes the current dual-app structure. This is the actual state:

### Embedded Budget App (`src/app/budget-app/`)

- **56 pages**: Dashboard, transactions, budgets, accounts, categories, subscriptions, investments, loans (CRUD), properties (CRUD), net-worth, reports, settings, 14 calculators, planning (paycheck/retirement/future), debt-payoff, scenarios, events, import, OCR, export, splits, friday-review, onboarding, admin, design-system, debug, train-ml, auth (login/signup/forgot/reset/upgrade), landing, more, review, offline
- **188 components** in `src/components/budget/` including chatbot (10 files), calculators (6), debt-payoff (4), loans (3), LAN sync (6), landing (16), onboarding (9), profile (7), search (6), settings (6), gamification (3), notifications (4)
- **25 API routes** (7 budget-specific: chat, bank/detect, import/analyze-columns, import/analyze-error, import/pdf-extract, merchants/resolve, merchants/feedback)
- **Storage**: IndexedDB via Dexie.js (all data local, offline-first)
- **AI**: OpenAI GPT-4o-mini (streaming)
- **Bank sync**: SimpleFIN (5-file subsystem: client, sync, encryption, types, index)
- **Encryption**: PBKDF2 key derivation with device fingerprint, AES-GCM encryption at rest

### Online Budget App (`Online Budget app/online-budget-app/`)

- **52 pages**: Mirrors most embedded features + insights page + chat page (dedicated)
- **60 API routes**: Full CRUD for accounts, budgets, categories, transactions, loans, investments, properties, events, scenarios, splits, planning, merchant-mappings, receipts, settings, reports, user-subscriptions, net-worth, debt-payoff, insights (anomalies, budget-risk, affordability, subscriptions, monthly-summary), import (check-duplicates, transactions)
- **Key dependencies**: `@anthropic-ai/sdk` (Claude), `plaid` + `react-plaid-link`, `stripe`, `@supabase/ssr`, `tesseract.js`, `recharts`
- **Storage**: Supabase PostgreSQL (cloud-first)
- **AI**: Anthropic Claude SDK
- **Bank sync**: Plaid (link-token, exchange-token, sync)
- **Payments**: Stripe (checkout + webhooks)
- **Deployed**: Vercel at `online-budget-app.vercel.app`

---

## 4. Feature Gap Matrix

### Pre-Phase 0: Tech Stack Migration — SUPERSEDED

All items (Vite, Mantine, React Router, Hono.js, Cloudflare, new repo) abandoned. Next.js 16 + shadcn is the permanent stack for both apps.

### Phase 1: Foundation MVP

| Feature                     | Status            | Evidence                                                                                                                                                                                                                                                                       |
| --------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E2E encryption              | **DONE**          | `src/lib/encryption/budget-encryption.ts`: PBKDF2 (100K iterations) + AES-GCM + device fingerprint derivation. `encrypted-db-wrapper.ts`, `encrypted-transactions.ts`, `migrate-to-encryption.ts`, `lan-sync-encryption.ts`. No 24-word recovery or multi-device key exchange. |
| Cloud sync engine           | **PARTIAL**       | Online app uses Supabase PostgreSQL. No offline-first sync with conflict resolution (CRDT/OT). LAN sync exists (6-component QR-based subsystem) but is device-to-device, not cloud.                                                                                            |
| Stripe billing              | **DONE** (online) | Online app: `api/stripe/checkout/route.ts`, `api/stripe/webhook/route.ts`, `api/subscription/status/route.ts`. Embedded: only `api/v1/stripe/create-checkout-session/route.ts`.                                                                                                |
| Passkey auth (WebAuthn)     | **NOT STARTED**   | No FIDO2/SimpleWebAuthn implementation. PIN-based auth exists (`PINSetupDialog`, `PINEntryDialog`).                                                                                                                                                                            |
| Safe-to-Spend engine        | **PARTIAL**       | Budget tracking + health score widgets exist (`HealthScoreWidget.tsx`, `HealthScoreHistory.tsx`). No dedicated "safe to spend today" widget.                                                                                                                                   |
| Budget methodology selector | **PARTIAL**       | Budgets page exists with rollover support (`BudgetRollover` type). Unclear if all 4 methods (envelope, zero-based, 50/30/20, pay-yourself-first) are selectable.                                                                                                               |
| Multi-currency engine       | **DONE** (S5)     | FX rate service (`lib/currency/fx-rates.ts`), frankfurter.app + Supabase cache (24h TTL), `convertAmount()`, net worth multi-currency aggregation, CurrencyProvider context, all hardcoded USD eliminated.                                                                     |
| Localization (114 locales)  | **DONE** (S6)     | 113 locales in `src/i18n/messages/` via next-intl. Full i18n completion: admin pages, error pages, landing page, locale-aware formatting, dynamic html lang + dir. RTL support confirmed.                                                                                      |

### Phase 2: Bank Sync

| Feature                  | Status              | Evidence                                                                                                                                                                       |
| ------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SimpleFIN                | **DONE** (embedded) | `src/lib/simplefin/`: client.ts, sync.ts, encryption.ts, types.ts, index.ts. Components: `SimpleFINConnect.tsx`, `SimpleFINStatus.tsx`, `SimpleFINSettings.tsx`.               |
| Plaid integration        | **DONE** (online)   | Online app: `api/plaid/link-token`, `exchange-token`, `sync`. Dependencies: `plaid@^41.3.0`, `react-plaid-link@^4.1.1`. Not in embedded app.                                   |
| Sync health dashboard    | **PARTIAL**         | `api/insights/anomalies`, `budget-risk`, `affordability`, `monthly-summary`, `subscriptions` (online). No dedicated sync-health view.                                          |
| Reconciliation autopilot | **NOT STARTED**     | —                                                                                                                                                                              |
| Subscription detection   | **DONE**            | `src/lib/subscription-detector.ts`, `subscription-reminders.ts`. Page, calculator, components, insights route all exist.                                                       |
| Receipt scanning (OCR)   | **DONE**            | `src/lib/receipt-ocr.ts`, `bank-statement-ocr.ts`, `parsers/pdf-ocr-parser.ts`. Tesseract.js 7.0 in both apps. OCR page, receipt upload/thumbnail components, PDF extract API. |
| Credit score             | **NOT STARTED**     | —                                                                                                                                                                              |
| CSV/OFX import           | **DONE**            | `src/lib/parsers/bank-configs.ts` with 100+ bank configurations. AI column mapper (`AIColumnMapperModal.tsx`). Import wizard, error analysis API, YNAB migration wizard.       |

### Phase 3: Family & Collaboration

| Feature                  | Status          | Evidence                                                                                                                                                                                     |
| ------------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Family groups / sharing  | **NOT STARTED** | No multi-user/household features.                                                                                                                                                            |
| Couple features          | **NOT STARTED** | —                                                                                                                                                                                            |
| Financial wellness score | **DONE**        | `HealthScoreWidget.tsx`, `HealthScoreHistory.tsx`, `SpendingInsights.tsx`, `RecommendationsPanel.tsx`, `AnomalyAlerts.tsx`, `OverspendingAlerts.tsx`.                                        |
| Expense splitting        | **DONE**        | `src/lib/expense-splits/split-engine.ts`. Splits page. Online: full CRUD API (splits, persons, balance). `SplitTransactionModal.tsx`. Splitwise-style with settlement tracking.              |
| Gamification             | **PARTIAL**     | Components exist: `AchievementToast.tsx`, `BadgeGrid.tsx`, `StreakCounter.tsx` in `src/components/budget/gamification/`. Integration depth unclear — may be UI shells without backend logic. |

### Phase 4: AI

| Feature              | Status          | Evidence                                                                                                                                                     |
| -------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AI money coach       | **DONE**        | Embedded: OpenAI GPT-4o-mini streaming (`api/chat/route.ts`), 10-component chatbot subsystem. Online: Claude SDK (`@anthropic-ai/sdk`), dedicated chat page. |
| AI merchant matching | **DONE**        | `api/merchants/resolve`, `api/merchants/feedback`, `src/lib/ai/smart-bank-detection.ts`. Confidence meter, merchant rule prompts.                            |
| AI import analysis   | **DONE**        | `api/import/analyze-columns` (AI column mapping), `api/import/analyze-error` (error diagnosis). `AIColumnMapperModal.tsx`.                                   |
| Predictive analytics | **PARTIAL**     | `PredictiveSpendingChart.tsx` (ML-based predictions), `AnomalyAlerts.tsx` (anomaly detection). No federated learning or advanced ML pipeline.                |
| Federated learning   | **NOT STARTED** | Needs scale.                                                                                                                                                 |
| Margin finder        | **NOT STARTED** | —                                                                                                                                                            |

### Phase 5: Wealth

| Feature                | Status   | Evidence                                                                                                                                                       |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Investment tracking    | **DONE** | Page + API (online: full CRUD with holdings). `InvestmentAccountModal.tsx`, `HoldingModal.tsx`, `InvestmentCharts.tsx`. Market data: `src/lib/market-data.ts`. |
| Net worth dashboard    | **DONE** | Page + API. `src/lib/financial-engine/net-worth-forecast.ts`. Historical snapshots with time-series visualization.                                             |
| Monte Carlo projection | **DONE** | `src/lib/financial-engine/monte-carlo.ts`. Dedicated calculator page.                                                                                          |
| FIRE calculator        | **DONE** | `src/lib/financial-engine/fire.ts`. Dedicated calculator page.                                                                                                 |

### Phases 6-9 — NOT STARTED

Public API, document vault, rules engine, Canadian tax, native mobile, self-hosted Docker, social benchmarking — all untouched.

---

## 5. Features Built Beyond Any Plan

~30-40% of production surface area is undocumented in plans:

| Feature                             | Scope  | Evidence                                                                                                                                                                                                                                  |
| ----------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 14 financial calculators            | Large  | FIRE, net-worth-forecast, Monte Carlo, debt-payoff, inflation, mortgage, retirement, emergency-fund, budget-analyzer, compound-interest, savings-goal, subscription-cost, tax-estimator + hub page                                        |
| Property tracking                   | Medium | CRUD pages + API (online). `property-calculator.ts`.                                                                                                                                                                                      |
| Loan management with amortization   | Medium | 4 pages (hub/new/[id]/[id]/edit). `AmortizationChart.tsx`, `ExtraPaymentCalculator.tsx`, `LoanForm.tsx`.                                                                                                                                  |
| Scenario modeling (what-if)         | Medium | `src/lib/scenarios/scenario-engine.ts`, scenario types. Dedicated page + API.                                                                                                                                                             |
| Paycheck planning                   | Medium | `src/lib/budget/paycheck-planner.ts`. Dedicated page + API.                                                                                                                                                                               |
| Future planning goals               | Medium | Dedicated page + API.                                                                                                                                                                                                                     |
| Friday weekly review                | Small  | Dedicated page.                                                                                                                                                                                                                           |
| Events tracking / event budgets     | Small  | `src/lib/event-budgets/event-budget-engine.ts`. Page + API (online: CRUD with items).                                                                                                                                                     |
| Export to Excel                     | Medium | `src/lib/export/excel/workbook-generator.ts` with **14 Excel sheets** (dashboard, transactions, budgets, categories, accounts, investments, loans, subscriptions, net-worth, monthly-summary, category-analysis, goals, data-dictionary). |
| Budget risk + anomaly detection     | Small  | Online: `api/insights/anomalies`, `budget-risk`, `affordability`. Embedded: `AnomalyAlerts.tsx`, `OverspendingAlerts.tsx`.                                                                                                                |
| Debt payoff planning + strategies   | Medium | Avalanche, Snowball, custom ordering. Calculator + scenario DB + dedicated page.                                                                                                                                                          |
| Onboarding wizard                   | Small  | 8-step wizard (Welcome → Import → Categories → Budget → Bills → Vault → Accessibility → Complete).                                                                                                                                        |
| 100+ bank parser configs            | Large  | `src/lib/parsers/bank-configs.ts` — exceeds plan scope by 10x.                                                                                                                                                                            |
| LAN sync (device-to-device)         | Medium | 6-component QR-based pairing system with encrypted connections.                                                                                                                                                                           |
| Expense splitting (Splitwise-style) | Medium | Full split engine with settlement tracking, person management, balance calculation.                                                                                                                                                       |
| Landing page + marketing            | Medium | 16 components: hero, features, pricing, FAQ, comparison table, social proof, etc.                                                                                                                                                         |
| Multi-profile support               | Small  | `ProfileSelector.tsx`, create/edit/delete dialogs, PIN auth.                                                                                                                                                                              |
| Command palette                     | Small  | Global search, keyboard navigation.                                                                                                                                                                                                       |
| YNAB migration wizard               | Small  | Dedicated import wizard for YNAB users.                                                                                                                                                                                                   |
| ML training interface               | Small  | `train-ml/page.tsx` for model training.                                                                                                                                                                                                   |
| Adaptive learning AI                | Small  | `src/lib/ai/adaptiveLearningPath.ts`, `smartRecommendations.ts`.                                                                                                                                                                          |
| Accessibility features              | Medium | Seniors mode toggle, accessible charts, high-contrast support, keyboard navigation, screen reader support.                                                                                                                                |
| PWA with offline support            | Small  | Service worker, manifest, iOS install banner, offline fallback page.                                                                                                                                                                      |

---

## 6. Plan Document Inventory & Status

### 17 Planning Documents Found

| #   | Document                                     | Location                   | Date            | Stack                                     | Status                                            |
| --- | -------------------------------------------- | -------------------------- | --------------- | ----------------------------------------- | ------------------------------------------------- |
| 1   | `BUDGET_APP_AUTHORITATIVE_PLAN.md`           | `Plans/`                   | 2026-02-05 v2.0 | Offline: Next.js → Online: Vite + Mantine | **STALE** — migration never happened              |
| 2   | `CLAUDE_CODE_EXECUTION_PLAN.md`              | `Plans/`                   | 2026-02-09 v3.0 | Vite + Mantine (full spec)                | **STALE** — companion to #1                       |
| 3   | `BUDGET_APP_ONLINE_VERSION_PLAN_UPDATED.md`  | `Plans/`                   | 2026-02-05      | Vite + Mantine                            | **SUPERSEDED** (already marked)                   |
| 4   | `BUDGET_APP_COMPLETE_IMPLEMENTATION_PLAN.md` | `Plans/`                   | 2026-02-05      | Vite + Mantine                            | **SUPERSEDED** (research ref)                     |
| 5   | `BUDGET_APP_UI_UX_PLAN_2026.md`              | `Plans/`                   | 2026            | Vite + Mantine                            | **SUPERSEDED** (already marked)                   |
| 6   | `UI_UX_CROSS_PLATFORM_ADDENDUM.md`           | `Plans/`                   | 2026            | Vite + Mantine                            | **SUPERSEDED**                                    |
| 7   | `BUDGET_APP_EXPANSION_SECTIONS.md`           | `Plans/`                   | 2026            | Mantine color system                      | **SUPERSEDED**                                    |
| 8   | `PDF_IMPORT_REDESIGN_PLAN.md`                | `Plans/`                   | 2026-02-06      | Framework-agnostic                        | **VALID** — still relevant                        |
| 9   | `OFFLINE_VERSION_UPGRADE_PLAN (1).md`        | `Plans/`                   | 2026            | Next.js + shadcn                          | **PARTIALLY VALID** — correct stack, audit needed |
| 10  | `BUDGET_APP_ONLINE_VERSION_PLAN.md`          | Root                       | —               | Next.js (original)                        | **ARCHIVED**                                      |
| 11  | `BUDGET_APP_COMPLETE_PRD.md`                 | Root                       | 2025-01-02 v2.0 | Next.js + shadcn                          | **PARTIALLY VALID** — correct stack, ~67% done    |
| 12  | `BUDGET_APP_UI_UX_PRD.md`                    | Root                       | 2025-01-02 v1.0 | Next.js + shadcn                          | **PARTIALLY VALID** — audit pending items         |
| 13  | `02-PRD-Budget-App-v1.md`                    | `docs/budget-app-v1-plan/` | —               | Next.js (implied)                         | **REFERENCE** — persona definitions               |
| 14  | `ONLINE_BUDGET_APP_PLAN_COMPARISON.md`       | `docs/research/`           | 2026-02-15      | —                                         | **REFERENCE** — feature flag scan                 |
| 15  | `ONLINE-BUDGET-APP-MASTER-PLAN.md`           | `Online Budget app/docs/`  | 2026-03-01      | React SPA (Vite implied)                  | **STALE** — app built on Next.js                  |
| 16  | `V1-ONLINE-PLAN-AND-MILESTONES.md`           | `Online Budget app/docs/`  | —               | Vite (implied)                            | **STALE**                                         |
| 17  | `FIRST-5-CODING-SESSIONS-PLAN.md`            | `Online Budget app/docs/`  | —               | Vite (implied)                            | **STALE**                                         |

### Key Contradictions

| Contradiction                                               | Reality                                                                 |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| "Migrate to Vite + Mantine" (8 documents)                   | Both apps use Next.js 16 + shadcn/ui                                    |
| "Phase 5 future work" (investments, net worth, Monte Carlo) | Already built in both apps                                              |
| "Split transactions = Phase 6" (PRD)                        | Built and tested, full engine + API                                     |
| "SimpleFIN = not started" (some plans)                      | 5-file subsystem with encrypted credentials                             |
| "No gamification"                                           | 3 components exist (AchievementToast, BadgeGrid, StreakCounter)         |
| "No PBKDF2"                                                 | PBKDF2 with 100K iterations + device fingerprint derivation implemented |
| Plans describe ONE app                                      | TWO apps exist (embedded + online)                                      |
| "AI = Claude SDK" (plans)                                   | Embedded uses OpenAI GPT-4o; Online uses Claude                         |

---

## 7. Recommended Next Steps (Priority Order)

### 1. Rewrite the Authoritative Plan

- Retire all Vite/Mantine migration references
- Document the dual-app architecture (embedded + online)
- Start from "we have two Next.js 16 + shadcn apps with these features"
- Reconcile which features belong to which app
- **Effort**: Documentation task. **Impact**: Unblocks all strategic decisions.

### 2. Complete Cloud Sync Architecture

- Embedded app has no cloud sync (IndexedDB only, LAN sync only)
- Online app has Supabase but no offline-first with conflict resolution
- Need: CRDT/OT-based sync engine, offline queue, conflict UI
- **Effort**: Large. **Impact**: Blocks family sharing, multi-device, and app convergence.

### 3. ~~Multi-Currency Support~~ — DONE (Session 5)

- ~~113 locales but zero currency conversion~~
- FX rate service, Supabase cache, multi-currency aggregation, hardcoded USD elimination — all complete.
- Remaining: Travel mode (stretch goal).

### 4. Decide App Convergence Strategy

- Two apps with overlapping features is unsustainable
- Options: (a) Merge into one app with feature flags, (b) Keep separate with shared engine library, (c) Sunset embedded in favor of online
- **Effort**: Architectural decision. **Impact**: Determines all future development.

### 5. Passkey Authentication (WebAuthn) — NEXT PRIORITY

- PIN auth exists but no FIDO2
- Plans call for SimpleWebAuthn — library selected but not implemented
- OAuth (Google + GitHub) added in Session 7 — WebAuthn is the next auth step
- **Effort**: Medium. **Impact**: Security differentiator, required for premium tier.

### 6. Family Sharing & Collaboration

- Highest-value differentiator vs competitors
- Depends on cloud sync (#2) and encryption key sharing
- Expense splitting exists but is single-user (no household accounts)
- **Effort**: Large. **Impact**: Justifies premium tier revenue.

### 7. Finish PRD Accessibility Items

- 5 pending tasks from PRD (keyboard testing, screen reader testing, form optimization)
- Accessibility infrastructure exists (seniors mode, accessible charts, WCAG components)
- **Effort**: Low. **Impact**: Quality/compliance.

### 8. Plan Document Cleanup

- Archive 10 documents (all Vite/Mantine references)
- Keep 2 as valid (PDF import plan, offline upgrade plan)
- Audit 3 PRDs for completion status
- Keep 2 as research references
- **Effort**: Low. **Impact**: Prevents future confusion.

---

## Appendix A: Complete Route Inventory

### Embedded Budget App — 56 Pages

**Auth & Core (7)**: dashboard, login, signup, forgot-password, reset-password, upgrade, landing

**Core Financial (17)**: accounts, transactions, budgets, categories, subscriptions, investments, loans (hub/new/[id]/[id]/edit), properties (hub/[id]), net-worth, reports, settings, settings/merchant-rules, more

**Planning & Scenarios (6)**: planning/paycheck, planning/retirement, planning/future, debt-payoff, scenarios, events

**Import & Data (4)**: import, ocr, export, splits

**Calculators (14)**: hub, fire, net-worth-forecast, monte-carlo, debt-payoff, inflation, mortgage, retirement, emergency-fund, budget-analyzer, compound-interest, savings-goal, subscription-cost, tax-estimator

**Special (5)**: friday-review, review, onboarding, offline, admin

**Developer (3)**: design-system, debug, train-ml

### Online Budget App — 52 Pages

**Auth (4)**: login, signup, forgot-password, reset-password

**Core (14)**: dashboard, accounts, transactions, budgets, categories, subscriptions, investments, loans (hub/new/[id]/[id]/edit), properties (hub/[id]), net-worth

**Features (13)**: reports, settings, settings/merchant-rules, more, chat, import, ocr, export, splits, scenarios, events, insights, review

**Planning (3)**: paycheck, retirement, future

**Calculators (14)**: hub, fire, net-worth-forecast, monte-carlo, debt-payoff, inflation, mortgage, retirement, emergency-fund, budget-analyzer, compound-interest, savings-goal, subscription-cost, tax-estimator

**Special (3)**: friday-review, onboarding, debt-payoff (standalone page)

**Root (1)**: landing page

### Online Budget App — 60 API Routes

accounts (2), budgets (2), categories (2), transactions (2), loans (3), investments (4), properties (2), events (4), scenarios (2), splits (5), planning/paycheck (2), planning/retirement (2), planning/future (2), merchant-mappings (2), receipts (2), settings (1), reports (1), net-worth (2), debt-payoff (2), user-subscriptions (2), subscription/status (1), chat (1), import (2), insights (4), plaid (3), stripe (2)
