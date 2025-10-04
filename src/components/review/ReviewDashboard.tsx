"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useReview } from "@/contexts/ReviewContext";
import { useProgress } from "@/contexts/ProgressContext";
import StreakCalendar from "@/components/review/StreakCalendar";
import type { ReviewSessionType } from "@/types/review";
import {
  Brain,
  TrendingUp,
  Clock,
  Flame,
  Target,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Calendar,
} from "lucide-react";

export default function ReviewDashboard() {
  const {
    stats,
    streak,
    dueCounts,
    isLoading,
    refreshStats,
    refreshStreak,
    refreshDueCounts,
    loadQueue,
    startSession,
  } = useReview();

  const [activeTab, setActiveTab] = useState<ReviewSessionType>('mixed');
  const { updateReviewStreak } = useProgress();

  useEffect(() => {
    refreshStats();
    refreshStreak();
    refreshDueCounts();
  }, []);

  useEffect(() => {
    if (streak) {
      updateReviewStreak(streak.current, streak.longest);
    }
  }, [streak, updateReviewStreak]);

  const handleStartReview = async (type: ReviewSessionType, duration?: number) => {
    const session = await startSession(type, duration);
    if (session) {
      // Session started successfully, navigation to review view will be handled by parent
    }
  };

  const handleLoadQueue = async (type: ReviewSessionType) => {
    setActiveTab(type);
    await loadQueue(type);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalDue = stats?.totalDue || 0;
  const flashcardsDue = stats?.flashcardsDue || 0;
  const questionsDue = stats?.questionsDue || 0;
  const currentStreak = stats?.currentStreak || 0;
  const avgRetention = stats?.avgFlashcardRetention || 0;
  const avgMastery = stats?.avgQuestionMastery || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daily Review</h2>
          <p className="text-muted-foreground">
            Spaced repetition for long-term retention
          </p>
        </div>
        {totalDue > 0 && (
          <Button
            size="lg"
            onClick={() => handleStartReview(activeTab)}
            className="gap-2"
          >
            <PlayCircle className="h-5 w-5" />
            Start Review ({totalDue} items)
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{totalDue}</p>
            <p className="text-xs text-muted-foreground">Total Due</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Brain className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{flashcardsDue}</p>
            <p className="text-xs text-muted-foreground">Flashcards</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{questionsDue}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Flame className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{avgRetention}%</p>
            <p className="text-xs text-muted-foreground">Card Retention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
            <p className="text-2xl font-bold">{avgMastery}%</p>
            <p className="text-xs text-muted-foreground">Question Mastery</p>
          </CardContent>
        </Card>
      </div>

      {/* Streak Calendar & Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <StreakCalendar
          currentStreak={currentStreak}
          longestStreak={streak?.longest || 0}
          reviewDates={streak?.reviewDates || []}
        />

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleStartReview('mixed', 10)}
              disabled={totalDue === 0}
            >
              <Clock className="h-4 w-4" />
              10 Minute Session
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleStartReview('mixed', 15)}
              disabled={totalDue === 0}
            >
              <Clock className="h-4 w-4" />
              15 Minute Session
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleStartReview('mixed')}
              disabled={totalDue === 0}
            >
              <PlayCircle className="h-4 w-4" />
              Untimed Session
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Review Type Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => handleLoadQueue(v as ReviewSessionType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mixed" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Mixed
                {totalDue > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {totalDue}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="gap-2">
                <Brain className="h-4 w-4" />
                Flashcards
                {flashcardsDue > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {flashcardsDue}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="questions" className="gap-2">
                <Target className="h-4 w-4" />
                Questions
                {questionsDue > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {questionsDue}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mixed" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Review both flashcards and practice questions in an interleaved format for optimal learning.
              </p>
              {totalDue === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="text-lg font-semibold">All caught up!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No items due for review right now. Great work!
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button size="lg" onClick={() => handleStartReview('mixed')}>
                    Start Mixed Review
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="flashcards" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Focus on flashcard review with spaced repetition intervals.
              </p>
              {flashcardsDue === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="text-lg font-semibold">No flashcards due!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check back later or create new flashcards.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button size="lg" onClick={() => handleStartReview('flashcards')}>
                    Review Flashcards
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="questions" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Practice exam questions to reinforce weak areas and track mastery.
              </p>
              {questionsDue === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="text-lg font-semibold">No questions due!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All practice questions are up to date.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button size="lg" onClick={() => handleStartReview('questions')}>
                    Review Questions
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Spaced Repetition Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✓ <strong>Review daily</strong> for best results - even just 10 minutes maintains your streak</p>
          <p>✓ <strong>Be honest</strong> with ratings - accurate self-assessment improves scheduling</p>
          <p>✓ <strong>Focus on weak areas</strong> - the algorithm prioritizes struggling content</p>
          <p>✓ <strong>Build momentum</strong> - consistent review builds long-term retention</p>
        </CardContent>
      </Card>
    </div>
  );
}
