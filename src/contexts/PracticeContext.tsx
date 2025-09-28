/**
 * Practice Context Bridge (Phase 6.2)
 * Connects PracticeSessionManager with QuestionsContext for targeted practice
 */

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useModules } from "@/contexts/ModuleContext";
import { useQuestions } from "@/contexts/QuestionsContext";
import { useIncorrectAnswers } from "@/contexts/IncorrectAnswersContext";
import {
  PracticeQuestionTargeting,
  createPracticeTargeting,
} from "@/lib/practice-question-targeting";
import { PracticeSessionManager } from "@/lib/practice-session-manager";
import { type PracticeTargeting, type QuestionPool, TCODomain } from "@/types/exam";
import {
  Module3Section,
  MODULE_3_SECTIONS,
  createSectionPracticeTargeting
} from "@/lib/module3-section-definitions";
import {
  getModule3SectionQuestions,
  buildModule3PracticeSession,
  getModule3PracticeRecommendations
} from "@/lib/module3-practice-integration";
import {
  PracticeSessionState,
  type PracticeQuestion,
  type PracticeSession,
  type PracticeSessionConfig,
  type PracticeSessionSummary,
} from "@/types/practice-session";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export interface PracticeContextType {
  [key: string]: any;
  // Session Management
  currentSession: PracticeSession | null;
  sessionState: PracticeSessionState | null;
  sessionManager: PracticeSessionManager | null;

  // Question Management
  currentQuestion: PracticeQuestion | null;
  questionPool: QuestionPool | null;

  // Session Control
  startModulePractice: (
    moduleId: string,
    config?: Partial<PracticeSessionConfig>
  ) => Promise<boolean>;
  startDomainPractice: (
    domain: TCODomain,
    config?: Partial<PracticeSessionConfig>
  ) => Promise<boolean>;
  startCustomPractice: (config: PracticeSessionConfig) => Promise<boolean>;
  startWeightedMultiDomainPractice: (
    domains: TCODomain[],
    config?: Partial<PracticeSessionConfig> & { useWeightedDistribution?: boolean }
  ) => Promise<boolean>;

  // Module 3 Enhanced Session Control
  startModule3SectionPractice: (
    sectionId: Module3Section,
    config?: {
      includePrerequisites?: boolean;
      includeRelatedSections?: boolean;
      adaptiveDifficulty?: boolean;
      focusOnGaps?: boolean;
      questionCount?: number;
    }
  ) => Promise<boolean>;
  startModule3ComprehensivePractice: (
    sections: Module3Section[],
    config?: {
      questionsPerSection?: number;
      randomizeOrder?: boolean;
      focusOnWeakAreas?: boolean;
      timeLimit?: number;
    }
  ) => Promise<boolean>;

  // Question Navigation
  answerCurrentQuestion: (choiceId: string) => boolean;
  nextQuestion: () => PracticeQuestion | null;
  previousQuestion: () => PracticeQuestion | null;
  jumpToQuestion: (index: number) => PracticeQuestion | null;

  // Session Actions
  pauseSession: () => void;
  resumeSession: () => void;
  abandonSession: () => void;
  completeSession: () => PracticeSessionSummary | null;

  // Progress & Stats
  getSessionProgress: () => { current: number; total: number; percentage: number };
  canGoToNext: () => boolean;
  canGoToPrevious: () => boolean;

  // Module 3 Enhanced Analytics
  getModule3SectionProgress: () => Record<Module3Section, {
    questionsAttempted: number;
    questionsCorrect: number;
    accuracy: number;
    timeSpent: number;
    lastAttempted?: Date;
  }>;
  getModule3Recommendations: () => {
    prioritySections: Module3Section[];
    recommendedSessionType: "focused" | "comprehensive" | "review";
    suggestedDuration: number;
  };

  // Utilities
  getQuestionPool: (targeting: PracticeTargeting) => Promise<QuestionPool>;
  validateQuestionAvailability: (moduleId: string) => Promise<{
    available: boolean;
    count: number;
    recommendation?: string;
  }>;
  validateModule3SectionAvailability: (sectionId: Module3Section) => {
    available: boolean;
    questionCount: number;
    coverage: number;
    recommendation?: string;
  };
  isLoading?: boolean;
}

const PracticeContext = createContext<PracticeContextType | null>(null);

// Export context and type for external usage
export { PracticeContext };

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [sessionManager, setSessionManager] = useState<PracticeSessionManager | null>(null);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [questionPool, setQuestionPool] = useState<QuestionPool | null>(null);

  const { questions, getQuestionsWithFilters } = useQuestions();
  const { modules, getLearningFlow, updateLearningFlow } = useModules();
  const { user, loading: authLoading } = useAuth();
  const { getDomainStats, getAnswersByDomain } = useIncorrectAnswers();

  /**
   * Get targeted question pool using practice targeting system
   */
  const getQuestionPool = useCallback(
    async (targeting: PracticeTargeting): Promise<QuestionPool> => {
      return PracticeQuestionTargeting.getTargetedQuestions(questions, targeting);
    },
    [questions]
  );

  /**
   * Start custom practice session with specific configuration
   */
  const startCustomPractice = useCallback(
    async (config: PracticeSessionConfig): Promise<boolean> => {
      if (!user) return false;

      try {
        const filteredQuestions = await getQuestionsWithFilters({
          domains: config.domain ? [config.domain] : undefined,
          difficulties: config.difficulty ? [config.difficulty] : undefined,
          categories: config.category ? [config.category] : undefined,
          tags: config.tags,
          limit: config.questionCount,
        });

        if (filteredQuestions.length < 3) {
          console.error("Not enough questions for custom practice configuration");
          return false;
        }

        const manager = new PracticeSessionManager();
        const session = await manager.startSession(config, user.id, filteredQuestions);

        setSessionManager(manager);
        setCurrentSession(session);
        setCurrentQuestion(manager.getCurrentQuestion());

        return true;
      } catch (error) {
        console.error("Failed to start custom practice:", error);
        return false;
      }
    },
    [user, getQuestionsWithFilters]
  );

  /**
   * Start module-specific practice session
   */
  const startModulePractice = useCallback(
    async (moduleId: string, config?: Partial<PracticeSessionConfig>): Promise<boolean> => {
      if (authLoading) {
        console.error("User must be authenticated to start practice session");
        return false;
      }

      // Find module
      const module = modules.find((m) => m.id === moduleId);
      if (!module) {
        console.error(`Module not found: ${moduleId}`);
        return false;
      }

      try {
        // Create targeting configuration
        const targeting = createPracticeTargeting(
          moduleId,
          module.domain as TCODomain,
          module.objectives.map((obj) => obj.id || obj.description),
          {
            requiredTags: [],
            optionalTags: module.domain ? [`Domain${module.domain.split(" ")[0]}`] : [],
            minQuestions: config?.questionCount
              ? Math.max(5, Math.floor(config.questionCount * 0.5))
              : 5,
            idealQuestions: config?.questionCount || 15,
            fallbackStrategy: "expand-domain",
          }
        );

        // Get targeted questions
        const pool = await getQuestionPool(targeting);

        if (pool.isEmpty || !pool.hasMinimumQuestions) {
          console.warn(`Insufficient questions for module ${moduleId}:`, pool);
          // Try domain fallback
          if (pool.recommendedFallback === "expand-criteria") {
            const domainQuestions = await getQuestionsWithFilters({
              domains: [module.domain as TCODomain],
              limit: config?.questionCount || 15,
            });

            if (domainQuestions.length < 3) {
              console.error("Not enough questions even with domain fallback");
              return false;
            }

            return startCustomPractice({
              moduleId,
              domain: module.domain as TCODomain,
              questionCount: domainQuestions.length,
              passingScore: config?.passingScore || 75,
              timeLimit: config?.timeLimit,
            });
          }
          return false;
        }

        // Create session configuration
        const sessionConfig: PracticeSessionConfig = {
          moduleId,
          domain: module.domain as TCODomain,
          questionCount: Math.min(pool.questions.length, config?.questionCount || 15),
          passingScore: config?.passingScore || 75,
          timeLimit: config?.timeLimit,
          tags: [],
        };

        // Start session
        const manager = new PracticeSessionManager();
        const session = await manager.startSession(sessionConfig, user?.id || 'anonymous', pool.questions);

        setSessionManager(manager);
        setCurrentSession(session);
        setQuestionPool(pool);
        setCurrentQuestion(manager.getCurrentQuestion());

        // Update learning flow if exists
        const flow = await getLearningFlow(moduleId);
        if (flow) {
          // Transition to practice phase
          const updatedFlow = flow.transition("START_PRACTICE" as any);
          await updateLearningFlow(moduleId, updatedFlow as any);
        }

        return true;
      } catch (error) {
        console.error("Failed to start module practice:", error);
        return false;
      }
    },
    [
      user,
      modules,
      getQuestionsWithFilters,
      getLearningFlow,
      updateLearningFlow,
      authLoading,
      getQuestionPool,
      startCustomPractice,
    ]
  );

  /**
   * Start domain-specific practice session
   */
  const startDomainPractice = useCallback(
    async (domain: TCODomain, config?: Partial<PracticeSessionConfig>): Promise<boolean> => {
      if (!user) return false;

      try {
        const domainQuestions = await getQuestionsWithFilters({
          domains: [domain],
          limit: config?.questionCount || 20,
        });

        if (domainQuestions.length < 3) {
          console.error(`Not enough questions for domain: ${domain}`);
          return false;
        }

        const sessionConfig: PracticeSessionConfig = {
          moduleId: `domain-${domain.toLowerCase().replace(/\s+/g, "-")}`,
          domain,
          questionCount: Math.min(domainQuestions.length, config?.questionCount || 20),
          passingScore: config?.passingScore || 75,
          timeLimit: config?.timeLimit,
        };

        const manager = new PracticeSessionManager();
        const session = await manager.startSession(sessionConfig, user.id, domainQuestions);

        setSessionManager(manager);
        setCurrentSession(session);
        setCurrentQuestion(manager.getCurrentQuestion());

        return true;
      } catch (error) {
        console.error("Failed to start domain practice:", error);
        return false;
      }
    },
    [user, getQuestionsWithFilters]
  );

  /**
   * Start weighted multi-domain practice session
   * Distributes questions based on TCO exam weights OR needs-review counts
   * TCO weights: Domain 1 (22%), Domain 2 (23%), Domain 3 (15%), Domain 4 (23%), Domain 5 (17%)
   */
  const startWeightedMultiDomainPractice = useCallback(
    async (
      domains: TCODomain[],
      config?: Partial<PracticeSessionConfig> & {
        useWeightedDistribution?: boolean;
        useNeedsReviewWeighting?: boolean;
      }
    ): Promise<boolean> => {
      if (!user || domains.length === 0) return false;

      try {
        const totalQuestions = config?.questionCount || 30;
        let allQuestions: any[] = [];

        if (config?.useNeedsReviewWeighting) {
          // Weight by needs-review counts (incorrect answers that haven't been reviewed)
          const domainStats = getDomainStats();
          const totalNeedsReview = domains.reduce(
            (sum, domain) => sum + (domainStats[domain]?.count || 0) - (domainStats[domain]?.reviewed || 0),
            0
          );

          if (totalNeedsReview > 0) {
            // Distribute based on needs-review counts with a minimum of 1 question per domain
            for (const domain of domains) {
              const needsReview = (domainStats[domain]?.count || 0) - (domainStats[domain]?.reviewed || 0);
              const weight = needsReview / totalNeedsReview;
              const domainQuestionCount = Math.max(1, Math.round(totalQuestions * weight));

              // Prioritize questions that were previously answered incorrectly
              const incorrectQuestionIds = getAnswersByDomain(domain).map(a => a.questionId);

              const domainQuestions = await getQuestionsWithFilters({
                domains: [domain],
                limit: domainQuestionCount * 2, // Get extra questions to allow filtering
              });

              // Sort questions to prioritize those that were answered incorrectly
              const prioritized = domainQuestions.sort((a: any, b: any) => {
                const aIncorrect = incorrectQuestionIds.includes(a.id);
                const bIncorrect = incorrectQuestionIds.includes(b.id);
                if (aIncorrect && !bIncorrect) return -1;
                if (!aIncorrect && bIncorrect) return 1;
                return 0;
              }).slice(0, domainQuestionCount);

              allQuestions = [...allQuestions, ...prioritized];
            }
          } else {
            // Fall back to TCO weights if no needs-review data
            config.useWeightedDistribution = true;
            config.useNeedsReviewWeighting = false;
          }
        }

        if (config?.useWeightedDistribution !== false && !config?.useNeedsReviewWeighting) {
          // Use TCO exam weights for distribution
          const domainWeights: Record<string, number> = {
            "Asking Questions": 0.22,
            "Refining Questions & Targeting": 0.23,
            "Taking Action": 0.15,
            "Navigation and Basic Module Functions": 0.23,
            "Report Generation and Data Export": 0.17,
          };

          // Calculate questions per domain based on weights
          for (const domain of domains) {
            const weight = domainWeights[domain] || 0.2; // Default to 20% if not found
            const domainQuestionCount = Math.max(1, Math.round(totalQuestions * weight));

            const domainQuestions = await getQuestionsWithFilters({
              domains: [domain],
              limit: domainQuestionCount,
            });

            allQuestions = [...allQuestions, ...domainQuestions];
          }
        } else if (!config?.useNeedsReviewWeighting) {
          // Equal distribution across selected domains
          const questionsPerDomain = Math.max(1, Math.ceil(totalQuestions / domains.length));

          for (const domain of domains) {
            const domainQuestions = await getQuestionsWithFilters({
              domains: [domain],
              limit: questionsPerDomain,
            });

            allQuestions = [...allQuestions, ...domainQuestions];
          }
        }

        // Shuffle questions for variety
        allQuestions = allQuestions.sort(() => Math.random() - 0.5);

        // Limit to requested total
        allQuestions = allQuestions.slice(0, totalQuestions);

        if (allQuestions.length < 5) {
          console.error("Not enough questions for multi-domain practice");
          return false;
        }

        const sessionConfig: PracticeSessionConfig = {
          moduleId: `multi-domain-${domains.join("-").toLowerCase()}`,
          domain: domains[0], // Primary domain for tracking
          questionCount: allQuestions.length,
          passingScore: config?.passingScore || 75,
          timeLimit: config?.timeLimit,
          tags: domains.map(d => `Domain:${d}`),
        };

        const manager = new PracticeSessionManager();
        const session = await manager.startSession(sessionConfig, user.id, allQuestions);

        setSessionManager(manager);
        setCurrentSession(session);
        setCurrentQuestion(manager.getCurrentQuestion());

        return true;
      } catch (error) {
        console.error("Failed to start weighted multi-domain practice:", error);
        return false;
      }
    },
    [user, getQuestionsWithFilters, getDomainStats, getAnswersByDomain]
  );

  /**
   * Validate question availability for a module
   */
  const validateQuestionAvailability = useCallback(
    async (
      moduleId: string
    ): Promise<{
      available: boolean;
      count: number;
      recommendation?: string;
    }> => {
      const module = modules.find((m) => m.id === moduleId);
      if (!module) {
        return { available: false, count: 0, recommendation: "Module not found" };
      }

      const targeting = createPracticeTargeting(
        moduleId,
        module.domain as TCODomain,
        module.objectives.map((obj) => obj.id || obj.description)
      );

      const pool = await getQuestionPool(targeting);

      return {
        available: pool.hasMinimumQuestions,
        count: pool.totalCount,
        recommendation: pool.recommendedFallback
          ? `Consider ${pool.recommendedFallback.replace("-", " ")} for more questions`
          : undefined,
      };
    },
    [modules, getQuestionPool]
  );

  /**
   * Answer current question and update session
   */
  const answerCurrentQuestion = useCallback(
    (choiceId: string): boolean => {
      if (!sessionManager || !currentQuestion) return false;

      const isCorrect = sessionManager.answerQuestion(currentQuestion.id, choiceId);
      setCurrentSession(sessionManager.getCurrentSession());

      return isCorrect;
    },
    [sessionManager, currentQuestion]
  );

  /**
   * Navigate to next question
   */
  const nextQuestion = useCallback((): PracticeQuestion | null => {
    if (!sessionManager) return null;

    const next = sessionManager.nextQuestion();
    setCurrentQuestion(next);
    setCurrentSession(sessionManager.getCurrentSession());

    return next;
  }, [sessionManager]);

  /**
   * Navigate to previous question
   */
  const previousQuestion = useCallback((): PracticeQuestion | null => {
    if (!sessionManager) return null;

    const previous = sessionManager.previousQuestion();
    setCurrentQuestion(previous);

    return previous;
  }, [sessionManager]);

  /**
   * Jump to specific question
   */
  const jumpToQuestion = useCallback(
    (index: number): PracticeQuestion | null => {
      if (!sessionManager) return null;

      const question = sessionManager.jumpToQuestion(index);
      setCurrentQuestion(question);

      return question;
    },
    [sessionManager]
  );

  /**
   * Session control methods
   */
  const pauseSession = useCallback(() => {
    // Implementation for pausing session
    console.log("Session paused");
  }, []);

  const resumeSession = useCallback(() => {
    // Implementation for resuming session
    console.log("Session resumed");
  }, []);

  const abandonSession = useCallback(() => {
    if (sessionManager) {
      sessionManager.abandonSession();
      setSessionManager(null);
      setCurrentSession(null);
      setCurrentQuestion(null);
      setQuestionPool(null);
    }
  }, [sessionManager]);

  const completeSession = useCallback((): PracticeSessionSummary | null => {
    if (!sessionManager) return null;

    const session = sessionManager.getCurrentSession();
    if (!session) return null;

    // Force completion of session
    const summary = {
      sessionId: session.id,
      score: session.score,
      correctCount: session.correctCount,
      totalQuestions: session.totalQuestions,
      timeSpent: session.timeSpent,
      passed: session.passed,
      domainBreakdown: {} as any,
      difficultyBreakdown: {} as any,
      improvementAreas: [],
      strongAreas: [],
    };

    // Clean up
    setSessionManager(null);
    setCurrentSession(null);
    setCurrentQuestion(null);
    setQuestionPool(null);

    return summary;
  }, [sessionManager]);

  /**
   * Get session progress
   */
  const getSessionProgress = useCallback(() => {
    if (!sessionManager) {
      return { current: 0, total: 0, percentage: 0 };
    }
    return sessionManager.getSessionProgress();
  }, [sessionManager]);

  /**
   * Navigation state checks
   */
  const canGoToNext = useCallback(() => {
    return sessionManager ? sessionManager.canGoToNext() : false;
  }, [sessionManager]);

  const canGoToPrevious = useCallback(() => {
    return sessionManager ? sessionManager.canGoToPrevious() : false;
  }, [sessionManager]);

  /**
   * Module3 Session Management
   */
  const startModule3SectionPractice = useCallback(async (
    sectionId: Module3Section,
    config?: {
      includePrerequisites?: boolean;
      includeRelatedSections?: boolean;
      adaptiveDifficulty?: boolean;
      focusOnGaps?: boolean;
      questionCount?: number;
    }
  ): Promise<boolean> => {
    // TODO: Implement Module3 section practice
    console.log("Starting Module3 section practice:", sectionId, config);
    return Promise.resolve(false);
  }, []);

  const startModule3ComprehensivePractice = useCallback(async (
    sections: Module3Section[],
    config?: {
      questionsPerSection?: number;
      randomizeOrder?: boolean;
      focusOnWeakAreas?: boolean;
      timeLimit?: number;
    }
  ): Promise<boolean> => {
    // TODO: Implement Module3 comprehensive practice
    console.log("Starting Module3 comprehensive practice:", sections, config);
    return Promise.resolve(false);
  }, []);

  const getModule3SectionProgress = useCallback(() => {
    // TODO: Implement Module3 progress tracking
    return {} as Record<Module3Section, {
      questionsAttempted: number;
      questionsCorrect: number;
      accuracy: number;
      timeSpent: number;
      lastAttempted?: Date;
    }>;
  }, []);

  const getModule3Recommendations = useCallback(() => {
    // TODO: Implement Module3 recommendations
    return {
      prioritySections: [] as Module3Section[],
      recommendedSessionType: "focused" as const,
      suggestedDuration: 30
    };
  }, []);

  const validateModule3SectionAvailability = useCallback((sectionId: Module3Section) => {
    // TODO: Implement Module3 validation
    const section = MODULE_3_SECTIONS[sectionId];
    return {
      available: true,
      questionCount: section?.currentQuestionCount || 0,
      coverage: section ? Math.floor((section.currentQuestionCount / section.questionTargetCount) * 100) : 0
    };
  }, []);

  /**
   * Get current session state
   */
  const sessionState = sessionManager
    ? sessionManager.getSessionState()
    : PracticeSessionState.NOT_STARTED;

  const value: PracticeContextType = {
    currentSession,
    sessionState,
    sessionManager,
    currentQuestion,
    questionPool,
    startModulePractice,
    startDomainPractice,
    startCustomPractice,
    startWeightedMultiDomainPractice,
    answerCurrentQuestion,
    nextQuestion,
    previousQuestion,
    jumpToQuestion,
    pauseSession,
    resumeSession,
    abandonSession,
    completeSession,
    getSessionProgress,
    canGoToNext,
    canGoToPrevious,
    getQuestionPool,
    validateQuestionAvailability,
    // Module3 functions
    startModule3SectionPractice,
    startModule3ComprehensivePractice,
    getModule3SectionProgress,
    getModule3Recommendations,
    validateModule3SectionAvailability,
  };

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}

export function usePractice() {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error("usePractice must be used within a PracticeProvider");
  }
  return context;
}
