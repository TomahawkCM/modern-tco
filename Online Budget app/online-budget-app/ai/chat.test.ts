import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Anthropic SDK BEFORE importing the module under test
vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn();
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
    __mockCreate: mockCreate,
  };
});

// Now import the module under test (will use mocked SDK)
import { answerChat, CHAT_MODEL, CHAT_MAX_TOKENS, CHAT_TEMPERATURE } from "./chat";
import type { IncomeExpenseSummary } from "../engine/aggregation/types";
import type { CategorySpendingResult } from "../engine/aggregation/category-spending";
import type { BudgetProgressItem } from "../engine/budgeting/budget-progress";

// Get reference to the mock function
const getMockCreate = async () => {
  const mod = await import("@anthropic-ai/sdk") as unknown as { __mockCreate: ReturnType<typeof vi.fn> };
  return mod.__mockCreate;
};

const mockSummary: IncomeExpenseSummary = {
  totalIncome: { amountMinor: 500000, currency: "USD" },
  totalExpense: { amountMinor: -350000, currency: "USD" },
  net: { amountMinor: 150000, currency: "USD" },
  transactionCount: 47,
};

const mockCategories: CategorySpendingResult = {
  categories: [
    { categoryKey: "food", total: { amountMinor: -85000, currency: "USD" }, transactionCount: 12, percentageOfTotal: 24.3 },
  ],
  totalSpending: { amountMinor: -85000, currency: "USD" },
};

const mockBudgets: BudgetProgressItem[] = [];

describe("answerChat", () => {
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockCreate = await getMockCreate();
  });

  it("returns ok result with reply on success", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "You spent $850 on food." }],
      usage: { output_tokens: 42 },
    });

    const result = await answerChat(
      "How much on food?",
      mockSummary, mockCategories, mockBudgets, "USD", "2026-02"
    );

    expect(result).toEqual({
      ok: true,
      reply: "You spent $850 on food.",
      tokensUsed: 42,
    });
  });

  it("returns error result on LLM failure", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API timeout"));

    const result = await answerChat(
      "How much on food?",
      mockSummary, mockCategories, mockBudgets, "USD", "2026-02"
    );

    expect(result).toEqual({ ok: false, error: "API timeout" });
  });

  it("returns error when LLM returns no text block", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [],
      usage: { output_tokens: 0 },
    });

    const result = await answerChat(
      "How much on food?",
      mockSummary, mockCategories, mockBudgets, "USD", "2026-02"
    );

    expect(result).toEqual({ ok: false, error: "No text in LLM response" });
  });

  it("passes chat system prompt to LLM", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Reply" }],
      usage: { output_tokens: 10 },
    });

    await answerChat(
      "test question",
      mockSummary, mockCategories, mockBudgets, "USD", "2026-02"
    );

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0]![0];
    expect(callArgs.system).toContain("conversational financial assistant");
    expect(callArgs.model).toBe(CHAT_MODEL);
    expect(callArgs.max_tokens).toBe(CHAT_MAX_TOKENS);
    expect(callArgs.temperature).toBe(CHAT_TEMPERATURE);
  });

  it("includes financial context and user message in messages", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Reply" }],
      usage: { output_tokens: 10 },
    });

    await answerChat(
      "How much on food?",
      mockSummary, mockCategories, mockBudgets, "USD", "2026-02"
    );

    const callArgs = mockCreate.mock.calls[0]![0];
    expect(callArgs.messages).toHaveLength(1);
    expect(callArgs.messages[0].role).toBe("user");
    // Message should contain both context JSON and user question
    expect(callArgs.messages[0].content).toContain("financial_context");
    expect(callArgs.messages[0].content).toContain("How much on food?");
  });

  it("handles non-Error exceptions gracefully", async () => {
    mockCreate.mockRejectedValueOnce("string error");

    const result = await answerChat(
      "test",
      mockSummary, mockCategories, mockBudgets, "USD", "2026-02"
    );

    expect(result).toEqual({ ok: false, error: "Unknown error" });
  });
});

describe("chat constants", () => {
  it("uses Haiku model", () => {
    expect(CHAT_MODEL).toBe("claude-haiku-4-5");
  });

  it("caps response at 500 tokens", () => {
    expect(CHAT_MAX_TOKENS).toBe(500);
  });

  it("uses low temperature", () => {
    expect(CHAT_TEMPERATURE).toBe(0.3);
  });
});
