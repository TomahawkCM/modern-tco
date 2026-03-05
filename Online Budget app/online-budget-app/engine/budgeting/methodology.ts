/**
 * Budget methodology allocation engine.
 *
 * Four supported methodologies:
 * - Envelope: User manually assigns per-category limits (no auto-allocation)
 * - Zero-Based: Every dollar assigned — validates total allocations = income
 * - 50/30/20: Needs (50%), Wants (30%), Savings (20%)
 * - Pay Yourself First: Savings target first, remainder for spending
 *
 * Pure functions — no DB, no side effects.
 */

export type BudgetMethodology =
  | "envelope"
  | "zero_based"
  | "fifty_thirty_twenty"
  | "pay_yourself_first";

export const METHODOLOGIES: readonly BudgetMethodology[] = [
  "envelope",
  "zero_based",
  "fifty_thirty_twenty",
  "pay_yourself_first",
] as const;

export interface MethodologyAllocation {
  readonly label: string;
  readonly percentOfIncome: number;
  readonly amountMinor: number;
}

export interface MethodologyGuide {
  readonly methodology: BudgetMethodology;
  readonly allocations: MethodologyAllocation[];
  readonly unallocatedMinor: number;
}

/**
 * Compute suggested allocation breakdown for 50/30/20 rule.
 */
export function computeFiftyThirtyTwenty(incomeMinor: number): MethodologyGuide {
  const needs = Math.round(incomeMinor * 0.5);
  const wants = Math.round(incomeMinor * 0.3);
  const savings = incomeMinor - needs - wants; // remainder to avoid rounding issues

  return {
    methodology: "fifty_thirty_twenty",
    allocations: [
      { label: "needs", percentOfIncome: 50, amountMinor: needs },
      { label: "wants", percentOfIncome: 30, amountMinor: wants },
      { label: "savings", percentOfIncome: 20, amountMinor: savings },
    ],
    unallocatedMinor: 0,
  };
}

/**
 * Compute Pay Yourself First allocation.
 * Default savings rate is 20%, configurable.
 */
export function computePayYourselfFirst(
  incomeMinor: number,
  savingsPercent: number = 20
): MethodologyGuide {
  const clamped = Math.max(0, Math.min(100, savingsPercent));
  const savings = Math.round(incomeMinor * (clamped / 100));
  const spending = incomeMinor - savings;

  return {
    methodology: "pay_yourself_first",
    allocations: [
      { label: "savings", percentOfIncome: clamped, amountMinor: savings },
      {
        label: "spending",
        percentOfIncome: 100 - clamped,
        amountMinor: spending,
      },
    ],
    unallocatedMinor: 0,
  };
}

/**
 * Validate zero-based budget: all income must be allocated.
 * Returns the unallocated amount (should be 0 for valid zero-based budget).
 */
export function computeZeroBasedStatus(
  incomeMinor: number,
  totalAllocatedMinor: number
): MethodologyGuide {
  const unallocated = incomeMinor - totalAllocatedMinor;

  return {
    methodology: "zero_based",
    allocations: [
      {
        label: "allocated",
        percentOfIncome:
          incomeMinor > 0 ? Math.round((totalAllocatedMinor / incomeMinor) * 100) : 0,
        amountMinor: totalAllocatedMinor,
      },
    ],
    unallocatedMinor: unallocated,
  };
}
