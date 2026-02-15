/**
 * CAMT.053 (ISO 20022) Bank Statement Parser
 * Parses ISO 20022 camt.053 XML bank-to-customer account statements.
 * Mandatory in EU since Nov 2025, growing worldwide adoption.
 *
 * Key XML structure:
 *   <Document> → <BkToCstmrStmt> → <Stmt> → <Ntry> (entries/transactions)
 *   Each <Ntry> contains: <BookgDt>, <Amt>, <CdtDbtInd>, <NtryDtls>
 */

import type { ParsedTransaction } from '@/types/budget';
import { XMLParser } from 'fast-xml-parser';

export interface CAMT053ParseOptions {
  locale?: string;
}

export interface CAMT053Statement {
  id: string;
  accountId?: string;
  currency?: string;
  openingBalance?: { amount: number; currency: string; date: Date };
  closingBalance?: { amount: number; currency: string; date: Date };
  transactions: ParsedTransaction[];
}

/**
 * Parse a CAMT.053 XML file content into transactions.
 *
 * @param content - Raw XML content
 * @param options - Parsing options
 * @returns Array of parsed transactions
 */
export function parseCAMT053File(content: string, options: CAMT053ParseOptions = {}): ParsedTransaction[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    isArray: (name) => {
      // These elements can appear multiple times
      return ['Ntry', 'NtryDtls', 'TxDtls', 'Stmt', 'Bal'].includes(name);
    },
  });

  const parsed = parser.parse(content);

  // Navigate the XML structure
  const document = parsed.Document || parsed.document;
  if (!document) {
    console.error('[CAMT.053] No Document root element found');
    return [];
  }

  const stmtRoot = document.BkToCstmrStmt || document['BkToCstmrStmt'];
  if (!stmtRoot) {
    console.error('[CAMT.053] No BkToCstmrStmt element found');
    return [];
  }

  const statements = Array.isArray(stmtRoot.Stmt) ? stmtRoot.Stmt : [stmtRoot.Stmt];
  const allTransactions: ParsedTransaction[] = [];

  for (const stmt of statements) {
    if (!stmt) continue;

    const statementCurrency = extractStatementCurrency(stmt);
    const entries = Array.isArray(stmt.Ntry) ? stmt.Ntry : (stmt.Ntry ? [stmt.Ntry] : []);

    for (const entry of entries) {
      if (!entry) continue;

      const transactions = parseEntry(entry, statementCurrency);
      allTransactions.push(...transactions);
    }
  }

  return allTransactions;
}

/**
 * Extract currency from statement (account identification or balance)
 */
function extractStatementCurrency(stmt: any): string | null {
  // Try from account identification
  const acct = stmt.Acct;
  if (acct?.Ccy) return acct.Ccy;

  // Try from balance entries
  const balances = Array.isArray(stmt.Bal) ? stmt.Bal : (stmt.Bal ? [stmt.Bal] : []);
  for (const bal of balances) {
    if (bal?.Amt?.['@_Ccy']) return bal.Amt['@_Ccy'];
  }

  return null;
}

/**
 * Parse a single <Ntry> (entry) element into one or more transactions.
 * An entry can contain multiple transaction details.
 */
function parseEntry(entry: any, statementCurrency: string | null): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  // Basic entry fields
  const amount = parseEntryAmount(entry);
  const isCredit = entry.CdtDbtInd === 'CRDT';
  const date = parseEntryDate(entry);
  const currency = entry.Amt?.['@_Ccy'] || statementCurrency || undefined;
  const balance = parseFloat(entry.Bal?.Amt?.['#text'] || entry.Bal?.Amt || '0') || undefined;

  // Try to get transaction details from NtryDtls > TxDtls
  const entryDetails = getArray(entry.NtryDtls);
  let hasDetailTransactions = false;

  for (const detail of entryDetails) {
    const txDetails = getArray(detail.TxDtls);

    for (const txDetail of txDetails) {
      hasDetailTransactions = true;
      const detailAmount = parseTxDetailAmount(txDetail) || amount;
      const detailIsCredit = txDetail.CdtDbtInd ? txDetail.CdtDbtInd === 'CRDT' : isCredit;
      const description = buildEntryDescription(txDetail, entry);

      transactions.push({
        date: date || new Date(),
        description,
        amount: detailIsCredit ? Math.abs(detailAmount || 0) : -Math.abs(detailAmount || 0),
        isDuplicate: false,
        confidence: date && detailAmount !== null ? 0.95 : 0.6,
        currency,
        transactionType: detailIsCredit ? 'CREDIT' : 'DEBIT',
        sourceFormat: 'camt053',
        balance,
        fitid: extractEndToEndId(txDetail),
        requiresReview: !date || detailAmount === null,
      });
    }
  }

  // If no detail transactions found, create one from the entry itself
  if (!hasDetailTransactions && amount !== null) {
    const description = buildEntryDescription(entry, entry);

    transactions.push({
      date: date || new Date(),
      description,
      amount: isCredit ? Math.abs(amount) : -Math.abs(amount),
      isDuplicate: false,
      confidence: date ? 0.9 : 0.5,
      currency,
      transactionType: isCredit ? 'CREDIT' : 'DEBIT',
      sourceFormat: 'camt053',
      balance,
      requiresReview: !date,
    });
  }

  return transactions;
}

/**
 * Parse amount from entry's Amt element
 */
function parseEntryAmount(entry: any): number | null {
  const amt = entry.Amt;
  if (!amt) return null;

  // Amt can be { '#text': '1234.56', '@_Ccy': 'EUR' } or just a string/number
  const value = typeof amt === 'object' ? amt['#text'] || amt : amt;
  const num = parseFloat(String(value).replace(',', '.'));
  return isNaN(num) ? null : num;
}

/**
 * Parse amount from TxDtls element
 */
function parseTxDetailAmount(txDetail: any): number | null {
  const amt = txDetail.Amt || txDetail.AmtDtls?.TxAmt?.Amt;
  if (!amt) return null;

  const value = typeof amt === 'object' ? amt['#text'] || amt : amt;
  const num = parseFloat(String(value).replace(',', '.'));
  return isNaN(num) ? null : num;
}

/**
 * Parse date from entry's BookgDt or ValDt
 */
function parseEntryDate(entry: any): Date | null {
  // Prefer booking date, fall back to value date
  const dateStr = entry.BookgDt?.Dt || entry.ValDt?.Dt || entry.BookgDt?.DtTm || entry.ValDt?.DtTm;

  if (!dateStr) return null;

  // ISO format: 2025-01-15 or 2025-01-15T12:00:00
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Build description from entry and transaction detail fields
 */
function buildEntryDescription(txDetail: any, entry: any): string {
  const parts: string[] = [];

  // Creditor/Debtor name (most readable)
  const creditor = txDetail.RltdPties?.Cdtr?.Nm || txDetail.RltdPties?.Cdtr?.CtctDtls?.Nm;
  const debtor = txDetail.RltdPties?.Dbtr?.Nm || txDetail.RltdPties?.Dbtr?.CtctDtls?.Nm;

  if (creditor) parts.push(creditor);
  else if (debtor) parts.push(debtor);

  // Remittance information (payment reference)
  const rmtInf = txDetail.RmtInf;
  if (rmtInf) {
    if (typeof rmtInf.Ustrd === 'string') {
      parts.push(rmtInf.Ustrd);
    } else if (Array.isArray(rmtInf.Ustrd)) {
      parts.push(rmtInf.Ustrd.join(' '));
    }
    if (rmtInf.Strd?.CdtrRefInf?.Ref) {
      parts.push(`Ref: ${rmtInf.Strd.CdtrRefInf.Ref}`);
    }
  }

  // Additional entry information
  if (entry.AddtlNtryInf && !parts.length) {
    parts.push(entry.AddtlNtryInf);
  }

  // Additional transaction information
  if (txDetail.AddtlTxInf && !parts.length) {
    parts.push(txDetail.AddtlTxInf);
  }

  const description = parts.join(' - ').replace(/\s+/g, ' ').trim();
  return description || 'Unknown Transaction';
}

/**
 * Extract end-to-end ID for duplicate detection
 */
function extractEndToEndId(txDetail: any): string | undefined {
  return txDetail.Refs?.EndToEndId || txDetail.Refs?.TxId || undefined;
}

/**
 * Safely get an array from a value that may be an array, object, or undefined
 */
function getArray(value: any): any[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

/**
 * Detect if content is a CAMT.053 file.
 */
export function isCAMT053Content(content: string): boolean {
  return content.includes('urn:iso:std:iso:20022:tech:xsd:camt.053') ||
    (content.includes('<Document') && content.includes('<BkToCstmrStmt'));
}
