/**
 * Text utilities for the search module.
 * Separated into its own file to avoid circular imports between
 * transaction-search.ts and query-parser.ts.
 */

/**
 * Normalize text by stripping diacritics / accent marks.
 * This allows searching "cafe" to match "cafe", "nino" to match "nino", etc.
 *
 * Uses Unicode NFD (Canonical Decomposition) to split combined characters
 * into base characters + combining marks, then removes the combining marks.
 */
export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
