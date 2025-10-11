/**
 * Practice Session Summary Component
 * Displays results and performance metrics after completing a practice session
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PracticeSessionSummaryProps } from "@/types";
import {
  Award,
  Brain,
  CheckCircle2,
  Clock,
  RotateCcw,
  Target,
  TrendingUp,
  Trophy,
  X,
  XCircle,
} from "lucide-react";

export function PracticeSessionSummary({
  session,
  onRestart,
  onClose,
}: PracticeSessionSummaryProps) {
  const { timeSpent, questions, answers, config, score, correctCount, totalQuestions } = session;

  const correctAnswers = correctCount;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const avgTimePerQuestion = totalQuestions > 0 ? timeSpent / totalQuestions : 0;

  // Calculate domain performance
  const domainStats: Record<string, { correct: number; total: number }> = {};

  questions.forEach((question: any, index: number) => {
    if (!domainStats[question.domain]) {
      domainStats[question.domain] = { correct: 0, total: 0 };
    }
    domainStats[question.domain].total++;
    if (answers[question.id] === question.correctAnswerId) {
      domainStats[question.domain].correct++;
    }
  });

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-[#22c55e]";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: "default" as const, text: "Excellent", icon: Trophy };
    if (percentage >= 80) return { variant: "secondary" as const, text: "Good", icon: Award };
    if (percentage >= 70) return { variant: "outline" as const, text: "Fair", icon: Target };
    return { variant: "destructive" as const, text: "Needs Work", icon: Brain };
  };

  const performanceBadge = getPerformanceBadge(accuracy);
  const PerformanceIcon = performanceBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PerformanceIcon className="h-6 w-6" />
              Practice Session Complete
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overall Performance */}
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold">{accuracy.toFixed(1)}%</span>
              <Badge variant={performanceBadge.variant}>{performanceBadge.text}</Badge>
            </div>
            <p className="text-muted-foreground">
              {correctAnswers} of {totalQuestions} questions correct
            </p>
            <Progress value={accuracy} className="w-full" />
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center">
                <CheckCircle2 className="mr-1 h-4 w-4 text-[#22c55e]" />
                <span className="font-semibold text-[#22c55e]">{correctAnswers}</span>
              </div>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>

            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center">
                <XCircle className="mr-1 h-4 w-4 text-red-600" />
                <span className="font-semibold text-red-600">
                  {totalQuestions - correctAnswers}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>

            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center">
                <Clock className="mr-1 h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-600">
                  {Math.round(avgTimePerQuestion)}s
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Avg Time</p>
            </div>
          </div>

          {/* Domain Breakdown */}
          {Object.keys(domainStats).length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4" />
                Domain Performance
              </h3>

              <div className="space-y-2">
                {Object.entries(domainStats).map(([domain, stats]) => {
                  const domainAccuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                  return (
                    <div key={domain} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">{domain}</span>
                          <span
                            className={`text-sm font-semibold ${getPerformanceColor(domainAccuracy)}`}
                          >
                            {domainAccuracy.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {stats.correct}/{stats.total} correct
                          </span>
                        </div>
                        <Progress value={domainAccuracy} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Session Details */}
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Time:</span>
              <span>{Math.round(timeSpent / 60)} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Questions:</span>
              <span>{totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="capitalize">Practice</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {onRestart && (
              <Button onClick={onRestart} className="flex-1" variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}

            {onClose && (
              <Button onClick={onClose} className="flex-1">
                Continue Learning
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PracticeSessionSummary;
