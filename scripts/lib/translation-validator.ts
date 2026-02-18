/**
 * Translation Validator
 *
 * Quality assurance checks for translated locale files:
 * 1. Structure validation (all keys present)
 * 2. Content quality (no untranslated English)
 * 3. RTL validation (RTL characters present)
 * 4. Length validation (reasonable translation length)
 */

import { LOCALE_METADATA, type SupportedLocale } from "../../src/i18n/config";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Main validation entry point
 */
export function validate(
  translation: object,
  source: object,
  locale: SupportedLocale
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Structure validation
  const structureErrors = validateStructure(translation, source);
  errors.push(...structureErrors);

  // 2. Content quality (only for non-English locales)
  if (!locale.startsWith("en-")) {
    const contentWarnings = detectUntranslated(translation, locale);
    warnings.push(...contentWarnings);
  }

  // 3. RTL validation (for RTL locales)
  if (isRTLLocale(locale)) {
    const rtlErrors = validateRTL(locale, translation);
    if (rtlErrors.length > 0) {
      warnings.push(...rtlErrors); // Warnings, not errors (false positives possible)
    }
  }

  // 4. Length validation
  const lengthWarnings = validateLengths(translation, source);
  warnings.push(...lengthWarnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate that translation has same structure as source
 */
function validateStructure(translation: any, source: any, path: string = ""): string[] {
  const errors: string[] = [];

  // Check if types match
  if (typeof translation !== typeof source) {
    errors.push(
      `Type mismatch at ${path || "root"}: expected ${typeof source}, got ${typeof translation}`
    );
    return errors;
  }

  // For objects, check all keys recursively
  if (typeof source === "object" && source !== null) {
    const sourceKeys = Object.keys(source);
    const translationKeys = Object.keys(translation);

    // Check for missing keys
    for (const key of sourceKeys) {
      if (!(key in translation)) {
        errors.push(`Missing key: ${path ? `${path}.${key}` : key}`);
      } else {
        // Recursively validate nested objects
        const nestedErrors = validateStructure(
          translation[key],
          source[key],
          path ? `${path}.${key}` : key
        );
        errors.push(...nestedErrors);
      }
    }

    // Check for extra keys (not necessarily an error, but worth noting)
    for (const key of translationKeys) {
      if (!(key in source)) {
        errors.push(`Extra key not in source: ${path ? `${path}.${key}` : key}`);
      }
    }
  }

  return errors;
}

/**
 * Detect untranslated English words in non-English translations
 */
function detectUntranslated(translation: any, locale: SupportedLocale): string[] {
  const warnings: string[] = [];

  // Common English words that should be translated
  const englishPattern =
    /\b(Dashboard|Transaction|Transactions|Budget|Budgets|Report|Reports|Account|Accounts|Category|Categories|Goal|Goals|Import|Export|Settings|Help|About|Save|Cancel|Delete|Edit|Loading|Add|Spending|Recent|Progress|Balance|Balances|Income|Expenses|Monthly|Trends|Upcoming|Bills|Welcome|Start|Data|Bank|Changes|Reset|Defaults|Quick|View|Latest|Activity|Track|Current|Compare|Earnings|Visualize|Patterns|Month|Never|Miss|Payment|Reminders|First|Financial)\b/gi;

  traverse(translation, (path, value) => {
    if (typeof value === "string") {
      const matches = value.match(englishPattern);
      if (matches && matches.length > 0) {
        warnings.push(
          `Possible untranslated text at ${path}: "${value}" (contains: ${matches.join(", ")})`
        );
      }
    }
  });

  return warnings;
}

/**
 * Validate RTL locales contain RTL characters
 */
function validateRTL(locale: SupportedLocale, translation: any): string[] {
  const warnings: string[] = [];

  // RTL Unicode ranges:
  // Arabic: U+0600-U+06FF, U+0750-U+077F, U+FB50-U+FDFF, U+FE70-U+FEFF
  // Hebrew: U+0590-U+05FF, U+FB1D-U+FB4F
  // Persian/Farsi: overlaps with Arabic
  const rtlPattern =
    /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/;

  let hasRTL = false;
  let sampleCount = 0;

  traverse(translation, (path, value) => {
    if (typeof value === "string" && value.length > 0) {
      sampleCount++;
      if (rtlPattern.test(value)) {
        hasRTL = true;
      }
    }
  });

  if (sampleCount > 0 && !hasRTL) {
    warnings.push(
      `RTL locale ${locale} does not contain RTL characters - possible translation error`
    );
  }

  return warnings;
}

/**
 * Validate translation lengths are reasonable
 */
function validateLengths(translation: any, source: any, path: string = ""): string[] {
  const warnings: string[] = [];

  traverse(translation, (translationPath, translationValue) => {
    if (typeof translationValue === "string") {
      // Get corresponding source value
      const sourceValue = getValueAtPath(source, translationPath);

      if (typeof sourceValue === "string" && sourceValue.length > 0) {
        const ratio = translationValue.length / sourceValue.length;

        // Flag if translation is < 30% or > 400% of source
        // (Some languages are naturally more verbose)
        if (ratio < 0.3) {
          warnings.push(
            `Translation at ${translationPath} is very short (${Math.round(ratio * 100)}% of source length)`
          );
        } else if (ratio > 4.0) {
          warnings.push(
            `Translation at ${translationPath} is very long (${Math.round(ratio * 100)}% of source length)`
          );
        }
      }
    }
  });

  return warnings;
}

/**
 * Helper: Check if locale uses RTL text direction
 */
function isRTLLocale(locale: SupportedLocale): boolean {
  const metadata = LOCALE_METADATA[locale];
  return metadata?.dir === "rtl";
}

/**
 * Helper: Traverse object recursively and call callback for each leaf value
 */
function traverse(obj: any, callback: (path: string, value: any) => void, path: string = ""): void {
  if (typeof obj === "object" && obj !== null) {
    for (const key of Object.keys(obj)) {
      const newPath = path ? `${path}.${key}` : key;
      traverse(obj[key], callback, newPath);
    }
  } else {
    callback(path, obj);
  }
}

/**
 * Helper: Get value at dot-notation path in object
 */
function getValueAtPath(obj: any, path: string): any {
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Flatten object to key-value pairs with dot notation
 */
export function flattenKeys(obj: any, prefix: string = ""): string[] {
  const keys: string[] = [];

  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...flattenKeys(obj[key], path));
    } else {
      keys.push(path);
    }
  }

  return keys;
}

/**
 * Quick validation check (returns true if valid, false if errors)
 */
export function isValid(translation: object, source: object, locale: SupportedLocale): boolean {
  const result = validate(translation, source, locale);
  return result.valid;
}

/**
 * Format validation result for console output
 */
export function formatValidationResult(result: ValidationResult, locale: SupportedLocale): string {
  const parts: string[] = [];

  if (result.valid) {
    parts.push(`✅ ${locale}: Validation passed`);
  } else {
    parts.push(`❌ ${locale}: Validation failed`);
  }

  if (result.errors.length > 0) {
    parts.push(`\n  Errors (${result.errors.length}):`);
    result.errors.slice(0, 5).forEach((error) => {
      parts.push(`    - ${error}`);
    });
    if (result.errors.length > 5) {
      parts.push(`    ... and ${result.errors.length - 5} more errors`);
    }
  }

  if (result.warnings.length > 0 && result.warnings.length <= 3) {
    parts.push(`\n  Warnings (${result.warnings.length}):`);
    result.warnings.forEach((warning) => {
      parts.push(`    - ${warning}`);
    });
  } else if (result.warnings.length > 3) {
    parts.push(`\n  Warnings: ${result.warnings.length} (use --verbose to see details)`);
  }

  return parts.join("\n");
}
