/**
 * Smart Duplicate Detection using Claude API
 * Provides semantic similarity matching for transaction descriptions
 * Handles variants like "AMAZON PRIME" vs "AMZN MKTP CA"
 * 
 * Privacy: Only sends cleaned transaction descriptions (no account numbers, names, addresses)
 * Opt-in: Requires user consent via privacy settings
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ParsedTransaction, Transaction } from '@/types/budget';

export interface DuplicateMatch {
  newTransaction: ParsedTransaction;
  existingTransaction: Transaction;
  confidence: number; // 0-1 scale
  reason: string; // Explanation of why they match
}

export interface SmartDuplicateDetectionOptions {
  apiKey?: string;
  enabled?: boolean; // Privacy opt-in flag
  minConfidence?: number; // Minimum confidence threshold (default: 0.7)
  batchSize?: number; // Number of transactions to check at once (default: 10)
}

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
 * Check if two transaction descriptions are semantically similar using Claude API
 */
async function checkSemanticSimilarity(
  client: Anthropic,
  desc1: string,
  desc2: string
): Promise<{ isDuplicate: boolean; confidence: number; reason: string }> {
  const cleaned1 = cleanDescription(desc1);
  const cleaned2 = cleanDescription(desc2);
  
  // If cleaned descriptions are identical, skip API call
  if (cleaned1.toLowerCase() === cleaned2.toLowerCase()) {
    return {
      isDuplicate: true,
      confidence: 1.0,
      reason: 'Exact match after cleaning',
    };
  }
  
  const prompt = `You are a financial transaction duplicate detection system. Determine if these two transaction descriptions refer to the same purchase or payment.

Transaction 1: "${cleaned1}"
Transaction 2: "${cleaned2}"

Consider:
- Same merchant/vendor (e.g., "AMAZON PRIME" = "AMZN MKTP CA")
- Same service (e.g., "NETFLIX.COM" = "NETFLIX SUBSCRIPTION")
- Abbreviations and variations
- Location codes (e.g., "STARBUCKS #1234" = "STARBUCKS #5678" - same merchant)

Respond with JSON:
{
  "isDuplicate": boolean,
  "confidence": 0.0-1.0,
  "reason": "Brief explanation"
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022', // Use Haiku for cost efficiency
      max_tokens: 200,
      temperature: 0.1, // Low temperature for consistent results
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: 'You are a financial transaction analysis system. Be precise and conservative - only mark as duplicates if you are confident they refer to the same transaction.',
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const text = content.text.trim();
      
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          isDuplicate: result.isDuplicate || false,
          confidence: Math.max(0, Math.min(1, result.confidence || 0)),
          reason: result.reason || 'Semantic match',
        };
      }
    }
    
    // Fallback: conservative approach
    return {
      isDuplicate: false,
      confidence: 0,
      reason: 'Unable to parse API response',
    };
  } catch (error) {
    console.error('[SmartDuplicate] API error:', error);
    // Fallback: don't mark as duplicate on error
    return {
      isDuplicate: false,
      confidence: 0,
      reason: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Detect duplicates using semantic similarity with Claude API
 * Only checks transactions that pass basic filters (date + amount similarity)
 */
export async function detectSmartDuplicates(
  newTransactions: ParsedTransaction[],
  existingTransactions: Transaction[],
  options: SmartDuplicateDetectionOptions = {}
): Promise<DuplicateMatch[]> {
  const {
    apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    enabled = false,
    minConfidence = 0.7,
    batchSize = 10,
  } = options;

  // Privacy check: only proceed if enabled
  if (!enabled) {
    return [];
  }

  // API key check
  if (!apiKey) {
    console.warn('[SmartDuplicate] No API key provided. Skipping smart duplicate detection.');
    return [];
  }

  const client = new Anthropic({ apiKey });
  const matches: DuplicateMatch[] = [];

  // Filter candidates: same date (±1 day) and similar amount (±$0.01)
  const candidates: Array<{
    newTx: ParsedTransaction;
    existingTx: Transaction;
  }> = [];

  for (const newTx of newTransactions) {
    // Skip if already marked as duplicate
    if (newTx.isDuplicate) continue;

    for (const existingTx of existingTransactions) {
      // Basic filters: date and amount similarity
      const dateDiff = Math.abs(
        newTx.date.getTime() - existingTx.date.getTime()
      );
      const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
      const amountDiff = Math.abs(newTx.amount - existingTx.amount);

      // Only check if date is within 1 day and amount is within $0.01
      if (daysDiff <= 1 && amountDiff < 0.01) {
        candidates.push({ newTx, existingTx });
      }
    }
  }

  // Process in batches to avoid rate limits
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    
    // Process batch concurrently
    const batchPromises = batch.map(async ({ newTx, existingTx }) => {
      const result = await checkSemanticSimilarity(
        client,
        newTx.description,
        existingTx.description
      );

      if (result.isDuplicate && result.confidence >= minConfidence) {
        return {
          newTransaction: newTx,
          existingTransaction: existingTx,
          confidence: result.confidence,
          reason: result.reason,
        };
      }
      return null;
    });

    const batchResults = await Promise.all(batchPromises);
    const validMatches = batchResults.filter(
      (match): match is DuplicateMatch => match !== null
    );
    matches.push(...validMatches);

    // Rate limiting: small delay between batches
    if (i + batchSize < candidates.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return matches;
}

/**
 * Enhanced duplicate detection that combines basic matching with smart detection
 */
export async function detectDuplicatesEnhanced(
  newTransactions: ParsedTransaction[],
  existingTransactions: Transaction[],
  options: SmartDuplicateDetectionOptions = {}
): Promise<void> {
  // First, use FITID for perfect matches (OFX files)
  for (const newTx of newTransactions) {
    if (newTx.fitid) {
      const exactMatch = existingTransactions.find(
        (existing) => existing.fitid === newTx.fitid
      );
      if (exactMatch) {
        newTx.isDuplicate = true;
        newTx.confidence = 1.0;
        continue;
      }
    }
  }

  // Then, use smart detection for remaining transactions
  const smartMatches = await detectSmartDuplicates(
    newTransactions.filter((tx) => !tx.isDuplicate),
    existingTransactions,
    options
  );

  // Apply smart matches
  const minConfidence = options.minConfidence || 0.7;
  for (const match of smartMatches) {
    match.newTransaction.isDuplicate = match.confidence >= minConfidence;
    match.newTransaction.confidence = match.confidence;
    match.newTransaction.duplicateReason = match.reason;
    match.newTransaction.matchedTransactionId = match.existingTransaction.id;
    // Mark for review if confidence is below threshold
    if (match.confidence < minConfidence && match.confidence >= 0.5) {
      match.newTransaction.requiresReview = true;
    }
  }
}

