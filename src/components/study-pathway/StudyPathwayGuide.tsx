/**
 * StudyPathwayGuide Component - Unified study pathway guidance
 * Provides clear Study → Practice → Exam progression with progress tracking
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Target,
  FileText,
  CheckCircle,
  ArrowRight,
  Clock,
  Trophy,
  AlertCircle,
  Play,
  Brain,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyPhase {
  id: "foundation" | "study" | "practice" | "exam";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  estimatedTime: string;
  status: "locked" | "available" | "in_progress" | "completed";
  progress: number;
  isBeginnerFriendly?: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  actions: Array<{
    label: string;
    path: string;
    description: string;
    type: "primary" | "secondary";
  }>;
}

interface StudyPathwayGuideProps {
  className?: string;
}

export function StudyPathwayGuide({ className }: StudyPathwayGuideProps) {
  const router = useRouter();

  // Mock progress data - in real app, would come from user context
  const [studyPhases] = useState<StudyPhase[]>([
    {
      id: "foundation",
      title: "Foundation & Prerequisites",
      description:
        "🌟 NEW FOR BEGINNERS! Build your IT foundation with endpoint management basics, terminology, and confidence-building exercises - designed for complete newcomers",
      icon: Lightbulb,
      color: "text-primary",
      bgColor: "bg-primary/20",
      borderColor: "border-cyan-400",
      estimatedTime: "2-4 hours",
      status: "available",
      progress: 0,
      isBeginnerFriendly: true,
      difficulty: "beginner",
      actions: [
        {
          label: "Start Foundation",
          path: "/onboarding/welcome",
          description: "Begin with complete beginner introduction",
          type: "primary",
        },
        {
          label: "Check Prerequisites",
          path: "/onboarding/prerequisites",
          description: "Assess your current knowledge level",
          type: "secondary",
        },
      ],
    },
    {
      id: "study",
      title: "Core Study Modules",
      description:
        "Learn essential concepts through comprehensive study modules covering all 5 TCO domains with beginner-friendly explanations and examples",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-blue-900/20",
      borderColor: "border-blue-400",
      estimatedTime: "8-12 hours",
      status: "locked",
      progress: 0,
      isBeginnerFriendly: true,
      difficulty: "intermediate",
      actions: [
        {
          label: "Continue Learning",
          path: "/study",
          description: "Resume your study modules",
          type: "primary",
        },
        {
          label: "Browse Domains",
          path: "/study/asking-questions",
          description: "Explore domain content",
          type: "secondary",
        },
      ],
    },
    {
      id: "practice",
      title: "Practice & Reinforcement",
      description:
        "Test your knowledge with guided practice questions, instant feedback, and adaptive difficulty to build confidence progressively",
      icon: Target,
      color: "text-[#22c55e]",
      bgColor: "bg-green-900/20",
      borderColor: "border-green-400",
      estimatedTime: "4-6 hours",
      status: "locked",
      progress: 0,
      isBeginnerFriendly: false,
      difficulty: "intermediate",
      actions: [
        {
          label: "Domain Practice",
          path: "/practice/domain",
          description: "Practice by domain",
          type: "primary",
        },
        {
          label: "Mixed Practice",
          path: "/practice/mixed",
          description: "Practice all domains",
          type: "secondary",
        },
      ],
    },
    {
      id: "exam",
      title: "Certification Readiness",
      description: "Take full-length timed mock exams to simulate real certification conditions - recommended only after mastering foundations",
      icon: GraduationCap,
      color: "text-[#f97316]",
      bgColor: "bg-yellow-900/20",
      borderColor: "border-yellow-400",
      estimatedTime: "90 minutes",
      status: "locked",
      progress: 0,
      isBeginnerFriendly: false,
      difficulty: "advanced",
      actions: [
        {
          label: "Take Mock Exam",
          path: "/mock",
          description: "90-minute timed exam",
          type: "primary",
        },
        {
          label: "View Requirements",
          path: "/mock/requirements",
          description: "See exam readiness criteria",
          type: "secondary",
        },
      ],
    },
  ]);

  const overallProgress = studyPhases.reduce((acc, phase) => acc + phase.progress, 0) / 4;

  const getStatusIcon = (status: StudyPhase["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-[#22c55e]" />;
      case "in_progress":
        return <Play className="h-5 w-5 text-primary" />;
      case "available":
        return <AlertCircle className="h-5 w-5 text-[#f97316]" />;
      case "locked":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: StudyPhase["status"]) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "available":
        return "Available";
      case "locked":
        return "Locked";
      default:
        return "";
    }
  };

  const getReadinessLevel = (
    progress: number
  ): { level: string; color: string; description: string } => {
    if (progress >= 80)
      return {
        level: "Exam Ready",
        color: "text-[#22c55e]",
        description: "You're well-prepared for certification!",
      };
    if (progress >= 60)
      return {
        level: "Good Progress",
        color: "text-primary",
        description: "Continue practicing to build confidence",
      };
    if (progress >= 40)
      return {
        level: "Building Up",
        color: "text-[#f97316]",
        description: "Keep studying to strengthen your foundation",
      };
    return {
      level: "Getting Started",
      color: "text-muted-foreground",
      description: "Focus on completing study modules first",
    };
  };

  const readiness = getReadinessLevel(overallProgress);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Progress Header */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <TrendingUp className="h-6 w-6 text-tanium-accent" />
            Your TCO Certification Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-2xl font-bold text-foreground">
                {Math.round(overallProgress)}% Complete
              </div>
              <div className={cn("text-sm font-medium", readiness.color)}>{readiness.level}</div>
              <div className="text-xs text-muted-foreground">{readiness.description}</div>
            </div>
            <div className="text-right">
              <Trophy className="mb-2 h-8 w-8 text-[#f97316]" />
              <div className="text-xs text-muted-foreground">
                Tanium Certified
                <br />
                Operator Goal
              </div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Study Pathway Steps */}
      <div className="space-y-4">
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-tanium-accent" />
          <h3 className="text-lg font-semibold text-foreground">Recommended Study Path</h3>
        </div>

        <div className="space-y-4">
          {studyPhases.map((phase, index) => {
            const Icon = phase.icon;
            const isLast = index === studyPhases.length - 1;

            return (
              <div key={phase.id} className="relative">
                <Card
                  className={cn(
                    "glass border-2 transition-all hover:border-opacity-50",
                    phase.borderColor,
                    phase.bgColor,
                    phase.status === "locked" && "opacity-75"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Phase Icon and Progress */}
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full border-2",
                            phase.borderColor,
                            phase.bgColor
                          )}
                        >
                          <Icon className={cn("h-6 w-6", phase.color)} />
                        </div>
                        <div className="text-center">
                          <div className={cn("text-sm font-medium", phase.color)}>
                            {phase.progress}%
                          </div>
                          <div className="mt-1 w-16">
                            <Progress value={phase.progress} className="h-1" />
                          </div>
                        </div>
                      </div>

                      {/* Phase Content */}
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h4 className="text-xl font-semibold text-foreground">
                            {index + 1}. {phase.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {getStatusIcon(phase.status)}
                            <span className="ml-1">{getStatusText(phase.status)}</span>
                          </Badge>
                        </div>

                        <p className="mb-3 text-muted-foreground">{phase.description}</p>

                        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{phase.estimatedTime}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          {phase.actions.map((action) => (
                            <Button
                              key={action.path}
                              size="sm"
                              variant={action.type === "primary" ? "default" : "outline"}
                              disabled={phase.status === "locked"}
                              onClick={() => router.push(action.path)}
                              className={cn(
                                action.type === "primary"
                                  ? `${phase.bgColor} ${phase.borderColor} hover:bg-opacity-30`
                                  : "border-white/20 text-foreground hover:bg-white/10"
                              )}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Connection Arrow */}
                {!isLast && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Study Tips */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <AlertCircle className="h-5 w-5 text-primary" />
            Study Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#22c55e]" />
              <span>
                <strong>Study First:</strong> Complete at least 60% of modules before heavy practice
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong>Domain Focus:</strong> Achieve 70%+ in each domain practice before mock
                exams
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#f97316]" />
              <span>
                <strong>Mock Readiness:</strong> Take mock exams only after 80%+ overall readiness
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong>Review Mistakes:</strong> Focus extra study time on areas where you score
                lowest
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
