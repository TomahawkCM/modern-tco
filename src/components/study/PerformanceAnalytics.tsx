"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Award,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPerformanceAnalytics,
  getPersonalizedRecommendations,
  getDifficultyLevel,
  getAllReviewItems,
} from "@/lib/spacedRepetition";

interface PerformanceAnalyticsProps {
  /** Optional: Filter by specific module */
  moduleId?: string;
}

export function PerformanceAnalytics({ moduleId }: PerformanceAnalyticsProps) {
  const [analytics, setAnalytics] = useState({
    struggling: 0,
    normal: 0,
    mastered: 0,
    improvingItems: 0,
    decliningItems: 0,
    averageRetentionTrend: 0,
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [moduleId]);

  const loadAnalytics = () => {
    const performanceData = getPerformanceAnalytics(moduleId);
    const personalizedRecs = getPersonalizedRecommendations(moduleId);

    setAnalytics(performanceData);
    setRecommendations(personalizedRecs);
  };

  const totalItems = analytics.struggling + analytics.normal + analytics.mastered;
  const strugglingPercentage = totalItems > 0 ? (analytics.struggling / totalItems) * 100 : 0;
  const normalPercentage = totalItems > 0 ? (analytics.normal / totalItems) * 100 : 0;
  const masteredPercentage = totalItems > 0 ? (analytics.mastered / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-300">
            <BarChart3 className="h-6 w-6" />
            Performance Analytics - Adaptive Difficulty
          </CardTitle>
          <p className="text-sm text-gray-400">
            Personalized learning intervals based on your retention performance
          </p>
        </CardHeader>
      </Card>

      {/* Difficulty Distribution */}
      <Card className="border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm text-white">Difficulty Distribution</CardTitle>
          <p className="text-xs text-gray-400">
            How concepts are categorized based on your retention
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Struggling */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-white">
                  Struggling (retention &lt; 70%)
                </span>
              </div>
              <Badge className="bg-red-600 text-white">
                {analytics.struggling} item{analytics.struggling !== 1 ? "s" : ""}
              </Badge>
            </div>
            <Progress value={strugglingPercentage} className="h-2 bg-red-900/30" />
            <p className="text-xs text-gray-500">
              Reviewed more frequently (70% shorter intervals)
            </p>
          </div>

          {/* Normal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">
                  Normal (retention 70-90%)
                </span>
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                {analytics.normal} item{analytics.normal !== 1 ? "s" : ""}
              </Badge>
            </div>
            <Progress value={normalPercentage} className="h-2 bg-blue-900/30" />
            <p className="text-xs text-gray-500">Standard 2357 intervals</p>
          </div>

          {/* Mastered */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">
                  Mastered (retention &gt; 90%)
                </span>
              </div>
              <Badge className="bg-green-600 text-white">
                {analytics.mastered} item{analytics.mastered !== 1 ? "s" : ""}
              </Badge>
            </div>
            <Progress value={masteredPercentage} className="h-2 bg-green-900/30" />
            <p className="text-xs text-gray-500">
              Reviewed less frequently (30% longer intervals)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Improving Items */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Improving</p>
                <p className="text-3xl font-bold text-white">{analytics.improvingItems}</p>
                <p className="mt-1 text-xs text-gray-500">Getting better with practice</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Declining Items */}
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Declining</p>
                <p className="text-3xl font-bold text-white">{analytics.decliningItems}</p>
                <p className="mt-1 text-xs text-gray-500">Need extra attention</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retention Trend */}
      <Card className="border-purple-500/20 bg-purple-500/5">
        <CardHeader>
          <CardTitle className="text-sm text-purple-300">
            Recent Retention Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {analytics.averageRetentionTrend}%
            </span>
            <span className="text-sm text-gray-400">(last 10 sessions)</span>
          </div>
          <Progress
            value={analytics.averageRetentionTrend}
            className="h-3 bg-purple-900/30"
          />
          <p className="mt-2 text-xs text-gray-500">
            {analytics.averageRetentionTrend >= 80
              ? "🎯 Excellent! Keep up the consistent review schedule"
              : analytics.averageRetentionTrend >= 70
              ? "📚 Good progress - consider reviewing struggling concepts"
              : "⚠️ Focus on completing overdue reviews and re-reading sections"}
          </p>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-yellow-300">
              <Lightbulb className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="mt-0.5 text-yellow-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* How Adaptive Difficulty Works */}
      <Card className="border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm text-white">
            How Adaptive Difficulty Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-300">
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
            <p className="mb-1 font-semibold text-red-300">
              Struggling (&lt; 70% retention)
            </p>
            <p className="text-xs text-gray-400">
              • Intervals are 30% shorter (e.g., Day 3 → Day 2)
              <br />
              • Stay at current interval until performance improves
              <br />• Drop back one level if you get it wrong
            </p>
          </div>

          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <p className="mb-1 font-semibold text-blue-300">
              Normal (70-90% retention)
            </p>
            <p className="text-xs text-gray-400">
              • Standard 2357 intervals (Day 1, 3, 7, 16, 35)
              <br />
              • Progress one level when correct
              <br />• Stay at current level when incorrect
            </p>
          </div>

          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
            <p className="mb-1 font-semibold text-green-300">
              Mastered (&gt; 90% retention)
            </p>
            <p className="text-xs text-gray-400">
              • Intervals are 30% longer (e.g., Day 7 → Day 9)
              <br />
              • Can skip ahead 2 levels when consistently correct
              <br />• Frees up time to focus on struggling concepts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PerformanceAnalytics;
