/**
 * Financial Health Score Module (Phase 5)
 *
 * Research Summary (H-001):
 * - FICO-like scoring: Uses multiple weighted factors to produce 0-100 score
 * - Financial wellness indices: Consider savings, debt, budgeting behaviors
 * - Academic research: Based on behavioral finance principles
 *
 * Our Approach:
 * - 6 factors totaling 100 points max
 * - Each factor uses linear interpolation within defined ranges
 * - Missing data handled gracefully (factor skipped, score normalized)
 * - Historical tracking for trend analysis
 */

import { db } from "@/lib/budget-db";
import type { Transaction, Budget, FuturePurchase } from "@/types/budget";

/**
 * Health Score Factor Types (H-002)
 */
export type FactorType =
  | "savingsRate"
  | "debtToIncome"
  | "budgetAdherence"
  | "emergencyFund"
  | "investmentGrowth"
  | "expenseStability";

/**
 * Factor weight configuration
 */
export const FACTOR_WEIGHTS: Record<FactorType, number> = {
  savingsRate: 20,
  debtToIncome: 20,
  budgetAdherence: 20,
  emergencyFund: 15,
  investmentGrowth: 15,
  expenseStability: 10,
};

/**
 * Individual factor result
 */
export interface FactorResult {
  type: FactorType;
  score: number;
  maxScore: number;
  percentage: number;
  value: number;
  description: string;
  improvementTip?: string;
}

/**
 * Complete health score result
 */
export interface HealthScoreResult {
  score: number;
  maxPossibleScore: number;
  normalizedScore: number; // 0-100 accounting for missing data
  grade: "A" | "B" | "C" | "D" | "F";
  factors: FactorResult[];
  calculatedAt: Date;
  missingFactors: FactorType[];
  topRecommendation?: string;
}

/**
 * Historical score entry
 */
export interface HistoricalScore {
  date: Date;
  score: number;
  factors: Record<FactorType, number>;
}

/**
 * Input data for health score calculation
 */
export interface HealthScoreInput {
  transactions: Transaction[];
  budgets: Budget[];
  futurePurchases: FuturePurchase[];
  emergencyFundId?: string;
  monthsToAnalyze?: number;
}

/**
 * Linear interpolation helper
 */
function lerp(value: number, min: number, max: number, minScore: number, maxScore: number): number {
  if (value <= min) return minScore;
  if (value >= max) return maxScore;
  const t = (value - min) / (max - min);
  return minScore + t * (maxScore - minScore);
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get monthly income from transactions
 */
function getMonthlyIncome(transactions: Transaction[], monthsBack: number = 3): number {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

  const income = transactions
    .filter((tx) => tx.amount > 0 && new Date(tx.date) >= startDate)
    .reduce((sum, tx) => sum + tx.amount, 0);

  return income / monthsBack;
}

/**
 * Get monthly expenses from transactions
 */
function getMonthlyExpenses(transactions: Transaction[], monthsBack: number = 3): number {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

  const expenses = transactions
    .filter((tx) => tx.amount < 0 && new Date(tx.date) >= startDate)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return expenses / monthsBack;
}

/**
 * H-010: Calculate Savings Rate Factor
 * Savings rate = (Income - Expenses) / Income
 * Scoring: 0% = 0 points, 10% = 10 points, 20%+ = 20 points
 */
export function calculateSavingsRateFactor(
  transactions: Transaction[],
  monthsBack: number = 3
): FactorResult | null {
  const income = getMonthlyIncome(transactions, monthsBack);
  const expenses = getMonthlyExpenses(transactions, monthsBack);

  if (income <= 0) return null;

  const savings = income - expenses;
  const savingsRate = (savings / income) * 100;

  // Score: 0% = 0, 10% = 10, 20%+ = 20
  const score = clamp(lerp(savingsRate, 0, 20, 0, 20), 0, 20);

  let improvementTip: string | undefined;
  if (savingsRate < 10) {
    const targetSavings = income * 0.1;
    const additionalNeeded = targetSavings - savings;
    improvementTip = `Save an additional $${additionalNeeded.toFixed(0)}/month to reach 10% savings rate`;
  } else if (savingsRate < 20) {
    const targetSavings = income * 0.2;
    const additionalNeeded = targetSavings - savings;
    improvementTip = `Save an additional $${additionalNeeded.toFixed(0)}/month to reach 20% savings rate`;
  }

  return {
    type: "savingsRate",
    score: Math.round(score * 10) / 10,
    maxScore: FACTOR_WEIGHTS.savingsRate,
    percentage: (score / FACTOR_WEIGHTS.savingsRate) * 100,
    value: savingsRate,
    description: `${savingsRate.toFixed(1)}% of income saved`,
    improvementTip,
  };
}

/**
 * H-011: Calculate Debt-to-Income Factor
 * DTI = Monthly debt payments / Monthly income
 * Scoring: 50%+ = 0, 30% = 10, 10% or less = 20
 */
export function calculateDebtToIncomeFactor(
  transactions: Transaction[],
  monthsBack: number = 3
): FactorResult | null {
  const income = getMonthlyIncome(transactions, monthsBack);

  if (income <= 0) return null;

  // Identify debt payments (loans, credit cards, mortgages)
  const debtCategories = ["Loans", "Credit Card", "Mortgage", "Debt", "Car Payment"];
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

  const debtPayments = transactions
    .filter((tx) => {
      if (tx.amount >= 0) return false;
      if (new Date(tx.date) < startDate) return false;
      const category = tx.category?.toLowerCase() || "";
      return debtCategories.some((dc) => category.includes(dc.toLowerCase()));
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const monthlyDebt = debtPayments / monthsBack;
  const dti = (monthlyDebt / income) * 100;

  // Score: 50%+ = 0, 30% = 10, 10% or less = 20 (inverse scale)
  let score: number;
  if (dti >= 50) {
    score = 0;
  } else if (dti <= 10) {
    score = 20;
  } else {
    // Linear interpolation between 10% (20 points) and 50% (0 points)
    score = lerp(dti, 10, 50, 20, 0);
  }

  let improvementTip: string | undefined;
  if (dti > 30) {
    const targetDebt = income * 0.3;
    const reductionNeeded = monthlyDebt - targetDebt;
    improvementTip = `Reduce debt payments by $${reductionNeeded.toFixed(0)}/month to reach 30% DTI`;
  } else if (dti > 10) {
    const targetDebt = income * 0.1;
    const reductionNeeded = monthlyDebt - targetDebt;
    improvementTip = `Reduce debt payments by $${reductionNeeded.toFixed(0)}/month to reach 10% DTI`;
  }

  return {
    type: "debtToIncome",
    score: Math.round(score * 10) / 10,
    maxScore: FACTOR_WEIGHTS.debtToIncome,
    percentage: (score / FACTOR_WEIGHTS.debtToIncome) * 100,
    value: dti,
    description: `${dti.toFixed(1)}% debt-to-income ratio`,
    improvementTip,
  };
}

/**
 * H-012: Calculate Budget Adherence Factor
 * Percentage of categories within budget
 * Scoring: 50% = 0, 75% = 10, 100% = 20
 */
export function calculateBudgetAdherenceFactor(
  transactions: Transaction[],
  budgets: Budget[]
): FactorResult | null {
  if (budgets.length === 0) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Calculate spending per category this month
  const spendingByCategory = new Map<string, number>();
  transactions
    .filter((tx) => tx.amount < 0 && new Date(tx.date) >= startOfMonth)
    .forEach((tx) => {
      const category = tx.category || "Uncategorized";
      const current = spendingByCategory.get(category) || 0;
      spendingByCategory.set(category, current + Math.abs(tx.amount));
    });

  // Check how many budgets are within limit
  let withinBudget = 0;
  let totalBudgets = 0;

  budgets.forEach((budget) => {
    if (budget.amount > 0) {
      totalBudgets++;
      const spent = spendingByCategory.get(budget.categoryId) || 0;
      if (spent <= budget.amount) {
        withinBudget++;
      }
    }
  });

  if (totalBudgets === 0) return null;

  const adherenceRate = (withinBudget / totalBudgets) * 100;

  // Score: 50% = 0, 75% = 10, 100% = 20
  let score: number;
  if (adherenceRate <= 50) {
    score = 0;
  } else if (adherenceRate >= 100) {
    score = 20;
  } else {
    score = lerp(adherenceRate, 50, 100, 0, 20);
  }

  const overBudgetCount = totalBudgets - withinBudget;
  let improvementTip: string | undefined;
  if (overBudgetCount > 0) {
    improvementTip = `${overBudgetCount} categor${overBudgetCount === 1 ? "y is" : "ies are"} over budget. Review spending to improve.`;
  }

  return {
    type: "budgetAdherence",
    score: Math.round(score * 10) / 10,
    maxScore: FACTOR_WEIGHTS.budgetAdherence,
    percentage: (score / FACTOR_WEIGHTS.budgetAdherence) * 100,
    value: adherenceRate,
    description: `${withinBudget}/${totalBudgets} categories within budget (${adherenceRate.toFixed(0)}%)`,
    improvementTip,
  };
}

/**
 * H-013: Calculate Emergency Fund Factor
 * Months of expenses saved
 * Scoring: 0 months = 0, 3 months = 10, 6+ months = 15
 */
export function calculateEmergencyFundFactor(
  transactions: Transaction[],
  futurePurchases: FuturePurchase[],
  emergencyFundId?: string
): FactorResult | null {
  const monthlyExpenses = getMonthlyExpenses(transactions, 3);

  if (monthlyExpenses <= 0) return null;

  // Find emergency fund from future purchases or estimate from savings
  let emergencyFund = 0;

  if (emergencyFundId) {
    const purchase = futurePurchases.find((p) => p.id === emergencyFundId);
    if (purchase) {
      emergencyFund = purchase.currentSavings || 0;
    }
  } else {
    // Try to find any savings goal named "Emergency" or "Rainy Day"
    const emergencyGoal = futurePurchases.find(
      (p) =>
        p.name.toLowerCase().includes("emergency") ||
        p.name.toLowerCase().includes("rainy day") ||
        p.name.toLowerCase().includes("savings")
    );
    if (emergencyGoal) {
      emergencyFund = emergencyGoal.currentSavings || 0;
    }
  }

  const monthsCovered = emergencyFund / monthlyExpenses;

  // Score: 0 months = 0, 3 months = 10, 6+ months = 15
  let score: number;
  if (monthsCovered <= 0) {
    score = 0;
  } else if (monthsCovered >= 6) {
    score = 15;
  } else if (monthsCovered >= 3) {
    score = lerp(monthsCovered, 3, 6, 10, 15);
  } else {
    score = lerp(monthsCovered, 0, 3, 0, 10);
  }

  let improvementTip: string | undefined;
  if (monthsCovered < 3) {
    const targetFund = monthlyExpenses * 3;
    const needed = targetFund - emergencyFund;
    improvementTip = `Save $${needed.toFixed(0)} more to reach 3 months of expenses`;
  } else if (monthsCovered < 6) {
    const targetFund = monthlyExpenses * 6;
    const needed = targetFund - emergencyFund;
    improvementTip = `Save $${needed.toFixed(0)} more to reach 6 months of expenses`;
  }

  return {
    type: "emergencyFund",
    score: Math.round(score * 10) / 10,
    maxScore: FACTOR_WEIGHTS.emergencyFund,
    percentage: (score / FACTOR_WEIGHTS.emergencyFund) * 100,
    value: monthsCovered,
    description: `${monthsCovered.toFixed(1)} months of expenses saved`,
    improvementTip,
  };
}

/**
 * H-014: Calculate Investment Growth Factor
 * Investment returns (estimated from investment category transactions)
 * Scoring: Negative = 0, 0-5% = 5, 5-10% = 10, 10%+ = 15
 */
export function calculateInvestmentGrowthFactor(
  transactions: Transaction[],
  monthsBack: number = 12
): FactorResult | null {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

  // Find investment transactions
  const investmentCategories = ["Investment", "Stocks", "Retirement", "401k", "IRA", "Brokerage"];

  const investmentTx = transactions.filter((tx) => {
    if (new Date(tx.date) < startDate) return false;
    const category = tx.category?.toLowerCase() || "";
    return investmentCategories.some((ic) => category.includes(ic.toLowerCase()));
  });

  if (investmentTx.length === 0) {
    // No investment data - return null to skip this factor
    return null;
  }

  // Estimate growth (contributions vs current value would need account data)
  // For now, use a simplified approach based on income designation
  const contributions = investmentTx
    .filter((tx) => tx.amount < 0) // Money going out to investments
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const returns = investmentTx
    .filter((tx) => tx.amount > 0) // Dividends, gains
    .reduce((sum, tx) => sum + tx.amount, 0);

  if (contributions === 0) {
    return null;
  }

  const growthRate = ((returns - contributions) / contributions) * 100;

  // Score: Negative = 0, 0-5% = 5, 5-10% = 10, 10%+ = 15
  let score: number;
  if (growthRate <= 0) {
    score = 0;
  } else if (growthRate >= 10) {
    score = 15;
  } else if (growthRate >= 5) {
    score = lerp(growthRate, 5, 10, 10, 15);
  } else {
    score = lerp(growthRate, 0, 5, 0, 5);
  }

  let improvementTip: string | undefined;
  if (growthRate < 5) {
    improvementTip = "Consider diversifying investments or reviewing asset allocation";
  }

  return {
    type: "investmentGrowth",
    score: Math.round(score * 10) / 10,
    maxScore: FACTOR_WEIGHTS.investmentGrowth,
    percentage: (score / FACTOR_WEIGHTS.investmentGrowth) * 100,
    value: growthRate,
    description: `${growthRate.toFixed(1)}% investment growth`,
    improvementTip,
  };
}

/**
 * H-015: Calculate Expense Stability Factor
 * Month-to-month variance in expenses
 * Scoring: High variance (>30%) = 0, Medium (15-30%) = 5, Low (<15%) = 10
 */
export function calculateExpenseStabilityFactor(
  transactions: Transaction[],
  monthsBack: number = 6
): FactorResult | null {
  const now = new Date();
  const monthlyExpenses: number[] = [];

  for (let i = 0; i < monthsBack; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthExpense = transactions
      .filter((tx) => {
        if (tx.amount >= 0) return false;
        const txDate = new Date(tx.date);
        return txDate >= monthStart && txDate <= monthEnd;
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    if (monthExpense > 0) {
      monthlyExpenses.push(monthExpense);
    }
  }

  if (monthlyExpenses.length < 2) return null;

  // Calculate coefficient of variation (CV)
  const mean = monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length;
  const variance =
    monthlyExpenses.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / monthlyExpenses.length;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / mean) * 100; // Coefficient of variation as percentage

  // Score: >30% CV = 0, 15-30% = 5, <15% = 10
  let score: number;
  if (cv >= 30) {
    score = 0;
  } else if (cv <= 15) {
    score = 10;
  } else {
    score = lerp(cv, 15, 30, 10, 0);
  }

  let stabilityLabel: string;
  if (cv < 15) {
    stabilityLabel = "Low";
  } else if (cv < 30) {
    stabilityLabel = "Medium";
  } else {
    stabilityLabel = "High";
  }

  let improvementTip: string | undefined;
  if (cv >= 30) {
    improvementTip =
      "High expense variance detected. Try to smooth out irregular expenses with budgeting.";
  } else if (cv >= 15) {
    improvementTip = "Consider automating regular expenses to improve stability.";
  }

  return {
    type: "expenseStability",
    score: Math.round(score * 10) / 10,
    maxScore: FACTOR_WEIGHTS.expenseStability,
    percentage: (score / FACTOR_WEIGHTS.expenseStability) * 100,
    value: cv,
    description: `${stabilityLabel} expense variance (${cv.toFixed(1)}% month-to-month)`,
    improvementTip,
  };
}

/**
 * H-016: Calculate Composite Health Score
 */
export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  const { transactions, budgets, futurePurchases, emergencyFundId, monthsToAnalyze = 3 } = input;

  const factors: FactorResult[] = [];
  const missingFactors: FactorType[] = [];

  // Calculate each factor
  const savingsRate = calculateSavingsRateFactor(transactions, monthsToAnalyze);
  if (savingsRate) factors.push(savingsRate);
  else missingFactors.push("savingsRate");

  const debtToIncome = calculateDebtToIncomeFactor(transactions, monthsToAnalyze);
  if (debtToIncome) factors.push(debtToIncome);
  else missingFactors.push("debtToIncome");

  const budgetAdherence = calculateBudgetAdherenceFactor(transactions, budgets);
  if (budgetAdherence) factors.push(budgetAdherence);
  else missingFactors.push("budgetAdherence");

  const emergencyFund = calculateEmergencyFundFactor(
    transactions,
    futurePurchases,
    emergencyFundId
  );
  if (emergencyFund) factors.push(emergencyFund);
  else missingFactors.push("emergencyFund");

  const investmentGrowth = calculateInvestmentGrowthFactor(transactions, 12);
  if (investmentGrowth) factors.push(investmentGrowth);
  else missingFactors.push("investmentGrowth");

  const expenseStability = calculateExpenseStabilityFactor(transactions, 6);
  if (expenseStability) factors.push(expenseStability);
  else missingFactors.push("expenseStability");

  // Calculate scores
  const score = factors.reduce((sum, f) => sum + f.score, 0);
  const maxPossibleScore = factors.reduce((sum, f) => sum + f.maxScore, 0);

  // Normalize to 0-100 scale
  const normalizedScore = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;

  // Determine grade
  let grade: "A" | "B" | "C" | "D" | "F";
  if (normalizedScore >= 90) grade = "A";
  else if (normalizedScore >= 80) grade = "B";
  else if (normalizedScore >= 70) grade = "C";
  else if (normalizedScore >= 60) grade = "D";
  else grade = "F";

  // Find top recommendation (lowest scoring factor with improvement tip)
  const sortedFactors = [...factors].sort((a, b) => a.percentage - b.percentage);
  const topRecommendation = sortedFactors.find((f) => f.improvementTip)?.improvementTip;

  return {
    score: Math.round(score * 10) / 10,
    maxPossibleScore,
    normalizedScore: Math.round(normalizedScore * 10) / 10,
    grade,
    factors,
    calculatedAt: new Date(),
    missingFactors,
    topRecommendation,
  };
}

/**
 * Get factor breakdown for display
 */
export function getFactorBreakdown(result: HealthScoreResult): {
  factor: FactorType;
  label: string;
  score: number;
  maxScore: number;
  color: string;
  icon: string;
}[] {
  const factorLabels: Record<FactorType, { label: string; icon: string }> = {
    savingsRate: { label: "Savings Rate", icon: "piggy-bank" },
    debtToIncome: { label: "Debt-to-Income", icon: "credit-card" },
    budgetAdherence: { label: "Budget Adherence", icon: "target" },
    emergencyFund: { label: "Emergency Fund", icon: "shield" },
    investmentGrowth: { label: "Investment Growth", icon: "trending-up" },
    expenseStability: { label: "Expense Stability", icon: "bar-chart" },
  };

  const getColor = (percentage: number): string => {
    if (percentage >= 80) return "#22c55e"; // green
    if (percentage >= 60) return "#eab308"; // yellow
    if (percentage >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  return result.factors.map((f) => ({
    factor: f.type,
    label: factorLabels[f.type].label,
    score: f.score,
    maxScore: f.maxScore,
    color: getColor(f.percentage),
    icon: factorLabels[f.type].icon,
  }));
}

/**
 * Get historical scores (stub for future implementation)
 * Will be stored in IndexedDB for trend analysis
 */
export async function getHistoricalScores(monthsBack: number = 12): Promise<HistoricalScore[]> {
  // TODO: Implement storage and retrieval of historical scores
  // For now, return empty array
  return [];
}

/**
 * Save current score to history
 */
export async function saveHealthScoreToHistory(result: HealthScoreResult): Promise<void> {
  // TODO: Implement storage of health scores
  // Will use IndexedDB to store monthly snapshots
}

/**
 * Get grade color
 */
export function getGradeColor(grade: "A" | "B" | "C" | "D" | "F"): string {
  switch (grade) {
    case "A":
      return "#22c55e"; // green
    case "B":
      return "#84cc16"; // lime
    case "C":
      return "#eab308"; // yellow
    case "D":
      return "#f97316"; // orange
    case "F":
      return "#ef4444"; // red
  }
}

/**
 * Get score interpretation text
 */
export function getScoreInterpretation(score: number): string {
  if (score >= 90) return "Excellent financial health";
  if (score >= 80) return "Good financial health";
  if (score >= 70) return "Fair financial health";
  if (score >= 60) return "Needs improvement";
  return "Significant improvement needed";
}
