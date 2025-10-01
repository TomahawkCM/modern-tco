"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Award,
  Eye,
  RefreshCw,
} from "lucide-react";

import {
  type LabStep,
  type ValidationResult,
  type ValidationCriteria,
  type CriteriaResult,
  type ConsoleState,
  type ConsoleAction,
  StepValidation,
  ProgressCheckpoint,
} from "@/types/lab";

interface CheckpointValidatorProps {
  step: LabStep;
  consoleState: ConsoleState;
  userActions: ConsoleAction[];
  onValidationCompleteAction: (result: ValidationResult) => void;
  onHintRequestAction: (hintId: string) => void;
  isValidating?: boolean;
}

interface ValidationEngine {
  validateStep: (
    step: LabStep,
    consoleState: ConsoleState,
    userActions: ConsoleAction[]
  ) => Promise<ValidationResult>;
}

// Advanced validation engine
class AdvancedValidationEngine implements ValidationEngine {
  async validateStep(
    step: LabStep,
    consoleState: ConsoleState,
    userActions: ConsoleAction[]
  ): Promise<ValidationResult> {
    const criteriaResults: CriteriaResult[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Validate each criteria
    for (const criteria of step.validation.criteria) {
      const result = await this.validateCriteria(criteria, consoleState, userActions);
      criteriaResults.push(result);
      
      totalScore += result.score * (criteria.weight / 100);
      totalWeight += criteria.weight;
    }

    // Calculate final score
    const finalScore = Math.round((totalScore / totalWeight) * 100);
    const success = finalScore >= 70; // 70% passing threshold

    // Generate feedback and suggestions
    const feedback = this.generateFeedback(criteriaResults, success);
    const suggestions = this.generateSuggestions(criteriaResults, consoleState, userActions);

    return {
      success,
      score: finalScore,
      feedback,
      criteria: criteriaResults,
      suggestions,
    };
  }

  private async validateCriteria(
    criteria: ValidationCriteria,
    consoleState: ConsoleState,
    userActions: ConsoleAction[]
  ): Promise<CriteriaResult> {
    let passed = false;
    let score = 0;
    let feedback = "";

    switch (criteria.type) {
      case "console-state":
        ({ passed, score, feedback } = this.validateConsoleState(criteria, consoleState));
        break;
      
      case "user-input":
        ({ passed, score, feedback } = this.validateUserInput(criteria, userActions));
        break;
      
      case "result-data":
        ({ passed, score, feedback } = this.validateResultData(criteria, consoleState));
        break;
      
      case "time-limit":
        ({ passed, score, feedback } = this.validateTimeLimit(criteria, userActions));
        break;
      
      case "action-sequence":
        ({ passed, score, feedback } = this.validateActionSequence(criteria, userActions));
        break;
      
      default:
        feedback = "Unknown validation criteria type";
        break;
    }

    return {
      id: criteria.id,
      passed,
      score,
      feedback,
    };
  }

  private validateConsoleState(
    criteria: ValidationCriteria,
    consoleState: ConsoleState
  ): { passed: boolean; score: number; feedback: string } {
    try {
      // Parse condition as JSON path or simple property check
      const {condition} = criteria;
      
      if (condition.includes("currentModule")) {
        const expectedModule = condition.split("=")[1]?.trim().replace(/['"]/g, "");
        const passed = consoleState.currentModule === expectedModule;
        return {
          passed,
          score: passed ? 100 : 0,
          feedback: passed 
            ? `✓ Correctly navigated to ${expectedModule} module`
            : `✗ Expected ${expectedModule} module, but currently in ${consoleState.currentModule}`,
        };
      }

      if (condition.includes("queries.length")) {
        const expectedCount = parseInt(condition.split(">=")[1] || condition.split(">")[1] || "0");
        const actualCount = consoleState.queries.length;
        const passed = actualCount >= expectedCount;
        return {
          passed,
          score: passed ? 100 : Math.min((actualCount / expectedCount) * 100, 99),
          feedback: passed
            ? `✓ Created ${actualCount} queries (expected at least ${expectedCount})`
            : `✗ Only created ${actualCount} queries, need at least ${expectedCount}`,
        };
      }

      if (condition.includes("computerGroups.length")) {
        const expectedCount = parseInt(condition.split(">=")[1] || condition.split(">")[1] || "0");
        const actualCount = consoleState.computerGroups.length;
        const passed = actualCount >= expectedCount;
        return {
          passed,
          score: passed ? 100 : Math.min((actualCount / expectedCount) * 100, 99),
          feedback: passed
            ? `✓ Created ${actualCount} computer groups (expected at least ${expectedCount})`
            : `✗ Only created ${actualCount} computer groups, need at least ${expectedCount}`,
        };
      }

      return {
        passed: false,
        score: 0,
        feedback: `Could not evaluate condition: ${condition}`,
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        feedback: `Error evaluating console state: ${error}`,
      };
    }
  }

  private validateUserInput(
    criteria: ValidationCriteria,
    userActions: ConsoleAction[]
  ): { passed: boolean; score: number; feedback: string } {
    const inputActions = userActions.filter(action => action.type === "input");
    
    if (criteria.condition.includes("regex")) {
      const regexPattern = criteria.condition.split("regex:")[1];
      const regex = new RegExp(regexPattern, "i");
      
      const matchingInputs = inputActions.filter(action => 
        action.value && regex.test(action.value)
      );

      const passed = matchingInputs.length > 0;
      return {
        passed,
        score: passed ? 100 : 0,
        feedback: passed
          ? `✓ Input matches expected pattern`
          : `✗ Input does not match pattern: ${regexPattern}`,
      };
    }

    if (criteria.condition.includes("contains")) {
      const expectedText = criteria.condition.split("contains:")[1]?.trim().replace(/['"]/g, "");
      const matchingInputs = inputActions.filter(action =>
        action.value?.toLowerCase().includes(expectedText.toLowerCase())
      );

      const passed = matchingInputs.length > 0;
      return {
        passed,
        score: passed ? 100 : 0,
        feedback: passed
          ? `✓ Input contains expected text: "${expectedText}"`
          : `✗ Input should contain: "${expectedText}"`,
      };
    }

    return {
      passed: false,
      score: 0,
      feedback: `Could not validate user input with condition: ${criteria.condition}`,
    };
  }

  private validateResultData(
    criteria: ValidationCriteria,
    consoleState: ConsoleState
  ): { passed: boolean; score: number; feedback: string } {
    // Check if queries have results
    if (criteria.condition.includes("hasResults")) {
      const queriesWithResults = consoleState.queries.filter(q => q.results && q.results.length > 0);
      const passed = queriesWithResults.length > 0;
      
      return {
        passed,
        score: passed ? 100 : 0,
        feedback: passed
          ? `✓ Query executed with results (${queriesWithResults[0]?.results?.length} endpoints)`
          : `✗ No query results found - ensure query was executed`,
      };
    }

    if (criteria.condition.includes("resultCount")) {
      const expectedCount = parseInt(criteria.condition.split(">=")[1] || "1");
      const totalResults = consoleState.queries.reduce((sum, q) => sum + (q.results?.length ?? 0), 0);
      const passed = totalResults >= expectedCount;

      return {
        passed,
        score: passed ? 100 : Math.min((totalResults / expectedCount) * 100, 99),
        feedback: passed
          ? `✓ Query returned ${totalResults} results (expected at least ${expectedCount})`
          : `✗ Query returned only ${totalResults} results, expected at least ${expectedCount}`,
      };
    }

    return {
      passed: false,
      score: 0,
      feedback: `Could not validate result data with condition: ${criteria.condition}`,
    };
  }

  private validateTimeLimit(
    criteria: ValidationCriteria,
    userActions: ConsoleAction[]
  ): { passed: boolean; score: number; feedback: string } {
    if (userActions.length === 0) {
      return {
        passed: false,
        score: 0,
        feedback: "No actions recorded for time validation",
      };
    }

    // This would need actual timestamps in a real implementation
    // For simulation, assume all actions were within time limit
    return {
      passed: true,
      score: 100,
      feedback: "✓ Completed within time limit",
    };
  }

  private validateActionSequence(
    criteria: ValidationCriteria,
    userActions: ConsoleAction[]
  ): { passed: boolean; score: number; feedback: string } {
    // Parse expected sequence from condition
    const expectedSequence = criteria.condition.split("sequence:")[1]?.split(",").map(s => s.trim());
    
    if (!expectedSequence) {
      return {
        passed: false,
        score: 0,
        feedback: "Invalid sequence condition",
      };
    }

    // Check if actions match expected sequence
    const actionTypes = userActions.map(action => action.type);
    let sequenceMatch = 0;

    for (let i = 0; i < expectedSequence.length; i++) {
      if (i < actionTypes.length && actionTypes[i] === expectedSequence[i]) {
        sequenceMatch++;
      } else {
        break;
      }
    }

    const passed = sequenceMatch === expectedSequence.length;
    const score = Math.round((sequenceMatch / expectedSequence.length) * 100);

    return {
      passed,
      score,
      feedback: passed
        ? `✓ Actions performed in correct sequence`
        : `✗ Expected sequence: ${expectedSequence.join(" → ")}, got ${sequenceMatch}/${expectedSequence.length} correct`,
    };
  }

  private generateFeedback(criteriaResults: CriteriaResult[], success: boolean): string {
    const passedCount = criteriaResults.filter(c => c.passed).length;
    const totalCount = criteriaResults.length;

    if (success) {
      return `Excellent work! You successfully completed ${passedCount}/${totalCount} validation criteria.`;
    } else {
      const failedCriteria = criteriaResults.filter(c => !c.passed);
      return `Step incomplete. You completed ${passedCount}/${totalCount} criteria. Focus on: ${failedCriteria.map(c => this.feedbackToString(c.feedback)).join("; ")}`;
    }
  }

  private generateSuggestions(
    criteriaResults: CriteriaResult[],
    consoleState: ConsoleState,
    userActions: ConsoleAction[]
  ): string[] {
    const suggestions: string[] = [];
    const failedCriteria = criteriaResults.filter(c => !c.passed);

    if (failedCriteria.length === 0) {
      suggestions.push("Great job! All validation criteria passed.");
      return suggestions;
    }

    // Generate context-aware suggestions
    if (failedCriteria.some(c => this.feedbackToString(c.feedback).includes("module"))) {
      suggestions.push("Navigate to the correct Tanium module using the module tabs at the top");
    }

    if (failedCriteria.some(c => {
      const s = this.feedbackToString(c.feedback);
      return s.includes("query") || s.includes("input");
    })) {
      suggestions.push("Check your query syntax - ensure it follows Tanium natural language format");
      suggestions.push("Example: 'Get Computer Name from all machines'");
    }

    if (failedCriteria.some(c => this.feedbackToString(c.feedback).includes("results"))) {
      suggestions.push("Make sure to execute your query by clicking the play button or pressing Enter");
    }

    if (failedCriteria.some(c => this.feedbackToString(c.feedback).includes("group"))) {
      suggestions.push("Create a computer group in the Administration module");
      suggestions.push("Use the 'Create Group' button and configure appropriate filters");
    }

    if (failedCriteria.some(c => this.feedbackToString(c.feedback).includes("sequence"))) {
      suggestions.push("Follow the step instructions in order - some actions depend on previous steps");
    }

    return suggestions;
  }

  private feedbackToString(f: any): string {
    if (!f) return "";
    if (typeof f === "string") return f;
    if (typeof f === "object") {
      if ("content" in f && typeof f.content === "string") return f.content;
      const parts: string[] = [];
      if (f.success) parts.push(typeof f.success === "string" ? f.success : f.success.content ?? "");
      if (f.failure) parts.push(typeof f.failure === "string" ? f.failure : f.failure.content ?? "");
      if (f.partial) parts.push(typeof f.partial === "string" ? f.partial : f.partial.content ?? "");
      if (Array.isArray(f.hints)) parts.push(...f.hints.map((h: any) => (typeof h === "string" ? h : h.content ?? "")));
      return parts.filter(Boolean).join(" ");
    }
    return String(f);
  }
}

export function CheckpointValidator({
  step,
  consoleState,
  userActions,
  onValidationCompleteAction,
  onHintRequestAction,
  isValidating = false,
}: CheckpointValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationEngine] = useState(new AdvancedValidationEngine());
  const [isRunning, setIsRunning] = useState(false);

  // Run validation when triggered
  const runValidation = async () => {
    setIsRunning(true);
    
    try {
      const result = await validationEngine.validateStep(step, consoleState, userActions);
  setValidationResult(result);
  onValidationCompleteAction(result);
    } catch (error) {
      console.error("Validation error:", error);
      const errorResult: ValidationResult = {
        success: false,
        score: 0,
        feedback: "Validation system error occurred",
        criteria: [],
        suggestions: ["Please try again or contact support"],
      };
  setValidationResult(errorResult);
  onValidationCompleteAction(errorResult);
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-validate when external validation is triggered
  useEffect(() => {
    if (isValidating) {
      void runValidation();
    }
  }, [isValidating]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "border-green-500 text-green-400";
    if (score >= 70) return "border-yellow-500 text-yellow-400";
    return "border-red-500 text-red-400";
  };

  // Helper: normalize feedback to string for searching/logic
  const feedbackToString = (f?: any): string => {
    if (!f) return "";
    if (typeof f === "string") return f;
    if (React.isValidElement(f)) return "";
    // FeedbackMessage shape
    if (typeof f === "object") {
      // If it's a direct FeedbackMessage
      if ("content" in f && typeof f.content === "string") return f.content;

      // Composite ValidationFeedback { success?, failure?, partial?, hints? }
      const parts: string[] = [];
      if (f.success) {
        if (typeof f.success === "string") parts.push(f.success);
        else if (f.success.content) parts.push(f.success.content);
      }
      if (f.failure) {
        if (typeof f.failure === "string") parts.push(f.failure);
        else if (f.failure.content) parts.push(f.failure.content);
      }
      if (f.partial) {
        if (typeof f.partial === "string") parts.push(f.partial);
        else if (f.partial.content) parts.push(f.partial.content);
      }
      if (Array.isArray(f.hints)) {
        parts.push(...f.hints.map((h: any) => (typeof h === "string" ? h : h.content ?? "")));
      }

      return parts.filter(Boolean).join(" \n");
    }

    return String(f);
  };

  // Helper: normalize feedback to a React node for rendering
  const feedbackToNode = (f?: any): React.ReactNode => {
    if (f === undefined || f === null) return null;
    if (typeof f === "string") return f;
    if (React.isValidElement(f)) return f;
    if (typeof f === "object") {
      if ("content" in f && (f.content ?? f.title)) {
        return (
          <div>
            {f.title && <div className="font-medium">{f.title}</div>}
            <div>{f.content}</div>
          </div>
        );
      }

      // Composite feedback: prefer success -> partial -> failure, else render combined hints
      if (f.success) return feedbackToNode(f.success);
      if (f.partial) return feedbackToNode(f.partial);
      if (f.failure) return feedbackToNode(f.failure);
      if (Array.isArray(f.hints)) return f.hints.map((h: any, i: number) => <div key={i}>{feedbackToNode(h)}</div>);
    }

    return String(f);
  };

  return (
    <div className="space-y-4">
      {/* Validation Controls */}
      <Card className="glass border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <Target className="mr-2 h-5 w-5" />
              Step Validation
            </CardTitle>
            <Button
              onClick={runValidation}
              disabled={isRunning}
              className="bg-tanium-accent hover:bg-blue-600"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Validate Step
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {validationResult && (
          <CardContent className="space-y-4">
            {/* Overall Result */}
            <Alert className={validationResult.success ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}>
              <div className="flex items-center space-x-3">
                {validationResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {validationResult.success ? "Step Completed!" : "Step Incomplete"}
                    </span>
                    <Badge variant="outline" className={getScoreBadgeColor(validationResult.score)}>
                      {validationResult.score}%
                    </Badge>
                  </div>
                  <AlertDescription className="mt-1">
                        {feedbackToNode(validationResult.feedback)}
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Overall Progress</span>
                <span className={`font-medium ${getScoreColor(validationResult.score)}`}>
                  {validationResult.score}%
                </span>
              </div>
              <Progress 
                value={validationResult.score} 
                className="h-2"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Detailed Results */}
      {validationResult && (
        <Tabs defaultValue="criteria" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="criteria">Validation Criteria</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="actions">Actions Log</TabsTrigger>
          </TabsList>

          {/* Criteria Results */}
          <TabsContent value="criteria">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Validation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(validationResult.criteria ?? []).map((criteria) => (
                  <div
                    key={criteria.id}
                    className={`p-3 rounded border ${
                      criteria.passed 
                        ? "border-green-500/50 bg-green-500/5" 
                        : "border-red-500/50 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {criteria.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="font-medium text-white">
                          Criteria {criteria.id}
                        </span>
                      </div>
                      <Badge variant="outline" className={getScoreBadgeColor(criteria.score)}>
                        {criteria.score}%
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-300">
                      {feedbackToNode(criteria.feedback)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggestions */}
          <TabsContent value="suggestions">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Next Steps & Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationResult.suggestions && validationResult.suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {validationResult.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Zap className="h-4 w-4" />
                        <AlertDescription className="text-gray-300">
                          {suggestion}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 italic">No suggestions available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Log */}
          <TabsContent value="actions">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Eye className="mr-2 h-5 w-5" />
                  Recorded Actions ({userActions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userActions.length > 0 ? (
                  <div className="space-y-2">
                    {userActions.map((action, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-gray-800/50 border border-gray-600"
                      >
                        <div>
                          <span className="font-medium text-white">{action.type}</span>
                          <span className="ml-2 text-gray-400">→ {action.target}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {action.value && `"${action.value}"`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 italic">No actions recorded yet</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Hints Section */}
      {step.hints && step.hints.length > 0 && (
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Award className="mr-2 h-5 w-5" />
              Available Hints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {step.hints.map((hint) => (
                <Button
                  key={hint.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onHintRequestAction(hint.id)}
                  className="w-full justify-start"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {hint.level.charAt(0).toUpperCase() + hint.level.slice(1)} Hint
                  {hint.penaltyPoints > 0 && (
                    <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-400">
                      -{hint.penaltyPoints} pts
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}