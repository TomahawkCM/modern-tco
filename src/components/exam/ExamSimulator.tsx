"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildExamConfig, type ExamModeSim } from "@/lib/exam-simulator";
import { useAssessment } from "@/hooks/useAssessment";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { saveQuickNote } from "@/services/notesService";
import { toast } from "@/hooks/use-toast";

export default function ExamSimulator() {
  const { user } = useAuth();
  const {
    startAssessment,
    submitAnswer,
    submitAssessment,
    updateProgress,
    trackEvent,
    cancelAssessment,
    currentSession,
    currentResult,
    isLoading,
  } = useAssessment();
  const [mode, setMode] = useState<ExamModeSim | null>(null);
  const [index, setIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const questionStartRef = useRef<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const storageKey = user?.id && currentSession?.id ? `tco-exam-answers:${user.id}:${currentSession.id}` : null;

  const handleStart = async (m: ExamModeSim) => {
    setMode(m);
    const config = buildExamConfig(m, {});
    await startAssessment(config);
    };

  // Timer management: initialize on session start
  useEffect(() => {
    if (!currentSession?.timeLimit || !currentSession?.startTime) return;
    const endAt = currentSession.startTime.getTime() + (currentSession.timeLimit ?? 0) * 60 * 1000;
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endAt - now) / 1000));
      setTimeRemaining(remaining);
      if (remaining === 0) {
        // Auto-submit when time runs out
        void submitAssessment();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [currentSession?.id, currentSession?.timeLimit, currentSession?.startTime]);

  // Load persisted answers/index when a session starts
  useEffect(() => {
    try {
      if (!storageKey) return;
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { answers?: Record<string, string>; index?: number };
      if (parsed.answers) setAnswers(parsed.answers);
      if (typeof parsed.index === "number") setIndex(Math.max(0, Math.min((currentSession?.questions?.length ?? 1) - 1, parsed.index)));
    } catch (error) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Set question start timer on index change
  useEffect(() => {
    questionStartRef.current = Date.now();
    if (currentSession) {
      trackEvent({
        type: "question_navigated",
        userId: user?.id ?? "",
        sessionId: currentSession.id,
        data: { index, questionId: currentSession.questions[index]?.id },
        timestamp: new Date(),
      });
    }
    // Persist index as part of session state
    try {
      if (storageKey) {
        const existing = localStorage.getItem(storageKey);
        const parsed = existing ? JSON.parse(existing) : {};
        parsed.index = index;
        parsed.answers = parsed.answers ?? answers;
        localStorage.setItem(storageKey, JSON.stringify(parsed));
      }
    } catch (error) {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, currentSession?.id]);

  const question = useMemo(() => currentSession?.questions?.[index], [currentSession?.questions, index]);
  const isLast = useMemo(() => {
    const len = currentSession?.questions?.length ?? 0;
    return len > 0 && index === len - 1;
  }, [index, currentSession?.questions?.length]);

  async function handleSelect(answerId: string) {
    if (!currentSession || !question) return;
    const startedAt = questionStartRef.current ?? Date.now();
    const timeSpent = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const isCorrect = answerId === question.correctAnswerId;

    // Persist locally for navigation/review
    setAnswers((prev) => {
      const next = { ...prev, [question.id]: answerId };
      try {
        if (storageKey) {
          const existing = localStorage.getItem(storageKey);
          const parsed = existing ? JSON.parse(existing) : {};
          localStorage.setItem(storageKey, JSON.stringify({ ...parsed, answers: next, index }));
        }
      } catch (error) {
        // ignore
      }
      return next;
    });

    // Submit via hook (tracks analytics internally)
    await submitAnswer(question.id, {
      questionId: question.id,
      selectedAnswer: answerId,
      selectedAnswers: [answerId],
      attempts: 1,
      isCorrect,
      timeSpent,
      timestamp: new Date(),
    } as any);

    // Update question-level progress
    await updateProgress({
      userId: user?.id ?? "",
      questionId: question.id,
      isCorrect,
      timeSpent,
      sessionId: currentSession.id,
      timestamp: new Date(),
    } as any);
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button disabled={isLoading} onClick={() => handleStart("practice-test")}>Start Practice Test</Button>
        <Button variant="secondary" disabled={isLoading} onClick={() => handleStart("mock-exam")}>
          Start Mock Exam
        </Button>
      </div>

      {currentSession ? (
        <div data-testid="exam-session" className="rounded border p-4 space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-muted-foreground">
            <span>Session: {currentSession.id} · Type: {mode}</span>
            <span aria-live="polite" aria-label="Time remaining">⏱ {formatTime(timeRemaining)}</span>
          </div>
          <div className="font-medium">Question {index + 1} of {currentSession.questions.length}</div>

          {question ? (
            <div>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex-1">{question.question}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const text = `Q: ${question.question}\nAnswer: ${question.choices?.find((c) => c.id === question.correctAnswerId)?.text ?? ""}${question.explanation ? `\nWhy: ${question.explanation}` : ""}`;
                    await saveQuickNote(text, { tags: ["exam", question.domain, question.difficulty], user });
                    toast({ title: "Added to Notes", description: "View it under Notes for spaced review." });
                  }}
                >
                  Add to Notes
                </Button>
              </div>
              <div className="space-y-2">
                {question.choices?.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${question.id}`}
                      value={c.id}
                      onChange={() => handleSelect(c.id)}
                      checked={answers[question.id] === c.id}
                      data-testid="answer-radio"
                      disabled={!!currentSession?.completedAt}
                    />
                    <span>{c.text}</span>
                  </label>
                ))}
              </div>

              {/* Mini-map navigation */}
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-1">Jump to question</div>
                <div className="flex flex-wrap gap-2" data-testid="mini-map">
                  {currentSession.questions.map((q, i) => {
                    const sel = answers[q.id];
                    const completed = !!currentSession.completedAt;
                    const isCurrent = i === index;
                    let cls = "px-2 py-1 rounded text-xs";
                    if (isCurrent) cls += " bg-blue-600 text-foreground";
                    else if (completed) {
                      const correct = sel && sel === q.correctAnswerId;
                      cls += correct ? " bg-[#22c55e] text-foreground" : sel ? " bg-red-600 text-foreground" : " bg-slate-200 dark:bg-slate-700";
                    } else {
                      cls += sel ? " bg-blue-100 dark:bg-blue-900 text-blue-700" : " bg-slate-200 dark:bg-slate-700";
                    }
                    return (
                      <button
                        key={q.id}
                        type="button"
                        className={cls}
                        data-testid="mini-map-item"
                        aria-label={`Go to question ${i + 1}`}
                        onClick={() => setIndex(i)}
                        disabled={!!currentSession?.completedAt}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setIndex((v) => Math.max(0, v - 1))}
              disabled={index === 0}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {!isLast && (
                <Button onClick={() => setIndex((v) => Math.min((currentSession?.questions?.length ?? 1) - 1, v + 1))}>
                  Next
                </Button>
              )}
              {isLast && (
                <Button onClick={async () => {
                  await submitAssessment();
                  try { if (storageKey) localStorage.removeItem(storageKey); } catch {}
                }}>
                  Submit Exam
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Review Panel */}
      {currentSession && (currentSession as any).status === 'completed' ? (
        <div className="rounded border p-4 space-y-3" data-testid="review-panel">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Exam Review</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Back to start: clear session/results
                  cancelAssessment();
                  setIndex(0);
                  setAnswers({});
                  setTimeRemaining(0);
                  try { if (storageKey) localStorage.removeItem(storageKey); } catch {}
                }}
              >
                Back to start
              </Button>
              <Button
                onClick={async () => {
                  const m = mode ?? "practice-test";
                  setIndex(0);
                  setAnswers({});
                  setTimeRemaining(0);
                  await startAssessment(buildExamConfig(m, {}));
                }}
              >
                Retake Exam
              </Button>
            </div>
          </div>

          <ReviewSummary result={currentResult as any} />
          <div className="space-y-3">
            {currentSession.questions.map((q) => {
              const selected = answers[q.id];
              const correct = q.correctAnswerId;
              const isCorrect = selected === correct;
              const getText = (id?: string) => q.choices.find((c) => c.id === id)?.text ?? '';
              return (
                <div key={q.id} className="border rounded p-3" data-testid="review-item">
                  <div className="mb-2">{q.question}</div>
                  <div className="text-sm">Your answer: <span className={isCorrect ? 'text-[#22c55e]' : 'text-red-600'}>{getText(selected)}</span></div>
                  {!isCorrect && (
                    <div className="text-sm">Correct answer: <span className="text-[#22c55e]">{getText(correct)}</span></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReviewSummary({ result }: { result: any | null }) {
  if (!result) return null;
  const percent = typeof result.overallScore === 'number' ? Math.round(result.overallScore * 100) : null;
  const time = (result.timeSpent ?? result.totalTime ?? 0) as number;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return (
    <div className="rounded bg-slate-50 dark:bg-card border p-3 text-sm">
      <div>Score: {percent !== null ? `${percent}%` : '—'} · Passed: {String(result.passed)}</div>
      <div>
        Questions: {result.correctAnswers ?? 0} correct / {result.incorrectAnswers ?? 0} incorrect of {result.totalQuestions ?? 0}
      </div>
      <div>Time Spent: {minutes}:{seconds.toString().padStart(2, '0')}</div>
      {result.domainBreakdown ? (
        <div className="mt-2">
          <div className="font-medium">Domain Breakdown</div>
          <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {Object.entries(result.domainBreakdown as Record<string, any>).map(([domain, d]) => {
              const pct = typeof d.score === 'number' ? Math.round(d.score * 100) : d.score;
              return (
                <li key={domain} className="flex justify-between">
                  <span>{domain}</span>
                  <span>
                    {(d.correct ?? 0)}/{(d.total ?? 0)} · {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <div className="mt-2 text-muted-foreground">
        Progress saved via ProgressService (score, totals, domain breakdown).
      </div>
    </div>
  );
}
