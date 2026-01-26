'use client';

/**
 * Balance Reconciliation Modal
 * Prompts user to enter their current bank balance after importing transactions.
 * Calculates the starting balance backwards from: Current - Net Transactions = Starting
 */

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Calculator, Info, Wallet, X, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface BalanceReconciliationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  accountName: string;
  accountType?: 'checking' | 'savings' | 'credit'; // For credit card-specific messaging
  transactionNetChange: number; // Sum of imported transactions
  transactionCount?: number; // Number of imported transactions
  dateRangeStart?: Date; // Earliest transaction date
  dateRangeEnd?: Date; // Latest transaction date
  onComplete: (startingBalance: number, currentBalance: number) => void;
  onSkip: () => void;
}

/**
 * Format a number as currency
 */
function formatCurrency(amount: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function BalanceReconciliationModal({
  open,
  onOpenChange,
  accountId,
  accountName,
  accountType = 'checking',
  transactionNetChange,
  transactionCount,
  dateRangeStart,
  dateRangeEnd,
  onComplete,
  onSkip,
}: BalanceReconciliationModalProps) {
  const [currentBalance, setCurrentBalance] = useState<string>('');
  const [calculatedStartingBalance, setCalculatedStartingBalance] = useState<number | null>(null);
  const modalRef = useFocusTrap(open);

  const isCreditCard = accountType === 'credit';

  // Calculate starting balance whenever current balance changes
  useEffect(() => {
    const parsed = parseFloat(currentBalance);
    if (!isNaN(parsed)) {
      // Starting Balance = Current Balance - Net Transactions
      // If net change is -4125.82 (spent more than earned), and current is 874.18
      // Then starting = 874.18 - (-4125.82) = 5000.00
      const starting = Math.round((parsed - transactionNetChange) * 100) / 100;
      setCalculatedStartingBalance(starting);
    } else {
      setCalculatedStartingBalance(null);
    }
  }, [currentBalance, transactionNetChange]);

  // Handle escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    }

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, onOpenChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedStartingBalance !== null) {
      const parsedCurrentBalance = parseFloat(currentBalance) || 0;
      onComplete(calculatedStartingBalance, parsedCurrentBalance);
      onOpenChange(false);
    }
  }, [calculatedStartingBalance, currentBalance, onComplete, onOpenChange]);

  const handleSkip = useCallback(() => {
    // Store pending reconciliation flag in localStorage
    if (typeof window !== 'undefined') {
      const pending = JSON.parse(localStorage.getItem('pendingBalanceReconciliation') || '{}');
      pending[accountId] = {
        accountName,
        transactionNetChange,
        skippedAt: new Date().toISOString(),
      };
      localStorage.setItem('pendingBalanceReconciliation', JSON.stringify(pending));
    }
    onSkip();
    onOpenChange(false);
  }, [accountId, accountName, transactionNetChange, onSkip, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[9999]">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-lg shadow-2xl w-full sm:max-w-lg sm:mx-4 max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
        role="dialog"
        aria-labelledby="reconciliation-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex-shrink-0 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-full">
                <CheckCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 id="reconciliation-modal-title" className="text-lg font-bold text-foreground">
                  Import Complete!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Set your account balance for {accountName}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Import Summary Stats */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border space-y-3">
            {/* Transaction Count */}
            {transactionCount !== undefined && (
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  <span className="font-semibold">{transactionCount}</span> transactions imported
                </span>
              </div>
            )}

            {/* Date Range */}
            {dateRangeStart && dateRangeEnd && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {dateRangeStart.toLocaleDateString()} - {dateRangeEnd.toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Net Change */}
            <div className="flex items-start gap-3 pt-2 border-t border-border">
              <Calculator className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Net change from transactions:
                </p>
                <p className={`text-2xl font-bold ${transactionNetChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {transactionNetChange >= 0 ? '+' : ''}{formatCurrency(transactionNetChange)}
                </p>
              </div>
            </div>
          </div>

          {/* Current balance input */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="current-balance" className="block text-base font-semibold text-foreground mb-2">
                {isCreditCard
                  ? 'What is your current amount owed?'
                  : 'What is your current bank balance?'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">$</span>
                <input
                  id="current-balance"
                  type="number"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  inputMode="decimal"
                  autoFocus
                  className="w-full min-h-[56px] pl-8 pr-4 text-xl font-medium border-2 border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  aria-describedby="balance-helper"
                />
              </div>
              <p id="balance-helper" className="mt-2 text-sm text-muted-foreground flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  {isCreditCard
                    ? 'Enter the current balance shown on your credit card statement (as a positive number)'
                    : 'Open your banking app and enter the balance shown for this account'}
                </span>
              </p>
            </div>

            {/* Calculated starting balance preview */}
            {calculatedStartingBalance !== null && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {isCreditCard ? 'Your starting amount owed:' : 'Your starting balance:'}
                    </p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(Math.abs(calculatedStartingBalance))}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      This will make your account balance match your bank.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Warning for unusual negative opening balance */}
            {calculatedStartingBalance !== null && calculatedStartingBalance < 0 && !isCreditCard && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    This results in a negative starting balance, which is unusual for checking/savings.
                    Please double-check your current balance is correct.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-4 py-3 text-base border-2 border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors font-medium"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={calculatedStartingBalance === null}
                className="flex-1 px-4 py-3 text-base bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Balance
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Get pending balance reconciliations from localStorage
 */
export function getPendingReconciliations(): Record<string, {
  accountName: string;
  transactionNetChange: number;
  skippedAt: string;
}> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('pendingBalanceReconciliation') || '{}');
  } catch {
    return {};
  }
}

/**
 * Clear a pending reconciliation after it's been completed
 */
export function clearPendingReconciliation(accountId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const pending = getPendingReconciliations();
    delete pending[accountId];
    localStorage.setItem('pendingBalanceReconciliation', JSON.stringify(pending));
  } catch {
    // Ignore localStorage errors
  }
}

export default BalanceReconciliationModal;
