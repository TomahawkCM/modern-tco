/**
 * SimpleFIN Sync Logic
 *
 * Handles synchronization of transactions from SimpleFIN to local budget.
 * Includes duplicate detection, transaction mapping, and progress reporting.
 */

import SimpleFINClient, {
  type SimpleFINAccount,
  type SimpleFINTransaction,
  type SimpleFINAccountSet,
  SimpleFINError,
} from "./client";
import type {
  SyncResult,
  AccountSyncResult,
  SyncProgress,
  MappedTransaction,
  ImportPreview,
  LinkedAccount,
  SimpleFINSettings,
} from "./types";
import type { Transaction } from "@/types/budget";

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_SYNC_DAYS = 60; // SimpleFIN limit
const DEFAULT_SYNC_DAYS = 30;

// =============================================================================
// TRANSACTION MAPPING
// =============================================================================

/**
 * Simple hash function for strings (works in both browser and Node.js)
 * djb2 hash algorithm - fast and produces good distribution
 */
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) + hash + char; // hash * 33 + char
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Generate hash for duplicate detection
 * Uses date + amount + description to create unique identifier
 */
export function generateTransactionHash(date: Date, amount: number, description: string): string {
  const normalized = `${date.toISOString().split("T")[0]}|${amount.toFixed(2)}|${description.toLowerCase().trim()}`;
  return `sfin_${simpleHash(normalized)}`;
}

/**
 * Map SimpleFIN transaction to our format
 */
export function mapSimpleFINTransaction(
  transaction: SimpleFINTransaction,
  accountId: string
): MappedTransaction {
  const amount = parseFloat(transaction.amount);
  const date = new Date(transaction.posted * 1000);

  return {
    sourceId: transaction.id,
    date,
    description: transaction.description,
    amount, // Positive = deposit, Negative = withdrawal (SimpleFIN convention)
    pending: transaction.pending || false,
    originalData: transaction,
    hash: generateTransactionHash(date, amount, transaction.description),
  };
}

/**
 * Convert mapped transaction to budget transaction format
 * Note: Transaction type uses amount sign for income/expense (positive = income, negative = expense)
 */
export function toBudgetTransaction(
  mapped: MappedTransaction,
  accountId: string
): Omit<Transaction, "id"> {
  const now = new Date();
  return {
    date: mapped.date,
    description: mapped.description,
    originalDescription: mapped.description, // Preserve original from SimpleFIN
    amount: mapped.amount, // Keep sign: positive = income, negative = expense
    category: null, // Will be auto-categorized if enabled
    subcategory: null,
    accountId,
    notes: mapped.pending
      ? `Pending transaction from SimpleFIN (ID: ${mapped.sourceId})`
      : `Imported from SimpleFIN (ID: ${mapped.sourceId})`,
    isRecurring: false,
    tags: ["simplefin-import"],
    createdAt: now,
    updatedAt: now,
  };
}

// =============================================================================
// DUPLICATE DETECTION
// =============================================================================

/**
 * Find duplicates between new transactions and existing ones
 */
export function findDuplicates(
  newTransactions: MappedTransaction[],
  existingTransactions: Transaction[]
): { unique: MappedTransaction[]; duplicates: MappedTransaction[] } {
  // Build set of existing hashes and SimpleFIN IDs (stored in notes or tags)
  const existingHashes = new Set<string>();
  const existingSourceIds = new Set<string>();

  for (const tx of existingTransactions) {
    // Check notes for SimpleFIN ID pattern
    if (tx.notes?.includes("SimpleFIN (ID:")) {
      const match = tx.notes.match(/SimpleFIN \(ID: ([^)]+)\)/);
      if (match) {
        existingSourceIds.add(`simplefin_${match[1]}`);
      }
    }

    // Also check by hash using date + amount + description
    const date = tx.date instanceof Date ? tx.date : new Date(tx.date);
    const hash = generateTransactionHash(date, tx.amount, tx.description);
    existingHashes.add(hash);
  }

  const unique: MappedTransaction[] = [];
  const duplicates: MappedTransaction[] = [];

  for (const tx of newTransactions) {
    const sourceId = `simplefin_${tx.sourceId}`;
    if (existingSourceIds.has(sourceId) || existingHashes.has(tx.hash)) {
      duplicates.push(tx);
    } else {
      unique.push(tx);
    }
  }

  return { unique, duplicates };
}

// =============================================================================
// SYNC SERVICE
// =============================================================================

/**
 * SimpleFIN Sync Service
 *
 * Orchestrates the synchronization process between SimpleFIN and local budget.
 */
export class SimpleFINSyncService {
  private client: SimpleFINClient;
  private settings: SimpleFINSettings;
  private onProgress?: (progress: SyncProgress) => void;

  constructor(
    accessUrl: string,
    settings: SimpleFINSettings,
    onProgress?: (progress: SyncProgress) => void
  ) {
    this.client = new SimpleFINClient({ accessUrl });
    this.settings = settings;
    this.onProgress = onProgress;
  }

  /**
   * Report progress to callback
   */
  private reportProgress(progress: Partial<SyncProgress>): void {
    if (this.onProgress) {
      this.onProgress({
        stage: "connecting",
        accountIndex: 0,
        totalAccounts: 0,
        currentAccount: "",
        transactionsProcessed: 0,
        message: "",
        ...progress,
      });
    }
  }

  /**
   * Fetch accounts from SimpleFIN
   */
  async fetchAccounts(): Promise<SimpleFINAccountSet> {
    this.reportProgress({
      stage: "connecting",
      message: "Connecting to SimpleFIN...",
    });

    return this.client.getAccounts({ balancesOnly: true });
  }

  /**
   * Generate import preview without actually importing
   */
  async generatePreview(
    linkedAccounts: LinkedAccount[],
    existingTransactions: Record<string, Transaction[]>,
    daysBack: number = DEFAULT_SYNC_DAYS
  ): Promise<ImportPreview[]> {
    const previews: ImportPreview[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.min(daysBack, MAX_SYNC_DAYS));

    this.reportProgress({
      stage: "fetching",
      message: "Fetching transactions from SimpleFIN...",
    });

    // Fetch accounts with transactions
    const accountIds = linkedAccounts
      .filter((a) => a.importEnabled && a.localAccountId)
      .map((a) => a.simplefinAccountId);

    if (accountIds.length === 0) {
      return [];
    }

    const result = await this.client.getAccounts({
      startDate,
      accountIds,
      includePending: this.settings.importPendingTransactions,
    });

    // Generate preview for each account
    for (const account of result.accounts) {
      const linked = linkedAccounts.find((a) => a.simplefinAccountId === account.id);
      if (!linked?.localAccountId) continue;

      const existing = existingTransactions[linked.localAccountId] || [];

      // Map transactions
      const mapped = (account.transactions || []).map((tx) =>
        mapSimpleFINTransaction(tx, account.id)
      );

      // Find duplicates
      const { unique, duplicates } = findDuplicates(mapped, existing);

      previews.push({
        accountId: account.id,
        accountName: account.name,
        transactions: unique,
        duplicates,
        balance: parseFloat(account.balance),
        balanceDate: new Date(account["balance-date"] * 1000),
      });
    }

    return previews;
  }

  /**
   * Perform full sync
   */
  async sync(
    linkedAccounts: LinkedAccount[],
    existingTransactions: Record<string, Transaction[]>,
    importTransaction: (tx: Omit<Transaction, "id">) => Promise<Transaction>,
    daysBack: number = DEFAULT_SYNC_DAYS
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const results: AccountSyncResult[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let totalImported = 0;
    let totalSkipped = 0;

    try {
      // Get accounts to sync
      const accountsToSync = linkedAccounts.filter((a) => a.importEnabled && a.localAccountId);

      if (accountsToSync.length === 0) {
        return {
          success: true,
          syncedAt: new Date(),
          accounts: [],
          totalTransactionsImported: 0,
          totalTransactionsSkipped: 0,
          errors: [],
          warnings: ["No accounts configured for import"],
          durationMs: Date.now() - startTime,
        };
      }

      this.reportProgress({
        stage: "fetching",
        totalAccounts: accountsToSync.length,
        message: `Fetching data for ${accountsToSync.length} accounts...`,
      });

      // Calculate date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.min(daysBack, MAX_SYNC_DAYS));

      // Fetch from SimpleFIN
      const accountIds = accountsToSync.map((a) => a.simplefinAccountId);
      const data = await this.client.getAccounts({
        startDate,
        accountIds,
        includePending: this.settings.importPendingTransactions,
      });

      // Add any API errors to warnings
      if (data.errors.length > 0) {
        warnings.push(...data.errors);
      }

      // Process each account
      for (let i = 0; i < data.accounts.length; i++) {
        const account = data.accounts[i];
        const linked = accountsToSync.find((a) => a.simplefinAccountId === account.id);

        if (!linked?.localAccountId) continue;

        this.reportProgress({
          stage: "processing",
          accountIndex: i + 1,
          totalAccounts: data.accounts.length,
          currentAccount: account.name,
          message: `Processing ${account.name}...`,
        });

        try {
          const result = await this.syncAccount(
            account,
            linked.localAccountId,
            existingTransactions[linked.localAccountId] || [],
            importTransaction
          );

          results.push(result);
          totalImported += result.transactionsImported;
          totalSkipped += result.transactionsSkipped;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          results.push({
            accountId: account.id,
            accountName: account.name,
            success: false,
            transactionsImported: 0,
            transactionsSkipped: 0,
            balance: parseFloat(account.balance),
            balanceDate: new Date(account["balance-date"] * 1000),
            error: errorMessage,
          });
          errors.push(`${account.name}: ${errorMessage}`);
        }
      }

      this.reportProgress({
        stage: "complete",
        message: `Sync complete. Imported ${totalImported} transactions.`,
      });

      return {
        success: errors.length === 0,
        syncedAt: new Date(),
        accounts: results,
        totalTransactionsImported: totalImported,
        totalTransactionsSkipped: totalSkipped,
        errors,
        warnings,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof SimpleFINError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unknown error during sync";

      this.reportProgress({
        stage: "error",
        message: errorMessage,
      });

      return {
        success: false,
        syncedAt: new Date(),
        accounts: results,
        totalTransactionsImported: totalImported,
        totalTransactionsSkipped: totalSkipped,
        errors: [errorMessage],
        warnings,
        durationMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Sync a single account
   */
  private async syncAccount(
    account: SimpleFINAccount,
    localAccountId: string,
    existingTransactions: Transaction[],
    importTransaction: (tx: Omit<Transaction, "id">) => Promise<Transaction>
  ): Promise<AccountSyncResult> {
    const transactions = account.transactions || [];

    // Map to our format
    const mapped = transactions.map((tx) => mapSimpleFINTransaction(tx, account.id));

    // Find duplicates
    const { unique, duplicates } = findDuplicates(mapped, existingTransactions);

    // Import unique transactions
    let imported = 0;
    for (const tx of unique) {
      try {
        const budgetTx = toBudgetTransaction(tx, localAccountId);
        await importTransaction(budgetTx);
        imported++;

        this.reportProgress({
          stage: "importing",
          currentAccount: account.name,
          transactionsProcessed: imported,
          message: `Importing transactions for ${account.name}... (${imported}/${unique.length})`,
        });
      } catch (error) {
        // Log but continue with other transactions
        console.error(`Failed to import transaction: ${error}`);
      }
    }

    return {
      accountId: account.id,
      accountName: account.name,
      success: true,
      transactionsImported: imported,
      transactionsSkipped: duplicates.length,
      balance: parseFloat(account.balance),
      balanceDate: new Date(account["balance-date"] * 1000),
    };
  }
}

// =============================================================================
// SCHEDULER
// =============================================================================

/**
 * Simple scheduler for auto-sync
 * In production, this would use a proper job scheduler
 */
export class SyncScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastSyncTime: Date | null = null;

  /**
   * Start auto-sync schedule
   */
  start(frequencyHours: number, syncFunction: () => Promise<void>): void {
    this.stop(); // Clear any existing schedule

    const intervalMs = frequencyHours * 60 * 60 * 1000;

    this.intervalId = setInterval(async () => {
      try {
        await syncFunction();
        this.lastSyncTime = new Date();
      } catch (error) {
        console.error("Auto-sync failed:", error);
      }
    }, intervalMs);

    // Run immediately if no recent sync
    if (!this.lastSyncTime) {
      syncFunction().catch(console.error);
      this.lastSyncTime = new Date();
    }
  }

  /**
   * Stop auto-sync
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

export default SimpleFINSyncService;
