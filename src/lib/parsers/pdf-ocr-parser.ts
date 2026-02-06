/**
 * PDF OCR Parser
 * Uses PDF.js for rendering and Tesseract.js for OCR
 *
 * Handles scanned bank statements that don't have extractable text.
 * Features:
 * - PDF rendering at 300 DPI for optimal OCR accuracy
 * - Image preprocessing (grayscale, adaptive threshold, deskew)
 * - Tesseract.js OCR with confidence scoring
 * - Transaction row parsing with pattern matching
 * - Progress callbacks for UI updates
 * - Cancel/retry support
 */

import type { ParsedTransaction } from '@/types/budget';

// ============================================================================
// Types
// ============================================================================

export interface OCRProgress {
  stage: 'loading' | 'rendering' | 'preprocessing' | 'ocr' | 'parsing' | 'complete' | 'error' | 'cancelled';
  currentPage: number;
  totalPages: number;
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
}

export interface OCRResult {
  success: boolean;
  transactions: ParsedTransaction[];
  rawText: string;
  pageTexts: string[];
  confidence: number; // Average OCR confidence 0-1
  warnings: string[];
  processingTime: number; // milliseconds
  ocrStats: {
    totalWords: number;
    lowConfidenceWords: number;
    averageConfidence: number;
  };
}

export interface OCROptions {
  language?: string; // Default: 'eng'
  dpi?: number; // Default: 300
  preprocessImage?: boolean; // Default: true
  onProgress?: (progress: OCRProgress) => void;
  abortSignal?: AbortSignal;
}

// ============================================================================
// PDF.js Wrapper - Render PDF pages to canvas
// ============================================================================

/**
 * Dynamically import PDF.js (client-side only)
 */
async function loadPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be used in browser environment');
  }

  const pdfjs = await import('pdfjs-dist');

  // Set worker path for Next.js
  // The worker needs to be served from public directory or use CDN
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

  return pdfjs;
}

/**
 * Render a PDF page to canvas at specified DPI
 */
async function renderPdfPageToCanvas(
  pdfDocument: any,
  pageNumber: number,
  dpi: number = 300
): Promise<HTMLCanvasElement> {
  const page = await pdfDocument.getPage(pageNumber);

  // Calculate scale for target DPI (PDF default is 72 DPI)
  const scale = dpi / 72;
  const viewport = page.getViewport({ scale });

  // Create canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // Render PDF page to canvas
  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}

// ============================================================================
// Image Preprocessing for OCR
// ============================================================================

/**
 * Apply image preprocessing to improve OCR accuracy
 * - Convert to grayscale
 * - Apply adaptive thresholding
 * - Increase contrast
 */
function preprocessImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const {data} = imageData;

  // Convert to grayscale and apply adaptive threshold
  for (let i = 0; i < data.length; i += 4) {
    // Grayscale using luminosity method
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

    // Apply simple contrast enhancement
    const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.5 + 128));

    // Apply threshold (binarization) - helps with OCR
    const threshold = enhanced > 140 ? 255 : 0;

    data[i] = threshold;     // R
    data[i + 1] = threshold; // G
    data[i + 2] = threshold; // B
    // Alpha (data[i + 3]) stays unchanged
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Advanced preprocessing with local adaptive thresholding
 * Better for documents with uneven lighting
 */
function preprocessImageAdaptive(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const {data} = imageData;
  const {width} = canvas;
  const {height} = canvas;

  // First pass: convert to grayscale
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
  }

  // Calculate integral image for adaptive thresholding
  const blockSize = 15; // Local window size
  const C = 10; // Threshold constant

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pixelIdx = idx * 4;

      // Calculate local mean
      let sum = 0;
      let count = 0;

      const halfBlock = Math.floor(blockSize / 2);
      for (let dy = -halfBlock; dy <= halfBlock; dy++) {
        for (let dx = -halfBlock; dx <= halfBlock; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            sum += gray[ny * width + nx];
            count++;
          }
        }
      }

      const localMean = sum / count;
      const threshold = gray[idx] > localMean - C ? 255 : 0;

      data[pixelIdx] = threshold;
      data[pixelIdx + 1] = threshold;
      data[pixelIdx + 2] = threshold;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// ============================================================================
// Tesseract.js OCR Wrapper
// ============================================================================

// Tesseract Word type (simplified)
interface TesseractWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

/**
 * Dynamically import Tesseract.js
 */
async function loadTesseract() {
  const Tesseract = await import('tesseract.js');
  return Tesseract;
}

/**
 * Perform OCR on a canvas using Tesseract.js
 */
async function performOCR(
  canvas: HTMLCanvasElement,
  language: string = 'eng',
  onProgress?: (progress: number) => void
): Promise<{ text: string; confidence: number; words: TesseractWord[] }> {
  const Tesseract = await loadTesseract();

  // Create worker
  const worker = await Tesseract.createWorker(language, 1, {
    logger: (m: any) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress * 100);
      }
    },
  });

  try {
    // Configure for best accuracy with bank statements
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/-$() ',
      preserve_interword_spaces: '1',
    });

    // Perform OCR
    const result = await worker.recognize(canvas);
    const data = result.data as {
      text: string;
      confidence: number;
      words?: TesseractWord[];
    };

    return {
      text: data.text,
      confidence: data.confidence / 100, // Convert to 0-1 scale
      words: data.words || [],
    };
  } finally {
    await worker.terminate();
  }
}

// ============================================================================
// Transaction Row Parsing
// ============================================================================

/**
 * Parse OCR text to extract transaction rows
 */
function parseTransactionRows(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Date patterns
  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,     // MM/DD/YYYY or DD/MM/YYYY
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,           // YYYY-MM-DD
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s*\d{4})?)/i, // Month DD, YYYY
  ];

  // Amount patterns
  const amountPatterns = [
    /\$?([\d,]+\.\d{2})/,                          // $1,234.56 or 1234.56
    /\(([\d,]+\.\d{2})\)/,                         // (1,234.56) - negative
    /-\$?([\d,]+\.\d{2})/,                         // -$1,234.56 - negative
  ];

  for (const line of lines) {
    // Try to extract date
    let dateStr: string | null = null;
    let dateMatch: RegExpMatchArray | null = null;

    for (const pattern of datePatterns) {
      dateMatch = line.match(pattern);
      if (dateMatch) {
        dateStr = dateMatch[1];
        break;
      }
    }

    if (!dateStr) continue; // Skip lines without dates

    // Try to extract amount
    let amount: number | null = null;
    let isNegative = false;

    // Check for parentheses (negative)
    const parenMatch = line.match(/\(([\d,]+\.\d{2})\)/);
    if (parenMatch) {
      amount = parseFloat(parenMatch[1].replace(/,/g, ''));
      isNegative = true;
    }

    // Check for negative sign
    if (!amount) {
      const negMatch = line.match(/-\$?([\d,]+\.\d{2})/);
      if (negMatch) {
        amount = parseFloat(negMatch[1].replace(/,/g, ''));
        isNegative = true;
      }
    }

    // Check for regular amount
    if (!amount) {
      const amtMatch = line.match(/\$?([\d,]+\.\d{2})/);
      if (amtMatch) {
        amount = parseFloat(amtMatch[1].replace(/,/g, ''));
      }
    }

    if (!amount) continue; // Skip lines without amounts

    if (isNegative) {
      amount = -Math.abs(amount);
    }

    // Extract description (everything between date and amount)
    let description = line;

    // Remove date from description
    if (dateMatch) {
      description = description.replace(dateMatch[0], '').trim();
    }

    // Remove amount patterns from description
    description = description
      .replace(/\$?[\d,]+\.\d{2}/g, '')
      .replace(/\([\d,]+\.\d{2}\)/g, '')
      .replace(/-\$?[\d,]+\.\d{2}/g, '')
      .trim();

    // Clean up description
    description = description
      .replace(/\s+/g, ' ')
      .replace(/^\s*[-|]\s*/, '')
      .trim();

    if (description.length < 2) {
      description = 'Unknown Transaction';
    }

    // Parse date
    const date = parseDateString(dateStr);
    if (!date) continue;

    transactions.push({
      date,
      description,
      amount,
      isDuplicate: false,
      confidence: 0.7, // Default OCR confidence
    });
  }

  return transactions;
}

/**
 * Parse date string to Date object
 */
function parseDateString(dateStr: string): Date | null {
  // Try various date formats
  const formats = [
    // MM/DD/YYYY
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
    // MM/DD/YY
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/,
    // YYYY-MM-DD
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
    // Month DD, YYYY
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:,?\s*(\d{4}))?$/i,
  ];

  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        // MM/DD/YYYY
        return new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
      } else if (format === formats[1]) {
        // MM/DD/YY
        const year = parseInt(match[3]) + 2000;
        return new Date(year, parseInt(match[1]) - 1, parseInt(match[2]));
      } else if (format === formats[2]) {
        // YYYY-MM-DD
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else if (format === formats[3]) {
        // Month DD, YYYY
        const monthName = match[1].toLowerCase().substring(0, 3);
        const month = months[monthName];
        const day = parseInt(match[2]);
        const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        return new Date(year, month, day);
      }
    }
  }

  // Fallback: try native Date parsing
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// ============================================================================
// Main OCR Pipeline
// ============================================================================

/**
 * Main function to perform OCR on a PDF file
 *
 * @param pdfData - PDF file as ArrayBuffer or Uint8Array
 * @param options - OCR options including progress callback
 * @returns OCR result with transactions and confidence scores
 */
export async function performPDFOCR(
  pdfData: ArrayBuffer | Uint8Array,
  options: OCROptions = {}
): Promise<OCRResult> {
  const {
    language = 'eng',
    dpi = 300,
    preprocessImage: shouldPreprocess = true,
    onProgress,
    abortSignal,
  } = options;

  const startTime = Date.now();
  const warnings: string[] = [];
  const pageTexts: string[] = [];
  let totalConfidence = 0;
  let totalWords = 0;
  let lowConfidenceWords = 0;

  // Helper to check abort
  const checkAbort = () => {
    if (abortSignal?.aborted) {
      throw new Error('OCR cancelled');
    }
  };

  // Helper to report progress
  const reportProgress = (progress: Partial<OCRProgress>) => {
    if (onProgress) {
      onProgress({
        stage: 'loading',
        currentPage: 0,
        totalPages: 0,
        progress: 0,
        message: 'Loading...',
        ...progress,
      });
    }
  };

  try {
    // Stage 1: Load PDF
    reportProgress({
      stage: 'loading',
      progress: 5,
      message: 'Loading PDF...',
    });

    checkAbort();

    const pdfjs = await loadPdfJs();
    const pdfDocument = await pdfjs.getDocument(pdfData).promise;
    const totalPages = pdfDocument.numPages;

    reportProgress({
      stage: 'loading',
      totalPages,
      progress: 10,
      message: `Loaded PDF with ${totalPages} pages`,
    });

    // Stage 2-4: Process each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      checkAbort();

      const pageProgress = 10 + (pageNum / totalPages) * 80;

      // Render page to canvas
      reportProgress({
        stage: 'rendering',
        currentPage: pageNum,
        totalPages,
        progress: pageProgress,
        message: `Rendering page ${pageNum}/${totalPages}...`,
        estimatedTimeRemaining: Math.round((totalPages - pageNum + 1) * 5), // ~5s per page
      });

      const canvas = await renderPdfPageToCanvas(pdfDocument, pageNum, dpi);

      // Preprocess image
      if (shouldPreprocess) {
        reportProgress({
          stage: 'preprocessing',
          currentPage: pageNum,
          totalPages,
          progress: pageProgress + 5,
          message: `Preprocessing page ${pageNum}/${totalPages}...`,
        });

        preprocessImageAdaptive(canvas);
      }

      // Perform OCR
      reportProgress({
        stage: 'ocr',
        currentPage: pageNum,
        totalPages,
        progress: pageProgress + 10,
        message: `OCR processing page ${pageNum}/${totalPages}...`,
      });

      const ocrResult = await performOCR(canvas, language, (p) => {
        reportProgress({
          stage: 'ocr',
          currentPage: pageNum,
          totalPages,
          progress: pageProgress + 10 + (p * 0.6),
          message: `OCR page ${pageNum}/${totalPages}: ${Math.round(p)}%`,
        });
      });

      pageTexts.push(ocrResult.text);
      totalConfidence += ocrResult.confidence;
      totalWords += ocrResult.words.length;

      // Count low confidence words
      for (const word of ocrResult.words) {
        if (word.confidence < 60) {
          lowConfidenceWords++;
        }
      }

      // Clean up canvas
      canvas.remove();
    }

    // Stage 5: Parse transactions
    reportProgress({
      stage: 'parsing',
      currentPage: totalPages,
      totalPages,
      progress: 90,
      message: 'Parsing transactions...',
    });

    const rawText = pageTexts.join('\n\n--- Page Break ---\n\n');
    const transactions = parseTransactionRows(rawText);

    // Calculate confidence warnings
    const avgConfidence = totalPages > 0 ? totalConfidence / totalPages : 0;
    const lowConfidenceRatio = totalWords > 0 ? lowConfidenceWords / totalWords : 0;

    if (avgConfidence < 0.7) {
      warnings.push(`Low average OCR confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    }

    if (lowConfidenceRatio > 0.2) {
      warnings.push(`${(lowConfidenceRatio * 100).toFixed(1)}% of words have low confidence`);
    }

    if (transactions.length === 0) {
      warnings.push('No transactions detected. PDF may not be a bank statement.');
    }

    // Apply confidence to transactions based on OCR quality
    for (const tx of transactions) {
      tx.confidence = avgConfidence * 0.8 + 0.2; // Scale to 0.2-1.0 range
    }

    reportProgress({
      stage: 'complete',
      currentPage: totalPages,
      totalPages,
      progress: 100,
      message: `Complete! Found ${transactions.length} transactions.`,
    });

    return {
      success: true,
      transactions,
      rawText,
      pageTexts,
      confidence: avgConfidence,
      warnings,
      processingTime: Date.now() - startTime,
      ocrStats: {
        totalWords,
        lowConfidenceWords,
        averageConfidence: avgConfidence,
      },
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage === 'OCR cancelled') {
      reportProgress({
        stage: 'cancelled',
        currentPage: 0,
        totalPages: 0,
        progress: 0,
        message: 'OCR cancelled by user',
      });

      return {
        success: false,
        transactions: [],
        rawText: '',
        pageTexts,
        confidence: 0,
        warnings: ['OCR cancelled by user'],
        processingTime: Date.now() - startTime,
        ocrStats: {
          totalWords,
          lowConfidenceWords,
          averageConfidence: 0,
        },
      };
    }

    reportProgress({
      stage: 'error',
      currentPage: 0,
      totalPages: 0,
      progress: 0,
      message: `Error: ${errorMessage}`,
    });

    return {
      success: false,
      transactions: [],
      rawText: '',
      pageTexts,
      confidence: 0,
      warnings: [`OCR failed: ${errorMessage}`],
      processingTime: Date.now() - startTime,
      ocrStats: {
        totalWords,
        lowConfidenceWords,
        averageConfidence: 0,
      },
    };
  }
}

/**
 * Check if a PDF needs OCR (has no extractable text)
 */
export async function pdfNeedsOCR(pdfData: ArrayBuffer | Uint8Array): Promise<boolean> {
  try {
    const pdfjs = await loadPdfJs();
    const pdfDocument = await pdfjs.getDocument(pdfData).promise;

    // Check first page for text
    const page = await pdfDocument.getPage(1);
    const textContent = await page.getTextContent();

    // If very little text, likely a scanned document
    const textLength = textContent.items
      .map((item: any) => item.str || '')
      .join('')
      .trim()
      .length;

    return textLength < 100; // Less than 100 chars suggests scanned PDF
  } catch {
    return true; // Assume OCR needed if we can't check
  }
}

/**
 * Get PDF page count
 */
export async function getPdfPageCount(pdfData: ArrayBuffer | Uint8Array): Promise<number> {
  const pdfjs = await loadPdfJs();
  const pdfDocument = await pdfjs.getDocument(pdfData).promise;
  return pdfDocument.numPages;
}
