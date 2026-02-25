/**
 * Assumptions Manager
 *
 * Manages default and user-customized financial assumptions.
 * Persists to localStorage for offline access.
 */

import type { AssumptionSet } from "./types";

const STORAGE_KEY = "financial-engine-assumptions";

/** Default assumptions based on historical US averages */
export const DEFAULT_ASSUMPTIONS: AssumptionSet = {
  id: "default",
  name: "Default (US Historical Averages)",
  inflationRate: 3.0,
  preRetirementReturn: 7.0,
  postRetirementReturn: 5.0,
  safeWithdrawalRate: 4.0,
  socialSecurityAge: 67,
  socialSecurityMonthly: 1900,
  lifeExpectancy: 85,
  taxRate: 22,
  updatedAt: Date.now(),
};

/** Conservative assumptions */
export const CONSERVATIVE_ASSUMPTIONS: AssumptionSet = {
  id: "conservative",
  name: "Conservative",
  inflationRate: 3.5,
  preRetirementReturn: 5.0,
  postRetirementReturn: 3.5,
  safeWithdrawalRate: 3.5,
  socialSecurityAge: 67,
  socialSecurityMonthly: 1500,
  lifeExpectancy: 90,
  taxRate: 24,
  updatedAt: Date.now(),
};

/** Aggressive assumptions */
export const AGGRESSIVE_ASSUMPTIONS: AssumptionSet = {
  id: "aggressive",
  name: "Aggressive",
  inflationRate: 2.5,
  preRetirementReturn: 9.0,
  postRetirementReturn: 6.5,
  safeWithdrawalRate: 4.5,
  socialSecurityAge: 67,
  socialSecurityMonthly: 2200,
  lifeExpectancy: 82,
  taxRate: 22,
  updatedAt: Date.now(),
};

/**
 * Load assumptions from localStorage.
 * Returns default if not found or parsing fails.
 */
export function loadAssumptions(): AssumptionSet {
  if (typeof window === "undefined") return DEFAULT_ASSUMPTIONS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_ASSUMPTIONS;

    const parsed = JSON.parse(stored) as AssumptionSet;
    // Validate required fields exist
    if (
      typeof parsed.inflationRate !== "number" ||
      typeof parsed.preRetirementReturn !== "number"
    ) {
      return DEFAULT_ASSUMPTIONS;
    }
    return parsed;
  } catch {
    return DEFAULT_ASSUMPTIONS;
  }
}

/**
 * Save assumptions to localStorage.
 */
export function saveAssumptions(assumptions: AssumptionSet): void {
  if (typeof window === "undefined") return;

  try {
    const toSave: AssumptionSet = {
      ...assumptions,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/**
 * Reset assumptions to defaults.
 */
export function resetAssumptions(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

/** Get all preset assumption sets */
export function getPresetAssumptions(): AssumptionSet[] {
  return [DEFAULT_ASSUMPTIONS, CONSERVATIVE_ASSUMPTIONS, AGGRESSIVE_ASSUMPTIONS];
}
