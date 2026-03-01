# Next Session Prompt

Copy and paste this into Claude Code to continue implementation:

---

Use your skills and agents to continue implementing the Online Budget App. Read the implementation guide at `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md` — tasks marked `[x]` are done, tasks marked `[ ]` are next.

## Status

**Phases 1–7 are complete.** The app has: i18n (next-intl, 113 locales, 36 namespaces), sidebar + mobile nav, 15 calculator pages, chart infrastructure (recharts lazy-loaded + spending heatmap, trend chart, Sankey diagram), core CRUD (accounts, categories, settings, merchant rules, import wizard, export), financial tracking (subscriptions, loans ×4, investments, properties ×2, net worth), reports + planning (reports with 4 chart types + PNG/SVG export, future plans, retirement planner, paycheck planner, debt payoff with avalanche/snowball), advanced features (scenarios, events, splits, review queue, friday review wizard, OCR receipt scanner with tesseract.js), and polish (Cmd+K command palette, mobile FAB, onboarding wizard, more page, forgot/reset password). TypeScript compiles clean, 331/331 tests pass across 35 test files.

## What to do

**Implement Phase 8 (Bank Sync — Online-Exclusive).** This is the final phase. Use subagent-driven development.

### Phase 8: Bank Sync (4 tasks)

1. **Task 8.1** — Implement Plaid integration: complete `integrations/plaid/index.ts`, `npm install plaid`, API routes for link-token/exchange-token/sync, Plaid Link UI component, sync status component, `connected_banks` table migration
2. **Task 8.2** — i18n: Add `bankSync` namespace to `en.json`, regenerate locales
3. **Task 8.3** — Integrate into accounts page: "Connect Bank" button, sync status on connected accounts, manual sync trigger
4. **Task 8.4** — Verify: all translated, `npm run check-types && npm test`, commit + push

## Workflow

- Use `superpowers:subagent-driven-development` skill — one implementation agent per task, spec review after each
- After each task completes, edit the implementation guide to mark items `[x]`
- After phase verification passes, commit with `feat(budget): ...` and push
- Follow existing patterns — read Phase 6/7 files as reference
- All strings via `useTranslations()` / `getTranslations()`, amounts as `amount_minor` (integer cents), shadcn/zinc theme

## Key references

| What                      | Where                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Full plan + table schemas | `Online Budget app/docs/FEATURE-PARITY-IMPLEMENTATION-GUIDE.md`                          |
| Server function pattern   | `server/scenarios.ts`, `server/planning.ts`                                              |
| API route pattern         | `app/api/scenarios/route.ts`, `app/api/events/route.ts`                                  |
| Page pattern (server)     | `app/(app)/scenarios/page.tsx`, `app/(app)/events/page.tsx`                              |
| Page pattern (client)     | `components/scenarios/scenarios-dashboard.tsx`, `components/events/events-dashboard.tsx` |
| Zod schemas               | `server/schemas/scenarios.ts`, `server/schemas/events.ts`                                |
| Existing Plaid stub       | `integrations/plaid/index.ts`                                                            |
| Offline reference         | `src/app/budget-app/` (for UX reference)                                                 |
