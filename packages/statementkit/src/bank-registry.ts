/**
 * Bank Config Registry
 *
 * Runtime bank config registration, validation, and lookup.
 * Allows SDK consumers to add custom bank configs without code changes.
 *
 * Features:
 * - Register/unregister banks at runtime
 * - Load configs from JSON strings or files
 * - Zod-based validation via bank-config-schema.ts
 * - Auto-suggest config from CSV sample data
 * - Export configs for community sharing
 */

import type { BankConfig } from "./types";
import { ALL_BANK_CONFIGS } from "./bank-configs";
import {
  parseBankConfigJSON,
  validateBankConfigZod,
  generateBankConfigTemplate,
  exportBankConfig,
} from "./bank-config-schema";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const customBanks: Record<string, BankConfig> = {};

/**
 * Register a custom bank configuration at runtime.
 * Custom banks take precedence over built-in configs.
 *
 * @example
 * registerBank('myBank', {
 *   name: 'My Bank',
 *   dateColumn: 'Datum',
 *   descriptionColumn: 'Omschrijving',
 *   amountColumn: 'Bedrag',
 *   dateFormat: 'dd-MM-yyyy',
 *   hasHeader: true,
 *   skipRows: 0,
 * });
 */
export function registerBank(key: string, config: BankConfig): void {
  const errors = validateBankConfig(config);
  if (errors.length > 0) {
    throw new Error(
      `Invalid bank config for "${key}":\n${errors.map((e) => `  - ${e}`).join("\n")}`
    );
  }
  customBanks[key] = config;
}

/**
 * Unregister a custom bank configuration.
 * Cannot unregister built-in banks.
 */
export function unregisterBank(key: string): boolean {
  if (key in customBanks) {
    delete customBanks[key];
    return true;
  }
  return false;
}

/**
 * Get a bank config by key. Checks custom banks first, then built-in.
 */
export function getBank(key: string): BankConfig | null {
  return customBanks[key] ?? ALL_BANK_CONFIGS[key] ?? null;
}

/**
 * Get all registered bank keys (built-in + custom).
 */
export function getAllBankKeys(): string[] {
  const builtIn = Object.keys(ALL_BANK_CONFIGS);
  const custom = Object.keys(customBanks);
  return [...new Set([...builtIn, ...custom])].sort();
}

/**
 * Get all registered bank configs (built-in + custom).
 * Custom banks override built-in banks with the same key.
 */
export function getAllBanks(): Record<string, BankConfig> {
  return { ...ALL_BANK_CONFIGS, ...customBanks };
}

/**
 * Get only custom-registered banks.
 */
export function getCustomBanks(): Record<string, BankConfig> {
  return { ...customBanks };
}

/**
 * Register multiple banks from a JSON object.
 * Useful for loading configs from a file or URL.
 */
export function registerBanksFromJSON(configs: Record<string, BankConfig>): {
  registered: string[];
  errors: Record<string, string[]>;
} {
  const registered: string[] = [];
  const errors: Record<string, string[]> = {};

  for (const [key, config] of Object.entries(configs)) {
    const validationErrors = validateBankConfig(config);
    if (validationErrors.length > 0) {
      errors[key] = validationErrors;
    } else {
      customBanks[key] = config;
      registered.push(key);
    }
  }

  return { registered, errors };
}

/**
 * Load and register banks from a JSON string.
 * Accepts both config file format ({banks: {...}}) and plain key→config maps.
 * Uses Zod validation for type safety.
 *
 * @example
 * const json = fs.readFileSync('banks.json', 'utf-8');
 * const result = loadBankConfigJSON(json);
 * console.log(`Registered: ${result.registered.join(', ')}`);
 */
export function loadBankConfigJSON(jsonString: string): {
  registered: string[];
  errors: Record<string, string[]>;
} {
  const { valid, errors } = parseBankConfigJSON(jsonString);
  const registered: string[] = [];

  for (const [key, config] of Object.entries(valid)) {
    customBanks[key] = config;
    registered.push(key);
  }

  return { registered, errors };
}

/**
 * Reset all custom bank registrations.
 * Built-in banks are unaffected.
 */
export function resetCustomBanks(): void {
  for (const key of Object.keys(customBanks)) {
    delete customBanks[key];
  }
}

// Re-export schema utilities for SDK consumers
export {
  generateBankConfigTemplate,
  exportBankConfig,
  validateBankConfigZod,
} from "./bank-config-schema";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate a bank config. Returns array of error messages (empty = valid).
 */
export function validateBankConfig(config: BankConfig): string[] {
  const errors: string[] = [];

  if (!config.name || typeof config.name !== "string") {
    errors.push("name is required and must be a string");
  }

  if (!config.dateColumn || typeof config.dateColumn !== "string") {
    errors.push("dateColumn is required and must be a string");
  }

  if (!config.descriptionColumn || typeof config.descriptionColumn !== "string") {
    errors.push("descriptionColumn is required and must be a string");
  }

  if (!config.amountColumn || typeof config.amountColumn !== "string") {
    errors.push("amountColumn is required and must be a string");
  }

  if (!config.dateFormat || typeof config.dateFormat !== "string") {
    errors.push("dateFormat is required and must be a string");
  }

  if (
    config.skipRows !== undefined &&
    (typeof config.skipRows !== "number" || config.skipRows < 0)
  ) {
    errors.push("skipRows must be a non-negative number");
  }

  if (
    config.encoding &&
    !["UTF-8", "Shift-JIS", "GB2312", "EUC-KR", "Big5"].includes(config.encoding)
  ) {
    errors.push(`encoding must be one of: UTF-8, Shift-JIS, GB2312, EUC-KR, Big5`);
  }

  if (config.region && !["NA", "EU", "UK", "AU", "ASIA"].includes(config.region)) {
    errors.push(`region must be one of: NA, EU, UK, AU, ASIA`);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Auto-suggest config from sample CSV
// ---------------------------------------------------------------------------

/**
 * Suggest a bank config from a sample CSV's headers and first few rows.
 * Returns a partial config with detected fields and confidence.
 */
export function suggestBankConfig(
  headers: string[],
  sampleRows: string[][] = []
): { config: Partial<BankConfig>; confidence: number; suggestions: string[] } {
  const suggestions: string[] = [];
  const config: Partial<BankConfig> = { hasHeader: true, skipRows: 0 };
  let confidence = 0;

  const headersLower = headers.map((h) => h.toLowerCase().trim());

  // Detect date column
  const dateKeywords = ["date", "datum", "fecha", "data", "日付", "날짜", "تاريخ"];
  const dateIdx = headersLower.findIndex((h) => dateKeywords.some((kw) => h.includes(kw)));
  if (dateIdx >= 0) {
    config.dateColumn = headers[dateIdx];
    confidence += 0.25;
  } else {
    suggestions.push("Could not detect date column — set dateColumn manually");
  }

  // Detect description column
  const descKeywords = [
    "description",
    "desc",
    "payee",
    "memo",
    "details",
    "omschrijving",
    "beschreibung",
    "descripción",
    "descrição",
    "説明",
    "내용",
  ];
  const descIdx = headersLower.findIndex((h) => descKeywords.some((kw) => h.includes(kw)));
  if (descIdx >= 0) {
    config.descriptionColumn = headers[descIdx];
    confidence += 0.25;
  } else {
    suggestions.push("Could not detect description column — set descriptionColumn manually");
  }

  // Detect amount column
  const amtKeywords = [
    "amount",
    "betrag",
    "bedrag",
    "montant",
    "monto",
    "importe",
    "金額",
    "금액",
    "debit",
    "credit",
    "withdrawal",
    "deposit",
  ];
  const amtIdx = headersLower.findIndex((h) => amtKeywords.some((kw) => h.includes(kw)));
  if (amtIdx >= 0) {
    config.amountColumn = headers[amtIdx];
    confidence += 0.25;
  } else {
    suggestions.push("Could not detect amount column — set amountColumn manually");
  }

  // Detect date format from sample data
  if (sampleRows.length > 0 && dateIdx >= 0) {
    const sampleDate = sampleRows[0][dateIdx];
    if (sampleDate) {
      const detectedFormat = detectDateFormat(sampleDate);
      if (detectedFormat) {
        config.dateFormat = detectedFormat;
        confidence += 0.25;
      } else {
        suggestions.push(
          `Could not detect date format from "${sampleDate}" — set dateFormat manually`
        );
      }
    }
  }

  return { config, confidence, suggestions };
}

function detectDateFormat(sample: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}/.test(sample)) return "yyyy-MM-dd";
  if (/^\d{2}\/\d{2}\/\d{4}/.test(sample)) return "MM/dd/yyyy";
  if (/^\d{2}\.\d{2}\.\d{4}/.test(sample)) return "dd.MM.yyyy";
  if (/^\d{2}-\d{2}-\d{4}/.test(sample)) return "dd-MM-yyyy";
  if (/^\d{8}$/.test(sample)) return "yyyyMMdd";
  return null;
}
