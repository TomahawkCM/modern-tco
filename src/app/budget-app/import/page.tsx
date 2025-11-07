'use client';

/**
 * Transaction Import Page
 * Upload and import bank statements in CSV, OFX, or QFX format
 * Supports 15+ banks including BMO, Home Trust, TD, Chase, Bank of America
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Eye, X, Check } from 'lucide-react';
import { db } from '@/lib/budget-db';
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
import type { ParsedTransaction, Transaction } from '@/types/budget';

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [formatDetection, setFormatDetection] = useState<FormatDetectionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  console.log('[ImportPage] Component mounted');

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

    try {
      // Check if format is supported
      if (!isFormatSupported(formatDetection.format)) {
        const errorMsg = `Unsupported format: ${getFormatDisplayName(formatDetection.format)}`;
        setError(errorMsg);
        alert(errorMsg);
        return;
      }

      // Read file content
      console.log('[ImportPage] Reading file content...');
      const text = await file.text();
      console.log('[ImportPage] File content length:', text.length);

      let transactions: ParsedTransaction[] = [];

      // ========================================
      // OFX/QFX Processing
      // ========================================
      if (formatDetection.format === 'ofx' || formatDetection.format === 'qfx') {
        console.log('[ImportPage] Processing OFX/QFX file...');

        // Validate OFX format
        const validation = validateOFXFile(text);
        if (!validation.isValid) {
          const errorMsg = `Invalid OFX file:\n${validation.errors.join('\n')}`;
          setError(errorMsg);
          alert(errorMsg);
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

        // Detect bank if auto
        let bankKey = selectedBank;
        if (selectedBank === 'auto') {
          console.log('[ImportPage] Auto-detecting bank format...');
          const detected = await detectBankFromContent(text);
          console.log('[ImportPage] Detected bank:', detected);
          if (!detected) {
            const errorMsg = 'Could not auto-detect bank format. Please select manually.';
            setError(errorMsg);
            alert(errorMsg);
            return;
          }
          bankKey = detected;
        }
        console.log('[ImportPage] Using bank config:', bankKey);

        const bankConfig = BANK_CONFIGS[bankKey];
        if (!bankConfig) {
          alert('Invalid bank configuration');
          return;
        }

        // Parse CSV with the correct skipRows
        const rows = parseCSVContent(text, bankConfig.skipRows || 0);
        if (rows.length === 0) {
          alert('No data found in CSV file');
          return;
        }

        // Convert to transactions
        transactions = convertToTransactions(rows, bankConfig, accountId);
        console.log('[ImportPage] CSV parsing complete');
      } else {
        alert('Unsupported file format');
        return;
      }

      // ========================================
      // Common Processing (Both Formats)
      // ========================================

      // Detect duplicates using FITID (perfect for OFX) or fuzzy matching (CSV)
      // Optionally use smart detection with Claude API if enabled
      console.log('[ImportPage] Checking for duplicates...');
      const existingTxs = await db.transactions.toArray();
      console.log('[ImportPage] Existing transactions count:', existingTxs.length);
      
      // Check if smart duplicate detection is enabled
      const { isSmartDuplicateDetectionEnabled } = await import('@/lib/budget-privacy-settings');
      const useSmartDetection = isSmartDuplicateDetectionEnabled();
      console.log('[ImportPage] Smart duplicate detection:', useSmartDetection ? 'enabled' : 'disabled');
      
      await detectDuplicates(transactions, existingTxs, useSmartDetection);
      console.log('[ImportPage] Duplicate detection complete');

      // Auto-categorize
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
      alert(errorMsg);
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

      setStep('complete');
      console.log('[ImportPage] Import complete!');
    } catch (error) {
      console.error('[ImportPage] ERROR importing:', error);
      const errorMsg = error instanceof Error
        ? `Import Error: ${error.message}\n\nStack: ${error.stack}`
        : 'Error importing transactions. Please try again.';
      setError(errorMsg);
      alert(errorMsg);
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
        <h1 className="text-3xl font-bold text-gray-900">Import Transactions</h1>
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
          {isNaturalLanguageImportEnabled() && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Natural Language Import
                  </h3>
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

          {/* Bank Selection - Only show for CSV files */}
          {(!formatDetection || formatDetection.format === 'csv' || formatDetection.format === 'unknown') && (
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Bank (CSV only)
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={formatDetection?.format === 'ofx' || formatDetection?.format === 'qfx'}
              >
                <option value="auto">Auto-detect</option>
                <option value="bmo">BMO (Bank of Montreal)</option>
                <option value="homeTrust">Home Trust</option>
                <option value="td">TD Canada Trust</option>
                <option value="chase">Chase Bank</option>
                <option value="bofa">Bank of America</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                OFX/QFX files don't need bank selection - account info is embedded in the file
              </p>
            </div>
          )}

          {/* File Upload */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-white rounded-lg shadow p-8 border-2 border-dashed transition-colors ${
              isDragging
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {file ? file.name : 'Upload Bank Statement'}
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your CSV, OFX, or QFX file here, or click to browse
              </p>
              <input
                type="file"
                accept=".csv,.ofx,.qfx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-colors"
              >
                <FileText className="w-5 h-5" />
                Choose File
              </label>

              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{file.name} selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Process Button */}
          {file && (
            <div className="flex justify-end">
              <button
                onClick={processFile}
                disabled={isProcessing}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Process File'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Preview Step */}
      {step === 'preview' && summary && (
        <>
          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{summary.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">New Transactions</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{summary.new}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duplicates</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">{summary.duplicates}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date Range</p>
                <p className="text-sm font-medium text-gray-900 mt-2">
                  {summary.dateRange.earliest.toLocaleDateString()} - {summary.dateRange.latest.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-xl font-bold text-green-600 mt-2">
                  ${summary.income.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold text-red-600 mt-2">
                  ${summary.expenses.toFixed(2)}
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

          {/* Preview Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Preview Transactions</h2>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parsedTransactions.slice(0, 50).map((tx, index) => (
                    <tr key={index} className={tx.isDuplicate ? 'bg-yellow-50' : ''}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {tx.date.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {tx.description}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {(tx as any).suggestedCategory ? (
                          <span className="text-teal-600">
                            {(tx as any).suggestedCategory}
                            {(tx as any).suggestedSubcategory && ` • ${(tx as any).suggestedSubcategory}`}
                          </span>
                        ) : (
                          <span className="text-gray-400">Uncategorized</span>
                        )}
                      </td>
                      <td className={`px-4 py-2 text-sm text-right font-semibold ${
                        tx.amount > 0 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {tx.isDuplicate ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Duplicate
                            </span>
                            {tx.confidence < 1.0 && tx.confidence > 0 && (
                              <span className="text-xs text-gray-500">
                                {(tx.confidence * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => toggleDuplicateStatus(index)}
                          className="text-xs text-teal-600 hover:text-teal-700 px-2 py-1 rounded hover:bg-teal-50"
                          title={tx.isDuplicate ? 'Mark as new transaction' : 'Mark as duplicate'}
                        >
                          {tx.isDuplicate ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={reset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={importTransactions}
              disabled={isProcessing || summary.new === 0}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Importing...' : `Import ${summary.new} Transactions`}
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
