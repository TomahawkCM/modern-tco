/**
 * AIProvider — Abstract AI interface for StatementKit.
 *
 * Core principle: StatementKit ships NO API keys and requires NO external services.
 * All parsing (CSV, OFX, PDF, OCR, MT940, CAMT, QIF) works 100% offline.
 *
 * AI enrichment (smart column mapping, semantic dedup, merchant classification)
 * is strictly opt-in. Users bring their own key (BYOK) by implementing AIProvider.
 */

// ---------------------------------------------------------------------------
// AI Provider Interface
// ---------------------------------------------------------------------------

/**
 * Abstract AI provider interface.
 * Implement this to enable AI-powered features in StatementKit.
 *
 * @example
 * // OpenAI implementation
 * const openaiProvider: AIProvider = {
 *   async chatCompletion(prompt, options) {
 *     const response = await openai.chat.completions.create({
 *       model: options?.model ?? "gpt-4o-mini",
 *       messages: [
 *         { role: "system", content: options?.systemPrompt ?? "You are a financial data assistant." },
 *         { role: "user", content: prompt },
 *       ],
 *       temperature: options?.temperature ?? 0.1,
 *       response_format: { type: "json_object" },
 *     });
 *     return { success: true, data: response.choices[0].message.content ?? "" };
 *   }
 * };
 *
 * // Anthropic implementation
 * const anthropicProvider: AIProvider = {
 *   async chatCompletion(prompt, options) {
 *     const message = await anthropic.messages.create({
 *       model: options?.model ?? "claude-sonnet-4-20250514",
 *       max_tokens: options?.maxTokens ?? 1024,
 *       system: options?.systemPrompt ?? "You are a financial data assistant.",
 *       messages: [{ role: "user", content: prompt }],
 *     });
 *     return { success: true, data: message.content[0].text };
 *   }
 * };
 */
export interface AIProvider {
  chatCompletion(prompt: string, options?: AIRequestOptions): Promise<AIResponse>;
}

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// JSON Completion Helper
// ---------------------------------------------------------------------------

/**
 * Call the AI provider and parse the response as JSON.
 * Strips markdown code blocks if present.
 */
export async function chatCompletionJSON<T>(
  provider: AIProvider,
  prompt: string,
  options?: AIRequestOptions
): Promise<{ success: boolean; data?: T; error?: string }> {
  const response = await provider.chatCompletion(prompt, options);

  if (!response.success || !response.data) {
    return { success: false, error: response.error ?? "No response from AI provider" };
  }

  try {
    // Strip markdown code blocks if present
    let text = response.data.trim();
    if (text.startsWith("```json")) {
      text = text.slice(7);
    } else if (text.startsWith("```")) {
      text = text.slice(3);
    }
    if (text.endsWith("```")) {
      text = text.slice(0, -3);
    }
    text = text.trim();

    const parsed = JSON.parse(text) as T;
    return { success: true, data: parsed };
  } catch (e) {
    return {
      success: false,
      error: `Failed to parse AI response as JSON: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Global AI Provider Registry
// ---------------------------------------------------------------------------

let globalProvider: AIProvider | null = null;

/**
 * Configure the global AI provider for StatementKit.
 * Call this once at app initialization with your BYOK provider.
 *
 * @example
 * import { setAIProvider } from "statementkit";
 * setAIProvider(myOpenAIProvider);
 */
export function setAIProvider(provider: AIProvider | null): void {
  globalProvider = provider;
}

/**
 * Get the current global AI provider.
 * Returns null if no provider is configured (AI features disabled).
 */
export function getAIProvider(): AIProvider | null {
  return globalProvider;
}

/**
 * Check if AI features are available (provider configured).
 */
export function hasAIProvider(): boolean {
  return globalProvider !== null;
}

// ---------------------------------------------------------------------------
// Mock AI Provider (for testing)
// ---------------------------------------------------------------------------

/**
 * Mock AI provider for testing.
 * Returns pre-configured responses based on prompt matching.
 */
export class MockAIProvider implements AIProvider {
  private responses: Array<{ match: string | RegExp; response: string }> = [];
  private calls: Array<{ prompt: string; options?: AIRequestOptions }> = [];
  private defaultResponse: string;

  constructor(defaultResponse: string = '{"result": "mock"}') {
    this.defaultResponse = defaultResponse;
  }

  /**
   * Add a response rule. When prompt matches, return this response.
   */
  when(match: string | RegExp, response: string): this {
    this.responses.push({ match, response });
    return this;
  }

  /**
   * Get all calls made to this provider.
   */
  getCalls(): Array<{ prompt: string; options?: AIRequestOptions }> {
    return [...this.calls];
  }

  /**
   * Reset call history.
   */
  reset(): void {
    this.calls = [];
  }

  async chatCompletion(prompt: string, options?: AIRequestOptions): Promise<AIResponse> {
    this.calls.push({ prompt, options });

    for (const { match, response } of this.responses) {
      if (typeof match === "string" ? prompt.includes(match) : match.test(prompt)) {
        return { success: true, data: response };
      }
    }

    return { success: true, data: this.defaultResponse };
  }
}
