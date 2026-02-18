"use client";

/**
 * Paycheck Planning Page
 *
 * Allocate each paycheck to budget categories before payday.
 * Supports weekly, biweekly, semimonthly, monthly, and irregular schedules.
 * Generates the next 6 paychecks and lets users allocate amounts per category.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  PiggyBank,
  Plus,
  Settings,
  Trash2,
  Wallet,
} from "lucide-react";
import { db } from "@/lib/budget-db";
import type {
  PaycheckPlan,
  Paycheck,
  PaycheckAllocation,
  PaycheckSchedule,
  Category,
  Budget,
} from "@/types/budget";
import {
  generatePaycheckDates,
  getActivePaycheck,
  getAllocatedTotal,
  getUnallocatedAmount,
} from "@/lib/budget/paycheck-planner";
import { HelpTooltip } from "@/components/budget/HelpTooltip";
import { ConfirmDialog } from "@/components/budget/ConfirmDialog";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAYCHECK_COUNT = 6;

const SCHEDULE_OPTIONS: { value: PaycheckSchedule; label: string; description: string }[] = [
  { value: "weekly", label: "Weekly", description: "Every week" },
  { value: "biweekly", label: "Biweekly", description: "Every two weeks" },
  { value: "semimonthly", label: "Semi-monthly", description: "1st and 15th" },
  { value: "monthly", label: "Monthly", description: "Once a month" },
  { value: "irregular", label: "Irregular", description: "Custom dates" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number, currency: string = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function PaycheckPlanningPage() {
  // Data state
  const [plan, setPlan] = useState<PaycheckPlan | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [showSetup, setShowSetup] = useState(false);
  const [allocatingPaycheckId, setAllocatingPaycheckId] = useState<string | null>(null);
  const [expandedPaycheckId, setExpandedPaycheckId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // -----------------------------------------------------------------------
  // Data loading
  // -----------------------------------------------------------------------

  const loadData = useCallback(async () => {
    try {
      const [plans, cats, buds] = await Promise.all([
        db.paycheckPlans.toArray(),
        db.categories.where("type").equals("expense").toArray(),
        db.budgets.toArray(),
      ]);

      const existingPlan = plans.length > 0 ? plans[0] : null;
      setPlan(existingPlan);
      setCategories(cats);
      setBudgets(buds);

      if (!existingPlan) {
        setShowSetup(true);
      }
    } catch (error) {
      console.error("Error loading paycheck plan:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------

  const activePaycheck = useMemo(() => {
    if (!plan) return null;
    return getActivePaycheck(plan);
  }, [plan]);

  const summaryStats = useMemo(() => {
    if (!plan || plan.paychecks.length === 0) {
      return { totalIncome: 0, totalAllocated: 0, safeToSpend: 0 };
    }

    const totalIncome = plan.paychecks.reduce((sum, pc) => sum + pc.expectedAmount, 0);
    const totalAllocated = plan.paychecks.reduce((sum, pc) => sum + getAllocatedTotal(pc), 0);
    const safeToSpend = totalIncome - totalAllocated;

    return { totalIncome, totalAllocated, safeToSpend };
  }, [plan]);

  // -----------------------------------------------------------------------
  // Plan management
  // -----------------------------------------------------------------------

  async function handleCreatePlan(
    schedule: PaycheckSchedule,
    firstDate: Date,
    amount: number,
    currency: string
  ) {
    const dates = generatePaycheckDates(schedule, firstDate, PAYCHECK_COUNT);

    const paychecks: Paycheck[] = dates.map((dateStr, index) => ({
      id: `paycheck_${Date.now()}_${index}`,
      label: `Paycheck ${index + 1}`,
      expectedDate: dateStr,
      expectedAmount: amount,
      currency,
      allocations: [],
    }));

    // For irregular schedule, create a single empty paycheck at the given date
    if (schedule === "irregular" && paychecks.length === 0) {
      paychecks.push({
        id: `paycheck_${Date.now()}_0`,
        label: "Paycheck 1",
        expectedDate: toISODateString(firstDate),
        expectedAmount: amount,
        currency,
        allocations: [],
      });
    }

    const newPlan: PaycheckPlan = {
      id: plan?.id ?? `plan_${Date.now()}`,
      schedule,
      paychecks,
      createdAt: plan?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    await db.paycheckPlans.put(newPlan);
    setPlan(newPlan);
    setShowSetup(false);
  }

  async function handleDeletePlan() {
    if (!plan) return;
    await db.paycheckPlans.delete(plan.id);
    setPlan(null);
    setShowSetup(true);
    setDeleteConfirmOpen(false);
  }

  async function handleSaveAllocations(paycheckId: string, allocations: PaycheckAllocation[]) {
    if (!plan) return;

    const updatedPaychecks = plan.paychecks.map((pc) =>
      pc.id === paycheckId ? { ...pc, allocations } : pc
    );

    const updatedPlan: PaycheckPlan = {
      ...plan,
      paychecks: updatedPaychecks,
      updatedAt: new Date(),
    };

    await db.paycheckPlans.put(updatedPlan);
    setPlan(updatedPlan);
    setAllocatingPaycheckId(null);
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading paycheck plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-white">Paycheck Planning</h1>
            <HelpTooltip
              content="Allocate each paycheck to budget categories before payday. See exactly how much is left for discretionary spending."
              ariaLabel="More information about paycheck planning"
              iconSize="h-5 w-5"
            />
          </div>
          <p className="mt-2 text-lg font-medium text-slate-400">
            Plan where every dollar goes before you get paid
          </p>
        </div>
        <div className="flex gap-3">
          {plan && (
            <button
              onClick={() => setShowSetup(true)}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-5 w-5" />
              <span className="hidden sm:inline">Edit Schedule</span>
            </button>
          )}
          {!plan && !showSetup && (
            <button
              onClick={() => setShowSetup(true)}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Plus className="h-5 w-5" />
              Set Up Plan
            </button>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      {plan && plan.paychecks.length > 0 && (
        <div className="rounded-lg border-l-4 border-teal-500 bg-white p-8 shadow-md">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <p className="text-base font-medium text-gray-700">Total Income</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(summaryStats.totalIncome, plan.paychecks[0]?.currency)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {plan.paychecks.length} paycheck{plan.paychecks.length !== 1 ? "s" : ""} planned
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <p className="text-base font-medium text-gray-700">Total Allocated</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(summaryStats.totalAllocated, plan.paychecks[0]?.currency)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {summaryStats.totalIncome > 0
                  ? `${Math.round((summaryStats.totalAllocated / summaryStats.totalIncome) * 100)}% of income`
                  : "0% of income"}
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-green-600" aria-hidden="true" />
                <p className="text-base font-medium text-gray-700">Safe to Spend</p>
              </div>
              <p
                className={`text-3xl font-bold ${
                  summaryStats.safeToSpend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(summaryStats.safeToSpend, plan.paychecks[0]?.currency)}
              </p>
              <p className="mt-1 text-sm text-gray-500">Unallocated funds</p>
            </div>
          </div>
        </div>
      )}

      {/* Setup Flow */}
      {showSetup && (
        <SetupForm
          existingPlan={plan}
          onSubmit={handleCreatePlan}
          onCancel={() => {
            if (plan) setShowSetup(false);
          }}
          onDelete={plan ? () => setDeleteConfirmOpen(true) : undefined}
        />
      )}

      {/* Paycheck Timeline */}
      {plan && !showSetup && plan.paychecks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Paycheck Timeline</h2>
          <div className="space-y-4">
            {plan.paychecks.map((paycheck) => {
              const isActive = activePaycheck?.id === paycheck.id;
              const allocated = getAllocatedTotal(paycheck);
              const unallocated = getUnallocatedAmount(paycheck);
              const isExpanded = expandedPaycheckId === paycheck.id;
              const isAllocating = allocatingPaycheckId === paycheck.id;

              return (
                <div
                  key={paycheck.id}
                  className={`rounded-lg bg-white p-6 shadow transition-all ${
                    isActive ? "border-2 border-teal-500 shadow-lg" : "border border-gray-200"
                  }`}
                >
                  {/* Paycheck card header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          isActive ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Wallet className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{paycheck.label}</h3>
                          {isActive && (
                            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <CalendarDays className="h-4 w-4" aria-hidden="true" />
                          <span>{formatDate(paycheck.expectedDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(paycheck.expectedAmount, paycheck.currency)}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            unallocated > 0
                              ? "text-amber-600"
                              : unallocated === 0
                                ? "text-green-600"
                                : "text-red-600"
                          }`}
                        >
                          {unallocated > 0
                            ? `${formatCurrency(unallocated, paycheck.currency)} unallocated`
                            : unallocated === 0
                              ? "Fully allocated"
                              : `${formatCurrency(Math.abs(unallocated), paycheck.currency)} over-allocated`}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedPaycheckId(isExpanded ? null : paycheck.id)}
                        className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg p-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label={
                          isExpanded ? "Collapse paycheck details" : "Expand paycheck details"
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Allocation progress bar */}
                  {paycheck.expectedAmount > 0 && (
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full transition-all ${
                            allocated / paycheck.expectedAmount >= 1
                              ? "bg-green-500"
                              : allocated / paycheck.expectedAmount >= 0.5
                                ? "bg-teal-500"
                                : "bg-gray-400"
                          }`}
                          style={{
                            width: `${Math.min((allocated / paycheck.expectedAmount) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>{formatCurrency(allocated, paycheck.currency)} allocated</span>
                        <span>{Math.round((allocated / paycheck.expectedAmount) * 100)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Expanded allocation summary */}
                  {isExpanded && !isAllocating && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      {paycheck.allocations.length > 0 ? (
                        <div className="space-y-2">
                          {paycheck.allocations.map((alloc) => {
                            const category = categories.find((c) => c.id === alloc.categoryId);
                            return (
                              <div
                                key={alloc.categoryId}
                                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{
                                      backgroundColor: category?.color ?? "#9ca3af",
                                    }}
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    {category?.name ?? "Unknown Category"}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(alloc.amount, paycheck.currency)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-500">
                          No allocations yet. Tap &quot;Allocate&quot; to assign funds to
                          categories.
                        </p>
                      )}
                      <button
                        onClick={() => setAllocatingPaycheckId(paycheck.id)}
                        className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
                      >
                        <DollarSign className="h-4 w-4" />
                        {paycheck.allocations.length > 0 ? "Edit Allocations" : "Allocate"}
                      </button>
                    </div>
                  )}

                  {/* Inline allocation editor */}
                  {isAllocating && (
                    <AllocationEditor
                      paycheck={paycheck}
                      categories={categories}
                      budgets={budgets}
                      onSave={(allocations) => handleSaveAllocations(paycheck.id, allocations)}
                      onCancel={() => setAllocatingPaycheckId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state when plan has no paychecks (e.g. irregular with none added) */}
      {plan && !showSetup && plan.paychecks.length === 0 && (
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <Wallet className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No paychecks scheduled</h3>
          <p className="mb-4 text-gray-600">
            Your plan uses an irregular schedule. Update your setup to add paychecks.
          </p>
          <button
            onClick={() => setShowSetup(true)}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
          >
            <Settings className="h-4 w-4" />
            Edit Schedule
          </button>
        </div>
      )}

      {/* Delete Plan Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeletePlan}
        title="Delete Paycheck Plan"
        description="This will remove your entire paycheck plan, including all schedules and allocations."
        impact={
          plan
            ? {
                title: "You will lose:",
                items: [
                  `${plan.paychecks.length} scheduled paycheck${plan.paychecks.length !== 1 ? "s" : ""}`,
                  `All category allocations across paychecks`,
                  `Schedule: ${SCHEDULE_OPTIONS.find((o) => o.value === plan.schedule)?.label ?? plan.schedule}`,
                ],
              }
            : undefined
        }
        confirmLabel="Delete Plan"
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Setup Form Component
// ---------------------------------------------------------------------------

function SetupForm({
  existingPlan,
  onSubmit,
  onCancel,
  onDelete,
}: {
  existingPlan: PaycheckPlan | null;
  onSubmit: (
    schedule: PaycheckSchedule,
    firstDate: Date,
    amount: number,
    currency: string
  ) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [schedule, setSchedule] = useState<PaycheckSchedule>(existingPlan?.schedule ?? "biweekly");
  const [firstDate, setFirstDate] = useState<string>(() => {
    if (existingPlan?.paychecks.length) {
      return existingPlan.paychecks[0].expectedDate;
    }
    return toISODateString(new Date());
  });
  const [amount, setAmount] = useState<string>(() => {
    if (existingPlan?.paychecks.length) {
      return existingPlan.paychecks[0].expectedAmount.toString();
    }
    return "";
  });
  const [currency, setCurrency] = useState<string>(() => {
    if (existingPlan?.paychecks.length) {
      return existingPlan.paychecks[0].currency;
    }
    return "CAD";
  });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsSaving(true);
    try {
      const [year, month, day] = firstDate.split("-").map(Number);
      await onSubmit(schedule, new Date(year, month - 1, day), amountNum, currency);
    } finally {
      setIsSaving(false);
    }
  }

  // Handle Escape key to close setup
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && existingPlan) {
        onCancel();
      }
    }
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [existingPlan, onCancel]);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {existingPlan ? "Edit Paycheck Schedule" : "Set Up Paycheck Plan"}
        </h2>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete Plan
          </button>
        )}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {/* Schedule Selector */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">Pay Frequency</label>
            <HelpTooltip
              content="How often do you get paid? This determines when your paychecks are generated."
              ariaLabel="More information about pay frequency"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {SCHEDULE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                  schedule === option.value
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="schedule"
                  value={option.value}
                  checked={schedule === option.value}
                  onChange={(e) => setSchedule(e.target.value as PaycheckSchedule)}
                  className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* First Paycheck Date */}
        <div>
          <label htmlFor="firstDate" className="mb-2 block text-sm font-medium text-gray-700">
            First Paycheck Date
          </label>
          <input
            id="firstDate"
            type="date"
            value={firstDate}
            onChange={(e) => setFirstDate(e.target.value)}
            className="min-h-[48px] w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            required
          />
        </div>

        {/* Expected Amount */}
        <div>
          <label htmlFor="expectedAmount" className="mb-2 block text-sm font-medium text-gray-700">
            Expected Amount (Net Pay)
          </label>
          <div className="relative w-full max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              id="expectedAmount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="min-h-[48px] w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              required
            />
          </div>
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="mb-2 block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="min-h-[48px] w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          {existingPlan && (
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[48px] rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving || !amount || parseFloat(amount) <= 0}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-teal-500 px-6 py-2.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <CalendarDays className="h-5 w-5" />
                {existingPlan ? "Regenerate Paychecks" : "Generate Paychecks"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Allocation Editor Component
// ---------------------------------------------------------------------------

function AllocationEditor({
  paycheck,
  categories,
  budgets,
  onSave,
  onCancel,
}: {
  paycheck: Paycheck;
  categories: Category[];
  budgets: Budget[];
  onSave: (allocations: PaycheckAllocation[]) => Promise<void>;
  onCancel: () => void;
}) {
  // Build initial allocation map from existing allocations
  const [allocationMap, setAllocationMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const alloc of paycheck.allocations) {
      map[alloc.categoryId] = alloc.amount.toString();
    }
    return map;
  });
  const [isSaving, setIsSaving] = useState(false);

  // Categories that have a budget (prioritized) and those that don't
  const categoriesWithBudget = useMemo(() => {
    const budgetCategoryIds = new Set(budgets.map((b) => b.categoryId));
    const withBudget = categories.filter((c) => budgetCategoryIds.has(c.id));
    const withoutBudget = categories.filter((c) => !budgetCategoryIds.has(c.id));
    return { withBudget, withoutBudget };
  }, [categories, budgets]);

  // Compute totals
  const totalAllocated = useMemo(() => {
    return Object.values(allocationMap).reduce((sum, val) => {
      const num = parseFloat(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [allocationMap]);

  const remaining = paycheck.expectedAmount - totalAllocated;

  function handleAmountChange(categoryId: string, value: string) {
    setAllocationMap((prev) => ({ ...prev, [categoryId]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const allocations: PaycheckAllocation[] = [];
      for (const [categoryId, value] of Object.entries(allocationMap)) {
        const amount = parseFloat(value);
        if (!isNaN(amount) && amount > 0) {
          allocations.push({ categoryId, amount });
        }
      }
      await onSave(allocations);
    } finally {
      setIsSaving(false);
    }
  }

  function getBudgetForCategory(categoryId: string): Budget | undefined {
    return budgets.find((b) => b.categoryId === categoryId);
  }

  function renderCategoryRow(category: Category) {
    const budget = getBudgetForCategory(category.id);
    const currentValue = allocationMap[category.id] || "";

    return (
      <div key={category.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-3">
        <div
          className="h-3 w-3 flex-shrink-0 rounded-full"
          style={{ backgroundColor: category.color || "#9ca3af" }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{category.name}</p>
          {budget && (
            <p className="text-xs text-gray-500">
              Budget: {formatCurrency(budget.amount, paycheck.currency)}/{budget.period}
            </p>
          )}
        </div>
        <div className="relative w-32 flex-shrink-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleAmountChange(category.id, e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="min-h-[48px] w-full rounded-lg border border-gray-300 py-2 pl-7 pr-2 text-right text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label={`Allocation for ${category.name}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      {/* Remaining indicator */}
      <div
        className={`mb-4 flex items-center justify-between rounded-lg p-3 ${
          remaining > 0
            ? "border border-amber-200 bg-amber-50"
            : remaining === 0
              ? "border border-green-200 bg-green-50"
              : "border border-red-200 bg-red-50"
        }`}
      >
        <span
          className={`text-sm font-medium ${
            remaining > 0 ? "text-amber-700" : remaining === 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          {remaining > 0
            ? "Remaining to allocate"
            : remaining === 0
              ? "Fully allocated!"
              : "Over-allocated by"}
        </span>
        <span
          className={`text-lg font-bold ${
            remaining > 0 ? "text-amber-700" : remaining === 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          {formatCurrency(Math.abs(remaining), paycheck.currency)}
        </span>
      </div>

      {/* Categories with budgets */}
      {categoriesWithBudget.withBudget.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Budgeted Categories</h4>
          <div className="space-y-2">{categoriesWithBudget.withBudget.map(renderCategoryRow)}</div>
        </div>
      )}

      {/* Categories without budgets */}
      {categoriesWithBudget.withoutBudget.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Other Categories</h4>
          <div className="space-y-2">
            {categoriesWithBudget.withoutBudget.map(renderCategoryRow)}
          </div>
        </div>
      )}

      {/* Save / Cancel */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[48px] flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Save Allocations
            </>
          )}
        </button>
      </div>
    </div>
  );
}
