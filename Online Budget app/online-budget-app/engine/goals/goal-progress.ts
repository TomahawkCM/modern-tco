/**
 * Goal progress computation.
 *
 * Pure function — no DB, no AI, no side effects.
 * Today is injected as a parameter for determinism.
 */

/**
 * Input for goal progress computation.
 */
export interface GoalInput {
  readonly targetMinor: number;
  readonly savedMinor: number;
  readonly monthlySavingsMinor: number;
  readonly deadline: string | null;
}

/**
 * Computed goal progress.
 */
export interface GoalProgressResult {
  readonly percentComplete: number;
  readonly remainingMinor: number;
  readonly isComplete: boolean;
  /** ISO date string (YYYY-MM-DD) or null if cannot estimate. */
  readonly estimatedCompletionDate: string | null;
  /** True if estimated completion is before deadline (or no deadline). */
  readonly onTrack: boolean;
}

/**
 * Compute progress toward a savings goal.
 *
 * @param goal  Goal parameters
 * @param today Current date (injected for determinism)
 */
export function computeGoalProgress(
  goal: GoalInput,
  today: Date
): GoalProgressResult {
  // Zero target is trivially complete
  if (goal.targetMinor <= 0) {
    return {
      percentComplete: 100,
      remainingMinor: 0,
      isComplete: true,
      estimatedCompletionDate: formatDate(today),
      onTrack: true,
    };
  }

  const percentComplete = (goal.savedMinor / goal.targetMinor) * 100;
  const remaining = Math.max(0, goal.targetMinor - goal.savedMinor);
  const isComplete = goal.savedMinor >= goal.targetMinor;

  // Estimate completion date
  let estimatedCompletionDate: string | null = null;
  if (isComplete) {
    estimatedCompletionDate = formatDate(today);
  } else if (goal.monthlySavingsMinor > 0) {
    const monthsRemaining = remaining / goal.monthlySavingsMinor;
    const wholeMonths = Math.ceil(monthsRemaining);
    const estimated = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth() + wholeMonths,
      today.getUTCDate()
    ));
    estimatedCompletionDate = formatDate(estimated);
  }

  // On-track determination
  let onTrack: boolean;
  if (isComplete) {
    onTrack = true;
  } else if (goal.monthlySavingsMinor <= 0) {
    onTrack = false;
  } else if (goal.deadline === null) {
    onTrack = true;
  } else {
    onTrack = estimatedCompletionDate !== null &&
      estimatedCompletionDate <= goal.deadline;
  }

  return {
    percentComplete,
    remainingMinor: remaining,
    isComplete,
    estimatedCompletionDate,
    onTrack,
  };
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
