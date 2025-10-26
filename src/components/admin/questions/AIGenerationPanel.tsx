"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, XCircle, Edit, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { QuestionGeneratorService } from '@/services/QuestionGeneratorService';
import { QuestionPreview } from './QuestionPreview';
import { questionService } from '@/lib/questionService';
import type { Question, TCODomain, Difficulty, QuestionCategory } from '@/types/exam';
import {
  TCODomain as TCODomainEnum,
  Difficulty as DifficultyEnum,
  QuestionCategory as QuestionCategoryEnum
} from '@/types/exam';

interface GeneratedQuestionState extends Question {
  status: 'pending' | 'approved' | 'rejected' | 'editing';
}

export function AIGenerationPanel() {
  // Configuration state
  const [domain, setDomain] = useState<TCODomain>(TCODomainEnum.ASKING_QUESTIONS);
  const [difficulty, setDifficulty] = useState<Difficulty>(DifficultyEnum.INTERMEDIATE);
  const [category, setCategory] = useState<QuestionCategory>(QuestionCategoryEnum.PLATFORM_FUNDAMENTALS);
  const [count, setCount] = useState(5);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionState[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const generatorService = new QuestionGeneratorService();

  const handleGenerate = async () => {
    if (count < 1 || count > 50) {
      toast({
        title: 'Invalid Count',
        description: 'Please generate between 1 and 50 questions',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedQuestions([]);
    setSavedCount(0);

    try {
      // Calculate batches (5 questions per batch)
      const batchSize = 5;
      const batches = Math.ceil(count / batchSize);
      setTotalBatches(batches);

      // Generate questions with progress tracking
      const questions = await generatorService.generateQuestions({
        domain,
        difficulty,
        category,
        count,
        batchSize,
      });

      // Convert to state objects
      const questionsWithStatus: GeneratedQuestionState[] = questions.map((q) => ({
        ...q,
        status: 'pending',
      }));

      setGeneratedQuestions(questionsWithStatus);
      setProgress(100);

      toast({
        title: 'Success',
        description: `Generated ${questions.length} questions. Review and approve to save.`,
      });
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate questions',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = (questionId: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, status: 'approved' } : q))
    );
  };

  const handleReject = (questionId: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, status: 'rejected' } : q))
    );
  };

  const handleEdit = (questionId: string) => {
    // Navigate to edit page
    window.location.href = `/admin/questions/${questionId}/edit`;
  };

  const handleSaveApproved = async () => {
    const approvedQuestions = generatedQuestions.filter((q) => q.status === 'approved');

    if (approvedQuestions.length === 0) {
      toast({
        title: 'No Questions Approved',
        description: 'Please approve at least one question before saving',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    setSavedCount(0);

    try {
      let saved = 0;
      for (const question of approvedQuestions) {
        // Remove status field before saving
        const { status, ...questionData } = question;
        await questionService.addQuestion(questionData);
        saved++;
        setSavedCount(saved);
      }

      toast({
        title: 'Success',
        description: `Saved ${saved} questions to the database`,
      });

      // Clear approved questions from the list
      setGeneratedQuestions((prev) => prev.filter((q) => q.status !== 'approved'));
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save some questions',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardAll = () => {
    if (!confirm('Are you sure you want to discard all generated questions?')) return;
    setGeneratedQuestions([]);
    setProgress(0);
    toast({
      title: 'Discarded',
      description: 'All generated questions have been discarded',
    });
  };

  const approvedCount = generatedQuestions.filter((q) => q.status === 'approved').length;
  const rejectedCount = generatedQuestions.filter((q) => q.status === 'rejected').length;
  const pendingCount = generatedQuestions.filter((q) => q.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Question Generation
          </CardTitle>
          <CardDescription>
            Generate TCO exam questions using Claude AI. Configure the parameters and review generated questions before saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Select value={domain} onValueChange={(value) => setDomain(value as TCODomain)}>
                <SelectTrigger id="domain">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TCODomainEnum).map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DifficultyEnum).map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as QuestionCategory)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(QuestionCategoryEnum).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Number of Questions</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                placeholder="Enter number (1-50)"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating... ({Math.round(progress)}%)
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Questions
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Processing batch {currentBatch + 1} of {totalBatches}...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Questions Review */}
      {generatedQuestions.length > 0 && (
        <>
          {/* Summary Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{approvedCount} Approved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">{pendingCount} Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">{rejectedCount} Rejected</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDiscardAll}
                    disabled={isSaving}
                  >
                    Discard All
                  </Button>
                  <Button
                    onClick={handleSaveApproved}
                    disabled={approvedCount === 0 || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving ({savedCount}/{approvedCount})
                      </>
                    ) : (
                      `Save ${approvedCount} Approved`
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review Cards */}
          <div className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <Card
                key={question.id}
                className={
                  question.status === 'approved'
                    ? 'border-green-500/50 bg-green-500/5'
                    : question.status === 'rejected'
                    ? 'border-red-500/50 bg-red-500/5'
                    : 'border-border'
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <Badge variant="secondary">{question.domain}</Badge>
                        <Badge
                          variant={
                            question.difficulty === 'Beginner'
                              ? 'default'
                              : question.difficulty === 'Intermediate'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {question.difficulty}
                        </Badge>
                        {question.status === 'approved' && (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {question.status === 'rejected' && (
                          <Badge className="bg-red-500">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {question.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(question.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(question.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </>
                      )}
                      {question.status !== 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(question.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <QuestionPreview
                    question={question}
                    showMetadata={false}
                    showExplanation={true}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Help Text */}
      {generatedQuestions.length === 0 && !isGenerating && (
        <Alert>
          <AlertDescription>
            <p className="font-semibold mb-2">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Configure the domain, difficulty, category, and number of questions</li>
              <li>Click "Generate Questions" to create questions using Claude AI</li>
              <li>Review each generated question for accuracy and quality</li>
              <li>Approve questions you want to save, reject ones you don't</li>
              <li>Click "Save Approved" to add questions to the question bank</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
