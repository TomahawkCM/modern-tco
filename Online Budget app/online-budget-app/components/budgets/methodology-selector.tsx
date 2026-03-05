"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BudgetMethodology } from "@/engine";
import { METHODOLOGIES } from "@/engine";

interface MethodologySelectorProps {
  currentMethodology: BudgetMethodology;
}

export function MethodologySelector({ currentMethodology }: MethodologySelectorProps) {
  const t = useTranslations("budgets.methodology");
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(value: string) {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget_methodology: value }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{t("title")}</CardTitle>
        <CardDescription className="text-xs">{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Select defaultValue={currentMethodology} onValueChange={handleChange} disabled={saving}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METHODOLOGIES.map((m) => (
              <SelectItem key={m} value={m}>
                {t(`methods.${m}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 text-xs text-muted-foreground">{t(`hints.${currentMethodology}`)}</p>
      </CardContent>
    </Card>
  );
}
