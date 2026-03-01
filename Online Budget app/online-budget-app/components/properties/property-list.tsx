"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  PlusIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  DollarSignIcon,
  TrendingUpIcon,
  LandmarkIcon,
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

interface PropertyListProps {
  properties: PropertyRow[];
  totalValue: number;
  totalEquity: number;
  totalMortgage: number;
  totalMonthlyExpenses: number;
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

const INITIAL_FORM: PropertyFormData = {
  address: "",
  purchase_price: "",
  current_value: "",
  mortgage_balance: "",
  monthly_expenses: "",
  purchase_date: "",
  currency: "USD",
  notes: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyList({
  properties,
  totalValue,
  totalEquity,
  totalMortgage,
  totalMonthlyExpenses,
  currency,
  formatAmount,
}: PropertyListProps) {
  const t = useTranslations("properties");
  const tc = useTranslations("common");
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRow | null>(null);
  const [form, setForm] = useState<PropertyFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  /* ---- CRUD handlers ---- */

  const handleCreate = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
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
        setCreateOpen(false);
        setForm(INITIAL_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, router]);

  const handleEdit = useCallback(async () => {
    if (!selectedProperty) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${selectedProperty.id}`, {
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
        setSelectedProperty(null);
        setForm(INITIAL_FORM);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [form, selectedProperty, router]);

  const handleDelete = useCallback(async () => {
    if (!selectedProperty) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${selectedProperty.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setSelectedProperty(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [selectedProperty, router]);

  const openEdit = (property: PropertyRow) => {
    setSelectedProperty(property);
    setForm({
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
    setEditOpen(true);
  };

  const openDelete = (property: PropertyRow) => {
    setSelectedProperty(property);
    setDeleteOpen(true);
  };

  /* ---- Shared form fields ---- */

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
      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <HomeIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalValue")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: totalValue, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingUpIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalEquity")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: totalEquity, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <LandmarkIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.totalMortgage")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: totalMortgage, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSignIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("stats.monthlyExpenses")}</p>
              <p className="text-2xl font-bold">
                {formatAmount({ amountMinor: totalMonthlyExpenses, currency })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add property button */}
      <div className="flex items-center justify-between">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({ ...INITIAL_FORM, currency })}>
              <PlusIcon />
              {t("addProperty")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addProperty")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            {formFields}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={saving || !form.address.trim()}>
                {saving ? tc("saving") : tc("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Property cards */}
      {properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium">{t("noProperties")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noPropertiesDescription")}</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              {t("addProperty")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const equity =
              (property.current_value_minor ?? 0) - (property.mortgage_balance_minor ?? 0);
            return (
              <Card key={property.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/properties/${property.id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <HomeIcon className="size-5 text-muted-foreground" />
                      <CardTitle className="text-base">{property.address}</CardTitle>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold">
                    {formatAmount({
                      amountMinor: property.current_value_minor ?? 0,
                      currency: property.currency,
                    })}
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>
                      {t("equity")}:{" "}
                      {formatAmount({ amountMinor: equity, currency: property.currency })}
                    </p>
                    {property.mortgage_balance_minor != null &&
                      property.mortgage_balance_minor > 0 && (
                        <p>
                          {t("fields.mortgageBalance")}:{" "}
                          {formatAmount({
                            amountMinor: property.mortgage_balance_minor,
                            currency: property.currency,
                          })}
                        </p>
                      )}
                    {property.monthly_expenses_minor != null &&
                      property.monthly_expenses_minor > 0 && (
                        <p>
                          {t("fields.monthlyExpenses")}:{" "}
                          {formatAmount({
                            amountMinor: property.monthly_expenses_minor,
                            currency: property.currency,
                          })}
                        </p>
                      )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" size="xs" onClick={() => openEdit(property)}>
                      <PencilIcon />
                      {tc("edit")}
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => openDelete(property)}>
                      <TrashIcon />
                      {tc("delete")}
                    </Button>
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
