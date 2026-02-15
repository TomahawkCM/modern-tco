/**
 * YNAB Envelope Rollover Logic (Y-016)
 *
 * YNAB uses envelope budgeting where:
 * - Each category has a "budgeted" amount per month
 * - Underspending: Remainder rolls over to next month's "Available"
 * - Overspending: Negative balance carries forward (debt to the category)
 *
 * Our budget app uses a simpler model:
 * - Monthly budget limits per category
 * - No automatic rollover between months
 *
 * This module handles the conversion and documents fidelity loss.
 */

import type { NormalizedMonthlyBudget, NormalizedCategoryGroup } from "./ynab-parser";

// ============================================================================
// Types
// ============================================================================

/**
 * YNAB envelope state for a single category in a month
 */
export interface EnvelopeState {
  categoryId: string;
  categoryName: string;
  groupName: string;
  month: string; // YYYY-MM
  budgeted: number; // Amount budgeted this month
  activity: number; // Spending/income this month
  available: number; // Balance available (includes rollover)
  carryover: number; // Amount carried from previous month
}

/**
 * Complete envelope timeline for a category
 */
export interface CategoryEnvelopeTimeline {
  categoryId: string;
  categoryName: string;
  groupName: string;
  months: EnvelopeState[];
  summary: {
    totalBudgeted: number;
    totalActivity: number;
    averageMonthlyBudget: number;
    monthsWithOverspending: number;
    monthsWithUnderspending: number;
    netRolloverEffect: number;
  };
}

/**
 * Converted budget for our app's simpler model
 */
export interface ConvertedBudget {
  categoryId: string;
  categoryName: string;
  groupName: string;
  monthlyLimit: number; // Recommended monthly budget
  isRecurring: boolean;
  notes: string;
}

/**
 * Rollover conversion result
 */
export interface RolloverConversionResult {
  convertedBudgets: ConvertedBudget[];
  timelines: CategoryEnvelopeTimeline[];
  fidelityNotes: string[];
  warnings: string[];
  stats: {
    totalCategories: number;
    categoriesWithRollover: number;
    averageRolloverAmount: number;
    maxPositiveRollover: number;
    maxNegativeRollover: number;
  };
}

// ============================================================================
// Main Conversion Functions
// ============================================================================

/**
 * Convert YNAB envelope budgets to our simplified model
 *
 * YNAB's Available = Previous Available + Budgeted - Activity
 * We convert this to: Monthly Limit = Average(Budgeted) across active months
 */
export function convertEnvelopeBudgets(
  monthlyBudgets: NormalizedMonthlyBudget[],
  categoryGroups: NormalizedCategoryGroup[]
): RolloverConversionResult {
  const warnings: string[] = [];
  const fidelityNotes: string[] = [
    "YNAB uses envelope budgeting with automatic rollover. Our app uses fixed monthly limits.",
    "Converted budgets represent average monthly allocation from your YNAB history.",
    "Overspending/underspending patterns from YNAB are not preserved.",
    "Goal-based budgeting (target balance, monthly funding goals) is not migrated.",
  ];

  // Build category map
  const categoryMap = buildCategoryMap(categoryGroups);

  // Build envelope timelines for each category
  const timelines = buildEnvelopeTimelines(monthlyBudgets, categoryMap, warnings);

  // Convert to our simplified budget model
  const convertedBudgets = convertTimelines(timelines, warnings);

  // Calculate stats
  const stats = calculateStats(timelines);

  return {
    convertedBudgets,
    timelines,
    fidelityNotes,
    warnings,
    stats,
  };
}

/**
 * Build a map of category IDs to names/groups
 */
function buildCategoryMap(
  categoryGroups: NormalizedCategoryGroup[]
): Map<string, { name: string; groupName: string }> {
  const map = new Map<string, { name: string; groupName: string }>();

  for (const group of categoryGroups) {
    for (const cat of group.categories) {
      map.set(cat.id, {
        name: cat.name,
        groupName: group.name,
      });
    }
  }

  return map;
}

/**
 * Build envelope timelines for all categories
 */
function buildEnvelopeTimelines(
  monthlyBudgets: NormalizedMonthlyBudget[],
  categoryMap: Map<string, { name: string; groupName: string }>,
  warnings: string[]
): CategoryEnvelopeTimeline[] {
  // Sort months chronologically
  const sortedMonths = [...monthlyBudgets].sort((a, b) => a.month.localeCompare(b.month));

  // Group by category
  const categoryData = new Map<
    string,
    {
      categoryName: string;
      groupName: string;
      months: EnvelopeState[];
    }
  >();

  let previousBalances = new Map<string, number>();

  for (const monthBudget of sortedMonths) {
    const currentBalances = new Map<string, number>();

    for (const cat of monthBudget.categories) {
      const catInfo = categoryMap.get(cat.categoryId) || {
        name: cat.categoryName,
        groupName: cat.groupName,
      };

      // Calculate carryover from previous month
      const previousBalance = previousBalances.get(cat.categoryId) || 0;

      // YNAB Available = Previous Available + Budgeted - Activity
      // We derive carryover as: Available - Budgeted + Activity
      const carryover = previousBalance;
      const calculatedAvailable = carryover + cat.budgeted - Math.abs(cat.activity);

      // Check for discrepancy
      if (cat.balance !== 0 && Math.abs(calculatedAvailable - cat.balance) > 0.01) {
        // YNAB may have adjustments we can't see
        warnings.push(
          `${catInfo.name} (${monthBudget.month}): Balance mismatch - expected ${calculatedAvailable.toFixed(2)}, got ${cat.balance.toFixed(2)}`
        );
      }

      const state: EnvelopeState = {
        categoryId: cat.categoryId,
        categoryName: catInfo.name,
        groupName: catInfo.groupName,
        month: monthBudget.month,
        budgeted: cat.budgeted,
        activity: cat.activity,
        available: cat.balance || calculatedAvailable,
        carryover,
      };

      // Add to category data
      if (!categoryData.has(cat.categoryId)) {
        categoryData.set(cat.categoryId, {
          categoryName: catInfo.name,
          groupName: catInfo.groupName,
          months: [],
        });
      }
      categoryData.get(cat.categoryId)!.months.push(state);

      // Store balance for next month's carryover
      currentBalances.set(cat.categoryId, cat.balance || calculatedAvailable);
    }

    previousBalances = currentBalances;
  }

  // Build timelines with summaries
  const timelines: CategoryEnvelopeTimeline[] = [];

  for (const [categoryId, data] of categoryData) {
    const { months } = data;
    const totalBudgeted = months.reduce((sum, m) => sum + m.budgeted, 0);
    const totalActivity = months.reduce((sum, m) => sum + m.activity, 0);

    // Count overspending/underspending months
    const monthsWithOverspending = months.filter(
      (m) => m.activity < 0 && Math.abs(m.activity) > m.budgeted + m.carryover
    ).length;
    const monthsWithUnderspending = months.filter((m) => m.available > 0 && m.budgeted > 0).length;

    // Net rollover effect: difference between first and last available
    const firstMonth = months[0];
    const lastMonth = months[months.length - 1];
    const netRolloverEffect = lastMonth ? lastMonth.available - (firstMonth?.carryover || 0) : 0;

    timelines.push({
      categoryId,
      categoryName: data.categoryName,
      groupName: data.groupName,
      months,
      summary: {
        totalBudgeted,
        totalActivity,
        averageMonthlyBudget: months.length > 0 ? totalBudgeted / months.length : 0,
        monthsWithOverspending,
        monthsWithUnderspending,
        netRolloverEffect,
      },
    });
  }

  return timelines;
}

/**
 * Convert envelope timelines to our simplified budget model
 */
function convertTimelines(
  timelines: CategoryEnvelopeTimeline[],
  warnings: string[]
): ConvertedBudget[] {
  return timelines.map((timeline) => {
    const { summary, months } = timeline;

    // Use average monthly budget as the recommended limit
    let monthlyLimit = summary.averageMonthlyBudget;

    // Adjust for patterns
    const notes: string[] = [];

    // If they consistently overspent, suggest increasing budget
    if (summary.monthsWithOverspending > months.length * 0.3) {
      const avgOverspend =
        months
          .filter((m) => m.activity < 0 && Math.abs(m.activity) > m.budgeted + m.carryover)
          .reduce((sum, m) => sum + (Math.abs(m.activity) - m.budgeted), 0) /
        summary.monthsWithOverspending;

      monthlyLimit += avgOverspend * 0.5; // Suggest 50% of average overspend
      notes.push(
        `Frequently overspent by avg $${avgOverspend.toFixed(2)}/month. Increased recommendation.`
      );
    }

    // If they consistently underspent, note it
    if (
      summary.monthsWithUnderspending > months.length * 0.7 &&
      summary.netRolloverEffect > monthlyLimit
    ) {
      notes.push(
        `Consistently underspent. Had $${summary.netRolloverEffect.toFixed(2)} accumulated rollover.`
      );
    }

    // Check for irregular budgeting patterns
    if (months.length >= 3) {
      const budgetedAmounts = months.map((m) => m.budgeted).filter((b) => b > 0);
      if (budgetedAmounts.length > 0) {
        const avg = budgetedAmounts.reduce((a, b) => a + b, 0) / budgetedAmounts.length;
        const variance =
          budgetedAmounts.reduce((sum, b) => sum + Math.pow(b - avg, 2), 0) /
          budgetedAmounts.length;
        const stdDev = Math.sqrt(variance);
        const cv = avg > 0 ? stdDev / avg : 0;

        if (cv > 0.5) {
          notes.push(
            `Highly variable budgeting pattern (CV: ${(cv * 100).toFixed(0)}%). Consider if this category has seasonal needs.`
          );
          warnings.push(
            `${timeline.categoryName}: Highly variable budgeting may not suit fixed monthly limits.`
          );
        }
      }
    }

    // Determine if recurring
    const isRecurring = months.filter((m) => m.budgeted > 0).length >= 3;

    return {
      categoryId: timeline.categoryId,
      categoryName: timeline.categoryName,
      groupName: timeline.groupName,
      monthlyLimit: Math.max(0, Math.round(monthlyLimit * 100) / 100),
      isRecurring,
      notes: notes.join(" "),
    };
  });
}

/**
 * Calculate overall stats
 */
function calculateStats(timelines: CategoryEnvelopeTimeline[]): RolloverConversionResult["stats"] {
  const categoriesWithRollover = timelines.filter((t) =>
    t.months.some((m) => Math.abs(m.carryover) > 0.01)
  ).length;

  const allRollovers = timelines.flatMap((t) => t.months.map((m) => m.carryover));
  const positiveRollovers = allRollovers.filter((r) => r > 0);
  const negativeRollovers = allRollovers.filter((r) => r < 0);

  return {
    totalCategories: timelines.length,
    categoriesWithRollover,
    averageRolloverAmount:
      allRollovers.length > 0 ? allRollovers.reduce((a, b) => a + b, 0) / allRollovers.length : 0,
    maxPositiveRollover: positiveRollovers.length > 0 ? Math.max(...positiveRollovers) : 0,
    maxNegativeRollover: negativeRollovers.length > 0 ? Math.min(...negativeRollovers) : 0,
  };
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Analyze spending patterns for a category
 */
export function analyzeSpendingPattern(timeline: CategoryEnvelopeTimeline): {
  pattern: "steady" | "variable" | "seasonal" | "irregular";
  recommendation: string;
  suggestedLimit: number;
} {
  const { months, summary } = timeline;

  if (months.length < 3) {
    return {
      pattern: "irregular",
      recommendation: "Not enough history to determine pattern. Start with average and adjust.",
      suggestedLimit: summary.averageMonthlyBudget,
    };
  }

  const activities = months.map((m) => Math.abs(m.activity));
  const avg = activities.reduce((a, b) => a + b, 0) / activities.length;
  const variance = activities.reduce((sum, a) => sum + Math.pow(a - avg, 2), 0) / activities.length;
  const stdDev = Math.sqrt(variance);
  const cv = avg > 0 ? stdDev / avg : 0;

  // Check for seasonality (compare same months across years)
  const monthlyAvgs = new Map<number, number[]>();
  for (const m of months) {
    const monthNum = parseInt(m.month.split("-")[1]);
    if (!monthlyAvgs.has(monthNum)) {
      monthlyAvgs.set(monthNum, []);
    }
    monthlyAvgs.get(monthNum)!.push(Math.abs(m.activity));
  }

  let isSeasonal = false;
  if (months.length >= 12) {
    // Check if certain months consistently have higher spending
    const monthVariances = Array.from(monthlyAvgs.entries()).map(([month, values]) => ({
      month,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    }));
    const highMonths = monthVariances.filter((m) => m.avg > avg * 1.5).length;
    isSeasonal = highMonths >= 2;
  }

  if (cv < 0.2) {
    return {
      pattern: "steady",
      recommendation: "Spending is very consistent. Use average as monthly limit.",
      suggestedLimit: avg,
    };
  } else if (isSeasonal) {
    return {
      pattern: "seasonal",
      recommendation: "Spending varies by season. Consider setting aside extra in low months.",
      suggestedLimit: avg * 1.1, // 10% buffer for seasonal variation
    };
  } else if (cv < 0.5) {
    return {
      pattern: "variable",
      recommendation: "Some variation in spending. Use average plus small buffer.",
      suggestedLimit: avg * 1.15, // 15% buffer
    };
  } else {
    return {
      pattern: "irregular",
      recommendation: "Spending is highly irregular. This may not suit fixed monthly budgeting.",
      suggestedLimit: avg * 1.25, // 25% buffer for irregular spending
    };
  }
}

/**
 * Generate migration report
 */
export function generateMigrationReport(result: RolloverConversionResult): string {
  const lines: string[] = [
    "# YNAB to Budget App Migration Report",
    "",
    "## Summary",
    `- Total categories migrated: ${result.stats.totalCategories}`,
    `- Categories with rollover history: ${result.stats.categoriesWithRollover}`,
    `- Average rollover amount: $${result.stats.averageRolloverAmount.toFixed(2)}`,
    `- Max positive rollover: $${result.stats.maxPositiveRollover.toFixed(2)}`,
    `- Max negative rollover: $${result.stats.maxNegativeRollover.toFixed(2)}`,
    "",
    "## Important Notes",
    "",
  ];

  for (const note of result.fidelityNotes) {
    lines.push(`- ${note}`);
  }

  if (result.warnings.length > 0) {
    lines.push("", "## Warnings", "");
    for (const warning of result.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  lines.push("", "## Converted Budgets", "");
  lines.push(
    "| Category | Group | Monthly Limit | Recurring | Notes |",
    "|----------|-------|--------------|-----------|-------|"
  );

  for (const budget of result.convertedBudgets) {
    lines.push(
      `| ${budget.categoryName} | ${budget.groupName} | $${budget.monthlyLimit.toFixed(2)} | ${budget.isRecurring ? "Yes" : "No"} | ${budget.notes || "-"} |`
    );
  }

  return lines.join("\n");
}
