"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircleIcon, SkipForwardIcon, TagIcon, InboxIcon, ListIcon } from "lucide-react";
import type { MinorAmount } from "@/engine";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TransactionRow {
  id: string;
  merchant_name: string | null;
  amount_minor: number;
  currency: string;
  transaction_date: string;
  description: string | null;
}

interface CategoryRow {
  id: string;
  key: string;
  type: "income" | "expense" | "transfer";
}

interface ReviewDashboardProps {
  transactions: TransactionRow[];
  categories: CategoryRow[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ReviewDashboard({
  transactions,
  categories,
  currency,
  formatAmount,
}: ReviewDashboardProps) {
  const t = useTranslations("review");
  const tc = useTranslations("common");
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "list">("single");
  const [listCategories, setListCategories] = useState<Record<string, string>>({});

  const remaining = transactions.length - currentIndex;
  const currentTx = transactions[currentIndex] ?? null;

  /* ---- Handlers ---- */

  const handleCategorize = useCallback(async () => {
    if (!currentTx || !selectedCategory) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/transactions/${currentTx.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: selectedCategory }),
      });
      if (res.ok) {
        setSelectedCategory("");
        setCurrentIndex((i) => i + 1);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [currentTx, selectedCategory, router]);

  const handleSkip = useCallback(() => {
    setSelectedCategory("");
    setCurrentIndex((i) => i + 1);
  }, []);

  const handleBulkCategorize = useCallback(
    async (txId: string, categoryId: string) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/transactions/${txId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category_id: categoryId }),
        });
        if (res.ok) {
          setListCategories((prev) => {
            const next = { ...prev };
            delete next[txId];
            return next;
          });
          router.refresh();
        }
      } finally {
        setSaving(false);
      }
    },
    [router]
  );

  /* ---- All done ---- */

  if (transactions.length === 0 || (viewMode === "single" && currentIndex >= transactions.length)) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <CheckCircleIcon className="mx-auto mb-4 size-12 text-emerald-500" />
          <p className="text-lg font-semibold">{t("queue.allDone")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("queue.allDoneDescription")}</p>
        </CardContent>
      </Card>
    );
  }

  /* ---- Single-transaction view ---- */

  if (viewMode === "single") {
    return (
      <div className="space-y-6">
        {/* Queue stats */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            <InboxIcon className="mr-1 size-3" />
            {t("queue.remaining", { count: remaining })}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setViewMode("list")}>
            <ListIcon />
            {t("actions.bulkCategorize")}
          </Button>
        </div>

        {/* Current transaction card */}
        {currentTx && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("queue.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("fields.merchant")}</p>
                  <p className="font-medium">
                    {currentTx.merchant_name ?? currentTx.description ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("fields.amount")}</p>
                  <p className="font-medium">
                    {formatAmount({
                      amountMinor: currentTx.amount_minor,
                      currency: currentTx.currency || currency,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("fields.date")}</p>
                  <p className="font-medium">{currentTx.transaction_date}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">{t("fields.category")}</p>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCategorize} disabled={saving || !selectedCategory}>
                  <TagIcon />
                  {saving ? tc("saving") : t("actions.categorize")}
                </Button>
                <Button variant="outline" onClick={handleSkip}>
                  <SkipForwardIcon />
                  {t("actions.skip")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  /* ---- List view ---- */

  return (
    <div className="space-y-6">
      {/* Queue stats */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          <InboxIcon className="mr-1 size-3" />
          {t("queue.remaining", { count: transactions.length })}
        </Badge>
        <Button variant="ghost" size="sm" onClick={() => setViewMode("single")}>
          {t("queue.title")}
        </Button>
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        {transactions.map((tx) => (
          <Card key={tx.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{tx.merchant_name ?? tx.description ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{tx.transaction_date}</p>
                </div>
                <span className="font-medium">
                  {formatAmount({
                    amountMinor: tx.amount_minor,
                    currency: tx.currency || currency,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={listCategories[tx.id] ?? ""}
                  onValueChange={(v) => setListCategories((prev) => ({ ...prev, [tx.id]: v }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t("fields.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={saving || !listCategories[tx.id]}
                  onClick={() => handleBulkCategorize(tx.id, listCategories[tx.id] ?? "")}
                >
                  <TagIcon />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
