/**
 * Amortization Engine (Decimal.js Precision)
 *
 * Precise implementations of mortgage/loan amortization calculations.
 * Replaces the floating-point versions in src/lib/loans/calculations.ts
 * with Decimal.js precision for financial accuracy.
 */

import Decimal from "decimal.js";
import { roundToCents } from "@/lib/money";
import type {
  AmortizationInput,
  AmortizationResult,
  AmortizationEntry,
  AffordabilityInput,
  AffordabilityResult,
} from "./types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Calculate monthly payment using standard amortization formula with Decimal.js.
 * M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (annualRate === 0) return roundToCents(principal / termMonths);

  const P = new Decimal(principal);
  const i = new Decimal(annualRate).dividedBy(100).dividedBy(12);
  const n = termMonths;

  const onePlusI = new Decimal(1).plus(i);
  const compoundFactor = onePlusI.pow(n);

  const payment = P.times(i.times(compoundFactor)).dividedBy(compoundFactor.minus(1));

  return roundToCents(payment.toNumber());
}

/**
 * Generate full amortization schedule with Decimal.js precision.
 */
export function generateAmortizationSchedule(input: AmortizationInput): AmortizationResult {
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

  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const monthlyRate =
    annualRate === 0 ? new Decimal(0) : new Decimal(annualRate).dividedBy(100).dividedBy(12);

  const schedule: AmortizationEntry[] = [];
  let balance = new Decimal(principal);
  let cumulativeInterest = new Decimal(0);
  let cumulativePrincipal = new Decimal(0);
  let totalPaid = new Decimal(0);

  for (let month = 1; month <= termMonths; month++) {
    // Interest for this period
    const interestPayment = balance.times(monthlyRate);

    // Principal from regular payment
    let principalPayment = new Decimal(monthlyPayment).minus(interestPayment);

    // Extra payment
    let actualExtra = new Decimal(extraPayment);

    // Ensure we don't overpay
    const maxPrincipal = balance;
    if (principalPayment.plus(actualExtra).greaterThan(maxPrincipal)) {
      const totalAvailable = maxPrincipal;
      if (principalPayment.greaterThan(totalAvailable)) {
        principalPayment = totalAvailable;
        actualExtra = new Decimal(0);
      } else {
        actualExtra = totalAvailable.minus(principalPayment);
      }
    }

    const totalPrincipalThisMonth = principalPayment.plus(actualExtra);
    balance = Decimal.max(new Decimal(0), balance.minus(totalPrincipalThisMonth));
    cumulativeInterest = cumulativeInterest.plus(interestPayment);
    cumulativePrincipal = cumulativePrincipal.plus(totalPrincipalThisMonth);

    const payment = interestPayment.plus(totalPrincipalThisMonth);
    totalPaid = totalPaid.plus(payment);

    schedule.push({
      month,
      payment: roundToCents(payment.toNumber()),
      principal: roundToCents(principalPayment.toNumber()),
      interest: roundToCents(interestPayment.toNumber()),
      extraPayment: roundToCents(actualExtra.toNumber()),
      balance: roundToCents(balance.toNumber()),
      cumulativeInterest: roundToCents(cumulativeInterest.toNumber()),
      cumulativePrincipal: roundToCents(cumulativePrincipal.toNumber()),
    });

    // Break if paid off
    if (balance.lessThanOrEqualTo(0)) break;
  }

  return {
    monthlyPayment,
    totalPaid: roundToCents(totalPaid.toNumber()),
    totalInterest: roundToCents(cumulativeInterest.toNumber()),
    payoffMonths: schedule.length,
    schedule,
  };
}

/**
 * Calculate home affordability based on income and debts.
 * Uses the DTI (Debt-to-Income) ratio method.
 */
export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const {
    annualIncome,
    monthlyDebts,
    downPaymentPercent,
    annualRate,
    termMonths,
    maxDTI = 36,
  } = input;

  const monthlyIncome = new Decimal(annualIncome).dividedBy(12);
  const maxMonthlyDebtPayment = monthlyIncome.times(new Decimal(maxDTI).dividedBy(100));
  const maxMortgagePayment = Decimal.max(new Decimal(0), maxMonthlyDebtPayment.minus(monthlyDebts));

  // Reverse the payment formula to get max loan amount
  // P = M * [(1+i)^n - 1] / [i * (1+i)^n]
  let maxLoanAmount: Decimal;

  if (annualRate === 0) {
    maxLoanAmount = maxMortgagePayment.times(termMonths);
  } else {
    const i = new Decimal(annualRate).dividedBy(100).dividedBy(12);
    const onePlusI = new Decimal(1).plus(i);
    const compoundFactor = onePlusI.pow(termMonths);

    maxLoanAmount = maxMortgagePayment
      .times(compoundFactor.minus(1))
      .dividedBy(i.times(compoundFactor));
  }

  // Calculate home price from loan amount + down payment
  const downPaymentFraction = new Decimal(downPaymentPercent).dividedBy(100);
  const loanFraction = new Decimal(1).minus(downPaymentFraction);

  const maxHomePrice = loanFraction.greaterThan(0)
    ? maxLoanAmount.dividedBy(loanFraction)
    : maxLoanAmount;

  const downPayment = maxHomePrice.times(downPaymentFraction);

  // Calculate actual DTI
  const actualPayment = calculateMonthlyPayment(
    roundToCents(maxLoanAmount.toNumber()),
    annualRate,
    termMonths
  );
  const dtiRatio = monthlyIncome.greaterThan(0)
    ? new Decimal(actualPayment)
        .plus(monthlyDebts)
        .dividedBy(monthlyIncome)
        .times(100)
        .toDecimalPlaces(2)
        .toNumber()
    : 0;

  return {
    maxHomePrice: roundToCents(maxHomePrice.toNumber()),
    maxLoanAmount: roundToCents(maxLoanAmount.toNumber()),
    downPayment: roundToCents(downPayment.toNumber()),
    monthlyPayment: actualPayment,
    dtiRatio,
  };
}
