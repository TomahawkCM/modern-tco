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
 * Combined bank configurations (all banks)
 */
export const ALL_BANKS: Record<string, BankConfig> = {
  ...CANADIAN_BANKS,
  ...AMERICAN_BANKS,
};

/**
 * Banks with dual amount columns (separate debit/credit)
 * These require special handling to combine columns
 */
export const DUAL_COLUMN_BANKS = [
  'scotiabank', // Funds Out / Funds In
  'cibc',       // Debit / Credit
  'simplii',    // Withdrawals / Deposits
  'citibank',   // Debit / Credit
  'capitalone', // Debit / Credit
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
