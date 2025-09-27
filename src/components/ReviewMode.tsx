"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  RotateCcw,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  type AssessmentResult,
  type AssessmentSession,
  QuestionResponse,
  type RemediationPlan,
  ObjectiveRemediation,
} from "@/types/assessment";

interface ReviewModeProps {
  result: AssessmentResult;
  session: AssessmentSession;
  onRetakeAssessment: () => void;
  onStartRemediation: (plan: RemediationPlan) => void;
  onExitReview: () => void;
}

export function ReviewMode({
  result,
  session,
  onRetakeAssessment,
  onStartRemediation,
  onExitReview,
}: ReviewModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showExplanations, setShowExplanations] = useState(true);

  const currentQuestion = session.questions[currentQuestionIndex];
  const currentResponse = (session.responses as any)[currentQuestion.id];
  const isCorrect = currentResponse?.selectedAnswer === currentQuestion.correctAnswer;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.8) return "default"; // green
    if (score >= 0.7) return "secondary"; // yellow
    return "destructive"; // red
  };

  const handleExportResults = () => {
    const exportData = {
      assessment: {
        type: result.assessment?.type || "practice",
        completedAt: result.completedAt,
        duration: result.totalTime || 0,
      },
      score: {
        overall: result.overallScore,
        percentage: result.overallScore * 100,
        passed: result.passed,
      },
      domains: result.domainBreakdown,
      objectives: result.objectiveBreakdown,
      remediationPlan: result.remediationPlan,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tcо-assessment-results-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
              <Badge variant={getScoreBadgeVariant(result.overallScore)}>
                {formatPercentage(result.overallScore)}
              </Badge>
              <Badge variant={result.passed ? "default" : "destructive"}>
                {result.passed ? "PASSED" : "FAILED"}
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleExportResults}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" onClick={onExitReview}>
                Exit Review
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-2xl font-bold text-gray-900">{session.questions.length}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <div className="text-2xl font-bold text-green-700">{result.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <div className="text-2xl font-bold text-red-700">{result.incorrectAnswers}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="text-2xl font-bold text-blue-700">
                {formatTime(result.totalTime || 0)}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Question Review</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="remediation">Study Plan</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Domain Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Domain Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(result.domainBreakdown || {}).map(([domain, breakdown]) => (
                    <div key={domain} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{domain}</span>
                        <span
                          className={`text-sm font-semibold ${getScoreColor(breakdown.score || 0)}`}
                        >
                          {formatPercentage(breakdown.score || 0)}
                        </span>
                      </div>
                      <Progress value={breakdown.score * 100} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {breakdown.correct} / {breakdown.total} correct
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Time per Question</span>
                    <span className="font-semibold">
                      {formatTime(
                        Math.round((result.totalTime || 0) / Math.max(1, session.questions.length))
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confidence Alignment</span>
                    <span className="font-semibold">
                      {formatPercentage(result.performance?.confidenceAlignment || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Time Efficiency</span>
                    <span className="font-semibold">{formatPercentage(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Difficulty Consistency</span>
                    <span className="font-semibold">{formatPercentage(0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {!result.passed && (
                    <Button onClick={onRetakeAssessment} className="flex items-center">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retake Assessment
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => onStartRemediation(result.remediationPlan || result.remediation)}
                    className="flex items-center"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start Study Plan
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTab("remediation")}>
                    View Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Question Review Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Question Navigation */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Question Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-5 gap-2">
                    {session.questions.map((question, index) => {
                      const response = (session.responses as any)[question.id];
                      const isCurrentQuestion = index === currentQuestionIndex;
                      const isAnswerCorrect = response?.selectedAnswer === question.correctAnswer;

                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`h-10 w-10 rounded-lg text-sm font-semibold transition-all ${
                            isCurrentQuestion
                              ? "bg-blue-600 text-white"
                              : isAnswerCorrect
                                ? "border border-green-300 bg-green-100 text-green-700"
                                : response
                                  ? "border border-red-300 bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded border border-green-300 bg-green-100"></div>
                      <span>Correct ({result.correctAnswers})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded border border-red-300 bg-red-100"></div>
                      <span>Incorrect ({result.incorrectAnswers})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded bg-gray-100"></div>
                      <span>
                        Unanswered (
                        {session.questions.length - Object.keys(session.responses).length})
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Detail */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      Question {currentQuestionIndex + 1}
                      {currentQuestion.domain && (
                        <Badge variant="outline" className="ml-2">
                          {currentQuestion.domain}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="font-medium">{currentQuestion.question}</p>
                    {currentQuestion.context && (
                      <div className="mt-3 rounded border-l-4 border-blue-400 bg-blue-50 p-3">
                        <p className="text-sm text-blue-800">{currentQuestion.context}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {(currentQuestion.options || currentQuestion.choices || []).map(
                      (option, index) => {
                        const optionLetter = String.fromCharCode(65 + index);
                        const isCorrectAnswer = option.id === currentQuestion.correctAnswerId;
                        const isSelectedAnswer = currentResponse?.selectedAnswer === option.id;

                        return (
                          <div
                            key={option.id}
                            className={`rounded-lg border-2 p-3 ${
                              isCorrectAnswer
                                ? "border-green-500 bg-green-50"
                                : isSelectedAnswer && !isCorrectAnswer
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                                  isCorrectAnswer
                                    ? "border-green-500 bg-green-500 text-white"
                                    : isSelectedAnswer
                                      ? "border-red-500 bg-red-500 text-white"
                                      : "border-gray-300 text-gray-500"
                                }`}
                              >
                                {optionLetter}
                              </div>
                              <div className="flex-1">
                                <span
                                  className={isCorrectAnswer ? "font-medium text-green-800" : ""}
                                >
                                  {option.text}
                                </span>
                                {isCorrectAnswer && (
                                  <span className="ml-2 text-xs font-medium text-green-600">
                                    ✓ Correct
                                  </span>
                                )}
                                {isSelectedAnswer && !isCorrectAnswer && (
                                  <span className="ml-2 text-xs font-medium text-red-600">
                                    ✗ Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {showExplanations && currentQuestion.explanation && (
                    <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
                      <h4 className="mb-2 font-semibold text-blue-900">Explanation:</h4>
                      <p className="text-blue-800">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  {currentQuestion.reference && (
                    <div className="text-sm text-gray-600">
                      <strong>Reference:</strong> {currentQuestion.reference}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExplanations(!showExplanations)}
                    >
                      {showExplanations ? "Hide" : "Show"} Explanations
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentQuestionIndex(
                          Math.min(session.questions.length - 1, currentQuestionIndex + 1)
                        )
                      }
                      disabled={currentQuestionIndex === session.questions.length - 1}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Objective Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Objective Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(result.objectiveBreakdown || {}).map(([objective, breakdown]) => (
                    <div key={objective} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{objective}</span>
                        <span
                          className={`text-sm font-semibold ${getScoreColor(breakdown.score || 0)}`}
                        >
                          {formatPercentage(breakdown.score || 0)}
                        </span>
                      </div>
                      <Progress value={(breakdown.score || 0) * 100} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {breakdown.correct} / {breakdown.total} correct
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Time Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Time Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Time</span>
                      <span className="font-semibold">{formatTime(result.totalTime || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average per Question</span>
                      <span className="font-semibold">
                        {formatTime(
                          Math.round(
                            (result.totalTime || 0) / Math.max(1, session.questions.length)
                          )
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time Remaining</span>
                      <span className="font-semibold">
                        {formatTime(
                          Math.max(0, (session.timeLimit || 0) * 60 - (result.totalTime || 0))
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time Efficiency</span>
                      <span className="font-semibold">{formatPercentage(0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Remediation Tab */}
          <TabsContent value="remediation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Personalized Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Priority Objectives */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Priority Areas for Improvement</h3>
                  <div className="space-y-4">
                    {(result.remediationPlan || result.remediation)?.priorityObjectives?.map(
                      (objective, index) => (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium">{objective.objectiveId}</h4>
                            <Badge
                              variant={objective.priority === "high" ? "destructive" : "secondary"}
                            >
                              {objective.priority} priority
                            </Badge>
                          </div>
                          <p className="mb-3 text-sm text-gray-600">{objective.reasoning}</p>

                          <div className="space-y-2">
                            <div className="text-sm font-medium">Recommended Resources:</div>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {(objective.resources || []).map((resource, resourceIndex) => (
                                <li key={resourceIndex} className="flex items-center">
                                  <span className="mr-2 h-2 w-2 rounded-full bg-blue-400"></span>
                                  {resource}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-3 text-sm">
                            <span className="font-medium">Estimated Study Time:</span>
                            <span className="ml-2">{objective.estimatedStudyTime} hours</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Study Plan */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Recommended Study Schedule</h3>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {(result.remediationPlan || result.remediation)?.estimatedStudyTime || 0}h
                        </div>
                        <div className="text-sm text-gray-600">Total Study Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {(result.remediationPlan || result.remediation)?.priorityObjectives
                            ?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Focus Areas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {(result.remediationPlan || result.remediation)?.canRetake ? "Yes" : "No"}
                        </div>
                        <div className="text-sm text-gray-600">Ready to Retake</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => onStartRemediation(result.remediationPlan || result.remediation)}
                    className="flex items-center"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start Study Plan
                  </Button>
                  <Button variant="outline" onClick={handleExportResults}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Study Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
