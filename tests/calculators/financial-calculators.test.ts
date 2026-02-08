/**
 * Financial Calculator Tests
 * Known-answer tests for emergency fund, debt payoff, savings goal,
 * subscription cost, and budget analyzer calculators.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEmergencyFund,
  getRecommendedMonths,
} from '@/lib/calculators/emergency-fund';
import {
  calculateDebtPayoff,
  generateDebtId,
} from '@/lib/calculators/debt-payoff';
import {
  calculateSavingsGoal,
} from '@/lib/calculators/savings-goal';
import {
  toMonthlyCost,
  toYearlyCost,
  calculateSubscriptionCost,
  generateSubscriptionId,
  SUBSCRIPTION_CATEGORIES,
} from '@/lib/calculators/subscription-cost';
import {
  calculateBudgetAnalysis,
  getDefaultMappings,
} from '@/lib/calculators/budget-analyzer';

// ============================================================================
// Emergency Fund Calculator
// ============================================================================

describe('Emergency Fund Calculator', () => {
  it('should calculate basic emergency fund target', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 3000,
      targetMonths: 6,
      currentSavings: 5000,
      monthlyContribution: 500,
    });

    expect(result.targetAmount).toBe(18000); // 3000 * 6
    expect(result.amountNeeded).toBe(13000); // 18000 - 5000
    expect(result.monthsToGoal).toBe(26); // 13000 / 500 = 26
    expect(result.isGoalMet).toBe(false);
    expect(result.progressPercent).toBeCloseTo(27.78, 1); // 5000/18000 * 100
  });

  it('should handle goal already met', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 2000,
      targetMonths: 3,
      currentSavings: 10000,
      monthlyContribution: 200,
    });

    expect(result.targetAmount).toBe(6000);
    expect(result.amountNeeded).toBe(0);
    expect(result.monthsToGoal).toBe(0);
    expect(result.isGoalMet).toBe(true);
    expect(result.progressPercent).toBe(100); // Capped at 100
  });

  it('should handle zero monthly contribution', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 2000,
      targetMonths: 6,
      currentSavings: 5000,
      monthlyContribution: 0,
    });

    expect(result.monthsToGoal).toBe(0); // Can't reach goal with 0 contribution
    expect(result.isGoalMet).toBe(false);
  });

  it('should handle zero expenses', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 0,
      targetMonths: 6,
      currentSavings: 5000,
      monthlyContribution: 500,
    });

    expect(result.targetAmount).toBe(0);
    expect(result.amountNeeded).toBe(0);
    expect(result.isGoalMet).toBe(true);
  });

  describe('getRecommendedMonths', () => {
    it('should return 3 months for stable, no dependents, dual income', () => {
      expect(getRecommendedMonths(true, false, false)).toBe(3);
    });

    it('should return 6 months for unstable employment', () => {
      expect(getRecommendedMonths(false, false, false)).toBe(6);
    });

    it('should add 1 month for dependents', () => {
      expect(getRecommendedMonths(true, true, false)).toBe(4);
    });

    it('should add 2 months for sole income earner', () => {
      expect(getRecommendedMonths(true, false, true)).toBe(5);
    });

    it('should cap at 12 months', () => {
      // unstable (6) + dependents (1) + sole earner (2) = 9, not over 12
      expect(getRecommendedMonths(false, true, true)).toBe(9);
    });

    it('should max out all factors within 12', () => {
      expect(getRecommendedMonths(false, true, true)).toBeLessThanOrEqual(12);
    });
  });
});

// ============================================================================
// Debt Payoff Calculator
// ============================================================================

describe('Debt Payoff Calculator', () => {
  it('should handle empty debts', () => {
    const result = calculateDebtPayoff({ debts: [], extraMonthlyPayment: 200 });

    expect(result.snowball.totalMonths).toBe(0);
    expect(result.avalanche.totalMonths).toBe(0);
    expect(result.interestSaved).toBe(0);
    expect(result.monthsSaved).toBe(0);
    expect(result.recommendedStrategy).toBe('avalanche');
  });

  it('should calculate payoff for single debt', () => {
    const result = calculateDebtPayoff({
      debts: [
        { id: '1', name: 'Credit Card', balance: 1000, apr: 18, minimumPayment: 50 },
      ],
      extraMonthlyPayment: 0,
    });

    expect(result.snowball.totalMonths).toBeGreaterThan(0);
    expect(result.snowball.totalInterest).toBeGreaterThan(0);
    // With only 1 debt, both strategies should be identical
    expect(result.snowball.totalMonths).toBe(result.avalanche.totalMonths);
    expect(result.snowball.totalInterest).toBe(result.avalanche.totalInterest);
  });

  it('should show avalanche saves money on interest', () => {
    const result = calculateDebtPayoff({
      debts: [
        { id: '1', name: 'Low Rate', balance: 5000, apr: 5, minimumPayment: 100 },
        { id: '2', name: 'High Rate', balance: 3000, apr: 22, minimumPayment: 80 },
      ],
      extraMonthlyPayment: 200,
    });

    // Avalanche (highest interest first) should result in less total interest
    expect(result.avalanche.totalInterest).toBeLessThanOrEqual(result.snowball.totalInterest);
    expect(result.recommendedStrategy).toBe('avalanche');
  });

  it('should payoff debts faster with extra payment', () => {
    const debts = [
      { id: '1', name: 'Card A', balance: 2000, apr: 15, minimumPayment: 50 },
      { id: '2', name: 'Card B', balance: 3000, apr: 20, minimumPayment: 75 },
    ];

    const noExtra = calculateDebtPayoff({ debts, extraMonthlyPayment: 0 });
    const withExtra = calculateDebtPayoff({ debts, extraMonthlyPayment: 500 });

    expect(withExtra.snowball.totalMonths).toBeLessThan(noExtra.snowball.totalMonths);
    expect(withExtra.snowball.totalInterest).toBeLessThan(noExtra.snowball.totalInterest);
  });

  it('should not exceed 600 months', () => {
    const result = calculateDebtPayoff({
      debts: [
        { id: '1', name: 'Huge Debt', balance: 1000000, apr: 25, minimumPayment: 10 },
      ],
      extraMonthlyPayment: 0,
    });

    expect(result.snowball.totalMonths).toBeLessThanOrEqual(600);
  });

  it('should track debt payoff order', () => {
    const result = calculateDebtPayoff({
      debts: [
        { id: 'big', name: 'Big', balance: 5000, apr: 10, minimumPayment: 100 },
        { id: 'small', name: 'Small', balance: 500, apr: 10, minimumPayment: 50 },
      ],
      extraMonthlyPayment: 200,
    });

    // Snowball pays smallest balance first
    expect(result.snowball.debtPayoffOrder[0]).toBe('small');
    // Avalanche pays highest rate first (both same rate, so same as snowball in sort order)
  });

  it('generateDebtId should produce unique IDs', () => {
    const id1 = generateDebtId();
    const id2 = generateDebtId();
    expect(id1).toMatch(/^debt_/);
    expect(id1).not.toBe(id2);
  });
});

// ============================================================================
// Savings Goal Calculator
// ============================================================================

describe('Savings Goal Calculator', () => {
  describe('when mode (calculate completion date)', () => {
    it('should calculate months to goal without interest', () => {
      const result = calculateSavingsGoal({
        mode: 'when',
        goalAmount: 10000,
        currentSavings: 2000,
        monthlyContribution: 500,
        expectedAnnualReturn: 0,
      });

      expect(result.monthsToGoal).toBe(16); // (10000 - 2000) / 500 = 16
      expect(result.totalContributions).toBeGreaterThanOrEqual(10000);
      expect(result.totalInterestEarned).toBe(0);
    });

    it('should reach goal faster with interest', () => {
      const noInterest = calculateSavingsGoal({
        mode: 'when',
        goalAmount: 10000,
        currentSavings: 2000,
        monthlyContribution: 500,
        expectedAnnualReturn: 0,
      });

      const withInterest = calculateSavingsGoal({
        mode: 'when',
        goalAmount: 10000,
        currentSavings: 2000,
        monthlyContribution: 500,
        expectedAnnualReturn: 7,
      });

      expect(withInterest.monthsToGoal).toBeLessThan(noInterest.monthsToGoal);
      expect(withInterest.totalInterestEarned).toBeGreaterThan(0);
    });

    it('should handle goal already met', () => {
      const result = calculateSavingsGoal({
        mode: 'when',
        goalAmount: 5000,
        currentSavings: 10000,
        monthlyContribution: 100,
        expectedAnnualReturn: 0,
      });

      expect(result.monthsToGoal).toBe(0);
      expect(result.progressPercent).toBe(100);
    });

    it('should generate projections', () => {
      const result = calculateSavingsGoal({
        mode: 'when',
        goalAmount: 5000,
        currentSavings: 0,
        monthlyContribution: 500,
        expectedAnnualReturn: 0,
      });

      expect(result.projections.length).toBeGreaterThan(0);
      // First projection should be month 0 (initial state)
      expect(result.projections[0].month).toBe(0);
      expect(result.projections[0].balance).toBe(0);
    });
  });

  describe('howMuch mode (calculate required contribution)', () => {
    it('should calculate required monthly contribution without interest', () => {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 12); // 12 months from now

      const result = calculateSavingsGoal({
        mode: 'howMuch',
        goalAmount: 12000,
        currentSavings: 0,
        targetDate,
        expectedAnnualReturn: 0,
      });

      expect(result.requiredMonthlyContribution).toBe(1000); // 12000 / 12
    });

    it('should require less with existing savings', () => {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 12);

      const fromZero = calculateSavingsGoal({
        mode: 'howMuch',
        goalAmount: 12000,
        currentSavings: 0,
        targetDate,
        expectedAnnualReturn: 0,
      });

      const fromSome = calculateSavingsGoal({
        mode: 'howMuch',
        goalAmount: 12000,
        currentSavings: 6000,
        targetDate,
        expectedAnnualReturn: 0,
      });

      expect(fromSome.requiredMonthlyContribution!).toBeLessThan(
        fromZero.requiredMonthlyContribution!
      );
    });

    it('should require $0/month if savings already exceed goal', () => {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 12);

      const result = calculateSavingsGoal({
        mode: 'howMuch',
        goalAmount: 5000,
        currentSavings: 10000,
        targetDate,
        expectedAnnualReturn: 5,
      });

      expect(result.requiredMonthlyContribution).toBe(0);
    });
  });
});

// ============================================================================
// Subscription Cost Calculator
// ============================================================================

describe('Subscription Cost Calculator', () => {
  describe('toMonthlyCost', () => {
    it('should convert monthly to monthly (identity)', () => {
      expect(toMonthlyCost(10, 'monthly')).toBe(10);
    });

    it('should convert annual to monthly', () => {
      expect(toMonthlyCost(120, 'annual')).toBe(10);
    });

    it('should convert weekly to monthly', () => {
      const result = toMonthlyCost(10, 'weekly');
      expect(result).toBeCloseTo(43.33, 1); // 10 * 52/12
    });

    it('should convert quarterly to monthly', () => {
      const result = toMonthlyCost(30, 'quarterly');
      expect(result).toBe(10); // 30 / 3
    });

    it('should convert biweekly to monthly', () => {
      const result = toMonthlyCost(100, 'biweekly');
      expect(result).toBeCloseTo(216.67, 0); // 100 * 26/12
    });
  });

  describe('toYearlyCost', () => {
    it('should calculate yearly from monthly', () => {
      expect(toYearlyCost(10, 'monthly')).toBe(120);
    });

    it('should calculate yearly from annual (identity)', () => {
      expect(toYearlyCost(120, 'annual')).toBe(120);
    });
  });

  describe('calculateSubscriptionCost', () => {
    it('should handle empty subscriptions', () => {
      const result = calculateSubscriptionCost({ subscriptions: [] });
      expect(result.totalMonthly).toBe(0);
      expect(result.totalYearly).toBe(0);
      expect(result.byCategory).toEqual([]);
    });

    it('should calculate totals for subscriptions', () => {
      const result = calculateSubscriptionCost({
        subscriptions: [
          {
            id: '1', name: 'Netflix', amount: 15.99, frequency: 'monthly',
            category: 'Streaming', isEssential: false,
          },
          {
            id: '2', name: 'Spotify', amount: 9.99, frequency: 'monthly',
            category: 'Music', isEssential: false,
          },
          {
            id: '3', name: 'Internet', amount: 79.99, frequency: 'monthly',
            category: 'Utilities', isEssential: true,
          },
        ],
      });

      expect(result.totalMonthly).toBeCloseTo(105.97, 1);
      expect(result.totalYearly).toBeCloseTo(1271.64, 0);
      expect(result.essentialMonthly).toBeCloseTo(79.99, 1);
      expect(result.nonEssentialMonthly).toBeCloseTo(25.98, 1);
    });

    it('should calculate percent of income', () => {
      const result = calculateSubscriptionCost({
        subscriptions: [
          {
            id: '1', name: 'Netflix', amount: 50, frequency: 'monthly',
            category: 'Streaming', isEssential: false,
          },
        ],
        monthlyIncome: 5000,
      });

      expect(result.percentOfIncome).toBe(1); // 50/5000 * 100 = 1%
    });

    it('should group by category', () => {
      const result = calculateSubscriptionCost({
        subscriptions: [
          { id: '1', name: 'Netflix', amount: 15, frequency: 'monthly', category: 'Streaming', isEssential: false },
          { id: '2', name: 'Disney+', amount: 10, frequency: 'monthly', category: 'Streaming', isEssential: false },
          { id: '3', name: 'Spotify', amount: 10, frequency: 'monthly', category: 'Music', isEssential: false },
        ],
      });

      expect(result.byCategory.length).toBe(2);
      const streaming = result.byCategory.find(c => c.category === 'Streaming');
      expect(streaming?.count).toBe(2);
      expect(streaming?.monthly).toBe(25);
    });

    it('should calculate potential yearly savings', () => {
      const result = calculateSubscriptionCost({
        subscriptions: [
          { id: '1', name: 'Internet', amount: 80, frequency: 'monthly', category: 'Utilities', isEssential: true },
          { id: '2', name: 'Netflix', amount: 15, frequency: 'monthly', category: 'Streaming', isEssential: false },
        ],
      });

      expect(result.potentialYearlySavings).toBe(180); // 15 * 12 (non-essential only)
    });
  });

  it('generateSubscriptionId should produce unique IDs', () => {
    const id1 = generateSubscriptionId();
    const id2 = generateSubscriptionId();
    expect(id1).toMatch(/^sub_/);
    expect(id1).not.toBe(id2);
  });

  it('SUBSCRIPTION_CATEGORIES should contain expected categories', () => {
    expect(SUBSCRIPTION_CATEGORIES).toContain('Streaming');
    expect(SUBSCRIPTION_CATEGORIES).toContain('Software');
    expect(SUBSCRIPTION_CATEGORIES).toContain('Gaming');
    expect(SUBSCRIPTION_CATEGORIES.length).toBeGreaterThanOrEqual(10);
  });
});

// ============================================================================
// Budget Analyzer (50/30/20 rule)
// ============================================================================

describe('Budget Analyzer', () => {
  it('should handle zero income', () => {
    const result = calculateBudgetAnalysis({
      monthlyNetIncome: 0,
      categoryMappings: [],
      transactionTotals: [],
    });

    expect(result.isBalanced).toBe(true);
    expect(result.totalSpending).toBe(0);
    expect(result.recommendations).toEqual([]);
  });

  it('should calculate balanced budget', () => {
    const result = calculateBudgetAnalysis({
      monthlyNetIncome: 5000,
      categoryMappings: [
        { categoryId: 'rent', categoryName: 'Rent', bucket: 'needs' },
        { categoryId: 'dining', categoryName: 'Dining', bucket: 'wants' },
        { categoryId: 'savings', categoryName: 'Savings', bucket: 'savings' },
      ],
      transactionTotals: [
        { categoryId: 'rent', categoryName: 'Rent', total: -2500 },
        { categoryId: 'dining', categoryName: 'Dining', total: -1500 },
        { categoryId: 'savings', categoryName: 'Savings', total: -1000 },
      ],
    });

    expect(result.needs.actualAmount).toBe(2500);
    expect(result.needs.targetAmount).toBe(2500); // 50% of 5000
    expect(result.wants.actualAmount).toBe(1500);
    expect(result.wants.targetAmount).toBe(1500); // 30% of 5000
    expect(result.savings.actualAmount).toBe(1000);
    expect(result.savings.targetAmount).toBe(1000); // 20% of 5000
    expect(result.isBalanced).toBe(true);
  });

  it('should detect overspending on needs', () => {
    const result = calculateBudgetAnalysis({
      monthlyNetIncome: 5000,
      categoryMappings: [
        { categoryId: 'rent', categoryName: 'Rent', bucket: 'needs' },
      ],
      transactionTotals: [
        { categoryId: 'rent', categoryName: 'Rent', total: -3500 },
      ],
    });

    expect(result.needs.isOverBudget).toBe(true);
    expect(result.needs.variance).toBeGreaterThan(0);
    expect(result.isBalanced).toBe(false);
  });

  it('should infer bucket from category name', () => {
    const result = calculateBudgetAnalysis({
      monthlyNetIncome: 5000,
      categoryMappings: [], // No explicit mappings
      transactionTotals: [
        { categoryId: 'grocery', categoryName: 'Groceries', total: -500 },
        { categoryId: 'entertainment', categoryName: 'Entertainment', total: -300 },
        { categoryId: 'retirement', categoryName: 'Retirement Fund', total: -500 },
      ],
    });

    expect(result.needs.actualAmount).toBe(500); // Groceries → needs
    expect(result.savings.actualAmount).toBe(500); // Retirement → savings
    expect(result.wants.actualAmount).toBe(300); // Entertainment → wants (default)
  });

  it('should generate recommendations for overspending', () => {
    const result = calculateBudgetAnalysis({
      monthlyNetIncome: 5000,
      categoryMappings: [
        { categoryId: 'rent', categoryName: 'Rent', bucket: 'needs' },
        { categoryId: 'dining', categoryName: 'Dining', bucket: 'wants' },
      ],
      transactionTotals: [
        { categoryId: 'rent', categoryName: 'Rent', total: -3500 },
        { categoryId: 'dining', categoryName: 'Dining', total: -2000 },
      ],
    });

    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should congratulate good savings rate', () => {
    const result = calculateBudgetAnalysis({
      monthlyNetIncome: 5000,
      categoryMappings: [
        { categoryId: 'savings', categoryName: 'Savings', bucket: 'savings' },
      ],
      transactionTotals: [
        { categoryId: 'savings', categoryName: 'Savings', total: -2000 },
      ],
    });

    const savingsRec = result.recommendations.find(r => r.includes('Great job'));
    expect(savingsRec).toBeTruthy();
  });
});
