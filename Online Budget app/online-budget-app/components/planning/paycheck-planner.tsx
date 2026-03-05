"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LazyPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "@/components/charts/lazy-charts";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DollarSignIcon,
  WalletIcon,
  MinusCircleIcon,
  XIcon,
} from "lucide-react";
import type { MinorAmount } from "@/engine";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Allocation {
  label: string;
  amount_minor: number;
}

interface PaycheckPlanRow {
  id: string;
  user_id: string;
  schedule_type: string;
  pay_amount_minor: number;
  next_pay_date: string;
  currency: string;
  allocations: Allocation[];
  created_at: string;
  updated_at: string;
}

interface PaycheckPlannerProps {
  plans: PaycheckPlanRow[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SCHEDULE_TYPES = ["weekly", "biweekly", "semimonthly", "monthly"] as const;
type ScheduleType = (typeof SCHEDULE_TYPES)[number];

const PIE_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#ec4899",
  "#14b8a6",
];

interface PaycheckFormData {
  schedule_type: ScheduleType;
  pay_amount: string;
  next_pay_date: string;
}

interface AllocationFormItem {
  label: string;
  amount: string;
}

const INITIAL_FORM: PaycheckFormData = {
  schedule_type: "monthly",
  pay_amount: "",
  next_pay_date: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PaycheckPlanner({ plans, currency, formatAmount }: PaycheckPlannerProps) {
  const t = useTranslations("planning.paycheck");
  const tc = useTranslations("common");
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaycheckPlanRow | null>(null);
  const [form, setForm] = useState<PaycheckFormData>(INITIAL_FORM);
  const [allocations, setAllocations] = useState<AllocationFormItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Use the first plan as the active plan
  const activePlan = plans[0] ?? null;

  /* ---- Computed stats for active plan ---- */

  const planStats = useMemo(() => {
    if (!activePlan) return null;
    const totalAllocated = (activePlan.allocations ?? []).reduce((s, a) => s + a.amount_minor, 0);
    return {
      totalPay: activePlan.pay_amount_minor,
      allocated: totalAllocated,
      unallocated: activePlan.pay_amount_minor - totalAllocated,
    };
  }, [activePlan]);

  /* ---- Pie chart data ---- */

  const pieData = useMemo(() => {
    if (!activePlan || !activePlan.allocations) return [];
    const items = (activePlan.allocations as Allocation[]).map((a) => ({
      name: a.label,
      value: a.amount_minor,
    }));

    // Add unallocated if any
    if (planStats && planStats.unallocated > 0) {
      items.push({
        name: t("allocations.unallocated"),
        value: planStats.unallocated,
      });
    }

    return items;
  }, [activePlan, planStats, t]);

  /* ---- Allocation management ---- */

  const addAllocation = useCallback(() => {
    setAllocations((prev) => [...prev, { label: "", amount: "" }]);
  }, []);

  const removeAllocation = useCallback((index: number) => {
    setAllocations((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateAllocation = useCallback(
    (index: number, field: "label" | "amount", value: string) => {
      setAllocations((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
    },
    []
  );

  /* ---- CRUD handlers ---- */

  const buildAllocationsPayload = useCallback(() => {
    return allocations
      .filter((a) => a.label.trim())
      .map((a) => ({
        label: a.label,
        amount_minor: Math.round(parseFloat(a.amount || "0") * 100),
      }));
  }, [allocations]);

  const handleCreate = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/planning/paycheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule_type: form.schedule_type,
          pay_amount_minor: Math.round(parseFloat(form.pay_amount || "0") * 100),
          next_pay_date: form.next_pay_date,
          currency,
          allocations: buildAllocationsPayload(),
        }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setForm(INITIAL_FORM);
        setAllocations([]);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, currency, router, buildAllocationsPayload]);

  const handleEdit = useCallback(async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/planning/paycheck/${selectedPlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule_type: form.schedule_type,
          pay_amount_minor: Math.round(parseFloat(form.pay_amount || "0") * 100),
          next_pay_date: form.next_pay_date,
          currency,
          allocations: buildAllocationsPayload(),
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        setSelectedPlan(null);
        setForm(INITIAL_FORM);
        setAllocations([]);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, selectedPlan, currency, router, buildAllocationsPayload]);

  const handleDelete = useCallback(async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/planning/paycheck/${selectedPlan.id}`, {
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

  const openEdit = (plan: PaycheckPlanRow) => {
    setSelectedPlan(plan);
    setForm({
      schedule_type: plan.schedule_type as ScheduleType,
      pay_amount: (plan.pay_amount_minor / 100).toFixed(2),
      next_pay_date: plan.next_pay_date,
    });
    setAllocations(
      (plan.allocations ?? []).map((a) => ({
        label: a.label,
        amount: (a.amount_minor / 100).toFixed(2),
      }))
    );
    setEditOpen(true);
  };

  const openDelete = (plan: PaycheckPlanRow) => {
    setSelectedPlan(plan);
    setDeleteOpen(true);
  };

  /* ---- Allocation fields ---- */

  const allocationFields = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{t("allocations.title")}</Label>
        <Button variant="outline" size="sm" onClick={addAllocation} type="button">
          <PlusIcon className="size-3" />
          {t("allocations.addAllocation")}
        </Button>
      </div>
      {allocations.map((alloc, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Input
            placeholder={t("allocations.label")}
            value={alloc.label}
            onChange={(e) => updateAllocation(idx, "label", e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            step="0.01"
            placeholder={t("allocations.amount")}
            value={alloc.amount}
            onChange={(e) => updateAllocation(idx, "amount", e.target.value)}
            className="w-28"
          />
          <Button variant="ghost" size="icon" onClick={() => removeAllocation(idx)} type="button">
            <XIcon className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  /* ---- Form fields ---- */

  const formFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="schedule_type">{t("fields.scheduleType")}</Label>
        <Select
          value={form.schedule_type}
          onValueChange={(v) => setForm((f) => ({ ...f, schedule_type: v as ScheduleType }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCHEDULE_TYPES.map((st) => (
              <SelectItem key={st} value={st}>
                {t(`scheduleTypes.${st}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pay_amount">{t("fields.payAmount")}</Label>
        <Input
          id="pay_amount"
          type="number"
          step="0.01"
          value={form.pay_amount}
          onChange={(e) => setForm((f) => ({ ...f, pay_amount: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="next_pay_date">{t("fields.nextPayDate")}</Label>
        <Input
          id="next_pay_date"
          type="date"
          value={form.next_pay_date}
          onChange={(e) => setForm((f) => ({ ...f, next_pay_date: e.target.value }))}
        />
      </div>
      {allocationFields}
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
                <Button
                  className="mt-4"
                  onClick={() => {
                    setForm(INITIAL_FORM);
                    setAllocations([]);
                  }}
                >
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
                  <Button
                    onClick={handleCreate}
                    disabled={saving || !form.pay_amount || !form.next_pay_date}
                  >
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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSignIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalPay")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: planStats?.totalPay ?? 0, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <WalletIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.allocated")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: planStats?.allocated ?? 0, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <MinusCircleIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.unallocatedAmount")}</p>
              <p
                className={`text-2xl font-bold ${(planStats?.unallocated ?? 0) < 0 ? "text-red-600" : ""}`}
              >
                {formatAmount({ amountMinor: Math.abs(planStats?.unallocated ?? 0), currency })}
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

      {/* Allocation breakdown: pie chart + list */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie chart */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("allocations.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LazyPieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name }: { name?: string }) => name ?? ""}
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value != null
                          ? formatAmount({ amountMinor: Math.round(value), currency })
                          : ""
                      }
                    />
                  </LazyPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Allocation list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("allocations.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {(activePlan.allocations ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noPlanDescription")}</p>
            ) : (
              <div className="space-y-2">
                {(activePlan.allocations as Allocation[]).map((alloc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{alloc.label}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatAmount({ amountMinor: alloc.amount_minor, currency })}
                    </span>
                  </div>
                ))}
                {planStats && planStats.unallocated > 0 && (
                  <div className="flex items-center justify-between rounded-md border border-dashed border-border px-3 py-2">
                    <span className="text-sm text-muted-foreground">
                      {t("allocations.unallocated")}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatAmount({ amountMinor: planStats.unallocated, currency })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("editPlan")}</DialogTitle>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button
              onClick={handleEdit}
              disabled={saving || !form.pay_amount || !form.next_pay_date}
            >
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
