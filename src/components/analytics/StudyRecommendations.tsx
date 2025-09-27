"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/contexts/ProgressContext";
import { TCODomain } from "@/types/exam";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import {
  Brain,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  BookOpen,
  Shield,
  Server,
  FileText,
  Layers,
  Wrench,
  Trophy,
  MessageSquare,
  Play,
  Navigation,
  BarChart3,
} from "lucide-react";

interface Recommendation {
  type: "focus" | "practice" | "review" | "exam" | "achievement";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
  link: string;
  icon: any;
  color: string;
}

export function StudyRecommendations() {
  const router = useRouter();
  const { getOverallStats, getDomainStats, state } = useProgress();
  
  // Memoize expensive function calls to prevent infinite re-renders
  const overallStats = useMemo(() => getOverallStats(), [getOverallStats]);
  const domainStats = useMemo(() => getDomainStats(), [getDomainStats]);

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Find weakest domain
    const weakestDomain = domainStats.reduce((min, domain) =>
      domain.score < min.score ? domain : min
    );

    // Find strongest domain
    const strongestDomain = domainStats.reduce((max, domain) =>
      domain.score > max.score ? domain : max
    );

    // Domain-specific recommendations
    if (weakestDomain && weakestDomain.score < 70) {
      const domainIcons = {
        [TCODomain.ASKING_QUESTIONS]: BookOpen,
        [TCODomain.REFINING_QUESTIONS]: Target,
        [TCODomain.REFINING_TARGETING]: Target,
        [TCODomain.TAKING_ACTION]: Zap,
        [TCODomain.NAVIGATION_MODULES]: Layers,
        [TCODomain.REPORTING_EXPORT]: FileText,
        [TCODomain.SECURITY]: Shield,
        [TCODomain.FUNDAMENTALS]: BookOpen,
        [TCODomain.TROUBLESHOOTING]: AlertTriangle,
      };

      const domainUrls: Record<TCODomain, string> = {
        [TCODomain.ASKING_QUESTIONS]: "asking-questions",
        [TCODomain.REFINING_QUESTIONS]: "refining-questions",
        [TCODomain.REFINING_TARGETING]: "refining-questions-targeting",
        [TCODomain.TAKING_ACTION]: "taking-action",
        [TCODomain.NAVIGATION_MODULES]: "navigation-modules",
        [TCODomain.REPORTING_EXPORT]: "reporting-export",
        [TCODomain.SECURITY]: "security",
        [TCODomain.FUNDAMENTALS]: "fundamentals",
        [TCODomain.TROUBLESHOOTING]: "troubleshooting",
      };

      recommendations.push({
        type: "focus",
        priority: "high",
        title: `Focus on ${weakestDomain.domain}`,
        description: `Your weakest area with ${weakestDomain.score}% average. Targeted practice will improve overall readiness.`,
        action: `Study ${weakestDomain.domain}`,
        link: `/domains/${domainUrls[weakestDomain.domain]}`,
        icon: domainIcons[weakestDomain.domain] || Target,
        color: "text-red-400 border-red-400",
      });
    }

    // Study streak recommendations
    if (overallStats.studyStreak === 0) {
      recommendations.push({
        type: "practice",
        priority: "high",
        title: "Start Your Study Streak",
        description: "Begin building momentum with daily practice sessions to improve retention.",
        action: "Start Practice",
        link: "/practice",
        icon: Zap,
        color: "text-orange-400 border-orange-400",
      });
    } else if (overallStats.studyStreak < 7) {
      recommendations.push({
        type: "practice",
        priority: "medium",
        title: "Build Study Consistency",
        description: `You're on a ${overallStats.studyStreak}-day streak. Keep going to reach the 7-day milestone!`,
        action: "Continue Streak",
        link: "/practice",
        icon: Clock,
        color: "text-yellow-400 border-yellow-400",
      });
    }

    // Overall score recommendations
    if (overallStats.averageScore < 70) {
      recommendations.push({
        type: "review",
        priority: "high",
        title: "Review Fundamentals",
        description:
          "Your overall score suggests focusing on core concepts before attempting mock exams.",
        action: "Review Basics",
        link: "/domains/fundamentals",
        icon: BookOpen,
        color: "text-blue-400 border-blue-400",
      });
    } else if (overallStats.averageScore >= 80) {
      recommendations.push({
        type: "exam",
        priority: "medium",
        title: "Ready for Mock Exams",
        description: "Your strong performance indicates readiness for timed practice exams.",
        action: "Take Mock Exam",
        link: "/mock",
        icon: CheckCircle,
        color: "text-green-400 border-green-400",
      });
    }

    // Session count recommendations
    if (state.progress.sessionCount < 5) {
      recommendations.push({
        type: "practice",
        priority: "medium",
        title: "Build Practice Momentum",
        description:
          "Complete more practice sessions to establish patterns and identify knowledge gaps.",
        action: "Start Practice",
        link: "/practice",
        icon: Target,
        color: "text-blue-400 border-blue-400",
      });
    }

    // Readiness-based recommendations
    if (overallStats.readinessLevel === "Poor" || overallStats.readinessLevel === "Fair") {
      recommendations.push({
        type: "focus",
        priority: "high",
        title: "Intensive Study Needed",
        description: "Current readiness level requires focused study across multiple domains.",
        action: "Study Plan",
        link: "/domains/fundamentals",
        icon: Brain,
        color: "text-red-400 border-red-400",
      });
    }

    // Achievement recommendations
    const possibleAchievements = [
      {
        name: "Perfect Score",
        condition: () => !state.progress.achievements.includes("Perfect Score"),
      },
      {
        name: "Week Warrior",
        condition: () =>
          overallStats.studyStreak < 7 && !state.progress.achievements.includes("Week Warrior"),
      },
      {
        name: "Centurion",
        condition: () =>
          overallStats.totalQuestions < 100 && !state.progress.achievements.includes("Centurion"),
      },
    ];

    const nextAchievement = possibleAchievements.find((achievement) => achievement.condition());
    if (nextAchievement) {
      recommendations.push({
        type: "achievement",
        priority: "low",
        title: `Unlock "${nextAchievement.name}"`,
        description: getAchievementDescription(nextAchievement.name),
        action: "Work Toward Goal",
        link: "/practice",
        icon: Trophy,
        color: "text-cyan-400 border-cyan-400",
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 6);
  };

  const getAchievementDescription = (achievement: string): string => {
    switch (achievement) {
      case "Perfect Score":
        return "Score 100% on any practice session to unlock this achievement.";
      case "Week Warrior":
        return `Study for ${7 - overallStats.studyStreak} more consecutive days to earn this badge.`;
      case "Centurion":
        return `Answer ${100 - overallStats.totalQuestions} more questions to reach 100 total.`;
      default:
        return "Complete the requirements to unlock this achievement.";
    }
  };

  const recommendations = generateRecommendations();

  if (recommendations.length === 0) {
    return (
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Excellent Progress!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
            <h3 className="mb-2 font-medium text-white">You&rsquo;re on track!</h3>
            <p className="mb-4 text-gray-400">
              Your performance is strong across all areas. Continue with regular practice to
              maintain your readiness.
            </p>
            <Button
              onClick={() => router.push("/mock")}
              className="bg-tanium-accent hover:bg-blue-600"
            >
              Take a Mock Exam
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-5 w-5 text-tanium-accent" />
          Personalized Study Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div
                key={index}
                className="glass flex items-start gap-4 rounded-lg border border-white/10 p-4 transition-colors hover:border-white/20"
              >
                <div className={`rounded-lg p-2 bg-${rec.color.split("-")[1]}-500/20`}>
                  <Icon className={`h-5 w-5 ${rec.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="mb-1 font-medium text-white">{rec.title}</h4>
                      <p className="mb-3 text-sm text-gray-400">{rec.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0",
                        rec.priority === "high"
                          ? "border-red-400 text-red-400"
                          : rec.priority === "medium"
                            ? "border-yellow-400 text-yellow-400"
                            : "border-gray-400 text-gray-400"
                      )}
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(rec.link)}
                    className="bg-tanium-accent hover:bg-blue-600"
                  >
                    {rec.action}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
