"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Clock,
  CalendarCheck,
  Percent,
  CreditCard,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { db } from "@/lib/budget-db";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import {
  calculateDebtPayoff,
  loansToDebtAccounts,
  generateDebtId,
  calculateSingleStrategy,
} from "@/lib/calculators/debt-payoff";
import {
  saveScenario,
  getScenarios,
  deleteScenario,
  recomputeScenarios,
} from "@/lib/calculators/debt-scenario-db";
import { celebrate } from "@/lib/celebration";
import { StatCard } from "@/components/budget/StatCard";
import { StrategyConfigurator } from "@/components/budget/debt-payoff/StrategyConfigurator";
import { DebtPayoffChart } from "@/components/budget/debt-payoff/DebtPayoffChart";
import { ScenarioManager } from "@/components/budget/debt-payoff/ScenarioManager";
import type {
  DebtAccount,
  DebtStrategy,
  OneTimePayment,
  DebtPayoffResult,
  StrategyResult,
} from "@/lib/calculators/types";
import type { DebtScenario } from "@/types/budget";
import { useTranslations, useLocale } from "next-intl";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import type { SupportedLocale } from "@/i18n/config";
import Link from "next/link";

export default function DebtPayoffPage() {
  const t = useTranslations("debtPayoff");
  const locale = useLocale() as SupportedLocale;
  const currency = useDefaultCurrency();

  // State
  const [debts, setDebts] = useState<DebtAccount[]>([]);
  const [manualDebts, setManualDebts] = useState<DebtAccount[]>([]);
  const [strategy, setStrategy] = useState<DebtStrategy>("avalanche");
  const [extraPayment, setExtraPayment] = useState(200);
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  const [oneTimePayments, setOneTimePayments] = useState<OneTimePayment[]>([]);
  const [result, setResult] = useState<DebtPayoffResult | null>(null);
  const [scenarios, setScenarios] = useState<DebtScenario[]>([]);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [addDebtDialogOpen, setAddDebtDialogOpen] = useState(false);
  const [newDebt, setNewDebt] = useState({ name: "", balance: 0, apr: 0, minimumPayment: 0 });
  const [loading, setLoading] = useState(true);
  const celebratedRef = useRef(false);

  const fmtCurrency = useCallback(
    (amount: number) => formatCurrency(amount, currency, locale),
    [currency, locale]
  );

  // Load loans and scenarios on mount
  useEffect(() => {
    async function load() {
      try {
        const [allLoans, allScenarios] = await Promise.all([db.loans.toArray(), getScenarios()]);
        const activeLoans = allLoans.filter((l) => l.status === "active");

        const loanDebts = loansToDebtAccounts(activeLoans);
        setDebts(loanDebts);
        setCustomOrder(loanDebts.map((d) => d.id));

        // Recompute scenarios if loans exist
        if (activeLoans.length > 0 && allScenarios.length > 0) {
          const refreshed = await recomputeScenarios(activeLoans);
          setScenarios(refreshed);
        } else {
          setScenarios(allScenarios);
        }
      } catch (error) {
        console.error("Error loading debt data:", error);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // Merge loan debts + manual debts
  const allDebts = useMemo(() => [...debts, ...manualDebts], [debts, manualDebts]);

  // Recalculate whenever inputs change
  useEffect(() => {
    if (allDebts.length === 0) {
      setResult(null);
      return;
    }
    const payoffResult = calculateDebtPayoff({
      debts: allDebts,
      extraMonthlyPayment: extraPayment,
      strategy,
      customOrder: strategy === "custom" ? customOrder : undefined,
      oneTimePayments: oneTimePayments.filter((p) => p.amount > 0),
    });
    setResult(payoffResult);

    // Celebration on first calculation
    if (!celebratedRef.current && payoffResult.avalanche.totalMonths > 0) {
      celebratedRef.current = true;
      celebrate("milestone");
    }
  }, [allDebts, extraPayment, strategy, customOrder, oneTimePayments]);

  // Update custom order when debts change
  useEffect(() => {
    setCustomOrder((prev) => {
      const allIds = new Set(allDebts.map((d) => d.id));
      const filtered = prev.filter((id) => allIds.has(id));
      const missing = allDebts.filter((d) => !filtered.includes(d.id)).map((d) => d.id);
      return [...filtered, ...missing];
    });
  }, [allDebts]);

  // Get current strategy result
  const activeResult: StrategyResult | null = useMemo(() => {
    if (!result) return null;
    switch (strategy) {
      case "avalanche":
        return result.avalanche;
      case "snowball":
        return result.snowball;
      case "custom":
        return result.custom ?? result.avalanche;
      case "minimum_only":
        return result.minimumOnly ?? result.avalanche;
      default:
        return result.avalanche;
    }
  }, [result, strategy]);

  // Summary stats
  const totalDebt = useMemo(() => allDebts.reduce((s, d) => s + d.balance, 0), [allDebts]);
  const weightedAvgApr = useMemo(() => {
    if (totalDebt === 0) return 0;
    return allDebts.reduce((s, d) => s + (d.apr * d.balance) / totalDebt, 0);
  }, [allDebts, totalDebt]);
  const totalMinPayments = useMemo(
    () => allDebts.reduce((s, d) => s + d.minimumPayment, 0),
    [allDebts]
  );

  // Baseline comparison (minimum-only)
  const baselineSavings = useMemo(() => {
    if (!result || !activeResult || !result.minimumOnly) return { interest: 0, months: 0 };
    return {
      interest: result.minimumOnly.totalInterest - activeResult.totalInterest,
      months: result.minimumOnly.totalMonths - activeResult.totalMonths,
    };
  }, [result, activeResult]);

  // Comparison chart scenarios
  const comparisonScenarios = useMemo(() => {
    if (selectedScenarioIds.size < 2) return undefined;
    const selected = scenarios.filter((s) => selectedScenarioIds.has(s.id));
    return selected.map((s) => {
      const stratResult = calculateSingleStrategy(
        allDebts,
        s.extraMonthlyPayment,
        s.strategy as DebtStrategy,
        s.customOrder,
        s.oneTimePayments
      );
      return { name: s.name, schedule: stratResult.schedule };
    });
  }, [scenarios, selectedScenarioIds, allDebts]);

  // Handlers
  const handleSaveScenario = useCallback(() => {
    if (allDebts.length === 0) return;
    setScenarioName("");
    setSaveDialogOpen(true);
  }, [allDebts]);

  const confirmSaveScenario = useCallback(async () => {
    if (!activeResult || !scenarioName.trim()) return;
    setIsSaving(true);
    try {
      const payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + activeResult.totalMonths);

      const totalPaid = activeResult.schedule.reduce((s, m) => s + m.totalPayment, 0);

      await saveScenario({
        name: scenarioName.trim(),
        strategy,
        extraMonthlyPayment: extraPayment,
        customOrder: strategy === "custom" ? customOrder : undefined,
        oneTimePayments: oneTimePayments.filter((p) => p.amount > 0),
        totalMonths: activeResult.totalMonths,
        totalInterest: activeResult.totalInterest,
        totalPaid,
        debtFreeDate: payoffDate.toISOString(),
      });

      const refreshed = await getScenarios();
      setScenarios(refreshed);
      setSaveDialogOpen(false);
    } catch (error) {
      console.error("Error saving scenario:", error);
    } finally {
      setIsSaving(false);
    }
  }, [activeResult, scenarioName, strategy, extraPayment, customOrder, oneTimePayments]);

  const handleDeleteScenario = useCallback((id: number) => {
    void (async () => {
      try {
        await deleteScenario(id);
        setScenarios((prev) => prev.filter((s) => s.id !== id));
        setSelectedScenarioIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } catch (error) {
        console.error("Error deleting scenario:", error);
      }
    })();
  }, []);

  const handleToggleSelect = useCallback((id: number) => {
    setSelectedScenarioIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAddManualDebt = useCallback(() => {
    if (!newDebt.name || newDebt.balance <= 0) return;
    const debt: DebtAccount = {
      id: generateDebtId(),
      name: newDebt.name,
      balance: newDebt.balance,
      apr: newDebt.apr,
      minimumPayment: newDebt.minimumPayment,
    };
    setManualDebts((prev) => [...prev, debt]);
    setNewDebt({ name: "", balance: 0, apr: 0, minimumPayment: 0 });
    setAddDebtDialogOpen(false);
  }, [newDebt]);

  const handleRemoveManualDebt = useCallback((id: string) => {
    setManualDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Payoff timeline
  const payoffTimeline = useMemo(() => {
    if (!activeResult) return [];
    return allDebts
      .map((debt) => {
        const orderIndex = activeResult.debtPayoffOrder.indexOf(debt.id);
        const payoffMonth =
          orderIndex >= 0
            ? activeResult.schedule.findIndex((m) =>
                m.payments.find((p) => p.debtId === debt.id && p.remainingBalance <= 0)
              ) + 1
            : activeResult.totalMonths;
        return {
          ...debt,
          payoffMonth: payoffMonth || activeResult.totalMonths,
        };
      })
      .sort((a, b) => a.payoffMonth - b.payoffMonth);
  }, [activeResult, allDebts]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("subtitle")}</p>
      </div>

      {/* Section A: Debt Overview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("debtOverview")}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddDebtDialogOpen(true)}
            className="gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addDebt")}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label={t("totalDebt")}
            value={fmtCurrency(totalDebt)}
            icon={DollarSign}
            variant="danger"
            size="sm"
          />
          <StatCard
            label={t("weightedApr")}
            value={`${weightedAvgApr.toFixed(1)}%`}
            icon={Percent}
            variant="warning"
            size="sm"
          />
          <StatCard
            label={t("totalMinPayments")}
            value={`${fmtCurrency(totalMinPayments)}/mo`}
            icon={CreditCard}
            variant="info"
            size="sm"
          />
        </div>

        {/* Debt List */}
        {allDebts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">{t("noDebts")}</p>
            <div className="mt-3 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddDebtDialogOpen(true)}
                className="border-slate-700 text-slate-300"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {t("addManually")}
              </Button>
              <Link href="/budget-app/loans">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-slate-700 text-slate-300"
                >
                  {t("goToLoans")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {allDebts.map((debt) => {
              const isManual = manualDebts.some((d) => d.id === debt.id);
              return (
                <div
                  key={debt.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{debt.name}</p>
                    <p className="text-xs text-slate-400">
                      {fmtCurrency(debt.balance)} &middot; {debt.apr}% APR &middot;{" "}
                      {fmtCurrency(debt.minimumPayment)}/mo
                    </p>
                  </div>
                  {isManual && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveManualDebt(debt.id)}
                      className="h-7 w-7 shrink-0 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Main Content: Two-column on desktop */}
      {allDebts.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left Column: Results + Chart */}
          <div className="space-y-6">
            {/* Section C: Results Dashboard */}
            {activeResult && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-white">{t("results")}</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard
                    label={t("monthsToFreedom")}
                    value={String(activeResult.totalMonths)}
                    icon={Clock}
                    variant="default"
                    size="sm"
                  />
                  <StatCard
                    label={t("totalInterestLabel")}
                    value={fmtCurrency(activeResult.totalInterest)}
                    icon={Percent}
                    variant="warning"
                    size="sm"
                  />
                  <StatCard
                    label={t("totalPaid")}
                    value={fmtCurrency(
                      activeResult.schedule.reduce((s, m) => s + m.totalPayment, 0)
                    )}
                    icon={DollarSign}
                    variant="default"
                    size="sm"
                  />
                  <StatCard
                    label={t("debtFreeDate")}
                    value={(() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + activeResult.totalMonths);
                      return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
                    })()}
                    icon={CalendarCheck}
                    variant="success"
                    size="sm"
                  />
                </div>

                {/* Baseline comparison */}
                {baselineSavings.interest > 0 && (
                  <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 px-4 py-3">
                    <p className="text-sm text-teal-300">
                      {t("baselineComparison", {
                        interest: fmtCurrency(baselineSavings.interest),
                        months: baselineSavings.months,
                      })}
                    </p>
                  </div>
                )}

                {/* Payoff Timeline */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">{t("payoffTimeline")}</h3>
                  <div className="space-y-1.5">
                    {payoffTimeline.map((debt) => {
                      const percent =
                        activeResult.totalMonths > 0
                          ? (debt.payoffMonth / activeResult.totalMonths) * 100
                          : 0;
                      return (
                        <div key={debt.id} className="flex items-center gap-3">
                          <span className="w-28 truncate text-xs text-slate-400">{debt.name}</span>
                          <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500"
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white">
                              {debt.payoffMonth} {t("mo")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Section D: Chart */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">{t("payoffChart")}</h2>
              <Card className="border-slate-700 bg-slate-900/50">
                <CardContent className="p-4">
                  <DebtPayoffChart
                    result={activeResult}
                    debts={allDebts}
                    comparisonScenarios={comparisonScenarios}
                    formatCurrency={fmtCurrency}
                  />
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right Column: Strategy + Scenarios */}
          <div className="space-y-6">
            {/* Section B: Strategy Configurator */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">{t("strategyConfig")}</h2>
              <Card className="border-slate-700 bg-slate-900/50">
                <CardContent className="p-4">
                  <StrategyConfigurator
                    debts={allDebts}
                    strategy={strategy}
                    extraPayment={extraPayment}
                    customOrder={customOrder}
                    oneTimePayments={oneTimePayments}
                    onStrategyChange={setStrategy}
                    onExtraPaymentChange={setExtraPayment}
                    onCustomOrderChange={setCustomOrder}
                    onOneTimePaymentsChange={setOneTimePayments}
                    onSaveScenario={handleSaveScenario}
                    formatCurrency={fmtCurrency}
                    isSaving={isSaving}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Section E: Saved Scenarios */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">{t("savedScenarios")}</h2>
              <Card className="border-slate-700 bg-slate-900/50">
                <CardContent className="p-4">
                  <ScenarioManager
                    scenarios={scenarios}
                    selectedIds={selectedScenarioIds}
                    onToggleSelect={handleToggleSelect}
                    onDelete={handleDeleteScenario}
                    formatCurrency={fmtCurrency}
                  />
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      )}

      {/* Save Scenario Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="border-slate-700 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-white">{t("saveScenarioTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder={t("scenarioNamePlaceholder")}
              className="border-slate-700 bg-slate-800/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void confirmSaveScenario();
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSaveDialogOpen(false)}
              className="text-slate-400"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={() => void confirmSaveScenario()}
              disabled={!scenarioName.trim() || isSaving}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Debt Dialog */}
      <Dialog open={addDebtDialogOpen} onOpenChange={setAddDebtDialogOpen}>
        <DialogContent className="border-slate-700 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-white">{t("addDebtTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-slate-400">{t("debtName")}</label>
              <Input
                value={newDebt.name}
                onChange={(e) => setNewDebt((d) => ({ ...d, name: e.target.value }))}
                placeholder={t("debtNamePlaceholder")}
                className="border-slate-700 bg-slate-800/50"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400">{t("balance")}</label>
                <Input
                  type="number"
                  min={0}
                  value={newDebt.balance || ""}
                  onChange={(e) =>
                    setNewDebt((d) => ({ ...d, balance: parseFloat(e.target.value) || 0 }))
                  }
                  className="border-slate-700 bg-slate-800/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">{t("apr")}</label>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={newDebt.apr || ""}
                  onChange={(e) =>
                    setNewDebt((d) => ({ ...d, apr: parseFloat(e.target.value) || 0 }))
                  }
                  className="border-slate-700 bg-slate-800/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">{t("minPayment")}</label>
                <Input
                  type="number"
                  min={0}
                  value={newDebt.minimumPayment || ""}
                  onChange={(e) =>
                    setNewDebt((d) => ({ ...d, minimumPayment: parseFloat(e.target.value) || 0 }))
                  }
                  className="border-slate-700 bg-slate-800/50"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setAddDebtDialogOpen(false)}
              className="text-slate-400"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAddManualDebt}
              disabled={!newDebt.name || newDebt.balance <= 0}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {t("addDebt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
