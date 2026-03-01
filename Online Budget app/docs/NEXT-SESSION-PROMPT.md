# Next Session Prompt

Copy and paste this into Claude Code to continue implementation:

---

using the best agents and skills.....Continue implementing the Online Budget App feature parity plan. Read the implementation guide at `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md` to see what's done (`[x]`) and what's next (`[ ]`).

**Phases 1, 2, 3, and 4 are complete.** All i18n infrastructure (next-intl, 113 locales, 24 namespaces), sidebar navigation (desktop + mobile), 15 calculator pages with chart infrastructure, all core CRUD pages (accounts, categories, settings, merchant rules, import wizard, export), and all financial tracking pages (subscriptions, loans x4, investments, properties x2, net worth) are done. TypeScript compiles clean, 331/331 tests pass across 35 test files.

**Start Phase 5: Reports + Planning.** This phase adds Reports/analytics, Future Plans, Retirement, Paycheck Planner, and Debt Payoff — 5 new pages total, 4 new Supabase tables, new server functions + API routes, plus advanced chart components (spending heatmap, trend chart, Sankey diagram).

Follow these steps in order:

1. **Task 5.1**: Create migration `supabase/migrations/010_planning_tables.sql` with 4 tables: `future_purchases`, `retirement_plans`, `paycheck_plans`, `debt_scenarios`. Add RLS policies for all tables. Table schemas are in the "New Supabase Tables Master List" section of the implementation guide. Also add type definitions to `supabase/database.types.ts`.

2. **Task 5.2**: Create server function files:
   - `server/reports.ts` — `getMonthlyTotals`, `getCategorySpendingOverTime`
   - `server/planning.ts` — CRUD for `future_purchases`, `retirement_plans`, `paycheck_plans`
   - `server/debt-payoff.ts` — CRUD for `debt_scenarios`, `getDebtPayoffData`
   - Create Zod schemas in `server/schemas/` for all new entities

3. **Task 5.3**: Install dependencies: `npm install html-to-image`

4. **Task 5.4**: Port chart components:
   - `components/charts/spending-heatmap.tsx` — port from offline
   - `components/charts/spending-trend-chart.tsx` — port from offline
   - `components/charts/sankey-diagram.tsx` — port from offline `src/components/charts/SankeyWithAccessibility.tsx`

5. **Task 5.5**: Add `reports`, `planning`, `debtPayoff` namespaces to `i18n/messages/en.json`

6. **Task 5.6**: Create 5 pages (server components with client companion components):
   - `app/(app)/reports/page.tsx` — time range selector, spending by category (PieChart + table), income vs expense trend (LineChart), spending heatmap, Sankey money flow, PNG/SVG export
   - `app/(app)/planning/future/page.tsx` — future purchase goals list, progress bars, CRUD modal
   - `app/(app)/planning/retirement/page.tsx` — retirement plan form + projection chart
   - `app/(app)/planning/paycheck/page.tsx` — paycheck allocation planner, visual breakdown
   - `app/(app)/debt-payoff/page.tsx` — reads loans, strategy configurator (avalanche/snowball), payoff timeline chart, scenario save/load

7. **Task 5.7**: Verify — `npm run check-types && npm test`, mark tasks done in the guide, commit and push

**Key patterns to follow:**

- Server components fetch from Supabase → pass data as props to client components
- Client components call API routes via `fetch()` for mutations (create/update/delete)
- All user-facing strings use `useTranslations()` / `getTranslations()` from `next-intl`
- Financial amounts: `amount_minor` (integer cents) in DB/server, divide by 100 for display
- Charts use lazy-loaded recharts from `components/charts/lazy-charts.tsx`
- Use existing shadcn/ui components (Card, Button, Dialog, Input, Label, Select, Table, Badge, Progress, Tabs)
- Online app uses shadcn/zinc theme, semantic Tailwind colors (`text-foreground`, `bg-card`, `border-border`)
- Zod schemas for all API inputs in `server/schemas/`
- RLS policies on all new tables (4 policies each: select_own, insert_own, update_own, delete_own)

**Key reference files:**

- Implementation guide: `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md` (table schemas in "New Supabase Tables Master List")
- Existing server functions pattern: `server/transactions.ts`, `server/accounts.ts`
- Existing API route pattern: `app/api/transactions/route.ts`, `app/api/accounts/[id]/route.ts`
- Existing page pattern: `app/(app)/accounts/page.tsx` (server) + `components/accounts/account-list.tsx` (client)
- Phase 4 pages for reference: `app/(app)/subscriptions/`, `app/(app)/loans/`, `app/(app)/investments/`, `app/(app)/properties/`, `app/(app)/net-worth/`
- Chart infrastructure: `components/charts/lazy-charts.tsx`
- Offline reference pages: `src/app/budget-app/reports/`, `src/app/budget-app/debt-payoff/`
- Offline charts: `src/components/budget/charts/`, `src/components/charts/SankeyWithAccessibility.tsx`

After Phase 5, continue with Phase 6 (Advanced Features) if time permits.
