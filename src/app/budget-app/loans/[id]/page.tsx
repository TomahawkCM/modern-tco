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
import { LazyAmortizationChart } from '@/components/budget/charts/LazyChartComponents';
import { PaymentHistory } from '@/components/budget/loans/PaymentHistory';
import { format } from 'date-fns';
import { HelpTooltip } from '@/components/budget/HelpTooltip';

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
          <p className="text-slate-400">Loading loan...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Loan not found</h2>
        <p className="text-slate-400 mb-6">The loan you're looking for doesn't exist.</p>
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
      {/* Header - Enhanced */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/budget-app/loans">
            <Button variant="outline" size="icon" className="min-h-[48px] min-w-[48px]">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{loan.name}</h1>
            <p className="text-base sm:text-lg text-slate-400 mt-1 font-medium">
              {getLoanTypeLabel(loan.type)} • {loan.lender}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href={`/budget-app/loans/${loan.id}/edit`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto min-h-[48px] px-4">
              <Edit className="w-5 h-5 mr-2" />
              <span className="text-base font-semibold">Edit</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[48px] px-4"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            <span className="text-base font-semibold">Delete</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards - Enhanced for Seniors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-300">Current Balance</CardTitle>
            <DollarSign className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${loan.currentBalance.toLocaleString()}</div>
            <div className="w-full bg-slate-700 rounded-full h-4 mt-3 shadow-inner">
              <div
                className="bg-teal-500 h-4 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-medium text-teal-500 mt-2">
              {progress.toFixed(1)}% paid off
            </p>
            <p className="text-xs text-slate-400 mt-1">
              You've paid ${(loan.originalPrincipal - loan.currentBalance).toLocaleString()} so far
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-slate-300">Monthly Payment</CardTitle>
              <HelpTooltip
                content={
                  <>
                    <strong>Principal vs Interest:</strong> Your payment splits between the loan balance (principal)
                    and borrowing cost (interest). Early payments are mostly interest. Later payments are mostly principal.
                    See the Amortization Schedule tab for the full breakdown.
                  </>
                }
                learnMoreUrl="/docs/user-guide#principal-vs-interest"
                ariaLabel="More information about principal and interest"
              />
            </div>
            <TrendingDown className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${loan.monthlyPayment.toLocaleString()}</div>
            {totalMonthlyPayment > loan.monthlyPayment && (
              <p className="text-sm font-medium text-slate-400 mt-2">
                ${totalMonthlyPayment.toLocaleString()} total with escrow
              </p>
            )}
            <p className="text-xs text-slate-400 mt-2">
              Principal & interest only
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-slate-300">Interest Rate</CardTitle>
              <HelpTooltip
                content="APR (Annual Percentage Rate) is the yearly cost to borrow money. Example: 5% APR on $10,000 = $500 interest per year. Lower APR = less you pay overall."
                learnMoreUrl="/docs/user-guide#apr-explained"
                ariaLabel="More information about APR and interest rates"
              />
            </div>
            <Percent className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{loan.interestRate.toFixed(2)}%</div>
            <p className="text-sm font-medium text-slate-400 mt-2">
              Annual Percentage Rate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-300">Next Payment</CardTitle>
            <Calendar className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{format(loan.nextPaymentDate, 'MMM d')}</div>
            <p className="text-sm font-medium text-slate-400 mt-2">
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

        <TabsContent value="overview" className="space-y-6">
          {/* Loan Details - Enhanced */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Loan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-base font-medium text-slate-400 mb-1">Original Principal</p>
                  <p className="text-xl font-bold text-white">${loan.originalPrincipal.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 mt-1">Amount you borrowed</p>
                </div>
                <div>
                  <p className="text-base font-medium text-slate-400 mb-1">Loan Term</p>
                  <p className="text-xl font-bold text-white">{(loan.termMonths / 12).toFixed(0)} years</p>
                  <p className="text-sm text-slate-400 mt-1">{loan.termMonths} monthly payments</p>
                </div>
                <div>
                  <p className="text-base font-medium text-slate-400 mb-1">Start Date</p>
                  <p className="text-xl font-bold text-white">{format(loan.startDate, 'MMM d, yyyy')}</p>
                  <p className="text-sm text-slate-400 mt-1">First payment date</p>
                </div>
                <div>
                  <p className="text-base font-medium text-slate-400 mb-1">Status</p>
                  <p className="text-xl font-bold text-white capitalize">{loan.status}</p>
                </div>

                {/* Type-specific fields */}
                {loan.type === 'auto' && loan.vehicleMake && (
                  <>
                    <div className="md:col-span-2">
                      <p className="text-base font-medium text-slate-400 mb-1">Vehicle</p>
                      <p className="text-xl font-bold text-white">
                        {loan.vehicleYear} {loan.vehicleMake} {loan.vehicleModel}
                      </p>
                    </div>
                  </>
                )}

                {loan.notes && (
                  <div className="md:col-span-2 pt-4 border-t border-slate-700">
                    <p className="text-base font-medium text-slate-400 mb-2">Notes</p>
                    <p className="text-base text-slate-300">{loan.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cost Analysis - Enhanced with Plain Language */}
          <Card className="shadow-md border-l-4 border-teal-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">Cost Analysis</CardTitle>
                <HelpTooltip
                  content={
                    <>
                      <strong>Amortization:</strong> How your loan gets paid off over time. Each payment covers interest first,
                      then principal. The schedule shows exactly how much goes to each, month by month. Early payments are mostly interest!
                    </>
                  }
                  learnMoreUrl="/docs/user-guide#amortization"
                  ariaLabel="More information about amortization and loan payoff"
                  iconSize="h-5 w-5"
                />
              </div>
              <CardDescription className="text-base">See the total cost of this loan over its lifetime</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900/50 border border-white/10 p-4 rounded-lg">
                  <p className="text-base font-semibold text-slate-300 mb-2">Total You'll Pay</p>
                  <p className="text-3xl font-bold text-white">
                    ${analysis.totalPayments.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Over {(loan.termMonths / 12).toFixed(0)} years
                  </p>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                  <p className="text-base font-semibold text-slate-300 mb-2">Total Interest</p>
                  <p className="text-3xl font-bold text-red-500">
                    ${analysis.totalInterest.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Extra cost above principal
                  </p>
                </div>
                <div className="bg-teal-900/20 border border-teal-500/30 p-4 rounded-lg">
                  <p className="text-base font-semibold text-slate-300 mb-2">Payoff Date</p>
                  <p className="text-3xl font-bold text-teal-500">
                    {format(analysis.payoffDate, 'MMM yyyy')}
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Final payment month
                  </p>
                </div>
              </div>

              {/* Plain Language Explanation */}
              <div className="bg-slate-900/50 border-l-4 border-teal-500 p-4 rounded">
                <p className="text-base text-slate-300">
                  <span className="font-semibold">What this means:</span> You borrowed ${loan.originalPrincipal.toLocaleString()},
                  but you'll pay ${analysis.totalPayments.toLocaleString()} total. The extra ${analysis.totalInterest.toLocaleString()}
                  is interest at {loan.interestRate.toFixed(2)}% APR over {(loan.termMonths / 12).toFixed(0)} years.
                </p>
              </div>

              {loan.type === 'mortgage' && (loan.propertyTax || loan.homeInsurance || loan.pmi) && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <p className="text-lg font-semibold text-gray-900 mb-4">Monthly Escrow Breakdown</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loan.propertyTax && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">Property Tax</p>
                        <p className="text-xl font-bold text-gray-900">${loan.propertyTax.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Per month</p>
                      </div>
                    )}
                    {loan.homeInsurance && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">Home Insurance</p>
                        <p className="text-xl font-bold text-gray-900">${loan.homeInsurance.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Per month</p>
                      </div>
                    )}
                    {loan.pmi && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">PMI (Private Mortgage Insurance)</p>
                        <p className="text-xl font-bold text-gray-900">${loan.pmi.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Per month</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">Amortization Schedule</CardTitle>
                <HelpTooltip
                  content={
                    <>
                      <strong>Extra Payments:</strong> Paying more than the minimum reduces principal faster,
                      saving thousands in interest. Example: $100 extra/month on a 30-year mortgage can save 5-7 years!
                      Use the Extra Payment Calculator tab to see your savings.
                    </>
                  }
                  learnMoreUrl="/docs/user-guide#extra-payments"
                  ariaLabel="More information about extra payments"
                  iconSize="h-5 w-5"
                />
              </div>
              <CardDescription className="text-base">Month-by-month breakdown showing how your loan gets paid off</CardDescription>
              <div className="mt-3 bg-gray-50 border-l-4 border-teal-400 p-3 rounded">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">Tip:</span> Notice how early payments are mostly interest (red), but later payments are mostly principal (teal).
                  Making extra payments early can save you thousands in interest!
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-100">
                      <th className="px-3 py-4 text-left font-bold text-gray-900">Month</th>
                      <th className="px-3 py-4 text-left font-bold text-gray-900">Date</th>
                      <th className="px-3 py-4 text-right font-bold text-gray-900">Payment</th>
                      <th className="px-3 py-4 text-right font-bold text-teal-700">Principal</th>
                      <th className="px-3 py-4 text-right font-bold text-red-700">Interest</th>
                      <th className="px-3 py-4 text-right font-bold text-gray-900">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.slice(0, 120).map((entry, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-4 font-semibold text-gray-900">{entry.month}</td>
                        <td className="px-3 py-4 text-gray-700">{format(entry.date, 'MMM yyyy')}</td>
                        <td className="px-3 py-4 text-right font-semibold text-gray-900">${entry.payment.toLocaleString()}</td>
                        <td className="px-3 py-4 text-right font-semibold text-teal-600">${entry.principal.toLocaleString()}</td>
                        <td className="px-3 py-4 text-right font-semibold text-red-600">${entry.interest.toLocaleString()}</td>
                        <td className="px-3 py-4 text-right font-bold text-gray-900">
                          ${entry.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {schedule.length > 120 && (
                  <div className="text-center py-4 text-base font-medium text-gray-600 bg-gray-50 mt-4 rounded-lg">
                    Showing first 120 of {schedule.length} payments •
                    <span className="text-teal-600 ml-1">Scroll down to see more</span>
                  </div>
                )}
              </div>

              {/* Legend for mobile users */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">Color Key:</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-teal-600 rounded"></div>
                    <span className="text-gray-700"><span className="font-semibold">Principal:</span> Pays down your loan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span className="text-gray-700"><span className="font-semibold">Interest:</span> Cost of borrowing</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <LazyAmortizationChart loan={loan} />
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
