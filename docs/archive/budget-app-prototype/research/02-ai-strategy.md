# AI Strategy: Agentic Financial Co-Pilot

## Industry Context (2025-2026)

The personal finance industry is shifting from **passive chatbots** to **agentic AI assistants** that autonomously plan multi-step workflows, call tools, and adapt in real-time.

### Industry Trends

- **Agentic AI adoption**: Gartner predicts 33% of enterprise software will include agentic AI by 2028, up from <1% in 2024
- **Financial AI assistants**: Apps like Copilot Money, Cleo, and Monarch are transforming budgeting from manual tracking to conversational, AI-driven financial management
- **Multi-agent architectures**: Origin (first SEC-regulated AI financial advisor) uses multi-agent orchestration with Claude Opus, GPT, Gemini, and Perplexity
- **Voice interaction**: Cleo 3.0 launched real-time two-way voice conversations for financial management
- **Autonomous resolution**: Wells Fargo's Fargo has completed 200M+ fully autonomous customer interactions
- **Cost awareness**: Prompt caching, model tiering, and token budgets are critical for sustainable AI features

### Our Competitive Position

| Feature                   | Monarch       | Cleo 3.0             | Copilot       | **Our App**         |
| ------------------------- | ------------- | -------------------- | ------------- | ------------------- |
| AI Assistant              | Yes (passive) | Yes (agentic)        | Yes (passive) | **Yes (agentic)**   |
| Tool Calling              | Limited       | Multi-step           | Limited       | **14 budget tools** |
| Memory                    | No            | Yes (cross-session)  | No            | **Yes**             |
| Voice                     | No            | Yes (two-way)        | No            | **Yes**             |
| Personality Modes         | No            | Yes (Roast/Hype)     | No            | **Yes (3 modes)**   |
| Proactive Insights        | Sparkle icons | Smart Insights Agent | Basic         | **8 insight types** |
| Weekly Recap              | Yes           | No                   | No            | **Yes**             |
| Works with E2E Encryption | N/A           | N/A                  | N/A           | **Yes (3 tiers)**   |
| Languages                 | English       | English              | English       | **114**             |

## AI Architecture

### Overview

The AI assistant is the **primary interaction mode** — not a sidebar widget. Users should be able to manage their entire financial life through conversation.

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT SIDE                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              ChatbotContext (React)                     │ │
│  │  - Conversation history (20 messages)                  │ │
│  │  - Streaming message display                           │ │
│  │  - Tool result rendering (cards, charts, tables)       │ │
│  │  - Voice input (Web Speech API / SpeechRecognition)    │ │
│  │  - Personality mode selector                           │ │
│  │  - Confirmation cards for write operations             │ │
│  └──────────────┬─────────────────────────────────────────┘ │
│                 │                                            │
│  ┌──────────────▼─────────────────────────────────────────┐ │
│  │          Budget Data Layer (IndexedDB)                  │ │
│  │  - Decrypts data if E2E mode                           │ │
│  │  - Assembles FinancialContext snapshot (~500 tokens)    │ │
│  │  - Executes write tool results locally                 │ │
│  │  - Validates AI-proposed changes before execution      │ │
│  └──────────────┬─────────────────────────────────────────┘ │
│                 │ POST /api/chat                             │
└─────────────────┼───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      SERVER SIDE                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           /api/chat/route.ts (Enhanced)                │ │
│  │                                                        │ │
│  │  1. Receives messages + FinancialContext               │ │
│  │  2. Builds system prompt (personality + context)       │ │
│  │  3. Attaches 14 tool definitions (strict: true)       │ │
│  │  4. Calls OpenAI with function calling                │ │
│  │     - parallel_tool_calls: false                      │ │
│  │     - Prompt caching for system prompt                │ │
│  │  5. Streams response + tool calls back via SSE        │ │
│  │  6. Rate limiting per user tier                       │ │
│  │     - Free: 5 messages/day                            │ │
│  │     - Pro: Unlimited                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Client executes all database writes**: The AI proposes changes via tool calls, but the client validates and executes. The server never directly modifies user data. This preserves offline-first architecture and works with all encryption tiers.

2. **Structured Outputs (`strict: true`)**: All tool definitions use OpenAI Structured Outputs for guaranteed schema compliance on financial data. No hallucinated amounts.

3. **No parallel tool calls**: `parallel_tool_calls: false` to avoid schema mismatches with Structured Outputs.

4. **Prompt caching**: System prompt + 14 tool definitions are ~2000 tokens and identical across requests. OpenAI prompt caching reduces latency and cost.

5. **Confirmation before writes**: Any tool call that modifies data (create_transaction, update_budget, etc.) shows a confirmation card in the UI. One tap to accept, edit, or reject.

## Tool Definitions

### Read Tools (Query Data)

| Tool                   | Description                                        | Parameters                                                                       |
| ---------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- | ----------- | ------------- |
| `get_accounts`         | List all accounts with balances, types, currencies | `include_hidden: boolean`                                                        |
| `get_transactions`     | Query by date, category, merchant, amount range    | `start_date?, end_date?, category?, merchant?, min_amount?, max_amount?, limit?` |
| `get_budgets`          | Budget status with spent/remaining per category    | `category?, period?`                                                             |
| `get_spending_summary` | Spending breakdown by category, merchant, or day   | `start_date, end_date, group_by`                                                 |
| `get_subscriptions`    | All tracked subscriptions with amounts and dates   | (none)                                                                           |
| `get_upcoming_bills`   | Upcoming bill payments in next N days              | `days_ahead?` (default 30)                                                       |
| `get_financial_health` | Financial health score (0-100) with breakdown      | (none)                                                                           |
| `get_safe_to_spend`    | How much is safe to spend in a given period        | `period: "today"                                                                 | "this_week" | "this_month"` |
| `get_net_worth`        | Current net worth and recent trend                 | `include_history?`                                                               |

### Write Tools (Modify Data — Client Executes)

| Tool                  | Description                                   | Parameters                                               |
| --------------------- | --------------------------------------------- | -------------------------------------------------------- |
| `create_transaction`  | Add new transaction from natural language     | `amount, description, category, date, account_id?, type` |
| `update_budget`       | Change budget amount for a category           | `category, new_amount, period`                           |
| `create_savings_goal` | Set new savings goal with target and deadline | `name, target_amount, deadline?`                         |

### Analysis Tools (Compute Insights)

| Tool                | Description                               | Parameters                                               |
| ------------------- | ----------------------------------------- | -------------------------------------------------------- |
| `compare_periods`   | Compare spending between two time periods | `period1_start, period1_end, period2_start, period2_end` |
| `forecast_cashflow` | Project account balances forward          | `days_forward, account_id?`                              |

## Financial Context Snapshot

Before each AI message, the client assembles a compact financial snapshot (~500 tokens) sent alongside the conversation history:

```typescript
interface FinancialContext {
  // Account summary (always included)
  accounts: Array<{
    name: string;
    type: "checking" | "savings" | "credit" | "investment";
    balance: number;
    currency: string;
  }>;
  total_balance: number;

  // Budget status (always included)
  budget_summary: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percent_used: number;
  }>;

  // Recent activity (last 7 days)
  recent_transaction_count: number;
  recent_spending_total: number;

  // Key metrics
  safe_to_spend_this_week: number;
  savings_rate_30d: number; // percentage
  upcoming_bills_7d: Array<{
    name: string;
    amount: number;
    due_date: string;
  }>;

  // User preferences
  currency: string;
  locale: string;
  personality_mode: "professional" | "encouraging" | "direct";

  // Household context (if family plan)
  household_members?: string[];
  is_household_owner?: boolean;
}
```

## Personality Modes

### Professional (Default)

- Tone: Clear, neutral, helpful
- Example: "You spent $342 on dining this month, which is 15% over your $300 budget. Consider reducing dining frequency by 1 meal per week to stay on track."

### Encouraging

- Tone: Warm, celebratory, motivational
- Example: "Great news! You're only $50 away from your emergency fund goal! At your current savings rate, you'll hit it in just 6 days. Keep up the amazing work!"

### Direct

- Tone: Blunt, no-nonsense, honest
- Example: "You blew through your dining budget by $42. You've eaten out 14 times this month. Cut back or raise the budget — your call."

Implementation: Personality is injected as a suffix to the system prompt. User selects in Settings → AI Preferences. The personality prompt is ~100 tokens.

## Smart Insights Engine (Proactive)

### 8 Insight Types

| #   | Type                      | Trigger Condition                             | Urgency        | Source Module            |
| --- | ------------------------- | --------------------------------------------- | -------------- | ------------------------ |
| 1   | **Spending Velocity**     | Weekly spend > 120% of 4-week average         | High           | `anomaly-detection.ts`   |
| 2   | **Bill Prediction**       | Recurring transaction due within 3 days       | Medium         | `predictive-spending.ts` |
| 3   | **Savings Milestone**     | Within 10% of savings goal target             | Low (positive) | Goal progress calc       |
| 4   | **Subscription Waste**    | No matching transaction for 45+ days          | Medium         | Subscription tracker     |
| 5   | **Category Optimization** | Same items consistently cheaper at merchant B | Low            | Transaction history      |
| 6   | **Safe-to-Spend**         | Daily morning update                          | Informational  | Budget remaining / days  |
| 7   | **Weekly Recap**          | Every Sunday                                  | Informational  | AI-generated narrative   |
| 8   | **Budget Risk**           | Projected to exceed budget before month end   | High           | `predictive-spending.ts` |

### Execution Model

- **Offline**: Background job on app open + every 4 hours via service worker
- **Online**: Server-side scheduled job pushes via Supabase Realtime
- **Storage**: Uses existing `inAppNotifications` table in IndexedDB
- **Display**: Notification bell with count badge, inline sparkle icons on dashboard
- **Engagement**: Each insight has an action button ("Fix this", "See details", "Dismiss", "Ask AI")

### Weekly Recap Format

Generated every Sunday using AI with the `get_spending_summary`, `get_budgets`, `get_upcoming_bills`, and `compare_periods` tools:

```
Weekly Financial Recap (Feb 15-22, 2026)

EARNED: $2,450 | SPENT: $1,247 | NET: +$1,203

Highlights:
- Groceries spending down 12% vs last week ($187 → $165)
- New recurring charge detected: Disney+ ($14.99/mo)
- Savings rate this month: 22% (target: 20%) [on track]

Watch Out:
- Dining budget: 78% used with 9 days remaining
- Electricity bill (~$145) expected Tuesday

Streak: 14 days of transaction logging!

[Ask me anything about your finances →]
```

## Natural Language Transaction Entry

### Flow

1. User types or speaks: "Spent $50 at Costco on groceries yesterday"
2. Client sends to `/api/chat` with `create_transaction` tool available
3. AI parses and calls `create_transaction`:
   ```json
   {
     "amount": 50.0,
     "description": "Costco",
     "category": "Food & Dining",
     "date": "2026-02-21",
     "type": "expense"
   }
   ```
4. Client renders confirmation card:
   ```
   ┌──────────────────────────────┐
   │ New Transaction              │
   │ $50.00 · Costco · Groceries │
   │ Feb 21, 2026 · Checking     │
   │                              │
   │   [Confirm]  [Edit]          │
   └──────────────────────────────┘
   ```
5. One tap to save (or edit before saving)
6. AI learns from corrections to improve future parsing

### Voice Input

- **Technology**: Web Speech API (`SpeechRecognition`)
- **Activation**: Microphone button in chat input or FAB quick action
- **Flow**: Voice → text transcription → same NL parsing flow
- **Languages**: Web Speech API supports all major languages, matching our 114 locales
- **Fallback**: If speech recognition unavailable, gracefully hide the mic button

## AI + Encryption Compatibility

### Three-Tier Model

| Encryption         | AI Data Flow                                                          | User Experience                                | Cost                      |
| ------------------ | --------------------------------------------------------------------- | ---------------------------------------------- | ------------------------- |
| **Standard**       | Client → Server → OpenAI → Server → Client                            | Full AI, fastest, simplest                     | Server pays OpenAI        |
| **E2E Encrypted**  | Client decrypts → Server proxies to OpenAI (no body logging) → Client | Full AI, data transits server but isn't stored | Server pays OpenAI        |
| **Zero-Knowledge** | Client decrypts → Client calls OpenAI directly → Client               | Full AI, zero server involvement               | User provides own API key |

### Implementation Details

**Standard Mode**: Default. The server has access to financial data in plaintext (Supabase at-rest encryption protects it). Server composes the full prompt with user data and calls OpenAI.

**E2E Encrypted Mode**: Client decrypts data locally, assembles the FinancialContext snapshot, and sends it to `/api/chat`. The server middleware explicitly does NOT log request bodies on this route. Server adds system prompt + tools and proxies to OpenAI.

**Zero-Knowledge Mode**: The entire OpenAI call happens client-side. The `ChatbotContext` calls OpenAI API directly using the user's own API key (stored in localStorage, never sent to our server). No financial data ever leaves the device except to OpenAI.

## Model Selection & Cost Management

### Recommended Models

| Use Case                | Model       | Cost per 1M tokens (input/output) | Reasoning                                    |
| ----------------------- | ----------- | --------------------------------- | -------------------------------------------- |
| **Chat responses**      | GPT-4o-mini | ~$0.15/$0.60                      | Fast, cheap, good for conversational finance |
| **Complex analysis**    | GPT-4o      | ~$2.50/$10.00                     | Used sparingly for deep financial analysis   |
| **Insights generation** | GPT-4o-mini | ~$0.15/$0.60                      | Background batch processing                  |
| **Weekly recap**        | GPT-4o      | ~$2.50/$10.00                     | One per week per user, worth the quality     |

### Cost Control

- **Token budgets**: Track per-user token usage, alert at 80% of monthly budget
- **Prompt caching**: System prompt + tools (~2000 tokens) cached across requests
- **Tiered limits**: Free users get 5 AI messages/day, Pro users get unlimited
- **Background batching**: Insights and weekly recaps generated in batch during off-peak hours
- **Model routing**: Simple queries → GPT-4o-mini, complex analysis → GPT-4o (cost-adaptive routing)

## Future AI Enhancements (Post-MVP)

1. **Multi-agent orchestration**: Specialized agents for budgeting, investing, debt management, tax planning
2. **On-device inference**: ONNX runtime for real-time categorization without API calls
3. **Predictive actions**: "Based on your patterns, I've prepared your monthly budget for March. [Review]"
4. **Financial coaching**: Long-term goal tracking with milestone celebrations and course corrections
5. **Market integration**: "Your AAPL holdings are up 3% today. Your portfolio is $45,230."
6. **Tax optimization**: "Based on your charitable donations of $2,400, you may be able to itemize deductions this year."

## Sources

- [OpenAI Function Calling Documentation](https://developers.openai.com/api/docs/guides/function-calling/)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs/)
- [Agentic AI in Finance — Moody's](https://www.moodys.com/web/en/us/creditview/blog/agentic-ai-in-financial-services.html)
- [Origin: First SEC-Regulated AI Financial Advisor](https://useorigin.com/resources/blog/introducing-the-first-sec-regulated-ai-financial-advisor)
- [Agentic AI for Finance — CFA Institute](https://rpc.cfainstitute.org/research/the-automation-ahead-content-series/agentic-ai-for-finance)
- [AI Agents in Finance — IBM](https://www.ibm.com/think/topics/ai-agents-in-finance)
- [OpenAI for Developers 2025](https://developers.openai.com/blog/openai-for-developers-2025/)
- [How Tools Are Called in AI Agents — Medium](https://medium.com/@sayalisureshkumbhar/how-tools-are-called-in-ai-agents-complete-2025-guide-with-examples-42dcdfe6ba38)
