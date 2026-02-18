/**
 * Debt Scenario CRUD Operations
 *
 * Save, load, delete, and recompute debt payoff scenarios
 */

import { db } from "@/lib/budget-db";
import type { DebtScenario, Loan } from "@/types/budget";
import { loansToDebtAccounts, calculateSingleStrategy } from "./debt-payoff";

/**
 * Save a new scenario or update an existing one
 */
export async function saveScenario(
  scenario: Omit<DebtScenario, "id" | "createdAt" | "updatedAt">
): Promise<number> {
  const now = new Date();
  const id = await db.debtScenarios.add({
    ...scenario,
    createdAt: now,
    updatedAt: now,
  } as DebtScenario);
  return id as number;
}

/**
 * Get all saved scenarios, sorted by creation date descending
 */
export async function getScenarios(): Promise<DebtScenario[]> {
  return db.debtScenarios.orderBy("createdAt").reverse().toArray();
}

/**
 * Delete a scenario by ID
 */
export async function deleteScenario(id: number): Promise<void> {
  await db.debtScenarios.delete(id);
}

/**
 * Recompute all saved scenarios against current loan data.
 * Updates cached results and returns the refreshed list.
 */
export async function recomputeScenarios(loans: Loan[]): Promise<DebtScenario[]> {
  const debts = loansToDebtAccounts(loans);
  const scenarios = await getScenarios();

  if (debts.length === 0) return scenarios;

  for (const scenario of scenarios) {
    const result = calculateSingleStrategy(
      debts,
      scenario.extraMonthlyPayment,
      scenario.strategy as import("./types").DebtStrategy,
      scenario.customOrder,
      scenario.oneTimePayments
    );

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + result.totalMonths);

    const totalPaid = result.schedule.reduce((sum, m) => sum + m.totalPayment, 0);

    await db.debtScenarios.update(scenario.id, {
      totalMonths: result.totalMonths,
      totalInterest: result.totalInterest,
      totalPaid,
      debtFreeDate: payoffDate.toISOString(),
      updatedAt: new Date(),
    });

    // Update in-memory too
    scenario.totalMonths = result.totalMonths;
    scenario.totalInterest = result.totalInterest;
    scenario.totalPaid = totalPaid;
    scenario.debtFreeDate = payoffDate.toISOString();
  }

  return scenarios;
}
