/**
 * Enhanced Smart Duplicate Detection with Context
 * Context-aware duplicate detection using merchant normalization, fuzzy matching
 *
 * Features:
 * - Flexible amount tolerance (1% or $0.50, whichever is greater)
 * - Wide date range (±3 days for pending transactions)
 * - Merchant normalization integration
 * - Refund detection (don't flag refunds as duplicates of originals)
 * - Three-tiered confidence scoring (90%+, 70-90%, <70%)
 * - Fuzzy description matching
 * - Privacy-first (cleaned descriptions only)
 *
 * Design Principles:
 * - Conservative: No auto-merge, always user review
 * - Context-aware: Uses enriched merchant names
 * - User-friendly: Clear explanations for matches
 * - Performance: Batch processing, caching
 *
 * CHANGE LOG (2025-11-24):
 * - AI semantic matching disabled by default (useAI: false)
 * - Rule-based detection (exact, fuzzy, merchant) is primary path
 * - AI can be enabled via settings for power users
 */

import { chatCompletionJSON, hasOpenAIKey } from './openai-service';
import type { ParsedTransaction, Transaction } from '@/types/budget';

// ============================================================================
// Types
// ============================================================================

export interface DuplicateMatch {
  newTransaction: ParsedTransaction;
  existingTransaction: Transaction;
  confidence: number; // 0-1 scale
  reason: string; // Explanation of why they match
  matchType: 'exact' | 'fuzzy' | 'semantic' | 'merchant' | 'fitid';
}

export interface SmartDuplicateDetectionOptions {
  enabled?: boolean; // Privacy opt-in flag
  minConfidence?: number; // Minimum confidence threshold (default: 0.7)
  batchSize?: number; // Number of transactions to check at once (default: 10)
  dateToleranceDays?: number; // Date range tolerance (default: 3)
  amountTolerancePercent?: number; // Percentage tolerance (default: 0.01 = 1%)
  amountToleranceFixed?: number; // Fixed dollar tolerance (default: 0.50)
}

export type ConfidenceTier = 'high' | 'medium' | 'low';

interface AIMatchResponse {
  matches: Array<{
    new_index: number;
    existing_id: string;
    is_duplicate: boolean;
    confidence: number;
    reason: string;
    match_type: 'exact' | 'fuzzy' | 'semantic' | 'merchant';
  }>;
  analysis: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clean transaction description for privacy
 * Removes sensitive information before sending to API
 */
function cleanDescription(description: string): string {
  let cleaned = description.trim();

  // Remove account numbers (patterns like XXXX-1234, 1234567890)
  cleaned = cleaned.replace(/\b\d{4}[- ]?\d{4,}\b/g, '');
  cleaned = cleaned.replace(/\bXXXX[- ]?\d{4,}\b/gi, '');

  // Remove transaction IDs (long numeric strings)
  cleaned = cleaned.replace(/\b\d{10,}\b/g, '');

  // Remove common prefixes that don't help with matching
  cleaned = cleaned.replace(/^\[[A-Z]{2}\]\s*/i, ''); // [PR], [OP] etc
  cleaned = cleaned.replace(/^(PURCHASE|DEBIT|CREDIT|PAYMENT|AUTH)\s+/i, '');

  // Remove dates in various formats
  cleaned = cleaned.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '');
  cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}/g, '');

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate fuzzy match score (0-1)
 */
function fuzzyMatchScore(str1: string, str2: string): number {
  const clean1 = str1.toLowerCase().trim();
  const clean2 = str2.toLowerCase().trim();

  if (clean1 === clean2) return 1.0;

  const distance = levenshteinDistance(clean1, clean2);
  const maxLength = Math.max(clean1.length, clean2.length);

  return 1 - distance / maxLength;
}

/**
 * Get confidence tier based on confidence score
 */
export function getConfidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
}

/**
 * Detect if a transaction is likely a refund of another transaction
 */
function isLikelyRefund(
  newTx: ParsedTransaction,
  existingTx: Transaction,
  dateToleranceDays: number = 30
): boolean {
  // Check if amounts are opposite (one negative, one positive)
  const amountsOpposite =
    (newTx.amount < 0 && existingTx.amount > 0) || (newTx.amount > 0 && existingTx.amount < 0);

  if (!amountsOpposite) return false;

  // Check if amounts are similar in magnitude
  const amountMatch = Math.abs(Math.abs(newTx.amount) - Math.abs(existingTx.amount)) < 0.01;

  if (!amountMatch) return false;

  // Check if within date range (refunds usually happen within 30 days)
  const dateDiff = Math.abs(newTx.date.getTime() - existingTx.date.getTime());
  const daysDiff = dateDiff / (24 * 60 * 60 * 1000);

  if (daysDiff > dateToleranceDays) return false;

  // Check if descriptions are similar
  const descriptionSimilarity = fuzzyMatchScore(newTx.description, existingTx.description);

  return descriptionSimilarity > 0.7;
}

// ============================================================================
// Rule-Based Duplicate Detection
// ============================================================================

/**
 * Detect exact matches using FITID (OFX files) or exact criteria
 */
function detectExactMatches(
  newTransactions: ParsedTransaction[],
  existingTransactions: Transaction[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  for (const newTx of newTransactions) {
    // Skip if already marked as duplicate
    if (newTx.isDuplicate) continue;

    // FITID match (perfect match for OFX files)
    if (newTx.fitid) {
      const exactMatch = existingTransactions.find((existing) => existing.fitid === newTx.fitid);
      if (exactMatch) {
        matches.push({
          newTransaction: newTx,
          existingTransaction: exactMatch,
          confidence: 1.0,
          reason: 'Exact FITID match (OFX transaction ID)',
          matchType: 'fitid',
        });
        continue;
      }
    }

    // Exact match: same date, amount, and description
    const exactMatch = existingTransactions.find((existing) => {
      const sameDate = newTx.date.toISOString().split('T')[0] === existing.date.toISOString().split('T')[0];
      const sameAmount = Math.abs(newTx.amount - existing.amount) < 0.01;
      const sameDescription = cleanDescription(newTx.description).toLowerCase() === cleanDescription(existing.description).toLowerCase();

      return sameDate && sameAmount && sameDescription;
    });

    if (exactMatch) {
      matches.push({
        newTransaction: newTx,
        existingTransaction: exactMatch,
        confidence: 1.0,
        reason: 'Exact match (same date, amount, and description)',
        matchType: 'exact',
      });
    }
  }

  return matches;
}

/**
 * Detect fuzzy matches using flexible tolerances
 */
function detectFuzzyMatches(
  newTransactions: ParsedTransaction[],
  existingTransactions: Transaction[],
  options: SmartDuplicateDetectionOptions
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const {
    dateToleranceDays = 3,
    amountTolerancePercent = 0.01, // 1%
    amountToleranceFixed = 0.5, // $0.50
  } = options;

  for (const newTx of newTransactions) {
    // Skip if already marked as duplicate
    if (newTx.isDuplicate) continue;

    for (const existingTx of existingTransactions) {
      // Skip if this is a refund (don't flag refunds as duplicates)
      if (isLikelyRefund(newTx, existingTx)) {
        continue;
      }

      // Date tolerance (±3 days by default)
      const dateDiff = Math.abs(newTx.date.getTime() - existingTx.date.getTime());
      const daysDiff = dateDiff / (24 * 60 * 60 * 1000);

      if (daysDiff > dateToleranceDays) continue;

      // Amount tolerance (1% or $0.50, whichever is greater)
      const amountDiff = Math.abs(newTx.amount - existingTx.amount);
      const percentTolerance = Math.abs(newTx.amount) * amountTolerancePercent;
      const tolerance = Math.max(percentTolerance, amountToleranceFixed);

      if (amountDiff > tolerance) continue;

      // Fuzzy description match
      const descriptionScore = fuzzyMatchScore(newTx.description, existingTx.description);

      if (descriptionScore >= 0.85) {
        // High similarity
        const confidence = Math.min(1.0, descriptionScore + 0.1); // Boost confidence slightly

        matches.push({
          newTransaction: newTx,
          existingTransaction: existingTx,
          confidence,
          reason: `Similar description (${(descriptionScore * 100).toFixed(0)}% match), within ${daysDiff.toFixed(0)} days and $${amountDiff.toFixed(2)}`,
          matchType: 'fuzzy',
        });
      }
    }
  }

  return matches;
}

/**
 * Detect merchant matches using normalized merchant names
 */
function detectMerchantMatches(
  newTransactions: ParsedTransaction[],
  existingTransactions: Transaction[],
  options: SmartDuplicateDetectionOptions
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const { dateToleranceDays = 3, amountTolerancePercent = 0.01, amountToleranceFixed = 0.5 } = options;

  for (const newTx of newTransactions) {
    // Skip if already marked as duplicate or no normalized merchant
    if (newTx.isDuplicate || !(newTx as any).normalizedMerchant) continue;

    const {normalizedMerchant} = (newTx as any);

    for (const existingTx of existingTransactions) {
      // Skip if existing transaction has no category (can't infer merchant)
      if (!existingTx.description) continue;

      // Skip if this is a refund
      if (isLikelyRefund(newTx, existingTx)) continue;

      // Date tolerance
      const dateDiff = Math.abs(newTx.date.getTime() - existingTx.date.getTime());
      const daysDiff = dateDiff / (24 * 60 * 60 * 1000);

      if (daysDiff > dateToleranceDays) continue;

      // Amount tolerance
      const amountDiff = Math.abs(newTx.amount - existingTx.amount);
      const percentTolerance = Math.abs(newTx.amount) * amountTolerancePercent;
      const tolerance = Math.max(percentTolerance, amountToleranceFixed);

      if (amountDiff > tolerance) continue;

      // Check if normalized merchant appears in existing description
      const existingDescLower = existingTx.description.toLowerCase();
      const merchantLower = normalizedMerchant.toLowerCase();

      if (existingDescLower.includes(merchantLower)) {
        const confidence = 0.85; // High but not perfect (no merchant normalization on existing)

        matches.push({
          newTransaction: newTx,
          existingTransaction: existingTx,
          confidence,
          reason: `Same merchant (${normalizedMerchant}), within ${daysDiff.toFixed(0)} days and $${amountDiff.toFixed(2)}`,
          matchType: 'merchant',
        });
      }
    }
  }

  return matches;
}

// ============================================================================
// AI-Powered Duplicate Detection
// ============================================================================

/**
 * Detect semantic matches using AI
 * Only checks transactions that pass basic filters
 */
async function detectSemanticMatches(
  newTransactions: ParsedTransaction[],
  existingTransactions: Transaction[],
  options: SmartDuplicateDetectionOptions
): Promise<DuplicateMatch[]> {
  const { dateToleranceDays = 3, batchSize = 10 } = options;
  const matches: DuplicateMatch[] = [];

  // Early return if AI is not available (no API key configured)
  // This is expected in client-side code - AI features require server-side API routes
  if (!hasOpenAIKey()) {
    console.log('[SmartDuplicate] AI not available, skipping semantic matching (using rule-based detection only)');
    return matches;
  }

  // Filter candidates: within date range
  const candidates: Array<{ newTx: ParsedTransaction; existingTx: Transaction; index: number }> = [];

  newTransactions.forEach((newTx, index) => {
    // Skip if already marked as duplicate
    if (newTx.isDuplicate) return;

    for (const existingTx of existingTransactions) {
      // Date filter
      const dateDiff = Math.abs(newTx.date.getTime() - existingTx.date.getTime());
      const daysDiff = dateDiff / (24 * 60 * 60 * 1000);

      if (daysDiff <= dateToleranceDays) {
        candidates.push({ newTx, existingTx, index });
      }
    }
  });

  if (candidates.length === 0) {
    return matches;
  }

  // Process in batches
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);

    try {
      const prompt = buildSemanticMatchPrompt(batch);
      const response = await chatCompletionJSON<AIMatchResponse>(prompt, {
        model: 'gpt-3.5-turbo',
        temperature: 0.1,
        maxTokens: 800,
        cacheKey: `dup-detect-${batch[0]?.newTx.description.slice(0, 20)}-${batch.length}`,
        systemPrompt:
          'You are a financial transaction duplicate detection system. Be conservative - only mark as duplicates if highly confident they represent the same transaction. Consider merchant variations, pending vs posted transactions, and partial refunds.',
      });

      if (!response.success || !response.data) {
        // Log as warning since this is expected when AI isn't configured
        console.warn('[SmartDuplicate] AI detection skipped for batch', i / batchSize, '- falling back to rule-based detection');
        continue;
      }

      const aiResult = response.data;

      // Map AI results to matches
      aiResult.matches.forEach((match) => {
        if (match.is_duplicate) {
          const candidate = batch[match.new_index];
          if (candidate) {
            matches.push({
              newTransaction: candidate.newTx,
              existingTransaction: candidate.existingTx,
              confidence: match.confidence,
              reason: match.reason,
              matchType: 'semantic',
            });
          }
        }
      });
    } catch (error) {
      // AI not available - this is expected on client-side
      // The caller will fall back to rule-based detection
      console.log('[SmartDuplicate] AI not available, skipping semantic matching');
      break; // No point trying other batches if AI isn't available
    }
  }

  return matches;
}

/**
 * Build AI semantic match prompt
 */
function buildSemanticMatchPrompt(
  candidates: Array<{ newTx: ParsedTransaction; existingTx: Transaction; index: number }>
): string {
  const pairs = candidates.map((c, i) => ({
    index: i,
    new_date: c.newTx.date.toISOString().split('T')[0],
    new_desc: cleanDescription(c.newTx.description).substring(0, 100),
    new_amount: c.newTx.amount.toFixed(2),
    existing_id: c.existingTx.id,
    existing_date: c.existingTx.date.toISOString().split('T')[0],
    existing_desc: cleanDescription(c.existingTx.description).substring(0, 100),
    existing_amount: c.existingTx.amount.toFixed(2),
  }));

  return `Analyze these transaction pairs to detect duplicates. Consider:

**What Makes a Duplicate:**
- Same merchant (e.g., "AMAZON PRIME" = "AMZN MKTP CA")
- Same amount (or very close)
- Similar date (pending → posted, processing delays)
- Same purchase/service

**What's NOT a Duplicate:**
- Refunds (negative amount) vs original purchase (positive)
- Different merchants (even same category)
- Recurring charges at different times
- Partial payments vs full amount

**Transaction Pairs** (${pairs.length} total):
${pairs.map((p) => `${p.index}. NEW: ${p.new_date} | $${p.new_amount} | ${p.new_desc}\n   EXISTING: ${p.existing_date} | $${p.existing_amount} | ${p.existing_desc}`).join('\n\n')}

**Response Format** (JSON only):
{
  "matches": [
    {
      "new_index": 0,
      "existing_id": "tx_123",
      "is_duplicate": true,
      "confidence": 0.95,
      "reason": "Same merchant and amount, posted after pending",
      "match_type": "semantic"
    }
  ],
  "analysis": "Brief summary of patterns detected"
}

IMPORTANT: Only return matches with confidence >= 0.7. Be conservative - false negatives are better than false positives.`;
}

// ============================================================================
// Main Detection Function
// ============================================================================

/**
 * Enhanced duplicate detection combining multiple strategies
 *
 * @param newTransactions - Transactions to check for duplicates
 * @param existingTransactions - Existing transactions in database
 * @param useAI - Whether to use AI for semantic matching (default: false - disabled due to connection issues)
 * @returns Void (marks transactions in-place)
 */
export async function detectDuplicatesEnhanced(
  newTransactions: ParsedTransaction[],
  existingTransactions: Transaction[],
  useAI: boolean = false // Disabled by default - AI semantic matching is optional
): Promise<void> {
  console.log('[SmartDuplicate] Detecting duplicates for', newTransactions.length, 'transactions (AI:', useAI ? 'enabled' : 'disabled', ')...');

  const options: SmartDuplicateDetectionOptions = {
    enabled: useAI,
    minConfidence: 0.7,
    batchSize: 10,
    dateToleranceDays: 3,
    amountTolerancePercent: 0.01, // 1%
    amountToleranceFixed: 0.5, // $0.50
  };

  // Step 1: Exact matches (FITID, exact criteria)
  const exactMatches = detectExactMatches(newTransactions, existingTransactions);
  console.log('[SmartDuplicate] Found', exactMatches.length, 'exact matches');

  // Apply exact matches
  exactMatches.forEach((match) => {
    match.newTransaction.isDuplicate = true;
    match.newTransaction.confidence = match.confidence;
    match.newTransaction.duplicateReason = match.reason;
    match.newTransaction.matchedTransactionId = match.existingTransaction.id;
  });

  // Step 2: Fuzzy matches (flexible tolerances)
  const fuzzyMatches = detectFuzzyMatches(newTransactions, existingTransactions, options);
  console.log('[SmartDuplicate] Found', fuzzyMatches.length, 'fuzzy matches');

  // Apply fuzzy matches (only if confidence >= 0.9 for auto-flagging)
  fuzzyMatches.forEach((match) => {
    if (match.confidence >= 0.9) {
      match.newTransaction.isDuplicate = true;
      match.newTransaction.confidence = match.confidence;
      match.newTransaction.duplicateReason = match.reason;
      match.newTransaction.matchedTransactionId = match.existingTransaction.id;
    } else if (match.confidence >= 0.7) {
      // Medium confidence - flag for review
      match.newTransaction.requiresReview = true;
      match.newTransaction.confidence = match.confidence;
      match.newTransaction.duplicateReason = `Possible duplicate: ${match.reason}`;
      match.newTransaction.matchedTransactionId = match.existingTransaction.id;
    }
  });

  // Step 3: Merchant matches (using normalized merchants from enrichment)
  const merchantMatches = detectMerchantMatches(newTransactions, existingTransactions, options);
  console.log('[SmartDuplicate] Found', merchantMatches.length, 'merchant matches');

  // Apply merchant matches
  merchantMatches.forEach((match) => {
    if (!match.newTransaction.isDuplicate) {
      // Don't override exact/fuzzy matches
      match.newTransaction.isDuplicate = match.confidence >= 0.9;
      match.newTransaction.confidence = match.confidence;
      match.newTransaction.duplicateReason = match.reason;
      match.newTransaction.matchedTransactionId = match.existingTransaction.id;

      if (match.confidence >= 0.7 && match.confidence < 0.9) {
        match.newTransaction.requiresReview = true;
      }
    }
  });

  // Step 4: AI semantic matches (if enabled)
  if (useAI) {
    try {
      const semanticMatches = await detectSemanticMatches(newTransactions, existingTransactions, options);
      console.log('[SmartDuplicate] Found', semanticMatches.length, 'semantic matches');

      // Apply semantic matches
      semanticMatches.forEach((match) => {
        if (!match.newTransaction.isDuplicate) {
          // Don't override existing matches
          match.newTransaction.isDuplicate = match.confidence >= 0.9;
          match.newTransaction.confidence = match.confidence;
          match.newTransaction.duplicateReason = `AI: ${match.reason}`;
          match.newTransaction.matchedTransactionId = match.existingTransaction.id;

          if (match.confidence >= 0.7 && match.confidence < 0.9) {
            match.newTransaction.requiresReview = true;
          }
        }
      });
    } catch (error) {
      // AI not available on client-side - this is expected
      // Gracefully degrade to rule-based detection (exact + fuzzy + merchant)
      console.log('[SmartDuplicate] Using rule-based duplicate detection (AI requires server-side)');
    }
  }

  const duplicateCount = newTransactions.filter((tx) => tx.isDuplicate).length;
  const reviewCount = newTransactions.filter((tx) => tx.requiresReview).length;

  console.log(
    '[SmartDuplicate] Detection complete:',
    duplicateCount,
    'duplicates,',
    reviewCount,
    'for review'
  );
}

/**
 * Backward compatibility: Original function signature
 */
export async function detectSmartDuplicates(
  newTransactions: ParsedTransaction[],
  existingTransactions: Transaction[],
  options: SmartDuplicateDetectionOptions = {}
): Promise<DuplicateMatch[]> {
  // For backward compatibility, collect all matches
  const allMatches: DuplicateMatch[] = [];

  const exactMatches = detectExactMatches(newTransactions, existingTransactions);
  const fuzzyMatches = detectFuzzyMatches(newTransactions, existingTransactions, options);
  const merchantMatches = detectMerchantMatches(newTransactions, existingTransactions, options);

  allMatches.push(...exactMatches, ...fuzzyMatches, ...merchantMatches);

  if (options.enabled) {
    const semanticMatches = await detectSemanticMatches(newTransactions, existingTransactions, options);
    allMatches.push(...semanticMatches);
  }

  return allMatches;
}
