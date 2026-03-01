"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInsight } from "./use-insight";
import { SubscriptionGate } from "./subscription-gate";
import { useTranslations } from "next-intl";

export function AffordabilityCard() {
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const t = useTranslations("insights.affordability");

  const { narrative, loading, error, isSubscriptionRequired } = useInsight(
    url ?? "",
    { enabled: url !== null },
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountMinor = Math.round(parseFloat(amount) * 100);
    if (!itemName.trim() || !Number.isFinite(amountMinor) || amountMinor <= 0) {
      return;
    }
    const params = new URLSearchParams({
      item: itemName.trim(),
      amount_minor: String(amountMinor),
    });
    if (isRecurring) params.set("is_recurring", "true");
    setUrl(`/api/insights/affordability?${params.toString()}`);
  }

  return (
    <SubscriptionGate
      isSubscriptionRequired={isSubscriptionRequired}
      featureName={t("title")}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="afford-item">{t("itemLabel")}</Label>
                <Input
                  id="afford-item"
                  placeholder={t("itemPlaceholder")}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="afford-amount">{t("amountLabel")}</Label>
                <Input
                  id="afford-amount"
                  type="number"
                  placeholder="49.99"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="afford-recurring"
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="afford-recurring">{t("recurringLabel")}</Label>
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? t("checking") : t("checkButton")}
            </Button>
          </form>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {narrative && (
            <p className="whitespace-pre-line text-sm leading-relaxed">
              {narrative}
            </p>
          )}
        </CardContent>
      </Card>
    </SubscriptionGate>
  );
}
