"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BarChart3,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle,
  BookOpen,
  Brain,
} from "lucide-react";
import { useModules } from "@/contexts/ModuleContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useIncorrectAnswers } from "@/contexts/IncorrectAnswersContext";
import { cn } from "@/lib/utils";
import type { TCODomain } from "@/types/exam";

interface ResetProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

interface ModuleAnalytics {
  moduleId: string;
  title: string;
  domain: TCODomain;
  timeSpent: number;
  completionPercentage: number;
  questionsAnswered: number;
  accuracy: number;
  lastAccessed: Date | null;
  objectivesCompleted: number;
  totalObjectives: number;
}

export function ResetProgressDialog({
  open,
  onOpenChange,
  onConfirm,
}: ResetProgressDialogProps) {
  const { modules, moduleProgress, resetProgress: resetModuleProgress } = useModules();
  const { state: progressState, getOverallStats, getDomainStats } = useProgress();
  const { state: incorrectState, getTotalIncorrectCount, getDomainStats: getIncorrectDomainStats } = useIncorrectAnswers();

  const [isResetting, setIsResetting] = useState(false);
  const [moduleAnalytics, setModuleAnalytics] = useState<ModuleAnalytics[]>([]);
  const [showFinalWarning, setShowFinalWarning] = useState(false);

  useEffect(() => {
    // Calculate module analytics
    const analytics: ModuleAnalytics[] = modules.map((module) => {
      const progress = moduleProgress[module.id] || {};
      const timeSpent = progress.totalTimeSpent || 0;
      const completionPercentage = progress.overallProgress || 0;
      const objectivesCompleted = Array.isArray(progress.sectionsCompleted)
        ? progress.sectionsCompleted.length
        : 0;
      const totalObjectives = module.objectives?.length || 0;

      return {
        moduleId: module.id,
        title: module.title,
        domain: module.domain as TCODomain,
        timeSpent,
        completionPercentage,
        questionsAnswered: 0, // Would need to calculate from practice sessions
        accuracy: 0, // Would need to calculate from practice sessions
        lastAccessed: progress.lastAccessedAt || null,
        objectivesCompleted,
        totalObjectives,
      };
    });

    setModuleAnalytics(analytics.filter(a => a.timeSpent > 0 || a.completionPercentage > 0));
  }, [modules, moduleProgress]);

  const overallStats = getOverallStats();
  const domainStats = getDomainStats();
  const incorrectDomainStats = getIncorrectDomainStats();
  const totalIncorrect = getTotalIncorrectCount();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleReset = async () => {
    setIsResetting(true);

    // Simulate reset process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Call the actual reset functions
    onConfirm();

    setIsResetting(false);
    setShowFinalWarning(false);
    onOpenChange(false);
  };

  const totalTimeInvested = moduleAnalytics.reduce((sum, m) => sum + m.timeSpent, 0);
  const completedModules = moduleAnalytics.filter(m => m.completionPercentage === 100).length;
  const averageAccuracy = domainStats.reduce((sum, d) => sum + (d.percentage || 0), 0) / (domainStats.length || 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Reset All Progress
          </DialogTitle>
          <DialogDescription>
            Review your learning journey before resetting. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="domains">Domains</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Total Time Invested
                      </div>
                      <p className="text-2xl font-bold">{formatTime(totalTimeInvested)}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        Study Streak
                      </div>
                      <p className="text-2xl font-bold">{overallStats.studyStreak} days</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        Average Score
                      </div>
                      <p className="text-2xl font-bold">{Math.round(averageAccuracy)}%</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        Modules Completed
                      </div>
                      <p className="text-2xl font-bold">
                        {completedModules}/{modules.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="border-yellow-200 bg-yellow-50/10">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription>
                  <strong>You will lose:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>{overallStats.totalQuestions} answered questions</li>
                    <li>{totalIncorrect} questions marked for review</li>
                    <li>All module progress and completion status</li>
                    <li>Performance analytics and insights</li>
                    <li>Study streak of {overallStats.studyStreak} days</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="modules" className="space-y-4">
              {moduleAnalytics.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No module progress to display
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {moduleAnalytics.map((module) => (
                    <Card key={module.moduleId}>
                      <CardContent className="py-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{module.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {module.domain}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {module.completionPercentage}% complete
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(module.timeSpent)} spent
                              </p>
                            </div>
                          </div>

                          <Progress value={module.completionPercentage} className="h-2" />

                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {module.objectivesCompleted}/{module.totalObjectives} objectives
                            </span>
                            {module.lastAccessed && (
                              <span>
                                Last accessed: {new Date(module.lastAccessed).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="domains" className="space-y-4">
              <div className="space-y-3">
                {domainStats.map((domain) => {
                  const incorrectCount = incorrectDomainStats[domain.domain]?.count || 0;
                  const reviewedCount = incorrectDomainStats[domain.domain]?.reviewed || 0;

                  return (
                    <Card key={domain.domain}>
                      <CardContent className="py-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{domain.domain}</p>
                              <p className="text-sm text-muted-foreground">
                                {domain.questionsAnswered} questions answered
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {Math.round(domain.percentage)}% accuracy
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(domain.timeSpent)} spent
                              </p>
                            </div>
                          </div>

                          <Progress value={domain.percentage} className="h-2" />

                          {incorrectCount > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-yellow-600">
                                {incorrectCount - reviewedCount} needs review
                              </span>
                              <span className="text-muted-foreground">
                                {reviewedCount} reviewed
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex gap-2">
          {!showFinalWarning ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isResetting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowFinalWarning(true)}
                disabled={isResetting}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Continue with Reset
              </Button>
            </>
          ) : (
            <>
              <Alert className="flex-1 border-red-200 bg-red-50/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription>
                  <strong>Final Confirmation:</strong> Type "RESET" to confirm you want to permanently delete all progress.
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                onClick={() => setShowFinalWarning(false)}
                disabled={isResetting}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Reset Everything
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
