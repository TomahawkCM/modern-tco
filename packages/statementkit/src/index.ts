/**
 * StatementKit — Privacy-first bank statement parsing SDK
 *
 * Parse CSV, OFX, QFX, QIF, MT940, CAMT.052/053/054, and scanned PDFs.
 * 30+ banks, 68 OCR languages, 70+ currencies. 100% offline.
 *
 * @example
 * import { detectFromContent, parseOFXFile, exportTransactions } from "statementkit";
 *
 * const format = detectFromContent(fileContent);
 * const result = await parseOFXFile(content, "my-account");
 * const csv = exportTransactions(result.transactions, "csv");
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { ParsedTransaction, ParsedInvestmentTransaction, BankConfig, CSVRow } from "./types";
export type { OFXData, OFXTransaction, OFXAccountInfo, OFXBalances } from "./types";
export type { ExistingTransaction } from "./types";

// ---------------------------------------------------------------------------
// Format Detection
// ---------------------------------------------------------------------------

export { detectFromContent, detectFileFormat } from "./format-detector";
export type { FileFormat, FormatDetectionResult } from "./format-detector";
export { getFormatDisplayName, getSupportedFormats, isFormatSupported } from "./format-detector";

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

// CSV
export { parseCSVContent, parseCSVContentStream, convertToTransactions } from "./csv-parser";
export { convertToTransactionsUniversal } from "./csv-parser";

// OFX / QFX / QBO
export { parseOFXFile, parseOFXContent, extractTransactions as extractOFXTransactions } from "./ofx-parser";
export { parseMultiAccountOFX, validateOFXFile, detectOFXVariant } from "./ofx-parser";

// QIF
export { parseQIFFile, isQIFContent, getQIFAccountType } from "./qif-parser";

// MT940 / MT942
export { parseMT940File, parseMT942File, isMT940Content, isMT942Content, isSWIFTContent } from "./mt940-parser";

// CAMT.052 / CAMT.053 / CAMT.054 (ISO 20022)
export { parseCAMTFile, parseCAMT052File, parseCAMT053File, parseCAMT054File } from "./camt-parser";
export { detectCAMTVariant, isCAMTContent } from "./camt-parser";

// PDF (optional — requires pdfjs-dist and tesseract.js)
export { performPDFOCR, pdfNeedsOCR, getPdfPageCount, parseTransactionRows } from "./pdf-ocr-parser";
export { extractPdfText, pdfHasText } from "./pdf-text-extractor";
export { setPdfWorkerSrc } from "./pdf-loader";

// ---------------------------------------------------------------------------
// Bank Detection & Configuration
// ---------------------------------------------------------------------------

export { detectBankWithConfidence, detectBank } from "./bank-detector";
export { getBankConfig, getAllBankKeys, getBanksByRegion, hasDualAmountColumns } from "./bank-configs";
export {
  registerBank,
  unregisterBank,
  getBank,
  getAllBanks,
  getCustomBanks,
  registerBanksFromJSON,
  loadBankConfigJSON,
  resetCustomBanks,
  suggestBankConfig,
  validateBankConfig,
} from "./bank-registry";
export { generateBankConfigTemplate, exportBankConfig, validateBankConfigZod } from "./bank-config-schema";
export { BankConfigSchema, BankConfigFileSchema } from "./bank-config-schema";

// ---------------------------------------------------------------------------
// International Parsing
// ---------------------------------------------------------------------------

export { parseDate, parseDateWithOrder, disambiguateDateFormat } from "./intl-date-parser";
export type { DateOrder } from "./intl-date-parser";
export { parseAmount, parseAmountVerbose, detectCurrencySymbol } from "./intl-amount-parser";
export { isZeroDecimalCurrency, validateCurrencyDecimals } from "./intl-amount-parser";

// ---------------------------------------------------------------------------
// Post-Processing
// ---------------------------------------------------------------------------

export { normalizeTransaction, normalizeTransactions } from "./transaction-normalizer";
export { detectDuplicates, calculateSimilarity } from "./duplicate-detector";

// ---------------------------------------------------------------------------
// Export / Conversion
// ---------------------------------------------------------------------------

export { exportTransactions, getSupportedExportFormats } from "./exporters";
export { exportJSON, exportCSV, exportQIF, exportOFX } from "./exporters";
export type { ExportFormat, JSONExportOptions, CSVExportOptions, QIFExportOptions, OFXExportOptions } from "./exporters";

// ---------------------------------------------------------------------------
// Storage Adapters
// ---------------------------------------------------------------------------

export type { StorageAdapter, FITIDStore, MerchantCorrectionStore } from "./storage";
export type { StoredFITID, StoredMerchantCorrection } from "./storage";
export { InMemoryStorageAdapter, InMemoryFITIDStore, InMemoryMerchantCorrectionStore } from "./storage";

// ---------------------------------------------------------------------------
// AI Provider (BYOK)
// ---------------------------------------------------------------------------

export type { AIProvider, AIRequestOptions, AIResponse } from "./ai-provider";
export { setAIProvider, getAIProvider, hasAIProvider, chatCompletionJSON } from "./ai-provider";
export { MockAIProvider } from "./ai-provider";

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export { StatementKitError, FormatDetectionError, ParseError, ValidationError, OCRError } from "./errors";
export type { StatementKitErrorCode } from "./errors";

// ---------------------------------------------------------------------------
// OCR Language Support
// ---------------------------------------------------------------------------

export { getOCRLanguage, getSupportedOCRLanguages } from "./tesseract-lang-map";
