/**
 * Balance Calculation Utilities
 *
 * Functions for calculating account balances, running balances, and
 * reconciling imported transactions with actual bank balances.
 *
 * Uses the money utilities for proper decimal precision.
 */

import { sumAmounts, subtractAmounts, roundToCents } from "@/lib/money";
import type { Transaction, Account } from "@/types/budget";

/**
 * Calculate the current balance for an account
 * Current Balance = Opening Balance + Sum of all transactions
 *
 * @param openingBalance - The starting balance (from account.balance)
 * @param transactions - Array of transactions for this account
 * @returns Current balance after all transactions
 *
 * @example
 * // If opening is $1000, with -$200 expense and +$500 income
 * calculateCurrentBalance(1000, [{ amount: -200 }, { amount: 500 }])
 * // Returns: 1300
 */
export function calculateCurrentBalance(
  openingBalance: number,
  transactions: Pick<Transaction, "amount">[]
): number {
  const transactionSum = sumAmounts(transactions.map((tx) => tx.amount));
  return roundToCents(openingBalance + transactionSum);
}

/**
 * Calculate what the opening balance should be, given:
 * - The user's current actual bank balance
 * - The sum of all imported transactions
 *
 * Opening Balance = Current Actual Balance - Net Transaction Total
 *
 * @param currentActualBalance - What the user says their current balance is
 * @param transactions - Array of imported transactions
 * @returns The calculated opening balance
 *
 * @example
 * // User says current balance is $874.18
 * // Transactions total to -$4125.82 (spent more than earned)
 * // Opening = 874.18 - (-4125.82) = 5000.00
 * calculateOpeningBalance(874.18, [{ amount: -4125.82 }])
 * // Returns: 5000.00
 */
export function calculateOpeningBalance(
  currentActualBalance: number,
  transactions: Pick<Transaction, "amount">[]
): number {
  const netChange = calculateNetChange(transactions);
  return subtractAmounts(currentActualBalance, netChange);
}

/**
 * Calculate the net change from a list of transactions
 * Positive amounts are income, negative amounts are expenses
 *
 * @param transactions - Array of transactions
 * @returns Net change (positive = net income, negative = net spending)
 *
 * @example
 * calculateNetChange([{ amount: 500 }, { amount: -200 }])
 * // Returns: 300
 */
export function calculateNetChange(transactions: Pick<Transaction, "amount">[]): number {
  return sumAmounts(transactions.map((tx) => tx.amount));
}

/**
 * Calculate the balance at a specific date
 * Includes all transactions up to and including that date
 *
 * @param openingBalance - The starting balance
 * @param transactions - Array of transactions (must include date field)
 * @param asOfDate - The date to calculate balance for
 * @returns Balance as of that date
 */
export function calculateBalanceAtDate(
  openingBalance: number,
  transactions: Pick<Transaction, "amount" | "date">[],
  asOfDate: Date
): number {
  const relevantTransactions = transactions.filter((tx) => new Date(tx.date) <= asOfDate);
  return calculateCurrentBalance(openingBalance, relevantTransactions);
}

/**
 * Running balance entry for transaction list display
 */
export interface RunningBalanceEntry {
  transactionId: string;
  runningBalance: number;
}

/**
 * Calculate running balance for each transaction
 * For displaying in transaction list - shows balance after each transaction
 *
 * IMPORTANT: Transactions must be sorted by date ASCENDING (oldest first)
 * to get correct running balances
 *
 * @param openingBalance - The starting balance before first transaction
 * @param transactions - Array of transactions sorted by date ascending
 * @returns Array mapping transaction IDs to their running balance
 *
 * @example
 * // Opening balance: $1000
 * // Transactions: [Jan 1: -$100, Jan 2: +$50, Jan 3: -$200]
 * calculateRunningBalances(1000, transactions)
 * // Returns: [
 * //   { transactionId: "tx1", runningBalance: 900 },  // 1000 - 100
 * //   { transactionId: "tx2", runningBalance: 950 },  // 900 + 50
 * //   { transactionId: "tx3", runningBalance: 750 },  // 950 - 200
 * // ]
 */
export function calculateRunningBalances(
  openingBalance: number,
  transactions: Pick<Transaction, "id" | "amount">[]
): RunningBalanceEntry[] {
  let currentBalance = roundToCents(openingBalance);

  return transactions.map((tx) => {
    currentBalance = roundToCents(currentBalance + tx.amount);
    return {
      transactionId: tx.id,
      runningBalance: currentBalance,
    };
  });
}

/**
 * Calculate running balances as a Map for fast lookups
 * More efficient when you need to look up balances by transaction ID
 *
 * @param openingBalance - The starting balance
 * @param transactions - Array of transactions sorted by date ascending
 * @returns Map of transaction ID to running balance
 */
export function calculateRunningBalancesMap(
  openingBalance: number,
  transactions: Pick<Transaction, "id" | "amount">[]
): Map<string, number> {
  const entries = calculateRunningBalances(openingBalance, transactions);
  return new Map(entries.map((e) => [e.transactionId, e.runningBalance]));
}

/**
 * Get date range from transactions
 *
 * @param transactions - Array of transactions with dates
 * @returns Object with start and end dates, or null if no transactions
 */
export function getTransactionDateRange(
  transactions: Pick<Transaction, "date">[]
): { start: Date; end: Date } | null {
  if (transactions.length === 0) return null;

  const dates = transactions.map((tx) => new Date(tx.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);

  return {
    start: new Date(minDate),
    end: new Date(maxDate),
  };
}

/**
 * Calculate income and expense totals from transactions
 *
 * @param transactions - Array of transactions
 * @returns Object with income, expenses, and net values
 */
export function calculateTransactionTotals(transactions: Pick<Transaction, "amount">[]): {
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
} {
  const income = transactions.filter((tx) => tx.amount > 0);
  const expenses = transactions.filter((tx) => tx.amount < 0);

  const totalIncome = sumAmounts(income.map((tx) => tx.amount));
  const totalExpenses = Math.abs(sumAmounts(expenses.map((tx) => tx.amount)));
  const netChange = subtractAmounts(totalIncome, totalExpenses);

  return { totalIncome, totalExpenses, netChange };
}

/**
 * Check if an account needs reconciliation
 * Returns true if account has never been reconciled
 *
 * @param account - The account to check
 * @returns True if reconciliation is recommended
 */
export function needsReconciliation(account: Account): boolean {
  return !account.lastReconciledAt;
}

/**
 * Calculate expected balance based on last reconciliation plus new transactions
 * Useful for detecting discrepancies
 *
 * @param account - The account with reconciliation history
 * @param transactionsSinceReconciliation - New transactions since last reconciliation
 * @returns Expected current balance
 */
export function calculateExpectedBalance(
  account: Account,
  transactionsSinceReconciliation: Pick<Transaction, "amount">[]
): number {
  const baseBalance = account.lastReconciledBalance ?? account.balance;
  const netChange = calculateNetChange(transactionsSinceReconciliation);
  return roundToCents(baseBalance + netChange);
}

/**
 * Format balance for display, handling credit accounts properly
 * Credit accounts show positive balance as "owed" amount
 *
 * @param balance - The balance amount
 * @param accountType - Type of account
 * @returns Formatted display object
 */
export function formatBalanceForDisplay(
  balance: number,
  accountType: Account["type"]
): {
  amount: number;
  label: string;
  isNegative: boolean;
} {
  if (accountType === "credit") {
    // For credit cards, positive balance = amount owed
    // Negative balance = credit balance (rare, means overpaid)
    const isOwed = balance >= 0;
    return {
      amount: Math.abs(balance),
      label: isOwed ? "Owed" : "Credit",
      isNegative: !isOwed,
    };
  }

  // For checking/savings, negative = overdrawn
  return {
    amount: Math.abs(balance),
    label: balance >= 0 ? "Balance" : "Overdrawn",
    isNegative: balance < 0,
  };
}
