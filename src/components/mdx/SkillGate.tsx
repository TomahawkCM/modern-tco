'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Lock, Unlock, RefreshCw, Trophy } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface SkillGateProps {
  title?: string;
  requiredScore?: number;
  questions: Question[];
  nextSection?: string;
  prerequisite?: string;
  onComplete?: () => void;
}

export default function SkillGate({
  title = "Skill Checkpoint",
  requiredScore = 80,
  questions,
  nextSection = "next section",
  prerequisite,
  onComplete
}: SkillGateProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Check if this gate was previously completed
    const progress = JSON.parse(localStorage.getItem('skillGateProgress') || '{}');
    if (progress[title]?.completed) {
      setIsUnlocked(true);
    }
  }, [title]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    setAttempts(attempts + 1);

    const passed = finalScore >= requiredScore;
    setIsUnlocked(passed);

    // Save progress
    const progress = JSON.parse(localStorage.getItem('skillGateProgress') || '{}');
    progress[title] = {
      completed: passed,
      score: finalScore,
      attempts: attempts + 1,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('skillGateProgress', JSON.stringify(progress));

    if (passed && onComplete) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setSelectedAnswers(new Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(0);
  };

  if (isUnlocked && !showResults) {
    return (
      <Card className="my-6 border-2 border-green-500 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-3">
            <Unlock className="w-6 h-6 text-[#22c55e]" />
            <p className="text-green-700 font-medium">
              ✓ Checkpoint Complete - {nextSection} is unlocked!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showResults) {
    const question = questions[currentQuestion];
    const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <Card className="my-6 border-2 border-gray-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {title}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          {prerequisite && (
            <CardDescription>
              Complete this checkpoint to unlock: <strong>{nextSection}</strong>
            </CardDescription>
          )}
          <Progress value={progressPercentage} className="mt-2" />
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-4">
            <p className="font-medium text-lg">{question.question}</p>

            <RadioGroup
              value={selectedAnswers[currentQuestion]?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            {selectedAnswers.filter(a => a !== null).length} of {questions.length} answered
          </span>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswers.includes(null)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Checkpoint
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === null}
            >
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Show results
  const passed = score >= requiredScore;

  return (
    <Card className={`my-6 border-2 ${passed ? 'border-green-500' : 'border-red-500'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {passed ? (
            <>
              <Trophy className="w-6 h-6 text-[#22c55e]" />
              Checkpoint Passed!
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-red-600" />
              Not Quite There Yet
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">{score}%</p>
          <p className="text-gray-600">
            Required: {requiredScore}% | Attempts: {attempts}
          </p>
        </div>

        {passed ? (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
            <AlertDescription className="text-green-700">
              Excellent work! You've demonstrated mastery of this content.
              You can now proceed to {nextSection}.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-red-500 bg-red-50">
            <XCircle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-700">
              You need {requiredScore}% to pass. Review the content and try again.
              {attempts >= 2 && ' Consider reviewing the prerequisite material.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h3 className="font-medium">Review Your Answers:</h3>
          {questions.map((q, index) => {
            const isCorrect = selectedAnswers[index] === q.correctAnswer;
            return (
              <div key={index} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-[#22c55e] mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{q.question}</p>
                    <p className="text-sm mt-1">
                      Your answer: {q.options[selectedAnswers[index] || 0]}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-700 mt-1">
                        Correct: {q.options[q.correctAnswer]}
                      </p>
                    )}
                    {q.explanation && !isCorrect && (
                      <p className="text-sm text-gray-600 mt-2">{q.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="flex justify-center">
        {passed ? (
          <Button
            onClick={() => setShowResults(false)}
            className="bg-[#22c55e] hover:bg-green-700"
          >
            Continue to {nextSection}
          </Button>
        ) : (
          <Button
            onClick={handleRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}