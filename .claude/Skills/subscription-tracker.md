---
name: subscription-tracker
description: Use when building subscription detection, recurring cost analysis, cancellation guides, or renewal alert features.
---

# Subscription Tracker

## Overview

Detects and tracks recurring transactions — subscriptions, memberships, and recurring bills. Normalizes frequencies (weekly->monthly->annual), calculates true cost, identifies essential vs. non-essential, and generates cancellation guidance. Uses pattern detection on transaction history.

## When to Use

- Detecting recurring transactions from transaction history
- Building subscription management UI
- Calculating monthly/annual subscription costs
- Generating cancellation guides or links
- Setting up renewal alerts
- Identifying potential savings from unused subscriptions

## Core Principles

- **Detection from data** — Infer subscriptions from transaction patterns, don't require manual entry
- **Frequency normalization** — Convert all subscriptions to monthly cost for comparison
- **Essential vs. non-essential** — Help users distinguish needs from wants
- **Actionable** — Provide cancellation links and steps, not just data
- **Privacy** — All detection runs client-side on decrypted transaction data

## Workflow

### Step 1: Recurring Transaction Detection

```ts
import Decimal from 'decimal.js';

interface RecurringPattern {
  merchant: string;
  amount: string;          // Decimal string
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
  confidence: number;      // 0-1
  lastDate: string;        // ISO date
  nextExpectedDate: string;
  transactionIds: string[];
  category: string;
}

function detectRecurringTransactions(
  transactions: Transaction[],
  lookbackMonths: number = 6
): RecurringPattern[] {
  // Group by merchant (fuzzy match)
  const merchantGroups = groupByMerchant(transactions);
  const patterns: RecurringPattern[] = [];

  for (const [merchant, txns] of Object.entries(merchantGroups)) {
    if (txns.length < 2) continue;

    // Sort by date
    const sorted = txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate intervals between transactions
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      const daysDiff = Math.round(
        (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / 86400000
      );
      intervals.push(daysDiff);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const frequency = classifyFrequency(avgInterval);

    if (frequency && isConsistentAmount(sorted)) {
      patterns.push({
        merchant,
        amount: sorted[sorted.length - 1].amount,
        frequency,
        confidence: calculatePatternConfidence(intervals, sorted),
        lastDate: sorted[sorted.length - 1].date,
        nextExpectedDate: predictNextDate(sorted[sorted.length - 1].date, frequency),
        transactionIds: sorted.map(t => t.id),
        category: sorted[sorted.length - 1].category || 'uncategorized',
      });
    }
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}

function classifyFrequency(avgDays: number): RecurringPattern['frequency'] | null {
  if (avgDays >= 5 && avgDays <= 9) return 'weekly';
  if (avgDays >= 12 && avgDays <= 16) return 'biweekly';
  if (avgDays >= 26 && avgDays <= 35) return 'monthly';
  if (avgDays >= 85 && avgDays <= 100) return 'quarterly';
  if (avgDays >= 350 && avgDays <= 380) return 'annual';
  return null;
}
```

### Step 2: Frequency Normalization

```ts
function normalizeToMonthly(amount: string, frequency: string): string {
  const amt = new Decimal(amount).abs();
  switch (frequency) {
    case 'weekly': return amt.times(52).div(12).toDecimalPlaces(2).toString();
    case 'biweekly': return amt.times(26).div(12).toDecimalPlaces(2).toString();
    case 'monthly': return amt.toDecimalPlaces(2).toString();
    case 'quarterly': return amt.div(3).toDecimalPlaces(2).toString();
    case 'annual': return amt.div(12).toDecimalPlaces(2).toString();
    default: return amt.toString();
  }
}

function calculateAnnualCost(subscriptions: RecurringPattern[]): string {
  return subscriptions.reduce((total, sub) => {
    const monthly = new Decimal(normalizeToMonthly(sub.amount, sub.frequency));
    return total.plus(monthly.times(12));
  }, new Decimal(0)).toDecimalPlaces(2).toString();
}
```

### Step 3: Essential vs. Non-Essential

```ts
const ESSENTIAL_CATEGORIES = ['housing', 'utilities', 'insurance', 'healthcare', 'debt-payment'];
const NON_ESSENTIAL_CATEGORIES = ['entertainment', 'streaming', 'gaming', 'shopping', 'dining'];

function classifySubscription(sub: RecurringPattern): 'essential' | 'non-essential' | 'unknown' {
  if (ESSENTIAL_CATEGORIES.includes(sub.category)) return 'essential';
  if (NON_ESSENTIAL_CATEGORIES.includes(sub.category)) return 'non-essential';
  return 'unknown';
}
```

### Step 4: Subscription Dashboard UI

```tsx
function SubscriptionDashboard({ subscriptions }: Props) {
  const totalMonthly = subscriptions.reduce(
    (sum, s) => sum.plus(new Decimal(normalizeToMonthly(s.amount, s.frequency))),
    new Decimal(0)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">Monthly Subscriptions</p>
            <p className="text-3xl font-bold">{formatCurrency(totalMonthly.toString())}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Annual Cost</p>
            <p className="text-xl font-semibold">{formatCurrency(totalMonthly.times(12).toString())}</p>
          </div>
        </CardContent>
      </Card>

      {subscriptions.map(sub => (
        <SubscriptionCard key={sub.merchant} subscription={sub} />
      ))}
    </div>
  );
}
```

### Step 5: Renewal Alerts

```ts
function getUpcomingRenewals(
  subscriptions: RecurringPattern[],
  daysAhead: number = 7
): RecurringPattern[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 86400000);

  return subscriptions.filter(sub => {
    const nextDate = new Date(sub.nextExpectedDate);
    return nextDate >= now && nextDate <= cutoff;
  });
}
```

## Key Files

| File | Role |
|------|------|
| `src/lib/analytics/recurring-detector.ts` | Recurring transaction detection |
| `src/components/budget/` | Subscription UI components |
| `src/lib/analytics/` | Analytics and pattern detection |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Requiring manual subscription entry | Auto-detect from transaction patterns |
| Not normalizing frequencies for comparison | Always convert to monthly for display |
| Ignoring amount variations (price increases) | Allow +-10% variation in amount matching |
| Annual subscriptions missed | Need >=12 months of data or detect from amount |
| Not showing annual cost | Always show both monthly and annual totals |

## Validation Checklist

- [ ] Detection runs on client-side decrypted data
- [ ] Frequency classification handles all common intervals
- [ ] Monthly normalization calculates correctly
- [ ] Annual cost total matches sum of normalized monthly x 12
- [ ] Essential vs. non-essential classification works
- [ ] Renewal alerts show for next 7 days
- [ ] User can override/correct detected subscriptions
- [ ] All amounts use Decimal.js

## Related Skills

- `rules-engine` — auto-categorize subscription transactions
- `financial-calculator` — cost analysis calculations
- `net-worth-dashboard` — recurring costs in net worth view
