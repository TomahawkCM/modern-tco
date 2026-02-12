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
**i18n**: 113 locales in `src/i18n/messages/` (next-intl)

## Code Style

- TypeScript strict mode; avoid `any` where possible
- shadcn/ui + Radix UI for components; `class-variance-authority` for variants
- Tailwind CSS for styling; `tailwind-merge` + `clsx` for conditional classes
- Import order: React/Next → external libraries → local modules
- All user-facing strings must use `useTranslations` from `next-intl`
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
| vercel | Vercel deployment & project management |

## Detailed Docs

| File | Contents |
| ---- | -------- |
| `.claude/AGENTS.md` | Agent patterns, shadcn context, budget import pipeline |
| `.claude/TOOLS.md` | MCP servers, tool selection, browser automation |
| `.claude/WORKFLOWS.md` | Archon tasks, Docker usage, pre-approved commands |
| `docs/BUDGET_APP_FEATURES.md` | Budget app feature documentation |
| `docs/PRIVACY.md` | Privacy and encryption documentation |
