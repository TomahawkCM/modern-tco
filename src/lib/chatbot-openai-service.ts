/**
 * OpenAI Service for Budget Chatbot
 *
 * Handles all communication with OpenAI GPT-4 API for chatbot functionality.
 * Implements function calling for data access and action execution.
 *
 * Privacy & Security:
 * - API key stored in environment variables (not exposed to client)
 * - Only sends necessary financial data (no raw account numbers, names)
 * - Respects user privacy settings
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat';
import {
  getSpendingSummary,
  getBudgetStatus,
  getAccountSummaries,
  getLoanSummaries,
  getCategories,
  searchTransactions,
  getFinancialSummary,
  checkChatbotPermission,
  addTransaction,
  createBudget,
  updateTransaction,
  updateBudget,
} from './chatbot-data-access';
import { getSystemPrompt } from './chatbot-prompts';
import { getChatbotDataAccess } from './budget-privacy-settings';

/**
 * Initialize OpenAI client
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OpenAI API key not found. Add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.'
    );
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Only for client-side usage (budget app is client-only)
  });
}

/**
 * Available functions for chatbot
 */
const availableFunctions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getSpendingSummary',
      description: 'Get spending summary for a date range, optionally filtered by category',
      parameters: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: 'Start date in ISO format (YYYY-MM-DD)',
          },
          endDate: {
            type: 'string',
            description: 'End date in ISO format (YYYY-MM-DD)',
          },
          category: {
            type: 'string',
            description: 'Optional category to filter by (e.g., "Groceries", "Dining")',
          },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getBudgetStatus',
      description: 'Get budget status for all budgets or a specific category',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Optional category to filter by',
          },
          period: {
            type: 'string',
            enum: ['monthly', 'weekly', 'yearly'],
            description: 'Optional budget period to filter by',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getAccountSummaries',
      description: 'Get summaries of all accounts (balances, transaction counts)',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getLoanSummaries',
      description: 'Get summaries of all loans (balances, payment schedules)',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCategories',
      description: 'Get all available categories for transactions',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchTransactions',
      description: 'Search transactions by description or category',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (matches description or category)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 50)',
          },
          startDate: {
            type: 'string',
            description: 'Optional start date filter (YYYY-MM-DD)',
          },
          endDate: {
            type: 'string',
            description: 'Optional end date filter (YYYY-MM-DD)',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getFinancialSummary',
      description: 'Get a high-level financial summary (accounts, budgets, loans, recent activity)',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'addTransaction',
      description: 'Add a new transaction (requires full-access permission)',
      parameters: {
        type: 'object',
        properties: {
          accountId: {
            type: 'string',
            description: 'Account ID to add the transaction to',
          },
          date: {
            type: 'string',
            description: 'Transaction date in ISO format (YYYY-MM-DD)',
          },
          description: {
            type: 'string',
            description: 'Transaction description (e.g., "Coffee at Starbucks")',
          },
          amount: {
            type: 'number',
            description: 'Transaction amount (negative for expenses, positive for income)',
          },
          category: {
            type: 'string',
            description: 'Category name (e.g., "Groceries", "Dining", "Income")',
          },
          subcategory: {
            type: 'string',
            description: 'Optional subcategory',
          },
          notes: {
            type: 'string',
            description: 'Optional notes',
          },
          merchant: {
            type: 'string',
            description: 'Optional merchant name',
          },
        },
        required: ['accountId', 'date', 'description', 'amount', 'category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createBudget',
      description: 'Create a new budget for a category (requires full-access permission)',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Category name to budget for (e.g., "Groceries", "Dining")',
          },
          amount: {
            type: 'number',
            description: 'Budget amount (must be positive)',
          },
          period: {
            type: 'string',
            enum: ['monthly', 'annual'],
            description: 'Budget period (monthly or annual)',
          },
          startDate: {
            type: 'string',
            description: 'Budget start date in ISO format (YYYY-MM-DD)',
          },
          rollover: {
            type: 'boolean',
            description: 'Whether to rollover unused budget to next period (default: false)',
          },
        },
        required: ['category', 'amount', 'period', 'startDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateTransaction',
      description: 'Update an existing transaction (requires full-access permission)',
      parameters: {
        type: 'object',
        properties: {
          transactionId: {
            type: 'string',
            description: 'ID of the transaction to update',
          },
          description: {
            type: 'string',
            description: 'New description (optional)',
          },
          amount: {
            type: 'number',
            description: 'New amount (optional)',
          },
          category: {
            type: 'string',
            description: 'New category (optional)',
          },
          subcategory: {
            type: 'string',
            description: 'New subcategory (optional)',
          },
          notes: {
            type: 'string',
            description: 'New notes (optional)',
          },
          date: {
            type: 'string',
            description: 'New date in ISO format (optional)',
          },
        },
        required: ['transactionId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateBudget',
      description: 'Update an existing budget (requires full-access permission)',
      parameters: {
        type: 'object',
        properties: {
          budgetId: {
            type: 'string',
            description: 'ID of the budget to update',
          },
          amount: {
            type: 'number',
            description: 'New budget amount (optional)',
          },
          rollover: {
            type: 'boolean',
            description: 'New rollover setting (optional)',
          },
          endDate: {
            type: 'string',
            description: 'New end date in ISO format or null to remove (optional)',
          },
        },
        required: ['budgetId'],
      },
    },
  },
];

/**
 * Execute function call from OpenAI
 */
async function executeFunctionCall(
  functionName: string,
  args: Record<string, any>
): Promise<any> {
  switch (functionName) {
    case 'getSpendingSummary':
      return await getSpendingSummary({
        startDate: new Date(args.startDate),
        endDate: new Date(args.endDate),
        category: args.category,
      });

    case 'getBudgetStatus':
      return await getBudgetStatus({
        category: args.category,
        period: args.period,
      });

    case 'getAccountSummaries':
      return await getAccountSummaries();

    case 'getLoanSummaries':
      return await getLoanSummaries();

    case 'getCategories':
      return await getCategories();

    case 'searchTransactions':
      return await searchTransactions({
        query: args.query,
        limit: args.limit,
        startDate: args.startDate ? new Date(args.startDate) : undefined,
        endDate: args.endDate ? new Date(args.endDate) : undefined,
      });

    case 'getFinancialSummary':
      return await getFinancialSummary();

    case 'addTransaction':
      return await addTransaction({
        accountId: args.accountId,
        date: new Date(args.date),
        description: args.description,
        amount: args.amount,
        category: args.category,
        subcategory: args.subcategory,
        notes: args.notes,
        merchant: args.merchant,
        tags: args.tags,
      });

    case 'createBudget':
      return await createBudget({
        category: args.category,
        amount: args.amount,
        period: args.period,
        startDate: new Date(args.startDate),
        rollover: args.rollover,
      });

    case 'updateTransaction':
      return await updateTransaction({
        transactionId: args.transactionId,
        description: args.description,
        amount: args.amount,
        category: args.category,
        subcategory: args.subcategory,
        notes: args.notes,
        date: args.date ? new Date(args.date) : undefined,
      });

    case 'updateBudget':
      return await updateBudget({
        budgetId: args.budgetId,
        amount: args.amount,
        rollover: args.rollover,
        endDate: args.endDate ? new Date(args.endDate) : undefined,
      });

    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

/**
 * Chat with the budget assistant
 */
export async function chatWithAssistant(params: {
  messages: ChatCompletionMessageParam[];
  systemPrompt?: string;
  isFirstTime?: boolean;
  hasError?: boolean;
}): Promise<{
  response: string;
  functionCalls?: Array<{ name: string; args: any; result: any }>;
}> {
  // Check permission
  const permission = checkChatbotPermission();
  if (!permission.allowed) {
    throw new Error(permission.reason);
  }

  const { messages, systemPrompt, isFirstTime, hasError } = params;

  // Initialize OpenAI client
  const openai = getOpenAIClient();

  // Get access level for prompt selection
  const accessLevel = getChatbotDataAccess();

  // Build messages array with system prompt
  const fullMessages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt || getSystemPrompt({ accessLevel, isFirstTime, hasError }),
    },
    ...messages,
  ];

  // Call OpenAI API with function calling
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: fullMessages,
    tools: availableFunctions,
    tool_choice: 'auto',
    temperature: 0.7,
    max_tokens: 1000,
  });

  const assistantMessage = response.choices[0].message;

  // Check if assistant wants to call functions
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    const functionCalls = [];

    // Execute all function calls
    for (const toolCall of assistantMessage.tool_calls) {
      // Skip custom tool calls (only process regular function calls)
      if (!('function' in toolCall)) continue;

      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      try {
        const result = await executeFunctionCall(functionName, args);

        functionCalls.push({
          name: functionName,
          args,
          result,
        });

        // Add function result to messages
        fullMessages.push(assistantMessage);
        fullMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      } catch (error: any) {
        // Add error to messages
        fullMessages.push(assistantMessage);
        fullMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: error.message }),
        });
      }
    }

    // Get final response after function calls
    const finalResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      response: finalResponse.choices[0].message.content || 'No response',
      functionCalls,
    };
  }

  // No function calls - return direct response
  return {
    response: assistantMessage.content || 'No response',
  };
}
