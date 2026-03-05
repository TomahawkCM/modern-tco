"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LazyAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "@/components/charts/lazy-charts";
import {
  WalletIcon,
  TrendingUpIcon,
  HomeIcon,
  LandmarkIcon,
  CameraIcon,
  AlertTriangleIcon,
  ArrowRightLeftIcon,
} from "lucide-react";
import type { Database } from "@/supabase/database.types";

type NetWorthSnapshotRow = Database["public"]["Tables"]["net_worth_snapshots"]["Row"];

interface NetWorthDashboardProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  accountsTotal: number;
  investmentsTotal: number;
  propertiesTotal: number;
  loansTotal: number;
  latestSnapshot: NetWorthSnapshotRow | null;
  snapshots: NetWorthSnapshotRow[];
  currency: string;
  formatAmount: (amt: { amountMinor: number; currency: string }) => string;
  hasConversions?: boolean;
  fxWarning?: boolean;
}

export function NetWorthDashboard({
  netWorth,
  totalAssets,
  totalLiabilities,
  accountsTotal,
  investmentsTotal,
  propertiesTotal,
  loansTotal,
  snapshots,
  currency,
  formatAmount,
  hasConversions,
  fxWarning,
}: NetWorthDashboardProps) {
  const t = useTranslations("netWorth");
  const tc = useTranslations("common");
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const fmt = useCallback(
    (amountMinor: number) => formatAmount({ amountMinor, currency }),
    [formatAmount, currency]
  );

  const handleSnapshot = useCallback(async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch("/api/net-worth/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot_date: today,
          total_assets_minor: totalAssets,
          total_liabilities_minor: totalLiabilities,
          net_worth_minor: netWorth,
          breakdown: {
            accounts: accountsTotal,
            investments: investmentsTotal,
            properties: propertiesTotal,
            loans: loansTotal,
          },
          currency,
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [
    totalAssets,
    totalLiabilities,
    netWorth,
    accountsTotal,
    investmentsTotal,
    propertiesTotal,
    loansTotal,
    currency,
    router,
  ]);

  const chartData = useMemo(() => {
    return [...snapshots]
      .sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date))
      .map((s) => ({
        date: s.snapshot_date,
        netWorth: s.net_worth_minor / 100,
      }));
  }, [snapshots]);

  const breakdownCards = [
    {
      icon: <WalletIcon className="size-5" />,
      label: t("categories.accounts"),
      value: accountsTotal,
      isLiability: false,
    },
    {
      icon: <TrendingUpIcon className="size-5" />,
      label: t("categories.investments"),
      value: investmentsTotal,
      isLiability: false,
    },
    {
      icon: <HomeIcon className="size-5" />,
      label: t("categories.properties"),
      value: propertiesTotal,
      isLiability: false,
    },
    {
      icon: <LandmarkIcon className="size-5" />,
      label: t("categories.loans"),
      value: loansTotal,
      isLiability: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Net Worth hero card */}
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">{t("current")}</p>
          <p
            className={`text-4xl font-bold ${
              netWorth >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {fmt(netWorth)}
          </p>
          {hasConversions && (
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <ArrowRightLeftIcon className="size-3" />
              {t("converted")}
            </p>
          )}
        </CardContent>
      </Card>

      {fxWarning && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200">
          <AlertTriangleIcon className="size-4 shrink-0" />
          {t("fxWarning")}
        </div>
      )}

      {/* Assets vs Liabilities row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">{t("assets")}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {fmt(totalAssets)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">{t("liabilities")}</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {fmt(totalLiabilities)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown cards */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("breakdown")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {breakdownCards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{card.icon}</span>
                  <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-xl font-semibold ${
                    card.isLiability ? "text-red-600 dark:text-red-400" : "text-foreground"
                  }`}
                >
                  {card.isLiability ? `-${fmt(card.value)}` : fmt(card.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Take Snapshot button */}
      <div className="flex justify-end">
        <Button onClick={handleSnapshot} disabled={saving}>
          <CameraIcon className="mr-2 size-4" />
          {saving ? tc("saving") : t("takeSnapshot")}
        </Button>
      </div>

      {/* Net Worth History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("history")}</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium">{t("noData")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("noDataDescription")}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LazyAreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.2}
                />
              </LazyAreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
