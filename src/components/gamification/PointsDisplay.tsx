"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, TrendingUp, Zap, Star } from "lucide-react";
import { getUserPoints, calculateLevel, type UserPoints } from "@/lib/gamification";
import { cn } from "@/lib/utils";

interface PointsDisplayProps {
  /** Show compact version */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Points Display Component
 *
 * Shows user's total points, level, and progress to next level
 */
export function PointsDisplay({ compact = false, className }: PointsDisplayProps) {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [levelInfo, setLevelInfo] = useState({
    level: 1,
    currentLevelPoints: 0,
    nextLevelPoints: 100,
    progress: 0,
  });

  useEffect(() => {
    const points = getUserPoints();
    setUserPoints(points);

    const level = calculateLevel(points.totalPoints);
    setLevelInfo(level);

    // Listen for points updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user-points") {
        const updatedPoints = getUserPoints();
        setUserPoints(updatedPoints);
        setLevelInfo(calculateLevel(updatedPoints.totalPoints));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!userPoints) return null;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold text-yellow-500">
                  {userPoints.totalPoints.toLocaleString()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total Points</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1">
                <Trophy className="h-3 w-3" />
                Level {levelInfo.level}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{Math.round(levelInfo.progress)}% to Level {levelInfo.level + 1}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <Card className={cn("border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Points */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-400">Total Points</span>
          </div>
          <span className="text-2xl font-bold text-yellow-500">
            {userPoints.totalPoints.toLocaleString()}
          </span>
        </div>

        {/* Level Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-400">Level</span>
            </div>
            <Badge variant="outline" className="gap-1 bg-purple-500/10 text-purple-300">
              <span className="text-xl font-bold">{levelInfo.level}</span>
            </Badge>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1">
            <Progress value={levelInfo.progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{(userPoints.totalPoints - levelInfo.currentLevelPoints).toLocaleString()} pts</span>
              <span>{Math.round(levelInfo.progress)}%</span>
              <span>{(levelInfo.nextLevelPoints - levelInfo.currentLevelPoints).toLocaleString()} pts</span>
            </div>
          </div>
        </div>

        {/* Weekly Points */}
        <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">This Week</span>
          </div>
          <span className="font-semibold text-blue-400">
            +{userPoints.pointsThisWeek.toLocaleString()}
          </span>
        </div>

        {/* Monthly Points */}
        <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">This Month</span>
          </div>
          <span className="font-semibold text-green-400">
            +{userPoints.pointsThisMonth.toLocaleString()}
          </span>
        </div>

        {/* Recent Activity */}
        {userPoints.pointsHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-400">Recent Activity</h4>
            <div className="space-y-1">
              {userPoints.pointsHistory.slice(-3).reverse().map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded border border-gray-700/50 bg-gray-800/30 px-2 py-1 text-xs"
                >
                  <span className="text-gray-400">
                    {formatPointsReason(entry.reason)}
                    {entry.multiplier && entry.multiplier > 1 && (
                      <span className="ml-1 text-yellow-400">×{entry.multiplier.toFixed(1)}</span>
                    )}
                  </span>
                  <span className="font-semibold text-green-400">+{entry.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Format points reason for display
 */
function formatPointsReason(reason: string): string {
  const mapping: Record<string, string> = {
    review_correct: "Review completed",
    review_streak: "Streak bonus",
    perfect_session: "Perfect session",
    first_review: "First review",
    module_complete: "Module completed",
    achievement_unlocked: "Achievement",
    practice_correct: "Practice question",
    quiz_passed: "Quiz passed",
  };

  return mapping[reason] || reason;
}

export default PointsDisplay;
