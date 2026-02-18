"use client";

import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

interface RolloverBadgeProps {
  amount: number;
  className?: string;
}

export function RolloverBadge({ amount, className }: RolloverBadgeProps) {
  const t = useTranslations("budget.rollover");
  const format = useFormatter();

  if (amount === 0) return null;

  const isPositive = amount > 0;
  const formattedAmount = format.number(Math.abs(amount), { style: "currency", currency: "USD" });

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        isPositive ? "text-emerald-400" : "text-amber-400",
        className
      )}
    >
      {isPositive ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
      {isPositive
        ? t("includesRollover", { amount: formattedAmount })
        : t("negativeRollover", { amount: formattedAmount })}
    </span>
  );
}
