'use client';

/**
 * Refund Tracking System
 *
 * Tracks expected refunds, auto-matches incoming credits to purchases,
 * and provides gross vs net spending reports.
 */

import { db } from '@/lib/budget-db';
import type { Transaction } from '@/types/budget';

/**
 * Mark a transaction as expecting a refund.
 */
export async function markExpectingRefund(
  txId: string,
  expectedAmount: number,
  expectedDate?: Date,
  notes?: string
): Promise<void> {
  await db.transactions.update(txId, {
    refundStatus: 'expecting',
    refundExpectedAmount: expectedAmount,
    refundExpectedDate: expectedDate,
    refundNotes: notes,
    updatedAt: new Date(),
  });
}

/**
 * Auto-match refund credits to expecting purchases.
 *
 * Matching criteria:
 * - Same merchant (via description similarity / merchant token)
 * - Amount within 10% tolerance
 * - Date within 30 days of purchase
 * - Credit transaction (amount > 0) vs debit purchase (amount < 0)
 */
export async function autoMatchRefunds(): Promise<
  Array<{ purchaseId: string; refundId: string }>
> {
  const expecting = await db.transactions
    .where('refundStatus')
    .equals('expecting')
    .toArray();

  if (expecting.length === 0) return [];

  // Get recent credits (positive amounts) from last 60 days
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const allRecent = await db.transactions
    .where('date')
    .above(sixtyDaysAgo)
    .toArray();

  const recentCredits = allRecent.filter(
    (tx) => tx.amount > 0 && !tx.refundLinkedTransactionId && !tx.isSplit
  );

  const { extractMerchantToken } = await import('@/lib/merchant-tokenizer');
  const matches: Array<{ purchaseId: string; refundId: string }> = [];

  for (const purchase of expecting) {
    const purchaseToken = extractMerchantToken(
      purchase.description || purchase.originalDescription || ''
    );
    const purchaseAmount = Math.abs(purchase.amount);
    const purchaseDate = new Date(purchase.date);

    for (const credit of recentCredits) {
      // Already matched?
      if (credit.refundLinkedTransactionId) continue;

      const creditToken = extractMerchantToken(
        credit.description || credit.originalDescription || ''
      );

      // Merchant match
      if (!purchaseToken || !creditToken || purchaseToken !== creditToken) continue;

      // Amount within 10%
      const amountDiff = Math.abs(credit.amount - purchaseAmount);
      const tolerance = purchaseAmount * 0.1;
      if (amountDiff > tolerance) continue;

      // Date within 30 days
      const creditDate = new Date(credit.date);
      const daysDiff = Math.abs(
        (creditDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff > 30) continue;

      // Match found
      const isPartial = credit.amount < purchaseAmount * 0.9;
      const refundStatus = isPartial ? 'partial' : 'received';

      await db.transactions.update(purchase.id, {
        refundStatus: refundStatus as 'partial' | 'received',
        refundLinkedTransactionId: credit.id,
        refundReceivedAmount: credit.amount,
        updatedAt: new Date(),
      });

      await db.transactions.update(credit.id, {
        refundLinkedTransactionId: purchase.id,
        updatedAt: new Date(),
      });

      matches.push({ purchaseId: purchase.id, refundId: credit.id });
      break; // One match per purchase
    }
  }

  return matches;
}

/**
 * Get refund summary for a date range.
 * Returns gross spending, refund credits, and net spending.
 */
export async function getRefundSummary(
  start: Date,
  end: Date
): Promise<{ gross: number; refunds: number; net: number }> {
  const allTxs = await db.transactions
    .where('date')
    .between(start, end, true, true)
    .toArray();

  const nonSplitTxs = allTxs.filter((tx) => !tx.isSplit);

  let gross = 0;
  let refunds = 0;

  for (const tx of nonSplitTxs) {
    if (tx.amount < 0) {
      gross += Math.abs(tx.amount);
    }
    if (
      tx.amount > 0 &&
      tx.refundLinkedTransactionId
    ) {
      refunds += tx.amount;
    }
  }

  return {
    gross: Math.round(gross * 100) / 100,
    refunds: Math.round(refunds * 100) / 100,
    net: Math.round((gross - refunds) * 100) / 100,
  };
}

/**
 * Get all transactions currently expecting refunds.
 */
export async function getExpectingRefunds(): Promise<Transaction[]> {
  return db.transactions
    .where('refundStatus')
    .equals('expecting')
    .toArray();
}
