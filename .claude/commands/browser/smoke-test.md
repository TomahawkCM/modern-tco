---
name: smoke-test
description: Use when you need to crawl budget app pages, click every interactive element, and find/fix console errors, broken links, network failures, and UI crashes
---

# Budget App Smoke Test

Crawl budget app pages, click every interactive element, and surface errors. Uses Playwright MCP tools directly.

**Arguments**: `$ARGUMENTS` — optional target URL (default: `http://localhost:3000/budget-app`) and flags
- `--no-fix` — report errors only, do not attempt fixes
- `--depth <n>` — link-follow depth (default: 1)
- `--pages <paths>` — comma-separated paths to test instead of full seed list

## Seed Pages

Default pages to crawl (all under the base URL):

```
/budget-app
/budget-app/transactions
/budget-app/accounts
/budget-app/budgets
/budget-app/reports
/budget-app/settings
/budget-app/import
/budget-app/categories
/budget-app/planning
/budget-app/subscriptions
/budget-app/net-worth
/budget-app/investments
/budget-app/calculators
/budget-app/offline
```

## Phase 1 — Navigate & Discover

For each seed page (or pages from `--pages`):

1. `browser_navigate` to the full URL
2. `browser_snapshot` to get the accessibility tree with element refs
3. Categorize interactive elements from the snapshot:
   - **Buttons** — `[button]`, `[ref=...]` with role=button
   - **Links** — `[link]` elements, note `href` values
   - **Tabs** — `[tab]` elements
   - **Dropdowns** — `[combobox]`, `[select]` elements
   - **Form inputs** — `[textbox]`, `[checkbox]`, `[radio]` elements
4. Record the page URL and element count

## Phase 2 — Click & Monitor

For each clickable element (buttons, tabs, links to same origin) on the current page:

1. `browser_click` on the element ref
2. `browser_console_messages` — capture any new errors/warnings since last check
3. `browser_network_requests` — check for any 4xx/5xx responses
4. `browser_snapshot` — verify the page didn't crash:
   - Empty or near-empty accessibility tree = crash
   - Check for error boundary text ("Something went wrong", "Error", etc.)
5. Recover state:
   - If the click navigated away: `browser_navigate_back` or re-navigate to the original page URL
   - If a modal/dialog opened: look for close button and click it
   - If a dropdown opened: click elsewhere to dismiss

**Skip rules:**
- External links (different origin) — log but don't click
- Download links (`[download]` attribute) — skip
- Destructive buttons with text like "Delete", "Remove", "Reset" — skip and log as skipped

## Phase 3 — Follow Internal Links

Depth-controlled crawl (default depth=1, configurable via `--depth`):

1. From each seed page's snapshot, extract all internal `/budget-app/*` hrefs
2. Deduplicate against already-visited URLs (track a `visitedUrls` set)
3. For each new internal URL:
   - Navigate to it
   - Run Phase 2 (click & monitor) on that page
   - If depth allows, extract its links for the next level
4. Continue until depth limit reached or no new URLs found

## Phase 4 — Report

After all pages are tested, compile a structured error report grouped by:

### Error Categories

| Category | What to look for |
|----------|-----------------|
| **Console errors** | `Error`, `TypeError`, `ReferenceError`, `SyntaxError` in console messages |
| **Unhandled rejections** | `Unhandled promise rejection` in console |
| **Network failures** | HTTP 4xx/5xx responses from `browser_network_requests` |
| **Hydration errors** | Next.js hydration mismatch warnings/errors |
| **Click failures** | Elements that couldn't be clicked (not interactable, detached) |
| **Page crashes** | Empty snapshot after navigation or click |
| **Missing pages** | 404 responses when navigating to seed URLs |

### Report Format

```
## Smoke Test Results

### Summary
- Pages tested: N
- Elements clicked: N
- Errors found: N
- Warnings: N

### Errors by Page

#### /budget-app/transactions
- [Console Error] TypeError: Cannot read property 'map' of undefined
  - Source: src/components/budget/TransactionList.tsx:42
- [Network 500] POST /api/budget/transactions
  - Response: Internal Server Error

#### /budget-app/accounts
- [Click Failure] "Add Account" button — element detached from DOM
  - Ref: button[ref=23]

### Skipped Elements
- /budget-app/settings: "Delete Account" button (destructive)
- /budget-app/transactions: "Export CSV" link (download)
```

## Phase 5 — Fix (default on)

**Skip this phase if `--no-fix` flag is present.**

For each error found:

1. Identify the source file from the error message or stack trace
2. Read the relevant source file using the `Read` tool
3. Analyze the root cause:
   - Null/undefined access → add null checks or fix data flow
   - Missing imports → add the import
   - Hydration mismatch → fix server/client rendering differences
   - API errors → check the API route handler
   - Click failures → check component lifecycle/rendering
4. Apply the fix using the `Edit` tool
5. Re-test the affected page:
   - `browser_navigate` back to the page
   - `browser_click` on the previously failing element
   - `browser_console_messages` to confirm error is gone
6. Log the fix applied and verification result

After all fixes:
- `browser_close` to clean up the browser session

## State Management

Maintain these throughout the test:

```
visitedUrls: Set<string>     — URLs already fully tested
errorLog: Array<ErrorEntry>  — all errors collected
clickCount: number           — total elements clicked
pageCount: number            — total pages tested
fixesApplied: Array<Fix>     — fixes made (Phase 5)
```

## Error Recovery

If a page is completely broken (crashes, infinite loading):
1. Log the error
2. `browser_navigate` to the next seed page — don't get stuck
3. Continue testing remaining pages

If the browser session dies:
1. Re-navigate to the last URL being tested
2. Continue from where you left off
