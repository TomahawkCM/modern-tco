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
  CreditCardIcon,
  CalendarIcon,
  DollarSignIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { MinorAmount } from "@/engine";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SubscriptionRow {
  id: string;
  user_id: string;
  merchant_name: string;
  amount_minor: number;
  currency: string;
  frequency: string;
  category_id: string | null;
  next_billing_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionListProps {
  subscriptions: SubscriptionRow[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FREQUENCIES = ["weekly", "biweekly", "monthly", "quarterly", "annual"] as const;
type Frequency = (typeof FREQUENCIES)[number];

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

interface SubscriptionFormData {
  merchant_name: string;
  amount: string;
  frequency: Frequency;
  next_billing_date: string;
  notes: string;
  is_active: boolean;
}

const INITIAL_FORM: SubscriptionFormData = {
  merchant_name: "",
  amount: "",
  frequency: "monthly",
  next_billing_date: "",
  notes: "",
  is_active: true,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toMonthly(amount: number, freq: string): number {
  switch (freq) {
    case "weekly":
      return amount * 4.33;
    case "biweekly":
      return amount * 2.17;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "annual":
      return amount / 12;
    default:
      return amount;
  }
}

function isWithinDays(dateStr: string | null, days: number): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SubscriptionList({ subscriptions, currency, formatAmount }: SubscriptionListProps) {
  const t = useTranslations("subscriptions");
  const tc = useTranslations("common");
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionRow | null>(null);
  const [form, setForm] = useState<SubscriptionFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  /* ---- Computed stats ---- */

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.is_active),
    [subscriptions]
  );

  const monthlyCostMinor = useMemo(
    () =>
      Math.round(
        activeSubscriptions.reduce((sum, s) => sum + toMonthly(s.amount_minor, s.frequency), 0)
      ),
    [activeSubscriptions]
  );

  const annualCostMinor = useMemo(() => Math.round(monthlyCostMinor * 12), [monthlyCostMinor]);

  const upcomingCount = useMemo(
    () => activeSubscriptions.filter((s) => isWithinDays(s.next_billing_date, 7)).length,
    [activeSubscriptions]
  );

  /* ---- Pie chart data ---- */

  const pieData = useMemo(() => {
    const byFreq: Record<string, number> = {};
    activeSubscriptions.forEach((s) => {
      const monthly = toMonthly(s.amount_minor, s.frequency);
      byFreq[s.frequency] = (byFreq[s.frequency] ?? 0) + monthly;
    });
    return Object.entries(byFreq).map(([freq, value]) => ({
      name: freq,
      value: Math.round(value),
    }));
  }, [activeSubscriptions]);

  /* ---- CRUD handlers ---- */

  const handleCreate = useCallback(async () => {
    setSaving(true);
    try {
      const amountMinor = Math.round(parseFloat(form.amount || "0") * 100);
      const res = await fetch("/api/user-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_name: form.merchant_name,
          amount_minor: amountMinor,
          currency,
          frequency: form.frequency,
          next_billing_date: form.next_billing_date || null,
          notes: form.notes || null,
          is_active: form.is_active,
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
    if (!selectedSubscription) return;
    setSaving(true);
    try {
      const amountMinor = Math.round(parseFloat(form.amount || "0") * 100);
      const res = await fetch(`/api/user-subscriptions/${selectedSubscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_name: form.merchant_name,
          amount_minor: amountMinor,
          currency,
          frequency: form.frequency,
          next_billing_date: form.next_billing_date || null,
          notes: form.notes || null,
          is_active: form.is_active,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        setSelectedSubscription(null);
        setForm(INITIAL_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, selectedSubscription, currency, router]);

  const handleDelete = useCallback(async () => {
    if (!selectedSubscription) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/user-subscriptions/${selectedSubscription.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setSelectedSubscription(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedSubscription, router]);

  const openEdit = (sub: SubscriptionRow) => {
    setSelectedSubscription(sub);
    setForm({
      merchant_name: sub.merchant_name,
      amount: (sub.amount_minor / 100).toFixed(2),
      frequency: sub.frequency as Frequency,
      next_billing_date: sub.next_billing_date ?? "",
      notes: sub.notes ?? "",
      is_active: sub.is_active,
    });
    setEditOpen(true);
  };

  const openDelete = (sub: SubscriptionRow) => {
    setSelectedSubscription(sub);
    setDeleteOpen(true);
  };

  /* ---- Form fields (shared between create & edit) ---- */

  const formFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="merchant_name">{t("fields.merchantName")}</Label>
        <Input
          id="merchant_name"
          placeholder={t("fields.merchantNamePlaceholder")}
          value={form.merchant_name}
          onChange={(e) => setForm((f) => ({ ...f, merchant_name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">{t("fields.amount")}</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="frequency">{t("fields.frequency")}</Label>
        <Select
          value={form.frequency}
          onValueChange={(v) => setForm((f) => ({ ...f, frequency: v as Frequency }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCIES.map((freq) => (
              <SelectItem key={freq} value={freq}>
                {t(`frequencies.${freq}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="next_billing_date">{t("fields.nextBillingDate")}</Label>
        <Input
          id="next_billing_date"
          type="date"
          value={form.next_billing_date}
          onChange={(e) => setForm((f) => ({ ...f, next_billing_date: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">{t("fields.notes")}</Label>
        <Input
          id="notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="is_active"
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
          className="size-4 rounded border-border"
        />
        <Label htmlFor="is_active">{t("fields.active")}</Label>
      </div>
    </div>
  );

  /* ---- Render ---- */

  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <CreditCardIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.active")}</p>
              <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSignIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.monthly")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: monthlyCostMinor, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingUpIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.annual")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: annualCostMinor, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <CalendarIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.upcoming")}</p>
              <p className="text-2xl font-bold">{upcomingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add subscription button + chart row */}
      <div className="flex items-center justify-between">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(INITIAL_FORM)}>
              <PlusIcon />
              {t("addSubscription")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addSubscription")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            {formFields}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={saving || !form.merchant_name.trim()}>
                {saving ? tc("saving") : tc("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pie chart: cost by frequency */}
      {pieData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("costChart")}</CardTitle>
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
                    label={({ name }: { name?: string }) => (name ? t(`frequencies.${name}`) : "")}
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

      {/* Subscription cards */}
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium">{t("noSubscriptions")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noSubscriptionsDescription")}</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              {t("addSubscription")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="size-5 text-muted-foreground" />
                    <CardTitle className="text-base">{sub.merchant_name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={sub.is_active ? "default" : "secondary"}>
                      {sub.is_active ? t("stats.active") : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{t(`frequencies.${sub.frequency}`)}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">
                  {formatAmount({ amountMinor: sub.amount_minor, currency: sub.currency })}
                </p>
                {sub.next_billing_date && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarIcon className="size-3" />
                    {sub.next_billing_date}
                  </p>
                )}
                {sub.notes && <p className="mt-1 text-sm text-muted-foreground">{sub.notes}</p>}
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" size="xs" onClick={() => openEdit(sub)}>
                    <PencilIcon />
                    {tc("edit")}
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => openDelete(sub)}>
                    <TrashIcon />
                    {tc("delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editSubscription")}</DialogTitle>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleEdit} disabled={saving || !form.merchant_name.trim()}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteSubscription")}</DialogTitle>
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
