import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BUDGET_ACHIEVEMENTS,
  checkAchievements,
  calculateTotalPoints,
  getAllAchievements,
} from '@/lib/budget-gamification';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('budget-gamification', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('BUDGET_ACHIEVEMENTS', () => {
    it('has at least 10 achievements defined', () => {
      expect(BUDGET_ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
    });

    it('all achievements have required fields', () => {
      for (const achievement of BUDGET_ACHIEVEMENTS) {
        expect(achievement.id).toBeTruthy();
        expect(achievement.name).toBeTruthy();
        expect(achievement.description).toBeTruthy();
        expect(achievement.points).toBeGreaterThan(0);
        expect(achievement.rarity).toBeTruthy();
        expect(achievement.requirement.type).toBeTruthy();
        expect(achievement.requirement.value).toBeGreaterThan(0);
      }
    });

    it('has unique IDs', () => {
      const ids = BUDGET_ACHIEVEMENTS.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('checkAchievements', () => {
    it('unlocks achievement when requirement met', async () => {
      const progress = { months_under_budget: 1 };
      const unlocked = await checkAchievements(progress);
      expect(unlocked.length).toBeGreaterThanOrEqual(1);
      expect(unlocked[0].id).toBe('budget_keeper_1');
    });

    it('does not unlock achievement when requirement not met', async () => {
      const progress = { months_under_budget: 0 };
      const unlocked = await checkAchievements(progress);
      const budgetKeeper = unlocked.find((a) => a.id === 'budget_keeper_1');
      expect(budgetKeeper).toBeUndefined();
    });

    it('does not re-unlock already unlocked achievements', async () => {
      const progress = { months_under_budget: 1 };
      const first = await checkAchievements(progress);
      expect(first.length).toBeGreaterThanOrEqual(1);

      const second = await checkAchievements(progress);
      const budgetKeeper = second.find((a) => a.id === 'budget_keeper_1');
      expect(budgetKeeper).toBeUndefined();
    });

    it('unlocks streak achievement at correct threshold', async () => {
      const progress = { streak_days: 30 };
      const unlocked = await checkAchievements(progress);
      const streak30 = unlocked.find((a) => a.id === 'streak_30');
      expect(streak30).toBeDefined();
    });
  });

  describe('calculateTotalPoints', () => {
    it('returns 0 when no achievements unlocked', () => {
      expect(calculateTotalPoints()).toBe(0);
    });

    it('sums points from unlocked achievements', async () => {
      await checkAchievements({ months_under_budget: 1 });
      const points = calculateTotalPoints();
      expect(points).toBe(50); // budget_keeper_1 = 50 points
    });
  });

  describe('getAllAchievements', () => {
    it('returns all achievements with unlock status', () => {
      const all = getAllAchievements();
      expect(all.length).toBe(BUDGET_ACHIEVEMENTS.length);
    });

    it('marks unlocked achievements with date', async () => {
      await checkAchievements({ months_under_budget: 1 });
      const all = getAllAchievements();
      const budgetKeeper = all.find((a) => a.id === 'budget_keeper_1');
      expect(budgetKeeper?.unlockedAt).toBeDefined();
    });
  });
});
