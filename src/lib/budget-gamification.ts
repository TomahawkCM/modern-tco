'use client';

/**
 * Budget Gamification System
 *
 * Tracks engagement streaks, awards achievements, and manages points
 * for budget-specific activities.
 */

import { db } from '@/lib/budget-db';
import type { GamificationEvent, BudgetStreak, BudgetAchievement } from '@/types/budget';

const STREAK_FREEZE_LIMIT = 2; // Max freezes per month

/**
 * Budget-specific achievement definitions
 */
export const BUDGET_ACHIEVEMENTS: Omit<BudgetAchievement, 'unlockedAt'>[] = [
  // Budgeting
  { id: 'budget_keeper_1', name: 'Budget Keeper', description: 'Under budget for 1 month', icon: 'shield', category: 'budgeting', requirement: { type: 'months_under_budget', value: 1 }, points: 50, rarity: 'common' },
  { id: 'budget_keeper_3', name: 'Budget Guardian', description: 'Under budget for 3 consecutive months', icon: 'shield-check', category: 'budgeting', requirement: { type: 'months_under_budget', value: 3 }, points: 150, rarity: 'uncommon' },
  { id: 'budget_keeper_6', name: 'Budget Master', description: 'Under budget for 6 consecutive months', icon: 'shield-alert', category: 'budgeting', requirement: { type: 'months_under_budget', value: 6 }, points: 500, rarity: 'rare' },
  { id: 'budget_keeper_12', name: 'Budget Legend', description: 'Under budget for 12 consecutive months', icon: 'crown', category: 'budgeting', requirement: { type: 'months_under_budget', value: 12 }, points: 1500, rarity: 'legendary' },

  // Saving
  { id: 'saver_star', name: 'Saver Star', description: 'Savings rate above 20% for a month', icon: 'star', category: 'saving', requirement: { type: 'savings_rate', value: 20 }, points: 100, rarity: 'uncommon' },

  // Debt
  { id: 'debt_crusher', name: 'Debt Crusher', description: 'Paid off a loan', icon: 'trophy', category: 'debt', requirement: { type: 'loans_paid_off', value: 1 }, points: 500, rarity: 'rare' },

  // Receipt scanning
  { id: 'receipt_pro_10', name: 'Receipt Rookie', description: 'Scanned 10 receipts', icon: 'camera', category: 'receipt', requirement: { type: 'receipts_scanned', value: 10 }, points: 50, rarity: 'common' },
  { id: 'receipt_pro_50', name: 'Receipt Pro', description: 'Scanned 50 receipts', icon: 'scan', category: 'receipt', requirement: { type: 'receipts_scanned', value: 50 }, points: 200, rarity: 'uncommon' },
  { id: 'receipt_pro_100', name: 'Receipt Master', description: 'Scanned 100 receipts', icon: 'scan-line', category: 'receipt', requirement: { type: 'receipts_scanned', value: 100 }, points: 500, rarity: 'rare' },

  // Streaks
  { id: 'streak_30', name: 'Monthly Warrior', description: '30 day engagement streak', icon: 'flame', category: 'streak', requirement: { type: 'streak_days', value: 30 }, points: 200, rarity: 'uncommon' },
  { id: 'streak_90', name: 'Quarterly Champion', description: '90 day engagement streak', icon: 'flame', category: 'streak', requirement: { type: 'streak_days', value: 90 }, points: 500, rarity: 'rare' },
  { id: 'streak_365', name: 'Year of Discipline', description: '365 day engagement streak', icon: 'flame', category: 'streak', requirement: { type: 'streak_days', value: 365 }, points: 2000, rarity: 'legendary' },

  // No-spend days
  { id: 'no_spend_hero', name: 'No-Spend Hero', description: '7 consecutive no-spend days', icon: 'wallet', category: 'saving', requirement: { type: 'no_spend_days', value: 7 }, points: 150, rarity: 'uncommon' },

  // Import
  { id: 'import_master', name: 'Import Master', description: 'Imported from 3+ file formats', icon: 'file-input', category: 'import', requirement: { type: 'import_formats', value: 3 }, points: 200, rarity: 'uncommon' },
];

/**
 * Record a gamification event.
 */
export async function recordEvent(
  eventType: GamificationEvent['eventType'],
  metadata?: Record<string, unknown>
): Promise<void> {
  const event: GamificationEvent = {
    id: `gev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType,
    timestamp: new Date(),
    metadata,
  };

  await db.gamificationState.add(event);
}

/**
 * Calculate the current engagement streak.
 *
 * A streak increments for each consecutive day with at least one event.
 * Resets if more than 1 day gap (unless streak freeze is used).
 */
export async function calculateStreak(): Promise<BudgetStreak> {
  const events = await db.gamificationState
    .orderBy('timestamp')
    .reverse()
    .toArray();

  if (events.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
  }

  // Get unique active dates (YYYY-MM-DD)
  const activeDates = new Set<string>();
  for (const event of events) {
    const d = new Date(event.timestamp);
    activeDates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  const sortedDates = Array.from(activeDates).sort().reverse();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Check if today or yesterday is in the active dates (allow 1 day grace)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    // Streak is broken — calculate longest from history
    let longest = 1;
    let current = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 1.5) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }
    return { currentStreak: 0, longestStreak: longest, lastActiveDate: sortedDates[0] };
  }

  // Count current streak
  let currentStreak = 1;
  const startDate = activeDates.has(todayStr) ? todayStr : yesterdayStr;
  const startIdx = sortedDates.indexOf(startDate);

  for (let i = startIdx + 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 1.5) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest (could be current or historical)
  let longest = currentStreak;
  let runLength = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 1.5) {
      runLength++;
      longest = Math.max(longest, runLength);
    } else {
      runLength = 1;
    }
  }

  return {
    currentStreak,
    longestStreak: longest,
    lastActiveDate: sortedDates[0],
  };
}

/**
 * Check achievements against current progress.
 * Returns newly unlocked achievements.
 */
export async function checkAchievements(
  progress: Record<string, number>
): Promise<BudgetAchievement[]> {
  const unlocked: BudgetAchievement[] = [];

  // Load previously unlocked achievements from localStorage
  const unlockedIds = getUnlockedAchievementIds();

  for (const achievement of BUDGET_ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;

    const currentValue = progress[achievement.requirement.type] ?? 0;
    if (currentValue >= achievement.requirement.value) {
      const withDate: BudgetAchievement = {
        ...achievement,
        unlockedAt: new Date(),
      };
      unlocked.push(withDate);
      unlockedIds.add(achievement.id);
    }
  }

  if (unlocked.length > 0) {
    saveUnlockedAchievementIds(unlockedIds);
  }

  return unlocked;
}

/**
 * Get all achievements with their unlock status.
 */
export function getAllAchievements(): BudgetAchievement[] {
  const unlockedIds = getUnlockedAchievementIds();
  const unlockedDates = getUnlockedAchievementDates();

  return BUDGET_ACHIEVEMENTS.map((a) => ({
    ...a,
    unlockedAt: unlockedIds.has(a.id) ? unlockedDates.get(a.id) : undefined,
  }));
}

/**
 * Calculate total points from unlocked achievements.
 */
export function calculateTotalPoints(): number {
  const unlockedIds = getUnlockedAchievementIds();
  return BUDGET_ACHIEVEMENTS
    .filter((a) => unlockedIds.has(a.id))
    .reduce((sum, a) => sum + a.points, 0);
}

// --- Private helpers ---

function getUnlockedAchievementIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem('budget-achievements-unlocked');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function getUnlockedAchievementDates(): Map<string, Date> {
  if (typeof window === 'undefined') return new Map();
  try {
    const stored = localStorage.getItem('budget-achievements-dates');
    if (!stored) return new Map();
    const entries = JSON.parse(stored) as Array<[string, string]>;
    return new Map(entries.map(([k, v]) => [k, new Date(v)]));
  } catch {
    return new Map();
  }
}

function saveUnlockedAchievementIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('budget-achievements-unlocked', JSON.stringify(Array.from(ids)));

    // Also save dates for newly unlocked
    const existingDates = getUnlockedAchievementDates();
    for (const id of ids) {
      if (!existingDates.has(id)) {
        existingDates.set(id, new Date());
      }
    }
    localStorage.setItem(
      'budget-achievements-dates',
      JSON.stringify(Array.from(existingDates.entries()))
    );
  } catch {
    // Ignore localStorage errors
  }
}
