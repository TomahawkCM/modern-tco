/**
 * Loan Detail Page
 * View individual loan with full amortization schedule
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, DollarSign, Calendar, Percent, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Loan } from '@/types/budget';
import { getLoan, deleteLoan, getLoanPayments } from '@/lib/loans/loan-db';
import { generateAmortizationSchedule, analyzeLoanCost } from '@/lib/loans/calculations';
import { ExtraPaymentCalculator } from '@/components/budget/loans/ExtraPaymentCalculator';
import { AmortizationChart } from '@/components/budget/loans/AmortizationChart';
import { PaymentHistory } from '@/components/budget/loans/PaymentHistory';
import { format } from 'date-fns';

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadLoan();
  }, [id]);

  async function loadLoan() {
    try {
      setLoading(true);
      const loanData = await getLoan(id);
      setLoan(loanData || null);
    } catch (error) {
      console.error('Error loading loan:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!loan) return;

    try {
      await deleteLoan(loan.id);
      router.push('/budget-app/loans');
    } catch (error) {
      console.error('Error deleting loan:', error);
      alert('Failed to delete loan. Please try again.');
    }
  }

  function getLoanTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      mortgage: 'Mortgage',
      auto: 'Auto Loan',
      personal: 'Personal Loan',
      student: 'Student Loan',
    };
    return labels[type] || type;
  }

  function calculateProgress(loan: Loan): number {
    return ((loan.originalPrincipal - loan.currentBalance) / loan.originalPrincipal) * 100;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading loan...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loan not found</h2>
        <p className="text-gray-500 mb-6">The loan you're looking for doesn't exist.</p>
        <Link href="/budget-app/loans">
          <Button>Back to Loans</Button>
        </Link>
      </div>
    );
  }

  const progress = calculateProgress(loan);
  const analysis = analyzeLoanCost(loan);
  const schedule = generateAmortizationSchedule(
    loan.currentBalance,
    loan.interestRate,
    loan.termMonths,
    loan.startDate,
    loan.monthlyPayment
  );

  const totalMonthlyPayment =
    loan.monthlyPayment +
    (loan.propertyTax || 0) +
    (loan.homeInsurance || 0) +
    (loan.pmi || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/budget-app/loans">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{loan.name}</h1>
            <p className="text-gray-500 mt-1">
              {getLoanTypeLabel(loan.type)} • {loan.lender}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/budget-app/loans/${loan.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${loan.currentBalance.toLocaleString()}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-teal-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {progress.toFixed(1)}% paid off
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payment</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${loan.monthlyPayment.toLocaleString()}</div>
            {totalMonthlyPayment > loan.monthlyPayment && (
              <p className="text-xs text-muted-foreground mt-1">
                ${totalMonthlyPayment.toLocaleString()} total (with escrow)
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loan.interestRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              APR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(loan.nextPaymentDate, 'MMM d')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(loan.nextPaymentDate, 'yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Amortization Schedule</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="calculator">Extra Payment Calculator</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Loan Details */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Original Principal</p>
                  <p className="text-lg font-semibold">${loan.originalPrincipal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loan Term</p>
                  <p className="text-lg font-semibold">{loan.termMonths} months ({(loan.termMonths / 12).toFixed(1)} years)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-lg font-semibold">{format(loan.startDate, 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-semibold capitalize">{loan.status}</p>
                </div>

                {/* Type-specific fields */}
                {loan.type === 'auto' && loan.vehicleMake && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle</p>
                      <p className="text-lg font-semibold">
                        {loan.vehicleYear} {loan.vehicleMake} {loan.vehicleModel}
                      </p>
                    </div>
                  </>
                )}

                {loan.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm mt-1">{loan.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cost Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>Total cost breakdown over the life of the loan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analysis.totalPayments.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Interest</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${analysis.totalInterest.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payoff Date</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {format(analysis.payoffDate, 'MMM yyyy')}
                  </p>
                </div>
              </div>

              {loan.type === 'mortgage' && (loan.propertyTax || loan.homeInsurance || loan.pmi) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Monthly Escrow Breakdown</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loan.propertyTax && (
                      <div>
                        <p className="text-xs text-gray-500">Property Tax</p>
                        <p className="text-lg font-semibold">${loan.propertyTax.toLocaleString()}</p>
                      </div>
                    )}
                    {loan.homeInsurance && (
                      <div>
                        <p className="text-xs text-gray-500">Home Insurance</p>
                        <p className="text-lg font-semibold">${loan.homeInsurance.toLocaleString()}</p>
                      </div>
                    )}
                    {loan.pmi && (
                      <div>
                        <p className="text-xs text-gray-500">PMI</p>
                        <p className="text-lg font-semibold">${loan.pmi.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Amortization Schedule</CardTitle>
              <CardDescription>Month-by-month breakdown of principal and interest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Month</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Payment</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Principal</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Interest</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.slice(0, 120).map((entry, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{entry.month}</td>
                        <td className="px-4 py-3 text-gray-600">{format(entry.date, 'MMM yyyy')}</td>
                        <td className="px-4 py-3 text-right text-gray-900">${entry.payment.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-teal-600">${entry.principal.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-600">${entry.interest.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          ${entry.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {schedule.length > 120 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Showing first 120 of {schedule.length} payments
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <AmortizationChart loan={loan} />
        </TabsContent>

        <TabsContent value="calculator">
          <ExtraPaymentCalculator loan={loan} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentHistory loan={loan} onLoanUpdate={loadLoan} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Delete Loan?</CardTitle>
              <CardDescription>
                Are you sure you want to delete "{loan.name}"? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Loan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
