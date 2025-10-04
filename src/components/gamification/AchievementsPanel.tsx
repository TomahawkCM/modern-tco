"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Lock, TrendingUp } from "lucide-react";
import {
  getUserAchievements,
  getUserPoints,
  ACHIEVEMENTS,
  type Achievement,
  type AchievementProgress,
  getAchievementProgress,
} from "@/lib/gamification";
import { getReviewStats, getAllReviewItems } from "@/lib/spacedRepetition";
import { cn } from "@/lib/utils";

interface AchievementsPanelProps {
  /** Module ID to filter stats (optional) */
  moduleId?: string;
  /** Custom className */
  className?: string;
}

/**
 * Achievements Panel Component
 *
 * Displays unlocked achievements and progress toward locked achievements
 */
export function AchievementsPanel({ moduleId, className }: AchievementsPanelProps) {
  const [unlocked, setUnlocked] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [activeTab, setActiveTab] = useState<"unlocked" | "locked">("unlocked");

  useEffect(() => {
    loadAchievements();

    // Listen for achievement updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user-achievements" || e.key === "user-points") {
        loadAchievements();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [moduleId]);

  function loadAchievements() {
    const userAchievements = getUserAchievements();
    setUnlocked(userAchievements.unlocked);

    // Calculate progress for locked achievements
    const stats = calculateCurrentStats();
    const progressData = getAchievementProgress(stats);
    setProgress(progressData.sort((a, b) => b.percentage - a.percentage));
  }

  function calculateCurrentStats() {
    const reviewStats = getReviewStats(moduleId);
    const allItems = getAllReviewItems();
    const filteredItems = moduleId
      ? allItems.filter(item => item.moduleId === moduleId)
      : allItems;

    const itemsMastered = filteredItems.filter(item => item.retention > 90).length;
    const userAchievements = getUserAchievements();

    // TODO: Implement streak tracking in Week 3
    const streakDays = 0;

    // Count reviews from points history
    const userPoints = getUserPoints();
    const totalReviews = userPoints.pointsHistory.filter(
      entry => entry.reason === "review_correct"
    ).length;

    return {
      streakDays,
      perfectSessions: 0, // TODO: Track this in future
      totalReviews,
      totalPoints: userAchievements.totalPoints,
      itemsMastered,
      practiceSessions: 0, // TODO: Track this in Week 3.2
    };
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400 border-gray-600";
      case "uncommon":
        return "text-green-400 border-green-600";
      case "rare":
        return "text-blue-400 border-blue-600";
      case "epic":
        return "text-purple-400 border-purple-600";
      case "legendary":
        return "text-yellow-400 border-yellow-600";
      default:
        return "text-gray-400 border-gray-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "streak":
        return "🔥";
      case "mastery":
        return "💎";
      case "completion":
        return "✅";
      case "practice":
        return "🎮";
      case "social":
        return "👥";
      case "special":
        return "✨";
      default:
        return "🏆";
    }
  };

  return (
    <Card className={cn("border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-500" />
          Achievements
          <Badge variant="outline" className="ml-auto">
            {unlocked.length} / {ACHIEVEMENTS.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "unlocked" | "locked")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unlocked">
              Unlocked ({unlocked.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Locked ({ACHIEVEMENTS.length - unlocked.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unlocked" className="space-y-3 mt-4">
            {unlocked.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Lock className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p className="text-sm">No achievements unlocked yet</p>
                <p className="text-xs mt-1">Complete reviews to earn achievements!</p>
              </div>
            ) : (
              unlocked
                .sort((a, b) => {
                  if (!a.unlockedAt || !b.unlockedAt) return 0;
                  return b.unlockedAt.getTime() - a.unlockedAt.getTime();
                })
                .map((achievement) => {
                  const achievementDef = ACHIEVEMENTS.find(a => a.id === achievement.id);
                  if (!achievementDef) return null;

                  return (
                    <div
                      key={achievement.id}
                      className={cn(
                        "rounded-lg border-2 bg-gradient-to-r p-4",
                        getRarityColor(achievementDef.rarity)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{achievementDef.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">
                              {achievementDef.name}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {achievementDef.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            {achievementDef.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {achievement.unlockedAt
                                ? new Date(achievement.unlockedAt).toLocaleDateString()
                                : ""}
                            </span>
                            <Badge variant="secondary" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              +{achievementDef.points} pts
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </TabsContent>

          <TabsContent value="locked" className="space-y-3 mt-4">
            {progress.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Award className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p className="text-sm">All achievements unlocked!</p>
              </div>
            ) : (
              progress.map((prog) => {
                const achievement = ACHIEVEMENTS.find(a => a.id === prog.achievementId);
                if (!achievement) return null;

                return (
                  <div
                    key={achievement.id}
                    className="rounded-lg border border-gray-700 bg-gray-800/30 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <span className="text-3xl opacity-50">{achievement.icon}</span>
                        <Lock className="absolute -right-1 -bottom-1 h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-300">
                            {achievement.name}
                          </h4>
                          <Badge variant="outline" className="text-xs opacity-70">
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {achievement.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <Progress value={prog.percentage} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              {prog.currentValue} / {prog.requiredValue}
                            </span>
                            <span>{Math.round(prog.percentage)}%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {getCategoryIcon(achievement.category)} {achievement.category}
                          </span>
                          <Badge variant="secondary" className="gap-1 text-xs opacity-70">
                            <TrendingUp className="h-3 w-3" />
                            +{achievement.points} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AchievementsPanel;
