"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, TrendingUp, Target, Award } from "lucide-react";
import { format } from "date-fns";

interface TimeActivity {
  type: "study" | "practice" | "review" | "exam" | "video";
  label: string;
  minutes: number;
  color: string;
}

interface TimeInvestmentTrackerProps {
  totalMinutes: number; // Total time invested so far
  goalMinutes?: number; // Goal (default: 1200 minutes = 20 hours)
  activities: TimeActivity[];
  weeklyMinutes?: number; // Time this week
  todayMinutes?: number; // Time today
  estimatedCompletion?: Date; // Predicted completion date
}

export default function TimeInvestmentTracker({
  totalMinutes,
  goalMinutes = 1200, // 20 hours default
  activities,
  weeklyMinutes = 0,
  todayMinutes = 0,
  estimatedCompletion,
}: TimeInvestmentTrackerProps) {
  const progressPercentage = Math.min(
    (totalMinutes / goalMinutes) * 100,
    100
  );
  const remainingMinutes = Math.max(goalMinutes - totalMinutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const goalHours = goalMinutes / 60;
  const remainingHours = Math.round((remainingMinutes / 60) * 10) / 10;

  // Calculate average daily minutes
  const avgDailyMinutes =
    weeklyMinutes > 0 ? Math.round(weeklyMinutes / 7) : 0;

  // Estimate days to completion based on current pace
  const daysToCompletion =
    avgDailyMinutes > 0 ? Math.ceil(remainingMinutes / avgDailyMinutes) : null;

  // Activity breakdown
  const activityTotals = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + activity.minutes;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Time Investment
          </CardTitle>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {totalHours}h
            </div>
            <p className="text-xs text-muted-foreground">of {goalHours}h</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-4" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{totalMinutes} minutes completed</span>
            <span>{remainingMinutes} minutes remaining</span>
          </div>
        </div>

        {/* Time Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Today */}
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {todayMinutes}
            </div>
            <p className="text-xs text-muted-foreground">Minutes Today</p>
          </div>

          {/* This Week */}
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {Math.round((weeklyMinutes / 60) * 10) / 10}h
            </div>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>

          {/* Average Daily */}
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {avgDailyMinutes}
            </div>
            <p className="text-xs text-muted-foreground">Avg/Day</p>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Time Breakdown
          </h4>
          {activities.map((activity, idx) => {
            const activityPercentage =
              (activity.minutes / totalMinutes) * 100 || 0;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${activity.color}`}
                    />
                    <span>{activity.label}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {activity.minutes}m ({Math.round(activityPercentage)}%)
                  </span>
                </div>
                <Progress
                  value={activityPercentage}
                  className="h-2"
                  style={
                    {
                      "--progress-background": `hsl(var(--${activity.color.replace(
                        "bg-",
                        ""
                      )}))`,
                    } as React.CSSProperties
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Pace Analysis */}
        {daysToCompletion !== null && progressPercentage < 100 && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-primary">
                Pace Analysis
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              At your current pace ({avgDailyMinutes} min/day), you'll reach
              your goal in approximately <strong>{daysToCompletion} days</strong>
              {estimatedCompletion && (
                <>
                  {" "}
                  (by {format(estimatedCompletion, "MMM d, yyyy")})
                </>
              )}
              .
            </p>
          </div>
        )}

        {/* Completion Message */}
        {progressPercentage >= 100 && (
          <div className="p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg text-center">
            <Award className="h-6 w-6 text-[#22c55e] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#22c55e]">
              🎉 Goal Achieved!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You've invested {totalHours} hours mastering Tanium TCO
            </p>
          </div>
        )}

        {/* Recommendations */}
        {progressPercentage < 100 && (
          <div className="space-y-2">
            {avgDailyMinutes < 60 && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-sm font-medium text-orange-500">
                  Increase Study Time
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try to invest 60-90 minutes per day to complete your goal
                  faster and improve retention.
                </p>
              </div>
            )}

            {avgDailyMinutes >= 60 && avgDailyMinutes < 120 && (
              <div className="p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg">
                <p className="text-sm font-medium text-[#22c55e]">
                  Great Pace!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're on track to complete your certification prep on
                  schedule. Keep up the excellent work!
                </p>
              </div>
            )}

            {avgDailyMinutes >= 120 && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm font-medium text-purple-500">
                  Exceptional Dedication!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're studying at an accelerated pace. Make sure to take
                  breaks and use spaced repetition for optimal retention.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium mb-1">Study Efficiency</p>
              <p className="text-muted-foreground">
                {totalMinutes > 0
                  ? `${Math.round(
                      (activityTotals.study / totalMinutes) * 100
                    )}% active learning`
                  : "Start studying to track"}
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Balance</p>
              <p className="text-muted-foreground">
                {activities.length} different activities
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
