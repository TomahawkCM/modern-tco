# Next Session Prompt

Copy and paste this into Claude Code to continue implementation:

---

using the best agents and skills.....Continue implementing the Online Budget App feature parity plan. Read the implementation guide at `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md` to see what's done (`[x]`) and what's next (`[ ]`).

**Phases 1, 2, 3, 4, and 5 are complete.** All i18n infrastructure (next-intl, 113 locales, 24+ namespaces), sidebar navigation (desktop + mobile), 15 calculator pages with chart infrastructure, all core CRUD pages (accounts, categories, settings, merchant rules, import wizard, export), all financial tracking pages (subscriptions, loans x4, investments, properties x2, net worth), and all reports + planning pages (reports with heatmap/trend/sankey/export, future plans, retirement planner, paycheck planner, debt payoff with avalanche/snowball strategies) are done. TypeScript compiles clean, 331/331 tests pass across 35 test files.

**Start Phase 6: Advanced Features.** This phase adds Scenarios, Events, Splits, Reviews, Friday Review, and OCR — 6 new pages total, 5+ new Supabase tables + a storage bucket, new server functions + API routes.

Follow these steps in order:

1. **Task 6.1**: Create migration `supabase/migrations/011_advanced_tables.sql` with tables: `financial_scenarios`, `event_budgets`, `event_budget_items`, `split_persons`, `expense_splits`, `receipts`. Create Supabase Storage bucket `receipt-images`. Add RLS policies for all tables. Table schemas are in the "New Supabase Tables Master List" section of the implementation guide. Also add type definitions to `supabase/database.types.ts`.

2. **Task 6.2**: Create server function files:
   - `server/scenarios.ts` — CRUD for `financial_scenarios`
   - `server/events.ts` — CRUD for `event_budgets` + `event_budget_items`
   - `server/splits.ts` — CRUD for `split_persons` + `expense_splits`
   - `server/receipts.ts` — CRUD for `receipts`, upload to Supabase Storage
   - Create Zod schemas in `server/schemas/` for all new entities

3. **Task 6.3**: Add `scenarios`, `events`, `splits`, `review`, `weeklyRecap`, `ocr` namespaces to `i18n/messages/en.json`. Regenerate locale files.

4. **Task 6.4**: Create 5 pages (server components with client companion components):
   - `app/(app)/scenarios/page.tsx` — what-if financial scenario modeling
   - `app/(app)/events/page.tsx` — event/project budget tracking, CRUD
   - `app/(app)/splits/page.tsx` — expense splitting, balance summary
   - `app/(app)/review/page.tsx` — uncategorized transaction review queue
   - `app/(app)/friday-review/page.tsx` — weekly guided review wizard

5. **Task 6.5**: Create OCR page (lower priority):
   - `npm install tesseract.js`
   - `app/(app)/ocr/page.tsx` — receipt photo upload → client-side Tesseract OCR → create transaction, store receipt in Supabase Storage

6. **Task 6.6**: Verify — `npm run check-types && npm test`, mark tasks done in the guide, commit and push

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
- Existing server functions pattern: `server/transactions.ts`, `server/planning.ts`, `server/reports.ts`
- Existing API route pattern: `app/api/planning/future/route.ts`, `app/api/debt-payoff/route.ts`
- Existing page pattern: `app/(app)/reports/page.tsx` (server) + `components/reports/reports-dashboard.tsx` (client)
- Phase 5 pages for reference: `app/(app)/reports/`, `app/(app)/planning/`, `app/(app)/debt-payoff/`
- Chart infrastructure: `components/charts/lazy-charts.tsx`

After Phase 6, continue with Phase 7 (Polish + Onboarding) if time permits.
