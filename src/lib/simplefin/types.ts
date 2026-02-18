/**
 * SimpleFIN Integration Types
 *
 * Shared types for SimpleFIN bank connection integration
 */

import type { SimpleFINAccount, SimpleFINTransaction } from "./client";

// =============================================================================
// CONNECTION TYPES
// =============================================================================

/**
 * Status of a SimpleFIN connection
 */
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "syncing"
  | "error"
  | "expired";

/**
 * Stored SimpleFIN connection
 */
export interface SimpleFINConnection {
  id: string;
  userId: string;
  /** Encrypted access URL */
  encryptedAccessUrl: string;
  /** IV for decryption */
  iv: string;
  /** When connection was established */
  connectedAt: Date;
  /** Last successful sync */
  lastSyncAt: Date | null;
  /** Last sync error if any */
  lastError: string | null;
  /** Connection status */
  status: ConnectionStatus;
  /** Linked account IDs */
  linkedAccounts: LinkedAccount[];
  /** Auto-sync enabled */
  autoSyncEnabled: boolean;
  /** Sync frequency in hours (default 24) */
  syncFrequencyHours: number;
}

/**
 * Linked SimpleFIN account to local budget account
 */
export interface LinkedAccount {
  /** SimpleFIN account ID */
  simplefinAccountId: string;
  /** SimpleFIN account name */
  simplefinAccountName: string;
  /** Institution name */
  institutionName: string;
  /** Local budget account ID (null if not linked) */
  localAccountId: string | null;
  /** Account currency */
  currency: string;
  /** Last balance from SimpleFIN */
  lastBalance: number;
  /** Last balance date */
  lastBalanceDate: Date;
  /** Import transactions from this account */
  importEnabled: boolean;
}

// =============================================================================
// SYNC TYPES
// =============================================================================

/**
 * Sync result for a single account
 */
export interface AccountSyncResult {
  accountId: string;
  accountName: string;
  success: boolean;
  transactionsImported: number;
  transactionsSkipped: number; // Duplicates
  balance: number;
  balanceDate: Date;
  error?: string;
}

/**
 * Overall sync result
 */
export interface SyncResult {
  success: boolean;
  syncedAt: Date;
  accounts: AccountSyncResult[];
  totalTransactionsImported: number;
  totalTransactionsSkipped: number;
  errors: string[];
  warnings: string[];
  durationMs: number;
}

/**
 * Sync progress callback
 */
export interface SyncProgress {
  stage: "connecting" | "fetching" | "processing" | "importing" | "complete" | "error";
  accountIndex: number;
  totalAccounts: number;
  currentAccount: string;
  transactionsProcessed: number;
  message: string;
}

// =============================================================================
// IMPORT TYPES
// =============================================================================

/**
 * Mapped transaction ready for import
 */
export interface MappedTransaction {
  /** Source SimpleFIN transaction ID */
  sourceId: string;
  /** Date of transaction */
  date: Date;
  /** Transaction description */
  description: string;
  /** Amount (positive = income, negative = expense) */
  amount: number;
  /** Whether transaction is pending */
  pending: boolean;
  /** Original SimpleFIN data for reference */
  originalData: SimpleFINTransaction;
  /** Hash for duplicate detection */
  hash: string;
}

/**
 * Import preview for user review
 */
export interface ImportPreview {
  accountId: string;
  accountName: string;
  transactions: MappedTransaction[];
  duplicates: MappedTransaction[];
  balance: number;
  balanceDate: Date;
}

// =============================================================================
// SETTINGS TYPES
// =============================================================================

/**
 * SimpleFIN integration settings
 */
export interface SimpleFINSettings {
  /** Connection ID (if connected) */
  connectionId: string | null;
  /** Auto-sync enabled */
  autoSyncEnabled: boolean;
  /** Sync frequency in hours */
  syncFrequencyHours: number;
  /** Import pending transactions */
  importPendingTransactions: boolean;
  /** Default date range for sync (days) */
  defaultSyncDays: number;
  /** Show sync notifications */
  showSyncNotifications: boolean;
  /** Auto-categorize imported transactions */
  autoCategorize: boolean;
  /** Account mappings */
  accountMappings: Record<string, string>; // simplefinId -> localAccountId
}

/**
 * Default settings
 */
export const DEFAULT_SIMPLEFIN_SETTINGS: SimpleFINSettings = {
  connectionId: null,
  autoSyncEnabled: true,
  syncFrequencyHours: 24,
  importPendingTransactions: false,
  defaultSyncDays: 30,
  showSyncNotifications: true,
  autoCategorize: true,
  accountMappings: {},
};

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * SimpleFIN account with parsed data
 */
export interface ParsedSimpleFINAccount {
  id: string;
  name: string;
  institution: string;
  currency: string;
  balance: number;
  availableBalance?: number;
  balanceDate: Date;
  transactionCount: number;
}

/**
 * Parse SimpleFIN account for display
 */
export function parseSimpleFINAccountForDisplay(account: SimpleFINAccount): ParsedSimpleFINAccount {
  return {
    id: account.id,
    name: account.name,
    institution: account.org.name || account.org.domain || "Unknown Institution",
    currency: account.currency,
    balance: parseFloat(account.balance),
    availableBalance: account["available-balance"]
      ? parseFloat(account["available-balance"])
      : undefined,
    balanceDate: new Date(account["balance-date"] * 1000),
    transactionCount: account.transactions?.length || 0,
  };
}
