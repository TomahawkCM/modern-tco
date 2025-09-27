"use client";

import React, { useState } from "react";
import {
  LearningFlowContainer,
  LearningFlowState,
  type LearningFlowContext,
} from "@/components/learning-flow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { BookOpen, HelpCircle, FileCheck, Trophy } from "lucide-react";

interface ModuleWithLearningFlowProps {
  moduleId: string;
  title: string;
  domain: string;
  learnContent: MDXRemoteSerializeResult;
  practiceQuestions?: any[]; // This would integrate with QuestionsContext in p6
  assessmentQuestions?: any[]; // This would integrate with assessment engine in p7
  className?: string;
}

export function ModuleWithLearningFlow({
  moduleId,
  title,
  domain,
  learnContent,
  practiceQuestions,
  assessmentQuestions,
  className,
}: ModuleWithLearningFlowProps) {
  const [currentFlowState, setCurrentFlowState] = useState<LearningFlowState>(
    LearningFlowState.LEARN
  );
  const [flowContext, setFlowContext] = useState<LearningFlowContext | null>(null);

  const handleFlowStateChange = (newState: LearningFlowState, context: LearningFlowContext) => {
    setCurrentFlowState(newState);
    setFlowContext(context);
  };

  const renderPhaseContent = () => {
    switch (currentFlowState) {
      case LearningFlowState.LEARN:
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-xl">Learning Material</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {domain}
                </Badge>
              </div>
              <CardDescription>Study the content below and take notes as needed</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <MDXRemote {...learnContent} />
            </CardContent>
          </Card>
        );

      case LearningFlowState.PRACTICE:
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-xl">Practice Questions</CardTitle>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  Interactive
                </Badge>
              </div>
              <CardDescription>
                Test your understanding with these practice questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {practiceQuestions && practiceQuestions.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {practiceQuestions.length} practice questions available
                  </p>
                  {/* This would be replaced with actual question components in p6 */}
                  <div className="rounded-lg border-2 border-dashed border-muted p-4 text-center text-muted-foreground">
                    Practice questions will be integrated with QuestionsContext in p6
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-muted p-4 text-center text-muted-foreground">
                  No practice questions available yet
                </div>
              )}
            </CardContent>
          </Card>
        );

      case LearningFlowState.ASSESS:
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-cyan-500" />
                <CardTitle className="text-xl">Assessment</CardTitle>
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                  Formal Assessment
                </Badge>
              </div>
              <CardDescription>Complete the assessment to demonstrate your mastery</CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentQuestions && assessmentQuestions.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {assessmentQuestions.length} assessment questions
                  </p>
                  {/* This would be replaced with actual assessment engine in p7 */}
                  <div className="rounded-lg border-2 border-dashed border-muted p-4 text-center text-muted-foreground">
                    Assessment engine will be integrated in p7
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-muted p-4 text-center text-muted-foreground">
                  No assessment available yet
                </div>
              )}
            </CardContent>
          </Card>
        );

      case LearningFlowState.COMPLETED:
        return (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <CardTitle className="text-xl text-green-800">Module Completed!</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Success
                </Badge>
              </div>
              <CardDescription className="text-green-700">
                Congratulations! You have successfully completed this module.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flowContext && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Time Spent:</span>
                      <span className="ml-2 text-muted-foreground">
                        {Math.floor(flowContext.timeSpent / 60)}m {flowContext.timeSpent % 60}s
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Attempts:</span>
                      <span className="ml-2 text-muted-foreground">{flowContext.attempts}</span>
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-green-100 p-4">
                  <p className="text-sm text-green-800">
                    🎉 Great job! You can now move on to the next module or review your progress in
                    the dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{domain} • Interactive Learning Module</p>
      </div>

      <LearningFlowContainer moduleId={moduleId} onStateChange={handleFlowStateChange}>
        {renderPhaseContent()}
      </LearningFlowContainer>
    </div>
  );
}
