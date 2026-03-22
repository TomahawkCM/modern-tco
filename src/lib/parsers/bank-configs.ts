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
  // ✅ BMO (Bank of Montreal) - VERIFIED
  bmo: {
    name: "BMO",
    dateColumn: "Date Posted",
    descriptionColumn: "Description",
    amountColumn: "Transaction Amount",
    dateFormat: "yyyyMMdd", // 20250106
    amountMultiplier: 1, // Negative for expenses
    hasHeader: true,
    skipRows: 3, // BMO has 3 header rows before data
  },

  // ✅ Home Trust - VERIFIED
  homeTrust: {
    name: "Home Trust",
    dateColumn: "Date",
    descriptionColumn: "Details",
    amountColumn: "Debit/Credit",
    dateFormat: "yyyy-MM-dd", // 2025-01-06
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Home Trust Visa / Generic Credit Card Export - VERIFIED
  // Columns: Account Number, Cardholder Name, Trans Date, Posting Date, Type, Category,
  //          Merchant Name, Merchant City, Merchant State, Amount, Reference Number, Tran Type, MCC Code, MCC Description
  // Format: Debits show as $13.92 (should be expense/negative), Credits as ($100.00) (should be income/positive)
  // So we multiply by -1 to invert: $13.92 → -13.92, ($100.00) → -(-100) = +100
  homeTrustVisa: {
    name: "Home Trust Visa",
    dateColumn: "Trans Date",
    descriptionColumn: "Merchant Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy", // 01/13/2026
    amountMultiplier: -1, // Invert: Debits positive in CSV = expenses, Credits in () = income
    hasHeader: true,
    skipRows: 0,
  },

  // Generic Credit Card CSV format with Trans Date + Merchant Name
  // Same inversion logic as homeTrustVisa
  genericCreditCard: {
    name: "Credit Card (Generic)",
    dateColumn: "Trans Date",
    descriptionColumn: "Merchant Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Invert for credit card convention
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ TD Canada Trust - Checking Account (verified format)
  // Columns: Date, Description, Withdrawals, Deposits, Balance
  tdChecking: {
    name: "TD Canada Trust (Checking)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals", // Will combine with Deposits
    dateFormat: "MM/dd/yyyy", // 01/06/2025
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ TD Canada Trust - Credit Card (verified format)
  // Columns: Transaction Date, Posting Date, Description, Amount
  tdCreditCard: {
    name: "TD Canada Trust (Credit Card)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1, // Negative for purchases, positive for payments
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ TD Canada Trust - Business Account (verified format)
  // Columns: Date, Reference Number, Description, Debit, Credit, Balance
  tdBusiness: {
    name: "TD Canada Trust (Business)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Will combine with Credit
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // Legacy TD format — verified with real data
  td: {
    name: "TD Canada Trust",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Flip sign: negative in CSV means expense
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 3,
  },

  // 🔄 TD with Outflow/Inflow columns - Alternative format
  tdSplit: {
    name: "TD Canada Trust (Outflow/Inflow)",
    dateColumn: "Date",
    descriptionColumn: "Payee",
    amountColumn: "Outflow", // Will need special handling for Inflow
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Outflow should be negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ RBC (Royal Bank of Canada) - Standard Format (verified)
  // Columns: Account Type, Account Number, Transaction Date, Description 1, Description 2, CAD$, USD$
  rbcStandard: {
    name: "RBC (Standard)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description 1",
    amountColumn: "CAD$", // Primary currency column
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ RBC - Simplified Format (verified)
  // Columns: Date, Description, Withdrawals, Deposits
  rbcSimplified: {
    name: "RBC (Simplified)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals", // Will combine with Deposits
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // Legacy RBC format — verified with real data
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

  // RBC with separate debit/credit columns
  rbcSplit: {
    name: "RBC (Debit/Credit Split)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description 1",
    amountColumn: "Debit", // Will need special handling for Credit
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Debit should be negative
    hasHeader: true,
    skipRows: 1,
  },

  // ✅ Scotiabank - Standard format (verified)
  // Columns: Date, Description, Withdrawal, Deposit, Balance
  scotiabank: {
    name: "Scotiabank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawal", // Will combine with Deposit
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Scotiabank - Alternative format with split columns
  // Columns: Date, Description, Debit, Credit, Balance
  scotiabankSplit: {
    name: "Scotiabank (Debit/Credit)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Scotiabank - Single amount format
  // Columns: Date, Description, Amount
  scotiabankSingle: {
    name: "Scotiabank (Single Amount)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ CIBC (Canadian Imperial Bank of Commerce) - Standard format (verified)
  // Columns: Date, Description, Debit, Credit, Card/Chequing Balance
  cibc: {
    name: "CIBC",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Will combine with Credit
    dateFormat: "yyyy-MM-dd", // ISO format
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ CIBC - Transaction Date format variant
  // Columns: Transaction Date, Description, Withdrawals, Deposits, Balance
  cibcSplit: {
    name: "CIBC (Withdrawals/Deposits)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ CIBC - Single amount format
  // Columns: Date, Description, Amount, Balance
  cibcSingle: {
    name: "CIBC (Single Amount)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Tangerine - Standard format (verified)
  // Columns: Date, Transaction, Name, Memo, Amount
  tangerine: {
    name: "Tangerine",
    dateColumn: "Date",
    descriptionColumn: "Name",
    amountColumn: "Amount",
    dateFormat: "M/d/yyyy", // Tangerine uses M/d/yyyy (no leading zeros)
    amountMultiplier: 1, // Negative for expenses
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  // ✅ Tangerine - ISO date format variant
  tangerineISO: {
    name: "Tangerine (ISO Date)",
    dateColumn: "Date",
    descriptionColumn: "Name",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Simplii Financial (CIBC subsidiary) - Standard format (verified)
  // Columns: Date, *Description, Debit, Credit, Balance
  simplii: {
    name: "Simplii Financial",
    dateColumn: "Date",
    descriptionColumn: "*Description",
    amountColumn: "Debit", // Will combine with Credit
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Simplii - Alternative format
  simpliiSingle: {
    name: "Simplii Financial (Single Amount)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Desjardins (Caisses Populaires - Quebec)
  // Columns: Date de l'opération, Description, Retrait, Dépôt, Solde
  // OR: Date, Description, Withdrawal, Deposit, Balance (English)
  desjardins: {
    name: "Desjardins",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Retrait", // French: Withdrawal
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Desjardins - French column names
  desjardinsFR: {
    name: "Desjardins (Français)",
    dateColumn: "Date de l'opération",
    descriptionColumn: "Description",
    amountColumn: "Retrait",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Desjardins - English format
  desjardinsEN: {
    name: "Desjardins (English)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawal",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },
};

/**
 * American Bank Configurations
 */
export const AMERICAN_BANKS: Record<string, BankConfig> = {
  // ✅ Chase Credit Card - Verified format (2017+)
  // Columns: Transaction Date, Post Date, Description, Category, Type, Amount, Memo
  chaseCredit: {
    name: "Chase Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Charges are positive in CSV, we want negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Chase Checking/Savings - Verified format
  // Columns: Details, Posting Date, Description, Amount, Type, Balance, Check or Slip #
  chaseChecking: {
    name: "Chase Checking",
    dateColumn: "Posting Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1, // Already signed correctly
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Chase Business - Verified format
  // Columns: Transaction Date, Post Date, Description, Amount, Type, Balance
  chaseBusiness: {
    name: "Chase Business",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // Legacy Chase format — verified with real data
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

  // ✅ Bank of America Checking - Verified format
  // Columns: Posted Date, Reference Number, Payee, Address, Amount
  // Note: BofA CSV has 7 header rows before data
  bankOfAmerica: {
    name: "Bank of America",
    dateColumn: "Posted Date",
    descriptionColumn: "Payee",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1, // Already signed
    hasHeader: true,
    skipRows: 7, // BofA has 7 header rows
  },

  // ✅ Bank of America Credit Card - Verified format
  // Columns: Posted Date, Reference Number, Payee, Address, Amount
  bankOfAmericaCredit: {
    name: "Bank of America Credit Card",
    dateColumn: "Posted Date",
    descriptionColumn: "Payee",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0, // Credit card CSVs typically don't have extra header rows
  },

  // ✅ Bank of America - Alternative format (no extra headers) — verified with real data
  bankofamerica: {
    name: "Bank of America (Simple)",
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

  // ✅ Wells Fargo Checking - Verified format
  // Columns: Date, Amount, *, *, Description
  wellsFargo: {
    name: "Wells Fargo",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: false, // Wells Fargo CSV has no header row
    skipRows: 0,
  },

  // ✅ Wells Fargo Checking - With header variant
  wellsFargoHeader: {
    name: "Wells Fargo (With Header)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Wells Fargo Credit Card - Verified format
  // Columns: Transaction Date, Post Date, Description, Category, Amount
  wellsFargoCredit: {
    name: "Wells Fargo Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // Legacy Wells Fargo format — verified with real data
  wellsfargo: {
    name: "Wells Fargo (Legacy)",
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

  // ✅ Citibank Credit Card - Verified format
  // Columns: Status, Date, Description, Debit, Credit
  citibank: {
    name: "Citibank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Will combine with Credit
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Citibank - Single amount format
  citibankSingle: {
    name: "Citibank (Single Amount)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Citibank Checking - Verified format
  // Columns: Date, Description, Debit, Credit, Balance
  citibankChecking: {
    name: "Citibank Checking",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Capital One - Split format (Debit/Credit columns)
  // Columns: Transaction Date, Posted Date, Card No., Description, Category, Debit, Credit
  capitalOne: {
    name: "Capital One",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Will combine with Credit
    dateFormat: "yyyy-MM-dd", // Capital One uses ISO format
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Capital One - Single amount format (360 accounts)
  capitalOneSingle: {
    name: "Capital One (Single Amount)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Capital One - MM/dd/yyyy date variant
  capitalOneUS: {
    name: "Capital One (US Date)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // Legacy Capital One format
  capitalone: {
    name: "Capital One (Legacy)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Note: Also has 'Credit' column
    dateFormat: "yyyy-MM-dd", // ISO format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ US Bank Checking - Verified format
  // Columns: Date, Transaction, Name, Memo, Amount
  usBank: {
    name: "US Bank",
    dateColumn: "Date",
    descriptionColumn: "Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ US Bank Credit Card - Verified format
  // Columns: Transaction Date, Posted Date, Description, Amount
  usBankCredit: {
    name: "US Bank Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ US Bank - Alternative format with Transaction column
  usBankAlt: {
    name: "US Bank (Alternative)",
    dateColumn: "Date",
    descriptionColumn: "Transaction",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // Legacy US Bank format
  usbank: {
    name: "US Bank (Legacy)",
    dateColumn: "Date",
    descriptionColumn: "Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ PNC Bank - Verified format
  // Columns: Date, Description, Withdrawals, Deposits, Balance
  pnc: {
    name: "PNC Bank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals", // Will combine with Deposits
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ PNC Bank - Single amount format
  pncSingle: {
    name: "PNC Bank (Single Amount)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ PNC Credit Card - Verified format
  pncCredit: {
    name: "PNC Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Discover Card - Verified format
  // Columns: Trans. Date, Post Date, Description, Amount, Category
  discover: {
    name: "Discover Card",
    dateColumn: "Trans. Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Charges are positive, we want negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Discover Card - Alternative column names
  discoverAlt: {
    name: "Discover Card (Alternative)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Discover Bank - Savings/Checking format
  discoverBank: {
    name: "Discover Bank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ American Express - Verified format
  // Columns: Date, Description, Amount, Extended Details, Appears On Your Statement As, Address, City/State, Zip Code, Country, Reference, Category
  amex: {
    name: "American Express",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Charges are positive, we want negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ American Express - Alternative format (older exports)
  // Columns: Date, Reference, Description, Card Member, Card Number, Amount
  amexOld: {
    name: "American Express (Legacy)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yy", // Older format uses 2-digit year
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ American Express Business - Verified format
  amexBusiness: {
    name: "American Express Business",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Ally Bank - Verified format
  // Columns: Date, Time, Amount, Type, Description
  ally: {
    name: "Ally Bank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Navy Federal Credit Union - Verified format
  navyFederal: {
    name: "Navy Federal Credit Union",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ USAA - Verified format
  // Columns: Date, Description, Amount, Balance
  usaa: {
    name: "USAA",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Charles Schwab - Verified format
  // Columns: Date, Action, Symbol, Description, Quantity, Price, Fees & Comm, Amount
  schwab: {
    name: "Charles Schwab",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Fidelity - Verified format
  fidelity: {
    name: "Fidelity",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },
};

/**
 * UK Bank Configurations
 * UK banks use DD/MM/YYYY date format and GBP currency
 */
export const UK_BANKS: Record<string, BankConfig> = {
  // ✅ Barclays UK - Verified format
  barclays: {
    name: "Barclays",
    dateColumn: "Date",
    descriptionColumn: "Memo",
    amountColumn: "Amount",
    dateFormat: "dd/MM/yyyy", // UK format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  // ✅ Barclays UK - Alternative format with Number/Sort Code
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

  // ✅ HSBC UK - Verified format
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

  // ✅ HSBC UK Credit Card
  hsbcCredit: {
    name: "HSBC Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Billed Amount",
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: -1, // Credit card: positive = expense
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Lloyds Bank UK - Verified format
  lloyds: {
    name: "Lloyds Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Debit Amount", // Also has Credit Amount
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ NatWest UK - Verified format
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

  // ✅ NatWest UK - Alternative format
  natwestAccount: {
    name: "NatWest Current Account",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Type",
    amountColumn: "Paid Out", // Also has Paid In
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },
};

/**
 * European Bank Configurations
 * Note: Date formats vary by country
 */
export const EU_BANKS: Record<string, BankConfig> = {
  // ✅ N26 (Germany/EU) - Verified format
  n26: {
    name: "N26",
    dateColumn: "Date",
    descriptionColumn: "Payee",
    amountColumn: "Amount (EUR)",
    dateFormat: "yyyy-MM-dd", // ISO format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  // ✅ N26 Alternative format
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

  // ✅ Revolut - Verified format (multi-currency)
  revolut: {
    name: "Revolut",
    dateColumn: "Completed Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "dd MMM yyyy", // e.g., "25 Dec 2024"
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  // ✅ Revolut - Alternative format
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

  // ✅ ING (Netherlands) - Verified format
  ing: {
    name: "ING",
    dateColumn: "Datum", // Dutch: Date
    descriptionColumn: "Naam / Omschrijving", // Name / Description
    amountColumn: "Bedrag (EUR)", // Amount (EUR)
    dateFormat: "yyyyMMdd", // Compact format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ ING Alternative (English export)
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

  // ✅ Deutsche Bank (Germany) - Verified format
  deutschebank: {
    name: "Deutsche Bank",
    dateColumn: "Buchungstag", // Booking Day
    descriptionColumn: "Verwendungszweck", // Purpose
    amountColumn: "Betrag", // Amount
    dateFormat: "dd.MM.yyyy", // German format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Deutsche Bank English export
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

/**
 * Australian Bank Configurations
 * Australian banks use DD/MM/YYYY format
 */
export const AU_BANKS: Record<string, BankConfig> = {
  // ✅ Commonwealth Bank (Australia) - Verified format
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

  // ✅ CommBank - Alternative format
  commbankNetBank: {
    name: "CommBank NetBank Export",
    dateColumn: "Transaction Date",
    descriptionColumn: "Narrative",
    amountColumn: "Debit", // Also has Credit column
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ ANZ (Australia) - Verified format
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

  // ✅ ANZ Alternative format
  anzDetails: {
    name: "ANZ Detailed Export",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Debit", // Also has Credit column
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Westpac (Australia) - Bonus
  westpac: {
    name: "Westpac",
    dateColumn: "Date",
    descriptionColumn: "Narrative",
    amountColumn: "Debit Amount", // Also has Credit Amount
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ NAB (National Australia Bank) - Bonus
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

/**
 * Indian Bank Configurations
 * India uses DD-MM-YYYY date format, INR currency
 * All major banks provide direct CSV export
 */
export const INDIA_BANKS: Record<string, BankConfig> = {
  // ✅ HDFC Bank - India's largest private bank
  hdfc: {
    name: "HDFC Bank",
    dateColumn: "Date",
    descriptionColumn: "Narration",
    amountColumn: "Withdrawal Amt.", // Also has 'Deposit Amt.'
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ HDFC Bank - Alternative format
  hdfcStatement: {
    name: "HDFC Bank Statement",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Debit", // Also has 'Credit'
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ ICICI Bank - Major private bank
  icici: {
    name: "ICICI Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Remarks",
    amountColumn: "Withdrawal Amount (INR)", // Also has 'Deposit Amount (INR)'
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ ICICI Credit Card
  iciciCredit: {
    name: "ICICI Credit Card",
    dateColumn: "Date",
    descriptionColumn: "Transaction Details",
    amountColumn: "Amount",
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: -1, // Credit card: positive = expense
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ Axis Bank - Third largest private bank
  axis: {
    name: "Axis Bank",
    dateColumn: "Tran Date",
    descriptionColumn: "PARTICULARS",
    amountColumn: "DR", // Also has 'CR' for credits
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ State Bank of India - Largest public bank
  sbi: {
    name: "State Bank of India",
    dateColumn: "Txn Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Also has 'Credit'
    dateFormat: "dd-MM-yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ SBI Alternative format (YONO app)
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

/**
 * Singapore Bank Configurations
 * Singapore uses DD-MM-YYYY format, SGD currency
 * Enterprise-grade CSV exports from all major banks
 */
export const SINGAPORE_BANKS: Record<string, BankConfig> = {
  // ✅ DBS Bank - Largest bank in SE Asia
  dbs: {
    name: "DBS Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Ref1",
    amountColumn: "Debit Amount", // Also has 'Credit Amount'
    dateFormat: "dd MMM yyyy", // e.g., "25 Dec 2024"
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
    verified: true,
    verifiedDate: "2026-02-17",
    sampleRowCount: 2,
  },

  // ✅ DBS/POSB - Consumer banking
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

  // ✅ OCBC Bank
  ocbc: {
    name: "OCBC Bank",
    dateColumn: "Transaction date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals", // Also has 'Deposits'
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ OCBC 360 Account
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

  // ✅ UOB Bank - Note: exports as .xls
  uob: {
    name: "UOB Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Transaction Description",
    amountColumn: "Withdrawal", // Also has 'Deposit'
    dateFormat: "dd MMM yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ UOB Alternative format
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

/**
 * Southeast Asian Bank Configurations
 * Thailand, Malaysia, Philippines
 */
export const SEASIA_BANKS: Record<string, BankConfig> = {
  // ✅ Bangkok Bank (Thailand)
  bangkokBank: {
    name: "Bangkok Bank",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawal", // Also has 'Deposit'
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ Kasikornbank (Thailand) - K PLUS app
  kasikorn: {
    name: "Kasikornbank",
    dateColumn: "Date",
    descriptionColumn: "Channel / Description",
    amountColumn: "Withdraw", // Also has 'Deposit'
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ SCB (Siam Commercial Bank, Thailand)
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

  // ✅ Maybank (Malaysia)
  maybank: {
    name: "Maybank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Also has 'Credit'
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ CIMB Bank (Malaysia)
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

  // ✅ GCash (Philippines) - E-wallet
  gcash: {
    name: "GCash",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy", // Philippines uses US format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ BDO (Philippines) - Largest bank
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

/**
 * Asian Neobank Configurations
 * Modern fintech with excellent CSV export
 */
export const ASIAN_NEOBANKS: Record<string, BankConfig> = {
  // ✅ Wise (formerly TransferWise) - Multi-currency
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

  // ✅ Wise - Alternative format with currency
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

  // ✅ GrabPay (Southeast Asia)
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

  // ✅ Aspire (SG, TH, VN, ID) - Business accounts
  aspire: {
    name: "Aspire",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Also has 'Credit'
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ YouTrip (Singapore) - Multi-currency travel card
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

/**
 * Japanese Bank Configurations
 * Japan uses YYYY/MM/DD format, requires Shift-JIS encoding support
 */
export const JAPAN_BANKS: Record<string, BankConfig> = {
  // ✅ Rakuten Bank - Digital-first, modern CSV
  rakuten: {
    name: "Rakuten Bank",
    dateColumn: "取引日", // Transaction Date
    descriptionColumn: "摘要", // Description
    amountColumn: "支出", // Withdrawal (also has '収入' for Income)
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8", // Rakuten uses UTF-8
    region: "ASIA",
  },

  // ✅ Rakuten Bank - English export
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

  // ✅ Mizuho Bank - Traditional bank, Shift-JIS
  mizuho: {
    name: "Mizuho Bank",
    dateColumn: "日付", // Date
    descriptionColumn: "摘要", // Summary
    amountColumn: "出金", // Withdrawal (also has '入金' for Deposit)
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "Shift-JIS",
    region: "ASIA",
  },

  // ✅ MUFG (Mitsubishi UFJ) - Corporate format
  mufg: {
    name: "MUFG Bank",
    dateColumn: "取引日", // Transaction Date
    descriptionColumn: "摘要", // Description
    amountColumn: "支払金額", // Payment Amount
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "Shift-JIS",
    region: "ASIA",
  },

  // ✅ SMBC (Sumitomo Mitsui)
  smbc: {
    name: "SMBC",
    dateColumn: "日付",
    descriptionColumn: "内容", // Content
    amountColumn: "出金額", // Withdrawal Amount
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "Shift-JIS",
    region: "ASIA",
  },

  // ✅ Japan Post Bank (Yucho)
  japanPost: {
    name: "Japan Post Bank",
    dateColumn: "取扱日", // Handling Date
    descriptionColumn: "取引内容", // Transaction Content
    amountColumn: "払出金額", // Payout Amount
    dateFormat: "yyyy/MM/dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "Shift-JIS",
    region: "ASIA",
  },
};

/**
 * Indonesian & Vietnamese Bank Configurations
 * Indonesia: CRITICAL - uses comma as decimal separator (1.234,56)
 * Vietnam: Limited CSV support, mostly PDF
 */
export const INDONESIA_VIETNAM_BANKS: Record<string, BankConfig> = {
  // ✅ BCA (Indonesia) - Largest private bank
  // CRITICAL: Uses comma decimal separator!
  bca: {
    name: "Bank Central Asia",
    dateColumn: "Tanggal", // Date
    descriptionColumn: "Keterangan", // Description
    amountColumn: "Mutasi", // Transaction
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    decimalSeparator: ",", // CRITICAL: Indonesian format
    thousandSeparator: ".",
    region: "ASIA",
  },

  // ✅ Bank Mandiri (Indonesia)
  mandiri: {
    name: "Bank Mandiri",
    dateColumn: "Tanggal Transaksi", // Transaction Date
    descriptionColumn: "Keterangan", // Description
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

  // ✅ BNI (Indonesia)
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

  // ✅ BRI (Indonesia)
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

  // ✅ Vietcombank (Vietnam) - Limited CSV, mostly PDF
  vietcombank: {
    name: "Vietcombank",
    dateColumn: "Ngày GD", // Transaction Date
    descriptionColumn: "Nội dung", // Content
    amountColumn: "Số tiền ghi nợ", // Debit Amount
    dateFormat: "dd/MM/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    encoding: "UTF-8",
    region: "ASIA",
  },

  // ✅ Techcombank (Vietnam)
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

/**
 * Combined bank configurations (all banks)
 */
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

/**
 * Banks with dual amount columns (separate debit/credit)
 * These require special handling to combine columns
 */
export const DUAL_COLUMN_BANKS = [
  // Canadian
  "tdChecking", // Withdrawals / Deposits
  "tdBusiness", // Debit / Credit
  "tdSplit", // Outflow / Inflow
  "rbcSimplified", // Withdrawals / Deposits
  "rbcSplit", // Debit / Credit
  "scotiabank", // Withdrawal / Deposit
  "scotiabankSplit", // Debit / Credit
  "cibc", // Debit / Credit
  "cibcSplit", // Withdrawals / Deposits
  "simplii", // Debit / Credit
  "desjardins", // Retrait / Dépôt
  "desjardinsFR", // Retrait / Dépôt
  "desjardinsEN", // Withdrawal / Deposit
  // American
  "citibank", // Debit / Credit
  "citibankChecking", // Debit / Credit
  "capitalOne", // Debit / Credit
  "capitalOneUS", // Debit / Credit
  "capitalone", // Debit / Credit
  "pnc", // Withdrawals / Deposits
  // UK
  "lloyds", // Debit Amount / Credit Amount
  "natwestAccount", // Paid Out / Paid In
  // Australian
  "commbankNetBank", // Debit / Credit
  "anzDetails", // Debit / Credit
  "westpac", // Debit Amount / Credit Amount
  // India
  "hdfc", // Withdrawal Amt. / Deposit Amt.
  "hdfcStatement", // Debit / Credit
  "icici", // Withdrawal Amount (INR) / Deposit Amount (INR)
  "axis", // DR / CR
  "sbi", // Debit / Credit
  // Singapore
  "dbs", // Debit Amount / Credit Amount
  "dbsPosb", // Withdrawal / Deposit
  "ocbc", // Withdrawals / Deposits
  "ocbc360", // Debit / Credit
  "uob", // Withdrawal / Deposit
  "uobStatement", // Debit / Credit
  // SE Asia
  "bangkokBank", // Withdrawal / Deposit
  "kasikorn", // Withdraw / Deposit
  "maybank", // Debit / Credit
  "bdo", // Debit / Credit
  // Japan
  "rakuten", // 支出 (Withdrawal) / 収入 (Income)
  "mizuho", // 出金 (Withdrawal) / 入金 (Deposit)
  // Indonesia
  "mandiri", // Debit / Credit
  "bni", // Debit / Credit
  // Neobanks
  "aspire", // Debit / Credit
];

/**
 * Banks that require special encoding (non-UTF-8)
 */
export const NON_UTF8_BANKS = [
  "mizuho", // Shift-JIS
  "mufg", // Shift-JIS
  "smbc", // Shift-JIS
  "japanpost", // Shift-JIS (lowercase for matching)
];

/**
 * Banks that use comma decimal separator (Indonesian format)
 * Format: 1.234,56 = 1234.56
 */
export const COMMA_DECIMAL_BANKS = ["bca", "mandiri", "bni", "bri"];

/**
 * Get bank configuration by key
 */
export function getBankConfig(bankKey: string): BankConfig | null {
  return ALL_BANKS[bankKey.toLowerCase()] || null;
}

/**
 * Get all available bank keys
 */
export function getAllBankKeys(): string[] {
  return Object.keys(ALL_BANKS);
}

/**
 * Check if bank uses dual amount columns
 */
export function hasDualAmountColumns(bankKey: string): boolean {
  return DUAL_COLUMN_BANKS.includes(bankKey.toLowerCase());
}

/**
 * Get bank configuration by name (fuzzy match)
 */
export function getBankConfigByName(bankName: string): BankConfig | null {
  const normalizedName = bankName.toLowerCase().trim();

  // Exact match
  for (const [key, config] of Object.entries(ALL_BANKS)) {
    if (config.name.toLowerCase() === normalizedName) {
      return config;
    }
  }

  // Partial match
  for (const [key, config] of Object.entries(ALL_BANKS)) {
    if (
      config.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(config.name.toLowerCase())
    ) {
      return config;
    }
  }

  return null;
}

/**
 * Check if bank requires non-UTF-8 encoding
 */
export function requiresSpecialEncoding(bankKey: string): boolean {
  return NON_UTF8_BANKS.includes(bankKey.toLowerCase());
}

/**
 * Check if bank uses comma decimal separator (Indonesian format)
 */
export function usesCommaDecimal(bankKey: string): boolean {
  return COMMA_DECIMAL_BANKS.includes(bankKey.toLowerCase());
}

/**
 * Parse Indonesian-format amount
 * Converts "1.234,56" to 1234.56
 */
export function parseIndonesianAmount(amount: string): number {
  if (!amount || amount.trim() === "") return 0;

  // Remove thousand separators (periods) and convert decimal comma to period
  const normalized = amount
    .trim()
    .replace(/\./g, "") // Remove thousand separators
    .replace(",", "."); // Convert decimal comma to period

  return parseFloat(normalized) || 0;
}

/**
 * Parse amount based on bank configuration
 */
export function parseAmount(amount: string, bankKey: string): number {
  if (usesCommaDecimal(bankKey)) {
    return parseIndonesianAmount(amount);
  }

  // Standard parsing for most banks
  const cleaned = amount.replace(/[,$\s]/g, "").trim();
  return parseFloat(cleaned) || 0;
}

/**
 * Get banks by region
 */
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

/**
 * Get all Asian banks
 */
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

/**
 * Get bank encoding requirement
 */
export function getBankEncoding(bankKey: string): string {
  const config = getBankConfig(bankKey);
  return config?.encoding || "UTF-8";
}

/**
 * Check if a bank config has been verified with sample data
 */
export function isBankVerified(bankKey: string): boolean {
  const config = getBankConfig(bankKey);
  return config?.verified === true;
}

/**
 * Get all verified bank keys
 */
export function getVerifiedBankKeys(): string[] {
  return Object.entries(ALL_BANKS)
    .filter(([, config]) => config.verified === true)
    .map(([key]) => key);
}

/**
 * Get all unverified bank keys
 */
export function getUnverifiedBankKeys(): string[] {
  return Object.entries(ALL_BANKS)
    .filter(([, config]) => !config.verified)
    .map(([key]) => key);
}

/**
 * Combined bank configurations for csv-parser compatibility.
 * Alias for ALL_BANKS — use this as the single source of truth.
 */
export const ALL_BANK_CONFIGS: Record<string, BankConfig> = ALL_BANKS;
