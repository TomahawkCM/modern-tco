/**
 * Learn → Practice → Assess Flow State Machine Implementation
 * p5: Core state machine logic with gating rules and telemetry
 */

import {
  LearningFlowState,
  LearningFlowEvent,
  type LearningFlowContext,
  type FlowStateMachine,
  type GatingRules,
  DEFAULT_GATING_RULES,
  STATE_TRANSITIONS,
  type FlowTelemetry,
  type BoundaryNavigationGuard,
  type FlowProgressPersistence,
  type FlowValidation,
  type FlowValidationError,
  LearnPhaseProgress,
  PracticePhaseProgress,
  AssessPhaseProgress,
  LearningFlowMetadata,
} from "@/types/learning-flow";

/**
 * State Machine Implementation
 * Enforces Learn → Practice → Assess progression with safety checks
 */
export class LearningFlowStateMachine implements FlowStateMachine {
  constructor(
    public currentState: LearningFlowState,
    public context: LearningFlowContext,
    private gatingRules: GatingRules = DEFAULT_GATING_RULES,
    private navigationGuard?: BoundaryNavigationGuard,
    private persistence?: FlowProgressPersistence
  ) {}

  /**
   * Check if a state transition is allowed
   */
  canTransition(event: LearningFlowEvent): boolean {
    const allowedEvents = STATE_TRANSITIONS[this.currentState];
    if (!allowedEvents.includes(event)) {
      return false;
    }

    // Additional gating logic based on event
    switch (event) {
      case LearningFlowEvent.COMPLETE_LEARN:
        return this.canProceedToLearn();

      case LearningFlowEvent.START_PRACTICE:
      case LearningFlowEvent.COMPLETE_PRACTICE:
        return this.canProceedToPractice();

      case LearningFlowEvent.START_ASSESS:
      case LearningFlowEvent.COMPLETE_ASSESS:
        return this.canProceedToAssess();

      default:
        return true;
    }
  }

  /**
   * Perform state transition with validation and telemetry
   */
  transition(event: LearningFlowEvent): FlowStateMachine {
    if (!this.canTransition(event)) {
      throw new Error(`Invalid transition: ${event} from state ${this.currentState}`);
    }

    const previousState = this.currentState;
    const newState = this.getNextState(event);
    const timestamp = new Date();

    // Record telemetry
    this.recordEvent(event, {
      previousState,
      newState,
      timestamp: timestamp.toISOString(),
    });

    // Update context
    const updatedContext: LearningFlowContext = {
      ...this.context,
      currentState: newState,
      timeSpent: this.context.timeSpent + this.calculateSessionTime(),
      canProceed: this.evaluateCanProceed(newState),
    };

    // Handle state-specific logic
    switch (event) {
      case LearningFlowEvent.COMPLETE_LEARN:
        updatedContext.metadata.learnProgress.completedAt = timestamp;
        break;

      case LearningFlowEvent.COMPLETE_PRACTICE:
        updatedContext.metadata.practiceProgress.completedAt = timestamp;
        break;

      case LearningFlowEvent.COMPLETE_ASSESS:
        updatedContext.metadata.assessProgress.completedAt = timestamp;
        updatedContext.completedAt = timestamp;
        break;

      case LearningFlowEvent.FAIL_ASSESS:
        updatedContext.metadata.assessProgress.attempts++;
        // Reset to practice if under max attempts
        if (
          updatedContext.metadata.assessProgress.attempts <
          this.gatingRules.assessToComplete.maxAttempts
        ) {
          updatedContext.currentState = LearningFlowState.PRACTICE;
        }
        break;
    }

    return new LearningFlowStateMachine(
      updatedContext.currentState,
      updatedContext,
      this.gatingRules,
      this.navigationGuard,
      this.persistence
    );
  }

  /**
   * Gating Rules Implementation
   */
  canProceedToLearn(): boolean {
    // Learn phase is always accessible - entry point
    return true;
  }

  canProceedToPractice(): boolean {
    const { learnProgress } = this.context.metadata;
    const rules = this.gatingRules.learnTopractice;

    // Check minimum sections viewed
    if (learnProgress.sectionsViewed.length < rules.minSectionsViewed) {
      return false;
    }

    // Check minimum time spent
    if (learnProgress.timeSpent < rules.minTimeSpent) {
      return false;
    }

    // Check all checkpoints passed if required
    if (rules.requireAllCheckpoints && learnProgress.totalSections > 0) {
      const requiredCheckpoints = learnProgress.totalSections;
      return learnProgress.checkpointsPassed.length >= requiredCheckpoints;
    }

    return true;
  }

  canProceedToAssess(): boolean {
    const { practiceProgress } = this.context.metadata;
    const rules = this.gatingRules.practiceToAssess;

    // Check minimum questions attempted
    if (practiceProgress.questionsAttempted < rules.minQuestionsAttempted) {
      return false;
    }

    // Check minimum accuracy
    const accuracy =
      practiceProgress.questionsAttempted > 0
        ? practiceProgress.questionsCorrect / practiceProgress.questionsAttempted
        : 0;
    if (accuracy < rules.minAccuracy) {
      return false;
    }

    // Check minimum time spent
    if (practiceProgress.timeSpent < rules.minTimeSpent) {
      return false;
    }

    // Check required topics if specified
    if (rules.requiredTopics.length > 0) {
      const masteredTopics = practiceProgress.topics
        .filter((topic) => topic.masteryLevel === "proficient" || topic.masteryLevel === "advanced")
        .map((topic) => topic.topicId);

      return rules.requiredTopics.every((required) => masteredTopics.includes(required));
    }

    return true;
  }

  /**
   * Resume Functionality
   */
  async save(): Promise<void> {
    if (this.persistence) {
      await this.persistence.save(this.context);
    }
  }

  async resume(): Promise<FlowStateMachine> {
    if (this.persistence) {
      const savedContext = await this.persistence.load(this.context.moduleId, this.context.userId);
      if (savedContext) {
        this.recordEvent(LearningFlowEvent.RESUME_FLOW, {
          resumedAt: new Date().toISOString(),
          previousState: savedContext.currentState,
        });

        return new LearningFlowStateMachine(
          savedContext.currentState,
          savedContext,
          this.gatingRules,
          this.navigationGuard,
          this.persistence
        );
      }
    }
    return this;
  }

  /**
   * Telemetry Recording
   */
  recordEvent(event: LearningFlowEvent, metadata?: Record<string, any>): void {
    const telemetryEntry: FlowTelemetry = {
      event,
      timestamp: new Date(),
      state: this.currentState,
      metadata,
      duration: this.calculateSessionTime(),
    };

    this.context.metadata.telemetry.push(telemetryEntry);
  }

  /**
   * Private Helper Methods
   */
  private getNextState(event: LearningFlowEvent): LearningFlowState {
    switch (event) {
      case LearningFlowEvent.START_LEARN:
      case LearningFlowEvent.COMPLETE_LEARN:
        return event === LearningFlowEvent.COMPLETE_LEARN && this.canProceedToPractice()
          ? LearningFlowState.PRACTICE
          : LearningFlowState.LEARN;

      case LearningFlowEvent.START_PRACTICE:
      case LearningFlowEvent.COMPLETE_PRACTICE:
        return event === LearningFlowEvent.COMPLETE_PRACTICE && this.canProceedToAssess()
          ? LearningFlowState.ASSESS
          : LearningFlowState.PRACTICE;

      case LearningFlowEvent.START_ASSESS:
      case LearningFlowEvent.COMPLETE_ASSESS:
        return event === LearningFlowEvent.COMPLETE_ASSESS
          ? LearningFlowState.COMPLETED
          : LearningFlowState.ASSESS;

      case LearningFlowEvent.FAIL_ASSESS:
        // Return to practice unless max attempts exceeded
        return this.context.metadata.assessProgress.attempts <
          this.gatingRules.assessToComplete.maxAttempts
          ? LearningFlowState.PRACTICE
          : LearningFlowState.LEARN; // Restart from beginning

      case LearningFlowEvent.RESET_FLOW:
        return LearningFlowState.LEARN;

      case LearningFlowEvent.RESUME_FLOW:
        return this.currentState; // Stay in current state

      default:
        return this.currentState;
    }
  }

  private evaluateCanProceed(state: LearningFlowState): boolean {
    switch (state) {
      case LearningFlowState.LEARN:
        return true; // Can always start learning
      case LearningFlowState.PRACTICE:
        return this.canProceedToPractice();
      case LearningFlowState.ASSESS:
        return this.canProceedToAssess();
      case LearningFlowState.COMPLETED:
        return true; // Already completed
      default:
        return false;
    }
  }

  private calculateSessionTime(): number {
    // Simple session time calculation - can be enhanced with more sophisticated tracking
    return Date.now() - this.context.startedAt.getTime();
  }
}

/**
 * Boundary Navigation Guard Implementation
 * Prevents unsafe navigation between flow states
 */
export class DefaultBoundaryNavigationGuard implements BoundaryNavigationGuard {
  allowNavigation(
    currentState: LearningFlowState,
    targetState: LearningFlowState,
    context: LearningFlowContext
  ): boolean {
    // Allow backward navigation with warnings
    if (this.isBackwardNavigation(currentState, targetState)) {
      return true;
    }

    // Allow forward navigation only if gating rules are met
    const machine = new LearningFlowStateMachine(currentState, context);
    // Use public gating checks instead of private evaluateCanProceed
    switch (targetState) {
      case LearningFlowState.LEARN:
        return machine.canProceedToLearn();
      case LearningFlowState.PRACTICE:
        return machine.canProceedToPractice();
      case LearningFlowState.ASSESS:
        return machine.canProceedToAssess();
      case LearningFlowState.COMPLETED:
        return true;
      default:
        return false;
    }
  }

  getNavigationWarning(
    currentState: LearningFlowState,
    targetState: LearningFlowState
  ): string | null {
    if (this.isBackwardNavigation(currentState, targetState)) {
      return "Going back will reset your current progress. Are you sure?";
    }

    return null;
  }

  canForceNavigation(userId: string): boolean {
    // Implement admin/instructor override logic here
    return false;
  }

  private isBackwardNavigation(current: LearningFlowState, target: LearningFlowState): boolean {
    const stateOrder = [
      LearningFlowState.LEARN,
      LearningFlowState.PRACTICE,
      LearningFlowState.ASSESS,
      LearningFlowState.COMPLETED,
    ];

    const currentIndex = stateOrder.indexOf(current);
    const targetIndex = stateOrder.indexOf(target);

    return currentIndex > targetIndex;
  }
}

/**
 * Flow State Factory
 * Creates new learning flow instances with default configuration
 */
export class LearningFlowFactory {
  static createNewFlow(
    moduleId: string,
    userId: string,
    customGatingRules?: Partial<GatingRules>
  ): LearningFlowStateMachine {
    const gatingRules = customGatingRules
      ? { ...DEFAULT_GATING_RULES, ...customGatingRules }
      : DEFAULT_GATING_RULES;

    const context: LearningFlowContext = {
      moduleId,
      userId,
      currentState: LearningFlowState.LEARN,
      startedAt: new Date(),
      timeSpent: 0,
      attempts: 0,
      canProceed: true,
      metadata: {
        learnProgress: {
          sectionsViewed: [],
          totalSections: 0,
          timeSpent: 0,
          checkpointsPassed: [],
          keyPointsReviewed: [],
        },
        practiceProgress: {
          questionsAttempted: 0,
          questionsCorrect: 0,
          timeSpent: 0,
          topics: [],
          hintsUsed: 0,
        },
        assessProgress: {
          attempts: 0,
          bestScore: 0,
          lastScore: 0,
          timeSpent: 0,
          passed: false,
        },
        telemetry: [],
      },
    };

    const navigationGuard = new DefaultBoundaryNavigationGuard();

    return new LearningFlowStateMachine(
      LearningFlowState.LEARN,
      context,
      gatingRules,
      navigationGuard
    );
  }

  static validateFlowContext(context: LearningFlowContext): FlowValidation {
    const errors: FlowValidationError[] = [];
    const warnings: FlowValidationError[] = [];

    // Validate required fields
    if (!context.moduleId) {
      errors.push({
        code: "MISSING_MODULE_ID",
        message: "Module ID is required",
        severity: "error",
        field: "moduleId",
      });
    }

    if (!context.userId) {
      errors.push({
        code: "MISSING_USER_ID",
        message: "User ID is required",
        severity: "error",
        field: "userId",
      });
    }

    // Validate state
    if (!Object.values(LearningFlowState).includes(context.currentState)) {
      errors.push({
        code: "INVALID_STATE",
        message: "Invalid learning flow state",
        severity: "error",
        field: "currentState",
      });
    }

    // Validate timestamps
    if (context.completedAt && context.completedAt < context.startedAt) {
      errors.push({
        code: "INVALID_TIMESTAMPS",
        message: "Completed date cannot be before start date",
        severity: "error",
        field: "completedAt",
      });
    }

    // Check for potential issues
    if (context.timeSpent < 0) {
      warnings.push({
        code: "NEGATIVE_TIME",
        message: "Time spent cannot be negative",
        severity: "warning",
        field: "timeSpent",
      });
    }

    if (context.attempts > 10) {
      warnings.push({
        code: "HIGH_ATTEMPTS",
        message: "High number of attempts detected",
        severity: "warning",
        field: "attempts",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export default {
  LearningFlowStateMachine,
  DefaultBoundaryNavigationGuard,
  LearningFlowFactory,
};
