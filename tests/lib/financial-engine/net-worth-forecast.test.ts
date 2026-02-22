/**
 * Net Worth Forecaster Engine Tests
 *
 * Tests for net worth projection with asset growth and debt paydown.
 */

import { describe, it, expect } from "vitest";
import { forecastNetWorth } from "@/lib/financial-engine/net-worth-forecast";

describe("forecastNetWorth", () => {
  it("should project with no assets or liabilities", () => {
    const result = forecastNetWorth({
      assets: [],
      liabilities: [],
      years: 10,
    });

    expect(result.currentNetWorth).toBe(0);
    expect(result.projectedNetWorth).toBe(0);
    expect(result.timeline).toHaveLength(11); // year 0 through 10
  });

  it("should project asset growth", () => {
    const result = forecastNetWorth({
      assets: [{ name: "Investments", currentValue: 100000, annualGrowthRate: 7 }],
      liabilities: [],
      years: 10,
    });

    expect(result.currentNetWorth).toBe(100000);
    expect(result.projectedNetWorth).toBeGreaterThan(100000);
    // ~$200k after 10 years at 7%
    expect(result.projectedNetWorth).toBeCloseTo(200000, -4);
  });

  it("should project asset growth with contributions", () => {
    const noContrib = forecastNetWorth({
      assets: [{ name: "401k", currentValue: 50000, annualGrowthRate: 7 }],
      liabilities: [],
      years: 20,
    });

    const withContrib = forecastNetWorth({
      assets: [
        {
          name: "401k",
          currentValue: 50000,
          annualGrowthRate: 7,
          monthlyContribution: 500,
        },
      ],
      liabilities: [],
      years: 20,
    });

    expect(withContrib.projectedNetWorth).toBeGreaterThan(noContrib.projectedNetWorth);
  });

  it("should project debt paydown", () => {
    const result = forecastNetWorth({
      assets: [],
      liabilities: [
        {
          name: "Mortgage",
          currentBalance: 300000,
          annualRate: 6,
          monthlyPayment: 1800,
        },
      ],
      years: 30,
    });

    expect(result.currentNetWorth).toBe(-300000);
    expect(result.projectedNetWorth).toBeGreaterThan(-300000);
  });

  it("should calculate net worth (assets minus liabilities)", () => {
    const result = forecastNetWorth({
      assets: [
        { name: "Home", currentValue: 400000, annualGrowthRate: 3 },
        { name: "Investments", currentValue: 200000, annualGrowthRate: 7 },
      ],
      liabilities: [
        {
          name: "Mortgage",
          currentBalance: 300000,
          annualRate: 5,
          monthlyPayment: 1600,
        },
      ],
      years: 10,
    });

    expect(result.currentNetWorth).toBe(300000); // 600k - 300k
    expect(result.projectedNetWorth).toBeGreaterThan(result.currentNetWorth);
  });

  it("should have increasing net worth with positive cash flow", () => {
    const result = forecastNetWorth({
      assets: [
        {
          name: "Savings",
          currentValue: 50000,
          annualGrowthRate: 5,
          monthlyContribution: 1000,
        },
      ],
      liabilities: [],
      years: 10,
    });

    for (let i = 1; i < result.timeline.length; i++) {
      expect(result.timeline[i].netWorth).toBeGreaterThan(result.timeline[i - 1].netWorth);
    }
  });

  it("should detect millionaire year", () => {
    const result = forecastNetWorth({
      assets: [
        {
          name: "Portfolio",
          currentValue: 500000,
          annualGrowthRate: 8,
          monthlyContribution: 2000,
        },
      ],
      liabilities: [],
      years: 20,
    });

    expect(result.millionaireYear).not.toBeNull();
    expect(result.millionaireYear!).toBeGreaterThan(0);
    expect(result.millionaireYear!).toBeLessThan(20);
  });

  it("should return null for millionaire year if never reached", () => {
    const result = forecastNetWorth({
      assets: [{ name: "Savings", currentValue: 10000, annualGrowthRate: 2 }],
      liabilities: [],
      years: 5,
    });

    expect(result.millionaireYear).toBeNull();
  });

  it("should detect debt-free year", () => {
    const result = forecastNetWorth({
      assets: [],
      liabilities: [
        {
          name: "Car Loan",
          currentBalance: 20000,
          annualRate: 4,
          monthlyPayment: 500,
        },
      ],
      years: 10,
    });

    expect(result.debtFreeYear).not.toBeNull();
    expect(result.debtFreeYear!).toBeGreaterThan(0);
  });

  it("should calculate growth rate", () => {
    const result = forecastNetWorth({
      assets: [{ name: "Investments", currentValue: 100000, annualGrowthRate: 7 }],
      liabilities: [],
      years: 10,
    });

    expect(result.totalGrowth).toBeGreaterThan(0);
    expect(result.growthRate).toBeGreaterThan(0);
  });

  it("should calculate inflation-adjusted net worth", () => {
    const result = forecastNetWorth({
      assets: [{ name: "Investments", currentValue: 100000, annualGrowthRate: 7 }],
      liabilities: [],
      years: 10,
      inflationRate: 3,
    });

    const lastPoint = result.timeline[result.timeline.length - 1];
    expect(lastPoint.realNetWorth).toBeLessThan(lastPoint.netWorth);
  });

  it("should handle multiple assets and liabilities", () => {
    const result = forecastNetWorth({
      assets: [
        { name: "Home", currentValue: 400000, annualGrowthRate: 3 },
        { name: "401k", currentValue: 150000, annualGrowthRate: 7, monthlyContribution: 1500 },
        { name: "Savings", currentValue: 30000, annualGrowthRate: 4, monthlyContribution: 500 },
      ],
      liabilities: [
        { name: "Mortgage", currentBalance: 300000, annualRate: 5.5, monthlyPayment: 1700 },
        { name: "Car Loan", currentBalance: 15000, annualRate: 4, monthlyPayment: 400 },
      ],
      years: 20,
    });

    expect(result.currentNetWorth).toBe(265000); // 580k - 315k
    expect(result.projectedNetWorth).toBeGreaterThan(result.currentNetWorth);
    expect(result.timeline).toHaveLength(21);
  });
});
