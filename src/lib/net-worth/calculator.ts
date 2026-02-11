'use client';

/**
 * Net Worth Calculator
 *
 * Calculates current net worth from accounts, loans, holdings, and properties.
 * Extracted and extended from the Excel export net-worth-sheet.ts module.
 */

import { db } from '@/lib/budget-db';
import type { StoredNetWorthSnapshot, Account, Loan } from '@/types/budget';
import type { Holding } from '@/lib/budget-db';

export interface NetWorthBreakdown {
  assets: {
    cashChecking: number;
    savings: number;
    investments: number;
    property: number;
    other: number;
    total: number;
  };
  liabilities: {
    creditCards: number;
    loans: number;
    mortgage: number;
    other: number;
    total: number;
  };
  netWorth: number;
}

/**
 * Calculate current net worth from all data sources.
 */
export async function calculateCurrentNetWorth(): Promise<NetWorthBreakdown> {
  const [accounts, loans, holdings, properties] = await Promise.all([
    db.accounts.toArray(),
    db.loans.toArray(),
    db.holdings.toArray(),
    db.properties.toArray(),
  ]);

  // Assets
  const cashChecking = accounts
    .filter((a: Account) => a.type === 'checking')
    .reduce((sum: number, a: Account) => sum + a.balance, 0);

  const savings = accounts
    .filter((a: Account) => a.type === 'savings')
    .reduce((sum: number, a: Account) => sum + a.balance, 0);

  const investments = holdings.reduce(
    (sum: number, h: Holding) => sum + h.quantity * h.purchasePrice,
    0
  );

  const propertyValue = properties.reduce((sum, p) => sum + p.currentValue, 0);

  // Liabilities
  const creditCards = accounts
    .filter((a: Account) => a.type === 'credit')
    .reduce((sum: number, a: Account) => sum + Math.abs(a.balance), 0);

  const activeLoanBalance = loans
    .filter((l: Loan) => l.status === 'active' && l.type !== 'mortgage')
    .reduce((sum: number, l: Loan) => sum + l.currentBalance, 0);

  const mortgageBalance = loans
    .filter((l: Loan) => l.status === 'active' && l.type === 'mortgage')
    .reduce((sum: number, l: Loan) => sum + l.currentBalance, 0);

  const totalAssets = cashChecking + savings + investments + propertyValue;
  const totalLiabilities = creditCards + activeLoanBalance + mortgageBalance;

  return {
    assets: {
      cashChecking: round(cashChecking),
      savings: round(savings),
      investments: round(investments),
      property: round(propertyValue),
      other: 0,
      total: round(totalAssets),
    },
    liabilities: {
      creditCards: round(creditCards),
      loans: round(activeLoanBalance),
      mortgage: round(mortgageBalance),
      other: 0,
      total: round(totalLiabilities),
    },
    netWorth: round(totalAssets - totalLiabilities),
  };
}

/**
 * Milestone thresholds for net worth achievements.
 */
export const NET_WORTH_MILESTONES = [
  10000, 25000, 50000, 100000, 250000, 500000, 1000000,
];

/**
 * Detect milestones crossed compared to a previous snapshot.
 */
export function detectMilestones(
  currentNetWorth: number,
  previousNetWorth: number
): number[] {
  return NET_WORTH_MILESTONES.filter(
    (milestone) => currentNetWorth >= milestone && previousNetWorth < milestone
  );
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
