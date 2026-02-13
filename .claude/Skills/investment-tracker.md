---
name: investment-tracker
description: Use when implementing portfolio tracking, investment holdings display, performance tracking, or wealth management features.
---

# Investment Tracker

## Overview

Implements investment portfolio tracking — holdings, asset allocation, performance metrics, and cost basis tracking. Supports Plaid Investments API for auto-sync, manual entry, crypto, and real estate. Multi-currency with historical performance tracking.

## When to Use

- Building portfolio holdings display
- Implementing asset allocation charts
- Adding performance tracking (daily/monthly/YTD/all-time)
- Integrating Plaid Investments API
- Supporting crypto and real estate tracking
- Implementing cost basis and gain/loss calculations

## Core Principles

- **Decimal.js for all values** — Financial math never uses floating point
- **Manual + auto-sync** — Support both manual entry and Plaid Investments
- **Multi-currency** — Investments may be in different currencies
- **Historical tracking** — Record daily/weekly snapshots for performance charts
- **Cost basis** — Track purchase price for gain/loss calculations
- **Not financial advice** — Display data, don't make recommendations

## Workflow

### Step 1: Investment Data Model

```ts
interface InvestmentHolding {
  id: string;
  accountId: string;
  symbol: string;            // Ticker symbol or "REAL_ESTATE", "CRYPTO_BTC"
  name: string;
  type: InvestmentType;
  quantity: string;          // Decimal string
  costBasis: string;        // Total cost basis (Decimal string)
  currentPrice: string;     // Per-unit current price
  currentValue: string;     // quantity × currentPrice
  currency: string;
  lastUpdated: string;
  isManual: boolean;
  plaidSecurityId?: string;
}

type InvestmentType =
  | 'stock' | 'etf' | 'mutual-fund' | 'bond'
  | 'crypto' | 'real-estate' | 'vehicle'
  | 'cash-equivalent' | 'other';

interface InvestmentAccount {
  id: string;
  name: string;
  institution: string;
  type: 'brokerage' | 'retirement' | 'crypto-exchange' | 'real-estate' | 'manual';
  holdings: InvestmentHolding[];
  totalValue: string;
  isLinked: boolean;
  plaidItemId?: string;
}
```

### Step 2: Asset Allocation

```ts
function calculateAssetAllocation(holdings: InvestmentHolding[]): AssetAllocation[] {
  const totalValue = holdings.reduce(
    (sum, h) => sum.plus(new Decimal(h.currentValue)),
    new Decimal(0)
  );

  const byType = new Map<InvestmentType, Decimal>();
  for (const holding of holdings) {
    const current = byType.get(holding.type) || new Decimal(0);
    byType.set(holding.type, current.plus(new Decimal(holding.currentValue)));
  }

  return Array.from(byType.entries()).map(([type, value]) => ({
    type,
    value: value.toDecimalPlaces(2).toString(),
    percentage: totalValue.isZero()
      ? '0'
      : value.div(totalValue).times(100).toDecimalPlaces(1).toString(),
  }));
}
```

### Step 3: Performance Tracking

```ts
interface PerformanceSnapshot {
  date: string;
  totalValue: string;
  totalCostBasis: string;
  dailyChange: string;
  dailyChangePercent: string;
}

function calculatePerformance(
  snapshots: PerformanceSnapshot[],
  period: 'day' | 'week' | 'month' | 'ytd' | 'year' | 'all'
): PerformanceMetrics {
  const now = snapshots[snapshots.length - 1];
  const start = getStartSnapshot(snapshots, period);

  const startValue = new Decimal(start.totalValue);
  const endValue = new Decimal(now.totalValue);
  const change = endValue.minus(startValue);
  const changePercent = startValue.isZero()
    ? new Decimal(0)
    : change.div(startValue).times(100);

  return {
    startValue: startValue.toString(),
    endValue: endValue.toString(),
    absoluteChange: change.toDecimalPlaces(2).toString(),
    percentChange: changePercent.toDecimalPlaces(2).toString(),
    isPositive: change.gte(0),
  };
}
```

### Step 4: Plaid Investments Integration

```ts
// Server-side: Fetch investment holdings from Plaid
async function fetchPlaidInvestments(accessToken: string) {
  const response = await plaidClient.investmentsHoldingsGet({
    access_token: accessToken,
  });

  return response.data.holdings.map(holding => ({
    symbol: response.data.securities.find(
      s => s.security_id === holding.security_id
    )?.ticker_symbol || 'UNKNOWN',
    name: response.data.securities.find(
      s => s.security_id === holding.security_id
    )?.name || '',
    quantity: holding.quantity.toString(),
    costBasis: holding.cost_basis?.toString() || '0',
    currentValue: holding.institution_value?.toString() || '0',
    currentPrice: holding.institution_price?.toString() || '0',
  }));
}
```

### Step 5: Gain/Loss Calculation

```ts
function calculateGainLoss(holding: InvestmentHolding): GainLoss {
  const currentValue = new Decimal(holding.currentValue);
  const costBasis = new Decimal(holding.costBasis);
  const gainLoss = currentValue.minus(costBasis);
  const gainLossPercent = costBasis.isZero()
    ? new Decimal(0)
    : gainLoss.div(costBasis).times(100);

  return {
    amount: gainLoss.toDecimalPlaces(2).toString(),
    percentage: gainLossPercent.toDecimalPlaces(2).toString(),
    isGain: gainLoss.gte(0),
  };
}
```

## Key Files

| File | Role |
|------|------|
| `src/components/budget/` | Investment UI components |
| `src/lib/analytics/` | Performance calculation logic |
| `src/lib/encryption/` | Encrypted investment data storage |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using floats for portfolio values | Decimal.js for all investment math |
| Not handling zero cost basis | Guard against division by zero in gain/loss |
| Ignoring currency conversion | Convert all holdings to base currency for totals |
| Not disclaiming financial advice | Add "for informational purposes only" disclaimer |
| Daily snapshots too frequent for storage | Weekly snapshots, interpolate for daily chart |

## Validation Checklist

- [ ] All financial math uses Decimal.js
- [ ] Asset allocation percentages sum to 100%
- [ ] Performance calculations handle zero-value edge cases
- [ ] Multi-currency support with conversion
- [ ] Cost basis tracked for gain/loss
- [ ] Investment data encrypted at rest
- [ ] "Not financial advice" disclaimer displayed

## Related Skills

- `plaid-integration` — Plaid Investments API
- `net-worth-dashboard` — investments in net worth calculation
- `financial-calculator` — shared Decimal.js patterns
- `e2e-encryption` — encrypted investment data
