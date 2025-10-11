'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, HelpCircle, Play, RotateCcw, Lightbulb } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface QueryPlaygroundProps {
  title?: string;
  instruction: string;
  expectedQuery: string;
  expectedResult?: string;
  hint?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  children?: React.ReactNode;
}

export default function QueryPlayground({
  title = "Practice Query",
  instruction,
  expectedQuery,
  expectedResult = "Query results would appear here",
  hint,
  difficulty = 'beginner',
  children
}: QueryPlaygroundProps) {
  const [userQuery, setUserQuery] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempts, setAttempts] = useState(0);

  const normalizeQuery = (query: string): string => {
    return query
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/['"]/g, '')
      .replace(/\s*,\s*/g, ',');
  };

  const checkQuery = useCallback(() => {
    const normalized = normalizeQuery(userQuery);
    const expected = normalizeQuery(expectedQuery);

    // Check for exact match or close match
    const isCorrect = normalized === expected ||
      (normalized.includes('get') &&
       normalized.includes('from all machines') &&
       expectedQuery.split(' ').every(word =>
         normalized.includes(word.toLowerCase().replace(/[,'"]/g, ''))
       ));

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowResult(isCorrect);
    setAttempts(prev => prev + 1);

    // Save progress to localStorage
    if (isCorrect) {
      const progress = JSON.parse(localStorage.getItem('queryPlaygroundProgress') || '{}');
      progress[title] = {
        completed: true,
        attempts: attempts + 1,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('queryPlaygroundProgress', JSON.stringify(progress));
    }
  }, [userQuery, expectedQuery, title, attempts]);

  const reset = () => {
    setUserQuery('');
    setShowResult(false);
    setFeedback(null);
    setShowHint(false);
    setAttempts(0);
  };

  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'beginner': return 'text-[#22c55e]';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="my-6 border-2 border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            {title}
          </CardTitle>
          <span className={`text-sm font-medium ${getDifficultyColor()}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>
        <CardDescription>{instruction}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label htmlFor="query-input" className="block text-sm font-medium mb-2">
            Enter your Tanium query:
          </label>
          <Textarea
            id="query-input"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Get Computer Name from all machines"
            className="font-mono text-sm"
            rows={3}
          />
        </div>

        {feedback && (
          <Alert className={feedback === 'correct' ? 'border-green-500' : 'border-red-500'}>
            <div className="flex items-center gap-2">
              {feedback === 'correct' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                  <AlertDescription className="text-green-700">
                    Excellent! Your query is correct.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <AlertDescription className="text-red-700">
                    Not quite right. {attempts >= 2 ? 'Try using the hint below.' : 'Give it another try!'}
                  </AlertDescription>
                </>
              )}
            </div>
          </Alert>
        )}

        {showResult && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Query Results:</p>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
              {expectedResult}
            </pre>
          </div>
        )}

        {showHint && hint && (
          <Alert className="border-blue-300 bg-blue-50">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Hint:</strong> {hint}
            </AlertDescription>
          </Alert>
        )}

        {children && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            {children}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            onClick={checkQuery}
            disabled={!userQuery.trim()}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run Query
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {hint && !showHint && attempts >= 1 && feedback !== 'correct' && (
          <Button
            onClick={() => setShowHint(true)}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Show Hint
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}