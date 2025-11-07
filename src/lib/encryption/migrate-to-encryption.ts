/**
 * Migration Utility: Encrypt Existing Data
 * Migrates unencrypted transactions to encrypted format
 * 
 * WARNING: This is a one-way operation. Once data is encrypted,
 * it cannot be decrypted without the encryption key.
 */

import { db } from '@/lib/budget-db';
import type { Transaction } from '@/types/budget';
import {
  encryptTransaction,
  isEncryptionEnabled,
  enableEncryption,
} from './budget-encryption';
import { savePrivacySettings } from '@/lib/budget-privacy-settings';

export interface MigrationResult {
  success: boolean;
  transactionsEncrypted: number;
  errors: string[];
  warnings: string[];
}

/**
 * Migrate all existing transactions to encrypted format
 */
export async function migrateTransactionsToEncryption(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    transactionsEncrypted: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Check if encryption is enabled
    if (!isEncryptionEnabled()) {
      // Enable encryption first
      await enableEncryption();
      const settings = JSON.parse(
        localStorage.getItem('budget-app-privacy-settings') || '{}'
      );
      savePrivacySettings({ ...settings, enableEncryption: true });
    }

    // Get all transactions
    const transactions = await db.transactions.toArray();
    
    if (transactions.length === 0) {
      result.warnings.push('No transactions to encrypt');
      result.success = true;
      return result;
    }

    // Filter out already encrypted transactions
    const unencrypted = transactions.filter(
      (tx) => !tx.encryptedDescription && !tx.encryptedAmount
    );

    if (unencrypted.length === 0) {
      result.warnings.push('All transactions are already encrypted');
      result.success = true;
      return result;
    }

    // Encrypt each transaction
    const encrypted: Transaction[] = [];
    for (const tx of unencrypted) {
      try {
        const encryptedTx = await encryptTransaction(tx);
        encrypted.push(encryptedTx as Transaction);
      } catch (error) {
        result.errors.push(
          `Failed to encrypt transaction ${tx.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Update all encrypted transactions in bulk
    // Note: We keep plaintext fields for backward compatibility and querying
    // Users can manually remove them later if desired
    if (encrypted.length > 0) {
      await Promise.all(
        encrypted.map((tx) =>
          db.transactions.update(tx.id, {
            encryptedDescription: tx.encryptedDescription,
            encryptedAmount: tx.encryptedAmount,
            encryptionIv: tx.encryptionIv,
            amountHash: tx.amountHash,
            // Keep plaintext for now to maintain compatibility
            // Users can choose to remove plaintext later
          } as any)
        )
      );

      result.transactionsEncrypted = encrypted.length;
    }

    result.success = result.errors.length === 0;
  } catch (error) {
    result.errors.push(
      `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return result;
}

/**
 * Check if migration is needed
 */
export async function needsEncryptionMigration(): Promise<boolean> {
  if (!isEncryptionEnabled()) {
    return false;
  }

  const transactions = await db.transactions.toArray();
  return transactions.some(
    (tx) => !tx.encryptedDescription && !tx.encryptedAmount && (tx.description || tx.amount !== undefined)
  );
}

