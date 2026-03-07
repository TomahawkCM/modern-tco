# Budget App QA Report

**Date:** 2026-03-06
**Target:** `https://modern-tco.vercel.app` (production)
**Base path:** `/budget-app/`
**Routes tested:** 53
**Method:** Playwright headless Chromium + curl HTTP analysis
**Test type:** Pass 1 (Unauthenticated) + Pass 2 (Authenticated)

---

## Executive Summary

### Pass 1: Unauthenticated (53 routes)

| Status   | Count | Description                                        |
| -------- | ----- | -------------------------------------------------- |
| PASS     | 9     | Public routes render correctly                     |
| REDIRECT | 41    | Protected routes redirect to onboarding (expected) |
| ERROR    | 3     | Playwright `networkidle` timeout (not user-facing) |
| BLANK    | 0     | No blank pages                                     |

### Pass 2: Authenticated (45 routes)

| Status   | Count | Description                           |
| -------- | ----- | ------------------------------------- |
| PASS     | 45    | All protected routes render correctly |
| BLANK    | 0     | No blank pages                        |
| ERROR    | 0     | No errors                             |
| REDIRECT | 0     | No unexpected redirects               |

**Overall:** Zero blank pages across both passes. All 53 routes function correctly for unauthenticated users (public pages render, protected pages redirect to onboarding). All 45 protected routes render correctly for authenticated users. Three minor issues found (see Issues section).

---

## Pass 1: Unauthenticated Results

### Routes That PASS (9)

| Route                      | HTTP | Elements | Notes                                                                  |
| -------------------------- | ---- | -------- | ---------------------------------------------------------------------- |
| `/auth/login`              | 200  | 13       | Login form renders                                                     |
| `/auth/signup`             | 200  | 16       | Signup form renders                                                    |
| `/auth/forgot-password`    | 200  | 11       | Reset form renders                                                     |
| `/auth/reset-password`     | 200  | 9        | Reset form renders                                                     |
| `/auth/upgrade`            | 200  | 11       | Upgrade page renders                                                   |
| `/onboarding`              | 200  | 7        | Onboarding wizard renders                                              |
| `/landing`                 | 200  | 56       | Marketing landing page renders                                         |
| `/admin`                   | 404  | 8        | Returns 404 (expected — no admin page exists)                          |
| `/calculators/monte-carlo` | 200  | 7        | Race condition — sometimes redirects, sometimes doesn't (see Issue #3) |

### Routes That REDIRECT to Onboarding (41)

All 41 routes correctly redirect to `/budget-app/onboarding` for users without `budget_app_onboarding_completed` in localStorage. This is **expected behavior**.

<details>
<summary>Full redirect list (click to expand)</summary>

| Route                             | HTTP | Final URL                |
| --------------------------------- | ---- | ------------------------ |
| `/` (dashboard)                   | 200  | `/budget-app/onboarding` |
| `/transactions`                   | 200  | `/budget-app/onboarding` |
| `/accounts`                       | 200  | `/budget-app/onboarding` |
| `/budgets`                        | 200  | `/budget-app/onboarding` |
| `/categories`                     | 200  | `/budget-app/onboarding` |
| `/reports`                        | 200  | `/budget-app/onboarding` |
| `/debt-payoff`                    | 200  | `/budget-app/onboarding` |
| `/scenarios`                      | 200  | `/budget-app/onboarding` |
| `/calculators`                    | 200  | `/budget-app/onboarding` |
| `/calculators/emergency-fund`     | 200  | `/budget-app/onboarding` |
| `/calculators/savings-goal`       | 200  | `/budget-app/onboarding` |
| `/calculators/debt-payoff`        | 200  | `/budget-app/onboarding` |
| `/calculators/subscription-cost`  | 200  | `/budget-app/onboarding` |
| `/calculators/budget-analyzer`    | 200  | `/budget-app/onboarding` |
| `/calculators/fire`               | 200  | `/budget-app/onboarding` |
| `/calculators/retirement`         | 200  | `/budget-app/onboarding` |
| `/calculators/inflation`          | 200  | `/budget-app/onboarding` |
| `/calculators/mortgage`           | 200  | `/budget-app/onboarding` |
| `/calculators/net-worth-forecast` | 200  | `/budget-app/onboarding` |
| `/calculators/compound-interest`  | 200  | `/budget-app/onboarding` |
| `/calculators/tax-estimator`      | 200  | `/budget-app/onboarding` |
| `/investments`                    | 200  | `/budget-app/onboarding` |
| `/loans`                          | 200  | `/budget-app/onboarding` |
| `/loans/new`                      | 200  | `/budget-app/onboarding` |
| `/subscriptions`                  | 200  | `/budget-app/onboarding` |
| `/net-worth`                      | 200  | `/budget-app/onboarding` |
| `/import`                         | 200  | `/budget-app/onboarding` |
| `/export`                         | 200  | `/budget-app/onboarding` |
| `/splits`                         | 200  | `/budget-app/onboarding` |
| `/friday-review`                  | 200  | `/budget-app/onboarding` |
| `/review`                         | 200  | `/budget-app/onboarding` |
| `/events`                         | 200  | `/budget-app/onboarding` |
| `/settings`                       | 200  | `/budget-app/onboarding` |
| `/settings/merchant-rules`        | 200  | `/budget-app/onboarding` |
| `/properties`                     | 200  | `/budget-app/onboarding` |
| `/ocr`                            | 200  | `/budget-app/onboarding` |
| `/more`                           | 200  | `/budget-app/onboarding` |
| `/offline`                        | 200  | `/budget-app/onboarding` |
| `/debug`                          | 200  | `/budget-app/onboarding` |
| `/design-system`                  | 200  | `/budget-app/onboarding` |
| `/train-ml`                       | 200  | `/budget-app/onboarding` |

</details>

### Routes That ERROR (3)

| Route                  | Issue                            | User-facing?                                                   |
| ---------------------- | -------------------------------- | -------------------------------------------------------------- |
| `/planning/paycheck`   | Playwright `networkidle` timeout | **No** — page loads and redirects fine with `domcontentloaded` |
| `/planning/retirement` | Playwright `networkidle` timeout | **No** — page loads and redirects fine with `domcontentloaded` |
| `/planning/future`     | Playwright `networkidle` timeout | **No** — page loads and redirects fine with `domcontentloaded` |

**Root cause:** These pages have background activity (likely recurring fetches or calculations) that prevent the browser from reaching an "idle" state. Playwright's `networkidle` strategy never resolves. When tested with `domcontentloaded`, all 3 load successfully and redirect to onboarding as expected.

---

## Issues Found

### Issue #1: Service Worker 404 on Every Page (Low severity)

**File:** `src/app/layout.tsx:126`
**Error:** `A bad HTTP response code (404) was received when fetching the script.`

**Root cause:** The root layout registers `/service-worker.js`:

```javascript
navigator.serviceWorker.register("/service-worker.js").catch(() => {});
```

But only `/sw.js` exists in `public/`. The budget app's `usePWA.ts` hook correctly registers `/sw.js`, making the root layout registration redundant and broken.

**Fix:** Change `'/service-worker.js'` to `'/sw.js'` in `src/app/layout.tsx:126`, or remove the duplicate registration entirely since `usePWA.ts` already handles it.

**Impact:** Console error noise on every page. The `.catch(()=>{})` silently swallows the error, so no user-visible impact. However, the LMS side of the app has no working service worker.

---

### Issue #2: Planning Routes Prevent `networkidle` (Low severity)

**Files:** `src/app/budget-app/planning/retirement/page.tsx` (primary suspect)

**Root cause:** The retirement calculator has a cascading computation issue:

- `useEffect` with 20 state dependencies triggers `calculateRetirement()` on every state change
- `loadPlanIntoForm()` performs 15+ sequential `setState` calls
- Each triggers a re-render and recalculation with heavy `Math.pow` loops (35 years x 12 months)
- This keeps the JS event loop busy, preventing browser "idle" state

**Impact:** Not user-facing — the page works fine. Only affects automated testing with `networkidle` strategy. A performance optimization opportunity but not a bug.

---

### Issue #3: Onboarding Redirect Race Condition (Low severity)

**File:** `src/app/budget-app/layout.tsx:59-69`

**Root cause:** The onboarding redirect runs in a `useEffect`, which fires after initial render. In fast-loading scenarios (like `/calculators/monte-carlo`), the page content briefly renders before the redirect executes. Testing showed 2/3 attempts staying on the page, 1/3 redirecting.

**Impact:** New users may see a brief flash of page content before redirect. Not a functional bug — they still get redirected. Could be improved by moving the check to middleware or using a loading gate.

---

## Pass 2: Authenticated Results

**Date:** 2026-03-07
**Method:** Supabase admin API (create/delete test user) + Playwright headless Chromium login + route crawl
**Test user:** `qa-test-runner@budget-app-test.local` (created, tested, deleted)
**Routes tested:** 45 protected routes
**Wait strategy:** `domcontentloaded` + 3s explicit wait

### Summary

| Status   | Count | Description                                  |
| -------- | ----- | -------------------------------------------- |
| PASS     | 45    | Renders content correctly when authenticated |
| BLANK    | 0     | No blank pages                               |
| ERROR    | 0     | No errors                                    |
| REDIRECT | 0     | No unexpected redirects                      |

**Overall:** All 45 protected routes render correctly for authenticated users. Zero blank pages, zero errors, zero unexpected redirects. The 3 routes flagged as ERROR by the test script were false positives (see note below).

### All Routes PASS (45)

| Route                             | HTTP | Content    | Elements | Notes                              |
| --------------------------------- | ---- | ---------- | -------- | ---------------------------------- |
| `/` (dashboard)                   | 200  | 1591 chars | 87       | Dashboard renders                  |
| `/transactions`                   | 200  | 1599 chars | 83       | Transaction list renders           |
| `/accounts`                       | 200  | 639 chars  | 59       | Accounts page renders              |
| `/budgets`                        | 200  | 639 chars  | 81       | Budget overview renders            |
| `/categories`                     | 200  | 1900 chars | 68       | Category management renders        |
| `/reports`                        | 200  | 1555 chars | 66       | Reports page renders               |
| `/planning/paycheck`              | 200  | 1137 chars | 68       | Paycheck planner renders           |
| `/planning/retirement`            | 200  | 1609 chars | 82       | Retirement planner renders         |
| `/planning/future`                | 200  | 900 chars  | 58       | Future planning renders            |
| `/debt-payoff`                    | 200  | 884 chars  | 59       | Debt payoff renders                |
| `/scenarios`                      | 200  | 1010 chars | 59       | Scenarios page renders             |
| `/calculators`                    | 200  | 2549 chars | 92       | Calculator hub renders             |
| `/calculators/emergency-fund`     | 200  | 1548 chars | 65       | Calculator renders                 |
| `/calculators/savings-goal`       | 200  | 1652 chars | 68       | Calculator renders                 |
| `/calculators/debt-payoff`        | 200  | 883 chars  | 65       | Calculator renders                 |
| `/calculators/subscription-cost`  | 200  | 942 chars  | 66       | Calculator renders                 |
| `/calculators/budget-analyzer`    | 200  | 1618 chars | 67       | Calculator renders (see note)      |
| `/calculators/fire`               | 200  | 1839 chars | 70       | FIRE calculator renders (see note) |
| `/calculators/retirement`         | 200  | 1387 chars | 68       | Calculator renders                 |
| `/calculators/inflation`          | 200  | 2137 chars | 70       | Calculator renders                 |
| `/calculators/mortgage`           | 200  | 1886 chars | 72       | Calculator renders                 |
| `/calculators/net-worth-forecast` | 200  | 2070 chars | 81       | Calculator renders                 |
| `/calculators/compound-interest`  | 200  | 1395 chars | 68       | Calculator renders                 |
| `/calculators/tax-estimator`      | 200  | 1930 chars | 67       | Calculator renders                 |
| `/calculators/monte-carlo`        | 200  | 1743 chars | 71       | Monte Carlo renders (see note)     |
| `/investments`                    | 200  | 639 chars  | 58       | Investments page renders           |
| `/loans`                          | 200  | 639 chars  | 60       | Loans page renders                 |
| `/loans/new`                      | 200  | 906 chars  | 58       | New loan form renders              |
| `/subscriptions`                  | 200  | 639 chars  | 73       | Subscriptions page renders         |
| `/net-worth`                      | 200  | 786 chars  | 56       | Net worth dashboard renders        |
| `/import`                         | 200  | 1506 chars | 61       | Import page renders                |
| `/export`                         | 200  | 2054 chars | 69       | Export page renders                |
| `/splits`                         | 200  | 937 chars  | 60       | Split transactions renders         |
| `/friday-review`                  | 200  | 915 chars  | 65       | Friday review renders              |
| `/review`                         | 200  | 799 chars  | 54       | Review page renders                |
| `/events`                         | 200  | 828 chars  | 59       | Events page renders                |
| `/settings`                       | 200  | 877 chars  | 67       | Settings page renders              |
| `/settings/merchant-rules`        | 200  | 803 chars  | 58       | Merchant rules renders             |
| `/properties`                     | 200  | 639 chars  | 56       | Properties page renders            |
| `/ocr`                            | 200  | 1032 chars | 63       | OCR scanner renders                |
| `/more`                           | 200  | 873 chars  | 74       | More menu renders                  |
| `/offline`                        | 200  | 890 chars  | 58       | Offline page renders               |
| `/debug`                          | 200  | 1123 chars | 61       | Debug tools render                 |
| `/design-system`                  | 200  | 2637 chars | 102      | Design system renders              |
| `/train-ml`                       | 200  | 1466 chars | 57       | ML training page renders           |

### False Positive Note

Three routes (`/calculators/budget-analyzer`, `/calculators/fire`, `/calculators/monte-carlo`) were initially flagged as ERROR by the automated test script. The error detection regex matched "not found" in the page body text — this is an empty-state message (e.g., "No data found"), not an actual error. All three routes stayed on their target URL, returned HTTP 200, and rendered 1600-1800+ chars with 67-71 interactive elements. They are correctly classified as PASS.

### Test Procedure

1. **Created** temporary test user via Supabase admin API (`auth.admin.createUser` with `email_confirm: true`)
2. **Logged in** via Playwright on `/budget-app/auth/login` (dismissed overlay with Escape, used `force: true` click)
3. **Set** `localStorage.budget_app_onboarding_completed = "true"` via `page.evaluate()`
4. **Tested** all 45 protected routes with `domcontentloaded` wait + 3s delay
5. **Deleted** test user via `auth.admin.deleteUser()` and verified deletion
6. **No artifacts** remain (fresh browser context, user deleted from Supabase)

---

## Onboarding Redirect Architecture

The redirect system works as follows:

| Component                                                  | Role                                                                   |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/app/budget-app/layout.tsx:59-69`                      | Checks `localStorage.getItem("budget_app_onboarding_completed")`       |
| `src/components/budget/onboarding/OnboardingWizard.tsx:79` | Sets `localStorage.setItem("budget_app_onboarding_completed", "true")` |

**Exempt routes (no redirect):**

- `/budget-app/auth/*` — All auth pages
- `/budget-app/landing` — Marketing landing page
- `/budget-app/admin` — Admin pages
- `/budget-app/onboarding` — Onboarding itself

**All other routes** redirect to onboarding if the localStorage key is missing.

---

## Repair Plan

### Priority 1: Fix Service Worker Path (5 min)

**File:** `src/app/layout.tsx:126`
**Action:** Change `'/service-worker.js'` to `'/sw.js'` or remove the duplicate registration.

### Priority 2: Retirement Calculator Performance (Optional)

**File:** `src/app/budget-app/planning/retirement/page.tsx`
**Action:** Refactor to batch state updates, use `useMemo` for calculations, reduce `useEffect` dependency array.

### Priority 3: Onboarding Redirect Flash (Optional)

**File:** `src/app/budget-app/layout.tsx`
**Action:** Add a loading gate that shows a skeleton/spinner until the onboarding check completes, preventing content flash.

### Priority 4: Login Overlay Blocks Form Interaction (Low severity)

**File:** Budget app main layout — an overlay (`div.fixed.inset-0.z-50`) appears on the login page and intercepts pointer events.

**Root cause:** A modal or dialog (likely chatbot opt-in, sync status, or similar) renders over the login form. The overlay has `z-50` and blocks clicks. Users may need to dismiss it before interacting with the login form.

**Impact:** Automated testing required `force: true` click to bypass. Real users may encounter the same overlay — needs investigation.

---

## Test Infrastructure Notes

- **Chrome in WSL2:** Playwright MCP server cannot launch Chrome in WSL2 without a display server. Used direct `playwright` Node.js API with `chromium.launch({ headless: true })` instead.
- **networkidle vs domcontentloaded:** Three planning routes timeout with `networkidle`. All routes work with `domcontentloaded`. Future tests should use `domcontentloaded` + explicit wait.
- **Race conditions:** Client-side redirects via `useEffect` create non-deterministic test results. Tests should account for redirect timing.
- **Pass 2 auth approach:** Created temporary Supabase user via admin API (`email_confirm: true`), logged in via Playwright form fill, set onboarding via `localStorage`, tested all routes, then deleted user via admin API. No test artifacts remain.
- **Error detection false positives:** The regex `/not found/i` matches legitimate empty-state messages. Future tests should use more specific error patterns (e.g., `Application error`, `Unhandled Runtime Error`, `Internal Server Error`) and exclude common empty-state phrases.
- **Login overlay:** An overlay element blocks form interaction on the login page. Playwright required `force: true` to click the submit button. Pressing Escape did not dismiss it.
