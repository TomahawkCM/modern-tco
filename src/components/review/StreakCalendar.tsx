"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  reviewDates?: string[]; // ISO date strings (YYYY-MM-DD)
  className?: string;
}

export default function StreakCalendar({
  currentStreak,
  longestStreak,
  reviewDates = [],
  className,
}: StreakCalendarProps) {
  const calendarData = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get first day of month and total days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

    // Convert reviewDates to Set for O(1) lookup
    const reviewDateSet = new Set(reviewDates);

    // Build calendar grid (6 weeks max)
    const weeks: Array<Array<{ date: number; isReviewed: boolean; isToday: boolean; isCurrentMonth: boolean }>> = [];
    let currentWeek: typeof weeks[0] = [];

    // Fill leading empty cells
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevMonthDate = new Date(currentYear, currentMonth, 0 - (startDayOfWeek - i - 1));
      const dateString = prevMonthDate.toISOString().split("T")[0];
      currentWeek.push({
        date: prevMonthDate.getDate(),
        isReviewed: reviewDateSet.has(dateString),
        isToday: false,
        isCurrentMonth: false,
      });
    }

    // Fill month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day);
      const dateString = currentDate.toISOString().split("T")[0];
      const todayString = today.toISOString().split("T")[0];

      currentWeek.push({
        date: day,
        isReviewed: reviewDateSet.has(dateString),
        isToday: dateString === todayString,
        isCurrentMonth: true,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill trailing empty cells
    if (currentWeek.length > 0) {
      const remainingCells = 7 - currentWeek.length;
      for (let i = 1; i <= remainingCells; i++) {
        const nextMonthDate = new Date(currentYear, currentMonth + 1, i);
        const dateString = nextMonthDate.toISOString().split("T")[0];
        currentWeek.push({
          date: i,
          isReviewed: reviewDateSet.has(dateString),
          isToday: false,
          isCurrentMonth: false,
        });
      }
      weeks.push(currentWeek);
    }

    return {
      weeks,
      monthName: firstDayOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
  }, [reviewDates]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Review Calendar
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            {currentStreak} day{currentStreak !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {currentStreak}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-500">Current Streak</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
            <Trophy className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {longestStreak}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">Best Streak</p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-center text-muted-foreground">
            {calendarData.monthName}
          </p>

          {/* Week Day Headers */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="space-y-1">
            {calendarData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={cn(
                      "aspect-square flex items-center justify-center rounded-md text-sm transition-colors",
                      // Base styles
                      day.isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/40",
                      // Today highlight
                      day.isToday && "ring-2 ring-primary ring-offset-2",
                      // Review day styling
                      day.isReviewed
                        ? "bg-[#22c55e] dark:bg-[#22c55e] text-foreground font-semibold"
                        : day.isCurrentMonth
                        ? "bg-muted/30 hover:bg-muted/50"
                        : "bg-transparent",
                      // Cursor
                      day.isCurrentMonth && "cursor-default"
                    )}
                    title={
                      day.isReviewed
                        ? "Reviewed on this day"
                        : day.isToday
                        ? "Today"
                        : ""
                    }
                  >
                    {day.date}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#22c55e] dark:bg-[#22c55e]"></div>
            <span>Reviewed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-muted/30"></div>
            <span>No review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded ring-2 ring-primary ring-offset-1"></div>
            <span>Today</span>
          </div>
        </div>

        {/* Motivational Message */}
        {currentStreak > 0 && (
          <div className="pt-2 text-center">
            <p className="text-sm font-medium text-[#22c55e] dark:text-[#22c55e]">
              {currentStreak === 1
                ? "Great start! Keep it up tomorrow! 🎯"
                : currentStreak < 7
                ? `${currentStreak} days strong! Keep the momentum going! 💪`
                : currentStreak < 30
                ? `Amazing ${currentStreak}-day streak! You're on fire! 🔥`
                : `Incredible ${currentStreak}-day streak! Unstoppable! 🏆`}
            </p>
          </div>
        )}

        {currentStreak === 0 && (
          <div className="pt-2 text-center">
            <p className="text-sm text-muted-foreground">
              Start your review streak today! 🚀
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
