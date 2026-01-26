/**
 * Budget App IndexedDB Database Layer
 * Uses Dexie.js for IndexedDB management
 */

import Dexie, { Table } from 'dexie';

import type {
  Account,
  Transaction,
  Category,
  Budget,
  FuturePurchase,
  RetirementPlan,
  ImportMapping,
  ImportMetadata,
  Receipt,
  Investment,
  Portfolio,
  InvestmentHolding,
  InvestmentTransaction,
  MarketData,
  WatchlistItem,
  PortfolioSnapshot,
  InvestmentAccount,
  Holding,
  AnomalyFeedback,
  PredictionAccuracy,
  Loan,
  LoanPayment,
  Subscription,
  ExcludedSubscription,
} from '@/types/budget';
import type { Profile, ActivityLogEntry } from '@/types/profile';
import {
  encryptTransaction,
  decryptTransaction,
  encryptAccount,
  decryptAccount,
  isEncryptionAvailable,
} from './encryption';

// Re-export types for convenience
export type { InvestmentAccount, Holding, Subscription } from '@/types/budget';

/**
 * Budget Database Schema
 * Using Dexie.js for persistent IndexedDB storage
 */

export interface PriceCache {
  id: string;
  symbol: string;
  price: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
  fetchedAt: Date;
  source: 'yahoo' | 'fallback';
}

// Import sync types
import type { PairedDevice } from './sync/types';

/**
 * Check if we're in a development environment.
 * Used to determine database isolation and show dev indicators.
 */
export function isDevEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  return hostname === 'localhost' ||
         hostname === '127.0.0.1' ||
         hostname.includes('.local') ||
         hostname.includes('dev.') ||
         hostname.includes('-dev.') ||
         hostname.includes('.vercel.app'); // Preview deployments
}

/**
 * Get the database name based on environment.
 * Development uses a separate database to prevent test data from appearing in production.
 */
export function getDatabaseName(): string {
  const baseName = 'HouseholdBudgetApp';
  return isDevEnvironment() ? `${baseName}_dev` : baseName;
}

export class BudgetDatabase extends Dexie {
  accounts!: Table<Account>;
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  budgets!: Table<Budget>;
  futurePurchases!: Table<FuturePurchase>;
  retirementPlans!: Table<RetirementPlan>;
  importMappings!: Table<ImportMapping>;
  importHistory!: Table<ImportMetadata>;
  receipts!: Table<Receipt>;
  investmentAccounts!: Table<InvestmentAccount>;
  holdings!: Table<Holding>;
  priceCache!: Table<PriceCache>;
  anomalyFeedback!: Table<AnomalyFeedback>;
  predictionAccuracy!: Table<PredictionAccuracy>;
  loans!: Table<Loan>;
  loanPayments!: Table<LoanPayment>;
  subscriptions!: Table<Subscription>;
  excludedSubscriptions!: Table<ExcludedSubscription>;
  pairedDevices!: Table<PairedDevice>;
  // Multi-Profile Support (Phase 16)
  profiles!: Table<Profile>;
  activityLog!: Table<ActivityLogEntry>;

  constructor() {
    super(getDatabaseName());

    this.version(1).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId'
    });

    // Version 2: Add receipts table
    this.version(2).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize'
    });

    // Version 3: Add investment tracking tables (Phase 8)
    this.version(3).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]'
    });

    // Version 4: Add price cache for market data (Phase 8)
    this.version(4).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source'
    });

    // Version 5: Add split transaction support (Phase 6)
    this.version(5).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source'
    });

    // Version 6: Add anomaly feedback (Phase 3: AI Features)
    this.version(6).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt'
    });

    // Version 7: Add prediction accuracy tracking (Phase 3: AI Features)
    this.version(7).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt'
    });

    // Version 8: Add loan tracking tables
    this.version(8).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt',
      loans: 'id, type, status, lender, nextPaymentDate, accountId',
      loanPayments: 'id, loanId, date, transactionId, isScheduled'
    });

    // Version 9: Add payment frequency to loans
    this.version(9).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt',
      loans: 'id, type, status, lender, nextPaymentDate, accountId, paymentFrequency',
      loanPayments: 'id, loanId, date, transactionId, isScheduled'
    });

    // Version 10: Add import history tracking
    this.version(10).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      importHistory: 'id, importDate, fileFormat, bank, fileName',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt',
      loans: 'id, type, status, lender, nextPaymentDate, accountId, paymentFrequency',
      loanPayments: 'id, loanId, date, transactionId, isScheduled'
    });

    // Version 11: Add subscription management
    this.version(11).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      importHistory: 'id, importDate, fileFormat, bank, fileName',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt',
      loans: 'id, type, status, lender, nextPaymentDate, accountId, paymentFrequency',
      loanPayments: 'id, loanId, date, transactionId, isScheduled',
      subscriptions: 'id, name, status, category, nextBillingDate, billingCycle, merchantToken, source'
    });

    // Version 12: Add excluded subscriptions (dismiss false positives)
    this.version(12).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      importHistory: 'id, importDate, fileFormat, bank, fileName',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt',
      loans: 'id, type, status, lender, nextPaymentDate, accountId, paymentFrequency',
      loanPayments: 'id, loanId, date, transactionId, isScheduled',
      subscriptions: 'id, name, status, category, nextBillingDate, billingCycle, merchantToken, source',
      excludedSubscriptions: 'id, merchantToken, excludedAt'
    });

    // Version 13: Add LAN Sync paired devices (Phase 7)
    this.version(13).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      importHistory: 'id, importDate, fileFormat, bank, fileName',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt',
      loans: 'id, type, status, lender, nextPaymentDate, accountId, paymentFrequency',
      loanPayments: 'id, loanId, date, transactionId, isScheduled',
      subscriptions: 'id, name, status, category, nextBillingDate, billingCycle, merchantToken, source',
      excludedSubscriptions: 'id, merchantToken, excludedAt',
      pairedDevices: 'id, deviceId, deviceName, trustLevel, lastSyncAt, createdAt'
    });

    // Version 14: Round all transaction amounts to 2 decimal places
    // Fixes floating-point precision errors in existing data
    this.version(14).stores({
      accounts: 'id, name, institution, type',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      importHistory: 'id, importDate, fileFormat, bank, fileName',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt',
      loans: 'id, type, status, lender, nextPaymentDate, accountId, paymentFrequency',
      loanPayments: 'id, loanId, date, transactionId, isScheduled',
      subscriptions: 'id, name, status, category, nextBillingDate, billingCycle, merchantToken, source',
      excludedSubscriptions: 'id, merchantToken, excludedAt',
      pairedDevices: 'id, deviceId, deviceName, trustLevel, lastSyncAt, createdAt'
    }).upgrade(async tx => {
      // Round all transaction amounts to exactly 2 decimal places
      const transactions = await tx.table('transactions').toArray();
      for (const trans of transactions) {
        const rounded = Math.round(trans.amount * 100) / 100;
        if (trans.amount !== rounded) {
          await tx.table('transactions').update(trans.id, { amount: rounded });
        }
      }

      // Also round account balances
      const accounts = await tx.table('accounts').toArray();
      for (const acc of accounts) {
        if (acc.balance !== undefined) {
          const rounded = Math.round(acc.balance * 100) / 100;
          if (acc.balance !== rounded) {
            await tx.table('accounts').update(acc.id, { balance: rounded });
          }
        }
      }

      // Round budget amounts
      const budgets = await tx.table('budgets').toArray();
      for (const budget of budgets) {
        const rounded = Math.round(budget.amount * 100) / 100;
        if (budget.amount !== rounded) {
          await tx.table('budgets').update(budget.id, { amount: rounded });
        }
      }
    });

    // Version 15: Add bankId field to accounts for OFX BANKID (routing number) matching
    // This enables composite key matching (BANKID + last4) per OFX specification
    // to prevent cross-bank account confusion when multiple banks have same last-4-digits
    this.version(15).stores({
      accounts: 'id, name, institution, type, bankId',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      importHistory: 'id, importDate, fileFormat, bank, fileName',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt',
      loans: 'id, type, status, lender, nextPaymentDate, accountId, paymentFrequency',
      loanPayments: 'id, loanId, date, transactionId, isScheduled',
      subscriptions: 'id, name, status, category, nextBillingDate, billingCycle, merchantToken, source',
      excludedSubscriptions: 'id, merchantToken, excludedAt',
      pairedDevices: 'id, deviceId, deviceName, trustLevel, lastSyncAt, createdAt'
    });

    // Version 16: Add multi-profile support with profiles and activity log tables
    // Enables multiple family members to have separate profiles with PIN protection
    this.version(16).stores({
      accounts: 'id, name, institution, type, bankId',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate, ownerId, visibility',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      importHistory: 'id, importDate, fileFormat, bank, fileName',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt',
      loans: 'id, type, status, lender, nextPaymentDate, accountId, paymentFrequency',
      loanPayments: 'id, loanId, date, transactionId, isScheduled',
      subscriptions: 'id, name, status, category, nextBillingDate, billingCycle, merchantToken, source',
      excludedSubscriptions: 'id, merchantToken, excludedAt',
      pairedDevices: 'id, deviceId, deviceName, trustLevel, lastSyncAt, createdAt',
      // New tables for multi-profile support
      profiles: 'id, name, isDefault, createdAt',
      activityLog: 'id, profileId, action, entityType, timestamp, [profileId+timestamp]'
    }).upgrade(async tx => {
      // Create default profile for existing users (migration)
      const profilesTable = tx.table('profiles');
      const existingProfiles = await profilesTable.count();

      if (existingProfiles === 0) {
        console.log('[DB Migration v16] Creating default profile for existing user...');
        await profilesTable.add({
          id: 'default-profile',
          name: 'Default',
          pinHash: null,
          pinSalt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: true,
          avatarColor: '#10b981', // Emerald green
          order: 0,
        });
        console.log('[DB Migration v16] Default profile created successfully');
      }

      // Set existing budgets to shared visibility (null ownerId = shared)
      const budgetsTable = tx.table('budgets');
      const budgets = await budgetsTable.toArray();
      for (const budget of budgets) {
        if (budget.visibility === undefined) {
          await budgetsTable.update(budget.id, {
            visibility: 'shared',
            ownerId: null,
          });
        }
      }
      console.log('[DB Migration v16] Updated', budgets.length, 'budgets to shared visibility');
    });

    // Version 17: Add balance reconciliation tracking fields to accounts
    // Tracks when accounts were last reconciled and what balance was confirmed
    this.version(17).stores({
      accounts: 'id, name, institution, type, bankId',
      transactions: 'id, accountId, date, category, amount, description, splitFromId, isSplit',
      categories: 'id, name, type, order',
      budgets: 'id, categoryId, period, startDate, ownerId, visibility',
      futurePurchases: 'id, targetDate, priority, isCompleted',
      retirementPlans: 'id, name, createdAt',
      importMappings: 'id, institution, accountId',
      importHistory: 'id, importDate, fileFormat, bank, fileName',
      receipts: 'id, transactionId, uploadedAt, mimeType, fileSize',
      investmentAccounts: 'id, type, name, createdAt',
      holdings: 'id, accountId, symbol, purchaseDate, [accountId+symbol]',
      priceCache: 'id, symbol, fetchedAt, source',
      anomalyFeedback: 'id, transactionId, merchant, category, createdAt',
      predictionAccuracy: 'id, category, month, recordedAt',
      loans: 'id, type, status, lender, nextPaymentDate, accountId, paymentFrequency',
      loanPayments: 'id, loanId, date, transactionId, isScheduled',
      subscriptions: 'id, name, status, category, nextBillingDate, billingCycle, merchantToken, source',
      excludedSubscriptions: 'id, merchantToken, excludedAt',
      pairedDevices: 'id, deviceId, deviceName, trustLevel, lastSyncAt, createdAt',
      profiles: 'id, name, isDefault, createdAt',
      activityLog: 'id, profileId, action, entityType, timestamp, [profileId+timestamp]'
    }).upgrade(async tx => {
      // Migrate existing accounts: set default reconciliation values
      // Accounts with balance > 0 are marked as reconciled at creation time
      const accountsTable = tx.table('accounts');
      const accounts = await accountsTable.toArray();

      for (const account of accounts) {
        // Only update if these fields are not already set
        if (account.lastReconciledAt === undefined) {
          const updates: Record<string, unknown> = {};

          // If account has a non-zero balance, assume it was reconciled at creation
          if (account.balance && account.balance !== 0) {
            updates.lastReconciledAt = account.createdAt || new Date();
            updates.lastReconciledBalance = account.balance;
            updates.openingBalanceDate = account.createdAt || new Date();
          }

          if (Object.keys(updates).length > 0) {
            await accountsTable.update(account.id, updates);
          }
        }
      }

      console.log('[DB Migration v17] Updated', accounts.length, 'accounts with reconciliation tracking');
    });
  }
}

// Lazy initialization to avoid SSR issues
// Database is only created when accessed in the browser
let _db: BudgetDatabase | null = null;

function getDatabase(): BudgetDatabase {
  if (typeof window === 'undefined') {
    // Server-side: return a mock that throws helpful errors
    throw new Error('IndexedDB is only available in the browser. This code should only run client-side.');
  }

  if (!_db) {
    _db = new BudgetDatabase();
  }

  return _db;
}

// Export database instance via getter
export const db = new Proxy({} as BudgetDatabase, {
  get(target, prop) {
    const database = getDatabase();
    const value = database[prop as keyof BudgetDatabase];

    // Bind methods to the database instance
    if (typeof value === 'function') {
      return value.bind(database);
    }

    return value;
  }
});

// Default categories to seed on first use
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  {
    name: 'Food & Dining',
    type: 'expense',
    subcategories: ['Groceries', 'Restaurants', 'Coffee', 'Fast Food', 'Delivery'],
    color: '#10b981',
    icon: 'utensils',
    isDefault: true,
    order: 1,
  },
  {
    name: 'Transportation',
    type: 'expense',
    subcategories: ['Gas', 'Public Transit', 'Parking', 'Maintenance', 'Car Payment'],
    color: '#3b82f6',
    icon: 'car',
    isDefault: true,
    order: 2,
  },
  {
    name: 'Bills & Utilities',
    type: 'expense',
    subcategories: ['Electricity', 'Water', 'Internet', 'Phone', 'Insurance', 'Gas/Heating'],
    color: '#ef4444',
    icon: 'file-text',
    isDefault: true,
    order: 3,
  },
  {
    name: 'Shopping',
    type: 'expense',
    subcategories: ['Clothing', 'Electronics', 'Home Goods', 'Personal Care', 'Gifts'],
    color: '#8b5cf6',
    icon: 'shopping-bag',
    isDefault: true,
    order: 4,
  },
  {
    name: 'Entertainment',
    type: 'expense',
    subcategories: ['Streaming', 'Movies', 'Games', 'Hobbies', 'Events'],
    color: '#ec4899',
    icon: 'tv',
    isDefault: true,
    order: 5,
  },
  {
    name: 'Health & Fitness',
    type: 'expense',
    subcategories: ['Gym', 'Medical', 'Pharmacy', 'Supplements', 'Therapy'],
    color: '#06b6d4',
    icon: 'heart',
    isDefault: true,
    order: 6,
  },
  {
    name: 'Housing',
    type: 'expense',
    subcategories: ['Rent/Mortgage', 'Property Tax', 'Maintenance', 'HOA', 'Home Improvement'],
    color: '#f59e0b',
    icon: 'home',
    isDefault: true,
    order: 7,
  },
  {
    name: 'Income',
    type: 'income',
    subcategories: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Other'],
    color: '#22c55e',
    icon: 'dollar-sign',
    isDefault: true,
    order: 8,
  },
  {
    name: 'Savings & Investments',
    type: 'expense',
    subcategories: ['Emergency Fund', 'Retirement', 'Stocks', 'TFSA', 'RRSP'],
    color: '#14b8a6',
    icon: 'trending-up',
    isDefault: true,
    order: 9,
  },
  {
    name: 'Education',
    type: 'expense',
    subcategories: ['Tuition', 'Books', 'Courses', 'Supplies', 'Student Loans'],
    color: '#6366f1',
    icon: 'book',
    isDefault: true,
    order: 10,
  },
  {
    name: 'Pets',
    type: 'expense',
    subcategories: ['Food', 'Vet', 'Grooming', 'Supplies', 'Pet Insurance'],
    color: '#f97316',
    icon: 'paw',
    isDefault: true,
    order: 11,
  },
  {
    name: 'Travel',
    type: 'expense',
    subcategories: ['Flights', 'Hotels', 'Food', 'Activities', 'Transportation'],
    color: '#0ea5e9',
    icon: 'plane',
    isDefault: true,
    order: 12,
  },
  {
    name: 'Miscellaneous',
    type: 'expense',
    subcategories: ['Gifts', 'Donations', 'Fees', 'Other'],
    color: '#64748b',
    icon: 'more-horizontal',
    isDefault: true,
    order: 13,
  },
];

// Helper function to initialize default categories
export async function initializeDefaultCategories(): Promise<void> {
  try {
    console.log('[DB] initializeDefaultCategories: Starting...');
    console.log('[DB] initializeDefaultCategories: Fetching existing categories...');
    const existing = await db.categories.toArray();
    console.log('[DB] initializeDefaultCategories: Found', existing.length, 'existing categories');

    if (existing.length === 0) {
      console.log('[DB] initializeDefaultCategories: No categories found, adding defaults...');
      const categories = DEFAULT_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: `cat_${index + 1}`,
        createdAt: new Date(),
      }));
      await db.categories.bulkAdd(categories);
      console.log('[DB] initializeDefaultCategories: Added', categories.length, 'default categories');
    } else {
      console.log('[DB] initializeDefaultCategories: Categories already exist, skipping initialization');
    }
    console.log('[DB] initializeDefaultCategories: Complete');
  } catch (error) {
    // If categories already exist (ConstraintError), silently ignore
    // This can happen if multiple components try to initialize simultaneously
    console.log('[DB] initializeDefaultCategories: Caught error:', error);
    if (error instanceof Error && error.name !== 'ConstraintError') {
      console.error('[DB] initializeDefaultCategories: Non-constraint error:', error);
    } else {
      console.log('[DB] initializeDefaultCategories: ConstraintError (expected), ignoring');
    }
  }
}

// Receipt Management Functions

/**
 * Generate a thumbnail for an image file
 * @param file The image file to generate thumbnail from
 * @param maxWidth Maximum width of thumbnail (default: 200px)
 * @param maxHeight Maximum height of thumbnail (default: 200px)
 * @returns Promise<Blob> The thumbnail blob
 */
export async function generateThumbnail(
  file: File | Blob,
  maxWidth: number = 200,
  maxHeight: number = 200
): Promise<Blob | null> {
  // Only generate thumbnails for images
  if (!file.type.startsWith('image/')) {
    return null;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress the image
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          0.7 // 70% quality for thumbnails
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Store a receipt in IndexedDB
 * @param transactionId The associated transaction ID
 * @param file The receipt file to store
 * @returns Promise<string> The receipt ID
 */
export async function storeReceipt(
  transactionId: string,
  file: File
): Promise<string> {
  try {
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate thumbnail for images
    const thumbnail = await generateThumbnail(file);

    // Create receipt object
    const receipt: Receipt = {
      id: receiptId,
      transactionId,
      filename: file.name,
      mimeType: file.type,
      blob: file,
      thumbnail: thumbnail || undefined,
      fileSize: file.size,
      uploadedAt: new Date(),
      metadata: {
        // Will be populated later for images after loading
      }
    };

    // Store in database
    await db.receipts.add(receipt);

    // Update transaction with receipt ID
    const transaction = await db.transactions.get(transactionId);
    if (transaction) {
      const receiptIds = transaction.receiptIds || [];
      receiptIds.push(receiptId);
      await db.transactions.update(transactionId, { receiptIds });
    }

    return receiptId;
  } catch (error) {
    console.error('Error storing receipt:', error);
    throw error;
  }
}

/**
 * Get all receipts for a transaction
 * @param transactionId The transaction ID
 * @returns Promise<Receipt[]> Array of receipts
 */
export async function getTransactionReceipts(
  transactionId: string
): Promise<Receipt[]> {
  try {
    return await db.receipts.where('transactionId').equals(transactionId).toArray();
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return [];
  }
}

/**
 * Delete a receipt
 * @param receiptId The receipt ID to delete
 * @param transactionId The associated transaction ID
 */
export async function deleteReceipt(
  receiptId: string,
  transactionId: string
): Promise<void> {
  try {
    // Delete from receipts table
    await db.receipts.delete(receiptId);

    // Update transaction to remove receipt ID
    const transaction = await db.transactions.get(transactionId);
    if (transaction && transaction.receiptIds) {
      const updatedReceiptIds = transaction.receiptIds.filter(id => id !== receiptId);
      await db.transactions.update(transactionId, { receiptIds: updatedReceiptIds });
    }
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw error;
  }
}

/**
 * Get receipt blob URL for display
 * @param receipt The receipt object
 * @returns string The blob URL for display
 */
export function getReceiptBlobUrl(receipt: Receipt): string {
  return URL.createObjectURL(receipt.blob);
}

/**
 * Get thumbnail blob URL for display
 * @param receipt The receipt object
 * @returns string | null The thumbnail blob URL or null if no thumbnail
 */
export function getThumbnailBlobUrl(receipt: Receipt): string | null {
  if (!receipt.thumbnail) return null;
  return URL.createObjectURL(receipt.thumbnail);
}

// Investment Account Management Functions (Phase 8)

/**
 * Create a new investment account
 * @param account Investment account data (without id, createdAt, updatedAt)
 * @returns Promise<string> The account ID
 */
export async function createInvestmentAccount(
  account: Omit<InvestmentAccount, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const accountId = `inv_acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newAccount: InvestmentAccount = {
      ...account,
      id: accountId,
      createdAt: now,
      updatedAt: now,
    };

    await db.investmentAccounts.add(newAccount);
    return accountId;
  } catch (error) {
    console.error('Error creating investment account:', error);
    throw error;
  }
}

/**
 * Get all investment accounts
 * @returns Promise<InvestmentAccount[]> Array of investment accounts
 */
export async function getInvestmentAccounts(): Promise<InvestmentAccount[]> {
  try {
    return await db.investmentAccounts.toArray();
  } catch (error) {
    console.error('Error fetching investment accounts:', error);
    return [];
  }
}

/**
 * Get a single investment account by ID
 * @param accountId The account ID
 * @returns Promise<InvestmentAccount | undefined> The account or undefined
 */
export async function getInvestmentAccount(
  accountId: string
): Promise<InvestmentAccount | undefined> {
  try {
    return await db.investmentAccounts.get(accountId);
  } catch (error) {
    console.error('Error fetching investment account:', error);
    return undefined;
  }
}

/**
 * Update an investment account
 * @param accountId The account ID
 * @param updates Partial account updates
 */
export async function updateInvestmentAccount(
  accountId: string,
  updates: Partial<Omit<InvestmentAccount, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    await db.investmentAccounts.update(accountId, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating investment account:', error);
    throw error;
  }
}

/**
 * Delete an investment account and all its holdings
 * @param accountId The account ID
 */
export async function deleteInvestmentAccount(accountId: string): Promise<void> {
  try {
    // Delete all holdings for this account
    await db.holdings.where('accountId').equals(accountId).delete();
    // Delete the account
    await db.investmentAccounts.delete(accountId);
  } catch (error) {
    console.error('Error deleting investment account:', error);
    throw error;
  }
}

// Holdings Management Functions

/**
 * Add a holding to an investment account
 * @param holding Holding data (without id, createdAt, updatedAt)
 * @returns Promise<string> The holding ID
 */
export async function addHolding(
  holding: Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const holdingId = `holding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newHolding: Holding = {
      ...holding,
      id: holdingId,
      createdAt: now,
      updatedAt: now,
    };

    await db.holdings.add(newHolding);
    return holdingId;
  } catch (error) {
    console.error('Error adding holding:', error);
    throw error;
  }
}

/**
 * Get all holdings for an investment account
 * @param accountId The account ID
 * @returns Promise<Holding[]> Array of holdings
 */
export async function getAccountHoldings(accountId: string): Promise<Holding[]> {
  try {
    return await db.holdings.where('accountId').equals(accountId).toArray();
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return [];
  }
}

/**
 * Get all holdings across all accounts
 * @returns Promise<Holding[]> Array of all holdings
 */
export async function getAllHoldings(): Promise<Holding[]> {
  try {
    return await db.holdings.toArray();
  } catch (error) {
    console.error('Error fetching all holdings:', error);
    return [];
  }
}

/**
 * Get a single holding by ID
 * @param holdingId The holding ID
 * @returns Promise<Holding | undefined> The holding or undefined
 */
export async function getHolding(holdingId: string): Promise<Holding | undefined> {
  try {
    return await db.holdings.get(holdingId);
  } catch (error) {
    console.error('Error fetching holding:', error);
    return undefined;
  }
}

/**
 * Update a holding
 * @param holdingId The holding ID
 * @param updates Partial holding updates
 */
export async function updateHolding(
  holdingId: string,
  updates: Partial<Omit<Holding, 'id' | 'accountId' | 'createdAt'>>
): Promise<void> {
  try {
    await db.holdings.update(holdingId, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating holding:', error);
    throw error;
  }
}

/**
 * Delete a holding
 * @param holdingId The holding ID
 */
export async function deleteHolding(holdingId: string): Promise<void> {
  try {
    await db.holdings.delete(holdingId);
  } catch (error) {
    console.error('Error deleting holding:', error);
    throw error;
  }
}

/**
 * Calculate total value of holdings for an account
 * @param accountId The account ID
 * @param currentPrices Map of symbol to current price
 * @returns Promise<number> Total account value
 */
export async function calculateAccountValue(
  accountId: string,
  currentPrices: Record<string, number>
): Promise<number> {
  try {
    const holdings = await getAccountHoldings(accountId);
    return holdings.reduce((total, holding) => {
      const currentPrice = currentPrices[holding.symbol] || holding.purchasePrice;
      return total + (holding.quantity * currentPrice);
    }, 0);
  } catch (error) {
    console.error('Error calculating account value:', error);
    return 0;
  }
}

/**
 * Calculate total gain/loss for an account
 * @param accountId The account ID
 * @param currentPrices Map of symbol to current price
 * @returns Promise<{gainLoss: number, percentage: number}> Gain/loss and percentage
 */
export async function calculateAccountGainLoss(
  accountId: string,
  currentPrices: Record<string, number>
): Promise<{ gainLoss: number; percentage: number }> {
  try {
    const holdings = await getAccountHoldings(accountId);
    
    let totalCost = 0;
    let totalValue = 0;
    
    holdings.forEach((holding) => {
      const cost = holding.quantity * holding.purchasePrice;
      const currentPrice = currentPrices[holding.symbol] || holding.purchasePrice;
      const value = holding.quantity * currentPrice;
      
      totalCost += cost;
      totalValue += value;
    });
    
    const gainLoss = totalValue - totalCost;
    const percentage = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
    
    return { gainLoss, percentage };
  } catch (error) {
    console.error('Error calculating gain/loss:', error);
    return { gainLoss: 0, percentage: 0 };
  }
}

// Split Transaction Functions (Phase 6)

export interface SplitData {
  category: string;
  subcategory: string;
  amount: number;
  notes: string;
}

/**
 * Split a transaction into multiple child transactions
 * @param originalTransaction The transaction to split
 * @param splits Array of split data
 */
export async function splitTransaction(
  originalTransaction: Transaction,
  splits: SplitData[]
): Promise<void> {
  try {
    // 1. Mark original as split (hide from list)
    await db.transactions.update(originalTransaction.id, { isSplit: true });

    // 2. Create child transactions for each split
    for (const split of splits) {
      const childTransaction: Transaction = {
        ...originalTransaction,
        id: `tx_split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        splitFromId: originalTransaction.id,
        category: split.category,
        subcategory: split.subcategory || null,
        amount: originalTransaction.amount < 0 ? -split.amount : split.amount, // Preserve sign
        notes: split.notes || originalTransaction.notes,
        isSplit: false,
        updatedAt: new Date(),
      };

      await db.transactions.add(childTransaction);
    }
  } catch (error) {
    console.error('Error splitting transaction:', error);
    throw error;
  }
}

/**
 * Unsplit a transaction - restore original and delete children
 * @param originalTransactionId The ID of the original transaction
 */
export async function unsplitTransaction(originalTransactionId: string): Promise<void> {
  try {
    // 1. Find all child transactions
    const children = await db.transactions
      .where('splitFromId')
      .equals(originalTransactionId)
      .toArray();

    // 2. Delete all children
    await db.transactions.bulkDelete(children.map(child => child.id));

    // 3. Restore original transaction
    await db.transactions.update(originalTransactionId, { isSplit: false });
  } catch (error) {
    console.error('Error unsplitting transaction:', error);
    throw error;
  }
}

/**
 * Get child transactions for a split transaction
 * @param parentTransactionId The parent transaction ID
 * @returns Promise<Transaction[]> Array of child transactions
 */
export async function getSplitChildren(parentTransactionId: string): Promise<Transaction[]> {
  try {
    return await db.transactions
      .where('splitFromId')
      .equals(parentTransactionId)
      .toArray();
  } catch (error) {
    console.error('Error fetching split children:', error);
    return [];
  }
}

/**
 * Check if a transaction is split
 * @param transactionId The transaction ID
 * @returns Promise<boolean> True if transaction is split
 */
export async function isTransactionSplit(transactionId: string): Promise<boolean> {
  try {
    const transaction = await db.transactions.get(transactionId);
    return transaction?.isSplit || false;
  } catch (error) {
    console.error('Error checking split status:', error);
    return false;
  }
}

// Anomaly Feedback Functions (Phase 3: AI Features)

/**
 * Store user feedback for an anomaly detection
 * @param transactionId The transaction ID
 * @param merchant The merchant name
 * @param category The category
 * @param amount The transaction amount
 * @param wasExpected Whether the transaction was expected (true) or unexpected (false)
 */
export async function storeAnomalyFeedback(
  transactionId: string,
  merchant: string,
  category: string,
  amount: number,
  wasExpected: boolean
): Promise<string> {
  try {
    const feedbackId = `anomaly_feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const feedback: AnomalyFeedback = {
      id: feedbackId,
      transactionId,
      merchant,
      category,
      amount,
      wasExpected,
      createdAt: new Date(),
    };

    await db.anomalyFeedback.add(feedback);
    return feedbackId;
  } catch (error) {
    console.error('Error storing anomaly feedback:', error);
    throw error;
  }
}

/**
 * Get feedback for a specific transaction
 * @param transactionId The transaction ID
 * @returns Promise<AnomalyFeedback | undefined> The feedback or undefined
 */
export async function getAnomalyFeedback(transactionId: string): Promise<AnomalyFeedback | undefined> {
  try {
    return await db.anomalyFeedback
      .where('transactionId')
      .equals(transactionId)
      .first();
  } catch (error) {
    console.error('Error fetching anomaly feedback:', error);
    return undefined;
  }
}

/**
 * Get all feedback for a merchant/category to improve detection
 * @param merchant The merchant name (optional)
 * @param category The category (optional)
 * @returns Promise<AnomalyFeedback[]> Array of feedback
 */
export async function getAnomalyFeedbackForContext(
  merchant?: string,
  category?: string
): Promise<AnomalyFeedback[]> {
  try {
    let query = db.anomalyFeedback.toCollection();
    
    if (merchant) {
      query = query.filter(f => f.merchant === merchant);
    }
    if (category) {
      query = query.filter(f => f.category === category);
    }
    
    return await query.toArray();
  } catch (error) {
    console.error('Error fetching anomaly feedback:', error);
    return [];
  }
}

// Prediction Accuracy Functions (Phase 3: AI Features)

/**
 * Store prediction accuracy data
 * @param accuracy The accuracy data to store
 */
export async function storePredictionAccuracy(
  accuracy: Omit<PredictionAccuracy, 'id'>
): Promise<string> {
  try {
    const accuracyId = `prediction_accuracy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const record: PredictionAccuracy = {
      id: accuracyId,
      ...accuracy,
    };

    await db.predictionAccuracy.add(record);
    return accuracyId;
  } catch (error) {
    console.error('Error storing prediction accuracy:', error);
    throw error;
  }
}

/**
 * Get prediction accuracy for a category
 * @param category The category name
 * @param monthsBack Number of months to look back (default: 6)
 */
export async function getPredictionAccuracy(
  category: string,
  monthsBack: number = 6
): Promise<PredictionAccuracy[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);
    
    return await db.predictionAccuracy
      .where('category')
      .equals(category)
      .filter(acc => acc.month >= cutoffDate)
      .sortBy('month');
  } catch (error) {
    console.error('Error fetching prediction accuracy:', error);
    return [];
  }
}

/**
 * Get average prediction accuracy across all categories
 */
export async function getOverallPredictionAccuracy(): Promise<{
  averageError: number;
  averageErrorPercent: number;
  totalRecords: number;
}> {
  try {
    const allRecords = await db.predictionAccuracy.toArray();
    
    if (allRecords.length === 0) {
      return { averageError: 0, averageErrorPercent: 0, totalRecords: 0 };
    }
    
    const avgError = allRecords.reduce((sum, r) => sum + r.error, 0) / allRecords.length;
    const avgErrorPercent = allRecords.reduce((sum, r) => sum + r.errorPercent, 0) / allRecords.length;
    
    return {
      averageError: avgError,
      averageErrorPercent: avgErrorPercent,
      totalRecords: allRecords.length,
    };
  } catch (error) {
    console.error('Error calculating overall accuracy:', error);
    return { averageError: 0, averageErrorPercent: 0, totalRecords: 0 };
  }
}

// ========================================
// ENCRYPTED DATABASE OPERATIONS
// ========================================

/**
 * Encryption-enabled transaction operations
 * Automatically encrypts sensitive fields before storage and decrypts on retrieval
 */

/**
 * Add a transaction with encryption
 */
export async function addEncryptedTransaction(transaction: Transaction): Promise<string> {
  try {
    if (!isEncryptionAvailable()) {
      // Fallback: store without encryption if Web Crypto API is not available
      await db.transactions.add(transaction);
      return transaction.id;
    }
    
    const encrypted = await encryptTransaction(transaction);
    await db.transactions.add(encrypted as Transaction);
    return transaction.id;
  } catch (error) {
    console.error('Error adding encrypted transaction:', error);
    throw error;
  }
}

/**
 * Update a transaction with encryption
 */
export async function updateEncryptedTransaction(
  id: string,
  updates: Partial<Transaction>
): Promise<void> {
  try {
    if (!isEncryptionAvailable()) {
      // Fallback: update without encryption
      await db.transactions.update(id, updates);
      return;
    }
    
    // Encrypt only the fields that are being updated
    const encryptedUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'amount' && typeof value === 'number') {
        const { encryptNumber } = await import('./encryption');
        encryptedUpdates[key] = await encryptNumber(value);
      } else if ((key === 'description' || key === 'notes' || key === 'merchant') && typeof value === 'string') {
        const { encryptValue } = await import('./encryption');
        encryptedUpdates[key] = await encryptValue(value);
      } else {
        encryptedUpdates[key] = value;
      }
    }
    
    await db.transactions.update(id, encryptedUpdates);
  } catch (error) {
    console.error('Error updating encrypted transaction:', error);
    throw error;
  }
}

/**
 * Get a transaction with decryption
 */
export async function getEncryptedTransaction(id: string): Promise<Transaction | undefined> {
  try {
    const transaction = await db.transactions.get(id);
    if (!transaction) return undefined;
    
    if (!isEncryptionAvailable()) {
      return transaction;
    }
    
    return await decryptTransaction(transaction) as Transaction;
  } catch (error) {
    console.error('Error getting encrypted transaction:', error);
    return undefined;
  }
}

/**
 * Get all transactions with decryption
 */
export async function getAllEncryptedTransactions(): Promise<Transaction[]> {
  try {
    const transactions = await db.transactions.toArray();
    
    if (!isEncryptionAvailable()) {
      return transactions;
    }
    
    // Decrypt all transactions in parallel
    const decrypted = await Promise.all(
      transactions.map(tx => decryptTransaction(tx))
    );
    
    return decrypted as Transaction[];
  } catch (error) {
    console.error('Error getting encrypted transactions:', error);
    return [];
  }
}

/**
 * Bulk add transactions with encryption
 */
export async function bulkAddEncryptedTransactions(transactions: Transaction[]): Promise<void> {
  try {
    if (!isEncryptionAvailable()) {
      await db.transactions.bulkAdd(transactions);
      return;
    }
    
    // Encrypt all transactions in parallel
    const encrypted = await Promise.all(
      transactions.map(tx => encryptTransaction(tx))
    );
    
    await db.transactions.bulkAdd(encrypted as Transaction[]);
  } catch (error) {
    console.error('Error bulk adding encrypted transactions:', error);
    throw error;
  }
}

/**
 * Encryption-enabled account operations
 */

/**
 * Add an account with encryption
 */
export async function addEncryptedAccount(account: Account): Promise<string> {
  try {
    if (!isEncryptionAvailable()) {
      await db.accounts.add(account);
      return account.id;
    }
    
    const encrypted = await encryptAccount(account);
    await db.accounts.add(encrypted as Account);
    return account.id;
  } catch (error) {
    console.error('Error adding encrypted account:', error);
    throw error;
  }
}

/**
 * Update an account with encryption
 */
export async function updateEncryptedAccount(
  id: string,
  updates: Partial<Account>
): Promise<void> {
  try {
    if (!isEncryptionAvailable()) {
      await db.accounts.update(id, updates);
      return;
    }
    
    // Encrypt only the fields that are being updated
    const encryptedUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if ((key === 'name' || key === 'accountNumber' || key === 'institution') && typeof value === 'string') {
        const { encryptValue } = await import('./encryption');
        encryptedUpdates[key] = await encryptValue(value);
      } else {
        encryptedUpdates[key] = value;
      }
    }
    
    await db.accounts.update(id, encryptedUpdates);
  } catch (error) {
    console.error('Error updating encrypted account:', error);
    throw error;
  }
}

/**
 * Get an account with decryption
 */
export async function getEncryptedAccount(id: string): Promise<Account | undefined> {
  try {
    const account = await db.accounts.get(id);
    if (!account) return undefined;
    
    if (!isEncryptionAvailable()) {
      return account;
    }
    
    return await decryptAccount(account) as Account;
  } catch (error) {
    console.error('Error getting encrypted account:', error);
    return undefined;
  }
}

/**
 * Get all accounts with decryption
 */
export async function getAllEncryptedAccounts(): Promise<Account[]> {
  try {
    const accounts = await db.accounts.toArray();

    if (!isEncryptionAvailable()) {
      return accounts;
    }

    // Decrypt all accounts in parallel
    const decrypted = await Promise.all(
      accounts.map(acc => decryptAccount(acc))
    );

    return decrypted as Account[];
  } catch (error) {
    console.error('Error getting encrypted accounts:', error);
    return [];
  }
}

// ========================================
// IMPORT HISTORY OPERATIONS
// ========================================

/**
 * Save import metadata to audit trail
 * @param metadata The import metadata to save
 * @returns Promise<string> The import ID
 */
export async function saveImportMetadata(
  metadata: Omit<ImportMetadata, 'id'>
): Promise<string> {
  try {
    const importId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const record: ImportMetadata = {
      id: importId,
      ...metadata,
    };

    await db.importHistory.add(record);
    return importId;
  } catch (error) {
    console.error('Error saving import metadata:', error);
    throw error;
  }
}

/**
 * Get import history with optional limit
 * @param limit Maximum number of imports to retrieve (default: 10)
 * @returns Promise<ImportMetadata[]> Array of import metadata
 */
export async function getImportHistory(limit: number = 10): Promise<ImportMetadata[]> {
  try {
    return await db.importHistory
      .orderBy('importDate')
      .reverse()
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Error fetching import history:', error);
    return [];
  }
}

/**
 * Get specific import metadata by ID
 * @param importId The import ID
 * @returns Promise<ImportMetadata | undefined>
 */
export async function getImportMetadata(importId: string): Promise<ImportMetadata | undefined> {
  try {
    return await db.importHistory.get(importId);
  } catch (error) {
    console.error('Error fetching import metadata:', error);
    return undefined;
  }
}

// ========================================
// SUBSCRIPTION CRUD OPERATIONS
// ========================================

/**
 * Add a new subscription
 * @param subscription The subscription to add
 * @returns Promise<string> The subscription ID
 */
export async function addSubscription(subscription: Subscription): Promise<string> {
  try {
    await db.subscriptions.add(subscription);
    return subscription.id;
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
}

/**
 * Update an existing subscription
 * @param id The subscription ID
 * @param updates Partial subscription data to update
 */
export async function updateSubscription(
  id: string,
  updates: Partial<Subscription>
): Promise<void> {
  try {
    await db.subscriptions.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Delete a subscription
 * @param id The subscription ID
 */
export async function deleteSubscription(id: string): Promise<void> {
  try {
    await db.subscriptions.delete(id);
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
}

/**
 * Get a subscription by ID
 * @param id The subscription ID
 * @returns Promise<Subscription | undefined>
 */
export async function getSubscription(id: string): Promise<Subscription | undefined> {
  try {
    return await db.subscriptions.get(id);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return undefined;
  }
}

/**
 * Get all subscriptions
 * @returns Promise<Subscription[]>
 */
export async function getAllSubscriptions(): Promise<Subscription[]> {
  try {
    return await db.subscriptions.toArray();
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
}

/**
 * Get subscriptions by status
 * @param status The subscription status to filter by
 * @returns Promise<Subscription[]>
 */
export async function getSubscriptionsByStatus(
  status: Subscription['status']
): Promise<Subscription[]> {
  try {
    return await db.subscriptions.where('status').equals(status).toArray();
  } catch (error) {
    console.error('Error fetching subscriptions by status:', error);
    return [];
  }
}

/**
 * Get subscriptions with upcoming billing dates
 * @param daysAhead Number of days to look ahead (default: 7)
 * @returns Promise<Subscription[]>
 */
export async function getUpcomingSubscriptions(daysAhead: number = 7): Promise<Subscription[]> {
  try {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const all = await db.subscriptions
      .where('status')
      .anyOf(['active', 'trial'])
      .toArray();

    return all.filter(sub => {
      const nextBilling = new Date(sub.nextBillingDate);
      return nextBilling >= now && nextBilling <= futureDate;
    });
  } catch (error) {
    console.error('Error fetching upcoming subscriptions:', error);
    return [];
  }
}

/**
 * Get subscription by merchant token (for matching with auto-detected)
 * @param merchantToken The merchant token to match
 * @returns Promise<Subscription | undefined>
 */
export async function getSubscriptionByMerchantToken(
  merchantToken: string
): Promise<Subscription | undefined> {
  try {
    return await db.subscriptions
      .where('merchantToken')
      .equals(merchantToken)
      .first();
  } catch (error) {
    console.error('Error fetching subscription by merchant token:', error);
    return undefined;
  }
}

/**
 * Cancel a subscription (sets status and cancelledDate)
 * @param id The subscription ID
 */
export async function cancelSubscription(id: string): Promise<void> {
  try {
    await db.subscriptions.update(id, {
      status: 'cancelled',
      cancelledDate: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Pause a subscription
 * @param id The subscription ID
 */
export async function pauseSubscription(id: string): Promise<void> {
  try {
    await db.subscriptions.update(id, {
      status: 'paused',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    throw error;
  }
}

/**
 * Resume a paused subscription
 * @param id The subscription ID
 */
export async function resumeSubscription(id: string): Promise<void> {
  try {
    await db.subscriptions.update(id, {
      status: 'active',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    throw error;
  }
}

/**
 * Calculate monthly cost of all active subscriptions
 * @returns Promise<number>
 */
export async function calculateTotalMonthlySubscriptionCost(): Promise<number> {
  try {
    const active = await db.subscriptions
      .where('status')
      .anyOf(['active', 'trial'])
      .toArray();

    return active.reduce((total, sub) => {
      switch (sub.billingCycle) {
        case 'weekly':
          return total + sub.amount * 4.33; // avg weeks per month
        case 'bi-weekly':
          return total + sub.amount * 2.17; // avg bi-weekly periods per month (26/12)
        case 'monthly':
          return total + sub.amount;
        case 'quarterly':
          return total + sub.amount / 3;
        case 'annual':
          return total + sub.amount / 12;
        default:
          return total + sub.amount;
      }
    }, 0);
  } catch (error) {
    console.error('Error calculating subscription cost:', error);
    return 0;
  }
}

/**
 * Link transactions to a subscription
 * @param subscriptionId The subscription ID
 * @param transactionIds Array of transaction IDs to link
 */
export async function linkTransactionsToSubscription(
  subscriptionId: string,
  transactionIds: string[]
): Promise<void> {
  try {
    const subscription = await db.subscriptions.get(subscriptionId);
    if (!subscription) return;

    const existingIds = new Set(subscription.linkedTransactionIds);
    transactionIds.forEach(id => existingIds.add(id));

    await db.subscriptions.update(subscriptionId, {
      linkedTransactionIds: Array.from(existingIds),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error linking transactions to subscription:', error);
    throw error;
  }
}

// ========================================
// EXCLUDED SUBSCRIPTION OPERATIONS
// ========================================

/**
 * Exclude/dismiss an auto-detected subscription (mark as false positive)
 * @param merchantToken The merchant token to exclude
 * @param merchantName Display name for reference
 * @param reason Optional reason for exclusion
 */
export async function excludeSubscription(
  merchantToken: string,
  merchantName: string,
  reason?: string
): Promise<void> {
  try {
    const excluded: ExcludedSubscription = {
      id: `excluded_${Date.now()}`,
      merchantToken: merchantToken.toLowerCase(),
      merchantName,
      reason,
      excludedAt: new Date(),
    };
    await db.excludedSubscriptions.add(excluded);
  } catch (error) {
    console.error('Error excluding subscription:', error);
    throw error;
  }
}

/**
 * Remove exclusion (re-allow auto-detection for a merchant)
 * @param merchantToken The merchant token to un-exclude
 */
export async function unexcludeSubscription(merchantToken: string): Promise<void> {
  try {
    await db.excludedSubscriptions
      .where('merchantToken')
      .equals(merchantToken.toLowerCase())
      .delete();
  } catch (error) {
    console.error('Error removing subscription exclusion:', error);
    throw error;
  }
}

/**
 * Get all excluded merchant tokens
 * @returns Promise<Set<string>> Set of excluded merchant tokens (lowercase)
 */
export async function getExcludedMerchantTokens(): Promise<Set<string>> {
  try {
    const excluded = await db.excludedSubscriptions.toArray();
    return new Set(excluded.map(e => e.merchantToken.toLowerCase()));
  } catch (error) {
    console.error('Error fetching excluded subscriptions:', error);
    return new Set();
  }
}

/**
 * Get all excluded subscriptions
 * @returns Promise<ExcludedSubscription[]>
 */
export async function getAllExcludedSubscriptions(): Promise<ExcludedSubscription[]> {
  try {
    return await db.excludedSubscriptions.orderBy('excludedAt').reverse().toArray();
  } catch (error) {
    console.error('Error fetching excluded subscriptions:', error);
    return [];
  }
}

/**
 * Check if a merchant token is excluded
 * @param merchantToken The merchant token to check
 */
export async function isSubscriptionExcluded(merchantToken: string): Promise<boolean> {
  try {
    const excluded = await db.excludedSubscriptions
      .where('merchantToken')
      .equals(merchantToken.toLowerCase())
      .first();
    return !!excluded;
  } catch (error) {
    console.error('Error checking subscription exclusion:', error);
    return false;
  }
}
