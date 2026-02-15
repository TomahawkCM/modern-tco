"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Star, Sparkles, Award, ChevronRight } from "lucide-react";
import {
  getLevelFromPoints,
  getNextLevel,
  getProgressToNextLevel,
  LEVELS,
  type Level,
} from "@/lib/achievements";

interface LevelProgressionDisplayProps {
  currentPoints: number;
  showAllLevels?: boolean;
  compact?: boolean;
}

export default function LevelProgressionDisplay({
  currentPoints,
  showAllLevels = false,
  compact = false,
}: LevelProgressionDisplayProps) {
  const currentLevel = getLevelFromPoints(currentPoints);
  const nextLevel = getNextLevel(currentPoints);
  const progressPercentage = getProgressToNextLevel(currentPoints);

  const pointsNeeded = nextLevel ? nextLevel.minPoints - currentPoints : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
        <div className="flex items-center gap-2">
          <Award className={`h-6 w-6 ${currentLevel.color}`} />
          <div>
            <p className="text-sm font-bold">{currentLevel.name}</p>
            <p className="text-xs text-muted-foreground">{currentPoints.toLocaleString()} points</p>
          </div>
        </div>

        {nextLevel && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-[120px] flex-1">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Next Level</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[#f97316]" />
          Level & Progression
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Level Display */}
        <div className="space-y-3 text-center">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="text-center">
              <p className={`text-3xl font-bold ${currentLevel.color}`}>{currentLevel.id}</p>
            </div>
          </div>

          <div>
            <h3 className={`text-2xl font-bold ${currentLevel.color}`}>{currentLevel.name}</h3>
            <p className="text-sm text-muted-foreground">{currentLevel.description}</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-[#f97316]" />
                <p className="text-2xl font-bold text-primary">{currentPoints.toLocaleString()}</p>
              </div>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-3 rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Next Level</span>
              </div>
              <Badge variant="outline" className={nextLevel.color}>
                {nextLevel.name}
              </Badge>
            </div>

            <Progress value={progressPercentage} className="h-3" />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(progressPercentage)}% complete</span>
              <span>{pointsNeeded.toLocaleString()} points needed</span>
            </div>

            {progressPercentage >= 80 && (
              <div className="flex items-center gap-2 rounded-md border border-[#22c55e]/20 bg-[#22c55e]/10 p-2">
                <Sparkles className="h-4 w-4 text-[#22c55e]" />
                <p className="text-xs font-medium text-[#22c55e]">
                  Almost there! Just {pointsNeeded.toLocaleString()} more points!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Max Level Achievement */}
        {!nextLevel && (
          <div className="rounded-lg border-2 border-[#f97316]/20 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 p-4 text-center">
            <Award className="mx-auto mb-2 h-8 w-8 text-[#f97316]" />
            <p className="text-sm font-bold text-[#f97316]">Maximum Level Achieved!</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You've reached the highest level. Continue earning points to maintain your mastery!
            </p>
          </div>
        )}

        {/* All Levels Overview */}
        {showAllLevels && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="mb-3 text-sm font-medium">Level Roadmap</h4>
            {LEVELS.map((level) => {
              const isCurrentLevel = level.id === currentLevel.id;
              const isPastLevel = currentPoints >= level.minPoints;
              const isFutureLevel = !isPastLevel;

              return (
                <div
                  key={level.id}
                  className={`flex items-center justify-between rounded-md p-2 ${isCurrentLevel ? "border border-primary/20 bg-primary/10" : ""} ${isPastLevel && !isCurrentLevel ? "opacity-60" : ""} ${isFutureLevel ? "opacity-40" : ""} `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${isPastLevel ? "bg-primary text-primary-foreground" : "bg-muted"} `}
                    >
                      <span className="text-sm font-bold">{level.id}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${level.color}`}>{level.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {level.minPoints.toLocaleString()}{" "}
                        {level.maxPoints !== Infinity && `- ${level.maxPoints.toLocaleString()}`}{" "}
                        points
                      </p>
                    </div>
                  </div>

                  {isCurrentLevel && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                  {isPastLevel && !isCurrentLevel && (
                    <Badge variant="outline" className="text-xs">
                      Complete
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
