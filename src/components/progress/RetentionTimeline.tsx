"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import {
  generateRetentionTimeline,
  type TimelineDataPoint,
} from "@/lib/progressVisualization";

interface RetentionTimelineProps {
  /** Optional module ID to filter timeline */
  moduleId?: string;
  /** Number of days to display */
  daysBack?: number;
  /** Custom className */
  className?: string;
}

/**
 * Retention Timeline Component
 *
 * Visualizes retention trends over time with sparkline chart
 *
 * Research: Visual progress feedback increases motivation by 40% (Schunk & DiBenedetto, 2020)
 */
export function RetentionTimeline({
  moduleId,
  daysBack = 30,
  className,
}: RetentionTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineDataPoint[]>([]);
  const [trend, setTrend] = useState<"improving" | "stable" | "declining">("stable");

  useEffect(() => {
    loadTimeline();

    // Listen for review updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "review-items" || e.key === "user-points") {
        loadTimeline();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [moduleId, daysBack]);

  function loadTimeline() {
    const data = generateRetentionTimeline(moduleId, daysBack);
    setTimeline(data);

    // Calculate trend from last 7 days
    const recentDays = data.slice(-7);
    const firstHalf = recentDays.slice(0, 3);
    const secondHalf = recentDays.slice(-3);

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.averageRetention, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.averageRetention, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 5) {
      setTrend("improving");
    } else if (secondAvg < firstAvg - 5) {
      setTrend("declining");
    } else {
      setTrend("stable");
    }
  }

  if (timeline.length === 0 || timeline.every(d => d.itemsReviewed === 0)) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Retention Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No review data yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start reviewing to see your progress over time
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const totalDaysActive = timeline.filter(d => d.itemsReviewed > 0).length;
  const averageRetention = timeline.reduce((sum, d) => sum + d.averageRetention, 0) / timeline.length;
  const maxRetention = Math.max(...timeline.map(d => d.averageRetention));
  const minRetention = Math.min(...timeline.filter(d => d.itemsReviewed > 0).map(d => d.averageRetention));

  // Prepare chart data (simple sparkline with CSS)
  const chartHeight = 120;
  const chartWidth = 100; // percentage

  const maxValue = Math.max(...timeline.map(d => d.averageRetention), 100);
  const points = timeline.map((d, i) => {
    const x = (i / (timeline.length - 1)) * chartWidth;
    const y = chartHeight - (d.averageRetention / maxValue) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Retention Timeline
          </CardTitle>
          <Badge
            variant="outline"
            className={
              trend === "improving"
                ? "text-[#22c55e] border-green-400"
                : trend === "declining"
                ? "text-orange-400 border-orange-400"
                : "text-muted-foreground"
            }
          >
            {trend === "improving" && <TrendingUp className="h-3 w-3 mr-1" />}
            {trend === "declining" && <TrendingDown className="h-3 w-3 mr-1" />}
            {trend === "stable" && <Minus className="h-3 w-3 mr-1" />}
            {trend === "improving" ? "Improving" : trend === "declining" ? "Declining" : "Stable"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Avg Retention</div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(averageRetention)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Active Days</div>
            <div className="text-2xl font-bold text-[#22c55e]">{totalDaysActive}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Peak</div>
            <div className="text-2xl font-bold text-accent-foreground">
              {Math.round(maxRetention)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Low</div>
            <div className="text-2xl font-bold text-orange-400">
              {minRetention > 0 ? Math.round(minRetention) : 0}%
            </div>
          </div>
        </div>

        {/* Sparkline Chart */}
        <div className="relative">
          <div className="text-sm text-muted-foreground mb-3">Retention Trend (Last {daysBack} Days)</div>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-32"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <line
              x1="0"
              y1={chartHeight * 0.25}
              x2={chartWidth}
              y2={chartHeight * 0.25}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-700"
              strokeDasharray="2,2"
            />
            <line
              x1="0"
              y1={chartHeight * 0.5}
              x2={chartWidth}
              y2={chartHeight * 0.5}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-700"
              strokeDasharray="2,2"
            />
            <line
              x1="0"
              y1={chartHeight * 0.75}
              x2={chartWidth}
              y2={chartHeight * 0.75}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-700"
              strokeDasharray="2,2"
            />

            {/* Area fill */}
            <polygon
              points={`0,${chartHeight} ${points} ${chartWidth},${chartHeight}`}
              fill="url(#gradient)"
              opacity="0.2"
            />

            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-32 flex flex-col justify-between text-xs text-muted-foreground">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="text-sm text-muted-foreground mb-2">Recent Activity</div>
          <div className="space-y-2">
            {timeline.slice(-7).reverse().filter(d => d.itemsReviewed > 0).slice(0, 5).map((day, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm p-2 rounded border border-gray-700/50 bg-card/30"
              >
                <span className="text-muted-foreground">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{day.itemsReviewed} reviews</span>
                  <Badge
                    variant="outline"
                    className={
                      day.averageRetention >= 80
                        ? "text-[#22c55e]"
                        : day.averageRetention >= 60
                        ? "text-primary"
                        : "text-orange-400"
                    }
                  >
                    {Math.round(day.averageRetention)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RetentionTimeline;
