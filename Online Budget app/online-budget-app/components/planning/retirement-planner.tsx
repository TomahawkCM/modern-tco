"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  LazyAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "@/components/charts/lazy-charts";
import { calculators } from "@/engine";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  DollarSignIcon,
  TrendingUpIcon,
  ClockIcon,
} from "lucide-react";
import type { MinorAmount } from "@/engine";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RetirementPlanRow {
  id: string;
  user_id: string;
  current_age: number;
  retirement_age: number;
  current_savings_minor: number;
  monthly_contribution_minor: number;
  expected_return_percent: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RetirementPlannerProps {
  plans: RetirementPlanRow[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

interface RetirementFormData {
  current_age: string;
  retirement_age: string;
  current_savings: string;
  monthly_contribution: string;
  expected_return: string;
  notes: string;
}

const INITIAL_FORM: RetirementFormData = {
  current_age: "30",
  retirement_age: "65",
  current_savings: "0",
  monthly_contribution: "500",
  expected_return: "7.0",
  notes: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RetirementPlanner({ plans, currency, formatAmount }: RetirementPlannerProps) {
  const t = useTranslations("planning.retirement");
  const tc = useTranslations("common");
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<RetirementPlanRow | null>(null);
  const [form, setForm] = useState<RetirementFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  // Use the first plan (most recent) as the active plan
  const activePlan = plans[0] ?? null;

  /* ---- Projection calculation ---- */

  const projection = useMemo(() => {
    if (!activePlan) return null;

    const result = calculators.calculateRetirement({
      currentAge: activePlan.current_age,
      retirementAge: activePlan.retirement_age,
      currentSavings: activePlan.current_savings_minor / 100,
      monthlyContribution: activePlan.monthly_contribution_minor / 100,
      desiredMonthlyIncome: 4000, // default desired income
      preRetirementReturn: activePlan.expected_return_percent,
      postRetirementReturn: 5.0,
      inflationRate: 3.0,
      lifeExpectancy: 90,
      socialSecurityMonthly: 0,
      socialSecurityStartAge: 67,
    });

    return result;
  }, [activePlan]);

  /* ---- Chart data ---- */

  const chartData = useMemo(() => {
    if (!projection) return [];
    return projection.timeline
      .filter((p) => p.phase === "accumulation")
      .map((p) => ({
        age: p.age,
        savings: Math.round(p.balance),
      }));
  }, [projection]);

  /* ---- CRUD handlers ---- */

  const handleCreate = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/planning/retirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_age: parseInt(form.current_age) || 30,
          retirement_age: parseInt(form.retirement_age) || 65,
          current_savings_minor: Math.round(parseFloat(form.current_savings || "0") * 100),
          monthly_contribution_minor: Math.round(
            parseFloat(form.monthly_contribution || "0") * 100
          ),
          expected_return_percent: parseFloat(form.expected_return || "7.0"),
          currency,
          notes: form.notes || null,
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
  }, [form, currency, router]);

  const handleEdit = useCallback(async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/planning/retirement/${selectedPlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_age: parseInt(form.current_age) || 30,
          retirement_age: parseInt(form.retirement_age) || 65,
          current_savings_minor: Math.round(parseFloat(form.current_savings || "0") * 100),
          monthly_contribution_minor: Math.round(
            parseFloat(form.monthly_contribution || "0") * 100
          ),
          expected_return_percent: parseFloat(form.expected_return || "7.0"),
          currency,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        setSelectedPlan(null);
        setForm(INITIAL_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, selectedPlan, currency, router]);

  const handleDelete = useCallback(async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/planning/retirement/${selectedPlan.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setSelectedPlan(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedPlan, router]);

  const openEdit = (plan: RetirementPlanRow) => {
    setSelectedPlan(plan);
    setForm({
      current_age: plan.current_age.toString(),
      retirement_age: plan.retirement_age.toString(),
      current_savings: (plan.current_savings_minor / 100).toFixed(2),
      monthly_contribution: (plan.monthly_contribution_minor / 100).toFixed(2),
      expected_return: plan.expected_return_percent.toString(),
      notes: plan.notes ?? "",
    });
    setEditOpen(true);
  };

  const openDelete = (plan: RetirementPlanRow) => {
    setSelectedPlan(plan);
    setDeleteOpen(true);
  };

  /* ---- Form fields ---- */

  const formFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="current_age">{t("fields.currentAge")}</Label>
          <Input
            id="current_age"
            type="number"
            min={1}
            max={120}
            value={form.current_age}
            onChange={(e) => setForm((f) => ({ ...f, current_age: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retirement_age">{t("fields.retirementAge")}</Label>
          <Input
            id="retirement_age"
            type="number"
            min={1}
            max={120}
            value={form.retirement_age}
            onChange={(e) => setForm((f) => ({ ...f, retirement_age: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="current_savings">{t("fields.currentSavings")}</Label>
        <Input
          id="current_savings"
          type="number"
          step="0.01"
          value={form.current_savings}
          onChange={(e) => setForm((f) => ({ ...f, current_savings: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="monthly_contribution">{t("fields.monthlyContribution")}</Label>
        <Input
          id="monthly_contribution"
          type="number"
          step="0.01"
          value={form.monthly_contribution}
          onChange={(e) => setForm((f) => ({ ...f, monthly_contribution: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expected_return">{t("fields.expectedReturn")}</Label>
        <Input
          id="expected_return"
          type="number"
          step="0.1"
          min={0}
          max={100}
          value={form.expected_return}
          onChange={(e) => setForm((f) => ({ ...f, expected_return: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">{t("fields.notes")}</Label>
        <Input
          id="notes"
          placeholder={t("fields.notesPlaceholder")}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
    </div>
  );

  /* ---- Empty state ---- */

  if (!activePlan) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium">{t("noPlan")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noPlanDescription")}</p>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4" onClick={() => setForm(INITIAL_FORM)}>
                  <PlusIcon />
                  {t("addPlan")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("addPlan")}</DialogTitle>
                  <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>
                {formFields}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    {tc("cancel")}
                  </Button>
                  <Button onClick={handleCreate} disabled={saving}>
                    {saving ? tc("saving") : tc("create")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Render with plan ---- */

  const yearsToRetirement = Math.max(0, activePlan.retirement_age - activePlan.current_age);
  const estimatedMonthlyIncome = projection
    ? Math.round(projection.balanceAtRetirement / (25 * 12))
    : 0;

  return (
    <div className="space-y-6">
      {/* Projection stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSignIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("projection.savingsAtRetirement")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({
                  amountMinor: Math.round((projection?.balanceAtRetirement ?? 0) * 100),
                  currency,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <ClockIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("projection.yearsToRetirement")}</p>
              <p className="text-2xl font-bold">{yearsToRetirement}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingUpIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("projection.monthlyIncome")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({
                  amountMinor: estimatedMonthlyIncome * 100,
                  currency,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <CalendarIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("projection.projectedSavings")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({
                  amountMinor: activePlan.current_savings_minor,
                  currency,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => openEdit(activePlan)}>
          <PencilIcon />
          {t("editPlan")}
        </Button>
        <Button variant="outline" onClick={() => openDelete(activePlan)}>
          <TrashIcon />
          {t("deletePlan")}
        </Button>
      </div>

      {/* Projection chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("chart.projectionChart")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LazyAreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="age"
                    label={{ value: t("chart.age"), position: "insideBottom", offset: -5 }}
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
                      t("chart.savings"),
                    ]}
                    labelFormatter={(label: number) => `${t("chart.age")}: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name={t("chart.savings")}
                  />
                </LazyAreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan details */}
      {activePlan.notes && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">{activePlan.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editPlan")}</DialogTitle>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deletePlan")}</DialogTitle>
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
    </div>
  );
}
