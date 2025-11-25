'use client';

/**
 * Transaction Import Page
 * Upload and import bank statements in CSV, OFX, or QFX format
 * Supports 15+ banks including BMO, Home Trust, TD, Chase, Bank of America
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Eye, X, Check } from 'lucide-react';
import { db, saveImportMetadata, getImportHistory } from '@/lib/budget-db';
import {
  parseCSVContent,
  detectBank,
  BANK_CONFIGS,
  convertToTransactions,
  generateImportSummary,
  type ImportSummary,
} from '@/lib/parsers/csv-parser';
import {
  extractTransactionSamples,
} from '@/lib/ai/smart-bank-detection';
import {
  parseOFXFile,
  validateOFXFile,
  detectOFXVariant,
} from '@/lib/parsers/ofx-parser';
import {
  detectFileFormat,
  getFormatDisplayName,
  isFormatSupported,
  type FormatDetectionResult,
  type FileFormat,
} from '@/lib/parsers/format-detector';
import { categorizeTransaction } from '@/lib/categorization/rules';
// Natural Language Import DEPRECATED (2025-11-24)
// Disabled due to connection errors and low value - client-side AI calls are insecure
// import { parseImportIntent, autoConfigureImport, isNaturalLanguageImportEnabled } from '@/lib/ai/natural-language-import';
import type { ParsedTransaction, Transaction, ImportMetadata } from '@/types/budget';
import { format } from 'date-fns';
import { HelpTooltip } from '@/components/budget/HelpTooltip';
import ColumnMapperModal, { type ManualColumnMapping } from '@/components/budget/ColumnMapperModal';
import AIColumnMapperModal from '@/components/budget/AIColumnMapperModal';
import type { ColumnMapping } from '@/lib/ai/smart-column-mapper';
import { analyzeColumnsWithAI } from '@/lib/ai/smart-column-mapper';
import ErrorRecoveryModal from '@/components/budget/ErrorRecoveryModal';
import type { ErrorAnalysisResult, RecoverySuggestion } from '@/lib/ai/smart-error-recovery';
// analyzeErrorWithAI removed - now using server-side API route
import { autoFixEncoding, autoFixCSVSkipRows } from '@/lib/ai/smart-error-recovery';
import ValidationWarningsModal from '@/components/budget/ValidationWarningsModal';
import type { ValidationResult } from '@/lib/ai/smart-transaction-validator';
import { validateTransactions } from '@/lib/ai/smart-transaction-validator';
import type { EnrichedTransaction, EnrichmentResult } from '@/lib/ai/smart-transaction-enrichment';
import { enrichTransactions } from '@/lib/ai/smart-transaction-enrichment';
import { detectDuplicatesEnhanced } from '@/lib/ai/smart-duplicate-detection';
import { learnFromImport } from '@/lib/collective-learning-service';

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [formatDetection, setFormatDetection] = useState<FormatDetectionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('auto');
  const [accountId, setAccountId] = useState('default-account');
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [expandedReviewIndex, setExpandedReviewIndex] = useState<number | null>(null);
  const [matchedTransactions, setMatchedTransactions] = useState<Map<number, Transaction>>(new Map());
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
  const [pdfRawText, setPdfRawText] = useState<string>('');
  const [pdfRawRows, setPdfRawRows] = useState<string[]>([]);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const [pdfDiagnostics, setPdfDiagnostics] = useState<any>(null);

  // AI column mapping state (for unknown CSV banks)
  const [showAIColumnMapper, setShowAIColumnMapper] = useState(false);
  const [pendingCSVText, setPendingCSVText] = useState<string>('');
  const [pendingCSVHeaders, setPendingCSVHeaders] = useState<string[]>([]);
  const [pendingCSVRows, setPendingCSVRows] = useState<any[]>([]);

  // Error recovery state
  const [showErrorRecovery, setShowErrorRecovery] = useState(false);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysisResult | null>(null);
  const [isFixingError, setIsFixingError] = useState(false);
  const [pendingErrorFile, setPendingErrorFile] = useState<File | null>(null);
  const [pendingErrorText, setPendingErrorText] = useState<string>('');

  // Transaction validation state
  const [showValidationWarnings, setShowValidationWarnings] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [pendingValidatedTransactions, setPendingValidatedTransactions] = useState<ParsedTransaction[]>([]);

  // Transaction enrichment state
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState<string>('');
  const [enrichmentResult, setEnrichmentResult] = useState<EnrichmentResult | null>(null);

  console.log('[ImportPage] Component mounted');

  // Natural Language Import DISABLED (2025-11-24)
  // useEffect(() => {
  //   setIsNLEnabled(isNaturalLanguageImportEnabled());
  // }, []);

  // Load import history on mount
  useEffect(() => {
    loadImportHistoryData();
  }, []);

  async function loadImportHistoryData() {
    try {
      const history = await getImportHistory(5); // Last 5 imports
      setImportHistory(history);
      console.log('[ImportPage] Loaded import history:', history.length, 'records');
    } catch (error) {
      console.error('[ImportPage] Error loading import history:', error);
    }
  }

  // Load matched transaction when expanded
  useEffect(() => {
    if (expandedReviewIndex !== null) {
      const tx = parsedTransactions[expandedReviewIndex];
      if (tx?.matchedTransactionId && !matchedTransactions.has(expandedReviewIndex)) {
        getMatchedTransaction(tx.matchedTransactionId).then(matched => {
          if (matched) {
            setMatchedTransactions(prev => new Map(prev).set(expandedReviewIndex!, matched));
          }
        });
      }
    }
  }, [expandedReviewIndex, parsedTransactions, matchedTransactions]);

  // Detect file format using content analysis
  async function detectFormat(file: File): Promise<void> {
    try {
      console.log('[ImportPage] Detecting format for:', file.name);
      const detection = await detectFileFormat(file);
      console.log('[ImportPage] Format detected:', detection);
      setFormatDetection(detection);

      // Show warnings if confidence is low or format is unsupported
      if (!isFormatSupported(detection.format)) {
        setError(`Unsupported file format: ${getFormatDisplayName(detection.format)}`);
      } else if (detection.confidence < 0.5) {
        setError(`Low confidence format detection. ${detection.suggestions?.join(' ')}`);
      }
    } catch (error) {
      console.error('[ImportPage] Format detection error:', error);
      setError('Unable to detect file format. Please try a different file.');
      setFormatDetection(null);
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
    console.log('[ImportPage] AI-powered bank detection starting...');
    setProcessingStage('Analyzing bank format with AI...');

    // Try different skipRows levels (0, 1, 2, 3) to find valid headers
    for (let skipRows = 0; skipRows <= 3; skipRows++) {
      try {
        const rows = parseCSVContent(text, skipRows);
        if (rows.length > 0) {
          const headers = Object.keys(rows[0]);

          // Extract transaction samples for AI analysis
          const samples = extractTransactionSamples(rows, headers[1] || headers[0]);

          // Call server-side API for AI-powered detection (avoids CORS!)
          const response = await fetch('/api/bank/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              headers,
              transactionSamples: samples,
              useAI: true,
              learnFormat: true, // Enable collective learning
            }),
          });

          if (!response.ok) {
            throw new Error(`Bank detection API error: ${response.status}`);
          }

          const result = await response.json();

          console.log('[ImportPage] AI detection result:', result);

          // Accept any detection that returned a bankKey (even low confidence)
          // Low confidence just means we detected a format but aren't certain
          if (result.success && result.bankKey) {
            const confidenceLabel = result.confidence >= 0.7 ? '✓' : '⚠️';
            setProcessingStage(
              `${confidenceLabel} Detected ${result.bankName} (${(result.confidence * 100).toFixed(0)}% confidence)`
            );
            return result.bankKey;
          }

          // If AI detection failed completely, try fallback header detection
          const headerDetected = detectBank(headers);
          if (headerDetected) {
            console.log('[ImportPage] Fallback header detection:', headerDetected);
            return headerDetected;
          }
        }
      } catch (error) {
        console.error('[ImportPage] Detection error at skipRows', skipRows, error);
        // Continue trying other skip levels
      }
    }
    return null;
  }

  async function processFile() {
    if (!file || !formatDetection) return;

    console.log('[ImportPage] Processing file:', file.name, 'Format:', formatDetection.format);
    setIsProcessing(true);
    setError(null);
    setProcessingStage('Validating file format...');

    try {
      // Check if format is supported
      if (!isFormatSupported(formatDetection.format)) {
        const errorMsg = `Unsupported format: ${getFormatDisplayName(formatDetection.format)}`;
        setError(errorMsg);
        return;
      }

      // Read file content
      console.log('[ImportPage] Reading file content...');
      setProcessingStage('Reading file content...');
      const text = await file.text();
      console.log('[ImportPage] File content length:', text.length);

      let transactions: ParsedTransaction[] = [];

      // ========================================
      // OFX/QFX Processing
      // ========================================
      if (formatDetection.format === 'ofx' || formatDetection.format === 'qfx') {
        console.log('[ImportPage] Processing OFX/QFX file...');
        setProcessingStage('Parsing OFX/QFX file...');

        // Validate OFX format
        const validation = validateOFXFile(text);
        if (!validation.isValid) {
          const errorMsg = `Invalid OFX file:\n${validation.errors.join('\n')}`;
          setError(errorMsg);
          return;
        }

        // Parse OFX file
        const ofxResult = await parseOFXFile(text, accountId);
        transactions = ofxResult.transactions;

        console.log('[ImportPage] OFX parsing complete');
        console.log('[ImportPage] Account:', ofxResult.accountInfo.ACCTID);
        console.log('[ImportPage] Currency:', ofxResult.metadata.currency);
        console.log('[ImportPage] Balance:', ofxResult.balances.ledgerBalance);
        console.log('[ImportPage] Transactions:', transactions.length);
      }

      // ========================================
      // CSV Processing
      // ========================================
      else if (formatDetection.format === 'csv') {
        console.log('[ImportPage] Processing CSV file...');
        setProcessingStage('Parsing CSV file...');

        // Detect bank if auto
        let bankKey = selectedBank;
        if (selectedBank === 'auto') {
          console.log('[ImportPage] Auto-detecting bank format...');
          setProcessingStage('Auto-detecting bank format...');
          const detected = await detectBankFromContent(text);
          console.log('[ImportPage] Detected bank:', detected);

          if (!detected) {
            // Bank detection failed - trigger AI Column Mapping Wizard
            console.log('[ImportPage] Bank detection failed, triggering AI Column Mapping Wizard...');
            setProcessingStage('⚠️ Unknown bank format - launching AI Column Mapper...');

            // Parse CSV to get headers and sample rows
            const rows = parseCSVContent(text, 0);
            if (rows.length > 0) {
              const headers = Object.keys(rows[0]);
              const sampleRows = rows.slice(0, 10); // First 10 rows for AI analysis

              // Store pending CSV data
              setPendingCSVText(text);
              setPendingCSVHeaders(headers);
              setPendingCSVRows(sampleRows);

              // Show AI Column Mapper Modal
              setShowAIColumnMapper(true);
              setIsProcessing(false);

              // Don't continue processing - wait for user to map columns
              return;
            } else {
              const errorMsg = 'Could not parse CSV file. Please check the file format.';
              setError(errorMsg);
              return;
            }
          }
          bankKey = detected;
        }
        console.log('[ImportPage] Using bank config:', bankKey);

        const bankConfig = BANK_CONFIGS[bankKey];
        if (!bankConfig) {
          setError('Invalid bank configuration. Please try selecting a different bank.');
          return;
        }

        // Parse CSV with the correct skipRows
        const rows = parseCSVContent(text, bankConfig.skipRows || 0);
        if (rows.length === 0) {
          setError('No data found in CSV file. The file may be empty or incorrectly formatted.');
          return;
        }

        // Convert to transactions
        transactions = convertToTransactions(rows, bankConfig, accountId);
        console.log('[ImportPage] CSV parsing complete');
      }

      // ========================================
      // PDF Bank Statement Processing
      // ========================================
      else if (formatDetection.format === 'pdf') {
        console.log('[ImportPage] Processing PDF bank statement...');
        setProcessingStage('Extracting transactions from PDF (OCR)...');

        const { extractBankStatementData } = await import('@/lib/bank-statement-ocr');

        const result = await extractBankStatementData(file, accountId, (current, total) => {
          setPdfCurrentPage(current);
          setPdfTotalPages(total);
          setProcessingStage(`Processing page ${current}/${total}...`);
        });

        // Handle OCR errors
        if (result.errors.length > 0) {
          console.error('[ImportPage] OCR errors:', result.errors);
          setError(`PDF OCR failed: ${result.errors.join(', ')}`);
          return;
        }

        // Display warnings to user
        if (result.warnings.length > 0) {
          console.warn('[ImportPage] OCR warnings:', result.warnings);
          // Show warnings in UI (will be added to setError or separate warning state)
          const warningMessage = result.warnings.join('\n');
          console.warn('[ImportPage] User-facing warnings:\n', warningMessage);
        }

        // Log detailed diagnostics
        console.log('[ImportPage] PDF OCR Diagnostics:', {
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
        const rows = result.rawText.split('\n').filter(line => line.trim().length > 0).slice(0, 20); // First 20 rows
        setPdfRawRows(rows);

        // Check if NO transactions were extracted (critical failure)
        if (result.transactions.length === 0) {
          console.error('[ImportPage] No transactions extracted from PDF');
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
          const parseSuccessRate = Math.round((result.diagnostics.transactionsParsed / result.diagnostics.transactionGroupsFormed) * 100);
          console.warn(`[ImportPage] Low parse success rate: ${parseSuccessRate}% (${result.transactions.length}/${result.diagnostics.transactionGroupsFormed} groups)`);

          // Show warning but allow user to continue
          setProcessingStage(
            `⚠️ Low extraction rate: ${result.transactions.length} of ~${result.diagnostics.transactionGroupsFormed} expected transactions (${parseSuccessRate}%). Review transactions carefully.`
          );
        }

        // Check if manual mapping is needed (confidence <70%)
        if (result.averageConfidence < 0.7) {
          console.warn('[ImportPage] Low OCR confidence:', result.averageConfidence);
          setProcessingStage(`⚠️ Low OCR confidence (${(result.averageConfidence * 100).toFixed(0)}%) - manual column mapping recommended`);

          // Store pending file and show manual mapping modal
          setPendingPdfFile(file);
          setShowColumnMapper(true);
          setIsProcessing(false);

          // Don't continue processing - wait for user to map columns
          return;
        }

        transactions = result.transactions;

        console.log('[ImportPage] PDF processing complete:', transactions.length, 'transactions');
        console.log('[ImportPage] Pages processed:', result.pagesProcessed);
        console.log('[ImportPage] Average confidence:', result.averageConfidence);
        console.log('[ImportPage] Parse success rate:', result.diagnostics.transactionGroupsFormed > 0
          ? `${Math.round((result.diagnostics.transactionsParsed / result.diagnostics.transactionGroupsFormed) * 100)}%`
          : 'N/A');
      } else {
        setError(`Unsupported file format: ${formatDetection.format}. Please use CSV, OFX, QFX, or PDF files.`);
        return;
      }

      // ========================================
      // Common Processing (Both Formats)
      // ========================================

      // Detect duplicates using FITID (perfect for OFX) or fuzzy matching (CSV)
      // Optionally use smart detection with Claude API if enabled
      console.log('[ImportPage] Checking for duplicates...');
      setProcessingStage(`Detecting duplicates in ${transactions.length} transactions...`);
      const existingTxs = await db.transactions.toArray();
      console.log('[ImportPage] Existing transactions count:', existingTxs.length);

      // Check if smart duplicate detection is enabled
      const { isSmartDuplicateDetectionEnabled } = await import('@/lib/budget-privacy-settings');
      const useSmartDetection = isSmartDuplicateDetectionEnabled();
      console.log('[ImportPage] Smart duplicate detection:', useSmartDetection ? 'enabled' : 'disabled');

      await detectDuplicatesEnhanced(transactions, existingTxs, useSmartDetection);
      console.log('[ImportPage] Duplicate detection complete');

      // Transaction validation (check for anomalies, errors)
      setProcessingStage('Validating transactions...');
      const { isAIFeaturesEnabled } = await import('@/lib/budget-privacy-settings');
      const useAIValidation = isAIFeaturesEnabled();
      console.log('[ImportPage] AI validation:', useAIValidation ? 'enabled' : 'disabled');

      const validation = await validateTransactions(transactions, useAIValidation);
      console.log('[ImportPage] Validation complete:', validation.issues.length, 'issues found');

      // If validation finds critical or warning issues, show modal
      if (validation.hasIssues && (validation.criticalCount > 0 || validation.warningCount > 0)) {
        console.log(
          '[ImportPage] Validation issues found, showing warnings modal:',
          validation.criticalCount,
          'critical,',
          validation.warningCount,
          'warnings'
        );

        // Store transactions and validation result
        setPendingValidatedTransactions(transactions);
        setValidationResult(validation);
        setShowValidationWarnings(true);
        setIsProcessing(false);

        // Don't continue processing - wait for user to review validation issues
        return;
      }

      // Transaction enrichment (merchant normalization, enhanced categories, recurring detection)
      setProcessingStage('Enriching transactions...');
      setIsEnriching(true);
      const useAIEnrichment = isAIFeaturesEnabled();
      console.log('[ImportPage] AI enrichment:', useAIEnrichment ? 'enabled' : 'disabled');

      const { enriched, result: enrichmentRes } = await enrichTransactions(
        transactions,
        useAIEnrichment
      );
      console.log(
        '[ImportPage] Enrichment complete:',
        enrichmentRes.enrichedCount,
        '/',
        enrichmentRes.totalCount,
        'transactions enriched'
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

      console.log('[ImportPage] Setting parsed transactions:', enrichedParsed.length);
      setParsedTransactions(enrichedParsed);
      setSummary(generateImportSummary(enrichedParsed));
      setStep('preview');
      console.log('[ImportPage] Processing complete, moving to preview step');
    } catch (error) {
      console.error('[ImportPage] ERROR processing file:', error);
      const errorMsg = error instanceof Error
        ? `Error: ${error.message}\n\nStack: ${error.stack}`
        : 'Error processing file. Please check the format and try again.';
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
      return await db.transactions.get(txId) || null;
    } catch {
      return null;
    }
  }

  async function importTransactions() {
    console.log('[ImportPage] Starting import...');
    setIsProcessing(true);
    setError(null);

    try {
      const newTransactions = parsedTransactions.filter((tx) => !tx.isDuplicate);
      console.log('[ImportPage] Importing', newTransactions.length, 'new transactions');

      // Convert to Transaction objects
      const transactions: Transaction[] = newTransactions.map((tx, index) => ({
        id: `tx_${Date.now()}_${index}`,
        accountId,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        category: (tx as any).suggestedCategory || null,
        subcategory: (tx as any).suggestedSubcategory || null,
        notes: '',
        isRecurring: false,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Save to database
      console.log('[ImportPage] Saving to IndexedDB...');
      await db.transactions.bulkAdd(transactions);
      console.log('[ImportPage] Save complete');

      // Save import metadata for audit trail
      const duplicateCount = parsedTransactions.filter((tx) => tx.isDuplicate).length;
      const transactionDates = newTransactions.map((tx) => tx.date);
      const dateRangeStart = transactionDates.length > 0
        ? new Date(Math.min(...transactionDates.map((d) => d.getTime())))
        : null;
      const dateRangeEnd = transactionDates.length > 0
        ? new Date(Math.max(...transactionDates.map((d) => d.getTime())))
        : null;

      try {
        // Ensure fileFormat is one of the supported types
        const detectedFormat = formatDetection?.format || 'csv';
        const fileFormat: 'csv' | 'ofx' | 'qfx' =
          detectedFormat === 'csv' || detectedFormat === 'ofx' || detectedFormat === 'qfx'
            ? detectedFormat
            : 'csv'; // Default to csv for unknown formats

        await saveImportMetadata({
          fileName: file?.name || 'unknown',
          fileFormat,
          bank: (formatDetection as any)?.bankName || undefined,
          importDate: new Date(),
          transactionCount: newTransactions.length,
          duplicateCount,
          dateRangeStart,
          dateRangeEnd,
        });
        console.log('[ImportPage] Import metadata saved');

        // Refresh import history display
        await loadImportHistoryData();
      } catch (metaError) {
        console.error('[ImportPage] Error saving import metadata:', metaError);
        // Non-fatal error - don't block import completion
      }

      // Learn from this import (contribute to collective intelligence)
      try {
        const bankName = (formatDetection as any)?.bankName;
        const bankSlug = bankName?.toLowerCase().replace(/\s+/g, '-');
        const columnMappings = (formatDetection as any)?.columnMappings;

        await learnFromImport(
          parsedTransactions,
          accountId, // Use accountId as userId for privacy
          bankName,
          bankSlug,
          columnMappings
        );
        console.log('[ImportPage] Collective learning complete');
      } catch (learningError) {
        console.error('[ImportPage] Error learning from import:', learningError);
        // Non-fatal error - don't block import completion
      }

      setStep('complete');
      console.log('[ImportPage] Import complete!');
    } catch (error) {
      console.error('[ImportPage] ERROR importing:', error);
      const errorMsg = error instanceof Error
        ? error.message
        : 'Error importing transactions. Please try again.';

      // Trigger AI-powered error recovery
      await handleImportError(errorMsg, error instanceof Error ? error : null);
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle import errors with AI-powered recovery
  async function handleImportError(errorMessage: string, error: Error | null) {
    console.log('[ImportPage] Analyzing error for recovery options...');
    setError(errorMessage);

    // Don't show recovery modal if processing is cancelled by user
    if (errorMessage.includes('cancelled') || errorMessage.includes('closed')) {
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
            name: 'unknown',
            size: 0,
            type: 'unknown',
          };

      // Get file sample for AI analysis (first 500 chars)
      let fileSample: string | undefined;
      if (file) {
        try {
          const text = await file.text();
          fileSample = text.slice(0, 500);
          setPendingErrorText(text);
        } catch (e) {
          console.error('[ImportPage] Could not read file for error analysis:', e);
        }
      }

      // Call server-side API for error analysis (secure, no exposed API key)
      const response = await fetch('/api/import/analyze-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        console.warn('[ImportPage] Error analysis API returned error:', data.error);
        // Fall back to showing basic error without suggestions
        return;
      }

      // Convert API response to ErrorAnalysisResult format
      const analysis: ErrorAnalysisResult = {
        category: data.category || 'unknown',
        severity: data.severity || 'medium',
        canRecover: data.canRecover ?? false,
        suggestions: data.suggestions || [],
        aiAnalysis: data.aiAnalysis,
        detectedIssues: data.detectedIssues || [errorMessage],
      };

      console.log('[ImportPage] Error analysis complete:', analysis);

      // Store analysis and show recovery modal
      setErrorAnalysis(analysis);
      setPendingErrorFile(file);
      setShowErrorRecovery(true);
    } catch (analysisError) {
      console.error('[ImportPage] Error analysis failed:', analysisError);
      // Fall back to standard error display
    }
  }

  // Export PDF debug data for troubleshooting
  function exportPDFDebugData() {
    if (!pdfDiagnostics || !pdfRawText) {
      console.error('[ImportPage] No PDF diagnostics data to export');
      return;
    }

    const debugData = {
      timestamp: new Date().toISOString(),
      fileName: file?.name || 'unknown',
      fileSize: file?.size || 0,
      diagnostics: pdfDiagnostics,
      rawOCRText: pdfRawText,
      consoleHint: 'Check browser console for detailed OCR logs with [PDF OCR] and [parseTableRows] prefixes',
    };

    const jsonStr = JSON.stringify(debugData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pdf-ocr-debug-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('[ImportPage] PDF debug data exported');
  }

  // Handle auto-fix suggestion from error recovery
  async function handleAutoFix(suggestion: RecoverySuggestion) {
    if (!pendingErrorFile) {
      console.error('[ImportPage] No pending error file');
      return;
    }

    setIsFixingError(true);
    console.log('[ImportPage] Attempting auto-fix:', suggestion.title);

    try {
      // Handle different auto-fix types
      if (suggestion.title.toLowerCase().includes('encoding')) {
        // Auto-fix encoding issues
        const result = await autoFixEncoding(pendingErrorFile);
        if (result.success && result.text) {
          console.log('[ImportPage] Encoding auto-fix successful:', result.encoding);
          // Create a new File object with the fixed text
          const blob = new Blob([result.text], { type: 'text/plain; charset=utf-8' });
          const fixedFile = new File([blob], pendingErrorFile.name, {
            type: 'text/csv',
          });
          setFile(fixedFile);
          setShowErrorRecovery(false);
          setError(null);
          // Auto-trigger processing with fixed file
          setTimeout(() => processFile(), 500);
        } else {
          setError(result.error || 'Auto-fix failed');
        }
      } else if (suggestion.title.toLowerCase().includes('skip') && suggestion.title.toLowerCase().includes('row')) {
        // Auto-fix skip rows
        if (pendingErrorText) {
          const result = autoFixCSVSkipRows(pendingErrorText, parseCSVContent);
          if (result.success && result.rows) {
            console.log('[ImportPage] Skip rows auto-fix successful:', result.skipRows);
            // We have valid rows now, but need to update the bank config skipRows
            // For now, trigger re-import with detected skipRows
            setShowErrorRecovery(false);
            setError(null);
            // Would need to pass skipRows to processFile here
            setTimeout(() => processFile(), 500);
          } else {
            setError(result.error || 'Auto-fix failed');
          }
        }
      } else {
        // Generic auto-fix - just retry the import
        console.log('[ImportPage] Retrying import after auto-fix');
        setShowErrorRecovery(false);
        setError(null);
        setTimeout(() => processFile(), 500);
      }
    } catch (error) {
      console.error('[ImportPage] Auto-fix error:', error);
      setError(error instanceof Error ? error.message : 'Auto-fix failed');
    } finally {
      setIsFixingError(false);
    }
  }

  // Handle manual action suggestion from error recovery
  function handleManualAction(suggestion: RecoverySuggestion) {
    console.log('[ImportPage] Manual action:', suggestion.title);
    setShowErrorRecovery(false);

    // Handle different manual action types
    if (suggestion.title.toLowerCase().includes('column map')) {
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
    } else if (suggestion.title.toLowerCase().includes('bank manual')) {
      // User should select bank manually (error message already shown)
      // Keep the error visible
    } else {
      // For other manual actions, keep the error visible with suggestion
      setError(`${error || 'Import failed'}\n\nSuggestion: ${suggestion.description}`);
    }
  }

  // Handle validation proceed (user reviewed warnings and wants to continue)
  function handleValidationProceed(transactionsToRemove: number[]) {
    console.log('[ImportPage] Validation proceed with', transactionsToRemove.length, 'removals');

    // Get the transactions that were validated
    let transactions = [...pendingValidatedTransactions];

    // Remove flagged transactions (sort indices descending to avoid index shift issues)
    if (transactionsToRemove.length > 0) {
      const sortedIndices = [...transactionsToRemove].sort((a, b) => b - a);
      sortedIndices.forEach((index) => {
        transactions.splice(index, 1);
      });
      console.log(
        '[ImportPage] Removed',
        transactionsToRemove.length,
        'transactions, continuing with',
        transactions.length
      );
    }

    // Close validation modal
    setShowValidationWarnings(false);
    setValidationResult(null);
    setPendingValidatedTransactions([]);

    // If no transactions left, show error
    if (transactions.length === 0) {
      setError('All transactions were removed during validation. Please try importing a different file.');
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
    setStep('preview');
    setError(null);
    setIsProcessing(false);
  }

  // Handle validation cancel (user wants to abort import)
  function handleValidationCancel() {
    console.log('[ImportPage] Validation cancelled by user');
    setShowValidationWarnings(false);
    setValidationResult(null);
    setPendingValidatedTransactions([]);
    setError('Import cancelled due to validation issues. Please review your file and try again.');
    setIsProcessing(false);
  }

  function reset() {
    setFile(null);
    setFormatDetection(null);
    setParsedTransactions([]);
    setSummary(null);
    setStep('upload');
    setSelectedBank('auto');
    setError(null);
    // Reset PDF-specific state
    setPdfPageCount(null);
    setPdfOcrConfidence(null);
    setPdfCurrentPage(0);
    setPdfTotalPages(0);
    // Reset manual mapping state
    setShowColumnMapper(false);
    setPdfRawText('');
    setPdfRawRows([]);
    setPendingPdfFile(null);
    // Reset AI column mapping state
    setShowAIColumnMapper(false);
    setPendingCSVText('');
    setPendingCSVHeaders([]);
    setPendingCSVRows([]);
    // Reset error recovery state
    setShowErrorRecovery(false);
    setErrorAnalysis(null);
    setPendingErrorFile(null);
    setPendingErrorText('');
    setIsFixingError(false);
    // Reset validation state
    setShowValidationWarnings(false);
    setValidationResult(null);
    setPendingValidatedTransactions([]);
    // Reset enrichment state
    setIsEnriching(false);
    setEnrichmentProgress('');
    setEnrichmentResult(null);
  }

  // Handle manual column mapping application
  const handleApplyManualMapping = async (mapping: ManualColumnMapping) => {
    if (!pendingPdfFile) {
      console.error('[ImportPage] No pending PDF file');
      return;
    }

    try {
      setIsProcessing(true);
      setShowColumnMapper(false);
      setProcessingStage('Re-parsing PDF with custom column mapping...');

      // Re-parse PDF with custom mapping
      const { extractBankStatementData } = await import('@/lib/bank-statement-ocr');
      const { parseTableRows } = await import('@/lib/bank-statement-ocr');
      const { parseAmountColumns } = await import('@/lib/parsers/pdf-bank-parser');

      // We need to re-parse the rawText with the custom mapping
      // For now, we'll create a simple parser that uses the manual mapping
      const rows = pdfRawText.split('\n').filter(line => line.trim().length > 0);
      const transactions: ParsedTransaction[] = [];

      for (let i = 1; i < rows.length; i++) { // Skip header
        const row = rows[i];
        const cols = row.split(/\s{2,}|\t/).filter(col => col.trim().length > 0);

        if (cols.length <= Math.max(mapping.dateColumn, mapping.descriptionColumn, mapping.amountColumn || 0, mapping.debitColumn || 0, mapping.creditColumn || 0)) {
          continue;
        }

        try {
          const dateStr = cols[mapping.dateColumn] || '';
          const description = cols[mapping.descriptionColumn] || '';

          let amount = 0;

          if (mapping.bankFormat === 'single-amount' && mapping.amountColumn !== undefined) {
            const amountStr = cols[mapping.amountColumn] || '0';
            amount = parseFloat(amountStr.replace(/[^0-9.-]/g, '')) || 0;
          } else if (mapping.bankFormat === 'debit-credit' && mapping.debitColumn !== undefined && mapping.creditColumn !== undefined) {
            const debitStr = cols[mapping.debitColumn] || '0';
            const creditStr = cols[mapping.creditColumn] || '0';
            const debit = parseFloat(debitStr.replace(/[^0-9.]/g, '')) || 0;
            const credit = parseFloat(creditStr.replace(/[^0-9.]/g, '')) || 0;
            amount = credit > 0 ? credit : -debit;
          }

          const date = new Date(dateStr);
          const isValidDate = !isNaN(date.getTime());

          transactions.push({
            date: isValidDate ? date : new Date(),
            description: description || 'Unknown',
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

      setStep('preview');
      console.log('[ImportPage] Manual mapping complete:', transactions.length, 'transactions');
    } catch (error) {
      console.error('[ImportPage] Error applying manual mapping:', error);
      setError(error instanceof Error ? error.message : 'Failed to apply custom mapping');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle AI column mapping application
  const handleApplyAIMapping = async (mapping: ColumnMapping, customBankName?: string) => {
    if (!pendingCSVText) {
      console.error('[ImportPage] No pending CSV data');
      return;
    }

    try {
      setIsProcessing(true);
      setShowAIColumnMapper(false);
      setProcessingStage('Processing CSV with AI-detected column mapping...');

      console.log('[ImportPage] Applying AI column mapping:', mapping);
      console.log('[ImportPage] Custom bank name:', customBankName);

      // Create a custom bank config from the AI mapping
      const customConfig = {
        name: customBankName || file?.name.replace(/\.csv$/i, '') || 'Custom Bank',
        dateColumn: mapping.dateColumn || '',
        descriptionColumn: mapping.descriptionColumn || '',
        amountColumn: mapping.amountColumn || '',
        dateFormat: mapping.dateFormat || 'MM/dd/yyyy',
        amountMultiplier: 1,
        hasHeader: true,
        skipRows: 0,
      };

      // Parse CSV with the custom mapping
      const rows = parseCSVContent(pendingCSVText, customConfig.skipRows);
      if (rows.length === 0) {
        setError('No data found in CSV file after applying custom mapping.');
        return;
      }

      // Convert to transactions using the custom config
      const transactions = convertToTransactions(rows, customConfig, accountId);
      console.log('[ImportPage] AI mapping complete:', transactions.length, 'transactions');

      // Detect duplicates using the same logic as other formats
      setProcessingStage(`Detecting duplicates in ${transactions.length} transactions...`);
      const existingTxs = await db.transactions.toArray();
      console.log('[ImportPage] Existing transactions count:', existingTxs.length);

      // Check if smart duplicate detection is enabled
      const { isSmartDuplicateDetectionEnabled } = await import('@/lib/budget-privacy-settings');
      const useSmartDetection = isSmartDuplicateDetectionEnabled();
      console.log('[ImportPage] Smart duplicate detection:', useSmartDetection ? 'enabled' : 'disabled');

      await detectDuplicatesEnhanced(transactions, existingTxs, useSmartDetection);
      console.log('[ImportPage] Duplicate detection complete');

      // Auto-categorize
      setProcessingStage('Auto-categorizing transactions...');
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

      setStep('preview');
      console.log('[ImportPage] AI column mapping import complete!');
    } catch (error) {
      console.error('[ImportPage] Error applying AI column mapping:', error);
      setError(error instanceof Error ? error.message : 'Failed to apply AI column mapping');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Import Transactions</h1>
          <HelpTooltip
            content={
              <>
                <strong>File Formats:</strong> CSV = Spreadsheet file with columns. OFX/QFX = Standardized bank format with account info included.
                Most banks support both. OFX is easier (no bank selection needed).
              </>
            }
            learnMoreUrl="/docs/user-guide#import-formats"
            ariaLabel="More information about CSV and OFX file formats"
            iconSize="h-5 w-5"
          />
        </div>
        <p className="text-gray-600 mt-2">
          Upload CSV, OFX, QFX, or PDF files from BMO, Home Trust, TD, Chase, and 15+ other banks
        </p>
        {formatDetection && file && (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium flex items-center gap-2">
              <span className="text-gray-700">Detected Format:</span>
              <span className="text-teal-600">{getFormatDisplayName(formatDetection.format)}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                formatDetection.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                formatDetection.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {(formatDetection.confidence * 100).toFixed(0)}% confident
              </span>
              {/* PDF-specific badges */}
              {formatDetection.format === 'pdf' && pdfPageCount && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {pdfPageCount} page{pdfPageCount !== 1 ? 's' : ''}
                </span>
              )}
              {formatDetection.format === 'pdf' && pdfOcrConfidence !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  pdfOcrConfidence >= 0.9 ? 'bg-green-100 text-green-800' :
                  pdfOcrConfidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  OCR: {(pdfOcrConfidence * 100).toFixed(0)}%
                </span>
              )}
            </p>
            {formatDetection.suggestions && formatDetection.suggestions.length > 0 && (
              <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                {formatDetection.suggestions.map((suggestion, i) => (
                  <p key={i}>• {suggestion}</p>
                ))}
              </div>
            )}
            {/* PDF warnings */}
            {formatDetection.format === 'pdf' && pdfPageCount && pdfPageCount > 10 && (
              <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1">
                <p>⚠️ Large PDF detected ({pdfPageCount} pages). Processing may take longer and use significant memory.</p>
                <p className="mt-1">💡 For very large statements, consider requesting a CSV export from your bank for faster processing.</p>
              </div>
            )}
            {formatDetection.format === 'pdf' && pdfOcrConfidence !== null && pdfOcrConfidence < 0.7 && (
              <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1">
                <p>⚠️ Low OCR confidence ({(pdfOcrConfidence * 100).toFixed(0)}%). This may be a scanned/image-based PDF.</p>
                <p className="mt-1">💡 Please carefully review all transactions for accuracy.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">Import Error</h3>
              <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono bg-red-100 p-2 rounded">
                {error}
              </pre>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
                {pdfDiagnostics && (
                  <button
                    onClick={exportPDFDebugData}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Export Debug Data
                  </button>
                )}
              </div>
              {pdfDiagnostics && (
                <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <p className="font-semibold mb-1">💡 Troubleshooting tips:</p>
                  <ul className="list-disc list-inside space-y-1">
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
      {step === 'upload' && (
        <>
          {/* Natural Language Import REMOVED (2025-11-24) - client-side AI calls disabled */}

          {/* Import History Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="border-b-2 border-gray-200 bg-gray-50 p-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Imports</h2>
              <p className="text-base text-gray-600 mt-2">
                View your import history and verify successful uploads
              </p>
            </div>

            {importHistory.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {importHistory.map((record) => {
                  const isPartialImport = record.duplicateCount > 0 && record.duplicateCount < record.transactionCount;
                  const isFullSuccess = record.duplicateCount === 0;

                  return (
                    <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                      {/* File Info Row */}
                      <div className="flex items-start gap-4 mb-3">
                        <div className="flex-shrink-0">
                          <FileText className="w-6 h-6 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {record.fileName}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-300">
                              {record.fileFormat.toUpperCase()}
                            </span>
                            {isFullSuccess && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                                <Check className="w-3 h-3" />
                                Success
                              </span>
                            )}
                            {isPartialImport && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                <AlertCircle className="w-3 h-3" />
                                Partial Import
                              </span>
                            )}
                          </div>

                          {/* Import Date */}
                          <p className="text-sm text-gray-600 mb-2">
                            Imported on {format(new Date(record.importDate), 'MMM d, yyyy \'at\' h:mm a')}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-700 mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <strong>{record.transactionCount}</strong> {record.transactionCount === 1 ? 'transaction' : 'transactions'} added
                            </span>
                            {record.duplicateCount > 0 && (
                              <span className="flex items-center gap-1 text-yellow-700">
                                <AlertCircle className="w-4 h-4" />
                                <strong>{record.duplicateCount}</strong> {record.duplicateCount === 1 ? 'duplicate' : 'duplicates'} skipped
                              </span>
                            )}
                          </div>

                          {/* Date Range */}
                          {record.dateRangeStart && record.dateRangeEnd && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Transactions:</span>{' '}
                              {format(new Date(record.dateRangeStart), 'MMM d')} - {format(new Date(record.dateRangeEnd), 'MMM d, yyyy')}
                            </p>
                          )}

                          {/* Bank */}
                          {record.bank && (
                            <p className="text-sm text-gray-600 mt-1">
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

          {/* Bank Selection - Enhanced */}
          {(!formatDetection || formatDetection.format === 'csv' || formatDetection.format === 'unknown') && (
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
              <label htmlFor="import-bank-select" className="block text-base font-semibold text-gray-700 mb-3">
                Select Your Bank (CSV files only)
              </label>
              <select
                id="import-bank-select"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                disabled={formatDetection?.format === 'ofx' || formatDetection?.format === 'qfx'}
              >
                <option value="auto">Auto-detect (Recommended)</option>
                <option value="bmo">BMO (Bank of Montreal)</option>
                <option value="homeTrust">Home Trust</option>
                <option value="td">TD Canada Trust</option>
                <option value="chase">Chase Bank</option>
                <option value="bofa">Bank of America</option>
              </select>
              <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">Tip:</span> OFX/QFX files don't need bank selection - account info is already included in the file
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
            className={`bg-white rounded-lg shadow-md p-10 border-2 border-dashed transition-all ${
              isDragging
                ? 'border-teal-500 bg-teal-50 shadow-lg scale-105'
                : 'border-gray-300 hover:border-teal-400 hover:shadow-lg'
            }`}
          >
            <div className="text-center">
              <Upload className={`w-20 h-20 mx-auto mb-6 transition-colors ${
                isDragging ? 'text-teal-500' : 'text-gray-400'
              }`} />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {file ? file.name : 'Upload Bank Statement'}
              </h2>
              <p className="text-base text-gray-700 mb-6 font-medium">
                Drag and drop your CSV, OFX, QFX, or PDF file here, or click to browse
              </p>
              <input
                type="file"
                accept=".csv,.ofx,.qfx,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                data-testid="csv-file-input"
                aria-label="Upload transaction file"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-3 px-8 py-4 min-h-[48px] bg-teal-700 text-white text-base font-semibold rounded-lg hover:bg-teal-800 cursor-pointer transition-all shadow-md hover:shadow-lg"
              >
                <FileText className="w-6 h-6" />
                Choose File
              </label>

              {file && (
                <div className="mt-6 flex items-center justify-center gap-3 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-base font-semibold text-green-800">{file.name} selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          {isProcessing && processingStage && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-md">
              <div className="flex items-center gap-4">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">Processing Import</h3>
                  <p className="text-base text-blue-800">{processingStage}</p>
                </div>
              </div>
              {/* Page-by-page progress for PDF */}
              {formatDetection?.format === 'pdf' && pdfTotalPages > 0 ? (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-blue-700 mb-1">
                    <span>Page {pdfCurrentPage} of {pdfTotalPages}</span>
                    <span>{Math.round((pdfCurrentPage / pdfTotalPages) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${(pdfCurrentPage / pdfTotalPages) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse w-2/3"></div>
                </div>
              )}
            </div>
          )}

          {/* Process Button - Enhanced */}
          {file && (
            <div className="flex justify-end">
              <button
                onClick={processFile}
                disabled={isProcessing}
                className="px-8 py-4 min-h-[48px] bg-teal-700 text-white text-base font-semibold rounded-lg hover:bg-teal-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing File...
                  </span>
                ) : 'Process File'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Preview Step */}
      {step === 'preview' && summary && (
        <>
          {/* Summary - Enhanced */}
          <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-teal-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Import Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-base font-medium text-gray-700 mb-2">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-base font-medium text-gray-700 mb-2">New Transactions</p>
                <p className="text-3xl font-bold text-green-600">{summary.new}</p>
                <p className="text-xs text-gray-600 mt-1">Will be imported</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-base font-medium text-gray-700 mb-2">Duplicates</p>
                <p className="text-3xl font-bold text-yellow-600">{summary.duplicates}</p>
                <p className="text-xs text-gray-600 mt-1">Will be skipped</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-base font-medium text-gray-700 mb-2">Date Range</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">
                  {summary.dateRange.earliest.toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">to</p>
                <p className="text-sm font-semibold text-gray-900">
                  {summary.dateRange.latest.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t-2 border-gray-200">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-base font-semibold text-gray-700 mb-2">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  +${summary.income.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <p className="text-base font-semibold text-gray-700 mb-2">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  -${summary.expenses.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Low-Confidence Review Section */}
          {parsedTransactions.some(tx => tx.requiresReview) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                    Review Required: Low-Confidence Duplicate Matches
                  </h3>
                  <p className="text-sm text-yellow-800">
                    {parsedTransactions.filter(tx => tx.requiresReview).length} transaction(s) were flagged as potential duplicates 
                    with low confidence. Please review and confirm if they are duplicates.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {parsedTransactions.map((tx, index) => {
                  if (!tx.requiresReview) return null;
                  
                  return (
                    <div key={index} className="bg-white rounded-lg border border-yellow-300 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {tx.date.toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-600">
                              {tx.description}
                            </span>
                            <span className={`text-sm font-semibold ${
                              tx.amount > 0 ? 'text-green-600' : 'text-gray-900'
                            }`}>
                              {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                            </span>
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              {(tx.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          {tx.duplicateReason && (
                            <p className="text-xs text-gray-600 mb-2">
                              <strong>AI Reason:</strong> {tx.duplicateReason}
                            </p>
                          )}
                          {tx.matchedTransactionId && (
                            <button
                              onClick={() => setExpandedReviewIndex(expandedReviewIndex === index ? null : index)}
                              className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              {expandedReviewIndex === index ? 'Hide' : 'View'} matched transaction
                            </button>
                          )}
                          {expandedReviewIndex === index && tx.matchedTransactionId && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              {matchedTransactions.has(index) ? (
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-900 mb-1">Matched Transaction:</div>
                                  <div className="text-gray-600">
                                    <div><strong>Date:</strong> {matchedTransactions.get(index)!.date.toLocaleDateString()}</div>
                                    <div><strong>Description:</strong> {matchedTransactions.get(index)!.description}</div>
                                    <div><strong>Amount:</strong> ${Math.abs(matchedTransactions.get(index)!.amount).toFixed(2)}</div>
                                    {matchedTransactions.get(index)!.category && (
                                      <div><strong>Category:</strong> {matchedTransactions.get(index)!.category}</div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-600">Loading matched transaction details...</div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleDuplicateStatus(index)}
                            className={`px-3 py-1 text-xs rounded ${
                              tx.isDuplicate
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tx.isDuplicate ? (
                              <>
                                <Check className="w-3 h-3 inline mr-1" />
                                Mark as New
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 inline mr-1" />
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
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b-2 border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Preview Transactions</h2>
              <p className="text-base text-gray-600 mt-2">
                Review {parsedTransactions.length} transactions before importing • {summary.duplicates} duplicates will be skipped
              </p>
              {/* Enrichment Summary Badge */}
              {enrichmentResult && enrichmentResult.enrichedCount > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>
                    <strong>AI Enhanced:</strong> {enrichmentResult.enrichedCount} transactions enriched
                    {enrichmentResult.cacheHitRate && enrichmentResult.cacheHitRate > 0 && (
                      <span className="ml-1 opacity-75">
                        ({(enrichmentResult.cacheHitRate * 100).toFixed(0)}% from cache)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0 shadow-sm">
                  <tr className="border-b-2 border-gray-300">
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase">Date</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase">Description</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase">Category</th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gray-900 uppercase">Amount</th>
                    {formatDetection?.format === 'pdf' && (
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-900 uppercase">Confidence</th>
                    )}
                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-900 uppercase">Status</th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-900 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parsedTransactions.map((tx, index) => (
                    <tr key={index} className={`transition-colors ${
                      tx.isDuplicate ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-4 py-4 text-base font-medium text-gray-900 whitespace-nowrap">
                        {tx.date.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-base text-gray-900 max-w-xs">
                        <div className="flex flex-col gap-1">
                          {/* Show normalized merchant if available */}
                          {(tx as any).normalizedMerchant ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-purple-700">
                                  {(tx as any).normalizedMerchant}
                                </span>
                                {(tx as any).isLikelyRecurring && (
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                                    ↻ {(tx as any).recurringFrequency}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 truncate">
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
                            {(tx as any).suggestedSubcategory && ` • ${(tx as any).suggestedSubcategory}`}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">Uncategorized</span>
                        )}
                      </td>
                      <td className={`px-4 py-4 text-base text-right font-bold whitespace-nowrap ${
                        tx.amount > 0 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </td>
                      {/* PDF OCR Confidence Column */}
                      {formatDetection?.format === 'pdf' && (
                        <td className="px-4 py-4 text-center">
                          {tx.confidence !== undefined && tx.confidence > 0 ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className={`px-2 py-1 text-xs font-bold rounded ${
                                tx.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                                tx.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
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
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-base font-bold bg-yellow-100 text-yellow-900 border-2 border-yellow-400 shadow-sm">
                              <X className="w-5 h-5" />
                              DUPLICATE
                            </span>
                            {tx.confidence < 1.0 && tx.confidence > 0 && (
                              <span className="px-2 py-1 text-xs font-bold text-yellow-800 bg-yellow-50 border border-yellow-300 rounded">
                                {(tx.confidence * 100).toFixed(0)}% MATCH
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-base font-bold bg-green-100 text-green-900 border-2 border-green-400 shadow-sm">
                            <Check className="w-5 h-5" />
                            NEW
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleDuplicateStatus(index)}
                          className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-teal-600 hover:text-teal-700 p-2 rounded-lg hover:bg-teal-50 transition-colors"
                          title={tx.isDuplicate ? 'Mark as new transaction' : 'Mark as duplicate'}
                          aria-label={tx.isDuplicate ? 'Mark as new transaction' : 'Mark as duplicate'}
                        >
                          {tx.isDuplicate ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <X className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedTransactions.length > 100 && (
                <div className="text-center py-4 bg-gray-50 border-t-2 border-gray-200">
                  <p className="text-base font-medium text-gray-600">
                    Showing all {parsedTransactions.length} transactions • Scroll to view more
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions - Enhanced */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button
              onClick={reset}
              className="px-8 py-4 min-h-[48px] border-2 border-gray-300 text-gray-700 text-base font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow"
            >
              Cancel Import
            </button>
            <button
              onClick={importTransactions}
              disabled={isProcessing || summary.new === 0}
              className="px-8 py-4 min-h-[48px] bg-teal-700 text-white text-base font-semibold rounded-lg hover:bg-teal-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing Transactions...
                </span>
              ) : `Import ${summary.new} New Transaction${summary.new !== 1 ? 's' : ''}`}
            </button>
          </div>
        </>
      )}

      {/* Complete Step */}
      {step === 'complete' && summary && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h2>
          <p className="text-gray-600 mb-8">
            Successfully imported {summary.new} transactions
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Import More
            </button>
            <button
              onClick={() => void router.push('/budget-app/transactions')}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
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
        bankName={file?.name || 'Unknown Bank'}
      />

      {/* AI Column Mapping Modal (for unknown CSV banks) */}
      <AIColumnMapperModal
        isOpen={showAIColumnMapper}
        onClose={() => {
          setShowAIColumnMapper(false);
          setPendingCSVText('');
          setPendingCSVHeaders([]);
          setPendingCSVRows([]);
          setIsProcessing(false);
        }}
        onApplyMapping={handleApplyAIMapping}
        headers={pendingCSVHeaders}
        sampleRows={pendingCSVRows}
        fileName={file?.name || 'unknown.csv'}
      />

      {/* Error Recovery Modal (AI-powered import error recovery) */}
      <ErrorRecoveryModal
        isOpen={showErrorRecovery}
        onClose={() => {
          setShowErrorRecovery(false);
          setErrorAnalysis(null);
          setPendingErrorFile(null);
          setPendingErrorText('');
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
    </div>
  );
}
