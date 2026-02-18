/**
 * What-If Scenario Types
 *
 * Type definitions for the scenario modeling engine.
 */

export type ScenarioType =
  | "cancel_subscription"
  | "change_income"
  | "add_expense"
  | "pay_off_debt"
  | "increase_savings_rate";

export interface ScenarioInput {
  type: ScenarioType;
  /** Cancel subscription: amount per month */
  subscriptionAmount?: number;
  /** Change income: new monthly income */
  newMonthlyIncome?: number;
  /** Add expense: monthly expense amount */
  newExpenseAmount?: number;
  /** Pay off debt: extra monthly payment */
  extraDebtPayment?: number;
  /** Pay off debt: target loan ID */
  targetLoanId?: string;
  /** Increase savings rate: new target % */
  newSavingsRate?: number;
}

export interface FinancialState {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  totalDebt: number;
  monthlyDebtPayment: number;
  healthScore: number;
  debtFreeDate?: Date;
}

export interface ScenarioResult {
  before: FinancialState;
  after: FinancialState;
  impact: {
    monthlyCashFlowChange: number;
    annualSavingsChange: number;
    healthScoreDelta: number;
    debtFreeDateChange?: number; // days sooner/later
    description: string;
  };
}
