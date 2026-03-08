# Modern Tanium TCO & Budget App

## Build & Dev Commands

```
npm run dev            # Dev server (webpack, 8GB memory via cross-env)
npm run dev:basic      # Dev server (6GB, lighter)
npm run build          # Production build (16GB memory allocation)
npm run lint           # ESLint with project rules
npm run lint:fix       # ESLint autofix
npm run check-types    # TypeScript strict checking (tsc --noEmit)
npm test               # Vitest unit tests
npm run e2e            # Playwright e2e tests
npm run format         # Prettier formatting
npm run prebuild       # Bundle MDX content (runs automatically before build)
```

## Architecture Overview

Dual-app monorepo:

1. **Enterprise LMS** - Tanium TCO certification platform
   - 59 pages in `src/app/` (non-budget paths)
   - 6 MDX course modules (16,849 lines) with spaced repetition, gamification, mock exams

2. **Budget App** - Personal finance management
   - 36 pages in `src/app/budget-app/`
   - 50+ components in `src/components/budget/`
   - Transaction management, bank import (CSV/PDF/OCR), AI merchant matching
   - Financial calculators, reports, encrypted local storage

**Stack**: Next.js 16, React 19, TypeScript 5.9, Supabase PostgreSQL, shadcn/ui + Radix UI, Tailwind CSS
**State**: 18 React contexts in `src/contexts/`
**API**: 22 routes in `src/app/api/`
**i18n**: 114 locales in `src/i18n/messages/` (next-intl)

## Code Style

- TypeScript strict mode; avoid `any` where possible
- shadcn/ui + Radix UI for components; `class-variance-authority` for variants
- Tailwind CSS for styling; `tailwind-merge` + `clsx` for conditional classes
- Import order: React/Next → external libraries → local modules
- All user-facing strings must use `useTranslations` from `next-intl`
- Currency amounts: use `useDefaultCurrency()` hook, never hardcode `"USD"`
- Date formatting: always pass `locale` from `useLocale()` to `.toLocaleDateString(locale)`
- Currency formatting in non-hook contexts: use `formatCurrency(amount, currency, locale)` from `src/i18n/utils/formatCurrency.ts`
- Financial amounts: use `Decimal.js`, never floating point
- Input validation: Zod schemas

## Git Conventions

- Branch naming: `feature/`, `bugfix/`, `chore/`, `docs/`
- Commit format: `type(scope): description` (e.g., `feat(budget): add CSV import`)
- Always create PR for review on non-trivial changes

## Project Quirks

- **MUST** use `--webpack` flag for dev/build (Turbopack not yet compatible)
- `cross-env NODE_OPTIONS=--max-old-space-size=8192` required for dev server
- Budget app data is encrypted at rest — use `encrypted-db-wrapper.ts` for all PII
- MDX content bundled via `npm run prebuild` (runs automatically before `npm run build`)
- Supabase requires `SUPABASE_ACCESS_TOKEN` env var
- PostHog analytics requires `NEXT_PUBLIC_POSTHOG_KEY` env var

## Testing

- **Unit**: `npm test` — Vitest + Testing Library + jsdom
- **E2E**: `npm run e2e` — Playwright (requires `BASE_URL` env var, e.g. `BASE_URL=http://localhost:3000`)
- **Visual**: `npm run browser:visual-test` — screenshot comparison
- Use `fake-indexeddb` for IndexedDB tests
- Test files: `tests/` directory and `**/*.test.{ts,tsx}`

## MCP Servers

| Server | Purpose |
| ------ | ------- |
| shadcn | UI component registry |
| filesystem | File operations |
| sqlite-tanium | Local SQLite database |
| github | GitHub API |
| firecrawl | Web scraping |
| playwright | Browser automation |
| supabase | PostgREST API |
| vibe-check | Error prevention guardrails |
| context7 | Library documentation lookup |
| docker | Container management |
| archon | Project/task management (ID: `9c56f01c-759a-42b1-bad4-06b71f2c4db9`) |
| vercel | Vercel deployments & config — use `vercel` CLI via Bash |
| openclaw | OpenClaw agent & messaging — `openclaw_agent_ask` (ask questions, optionally deliver to Telegram), `openclaw_message_send` (direct channel messages) |

## Skills

### Workflow Skills (superpowers:)

| Trigger | Skill |
|---------|-------|
| Bug, test failure, unexpected behavior | `superpowers:systematic-debugging` |
| Implementing feature or bugfix | `superpowers:test-driven-development` |
| About to claim work is done | `superpowers:verification-before-completion` |
| Multi-step task with spec | `superpowers:writing-plans` |
| Executing a written plan | `superpowers:executing-plans` |
| Creative work, new feature design | `superpowers:brainstorming` |
| 2+ independent parallel tasks | `superpowers:dispatching-parallel-agents` |
| Creating or editing skills | `superpowers:writing-skills` |
| Preparing work for merge/PR | `superpowers:finishing-a-development-branch` |

### Budget App Commands (/budget:)

| Command | When to use |
|---------|-------------|
| `/budget:test-patterns` | Writing tests for encryption, Decimal.js, IndexedDB, i18n |
| `/budget:e2e-encryption` | Any feature touching PII or encrypted data |
| `/budget:error-handling` | Adding error boundaries, API errors, offline recovery |
| `/budget:supabase-patterns` | Database work (RLS, migrations, real-time, edge functions) |
| `/budget:i18n-workflow` | Adding or modifying translations |
| `/budget:db-migration` | Schema changes |
| `/budget:import-pipeline` | Bank statement import work |
| `/budget:design-guide` | Building any UI component |

### Domain Reference Skills (.claude/Skills/)

47 project-specific knowledge docs. Read when working in their domain:

- **Financial**: budget-methods, financial-calculator, rules-engine, canadian-tax
- **Import/OCR**: pdf-ocr-import (852 lines), receipt-scanner
- **Security**: auth-hardening, production-hardening
- **Features**: subscription-tracker, net-worth-dashboard, investment-tracker
- **Platform**: pwa-optimization, mobile-first-ux
- **AI/ML**: tensorflowjs-budget-ml
- **Quality**: code-review-budget, accessibility-audit, localization-qa, performance-budget

> **Roadmap skills** (`.claude/Skills/roadmap/`): 6 aspirational skills with no implementation code yet — plaid-integration, ai-coach, document-vault, family-sharing, real-time-sync, gamification-engine.

## Detailed Docs

| File | Contents |
| ---- | -------- |
| `.claude/AGENTS.md` | Agent patterns, shadcn context, budget import pipeline |
| `.claude/TOOLS.md` | MCP servers, tool selection, browser automation |
| `.claude/WORKFLOWS.md` | Archon tasks, Docker usage, pre-approved commands |
| `.claude/Skills/` | 47 domain-specific reference skills (budget methods, encryption, import, etc.) |
| `docs/BUDGET_APP_FEATURES.md` | Budget app feature documentation |
| `docs/BUDGET_APP_PRD.md` | Consolidated product requirements document |
| `docs/SESSION_TRACKER.md` | Implementation session log (S0-S15+) |
| `docs/PRIVACY.md` | Privacy and encryption documentation |
