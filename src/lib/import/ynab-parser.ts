/**
 * YNAB Parser (Y-011)
 * Parses YNAB budget files (nYNAB API JSON, YNAB4 Budget.yfull, CSV exports)
 * Returns normalized data structures for import into our Budget App
 */

import {
  type YNABBudget,
  type YNABAccount,
  type YNABTransaction,
  type YNABCategory,
  type YNABCategoryGroup,
  type YNAB4Budget,
  type YNAB4Account,
  type YNAB4Transaction,
  type YNAB4MasterCategory,
  type YNABCSVTransaction,
  fromMilliunits,
  parseYNABDate,
  isNYNABBudget,
  isYNAB4Budget,
  detectYNABVersion,
} from "./ynab-types";

// ============================================================================
// Normalized Output Types
// ============================================================================

/**
 * Normalized account for import
 */
export interface NormalizedAccount {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "cash" | "loan" | "investment";
  balance: number;
  onBudget: boolean;
  closed: boolean;
  note?: string;
}

/**
 * Normalized transaction for import
 */
export interface NormalizedTransaction {
  id: string;
  date: Date;
  amount: number; // Negative for expenses, positive for income
  description: string;
  accountId: string;
  accountName: string;
  category: string | null;
  categoryGroup: string | null;
  memo: string | null;
  isTransfer: boolean;
  transferAccountId: string | null;
  cleared: boolean;
  splits: NormalizedSplitTransaction[];
  originalId: string; // Original YNAB ID for reference
  flagColor: string | null;
}

/**
 * Normalized split transaction
 */
export interface NormalizedSplitTransaction {
  id: string;
  amount: number;
  category: string | null;
  categoryGroup: string | null;
  memo: string | null;
}

/**
 * Normalized category for import
 */
export interface NormalizedCategory {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
  hidden: boolean;
  budgeted: number;
  activity: number;
  balance: number;
  note?: string;
}

/**
 * Normalized category group
 */
export interface NormalizedCategoryGroup {
  id: string;
  name: string;
  hidden: boolean;
  categories: NormalizedCategory[];
}

/**
 * Normalized monthly budget
 */
export interface NormalizedMonthlyBudget {
  month: string; // YYYY-MM format
  categories: Array<{
    categoryId: string;
    categoryName: string;
    groupName: string;
    budgeted: number;
    activity: number;
    balance: number;
  }>;
}

/**
 * Complete parsed YNAB data
 */
export interface ParsedYNABData {
  version: "nynab" | "ynab4" | "csv";
  budgetName: string;
  currency: string;
  accounts: NormalizedAccount[];
  transactions: NormalizedTransaction[];
  categoryGroups: NormalizedCategoryGroup[];
  monthlyBudgets: NormalizedMonthlyBudget[];
  metadata: {
    dateRange: { start: Date; end: Date } | null;
    transactionCount: number;
    accountCount: number;
    categoryCount: number;
    totalIncome: number;
    totalExpenses: number;
  };
  warnings: string[];
}

// ============================================================================
// Account Type Mapping
// ============================================================================

const NYNAB_ACCOUNT_TYPE_MAP: Record<string, NormalizedAccount["type"]> = {
  checking: "checking",
  savings: "savings",
  creditCard: "credit",
  cash: "cash",
  lineOfCredit: "credit",
  otherAsset: "investment",
  otherLiability: "loan",
  mortgage: "loan",
  autoLoan: "loan",
  studentLoan: "loan",
  personalLoan: "loan",
  medicalDebt: "loan",
  otherDebt: "loan",
};

const YNAB4_ACCOUNT_TYPE_MAP: Record<string, NormalizedAccount["type"]> = {
  Checking: "checking",
  Savings: "savings",
  CreditCard: "credit",
  Cash: "cash",
  LineOfCredit: "credit",
  Merchant: "credit",
  InvestmentAccount: "investment",
  Mortgage: "loan",
  OtherAsset: "investment",
  OtherLiability: "loan",
};

// ============================================================================
// nYNAB Parser
// ============================================================================

/**
 * Parse nYNAB (web version) budget data
 */
export function parseNYNAB(budget: YNABBudget): ParsedYNABData {
  const warnings: string[] = [];

  // Parse accounts
  const accounts = parseNYNABAccounts(budget.accounts, warnings);

  // Create account lookup for transaction parsing
  const accountLookup = new Map(budget.accounts.map((a) => [a.id, a]));

  // Parse categories
  const categoryGroups = parseNYNABCategories(budget.category_groups, budget.categories, warnings);

  // Create category lookup
  const categoryLookup = new Map(budget.categories.map((c) => [c.id, c]));

  // Parse transactions
  const transactions = parseNYNABTransactions(
    budget.transactions,
    accountLookup,
    categoryLookup,
    warnings
  );

  // Parse monthly budgets
  const monthlyBudgets = parseNYNABMonthlyBudgets(budget.months, warnings);

  // Calculate metadata
  const metadata = calculateMetadata(accounts, transactions, categoryGroups);

  return {
    version: "nynab",
    budgetName: budget.name,
    currency: budget.currency_format?.iso_code || "USD",
    accounts,
    transactions,
    categoryGroups,
    monthlyBudgets,
    metadata,
    warnings,
  };
}

function parseNYNABAccounts(accounts: YNABAccount[], warnings: string[]): NormalizedAccount[] {
  return accounts
    .filter((a) => !a.deleted)
    .map((account) => {
      const type = NYNAB_ACCOUNT_TYPE_MAP[account.type];
      if (!type) {
        warnings.push(`Unknown account type: ${account.type} for ${account.name}`);
      }

      return {
        id: account.id,
        name: account.name,
        type: type || "checking",
        balance: fromMilliunits(account.balance),
        onBudget: account.on_budget,
        closed: account.closed,
        note: account.note || undefined,
      };
    });
}

function parseNYNABCategories(
  groups: YNABCategoryGroup[],
  categories: YNABCategory[],
  warnings: string[]
): NormalizedCategoryGroup[] {
  const activeGroups = groups.filter((g) => !g.deleted);
  const result: NormalizedCategoryGroup[] = [];

  for (const group of activeGroups) {
    // Skip internal system groups
    if (
      group.name.toLowerCase().includes("internal") ||
      group.name.toLowerCase() === "hidden categories"
    ) {
      continue;
    }

    const groupCategories = categories
      .filter((c) => c.category_group_id === group.id && !c.deleted)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        groupId: group.id,
        groupName: group.name,
        hidden: cat.hidden,
        budgeted: fromMilliunits(cat.budgeted),
        activity: fromMilliunits(cat.activity),
        balance: fromMilliunits(cat.balance),
        note: cat.note || undefined,
      }));

    if (groupCategories.length > 0) {
      result.push({
        id: group.id,
        name: group.name,
        hidden: group.hidden,
        categories: groupCategories,
      });
    }
  }

  return result;
}

function parseNYNABTransactions(
  transactions: YNABTransaction[],
  accountLookup: Map<string, YNABAccount>,
  categoryLookup: Map<string, YNABCategory>,
  warnings: string[]
): NormalizedTransaction[] {
  const result: NormalizedTransaction[] = [];

  for (const txn of transactions) {
    if (txn.deleted) continue;

    const account = accountLookup.get(txn.account_id);
    if (!account) {
      warnings.push(`Transaction ${txn.id} references unknown account ${txn.account_id}`);
      continue;
    }

    // Get category info
    let category: string | null = null;
    let categoryGroup: string | null = null;

    if (txn.category_id) {
      const cat = categoryLookup.get(txn.category_id);
      if (cat) {
        category = cat.name;
        categoryGroup = cat.category_group_name || null;
      } else {
        category = txn.category_name;
      }
    }

    // Parse splits
    const splits: NormalizedSplitTransaction[] = txn.subtransactions
      .filter((s) => !s.deleted)
      .map((sub) => {
        const subCat = sub.category_id ? categoryLookup.get(sub.category_id) : null;
        return {
          id: sub.id,
          amount: fromMilliunits(sub.amount),
          category: subCat?.name || sub.category_name,
          categoryGroup: subCat?.category_group_name || null,
          memo: sub.memo,
        };
      });

    result.push({
      id: crypto.randomUUID(),
      date: parseYNABDate(txn.date),
      amount: fromMilliunits(txn.amount),
      description: txn.payee_name || txn.memo || "Unknown",
      accountId: txn.account_id,
      accountName: account.name,
      category,
      categoryGroup,
      memo: txn.memo,
      isTransfer: txn.transfer_account_id !== null,
      transferAccountId: txn.transfer_account_id,
      cleared: txn.cleared === "cleared" || txn.cleared === "reconciled",
      splits,
      originalId: txn.id,
      flagColor: txn.flag_color,
    });
  }

  // Sort by date descending (newest first)
  result.sort((a, b) => b.date.getTime() - a.date.getTime());

  return result;
}

function parseNYNABMonthlyBudgets(
  months: YNABBudget["months"],
  _warnings: string[]
): NormalizedMonthlyBudget[] {
  if (!months) return [];

  return months
    .filter((m) => !m.deleted)
    .map((month) => ({
      month: month.month.substring(0, 7), // YYYY-MM
      categories: month.categories
        .filter((c) => !c.deleted)
        .map((cat) => ({
          categoryId: cat.id,
          categoryName: cat.name,
          groupName: cat.category_group_name || "Uncategorized",
          budgeted: fromMilliunits(cat.budgeted),
          activity: fromMilliunits(cat.activity),
          balance: fromMilliunits(cat.balance),
        })),
    }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

// ============================================================================
// YNAB4 Parser
// ============================================================================

/**
 * Parse YNAB4 (desktop version) budget data
 */
export function parseYNAB4(budget: YNAB4Budget): ParsedYNABData {
  const warnings: string[] = [];

  // Build lookup maps
  const accountLookup = new Map(budget.accounts.map((a) => [a.entityId, a]));
  const payeeLookup = new Map(budget.payees.map((p) => [p.entityId, p]));
  const categoryLookup = buildYNAB4CategoryLookup(budget.masterCategories);

  // Parse accounts
  const accounts = parseYNAB4Accounts(budget.accounts, warnings);

  // Parse categories
  const categoryGroups = parseYNAB4Categories(budget.masterCategories, warnings);

  // Parse transactions (note: YNAB4 uses regular decimals, not milliunits)
  const transactions = parseYNAB4Transactions(
    budget.transactions,
    accountLookup,
    payeeLookup,
    categoryLookup,
    warnings
  );

  // Parse monthly budgets
  const monthlyBudgets = parseYNAB4MonthlyBudgets(budget.monthlyBudgets, categoryLookup, warnings);

  // Calculate metadata
  const metadata = calculateMetadata(accounts, transactions, categoryGroups);

  return {
    version: "ynab4",
    budgetName: "YNAB4 Budget", // YNAB4 doesn't store budget name in the file
    currency: budget.budgetMetaData.currencyISOSymbol || "USD",
    accounts,
    transactions,
    categoryGroups,
    monthlyBudgets,
    metadata,
    warnings,
  };
}

function buildYNAB4CategoryLookup(
  masterCategories: YNAB4MasterCategory[]
): Map<string, { name: string; groupName: string }> {
  const lookup = new Map<string, { name: string; groupName: string }>();

  for (const master of masterCategories) {
    for (const sub of master.subCategories) {
      lookup.set(sub.entityId, {
        name: sub.name,
        groupName: master.name,
      });
    }
  }

  return lookup;
}

function parseYNAB4Accounts(accounts: YNAB4Account[], warnings: string[]): NormalizedAccount[] {
  return accounts
    .filter((a) => !a.hidden)
    .map((account) => {
      const type = YNAB4_ACCOUNT_TYPE_MAP[account.accountType];
      if (!type) {
        warnings.push(`Unknown account type: ${account.accountType} for ${account.accountName}`);
      }

      return {
        id: account.entityId,
        name: account.accountName,
        type: type || "checking",
        balance: account.lastReconciledBalance || 0,
        onBudget: account.onBudget,
        closed: false, // YNAB4 doesn't have explicit closed flag
        note: account.note,
      };
    });
}

function parseYNAB4Categories(
  masterCategories: YNAB4MasterCategory[],
  _warnings: string[]
): NormalizedCategoryGroup[] {
  return masterCategories
    .filter((m) => m.subCategories.length > 0)
    .map((master) => ({
      id: master.entityId,
      name: master.name,
      hidden: false,
      categories: master.subCategories
        .filter((s) => !s.isTombstone)
        .map((sub) => ({
          id: sub.entityId,
          name: sub.name,
          groupId: master.entityId,
          groupName: master.name,
          hidden: false,
          budgeted: 0, // Will be populated from monthly budgets
          activity: 0,
          balance: sub.cachedBalance || 0,
          note: sub.note || undefined,
        })),
    }));
}

function parseYNAB4Transactions(
  transactions: YNAB4Transaction[],
  accountLookup: Map<string, YNAB4Account>,
  payeeLookup: Map<string, { name: string }>,
  categoryLookup: Map<string, { name: string; groupName: string }>,
  warnings: string[]
): NormalizedTransaction[] {
  const result: NormalizedTransaction[] = [];

  for (const txn of transactions) {
    if (txn.isTombstone) continue;

    const account = accountLookup.get(txn.accountId);
    if (!account) {
      warnings.push(`Transaction ${txn.entityId} references unknown account`);
      continue;
    }

    const payee = payeeLookup.get(txn.payeeId);
    const categoryInfo = categoryLookup.get(txn.categoryId);

    // Parse splits (YNAB4 uses regular decimals)
    const splits: NormalizedSplitTransaction[] = (txn.subTransactions || []).map((sub) => {
      const subCatInfo = categoryLookup.get(sub.categoryId);
      return {
        id: sub.entityId,
        amount: sub.amount, // Already in regular decimals
        category: subCatInfo?.name || null,
        categoryGroup: subCatInfo?.groupName || null,
        memo: sub.memo,
      };
    });

    result.push({
      id: crypto.randomUUID(),
      date: parseYNABDate(txn.date),
      amount: txn.amount, // YNAB4 already uses regular decimals
      description: payee?.name || txn.memo || "Unknown",
      accountId: txn.accountId,
      accountName: account.accountName,
      category: categoryInfo?.name || null,
      categoryGroup: categoryInfo?.groupName || null,
      memo: txn.memo,
      isTransfer: !!txn.targetAccountId,
      transferAccountId: txn.targetAccountId || null,
      cleared: txn.cleared === "Cleared" || txn.cleared === "Reconciled",
      splits,
      originalId: txn.entityId,
      flagColor: txn.flag || null,
    });
  }

  result.sort((a, b) => b.date.getTime() - a.date.getTime());

  return result;
}

function parseYNAB4MonthlyBudgets(
  monthlyBudgets: YNAB4Budget["monthlyBudgets"],
  categoryLookup: Map<string, { name: string; groupName: string }>,
  _warnings: string[]
): NormalizedMonthlyBudget[] {
  if (!monthlyBudgets) return [];

  return monthlyBudgets.map((mb) => ({
    month: mb.month.substring(0, 7),
    categories: mb.monthlySubCategoryBudgets.map((sub) => {
      const catInfo = categoryLookup.get(sub.categoryId);
      return {
        categoryId: sub.categoryId,
        categoryName: catInfo?.name || "Unknown",
        groupName: catInfo?.groupName || "Uncategorized",
        budgeted: sub.budgeted,
        activity: 0, // Not directly available in YNAB4 monthly budget
        balance: 0,
      };
    }),
  }));
}

// ============================================================================
// CSV Parser
// ============================================================================

/**
 * Parse YNAB CSV transaction export
 */
export function parseYNABCSV(
  rows: YNABCSVTransaction[],
  budgetName = "YNAB Import"
): ParsedYNABData {
  const warnings: string[] = [];
  const accounts = new Map<string, NormalizedAccount>();
  const categoryGroupMap = new Map<string, NormalizedCategoryGroup>();
  const transactions: NormalizedTransaction[] = [];

  for (const row of rows) {
    // Extract or create account
    if (!accounts.has(row.Account)) {
      accounts.set(row.Account, {
        id: crypto.randomUUID(),
        name: row.Account,
        type: "checking", // Default, can't determine from CSV
        balance: 0,
        onBudget: true,
        closed: false,
      });
    }
    const account = accounts.get(row.Account)!;

    // Parse category
    let category: string | null = null;
    let categoryGroup: string | null = null;

    if (row["Category Group/Category"]) {
      const parts = row["Category Group/Category"].split(": ");
      if (parts.length >= 2) {
        categoryGroup = parts[0];
        category = parts.slice(1).join(": ");
      } else {
        category = row["Category Group/Category"];
      }

      // Build category group structure
      if (categoryGroup && !categoryGroupMap.has(categoryGroup)) {
        categoryGroupMap.set(categoryGroup, {
          id: crypto.randomUUID(),
          name: categoryGroup,
          hidden: false,
          categories: [],
        });
      }

      if (categoryGroup && category) {
        const group = categoryGroupMap.get(categoryGroup)!;
        if (!group.categories.find((c) => c.name === category)) {
          group.categories.push({
            id: crypto.randomUUID(),
            name: category,
            groupId: group.id,
            groupName: categoryGroup,
            hidden: false,
            budgeted: 0,
            activity: 0,
            balance: 0,
          });
        }
      }
    }

    // Parse amount
    const outflow = parseCSVAmount(row.Outflow);
    const inflow = parseCSVAmount(row.Inflow);
    const amount = inflow - outflow;

    // Parse date (various formats possible)
    const date = parseCSVDate(row.Date);
    if (!date) {
      warnings.push(`Could not parse date: ${row.Date}`);
      continue;
    }

    transactions.push({
      id: crypto.randomUUID(),
      date,
      amount,
      description: row.Payee || "Unknown",
      accountId: account.id,
      accountName: account.name,
      category,
      categoryGroup,
      memo: row.Memo || null,
      isTransfer: row.Payee.startsWith("Transfer :"),
      transferAccountId: null,
      cleared: row.Cleared.toLowerCase() === "cleared",
      splits: [],
      originalId: "", // CSV doesn't have IDs
      flagColor: row.Flag || null,
    });
  }

  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  const metadata = calculateMetadata(
    Array.from(accounts.values()),
    transactions,
    Array.from(categoryGroupMap.values())
  );

  return {
    version: "csv",
    budgetName,
    currency: "USD", // Can't determine from CSV
    accounts: Array.from(accounts.values()),
    transactions,
    categoryGroups: Array.from(categoryGroupMap.values()),
    monthlyBudgets: [], // CSV doesn't include budget data
    metadata,
    warnings,
  };
}

function parseCSVAmount(value: string): number {
  if (!value) return 0;
  // Remove currency symbols and commas
  const cleaned = value.replace(/[$,]/g, "").trim();
  return parseFloat(cleaned) || 0;
}

function parseCSVDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try various date formats
  // MM/DD/YYYY
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Try native Date parsing as fallback
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

// ============================================================================
// Metadata Calculation
// ============================================================================

function calculateMetadata(
  accounts: NormalizedAccount[],
  transactions: NormalizedTransaction[],
  categoryGroups: NormalizedCategoryGroup[]
): ParsedYNABData["metadata"] {
  let dateRange: { start: Date; end: Date } | null = null;
  let totalIncome = 0;
  let totalExpenses = 0;

  if (transactions.length > 0) {
    const dates = transactions.map((t) => t.date.getTime());
    dateRange = {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates)),
    };

    for (const txn of transactions) {
      if (txn.amount > 0) {
        totalIncome += txn.amount;
      } else {
        totalExpenses += Math.abs(txn.amount);
      }
    }
  }

  const categoryCount = categoryGroups.reduce((sum, g) => sum + g.categories.length, 0);

  return {
    dateRange,
    transactionCount: transactions.length,
    accountCount: accounts.length,
    categoryCount,
    totalIncome,
    totalExpenses,
  };
}

// ============================================================================
// Main Parser Entry Point
// ============================================================================

/**
 * Parse YNAB data from various formats
 * Automatically detects the format and calls the appropriate parser
 */
export function parseYNABData(
  data: unknown,
  options: { budgetName?: string } = {}
): ParsedYNABData {
  const version = detectYNABVersion(data);

  switch (version) {
    case "nynab":
      return parseNYNAB(data as YNABBudget);
    case "ynab4":
      return parseYNAB4(data as YNAB4Budget);
    case "csv":
      return parseYNABCSV(data as YNABCSVTransaction[], options.budgetName);
    default:
      throw new Error(
        "Unknown YNAB format. Expected nYNAB JSON, YNAB4 Budget.yfull, or CSV export."
      );
  }
}

/**
 * Parse YNAB file content
 * Handles JSON parsing and format detection
 */
export async function parseYNABFile(content: string, fileName: string): Promise<ParsedYNABData> {
  const isCSV = fileName.endsWith(".csv") || fileName.endsWith(".tsv");

  if (isCSV) {
    const rows = parseCSVContent(content);
    return parseYNABCSV(rows, fileName.replace(/\.[^.]+$/, ""));
  }

  // Try JSON parsing
  try {
    const data = JSON.parse(content);
    return parseYNABData(data);
  } catch {
    throw new Error("Invalid file format. Expected JSON or CSV.");
  }
}

/**
 * Parse CSV content into rows
 */
function parseCSVContent(content: string): YNABCSVTransaction[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  // Detect delimiter (comma or tab)
  const delimiter = lines[0].includes("\t") ? "\t" : ",";

  // Parse header
  const headers = parseCSVLine(lines[0], delimiter);

  // Parse rows
  const rows: YNABCSVTransaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    if (values.length < headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim().replace(/^"/, "").replace(/"$/, "")] =
        values[index]?.replace(/^"/, "").replace(/"$/, "") || "";
    });

    // Validate required fields
    if (row["Account"] && row["Date"]) {
      rows.push(row as unknown as YNABCSVTransaction);
    }
  }

  return rows;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
