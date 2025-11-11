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
  detectDuplicates,
  generateImportSummary,
  type ImportSummary,
} from '@/lib/parsers/csv-parser';
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
import {
  parseImportIntent,
  autoConfigureImport,
  isNaturalLanguageImportEnabled
} from '@/lib/ai/natural-language-import';
import type { ParsedTransaction, Transaction, ImportMetadata } from '@/types/budget';
import { format } from 'date-fns';
import { HelpTooltip } from '@/components/budget/HelpTooltip';

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
  const [nlInput, setNlInput] = useState<string>('');
  const [isProcessingNL, setIsProcessingNL] = useState(false);
  const [nlResult, setNlResult] = useState<{ success: boolean; message: string } | null>(null);
  const [importHistory, setImportHistory] = useState<ImportMetadata[]>([]);
  const [isNLEnabled, setIsNLEnabled] = useState(false); // Track NL feature enabled state

  console.log('[ImportPage] Component mounted');

  // Check if Natural Language Import is enabled (client-side only to avoid hydration mismatch)
  useEffect(() => {
    setIsNLEnabled(isNaturalLanguageImportEnabled());
  }, []);

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

  // Handle natural language import configuration
  async function handleNaturalLanguageImport() {
    if (!nlInput.trim()) return;
    
    setIsProcessingNL(true);
    setNlResult(null);
    
    try {
      const config = await autoConfigureImport(nlInput);
      
      if (config.success && config.bankKey) {
        setSelectedBank(config.bankKey);
        setNlResult({
          success: true,
          message: `Configured for ${BANK_CONFIGS[config.bankKey]?.name || config.bankKey}. ${config.intent.reasoning}`,
        });
        
        // If file is already selected, auto-process
        if (file) {
          setTimeout(() => {
            processFile();
          }, 500);
        }
      } else if (config.shouldUseWizard) {
        setNlResult({
          success: false,
          message: `Low confidence (${(config.intent.confidence * 100).toFixed(0)}%). Please use the visual wizard or provide more details.`,
        });
      } else {
        setNlResult({
          success: false,
          message: `Could not parse: "${nlInput}". Please try: "Import my [Bank] [account type] [format]"`,
        });
      }
    } catch (error) {
      console.error('[ImportPage] NL import error:', error);
      setNlResult({
        success: false,
        message: 'Failed to parse. Please use the visual wizard instead.',
      });
    } finally {
      setIsProcessingNL(false);
    }
  }

  // Helper function to detect bank from file content
  async function detectBankFromContent(text: string): Promise<string | null> {
    // Try different skipRows levels (0, 1, 2, 3) to find valid headers
    for (let skipRows = 0; skipRows <= 3; skipRows++) {
      try {
        const rows = parseCSVContent(text, skipRows);
        if (rows.length > 0) {
          const headers = Object.keys(rows[0]);
          const detected = detectBank(headers);
          if (detected) {
            return detected;
          }
        }
      } catch (error) {
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
            const errorMsg = 'Could not auto-detect bank format. Please select manually.';
            setError(errorMsg);
            return;
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
      } else {
        setError(`Unsupported file format: ${formatDetection.format}. Please use CSV, OFX, or QFX files.`);
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

      await detectDuplicates(transactions, existingTxs, useSmartDetection);
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

      console.log('[ImportPage] Setting parsed transactions:', transactions.length);
      setParsedTransactions(transactions);
      setSummary(generateImportSummary(transactions));
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

      setStep('complete');
      console.log('[ImportPage] Import complete!');
    } catch (error) {
      console.error('[ImportPage] ERROR importing:', error);
      const errorMsg = error instanceof Error
        ? `Import Error: ${error.message}\n\nStack: ${error.stack}`
        : 'Error importing transactions. Please try again.';
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }

  function reset() {
    setFile(null);
    setFormatDetection(null);
    setParsedTransactions([]);
    setSummary(null);
    setStep('upload');
    setSelectedBank('auto');
    setError(null);
  }

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
          Upload CSV, OFX, or QFX files from BMO, Home Trust, TD, Chase, and 15+ other banks
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
            </p>
            {formatDetection.suggestions && formatDetection.suggestions.length > 0 && (
              <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                {formatDetection.suggestions.map((suggestion, i) => (
                  <p key={i}>• {suggestion}</p>
                ))}
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
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Step */}
      {step === 'upload' && (
        <>
          {/* Natural Language Import (if enabled) */}
          {isNLEnabled && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Natural Language Import
                    </h3>
                    <HelpTooltip
                      content="AI-powered feature that understands plain English instructions. Just describe what you want to import and the AI will configure the right settings for your bank."
                      learnMoreUrl="/docs/user-guide#ai-import"
                      ariaLabel="More information about AI-powered natural language import"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Describe your import in plain English. Example: "Import my TD checking account CSV"
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nlInput}
                      onChange={(e) => setNlInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageImport()}
                      placeholder="e.g., Import my TD checking account CSV"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isProcessingNL}
                    />
                    <button
                      onClick={handleNaturalLanguageImport}
                      disabled={isProcessingNL || !nlInput.trim()}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessingNL ? 'Processing...' : 'Configure'}
                    </button>
                  </div>
                  {nlResult && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      nlResult.success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <p className={`text-sm ${
                        nlResult.success ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        {nlResult.success ? '✓ ' : '⚠ '}
                        {nlResult.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                Drag and drop your CSV, OFX, or QFX file here, or click to browse
              </p>
              <input
                type="file"
                accept=".csv,.ofx,.qfx"
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
              <div className="mt-4 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse w-2/3"></div>
              </div>
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
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0 shadow-sm">
                  <tr className="border-b-2 border-gray-300">
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase">Date</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase">Description</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase">Category</th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gray-900 uppercase">Amount</th>
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
                      <td className="px-4 py-4 text-base text-gray-900 max-w-xs truncate">
                        {tx.description}
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
    </div>
  );
}
