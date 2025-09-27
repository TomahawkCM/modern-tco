
# Test Strategy & Commands – Modern TCO LMS

## Scope
- Unit: core logic (exam scoring, question transforms, wrappers)
- Integration: cross-context effects (Practice/Mock update ProgressContext)
- E2E: key user flows (Quick Drill, Mock start/finish, Review)

## Commands
```
# Unit/Integration
npm run lint
npm run typecheck
npm run test

# E2E (Playwright)
# Use your existing playwright scripts or
npx playwright test tests/e2e/practice-quick-drill.spec.ts
npx playwright test tests/e2e/mock-finish.spec.ts
```

## E2E Guidance
- For CI stability, keep selectors semantic (getByRole, getByText)
- Avoid long chains; assert key UI states
- Use query params to start flows (e.g., Quick Drill)

## Test Data
- Questions come from Supabase `public.questions`. Ensure `.env.local` is set.
- For E2E, you can start the dev server or let Playwright config do it.

## Coverage Goals
- Unit: ≥ 80% in exam logic and transforms
- Integration: practice/mock completion update analytics
- E2E: happy paths for practice, mock, and review
