/**
 * Debt Payoff Calculator
 *
 * Compare snowball vs avalanche debt repayment strategies.
 * Supports custom ordering and one-time extra payments.
 * Ported from offline app — Decimal.js replaced with native Math.
 * All functions are pure, accept/return regular numbers.
 */

import type {
  DebtAccount,
  DebtPayoffInput,
  DebtPayoffResult,
  StrategyResult,
  DebtPaymentMonth,
  DebtStrategy,
  OneTimePayment,
} from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

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

  const snowball = calculateStrategy(debts, extraMonthlyPayment, "snowball");
  const avalanche = calculateStrategy(debts, extraMonthlyPayment, "avalanche");

  const interestSaved = round2(snowball.totalInterest - avalanche.totalInterest);
  const monthsSaved = snowball.totalMonths - avalanche.totalMonths;

  return {
    snowball,
    avalanche,
    interestSaved,
    monthsSaved,
    recommendedStrategy:
      avalanche.totalInterest <= snowball.totalInterest ? "avalanche" : "snowball",
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
    if (strategy === "snowball") {
      // Smallest balance first
      return a.balance - b.balance;
    } else {
      // Highest interest rate first
      return b.apr - a.apr;
    }
  });

  // Initialize balances
  const balances = new Map<string, number>();
  sortedDebts.forEach((debt) => {
    balances.set(debt.id, debt.balance);
  });

  const schedule: DebtPaymentMonth[] = [];
  const debtPayoffOrder: string[] = [];
  let totalInterest = 0;
  let month = 0;
  const maxMonths = 600; // 50 years cap

  while (hasRemainingDebt(balances) && month < maxMonths) {
    month++;
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() + month);

    const payments: DebtPaymentMonth["payments"] = [];
    let availableExtra = extraMonthlyPayment;

    // First pass: Apply minimum payments and calculate interest
    for (const debt of sortedDebts) {
      const currentBalance = balances.get(debt.id)!;
      if (currentBalance <= 0) continue;

      // Calculate monthly interest
      const monthlyInterestRate = debt.apr / 100 / 12;
      const interest = currentBalance * monthlyInterestRate;
      totalInterest += interest;

      // Apply minimum payment (or remaining balance if less)
      const balanceWithInterest = currentBalance + interest;
      const minPayment = Math.min(debt.minimumPayment, balanceWithInterest);
      const principal = minPayment - interest;
      const newBalance = balanceWithInterest - minPayment;

      balances.set(debt.id, newBalance > 0 ? newBalance : 0);

      payments.push({
        debtId: debt.id,
        debtName: debt.name,
        payment: round2(minPayment),
        principal: round2(principal),
        interest: round2(interest),
        remainingBalance: round2(balances.get(debt.id)!),
      });
    }

    // Second pass: Apply extra payment to target debt (based on strategy order)
    for (const debt of sortedDebts) {
      if (availableExtra <= 0) break;

      const currentBalance = balances.get(debt.id)!;
      if (currentBalance <= 0) continue;

      // Apply extra to this debt
      const extraToApply = Math.min(availableExtra, currentBalance);
      const newBalance = currentBalance - extraToApply;
      balances.set(debt.id, newBalance);
      availableExtra -= extraToApply;

      // Update payment record
      const paymentRecord = payments.find((p) => p.debtId === debt.id);
      if (paymentRecord) {
        paymentRecord.payment = round2(paymentRecord.payment + extraToApply);
        paymentRecord.principal = round2(
          paymentRecord.principal + extraToApply
        );
        paymentRecord.remainingBalance = round2(newBalance);
      }

      // Track when debts are paid off
      if (newBalance <= 0 && !debtPayoffOrder.includes(debt.id)) {
        debtPayoffOrder.push(debt.id);
      }
    }

    const totalPayment = payments.reduce((sum, p) => sum + p.payment, 0);
    const totalRemaining = Array.from(balances.values()).reduce(
      (sum, b) => sum + b,
      0
    );

    schedule.push({
      month,
      date: monthDate,
      payments,
      totalPayment: round2(totalPayment),
      totalRemaining: round2(totalRemaining),
    });
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return {
    strategy,
    totalMonths: month,
    totalInterest: round2(totalInterest),
    payoffDate,
    schedule,
    debtPayoffOrder,
  };
}

/**
 * Check if any debt still has a remaining balance
 */
function hasRemainingDebt(balances: Map<string, number>): boolean {
  return Array.from(balances.values()).some((b) => b > 0.01);
}

/**
 * Create empty result for when there are no debts
 */
function createEmptyResult(): DebtPayoffResult {
  const emptyStrategy: StrategyResult = {
    strategy: "snowball",
    totalMonths: 0,
    totalInterest: 0,
    payoffDate: new Date(),
    schedule: [],
    debtPayoffOrder: [],
  };

  return {
    snowball: { ...emptyStrategy, strategy: "snowball" },
    avalanche: { ...emptyStrategy, strategy: "avalanche" },
    interestSaved: 0,
    monthsSaved: 0,
    recommendedStrategy: "avalanche",
  };
}

/**
 * Calculate debt payoff for a single strategy configuration.
 * Supports custom ordering and one-time extra payments.
 */
export function calculateSingleStrategy(
  debts: DebtAccount[],
  extraMonthlyPayment: number,
  strategy: DebtStrategy,
  customOrder?: string[],
  oneTimePayments?: OneTimePayment[]
): StrategyResult {
  if (debts.length === 0) {
    return {
      strategy,
      totalMonths: 0,
      totalInterest: 0,
      payoffDate: new Date(),
      schedule: [],
      debtPayoffOrder: [],
    };
  }

  // Sort debts based on strategy
  let sortedDebts: DebtAccount[];
  if (strategy === "custom" && customOrder?.length) {
    const orderMap = new Map(customOrder.map((id, idx) => [id, idx]));
    sortedDebts = [...debts].sort(
      (a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999)
    );
  } else if (strategy === "snowball") {
    sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
  } else if (strategy === "minimum_only") {
    sortedDebts = [...debts]; // No extra payments applied
  } else {
    sortedDebts = [...debts].sort((a, b) => b.apr - a.apr); // avalanche
  }

  const balances = new Map<string, number>();
  sortedDebts.forEach((debt) => balances.set(debt.id, debt.balance));

  const schedule: DebtPaymentMonth[] = [];
  const debtPayoffOrder: string[] = [];
  let totalInterest = 0;
  let month = 0;
  const maxMonths = 600;

  const effectiveExtra = strategy === "minimum_only" ? 0 : extraMonthlyPayment;

  // Index one-time payments by month for quick lookup
  const otpByMonth = new Map<number, OneTimePayment[]>();
  if (oneTimePayments) {
    for (const otp of oneTimePayments) {
      const list = otpByMonth.get(otp.month) || [];
      list.push(otp);
      otpByMonth.set(otp.month, list);
    }
  }

  while (hasRemainingDebt(balances) && month < maxMonths) {
    month++;
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() + month);

    const payments: DebtPaymentMonth["payments"] = [];
    let availableExtra = effectiveExtra;

    // Apply one-time payments for this month
    const monthOTPs = otpByMonth.get(month) || [];
    for (const otp of monthOTPs) {
      const bal = balances.get(otp.targetDebtId);
      if (bal !== undefined && bal > 0) {
        const apply = Math.min(otp.amount, bal);
        balances.set(otp.targetDebtId, bal - apply);
      }
    }

    // First pass: minimum payments + interest
    for (const debt of sortedDebts) {
      const currentBalance = balances.get(debt.id)!;
      if (currentBalance <= 0) continue;

      const monthlyInterestRate = debt.apr / 100 / 12;
      const interest = currentBalance * monthlyInterestRate;
      totalInterest += interest;

      const balanceWithInterest = currentBalance + interest;
      const minPayment = Math.min(debt.minimumPayment, balanceWithInterest);
      const principal = minPayment - interest;
      const newBalance = balanceWithInterest - minPayment;

      balances.set(debt.id, newBalance > 0 ? newBalance : 0);

      payments.push({
        debtId: debt.id,
        debtName: debt.name,
        payment: round2(minPayment),
        principal: round2(principal),
        interest: round2(interest),
        remainingBalance: round2(balances.get(debt.id)!),
      });
    }

    // Second pass: apply extra payments
    for (const debt of sortedDebts) {
      if (availableExtra <= 0) break;
      const currentBalance = balances.get(debt.id)!;
      if (currentBalance <= 0) continue;

      const extraToApply = Math.min(availableExtra, currentBalance);
      balances.set(debt.id, currentBalance - extraToApply);
      availableExtra -= extraToApply;

      const paymentRecord = payments.find((p) => p.debtId === debt.id);
      if (paymentRecord) {
        paymentRecord.payment = round2(paymentRecord.payment + extraToApply);
        paymentRecord.principal = round2(
          paymentRecord.principal + extraToApply
        );
        paymentRecord.remainingBalance = round2(balances.get(debt.id)!);
      }

      if (
        balances.get(debt.id)! <= 0 &&
        !debtPayoffOrder.includes(debt.id)
      ) {
        debtPayoffOrder.push(debt.id);
      }
    }

    const totalPayment = payments.reduce((sum, p) => sum + p.payment, 0);
    const totalRemaining = Array.from(balances.values()).reduce(
      (sum, b) => sum + b,
      0
    );

    schedule.push({
      month,
      date: monthDate,
      payments,
      totalPayment: round2(totalPayment),
      totalRemaining: round2(totalRemaining),
    });
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return {
    strategy,
    totalMonths: month,
    totalInterest: round2(totalInterest),
    payoffDate,
    schedule,
    debtPayoffOrder,
  };
}

/**
 * Convert generic loan records to DebtAccount format for the calculator.
 * Accepts any object with id, name, currentBalance, interestRate, and monthlyPayment.
 */
export function loansToDebtAccounts(
  loans: {
    id: string;
    name?: string;
    lender?: string;
    type?: string;
    currentBalance: number;
    interestRate: number;
    monthlyPayment: number;
  }[]
): DebtAccount[] {
  return loans.map((loan) => ({
    id: loan.id,
    name: loan.name || loan.lender || loan.type || "Unknown",
    balance: loan.currentBalance,
    apr: loan.interestRate,
    minimumPayment: loan.monthlyPayment,
  }));
}

/**
 * Generate a unique ID for a new debt
 */
export function generateDebtId(): string {
  return `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
