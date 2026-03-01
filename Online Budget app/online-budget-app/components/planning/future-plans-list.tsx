"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TargetIcon,
  DollarSignIcon,
  PiggyBankIcon,
  CheckCircleIcon,
} from "lucide-react";
import type { MinorAmount } from "@/engine";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FuturePurchaseRow {
  id: string;
  user_id: string;
  name: string;
  target_amount_minor: number;
  current_savings_minor: number;
  monthly_savings_minor: number;
  target_date: string | null;
  priority: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface FuturePlansListProps {
  purchases: FuturePurchaseRow[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PRIORITIES = ["low", "medium", "high"] as const;
type Priority = (typeof PRIORITIES)[number];

interface FutureFormData {
  name: string;
  target_amount: string;
  current_savings: string;
  monthly_savings: string;
  target_date: string;
  priority: Priority;
}

const INITIAL_FORM: FutureFormData = {
  name: "",
  target_amount: "",
  current_savings: "0",
  monthly_savings: "0",
  target_date: "",
  priority: "medium",
};

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FuturePlansList({ purchases, currency, formatAmount }: FuturePlansListProps) {
  const t = useTranslations("planning.future");
  const tc = useTranslations("common");
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<FuturePurchaseRow | null>(null);
  const [form, setForm] = useState<FutureFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  /* ---- Computed stats ---- */

  const stats = useMemo(() => {
    const totalTarget = purchases.reduce((s, p) => s + p.target_amount_minor, 0);
    const totalSaved = purchases.reduce((s, p) => s + p.current_savings_minor, 0);
    const onTrack = purchases.filter((p) => {
      if (!p.target_date || p.monthly_savings_minor <= 0) return false;
      const remaining = p.target_amount_minor - p.current_savings_minor;
      if (remaining <= 0) return true;
      const monthsNeeded = remaining / p.monthly_savings_minor;
      const now = new Date();
      const target = new Date(p.target_date);
      const monthsAvailable =
        (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
      return monthsNeeded <= monthsAvailable;
    }).length;
    return { totalGoals: purchases.length, totalTarget, totalSaved, onTrack };
  }, [purchases]);

  /* ---- CRUD handlers ---- */

  const handleCreate = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/planning/future", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          target_amount_minor: Math.round(parseFloat(form.target_amount || "0") * 100),
          current_savings_minor: Math.round(parseFloat(form.current_savings || "0") * 100),
          monthly_savings_minor: Math.round(parseFloat(form.monthly_savings || "0") * 100),
          target_date: form.target_date || null,
          priority: form.priority,
          currency,
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
    if (!selectedPurchase) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/planning/future/${selectedPurchase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          target_amount_minor: Math.round(parseFloat(form.target_amount || "0") * 100),
          current_savings_minor: Math.round(parseFloat(form.current_savings || "0") * 100),
          monthly_savings_minor: Math.round(parseFloat(form.monthly_savings || "0") * 100),
          target_date: form.target_date || null,
          priority: form.priority,
          currency,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        setSelectedPurchase(null);
        setForm(INITIAL_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, selectedPurchase, currency, router]);

  const handleDelete = useCallback(async () => {
    if (!selectedPurchase) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/planning/future/${selectedPurchase.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setSelectedPurchase(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedPurchase, router]);

  const openEdit = (purchase: FuturePurchaseRow) => {
    setSelectedPurchase(purchase);
    setForm({
      name: purchase.name,
      target_amount: (purchase.target_amount_minor / 100).toFixed(2),
      current_savings: (purchase.current_savings_minor / 100).toFixed(2),
      monthly_savings: (purchase.monthly_savings_minor / 100).toFixed(2),
      target_date: purchase.target_date ?? "",
      priority: (purchase.priority as Priority) ?? "medium",
    });
    setEditOpen(true);
  };

  const openDelete = (purchase: FuturePurchaseRow) => {
    setSelectedPurchase(purchase);
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
        <Label htmlFor="target_amount">{t("fields.targetAmount")}</Label>
        <Input
          id="target_amount"
          type="number"
          step="0.01"
          value={form.target_amount}
          onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))}
        />
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
        <Label htmlFor="monthly_savings">{t("fields.monthlySavings")}</Label>
        <Input
          id="monthly_savings"
          type="number"
          step="0.01"
          value={form.monthly_savings}
          onChange={(e) => setForm((f) => ({ ...f, monthly_savings: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="target_date">{t("fields.targetDate")}</Label>
        <Input
          id="target_date"
          type="date"
          value={form.target_date}
          onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority">{t("fields.priority")}</Label>
        <Select
          value={form.priority}
          onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Priority }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {t(`priorities.${p}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  /* ---- Render ---- */

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <TargetIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalGoals")}</p>
              <p className="text-2xl font-bold">{stats.totalGoals}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSignIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalTarget")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: stats.totalTarget, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <PiggyBankIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalSaved")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: stats.totalSaved, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircleIcon className="size-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.onTrack")}</p>
              <p className="text-2xl font-bold">{stats.onTrack}</p>
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
              {t("addGoal")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addGoal")}</DialogTitle>
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

      {/* Goal cards */}
      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium">{t("noGoals")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noGoalsDescription")}</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              {t("addGoal")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purchases.map((purchase) => {
            const percent =
              purchase.target_amount_minor > 0
                ? Math.min(
                    100,
                    (purchase.current_savings_minor / purchase.target_amount_minor) * 100
                  )
                : 0;

            return (
              <Card key={purchase.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{purchase.name}</CardTitle>
                    <Badge variant={PRIORITY_VARIANT[purchase.priority ?? "medium"] ?? "default"}>
                      {t(`priorities.${purchase.priority ?? "medium"}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("progress")}</span>
                      <span className="font-medium">
                        {t("percentComplete", { percent: Math.round(percent) })}
                      </span>
                    </div>
                    <Progress value={percent} className="h-2" />

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatAmount({ amountMinor: purchase.current_savings_minor, currency })}
                      </span>
                      <span className="font-medium">
                        {formatAmount({ amountMinor: purchase.target_amount_minor, currency })}
                      </span>
                    </div>

                    {purchase.monthly_savings_minor > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formatAmount({ amountMinor: purchase.monthly_savings_minor, currency })}/mo
                      </p>
                    )}

                    {purchase.target_date && (
                      <p className="text-xs text-muted-foreground">
                        {t("estimatedDate")}: {purchase.target_date}
                      </p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button variant="ghost" size="xs" onClick={() => openEdit(purchase)}>
                        <PencilIcon />
                        {tc("edit")}
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => openDelete(purchase)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editGoal")}</DialogTitle>
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
            <DialogTitle>{t("deleteGoal")}</DialogTitle>
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
