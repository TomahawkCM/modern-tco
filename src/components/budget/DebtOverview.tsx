/**
 * Debt Overview Component
 * Dashboard widget showing loan summary and quick stats
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, TrendingDown, Calendar, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Loan } from "@/types/budget";
import {
  getActiveLoans,
  calculateTotalDebt,
  calculateMonthlyObligations,
  getUpcomingPayments,
  getWeightedAverageRate,
} from "@/lib/loans/loan-db";
import { format } from "date-fns";

export function DebtOverview() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [avgRate, setAvgRate] = useState(0);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebtData();
  }, []);

  async function loadDebtData() {
    try {
      setLoading(true);
      const activeLoans = await getActiveLoans();
      const debt = await calculateTotalDebt();
      const payment = await calculateMonthlyObligations();
      const rate = await getWeightedAverageRate();
      const upcoming = await getUpcomingPayments(2); // Next 2 months

      setLoans(activeLoans);
      setTotalDebt(debt);
      setMonthlyPayment(payment);
      setAvgRate(rate);
      setUpcomingPayments(upcoming);
    } catch (error) {
      console.error("Error loading debt data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Don't show widget if no loans
  if (!loading && loans.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded bg-gray-200"></div>
          <div className="h-24 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  function calculateProgress(loan: Loan): number {
    return ((loan.originalPrincipal - loan.currentBalance) / loan.originalPrincipal) * 100;
  }

  return (
    <div className="overflow-hidden rounded-xl border-s-4 border-teal-500 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <CreditCard className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Debt Overview</h2>
              <p className="text-sm text-gray-500">
                {loans.length} active {loans.length === 1 ? "loan" : "loans"}
              </p>
            </div>
          </div>
          <Link href="/budget-app/loans">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ms-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 bg-gray-50 p-6">
        <div>
          <p className="mb-1 text-xs text-gray-500">Total Debt</p>
          <p className="text-xl font-bold text-gray-900">${totalDebt.toLocaleString()}</p>
        </div>
        <div>
          <p className="mb-1 text-xs text-gray-500">Monthly Payment</p>
          <p className="text-xl font-bold text-gray-900">${monthlyPayment.toLocaleString()}</p>
        </div>
        <div>
          <p className="mb-1 text-xs text-gray-500">Avg Rate</p>
          <p className="text-xl font-bold text-gray-900">{avgRate.toFixed(2)}%</p>
        </div>
      </div>

      {/* Loan List */}
      <div className="space-y-3 p-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Active Loans</h3>
        {loans.slice(0, 3).map((loan) => {
          const progress = calculateProgress(loan);

          return (
            <Link
              key={loan.id}
              href={`/budget-app/loans/${loan.id}`}
              className="group block rounded-lg border border-gray-200 p-4 transition-all hover:border-teal-300 hover:bg-teal-50"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 group-hover:text-teal-900">{loan.name}</p>
                  <p className="text-xs text-gray-500">{loan.lender}</p>
                </div>
                <span className="rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-800">
                  {loan.type}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Balance</span>
                  <span className="font-semibold text-gray-900">
                    ${loan.currentBalance.toLocaleString()}
                  </span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-teal-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{progress.toFixed(1)}% paid off</span>
                  <span>${loan.monthlyPayment.toLocaleString()}/mo</span>
                </div>
              </div>
            </Link>
          );
        })}

        {loans.length > 3 && (
          <Link href="/budget-app/loans">
            <Button variant="ghost" className="mt-2 w-full">
              View {loans.length - 3} more {loans.length - 3 === 1 ? "loan" : "loans"}
            </Button>
          </Link>
        )}
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar className="h-4 w-4" />
            Upcoming Payments
          </h3>
          <div className="space-y-2">
            {upcomingPayments.slice(0, 3).map((payment, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{payment.loanName}</p>
                  <p className="text-xs text-gray-500">{format(payment.date, "MMM d, yyyy")}</p>
                </div>
                <p className="font-semibold text-gray-900">${payment.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Loan Button */}
      {loans.length < 5 && (
        <div className="border-t border-gray-200 p-6">
          <Link href="/budget-app/loans/new">
            <Button variant="outline" className="w-full">
              <Plus className="me-2 h-4 w-4" />
              Add Loan
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
