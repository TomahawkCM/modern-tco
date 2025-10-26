"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar as CalendarIcon, Trophy, Target } from "lucide-react";
import { format, subDays, startOfWeek, addDays, isSameDay } from "date-fns";

interface ReviewDay {
  date: Date;
  reviewCount: number;
  goalMet: boolean; // Did they meet daily goal (e.g., 5 reviews)
}

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  reviewHistory: ReviewDay[]; // Last 28 days
  dailyGoal?: number; // Default: 5 reviews/day
}

export default function StreakCalendar({
  currentStreak,
  longestStreak,
  reviewHistory,
  dailyGoal = 5,
}: StreakCalendarProps) {
  const today = new Date();
  const startDate = subDays(today, 27); // Show last 4 weeks

  // Generate 4 weeks of calendar
  const weeks: Date[][] = [];
  let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday

  for (let i = 0; i < 4; i++) {
    const week: Date[] = [];
    for (let j = 0; j < 7; j++) {
      week.push(addDays(currentWeekStart, j));
    }
    weeks.push(week);
    currentWeekStart = addDays(currentWeekStart, 7);
  }

  // Get review data for a specific date
  const getReviewData = (date: Date): ReviewDay | undefined => {
    return reviewHistory.find((r) => isSameDay(new Date(r.date), date));
  };

  // Get color for a day based on review count
  const getDayColor = (date: Date): string => {
    if (date > today) return "bg-card"; // Future dates

    const reviewData = getReviewData(date);
    if (!reviewData || reviewData.reviewCount === 0) {
      return "bg-card"; // No reviews
    }

    if (reviewData.goalMet) {
      return "bg-[#22c55e]"; // Met daily goal
    }

    if (reviewData.reviewCount > 0) {
      return "bg-yellow-500/50"; // Some reviews but didn't meet goal
    }

    return "bg-card";
  };

  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Study Streak
          </CardTitle>
          <div className="flex items-center gap-4">
            {currentStreak > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {currentStreak}
                </div>
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
            )}
            {longestStreak > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {longestStreak}
                </div>
                <p className="text-xs text-muted-foreground">Best</p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdays.map((day, idx) => (
              <div
                key={idx}
                className="text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar weeks */}
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-2">
              {week.map((date, dayIdx) => {
                const reviewData = getReviewData(date);
                const isToday = isSameDay(date, today);
                const isFuture = date > today;

                return (
                  <div
                    key={dayIdx}
                    className="relative group"
                    title={
                      isFuture
                        ? "Future date"
                        : reviewData
                        ? `${format(date, "MMM d")}: ${
                            reviewData.reviewCount
                          } reviews`
                        : `${format(date, "MMM d")}: No reviews`
                    }
                  >
                    <div
                      className={`
                        aspect-square rounded-md flex items-center justify-center
                        ${getDayColor(date)}
                        ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                        ${isFuture ? "opacity-20" : ""}
                        transition-all cursor-pointer hover:scale-110
                      `}
                    >
                      <span className="text-xs font-medium">
                        {format(date, "d")}
                      </span>
                    </div>

                    {/* Tooltip on hover */}
                    {!isFuture && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-popover text-popover-foreground px-2 py-1 rounded-md shadow-lg text-xs whitespace-nowrap">
                          {format(date, "MMM d")}:{" "}
                          {reviewData?.reviewCount || 0} reviews
                          {reviewData?.goalMet && " ✓"}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-card" />
              <span className="text-muted-foreground">No activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500/50" />
              <span className="text-muted-foreground">Some reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#22c55e]" />
              <span className="text-muted-foreground">Goal met ({dailyGoal}+)</span>
            </div>
          </div>

          {currentStreak >= 7 && (
            <Badge variant="outline" className="text-orange-500 border-orange-500">
              <Trophy className="h-3 w-3 mr-1" />
              Week Streak!
            </Badge>
          )}
        </div>

        {/* Motivational Message */}
        {currentStreak === 0 && (
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-sm font-medium">Start your streak today!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete {dailyGoal} reviews to build momentum
            </p>
          </div>
        )}

        {currentStreak > 0 && currentStreak < longestStreak && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-center">
            <p className="text-sm font-medium text-orange-500">
              Keep going! {longestStreak - currentStreak} days to match your record
            </p>
          </div>
        )}

        {currentStreak === longestStreak && currentStreak >= 7 && (
          <div className="p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg text-center">
            <p className="text-sm font-medium text-[#22c55e]">
              🔥 Personal best! You're on fire!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
