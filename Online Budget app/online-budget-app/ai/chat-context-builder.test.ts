import { describe, it, expect } from "vitest";
import { buildChatContext, sanitizeUserMessage } from "./chat-context-builder";
import type { IncomeExpenseSummary } from "../engine/aggregation/types";
import type { CategorySpendingResult } from "../engine/aggregation/category-spending";
import type { BudgetProgressItem } from "../engine/budgeting/budget-progress";

const mockSummary: IncomeExpenseSummary = {
  totalIncome: { amountMinor: 500000, currency: "USD" },
  totalExpense: { amountMinor: -350000, currency: "USD" },
  net: { amountMinor: 150000, currency: "USD" },
  transactionCount: 47,
};

const mockCategories: CategorySpendingResult = {
  categories: [
    { categoryKey: "food", total: { amountMinor: -85000, currency: "USD" }, transactionCount: 12, percentageOfTotal: 24.3 },
    { categoryKey: "transport", total: { amountMinor: -45000, currency: "USD" }, transactionCount: 8, percentageOfTotal: 12.9 },
    { categoryKey: "entertainment", total: { amountMinor: -35000, currency: "USD" }, transactionCount: 5, percentageOfTotal: 10.0 },
    { categoryKey: "utilities", total: { amountMinor: -25000, currency: "USD" }, transactionCount: 3, percentageOfTotal: 7.1 },
    { categoryKey: "shopping", total: { amountMinor: -20000, currency: "USD" }, transactionCount: 4, percentageOfTotal: 5.7 },
    { categoryKey: "health", total: { amountMinor: -10000, currency: "USD" }, transactionCount: 2, percentageOfTotal: 2.9 },
  ],
  totalSpending: { amountMinor: -220000, currency: "USD" },
};

const mockBudgets: BudgetProgressItem[] = [
  { categoryKey: "food", limitMinor: 100000, spentMinor: 85000, remainingMinor: 15000, percentUsed: 85, isOverBudget: false },
  { categoryKey: "transport", limitMinor: 50000, spentMinor: 45000, remainingMinor: 5000, percentUsed: 90, isOverBudget: false },
];

describe("buildChatContext", () => {
  it("produces valid JSON with correct structure", () => {
    const result = buildChatContext(mockSummary, mockCategories, mockBudgets, "USD", "2026-02");
    const parsed = JSON.parse(result);

    expect(parsed.type).toBe("financial_context");
    expect(parsed.currency).toBe("USD");
    expect(parsed.unit).toBe("minor");
    expect(parsed.period).toBe("2026-02");
    expect(parsed.incomeExpense).toBeDefined();
    expect(parsed.topCategories).toBeDefined();
    expect(parsed.budgetStatus).toBeDefined();
  });

  it("includes income/expense summary correctly", () => {
    const result = buildChatContext(mockSummary, mockCategories, mockBudgets, "USD", "2026-02");
    const parsed = JSON.parse(result);

    expect(parsed.incomeExpense.totalIncomeMinor).toBe(500000);
    expect(parsed.incomeExpense.totalExpenseMinor).toBe(350000);
    expect(parsed.incomeExpense.netMinor).toBe(150000);
    expect(parsed.incomeExpense.transactionCount).toBe(47);
  });

  it("caps categories at 5", () => {
    const result = buildChatContext(mockSummary, mockCategories, mockBudgets, "USD", "2026-02");
    const parsed = JSON.parse(result);

    expect(parsed.topCategories).toHaveLength(5);
    expect(parsed.topCategories[0].category).toBe("food");
  });

  it("uses absolute values for expense amounts in categories", () => {
    const result = buildChatContext(mockSummary, mockCategories, mockBudgets, "USD", "2026-02");
    const parsed = JSON.parse(result);

    // Engine stores expenses as negative; context must show positive
    expect(parsed.topCategories[0].totalMinor).toBe(85000);
    expect(parsed.topCategories[1].totalMinor).toBe(45000);
  });

  it("uses absolute value for totalExpenseMinor", () => {
    const result = buildChatContext(mockSummary, mockCategories, mockBudgets, "USD", "2026-02");
    const parsed = JSON.parse(result);

    // totalExpense from engine is -350000, context must show 350000
    expect(parsed.incomeExpense.totalExpenseMinor).toBe(350000);
  });

  it("includes budget status", () => {
    const result = buildChatContext(mockSummary, mockCategories, mockBudgets, "USD", "2026-02");
    const parsed = JSON.parse(result);

    expect(parsed.budgetStatus).toHaveLength(2);
    expect(parsed.budgetStatus[0].category).toBe("food");
    expect(parsed.budgetStatus[0].percentUsed).toBe(85);
  });

  it("handles empty categories gracefully", () => {
    const emptyCategories: CategorySpendingResult = {
      categories: [],
      totalSpending: { amountMinor: 0, currency: "USD" },
    };
    const result = buildChatContext(mockSummary, emptyCategories, [], "USD", "2026-02");
    const parsed = JSON.parse(result);

    expect(parsed.topCategories).toHaveLength(0);
    expect(parsed.budgetStatus).toHaveLength(0);
  });

  it("handles empty budgets gracefully", () => {
    const result = buildChatContext(mockSummary, mockCategories, [], "USD", "2026-02");
    const parsed = JSON.parse(result);

    expect(parsed.budgetStatus).toHaveLength(0);
  });

  it("does not leak transaction IDs, account numbers, or PII", () => {
    const result = buildChatContext(mockSummary, mockCategories, mockBudgets, "USD", "2026-02");

    expect(result).not.toContain("user_id");
    expect(result).not.toContain("account");
    expect(result).not.toContain("transaction_id");
    expect(result).not.toContain("merchant");
    expect(result).not.toContain("email");
  });

  it("does not mutate input objects", () => {
    const summaryBefore = JSON.stringify(mockSummary);
    const categoriesBefore = JSON.stringify(mockCategories);
    const budgetsBefore = JSON.stringify(mockBudgets);

    buildChatContext(mockSummary, mockCategories, mockBudgets, "USD", "2026-02");

    expect(JSON.stringify(mockSummary)).toBe(summaryBefore);
    expect(JSON.stringify(mockCategories)).toBe(categoriesBefore);
    expect(JSON.stringify(mockBudgets)).toBe(budgetsBefore);
  });
});

describe("sanitizeUserMessage", () => {
  it("passes through normal text unchanged", () => {
    expect(sanitizeUserMessage("How much did I spend?")).toBe("How much did I spend?");
  });

  it("strips control characters", () => {
    expect(sanitizeUserMessage("hello\x00world\x01")).toBe("helloworld");
  });

  it("preserves newlines and tabs", () => {
    expect(sanitizeUserMessage("line1\nline2\ttab")).toBe("line1\nline2\ttab");
  });

  it("truncates to 500 characters", () => {
    const long = "a".repeat(600);
    expect(sanitizeUserMessage(long)).toHaveLength(500);
  });

  it("trims whitespace", () => {
    expect(sanitizeUserMessage("  hello  ")).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeUserMessage("")).toBe("");
  });
});
