---
paths:
  - "tests/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
---

# Testing Rules

- Unit tests: Vitest + Testing Library + jsdom environment
- E2E tests: Playwright with `@playwright/test`
- Use `fake-indexeddb` for any test that touches IndexedDB / Dexie
- Visual regression tests use screenshot comparison via `npm run browser:visual-test`
- E2E tests require `BASE_URL` env var (e.g., `BASE_URL=http://localhost:3000 npm run e2e`)
- Test data: use fixtures in `tests/fixtures/` — never hardcode test data inline
- Mock external APIs (Supabase, OpenAI, Anthropic) — never make real API calls in tests
- Playwright config: `tests/e2e/playwright.config.ts`
- Vitest config: `vitest.config.ts` (root)
- Run `npm test` for unit tests, `npm run e2e` for e2e tests
