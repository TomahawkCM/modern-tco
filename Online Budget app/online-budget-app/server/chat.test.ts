import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock engine
vi.mock("@/engine", () => ({
  aggregateIncomeExpense: vi.fn().mockReturnValue({
    totalIncome: { amountMinor: 500000, currency: "USD" },
    totalExpense: { amountMinor: -350000, currency: "USD" },
    net: { amountMinor: 150000, currency: "USD" },
    transactionCount: 47,
  }),
  aggregateByCategory: vi.fn().mockReturnValue({
    categories: [
      { categoryKey: "food", total: { amountMinor: -85000, currency: "USD" }, transactionCount: 12, percentageOfTotal: 24.3 },
    ],
    totalSpending: { amountMinor: -85000, currency: "USD" },
  }),
  computeBudgetProgressFromTransactions: vi.fn().mockReturnValue([]),
}));

// Mock ai
vi.mock("@/ai", () => ({
  answerChat: vi.fn().mockResolvedValue({
    ok: true,
    reply: "You spent $850 on food this month.",
    tokensUsed: 42,
  }),
}));

// Mock budgets
vi.mock("./budgets", () => ({
  listBudgets: vi.fn().mockResolvedValue({ budgets: [] }),
}));

import { handleChat } from "./chat";
import { aggregateIncomeExpense, aggregateByCategory, computeBudgetProgressFromTransactions } from "@/engine";
import { answerChat } from "@/ai";

// Minimal mock Supabase client
function createMockSupabase() {
  // Settings query chain
  const settingsChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { primary_currency: "USD" },
      error: null,
    }),
  };

  // Transactions query chain
  const txChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockResolvedValue({
      data: [
        { amount_minor: 500000, currency: "USD", category_id: "cat-1" },
        { amount_minor: -85000, currency: "USD", category_id: "cat-2" },
      ],
      error: null,
    }),
  };

  // Categories query chain
  const categoriesChain = {
    select: vi.fn().mockResolvedValue({
      data: [
        { id: "cat-1", key: "salary" },
        { id: "cat-2", key: "food" },
      ],
      error: null,
    }),
  };

  const fromMap: Record<string, unknown> = {
    user_settings: settingsChain,
    transactions: txChain,
    categories: categoriesChain,
  };

  return {
    from: vi.fn((table: string) => fromMap[table]),
  };
}

describe("handleChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls engine functions with mapped transactions", async () => {
    const supabase = createMockSupabase();
    await handleChat(supabase as never, "user-123", "How much on food?");

    expect(aggregateIncomeExpense).toHaveBeenCalledTimes(1);
    expect(aggregateByCategory).toHaveBeenCalledTimes(1);
    expect(computeBudgetProgressFromTransactions).toHaveBeenCalledTimes(1);
  });

  it("calls answerChat with engine output and user message", async () => {
    const supabase = createMockSupabase();
    await handleChat(supabase as never, "user-123", "How much on food?");

    expect(answerChat).toHaveBeenCalledTimes(1);
    expect(answerChat).toHaveBeenCalledWith(
      "How much on food?",
      expect.objectContaining({ transactionCount: 47 }),
      expect.objectContaining({ categories: expect.any(Array) }),
      expect.any(Array),
      "USD",
      expect.stringMatching(/^\d{4}-\d{2}$/)
    );
  });

  it("returns ChatResult from answerChat", async () => {
    const supabase = createMockSupabase();
    const result = await handleChat(supabase as never, "user-123", "How much on food?");

    expect(result).toEqual({
      ok: true,
      reply: "You spent $850 on food this month.",
      tokensUsed: 42,
    });
  });

  it("defaults currency to USD when settings missing", async () => {
    const supabase = createMockSupabase();
    // Override settings to return null
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === "user_settings") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      // Return original chains for other tables
      return createMockSupabase().from(table);
    });

    await handleChat(supabase as never, "user-123", "test");

    expect(answerChat).toHaveBeenCalledWith(
      "test",
      expect.anything(),
      expect.anything(),
      expect.anything(),
      "USD",
      expect.any(String)
    );
  });
});
