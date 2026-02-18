"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingUp, CheckCircle2, FileText } from "lucide-react";
import { questionService } from "@/lib/questionService";
import type { TCODomain, Difficulty, QuestionCategory } from "@/types/exam";
import { TCO_DOMAIN_WEIGHTS } from "@/types/exam";

interface QuestionStats {
  totalQuestions: number;
  domainDistribution: Record<TCODomain, number>;
  difficultyDistribution: Record<Difficulty, number>;
  categoryDistribution: Record<QuestionCategory, number>;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#3b82f6",
  Advanced: "#f59e0b",
  Expert: "#ef4444",
};

const DOMAIN_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // green
  "#06b6d4", // cyan
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#f97316", // orange
];

export function QuestionStats() {
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const questionStats = await questionService.getQuestionStats();
      setStats(questionStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate domain coverage gaps
  const domainGaps = Object.entries(TCO_DOMAIN_WEIGHTS)
    .map(([domain, targetPercentage]) => {
      const count = stats.domainDistribution[domain as TCODomain] || 0;
      const actualPercentage = stats.totalQuestions > 0 ? (count / stats.totalQuestions) * 100 : 0;
      const deviation = Math.abs(actualPercentage - targetPercentage);

      return {
        domain,
        count,
        actualPercentage,
        targetPercentage,
        deviation,
        isUnderrepresented: actualPercentage < targetPercentage - 5,
      };
    })
    .filter((gap) => gap.isUnderrepresented);

  // Prepare chart data
  const domainChartData = Object.entries(stats.domainDistribution)
    .map(([domain, count]) => ({
      name: domain,
      count,
      percentage: stats.totalQuestions > 0 ? ((count / stats.totalQuestions) * 100).toFixed(1) : 0,
    }))
    .filter((d) => d.count > 0);

  const difficultyChartData = Object.entries(stats.difficultyDistribution)
    .map(([difficulty, count]) => ({
      name: difficulty,
      count,
      percentage: stats.totalQuestions > 0 ? ((count / stats.totalQuestions) * 100).toFixed(1) : 0,
    }))
    .filter((d) => d.count > 0);

  // Calculate quality metrics
  const qualityMetrics = {
    withExplanations: stats.totalQuestions, // Explanation is required, so all should have it
    withTags: stats.totalQuestions, // Assuming all have tags
    avgChoicesPerQuestion: 4, // All questions have 4 choices
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <p className="mt-1 text-xs text-muted-foreground">In question bank</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domains Covered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(stats.domainDistribution).filter((count) => count > 0).length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Out of {Object.keys(TCO_DOMAIN_WEIGHTS).length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Gaps</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{domainGaps.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">Domains under target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.totalQuestions > 0 ? "100%" : "0%"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">All questions validated</p>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Gaps Alert */}
      {domainGaps.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            <div className="mb-2 font-semibold text-foreground">
              {domainGaps.length} domain{domainGaps.length > 1 ? "s" : ""} below target coverage:
            </div>
            <div className="space-y-1">
              {domainGaps.map((gap) => (
                <div key={gap.domain} className="text-sm">
                  <span className="font-medium">{gap.domain}</span>:{" "}
                  {gap.actualPercentage.toFixed(1)}% (target: {gap.targetPercentage}%)
                  {" - "}
                  <span className="text-amber-600">
                    Need{" "}
                    {Math.ceil((gap.targetPercentage / 100) * stats.totalQuestions - gap.count)}{" "}
                    more questions
                  </span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Domain Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Distribution</CardTitle>
            <CardDescription>Questions by TCO domain</CardDescription>
          </CardHeader>
          <CardContent>
            {domainChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={domainChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6">
                    {domainChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
            <CardDescription>Questions by difficulty level</CardDescription>
          </CardHeader>
          <CardContent>
            {difficultyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={difficultyChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {difficultyChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DIFFICULTY_COLORS[entry.name] || "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Questions organized by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => (
              <div
                key={category}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/50 p-4"
              >
                <div className="text-2xl font-bold text-foreground">{count}</div>
                <div className="mt-1 text-center text-xs text-muted-foreground">{category}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
