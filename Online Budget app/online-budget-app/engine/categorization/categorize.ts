import { extractMerchantToken } from "./tokenizer";
import { PATTERN_RULES } from "./rules";
import type { CategorizationResult, MerchantRule } from "./types";

/**
 * Categorize a transaction description using a two-tier cascade:
 * 1. Merchant rules (exact token match, confidence 0.99)
 * 2. Pattern rules (regex match, confidence 0.85-0.95)
 *
 * Returns null if no match found.
 * Pure function — no side effects, no DB, no AI.
 */
export function categorize(
  description: string,
  merchantRules: MerchantRule[]
): CategorizationResult | null {
  if (!description || description.trim().length === 0) return null;

  // Tier 1: Merchant rule match (highest priority)
  const token = extractMerchantToken(description);
  if (token) {
    const merchantMatch = merchantRules.find(
      (r) => r.merchantToken === token
    );
    if (merchantMatch) {
      return {
        categoryKey: merchantMatch.categoryKey,
        parentKey: merchantMatch.parentKey,
        confidence: 0.99,
        method: "merchant_rule",
      };
    }
  }

  // Tier 2: Pattern rule match (fallback)
  for (const rule of PATTERN_RULES) {
    if (rule.pattern.test(description)) {
      return {
        categoryKey: rule.categoryKey,
        parentKey: rule.parentKey,
        confidence: rule.confidence,
        method: "pattern_rule",
      };
    }
  }

  return null;
}
