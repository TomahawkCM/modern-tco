/**
 * OpenAI PDF Extraction Service (Online Version)
 * Uses OpenAI Vision API (GPT-4o) to extract transactions from bank statement PDFs.
 * Handles any language, any format, with structured output.
 */

import type { ParsedTransaction } from '@/types/budget';

export interface OpenAIPdfExtractionResult {
  transactions: ParsedTransaction[];
  currency?: string;
  statementInfo?: {
    bankName?: string;
    accountNumber?: string;
    statementPeriod?: string;
    openingBalance?: number;
    closingBalance?: number;
  };
  tokensUsed?: number;
  confidence: number;
}

/**
 * Extract transactions from a PDF using the backend API route.
 * The API route uses the shared OpenAI API key.
 *
 * @param file - PDF file to process
 * @param onProgress - Optional progress callback
 * @returns Extraction result with transactions
 */
export async function extractPdfWithOpenAI(
  file: File,
  onProgress?: (message: string) => void
): Promise<OpenAIPdfExtractionResult> {
  onProgress?.('Uploading PDF for AI extraction...');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/import/pdf-extract', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  onProgress?.('Processing response...');

  const result = await response.json();

  // Convert ISO date strings back to Date objects
  const transactions: ParsedTransaction[] = (result.transactions || []).map((tx: any) => ({
    date: new Date(tx.date),
    description: tx.description || 'Unknown Transaction',
    amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0,
    isDuplicate: false,
    confidence: tx.confidence || 0.9,
    currency: tx.currency || result.currency || undefined,
    transactionType: tx.type || undefined,
    sourceFormat: 'pdf' as const,
    balance: tx.balance != null ? parseFloat(tx.balance) : undefined,
    requiresReview: false,
  }));

  return {
    transactions,
    currency: result.currency,
    statementInfo: result.statementInfo,
    tokensUsed: result.tokensUsed,
    confidence: result.confidence || 0.9,
  };
}

/**
 * Check if the OpenAI PDF extraction API is available.
 * Pings the health endpoint.
 */
export async function isOpenAIPdfAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/api/import/pdf-extract', {
      method: 'HEAD',
    });
    return response.ok || response.status === 405; // HEAD not allowed but route exists
  } catch {
    return false;
  }
}
