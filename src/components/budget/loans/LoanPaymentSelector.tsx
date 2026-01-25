/**
 * Loan Payment Selector Component
 * Select a loan to link a transaction to as a payment
 */

'use client';

import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Percent, Calendar, ChevronDown } from 'lucide-react';
import type { Loan } from '@/types/budget';
import { calculatePaymentSplit } from '@/lib/loans/transaction-link-operations';
import { format } from 'date-fns';

interface LoanPaymentSelectorProps {
  loans: Loan[];
  selectedLoanId: string | null;
  onLoanSelect: (loanId: string | null) => void;
  amount: number; // Transaction amount (positive)
  date: Date;
  disabled?: boolean;
}

export function LoanPaymentSelector({
  loans,
  selectedLoanId,
  onLoanSelect,
  amount,
  date,
  disabled = false,
}: LoanPaymentSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [paymentSplit, setPaymentSplit] = useState<{
    principal: number;
    interest: number;
    extra: number;
  } | null>(null);

  const selectedLoan = loans.find(l => l.id === selectedLoanId);

  // Calculate payment split when loan is selected
  useEffect(() => {
    if (selectedLoan && amount > 0) {
      const split = calculatePaymentSplit(selectedLoan, amount, date);
      setPaymentSplit(split);
    } else {
      setPaymentSplit(null);
    }
  }, [selectedLoan, amount, date]);

  if (loans.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="flex items-center gap-2 text-base font-semibold text-teal-600 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CreditCard className="w-5 h-5" />
        <span>Link to Loan Payment</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
        {selectedLoan && (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
            {selectedLoan.name}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="ps-4 border-s-2 border-teal-200 space-y-4">
          {/* Loan Selector */}
          <div>
            <label
              htmlFor="loan-select"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Select Loan
            </label>
            <select
              id="loan-select"
              value={selectedLoanId || ''}
              onChange={(e) => onLoanSelect(e.target.value || null)}
              disabled={disabled}
              className="w-full min-h-[48px] px-4 text-base border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- No loan --</option>
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.name} ({loan.lender}) - ${loan.monthlyPayment.toFixed(2)}/mo
                </option>
              ))}
            </select>
          </div>

          {/* Payment Split Preview */}
          {selectedLoan && paymentSplit && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Payment Breakdown
              </h4>

              {/* Loan Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>Current Balance:</span>
                </div>
                <div className="font-medium text-foreground">
                  ${selectedLoan.currentBalance.toLocaleString()}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Percent className="w-4 h-4" />
                  <span>Interest Rate:</span>
                </div>
                <div className="font-medium text-foreground">
                  {selectedLoan.interestRate}%
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Next Due:</span>
                </div>
                <div className="font-medium text-foreground">
                  {format(new Date(selectedLoan.nextPaymentDate), 'MMM d, yyyy')}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border my-3" />

              {/* Payment Split */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4 text-teal-600" />
                  <span>Principal:</span>
                </div>
                <div className="font-semibold text-teal-600">
                  ${paymentSplit.principal.toFixed(2)}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4 text-red-600" />
                  <span>Interest:</span>
                </div>
                <div className="font-semibold text-red-600">
                  ${paymentSplit.interest.toFixed(2)}
                </div>

                {paymentSplit.extra > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>Extra Principal:</span>
                    </div>
                    <div className="font-semibold text-green-600">
                      ${paymentSplit.extra.toFixed(2)}
                    </div>
                  </>
                )}
              </div>

              {/* New Balance Preview */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Balance After Payment:
                  </span>
                  <span className="text-base font-bold text-foreground">
                    ${Math.max(
                      0,
                      selectedLoan.currentBalance -
                        paymentSplit.principal -
                        paymentSplit.extra
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Warning if amount differs from monthly payment */}
              {Math.abs(amount - selectedLoan.monthlyPayment) > 0.01 && (
                <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    {amount > selectedLoan.monthlyPayment
                      ? `This payment is $${(amount - selectedLoan.monthlyPayment).toFixed(2)} more than the regular monthly payment. The extra will be applied to principal.`
                      : `This payment is $${(selectedLoan.monthlyPayment - amount).toFixed(2)} less than the regular monthly payment of $${selectedLoan.monthlyPayment.toFixed(2)}.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
