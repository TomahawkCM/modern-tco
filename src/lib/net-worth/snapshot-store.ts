/**
 * Net Worth Snapshot Store
 *
 * Automatically captures and stores monthly net worth snapshots
 * for historical tracking and trend charts.
 */

import { db } from '@/lib/budget-db';
import type { StoredNetWorthSnapshot } from '@/types/budget';
import { calculateCurrentNetWorth } from './calculator';

/**
 * Take a snapshot of current net worth and store it.
 * Only stores one snapshot per month (first visit each month).
 */
export async function takeMonthlySnapshot(): Promise<StoredNetWorthSnapshot | null> {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Check if we already have a snapshot for this month
  const existing = await db.netWorthSnapshots
    .filter((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === monthKey;
    })
    .first();

  if (existing) {
    return null; // Already have this month's snapshot
  }

  const breakdown = await calculateCurrentNetWorth();

  const snapshot: StoredNetWorthSnapshot = {
    id: `nw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: now,
    assets: breakdown.assets,
    liabilities: breakdown.liabilities,
    netWorth: breakdown.netWorth,
    calculatedAt: now,
  };

  await db.netWorthSnapshots.add(snapshot);
  return snapshot;
}

/**
 * Get all historical snapshots, sorted by date ascending.
 */
export async function getHistoricalSnapshots(): Promise<StoredNetWorthSnapshot[]> {
  return db.netWorthSnapshots.orderBy('date').toArray();
}

/**
 * Get the most recent snapshot.
 */
export async function getLatestSnapshot(): Promise<StoredNetWorthSnapshot | undefined> {
  return db.netWorthSnapshots.orderBy('date').reverse().first();
}

/**
 * Get year-over-year comparison.
 */
export async function getYearOverYearComparison(): Promise<{
  currentYear: number;
  previousYear: number;
  change: number;
  changePercent: number;
} | null> {
  const snapshots = await getHistoricalSnapshots();
  if (snapshots.length < 2) return null;

  const now = new Date();
  const thisYear = now.getFullYear();

  const currentYearSnapshots = snapshots.filter(
    (s) => new Date(s.date).getFullYear() === thisYear
  );
  const previousYearSnapshots = snapshots.filter(
    (s) => new Date(s.date).getFullYear() === thisYear - 1
  );

  if (currentYearSnapshots.length === 0 || previousYearSnapshots.length === 0) {
    return null;
  }

  const latestCurrent = currentYearSnapshots[currentYearSnapshots.length - 1].netWorth;
  const latestPrevious = previousYearSnapshots[previousYearSnapshots.length - 1].netWorth;

  const change = latestCurrent - latestPrevious;
  const changePercent =
    latestPrevious !== 0 ? (change / Math.abs(latestPrevious)) * 100 : 0;

  return {
    currentYear: Math.round(latestCurrent * 100) / 100,
    previousYear: Math.round(latestPrevious * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 10) / 10,
  };
}
