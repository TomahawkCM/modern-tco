'use client';

import { useState, useCallback } from 'react';
import { BottomSheet } from '@/components/budget/ui/BottomSheet';
import { markExpectingRefund } from '@/lib/refunds/refund-tracker';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { useFormatter, useTranslations } from 'next-intl';
import type { Transaction } from '@/types/budget';

interface RefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function RefundModal({ open, onOpenChange, transaction }: RefundModalProps) {
  const t = useTranslations('budget.refunds');
  const format = useFormatter();
  const currency = useDefaultCurrency();

  const [expectedAmount, setExpectedAmount] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form fields when the modal opens with a new transaction
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && transaction) {
        setExpectedAmount(Math.abs(transaction.amount).toFixed(2));
        setExpectedDate('');
        setNotes('');
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, transaction],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!transaction) return;

      setSubmitting(true);
      try {
        const amount = parseFloat(expectedAmount);
        if (isNaN(amount) || amount <= 0) return;

        const date = expectedDate ? new Date(expectedDate) : undefined;

        await markExpectingRefund(transaction.id, amount, date, notes || undefined);
        onOpenChange(false);
      } catch (err) {
        console.error('Failed to mark refund:', err);
      } finally {
        setSubmitting(false);
      }
    },
    [transaction, expectedAmount, expectedDate, notes, onOpenChange],
  );

  if (!transaction) return null;

  const fmtCurrency = (v: number) =>
    format.number(v, { style: 'currency', currency });

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={t('expectRefund')}
      description={t('expectRefundDescription')}
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-4">
        {/* Transaction context */}
        <div className="rounded-lg bg-slate-800/50 p-3">
          <p className="text-sm text-slate-400">{transaction.description}</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {fmtCurrency(Math.abs(transaction.amount))}
          </p>
        </div>

        {/* Expected refund amount */}
        <div className="space-y-1.5">
          <label htmlFor="refund-amount" className="block text-sm font-medium text-slate-300">
            {t('expectedAmount')}
          </label>
          <input
            id="refund-amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={expectedAmount}
            onChange={(e) => setExpectedAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="0.00"
          />
        </div>

        {/* Expected date (optional) */}
        <div className="space-y-1.5">
          <label htmlFor="refund-date" className="block text-sm font-medium text-slate-300">
            {t('expectedDate')}
          </label>
          <input
            id="refund-date"
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Notes (optional) */}
        <div className="space-y-1.5">
          <label htmlFor="refund-notes" className="block text-sm font-medium text-slate-300">
            {t('notes')}
          </label>
          <textarea
            id="refund-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder={t('notesPlaceholder')}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t('submitting') : t('markExpecting')}
        </button>
      </form>
    </BottomSheet>
  );
}
