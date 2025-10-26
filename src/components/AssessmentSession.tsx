"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuestions } from "@/contexts/QuestionsContext";
import { AssessmentEngine } from "@/lib/assessment-engine";
import type {
  AssessmentResult,
  AssessmentSession as AssessmentSessionType,
  AssessmentType,
} from "@/types/assessment";
import type { TCODomain } from "@/types/exam";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Clock, Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import "@/styles/assessment.css";

interface AssessmentSessionProps {
  assessmentType: AssessmentType;
  moduleId?: string;
  domainFilter?: string | string[];
  onComplete: (result: AssessmentResult) => void;
  onExit: () => void;
}

export function AssessmentSession({
  assessmentType,
  moduleId,
  domainFilter,
  onComplete,
  onExit,
}: AssessmentSessionProps) {
  const { getAssessmentQuestions } = useQuestions();
  const [session, setSession] = useState<AssessmentSessionType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize assessment session
  useEffect(() => {
    const initializeAssessment = async () => {
      const domainFilterSingle = Array.isArray(domainFilter) ? domainFilter[0] : domainFilter;
      const questions = await getAssessmentQuestions({
        type: assessmentType,
        moduleId,
        domainFilter: domainFilterSingle as TCODomain,
        count: getQuestionCount(assessmentType),
      });

      const newSession: AssessmentSessionType = {
        id: `assessment-${Date.now()}`,
        domain: domainFilterSingle as TCODomain,
        questions,
        responses: [],
        startTime: new Date(),
        timeLimit: getTimeLimit(assessmentType),
        moduleId,
        status: "in_progress",
        config: {
          type: assessmentType,
          moduleId,
          domainFilter: Array.isArray(domainFilter)
            ? domainFilter.filter((d): d is string => d !== undefined)
            : domainFilter
              ? [domainFilter]
              : [],
          questionCount: questions.length,
          timeLimit: getTimeLimit(assessmentType),
        },
      };

      setSession(newSession);
      setTimeRemaining((newSession.timeLimit ?? 30) * 60); // Convert to seconds, default to 30 minutes
    };

    void initializeAssessment();
  }, [assessmentType, moduleId, domainFilter, getAssessmentQuestions]);

  // Timer effect
  useEffect(() => {
    if (!session || session.status !== "in_progress" || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          void handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, timeRemaining]);

  const getQuestionCount = (type: AssessmentType): number => {
    switch (type) {
      case "mock-exam":
        return 75;
      case "domain-test":
        return 15;
      case "module-quiz":
        return 10;
      case "practice-test":
        return 25;
      default:
        return 10;
    }
  };

  const getTimeLimit = (type: AssessmentType): number => {
    switch (type) {
      case "mock-exam":
        return 105; // 105 minutes for full exam
      case "domain-test":
        return 20;
      case "module-quiz":
        return 15;
      case "practice-test":
        return 35;
      default:
        return 15;
    }
  };

  const handleAnswerSelect = useCallback(
    (questionId: string, selectedAnswer: string) => {
      if (!session) return;

      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          responses: {
            ...prev.responses,
            [questionId]: {
              questionId,
              selectedAnswer,
              timestamp: new Date(),
              timeSpent: Math.round((Date.now() - prev.startTime.getTime()) / 1000),
            },
          },
        };
      });
    },
    [session]
  );

  const handleNextQuestion = () => {
    if (!session) return;

    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      void handleSubmitAssessment();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!session || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const endTime = new Date();
      const completedSession: AssessmentSessionType = {
        ...session,
        id: session.id || `assessment-${Date.now()}`,
        endTime,
        status: "completed",
      };

      // Calculate results using assessment engine
      const result = await AssessmentEngine.calculateResults(completedSession);
      onComplete(result);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      // Handle error - could show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = (): number => {
    if (!session) return 0;
    return ((currentQuestionIndex + 1) / session.questions.length) * 100;
  };

  const getAnsweredCount = (): number => {
    if (!session) return 0;
    return Object.keys(session.responses).length;
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-600">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const isTimeWarning = timeRemaining < 300; // 5 minutes warning
  const isTimeCritical = timeRemaining < 60; // 1 minute critical

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant={assessmentType === "mock-exam" ? "destructive" : "secondary"}>
                {assessmentType.replace("-", " ").toUpperCase()}
              </Badge>
              <div className="flex items-center text-sm text-gray-600">
                <Target className="mr-1 h-4 w-4" />
                Question {currentQuestionIndex + 1} of {session.questions.length}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div
                className={`time-display ${
                  isTimeCritical
                    ? "time-display--critical"
                    : isTimeWarning
                      ? "time-display--warning"
                      : "time-display--normal"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmExit(true)}
                className="text-gray-600 hover:text-gray-800"
              >
                Exit
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>
                {getAnsweredCount()} / {session.questions.length} answered
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="w-full" />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-relaxed">
                    {currentQuestion.question}
                  </CardTitle>
                  {currentQuestion.domain && (
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {currentQuestion.domain}
                    </Badge>
                  )}
                </div>
                {currentQuestion.context && (
                  <div className="mt-4 rounded-lg bg-blue-50 p-3">
                    <p className="text-sm text-blue-800">{currentQuestion.context}</p>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {(currentQuestion.options ?? currentQuestion.choices ?? []).map((option: any, index: number) => {
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                  const currentResponse = session.responses.find((r: any) => r.questionId === currentQuestion.id);
                  const isSelected = currentResponse?.selectedAnswer === option.id;

                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                      aria-label={`Option ${optionLetter}: ${option.text}`}
                      className={`assessment-option-button ${
                        isSelected
                          ? "assessment-option-button--selected"
                          : "assessment-option-button--unselected"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`option-indicator ${
                            isSelected
                              ? "option-indicator--selected"
                              : "option-indicator--unselected"
                          }`}
                        >
                          {optionLetter}
                        </div>
                        <span className="flex-1">{option.text}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {session.questions.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                aria-label={`Go to question ${index + 1}${session.responses.find((r: any) => r.questionId === session.questions[index].id) ? ' (answered)' : ''}`}
                title={`Question ${index + 1}${session.responses.find((r: any) => r.questionId === session.questions[index].id) ? ' - Answered' : ' - Not answered'}`}
                className={`question-nav-button ${
                  index === currentQuestionIndex
                    ? "question-nav-button--active"
                    : session.responses.find((r: any) => r.questionId === session.questions[index].id)
                      ? "question-nav-button--answered"
                      : "question-nav-button--unanswered"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={handleNextQuestion}
            disabled={isSubmitting}
            className={
              currentQuestionIndex === session.questions.length - 1
                ? "bg-[#22c55e] hover:bg-green-700"
                : ""
            }
          >
            {isSubmitting
              ? "Submitting..."
              : currentQuestionIndex === session.questions.length - 1
                ? "Submit Assessment"
                : "Next"}
          </Button>
        </div>

        {/* Time Warning */}
        {isTimeWarning && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Alert
              className={`${isTimeCritical ? "border-red-500 bg-red-50" : "border-yellow-500 bg-yellow-50"}`}
            >
              <AlertCircle
                className={`h-4 w-4 ${isTimeCritical ? "text-red-600" : "text-yellow-600"}`}
              />
              <AlertDescription className={isTimeCritical ? "text-red-800" : "text-yellow-800"}>
                {isTimeCritical ? "Less than 1 minute remaining!" : "Less than 5 minutes remaining"}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmExit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-lg bg-white p-6"
            >
              <h3 className="mb-4 text-lg font-semibold">Exit Assessment?</h3>
              <p className="mb-6 text-gray-600">
                Are you sure you want to exit? Your progress will be lost and this attempt will not
                be saved.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowConfirmExit(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={onExit}>
                  Exit Assessment
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
