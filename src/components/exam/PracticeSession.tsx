"use client";

import { useState, useEffect } from "react";
import { useExam } from "@/contexts/ExamContext";
import { useSettings } from "@/contexts/SettingsContext";
import { ExamMode, type Question, TCODomain, Difficulty } from "@/types/exam";
import {
  selectAdaptiveQuestions,
  filterQuestions,
  getPracticeQuestions,
  getDomainQuestions,
  getAllAvailableQuestions,
} from "@/lib/examLogic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveQuickNote } from "@/services/notesService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Timer,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Target,
} from "lucide-react";

interface PracticeSessionProps {
  domain?: TCODomain;
  difficulty?: Difficulty;
  questionCount?: number;
  mode?: "adaptive" | "random" | "domain-specific";
}

export function PracticeSession({
  domain,
  difficulty,
  questionCount = 10,
  mode = "adaptive",
}: PracticeSessionProps) {
  const {
    state,
    startExam,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    finishExam,
    getCurrentQuestion,
    getProgress,
    getScore,
  } = useExam();
  const { state: settings } = useSettings();
  const { user } = useAuth();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Timer for tracking time spent
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStarted && state.currentSession && !state.currentSession.completed) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStarted, state.currentSession]);

  const startPracticeSession = () => {
    // Get available questions count from centralized database
    const availableQuestions = getAllAvailableQuestions();
    console.log("Starting practice session with questions:", availableQuestions.length);
    console.log("Questions available:", availableQuestions.length > 0 ? "YES" : "NO");
    let selectedQuestions: Question[] = [];

    if (mode === "adaptive") {
      // Use adaptive question selection (placeholder for user performance data)
      selectedQuestions = selectAdaptiveQuestions({}, questionCount, {
        focusOnWeakAreas: true,
        difficultyProgression: true,
        spaceRepetition: false,
      });
    } else if (mode === "domain-specific" && domain) {
      // Get questions from specific domain using centralized database
      const domainQuestions = getDomainQuestions(domain);
      let filteredQuestions = domainQuestions;

      // Filter by difficulty if specified
      if (difficulty) {
        filteredQuestions = domainQuestions.filter((q) => q.difficulty === difficulty);
      }

      // Shuffle and take requested count
      selectedQuestions = filteredQuestions.sort(() => Math.random() - 0.5).slice(0, questionCount);
    } else {
      // Random selection using centralized database
      selectedQuestions = getPracticeQuestions(
        undefined,
        questionCount,
        difficulty ? [difficulty] : undefined
      );
    }

    if (selectedQuestions.length === 0) {
      console.warn("No questions available for the selected criteria");
      return;
    }

    void startExam(ExamMode.PRACTICE, selectedQuestions);
    setSessionStarted(true);
    setTimeSpent(0);
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, answerId);
      if (settings.settings.showExplanations) {
        setShowExplanation(true);
      }
    }
  };

  const handleNextQuestion = () => {
    nextQuestion();
    setSelectedAnswer("");
    setShowExplanation(false);
  };

  const handlePreviousQuestion = () => {
    previousQuestion();
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion && state.currentSession?.answers[currentQuestion.id]) {
      setSelectedAnswer(state.currentSession.answers[currentQuestion.id]);
      if (settings.settings.showExplanations) {
        setShowExplanation(true);
      }
    } else {
      setSelectedAnswer("");
      setShowExplanation(false);
    }
  };

  const handleFinishSession = () => {
    finishExam();
    setSessionStarted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="border-tanium-orange h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <span className="ml-2 text-gray-400">Loading practice session...</span>
      </div>
    );
  }

  if (!state.currentSession) {
    return (
      <Card className="border-tanium-secondary/20 bg-tanium-dark/50">
        <CardHeader>
          <CardTitle className="text-tanium-orange flex items-center gap-2">
            <Target className="h-5 w-5" />
            Start Practice Session
          </CardTitle>
          <CardDescription>
            {mode === "adaptive" && "Adaptive practice with questions tailored to your performance"}
            {mode === "domain-specific" && domain && `Focused practice on ${domain} domain`}
            {mode === "random" && "Random questions from all domains"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-tanium-orange text-2xl font-bold">{questionCount}</div>
              <div className="text-sm text-gray-400">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-tanium-orange text-2xl font-bold">
                ~{Math.ceil(questionCount * 1.5)}
              </div>
              <div className="text-sm text-gray-400">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-tanium-orange text-2xl font-bold">Mixed</div>
              <div className="text-sm text-gray-400">Difficulty</div>
            </div>
            <div className="text-center">
              <div className="text-tanium-orange text-2xl font-bold">✓</div>
              <div className="text-sm text-gray-400">Feedback</div>
            </div>
          </div>
          <Button
            onClick={startPracticeSession}
            className="bg-tanium-orange hover:bg-tanium-orange/80 w-full"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Start Practice Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const score = getScore();

  if (state.currentSession.completed) {
    return (
      <Card className="border-tanium-secondary/20 bg-tanium-dark/50">
        <CardHeader>
          <CardTitle className="text-tanium-orange flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Practice Session Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-tanium-orange text-3xl font-bold">{score}%</div>
              <div className="text-sm text-gray-400">Score</div>
            </div>
            <div className="text-center">
              <div className="text-tanium-orange text-3xl font-bold">
                {
                  state.currentSession.questions.filter(
                    (q) => state.currentSession!.answers[q.id] === q.correctAnswerId
                  ).length
                }
              </div>
              <div className="text-sm text-gray-400">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-tanium-orange text-3xl font-bold">{formatTime(timeSpent)}</div>
              <div className="text-sm text-gray-400">Time</div>
            </div>
            <div className="text-center">
              <div className="text-tanium-orange text-3xl font-bold">
                {Math.round(timeSpent / state.currentSession.questions.length)}
              </div>
              <div className="text-sm text-gray-400">Avg/Question</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Performance by Domain</h3>
            {Object.values(TCODomain).map((domain) => {
              const domainQuestions = state.currentSession!.questions.filter(
                (q) => q.domain === domain
              );
              if (domainQuestions.length === 0) return null;

              const domainCorrect = domainQuestions.filter(
                (q) => state.currentSession!.answers[q.id] === q.correctAnswerId
              ).length;
              const domainScore = Math.round((domainCorrect / domainQuestions.length) * 100);

              return (
                <div key={domain} className="flex items-center justify-between">
                  <span className="text-gray-300">{domain}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-tanium-orange">
                      {domainCorrect}/{domainQuestions.length}
                    </span>
                    <Badge variant={domainScore >= 70 ? "default" : "destructive"}>
                      {domainScore}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => window.location.reload()}
              className="bg-tanium-orange hover:bg-tanium-orange/80 flex-1"
            >
              Practice Again
            </Button>
            <Button variant="outline" onClick={() => setSessionStarted(false)} className="flex-1">
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center text-gray-400">No questions available</div>;
  }

  const isAnswered = selectedAnswer !== "";
  const isCorrect = selectedAnswer === currentQuestion.correctAnswerId;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-tanium-secondary/20 bg-tanium-dark/30">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-tanium-orange text-tanium-orange">
                Question {progress.current} of {progress.total}
              </Badge>
              <Badge variant="outline" className="border-tanium-secondary text-tanium-secondary">
                {currentQuestion.domain}
              </Badge>
              <Badge
                variant={
                  currentQuestion.difficulty === Difficulty.BEGINNER
                    ? "default"
                    : currentQuestion.difficulty === Difficulty.INTERMEDIATE
                      ? "secondary"
                      : "destructive"
                }
              >
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeSpent)}</span>
              </div>
              <div className="text-tanium-orange font-semibold">Score: {score}%</div>
            </div>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="border-tanium-secondary/20 bg-tanium-dark/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="leading-relaxed text-white">{currentQuestion.question}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const text = `Q: ${currentQuestion.question}\nAnswer: ${currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId)?.text ?? ""}${currentQuestion.explanation ? `\nWhy: ${currentQuestion.explanation}` : ""}`;
                await saveQuickNote(text, { tags: ["practice", currentQuestion.domain, currentQuestion.difficulty], user });
                toast({ title: "Added to Notes", description: "View it under Notes for spaced review." });
              }}
            >
              Add to Notes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            {currentQuestion.choices.map((choice) => (
              <div key={choice.id} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={choice.id}
                  id={choice.id}
                  disabled={isAnswered && !settings.settings.showExplanations}
                />
                <Label
                  htmlFor={choice.id}
                  className={`flex-1 cursor-pointer rounded-lg border p-3 transition-colors ${
                    isAnswered
                      ? choice.id === currentQuestion.correctAnswerId
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : choice.id === selectedAnswer &&
                            choice.id !== currentQuestion.correctAnswerId
                          ? "border-red-500 bg-red-500/10 text-red-400"
                          : "border-tanium-secondary/20 text-gray-300"
                      : "hover:border-tanium-orange/50 border-tanium-secondary/20 text-gray-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{choice.text}</span>
                    {isAnswered && (
                      <>
                        {choice.id === currentQuestion.correctAnswerId && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {choice.id === selectedAnswer &&
                          choice.id !== currentQuestion.correctAnswerId && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                      </>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Explanation */}
          {showExplanation && currentQuestion.explanation && isAnswered && (
            <div
              className={`mt-4 rounded-lg border p-4 ${
                isCorrect ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-semibold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                  {isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>
              <p className="text-gray-300">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={progress.current === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {progress.current === progress.total ? (
                <Button
                  onClick={handleFinishSession}
                  className="bg-tanium-orange hover:bg-tanium-orange/80"
                >
                  Finish Session
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!isAnswered}
                  className="bg-tanium-orange hover:bg-tanium-orange/80"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
