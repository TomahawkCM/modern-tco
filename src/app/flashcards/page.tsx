"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FlashcardDashboard from "@/components/flashcards/FlashcardDashboard";
import {
  Brain,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Info
} from "lucide-react";

export default function FlashcardsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-accent/20 rounded-lg">
            <Brain className="h-8 w-8 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Active Recall Flashcards</h1>
            <p className="text-muted-foreground">
              Spaced repetition system for long-term retention
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <Alert className="mb-6 border-primary/30 bg-primary/10">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          <strong>How it works:</strong> Flashcards use the SM-2 spaced repetition algorithm to
          schedule reviews at optimal intervals. Rate each card honestly (Again/Hard/Good/Easy)
          and the system will adapt to your learning pace.
        </AlertDescription>
      </Alert>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Create from Study Modules
            </CardTitle>
            <CardDescription>
              Auto-generate flashcards from learning objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/study")}
              className="w-full"
            >
              Browse Study Modules
            </Button>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
              Convert Mistakes to Cards
            </CardTitle>
            <CardDescription>
              Turn quiz mistakes into flashcards automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/practice")}
              variant="secondary"
              className="w-full"
            >
              Practice Questions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Flashcard Dashboard */}
      <FlashcardDashboard />

      {/* Study Tips */}
      <Card className="mt-8 border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5">
        <CardHeader>
          <CardTitle>💡 Maximizing Flashcard Effectiveness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <div className="flex gap-3">
            <div className="text-2xl">🧠</div>
            <div>
              <strong className="text-foreground">Active Recall:</strong> Try to remember the answer
              before revealing it. This strengthens neural pathways.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">📅</div>
            <div>
              <strong className="text-foreground">Daily Consistency:</strong> Review for 10-15 minutes
              daily rather than long cramming sessions.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">⭐</div>
            <div>
              <strong className="text-foreground">Honest Ratings:</strong> Rate cards based on actual
              recall difficulty - the algorithm adapts to your true performance.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <strong className="text-foreground">Create from Mistakes:</strong> When you get a practice
              question wrong, immediately create a flashcard to reinforce that concept.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
