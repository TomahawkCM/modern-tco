"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle,
  Trophy,
  Clock,
  FileText,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useExam } from "@/contexts/ExamContext";
import { ExamMode } from "@/types/exam";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { questionService } from "@/lib/questionService";
import { useProgress } from "@/contexts/ProgressContext";

// Code-split heavy components: only load after exam starts
const QuestionCard = dynamic(
  () => import("@/components/exam/question-card").then((m) => m.QuestionCard),
  {
    ssr: false,
    loading: () => (
      <div className="glass border-white/10 p-6 text-foreground/80">Loading question…</div>
    ),
  }
);

const ExamTimer = dynamic(
  () => import("@/components/exam/exam-timer").then((m) => m.ExamTimer),
  { ssr: false, loading: () => null }
);

function MockExamContent() {
  const router = useRouter();
  const {
    state,
    startExam,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    finishExam,
    resetExam,
    getCurrentQuestion,
    getProgress,
    getScore,
  } = useExam();

  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(105 * 60); // 105 minutes (official) in seconds
  const [timerStarted, setTimerStarted] = useState(false);
  const [variant, setVariant] = useState<'A' | 'B' | 'C'>('A');
  const search = useSearchParams();
  const { updateSessionStats } = useProgress();

  // Initialize variant from URL
  useEffect(() => {
    const v = (search?.get('variant') || '').toUpperCase();
    if (v === 'A' || v === 'B' || v === 'C') setVariant(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const reportedCompletion = useRef(false);

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const currentScore = getScore();
  const isLastQuestion = currentQuestion && progress.current === progress.total;
  const isFirstQuestion = progress.current === 1;

  // Reset selected answer when question changes
  useEffect(() => {
    if (currentQuestion && state.currentSession) {
      const existingAnswer = state.currentSession.answers[currentQuestion.id];
      setSelectedAnswer(existingAnswer ?? "");
    }
  }, [currentQuestion, state.currentSession]);

  // Timer logic
  useEffect(() => {
    if (
      timerStarted &&
      timeRemaining > 0 &&
      state.currentSession &&
      !state.currentSession.completed
    ) {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && state.currentSession && !state.currentSession.completed) {
      // Auto-submit when time runs out
      finishExam();
    }
    return undefined;
  }, [timeRemaining, timerStarted, state.currentSession, finishExam]);

  function seededShuffle<T>(arr: T[], seedStr: string): T[] {
    // Simple LCG based on seed string hash
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    const a = 1664525, c = 1013904223, m = 2 ** 32;
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      seed = (a * seed + c) % m;
      const j = seed % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const handleStartMockExam = async () => {
    resetExam();
    try {
      // Fetch more than needed then apply seeded shuffle for deterministic variants
      const pool = await questionService.getWeightedRandomQuestions(130);
      const qs = seededShuffle(pool, `${variant}-TCO`).slice(0, 105);
      void analytics.capture("mock_exam_start", { count: qs.length, variant });
      await startExam(ExamMode.MOCK, qs);
    } catch (e) {
      console.warn("Falling back to static weighted questions", e);
      const { getWeightedRandomQuestions } = await import("@/lib/questionLoader");
      const pool = getWeightedRandomQuestions(130);
      const qs = seededShuffle(pool, `${variant}-TCO`).slice(0, 105);
      void analytics.capture("mock_exam_start", { count: qs.length, variant, fallback: true });
      await startExam(ExamMode.MOCK, qs);
    }
    setTimeRemaining(105 * 60);
    setTimerStarted(true);
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, answerId);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      finishExam();
      setTimerStarted(false);
    } else {
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    previousQuestion();
  };

  const handleRestart = async () => {
    resetExam();
    setTimerStarted(false);
    setTimeRemaining(90 * 60);
    await startExam(ExamMode.MOCK);
    setTimerStarted(true);
  };

  const handleFinishEarly = () => {
    finishExam();
    setTimerStarted(false);
  };

  // Report completion once when finished
  useEffect(() => {
    if (state.currentSession?.completed && !reportedCompletion.current) {
      const { score = 0, questions = [], answers = {} as Record<string,string> } = state.currentSession as any;
      const correctCount = Array.isArray(questions)
        ? questions.filter((q: any) => answers[q.id] === q.correctAnswerId).length
        : 0;
      const totalCount = Array.isArray(questions) ? questions.length : 0;
      void analytics.capture("mock_exam_complete", { score, correctCount, totalCount });
      reportedCompletion.current = true;
      const timeSpent = state.currentSession.endTime && state.currentSession.startTime
        ? Math.max(0, Math.floor((state.currentSession.endTime.getTime() - state.currentSession.startTime.getTime()) / 1000))
        : 0;
      // No single domain for mock, skip domain attribution
      updateSessionStats(score, totalCount, timeSpent);
    }
  }, [state.currentSession?.completed]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (state.isLoading) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="glass border-white/10 p-8">
            <div className="space-y-4 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-tanium-accent"></div>
              <p className="text-foreground">Preparing your mock exam...</p>
            </div>
          </Card>
        </div>
    );
  }

  // Start screen
  if (!state.currentSession) {
    return (
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground">Mock Exam</h1>
            <p className="mb-8 text-xl text-muted-foreground">Full-length timed examination simulation</p>
          </div>

          {/* Exam info card */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <FileText className="h-6 w-6 text-tanium-accent" />
                Mock Exam Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-tanium-accent">105</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-[#f97316]">105</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-red-400">Timed</div>
                  <div className="text-sm text-muted-foreground">Auto-submit</div>
                </div>
              </div>

              <Alert className="border-yellow-200 bg-yellow-50/10 dark:border-yellow-800 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4 text-[#f97316]" />
                <AlertDescription className="text-[#f97316]">
                  <strong>Mock Exam Conditions:</strong> This is a timed exam that simulates real
                  exam conditions. You will have 90 minutes to complete all questions. The exam will
                  auto-submit when time expires.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Exam Rules:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>90-minute time limit with visible countdown timer</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                    <span>Automatic submission when time expires</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#22c55e]" />
                    <span>Navigate between questions freely</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Review and change answers before submitting</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col items-center gap-4">
                {/* Variant selector */}
                <div className="flex items-center gap-2">
                  <span className="text-foreground/80 text-sm">Exam Variant:</span>
                  {["A","B","C"].map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setVariant(v as 'A'|'B'|'C');
                        const qs = new URLSearchParams(Array.from(search?.entries?.() || []));
                        qs.set('variant', v);
                        const q = qs.toString();
                        router.replace(`/mock${q ? `?${q}` : ''}`);
                      }}
                      className={`rounded-md border px-3 py-1 text-sm ${variant===v ? 'bg-white/10 border-white/30 text-foreground' : 'border-white/20 text-foreground/80 hover:bg-white/5'}`}
                      aria-pressed={variant===v}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleStartMockExam}
                  size="lg"
                  className="bg-[#22c55e] text-foreground hover:bg-green-700"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Mock Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Completed state
  if (state.currentSession.completed) {
    const { score = 0, questions, answers } = state.currentSession;
    const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswerId).length;
    const totalCount = questions.length;
    const timeTaken = 105 * 60 - timeRemaining;
    const timeMinutes = Math.floor(timeTaken / 60);
    const timeSeconds = timeTaken % 60;

    return (
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Results header */}
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground">Mock Exam Complete!</h1>
            <p className="text-xl text-muted-foreground">Here&rsquo;s your exam performance</p>
          </div>

          {/* Results card */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <Trophy className="h-6 w-6 text-[#f97316]" />
                Your Mock Exam Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Score section */}
                <div className="text-center">
                  <div className="mb-2 text-5xl font-bold text-tanium-accent">{score}%</div>
                  <div className="mb-4 text-muted-foreground">
                    {correctCount} out of {totalCount} correct
                  </div>
                  <Progress
                    value={score}
                    className="h-4"
                    aria-label={`Mock exam score: ${score}%`}
                  />
                </div>

                {/* Time section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Time Taken</span>
                    <span className="font-medium text-foreground">
                      {timeMinutes}m {timeSeconds}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Time Remaining</span>
                    <span className="font-medium text-foreground">{formatTime(timeRemaining)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Passing Score</span>
                    <span className="font-medium text-foreground">70%</span>
                  </div>
                </div>
              </div>

              {/* Performance message */}
              <Alert
                className={cn(
                  "border-2",
                  score >= 70 ? "border-green-500 bg-green-900/20" : "border-red-500 bg-red-900/20"
                )}
              >
                <CheckCircle
                  className={cn("h-4 w-4", score >= 70 ? "text-[#22c55e]" : "text-red-400")}
                />
                <AlertDescription className="text-muted-foreground">
                  {score >= 70
                    ? `🎉 Congratulations! You passed with ${score}%. You're ready for the real exam!`
                    : `You scored ${score}%. The passing score is 70%. Keep studying and try again!`}
                </AlertDescription>
              </Alert>

              {/* Action buttons */}
              <div className="flex justify-center gap-4">
                <Button onClick={handleRestart} className="bg-tanium-accent hover:bg-blue-600">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake Exam
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/review")}
                  className="border-white/20 text-foreground hover:bg-white/10"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Review Answers
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="border-white/20 text-foreground hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Question view
  return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Progress header with timer */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mock Exam</h1>
            <p className="text-muted-foreground">
              Question {progress.current} of {progress.total}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <ExamTimer
              totalTimeMinutes={105}
              onTimeUp={() => {
                finishExam();
                setTimerStarted(false);
              }}
              onWarning={(remainingMinutes) => {
                console.log(`Timer warning: ${remainingMinutes} minutes remaining`);
              }}
            />
            <Badge
              variant="outline"
              className={cn(
                "border-white/20",
                timeRemaining < 10 * 60 ? "border-red-400 text-red-400" : "text-foreground"
              )}
            >
              {formatTime(timeRemaining)} left
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <Progress
          value={progress.percentage}
          className="h-3"
          aria-label={`Exam progress: ${progress.percentage}%`}
        />

        {/* Question card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={progress.current}
            totalQuestions={progress.total}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            showExplanation={false} // Hide explanations in mock exam
            mode="exam"
          />
        )}

        {/* Navigation and actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="border-white/20 text-foreground hover:bg-white/10 disabled:opacity-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {selectedAnswer ? "Answer selected" : "Select an answer"}
            </div>
            <Button
              variant="outline"
              onClick={handleFinishEarly}
              className="border-red-400 text-red-400 hover:bg-red-900/20"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Finish Early
            </Button>
          </div>

          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="bg-tanium-accent hover:bg-blue-600 disabled:opacity-50"
            aria-label={isLastQuestion ? "Submit Mock Exam" : "Go to Next Question"}
          >
            {isLastQuestion ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Exam
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
  );
}

export default function MockExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass border-white/10 p-6 text-foreground/80">Loading...</div>
      </div>
    }>
      <MockExamContent />
    </Suspense>
  );
}
