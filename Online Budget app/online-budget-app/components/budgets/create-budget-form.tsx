"use client";

import { useState } from "react";
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

interface Category {
  id: string;
  key: string;
}

interface CreateBudgetFormProps {
  categories: Category[];
  currency: string;
}

export function CreateBudgetForm({
  categories,
  currency,
}: CreateBudgetFormProps) {
  const t = useTranslations("budgets.create");
  const tc = useTranslations("common");
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const amountMajor = parseFloat(formData.get("amount") as string);

    if (!categoryId || isNaN(amountMajor) || amountMajor <= 0) {
      setError(t("error"));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: categoryId,
          amount_minor: Math.round(amountMajor * 100),
          currency,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Failed to create budget");
        return;
      }

      router.refresh();
    } catch {
      setError(tc("networkError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="category_id" className="text-xs">
              {t("category")}
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectCategory")} />
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
          <div className="w-32">
            <Label htmlFor="amount" className="text-xs">
              {t("monthlyLimit", { currency })}
            </Label>
            <Input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting ? t("saving") : t("save")}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
