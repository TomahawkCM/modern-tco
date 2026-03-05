/**
 * Safe-to-Spend computation.
 *
 * Calculates how much money the user can safely spend today
 * based on their income, committed expenses (budget limits),
 * and actual spending so far this month.
 *
 * Formula:
 *   totalIncome − totalBudgetLimits − alreadySpentUnbudgeted = safeToSpend (for month)
 *   dailySafeToSpend = safeToSpend / remainingDaysInMonth
 *
 * Pure function — no DB, no side effects.
 */

export interface SafeToSpendInput {
  /** Total income for the current month (minor units, positive) */
  readonly incomeMinor: number;
  /** Sum of all budget limits (minor units, positive) */
  readonly totalBudgetedMinor: number;
  /** Total already spent this month (minor units, positive — absolute value) */
  readonly totalSpentMinor: number;
  /** Current day of the month (1-based) */
  readonly currentDay: number;
  /** Total days in the current month */
  readonly daysInMonth: number;
  /** Currency code */
  readonly currency: string;
}

export interface SafeToSpendResult {
  /** Total safe-to-spend remaining for the month (minor units, can be negative) */
  readonly monthlyMinor: number;
  /** Daily safe-to-spend for remaining days (minor units, can be negative) */
  readonly dailyMinor: number;
  /** Remaining days in the month (including today) */
  readonly remainingDays: number;
  /** Currency code */
  readonly currency: string;
  /** Whether spending has exceeded available funds */
  readonly isOverspent: boolean;
}

/**
 * Compute safe-to-spend amounts.
 *
 * Safe-to-spend = income − total spent so far
 * Daily = safe-to-spend / remaining days (including today)
 */
export function computeSafeToSpend(input: SafeToSpendInput): SafeToSpendResult {
  const monthlyRemaining = input.incomeMinor - input.totalSpentMinor;
  const remainingDays = Math.max(1, input.daysInMonth - input.currentDay + 1);
  const dailyRemaining = Math.round(monthlyRemaining / remainingDays);

  return {
    monthlyMinor: monthlyRemaining,
    dailyMinor: dailyRemaining,
    remainingDays,
    currency: input.currency,
    isOverspent: monthlyRemaining < 0,
  };
}
