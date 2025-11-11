# Budget App - AI Chatbot Guide

Your personal financial assistant powered by OpenAI. Ask questions, get insights, and manage your budget with natural language.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Example Queries](#example-queries)
3. [Capabilities & Limitations](#capabilities--limitations)
4. [Privacy & Security](#privacy--security)
5. [Technical Architecture](#technical-architecture)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### How to Access the Chatbot

**Desktop:**
- Click the **chat bubble icon** in the bottom-right corner
- Or press **`/`** key to open chat
- Or use Command Palette (Cmd/Ctrl+K) → "Ask Chatbot"

**Mobile:**
- Tap the **floating chat button** (bottom-right)
- Or swipe up from bottom
- Or go to More → AI Assistant

### Your First Question

Try asking:
```
"How much did I spend on groceries this month?"
```

The chatbot will:
1. Analyze your transactions
2. Filter by "Groceries" category
3. Sum amounts for current month
4. Respond with clear answer

**Example Response:**
> "You've spent $347.82 on groceries this month (Nov 2025). This is $52.18 under your $400 budget. Your largest grocery transaction was $87.34 at Safeway on Nov 3rd."

---

## Example Queries

### Spending Analysis

**Category Spending:**
```
"How much did I spend on groceries?"
"What's my total dining out spending this week?"
"Show me entertainment expenses from October"
"How much have I spent on gas this year?"
```

**Top Spending:**
```
"What are my top 3 spending categories?"
"Where does most of my money go?"
"What's my biggest expense category this month?"
"Rank my spending categories from highest to lowest"
```

**Transaction Search:**
```
"Show all Starbucks transactions"
"Find transactions over $100"
"What did I buy at Amazon?"
"List all transactions from last week"
```

**Time Comparisons:**
```
"Am I spending more this month than last month?"
"Compare my grocery spending: this month vs last month"
"How does my spending this week compare to average?"
"What's the trend in my dining out expenses?"
```

---

### Budget Status

**Budget Progress:**
```
"Am I under budget for groceries?"
"How much budget do I have left?"
"What's my budget status for dining out?"
"Which budgets am I over?"
```

**Budget Recommendations:**
```
"Should I increase my grocery budget?"
"What budget should I set for utilities?"
"Based on my spending, what's a realistic dining budget?"
```

**Alerts:**
```
"Which budgets am I close to exceeding?"
"Warn me if I'm over budget"
"Will I go over budget if I spend $50 more on dining?"
```

---

### Income Tracking

**Income Analysis:**
```
"How much income did I earn this month?"
"What are my income sources?"
"Show my paycheck history"
"What's my average monthly income?"
```

**Income vs Expenses:**
```
"Am I saving money this month?"
"What's my net savings?"
"How much am I overspending?"
"Compare income to expenses for the year"
```

---

### Trends & Insights

**Spending Patterns:**
```
"What's my average monthly spending?"
"When do I spend the most money?" (day of week, time of month)
"What's my typical weekend spending?"
"Show my spending trend for the last 6 months"
```

**Category Trends:**
```
"Is my grocery spending increasing or decreasing?"
"What's the trend in my entertainment spending?"
"How has my gas spending changed over time?"
```

**Insights:**
```
"What unusual spending do I have this month?"
"Are there any spending patterns I should know about?"
"What can I do to save more money?"
"Where should I cut back?"
```

---

### Loan & Debt Management

**Loan Status:**
```
"How much do I owe on my mortgage?"
"What's my total debt?"
"When will I pay off my car loan?"
"Show me all my loan balances"
```

**Payoff Calculations:**
```
"How much faster can I pay off my mortgage with $200 extra per month?"
"How much interest will I save if I pay $100 extra each month?"
"What happens if I make one $5000 lump sum payment?"
```

---

### Quick Actions (Coming Soon)

**Add Transactions:**
```
"Add $50 coffee expense"
"Record $87.34 grocery purchase at Safeway"
"I just spent $15.50 on lunch"
```

**Create Budgets:**
```
"Set a $300 grocery budget for this month"
"Create $150 dining out budget"
"Update my entertainment budget to $100"
```

**Bulk Operations:**
```
"Add all my recent Starbucks purchases"
"Categorize all Amazon transactions as Shopping"
"Delete all transactions from November 1st"
```

---

## Capabilities & Limitations

### What the Chatbot CAN Do ✅

**Analyze Data:**
- ✅ Sum spending by category, date range, or merchant
- ✅ Calculate averages and trends
- ✅ Compare time periods
- ✅ Identify top spending categories
- ✅ Find specific transactions
- ✅ Check budget status and progress

**Provide Insights:**
- ✅ Spending patterns and trends
- ✅ Budget recommendations
- ✅ Savings opportunities
- ✅ Loan payoff scenarios
- ✅ Financial health summaries

**Answer Questions:**
- ✅ "How much did I spend on X?"
- ✅ "Am I under budget?"
- ✅ "What's my net worth?"
- ✅ "When will I pay off my loan?"

**Future Capabilities (Coming Q1 2026):**
- 🔄 Add/edit/delete transactions
- 🔄 Create/update budgets
- 🔄 Categorize transactions in bulk
- 🔄 Generate custom reports
- 🔄 Set up recurring transactions

---

### What the Chatbot CANNOT Do ❌

**Data Modification (Currently):**
- ❌ Cannot add transactions (coming soon)
- ❌ Cannot edit budgets (coming soon)
- ❌ Cannot delete data (coming soon)
- ❌ Cannot import bank statements

**External Actions:**
- ❌ Cannot access your real bank accounts
- ❌ Cannot make actual payments
- ❌ Cannot transfer money
- ❌ Cannot access external financial data

**Financial Advice:**
- ❌ Not a licensed financial advisor
- ❌ Cannot provide investment advice
- ❌ Cannot give tax advice
- ❌ Cannot recommend specific stocks/funds

**Personal Information:**
- ❌ Cannot remember conversations across sessions (privacy)
- ❌ Cannot share your data with others
- ❌ Cannot learn from other users' data

---

### Accuracy & Limitations

**The chatbot is:**
- ✅ **Accurate** for data within your app
- ✅ **Fast** (1-3 second responses)
- ✅ **Conversational** (understands natural language)
- ✅ **Helpful** (provides context and explanations)

**But may:**
- ⚠️ Misinterpret ambiguous questions
- ⚠️ Struggle with very complex multi-part queries
- ⚠️ Require clarification for vague requests
- ⚠️ Occasionally make calculation errors (rare)

**Best Practices:**
- ✅ Ask one question at a time
- ✅ Be specific (dates, categories, amounts)
- ✅ Verify important numbers manually
- ✅ Rephrase if response seems off

---

## Privacy & Security

### What Data is Shared?

**When you ask a question, the chatbot receives:**
- Your question text
- Relevant transaction data (amounts, categories, dates)
- Budget information (if needed for your question)
- Aggregated spending summaries

**What is NOT shared:**
- Your name or personal information
- Payment methods or bank account numbers
- Passwords or security credentials
- Unrelated transaction details

---

### How Your Data is Protected

**In Transit:**
- ✅ HTTPS encryption for all API calls
- ✅ No data stored on chatbot servers
- ✅ Conversations not saved long-term

**In Storage:**
- ✅ Your transaction data stays on YOUR device
- ✅ Only query-relevant data sent to OpenAI
- ✅ No cross-user data sharing
- ✅ No data used to train AI models

**Privacy Controls:**
1. **Disable Chatbot**: Settings → Privacy → Disable AI Features
2. **Clear History**: Chat window → Menu → Clear History
3. **Review Permissions**: Settings → Privacy → Chatbot Permissions

---

### OpenAI Data Usage

**What OpenAI receives:**
- Your question text
- Relevant financial data (anonymized)
- Conversation context (last 20 messages)

**OpenAI's commitments:**
- Does NOT use your data to train their models
- Does NOT share data with third parties
- Data retained for 30 days for abuse monitoring only

**Read more:** [OpenAI Enterprise Privacy](https://openai.com/enterprise-privacy)

---

### Opt-Out Options

**Don't want to use the chatbot?**

1. **Disable Completely:**
   - Settings → Privacy → AI Features → Off
   - Chatbot icon disappears

2. **Use Read-Only Mode:**
   - Settings → Privacy → Chatbot → Read-Only
   - Can ask questions but cannot modify data (when actions available)

3. **Limit Data Access:**
   - Settings → Privacy → Chatbot → Current Month Only
   - Chatbot only sees current month transactions

---

## Technical Architecture

### System Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  User App   │─────>│  Next.js API │─────>│ OpenAI GPT  │
│ (React UI)  │<─────│   /api/chat  │<─────│  (gpt-4o)   │
└─────────────┘      └──────────────┘      └─────────────┘
       │                     │
       │                     ├─> Context Builder
       │                     ├─> Function Caller
       │                     └─> Response Formatter
       │
       └──> IndexedDB (Local Transaction Data)
```

---

### API Routes

#### `POST /api/chat`

**Purpose:** Handle chatbot conversations

**Request Body:**
```json
{
  "message": "How much did I spend on groceries?",
  "conversationHistory": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"}
  ],
  "context": {
    "currentMonth": "2025-11",
    "budgets": [...],
    "recentTransactions": [...]
  }
}
```

**Response:**
```json
{
  "response": "You've spent $347.82 on groceries this month.",
  "data": {
    "total": 347.82,
    "category": "Groceries",
    "transactionCount": 12
  },
  "suggestions": [
    "Show me my grocery transactions",
    "Compare to last month",
    "Am I under budget?"
  ]
}
```

**Error Handling:**
```json
{
  "error": "Rate limit exceeded. Please try again in 60 seconds.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

### Context Management

**Context Building Strategy:**

```typescript
function buildContext(query: string, userData: UserData) {
  // 1. Detect query intent
  const intent = detectIntent(query);
  // "spending_analysis", "budget_status", "transaction_search"

  // 2. Extract entities
  const entities = extractEntities(query);
  // { category: "Groceries", timeRange: "this month" }

  // 3. Fetch relevant data
  const relevantData = fetchRelevantData(intent, entities, userData);

  // 4. Build context payload (max 8K tokens)
  return {
    query,
    intent,
    entities,
    data: relevantData,
    userPreferences: {
      currency: "CAD",
      dateFormat: "YYYY-MM-DD",
      fiscalYearStart: "01-01"
    }
  };
}
```

**Context Limits:**
- **Max tokens**: 8,000 (GPT-4 context window)
- **Conversation history**: Last 20 messages
- **Transaction data**: Max 100 most relevant transactions
- **Time window**: Last 12 months (unless specified)

---

### Function Calling

**Available Functions:**

```typescript
const availableFunctions = [
  {
    name: "get_spending_by_category",
    description: "Get total spending for a specific category",
    parameters: {
      category: "string",
      startDate: "ISO date",
      endDate: "ISO date"
    }
  },
  {
    name: "get_budget_status",
    description: "Check budget progress for a category",
    parameters: {
      category: "string",
      month: "YYYY-MM"
    }
  },
  {
    name: "search_transactions",
    description: "Search transactions by criteria",
    parameters: {
      query: "string", // merchant name or description
      category: "string (optional)",
      minAmount: "number (optional)",
      maxAmount: "number (optional)"
    }
  },
  {
    name: "calculate_loan_payoff",
    description: "Calculate loan payoff with extra payments",
    parameters: {
      loanId: "string",
      extraPayment: "number"
    }
  }
];
```

**Function Call Example:**

```typescript
// User asks: "How much did I spend on groceries in October?"

// OpenAI generates function call:
{
  "function": "get_spending_by_category",
  "arguments": {
    "category": "Groceries",
    "startDate": "2025-10-01",
    "endDate": "2025-10-31"
  }
}

// App executes function:
const result = await getSpendingByCategory("Groceries", "2025-10-01", "2025-10-31");
// Returns: { total: 347.82, count: 12, transactions: [...] }

// OpenAI generates natural language response:
"You spent $347.82 on groceries in October (12 transactions)."
```

---

### Caching Strategy

**Query Cache (Redis/Memory):**
```
Cache Key: hash(query + context)
TTL: 5 minutes
Invalidation: On data change (transaction add/edit/delete)
```

**Example:**
```typescript
// First query (cache miss)
Q: "How much did I spend on groceries?"
→ Fetch data, call OpenAI, cache result (3s)

// Second query within 5 min (cache hit)
Q: "How much did I spend on groceries?"
→ Return cached result (50ms)

// Data changes (invalidate cache)
User adds grocery transaction
→ Clear grocery-related caches
```

---

### Rate Limiting

**Per User Limits:**
- **Queries per minute**: 20
- **Queries per hour**: 200
- **Queries per day**: 1000

**Enforcement:**
```typescript
const rateLimiter = {
  check: async (userId: string) => {
    const key = `chatbot:${userId}:${currentMinute}`;
    const count = await redis.incr(key);
    await redis.expire(key, 60);

    if (count > 20) {
      throw new RateLimitError("Please wait 60 seconds");
    }
  }
};
```

---

### Error Handling

**Error Types:**

```typescript
enum ChatbotError {
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  OPENAI_API_ERROR = "OPENAI_API_ERROR",
  INVALID_CONTEXT = "INVALID_CONTEXT",
  NETWORK_ERROR = "NETWORK_ERROR",
  INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
}
```

**User-Friendly Messages:**

| Error Code | User Message |
|------------|--------------|
| `RATE_LIMIT_EXCEEDED` | "You're asking questions too quickly. Please wait 60 seconds and try again." |
| `OPENAI_API_ERROR` | "The AI service is temporarily unavailable. Please try again in a few minutes." |
| `INVALID_CONTEXT` | "I couldn't understand your question. Could you rephrase it?" |
| `NETWORK_ERROR` | "No internet connection. The chatbot requires internet to work." |
| `INSUFFICIENT_DATA` | "You don't have enough transaction data yet to answer this question. Add some transactions first!" |

---

### Performance Optimizations

**1. Smart Context Loading:**
```typescript
// Don't load ALL transactions
// Load only what's needed for the query

if (intent === "spending_analysis") {
  // Load aggregated summaries (fast)
  context.spending = await getSpendingSummary();
} else if (intent === "transaction_search") {
  // Load specific transactions (selective)
  context.transactions = await searchTransactions(entities);
}
```

**2. Response Streaming:**
```typescript
// Stream response as it's generated (better UX)
for await (const chunk of openai.streamChat(prompt)) {
  yield chunk; // Show partial response immediately
}
```

**3. Background Context Preloading:**
```typescript
// Preload common contexts on app start
await Promise.all([
  preloadContext("current_month_summary"),
  preloadContext("budget_status"),
  preloadContext("recent_transactions")
]);
```

---

## Troubleshooting

### Chatbot Not Responding

**Symptoms:**
- Message sent but no response
- Spinning loader forever
- "Network error" message

**Solutions:**

**1. Check Internet Connection**
```
Settings → Network → Test Connection
```
- Chatbot requires internet (OpenAI API)
- Transactions work offline, chatbot does not

**2. Clear Chat Cache**
```
Chat window → Menu (⋯) → Clear Cache
```
- Fixes stuck conversations
- Resets context

**3. Check Rate Limits**
```
Wait 60 seconds if you see:
"Too many requests. Please wait."
```
- 20 queries per minute limit
- 200 queries per hour limit

**4. Verify API Key (Developers)**
```
Check environment variables:
OPENAI_API_KEY=sk-...
```

---

### Incorrect or Confusing Responses

**Symptoms:**
- Answer doesn't match your data
- Chatbot misunderstands question
- Response is vague or generic

**Solutions:**

**1. Be More Specific**
```
❌ "How much did I spend?"
✅ "How much did I spend on groceries this month?"

❌ "Am I over budget?"
✅ "Am I over my $300 grocery budget?"

❌ "Show transactions"
✅ "Show all Starbucks transactions from October"
```

**2. Break Down Complex Questions**
```
❌ "Compare my spending to last month and tell me if I'm saving more and which categories increased"

✅ Question 1: "How much did I spend this month vs last month?"
✅ Question 2: "Which categories increased?"
✅ Question 3: "Am I saving more this month?"
```

**3. Verify Data Manually**
```
If chatbot says you spent $500 on groceries:
1. Go to Transactions
2. Filter by "Groceries" category
3. Check total at bottom
4. Report discrepancy if different
```

**4. Provide Feedback**
```
Chat → Message → 👍👎
```
- Helps improve responses
- Flagged for review

---

### Chatbot Disabled or Missing

**Symptoms:**
- No chat icon visible
- "Chatbot disabled" message
- Menu option grayed out

**Solutions:**

**1. Enable in Settings**
```
Settings → Privacy → AI Features → ✅ Enable Chatbot
```

**2. Check Browser Compatibility**
```
Supported:
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

Not Supported:
❌ Internet Explorer
❌ Very old browsers
```

**3. Disable Ad Blockers**
```
Ad blockers may block OpenAI API calls:
1. Whitelist budget app domain
2. Or disable for this site
```

**4. Check Privacy Mode**
```
Some browsers restrict AI in private/incognito mode:
→ Try in regular browsing mode
```

---

### Performance Issues

**Symptoms:**
- Slow responses (>10 seconds)
- Lag when typing
- Chat freezes

**Solutions:**

**1. Reduce Context Size**
```
Settings → Chatbot → Context Size → "Current Month Only"
```
- Sends less data to API
- Faster responses
- Limits historical queries

**2. Clear Conversation History**
```
Chat → Menu → Clear History
```
- Reduces context payload
- Speeds up API calls

**3. Check Network Speed**
```
Settings → Network → Run Speed Test
```
- Chatbot needs decent connection
- 1 Mbps minimum recommended

---

## In-App Help

### Suggested Questions

**When chat opens, show these:**

**Getting Started:**
- "What can you help me with?"
- "How do I use this chatbot?"

**Quick Insights:**
- "How much did I spend this month?"
- "What are my top spending categories?"
- "Am I under budget?"

**Common Actions (Coming Soon):**
- "Add $50 coffee expense"
- "Show my recent transactions"
- "Create a grocery budget"

---

### Contextual Help

**When user is on specific pages:**

**On Dashboard:**
- "Explain my net worth"
- "Why is my spending so high?"
- "What's my biggest expense?"

**On Transactions Page:**
- "Find all Starbucks transactions"
- "Categorize this transaction"
- "Delete duplicates"

**On Budgets Page:**
- "Am I on track for my grocery budget?"
- "Should I adjust my dining budget?"
- "Which budgets should I create?"

**On Loans Page:**
- "How much faster can I pay off my mortgage?"
- "What if I pay $200 extra per month?"
- "When will I be debt-free?"

---

## Developer Notes

### Testing the Chatbot

**Unit Tests:**
```typescript
describe("Chatbot Context Builder", () => {
  it("should extract category from query", () => {
    const result = extractEntities("How much did I spend on groceries?");
    expect(result.category).toBe("Groceries");
  });
});
```

**Integration Tests:**
```typescript
describe("Chatbot API", () => {
  it("should return spending summary", async () => {
    const response = await POST("/api/chat", {
      message: "How much did I spend this month?"
    });
    expect(response.data.total).toBeGreaterThan(0);
  });
});
```

**E2E Tests:**
```typescript
test("Chatbot answers spending question", async ({ page }) => {
  await page.goto("/budget-app");
  await page.click("[data-testid=chat-button]");
  await page.fill("[data-testid=chat-input]", "How much did I spend on groceries?");
  await page.click("[data-testid=send-button]");

  const response = await page.textContent("[data-testid=chat-response]");
  expect(response).toContain("groceries");
});
```

---

### Monitoring & Analytics

**Track these metrics:**

1. **Usage Metrics:**
   - Queries per day/week/month
   - Unique users
   - Average queries per session
   - Most common query types

2. **Performance Metrics:**
   - Average response time
   - API error rate
   - Cache hit rate
   - Rate limit hits

3. **Quality Metrics:**
   - User feedback (thumbs up/down)
   - Query rephrases (user tries multiple times)
   - Abandonment rate (user leaves mid-conversation)

**Dashboard:**
```
PostHog → Dashboards → Chatbot Metrics
```

---

## Future Enhancements

### Planned Features (Q1 2026)

**1. Action Support:**
- Add/edit/delete transactions via chat
- Create/update budgets
- Categorize transactions in bulk

**2. Advanced Insights:**
- Anomaly detection ("You spent 3x more on dining this week")
- Predictive analytics ("You'll overspend by $50 if you continue at this rate")
- Recommendations ("Consider reducing dining budget by $100")

**3. Multi-Language Support:**
- French, Spanish, German
- Auto-detect user language
- Seamless switching

**4. Voice Input:**
- Speak questions instead of typing
- Voice responses (text-to-speech)
- Hands-free mode

**5. Scheduled Reports:**
- "Send me a weekly spending summary every Monday"
- "Alert me when I'm 80% through any budget"
- "Monthly net worth report on the 1st"

---

*Last updated: November 9, 2025*
*OpenAI API: gpt-4o*
*Version: 1.0 (Read-only mode)*
