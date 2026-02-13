---
name: net-worth-dashboard
description: Use when building net worth tracking, asset/liability management, historical trends, or wealth milestone celebrations.
---

# Net Worth Dashboard

## Overview

Implements net worth tracking — assets (cash, investments, property, vehicles) minus liabilities (mortgage, loans, credit cards). Supports both manual entry and Plaid-linked accounts, historical tracking, trend visualization, and milestone celebrations.

## When to Use

- Building net worth calculation and display
- Adding asset or liability account types
- Implementing historical net worth tracking
- Creating net worth trend charts
- Celebrating net worth milestones
- Integrating Plaid-linked account balances

## Core Principles

- **Assets - Liabilities = Net Worth** — Simple formula, complex tracking
- **Manual + linked** — Support both manual balance entry and auto-synced accounts
- **Monthly snapshots** — Record net worth monthly for trend tracking
- **Multi-currency** — Support assets in different currencies with conversion
- **Milestone celebrations** — Celebrate crossing $0 (debt-free), first $10K, $100K, etc.

## Workflow

### Step 1: Account Data Model

```ts
interface NetWorthAccount {
  id: string;
  name: string;
  type: AccountType;
  category: AssetCategory | LiabilityCategory;
  balance: string;          // Decimal string (positive for assets, positive for liabilities)
  currency: string;
  isLinked: boolean;         // Plaid-linked or manual
  plaidItemId?: string;
  lastUpdated: string;
  includeInNetWorth: boolean;
}

type AssetCategory = 'cash' | 'investments' | 'property' | 'vehicles' | 'crypto' | 'other-assets';
type LiabilityCategory = 'mortgage' | 'student-loans' | 'auto-loans' | 'credit-cards' | 'personal-loans' | 'other-liabilities';
type AccountType = 'asset' | 'liability';
```

### Step 2: Net Worth Calculation

```ts
import Decimal from 'decimal.js';

function calculateNetWorth(accounts: NetWorthAccount[]): NetWorthSummary {
  const activeAccounts = accounts.filter(a => a.includeInNetWorth);

  const totalAssets = activeAccounts
    .filter(a => a.type === 'asset')
    .reduce((sum, a) => sum.plus(new Decimal(a.balance)), new Decimal(0));

  const totalLiabilities = activeAccounts
    .filter(a => a.type === 'liability')
    .reduce((sum, a) => sum.plus(new Decimal(a.balance)), new Decimal(0));

  const netWorth = totalAssets.minus(totalLiabilities);

  return {
    netWorth: netWorth.toDecimalPlaces(2).toString(),
    totalAssets: totalAssets.toDecimalPlaces(2).toString(),
    totalLiabilities: totalLiabilities.toDecimalPlaces(2).toString(),
    assetBreakdown: calculateBreakdown(activeAccounts.filter(a => a.type === 'asset')),
    liabilityBreakdown: calculateBreakdown(activeAccounts.filter(a => a.type === 'liability')),
  };
}
```

### Step 3: Monthly Snapshot Tracking

```ts
interface NetWorthSnapshot {
  date: string;           // YYYY-MM format
  netWorth: string;
  totalAssets: string;
  totalLiabilities: string;
  accounts: { id: string; balance: string }[];
}

async function recordMonthlySnapshot(accounts: NetWorthAccount[]): Promise<void> {
  const summary = calculateNetWorth(accounts);
  const snapshot: NetWorthSnapshot = {
    date: new Date().toISOString().slice(0, 7), // YYYY-MM
    netWorth: summary.netWorth,
    totalAssets: summary.totalAssets,
    totalLiabilities: summary.totalLiabilities,
    accounts: accounts.map(a => ({ id: a.id, balance: a.balance })),
  };

  // Store encrypted
  await EncryptedDB.put('net-worth-snapshots', snapshot.date, snapshot);
}
```

### Step 4: Trend Chart

```tsx
function NetWorthTrendChart({ snapshots }: { snapshots: NetWorthSnapshot[] }) {
  const chartData = snapshots.map(s => ({
    month: s.date,
    netWorth: parseFloat(s.netWorth),
    assets: parseFloat(s.totalAssets),
    liabilities: -parseFloat(s.totalLiabilities), // Negative for stacked display
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Worth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart data={chartData} height={300}>
          <Line dataKey="assets" stroke="#10b981" name="Assets" />
          <Line dataKey="liabilities" stroke="#ef4444" name="Liabilities" />
          <Line dataKey="netWorth" stroke="#3b82f6" name="Net Worth" strokeWidth={2} />
        </LineChart>
      </CardContent>
    </Card>
  );
}
```

### Step 5: Milestone Celebrations

```ts
const NET_WORTH_MILESTONES = [
  { amount: 0, name: 'Debt Free!', emoji: '🎉' },
  { amount: 1000, name: 'First $1,000', emoji: '💰' },
  { amount: 10000, name: '$10,000 Club', emoji: '🏆' },
  { amount: 25000, name: '$25,000 Milestone', emoji: '⭐' },
  { amount: 50000, name: 'Half-Way to $100K', emoji: '🚀' },
  { amount: 100000, name: 'Six Figures!', emoji: '👑' },
  { amount: 250000, name: 'Quarter Million', emoji: '💎' },
  { amount: 500000, name: 'Half Million', emoji: '🌟' },
  { amount: 1000000, name: 'Millionaire!', emoji: '🎯' },
];

function checkMilestones(
  previousNetWorth: string,
  currentNetWorth: string
): Milestone | null {
  const prev = new Decimal(previousNetWorth);
  const curr = new Decimal(currentNetWorth);

  for (const milestone of NET_WORTH_MILESTONES) {
    const target = new Decimal(milestone.amount);
    if (prev.lt(target) && curr.gte(target)) {
      return milestone;
    }
  }
  return null;
}
```

## Key Files

| File | Role |
|------|------|
| `src/components/budget/` | Net worth UI components |
| `src/lib/encryption/` | Encrypted storage for snapshots |
| `src/lib/analytics/` | Net worth calculation logic |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using floats for net worth math | Use Decimal.js for all calculations |
| Not recording monthly snapshots | Auto-record on first visit each month |
| Ignoring multi-currency accounts | Convert to base currency for totals |
| Mixing up liability sign conventions | Liabilities are positive numbers subtracted from assets |
| Chart data not sorted by date | Always sort snapshots chronologically |

## Validation Checklist

- [ ] Net worth = assets - liabilities (exact Decimal math)
- [ ] Monthly snapshots recorded automatically
- [ ] All financial data stored encrypted
- [ ] Trend chart shows assets, liabilities, and net worth lines
- [ ] Milestones celebrated when crossed
- [ ] Manual and linked accounts both supported
- [ ] Multi-currency conversion handled

## Related Skills

- `financial-calculator` — Decimal.js patterns
- `investment-tracker` — investment account balances
- `plaid-integration` — linked account balance sync
- `gamification-engine` — milestone celebrations
- `dashboard-builder` — net worth widget
