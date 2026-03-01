import { describe, it, expect } from "vitest";
import { forecastNetWorth } from "../net-worth-forecast";

describe("forecastNetWorth", () => {
  it("projects asset growth over time", () => {
    const result = forecastNetWorth({
      assets: [
        { name: "Stocks", currentValue: 100000, annualGrowthRate: 7 },
      ],
      liabilities: [],
      years: 10,
    });

    expect(result.projectedNetWorth).toBeGreaterThan(100000);
    expect(result.totalGrowth).toBeGreaterThan(0);
    expect(result.timeline).toHaveLength(11); // year 0 through 10
    expect(result.currentNetWorth).toBe(100000);
  });

  it("accounts for liability paydown", () => {
    const result = forecastNetWorth({
      assets: [
        { name: "Home", currentValue: 300000, annualGrowthRate: 3 },
      ],
      liabilities: [
        {
          name: "Mortgage",
          currentBalance: 200000,
          annualRate: 5,
          monthlyPayment: 1500,
        },
      ],
      years: 30,
    });

    expect(result.currentNetWorth).toBe(100000);
    expect(result.projectedNetWorth).toBeGreaterThan(result.currentNetWorth);
  });

  it("detects millionaire milestone", () => {
    const result = forecastNetWorth({
      assets: [
        {
          name: "Portfolio",
          currentValue: 200000,
          annualGrowthRate: 8,
          monthlyContribution: 2000,
        },
      ],
      liabilities: [],
      years: 30,
    });

    expect(result.millionaireYear).not.toBeNull();
    expect(result.millionaireYear!).toBeGreaterThan(0);
    expect(result.millionaireYear!).toBeLessThanOrEqual(30);
  });

  it("detects debt-free milestone", () => {
    const result = forecastNetWorth({
      assets: [
        { name: "Savings", currentValue: 50000, annualGrowthRate: 3 },
      ],
      liabilities: [
        {
          name: "Car Loan",
          currentBalance: 20000,
          annualRate: 5,
          monthlyPayment: 500,
        },
      ],
      years: 10,
    });

    expect(result.debtFreeYear).not.toBeNull();
    expect(result.debtFreeYear!).toBeLessThanOrEqual(10);
  });

  it("calculates real (inflation-adjusted) net worth", () => {
    const result = forecastNetWorth({
      assets: [
        { name: "Cash", currentValue: 100000, annualGrowthRate: 0 },
      ],
      liabilities: [],
      years: 10,
      inflationRate: 3,
    });

    // With 0% growth and 3% inflation, real net worth should decline
    const lastPoint = result.timeline[result.timeline.length - 1]!;
    expect(lastPoint.realNetWorth).toBeLessThan(100000);
  });
});
