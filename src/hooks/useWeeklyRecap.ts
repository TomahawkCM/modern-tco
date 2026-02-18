"use client";

import { db } from "@/lib/budget-db";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

interface TopCategory {
  name: string;
  amount: number;
}

interface WeeklyRecapData {
  thisWeekTotal: number;
  lastWeekTotal: number;
  change: number;
  topCategories: TopCategory[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook that computes weekly spending recap data.
 *
 * Queries transactions from the current and previous week using an indexed
 * Dexie query on `date` for performance, then derives totals, percentage
 * change, and top-spending categories.
 */
export function useWeeklyRecap(): WeeklyRecapData {
  const queryResult = useLiveQuery(async () => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfPrevWeek = new Date(startOfWeek);
      startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

      // Use indexed query on `date` instead of loading every transaction
      const twoWeeksTxs = await db.transactions.where("date").above(startOfPrevWeek).toArray();

      const thisWeek = twoWeeksTxs.filter((tx) => {
        if (tx.isSplit || tx.amount >= 0) return false;
        return new Date(tx.date) >= startOfWeek;
      });

      const lastWeek = twoWeeksTxs.filter((tx) => {
        if (tx.isSplit || tx.amount >= 0) return false;
        const d = new Date(tx.date);
        return d >= startOfPrevWeek && d < startOfWeek;
      });

      return { thisWeek, lastWeek, error: null };
    } catch (err) {
      return {
        thisWeek: [],
        lastWeek: [],
        error: err instanceof Error ? err : new Error("Failed to load weekly transactions"),
      };
    }
  });

  const loading = queryResult === undefined;

  const data = useMemo(() => {
    if (!queryResult) {
      return {
        thisWeekTotal: 0,
        lastWeekTotal: 0,
        change: 0,
        topCategories: [] as TopCategory[],
      };
    }

    const thisWeekTotal = queryResult.thisWeek.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const lastWeekTotal = queryResult.lastWeek.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const change = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;

    // Top categories by spend this week
    const catMap = new Map<string, number>();
    queryResult.thisWeek.forEach((tx) => {
      const cat = tx.category || "Uncategorized";
      catMap.set(cat, (catMap.get(cat) || 0) + Math.abs(tx.amount));
    });

    const topCategories = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    return { thisWeekTotal, lastWeekTotal, change, topCategories };
  }, [queryResult]);

  return {
    ...data,
    loading,
    error: queryResult?.error ?? null,
  };
}
