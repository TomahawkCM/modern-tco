/**
 * Unit Tests for Money Utilities Module
 * Tests floating-point precision handling for financial calculations
 */

import { describe, it, expect } from 'vitest';
import {
  roundToCents,
  sumAmounts,
  subtractAmounts,
  multiplyAmount,
  divideAmount,
  percentageOf,
  amountsEqual,
  formatAmount,
} from '@/lib/money';

describe('Money Utilities Module', () => {
  // ========================================
  // roundToCents() Tests
  // ========================================
  describe('roundToCents()', () => {
    it('should fix the classic 0.1 + 0.2 floating point issue', () => {
      // In JavaScript: 0.1 + 0.2 = 0.30000000000000004
      const result = roundToCents(0.1 + 0.2);
      expect(result).toBe(0.3);
    });

    it('should round down when less than 0.005', () => {
      expect(roundToCents(1.234)).toBe(1.23);
    });

    it('should round up when 0.005 or greater (banker rounding)', () => {
      expect(roundToCents(1.235)).toBe(1.24);
      expect(roundToCents(1.236)).toBe(1.24);
    });

    it('should handle negative amounts', () => {
      expect(roundToCents(-1.234)).toBe(-1.23);
      expect(roundToCents(-1.235)).toBe(-1.24);
    });

    it('should handle zero', () => {
      expect(roundToCents(0)).toBe(0);
    });

    it('should handle already-rounded values', () => {
      expect(roundToCents(99.99)).toBe(99.99);
      expect(roundToCents(100.00)).toBe(100);
    });

    it('should handle very small amounts', () => {
      expect(roundToCents(0.001)).toBe(0);
      expect(roundToCents(0.005)).toBe(0.01);
      expect(roundToCents(0.009)).toBe(0.01);
    });

    it('should handle large amounts', () => {
      expect(roundToCents(1234567.89)).toBe(1234567.89);
      expect(roundToCents(1234567.894)).toBe(1234567.89);
      expect(roundToCents(1234567.895)).toBe(1234567.9); // banker's rounding
    });

    it('should handle NaN and Infinity gracefully', () => {
      expect(roundToCents(NaN)).toBe(0);
      expect(roundToCents(Infinity)).toBe(0);
      expect(roundToCents(-Infinity)).toBe(0);
    });
  });

  // ========================================
  // sumAmounts() Tests
  // ========================================
  describe('sumAmounts()', () => {
    it('should sum simple amounts correctly', () => {
      expect(sumAmounts([10, 20, 30])).toBe(60);
    });

    it('should handle floating-point accumulation without errors', () => {
      // Adding 0.1 one hundred times should equal 10.00, not 9.999999999999998
      const amounts = Array(100).fill(0.1);
      expect(sumAmounts(amounts)).toBe(10);
    });

    it('should sum transaction-like amounts correctly', () => {
      expect(sumAmounts([19.99, 29.99, 14.99])).toBe(64.97);
    });

    it('should handle negative amounts (expenses)', () => {
      expect(sumAmounts([-19.99, -29.99, -14.99])).toBe(-64.97);
    });

    it('should handle mixed positive and negative amounts', () => {
      expect(sumAmounts([100, -19.99, -29.99, 50])).toBe(100.02);
    });

    it('should handle empty array', () => {
      expect(sumAmounts([])).toBe(0);
    });

    it('should handle single amount', () => {
      expect(sumAmounts([42.99])).toBe(42.99);
    });

    it('should handle 1000 small transactions', () => {
      // Simulate 1000 transactions of $1.99 each
      const amounts = Array(1000).fill(1.99);
      expect(sumAmounts(amounts)).toBe(1990);
    });

    it('should handle amounts with many decimal places', () => {
      // These might come from calculations before rounding
      expect(sumAmounts([1.111111, 2.222222, 3.333333])).toBe(6.67);
    });

    it('should handle NaN values gracefully', () => {
      expect(sumAmounts([10, NaN, 20])).toBe(30);
    });

    it('should handle undefined/null array', () => {
      // @ts-ignore - testing runtime handling of invalid input
      expect(sumAmounts(null)).toBe(0);
      // @ts-ignore - testing runtime handling of invalid input
      expect(sumAmounts(undefined)).toBe(0);
    });
  });

  // ========================================
  // subtractAmounts() Tests
  // ========================================
  describe('subtractAmounts()', () => {
    it('should subtract amounts correctly', () => {
      expect(subtractAmounts(100, 49.99)).toBe(50.01);
    });

    it('should handle floating-point subtraction issues', () => {
      // 0.3 - 0.1 in JavaScript = 0.19999999999999998
      expect(subtractAmounts(0.3, 0.1)).toBe(0.2);
    });

    it('should handle negative results', () => {
      expect(subtractAmounts(10, 25)).toBe(-15);
    });

    it('should handle zero', () => {
      expect(subtractAmounts(100, 0)).toBe(100);
      expect(subtractAmounts(0, 100)).toBe(-100);
      expect(subtractAmounts(0, 0)).toBe(0);
    });

    it('should handle large amounts', () => {
      expect(subtractAmounts(1000000, 0.01)).toBe(999999.99);
    });
  });

  // ========================================
  // multiplyAmount() Tests
  // ========================================
  describe('multiplyAmount()', () => {
    it('should multiply amounts correctly', () => {
      expect(multiplyAmount(99.99, 1.08)).toBe(107.99);
    });

    it('should handle percentage discounts', () => {
      expect(multiplyAmount(50, 0.5)).toBe(25);
    });

    it('should handle zero multiplier', () => {
      expect(multiplyAmount(100, 0)).toBe(0);
    });

    it('should handle multiplication by 1', () => {
      expect(multiplyAmount(42.99, 1)).toBe(42.99);
    });

    it('should handle floating-point multiplication issues', () => {
      // 0.1 * 0.2 in JavaScript = 0.020000000000000004
      expect(multiplyAmount(0.1, 0.2)).toBe(0.02);
    });
  });

  // ========================================
  // divideAmount() Tests
  // ========================================
  describe('divideAmount()', () => {
    it('should divide amounts correctly', () => {
      expect(divideAmount(100, 3)).toBe(33.33);
    });

    it('should handle even division', () => {
      expect(divideAmount(100, 4)).toBe(25);
    });

    it('should handle division by 1', () => {
      expect(divideAmount(42.99, 1)).toBe(42.99);
    });

    it('should handle division by zero gracefully', () => {
      expect(divideAmount(100, 0)).toBe(100); // Treats 0 as 1
    });

    it('should handle small amounts', () => {
      expect(divideAmount(0.01, 2)).toBe(0.01); // Rounds to nearest cent
    });
  });

  // ========================================
  // percentageOf() Tests
  // ========================================
  describe('percentageOf()', () => {
    it('should calculate percentage correctly', () => {
      expect(percentageOf(200, 15)).toBe(30);
    });

    it('should handle 100%', () => {
      expect(percentageOf(99.99, 100)).toBe(99.99);
    });

    it('should handle 0%', () => {
      expect(percentageOf(100, 0)).toBe(0);
    });

    it('should handle fractional percentages', () => {
      expect(percentageOf(1000, 7.5)).toBe(75);
    });
  });

  // ========================================
  // amountsEqual() Tests
  // ========================================
  describe('amountsEqual()', () => {
    it('should identify equal amounts', () => {
      expect(amountsEqual(100, 100)).toBe(true);
      expect(amountsEqual(42.99, 42.99)).toBe(true);
    });

    it('should handle floating-point comparison correctly', () => {
      expect(amountsEqual(0.1 + 0.2, 0.3)).toBe(true);
    });

    it('should identify different amounts', () => {
      expect(amountsEqual(100, 100.01)).toBe(false);
      expect(amountsEqual(42.99, 42.98)).toBe(false);
    });

    it('should treat sub-cent differences as equal', () => {
      // Both round to 1.23
      expect(amountsEqual(1.234, 1.231)).toBe(true);
    });

    it('should treat amounts rounding differently as not equal', () => {
      // 1.234 -> 1.23, 1.235 -> 1.24
      expect(amountsEqual(1.234, 1.235)).toBe(false);
    });
  });

  // ========================================
  // formatAmount() Tests
  // ========================================
  describe('formatAmount()', () => {
    it('should format positive amounts', () => {
      expect(formatAmount(1234.56)).toBe('1,234.56');
    });

    it('should format negative amounts', () => {
      expect(formatAmount(-50)).toBe('-50.00');
    });

    it('should format with currency symbol', () => {
      const result = formatAmount(1234.56, { showCurrency: true, currency: 'USD' });
      expect(result).toContain('1,234.56');
    });

    it('should handle zero', () => {
      expect(formatAmount(0)).toBe('0.00');
    });

    it('should round before formatting', () => {
      expect(formatAmount(1234.567)).toBe('1,234.57');
    });
  });

  // ========================================
  // Integration Tests: Real-world Scenarios
  // ========================================
  describe('Real-world Scenarios', () => {
    it('should calculate correct monthly total from transactions', () => {
      const transactions = [
        { amount: -49.99, description: 'Groceries' },
        { amount: -129.99, description: 'Utilities' },
        { amount: -15.49, description: 'Coffee' },
        { amount: 2500, description: 'Salary' },
        { amount: -299.99, description: 'Rent' },
      ];

      const income = sumAmounts(
        transactions.filter(tx => tx.amount > 0).map(tx => tx.amount)
      );
      const expenses = Math.abs(sumAmounts(
        transactions.filter(tx => tx.amount < 0).map(tx => tx.amount)
      ));
      const net = subtractAmounts(income, expenses);

      expect(income).toBe(2500);
      expect(expenses).toBe(495.46);
      expect(net).toBe(2004.54);
    });

    it('should handle budget calculations with overspending', () => {
      const budgetLimit = 500;
      const expenses = [89.99, 125.50, 200.00, 45.75, 50.25];

      const totalSpent = sumAmounts(expenses);
      const remaining = subtractAmounts(budgetLimit, totalSpent);
      const percentUsed = (totalSpent / budgetLimit) * 100;

      expect(totalSpent).toBe(511.49);
      expect(remaining).toBe(-11.49);
      expect(percentUsed).toBeCloseTo(102.3, 1);
    });

    it('should calculate tax correctly', () => {
      const subtotal = 149.99;
      const taxRate = 8.25; // 8.25%

      const tax = percentageOf(subtotal, taxRate);
      const total = sumAmounts([subtotal, tax]);

      expect(tax).toBe(12.37);
      expect(total).toBe(162.36);
    });

    it('should split a bill evenly among friends', () => {
      const billTotal = 127.50;
      const numberOfPeople = 4;

      const perPerson = divideAmount(billTotal, numberOfPeople);
      // Due to rounding, total from splits won't exactly equal original
      const totalFromSplits = multiplyAmount(perPerson, numberOfPeople);

      expect(perPerson).toBe(31.88);
      expect(totalFromSplits).toBe(127.52); // 2 cents difference due to rounding
    });
  });
});
