/**
 * Debt Overview Component
 * Dashboard widget showing loan summary and quick stats
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, TrendingDown, Calendar, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Loan } from '@/types/budget';
import {
  getActiveLoans,
  calculateTotalDebt,
  calculateMonthlyObligations,
  getUpcomingPayments,
  getWeightedAverageRate,
} from '@/lib/loans/loan-db';
import { format } from 'date-fns';

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
      console.error('Error loading debt data:', error);
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
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  function calculateProgress(loan: Loan): number {
    return ((loan.originalPrincipal - loan.currentBalance) / loan.originalPrincipal) * 100;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-s-4 border-teal-500">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Debt Overview</h2>
              <p className="text-sm text-gray-500">{loans.length} active {loans.length === 1 ? 'loan' : 'loans'}</p>
            </div>
          </div>
          <Link href="/budget-app/loans">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ms-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Debt</p>
          <p className="text-xl font-bold text-gray-900">${totalDebt.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Monthly Payment</p>
          <p className="text-xl font-bold text-gray-900">${monthlyPayment.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Avg Rate</p>
          <p className="text-xl font-bold text-gray-900">{avgRate.toFixed(2)}%</p>
        </div>
      </div>

      {/* Loan List */}
      <div className="p-6 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Loans</h3>
        {loans.slice(0, 3).map(loan => {
          const progress = calculateProgress(loan);

          return (
            <Link
              key={loan.id}
              href={`/budget-app/loans/${loan.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 group-hover:text-teal-900">{loan.name}</p>
                  <p className="text-xs text-gray-500">{loan.lender}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  {loan.type}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Balance</span>
                  <span className="font-semibold text-gray-900">${loan.currentBalance.toLocaleString()}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-teal-600 h-1.5 rounded-full transition-all"
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
            <Button variant="ghost" className="w-full mt-2">
              View {loans.length - 3} more {loans.length - 3 === 1 ? 'loan' : 'loans'}
            </Button>
          </Link>
        )}
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Payments
          </h3>
          <div className="space-y-2">
            {upcomingPayments.slice(0, 3).map((payment, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{payment.loanName}</p>
                  <p className="text-xs text-gray-500">{format(payment.date, 'MMM d, yyyy')}</p>
                </div>
                <p className="font-semibold text-gray-900">${payment.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Loan Button */}
      {loans.length < 5 && (
        <div className="p-6 border-t border-gray-200">
          <Link href="/budget-app/loans/new">
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 me-2" />
              Add Loan
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
