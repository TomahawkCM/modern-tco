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
      {/* Input Section - Enhanced */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Extra Payment Calculator</CardTitle>
          <CardDescription className="text-base">
            See how extra payments can save you money and time
          </CardDescription>
          <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">How it works:</span> Paying extra reduces your loan balance faster,
              which means less interest over time. Try different amounts to see your potential savings!
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Extra Monthly Payment */}
          <div>
            <Label htmlFor="extraMonthly" className="text-base font-semibold text-gray-700">
              Extra Monthly Payment (Optional)
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="extraMonthly"
                  type="number"
                  value={extraMonthly || ''}
                  onChange={e => setExtraMonthly(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="50"
                  className="pl-10 min-h-[48px] text-base"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Additional amount to pay each month on top of your regular payment
            </p>
          </div>

          {/* One-Time Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="oneTimeAmount" className="text-base font-semibold text-gray-700">
                One-Time Extra Payment (Optional)
              </Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="oneTimeAmount"
                  type="number"
                  value={oneTimeAmount || ''}
                  onChange={e => setOneTimeAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="100"
                  className="pl-10 min-h-[48px] text-base"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">Bonus, tax refund, etc.</p>
            </div>

            <div>
              <Label htmlFor="oneTimeMonth" className="text-base font-semibold text-gray-700">
                Apply in Which Month?
              </Label>
              <Input
                id="oneTimeMonth"
                type="number"
                value={oneTimeMonth}
                onChange={e => setOneTimeMonth(parseInt(e.target.value) || 1)}
                placeholder="1"
                min="1"
                max={loan.termMonths}
                className="mt-2 min-h-[48px] text-base"
              />
              <p className="text-xs text-gray-600 mt-1">Month 1 = first payment</p>
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full min-h-[48px] bg-teal-500 hover:bg-teal-600 text-base font-semibold shadow-md hover:shadow-lg"
            disabled={extraMonthly === 0 && oneTimeAmount === 0}
          >
            Calculate Impact
          </Button>
        </CardContent>
      </Card>

      {/* Results Section - Enhanced */}
      {showResults && (extraMonthly > 0 || oneTimeAmount > 0) && (
        <div className="space-y-6">
          {/* Plain Language Summary */}
          <Card className="bg-green-50 border-l-4 border-green-500 shadow-md">
            <CardContent className="p-5">
              <p className="text-lg font-bold text-green-900 mb-2">
                💰 Great news! By paying ${extraMonthly > 0 ? `$${extraMonthly.toLocaleString()} extra each month` : ''}
                {extraMonthly > 0 && oneTimeAmount > 0 ? ' plus ' : ''}
                {oneTimeAmount > 0 ? `a one-time $${oneTimeAmount.toLocaleString()} payment` : ''}:
              </p>
              <p className="text-base text-gray-800">
                You'll save <span className="font-bold text-green-600">${scenario.totalInterestSaved.toLocaleString()}</span> in interest
                and pay off your loan <span className="font-bold text-teal-600">{yearsSaved > 0 ? `${yearsSaved} years ` : ''}{remainingMonths} months</span> early!
                Your loan will be paid off in <span className="font-bold">{format(scenario.newPayoffDate, 'MMMM yyyy')}</span> instead of {format(new Date(loan.startDate.getTime() + loan.termMonths * 30 * 24 * 60 * 60 * 1000), 'MMMM yyyy')}.
              </p>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Interest Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  ${scenario.totalInterestSaved.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-gray-600 mt-2">
                  Total interest reduction
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-teal-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-teal-600" />
                  Time Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-teal-600">
                  {yearsSaved > 0 ? `${yearsSaved}y ` : ''}{remainingMonths}mo
                </p>
                <p className="text-sm font-medium text-gray-600 mt-2">
                  {monthsSaved} months faster payoff
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-teal-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-teal-600" />
                  New Payoff Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  {format(scenario.newPayoffDate, 'MMM yyyy')}
                </p>
                <p className="text-sm font-medium text-gray-600 mt-2">
                  vs {format(new Date(loan.startDate.getTime() + loan.termMonths * 30 * 24 * 60 * 60 * 1000), 'MMM yyyy')} originally
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table - Enhanced */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Side-by-Side Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-100">
                      <th className="text-left py-4 px-3 font-bold text-gray-900">Metric</th>
                      <th className="text-right py-4 px-3 font-bold text-gray-900">Original Plan</th>
                      <th className="text-right py-4 px-3 font-bold text-green-700">With Extra Payments</th>
                      <th className="text-right py-4 px-3 font-bold text-gray-900">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-3 font-semibold text-gray-900">Total Interest</td>
                      <td className="py-4 px-3 text-right font-semibold text-gray-900">
                        ${scenario.originalTotalInterest.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-right font-semibold text-gray-900">
                        ${scenario.newTotalInterest.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-right font-bold text-green-600 text-lg">
                        -${scenario.totalInterestSaved.toLocaleString()} ✓
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-3 font-semibold text-gray-900">Loan Term</td>
                      <td className="py-4 px-3 text-right font-semibold text-gray-900">
                        {loan.termMonths} months
                      </td>
                      <td className="py-4 px-3 text-right font-semibold text-gray-900">
                        {scenario.schedule.length} months
                      </td>
                      <td className="py-4 px-3 text-right font-bold text-green-600 text-lg">
                        -{monthsSaved} months ✓
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-3 font-semibold text-gray-900">Monthly Payment</td>
                      <td className="py-4 px-3 text-right font-semibold text-gray-900">
                        ${loan.monthlyPayment.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-right font-semibold text-gray-900">
                        ${(loan.monthlyPayment + extraMonthly).toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-right font-semibold text-gray-600">
                        +${extraMonthly.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Tips - Enhanced */}
          <Card className="bg-amber-50 border-l-4 border-amber-400 shadow-md">
            <CardContent className="p-5">
              <div className="flex gap-4">
                <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div className="space-y-3">
                  <p className="text-lg font-bold text-amber-900">💡 Pro Tips for Maximum Savings:</p>
                  <ul className="list-disc list-inside space-y-2 text-base text-gray-800">
                    <li className="font-medium">Even small extra payments ($50-100/month) can save thousands over time</li>
                    <li className="font-medium">Apply windfalls (tax refunds, bonuses) directly to your principal</li>
                    <li className="font-medium">Extra payments early in the loan term save the most interest</li>
                    <li className="font-medium">Contact your lender to confirm extra payments go toward principal, not future payments</li>
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
