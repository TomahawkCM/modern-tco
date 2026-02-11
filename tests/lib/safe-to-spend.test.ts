import { describe, it, expect } from 'vitest';
import { getSpendingStatus, getDaysRemainingInMonth } from '@/lib/budget/safe-to-spend';

describe('safe-to-spend', () => {
  describe('getSpendingStatus', () => {
    it('returns "safe" when under 50% used', () => {
      expect(getSpendingStatus(0)).toBe('safe');
      expect(getSpendingStatus(25)).toBe('safe');
      expect(getSpendingStatus(49.9)).toBe('safe');
    });

    it('returns "caution" when between 50% and 80%', () => {
      expect(getSpendingStatus(50)).toBe('caution');
      expect(getSpendingStatus(65)).toBe('caution');
      expect(getSpendingStatus(79.9)).toBe('caution');
    });

    it('returns "danger" when at or above 80%', () => {
      expect(getSpendingStatus(80)).toBe('danger');
      expect(getSpendingStatus(100)).toBe('danger');
      expect(getSpendingStatus(150)).toBe('danger');
    });
  });

  describe('getDaysRemainingInMonth', () => {
    it('returns correct days remaining for mid-month', () => {
      // January 15 -> 17 days remaining (15-31 inclusive)
      const jan15 = new Date(2026, 0, 15);
      expect(getDaysRemainingInMonth(jan15)).toBe(17);
    });

    it('returns 1 on the last day of the month', () => {
      const jan31 = new Date(2026, 0, 31);
      expect(getDaysRemainingInMonth(jan31)).toBe(1);
    });

    it('returns full month on the first day', () => {
      const jan1 = new Date(2026, 0, 1);
      expect(getDaysRemainingInMonth(jan1)).toBe(31);
    });

    it('handles February correctly', () => {
      // February 2026 has 28 days. Feb 1 -> 28 days remaining
      const feb1 = new Date(2026, 1, 1);
      expect(getDaysRemainingInMonth(feb1)).toBe(28);
    });

    it('handles leap year February', () => {
      // February 2028 is a leap year. Feb 1 -> 29 days remaining
      const feb1 = new Date(2028, 1, 1);
      expect(getDaysRemainingInMonth(feb1)).toBe(29);
    });
  });
});
