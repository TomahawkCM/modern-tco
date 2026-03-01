/**
 * OFX/QFX Parser Module
 * Parses Open Financial Exchange (OFX) files from banks and credit card companies
 * Supports both OFX 1.x (SGML) and OFX 2.x (XML) formats
 *
 * Ported from offline Budget App (src/lib/parsers/ofx-parser.ts)
 * Uses browser DOMParser instead of fast-xml-parser (not installed in online app)
 */

import { parse } from "date-fns";
import type {
  OFXData,
  OFXTransaction,
  OFXAccountInfo,
  OFXBalances,
  ParsedTransaction,
  ParsedOFXAccount,
} from "./types";

/**
 * Detect OFX file variant (1.x SGML vs 2.x XML)
 */
export function detectOFXVariant(content: string): "ofx1" | "ofx2" | "qfx" | null {
  const trimmed = content.trim();

  // OFX 2.x has XML declaration
  if (trimmed.startsWith("<?xml")) {
    return "ofx2";
  }

  // OFX 1.x has OFXHEADER tag
  if (trimmed.includes("OFXHEADER:") || trimmed.includes("<OFXHEADER>")) {
    return "ofx1";
  }

  // QFX is typically OFX 1.x from Quicken
  if (trimmed.includes("QFXHEADER:")) {
    return "qfx";
  }

  return null;
}

/**
 * Convert OFX 1.x SGML to OFX 2.x XML format
 * OFX 1.x uses SGML tags without closing tags, e.g., <TRNAMT>-50.00
 * We need to convert to proper XML: <TRNAMT>-50.00</TRNAMT>
 */
function convertOFX1ToXML(sgml: string): string {
  // Remove header section (everything before <OFX>)
  const ofxStart = sgml.indexOf("<OFX>");
  if (ofxStart === -1) {
    throw new Error("Invalid OFX 1.x file: <OFX> tag not found");
  }

  let xml = sgml.substring(ofxStart);

  // Add XML declaration
  xml = `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;

  // Convert SGML tags to proper XML by adding closing tags
  // Match patterns like <TAGNAME>VALUE where VALUE doesn't contain < or >
  // and the next character is either < or newline
  xml = xml.replace(/<([A-Z0-9]+)>([^<>\n]+)(?=\n|<)/g, "<$1>$2</$1>");

  return xml;
}

/**
 * Parse OFX date format: YYYYMMDDHHmmss[.XXX][+/-HHMM]
 * Examples:
 *   20250106120000 -> Jan 6, 2025 12:00:00
 *   20250106 -> Jan 6, 2025 00:00:00
 */
export function parseOFXDate(dateStr: string): Date {
  if (!dateStr) {
    throw new Error("OFX date string is empty");
  }

  // Remove timezone and fractional seconds if present
  // OFX dates: YYYYMMDDHHmmss[.XXX][+/-HHMM]
  let cleanDate = dateStr;
  // Remove fractional seconds (.XXX)
  const dotIdx = cleanDate.indexOf(".");
  if (dotIdx !== -1) cleanDate = cleanDate.substring(0, dotIdx);
  // Remove timezone (+HHMM or -HHMM) - only after 8+ digits
  const tzMatch = cleanDate.match(/^(\d{8,14})[+-]/);
  if (tzMatch) cleanDate = tzMatch[1]!;

  // Pad to full datetime if only date provided
  const paddedDate = cleanDate.padEnd(14, "0");

  // Parse YYYYMMDDHHmmss format
  try {
    return parse(paddedDate, "yyyyMMddHHmmss", new Date());
  } catch {
    throw new Error(`Failed to parse OFX date: ${dateStr}`);
  }
}

// ============================================================================
// DOMParser-based XML helpers
// ============================================================================

/**
 * Parse XML string using browser DOMParser
 */
function parseXML(xmlContent: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, "text/xml");

  // Check for parsing errors
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error(`Failed to parse OFX XML: ${parserError.textContent}`);
  }

  return doc;
}

/**
 * Get text content of an element by tag name (first match within parent)
 */
function getTagText(parent: Element | Document, tagName: string): string | null {
  const el = parent.getElementsByTagName(tagName)[0];
  return el?.textContent?.trim() ?? null;
}

/**
 * Get all elements matching a tag name within a parent
 */
function getElements(parent: Element | Document, tagName: string): Element[] {
  return Array.from(parent.getElementsByTagName(tagName));
}

// ============================================================================
// Extraction helpers
// ============================================================================

/**
 * Extract transactions from parsed OFX XML document
 */
function extractTransactionsFromDoc(doc: Document): OFXTransaction[] {
  const transactions: OFXTransaction[] = [];

  // Find all STMTTRN elements (bank + credit card)
  const stmttrns = getElements(doc, "STMTTRN");

  for (const txn of stmttrns) {
    const fitid = getTagText(txn, "FITID");
    if (!fitid) continue; // Skip invalid transactions

    transactions.push({
      TRNTYPE: getTagText(txn, "TRNTYPE") ?? "OTHER",
      DTPOSTED: getTagText(txn, "DTPOSTED") ?? "",
      TRNAMT: getTagText(txn, "TRNAMT") ?? "0",
      FITID: fitid,
      NAME: getTagText(txn, "NAME") ?? undefined,
      MEMO: getTagText(txn, "MEMO") ?? undefined,
      CHECKNUM: getTagText(txn, "CHECKNUM") ?? undefined,
    });
  }

  return transactions;
}

/**
 * Extract account information from parsed OFX XML document
 */
function extractAccountInfo(doc: Document): OFXAccountInfo {
  // Try bank account first, then credit card
  const bankacctfrom = doc.getElementsByTagName("BANKACCTFROM")[0];
  const ccacctfrom = doc.getElementsByTagName("CCACCTFROM")[0];

  const acctEl = bankacctfrom ?? ccacctfrom;

  if (!acctEl) {
    throw new Error("Account information not found in OFX file");
  }

  return {
    BANKID: getTagText(acctEl, "BANKID") ?? undefined,
    ACCTID: getTagText(acctEl, "ACCTID") ?? getTagText(acctEl, "CCACCTID") ?? "unknown",
    ACCTTYPE: getTagText(acctEl, "ACCTTYPE") ?? "CREDITCARD",
  };
}

/**
 * Extract balance information from parsed OFX XML document
 */
function extractBalances(doc: Document): OFXBalances {
  const ledgerbalEls = doc.getElementsByTagName("LEDGERBAL");
  const availbalEls = doc.getElementsByTagName("AVAILBAL");

  const ledgerbal = ledgerbalEls[0];
  const availbal = availbalEls[0];

  if (!ledgerbal) {
    throw new Error("Balance information not found in OFX file");
  }

  const ledgerBalAmt = getTagText(ledgerbal, "BALAMT");
  const ledgerDtasof = getTagText(ledgerbal, "DTASOF");

  return {
    ledgerBalance: parseFloat(ledgerBalAmt ?? "0"),
    ledgerDate: ledgerDtasof ? parseOFXDate(ledgerDtasof) : new Date(),
    availableBalance: availbal ? parseFloat(getTagText(availbal, "BALAMT") ?? "0") : undefined,
    availableDate:
      availbal && getTagText(availbal, "DTASOF")
        ? parseOFXDate(getTagText(availbal, "DTASOF")!)
        : undefined,
  };
}

// ============================================================================
// Main parsing functions
// ============================================================================

/**
 * Parse OFX file content and extract structured data
 */
export function parseOFXContent(content: string): OFXData {
  const variant = detectOFXVariant(content);

  if (!variant) {
    throw new Error("Unable to detect OFX format. File may be corrupted.");
  }

  // Convert OFX 1.x to XML if needed
  let xmlContent = content;
  if (variant === "ofx1" || variant === "qfx") {
    xmlContent = convertOFX1ToXML(content);
  }

  // Parse XML using DOMParser
  const doc = parseXML(xmlContent);

  // Extract currency code
  const currency = getTagText(doc, "CURDEF") ?? "USD";

  // Extract date range
  const banktranlist = doc.getElementsByTagName("BANKTRANLIST")[0];
  const dateStart =
    banktranlist && getTagText(banktranlist, "DTSTART")
      ? parseOFXDate(getTagText(banktranlist, "DTSTART")!)
      : undefined;
  const dateEnd =
    banktranlist && getTagText(banktranlist, "DTEND")
      ? parseOFXDate(getTagText(banktranlist, "DTEND")!)
      : undefined;

  // Build OFXData structure
  const ofxData: OFXData = {
    version: variant === "ofx2" ? "2.x" : "1.x",
    currency,
    accountInfo: extractAccountInfo(doc),
    transactions: extractTransactionsFromDoc(doc),
    balances: extractBalances(doc),
    dateStart,
    dateEnd,
  };

  return ofxData;
}

/**
 * Map single OFX transaction to ParsedTransaction format
 */
export function mapOFXTransaction(stmttrn: OFXTransaction, _accountId: string): ParsedTransaction {
  // Parse date
  const date = parseOFXDate(stmttrn.DTPOSTED);

  // Parse amount (OFX amounts are already signed: negative = debit, positive = credit)
  const amount = parseFloat(stmttrn.TRNAMT);

  // Build description from NAME and MEMO
  let description = "";
  if (stmttrn.NAME) {
    description = stmttrn.NAME;
  }
  if (stmttrn.MEMO && stmttrn.MEMO !== stmttrn.NAME) {
    description += description ? ` - ${stmttrn.MEMO}` : stmttrn.MEMO;
  }

  // Fallback if no description
  if (!description) {
    description = `${stmttrn.TRNTYPE} Transaction`;
  }

  return {
    date,
    description: description.trim(),
    amount,
    isDuplicate: false,
    confidence: 1.0, // FITID provides perfect duplicate detection
    fitid: stmttrn.FITID,
    checkNum: stmttrn.CHECKNUM,
    transactionType: stmttrn.TRNTYPE,
  };
}

/**
 * Extract transactions from OFXData and convert to ParsedTransaction[]
 */
export function extractTransactions(ofxData: OFXData, accountId: string): ParsedTransaction[] {
  return ofxData.transactions.map((txn) => mapOFXTransaction(txn, accountId));
}

/**
 * Main entry point: Parse OFX file and return transactions ready for import
 */
export async function parseOFXFile(
  fileContent: string,
  accountId: string
): Promise<{
  transactions: ParsedTransaction[];
  accountInfo: OFXAccountInfo;
  balances: OFXBalances;
  metadata: {
    version: string;
    currency: string;
    dateRange?: { start: Date; end: Date };
  };
}> {
  const ofxData = parseOFXContent(fileContent);
  const transactions = extractTransactions(ofxData, accountId);

  return {
    transactions,
    accountInfo: ofxData.accountInfo,
    balances: ofxData.balances,
    metadata: {
      version: ofxData.version,
      currency: ofxData.currency,
      dateRange:
        ofxData.dateStart && ofxData.dateEnd
          ? { start: ofxData.dateStart, end: ofxData.dateEnd }
          : undefined,
    },
  };
}

// ============================================================================
// Multi-Account OFX Support
// ============================================================================

/**
 * Parse an OFX file that may contain multiple account statements.
 * Some banks export multiple STMTTRNRS blocks in a single file.
 */
export function parseMultiAccountOFX(content: string): ParsedOFXAccount[] {
  const variant = detectOFXVariant(content);
  if (!variant) {
    throw new Error("Unable to detect OFX format. File may be corrupted.");
  }

  let xmlContent = content;
  if (variant === "ofx1" || variant === "qfx") {
    xmlContent = convertOFX1ToXML(content);
  }

  let doc: Document;
  try {
    doc = parseXML(xmlContent);
  } catch {
    // Try malformed recovery
    const recovered = recoverMalformedOFX(content);
    if (recovered) {
      doc = parseXML(recovered);
    } else {
      throw new Error("Failed to parse OFX XML and recovery failed");
    }
  }

  const accounts: ParsedOFXAccount[] = [];

  // Extract bank account statements (STMTTRNRS)
  const bankStmts = getElements(doc, "STMTTRNRS");
  for (const stmt of bankStmts) {
    const stmtrs = stmt.getElementsByTagName("STMTRS")[0];
    if (!stmtrs) continue;

    const acctFromEl = stmtrs.getElementsByTagName("BANKACCTFROM")[0];
    const tranListEl = stmtrs.getElementsByTagName("BANKTRANLIST")[0];
    const ledgerBalEl = stmtrs.getElementsByTagName("LEDGERBAL")[0];
    const availBalEl = stmtrs.getElementsByTagName("AVAILBAL")[0];
    const currency = getTagText(stmtrs, "CURDEF") ?? "USD";

    const txnEls = tranListEl ? getElements(tranListEl, "STMTTRN") : [];
    const transactions: OFXTransaction[] = txnEls
      .filter((txn) => getTagText(txn, "FITID"))
      .map((txn) => ({
        TRNTYPE: getTagText(txn, "TRNTYPE") ?? "OTHER",
        DTPOSTED: getTagText(txn, "DTPOSTED") ?? "",
        TRNAMT: getTagText(txn, "TRNAMT") ?? "0",
        FITID: getTagText(txn, "FITID")!,
        NAME: getTagText(txn, "NAME") ?? undefined,
        MEMO: getTagText(txn, "MEMO") ?? undefined,
        CHECKNUM: getTagText(txn, "CHECKNUM") ?? undefined,
      }));

    const accountId = acctFromEl ? (getTagText(acctFromEl, "ACCTID") ?? "unknown") : "unknown";
    accounts.push({
      accountInfo: {
        BANKID: acctFromEl ? (getTagText(acctFromEl, "BANKID") ?? undefined) : undefined,
        ACCTID: accountId,
        ACCTTYPE: acctFromEl ? (getTagText(acctFromEl, "ACCTTYPE") ?? "CHECKING") : "CHECKING",
      },
      transactions: transactions.map((txn) => mapOFXTransaction(txn, accountId)),
      balances: {
        ledgerBalance: ledgerBalEl ? parseFloat(getTagText(ledgerBalEl, "BALAMT") ?? "0") : 0,
        ledgerDate:
          ledgerBalEl && getTagText(ledgerBalEl, "DTASOF")
            ? parseOFXDate(getTagText(ledgerBalEl, "DTASOF")!)
            : new Date(),
        availableBalance: availBalEl
          ? parseFloat(getTagText(availBalEl, "BALAMT") ?? "0")
          : undefined,
        availableDate:
          availBalEl && getTagText(availBalEl, "DTASOF")
            ? parseOFXDate(getTagText(availBalEl, "DTASOF")!)
            : undefined,
      },
      currency,
    });
  }

  // Extract credit card statements (CCSTMTTRNRS)
  const ccStmts = getElements(doc, "CCSTMTTRNRS");
  for (const stmt of ccStmts) {
    const stmtrs = stmt.getElementsByTagName("CCSTMTRS")[0];
    if (!stmtrs) continue;

    const acctFromEl = stmtrs.getElementsByTagName("CCACCTFROM")[0];
    const tranListEl = stmtrs.getElementsByTagName("BANKTRANLIST")[0];
    const ledgerBalEl = stmtrs.getElementsByTagName("LEDGERBAL")[0];
    const currency = getTagText(stmtrs, "CURDEF") ?? "USD";

    const txnEls = tranListEl ? getElements(tranListEl, "STMTTRN") : [];
    const transactions: OFXTransaction[] = txnEls
      .filter((txn) => getTagText(txn, "FITID"))
      .map((txn) => ({
        TRNTYPE: getTagText(txn, "TRNTYPE") ?? "OTHER",
        DTPOSTED: getTagText(txn, "DTPOSTED") ?? "",
        TRNAMT: getTagText(txn, "TRNAMT") ?? "0",
        FITID: getTagText(txn, "FITID")!,
        NAME: getTagText(txn, "NAME") ?? undefined,
        MEMO: getTagText(txn, "MEMO") ?? undefined,
        CHECKNUM: getTagText(txn, "CHECKNUM") ?? undefined,
      }));

    const accountId = acctFromEl ? (getTagText(acctFromEl, "ACCTID") ?? "unknown") : "unknown";
    accounts.push({
      accountInfo: {
        ACCTID: accountId,
        ACCTTYPE: "CREDITCARD",
      },
      transactions: transactions.map((txn) => mapOFXTransaction(txn, accountId)),
      balances: {
        ledgerBalance: ledgerBalEl ? parseFloat(getTagText(ledgerBalEl, "BALAMT") ?? "0") : 0,
        ledgerDate:
          ledgerBalEl && getTagText(ledgerBalEl, "DTASOF")
            ? parseOFXDate(getTagText(ledgerBalEl, "DTASOF")!)
            : new Date(),
      },
      currency,
    });
  }

  // If no structured accounts found, fall back to single-account parsing
  if (accounts.length === 0) {
    const ofxData = parseOFXContent(content);
    accounts.push({
      accountInfo: ofxData.accountInfo,
      transactions: ofxData.transactions.map((txn) =>
        mapOFXTransaction(txn, ofxData.accountInfo.ACCTID)
      ),
      balances: ofxData.balances,
      currency: ofxData.currency,
    });
  }

  return accounts;
}

// ============================================================================
// Malformed OFX 1.x Recovery
// ============================================================================

/**
 * Attempt to recover transactions from malformed OFX 1.x files.
 * Some banks produce broken SGML (unclosed tags, missing OFXHEADER).
 * Falls back to regex extraction of transaction fields.
 */
function recoverMalformedOFX(content: string): string | null {
  try {
    // Check if <OFX> tag exists at all
    const ofxMatch = content.match(/<OFX>/i);
    if (!ofxMatch) return null;

    // Extract content from <OFX> onwards
    const ofxStart = content.indexOf(ofxMatch[0]);
    let xmlContent = content.substring(ofxStart);

    // Ensure closing tag
    if (!xmlContent.includes("</OFX>")) {
      xmlContent += "\n</OFX>";
    }

    // Add XML declaration
    xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`;

    // Convert SGML tags: <TAG>value -> <TAG>value</TAG>
    xmlContent = xmlContent.replace(/<([A-Z0-9]+)>([^<>\n]+)(?=\n|<)/g, "<$1>$2</$1>");

    return xmlContent;
  } catch {
    return null;
  }
}

/**
 * Validate OFX file before parsing
 */
export function validateOFXFile(content: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if file is empty
  if (!content || content.trim().length === 0) {
    errors.push("File is empty");
    return { isValid: false, errors };
  }

  // Detect variant
  const variant = detectOFXVariant(content);
  if (!variant) {
    errors.push("Unable to detect OFX format. Expected OFX 1.x, 2.x, or QFX.");
  }

  // Check for <OFX> tag
  if (!content.includes("<OFX>")) {
    errors.push("Missing <OFX> root tag");
  }

  // Check for transaction list
  if (!content.includes("STMTTRN") && !content.includes("CCSTMTTRN")) {
    errors.push("No transactions found in file");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
