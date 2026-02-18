# Budget Chatbot Implementation Guide

**Status**: Core Functionality Complete ✅
**Last Updated**: November 9, 2025
**Version**: 1.0

---

## 📋 Overview

The Budget App chatbot is an AI-powered financial assistant that helps users understand their spending, budgets, and financial situation through natural language conversations. Built with OpenAI GPT-4 and implementing comprehensive privacy controls.

### Key Features

✅ **Natural Language Queries**: "How much did I spend on groceries this month?"
✅ **Real-Time Data Access**: Transactions, budgets, loans, accounts
✅ **Privacy-First Design**: Opt-in required, configurable access levels
✅ **Function Calling**: OpenAI function calling for precise data retrieval
✅ **Conversation History**: Local storage with configurable retention (7/30/forever days)
✅ **GDPR Compliant**: Full implementation of user rights and privacy controls

---

## 🏗️ Architecture

### Component Overview

```
User Interface (Chatbot.tsx)
    ↓
ChatbotContext (React Context)
    ↓
OpenAI Service (chatbot-openai-service.ts)
    ↓
Data Access Layer (chatbot-data-access.ts)
    ↓
IndexedDB (Dexie.js)
```

### File Structure

```
src/
├── components/budget/
│   ├── Chatbot.tsx                      # Main chatbot UI component
│   └── ChatbotOptInDialog.tsx           # First-time opt-in dialog
├── contexts/
│   └── ChatbotContext.tsx               # React context for state management
├── lib/
│   ├── chatbot-data-access.ts           # Data access layer with privacy checks
│   ├── chatbot-openai-service.ts        # OpenAI API wrapper with function calling
│   ├── chatbot-prompts.ts               # System prompts for different modes
│   ├── budget-privacy-settings.ts       # Privacy settings (extended for chatbot)
│   └── budget-analytics.ts              # Analytics tracking
└── docs/
    ├── CHATBOT_IMPLEMENTATION.md        # This file
    └── CHATBOT_GDPR_COMPLIANCE.md       # GDPR compliance documentation
```

---

## 📦 Implementation Details

### 1. Data Access Layer (`chatbot-data-access.ts`)

**Purpose**: Provides privacy-controlled access to user's financial data.

**Key Functions**:

- `checkChatbotPermission()` - Verify chatbot is enabled
- `checkChatbotActionPermission()` - Verify full-access mode for actions
- `getSpendingSummary()` - Get spending totals and category breakdowns
- `getBudgetStatus()` - Get budget limits, spending, and overspend status
- `getAccountSummaries()` - Get account balances and transaction counts
- `getLoanSummaries()` - Get loan balances and payment schedules
- `searchTransactions()` - Search transactions by description/category
- `getFinancialSummary()` - High-level overview of all financial data

**Privacy Features**:

- All functions check `isChatbotEnabled()` before returning data
- Only returns aggregated/summarized data when possible
- Never exposes raw account numbers or sensitive identifiers
- Respects `chatbotDataAccess` level (read-only vs full-access)

**Example Usage**:

```typescript
import { getSpendingSummary } from "@/lib/chatbot-data-access";

const summary = await getSpendingSummary({
  startDate: new Date("2025-11-01"),
  endDate: new Date("2025-11-30"),
  category: "Groceries",
});

console.log(summary);
// {
//   totalSpent: 450.00,
//   totalIncome: 0,
//   netCashFlow: -450.00,
//   transactionCount: 12,
//   categoryBreakdown: [
//     { category: 'Groceries', amount: 450.00, count: 12 }
//   ]
// }
```

---

### 2. OpenAI Service (`chatbot-openai-service.ts`)

**Purpose**: Handles communication with OpenAI GPT-4 API using function calling.

**Key Features**:

- **Function Calling**: Defines 7 functions that GPT-4 can call to access data
- **Automatic Execution**: Executes function calls and returns results to GPT-4
- **Multi-Turn**: Supports follow-up questions with conversation context
- **Error Handling**: Graceful error recovery with user-friendly messages

**Available Functions**:

1. `getSpendingSummary` - Spending analysis by date range/category
2. `getBudgetStatus` - Budget progress and overspend detection
3. `getAccountSummaries` - Account balances and activity
4. `getLoanSummaries` - Loan balances and payment schedules
5. `getCategories` - List of all transaction categories
6. `searchTransactions` - Search transactions by keyword
7. `getFinancialSummary` - High-level financial overview

**Example Usage**:

```typescript
import { chatWithAssistant } from "@/lib/chatbot-openai-service";

const response = await chatWithAssistant({
  messages: [{ role: "user", content: "How much did I spend on groceries this month?" }],
  isFirstTime: false,
  hasError: false,
});

console.log(response);
// {
//   response: "You spent $450.00 on groceries this month across 12 transactions...",
//   functionCalls: [
//     {
//       name: 'getSpendingSummary',
//       args: { startDate: '2025-11-01', endDate: '2025-11-30', category: 'Groceries' },
//       result: { totalSpent: 450.00, ... }
//     }
//   ]
// }
```

---

### 3. System Prompts (`chatbot-prompts.ts`)

**Purpose**: Defines AI assistant behavior for different modes and contexts.

**Available Prompts**:

- `FINANCIAL_ASSISTANT_PROMPT` - Read-only mode (default)
- `FINANCIAL_ASSISTANT_FULL_ACCESS_PROMPT` - Full-access mode (can perform actions)
- `ONBOARDING_PROMPT` - First-time user greeting
- `ERROR_RECOVERY_PROMPT` - Error recovery and troubleshooting

**Dynamic Prompt Selection**:

```typescript
import { getSystemPrompt } from "@/lib/chatbot-prompts";

const prompt = getSystemPrompt({
  accessLevel: "read-only",
  isFirstTime: true,
  hasError: false,
});
// Returns ONBOARDING_PROMPT for first-time users
```

**Customization**:
Edit prompts in `chatbot-prompts.ts` to:

- Change assistant personality
- Add domain-specific knowledge
- Customize response formatting
- Add budget-specific rules

---

### 4. React Context (`ChatbotContext.tsx`)

**Purpose**: Manages chatbot state across the application.

**State Management**:

- `messages: ChatMessage[]` - Conversation history
- `isLoading: boolean` - Loading state during API calls
- `error: string | null` - Error messages
- `isEnabled: boolean` - Whether chatbot is enabled

**Key Methods**:

- `sendMessage(content: string)` - Send user message and get AI response
- `clearHistory()` - Delete all conversation history
- `retryLastMessage()` - Retry last failed message

**Persistence**:

- Saves messages to `localStorage` automatically
- Respects retention policy (7 days, 30 days, or forever)
- Auto-deletes expired conversations on load

**Example Usage**:

```typescript
import { useChatbot } from '@/contexts/ChatbotContext';

function MyChatComponent() {
  const { messages, sendMessage, clearHistory } = useChatbot();

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => sendMessage('Hello!')}>Send</button>
      <button onClick={clearHistory}>Clear</button>
    </div>
  );
}
```

---

### 5. Privacy Controls

**Opt-In Dialog** (`ChatbotOptInDialog.tsx`):

- Shown on first chatbot access
- Explains data usage and OpenAI processing
- Privacy controls: Data Access (read-only/full-access), Retention (7/30/forever)
- GDPR compliance notice

**Settings Integration** (`settings-privacy-panel.tsx`):

- Chatbot section in Privacy settings
- Master toggle (enable/disable)
- Data access level selector
- Conversation retention selector

**Privacy Settings** (`budget-privacy-settings.ts`):

```typescript
interface PrivacySettings {
  enableChatbot: boolean; // Master switch (default: false)
  chatbotDataAccess: "read-only" | "full-access"; // Access level (default: read-only)
  chatbotConversationRetention: 7 | 30 | "forever"; // Retention (default: 7 days)
}
```

---

## 🚀 Getting Started

### Prerequisites

1. **OpenAI API Key**:

   ```bash
   # Add to .env.local
   NEXT_PUBLIC_OPENAI_API_KEY=sk-xxx
   ```

2. **Install Dependencies**:
   ```bash
   npm install openai
   ```

### Integration Steps

**Step 1: Add ChatbotProvider to Layout**

```typescript
// src/app/budget-app/layout.tsx
import { ChatbotProvider } from '@/contexts/ChatbotContext';

export default function BudgetAppLayout({ children }) {
  return (
    <ChatbotProvider>
      {children}
    </ChatbotProvider>
  );
}
```

**Step 2: Add Chatbot Component to Page**

```typescript
// src/app/budget-app/chatbot/page.tsx
import { Chatbot } from '@/components/budget/Chatbot';

export default function ChatbotPage() {
  return (
    <div className="h-screen">
      <Chatbot />
    </div>
  );
}
```

**Step 3: Test Chatbot**

1. Navigate to `/budget-app/chatbot`
2. See opt-in dialog (first time)
3. Accept and configure privacy settings
4. Start asking questions!

---

## 💬 Example Queries

### Spending Analysis

```
User: "How much did I spend on groceries this month?"
AI: "You spent $450.00 on groceries this month across 12 transactions.
     That's about $15 per day. Your top grocery stores were:
     • Walmart: $180
     • Trader Joe's: $150
     • Whole Foods: $120"
```

### Budget Status

```
User: "Am I over budget in any categories?"
AI: "You're over budget in 2 categories:
     • Dining: $320 spent / $200 budget (60% over) ⚠️
     • Entertainment: $150 spent / $100 budget (50% over) ⚠️

     You're doing great in Groceries ($450 / $500 budget, 90%)"
```

### Transaction Search

```
User: "Show me my coffee purchases from last week"
AI: "Here are your coffee purchases from last week:
     • Nov 2: Starbucks - $5.50
     • Nov 4: Blue Bottle - $6.00
     • Nov 5: Starbucks - $5.50
     • Nov 7: Peet's Coffee - $4.75

     Total: $21.75 (4 purchases)"
```

### Financial Overview

```
User: "What's my financial situation?"
AI: "Here's your financial overview:

     **Accounts**
     • Total balance: $15,230.00 across 3 accounts
     • Last transaction: Yesterday

     **Budgets**
     • Total budgeted: $2,500/month
     • Spent so far: $1,850 (74%)
     • 2 budgets over limit

     **Loans**
     • Total remaining: $18,500
     • Monthly payments: $450"
```

---

## 🔧 Configuration

### Changing AI Model

Edit `chatbot-openai-service.ts`:

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview", // Change to 'gpt-3.5-turbo' for faster/cheaper
  // ...
});
```

### Adjusting Context Window

Edit `ChatbotContext.tsx`:

```typescript
const MAX_CONTEXT_MESSAGES = 20; // Increase for longer memory, decrease for performance
```

### Custom System Prompts

Edit `chatbot-prompts.ts` to customize assistant behavior:

```typescript
export const FINANCIAL_ASSISTANT_PROMPT = `
You are a strict financial advisor...
[Your custom prompt here]
`;
```

---

## 📊 Analytics

The chatbot tracks the following events (see `budget-analytics.ts`):

- `chatbot_query` - User sends a message
  - Properties: `success`, `count` (function calls), `errorType`
- `chatbot_action` - User performs action (clear history, etc.)
  - Properties: `action`, `success`

**View Analytics**: PostHog dashboard → Chatbot events

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] **Opt-In Flow**
  - [ ] Dialog appears on first access
  - [ ] Can select read-only vs full-access
  - [ ] Can select retention period
  - [ ] Settings saved correctly

- [ ] **Basic Queries**
  - [ ] "How much did I spend this month?" works
  - [ ] "Am I over budget?" works
  - [ ] "Show me my account balances" works

- [ ] **Privacy**
  - [ ] Cannot use when disabled
  - [ ] Respects read-only mode
  - [ ] Conversation expires per retention policy

- [ ] **Error Handling**
  - [ ] Graceful error messages
  - [ ] Retry works
  - [ ] No data leakage in errors

### Automated Testing

```typescript
// Example test (Jest + React Testing Library)
import { render, screen, waitFor } from "@testing-library/react";
import { ChatbotProvider, useChatbot } from "@/contexts/ChatbotContext";

test("sends message and gets response", async () => {
  const { result } = renderHook(() => useChatbot(), {
    wrapper: ChatbotProvider,
  });

  await act(async () => {
    await result.current.sendMessage("Hello");
  });

  await waitFor(() => {
    expect(result.current.messages).toHaveLength(2); // User + AI
    expect(result.current.messages[1].role).toBe("assistant");
  });
});
```

---

## 🐛 Troubleshooting

### "OpenAI API key not found"

**Solution**: Add `NEXT_PUBLIC_OPENAI_API_KEY` to `.env.local`

### "Chatbot is disabled"

**Solution**: Enable in Settings → Privacy → Budget Chatbot

### "Failed to get response from chatbot"

**Check**:

1. OpenAI API key is valid
2. API quota not exceeded
3. Network connection stable
4. Browser console for detailed errors

### Conversations not persisting

**Check**:

1. `localStorage` not disabled in browser
2. Retention policy not set to expired date
3. Browser not in private/incognito mode

---

## 🔜 Future Enhancements

**Planned Features** (not yet implemented):

- [ ] **Chatbot Actions** - Add transactions, create budgets via chat
- [ ] **Multi-Turn Context** - Better conversation memory
- [ ] **Voice Input** - Speech-to-text for queries
- [ ] **Suggested Questions** - AI-generated follow-up questions
- [ ] **Conversation Export** - Export chat history as PDF/JSON
- [ ] **Conversation Search** - Search past conversations
- [ ] **Budget Recommendations** - Proactive budget suggestions
- [ ] **Spending Predictions** - "You'll likely spend $X this month"

---

## 📚 Resources

- **OpenAI Function Calling**: https://platform.openai.com/docs/guides/function-calling
- **GPT-4 Best Practices**: https://platform.openai.com/docs/guides/gpt-best-practices
- **GDPR Compliance**: `docs/CHATBOT_GDPR_COMPLIANCE.md`
- **Privacy Settings**: `src/lib/budget-privacy-settings.ts`

---

**Last Updated**: November 9, 2025
**Maintained By**: Budget App Development Team
**Version**: 1.0 (Core Implementation Complete)
