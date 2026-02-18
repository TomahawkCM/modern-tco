/**
 * What-If Scenario Engine
 *
 * Calculates before/after impact of financial changes.
 * Pure functions — no database access needed (state passed in).
 */

import type { ScenarioInput, FinancialState, ScenarioResult } from "./scenario-types";
import { roundToCents, multiplyAmount, divideAmount } from "@/lib/money";

/**
 * Run a what-if scenario and return before/after comparison.
 */
export function runScenario(input: ScenarioInput, currentState: FinancialState): ScenarioResult {
  const after = { ...currentState };
  let description = "";

  switch (input.type) {
    case "cancel_subscription": {
      const amount = input.subscriptionAmount ?? 0;
      after.monthlyExpenses -= amount;
      after.monthlySavings += amount;
      after.savingsRate =
        after.monthlyIncome > 0 ? divideAmount(after.monthlySavings * 100, after.monthlyIncome) : 0;
      description = `Cancelling this subscription saves $${roundToCents(amount).toFixed(2)}/month ($${multiplyAmount(amount, 12).toFixed(2)}/year)`;
      break;
    }

    case "change_income": {
      const newIncome = input.newMonthlyIncome ?? currentState.monthlyIncome;
      const incomeDelta = newIncome - currentState.monthlyIncome;
      after.monthlyIncome = newIncome;
      after.monthlySavings += incomeDelta;
      after.savingsRate =
        after.monthlyIncome > 0 ? divideAmount(after.monthlySavings * 100, after.monthlyIncome) : 0;
      description =
        incomeDelta >= 0
          ? `Income increase of $${roundToCents(incomeDelta).toFixed(2)}/month adds $${multiplyAmount(incomeDelta, 12).toFixed(2)}/year to savings`
          : `Income decrease of $${roundToCents(Math.abs(incomeDelta)).toFixed(2)}/month reduces savings by $${multiplyAmount(Math.abs(incomeDelta), 12).toFixed(2)}/year`;
      break;
    }

    case "add_expense": {
      const expense = input.newExpenseAmount ?? 0;
      after.monthlyExpenses += expense;
      after.monthlySavings -= expense;
      after.savingsRate =
        after.monthlyIncome > 0 ? divideAmount(after.monthlySavings * 100, after.monthlyIncome) : 0;
      description = `New expense of $${roundToCents(expense).toFixed(2)}/month reduces annual savings by $${multiplyAmount(expense, 12).toFixed(2)}`;
      break;
    }

    case "pay_off_debt": {
      const extra = input.extraDebtPayment ?? 0;
      after.monthlyDebtPayment += extra;
      after.monthlySavings -= extra;
      after.savingsRate =
        after.monthlyIncome > 0 ? divideAmount(after.monthlySavings * 100, after.monthlyIncome) : 0;

      // Estimate new debt-free date
      if (after.totalDebt > 0 && after.monthlyDebtPayment > 0) {
        const monthsToPayoff = Math.ceil(after.totalDebt / after.monthlyDebtPayment);
        const newDebtFreeDate = new Date();
        newDebtFreeDate.setMonth(newDebtFreeDate.getMonth() + monthsToPayoff);
        after.debtFreeDate = newDebtFreeDate;
      }

      description = `Extra $${roundToCents(extra).toFixed(2)}/month toward debt${after.debtFreeDate ? ` — debt-free by ${after.debtFreeDate.toLocaleDateString()}` : ""}`;
      break;
    }

    case "increase_savings_rate": {
      const newRate = input.newSavingsRate ?? currentState.savingsRate;
      const targetSavings = (newRate / 100) * after.monthlyIncome;
      const savingsDelta = targetSavings - currentState.monthlySavings;
      after.monthlySavings = targetSavings;
      after.monthlyExpenses -= savingsDelta;
      after.savingsRate = newRate;
      description = `Increasing savings rate to ${newRate.toFixed(1)}% saves an extra $${multiplyAmount(savingsDelta, 12).toFixed(2)}/year`;
      break;
    }
  }

  // Recalculate health score (simplified: 0-100 based on savings rate and debt ratio)
  after.healthScore = calculateSimpleHealthScore(after);

  const monthlyCashFlowChange = after.monthlySavings - currentState.monthlySavings;
  const annualSavingsChange = multiplyAmount(monthlyCashFlowChange, 12);
  const healthScoreDelta = after.healthScore - currentState.healthScore;

  let debtFreeDateChange: number | undefined;
  if (currentState.debtFreeDate && after.debtFreeDate) {
    debtFreeDateChange = Math.round(
      (currentState.debtFreeDate.getTime() - after.debtFreeDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    before: currentState,
    after,
    impact: {
      monthlyCashFlowChange: roundToCents(monthlyCashFlowChange),
      annualSavingsChange: roundToCents(annualSavingsChange),
      healthScoreDelta: Math.round(healthScoreDelta),
      debtFreeDateChange,
      description,
    },
  };
}

/**
 * Simple health score calculation (0-100).
 * Factors: savings rate (40%), expense ratio (30%), debt burden (30%).
 */
function calculateSimpleHealthScore(state: FinancialState): number {
  // Savings rate component (0-40 points)
  const savingsScore = Math.min(40, (state.savingsRate / 30) * 40);

  // Expense ratio component (0-30 points) — lower expense ratio = better
  const expenseRatio = state.monthlyIncome > 0 ? state.monthlyExpenses / state.monthlyIncome : 1;
  const expenseScore = Math.max(0, 30 * (1 - expenseRatio));

  // Debt burden component (0-30 points) — lower debt-to-income = better
  const debtToIncome = state.monthlyIncome > 0 ? state.monthlyDebtPayment / state.monthlyIncome : 0;
  const debtScore = Math.max(0, 30 * (1 - debtToIncome * 2));

  return Math.round(Math.min(100, Math.max(0, savingsScore + expenseScore + debtScore)));
}
