import {
  type Question,
  type AssessmentResult,
  AssessmentSession,
  type RemediationPlan,
  type AnalyticsEvent,
} from "@/types/assessment";
import { progressService } from "@/lib/services/progress-service";
import { analyticsService } from "@/lib/services/analytics-service";

export interface AssessmentConfig {
  type: "practice" | "mock-exam" | "domain-specific" | "adaptive";
  moduleId?: string;
  domainFilter?: string[];
  questionCount: number;
  timeLimit?: number; // minutes
  userId?: string; // For tracking and analytics
  assessmentId?: string; // For session management
  passingScore: number; // 0.0 to 1.0
  adaptiveDifficulty?: boolean;
  enableAnalytics?: boolean;
}

export interface AssessmentSessionData {
  sessionId: string;
  config: AssessmentConfig;
  questions: Question[];
  responses: Map<string, string[]>;
  startTime: Date;
  endTime?: Date;
  timeSpent: number; // seconds
  currentQuestionIndex: number;
  isCompleted: boolean;
  isPaused: boolean;
}

export interface DetailedAnalytics {
  sessionDuration: number;
  averageTimePerQuestion: number;
  domainPerformance: Record<string, { correct: number; total: number; score: number }>;
  difficultyPerformance: Record<string, { correct: number; total: number; score: number }>;
  confidenceLevels: number[];
  strugglingTopics: string[];
  strongTopics: string[];
  timeDistribution: { questionId: string; timeSpent: number }[];
  responsePatterns: {
    changedAnswers: number;
    skippedQuestions: number;
    flaggedQuestions: number;
  };
}

class AssessmentEngineClass {
  private activeSessions = new Map<string, AssessmentSessionData>();
  private sessionAnalytics = new Map<string, AnalyticsEvent[]>();

  /**
   * Update session partial data by id — keeps compatibility with callers
   */
  async updateSession(sessionId: string, updates: Partial<AssessmentSessionData>): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // shallow merge allowed fields
    Object.assign(session, updates as any);
  }

  /**
   * Initialize a new assessment session
   */
  async initializeSession(config: AssessmentConfig): Promise<AssessmentSessionData> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get questions based on configuration
    const questions = await this.getQuestionsForAssessment(config);

    // Shuffle questions if not adaptive
    if (!config.adaptiveDifficulty) {
      this.shuffleArray(questions);
    }

    const session: AssessmentSessionData = {
      sessionId,
      config,
      questions: questions.slice(0, config.questionCount),
      responses: new Map(),
      startTime: new Date(),
      timeSpent: 0,
      currentQuestionIndex: 0,
      isCompleted: false,
      isPaused: false,
    };

    this.activeSessions.set(sessionId, session);
    this.sessionAnalytics.set(sessionId, []);

    // Track session start
    if (config.enableAnalytics) {
      await this.recordAnalytics(sessionId, {
        type: "session_start",
        timestamp: new Date(),
        data: {
          assessmentType: config.type,
          questionCount: config.questionCount,
          moduleId: config.moduleId,
          domainFilter: config.domainFilter,
        },
      });
    }

    return session;
  }

  /**
   * Record user response to a question
   */
  async recordResponse(
    sessionId: string,
    questionId: string,
    selectedAnswers: string[],
    timeSpent: number,
    confidence?: number
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    session.responses.set(questionId, selectedAnswers);
    session.timeSpent += timeSpent;

    // Record analytics
    if (session.config.enableAnalytics) {
      await this.recordAnalytics(sessionId, {
        type: "question_answered",
        timestamp: new Date(),
        data: {
          questionId,
          selectedAnswers,
          timeSpent,
          confidence,
          questionIndex: session.currentQuestionIndex,
        },
      });
    }

    // Update progress tracking
    await progressService.updateQuestionProgress({
      userId: "current_user", // TODO: Get from auth context
      questionId,
      isCorrect: await this.isResponseCorrect(questionId, selectedAnswers),
      timeSpent,
      confidence,
      sessionId,
    });
  }

  /**
   * Navigate to next question with adaptive difficulty adjustment
   */
  async navigateToNext(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.currentQuestionIndex < session.questions.length - 1) {
      session.currentQuestionIndex++;

      // Adaptive difficulty adjustment
      if (session.config.adaptiveDifficulty) {
        await this.adjustDifficulty(sessionId);
      }

      return true;
    }

    return false; // No more questions
  }

  /**
   * Complete assessment and calculate results
   */
  async completeAssessment(sessionId: string): Promise<AssessmentResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    session.endTime = new Date();
    session.isCompleted = true;

    const result = await this.calculateResults(session);
    const analytics = await this.generateDetailedAnalytics(sessionId);

    // Update progress tracking
    await progressService.updateAssessmentProgress({
      userId: "current_user", // TODO: Get from auth context
      assessmentType: session.config.type,
      moduleId: session.config.moduleId,
      result,
      analytics,
      sessionId,
    });

    // Generate remediation plan
    result.remediationPlan = await this.generateRemediationPlan(result, analytics);

    // Record completion analytics
    if (session.config.enableAnalytics) {
      await this.recordAnalytics(sessionId, {
        type: "assessment_completed",
        timestamp: new Date(),
        data: {
          result,
          analytics,
          sessionDuration: result.timeSpent,
        },
      });
    }

    // Clean up session
    this.activeSessions.delete(sessionId);

    return result;
  }

  /**
   * Calculate assessment results with detailed scoring
   */
  async calculateResults(session: AssessmentSessionData): Promise<AssessmentResult> {
    const { questions, responses, config, startTime, endTime } = session;

    let correctAnswers = 0;
    let totalScore = 0;
    let maxPossibleScore = 0;
    const domainBreakdown: Record<string, { correct: number; total: number; score: number }> = {};
    const questionResults: Array<{
      questionId: string;
      isCorrect: boolean;
      score: number;
      timeSpent: number;
    }> = [];

    for (const question of questions) {
      const userResponse = responses.get(question.id) || [];
      const isCorrect = await this.isResponseCorrect(question.id, userResponse);
      const questionScore = this.calculateQuestionScore(question, isCorrect);
      const timeSpent = this.getQuestionTimeSpent(session.sessionId, question.id);

      if (isCorrect) correctAnswers++;
      totalScore += questionScore;
      maxPossibleScore += question.points || 1;

      // Domain breakdown
      const domain = question.domain || "general";
      if (!domainBreakdown[domain]) {
        domainBreakdown[domain] = { correct: 0, total: 0, score: 0 };
      }
      domainBreakdown[domain].total++;
      if (isCorrect) {
        domainBreakdown[domain].correct++;
        domainBreakdown[domain].score += questionScore;
      }

      questionResults.push({
        questionId: question.id,
        isCorrect,
        score: questionScore,
        timeSpent,
      });
    }

    const overallScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
    const passed = overallScore >= config.passingScore;

    // Build minimal score/performance/remediation objects to satisfy consumers
    const score = {
      correct: correctAnswers,
      total: questions.length,
      percentage: overallScore * 100,
      weightedScore: overallScore * 100,
      domainBreakdown: Object.entries(domainBreakdown).map(([domain, stats]) => ({
        domain,
        correct: stats.correct,
        total: stats.total,
        percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      })),
      objectiveBreakdown: [],
    };

    const performance = {
      totalTime: endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0,
      averageTimePerQuestion: questionResults.length > 0 ? questionResults.reduce((s, q) => s + q.timeSpent, 0) / questionResults.length : 0,
      fastestQuestion: questionResults.length > 0 ? Math.min(...questionResults.map((q) => q.timeSpent)) : 0,
      slowestQuestion: questionResults.length > 0 ? Math.max(...questionResults.map((q) => q.timeSpent)) : 0,
      confidenceAlignment: 0,
      difficultyProgression: { beginnerAccuracy: 0, intermediateAccuracy: 0, advancedAccuracy: 0, suggestedLevel: ("Beginner" as any) },
    };

    const remediation: RemediationPlan = {
      overallRecommendation: passed ? "Passed - continue practicing" : "Review fundamentals",
      objectiveRemediation: [],
      studyPlan: [],
      retakeEligibility: { eligible: !passed, waitPeriod: passed ? 0 : 24, maxAttempts: 3, currentAttempt: 1 },
    };

    return {
      sessionId: session.sessionId,
      assessmentType: config.type,
      moduleId: config.moduleId,
      score,
      performance,
      remediation,
      overallScore,
      correctAnswers,
      incorrectAnswers: questions.length - correctAnswers,
      totalQuestions: questions.length,
      timeSpent: endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0,
      passed,
      domainBreakdown,
      questionResults,
      completedAt: endTime || new Date(),
      passingScore: config.passingScore,
    } as unknown as AssessmentResult;
  }

  /**
   * Generate detailed analytics for performance insights
   */
  async generateDetailedAnalytics(sessionId: string): Promise<DetailedAnalytics> {
    const session =
      this.activeSessions.get(sessionId) || (await this.getCompletedSession(sessionId));
    if (!session) throw new Error("Session not found");

    const events = this.sessionAnalytics.get(sessionId) || [];
    const sessionDuration = session.endTime
      ? (session.endTime.getTime() - session.startTime.getTime()) / 1000
      : session.timeSpent;

    const averageTimePerQuestion = sessionDuration / session.questions.length;

    // Analyze domain performance
    const domainPerformance: Record<string, { correct: number; total: number; score: number }> = {};
    const difficultyPerformance: Record<string, { correct: number; total: number; score: number }> =
      {};
    const timeDistribution: { questionId: string; timeSpent: number }[] = [];
    const confidenceLevels: number[] = [];

    for (const question of session.questions) {
      const userResponse = session.responses.get(question.id) || [];
      const isCorrect = await this.isResponseCorrect(question.id, userResponse);
      const timeSpent = this.getQuestionTimeSpent(sessionId, question.id);
      const confidence = this.getQuestionConfidence(sessionId, question.id);

      // Domain analysis
      const domain = question.domain || "general";
      if (!domainPerformance[domain]) {
        domainPerformance[domain] = { correct: 0, total: 0, score: 0 };
      }
      domainPerformance[domain].total++;
      if (isCorrect) domainPerformance[domain].correct++;

      // Difficulty analysis
      const difficulty = question.difficulty || "medium";
      if (!difficultyPerformance[difficulty]) {
        difficultyPerformance[difficulty] = { correct: 0, total: 0, score: 0 };
      }
      difficultyPerformance[difficulty].total++;
      if (isCorrect) difficultyPerformance[difficulty].correct++;

      timeDistribution.push({ questionId: question.id, timeSpent });
      if (confidence !== null) confidenceLevels.push(confidence);
    }

    // Calculate domain scores
    Object.keys(domainPerformance).forEach((domain) => {
      const perf = domainPerformance[domain];
      perf.score = perf.total > 0 ? perf.correct / perf.total : 0;
    });

    // Calculate difficulty scores
    Object.keys(difficultyPerformance).forEach((difficulty) => {
      const perf = difficultyPerformance[difficulty];
      perf.score = perf.total > 0 ? perf.correct / perf.total : 0;
    });

    // Identify struggling and strong topics
    const strugglingTopics = Object.entries(domainPerformance)
      .filter(([_, perf]) => perf.score < 0.6)
      .map(([domain]) => domain);

    const strongTopics = Object.entries(domainPerformance)
      .filter(([_, perf]) => perf.score >= 0.8)
      .map(([domain]) => domain);

    // Response patterns
    const responsePatterns = {
      changedAnswers: events.filter((e) => e.type === "answer_changed").length,
      skippedQuestions: events.filter((e) => e.type === "question_skipped").length,
      flaggedQuestions: events.filter((e) => e.type === "question_flagged").length,
    };

    return {
      sessionDuration,
      averageTimePerQuestion,
      domainPerformance,
      difficultyPerformance,
      confidenceLevels,
      strugglingTopics,
      strongTopics,
      timeDistribution,
      responsePatterns,
    };
  }

  /**
   * Generate personalized remediation plan
   */
  async generateRemediationPlan(
    result: AssessmentResult,
    analytics: DetailedAnalytics
  ): Promise<RemediationPlan> {
    const domainBreakdownObj = result.domainBreakdown ?? {};
    const weakDomains = Object.entries(domainBreakdownObj)
      .filter(([_, breakdown]) => (breakdown?.score ?? 0) < 0.7)
      .map(([domain]) => domain);

  const studyPlan: RemediationPlan["studyPlan"] = [];

    for (const domain of analytics.strugglingTopics) {
      const domainPerf = domainBreakdownObj[domain];
      if (domainPerf && (domainPerf.score ?? 0) < 0.7) {
        studyPlan.push({
          order: studyPlan.length + 1,
          title: `Study ${domain}`,
          description: `Targeted study plan for ${domain}`,
          type: "review",
          domain: domain as unknown as import("@/types/assessment").StudyPlanItem["domain"],
          priority: (domainPerf.score ?? 0) < 0.5 ? "high" : "medium",
          estimatedTime: Math.ceil((1 - (domainPerf.score ?? 0)) * 120), // minutes
          resources: await this.getStudyResourcesForDomain(domain),
          practiceQuestions: await this.getPracticeQuestionsForDomain(domain, 10),
        });
      }
    }

    // Sort by priority and score
    studyPlan.sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const aKey = a.priority ?? "low";
      const bKey = b.priority ?? "low";
      const aPriority = priorityOrder[aKey] ?? 0;
      const bPriority = priorityOrder[bKey] ?? 0;
      return bPriority - aPriority;
    });

    const estimatedStudyTime = studyPlan.reduce((total, item) => total + (item.estimatedTime || 0), 0);

    const objectiveRemediation: any[] = [];
    const retakeEligibility = { eligible: !result.passed, waitPeriod: result.passed ? 0 : 24, maxAttempts: 3, currentAttempt: 1 };

    const ret: RemediationPlan = {
      overallRecommendation: result.passed
        ? "Continue practicing weaker areas to strengthen your knowledge"
        : "Focus on fundamental concepts before attempting the certification exam",
      objectiveRemediation,
      studyPlan,
      retakeEligibility,
      nextSteps: result.passed
        ? ["Schedule certification exam", "Review flagged questions", "Practice advanced scenarios"]
        : [
            "Complete remediation study plan",
            "Retake practice assessment",
            "Focus on core concepts",
          ],
      estimatedStudyTime,
      targetRetakeDate: this.calculateTargetRetakeDate(analytics.strugglingTopics.length),
    };

    return ret;
  }

  /**
   * Record analytics event
   */
  async recordAnalytics(sessionId: string, event: AnalyticsEvent): Promise<void> {
    const events = this.sessionAnalytics.get(sessionId) || [];
    events.push(event);
    this.sessionAnalytics.set(sessionId, events);

    // Send to analytics service
    await analyticsService.track(event);
  }

  /**
   * Adaptive difficulty adjustment based on performance
   */
  private async adjustDifficulty(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Calculate recent performance (last 3 questions)
    const recentQuestions = session.questions.slice(
      Math.max(0, session.currentQuestionIndex - 3),
      session.currentQuestionIndex
    );

    let recentScore = 0;
    for (const question of recentQuestions) {
      const response = session.responses.get(question.id);
      if (response && (await this.isResponseCorrect(question.id, response))) {
        recentScore++;
      }
    }

    const recentPerformance =
      recentQuestions.length > 0 ? recentScore / recentQuestions.length : 0.5;

    // Adjust difficulty for remaining questions
    if (recentPerformance > 0.8) {
      // Increase difficulty
      await this.increaseDifficulty(sessionId);
    } else if (recentPerformance < 0.4) {
      // Decrease difficulty
      await this.decreaseDifficulty(sessionId);
    }
  }

  private async increaseDifficulty(sessionId: string): Promise<void> {
    // Implementation for increasing question difficulty
    await this.recordAnalytics(sessionId, {
      type: "difficulty_adjusted",
      timestamp: new Date(),
      data: { adjustment: "increased", reason: "high_performance" },
    });
  }

  private async decreaseDifficulty(sessionId: string): Promise<void> {
    // Implementation for decreasing question difficulty
    await this.recordAnalytics(sessionId, {
      type: "difficulty_adjusted",
      timestamp: new Date(),
      data: { adjustment: "decreased", reason: "low_performance" },
    });
  }

  // Helper methods
  private async getQuestionsForAssessment(config: AssessmentConfig): Promise<Question[]> {
    // Implementation to fetch questions based on config
    return [];
  }

  private async isResponseCorrect(questionId: string, response: string[]): Promise<boolean> {
    // Implementation to check if response is correct
    return true;
  }

  private calculateQuestionScore(question: Question, isCorrect: boolean): number {
    if (!isCorrect) return 0;
    return question.points || 1;
  }

  private getQuestionTimeSpent(sessionId: string, questionId: string): number {
    const events = this.sessionAnalytics.get(sessionId) || [];
    const questionEvents = events.filter(
      (e) => e.data?.questionId === questionId && e.type === "question_answered"
    );
    return questionEvents.reduce((total, event) => total + (event.data?.timeSpent || 0), 0);
  }

  private getQuestionConfidence(sessionId: string, questionId: string): number | null {
    const events = this.sessionAnalytics.get(sessionId) || [];
    const questionEvent = events.find(
      (e) => e.data?.questionId === questionId && e.type === "question_answered"
    );
    return questionEvent?.data?.confidence || null;
  }

  private async getStudyResourcesForDomain(domain: string): Promise<string[]> {
    // Implementation to get study resources for domain
    return [`${domain}-study-guide.pdf`, `${domain}-video-tutorial.mp4`];
  }

  private async getPracticeQuestionsForDomain(domain: string, count: number): Promise<string[]> {
    // Implementation to get practice questions for domain
    return Array(count)
      .fill(null)
      .map((_, i) => `${domain}-practice-${i + 1}`);
  }

  private calculateTargetRetakeDate(strugglingTopicsCount: number): Date {
    const daysToAdd = Math.max(7, strugglingTopicsCount * 3); // Minimum 1 week
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    return targetDate;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private async getCompletedSession(sessionId: string): Promise<AssessmentSessionData | null> {
    // Implementation to retrieve completed session from storage
    return null;
  }
}

export const AssessmentEngine: any = new AssessmentEngineClass();
export default AssessmentEngine;

// Static forwarding for existing call-sites that import the class/instance directly
;(AssessmentEngine as any).initializeSession = AssessmentEngine.initializeSession.bind(AssessmentEngine);
;(AssessmentEngine as any).recordResponse = AssessmentEngine.recordResponse?.bind(AssessmentEngine);
;(AssessmentEngine as any).navigateToNext = AssessmentEngine.navigateToNext?.bind(AssessmentEngine);
;(AssessmentEngine as any).completeAssessment = AssessmentEngine.completeAssessment.bind(AssessmentEngine);
;(AssessmentEngine as any).calculateResults = AssessmentEngine.calculateResults.bind(AssessmentEngine);
;(AssessmentEngine as any).updateSession = AssessmentEngine.updateSession.bind(AssessmentEngine);
