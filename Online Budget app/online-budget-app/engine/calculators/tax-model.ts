/**
 * Tax Model Engine
 *
 * Progressive tax bracket modeling with standard/itemized deductions.
 * Models US federal income tax brackets (2024).
 * Ported from offline app — Decimal.js replaced with native Math.
 * All functions are pure, accept/return regular numbers.
 */

import type {
  FilingStatus,
  TaxBracket,
  TaxEstimatorInput,
  TaxBracketBreakdown,
  TaxEstimatorResult,
} from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ============================================================================
// Tax Brackets (2024 US Federal)
// ============================================================================

const TAX_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ],
  married_jointly: [
    { min: 0, max: 23200, rate: 10 },
    { min: 23200, max: 94300, rate: 12 },
    { min: 94300, max: 201050, rate: 22 },
    { min: 201050, max: 383900, rate: 24 },
    { min: 383900, max: 487450, rate: 32 },
    { min: 487450, max: 731200, rate: 35 },
    { min: 731200, max: Infinity, rate: 37 },
  ],
  married_separately: [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 365600, rate: 35 },
    { min: 365600, max: Infinity, rate: 37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 10 },
    { min: 16550, max: 63100, rate: 12 },
    { min: 63100, max: 100500, rate: 22 },
    { min: 100500, max: 191950, rate: 24 },
    { min: 191950, max: 243700, rate: 32 },
    { min: 243700, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ],
};

const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  married_jointly: 29200,
  married_separately: 14600,
  head_of_household: 21900,
};

// ============================================================================
// Calculation
// ============================================================================

/**
 * Calculate federal income tax estimate.
 */
export function calculateTaxEstimate(
  input: TaxEstimatorInput
): TaxEstimatorResult {
  const {
    grossIncome,
    filingStatus,
    useItemized = false,
    itemizedDeductions = 0,
    retirementContributions = 0,
    otherDeductions = 0,
  } = input;

  // Step 1: Adjusted Gross Income
  const aboveTheLineDeductions = retirementContributions + otherDeductions;
  const agi = Math.max(0, grossIncome - aboveTheLineDeductions);

  // Step 2: Choose deduction
  const standardDeduction = STANDARD_DEDUCTION[filingStatus];
  const deductionType: "standard" | "itemized" =
    useItemized && itemizedDeductions > standardDeduction
      ? "itemized"
      : "standard";
  const deductionAmount =
    deductionType === "itemized" ? itemizedDeductions : standardDeduction;

  // Step 3: Taxable income
  const taxableIncome = Math.max(0, agi - deductionAmount);
  const taxableNum = round2(taxableIncome);

  // Step 4: Calculate tax by bracket
  const brackets = TAX_BRACKETS[filingStatus];
  const bracketBreakdown: TaxBracketBreakdown[] = [];
  let totalTax = 0;
  let marginalTaxRate = 0;

  for (const bracket of brackets) {
    if (taxableNum <= bracket.min) break;

    const taxableInBracket = Math.min(taxableNum, bracket.max) - bracket.min;
    const taxInBracket = taxableInBracket * (bracket.rate / 100);

    if (taxableInBracket > 0) {
      bracketBreakdown.push({
        rate: bracket.rate,
        taxableInBracket: round2(taxableInBracket),
        taxInBracket: round2(taxInBracket),
      });

      totalTax += taxInBracket;
      marginalTaxRate = bracket.rate;
    }
  }

  const totalTaxNum = round2(totalTax);
  const effectiveTaxRate =
    grossIncome > 0 ? round2((totalTaxNum / grossIncome) * 100) : 0;

  const takeHomePay = round2(grossIncome - totalTaxNum);

  return {
    grossIncome,
    adjustedGrossIncome: round2(agi),
    deductionAmount,
    deductionType,
    taxableIncome: taxableNum,
    totalTax: totalTaxNum,
    effectiveTaxRate,
    marginalTaxRate,
    takeHomePay,
    monthlyTakeHome: round2(takeHomePay / 12),
    bracketBreakdown,
  };
}

/** Get standard deduction for a filing status */
export function getStandardDeduction(filingStatus: FilingStatus): number {
  return STANDARD_DEDUCTION[filingStatus];
}

/** Get tax brackets for a filing status */
export function getTaxBrackets(filingStatus: FilingStatus): TaxBracket[] {
  return TAX_BRACKETS[filingStatus];
}
