/**
 * Anomaly detection — flags categories with spending significantly
 * above or below baseline average.
 *
 * Pure function — no DB, no AI, no side effects.
 */

import type { CategorySpend } from "./spending-trends";
import type { TransactionForCategoryAggregation } from "../aggregation/category-spending";
import { toExpenseCategorySpends } from "./expense-spends";

export interface AnomalyDetectionInput {
  readonly currentMonth: readonly CategorySpend[];
  readonly baselineMonths: readonly (readonly CategorySpend[])[];
  /** Minimum deviation percentage to flag as anomaly. Default: 50. */
  readonly thresholdPercent?: number;
}

export interface SpendingAnomaly {
  readonly categoryKey: string;
  readonly currentMinor: number;
  readonly baselineAvgMinor: number;
  readonly deviationPercent: number;
  readonly direction: "increase" | "decrease";
}

const DEFAULT_THRESHOLD = 50;

export function detectAnomalies(
  input: AnomalyDetectionInput
): SpendingAnomaly[] {
  const threshold = input.thresholdPercent ?? DEFAULT_THRESHOLD;
  const monthCount = input.baselineMonths.length;

  if (monthCount === 0) return [];

  // Build current lookup
  const currentMap = new Map<string, number>();
  for (const s of input.currentMonth) {
    currentMap.set(s.categoryKey, s.spentMinor);
  }

  // Compute baseline averages
  const baselineTotals = new Map<string, number>();
  for (const month of input.baselineMonths) {
    for (const s of month) {
      baselineTotals.set(
        s.categoryKey,
        (baselineTotals.get(s.categoryKey) ?? 0) + s.spentMinor
      );
    }
  }

  const anomalies: SpendingAnomaly[] = [];

  // Only check categories that have a baseline
  for (const [key, total] of baselineTotals) {
    const baselineAvg = Math.round(total / monthCount);
    if (baselineAvg === 0) continue;

    const current = currentMap.get(key) ?? 0;
    const changePercent = ((current - baselineAvg) / baselineAvg) * 100;
    const absChange = Math.abs(changePercent);

    if (absChange >= threshold) {
      anomalies.push({
        categoryKey: key,
        currentMinor: current,
        baselineAvgMinor: baselineAvg,
        deviationPercent: absChange,
        direction: changePercent > 0 ? "increase" : "decrease",
      });
    }
  }

  // Sort by deviation descending
  anomalies.sort((a, b) => b.deviationPercent - a.deviationPercent);

  return anomalies;
}

/**
 * Detect spending anomalies directly from raw transactions.
 *
 * Thin adapter: toExpenseCategorySpends per month → detectAnomalies.
 * Handles all financial interpretation (expense filtering, sign conversion)
 * so the server layer does not need to.
 *
 * @param currentMonth    Current month transactions (engine input shape)
 * @param baselineMonths  Prior months transactions (engine input shape)
 * @param currency        Expected currency — all transactions must match
 * @param thresholdPercent  Minimum deviation to flag. Default: 50
 */
export function detectAnomaliesFromTransactions(
  currentMonth: readonly TransactionForCategoryAggregation[],
  baselineMonths: readonly (readonly TransactionForCategoryAggregation[])[],
  currency: string,
  thresholdPercent?: number
): SpendingAnomaly[] {
  return detectAnomalies({
    currentMonth: toExpenseCategorySpends(currentMonth, currency),
    baselineMonths: baselineMonths.map((month) =>
      toExpenseCategorySpends(month, currency)
    ),
    thresholdPercent,
  });
}
