# Financial Calculator Analysis: Budget App vs. World-Class Standards

> **Date**: February 21, 2026  
> **Status**: Research Complete — Ready for Prioritization

---

## Executive Summary

The Budget App currently offers **9 financial calculators** across three modules. While the existing suite is solid for a local-first app—particularly the Debt Payoff and Savings Goal calculators—there are significant gaps when compared to world-class financial platforms like **NerdWallet**, **Bankrate**, **Boldin**, **Monarch Money**, and **ProjectionLab**. The most notable missing calculators are **Retirement Planning**, **Compound Interest**, **Mortgage/Loan Amortization** (standalone), and a **Tax Estimator**.

---

## 1. Current Calculator Inventory

### Core Calculators (`src/lib/calculators/`)

| Calculator                   | File                   | Key Functions                                                                 | Quality                                                                                 |
| ---------------------------- | ---------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Emergency Fund**           | `emergency-fund.ts`    | `calculateEmergencyFund()`, `getRecommendedMonths()`                          | ✅ Good — accounts for employment type, dependents                                      |
| **Debt Payoff**              | `debt-payoff.ts`       | `calculateDebtPayoff()`, `calculateSingleStrategy()`, `loansToDebtAccounts()` | ✅ Excellent — snowball vs avalanche vs custom, one-time payments, Decimal.js precision |
| **Savings Goal**             | `savings-goal.ts`      | `calculateSavingsGoal()`, `calculateWhenMode()`, `calculateHowMuchMode()`     | ✅ Excellent — compound interest, two modes, projections, Decimal.js precision          |
| **Subscription Cost**        | `subscription-cost.ts` | `calculateSubscriptionCost()`, `toMonthlyCost()`, `groupByCategory()`         | ✅ Good — frequency normalization, essential vs non-essential, income %                 |
| **50/30/20 Budget Analyzer** | `budget-analyzer.ts`   | `calculateBudgetAnalysis()`, `inferBucket()`, `generateRecommendations()`     | ✅ Good — auto-categorization, variance analysis, actionable recommendations            |

### Loan Module (`src/lib/loans/`)

| Calculator                | File              | Key Functions                                                 | Quality                                                   |
| ------------------------- | ----------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| **Amortization Schedule** | `calculations.ts` | `calculateMonthlyPayment()`, `generateAmortizationSchedule()` | ✅ Good — standard formula, full schedule generation      |
| **Extra Payment Impact**  | `calculations.ts` | `calculateExtraPaymentImpact()`                               | ✅ Good — interest saved, months saved, one-time payments |
| **Loan Comparison**       | `calculations.ts` | `compareLoans()`, `analyzeLoanCost()`                         | ✅ Good — refinancing scenarios, side-by-side comparison  |

### Asset Module

| Calculator    | File                              | Key Functions                                                                                       | Quality                                                        |
| ------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Net Worth** | `net-worth/calculator.ts`         | `calculateCurrentNetWorth()`, `detectMilestones()`                                                  | ✅ Good — assets/liabilities breakdown, milestone tracking     |
| **Property**  | `property/property-calculator.ts` | `calculateEquity()`, `calculateAppreciation()`, `calculateRentalROI()`, `getPropertyTaxReminders()` | ✅ Good — equity, CAGR appreciation, rental ROI, tax reminders |

### UI Components

| Component            | File                                                 | Purpose                              |
| -------------------- | ---------------------------------------------------- | ------------------------------------ |
| **Calculator Hub**   | `app/budget-app/calculators/page.tsx`                | Landing page with 5 calculator cards |
| **Calculator Card**  | `components/budget/calculators/CalculatorCard.tsx`   | Reusable card component              |
| **Extra Payment UI** | `components/budget/loans/ExtraPaymentCalculator.tsx` | Interactive loan payment tool        |

### Calculator Hub Sub-Pages

The hub exposes 5 calculators directly: Emergency Fund, Debt Payoff, Savings Goal, Subscription Cost, and Budget Analyzer. The Loan and Property calculators are only accessible from their respective module pages.

---

## 2. World-Class Financial Calculator Standards

### Industry Leaders & Their Offerings

#### NerdWallet (30+ calculators)

- Mortgage, auto loan, student loan, personal loan calculators
- 50/30/20 budget calculator
- Compound interest calculator with visual projections
- Retirement calculator with Social Security estimates
- Cost of living comparison tool
- Savings, CD, high-yield savings calculators

#### Bankrate (40+ calculators)

- Full mortgage suite (affordability, refinance, amortization, ARM)
- Retirement income & savings calculators
- Investment return calculators
- Compound interest with multiple compounding frequencies
- Tax calculators (federal, state, capital gains)
- Net worth calculator
- Inflation calculator

#### Monarch Money (15+ calculators)

- Retirement-focused: Cost of Retirement, Required Minimum Distributions, Portfolio Lifespan
- Inflation impact calculator
- Debt payoff calculator
- Savings goal & accumulation calculators
- Unique: "Coast FIRE" and "Lean FIRE" retirement calculators

#### Boldin / ProjectionLab

- Monte Carlo retirement simulations
- Social Security optimization
- Roth IRA conversion modeling
- Tax-efficient withdrawal strategies
- Scenario comparison (what-if analysis)
- Cash flow forecasting across decades

---

## 3. Gap Analysis

### 🔴 Critical Gaps (Missing entirely)

| Calculator              | Industry Standard                                                          | Opportunity                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Retirement Planner**  | Every major platform has one. Boldin/ProjectionLab offer Monte Carlo sims. | High-impact differentiator. Can start simple (target amount + contributions) and add Social Security, 401k matching. |
| **Compound Interest**   | NerdWallet, Bankrate, every edu site. Visual growth charts.                | Quick win. Logic already exists in `savings-goal.ts`; needs standalone UI with compounding frequency options.        |
| **Mortgage Calculator** | Bankrate's #1 tool. Affordability, refinance, and payment calculators.     | Amortization logic exists in `calculations.ts` but has no standalone calculator UI.                                  |
| **Inflation Impact**    | Monarch, Bankrate. Shows real purchasing power over time.                  | Simple to build. Powerful for long-term planning context.                                                            |
| **Tax Estimator**       | Bankrate (federal + state), TurboTax, H&R Block.                           | Complex, but even a basic income tax bracket estimator adds value.                                                   |

### 🟡 Enhancement Opportunities (Partially implemented)

| Area                     | Current State                                                                                                   | World-Class Standard                                                | Recommendation                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Loan Calculator**      | Core logic exists in `src/lib/loans/calculations.ts`. Full amortization, extra payment impact, loan comparison. | Standalone accessible from calculator hub.                          | **Promote to calculator hub** — the math is done, just needs a standalone page. |
| **Net Worth Calculator** | Calculates from DB automatically.                                                                               | Interactive simulator (what-if: add $X/month to investments).       | Add projection/forecasting mode.                                                |
| **Savings Goal**         | Compound interest baked in. Two modes.                                                                          | Visual growth chart (area chart showing contributions vs interest). | Add chart visualization. Already has `projections[]` data.                      |
| **Debt Payoff**          | Excellent engine with multiple strategies.                                                                      | Side-by-side visual comparison chart. Interactive timeline.         | Add Recharts visualization of strategy comparison.                              |
| **Property Calculator**  | Equity, appreciation, rental ROI.                                                                               | Mortgage affordability ("How much house can I afford?").            | Add affordability calculator leveraging existing loan logic.                    |

### 🟢 Strengths (At or above industry standard)

| Area                           | Why It's Strong                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Debt Payoff Engine**         | Snowball vs avalanche vs custom with one-time payments, Decimal.js precision. Better than most consumer apps. |
| **50/30/20 Budget Analyzer**   | Auto-categorization with inference, variance analysis, actionable recs. On par with NerdWallet.               |
| **Subscription Cost Analyzer** | Frequency normalization, essential/non-essential split, category breakdown. Unique to this app.               |
| **Financial Precision**        | Consistent use of `Decimal.js` and `roundToCents()` across calculators. Exceeds most consumer apps.           |
| **Privacy-First Architecture** | All calculations run locally. No data sent to servers. None of the major platforms can claim this.            |

---

## 4. Prioritized Recommendations

### Phase 1: Quick Wins (1-2 days each)

| #   | Calculator                           | Effort | Impact | Notes                                                                                                        |
| --- | ------------------------------------ | ------ | ------ | ------------------------------------------------------------------------------------------------------------ |
| 1   | **Compound Interest Calculator**     | Low    | High   | Extract from `savings-goal.ts`, add standalone UI with compounding frequency selector, visual growth chart   |
| 2   | **Mortgage Calculator (standalone)** | Low    | High   | Wrap existing `calculateMonthlyPayment()` + `generateAmortizationSchedule()` with a new calculator page      |
| 3   | **Inflate Calculator Hub**           | Low    | Medium | Add Loan Calculator and Net Worth tool to the hub page (currently only 5 of 9+ calculators are discoverable) |
| 4   | **Savings Goal Chart**               | Low    | Medium | Add Recharts area chart to existing savings goal page using existing `projections[]` data                    |

### Phase 2: Medium Effort (3-5 days each)

| #   | Calculator                      | Effort  | Impact    | Notes                                                                                                                                       |
| --- | ------------------------------- | ------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 5   | **Retirement Planner**          | Medium  | Very High | Start with: current savings, monthly contribution, expected return, retirement age, target income. Could leverage `savings-goal.ts` engine. |
| 6   | **Inflation Impact Calculator** | Low-Med | Medium    | Show purchasing power erosion over time. Simple formula: `futureValue / (1 + inflationRate)^years`                                          |
| 7   | **Debt Payoff Visualization**   | Medium  | High      | Add side-by-side strategy comparison chart, interactive timeline, total interest saved visualization                                        |
| 8   | **Net Worth Forecaster**        | Medium  | Medium    | Project net worth forward with configurable assumptions (salary growth, investment returns, debt payoff)                                    |

### Phase 3: Ambitious (1-2 weeks each)

| #   | Calculator                 | Effort | Impact | Notes                                                                                                                                          |
| --- | -------------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 9   | **Mortgage Affordability** | Medium | High   | "How much house can I afford?" based on income, debts, down payment, interest rate                                                             |
| 10  | **Tax Estimator**          | High   | Medium | Basic federal income tax bracket calculator. Progressive tax calculation with standard deduction.                                              |
| 11  | **FIRE Calculator**        | Medium | High   | Financial Independence / Retire Early. Calculate FIRE number, coast FIRE age, savings rate needed. Very popular in personal finance community. |
| 12  | **Monte Carlo Simulator**  | High   | Medium | Retirement plan success probability. Requires stochastic modeling of returns. Premium feature.                                                 |

---

## 5. Architecture Notes

### Shared Infrastructure Already in Place

- **`src/lib/money.ts`** — `roundToCents()`, `sumAmounts()`, `divideAmount()`, `multiplyAmount()`, `percentageOf()`
- **`decimal.js`** — Already used in debt-payoff and savings-goal for precision
- **`CalculatorState<I, R>`** — Generic state interface for all calculators
- **`CalculatorCard`** — Reusable hub card component
- **`Recharts`** — Already in the app for dashboard widgets

### Recommended Pattern for New Calculators

```
src/lib/calculators/
├── retirement.ts          # Pure calculation logic
├── compound-interest.ts   # Pure calculation logic
├── inflation.ts           # Pure calculation logic
└── types.ts               # Add new input/result interfaces

src/app/budget-app/calculators/
├── retirement/page.tsx
├── compound-interest/page.tsx
└── inflation/page.tsx
```

Each calculator should follow the established pattern:

1. **Types** in `types.ts` — Input and Result interfaces
2. **Logic** in a dedicated `.ts` file — Pure functions, no DB access
3. **Page** in `app/budget-app/calculators/[name]/page.tsx` — UI with Recharts visualizations
4. **Hub entry** — Add to `calculators/page.tsx` array

---

## 6. Competitive Positioning

| Feature             | Our App       | Monarch      | YNAB            | Copilot    | NerdWallet | Bankrate |
| ------------------- | ------------- | ------------ | --------------- | ---------- | ---------- | -------- |
| Debt Payoff         | ✅ Excellent  | ✅ Basic     | ❌              | ❌         | ✅         | ✅       |
| Emergency Fund      | ✅            | ❌           | ❌              | ❌         | ❌         | ✅       |
| Savings Goal        | ✅ Compound   | ✅           | ✅ (via budget) | ✅ (basic) | ✅         | ✅       |
| 50/30/20 Analyzer   | ✅            | ❌           | ❌              | ❌         | ✅         | ❌       |
| Subscription Cost   | ✅ Unique     | ✅           | ❌              | ❌         | ❌         | ❌       |
| Mortgage            | ⚠️ Logic only | ❌           | ❌              | ❌         | ✅         | ✅ Best  |
| Retirement          | ❌            | ✅ Excellent | ❌              | ❌         | ✅         | ✅       |
| Compound Interest   | ❌ (embedded) | ❌           | ❌              | ❌         | ✅         | ✅       |
| Inflation           | ❌            | ✅           | ❌              | ❌         | ❌         | ✅       |
| Tax Estimator       | ❌            | ❌           | ❌              | ❌         | ❌         | ✅       |
| FIRE Calculator     | ❌            | ✅           | ❌              | ❌         | ❌         | ❌       |
| Privacy / Local     | ✅ **Unique** | ❌           | ❌              | ❌         | ❌         | ❌       |
| Financial Precision | ✅ Decimal.js | ❌           | ❌              | ❌         | ❌         | ❌       |

**Key Insight**: No competitor offers the combination of comprehensive calculators AND local-first privacy. Filling the critical gaps would make this the most complete privacy-first financial calculator suite available.

---

## 7. Next Steps

1. **Decide scope**: Which phase(s) to implement first
2. **Create implementation plan** for selected calculators
3. **Build Phase 1 quick wins** to immediately improve calculator hub
4. **Plan Phase 2** retirement planner as flagship new calculator
