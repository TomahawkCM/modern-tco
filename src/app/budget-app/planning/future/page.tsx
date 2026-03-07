"use client";

/**
 * Future Purchase Planner
 * Plan and track savings for future purchases
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, Edit, Trash2, Target, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { db } from "@/lib/budget-db";
import { getCurrentCurrency, getCurrentLocale } from "@/lib/locale-storage";
import { LOCALE_METADATA } from "@/i18n/config";
import { formatCurrency as formatCurrencyUtil } from "@/i18n/utils/formatCurrency";
import type { FuturePurchase } from "@/types/budget";
import { differenceInDays, differenceInMonths, addMonths, format } from "date-fns";
import { ConfirmDialog } from "@/components/budget/ConfirmDialog";

function fmtCurrency(amount: number): string {
  return formatCurrencyUtil(
    amount,
    getCurrentCurrency() || LOCALE_METADATA[getCurrentLocale()].currency,
    getCurrentLocale()
  );
}

export default function FuturePurchasePage() {
  const t = useTranslations("planning.future");
  const [purchases, setPurchases] = useState<FuturePurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<FuturePurchase | null>(null);

  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPurchase, setDeletingPurchase] = useState<FuturePurchase | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await db.futurePurchases.toArray();
      setPurchases(
        data.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
      );
    } catch (error) {
      console.error("Error loading future purchases:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function savePurchase(purchase: FuturePurchase) {
    try {
      if (editingPurchase) {
        await db.futurePurchases.update(purchase.id, { ...purchase, updatedAt: new Date() });
      } else {
        await db.futurePurchases.add(purchase);
      }
      await loadData();
      setShowModal(false);
      setEditingPurchase(null);
    } catch (error) {
      console.error("Error saving purchase:", error);
      alert(t("failedToSave"));
    }
  }

  function initiateDeletePurchase(purchase: FuturePurchase) {
    setDeletingPurchase(purchase);
    setDeleteConfirmOpen(true);
  }

  async function confirmDeletePurchase() {
    if (!deletingPurchase) return;

    try {
      await db.futurePurchases.delete(deletingPurchase.id);
      await loadData();
      setDeleteConfirmOpen(false);
      setDeletingPurchase(null);
    } catch (error) {
      console.error("Error deleting purchase:", error);
      alert("Failed to delete purchase");
      // Keep dialog open on error
    }
  }

  async function toggleComplete(purchase: FuturePurchase) {
    try {
      await db.futurePurchases.update(purchase.id, {
        isCompleted: !purchase.isCompleted,
        updatedAt: new Date(),
      });
      await loadData();
    } catch (error) {
      console.error("Error updating purchase:", error);
    }
  }

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

  if (purchases.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
          <p className="mt-2 text-slate-400">{t("subtitle")}</p>
        </div>

        {/* Empty State */}
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 shadow-lg">
            <Target className="h-12 w-12 text-white" />
          </div>
          <h2 className="mt-8 text-3xl font-bold text-gray-900">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-gray-600">{t("emptyDescription")}</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-white shadow-md transition-colors hover:bg-teal-700 hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            {t("createFirstGoal")}
          </button>
        </div>

        {/* Add Modal */}
        {showModal && (
          <PurchaseModal
            purchase={null}
            onSave={savePurchase}
            onClose={() => setShowModal(false)}
            t={t}
          />
        )}
      </div>
    );
  }

  const activePurchases = purchases.filter((p) => !p.isCompleted);
  const completedPurchases = purchases.filter((p) => p.isCompleted);
  const totalSavings = activePurchases.reduce((sum, p) => sum + p.currentSavings, 0);
  const totalTarget = activePurchases.reduce((sum, p) => sum + p.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
          <p className="mt-2 text-slate-400">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => {
            setEditingPurchase(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          {t("addGoal")}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t("activeGoals")}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{activePurchases.length}</p>
            </div>
            <Target className="h-12 w-12 text-teal-600" />
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t("totalSaved")}</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{fmtCurrency(totalSavings)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t("totalTarget")}</p>
              <p className="mt-2 text-3xl font-bold text-teal-600">{fmtCurrency(totalTarget)}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Active Goals */}
      {activePurchases.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">{t("activeGoalsHeading")}</h2>
          {activePurchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onEdit={() => {
                setEditingPurchase(purchase);
                setShowModal(true);
              }}
              onDelete={() => initiateDeletePurchase(purchase)}
              onToggleComplete={() => toggleComplete(purchase)}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <Target className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">{t("noActiveGoals")}</h3>
          <p className="mb-6 text-gray-600">{t("startPlanning")}</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700"
          >
            <Plus className="h-5 w-5" />
            {t("addFirstGoal")}
          </button>
        </div>
      )}

      {/* Completed Goals */}
      {completedPurchases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">{t("completedGoals")}</h2>
          {completedPurchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onEdit={() => {
                setEditingPurchase(purchase);
                setShowModal(true);
              }}
              onDelete={() => initiateDeletePurchase(purchase)}
              onToggleComplete={() => toggleComplete(purchase)}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <PurchaseModal
          purchase={editingPurchase}
          onSave={savePurchase}
          onClose={() => {
            setShowModal(false);
            setEditingPurchase(null);
          }}
          t={t}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDeletePurchase}
        title={t("deleteGoalTitle")}
        description={t("deleteGoalDescription")}
        impact={
          deletingPurchase
            ? {
                title: t("youWillLose"),
                items: [
                  t("goalName", { name: deletingPurchase.name }),
                  t("targetAmountValue", { amount: fmtCurrency(deletingPurchase.targetAmount) }),
                  t("currentSavingsValue", {
                    amount: fmtCurrency(deletingPurchase.currentSavings),
                  }),
                  t("timeline", {
                    date: format(new Date(deletingPurchase.targetDate), "MMMM yyyy"),
                  }),
                  deletingPurchase.description
                    ? t("descriptionValue", { description: deletingPurchase.description })
                    : null,
                ],
              }
            : undefined
        }
        confirmLabel={t("deleteGoal")}
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </div>
  );
}

// Purchase Card Component
function PurchaseCard({
  purchase,
  onEdit,
  onDelete,
  onToggleComplete,
  t,
}: {
  purchase: FuturePurchase;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const progress = (purchase.currentSavings / purchase.targetAmount) * 100;
  const remaining = purchase.targetAmount - purchase.currentSavings;
  const daysUntilTarget = differenceInDays(new Date(purchase.targetDate), new Date());
  const monthsUntilTarget = differenceInMonths(new Date(purchase.targetDate), new Date());

  // Calculate when goal will be achieved with current monthly contribution
  const monthsToGoal =
    purchase.monthlyContribution > 0 ? Math.ceil(remaining / purchase.monthlyContribution) : null;
  const projectedDate = monthsToGoal ? addMonths(new Date(), monthsToGoal) : null;
  const canAffordByTarget = projectedDate && projectedDate <= new Date(purchase.targetDate);

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <div className={`rounded-lg bg-white p-6 shadow ${purchase.isCompleted ? "opacity-60" : ""}`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-gray-900">{purchase.name}</h3>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[purchase.priority]}`}
            >
              {purchase.priority}
            </span>
            {purchase.isCompleted && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                {t("completed")}
              </span>
            )}
          </div>
          {purchase.description && <p className="mt-2 text-gray-600">{purchase.description}</p>}
        </div>
        <div className="ml-4 flex items-center gap-2">
          <button
            onClick={onEdit}
            className="text-teal-600 hover:text-teal-700"
            title={t("edit")}
            aria-label={t("editGoalAriaLabel")}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
            title={t("delete")}
            aria-label={t("deleteGoalAriaLabel")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {t("savingsOf", {
              current: fmtCurrency(purchase.currentSavings),
              target: fmtCurrency(purchase.targetAmount),
            })}
          </span>
          <span className="text-sm font-semibold text-teal-600">{progress.toFixed(0)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-teal-600 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">{t("remaining")}</p>
          <p className="text-lg font-semibold text-gray-900">{fmtCurrency(remaining)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t("monthlySaving")}</p>
          <p className="text-lg font-semibold text-gray-900">
            {fmtCurrency(purchase.monthlyContribution)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t("targetDate")}</p>
          <p className="text-lg font-semibold text-gray-900">
            {format(new Date(purchase.targetDate), "MMM yyyy")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t("timeRemaining")}</p>
          <p className="text-lg font-semibold text-gray-900">
            {monthsUntilTarget > 0 ? t("monthsCount", { count: monthsUntilTarget }) : t("overdue")}
          </p>
        </div>
      </div>

      {/* Projection */}
      {!purchase.isCompleted && projectedDate && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          {canAffordByTarget ? (
            <p className="flex items-center gap-2 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              {t("onTrack", { date: format(projectedDate, "MMMM yyyy") })}
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm font-medium text-yellow-600">
              <Calendar className="h-4 w-4" />
              {t("atCurrentRate", {
                months: monthsToGoal ?? 0,
                date: format(projectedDate, "MMM yyyy"),
              })}
            </p>
          )}
        </div>
      )}

      {/* Complete Button */}
      <div className="mt-4">
        <button
          onClick={onToggleComplete}
          className={`w-full rounded-lg py-2 font-medium transition-colors ${
            purchase.isCompleted
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {purchase.isCompleted ? t("markIncomplete") : t("markComplete")}
        </button>
      </div>
    </div>
  );
}

// Purchase Modal Component
function PurchaseModal({
  purchase,
  onSave,
  onClose,
  t,
}: {
  purchase: FuturePurchase | null;
  onSave: (purchase: FuturePurchase) => void;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [name, setName] = useState(purchase?.name || "");
  const [description, setDescription] = useState(purchase?.description || "");
  const [targetAmount, setTargetAmount] = useState(purchase?.targetAmount.toString() || "");
  const [currentSavings, setCurrentSavings] = useState(purchase?.currentSavings.toString() || "0");
  const [monthlyContribution, setMonthlyContribution] = useState(
    purchase?.monthlyContribution.toString() || ""
  );
  const [targetDate, setTargetDate] = useState(
    purchase?.targetDate ? format(new Date(purchase.targetDate), "yyyy-MM-dd") : ""
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    purchase?.priority || "medium"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const targetAmountNum = parseFloat(targetAmount);
    const currentSavingsNum = parseFloat(currentSavings);
    const monthlyContributionNum = parseFloat(monthlyContribution);

    if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
      alert(t("invalidTargetAmount"));
      return;
    }

    if (!targetDate) {
      alert(t("pleaseSelectDate"));
      return;
    }

    const newPurchase: FuturePurchase = {
      id: purchase?.id || `purchase_${Date.now()}`,
      name,
      description,
      targetAmount: targetAmountNum,
      currentSavings: currentSavingsNum,
      monthlyContribution: monthlyContributionNum,
      targetDate: new Date(targetDate),
      priority,
      notes: "",
      isCompleted: purchase?.isCompleted || false,
      createdAt: purchase?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newPurchase);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 border-b border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {purchase ? t("editGoal") : t("addNewGoal")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("goalNameLabel")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("goalNamePlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("targetAmountLabel")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("currentSavingsLabel")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("monthlyContributionLabel")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="target-date" className="mb-2 block text-sm font-medium text-gray-700">
                {t("targetDateLabel")}
              </label>
              <input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                aria-label={t("targetDateAriaLabel")}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("priorityLabel")}
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
            >
              <option value="low">{t("priorityLow")}</option>
              <option value="medium">{t("priorityMedium")}</option>
              <option value="high">{t("priorityHigh")}</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
            >
              {purchase ? "Update Goal" : "Add Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
