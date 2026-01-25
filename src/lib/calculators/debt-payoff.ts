/**
 * Debt Payoff Calculator
 *
 * Compare snowball vs avalanche debt repayment strategies
 */

import Decimal from 'decimal.js';
import { roundToCents } from '@/lib/money';
import type {
  DebtAccount,
  DebtPayoffInput,
  DebtPayoffResult,
  StrategyResult,
  DebtPaymentMonth,
  DebtStrategy,
} from './types';

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Calculate debt payoff using both strategies
 *
 * @param input - Debt accounts and extra payment amount
 * @returns Comparison of snowball and avalanche strategies
 */
export function calculateDebtPayoff(input: DebtPayoffInput): DebtPayoffResult {
  const { debts, extraMonthlyPayment } = input;

  if (debts.length === 0) {
    return createEmptyResult();
  }

  const snowball = calculateStrategy(debts, extraMonthlyPayment, 'snowball');
  const avalanche = calculateStrategy(debts, extraMonthlyPayment, 'avalanche');

  const interestSaved = roundToCents(snowball.totalInterest - avalanche.totalInterest);
  const monthsSaved = snowball.totalMonths - avalanche.totalMonths;

  return {
    snowball,
    avalanche,
    interestSaved,
    monthsSaved,
    recommendedStrategy: avalanche.totalInterest <= snowball.totalInterest ? 'avalanche' : 'snowball',
  };
}

/**
 * Calculate debt payoff for a specific strategy
 */
function calculateStrategy(
  debts: DebtAccount[],
  extraMonthlyPayment: number,
  strategy: DebtStrategy
): StrategyResult {
  // Clone debts and sort according to strategy
  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === 'snowball') {
      // Smallest balance first
      return a.balance - b.balance;
    } else {
      // Highest interest rate first
      return b.apr - a.apr;
    }
  });

  // Initialize balances
  const balances = new Map<string, Decimal>();
  sortedDebts.forEach((debt) => {
    balances.set(debt.id, new Decimal(debt.balance));
  });

  const schedule: DebtPaymentMonth[] = [];
  const debtPayoffOrder: string[] = [];
  let totalInterest = new Decimal(0);
  let month = 0;
  const maxMonths = 600; // 50 years cap

  // Calculate total minimum payments
  const totalMinimumPayments = sortedDebts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );

  // Total available payment each month
  const totalMonthlyPayment = totalMinimumPayments + extraMonthlyPayment;

  while (hasRemainingDebt(balances) && month < maxMonths) {
    month++;
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() + month);

    const payments: DebtPaymentMonth['payments'] = [];
    let availableExtra = new Decimal(extraMonthlyPayment);

    // First pass: Apply minimum payments and calculate interest
    for (const debt of sortedDebts) {
      const currentBalance = balances.get(debt.id)!;
      if (currentBalance.lessThanOrEqualTo(0)) continue;

      // Calculate monthly interest
      const monthlyInterestRate = new Decimal(debt.apr).dividedBy(100).dividedBy(12);
      const interest = currentBalance.times(monthlyInterestRate);
      totalInterest = totalInterest.plus(interest);

      // Apply minimum payment (or remaining balance if less)
      const balanceWithInterest = currentBalance.plus(interest);
      const minPayment = new Decimal(Math.min(debt.minimumPayment, balanceWithInterest.toNumber()));
      const principal = minPayment.minus(interest);
      const newBalance = balanceWithInterest.minus(minPayment);

      balances.set(debt.id, newBalance.greaterThan(0) ? newBalance : new Decimal(0));

      payments.push({
        debtId: debt.id,
        debtName: debt.name,
        payment: roundToCents(minPayment.toNumber()),
        principal: roundToCents(principal.toNumber()),
        interest: roundToCents(interest.toNumber()),
        remainingBalance: roundToCents(balances.get(debt.id)!.toNumber()),
      });
    }

    // Second pass: Apply extra payment to target debt (based on strategy order)
    for (const debt of sortedDebts) {
      if (availableExtra.lessThanOrEqualTo(0)) break;

      const currentBalance = balances.get(debt.id)!;
      if (currentBalance.lessThanOrEqualTo(0)) continue;

      // Apply extra to this debt
      const extraToApply = Decimal.min(availableExtra, currentBalance);
      const newBalance = currentBalance.minus(extraToApply);
      balances.set(debt.id, newBalance);
      availableExtra = availableExtra.minus(extraToApply);

      // Update payment record
      const paymentRecord = payments.find((p) => p.debtId === debt.id);
      if (paymentRecord) {
        paymentRecord.payment = roundToCents(
          new Decimal(paymentRecord.payment).plus(extraToApply).toNumber()
        );
        paymentRecord.principal = roundToCents(
          new Decimal(paymentRecord.principal).plus(extraToApply).toNumber()
        );
        paymentRecord.remainingBalance = roundToCents(newBalance.toNumber());
      }

      // Track when debts are paid off
      if (newBalance.lessThanOrEqualTo(0) && !debtPayoffOrder.includes(debt.id)) {
        debtPayoffOrder.push(debt.id);
      }
    }

    const totalPayment = payments.reduce((sum, p) => sum + p.payment, 0);
    const totalRemaining = Array.from(balances.values()).reduce(
      (sum, b) => sum.plus(b),
      new Decimal(0)
    );

    schedule.push({
      month,
      date: monthDate,
      payments,
      totalPayment: roundToCents(totalPayment),
      totalRemaining: roundToCents(totalRemaining.toNumber()),
    });
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return {
    strategy,
    totalMonths: month,
    totalInterest: roundToCents(totalInterest.toNumber()),
    payoffDate,
    schedule,
    debtPayoffOrder,
  };
}

/**
 * Check if any debt still has a remaining balance
 */
function hasRemainingDebt(balances: Map<string, Decimal>): boolean {
  return Array.from(balances.values()).some((b) => b.greaterThan(0.01));
}

/**
 * Create empty result for when there are no debts
 */
function createEmptyResult(): DebtPayoffResult {
  const emptyStrategy: StrategyResult = {
    strategy: 'snowball',
    totalMonths: 0,
    totalInterest: 0,
    payoffDate: new Date(),
    schedule: [],
    debtPayoffOrder: [],
  };

  return {
    snowball: { ...emptyStrategy, strategy: 'snowball' },
    avalanche: { ...emptyStrategy, strategy: 'avalanche' },
    interestSaved: 0,
    monthsSaved: 0,
    recommendedStrategy: 'avalanche',
  };
}

/**
 * Generate a unique ID for a new debt
 */
export function generateDebtId(): string {
  return `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
