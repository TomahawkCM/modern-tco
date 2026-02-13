---
name: budget-methods
description: Use when implementing budget allocation logic, adding new budgeting methodologies, or building envelope/category management features.
---

# Budget Methods

## Overview

Implements multiple budgeting methodologies — zero-based (YNAB-style), envelope budgeting, 50/30/20 rule, and pay-yourself-first. Handles category hierarchies, rollover logic, overspending, and goal tracking. Users can switch between methods or mix approaches.

## When to Use

- Adding a new budgeting methodology
- Implementing category budget allocation
- Building rollover logic (carry forward unspent amounts)
- Handling overspending scenarios
- Creating budget templates or presets
- Implementing goal-based budgeting

## Core Principles

- **Decimal.js for all amounts** — Budget math uses Decimal.js, never floating point
- **Method-agnostic data model** — Same data structure supports all methods
- **Rollover is optional** — User chooses whether unspent rolls forward
- **Overspending flows downhill** — Overspending in one category reduces available-to-budget
- **Category groups** — Categories organized in groups (Needs, Wants, Savings, etc.)

## Workflow

### Step 1: Budget Method Definitions

```ts
type BudgetMethod = 'zero-based' | 'envelope' | '50-30-20' | 'pay-yourself-first';

interface BudgetMethodConfig {
  id: BudgetMethod;
  name: string;
  description: string;
  autoAllocate: (income: Decimal, categories: Category[]) => Allocation[];
  supportsRollover: boolean;
}

const BUDGET_METHODS: Record<BudgetMethod, BudgetMethodConfig> = {
  'zero-based': {
    id: 'zero-based',
    name: 'Zero-Based Budget',
    description: 'Every dollar gets a job. Income minus all categories = $0.',
    autoAllocate: zeroBasedAllocate,
    supportsRollover: true,
  },
  'envelope': {
    id: 'envelope',
    name: 'Envelope Budgeting',
    description: 'Allocate cash into virtual envelopes per category.',
    autoAllocate: envelopeAllocate,
    supportsRollover: true,
  },
  '50-30-20': {
    id: '50-30-20',
    name: '50/30/20 Rule',
    description: '50% needs, 30% wants, 20% savings.',
    autoAllocate: fiftyThirtyTwentyAllocate,
    supportsRollover: false,
  },
  'pay-yourself-first': {
    id: 'pay-yourself-first',
    name: 'Pay Yourself First',
    description: 'Set savings goal first, budget the rest.',
    autoAllocate: payYourselfFirstAllocate,
    supportsRollover: false,
  },
};
```

### Step 2: Category Group Hierarchy

```ts
interface CategoryGroup {
  id: string;
  name: string;
  type: 'needs' | 'wants' | 'savings' | 'debt' | 'income';
  categories: Category[];
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  groupId: string;
  budgeted: string;   // Decimal string
  spent: string;       // Decimal string
  rollover: string;    // Decimal string (from previous month)
  goalAmount?: string; // Target amount
  goalDate?: string;   // Target date
}
```

### Step 3: Zero-Based Allocation

```ts
function zeroBasedAllocate(income: Decimal, categories: Category[]): Allocation[] {
  // In zero-based, user manually allocates every dollar
  // This helper shows what's left to allocate
  const totalBudgeted = categories.reduce(
    (sum, cat) => sum.plus(new Decimal(cat.budgeted)),
    new Decimal(0)
  );
  const remaining = income.minus(totalBudgeted);

  return categories.map(cat => ({
    categoryId: cat.id,
    budgeted: cat.budgeted,
    available: new Decimal(cat.budgeted)
      .plus(new Decimal(cat.rollover))
      .minus(new Decimal(cat.spent))
      .toString(),
  }));
}
```

### Step 4: 50/30/20 Auto-Allocation

```ts
function fiftyThirtyTwentyAllocate(income: Decimal, categories: Category[]): Allocation[] {
  const needs = income.times(0.5);
  const wants = income.times(0.3);
  const savings = income.times(0.2);

  const needsCats = categories.filter(c => c.groupId === 'needs');
  const wantsCats = categories.filter(c => c.groupId === 'wants');
  const savingsCats = categories.filter(c => c.groupId === 'savings');

  return [
    ...distributeEvenly(needsCats, needs),
    ...distributeEvenly(wantsCats, wants),
    ...distributeEvenly(savingsCats, savings),
  ];
}

function distributeEvenly(categories: Category[], total: Decimal): Allocation[] {
  if (categories.length === 0) return [];
  const perCategory = total.div(categories.length).toDecimalPlaces(2);
  return categories.map(cat => ({
    categoryId: cat.id,
    budgeted: perCategory.toString(),
    available: perCategory.minus(new Decimal(cat.spent)).toString(),
  }));
}
```

### Step 5: Rollover Logic

```ts
function calculateRollover(
  previousMonth: MonthData,
  currentMonth: MonthData,
  method: BudgetMethod
): CategoryRollover[] {
  if (!BUDGET_METHODS[method].supportsRollover) {
    return currentMonth.categories.map(c => ({ categoryId: c.id, rollover: '0' }));
  }

  return previousMonth.categories.map(prevCat => {
    const budgeted = new Decimal(prevCat.budgeted);
    const spent = new Decimal(prevCat.spent);
    const prevRollover = new Decimal(prevCat.rollover);
    const available = budgeted.plus(prevRollover).minus(spent);

    // Positive = unspent (rolls forward)
    // Negative = overspent (carried as debt)
    return {
      categoryId: prevCat.id,
      rollover: available.toString(),
    };
  });
}
```

### Step 6: Overspending Handling

```ts
function handleOverspending(categories: Category[], method: BudgetMethod): OverspendResult {
  const overspent = categories.filter(c => {
    const available = new Decimal(c.budgeted)
      .plus(new Decimal(c.rollover))
      .minus(new Decimal(c.spent));
    return available.isNegative();
  });

  if (overspent.length === 0) return { status: 'ok', overspentCategories: [] };

  return {
    status: 'overspent',
    overspentCategories: overspent.map(c => ({
      categoryId: c.id,
      categoryName: c.name,
      overBy: new Decimal(c.spent)
        .minus(new Decimal(c.budgeted))
        .minus(new Decimal(c.rollover))
        .toString(),
    })),
    suggestion: method === 'zero-based'
      ? 'Move money from another category to cover overspending'
      : 'Consider reducing spending in this category next month',
  };
}
```

## Key Files

| File | Role |
|------|------|
| `src/components/budget/` | Budget UI components |
| `src/contexts/` | Budget data context |
| `src/lib/` | Budget calculation logic |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `number` for budget amounts | Use Decimal.js strings throughout |
| Not handling negative rollover | Negative rollover = debt carried forward |
| 50/30/20 allocations don't sum to income | Use `toDecimalPlaces(2)` and adjust last category for rounding |
| Category groups not supporting custom names | Allow user-defined group names, map to types |
| Switching methods loses budget data | Preserve allocations, recalculate based on new method |

## Validation Checklist

- [ ] All budget math uses Decimal.js
- [ ] Zero-based: income minus allocated = $0 (shown to user)
- [ ] 50/30/20: allocations sum to 100% of income
- [ ] Rollover correctly carries forward positive/negative amounts
- [ ] Overspending flagged with helpful message
- [ ] Category groups support user customization
- [ ] Method switching preserves existing allocations

## Related Skills

- `financial-calculator` — shared Decimal.js patterns
- `onboarding-wizard` — method selection during onboarding
- `test-patterns` — testing budget calculation edge cases
