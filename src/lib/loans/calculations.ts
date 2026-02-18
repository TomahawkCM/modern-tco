/**
 * Loan Calculation Functions
 * Provides amortization schedules, payment calculations, and loan analytics
 */

import type { Loan, AmortizationEntry } from "@/types/budget";

/**
 * Calculate monthly payment using standard amortization formula
 * Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]
 * Where:
 *   M = Monthly payment
 *   P = Principal
 *   i = Monthly interest rate (annual rate / 12)
 *   n = Total number of payments (months)
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (annualInterestRate === 0) return principal / termMonths;

  const monthlyRate = annualInterestRate / 100 / 12;
  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return Math.round(payment * 100) / 100; // Round to 2 decimals
}

/**
 * Generate full amortization schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  termMonths: number,
  startDate: Date,
  monthlyPayment?: number
): AmortizationEntry[] {
  if (principal <= 0 || termMonths <= 0) return [];

  const payment =
    monthlyPayment || calculateMonthlyPayment(principal, annualInterestRate, termMonths);
  const monthlyRate = annualInterestRate / 100 / 12;
  const schedule: AmortizationEntry[] = [];

  let balance = principal;
  let cumulativeInterest = 0;

  for (let month = 1; month <= termMonths; month++) {
    // Calculate interest for this period
    const interestPayment = balance * monthlyRate;

    // Calculate principal payment
    let principalPayment = payment - interestPayment;

    // Last payment adjustment - pay off remaining balance
    if (month === termMonths || principalPayment > balance) {
      principalPayment = balance;
    }

    // Update balance
    balance = Math.max(0, balance - principalPayment);
    cumulativeInterest += interestPayment;

    // Calculate payment date
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + month);

    schedule.push({
      month,
      date: paymentDate,
      payment: Math.round((principalPayment + interestPayment) * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
    });

    // Break if paid off
    if (balance === 0) break;
  }

  return schedule;
}

/**
 * Calculate impact of extra payments on loan
 * Returns new schedule with extra payments applied
 */
export interface ExtraPaymentScenario {
  schedule: AmortizationEntry[];
  totalInterestSaved: number;
  monthsSaved: number;
  newPayoffDate: Date;
  originalTotalInterest: number;
  newTotalInterest: number;
}

export function calculateExtraPaymentImpact(
  loan: Loan,
  extraMonthlyPayment: number,
  oneTimePayments: { month: number; amount: number }[] = []
): ExtraPaymentScenario {
  const originalSchedule = generateAmortizationSchedule(
    loan.currentBalance,
    loan.interestRate,
    loan.termMonths,
    loan.startDate
  );

  const originalTotalInterest =
    originalSchedule[originalSchedule.length - 1]?.cumulativeInterest || 0;
  const monthlyRate = loan.interestRate / 100 / 12;
  const regularPayment = loan.monthlyPayment;

  const schedule: AmortizationEntry[] = [];
  let balance = loan.currentBalance;
  let cumulativeInterest = 0;
  let month = 1;

  while (balance > 0 && month <= loan.termMonths * 2) {
    // Safety limit: 2x original term
    // Interest for this period
    const interestPayment = balance * monthlyRate;

    // Principal from regular payment
    let principalPayment = regularPayment - interestPayment;

    // Add extra monthly payment
    principalPayment += extraMonthlyPayment;

    // Add one-time payment if scheduled for this month
    const oneTimePayment = oneTimePayments.find((p) => p.month === month);
    if (oneTimePayment) {
      principalPayment += oneTimePayment.amount;
    }

    // Don't overpay
    if (principalPayment > balance) {
      principalPayment = balance;
    }

    // Update balance
    balance = Math.max(0, balance - principalPayment);
    cumulativeInterest += interestPayment;

    // Calculate payment date
    const paymentDate = new Date(loan.startDate);
    paymentDate.setMonth(paymentDate.getMonth() + month);

    schedule.push({
      month,
      date: paymentDate,
      payment: Math.round((principalPayment + interestPayment) * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
    });

    month++;
  }

  const newTotalInterest = schedule[schedule.length - 1]?.cumulativeInterest || 0;
  const totalInterestSaved = originalTotalInterest - newTotalInterest;
  const monthsSaved = originalSchedule.length - schedule.length;
  const newPayoffDate = schedule[schedule.length - 1]?.date || new Date();

  return {
    schedule,
    totalInterestSaved: Math.round(totalInterestSaved * 100) / 100,
    monthsSaved,
    newPayoffDate,
    originalTotalInterest: Math.round(originalTotalInterest * 100) / 100,
    newTotalInterest: Math.round(newTotalInterest * 100) / 100,
  };
}

/**
 * Calculate total cost of loan
 */
export interface LoanCostAnalysis {
  totalPayments: number;
  totalPrincipal: number;
  totalInterest: number;
  effectiveInterestRate: number; // Actual interest as % of principal
  monthlyPayment: number;
  payoffDate: Date;
}

export function analyzeLoanCost(loan: Loan): LoanCostAnalysis {
  const schedule = generateAmortizationSchedule(
    loan.currentBalance,
    loan.interestRate,
    loan.termMonths,
    loan.startDate,
    loan.monthlyPayment
  );

  const totalInterest = schedule[schedule.length - 1]?.cumulativeInterest || 0;
  const totalPrincipal = loan.currentBalance;
  const totalPayments = totalPrincipal + totalInterest;
  const effectiveInterestRate = (totalInterest / totalPrincipal) * 100;
  const payoffDate = schedule[schedule.length - 1]?.date || new Date();

  return {
    totalPayments: Math.round(totalPayments * 100) / 100,
    totalPrincipal: Math.round(totalPrincipal * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    effectiveInterestRate: Math.round(effectiveInterestRate * 100) / 100,
    monthlyPayment: loan.monthlyPayment,
    payoffDate,
  };
}

/**
 * Calculate remaining balance on a specific date
 */
export function calculateBalanceOnDate(loan: Loan, targetDate: Date): number {
  const schedule = generateAmortizationSchedule(
    loan.currentBalance,
    loan.interestRate,
    loan.termMonths,
    loan.startDate,
    loan.monthlyPayment
  );

  // Find the entry closest to (but before or on) target date
  const entry = schedule
    .filter((e) => e.date <= targetDate)
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

  return entry?.balance || loan.currentBalance;
}

/**
 * Calculate how much interest will be paid over a time period
 */
export function calculateInterestForPeriod(loan: Loan, startDate: Date, endDate: Date): number {
  const schedule = generateAmortizationSchedule(
    loan.currentBalance,
    loan.interestRate,
    loan.termMonths,
    loan.startDate,
    loan.monthlyPayment
  );

  const relevantEntries = schedule.filter((e) => e.date >= startDate && e.date <= endDate);

  return relevantEntries.reduce((sum, entry) => sum + entry.interest, 0);
}

/**
 * Compare two loan scenarios (e.g., for refinancing)
 */
export interface LoanComparison {
  loan1Analysis: LoanCostAnalysis;
  loan2Analysis: LoanCostAnalysis;
  totalSavings: number;
  interestSavings: number;
  paymentDifference: number;
  timeDifference: number; // months
  recommendation: string;
}

export function compareLoans(loan1: Loan, loan2: Loan): LoanComparison {
  const analysis1 = analyzeLoanCost(loan1);
  const analysis2 = analyzeLoanCost(loan2);

  const totalSavings = analysis1.totalPayments - analysis2.totalPayments;
  const interestSavings = analysis1.totalInterest - analysis2.totalInterest;
  const paymentDifference = analysis1.monthlyPayment - analysis2.monthlyPayment;
  const timeDifference =
    (analysis1.payoffDate.getTime() - analysis2.payoffDate.getTime()) / (1000 * 60 * 60 * 24 * 30); // Rough months

  let recommendation = "";
  if (totalSavings > 0) {
    recommendation = `Loan 2 saves $${Math.abs(totalSavings).toFixed(2)} total`;
  } else if (totalSavings < 0) {
    recommendation = `Loan 1 saves $${Math.abs(totalSavings).toFixed(2)} total`;
  } else {
    recommendation = "Both loans have similar total costs";
  }

  return {
    loan1Analysis: analysis1,
    loan2Analysis: analysis2,
    totalSavings: Math.round(totalSavings * 100) / 100,
    interestSavings: Math.round(interestSavings * 100) / 100,
    paymentDifference: Math.round(paymentDifference * 100) / 100,
    timeDifference: Math.round(timeDifference),
    recommendation,
  };
}

/**
 * Calculate debt snowball plan (pay off smallest balance first)
 */
export interface DebtPayoffPlan {
  loanId: string;
  order: number;
  payoffDate: Date;
  totalInterest: number;
}

export function calculateDebtSnowball(loans: Loan[], extraMonthlyAmount: number): DebtPayoffPlan[] {
  // Sort by current balance (smallest first)
  const sortedLoans = [...loans].sort((a, b) => a.currentBalance - b.currentBalance);

  const plan: DebtPayoffPlan[] = [];
  let cumulativeExtraPayment = extraMonthlyAmount;
  let currentDate = new Date();

  sortedLoans.forEach((loan, index) => {
    const scenario = calculateExtraPaymentImpact(loan, cumulativeExtraPayment);

    plan.push({
      loanId: loan.id,
      order: index + 1,
      payoffDate: scenario.newPayoffDate,
      totalInterest: scenario.newTotalInterest,
    });

    // After paying off this loan, add its payment to the snowball
    cumulativeExtraPayment += loan.monthlyPayment;
    currentDate = scenario.newPayoffDate;
  });

  return plan;
}

/**
 * Calculate debt avalanche plan (pay off highest interest rate first)
 */
export function calculateDebtAvalanche(
  loans: Loan[],
  extraMonthlyAmount: number
): DebtPayoffPlan[] {
  // Sort by interest rate (highest first)
  const sortedLoans = [...loans].sort((a, b) => b.interestRate - a.interestRate);

  const plan: DebtPayoffPlan[] = [];
  let cumulativeExtraPayment = extraMonthlyAmount;
  let currentDate = new Date();

  sortedLoans.forEach((loan, index) => {
    const scenario = calculateExtraPaymentImpact(loan, cumulativeExtraPayment);

    plan.push({
      loanId: loan.id,
      order: index + 1,
      payoffDate: scenario.newPayoffDate,
      totalInterest: scenario.newTotalInterest,
    });

    // After paying off this loan, add its payment to the avalanche
    cumulativeExtraPayment += loan.monthlyPayment;
    currentDate = scenario.newPayoffDate;
  });

  return plan;
}
