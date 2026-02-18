"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import { getRefundSummary } from "@/lib/refunds/refund-tracker";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface RefundSummaryProps {
  startDate: Date;
  endDate: Date;
  className?: string;
}

export function RefundSummary({ startDate, endDate, className }: RefundSummaryProps) {
  const t = useTranslations("budget.refunds");
  const format = useFormatter();
  const currency = useDefaultCurrency();

  const [summary, setSummary] = useState<{
    gross: number;
    refunds: number;
    net: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getRefundSummary(startDate, endDate);
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to load refund summary:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const fmtCurrency = (v: number) => format.number(v, { style: "currency", currency });

  return (
    <GlassCard className={cn("p-5", className)}>
      <h3 className="mb-4 text-base font-semibold text-white">{t("grossVsNet")}</h3>

      {summary === null ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-slate-700/50" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Gross spending */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">{t("gross")}</span>
            <span className="text-sm font-medium text-white">{fmtCurrency(summary.gross)}</span>
          </div>

          {/* Refunds received */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">{t("refundsTotal")}</span>
            <span className="text-sm font-medium text-emerald-400">
              -{fmtCurrency(summary.refunds)}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700/50" />

          {/* Net spending */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">{t("net")}</span>
            <span className="text-base font-bold text-white">{fmtCurrency(summary.net)}</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
