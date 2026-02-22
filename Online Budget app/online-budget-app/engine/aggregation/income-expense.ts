import type { MinorAmount } from "../money/types";
import type { TransactionForAggregation, IncomeExpenseSummary } from "./types";

export function aggregateIncomeExpense(
  transactions: TransactionForAggregation[],
  currency: string
): IncomeExpenseSummary {
  let income = 0;
  let expense = 0;

  for (const txn of transactions) {
    if (txn.currency !== currency) {
      throw new Error(
        `Currency mismatch: expected ${currency}, got ${txn.currency}`
      );
    }

    if (txn.amountMinor >= 0) {
      income += txn.amountMinor;
    } else {
      expense += txn.amountMinor;
    }
  }

  return {
    totalIncome: { amountMinor: income, currency } as MinorAmount,
    totalExpense: { amountMinor: expense, currency } as MinorAmount,
    net: { amountMinor: income + expense, currency } as MinorAmount,
    transactionCount: transactions.length,
  };
}
