---
name: ai-coach
description: Use when building AI-powered conversational features, budget assistant, financial advice, or spending insights narration.
---

# AI Coach

## Overview

Implements AI-powered financial coaching using Claude API — conversational budgeting assistant, what-if scenarios, spending insights, and margin finder. Designed privacy-first: no user data leaves the device unless the user explicitly opts in for AI analysis.

## When to Use

- Building conversational AI features (chatbot, assistant)
- Generating spending insights or narration
- Implementing what-if scenario analysis
- Creating AI-powered budget suggestions
- Adding natural language queries for financial data

## Core Principles

- **Privacy-first** — No financial data sent to AI unless user explicitly opts in per-query
- **Summarize, don't send raw data** — Send aggregates, not individual transactions
- **Conversational, not prescriptive** — AI suggests, user decides
- **Rate limited** — Prevent excessive API calls (cost + privacy)
- **Fallback to rules** — If AI is unavailable, use rule-based insights

## Workflow

### Step 1: System Prompt Design

```ts
const BUDGET_COACH_SYSTEM_PROMPT = `You are a friendly, knowledgeable personal finance coach inside a budget app.

Rules:
- Give concise, actionable advice (2-3 sentences max per point)
- Never judge spending habits — be supportive and constructive
- Use the user's actual numbers when provided
- Suggest specific, achievable changes (not vague "spend less")
- Acknowledge progress and wins before addressing concerns
- If asked about investments or tax, clarify you're not a licensed advisor
- Always respect privacy — never ask for account numbers or SSN
- Format currency amounts matching the user's locale

You have access to the user's spending summary (aggregated, no individual transactions).`;
```

### Step 2: Privacy-First Data Preparation

```ts
// Only send aggregated summaries, never raw transactions
function prepareAIContext(userData: BudgetData): AISummary {
  return {
    monthlyIncome: userData.income.toString(),
    totalSpent: userData.transactions
      .reduce((sum, t) => sum.plus(t.amount), new Decimal(0))
      .toString(),
    categoryBreakdown: Object.entries(groupByCategory(userData.transactions))
      .map(([cat, txns]) => ({
        category: cat,
        spent: txns.reduce((s, t) => s.plus(t.amount), new Decimal(0)).toString(),
        budgeted: userData.budgets[cat]?.toString() || 'not set',
        transactionCount: txns.length,
      })),
    savingsRate: calculateSavingsRate(userData).toString(),
    topMerchants: getTopMerchants(userData.transactions, 5)
      .map(m => ({ name: m.name, totalSpent: m.total.toString() })),
    // NO individual transactions, NO account numbers, NO descriptions
  };
}
```

### Step 3: Chat API Integration

```ts
// src/app/api/ai/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  // Rate limit: max 20 queries per hour per user
  if (await isRateLimited(userId)) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: BUDGET_COACH_SYSTEM_PROMPT,
    messages: [
      // Inject spending context as first user message
      { role: 'user', content: `Here's my spending summary: ${JSON.stringify(context)}` },
      { role: 'assistant', content: 'Thanks for sharing your summary. How can I help you today?' },
      ...messages,
    ],
  });

  return Response.json({ message: response.content[0].text });
}
```

### Step 4: Insight Generation (Non-Conversational)

```ts
// Generate insights without user interaction
async function generateSpendingInsights(data: BudgetData): Promise<Insight[]> {
  const summary = prepareAIContext(data);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: 'Generate 3 brief, actionable spending insights. Format as JSON array with {title, description, type} where type is "positive", "warning", or "tip".',
    messages: [
      { role: 'user', content: JSON.stringify(summary) },
    ],
  });

  return JSON.parse(response.content[0].text);
}
```

### Step 5: What-If Scenarios

```ts
// "What if I reduce dining out by $200/month?"
async function whatIfAnalysis(
  scenario: string,
  currentData: BudgetData
): Promise<WhatIfResult> {
  const summary = prepareAIContext(currentData);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: 'Analyze this what-if scenario. Respond with JSON: {impact: string, monthlySavings: number, yearlyImpact: number, recommendation: string}',
    messages: [
      { role: 'user', content: `Context: ${JSON.stringify(summary)}\n\nScenario: ${scenario}` },
    ],
  });

  return JSON.parse(response.content[0].text);
}
```

### Step 6: Rate Limiting

```ts
const RATE_LIMITS = {
  chatMessages: { max: 20, windowMs: 3600000 },    // 20 per hour
  insightGeneration: { max: 5, windowMs: 86400000 }, // 5 per day
  whatIfAnalysis: { max: 10, windowMs: 3600000 },    // 10 per hour
};
```

## Key Files

| File | Role |
|------|------|
| `src/lib/ai/openai-service.ts` | Existing AI service (to extend/adapt) |
| `src/app/api/ai/` | AI API routes |
| `src/components/budget/` | Chat UI components |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Sending raw transactions to AI | Only send aggregated summaries |
| No rate limiting | Implement per-user, per-endpoint limits |
| AI response treated as financial advice | Add disclaimer: "Not a licensed advisor" |
| Hardcoding English in AI prompts | Include user's locale in system prompt |
| No fallback when AI unavailable | Use rule-based insights as backup |
| Streaming without error handling | Implement timeout + retry + fallback |

## Validation Checklist

- [ ] No raw transaction data sent to AI API
- [ ] Rate limiting active on all AI endpoints
- [ ] User explicitly opts in before data is sent
- [ ] System prompt includes locale awareness
- [ ] Disclaimer shown for financial advice
- [ ] Fallback insights work without AI
- [ ] Chat history not persisted to server (client-only)

## Related Skills

- `e2e-encryption` — chat history encrypted client-side
- `privacy-marketing` — privacy positioning for AI features
- `rules-engine` — rule-based fallback for AI insights
