# Milestone 5 — Conversational AI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a conversational AI chat endpoint that answers natural-language financial questions grounded in user transaction data, with strict guardrails against financial advice.

**Architecture:** User sends a message via POST /api/chat. The API route authenticates, enforces subscription, then delegates to server/chat.ts. The server fetches user financial data from Supabase, calls engine functions to compute structured summaries (income/expense, category breakdown, budget progress), builds a token-budgeted RAG context object, and passes it to ai/chat.ts which sends the structured context + user message to Claude Haiku with a locked system prompt. The response is returned as plain text.

**Tech Stack:** Next.js 16 App Router, Supabase (auth + data), Anthropic SDK (@anthropic-ai/sdk), Vitest for tests.

---

## 1. High-Level Architecture Diagram

```
User Message
    │
    ▼
┌──────────────────────────────┐
│  app/api/chat/route.ts       │  ← Auth + Subscription + Rate limit + Input validation
│  (POST /api/chat)            │  ← Delegates to server/chat.ts
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  server/chat.ts              │  ← Orchestration: DB → Engine → AI
│  handleChat()                │  ← Fetches transactions, categories, budgets
│                              │  ← Calls engine: aggregateIncomeExpense,
│                              │     aggregateByCategory, computeBudgetProgress
│                              │  ← Calls ai/chat.ts: answerChat()
└──────────────┬───────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐ ┌──────────────┐
│  engine/    │ │  ai/chat.ts  │  ← Builds RAG context JSON
│  (pure)     │ │  answerChat()│  ← Sends system prompt + context + user message
│  No changes │ │              │  ← Returns ChatResult
└─────────────┘ └──────────────┘
```

**Data Flow:**
1. **Fetch** — server/chat.ts queries Supabase for: user settings (currency), current month transactions, categories, budgets
2. **Compute** — server calls engine: `aggregateIncomeExpense()`, `aggregateByCategory()`, `computeBudgetProgress()`
3. **Serialize** — ai/chat.ts builds structured JSON context from engine results (not raw transactions)
4. **Prompt** — ai/chat.ts sends locked system prompt + JSON context + user message to Claude Haiku
5. **Return** — plain text reply returned through all layers

---

## 2. Chat Endpoint Contract

### POST /api/chat

**Request:**
```json
{
  "message": "How much did I spend on food this month?"
}
```

**Response (success):**
```json
{
  "ok": true,
  "reply": "Based on your data, you spent $342.50 on food this month, which represents 18% of your total spending.",
  "tokensUsed": 127
}
```

**Response (error):**
```json
{
  "ok": false,
  "error": "Failed to process chat request"
}
```

**Error Codes:**
- `401` — No authenticated user
- `403` — No active subscription
- `400` — Missing or invalid message (empty, >500 chars)
- `429` — Rate limit exceeded (>20 requests per minute per user)
- `500` — Server error

---

## 3. RAG Context Strategy

### What Financial Data Is Injected

The chat receives a **pre-computed financial snapshot** — never raw transactions.

```json
{
  "type": "financial_context",
  "currency": "USD",
  "unit": "minor",
  "period": "2026-02",
  "incomeExpense": {
    "totalIncomeMinor": 500000,
    "totalExpenseMinor": 350000,
    "netMinor": 150000,
    "transactionCount": 47
  },
  "topCategories": [
    { "category": "food", "totalMinor": -85000, "percent": 24.3 },
    { "category": "transport", "totalMinor": -45000, "percent": 12.9 }
  ],
  "budgetStatus": [
    { "category": "food", "limitMinor": 100000, "spentMinor": 85000, "percentUsed": 85 }
  ]
}
```

### Token Budget

- Context JSON: ~400 tokens max (top 5 categories, active budgets only)
- System prompt: ~350 tokens (reuse existing NARRATIVE_SYSTEM_PROMPT with chat extension)
- User message: ~100 tokens max (500 char limit)
- Response: 500 tokens max
- **Total per request: ~1,350 tokens**

### How Context Size Is Controlled

1. `topCategories` capped at top 5 by absolute amount
2. `budgetStatus` includes only categories with active budgets
3. No raw transaction data — only aggregated summaries
4. All numeric values are engine-computed, passed through unchanged

---

## 4. Guardrails Strategy

### Allowed Topics
- Explaining spending data (amounts, categories, trends)
- Answering "how much did I spend on X?"
- Answering "can I afford X?" (using computed data)
- Explaining budget status
- Summarizing income vs expenses

### Disallowed Topics
- Investment advice
- Tax advice
- Specific financial product recommendations
- Market predictions
- Moral judgment about spending habits
- Legal advice
- Comparison with other users

### Refusal Policy
If the user asks for disallowed content, respond with:
> "I can explain the financial data shown, but I cannot provide financial advice. For personalized financial guidance, please consult a qualified financial advisor."

### Prompt Injection Mitigation
1. **Structural separation** — System prompt is in the `system` parameter, not concatenated with user input
2. **User message length limit** — 500 characters maximum
3. **No code execution** — No tool_use, no function calling, text response only
4. **Input sanitization** — Strip control characters from user message
5. **Context is read-only** — Financial context is server-computed, user cannot modify it

### Anti-Financial-Advice Rule
Enforced at two levels:
1. **System prompt** — Explicit prohibition (already in NARRATIVE_SYSTEM_PROMPT)
2. **Chat system prompt** — Additional conversational guardrail layer specific to Q&A

### Structural Safeguards Beyond Prompt Wording
1. Financial data is pre-computed by engine — LLM cannot alter amounts
2. Only aggregated summaries enter the prompt — no PII, no account numbers, no raw transactions
3. Response `max_tokens` capped at 500 — prevents runaway output
4. Temperature set to 0.3 — low creativity, high factual adherence

---

## 5. File Change Plan

### Files to Create
| File | Purpose |
|------|---------|
| `ai/chat.ts` | Chat-specific AI function: builds context, sends to LLM, returns result |
| `ai/chat-context-builder.ts` | Serializes engine output into token-budgeted chat context JSON |
| `ai/chat-system-prompt.ts` | Chat-specific system prompt (extends narrative guardrails for Q&A) |
| `ai/chat.test.ts` | Unit tests for chat context builder and answer function |
| `server/chat.ts` | Orchestration: DB → engine → ai for chat |
| `server/chat.test.ts` | Unit tests for server orchestration |
| `app/api/chat/route.ts` | POST handler: auth + subscription + rate limit + delegation |

### Files to Modify
| File | Change |
|------|--------|
| `ai/types.ts` | Add `ChatResult` type |
| `ai/index.ts` | Add barrel exports for chat functions |
| `server/index.ts` | No change needed (server functions imported directly) |
| `engine/` | **No changes** |

### Files NOT Modified
- `engine/*` — no changes to any engine file
- `ai/client.ts` — reused as-is (new chat function calls it with different params)
- `ai/system-prompt.ts` — original narrative prompt unchanged
- `ai/context-builders.ts` — existing context builders unchanged
- `ai/narrators.ts` — existing narrators unchanged

---

## 6. Testing Strategy

### Unit Tests — ai/chat.test.ts
- `buildChatContext` produces correct JSON shape from engine output
- `buildChatContext` caps categories at 5
- `buildChatContext` excludes categories with zero spending
- `buildChatContext` includes only active budgets
- `answerChat` calls callChatMessage with correct system prompt
- `answerChat` returns `{ ok: true, reply, tokensUsed }` on success
- `answerChat` returns `{ ok: false, error }` on LLM failure
- `sanitizeUserMessage` strips control characters
- `sanitizeUserMessage` truncates to 500 chars

### Unit Tests — server/chat.test.ts
- `handleChat` calls engine functions with correct mapped inputs
- `handleChat` passes engine output to `answerChat`
- `handleChat` returns ChatResult directly

### LLM Mocking Strategy
- Mock `@anthropic-ai/sdk` at module level using `vi.mock()`
- Return canned `{ content: [{ type: "text", text: "..." }], usage: { output_tokens: 42 } }` responses
- Test error paths by making mock throw
- No real LLM calls in tests

### Integration Test (manual verification)
- `npx tsc --noEmit` — zero type errors
- `npx vitest run` — all tests pass
- Verify no `Math.*` in server/chat.ts
- Verify no Supabase imports in ai/chat.ts
- Verify no engine imports in app/api/chat/route.ts

---

## 7. Security Review

### Prompt Injection
- User message is passed as a separate `messages` array entry, not concatenated into system prompt
- System prompt is immutable and server-defined
- Financial context is server-computed — user cannot inject context data
- User message capped at 500 characters

### Over-Sharing Financial Data
- Only aggregated summaries enter the prompt (income/expense totals, top 5 categories, budget status)
- No account numbers, no transaction IDs, no merchant names in context
- No PII in context (user_id never enters prompt)

### Token Exhaustion
- `max_tokens` response cap: 500
- User message cap: 500 characters
- Context JSON cap: ~400 tokens (structural limit via top-5 categories)
- Total per request: ~1,350 tokens — well within Haiku limits

### Rate Limiting
- 20 requests per minute per user (in-memory counter in API route)
- Subscription gate provides implicit throttle (only paying users)
- No retry logic — single attempt per request

### Subscription Enforcement
- `requireSubscription()` called before any DB query or LLM call
- Same pattern as all 5 insight endpoints
- 403 returned for non-subscribers

---

## 8. Execution Plan — Task Breakdown

### Task 1: ChatResult Type

**Skill:** `superpowers:test-driven-development`
**Why:** New type must be defined before any function can use it. TDD ensures the type shape is intentional.
**Expected output:** `ai/types.ts` updated with `ChatResult` discriminated union.

**Files:**
- Modify: `ai/types.ts`

**Step 1: Add ChatResult type to ai/types.ts**

Add after the existing `NarrativeResult` type:

```ts
/** Result of a chat response. */
export type ChatResult =
  | { readonly ok: true; readonly reply: string; readonly tokensUsed: number }
  | { readonly ok: false; readonly error: string };
```

**Step 2: Run type check**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add "Online Budget app/online-budget-app/ai/types.ts"
git commit -m "feat(ai): add ChatResult type for conversational AI"
```

---

### Task 2: Chat System Prompt

**Skill:** `superpowers:test-driven-development`
**Why:** The system prompt is a critical guardrail. Must be reviewed as a standalone unit before integration.
**Expected output:** `ai/chat-system-prompt.ts` with locked conversational prompt.

**Files:**
- Create: `ai/chat-system-prompt.ts`

**Step 1: Write the test**

Create `ai/chat-system-prompt.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { CHAT_SYSTEM_PROMPT } from "./chat-system-prompt";

describe("CHAT_SYSTEM_PROMPT", () => {
  it("is a non-empty string", () => {
    expect(typeof CHAT_SYSTEM_PROMPT).toBe("string");
    expect(CHAT_SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  it("contains financial advice prohibition", () => {
    expect(CHAT_SYSTEM_PROMPT).toContain("financial advice");
  });

  it("contains data-only instruction", () => {
    expect(CHAT_SYSTEM_PROMPT).toContain("JSON input");
  });

  it("contains conversational instruction", () => {
    expect(CHAT_SYSTEM_PROMPT).toContain("question");
  });

  it("prohibits inventing numbers", () => {
    expect(CHAT_SYSTEM_PROMPT).toContain("Do not invent");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run ai/chat-system-prompt.test.ts`
Expected: FAIL — module not found

**Step 3: Write implementation**

Create `ai/chat-system-prompt.ts`:

```ts
/**
 * Locked system prompt for conversational AI chat.
 *
 * Extends the narrative guardrails with Q&A-specific instructions.
 * The user asks natural-language questions about their finances.
 * The assistant answers using ONLY the structured financial context provided.
 */
export const CHAT_SYSTEM_PROMPT = `You are a conversational financial assistant for a budgeting application.
You answer user questions about their personal finances using ONLY the structured financial data provided in the JSON input.

You are NOT the source of financial truth.
You do NOT perform financial calculations.
You do NOT invent numbers.
You do NOT estimate missing values.
You do NOT provide financial, investment, tax, or legal advice.

------------------------------------------------------------
DATA USAGE RULES

1. Only use numeric values explicitly provided in the JSON input.
2. Do not generate new numeric values.
3. Do not infer percentages, totals, or trends that are not present.
4. If required data is missing, respond:
   "I don't have enough data to answer that question."
5. Convert minor units to major units for display (divide by 100).
6. Always include the currency symbol when mentioning amounts.
7. When referring to categories, use the category key from the data.

------------------------------------------------------------
CONVERSATIONAL RULES

1. Answer the user's question directly and concisely.
2. If the question is about a specific category, use the category data if available.
3. If the question is about overall spending, use the income/expense summary.
4. If the question is about budgets, use the budget status data.
5. Keep responses to 1-4 sentences unless the question requires more detail.
6. If the user asks a question not answerable from the data, say so clearly.

------------------------------------------------------------
SCOPE LIMITATIONS

You must NOT:
- Recommend buying, selling, or investing.
- Suggest specific financial products.
- Predict future market behavior.
- Guarantee outcomes.
- Provide moral judgment about spending.
- Use alarmist or fear-based language.
- Discuss other users' data.
- Execute code or tools.

If the user asks for financial advice beyond explanation, respond:
"I can explain your financial data, but I cannot provide financial advice. For personalized guidance, please consult a qualified financial advisor."

------------------------------------------------------------
TONE

- Clear, calm, neutral, professional
- Non-judgmental
- Concise but informative
- Conversational (not robotic)

------------------------------------------------------------
MULTI-LANGUAGE SUPPORT

If the user writes in a language other than English, respond in the same language.

------------------------------------------------------------
IMPORTANT

You are explaining results generated by a deterministic financial engine.
You are not making financial decisions.
You are not a financial advisor.
You are not allowed to invent or modify numbers.
Do not invent data that is not in the provided JSON context.`;
```

**Step 4: Run test to verify it passes**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run ai/chat-system-prompt.test.ts`
Expected: PASS — 5 tests

**Step 5: Commit**

```bash
git add "Online Budget app/online-budget-app/ai/chat-system-prompt.ts" "Online Budget app/online-budget-app/ai/chat-system-prompt.test.ts"
git commit -m "feat(ai): add locked chat system prompt with conversational guardrails"
```

---

### Task 3: Chat Context Builder

**Skill:** `superpowers:test-driven-development`
**Why:** The context builder is a pure function that serializes engine output. TDD ensures correct shape and token budget control.
**Expected output:** `ai/chat-context-builder.ts` with `buildChatContext()` function.

**Files:**
- Create: `ai/chat-context-builder.ts`
- Create: `ai/chat-context-builder.test.ts`

**Step 1: Write the tests**

Create `ai/chat-context-builder.test.ts`:

```ts
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
  { categoryKey: "food", limitMinor: 100000, spentMinor: 85000, remainingMinor: 15000, percentUsed: 85, isOverBudget: false, currency: "USD" },
  { categoryKey: "transport", limitMinor: 50000, spentMinor: 45000, remainingMinor: 5000, percentUsed: 90, isOverBudget: false, currency: "USD" },
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

    // Engine stores expenses as negative; context should show positive
    expect(parsed.topCategories[0].totalMinor).toBe(85000);
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

  it("uses absolute value for totalExpenseMinor", () => {
    const result = buildChatContext(mockSummary, mockCategories, mockBudgets, "USD", "2026-02");
    const parsed = JSON.parse(result);

    // totalExpense from engine is -350000, context should show 350000
    expect(parsed.incomeExpense.totalExpenseMinor).toBe(350000);
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
```

**Step 2: Run tests to verify they fail**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run ai/chat-context-builder.test.ts`
Expected: FAIL — module not found

**Step 3: Write implementation**

Create `ai/chat-context-builder.ts`:

```ts
/**
 * Chat context builder — serializes engine output into token-budgeted JSON for chat LLM.
 *
 * Pure function. No DB, no AI calls, no side effects.
 * No financial math. All values passed through from engine unchanged.
 *
 * Token budget: ~400 tokens (top 5 categories + active budgets).
 */
import type { IncomeExpenseSummary } from "../engine/aggregation/types";
import type { CategorySpendingResult } from "../engine/aggregation/category-spending";
import type { BudgetProgressItem } from "../engine/budgeting/budget-progress";

const MAX_CATEGORIES = 5;
const MAX_MESSAGE_LENGTH = 500;

export function buildChatContext(
  summary: IncomeExpenseSummary,
  categorySpending: CategorySpendingResult,
  budgetProgress: readonly BudgetProgressItem[],
  currency: string,
  period: string
): string {
  return JSON.stringify({
    type: "financial_context",
    currency,
    unit: "minor",
    period,
    incomeExpense: {
      totalIncomeMinor: summary.totalIncome.amountMinor,
      totalExpenseMinor: Math.abs(summary.totalExpense.amountMinor),
      netMinor: summary.net.amountMinor,
      transactionCount: summary.transactionCount,
    },
    topCategories: categorySpending.categories
      .slice(0, MAX_CATEGORIES)
      .map((c) => ({
        category: c.categoryKey,
        totalMinor: Math.abs(c.total.amountMinor),
        percent: c.percentageOfTotal,
      })),
    budgetStatus: budgetProgress.map((b) => ({
      category: b.categoryKey,
      limitMinor: b.limitMinor,
      spentMinor: b.spentMinor,
      percentUsed: b.percentUsed,
    })),
  });
}

/**
 * Sanitize user message before sending to LLM.
 *
 * - Strips control characters (except \n, \t)
 * - Trims whitespace
 * - Truncates to MAX_MESSAGE_LENGTH characters
 */
export function sanitizeUserMessage(message: string): string {
  // Strip control chars except newline (\x0A) and tab (\x09)
  const cleaned = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return cleaned.trim().slice(0, MAX_MESSAGE_LENGTH);
}
```

**Step 4: Run tests to verify they pass**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run ai/chat-context-builder.test.ts`
Expected: PASS — 13 tests

**Step 5: Commit**

```bash
git add "Online Budget app/online-budget-app/ai/chat-context-builder.ts" "Online Budget app/online-budget-app/ai/chat-context-builder.test.ts"
git commit -m "feat(ai): add chat context builder with token-budgeted serialization"
```

---

### Task 4: Chat AI Function

**Skill:** `superpowers:test-driven-development`
**Why:** The chat AI function is the core integration point between context and LLM. Must be tested with mocked SDK.
**Expected output:** `ai/chat.ts` with `answerChat()` function.

**Files:**
- Create: `ai/chat.ts`
- Create: `ai/chat.test.ts`

**Step 1: Write the tests**

Create `ai/chat.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Anthropic SDK before importing
vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: { create: mockCreate },
    })),
    __mockCreate: mockCreate,
  };
});

import { answerChat, CHAT_MODEL, CHAT_MAX_TOKENS, CHAT_TEMPERATURE } from "./chat";
import type { IncomeExpenseSummary } from "../engine/aggregation/types";
import type { CategorySpendingResult } from "../engine/aggregation/category-spending";
import type { BudgetProgressItem } from "../engine/budgeting/budget-progress";

// Access the mock
const { __mockCreate: mockCreate } = await import("@anthropic-ai/sdk") as unknown as { __mockCreate: ReturnType<typeof vi.fn> };

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok result with reply on success", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "You spent $850 on food." }],
      usage: { output_tokens: 42 },
    });

    const result = await answerChat(
      "How much on food?",
      mockSummary,
      mockCategories,
      mockBudgets,
      "USD",
      "2026-02"
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
      mockSummary,
      mockCategories,
      mockBudgets,
      "USD",
      "2026-02"
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
      mockSummary,
      mockCategories,
      mockBudgets,
      "USD",
      "2026-02"
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
      mockSummary,
      mockCategories,
      mockBudgets,
      "USD",
      "2026-02"
    );

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
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
      mockSummary,
      mockCategories,
      mockBudgets,
      "USD",
      "2026-02"
    );

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages).toHaveLength(1);
    expect(callArgs.messages[0].role).toBe("user");
    // Message should contain both context JSON and user question
    expect(callArgs.messages[0].content).toContain("financial_context");
    expect(callArgs.messages[0].content).toContain("How much on food?");
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
```

**Step 2: Run tests to verify they fail**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run ai/chat.test.ts`
Expected: FAIL — module not found

**Step 3: Write implementation**

Create `ai/chat.ts`:

```ts
/**
 * Chat AI function — answers user questions about their finances.
 *
 * Orchestrates:
 * 1. Sanitizes user message
 * 2. Builds structured financial context from engine output
 * 3. Sends system prompt + context + question to Claude Haiku
 * 4. Returns ChatResult
 *
 * No DB access. No financial math. No engine calls.
 * Receives pre-computed engine output only.
 */
import Anthropic from "@anthropic-ai/sdk";

import type { ChatResult } from "./types";
import type { IncomeExpenseSummary } from "../engine/aggregation/types";
import type { CategorySpendingResult } from "../engine/aggregation/category-spending";
import type { BudgetProgressItem } from "../engine/budgeting/budget-progress";
import { CHAT_SYSTEM_PROMPT } from "./chat-system-prompt";
import { buildChatContext, sanitizeUserMessage } from "./chat-context-builder";

export const CHAT_MODEL = "claude-haiku-4-5";
export const CHAT_MAX_TOKENS = 500;
export const CHAT_TEMPERATURE = 0.3;

let instance: Anthropic | null = null;

function getClient(): Anthropic {
  if (!instance) {
    instance = new Anthropic();
  }
  return instance;
}

/**
 * Answer a user's financial question using their pre-computed financial data.
 *
 * - Sanitizes user message (strips control chars, truncates)
 * - Builds structured JSON context from engine results
 * - Sends to Claude Haiku with locked chat system prompt
 * - Returns ChatResult (never throws)
 */
export async function answerChat(
  userMessage: string,
  summary: IncomeExpenseSummary,
  categorySpending: CategorySpendingResult,
  budgetProgress: readonly BudgetProgressItem[],
  currency: string,
  period: string
): Promise<ChatResult> {
  try {
    const sanitized = sanitizeUserMessage(userMessage);
    const context = buildChatContext(summary, categorySpending, budgetProgress, currency, period);

    const client = getClient();
    const response = await client.messages.create({
      model: CHAT_MODEL,
      max_tokens: CHAT_MAX_TOKENS,
      temperature: CHAT_TEMPERATURE,
      system: CHAT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here is my current financial data:\n\n${context}\n\nQuestion: ${sanitized}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, error: "No text in LLM response" };
    }

    return {
      ok: true,
      reply: textBlock.text,
      tokensUsed: response.usage.output_tokens,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run ai/chat.test.ts`
Expected: PASS — 8 tests

**Step 5: Commit**

```bash
git add "Online Budget app/online-budget-app/ai/chat.ts" "Online Budget app/online-budget-app/ai/chat.test.ts"
git commit -m "feat(ai): add answerChat function with context injection and LLM call"
```

---

### Task 5: AI Barrel Export Update

**Skill:** Normal edit flow (surgical, single-file change)
**Why:** Small barrel export addition — no multi-file coordination needed.
**Expected output:** `ai/index.ts` updated with chat exports.

**Files:**
- Modify: `ai/index.ts`

**Step 1: Add chat exports to ai/index.ts**

Add at the end of the file:

```ts
// Chat
export type { ChatResult } from "./types";
export { CHAT_SYSTEM_PROMPT } from "./chat-system-prompt";
export { buildChatContext, sanitizeUserMessage } from "./chat-context-builder";
export { answerChat } from "./chat";
```

**Step 2: Run type check**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add "Online Budget app/online-budget-app/ai/index.ts"
git commit -m "feat(ai): add chat barrel exports to ai/index.ts"
```

---

### Task 6: Server Chat Orchestration

**Skill:** `superpowers:test-driven-development`
**Why:** The server function is the critical orchestration layer. TDD ensures correct DB → engine → AI flow.
**Expected output:** `server/chat.ts` with `handleChat()` function.

**Files:**
- Create: `server/chat.ts`
- Create: `server/chat.test.ts`

**Step 1: Write the tests**

Create `server/chat.test.ts`:

```ts
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

import { handleChat } from "./chat";
import { aggregateIncomeExpense, aggregateByCategory, computeBudgetProgressFromTransactions } from "@/engine";
import { answerChat } from "@/ai";

// Create a mock Supabase client
function createMockSupabase() {
  const selectChain = {
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { primary_currency: "USD" }, error: null }),
  };

  const fromMap: Record<string, unknown> = {
    user_settings: { select: vi.fn().mockReturnValue(selectChain) },
    transactions: {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({
          data: [
            { amount_minor: 500000, currency: "USD", category_id: "cat-1" },
            { amount_minor: -85000, currency: "USD", category_id: "cat-2" },
          ],
          error: null,
        }),
      }),
    },
    categories: {
      select: vi.fn().mockResolvedValue({
        data: [
          { id: "cat-1", key: "salary" },
          { id: "cat-2", key: "food" },
        ],
        error: null,
      }),
    },
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
  });

  it("calls answerChat with engine output", async () => {
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
});
```

**Step 2: Run tests to verify they fail**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run server/chat.test.ts`
Expected: FAIL — module not found

**Step 3: Write implementation**

Create `server/chat.ts`:

```ts
/**
 * Server — Chat orchestration
 *
 * Fetches DB rows, maps DB shape → engine input shape,
 * calls engine aggregation functions, then calls AI chat.
 * Returns ChatResult.
 *
 * NOT allowed: Financial math (must live in /engine)
 * NOT allowed: Financial interpretation logic
 * NOT allowed: Direct LLM calls (must go through /ai)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/database.types";
import type { TransactionForCategoryAggregation } from "@/engine";
import type { ChatResult } from "@/ai/types";
import {
  aggregateIncomeExpense,
  aggregateByCategory,
  computeBudgetProgressFromTransactions,
} from "@/engine";
import type { BudgetLimit } from "@/engine";
import { answerChat } from "@/ai";
import { listBudgets } from "./budgets";

/**
 * Handle a chat message.
 *
 * Orchestration flow:
 * 1. Fetch user settings (currency)
 * 2. Fetch current month transactions + categories + budgets in parallel
 * 3. Map DB rows → engine input shape (no math)
 * 4. Call engine: aggregateIncomeExpense, aggregateByCategory, computeBudgetProgressFromTransactions
 * 5. Call AI: answerChat (context building + LLM call)
 * 6. Return ChatResult
 */
export async function handleChat(
  supabase: SupabaseClient<Database>,
  userId: string,
  message: string
): Promise<ChatResult> {
  // 1. Fetch user settings for currency
  const { data: settings } = await supabase
    .from("user_settings")
    .select("primary_currency")
    .eq("user_id", userId)
    .single();

  const currency = settings?.primary_currency ?? "USD";

  // 2. Compute current month boundaries
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const monthStart = toDateString(new Date(Date.UTC(year, month, 1)));
  const monthEnd = toDateString(new Date(Date.UTC(year, month + 1, 0)));
  const period = `${year}-${String(month + 1).padStart(2, "0")}`;

  // 3. Fetch transactions + categories + budgets in parallel
  const [txResult, categoryResult, budgetResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount_minor, currency, category_id")
      .eq("user_id", userId)
      .eq("currency", currency)
      .gte("transaction_date", monthStart)
      .lte("transaction_date", monthEnd),
    supabase.from("categories").select("id, key"),
    listBudgets(supabase, userId, { period: "monthly" }),
  ]);

  if (txResult.error) throw txResult.error;
  if (categoryResult.error) throw categoryResult.error;

  const transactions = txResult.data ?? [];
  const categories = categoryResult.data ?? [];
  const budgets = budgetResult.budgets;

  // 4. Build category ID → key lookup
  const categoryKeyMap = new Map<string, string>();
  for (const cat of categories) {
    categoryKeyMap.set(cat.id, cat.key);
  }

  // 5. Map DB rows → engine input shape (no math)
  const mapped: TransactionForCategoryAggregation[] = transactions.map((t) => ({
    amountMinor: t.amount_minor,
    currency: t.currency,
    categoryKey: t.category_id
      ? (categoryKeyMap.get(t.category_id) ?? null)
      : null,
  }));

  // Simple aggregation input (no category key needed)
  const aggregationInput = transactions.map((t) => ({
    amountMinor: t.amount_minor,
    currency: t.currency,
  }));

  // Budget limits
  const budgetLimits: BudgetLimit[] = budgets
    .filter((b) => b.currency === currency)
    .map((b) => ({
      categoryKey: categoryKeyMap.get(b.category_id) ?? b.category_id,
      limitMinor: b.amount_minor,
      currency: b.currency,
    }));

  // 6. Call engine functions (no financial math here)
  const summary = aggregateIncomeExpense(aggregationInput, currency);
  const categorySpending = aggregateByCategory(mapped, currency);
  const budgetProgress = computeBudgetProgressFromTransactions(mapped, budgetLimits, currency);

  // 7. Call AI: answerChat (context building + LLM call)
  return answerChat(message, summary, categorySpending, budgetProgress, currency, period);
}

/** Format Date to YYYY-MM-DD string. */
function toDateString(date: Date): string {
  return date.toISOString().split("T")[0]!;
}
```

**Step 4: Run tests to verify they pass**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run server/chat.test.ts`
Expected: PASS — 3 tests

**Step 5: Commit**

```bash
git add "Online Budget app/online-budget-app/server/chat.ts" "Online Budget app/online-budget-app/server/chat.test.ts"
git commit -m "feat(server): add handleChat orchestration — DB → engine → AI"
```

---

### Task 7: API Route — POST /api/chat

**Skill:** `superpowers:test-driven-development`
**Why:** The route is the external boundary. Must enforce auth, subscription, rate limiting, and input validation.
**Expected output:** `app/api/chat/route.ts` with POST handler.

**Files:**
- Create: `app/api/chat/route.ts`

**Step 1: Write the route**

Create `app/api/chat/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSubscription } from "@/lib/subscription";
import { handleChat } from "@/server/chat";

/**
 * Simple in-memory rate limiter.
 * Maps userId → { count, windowStart }.
 * Resets every 60 seconds per user.
 */
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit
  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429 }
    );
  }

  // 3. Enforce subscription
  try {
    await requireSubscription();
  } catch {
    return NextResponse.json(
      { error: "Subscription required" },
      { status: 403 }
    );
  }

  // 4. Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("message" in body) ||
    typeof (body as Record<string, unknown>).message !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing required field: message (string)" },
      { status: 400 }
    );
  }

  const message = ((body as Record<string, unknown>).message as string).trim();
  if (message.length === 0 || message.length > 500) {
    return NextResponse.json(
      { error: "message must be 1-500 characters" },
      { status: 400 }
    );
  }

  // 5. Delegate to server layer
  try {
    const result = await handleChat(supabase, user.id, message);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
```

**Step 2: Run type check**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add "Online Budget app/online-budget-app/app/api/chat/route.ts"
git commit -m "feat(api): add POST /api/chat with auth, rate limiting, and subscription enforcement"
```

---

### Task 8: Full Verification

**Skill:** `superpowers:verification-before-completion`
**Why:** Must verify all architectural invariants and test suite integrity before declaring milestone complete.
**Expected output:** All checks pass.

**Step 1: Type check**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx tsc --noEmit`
Expected: 0 errors

**Step 2: Full test suite**

Run: `cd "/home/robne/projects/active/tanium-tco/modern-tco/Online Budget app/online-budget-app" && npx vitest run`
Expected: All tests pass (existing + new)

**Step 3: Layering boundary verification**

Verify no Math.* in server/chat.ts:
```bash
grep -n "Math\." "Online Budget app/online-budget-app/server/chat.ts"
```
Expected: 0 matches

Verify no Supabase imports in ai/:
```bash
grep -rn "supabase" "Online Budget app/online-budget-app/ai/"
```
Expected: 0 matches

Verify no engine imports in app/api/chat/:
```bash
grep -n "engine" "Online Budget app/online-budget-app/app/api/chat/route.ts"
```
Expected: 0 matches

Verify no financial math in app/api/chat/:
```bash
grep -n "Math\." "Online Budget app/online-budget-app/app/api/chat/route.ts"
```
Expected: 0 matches

**Step 4: Commit verification entry**

```bash
git add -A
git commit -m "chore: milestone 5 — conversational AI — full verification passed"
```

---

## Summary of Files

### Created (7 files)
| File | Purpose |
|------|---------|
| `ai/chat-system-prompt.ts` | Locked conversational system prompt |
| `ai/chat-system-prompt.test.ts` | System prompt content tests |
| `ai/chat-context-builder.ts` | Token-budgeted financial context serializer |
| `ai/chat-context-builder.test.ts` | Context builder unit tests |
| `ai/chat.ts` | Core chat AI function (context + LLM) |
| `ai/chat.test.ts` | Chat AI function tests with mocked SDK |
| `server/chat.ts` | Chat orchestration (DB → engine → AI) |
| `server/chat.test.ts` | Server orchestration tests |
| `app/api/chat/route.ts` | POST /api/chat API route |

### Modified (2 files)
| File | Change |
|------|--------|
| `ai/types.ts` | Add `ChatResult` type |
| `ai/index.ts` | Add chat barrel exports |

### Not Modified
| Layer | Reason |
|-------|--------|
| `engine/*` | No engine changes — existing functions reused |
| `ai/client.ts` | Not reused — chat has its own client instance for different config |
| `ai/system-prompt.ts` | Original narrative prompt unchanged |
| `ai/context-builders.ts` | Existing insight context builders unchanged |
| `ai/narrators.ts` | Existing narrators unchanged |
| `server/insights.ts` | Existing insight orchestration unchanged |

---

## Skill Usage Declaration Per Task

| Task | Skill | Why |
|------|-------|-----|
| 1. ChatResult Type | `superpowers:test-driven-development` | Type-first design ensures contract is explicit |
| 2. Chat System Prompt | `superpowers:test-driven-development` | Guardrail content verified via assertions |
| 3. Chat Context Builder | `superpowers:test-driven-development` | Pure function — ideal for TDD |
| 4. Chat AI Function | `superpowers:test-driven-development` | LLM integration tested with mocks |
| 5. AI Barrel Exports | Normal edit flow | Single-line additions, no complexity |
| 6. Server Orchestration | `superpowers:test-driven-development` | Multi-dependency orchestration — TDD prevents wiring errors |
| 7. API Route | `superpowers:test-driven-development` | Boundary validation tested |
| 8. Full Verification | `superpowers:verification-before-completion` | Final architectural invariant check |
