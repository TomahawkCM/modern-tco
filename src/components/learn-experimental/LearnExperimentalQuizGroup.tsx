"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, HelpCircle, Loader2, XCircle } from "lucide-react";
import type { Question } from "@/lib/questionBank";
import { emitLearnExp } from "@/lib/telemetry/learnExperimental";

interface LearnExperimentalQuizGroupProps {
  questions: Question[] | Promise<Question[]>;
  moduleId?: string;
  unitId?: string;
  quizIdPrefix?: string;
}

interface QuizState {
  selected: string;
  submitted: boolean;
  correct: boolean | null;
}

const DEFAULT_STATE: QuizState = {
  selected: "",
  submitted: false,
  correct: null,
};

function sanitizeQuestions(input: Question[]): Question[] {
  return input
    .filter((question) => Boolean(question?.question))
    .map((question, index) => {
      const options = question.options ?? [];
      return {
        ...question,
        options,
        correctAnswer: question.correctAnswer ?? options[0] ?? "",
        id: question.id ?? `read-only-question-${index}`,
      } satisfies Question;
    })
    .filter((question) => question.options && question.options.length > 0);
}

function QuizCard({
  question,
  index,
  state,
  onChange,
  onSubmit,
}: {
  question: Question;
  index: number;
  state: QuizState;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const { selected, submitted, correct } = state;
  const questionId = `${question.id}-option`;

  return (
    <Card className="border border-primary/30 bg-slate-950/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <HelpCircle className="h-4 w-4 text-primary" aria-hidden />
          Quick Check {index + 1}
          {question.concept && (
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              {question.concept}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/90">{question.question}</p>

        <RadioGroup
          value={selected}
          onValueChange={onChange}
          className="space-y-2"
          aria-labelledby={`${questionId}-legend`}
        >
          {question.options?.map((option, optionIndex) => {
            const optionKey = `${questionId}-${optionIndex}`;
            const isSelected = selected === option;
            const isCorrectOption = submitted && option === question.correctAnswer;
            const isIncorrectSelection = submitted && isSelected && !isCorrectOption;

            return (
              <div
                key={optionKey}
                className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                  isCorrectOption
                    ? "border-emerald-500/70 bg-emerald-500/10"
                    : isIncorrectSelection
                      ? "border-red-500/70 bg-red-500/10"
                      : isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={option} id={optionKey} />
                <Label htmlFor={optionKey} className="flex-1 cursor-pointer text-sm">
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={onSubmit} disabled={!selected || submitted}>
            Check Answer
          </Button>

          {submitted && correct && (
            <Badge className="bg-emerald-600">
              <CheckCircle2 className="mr-2 h-3 w-3" aria-hidden /> Correct
            </Badge>
          )}

          {submitted && correct === false && (
            <Badge variant="destructive">
              <XCircle className="mr-2 h-3 w-3" aria-hidden /> Try Again
            </Badge>
          )}
        </div>

        {submitted && question.explanation && (
          <Alert className="border-primary/30 bg-primary/5">
            <AlertTitle>Why this answer?</AlertTitle>
            <AlertDescription className="text-sm text-foreground/80">
              {question.explanation}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export function LearnExperimentalQuizGroup({
  questions,
  moduleId = "learn-experimental",
  unitId = "unit",
  quizIdPrefix = "quiz",
}: LearnExperimentalQuizGroupProps) {
  const [loading, setLoading] = useState(true);
  const [questionSet, setQuestionSet] = useState<Question[]>([]);
  const [states, setStates] = useState<QuizState[]>([]);

  useEffect(() => {
    let mounted = true;

    Promise.resolve(questions)
      .then((resolved) => {
        if (!mounted) return;
        const sanitized = sanitizeQuestions(resolved ?? []);
        setQuestionSet(sanitized);
        setStates(sanitized.map(() => ({ ...DEFAULT_STATE })));
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [questions]);

  const hasQuestions = questionSet.length > 0;

  const handleSubmit = (index: number) => {
    setStates((prev) => {
      const current = prev[index] ?? { ...DEFAULT_STATE };
      const quiz = questionSet[index];
      const isCorrect = current.selected === quiz.correctAnswer;
      const next = [...prev];
      next[index] = {
        ...current,
        submitted: true,
        correct: isCorrect,
      };

      emitLearnExp({
        moduleId,
        unitId,
        action: "quiz_submit",
        correct: isCorrect,
        quizId: `${quizIdPrefix}-${quiz.id}`,
      });

      return next;
    });
  };

  const handleChange = (index: number, value: string) => {
    setStates((prev) => {
      const next = [...prev];
      next[index] = {
        ...(prev[index] ?? { ...DEFAULT_STATE }),
        selected: value,
        submitted: false,
        correct: null,
      };
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading questions…
      </div>
    );
  }

  if (!hasQuestions) {
    return (
      <Alert className="border-dashed border-primary/40 bg-slate-950/40">
        <AlertTitle className="text-sm font-semibold">No questions available</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          We couldn&apos;t load quick-check questions for this unit right now. Review the key concepts and
          return later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4" role="group" aria-label="Unit knowledge checks">
      {questionSet.map((question, index) => (
        <QuizCard
          key={question.id ?? index}
          question={question}
          index={index}
          state={states[index] ?? { ...DEFAULT_STATE }}
          onChange={(value) => handleChange(index, value)}
          onSubmit={() => handleSubmit(index)}
        />
      ))}
    </div>
  );
}

export { LearnExperimentalQuizGroup as MicroQuizMDX };
export default LearnExperimentalQuizGroup;
