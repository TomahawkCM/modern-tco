"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import type { MinorAmount } from "@/engine";

interface IncomeExpenseSummaryProps {
  income: MinorAmount;
  expense: MinorAmount;
  net: MinorAmount;
  transactionCount: number;
  savingsRate: number;
  formatAmount: (amt: MinorAmount) => string;
}

export function IncomeExpenseSummary({
  income,
  expense,
  net,
  transactionCount,
  savingsRate,
  formatAmount,
}: IncomeExpenseSummaryProps) {
  const t = useTranslations("dashboard.incomeExpense");

  return (
    <div>
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("income")}</p>
            <p className="text-xl font-semibold text-green-600">
              {formatAmount(income)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("expenses")}</p>
            <p className="text-xl font-semibold text-red-600">
              {formatAmount(expense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("net")}</p>
            <p
              className={`text-xl font-semibold ${net.amountMinor >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatAmount(net)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span>{t("transactionCount", { count: transactionCount })}</span>
        <span>{t("savingsRate", { rate: savingsRate.toFixed(1) })}</span>
      </div>
    </div>
  );
}
