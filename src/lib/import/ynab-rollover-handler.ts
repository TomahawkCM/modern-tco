/**
 * YNAB Rollover Handler (Y-016)
 * Handles YNAB's envelope budgeting rollover semantics
 *
 * ## YNAB Envelope Budgeting Model
 *
 * YNAB uses a zero-based envelope budgeting system where:
 * 1. Income is assigned to categories (envelopes)
 * 2. Money stays in the envelope until spent
 * 3. Positive balance = Available money rolls to next month
 * 4. Negative balance = Overspent, creates "debt" in the category
 *
 * ## Key YNAB Concepts
 *
 * - **Budgeted**: Amount allocated to category for the month
 * - **Activity**: Actual spending in the category (negative for expenses)
 * - **Available/Balance**: Budgeted + Activity + Previous Available
 * - **Ready to Assign**: Unallocated money (income not yet budgeted)
 *
 * ## Our Simplified Model
 *
 * Our Budget App uses a simpler model:
 * - Budget: Fixed monthly allocation per category
 * - Rollover: Boolean flag per budget entry
 * - No "Available" balance concept
 * - Each month is independent (unless rollover enabled)
 *
 * ## Fidelity Loss Documentation
 *
 * When migrating from YNAB, we lose:
 * 1. Per-category available balances
 * 2. Month-to-month rollover history
 * 3. Negative balance (overspent) tracking
 * 4. Ready to Assign balance
 * 5. Goal progress tracking
 *
 * This module helps bridge the gap by:
 * - Calculating what the rollover amounts would be
 * - Identifying categories with significant rollover
 * - Recommending which categories should have rollover enabled
 * - Creating adjustment transactions if needed
 */

import type { NormalizedMonthlyBudget, ParsedYNABData } from './ynab-parser';

// ============================================================================
// Types
// ============================================================================

export interface RolloverAnalysis {
  /** Category-level rollover analysis */
  categories: CategoryRolloverInfo[];
  /** Monthly rollover summary */
  monthlyRollovers: MonthlyRolloverSummary[];
  /** Overall statistics */
  stats: RolloverStats;
  /** Recommendations for our app */
  recommendations: RolloverRecommendation[];
  /** Fidelity warnings */
  fidelityWarnings: string[];
}

export interface CategoryRolloverInfo {
  categoryId: string;
  categoryName: string;
  groupName: string;
  /** Average monthly rollover amount */
  averageRollover: number;
  /** Maximum positive balance seen */
  maxPositiveBalance: number;
  /** Maximum negative (overspent) balance */
  maxNegativeBalance: number;
  /** How many months had positive rollover */
  positiveRolloverMonths: number;
  /** How many months were overspent */
  overspentMonths: number;
  /** Final available balance */
  finalBalance: number;
  /** Recommended rollover setting */
  recommendRollover: boolean;
  /** Reason for recommendation */
  rolloverReason: string;
}

export interface MonthlyRolloverSummary {
  month: string; // YYYY-MM
  /** Total positive rollover across all categories */
  totalPositiveRollover: number;
  /** Total negative rollover (overspent) */
  totalNegativeRollover: number;
  /** Net rollover */
  netRollover: number;
  /** Ready to Assign equivalent */
  unallocated: number;
  /** Categories with positive rollover */
  categoriesWithRollover: number;
  /** Categories overspent */
  categoriesOverspent: number;
}

export interface RolloverStats {
  /** Total months analyzed */
  monthsAnalyzed: number;
  /** Categories that typically roll over */
  savingsLikeCategories: number;
  /** Categories that rarely roll over */
  spendingCategories: number;
  /** Categories with chronic overspending */
  problematicCategories: number;
  /** Average overall rollover per month */
  averageMonthlyRollover: number;
  /** Final total available */
  finalTotalAvailable: number;
}

export interface RolloverRecommendation {
  categoryId: string;
  categoryName: string;
  recommendation: 'enable_rollover' | 'disable_rollover' | 'review_budget';
  reason: string;
  suggestedAction?: string;
}

export interface RolloverOptions {
  /** How to handle positive rollover */
  positiveRollover: 'enable' | 'disable' | 'smart';
  /** How to handle negative rollover (overspent) */
  negativeRollover: 'ignore' | 'create_adjustment' | 'warn';
  /** Threshold for enabling rollover (% of budget) */
  rolloverThreshold?: number;
  /** Categories to always enable rollover */
  alwaysRollover?: string[];
  /** Categories to never rollover */
  neverRollover?: string[];
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze YNAB data for rollover patterns
 */
export function analyzeYNABRollovers(
  data: ParsedYNABData
): RolloverAnalysis {
  const fidelityWarnings: string[] = [];
  const categories = new Map<string, CategoryRolloverTracker>();

  // Sort months chronologically
  const sortedMonths = [...data.monthlyBudgets].sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  // Track monthly summaries
  const monthlyRollovers: MonthlyRolloverSummary[] = [];

  // Build up the rollover analysis
  for (const month of sortedMonths) {
    let totalPositive = 0;
    let totalNegative = 0;
    let categoriesWithRollover = 0;
    let categoriesOverspent = 0;

    for (const cat of month.categories) {
      // Get or create tracker
      if (!categories.has(cat.categoryId)) {
        categories.set(cat.categoryId, {
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          groupName: cat.groupName,
          balances: [],
          budgetedAmounts: [],
          activityAmounts: [],
        });
      }

      const tracker = categories.get(cat.categoryId)!;
      tracker.balances.push(cat.balance);
      tracker.budgetedAmounts.push(cat.budgeted);
      tracker.activityAmounts.push(cat.activity);

      // Track monthly summary
      if (cat.balance > 0) {
        totalPositive += cat.balance;
        categoriesWithRollover++;
      } else if (cat.balance < 0) {
        totalNegative += cat.balance;
        categoriesOverspent++;
      }
    }

    monthlyRollovers.push({
      month: month.month,
      totalPositiveRollover: totalPositive,
      totalNegativeRollover: Math.abs(totalNegative),
      netRollover: totalPositive + totalNegative,
      unallocated: 0, // Would come from Ready to Assign if available
      categoriesWithRollover,
      categoriesOverspent,
    });
  }

  // Analyze each category
  const categoryInfos: CategoryRolloverInfo[] = [];

  for (const [, tracker] of categories) {
    const info = analyzeCategoryRollover(tracker);
    categoryInfos.push(info);
  }

  // Generate recommendations
  const recommendations = generateRecommendations(categoryInfos);

  // Calculate stats
  const stats = calculateRolloverStats(categoryInfos, monthlyRollovers);

  // Document fidelity loss
  addFidelityWarnings(fidelityWarnings, stats);

  return {
    categories: categoryInfos,
    monthlyRollovers,
    stats,
    recommendations,
    fidelityWarnings,
  };
}

// ============================================================================
// Helper Types and Functions
// ============================================================================

interface CategoryRolloverTracker {
  categoryId: string;
  categoryName: string;
  groupName: string;
  balances: number[];
  budgetedAmounts: number[];
  activityAmounts: number[];
}

function analyzeCategoryRollover(
  tracker: CategoryRolloverTracker
): CategoryRolloverInfo {
  const balances = tracker.balances;

  // Calculate metrics
  const positiveBalances = balances.filter((b) => b > 0);
  const negativeBalances = balances.filter((b) => b < 0);

  const avgRollover =
    balances.length > 0
      ? balances.reduce((a, b) => a + b, 0) / balances.length
      : 0;

  const maxPositive =
    positiveBalances.length > 0 ? Math.max(...positiveBalances) : 0;
  const maxNegative =
    negativeBalances.length > 0 ? Math.min(...negativeBalances) : 0;

  const finalBalance = balances.length > 0 ? balances[balances.length - 1] : 0;

  // Determine recommendation
  const { recommend, reason } = determineRolloverRecommendation(
    tracker.categoryName,
    tracker.groupName,
    avgRollover,
    positiveBalances.length,
    negativeBalances.length,
    balances.length
  );

  return {
    categoryId: tracker.categoryId,
    categoryName: tracker.categoryName,
    groupName: tracker.groupName,
    averageRollover: avgRollover,
    maxPositiveBalance: maxPositive,
    maxNegativeBalance: maxNegative,
    positiveRolloverMonths: positiveBalances.length,
    overspentMonths: negativeBalances.length,
    finalBalance,
    recommendRollover: recommend,
    rolloverReason: reason,
  };
}

function determineRolloverRecommendation(
  categoryName: string,
  groupName: string,
  avgRollover: number,
  positiveMonths: number,
  negativeMonths: number,
  totalMonths: number
): { recommend: boolean; reason: string } {
  const fullName = `${groupName} ${categoryName}`.toLowerCase();

  // Savings-type categories should always rollover
  const savingsPatterns = [
    /savings/i,
    /emergency/i,
    /vacation/i,
    /goal/i,
    /fund/i,
    /reserve/i,
    /sinking/i,
  ];

  if (savingsPatterns.some((p) => p.test(fullName))) {
    return {
      recommend: true,
      reason: 'Savings/goal category - rollover preserves progress',
    };
  }

  // Annual expense categories should rollover
  const annualPatterns = [
    /annual/i,
    /yearly/i,
    /christmas/i,
    /holiday/i,
    /insurance/i,
    /registration/i,
    /subscription/i,
  ];

  if (annualPatterns.some((p) => p.test(fullName))) {
    return {
      recommend: true,
      reason: 'Annual/periodic expense - needs accumulation',
    };
  }

  // If mostly positive balance, recommend rollover
  if (totalMonths > 0 && positiveMonths / totalMonths > 0.7) {
    return {
      recommend: true,
      reason: `${Math.round((positiveMonths / totalMonths) * 100)}% of months had positive balance`,
    };
  }

  // If frequently overspent, don't rollover (but warn)
  if (totalMonths > 0 && negativeMonths / totalMonths > 0.3) {
    return {
      recommend: false,
      reason: `Often overspent (${negativeMonths}/${totalMonths} months) - budget may need increase`,
    };
  }

  // Default: spending category, no rollover
  return {
    recommend: false,
    reason: 'Regular spending category - resets monthly',
  };
}

function generateRecommendations(
  categories: CategoryRolloverInfo[]
): RolloverRecommendation[] {
  const recommendations: RolloverRecommendation[] = [];

  for (const cat of categories) {
    if (cat.recommendRollover) {
      recommendations.push({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        recommendation: 'enable_rollover',
        reason: cat.rolloverReason,
        suggestedAction: `Enable rollover for "${cat.categoryName}"`,
      });
    } else if (cat.overspentMonths > cat.positiveRolloverMonths) {
      recommendations.push({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        recommendation: 'review_budget',
        reason: cat.rolloverReason,
        suggestedAction: `Consider increasing budget for "${cat.categoryName}" - frequently overspent`,
      });
    }
  }

  // Sort by recommendation type
  return recommendations.sort((a, b) => {
    const order = {
      enable_rollover: 0,
      review_budget: 1,
      disable_rollover: 2,
    };
    return order[a.recommendation] - order[b.recommendation];
  });
}

function calculateRolloverStats(
  categories: CategoryRolloverInfo[],
  monthlyRollovers: MonthlyRolloverSummary[]
): RolloverStats {
  const savingsLike = categories.filter((c) => c.recommendRollover).length;
  const spending = categories.filter((c) => !c.recommendRollover).length;
  const problematic = categories.filter(
    (c) =>
      c.overspentMonths > 0 &&
      c.overspentMonths > c.positiveRolloverMonths
  ).length;

  const avgMonthlyRollover =
    monthlyRollovers.length > 0
      ? monthlyRollovers.reduce((sum, m) => sum + m.netRollover, 0) /
        monthlyRollovers.length
      : 0;

  const finalTotal = categories.reduce(
    (sum, c) => sum + c.finalBalance,
    0
  );

  return {
    monthsAnalyzed: monthlyRollovers.length,
    savingsLikeCategories: savingsLike,
    spendingCategories: spending,
    problematicCategories: problematic,
    averageMonthlyRollover: avgMonthlyRollover,
    finalTotalAvailable: finalTotal,
  };
}

function addFidelityWarnings(
  warnings: string[],
  stats: RolloverStats
): void {
  warnings.push(
    'YNAB Migration Fidelity Notice: The following features cannot be fully preserved:'
  );

  warnings.push(
    `1. Per-category available balances: YNAB tracks $${stats.finalTotalAvailable.toFixed(2)} in available balances that will be lost`
  );

  warnings.push(
    '2. Month-to-month rollover history: Only final balances are captured'
  );

  warnings.push(
    '3. Negative balance (overspent) tracking: Our app does not track category debt'
  );

  warnings.push(
    '4. Ready to Assign balance: Unallocated money is not tracked in our model'
  );

  if (stats.problematicCategories > 0) {
    warnings.push(
      `5. Budget adjustment needed: ${stats.problematicCategories} categories were frequently overspent`
    );
  }

  warnings.push(
    '\nRecommendation: Review the rollover recommendations and enable rollover for savings-type categories'
  );
}

// ============================================================================
// Rollover Application Functions
// ============================================================================

/**
 * Apply rollover analysis to create adjusted budgets
 */
export function applyRolloverSettings(
  analysis: RolloverAnalysis,
  options: RolloverOptions
): {
  categoriesToRollover: Set<string>;
  adjustments: Array<{
    categoryId: string;
    amount: number;
    reason: string;
  }>;
  warnings: string[];
} {
  const categoriesToRollover = new Set<string>();
  const adjustments: Array<{
    categoryId: string;
    amount: number;
    reason: string;
  }> = [];
  const warnings: string[] = [];

  for (const cat of analysis.categories) {
    // Check if explicitly configured
    if (options.alwaysRollover?.includes(cat.categoryName)) {
      categoriesToRollover.add(cat.categoryId);
      continue;
    }

    if (options.neverRollover?.includes(cat.categoryName)) {
      continue;
    }

    // Apply smart logic
    if (options.positiveRollover === 'enable') {
      if (cat.averageRollover > 0) {
        categoriesToRollover.add(cat.categoryId);
      }
    } else if (options.positiveRollover === 'smart') {
      if (cat.recommendRollover) {
        categoriesToRollover.add(cat.categoryId);
      }
    }

    // Handle negative rollover (overspent)
    if (cat.finalBalance < 0) {
      if (options.negativeRollover === 'create_adjustment') {
        adjustments.push({
          categoryId: cat.categoryId,
          amount: Math.abs(cat.finalBalance),
          reason: `Adjustment for overspent balance from YNAB migration`,
        });
      } else if (options.negativeRollover === 'warn') {
        warnings.push(
          `Category "${cat.categoryName}" has overspent balance of $${Math.abs(cat.finalBalance).toFixed(2)}`
        );
      }
    }
  }

  return {
    categoriesToRollover,
    adjustments,
    warnings,
  };
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick rollover analysis with default options
 */
export function quickRolloverAnalysis(
  data: ParsedYNABData
): {
  savingsCategories: string[];
  spendingCategories: string[];
  needsReview: string[];
} {
  const analysis = analyzeYNABRollovers(data);

  return {
    savingsCategories: analysis.categories
      .filter((c) => c.recommendRollover)
      .map((c) => c.categoryName),
    spendingCategories: analysis.categories
      .filter((c) => !c.recommendRollover && c.overspentMonths === 0)
      .map((c) => c.categoryName),
    needsReview: analysis.categories
      .filter((c) => c.overspentMonths > c.positiveRolloverMonths)
      .map((c) => c.categoryName),
  };
}

/**
 * Get final available balance by category (for reference)
 */
export function getFinalBalances(
  data: ParsedYNABData
): Map<string, { name: string; balance: number }> {
  const analysis = analyzeYNABRollovers(data);
  const result = new Map<string, { name: string; balance: number }>();

  for (const cat of analysis.categories) {
    result.set(cat.categoryId, {
      name: cat.categoryName,
      balance: cat.finalBalance,
    });
  }

  return result;
}
