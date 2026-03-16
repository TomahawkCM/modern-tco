/**
 * Net Worth Calculator
 *
 * Calculates current net worth from accounts, loans, holdings, and properties.
 * Extracted and extended from the Excel export net-worth-sheet.ts module.
 */

import { db } from "@/lib/budget-db";
import { roundToCents } from "@/lib/money";
import type { StoredNetWorthSnapshot, Account, Loan } from "@/types/budget";
import type { Holding } from "@/lib/budget-db";

export interface NetWorthBreakdown {
  assets: {
    cashChecking: number;
    savings: number;
    investments: number;
    property: number;
    other: number;
    total: number;
    items?: { id: string; label: string; value: number }[];
  };
  liabilities: {
    creditCards: number;
    loans: number;
    mortgage: number;
    other: number;
    total: number;
    items?: { id: string; label: string; value: number }[];
  };
  netWorth: number;
}

/**
 * Calculate current net worth from all data sources.
 */
export async function calculateCurrentNetWorth(): Promise<NetWorthBreakdown> {
  const [accounts, loans, holdings, properties, transactions] = await Promise.all([
    db.accounts.toArray(),
    db.loans.toArray(),
    db.holdings.toArray(),
    db.properties.toArray(),
    db.transactions.toArray(),
  ]);

  const accountBalances = new Map<string, number>();
  for (const account of accounts) {
    const accTxs = transactions.filter((tx) => !tx.isSplit && tx.accountId === account.id);
    const txTotal = accTxs.reduce((sum, tx) => sum + tx.amount, 0);
    accountBalances.set(account.id, account.balance + txTotal);
  }

  // Assets
  const checkingAccounts = accounts.filter((a: Account) => a.type === "checking");
  const cashChecking = checkingAccounts.reduce(
    (sum: number, a: Account) => sum + accountBalances.get(a.id)!,
    0
  );

  const savingsAccounts = accounts.filter((a: Account) => a.type === "savings");
  const savings = savingsAccounts.reduce(
    (sum: number, a: Account) => sum + accountBalances.get(a.id)!,
    0
  );

  // Use currentPrice (market value) when available, fall back to purchasePrice (cost basis)
  const investments = holdings.reduce(
    (sum: number, h: Holding) => sum + h.quantity * (h.currentPrice ?? h.purchasePrice),
    0
  );

  const propertyValue = properties.reduce((sum, p) => sum + p.currentValue, 0);

  // Liabilities
  const creditAccounts = accounts.filter((a: Account) => a.type === "credit");
  const creditCards = creditAccounts.reduce(
    (sum: number, a: Account) => sum + Math.abs(accountBalances.get(a.id)!),
    0
  );

  const activeLoanBalance = loans
    .filter((l: Loan) => l.status === "active" && l.type !== "mortgage")
    .reduce((sum: number, l: Loan) => sum + l.currentBalance, 0);

  const mortgageBalance = loans
    .filter((l: Loan) => l.status === "active" && l.type === "mortgage")
    .reduce((sum: number, l: Loan) => sum + l.currentBalance, 0);

  const totalAssets = cashChecking + savings + investments + propertyValue;
  const totalLiabilities = creditCards + activeLoanBalance + mortgageBalance;

  const assetItems: { id: string; label: string; value: number }[] = [];
  checkingAccounts.forEach((a) => {
    const val = accountBalances.get(a.id)!;
    if (val !== 0) assetItems.push({ id: a.id, label: a.name, value: val });
  });
  savingsAccounts.forEach((a) => {
    const val = accountBalances.get(a.id)!;
    if (val !== 0) assetItems.push({ id: a.id, label: a.name, value: val });
  });
  if (investments > 0)
    assetItems.push({ id: "investments", label: "Investments", value: investments });
  if (propertyValue > 0)
    assetItems.push({ id: "property", label: "Property", value: propertyValue });

  const liabilityItems: { id: string; label: string; value: number }[] = [];
  creditAccounts.forEach((a) => {
    const val = Math.abs(accountBalances.get(a.id)!);
    if (val !== 0) liabilityItems.push({ id: a.id, label: a.name, value: val });
  });
  loans
    .filter((l) => l.status === "active" && l.type !== "mortgage")
    .forEach((l) => {
      if (l.currentBalance > 0)
        liabilityItems.push({ id: l.id, label: l.name, value: l.currentBalance });
    });
  loans
    .filter((l) => l.status === "active" && l.type === "mortgage")
    .forEach((l) => {
      if (l.currentBalance > 0)
        liabilityItems.push({ id: l.id, label: l.name, value: l.currentBalance });
    });

  return {
    assets: {
      cashChecking: roundToCents(cashChecking),
      savings: roundToCents(savings),
      investments: roundToCents(investments),
      property: roundToCents(propertyValue),
      other: 0,
      total: roundToCents(totalAssets),
      items: assetItems,
    },
    liabilities: {
      creditCards: roundToCents(creditCards),
      loans: roundToCents(activeLoanBalance),
      mortgage: roundToCents(mortgageBalance),
      other: 0,
      total: roundToCents(totalLiabilities),
      items: liabilityItems,
    },
    netWorth: roundToCents(totalAssets - totalLiabilities),
  };
}

/**
 * Milestone thresholds for net worth achievements.
 */
export const NET_WORTH_MILESTONES = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];

/**
 * Detect milestones crossed compared to a previous snapshot.
 */
export function detectMilestones(currentNetWorth: number, previousNetWorth: number): number[] {
  return NET_WORTH_MILESTONES.filter(
    (milestone) => currentNetWorth >= milestone && previousNetWorth < milestone
  );
}
