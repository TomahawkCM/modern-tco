"use client";

/**
 * Spending Heatmap Component
 * Shows spending intensity by day-of-week x week grid (like GitHub contribution graph).
 * Ported from offline app with shadcn/zinc semantic styling.
 */

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface HeatmapDataPoint {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Spending amount (positive number, in display units) */
  amount: number;
}

interface SpendingHeatmapProps {
  data: HeatmapDataPoint[];
  currency: string;
  formatAmount: (amt: { amountMinor: number; currency: string }) => string;
}

interface DayCell {
  date: Date;
  dateKey: string;
  amount: number;
  dayOfMonth: number;
}

/**
 * Get intensity level (0-4) for a spending amount relative to the max.
 */
function getIntensityLevel(amount: number, maxAmount: number): number {
  if (amount === 0 || maxAmount === 0) return 0;
  const ratio = amount / maxAmount;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

/** Tailwind classes for each intensity level */
const INTENSITY_CLASSES: Record<number, string> = {
  0: "bg-muted",
  1: "bg-indigo-200 dark:bg-indigo-900",
  2: "bg-indigo-300 dark:bg-indigo-700",
  3: "bg-indigo-500 dark:bg-indigo-500",
  4: "bg-indigo-700 dark:bg-indigo-300",
};

export function SpendingHeatmap({ data, currency, formatAmount }: SpendingHeatmapProps) {
  const t = useTranslations("reports");
  const [hoveredDay, setHoveredDay] = useState<DayCell | null>(null);

  // Build spending lookup from data
  const spendingByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const point of data) {
      const existing = map.get(point.date) ?? 0;
      map.set(point.date, existing + point.amount);
    }
    return map;
  }, [data]);

  // Determine date range: find min/max dates or default to last 3 months
  const { weeks, maxSpending, dayLabels } = useMemo(() => {
    const dayLabelKeys = [
      "dayShort.sun",
      "dayShort.mon",
      "dayShort.tue",
      "dayShort.wed",
      "dayShort.thu",
      "dayShort.fri",
      "dayShort.sat",
    ] as const;

    const labels = dayLabelKeys.map((key) => t(key));

    if (data.length === 0) {
      return { weeks: [] as (DayCell | null)[][], maxSpending: 0, dayLabels: labels };
    }

    // Find date range from data
    const dates = data.map((d) => new Date(d.date + "T00:00:00"));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Extend to full weeks (Sunday start)
    const startDate = new Date(minDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(maxDate);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    // Build calendar grid (columns = weeks, rows = days of week)
    const allWeeks: (DayCell | null)[][] = [];
    let currentWeek: (DayCell | null)[] = [];
    let maxAmt = 0;

    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dateKey = cursor.toISOString().split("T")[0];
      const amount = spendingByDate.get(dateKey) ?? 0;
      if (amount > maxAmt) maxAmt = amount;

      // Only include days that are in the original data range
      const isInRange = cursor >= minDate && cursor <= maxDate;

      currentWeek.push(
        isInRange
          ? {
              date: new Date(cursor),
              dateKey,
              amount,
              dayOfMonth: cursor.getDate(),
            }
          : null
      );

      if (currentWeek.length === 7) {
        allWeeks.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      allWeeks.push(currentWeek);
    }

    return { weeks: allWeeks, maxSpending: maxAmt, dayLabels: labels };
  }, [data, spendingByDate, t]);

  // Stats
  const stats = useMemo(() => {
    const totalSpent = data.reduce((sum, d) => sum + d.amount, 0);
    const daysWithSpending = new Set(data.filter((d) => d.amount > 0).map((d) => d.date)).size;
    const avgPerDay = daysWithSpending > 0 ? totalSpent / daysWithSpending : 0;

    // Find busiest day of week (0-6)
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    for (const point of data) {
      const dayOfWeek = new Date(point.date + "T00:00:00").getDay();
      dayTotals[dayOfWeek] += point.amount;
    }
    const busiestDayIndex = dayTotals.indexOf(Math.max(...dayTotals));

    return { totalSpent, avgPerDay, busiestDayIndex };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-2 text-lg font-semibold text-foreground">{t("heatmap.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("heatmap.noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">{t("heatmap.title")}</h3>

        {/* Day labels + grid */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {/* Day-of-week labels (rows) */}
            <div className="flex flex-col gap-1 pr-2 pt-0">
              {dayLabels.map((label, idx) => (
                <div
                  key={idx}
                  className="flex h-4 w-8 items-center text-[10px] text-muted-foreground"
                >
                  {idx % 2 === 1 ? label : ""}
                </div>
              ))}
            </div>

            {/* Weeks (columns) */}
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => {
                  if (!day) {
                    return (
                      <div key={`empty-${weekIdx}-${dayIdx}`} className="h-4 w-4 rounded-sm" />
                    );
                  }

                  const level = getIntensityLevel(day.amount, maxSpending);

                  return (
                    <div
                      key={day.dateKey}
                      className={cn(
                        "relative h-4 w-4 cursor-pointer rounded-sm transition-all",
                        INTENSITY_CLASSES[level],
                        "hover:ring-2 hover:ring-primary"
                      )}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      role="gridcell"
                      aria-label={`${day.dateKey}: ${formatAmount({ amountMinor: Math.round(day.amount * 100), currency })}`}
                    >
                      {/* Tooltip */}
                      {hoveredDay?.dateKey === day.dateKey && (
                        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md">
                          <div className="font-medium">{day.dateKey}</div>
                          <div className="mt-0.5">
                            {formatAmount({
                              amountMinor: Math.round(day.amount * 100),
                              currency,
                            })}
                          </div>
                          <div className="absolute left-1/2 top-full -translate-x-1/2">
                            <div className="border-4 border-transparent border-t-popover" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("heatmap.less")}</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={cn("h-3 w-3 rounded-sm", INTENSITY_CLASSES[level])} />
            ))}
          </div>
          <span>{t("heatmap.more")}</span>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <div className="text-xs text-muted-foreground">{t("heatmap.totalSpent")}</div>
            <div className="text-lg font-semibold text-foreground">
              {formatAmount({
                amountMinor: Math.round(stats.totalSpent * 100),
                currency,
              })}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("heatmap.busiestDay")}</div>
            <div className="text-lg font-semibold text-foreground">
              {stats.totalSpent > 0 ? dayLabels[stats.busiestDayIndex] : "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("heatmap.avgPerDay")}</div>
            <div className="text-lg font-semibold text-foreground">
              {formatAmount({
                amountMinor: Math.round(stats.avgPerDay * 100),
                currency,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
