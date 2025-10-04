"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import FlashcardReview from "@/components/flashcards/FlashcardReview";
import QuestionReview from "./QuestionReview";
import {
  Brain,
  BookOpen,
  Target,
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ReviewStats {
  flashcards_due: number;
  questions_due: number;
  total_due: number;
  current_streak: number;
  flashcards_total: number;
  questions_total: number;
  avg_flashcard_retention: number;
  avg_question_mastery: number;
  reviews_today: number;
  reviews_this_week: number;
}

interface ReviewQueueItem {
  item_type: string; // "flashcard" | "question"
  item_id: string;
  content_id: string;
  due_date: string;
  interval_days: number;
  ease_factor: number;
  mastery: number;
  priority_score: number;
}

export default function UnifiedReviewDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<"flashcards" | "questions" | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Get review statistics
      const { data: statsData, error: statsError } = await supabase.rpc("get_review_stats", {
        p_user_id: user.id,
      });

      if (statsError) {
        console.error("Error loading stats:", statsError);
      } else if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Get unified review queue (flashcards + questions)
      const { data: queueData, error: queueError } = await supabase.rpc("get_unified_review_queue", {
        p_user_id: user.id,
        p_limit: 50,
      });

      if (queueError) {
        console.error("Error loading queue:", queueError);
      } else {
        setQueue(queueData || []);
      }
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewComplete = () => {
    setActiveSession(null);
    loadDashboardData(); // Reload stats after review
  };

  // If showing flashcard review
  if (activeSession === "flashcards") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveSession(null)}>
          ← Back to Dashboard
        </Button>
        <FlashcardReview onComplete={handleReviewComplete} />
      </div>
    );
  }

  // If showing question review
  if (activeSession === "questions") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveSession(null)}>
          ← Back to Dashboard
        </Button>
        <QuestionReview onComplete={handleReviewComplete} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading review dashboard...</p>
        </div>
      </div>
    );
  }

  const flashcardCount = stats?.flashcards_due || 0;
  const questionCount = stats?.questions_due || 0;
  const totalDue = stats?.total_due || 0;
  const streak = stats?.current_streak || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-7 w-7 text-primary" />
                Daily Review Dashboard
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Spaced repetition system with 42% retention improvement
              </p>
            </div>
            {streak > 0 && (
              <div className="text-center">
                <div className="flex items-center gap-2 text-orange-500">
                  <Flame className="h-6 w-6" />
                  <span className="text-3xl font-bold">{streak}</span>
                </div>
                <p className="text-xs text-muted-foreground">day streak</p>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={totalDue > 0 ? "border-orange-500/50" : "border-green-500/50"}>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center mb-2">
              {totalDue > 0 ? (
                <AlertCircle className="h-6 w-6 text-orange-500" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              )}
            </div>
            <p className="text-3xl font-bold">{totalDue}</p>
            <p className="text-xs text-muted-foreground">Due Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Brain className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold">{flashcardCount}</p>
            <p className="text-xs text-muted-foreground">Flashcards</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-3xl font-bold">{questionCount}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-bold">
              {Math.round(((stats?.avg_flashcard_retention || 0) + (stats?.avg_question_mastery || 0)) / 2)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Mastery</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Flashcards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              Flashcard Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Active Recall Practice</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.flashcards_total || 0} total cards
                </p>
              </div>
              <Badge variant={flashcardCount > 0 ? "destructive" : "secondary"}>
                {flashcardCount} due
              </Badge>
            </div>

            <Button
              onClick={() => setActiveSession("flashcards")}
              disabled={flashcardCount === 0}
              className="w-full"
              size="lg"
            >
              {flashcardCount > 0 ? "Start Flashcard Review" : "All Caught Up!"}
            </Button>

            <div className="text-xs text-muted-foreground">
              Retention: {Math.round(stats?.avg_flashcard_retention || 0)}%
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Question Practice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Exam Question Bank</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.questions_total || 0} questions tracked
                </p>
              </div>
              <Badge variant={questionCount > 0 ? "destructive" : "secondary"}>
                {questionCount} due
              </Badge>
            </div>

            <Button
              onClick={() => setActiveSession("questions")}
              disabled={questionCount === 0}
              className="w-full"
              size="lg"
              variant="secondary"
            >
              {questionCount > 0 ? "Start Question Review" : "All Caught Up!"}
            </Button>

            <div className="text-xs text-muted-foreground">
              Mastery: {Math.round(stats?.avg_question_mastery || 0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">{stats?.reviews_today || 0} reviews</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{stats?.reviews_this_week || 0} reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Queue Preview */}
      {queue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Priority Queue (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {queue.slice(0, 10).map((item, idx) => (
                <div
                  key={item.item_id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-muted-foreground">#{idx + 1}</span>
                    {item.item_type === "flashcard" ? (
                      <Brain className="h-4 w-4 text-blue-500" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-purple-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium capitalize">{item.item_type}</p>
                      <p className="text-xs text-muted-foreground">
                        Mastery: {Math.round(item.mastery * 100)}% • Interval: {item.interval_days}d
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.mastery < 0.7 ? "destructive" : "secondary"}>
                    Priority: {item.priority_score.toFixed(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
