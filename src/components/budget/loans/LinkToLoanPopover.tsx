/**
 * Link to Loan Popover Component
 * Quick action popover for linking transactions to loans from the transactions list
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Link as LinkIcon, CreditCard, DollarSign, Loader2, X, ChevronRight } from 'lucide-react';
import type { Loan, Transaction } from '@/types/budget';
import { getActiveLoans, createPaymentFromTransaction } from '@/lib/loans/loan-db';
import { calculatePaymentSplit, getTransactionLoanMatchScore, getConfidenceLevel } from '@/lib/loans/transaction-link-operations';

interface LinkToLoanPopoverProps {
  transaction: Transaction;
  onLinked: () => void;
  onClose: () => void;
}

export function LinkToLoanPopover({
  transaction,
  onLinked,
  onClose,
}: LinkToLoanPopoverProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const txAmount = Math.abs(transaction.amount);

  useEffect(() => {
    async function loadLoans() {
      setIsLoading(true);
      try {
        const activeLoans = await getActiveLoans();
        // Sort by match score (best matches first)
        const sortedLoans = activeLoans
          .map(loan => ({
            loan,
            score: getTransactionLoanMatchScore(transaction, loan),
          }))
          .sort((a, b) => b.score - a.score)
          .map(item => item.loan);

        setLoans(sortedLoans);

        // Auto-select first loan if high confidence match
        if (sortedLoans.length > 0) {
          const topScore = getTransactionLoanMatchScore(transaction, sortedLoans[0]);
          if (topScore >= 0.7) {
            setSelectedLoanId(sortedLoans[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading loans:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLoans();
  }, [transaction]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  async function handleLinkToLoan() {
    if (!selectedLoanId || isLinking) return;

    const loan = loans.find(l => l.id === selectedLoanId);
    if (!loan) return;

    setIsLinking(true);
    try {
      await createPaymentFromTransaction(loan, {
        id: transaction.id,
        amount: transaction.amount,
        date: new Date(transaction.date),
        description: transaction.description,
      });

      onLinked();
    } catch (error) {
      console.error('Error linking transaction to loan:', error);
      alert('Failed to link transaction. Please try again.');
    } finally {
      setIsLinking(false);
    }
  }

  const selectedLoan = loans.find(l => l.id === selectedLoanId);
  const paymentSplit = selectedLoan
    ? calculatePaymentSplit(selectedLoan, txAmount, new Date(transaction.date))
    : null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-teal-600" />
          <span className="font-semibold text-foreground">Link to Loan</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-6">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active loans found</p>
          </div>
        ) : (
          <>
            {/* Loan List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {loans.map((loan) => {
                const score = getTransactionLoanMatchScore(transaction, loan);
                const confidence = getConfidenceLevel(score);
                const isSelected = selectedLoanId === loan.id;

                return (
                  <button
                    key={loan.id}
                    type="button"
                    onClick={() => setSelectedLoanId(loan.id)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-border hover:border-teal-300 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">
                        {loan.name}
                      </span>
                      {score >= 0.5 && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            confidence === 'high'
                              ? 'bg-green-100 text-green-800'
                              : confidence === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {confidence === 'high'
                            ? 'Best Match'
                            : confidence === 'medium'
                            ? 'Possible Match'
                            : 'Low Match'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{loan.lender}</span>
                      <span>${loan.monthlyPayment.toFixed(2)}/mo</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Payment Preview */}
            {selectedLoan && paymentSplit && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Payment Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Principal:</span>
                  <span className="font-medium text-teal-600 text-right">
                    ${paymentSplit.principal.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">Interest:</span>
                  <span className="font-medium text-red-600 text-right">
                    ${paymentSplit.interest.toFixed(2)}
                  </span>
                  {paymentSplit.extra > 0 && (
                    <>
                      <span className="text-muted-foreground">Extra:</span>
                      <span className="font-medium text-green-600 text-right">
                        ${paymentSplit.extra.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleLinkToLoan}
          disabled={!selectedLoanId || isLinking}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLinking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Linking...
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              Link Payment
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Button to trigger the popover
 */
interface LinkToLoanButtonProps {
  transaction: Transaction;
  onLinked: () => void;
}

export function LinkToLoanButton({ transaction, onLinked }: LinkToLoanButtonProps) {
  const [showPopover, setShowPopover] = useState(false);

  // Only show for expense transactions
  if (transaction.amount >= 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowPopover(true);
        }}
        className="p-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
        title="Link to Loan"
      >
        <CreditCard className="w-4 h-4" />
      </button>

      {showPopover && (
        <LinkToLoanPopover
          transaction={transaction}
          onLinked={() => {
            setShowPopover(false);
            onLinked();
          }}
          onClose={() => setShowPopover(false)}
        />
      )}
    </div>
  );
}
