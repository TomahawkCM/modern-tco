/**
 * Encrypted Transactions Helper
 * Wraps database operations to automatically encrypt/decrypt transaction data
 */

import { db } from "@/lib/budget-db";
import type { Transaction } from "@/types/budget";
import { encryptTransaction, decryptTransaction, isEncryptionEnabled } from "./budget-encryption";

/**
 * Add transaction with automatic encryption
 */
export async function addEncryptedTransaction(transaction: Transaction): Promise<string> {
  if (isEncryptionEnabled()) {
    const encrypted = await encryptTransaction(transaction);
    return await db.transactions.add(encrypted as Transaction);
  }
  return await db.transactions.add(transaction);
}

/**
 * Add multiple transactions with automatic encryption
 */
export async function addEncryptedTransactions(transactions: Transaction[]): Promise<string[]> {
  if (isEncryptionEnabled()) {
    const encrypted = await Promise.all(transactions.map((tx) => encryptTransaction(tx)));
    return await db.transactions.bulkAdd(encrypted as Transaction[]);
  }
  return await db.transactions.bulkAdd(transactions);
}

/**
 * Update transaction with automatic encryption
 */
export async function updateEncryptedTransaction(
  id: string,
  changes: Partial<Transaction>
): Promise<number> {
  if (isEncryptionEnabled()) {
    // Get existing transaction to merge changes
    const existing = await db.transactions.get(id);
    if (existing) {
      const merged = { ...existing, ...changes };
      const encrypted = await encryptTransaction(merged);
      return await db.transactions.update(id, encrypted as Partial<Transaction>);
    }
  }
  return await db.transactions.update(id, changes);
}

/**
 * Get transaction with automatic decryption
 */
export async function getEncryptedTransaction(id: string): Promise<Transaction | undefined> {
  const transaction = await db.transactions.get(id);
  if (!transaction) {
    return undefined;
  }

  if (isEncryptionEnabled() && (transaction.encryptedDescription || transaction.encryptedAmount)) {
    return await decryptTransaction(transaction);
  }

  return transaction;
}

/**
 * Get all transactions with automatic decryption
 */
export async function getAllEncryptedTransactions(): Promise<Transaction[]> {
  const transactions = await db.transactions.toArray();

  if (isEncryptionEnabled()) {
    return Promise.all(
      transactions.map((tx) =>
        tx.encryptedDescription || tx.encryptedAmount ? decryptTransaction(tx) : Promise.resolve(tx)
      )
    );
  }

  return transactions;
}

/**
 * Query transactions with automatic decryption
 */
export async function queryEncryptedTransactions(
  queryFn: (table: typeof db.transactions) => Promise<Transaction[]>
): Promise<Transaction[]> {
  const transactions = await queryFn(db.transactions);

  if (isEncryptionEnabled()) {
    return Promise.all(
      transactions.map((tx) =>
        tx.encryptedDescription || tx.encryptedAmount ? decryptTransaction(tx) : Promise.resolve(tx)
      )
    );
  }

  return transactions;
}
