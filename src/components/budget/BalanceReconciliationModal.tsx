"use client";

/**
 * Balance Reconciliation Modal
 * Prompts user to enter their current bank balance after importing transactions.
 * Calculates the starting balance backwards from: Current - Net Transactions = Starting
 */

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  Calculator,
  Info,
  Wallet,
  X,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface BalanceReconciliationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  accountName: string;
  accountType?: "checking" | "savings" | "credit"; // For credit card-specific messaging
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
function formatCurrency(amount: number, locale: string): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
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
  accountType = "checking",
  transactionNetChange,
  transactionCount,
  dateRangeStart,
  dateRangeEnd,
  onComplete,
  onSkip,
}: BalanceReconciliationModalProps) {
  const locale = useLocale();
  const tAria = useTranslations("aria");
  const [currentBalance, setCurrentBalance] = useState<string>("");
  const [calculatedStartingBalance, setCalculatedStartingBalance] = useState<number | null>(null);
  const modalRef = useFocusTrap(open);

  const isCreditCard = accountType === "credit";

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
      if (event.key === "Escape" && open) {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [open, onOpenChange]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (calculatedStartingBalance !== null) {
        const parsedCurrentBalance = parseFloat(currentBalance) || 0;
        onComplete(calculatedStartingBalance, parsedCurrentBalance);
        onOpenChange(false);
      }
    },
    [calculatedStartingBalance, currentBalance, onComplete, onOpenChange]
  );

  const handleSkip = useCallback(() => {
    // Store pending reconciliation flag in localStorage
    if (typeof window !== "undefined") {
      const pending = JSON.parse(localStorage.getItem("pendingBalanceReconciliation") || "{}");
      pending[accountId] = {
        accountName,
        transactionNetChange,
        skippedAt: new Date().toISOString(),
      };
      localStorage.setItem("pendingBalanceReconciliation", JSON.stringify(pending));
    }
    onSkip();
    onOpenChange(false);
  }, [accountId, accountName, transactionNetChange, onSkip, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 sm:items-center">
      <div
        ref={modalRef}
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:mx-4 sm:max-h-[90vh] sm:max-w-lg sm:rounded-lg"
        role="dialog"
        aria-labelledby="reconciliation-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border bg-gradient-to-r from-teal-50 to-emerald-50 p-5 dark:from-teal-950/30 dark:to-emerald-950/30 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-teal-100 p-2 dark:bg-teal-900/50">
                <CheckCircle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
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
              className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={tAria("closeModal")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {/* Import Summary Stats */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            {/* Transaction Count */}
            {transactionCount !== undefined && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  <span className="font-semibold">{transactionCount}</span> transactions imported
                </span>
              </div>
            )}

            {/* Date Range */}
            {dateRangeStart && dateRangeEnd && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {dateRangeStart.toLocaleDateString(locale)} -{" "}
                  {dateRangeEnd.toLocaleDateString(locale)}
                </span>
              </div>
            )}

            {/* Net Change */}
            <div className="flex items-start gap-3 border-t border-border pt-2">
              <Calculator className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Net change from transactions:</p>
                <p
                  className={`text-2xl font-bold ${transactionNetChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {transactionNetChange >= 0 ? "+" : ""}
                  {formatCurrency(transactionNetChange, locale)}
                </p>
              </div>
            </div>
          </div>

          {/* Current balance input */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="current-balance"
                className="mb-2 block text-base font-semibold text-foreground"
              >
                {isCreditCard
                  ? "What is your current amount owed?"
                  : "What is your current bank balance?"}
              </label>
              <div className="relative">
                <span className="absolute start-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                  $
                </span>
                <input
                  id="current-balance"
                  type="number"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  inputMode="decimal"
                  autoFocus
                  className="min-h-[56px] w-full rounded-lg border-2 border-input bg-background pe-4 ps-8 text-xl font-medium text-foreground transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                  aria-describedby="balance-helper"
                />
              </div>
              <p
                id="balance-helper"
                className="mt-2 flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  {isCreditCard
                    ? "Enter the current balance shown on your credit card statement (as a positive number)"
                    : "Open your banking app and enter the balance shown for this account"}
                </span>
              </p>
            </div>

            {/* Calculated starting balance preview */}
            {calculatedStartingBalance !== null && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/50">
                    <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {isCreditCard ? "Your starting amount owed:" : "Your starting balance:"}
                    </p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(Math.abs(calculatedStartingBalance), locale)}
                    </p>
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      This will make your account balance match your bank.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Warning for unusual negative opening balance */}
            {calculatedStartingBalance !== null &&
              calculatedStartingBalance < 0 &&
              !isCreditCard && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      This results in a negative starting balance, which is unusual for
                      checking/savings. Please double-check your current balance is correct.
                    </p>
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 rounded-lg border-2 border-border px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={calculatedStartingBalance === null}
                className="flex-1 rounded-lg bg-teal-500 px-4 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
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
export function getPendingReconciliations(): Record<
  string,
  {
    accountName: string;
    transactionNetChange: number;
    skippedAt: string;
  }
> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("pendingBalanceReconciliation") || "{}");
  } catch {
    return {};
  }
}

/**
 * Clear a pending reconciliation after it's been completed
 */
export function clearPendingReconciliation(accountId: string): void {
  if (typeof window === "undefined") return;
  try {
    const pending = getPendingReconciliations();
    delete pending[accountId];
    localStorage.setItem("pendingBalanceReconciliation", JSON.stringify(pending));
  } catch {
    // Ignore localStorage errors
  }
}

export default BalanceReconciliationModal;
