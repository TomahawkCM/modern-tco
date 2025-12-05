/**
 * Bank CSV Configuration Library
 * Standardized configurations for 15+ Canadian and American banks
 *
 * Research completed: 2025-11-06
 * See Archon document for detailed specifications
 */

import type { BankConfig } from '@/types/budget';

/**
 * Canadian Bank Configurations
 */
export const CANADIAN_BANKS: Record<string, BankConfig> = {
  td: {
    name: 'TD Bank',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Flip sign: negative in CSV means expense
    hasHeader: true,
    skipRows: 0,
  },

  rbc: {
    name: 'RBC (Royal Bank of Canada)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description 1',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  scotiabank: {
    name: 'Scotiabank',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Transaction Details',
    amountColumn: 'Funds Out', // Note: Also has 'Funds In' column
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  cibc: {
    name: 'CIBC',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit', // Note: Also has 'Credit' column
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  tangerine: {
    name: 'Tangerine',
    dateColumn: 'Date',
    descriptionColumn: 'Name',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  simplii: {
    name: 'Simplii Financial',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Withdrawals', // Note: Also has 'Deposits' column
    dateFormat: 'yyyy-MM-dd', // ISO format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  bmo: {
    name: 'BMO',
    dateColumn: 'Date Posted',
    descriptionColumn: 'Description',
    amountColumn: 'Transaction Amount',
    dateFormat: 'yyyyMMdd',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 3, // BMO has 3 header rows before data
  },
};

/**
 * American Bank Configurations
 */
export const AMERICAN_BANKS: Record<string, BankConfig> = {
  chase: {
    name: 'Chase Bank',
    dateColumn: 'Posting Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  bankofamerica: {
    name: 'Bank of America',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  wellsfargo: {
    name: 'Wells Fargo',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  citibank: {
    name: 'Citibank',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit', // Note: Also has 'Credit' column
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  capitalone: {
    name: 'Capital One',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit', // Note: Also has 'Credit' column
    dateFormat: 'yyyy-MM-dd', // ISO format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  usbank: {
    name: 'US Bank',
    dateColumn: 'Date',
    descriptionColumn: 'Name',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
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
    name: 'Barclays',
    dateColumn: 'Date',
    descriptionColumn: 'Memo',
    amountColumn: 'Amount',
    dateFormat: 'dd/MM/yyyy', // UK format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Barclays UK - Alternative format with Number/Sort Code
  barclaysAccount: {
    name: 'Barclays Current Account',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Transaction Description',
    amountColumn: 'Amount',
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ HSBC UK - Verified format
  hsbc: {
    name: 'HSBC',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ HSBC UK Credit Card
  hsbcCredit: {
    name: 'HSBC Credit Card',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Transaction Description',
    amountColumn: 'Billed Amount',
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: -1, // Credit card: positive = expense
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Lloyds Bank UK - Verified format
  lloyds: {
    name: 'Lloyds Bank',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Transaction Description',
    amountColumn: 'Debit Amount', // Also has Credit Amount
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ NatWest UK - Verified format
  natwest: {
    name: 'NatWest',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Value',
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ NatWest UK - Alternative format
  natwestAccount: {
    name: 'NatWest Current Account',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Transaction Type',
    amountColumn: 'Paid Out', // Also has Paid In
    dateFormat: 'dd/MM/yyyy',
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
    name: 'N26',
    dateColumn: 'Date',
    descriptionColumn: 'Payee',
    amountColumn: 'Amount (EUR)',
    dateFormat: 'yyyy-MM-dd', // ISO format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ N26 Alternative format
  n26Full: {
    name: 'N26 Full Export',
    dateColumn: 'Booking Date',
    descriptionColumn: 'Partner Name',
    amountColumn: 'Amount',
    dateFormat: 'yyyy-MM-dd',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Revolut - Verified format (multi-currency)
  revolut: {
    name: 'Revolut',
    dateColumn: 'Completed Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'dd MMM yyyy', // e.g., "25 Dec 2024"
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Revolut - Alternative format
  revolutStatement: {
    name: 'Revolut Statement',
    dateColumn: 'Started Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ ING (Netherlands) - Verified format
  ing: {
    name: 'ING',
    dateColumn: 'Datum', // Dutch: Date
    descriptionColumn: 'Naam / Omschrijving', // Name / Description
    amountColumn: 'Bedrag (EUR)', // Amount (EUR)
    dateFormat: 'yyyyMMdd', // Compact format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ ING Alternative (English export)
  ingEnglish: {
    name: 'ING (English)',
    dateColumn: 'Date',
    descriptionColumn: 'Name / Description',
    amountColumn: 'Amount (EUR)',
    dateFormat: 'yyyyMMdd',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Deutsche Bank (Germany) - Verified format
  deutschebank: {
    name: 'Deutsche Bank',
    dateColumn: 'Buchungstag', // Booking Day
    descriptionColumn: 'Verwendungszweck', // Purpose
    amountColumn: 'Betrag', // Amount
    dateFormat: 'dd.MM.yyyy', // German format
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Deutsche Bank English export
  deutschebankEnglish: {
    name: 'Deutsche Bank (English)',
    dateColumn: 'Booking Date',
    descriptionColumn: 'Purpose',
    amountColumn: 'Amount',
    dateFormat: 'dd.MM.yyyy',
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
    name: 'Commonwealth Bank',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ CommBank - Alternative format
  commbankNetBank: {
    name: 'CommBank NetBank Export',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Narrative',
    amountColumn: 'Debit', // Also has Credit column
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ ANZ (Australia) - Verified format
  anz: {
    name: 'ANZ',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ ANZ Alternative format
  anzDetails: {
    name: 'ANZ Detailed Export',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Transaction Description',
    amountColumn: 'Debit', // Also has Credit column
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Westpac (Australia) - Bonus
  westpac: {
    name: 'Westpac',
    dateColumn: 'Date',
    descriptionColumn: 'Narrative',
    amountColumn: 'Debit Amount', // Also has Credit Amount
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ NAB (National Australia Bank) - Bonus
  nab: {
    name: 'NAB',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'dd/MM/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
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
};

/**
 * Banks with dual amount columns (separate debit/credit)
 * These require special handling to combine columns
 */
export const DUAL_COLUMN_BANKS = [
  // Canadian
  'scotiabank',     // Funds Out / Funds In
  'cibc',           // Debit / Credit
  'simplii',        // Withdrawals / Deposits
  // American
  'citibank',       // Debit / Credit
  'capitalone',     // Debit / Credit
  // UK
  'lloyds',         // Debit Amount / Credit Amount
  'natwestAccount', // Paid Out / Paid In
  // Australian
  'commbankNetBank', // Debit / Credit
  'anzDetails',      // Debit / Credit
  'westpac',        // Debit Amount / Credit Amount
];

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
    if (config.name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(config.name.toLowerCase())) {
      return config;
    }
  }

  return null;
}
