/**
 * Smart Transaction Enrichment
 * Enriches transactions with normalized merchant names, enhanced categories, and recurring patterns
 *
 * Features:
 * - Merchant name normalization (e.g., "AMZN MKTP*" → "Amazon")
 * - Enhanced category suggestions with confidence scores
 * - Recurring transaction detection
 * - In-memory caching for performance
 * - Batch processing for efficiency
 * - Graceful degradation on failures
 *
 * Design Principles:
 * - Non-blocking: Optional enhancement, not critical path
 * - Performance: Cache + batch processing
 * - Privacy: Minimal PII in AI calls
 * - Resilience: Fail gracefully, return partial results
 *
 * CHANGE LOG (2025-11-24):
 * - AI enrichment disabled by default (useAI: false)
 * - Rule-based + database enrichment is primary path
 * - AI can be enabled via settings for power users
 */

import { chatCompletionJSON } from "./openai-service";
import type { ParsedTransaction } from "@/types/budget";
import { lookupMerchant, lookupCategoryPattern } from "@/lib/collective-learning-service";

// ============================================================================
// Types
// ============================================================================

export interface EnrichedTransaction extends ParsedTransaction {
  // Merchant enrichment
  normalizedMerchant?: string; // Clean merchant name
  merchantConfidence?: number; // 0-1 confidence in normalization

  // Enhanced categorization
  suggestedCategory?: string;
  suggestedSubcategory?: string;
  categoryConfidence?: number; // 0-1 confidence in category

  // Recurring detection
  isLikelyRecurring?: boolean;
  recurringFrequency?: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
  recurringConfidence?: number; // 0-1 confidence in recurring pattern

  // Metadata
  enrichmentTimestamp?: Date;
  enrichmentSource?: "ai" | "cache" | "rules" | "database";
}

export interface EnrichmentResult {
  success: boolean;
  enrichedCount: number;
  totalCount: number;
  errors: string[];
  cacheHitRate?: number; // For diagnostics
}

interface MerchantNormalizationCache {
  [rawMerchant: string]: {
    normalized: string;
    confidence: number;
    timestamp: Date;
  };
}

interface AIEnrichmentResponse {
  enrichments: Array<{
    index: number;
    normalized_merchant: string;
    merchant_confidence: number;
    suggested_category: string;
    suggested_subcategory: string;
    category_confidence: number;
    is_likely_recurring: boolean;
    recurring_frequency?: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
    recurring_confidence: number;
  }>;
  patterns_detected: string;
}

// ============================================================================
// Cache Management (In-Memory LRU)
// ============================================================================

// Simple in-memory cache for merchant normalization
const merchantCache: MerchantNormalizationCache = {};
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_MAX_SIZE = 1000; // Max cached entries

/**
 * Get merchant normalization from cache
 */
function getCachedMerchant(rawMerchant: string): { normalized: string; confidence: number } | null {
  const key = rawMerchant.trim().toLowerCase();
  const cached = merchantCache[key];

  if (!cached) return null;

  // Check if cache entry is expired
  const age = Date.now() - cached.timestamp.getTime();
  if (age > CACHE_MAX_AGE_MS) {
    delete merchantCache[key];
    return null;
  }

  return {
    normalized: cached.normalized,
    confidence: cached.confidence,
  };
}

/**
 * Store merchant normalization in cache
 */
function cacheMerchant(rawMerchant: string, normalized: string, confidence: number): void {
  const key = rawMerchant.trim().toLowerCase();

  // Simple LRU: If cache is full, remove oldest entries
  const cacheSize = Object.keys(merchantCache).length;
  if (cacheSize >= CACHE_MAX_SIZE) {
    // Find and remove 10% oldest entries
    const entries = Object.entries(merchantCache)
      .map(([k, v]) => ({ key: k, timestamp: v.timestamp }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const removeCount = Math.floor(CACHE_MAX_SIZE * 0.1);
    entries.slice(0, removeCount).forEach((entry) => {
      delete merchantCache[entry.key];
    });
  }

  merchantCache[key] = {
    normalized,
    confidence,
    timestamp: new Date(),
  };
}

/**
 * Clear expired cache entries (for cleanup)
 */
export function cleanupMerchantCache(): number {
  const now = Date.now();
  let removedCount = 0;

  Object.keys(merchantCache).forEach((key) => {
    const age = now - merchantCache[key].timestamp.getTime();
    if (age > CACHE_MAX_AGE_MS) {
      delete merchantCache[key];
      removedCount++;
    }
  });

  return removedCount;
}

// ============================================================================
// Rule-Based Enrichment (Fast Path)
// ============================================================================

/**
 * Apply rule-based merchant normalization
 * Fast path before AI - handles common patterns
 */
function applyRuleBasedNormalization(description: string): {
  normalized: string;
  confidence: number;
} | null {
  const desc = description.trim().toUpperCase();

  // Common merchant patterns with high confidence
  const patterns: Array<{ regex: RegExp; name: string; confidence: number }> = [
    // Amazon
    { regex: /AMZ\*?N|AMAZON\.COM|AMZN\s*MKTP/i, name: "Amazon", confidence: 0.95 },

    // Payment processors
    { regex: /PAYPAL\s*\*?/i, name: "PayPal", confidence: 0.95 },
    { regex: /SQ\s*\*|SQUARE\s*\*/i, name: "Square", confidence: 0.9 },
    { regex: /STRIPE\s*\*/i, name: "Stripe", confidence: 0.9 },

    // Coffee shops
    { regex: /STARBUCKS/i, name: "Starbucks", confidence: 0.95 },
    { regex: /TIM\s*HORTONS?/i, name: "Tim Hortons", confidence: 0.95 },

    // Grocery
    { regex: /WALMART|WAL-MART/i, name: "Walmart", confidence: 0.95 },
    { regex: /COSTCO/i, name: "Costco", confidence: 0.95 },
    { regex: /WHOLE\s*FOODS/i, name: "Whole Foods", confidence: 0.95 },

    // Gas stations
    { regex: /SHELL\s*(OIL|GAS)?/i, name: "Shell", confidence: 0.9 },
    { regex: /ESSO/i, name: "Esso", confidence: 0.9 },
    { regex: /PETRO-?CANADA/i, name: "Petro-Canada", confidence: 0.9 },

    // Fast food
    { regex: /MCDONALD'?S/i, name: "McDonald's", confidence: 0.95 },
    { regex: /SUBWAY/i, name: "Subway", confidence: 0.9 },

    // Utilities (keep generic)
    { regex: /HYDRO\s*ONE/i, name: "Hydro One", confidence: 0.95 },
    { regex: /ROGERS\s*(COMM|WIRELESS)?/i, name: "Rogers", confidence: 0.9 },
    { regex: /BELL\s*CANADA/i, name: "Bell Canada", confidence: 0.9 },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(desc)) {
      return {
        normalized: pattern.name,
        confidence: pattern.confidence,
      };
    }
  }

  return null;
}

/**
 * Detect recurring transaction patterns using simple heuristics
 */
function detectRecurringPattern(
  transaction: ParsedTransaction,
  allTransactions: ParsedTransaction[]
): {
  isLikelyRecurring: boolean;
  frequency?: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
  confidence: number;
} {
  // Look for similar transactions (same merchant/amount)
  const similar = allTransactions.filter((tx) => {
    // Same description (fuzzy match)
    const descMatch =
      tx.description.toLowerCase().trim() === transaction.description.toLowerCase().trim();

    // Same amount (within 1%)
    const amountMatch =
      Math.abs(tx.amount - transaction.amount) < Math.abs(transaction.amount) * 0.01;

    return descMatch && amountMatch && tx !== transaction;
  });

  // Need at least 2 similar transactions to detect pattern
  if (similar.length < 2) {
    return { isLikelyRecurring: false, confidence: 0 };
  }

  // Calculate average time between transactions
  const dates = [transaction.date, ...similar.map((tx) => tx.date)].sort(
    (a, b) => a.getTime() - b.getTime()
  );

  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const daysDiff = (dates[i].getTime() - dates[i - 1].getTime()) / (24 * 60 * 60 * 1000);
    intervals.push(daysDiff);
  }

  const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  const variance =
    intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  // Low variance = more likely recurring
  const consistencyScore = 1 / (1 + stdDev / avgInterval);

  // Classify frequency
  let frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly" | undefined;
  if (avgInterval >= 6 && avgInterval <= 8) frequency = "weekly";
  else if (avgInterval >= 13 && avgInterval <= 15) frequency = "biweekly";
  else if (avgInterval >= 28 && avgInterval <= 32) frequency = "monthly";
  else if (avgInterval >= 88 && avgInterval <= 95) frequency = "quarterly";
  else if (avgInterval >= 360 && avgInterval <= 370) frequency = "yearly";

  const isLikelyRecurring = frequency !== undefined && consistencyScore > 0.7;

  return {
    isLikelyRecurring,
    frequency,
    confidence: isLikelyRecurring ? consistencyScore : 0,
  };
}

// ============================================================================
// AI-Powered Enrichment (Deep Analysis)
// ============================================================================

/**
 * Enrich transactions using AI
 * Batches transactions for efficiency
 */
async function enrichWithAI(
  transactions: ParsedTransaction[]
): Promise<Map<number, EnrichedTransaction>> {
  const enrichedMap = new Map<number, EnrichedTransaction>();

  // Limit batch size to avoid token overflow
  const batchSize = 20;
  const batches: ParsedTransaction[][] = [];
  for (let i = 0; i < transactions.length; i += batchSize) {
    batches.push(transactions.slice(i, i + batchSize));
  }

  console.log("[TransactionEnrichment] Processing", batches.length, "batches of", batchSize);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const prompt = buildEnrichmentPrompt(batch);

    try {
      const response = await chatCompletionJSON<AIEnrichmentResponse>(prompt, {
        model: "gpt-3.5-turbo",
        temperature: 0.3,
        maxTokens: 1000,
        cacheKey: `tx-enrich-${batch[0]?.description.slice(0, 20)}-${batch.length}`,
        systemPrompt:
          "You are an expert financial transaction analyzer. Normalize merchant names, suggest categories, and detect recurring patterns. Respond with valid JSON only.",
      });

      if (!response.success || !response.data) {
        console.error(
          "[TransactionEnrichment] AI enrichment failed for batch",
          batchIndex,
          response.error
        );
        continue;
      }

      const aiResult = response.data;

      // Map AI results to transactions
      aiResult.enrichments.forEach((enrichment) => {
        const globalIndex = batchIndex * batchSize + enrichment.index;
        const transaction = transactions[globalIndex];

        if (transaction) {
          enrichedMap.set(globalIndex, {
            ...transaction,
            normalizedMerchant: enrichment.normalized_merchant,
            merchantConfidence: enrichment.merchant_confidence,
            suggestedCategory: enrichment.suggested_category,
            suggestedSubcategory: enrichment.suggested_subcategory,
            categoryConfidence: enrichment.category_confidence,
            isLikelyRecurring: enrichment.is_likely_recurring,
            recurringFrequency: enrichment.recurring_frequency,
            recurringConfidence: enrichment.recurring_confidence,
            enrichmentTimestamp: new Date(),
            enrichmentSource: "ai",
          });

          // Cache merchant normalization
          if (enrichment.normalized_merchant && enrichment.merchant_confidence >= 0.7) {
            cacheMerchant(
              transaction.description,
              enrichment.normalized_merchant,
              enrichment.merchant_confidence
            );
          }
        }
      });
    } catch (error) {
      console.error("[TransactionEnrichment] Error enriching batch", batchIndex, error);
    }
  }

  return enrichedMap;
}

/**
 * Build AI enrichment prompt
 */
function buildEnrichmentPrompt(transactions: ParsedTransaction[]): string {
  const txSamples = transactions.map((tx, i) => ({
    index: i,
    description: tx.description.substring(0, 100),
    amount: tx.amount.toFixed(2),
    date: tx.date.toISOString().split("T")[0],
  }));

  return `Analyze these bank transactions and enrich them with normalized merchant names, category suggestions, and recurring patterns.

**Transactions** (${transactions.length} total):
${txSamples.map((tx) => `${tx.index}. ${tx.date} | $${tx.amount} | ${tx.description}`).join("\n")}

**Task**: For each transaction, provide:
1. **Normalized Merchant**: Clean, user-friendly merchant name (e.g., "AMZN MKTP*" → "Amazon")
2. **Category Suggestion**: Main category (e.g., "Food & Dining", "Shopping", "Transportation")
3. **Subcategory**: More specific (e.g., "Groceries", "Gas", "Coffee Shops")
4. **Recurring Detection**: Whether this looks like a recurring charge (subscription, utility, etc.)

**Categories**: Use these standard categories:
- Food & Dining (subcategories: Groceries, Restaurants, Coffee Shops, Fast Food)
- Shopping (subcategories: Online, Retail, Electronics, Clothing)
- Transportation (subcategories: Gas, Public Transit, Parking, Rideshare)
- Bills & Utilities (subcategories: Phone, Internet, Electric, Water, Gas)
- Entertainment (subcategories: Streaming, Movies, Events, Hobbies)
- Health & Fitness (subcategories: Pharmacy, Doctor, Gym, Sports)
- Personal Care (subcategories: Hair, Beauty, Spa)
- Home (subcategories: Rent, Mortgage, Repairs, Furniture)
- Other

**Response Format** (JSON only):
{
  "enrichments": [
    {
      "index": 0,
      "normalized_merchant": "Amazon",
      "merchant_confidence": 0.95,
      "suggested_category": "Shopping",
      "suggested_subcategory": "Online",
      "category_confidence": 0.9,
      "is_likely_recurring": false,
      "recurring_confidence": 0.1
    }
  ],
  "patterns_detected": "Brief summary of patterns you noticed"
}

IMPORTANT:
- Only return high-confidence normalizations (>0.7)
- Use "Other" category if uncertain
- recurring_frequency only if is_likely_recurring=true (weekly, biweekly, monthly, quarterly, yearly)`;
}

// ============================================================================
// Main Enrichment Function
// ============================================================================

/**
 * Enrich transactions with merchant normalization, categories, and recurring detection
 *
 * @param transactions - Transactions to enrich
 * @param useAI - Whether to use AI for enrichment (default: false - disabled due to connection issues)
 * @returns Enriched transactions and result summary
 */
export async function enrichTransactions(
  transactions: ParsedTransaction[],
  useAI: boolean = false // Disabled by default - AI enrichment is optional enhancement
): Promise<{ enriched: EnrichedTransaction[]; result: EnrichmentResult }> {
  console.log(
    "[TransactionEnrichment] Enriching",
    transactions.length,
    "transactions (AI:",
    useAI ? "enabled" : "disabled",
    ")..."
  );

  const enriched: EnrichedTransaction[] = [];
  const errors: string[] = [];
  let cacheHits = 0;
  let enrichedCount = 0;

  // Step 1: Apply collective learning + rule-based normalization + recurring detection
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const enrichedTx: EnrichedTransaction = { ...tx };

    // Step 1a: Check collective learning database first (global knowledge)
    try {
      const dbMerchant = await lookupMerchant(tx.description);
      if (dbMerchant && dbMerchant.confidence >= 0.7) {
        enrichedTx.normalizedMerchant = dbMerchant.canonicalName;
        enrichedTx.merchantConfidence = dbMerchant.confidence;
        enrichedTx.suggestedCategory = dbMerchant.category;
        enrichedTx.suggestedSubcategory = dbMerchant.subcategory;
        enrichedTx.categoryConfidence = dbMerchant.confidence;
        enrichedTx.isLikelyRecurring = dbMerchant.isSubscription;
        enrichedTx.enrichmentSource = "database";
        enrichedCount++;

        // Also check for category pattern
        const dbCategory = await lookupCategoryPattern(tx.description);
        if (dbCategory && dbCategory.confidence > (enrichedTx.categoryConfidence || 0)) {
          enrichedTx.suggestedCategory = dbCategory.category;
          enrichedTx.suggestedSubcategory = dbCategory.subcategory;
          enrichedTx.categoryConfidence = dbCategory.confidence;
        }

        enriched.push(enrichedTx);
        continue; // Skip to next transaction
      }
    } catch (error) {
      console.warn("[TransactionEnrichment] Database lookup failed:", error);
      // Continue with fallback methods
    }

    // Step 1b: Check local cache (session memory)
    const cached = getCachedMerchant(tx.description);
    if (cached) {
      enrichedTx.normalizedMerchant = cached.normalized;
      enrichedTx.merchantConfidence = cached.confidence;
      enrichedTx.enrichmentSource = "cache";
      cacheHits++;
      enrichedCount++;
    } else {
      // Step 1c: Try rule-based normalization (hardcoded patterns)
      const ruleResult = applyRuleBasedNormalization(tx.description);
      if (ruleResult) {
        enrichedTx.normalizedMerchant = ruleResult.normalized;
        enrichedTx.merchantConfidence = ruleResult.confidence;
        enrichedTx.enrichmentSource = "rules";
        enrichedCount++;

        // Cache rule-based results
        cacheMerchant(tx.description, ruleResult.normalized, ruleResult.confidence);
      }
    }

    // Detect recurring patterns
    const recurringResult = detectRecurringPattern(tx, transactions);
    if (recurringResult.isLikelyRecurring) {
      enrichedTx.isLikelyRecurring = recurringResult.isLikelyRecurring;
      enrichedTx.recurringFrequency = recurringResult.frequency;
      enrichedTx.recurringConfidence = recurringResult.confidence;
    }

    enriched.push(enrichedTx);
  }

  console.log(
    "[TransactionEnrichment] Rule-based enrichment:",
    enrichedCount,
    "enriched,",
    cacheHits,
    "cache hits"
  );

  // Step 2: AI enrichment for remaining transactions (if enabled)
  if (useAI) {
    // Only send transactions that weren't enriched by rules/cache
    const unenrichedIndices: number[] = [];
    const unenrichedTransactions: ParsedTransaction[] = [];

    enriched.forEach((tx, index) => {
      if (!tx.normalizedMerchant || !tx.suggestedCategory) {
        unenrichedIndices.push(index);
        unenrichedTransactions.push(tx);
      }
    });

    if (unenrichedTransactions.length > 0) {
      console.log(
        "[TransactionEnrichment] AI enriching",
        unenrichedTransactions.length,
        "transactions..."
      );

      try {
        const aiEnriched = await enrichWithAI(unenrichedTransactions);

        // Merge AI results back into enriched array
        aiEnriched.forEach((aiTx, localIndex) => {
          const globalIndex = unenrichedIndices[localIndex];
          enriched[globalIndex] = aiTx;
          enrichedCount++;
        });

        console.log("[TransactionEnrichment] AI enrichment complete:", aiEnriched.size, "enriched");
      } catch (error) {
        console.error("[TransactionEnrichment] AI enrichment error:", error);
        errors.push(error instanceof Error ? error.message : "AI enrichment failed");
      }
    }
  }

  const cacheHitRate = transactions.length > 0 ? cacheHits / transactions.length : 0;

  return {
    enriched,
    result: {
      success: errors.length === 0,
      enrichedCount,
      totalCount: transactions.length,
      errors,
      cacheHitRate,
    },
  };
}
