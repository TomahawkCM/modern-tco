/**
 * AI-Powered Vendor Matching using OpenAI
 *
 * Uses GPT-4 to intelligently match vendor names by understanding business context,
 * avoiding false positives from simple string matching.
 *
 * Example:
 * - HARVEYS (fast food) ≠ CCOKIO (Costco grocery) ✓
 * - HARVEY'S = HARVEYS (same business) ✓
 * - McDONALD'S #123 = McDONALD'S #456 (same chain) ✓
 */

import OpenAI from 'openai';
import type { Transaction } from '@/types/budget';
import { extractVendorName, vendorsMatch } from './vendor-matcher';

/**
 * Find matching vendor transactions using AI (BATCH MODE for performance)
 *
 * @param currentTransaction - Transaction to find matches for
 * @param allTransactions - All transactions to search through
 * @param vendorCache - Pre-computed vendor names for performance
 * @returns Array of matching transactions
 */
export async function aiFindMatchingVendorTransactions(
  currentTransaction: Transaction,
  allTransactions: Transaction[],
  vendorCache: Map<string, string>
): Promise<Transaction[]> {
  const perfStart = performance.now();

  const currentVendor = vendorCache.get(currentTransaction.id) ||
                        extractVendorName(currentTransaction.description);

  if (!currentVendor) return [];

  // Get recent 100 transactions (balance between accuracy and cost)
  const recentTransactions = allTransactions
    .filter(tx => tx.id !== currentTransaction.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 100);

  console.log(`[AI Vendor Match] Searching for "${currentVendor}" in ${recentTransactions.length} transactions`);

  // Check if OpenAI API key is available
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[AI Vendor Match] OpenAI API key not found, falling back to string matching');
    return fallbackStringMatching(currentVendor, recentTransactions, vendorCache);
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Client-side usage (budget app is client-only)
  });

  // Build transaction list for AI with index mapping
  const transactionList = recentTransactions.map((tx, idx) => {
    const vendor = vendorCache.get(tx.id) || extractVendorName(tx.description);
    return `${idx}: "${vendor}"`;
  }).join('\n');

  try {
    // Add timeout to prevent hanging requests (15 seconds)
    const timeoutMs = 15000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await openai.chat.completions.create(
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are a vendor matching expert for financial transactions. Your job is to identify which transactions are from the SAME business/vendor.

MATCHING RULES:
✓ Same business with different locations = MATCH (e.g., "McDonald's #123" and "McDonald's #456")
✓ Same business with typos/abbreviations = MATCH (e.g., "HARVEY'S" and "HARVEYS")
✓ Same brand regardless of formatting = MATCH (e.g., "TIM HORTONS" and "TIMHORTONS")
✗ Different businesses even if similar names = NO MATCH (e.g., "HARVEYS" fast food vs "COSTCO" grocery)
✗ Different brands even if same category = NO MATCH (e.g., "SUBWAY" ≠ "TIM HORTONS" even though both food)
✗ Parent company doesn't matter, only brand = NO MATCH (e.g., "Subway" ≠ "Tim Hortons")

BE STRICT: Only match if you're confident it's the same business/brand.

OUTPUT FORMAT: Return ONLY comma-separated numeric IDs of matching transactions (e.g., "0,5,12,23") or "none" if no matches.`,
            },
            {
              role: 'user',
              content: `Target vendor: "${currentVendor}"\n\nCandidate transactions:\n${transactionList}\n\nWhich transaction IDs match the target vendor?`,
            },
          ],
          temperature: 0.1, // Low temperature for consistent, deterministic results
          max_tokens: 100,
        },
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const answer = response.choices[0].message.content?.trim() || '';
      console.log('[AI Vendor Match] OpenAI response:', answer);

      const perfEnd = performance.now();
      console.log(`[AI Vendor Match] Completed in ${((perfEnd - perfStart) / 1000).toFixed(2)}s`);

      if (answer === 'none' || !answer) {
        console.log('[AI Vendor Match] No matches found');
        return [];
      }

      // Parse matched IDs
      const matchedIndices = answer
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n) && n >= 0 && n < recentTransactions.length);

      const matches = matchedIndices.map(idx => recentTransactions[idx]).filter(Boolean);
      console.log(`[AI Vendor Match] Found ${matches.length} matches:`, matches.map(m => extractVendorName(m.description)));

      return matches;
    } catch (apiError: any) {
      clearTimeout(timeoutId);
      throw apiError;
    }
  } catch (error: any) {
    // Enhanced error handling for connection and API errors
    const errorMessage = error?.message || String(error);
    const errorType = error?.type || error?.code || 'unknown';

    // Detect specific error types
    const isConnectionError =
      errorMessage.includes('Connection error') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorType === 'aborted' ||
      error?.name === 'AbortError';

    const isTimeoutError = errorMessage.includes('timeout') || errorType === 'aborted' || error?.name === 'AbortError';
    const isRateLimitError = error?.status === 429 || errorMessage.includes('rate limit');
    const isAuthError = error?.status === 401 || errorMessage.includes('Invalid API key');
    const isQuotaError = error?.code === 'insufficient_quota' || errorMessage.includes('quota');

    // Log specific error details
    if (isConnectionError || isTimeoutError) {
      console.warn('[AI Vendor Match] Connection/timeout error - falling back to string matching:', errorMessage);
    } else if (isRateLimitError) {
      console.warn('[AI Vendor Match] Rate limit exceeded - falling back to string matching');
    } else if (isAuthError) {
      console.warn('[AI Vendor Match] Authentication error - check API key configuration');
    } else if (isQuotaError) {
      console.warn('[AI Vendor Match] Quota exceeded - falling back to string matching');
    } else {
      console.error('[AI Vendor Match] Unexpected error:', error);
    }

    // Always fall back to string matching on any error
    return fallbackStringMatching(currentVendor, recentTransactions, vendorCache);
  }
}

/**
 * Fallback to string-based matching when AI is unavailable
 * Uses simple substring matching (less accurate but still functional)
 */
function fallbackStringMatching(
  currentVendor: string,
  transactions: Transaction[],
  vendorCache: Map<string, string>
): Transaction[] {
  console.log('[AI Vendor Match] Using fallback string matching');

  return transactions.filter(tx => {
    const txVendor = vendorCache.get(tx.id) || extractVendorName(tx.description);
    return vendorsMatch(currentVendor, txVendor, 90); // Higher threshold (90%) for fallback
  });
}
