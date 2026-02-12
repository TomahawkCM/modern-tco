import { describe, it, expect } from 'vitest';
import { formatMonth, getPreviousMonth } from '@/lib/budget/rollover-engine';

describe('rollover-engine', () => {
  describe('formatMonth', () => {
    it('formats a date as YYYY-MM', () => {
      expect(formatMonth(new Date(2026, 0, 15))).toBe('2026-01');
      expect(formatMonth(new Date(2026, 11, 1))).toBe('2026-12');
    });

    it('pads single-digit months', () => {
      expect(formatMonth(new Date(2026, 2, 1))).toBe('2026-03');
      expect(formatMonth(new Date(2026, 8, 1))).toBe('2026-09');
    });
  });

  describe('getPreviousMonth', () => {
    it('returns previous month within same year', () => {
      expect(getPreviousMonth('2026-03')).toBe('2026-02');
      expect(getPreviousMonth('2026-12')).toBe('2026-11');
    });

    it('wraps around to previous year', () => {
      expect(getPreviousMonth('2026-01')).toBe('2025-12');
    });

    it('handles mid-year correctly', () => {
      expect(getPreviousMonth('2026-06')).toBe('2026-05');
    });
  });

  // Note: calculateRollover, processMonthEndRollovers, and getEffectiveBudget
  // require IndexedDB mocking with fake-indexeddb. Those tests would be:
  //
  // - underspend rolls forward correctly (budget 500, spent 300 -> rollover +200)
  // - overspend rolls forward as negative (budget 500, spent 700 -> rollover -200)
  // - negative capped at -budgetAmount (budget 500, spent 2000 -> rollover -500)
  // - rollover disabled = no calculation
  // - getEffectiveBudget returns base + rollover
  //
  // These are tested indirectly through integration tests and
  // can be expanded with fake-indexeddb setup if needed.
});
