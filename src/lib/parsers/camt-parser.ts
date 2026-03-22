/**
 * ISO 20022 CAMT Parser — Unified parser for CAMT.052, CAMT.053, and CAMT.054
 *
 * - CAMT.052: Bank-to-Customer Account Report (intraday balances & transactions)
 * - CAMT.053: Bank-to-Customer Statement (end-of-day, mandatory EU Nov 2025+)
 * - CAMT.054: Bank-to-Customer Debit/Credit Notification (real-time alerts)
 *
 * All three share the same <Ntry> transaction structure — the only difference is:
 * - CAMT.052/053: <BkToCstmrAcctRpt>/<BkToCstmrStmt> → <Rpt>/<Stmt> → <Ntry>
 * - CAMT.054: <BkToCstmrDbtCdtNtfctn> → <Ntfctn> → <Ntry>
 */

import type { ParsedTransaction } from "./types";
import { XMLParser } from "fast-xml-parser";

export type CAMTVariant = "camt052" | "camt053" | "camt054";

export interface CAMTParseOptions {
  locale?: string;
  /** Force a specific variant instead of auto-detecting */
  variant?: CAMTVariant;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse any CAMT file (auto-detects variant).
 */
export function parseCAMTFile(
  content: string,
  options: CAMTParseOptions = {}
): ParsedTransaction[] {
  const variant = options.variant ?? detectCAMTVariant(content);
  if (!variant) {
    console.error("[CAMT] Could not detect CAMT variant from content");
    return [];
  }

  const parsed = createXMLParser().parse(content);
  const document = parsed.Document || parsed.document;
  if (!document) {
    console.error("[CAMT] No Document root element found");
    return [];
  }

  const entries = extractEntries(document, variant);
  return entries;
}

/**
 * Parse a CAMT.052 (intraday report) file.
 */
export function parseCAMT052File(
  content: string,
  options: CAMTParseOptions = {}
): ParsedTransaction[] {
  return parseCAMTFile(content, { ...options, variant: "camt052" });
}

/**
 * Parse a CAMT.053 (end-of-day statement) file.
 * Re-export for backward compatibility with existing camt053-parser.ts consumers.
 */
export function parseCAMT053File(
  content: string,
  options: CAMTParseOptions = {}
): ParsedTransaction[] {
  return parseCAMTFile(content, { ...options, variant: "camt053" });
}

/**
 * Parse a CAMT.054 (debit/credit notification) file.
 */
export function parseCAMT054File(
  content: string,
  options: CAMTParseOptions = {}
): ParsedTransaction[] {
  return parseCAMTFile(content, { ...options, variant: "camt054" });
}

/**
 * Detect which CAMT variant a file is.
 */
export function detectCAMTVariant(content: string): CAMTVariant | null {
  if (content.includes("camt.052") || content.includes("<BkToCstmrAcctRpt")) {
    return "camt052";
  }
  if (content.includes("camt.053") || content.includes("<BkToCstmrStmt")) {
    return "camt053";
  }
  if (content.includes("camt.054") || content.includes("<BkToCstmrDbtCdtNtfctn")) {
    return "camt054";
  }
  return null;
}

/**
 * Detect if content is any CAMT format.
 */
export function isCAMTContent(content: string): boolean {
  return detectCAMTVariant(content) !== null;
}

// ---------------------------------------------------------------------------
// Internal — XML parsing
// ---------------------------------------------------------------------------

function createXMLParser(): XMLParser {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    isArray: (name) =>
      ["Ntry", "NtryDtls", "TxDtls", "Stmt", "Rpt", "Ntfctn", "Bal"].includes(name),
  });
}

// ---------------------------------------------------------------------------
// Internal — entry extraction per variant
// ---------------------------------------------------------------------------

const VARIANT_CONFIG: Record<
  CAMTVariant,
  { rootElement: string; containerElement: string; sourceFormat: string }
> = {
  camt052: {
    rootElement: "BkToCstmrAcctRpt",
    containerElement: "Rpt",
    sourceFormat: "camt053", // Use camt053 as sourceFormat since the type union doesn't include camt052
  },
  camt053: {
    rootElement: "BkToCstmrStmt",
    containerElement: "Stmt",
    sourceFormat: "camt053",
  },
  camt054: {
    rootElement: "BkToCstmrDbtCdtNtfctn",
    containerElement: "Ntfctn",
    sourceFormat: "camt053",
  },
};

function extractEntries(document: any, variant: CAMTVariant): ParsedTransaction[] {
  const config = VARIANT_CONFIG[variant];
  const root = document[config.rootElement];
  if (!root) {
    console.error(`[CAMT] No ${config.rootElement} element found`);
    return [];
  }

  const containers = getArray(root[config.containerElement]);
  const allTransactions: ParsedTransaction[] = [];

  for (const container of containers) {
    if (!container) continue;

    const statementCurrency = extractStatementCurrency(container);
    const entries = getArray(container.Ntry);

    for (const entry of entries) {
      if (!entry) continue;
      const transactions = parseEntry(entry, statementCurrency, config.sourceFormat);
      allTransactions.push(...transactions);
    }
  }

  return allTransactions;
}

// ---------------------------------------------------------------------------
// Internal — shared parsing logic (identical across all CAMT variants)
// ---------------------------------------------------------------------------

function extractStatementCurrency(container: any): string | null {
  const acct = container.Acct;
  if (acct?.Ccy) return acct.Ccy;

  const balances = getArray(container.Bal);
  for (const bal of balances) {
    if (bal?.Amt?.["@_Ccy"]) return bal.Amt["@_Ccy"];
  }

  return null;
}

function parseEntry(
  entry: any,
  statementCurrency: string | null,
  sourceFormat: string
): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  const amount = parseEntryAmount(entry);
  const isCredit = entry.CdtDbtInd === "CRDT";
  const date = parseEntryDate(entry);
  const currency = entry.Amt?.["@_Ccy"] || statementCurrency || undefined;
  const balance = parseFloat(entry.Bal?.Amt?.["#text"] || entry.Bal?.Amt || "0") || undefined;

  const entryDetails = getArray(entry.NtryDtls);
  let hasDetailTransactions = false;

  for (const detail of entryDetails) {
    const txDetails = getArray(detail.TxDtls);

    for (const txDetail of txDetails) {
      hasDetailTransactions = true;
      const detailAmount = parseTxDetailAmount(txDetail) || amount;
      const detailIsCredit = txDetail.CdtDbtInd ? txDetail.CdtDbtInd === "CRDT" : isCredit;
      const description = buildEntryDescription(txDetail, entry);

      transactions.push({
        date: date || new Date(),
        description,
        amount: detailIsCredit ? Math.abs(detailAmount || 0) : -Math.abs(detailAmount || 0),
        isDuplicate: false,
        confidence: date && detailAmount !== null ? 0.95 : 0.6,
        currency,
        transactionType: detailIsCredit ? "CREDIT" : "DEBIT",
        sourceFormat: sourceFormat as ParsedTransaction["sourceFormat"],
        balance,
        fitid: extractEndToEndId(txDetail),
        requiresReview: !date || detailAmount === null,
      });
    }
  }

  if (!hasDetailTransactions && amount !== null) {
    const description = buildEntryDescription(entry, entry);

    transactions.push({
      date: date || new Date(),
      description,
      amount: isCredit ? Math.abs(amount) : -Math.abs(amount),
      isDuplicate: false,
      confidence: date ? 0.9 : 0.5,
      currency,
      transactionType: isCredit ? "CREDIT" : "DEBIT",
      sourceFormat: sourceFormat as ParsedTransaction["sourceFormat"],
      balance,
      requiresReview: !date,
    });
  }

  return transactions;
}

function parseEntryAmount(entry: any): number | null {
  const amt = entry.Amt;
  if (!amt) return null;
  const value = typeof amt === "object" ? amt["#text"] || amt : amt;
  const num = parseFloat(String(value).replace(",", "."));
  return isNaN(num) ? null : num;
}

function parseTxDetailAmount(txDetail: any): number | null {
  const amt = txDetail.Amt || txDetail.AmtDtls?.TxAmt?.Amt;
  if (!amt) return null;
  const value = typeof amt === "object" ? amt["#text"] || amt : amt;
  const num = parseFloat(String(value).replace(",", "."));
  return isNaN(num) ? null : num;
}

function parseEntryDate(entry: any): Date | null {
  const dateStr = entry.BookgDt?.Dt || entry.ValDt?.Dt || entry.BookgDt?.DtTm || entry.ValDt?.DtTm;
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

function buildEntryDescription(txDetail: any, entry: any): string {
  const parts: string[] = [];

  const creditor = txDetail.RltdPties?.Cdtr?.Nm || txDetail.RltdPties?.Cdtr?.CtctDtls?.Nm;
  const debtor = txDetail.RltdPties?.Dbtr?.Nm || txDetail.RltdPties?.Dbtr?.CtctDtls?.Nm;

  if (creditor) parts.push(creditor);
  else if (debtor) parts.push(debtor);

  const rmtInf = txDetail.RmtInf;
  if (rmtInf) {
    if (typeof rmtInf.Ustrd === "string") {
      parts.push(rmtInf.Ustrd);
    } else if (Array.isArray(rmtInf.Ustrd)) {
      parts.push(rmtInf.Ustrd.join(" "));
    }
    if (rmtInf.Strd?.CdtrRefInf?.Ref) {
      parts.push(`Ref: ${rmtInf.Strd.CdtrRefInf.Ref}`);
    }
  }

  if (entry.AddtlNtryInf && !parts.length) {
    parts.push(entry.AddtlNtryInf);
  }

  if (txDetail.AddtlTxInf && !parts.length) {
    parts.push(txDetail.AddtlTxInf);
  }

  const description = parts.join(" - ").replace(/\s+/g, " ").trim();
  return description || "Unknown Transaction";
}

function extractEndToEndId(txDetail: any): string | undefined {
  return txDetail.Refs?.EndToEndId || txDetail.Refs?.TxId || undefined;
}

function getArray(value: any): any[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}
