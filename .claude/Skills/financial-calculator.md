---
name: financial-calculator
description: Use when building or modifying any financial calculator — compound interest, loan amortization, retirement planning, or currency conversion. Enforces Decimal.js and locale-aware formatting.
---

# Financial Calculator

## Overview

Standardized patterns for building financial calculators in the budget app. All monetary math uses Decimal.js (never floating point), inputs use locale-aware currency formatting, and results display with proper currency symbols and decimal precision for 72+ supported currencies.

## When to Use

- Building a new financial calculator (compound interest, loan, mortgage, retirement)
- Modifying existing calculator logic
- Adding currency input or output formatting
- Implementing amortization schedules or payment tables
- Any math involving money or percentages

## Core Principles

- **Decimal.js for all math** — Never use native JS `number` for financial calculations
- **Locale-aware formatting** — Use `Intl.NumberFormat` for display, never hardcode `$`
- **Input validation with Zod** — All calculator inputs validated before computation
- **String amounts** — Pass amounts as strings between components (`"1234.56"`, not `1234.56`)
- **Zero-decimal currencies** — Handle JPY, KRW, VND correctly (no decimal places)

## Workflow

### Step 1: Calculator Input Schema

```ts
import { z } from 'zod';
import Decimal from 'decimal.js';

const compoundInterestSchema = z.object({
  principal: z.string().refine(v => !new Decimal(v).isNaN() && new Decimal(v).gte(0), 'Must be a positive number'),
  annualRate: z.string().refine(v => !new Decimal(v).isNaN() && new Decimal(v).gte(0) && new Decimal(v).lte(100), 'Rate must be 0-100%'),
  years: z.number().int().min(1).max(50),
  compoundingFrequency: z.enum(['monthly', 'quarterly', 'annually']),
  monthlyContribution: z.string().optional(),
  currency: z.string().default('USD'),
});
```

### Step 2: Calculator Logic (Decimal.js)

```ts
import Decimal from 'decimal.js';

// Set precision for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

function compoundInterest(params: CompoundInterestInput): CompoundInterestResult {
  const P = new Decimal(params.principal);
  const r = new Decimal(params.annualRate).div(100);
  const n = FREQUENCY_MAP[params.compoundingFrequency]; // 12, 4, or 1
  const t = new Decimal(params.years);
  const PMT = params.monthlyContribution ? new Decimal(params.monthlyContribution) : new Decimal(0);

  // A = P(1 + r/n)^(nt) + PMT × (((1 + r/n)^(nt) - 1) / (r/n))
  const ratePerPeriod = r.div(n);
  const totalPeriods = n.times(t);
  const growthFactor = ratePerPeriod.plus(1).pow(totalPeriods);

  const principalGrowth = P.times(growthFactor);
  const contributionGrowth = PMT.times(
    growthFactor.minus(1).div(ratePerPeriod)
  );

  const futureValue = principalGrowth.plus(contributionGrowth);
  const totalContributed = P.plus(PMT.times(totalPeriods));
  const totalInterest = futureValue.minus(totalContributed);

  return {
    futureValue: futureValue.toDecimalPlaces(2).toString(),
    totalContributed: totalContributed.toDecimalPlaces(2).toString(),
    totalInterest: totalInterest.toDecimalPlaces(2).toString(),
    effectiveRate: r.times(100).toDecimalPlaces(2).toString(),
  };
}

const FREQUENCY_MAP: Record<string, Decimal> = {
  monthly: new Decimal(12),
  quarterly: new Decimal(4),
  annually: new Decimal(1),
};
```

### Step 3: Loan Amortization

```ts
function amortizationSchedule(
  principal: string,
  annualRate: string,
  termMonths: number
): AmortizationRow[] {
  const P = new Decimal(principal);
  const monthlyRate = new Decimal(annualRate).div(100).div(12);
  const n = new Decimal(termMonths);

  // Monthly payment = P × (r(1+r)^n) / ((1+r)^n - 1)
  const factor = monthlyRate.plus(1).pow(n);
  const monthlyPayment = P.times(monthlyRate.times(factor)).div(factor.minus(1));

  let balance = P;
  const schedule: AmortizationRow[] = [];

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance.times(monthlyRate).toDecimalPlaces(2);
    const principalPaid = monthlyPayment.minus(interest).toDecimalPlaces(2);
    balance = balance.minus(principalPaid);

    schedule.push({
      month,
      payment: monthlyPayment.toDecimalPlaces(2).toString(),
      principal: principalPaid.toString(),
      interest: interest.toString(),
      balance: Decimal.max(balance, 0).toDecimalPlaces(2).toString(),
    });
  }

  return schedule;
}
```

### Step 4: Currency-Aware Formatting

```ts
function formatCurrency(amount: string, currency: string, locale: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: ZERO_DECIMAL_CURRENCIES.includes(currency) ? 0 : 2,
    maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.includes(currency) ? 0 : 2,
  }).format(num);
}

const ZERO_DECIMAL_CURRENCIES = ['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'UGX', 'BIF', 'GNF', 'KMF', 'MGA', 'PYG', 'RWF', 'VUV', 'XAF', 'XOF', 'XPF'];
```

### Step 5: Currency Input Component

```tsx
function CurrencyInput({ value, onChange, currency, locale }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(value);

  const handleBlur = () => {
    // Parse input and validate
    const cleaned = displayValue.replace(/[^0-9.-]/g, '');
    const decimal = new Decimal(cleaned || '0');
    const formatted = decimal.toDecimalPlaces(
      ZERO_DECIMAL_CURRENCIES.includes(currency) ? 0 : 2
    ).toString();
    setDisplayValue(formatted);
    onChange(formatted);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {getCurrencySymbol(currency, locale)}
      </span>
      <Input
        inputMode="decimal"
        value={displayValue}
        onChange={e => setDisplayValue(e.target.value)}
        onBlur={handleBlur}
        className="pl-8"
      />
    </div>
  );
}
```

### Step 6: Results Display Panel

```tsx
function CalculatorResults({ results, currency, locale }: ResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <ResultItem
          label="Future Value"
          value={formatCurrency(results.futureValue, currency, locale)}
          highlight
        />
        <ResultItem
          label="Total Contributed"
          value={formatCurrency(results.totalContributed, currency, locale)}
        />
        <ResultItem
          label="Total Interest Earned"
          value={formatCurrency(results.totalInterest, currency, locale)}
          positive
        />
        <ResultItem
          label="Effective Rate"
          value={`${results.effectiveRate}%`}
        />
      </CardContent>
    </Card>
  );
}
```

## Key Files

| File | Role |
|------|------|
| `src/components/budget/` | Calculator UI components |
| `src/lib/` | Calculator logic (Decimal.js) |
| `src/lib/parsers/intl-amount-parser.ts` | International amount parsing |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `number` for money math | Always use `Decimal.js` |
| `0.1 + 0.2 !== 0.3` floating point | `new Decimal('0.1').plus('0.2')` = `0.3` |
| Hardcoding `$` symbol | Use `Intl.NumberFormat` with currency code |
| Forgetting zero-decimal currencies | Check `ZERO_DECIMAL_CURRENCIES` list |
| Rounding at intermediate steps | Only round at final display (`toDecimalPlaces(2)`) |
| Not validating inputs before calculation | Use Zod schema validation |

## Validation Checklist

- [ ] All math uses Decimal.js (no native `number` for money)
- [ ] Inputs validated with Zod schema
- [ ] Currency formatting uses `Intl.NumberFormat`
- [ ] Zero-decimal currencies handled correctly
- [ ] Results rounded only at display time
- [ ] Currency input uses `inputMode="decimal"`
- [ ] Amortization schedule totals match expected values
- [ ] Calculator works with all 72+ supported currencies

## Related Skills

- `budget-methods` — budget allocation calculators
- `test-patterns` — Decimal.js assertion patterns
- `design-tokens` — consistent styling for calculator UI
- `mobile-first-ux` — calculator must work on mobile
