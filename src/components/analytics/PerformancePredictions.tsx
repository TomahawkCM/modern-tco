"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/contexts/ProgressContext";
import type { TCODomain } from "@/types/exam";
import { useMemo } from "react";
import {
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Brain,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Zap,
  BookOpen,
  BarChart3,
  Activity,
} from "lucide-react";

interface PredictionModel {
  examReadiness: {
    score: number;
    level: "Poor" | "Fair" | "Good" | "Excellent" | "Exam Ready";
    confidence: number;
    timeToReady: string;
    requiredSessions: number;
  };
  domainPredictions: {
    domain: TCODomain;
    currentScore: number;
    predictedScore: number;
    confidence: number;
    recommendation: string;
  }[];
  studyInsights: {
    optimalStudyTime: string;
    suggestedFrequency: string;
    weeklyTarget: number;
    predictedGrowth: number;
  };
  examSimulation: {
    passLikelihood: number;
    expectedScore: number;
    strengthAreas: string[];
    focusAreas: string[];
  };
}

export function PerformancePredictions() {
  const { getDomainStats, getOverallStats, state } = useProgress();
  
  // Memoize expensive function calls to prevent infinite re-renders
  const domainStats = useMemo(() => getDomainStats(), [getDomainStats]);
  const overallStats = useMemo(() => getOverallStats(), [getOverallStats]);

  // AI-powered prediction model
  const generatePredictions = (): PredictionModel => {
    const { totalQuestions } = overallStats;
    const avgScore = overallStats.averageScore;
    const { studyStreak } = overallStats;
    const { sessionCount } = state.progress;

    // Calculate exam readiness
    const readinessFactors = {
      avgScore: Math.min(avgScore / 85, 1), // 85% is target for exam readiness
      consistency: Math.min(studyStreak / 14, 1), // 2 weeks streak is ideal
      practice: Math.min(totalQuestions / 500, 1), // 500 questions is comprehensive
      coverage: Math.min(sessionCount / 20, 1), // 20 sessions shows commitment
    };

    const readinessScore = Math.round(
      (readinessFactors.avgScore * 0.4 +
        readinessFactors.consistency * 0.2 +
        readinessFactors.practice * 0.3 +
        readinessFactors.coverage * 0.1) *
        100
    );

    let readinessLevel: PredictionModel["examReadiness"]["level"] = "Poor";
    let timeToReady = "8-12 weeks";
    let requiredSessions = 30;

    if (readinessScore >= 90) {
      readinessLevel = "Exam Ready";
      timeToReady = "Ready now";
      requiredSessions = 0;
    } else if (readinessScore >= 75) {
      readinessLevel = "Excellent";
      timeToReady = "1-2 weeks";
      requiredSessions = 3;
    } else if (readinessScore >= 60) {
      readinessLevel = "Good";
      timeToReady = "2-4 weeks";
      requiredSessions = 8;
    } else if (readinessScore >= 40) {
      readinessLevel = "Fair";
      timeToReady = "4-6 weeks";
      requiredSessions = 15;
    }

    // Domain predictions
    const domainPredictions = domainStats.map((domain) => {
      const currentScore = domain.score;
      const { questionsAnswered } = domain;

      // Predict improvement based on current trajectory
      const growthRate =
        questionsAnswered > 10
          ? Math.min((currentScore - 50) / 10, 5) // Assume 50% baseline
          : 2; // Default growth rate

      const predictedScore = Math.min(currentScore + growthRate * 2, 100);
      const confidence = Math.min(questionsAnswered * 5, 95); // Confidence based on data points

      let recommendation = "Continue current pace";
      if (currentScore < 60) {
        recommendation = "Intensive study needed - focus on fundamentals";
      } else if (currentScore < 75) {
        recommendation = "Regular practice with targeted improvement";
      } else if (currentScore >= 85) {
        recommendation = "Maintain proficiency with light practice";
      }

      return {
        domain: domain.domain,
        currentScore,
        predictedScore,
        confidence,
        recommendation,
      };
    });

    // Study insights
    const studyInsights = {
      optimalStudyTime:
        avgScore < 60 ? "45-60 minutes" : avgScore < 80 ? "30-45 minutes" : "20-30 minutes",
      suggestedFrequency:
        studyStreak < 7 ? "Daily" : studyStreak < 14 ? "5-6 times per week" : "4-5 times per week",
      weeklyTarget: avgScore < 60 ? 100 : avgScore < 80 ? 75 : 50,
      predictedGrowth: Math.round(Math.min(15 - avgScore / 10, 8)),
    };

    // Exam simulation
    const strongDomains = domainStats.filter((d) => d.score >= 75).map((d) => d.domain);
    const weakDomains = domainStats.filter((d) => d.score < 65).map((d) => d.domain);

    const examSimulation = {
      passLikelihood: Math.min(Math.max((avgScore - 50) * 2, 0), 100),
      expectedScore: Math.round(avgScore + studyStreak * 0.5),
      strengthAreas: strongDomains,
      focusAreas: weakDomains,
    };

    return {
      examReadiness: {
        score: readinessScore,
        level: readinessLevel,
        confidence: Math.min(totalQuestions * 2, 95),
        timeToReady,
        requiredSessions,
      },
      domainPredictions,
      studyInsights,
      examSimulation,
    };
  };

  const predictions = generatePredictions();

  const getReadinessColor = (level: string) => {
    switch (level) {
      case "Exam Ready":
        return "text-[#22c55e] border-green-400 bg-green-400/10";
      case "Excellent":
        return "text-primary border-blue-400 bg-blue-400/10";
      case "Good":
        return "text-[#f97316] border-yellow-400 bg-yellow-400/10";
      case "Fair":
        return "text-orange-400 border-orange-400 bg-orange-400/10";
      default:
        return "text-red-400 border-red-400 bg-red-400/10";
    }
  };

  const getReadinessIcon = (level: string) => {
    switch (level) {
      case "Exam Ready":
        return Trophy;
      case "Excellent":
        return CheckCircle;
      case "Good":
        return Target;
      case "Fair":
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Brain className="h-5 w-5 text-tanium-accent" />
          Performance Predictions & Exam Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exam Readiness Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div
              className={`rounded-lg border p-6 ${getReadinessColor(predictions.examReadiness.level)}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-xl font-bold text-foreground">
                    Exam Readiness: {predictions.examReadiness.score}%
                  </h3>
                  <Badge className={getReadinessColor(predictions.examReadiness.level)}>
                    {predictions.examReadiness.level}
                  </Badge>
                </div>
                {(() => {
                  const Icon = getReadinessIcon(predictions.examReadiness.level);
                  return <Icon className="h-8 w-8 text-current" />;
                })()}
              </div>

              <Progress value={predictions.examReadiness.score} className="mb-4 h-3" />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Time to Ready</span>
                  </div>
                  <p className="font-medium text-foreground">{predictions.examReadiness.timeToReady}</p>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm">Sessions Needed</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {predictions.examReadiness.requiredSessions} sessions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-lg border border-white/10 p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                <Target className="h-4 w-4 text-tanium-accent" />
                Pass Likelihood
              </h4>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-tanium-accent">
                  {predictions.examSimulation.passLikelihood}%
                </div>
                <Progress value={predictions.examSimulation.passLikelihood} className="h-2" />
              </div>
            </div>

            <div className="glass rounded-lg border border-white/10 p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                <BarChart3 className="h-4 w-4 text-tanium-accent" />
                Expected Score
              </h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-tanium-accent">
                  {predictions.examSimulation.expectedScore}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Domain Predictions */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-medium text-foreground">
            <TrendingUp className="h-4 w-4 text-tanium-accent" />
            Domain Performance Predictions
          </h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {predictions.domainPredictions.map((prediction) => (
              <div key={prediction.domain} className="glass rounded-lg border border-white/10 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h5 className="text-sm font-medium text-foreground">{prediction.domain}</h5>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor:
                        prediction.confidence > 70
                          ? "#10B981"
                          : prediction.confidence > 50
                            ? "#F59E0B"
                            : "#EF4444",
                      color:
                        prediction.confidence > 70
                          ? "#10B981"
                          : prediction.confidence > 50
                            ? "#F59E0B"
                            : "#EF4444",
                    }}
                  >
                    {prediction.confidence}% confidence
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current</span>
                    <span className="font-medium text-foreground">{prediction.currentScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Predicted</span>
                    <span className="font-medium text-tanium-accent">
                      {prediction.predictedScore}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {prediction.predictedScore > prediction.currentScore ? (
                      <TrendingUp className="h-3 w-3 text-[#22c55e]" />
                    ) : (
                      <Activity className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {prediction.predictedScore > prediction.currentScore ? "+" : ""}
                      {Math.round(prediction.predictedScore - prediction.currentScore)} points
                    </span>
                  </div>
                </div>

                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="text-xs text-muted-foreground">{prediction.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Insights */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass rounded-lg border border-white/10 p-4">
            <h4 className="mb-4 flex items-center gap-2 font-medium text-foreground">
              <Calendar className="h-4 w-4 text-tanium-accent" />
              Optimized Study Plan
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Session Length</span>
                <span className="font-medium text-foreground">
                  {predictions.studyInsights.optimalStudyTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Frequency</span>
                <span className="font-medium text-foreground">
                  {predictions.studyInsights.suggestedFrequency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weekly Target</span>
                <span className="font-medium text-foreground">
                  {predictions.studyInsights.weeklyTarget} questions
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expected Growth</span>
                <span className="font-medium text-tanium-accent">
                  +{predictions.studyInsights.predictedGrowth}% per month
                </span>
              </div>
            </div>
          </div>

          <div className="glass rounded-lg border border-white/10 p-4">
            <h4 className="mb-4 flex items-center gap-2 font-medium text-foreground">
              <Zap className="h-4 w-4 text-tanium-accent" />
              Focus Areas
            </h4>
            <div className="space-y-3">
              <div>
                <span className="mb-2 block text-sm text-muted-foreground">Strengths to Maintain</span>
                <div className="flex flex-wrap gap-2">
                  {predictions.examSimulation.strengthAreas.length > 0 ? (
                    predictions.examSimulation.strengthAreas.map((area) => (
                      <Badge key={area} className="border-green-400 bg-green-400/10 text-[#22c55e]">
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Continue building strengths</span>
                  )}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm text-muted-foreground">Priority Focus</span>
                <div className="flex flex-wrap gap-2">
                  {predictions.examSimulation.focusAreas.length > 0 ? (
                    predictions.examSimulation.focusAreas.map((area) => (
                      <Badge key={area} className="border-red-400 bg-red-400/10 text-red-400">
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-[#22c55e]">All domains performing well!</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="glass rounded-lg border border-yellow-400/20 bg-yellow-400/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#f97316]" />
            <div>
              <h4 className="mb-1 font-medium text-[#f97316]">Prediction Methodology</h4>
              <p className="text-sm text-muted-foreground">
                These predictions are based on your current performance patterns, study consistency,
                and practice volume. Results may vary based on individual learning pace and study
                quality. Use as guidance alongside your personal assessment of readiness.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
