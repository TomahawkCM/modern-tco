"use client";

import { GlassCard } from "@/components/budget/ui/GlassCard";
import {
  calculateCurrentNetWorth,
  NET_WORTH_MILESTONES,
  detectMilestones,
} from "@/lib/net-worth/calculator";
import { getHistoricalSnapshots, takeMonthlySnapshot } from "@/lib/net-worth/snapshot-store";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { Landmark, TrendingUp, TrendingDown, Target } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { NetWorthBreakdown } from "@/lib/net-worth/calculator";
import type { StoredNetWorthSnapshot } from "@/types/budget";

export function ClientNetWorth() {
  const t = useTranslations("budget.netWorth");
  const format = useFormatter();
  const currency = useDefaultCurrency();
  const [breakdown, setBreakdown] = useState<NetWorthBreakdown | null>(null);
  const [snapshots, setSnapshots] = useState<StoredNetWorthSnapshot[]>([]);
  const [milestones, setMilestones] = useState<number[]>([]);

  useEffect(() => {
    async function load() {
      const [bd, snaps] = await Promise.all([calculateCurrentNetWorth(), getHistoricalSnapshots()]);
      setBreakdown(bd);
      setSnapshots(snaps);

      // Take monthly snapshot if needed
      await takeMonthlySnapshot();

      // Detect milestones
      if (snaps.length > 0) {
        const prev = snaps[snaps.length - 1].netWorth;
        setMilestones(detectMilestones(bd.netWorth, prev));
      }
    }
    load();
  }, []);

  const fmtCurrency = (v: number) => format.number(v, { style: "currency", currency });

  if (!breakdown) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-700" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Landmark className="h-7 w-7 text-cyan-400" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      </div>

      {milestones.length > 0 && (
        <GlassCard className="border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <p className="text-sm font-medium text-amber-300">
              {t("milestoneReached", { amount: fmtCurrency(milestones[0]) })}
            </p>
          </div>
        </GlassCard>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-5">
          <p className="text-sm text-slate-400">{t("totalNetWorth")}</p>
          <p
            className={`mt-1 text-3xl font-bold ${breakdown.netWorth >= 0 ? "text-white" : "text-red-400"}`}
          >
            {fmtCurrency(breakdown.netWorth)}
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-slate-400">{t("totalAssets")}</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {fmtCurrency(breakdown.assets.total)}
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4 text-red-400" aria-hidden="true" />
            <p className="text-sm text-slate-400">{t("totalLiabilities")}</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-red-400">
            {fmtCurrency(breakdown.liabilities.total)}
          </p>
        </GlassCard>
      </div>

      {/* Asset Breakdown */}
      <GlassCard className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">{t("assetBreakdown")}</h2>
        <div className="space-y-3">
          {[
            { label: t("cashChecking"), value: breakdown.assets.cashChecking },
            { label: t("savings"), value: breakdown.assets.savings },
            { label: t("investments"), value: breakdown.assets.investments },
            { label: t("property"), value: breakdown.assets.property },
          ]
            .filter((item) => item.value > 0)
            .map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className="text-sm font-medium text-emerald-400">
                  {fmtCurrency(item.value)}
                </span>
              </div>
            ))}
        </div>
      </GlassCard>

      {/* Liability Breakdown */}
      <GlassCard className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">{t("liabilityBreakdown")}</h2>
        <div className="space-y-3">
          {[
            { label: t("creditCards"), value: breakdown.liabilities.creditCards },
            { label: t("loans"), value: breakdown.liabilities.loans },
            { label: t("mortgage"), value: breakdown.liabilities.mortgage },
          ]
            .filter((item) => item.value > 0)
            .map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className="text-sm font-medium text-red-400">{fmtCurrency(item.value)}</span>
              </div>
            ))}
          {breakdown.liabilities.total === 0 && (
            <p className="text-sm text-slate-500">{t("noLiabilities")}</p>
          )}
        </div>
      </GlassCard>

      {/* Historical Snapshots */}
      {snapshots.length > 0 && (
        <GlassCard className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">{t("history")}</h2>
          <div className="space-y-2">
            {snapshots
              .slice(-12)
              .reverse()
              .map((snap) => (
                <div key={snap.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {format.dateTime(new Date(snap.date), { month: "short", year: "numeric" })}
                  </span>
                  <span
                    className={`font-medium ${snap.netWorth >= 0 ? "text-white" : "text-red-400"}`}
                  >
                    {fmtCurrency(snap.netWorth)}
                  </span>
                </div>
              ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
