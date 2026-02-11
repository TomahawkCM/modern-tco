'use client';

/**
 * Merchant Quick-Rules
 *
 * Auto-categorization rules learned from user behavior.
 * When a user re-categorizes a transaction, they can create a rule
 * that automatically applies to future transactions from the same merchant.
 */

import { db } from '@/lib/budget-db';
import type { MerchantRule, Transaction } from '@/types/budget';

/**
 * Create a new merchant auto-categorization rule.
 */
export async function createRule(
  merchantToken: string,
  displayName: string,
  category: string,
  subcategory?: string
): Promise<MerchantRule> {
  const now = new Date();
  const rule: MerchantRule = {
    id: `mrule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    merchantToken,
    merchantDisplayName: displayName,
    category,
    subcategory,
    confidence: 1.0,
    source: 'user',
    applyCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Check if rule already exists for this merchant token
  const existing = await db.merchantRules
    .where('merchantToken')
    .equals(merchantToken)
    .first();

  if (existing) {
    // Update existing rule
    await db.merchantRules.update(existing.id, {
      category,
      subcategory,
      merchantDisplayName: displayName,
      updatedAt: now,
    });
    return { ...existing, category, subcategory, merchantDisplayName: displayName, updatedAt: now };
  }

  await db.merchantRules.add(rule);
  return rule;
}

/**
 * Find a rule matching a given merchant token.
 */
export async function findRule(merchantToken: string): Promise<MerchantRule | undefined> {
  return db.merchantRules
    .where('merchantToken')
    .equals(merchantToken)
    .first();
}

/**
 * Apply matching rules to a set of transactions.
 * Only applies to uncategorized transactions (category is null or empty).
 * Returns the count of applied rules and which rules were used.
 */
export async function applyRules(
  transactions: Transaction[]
): Promise<{ applied: number; rules: MerchantRule[] }> {
  const allRules = await db.merchantRules.toArray();
  if (allRules.length === 0) {
    return { applied: 0, rules: [] };
  }

  // Build a map for fast lookup
  const ruleMap = new Map<string, MerchantRule>();
  for (const rule of allRules) {
    ruleMap.set(rule.merchantToken, rule);
  }

  let applied = 0;
  const usedRules = new Set<MerchantRule>();

  for (const tx of transactions) {
    // Skip already-categorized transactions
    if (tx.category && tx.category.trim() !== '') continue;

    // Try to find a matching merchant token from the transaction description
    const { extractMerchantToken } = await import('@/lib/merchant-tokenizer');
    const token = extractMerchantToken(tx.description || tx.originalDescription || '');

    if (token && ruleMap.has(token)) {
      const rule = ruleMap.get(token)!;
      await db.transactions.update(tx.id, {
        category: rule.category,
        subcategory: rule.subcategory || null,
      });

      // Increment apply count
      await db.merchantRules.update(rule.id, {
        applyCount: rule.applyCount + 1,
        updatedAt: new Date(),
      });

      applied++;
      usedRules.add(rule);
    }
  }

  return { applied, rules: Array.from(usedRules) };
}

/**
 * Delete a merchant rule by ID.
 */
export async function deleteRule(ruleId: string): Promise<void> {
  await db.merchantRules.delete(ruleId);
}

/**
 * Get all merchant rules, sorted by most recently updated.
 */
export async function getAllRules(): Promise<MerchantRule[]> {
  return db.merchantRules.orderBy('createdAt').reverse().toArray();
}
