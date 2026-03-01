/**
 * Amortization Engine
 *
 * Precise implementations of mortgage/loan amortization calculations.
 * Ported from offline app — Decimal.js replaced with native Math.
 * All functions accept/return regular numbers (major units).
 */

import type {
  AmortizationInput,
  AmortizationResult,
  AmortizationEntry,
  AffordabilityInput,
  AffordabilityResult,
} from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate monthly payment using standard amortization formula.
 * M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (annualRate === 0) return round2(principal / termMonths);

  const i = annualRate / 100 / 12;
  const compoundFactor = Math.pow(1 + i, termMonths);

  const payment = principal * ((i * compoundFactor) / (compoundFactor - 1));
  return round2(payment);
}

/**
 * Generate full amortization schedule.
 */
export function generateAmortizationSchedule(
  input: AmortizationInput
): AmortizationResult {
  const { principal, annualRate, termMonths, extraPayment = 0 } = input;

  if (principal <= 0 || termMonths <= 0) {
    return {
      monthlyPayment: 0,
      totalPaid: 0,
      totalInterest: 0,
      payoffMonths: 0,
      schedule: [],
    };
  }

  const monthlyPayment = calculateMonthlyPayment(
    principal,
    annualRate,
    termMonths
  );
  const monthlyRate = annualRate === 0 ? 0 : annualRate / 100 / 12;

  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let totalPaid = 0;

  for (let month = 1; month <= termMonths; month++) {
    // Interest for this period
    const interestPayment = balance * monthlyRate;

    // Principal from regular payment
    let principalPayment = monthlyPayment - interestPayment;

    // Extra payment
    let actualExtra = extraPayment;

    // Ensure we don't overpay
    const maxPrincipal = balance;
    if (principalPayment + actualExtra > maxPrincipal) {
      if (principalPayment > maxPrincipal) {
        principalPayment = maxPrincipal;
        actualExtra = 0;
      } else {
        actualExtra = maxPrincipal - principalPayment;
      }
    }

    const totalPrincipalThisMonth = principalPayment + actualExtra;
    balance = Math.max(0, balance - totalPrincipalThisMonth);
    cumulativeInterest += interestPayment;
    cumulativePrincipal += totalPrincipalThisMonth;

    const payment = interestPayment + totalPrincipalThisMonth;
    totalPaid += payment;

    schedule.push({
      month,
      payment: round2(payment),
      principal: round2(principalPayment),
      interest: round2(interestPayment),
      extraPayment: round2(actualExtra),
      balance: round2(balance),
      cumulativeInterest: round2(cumulativeInterest),
      cumulativePrincipal: round2(cumulativePrincipal),
    });

    // Break if paid off
    if (balance <= 0) break;
  }

  return {
    monthlyPayment,
    totalPaid: round2(totalPaid),
    totalInterest: round2(cumulativeInterest),
    payoffMonths: schedule.length,
    schedule,
  };
}

/**
 * Calculate home affordability based on income and debts.
 * Uses the DTI (Debt-to-Income) ratio method.
 */
export function calculateAffordability(
  input: AffordabilityInput
): AffordabilityResult {
  const {
    annualIncome,
    monthlyDebts,
    downPaymentPercent,
    annualRate,
    termMonths,
    maxDTI = 36,
  } = input;

  const monthlyIncome = annualIncome / 12;
  const maxMonthlyDebtPayment = monthlyIncome * (maxDTI / 100);
  const maxMortgagePayment = Math.max(0, maxMonthlyDebtPayment - monthlyDebts);

  // Reverse the payment formula to get max loan amount
  // P = M * [(1+i)^n - 1] / [i * (1+i)^n]
  let maxLoanAmount: number;

  if (annualRate === 0) {
    maxLoanAmount = maxMortgagePayment * termMonths;
  } else {
    const i = annualRate / 100 / 12;
    const compoundFactor = Math.pow(1 + i, termMonths);

    maxLoanAmount =
      (maxMortgagePayment * (compoundFactor - 1)) / (i * compoundFactor);
  }

  // Calculate home price from loan amount + down payment
  const downPaymentFraction = downPaymentPercent / 100;
  const loanFraction = 1 - downPaymentFraction;

  const maxHomePrice =
    loanFraction > 0 ? maxLoanAmount / loanFraction : maxLoanAmount;

  const downPayment = maxHomePrice * downPaymentFraction;

  // Calculate actual DTI
  const actualPayment = calculateMonthlyPayment(
    round2(maxLoanAmount),
    annualRate,
    termMonths
  );
  const dtiRatio =
    monthlyIncome > 0
      ? round2(((actualPayment + monthlyDebts) / monthlyIncome) * 100)
      : 0;

  return {
    maxHomePrice: round2(maxHomePrice),
    maxLoanAmount: round2(maxLoanAmount),
    downPayment: round2(downPayment),
    monthlyPayment: actualPayment,
    dtiRatio,
  };
}
