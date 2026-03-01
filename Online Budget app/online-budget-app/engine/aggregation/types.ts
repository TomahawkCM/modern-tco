import type { MinorAmount } from "../money/types";

/**
 * Minimal transaction shape needed for aggregation.
 * Positive amountMinor = income, negative = expense.
 */
export interface TransactionForAggregation {
  readonly amountMinor: number;
  readonly currency: string;
}

/**
 * Result of income vs expense aggregation.
 */
export interface IncomeExpenseSummary {
  readonly totalIncome: MinorAmount;
  readonly totalExpense: MinorAmount;
  readonly net: MinorAmount;
  readonly transactionCount: number;
}
