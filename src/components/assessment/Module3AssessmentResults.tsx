/**
 * Module 3 Assessment Results Component
 * Displays comprehensive assessment results for the 9-section structure
 */

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Award,
  BarChart3,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Module3Section, MODULE_3_SECTIONS } from "@/lib/module3-section-definitions";
import type { Module3AssessmentResult } from "@/lib/module3-assessment-engine";

interface Module3AssessmentResultsProps {
  result: Module3AssessmentResult;
  onRetakeSection?: (sectionId: Module3Section) => void;
  onStudySection?: (sectionId: Module3Section) => void;
  onRetakeAll?: () => void;
  className?: string;
}

export function Module3AssessmentResults({
  result,
  onRetakeSection,
  onStudySection,
  onRetakeAll,
  className,
}: Module3AssessmentResultsProps) {
  const {
    overallScore,
    overallAccuracy,
    totalTimeSpent,
    passed,
    sectionResults,
    strengths,
    weaknesses,
    gapsIdentified,
    recommendations,
    certificationReadiness,
  } = result;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.85) return "text-[#22c55e]";
    if (score >= 0.75) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case "ready":
        return "text-[#22c55e] bg-green-50 border-green-200";
      case "almost_ready":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "needs_work":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const sortedSections = useMemo(() => {
    return Object.entries(sectionResults).sort(([, a], [, b]) => b.score - a.score);
  }, [sectionResults]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Results Header */}
      <Card
        className={cn(
          "border-2",
          passed ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              {passed ? (
                <CheckCircle className="h-8 w-8 text-[#22c55e]" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              Module 3 Assessment {passed ? "Passed" : "Failed"}
            </CardTitle>
            <Badge variant={passed ? "default" : "destructive"} className="px-4 py-2 text-lg">
              {Math.round(overallScore * 100)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(overallScore * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(overallAccuracy * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{formatTime(totalTimeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </div>
          </div>
          <Progress value={overallScore * 100} className="h-3" />
        </CardContent>
      </Card>

      {/* Certification Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certification Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "rounded-lg border p-4",
              getReadinessColor(certificationReadiness.overallReadiness)
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-lg font-semibold">
                {certificationReadiness.overallReadiness.replace("_", " ").toUpperCase()}
              </span>
              <span className="text-2xl font-bold">{certificationReadiness.score}%</span>
            </div>
            <div className="text-sm opacity-80">
              {certificationReadiness.overallReadiness === "ready" &&
                "You're ready for the TCO exam! Continue practicing to maintain your skills."}
              {certificationReadiness.overallReadiness === "almost_ready" &&
                "You're close to being ready. Focus on the areas below for improvement."}
              {certificationReadiness.overallReadiness === "needs_work" &&
                "More preparation needed. Review the priority areas and retake practice sessions."}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Section Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedSections.map(([sectionId, sectionResult]) => {
            const section = MODULE_3_SECTIONS[sectionId as Module3Section];
            const readiness = certificationReadiness.areas[sectionId as Module3Section];

            return (
              <div key={sectionId} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {sectionResult.passed ? (
                        <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {section.difficulty}
                    </Badge>
                    <Badge
                      variant={
                        readiness === "strong"
                          ? "default"
                          : readiness === "adequate"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {readiness.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className={cn("text-lg font-bold", getScoreColor(sectionResult.score))}>
                    {Math.round(sectionResult.score * 100)}%
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="ml-1 font-medium">
                      {sectionResult.questionsCorrect}/{sectionResult.questionsAttempted}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="ml-1 font-medium">
                      {Math.round(sectionResult.accuracy * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <span className="ml-1 font-medium">{formatTime(sectionResult.timeSpent)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Objectives:</span>
                    <span className="ml-1 font-medium">
                      {sectionResult.objectivesMet.length}/
                      {sectionResult.objectivesMet.length + sectionResult.objectivesMissed.length}
                    </span>
                  </div>
                </div>

                <Progress value={sectionResult.score * 100} className="mb-3 h-2" />

                {sectionResult.recommendations.length > 0 && (
                  <div className="rounded bg-muted/30 p-3 text-sm">
                    <div className="mb-1 flex items-center gap-1 font-medium">
                      <Lightbulb className="h-3 w-3" />
                      Recommendations:
                    </div>
                    <ul className="space-y-1">
                      {sectionResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStudySection?.(sectionId as Module3Section)}
                  >
                    <BookOpen className="mr-1 h-3 w-3" />
                    Study
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetakeSection?.(sectionId as Module3Section)}
                  >
                    <Target className="mr-1 h-3 w-3" />
                    Practice
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#22c55e]">
              <TrendingUp className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((sectionId) => (
                  <li key={sectionId} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                    <span>{MODULE_3_SECTIONS[sectionId].title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Focus on improving overall performance to identify strengths.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length > 0 || gapsIdentified.length > 0 ? (
              <div className="space-y-3">
                {weaknesses.length > 0 && (
                  <div>
                    <div className="mb-2 text-sm font-medium">Weak Performance:</div>
                    <ul className="space-y-1">
                      {weaknesses.map((sectionId) => (
                        <li key={sectionId} className="flex items-center gap-2 text-sm">
                          <XCircle className="h-3 w-3 text-red-500" />
                          <span>{MODULE_3_SECTIONS[sectionId].title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {gapsIdentified.length > 0 && (
                  <div>
                    <div className="mb-2 text-sm font-medium">Not Attempted:</div>
                    <ul className="space-y-1">
                      {gapsIdentified.map((sectionId) => (
                        <li key={sectionId} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-[#f97316]" />
                          <span>{MODULE_3_SECTIONS[sectionId].title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Great job! No major areas of concern identified.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.priorityAreas.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium">Priority Areas:</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.priorityAreas.map((sectionId) => (
                  <Badge key={sectionId} variant="outline">
                    {MODULE_3_SECTIONS[sectionId].title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 font-medium">Suggested Study Time:</h4>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{recommendations.suggestedStudyTime} minutes additional study recommended</span>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Next Steps:</h4>
            <ul className="space-y-1">
              {recommendations.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="mt-0.5 h-3 w-3 text-muted-foreground" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            {!passed && (
              <Button onClick={onRetakeAll} className="flex-1">
                <Target className="mr-2 h-4 w-4" />
                Retake Assessment
              </Button>
            )}
            <Button variant="outline" className="flex-1">
              <BookOpen className="mr-2 h-4 w-4" />
              Continue Studying
            </Button>
            <Button variant="outline" className="flex-1">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
