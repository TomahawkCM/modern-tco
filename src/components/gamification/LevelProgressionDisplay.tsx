"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  TrendingUp,
  Star,
  Sparkles,
  Award,
  ChevronRight,
} from "lucide-react";
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

  const pointsNeeded = nextLevel
    ? nextLevel.minPoints - currentPoints
    : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Award className={`h-6 w-6 ${currentLevel.color}`} />
          <div>
            <p className="text-sm font-bold">{currentLevel.name}</p>
            <p className="text-xs text-muted-foreground">
              {currentPoints.toLocaleString()} points
            </p>
          </div>
        </div>

        {nextLevel && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-[120px]">
              <div className="flex items-center justify-between text-xs mb-1">
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
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary">
            <div className="text-center">
              <p className={`text-3xl font-bold ${currentLevel.color}`}>
                {currentLevel.id}
              </p>
            </div>
          </div>

          <div>
            <h3 className={`text-2xl font-bold ${currentLevel.color}`}>
              {currentLevel.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentLevel.description}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Star className="h-4 w-4 text-[#f97316]" />
                <p className="text-2xl font-bold text-primary">
                  {currentPoints.toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
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
              <div className="flex items-center gap-2 p-2 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-md">
                <Sparkles className="h-4 w-4 text-[#22c55e]" />
                <p className="text-xs text-[#22c55e] font-medium">
                  Almost there! Just {pointsNeeded.toLocaleString()} more points!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Max Level Achievement */}
        {!nextLevel && (
          <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 border-2 border-[#f97316]/20 rounded-lg text-center">
            <Award className="h-8 w-8 text-[#f97316] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#f97316]">
              Maximum Level Achieved!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You've reached the highest level. Continue earning points to
              maintain your mastery!
            </p>
          </div>
        )}

        {/* All Levels Overview */}
        {showAllLevels && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Level Roadmap</h4>
            {LEVELS.map((level) => {
              const isCurrentLevel = level.id === currentLevel.id;
              const isPastLevel = currentPoints >= level.minPoints;
              const isFutureLevel = !isPastLevel;

              return (
                <div
                  key={level.id}
                  className={`
                    flex items-center justify-between p-2 rounded-md
                    ${isCurrentLevel ? "bg-primary/10 border border-primary/20" : ""}
                    ${isPastLevel && !isCurrentLevel ? "opacity-60" : ""}
                    ${isFutureLevel ? "opacity-40" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${isPastLevel ? "bg-primary text-primary-foreground" : "bg-muted"}
                    `}
                    >
                      <span className="text-sm font-bold">{level.id}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${level.color}`}>
                        {level.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {level.minPoints.toLocaleString()}{" "}
                        {level.maxPoints !== Infinity && `- ${level.maxPoints.toLocaleString()}`} points
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
