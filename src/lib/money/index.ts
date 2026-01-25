/**
 * Money Utilities Module
 *
 * Handles financial calculations with proper decimal precision to avoid
 * floating-point errors that can cause incorrect totals in financial applications.
 *
 * Uses decimal.js for precise arithmetic operations and always rounds to cents.
 */

import Decimal from 'decimal.js';

// Configure Decimal.js for financial precision
// - 20 digits of precision (more than enough for any currency)
// - ROUND_HALF_UP: Standard banker's rounding (0.5 rounds to 1)
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Round a number to exactly 2 decimal places (cents)
 * Use this immediately after parsing any amount from user input or files
 *
 * @example
 * roundToCents(0.1 + 0.2) // Returns 0.3, not 0.30000000000000004
 * roundToCents(1.234) // Returns 1.23
 * roundToCents(1.235) // Returns 1.24 (banker's rounding)
 */
export function roundToCents(amount: number): number {
  if (!isFinite(amount)) return 0;
  return new Decimal(amount).toDecimalPlaces(2).toNumber();
}

/**
 * Sum an array of amounts with proper precision
 * Avoids accumulating floating-point errors when adding many values
 *
 * @example
 * sumAmounts([0.1, 0.2, 0.3]) // Returns 0.6 exactly
 * sumAmounts([19.99, 29.99, 14.99]) // Returns 64.97 exactly
 */
export function sumAmounts(amounts: number[]): number {
  if (!amounts || amounts.length === 0) return 0;

  return amounts
    .reduce((sum, amt) => {
      const value = isFinite(amt) ? amt : 0;
      return sum.plus(new Decimal(value));
    }, new Decimal(0))
    .toDecimalPlaces(2)
    .toNumber();
}

/**
 * Subtract two amounts with proper precision
 *
 * @example
 * subtractAmounts(100.00, 49.99) // Returns 50.01 exactly
 */
export function subtractAmounts(a: number, b: number): number {
  const valA = isFinite(a) ? a : 0;
  const valB = isFinite(b) ? b : 0;
  return new Decimal(valA).minus(valB).toDecimalPlaces(2).toNumber();
}

/**
 * Multiply an amount by a factor with proper precision
 * Useful for applying tax rates, discounts, or unit conversions
 *
 * @example
 * multiplyAmount(99.99, 1.08) // Returns 107.99 (with tax)
 * multiplyAmount(50.00, 0.5)  // Returns 25.00 (50% off)
 */
export function multiplyAmount(amount: number, factor: number): number {
  const valAmount = isFinite(amount) ? amount : 0;
  const valFactor = isFinite(factor) ? factor : 1;
  return new Decimal(valAmount).times(valFactor).toDecimalPlaces(2).toNumber();
}

/**
 * Divide an amount by a divisor with proper precision
 *
 * @example
 * divideAmount(100.00, 3) // Returns 33.33 (not 33.333333...)
 */
export function divideAmount(amount: number, divisor: number): number {
  const valAmount = isFinite(amount) ? amount : 0;
  const valDivisor = isFinite(divisor) && divisor !== 0 ? divisor : 1;
  return new Decimal(valAmount).dividedBy(valDivisor).toDecimalPlaces(2).toNumber();
}

/**
 * Calculate percentage of an amount
 *
 * @example
 * percentageOf(200.00, 15) // Returns 30.00 (15% of 200)
 */
export function percentageOf(amount: number, percentage: number): number {
  return multiplyAmount(amount, percentage / 100);
}

/**
 * Compare two amounts for equality with floating-point tolerance
 * Two amounts are equal if they round to the same cents value
 *
 * @example
 * amountsEqual(0.1 + 0.2, 0.3) // Returns true
 */
export function amountsEqual(a: number, b: number): boolean {
  return roundToCents(a) === roundToCents(b);
}

/**
 * Format an amount as a currency string (for display)
 * This is a simple formatter - for full i18n support use Intl.NumberFormat
 *
 * @example
 * formatAmount(1234.56) // Returns "1,234.56"
 * formatAmount(-50.00)  // Returns "-50.00"
 */
export function formatAmount(amount: number, options?: {
  locale?: string;
  currency?: string;
  showCurrency?: boolean;
}): string {
  const { locale = 'en-US', currency = 'USD', showCurrency = false } = options || {};
  const rounded = roundToCents(amount);

  if (showCurrency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(rounded);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}
