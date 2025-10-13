"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle2, BookOpen, Terminal } from 'lucide-react';
import type { Question } from '@/types/exam';

interface QuestionPreviewProps {
  question: Question;
  showMetadata?: boolean;
  showExplanation?: boolean;
  selectedAnswer?: string;
  onAnswerSelect?: (answerId: string) => void;
}

export function QuestionPreview({
  question,
  showMetadata = false,
  showExplanation = false,
  selectedAnswer,
  onAnswerSelect,
}: QuestionPreviewProps) {
  return (
    <div className="space-y-4">
      <Card className="glass border-white/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-foreground text-lg">
                {question.question || 'Question text preview...'}
              </CardTitle>
              {showMetadata && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">{question.domain}</Badge>
                  <Badge variant={
                    question.difficulty === 'Beginner' ? 'default' :
                    question.difficulty === 'Intermediate' ? 'secondary' :
                    question.difficulty === 'Advanced' ? 'destructive' :
                    'outline'
                  }>
                    {question.difficulty}
                  </Badge>
                  <Badge variant="outline">{question.category}</Badge>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Answer Choices */}
          <RadioGroup
            value={selectedAnswer}
            onValueChange={onAnswerSelect}
            className="space-y-3"
          >
            {question.choices.map((choice) => {
              const isCorrect = choice.id === question.correctAnswerId;
              const isSelected = choice.id === selectedAnswer;

              return (
                <div
                  key={choice.id}
                  className={`
                    flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors
                    ${isSelected && showExplanation && isCorrect
                      ? 'border-green-500 bg-green-500/10'
                      : isSelected && showExplanation && !isCorrect
                      ? 'border-red-500 bg-red-500/10'
                      : isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'}
                  `}
                >
                  <RadioGroupItem
                    value={choice.id}
                    id={`preview-choice-${choice.id}`}
                    disabled={!onAnswerSelect}
                  />
                  <Label
                    htmlFor={`preview-choice-${choice.id}`}
                    className="flex-1 cursor-pointer leading-relaxed"
                  >
                    <span className="font-semibold">{choice.id.toUpperCase()}.</span>{' '}
                    {choice.text || <span className="text-muted-foreground italic">Choice text...</span>}
                  </Label>
                  {showExplanation && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </RadioGroup>

          {/* Explanation */}
          {showExplanation && question.explanation && (
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                <div className="font-semibold text-foreground mb-1">Explanation</div>
                <div className="text-muted-foreground">{question.explanation}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Study Guide Reference */}
          {showMetadata && question.studyGuideRef && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Study Guide:</span> {question.studyGuideRef}
              </div>
            </div>
          )}

          {/* Console Steps */}
          {showMetadata && question.consoleSteps && question.consoleSteps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Terminal className="h-4 w-4" />
                Console Steps
              </div>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-6">
                {question.consoleSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Tags */}
          {showMetadata && question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Preview */}
      {showMetadata && (
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-sm">Mobile Preview</CardTitle>
            <CardDescription className="text-xs">How this question appears on mobile devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-[375px] mx-auto">
              <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                <div className="text-sm text-foreground font-medium">
                  {question.question || 'Question text preview...'}
                </div>
                <div className="space-y-2">
                  {question.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className="bg-gray-800 rounded p-2 text-xs text-muted-foreground"
                    >
                      <span className="font-semibold">{choice.id.toUpperCase()}.</span>{' '}
                      {choice.text || 'Choice text...'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
