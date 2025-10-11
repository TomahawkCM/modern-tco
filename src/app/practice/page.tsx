"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Target,
} from "lucide-react";
import { useExam } from "@/contexts/ExamContext";
import { ExamMode } from "@/types/exam";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { questionService } from "@/lib/questionService";
import { TCODomain } from "@/types/exam";
import { useProgress } from "@/contexts/ProgressContext";

// Code-split heavy question card until needed
const QuestionCard = dynamic(
  () => import("@/components/exam/question-card").then((m) => m.QuestionCard),
  {
    ssr: false,
    loading: () => (
      <div className="glass border-white/10 p-6 text-foreground/80">Loading question…</div>
    ),
  }
);

function PracticeContent() {
  const router = useRouter();
  const TEST_HOOKS = (process.env.NEXT_PUBLIC_TEST_HOOKS ?? "").toString() === '1';
  const search = useSearchParams();
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
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [revealAnswers, setRevealAnswers] = useState<boolean>(true);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const { updateSessionStats } = useProgress();
  const [autoWrongCount, setAutoWrongCount] = useState<number>(0);
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

  const handleStartPractice = async (override?: { domain?: string; domains?: string[]; count?: number, autofinish?: boolean }) => {
    resetExam();
    try {
      // Prefer database questions; fallback to weighted if available
      const useDomain = override?.domain ?? selectedDomain;
      const useCount = override?.count ?? questionCount;
      let qs;
      if (override?.domains && override.domains.length > 0) {
        // Multi-domain selection: allocate evenly and merge
        const doms = override.domains;
        const per = Math.max(1, Math.ceil(useCount / doms.length));
        const collected: any[] = [];
        for (const d of doms) {
          try {
            const part = await questionService.getPracticeQuestions(d as TCODomain, per);
            collected.push(...part);
          } catch {}
        }
        // Randomize and trim to requested count
        qs = collected.sort(() => Math.random() - 0.5).slice(0, useCount);
      } else {
        qs = useDomain !== "all"
          ? await questionService.getPracticeQuestions(useDomain as TCODomain, useCount)
          : await questionService.getRandomQuestions(useCount);
      }
      void analytics.capture("practice_start", { count: qs.length });
      await startExam(ExamMode.PRACTICE, qs);
      if (override?.autofinish && TEST_HOOKS) {
        // test helper: allow e2e to fast finish practice flows
        setTimeout(() => finishExam(), 50);
      }
    } catch (e) {
      console.warn("Falling back to client-weighted questions due to DB error", e);
      const { getWeightedRandomQuestions } = await import("@/lib/questionLoader");
      const useCount = override?.count ?? questionCount;
      let qs;
      if (override?.domains && override.domains.length > 0) {
        // Filter by multiple domains from static pool
        const { TCODomain } = await import("@/types/exam");
        const pool = getWeightedRandomQuestions(useCount * 2);
        const normalized = override.domains.map((d) => d.toLowerCase());
        const filtered = pool.filter((q) => normalized.includes(String(q.domain).toLowerCase()));
        qs = (filtered.length > 0 ? filtered : pool).slice(0, useCount);
      } else {
        qs = getWeightedRandomQuestions(useCount);
      }
      void analytics.capture("practice_start", { count: qs.length, fallback: true });
      await startExam(ExamMode.PRACTICE, qs);
      if (override?.autofinish && TEST_HOOKS) {
        setTimeout(() => finishExam(), 50);
      }
    }
  };

  // Map URL domain codes to display strings
  function normalizeDomainParam(v: string | null): string | null {
    if (!v) return null;
    const s = decodeURIComponent(v).trim();
    const map: Record<string, string> = {
      aq: TCODomain.ASKING_QUESTIONS,
      asking: TCODomain.ASKING_QUESTIONS,
      "asking questions": TCODomain.ASKING_QUESTIONS,
      rq: TCODomain.REFINING_TARGETING,
      refining: TCODomain.REFINING_TARGETING,
      "refining questions & targeting": TCODomain.REFINING_TARGETING,
      ta: TCODomain.TAKING_ACTION,
      "taking action": TCODomain.TAKING_ACTION,
      nb: TCODomain.NAVIGATION_MODULES,
      navigation: TCODomain.NAVIGATION_MODULES,
      "navigation and basic module functions": TCODomain.NAVIGATION_MODULES,
      rd: TCODomain.REPORTING_EXPORT,
      reporting: TCODomain.REPORTING_EXPORT,
      "report generation and data export": TCODomain.REPORTING_EXPORT,
    };
    const key = s.toLowerCase();
    if (Object.values(TCODomain).includes(s as TCODomain)) return s;
    return map[key] ?? null;
  }

  function parseDomainsParam(v: string | null): string[] | null {
    if (!v) return null;
    const raw = decodeURIComponent(v).split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
    const out: string[] = [];
    for (const part of raw) {
      const norm = normalizeDomainParam(part);
      if (norm) out.push(norm);
    }
    return out.length > 0 ? Array.from(new Set(out)) : null;
  }

  // Auto-start quick drill if URL contains quick=1
  const quickStarted = useRef(false);
  useEffect(() => {
    if (!search) return;
    const quick = search.get('quick');
    const domainParam = normalizeDomainParam(search.get('domain'));
    const domainsParam = parseDomainsParam(search.get('domains'));
    const countParam = Number(search.get('count') || 25);
    const revealParam = search.get('reveal');
    const autofinishParam = search.get('autofinish');
    const autowrongParam = Number(search.get('autowrong') || 0);

    if (domainParam) setSelectedDomain(domainParam);
    if (countParam && [25,50,75,100].includes(countParam)) setQuestionCount(countParam);
    if (revealParam === '1') setRevealAnswers(true);

    if (quick === '1' && !quickStarted.current && !state.currentSession) {
      quickStarted.current = true;
      const d = domainParam ?? selectedDomain;
      const c = countParam ?? questionCount;
      // Defer to allow state updates to flush
      setTimeout(() => {
        if (domainsParam) {
          void handleStartPractice({ domains: domainsParam, count: c, autofinish: TEST_HOOKS && autofinishParam === '1' });
        } else {
          void handleStartPractice({ domain: d, count: c, autofinish: TEST_HOOKS && autofinishParam === '1' });
        }
      }, 0);
    }
    if (TEST_HOOKS) {
      setAutoWrongCount(autowrongParam > 0 ? Math.min(autowrongParam, 10) : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // For test runs: answer first N questions incorrectly
  useEffect(() => {
    if (!TEST_HOOKS) return;
    if (autoWrongCount <= 0) return;
    const sess = state.currentSession;
    if (!sess || !Array.isArray(sess.questions) || sess.questions.length === 0) return;
    try {
      const n = Math.min(autoWrongCount, sess.questions.length);
      for (let i = 0; i < n; i++) {
        const q = sess.questions[i];
        // Pick a wrong answer id (first choice not equal to correct)
        const wrong = q.choices.find((c) => c.id !== q.correctAnswerId)?.id ?? 'a';
        answerQuestion(q.id, wrong);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentSession, autoWrongCount]);

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, answerId);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      finishExam();
    } else {
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    previousQuestion();
  };

  const handleRestart = async () => {
    resetExam();
    await startExam(ExamMode.PRACTICE);
  };

  // Report completion once
  useEffect(() => {
    if (state.currentSession?.completed && !reportedCompletion.current) {
      const { score = 0, questions = [], answers = {} as Record<string,string> } = state.currentSession as any;
      const correctCount = Array.isArray(questions)
        ? questions.filter((q: any) => answers[q.id] === q.correctAnswerId).length
        : 0;
      const totalCount = Array.isArray(questions) ? questions.length : 0;
      void analytics.capture("practice_complete", { score, correctCount, totalCount });
      reportedCompletion.current = true;
      // Update progress analytics
      const timeSpent = state.currentSession.endTime && state.currentSession.startTime
        ? Math.max(0, Math.floor((state.currentSession.endTime.getTime() - state.currentSession.startTime.getTime()) / 1000))
        : 0;
      const domainForSession = selectedDomain !== 'all' ? (selectedDomain as TCODomain) : undefined;
      updateSessionStats(score, totalCount, timeSpent, domainForSession);
    }
  }, [state.currentSession?.completed]);

  // Loading state
  if (state.isLoading) {
    return (
        <div className="flex items-center justify-center py-20">
          <Card className="glass border-white/10 p-8">
            <div className="space-y-4 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-tanium-accent"></div>
              <p className="text-foreground">Preparing your practice session...</p>
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
            <h1 className="mb-4 text-4xl font-bold text-foreground">Practice Mode</h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Test your knowledge with interactive questions and instant feedback
            </p>
          </div>

          {/* Practice info card */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <Target className="h-6 w-6 text-tanium-accent" />
                Practice Session Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-tanium-accent">{questionCount}</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-[#22c55e]">~{Math.max(8, Math.round(questionCount * 1))}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-[#f97316]">Mixed</div>
                  <div className="text-sm text-muted-foreground">Difficulty</div>
                </div>
              </div>

              {/* Domain selector */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Domain</div>
                  <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                    <SelectTrigger className="border-white/20 bg-black/40 text-foreground">
                      <SelectValue placeholder="All Domains" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 text-foreground">
                      <SelectItem value="all">All Domains</SelectItem>
                      <SelectItem value={TCODomain.ASKING_QUESTIONS}>Asking Questions</SelectItem>
                      <SelectItem value={TCODomain.REFINING_TARGETING}>Refining Questions & Targeting</SelectItem>
                      <SelectItem value={TCODomain.TAKING_ACTION}>Taking Action</SelectItem>
                      <SelectItem value={TCODomain.NAVIGATION_MODULES}>Navigation & Module Functions</SelectItem>
                      <SelectItem value={TCODomain.REPORTING_EXPORT}>Reporting & Data Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question count selector (25/50/75/100) */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Number of questions</div>
                  <RadioGroup
                    value={String(questionCount)}
                    onValueChange={(v) => setQuestionCount(parseInt(v, 10))}
                    className="grid grid-cols-4 gap-2"
                  >
                    {[25, 50, 75, 100].map((n) => (
                      <label key={n} className="flex cursor-pointer items-center justify-center rounded-md border border-white/20 px-2 py-2 text-foreground hover:bg-white/10">
                        <RadioGroupItem value={String(n)} id={`count-${n}`} className="peer sr-only" />
                        <span className="peer-data-[state=checked]:font-semibold">{n}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Reveal answers toggle */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Reveal correct answer and explanation after selection</div>
                <Switch checked={revealAnswers} onCheckedChange={setRevealAnswers} />
              </div>

              <Alert className="border-blue-200 bg-blue-50/10 dark:border-blue-800 dark:bg-blue-900/20">
                <Target className="h-4 w-4 text-primary" />
                <AlertDescription className="text-muted-foreground">
                  <strong>Practice Mode Features:</strong> Immediate feedback, explanations for
                  answers, no time pressure, and the ability to review questions.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <Button
                  onClick={() => handleStartPractice()}
                  size="lg"
                  className="bg-tanium-accent text-foreground hover:bg-blue-600"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Practice Session
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

    return (
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Results header */}
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground">Practice Complete!</h1>
            <p className="text-xl text-muted-foreground">Here&rsquo;s how you performed</p>
          </div>

          {/* Results card */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <Trophy className="h-6 w-6 text-[#f97316]" />
                Your Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score display */}
              <div className="text-center">
                <div className="mb-2 text-6xl font-bold text-tanium-accent">{score}%</div>
                <div className="text-muted-foreground">
                  {correctCount} out of {totalCount} correct
                </div>
              </div>

              {/* Progress bar */}
              <Progress
                value={score}
                className="h-4"
                aria-label={`Practice score: ${score}%`}
              />

              {/* Performance message */}
              <Alert
                className={cn(
                  "border-2",
                  score >= 80
                    ? "border-green-500 bg-green-900/20"
                    : score >= 60
                      ? "border-yellow-500 bg-yellow-900/20"
                      : "border-red-500 bg-red-900/20"
                )}
              >
                <CheckCircle
                  className={cn(
                    "h-4 w-4",
                    score >= 80
                      ? "text-[#22c55e]"
                      : score >= 60
                        ? "text-[#f97316]"
                        : "text-red-400"
                  )}
                />
                <AlertDescription className="text-muted-foreground">
                  {score >= 80
                    ? "Excellent work! You're well prepared."
                    : score >= 60
                      ? "Good progress! Review the questions you missed."
                      : "Keep studying! Focus on your weak areas."}
                </AlertDescription>
              </Alert>

              {/* Action buttons */}
              <div className="flex justify-center gap-4">
                <Button onClick={handleRestart} className="bg-tanium-accent hover:bg-blue-600">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
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
        {/* Progress header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Practice Mode</h1>
            <p className="text-muted-foreground">
              Question {progress.current} of {progress.total}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-white/20 text-foreground">
              Score: {currentScore}%
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>No time limit</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <Progress
          value={progress.percentage}
          className="h-3"
          aria-label={`Session progress: ${progress.percentage}%`}
        />

        {/* Question card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={progress.current}
            totalQuestions={progress.total}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            showResult={revealAnswers && Boolean(selectedAnswer)}
            showExplanation={revealAnswers && Boolean(selectedAnswer)}
          />
        )}

        {/* Navigation */}
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

          <div className="text-sm text-muted-foreground">
            {selectedAnswer ? "Answer selected" : "Select an answer to continue"}
          </div>

          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="bg-tanium-accent hover:bg-blue-600 disabled:opacity-50"
            aria-label={isLastQuestion ? "Finish Practice Session" : "Go to Next Question"}
          >
            {isLastQuestion ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Finish Practice
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

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass border-white/10 p-6 text-foreground/80">Loading...</div>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
