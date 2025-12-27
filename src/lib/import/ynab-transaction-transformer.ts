/**
 * YNAB Transaction Transformer (Y-012)
 * Transforms normalized YNAB transactions to Budget App Transaction format
 *
 * Key transformations:
 * - Date format: Already normalized to Date objects
 * - Amount: Already converted from milliunits to dollars
 * - Category assignment: Map YNAB categories to our schema
 * - Split transactions: Create linked child transactions
 */

import type { Transaction, Category, Account } from '@/types/budget';
import type {
  NormalizedTransaction,
  NormalizedSplitTransaction,
  NormalizedAccount,
  NormalizedCategoryGroup,
  ParsedYNABData,
} from './ynab-parser';

// ============================================================================
// Configuration
// ============================================================================

export interface TransformOptions {
  /** Map YNAB categories to existing categories by name */
  existingCategories?: Category[];
  /** Default account to use if YNAB account not found */
  defaultAccountId?: string;
  /** Whether to preserve original YNAB IDs in notes */
  preserveOriginalIds?: boolean;
  /** Whether to import hidden/archived categories */
  includeHiddenCategories?: boolean;
  /** Prefix for tags created from YNAB flags */
  flagTagPrefix?: string;
}

// ============================================================================
// Transform Results
// ============================================================================

export interface TransformResult {
  /** Successfully transformed transactions */
  transactions: Transaction[];
  /** Created accounts (if any new ones needed) */
  accounts: Account[];
  /** Categories that need to be created */
  newCategories: Category[];
  /** Statistics about the transformation */
  stats: TransformStats;
  /** Warnings during transformation */
  warnings: string[];
}

export interface TransformStats {
  totalTransactions: number;
  successfulTransforms: number;
  skippedTransactions: number;
  splitTransactionsCreated: number;
  transfersDetected: number;
  duplicatesSkipped: number;
  categoriesMatched: number;
  categoriesUnmatched: number;
}

// ============================================================================
// Category Mapping
// ============================================================================

/**
 * Default category color assignments based on common names
 */
const CATEGORY_COLORS: Record<string, string> = {
  // Housing
  rent: '#3B82F6',
  mortgage: '#3B82F6',
  housing: '#3B82F6',
  // Food
  groceries: '#10B981',
  'dining out': '#059669',
  restaurant: '#059669',
  // Transportation
  gas: '#8B5CF6',
  transportation: '#8B5CF6',
  auto: '#8B5CF6',
  // Utilities
  utilities: '#F59E0B',
  electric: '#F59E0B',
  water: '#F59E0B',
  // Entertainment
  entertainment: '#EC4899',
  streaming: '#EC4899',
  // Shopping
  shopping: '#6366F1',
  clothing: '#6366F1',
  // Health
  health: '#EF4444',
  medical: '#EF4444',
  // Income
  income: '#22C55E',
  salary: '#22C55E',
  // Savings
  savings: '#14B8A6',
  emergency: '#14B8A6',
  // Default
  default: '#6B7280',
};

/**
 * Default category icons based on common names
 */
const CATEGORY_ICONS: Record<string, string> = {
  rent: 'Home',
  mortgage: 'Home',
  housing: 'Home',
  groceries: 'ShoppingCart',
  'dining out': 'UtensilsCrossed',
  restaurant: 'UtensilsCrossed',
  gas: 'Fuel',
  transportation: 'Car',
  auto: 'Car',
  utilities: 'Lightbulb',
  electric: 'Zap',
  entertainment: 'Tv',
  streaming: 'Play',
  shopping: 'ShoppingBag',
  clothing: 'Shirt',
  health: 'Heart',
  medical: 'Stethoscope',
  income: 'DollarSign',
  salary: 'Wallet',
  savings: 'PiggyBank',
  emergency: 'Shield',
  default: 'Folder',
};

function getCategoryColor(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lowerName.includes(key)) {
      return color;
    }
  }
  return CATEGORY_COLORS['default'];
}

function getCategoryIcon(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lowerName.includes(key)) {
      return icon;
    }
  }
  return CATEGORY_ICONS['default'];
}

// ============================================================================
// Main Transformer
// ============================================================================

/**
 * Transform YNAB normalized data to Budget App format
 */
export function transformYNABData(
  data: ParsedYNABData,
  options: TransformOptions = {}
): TransformResult {
  const warnings: string[] = [];
  const stats: TransformStats = {
    totalTransactions: data.transactions.length,
    successfulTransforms: 0,
    skippedTransactions: 0,
    splitTransactionsCreated: 0,
    transfersDetected: 0,
    duplicatesSkipped: 0,
    categoriesMatched: 0,
    categoriesUnmatched: 0,
  };

  // Build category lookup from existing categories
  const existingCategoryMap = buildCategoryMap(options.existingCategories || []);

  // Build account lookup from YNAB accounts
  const accountMap = buildAccountMap(data.accounts);

  // Track new categories we need to create
  const newCategoryMap = new Map<string, Category>();

  // Transform transactions
  const transactions: Transaction[] = [];
  const seenOriginalIds = new Set<string>();

  for (const ynabTxn of data.transactions) {
    // Skip duplicates (by original ID)
    if (seenOriginalIds.has(ynabTxn.originalId)) {
      stats.duplicatesSkipped++;
      continue;
    }
    seenOriginalIds.add(ynabTxn.originalId);

    // Track transfers
    if (ynabTxn.isTransfer) {
      stats.transfersDetected++;
    }

    // Resolve account
    const account = accountMap.get(ynabTxn.accountId);
    if (!account && !options.defaultAccountId) {
      warnings.push(
        `Skipping transaction "${ynabTxn.description}": no matching account`
      );
      stats.skippedTransactions++;
      continue;
    }
    const accountId = account?.id || options.defaultAccountId!;

    // Resolve category
    const { category, subcategory, isNew, isMatched } = resolveCategory(
      ynabTxn.category,
      ynabTxn.categoryGroup,
      existingCategoryMap,
      newCategoryMap
    );

    if (isMatched) {
      stats.categoriesMatched++;
    } else if (isNew) {
      stats.categoriesUnmatched++;
    }

    // Create main transaction
    const mainTxn = createTransaction(
      ynabTxn,
      accountId,
      category,
      subcategory,
      options
    );
    transactions.push(mainTxn);
    stats.successfulTransforms++;

    // Handle split transactions
    if (ynabTxn.splits.length > 0) {
      const splitTxns = createSplitTransactions(
        mainTxn.id,
        ynabTxn.splits,
        ynabTxn,
        accountId,
        existingCategoryMap,
        newCategoryMap,
        options
      );

      // Mark parent as split
      mainTxn.isSplit = true;

      transactions.push(...splitTxns);
      stats.splitTransactionsCreated += splitTxns.length;
    }
  }

  // Create Account objects from YNAB accounts
  const accounts = transformAccounts(data.accounts);

  // Create Category objects for new categories
  const newCategories = transformNewCategories(
    newCategoryMap,
    data.categoryGroups,
    options
  );

  return {
    transactions,
    accounts,
    newCategories,
    stats,
    warnings: [...data.warnings, ...warnings],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildCategoryMap(
  categories: Category[]
): Map<string, { category: string; subcategory?: string }> {
  const map = new Map<string, { category: string; subcategory?: string }>();

  for (const cat of categories) {
    // Map by main category name (case-insensitive)
    map.set(cat.name.toLowerCase(), { category: cat.name });

    // Map by subcategory names
    for (const sub of cat.subcategories) {
      map.set(sub.toLowerCase(), {
        category: cat.name,
        subcategory: sub,
      });
      // Also map as "Category: Subcategory"
      map.set(`${cat.name.toLowerCase()}: ${sub.toLowerCase()}`, {
        category: cat.name,
        subcategory: sub,
      });
    }
  }

  return map;
}

function buildAccountMap(
  accounts: NormalizedAccount[]
): Map<string, NormalizedAccount> {
  return new Map(accounts.map((a) => [a.id, a]));
}

function resolveCategory(
  ynabCategory: string | null,
  ynabGroup: string | null,
  existingMap: Map<string, { category: string; subcategory?: string }>,
  newCategoryMap: Map<string, Category>
): {
  category: string | null;
  subcategory: string | null;
  isNew: boolean;
  isMatched: boolean;
} {
  if (!ynabCategory) {
    return { category: null, subcategory: null, isNew: false, isMatched: false };
  }

  // Try to find existing match
  const exactMatch = existingMap.get(ynabCategory.toLowerCase());
  if (exactMatch) {
    return {
      category: exactMatch.category,
      subcategory: exactMatch.subcategory || null,
      isNew: false,
      isMatched: true,
    };
  }

  // Try to match group + category
  if (ynabGroup) {
    const groupMatch = existingMap.get(
      `${ynabGroup.toLowerCase()}: ${ynabCategory.toLowerCase()}`
    );
    if (groupMatch) {
      return {
        category: groupMatch.category,
        subcategory: groupMatch.subcategory || null,
        isNew: false,
        isMatched: true,
      };
    }
  }

  // Try matching by group name
  if (ynabGroup) {
    const groupOnlyMatch = existingMap.get(ynabGroup.toLowerCase());
    if (groupOnlyMatch) {
      return {
        category: groupOnlyMatch.category,
        subcategory: ynabCategory,
        isNew: false,
        isMatched: true,
      };
    }
  }

  // Need to create new category
  // Use YNAB group as our category, YNAB category as subcategory
  const categoryName = ynabGroup || ynabCategory;
  const subcategoryName = ynabGroup ? ynabCategory : null;

  // Add to new categories map
  if (!newCategoryMap.has(categoryName)) {
    newCategoryMap.set(categoryName, {
      id: crypto.randomUUID(),
      name: categoryName,
      type: 'expense', // Will be determined by transaction amounts later
      subcategories: [],
      color: getCategoryColor(categoryName),
      icon: getCategoryIcon(categoryName),
      isDefault: false,
      order: newCategoryMap.size,
      createdAt: new Date(),
    });
  }

  // Add subcategory if not already present
  const newCat = newCategoryMap.get(categoryName)!;
  if (subcategoryName && !newCat.subcategories.includes(subcategoryName)) {
    newCat.subcategories.push(subcategoryName);
  }

  return {
    category: categoryName,
    subcategory: subcategoryName,
    isNew: true,
    isMatched: false,
  };
}

function createTransaction(
  ynabTxn: NormalizedTransaction,
  accountId: string,
  category: string | null,
  subcategory: string | null,
  options: TransformOptions
): Transaction {
  const now = new Date();

  // Build notes
  let notes = ynabTxn.memo || '';
  if (options.preserveOriginalIds) {
    notes = notes
      ? `${notes} [YNAB ID: ${ynabTxn.originalId}]`
      : `[YNAB ID: ${ynabTxn.originalId}]`;
  }

  // Build tags from flag color
  const tags: string[] = [];
  if (ynabTxn.flagColor) {
    const prefix = options.flagTagPrefix || 'ynab-flag';
    tags.push(`${prefix}-${ynabTxn.flagColor}`);
  }

  return {
    id: crypto.randomUUID(),
    accountId,
    date: ynabTxn.date,
    description: ynabTxn.description,
    originalDescription: ynabTxn.description,
    amount: ynabTxn.amount, // Already in dollars (negative = expense)
    category,
    subcategory,
    notes,
    isRecurring: false, // YNAB doesn't export recurring info in transactions
    tags,
    merchant: extractMerchant(ynabTxn.description),
    createdAt: now,
    updatedAt: now,
  };
}

function createSplitTransactions(
  parentId: string,
  splits: NormalizedSplitTransaction[],
  parentTxn: NormalizedTransaction,
  accountId: string,
  existingMap: Map<string, { category: string; subcategory?: string }>,
  newCategoryMap: Map<string, Category>,
  options: TransformOptions
): Transaction[] {
  const now = new Date();

  return splits.map((split) => {
    const { category, subcategory } = resolveCategory(
      split.category,
      split.categoryGroup,
      existingMap,
      newCategoryMap
    );

    return {
      id: crypto.randomUUID(),
      accountId,
      date: parentTxn.date,
      description: split.memo || parentTxn.description,
      originalDescription: parentTxn.description,
      amount: split.amount,
      category,
      subcategory,
      notes: split.memo || '',
      isRecurring: false,
      tags: [],
      splitFromId: parentId, // Link to parent
      createdAt: now,
      updatedAt: now,
    };
  });
}

function extractMerchant(description: string): string | undefined {
  if (!description) return undefined;

  // Clean up common prefixes
  let merchant = description
    .replace(/^(POS|ACH|CHK|ATM|WIRE|XFER)\s+/i, '')
    .replace(/^(DEBIT|CREDIT|PURCHASE)\s+/i, '')
    .replace(/^#\d+\s+/, '')
    .trim();

  // Limit length
  if (merchant.length > 100) {
    merchant = merchant.substring(0, 100);
  }

  return merchant || undefined;
}

function transformAccounts(accounts: NormalizedAccount[]): Account[] {
  const now = new Date();

  return accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    type: mapAccountType(acc.type),
    institution: extractInstitution(acc.name),
    balance: acc.balance,
    currency: 'USD', // Will be set from budget data
    createdAt: now,
    updatedAt: now,
  }));
}

function mapAccountType(
  type: NormalizedAccount['type']
): Account['type'] {
  switch (type) {
    case 'checking':
      return 'checking';
    case 'savings':
      return 'savings';
    case 'credit':
      return 'credit';
    case 'cash':
      return 'checking'; // No 'cash' in our schema
    case 'loan':
      return 'credit'; // Map loans to credit for now
    case 'investment':
      return 'savings'; // Map investments to savings for now
    default:
      return 'checking';
  }
}

function extractInstitution(accountName: string): string {
  // Try to extract bank name from account name
  // Common patterns: "Bank - Account", "Bank Account", "Account at Bank"
  const patterns = [
    /^([A-Za-z]+)\s+-\s+/,
    /at\s+([A-Za-z]+)$/i,
    /^([A-Za-z]{2,})\s+(?:Checking|Savings|Credit)/i,
  ];

  for (const pattern of patterns) {
    const match = accountName.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return 'Unknown';
}

function transformNewCategories(
  newCategoryMap: Map<string, Category>,
  ynabGroups: NormalizedCategoryGroup[],
  options: TransformOptions
): Category[] {
  const categories = Array.from(newCategoryMap.values());

  // Determine expense vs income based on YNAB group names
  const incomeKeywords = ['income', 'inflow', 'salary', 'wages', 'revenue'];

  for (const cat of categories) {
    const isIncome = incomeKeywords.some((kw) =>
      cat.name.toLowerCase().includes(kw)
    );
    cat.type = isIncome ? 'income' : 'expense';
  }

  // Check if hidden categories should be archived
  if (!options.includeHiddenCategories) {
    const hiddenGroupNames = new Set(
      ynabGroups.filter((g) => g.hidden).map((g) => g.name.toLowerCase())
    );

    for (const cat of categories) {
      if (hiddenGroupNames.has(cat.name.toLowerCase())) {
        cat.archived = true;
        cat.archivedAt = new Date();
      }
    }
  }

  return categories;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick transform for simple imports (no existing categories)
 */
export function quickTransformYNAB(
  data: ParsedYNABData
): TransformResult {
  return transformYNABData(data, {
    preserveOriginalIds: true,
    includeHiddenCategories: false,
    flagTagPrefix: 'flag',
  });
}

/**
 * Transform with category matching
 */
export function transformWithCategoryMatching(
  data: ParsedYNABData,
  existingCategories: Category[]
): TransformResult {
  return transformYNABData(data, {
    existingCategories,
    preserveOriginalIds: false,
    includeHiddenCategories: false,
  });
}
