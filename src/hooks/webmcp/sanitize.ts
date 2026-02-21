/**
 * Sanitization helpers for WebMCP tool responses.
 *
 * These functions explicitly allowlist fields that are safe to expose
 * to browser AI agents. Encryption fields, bank identification data,
 * and internal IDs are never returned.
 */

import type { Transaction, Account } from "@/types/budget";

export interface SanitizedTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  category: string | null;
  subcategory: string | null;
  merchant?: string;
  notes: string;
  tags: string[];
  isRecurring: boolean;
}

export interface SanitizedAccount {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit";
  institution: string;
  currency: string;
  balance: number;
}

export function sanitizeTransaction(tx: Transaction): SanitizedTransaction {
  return {
    id: tx.id,
    accountId: tx.accountId,
    date: new Date(tx.date).toISOString(),
    description: tx.description,
    amount: tx.amount,
    category: tx.category,
    subcategory: tx.subcategory,
    merchant: tx.merchant,
    notes: tx.notes,
    tags: tx.tags ?? [],
    isRecurring: tx.isRecurring,
  };
}

export function sanitizeAccount(acct: Account): SanitizedAccount {
  return {
    id: acct.id,
    name: acct.name,
    type: acct.type,
    institution: acct.institution,
    currency: acct.currency,
    balance: acct.balance,
  };
}
