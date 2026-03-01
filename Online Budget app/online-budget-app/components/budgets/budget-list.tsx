"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { BudgetProgressItem, MinorAmount } from "@/engine";

interface BudgetListProps {
  items: BudgetProgressItem[];
  currency: string;
  formatAmount: (amt: MinorAmount) => string;
}

export function BudgetList({ items, currency, formatAmount }: BudgetListProps) {
  const t = useTranslations("budgets");

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {t("noBudgets")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((bp) => (
        <Card key={bp.categoryKey}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {bp.categoryKey}
              </CardTitle>
              <Badge
                variant={
                  bp.isOverBudget
                    ? "destructive"
                    : bp.percentUsed > 80
                      ? "secondary"
                      : "default"
                }
              >
                {bp.isOverBudget
                  ? t("overBudget")
                  : `${bp.percentUsed.toFixed(0)}%`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min(bp.percentUsed, 100)} className="mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {t("spent", { amount: formatAmount({ amountMinor: bp.spentMinor, currency }) })}
              </span>
              <span>
                {t("limit", { amount: formatAmount({ amountMinor: bp.limitMinor, currency }) })}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("remaining", { amount: formatAmount({
                amountMinor: Math.max(bp.limitMinor - bp.spentMinor, 0),
                currency,
              }) })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
