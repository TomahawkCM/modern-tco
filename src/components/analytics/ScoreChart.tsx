"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

interface ScoreDataPoint {
  period: string;
  score: number;
  questions: number;
}

interface ScoreChartProps {
  data: ScoreDataPoint[];
  title: string;
  type?: "line" | "bar";
  showTrend?: boolean;
}

export function ScoreChart({ data, title, type = "line", showTrend = true }: ScoreChartProps) {
  const averageScore = Math.round(data.reduce((sum, point) => sum + point.score, 0) / data.length);
  const trend = data.length > 1 ? data[data.length - 1].score - data[0].score : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border border-white/10 bg-gray-900/95 p-3 text-foreground">
          <p className="font-medium">{label}</p>
          <p className="text-tanium-accent">Score: {payload[0].value}%</p>
          {payload[0].payload.questions && (
            <p className="text-sm text-muted-foreground">Questions: {payload[0].payload.questions}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            {type === "line" ? (
              <TrendingUp className="h-5 w-5 text-tanium-accent" />
            ) : (
              <BarChart3 className="h-5 w-5 text-tanium-accent" />
            )}
            {title}
          </div>
          {showTrend && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Avg: {averageScore}%</span>
              {trend !== 0 && (
                <span className={trend > 0 ? "text-[#22c55e]" : "text-red-400"}>
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="period" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="period" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
