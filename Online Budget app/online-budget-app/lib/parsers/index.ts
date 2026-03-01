/**
 * Import Parsers - Barrel Export
 *
 * Provides CSV, OFX/QFX, and format detection for bank statement imports.
 * All parsers run CLIENT-SIDE in the browser.
 */

// Types
export type {
  BankConfig,
  BankDetectionResult,
  CSVRow,
  ColumnMapping,
  ExistingTransaction,
  FileFormat,
  FormatDetectionResult,
  ImportSummary,
  OFXAccountInfo,
  OFXBalances,
  OFXData,
  OFXTransaction,
  ParsedOFXAccount,
  ParsedTransaction,
} from "./types";

// CSV Parser
export {
  BANK_CONFIGS,
  calculateSimilarity,
  convertToTransactions,
  convertToTransactionsUniversal,
  detectBank,
  detectBankLegacy,
  detectBankWithConfidence,
  detectDuplicates,
  extractMerchant,
  generateImportSummary,
  groupByDate,
  parseCSVContent,
  validateDateRange,
} from "./csv-parser";

// OFX/QFX Parser
export {
  detectOFXVariant,
  extractTransactions,
  mapOFXTransaction,
  parseMultiAccountOFX,
  parseOFXContent,
  parseOFXDate,
  parseOFXFile,
  validateOFXFile,
} from "./ofx-parser";

// Format Detection
export {
  detectFileFormat,
  detectFromContent,
  getFormatDisplayName,
  getSupportedFormats,
  isFormatSupported,
  validateFormat,
} from "./format-detector";

// Bank Configurations
export {
  ALL_BANKS,
  AMERICAN_BANKS,
  ASIAN_NEOBANKS,
  AU_BANKS,
  CANADIAN_BANKS,
  COMMA_DECIMAL_BANKS,
  DUAL_COLUMN_BANKS,
  EU_BANKS,
  INDIA_BANKS,
  INDONESIA_VIETNAM_BANKS,
  JAPAN_BANKS,
  NON_UTF8_BANKS,
  SEASIA_BANKS,
  SINGAPORE_BANKS,
  UK_BANKS,
  getAllBankKeys,
  getAsianBanks,
  getBankConfig,
  getBankConfigByName,
  getBankEncoding,
  getBanksByRegion,
  getUnverifiedBankKeys,
  getVerifiedBankKeys,
  hasDualAmountColumns,
  isBankVerified,
  parseAmount,
  parseIndonesianAmount,
  requiresSpecialEncoding,
  usesCommaDecimal,
} from "./bank-configs";
