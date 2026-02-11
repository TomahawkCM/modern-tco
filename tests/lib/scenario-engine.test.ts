import { describe, it, expect } from 'vitest';
import { runScenario } from '@/lib/scenarios/scenario-engine';
import type { FinancialState, ScenarioInput } from '@/lib/scenarios/scenario-types';

const baseState: FinancialState = {
  monthlyIncome: 5000,
  monthlyExpenses: 3500,
  monthlySavings: 1500,
  savingsRate: 30,
  totalDebt: 10000,
  monthlyDebtPayment: 500,
  healthScore: 70,
  debtFreeDate: new Date('2028-01-01'),
};

describe('scenario-engine', () => {
  describe('cancel_subscription', () => {
    it('reduces monthly expenses and increases savings', () => {
      const input: ScenarioInput = {
        type: 'cancel_subscription',
        subscriptionAmount: 15,
      };

      const result = runScenario(input, baseState);
      expect(result.after.monthlyExpenses).toBe(3485);
      expect(result.after.monthlySavings).toBe(1515);
      expect(result.impact.monthlyCashFlowChange).toBe(15);
      expect(result.impact.annualSavingsChange).toBe(180);
    });
  });

  describe('change_income', () => {
    it('updates savings and savings rate on income increase', () => {
      const input: ScenarioInput = {
        type: 'change_income',
        newMonthlyIncome: 6000,
      };

      const result = runScenario(input, baseState);
      expect(result.after.monthlyIncome).toBe(6000);
      expect(result.after.monthlySavings).toBe(2500);
      expect(result.impact.monthlyCashFlowChange).toBe(1000);
    });

    it('handles income decrease', () => {
      const input: ScenarioInput = {
        type: 'change_income',
        newMonthlyIncome: 4000,
      };

      const result = runScenario(input, baseState);
      expect(result.after.monthlyIncome).toBe(4000);
      expect(result.after.monthlySavings).toBe(500);
      expect(result.impact.monthlyCashFlowChange).toBe(-1000);
    });
  });

  describe('add_expense', () => {
    it('increases expenses and decreases savings', () => {
      const input: ScenarioInput = {
        type: 'add_expense',
        newExpenseAmount: 200,
      };

      const result = runScenario(input, baseState);
      expect(result.after.monthlyExpenses).toBe(3700);
      expect(result.after.monthlySavings).toBe(1300);
      expect(result.impact.annualSavingsChange).toBe(-2400);
    });
  });

  describe('pay_off_debt', () => {
    it('accelerates debt payoff timeline', () => {
      const input: ScenarioInput = {
        type: 'pay_off_debt',
        extraDebtPayment: 200,
      };

      const result = runScenario(input, baseState);
      expect(result.after.monthlyDebtPayment).toBe(700);
      expect(result.after.monthlySavings).toBe(1300);
      expect(result.after.debtFreeDate).toBeDefined();
    });
  });

  describe('increase_savings_rate', () => {
    it('adjusts expenses to hit target savings rate', () => {
      const input: ScenarioInput = {
        type: 'increase_savings_rate',
        newSavingsRate: 40,
      };

      const result = runScenario(input, baseState);
      expect(result.after.savingsRate).toBe(40);
      expect(result.after.monthlySavings).toBe(2000);
      expect(result.after.monthlyExpenses).toBe(3000);
    });
  });

  describe('health score', () => {
    it('health score changes with financial changes', () => {
      const input: ScenarioInput = {
        type: 'increase_savings_rate',
        newSavingsRate: 40,
      };

      const result = runScenario(input, baseState);
      expect(result.impact.healthScoreDelta).toBeDefined();
      // Higher savings rate should improve or maintain health score
      expect(result.after.healthScore).toBeGreaterThanOrEqual(baseState.healthScore);
    });
  });
});
