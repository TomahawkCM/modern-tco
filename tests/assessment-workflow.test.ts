import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAssessment } from "../src/hooks/useAssessment";
import { AssessmentEngine } from "../src/lib/assessment/assessment-engine";
import { AnalyticsService } from "../src/lib/services/analytics-service";
import { ProgressService } from "../src/lib/services/progress-service";
import type {
  AssessmentConfig,
  AssessmentResult,
  AssessmentSession,
} from "../src/types/assessment";
import { Difficulty, QuestionCategory, TCODomain } from "../src/types/assessment";

// We will spy and stub methods on these modules directly
const mockAssessmentEngine = AssessmentEngine as any;
const mockProgressService = ProgressService as any;
const mockAnalyticsService = AnalyticsService as any;

const mockAssessmentConfig: AssessmentConfig = {
  assessmentId: "test-assessment",
  userId: "test-user",
  moduleId: "test-module",
  assessmentType: "practice",
  timeLimit: 1800, // 30 minutes
  questionCount: 10,
  domainFilter: [TCODomain.ASKING_QUESTIONS], // Use enum
  difficulty: Difficulty.INTERMEDIATE, // Use enum
  adaptiveDifficulty: false,
  showFeedback: true,
  allowReview: true,
  shuffleQuestions: true,
  shuffleAnswers: true,
};

const mockAssessmentSession: AssessmentSession = {
  id: "test-session",
  assessmentId: "test-assessment",
  userId: "test-user",
  moduleId: "test-module",
  type: "practice",
  status: "in_progress",
  startTime: new Date("2024-01-01T10:00:00Z"),
  timeLimit: 1800,
  questions: [
    {
      id: "q1",
      question: "What is the primary purpose of Tanium?", // Renamed 'text' to 'question'
      choices: [
        { id: "a", text: "Network monitoring" },
        { id: "b", text: "Endpoint visibility and control" },
        { id: "c", text: "Web development" },
        { id: "d", text: "Data storage" },
      ],
      correctAnswerId: "b",
      domain: TCODomain.ASKING_QUESTIONS, // Use enum
      difficulty: Difficulty.INTERMEDIATE, // Use enum
      category: QuestionCategory.PLATFORM_FUNDAMENTALS, // Added category
      explanation: "Tanium provides real-time endpoint visibility and control.",
      tags: ["fundamentals", "platform-overview"],
      consoleSteps: [], // Added empty consoleSteps
      context: "", // Added empty context
      createdAt: new Date(), // Added createdAt
      updatedAt: new Date(), // Added updatedAt
    },
    {
      id: "q2",
      question: "Which sensor would you use to get system information?", // Renamed 'text' to 'question'
      choices: [
        { id: "a", text: "Computer Name" },
        { id: "b", text: "System Information" },
        { id: "c", text: "Process List" },
        { id: "d", text: "Network Adapters" },
      ],
      correctAnswerId: "b",
      domain: TCODomain.ASKING_QUESTIONS, // Use enum
      difficulty: Difficulty.INTERMEDIATE, // Use enum
      category: QuestionCategory.CONSOLE_PROCEDURES, // Added category
      explanation: "System Information sensor provides comprehensive system details.",
      tags: ["sensors", "system-info"],
      consoleSteps: [], // Added empty consoleSteps
      context: "", // Added empty context
      createdAt: new Date(), // Added createdAt
      updatedAt: new Date(), // Added updatedAt
    },
  ],
  answers: [],
  currentQuestionIndex: 0,
  score: null,
  passed: null,
  completedAt: null,
};

const mockAssessmentResult: AssessmentResult = {
  sessionId: "test-session",
  userId: "test-user",
  assessmentId: "test-assessment",
  overallScore: 0.85,
  correctAnswers: 8,
  incorrectAnswers: 2,
  totalQuestions: 10,
  timeSpent: 1200, // 20 minutes
  passed: true,
  domainBreakdown: {
    [TCODomain.ASKING_QUESTIONS]: { score: 0.9, total: 5, correct: 5 }, // Renamed questionsAnswered to total
    [TCODomain.REFINING_QUESTIONS]: { score: 0.8, total: 3, correct: 2 }, // Renamed questionsAnswered to total
    [TCODomain.TAKING_ACTION]: { score: 0.75, total: 2, correct: 1 }, // Renamed questionsAnswered to total
  },
  completedAt: new Date("2024-01-01T10:20:00Z"),
  remediation: {
    weakAreas: [TCODomain.TAKING_ACTION], // Use enum
    recommendedStudyTime: 60,
    suggestedResources: [
      {
        type: "video",
        title: "Action Deployment Best Practices",
        url: "/resources/action-deployment",
        estimatedTime: 15,
      },
      {
        type: "practice",
        title: "Action Lab Exercise",
        url: "/labs/action-basics",
        estimatedTime: 45,
      },
    ],
    studyPlan: [
      {
        order: 1,
        title: "Review Action Deployment",
        description: "Review the core concepts of Tanium action deployment.",
        type: "review",
        activities: [
          { type: "review", content: "Action deployment concepts", duration: 30 },
          { type: "practice", content: "Basic action exercises", duration: 30 },
        ],
      },
    ],
    overallRecommendation: "Focus on practical application of action deployment.", // Added missing property
    objectiveRemediation: [], // Added missing property
    retakeEligibility: true, // Added missing property
  },
  score: {
    correct: 8,
    total: 10,
    percentage: 80,
    weightedScore: 80,
    domainBreakdown: [],
    objectiveBreakdown: [],
  },
  performance: {
    totalTime: 1200,
    averageTimePerQuestion: 120,
    fastestQuestion: 45,
    slowestQuestion: 300,
    confidenceAlignment: 0.8,
    difficultyProgression: { beginnerAccuracy: 0.7, intermediateAccuracy: 0.8, advancedAccuracy: 0.85, suggestedLevel:  "Intermediate" as any },
  },
  analytics: {
    averageTimePerQuestion: 120,
    fastestQuestion: 45,
    slowestQuestion: 300,
    difficultyProgression: [0.7, 0.8, 0.85, 0.9],
    confidenceScore: 0.82,
    guessedAnswers: 2,
  },
};

describe("Assessment Workflow Integration Tests", () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    mockAssessmentEngine.initializeSession = vi.fn().mockResolvedValue({
      sessionId: "test-session",
      questions: mockAssessmentSession.questions,
      // Removed metadata as it's not part of AssessmentSessionData
    });

    mockAssessmentEngine.updateSession = vi.fn().mockResolvedValue(undefined);
    mockAssessmentEngine.calculateResults = vi.fn().mockResolvedValue(mockAssessmentResult);

  mockProgressService.updateAssessmentProgress = vi.fn().mockResolvedValue(undefined);
  mockProgressService.updateQuestionProgress = vi.fn().mockResolvedValue(undefined);
  mockProgressService.getUserProgress = vi.fn().mockResolvedValue(null);

  mockAnalyticsService.track = vi.fn().mockResolvedValue(undefined);
  mockAnalyticsService.getUserAnalytics = vi.fn().mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Assessment Lifecycle", () => {
    it("should initialize assessment session correctly", async () => {
      const { result } = renderHook(() => useAssessment());

      await act(async () => {
        await result.current.startAssessment(mockAssessmentConfig);
      });

      expect(mockAssessmentEngine.initializeSession).toHaveBeenCalledWith(
        expect.objectContaining({
          assessmentId: mockAssessmentConfig.assessmentId,
          userId: mockAssessmentConfig.userId,
          moduleId: mockAssessmentConfig.moduleId,
          assessmentType: mockAssessmentConfig.assessmentType,
          domainFilter: mockAssessmentConfig.domainFilter,
          difficulty: mockAssessmentConfig.difficulty,
        })
      );
      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "assessment_started",
          userId: mockAssessmentConfig.userId,
          data: expect.objectContaining({
            assessmentId: mockAssessmentConfig.assessmentId,
            assessmentType: mockAssessmentConfig.assessmentType,
          }),
        })
      );

      expect(result.current.currentSession).toBeTruthy();
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle answer submission correctly", async () => {
      const { result } = renderHook(() => useAssessment());

      // Start assessment first
      await act(async () => {
        await result.current.startAssessment(mockAssessmentConfig);
      });

      const answer = {
        questionId: "q1",
        selectedAnswers: ["b"],
        timeSpent: 120,
        attempts: 1,
        submittedAt: new Date(),
        isCorrect: true,
        confidence: 0.8,
      };

      await act(async () => {
        await result.current.submitAnswer("q1", answer);
      });

      expect(mockAssessmentEngine.updateSession).toHaveBeenCalledWith(
        "test-session",
        expect.objectContaining({
          answers: expect.arrayContaining([expect.objectContaining(answer)]), // Use expect.objectContaining
        })
      );

      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "question_answered",
          userId: mockAssessmentConfig.userId,
          data: expect.objectContaining({
            questionId: "q1",
            selectedAnswers: ["b"], // Changed from 'answer' to 'selectedAnswers'
            timeSpent: 120,
          }),
        })
      );
    });

    it("should complete assessment and calculate results", async () => {
      const { result } = renderHook(() => useAssessment());

      // Start assessment
      await act(async () => {
        await result.current.startAssessment(mockAssessmentConfig);
      });

      // Submit some answers
      await act(async () => {
        await result.current.submitAnswer("q1", {
          questionId: "q1",
          selectedAnswers: ["b"],
          timeSpent: 120,
          attempts: 1,
          submittedAt: new Date(),
          isCorrect: true,
          confidence: 0.8,
        });
      });

      // Submit assessment
      let assessmentResult;
      await act(async () => {
        assessmentResult = await result.current.submitAssessment();
      });

      expect(mockAssessmentEngine.calculateResults).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "test-session",
          answers: expect.any(Array),
          questions: expect.any(Array), // Add questions to the expected object
        })
      );

      expect(mockProgressService.updateAssessmentProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockAssessmentConfig.userId,
          moduleId: mockAssessmentConfig.moduleId,
          assessmentId: mockAssessmentConfig.assessmentId,
          score: mockAssessmentResult.overallScore,
          passed: mockAssessmentResult.passed,
          totalQuestions: mockAssessmentResult.totalQuestions,
          timeSpent: mockAssessmentResult.timeSpent,
          correctAnswers: mockAssessmentResult.correctAnswers,
          incorrectAnswers: mockAssessmentResult.incorrectAnswers,
          domainBreakdown: mockAssessmentResult.domainBreakdown,
          completedAt: mockAssessmentResult.completedAt, // Add completedAt
        })
      );

      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "assessment_completed",
          userId: mockAssessmentConfig.userId,
          data: expect.objectContaining({
            sessionId: "test-session",
            score: mockAssessmentResult.overallScore,
            passed: mockAssessmentResult.passed,
            totalQuestions: mockAssessmentResult.totalQuestions,
            timeSpent: mockAssessmentResult.timeSpent,
            correctAnswers: mockAssessmentResult.correctAnswers,
          }),
        })
      );

      expect(assessmentResult).toEqual(mockAssessmentResult);
      expect(result.current.currentResult).toEqual(mockAssessmentResult);
    });

    it("should handle assessment cancellation", async () => {
      const { result } = renderHook(() => useAssessment());

      // Start assessment
      await act(async () => {
        await result.current.startAssessment(mockAssessmentConfig);
      });

      expect(result.current.currentSession).toBeTruthy();

      // Cancel assessment
      await act(async () => {
        // Change to async act
        result.current.cancelAssessment();
      });

      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "assessment_cancelled",
          userId: mockAssessmentConfig.userId,
          data: expect.objectContaining({
            sessionId: "test-session",
          }),
        })
      );

      expect(result.current.currentSession).toBe(null);
      expect(result.current.currentResult).toBe(null);
    });
  });

  describe("Error Handling", () => {
    it("should handle assessment initialization errors", async () => {
      const { result } = renderHook(() => useAssessment());

      const error = new Error("Failed to initialize assessment");
      mockAssessmentEngine.initializeSession.mockRejectedValue(error);

      await act(async () => {
        await result.current.startAssessment(mockAssessmentConfig);
      });

      expect(result.current.error).toBe("Failed to initialize assessment");
      expect(result.current.currentSession).toBe(null);
    });

    it("should handle answer submission errors", async () => {
      const { result } = renderHook(() => useAssessment());

      // Start assessment first
      await act(async () => {
        await result.current.startAssessment(mockAssessmentConfig);
      });

      const error = new Error("Failed to submit answer");
      mockAssessmentEngine.updateSession.mockRejectedValue(error);

      const answer = {
        questionId: "q1",
        selectedAnswers: ["b"],
        timeSpent: 120,
        attempts: 1,
        submittedAt: new Date(),
        isCorrect: true,
        confidence: 0.8,
      };

      await act(async () => {
        await result.current.submitAnswer("q1", answer);
      });

      expect(result.current.error).toBe("Failed to submit answer");
    });

    it("should handle assessment submission errors", async () => {
      const { result } = renderHook(() => useAssessment());

      // Start assessment
      await act(async () => {
        await result.current.startAssessment(mockAssessmentConfig);
      });

      const error = new Error("Failed to submit assessment");
      mockAssessmentEngine.calculateResults.mockRejectedValue(error);

      await act(async () => {
        try {
          await result.current.submitAssessment();
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe("Failed to submit assessment");
    });
  });

  describe("Progress and Analytics Integration", () => {
    it("should update progress correctly", async () => {
      const { result } = renderHook(() => useAssessment());

      const progress = {
        userId: "test-user",
        questionId: "q1",
        isCorrect: true,
        timeSpent: 120,
        attempts: 1,
        domain: TCODomain.ASKING_QUESTIONS, // Use enum
        difficulty: Difficulty.INTERMEDIATE, // Use enum
        sessionId: mockAssessmentSession.id, // Add sessionId
      };

      await act(async () => {
        await result.current.updateProgress(progress);
      });

      expect(mockProgressService.updateQuestionProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: progress.userId,
          questionId: progress.questionId,
          isCorrect: progress.isCorrect,
          timeSpent: progress.timeSpent,
          attempts: progress.attempts,
          domain: progress.domain,
          difficulty: progress.difficulty,
          sessionId: progress.sessionId,
        })
      );
    });

    it("should track analytics events", async () => {
      const { result } = renderHook(() => useAssessment());

      const event = {
        type: "custom_event" as const,
        userId: "test-user",
        data: { test: "data" },
        timestamp: new Date(),
      };

      await act(async () => {
        await result.current.trackEvent(event);
      });

      expect(mockAnalyticsService.track).toHaveBeenCalledWith(event);
    });

    it("should retrieve user progress", async () => {
      const { result } = renderHook(() => useAssessment());

      const mockProgress = {
        userId: "test-user",
        moduleProgress: { "test-module": 0.75 },
        assessmentScores: { "test-assessment": 0.85 },
        timeSpent: 450,
      };

    mockProgressService.getUserProgress.mockResolvedValue(mockProgress as any);

      let progress;
      await act(async () => {
        progress = await result.current.getProgress("test-user", "test-module");
      });

      expect(mockProgressService.getUserProgress).toHaveBeenCalledWith("test-user", "test-module");
      expect(progress).toEqual(mockProgress);
    });

    it("should retrieve user analytics", async () => {
      const { result } = renderHook(() => useAssessment());

      const mockAnalytics = {
        userId: "test-user",
        totalAssessments: 5,
        averageScore: 0.82,
        timeSpent: 450,
        streakDays: 7,
      };

      mockAnalyticsService.getUserAnalytics.mockResolvedValue(mockAnalytics);

      let analytics;
      await act(async () => {
        analytics = await result.current.getAnalytics("test-user", "30d");
      });

      expect(mockAnalyticsService.getUserAnalytics).toHaveBeenCalledWith("test-user", "30d");
      expect(analytics).toEqual(mockAnalytics);
    });
  });

  describe("Pass Threshold Gating", () => {
    it("should enforce passing thresholds correctly", async () => {
      const { result } = renderHook(() => useAssessment());

      // Mock a failing result
      const failingResult = {
        ...mockAssessmentResult,
        overallScore: 0.65,
        passed: false,
        correctAnswers: 6,
        incorrectAnswers: 4,
      };

      mockAssessmentEngine.calculateResults.mockResolvedValue(failingResult);

      // Start and complete assessment
      await act(async () => {
        await result.current.startAssessment({
          ...mockAssessmentConfig,
          passingScore: 0.7, // 70% required to pass
        });
      });

      let assessmentResult;
      await act(async () => {
        assessmentResult = await result.current.submitAssessment();
      });

  expect((assessmentResult as any)?.passed).toBe(false); // Add optional chaining
  expect((assessmentResult as any)?.overallScore).toBe(0.65); // Add optional chaining

      // Verify that progress service was called with failed status
      expect(mockProgressService.updateAssessmentProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          passed: false,
          score: 0.65,
        })
      );
    });

    it("should provide remediation for failed assessments", async () => {
      const failingResult = {
        ...mockAssessmentResult,
        overallScore: 0.65,
        passed: false,
        remediation: {
          weakAreas: [TCODomain.TAKING_ACTION, TCODomain.REFINING_QUESTIONS], // Use enums
          recommendedStudyTime: 120,
          suggestedResources: [
            {
              type: "video",
              title: "Advanced Targeting Techniques",
              url: "/resources/targeting",
              estimatedTime: 30,
            },
          ],
          studyPlan: [
            {
              order: 1,
              title: "Review Targeting Concepts",
              description: "Focus on refining questions and targeting.",
              type: "review",
              activities: [{ type: "review", content: "Targeting concepts", duration: 60 }],
            },
          ],
          overallRecommendation: "Focus on improving targeting and action deployment skills.", // Add missing property
          objectiveRemediation: [], // Add missing property
          retakeEligibility: true, // Add missing property
        },
      };

      mockAssessmentEngine.calculateResults.mockResolvedValue(failingResult);

      const { result } = renderHook(() => useAssessment());

      await act(async () => {
        await result.current.startAssessment(mockAssessmentConfig);
      });

      let assessmentResult;
      await act(async () => {
        assessmentResult = await result.current.submitAssessment();
      });

  expect((assessmentResult as any)?.remediation?.weakAreas).toEqual([
        TCODomain.TAKING_ACTION,
        TCODomain.REFINING_QUESTIONS,
      ]);
  expect((assessmentResult as any)?.remediation?.recommendedStudyTime).toBe(120);
  expect((assessmentResult as any)?.remediation?.suggestedResources).toBeDefined();
  expect((assessmentResult as any)?.remediation?.studyPlan).toBeDefined();
    });
  });
});

// Using Testing Library's renderHook/act instead of ad-hoc helpers
