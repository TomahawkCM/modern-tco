/**
 * MT940 (SWIFT) Bank Statement Parser
 * Parses MT940/SWIFT bank statement format, widely used in Europe and internationally.
 *
 * MT940 uses tagged fields:
 *   :20:  Transaction reference
 *   :25:  Account identification
 *   :28C: Statement number/sequence
 *   :60F: Opening balance
 *   :61:  Statement line (transaction)
 *   :86:  Information to account owner (description)
 *   :62F: Closing balance
 */

import type { ParsedTransaction } from '@/types/budget';

export interface MT940ParseOptions {
  locale?: string;
}

/**
 * Parse an MT940 file content into transactions.
 * Uses mt940-js library with a fallback to manual parsing.
 *
 * @param content - Raw MT940 file content
 * @returns Array of parsed transactions
 */
export async function parseMT940File(content: string, options: MT940ParseOptions = {}): Promise<ParsedTransaction[]> {
  try {
    const mt940 = await import('mt940-js');

    // mt940-js expects ArrayBuffer — convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const buffer = encoder.encode(content).buffer;

    const statements = await mt940.read(buffer);
    const transactions: ParsedTransaction[] = [];

    for (const statement of statements) {
      const currency = statement.openingBalance?.currency
        || statement.closingBalance?.currency
        || null;

      if (statement.transactions) {
        for (const tx of statement.transactions) {
          const date = parseTransactionDate(tx.valueDate || tx.entryDate);
          const amount = tx.isCredit ? Math.abs(tx.amount) : -Math.abs(tx.amount);

          const parts: string[] = [];
          if (tx.description) parts.push(tx.description);
          if (tx.customerReference) parts.push(tx.customerReference);
          if (tx.bankReference) parts.push(tx.bankReference);
          const description = parts.join(' ').replace(/\s+/g, ' ').trim() || 'Unknown Transaction';

          transactions.push({
            date: date || new Date(),
            description,
            amount,
            isDuplicate: false,
            confidence: date ? 0.95 : 0.6,
            currency: currency || undefined,
            transactionType: tx.isCredit ? 'CREDIT' : 'DEBIT',
            sourceFormat: 'mt940',
            requiresReview: !date,
          });
        }
      }
    }

    return transactions;
  } catch (error) {
    console.error('[MT940 Parser] Library failed, using manual parser:', error);
    return parseMT940Manual(content);
  }
}

/**
 * Parse date from MT940 date format (YYMMDD or YYYYMMDD)
 */
function parseTransactionDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;

  // YYMMDD format
  if (/^\d{6}$/.test(dateStr)) {
    const year = 2000 + parseInt(dateStr.substring(0, 2));
    const month = parseInt(dateStr.substring(2, 4)) - 1;
    const day = parseInt(dateStr.substring(4, 6));
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  // YYYYMMDD format
  if (/^\d{8}$/.test(dateStr)) {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  // Try native parsing
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Manual fallback parser for MT940 files when the library fails.
 * Parses the raw SWIFT tag structure directly.
 */
function parseMT940Manual(content: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const lines = content.split(/\r?\n/);
  let currency: string | null = null;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Extract currency from opening balance :60F:
    const balanceMatch = line.match(/:60F?:([CD])(\d{6})([A-Z]{3})([\d,]+)/);
    if (balanceMatch) {
      currency = balanceMatch[3];
      i++;
      continue;
    }

    // Parse transaction :61: field
    // Format: :61:YYMMDDYYMMDD[CD]Amount[S]TypeRef
    const txMatch = line.match(/:61:(\d{6})(\d{4})?([CD]R?)([\d,]+)([A-Z]\d{3})(.+)?/);
    if (txMatch) {
      const dateStr = txMatch[1];
      const isCredit = txMatch[3].startsWith('C');
      const amountStr = txMatch[4].replace(',', '.');
      const amount = parseFloat(amountStr);
      const date = parseTransactionDate(dateStr);
      const ref = txMatch[6]?.trim() || '';

      // Look for :86: description on next lines
      let description = ref;
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith(':86:')) {
        description += ' ' + lines[j].substring(4).trim();
        j++;
      }
      // Also append continuation lines (not starting with :)
      while (j < lines.length && !lines[j].startsWith(':') && lines[j].trim().length > 0) {
        description += ' ' + lines[j].trim();
        j++;
      }

      transactions.push({
        date: date || new Date(),
        description: description.replace(/\s+/g, ' ').trim() || 'Unknown Transaction',
        amount: isCredit ? Math.abs(amount) : -Math.abs(amount),
        isDuplicate: false,
        confidence: date ? 0.85 : 0.5,
        currency: currency || undefined,
        transactionType: isCredit ? 'CREDIT' : 'DEBIT',
        sourceFormat: 'mt940',
        requiresReview: !date || isNaN(amount),
      });

      i = j;
      continue;
    }

    i++;
  }

  return transactions;
}

/**
 * Detect if content is an MT940 file.
 */
export function isMT940Content(content: string): boolean {
  return content.includes(':20:') && (content.includes(':60F:') || content.includes(':61:'));
}
