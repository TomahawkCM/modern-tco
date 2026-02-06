/**
 * OpenAI Chat API Route (Budget App v1)
 * Task: Integrate OpenAI API for chatbot functionality
 *
 * Endpoints:
 * - POST /api/chat - Send message and get streaming response
 *
 * Features:
 * - OpenAI GPT-4o integration with streaming
 * - Conversation history management (last 20 messages, 8000 tokens max)
 * - Error handling and rate limiting
 * - Budget app context awareness
 */

import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { isOnlineMode } from '@/config/features';

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured. Add OPENAI_API_KEY to your .env.local file.');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

// System prompt for budget assistant
const SYSTEM_PROMPT = `You are a helpful financial assistant for a personal budget management app. You help users:

1. **Understand their finances**: Answer questions about spending, budgets, income, and trends
2. **Manage transactions**: Help add, edit, or find transactions
3. **Create budgets**: Assist in setting up and tracking budgets
4. **Analyze spending**: Provide insights on spending patterns and categories
5. **Offer advice**: Give general financial tips (not professional advice)

**Context**: The user is using a local-first budget app with transactions, budgets, loans, and investments stored in their browser's IndexedDB.

**Guidelines**:
- Be friendly, concise, and helpful
- Use simple language, avoid jargon
- Focus on actionable advice
- Respect user privacy (all data stays local)
- Don't provide professional financial advice
- Format numbers as currency when relevant (e.g., $1,234.56)

**Available Actions** (coming soon):
- Search transactions
- Create new transactions
- View budget status
- Get spending summaries

For now, provide helpful answers based on general budget management knowledge. Function calling will be added in a future update.`;

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  // Check if we're in online mode (standalone mode has no AI)
  if (!isOnlineMode()) {
    return NextResponse.json(
      { error: 'Chatbot not available in standalone mode' },
      { status: 503 }
    );
  }

  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a minute.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { messages, userContext } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Limit conversation history (last 20 messages to stay under 8000 tokens)
    const limitedMessages = messages.slice(-20);

    // Build context-aware system message if user context provided
    let systemMessage = SYSTEM_PROMPT;
    if (userContext) {
      const { totalTransactions, totalBudgets, recentSpending } = userContext;
      systemMessage += `\n\n**User Context**:`;
      if (totalTransactions !== undefined) systemMessage += `\n- Total transactions: ${totalTransactions}`;
      if (totalBudgets !== undefined) systemMessage += `\n- Active budgets: ${totalBudgets}`;
      if (recentSpending !== undefined) systemMessage += `\n- Recent spending (30d): $${recentSpending.toFixed(2)}`;
    }

    // Call OpenAI API with streaming
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective
      messages: [
        { role: 'system', content: systemMessage },
        ...limitedMessages,
      ],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    });

    // Create readable stream for response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Chat API error:', error);

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your OpenAI configuration.' },
        { status: 500 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI quota exceeded. Please check your account.' },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to process chat request. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
