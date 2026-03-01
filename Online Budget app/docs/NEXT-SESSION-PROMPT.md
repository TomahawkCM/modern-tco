# Next Session Prompt

Copy and paste this into Claude Code to continue implementation:

---

Continue implementing the Online Budget App feature parity plan. Read the implementation guide at `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md` to see what's done (`[x]`) and what's next (`[ ]`).

**Phases 1, 2, and 3 are complete.**

- Phase 1: i18n infrastructure (next-intl, 113 locales), sidebar navigation, breadcrumb, page header, string extraction.
- Phase 2: Calculator engines (15 modules, 111 tests), chart infrastructure, shared calculator components, 15 calculator pages, formatting utilities.
- Phase 3: Core CRUD pages — Accounts (CRUD + modals), Categories (grouped + overrides), Settings (locale/currency with tabs), Merchant Rules (list/add/delete), Import (4-step wizard with CSV/OFX parsers), Export (date range + CSV/JSON). Server functions, API routes, Zod schemas, import parsers (100+ bank configs), 5 i18n namespaces.

TypeScript compiles clean, 331/331 tests pass across 35 test files.

**Start Phase 4: Financial Tracking.** Subscriptions, Loans, Investments, Properties, Net Worth.

**Prerequisites for Phase 4:**

- Run Supabase migration for new tables (user_subscriptions, excluded_subscription_merchants, loans, loan_payments, investment_accounts, holdings, properties, net_worth_snapshots)
- Server functions + API routes + client components

Follow the tasks in the implementation guide starting at Task 4.1.

**Key reference files:**

- Implementation guide: `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md`
- Existing server functions: `Online Budget app/online-budget-app/server/`
- Existing API routes: `Online Budget app/online-budget-app/app/api/`
- Engine calculators: `Online Budget app/online-budget-app/engine/calculators/`
- Chart infrastructure: `Online Budget app/online-budget-app/components/charts/lazy-charts.tsx`
