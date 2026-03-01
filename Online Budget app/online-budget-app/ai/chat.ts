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
