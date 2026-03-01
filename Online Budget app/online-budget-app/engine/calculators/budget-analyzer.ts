/**
 * 50/30/20 Budget Analyzer
 *
 * Analyze spending against the 50/30/20 rule:
 * - 50% Needs (housing, utilities, groceries, insurance)
 * - 30% Wants (dining, entertainment, shopping)
 * - 20% Savings (savings, investments, debt repayment)
 *
 * Ported from offline app — money helpers replaced with plain arithmetic.
 * All functions are pure, accept/return regular numbers.
 */

import type {
  BudgetAnalyzerInput,
  BudgetAnalyzerResult,
  BucketAnalysis,
  BudgetBucket,
  CategoryMapping,
} from "./types";
import { DEFAULT_BUCKET_MAPPINGS } from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Target percentages for each bucket
 */
const TARGET_PERCENTAGES: Record<BudgetBucket, number> = {
  needs: 50,
  wants: 30,
  savings: 20,
};

/**
 * Analyze budget against 50/30/20 rule
 *
 * @param input - Income, category mappings, and transaction totals
 * @returns Analysis of each bucket with recommendations
 */
export function calculateBudgetAnalysis(
  input: BudgetAnalyzerInput
): BudgetAnalyzerResult {
  const { monthlyNetIncome, categoryMappings, transactionTotals } = input;

  if (monthlyNetIncome <= 0) {
    return createEmptyResult();
  }

  // Create mapping lookup
  const mappingLookup = new Map<string, BudgetBucket>();
  categoryMappings.forEach((mapping) => {
    mappingLookup.set(mapping.categoryId.toLowerCase(), mapping.bucket);
    mappingLookup.set(mapping.categoryName.toLowerCase(), mapping.bucket);
  });

  // Group transaction totals by bucket
  const bucketTotals: Record<
    BudgetBucket,
    { categories: typeof transactionTotals; total: number }
  > = {
    needs: { categories: [], total: 0 },
    wants: { categories: [], total: 0 },
    savings: { categories: [], total: 0 },
  };

  transactionTotals.forEach((cat) => {
    // Get bucket from mapping or try to infer from name
    const bucket =
      mappingLookup.get(cat.categoryId.toLowerCase()) ||
      mappingLookup.get(cat.categoryName.toLowerCase()) ||
      inferBucket(cat.categoryName);

    // Transaction totals are typically negative for expenses
    const amount = Math.abs(cat.total);

    bucketTotals[bucket].categories.push(cat);
    bucketTotals[bucket].total += amount;
  });

  // Calculate analysis for each bucket
  const needs = createBucketAnalysis(
    "needs",
    monthlyNetIncome,
    bucketTotals.needs
  );
  const wants = createBucketAnalysis(
    "wants",
    monthlyNetIncome,
    bucketTotals.wants
  );
  const savings = createBucketAnalysis(
    "savings",
    monthlyNetIncome,
    bucketTotals.savings
  );

  // Calculate totals
  const totalSpending = round2(needs.actualAmount + wants.actualAmount);
  const totalSavings = round2(savings.actualAmount);

  // Check if balanced (within 5% tolerance for each bucket)
  const isBalanced =
    Math.abs(needs.variancePercent) <= 5 &&
    Math.abs(wants.variancePercent) <= 5 &&
    Math.abs(savings.variancePercent) <= 5;

  // Generate recommendations
  const recommendations = generateRecommendations(
    needs,
    wants,
    savings,
    monthlyNetIncome
  );

  return {
    needs,
    wants,
    savings,
    totalSpending,
    totalSavings,
    isBalanced,
    recommendations,
  };
}

/**
 * Create analysis for a single bucket
 */
function createBucketAnalysis(
  bucket: BudgetBucket,
  income: number,
  data: {
    categories: BudgetAnalyzerInput["transactionTotals"];
    total: number;
  }
): BucketAnalysis {
  const targetPercent = TARGET_PERCENTAGES[bucket];
  const targetAmount = round2(income * (targetPercent / 100));
  const actualAmount = round2(data.total);
  const actualPercent =
    income > 0 ? round2((actualAmount / income) * 100) : 0;
  const variance = round2(actualAmount - targetAmount);
  const variancePercent = round2(actualPercent - targetPercent);
  const isOverBudget = actualAmount > targetAmount;

  // Sort categories by amount
  const sortedCategories = data.categories
    .map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      amount: Math.abs(cat.total),
      percentOfBucket:
        actualAmount > 0
          ? round2((Math.abs(cat.total) / actualAmount) * 100)
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    bucket,
    targetPercent,
    targetAmount,
    actualAmount,
    actualPercent,
    variance,
    variancePercent,
    isOverBudget,
    categories: sortedCategories,
  };
}

/**
 * Try to infer bucket from category name
 */
export function inferBucket(categoryName: string): BudgetBucket {
  const name = categoryName.toLowerCase();

  // Check against common patterns
  const needsPatterns = [
    "rent",
    "mortgage",
    "utilities",
    "groceries",
    "grocery",
    "insurance",
    "healthcare",
    "health",
    "medical",
    "transportation",
    "gas",
    "fuel",
    "childcare",
    "phone",
    "internet",
    "water",
    "electric",
    "heat",
  ];

  const savingsPatterns = [
    "savings",
    "investment",
    "retirement",
    "401k",
    "rrsp",
    "tfsa",
    "emergency",
    "debt repayment",
    "extra payment",
  ];

  if (needsPatterns.some((pattern) => name.includes(pattern))) {
    return "needs";
  }

  if (savingsPatterns.some((pattern) => name.includes(pattern))) {
    return "savings";
  }

  // Default to wants for discretionary spending
  return "wants";
}

/**
 * Generate recommendations based on analysis
 */
export function generateRecommendations(
  needs: BucketAnalysis,
  wants: BucketAnalysis,
  savings: BucketAnalysis,
  _income: number
): string[] {
  const recommendations: string[] = [];

  // Needs recommendations
  if (needs.isOverBudget && needs.variancePercent > 5) {
    recommendations.push(
      `Your essential expenses are ${Math.abs(needs.variancePercent).toFixed(0)}% over target. ` +
        `Consider reviewing housing costs or shopping for better insurance rates.`
    );
  }

  // Wants recommendations
  if (wants.isOverBudget && wants.variancePercent > 5) {
    recommendations.push(
      `Discretionary spending is ${Math.abs(wants.variancePercent).toFixed(0)}% over target. ` +
        `Review subscriptions and dining expenses for potential cuts.`
    );

    // Find top wants category
    if (wants.categories.length > 0) {
      const topWant = wants.categories[0]!;
      recommendations.push(
        `${topWant.categoryName} accounts for ${topWant.percentOfBucket.toFixed(0)}% of your wants spending.`
      );
    }
  }

  // Savings recommendations
  if (!savings.isOverBudget && savings.variancePercent < -5) {
    recommendations.push(
      `Your savings rate is ${Math.abs(savings.variancePercent).toFixed(0)}% below target. ` +
        `Try to automate transfers to savings at the start of each month.`
    );
  } else if (savings.isOverBudget) {
    recommendations.push(
      `Great job! You're saving ${savings.actualPercent.toFixed(0)}% of your income, ` +
        `exceeding the 20% target.`
    );
  }

  // General recommendations
  if (needs.isOverBudget && !wants.isOverBudget) {
    const couldRedirect = round2(wants.targetAmount - wants.actualAmount);
    if (couldRedirect > 0) {
      recommendations.push(
        `You have room in your wants budget that could cover the needs overage.`
      );
    }
  }

  return recommendations;
}

/**
 * Create empty result
 */
function createEmptyResult(): BudgetAnalyzerResult {
  const emptyBucket = (bucket: BudgetBucket): BucketAnalysis => ({
    bucket,
    targetPercent: TARGET_PERCENTAGES[bucket],
    targetAmount: 0,
    actualAmount: 0,
    actualPercent: 0,
    variance: 0,
    variancePercent: 0,
    isOverBudget: false,
    categories: [],
  });

  return {
    needs: emptyBucket("needs"),
    wants: emptyBucket("wants"),
    savings: emptyBucket("savings"),
    totalSpending: 0,
    totalSavings: 0,
    isBalanced: true,
    recommendations: [],
  };
}

/**
 * Get default category to bucket mappings
 */
export function getDefaultMappings(): CategoryMapping[] {
  return Object.entries(DEFAULT_BUCKET_MAPPINGS).map(
    ([categoryName, bucket]) => ({
      categoryId: categoryName.toLowerCase().replace(/\s+/g, "_"),
      categoryName,
      bucket,
    })
  );
}
