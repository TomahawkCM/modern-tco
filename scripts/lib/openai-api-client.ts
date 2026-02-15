/**
 * OpenAI API Client for Translation
 *
 * Provides:
 * 1. OpenAI SDK wrapper with retry logic
 * 2. Rate limiting (max concurrent requests)
 * 3. Cost estimation and tracking
 * 4. Error handling for translation failures
 */

import OpenAI from "openai";
import type { SupportedLocale } from "../../src/i18n/config";
import { buildBaseTranslationPrompt, buildAdaptationPrompt } from "./prompt-builder";

const OPENAI_MODEL = "gpt-4o-mini";
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 4000, 8000]; // Exponential backoff in ms
const RETRYABLE_ERROR_CODES = ["rate_limit_exceeded", "server_error", "timeout"];

/**
 * Rate Limiter for concurrent API calls
 */
class RateLimiter {
  private queue: Promise<any>[] = [];
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if queue is full
    while (this.queue.length >= this.maxConcurrent) {
      await Promise.race(this.queue);
    }

    // Execute and track promise
    const promise = fn().finally(() => {
      this.queue = this.queue.filter((p) => p !== promise);
    });

    this.queue.push(promise);
    return promise;
  }

  getActiveCount(): number {
    return this.queue.length;
  }
}

/**
 * OpenAI API Client
 */
export class OpenAIAPIClient {
  private client: OpenAI;
  private rateLimiter: RateLimiter;
  private totalInputTokens: number = 0;
  private totalOutputTokens: number = 0;

  constructor(concurrency: number = 5) {
    // Initialize OpenAI client
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. " +
          "Please add it to your .env.local file."
      );
    }

    this.client = new OpenAI({ apiKey });
    this.rateLimiter = new RateLimiter(concurrency);
  }

  /**
   * Translate using base translation prompt
   */
  async translateBase(locale: SupportedLocale, source: object): Promise<object> {
    const prompt = buildBaseTranslationPrompt(locale, source);
    return this.callAPI(locale, prompt, "base");
  }

  /**
   * Translate using regional adaptation prompt
   */
  async translateAdapted(
    locale: SupportedLocale,
    baseLocale: SupportedLocale,
    baseTranslation: object
  ): Promise<object> {
    const prompt = buildAdaptationPrompt(locale, baseLocale, baseTranslation);
    return this.callAPI(locale, prompt, "adapted");
  }

  /**
   * Make API call with retry logic
   */
  private async callAPI(
    locale: SupportedLocale,
    prompt: string,
    type: "base" | "adapted",
    attempt: number = 1
  ): Promise<object> {
    return this.rateLimiter.throttle(async () => {
      try {
        const response = await this.client.chat.completions.create({
          model: OPENAI_MODEL,
          max_tokens: 16000, // Increased to handle large translation batches
          temperature: 0.3, // Lower temperature for more consistent translations
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a professional translator. Always respond with valid JSON only, no explanations.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        // Track token usage
        if (response.usage) {
          this.totalInputTokens += response.usage.prompt_tokens;
          this.totalOutputTokens += response.usage.completion_tokens;
        }

        // Extract JSON from response
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("No content in OpenAI response");
        }

        const translationText = content.trim();

        // Parse JSON (handle markdown code blocks if present)
        const jsonText = this.extractJSON(translationText);
        const translation = JSON.parse(jsonText);

        return translation;
      } catch (error: any) {
        // Handle retryable errors
        if (this.isRetryable(error) && attempt < MAX_RETRIES) {
          const delay = RETRY_DELAYS[attempt - 1];
          console.warn(
            `⚠️  ${locale}: ${error.message || error.type} - Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`
          );

          await this.sleep(delay);
          return this.callAPI(locale, prompt, type, attempt + 1);
        }

        // Re-throw non-retryable or exhausted retries
        throw this.enhanceError(error, locale, type);
      }
    });
  }

  /**
   * Extract JSON from response (handles markdown code blocks)
   */
  private extractJSON(text: string): string {
    // Remove markdown code blocks if present
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // Try to find JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    return text.trim();
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: any): boolean {
    // OpenAI error codes
    if (error.code && RETRYABLE_ERROR_CODES.includes(error.code)) {
      return true;
    }

    // Rate limit errors
    if (error.status === 429 || error.message?.includes("rate limit")) {
      return true;
    }

    // Server errors (5xx)
    if (error.status >= 500 && error.status < 600) {
      return true;
    }

    // Network errors
    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      return true;
    }

    return false;
  }

  /**
   * Enhance error with context
   */
  private enhanceError(error: any, locale: SupportedLocale, type: string): Error {
    const message = error.message || error.type || "Unknown error";
    const enhanced = new Error(`Translation failed for ${locale} (${type}): ${message}`);
    enhanced.stack = error.stack;
    return enhanced;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get cost estimate for completed translations
   */
  getCostEstimate(): {
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
  } {
    // GPT-4o-mini pricing (as of Dec 2024)
    const INPUT_COST_PER_1M = 0.15; // $0.15 per 1M input tokens
    const OUTPUT_COST_PER_1M = 0.6; // $0.60 per 1M output tokens

    const inputCost = (this.totalInputTokens / 1_000_000) * INPUT_COST_PER_1M;
    const outputCost = (this.totalOutputTokens / 1_000_000) * OUTPUT_COST_PER_1M;

    return {
      inputTokens: this.totalInputTokens,
      outputTokens: this.totalOutputTokens,
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }

  /**
   * Get active request count
   */
  getActiveCount(): number {
    return this.rateLimiter.getActiveCount();
  }

  /**
   * Reset token counters
   */
  resetCounters(): void {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
  }
}

/**
 * Estimate cost for a translation job using GPT-4o-mini
 */
export function estimateCost(
  numBaseTranslations: number,
  numAdaptations: number
): {
  estimatedCost: number;
  breakdown: string;
} {
  // Average token counts (based on en.json structure)
  const AVG_PROMPT_TOKENS = 600;
  const AVG_OUTPUT_TOKENS = 500;

  // GPT-4o-mini pricing
  const INPUT_COST_PER_1M = 0.15;
  const OUTPUT_COST_PER_1M = 0.6;

  // Base translations (more tokens in prompt)
  const baseInputTokens = numBaseTranslations * AVG_PROMPT_TOKENS;
  const baseOutputTokens = numBaseTranslations * AVG_OUTPUT_TOKENS;

  // Adaptations (slightly fewer tokens)
  const adaptInputTokens = numAdaptations * (AVG_PROMPT_TOKENS * 0.9);
  const adaptOutputTokens = numAdaptations * AVG_OUTPUT_TOKENS;

  // Calculate costs
  const totalInputTokens = baseInputTokens + adaptInputTokens;
  const totalOutputTokens = baseOutputTokens + adaptOutputTokens;

  const inputCost = (totalInputTokens / 1_000_000) * INPUT_COST_PER_1M;
  const outputCost = (totalOutputTokens / 1_000_000) * OUTPUT_COST_PER_1M;
  const totalCost = inputCost + outputCost;

  const breakdown = [
    `Base translations (${numBaseTranslations}): $${(inputCost * (baseInputTokens / totalInputTokens) + outputCost * (baseOutputTokens / totalOutputTokens)).toFixed(3)}`,
    `Regional adaptations (${numAdaptations}): $${(inputCost * (adaptInputTokens / totalInputTokens) + outputCost * (adaptOutputTokens / totalOutputTokens)).toFixed(3)}`,
    `Input tokens: ${totalInputTokens.toLocaleString()} ($${inputCost.toFixed(3)})`,
    `Output tokens: ${totalOutputTokens.toLocaleString()} ($${outputCost.toFixed(3)})`,
  ].join("\n   ");

  return {
    estimatedCost: totalCost,
    breakdown,
  };
}
