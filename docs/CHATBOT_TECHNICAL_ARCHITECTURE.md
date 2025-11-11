# Chatbot Technical Architecture

**Status**: Planning / Implementation Guide
**Last Updated**: November 9, 2025
**Version**: 1.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Design](#component-design)
- [API Routes](#api-routes)
- [Data Flow](#data-flow)
- [OpenAI Integration](#openai-integration)
- [Security & Privacy](#security--privacy)
- [Implementation Roadmap](#implementation-roadmap)
- [Testing Strategy](#testing-strategy)

---

## Overview

The Budget App Chatbot is a **local-first AI assistant** that helps users interact with their financial data using natural language. It combines client-side data processing with optional OpenAI integration for advanced natural language understanding.

### Design Principles

1. **Privacy First**: All sensitive data stays in IndexedDB, only cleaned data sent to OpenAI
2. **Progressive Enhancement**: Works offline with basic NLP, enhanced with AI when online
3. **Contextual**: Maintains conversation history for multi-turn interactions
4. **Actionable**: Can perform operations (add transactions, create budgets) via function calling
5. **Accessible**: Keyboard navigation, screen reader support, high contrast mode

### Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI**: shadcn/ui (Radix UI primitives)
- **AI**: OpenAI GPT-4o-mini (function calling enabled)
- **Storage**: IndexedDB (Dexie.js) for conversation history
- **State**: React Context + local component state
- **API**: Next.js API Routes (App Router)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ChatWindow.tsx (shadcn Dialog + ScrollArea)            │
│  - Message list (user/assistant)                        │
│  - Input field (Textarea with autocomplete)             │
│  - Suggested questions                                  │
│  - Action buttons (clear, export, settings)             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│            ChatContext (React Context)                   │
│  - messages: Message[]                                  │
│  - sendMessage(text: string)                            │
│  - executeAction(action: ChatAction)                    │
│  - clearHistory()                                       │
│  - exportConversation()                                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│             Client-Side Data Layer                       │
│  BudgetDataProvider.ts                                  │
│  - getTransactions(filter: DateRange)                   │
│  - getBudgetStatus(categoryId?: string)                 │
│  - getSpendingTrends(period: string)                    │
│  - addTransaction(data: Transaction)                    │
│  - createBudget(data: Budget)                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│                  IndexedDB (Dexie)                       │
│  - transactions table (source of truth)                 │
│  - budgets table                                        │
│  - chatHistory table (new)                              │
└─────────────────────────────────────────────────────────┘

                       ↓ (If AI Features enabled)

┌─────────────────────────────────────────────────────────┐
│            Next.js API Route                            │
│  /api/chat/message                                      │
│  - Receives: user message + conversation context        │
│  - Sanitizes transaction data (remove PII)              │
│  - Sends to OpenAI with function definitions            │
│  - Handles function calls (get_spending, etc.)          │
│  - Returns: assistant message + any function results    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│                  OpenAI API                             │
│  Model: gpt-4o-mini                                     │
│  - Function calling enabled                             │
│  - Streaming responses (for better UX)                  │
│  - Context window: 128K tokens                          │
└─────────────────────────────────────────────────────────┘
```

---

## Component Design

### 1. ChatWindow.tsx (Main UI Component)

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, MoreVertical } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  functionCall?: {
    name: string;
    arguments: any;
    result?: any;
  };
}

export function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isLoading } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your spending, budgets, or finances..."
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Suggested Questions (if empty conversation) */}
        {messages.length === 0 && <SuggestedQuestions />}
      </DialogContent>
    </Dialog>
  );
}
```

### 2. ChatContext.tsx (State Management)

```tsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { db } from '@/lib/budget-db';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAIFeaturesEnabled } = usePrivacySettings();

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (isAIFeaturesEnabled) {
        // Call OpenAI API via Next.js route
        const response = await fetch('/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            conversationHistory: messages.slice(-10), // Last 10 messages for context
          }),
        });

        const data = await response.json();

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Save to IndexedDB for persistence
        await db.chatHistory.add(userMessage);
        await db.chatHistory.add(assistantMessage);
      } else {
        // Local-only mode (basic keyword matching)
        const response = await handleLocalQuery(text);
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('[ChatContext] Error sending message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isAIFeaturesEnabled]);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    await db.chatHistory.clear();
  }, []);

  return (
    <ChatContext.Provider value={{ messages, sendMessage, clearHistory, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
```

### 3. BudgetDataProvider.ts (Data Access Layer)

```typescript
import { db } from '@/lib/budget-db';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

/**
 * Sanitizes transaction data for OpenAI
 * Removes PII, account numbers, full merchant names
 */
export function sanitizeTransactions(transactions: Transaction[]): any[] {
  return transactions.map(t => ({
    amount: t.amount,
    category: t.category,
    date: format(t.date, 'yyyy-MM-dd'),
    // Clean merchant name (remove trailing numbers, account info)
    merchant: cleanMerchantName(t.description),
    type: t.type, // 'income' | 'expense' | 'transfer'
  }));
}

function cleanMerchantName(raw: string): string {
  // Remove common PII patterns
  return raw
    .replace(/\d{4,}/g, '') // Remove long number sequences
    .replace(/[A-Z]{2}\d+/g, '') // Remove state codes + numbers
    .replace(/#\d+/g, '') // Remove transaction IDs
    .trim()
    .substring(0, 50); // Max 50 chars
}

/**
 * Get spending data for chatbot queries
 */
export async function getSpendingData(params: {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  merchant?: string;
}) {
  const { startDate, endDate, category, merchant } = params;

  let query = db.transactions.where('type').equals('expense');

  if (startDate && endDate) {
    query = query.filter(t => t.date >= startDate && t.date <= endDate);
  }

  if (category) {
    query = query.filter(t => t.category === category);
  }

  if (merchant) {
    query = query.filter(t =>
      t.description.toLowerCase().includes(merchant.toLowerCase())
    );
  }

  const transactions = await query.toArray();
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions: sanitizeTransactions(transactions),
    total,
    count: transactions.length,
    byCategory: groupByCategory(transactions),
  };
}

/**
 * Get budget status for chatbot
 */
export async function getBudgetStatus(categoryId?: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  let budgets = await db.budgets.toArray();

  if (categoryId) {
    budgets = budgets.filter(b => b.categoryId === categoryId);
  }

  const status = await Promise.all(budgets.map(async (budget) => {
    const spent = await db.transactions
      .where('category').equals(budget.categoryId)
      .filter(t => t.date >= monthStart && t.date <= monthEnd)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      category: budget.categoryId,
      budgetAmount: budget.amount,
      spent,
      remaining: budget.amount - spent,
      percentUsed: (spent / budget.amount) * 100,
      status: spent > budget.amount ? 'over' : spent > budget.amount * 0.9 ? 'warning' : 'ok',
    };
  }));

  return status;
}
```

---

## API Routes

### /api/chat/message (POST)

**File**: `src/app/api/chat/message/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSpendingData, getBudgetStatus } from '@/lib/budget-data-provider';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define available functions for OpenAI function calling
const functions = [
  {
    name: 'get_spending',
    description: 'Get spending data for a specific time period and/or category',
    parameters: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year'],
          description: 'Time period to query',
        },
        category: {
          type: 'string',
          description: 'Spending category (e.g., "Groceries", "Dining Out")',
        },
        merchant: {
          type: 'string',
          description: 'Merchant name to filter by',
        },
      },
      required: ['period'],
    },
  },
  {
    name: 'get_budget_status',
    description: 'Get current budget status and progress',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Budget category (optional, returns all if not provided)',
        },
      },
    },
  },
  // Add more functions: add_transaction, create_budget, search_transactions
];

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    // Build conversation messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a helpful personal finance assistant for Budget App.
        Help users understand their spending, budgets, and financial patterns.
        Use the provided functions to access user data.
        Be friendly, concise, and actionable.
        Always show amounts in USD with 2 decimal places.`,
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call OpenAI with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      functions,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = response.choices[0].message;

    // Handle function calls
    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

      let functionResult;

      switch (functionName) {
        case 'get_spending':
          functionResult = await getSpendingData(parsePeriod(functionArgs.period));
          break;
        case 'get_budget_status':
          functionResult = await getBudgetStatus(functionArgs.category);
          break;
        default:
          functionResult = { error: 'Unknown function' };
      }

      // Send function result back to OpenAI for final response
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: null,
            function_call: assistantMessage.function_call,
          },
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResult),
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return NextResponse.json({
        message: secondResponse.choices[0].message.content,
        functionCalled: functionName,
        functionResult,
      });
    }

    return NextResponse.json({
      message: assistantMessage.content,
    });

  } catch (error) {
    console.error('[API] Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

function parsePeriod(period: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  switch (period) {
    case 'today':
      return { startDate: startOfDay(now), endDate: endOfDay(now) };
    case 'this_month':
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    // ... implement other periods
    default:
      return { startDate: startOfMonth(now), endDate: now };
  }
}
```

---

## Data Flow

### Query Flow (Read-only)

```
User types "How much did I spend on groceries this month?"
  ↓
ChatContext.sendMessage()
  ↓
POST /api/chat/message
  ↓
OpenAI function call: get_spending({ period: "this_month", category: "Groceries" })
  ↓
BudgetDataProvider.getSpendingData()
  ↓
Query IndexedDB (transactions table)
  ↓
Sanitize data (remove PII)
  ↓
Return to OpenAI
  ↓
OpenAI generates natural language response
  ↓
Assistant message displayed to user
```

### Action Flow (Write operations)

```
User types "Add $50 grocery expense from Walmart"
  ↓
OpenAI function call: add_transaction({ amount: 50, category: "Groceries", description: "Walmart" })
  ↓
Validation (amount > 0, category exists)
  ↓
db.transactions.add({ ... })
  ↓
IndexedDB write
  ↓
Confirmation message: "Added $50 grocery transaction. Anything else?"
```

---

## OpenAI Integration

### Function Definitions

```typescript
// Complete function catalog for chatbot

const chatbotFunctions = [
  {
    name: 'get_spending',
    description: 'Get spending data for a specific time period and/or category',
    parameters: { /* see above */ },
  },
  {
    name: 'get_budget_status',
    description: 'Get current budget status and progress',
    parameters: { /* see above */ },
  },
  {
    name: 'add_transaction',
    description: 'Add a new transaction (expense or income)',
    parameters: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Transaction amount' },
        category: { type: 'string', description: 'Transaction category' },
        description: { type: 'string', description: 'Transaction description' },
        type: { type: 'string', enum: ['income', 'expense'], description: 'Transaction type' },
        date: { type: 'string', description: 'Transaction date (YYYY-MM-DD)' },
      },
      required: ['amount', 'category', 'type'],
    },
  },
  {
    name: 'create_budget',
    description: 'Create a new budget for a category',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Budget category' },
        amount: { type: 'number', description: 'Budget amount' },
        period: { type: 'string', enum: ['monthly', 'weekly', 'yearly'], description: 'Budget period' },
      },
      required: ['category', 'amount', 'period'],
    },
  },
  {
    name: 'search_transactions',
    description: 'Search for transactions matching criteria',
    parameters: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Search keyword (merchant, description)' },
        minAmount: { type: 'number', description: 'Minimum amount' },
        maxAmount: { type: 'number', description: 'Maximum amount' },
        category: { type: 'string', description: 'Category filter' },
      },
    },
  },
];
```

### Cost Optimization

**Estimated Costs** (GPT-4o-mini pricing as of Nov 2025):
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Average Query**:
- Input tokens: ~500 (system prompt + conversation history + user message)
- Output tokens: ~150 (assistant response)
- **Cost per query**: ~$0.0001 (negligible)

**Monthly Cost** (1000 queries/month):
- 1000 queries × $0.0001 = **$0.10/month**

**Optimization Strategies**:
1. **Limit conversation history**: Only send last 10 messages (~300 tokens vs 3000 for full history)
2. **Use streaming**: Display responses as they arrive (better UX, same cost)
3. **Cache system prompt**: Reduce input tokens by 40%
4. **Sanitize data**: Send only necessary fields (no full merchant names)

---

## Security & Privacy

### Data Sanitization

**What's NEVER sent to OpenAI**:
- Full merchant names (cleaned to generic labels)
- Account numbers
- Bank names
- Social Security numbers
- Email addresses
- Phone numbers
- Street addresses
- Credit card details

**What IS sent** (example):
```json
{
  "transactions": [
    {
      "amount": 47.50,
      "category": "Groceries",
      "date": "2025-11-08",
      "merchant": "Walmart",  // Cleaned from "WALMART SUPERCENTER #1234 TX"
      "type": "expense"
    }
  ]
}
```

### Privacy Controls

**User Controls** (Settings → Privacy & AI Controls):
1. **AI Features Master Switch**: Disables OpenAI entirely (local-only mode)
2. **Conversation History Toggle**: Save/clear chat history
3. **Data Export**: Export all chat history as JSON
4. **Delete All Data**: Nuclear option - clear all transactions + chat

**Developer Controls** (Environment Variables):
```env
# .env.local
OPENAI_API_KEY=sk-...  # Required for AI features
OPENAI_ORG_ID=org-...  # Optional: organization ID
CHATBOT_MAX_TOKENS=500  # Max response length
CHATBOT_CONTEXT_WINDOW=10  # Number of messages in context
```

### Rate Limiting

Prevent abuse and control costs:

```typescript
// src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each user to 100 requests per window
  message: 'Too many chat requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

## Implementation Roadmap

### Phase 1: Basic Infrastructure (Week 1)

**Tasks**:
- [ ] Create ChatWindow.tsx component
- [ ] Implement ChatContext for state management
- [ ] Add chatHistory table to Dexie schema
- [ ] Create /api/chat/message route (skeleton)
- [ ] Integrate OpenAI SDK
- [ ] Test basic request/response flow

**Deliverables**:
- Working chat UI (can send/receive messages)
- Messages saved to IndexedDB
- Basic OpenAI integration (no function calling yet)

### Phase 2: Data Access Layer (Week 2)

**Tasks**:
- [ ] Implement BudgetDataProvider.ts
- [ ] Create data sanitization functions
- [ ] Write unit tests for data access
- [ ] Implement getSpendingData()
- [ ] Implement getBudgetStatus()
- [ ] Add error handling

**Deliverables**:
- Sanitized data access layer
- 80%+ test coverage on data functions
- Privacy validation (no PII leaked)

### Phase 3: Function Calling (Week 3)

**Tasks**:
- [ ] Define all OpenAI functions (get_spending, add_transaction, etc.)
- [ ] Implement function routing in API route
- [ ] Add validation for function parameters
- [ ] Handle function call errors gracefully
- [ ] Write E2E tests for each function

**Deliverables**:
- 5+ working functions (read + write operations)
- Comprehensive error messages
- E2E test coverage for critical flows

### Phase 4: Conversation Management (Week 4)

**Tasks**:
- [ ] Implement conversation history persistence
- [ ] Add "Clear History" feature
- [ ] Export conversation to text file
- [ ] Suggested questions UI
- [ ] Multi-turn conversation support (context retention)

**Deliverables**:
- Full conversation history
- Export feature working
- Suggested questions populated from analytics

### Phase 5: Polish & Launch (Week 5)

**Tasks**:
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Performance optimization (streaming, caching)
- [ ] Error message improvements
- [ ] User documentation (chatbot-guide.md) ✅ DONE
- [ ] Developer documentation (this file) ✅ DONE
- [ ] Privacy review with legal team
- [ ] Load testing (100 concurrent users)

**Deliverables**:
- WCAG 2.2 AA compliant chatbot
- Documentation published
- Privacy sign-off
- Production-ready

---

## Testing Strategy

### Unit Tests

**Data Access Layer** (`src/lib/budget-data-provider.test.ts`):
```typescript
describe('getSpendingData', () => {
  it('should return total spending for this month', async () => {
    const result = await getSpendingData({ period: 'this_month' });
    expect(result.total).toBeGreaterThan(0);
    expect(result.count).toBeGreaterThan(0);
  });

  it('should sanitize merchant names', async () => {
    const result = await getSpendingData({ period: 'today' });
    result.transactions.forEach(t => {
      expect(t.merchant).not.toMatch(/\d{4,}/); // No long numbers
      expect(t.merchant.length).toBeLessThanOrEqual(50); // Max 50 chars
    });
  });
});
```

### Integration Tests

**API Route** (`src/app/api/chat/message/route.test.ts`):
```typescript
describe('/api/chat/message', () => {
  it('should handle basic spending query', async () => {
    const response = await POST({
      json: async () => ({
        message: "How much did I spend on groceries?",
        conversationHistory: [],
      }),
    });

    const data = await response.json();
    expect(data.message).toContain('$');
    expect(data.functionCalled).toBe('get_spending');
  });

  it('should reject invalid function calls', async () => {
    // Mock OpenAI to return invalid function
    const response = await POST({
      json: async () => ({
        message: "Delete all my data",
        conversationHistory: [],
      }),
    });

    const data = await response.json();
    expect(data.error).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

**Chatbot Interaction** (`tests/chatbot.spec.ts`):
```typescript
test.describe('Chatbot', () => {
  test('should answer spending query', async ({ page }) => {
    await page.goto('/budget-app');

    // Open chatbot
    await page.click('[aria-label="Open chat"]');

    // Type query
    await page.fill('textarea[placeholder*="Ask"]', 'How much did I spend this month?');
    await page.press('textarea', 'Enter');

    // Wait for response
    await page.waitForSelector('text=/You spent.*this month/');

    // Verify response contains dollar amount
    const response = await page.locator('[role="assistant"] >> nth=0').textContent();
    expect(response).toMatch(/\$\d+\.\d{2}/);
  });

  test('should handle function calling (add transaction)', async ({ page }) => {
    await page.goto('/budget-app');
    await page.click('[aria-label="Open chat"]');

    await page.fill('textarea', 'Add $50 grocery expense');
    await page.press('textarea', 'Enter');

    // Wait for confirmation
    await page.waitForSelector('text=/Added.*\$50.*transaction/');

    // Verify transaction appears in database
    const transactions = await page.evaluate(async () => {
      const { db } = await import('@/lib/budget-db');
      return db.transactions.where('amount').equals(50).toArray();
    });

    expect(transactions.length).toBeGreaterThan(0);
  });
});
```

### Privacy Tests

**Data Sanitization** (`tests/privacy.test.ts`):
```typescript
describe('Privacy - Data Sanitization', () => {
  it('should remove PII from transaction descriptions', () => {
    const raw = "WALMART SUPERCENTER #1234 TX 123 MAIN ST 75001";
    const cleaned = cleanMerchantName(raw);

    expect(cleaned).toBe("WALMART SUPERCENTER");
    expect(cleaned).not.toContain("1234");
    expect(cleaned).not.toContain("MAIN ST");
  });

  it('should never send account numbers to OpenAI', async () => {
    const spy = jest.spyOn(global, 'fetch');

    await sendMessage("How much did I spend?");

    const requestBody = JSON.parse(spy.mock.calls[0][1].body);
    expect(JSON.stringify(requestBody)).not.toMatch(/\d{10,}/); // No 10+ digit sequences
  });
});
```

---

## Performance Metrics

### Target Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to First Response** | <2s | p95 from message send to first token |
| **Streaming Delay** | <100ms | Time between tokens |
| **Function Call Latency** | <500ms | Time to execute data function |
| **IndexedDB Query** | <50ms | Time to fetch transactions |
| **UI Responsiveness** | 60fps | Chat window scroll and input |

### Monitoring

**Key Metrics to Track**:
1. **API Response Time**: Monitor /api/chat/message latency
2. **OpenAI Token Usage**: Track input/output tokens per query
3. **Error Rate**: % of failed queries (target: <1%)
4. **Function Call Distribution**: Which functions are used most
5. **User Engagement**: Messages per session, sessions per week

**Logging Example**:
```typescript
// Log performance metrics
console.log('[Chatbot Metrics]', {
  responseTime: endTime - startTime,
  tokensUsed: response.usage.total_tokens,
  functionCalled: functionName || 'none',
  userId: 'anonymous', // No PII
  timestamp: new Date().toISOString(),
});
```

---

## Troubleshooting Guide (Developer)

### Issue: OpenAI API Timeout

**Symptoms**: API route takes >30s, times out

**Causes**:
1. Large conversation history sent to OpenAI (>100 messages)
2. Complex function calls with large datasets

**Solutions**:
```typescript
// Limit conversation history to last 10 messages
const limitedHistory = conversationHistory.slice(-10);

// Add timeout to OpenAI call
const response = await Promise.race([
  openai.chat.completions.create({ /* ... */ }),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('OpenAI timeout')), 10000)
  ),
]);
```

### Issue: High Token Costs

**Symptoms**: OpenAI bill is unexpectedly high

**Causes**:
1. Sending full transaction history (1000s of transactions)
2. Not limiting conversation context

**Solutions**:
```typescript
// Aggregate large datasets before sending to OpenAI
const spendingSummary = {
  total: transactions.reduce((sum, t) => sum + t.amount, 0),
  count: transactions.length,
  byCategory: groupByCategory(transactions), // Only top 10
  // Don't send full transaction list if >100 items
};
```

### Issue: Inaccurate Responses

**Symptoms**: Chatbot gives wrong spending totals or incorrect data

**Causes**:
1. Data sanitization removed too much context
2. Function calls not properly validated
3. OpenAI hallucinating data

**Solutions**:
```typescript
// Validate function results before sending to OpenAI
function validateFunctionResult(result: any, functionName: string) {
  if (functionName === 'get_spending' && typeof result.total !== 'number') {
    throw new Error('Invalid spending data');
  }
  // Add more validations
}

// Add source attribution to responses
systemPrompt: "Always cite your data source. Example: 'Based on your 47 transactions this month, you spent $1,234.56 on groceries.'"
```

---

## Future Enhancements

### Planned Features (Post-MVP)

1. **Voice Input/Output**
   - Speech-to-text (Web Speech API)
   - Text-to-speech responses
   - Voice commands ("Hey Budget, how much did I spend today?")

2. **Scheduled Insights**
   - Weekly spending summary email
   - Budget alerts ("You're 90% through your dining budget")
   - Unusual spending notifications

3. **Multi-language Support**
   - Spanish, French, German translations
   - Region-specific date/currency formatting
   - Localized financial terms

4. **Advanced Analytics**
   - Spending predictions ("You'll likely spend $X this month")
   - Category recommendations ("Consider a $Y budget for Z")
   - Anomaly detection ("Your coffee spending is 3x normal")

5. **Integration with Other Apps**
   - Export to Google Sheets
   - Mint/YNAB import compatibility
   - Apple Health spending insights

---

## Appendix

### Environment Variables Reference

```env
# Required
OPENAI_API_KEY=sk-...

# Optional
OPENAI_ORG_ID=org-...
OPENAI_PROJECT_ID=proj_...
CHATBOT_MODEL=gpt-4o-mini  # or gpt-4o
CHATBOT_MAX_TOKENS=500
CHATBOT_TEMPERATURE=0.7
CHATBOT_CONTEXT_WINDOW=10
CHATBOT_STREAMING=true

# Privacy
CHATBOT_ANONYMIZE_DATA=true
CHATBOT_LOG_CONVERSATIONS=false  # NEVER log PII!
```

### Database Schema Addition

```typescript
// Add to src/lib/budget-db.ts

export class BudgetDatabase extends Dexie {
  // ... existing tables ...
  chatHistory!: Table<ChatMessage>;

  constructor() {
    super('HouseholdBudgetApp');

    // ... existing versions ...

    this.version(10).stores({
      // ... existing tables ...
      chatHistory: 'id, role, timestamp, conversationId',
    });
  }
}

export interface ChatMessage {
  id: string;
  conversationId: string;  // Group messages by session
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  functionCall?: {
    name: string;
    arguments: any;
    result?: any;
  };
}
```

### API Documentation

See OpenAPI spec at `/docs/api/chatbot-openapi.yaml` (to be created).

---

**Questions?** See [Chatbot User Guide](./user-guide/chatbot-guide.md) or contact the development team.

---

*Last Updated: November 9, 2025*
*Status: Planning Documentation - Feature not yet implemented*
