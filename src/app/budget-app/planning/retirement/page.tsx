"use client";

/**
 * Retirement Calculator
 * Plan and project retirement savings with compound interest
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, DollarSign, Calendar, PiggyBank, Upload, Trash2 } from "lucide-react";
import { db } from "@/lib/budget-db";
import { getCurrentCurrency, getCurrentLocale } from "@/lib/locale-storage";
import { LOCALE_METADATA } from "@/i18n/config";
import { formatCurrency as formatCurrencyUtil } from "@/i18n/utils/formatCurrency";
import type { RetirementPlan } from "@/types/budget";
import { ConfirmDialog } from "@/components/budget/ConfirmDialog";

function fmtCurrency(amount: number): string {
  return formatCurrencyUtil(
    amount,
    getCurrentCurrency() || LOCALE_METADATA[getCurrentLocale()].currency,
    getCurrentLocale()
  );
}

function fmtNumber(amount: number, maxDigits: number = 0): string {
  return amount.toLocaleString(getCurrentLocale(), { maximumFractionDigits: maxDigits });
}

export default function RetirementPage() {
  const t = useTranslations("planning.retirement");
  const [plans, setPlans] = useState<RetirementPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<RetirementPlan | null>(null);

  // Form state - Basic
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [currentSavings, setCurrentSavings] = useState("10000");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [expectedReturn, setExpectedReturn] = useState("7.0");
  const [inflationRate, setInflationRate] = useState("2.5");
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState("4000");
  const [lifespanAssumption, setLifespanAssumption] = useState("90");

  // Canadian Government Pensions
  const [includeCPP, setIncludeCPP] = useState(true);
  const [estimatedCPPMonthly, setEstimatedCPPMonthly] = useState("1307"); // 2024 max CPP
  const [includeOAS, setIncludeOAS] = useState(true);
  const [estimatedOASMonthly, setEstimatedOASMonthly] = useState("708"); // 2024 max OAS

  // Investment Accounts
  const [rrspBalance, setRrspBalance] = useState("0");
  const [tfsaBalance, setTfsaBalance] = useState("0");
  const [nonRegisteredBalance, setNonRegisteredBalance] = useState("0");

  // Company Benefits
  const [companyShares, setCompanyShares] = useState("0");
  const [companySharesGrowthRate, setCompanySharesGrowthRate] = useState("10.0");
  const [stockOptions, setStockOptions] = useState("0");
  const [pensionPlan, setPensionPlan] = useState(false);
  const [employerPensionMonthly, setEmployerPensionMonthly] = useState("0");

  // Calculated results
  const [projectedSavings, setProjectedSavings] = useState(0);
  const [yearsToRetirement, setYearsToRetirement] = useState(0);
  const [monthlyIncomeAtRetirement, setMonthlyIncomeAtRetirement] = useState(0);
  const [requiredSavings, setRequiredSavings] = useState(0);
  const [yearlyBreakdown, setYearlyBreakdown] = useState<
    { year: number; age: number; balance: number }[]
  >([]);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    calculateRetirement();
  }, [
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    expectedReturn,
    inflationRate,
    desiredMonthlyIncome,
    lifespanAssumption,
    includeCPP,
    estimatedCPPMonthly,
    includeOAS,
    estimatedOASMonthly,
    rrspBalance,
    tfsaBalance,
    nonRegisteredBalance,
    companyShares,
    companySharesGrowthRate,
    stockOptions,
    pensionPlan,
    employerPensionMonthly,
  ]);

  async function loadPlans() {
    try {
      const data = await db.retirementPlans.toArray();
      setPlans(data);

      // Auto-load the most recent plan into the form
      if (data.length > 0) {
        const mostRecent = data.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        loadPlanIntoForm(mostRecent);
      }
    } catch (error) {
      console.error("Error loading retirement plans:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function loadPlanIntoForm(plan: RetirementPlan) {
    // Basic fields
    setCurrentAge(plan.currentAge.toString());
    setRetirementAge(plan.retirementAge.toString());
    setCurrentSavings(plan.currentSavings.toString());
    setMonthlyContribution(plan.monthlyContribution.toString());
    setExpectedReturn(plan.expectedReturn.toString());
    setInflationRate(plan.inflationRate.toString());
    setDesiredMonthlyIncome(plan.desiredMonthlyIncome.toString());
    setLifespanAssumption(plan.lifespanAssumption.toString());

    // Canadian pensions
    setIncludeCPP(plan.includeCPP ?? true);
    setEstimatedCPPMonthly((plan.estimatedCPPMonthly ?? 1307).toString());
    setIncludeOAS(plan.includeOAS ?? true);
    setEstimatedOASMonthly((plan.estimatedOASMonthly ?? 708).toString());

    // Investment accounts
    setRrspBalance((plan.rrspBalance ?? 0).toString());
    setTfsaBalance((plan.tfsaBalance ?? 0).toString());
    setNonRegisteredBalance((plan.nonRegisteredBalance ?? 0).toString());

    // Company benefits
    setCompanyShares((plan.companyShares ?? 0).toString());
    setCompanySharesGrowthRate((plan.companySharesGrowthRate ?? 10).toString());
    setStockOptions((plan.stockOptions ?? 0).toString());
    setPensionPlan(plan.pensionPlan ?? false);
    setEmployerPensionMonthly((plan.employerPensionMonthly ?? 0).toString());
  }

  function calculateRetirement() {
    const age = parseInt(currentAge);
    const retAge = parseInt(retirementAge);
    const savings = parseFloat(currentSavings);
    const monthly = parseFloat(monthlyContribution);
    const returnRate = parseFloat(expectedReturn) / 100;
    const inflation = parseFloat(inflationRate) / 100;
    const income = parseFloat(desiredMonthlyIncome);
    const lifespan = parseInt(lifespanAssumption);

    if (isNaN(age) || isNaN(retAge) || isNaN(savings) || isNaN(monthly) || isNaN(returnRate)) {
      return;
    }

    const years = retAge - age;
    setYearsToRetirement(years);

    // Calculate future value with monthly contributions
    const monthlyRate = returnRate / 12;
    const months = years * 12;

    // Future value of current savings
    const fvCurrentSavings = savings * Math.pow(1 + monthlyRate, months);

    // Future value of monthly contributions (annuity)
    const fvContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    // Add investment accounts (RRSP, TFSA, Non-registered)
    const rrsp = parseFloat(rrspBalance) || 0;
    const tfsa = parseFloat(tfsaBalance) || 0;
    const nonReg = parseFloat(nonRegisteredBalance) || 0;
    const fvInvestments = (rrsp + tfsa + nonReg) * Math.pow(1 + monthlyRate, months);

    // Add company shares with their own growth rate
    const shares = parseFloat(companyShares) || 0;
    const sharesGrowth = parseFloat(companySharesGrowthRate) / 100 || 0;
    const fvShares = shares * Math.pow(1 + sharesGrowth / 12, months);

    // Add stock options (assume same growth as company shares)
    const options = parseFloat(stockOptions) || 0;
    const fvOptions = options * Math.pow(1 + sharesGrowth / 12, months);

    const totalSavings = fvCurrentSavings + fvContributions + fvInvestments + fvShares + fvOptions;
    setProjectedSavings(totalSavings);

    // Calculate monthly income from government pensions
    const cppIncome = includeCPP ? parseFloat(estimatedCPPMonthly) || 0 : 0;
    const oasIncome = includeOAS ? parseFloat(estimatedOASMonthly) || 0 : 0;
    const employerPension = pensionPlan ? parseFloat(employerPensionMonthly) || 0 : 0;
    const totalPensionIncome = cppIncome + oasIncome + employerPension;

    // Adjust desired income by subtracting pension income (you need less from savings)
    const incomeNeededFromSavings = Math.max(0, income - totalPensionIncome);

    // Calculate required savings for desired income (adjusted for pension income)
    const yearsInRetirement = lifespan - retAge;
    const monthsInRetirement = yearsInRetirement * 12;
    const inflationAdjustedReturn = (1 + returnRate) / (1 + inflation) - 1;
    const monthlyInflationAdjustedReturn = inflationAdjustedReturn / 12;

    // Present value of annuity (how much you need to generate desired income from savings only)
    const required =
      incomeNeededFromSavings *
      ((1 - Math.pow(1 + monthlyInflationAdjustedReturn, -monthsInRetirement)) /
        monthlyInflationAdjustedReturn);
    setRequiredSavings(required);

    // Calculate monthly income you can afford with projected savings + pensions
    const affordableIncomeFromSavings =
      totalSavings *
      (monthlyInflationAdjustedReturn /
        (1 - Math.pow(1 + monthlyInflationAdjustedReturn, -monthsInRetirement)));
    const totalAffordableIncome = affordableIncomeFromSavings + totalPensionIncome;
    setMonthlyIncomeAtRetirement(totalAffordableIncome);

    // Calculate yearly breakdown
    const breakdown: { year: number; age: number; balance: number }[] = [];
    let balance = savings;

    for (let year = 0; year <= years; year++) {
      breakdown.push({
        year: new Date().getFullYear() + year,
        age: age + year,
        balance,
      });

      // Add monthly contributions for the year
      for (let month = 0; month < 12; month++) {
        balance = balance * (1 + monthlyRate) + monthly;
      }
    }

    setYearlyBreakdown(breakdown);
  }

  async function savePlan() {
    try {
      // Use a fixed ID for the user's profile (single plan approach)
      const profileId = "retirement_profile";
      const existingPlans = await db.retirementPlans.toArray();
      const existingProfile = existingPlans.find((p) => p.id === profileId);

      const plan: RetirementPlan = {
        id: profileId,
        name: "My Retirement Plan",
        currentAge: parseInt(currentAge),
        retirementAge: parseInt(retirementAge),
        currentSavings: parseFloat(currentSavings),
        monthlyContribution: parseFloat(monthlyContribution),
        expectedReturn: parseFloat(expectedReturn),
        inflationRate: parseFloat(inflationRate),
        desiredMonthlyIncome: parseFloat(desiredMonthlyIncome),
        lifespanAssumption: parseInt(lifespanAssumption),

        // Canadian pensions
        includeCPP,
        estimatedCPPMonthly: parseFloat(estimatedCPPMonthly),
        includeOAS,
        estimatedOASMonthly: parseFloat(estimatedOASMonthly),

        // Investment accounts
        rrspBalance: parseFloat(rrspBalance),
        tfsaBalance: parseFloat(tfsaBalance),
        nonRegisteredBalance: parseFloat(nonRegisteredBalance),

        // Company benefits
        companyShares: parseFloat(companyShares),
        companySharesGrowthRate: parseFloat(companySharesGrowthRate),
        stockOptions: parseFloat(stockOptions),
        pensionPlan,
        employerPensionMonthly: parseFloat(employerPensionMonthly),

        createdAt: existingProfile?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (existingProfile) {
        await db.retirementPlans.update(profileId, plan);
      } else {
        await db.retirementPlans.add(plan);
      }

      await loadPlans();
      alert(t("planSaved"));
    } catch (error) {
      console.error("Error saving plan:", error);
      alert(t("failedToSavePlan"));
    }
  }

  function initiateDeletePlan(plan: RetirementPlan) {
    setDeletingPlan(plan);
    setDeleteConfirmOpen(true);
  }

  async function confirmDeletePlan() {
    if (!deletingPlan) return;

    try {
      await db.retirementPlans.delete(deletingPlan.id);
      await loadPlans();
      setDeleteConfirmOpen(false);
      setDeletingPlan(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert(t("failedToDeletePlan"));
      // Keep dialog open on error
    }
  }

  const isOnTrack = projectedSavings >= requiredSavings;
  const shortfall = requiredSavings - projectedSavings;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="mt-2 text-slate-400">{t("subtitle")}</p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">{t("yourInformation")}</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("currentAge")}
                </label>
                <input
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(e.target.value)}
                  min="18"
                  max="100"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("retirementAge")}
                </label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(e.target.value)}
                  min="18"
                  max="100"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("currentSavings")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  step="1000"
                  min="0"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("monthlyContribution")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  step="50"
                  min="0"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("expectedReturn")}
                </label>
                <input
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  step="0.1"
                  min="0"
                  max="20"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("inflationRate")}
                </label>
                <input
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(e.target.value)}
                  step="0.1"
                  min="0"
                  max="10"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("desiredMonthlyIncome")}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={desiredMonthlyIncome}
                    onChange={(e) => setDesiredMonthlyIncome(e.target.value)}
                    step="100"
                    min="0"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("lifeExpectancy")}
                </label>
                <input
                  type="number"
                  value={lifespanAssumption}
                  onChange={(e) => setLifespanAssumption(e.target.value)}
                  min="18"
                  max="120"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Canadian Government Pensions */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="mb-4 text-base font-semibold text-gray-900">
                {t("canadianGovernmentPensions")}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeCPP}
                      onChange={(e) => setIncludeCPP(e.target.checked)}
                      className="h-4 w-4 rounded text-teal-600 focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{t("includeCPP")}</span>
                  </label>
                  {includeCPP && (
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={estimatedCPPMonthly}
                          onChange={(e) => setEstimatedCPPMonthly(e.target.value)}
                          step="10"
                          min="0"
                          placeholder={t("monthlyCPP")}
                          inputMode="decimal"
                          className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">{t("maxCPP2024")}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeOAS}
                      onChange={(e) => setIncludeOAS(e.target.checked)}
                      className="h-4 w-4 rounded text-teal-600 focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{t("includeOAS")}</span>
                  </label>
                  {includeOAS && (
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={estimatedOASMonthly}
                          onChange={(e) => setEstimatedOASMonthly(e.target.value)}
                          step="10"
                          min="0"
                          placeholder={t("monthlyOAS")}
                          inputMode="decimal"
                          className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">{t("maxOAS2024")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Investment Accounts */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="mb-4 text-base font-semibold text-gray-900">
                {t("investmentAccounts")}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("rrspBalance")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={rrspBalance}
                      onChange={(e) => setRrspBalance(e.target.value)}
                      step="1000"
                      min="0"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("tfsaBalance")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={tfsaBalance}
                      onChange={(e) => setTfsaBalance(e.target.value)}
                      step="1000"
                      min="0"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("nonRegisteredBalance")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={nonRegisteredBalance}
                      onChange={(e) => setNonRegisteredBalance(e.target.value)}
                      step="1000"
                      min="0"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Benefits */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="mb-4 text-base font-semibold text-gray-900">{t("companyBenefits")}</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("companyShares")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={companyShares}
                        onChange={(e) => setCompanyShares(e.target.value)}
                        step="1000"
                        min="0"
                        inputMode="decimal"
                        className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t("growthRate")}
                    </label>
                    <input
                      type="number"
                      value={companySharesGrowthRate}
                      onChange={(e) => setCompanySharesGrowthRate(e.target.value)}
                      step="0.1"
                      min="0"
                      max="100"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("stockOptionsVested")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={stockOptions}
                      onChange={(e) => setStockOptions(e.target.value)}
                      step="1000"
                      min="0"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pensionPlan}
                      onChange={(e) => setPensionPlan(e.target.checked)}
                      className="h-4 w-4 rounded text-teal-600 focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t("employerPensionPlan")}
                    </span>
                  </label>
                  {pensionPlan && (
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={employerPensionMonthly}
                          onChange={(e) => setEmployerPensionMonthly(e.target.value)}
                          step="10"
                          min="0"
                          placeholder={t("monthlyPension")}
                          inputMode="decimal"
                          className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={savePlan}
              className="mt-6 w-full rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
            >
              {t("saveThisPlan")}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white p-4 shadow">
              <div className="mb-2 flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <p className="text-xs">{t("yearsToRetirement")}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{yearsToRetirement}</p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <div className="mb-2 flex items-center gap-2 text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <p className="text-xs">{t("projectedSavings")}</p>
              </div>
              <p className="text-2xl font-bold text-teal-600">{fmtCurrency(projectedSavings)}</p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <div className="mb-2 flex items-center gap-2 text-gray-600">
                <PiggyBank className="h-4 w-4" />
                <p className="text-xs">{t("requiredSavings")}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{fmtCurrency(requiredSavings)}</p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow">
              <div className="mb-2 flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <p className="text-xs">{t("monthlyIncome")}</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {fmtCurrency(monthlyIncomeAtRetirement)}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className={`rounded-lg p-6 shadow ${isOnTrack ? "bg-green-50" : "bg-yellow-50"}`}>
            <h3
              className={`mb-2 text-lg font-semibold ${isOnTrack ? "text-green-900" : "text-yellow-900"}`}
            >
              {isOnTrack ? t("onTrack") : t("adjustmentNeeded")}
            </h3>
            <p className={`mb-4 text-sm ${isOnTrack ? "text-green-700" : "text-yellow-700"}`}>
              {isOnTrack
                ? t("onTrackDescription", { amount: fmtCurrency(projectedSavings) })
                : t("shortfallDescription", { amount: fmtCurrency(Math.abs(shortfall)) })}
            </p>

            {!isOnTrack && (
              <div className="space-y-2 text-sm">
                <p className={`font-medium ${isOnTrack ? "text-green-900" : "text-yellow-900"}`}>
                  {t("toReachGoal")}
                </p>
                <ul
                  className={`list-inside list-disc space-y-2 ${isOnTrack ? "text-green-700" : "text-yellow-700"}`}
                >
                  <li>
                    {t("increaseContribution", {
                      amount: fmtCurrency(shortfall / (yearsToRetirement * 12)),
                    })}
                  </li>
                  <li>
                    {t("workMoreYears", {
                      years: Math.ceil(shortfall / (parseFloat(monthlyContribution) * 12)),
                    })}
                  </li>
                  <li>{t("reduceIncome", { amount: fmtCurrency(monthlyIncomeAtRetirement) })}</li>
                </ul>
              </div>
            )}
          </div>

          {/* Growth Chart Preview */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{t("savingsGrowth")}</h3>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {yearlyBreakdown
                .filter((_, i) => i % 5 === 0 || i === yearlyBreakdown.length - 1)
                .map((item) => (
                  <div key={item.year} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {t("yearAge", { year: item.year, age: item.age })}
                    </span>
                    <span className="font-semibold text-gray-900">{fmtCurrency(item.balance)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Plans */}
      {plans.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">{t("savedPlans")}</h2>
          <div className="space-y-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-600">
                    {t("planSummary", {
                      currentAge: plan.currentAge,
                      retirementAge: plan.retirementAge,
                      monthlyContribution: fmtCurrency(plan.monthlyContribution),
                      expectedReturn: plan.expectedReturn,
                    })}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {t("lastUpdated", {
                      date: new Date(plan.updatedAt).toLocaleDateString(getCurrentLocale()),
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadPlanIntoForm(plan)}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                    title={t("loadThisPlan")}
                  >
                    <Upload className="h-4 w-4" />
                    {t("load")}
                  </button>
                  <button
                    onClick={() => initiateDeletePlan(plan)}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                    title={t("deleteThisPlan")}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDeletePlan}
        title={t("deleteRetirementPlan")}
        description={t("deleteRetirementPlanDescription")}
        impact={
          deletingPlan
            ? {
                title: t("youWillLose"),
                items: [
                  t("planName", { name: deletingPlan.name }),
                  t("currentAgeYears", { age: deletingPlan.currentAge }),
                  t("retirementAgeYears", { age: deletingPlan.retirementAge }),
                  t("monthlyContributionAmount", {
                    amount: fmtCurrency(deletingPlan.monthlyContribution),
                  }),
                  t("currentSavingsAmount", { amount: fmtCurrency(deletingPlan.currentSavings) }),
                  t("allGrowthProjections"),
                ],
              }
            : undefined
        }
        confirmLabel={t("deletePlan")}
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </div>
  );
}
