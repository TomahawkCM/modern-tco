/**
 * Payment History Component
 * Display loan payment records with transaction linking
 */

"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Link as LinkIcon,
  Unlink,
  Plus,
  AlertCircle,
  CheckCircle2,
  Eye,
  X as XIcon,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Loan, LoanPayment, Transaction } from "@/types/budget";
import { getLoanPayments, recordPayment, deletePayment, updatePayment } from "@/lib/loans/loan-db";
import { db } from "@/lib/budget-db";
import {
  findUnlinkedTransactionsForLoan,
  type TransactionMatch,
} from "@/lib/loans/transaction-matcher";
import { format } from "date-fns";

interface PaymentHistoryProps {
  loan: Loan;
  onLoanUpdate?: () => void;
}

export function PaymentHistory({ loan, onLoanUpdate }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suggestedMatches, setSuggestedMatches] = useState<TransactionMatch[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showLinkTransaction, setShowLinkTransaction] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<LoanPayment | null>(null);
  const [loading, setLoading] = useState(true);

  // Dismissed matches (stored in localStorage to persist across sessions)
  const [dismissedMatchIds, setDismissedMatchIds] = useState<Set<string>>(new Set());

  // Load dismissed matches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`dismissedLoanMatches_${loan.id}`);
    if (stored) {
      try {
        setDismissedMatchIds(new Set(JSON.parse(stored)));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, [loan.id]);

  // Save dismissed matches to localStorage
  function dismissMatch(transactionId: string) {
    const newDismissed = new Set(dismissedMatchIds);
    newDismissed.add(transactionId);
    setDismissedMatchIds(newDismissed);
    localStorage.setItem(`dismissedLoanMatches_${loan.id}`, JSON.stringify([...newDismissed]));
  }

  // Filter out dismissed matches
  const visibleMatches = suggestedMatches.filter(
    (match) => !dismissedMatchIds.has(match.transaction.id)
  );

  // New payment form state
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentAmount, setPaymentAmount] = useState(loan.monthlyPayment);
  const [extraPrincipal, setExtraPrincipal] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadPaymentData();
  }, [loan.id]);

  async function loadPaymentData() {
    try {
      setLoading(true);
      const [loanPayments, allTransactions] = await Promise.all([
        getLoanPayments(loan.id),
        db.transactions.toArray(),
      ]);

      setPayments(loanPayments);
      setTransactions(allTransactions);

      // Find suggested transaction matches
      const matches = findUnlinkedTransactionsForLoan(allTransactions, loan);
      setSuggestedMatches(matches.slice(0, 5)); // Top 5 suggestions
    } catch (error) {
      console.error("Error loading payment data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPayment() {
    try {
      const totalAmount = paymentAmount + extraPrincipal;
      const monthlyRate = loan.interestRate / 100 / 12;
      const interestAmount = loan.currentBalance * monthlyRate;
      const principalAmount = paymentAmount - interestAmount;

      await recordPayment({
        loanId: loan.id,
        date: new Date(paymentDate),
        amount: totalAmount,
        principalAmount,
        interestAmount,
        extraPrincipal,
        balanceAfter: loan.currentBalance - (principalAmount + extraPrincipal),
        notes,
        isScheduled: false,
      });

      // Reset form
      setShowAddPayment(false);
      setPaymentDate(format(new Date(), "yyyy-MM-dd"));
      setPaymentAmount(loan.monthlyPayment);
      setExtraPrincipal(0);
      setNotes("");

      // Reload data
      await loadPaymentData();
      onLoanUpdate?.();
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to add payment. Please try again.");
    }
  }

  async function handleLinkTransaction(match: TransactionMatch) {
    try {
      // Create payment record linked to transaction
      await recordPayment({
        loanId: loan.id,
        date: new Date(match.transaction.date),
        amount: Math.abs(match.transaction.amount),
        principalAmount: match.suggestedPrincipal,
        interestAmount: match.suggestedInterest,
        extraPrincipal: match.suggestedExtraPrincipal,
        balanceAfter:
          loan.currentBalance - (match.suggestedPrincipal + match.suggestedExtraPrincipal),
        notes: `Linked from transaction: ${match.transaction.description}`,
        transactionId: match.transaction.id,
        isScheduled: false,
      });

      // Update transaction to mark it as linked
      await db.transactions.update(match.transaction.id, {
        category: `Loan Payment - ${loan.name}`,
      });

      // Reload data
      await loadPaymentData();
      onLoanUpdate?.();
    } catch (error) {
      console.error("Error linking transaction:", error);
      alert("Failed to link transaction. Please try again.");
    }
  }

  async function handleUnlinkPayment(payment: LoanPayment) {
    if (!payment.transactionId) return;

    if (!confirm("Unlink this payment from the transaction?")) return;

    try {
      // Update payment to remove transaction link
      await updatePayment(payment.id, { transactionId: undefined });

      // Optionally reset transaction category
      if (payment.transactionId) {
        await db.transactions.update(payment.transactionId, {
          category: "Uncategorized",
        });
      }

      // Reload data
      await loadPaymentData();
      onLoanUpdate?.();
    } catch (error) {
      console.error("Error unlinking payment:", error);
      alert("Failed to unlink payment. Please try again.");
    }
  }

  async function handleDeletePayment(payment: LoanPayment) {
    if (!confirm("Delete this payment record? This action cannot be undone.")) return;

    try {
      await deletePayment(payment.id);
      await loadPaymentData();
      onLoanUpdate?.();
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-teal-500"></div>
          <p className="text-gray-500">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Suggested Matches */}
      {visibleMatches.length > 0 && (
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-teal-600" />
                  Suggested Transaction Matches
                </CardTitle>
                <CardDescription>
                  We found {visibleMatches.length} transaction
                  {visibleMatches.length !== 1 ? "s" : ""} that might be loan payments
                </CardDescription>
              </div>
              {suggestedMatches.length > visibleMatches.length && (
                <span className="text-xs text-gray-500">
                  {suggestedMatches.length - visibleMatches.length} dismissed
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleMatches.map((match, index) => (
              <div
                key={match.transaction.id}
                className="rounded-lg border border-teal-200 bg-white p-4 transition-colors hover:border-teal-300"
              >
                {/* Match Header */}
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {format(new Date(match.transaction.date), "MMM d, yyyy")}
                      </p>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          match.confidence === "high"
                            ? "bg-green-100 text-green-800"
                            : match.confidence === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {match.confidence === "high"
                          ? "High Confidence"
                          : match.confidence === "medium"
                            ? "Medium Confidence"
                            : "Low Confidence"}
                      </span>
                    </div>
                    <p
                      className="truncate text-sm text-gray-700"
                      title={match.transaction.description}
                    >
                      {match.transaction.description}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-lg font-bold text-gray-900">
                    ${Math.abs(match.transaction.amount).toLocaleString()}
                  </p>
                </div>

                {/* Match Reasons */}
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  {match.matchReasons.map((reason, i) => (
                    <span key={i} className="rounded bg-gray-100 px-2 py-0.5">
                      {reason}
                    </span>
                  ))}
                </div>

                {/* Payment Split Preview */}
                <div className="mb-3 grid grid-cols-3 gap-2 rounded bg-gray-50 p-2 text-xs">
                  <div className="text-center">
                    <span className="block text-gray-500">Principal</span>
                    <span className="font-semibold text-teal-600">
                      ${match.suggestedPrincipal.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-gray-500">Interest</span>
                    <span className="font-semibold text-red-600">
                      ${match.suggestedInterest.toFixed(2)}
                    </span>
                  </div>
                  {match.suggestedExtraPrincipal > 0 && (
                    <div className="text-center">
                      <span className="block text-gray-500">Extra</span>
                      <span className="font-semibold text-green-600">
                        ${match.suggestedExtraPrincipal.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/budget-app/transactions?search=${encodeURIComponent(match.transaction.description)}`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      title="View transaction"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </a>
                    <button
                      onClick={() => dismissMatch(match.transaction.id)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Dismiss this match"
                    >
                      <XIcon className="h-3 w-3" />
                      Dismiss
                    </button>
                  </div>
                  <Button
                    onClick={() => handleLinkTransaction(match)}
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <LinkIcon className="me-2 h-4 w-4" />
                    Link Payment
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Payment Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track your loan payments and link to transactions</CardDescription>
            </div>
            <Button
              onClick={() => setShowAddPayment(!showAddPayment)}
              className="bg-teal-500 hover:bg-teal-600"
            >
              <Plus className="me-2 h-4 w-4" />
              Add Payment
            </Button>
          </div>
        </CardHeader>

        {showAddPayment && (
          <CardContent className="border-t border-gray-200 pt-6">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="paymentAmount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="ps-10"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="extraPrincipal">Extra Principal (Optional)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="extraPrincipal"
                    type="number"
                    value={extraPrincipal}
                    onChange={(e) => setExtraPrincipal(parseFloat(e.target.value) || 0)}
                    className="ps-10"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment notes..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddPayment(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPayment} className="bg-teal-500 hover:bg-teal-600">
                Save Payment
              </Button>
            </div>
          </CardContent>
        )}

        <CardContent>
          {payments.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="mb-2 text-gray-600">No payment history yet</p>
              <p className="text-sm text-gray-500">
                Add payments manually or link them from your transactions
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-start font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-end font-medium text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-end font-medium text-gray-700">Principal</th>
                    <th className="px-4 py-3 text-end font-medium text-gray-700">Interest</th>
                    <th className="px-4 py-3 text-end font-medium text-gray-700">Extra</th>
                    <th className="px-4 py-3 text-end font-medium text-gray-700">
                      Balance After
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const linkedTransaction = payment.transactionId
                      ? transactions.find((t) => t.id === payment.transactionId)
                      : null;

                    return (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {format(new Date(payment.date), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-end text-gray-900">
                          ${payment.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-end text-teal-600">
                          ${payment.principalAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-end text-red-600">
                          ${payment.interestAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-end text-green-600">
                          {payment.extraPrincipal > 0
                            ? `$${payment.extraPrincipal.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-end font-medium text-gray-900">
                          ${payment.balanceAfter.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {linkedTransaction ? (
                            <div className="flex items-center justify-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-700">Linked</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Manual</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {linkedTransaction ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnlinkPayment(payment)}
                              >
                                <Unlink className="h-3 w-3" />
                              </Button>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePayment(payment)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
