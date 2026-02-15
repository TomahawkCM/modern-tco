/**
 * Expense Splitting Engine
 *
 * A Splitwise-style calculation module for splitting expenses with named people
 * and tracking running balances. Pure functions — no database access.
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface SplitPerson {
  id: string;
  name: string;
  emoji?: string;
  createdAt: Date;
}

export interface ExpenseSplit {
  id: string;
  transactionId: string;
  personId: string;
  /** Amount this person owes. Positive = they owe you, negative = you owe them. */
  amount: number;
  settled: boolean;
  settledDate?: Date;
  /** Settlement method, e.g. "cash", "e-transfer", "venmo". */
  settledMethod?: string;
  createdAt: Date;
}

export type SplitMode = 'equal' | 'custom' | 'percentage';

export interface SplitPreview {
  personId: string;
  personName: string;
  amount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Round a number to two decimal places using banker-friendly rounding.
 */
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

// ---------------------------------------------------------------------------
// Split Calculators
// ---------------------------------------------------------------------------

/**
 * Divide `totalAmount` equally among `personCount` people.
 *
 * Handles penny-rounding by giving the remainder to the last person so the
 * individual amounts always sum to exactly `totalAmount`.
 *
 * @param totalAmount - The total expense to split.
 * @param personCount - Number of people sharing the expense (must be >= 1).
 * @returns An array of length `personCount` with each person's share.
 *
 * @example
 * ```ts
 * calculateEqualSplit(10, 3); // [3.33, 3.33, 3.34]
 * ```
 */
export function calculateEqualSplit(
  totalAmount: number,
  personCount: number,
): number[] {
  if (personCount < 1) {
    throw new Error('personCount must be at least 1');
  }

  const baseShare = roundToCents(totalAmount / personCount);
  const shares = Array.from<number>({ length: personCount }).fill(baseShare);

  // Adjust the last person's share so the total is exact.
  const sumWithoutLast = roundToCents(baseShare * (personCount - 1));
  shares[personCount - 1] = roundToCents(totalAmount - sumWithoutLast);

  return shares;
}

/**
 * Split `totalAmount` according to the provided percentages.
 *
 * The `percentages` array must sum to 100. Each element represents one
 * person's share as a percentage of the total.
 *
 * Rounding residuals are assigned to the last person so the amounts always
 * sum to exactly `totalAmount`.
 *
 * @param totalAmount  - The total expense to split.
 * @param percentages  - Per-person percentages (must sum to 100).
 * @returns An array of monetary amounts matching the length of `percentages`.
 *
 * @example
 * ```ts
 * calculatePercentageSplit(100, [50, 30, 20]); // [50, 30, 20]
 * ```
 */
export function calculatePercentageSplit(
  totalAmount: number,
  percentages: number[],
): number[] {
  if (percentages.length === 0) {
    throw new Error('percentages array must not be empty');
  }

  const sum = roundToCents(percentages.reduce((a, b) => a + b, 0));
  if (Math.abs(sum - 100) > 0.01) {
    throw new Error(
      `Percentages must sum to 100, but got ${sum}`,
    );
  }

  const shares = percentages.map((pct) => roundToCents((totalAmount * pct) / 100));

  // Adjust the last share to absorb any rounding residual.
  const sumWithoutLast = shares
    .slice(0, -1)
    .reduce((a, b) => roundToCents(a + b), 0);
  shares[shares.length - 1] = roundToCents(totalAmount - sumWithoutLast);

  return shares;
}

/**
 * Preview how an expense will be split among the given people.
 *
 * Supports three modes:
 * - **equal** — divides equally (penny remainder goes to the last person).
 * - **custom** — uses the caller-provided `customAmounts` directly.
 * - **percentage** — splits by the caller-provided `percentages`.
 *
 * @param totalAmount   - The total expense amount.
 * @param people        - The people participating in the split.
 * @param mode          - The split strategy.
 * @param customAmounts - Required when `mode` is `'custom'`.
 * @param percentages   - Required when `mode` is `'percentage'`.
 * @returns An array of {@link SplitPreview} objects, one per person.
 *
 * @example
 * ```ts
 * const people: SplitPerson[] = [
 *   { id: '1', name: 'Alice', createdAt: new Date() },
 *   { id: '2', name: 'Bob',   createdAt: new Date() },
 * ];
 * previewSplit(20, people, 'equal');
 * // [{ personId: '1', personName: 'Alice', amount: 10 },
 * //  { personId: '2', personName: 'Bob',   amount: 10 }]
 * ```
 */
export function previewSplit(
  totalAmount: number,
  people: SplitPerson[],
  mode: SplitMode,
  customAmounts?: number[],
  percentages?: number[],
): SplitPreview[] {
  if (people.length === 0) {
    throw new Error('people array must not be empty');
  }

  let amounts: number[];

  switch (mode) {
    case 'equal':
      amounts = calculateEqualSplit(totalAmount, people.length);
      break;

    case 'custom':
      if (!customAmounts || customAmounts.length !== people.length) {
        throw new Error(
          'customAmounts must be provided and match the number of people',
        );
      }
      amounts = customAmounts.map(roundToCents);
      break;

    case 'percentage':
      if (!percentages || percentages.length !== people.length) {
        throw new Error(
          'percentages must be provided and match the number of people',
        );
      }
      amounts = calculatePercentageSplit(totalAmount, percentages);
      break;
  }

  return people.map((person, index) => ({
    personId: person.id,
    personName: person.name,
    amount: amounts[index],
  }));
}

// ---------------------------------------------------------------------------
// Balance Tracking
// ---------------------------------------------------------------------------

/**
 * Calculate the running balance for a single person across all their unsettled
 * splits.
 *
 * - Positive result means the person owes you money.
 * - Negative result means you owe them money.
 *
 * Settled splits are excluded from the calculation.
 *
 * @param splits   - The full list of expense splits to consider.
 * @param personId - The person whose balance to compute.
 * @returns The net unsettled balance for the given person.
 */
export function calculateRunningBalance(
  splits: ExpenseSplit[],
  personId: string,
): number {
  return roundToCents(
    splits
      .filter((s) => s.personId === personId && !s.settled)
      .reduce((sum, s) => sum + s.amount, 0),
  );
}

/**
 * Produce a per-person balance summary sorted by absolute balance (highest
 * first).
 *
 * Each entry includes:
 * - `personId` / `personName` — identifying fields.
 * - `balance` — net unsettled amount (positive = they owe you).
 * - `splitCount` — number of unsettled splits contributing to the balance.
 *
 * @param splits - All expense splits to consider.
 * @param people - The people to include in the summary.
 * @returns A sorted array of balance summaries.
 */
export function getBalanceSummary(
  splits: ExpenseSplit[],
  people: SplitPerson[],
): { personId: string; personName: string; balance: number; splitCount: number }[] {
  return people
    .map((person) => {
      const personSplits = splits.filter(
        (s) => s.personId === person.id && !s.settled,
      );

      return {
        personId: person.id,
        personName: person.name,
        balance: roundToCents(
          personSplits.reduce((sum, s) => sum + s.amount, 0),
        ),
        splitCount: personSplits.length,
      };
    })
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
}
