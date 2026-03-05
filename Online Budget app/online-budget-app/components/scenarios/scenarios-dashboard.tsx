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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  TrendingUpIcon,
  CalculatorIcon,
  BarChart3Icon,
} from "lucide-react";
import type { MinorAmount } from "@/engine";
import type { Json } from "@/supabase/database.types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ScenarioConfig {
  income_change_pct?: number;
  expense_change_pct?: number;
  savings_rate_pct?: number;
  investment_return_pct?: number;
  inflation_rate_pct?: number;
  time_horizon_months?: number;
}

interface ScenarioRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  config: Json;
  results: Json | null;
  created_at: string;
  updated_at: string;
}

interface ScenariosDashboardProps {
  scenarios: ScenarioRow[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

interface ScenarioFormData {
  name: string;
  description: string;
  income_change_pct: string;
  expense_change_pct: string;
  savings_rate_pct: string;
  investment_return_pct: string;
  inflation_rate_pct: string;
  time_horizon_months: string;
}

const INITIAL_FORM: ScenarioFormData = {
  name: "",
  description: "",
  income_change_pct: "0",
  expense_change_pct: "0",
  savings_rate_pct: "20",
  investment_return_pct: "7",
  inflation_rate_pct: "3",
  time_horizon_months: "12",
};

interface ProjectionResult {
  months: number[];
  netWorth: number[];
  savings: number[];
  monthlyBalance: number[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function computeProjection(config: ScenarioConfig): ProjectionResult {
  const months: number[] = [];
  const netWorth: number[] = [];
  const savings: number[] = [];
  const monthlyBalance: number[] = [];

  const horizon = config.time_horizon_months ?? 12;
  const monthlyIncomeChange = (config.income_change_pct ?? 0) / 100 / 12;
  const monthlyExpenseChange = (config.expense_change_pct ?? 0) / 100 / 12;
  const monthlySavingsRate = (config.savings_rate_pct ?? 20) / 100;
  const monthlyReturn = (config.investment_return_pct ?? 7) / 100 / 12;
  const monthlyInflation = (config.inflation_rate_pct ?? 3) / 100 / 12;

  // Assume a baseline of 500000 minor units (5000.00) monthly income
  const baseIncome = 500000;
  const baseExpense = 400000;
  let cumulativeSavings = 0;
  let cumulativeNetWorth = 0;

  for (let m = 1; m <= horizon; m++) {
    const income = baseIncome * (1 + monthlyIncomeChange * m);
    const expense = baseExpense * (1 + monthlyExpenseChange * m) * (1 + monthlyInflation * m);
    const monthlySaved = income * monthlySavingsRate;
    const balance = income - expense;

    cumulativeSavings += monthlySaved;
    cumulativeNetWorth += balance + cumulativeNetWorth * monthlyReturn;

    months.push(m);
    netWorth.push(Math.round(cumulativeNetWorth));
    savings.push(Math.round(cumulativeSavings));
    monthlyBalance.push(Math.round(balance));
  }

  return { months, netWorth, savings, monthlyBalance };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ScenariosDashboard({ scenarios, currency, formatAmount }: ScenariosDashboardProps) {
  const t = useTranslations("scenarios");
  const tc = useTranslations("common");
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioRow | null>(null);
  const [form, setForm] = useState<ScenarioFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [projection, setProjection] = useState<ProjectionResult | null>(null);

  /* ---- Stats ---- */

  const stats = useMemo(() => {
    return {
      totalScenarios: scenarios.length,
      withResults: scenarios.filter((s) => s.results !== null).length,
    };
  }, [scenarios]);

  /* ---- CRUD handlers ---- */

  const handleCreate = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          config: {
            income_change_pct: parseFloat(form.income_change_pct || "0"),
            expense_change_pct: parseFloat(form.expense_change_pct || "0"),
            savings_rate_pct: parseFloat(form.savings_rate_pct || "20"),
            investment_return_pct: parseFloat(form.investment_return_pct || "7"),
            inflation_rate_pct: parseFloat(form.inflation_rate_pct || "3"),
            time_horizon_months: parseInt(form.time_horizon_months || "12", 10),
          },
        }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setForm(INITIAL_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, router]);

  const handleEdit = useCallback(async () => {
    if (!selectedScenario) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/scenarios/${selectedScenario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          config: {
            income_change_pct: parseFloat(form.income_change_pct || "0"),
            expense_change_pct: parseFloat(form.expense_change_pct || "0"),
            savings_rate_pct: parseFloat(form.savings_rate_pct || "20"),
            investment_return_pct: parseFloat(form.investment_return_pct || "7"),
            inflation_rate_pct: parseFloat(form.inflation_rate_pct || "3"),
            time_horizon_months: parseInt(form.time_horizon_months || "12", 10),
          },
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        setSelectedScenario(null);
        setForm(INITIAL_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, selectedScenario, router]);

  const handleDelete = useCallback(async () => {
    if (!selectedScenario) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/scenarios/${selectedScenario.id}`, {
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

  const handleRun = useCallback((scenario: ScenarioRow) => {
    const config = scenario.config as ScenarioConfig;
    const result = computeProjection(config);
    setProjection(result);
    setSelectedScenario(scenario);
    setResultsOpen(true);
  }, []);

  const openEdit = (scenario: ScenarioRow) => {
    const config = scenario.config as ScenarioConfig;
    setSelectedScenario(scenario);
    setForm({
      name: scenario.name,
      description: scenario.description ?? "",
      income_change_pct: String(config.income_change_pct ?? 0),
      expense_change_pct: String(config.expense_change_pct ?? 0),
      savings_rate_pct: String(config.savings_rate_pct ?? 20),
      investment_return_pct: String(config.investment_return_pct ?? 7),
      inflation_rate_pct: String(config.inflation_rate_pct ?? 3),
      time_horizon_months: String(config.time_horizon_months ?? 12),
    });
    setEditOpen(true);
  };

  const openDelete = (scenario: ScenarioRow) => {
    setSelectedScenario(scenario);
    setDeleteOpen(true);
  };

  /* ---- Form fields ---- */

  const formFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("fields.name")}</Label>
        <Input
          id="name"
          placeholder={t("fields.namePlaceholder")}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{t("fields.description")}</Label>
        <Input
          id="description"
          placeholder={t("fields.descriptionPlaceholder")}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="border-t pt-4">
        <p className="mb-3 text-sm font-medium">{t("config.title")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="income_change_pct">{t("config.incomeChange")} (%)</Label>
            <Input
              id="income_change_pct"
              type="number"
              step="0.1"
              value={form.income_change_pct}
              onChange={(e) => setForm((f) => ({ ...f, income_change_pct: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense_change_pct">{t("config.expenseChange")} (%)</Label>
            <Input
              id="expense_change_pct"
              type="number"
              step="0.1"
              value={form.expense_change_pct}
              onChange={(e) => setForm((f) => ({ ...f, expense_change_pct: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="savings_rate_pct">{t("config.savingsRate")} (%)</Label>
            <Input
              id="savings_rate_pct"
              type="number"
              step="0.1"
              value={form.savings_rate_pct}
              onChange={(e) => setForm((f) => ({ ...f, savings_rate_pct: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="investment_return_pct">{t("config.investmentReturn")} (%)</Label>
            <Input
              id="investment_return_pct"
              type="number"
              step="0.1"
              value={form.investment_return_pct}
              onChange={(e) => setForm((f) => ({ ...f, investment_return_pct: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inflation_rate_pct">{t("config.inflationRate")} (%)</Label>
            <Input
              id="inflation_rate_pct"
              type="number"
              step="0.1"
              value={form.inflation_rate_pct}
              onChange={(e) => setForm((f) => ({ ...f, inflation_rate_pct: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time_horizon_months">{t("config.timeHorizon")}</Label>
            <Input
              id="time_horizon_months"
              type="number"
              min="1"
              max="360"
              value={form.time_horizon_months}
              onChange={(e) => setForm((f) => ({ ...f, time_horizon_months: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );

  /* ---- Render ---- */

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <CalculatorIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("title")}</p>
              <p className="text-2xl font-bold">{stats.totalScenarios}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <BarChart3Icon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("results.title")}</p>
              <p className="text-2xl font-bold">{stats.withResults}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add button */}
      <div className="flex items-center justify-between">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(INITIAL_FORM)}>
              <PlusIcon />
              {t("actions.create")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("actions.create")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            {formFields}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={saving || !form.name.trim()}>
                {saving ? tc("saving") : tc("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scenario cards */}
      {scenarios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium">{t("noScenarios")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noScenariosDescription")}</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              {t("actions.create")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => {
            const config = scenario.config as ScenarioConfig;
            return (
              <Card key={scenario.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{scenario.name}</CardTitle>
                    {scenario.results && (
                      <Badge variant="default">
                        <TrendingUpIcon className="mr-1 size-3" />
                        {t("results.title")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scenario.description && (
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <span>
                        {t("config.incomeChange")}: {config.income_change_pct ?? 0}%
                      </span>
                      <span>
                        {t("config.expenseChange")}: {config.expense_change_pct ?? 0}%
                      </span>
                      <span>
                        {t("config.savingsRate")}: {config.savings_rate_pct ?? 20}%
                      </span>
                      <span>
                        {t("config.timeHorizon")}: {config.time_horizon_months ?? 12}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button variant="default" size="xs" onClick={() => handleRun(scenario)}>
                        <PlayIcon />
                        {t("actions.run")}
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => openEdit(scenario)}>
                        <PencilIcon />
                        {tc("edit")}
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => openDelete(scenario)}>
                        <TrashIcon />
                        {tc("delete")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("actions.edit")}</DialogTitle>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleEdit} disabled={saving || !form.name.trim()}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.delete")}</DialogTitle>
            <DialogDescription>{t("confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? tc("loading") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results dialog */}
      <Dialog open={resultsOpen} onOpenChange={setResultsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t("results.title")} — {selectedScenario?.name}
            </DialogTitle>
          </DialogHeader>
          {projection && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Card>
                  <CardContent className="py-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      {t("results.netWorthProjection")}
                    </p>
                    <p className="text-lg font-bold">
                      {formatAmount({
                        amountMinor: projection.netWorth[projection.netWorth.length - 1] ?? 0,
                        currency,
                      })}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      {t("results.savingsProjection")}
                    </p>
                    <p className="text-lg font-bold">
                      {formatAmount({
                        amountMinor: projection.savings[projection.savings.length - 1] ?? 0,
                        currency,
                      })}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-3 text-center">
                    <p className="text-xs text-muted-foreground">{t("results.monthlyBalance")}</p>
                    <p className="text-lg font-bold">
                      {formatAmount({
                        amountMinor:
                          projection.monthlyBalance[projection.monthlyBalance.length - 1] ?? 0,
                        currency,
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Simple text-based projection summary */}
              <div className="max-h-48 space-y-1 overflow-y-auto rounded border p-3 text-xs">
                {projection.months.map((m, i) => (
                  <div key={m} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("config.timeHorizon")}: {m}
                    </span>
                    <span>
                      {formatAmount({ amountMinor: projection.netWorth[i] ?? 0, currency })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResultsOpen(false)}>
              {tc("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
