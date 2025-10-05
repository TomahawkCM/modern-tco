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
          className="mb-4 border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Brain className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Active Recall Flashcards</h1>
            <p className="text-gray-400">
              Spaced repetition system for long-term retention
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <Alert className="mb-6 border-blue-500/30 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <strong>How it works:</strong> Flashcards use the SM-2 spaced repetition algorithm to
          schedule reviews at optimal intervals. Rate each card honestly (Again/Hard/Good/Easy)
          and the system will adapt to your learning pace.
        </AlertDescription>
      </Alert>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-white/10 bg-gradient-to-br from-green-900/20 to-emerald-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5 text-green-400" />
              Create from Study Modules
            </CardTitle>
            <CardDescription className="text-gray-300">
              Auto-generate flashcards from learning objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/study")}
              className="w-full bg-green-600 hover:bg-green-500"
            >
              Browse Study Modules
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Convert Mistakes to Cards
            </CardTitle>
            <CardDescription className="text-gray-300">
              Turn quiz mistakes into flashcards automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/practice")}
              className="w-full bg-purple-600 hover:bg-purple-500"
            >
              Practice Questions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Flashcard Dashboard */}
      <FlashcardDashboard />

      {/* Study Tips */}
      <Card className="mt-8 border-white/10 bg-gradient-to-br from-orange-900/20 to-yellow-900/20">
        <CardHeader>
          <CardTitle className="text-white">💡 Maximizing Flashcard Effectiveness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-300">
          <div className="flex gap-3">
            <div className="text-2xl">🧠</div>
            <div>
              <strong className="text-white">Active Recall:</strong> Try to remember the answer
              before revealing it. This strengthens neural pathways.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">📅</div>
            <div>
              <strong className="text-white">Daily Consistency:</strong> Review for 10-15 minutes
              daily rather than long cramming sessions.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">⭐</div>
            <div>
              <strong className="text-white">Honest Ratings:</strong> Rate cards based on actual
              recall difficulty - the algorithm adapts to your true performance.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <strong className="text-white">Create from Mistakes:</strong> When you get a practice
              question wrong, immediately create a flashcard to reinforce that concept.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
