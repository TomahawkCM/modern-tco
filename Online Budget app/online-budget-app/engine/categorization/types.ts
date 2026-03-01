/** Result returned by the categorization engine */
export interface CategorizationResult {
  /** Category key matching categories.key in DB (e.g. "groceries") */
  readonly categoryKey: string;
  /** Parent category key (e.g. "food_dining") */
  readonly parentKey: string;
  /** Confidence score 0-1 */
  readonly confidence: number;
  /** How the match was determined */
  readonly method: "merchant_rule" | "pattern_rule";
}

/** A merchant-specific rule (exact token match, highest priority) */
export interface MerchantRule {
  /** Normalized merchant token (uppercase, trimmed) */
  readonly merchantToken: string;
  /** Display name for the merchant */
  readonly displayName: string;
  /** Category key */
  readonly categoryKey: string;
  /** Parent category key */
  readonly parentKey: string;
}

/** A regex pattern rule (fallback after merchant rules) */
export interface PatternRule {
  /** Regex pattern to test against description */
  readonly pattern: RegExp;
  /** Category key */
  readonly categoryKey: string;
  /** Parent category key */
  readonly parentKey: string;
  /** Confidence score for this rule (0.85-0.95) */
  readonly confidence: number;
}
