"use client";

/**
 * Transaction Import Page
 * Upload and import bank statements in CSV, OFX, or QFX format
 * Supports 15+ banks including BMO, Home Trust, TD, Chase, Bank of America
 */

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Upload, FileText, CheckCircle, AlertCircle, Download, Eye, X, Check } from "lucide-react";
import { db, saveImportMetadata, getImportHistory } from "@/lib/budget-db";
import {
  parseCSVContent,
  detectBank,
  BANK_CONFIGS,
  convertToTransactions,
  generateImportSummary,
  type ImportSummary,
} from "@/lib/parsers/csv-parser";
import { extractTransactionSamples } from "@/lib/ai/smart-bank-detection";
import { parseOFXFile, validateOFXFile, detectOFXVariant } from "@/lib/parsers/ofx-parser";
import {
  detectFileFormat,
  getFormatDisplayName,
  isFormatSupported,
  type FormatDetectionResult,
  type FileFormat,
} from "@/lib/parsers/format-detector";
import { categorizeTransaction } from "@/lib/categorization/rules";
// Natural Language Import DEPRECATED (2025-11-24)
// Disabled due to connection errors and low value - client-side AI calls are insecure
// import { parseImportIntent, autoConfigureImport, isNaturalLanguageImportEnabled } from '@/lib/ai/natural-language-import';
import type { ParsedTransaction, Transaction, ImportMetadata, Account } from "@/types/budget";
import { format } from "date-fns";
import { HelpTooltip } from "@/components/budget/HelpTooltip";
import ColumnMapperModal, { type ManualColumnMapping } from "@/components/budget/ColumnMapperModal";
import AIColumnMapperModal from "@/components/budget/AIColumnMapperModal";
import type { ColumnMapping } from "@/lib/ai/smart-column-mapper";
import { analyzeColumnsWithAI } from "@/lib/ai/smart-column-mapper";
import ErrorRecoveryModal from "@/components/budget/ErrorRecoveryModal";
import type { ErrorAnalysisResult, RecoverySuggestion } from "@/lib/ai/smart-error-recovery";
// analyzeErrorWithAI removed - now using server-side API route
import { autoFixEncoding, autoFixCSVSkipRows } from "@/lib/ai/smart-error-recovery";
import ValidationWarningsModal from "@/components/budget/ValidationWarningsModal";
import type { ValidationResult } from "@/lib/ai/smart-transaction-validator";
import { validateTransactions } from "@/lib/ai/smart-transaction-validator";
import type { EnrichedTransaction, EnrichmentResult } from "@/lib/ai/smart-transaction-enrichment";
import { enrichTransactions } from "@/lib/ai/smart-transaction-enrichment";
import { detectDuplicatesEnhanced } from "@/lib/ai/smart-duplicate-detection";
import { learnFromImport } from "@/lib/collective-learning-service";
import {
  findMatchingAccount,
  learnAccountAssociation,
  autoCreateAccount,
  detectAccountTypeFromBank,
  migrateDefaultTransactions,
} from "@/lib/smart-account-matcher";
import BalanceReconciliationModal, {
  clearPendingReconciliation,
} from "@/components/budget/BalanceReconciliationModal";

export default function ImportPage() {
  const router = useRouter();
  const locale = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [formatDetection, setFormatDetection] = useState<FormatDetectionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>("auto");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<string>("");
  const [matchedAccountName, setMatchedAccountName] = useState<string>("");
  const [accountMatchConfidence, setAccountMatchConfidence] = useState<number>(0);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "complete">("upload");
  const [error, setError] = useState<string | null>(null);
  const [expandedReviewIndex, setExpandedReviewIndex] = useState<number | null>(null);
  const [matchedTransactions, setMatchedTransactions] = useState<Map<number, Transaction>>(
    new Map()
  );
  // Natural Language Import state DEPRECATED (2025-11-24) - disabled due to connection issues
  // const [nlInput, setNlInput] = useState<string>('');
  // const [isProcessingNL, setIsProcessingNL] = useState(false);
  // const [nlResult, setNlResult] = useState<{ success: boolean; message: string } | null>(null);
  const [importHistory, setImportHistory] = useState<ImportMetadata[]>([]);
  // const [isNLEnabled, setIsNLEnabled] = useState(false); // Track NL feature enabled state

  // PDF-specific state
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfOcrConfidence, setPdfOcrConfidence] = useState<number | null>(null);
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(0);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(0);

  // Manual column mapping state
  const [showColumnMapper, setShowColumnMapper] = useState(false);
  const [pdfRawText, setPdfRawText] = useState<string>("");
  const [pdfRawRows, setPdfRawRows] = useState<string[]>([]);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const [pdfDiagnostics, setPdfDiagnostics] = useState<any>(null);

  // AI column mapping state (for unknown CSV banks)
  const [showAIColumnMapper, setShowAIColumnMapper] = useState(false);
  const [pendingCSVText, setPendingCSVText] = useState<string>("");
  const [pendingCSVHeaders, setPendingCSVHeaders] = useState<string[]>([]);
  const [pendingCSVRows, setPendingCSVRows] = useState<any[]>([]);

  // Error recovery state
  const [showErrorRecovery, setShowErrorRecovery] = useState(false);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysisResult | null>(null);
  const [isFixingError, setIsFixingError] = useState(false);
  const [pendingErrorFile, setPendingErrorFile] = useState<File | null>(null);
  const [pendingErrorText, setPendingErrorText] = useState<string>("");

  // Transaction validation state
  const [showValidationWarnings, setShowValidationWarnings] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [pendingValidatedTransactions, setPendingValidatedTransactions] = useState<
    ParsedTransaction[]
  >([]);

  // Transaction enrichment state
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState<string>("");
  const [enrichmentResult, setEnrichmentResult] = useState<EnrichmentResult | null>(null);

  // Balance reconciliation state
  const [showBalanceReconciliation, setShowBalanceReconciliation] = useState(false);
  const [importedNetChange, setImportedNetChange] = useState<number>(0);
  const [importedAccountId, setImportedAccountId] = useState<string>("");
  const [importedAccountName, setImportedAccountName] = useState<string>("");
  const [importedAccountType, setImportedAccountType] = useState<"checking" | "savings" | "credit">(
    "checking"
  );
  const [importedTransactionCount, setImportedTransactionCount] = useState<number>(0);
  const [importedDateRange, setImportedDateRange] = useState<{ start: Date; end: Date } | null>(
    null
  );
  const [readyForReconciliation, setReadyForReconciliation] = useState(false);

  // Effect to show balance reconciliation modal when import completes
  // Using useEffect is more reliable than setting state in async functions
  useEffect(() => {
    if (
      readyForReconciliation &&
      step === "complete" &&
      importedAccountId &&
      !showBalanceReconciliation
    ) {
      // Small delay to ensure the complete step UI renders first
      const timer = setTimeout(() => {
        setShowBalanceReconciliation(true);
        setReadyForReconciliation(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [readyForReconciliation, step, importedAccountId, showBalanceReconciliation]);

  // Natural Language Import DISABLED (2025-11-24)
  // useEffect(() => {
  //   setIsNLEnabled(isNaturalLanguageImportEnabled());
  // }, []);

  // Load accounts and import history on mount
  useEffect(() => {
    loadAccounts();
    loadImportHistoryData();
  }, []);

  async function loadAccounts() {
    try {
      const accts = await db.accounts.toArray();
      setAccounts(accts);
      console.log("[ImportPage] Loaded accounts:", accts.length);
      // Auto-select if only one account exists
      if (accts.length === 1) {
        setAccountId(accts[0].id);
      }
    } catch (error) {
      console.error("[ImportPage] Error loading accounts:", error);
    }
  }

  async function loadImportHistoryData() {
    try {
      const history = await getImportHistory(5); // Last 5 imports
      setImportHistory(history);
      console.log("[ImportPage] Loaded import history:", history.length, "records");
    } catch (error) {
      console.error("[ImportPage] Error loading import history:", error);
    }
  }

  // Load matched transaction when expanded
  useEffect(() => {
    if (expandedReviewIndex !== null) {
      const tx = parsedTransactions[expandedReviewIndex];
      if (tx?.matchedTransactionId && !matchedTransactions.has(expandedReviewIndex)) {
        getMatchedTransaction(tx.matchedTransactionId).then((matched) => {
          if (matched) {
            setMatchedTransactions((prev) => new Map(prev).set(expandedReviewIndex, matched));
          }
        });
      }
    }
  }, [expandedReviewIndex, parsedTransactions, matchedTransactions]);

  // Detect file format using content analysis
  async function detectFormat(file: File): Promise<FormatDetectionResult | null> {
    try {
      console.log("[ImportPage] Detecting format for:", file.name);
      const detection = await detectFileFormat(file);
      console.log("[ImportPage] Format detected:", detection);
      setFormatDetection(detection);

      // Show warnings if confidence is low or format is unsupported
      if (!isFormatSupported(detection.format)) {
        setError(`Unsupported file format: ${getFormatDisplayName(detection.format)}`);
      } else if (detection.confidence < 0.5) {
        setError(`Low confidence format detection. ${detection.suggestions?.join(" ")}`);
      }

      return detection;
    } catch (error) {
      console.error("[ImportPage] Format detection error:", error);
      setError("Unable to detect file format. Please try a different file.");
      setFormatDetection(null);
      return null;
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      await detectFormat(droppedFile);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await detectFormat(selectedFile);
    }
  };

  // Natural Language Import DISABLED (2025-11-24) - client-side AI calls removed
  // async function handleNaturalLanguageImport() { ... }

  // Helper function to detect bank from file content using AI
  async function detectBankFromContent(text: string): Promise<string | null> {
    console.log("[ImportPage] AI-powered bank detection starting...");
    setProcessingStage("Analyzing bank format with AI...");

    // Try different skipRows levels (0-5) to find valid headers
    // BMO has 3 metadata rows + optional blank line before headers
    for (let skipRows = 0; skipRows <= 5; skipRows++) {
      try {
        const rows = parseCSVContent(text, skipRows);
        if (rows.length > 0) {
          const headers = Object.keys(rows[0]);

          // Only attempt detection if we have multiple columns (skip metadata rows)
          if (headers.length < 2) continue;

          // Try API-based detection first
          try {
            const samples = extractTransactionSamples(rows, headers[1] || headers[0]);

            const response = await fetch("/api/bank/detect", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                headers,
                transactionSamples: samples,
                useAI: true,
                learnFormat: true,
              }),
            });

            if (!response.ok) {
              throw new Error(`Bank detection API error: ${response.status}`);
            }

            const result = await response.json();

            console.log("[ImportPage] AI detection result:", result);

            if (result.success && result.bankKey) {
              const confidenceLabel = result.confidence >= 0.7 ? "✓" : "⚠️";
              setProcessingStage(
                `${confidenceLabel} Detected ${result.bankName} (${(result.confidence * 100).toFixed(0)}% confidence)`
              );
              return result.bankKey;
            }
          } catch (apiError) {
            console.warn("[ImportPage] API detection failed at skipRows", skipRows, apiError);
          }

          // Always try header-based fallback (even if API failed)
          const headerDetected = detectBank(headers);
          if (headerDetected) {
            console.log("[ImportPage] Fallback header detection:", headerDetected);
            return headerDetected;
          }
        }
      } catch (error) {
        console.error("[ImportPage] Detection error at skipRows", skipRows, error);
        // Continue trying other skip levels
      }
    }
    return null;
  }

  async function processFile() {
    if (!file) return;

    let activeDetection = formatDetection;
    if (!activeDetection) {
      activeDetection = await detectFormat(file);
    }

    if (!activeDetection) {
      setError("Unable to detect file format. Please try a different file.");
      return;
    }

    const resolvedDetection = activeDetection;

    console.log("[ImportPage] Processing file:", file.name, "Format:", resolvedDetection.format);
    setIsProcessing(true);
    setError(null);
    setProcessingStage("Validating file format...");

    // Variable to track detected bank info for smart account matching
    let detectedBankSlug: string | null = null;
    let detectedBankName: string | null = null;
    let detectedAccountNumber: string | null = null;
    let detectedAccountType: "checking" | "savings" | "credit" | null = null;
    let detectedBankId: string | null = null; // OFX BANKID (routing number)

    try {
      // Check if format is supported
      if (!isFormatSupported(resolvedDetection.format)) {
        const errorMsg = `Unsupported format: ${getFormatDisplayName(resolvedDetection.format)}`;
        setError(errorMsg);
        return;
      }

      // Read file content
      console.log("[ImportPage] Reading file content...");
      setProcessingStage("Reading file content...");
      const text = (await file.text()).replace(/^\uFEFF/, "");
      console.log("[ImportPage] File content length:", text.length);

      let transactions: ParsedTransaction[] = [];
      const resolvedAccountId = accountId; // May be set by smart matching

      // ========================================
      // OFX/QFX Processing
      // ========================================
      if (resolvedDetection.format === "ofx" || resolvedDetection.format === "qfx") {
        console.log("[ImportPage] Processing OFX/QFX file...");
        setProcessingStage("Parsing OFX/QFX file...");

        // Validate OFX format
        const validation = validateOFXFile(text);
        if (!validation.isValid) {
          const errorMsg = `Invalid OFX file:\n${validation.errors.join("\n")}`;
          setError(errorMsg);
          return;
        }

        // Parse OFX with temporary account ID - will be updated after matching
        const ofxResult = await parseOFXFile(text, "pending-match");
        transactions = ofxResult.transactions;

        // Extract info for smart account matching
        detectedAccountNumber = ofxResult.accountInfo.ACCTID;
        detectedBankId = ofxResult.accountInfo.BANKID || null; // OFX BANKID (routing number)
        // OFX files don't typically include bank name, so we'll use 'Unknown Bank' as default
        // The bank name can be inferred later from BANKID or file name
        detectedBankName = "Unknown Bank";

        console.log("[ImportPage] OFX account info extracted:", {
          accountNumber: detectedAccountNumber ? `***${detectedAccountNumber.slice(-4)}` : null,
          bankId: detectedBankId,
          institution: detectedBankName,
        });
        // OFX account type mapping
        const ofxAcctType = ofxResult.accountInfo.ACCTTYPE?.toLowerCase();
        if (ofxAcctType?.includes("credit")) {
          detectedAccountType = "credit";
        } else if (ofxAcctType?.includes("savings")) {
          detectedAccountType = "savings";
        } else {
          detectedAccountType = "checking";
        }

        console.log("[ImportPage] OFX parsing complete");
        console.log("[ImportPage] Account:", ofxResult.accountInfo.ACCTID);
        console.log("[ImportPage] Currency:", ofxResult.metadata.currency);
        console.log("[ImportPage] Balance:", ofxResult.balances.ledgerBalance);
        console.log("[ImportPage] Transactions:", transactions.length);
      }

      // ========================================
      // CSV Processing
      // ========================================
      else if (resolvedDetection.format === "csv") {
        console.log("[ImportPage] Processing CSV file...");
        setProcessingStage("Parsing CSV file...");

        // Detect bank if auto
        let bankKey = selectedBank;
        if (selectedBank === "auto") {
          console.log("[ImportPage] Auto-detecting bank format...");
          setProcessingStage("Auto-detecting bank format...");
          const detected = await detectBankFromContent(text);
          console.log("[ImportPage] Detected bank:", detected);

          if (!detected) {
            // Bank detection failed - try universal smart import first
            console.log("[ImportPage] Bank detection failed, trying universal smart import...");
            setProcessingStage("🔍 Analyzing CSV structure...");
            detectedBankSlug = "unknown";
            detectedBankName = "Unknown Bank";

            // Try different skipRows levels to find valid data
            let bestSkipRows = 0;
            let bestRows: any[] = [];
            let bestHeaders: string[] = [];

            for (let skipRows = 0; skipRows <= 5; skipRows++) {
              const rows = parseCSVContent(text, skipRows);
              if (rows.length > 0) {
                const headers = Object.keys(rows[0]);
                // Check if headers look valid (contain common banking terms)
                const headerStr = headers.join(",").toLowerCase();
                const hasDateCol = headerStr.includes("date");
                const hasAmountCol =
                  headerStr.includes("amount") ||
                  headerStr.includes("debit") ||
                  headerStr.includes("credit") ||
                  headerStr.includes("withdrawal");
                const hasDescCol =
                  headerStr.includes("description") ||
                  headerStr.includes("desc") ||
                  headerStr.includes("details") ||
                  headerStr.includes("memo") ||
                  headerStr.includes("payee") ||
                  headerStr.includes("name") ||
                  headerStr.includes("merchant");

                if (hasDateCol && (hasAmountCol || hasDescCol)) {
                  bestSkipRows = skipRows;
                  bestRows = rows;
                  bestHeaders = headers;
                  console.log(`[ImportPage] Found valid headers at skipRows=${skipRows}:`, headers);
                  break;
                }
                // If no valid headers found yet, keep the first non-empty result as fallback
                if (bestRows.length === 0) {
                  bestSkipRows = skipRows;
                  bestRows = rows;
                  bestHeaders = headers;
                }
              }
            }

            if (bestRows.length > 0) {
              // Try universal smart import
              try {
                setProcessingStage("🤖 Smart-detecting columns...");
                const { convertToTransactionsUniversal } = await import("@/lib/parsers/csv-parser");
                const result = await convertToTransactionsUniversal(bestRows, accountId);

                console.log("[ImportPage] Universal import result:", {
                  transactions: result.transactions.length,
                  confidence: result.confidence,
                  mapping: result.mapping,
                });

                // If we found transactions, proceed automatically (user shouldn't need to verify)
                // Even low confidence is better than asking users who don't know bank formats
                if (result.transactions.length > 0) {
                  setProcessingStage(`✓ Detected ${result.transactions.length} transactions`);
                  transactions = result.transactions;
                  console.log(
                    "[ImportPage] Universal import successful, proceeding with",
                    transactions.length,
                    "transactions"
                  );
                  // Continue to duplicate detection and preview
                } else {
                  // No transactions found - try harder with relaxed parsing
                  throw new Error("No transactions could be parsed");
                }
              } catch (universalError) {
                console.error("[ImportPage] Universal import failed:", universalError);

                // Fall back to AI Column Mapper
                setProcessingStage("⚠️ Please map columns manually...");

                const sampleRows = bestRows.slice(0, 10);
                setPendingCSVText(text);
                setPendingCSVHeaders(bestHeaders);
                setPendingCSVRows(sampleRows);
                (window as any).__pendingCSVSkipRows = bestSkipRows;

                setShowAIColumnMapper(true);
                setIsProcessing(false);
                return;
              }
            } else {
              const errorMsg = "Could not parse CSV file. Please check the file format.";
              setError(errorMsg);
              return;
            }
          } else {
            bankKey = detected;
            // Store detected bank info for smart account matching
            detectedBankSlug = detected;
            const bankConfig = BANK_CONFIGS[detected];
            detectedBankName = bankConfig?.name || detected;
            detectedAccountType = detectAccountTypeFromBank(detected);
          }
        }

        // If universal import succeeded, skip bank config processing
        if (transactions.length === 0 && bankKey) {
          console.log("[ImportPage] Using bank config:", bankKey);

          const bankConfig = BANK_CONFIGS[bankKey];
          if (!bankConfig) {
            setError("Invalid bank configuration. Please try selecting a different bank.");
            return;
          }

          // Parse CSV with the correct skipRows
          const rows = parseCSVContent(text, bankConfig.skipRows || 0);
          if (rows.length === 0) {
            setError("No data found in CSV file. The file may be empty or incorrectly formatted.");
            return;
          }

          // Convert to transactions
          transactions = convertToTransactions(rows, bankConfig, accountId);

          console.log("[ImportPage] Converted transactions:", transactions.length);

          // If bank config conversion failed, try universal converter
          if (transactions.length === 0) {
            console.log(
              "[ImportPage] Bank config conversion returned 0 transactions, trying universal converter..."
            );
            setProcessingStage("🔄 Trying alternative parsing method...");

            try {
              const { convertToTransactionsUniversal } = await import("@/lib/parsers/csv-parser");
              const universalResult = await convertToTransactionsUniversal(rows, accountId);

              if (universalResult.transactions.length > 0) {
                transactions = universalResult.transactions;
                console.log(
                  "[ImportPage] Universal converter found",
                  transactions.length,
                  "transactions"
                );
              }
            } catch (universalError) {
              console.error("[ImportPage] Universal converter failed:", universalError);
            }
          }
        }

        console.log("[ImportPage] CSV parsing complete, transactions:", transactions.length);

        // Check for 0 transactions
        if (transactions.length === 0) {
          setError(
            "No transactions could be parsed from this file.\n\n" +
              "Possible causes:\n" +
              "• The file format may not be recognized\n" +
              "• The date or amount columns may be empty\n" +
              "• The file may contain only headers\n\n" +
              "Try selecting a different bank format or contact support."
          );
          return;
        }
      }

      // ========================================
      // PDF Bank Statement Processing
      // ========================================
      else if (resolvedDetection.format === "pdf") {
        console.log("[ImportPage] Processing PDF bank statement...");

        // Try native text extraction first (faster, works for all languages)
        let useOcr = true;
        try {
          setProcessingStage("Checking PDF for selectable text...");
          const { pdfHasText } = await import("@/lib/parsers/pdf-text-extractor");
          const hasText = await pdfHasText(file);
          if (hasText) {
            console.log("[ImportPage] PDF has selectable text — using native extraction");
            useOcr = false;
          } else {
            console.log("[ImportPage] PDF is scanned — falling back to OCR");
          }
        } catch (err) {
          console.warn("[ImportPage] Text extraction check failed, using OCR:", err);
        }

        setProcessingStage(
          useOcr
            ? "Extracting transactions from PDF (OCR)..."
            : "Extracting transactions from PDF (text layer)..."
        );

        const { extractBankStatementData } = await import("@/lib/bank-statement-ocr");

        const { getOCRLanguage } = await import("@/lib/parsers/tesseract-lang-map");
        const ocrLanguage = getOCRLanguage(locale);

        const result = await extractBankStatementData(
          file,
          accountId,
          (current, total) => {
            setPdfCurrentPage(current);
            setPdfTotalPages(total);
            setProcessingStage(`Processing page ${current}/${total}...`);
          },
          ocrLanguage
        );

        // Handle OCR errors
        if (result.errors.length > 0) {
          console.error("[ImportPage] OCR errors:", result.errors);
          setError(`PDF OCR failed: ${result.errors.join(", ")}`);
          return;
        }

        // Display warnings to user
        if (result.warnings.length > 0) {
          console.warn("[ImportPage] OCR warnings:", result.warnings);
          // Show warnings in UI (will be added to setError or separate warning state)
          const warningMessage = result.warnings.join("\n");
          console.warn("[ImportPage] User-facing warnings:\n", warningMessage);
        }

        // Log detailed diagnostics
        console.log("[ImportPage] PDF OCR Diagnostics:", {
          pagesProcessed: result.pagesProcessed,
          averageConfidence: `${(result.averageConfidence * 100).toFixed(1)}%`,
          totalLines: result.diagnostics.totalLinesProcessed,
          linesFiltered: result.diagnostics.linesFilteredAsHeaders,
          groupsFormed: result.diagnostics.transactionGroupsFormed,
          transactionsParsed: result.diagnostics.transactionsParsed,
          transactionsFailed: result.diagnostics.transactionsFailedToParse,
          pageBreakdown: result.diagnostics.pageBreakdown,
        });

        // Store PDF metadata for UI display
        setPdfPageCount(result.pagesProcessed);
        setPdfOcrConfidence(result.averageConfidence);

        // Store diagnostics for debug export
        setPdfDiagnostics({
          pagesProcessed: result.pagesProcessed,
          averageConfidence: result.averageConfidence,
          totalLines: result.diagnostics.totalLinesProcessed,
          linesFiltered: result.diagnostics.linesFilteredAsHeaders,
          groupsFormed: result.diagnostics.transactionGroupsFormed,
          transactionsParsed: result.diagnostics.transactionsParsed,
          transactionsFailed: result.diagnostics.transactionsFailedToParse,
          pageBreakdown: result.diagnostics.pageBreakdown,
          warnings: result.warnings,
          errors: result.errors,
        });

        // Store raw text for manual mapping fallback
        setPdfRawText(result.rawText);
        const rows = result.rawText
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .slice(0, 20); // First 20 rows
        setPdfRawRows(rows);

        // Check if NO transactions were extracted (critical failure)
        if (result.transactions.length === 0) {
          console.error("[ImportPage] No transactions extracted from PDF");
          setError(
            `Unable to extract transactions from PDF.\n\n` +
              `Diagnostics:\n` +
              `- Pages processed: ${result.pagesProcessed}\n` +
              `- Lines extracted: ${result.diagnostics.totalLinesProcessed}\n` +
              `- Lines filtered as headers: ${result.diagnostics.linesFilteredAsHeaders}\n` +
              `- Transaction groups formed: ${result.diagnostics.transactionGroupsFormed}\n` +
              `- Parse success rate: ${result.diagnostics.transactionGroupsFormed > 0 ? Math.round((result.diagnostics.transactionsParsed / result.diagnostics.transactionGroupsFormed) * 100) : 0}%\n\n` +
              `Possible solutions:\n` +
              `1. Try exporting as CSV instead of PDF\n` +
              `2. Check browser console for detailed OCR logs\n` +
              `3. Ensure PDF is text-based (not scanned image)`
          );
          return;
        }

        // Check if very few transactions extracted (possible parsing issue)
        if (result.transactions.length < result.diagnostics.transactionGroupsFormed * 0.5) {
          const parseSuccessRate = Math.round(
            (result.diagnostics.transactionsParsed / result.diagnostics.transactionGroupsFormed) *
              100
          );
          console.warn(
            `[ImportPage] Low parse success rate: ${parseSuccessRate}% (${result.transactions.length}/${result.diagnostics.transactionGroupsFormed} groups)`
          );

          // Show warning but allow user to continue
          setProcessingStage(
            `⚠️ Low extraction rate: ${result.transactions.length} of ~${result.diagnostics.transactionGroupsFormed} expected transactions (${parseSuccessRate}%). Review transactions carefully.`
          );
        }

        // Check if manual mapping is needed (confidence <70%)
        if (result.averageConfidence < 0.7) {
          console.warn("[ImportPage] Low OCR confidence:", result.averageConfidence);
          setProcessingStage(
            `⚠️ Low OCR confidence (${(result.averageConfidence * 100).toFixed(0)}%) - manual column mapping recommended`
          );

          // Store pending file and show manual mapping modal
          setPendingPdfFile(file);
          setShowColumnMapper(true);
          setIsProcessing(false);

          // Don't continue processing - wait for user to map columns
          return;
        }

        transactions = result.transactions;

        console.log("[ImportPage] PDF processing complete:", transactions.length, "transactions");
        console.log("[ImportPage] Pages processed:", result.pagesProcessed);
        console.log("[ImportPage] Average confidence:", result.averageConfidence);
        console.log(
          "[ImportPage] Parse success rate:",
          result.diagnostics.transactionGroupsFormed > 0
            ? `${Math.round((result.diagnostics.transactionsParsed / result.diagnostics.transactionGroupsFormed) * 100)}%`
            : "N/A"
        );
      }

      // ========================================
      // QIF Processing
      // ========================================
      else if (resolvedDetection.format === "qif") {
        console.log("[ImportPage] Processing QIF file...");
        setProcessingStage("Parsing QIF file...");

        const { parseQIFFile } = await import("@/lib/parsers/qif-parser");
        transactions = parseQIFFile(text, { locale });

        console.log("[ImportPage] QIF parsing complete:", transactions.length, "transactions");
      }

      // ========================================
      // MT940 Processing
      // ========================================
      else if (resolvedDetection.format === "mt940") {
        console.log("[ImportPage] Processing MT940 file...");
        setProcessingStage("Parsing MT940 (SWIFT) file...");

        const { parseMT940File } = await import("@/lib/parsers/mt940-parser");
        transactions = await parseMT940File(text, { locale });

        console.log("[ImportPage] MT940 parsing complete:", transactions.length, "transactions");
      }

      // ========================================
      // CAMT.053 Processing
      // ========================================
      else if (resolvedDetection.format === "camt053") {
        console.log("[ImportPage] Processing CAMT.053 file...");
        setProcessingStage("Parsing CAMT.053 (ISO 20022) file...");

        const { parseCAMT053File } = await import("@/lib/parsers/camt053-parser");
        transactions = parseCAMT053File(text, { locale });

        console.log("[ImportPage] CAMT.053 parsing complete:", transactions.length, "transactions");
      } else {
        setError(
          `Unsupported file format: ${resolvedDetection.format}. Please use CSV, OFX, QFX, QIF, MT940, CAMT.053, or PDF files.`
        );
        return;
      }

      // ========================================
      // Common Processing (Both Formats)
      // ========================================

      // Detect duplicates using FITID (perfect for OFX) or fuzzy matching (CSV)
      // Optionally use smart detection with Claude API if enabled
      console.log("[ImportPage] Checking for duplicates...");
      setProcessingStage(`Detecting duplicates in ${transactions.length} transactions...`);
      const existingTxs = await db.transactions.toArray();
      console.log("[ImportPage] Existing transactions count:", existingTxs.length);

      // Check if smart duplicate detection is enabled
      const { isSmartDuplicateDetectionEnabled } = await import("@/lib/budget-privacy-settings");
      const useSmartDetection = isSmartDuplicateDetectionEnabled();
      console.log(
        "[ImportPage] Smart duplicate detection:",
        useSmartDetection ? "enabled" : "disabled"
      );

      await detectDuplicatesEnhanced(transactions, existingTxs, useSmartDetection);
      console.log("[ImportPage] Duplicate detection complete");

      // ========================================
      // Transaction Enrichment (BEFORE validation)
      // ========================================
      // Enrichment must happen before validation so that when we store
      // pendingValidatedTransactions, they already have all required fields
      setProcessingStage("Enriching transactions...");
      setIsEnriching(true);
      const { isAIFeaturesEnabled } = await import("@/lib/budget-privacy-settings");
      const useAIEnrichment = isAIFeaturesEnabled();
      console.log("[ImportPage] AI enrichment:", useAIEnrichment ? "enabled" : "disabled");

      const { enriched, result: enrichmentRes } = await enrichTransactions(
        transactions,
        useAIEnrichment
      );
      console.log(
        "[ImportPage] Enrichment complete:",
        enrichmentRes.enrichedCount,
        "/",
        enrichmentRes.totalCount,
        "transactions enriched"
      );

      setEnrichmentResult(enrichmentRes);
      setIsEnriching(false);

      // Use enriched transactions for preview
      // Map enriched data to ParsedTransaction format with suggestions
      const enrichedParsed: ParsedTransaction[] = enriched.map((enrichedTx) => {
        const tx: ParsedTransaction = { ...enrichedTx };

        // Add enriched data as suggestions
        if (enrichedTx.suggestedCategory) {
          (tx as any).suggestedCategory = enrichedTx.suggestedCategory;
          (tx as any).suggestedSubcategory = enrichedTx.suggestedSubcategory;
          (tx as any).categoryConfidence = enrichedTx.categoryConfidence;
        }

        if (enrichedTx.normalizedMerchant) {
          (tx as any).normalizedMerchant = enrichedTx.normalizedMerchant;
          (tx as any).merchantConfidence = enrichedTx.merchantConfidence;
        }

        if (enrichedTx.isLikelyRecurring) {
          (tx as any).isLikelyRecurring = enrichedTx.isLikelyRecurring;
          (tx as any).recurringFrequency = enrichedTx.recurringFrequency;
        }

        // Fallback to rule-based categorization if no AI category
        if (!enrichedTx.suggestedCategory) {
          const fallbackResult = categorizeTransaction(tx.description);
          if (fallbackResult) {
            (tx as any).suggestedCategory = fallbackResult.category;
            (tx as any).suggestedSubcategory = fallbackResult.subcategory;
          }
        }

        return tx;
      });

      // ========================================
      // Smart Account Matching (BEFORE validation)
      // ========================================
      setProcessingStage("Matching to account...");
      console.log("[ImportPage] Smart account matching:", {
        bankSlug: detectedBankSlug,
        bankName: detectedBankName,
        accountNumber: detectedAccountNumber ? `***${detectedAccountNumber.slice(-4)}` : null,
        bankId: detectedBankId,
        accountType: detectedAccountType,
        fileName: file?.name,
      });

      const matchResult = await findMatchingAccount(
        detectedBankSlug,
        detectedBankName,
        detectedAccountNumber,
        file?.name || null,
        detectedAccountType,
        detectedBankId // Pass BANKID for composite key matching
      );

      console.log("[ImportPage] Account match result:", {
        matched: matchResult.account?.name,
        confidence: matchResult.confidence,
        reason: matchResult.matchReason,
      });

      let finalAccountId: string;

      if (matchResult.account && matchResult.confidence >= 0.5) {
        // Good match - use it automatically
        finalAccountId = matchResult.account.id;
        setAccountId(finalAccountId);
        setMatchedAccountName(matchResult.account.name);
        setAccountMatchConfidence(matchResult.confidence);

        // Only learn association when highly confident (0.85+) to prevent polluting future matches
        // Low confidence matches might be wrong and could teach incorrect associations
        if (matchResult.confidence >= 0.85) {
          await learnAccountAssociation(
            finalAccountId,
            detectedBankSlug,
            detectedAccountNumber,
            detectedBankId
          );
          console.log("[ImportPage] Learned association for high-confidence match");
        }

        console.log("[ImportPage] Auto-matched to account:", matchResult.account.name);
      } else if (accounts.length === 0) {
        // No accounts exist - auto-create one based on detected bank
        console.log("[ImportPage] No accounts exist, auto-creating...");
        const newAccount = await autoCreateAccount(
          detectedBankSlug || "unknown",
          detectedBankName || "Primary Account",
          detectedAccountType || "checking",
          detectedAccountNumber,
          detectedBankId // Pass BANKID for new account
        );
        finalAccountId = newAccount.id;
        setAccountId(finalAccountId);
        setMatchedAccountName(newAccount.name);
        setAccountMatchConfidence(1);

        // Reload accounts list
        await loadAccounts();

        console.log("[ImportPage] Auto-created account:", newAccount.name);
      } else if (accounts.length === 1) {
        // Only one account exists - use it
        finalAccountId = accounts[0].id;
        setAccountId(finalAccountId);
        setMatchedAccountName(accounts[0].name);
        setAccountMatchConfidence(0.9);

        // Learn this association - safe since there's only one account
        await learnAccountAssociation(
          finalAccountId,
          detectedBankSlug,
          detectedAccountNumber,
          detectedBankId
        );

        console.log("[ImportPage] Using only account:", accounts[0].name);
      } else {
        // Multiple accounts but no confident match - show selector
        console.log("[ImportPage] No confident match, showing account selector");
        setShowAccountSelector(true);

        // Store transactions temporarily and wait for user selection
        // For now, use the first account as default but let user change
        finalAccountId = matchResult.account?.id || accounts[0].id;
        setAccountId(finalAccountId);
        setMatchedAccountName(accounts.find((a) => a.id === finalAccountId)?.name || "");
        setAccountMatchConfidence(matchResult.confidence);
      }

      // Update all transactions with the matched account ID
      const transactionsWithAccount = enrichedParsed.map((tx) => ({
        ...tx,
        accountId: finalAccountId,
      }));

      // ========================================
      // Transaction Validation (AFTER enrichment and account matching)
      // ========================================
      // Now transactions have accountId so validation proceed will work correctly
      setProcessingStage("Validating transactions...");
      const useAIValidation = isAIFeaturesEnabled();
      console.log("[ImportPage] AI validation:", useAIValidation ? "enabled" : "disabled");

      const validation = await validateTransactions(transactionsWithAccount, useAIValidation);
      console.log("[ImportPage] Validation complete:", validation.issues.length, "issues found");

      // If validation finds critical or warning issues, show modal
      if (validation.hasIssues && (validation.criticalCount > 0 || validation.warningCount > 0)) {
        console.log(
          "[ImportPage] Validation issues found, showing warnings modal:",
          validation.criticalCount,
          "critical,",
          validation.warningCount,
          "warnings"
        );

        // Store fully-processed transactions (with accountId) and validation result
        setPendingValidatedTransactions(transactionsWithAccount);
        setValidationResult(validation);
        setShowValidationWarnings(true);
        setIsProcessing(false);

        // Don't continue processing - wait for user to review validation issues
        return;
      }

      console.log("[ImportPage] Setting parsed transactions:", transactionsWithAccount.length);
      setParsedTransactions(transactionsWithAccount);
      setSummary(generateImportSummary(transactionsWithAccount));
      setStep("preview");
      console.log("[ImportPage] Processing complete, moving to preview step");
    } catch (error) {
      console.error("[ImportPage] ERROR processing file:", error);
      const errorMsg =
        error instanceof Error
          ? `Error: ${error.message}\n\nStack: ${error.stack}`
          : "Error processing file. Please check the format and try again.";
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }

  function toggleDuplicateStatus(index: number) {
    const updated = [...parsedTransactions];
    updated[index].isDuplicate = !updated[index].isDuplicate;
    // Clear review flag when manually overridden
    if (updated[index].isDuplicate) {
      updated[index].requiresReview = false;
    }
    setParsedTransactions(updated);
    // Recalculate summary
    setSummary(generateImportSummary(updated));
  }

  async function getMatchedTransaction(txId: string | undefined): Promise<Transaction | null> {
    if (!txId) return null;
    try {
      return (await db.transactions.get(txId)) || null;
    } catch {
      return null;
    }
  }

  async function importTransactions() {
    console.log("[ImportPage] Starting import...");
    setIsProcessing(true);
    setError(null);

    try {
      // CRITICAL: Validate account is selected before importing
      if (!accountId || accountId.trim() === "") {
        console.error("[ImportPage] No account selected for import");
        setError(
          "Please select an account before importing transactions. Go to the Accounts page to create an account first."
        );
        setIsProcessing(false);
        return;
      }

      const newTransactions = parsedTransactions.filter((tx) => !tx.isDuplicate);
      console.log(
        "[ImportPage] Importing",
        newTransactions.length,
        "new transactions to account:",
        accountId
      );

      // Convert to Transaction objects
      const transactions: Transaction[] = newTransactions.map((tx, index) => ({
        id: `tx_${Date.now()}_${index}`,
        accountId,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        category: (tx as any).suggestedCategory || null,
        subcategory: (tx as any).suggestedSubcategory || null,
        notes: "",
        isRecurring: false,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Save to database
      console.log("[ImportPage] Saving to IndexedDB...");
      await db.transactions.bulkAdd(transactions);
      console.log("[ImportPage] Save complete");

      // Save import metadata for audit trail
      const duplicateCount = parsedTransactions.filter((tx) => tx.isDuplicate).length;
      const transactionDates = newTransactions.map((tx) => tx.date);
      const dateRangeStart =
        transactionDates.length > 0
          ? new Date(Math.min(...transactionDates.map((d) => d.getTime())))
          : null;
      const dateRangeEnd =
        transactionDates.length > 0
          ? new Date(Math.max(...transactionDates.map((d) => d.getTime())))
          : null;

      try {
        // Ensure fileFormat is one of the supported types
        const detectedFormat = formatDetection?.format || "csv";
        const fileFormat: "csv" | "ofx" | "qfx" =
          detectedFormat === "csv" || detectedFormat === "ofx" || detectedFormat === "qfx"
            ? detectedFormat
            : "csv"; // Default to csv for unknown formats

        await saveImportMetadata({
          fileName: file?.name || "unknown",
          fileFormat,
          bank: (formatDetection as any)?.bankName || undefined,
          importDate: new Date(),
          transactionCount: newTransactions.length,
          duplicateCount,
          dateRangeStart,
          dateRangeEnd,
        });
        console.log("[ImportPage] Import metadata saved");

        // Refresh import history display
        await loadImportHistoryData();
      } catch (metaError) {
        console.error("[ImportPage] Error saving import metadata:", metaError);
        // Non-fatal error - don't block import completion
      }

      // Learn from this import (contribute to collective intelligence)
      try {
        const bankName = (formatDetection as any)?.bankName;
        const bankSlug = bankName?.toLowerCase().replace(/\s+/g, "-");
        const columnMappings = (formatDetection as any)?.columnMappings;

        await learnFromImport(
          parsedTransactions,
          accountId, // Use accountId as userId for privacy
          bankName,
          bankSlug,
          columnMappings
        );
        console.log("[ImportPage] Collective learning complete");
      } catch (learningError) {
        console.error("[ImportPage] Error learning from import:", learningError);
        // Non-fatal error - don't block import completion
      }

      // Calculate net change of imported transactions for balance reconciliation
      const netChange = newTransactions.reduce((sum, tx) => sum + tx.amount, 0);

      // Get account name and type for the modal
      const accountForReconciliation = accounts.find((a) => a.id === accountId);
      const accountNameForModal = accountForReconciliation?.name || matchedAccountName || "Account";
      const accountTypeForModal = accountForReconciliation?.type || "checking";

      // Store values for balance reconciliation modal
      setImportedNetChange(Math.round(netChange * 100) / 100);
      setImportedAccountId(accountId);
      setImportedAccountName(accountNameForModal);
      setImportedAccountType(accountTypeForModal);
      setImportedTransactionCount(newTransactions.length);
      setImportedDateRange(
        dateRangeStart && dateRangeEnd ? { start: dateRangeStart, end: dateRangeEnd } : null
      );

      setStep("complete");

      // Trigger balance reconciliation modal after import (only if transactions were imported)
      if (newTransactions.length > 0) {
        setReadyForReconciliation(true);
      }
    } catch (error) {
      console.error("[ImportPage] ERROR importing:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Error importing transactions. Please try again.";

      // Trigger AI-powered error recovery
      await handleImportError(errorMsg, error instanceof Error ? error : null);
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle import errors with AI-powered recovery
  async function handleImportError(errorMessage: string, error: Error | null) {
    console.log("[ImportPage] Analyzing error for recovery options...");
    setError(errorMessage);

    // Don't show recovery modal if processing is cancelled by user
    if (errorMessage.includes("cancelled") || errorMessage.includes("closed")) {
      return;
    }

    try {
      // Analyze error with AI
      const fileInfo = file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        : {
            name: "unknown",
            size: 0,
            type: "unknown",
          };

      // Get file sample for AI analysis (first 500 chars)
      let fileSample: string | undefined;
      if (file) {
        try {
          const text = await file.text();
          fileSample = text.slice(0, 500);
          setPendingErrorText(text);
        } catch (e) {
          console.error("[ImportPage] Could not read file for error analysis:", e);
        }
      }

      // Call server-side API for error analysis (secure, no exposed API key)
      const response = await fetch("/api/import/analyze-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: errorMessage,
          fileInfo,
          context: {
            fileSample,
            stackTrace: error?.stack,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.warn("[ImportPage] Error analysis API returned error:", data.error);
        // Fall back to showing basic error without suggestions
        return;
      }

      // Convert API response to ErrorAnalysisResult format
      const analysis: ErrorAnalysisResult = {
        category: data.category || "unknown",
        severity: data.severity || "medium",
        canRecover: data.canRecover ?? false,
        suggestions: data.suggestions || [],
        aiAnalysis: data.aiAnalysis,
        detectedIssues: data.detectedIssues || [errorMessage],
      };

      console.log("[ImportPage] Error analysis complete:", analysis);

      // Store analysis and show recovery modal
      setErrorAnalysis(analysis);
      setPendingErrorFile(file);
      setShowErrorRecovery(true);
    } catch (analysisError) {
      console.error("[ImportPage] Error analysis failed:", analysisError);
      // Fall back to standard error display
    }
  }

  // Export PDF debug data for troubleshooting
  function exportPDFDebugData() {
    if (!pdfDiagnostics || !pdfRawText) {
      console.error("[ImportPage] No PDF diagnostics data to export");
      return;
    }

    const debugData = {
      timestamp: new Date().toISOString(),
      fileName: file?.name || "unknown",
      fileSize: file?.size || 0,
      diagnostics: pdfDiagnostics,
      rawOCRText: pdfRawText,
      consoleHint:
        "Check browser console for detailed OCR logs with [PDF OCR] and [parseTableRows] prefixes",
    };

    const jsonStr = JSON.stringify(debugData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pdf-ocr-debug-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("[ImportPage] PDF debug data exported");
  }

  // Handle auto-fix suggestion from error recovery
  async function handleAutoFix(suggestion: RecoverySuggestion) {
    if (!pendingErrorFile) {
      console.error("[ImportPage] No pending error file");
      return;
    }

    setIsFixingError(true);
    console.log("[ImportPage] Attempting auto-fix:", suggestion.title);

    try {
      // Handle different auto-fix types
      if (suggestion.title.toLowerCase().includes("encoding")) {
        // Auto-fix encoding issues
        const result = await autoFixEncoding(pendingErrorFile);
        if (result.success && result.text) {
          console.log("[ImportPage] Encoding auto-fix successful:", result.encoding);
          // Create a new File object with the fixed text
          const blob = new Blob([result.text], { type: "text/plain; charset=utf-8" });
          const fixedFile = new File([blob], pendingErrorFile.name, {
            type: "text/csv",
          });
          setFile(fixedFile);
          setShowErrorRecovery(false);
          setError(null);
          // Auto-trigger processing with fixed file
          setTimeout(() => processFile(), 500);
        } else {
          setError(result.error || "Auto-fix failed");
        }
      } else if (
        suggestion.title.toLowerCase().includes("skip") &&
        suggestion.title.toLowerCase().includes("row")
      ) {
        // Auto-fix skip rows
        if (pendingErrorText) {
          const result = autoFixCSVSkipRows(pendingErrorText, parseCSVContent);
          if (result.success && result.rows) {
            console.log("[ImportPage] Skip rows auto-fix successful:", result.skipRows);
            // We have valid rows now, but need to update the bank config skipRows
            // For now, trigger re-import with detected skipRows
            setShowErrorRecovery(false);
            setError(null);
            // Would need to pass skipRows to processFile here
            setTimeout(() => processFile(), 500);
          } else {
            setError(result.error || "Auto-fix failed");
          }
        }
      } else {
        // Generic auto-fix - just retry the import
        console.log("[ImportPage] Retrying import after auto-fix");
        setShowErrorRecovery(false);
        setError(null);
        setTimeout(() => processFile(), 500);
      }
    } catch (error) {
      console.error("[ImportPage] Auto-fix error:", error);
      setError(error instanceof Error ? error.message : "Auto-fix failed");
    } finally {
      setIsFixingError(false);
    }
  }

  // Handle manual action suggestion from error recovery
  function handleManualAction(suggestion: RecoverySuggestion) {
    console.log("[ImportPage] Manual action:", suggestion.title);
    setShowErrorRecovery(false);

    // Handle different manual action types
    if (suggestion.title.toLowerCase().includes("column map")) {
      // Launch AI Column Mapper
      if (pendingErrorText) {
        const rows = parseCSVContent(pendingErrorText, 0);
        if (rows.length > 0) {
          const headers = Object.keys(rows[0]);
          setPendingCSVHeaders(headers);
          setPendingCSVRows(rows.slice(0, 10));
          setPendingCSVText(pendingErrorText);
          setShowAIColumnMapper(true);
        }
      }
    } else if (suggestion.title.toLowerCase().includes("bank manual")) {
      // User should select bank manually (error message already shown)
      // Keep the error visible
    } else {
      // For other manual actions, keep the error visible with suggestion
      setError(`${error || "Import failed"}\n\nSuggestion: ${suggestion.description}`);
    }
  }

  // Handle validation proceed (user reviewed warnings and wants to continue)
  function handleValidationProceed(transactionsToRemove: number[]) {
    console.log("[ImportPage] Validation proceed with", transactionsToRemove.length, "removals");

    // Get the transactions that were validated
    const transactions = [...pendingValidatedTransactions];

    // Remove flagged transactions (sort indices descending to avoid index shift issues)
    if (transactionsToRemove.length > 0) {
      const sortedIndices = [...transactionsToRemove].sort((a, b) => b - a);
      sortedIndices.forEach((index) => {
        transactions.splice(index, 1);
      });
      console.log(
        "[ImportPage] Removed",
        transactionsToRemove.length,
        "transactions, continuing with",
        transactions.length
      );
    }

    // Close validation modal
    setShowValidationWarnings(false);
    setValidationResult(null);
    setPendingValidatedTransactions([]);

    // If no transactions left, show error
    if (transactions.length === 0) {
      setError(
        "All transactions were removed during validation. Please try importing a different file."
      );
      setIsProcessing(false);
      return;
    }

    // Continue with the import workflow - move to preview step
    // The transactions variable already has validated transactions
    // We'll update the parsedTransactions state and generate summary
    setParsedTransactions(transactions);

    // Generate import summary for preview
    const newSummary = generateImportSummary(transactions);
    setSummary(newSummary);
    setStep("preview");
    setError(null);
    setIsProcessing(false);
  }

  // Handle validation cancel (user wants to abort import)
  function handleValidationCancel() {
    console.log("[ImportPage] Validation cancelled by user");
    setShowValidationWarnings(false);
    setValidationResult(null);
    setPendingValidatedTransactions([]);
    setError("Import cancelled due to validation issues. Please review your file and try again.");
    setIsProcessing(false);
  }

  // Handle balance reconciliation completion (user entered their current bank balance)
  async function handleBalanceReconciliationComplete(
    startingBalance: number,
    currentBalance: number
  ) {
    console.log("[ImportPage] Balance reconciliation complete:", {
      accountId: importedAccountId,
      startingBalance,
      currentBalance,
      netChange: importedNetChange,
    });

    try {
      const now = new Date();

      // Update the account's starting balance and reconciliation tracking fields
      await db.accounts.update(importedAccountId, {
        balance: startingBalance,
        openingBalanceDate: importedDateRange?.start || now,
        lastReconciledAt: now,
        lastReconciledBalance: currentBalance,
        updatedAt: now,
      });

      console.log("[ImportPage] Account reconciled with starting balance:", startingBalance);

      // Clear any pending reconciliation for this account
      clearPendingReconciliation(importedAccountId);

      // Refresh accounts list
      await loadAccounts();
    } catch (error) {
      console.error("[ImportPage] Error updating account balance:", error);
      // Non-fatal - import still succeeded
    }
  }

  // Handle balance reconciliation skip (user will reconcile later)
  function handleBalanceReconciliationSkip() {
    console.log("[ImportPage] Balance reconciliation skipped for:", importedAccountId);
    // The modal component already stores the pending reconciliation in localStorage
  }

  function reset() {
    setFile(null);
    setFormatDetection(null);
    setParsedTransactions([]);
    setSummary(null);
    setStep("upload");
    setSelectedBank("auto");
    setError(null);
    // Reset PDF-specific state
    setPdfPageCount(null);
    setPdfOcrConfidence(null);
    setPdfCurrentPage(0);
    setPdfTotalPages(0);
    // Reset manual mapping state
    setShowColumnMapper(false);
    setPdfRawText("");
    setPdfRawRows([]);
    setPendingPdfFile(null);
    // Reset AI column mapping state
    setShowAIColumnMapper(false);
    setPendingCSVText("");
    setPendingCSVHeaders([]);
    setPendingCSVRows([]);
    // Reset error recovery state
    setShowErrorRecovery(false);
    setErrorAnalysis(null);
    setPendingErrorFile(null);
    setPendingErrorText("");
    setIsFixingError(false);
    // Reset validation state
    setShowValidationWarnings(false);
    setValidationResult(null);
    setPendingValidatedTransactions([]);
    // Reset enrichment state
    setIsEnriching(false);
    setEnrichmentProgress("");
    setEnrichmentResult(null);
    // Reset balance reconciliation state
    setShowBalanceReconciliation(false);
    setImportedNetChange(0);
    setImportedAccountId("");
    setImportedAccountName("");
    setImportedAccountType("checking");
    setImportedTransactionCount(0);
    setImportedDateRange(null);
    setReadyForReconciliation(false);
  }

  // Handle manual column mapping application
  const handleApplyManualMapping = async (mapping: ManualColumnMapping) => {
    if (!pendingPdfFile) {
      console.error("[ImportPage] No pending PDF file");
      return;
    }

    try {
      setIsProcessing(true);
      setShowColumnMapper(false);
      setProcessingStage("Re-parsing PDF with custom column mapping...");

      // Re-parse PDF with custom mapping
      const { extractBankStatementData } = await import("@/lib/bank-statement-ocr");
      const { parseTableRows } = await import("@/lib/bank-statement-ocr");
      const { parseAmountColumns } = await import("@/lib/parsers/pdf-bank-parser");

      // We need to re-parse the rawText with the custom mapping
      // For now, we'll create a simple parser that uses the manual mapping
      const rows = pdfRawText.split("\n").filter((line) => line.trim().length > 0);
      const transactions: ParsedTransaction[] = [];

      for (let i = 1; i < rows.length; i++) {
        // Skip header
        const row = rows[i];
        const cols = row.split(/\s{2,}|\t/).filter((col) => col.trim().length > 0);

        if (
          cols.length <=
          Math.max(
            mapping.dateColumn,
            mapping.descriptionColumn,
            mapping.amountColumn || 0,
            mapping.debitColumn || 0,
            mapping.creditColumn || 0
          )
        ) {
          continue;
        }

        try {
          const dateStr = cols[mapping.dateColumn] || "";
          const description = cols[mapping.descriptionColumn] || "";

          let amount = 0;

          if (mapping.bankFormat === "single-amount" && mapping.amountColumn !== undefined) {
            const amountStr = cols[mapping.amountColumn] || "0";
            // Handle accounting notation (100.00) as negative, preserve existing negative signs
            let cleanedAmount = amountStr.replace(/[$,\s]/g, "");
            if (cleanedAmount.includes("(") && cleanedAmount.includes(")")) {
              cleanedAmount = `-${cleanedAmount.replace(/[()]/g, "")}`;
            }
            amount = parseFloat(cleanedAmount) || 0;
          } else if (
            mapping.bankFormat === "debit-credit" &&
            mapping.debitColumn !== undefined &&
            mapping.creditColumn !== undefined
          ) {
            const debitStr = cols[mapping.debitColumn] || "0";
            const creditStr = cols[mapping.creditColumn] || "0";
            // Parse values - preserve signs and handle accounting notation
            let cleanedDebit = debitStr.replace(/[$,\s]/g, "");
            let cleanedCredit = creditStr.replace(/[$,\s]/g, "");
            if (cleanedDebit.includes("(") && cleanedDebit.includes(")")) {
              cleanedDebit = `-${cleanedDebit.replace(/[()]/g, "")}`;
            }
            if (cleanedCredit.includes("(") && cleanedCredit.includes(")")) {
              cleanedCredit = `-${cleanedCredit.replace(/[()]/g, "")}`;
            }
            const debit = Math.abs(parseFloat(cleanedDebit) || 0);
            const credit = Math.abs(parseFloat(cleanedCredit) || 0);
            // Credit = income (positive), Debit = expense (negative)
            amount = credit > 0 ? credit : -debit;
          }

          const date = new Date(dateStr);
          const isValidDate = !isNaN(date.getTime());

          transactions.push({
            date: isValidDate ? date : new Date(),
            description: description || "Unknown",
            amount,
            isDuplicate: false,
            confidence: isValidDate && description ? 0.9 : 0.7,
            requiresReview: !isValidDate || !description,
          });
        } catch {
          // Skip invalid rows
        }
      }

      // Now continue with the same processing as normal PDF import
      setParsedTransactions(transactions);

      // Detect duplicates
      setProcessingStage(`Detecting duplicates in ${transactions.length} transactions...`);
      const existingTxs = await db.transactions.toArray();

      await detectDuplicatesEnhanced(
        transactions,
        existingTxs,
        false // Don't use smart detection for manual mapping
      );

      // detectDuplicates modifies transactions in place, so we can use them directly
      setParsedTransactions(transactions);

      // Generate summary (calculates duplicates internally)
      const importSummary = generateImportSummary(transactions);
      setSummary(importSummary);

      setStep("preview");
      console.log("[ImportPage] Manual mapping complete:", transactions.length, "transactions");
    } catch (error) {
      console.error("[ImportPage] Error applying manual mapping:", error);
      setError(error instanceof Error ? error.message : "Failed to apply custom mapping");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle AI column mapping application
  const handleApplyAIMapping = async (mapping: ColumnMapping, customBankName?: string) => {
    if (!pendingCSVText) {
      console.error("[ImportPage] No pending CSV data");
      return;
    }

    try {
      setIsProcessing(true);
      setShowAIColumnMapper(false);
      setProcessingStage("Processing CSV with AI-detected column mapping...");

      console.log("[ImportPage] Applying AI column mapping:", mapping);
      console.log("[ImportPage] Custom bank name:", customBankName);

      // Get the skipRows that was detected during header analysis
      const detectedSkipRows = (window as any).__pendingCSVSkipRows || 0;
      console.log(`[ImportPage] Using skipRows=${detectedSkipRows} from detection`);

      // Create a custom bank config from the AI mapping
      const customConfig = {
        name: customBankName || file?.name.replace(/\.csv$/i, "") || "Custom Bank",
        dateColumn: mapping.dateColumn || "",
        descriptionColumn: mapping.descriptionColumn || "",
        amountColumn: mapping.amountColumn || "",
        dateFormat: mapping.dateFormat || "MM/dd/yyyy",
        amountMultiplier: 1,
        hasHeader: true,
        skipRows: detectedSkipRows,
      };

      // Clean up the temporary storage
      delete (window as any).__pendingCSVSkipRows;

      // Parse CSV with the custom mapping
      const rows = parseCSVContent(pendingCSVText, customConfig.skipRows);
      if (rows.length === 0) {
        setError("No data found in CSV file after applying custom mapping.");
        return;
      }

      // Convert to transactions using the custom config
      const transactions = convertToTransactions(rows, customConfig, accountId);
      console.log("[ImportPage] AI mapping complete:", transactions.length, "transactions");

      // Detect duplicates using the same logic as other formats
      setProcessingStage(`Detecting duplicates in ${transactions.length} transactions...`);
      const existingTxs = await db.transactions.toArray();
      console.log("[ImportPage] Existing transactions count:", existingTxs.length);

      // Check if smart duplicate detection is enabled
      const { isSmartDuplicateDetectionEnabled } = await import("@/lib/budget-privacy-settings");
      const useSmartDetection = isSmartDuplicateDetectionEnabled();
      console.log(
        "[ImportPage] Smart duplicate detection:",
        useSmartDetection ? "enabled" : "disabled"
      );

      await detectDuplicatesEnhanced(transactions, existingTxs, useSmartDetection);
      console.log("[ImportPage] Duplicate detection complete");

      // Auto-categorize
      setProcessingStage("Auto-categorizing transactions...");
      transactions.forEach((tx) => {
        const result = categorizeTransaction(tx.description);
        if (result) {
          (tx as any).suggestedCategory = result.category;
          (tx as any).suggestedSubcategory = result.subcategory;
        }
      });

      setParsedTransactions(transactions);

      // Generate summary
      const importSummary = generateImportSummary(transactions);
      setSummary(importSummary);

      setStep("preview");
      console.log("[ImportPage] AI column mapping import complete!");
    } catch (error) {
      console.error("[ImportPage] Error applying AI column mapping:", error);
      setError(error instanceof Error ? error.message : "Failed to apply AI column mapping");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Import Transactions</h1>
          <HelpTooltip
            content={
              <>
                <strong>File Formats:</strong> CSV = Spreadsheet file with columns. OFX/QFX =
                Standardized bank format with account info included. Most banks support both. OFX is
                easier (no bank selection needed).
              </>
            }
            learnMoreUrl="/docs/user-guide#import-formats"
            ariaLabel="More information about CSV and OFX file formats"
            iconSize="h-5 w-5"
          />
        </div>
        <p className="mt-2 text-slate-400">
          Upload CSV, OFX, QFX, or PDF files from BMO, Home Trust, TD, Chase, and 15+ other banks
        </p>
        {formatDetection && file && (
          <div className="mt-3 space-y-1">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className="text-slate-300">Detected Format:</span>
              <span className="text-teal-600">{getFormatDisplayName(formatDetection.format)}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  formatDetection.confidence >= 0.9
                    ? "bg-green-100 text-green-800"
                    : formatDetection.confidence >= 0.7
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {(formatDetection.confidence * 100).toFixed(0)}% confident
              </span>
              {/* PDF-specific badges */}
              {formatDetection.format === "pdf" && pdfPageCount && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                  {pdfPageCount} page{pdfPageCount !== 1 ? "s" : ""}
                </span>
              )}
              {formatDetection.format === "pdf" && pdfOcrConfidence !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    pdfOcrConfidence >= 0.9
                      ? "bg-green-100 text-green-800"
                      : pdfOcrConfidence >= 0.7
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-orange-100 text-orange-800"
                  }`}
                >
                  OCR: {(pdfOcrConfidence * 100).toFixed(0)}%
                </span>
              )}
            </p>
            {formatDetection.suggestions && formatDetection.suggestions.length > 0 && (
              <div className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-gray-600">
                {formatDetection.suggestions.map((suggestion, i) => (
                  <p key={i}>• {suggestion}</p>
                ))}
              </div>
            )}
            {/* PDF warnings */}
            {formatDetection.format === "pdf" && pdfPageCount && pdfPageCount > 10 && (
              <div className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700">
                <p>
                  ⚠️ Large PDF detected ({pdfPageCount} pages). Processing may take longer and use
                  significant memory.
                </p>
                <p className="mt-1">
                  💡 For very large statements, consider requesting a CSV export from your bank for
                  faster processing.
                </p>
              </div>
            )}
            {formatDetection.format === "pdf" &&
              pdfOcrConfidence !== null &&
              pdfOcrConfidence < 0.7 && (
                <div className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700">
                  <p>
                    ⚠️ Low OCR confidence ({(pdfOcrConfidence * 100).toFixed(0)}%). This may be a
                    scanned/image-based PDF.
                  </p>
                  <p className="mt-1">💡 Please carefully review all transactions for accuracy.</p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <h3 className="mb-1 text-sm font-semibold text-red-800">Import Error</h3>
              <pre className="whitespace-pre-wrap rounded bg-red-100 p-2 font-mono text-sm text-red-700">
                {error}
              </pre>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-600 underline hover:text-red-800"
                >
                  Dismiss
                </button>
                {pdfDiagnostics && (
                  <button
                    onClick={exportPDFDebugData}
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    Export Debug Data
                  </button>
                )}
              </div>
              {pdfDiagnostics && (
                <div className="mt-3 rounded bg-gray-50 p-2 text-xs text-gray-600">
                  <p className="mb-1 font-semibold">💡 Troubleshooting tips:</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Check browser console for detailed OCR logs</li>
                    <li>Export debug data (button above) for support</li>
                    <li>Try exporting as CSV instead of PDF from your bank</li>
                    <li>Ensure PDF is text-based (not a scanned image)</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Step */}
      {step === "upload" && (
        <>
          {/* Natural Language Import REMOVED (2025-11-24) - client-side AI calls disabled */}

          {/* Import History Section */}
          <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-md">
            <div className="border-b-2 border-gray-200 bg-gray-50 p-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Imports</h2>
              <p className="mt-2 text-base text-gray-600">
                View your import history and verify successful uploads
              </p>
            </div>

            {importHistory.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {importHistory.map((record) => {
                  const isPartialImport =
                    record.duplicateCount > 0 && record.duplicateCount < record.transactionCount;
                  const isFullSuccess = record.duplicateCount === 0;

                  return (
                    <div key={record.id} className="p-6 transition-colors hover:bg-gray-50">
                      {/* File Info Row */}
                      <div className="mb-3 flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <FileText className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <h3 className="truncate text-lg font-semibold text-gray-900">
                              {record.fileName}
                            </h3>
                            <span className="inline-flex items-center rounded-full border border-teal-300 bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                              {record.fileFormat.toUpperCase()}
                            </span>
                            {isFullSuccess && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                                <Check className="h-3 w-3" />
                                Success
                              </span>
                            )}
                            {isPartialImport && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300 bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                                <AlertCircle className="h-3 w-3" />
                                Partial Import
                              </span>
                            )}
                          </div>

                          {/* Import Date */}
                          <p className="mb-2 text-sm text-gray-600">
                            Imported on{" "}
                            {format(new Date(record.importDate), "MMM d, yyyy 'at' h:mm a")}
                          </p>

                          {/* Stats */}
                          <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-gray-700">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <strong>{record.transactionCount}</strong>{" "}
                              {record.transactionCount === 1 ? "transaction" : "transactions"} added
                            </span>
                            {record.duplicateCount > 0 && (
                              <span className="flex items-center gap-1 text-yellow-700">
                                <AlertCircle className="h-4 w-4" />
                                <strong>{record.duplicateCount}</strong>{" "}
                                {record.duplicateCount === 1 ? "duplicate" : "duplicates"} skipped
                              </span>
                            )}
                          </div>

                          {/* Date Range */}
                          {record.dateRangeStart && record.dateRangeEnd && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Transactions:</span>{" "}
                              {format(new Date(record.dateRangeStart), "MMM d")} -{" "}
                              {format(new Date(record.dateRangeEnd), "MMM d, yyyy")}
                            </p>
                          )}

                          {/* Bank */}
                          {record.bank && (
                            <p className="mt-1 text-sm text-gray-600">
                              <span className="font-medium">Bank:</span> {record.bank}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">No Import History</h3>
                <p className="mt-2 text-base text-gray-600">
                  Your import history will appear here after your first import
                </p>
              </div>
            )}
          </div>

          {/* Account Selection - Always visible for manual override */}
          <div className="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-md">
            <label
              htmlFor="import-account-select"
              className="mb-3 block text-base font-semibold text-gray-700"
            >
              Target Account
            </label>
            <p className="mb-3 text-sm text-gray-600">
              The system will automatically detect the correct account based on the file.
              {accounts.length === 0 && " A new account will be created if none exists."}
              {accounts.length > 0 &&
                " Select manually if you want to override the auto-detection."}
            </p>
            <select
              id="import-account-select"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="min-h-[48px] w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Auto-detect (Recommended)</option>
              {accounts.map((acct) => (
                <option key={acct.id} value={acct.id}>
                  {acct.name} ({acct.institution} - {acct.type})
                </option>
              ))}
            </select>
          </div>

          {/* Bank Selection - Enhanced */}
          {(!formatDetection ||
            formatDetection.format === "csv" ||
            formatDetection.format === "unknown") && (
            <div className="rounded-lg border-l-4 border-teal-500 bg-white p-6 shadow-md">
              <label
                htmlFor="import-bank-select"
                className="mb-3 block text-base font-semibold text-gray-700"
              >
                Select Your Bank (CSV files only)
              </label>
              <select
                id="import-bank-select"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="min-h-[48px] w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                disabled={formatDetection?.format === "ofx" || formatDetection?.format === "qfx"}
              >
                <option value="auto">Auto-detect (Recommended)</option>
                <option value="bmo">BMO (Bank of Montreal)</option>
                <option value="homeTrust">Home Trust</option>
                <option value="td">TD Canada Trust</option>
                <option value="chase">Chase Bank</option>
                <option value="bofa">Bank of America</option>
              </select>
              <div className="mt-3 rounded border-l-4 border-blue-400 bg-blue-50 p-3">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">Tip:</span> OFX/QFX files don't need bank
                  selection - account info is already included in the file
                </p>
              </div>
            </div>
          )}

          {/* File Upload - Enhanced */}
          <div
            data-testid="csv-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed bg-white p-10 shadow-md transition-all ${
              isDragging
                ? "scale-105 border-teal-500 bg-teal-50 shadow-lg"
                : "border-gray-300 hover:border-teal-400 hover:shadow-lg"
            }`}
          >
            <div className="text-center">
              <Upload
                className={`mx-auto mb-6 h-20 w-20 transition-colors ${
                  isDragging ? "text-teal-500" : "text-gray-400"
                }`}
              />
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                {file ? file.name : "Upload Bank Statement"}
              </h2>
              <p className="mb-6 text-base font-medium text-gray-700">
                Drag and drop your CSV, OFX, QFX, or PDF file here, or click to browse
              </p>
              <input
                type="file"
                accept=".csv,.ofx,.qfx,.pdf,.qif,.sta,.mt940,.xml"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                data-testid="csv-file-input"
                aria-label="Upload transaction file"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg bg-teal-700 px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-teal-800 hover:shadow-lg"
              >
                <FileText className="h-6 w-6" />
                Choose File
              </label>

              {file && (
                <div className="mt-6 flex items-center justify-center gap-3 rounded border-l-4 border-green-500 bg-green-50 p-4">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-600" />
                  <span className="text-base font-semibold text-green-800">
                    {file.name} selected
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          {isProcessing && processingStage && (
            <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-6 shadow-md">
              <div className="flex items-center gap-4">
                <svg
                  className="h-8 w-8 animate-spin text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-blue-900">Processing Import</h3>
                  <p className="text-base text-blue-800">{processingStage}</p>
                </div>
              </div>
              {/* Page-by-page progress for PDF */}
              {formatDetection?.format === "pdf" && pdfTotalPages > 0 ? (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-sm text-blue-700">
                    <span>
                      Page {pdfCurrentPage} of {pdfTotalPages}
                    </span>
                    <span>{Math.round((pdfCurrentPage / pdfTotalPages) * 100)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-blue-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${(pdfCurrentPage / pdfTotalPages) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-200">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-600"></div>
                </div>
              )}
            </div>
          )}

          {/* Process Button - Enhanced */}
          {file && (
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={processFile}
                disabled={isProcessing}
                className="min-h-[48px] rounded-lg bg-teal-700 px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-teal-800 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing File...
                  </span>
                ) : (
                  "Process File"
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Preview Step */}
      {step === "preview" && summary && (
        <>
          {/* Summary - Enhanced */}
          <div className="rounded-lg border-l-4 border-teal-500 bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Import Summary</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-base font-medium text-gray-700">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="mb-2 text-base font-medium text-gray-700">New Transactions</p>
                <p className="text-3xl font-bold text-green-600">{summary.new}</p>
                <p className="mt-1 text-xs text-gray-600">Will be imported</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="mb-2 text-base font-medium text-gray-700">Duplicates</p>
                <p className="text-3xl font-bold text-yellow-600">{summary.duplicates}</p>
                <p className="mt-1 text-xs text-gray-600">Will be skipped</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-base font-medium text-gray-700">Date Range</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {summary.dateRange.earliest.toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">to</p>
                <p className="text-sm font-semibold text-gray-900">
                  {summary.dateRange.latest.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6 border-t-2 border-gray-200 pt-6">
              <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                <p className="mb-2 text-base font-semibold text-gray-700">Total Income</p>
                <p className="text-2xl font-bold text-green-600">+${summary.income.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                <p className="mb-2 text-base font-semibold text-gray-700">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">-${summary.expenses.toFixed(2)}</p>
              </div>
            </div>

            {/* Account Assignment Info */}
            <div className="mt-6 border-t-2 border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Importing to Account</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {matchedAccountName || "Unknown"}
                    </p>
                    {accountMatchConfidence >= 0.8 && (
                      <p className="text-xs text-green-600">Auto-detected with high confidence</p>
                    )}
                    {accountMatchConfidence >= 0.5 && accountMatchConfidence < 0.8 && (
                      <p className="text-xs text-yellow-600">Auto-detected - please verify</p>
                    )}
                  </div>
                </div>
                {accounts.length > 1 && (
                  <div>
                    <select
                      value={accountId}
                      onChange={async (e) => {
                        const newAccountId = e.target.value;
                        setAccountId(newAccountId);
                        const account = accounts.find((a) => a.id === newAccountId);
                        setMatchedAccountName(account?.name || "");
                        // Update all transactions with new account ID
                        const updated = parsedTransactions.map((tx) => ({
                          ...tx,
                          accountId: newAccountId,
                        }));
                        setParsedTransactions(updated);
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {accounts.map((acct) => (
                        <option key={acct.id} value={acct.id}>
                          {acct.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Low-Confidence Review Section */}
          {parsedTransactions.some((tx) => tx.requiresReview) && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
              <div className="mb-4 flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-yellow-900">
                    Review Required: Low-Confidence Duplicate Matches
                  </h3>
                  <p className="text-sm text-yellow-800">
                    {parsedTransactions.filter((tx) => tx.requiresReview).length} transaction(s)
                    were flagged as potential duplicates with low confidence. Please review and
                    confirm if they are duplicates.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {parsedTransactions.map((tx, index) => {
                  if (!tx.requiresReview) return null;

                  return (
                    <div key={index} className="rounded-lg border border-yellow-300 bg-white p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {tx.date.toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-600">{tx.description}</span>
                            <span
                              className={`text-sm font-semibold ${
                                tx.amount > 0 ? "text-green-600" : "text-gray-900"
                              }`}
                            >
                              {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                            </span>
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                              {(tx.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          {tx.duplicateReason && (
                            <p className="mb-2 text-xs text-gray-600">
                              <strong>AI Reason:</strong> {tx.duplicateReason}
                            </p>
                          )}
                          {tx.matchedTransactionId && (
                            <button
                              onClick={() =>
                                setExpandedReviewIndex(expandedReviewIndex === index ? null : index)
                              }
                              className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                            >
                              <Eye className="h-3 w-3" />
                              {expandedReviewIndex === index ? "Hide" : "View"} matched transaction
                            </button>
                          )}
                          {expandedReviewIndex === index && tx.matchedTransactionId && (
                            <div className="mt-2 rounded bg-gray-50 p-2 text-xs">
                              {matchedTransactions.has(index) ? (
                                <div className="space-y-1">
                                  <div className="mb-1 font-medium text-gray-900">
                                    Matched Transaction:
                                  </div>
                                  <div className="text-gray-600">
                                    <div>
                                      <strong>Date:</strong>{" "}
                                      {matchedTransactions.get(index)!.date.toLocaleDateString()}
                                    </div>
                                    <div>
                                      <strong>Description:</strong>{" "}
                                      {matchedTransactions.get(index)!.description}
                                    </div>
                                    <div>
                                      <strong>Amount:</strong> $
                                      {Math.abs(matchedTransactions.get(index)!.amount).toFixed(2)}
                                    </div>
                                    {matchedTransactions.get(index)!.category && (
                                      <div>
                                        <strong>Category:</strong>{" "}
                                        {matchedTransactions.get(index)!.category}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-600">
                                  Loading matched transaction details...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleDuplicateStatus(index)}
                            className={`rounded px-3 py-1 text-xs ${
                              tx.isDuplicate
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {tx.isDuplicate ? (
                              <>
                                <Check className="mr-1 inline h-3 w-3" />
                                Mark as New
                              </>
                            ) : (
                              <>
                                <X className="mr-1 inline h-3 w-3" />
                                Mark as Duplicate
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview Table - Enhanced */}
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="border-b-2 border-gray-200 bg-gray-50 p-6">
              <h2 className="text-2xl font-bold text-gray-900">Preview Transactions</h2>
              <p className="mt-2 text-base text-gray-600">
                Review {parsedTransactions.length} transactions before importing •{" "}
                {summary.duplicates} duplicates will be skipped
              </p>
              {/* Enrichment Summary Badge */}
              {enrichmentResult && enrichmentResult.enrichedCount > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-1.5 text-sm text-purple-800">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>
                    <strong>AI Enhanced:</strong> {enrichmentResult.enrichedCount} transactions
                    enriched
                    {enrichmentResult.cacheHitRate && enrichmentResult.cacheHitRate > 0 && (
                      <span className="ml-1 opacity-75">
                        ({(enrichmentResult.cacheHitRate * 100).toFixed(0)}% from cache)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="max-h-[600px] overflow-x-auto overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-100 shadow-sm">
                  <tr className="border-b-2 border-gray-300">
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase text-gray-900">
                      Date
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase text-gray-900">
                      Description
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase text-gray-900">
                      Category
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-bold uppercase text-gray-900">
                      Amount
                    </th>
                    {formatDetection?.format === "pdf" && (
                      <th className="px-4 py-4 text-center text-sm font-bold uppercase text-gray-900">
                        Confidence
                      </th>
                    )}
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase text-gray-900">
                      Status
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parsedTransactions.map((tx, index) => (
                    <tr
                      key={index}
                      className={`transition-colors ${
                        tx.isDuplicate ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-base font-medium text-gray-900">
                        {tx.date.toLocaleDateString()}
                      </td>
                      <td className="max-w-xs px-4 py-4 text-base text-gray-900">
                        <div className="flex flex-col gap-1">
                          {/* Show normalized merchant if available */}
                          {(tx as any).normalizedMerchant ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-purple-700">
                                  {(tx as any).normalizedMerchant}
                                </span>
                                {(tx as any).isLikelyRecurring && (
                                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-700">
                                    ↻ {(tx as any).recurringFrequency}
                                  </span>
                                )}
                              </div>
                              <span className="truncate text-xs text-gray-500">
                                {tx.description}
                              </span>
                            </>
                          ) : (
                            <span className="truncate">{tx.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {(tx as any).suggestedCategory ? (
                          <span className="font-medium text-teal-600">
                            {(tx as any).suggestedCategory}
                            {(tx as any).suggestedSubcategory &&
                              ` • ${(tx as any).suggestedSubcategory}`}
                          </span>
                        ) : (
                          <span className="italic text-gray-500">Uncategorized</span>
                        )}
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-4 text-right text-base font-bold ${
                          tx.amount > 0 ? "text-green-600" : "text-gray-900"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                      </td>
                      {/* PDF OCR Confidence Column */}
                      {formatDetection?.format === "pdf" && (
                        <td className="px-4 py-4 text-center">
                          {tx.confidence !== undefined && tx.confidence > 0 ? (
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`rounded px-2 py-1 text-xs font-bold ${
                                  tx.confidence >= 0.9
                                    ? "bg-green-100 text-green-800"
                                    : tx.confidence >= 0.7
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {(tx.confidence * 100).toFixed(0)}%
                              </span>
                              {tx.confidence < 0.7 && (
                                <span className="text-xs text-orange-600">⚠️ Review</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-4 text-center">
                        {tx.isDuplicate ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-lg border-2 border-yellow-400 bg-yellow-100 px-4 py-2 text-base font-bold text-yellow-900 shadow-sm">
                              <X className="h-5 w-5" />
                              DUPLICATE
                            </span>
                            {tx.confidence < 1.0 && tx.confidence > 0 && (
                              <span className="rounded border border-yellow-300 bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-800">
                                {(tx.confidence * 100).toFixed(0)}% MATCH
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-lg border-2 border-green-400 bg-green-100 px-4 py-2 text-base font-bold text-green-900 shadow-sm">
                            <Check className="h-5 w-5" />
                            NEW
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleDuplicateStatus(index)}
                          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg p-2 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                          title={tx.isDuplicate ? "Mark as new transaction" : "Mark as duplicate"}
                          aria-label={
                            tx.isDuplicate ? "Mark as new transaction" : "Mark as duplicate"
                          }
                        >
                          {tx.isDuplicate ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedTransactions.length > 100 && (
                <div className="border-t-2 border-gray-200 bg-gray-50 py-4 text-center">
                  <p className="text-base font-medium text-gray-600">
                    Showing all {parsedTransactions.length} transactions • Scroll to view more
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions - Enhanced */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <button
              onClick={reset}
              className="min-h-[48px] rounded-lg border-2 border-gray-300 px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow"
            >
              Cancel Import
            </button>
            <button
              onClick={importTransactions}
              disabled={isProcessing || summary.new === 0}
              className="min-h-[48px] rounded-lg bg-teal-700 px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-teal-800 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Importing Transactions...
                </span>
              ) : (
                `Import ${summary.new} New Transaction${summary.new !== 1 ? "s" : ""}`
              )}
            </button>
          </div>
        </>
      )}

      {/* Complete Step */}
      {step === "complete" && summary && (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Import Complete!</h2>
          <p className="mb-8 text-gray-600">Successfully imported {summary.new} transactions</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={reset}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Import More
            </button>
            <button
              onClick={() => void router.push("/budget-app/transactions")}
              className="rounded-lg bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700"
            >
              View Transactions
            </button>
          </div>
        </div>
      )}

      {/* Manual Column Mapping Modal */}
      <ColumnMapperModal
        isOpen={showColumnMapper}
        onClose={() => {
          setShowColumnMapper(false);
          setPendingPdfFile(null);
          setIsProcessing(false);
        }}
        onApplyMapping={handleApplyManualMapping}
        rawRows={pdfRawRows}
        bankName={file?.name || "Unknown Bank"}
      />

      {/* AI Column Mapping Modal (for unknown CSV banks) */}
      <AIColumnMapperModal
        isOpen={showAIColumnMapper}
        onClose={() => {
          setShowAIColumnMapper(false);
          setPendingCSVText("");
          setPendingCSVHeaders([]);
          setPendingCSVRows([]);
          setIsProcessing(false);
        }}
        onApplyMapping={handleApplyAIMapping}
        headers={pendingCSVHeaders}
        sampleRows={pendingCSVRows}
        fileName={file?.name || "unknown.csv"}
      />

      {/* Error Recovery Modal (AI-powered import error recovery) */}
      <ErrorRecoveryModal
        isOpen={showErrorRecovery}
        onClose={() => {
          setShowErrorRecovery(false);
          setErrorAnalysis(null);
          setPendingErrorFile(null);
          setPendingErrorText("");
          setIsFixingError(false);
        }}
        errorAnalysis={errorAnalysis}
        onAutoFix={handleAutoFix}
        onManualAction={handleManualAction}
        isFixing={isFixingError}
      />

      {/* Validation Warnings Modal (AI-powered transaction validation) */}
      <ValidationWarningsModal
        isOpen={showValidationWarnings}
        onClose={() => {
          setShowValidationWarnings(false);
          setValidationResult(null);
          setPendingValidatedTransactions([]);
        }}
        validationResult={validationResult}
        onProceed={handleValidationProceed}
        onCancel={handleValidationCancel}
      />

      {/* Balance Reconciliation Modal (post-import balance setup) */}
      <BalanceReconciliationModal
        open={showBalanceReconciliation}
        onOpenChange={setShowBalanceReconciliation}
        accountId={importedAccountId}
        accountName={importedAccountName}
        accountType={importedAccountType}
        transactionNetChange={importedNetChange}
        transactionCount={importedTransactionCount}
        dateRangeStart={importedDateRange?.start}
        dateRangeEnd={importedDateRange?.end}
        onComplete={handleBalanceReconciliationComplete}
        onSkip={handleBalanceReconciliationSkip}
      />
    </div>
  );
}
