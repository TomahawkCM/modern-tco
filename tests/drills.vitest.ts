import { describe, it, expect } from 'vitest';
import { getDailyDrill, computeWeightedCounts } from '@/lib/drills';
import { TCODomain } from '@/types/exam';

describe('Daily Drill', () => {
  it('computes weighted counts that sum to total', () => {
    const domains = [
      TCODomain.ASKING_QUESTIONS,
      TCODomain.REFINING_TARGETING,
      TCODomain.TAKING_ACTION,
      TCODomain.NAVIGATION_MODULES,
      TCODomain.REPORTING_EXPORT,
    ];
    const counts = computeWeightedCounts(10, domains);
    const sum = Object.values(counts).reduce((s, n) => s + n, 0);
    expect(sum).toBe(10);
  });

  it('returns 10 unique questions with options alias', async () => {
    const qs = await getDailyDrill(10);
    expect(qs).toHaveLength(10);
    const ids = new Set(qs.map((q) => q.id));
    expect(ids.size).toBe(10);
    // Ensure options alias present
    expect(qs.every((q) => Array.isArray(q.options) && q.options!.length > 0)).toBe(true);
  });

  it('includes a balanced spread across domains', async () => {
    const qs = await getDailyDrill(10);
    const byDomain = qs.reduce<Record<string, number>>((acc, q) => {
      acc[q.domain] = (acc[q.domain] || 0) + 1;
      return acc;
    }, {});
    // Expect at least 1 from each seeded domain
    const expected = [
      TCODomain.ASKING_QUESTIONS,
      TCODomain.REFINING_TARGETING,
      TCODomain.TAKING_ACTION,
      TCODomain.NAVIGATION_MODULES,
      TCODomain.REPORTING_EXPORT,
    ];
    for (const d of expected) {
      expect(byDomain[d] ?? 0).toBeGreaterThan(0);
    }
  });
});

