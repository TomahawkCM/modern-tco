"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Target, Book, Shuffle, AlertCircle } from "lucide-react";
import { createPracticeSession, getPracticeRecommendations } from "@/lib/practiceMode";
import type { PracticeSession } from "@/lib/practiceMode";

interface PracticeSetupProps {
  /** Callback when practice session starts */
  onStart: (session: PracticeSession) => void;
  /** Pre-selected module ID */
  moduleId?: string;
  /** Pre-selected concept */
  concept?: string;
}

/**
 * Practice Setup Component
 *
 * Configure and start a practice session
 */
export function PracticeSetup({ onStart, moduleId: initialModuleId, concept: initialConcept }: PracticeSetupProps) {
  const [mode, setMode] = useState<"concept" | "module" | "random" | "missed">("random");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [moduleId, setModuleId] = useState(initialModuleId || "");
  const [concept, setConcept] = useState(initialConcept || "");

  const recommendations = getPracticeRecommendations();

  const handleStart = () => {
    const session = createPracticeSession({
      mode,
      difficulty,
      questionCount,
      moduleId: moduleId || undefined,
      concept: concept || undefined,
    });

    onStart(session);
  };

  const canStart = () => {
    if (mode === "concept" && (!moduleId || !concept)) return false;
    if (mode === "module" && !moduleId) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              Practice Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="text-sm text-gray-300">
                {rec}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Setup Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Practice Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Practice Mode */}
          <div className="space-y-3">
            <Label>Practice Mode</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("random")}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  mode === "random"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shuffle className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold">Random</span>
                </div>
                <p className="text-sm text-gray-400">
                  Mix of questions from all topics
                </p>
              </button>

              <button
                onClick={() => setMode("concept")}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  mode === "concept"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold">Specific Concept</span>
                </div>
                <p className="text-sm text-gray-400">
                  Focus on one concept
                </p>
              </button>

              <button
                onClick={() => setMode("module")}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  mode === "module"
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Book className="h-5 w-5 text-green-400" />
                  <span className="font-semibold">Module</span>
                </div>
                <p className="text-sm text-gray-400">
                  Practice entire module
                </p>
              </button>

              <button
                onClick={() => setMode("missed")}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  mode === "missed"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  <span className="font-semibold">Missed Questions</span>
                </div>
                <p className="text-sm text-gray-400">
                  Review incorrect answers
                </p>
              </button>
            </div>
          </div>

          {/* Module Selection (if needed) */}
          {(mode === "concept" || mode === "module") && (
            <div className="space-y-2">
              <Label htmlFor="module-select">Module</Label>
              <Select value={moduleId} onValueChange={setModuleId}>
                <SelectTrigger id="module-select">
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform-foundation">Platform Foundation</SelectItem>
                  <SelectItem value="asking-questions">Asking Questions</SelectItem>
                  <SelectItem value="refining-questions">Refining Questions</SelectItem>
                  <SelectItem value="taking-action">Taking Action</SelectItem>
                  <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Concept Selection (if needed) */}
          {mode === "concept" && moduleId && (
            <div className="space-y-2">
              <Label htmlFor="concept-input">Concept</Label>
              <input
                id="concept-input"
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g., Linear Chain Architecture"
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500">
                Enter the specific concept you want to practice
              </p>
            </div>
          )}

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty-select">Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
              <SelectTrigger id="difficulty-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">
                  <span className="flex items-center gap-2">
                    Easy
                    <Badge variant="outline" className="text-xs">Beginner</Badge>
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    Medium
                    <Badge variant="outline" className="text-xs">Intermediate</Badge>
                  </span>
                </SelectItem>
                <SelectItem value="hard">
                  <span className="flex items-center gap-2">
                    Hard
                    <Badge variant="outline" className="text-xs">Advanced</Badge>
                  </span>
                </SelectItem>
                <SelectItem value="mixed">
                  <span className="flex items-center gap-2">
                    Mixed
                    <Badge variant="outline" className="text-xs">All Levels</Badge>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <Label htmlFor="count-select">Number of Questions</Label>
            <Select
              value={questionCount.toString()}
              onValueChange={(v) => setQuestionCount(parseInt(v))}
            >
              <SelectTrigger id="count-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 questions</SelectItem>
                <SelectItem value="10">10 questions</SelectItem>
                <SelectItem value="15">15 questions</SelectItem>
                <SelectItem value="20">20 questions</SelectItem>
                <SelectItem value="25">25 questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            disabled={!canStart()}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Practice Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default PracticeSetup;
