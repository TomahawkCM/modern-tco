# Session 5: Engine Integration Skeleton — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Money module and Aggregation module in the unified financial engine, wire them to a dashboard page that displays total income vs expenses, and verify all financial math lives exclusively in `engine/`.

**Architecture:** Pure computation modules with zero dependencies on DB/API/env. Money module handles minor-unit integer arithmetic with currency safety. Aggregation module splits transactions by sign and computes totals. Dashboard server component fetches from Supabase and passes data through engine functions. All math is deterministic and testable with Vitest.

**Tech Stack:** TypeScript strict mode, Vitest (unit testing), Next.js 16 App Router (dashboard page), Supabase (data source).

---

## Context for Implementer

- **Project root:** `/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app/`
- **Engine root:** `engine/` — already has skeleton files (index.ts, version.ts, money/index.ts, aggregation/index.ts, etc.) with documentation headers but no implementation.
- **Engine version:** Currently `0.0.1` in `engine/version.ts`. Will bump to `0.1.0` after adding computation logic.
- **Minor units:** All money stored as bigint in DB, typed as `number` in TypeScript. 1 USD = 100 minor units. No floating point for storage.
- **Currency:** ISO 4217 codes as `string`. Engine MUST enforce same-currency operations — cannot add USD + EUR.
- **No dependencies on:** Supabase, Stripe, Plaid, Salt Edge, AI providers. Engine is pure computation.
- **Parent project pattern:** Uses `decimal.js` for floating-point precision. Online engine uses integer minor units, so basic add/subtract are exact. `decimal.js` NOT needed for V1 engine (no division/multiplication on money amounts yet).
- **Testing:** No vitest in project yet. Must install and configure.
- **Build:** Must pass `npx tsc --noEmit` and `npm run build` (next build --webpack).
- **CRITICAL RULE:** All financial math MUST live in `engine/`. No math in pages, components, API routes, or lib/.

---

## Task 1: Install and Configure Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

**Step 1: Install vitest and dependencies**

```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npm install -D vitest
```

**Step 2: Create vitest.config.ts**

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
```

**Step 3: Add test script to package.json**

Add to scripts: `"test": "vitest run"` and `"test:watch": "vitest"`

**Step 4: Verify vitest works**

```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run 2>&1
```

Expected: "No test files found" (we haven't written tests yet) or similar non-error output.

**Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "feat(engine): install vitest and add test configuration"
```

---

## Task 2: Implement Money Module — Types

**Files:**
- Create: `engine/money/types.ts`

**Step 1: Create types**

Create `engine/money/types.ts`:

```typescript
/**
 * Represents a monetary amount in minor units (e.g., cents).
 *
 * - amountMinor: Integer value in smallest currency unit (100 = $1.00)
 * - currency: ISO 4217 code (e.g., "USD", "EUR", "GBP")
 */
export interface MinorAmount {
  readonly amountMinor: number;
  readonly currency: string;
}
```

**Step 2: Commit**

```bash
git add engine/money/types.ts
git commit -m "feat(engine): add MinorAmount type to money module"
```

---

## Task 3: Implement Money Module — Operations + Tests (TDD)

**Files:**
- Create: `engine/money/operations.ts`
- Create: `engine/money/operations.test.ts`
- Modify: `engine/money/index.ts`

**Step 1: Write failing tests**

Create `engine/money/operations.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  addMinor,
  subtractMinor,
  sumMinor,
  toMajorUnits,
  formatMoney,
  minorAmount,
} from "./operations";

describe("minorAmount", () => {
  it("creates a MinorAmount", () => {
    const m = minorAmount(1500, "USD");
    expect(m.amountMinor).toBe(1500);
    expect(m.currency).toBe("USD");
  });
});

describe("addMinor", () => {
  it("adds two same-currency amounts", () => {
    const a = minorAmount(1000, "USD");
    const b = minorAmount(500, "USD");
    const result = addMinor(a, b);
    expect(result.amountMinor).toBe(1500);
    expect(result.currency).toBe("USD");
  });

  it("throws on currency mismatch", () => {
    const a = minorAmount(1000, "USD");
    const b = minorAmount(500, "EUR");
    expect(() => addMinor(a, b)).toThrow("Currency mismatch");
  });
});

describe("subtractMinor", () => {
  it("subtracts two same-currency amounts", () => {
    const a = minorAmount(1000, "USD");
    const b = minorAmount(300, "USD");
    const result = subtractMinor(a, b);
    expect(result.amountMinor).toBe(700);
    expect(result.currency).toBe("USD");
  });

  it("allows negative results", () => {
    const a = minorAmount(100, "USD");
    const b = minorAmount(500, "USD");
    const result = subtractMinor(a, b);
    expect(result.amountMinor).toBe(-400);
  });

  it("throws on currency mismatch", () => {
    const a = minorAmount(1000, "USD");
    const b = minorAmount(500, "GBP");
    expect(() => subtractMinor(a, b)).toThrow("Currency mismatch");
  });
});

describe("sumMinor", () => {
  it("sums an array of same-currency amounts", () => {
    const amounts = [
      minorAmount(100, "USD"),
      minorAmount(200, "USD"),
      minorAmount(300, "USD"),
    ];
    const result = sumMinor(amounts, "USD");
    expect(result.amountMinor).toBe(600);
    expect(result.currency).toBe("USD");
  });

  it("returns zero for empty array", () => {
    const result = sumMinor([], "USD");
    expect(result.amountMinor).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("throws if any amount has wrong currency", () => {
    const amounts = [
      minorAmount(100, "USD"),
      minorAmount(200, "EUR"),
    ];
    expect(() => sumMinor(amounts, "USD")).toThrow("Currency mismatch");
  });
});

describe("toMajorUnits", () => {
  it("converts minor to major units", () => {
    expect(toMajorUnits(1500)).toBe(15.0);
  });

  it("handles zero", () => {
    expect(toMajorUnits(0)).toBe(0);
  });

  it("handles negative amounts", () => {
    expect(toMajorUnits(-350)).toBe(-3.5);
  });
});

describe("formatMoney", () => {
  it("formats USD amount", () => {
    const result = formatMoney(minorAmount(1500, "USD"));
    expect(result).toContain("15");
  });

  it("formats zero", () => {
    const result = formatMoney(minorAmount(0, "USD"));
    expect(result).toContain("0");
  });

  it("formats negative amount", () => {
    const result = formatMoney(minorAmount(-1500, "USD"));
    expect(result).toContain("15");
  });
});
```

**Step 2: Run tests (should fail)**

```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run engine/money/operations.test.ts
```

Expected: FAIL (operations.ts doesn't exist yet)

**Step 3: Implement operations**

Create `engine/money/operations.ts`:

```typescript
import type { MinorAmount } from "./types";

export function minorAmount(amountMinor: number, currency: string): MinorAmount {
  return { amountMinor, currency };
}

export function addMinor(a: MinorAmount, b: MinorAmount): MinorAmount {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function subtractMinor(a: MinorAmount, b: MinorAmount): MinorAmount {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return { amountMinor: a.amountMinor - b.amountMinor, currency: a.currency };
}

export function sumMinor(amounts: MinorAmount[], currency: string): MinorAmount {
  let total = 0;
  for (const amt of amounts) {
    if (amt.currency !== currency) {
      throw new Error(`Currency mismatch: expected ${currency}, got ${amt.currency}`);
    }
    total += amt.amountMinor;
  }
  return { amountMinor: total, currency };
}

export function toMajorUnits(amountMinor: number, decimals: number = 2): number {
  return amountMinor / Math.pow(10, decimals);
}

export function formatMoney(
  amount: MinorAmount,
  locale: string = "en-US"
): string {
  const major = toMajorUnits(amount.amountMinor);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: amount.currency,
  }).format(major);
}
```

**Step 4: Run tests (should pass)**

```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run engine/money/operations.test.ts
```

Expected: All tests PASS.

**Step 5: Update money/index.ts barrel export**

Replace `engine/money/index.ts`:

```typescript
/**
 * Money Module — ISO 4217 currency handling
 *
 * Responsibilities:
 * - ISO 4217 currency codes
 * - Minor unit integer storage
 * - Deterministic rounding rules
 */

export type { MinorAmount } from "./types";
export {
  minorAmount,
  addMinor,
  subtractMinor,
  sumMinor,
  toMajorUnits,
  formatMoney,
} from "./operations";
```

**Step 6: Commit**

```bash
git add engine/money/
git commit -m "feat(engine): implement money module with minor-unit operations"
```

---

## Task 4: Implement Aggregation Module — Types + Logic + Tests (TDD)

**Files:**
- Create: `engine/aggregation/types.ts`
- Create: `engine/aggregation/income-expense.ts`
- Create: `engine/aggregation/income-expense.test.ts`
- Modify: `engine/aggregation/index.ts`

**Step 1: Create aggregation types**

Create `engine/aggregation/types.ts`:

```typescript
import type { MinorAmount } from "../money/types";

/**
 * Minimal transaction shape needed for aggregation.
 * Positive amountMinor = income, negative = expense.
 */
export interface TransactionForAggregation {
  readonly amountMinor: number;
  readonly currency: string;
}

/**
 * Result of income vs expense aggregation.
 */
export interface IncomeExpenseSummary {
  readonly totalIncome: MinorAmount;
  readonly totalExpense: MinorAmount;
  readonly net: MinorAmount;
  readonly transactionCount: number;
}
```

**Step 2: Write failing tests**

Create `engine/aggregation/income-expense.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { aggregateIncomeExpense } from "./income-expense";
import type { TransactionForAggregation } from "./types";

describe("aggregateIncomeExpense", () => {
  it("separates income and expense", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: 500000, currency: "USD" },  // +5000.00 income
      { amountMinor: -15000, currency: "USD" },   // -150.00 expense
      { amountMinor: -8000, currency: "USD" },    // -80.00 expense
      { amountMinor: 200000, currency: "USD" },   // +2000.00 income
    ];

    const result = aggregateIncomeExpense(txns, "USD");

    expect(result.totalIncome.amountMinor).toBe(700000);
    expect(result.totalExpense.amountMinor).toBe(-23000);
    expect(result.net.amountMinor).toBe(677000);
    expect(result.transactionCount).toBe(4);
  });

  it("handles empty transactions", () => {
    const result = aggregateIncomeExpense([], "USD");

    expect(result.totalIncome.amountMinor).toBe(0);
    expect(result.totalExpense.amountMinor).toBe(0);
    expect(result.net.amountMinor).toBe(0);
    expect(result.transactionCount).toBe(0);
  });

  it("handles income only", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: 100000, currency: "USD" },
      { amountMinor: 200000, currency: "USD" },
    ];

    const result = aggregateIncomeExpense(txns, "USD");

    expect(result.totalIncome.amountMinor).toBe(300000);
    expect(result.totalExpense.amountMinor).toBe(0);
    expect(result.net.amountMinor).toBe(300000);
  });

  it("handles expenses only", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: -5000, currency: "USD" },
      { amountMinor: -3000, currency: "USD" },
    ];

    const result = aggregateIncomeExpense(txns, "USD");

    expect(result.totalIncome.amountMinor).toBe(0);
    expect(result.totalExpense.amountMinor).toBe(-8000);
    expect(result.net.amountMinor).toBe(-8000);
  });

  it("throws on currency mismatch", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: 1000, currency: "USD" },
      { amountMinor: -500, currency: "EUR" },
    ];

    expect(() => aggregateIncomeExpense(txns, "USD")).toThrow("Currency mismatch");
  });

  it("treats zero as income (non-negative)", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: 0, currency: "USD" },
    ];

    const result = aggregateIncomeExpense(txns, "USD");
    expect(result.totalIncome.amountMinor).toBe(0);
    expect(result.totalExpense.amountMinor).toBe(0);
    expect(result.transactionCount).toBe(1);
  });

  it("preserves currency in result", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: 1000, currency: "EUR" },
    ];

    const result = aggregateIncomeExpense(txns, "EUR");
    expect(result.totalIncome.currency).toBe("EUR");
    expect(result.totalExpense.currency).toBe("EUR");
    expect(result.net.currency).toBe("EUR");
  });
});
```

**Step 3: Run tests (should fail)**

```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run engine/aggregation/income-expense.test.ts
```

Expected: FAIL.

**Step 4: Implement aggregation logic**

Create `engine/aggregation/income-expense.ts`:

```typescript
import type { MinorAmount } from "../money/types";
import type { TransactionForAggregation, IncomeExpenseSummary } from "./types";

export function aggregateIncomeExpense(
  transactions: TransactionForAggregation[],
  currency: string
): IncomeExpenseSummary {
  let income = 0;
  let expense = 0;

  for (const txn of transactions) {
    if (txn.currency !== currency) {
      throw new Error(
        `Currency mismatch: expected ${currency}, got ${txn.currency}`
      );
    }

    if (txn.amountMinor >= 0) {
      income += txn.amountMinor;
    } else {
      expense += txn.amountMinor;
    }
  }

  return {
    totalIncome: { amountMinor: income, currency } as MinorAmount,
    totalExpense: { amountMinor: expense, currency } as MinorAmount,
    net: { amountMinor: income + expense, currency } as MinorAmount,
    transactionCount: transactions.length,
  };
}
```

**Step 5: Run tests (should pass)**

```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run engine/aggregation/income-expense.test.ts
```

Expected: All tests PASS.

**Step 6: Update aggregation/index.ts barrel export**

Replace `engine/aggregation/index.ts`:

```typescript
/**
 * Transaction Aggregation Module
 *
 * Responsibilities:
 * - Income vs expense computation
 * - Category totals
 * - Time-window filtering
 */

export type {
  TransactionForAggregation,
  IncomeExpenseSummary,
} from "./types";
export { aggregateIncomeExpense } from "./income-expense";
```

**Step 7: Commit**

```bash
git add engine/aggregation/
git commit -m "feat(engine): implement aggregation module with income/expense totals"
```

---

## Task 5: Update Engine Entry Point and Bump Version

**Files:**
- Modify: `engine/index.ts`
- Modify: `engine/version.ts`

**Step 1: Update engine/index.ts**

Replace `engine/index.ts`:

```typescript
/**
 * Unified Shared Financial Engine — Entry Point
 *
 * This is the single source of financial truth.
 * All financial calculations must live in /engine.
 *
 * Modules:
 * - money/        ISO 4217 currency, minor units, rounding
 * - budgeting/    Monthly category budgets, rollover, progress
 * - aggregation/  Income vs expense, category totals, time windows
 * - goals/        Goal progress, time-to-target estimation
 * - projections/  Forecasting, scenario modeling, FX display conversion
 */
export { ENGINE_VERSION } from "./version";

// Money module
export type { MinorAmount } from "./money";
export {
  minorAmount,
  addMinor,
  subtractMinor,
  sumMinor,
  toMajorUnits,
  formatMoney,
} from "./money";

// Aggregation module
export type {
  TransactionForAggregation,
  IncomeExpenseSummary,
} from "./aggregation";
export { aggregateIncomeExpense } from "./aggregation";
```

**Step 2: Bump version to 0.1.0**

Update `engine/version.ts`:

```typescript
/**
 * Unified Shared Financial Engine — Version
 *
 * All financial calculation logic lives in /engine.
 * No financial math may exist outside this directory.
 *
 * Version must be bumped when calculation logic changes.
 */
export const ENGINE_VERSION = "0.1.0" as const;
```

**Step 3: Run all tests**

```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run
```

Expected: All tests PASS.

**Step 4: Commit**

```bash
git add engine/index.ts engine/version.ts
git commit -m "feat(engine): update entry point exports and bump version to 0.1.0"
```

---

## Task 6: Create Dashboard Page

**Files:**
- Create: `app/dashboard/page.tsx`

The dashboard fetches the user's transactions from Supabase, passes them through the engine's `aggregateIncomeExpense()`, and displays the results. If no transactions exist (migrations not applied yet), it shows zeros gracefully.

**Step 1: Create the dashboard page**

Create `app/dashboard/page.tsx`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSubscription } from "@/lib/subscription";
import {
  aggregateIncomeExpense,
  toMajorUnits,
  ENGINE_VERSION,
} from "@/engine";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscription = await getSubscription();

  // Fetch user settings for currency
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency")
    .eq("user_id", user.id)
    .single();

  const currency = settings?.primary_currency ?? "USD";

  // Fetch transactions for current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]!;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]!;

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount_minor, currency")
    .eq("user_id", user.id)
    .eq("currency", currency)
    .gte("transaction_date", monthStart)
    .lte("transaction_date", monthEnd);

  // Map DB rows to engine input — all math happens in engine
  const engineInput = (transactions ?? []).map((t) => ({
    amountMinor: t.amount_minor,
    currency: t.currency,
  }));

  const summary = aggregateIncomeExpense(engineInput, currency);

  const income = toMajorUnits(summary.totalIncome.amountMinor);
  const expense = toMajorUnits(Math.abs(summary.totalExpense.amountMinor));
  const net = toMajorUnits(summary.net.amountMinor);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>

        {!subscription?.isActive && (
          <p className="text-sm text-amber-600">
            Subscription required for full access
          </p>
        )}

        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-zinc-500">Income</span>
            <span className="text-2xl font-semibold text-green-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(income)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-zinc-500">Expenses</span>
            <span className="text-2xl font-semibold text-red-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(expense)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-zinc-500">Net</span>
            <span
              className={`text-2xl font-semibold ${net >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(net)}
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400">
          {summary.transactionCount} transactions this month
        </p>

        <p className="text-xs text-zinc-300">
          Engine v{ENGINE_VERSION}
        </p>

        <a
          href="/"
          className="rounded border px-4 py-2 text-sm hover:bg-zinc-100"
        >
          Back to Home
        </a>
      </main>
    </div>
  );
}
```

**Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat(engine): add dashboard page wired to engine aggregation"
```

---

## Task 7: Add Dashboard Link to Home Page

**Files:**
- Modify: `app/page.tsx`

**Step 1: Add dashboard link for subscribed users**

Add a "Go to Dashboard" link in the subscription-active section, between the subscription status text and the sign-out button.

```typescript
<a
  href="/dashboard"
  className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
>
  Go to Dashboard
</a>
```

**Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(engine): add dashboard link to home page"
```

---

## Task 8: Run All Tests and Verify Build

**Files:** None — verification only.

**Step 1: Run all engine tests**

```bash
cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run
```

Expected: All tests PASS.

**Step 2: Run type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds. Dashboard should appear in route list.

**Step 4: Verify no math outside engine/**

Search the codebase for any arithmetic on amountMinor or financial calculations outside engine/:

```bash
grep -r "amountMinor\|amount_minor\|balance_minor" --include="*.ts" --include="*.tsx" app/ lib/ components/ server/ integrations/ 2>/dev/null | grep -v "test\." | grep -v "node_modules"
```

Expected: Only data-fetching references (Supabase selects), no arithmetic operations (+, -, *, /).

---

## Task 9: Update PROGRESS_LOG.md

**Files:**
- Modify: `docs/PROGRESS_LOG.md` (at `/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/docs/PROGRESS_LOG.md`)

**Step 1: Append Session 5 entry**

Include:
- Session Objective: Session 5 — Engine Integration Skeleton
- Files created: all new engine files, test files, vitest config, dashboard page
- Files modified: engine/index.ts, engine/version.ts, engine/money/index.ts, engine/aggregation/index.ts, app/page.tsx, package.json
- Architectural decisions: integer minor units (no decimal.js needed), currency safety checks, pure computation pattern
- Financial Engine Impact: Version bumped to v0.1.0, Money + Aggregation modules implemented
- Security & RLS: Dashboard protected by auth redirect, data fetched through RLS
- Known Gaps: No seed data, no budgeting/goals/projections modules yet
- Next: Milestone 1 Governance Checkpoint

**Step 2: Commit**

```bash
git add docs/PROGRESS_LOG.md
git commit -m "docs: update progress log for session 5 (engine integration skeleton)"
```

---

## Summary of Deliverables

| Deliverable | File(s) |
|---|---|
| Vitest configuration | `vitest.config.ts`, `package.json` |
| Money types | `engine/money/types.ts` |
| Money operations | `engine/money/operations.ts` |
| Money tests (6 suites) | `engine/money/operations.test.ts` |
| Money barrel export | `engine/money/index.ts` |
| Aggregation types | `engine/aggregation/types.ts` |
| Aggregation logic | `engine/aggregation/income-expense.ts` |
| Aggregation tests (7 suites) | `engine/aggregation/income-expense.test.ts` |
| Aggregation barrel export | `engine/aggregation/index.ts` |
| Engine entry point | `engine/index.ts` |
| Engine version bump | `engine/version.ts` (0.0.1 -> 0.1.0) |
| Dashboard page | `app/dashboard/page.tsx` |
| Home page link | `app/page.tsx` |
| Progress log | `docs/PROGRESS_LOG.md` |

## Exit Criteria (from FIRST-5-CODING-SESSIONS-PLAN.md)

- [x] Dashboard can display total income vs expenses (via engine aggregateIncomeExpense)
- [x] No math outside engine/ (dashboard only formats engine output for display)
- [x] Engine version file created (bumped to v0.1.0)
