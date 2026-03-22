/**
 * Bank Config Schema & Loader
 *
 * Zod-based validation for bank configurations.
 * Used by the plugin system to validate user-contributed bank configs.
 */

import { z } from "zod";
import type { BankConfig } from "./types";

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

export const BankConfigSchema = z.object({
  name: z.string().min(1, "Bank name is required"),
  dateColumn: z.string().min(1, "Date column name is required"),
  descriptionColumn: z.string().min(1, "Description column name is required"),
  amountColumn: z.string().min(1, "Amount column name is required"),
  dateFormat: z.string().min(1, "Date format is required (e.g., yyyy-MM-dd, MM/dd/yyyy)"),
  amountMultiplier: z.number().optional(),
  hasHeader: z.boolean().optional(),
  skipRows: z.number().int().nonnegative().optional(),
  encoding: z.enum(["UTF-8", "Shift-JIS", "GB2312", "EUC-KR", "Big5"]).optional(),
  decimalSeparator: z.enum([".", ","]).optional(),
  thousandSeparator: z.enum([",", ".", " ", ""]).optional(),
  region: z.enum(["NA", "EU", "UK", "AU", "ASIA"]).optional(),
  verified: z.boolean().optional(),
  verifiedDate: z.string().optional(),
  sampleRowCount: z.number().int().nonnegative().optional(),
  communityContributed: z.boolean().optional(),
});

/**
 * Loose file envelope schema — validates structure but uses z.unknown() for
 * individual bank entries so that per-bank errors can be reported separately.
 */
const BankConfigFileEnvelopeSchema = z.object({
  $schema: z.string().optional(),
  version: z.string().optional(),
  banks: z.record(z.string(), z.unknown()),
});

/**
 * Strict file schema — validates every bank entry against BankConfigSchema.
 * Used when loading config files from disk or URL.
 *
 * Example:
 * {
 *   "$schema": "statementkit/bank-config",
 *   "version": "1.0",
 *   "banks": {
 *     "myBank": { name: "My Bank", ... }
 *   }
 * }
 */
export const BankConfigFileSchema = z.object({
  $schema: z.string().optional(),
  version: z.string().optional(),
  banks: z.record(z.string(), BankConfigSchema),
});

export type BankConfigFile = z.infer<typeof BankConfigFileSchema>;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate a single bank config using Zod schema.
 * Returns { success: true, data } or { success: false, errors }.
 */
export function validateBankConfigZod(config: unknown): {
  success: boolean;
  data?: BankConfig;
  errors?: string[];
} {
  const result = BankConfigSchema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data as BankConfig };
  }
  return {
    success: false,
    errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  };
}

/**
 * Validate a bank config file (multiple banks).
 * Uses a loose envelope schema so that individual bank errors are reported
 * per-key rather than failing the entire file.
 * Returns validated banks and per-bank errors.
 */
export function validateBankConfigFile(input: unknown): {
  valid: Record<string, BankConfig>;
  errors: Record<string, string[]>;
} {
  const valid: Record<string, BankConfig> = {};
  const errors: Record<string, string[]> = {};

  // Validate envelope structure (has "banks" key with object values)
  const fileResult = BankConfigFileEnvelopeSchema.safeParse(input);
  if (!fileResult.success) {
    errors["_file"] = fileResult.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    return { valid, errors };
  }

  // Validate each bank config individually
  for (const [key, config] of Object.entries(fileResult.data.banks)) {
    const bankResult = validateBankConfigZod(config);
    if (bankResult.success && bankResult.data) {
      valid[key] = bankResult.data;
    } else {
      errors[key] = bankResult.errors ?? ["Unknown validation error"];
    }
  }

  return { valid, errors };
}

// ---------------------------------------------------------------------------
// JSON Loading
// ---------------------------------------------------------------------------

/**
 * Parse and validate a bank config JSON string.
 * Accepts either a single config file format or a plain key→config map.
 */
export function parseBankConfigJSON(jsonString: string): {
  valid: Record<string, BankConfig>;
  errors: Record<string, string[]>;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return {
      valid: {},
      errors: {
        _parse: [`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`],
      },
    };
  }

  // Try config file format first (has "banks" key)
  if (typeof parsed === "object" && parsed !== null && "banks" in parsed) {
    return validateBankConfigFile(parsed);
  }

  // Fall back to plain key→config map
  const valid: Record<string, BankConfig> = {};
  const errors: Record<string, string[]> = {};

  if (typeof parsed !== "object" || parsed === null) {
    return { valid, errors: { _parse: ["Expected a JSON object"] } };
  }

  for (const [key, config] of Object.entries(parsed as Record<string, unknown>)) {
    const result = validateBankConfigZod(config);
    if (result.success && result.data) {
      valid[key] = result.data;
    } else {
      errors[key] = result.errors ?? ["Unknown validation error"];
    }
  }

  return { valid, errors };
}

// ---------------------------------------------------------------------------
// Template Generation
// ---------------------------------------------------------------------------

/**
 * Generate a bank config template JSON string.
 * Useful for community contributions — users fill in the blanks.
 */
export function generateBankConfigTemplate(bankKey?: string): string {
  const template: BankConfigFile = {
    $schema: "statementkit/bank-config",
    version: "1.0",
    banks: {
      [bankKey ?? "my_bank"]: {
        name: "My Bank Name",
        dateColumn: "Date",
        descriptionColumn: "Description",
        amountColumn: "Amount",
        dateFormat: "yyyy-MM-dd",
        hasHeader: true,
        skipRows: 0,
        region: "NA",
        communityContributed: true,
      },
    },
  };

  return JSON.stringify(template, null, 2);
}

/**
 * Export a registered bank config as a shareable JSON config file.
 */
export function exportBankConfig(key: string, config: BankConfig): string {
  const file: BankConfigFile = {
    $schema: "statementkit/bank-config",
    version: "1.0",
    banks: { [key]: config },
  };
  return JSON.stringify(file, null, 2);
}
