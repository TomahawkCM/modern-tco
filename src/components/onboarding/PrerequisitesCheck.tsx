'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  KnowledgeAssessment, 
  KnowledgeQuestion, 
  AssessmentResult,
  LearningPath,
  LEARNING_PATHS 
} from '@/lib/knowledge-check';
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
  Lightbulb
} from 'lucide-react';

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

export const PrerequisitesCheck: React.FC<PrerequisitesCheckProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const [assessment] = useState(() => new KnowledgeAssessment());
  const [questions, setQuestions] = useState<KnowledgeQuestion[]>([]);
  const [questionState, setQuestionState] = useState<QuestionState>({
    currentQuestionIndex: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: false,
    explanation: ''
  });
  const [assessmentStats, setAssessmentStats] = useState<AssessmentStats>({
    correct: 0,
    total: 0,
    timeStarted: new Date(),
    timePerQuestion: []
  });
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());

  // Initialize questions when component mounts
  useEffect(() => {
    const assessmentQuestions = assessment.getAssessmentQuestions(10);
    setQuestions(assessmentQuestions);
    setAssessmentStats(prev => ({ ...prev, total: assessmentQuestions.length }));
  }, [assessment]);

  const startAssessment = useCallback(() => {
    setIsStarted(true);
    setQuestionStartTime(new Date());
    setAssessmentStats(prev => ({ ...prev, timeStarted: new Date() }));
  }, []);

  const selectAnswer = useCallback((answerIndex: number) => {
    if (questionState.showFeedback) return;

    const currentQuestion = questions[questionState.currentQuestionIndex];
    if (!currentQuestion) return;

    // Record time taken for this question
    const timeNow = new Date();
    const timeTaken = timeNow.getTime() - questionStartTime.getTime();
    
    // Record answer in assessment
    const feedback = assessment.recordAnswer(currentQuestion.id, answerIndex);
    
    // Update stats
    setAssessmentStats(prev => ({
      ...prev,
      correct: prev.correct + (feedback.correct ? 1 : 0),
      timePerQuestion: [...prev.timePerQuestion, timeTaken]
    }));

    // Show feedback
    setQuestionState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      showFeedback: true,
      isCorrect: feedback.correct,
      explanation: feedback.explanation
    }));
  }, [questionState, questions, assessment, questionStartTime]);

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
        explanation: ''
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
      explanation: ''
    });
    setAssessmentStats({
      correct: 0,
      total: newQuestions.length,
      timeStarted: new Date(),
      timePerQuestion: []
    });
    setIsStarted(false);
    setIsCompleted(false);
    setResult(null);
  }, [assessment]);

  const currentQuestion = questions[questionState.currentQuestionIndex];
  const progress = questions.length > 0 ? ((questionState.currentQuestionIndex + (questionState.showFeedback ? 1 : 0)) / questions.length) * 100 : 0;

  // Introduction screen
  if (!isStarted && !isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Knowledge Assessment
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Let's determine your current knowledge level and recommend the perfect learning path for your TCO certification journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Personalized Learning Path</h3>
                    <p className="text-sm text-gray-600">Get recommendations based on your current knowledge level</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Focused Study Plan</h3>
                    <p className="text-sm text-gray-600">Identify your strengths and areas for improvement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-cyan-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quick Assessment</h3>
                    <p className="text-sm text-gray-600">Only 10 questions, takes about 5-7 minutes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border">
                <h3 className="font-semibold text-gray-900 mb-4">Assessment Coverage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Basic IT Concepts</span>
                    <Badge variant="outline">Foundation</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Networking Fundamentals</span>
                    <Badge variant="outline">Intermediate</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Security Principles</span>
                    <Badge variant="outline">Intermediate</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Systems Administration</span>
                    <Badge variant="outline">Advanced</Badge>
                  </div>
                  <div className="flex justify-between items-center">
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                <Brain className="h-4 w-4 mr-2" />
                Start Assessment
              </Button>
              {onSkip && (
                <Button 
                  onClick={onSkip}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Skip Assessment
                </Button>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
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
    const pathConfidenceColor = result.recommendedPath.confidence >= 90 ? 'green' : 
                               result.recommendedPath.confidence >= 70 ? 'blue' : 'orange';
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl mx-auto p-6"
      >
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Assessment Complete!
              </h1>
              <p className="text-lg text-gray-600">
                Here's your personalized learning path recommendation
              </p>
            </div>

            {/* Score Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {result.percentage}%
                  </div>
                  <p className="text-sm text-gray-600">Overall Score</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.totalScore} of {result.maxScore} points
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {assessmentStats.correct}
                  </div>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                  <p className="text-xs text-gray-500 mt-1">
                    out of {assessmentStats.total} questions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-cyan-600 mb-1">
                    {Math.round(assessmentStats.timePerQuestion.reduce((a, b) => a + b, 0) / assessmentStats.timePerQuestion.length / 1000)}s
                  </div>
                  <p className="text-sm text-gray-600">Avg. Time</p>
                  <p className="text-xs text-gray-500 mt-1">
                    per question
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Learning Path */}
            <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-${pathConfidenceColor}-100`}>
                      <Target className={`h-5 w-5 text-${pathConfidenceColor}-600`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {result.recommendedPath.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {result.recommendedPath.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`bg-${pathConfidenceColor}-100 text-${pathConfidenceColor}-800 border-${pathConfidenceColor}-200`}>
                      {result.recommendedPath.confidence}% confidence
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Duration & Difficulty</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{result.recommendedPath.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 capitalize">
                          {result.recommendedPath.difficulty.replace('-', ' ')} level
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Expected Outcomes</h4>
                    <ul className="space-y-1">
                      {result.recommendedPath.outcomes.slice(0, 3).map((outcome, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Strengths */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-gray-900">Your Strengths</h3>
                  </div>
                  {result.strengths.length > 0 ? (
                    <div className="space-y-2">
                      {result.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {strength}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Focus areas identified for targeted improvement
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-900">Focus Areas</h3>
                  </div>
                  {result.weaknesses.length > 0 ? (
                    <div className="space-y-2">
                      {result.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                            {weakness}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Great job! No major focus areas identified
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900">Recommended Next Steps</h3>
                </div>
                <div className="grid gap-3">
                  {result.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
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
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Start Learning Path
              </Button>
              <Button 
                onClick={restartAssessment}
                variant="outline"
                size="lg"
                className="px-6"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
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
    return <div className="text-center p-8">Loading questions...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      key={questionState.currentQuestionIndex}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {questionState.currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
                  {questionState.currentQuestionIndex + 1}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="capitalize">
                    {currentQuestion.category.replace('-', ' ')}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = questionState.selectedAnswer === index;
              const isCorrect = questionState.showFeedback && index === currentQuestion.correctAnswer;
              const isWrong = questionState.showFeedback && isSelected && !questionState.isCorrect;

              return (
                <motion.button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={questionState.showFeedback}
                  whileHover={{ scale: questionState.showFeedback ? 1 : 1.01 }}
                  whileTap={{ scale: questionState.showFeedback ? 1 : 0.99 }}
                  className={`
                    w-full p-4 text-left rounded-lg border-2 transition-all duration-200
                    ${isSelected && !questionState.showFeedback ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${isCorrect ? 'border-green-500 bg-green-50' : ''}
                    ${isWrong ? 'border-red-500 bg-red-50' : ''}
                    ${!questionState.showFeedback ? 'hover:border-blue-300 hover:bg-blue-25' : ''}
                    disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                      ${isSelected && !questionState.showFeedback ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'}
                      ${isCorrect ? 'border-green-500 bg-green-500 text-white' : ''}
                      ${isWrong ? 'border-red-500 bg-red-500 text-white' : ''}
                    `}>
                      {questionState.showFeedback ? (
                        isCorrect ? <CheckCircle className="h-4 w-4" /> :
                        isWrong ? <XCircle className="h-4 w-4" /> :
                        String.fromCharCode(65 + index)
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span className={`
                      ${isCorrect ? 'text-green-800 font-medium' : ''}
                      ${isWrong ? 'text-red-800 font-medium' : ''}
                    `}>
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
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card className={`border-2 ${questionState.isCorrect ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 ${questionState.isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
                        {questionState.isCorrect ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Lightbulb className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold mb-1 ${questionState.isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                          {questionState.isCorrect ? 'Correct!' : 'Good try!'}
                        </h3>
                        <p className="text-sm text-gray-700">
                          {questionState.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                Score: {assessmentStats.correct}/{questionState.currentQuestionIndex + (questionState.showFeedback ? 1 : 0)}
              </span>
            </div>

            <div className="flex space-x-3">
              {questionState.showFeedback && (
                <Button onClick={nextQuestion} className="px-6">
                  {questionState.currentQuestionIndex + 1 >= questions.length ? (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      View Results
                    </>
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="h-4 w-4 ml-2" />
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