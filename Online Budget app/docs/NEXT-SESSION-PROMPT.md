# Next Session Prompt

Copy and paste this into Claude Code to continue implementation:

---

Continue implementing the Online Budget App feature parity plan. Read the implementation guide at `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md` to see what's done (`[x]`) and what's next (`[ ]`).

**Phases 1 and 2 are complete.**

- Phase 1: i18n infrastructure (next-intl, 113 locales, en.json with 10+ namespaces), sidebar navigation (desktop grouped sidebar, mobile hamburger sheet, mobile bottom tab bar), breadcrumb, page header, string extraction.
- Phase 2: Calculator engines (15 modules, 111 tests), chart infrastructure (lazy recharts), shared calculator components (currency-input, percent-input, results-panel, transparency-panel), formatting utilities (lib/format.ts), 15 calculator pages (hub + 14 calculators), i18n (calculators + duration namespaces, 112 locales).

TypeScript compiles clean, 331/331 tests pass across 35 test files.

**Start Phase 3: Core CRUD Pages.** Accounts, Categories, Settings, Import, Export, Merchant Rules.

**Prerequisites for Phase 3:**
- Run Supabase migration for new tables (imports, import_rows, user_subscriptions, excluded_subscription_merchants, loans, loan_payments)
- This phase requires server functions + API routes + client components

Follow the tasks in the implementation guide starting at Task 3.1.

**Key patterns to follow:**
- Server components fetch from Supabase → pass data as props to client components
- All user-facing strings use `useTranslations()` from `next-intl`
- Financial amounts use MinorAmount (integers in cents) in DB/server, Decimal.js in engine
- Input validation with Zod schemas in `server/schemas/`
- Use existing shadcn/ui components + shadcn/zinc theme
- RLS policies on all new tables

**Key reference files:**
- Implementation guide: `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md`
- Existing server functions: `Online Budget app/online-budget-app/server/`
- Existing API routes: `Online Budget app/online-budget-app/app/api/`
- Offline app pages: `src/app/budget-app/`
- Online engine barrel: `Online Budget app/online-budget-app/engine/index.ts`
- Online en.json: `Online Budget app/online-budget-app/i18n/messages/en.json`
