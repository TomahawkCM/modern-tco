/**
 * GlobalProgressIndicator - Persistent progress indicator across all pages
 * Shows overall certification readiness and next recommended step
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, BookOpen, Target, FileText, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalProgressIndicatorProps {
  className?: string;
  compact?: boolean;
  showNextStep?: boolean;
}

export function GlobalProgressIndicator({
  className,
  compact = false,
  showNextStep = true,
}: GlobalProgressIndicatorProps) {
  const router = useRouter();
  // Mock progress data - in real app, would come from global context/state
  const [progressData] = useState({
    overallProgress: 67,
    studyProgress: 65,
    practiceProgress: 35,
    examProgress: 0,
    readinessLevel: "Good Progress",
    nextStep: {
      phase: "practice",
      title: "Continue Practice",
      description: "Practice questions in weaker domains",
      path: "/domains/taking-action",
      icon: Target,
    },
  });

  const getReadinessColor = (progress: number) => {
    if (progress >= 80) return "text-green-400";
    if (progress >= 60) return "text-blue-400";
    if (progress >= 40) return "text-yellow-400";
    return "text-gray-400";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-tanium-accent" />
          <span className="text-sm font-medium text-white">{progressData.overallProgress}%</span>
        </div>
        <div className="w-24">
          <Progress value={progressData.overallProgress} className="h-2" />
        </div>
        <Badge
          variant="outline"
          className={cn("text-xs", getReadinessColor(progressData.overallProgress))}
        >
          {progressData.readinessLevel}
        </Badge>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-black/20 p-4 backdrop-blur-sm",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-tanium-accent" />
          <div>
            <div className="text-lg font-semibold text-white">
              {progressData.overallProgress}% Complete
            </div>
            <div className={cn("text-sm", getReadinessColor(progressData.overallProgress))}>
              {progressData.readinessLevel}
            </div>
          </div>
        </div>

        {showNextStep && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-medium text-white">Next Step</div>
              <div className="text-xs text-gray-400">{progressData.nextStep.title}</div>
            </div>
            <Button
              size="sm"
              onClick={() => router.push(progressData.nextStep.path)}
              className="bg-tanium-accent hover:bg-blue-600"
            >
              <progressData.nextStep.icon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Progress value={progressData.overallProgress} className="h-2" />

        <div className="flex justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>Study: {progressData.studyProgress}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>Practice: {progressData.practiceProgress}%</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Mock: {progressData.examProgress}%</span>
          </div>
        </div>
      </div>

      {showNextStep && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-300">{progressData.nextStep.description}</div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(progressData.nextStep.path)}
              className="h-6 border-white/20 text-xs text-white hover:bg-white/10"
            >
              Continue
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick access component for sidebar/header
export function QuickProgressIndicator({ className }: { className?: string }) {
  return <GlobalProgressIndicator className={className} compact={true} showNextStep={false} />;
}
