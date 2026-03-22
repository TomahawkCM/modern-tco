/**
 * Bank CSV Configuration Library
 * Standardized configurations for 15+ Canadian and American banks
 *
 * Research completed: 2025-11-06
 * See Archon document for detailed specifications
 */

import type { BankConfig } from "./types";

/**
 * Canadian Bank Configurations
 */
export const CANADIAN_BANKS: Record<string, BankConfig> = {
  bmo: { name: "BMO", dateColumn: "Date Posted", descriptionColumn: "Description", amountColumn: "Transaction Amount", dateFormat: "yyyyMMdd", amountMultiplier: 1, hasHeader: true, skipRows: 3 },
  homeTrust: { name: "Home Trust", dateColumn: "Date", descriptionColumn: "Details", amountColumn: "Debit/Credit", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  homeTrustVisa: { name: "Home Trust Visa", dateColumn: "Trans Date", descriptionColumn: "Merchant Name", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  genericCreditCard: { name: "Credit Card (Generic)", dateColumn: "Trans Date", descriptionColumn: "Merchant Name", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  tdChecking: { name: "TD Canada Trust (Checking)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Withdrawals", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  tdCreditCard: { name: "TD Canada Trust (Credit Card)", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  tdBusiness: { name: "TD Canada Trust (Business)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  td: { name: "TD Canada Trust", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 3 },
  tdSplit: { name: "TD Canada Trust (Outflow/Inflow)", dateColumn: "Date", descriptionColumn: "Payee", amountColumn: "Outflow", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  rbcStandard: { name: "RBC (Standard)", dateColumn: "Transaction Date", descriptionColumn: "Description 1", amountColumn: "CAD$", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  rbcSimplified: { name: "RBC (Simplified)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Withdrawals", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  rbc: { name: "RBC (Royal Bank of Canada)", dateColumn: "Transaction Date", descriptionColumn: "Description 1", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  rbcSplit: { name: "RBC (Debit/Credit Split)", dateColumn: "Transaction Date", descriptionColumn: "Description 1", amountColumn: "Debit", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 1 },
  scotiabank: { name: "Scotiabank", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Withdrawal", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  scotiabankSplit: { name: "Scotiabank (Debit/Credit)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  scotiabankSingle: { name: "Scotiabank (Single Amount)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  cibc: { name: "CIBC", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "yyyy-MM-dd", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  cibcSplit: { name: "CIBC (Withdrawals/Deposits)", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Withdrawals", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  cibcSingle: { name: "CIBC (Single Amount)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  tangerine: { name: "Tangerine", dateColumn: "Date", descriptionColumn: "Name", amountColumn: "Amount", dateFormat: "M/d/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  tangerineISO: { name: "Tangerine (ISO Date)", dateColumn: "Date", descriptionColumn: "Name", amountColumn: "Amount", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  simplii: { name: "Simplii Financial", dateColumn: "Date", descriptionColumn: "*Description", amountColumn: "Debit", dateFormat: "yyyy-MM-dd", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  simpliiSingle: { name: "Simplii Financial (Single Amount)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  desjardins: { name: "Desjardins", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Retrait", dateFormat: "yyyy-MM-dd", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  desjardinsFR: { name: "Desjardins (Français)", dateColumn: "Date de l'opération", descriptionColumn: "Description", amountColumn: "Retrait", dateFormat: "yyyy-MM-dd", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  desjardinsEN: { name: "Desjardins (English)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Withdrawal", dateFormat: "yyyy-MM-dd", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
};

export const AMERICAN_BANKS: Record<string, BankConfig> = {
  chaseCredit: { name: "Chase Credit Card", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  chaseChecking: { name: "Chase Checking", dateColumn: "Posting Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  chaseBusiness: { name: "Chase Business", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  chase: { name: "Chase Bank", dateColumn: "Posting Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  bankOfAmerica: { name: "Bank of America", dateColumn: "Posted Date", descriptionColumn: "Payee", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 7 },
  bankOfAmericaCredit: { name: "Bank of America Credit Card", dateColumn: "Posted Date", descriptionColumn: "Payee", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  bankofamerica: { name: "Bank of America (Simple)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  wellsFargo: { name: "Wells Fargo", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: false, skipRows: 0 },
  wellsFargoHeader: { name: "Wells Fargo (With Header)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  wellsFargoCredit: { name: "Wells Fargo Credit Card", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  wellsfargo: { name: "Wells Fargo (Legacy)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  citibank: { name: "Citibank", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  citibankSingle: { name: "Citibank (Single Amount)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  citibankChecking: { name: "Citibank Checking", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  capitalOne: { name: "Capital One", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "yyyy-MM-dd", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  capitalOneSingle: { name: "Capital One (Single Amount)", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  capitalOneUS: { name: "Capital One (US Date)", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  capitalone: { name: "Capital One (Legacy)", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  usBank: { name: "US Bank", dateColumn: "Date", descriptionColumn: "Name", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  usBankCredit: { name: "US Bank Credit Card", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  usBankAlt: { name: "US Bank (Alternative)", dateColumn: "Date", descriptionColumn: "Transaction", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  usbank: { name: "US Bank (Legacy)", dateColumn: "Date", descriptionColumn: "Name", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  pnc: { name: "PNC Bank", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Withdrawals", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  pncSingle: { name: "PNC Bank (Single Amount)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  pncCredit: { name: "PNC Credit Card", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  discover: { name: "Discover Card", dateColumn: "Trans. Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  discoverAlt: { name: "Discover Card (Alternative)", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  discoverBank: { name: "Discover Bank", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  amex: { name: "American Express", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  amexOld: { name: "American Express (Legacy)", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  amexBusiness: { name: "American Express Business", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  ally: { name: "Ally Bank", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  navyFederal: { name: "Navy Federal Credit Union", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  usaa: { name: "USAA", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  schwab: { name: "Charles Schwab", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  fidelity: { name: "Fidelity", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
};

export const UK_BANKS: Record<string, BankConfig> = {
  barclays: { name: "Barclays", dateColumn: "Date", descriptionColumn: "Memo", amountColumn: "Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  barclaysAccount: { name: "Barclays Current Account", dateColumn: "Transaction Date", descriptionColumn: "Transaction Description", amountColumn: "Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  hsbc: { name: "HSBC", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  hsbcCredit: { name: "HSBC Credit Card", dateColumn: "Transaction Date", descriptionColumn: "Transaction Description", amountColumn: "Billed Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0 },
  lloyds: { name: "Lloyds Bank", dateColumn: "Transaction Date", descriptionColumn: "Transaction Description", amountColumn: "Debit Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  natwest: { name: "NatWest", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Value", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  natwestAccount: { name: "NatWest Current Account", dateColumn: "Transaction Date", descriptionColumn: "Transaction Type", amountColumn: "Paid Out", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
};

export const EU_BANKS: Record<string, BankConfig> = {
  n26: { name: "N26", dateColumn: "Date", descriptionColumn: "Payee", amountColumn: "Amount (EUR)", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  n26Full: { name: "N26 Full Export", dateColumn: "Booking Date", descriptionColumn: "Partner Name", amountColumn: "Amount", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  revolut: { name: "Revolut", dateColumn: "Completed Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "dd MMM yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  revolutStatement: { name: "Revolut Statement", dateColumn: "Started Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "yyyy-MM-dd HH:mm:ss", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  ing: { name: "ING", dateColumn: "Datum", descriptionColumn: "Naam / Omschrijving", amountColumn: "Bedrag (EUR)", dateFormat: "yyyyMMdd", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  ingEnglish: { name: "ING (English)", dateColumn: "Date", descriptionColumn: "Name / Description", amountColumn: "Amount (EUR)", dateFormat: "yyyyMMdd", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  deutschebank: { name: "Deutsche Bank", dateColumn: "Buchungstag", descriptionColumn: "Verwendungszweck", amountColumn: "Betrag", dateFormat: "dd.MM.yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  deutschebankEnglish: { name: "Deutsche Bank (English)", dateColumn: "Booking Date", descriptionColumn: "Purpose", amountColumn: "Amount", dateFormat: "dd.MM.yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
};

export const AU_BANKS: Record<string, BankConfig> = {
  commbank: { name: "Commonwealth Bank", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  commbankNetBank: { name: "CommBank NetBank Export", dateColumn: "Transaction Date", descriptionColumn: "Narrative", amountColumn: "Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  anz: { name: "ANZ", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  anzDetails: { name: "ANZ Detailed Export", dateColumn: "Transaction Date", descriptionColumn: "Transaction Description", amountColumn: "Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  westpac: { name: "Westpac", dateColumn: "Date", descriptionColumn: "Narrative", amountColumn: "Debit Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
  nab: { name: "NAB", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0 },
};

export const INDIA_BANKS: Record<string, BankConfig> = {
  hdfc: { name: "HDFC Bank", dateColumn: "Date", descriptionColumn: "Narration", amountColumn: "Withdrawal Amt.", dateFormat: "dd-MM-yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  hdfcStatement: { name: "HDFC Bank Statement", dateColumn: "Transaction Date", descriptionColumn: "Transaction Description", amountColumn: "Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  icici: { name: "ICICI Bank", dateColumn: "Transaction Date", descriptionColumn: "Transaction Remarks", amountColumn: "Withdrawal Amount (INR)", dateFormat: "dd-MM-yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  iciciCredit: { name: "ICICI Credit Card", dateColumn: "Date", descriptionColumn: "Transaction Details", amountColumn: "Amount", dateFormat: "dd-MM-yyyy", amountMultiplier: -1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  axis: { name: "Axis Bank", dateColumn: "Tran Date", descriptionColumn: "PARTICULARS", amountColumn: "DR", dateFormat: "dd-MM-yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  sbi: { name: "State Bank of India", dateColumn: "Txn Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "dd-MM-yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  sbiYono: { name: "SBI YONO", dateColumn: "Transaction Date", descriptionColumn: "Narration", amountColumn: "Withdrawal", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
};

export const SINGAPORE_BANKS: Record<string, BankConfig> = {
  dbs: { name: "DBS Bank", dateColumn: "Transaction Date", descriptionColumn: "Transaction Ref1", amountColumn: "Debit Amount", dateFormat: "dd MMM yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA", verified: true, verifiedDate: "2026-02-17", sampleRowCount: 2 },
  dbsPosb: { name: "DBS/POSB", dateColumn: "Transaction Date", descriptionColumn: "Reference", amountColumn: "Withdrawal", dateFormat: "dd MMM yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  ocbc: { name: "OCBC Bank", dateColumn: "Transaction date", descriptionColumn: "Description", amountColumn: "Withdrawals", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  ocbc360: { name: "OCBC 360", dateColumn: "Value Date", descriptionColumn: "Transaction Description", amountColumn: "Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  uob: { name: "UOB Bank", dateColumn: "Transaction Date", descriptionColumn: "Transaction Description", amountColumn: "Withdrawal", dateFormat: "dd MMM yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  uobStatement: { name: "UOB Statement", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
};

export const SEASIA_BANKS: Record<string, BankConfig> = {
  bangkokBank: { name: "Bangkok Bank", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Withdrawal", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  kasikorn: { name: "Kasikornbank", dateColumn: "Date", descriptionColumn: "Channel / Description", amountColumn: "Withdraw", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  scb: { name: "Siam Commercial Bank", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  maybank: { name: "Maybank", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  cimb: { name: "CIMB Bank", dateColumn: "Transaction Date", descriptionColumn: "Transaction Description", amountColumn: "Debit Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  gcash: { name: "GCash", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  bdo: { name: "BDO Unibank", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "MM/dd/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
};

export const ASIAN_NEOBANKS: Record<string, BankConfig> = {
  wise: { name: "Wise", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "dd-MM-yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  wiseMulti: { name: "Wise Multi-Currency", dateColumn: "Date", descriptionColumn: "Merchant", amountColumn: "Amount", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  grabpay: { name: "GrabPay", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Amount", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  aspire: { name: "Aspire", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "yyyy-MM-dd", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  youtrip: { name: "YouTrip", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Amount (SGD)", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
};

export const JAPAN_BANKS: Record<string, BankConfig> = {
  rakuten: { name: "Rakuten Bank", dateColumn: "取引日", descriptionColumn: "摘要", amountColumn: "支出", dateFormat: "yyyy/MM/dd", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  rakutenEn: { name: "Rakuten Bank (English)", dateColumn: "Transaction Date", descriptionColumn: "Description", amountColumn: "Withdrawal", dateFormat: "yyyy/MM/dd", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  mizuho: { name: "Mizuho Bank", dateColumn: "日付", descriptionColumn: "摘要", amountColumn: "出金", dateFormat: "yyyy/MM/dd", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "Shift-JIS", region: "ASIA" },
  mufg: { name: "MUFG Bank", dateColumn: "取引日", descriptionColumn: "摘要", amountColumn: "支払金額", dateFormat: "yyyy/MM/dd", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "Shift-JIS", region: "ASIA" },
  smbc: { name: "SMBC", dateColumn: "日付", descriptionColumn: "内容", amountColumn: "出金額", dateFormat: "yyyy/MM/dd", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "Shift-JIS", region: "ASIA" },
  japanPost: { name: "Japan Post Bank", dateColumn: "取扱日", descriptionColumn: "取引内容", amountColumn: "払出金額", dateFormat: "yyyy/MM/dd", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "Shift-JIS", region: "ASIA" },
};

export const INDONESIA_VIETNAM_BANKS: Record<string, BankConfig> = {
  bca: { name: "Bank Central Asia", dateColumn: "Tanggal", descriptionColumn: "Keterangan", amountColumn: "Mutasi", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", decimalSeparator: ",", thousandSeparator: ".", region: "ASIA" },
  mandiri: { name: "Bank Mandiri", dateColumn: "Tanggal Transaksi", descriptionColumn: "Keterangan", amountColumn: "Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", decimalSeparator: ",", thousandSeparator: ".", region: "ASIA" },
  bni: { name: "Bank Negara Indonesia", dateColumn: "Tanggal", descriptionColumn: "Keterangan", amountColumn: "Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", decimalSeparator: ",", thousandSeparator: ".", region: "ASIA" },
  bri: { name: "Bank Rakyat Indonesia", dateColumn: "Tanggal", descriptionColumn: "Keterangan", amountColumn: "Mutasi Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", decimalSeparator: ",", thousandSeparator: ".", region: "ASIA" },
  vietcombank: { name: "Vietcombank", dateColumn: "Ngày GD", descriptionColumn: "Nội dung", amountColumn: "Số tiền ghi nợ", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
  techcombank: { name: "Techcombank", dateColumn: "Date", descriptionColumn: "Description", amountColumn: "Debit", dateFormat: "dd/MM/yyyy", amountMultiplier: 1, hasHeader: true, skipRows: 0, encoding: "UTF-8", region: "ASIA" },
};

export const ALL_BANKS: Record<string, BankConfig> = { ...CANADIAN_BANKS, ...AMERICAN_BANKS, ...UK_BANKS, ...EU_BANKS, ...AU_BANKS, ...INDIA_BANKS, ...SINGAPORE_BANKS, ...SEASIA_BANKS, ...ASIAN_NEOBANKS, ...JAPAN_BANKS, ...INDONESIA_VIETNAM_BANKS };

export const DUAL_COLUMN_BANKS = ["tdChecking","tdBusiness","tdSplit","rbcSimplified","rbcSplit","scotiabank","scotiabankSplit","cibc","cibcSplit","simplii","desjardins","desjardinsFR","desjardinsEN","citibank","citibankChecking","capitalOne","capitalOneUS","capitalone","pnc","lloyds","natwestAccount","commbankNetBank","anzDetails","westpac","hdfc","hdfcStatement","icici","axis","sbi","dbs","dbsPosb","ocbc","ocbc360","uob","uobStatement","bangkokBank","kasikorn","maybank","bdo","rakuten","mizuho","mandiri","bni","aspire"];
export const NON_UTF8_BANKS = ["mizuho","mufg","smbc","japanpost"];
export const COMMA_DECIMAL_BANKS = ["bca","mandiri","bni","bri"];

export function getBankConfig(bankKey: string): BankConfig | null { return ALL_BANKS[bankKey.toLowerCase()] || null; }
export function getAllBankKeys(): string[] { return Object.keys(ALL_BANKS); }
export function hasDualAmountColumns(bankKey: string): boolean { return DUAL_COLUMN_BANKS.includes(bankKey.toLowerCase()); }

export function getBankConfigByName(bankName: string): BankConfig | null {
  const normalizedName = bankName.toLowerCase().trim();
  for (const [key, config] of Object.entries(ALL_BANKS)) { if (config.name.toLowerCase() === normalizedName) return config; }
  for (const [key, config] of Object.entries(ALL_BANKS)) { if (config.name.toLowerCase().includes(normalizedName) || normalizedName.includes(config.name.toLowerCase())) return config; }
  return null;
}

export function requiresSpecialEncoding(bankKey: string): boolean { return NON_UTF8_BANKS.includes(bankKey.toLowerCase()); }
export function usesCommaDecimal(bankKey: string): boolean { return COMMA_DECIMAL_BANKS.includes(bankKey.toLowerCase()); }

export function parseIndonesianAmount(amount: string): number {
  if (!amount || amount.trim() === "") return 0;
  const normalized = amount.trim().replace(/\./g, "").replace(",", ".");
  return parseFloat(normalized) || 0;
}

export function parseAmount(amount: string, bankKey: string): number {
  if (usesCommaDecimal(bankKey)) return parseIndonesianAmount(amount);
  const cleaned = amount.replace(/[,$\s]/g, "").trim();
  return parseFloat(cleaned) || 0;
}

export function getBanksByRegion(region: "NA" | "EU" | "UK" | "AU" | "ASIA"): Record<string, BankConfig> {
  const result: Record<string, BankConfig> = {};
  for (const [key, config] of Object.entries(ALL_BANKS)) { if (config.region === region) result[key] = config; }
  if (region === "NA") { Object.entries(CANADIAN_BANKS).forEach(([key, config]) => { if (!config.region) result[key] = config; }); Object.entries(AMERICAN_BANKS).forEach(([key, config]) => { if (!config.region) result[key] = config; }); }
  else if (region === "EU") { Object.entries(EU_BANKS).forEach(([key, config]) => { if (!config.region) result[key] = config; }); }
  else if (region === "UK") { Object.entries(UK_BANKS).forEach(([key, config]) => { if (!config.region) result[key] = config; }); }
  else if (region === "AU") { Object.entries(AU_BANKS).forEach(([key, config]) => { if (!config.region) result[key] = config; }); }
  return result;
}

export function getAsianBanks(): Record<string, BankConfig> { return { ...INDIA_BANKS, ...SINGAPORE_BANKS, ...SEASIA_BANKS, ...ASIAN_NEOBANKS, ...JAPAN_BANKS, ...INDONESIA_VIETNAM_BANKS }; }
export function getBankEncoding(bankKey: string): string { const config = getBankConfig(bankKey); return config?.encoding || "UTF-8"; }
export function isBankVerified(bankKey: string): boolean { const config = getBankConfig(bankKey); return config?.verified === true; }
export function getVerifiedBankKeys(): string[] { return Object.entries(ALL_BANKS).filter(([, config]) => config.verified === true).map(([key]) => key); }
export function getUnverifiedBankKeys(): string[] { return Object.entries(ALL_BANKS).filter(([, config]) => !config.verified).map(([key]) => key); }

export const ALL_BANK_CONFIGS: Record<string, BankConfig> = ALL_BANKS;
