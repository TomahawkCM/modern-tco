/**
 * Merchant Token Extraction
 *
 * Extracts stable merchant tokens from bank transaction descriptions
 * for use with the merchant intelligence system and OpenAI classification.
 *
 * Architecture:
 * - Normalizes bank-specific formats (BMO [OP]/[PR], etc.)
 * - Extracts stable merchant tokens (e.g., "OPENAI", "SKIPTHEDISHES")
 * - Filters out generic tokens (e.g., "ONLINE PURCHASE", "PAYMENT")
 * - Returns null for unclassifiable transactions
 *
 * Privacy: Only returns normalized merchant tokens, never raw transaction data.
 */

export type BankType = 'bmo' | 'generic';

/**
 * Generic tokens that should not be used as merchant identifiers
 * These are too broad to classify meaningfully
 */
const GENERIC_TOKENS = new Set([
  'ONLINE PURCHASE',
  'ONLINE',  // Added to catch "ONLINE" after "PURCHASE" is stripped
  'PURCHASE',
  'PAYMENT',
  'TRANSFER',
  'DEBIT',
  'CREDIT',
  'WITHDRAWAL',
  'DEPOSIT',
  'ATM',
  'INTERAC',
  'E-TRANSFER',
  'ETRANSFER',
  'CHEQUE',
  'CHECK',
  'FEE',
  'CHARGE',
  'REFUND',
]);

/**
 * Clean BMO-specific formatting from description
 * Handles both [PR] physical and [OP] online purchases
 *
 * Based on existing cleanBMODescription() from categorization/rules.ts
 * Enhanced for merchant token extraction
 */
function cleanBMODescription(description: string): string {
  let cleaned = description.trim();

  // Detect transaction type
  const isOnlinePurchase = /^\[OP\]/i.test(cleaned);

  // Remove BMO-specific prefixes: [PR], [OP], etc.
  cleaned = cleaned.replace(/^\[[A-Z]{2}\]/i, '').trim();

  if (isOnlinePurchase) {
    // Handle [OP] format: "ONLINE PURCHASE  1AUG2025SKIPTHEDISHES MB"
    // Extract merchant from: TYPE  DATEMERCHANTNAME LOCATION

    // Remove "ONLINE PURCHASE" prefix
    cleaned = cleaned.replace(/^ONLINE PURCHASE\s*/i, '').trim();

    // Find date pattern and capture everything after it: \d{1,2}[A-Z]{3}\d{4}(.+)
    const dateMatch = cleaned.match(/\d{1,2}[A-Z]{3}\d{4}(.+)/);
    if (dateMatch && dateMatch[1]) {
      // Extract merchant name (remove trailing province/country codes)
      let merchant = dateMatch[1].trim();

      // Remove trailing data: #numbers, 2-letter location codes, email addresses
      merchant = merchant.replace(/#\d+.*$/, '').trim(); // Remove # and everything after
      merchant = merchant.replace(/\s+\S+@\S+\.\S+.*$/, '').trim(); // Remove email addresses
      merchant = merchant.replace(/\s+\d{3,}\s*$/, '').trim(); // Remove trailing numbers (3+ digits)
      merchant = merchant.replace(/\s+([A-Z]{2}|CAN)\s*$/i, '').trim(); // Remove province/country

      return merchant;
    }

    // If no date pattern found, return cleaned string
    return cleaned;
  }

  // Handle [PR] physical purchases (original logic)
  // Remove location info (multiple spaces followed by location)
  cleaned = cleaned.replace(/\s{2,}.*$/, '').trim();

  // Remove trailing # numbers and location codes
  cleaned = cleaned.replace(/\s+#\d+.*$/, '').trim();
  cleaned = cleaned.replace(/\s+(AB|BC|ON|QC|MB|SK|NS|NB|PE|NL|YT|NT|NU|CAN)(\s+.*)?$/i, '').trim();

  return cleaned;
}

/**
 * Generic vendor name extraction with comprehensive normalization
 *
 * Based on existing extractVendorName() from vendor-matcher.ts
 * Enhanced for merchant token extraction
 */
function extractGenericVendor(description: string): string {
  if (!description) return '';

  let vendor = description.toUpperCase().trim();

  // Remove bank statement prefixes / bracketed tags
  vendor = vendor.replace(/^\[[A-Z]+\]\s*/i, ''); // e.g. [PR], [DS], [OP]
  vendor = vendor.replace(/^\[ONLINE PURCHASE\]\s*/i, '');

  // Legacy specific prefixes (kept for backward compatibility)
  vendor = vendor.replace(/^PURCHASE\s+/i, '');
  vendor = vendor.replace(/^PAYMENT\s+/i, '');
  vendor = vendor.replace(/^DEBIT\s+/i, '');
  vendor = vendor.replace(/^POS\s+/i, '');

  // Remove transaction IDs (e.g., #260, #123)
  vendor = vendor.replace(/#\d+/g, '');

  // Remove dates in various formats
  vendor = vendor.replace(/\d{1,2}[A-Z]{3}\d{2,4}/gi, ''); // 4NOV20, 11NOV2025
  vendor = vendor.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, ''); // 11/7/2025
  vendor = vendor.replace(/\d{4}-\d{2}-\d{2}/g, ''); // 2025-11-07

  // Remove email addresses
  vendor = vendor.replace(/\s+\S+@\S+\.\S+.*$/, ''); // Remove email and everything after

  // Remove common location indicators (word boundary to avoid matching "NS" in "HORTONS")
  vendor = vendor.replace(/\s+\b(AB|BC|ON|QC|SK|MB|NB|NS|PE|NL|YT|NT|NU)\b\s*$/i, ''); // Canadian provinces
  vendor = vendor.replace(/\s+CANADA\s*$/i, '');
  vendor = vendor.replace(/\s+CA\s*$/i, '');
  vendor = vendor.replace(/\s+(EDMONTON|CALGARY|TORONTO|VANCOUVER|MONTREAL|OTTAWA)\s*$/i, ''); // Cities

  // Remove trailing reference numbers/codes (must contain at least one digit to avoid removing merchant names)
  vendor = vendor.replace(/\s+[A-Z0-9]*\d[A-Z0-9]{5,}\s*$/, ''); // Long alphanumeric codes with digits

  // Clean up extra whitespace
  vendor = vendor.replace(/\s+/g, ' ').trim();

  return vendor;
}

/**
 * Validate that a token is suitable for merchant identification
 * Returns false for generic, empty, or low-quality tokens
 */
function isValidMerchantToken(token: string): boolean {
  if (!token) return false;

  // Normalize for comparison
  const normalized = token.toUpperCase().trim();

  // Must have minimum length (avoid single-letter tokens)
  if (normalized.length < 3) return false;

  // Check against generic token list
  if (GENERIC_TOKENS.has(normalized)) return false;

  // Avoid all-numeric tokens (likely transaction IDs)
  if (/^\d+$/.test(normalized)) return false;

  // Avoid tokens that are mostly numbers (e.g., "12345 MERCHANT")
  // Allow patterns like "MICROSOFT 365", "7-ELEVEN" but reject "12345 ABC"
  const digitRatio = (normalized.match(/\d/g) || []).length / normalized.length;
  if (digitRatio > 0.5) return false;

  return true;
}

/**
 * Extract a stable merchant token from a transaction description
 *
 * @param description - Raw transaction description from bank
 * @param bankType - Bank-specific parsing ('bmo' or 'generic')
 * @returns Normalized merchant token or null if unclassifiable
 *
 * @example
 * extractMerchantToken("[OP] ONLINE PURCHASE  1AUG2025SKIPTHEDISHES MB", 'bmo')
 * // Returns: "SKIPTHEDISHES"
 *
 * @example
 * extractMerchantToken("[OP] ONLINE PURCHASE  4NOV2025OPENAI CHATGPT", 'bmo')
 * // Returns: "OPENAI CHATGPT"
 *
 * @example
 * extractMerchantToken("[PR] PEMBRIDGE INS  #123 AB", 'bmo')
 * // Returns: "PEMBRIDGE INS"
 *
 * @example
 * extractMerchantToken("[OP] ONLINE PURCHASE  1AUG2025PURCHASE MB", 'bmo')
 * // Returns: null (generic token)
 */
export function extractMerchantToken(
  description: string,
  bankType: BankType = 'generic'
): string | null {
  if (!description) return null;

  // Step 1: Bank-specific normalization
  let token: string;
  if (bankType === 'bmo') {
    token = cleanBMODescription(description);
  } else {
    token = extractGenericVendor(description);
  }

  // Step 2: Final normalization
  token = token.toUpperCase().trim();

  // Step 3: Validate token quality
  if (!isValidMerchantToken(token)) {
    return null;
  }

  return token;
}

/**
 * Batch extract merchant tokens from multiple descriptions
 * Useful for pre-processing transactions before API calls
 *
 * @param descriptions - Array of transaction descriptions
 * @param bankType - Bank-specific parsing ('bmo' or 'generic')
 * @returns Map of description -> merchant token (null for invalid)
 */
export function batchExtractMerchantTokens(
  descriptions: string[],
  bankType: BankType = 'generic'
): Map<string, string | null> {
  const results = new Map<string, string | null>();

  for (const description of descriptions) {
    const token = extractMerchantToken(description, bankType);
    results.set(description, token);
  }

  return results;
}

/**
 * Get unique merchant tokens from a list of descriptions
 * Filters out null/invalid tokens
 *
 * @param descriptions - Array of transaction descriptions
 * @param bankType - Bank-specific parsing ('bmo' or 'generic')
 * @returns Set of unique merchant tokens
 */
export function getUniqueMerchantTokens(
  descriptions: string[],
  bankType: BankType = 'generic'
): Set<string> {
  const tokens = new Set<string>();

  for (const description of descriptions) {
    const token = extractMerchantToken(description, bankType);
    if (token) {
      tokens.add(token);
    }
  }

  return tokens;
}
