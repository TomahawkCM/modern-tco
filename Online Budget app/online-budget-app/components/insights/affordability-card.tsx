"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInsight } from "./use-insight";
import { SubscriptionGate } from "./subscription-gate";

export function AffordabilityCard() {
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

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
      featureName="Affordability Check"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Affordability Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="afford-item">Item or expense</Label>
                <Input
                  id="afford-item"
                  placeholder="e.g. Gym membership"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="afford-amount">Amount</Label>
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
              <Label htmlFor="afford-recurring">This is a recurring monthly expense</Label>
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Checking..." : "Check Affordability"}
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
