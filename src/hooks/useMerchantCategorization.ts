/**
 * Merchant Categorization Hook
 *
 * Integrates OpenAI-powered merchant intelligence service for automatic transaction categorization.
 * Extracts merchant tokens, calls /api/merchants/resolve, and submits user feedback.
 *
 * Features:
 * - Auto-categorization with confidence scoring
 * - Fallback to rule-based categorization
 * - User feedback submission
 * - Loading and error states
 *
 * Usage:
 * ```tsx
 * const { categorization, isLoading, submitFeedback } = useMerchantCategorization(description);
 *
 * // Auto-apply if high confidence
 * if (categorization && categorization.confidence >= 0.9) {
 *   setCategory(categorization.category);
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { extractMerchantToken } from '@/lib/merchant-tokenizer';
import { categorizeTransaction } from '@/lib/categorization/rules';

export interface MerchantCategorization {
  merchant_token: string;
  canonical_name: string;
  category: string;
  subcategory: string | null;
  business_type: string;
  is_subscription: boolean;
  confidence: number;
  source: 'openai' | 'user' | 'rule' | 'mixed';
  explanation: string;
}

interface FeedbackParams {
  merchant_token: string;
  chosen_category: string;
  chosen_subcategory?: string | null;
  previous_category?: string | null;
  previous_subcategory?: string | null;
  accepted_suggestion: boolean;
  country?: string;
}

export function useMerchantCategorization(
  description: string,
  bankType: 'bmo' | 'generic' = 'bmo',
  enabled: boolean = true
) {
  const [categorization, setCategorization] = useState<MerchantCategorization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !description || description.trim().length === 0) {
      setCategorization(null);
      return;
    }

    let cancelled = false;

    async function categorizeMerchant() {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Extract merchant token
        const merchantToken = extractMerchantToken(description, bankType);

        if (!merchantToken) {
          // Fallback to rule-based categorization
          const ruleResult = categorizeTransaction(description);
          if (ruleResult && !cancelled) {
            setCategorization({
              merchant_token: '',
              canonical_name: description,
              category: ruleResult.category,
              subcategory: ruleResult.subcategory || null,
              business_type: 'other',
              is_subscription: false,
              confidence: ruleResult.confidence,
              source: 'rule',
              explanation: 'Rule-based categorization (no merchant token found)',
            });
          }
          setIsLoading(false);
          return;
        }

        // Step 2: Call merchant resolution API
        const response = await fetch(
          `/api/merchants/resolve?token=${encodeURIComponent(merchantToken)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && !cancelled) {
          setCategorization({
            merchant_token: data.merchant_token,
            canonical_name: data.canonical_name,
            category: data.category,
            subcategory: data.subcategory,
            business_type: data.business_type,
            is_subscription: data.is_subscription,
            confidence: data.confidence,
            source: data.source,
            explanation: data.explanation,
          });
        }
      } catch (err) {
        console.error('Merchant categorization error:', err);

        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Categorization failed');

          // Fallback to rule-based categorization on error
          const ruleResult = categorizeTransaction(description);
          if (ruleResult) {
            setCategorization({
              merchant_token: '',
              canonical_name: description,
              category: ruleResult.category,
              subcategory: ruleResult.subcategory || null,
              business_type: 'other',
              is_subscription: false,
              confidence: ruleResult.confidence,
              source: 'rule',
              explanation: 'Rule-based categorization (API unavailable)',
            });
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    // Debounce categorization (wait 500ms after user stops typing)
    const timeoutId = setTimeout(() => {
      categorizeMerchant();
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [description, bankType, enabled]);

  /**
   * Submit user feedback to improve future categorizations
   */
  async function submitFeedback(params: FeedbackParams): Promise<boolean> {
    try {
      const response = await fetch('/api/merchants/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_token: params.merchant_token,
          chosen_category: params.chosen_category,
          chosen_subcategory: params.chosen_subcategory,
          previous_category: params.previous_category,
          previous_subcategory: params.previous_subcategory,
          accepted_suggestion: params.accepted_suggestion,
          country: params.country || null,
        }),
      });

      if (!response.ok) {
        console.error('Feedback submission failed:', response.status);
        return false;
      }

      const data = await response.json();
      return data.success === true;
    } catch (err) {
      console.error('Feedback submission error:', err);
      return false;
    }
  }

  return {
    categorization,
    isLoading,
    error,
    submitFeedback,
  };
}
