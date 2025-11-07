/**
 * Receipt OCR Utilities
 * Phase 7.3.1: Extract text from receipt images using Tesseract.js
 * Parses merchant, date, and amount from receipt text
 */

import Tesseract from 'tesseract.js';

export interface ExtractedReceiptData {
  merchant: string | null;
  amount: number | null;
  date: Date | null;
  rawText: string;
  confidence: number; // 0-1
}

/**
 * Extract text and parse data from a receipt image
 * @param file - Image file (JPG, PNG) to process
 * @returns Extracted receipt data with confidence score
 */
export async function extractReceiptData(file: File): Promise<ExtractedReceiptData> {
  try {
    // Perform OCR on the image
    const result = await Tesseract.recognize(
      file,
      'eng'
    );

    const rawText = result.data.text;
    const confidence = result.data.confidence / 100; // Convert to 0-1 scale

    // Parse merchant, amount, and date from the text
    const merchant = extractMerchant(rawText);
    const amount = extractAmount(rawText);
    const date = extractDate(rawText);

    return {
      merchant,
      amount,
      date,
      rawText,
      confidence,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    return {
      merchant: null,
      amount: null,
      date: null,
      rawText: '',
      confidence: 0,
    };
  }
}

/**
 * Extract merchant name from receipt text
 * Looks for all-caps text at the top (common receipt pattern)
 */
function extractMerchant(text: string): string | null {
  // Split by lines and look at the first 5 lines
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();

    // Look for all-caps words (common for merchant names)
    // Must be at least 3 characters and mostly letters
    if (line.length >= 3 && /^[A-Z\s&'-]+$/.test(line)) {
      // Filter out common receipt keywords
      const keywords = ['RECEIPT', 'INVOICE', 'BILL', 'TOTAL', 'SUBTOTAL', 'TAX', 'DATE', 'TIME'];
      const isKeyword = keywords.some(kw => line.includes(kw));

      if (!isKeyword) {
        return line;
      }
    }
  }

  // Fallback: Look for lines with length 3-40 characters at the top
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length >= 3 && line.length <= 40) {
      return line;
    }
  }

  return null;
}

/**
 * Extract amount from receipt text
 * Looks for currency patterns like $12.34 or 12.34
 */
function extractAmount(text: string): number | null {
  // Look for common total patterns
  const totalPatterns = [
    /TOTAL[\s:]*\$?([\d,]+\.\d{2})/i,
    /AMOUNT[\s:]*\$?([\d,]+\.\d{2})/i,
    /BALANCE[\s:]*\$?([\d,]+\.\d{2})/i,
    /GRAND TOTAL[\s:]*\$?([\d,]+\.\d{2})/i,
  ];

  // Try to find total amount first
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  // Fallback: Find all currency amounts and take the largest
  const currencyPattern = /\$?([\d,]+\.\d{2})/g;
  const matches = [...text.matchAll(currencyPattern)];

  if (matches.length > 0) {
    const amounts = matches
      .map(m => parseFloat(m[1].replace(/,/g, '')))
      .filter(n => !isNaN(n) && n > 0);

    if (amounts.length > 0) {
      // Return the largest amount (likely to be the total)
      return Math.max(...amounts);
    }
  }

  return null;
}

/**
 * Extract date from receipt text
 * Looks for various date formats
 */
function extractDate(text: string): Date | null {
  // Common date patterns on receipts
  const datePatterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // YYYY/MM/DD or YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    // Month DD, YYYY (e.g., Jan 15, 2025)
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
    // DD Month YYYY (e.g., 15 Jan 2025)
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Try to parse the date
        let date: Date | null = null;

        if (pattern === datePatterns[0]) {
          // MM/DD/YYYY
          const [, month, day, year] = match;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (pattern === datePatterns[1]) {
          // YYYY/MM/DD
          const [, year, month, day] = match;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (pattern === datePatterns[2]) {
          // Month DD, YYYY
          const [, month, day, year] = match;
          const monthNum = getMonthNumber(month);
          if (monthNum !== null) {
            date = new Date(parseInt(year), monthNum, parseInt(day));
          }
        } else if (pattern === datePatterns[3]) {
          // DD Month YYYY
          const [, day, month, year] = match;
          const monthNum = getMonthNumber(month);
          if (monthNum !== null) {
            date = new Date(parseInt(year), monthNum, parseInt(day));
          }
        }

        // Validate the date
        if (date && !isNaN(date.getTime())) {
          // Ensure date is not in the future and not too old (> 5 years)
          const now = new Date();
          const fiveYearsAgo = new Date();
          fiveYearsAgo.setFullYear(now.getFullYear() - 5);

          if (date <= now && date >= fiveYearsAgo) {
            return date;
          }
        }
      } catch {
        // Continue to next pattern
      }
    }
  }

  return null;
}

/**
 * Convert month name to number (0-11)
 */
function getMonthNumber(monthName: string): number | null {
  const months = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  const index = months.findIndex(m => monthName.toLowerCase().startsWith(m));
  return index !== -1 ? index : null;
}
