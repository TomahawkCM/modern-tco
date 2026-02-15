/**
 * Encrypted Database Wrapper
 * Provides transparent encryption/decryption for database operations
 * Wraps Dexie operations to automatically encrypt sensitive fields
 */

import type { Table } from "dexie";
import { encryptTransaction, decryptTransaction, isEncryptionEnabled } from "./budget-encryption";
import type { Transaction } from "@/types/budget";

/**
 * Wrap a Dexie table to add encryption/decryption
 */
export function createEncryptedTable<T extends Transaction>(table: Table<T>): Table<T> {
  if (!isEncryptionEnabled()) {
    return table; // Return original table if encryption disabled
  }

  // Create proxy that intercepts operations
  return new Proxy(table, {
    get(target, prop) {
      const original = target[prop as keyof Table<T>];

      // Wrap methods that write data
      if (prop === "add" || prop === "put" || prop === "update") {
        return async function (item: T | T[], ...args: any[]) {
          if (Array.isArray(item)) {
            // Bulk operations
            const encrypted = await Promise.all(item.map((tx) => encryptTransaction(tx as any)));
            return (original as any).call(target, encrypted, ...args);
          } else {
            // Single item
            const encrypted = await encryptTransaction(item as any);
            return (original as any).call(target, encrypted, ...args);
          }
        };
      }

      // Wrap methods that read data
      if (
        prop === "get" ||
        prop === "where" ||
        prop === "filter" ||
        prop === "toArray" ||
        prop === "first" ||
        prop === "last"
      ) {
        if (prop === "where" || prop === "filter") {
          // These return query builders - we'll handle decryption at the end
          return function (...args: any[]) {
            const query = (original as any).call(target, ...args);
            return wrapQuery(query);
          };
        }

        return async function (...args: any[]) {
          const result = await (original as any).call(target, ...args);
          return decryptResult(result);
        };
      }

      // Return original for other methods
      return original;
    },
  });
}

/**
 * Wrap a query builder to decrypt results
 */
function wrapQuery(query: any): any {
  return new Proxy(query, {
    get(target, prop) {
      const original = target[prop as keyof typeof query];

      if (prop === "toArray" || prop === "first" || prop === "last" || prop === "each") {
        return async function (...args: any[]) {
          const result = await original.call(target, ...args);
          return decryptResult(result);
        };
      }

      // Chain methods (where, filter, etc.)
      if (typeof original === "function") {
        return function (...args: any[]) {
          const newQuery = original.apply(target, args);
          return wrapQuery(newQuery);
        };
      }

      return original;
    },
  });
}

/**
 * Decrypt result(s) from database
 */
async function decryptResult(result: any): Promise<any> {
  if (!result) {
    return result;
  }

  if (Array.isArray(result)) {
    return Promise.all(result.map((item) => decryptTransaction(item)));
  }

  return decryptTransaction(result);
}

/**
 * Check if a transaction needs encryption
 */
function isTransaction(item: any): item is Transaction {
  return item && typeof item === "object" && ("description" in item || "amount" in item);
}
