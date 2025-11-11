/**
 * Loans Page
 * Main dashboard for viewing and managing all loans
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, TrendingDown, Calendar, DollarSign, Percent, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyStates } from '@/components/budget/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Loan, LoanType, LoanStatus } from '@/types/budget';
import {
  getAllLoans,
  calculateTotalDebt,
  calculateMonthlyObligations,
  getDebtBreakdown,
  getWeightedAverageRate,
  estimateDebtFreeDate,
} from '@/lib/loans/loan-db';
import { format } from 'date-fns';

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [filterType, setFilterType] = useState<LoanType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<LoanStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // Summary metrics
  const [totalDebt, setTotalDebt] = useState(0);
  const [monthlyObligations, setMonthlyObligations] = useState(0);
  const [avgInterestRate, setAvgInterestRate] = useState(0);
  const [debtFreeDate, setDebtFreeDate] = useState<Date | null>(null);

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [loans, filterType, filterStatus]);

  async function loadLoans() {
    try {
      setLoading(true);
      const allLoans = await getAllLoans();
      setLoans(allLoans);

      // Load summary metrics
      const debt = await calculateTotalDebt();
      const obligations = await calculateMonthlyObligations();
      const avgRate = await getWeightedAverageRate();
      const freeDate = await estimateDebtFreeDate();

      setTotalDebt(debt);
      setMonthlyObligations(obligations);
      setAvgInterestRate(avgRate);
      setDebtFreeDate(freeDate);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...loans];

    if (filterType !== 'all') {
      filtered = filtered.filter(loan => loan.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(loan => loan.status === filterStatus);
    }

    setFilteredLoans(filtered);
  }

  function getLoanTypeLabel(type: LoanType): string {
    const labels = {
      mortgage: 'Mortgage',
      auto: 'Auto Loan',
      personal: 'Personal Loan',
      student: 'Student Loan',
    };
    return labels[type];
  }

  function getStatusColor(status: LoanStatus): string {
    const colors = {
      active: 'bg-green-100 text-green-800',
      'paid-off': 'bg-gray-100 text-gray-800',
      refinanced: 'bg-yellow-100 text-yellow-800',
      defaulted: 'bg-red-100 text-red-800',
    };
    return colors[status];
  }

  function calculateProgress(loan: Loan): number {
    return ((loan.originalPrincipal - loan.currentBalance) / loan.originalPrincipal) * 100;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-500 mt-1">Manage and track all your loans</p>
        </div>
        <Link href="/budget-app/loans/new">
          <Button className="bg-teal-500 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Loan
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDebt.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {loans.filter(l => l.status === 'active').length} active loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payment</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyObligations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total monthly obligations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Interest Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgInterestRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Weighted average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debt-Free Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {debtFreeDate ? format(debtFreeDate, 'MMM yyyy') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated payoff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Filter by Type
          </label>
          <Select value={filterType} onValueChange={(value) => setFilterType(value as LoanType | 'all')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mortgage">Mortgage</SelectItem>
              <SelectItem value="auto">Auto Loan</SelectItem>
              <SelectItem value="personal">Personal Loan</SelectItem>
              <SelectItem value="student">Student Loan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as LoanStatus | 'all')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paid-off">Paid Off</SelectItem>
              <SelectItem value="refinanced">Refinanced</SelectItem>
              <SelectItem value="defaulted">Defaulted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loans List */}
      {filteredLoans.length === 0 ? (
        loans.length === 0 ? (
          <EmptyStates.Loans />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No loans match your filters</h3>
              <p className="text-gray-500 text-center max-w-md">
                Try adjusting your filter criteria to see more loans.
              </p>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredLoans.map(loan => {
            const progress = calculateProgress(loan);

            return (
              <Link key={loan.id} href={`/budget-app/loans/${loan.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{loan.name}</CardTitle>
                        <CardDescription className="mt-1">{loan.lender}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {getLoanTypeLabel(loan.type)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Balance and Payment */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Current Balance</p>
                          <p className="text-xl font-bold text-gray-900">
                            ${loan.currentBalance.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Monthly Payment</p>
                          <p className="text-xl font-bold text-gray-900">
                            ${loan.monthlyPayment.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{progress.toFixed(1)}% paid off</span>
                          <span>{loan.interestRate.toFixed(2)}% APR</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-teal-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Next Payment */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Next Payment:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {format(loan.nextPaymentDate, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
