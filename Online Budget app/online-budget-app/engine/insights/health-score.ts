/**
 * Financial health score — composite score from multiple indicators.
 *
 * Pure function — no DB, no AI, no side effects.
 * Formula-based, not AI-derived.
 */

export interface HealthScoreInput {
  /** Savings rate as percentage (e.g. 20 for 20%). Can be negative. */
  readonly savingsRatePercent: number;
  /** Budget adherence as percentage (0-100). How well user stays within budgets. */
  readonly budgetAdherencePercent: number;
  /** Whether user has emergency fund coverage. */
  readonly hasEmergencyFund: boolean;
  /** Debt-to-income ratio as percentage (e.g. 30 for 30%). */
  readonly debtToIncomePercent: number;
}

export interface HealthScoreComponents {
  readonly savingsScore: number;
  readonly budgetScore: number;
  readonly emergencyFundScore: number;
  readonly debtScore: number;
}

export interface HealthScoreResult {
  /** Overall score 0-100. */
  readonly score: number;
  /** Letter grade: A (80+), B (60-79), C (40-59), D (20-39), F (<20). */
  readonly grade: "A" | "B" | "C" | "D" | "F";
  /** Individual component scores for transparency. */
  readonly components: HealthScoreComponents;
}

// Weights sum to 1.0
const WEIGHT_SAVINGS = 0.30;
const WEIGHT_BUDGET = 0.25;
const WEIGHT_EMERGENCY = 0.20;
const WEIGHT_DEBT = 0.25;

export function computeFinancialHealthScore(
  input: HealthScoreInput
): HealthScoreResult {
  // Savings score: 0% → 0, 20%+ → 100, linear between
  const savingsScore = clamp(input.savingsRatePercent / 20 * 100, 0, 100);

  // Budget adherence score: direct mapping (already 0-100)
  const budgetScore = clamp(input.budgetAdherencePercent, 0, 100);

  // Emergency fund: binary 0 or 100
  const emergencyFundScore = input.hasEmergencyFund ? 100 : 0;

  // Debt score: 0% → 100, 50%+ → 0, linear between
  const debtScore = clamp((1 - input.debtToIncomePercent / 50) * 100, 0, 100);

  const rawScore =
    savingsScore * WEIGHT_SAVINGS +
    budgetScore * WEIGHT_BUDGET +
    emergencyFundScore * WEIGHT_EMERGENCY +
    debtScore * WEIGHT_DEBT;

  const score = Math.round(clamp(rawScore, 0, 100));

  return {
    score,
    grade: scoreToGrade(score),
    components: {
      savingsScore: Math.round(savingsScore),
      budgetScore: Math.round(budgetScore),
      emergencyFundScore,
      debtScore: Math.round(debtScore),
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreToGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}
