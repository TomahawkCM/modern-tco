/**
 * Loan Payment Selector Component
 * Select a loan to link a transaction to as a payment
 */

"use client";

import { useState, useEffect } from "react";
import { CreditCard, DollarSign, Percent, Calendar, ChevronDown } from "lucide-react";
import type { Loan } from "@/types/budget";
import { calculatePaymentSplit } from "@/lib/loans/transaction-link-operations";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import type { SupportedLocale } from "@/i18n/config";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";

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
  const currency = useDefaultCurrency();
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("loanPaymentSelector");
  const [isExpanded, setIsExpanded] = useState(false);
  const [paymentSplit, setPaymentSplit] = useState<{
    principal: number;
    interest: number;
    extra: number;
  } | null>(null);

  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

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
        className="flex items-center gap-2 text-base font-semibold text-teal-600 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CreditCard className="h-5 w-5" />
        <span>{t("linkToLoanPayment")}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        {selectedLoan && (
          <span className="ms-2 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">
            {selectedLoan.name}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 border-s-2 border-teal-200 ps-4">
          {/* Loan Selector */}
          <div>
            <label htmlFor="loan-select" className="mb-2 block text-sm font-medium text-foreground">
              {t("selectLoan")}
            </label>
            <select
              id="loan-select"
              value={selectedLoanId || ""}
              onChange={(e) => onLoanSelect(e.target.value || null)}
              disabled={disabled}
              className="min-h-[48px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{t("noLoan")}</option>
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {t("loanOption", {
                    name: loan.name,
                    lender: loan.lender,
                    payment: formatCurrency(loan.monthlyPayment, currency, locale),
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Split Preview */}
          {selectedLoan && paymentSplit && (
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <h4 className="text-sm font-semibold text-foreground">{t("paymentBreakdown")}</h4>

              {/* Loan Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>{t("currentBalance")}</span>
                </div>
                <div className="font-medium text-foreground">
                  {formatCurrency(selectedLoan.currentBalance, currency, locale)}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Percent className="h-4 w-4" />
                  <span>{t("interestRate")}</span>
                </div>
                <div className="font-medium text-foreground">{selectedLoan.interestRate}%</div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{t("nextDue")}</span>
                </div>
                <div className="font-medium text-foreground">
                  {format(new Date(selectedLoan.nextPaymentDate), "MMM d, yyyy")}
                </div>
              </div>

              {/* Divider */}
              <div className="my-3 border-t border-border" />

              {/* Payment Split */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4 text-teal-600" />
                  <span>{t("principal")}</span>
                </div>
                <div className="font-semibold text-teal-600">
                  {formatCurrency(paymentSplit.principal, currency, locale)}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  <span>{t("interest")}</span>
                </div>
                <div className="font-semibold text-red-600">
                  {formatCurrency(paymentSplit.interest, currency, locale)}
                </div>

                {paymentSplit.extra > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>{t("extraPrincipal")}</span>
                    </div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(paymentSplit.extra, currency, locale)}
                    </div>
                  </>
                )}
              </div>

              {/* New Balance Preview */}
              <div className="mt-3 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("balanceAfterPayment")}</span>
                  <span className="text-base font-bold text-foreground">
                    {formatCurrency(
                      Math.max(
                        0,
                        selectedLoan.currentBalance - paymentSplit.principal - paymentSplit.extra
                      ),
                      currency,
                      locale
                    )}
                  </span>
                </div>
              </div>

              {/* Warning if amount differs from monthly payment */}
              {Math.abs(amount - selectedLoan.monthlyPayment) > 0.01 && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-xs text-amber-800">
                    {amount > selectedLoan.monthlyPayment
                      ? t("paymentOverWarning", {
                          amount: formatCurrency(
                            amount - selectedLoan.monthlyPayment,
                            currency,
                            locale
                          ),
                        })
                      : t("paymentUnderWarning", {
                          amount: formatCurrency(
                            selectedLoan.monthlyPayment - amount,
                            currency,
                            locale
                          ),
                          monthlyPayment: formatCurrency(
                            selectedLoan.monthlyPayment,
                            currency,
                            locale
                          ),
                        })}
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
