/**
 * Categorization Module
 *
 * Responsibilities:
 * - Deterministic rule-based transaction classification
 * - Merchant token extraction and matching
 * - Confidence scoring per match method
 *
 * NOT allowed: AI logic, database calls, side effects
 */
export type {
  CategorizationResult,
  MerchantRule,
  PatternRule,
} from "./types";
export { extractMerchantToken } from "./tokenizer";
export { categorize } from "./categorize";
export { PATTERN_RULES } from "./rules";
