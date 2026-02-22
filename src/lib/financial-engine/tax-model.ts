/**
 * Tax Model Engine
 *
 * Progressive tax bracket modeling with standard/itemized deductions.
 * Models US federal income tax brackets (2024).
 * All functions are pure, accept/return numbers with Decimal.js precision.
 */

import Decimal from "decimal.js";
import { roundToCents } from "@/lib/money";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ============================================================================
// Types
// ============================================================================

export type FilingStatus =
  | "single"
  | "married_jointly"
  | "married_separately"
  | "head_of_household";

export interface TaxBracket {
  /** Minimum taxable income for this bracket */
  min: number;
  /** Maximum taxable income for this bracket (Infinity for top bracket) */
  max: number;
  /** Marginal tax rate (percent, e.g. 22) */
  rate: number;
}

export interface TaxEstimatorInput {
  /** Gross annual income */
  grossIncome: number;
  /** Filing status */
  filingStatus: FilingStatus;
  /** Use itemized deductions instead of standard */
  useItemized?: boolean;
  /** Total itemized deductions (only used if useItemized is true) */
  itemizedDeductions?: number;
  /** Pre-tax retirement contributions (401k, IRA) */
  retirementContributions?: number;
  /** Other above-the-line deductions (HSA, student loan interest) */
  otherDeductions?: number;
}

export interface TaxBracketBreakdown {
  /** Tax bracket rate (percent) */
  rate: number;
  /** Taxable income in this bracket */
  taxableInBracket: number;
  /** Tax owed in this bracket */
  taxInBracket: number;
}

export interface TaxEstimatorResult {
  /** Gross income */
  grossIncome: number;
  /** Adjusted Gross Income (after above-the-line deductions) */
  adjustedGrossIncome: number;
  /** Deduction applied (standard or itemized) */
  deductionAmount: number;
  /** Whether standard or itemized was used */
  deductionType: "standard" | "itemized";
  /** Taxable income after deductions */
  taxableIncome: number;
  /** Total federal income tax */
  totalTax: number;
  /** Effective tax rate (percent) */
  effectiveTaxRate: number;
  /** Marginal tax rate (percent, the bracket you're in) */
  marginalTaxRate: number;
  /** Take-home pay (after federal income tax only) */
  takeHomePay: number;
  /** Monthly take-home */
  monthlyTakeHome: number;
  /** Bracket-by-bracket breakdown */
  bracketBreakdown: TaxBracketBreakdown[];
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
export function calculateTaxEstimate(input: TaxEstimatorInput): TaxEstimatorResult {
  const {
    grossIncome,
    filingStatus,
    useItemized = false,
    itemizedDeductions = 0,
    retirementContributions = 0,
    otherDeductions = 0,
  } = input;

  // Step 1: Adjusted Gross Income
  const aboveTheLineDeductions = new Decimal(retirementContributions).plus(otherDeductions);
  const agi = Decimal.max(new Decimal(0), new Decimal(grossIncome).minus(aboveTheLineDeductions));

  // Step 2: Choose deduction
  const standardDeduction = STANDARD_DEDUCTION[filingStatus];
  const deductionType: "standard" | "itemized" =
    useItemized && itemizedDeductions > standardDeduction ? "itemized" : "standard";
  const deductionAmount = deductionType === "itemized" ? itemizedDeductions : standardDeduction;

  // Step 3: Taxable income
  const taxableIncome = Decimal.max(new Decimal(0), agi.minus(deductionAmount));
  const taxableNum = roundToCents(taxableIncome.toNumber());

  // Step 4: Calculate tax by bracket
  const brackets = TAX_BRACKETS[filingStatus];
  const bracketBreakdown: TaxBracketBreakdown[] = [];
  let totalTax = new Decimal(0);
  let marginalTaxRate = 0;

  for (const bracket of brackets) {
    if (taxableNum <= bracket.min) break;

    const taxableInBracket = Math.min(taxableNum, bracket.max) - bracket.min;
    const taxInBracket = new Decimal(taxableInBracket).times(
      new Decimal(bracket.rate).dividedBy(100)
    );

    if (taxableInBracket > 0) {
      bracketBreakdown.push({
        rate: bracket.rate,
        taxableInBracket: roundToCents(taxableInBracket),
        taxInBracket: roundToCents(taxInBracket.toNumber()),
      });

      totalTax = totalTax.plus(taxInBracket);
      marginalTaxRate = bracket.rate;
    }
  }

  const totalTaxNum = roundToCents(totalTax.toNumber());
  const effectiveTaxRate =
    grossIncome > 0
      ? new Decimal(totalTaxNum).dividedBy(grossIncome).times(100).toDecimalPlaces(2).toNumber()
      : 0;

  const takeHomePay = roundToCents(new Decimal(grossIncome).minus(totalTaxNum).toNumber());

  return {
    grossIncome,
    adjustedGrossIncome: roundToCents(agi.toNumber()),
    deductionAmount,
    deductionType,
    taxableIncome: taxableNum,
    totalTax: totalTaxNum,
    effectiveTaxRate,
    marginalTaxRate,
    takeHomePay,
    monthlyTakeHome: roundToCents(takeHomePay / 12),
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
