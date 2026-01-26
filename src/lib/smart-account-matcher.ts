/**
 * Smart Account Matcher
 * Automatically matches imported transactions to the correct account
 * without requiring user interaction
 *
 * Uses OFX specification best practices:
 * - BANKID (routing number) + ACCTID (account number) as composite key
 * - Bank verification BEFORE account number matching
 * - Prevents cross-bank confusion when multiple banks have same last-4-digits
 */

import { db } from './budget-db';
import type { Account } from '@/types/budget';
import { BANK_CONFIGS } from './parsers/csv-parser';

// Map of institution names to bank slugs
const INSTITUTION_TO_SLUG: Record<string, string[]> = {
  'bmo': ['bmo', 'bank of montreal'],
  'homeTrust': ['home trust', 'hometrust', 'home-trust'],
  'homeTrustVisa': ['home trust visa', 'hometrust visa'],
  'td': ['td', 'td canada trust', 'td bank', 'toronto dominion', 'toronto-dominion'],
  'chase': ['chase', 'jpmorgan chase', 'jp morgan'],
  'bofa': ['bank of america', 'bofa', 'boa'],
  'wells': ['wells fargo', 'wellsfargo'],
  'citi': ['citi', 'citibank', 'citicorp'],
  'rbc': ['rbc', 'royal bank', 'royal bank of canada'],
  'scotiabank': ['scotiabank', 'scotia', 'bank of nova scotia'],
  'cibc': ['cibc', 'canadian imperial'],
  'national': ['national bank', 'banque nationale'],
  'desjardins': ['desjardins', 'caisse populaire'],
  'tangerine': ['tangerine', 'ing direct'],
  'simplii': ['simplii', 'pc financial'],
  'eq': ['eq bank', 'equitable bank'],
};

// Reverse map: slug to institution names
const SLUG_TO_INSTITUTIONS: Record<string, string[]> = {};
for (const [slug, names] of Object.entries(INSTITUTION_TO_SLUG)) {
  SLUG_TO_INSTITUTIONS[slug] = names;
}

export interface MatchResult {
  account: Account | null;
  confidence: number; // 0-1
  matchReason: string;
  suggestions?: Account[]; // If no exact match, suggest possible accounts
}

/**
 * Check if a bank matches an account
 * Returns true if bankSlug, bankId, or bankName matches the account
 */
function bankMatchesAccount(
  account: Account,
  bankSlug: string | null,
  bankId: string | null,
  bankName: string | null
): boolean {
  // Check by bankId (routing number) - most reliable
  if (bankId && account.bankId && account.bankId === bankId) {
    return true;
  }

  // Check by bankSlug
  if (bankSlug && account.bankSlug === bankSlug) {
    return true;
  }

  // Check by institution name fuzzy match
  if (bankName && account.institution) {
    const bankNameLower = bankName.toLowerCase();
    const institutionLower = account.institution.toLowerCase();

    if (institutionLower.includes(bankNameLower) || bankNameLower.includes(institutionLower)) {
      return true;
    }

    // Check via slug mapping
    if (bankSlug) {
      const institutionNames = SLUG_TO_INSTITUTIONS[bankSlug] || [];
      for (const name of institutionNames) {
        if (institutionLower.includes(name) || name.includes(institutionLower)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Find the best matching account for an import
 *
 * Matching Priority (per OFX specification):
 * 1. Composite Key: BANKID + last4 (100% confidence - definitive match)
 * 2. Bank verified + Account Number (95% confidence)
 * 3. Bank + Account Type (70% confidence)
 * 4. File name patterns (50-60% confidence)
 * 5. Custom import patterns (40% confidence)
 *
 * CRITICAL: Account number alone is NOT sufficient - bank must also match
 * to prevent cross-bank confusion (e.g., BMO account 1234 vs TD account 1234)
 *
 * @param bankSlug - Detected bank slug from CSV/OFX parsing
 * @param bankName - Detected bank name
 * @param accountNumber - Account number from OFX (if available)
 * @param fileName - Original file name (may contain account hints)
 * @param accountType - Type of account (checking, savings, credit)
 * @param bankId - Bank routing number from OFX BANKID (if available)
 */
export async function findMatchingAccount(
  bankSlug: string | null,
  bankName: string | null,
  accountNumber: string | null = null,
  fileName: string | null = null,
  accountType: 'checking' | 'savings' | 'credit' | null = null,
  bankId: string | null = null
): Promise<MatchResult> {
  const accounts = await db.accounts.toArray();

  console.log('[SmartAccountMatcher] Finding match:', {
    bankSlug,
    bankName,
    accountNumber: accountNumber ? `***${accountNumber.slice(-4)}` : null,
    bankId,
    accountType,
    fileName,
    totalAccounts: accounts.length,
  });

  if (accounts.length === 0) {
    return {
      account: null,
      confidence: 0,
      matchReason: 'No accounts exist',
    };
  }

  // If only one account exists, use it
  if (accounts.length === 1) {
    return {
      account: accounts[0],
      confidence: 0.9,
      matchReason: 'Only one account exists',
    };
  }

  // ========================================
  // PRIORITY 1: Composite Key Match (bankId + last4)
  // This is the OFX standard for unique account identification
  // ========================================
  if (bankId && accountNumber) {
    const last4 = accountNumber.slice(-4);
    console.log('[SmartAccountMatcher] Trying composite key match:', { bankId, last4 });

    for (const account of accounts) {
      if (account.bankId === bankId && account.lastFourDigits === last4) {
        console.log('[SmartAccountMatcher] Composite key match found:', account.name);
        return {
          account,
          confidence: 1.0, // 100% confidence - exact match
          matchReason: `Exact match: Bank routing ${bankId} + account ***${last4}`,
        };
      }
    }
  }

  // ========================================
  // PRIORITY 2: Bank Verified + Account Number Match
  // Account number only valid if bank also matches
  // ========================================
  if (accountNumber) {
    const last4 = accountNumber.slice(-4);
    console.log('[SmartAccountMatcher] Trying bank-verified account match:', { last4 });

    for (const account of accounts) {
      if (account.lastFourDigits === last4) {
        // MUST verify bank matches first!
        const bankMatches = bankMatchesAccount(account, bankSlug, bankId, bankName);

        if (bankMatches) {
          console.log('[SmartAccountMatcher] Bank-verified account match found:', account.name);
          return {
            account,
            confidence: 0.95,
            matchReason: `Bank verified + account ***${last4}`,
          };
        } else {
          // Account number matches but bank doesn't - this is a DIFFERENT account!
          // Log but do NOT match based on account number alone
          console.log('[SmartAccountMatcher] Account number matches but bank does NOT match:', {
            accountName: account.name,
            accountInstitution: account.institution,
            accountBankSlug: account.bankSlug,
            importBankSlug: bankSlug,
            importBankName: bankName,
          });
        }
      }
    }
  }

  // ========================================
  // PRIORITY 3: Bank + Account Type Match
  // ========================================
  let bestMatch: Account | null = null;
  let bestScore = 0;
  let bestReason = '';

  for (const account of accounts) {
    let score = 0;
    const reasons: string[] = [];

    // Check if bank matches
    const bankMatches = bankMatchesAccount(account, bankSlug, bankId, bankName);

    if (bankMatches) {
      score += 50;
      reasons.push(`bank match: ${account.institution}`);

      // Account type bonus
      if (accountType && account.type === accountType) {
        score += 25;
        reasons.push(`account type match: ${accountType}`);
      }
    }

    // File name contains account name or institution (lower priority)
    if (fileName) {
      const fileNameLower = fileName.toLowerCase();
      const accountNameLower = account.name.toLowerCase();
      const institutionLower = account.institution.toLowerCase();

      if (fileNameLower.includes(accountNameLower.replace(/\s+/g, '')) ||
          fileNameLower.includes(accountNameLower.split(' ')[0])) {
        score += 20;
        reasons.push('filename contains account name');
      }

      if (fileNameLower.includes(institutionLower.replace(/\s+/g, '')) ||
          fileNameLower.includes(institutionLower.split(' ')[0].toLowerCase())) {
        score += 15;
        reasons.push('filename contains institution');
      }

      // Check for account type in filename
      if ((fileNameLower.includes('visa') || fileNameLower.includes('credit') ||
           fileNameLower.includes('mastercard') || fileNameLower.includes('amex')) &&
          account.type === 'credit') {
        score += 10;
        reasons.push('filename suggests credit card');
      }

      if ((fileNameLower.includes('chequing') || fileNameLower.includes('checking') ||
           fileNameLower.includes('chq')) && account.type === 'checking') {
        score += 10;
        reasons.push('filename suggests checking account');
      }

      if ((fileNameLower.includes('savings') || fileNameLower.includes('save')) &&
          account.type === 'savings') {
        score += 10;
        reasons.push('filename suggests savings account');
      }
    }

    // Custom import patterns
    if (account.importPatterns && account.importPatterns.length > 0) {
      const searchText = [bankSlug, bankName, fileName].filter(Boolean).join(' ').toLowerCase();
      for (const pattern of account.importPatterns) {
        if (searchText.includes(pattern.toLowerCase())) {
          score += 40;
          reasons.push(`custom pattern match: ${pattern}`);
          break;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = account;
      bestReason = reasons.join(', ');
    }
  }

  // Calculate confidence (0-1)
  // Score of 75+ is considered a confident match (bank + type)
  const confidence = Math.min(bestScore / 75, 1);

  console.log('[SmartAccountMatcher] Best match result:', {
    account: bestMatch?.name,
    score: bestScore,
    confidence,
    reason: bestReason,
  });

  // If confidence is low, include suggestions
  let suggestions: Account[] | undefined;
  if (confidence < 0.7) {
    suggestions = accounts;
  }

  return {
    account: bestMatch,
    confidence,
    matchReason: bestReason || 'No strong match found',
    suggestions: confidence < 0.7 ? suggestions : undefined,
  };
}

/**
 * Detect account type from bank format
 */
export function detectAccountTypeFromBank(bankSlug: string): 'checking' | 'savings' | 'credit' | null {
  const creditSlugs = ['homeTrustVisa', 'genericCreditCard', 'chase', 'citi'];
  const checkingSlugs = ['bmo', 'td', 'rbc', 'scotiabank', 'cibc'];

  if (creditSlugs.includes(bankSlug)) return 'credit';
  if (checkingSlugs.includes(bankSlug)) return 'checking';

  // Check bank config name for hints
  const config = BANK_CONFIGS[bankSlug];
  if (config) {
    const nameLower = config.name.toLowerCase();
    if (nameLower.includes('visa') || nameLower.includes('credit') ||
        nameLower.includes('mastercard') || nameLower.includes('amex')) {
      return 'credit';
    }
  }

  return null;
}

/**
 * Learn account association from a successful import
 * Stores the bankSlug, lastFourDigits, and bankId on the account for future auto-matching
 *
 * @param accountId - The account ID to update
 * @param bankSlug - Bank slug to associate
 * @param accountNumber - Full account number (last 4 will be stored)
 * @param bankId - Bank routing number from OFX BANKID
 */
export async function learnAccountAssociation(
  accountId: string,
  bankSlug: string | null,
  accountNumber: string | null = null,
  bankId: string | null = null
): Promise<void> {
  if (!bankSlug && !accountNumber && !bankId) return;

  const updates: Partial<Account> = {
    updatedAt: new Date(),
  };

  if (bankSlug) {
    updates.bankSlug = bankSlug;
  }

  if (accountNumber) {
    updates.lastFourDigits = accountNumber.slice(-4);
  }

  if (bankId) {
    updates.bankId = bankId;
  }

  await db.accounts.update(accountId, updates);
  console.log('[SmartAccountMatcher] Learned association:', {
    accountId,
    bankSlug,
    lastFour: accountNumber?.slice(-4),
    bankId,
  });
}

/**
 * Auto-create an account if none exist for the detected bank
 */
export async function autoCreateAccount(
  bankSlug: string,
  bankName: string,
  accountType: 'checking' | 'savings' | 'credit' = 'checking',
  accountNumber: string | null = null,
  bankId: string | null = null
): Promise<Account> {
  const { v4: uuidv4 } = await import('uuid');

  const newAccount: Account = {
    id: uuidv4(),
    name: `${bankName} ${accountType.charAt(0).toUpperCase() + accountType.slice(1)}`,
    type: accountType,
    institution: bankName,
    balance: 0,
    currency: 'CAD',
    bankSlug,
    lastFourDigits: accountNumber?.slice(-4),
    bankId: bankId || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.accounts.add(newAccount);
  console.log('[SmartAccountMatcher] Auto-created account:', newAccount.name, { bankId });

  return newAccount;
}

/**
 * Assign all unassigned transactions to a specific target account
 * This is the user-controlled version that requires explicit account selection
 *
 * @param targetAccountId - The account ID to assign all unassigned transactions to
 * @returns Number of transactions assigned
 */
export async function assignUnassignedTransactionsTo(targetAccountId: string): Promise<number> {
  const allTransactions = await db.transactions.toArray();
  const unassigned = allTransactions.filter(
    tx => !tx.accountId || tx.accountId === '' || tx.accountId === 'default-account'
  );

  if (unassigned.length === 0) {
    console.log('[SmartAccountMatcher] No unassigned transactions to assign');
    return 0;
  }

  for (const tx of unassigned) {
    await db.transactions.update(tx.id, { accountId: targetAccountId });
  }

  console.log('[SmartAccountMatcher] Assigned', unassigned.length, 'transactions to account', targetAccountId);
  return unassigned.length;
}

export async function migrateDefaultTransactions(): Promise<{
  migrated: number;
  unmigrated: number;
  created: string[];
}> {
  // Find transactions with empty accountId OR 'default-account'
  // Empty accountId can occur when imports happened before accounts were set up
  const allTransactions = await db.transactions.toArray();
  const transactions = allTransactions.filter(
    tx => !tx.accountId || tx.accountId === '' || tx.accountId === 'default-account'
  );

  if (transactions.length === 0) {
    return { migrated: 0, unmigrated: 0, created: [] };
  }

  console.log('[SmartAccountMatcher] Found', transactions.length, 'unassigned transactions to migrate');

  const accounts = await db.accounts.toArray();
  let migrated = 0;
  const unmigrated = 0;
  const createdAccounts: string[] = [];

  // Helper function to update all unassigned transactions to a specific account
  async function migrateAllTo(targetAccountId: string): Promise<void> {
    for (const tx of transactions) {
      await db.transactions.update(tx.id, { accountId: targetAccountId });
    }
  }

  // If only one account exists, migrate all to it
  if (accounts.length === 1) {
    await migrateAllTo(accounts[0].id);
    console.log('[SmartAccountMatcher] Migrated all', transactions.length, 'transactions to', accounts[0].name);

    return {
      migrated: transactions.length,
      unmigrated: 0,
      created: [],
    };
  }

  // If no accounts exist, create a default one
  if (accounts.length === 0) {
    const defaultAccount = await autoCreateAccount(
      'unknown',
      'Primary',
      'checking'
    );
    createdAccounts.push(defaultAccount.name);

    await migrateAllTo(defaultAccount.id);
    console.log('[SmartAccountMatcher] Created account and migrated all', transactions.length, 'transactions');

    return {
      migrated: transactions.length,
      unmigrated: 0,
      created: createdAccounts,
    };
  }

  // Multiple accounts exist - DO NOT auto-assign!
  // Return unmigrated count so the UI can prompt user for account selection
  console.log('[SmartAccountMatcher] Multiple accounts exist - user selection required');

  return {
    migrated: 0,
    unmigrated: transactions.length,
    created: [],
  };
}
