"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Target,
  FileText,
  CheckCircle,
  ArrowRight,
  Clock,
  Play,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyMode {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  estimatedTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
  available: boolean;
  path: string;
}

interface StudyModeSelectorProps {
  className?: string;
}

export function StudyModeSelector({ className }: StudyModeSelectorProps) {
  const router = useRouter();

  const studyModes: StudyMode[] = [
    {
      id: "study-content",
      title: "Study Content",
      description: "Learn core concepts through comprehensive modules before practicing",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-blue-900/20",
      borderColor: "border-blue-400",
      estimatedTime: "30-60 min per module",
      difficulty: "Beginner",
      progress: 65,
      available: true,
      path: "/study",
    },
    {
      id: "practice-questions",
      title: "Practice Questions",
      description: "Test your knowledge with domain-specific practice questions",
      icon: Target,
      color: "text-[#22c55e]",
      bgColor: "bg-green-900/20",
      borderColor: "border-green-400",
      estimatedTime: "10-20 min per session",
      difficulty: "Intermediate",
      progress: 35,
      available: true,
      path: "/practice",
    },
    {
      id: "mock-exam",
      title: "Mock Examinations",
      description: "Full-length timed exams simulating real certification conditions",
      icon: FileText,
      color: "text-[#f97316]",
      bgColor: "bg-yellow-900/20",
      borderColor: "border-yellow-400",
      estimatedTime: "90 minutes",
      difficulty: "Advanced",
      progress: 0,
      available: false, // Unlocked after sufficient study progress
      path: "/mock",
    },
  ];

  const getDifficultyColor = (difficulty: StudyMode["difficulty"]) => {
    switch (difficulty) {
      case "Beginner":
        return "text-[#22c55e]";
      case "Intermediate":
        return "text-[#f97316]";
      case "Advanced":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getProgressMessage = (progress: number) => {
    if (progress >= 80) return "Excellent progress!";
    if (progress >= 60) return "Good progress";
    if (progress >= 40) return "Making progress";
    if (progress > 0) return "Getting started";
    return "Not started";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="mb-4 text-3xl font-bold text-foreground">Choose Your Study Mode</h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Follow the recommended learning path: Study content first, then practice questions, and
          finally take mock exams when you're ready.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {studyModes.map((mode) => {
          const Icon = mode.icon;

          return (
            <Card
              key={mode.id}
              className={cn(
                "glass cursor-pointer border-2 transition-all hover:border-opacity-50",
                mode.borderColor,
                mode.bgColor,
                !mode.available && "opacity-75"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border-2",
                      mode.borderColor,
                      mode.bgColor
                    )}
                  >
                    <Icon className={cn("h-6 w-6", mode.color)} />
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={cn("border-current text-xs", getDifficultyColor(mode.difficulty))}
                    >
                      {mode.difficulty}
                    </Badge>
                    {!mode.available && (
                      <Badge variant="secondary" className="text-xs">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>

                <CardTitle className="text-xl text-foreground">{mode.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{mode.description}</p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{mode.estimatedTime}</span>
                </div>

                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className={cn("text-sm font-medium", mode.color)}>{mode.progress}%</span>
                  </div>
                  <Progress value={mode.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{getProgressMessage(mode.progress)}</p>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => router.push(mode.path)}
                  disabled={!mode.available}
                  className={cn(
                    "w-full",
                    mode.available
                      ? `${mode.bgColor} ${mode.borderColor} border hover:bg-opacity-30`
                      : "cursor-not-allowed opacity-50"
                  )}
                >
                  {mode.available ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      {mode.progress > 0 ? "Continue" : "Start"}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Complete Prerequisites
                    </>
                  )}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Prerequisites Info for Locked Modes */}
                {!mode.available && (
                  <div className="rounded bg-gray-900/50 p-2 text-xs text-muted-foreground">
                    <strong>Unlock by:</strong> Complete 60%+ of study content and achieve 70%+
                    average in practice questions
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
