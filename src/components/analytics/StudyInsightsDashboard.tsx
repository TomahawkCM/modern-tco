"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Target, Lightbulb, Activity, TrendingUp } from "lucide-react";
import {
  getStudySessionAnalytics,
  getStudyRecommendations,
} from "@/lib/videoAnalytics";

interface StudyInsightsDashboardProps {
  /** Number of days to analyze */
  daysBack?: number;
  /** Custom className */
  className?: string;
}

/**
 * Study Insights Dashboard
 *
 * Displays study session analytics, patterns, and personalized recommendations
 */
export function StudyInsightsDashboard({
  daysBack = 30,
  className,
}: StudyInsightsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    loadAnalytics();

    // Listen for study session updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "study-sessions" || e.key === "video-progress") {
        loadAnalytics();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [daysBack]);

  function loadAnalytics() {
    const data = getStudySessionAnalytics(daysBack);
    setAnalytics(data);

    const recs = getStudyRecommendations();
    setRecommendations(recs);
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-gray-400">Loading study insights...</p>
        </CardContent>
      </Card>
    );
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-400 border-green-400";
    if (score >= 60) return "text-blue-400 border-blue-400";
    if (score >= 40) return "text-yellow-400 border-yellow-400";
    return "text-orange-400 border-orange-400";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Card */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Study Insights (Last {daysBack} Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-gray-400">Sessions</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {analytics.totalSessions}
              </div>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-gray-400">Study Time</span>
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {analytics.totalStudyTime.toFixed(1)}h
              </div>
            </div>

            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-xs text-gray-400">Avg Session</span>
              </div>
              <div className="text-3xl font-bold text-green-400">
                {Math.round(analytics.averageSessionDuration)}m
              </div>
            </div>

            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Quality</span>
              </div>
              <div className={`text-3xl font-bold ${getQualityColor(analytics.averageQualityScore).split(" ")[0]}`}>
                {Math.round(analytics.averageQualityScore)}
              </div>
            </div>
          </div>

          {/* Quality Score Badge */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Session Quality Score</div>
                <p className="text-xs text-gray-500">
                  Based on activity variety and performance
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-lg px-4 py-2 ${getQualityColor(analytics.averageQualityScore)}`}
              >
                {getQualityLabel(analytics.averageQualityScore)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      {Object.keys(analytics.activityBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-purple-400" />
              Activity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Activity bars */}
            <div className="space-y-3">
              {Object.entries(analytics.activityBreakdown)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([type, percentage]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 capitalize flex items-center gap-2">
                        {type === "video" && "📺"}
                        {type === "practice" && "✍️"}
                        {type === "review" && "🔄"}
                        {type === "reading" && "📚"}
                        {type}
                      </span>
                      <span className="text-gray-400">{Math.round(percentage as number)}%</span>
                    </div>
                    <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          type === "video"
                            ? "bg-purple-500"
                            : type === "practice"
                            ? "bg-blue-500"
                            : type === "review"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>

            {/* Recommendation for balanced studying */}
            {Object.keys(analytics.activityBreakdown).length < 3 && (
              <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-2">
                💡 Tip: Mix videos, practice, and reviews for optimal learning
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Study Frequency Chart */}
      {Object.keys(analytics.sessionsByDay).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-blue-400" />
              Study Frequency (Last {daysBack} Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-1 h-32">
              {Object.entries(analytics.sessionsByDay)
                .slice(-14) // Last 14 days
                .map(([date, count]) => {
                  const maxSessions = Math.max(...Object.values(analytics.sessionsByDay) as number[]);
                  const height = maxSessions > 0 ? ((count as number) / maxSessions) * 100 : 0;
                  const dateObj = new Date(date);

                  return (
                    <div key={date} className="flex-1 flex flex-col items-center">
                      <div className="flex-1 flex items-end w-full">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400"
                          style={{ height: `${height}%` }}
                          title={`${dateObj.toLocaleDateString()}: ${count} session${count !== 1 ? 's' : ''}`}
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 text-center">
                        {dateObj.getDate()}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="text-xs text-gray-400 mt-3 text-center">
              Daily study sessions
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="text-sm text-gray-300 bg-gray-800/30 border border-gray-700/50 rounded p-3"
              >
                {rec}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {analytics.totalSessions === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-600 opacity-50" />
            <p className="text-gray-400 mb-2">No study sessions yet</p>
            <p className="text-sm text-gray-500">
              Start studying to see insights and recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StudyInsightsDashboard;
