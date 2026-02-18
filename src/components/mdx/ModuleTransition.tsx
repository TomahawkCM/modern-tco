"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Lock,
  Unlock,
  Trophy,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Skill {
  id: string;
  name: string;
  description: string;
  tested: boolean;
  passed: boolean;
}

interface Challenge {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  skillId: string;
}

interface ModuleTransitionProps {
  currentModuleId: string;
  currentModuleTitle: string;
  nextModuleId: string;
  nextModuleTitle: string;
  requiredSkills: Skill[];
  challenges: Challenge[];
  minimumScore?: number; // Default 80%
}

export default function ModuleTransition({
  currentModuleId,
  currentModuleTitle,
  nextModuleId,
  nextModuleTitle,
  requiredSkills,
  challenges,
  minimumScore = 0.8,
}: ModuleTransitionProps) {
  const [skills, setSkills] = useState<Skill[]>(requiredSkills);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem(`transition-${currentModuleId}-${nextModuleId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setSkills(progress.skills ?? requiredSkills);
      setScore(progress.score ?? 0);
      setCompleted(progress.completed ?? false);
      setUnlocked(progress.unlocked ?? false);
      setAttempts(progress.attempts ?? 0);
    }
  }, [currentModuleId, nextModuleId, requiredSkills]);

  const saveProgress = () => {
    const progress = {
      skills,
      score,
      completed,
      unlocked,
      attempts,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`transition-${currentModuleId}-${nextModuleId}`, JSON.stringify(progress));
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentChallenge = challenges[currentChallengeIndex];
    const isCorrect = selectedAnswer === currentChallenge.correctAnswer;

    // Update skill status
    const updatedSkills = skills.map((skill) => {
      if (skill.id === currentChallenge.skillId) {
        return {
          ...skill,
          tested: true,
          passed: isCorrect ?? skill.passed, // Keep passed if already passed
        };
      }
      return skill;
    });
    setSkills(updatedSkills);

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowExplanation(true);
    saveProgress();
  };

  const handleNextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // All challenges completed
      const finalScore = score / challenges.length;
      const passed = finalScore >= minimumScore;

      setCompleted(true);
      setUnlocked(passed);
      setAttempts(attempts + 1);
      saveProgress();
    }
  };

  const handleRetry = () => {
    setSkills(requiredSkills.map((s) => ({ ...s, tested: false, passed: false })));
    setCurrentChallengeIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCompleted(false);
    setUnlocked(false);
    setAttempts(attempts + 1);
    saveProgress();
  };

  const currentChallenge = challenges[currentChallengeIndex];
  const progressPercentage =
    ((currentChallengeIndex + (showExplanation ? 1 : 0)) / challenges.length) * 100;
  const scorePercentage = (score / challenges.length) * 100;
  const passedSkillsCount = skills.filter((s) => s.passed).length;

  if (completed) {
    return (
      <Card className="my-8 border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-xl">
            {unlocked ? (
              <>
                <Trophy className="h-6 w-6 text-[#f97316]" />
                Module Transition Complete!
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-orange-500" />
                Additional Practice Needed
              </>
            )}
          </CardTitle>
          <CardDescription>
            {currentModuleTitle} → {nextModuleTitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Final Score */}
          <div className="space-y-2 text-center">
            <div className="text-4xl font-bold">{Math.round(scorePercentage)}%</div>
            <div className="text-sm text-gray-600">
              {score} out of {challenges.length} correct
            </div>
            <div className="text-sm">Required: {Math.round(minimumScore * 100)}%</div>
          </div>

          {/* Skills Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold">Skills Assessment:</h3>
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
              >
                <span className="text-sm">{skill.name}</span>
                {skill.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {unlocked ? (
              <Button
                className="w-full bg-[#22c55e] hover:bg-green-700"
                onClick={() => (window.location.href = `/modules/${nextModuleId}`)}
              >
                <Unlock className="mr-2 h-4 w-4" />
                Continue to {nextModuleTitle}
              </Button>
            ) : (
              <>
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    You need {Math.round(minimumScore * 100)}% to unlock the next module. Review the
                    skills you missed and try again.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleRetry} className="w-full" variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry Assessment (Attempt {attempts + 1})
                </Button>
              </>
            )}
          </div>

          {/* Attempt History */}
          {attempts > 1 && (
            <div className="text-center text-sm text-muted-foreground">
              Attempts made: {attempts}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-8 border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lock className="h-6 w-6 text-blue-600" />
              Module Transition Checkpoint
            </CardTitle>
            <CardDescription className="mt-2">
              Complete this assessment to unlock: {nextModuleTitle}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {currentChallengeIndex + 1} / {challenges.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs defaultValue="assessment" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="skills">Required Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="mt-4 space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="mb-2 flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Current Challenge */}
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-lg font-medium">{currentChallenge.question}</p>
              </div>

              {/* Answer Options */}
              <div className="space-y-2">
                {currentChallenge.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      selectedAnswer === index
                        ? showExplanation
                          ? index === currentChallenge.correctAnswer
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : "border-blue-500 bg-blue-50"
                        : showExplanation && index === currentChallenge.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showExplanation && (
                        <>
                          {index === currentChallenge.correctAnswer && (
                            <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                          )}
                          {index === selectedAnswer && index !== currentChallenge.correctAnswer && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>Explanation:</strong> {currentChallenge.explanation}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Button */}
              {!showExplanation ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextChallenge} className="w-full">
                  {currentChallengeIndex < challenges.length - 1 ? (
                    <>
                      Next Question
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      View Results
                      <Trophy className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Current Score */}
            <div className="text-center text-sm text-gray-600">
              Current Score: {score} / {currentChallengeIndex + (showExplanation ? 1 : 0)}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="mt-4">
            <div className="space-y-3">
              <p className="mb-4 text-sm text-gray-600">
                Master these skills from {currentModuleTitle} to proceed:
              </p>
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className={`rounded-lg border p-3 ${
                    skill.tested
                      ? skill.passed
                        ? "border-green-300 bg-green-50"
                        : "border-red-300 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{skill.name}</h4>
                      <p className="mt-1 text-sm text-gray-600">{skill.description}</p>
                    </div>
                    <div className="mt-1">
                      {skill.tested ? (
                        skill.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-4 text-center">
                <div className="text-sm text-gray-600">
                  Skills Mastered: {passedSkillsCount} / {skills.length}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
