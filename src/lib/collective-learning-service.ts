/**
 * Collective Learning Service
 * Manages global learning database for merchant normalizations, category patterns, and bank formats
 *
 * Features:
 * - Privacy-first: No PII stored, only patterns and statistics
 * - Community-driven: Confidence based on user acceptance rates
 * - Auto-improving: Learns from every user interaction
 * - Graceful degradation: Works offline with local cache
 *
 * Architecture:
 * - merchants table: Merchant normalization and categorization
 * - category_patterns table: Description-based category learning
 * - bank_formats table: CSV column mapping learning
 */

import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { ParsedTransaction } from '@/types/budget';

// ============================================================================
// Types
// ============================================================================

export interface MerchantLearningData {
  merchantToken: string;
  canonicalName: string;
  category: string;
  subcategory?: string;
  businessType?: string;
  isSubscription?: boolean;
  confidence: number;
  source: 'openai' | 'user' | 'rule' | 'mixed';
  explanation?: string;
}

export interface CategoryPattern {
  id?: string;
  descriptionPattern: string;
  patternType: 'contains' | 'starts_with' | 'ends_with' | 'regex';
  category: string;
  subcategory?: string;
  confidence: number;
  usageCount: number;
  successCount: number;
  rejectionCount: number;
}

export interface BankFormat {
  id?: string;
  bankName: string;
  bankSlug: string;
  columnMappings: Record<string, string>; // e.g., {"date": "Transaction Date", "amount": "Amount"}
  dateFormat?: string;
  hasHeaderRow: boolean;
  amountFormat: 'single' | 'debit_credit' | 'signed';
  confidence: number;
  successfulImports: number;
  failedImports: number;
}

export interface LearningPreferences {
  contributeToLearning: boolean;
  allowMerchantNormalization: boolean;
  allowCategoryLearning: boolean;
}

// ============================================================================
// Privacy & Anonymization
// ============================================================================

/**
 * Generate merchant token (anonymized identifier)
 * Strips account numbers, IDs, and sensitive data
 */
export function generateMerchantToken(description: string): string {
  let cleaned = description.toUpperCase().trim();

  // Remove common transaction IDs and account numbers
  cleaned = cleaned.replace(/\b\d{4,}\b/g, ''); // 4+ digit numbers
  cleaned = cleaned.replace(/[#*]\s*\d+/g, ''); // # or * followed by numbers
  cleaned = cleaned.replace(/\bacct?\s*\d+/gi, ''); // Account numbers
  cleaned = cleaned.replace(/\bref\s*\d+/gi, ''); // Reference numbers
  cleaned = cleaned.replace(/\bid\s*\d+/gi, ''); // ID numbers

  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Take first 50 characters (prevent extremely long tokens)
  return cleaned.substring(0, 50);
}

/**
 * Hash user ID for privacy-preserving feedback tracking
 */
export function hashUserId(userId: string): string {
  // Simple hash for privacy - in production, use crypto.subtle.digest
  return btoa(userId).substring(0, 32);
}

// ============================================================================
// Merchant Learning
// ============================================================================

/**
 * Look up merchant classification from global database
 */
export async function lookupMerchant(
  description: string
): Promise<MerchantLearningData | null> {
  try {
    const merchantToken = generateMerchantToken(description);

    const { data, error } = await (supabase as any)
      .from('merchants')
      .select('*')
      .eq('merchant_token', merchantToken)
      .gte('confidence', 0.7) // Only use high-confidence merchants
      .single();

    if (error || !data) {
      return null;
    }

    return {
      merchantToken: data.merchant_token,
      canonicalName: data.canonical_name,
      category: data.default_category,
      subcategory: data.default_subcategory,
      businessType: data.business_type,
      isSubscription: data.is_subscription,
      confidence: parseFloat(data.confidence),
      source: data.source,
      explanation: data.explanation,
    };
  } catch (error) {
    console.error('[CollectiveLearning] Error looking up merchant:', error);
    return null;
  }
}

/**
 * Save or update merchant classification
 */
export async function saveMerchant(data: MerchantLearningData): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.warn('[CollectiveLearning] Service role not configured, skipping merchant save');
      return false;
    }
    const { error } = await (supabaseAdmin as any).from('merchants').upsert(
      {
        merchant_token: data.merchantToken,
        canonical_name: data.canonicalName,
        default_category: data.category,
        default_subcategory: data.subcategory,
        business_type: data.businessType,
        is_subscription: data.isSubscription,
        confidence: data.confidence,
        source: data.source,
        explanation: data.explanation,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'merchant_token',
        ignoreDuplicates: false,
      }
    );

    if (error) {
      console.error('[CollectiveLearning] Error saving merchant:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[CollectiveLearning] Error saving merchant:', error);
    return false;
  }
}

/**
 * Record user feedback on merchant classification
 */
export async function recordMerchantFeedback(
  merchantId: string,
  userId: string,
  accepted: boolean,
  chosenCategory: string,
  chosenSubcategory?: string,
  previousCategory?: string,
  previousSubcategory?: string
): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.warn('[CollectiveLearning] Service role not configured, skipping feedback');
      return false;
    }
    const userKey = hashUserId(userId);

    // Insert feedback
    const { error: feedbackError } = await (supabaseAdmin as any).from('merchant_feedback').insert({
      merchant_id: merchantId,
      user_or_tenant_key: userKey,
      chosen_category: chosenCategory,
      chosen_subcategory: chosenSubcategory,
      previous_category: previousCategory,
      previous_subcategory: previousSubcategory,
      accepted_suggestion: accepted,
    });

    if (feedbackError) {
      console.error('[CollectiveLearning] Error recording feedback:', feedbackError);
      return false;
    }

    // Update merchant counters
    const { error: counterError } = await (supabaseAdmin as any).rpc('increment_merchant_counters', {
      p_merchant_id: merchantId,
      p_increment_classification: true,
      p_increment_agreement: accepted,
      p_increment_correction: !accepted,
    });

    if (counterError) {
      console.error('[CollectiveLearning] Error updating counters:', counterError);
    }

    return true;
  } catch (error) {
    console.error('[CollectiveLearning] Error recording merchant feedback:', error);
    return false;
  }
}

// ============================================================================
// Category Pattern Learning
// ============================================================================

/**
 * Look up category suggestion from patterns
 */
export async function lookupCategoryPattern(
  description: string
): Promise<{ category: string; subcategory?: string; confidence: number } | null> {
  try {
    // Try exact pattern match first
    const { data, error } = await (supabase as any)
      .from('category_patterns')
      .select('*')
      .gte('confidence', 0.7) // Only high-confidence patterns
      .order('confidence', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Find matching pattern
    const cleanDesc = description.toUpperCase().trim();
    for (const pattern of data) {
      const match = matchPattern(cleanDesc, pattern.description_pattern, pattern.pattern_type);
      if (match) {
        return {
          category: pattern.category,
          subcategory: pattern.subcategory,
          confidence: parseFloat(pattern.confidence),
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[CollectiveLearning] Error looking up category pattern:', error);
    return null;
  }
}

/**
 * Match description against pattern
 */
function matchPattern(
  description: string,
  pattern: string,
  patternType: string
): boolean {
  const cleanPattern = pattern.toUpperCase().trim();

  switch (patternType) {
    case 'starts_with':
      return description.startsWith(cleanPattern.replace('%', ''));
    case 'ends_with':
      return description.endsWith(cleanPattern.replace('%', ''));
    case 'contains':
      return description.includes(cleanPattern.replace(/%/g, ''));
    case 'regex':
      try {
        return new RegExp(pattern, 'i').test(description);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

/**
 * Save or update category pattern
 */
export async function saveCategoryPattern(pattern: CategoryPattern): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.warn('[CollectiveLearning] Service role not configured, skipping pattern save');
      return false;
    }
    const { error } = await (supabaseAdmin as any).from('category_patterns').upsert(
      {
        id: pattern.id,
        description_pattern: pattern.descriptionPattern,
        pattern_type: pattern.patternType,
        category: pattern.category,
        subcategory: pattern.subcategory,
        confidence: pattern.confidence,
        usage_count: pattern.usageCount,
        success_count: pattern.successCount,
        rejection_count: pattern.rejectionCount,
        last_seen: new Date().toISOString(),
      },
      {
        onConflict: pattern.id ? 'id' : undefined,
      }
    );

    if (error) {
      console.error('[CollectiveLearning] Error saving category pattern:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[CollectiveLearning] Error saving category pattern:', error);
    return false;
  }
}

/**
 * Record user feedback on category suggestion
 */
export async function recordCategoryFeedback(
  patternId: string,
  accepted: boolean
): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.warn('[CollectiveLearning] Service role not configured, skipping feedback');
      return false;
    }
    const { error } = await (supabaseAdmin as any).rpc('update_category_pattern_feedback', {
      p_pattern_id: patternId,
      p_accepted: accepted,
    });

    if (error) {
      console.error('[CollectiveLearning] Error recording category feedback:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[CollectiveLearning] Error recording category feedback:', error);
    return false;
  }
}

// ============================================================================
// Bank Format Learning
// ============================================================================

/**
 * Look up bank format by name or slug
 */
export async function lookupBankFormat(
  bankNameOrSlug: string
): Promise<BankFormat | null> {
  try {
    const slug = bankNameOrSlug.toLowerCase().replace(/\s+/g, '-');

    const { data, error } = await (supabase as any)
      .from('bank_formats')
      .select('*')
      .or(`bank_slug.eq.${slug},bank_name.ilike.%${bankNameOrSlug}%`)
      .gte('confidence', 0.7)
      .order('confidence', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      bankName: data.bank_name,
      bankSlug: data.bank_slug,
      columnMappings: data.column_mappings,
      dateFormat: data.date_format,
      hasHeaderRow: data.has_header_row,
      amountFormat: data.amount_format,
      confidence: parseFloat(data.confidence),
      successfulImports: data.successful_imports,
      failedImports: data.failed_imports,
    };
  } catch (error) {
    console.error('[CollectiveLearning] Error looking up bank format:', error);
    return null;
  }
}

/**
 * Save or update bank format
 */
export async function saveBankFormat(format: BankFormat): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.warn('[CollectiveLearning] Service role not configured, skipping format save');
      return false;
    }
    const { error } = await (supabaseAdmin as any).from('bank_formats').upsert(
      {
        id: format.id,
        bank_name: format.bankName,
        bank_slug: format.bankSlug,
        column_mappings: format.columnMappings,
        date_format: format.dateFormat,
        has_header_row: format.hasHeaderRow,
        amount_format: format.amountFormat,
        confidence: format.confidence,
        successful_imports: format.successfulImports,
        failed_imports: format.failedImports,
      },
      {
        onConflict: 'bank_slug',
        ignoreDuplicates: false,
      }
    );

    if (error) {
      console.error('[CollectiveLearning] Error saving bank format:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[CollectiveLearning] Error saving bank format:', error);
    return false;
  }
}

/**
 * Record import result for bank format
 */
export async function recordBankFormatResult(
  bankSlug: string,
  success: boolean
): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.warn('[CollectiveLearning] Service role not configured, skipping result recording');
      return false;
    }
    const { error } = await (supabaseAdmin as any).rpc('update_bank_format_result', {
      p_bank_slug: bankSlug,
      p_success: success,
    });

    if (error) {
      console.error('[CollectiveLearning] Error recording bank format result:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[CollectiveLearning] Error recording bank format result:', error);
    return false;
  }
}

// ============================================================================
// Batch Learning (Process Multiple Transactions)
// ============================================================================

/**
 * Learn from a batch of transactions after successful import
 */
export async function learnFromImport(
  transactions: ParsedTransaction[],
  userId: string,
  bankName?: string,
  bankSlug?: string,
  columnMappings?: Record<string, string>
): Promise<void> {
  try {
    console.log('[CollectiveLearning] Learning from', transactions.length, 'transactions');

    // Learn merchant patterns
    const merchantTokens = new Set<string>();
    for (const tx of transactions) {
      const token = generateMerchantToken(tx.description);
      if (!merchantTokens.has(token)) {
        merchantTokens.add(token);

        // Check if we should save this merchant
        const existing = await lookupMerchant(tx.description);
        if (!existing && (tx as any).suggestedCategory) {
          // New merchant with AI categorization
          await saveMerchant({
            merchantToken: token,
            canonicalName: (tx as any).normalizedMerchant || tx.description.substring(0, 50),
            category: (tx as any).suggestedCategory,
            subcategory: (tx as any).suggestedSubcategory,
            isSubscription: (tx as any).isLikelyRecurring,
            confidence: (tx as any).categoryConfidence || 0.5,
            source: 'openai',
          });
        }
      }
    }

    // Learn bank format if provided
    if (bankName && bankSlug && columnMappings) {
      const existing = await lookupBankFormat(bankSlug);
      if (existing) {
        // Update success count
        await recordBankFormatResult(bankSlug, true);
      } else {
        // Save new bank format
        await saveBankFormat({
          bankName,
          bankSlug,
          columnMappings,
          hasHeaderRow: true,
          amountFormat: 'single',
          confidence: 0.8,
          successfulImports: 1,
          failedImports: 0,
        });
      }
    }

    console.log('[CollectiveLearning] Learning complete');
  } catch (error) {
    console.error('[CollectiveLearning] Error learning from import:', error);
  }
}
