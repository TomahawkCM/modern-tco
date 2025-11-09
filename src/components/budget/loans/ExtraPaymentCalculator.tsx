/**
 * Extra Payment Calculator Component
 * Interactive tool for calculating the impact of extra loan payments
 */

'use client';

import { useState } from 'react';
import { TrendingDown, DollarSign, Calendar, Percent, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Loan } from '@/types/budget';
import { calculateExtraPaymentImpact } from '@/lib/loans/calculations';
import { format } from 'date-fns';

interface ExtraPaymentCalculatorProps {
  loan: Loan;
}

export function ExtraPaymentCalculator({ loan }: ExtraPaymentCalculatorProps) {
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [oneTimeAmount, setOneTimeAmount] = useState(0);
  const [oneTimeMonth, setOneTimeMonth] = useState(1);
  const [showResults, setShowResults] = useState(false);

  function handleCalculate() {
    setShowResults(true);
  }

  const scenario = calculateExtraPaymentImpact(
    loan,
    extraMonthly,
    oneTimeAmount > 0 ? [{ month: oneTimeMonth, amount: oneTimeAmount }] : []
  );

  const monthsSaved = scenario.monthsSaved;
  const yearsSaved = Math.floor(monthsSaved / 12);
  const remainingMonths = monthsSaved % 12;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Extra Payment Calculator</CardTitle>
          <CardDescription>
            See how extra payments can save you money and time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Extra Monthly Payment */}
          <div>
            <Label htmlFor="extraMonthly">Extra Monthly Payment</Label>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="extraMonthly"
                  type="number"
                  value={extraMonthly || ''}
                  onChange={e => setExtraMonthly(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="50"
                  className="pl-10"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Additional amount to pay each month
            </p>
          </div>

          {/* One-Time Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="oneTimeAmount">One-Time Payment</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="oneTimeAmount"
                  type="number"
                  value={oneTimeAmount || ''}
                  onChange={e => setOneTimeAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="100"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="oneTimeMonth">Apply in Month</Label>
              <Input
                id="oneTimeMonth"
                type="number"
                value={oneTimeMonth}
                onChange={e => setOneTimeMonth(parseInt(e.target.value) || 1)}
                placeholder="1"
                min="1"
                max={loan.termMonths}
                className="mt-2"
              />
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full bg-teal-500 hover:bg-teal-600"
            disabled={extraMonthly === 0 && oneTimeAmount === 0}
          >
            Calculate Impact
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {showResults && (extraMonthly > 0 || oneTimeAmount > 0) && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Interest Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  ${scenario.totalInterestSaved.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total interest reduction
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-teal-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Time Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-teal-600">
                  {yearsSaved > 0 ? `${yearsSaved}y ` : ''}{remainingMonths}mo
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {monthsSaved} months faster payoff
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-gray-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  New Payoff Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">
                  {format(scenario.newPayoffDate, 'MMM yyyy')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  vs {format(new Date(loan.startDate.getTime() + loan.termMonths * 30 * 24 * 60 * 60 * 1000), 'MMM yyyy')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Metric</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Original</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">With Extra Payments</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">Total Interest</td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        ${scenario.originalTotalInterest.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        ${scenario.newTotalInterest.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        -${scenario.totalInterestSaved.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">Loan Term</td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {loan.termMonths} months
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {scenario.schedule.length} months
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        -{monthsSaved} months
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-900">Monthly Payment</td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        ${loan.monthlyPayment.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        ${(loan.monthlyPayment + extraMonthly).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-600">
                        +${extraMonthly.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-medium text-amber-900">💡 Pro Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Even small extra payments can make a big difference over time</li>
                    <li>Apply one-time windfalls (bonus, tax refund) directly to principal</li>
                    <li>Make extra payments early in the loan to maximize savings</li>
                    <li>Contact your lender to ensure extra payments go toward principal</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
