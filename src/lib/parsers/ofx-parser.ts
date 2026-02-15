/**
 * OFX/QFX Parser Module
 * Parses Open Financial Exchange (OFX) files from banks and credit card companies
 * Supports both OFX 1.x (SGML) and OFX 2.x (XML) formats
 */

import { XMLParser } from "fast-xml-parser";
import { parse, format } from "date-fns";
import type {
  OFXData,
  OFXTransaction,
  OFXAccountInfo,
  OFXBalances,
  ParsedTransaction,
} from "@/types/budget";

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
  const cleanDate = dateStr.split(".")[0].split("+")[0].split("-")[0];

  // Pad to full datetime if only date provided
  const paddedDate = cleanDate.padEnd(14, "0");

  // Parse YYYYMMDDHHmmss format
  try {
    return parse(paddedDate, "yyyyMMddHHmmss", new Date());
  } catch (error) {
    throw new Error(`Failed to parse OFX date: ${dateStr}`);
  }
}

/**
 * Extract transactions from parsed OFX XML
 */
function extractTransactionsFromXML(xml: any): OFXTransaction[] {
  const transactions: OFXTransaction[] = [];

  // Navigate to STMTTRN (statement transactions) array
  const stmttrn =
    xml?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN ||
    xml?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST?.STMTTRN ||
    [];

  // Ensure it's an array (single transaction might not be in array)
  const txnArray = Array.isArray(stmttrn) ? stmttrn : [stmttrn];

  for (const txn of txnArray) {
    if (!txn?.FITID) continue; // Skip invalid transactions

    transactions.push({
      TRNTYPE: txn.TRNTYPE || "OTHER",
      DTPOSTED: txn.DTPOSTED,
      TRNAMT: txn.TRNAMT,
      FITID: txn.FITID,
      NAME: txn.NAME,
      MEMO: txn.MEMO,
      CHECKNUM: txn.CHECKNUM,
    });
  }

  return transactions;
}

/**
 * Extract account information from parsed OFX XML
 */
function extractAccountInfo(xml: any): OFXAccountInfo {
  // Try bank account first, then credit card
  const bankacctfrom = xml?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKACCTFROM;
  const ccacctfrom = xml?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.CCACCTFROM;

  const acctInfo = bankacctfrom || ccacctfrom;

  if (!acctInfo) {
    throw new Error("Account information not found in OFX file");
  }

  return {
    BANKID: acctInfo.BANKID,
    ACCTID: acctInfo.ACCTID || acctInfo.CCACCTID,
    ACCTTYPE: acctInfo.ACCTTYPE || "CREDITCARD",
  };
}

/**
 * Extract balance information from parsed OFX XML
 */
function extractBalances(xml: any): OFXBalances {
  const ledgerbal =
    xml?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.LEDGERBAL ||
    xml?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.LEDGERBAL;

  const availbal =
    xml?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.AVAILBAL ||
    xml?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.AVAILBAL;

  if (!ledgerbal) {
    throw new Error("Balance information not found in OFX file");
  }

  return {
    ledgerBalance: parseFloat(ledgerbal.BALAMT),
    ledgerDate: parseOFXDate(ledgerbal.DTASOF),
    availableBalance: availbal ? parseFloat(availbal.BALAMT) : undefined,
    availableDate: availbal ? parseOFXDate(availbal.DTASOF) : undefined,
  };
}

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

  // Parse XML
  const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false, // Keep values as strings for manual parsing
    trimValues: true,
  });

  let parsed: any;
  try {
    parsed = parser.parse(xmlContent);
  } catch (error) {
    throw new Error(`Failed to parse OFX XML: ${error}`);
  }

  // Extract currency code
  const currency =
    parsed?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.CURDEF ||
    parsed?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.CURDEF ||
    "USD";

  // Extract date range
  const banktranlist =
    parsed?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST ||
    parsed?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST;

  const dateStart = banktranlist?.DTSTART ? parseOFXDate(banktranlist.DTSTART) : undefined;
  const dateEnd = banktranlist?.DTEND ? parseOFXDate(banktranlist.DTEND) : undefined;

  // Build OFXData structure
  const ofxData: OFXData = {
    version: variant === "ofx2" ? "2.x" : "1.x",
    currency,
    accountInfo: extractAccountInfo(parsed),
    transactions: extractTransactionsFromXML(parsed),
    balances: extractBalances(parsed),
    dateStart,
    dateEnd,
  };

  return ofxData;
}

/**
 * Map single OFX transaction to ParsedTransaction format
 */
export function mapOFXTransaction(stmttrn: OFXTransaction, accountId: string): ParsedTransaction {
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
    isDuplicate: false, // Will be checked later
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
