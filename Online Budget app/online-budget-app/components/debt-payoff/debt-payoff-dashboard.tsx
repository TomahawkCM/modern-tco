"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LazyAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "@/components/charts/lazy-charts";
import { calculators } from "@/engine";
import {
  DollarSignIcon,
  PercentIcon,
  ClockIcon,
  TrendingDownIcon,
  SaveIcon,
  TrashIcon,
  DownloadIcon,
} from "lucide-react";
import type { MinorAmount } from "@/engine";
import type { DebtStrategy } from "@/engine/calculators/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LoanRow {
  id: string;
  user_id: string;
  name: string;
  loan_type: string;
  original_balance_minor: number;
  current_balance_minor: number;
  interest_rate: number;
  minimum_payment_minor: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface DebtScenarioRow {
  id: string;
  user_id: string;
  name: string;
  strategy: string;
  extra_payment_minor: number;
  config: Record<string, unknown>;
  created_at: string;
}

interface DebtPayoffDashboardProps {
  loans: LoanRow[];
  scenarios: DebtScenarioRow[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STRATEGIES: DebtStrategy[] = ["avalanche", "snowball"];

interface ScenarioFormData {
  name: string;
  strategy: DebtStrategy;
  extra_payment: string;
}

const INITIAL_SCENARIO_FORM: ScenarioFormData = {
  name: "",
  strategy: "avalanche",
  extra_payment: "0",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DebtPayoffDashboard({
  loans,
  scenarios,
  currency,
  formatAmount,
}: DebtPayoffDashboardProps) {
  const t = useTranslations("debtPayoff");
  const tc = useTranslations("common");
  const router = useRouter();

  const [strategy, setStrategy] = useState<DebtStrategy>("avalanche");
  const [extraPayment, setExtraPayment] = useState("0");
  const [saveOpen, setSaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<DebtScenarioRow | null>(null);
  const [scenarioForm, setScenarioForm] = useState<ScenarioFormData>(INITIAL_SCENARIO_FORM);
  const [saving, setSaving] = useState(false);

  /* ---- Convert loans to debt accounts ---- */

  const debtAccounts = useMemo(() => {
    return calculators.loansToDebtAccounts(
      loans
        .filter((l) => l.status === "active")
        .map((l) => ({
          id: l.id,
          name: l.name,
          currentBalance: l.current_balance_minor / 100,
          interestRate: l.interest_rate,
          monthlyPayment: l.minimum_payment_minor / 100,
        }))
    );
  }, [loans]);

  /* ---- Compute payoff result ---- */

  const extraPaymentNum = useMemo(() => parseFloat(extraPayment || "0") || 0, [extraPayment]);

  const payoffResult = useMemo(() => {
    if (debtAccounts.length === 0) return null;
    return calculators.calculateDebtPayoff({
      debts: debtAccounts,
      extraMonthlyPayment: extraPaymentNum,
    });
  }, [debtAccounts, extraPaymentNum]);

  /* ---- Minimum-only result (for savings comparison) ---- */

  const minimumOnlyResult = useMemo(() => {
    if (debtAccounts.length === 0) return null;
    return calculators.calculateDebtPayoff({
      debts: debtAccounts,
      extraMonthlyPayment: 0,
    });
  }, [debtAccounts]);

  /* ---- Active strategy result ---- */

  const activeResult = useMemo(() => {
    if (!payoffResult) return null;
    return strategy === "avalanche" ? payoffResult.avalanche : payoffResult.snowball;
  }, [payoffResult, strategy]);

  /* ---- Stats ---- */

  const stats = useMemo(() => {
    const totalDebt = debtAccounts.reduce((s, d) => s + d.balance, 0);
    const totalMinPayment = debtAccounts.reduce((s, d) => s + d.minimumPayment, 0);
    const weightedApr =
      totalDebt > 0 ? debtAccounts.reduce((s, d) => s + d.apr * d.balance, 0) / totalDebt : 0;

    const minimumInterest = minimumOnlyResult
      ? strategy === "avalanche"
        ? minimumOnlyResult.avalanche.totalInterest
        : minimumOnlyResult.snowball.totalInterest
      : 0;

    const interestSaved = activeResult ? minimumInterest - activeResult.totalInterest : 0;

    return {
      totalDebt,
      totalMinPayment,
      weightedApr,
      monthsToPayoff: activeResult?.totalMonths ?? 0,
      totalInterest: activeResult?.totalInterest ?? 0,
      interestSaved: Math.max(0, interestSaved),
    };
  }, [debtAccounts, activeResult, minimumOnlyResult, strategy]);

  /* ---- Chart data ---- */

  const chartData = useMemo(() => {
    if (!activeResult) return [];
    // Sample every N months for readability
    const schedule = activeResult.schedule;
    const step = Math.max(1, Math.floor(schedule.length / 60));
    return schedule
      .filter((_, i) => i % step === 0 || i === schedule.length - 1)
      .map((entry) => ({
        month: entry.month,
        remaining: Math.round(entry.totalRemaining * 100) / 100,
      }));
  }, [activeResult]);

  /* ---- Scenario handlers ---- */

  const handleSaveScenario = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/debt-payoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: scenarioForm.name,
          strategy: scenarioForm.strategy,
          extra_payment_minor: Math.round(parseFloat(scenarioForm.extra_payment || "0") * 100),
        }),
      });
      if (res.ok) {
        setSaveOpen(false);
        setScenarioForm(INITIAL_SCENARIO_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [scenarioForm, router]);

  const handleDeleteScenario = useCallback(async () => {
    if (!selectedScenario) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/debt-payoff/${selectedScenario.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setSelectedScenario(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedScenario, router]);

  const loadScenario = useCallback((scenario: DebtScenarioRow) => {
    setStrategy(scenario.strategy as DebtStrategy);
    setExtraPayment((scenario.extra_payment_minor / 100).toFixed(2));
  }, []);

  /* ---- Empty state (no loans) ---- */

  if (loans.length === 0 || debtAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm font-medium">{t("loans.noLoans")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSignIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalDebt")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: Math.round(stats.totalDebt * 100), currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <PercentIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.weightedAvgApr")}</p>
              <p className="text-2xl font-bold">{stats.weightedApr.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <ClockIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.monthsToPayoff")}</p>
              <p className="text-2xl font-bold">{stats.monthsToPayoff}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingDownIcon className="size-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalInterest")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: Math.round(stats.totalInterest * 100), currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSignIcon className="size-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.interestSaved")}</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatAmount({ amountMinor: Math.round(stats.interestSaved * 100), currency })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy selector + extra payment */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>{t("strategy.label")}</Label>
              <Select value={strategy} onValueChange={(v) => setStrategy(v as DebtStrategy)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`strategy.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t(`strategy.${strategy}Description`)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="extra_payment">{t("fields.extraPayment")}</Label>
              <Input
                id="extra_payment"
                type="number"
                step="0.01"
                min={0}
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                className="w-40"
              />
              <p className="text-xs text-muted-foreground">{t("fields.extraPaymentDescription")}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setScenarioForm({
                  name: "",
                  strategy,
                  extra_payment: extraPayment,
                });
                setSaveOpen(true);
              }}
            >
              <SaveIcon className="size-4" />
              {t("scenarios.saveScenario")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loans table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("loans.currentLoans")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    {t("loans.loanName")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    {t("loans.balance")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    {t("loans.rate")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    {t("loans.minimumPayment")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loans
                  .filter((l) => l.status === "active")
                  .map((loan) => (
                    <tr key={loan.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="px-3 py-2 font-medium text-foreground">{loan.name}</td>
                      <td className="px-3 py-2 text-right text-foreground">
                        {formatAmount({ amountMinor: loan.current_balance_minor, currency })}
                      </td>
                      <td className="px-3 py-2 text-right text-foreground">
                        {loan.interest_rate.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-right text-foreground">
                        {formatAmount({ amountMinor: loan.minimum_payment_minor, currency })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payoff timeline chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("chart.payoffTimeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LazyAreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    label={{ value: t("chart.month"), position: "insideBottom", offset: -5 }}
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: number) =>
                      formatAmount({ amountMinor: Math.round(value * 100), currency })
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number) => [
                      formatAmount({ amountMinor: Math.round(value * 100), currency }),
                      t("chart.remaining"),
                    ]}
                    labelFormatter={(label: number) => `${t("chart.month")} ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="remaining"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name={t("chart.remaining")}
                  />
                </LazyAreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy comparison */}
      {payoffResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("comparisons")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant={strategy === "avalanche" ? "default" : "secondary"}>
                    {t("strategy.avalanche")}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("stats.monthsToPayoff")}</span>
                    <span className="font-medium">{payoffResult.avalanche.totalMonths}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("stats.totalInterest")}</span>
                    <span className="font-medium">
                      {formatAmount({
                        amountMinor: Math.round(payoffResult.avalanche.totalInterest * 100),
                        currency,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant={strategy === "snowball" ? "default" : "secondary"}>
                    {t("strategy.snowball")}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("stats.monthsToPayoff")}</span>
                    <span className="font-medium">{payoffResult.snowball.totalMonths}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("stats.totalInterest")}</span>
                    <span className="font-medium">
                      {formatAmount({
                        amountMinor: Math.round(payoffResult.snowball.totalInterest * 100),
                        currency,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved scenarios */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("scenarios.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{scenario.name}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {t(`strategy.${scenario.strategy}`)}
                      </Badge>
                      <span>
                        +{formatAmount({ amountMinor: scenario.extra_payment_minor, currency })}/mo
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="xs" onClick={() => loadScenario(scenario)}>
                      <DownloadIcon className="size-3" />
                      {t("scenarios.loadScenario")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setSelectedScenario(scenario);
                        setDeleteOpen(true);
                      }}
                    >
                      <TrashIcon className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save scenario dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("scenarios.saveScenario")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scenario_name">{t("fields.name")}</Label>
              <Input
                id="scenario_name"
                placeholder={t("fields.namePlaceholder")}
                value={scenarioForm.name}
                onChange={(e) => setScenarioForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleSaveScenario} disabled={saving || !scenarioForm.name.trim()}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete scenario dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("scenarios.deleteScenario")}</DialogTitle>
            <DialogDescription>{t("scenarios.confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteScenario} disabled={saving}>
              {saving ? tc("loading") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
