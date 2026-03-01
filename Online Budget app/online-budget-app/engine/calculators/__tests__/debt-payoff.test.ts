import { describe, it, expect } from "vitest";
import {
  calculateDebtPayoff,
  calculateSingleStrategy,
  generateDebtId,
  loansToDebtAccounts,
} from "../debt-payoff";
import type { DebtAccount } from "../types";

const sampleDebts: DebtAccount[] = [
  {
    id: "cc1",
    name: "Credit Card",
    balance: 5000,
    apr: 19.99,
    minimumPayment: 150,
  },
  {
    id: "car",
    name: "Car Loan",
    balance: 15000,
    apr: 5.5,
    minimumPayment: 300,
  },
  {
    id: "student",
    name: "Student Loan",
    balance: 25000,
    apr: 6.8,
    minimumPayment: 250,
  },
];

describe("calculateDebtPayoff", () => {
  it("returns empty result for no debts", () => {
    const result = calculateDebtPayoff({
      debts: [],
      extraMonthlyPayment: 200,
    });
    expect(result.snowball.totalMonths).toBe(0);
    expect(result.avalanche.totalMonths).toBe(0);
  });

  it("calculates both strategies", () => {
    const result = calculateDebtPayoff({
      debts: sampleDebts,
      extraMonthlyPayment: 300,
    });

    expect(result.snowball.totalMonths).toBeGreaterThan(0);
    expect(result.avalanche.totalMonths).toBeGreaterThan(0);
    expect(result.snowball.totalInterest).toBeGreaterThan(0);
    expect(result.avalanche.totalInterest).toBeGreaterThan(0);
  });

  it("avalanche saves interest vs snowball", () => {
    const result = calculateDebtPayoff({
      debts: sampleDebts,
      extraMonthlyPayment: 300,
    });

    expect(result.avalanche.totalInterest).toBeLessThanOrEqual(
      result.snowball.totalInterest
    );
    expect(result.interestSaved).toBeGreaterThanOrEqual(0);
  });

  it("recommends avalanche when it saves more", () => {
    const result = calculateDebtPayoff({
      debts: sampleDebts,
      extraMonthlyPayment: 300,
    });

    expect(result.recommendedStrategy).toBe("avalanche");
  });

  it("snowball pays off smallest balance first", () => {
    const result = calculateDebtPayoff({
      debts: sampleDebts,
      extraMonthlyPayment: 300,
    });

    // Credit card has smallest balance, should be first in snowball order
    expect(result.snowball.debtPayoffOrder[0]).toBe("cc1");
  });

  it("all debts reach zero balance", () => {
    const result = calculateDebtPayoff({
      debts: sampleDebts,
      extraMonthlyPayment: 300,
    });

    const lastMonth =
      result.avalanche.schedule[result.avalanche.schedule.length - 1]!;
    expect(lastMonth.totalRemaining).toBeCloseTo(0, 0);
  });
});

describe("calculateSingleStrategy", () => {
  it("supports minimum_only strategy", () => {
    const result = calculateSingleStrategy(sampleDebts, 500, "minimum_only");
    expect(result.strategy).toBe("minimum_only");
    expect(result.totalMonths).toBeGreaterThan(0);
  });

  it("supports custom ordering", () => {
    const result = calculateSingleStrategy(
      sampleDebts,
      300,
      "custom",
      ["student", "cc1", "car"]
    );
    expect(result.strategy).toBe("custom");
    expect(result.debtPayoffOrder[0]).toBe("student");
  });

  it("supports one-time payments", () => {
    const withOTP = calculateSingleStrategy(
      sampleDebts,
      300,
      "avalanche",
      undefined,
      [{ targetDebtId: "cc1", amount: 2000, month: 3 }]
    );

    const without = calculateSingleStrategy(
      sampleDebts,
      300,
      "avalanche"
    );

    expect(withOTP.totalMonths).toBeLessThanOrEqual(without.totalMonths);
  });
});

describe("generateDebtId", () => {
  it("generates unique IDs", () => {
    const id1 = generateDebtId();
    const id2 = generateDebtId();
    expect(id1).not.toBe(id2);
    expect(id1.startsWith("debt_")).toBe(true);
  });
});

describe("loansToDebtAccounts", () => {
  it("converts loan format to debt accounts", () => {
    const loans = [
      {
        id: "loan1",
        name: "Home Loan",
        currentBalance: 200000,
        interestRate: 5,
        monthlyPayment: 1200,
      },
    ];

    const accounts = loansToDebtAccounts(loans);
    expect(accounts[0]!.id).toBe("loan1");
    expect(accounts[0]!.name).toBe("Home Loan");
    expect(accounts[0]!.balance).toBe(200000);
    expect(accounts[0]!.apr).toBe(5);
    expect(accounts[0]!.minimumPayment).toBe(1200);
  });
});
