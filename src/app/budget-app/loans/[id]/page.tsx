/**
 * Loan Detail Page
 * View individual loan with full amortization schedule
 */

"use client";

import { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, DollarSign, Calendar, Percent, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Loan } from "@/types/budget";
import { getLoan, deleteLoan, getLoanPayments } from "@/lib/loans/loan-db";
import { generateAmortizationSchedule, analyzeLoanCost } from "@/lib/loans/calculations";
import { ExtraPaymentCalculator } from "@/components/budget/loans/ExtraPaymentCalculator";
import { LazyAmortizationChart } from "@/components/budget/charts/LazyChartComponents";
import { PaymentHistory } from "@/components/budget/loans/PaymentHistory";
import { format } from "date-fns";
import { HelpTooltip } from "@/components/budget/HelpTooltip";

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("loans");
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
      console.error("Error loading loan:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!loan) return;

    try {
      await deleteLoan(loan.id);
      router.push("/budget-app/loans");
    } catch (error) {
      console.error("Error deleting loan:", error);
      alert(t("deleteError"));
    }
  }

  function getLoanTypeLabel(type: string): string {
    return t(`loanType.${type}`);
  }

  function calculateProgress(loan: Loan): number {
    return ((loan.originalPrincipal - loan.currentBalance) / loan.originalPrincipal) * 100;
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-teal-500"></div>
          <p className="text-slate-400">{t("loadingLoan")}</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 text-2xl font-bold text-white">{t("loanNotFound")}</h2>
        <p className="mb-6 text-slate-400">{t("loanNotFoundDescription")}</p>
        <Link href="/budget-app/loans">
          <Button>{t("backToLoans")}</Button>
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
    loan.monthlyPayment + (loan.propertyTax || 0) + (loan.homeInsurance || 0) + (loan.pmi || 0);

  return (
    <div className="space-y-6">
      {/* Header - Enhanced */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link href="/budget-app/loans">
            <Button variant="outline" size="icon" className="min-h-[48px] min-w-[48px]">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{loan.name}</h1>
            <p className="mt-1 text-base font-medium text-slate-400 sm:text-lg">
              {getLoanTypeLabel(loan.type)} • {loan.lender}
            </p>
          </div>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Link href={`/budget-app/loans/${loan.id}/edit`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="min-h-[48px] w-full px-4 sm:w-auto">
              <Edit className="mr-2 h-5 w-5" />
              <span className="text-base font-semibold">{t("edit")}</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="min-h-[48px] flex-1 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 sm:flex-none"
          >
            <Trash2 className="mr-2 h-5 w-5" />
            <span className="text-base font-semibold">{t("delete")}</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards - Enhanced for Seniors */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-300">
              {t("currentBalance")}
            </CardTitle>
            <DollarSign className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ${loan.currentBalance.toLocaleString()}
            </div>
            <div className="mt-3 h-4 w-full rounded-full bg-slate-700 shadow-inner">
              <div
                className="h-4 rounded-full bg-teal-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-teal-500">
              {t("percentPaidOff", { percent: progress.toFixed(1) })}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {t("youvePaid", {
                amount: (loan.originalPrincipal - loan.currentBalance).toLocaleString(),
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-slate-300">
                {t("monthlyPayment")}
              </CardTitle>
              <HelpTooltip
                content={
                  <>
                    <strong>{t("tooltip.principalVsInterestTitle")}:</strong>{" "}
                    {t("tooltip.principalVsInterestBody")}
                  </>
                }
                learnMoreUrl="/docs/user-guide#principal-vs-interest"
                ariaLabel={t("tooltip.principalVsInterestAria")}
              />
            </div>
            <TrendingDown className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ${loan.monthlyPayment.toLocaleString()}
            </div>
            {totalMonthlyPayment > loan.monthlyPayment && (
              <p className="mt-2 text-sm font-medium text-slate-400">
                {t("totalWithEscrow", { amount: totalMonthlyPayment.toLocaleString() })}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-400">{t("principalAndInterestOnly")}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-slate-300">
                {t("interestRate")}
              </CardTitle>
              <HelpTooltip
                content={t("tooltip.aprExplained")}
                learnMoreUrl="/docs/user-guide#apr-explained"
                ariaLabel={t("tooltip.aprAria")}
              />
            </div>
            <Percent className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{loan.interestRate.toFixed(2)}%</div>
            <p className="mt-2 text-sm font-medium text-slate-400">{t("annualPercentageRate")}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-300">
              {t("nextPayment")}
            </CardTitle>
            <Calendar className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {format(loan.nextPaymentDate, "MMM d")}
            </div>
            <p className="mt-2 text-sm font-medium text-slate-400">
              {format(loan.nextPaymentDate, "yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="schedule">{t("tabs.amortizationSchedule")}</TabsTrigger>
          <TabsTrigger value="charts">{t("tabs.charts")}</TabsTrigger>
          <TabsTrigger value="calculator">{t("tabs.extraPaymentCalculator")}</TabsTrigger>
          <TabsTrigger value="payments">{t("tabs.paymentHistory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Loan Details - Enhanced */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">{t("loanDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-base font-medium text-slate-400">
                    {t("originalPrincipal")}
                  </p>
                  <p className="text-xl font-bold text-white">
                    ${loan.originalPrincipal.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{t("amountYouBorrowed")}</p>
                </div>
                <div>
                  <p className="mb-1 text-base font-medium text-slate-400">{t("loanTerm")}</p>
                  <p className="text-xl font-bold text-white">
                    {t("yearsCount", { years: (loan.termMonths / 12).toFixed(0) })}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {t("monthlyPaymentsCount", { count: loan.termMonths })}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-base font-medium text-slate-400">{t("startDate")}</p>
                  <p className="text-xl font-bold text-white">
                    {format(loan.startDate, "MMM d, yyyy")}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{t("firstPaymentDate")}</p>
                </div>
                <div>
                  <p className="mb-1 text-base font-medium text-slate-400">{t("statusLabel")}</p>
                  <p className="text-xl font-bold capitalize text-white">{loan.status}</p>
                </div>

                {/* Type-specific fields */}
                {loan.type === "auto" && loan.vehicleMake && (
                  <>
                    <div className="md:col-span-2">
                      <p className="mb-1 text-base font-medium text-slate-400">{t("vehicle")}</p>
                      <p className="text-xl font-bold text-white">
                        {loan.vehicleYear} {loan.vehicleMake} {loan.vehicleModel}
                      </p>
                    </div>
                  </>
                )}

                {loan.notes && (
                  <div className="border-t border-slate-700 pt-4 md:col-span-2">
                    <p className="mb-2 text-base font-medium text-slate-400">{t("notes")}</p>
                    <p className="text-base text-slate-300">{loan.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cost Analysis - Enhanced with Plain Language */}
          <Card className="border-l-4 border-teal-500 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{t("costAnalysis")}</CardTitle>
                <HelpTooltip
                  content={
                    <>
                      <strong>{t("tooltip.amortizationTitle")}:</strong>{" "}
                      {t("tooltip.amortizationBody")}
                    </>
                  }
                  learnMoreUrl="/docs/user-guide#amortization"
                  ariaLabel={t("tooltip.amortizationAria")}
                  iconSize="h-5 w-5"
                />
              </div>
              <CardDescription className="text-base">
                {t("costAnalysisDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-slate-900/50 p-4">
                  <p className="mb-2 text-base font-semibold text-slate-300">
                    {t("totalYoullPay")}
                  </p>
                  <p className="text-3xl font-bold text-white">
                    ${analysis.totalPayments.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {t("overYears", { years: (loan.termMonths / 12).toFixed(0) })}
                  </p>
                </div>
                <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4">
                  <p className="mb-2 text-base font-semibold text-slate-300">
                    {t("totalInterest")}
                  </p>
                  <p className="text-3xl font-bold text-red-500">
                    ${analysis.totalInterest.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{t("extraCostAbovePrincipal")}</p>
                </div>
                <div className="rounded-lg border border-teal-500/30 bg-teal-900/20 p-4">
                  <p className="mb-2 text-base font-semibold text-slate-300">{t("payoffDate")}</p>
                  <p className="text-3xl font-bold text-teal-500">
                    {format(analysis.payoffDate, "MMM yyyy")}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{t("finalPaymentMonth")}</p>
                </div>
              </div>

              {/* Plain Language Explanation */}
              <div className="rounded border-l-4 border-teal-500 bg-slate-900/50 p-4">
                <p className="text-base text-slate-300">
                  <span className="font-semibold">{t("whatThisMeans")}:</span>{" "}
                  {t("costExplanation", {
                    borrowed: loan.originalPrincipal.toLocaleString(),
                    totalPay: analysis.totalPayments.toLocaleString(),
                    interestAmount: analysis.totalInterest.toLocaleString(),
                    rate: loan.interestRate.toFixed(2),
                    years: (loan.termMonths / 12).toFixed(0),
                  })}
                </p>
              </div>

              {loan.type === "mortgage" && (loan.propertyTax || loan.homeInsurance || loan.pmi) && (
                <div className="mt-6 border-t-2 border-gray-200 pt-6">
                  <p className="mb-4 text-lg font-semibold text-gray-900">
                    {t("monthlyEscrowBreakdown")}
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {loan.propertyTax && (
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 text-sm font-medium text-gray-600">{t("propertyTax")}</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${loan.propertyTax.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{t("perMonth")}</p>
                      </div>
                    )}
                    {loan.homeInsurance && (
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 text-sm font-medium text-gray-600">
                          {t("homeInsurance")}
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          ${loan.homeInsurance.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{t("perMonth")}</p>
                      </div>
                    )}
                    {loan.pmi && (
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 text-sm font-medium text-gray-600">{t("pmi")}</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${loan.pmi.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{t("perMonth")}</p>
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
                <CardTitle className="text-2xl">{t("amortizationSchedule")}</CardTitle>
                <HelpTooltip
                  content={
                    <>
                      <strong>{t("tooltip.extraPaymentsTitle")}:</strong>{" "}
                      {t("tooltip.extraPaymentsBody")}
                    </>
                  }
                  learnMoreUrl="/docs/user-guide#extra-payments"
                  ariaLabel={t("tooltip.extraPaymentsAria")}
                  iconSize="h-5 w-5"
                />
              </div>
              <CardDescription className="text-base">
                {t("amortizationDescription")}
              </CardDescription>
              <div className="mt-3 rounded border-l-4 border-teal-400 bg-gray-50 p-3">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">{t("tip")}:</span> {t("amortizationTip")}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-100">
                      <th className="px-3 py-4 text-left font-bold text-gray-900">
                        {t("table.month")}
                      </th>
                      <th className="px-3 py-4 text-left font-bold text-gray-900">
                        {t("table.date")}
                      </th>
                      <th className="px-3 py-4 text-right font-bold text-gray-900">
                        {t("table.payment")}
                      </th>
                      <th className="px-3 py-4 text-right font-bold text-teal-700">
                        {t("table.principal")}
                      </th>
                      <th className="px-3 py-4 text-right font-bold text-red-700">
                        {t("table.interest")}
                      </th>
                      <th className="px-3 py-4 text-right font-bold text-gray-900">
                        {t("table.remaining")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.slice(0, 120).map((entry, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-3 py-4 font-semibold text-gray-900">{entry.month}</td>
                        <td className="px-3 py-4 text-gray-700">
                          {format(entry.date, "MMM yyyy")}
                        </td>
                        <td className="px-3 py-4 text-right font-semibold text-gray-900">
                          ${entry.payment.toLocaleString()}
                        </td>
                        <td className="px-3 py-4 text-right font-semibold text-teal-600">
                          ${entry.principal.toLocaleString()}
                        </td>
                        <td className="px-3 py-4 text-right font-semibold text-red-600">
                          ${entry.interest.toLocaleString()}
                        </td>
                        <td className="px-3 py-4 text-right font-bold text-gray-900">
                          ${entry.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {schedule.length > 120 && (
                  <div className="mt-4 rounded-lg bg-gray-50 py-4 text-center text-base font-medium text-gray-600">
                    {t("showingPayments", { shown: 120, total: schedule.length })}
                    <span className="ml-1 text-teal-600">{t("scrollToSeeMore")}</span>
                  </div>
                )}
              </div>

              {/* Legend for mobile users */}
              <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-700">{t("colorKey")}:</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-teal-600"></div>
                    <span className="text-gray-700">
                      <span className="font-semibold">{t("table.principal")}:</span>{" "}
                      {t("paysDownYourLoan")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-red-600"></div>
                    <span className="text-gray-700">
                      <span className="font-semibold">{t("table.interest")}:</span>{" "}
                      {t("costOfBorrowing")}
                    </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="mx-4 w-full max-w-md">
            <CardHeader>
              <CardTitle>{t("deleteLoanConfirmTitle")}</CardTitle>
              <CardDescription>
                {t("deleteLoanConfirmDescription", { name: loan.name })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  {t("cancel")}
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  {t("deleteLoan")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
