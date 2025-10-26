import type {
  ActionHistory,
  ConsoleState,
  CriteriaResult,
  LabStep,
  ValidationCriteria,
  ValidationFeedback,
  ValidationResult,
} from "@/types/lab";

/**
 * Real-Time Validation Service
 *
 * Provides continuous validation of lab exercise steps with immediate feedback,
 * progress tracking, and adaptive assistance based on user performance.
 */

export interface ValidationContext {
  stepId: string;
  userId: string;
  sessionId: string;
  startTime: number;
  consoleState: ConsoleState;
  previousAttempts: number;
  hintsUsed: boolean;
}

export interface RealTimeValidationResult extends ValidationResult {
  confidence: number;
  suggestedActions: string[];
  nextStepRecommendation?: string;
  performanceMetrics: {
    accuracy: number;
    efficiency: number;
    timeSpent: number;
    errorCount: number;
  };
  adaptiveFeedback: AdaptiveFeedback;
  validationTime: number;
}

export interface AdaptiveFeedback {
  level: "beginner" | "intermediate" | "advanced";
  tone: "encouraging" | "instructional" | "corrective";
  content: {
    immediate: string;
    detailed: string;
    nextSteps: string[];
    resources?: string[];
  };
  visualCues: {
    color: "green" | "yellow" | "red";
    icon: string;
    animation?: string;
  };
}

class RealTimeValidationService {
  private validationCache: Map<string, ValidationResult> = new Map();
  private performanceTracking: Map<string, number[]> = new Map();
  private validationTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Continuously validate a lab step in real-time
   */
  async validateStepRealTime(
    step: LabStep,
    context: ValidationContext
  ): Promise<RealTimeValidationResult> {
    const startValidation = Date.now(); // Moved declaration here
    try {
      // Clear previous validation timeout
      this.clearValidationTimeout(context.stepId);

      // Perform comprehensive validation
      const baseResult = await this.performComprehensiveValidation(step, context);

      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(context, baseResult);

      // Generate adaptive feedback
      const adaptiveFeedback = this.generateAdaptiveFeedback(
        baseResult,
        context,
        performanceMetrics
      );

      // Determine confidence and suggestions
      const confidence = this.calculateValidationConfidence(baseResult, context);
      const suggestedActions = this.generateSuggestedActions(
        baseResult,
        context,
        performanceMetrics
      );

      // Create enhanced result
      const enhancedResult: RealTimeValidationResult = {
        ...baseResult,
        confidence,
        suggestedActions,
        nextStepRecommendation: this.determineNextStepRecommendation(baseResult, context),
        performanceMetrics,
        adaptiveFeedback,
        validationTime: Date.now() - startValidation,
      };

      // Cache result for performance
      this.cacheValidationResult(context.stepId, enhancedResult);

      // Track performance history
      this.trackPerformanceHistory(context.userId, performanceMetrics.accuracy);

      // Schedule next validation if step is incomplete
      if (!baseResult.passed) {
        this.scheduleNextValidation(step, context);
      }

      return enhancedResult;
    } catch (error) {
      console.error("Real-time validation failed:", error);

      const feedback: ValidationFeedback = {
        success: { title: "Success", content: "Validation complete", type: "success" },
        failure: {
          title: "Error",
          content: "Validation system temporarily unavailable. Please try again.",
          type: "error",
        },
        partial: { title: "Partial", content: "Partial validation result", type: "warning" },
        hints: [],
      };

      return {
        passed: false,
        score: 0,
        criteriaResults: [],
        feedback,
        confidence: 0,
        suggestedActions: ["Refresh the page and try again"],
        performanceMetrics: {
          accuracy: 0,
          efficiency: 0,
          timeSpent: Date.now() - context.startTime,
          errorCount: 1,
        },
        adaptiveFeedback: {
          level: "beginner",
          tone: "corrective",
          content: {
            immediate: (feedback.failure?.content) || "Validation system error",
            detailed: "Please check your connection or contact support.",
            nextSteps: [],
          },
          visualCues: { color: "red", icon: "XCircle" },
        },
        validationTime: Date.now() - startValidation,
      };
    }
  }

  /**
   * Perform comprehensive step validation
   */
  private async performComprehensiveValidation(
    step: LabStep,
    context: ValidationContext
  ): Promise<ValidationResult> {
    if (!step.validation) {
      const feedback: ValidationFeedback = {
        success: { title: "Success", content: "Step completed successfully", type: "success" },
        failure: { title: "Error", content: "", type: "error" },
        partial: { title: "Partial", content: "", type: "warning" },
        hints: [],
      };

      return {
        passed: true,
        score: 100,
        criteriaResults: [],
        feedback,
      };
    }

    const criteriaResults = await Promise.all(
      step.validation.criteria.map((criterion) => this.validateCriterion(criterion, context))
    );

    const totalWeight = step.validation.criteria.reduce((sum, c) => sum + c.weight, 0);
    const weightedScore = criteriaResults.reduce((sum, result, index) => {
      const criterion = step.validation.criteria[index];
      return sum + (result.score * criterion.weight) / totalWeight;
    }, 0);

    const passed = weightedScore >= step.validation.passingScore;
    const feedback = this.selectFeedback(
      step.validation.feedback,
      weightedScore,
      step.validation.passingScore
    );

    return {
      passed,
      score: Math.round(weightedScore),
      criteriaResults,
      feedback,
    };
  }

  /**
   * Validate individual criterion
   */
  private async validateCriterion(
    criterion: ValidationCriteria,
    context: ValidationContext
  ): Promise<CriteriaResult> {
    let result: { passed: boolean; score: number; details: string };

    switch (criterion.type) {
      case "console-state":
        result = this.validateConsoleState(criterion, context.consoleState);
        break;

      case "user-input":
        result = this.validateUserInput(criterion, context);
        break;

      case "result-data":
        result = this.validateResultData(criterion, context.consoleState);
        break;

      case "action-sequence":
        result = this.validateActionSequence(criterion, context.consoleState);
        break;

      case "time-based":
        result = this.validateTimeBased(criterion, context);
        break;

      default:
        console.warn(`Unknown validation criterion type: ${criterion.type}`);
        result = { passed: false, score: 0, details: "Unknown validation type" };
    }

    return {
      id: criterion.id,
      passed: result.passed,
      score: result.score,
      feedback: result.details, // Using details as feedback for CriteriaResult
      details: result.details,
    };
  }

  /**
   * Validate console state
   */
  private validateConsoleState(
    criterion: ValidationCriteria,
    consoleState: ConsoleState
  ): { passed: boolean; score: number; details: string } {
    const target = consoleState[criterion.target as keyof ConsoleState];

    switch (criterion.condition) {
      case "equals":
        const passed = target === criterion.value;
        return {
          passed,
          score: passed ? 100 : 0,
          details: passed
            ? "Console state matches expected value"
            : `Expected ${criterion.value}, got ${target}`,
        };

      case "contains":
        if (Array.isArray(target)) {
          const containsValue = target.some((item: any) =>
            typeof item === "object"
              ? this.objectContains(item, criterion.value)
              : item === criterion.value
          );
          return {
            passed: containsValue,
            score: containsValue ? 100 : 0,
            details: containsValue ? "Required item found" : "Required item not found",
          };
        }
        return { passed: false, score: 0, details: "Target is not an array" };

      default:
        return { passed: false, score: 0, details: "Unsupported condition" };
    }
  }

  /**
   * Validate user input
   */
  private validateUserInput(
    criterion: ValidationCriteria,
    context: ValidationContext
  ): { passed: boolean; score: number; details: string } {
    // This would validate specific user inputs based on the criterion
    // For now, return a basic implementation
    return {
      passed: true,
      score: 100,
      details: "User input validation passed",
    };
  }

  /**
   * Validate result data
   */
  private validateResultData(
    criterion: ValidationCriteria,
    consoleState: ConsoleState
  ): { passed: boolean; score: number; details: string } {
    // Validate query results, data exports, etc.
    const queries = Array.isArray(consoleState.queries) ? consoleState.queries : [];

    if (criterion.target === "columnCount") {
      const lastQuery = queries[queries.length - 1];
      if (!lastQuery?.results) {
        return { passed: false, score: 0, details: "No query results found" };
      }

      const columnCount = lastQuery.results[0]?.columns?.length || 0; // Access columns from the first QueryResult object
      const passed = columnCount === criterion.value;

      return {
        passed,
        score: passed ? 100 : 0,
        details: passed
          ? "Correct number of columns"
          : `Expected ${criterion.value} columns, got ${columnCount}`,
      };
    }

    return { passed: true, score: 100, details: "Result data validation passed" };
  }

  /**
   * Validate action sequence
   */
  private validateActionSequence(
    criterion: ValidationCriteria,
    consoleState: ConsoleState
  ): { passed: boolean; score: number; details: string } {
    const activityLog = Array.isArray(consoleState.activityLog) ? consoleState.activityLog : [];

    switch (criterion.condition) {
      case "performed":
        const actionFound = activityLog.some((entry: ActionHistory) =>
          entry.action === criterion.target || (typeof entry.details === 'string' && entry.details.includes(criterion.target as string))
        );

        return {
          passed: actionFound,
          score: actionFound ? 100 : 0,
          details: actionFound
            ? "Required action was performed"
            : `Action '${criterion.target}' not found`,
        };

      case "visited_all":
        const requiredModules = criterion.value as string[];
        const visitedModules = activityLog
          .filter((entry: ActionHistory) => entry.action === "module_navigation")
          .map((entry: ActionHistory) => entry.module)
          .filter(Boolean);

        const allVisited = requiredModules.every((module) => visitedModules.includes(module));

        return {
          passed: allVisited,
          score: allVisited ? 100 : (visitedModules.length / requiredModules.length) * 100,
          details: allVisited
            ? "All required modules visited"
            : `Visited ${visitedModules.length}/${requiredModules.length} required modules`,
        };

      default:
        return { passed: true, score: 100, details: "Action sequence validation passed" };
    }
  }

  /**
   * Validate time-based criteria
   */
  private validateTimeBased(
    criterion: ValidationCriteria,
    context: ValidationContext
  ): { passed: boolean; score: number; details: string } {
    const elapsedTime = Date.now() - context.startTime;
    const elapsedMinutes = elapsedTime / (1000 * 60);

    switch (criterion.condition) {
      case "within_time":
        const timeLimit = criterion.value as number; // minutes
        const passed = elapsedMinutes <= timeLimit;

        return {
          passed,
          score: passed ? 100 : Math.max(0, 100 - ((elapsedMinutes - timeLimit) / timeLimit) * 50),
          details: passed
            ? `Completed within ${timeLimit} minutes`
            : `Exceeded time limit by ${(elapsedMinutes - timeLimit).toFixed(1)} minutes`,
        };

      default:
        return { passed: true, score: 100, details: "Time validation passed" };
    }
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(
    context: ValidationContext,
    result: ValidationResult
  ): RealTimeValidationResult["performanceMetrics"] {
    const timeSpent = Date.now() - context.startTime;
    const accuracy = result.score;

    // Calculate efficiency based on time and accuracy
    const efficiency = Math.max(0, 100 - (timeSpent / 1000 / 60 - 5) * 10); // Penalty after 5 minutes

    return {
      accuracy,
      efficiency: Math.min(100, efficiency),
      timeSpent,
      errorCount: context.previousAttempts,
    };
  }

  /**
   * Generate adaptive feedback based on user performance
   */
  private generateAdaptiveFeedback(
    result: ValidationResult,
    context: ValidationContext,
    metrics: RealTimeValidationResult["performanceMetrics"]
  ): AdaptiveFeedback {
    const userHistory = this.performanceTracking.get(context.userId) || [];
    const avgAccuracy =
      userHistory.length > 0 ? userHistory.reduce((a, b) => a + b, 0) / userHistory.length : 70;

    // Determine user level based on history
    let level: AdaptiveFeedback["level"] = "intermediate";
    if (avgAccuracy < 60) level = "beginner";
    else if (avgAccuracy > 85) level = "advanced";

    // Determine tone based on current performance
    let tone: AdaptiveFeedback["tone"] = "instructional";
    if (result.score >= 90) tone = "encouraging";
    else if (result.score < 50) tone = "corrective";

    // Generate content based on level and performance
    const content = this.generateFeedbackContent(result, level, tone, metrics);

    // Visual cues based on performance
    const visualCues = this.generateVisualCues(result.score);

    return {
      level,
      tone,
      content,
      visualCues,
    };
  }

  /**
   * Generate feedback content
   */
  private generateFeedbackContent(
    result: ValidationResult,
    level: AdaptiveFeedback["level"],
    tone: AdaptiveFeedback["tone"],
    metrics: RealTimeValidationResult["performanceMetrics"]
  ): AdaptiveFeedback["content"] {
    const baseContent = result.feedback;

    let immediate =
      this.feedbackMessageContent(baseContent, 'success') ||
      this.feedbackMessageContent(baseContent, 'failure') ||
      this.feedbackMessageContent(baseContent, 'partial');
    let detailed = "";
    let nextSteps: string[] = [];
    let resources: string[] = [];

    if (result.passed) {
      immediate = tone === "encouraging" ? `🎉 Excellent work! ${immediate}` : immediate;

      detailed =
        level === "beginner"
          ? "Great job completing this step! You're building solid foundational skills."
          : level === "advanced"
            ? "Perfect execution. You demonstrated mastery of this concept."
            : "Well done! You're progressing nicely through the material.";

      nextSteps = ["Continue to the next step", "Review your work if needed"];
    } else {
      immediate =
        tone === "corrective" ? `Let's work through this together. ${immediate}` : immediate;

      detailed =
        level === "beginner"
          ? "Don't worry - learning takes practice. Let's break this down into smaller steps."
          : level === "advanced"
            ? "This is a challenging step. Review the requirements carefully."
            : "You're close to the solution. Check your work against the instructions.";

      nextSteps = [
        "Review the step instructions carefully",
        "Check your console state",
        "Try the suggested actions below",
      ];

      if (level === "beginner") {
        resources = [
          "Review the hints for this step",
          "Check the Tanium documentation",
          "Ask for help if you're stuck",
        ];
      }
    }

    return {
      immediate,
      detailed,
      nextSteps,
      resources: resources.length > 0 ? resources : undefined,
    };
  }

  /**
   * Generate visual cues for feedback
   */
  private generateVisualCues(score: number): AdaptiveFeedback["visualCues"] {
    if (score >= 80) {
      return {
        color: "green",
        icon: "CheckCircle",
        animation: "bounce",
      };
    } else if (score >= 50) {
      return {
        color: "yellow",
        icon: "AlertTriangle",
        animation: "pulse",
      };
    } else {
      return {
        color: "red",
        icon: "XCircle",
        animation: "shake",
      };
    }
  }

  /**
   * Calculate validation confidence
   */
  private calculateValidationConfidence(
    result: ValidationResult,
    context: ValidationContext
  ): number {
    let confidence = 100;

    // Reduce confidence based on factors
    if (context.previousAttempts > 0) {
      confidence -= context.previousAttempts * 10;
    }

    if (context.hintsUsed) {
      confidence -= 15;
    }

    // Adjust based on score distribution
    const scores = result.criteriaResults?.map((r: CriteriaResult) => r.score) || [result.score];
    const variance = this.calculateVariance(scores);
    confidence -= variance * 0.5;

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Generate suggested actions
   */
  private generateSuggestedActions(
    result: ValidationResult,
    context: ValidationContext,
    metrics: RealTimeValidationResult["performanceMetrics"]
  ): string[] {
    const suggestions: string[] = [];

    if (!result.passed) {
      // Add specific suggestions based on failed criteria
      result.criteriaResults?.forEach((criterionResult: CriteriaResult, index: number) => {
        if (!criterionResult.passed) {
          suggestions.push(`Check: ${criterionResult.details}`);
        }
      });

      // Add general suggestions
      if (metrics.timeSpent > 300000) {
        // 5 minutes
        suggestions.push("Consider using hints to speed up progress");
      }

      if (context.previousAttempts > 2) {
        suggestions.push("Review the step instructions and try a different approach");
      }

      suggestions.push("Verify your console state matches the requirements");
    } else {
      suggestions.push("Great work! Continue to the next step");

      if (metrics.timeSpent < 60000) {
        // Under 1 minute
        suggestions.push("Excellent speed! Consider helping others or reviewing advanced concepts");
      }
    }

    return suggestions;
  }

  /**
   * Determine next step recommendation
   */
  private determineNextStepRecommendation(
    result: ValidationResult,
    context: ValidationContext
  ): string | undefined {
    if (result.passed) {
      return "Ready for the next step";
    }

    if (context.previousAttempts > 3) {
      return "Consider reviewing the prerequisites for this step";
    }

    return "Continue working on the current step";
  }

  /**
   * Helper methods
   */
  private objectContains(obj: any, target: any): boolean {
    if (typeof target !== "object") return false;

    return Object.keys(target).every(
      (key) =>
        obj[key] !== undefined &&
        (typeof obj[key] === "object"
          ? this.objectContains(obj[key], target[key])
          : obj[key] === target[key])
    );
  }

  private feedbackToObject(feedback: any): { success?: any; failure?: any; partial?: any; hints?: any[] } {
    if (!feedback) return {};
    const t = typeof feedback;
    if (t === 'string' || t === 'number' || t === 'boolean') {
      return { failure: { title: '', content: String(feedback), type: 'error' } };
    }

    if (typeof feedback === 'object') {
      // If it already looks like a feedback object, return as-is
      if ('success' in feedback || 'failure' in feedback || 'partial' in feedback || 'hints' in feedback) {
        return feedback;
      }

      // Unknown object shape - serialize into failure message
      try {
        return { failure: { title: '', content: JSON.stringify(feedback), type: 'error' } };
      } catch (e) {
        return { failure: { title: '', content: String(feedback), type: 'error' } };
      }
    }

    return { failure: { title: '', content: String(feedback), type: 'error' } };
  }

  private feedbackMessageContent(feedback: any, key: 'success' | 'failure' | 'partial'): string {
    const obj = this.feedbackToObject(feedback);
    return (obj?.[key]?.content) || '';
  }

  private selectFeedback(
    feedback: ValidationFeedback,
    score: number,
    passingScore: number
  ): ValidationFeedback {
    const fb = this.feedbackToObject(feedback);

    if (score >= passingScore) {
      return {
        success: fb.success || undefined,
        failure: { ...(fb.failure || {}), content: "" },
        partial: { ...(fb.partial || {}), content: "" },
        hints: fb.hints || [],
      } as ValidationFeedback;
    } else if (score >= passingScore * 0.5) {
      return {
        success: { ...(fb.success || {}), content: "" },
        failure: { ...(fb.failure || {}), content: "" },
        partial: fb.partial || undefined,
        hints: fb.hints || [],
      } as ValidationFeedback;
    } else {
      return {
        success: { ...(fb.success || {}), content: "" },
        failure: fb.failure || undefined,
        partial: { ...(fb.partial || {}), content: "" },
        hints: fb.hints || [],
      } as ValidationFeedback;
    }
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length <= 1) return 0;

    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance =
      numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;

    return Math.sqrt(variance);
  }

  private cacheValidationResult(stepId: string, result: ValidationResult): void {
    this.validationCache.set(stepId, result);

    // Clean old cache entries after 5 minutes
    setTimeout(
      () => {
        this.validationCache.delete(stepId);
      },
      5 * 60 * 1000
    );
  }

  private trackPerformanceHistory(userId: string, accuracy: number): void {
    const history = this.performanceTracking.get(userId) || [];
    history.push(accuracy);

    // Keep only last 20 results
    if (history.length > 20) {
      history.shift();
    }

    this.performanceTracking.set(userId, history);
  }

  private scheduleNextValidation(step: LabStep, context: ValidationContext): void {
    const timeoutId = setTimeout(() => {
      // This would trigger another validation cycle
      console.log(`Scheduled validation for step ${step.id}`);
    }, 30000); // 30 seconds

    this.validationTimeouts.set(context.stepId, timeoutId);
  }

  private clearValidationTimeout(stepId: string): void {
    const timeoutId = this.validationTimeouts.get(stepId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.validationTimeouts.delete(stepId);
    }
  }

  /**
   * Public API methods
   */

  /**
   * Start continuous validation for a step
   */
  async startContinuousValidation(
    step: LabStep,
    context: ValidationContext,
    onUpdate: (result: RealTimeValidationResult) => void
  ): Promise<void> {
    const validationLoop = async () => {
      const result = await this.validateStepRealTime(step, context);
      onUpdate(result);

      if (!result.passed) {
        // Schedule next validation
        setTimeout(validationLoop, 15000); // Every 15 seconds
      }
    };

    await validationLoop();
  }

  /**
   * Stop continuous validation
   */
  stopContinuousValidation(stepId: string): void {
    this.clearValidationTimeout(stepId);
  }

  /**
   * Get cached validation result
   */
  getCachedResult(stepId: string): ValidationResult | undefined {
    return this.validationCache.get(stepId);
  }

  /**
   * Clear all caches and timeouts
   */
  cleanup(): void {
    this.validationCache.clear();
    this.validationTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.validationTimeouts.clear();
  }
}

// Export singleton instance
export const realTimeValidationService = new RealTimeValidationService();
