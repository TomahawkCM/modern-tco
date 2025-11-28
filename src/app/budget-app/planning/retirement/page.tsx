'use client';

/**
 * Retirement Calculator
 * Plan and project retirement savings with compound interest
 */

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, PiggyBank, Upload, Trash2 } from 'lucide-react';
import { db } from '@/lib/budget-db';
import type { RetirementPlan } from '@/types/budget';
import { ConfirmDialog } from '@/components/budget/ConfirmDialog';

export default function RetirementPage() {
  const [plans, setPlans] = useState<RetirementPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<RetirementPlan | null>(null);

  // Form state - Basic
  const [currentAge, setCurrentAge] = useState('30');
  const [retirementAge, setRetirementAge] = useState('65');
  const [currentSavings, setCurrentSavings] = useState('10000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [expectedReturn, setExpectedReturn] = useState('7.0');
  const [inflationRate, setInflationRate] = useState('2.5');
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState('4000');
  const [lifespanAssumption, setLifespanAssumption] = useState('90');

  // Canadian Government Pensions
  const [includeCPP, setIncludeCPP] = useState(true);
  const [estimatedCPPMonthly, setEstimatedCPPMonthly] = useState('1307'); // 2024 max CPP
  const [includeOAS, setIncludeOAS] = useState(true);
  const [estimatedOASMonthly, setEstimatedOASMonthly] = useState('708'); // 2024 max OAS

  // Investment Accounts
  const [rrspBalance, setRrspBalance] = useState('0');
  const [tfsaBalance, setTfsaBalance] = useState('0');
  const [nonRegisteredBalance, setNonRegisteredBalance] = useState('0');

  // Company Benefits
  const [companyShares, setCompanyShares] = useState('0');
  const [companySharesGrowthRate, setCompanySharesGrowthRate] = useState('10.0');
  const [stockOptions, setStockOptions] = useState('0');
  const [pensionPlan, setPensionPlan] = useState(false);
  const [employerPensionMonthly, setEmployerPensionMonthly] = useState('0');

  // Calculated results
  const [projectedSavings, setProjectedSavings] = useState(0);
  const [yearsToRetirement, setYearsToRetirement] = useState(0);
  const [monthlyIncomeAtRetirement, setMonthlyIncomeAtRetirement] = useState(0);
  const [requiredSavings, setRequiredSavings] = useState(0);
  const [yearlyBreakdown, setYearlyBreakdown] = useState<{ year: number; age: number; balance: number }[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    calculateRetirement();
  }, [
    currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn, inflationRate, desiredMonthlyIncome, lifespanAssumption,
    includeCPP, estimatedCPPMonthly, includeOAS, estimatedOASMonthly,
    rrspBalance, tfsaBalance, nonRegisteredBalance,
    companyShares, companySharesGrowthRate, stockOptions, pensionPlan, employerPensionMonthly
  ]);

  async function loadPlans() {
    try {
      const data = await db.retirementPlans.toArray();
      setPlans(data);

      // Auto-load the most recent plan into the form
      if (data.length > 0) {
        const mostRecent = data.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        loadPlanIntoForm(mostRecent);
      }
    } catch (error) {
      console.error('Error loading retirement plans:', error);
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
    const cppIncome = includeCPP ? (parseFloat(estimatedCPPMonthly) || 0) : 0;
    const oasIncome = includeOAS ? (parseFloat(estimatedOASMonthly) || 0) : 0;
    const employerPension = pensionPlan ? (parseFloat(employerPensionMonthly) || 0) : 0;
    const totalPensionIncome = cppIncome + oasIncome + employerPension;

    // Adjust desired income by subtracting pension income (you need less from savings)
    const incomeNeededFromSavings = Math.max(0, income - totalPensionIncome);

    // Calculate required savings for desired income (adjusted for pension income)
    const yearsInRetirement = lifespan - retAge;
    const monthsInRetirement = yearsInRetirement * 12;
    const inflationAdjustedReturn = (1 + returnRate) / (1 + inflation) - 1;
    const monthlyInflationAdjustedReturn = inflationAdjustedReturn / 12;

    // Present value of annuity (how much you need to generate desired income from savings only)
    const required = incomeNeededFromSavings * ((1 - Math.pow(1 + monthlyInflationAdjustedReturn, -monthsInRetirement)) / monthlyInflationAdjustedReturn);
    setRequiredSavings(required);

    // Calculate monthly income you can afford with projected savings + pensions
    const affordableIncomeFromSavings = totalSavings * (monthlyInflationAdjustedReturn / (1 - Math.pow(1 + monthlyInflationAdjustedReturn, -monthsInRetirement)));
    const totalAffordableIncome = affordableIncomeFromSavings + totalPensionIncome;
    setMonthlyIncomeAtRetirement(totalAffordableIncome);

    // Calculate yearly breakdown
    const breakdown: { year: number; age: number; balance: number }[] = [];
    let balance = savings;

    for (let year = 0; year <= years; year++) {
      breakdown.push({
        year: new Date().getFullYear() + year,
        age: age + year,
        balance: balance,
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
      const profileId = 'retirement_profile';
      const existingPlans = await db.retirementPlans.toArray();
      const existingProfile = existingPlans.find(p => p.id === profileId);

      const plan: RetirementPlan = {
        id: profileId,
        name: 'My Retirement Plan',
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
      alert('Retirement plan saved!');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
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
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
      // Keep dialog open on error
    }
  }

  const isOnTrack = projectedSavings >= requiredSavings;
  const shortfall = requiredSavings - projectedSavings;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calculator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Retirement Calculator</h1>
        <p className="text-slate-400 mt-2">Plan your retirement with compound interest projections</p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Information</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Age
                </label>
                <input
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(e.target.value)}
                  min="18"
                  max="100"
                  inputMode="numeric"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retirement Age
                </label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(e.target.value)}
                  min="18"
                  max="100"
                  inputMode="numeric"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Savings
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
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Contribution
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
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Return (%)
                </label>
                <input
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  step="0.1"
                  min="0"
                  max="20"
                  inputMode="decimal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inflation Rate (%)
                </label>
                <input
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(e.target.value)}
                  step="0.1"
                  min="0"
                  max="10"
                  inputMode="decimal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Monthly Income
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
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Life Expectancy
                </label>
                <input
                  type="number"
                  value={lifespanAssumption}
                  onChange={(e) => setLifespanAssumption(e.target.value)}
                  min="18"
                  max="120"
                  inputMode="numeric"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Canadian Government Pensions */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Canadian Government Pensions</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeCPP}
                      onChange={(e) => setIncludeCPP(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Include CPP</span>
                  </label>
                  {includeCPP && (
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          value={estimatedCPPMonthly}
                          onChange={(e) => setEstimatedCPPMonthly(e.target.value)}
                          step="10"
                          min="0"
                          placeholder="Monthly CPP"
                          inputMode="decimal"
                          className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Max CPP 2024: $1,307/mo</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeOAS}
                      onChange={(e) => setIncludeOAS(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Include OAS</span>
                  </label>
                  {includeOAS && (
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          value={estimatedOASMonthly}
                          onChange={(e) => setEstimatedOASMonthly(e.target.value)}
                          step="10"
                          min="0"
                          placeholder="Monthly OAS"
                          inputMode="decimal"
                          className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Max OAS 2024: $708/mo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Investment Accounts */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Investment Accounts</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RRSP Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={rrspBalance}
                      onChange={(e) => setRrspBalance(e.target.value)}
                      step="1000"
                      min="0"
                      inputMode="decimal"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TFSA Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={tfsaBalance}
                      onChange={(e) => setTfsaBalance(e.target.value)}
                      step="1000"
                      min="0"
                      inputMode="decimal"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Non-Registered Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={nonRegisteredBalance}
                      onChange={(e) => setNonRegisteredBalance(e.target.value)}
                      step="1000"
                      min="0"
                      inputMode="decimal"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Benefits */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Company Benefits</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Shares
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={companyShares}
                        onChange={(e) => setCompanyShares(e.target.value)}
                        step="1000"
                        min="0"
                        inputMode="decimal"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Growth Rate (%)
                    </label>
                    <input
                      type="number"
                      value={companySharesGrowthRate}
                      onChange={(e) => setCompanySharesGrowthRate(e.target.value)}
                      step="0.1"
                      min="0"
                      max="100"
                      inputMode="decimal"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Options (Vested)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={stockOptions}
                      onChange={(e) => setStockOptions(e.target.value)}
                      step="1000"
                      min="0"
                      inputMode="decimal"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pensionPlan}
                      onChange={(e) => setPensionPlan(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Employer Pension Plan</span>
                  </label>
                  {pensionPlan && (
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          value={employerPensionMonthly}
                          onChange={(e) => setEmployerPensionMonthly(e.target.value)}
                          step="10"
                          min="0"
                          placeholder="Monthly pension"
                          inputMode="decimal"
                          className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={savePlan}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors mt-6"
            >
              Save This Plan
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <p className="text-xs">Years to Retirement</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{yearsToRetirement}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <TrendingUp className="w-4 h-4" />
                <p className="text-xs">Projected Savings</p>
              </div>
              <p className="text-2xl font-bold text-teal-600">
                ${projectedSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <PiggyBank className="w-4 h-4" />
                <p className="text-xs">Required Savings</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${requiredSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <DollarSign className="w-4 h-4" />
                <p className="text-xs">Monthly Income</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${monthlyIncomeAtRetirement.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className={`rounded-lg shadow p-6 ${isOnTrack ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isOnTrack ? 'text-green-900' : 'text-yellow-900'}`}>
              {isOnTrack ? '✓ You\'re on track!' : '⚠ Adjustment needed'}
            </h3>
            <p className={`text-sm mb-4 ${isOnTrack ? 'text-green-700' : 'text-yellow-700'}`}>
              {isOnTrack
                ? `Your projected savings of $${projectedSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })} exceeds your required savings.`
                : `You're projected to be short by $${Math.abs(shortfall).toLocaleString('en-US', { maximumFractionDigits: 0 })}.`
              }
            </p>

            {!isOnTrack && (
              <div className="text-sm space-y-2">
                <p className={`font-medium ${isOnTrack ? 'text-green-900' : 'text-yellow-900'}`}>To reach your goal, you could:</p>
                <ul className={`list-disc list-inside space-y-2 ${isOnTrack ? 'text-green-700' : 'text-yellow-700'}`}>
                  <li>Increase monthly contribution by ${(shortfall / (yearsToRetirement * 12)).toFixed(0)}</li>
                  <li>Work {Math.ceil(shortfall / (parseFloat(monthlyContribution) * 12))} more years</li>
                  <li>Reduce desired monthly income to ${monthlyIncomeAtRetirement.toFixed(0)}</li>
                </ul>
              </div>
            )}
          </div>

          {/* Growth Chart Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Growth</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {yearlyBreakdown.filter((_, i) => i % 5 === 0 || i === yearlyBreakdown.length - 1).map((item) => (
                <div key={item.year} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {item.year} (Age {item.age})
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${item.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Plans */}
      {plans.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Plans</h2>
          <div className="space-y-2">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-600">
                    Age {plan.currentAge} → {plan.retirementAge} | ${plan.monthlyContribution}/mo | {plan.expectedReturn}% return
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadPlanIntoForm(plan)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Load this plan"
                  >
                    <Upload className="w-4 h-4" />
                    Load
                  </button>
                  <button
                    onClick={() => initiateDeletePlan(plan)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete this plan"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
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
        title="Delete Retirement Plan"
        description="This will permanently remove this retirement plan and all its projections."
        impact={deletingPlan ? {
          title: "You will lose:",
          items: [
            `Plan: ${deletingPlan.name}`,
            `Current age: ${deletingPlan.currentAge} years`,
            `Retirement age: ${deletingPlan.retirementAge} years`,
            `Monthly contribution: $${deletingPlan.monthlyContribution.toFixed(2)}`,
            `Current savings: $${deletingPlan.currentSavings.toFixed(2)}`,
            'All growth projections and calculations',
          ]
        } : undefined}
        confirmLabel="Delete Plan"
        variant="destructive"
        icon={<Trash2 className="w-5 h-5" />}
      />
    </div>
  );
}
