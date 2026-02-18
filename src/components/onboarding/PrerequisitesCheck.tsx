"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  KnowledgeAssessment,
  type KnowledgeQuestion,
  type AssessmentResult,
  LearningPath,
  LEARNING_PATHS,
} from "@/lib/knowledge-check";
import {
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Zap,
  Award,
  ArrowRight,
  RotateCcw,
  Lightbulb,
} from "lucide-react";

interface PrerequisitesCheckProps {
  onComplete: (result: AssessmentResult) => void;
  onSkip?: () => void;
}

interface QuestionState {
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  isCorrect: boolean;
  explanation: string;
}

interface AssessmentStats {
  correct: number;
  total: number;
  timeStarted: Date;
  timePerQuestion: number[];
}

export const PrerequisitesCheck: React.FC<PrerequisitesCheckProps> = ({ onComplete, onSkip }) => {
  const [assessment] = useState(() => new KnowledgeAssessment());
  const [questions, setQuestions] = useState<KnowledgeQuestion[]>([]);
  const [questionState, setQuestionState] = useState<QuestionState>({
    currentQuestionIndex: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: false,
    explanation: "",
  });
  const [assessmentStats, setAssessmentStats] = useState<AssessmentStats>({
    correct: 0,
    total: 0,
    timeStarted: new Date(),
    timePerQuestion: [],
  });
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());

  // Initialize questions when component mounts
  useEffect(() => {
    const assessmentQuestions = assessment.getAssessmentQuestions(10);
    setQuestions(assessmentQuestions);
    setAssessmentStats((prev) => ({ ...prev, total: assessmentQuestions.length }));
  }, [assessment]);

  const startAssessment = useCallback(() => {
    setIsStarted(true);
    setQuestionStartTime(new Date());
    setAssessmentStats((prev) => ({ ...prev, timeStarted: new Date() }));
  }, []);

  const selectAnswer = useCallback(
    (answerIndex: number) => {
      if (questionState.showFeedback) return;

      const currentQuestion = questions[questionState.currentQuestionIndex];
      if (!currentQuestion) return;

      // Record time taken for this question
      const timeNow = new Date();
      const timeTaken = timeNow.getTime() - questionStartTime.getTime();

      // Record answer in assessment
      const feedback = assessment.recordAnswer(currentQuestion.id, answerIndex);

      // Update stats
      setAssessmentStats((prev) => ({
        ...prev,
        correct: prev.correct + (feedback.correct ? 1 : 0),
        timePerQuestion: [...prev.timePerQuestion, timeTaken],
      }));

      // Show feedback
      setQuestionState((prev) => ({
        ...prev,
        selectedAnswer: answerIndex,
        showFeedback: true,
        isCorrect: feedback.correct,
        explanation: feedback.explanation,
      }));
    },
    [questionState, questions, assessment, questionStartTime]
  );

  const nextQuestion = useCallback(() => {
    const nextIndex = questionState.currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      // Assessment complete
      const assessmentResult = assessment.calculateResults(questions);
      setResult(assessmentResult);
      setIsCompleted(true);
      onComplete(assessmentResult);
    } else {
      // Move to next question
      setQuestionState({
        currentQuestionIndex: nextIndex,
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: false,
        explanation: "",
      });
      setQuestionStartTime(new Date());
    }
  }, [questionState.currentQuestionIndex, questions, assessment, onComplete]);

  const restartAssessment = useCallback(() => {
    assessment.reset();
    const newQuestions = assessment.getAssessmentQuestions(10);
    setQuestions(newQuestions);
    setQuestionState({
      currentQuestionIndex: 0,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: false,
      explanation: "",
    });
    setAssessmentStats({
      correct: 0,
      total: newQuestions.length,
      timeStarted: new Date(),
      timePerQuestion: [],
    });
    setIsStarted(false);
    setIsCompleted(false);
    setResult(null);
  }, [assessment]);

  const currentQuestion = questions[questionState.currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((questionState.currentQuestionIndex + (questionState.showFeedback ? 1 : 0)) /
          questions.length) *
        100
      : 0;

  // Introduction screen
  if (!isStarted && !isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl p-6"
      >
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Knowledge Assessment</h1>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Let's determine your current knowledge level and recommend the perfect learning path
                for your TCO certification journey.
              </p>
            </div>

            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="mt-1 h-5 w-5 text-[#22c55e]" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Personalized Learning Path</h3>
                    <p className="text-sm text-gray-600">
                      Get recommendations based on your current knowledge level
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Focused Study Plan</h3>
                    <p className="text-sm text-gray-600">
                      Identify your strengths and areas for improvement
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quick Assessment</h3>
                    <p className="text-sm text-gray-600">
                      Only 10 questions, takes about 5-7 minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Assessment Coverage</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Basic IT Concepts</span>
                    <Badge variant="outline">Foundation</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Networking Fundamentals</span>
                    <Badge variant="outline">Intermediate</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Security Principles</span>
                    <Badge variant="outline">Intermediate</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Systems Administration</span>
                    <Badge variant="outline">Advanced</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Enterprise Operations</span>
                    <Badge variant="outline">Advanced</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={startAssessment}
                size="lg"
                className="bg-blue-600 px-8 text-foreground hover:bg-blue-700"
              >
                <Brain className="mr-2 h-4 w-4" />
                Start Assessment
              </Button>
              {onSkip && (
                <Button onClick={onSkip} variant="outline" size="lg" className="px-8">
                  Skip Assessment
                </Button>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Don't worry - there's no pressure! This helps us customize your learning experience.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Results screen
  if (isCompleted && result) {
    const pathConfidenceColor =
      result.recommendedPath.confidence >= 90
        ? "green"
        : result.recommendedPath.confidence >= 70
          ? "blue"
          : "orange";

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-5xl p-6"
      >
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Award className="h-8 w-8 text-[#22c55e]" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Assessment Complete!</h1>
              <p className="text-lg text-gray-600">
                Here's your personalized learning path recommendation
              </p>
            </div>

            {/* Score Overview */}
            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-1 text-3xl font-bold text-blue-600">{result.percentage}%</div>
                  <p className="text-sm text-gray-600">Overall Score</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {result.totalScore} of {result.maxScore} points
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-1 text-3xl font-bold text-[#22c55e]">
                    {assessmentStats.correct}
                  </div>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    out of {assessmentStats.total} questions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-1 text-3xl font-bold text-cyan-600">
                    {Math.round(
                      assessmentStats.timePerQuestion.reduce((a, b) => a + b, 0) /
                        assessmentStats.timePerQuestion.length /
                        1000
                    )}
                    s
                  </div>
                  <p className="text-sm text-gray-600">Avg. Time</p>
                  <p className="mt-1 text-xs text-muted-foreground">per question</p>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Learning Path */}
            <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-${pathConfidenceColor}-100`}
                    >
                      <Target className={`h-5 w-5 text-${pathConfidenceColor}-600`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {result.recommendedPath.name}
                      </h3>
                      <p className="text-sm text-gray-600">{result.recommendedPath.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`bg-${pathConfidenceColor}-100 text-${pathConfidenceColor}-800 border-${pathConfidenceColor}-200`}
                    >
                      {result.recommendedPath.confidence}% confidence
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Duration & Difficulty</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-gray-600">
                          {result.recommendedPath.duration}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize text-gray-600">
                          {result.recommendedPath.difficulty.replace("-", " ")} level
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Expected Outcomes</h4>
                    <ul className="space-y-1">
                      {result.recommendedPath.outcomes.slice(0, 3).map((outcome, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22c55e]" />
                          <span className="text-sm text-gray-600">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Weaknesses */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              {/* Strengths */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-[#22c55e]" />
                    <h3 className="font-semibold text-gray-900">Your Strengths</h3>
                  </div>
                  {result.strengths.length > 0 ? (
                    <div className="space-y-2">
                      {result.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className="border-green-200 bg-green-100 text-green-800"
                          >
                            {strength}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Focus areas identified for targeted improvement
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-900">Focus Areas</h3>
                  </div>
                  {result.weaknesses.length > 0 ? (
                    <div className="space-y-2">
                      {result.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className="border-orange-200 bg-orange-100 text-orange-800"
                          >
                            {weakness}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Great job! No major focus areas identified
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-[#f97316]" />
                  <h3 className="font-semibold text-gray-900">Recommended Next Steps</h3>
                </div>
                <div className="grid gap-3">
                  {result.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => onComplete(result)}
                size="lg"
                className="bg-[#22c55e] px-8 text-foreground hover:bg-green-700"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Start Learning Path
              </Button>
              <Button onClick={restartAssessment} variant="outline" size="lg" className="px-6">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Question screen
  if (!currentQuestion) {
    return <div className="p-8 text-center">Loading questions...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      key={questionState.currentQuestionIndex}
      className="mx-auto max-w-4xl p-6"
    >
      {/* Progress Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Question {questionState.currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Question */}
          <div className="mb-6">
            <div className="mb-4 flex items-start space-x-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-semibold text-blue-600">
                  {questionState.currentQuestionIndex + 1}
                </span>
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {currentQuestion.category.replace("-", " ")}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{currentQuestion.question}</h2>
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="mb-6 space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = questionState.selectedAnswer === index;
              const isCorrect =
                questionState.showFeedback && index === currentQuestion.correctAnswer;
              const isWrong = questionState.showFeedback && isSelected && !questionState.isCorrect;

              return (
                <motion.button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={questionState.showFeedback}
                  whileHover={{ scale: questionState.showFeedback ? 1 : 1.01 }}
                  whileTap={{ scale: questionState.showFeedback ? 1 : 0.99 }}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 ${isSelected && !questionState.showFeedback ? "border-blue-500 bg-blue-50" : "border-gray-200"} ${isCorrect ? "border-green-500 bg-green-50" : ""} ${isWrong ? "border-red-500 bg-red-50" : ""} ${!questionState.showFeedback ? "hover:bg-blue-25 hover:border-blue-300" : ""} disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm font-semibold ${isSelected && !questionState.showFeedback ? "border-blue-500 bg-primary text-foreground" : "border-gray-300"} ${isCorrect ? "border-green-500 bg-[#22c55e] text-foreground" : ""} ${isWrong ? "border-red-500 bg-red-500 text-foreground" : ""} `}
                    >
                      {questionState.showFeedback ? (
                        isCorrect ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : isWrong ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span
                      className={` ${isCorrect ? "font-medium text-green-800" : ""} ${isWrong ? "font-medium text-red-800" : ""} `}
                    >
                      {option}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {questionState.showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card
                  className={`border-2 ${questionState.isCorrect ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex-shrink-0 ${questionState.isCorrect ? "text-[#22c55e]" : "text-orange-600"}`}
                      >
                        {questionState.isCorrect ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Lightbulb className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`mb-1 font-semibold ${questionState.isCorrect ? "text-green-800" : "text-orange-800"}`}
                        >
                          {questionState.isCorrect ? "Correct!" : "Good try!"}
                        </h3>
                        <p className="text-sm text-gray-700">{questionState.explanation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                Score: {assessmentStats.correct}/
                {questionState.currentQuestionIndex + (questionState.showFeedback ? 1 : 0)}
              </span>
            </div>

            <div className="flex space-x-3">
              {questionState.showFeedback && (
                <Button onClick={nextQuestion} className="px-6">
                  {questionState.currentQuestionIndex + 1 >= questions.length ? (
                    <>
                      <Award className="mr-2 h-4 w-4" />
                      View Results
                    </>
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
