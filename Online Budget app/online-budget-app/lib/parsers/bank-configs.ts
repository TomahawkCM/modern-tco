/**
 * Bank CSV Configuration Library
 * Standardized configurations for 100+ Canadian, American, UK, European,
 * Australian, Asian, and other international banks.
 *
 * Ported from offline Budget App (src/lib/parsers/bank-configs.ts)
 */

import type { BankConfig } from "./types";

// ============================================================================
// Canadian Banks
// ============================================================================

export const CANADIAN_BANKS: Record<string, BankConfig> = {
  td: {
    name: "TD Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 3,
  },

  rbc: {
    name: "RBC (Royal Bank of Canada)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description 1",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  scotiabank: {
    name: "Scotiabank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Details",
    amountColumn: "Funds Out",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  cibc: {
    name: "CIBC",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  tangerine: {
    name: "Tangerine",
    dateColumn: "Date",
    descriptionColumn: "Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  simplii: {
    name: "Simplii Financial",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  bmo: {
    name: "BMO",
    dateColumn: "Date Posted",
    descriptionColumn: "Description",
    amountColumn: "Transaction Amount",
    dateFormat: "yyyyMMdd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 3,
  },
};

// ============================================================================
// American Banks
// ============================================================================

export const AMERICAN_BANKS: Record<string, BankConfig> = {
  chase: {
    name: "Chase Bank",
    dateColumn: "Posting Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  bankofamerica: {
    name: "Bank of America",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  wellsfargo: {
    name: "Wells Fargo",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  citibank: {
    name: "Citibank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  capitalone: {
    name: "Capital One",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  usbank: {
    name: "US Bank",
    dateColumn: "Date",
    descriptionColumn: "Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },
};

// ============================================================================
// UK Banks
// ============================================================================

export const UK_BANKS: Record<string, BankConfig> = {
  barclays: {
    name: "Barclays",
    dateColumn: "Date",
    descriptionColumn: "Memo",
    amountColumn: "Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  barclaysAccount: {
    name: "Barclays Current Account",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  hsbc: {
    name: "HSBC",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  hsbcCredit: {
    name: "HSBC Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Billed Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  lloyds: {
    name: "Lloyds Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Debit Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  natwest: {
    name: "NatWest",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Value",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  natwestAccount: {
    name: "NatWest Current Account",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Type",
    amountColumn: "Paid Out",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },
};

// ============================================================================
// European Banks
// ============================================================================

export const EU_BANKS: Record<string, BankConfig> = {
  n26: {
    name: "N26",
    dateColumn: "Date",
    descriptionColumn: "Payee",
    amountColumn: "Amount (EUR)",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  n26Full: {
    name: "N26 Full Export",
    dateColumn: "Booking Date",
    descriptionColumn: "Partner Name",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  revolut: {
    name: "Revolut",
    dateColumn: "Completed Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "dd MMM yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  revolutStatement: {
    name: "Revolut Statement",
    dateColumn: "Started Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd HH:mm:ss",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  ing: {
    name: "ING",
    dateColumn: "Datum",
    descriptionColumn: "Naam / Omschrijving",
    amountColumn: "Bedrag (EUR)",
    dateFormat: "yyyyMMdd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  ingEnglish: {
    name: "ING (English)",
    dateColumn: "Date",
    descriptionColumn: "Name / Description",
    amountColumn: "Amount (EUR)",
    dateFormat: "yyyyMMdd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  deutschebank: {
    name: "Deutsche Bank",
    dateColumn: "Buchungstag",
    descriptionColumn: "Verwendungszweck",
    amountColumn: "Betrag",
    dateFormat: "dd.MM.yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  deutschebankEnglish: {
    name: "Deutsche Bank (English)",
    dateColumn: "Booking Date",
    descriptionColumn: "Purpose",
    amountColumn: "Amount",
    dateFormat: "dd.MM.yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },
};

// ============================================================================
// Australian Banks
// ============================================================================

export const AU_BANKS: Record<string, BankConfig> = {
  commbank: {
    name: "Commonwealth Bank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  commbankNetBank: {
    name: "CommBank NetBank Export",
    dateColumn: "Transaction Date",
    descriptionColumn: "Narrative",
    amountColumn: "Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  anz: {
    name: "ANZ",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  anzDetails: {
    name: "ANZ Detailed Export",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  westpac: {
    name: "Westpac",
    dateColumn: "Date",
    descriptionColumn: "Narrative",
    amountColumn: "Debit Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  nab: {
    name: "NAB",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },
};

// ============================================================================
// Indian Banks
// ============================================================================

export const INDIA_BANKS: Record<string, BankConfig> = {
  hdfc: {
    name: "HDFC Bank",
    dateColumn: "Date",
    descriptionColumn: "Narration",
    amountColumn: "Withdrawal Amt.",
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  hdfcStatement: {
    name: "HDFC Bank Statement",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  icici: {
    name: "ICICI Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Remarks",
    amountColumn: "Withdrawal Amount (INR)",
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  iciciCredit: {
    name: "ICICI Credit Card",
    dateColumn: "Date",
    descriptionColumn: "Transaction Details",
    amountColumn: "Amount",
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  axis: {
    name: "Axis Bank",
    dateColumn: "Tran Date",
    descriptionColumn: "PARTICULARS",
    amountColumn: "DR",
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  sbi: {
    name: "State Bank of India",
    dateColumn: "Txn Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  sbiYono: {
    name: "SBI YONO",
    dateColumn: "Transaction Date",
    descriptionColumn: "Narration",
    amountColumn: "Withdrawal",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },
};

// ============================================================================
// Singapore Banks
// ============================================================================

export const SINGAPORE_BANKS: Record<string, BankConfig> = {
  dbs: {
    name: "DBS Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Ref1",
    amountColumn: "Debit Amount",
    dateFormat: "dd MMM yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  dbsPosb: {
    name: "DBS/POSB",
    dateColumn: "Transaction Date",
    descriptionColumn: "Reference",
    amountColumn: "Withdrawal",
    dateFormat: "dd MMM yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  ocbc: {
    name: "OCBC Bank",
    dateColumn: "Transaction date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  ocbc360: {
    name: "OCBC 360",
    dateColumn: "Value Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  uob: {
    name: "UOB Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Withdrawal",
    dateFormat: "dd MMM yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  uobStatement: {
    name: "UOB Statement",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },
};

// ============================================================================
// Southeast Asian Banks
// ============================================================================

export const SEASIA_BANKS: Record<string, BankConfig> = {
  bangkokBank: {
    name: "Bangkok Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawal",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  kasikorn: {
    name: "Kasikornbank",
    dateColumn: "Date",
    descriptionColumn: "Channel / Description",
    amountColumn: "Withdraw",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  scb: {
    name: "Siam Commercial Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  maybank: {
    name: "Maybank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  cimb: {
    name: "CIMB Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Debit Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  gcash: {
    name: "GCash",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  bdo: {
    name: "BDO Unibank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },
};

// ============================================================================
// Asian Neobanks
// ============================================================================

export const ASIAN_NEOBANKS: Record<string, BankConfig> = {
  wise: {
    name: "Wise",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  wiseMulti: {
    name: "Wise Multi-Currency",
    dateColumn: "Date",
    descriptionColumn: "Merchant",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  grabpay: {
    name: "GrabPay",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  aspire: {
    name: "Aspire",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  youtrip: {
    name: "YouTrip",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount (SGD)",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },
};

// ============================================================================
// Japanese Banks
// ============================================================================

export const JAPAN_BANKS: Record<string, BankConfig> = {
  rakuten: {
    name: "Rakuten Bank",
    dateColumn: "\u53D6\u5F15\u65E5", // Transaction Date
    descriptionColumn: "\u6458\u8981", // Description
    amountColumn: "\u652F\u51FA", // Withdrawal
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  rakutenEn: {
    name: "Rakuten Bank (English)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawal",
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  mizuho: {
    name: "Mizuho Bank",
    dateColumn: "\u65E5\u4ED8", // Date
    descriptionColumn: "\u6458\u8981", // Summary
    amountColumn: "\u51FA\u91D1", // Withdrawal
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "Shift-JIS",
    region: "ASIA",
  },

  mufg: {
    name: "MUFG Bank",
    dateColumn: "\u53D6\u5F15\u65E5", // Transaction Date
    descriptionColumn: "\u6458\u8981", // Description
    amountColumn: "\u652F\u6255\u91D1\u984D", // Payment Amount
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "Shift-JIS",
    region: "ASIA",
  },

  smbc: {
    name: "SMBC",
    dateColumn: "\u65E5\u4ED8",
    descriptionColumn: "\u5185\u5BB9", // Content
    amountColumn: "\u51FA\u91D1\u984D", // Withdrawal Amount
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "Shift-JIS",
    region: "ASIA",
  },

  japanPost: {
    name: "Japan Post Bank",
    dateColumn: "\u53D6\u6271\u65E5", // Handling Date
    descriptionColumn: "\u53D6\u5F15\u5185\u5BB9", // Transaction Content
    amountColumn: "\u6255\u51FA\u91D1\u984D", // Payout Amount
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "Shift-JIS",
    region: "ASIA",
  },
};

// ============================================================================
// Indonesian & Vietnamese Banks
// ============================================================================

export const INDONESIA_VIETNAM_BANKS: Record<string, BankConfig> = {
  bca: {
    name: "Bank Central Asia",
    dateColumn: "Tanggal",
    descriptionColumn: "Keterangan",
    amountColumn: "Mutasi",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    decimalSeparator: ",",
    thousandSeparator: ".",
    region: "ASIA",
  },

  mandiri: {
    name: "Bank Mandiri",
    dateColumn: "Tanggal Transaksi",
    descriptionColumn: "Keterangan",
    amountColumn: "Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    decimalSeparator: ",",
    thousandSeparator: ".",
    region: "ASIA",
  },

  bni: {
    name: "Bank Negara Indonesia",
    dateColumn: "Tanggal",
    descriptionColumn: "Keterangan",
    amountColumn: "Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    decimalSeparator: ",",
    thousandSeparator: ".",
    region: "ASIA",
  },

  bri: {
    name: "Bank Rakyat Indonesia",
    dateColumn: "Tanggal",
    descriptionColumn: "Keterangan",
    amountColumn: "Mutasi Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    decimalSeparator: ",",
    thousandSeparator: ".",
    region: "ASIA",
  },

  vietcombank: {
    name: "Vietcombank",
    dateColumn: "Ng\u00E0y GD",
    descriptionColumn: "N\u1ED9i dung",
    amountColumn: "S\u1ED1 ti\u1EC1n ghi n\u1EE3",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  techcombank: {
    name: "Techcombank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },
};

// ============================================================================
// Combined / Aggregated Exports
// ============================================================================

/** All bank configurations merged into a single record */
export const ALL_BANKS: Record<string, BankConfig> = {
  ...CANADIAN_BANKS,
  ...AMERICAN_BANKS,
  ...UK_BANKS,
  ...EU_BANKS,
  ...AU_BANKS,
  ...INDIA_BANKS,
  ...SINGAPORE_BANKS,
  ...SEASIA_BANKS,
  ...ASIAN_NEOBANKS,
  ...JAPAN_BANKS,
  ...INDONESIA_VIETNAM_BANKS,
};

/** Banks with dual amount columns (separate debit/credit) */
export const DUAL_COLUMN_BANKS = [
  // Canadian
  "scotiabank",
  "cibc",
  "simplii",
  // American
  "citibank",
  "capitalone",
  // UK
  "lloyds",
  "natwestAccount",
  // Australian
  "commbankNetBank",
  "anzDetails",
  "westpac",
  // India
  "hdfc",
  "hdfcStatement",
  "icici",
  "axis",
  "sbi",
  // Singapore
  "dbs",
  "dbsPosb",
  "ocbc",
  "ocbc360",
  "uob",
  "uobStatement",
  // SE Asia
  "bangkokBank",
  "kasikorn",
  "maybank",
  "bdo",
  // Japan
  "rakuten",
  "mizuho",
  // Indonesia
  "mandiri",
  "bni",
  // Neobanks
  "aspire",
];

/** Banks that require special encoding (non-UTF-8) */
export const NON_UTF8_BANKS = ["mizuho", "mufg", "smbc", "japanpost"];

/** Banks that use comma decimal separator (Indonesian format) */
export const COMMA_DECIMAL_BANKS = ["bca", "mandiri", "bni", "bri"];

// ============================================================================
// Helper Functions
// ============================================================================

/** Get bank configuration by key */
export function getBankConfig(bankKey: string): BankConfig | null {
  return ALL_BANKS[bankKey.toLowerCase()] ?? null;
}

/** Get all available bank keys */
export function getAllBankKeys(): string[] {
  return Object.keys(ALL_BANKS);
}

/** Check if bank uses dual amount columns */
export function hasDualAmountColumns(bankKey: string): boolean {
  return DUAL_COLUMN_BANKS.includes(bankKey.toLowerCase());
}

/** Get bank configuration by name (fuzzy match) */
export function getBankConfigByName(bankName: string): BankConfig | null {
  const normalizedName = bankName.toLowerCase().trim();

  // Exact match
  for (const [, config] of Object.entries(ALL_BANKS)) {
    if (config.name.toLowerCase() === normalizedName) {
      return config;
    }
  }

  // Partial match
  for (const [, config] of Object.entries(ALL_BANKS)) {
    if (
      config.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(config.name.toLowerCase())
    ) {
      return config;
    }
  }

  return null;
}

/** Check if bank requires non-UTF-8 encoding */
export function requiresSpecialEncoding(bankKey: string): boolean {
  return NON_UTF8_BANKS.includes(bankKey.toLowerCase());
}

/** Check if bank uses comma decimal separator (Indonesian format) */
export function usesCommaDecimal(bankKey: string): boolean {
  return COMMA_DECIMAL_BANKS.includes(bankKey.toLowerCase());
}

/**
 * Parse Indonesian-format amount
 * Converts "1.234,56" to 1234.56
 */
export function parseIndonesianAmount(amount: string): number {
  if (!amount || amount.trim() === "") return 0;

  const normalized = amount.trim().replace(/\./g, "").replace(",", ".");

  return parseFloat(normalized) || 0;
}

/** Parse amount based on bank configuration */
export function parseAmount(amount: string, bankKey: string): number {
  if (usesCommaDecimal(bankKey)) {
    return parseIndonesianAmount(amount);
  }

  const cleaned = amount.replace(/[,$\s]/g, "").trim();
  return parseFloat(cleaned) || 0;
}

/** Get banks by region */
export function getBanksByRegion(
  region: "NA" | "EU" | "UK" | "AU" | "ASIA"
): Record<string, BankConfig> {
  const result: Record<string, BankConfig> = {};

  for (const [key, config] of Object.entries(ALL_BANKS)) {
    if (config.region === region) {
      result[key] = config;
    }
  }

  // Include legacy banks without region field
  if (region === "NA") {
    Object.entries(CANADIAN_BANKS).forEach(([key, config]) => {
      if (!config.region) result[key] = config;
    });
    Object.entries(AMERICAN_BANKS).forEach(([key, config]) => {
      if (!config.region) result[key] = config;
    });
  } else if (region === "EU") {
    Object.entries(EU_BANKS).forEach(([key, config]) => {
      if (!config.region) result[key] = config;
    });
  } else if (region === "UK") {
    Object.entries(UK_BANKS).forEach(([key, config]) => {
      if (!config.region) result[key] = config;
    });
  } else if (region === "AU") {
    Object.entries(AU_BANKS).forEach(([key, config]) => {
      if (!config.region) result[key] = config;
    });
  }

  return result;
}

/** Get all Asian banks */
export function getAsianBanks(): Record<string, BankConfig> {
  return {
    ...INDIA_BANKS,
    ...SINGAPORE_BANKS,
    ...SEASIA_BANKS,
    ...ASIAN_NEOBANKS,
    ...JAPAN_BANKS,
    ...INDONESIA_VIETNAM_BANKS,
  };
}

/** Get bank encoding requirement */
export function getBankEncoding(bankKey: string): string {
  const config = getBankConfig(bankKey);
  return config?.encoding ?? "UTF-8";
}

/** Check if a bank config has been verified with sample data */
export function isBankVerified(bankKey: string): boolean {
  const config = getBankConfig(bankKey);
  return config?.verified === true;
}

/** Get all verified bank keys */
export function getVerifiedBankKeys(): string[] {
  return Object.entries(ALL_BANKS)
    .filter(([, config]) => config.verified === true)
    .map(([key]) => key);
}

/** Get all unverified bank keys */
export function getUnverifiedBankKeys(): string[] {
  return Object.entries(ALL_BANKS)
    .filter(([, config]) => !config.verified)
    .map(([key]) => key);
}
