"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Clock, BarChart3, Award, AlertCircle } from "lucide-react";
import {
  getPracticeStats,
  getWeakConcepts,
  getStrongConcepts,
  getPracticeVsReviewComparison,
} from "@/lib/practiceMode";
import type { PracticeStats as PracticeStatsType } from "@/lib/practiceMode";

interface PracticeStatsProps {
  /** Custom className */
  className?: string;
}

/**
 * Practice Statistics Component
 *
 * Displays comprehensive practice statistics and comparisons
 */
export function PracticeStats({ className }: PracticeStatsProps) {
  const [stats, setStats] = useState<PracticeStatsType | null>(null);
  const [weakConcepts, setWeakConcepts] = useState<any[]>([]);
  const [strongConcepts, setStrongConcepts] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    loadStats();

    // Listen for stats updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "practice-stats") {
        loadStats();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function loadStats() {
    const practiceStats = getPracticeStats();
    setStats(practiceStats);
    setWeakConcepts(getWeakConcepts(3));
    setStrongConcepts(getStrongConcepts(3));
    setComparison(getPracticeVsReviewComparison());
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading practice statistics...</p>
        </CardContent>
      </Card>
    );
  }

  if (stats.totalSessions === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Practice Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Target className="mx-auto mb-4 h-16 w-16 text-gray-600 opacity-50" />
          <p className="text-muted-foreground mb-2">No practice sessions yet</p>
          <p className="text-sm text-muted-foreground">
            Start practicing to see your statistics here!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-[#22c55e]";
    if (accuracy >= 70) return "text-primary";
    if (accuracy >= 50) return "text-[#f97316]";
    return "text-orange-400";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Stats */}
      <Card className="border-accent/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Practice Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Sessions</div>
              <div className="text-2xl font-bold text-accent-foreground">{stats.totalSessions}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Questions</div>
              <div className="text-2xl font-bold text-primary">{stats.totalQuestions}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Accuracy</div>
              <div className={`text-2xl font-bold ${getAccuracyColor(stats.accuracyRate)}`}>
                {Math.round(stats.accuracyRate)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Avg Time</div>
              <div className="text-2xl font-bold text-[#22c55e]">
                {Math.round(stats.averageTimePerQuestion)}s
              </div>
            </div>
          </div>

          {/* Accuracy Progress Bar */}
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Accuracy</span>
              <span className={getAccuracyColor(stats.accuracyRate)}>
                {stats.totalCorrect} / {stats.totalQuestions} correct
              </span>
            </div>
            <Progress value={stats.accuracyRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Practice vs Review Comparison */}
      {comparison && comparison.review.sessions > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Practice vs Review Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                <div className="text-sm text-muted-foreground mb-2">Practice</div>
                <div className="text-3xl font-bold text-accent-foreground">
                  {Math.round(comparison.practice.accuracy)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {comparison.practice.sessions} sessions
                </div>
              </div>
              <div className="rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 p-4">
                <div className="text-sm text-muted-foreground mb-2">Review</div>
                <div className="text-3xl font-bold text-[#22c55e]">
                  {Math.round(comparison.review.accuracy)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {comparison.review.sessions} sessions
                </div>
              </div>
            </div>

            {comparison.difference !== 0 && (
              <div className="mt-4 rounded border border-gray-700 bg-card/30 p-3 text-sm">
                {comparison.difference > 0 ? (
                  <p className="text-primary">
                    🎯 Your practice accuracy is {Math.abs(Math.round(comparison.difference))}%
                    higher than review! Great preparation work.
                  </p>
                ) : (
                  <p className="text-[#f97316]">
                    📚 Your review accuracy is {Math.abs(Math.round(comparison.difference))}%
                    higher. Practice helps build confidence!
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weak Concepts */}
      {weakConcepts.length > 0 && (
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              Concepts Needing Practice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weakConcepts.slice(0, 5).map((concept, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{concept.concept}</span>
                  <Badge variant="outline" className="text-orange-400">
                    {Math.round(concept.accuracy)}%
                  </Badge>
                </div>
                <Progress value={concept.accuracy} className="h-1" />
                <div className="text-xs text-muted-foreground">
                  {concept.correct} / {concept.questions} correct
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Strong Concepts */}
      {strongConcepts.length > 0 && (
        <Card className="border-[#22c55e]/20 bg-[#22c55e]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5 text-[#22c55e]" />
              Your Strongest Concepts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {strongConcepts.slice(0, 5).map((concept, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{concept.concept}</span>
                  <Badge variant="outline" className="text-[#22c55e]">
                    {Math.round(concept.accuracy)}%
                  </Badge>
                </div>
                <Progress value={concept.accuracy} className="h-1" />
                <div className="text-xs text-muted-foreground">
                  {concept.correct} / {concept.questions} correct
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Module Breakdown */}
      {Object.keys(stats.byModule).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-primary" />
              Performance by Module
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.values(stats.byModule).map((moduleStats, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">
                    {moduleStats.moduleId.replace(/-/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {moduleStats.questions} questions
                    </span>
                    <Badge variant="outline" className={getAccuracyColor(moduleStats.accuracy)}>
                      {Math.round(moduleStats.accuracy)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={moduleStats.accuracy} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      {stats.recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Practice Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentSessions.slice(0, 5).map((session, idx) => {
              const accuracy = session.questions.length > 0
                ? (session.score / session.questions.length) * 100
                : 0;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded border border-gray-700/50 bg-card/30 p-3"
                >
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">
                      {session.mode === "concept"
                        ? `📍 ${session.concept}`
                        : session.mode === "module"
                        ? `📚 ${session.moduleId}`
                        : session.mode === "missed"
                        ? "🎯 Missed Questions"
                        : "🎲 Random"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.startTime).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {session.score} / {session.questions.length}
                    </span>
                    <Badge
                      variant="outline"
                      className={getAccuracyColor(accuracy)}
                    >
                      {Math.round(accuracy)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PracticeStats;
