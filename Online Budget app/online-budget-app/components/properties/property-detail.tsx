"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  LazyPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "@/components/charts/lazy-charts";
import {
  PencilIcon,
  TrashIcon,
  HomeIcon,
  DollarSignIcon,
  ArrowLeftIcon,
  TrendingUpIcon,
  LandmarkIcon,
  CalendarIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PropertyRow {
  id: string;
  user_id: string;
  address: string;
  purchase_price_minor: number | null;
  current_value_minor: number | null;
  mortgage_balance_minor: number | null;
  monthly_expenses_minor: number | null;
  purchase_date: string | null;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PropertyDetailProps {
  property: PropertyRow;
  equity: number;
  currency: string;
  formatAmount: (amt: { amountMinor: number; currency: string }) => string;
}

/* ------------------------------------------------------------------ */
/*  Form                                                               */
/* ------------------------------------------------------------------ */

interface PropertyFormData {
  address: string;
  purchase_price: string;
  current_value: string;
  mortgage_balance: string;
  monthly_expenses: string;
  purchase_date: string;
  currency: string;
  notes: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PIE_COLORS = ["#10b981", "#6366f1"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyDetail({ property, equity, formatAmount }: PropertyDetailProps) {
  const t = useTranslations("properties");
  const tc = useTranslations("common");
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PropertyFormData>({
    address: property.address,
    purchase_price: property.purchase_price_minor
      ? (property.purchase_price_minor / 100).toFixed(2)
      : "",
    current_value: property.current_value_minor
      ? (property.current_value_minor / 100).toFixed(2)
      : "",
    mortgage_balance: property.mortgage_balance_minor
      ? (property.mortgage_balance_minor / 100).toFixed(2)
      : "",
    monthly_expenses: property.monthly_expenses_minor
      ? (property.monthly_expenses_minor / 100).toFixed(2)
      : "",
    purchase_date: property.purchase_date ?? "",
    currency: property.currency,
    notes: property.notes ?? "",
  });

  /* ---- CRUD handlers ---- */

  const handleEdit = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: form.address,
          purchase_price_minor: Math.round(parseFloat(form.purchase_price || "0") * 100),
          current_value_minor: Math.round(parseFloat(form.current_value || "0") * 100),
          mortgage_balance_minor: Math.round(parseFloat(form.mortgage_balance || "0") * 100),
          monthly_expenses_minor: Math.round(parseFloat(form.monthly_expenses || "0") * 100),
          purchase_date: form.purchase_date || null,
          currency: form.currency,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, property.id, router]);

  const handleDelete = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        router.push("/properties");
      }
    } finally {
      setSaving(false);
    }
  }, [property.id, router]);

  /* ---- Pie chart data ---- */

  const mortgageMinor = property.mortgage_balance_minor ?? 0;
  const equityClamped = Math.max(equity, 0);
  const pieData =
    equityClamped > 0 || mortgageMinor > 0
      ? [
          { name: t("equity"), value: equityClamped },
          { name: t("fields.mortgageBalance"), value: mortgageMinor },
        ]
      : [];

  /* ---- Form fields ---- */

  const formFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">{t("fields.address")}</Label>
        <Input
          id="address"
          placeholder={t("fields.addressPlaceholder")}
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="purchase_price">{t("fields.purchasePrice")}</Label>
        <Input
          id="purchase_price"
          type="number"
          step="0.01"
          value={form.purchase_price}
          onChange={(e) => setForm((f) => ({ ...f, purchase_price: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="current_value">{t("fields.currentValue")}</Label>
        <Input
          id="current_value"
          type="number"
          step="0.01"
          value={form.current_value}
          onChange={(e) => setForm((f) => ({ ...f, current_value: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mortgage_balance">{t("fields.mortgageBalance")}</Label>
        <Input
          id="mortgage_balance"
          type="number"
          step="0.01"
          value={form.mortgage_balance}
          onChange={(e) => setForm((f) => ({ ...f, mortgage_balance: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="monthly_expenses">{t("fields.monthlyExpenses")}</Label>
        <Input
          id="monthly_expenses"
          type="number"
          step="0.01"
          value={form.monthly_expenses}
          onChange={(e) => setForm((f) => ({ ...f, monthly_expenses: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="purchase_date">{t("fields.purchaseDate")}</Label>
        <Input
          id="purchase_date"
          type="date"
          value={form.purchase_date}
          onChange={(e) => setForm((f) => ({ ...f, purchase_date: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">{t("fields.currency")}</Label>
        <Input
          id="currency"
          maxLength={3}
          value={form.currency}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              currency: e.target.value.toUpperCase(),
            }))
          }
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
    </div>
  );

  /* ---- Render ---- */

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/properties"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        {tc("back")}
      </Link>

      {/* Property info card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <HomeIcon className="size-5 text-muted-foreground" />
              <div>
                <CardTitle>{property.address}</CardTitle>
                {property.purchase_date && (
                  <CardDescription className="flex items-center gap-1">
                    <CalendarIcon className="size-3" />
                    {property.purchase_date}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <PencilIcon />
                {tc("edit")}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                <TrashIcon />
                {tc("delete")}
              </Button>
            </div>
          </div>
        </CardHeader>
        {property.notes && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{property.notes}</p>
          </CardContent>
        )}
      </Card>

      {/* Financial stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <HomeIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("fields.currentValue")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({
                  amountMinor: property.current_value_minor ?? 0,
                  currency: property.currency,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSignIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("fields.purchasePrice")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({
                  amountMinor: property.purchase_price_minor ?? 0,
                  currency: property.currency,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <LandmarkIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("fields.mortgageBalance")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({
                  amountMinor: property.mortgage_balance_minor ?? 0,
                  currency: property.currency,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingUpIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("equity")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: equity, currency: property.currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSignIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("fields.monthlyExpenses")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({
                  amountMinor: property.monthly_expenses_minor ?? 0,
                  currency: property.currency,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equity breakdown pie chart */}
      {pieData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("equity")}</CardTitle>
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
                        ? formatAmount({
                            amountMinor: Math.round(value),
                            currency: property.currency,
                          })
                        : ""
                    }
                  />
                </LazyPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editProperty")}</DialogTitle>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleEdit} disabled={saving || !form.address.trim()}>
              {saving ? tc("saving") : tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteProperty")}</DialogTitle>
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
