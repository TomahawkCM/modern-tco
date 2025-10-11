"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Zap,
  Calendar,
  Award,
  BookOpen,
} from "lucide-react";
import {
  calculateProgressSummary,
  calculateLearningVelocity,
  predictExamReadiness,
  compareToBenchmarks,
  type ProgressSummary as ProgressSummaryType,
  type ProgressBenchmark,
} from "@/lib/progressVisualization";

interface ProgressSummaryProps {
  /** Custom className */
  className?: string;
}

/**
 * Progress Summary Component
 *
 * Comprehensive overview of learning progress and exam readiness
 *
 * Research: Progress feedback increases self-efficacy by 38% (Schunk & DiBenedetto, 2020)
 */
export function ProgressSummary({ className }: ProgressSummaryProps) {
  const [summary, setSummary] = useState<ProgressSummaryType | null>(null);
  const [benchmarks, setBenchmarks] = useState<ProgressBenchmark[]>([]);
  const [velocity, setVelocity] = useState<number[]>([]);
  const [daysToReady, setDaysToReady] = useState<number | null>(null);

  useEffect(() => {
    loadProgress();

    // Listen for all updates
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "review-items" ||
        e.key === "user-points" ||
        e.key === "practice-stats"
      ) {
        loadProgress();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function loadProgress() {
    const progressData = calculateProgressSummary();
    setSummary(progressData);

    const benchmarkData = compareToBenchmarks();
    setBenchmarks(benchmarkData);

    const velocityData = calculateLearningVelocity(4);
    setVelocity(velocityData);

    const readiness = predictExamReadiness(85);
    setDaysToReady(readiness);
  }

  if (!summary) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading progress data...</p>
        </CardContent>
      </Card>
    );
  }

  const getReadinessColor = (readiness: number) => {
    if (readiness >= 85) return "text-[#22c55e] border-green-400";
    if (readiness >= 70) return "text-primary border-blue-400";
    if (readiness >= 50) return "text-[#f97316] border-yellow-400";
    return "text-orange-400 border-orange-400";
  };

  const getReadinessMessage = (readiness: number) => {
    if (readiness >= 85) return "Ready for Exam! 🎉";
    if (readiness >= 70) return "Almost Ready - Keep Practicing!";
    if (readiness >= 50) return "Good Progress - Continue Studying";
    return "Building Foundation - Stay Focused";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Progress Card */}
      <Card className="border-accent/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#f97316]" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exam Readiness */}
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-accent-foreground" />
              <span className="text-sm text-muted-foreground">Exam Readiness</span>
            </div>
            <div className={`text-6xl font-bold mb-2 ${getReadinessColor(summary.examReadiness)}`}>
              {summary.examReadiness}%
            </div>
            <p className="text-sm text-muted-foreground mb-4">{getReadinessMessage(summary.examReadiness)}</p>
            <Progress value={summary.examReadiness} className="h-3" />
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Study Hours</span>
              </div>
              <div className="text-3xl font-bold text-primary">{summary.totalHours}</div>
              <div className="text-xs text-muted-foreground mt-1">hours invested</div>
            </div>

            <div className="rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-[#22c55e]" />
                <span className="text-xs text-muted-foreground">Mastered</span>
              </div>
              <div className="text-3xl font-bold text-[#22c55e]">{summary.itemsMastered}</div>
              <div className="text-xs text-muted-foreground mt-1">
                of {summary.totalItems} concepts
              </div>
            </div>

            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-accent-foreground" />
                <span className="text-xs text-muted-foreground">Points</span>
              </div>
              <div className="text-3xl font-bold text-accent-foreground">
                {summary.totalPoints.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Level {summary.currentLevel}</div>
            </div>

            <div className="rounded-lg border border-[#f97316]/20 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#f97316]" />
                <span className="text-xs text-muted-foreground">Retention</span>
              </div>
              <div className="text-3xl font-bold text-[#f97316]">
                {Math.round(summary.overallRetention)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">average</div>
            </div>
          </div>

          {/* Learning Velocity */}
          {velocity.length > 0 && (
            <div className="rounded-lg border border-gray-700 bg-card/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">Learning Velocity</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-20">
                {velocity.map((count, idx) => {
                  const maxValue = Math.max(...velocity, 1);
                  const height = (count / maxValue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="flex-1 flex items-end w-full">
                        <div
                          className="w-full bg-primary rounded-t transition-all"
                          style={{ height: `${height}%` }}
                          title={`Week ${idx + 1}: ${count} concepts mastered`}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{count}</div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Concepts Mastered Per Week (Last 4 Weeks)
              </div>
            </div>
          )}

          {/* Time to Readiness */}
          {daysToReady !== null && daysToReady > 0 && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-accent-foreground" />
                <span className="text-sm font-semibold text-muted-foreground">
                  Predicted Exam Readiness
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-accent-foreground">{daysToReady}</span>
                <span className="text-sm text-muted-foreground">days at current pace</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Based on your learning velocity, you'll be exam-ready in approximately {daysToReady} days
                if you maintain your current study rate.
              </p>
            </div>
          )}

          {/* Readiness Message */}
          {summary.examReadiness >= 85 && (
            <div className="rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 p-4 text-center">
              <Award className="h-8 w-8 text-[#22c55e] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#22c55e] mb-1">
                🎉 You're Ready for the Exam!
              </p>
              <p className="text-xs text-muted-foreground">
                Your retention and mastery levels indicate strong exam readiness. Consider scheduling
                your certification exam.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benchmarks Comparison */}
      {benchmarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Certification Benchmarks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {benchmarks.map((benchmark, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{benchmark.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {Math.round(benchmark.userValue)}
                      {benchmark.metric.includes("Retention") || benchmark.metric.includes("Mastered") || benchmark.metric.includes("Readiness") ? "%" : "hrs"}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        benchmark.status === "exceeds"
                          ? "text-[#22c55e] border-green-400"
                          : benchmark.status === "meets"
                          ? "text-primary border-blue-400"
                          : "text-orange-400 border-orange-400"
                      }
                    >
                      {benchmark.status === "exceeds"
                        ? "Exceeds"
                        : benchmark.status === "meets"
                        ? "Meets"
                        : "Below"}
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={benchmark.percentile} className="h-2" />
                  <div
                    className="absolute top-0 h-2 w-0.5 bg-yellow-500"
                    style={{ left: "100%" }}
                    title={`Target: ${benchmark.benchmarkValue}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Target: {benchmark.benchmarkValue}
                    {benchmark.metric.includes("Retention") || benchmark.metric.includes("Mastered") || benchmark.metric.includes("Readiness") ? "%" : " hrs"}
                  </span>
                  <span>
                    {benchmark.status === "exceeds"
                      ? `+${Math.round(benchmark.percentile - 100)}% above`
                      : benchmark.status === "meets"
                      ? "On target"
                      : `${Math.round(100 - benchmark.percentile)}% to goal`}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProgressSummary;
