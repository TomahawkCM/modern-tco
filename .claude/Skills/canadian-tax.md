---
name: canadian-tax
description: Use when implementing Canadian tax-advantaged account tracking, contribution room calculations, or Canada-specific tax features.
---

# Canadian Tax Features

## Overview

Implements Canadian-specific financial features — RRSP, TFSA, RESP, and FHSA contribution room tracking, carry-forward logic, provincial tax rates, and CRA receipt organization. Designed for Canadian users managing tax-advantaged accounts.

## When to Use

- Implementing RRSP/TFSA/RESP/FHSA tracking
- Calculating contribution room and carry-forward
- Adding provincial tax rate calculations (GST/HST/PST)
- Building CRA receipt vault organization
- Tracking RRSP deductions for tax optimization

## Core Principles

- **Decimal.js** — All tax math uses Decimal.js
- **Annual limits from CRA** — Track annual CRA limits (update yearly)
- **Carry-forward** — Unused contribution room carries forward indefinitely
- **Provincial variation** — Tax rates vary by province (13 jurisdictions)
- **Not tax advice** — Display calculations; always recommend consulting a tax professional

## Workflow

### Step 1: Tax-Advantaged Account Limits

```ts
// Annual CRA limits (update each January)
const CRA_LIMITS: Record<number, TaxLimits> = {
  2025: {
    tfsa: '7000',
    rrsp: '31560',
    rrspRate: '0.18',   // 18% of earned income
    fhsa: '8000',
    fhsaLifetime: '40000',
    resp: '2500',       // Annual per beneficiary
    respLifetime: '50000',
    respCesg: '500',    // CESG match per year
    respCesgLifetime: '7200',
  },
  2024: {
    tfsa: '7000',
    rrsp: '31560',
    rrspRate: '0.18',
    fhsa: '8000',
    fhsaLifetime: '40000',
    resp: '2500',
    respLifetime: '50000',
    respCesg: '500',
    respCesgLifetime: '7200',
  },
};
```

### Step 2: Contribution Room Calculation

```ts
function calculateTFSARoom(
  yearOfBirth: number,
  contributions: ContributionHistory[],
  withdrawals: WithdrawalHistory[]
): ContributionRoom {
  // TFSA available from age 18 (or 2009, whichever is later)
  const eligibleFrom = Math.max(yearOfBirth + 18, 2009);
  const currentYear = new Date().getFullYear();

  let totalRoom = new Decimal(0);
  for (let year = eligibleFrom; year <= currentYear; year++) {
    const limit = CRA_LIMITS[year]?.tfsa || '0';
    totalRoom = totalRoom.plus(new Decimal(limit));
  }

  const totalContributed = contributions.reduce(
    (sum, c) => sum.plus(new Decimal(c.amount)),
    new Decimal(0)
  );

  // Withdrawals restore room in the following year
  const restoredRoom = withdrawals
    .filter(w => new Date(w.date).getFullYear() < currentYear)
    .reduce((sum, w) => sum.plus(new Decimal(w.amount)), new Decimal(0));

  const availableRoom = totalRoom.minus(totalContributed).plus(restoredRoom);

  return {
    totalRoom: totalRoom.toString(),
    used: totalContributed.toString(),
    restored: restoredRoom.toString(),
    available: Decimal.max(availableRoom, 0).toString(),
  };
}
```

### Step 3: RRSP Deduction Optimizer

```ts
function optimizeRRSPDeduction(
  income: string,
  rrspRoom: string,
  provincialTaxRates: TaxBracket[]
): RRSPOptimization {
  const incomeDecimal = new Decimal(income);
  const roomDecimal = new Decimal(rrspRoom);

  // Find the marginal tax bracket
  const marginalRate = getMarginalRate(incomeDecimal, provincialTaxRates);

  // Calculate tax savings for contributing max room
  const maxContribution = Decimal.min(roomDecimal, incomeDecimal.times('0.18'));
  const taxSavings = maxContribution.times(marginalRate);

  return {
    recommendedContribution: maxContribution.toDecimalPlaces(2).toString(),
    taxSavings: taxSavings.toDecimalPlaces(2).toString(),
    marginalRate: marginalRate.times(100).toDecimalPlaces(1).toString(),
    remainingRoom: roomDecimal.minus(maxContribution).toString(),
    note: 'Consult a tax professional for personalized advice.',
  };
}
```

### Step 4: Provincial Tax Rates

```ts
const PROVINCIAL_SALES_TAX: Record<string, { gst: string; pst: string; hst: string; total: string }> = {
  AB: { gst: '5', pst: '0', hst: '0', total: '5' },
  BC: { gst: '5', pst: '7', hst: '0', total: '12' },
  MB: { gst: '5', pst: '7', hst: '0', total: '12' },
  NB: { gst: '0', pst: '0', hst: '15', total: '15' },
  NL: { gst: '0', pst: '0', hst: '15', total: '15' },
  NS: { gst: '0', pst: '0', hst: '15', total: '15' },
  NT: { gst: '5', pst: '0', hst: '0', total: '5' },
  NU: { gst: '5', pst: '0', hst: '0', total: '5' },
  ON: { gst: '0', pst: '0', hst: '13', total: '13' },
  PE: { gst: '0', pst: '0', hst: '15', total: '15' },
  QC: { gst: '5', pst: '9.975', hst: '0', total: '14.975' },
  SK: { gst: '5', pst: '6', hst: '0', total: '11' },
  YT: { gst: '5', pst: '0', hst: '0', total: '5' },
};
```

### Step 5: FHSA First-Time Homebuyer

```ts
function calculateFHSARoom(
  openYear: number,
  contributions: ContributionHistory[]
): ContributionRoom {
  const currentYear = new Date().getFullYear();
  const yearsOpen = currentYear - openYear;
  const maxYears = 15; // FHSA expires after 15 years

  if (yearsOpen > maxYears) {
    return { totalRoom: '40000', used: '...', available: '0' };
  }

  let totalRoom = new Decimal(0);
  for (let year = openYear; year <= currentYear; year++) {
    const annualLimit = new Decimal(CRA_LIMITS[year]?.fhsa || '8000');
    const prevUnused = totalRoom.minus(
      contributions.filter(c => new Date(c.date).getFullYear() < year)
        .reduce((s, c) => s.plus(new Decimal(c.amount)), new Decimal(0))
    );
    // Carry-forward capped at $8,000 per year
    const yearRoom = Decimal.min(annualLimit.plus(Decimal.min(prevUnused, annualLimit)), new Decimal('16000'));
    totalRoom = totalRoom.plus(yearRoom);
  }

  // Lifetime cap
  totalRoom = Decimal.min(totalRoom, new Decimal('40000'));

  const used = contributions.reduce((s, c) => s.plus(new Decimal(c.amount)), new Decimal(0));

  return {
    totalRoom: totalRoom.toString(),
    used: used.toString(),
    available: Decimal.max(totalRoom.minus(used), 0).toString(),
  };
}
```

## Key Files

| File | Role |
|------|------|
| `src/components/budget/` | Tax account UI components |
| `src/lib/` | Tax calculation logic |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Hardcoding annual CRA limits | Store limits per-year, update annually |
| Ignoring TFSA withdrawal room restoration | Withdrawn amounts restore room next year |
| FHSA carry-forward exceeds annual limit | Cap carry-forward at one year's limit |
| Not disclaiming tax advice | Always add "consult a tax professional" |
| Ignoring Quebec's different sales tax | QC uses GST+QST, not HST |

## Validation Checklist

- [ ] All tax math uses Decimal.js
- [ ] Annual CRA limits correct for current year
- [ ] TFSA room includes withdrawal restoration
- [ ] RRSP contribution capped at 18% of income or annual max
- [ ] FHSA lifetime cap of $40,000 enforced
- [ ] Provincial tax rates accurate for all 13 jurisdictions
- [ ] "Not tax advice" disclaimer displayed
- [ ] Calculations work for users born before/after 1991 (TFSA eligibility)

## Related Skills

- `financial-calculator` — shared Decimal.js patterns
- `document-vault` — CRA receipt storage
- `investment-tracker` — registered account balances
