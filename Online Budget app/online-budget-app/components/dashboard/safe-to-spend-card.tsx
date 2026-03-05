"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import type { MinorAmount, SafeToSpendResult } from "@/engine";

interface SafeToSpendCardProps {
  result: SafeToSpendResult;
  formatAmount: (amt: MinorAmount) => string;
}

export function SafeToSpendCard({ result, formatAmount }: SafeToSpendCardProps) {
  const t = useTranslations("dashboard.safeToSpend");

  const monthlyAmount: MinorAmount = {
    amountMinor: result.monthlyMinor,
    currency: result.currency,
  };
  const dailyAmount: MinorAmount = {
    amountMinor: result.dailyMinor,
    currency: result.currency,
  };

  return (
    <Card>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">{t("dailyLabel")}</p>
          <p
            className={`text-3xl font-bold ${result.isOverspent ? "text-red-600" : "text-green-600"}`}
          >
            {formatAmount(dailyAmount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("perDay", { days: result.remainingDays })}
          </p>
        </div>
        <div className="border-t pt-3">
          <p className="text-sm text-muted-foreground">{t("monthlyLabel")}</p>
          <p
            className={`text-lg font-semibold ${result.isOverspent ? "text-red-600" : "text-foreground"}`}
          >
            {formatAmount(monthlyAmount)}
          </p>
        </div>
        {result.isOverspent && (
          <p role="alert" className="text-xs text-red-600">
            {t("overspentWarning")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
