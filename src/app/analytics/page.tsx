"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DomainRadarChart } from "@/components/analytics/DomainRadarChart";
import { StudyRecommendations } from "@/components/analytics/StudyRecommendations";
import { DataExport } from "@/components/analytics/DataExport";
import { AdaptiveDifficulty } from "@/components/analytics/AdaptiveDifficulty";
import { PerformancePredictions } from "@/components/analytics/PerformancePredictions";
import { useProgress } from "@/contexts/ProgressContext";
import { TCODomain } from "@/types/exam";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistentState } from "@/lib/usePersistentState";
import {
  BarChart3,
  Trophy,
  Clock,
  Target,
  Calendar,
  BookOpen,
  Zap,
  Brain,
  Shield,
  Server,
  Wrench,
  Layers,
  AlertTriangle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import BlueprintMeter from "@/components/BlueprintMeter";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { DomainStatsTable } from "@/components/data-table/DomainStatsTable";
import type { DomainStatRow } from "@/components/data-table/types";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const scope = user?.id ? `:u:${user.id}` : "";
  const { getOverallStats, getDomainStats, state } = useProgress();

  // Persist tab selection
  const [activeTab, setActiveTab] = usePersistentState<string>(
    `tco:analytics:activeTab${scope}`,
    "overview"
  );

  // Persist resizable panel sizes
  const [panelSizes, setPanelSizes] = usePersistentState<number[]>(
    `tco:analytics:panelSizes${scope}`,
    [50, 50]
  );

  // Memoize expensive calculations to prevent infinite re-renders
  const overallStats = useMemo(() => getOverallStats(), [getOverallStats]);
  const domainStats = useMemo(() => getDomainStats(), [getDomainStats]);

  // Enhanced stats with additional calculations - memoized
  const enhancedStats = useMemo(() => {
    const correctAnswers = Math.round(
      (overallStats.averageScore / 100) * overallStats.totalQuestions
    );
    
    return {
      ...overallStats,
      correctAnswers,
      incorrectAnswers: overallStats.totalQuestions - correctAnswers,
      sessionCount: state.progress.sessionCount,
      achievements: state.progress.achievements,
      strongestDomain:
        domainStats.length > 0
          ? domainStats.reduce((max, domain) => (domain.score > (max?.score ?? 0) ? domain : max), domainStats[0])?.domain ?? "None"
          : "None",
      weakestDomain:
        domainStats.length > 0
          ? domainStats.reduce((min, domain) => (domain.score < (min?.score ?? 100) ? domain : min), domainStats[0])?.domain ?? "None"
          : "None",
    };
  }, [overallStats, domainStats, state.progress.sessionCount, state.progress.achievements]);

  // Real domain performance from ProgressContext - memoized
  const domainPerformance = useMemo(() => domainStats.map((domain) => {
    const iconMap = {
      [TCODomain.ASKING_QUESTIONS]: BookOpen,
      [TCODomain.REFINING_QUESTIONS]: Server,
      [TCODomain.REFINING_TARGETING]: Server, // Same as REFINING_QUESTIONS
      [TCODomain.TAKING_ACTION]: Layers,
      [TCODomain.NAVIGATION_MODULES]: Shield,
      [TCODomain.REPORTING_EXPORT]: Wrench,
      [TCODomain.SECURITY]: Shield,
      [TCODomain.FUNDAMENTALS]: BookOpen,
      [TCODomain.TROUBLESHOOTING]: AlertTriangle,
    };
    const colorMap = {
      [TCODomain.ASKING_QUESTIONS]: "text-green-400",
      [TCODomain.REFINING_QUESTIONS]: "text-blue-400",
      [TCODomain.REFINING_TARGETING]: "text-blue-400", // Same as REFINING_QUESTIONS
      [TCODomain.TAKING_ACTION]: "text-cyan-400",
      [TCODomain.NAVIGATION_MODULES]: "text-red-400",
      [TCODomain.REPORTING_EXPORT]: "text-yellow-400",
      [TCODomain.SECURITY]: "text-orange-400",
      [TCODomain.FUNDAMENTALS]: "text-cyan-400",
      [TCODomain.TROUBLESHOOTING]: "text-pink-400",
    };
    return {
      domain: domain.domain,
      score: domain.score,
      questions: domain.questionsAnswered,
      correct: domain.correctAnswers,
      icon: iconMap[domain.domain],
      color: colorMap[domain.domain],
    };
  }), [domainStats]);

  const domainRows: DomainStatRow[] = useMemo(() =>
    domainPerformance.map((d) => ({
      domain: d.domain,
      score: Math.round(d.score),
      questions: d.questions,
      correct: d.correct,
    })),
  [domainPerformance]);

  const radarScores = useMemo(() => {
    const find = (dom: TCODomain) => domainStats.find((d) => d.domain === dom);
    return {
      [TCODomain.ASKING_QUESTIONS]: {
        score: find(TCODomain.ASKING_QUESTIONS)?.score ?? 0,
        questionsAnswered: find(TCODomain.ASKING_QUESTIONS)?.questionsAnswered ?? 0,
        correctAnswers: find(TCODomain.ASKING_QUESTIONS)?.correctAnswers ?? 0,
        timeSpent: find(TCODomain.ASKING_QUESTIONS)?.timeSpent ?? 0,
      },
      [TCODomain.REFINING_QUESTIONS]: {
        score: (find(TCODomain.REFINING_TARGETING) || find(TCODomain.REFINING_QUESTIONS))?.score ?? 0,
        questionsAnswered:
          (find(TCODomain.REFINING_TARGETING) || find(TCODomain.REFINING_QUESTIONS))?.questionsAnswered ?? 0,
        correctAnswers:
          (find(TCODomain.REFINING_TARGETING) || find(TCODomain.REFINING_QUESTIONS))?.correctAnswers ?? 0,
        timeSpent:
          (find(TCODomain.REFINING_TARGETING) || find(TCODomain.REFINING_QUESTIONS))?.timeSpent ?? 0,
      },
      [TCODomain.TAKING_ACTION]: {
        score: find(TCODomain.TAKING_ACTION)?.score ?? 0,
        questionsAnswered: find(TCODomain.TAKING_ACTION)?.questionsAnswered ?? 0,
        correctAnswers: find(TCODomain.TAKING_ACTION)?.correctAnswers ?? 0,
        timeSpent: find(TCODomain.TAKING_ACTION)?.timeSpent ?? 0,
      },
      [TCODomain.NAVIGATION_MODULES]: {
        score: find(TCODomain.NAVIGATION_MODULES)?.score ?? 0,
        questionsAnswered: find(TCODomain.NAVIGATION_MODULES)?.questionsAnswered ?? 0,
        correctAnswers: find(TCODomain.NAVIGATION_MODULES)?.correctAnswers ?? 0,
        timeSpent: find(TCODomain.NAVIGATION_MODULES)?.timeSpent ?? 0,
      },
      [TCODomain.REPORTING_EXPORT]: {
        score: find(TCODomain.REPORTING_EXPORT)?.score ?? 0,
        questionsAnswered: find(TCODomain.REPORTING_EXPORT)?.questionsAnswered ?? 0,
        correctAnswers: find(TCODomain.REPORTING_EXPORT)?.correctAnswers ?? 0,
        timeSpent: find(TCODomain.REPORTING_EXPORT)?.timeSpent ?? 0,
      },
      [TCODomain.SECURITY]: {
        score: find(TCODomain.SECURITY)?.score ?? 0,
        questionsAnswered: find(TCODomain.SECURITY)?.questionsAnswered ?? 0,
        correctAnswers: find(TCODomain.SECURITY)?.correctAnswers ?? 0,
        timeSpent: find(TCODomain.SECURITY)?.timeSpent ?? 0,
      },
      [TCODomain.FUNDAMENTALS]: {
        score: find(TCODomain.FUNDAMENTALS)?.score ?? 0,
        questionsAnswered: find(TCODomain.FUNDAMENTALS)?.questionsAnswered ?? 0,
        correctAnswers: find(TCODomain.FUNDAMENTALS)?.correctAnswers ?? 0,
        timeSpent: find(TCODomain.FUNDAMENTALS)?.timeSpent ?? 0,
      },
      [TCODomain.TROUBLESHOOTING]: {
        score: find(TCODomain.TROUBLESHOOTING)?.score ?? 0,
        questionsAnswered: find(TCODomain.TROUBLESHOOTING)?.questionsAnswered ?? 0,
        correctAnswers: find(TCODomain.TROUBLESHOOTING)?.correctAnswers ?? 0,
        timeSpent: find(TCODomain.TROUBLESHOOTING)?.timeSpent ?? 0,
      },
    };
  }, [domainStats]);

  // Real recent activity - will be enhanced with session tracking - memoized
  const recentActivity = useMemo(() =>
    state.progress.sessionCount > 0
      ? [
          {
            date: new Date().toISOString().split("T")[0],
            activity: "Recent Session",
            score: overallStats.averageScore,
            questions: Math.min(overallStats.totalQuestions, 10),
            time: `${Math.round(overallStats.hoursStudied * 60)} min`,
          },
        ]
      : [], 
    [state.progress.sessionCount, overallStats.averageScore, overallStats.totalQuestions, overallStats.hoursStudied]
  );

  // Weekly progress data for future use
  const _weeklyProgress = [
    { week: "Week 1", score: 65, questions: 42 },
    { week: "Week 2", score: 71, questions: 56 },
    { week: "Week 3", score: 76, questions: 68 },
    { week: "Week 4", score: 78, questions: 68 },
  ];

  const getReadinessColor = (level: string) => {
    switch (level) {
      case "Excellent":
        return "text-green-400 border-green-400";
      case "Good":
        return "text-blue-400 border-blue-400";
      case "Fair":
        return "text-yellow-400 border-yellow-400";
      default:
        return "text-red-400 border-red-400";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 70) return "text-blue-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Performance Analytics</h1>
          <p className="mb-6 text-xl text-gray-200">
            Track your progress and identify areas for improvement
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Questions</CardTitle>
              <Target className="h-4 w-4 text-tanium-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{overallStats.totalQuestions}</div>
              <p className="text-xs text-gray-400">practiced this month</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{overallStats.averageScore}%</div>
              <p className="text-xs text-green-400">+5% from last week</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Study Streak</CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{overallStats.studyStreak}</div>
              <p className="text-xs text-gray-400">days in a row</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Exam Readiness</CardTitle>
              <Brain className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{overallStats.readinessLevel}</div>
              <p className="text-xs text-gray-400">based on performance</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass grid w-full grid-cols-7 border border-white/10">
            <TabsTrigger
              value="overview"
              className="text-white data-[state=active]:bg-tanium-accent"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="domains"
              className="text-white data-[state=active]:bg-tanium-accent"
            >
              <Layers className="mr-2 h-4 w-4" />
              Domains
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="text-white data-[state=active]:bg-tanium-accent"
            >
              <Brain className="mr-2 h-4 w-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger
              value="adaptive"
              className="text-white data-[state=active]:bg-tanium-accent"
            >
              <Zap className="mr-2 h-4 w-4" />
              Adaptive
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="text-white data-[state=active]:bg-tanium-accent"
            >
              <Target className="mr-2 h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="export" className="text-white data-[state=active]:bg-tanium-accent">
              <Download className="mr-2 h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="text-white data-[state=active]:bg-tanium-accent"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Overall Performance */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Overall Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-tanium-accent">
                      {overallStats.averageScore}%
                    </div>
                    <p className="text-sm text-gray-300">Average Score</p>
                  </div>
                  <Progress
                    value={overallStats.averageScore}
                    className="h-4"
                    aria-label={`Average score: ${overallStats.averageScore}%`}
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {enhancedStats.correctAnswers}
                      </div>
                      <div className="text-gray-400">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">
                        {enhancedStats.incorrectAnswers}
                      </div>
                      <div className="text-gray-400">Incorrect</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Readiness Assessment */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="h-5 w-5 text-cyan-400" />
                    Exam Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-4 py-2 text-lg",
                        getReadinessColor(overallStats.readinessLevel)
                      )}
                    >
                      {overallStats.readinessLevel}
                    </Badge>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Strongest Domain</span>
                      <Badge variant="secondary" className="bg-green-900/20 text-green-400">
                        {enhancedStats.strongestDomain}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Needs Improvement</span>
                      <Badge variant="secondary" className="bg-red-900/20 text-red-400">
                        {enhancedStats.weakestDomain}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Study Time</span>
                      <span className="font-medium text-white">
                        {overallStats.hoursStudied}h total
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    onClick={() =>
                      router.push(
                        `/domains/${encodeURIComponent(
                          TCODomain.NAVIGATION_MODULES.toLowerCase()
                        )}`
                      )
                    }
                    className="h-auto bg-red-600 p-4 text-white hover:bg-red-700"
                  >
                    <div className="text-center">
                      <Shield className="mx-auto mb-2 h-6 w-6" />
                      <div className="font-medium">Focus on Navigation</div>
                      <div className="text-xs opacity-80">Your weakest area</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => router.push("/mock")}
                    className="h-auto bg-tanium-accent p-4 text-white hover:bg-blue-600"
                  >
                    <div className="text-center">
                      <Clock className="mx-auto mb-2 h-6 w-6" />
                      <div className="font-medium">Take Mock Exam</div>
                      <div className="text-xs opacity-80">Test your progress</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => router.push("/review")}
                    className="h-auto bg-cyan-600 p-4 text-white hover:bg-cyan-700"
                  >
                    <div className="text-center">
                      <AlertTriangle className="mx-auto mb-2 h-6 w-6" />
                      <div className="font-medium">Review Mistakes</div>
                      <div className="text-xs opacity-80">Learn from errors</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domains: Tanium-like split view with resizable panels */}
          <TabsContent value="domains" className="space-y-6">
            <ResizablePanelGroup
              direction="horizontal"
              onLayout={(sizes: number[]) => setPanelSizes(sizes)}
            >
              <ResizablePanel defaultSize={panelSizes[0]} minSize={30}>
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Domain Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DomainStatsTable rows={domainRows} />
                  </CardContent>
                </Card>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={panelSizes[1]} minSize={30}>
                <Card className="glass border-white/10 h-full">
                  <CardHeader>
                    <CardTitle className="text-white">Domain Radar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DomainRadarChart domainScores={radarScores} />
                  </CardContent>
                </Card>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-gray-200">Blueprint Coverage (Content)</CardTitle>
              </CardHeader>
              <CardContent>
                <BlueprintMeter source="content" compact />
              </CardContent>
            </Card>

          <TabsContent value="domains" className="space-y-6">
            <div className="grid gap-6">
              {domainPerformance.map((domain) => {
                const Icon = domain.icon;
                return (
                  <Card key={domain.domain} className="glass border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <Icon className={cn("h-5 w-5", domain.color)} />
                        {domain.domain}
                        <Badge
                          variant="outline"
                          className={cn("ml-auto", getScoreColor(domain.score))}
                        >
                          {domain.score}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress
                        value={domain.score}
                        className="h-3"
                        aria-label={`${domain.domain} score: ${domain.score}%`}
                      />
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{domain.questions}</div>
                          <div className="text-gray-400">Total Questions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{domain.correct}</div>
                          <div className="text-gray-400">Correct</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-400">
                            {domain.questions - domain.correct}
                          </div>
                          <div className="text-gray-400">Incorrect</div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/domains/${encodeURIComponent(domain.domain.toLowerCase())}`
                      )
                    }
                    className="bg-tanium-accent hover:bg-blue-600"
                  >
                          Study {domain.domain}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <PerformancePredictions />
          </TabsContent>

          <TabsContent value="adaptive" className="space-y-6">
            <AdaptiveDifficulty />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <StudyRecommendations />
              <DomainRadarChart
                domainScores={{
                  [TCODomain.ASKING_QUESTIONS]: {
                    score:
                      domainStats.find((d) => d.domain === TCODomain.ASKING_QUESTIONS)?.score ?? 0,
                    questionsAnswered:
                      domainStats.find((d) => d.domain === TCODomain.ASKING_QUESTIONS)
                        ?.questionsAnswered ?? 0,
                    correctAnswers:
                      domainStats.find((d) => d.domain === TCODomain.ASKING_QUESTIONS)
                        ?.correctAnswers ?? 0,
                    timeSpent:
                      domainStats.find((d) => d.domain === TCODomain.ASKING_QUESTIONS)?.timeSpent ?? 0,
                  },
                  [TCODomain.REFINING_QUESTIONS]: {
                    score:
                      domainStats.find((d) => d.domain === TCODomain.REFINING_QUESTIONS)?.score ?? 0,
                    questionsAnswered:
                      domainStats.find((d) => d.domain === TCODomain.REFINING_QUESTIONS)
                        ?.questionsAnswered ?? 0,
                    correctAnswers:
                      domainStats.find((d) => d.domain === TCODomain.REFINING_QUESTIONS)
                        ?.correctAnswers ?? 0,
                    timeSpent:
                      domainStats.find((d) => d.domain === TCODomain.REFINING_QUESTIONS)
                        ?.timeSpent ?? 0,
                  },
                  [TCODomain.REFINING_TARGETING]: {
                    score:
                      (
                        domainStats.find((d) => d.domain === TCODomain.REFINING_TARGETING) ||
                        domainStats.find((d) => d.domain === TCODomain.REFINING_QUESTIONS)
                      )?.score ?? 0,
                    questionsAnswered:
                      (
                        domainStats.find((d) => d.domain === TCODomain.REFINING_TARGETING) ||
                        domainStats.find((d) => d.domain === TCODomain.REFINING_QUESTIONS)
                      )?.questionsAnswered ?? 0,
                    correctAnswers:
                      (
                        domainStats.find((d) => d.domain === TCODomain.REFINING_TARGETING) ||
                        domainStats.find((d) => d.domain === TCODomain.REFINING_QUESTIONS)
                      )?.correctAnswers ?? 0,
                    timeSpent:
                      (
                        domainStats.find((d) => d.domain === TCODomain.REFINING_TARGETING) ||
                        domainStats.find((d) => d.domain === TCODomain.REFINING_QUESTIONS)
                      )?.timeSpent ?? 0,
                  },
                  [TCODomain.TAKING_ACTION]: {
                    score:
                      domainStats.find((d) => d.domain === TCODomain.TAKING_ACTION)?.score ?? 0,
                    questionsAnswered:
                      domainStats.find((d) => d.domain === TCODomain.TAKING_ACTION)
                        ?.questionsAnswered ?? 0,
                    correctAnswers:
                      domainStats.find((d) => d.domain === TCODomain.TAKING_ACTION)
                        ?.correctAnswers ?? 0,
                    timeSpent:
                      domainStats.find((d) => d.domain === TCODomain.TAKING_ACTION)?.timeSpent ?? 0,
                  },
                  [TCODomain.NAVIGATION_MODULES]: {
                    score:
                      domainStats.find((d) => d.domain === TCODomain.NAVIGATION_MODULES)?.score ?? 0,
                    questionsAnswered:
                      domainStats.find((d) => d.domain === TCODomain.NAVIGATION_MODULES)
                        ?.questionsAnswered ?? 0,
                    correctAnswers:
                      domainStats.find((d) => d.domain === TCODomain.NAVIGATION_MODULES)
                        ?.correctAnswers ?? 0,
                    timeSpent:
                      domainStats.find((d) => d.domain === TCODomain.NAVIGATION_MODULES)
                        ?.timeSpent ?? 0,
                  },
                  [TCODomain.REPORTING_EXPORT]: {
                    score:
                      domainStats.find((d) => d.domain === TCODomain.REPORTING_EXPORT)?.score ?? 0,
                    questionsAnswered:
                      domainStats.find((d) => d.domain === TCODomain.REPORTING_EXPORT)
                        ?.questionsAnswered ?? 0,
                    correctAnswers:
                      domainStats.find((d) => d.domain === TCODomain.REPORTING_EXPORT)
                        ?.correctAnswers ?? 0,
                    timeSpent:
                      domainStats.find((d) => d.domain === TCODomain.REPORTING_EXPORT)?.timeSpent ?? 0,
                  },
                  [TCODomain.SECURITY]: {
                    score: domainStats.find((d) => d.domain === TCODomain.SECURITY)?.score ?? 0,
                    questionsAnswered:
                      domainStats.find((d) => d.domain === TCODomain.SECURITY)?.questionsAnswered ?? 0,
                    correctAnswers:
                      domainStats.find((d) => d.domain === TCODomain.SECURITY)?.correctAnswers ?? 0,
                    timeSpent:
                      domainStats.find((d) => d.domain === TCODomain.SECURITY)?.timeSpent ?? 0,
                  },
                  [TCODomain.FUNDAMENTALS]: {
                    score: domainStats.find((d) => d.domain === TCODomain.FUNDAMENTALS)?.score ?? 0,
                    questionsAnswered:
                      domainStats.find((d) => d.domain === TCODomain.FUNDAMENTALS)
                        ?.questionsAnswered ?? 0,
                    correctAnswers:
                      domainStats.find((d) => d.domain === TCODomain.FUNDAMENTALS)
                        ?.correctAnswers ?? 0,
                    timeSpent:
                      domainStats.find((d) => d.domain === TCODomain.FUNDAMENTALS)?.timeSpent ?? 0,
                  },
                  [TCODomain.TROUBLESHOOTING]: {
                    score:
                      domainStats.find((d) => d.domain === TCODomain.TROUBLESHOOTING)?.score ?? 0,
                    questionsAnswered:
                      domainStats.find((d) => d.domain === TCODomain.TROUBLESHOOTING)
                        ?.questionsAnswered ?? 0,
                    correctAnswers:
                      domainStats.find((d) => d.domain === TCODomain.TROUBLESHOOTING)
                        ?.correctAnswers ?? 0,
                    timeSpent:
                      domainStats.find((d) => d.domain === TCODomain.TROUBLESHOOTING)?.timeSpent ?? 0,
                  },
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <DataExport />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Study Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((session, index) => (
                    <div
                      key={index}
                      className="glass flex items-center justify-between rounded-lg border border-white/10 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tanium-accent/20">
                          {session.activity.includes("Mock") ? (
                            <Clock className="h-5 w-5 text-tanium-accent" />
                          ) : session.activity.includes("Domain") ? (
                            <BookOpen className="h-5 w-5 text-tanium-accent" />
                          ) : (
                            <Target className="h-5 w-5 text-tanium-accent" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{session.activity}</div>
                          <div className="text-sm text-gray-400">
                            {session.date} • {session.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={cn(getScoreColor(session.score))}>
                          {session.score}%
                        </Badge>
                        <div className="mt-1 text-sm text-gray-400">
                          {session.questions} questions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  );
}
