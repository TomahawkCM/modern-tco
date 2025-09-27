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
        color: "text-cyan-400",
        bgColor: "bg-cyan-900/20",
        borderColor: "border-cyan-400",
        icon: Sparkles,
        message: "Building confidence step by step!",
      };
    case "growing":
      return {
        color: "text-green-400",
        bgColor: "bg-green-900/20", 
        borderColor: "border-green-400",
        icon: Zap,
        message: "Growing stronger every day!",
      };
    case "strong":
      return {
        color: "text-yellow-400",
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
        color: "text-gray-400",
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
        color: "text-cyan-400",
        bgColor: "bg-cyan-900/20",
        icon: GraduationCap,
      };
    case "fundamentals":
      return {
        title: "Phase 1: Fundamentals", 
        description: "Learning Tanium core concepts",
        color: "text-blue-400",
        bgColor: "bg-blue-900/20",
        icon: Star,
      };
    case "questions":
      return {
        title: "Phase 2: Questions",
        description: "Mastering query techniques",
        color: "text-green-400",
        bgColor: "bg-green-900/20", 
        icon: Target,
      };
    case "mastery":
      return {
        title: "Phase 3: Mastery",
        description: "Advanced skills and certification",
        color: "text-yellow-400",
        bgColor: "bg-yellow-900/20",
        icon: Trophy,
      };
    default:
      return {
        title: "Getting Started",
        description: "Ready to begin your journey",
        color: "text-gray-400",
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
                <div className="text-sm font-medium text-white">
                  {mockProgressData.overallProgress}% Complete
                </div>
                <div className="text-xs text-gray-400">
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
          <CardTitle className="flex items-center gap-3 text-white">
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
                <h3 className="text-lg font-semibold text-white">{phaseConfig.title}</h3>
                <p className="text-sm text-gray-300">{phaseConfig.description}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Overall Progress</span>
                <span className="text-sm font-medium text-white">{mockProgressData.overallProgress}%</span>
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
              <div className="text-xs text-gray-400">Milestones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {mockProgressData.studyTimeSpent}
              </div>
              <div className="text-xs text-gray-400">Study Time</div>
            </div>
            <div className="text-center">
              <div className={cn("text-2xl font-bold", confidenceConfig.color)}>
                {mockProgressData.confidenceLevel}
              </div>
              <div className="text-xs text-gray-400">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {mockProgressData.achievements.length}
              </div>
              <div className="text-xs text-gray-400">Achievements</div>
            </div>
          </div>

          {/* Encouragement Message */}
          {showCelebration && (
            <div className="rounded-lg bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-400/20 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-cyan-200 font-medium mb-1">Keep Going!</p>
                  <p className="text-sm text-gray-300">{mockProgressData.encouragementMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Goal */}
          <div className="flex items-start gap-3 rounded-lg bg-blue-900/20 border border-blue-400/20 p-4">
            <Target className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-200 mb-1">Next Goal:</p>
              <p className="text-sm text-gray-300">{mockProgressData.nextGoal}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones Progress */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <TrendingUp className="h-5 w-5 text-green-400" />
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
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <MilestoneIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn(
                        "font-medium",
                        milestone.isCompleted ? "text-green-200" : "text-gray-300"
                      )}>
                        {milestone.title}
                      </h4>
                      {milestone.isCompleted && (
                        <Badge variant="outline" className="text-xs text-green-300 border-green-400/20">
                          ✓ Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{milestone.description}</p>
                    <p className={cn(
                      "text-xs font-medium",
                      milestone.isCompleted ? "text-green-300" : "text-blue-300"
                    )}>
                      💪 {milestone.confidenceBoost}
                    </p>
                    {milestone.celebrationMessage && milestone.isCompleted && (
                      <p className="text-xs text-yellow-300 mt-1">{milestone.celebrationMessage}</p>
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
            <CardTitle className="flex items-center gap-3 text-white">
              <Award className="h-5 w-5 text-yellow-400" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockProgressData.achievements.map((achievement, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs text-yellow-300 border-yellow-400/20 bg-yellow-900/20"
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