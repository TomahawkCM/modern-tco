"use client";

/**
 * Health Score History Chart Component (H-023)
 * Line chart showing score over time with trend line
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { HistoricalScore } from "@/lib/analytics/health-score";
import { useSeniorsMode } from "@/hooks/useSeniorsMode";

interface ChartDataPoint {
  month: string;
  score: number;
  previousScore?: number;
  trend?: number;
}

// Dynamically import Recharts for better performance
const DynamicChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      function HistoryChart({
        data,
        isSeniorsMode,
      }: {
        data: ChartDataPoint[];
        isSeniorsMode: boolean;
      }) {
        const {
          XAxis,
          YAxis,
          CartesianGrid,
          Tooltip,
          ResponsiveContainer,
          ReferenceLine,
          Area,
          Line,
          ComposedChart,
        } = mod;

        const fontSize = isSeniorsMode ? 14 : 12;

        // Calculate trend line data using linear regression
        const trendData = (() => {
          if (data.length < 2) return data;

          const n = data.length;
          const sumX = data.reduce((sum, _, i) => sum + i, 0);
          const sumY = data.reduce((sum, d) => sum + d.score, 0);
          const sumXY = data.reduce((sum, d, i) => sum + i * d.score, 0);
          const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

          const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
          const intercept = (sumY - slope * sumX) / n;

          return data.map((d, i) => ({
            ...d,
            trend: intercept + slope * i,
          }));
        })();

        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.5)"
                fontSize={fontSize}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.5)"
                fontSize={fontSize}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize,
                }}
                labelStyle={{ color: "#fff" }}
                formatter={(value: number, name: string) => [
                  value.toFixed(1),
                  name === "score" ? "Score" : "Trend",
                ]}
              />
              <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="5 5" opacity={0.5} />
              <ReferenceLine y={60} stroke="#eab308" strokeDasharray="5 5" opacity={0.5} />

              <Area type="monotone" dataKey="score" stroke="none" fill="url(#scoreGradient)" />

              <Line
                type="linear"
                dataKey="trend"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Trend"
              />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#14b8a6", stroke: "#fff", strokeWidth: 2 }}
                name="Score"
                animationDuration={1000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
      }
      return { default: HistoryChart };
    }),
  {
    loading: () => (
      <div className="flex h-[300px] animate-pulse items-center justify-center rounded-lg bg-slate-800/50">
        <p className="text-slate-400">Loading chart...</p>
      </div>
    ),
    ssr: false,
  }
);

interface HealthScoreHistoryProps {
  historicalScores: HistoricalScore[];
  className?: string;
}

export function HealthScoreHistory({ historicalScores, className }: HealthScoreHistoryProps) {
  const locale = useLocale();
  const { isSeniorsMode } = useSeniorsMode();

  // Transform historical data for the chart
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (historicalScores.length === 0) return [];

    const sorted = [...historicalScores].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((entry, index) => ({
      month: new Date(entry.date).toLocaleDateString(locale, {
        month: "short",
        year: "2-digit",
      }),
      score: entry.score,
      previousScore: index > 0 ? sorted[index - 1].score : undefined,
    }));
  }, [historicalScores, locale]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return { direction: "neutral" as const, change: 0 };

    const first = chartData[0].score;
    const last = chartData[chartData.length - 1].score;
    const change = last - first;

    if (change > 5) return { direction: "up" as const, change };
    if (change < -5) return { direction: "down" as const, change };
    return { direction: "neutral" as const, change };
  }, [chartData]);

  // Empty state
  if (historicalScores.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-white/10 bg-slate-800/50 p-8",
          className
        )}
      >
        <TrendingUp className="mb-3 h-12 w-12 text-slate-600" />
        <p className="text-center text-slate-400">
          Your score history will appear here as data accumulates
        </p>
        <p className="mt-2 text-xs text-slate-500">Check back next month!</p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn("rounded-xl border border-white/10 bg-slate-800/50 p-6", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className={cn("font-semibold text-white", isSeniorsMode && "text-lg")}>
            Score History
          </h3>
          <p className="text-xs text-slate-400">
            {chartData.length} month{chartData.length !== 1 ? "s" : ""} of data
          </p>
        </div>

        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium",
            trend.direction === "up" && "bg-green-500/20 text-green-400",
            trend.direction === "down" && "bg-red-500/20 text-red-400",
            trend.direction === "neutral" && "bg-slate-500/20 text-slate-400"
          )}
        >
          {trend.direction === "up" && <TrendingUp className="h-4 w-4" />}
          {trend.direction === "down" && <TrendingDown className="h-4 w-4" />}
          {trend.direction === "neutral" && <Minus className="h-4 w-4" />}
          <span>
            {trend.change >= 0 ? "+" : ""}
            {trend.change.toFixed(1)}
          </span>
        </div>
      </div>

      <DynamicChart data={chartData} isSeniorsMode={isSeniorsMode} />

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-3 rounded bg-teal-500" />
          <span>Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-3 rounded border-dashed bg-slate-400" />
          <span>Trend</span>
        </div>
      </div>
    </motion.div>
  );
}

export default HealthScoreHistory;
