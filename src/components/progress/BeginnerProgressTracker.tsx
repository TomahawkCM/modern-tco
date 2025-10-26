"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Star,
  Sparkles,
  Zap,
  GraduationCap,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Heart,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// TypeScript interfaces for beginner progress tracking
interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted: boolean;
  confidenceBoost: string;
  celebrationMessage?: string;
}

interface BeginnerProgressData {
  currentPhase: "foundation" | "fundamentals" | "questions" | "mastery";
  overallProgress: number;
  confidenceLevel: "building" | "growing" | "strong" | "expert";
  completedMilestones: number;
  totalMilestones: number;
  studyTimeSpent: string;
  nextGoal: string;
  encouragementMessage: string;
  achievements: string[];
  milestones: LearningMilestone[];
}

interface BeginnerProgressTrackerProps {
  className?: string;
  showCelebration?: boolean;
  compactView?: boolean;
}

// Mock data - would come from Supabase user progress in real implementation
const mockProgressData: BeginnerProgressData = {
  currentPhase: "foundation",
  overallProgress: 25,
  confidenceLevel: "building",
  completedMilestones: 3,
  totalMilestones: 12,
  studyTimeSpent: "2h 15m",
  nextGoal: "Complete Phase 0: Foundation basics",
  encouragementMessage: "You're making great progress! Every expert was once a beginner. 🌟",
  achievements: ["First Steps Taken", "Foundation Builder", "Terminology Master"],
  milestones: [
    {
      id: "welcome-complete",
      title: "Welcome to Tanium!",
      description: "Completed the welcome onboarding",
      icon: GraduationCap,
      isCompleted: true,
      confidenceBoost: "You've taken the first step!",
      celebrationMessage: "🎉 Welcome to your Tanium journey!",
    },
    {
      id: "prereq-check",
      title: "Knowledge Assessment",
      description: "Completed prerequisite knowledge check",
      icon: CheckCircle,
      isCompleted: true,
      confidenceBoost: "You know where you stand!",
    },
    {
      id: "terminology-basics",
      title: "Basic Terminology",
      description: "Learned 50+ essential IT security terms",
      icon: Star,
      isCompleted: true,
      confidenceBoost: "Building your vocabulary!",
    },
    {
      id: "endpoint-concepts",
      title: "Endpoint Management Basics",
      description: "Understanding endpoint fundamentals",
      icon: Target,
      isCompleted: false,
      confidenceBoost: "Almost there - you've got this!",
    },
    {
      id: "tanium-overview",
      title: "Tanium Platform Overview",
      description: "Learn what Tanium does and why it matters",
      icon: Sparkles,
      isCompleted: false,
      confidenceBoost: "Ready to discover the platform!",
    },
    {
      id: "security-fundamentals",
      title: "Security Fundamentals",
      description: "Core cybersecurity concepts",
      icon: Trophy,
      isCompleted: false,
      confidenceBoost: "Security knowledge building up!",
    },
  ],
};

const getConfidenceLevelConfig = (level: string) => {
  switch (level) {
    case "building":
      return {
        color: "text-primary",
        bgColor: "bg-primary/20",
        borderColor: "border-cyan-400",
        icon: Sparkles,
        message: "Building confidence step by step!",
      };
    case "growing":
      return {
        color: "text-[#22c55e]",
        bgColor: "bg-green-900/20", 
        borderColor: "border-green-400",
        icon: Zap,
        message: "Growing stronger every day!",
      };
    case "strong":
      return {
        color: "text-[#f97316]",
        bgColor: "bg-yellow-900/20",
        borderColor: "border-yellow-400",
        icon: Star,
        message: "Strong foundation established!",
      };
    case "expert":
      return {
        color: "text-orange-400",
        bgColor: "bg-orange-900/20",
        borderColor: "border-orange-400", 
        icon: Award,
        message: "Expert level achieved!",
      };
    default:
      return {
        color: "text-muted-foreground",
        bgColor: "bg-gray-900/20",
        borderColor: "border-gray-400",
        icon: Target,
        message: "Ready to start learning!",
      };
  }
};

const getPhaseConfig = (phase: string) => {
  switch (phase) {
    case "foundation":
      return {
        title: "Phase 0: Foundation",
        description: "Building your IT security foundation",
        color: "text-primary",
        bgColor: "bg-primary/20",
        icon: GraduationCap,
      };
    case "fundamentals":
      return {
        title: "Phase 1: Fundamentals", 
        description: "Learning Tanium core concepts",
        color: "text-primary",
        bgColor: "bg-blue-900/20",
        icon: Star,
      };
    case "questions":
      return {
        title: "Phase 2: Questions",
        description: "Mastering query techniques",
        color: "text-[#22c55e]",
        bgColor: "bg-green-900/20", 
        icon: Target,
      };
    case "mastery":
      return {
        title: "Phase 3: Mastery",
        description: "Advanced skills and certification",
        color: "text-[#f97316]",
        bgColor: "bg-yellow-900/20",
        icon: Trophy,
      };
    default:
      return {
        title: "Getting Started",
        description: "Ready to begin your journey",
        color: "text-muted-foreground",
        bgColor: "bg-gray-900/20",
        icon: GraduationCap,
      };
  }
};

export function BeginnerProgressTracker({ 
  className,
  showCelebration = true,
  compactView = false,
}: BeginnerProgressTrackerProps) {
  const confidenceConfig = getConfidenceLevelConfig(mockProgressData.confidenceLevel);
  const phaseConfig = getPhaseConfig(mockProgressData.currentPhase);
  const ConfidenceIcon = confidenceConfig.icon;
  const PhaseIcon = phaseConfig.icon;

  if (compactView) {
    return (
      <Card className={cn("glass border-white/10", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-full p-2", confidenceConfig.bgColor)}>
                <ConfidenceIcon className={cn("h-4 w-4", confidenceConfig.color)} />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {mockProgressData.overallProgress}% Complete
                </div>
                <div className="text-xs text-muted-foreground">
                  {mockProgressData.completedMilestones}/{mockProgressData.totalMilestones} milestones
                </div>
              </div>
            </div>
            <Badge variant="outline" className={cn("text-xs", confidenceConfig.color, confidenceConfig.borderColor)}>
              {mockProgressData.confidenceLevel}
            </Badge>
          </div>
          <Progress value={mockProgressData.overallProgress} className="mt-3 h-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Progress Card */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <Heart className="h-5 w-5 text-red-400" />
            Your Learning Journey - Built for Beginners!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Phase */}
          <div className={cn("rounded-lg border p-4", phaseConfig.bgColor, "border-white/10")}>
            <div className="flex items-center gap-3 mb-3">
              <PhaseIcon className={cn("h-6 w-6", phaseConfig.color)} />
              <div>
                <h3 className="text-lg font-semibold text-foreground">{phaseConfig.title}</h3>
                <p className="text-sm text-muted-foreground">{phaseConfig.description}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium text-foreground">{mockProgressData.overallProgress}%</span>
              </div>
              <Progress value={mockProgressData.overallProgress} className="h-3" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-tanium-accent">
                {mockProgressData.completedMilestones}
              </div>
              <div className="text-xs text-muted-foreground">Milestones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#22c55e]">
                {mockProgressData.studyTimeSpent}
              </div>
              <div className="text-xs text-muted-foreground">Study Time</div>
            </div>
            <div className="text-center">
              <div className={cn("text-2xl font-bold", confidenceConfig.color)}>
                {mockProgressData.confidenceLevel}
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f97316]">
                {mockProgressData.achievements.length}
              </div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
          </div>

          {/* Encouragement Message */}
          {showCelebration && (
            <div className="rounded-lg bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-400/20 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-cyan-200 font-medium mb-1">Keep Going!</p>
                  <p className="text-sm text-muted-foreground">{mockProgressData.encouragementMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Goal */}
          <div className="flex items-start gap-3 rounded-lg bg-blue-900/20 border border-blue-400/20 p-4">
            <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Next Goal:</p>
              <p className="text-sm text-muted-foreground">{mockProgressData.nextGoal}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones Progress */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <TrendingUp className="h-5 w-5 text-[#22c55e]" />
            Learning Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockProgressData.milestones.map((milestone, index) => {
              const MilestoneIcon = milestone.icon;
              return (
                <div
                  key={milestone.id}
                  className={cn(
                    "flex items-start gap-4 rounded-lg border p-4 transition-all",
                    milestone.isCompleted
                      ? "bg-green-900/20 border-green-400/20"
                      : "bg-gray-900/20 border-gray-400/20"
                  )}
                >
                  <div className={cn(
                    "rounded-full p-2 shrink-0",
                    milestone.isCompleted ? "bg-green-900/30" : "bg-gray-900/30"
                  )}>
                    {milestone.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-[#22c55e]" />
                    ) : (
                      <MilestoneIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn(
                        "font-medium",
                        milestone.isCompleted ? "text-green-200" : "text-muted-foreground"
                      )}>
                        {milestone.title}
                      </h4>
                      {milestone.isCompleted && (
                        <Badge variant="outline" className="text-xs text-[#22c55e] border-green-400/20">
                          ✓ Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                    <p className={cn(
                      "text-xs font-medium",
                      milestone.isCompleted ? "text-[#22c55e]" : "text-primary"
                    )}>
                      💪 {milestone.confidenceBoost}
                    </p>
                    {milestone.celebrationMessage && milestone.isCompleted && (
                      <p className="text-xs text-[#f97316] mt-1">{milestone.celebrationMessage}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {mockProgressData.achievements.length > 0 && (
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground">
              <Award className="h-5 w-5 text-[#f97316]" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockProgressData.achievements.map((achievement, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs text-[#f97316] border-yellow-400/20 bg-yellow-900/20"
                >
                  🏆 {achievement}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BeginnerProgressTracker;