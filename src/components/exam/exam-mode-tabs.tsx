"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Target,
  FileText,
  AlertTriangle,
  Clock,
  Trophy,
  BookOpen,
  BarChart3,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Users,
  Brain,
  Zap,
} from "lucide-react";
import { ExamTooltip, QuickTips } from "@/components/ui/help-tooltip";
import { cn } from "@/lib/utils";

interface ExamModeTabsProps {
  onModeSelect?: (mode: string, config?: any) => void;
  currentProgress?: {
    practice: number;
    mock: number;
    review: number;
  };
}

export function ExamModeTabs({
  onModeSelect,
  currentProgress = { practice: 65, mock: 45, review: 80 },
}: ExamModeTabsProps) {
  const [selectedMode, setSelectedMode] = useState("practice");

  const handleModeStart = (mode: string, config?: any) => {
    setSelectedMode(mode);
    onModeSelect?.(mode, config);
  };

  // Mock data for different exam configurations
  const examConfigs = {
    practice: [
      {
        id: "practice-mixed",
        title: "Mixed Questions",
        description: "Questions from all TCO domains",
        questions: 20,
        timeLimit: null,
        difficulty: "mixed",
        icon: BookOpen,
        color: "text-primary",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      {
        id: "practice-fundamentals",
        title: "Fundamentals Only",
        description: "Focus on basic concepts",
        questions: 15,
        timeLimit: null,
        difficulty: "basic",
        icon: Brain,
        color: "text-[#22c55e]",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      },
      {
        id: "practice-advanced",
        title: "Advanced Topics",
        description: "Complex scenarios and analysis",
        questions: 10,
        timeLimit: null,
        difficulty: "advanced",
        icon: Zap,
        color: "text-primary",
        bgColor: "bg-cyan-50 dark:bg-primary/20",
      },
    ],
    mock: [
      {
        id: "mock-full",
        title: "Full Mock Exam",
        description: "Complete 75-question simulation",
        questions: 75,
        timeLimit: 120,
        difficulty: "mixed",
        icon: FileText,
        color: "text-orange-500",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      },
      {
        id: "mock-quick",
        title: "Quick Assessment",
        description: "30-minute evaluation",
        questions: 25,
        timeLimit: 30,
        difficulty: "mixed",
        icon: Clock,
        color: "text-[#f97316]",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      },
      {
        id: "mock-domain",
        title: "Domain Focus",
        description: "Test specific knowledge area",
        questions: 40,
        timeLimit: 60,
        difficulty: "mixed",
        icon: Target,
        color: "text-red-500",
        bgColor: "bg-red-50 dark:bg-red-900/20",
      },
    ],
    review: [
      {
        id: "review-missed",
        title: "Missed Questions",
        description: "Review your incorrect answers",
        questions: 12,
        timeLimit: null,
        difficulty: "mixed",
        icon: XCircle,
        color: "text-red-500",
        bgColor: "bg-red-50 dark:bg-red-900/20",
      },
      {
        id: "review-flagged",
        title: "Flagged for Review",
        description: "Questions you marked for later",
        questions: 8,
        timeLimit: null,
        difficulty: "mixed",
        icon: AlertTriangle,
        color: "text-amber-500",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
      },
      {
        id: "review-weak",
        title: "Weak Areas",
        description: "Focus on low-scoring domains",
        questions: 15,
        timeLimit: null,
        difficulty: "mixed",
        icon: BarChart3,
        color: "text-primary",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
    ],
  };

  const renderModeConfig = (config: any) => {
    const Icon = config.icon;

    return (
      <Card
        key={config.id}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          "border-2 hover:border-primary/50",
          config.bgColor
        )}
        onClick={() => handleModeStart(selectedMode, config)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("rounded-lg bg-white/50 p-2 dark:bg-black/20")}>
                <Icon className={cn("h-5 w-5", config.color)} />
              </div>
              <div>
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <CardDescription className="text-sm">{config.description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>{config.questions} questions</span>
              </div>
              {config.timeLimit && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{config.timeLimit} min</span>
                </div>
              )}
              <Badge variant="outline" className="text-xs">
                {config.difficulty}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Tabs value={selectedMode} onValueChange={setSelectedMode} className="w-full">
        <TabsList className="glass grid w-full grid-cols-3">
          <TabsTrigger value="practice" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Practice</span>
            <div className="ml-1 flex w-10 items-center">
              <Progress value={currentProgress.practice} className="h-1" />
            </div>
          </TabsTrigger>
          <TabsTrigger value="mock" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Mock Exam</span>
            <div className="ml-1 flex w-10 items-center">
              <Progress value={currentProgress.mock} className="h-1" />
            </div>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Review</span>
            <div className="ml-1 flex w-10 items-center">
              <Progress value={currentProgress.review} className="h-1" />
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Practice Mode</h2>
                <p className="text-muted-foreground">
                  Learn at your own pace with immediate feedback
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <div className="font-medium">{currentProgress.practice}%</div>
                </div>
                <Progress value={currentProgress.practice} className="w-20" />
                <ExamTooltip type="mode" context="Practice Mode" />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {examConfigs.practice.map(renderModeConfig)}
            </div>

            <Card className="glass border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Practice Mode Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                    <span>Immediate feedback on each question</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                    <span>Detailed explanations for correct answers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                    <span>No time pressure - learn at your pace</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                    <span>Track progress across all domains</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mock" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Mock Exam</h2>
                <p className="text-muted-foreground">
                  Simulate real exam conditions with timed assessments
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Completion</div>
                  <div className="font-medium">{currentProgress.mock}%</div>
                </div>
                <Progress value={currentProgress.mock} className="w-20" />
                <ExamTooltip type="mode" context="Mock Exam" />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {examConfigs.mock.map(renderModeConfig)}
            </div>

            <Card className="glass border-orange-200 bg-orange-50/50 dark:bg-orange-900/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Mock Exam Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>Timed conditions matching real exam</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-[#f97316]" />
                    <span>Comprehensive scoring and analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span>Performance tracking across attempts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-[#22c55e]" />
                    <span>Compare with other candidates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Review Mode</h2>
                <p className="text-muted-foreground">Focus on areas that need improvement</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Mastery</div>
                  <div className="font-medium">{currentProgress.review}%</div>
                </div>
                <Progress value={currentProgress.review} className="w-20" />
                <ExamTooltip type="mode" context="Review Mode" />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {examConfigs.review.map(renderModeConfig)}
            </div>

            <Card className="glass border-green-200 bg-green-50/50 dark:bg-green-900/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-[#22c55e]" />
                  <span>Review Mode Strategy</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Focus on previously missed questions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span>Reinforce learning with explanations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span>Identify and strengthen weak areas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-red-500" />
                    <span>Boost confidence before exam day</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
