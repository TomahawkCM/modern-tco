"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MinorAmount } from "@/engine";

interface CategoryItem {
  readonly categoryKey: string | null;
  readonly total: MinorAmount;
  readonly transactionCount: number;
  readonly percentageOfTotal: number;
}

interface CategoryBreakdownProps {
  categories: CategoryItem[];
  formatAmount: (amt: MinorAmount) => string;
}

export function CategoryBreakdown({
  categories,
  formatAmount,
}: CategoryBreakdownProps) {
  const t = useTranslations("dashboard.categories");
  const expenses = categories.filter((c) => c.total.amountMinor < 0);

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("noExpenses")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((cat) => (
        <Card key={cat.categoryKey ?? "uncategorized"}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">
                  {cat.categoryKey ?? t("uncategorized")}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {t("transactionCount", { count: cat.transactionCount })}
                </span>
              </div>
              <span className="text-sm font-semibold text-red-600">
                {formatAmount({
                  amountMinor: Math.abs(cat.total.amountMinor),
                  currency: cat.total.currency,
                })}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Progress
                value={cat.percentageOfTotal}
                className="h-2 flex-1"
              />
              <span className="text-xs text-muted-foreground">
                {cat.percentageOfTotal.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
