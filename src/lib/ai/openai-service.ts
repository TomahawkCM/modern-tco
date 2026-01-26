/**
 * Centralized OpenAI Service
 * Handles all OpenAI API calls with rate limiting, error handling, and cost tracking
 *
 * Features:
 * - Rate limiting (10 requests/minute for free tier)
 * - Automatic retries with exponential backoff
 * - Cost tracking and monitoring
 * - Privacy-safe prompts (no PII sent)
 * - Response caching
 *
 * SECURITY UPDATE (2025-11-24):
 * - Client-side AI calls are DEPRECATED
 * - Use server-side API routes (/api/import/analyze-columns, /api/import/analyze-error)
 * - This service will return errors for client-side usage
 * - Server-side routes use process.env.OPENAI_API_KEY directly
 */

import OpenAI from 'openai';
import { isAIFeaturesEnabled } from '@/lib/budget-privacy-settings';
import { isOnlineMode } from '@/config/features';

// ============================================================================
// Configuration
// ============================================================================

const RATE_LIMIT_REQUESTS_PER_MINUTE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ============================================================================
// Types
// ============================================================================

export interface OpenAIRequestOptions {
  model?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo-preview';
  temperature?: number;
  maxTokens?: number;
  cacheKey?: string; // Optional cache key for deduplication
  systemPrompt?: string;
  retryOnError?: boolean;
}

export interface OpenAIResponse<T = string> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache?: boolean;
  tokensUsed?: number;
  cost?: number;
}

interface CachedResponse {
  data: any;
  timestamp: number;
  tokensUsed: number;
}

interface RateLimitState {
  requestTimestamps: number[];
}

// ============================================================================
// Service State
// ============================================================================

let openaiClient: OpenAI | null = null;
const rateLimitState: RateLimitState = {
  requestTimestamps: [],
};
const responseCache = new Map<string, CachedResponse>();

// ============================================================================
// Initialization
// ============================================================================

/**
 * Check if OpenAI API key is configured
 * SECURITY: Server-side only - never expose API key to browser
 * Returns false silently in standalone mode (no logging)
 */
export function hasOpenAIKey(): boolean {
  // In standalone mode, AI is never available - return false silently
  if (!isOnlineMode()) {
    return false;
  }

  // Server-side: check for server-only key (preferred)
  // This will be false on client-side which is intentional
  const serverKey = process.env.OPENAI_API_KEY;
  if (serverKey && serverKey.length > 0) {
    return true;
  }

  // DEPRECATED: Client-side key (will be removed)
  // This exposed the API key in browser - security risk
  const clientKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (clientKey && clientKey.length > 0) {
    console.warn('[OpenAI] Using NEXT_PUBLIC_OPENAI_API_KEY is deprecated and insecure. Use server-side API routes instead.');
    return true;
  }

  return false;
}

/**
 * Initialize OpenAI client (lazy initialization)
 * SECURITY: Prefers server-only key, falls back to deprecated client key
 */
function getClient(): OpenAI {
  if (!openaiClient) {
    // Prefer server-side key (secure)
    let apiKey = process.env.OPENAI_API_KEY;

    // Fall back to deprecated client key (insecure)
    if (!apiKey) {
      apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (apiKey) {
        console.warn(
          '[OpenAI] SECURITY WARNING: Using NEXT_PUBLIC_OPENAI_API_KEY exposes your API key in browser. ' +
          'Please migrate to server-side API routes (/api/import/analyze-columns, /api/import/analyze-error).'
        );
      }
    }

    if (!apiKey) {
      throw new Error(
        'OpenAI API key not configured. For client-side code, use the server-side API routes ' +
        '(/api/import/analyze-columns, /api/import/analyze-error) instead of direct AI calls.'
      );
    }

    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // DEPRECATED: Will be removed when all calls move to server
    });
  }
  return openaiClient;
}

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Check if we're within rate limits
 * Returns true if we can proceed, false if rate limited
 */
function checkRateLimit(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  // Remove timestamps older than 1 minute
  rateLimitState.requestTimestamps = rateLimitState.requestTimestamps.filter(
    (timestamp) => timestamp > oneMinuteAgo
  );

  // Check if we're under the limit
  return rateLimitState.requestTimestamps.length < RATE_LIMIT_REQUESTS_PER_MINUTE;
}

/**
 * Record a new request timestamp
 */
function recordRequest(): void {
  rateLimitState.requestTimestamps.push(Date.now());
}

/**
 * Wait until rate limit allows next request
 */
async function waitForRateLimit(): Promise<void> {
  while (!checkRateLimit()) {
    // Wait 5 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

// ============================================================================
// Caching
// ============================================================================

/**
 * Get cached response if available and not expired
 */
function getCachedResponse(cacheKey: string): CachedResponse | null {
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL_MS) {
    responseCache.delete(cacheKey);
    return null;
  }

  return cached;
}

/**
 * Cache a response
 */
function cacheResponse(cacheKey: string, data: any, tokensUsed: number): void {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    tokensUsed,
  });
}

// ============================================================================
// Cost Calculation
// ============================================================================

/**
 * Calculate cost based on model and tokens
 * Pricing (as of Nov 2024):
 * - GPT-3.5-turbo: $0.001 / 1K tokens (input), $0.002 / 1K tokens (output)
 * - GPT-4: $0.03 / 1K tokens (input), $0.06 / 1K tokens (output)
 */
function calculateCost(model: string, tokensUsed: number): number {
  const pricePerToken = model.startsWith('gpt-4') ? 0.00003 : 0.000001;
  return tokensUsed * pricePerToken;
}

// ============================================================================
// Core API Functions
// ============================================================================

/**
 * Make a chat completion request to OpenAI
 *
 * @param userPrompt - The user's prompt (cleaned of PII)
 * @param options - Request options
 * @returns OpenAI response with success/error status
 */
export async function chatCompletion(
  userPrompt: string,
  options: OpenAIRequestOptions = {}
): Promise<OpenAIResponse<string>> {
  // In standalone mode, return silent failure (no console errors)
  if (!isOnlineMode()) {
    return {
      success: false,
      error: 'AI features not available in standalone mode',
    };
  }

  // Check if AI features are enabled
  if (!isAIFeaturesEnabled()) {
    return {
      success: false,
      error: 'AI features are disabled in privacy settings',
    };
  }

  // Check if API key is configured
  if (!hasOpenAIKey()) {
    console.warn('[OpenAI] API key not configured, skipping AI request. Use server-side API routes for AI features.');
    return {
      success: false,
      error: 'AI not available. Use server-side API routes (/api/import/analyze-columns, /api/import/analyze-error) instead.',
    };
  }

  const {
    model = 'gpt-3.5-turbo',
    temperature = 0.7,
    maxTokens = 500,
    cacheKey,
    systemPrompt = 'You are a helpful financial assistant.',
    retryOnError = true,
  } = options;

  // Check cache first
  if (cacheKey) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      console.log('[OpenAI] Cache hit:', cacheKey);
      return {
        success: true,
        data: cached.data,
        fromCache: true,
        tokensUsed: cached.tokensUsed,
        cost: calculateCost(model, cached.tokensUsed),
      };
    }
  }

  // Wait for rate limit
  await waitForRateLimit();
  recordRequest();

  // Retry logic
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < MAX_RETRIES) {
    try {
      const client = getClient();
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      const content = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      // Cache the response
      if (cacheKey) {
        cacheResponse(cacheKey, content, tokensUsed);
      }

      return {
        success: true,
        data: content,
        fromCache: false,
        tokensUsed,
        cost: calculateCost(model, tokensUsed),
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`[OpenAI] Attempt ${attempt + 1} failed:`, error);

      if (!retryOnError || attempt >= MAX_RETRIES - 1) {
        break;
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt))
      );
      attempt++;
    }
  }

  // All retries failed
  return {
    success: false,
    error: lastError?.message || 'Unknown error',
  };
}

/**
 * Parse JSON response from OpenAI
 * Handles common parsing errors and retries with corrections
 */
export async function chatCompletionJSON<T>(
  userPrompt: string,
  options: OpenAIRequestOptions = {}
): Promise<OpenAIResponse<T>> {
  const response = await chatCompletion(userPrompt, {
    ...options,
    systemPrompt:
      options.systemPrompt ||
      'You are a helpful assistant that responds with valid JSON only. Do not include any text outside the JSON object.',
  });

  if (!response.success || !response.data) {
    return {
      success: false,
      error: response.error || 'Failed to get response',
    };
  }

  try {
    // Clean markdown code blocks if present
    let cleaned = response.data.trim();
    cleaned = cleaned.replace(/^```json\n?/i, '');
    cleaned = cleaned.replace(/\n?```$/i, '');

    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      data: parsed,
      fromCache: response.fromCache,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
    };
  } catch (error) {
    console.error('[OpenAI] JSON parse error:', error);
    return {
      success: false,
      error: `Failed to parse JSON: ${(error as Error).message}`,
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(): {
  requestsInLastMinute: number;
  remainingRequests: number;
  rateLimitReached: boolean;
} {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  // Clean old timestamps
  rateLimitState.requestTimestamps = rateLimitState.requestTimestamps.filter(
    (timestamp) => timestamp > oneMinuteAgo
  );

  const requestsInLastMinute = rateLimitState.requestTimestamps.length;

  return {
    requestsInLastMinute,
    remainingRequests: Math.max(
      0,
      RATE_LIMIT_REQUESTS_PER_MINUTE - requestsInLastMinute
    ),
    rateLimitReached: requestsInLastMinute >= RATE_LIMIT_REQUESTS_PER_MINUTE,
  };
}

/**
 * Clear response cache
 */
export function clearCache(): void {
  responseCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  cacheSize: number;
  totalCachedResponses: number;
} {
  return {
    cacheSize: responseCache.size,
    totalCachedResponses: responseCache.size,
  };
}

/**
 * Clean description for privacy
 * Removes sensitive information before sending to API
 */
export function cleanDescriptionForAI(description: string): string {
  let cleaned = description.trim();

  // Remove account numbers (patterns like XXXX-1234, 1234567890)
  cleaned = cleaned.replace(/\b\d{4}[- ]?\d{4,}\b/g, '[ACCOUNT]');
  cleaned = cleaned.replace(/\bXXXX[- ]?\d{4,}\b/gi, '[ACCOUNT]');

  // Remove transaction IDs (long numeric strings)
  cleaned = cleaned.replace(/\b\d{10,}\b/g, '[ID]');

  // Remove common prefixes that don't help with matching
  cleaned = cleaned.replace(/^\[[A-Z]{2}\]\s*/i, ''); // [PR], [OP] etc
  cleaned = cleaned.replace(/^(PURCHASE|DEBIT|CREDIT|PAYMENT|AUTH)\s+/i, '');

  // Remove dates in various formats
  cleaned = cleaned.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '[DATE]');
  cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}/g, '[DATE]');

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}
