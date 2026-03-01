/**
 * Cash Flow Engine
 *
 * Time-based cash flow modeling for financial planning.
 * Models income streams, expenses, and net cash flow over time periods.
 * Uses Decimal.js for precision. All functions accept/return numbers.
 */

import Decimal from "decimal.js";
import { roundToCents } from "@/lib/money";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ============================================================================
// Types
// ============================================================================

export type CashFlowFrequency = "monthly" | "quarterly" | "annually" | "one-time";

export interface CashFlowStream {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Amount per occurrence (positive = income, negative = expense) */
  amount: number;
  /** How often this cash flow occurs */
  frequency: CashFlowFrequency;
  /** Annual growth rate for this stream (percent, e.g. 3.0 for raises) */
  annualGrowthRate?: number;
  /** Start month (0-indexed from projection start) */
  startMonth?: number;
  /** End month (inclusive, undefined = runs forever) */
  endMonth?: number;
}

export interface CashFlowProjectionInput {
  /** All income and expense streams */
  streams: CashFlowStream[];
  /** Number of months to project */
  months: number;
  /** Annual inflation rate applied to expenses (percent) */
  inflationRate?: number;
}

export interface CashFlowMonth {
  /** Month index (0-based) */
  month: number;
  /** Total income this month */
  income: number;
  /** Total expenses this month (positive number) */
  expenses: number;
  /** Net cash flow (income - expenses) */
  netCashFlow: number;
  /** Cumulative net cash flow from start */
  cumulativeCashFlow: number;
}

export interface CashFlowProjectionResult {
  /** Month-by-month cash flow data */
  timeline: CashFlowMonth[];
  /** Total income over the projection period */
  totalIncome: number;
  /** Total expenses over the projection period */
  totalExpenses: number;
  /** Total net cash flow */
  totalNetCashFlow: number;
  /** Average monthly income */
  averageMonthlyIncome: number;
  /** Average monthly expenses */
  averageMonthlyExpenses: number;
  /** Average monthly net cash flow */
  averageMonthlyNet: number;
  /** Month where cumulative cash flow first goes negative (null if never) */
  firstNegativeMonth: number | null;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert a cash flow to its monthly equivalent at a given month.
 * Applies growth rate and checks start/end bounds.
 */
function getMonthlyAmount(stream: CashFlowStream, month: number): number {
  const start = stream.startMonth ?? 0;
  const end = stream.endMonth;

  // Check bounds
  if (month < start) return 0;
  if (end !== undefined && month > end) return 0;

  // One-time cash flows only apply at start month
  if (stream.frequency === "one-time") {
    return month === start ? stream.amount : 0;
  }

  // Check if this month aligns with the frequency
  const monthsSinceStart = month - start;
  let applies = false;
  switch (stream.frequency) {
    case "monthly":
      applies = true;
      break;
    case "quarterly":
      applies = monthsSinceStart % 3 === 0;
      break;
    case "annually":
      applies = monthsSinceStart % 12 === 0;
      break;
  }

  if (!applies) return 0;

  // Apply growth rate
  const yearsElapsed = new Decimal(month).dividedBy(12);
  const growthRate = stream.annualGrowthRate ?? 0;

  if (growthRate === 0) return stream.amount;

  const growthFactor = new Decimal(1)
    .plus(new Decimal(growthRate).dividedBy(100))
    .pow(yearsElapsed);

  return roundToCents(new Decimal(stream.amount).times(growthFactor).toNumber());
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Project cash flows over time.
 * Income streams have positive amounts, expense streams have negative amounts.
 */
export function projectCashFlow(input: CashFlowProjectionInput): CashFlowProjectionResult {
  const { streams, months } = input;

  const timeline: CashFlowMonth[] = [];
  let totalIncome = new Decimal(0);
  let totalExpenses = new Decimal(0);
  let cumulativeCashFlow = new Decimal(0);
  let firstNegativeMonth: number | null = null;

  for (let month = 0; month < months; month++) {
    let monthIncome = new Decimal(0);
    let monthExpenses = new Decimal(0);

    for (const stream of streams) {
      const amount = getMonthlyAmount(stream, month);
      if (amount > 0) {
        monthIncome = monthIncome.plus(amount);
      } else if (amount < 0) {
        monthExpenses = monthExpenses.plus(Math.abs(amount));
      }
    }

    const netCashFlow = monthIncome.minus(monthExpenses);
    cumulativeCashFlow = cumulativeCashFlow.plus(netCashFlow);

    if (firstNegativeMonth === null && cumulativeCashFlow.lessThan(0)) {
      firstNegativeMonth = month;
    }

    totalIncome = totalIncome.plus(monthIncome);
    totalExpenses = totalExpenses.plus(monthExpenses);

    timeline.push({
      month,
      income: roundToCents(monthIncome.toNumber()),
      expenses: roundToCents(monthExpenses.toNumber()),
      netCashFlow: roundToCents(netCashFlow.toNumber()),
      cumulativeCashFlow: roundToCents(cumulativeCashFlow.toNumber()),
    });
  }

  const totalNet = totalIncome.minus(totalExpenses);
  const monthCount = months > 0 ? months : 1;

  return {
    timeline,
    totalIncome: roundToCents(totalIncome.toNumber()),
    totalExpenses: roundToCents(totalExpenses.toNumber()),
    totalNetCashFlow: roundToCents(totalNet.toNumber()),
    averageMonthlyIncome: roundToCents(totalIncome.dividedBy(monthCount).toNumber()),
    averageMonthlyExpenses: roundToCents(totalExpenses.dividedBy(monthCount).toNumber()),
    averageMonthlyNet: roundToCents(totalNet.dividedBy(monthCount).toNumber()),
    firstNegativeMonth,
  };
}
