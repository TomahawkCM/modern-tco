"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useThemeMode } from "@/hooks/useThemeMode";
import { getChartPalette } from "@/lib/budget-chart-colors";
import type { StrategyResult, DebtAccount } from "@/lib/calculators/types";
import { useTranslations } from "next-intl";

const MAX_DATA_POINTS = 120;

function sampleData<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  const sampled = data.filter((_, i) => i % step === 0);
  // Always include last point
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }
  return sampled;
}

interface BalanceChartProps {
  result: StrategyResult;
  debts: DebtAccount[];
  formatCurrency: (amount: number) => string;
}

function BalanceChart({ result, debts, formatCurrency }: BalanceChartProps) {
  const theme = useThemeMode();
  const palette = getChartPalette(theme);

  const data = useMemo(() => {
    const raw = result.schedule.map((month) => {
      const point: Record<string, number | string> = {
        month: month.month,
        label: `M${month.month}`,
      };
      for (const payment of month.payments) {
        point[payment.debtId] = payment.remainingBalance;
      }
      point.total = month.totalRemaining;
      return point;
    });
    return sampleData(raw, MAX_DATA_POINTS);
  }, [result]);

  const debtColors = useMemo(() => {
    const colors: Record<string, string> = {};
    debts.forEach((debt, i) => {
      colors[debt.id] = palette.data[i % palette.data.length].hex;
    });
    return colors;
  }, [debts, palette]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          {debts.map((debt) => (
            <linearGradient key={debt.id} id={`gradient-${debt.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={debtColors[debt.id]} stopOpacity={0.4} />
              <stop offset="95%" stopColor={debtColors[debt.id]} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: palette.text }}
          stroke={palette.grid}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: palette.text }}
          stroke={palette.grid}
          tickFormatter={(v: number) => formatCurrency(v)}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgb(15 23 42)",
            border: "1px solid rgb(51 65 85)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "rgb(148 163 184)" }}
          formatter={(value: number, name: string) => {
            const debt = debts.find((d) => d.id === name);
            return [formatCurrency(value), debt?.name ?? name];
          }}
        />
        <Legend
          formatter={(value: string) => {
            const debt = debts.find((d) => d.id === value);
            return debt?.name ?? value;
          }}
          wrapperStyle={{ fontSize: "12px" }}
        />
        {debts.map((debt) => (
          <Area
            key={debt.id}
            type="monotone"
            dataKey={debt.id}
            stackId="balance"
            stroke={debtColors[debt.id]}
            fill={`url(#gradient-${debt.id})`}
            strokeWidth={1.5}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface ComparisonChartProps {
  scenarios: Array<{
    name: string;
    schedule: StrategyResult["schedule"];
  }>;
  formatCurrency: (amount: number) => string;
}

function ComparisonChart({ scenarios, formatCurrency }: ComparisonChartProps) {
  const theme = useThemeMode();
  const palette = getChartPalette(theme);

  const data = useMemo(() => {
    const maxMonths = Math.max(...scenarios.map((s) => s.schedule.length));
    const raw: Record<string, number | string>[] = [];

    for (let m = 0; m < maxMonths; m++) {
      const point: Record<string, number | string> = {
        month: m + 1,
        label: `M${m + 1}`,
      };
      for (const scenario of scenarios) {
        point[scenario.name] = scenario.schedule[m]?.totalRemaining ?? 0;
      }
      raw.push(point);
    }
    return sampleData(raw, MAX_DATA_POINTS);
  }, [scenarios]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: palette.text }}
          stroke={palette.grid}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: palette.text }}
          stroke={palette.grid}
          tickFormatter={(v: number) => formatCurrency(v)}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgb(15 23 42)",
            border: "1px solid rgb(51 65 85)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "rgb(148 163 184)" }}
          formatter={(value: number) => [formatCurrency(value)]}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        {scenarios.map((scenario, i) => (
          <Line
            key={scenario.name}
            type="monotone"
            dataKey={scenario.name}
            stroke={palette.data[i % palette.data.length].hex}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface DebtPayoffChartProps {
  result: StrategyResult | null;
  debts: DebtAccount[];
  comparisonScenarios?: Array<{
    name: string;
    schedule: StrategyResult["schedule"];
  }>;
  formatCurrency: (amount: number) => string;
}

export function DebtPayoffChart({
  result,
  debts,
  comparisonScenarios,
  formatCurrency,
}: DebtPayoffChartProps) {
  const t = useTranslations("debtPayoff");

  if (!result || result.schedule.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center rounded-lg border border-dashed border-slate-700 text-sm text-slate-500">
        {t("noChartData")}
      </div>
    );
  }

  const hasComparison = comparisonScenarios && comparisonScenarios.length >= 2;

  return (
    <Tabs defaultValue="balance">
      <TabsList className="bg-slate-800/50">
        <TabsTrigger value="balance" className="text-xs data-[state=active]:bg-slate-700">
          {t("chart.balanceDecline")}
        </TabsTrigger>
        {hasComparison && (
          <TabsTrigger value="comparison" className="text-xs data-[state=active]:bg-slate-700">
            {t("chart.scenarioComparison")}
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="balance" className="mt-4">
        <BalanceChart result={result} debts={debts} formatCurrency={formatCurrency} />
      </TabsContent>
      {hasComparison && (
        <TabsContent value="comparison" className="mt-4">
          <ComparisonChart scenarios={comparisonScenarios} formatCurrency={formatCurrency} />
        </TabsContent>
      )}
    </Tabs>
  );
}
