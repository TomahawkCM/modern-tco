/**
 * YNAB Account Transformer (Y-015)
 * Transforms YNAB accounts to Budget App Account format
 *
 * Handles:
 * - On-budget vs off-budget accounts
 * - Account type mapping (checking, savings, credit, etc.)
 * - Balance reconciliation
 * - Closed account handling
 */

import type { Account } from '@/types/budget';
import type { NormalizedAccount, ParsedYNABData } from './ynab-parser';

// ============================================================================
// Types
// ============================================================================

export interface AccountTransformOptions {
  /** Include closed accounts */
  includeClosedAccounts?: boolean;
  /** Include off-budget accounts (tracking accounts) */
  includeOffBudgetAccounts?: boolean;
  /** Default currency if not specified */
  defaultCurrency?: string;
  /** Custom institution name mappings */
  institutionMappings?: Record<string, string>;
}

export interface AccountTransformResult {
  /** Transformed accounts */
  accounts: Account[];
  /** Account ID mapping (YNAB ID → our ID) */
  accountIdMap: Map<string, string>;
  /** Statistics */
  stats: AccountTransformStats;
  /** Warnings */
  warnings: string[];
}

export interface AccountTransformStats {
  totalAccounts: number;
  onBudgetAccounts: number;
  offBudgetAccounts: number;
  closedAccounts: number;
  importedAccounts: number;
  skippedAccounts: number;
  totalBalance: number;
  totalAssets: number;
  totalLiabilities: number;
}

// ============================================================================
// Account Type Mapping
// ============================================================================

/**
 * Maps YNAB account types to our simplified types
 */
const ACCOUNT_TYPE_MAP: Record<
  NormalizedAccount['type'],
  Account['type']
> = {
  checking: 'checking',
  savings: 'savings',
  credit: 'credit',
  cash: 'checking', // We don't have a cash type, map to checking
  loan: 'credit', // Map loans to credit for liability tracking
  investment: 'savings', // Map investments to savings for now
};

/**
 * Determines if account type is an asset (positive is good)
 */
const ASSET_TYPES = new Set<NormalizedAccount['type']>([
  'checking',
  'savings',
  'cash',
  'investment',
]);

/**
 * Determines if account type is a liability (negative is expected)
 */
const LIABILITY_TYPES = new Set<NormalizedAccount['type']>([
  'credit',
  'loan',
]);

// ============================================================================
// Institution Detection
// ============================================================================

/**
 * Common financial institution patterns
 */
const INSTITUTION_PATTERNS: Array<{
  pattern: RegExp;
  institution: string;
}> = [
  // US Banks
  { pattern: /chase/i, institution: 'Chase' },
  { pattern: /bank\s+of\s+america|boa|bofa/i, institution: 'Bank of America' },
  { pattern: /wells\s+fargo/i, institution: 'Wells Fargo' },
  { pattern: /citi|citibank/i, institution: 'Citibank' },
  { pattern: /capital\s+one/i, institution: 'Capital One' },
  { pattern: /usaa/i, institution: 'USAA' },
  { pattern: /discover/i, institution: 'Discover' },
  { pattern: /american\s+express|amex/i, institution: 'American Express' },
  { pattern: /td\s+bank/i, institution: 'TD Bank' },
  { pattern: /pnc/i, institution: 'PNC' },

  // Canadian Banks
  { pattern: /bmo|bank\s+of\s+montreal/i, institution: 'BMO' },
  { pattern: /rbc|royal\s+bank/i, institution: 'RBC' },
  { pattern: /td\s+canada|toronto\s+dominion/i, institution: 'TD Canada' },
  { pattern: /scotiabank/i, institution: 'Scotiabank' },
  { pattern: /cibc/i, institution: 'CIBC' },
  { pattern: /tangerine/i, institution: 'Tangerine' },
  { pattern: /simplii/i, institution: 'Simplii' },
  { pattern: /eq\s+bank/i, institution: 'EQ Bank' },
  { pattern: /home\s+trust/i, institution: 'Home Trust' },

  // Credit Unions
  { pattern: /credit\s+union/i, institution: 'Credit Union' },
  { pattern: /navy\s+federal/i, institution: 'Navy Federal' },
  { pattern: /alliant/i, institution: 'Alliant' },

  // Investment
  { pattern: /vanguard/i, institution: 'Vanguard' },
  { pattern: /fidelity/i, institution: 'Fidelity' },
  { pattern: /schwab|charles\s+schwab/i, institution: 'Charles Schwab' },
  { pattern: /wealthsimple/i, institution: 'Wealthsimple' },
  { pattern: /questrade/i, institution: 'Questrade' },
  { pattern: /robinhood/i, institution: 'Robinhood' },

  // Fintech
  { pattern: /ally/i, institution: 'Ally' },
  { pattern: /marcus/i, institution: 'Marcus' },
  { pattern: /sofi/i, institution: 'SoFi' },
  { pattern: /chime/i, institution: 'Chime' },
  { pattern: /paypal/i, institution: 'PayPal' },
  { pattern: /venmo/i, institution: 'Venmo' },

  // Generic
  { pattern: /cash/i, institution: 'Cash' },
  { pattern: /wallet/i, institution: 'Wallet' },
];

// ============================================================================
// Main Transformer
// ============================================================================

/**
 * Transform YNAB accounts to Budget App format
 */
export function transformYNABAccounts(
  data: ParsedYNABData,
  options: AccountTransformOptions = {}
): AccountTransformResult {
  const {
    includeClosedAccounts = false,
    includeOffBudgetAccounts = true,
    defaultCurrency = 'USD',
    institutionMappings = {},
  } = options;

  const warnings: string[] = [];
  const stats: AccountTransformStats = {
    totalAccounts: data.accounts.length,
    onBudgetAccounts: 0,
    offBudgetAccounts: 0,
    closedAccounts: 0,
    importedAccounts: 0,
    skippedAccounts: 0,
    totalBalance: 0,
    totalAssets: 0,
    totalLiabilities: 0,
  };

  const accounts: Account[] = [];
  const accountIdMap = new Map<string, string>();
  const now = new Date();

  for (const ynabAccount of data.accounts) {
    // Count account types
    if (ynabAccount.onBudget) {
      stats.onBudgetAccounts++;
    } else {
      stats.offBudgetAccounts++;
    }

    if (ynabAccount.closed) {
      stats.closedAccounts++;
    }

    // Calculate balance stats
    stats.totalBalance += ynabAccount.balance;
    if (ASSET_TYPES.has(ynabAccount.type)) {
      stats.totalAssets += ynabAccount.balance;
    } else if (LIABILITY_TYPES.has(ynabAccount.type)) {
      stats.totalLiabilities += Math.abs(ynabAccount.balance);
    }

    // Skip based on options
    if (ynabAccount.closed && !includeClosedAccounts) {
      stats.skippedAccounts++;
      warnings.push(`Skipped closed account: ${ynabAccount.name}`);
      continue;
    }

    if (!ynabAccount.onBudget && !includeOffBudgetAccounts) {
      stats.skippedAccounts++;
      warnings.push(`Skipped off-budget account: ${ynabAccount.name}`);
      continue;
    }

    // Generate our account ID
    const ourAccountId = crypto.randomUUID();
    accountIdMap.set(ynabAccount.id, ourAccountId);

    // Detect institution
    const institution = detectInstitution(
      ynabAccount.name,
      institutionMappings
    );

    // Map account type
    const accountType = ACCOUNT_TYPE_MAP[ynabAccount.type] || 'checking';

    // Create account
    accounts.push({
      id: ourAccountId,
      name: ynabAccount.name,
      type: accountType,
      institution,
      balance: ynabAccount.balance,
      currency: data.currency || defaultCurrency,
      createdAt: now,
      updatedAt: now,
    });

    stats.importedAccounts++;
  }

  return {
    accounts,
    accountIdMap,
    stats,
    warnings: [...data.warnings, ...warnings],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function detectInstitution(
  accountName: string,
  customMappings: Record<string, string>
): string {
  // Check custom mappings first
  for (const [pattern, institution] of Object.entries(customMappings)) {
    if (accountName.toLowerCase().includes(pattern.toLowerCase())) {
      return institution;
    }
  }

  // Check common patterns
  for (const { pattern, institution } of INSTITUTION_PATTERNS) {
    if (pattern.test(accountName)) {
      return institution;
    }
  }

  // Try to extract from account name (e.g., "BMO - Checking" → "BMO")
  const dashSplit = accountName.split(/\s+-\s+/);
  if (dashSplit.length >= 2) {
    return dashSplit[0].trim();
  }

  // Try to extract from prefix (e.g., "Chase Freedom" → "Chase")
  const words = accountName.split(/\s+/);
  if (words.length >= 2 && words[0].length > 2) {
    // Check if first word is a known type
    const typeWords = [
      'checking',
      'savings',
      'credit',
      'card',
      'account',
      'my',
    ];
    if (!typeWords.includes(words[0].toLowerCase())) {
      return words[0];
    }
  }

  return 'Unknown';
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick transform with default options
 */
export function quickTransformAccounts(
  data: ParsedYNABData
): AccountTransformResult {
  return transformYNABAccounts(data, {
    includeClosedAccounts: false,
    includeOffBudgetAccounts: true,
    defaultCurrency: data.currency || 'USD',
  });
}

/**
 * Get account summary from YNAB data
 */
export function getAccountSummary(data: ParsedYNABData): {
  totalAccounts: number;
  onBudget: number;
  offBudget: number;
  closed: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  byType: Record<string, number>;
} {
  let totalAssets = 0;
  let totalLiabilities = 0;
  const byType: Record<string, number> = {};

  let onBudget = 0;
  let offBudget = 0;
  let closed = 0;

  for (const acc of data.accounts) {
    if (acc.closed) closed++;
    if (acc.onBudget) onBudget++;
    else offBudget++;

    if (ASSET_TYPES.has(acc.type)) {
      totalAssets += acc.balance;
    } else if (LIABILITY_TYPES.has(acc.type)) {
      totalLiabilities += Math.abs(acc.balance);
    }

    byType[acc.type] = (byType[acc.type] || 0) + acc.balance;
  }

  return {
    totalAccounts: data.accounts.length,
    onBudget,
    offBudget,
    closed,
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    byType,
  };
}

/**
 * Match YNAB accounts to existing accounts by name
 */
export function matchAccountsByName(
  ynabAccounts: NormalizedAccount[],
  existingAccounts: Account[]
): Map<string, string> {
  const matches = new Map<string, string>();
  const existingByName = new Map(
    existingAccounts.map((a) => [a.name.toLowerCase(), a.id])
  );

  for (const ynabAcc of ynabAccounts) {
    const lowerName = ynabAcc.name.toLowerCase();

    // Try exact match
    const exactMatch = existingByName.get(lowerName);
    if (exactMatch) {
      matches.set(ynabAcc.id, exactMatch);
      continue;
    }

    // Try fuzzy match (contains)
    for (const [existingName, existingId] of existingByName) {
      if (
        lowerName.includes(existingName) ||
        existingName.includes(lowerName)
      ) {
        matches.set(ynabAcc.id, existingId);
        break;
      }
    }
  }

  return matches;
}

/**
 * Reconcile balances between YNAB and existing accounts
 */
export function reconcileBalances(
  ynabAccounts: NormalizedAccount[],
  existingAccounts: Account[],
  matches: Map<string, string>
): Array<{
  ynabId: string;
  ourId: string;
  ynabName: string;
  ourName: string;
  ynabBalance: number;
  ourBalance: number;
  difference: number;
}> {
  const reconciliations: Array<{
    ynabId: string;
    ourId: string;
    ynabName: string;
    ourName: string;
    ynabBalance: number;
    ourBalance: number;
    difference: number;
  }> = [];

  const existingById = new Map(existingAccounts.map((a) => [a.id, a]));

  for (const ynabAcc of ynabAccounts) {
    const ourId = matches.get(ynabAcc.id);
    if (!ourId) continue;

    const ourAcc = existingById.get(ourId);
    if (!ourAcc) continue;

    const difference = ynabAcc.balance - ourAcc.balance;

    reconciliations.push({
      ynabId: ynabAcc.id,
      ourId,
      ynabName: ynabAcc.name,
      ourName: ourAcc.name,
      ynabBalance: ynabAcc.balance,
      ourBalance: ourAcc.balance,
      difference,
    });
  }

  return reconciliations;
}
