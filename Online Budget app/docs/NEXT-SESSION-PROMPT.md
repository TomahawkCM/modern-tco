# Next Session Prompt

Copy and paste this into Claude Code to continue implementation:

---

Use your skills and agents to continue implementing the Online Budget App. Read the implementation guide at `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md` — tasks marked `[x]` are done, tasks marked `[ ]` are next.

## Status

**Phases 1–7 are complete** (331/331 tests, clean TypeScript, all pushed to `feature/online-budget-app-v1`). The app has 55+ pages across 7 phases: i18n (next-intl, 113 locales, 36 namespaces), sidebar + mobile nav, 15 calculators, chart infrastructure, core CRUD (accounts, categories, settings, merchant rules, import wizard, export), financial tracking (subscriptions, loans ×4, investments, properties ×2, net worth), reports + planning (4 chart types + PNG/SVG export, future plans, retirement, paycheck, debt payoff), advanced features (scenarios, events, splits, review queue, friday review wizard, OCR receipt scanner), and polish (Cmd+K command palette, mobile FAB, onboarding wizard, more page, forgot/reset password).

**Phase 8 (Bank Sync) is next** — the final phase and only online-exclusive feature.

## What to do

Implement Phase 8 using `superpowers:subagent-driven-development`. Before starting implementation, use an **Explore agent** to research the Plaid Node.js SDK v26+ API (particularly `PlaidApi`, `linkTokenCreate`, `itemPublicTokenExchange`, `transactionsSync`) and the `react-plaid-link` package. Also use the `context7` MCP server (`resolve-library-id` then `get-library-docs`) to pull current Plaid SDK docs. The existing stub is at `integrations/plaid/index.ts` (empty, just a comment).

### Phase 8: Bank Sync (4 tasks)

**Task 8.1 — Plaid integration + migration** (the big one):

- `npm install plaid react-plaid-link`
- Create migration `supabase/migrations/012_connected_banks.sql` with `connected_banks` table (see Master List in implementation guide) + RLS policies
- Add `connected_banks` type definitions to `supabase/database.types.ts`
- Complete `integrations/plaid/index.ts`: `createLinkToken`, `exchangePublicToken`, `syncTransactions`, `getAccounts` — wrapping the Plaid Node SDK
- Create `server/connected-banks.ts`: CRUD for connected_banks table
- Create `server/schemas/connected-banks.ts`: Zod schemas
- Create API routes: `POST /api/plaid/link-token`, `POST /api/plaid/exchange-token`, `POST /api/plaid/sync`
- Create `components/bank-sync/plaid-link-button.tsx` — wraps `usePlaidLink` hook from `react-plaid-link`
- Create `components/bank-sync/sync-status.tsx` — shows last sync time, sync state, manual sync trigger

**Task 8.2 — i18n**: Add `bankSync` namespace to `en.json`, regenerate locales

**Task 8.3 — Integration into accounts page**: Add "Connect Bank" button to `/accounts` using Plaid Link, show sync status on connected accounts, add manual sync trigger

**Task 8.4 — Verify**: `npm run check-types && npm test`, mark Phase 8 done, commit + push

## Workflow

1. Invoke `superpowers:subagent-driven-development` skill
2. Dispatch an **Explore agent** first to research Plaid SDK patterns + `react-plaid-link` usage
3. Use `context7` MCP (`resolve-library-id` → `get-library-docs`) for up-to-date Plaid/react-plaid-link docs
4. Dispatch one **implementation agent per task** with full task text + context
5. After each task: dispatch **spec compliance reviewer**, then **code quality reviewer**
6. Fix any TypeScript errors between tasks
7. After all tasks pass: edit implementation guide to mark `[x]`, commit with `feat(budget): ...`, push

## Patterns to follow

- Server functions: see `server/scenarios.ts`, `server/splits.ts`
- Zod schemas: see `server/schemas/scenarios.ts`
- API routes: see `app/api/scenarios/route.ts`
- Pages: see `app/(app)/scenarios/page.tsx` (server) + `components/scenarios/scenarios-dashboard.tsx` (client)
- All strings via `useTranslations()` / `getTranslations()`, amounts as `amount_minor` (integer cents), shadcn/zinc theme
- Plaid tokens must be encrypted at rest — use the same pattern as `access_token_encrypted` column in the schema

## Key references

| What                           | Where                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------- |
| Full plan + table schemas      | `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md`                 |
| Connected banks SQL schema     | Search "connected_banks" in implementation guide Master List                    |
| Existing Plaid stub            | `integrations/plaid/index.ts` (empty)                                           |
| Existing Salt Edge stub        | `integrations/saltedge/index.ts` (empty)                                        |
| Stripe integration (reference) | `integrations/stripe/index.ts` + `integrations/stripe/client.ts`                |
| Server function pattern        | `server/scenarios.ts`, `server/events.ts`                                       |
| API route pattern              | `app/api/scenarios/route.ts`                                                    |
| Accounts page to modify        | `app/(app)/accounts/page.tsx` + `components/accounts/account-list.tsx`          |
| Database types                 | `supabase/database.types.ts`                                                    |
| Env vars                       | `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` (sandbox/development/production) |

## Environment notes

- Plaid requires env vars: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV=sandbox`
- For development, use Plaid sandbox credentials — the integration should gracefully handle missing env vars (show "Bank sync not configured" message)
- The `access_token_encrypted` column stores Plaid access tokens — implement a simple encryption wrapper or use a placeholder that can be swapped for real encryption later
