/**
 * YNAB Budget Transformer (Y-014)
 * Transforms YNAB monthly budget allocations to Budget App format
 *
 * YNAB uses monthly budget allocations per category.
 * Our Budget App uses period-based budgets with optional rollover.
 *
 * Key transformations:
 * - Monthly allocations → Budget entities
 * - Activity → Used for historical tracking
 * - Balance → Rollover calculation
 * - Goal types → Future purchase suggestions
 */

import type { Budget, FuturePurchase } from '@/types/budget';
import type {
  NormalizedMonthlyBudget,
  NormalizedCategoryGroup,
  ParsedYNABData,
} from './ynab-parser';

// ============================================================================
// Types
// ============================================================================

export interface BudgetTransformOptions {
  /** Category ID mapping from YNAB IDs to our IDs */
  categoryIdMap: Map<string, string>;
  /** How to handle rollover */
  rolloverMode: 'preserve' | 'disable' | 'auto';
  /** Only import the most recent N months */
  recentMonthsOnly?: number;
  /** Start date for budget imports */
  startFromMonth?: string; // YYYY-MM format
  /** Whether to create FuturePurchase from YNAB goals */
  importGoals?: boolean;
}

export interface BudgetTransformResult {
  /** Budget entries (one per category per month) */
  budgets: Budget[];
  /** Suggested future purchases from YNAB goals */
  futurePurchases: FuturePurchase[];
  /** Monthly budget summary */
  monthlySummaries: MonthlyBudgetSummary[];
  /** Statistics */
  stats: BudgetTransformStats;
  /** Warnings */
  warnings: string[];
}

export interface MonthlyBudgetSummary {
  month: string; // YYYY-MM
  totalBudgeted: number;
  totalActivity: number;
  totalAvailable: number;
  categoryCount: number;
  categories: {
    name: string;
    group: string;
    budgeted: number;
    activity: number;
    available: number;
  }[];
}

export interface BudgetTransformStats {
  totalMonths: number;
  totalBudgetEntries: number;
  categoriesWithBudget: number;
  categoriesWithoutBudget: number;
  goalsImported: number;
  monthsSkipped: number;
}

// ============================================================================
// Goal Type Mapping
// ============================================================================

/**
 * YNAB goal types:
 * - TB: Target Category Balance
 * - TBD: Target Category Balance by Date
 * - MF: Monthly Funding Goal
 * - NEED: Needed for Spending
 * - DEBT: Debt Payment (for credit cards)
 */
interface YNABGoalInfo {
  goalType: string | null;
  goalTarget: number;
  goalTargetMonth: string | null;
  goalPercentageComplete: number;
}

// ============================================================================
// Main Transformer
// ============================================================================

/**
 * Transform YNAB budget data to our Budget format
 */
export function transformYNABBudgets(
  data: ParsedYNABData,
  options: BudgetTransformOptions
): BudgetTransformResult {
  const warnings: string[] = [];
  const stats: BudgetTransformStats = {
    totalMonths: data.monthlyBudgets.length,
    totalBudgetEntries: 0,
    categoriesWithBudget: 0,
    categoriesWithoutBudget: 0,
    goalsImported: 0,
    monthsSkipped: 0,
  };

  const budgets: Budget[] = [];
  const futurePurchases: FuturePurchase[] = [];
  const monthlySummaries: MonthlyBudgetSummary[] = [];
  const categoriesWithBudget = new Set<string>();

  // Filter months based on options
  let monthsToProcess = data.monthlyBudgets;

  if (options.startFromMonth) {
    monthsToProcess = monthsToProcess.filter(
      (m) => m.month >= options.startFromMonth!
    );
    stats.monthsSkipped =
      data.monthlyBudgets.length - monthsToProcess.length;
  }

  if (options.recentMonthsOnly && options.recentMonthsOnly > 0) {
    // Sort descending and take the most recent N
    monthsToProcess = [...monthsToProcess]
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, options.recentMonthsOnly);
    stats.monthsSkipped = Math.max(
      0,
      data.monthlyBudgets.length - monthsToProcess.length
    );
  }

  // Process each month
  for (const monthData of monthsToProcess) {
    const monthBudgets = processMonth(
      monthData,
      options,
      warnings,
      categoriesWithBudget
    );

    budgets.push(...monthBudgets);
    stats.totalBudgetEntries += monthBudgets.length;

    // Create monthly summary
    const summary = createMonthlySummary(monthData);
    monthlySummaries.push(summary);
  }

  // Process goals from category data
  if (options.importGoals) {
    const goals = extractGoalsFromCategories(
      data.categoryGroups,
      options.categoryIdMap,
      warnings
    );
    futurePurchases.push(...goals);
    stats.goalsImported = goals.length;
  }

  // Calculate category stats
  stats.categoriesWithBudget = categoriesWithBudget.size;
  stats.categoriesWithoutBudget =
    options.categoryIdMap.size - categoriesWithBudget.size;

  // Sort summaries by month (newest first)
  monthlySummaries.sort((a, b) => b.month.localeCompare(a.month));

  return {
    budgets,
    futurePurchases,
    monthlySummaries,
    stats,
    warnings: [...data.warnings, ...warnings],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function processMonth(
  monthData: NormalizedMonthlyBudget,
  options: BudgetTransformOptions,
  warnings: string[],
  categoriesWithBudget: Set<string>
): Budget[] {
  const budgets: Budget[] = [];
  const now = new Date();

  // Parse month string to dates
  const [year, month] = monthData.month.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  for (const cat of monthData.categories) {
    // Skip categories with no budget (optional, depends on use case)
    // if (cat.budgeted === 0 && cat.activity === 0) continue;

    // Look up our category ID
    const ourCategoryId = options.categoryIdMap.get(cat.categoryId);

    if (!ourCategoryId) {
      // Try to find by name as fallback
      const byName = findCategoryIdByName(
        cat.categoryName,
        options.categoryIdMap
      );
      if (!byName) {
        warnings.push(
          `Skipping budget for unknown category: ${cat.categoryName} (${cat.categoryId})`
        );
        continue;
      }
    }

    const categoryId = ourCategoryId || cat.categoryId;

    // Track categories with budget
    if (cat.budgeted > 0) {
      categoriesWithBudget.add(categoryId);
    }

    // Determine rollover based on balance
    let rollover = false;
    if (options.rolloverMode === 'preserve') {
      // Rollover if there's a positive balance
      rollover = cat.balance > 0;
    } else if (options.rolloverMode === 'auto') {
      // Auto-detect based on category type (savings-like categories roll over)
      rollover = isSavingsCategory(cat.categoryName, cat.groupName);
    }

    budgets.push({
      id: crypto.randomUUID(),
      categoryId,
      amount: cat.budgeted,
      period: 'monthly',
      startDate,
      endDate,
      rollover,
      createdAt: now,
      updatedAt: now,
    });
  }

  return budgets;
}

function findCategoryIdByName(
  name: string,
  categoryIdMap: Map<string, string>
): string | null {
  // This is a fallback - we'd need a reverse lookup
  // For now, return null to trigger the warning
  return null;
}

function isSavingsCategory(categoryName: string, groupName: string): boolean {
  const savingsPatterns = [
    /savings/i,
    /emergency/i,
    /vacation/i,
    /goal/i,
    /fund/i,
    /reserve/i,
    /target/i,
    /saving\s+for/i,
  ];

  const fullName = `${groupName} ${categoryName}`;
  return savingsPatterns.some((p) => p.test(fullName));
}

function createMonthlySummary(
  monthData: NormalizedMonthlyBudget
): MonthlyBudgetSummary {
  let totalBudgeted = 0;
  let totalActivity = 0;
  let totalAvailable = 0;

  const categories = monthData.categories.map((cat) => {
    totalBudgeted += cat.budgeted;
    totalActivity += cat.activity;
    totalAvailable += cat.balance;

    return {
      name: cat.categoryName,
      group: cat.groupName,
      budgeted: cat.budgeted,
      activity: cat.activity,
      available: cat.balance,
    };
  });

  return {
    month: monthData.month,
    totalBudgeted,
    totalActivity,
    totalAvailable,
    categoryCount: categories.length,
    categories,
  };
}

function extractGoalsFromCategories(
  categoryGroups: NormalizedCategoryGroup[],
  categoryIdMap: Map<string, string>,
  warnings: string[]
): FuturePurchase[] {
  const futurePurchases: FuturePurchase[] = [];
  const now = new Date();

  for (const group of categoryGroups) {
    for (const cat of group.categories) {
      // Check if category has goal-like properties
      // These would come from the original YNAB goal data
      // For now, we'll check for savings-type categories with balances

      if (
        isSavingsCategory(cat.name, group.name) &&
        cat.balance > 0 &&
        cat.budgeted > 0
      ) {
        // Calculate estimated target based on funding pattern
        const estimatedTarget = cat.budgeted * 12; // Assume 12 months

        futurePurchases.push({
          id: crypto.randomUUID(),
          name: cat.name,
          description: `Imported from YNAB: ${group.name}`,
          targetAmount: estimatedTarget,
          currentSavings: cat.balance,
          monthlyContribution: cat.budgeted,
          targetDate: new Date(
            now.getFullYear() + 1,
            now.getMonth(),
            now.getDate()
          ), // Default 1 year
          priority: 'medium',
          category: group.name,
          notes: `Auto-imported from YNAB savings category`,
          isCompleted: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  return futurePurchases;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick budget transform with default options
 */
export function quickTransformBudgets(
  data: ParsedYNABData,
  categoryIdMap: Map<string, string>
): BudgetTransformResult {
  return transformYNABBudgets(data, {
    categoryIdMap,
    rolloverMode: 'auto',
    recentMonthsOnly: 12, // Last 12 months
    importGoals: true,
  });
}

/**
 * Get budget summary for a specific month
 */
export function getBudgetSummaryForMonth(
  data: ParsedYNABData,
  month: string // YYYY-MM
): MonthlyBudgetSummary | null {
  const monthData = data.monthlyBudgets.find((m) => m.month === month);
  if (!monthData) return null;
  return createMonthlySummary(monthData);
}

/**
 * Calculate average monthly budget by category
 */
export function calculateAverageMonthlyBudget(
  data: ParsedYNABData
): Map<string, number> {
  const categoryTotals = new Map<string, { total: number; count: number }>();

  for (const month of data.monthlyBudgets) {
    for (const cat of month.categories) {
      const key = `${cat.groupName}:${cat.categoryName}`;
      const existing = categoryTotals.get(key) || { total: 0, count: 0 };
      existing.total += cat.budgeted;
      existing.count++;
      categoryTotals.set(key, existing);
    }
  }

  const averages = new Map<string, number>();
  for (const [key, { total, count }] of categoryTotals) {
    averages.set(key, count > 0 ? total / count : 0);
  }

  return averages;
}

/**
 * Create Budget entries for the current month based on YNAB averages
 */
export function createCurrentMonthBudgets(
  data: ParsedYNABData,
  categoryIdMap: Map<string, string>
): Budget[] {
  const averages = calculateAverageMonthlyBudget(data);
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const budgets: Budget[] = [];

  for (const [key, avgAmount] of averages) {
    const [groupName, categoryName] = key.split(':');

    // Find our category ID
    // This is simplified - in practice you'd have a proper lookup
    const categoryId = findCategoryByName(categoryName, categoryIdMap);
    if (!categoryId) continue;

    budgets.push({
      id: crypto.randomUUID(),
      categoryId,
      amount: Math.round(avgAmount * 100) / 100, // Round to 2 decimals
      period: 'monthly',
      startDate,
      endDate,
      rollover: isSavingsCategory(categoryName, groupName),
      createdAt: now,
      updatedAt: now,
    });
  }

  return budgets;
}

function findCategoryByName(
  name: string,
  categoryIdMap: Map<string, string>
): string | null {
  // Look for exact match in values
  for (const [ynabId, ourId] of categoryIdMap) {
    if (ynabId.toLowerCase().includes(name.toLowerCase())) {
      return ourId;
    }
  }
  return null;
}
