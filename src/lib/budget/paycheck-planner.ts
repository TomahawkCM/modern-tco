/**
 * Paycheck Planning Engine
 *
 * Manages paycheck schedules, date generation, and per-paycheck
 * budget allocation. Supports weekly, biweekly, semimonthly,
 * monthly, and irregular pay frequencies.
 */

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/** Supported paycheck frequency schedules */
export type PaycheckSchedule = "weekly" | "biweekly" | "semimonthly" | "monthly" | "irregular";

/** A single allocation of funds from a paycheck to a budget category */
export interface PaycheckAllocation {
  categoryId: string;
  amount: number;
}

/** A single expected paycheck within a plan */
export interface Paycheck {
  id: string;
  /** Display label, e.g. "Paycheck 1" or a custom name */
  label: string;
  /** ISO 8601 date string (YYYY-MM-DD) */
  expectedDate: string;
  expectedAmount: number;
  currency: string;
  allocations: PaycheckAllocation[];
}

/** Top-level paycheck plan containing schedule metadata and paychecks */
export interface PaycheckPlan {
  id: string;
  schedule: PaycheckSchedule;
  paychecks: Paycheck[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a Date as an ISO date string (YYYY-MM-DD).
 */
function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Add a given number of days to a Date, returning a new Date.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add a given number of months to a Date, clamping the day to the
 * last valid day of the target month when necessary.
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);

  // If the day overflowed (e.g. Jan 31 + 1 month -> Mar 3), clamp to
  // the last day of the intended target month.
  const expectedMonth = (((date.getMonth() + months) % 12) + 12) % 12;
  if (result.getMonth() !== expectedMonth) {
    result.setDate(0); // sets to last day of the previous month
  }

  return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a sequence of paycheck dates based on a schedule.
 *
 * - **weekly**: every 7 days from `startDate`
 * - **biweekly**: every 14 days from `startDate`
 * - **semimonthly**: the 1st and 15th of each month, starting from
 *   the next applicable date on or after `startDate`
 * - **monthly**: the same day-of-month as `startDate` each month
 * - **irregular**: returns an empty array (user adds dates manually)
 *
 * @param schedule  The paycheck frequency
 * @param startDate The anchor date for generation
 * @param count     How many dates to generate
 * @returns An array of ISO date strings (YYYY-MM-DD)
 */
export function generatePaycheckDates(
  schedule: PaycheckSchedule,
  startDate: Date,
  count: number
): string[] {
  if (count <= 0) return [];

  switch (schedule) {
    case "weekly":
      return generateFixedInterval(startDate, 7, count);

    case "biweekly":
      return generateFixedInterval(startDate, 14, count);

    case "semimonthly":
      return generateSemimonthly(startDate, count);

    case "monthly":
      return generateMonthly(startDate, count);

    case "irregular":
      return [];
  }
}

/**
 * Find the active paycheck for a given date.
 *
 * The "active" paycheck is the one whose `expectedDate` is closest to
 * (but on or before) the reference date. Returns `null` when no
 * paycheck qualifies.
 *
 * @param plan The paycheck plan to search
 * @param date Reference date; defaults to the current date
 * @returns The matching Paycheck, or null
 */
export function getActivePaycheck(plan: PaycheckPlan, date?: Date): Paycheck | null {
  const refDate = date ?? new Date();
  const refString = toISODateString(refDate);

  let best: Paycheck | null = null;
  let bestDate = "";

  for (const paycheck of plan.paychecks) {
    if (paycheck.expectedDate <= refString) {
      if (best === null || paycheck.expectedDate > bestDate) {
        best = paycheck;
        bestDate = paycheck.expectedDate;
      }
    }
  }

  return best;
}

/**
 * Calculate the total amount allocated across all categories for a paycheck.
 *
 * @param paycheck The paycheck to inspect
 * @returns The sum of all allocation amounts
 */
export function getAllocatedTotal(paycheck: Paycheck): number {
  return paycheck.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
}

/**
 * Calculate how much of a paycheck remains unallocated.
 *
 * @param paycheck The paycheck to inspect
 * @returns `expectedAmount - allocatedTotal`
 */
export function getUnallocatedAmount(paycheck: Paycheck): number {
  return paycheck.expectedAmount - getAllocatedTotal(paycheck);
}

/**
 * Calculate the safe-to-spend amount for a paycheck.
 *
 * This is the portion of the expected amount that has not yet been
 * allocated to any budget category.
 *
 * @param paycheck The paycheck to inspect
 * @returns `expectedAmount - sum(allocations.amount)`
 */
export function getPaycheckSafeToSpend(paycheck: Paycheck): number {
  return paycheck.expectedAmount - getAllocatedTotal(paycheck);
}

// ---------------------------------------------------------------------------
// Internal generators
// ---------------------------------------------------------------------------

/**
 * Generate dates at a fixed day interval (used for weekly and biweekly).
 */
function generateFixedInterval(startDate: Date, intervalDays: number, count: number): string[] {
  const dates: string[] = [];
  let current = new Date(startDate);

  for (let i = 0; i < count; i++) {
    dates.push(toISODateString(current));
    current = addDays(current, intervalDays);
  }

  return dates;
}

/**
 * Generate semimonthly dates (1st and 15th of each month).
 *
 * Starting from the next applicable semimonthly date on or after `startDate`,
 * alternates between the 1st and the 15th.
 */
function generateSemimonthly(startDate: Date, count: number): string[] {
  const dates: string[] = [];
  let year = startDate.getFullYear();
  let month = startDate.getMonth();
  const startDay = startDate.getDate();

  // Determine the first applicable semimonthly date on or after startDate
  let nextDay: 1 | 15;
  if (startDay <= 1) {
    nextDay = 1;
  } else if (startDay <= 15) {
    nextDay = 15;
  } else {
    // Move to the 1st of the next month
    nextDay = 1;
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  while (dates.length < count) {
    dates.push(toISODateString(new Date(year, month, nextDay)));

    if (nextDay === 1) {
      nextDay = 15;
    } else {
      nextDay = 1;
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
  }

  return dates;
}

/**
 * Generate monthly dates on the same day-of-month as `startDate`.
 *
 * When the target month has fewer days than `startDate.getDate()`,
 * the date is clamped to the last day of that month.
 */
function generateMonthly(startDate: Date, count: number): string[] {
  const dates: string[] = [];

  for (let i = 0; i < count; i++) {
    const target = addMonths(startDate, i);
    dates.push(toISODateString(target));
  }

  return dates;
}
