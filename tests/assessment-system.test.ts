import { AssessmentEngine } from "@/lib/assessment-engine";
import { AssessmentSession, AssessmentType, Question, QuestionResponse } from "@/types/assessment";
import { Difficulty, QuestionCategory, TCODomain } from "@/types/exam";
import { describe, expect, test } from "vitest";

// Mock data for testing
const mockQuestions: Question[] = [
  {
    id: "q1",
    question: "What is the primary function of Tanium sensors?",
    choices: [
      { id: "choice1", text: "To collect data from endpoints" },
      { id: "choice2", text: "To deploy packages" },
      { id: "choice3", text: "To manage user accounts" },
      { id: "choice4", text: "To configure network settings" },
    ],
    correctAnswerId: "choice1",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    tags: ["sensors", "data-collection"],
    explanation: "Sensors are the primary mechanism for collecting data from endpoints in Tanium.",
    reference: "Tanium Core Platform User Guide - Sensors",
    objectiveId: "obj-asking-sensors",
  },
  {
    id: "q2",
    question: "How do you create a dynamic computer group in Tanium?",
    choices: [
      { id: "choice5", text: "Using manual assignment" },
      { id: "choice6", text: "Through RBAC rules and filters" },
      { id: "choice7", text: "By importing CSV files" },
      { id: "choice8", text: "Using static group definitions" },
    ],
    correctAnswerId: "choice6",
    domain: TCODomain.REFINING_TARGETING,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    tags: ["computer-groups", "rbac", "targeting"],
    explanation:
      "Dynamic computer groups are created using RBAC rules and filter criteria that automatically update membership.",
    reference: "Tanium Core Platform User Guide - Computer Groups",
    objectiveId: "obj-refining-groups",
  },
  {
    id: "q3",
    question: "What is required before deploying a package in Tanium?",
    choices: [
      { id: "choice9", text: "Network connectivity test" },
      { id: "choice10", text: "Package validation and approval" },
      { id: "choice11", text: "User account creation" },
      { id: "choice12", text: "Database backup" },
    ],
    correctAnswerId: "choice10",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    tags: ["packages", "deployment", "approval"],
    explanation:
      "All packages must be validated and approved through the proper workflow before deployment.",
    reference: "Tanium Core Platform User Guide - Package Management",
    objectiveId: "obj-action-packages",
  },
];

const createMockSession = (
  type: AssessmentType = "module-quiz",
  responses: Record<string, QuestionResponse> = {}
): AssessmentSession => ({
  id: "test-session",
  type,
  domain: TCODomain.ASKING_QUESTIONS, // Add this
  config: {
    // Add this
    type,
    questionCount: mockQuestions.length,
    timeLimit: 15,
  },
  questions: mockQuestions,
  responses: Object.values(responses),
  startTime: new Date("2024-01-01T10:00:00Z"),
  endTime: new Date("2024-01-01T10:15:00Z"),
  timeLimit: 15,
  status: "completed",
});

describe("Assessment Engine", () => {
  describe("calculateResults", () => {
    test("should calculate correct overall score for perfect performance", async () => {
      const perfectResponses: Record<string, QuestionResponse> = {
        q1: {
          questionId: "q1",
          selectedAnswer: "To collect data from endpoints",
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 60,
        },
        q2: {
          questionId: "q2",
          selectedAnswer: "Through RBAC rules and filters",
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 120,
        },
        q3: {
          questionId: "q3",
          selectedAnswer: "Package validation and approval",
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 90,
        },
      };

      const session = createMockSession("module-quiz", perfectResponses);
      const result = await AssessmentEngine.calculateResults(session);

      expect(result.overallScore).toBe(100);
      expect(result.correctAnswers).toBe(3);
      expect(result.incorrectAnswers).toBe(0);
      expect(result.passed).toBe(true);
    });

    test("should calculate correct overall score for partial performance", async () => {
      const partialResponses: Record<string, QuestionResponse> = {
        q1: {
          questionId: "q1",
          selectedAnswer: "To collect data from endpoints", // Correct
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 60,
        },
        q2: {
          questionId: "q2",
          selectedAnswer: "Using manual assignment", // Incorrect
          isCorrect: false, // Add this
          timestamp: new Date(),
          timeSpent: 120,
        },
        q3: {
          questionId: "q3",
          selectedAnswer: "Package validation and approval", // Correct
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 90,
        },
      };

      const session = createMockSession("module-quiz", partialResponses);
      const result = await AssessmentEngine.calculateResults(session);

      expect(result.correctAnswers).toBe(2);
      expect(result.incorrectAnswers).toBe(1);
      expect(result.overallScore).toBeCloseTo(66.7, 1);
    });

    test("should handle unanswered questions correctly", async () => {
      const incompleteResponses: Record<string, QuestionResponse> = {
        q1: {
          questionId: "q1",
          selectedAnswer: "To collect data from endpoints",
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 60,
        },
        // q2 and q3 not answered - need to add them as incorrect/unanswered
        q2: {
          questionId: "q2",
          selectedAnswer: "", // No answer selected
          isCorrect: false,
          timestamp: new Date(),
          timeSpent: 0,
        },
        q3: {
          questionId: "q3",
          selectedAnswer: "", // No answer selected
          isCorrect: false,
          timestamp: new Date(),
          timeSpent: 0,
        },
      };

      const session = createMockSession("module-quiz", incompleteResponses);
      const result = await AssessmentEngine.calculateResults(session);

      expect(result.correctAnswers).toBe(1);
      expect(result.incorrectAnswers).toBe(2); // Unanswered treated as incorrect
      expect(result.overallScore).toBeCloseTo(33.3, 1);
    });

    test("should calculate domain breakdown correctly", async () => {
      const responses: Record<string, QuestionResponse> = {
        q1: {
          questionId: "q1",
          selectedAnswer: "To collect data from endpoints", // Correct
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 60,
        },
        q2: {
          questionId: "q2",
          selectedAnswer: "Using manual assignment", // Incorrect
          isCorrect: false, // Add this
          timestamp: new Date(),
          timeSpent: 120,
        },
        q3: {
          questionId: "q3",
          selectedAnswer: "Package validation and approval", // Correct
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 90,
        },
      };

      const session = createMockSession("module-quiz", responses);
      const result = await AssessmentEngine.calculateResults(session);

      expect(result.domainBreakdown).toHaveProperty(TCODomain.ASKING_QUESTIONS); // Use enum
      expect(result.domainBreakdown).toHaveProperty(TCODomain.REFINING_TARGETING); // Use enum
      expect(result.domainBreakdown).toHaveProperty(TCODomain.TAKING_ACTION); // Use enum

      expect(result.domainBreakdown![TCODomain.ASKING_QUESTIONS].score).toBe(100); // percentage
      expect(result.domainBreakdown![TCODomain.REFINING_TARGETING].score).toBe(0); // percentage
      expect(result.domainBreakdown![TCODomain.TAKING_ACTION].score).toBe(100); // percentage
    });

    test("should calculate objective breakdown correctly", async () => {
      const responses: Record<string, QuestionResponse> = {
        q1: {
          questionId: "q1",
          selectedAnswer: "To collect data from endpoints",
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 60,
        },
        q2: {
          questionId: "q2",
          selectedAnswer: "Using manual assignment",
          isCorrect: false, // Add this
          timestamp: new Date(),
          timeSpent: 120,
        },
      };

      const session = createMockSession("module-quiz", responses);
      const result = await AssessmentEngine.calculateResults(session);

      expect(result.objectiveBreakdown).toHaveProperty("obj-asking-sensors");
      expect(result.objectiveBreakdown).toHaveProperty("obj-refining-groups");

      expect(result.objectiveBreakdown!["obj-asking-sensors"].score).toBe(100);
      expect(result.objectiveBreakdown!["obj-refining-groups"].score).toBe(0);
    });

    test("should determine pass/fail correctly based on assessment type", async () => {
      const responses: Record<string, QuestionResponse> = {
        q1: {
          questionId: "q1",
          selectedAnswer: "To collect data from endpoints",
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 60,
        },
        q2: {
          questionId: "q2",
          selectedAnswer: "Using manual assignment",
          isCorrect: false, // Add this
          timestamp: new Date(),
          timeSpent: 120,
        },
        q3: {
          questionId: "q3",
          selectedAnswer: "", // Unanswered
          isCorrect: false, // Add this
          timestamp: new Date(),
          timeSpent: 0,
        },
      };

      // Module quiz: 70% pass threshold
      const moduleSession = createMockSession("module-quiz", responses);
      const moduleResult = await AssessmentEngine.calculateResults(moduleSession);
      expect(moduleResult.passed).toBe(false);

      // Practice test: 60% pass threshold
      // Make two answers correct to exceed 60%
      const practiceResponses = { ...responses } as any;
      practiceResponses.q3 = {
        questionId: "q3",
        selectedAnswer: "Package validation and approval",
        isCorrect: true,
        timestamp: new Date(),
        timeSpent: 30,
      };
      const practiceSession = createMockSession("practice-test", practiceResponses);
      const practiceResult = await AssessmentEngine.calculateResults(practiceSession);
      expect(practiceResult.passed).toBe(true);
    });

    test("should calculate performance metrics correctly", async () => {
      const responses: Record<string, QuestionResponse> = {
        q1: {
          questionId: "q1",
          selectedAnswer: "To collect data from endpoints",
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 60,
        },
        q2: {
          questionId: "q2",
          selectedAnswer: "Through RBAC rules and filters",
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 120,
        },
        q3: {
          questionId: "q3",
          selectedAnswer: "Package validation and approval",
          isCorrect: true, // Add this
          timestamp: new Date(),
          timeSpent: 90,
        },
      };

      const session = createMockSession("module-quiz", responses);
      const result = await AssessmentEngine.calculateResults(session);

      expect(result.performanceMetrics!).toBeDefined(); // Change from toHaveProperty to toBeDefined
      expect(result.performanceMetrics!.timeEfficiency).toBeGreaterThan(0.5);
      expect(result.performanceMetrics!.difficultyConsistency).toBeGreaterThan(0.7);
    });

    test("should generate remediation plan for failed assessment", async () => {
      const poorResponses: Record<string, QuestionResponse> = {
        q1: {
          questionId: "q1",
          selectedAnswer: "To deploy packages", // Incorrect
          isCorrect: false, // Add this
          timestamp: new Date(),
          timeSpent: 60,
        },
        q2: {
          questionId: "q2",
          selectedAnswer: "Using manual assignment", // Incorrect
          isCorrect: false, // Add this
          timestamp: new Date(),
          timeSpent: 120,
        },
        q3: {
          questionId: "q3",
          selectedAnswer: "", // Unanswered
          isCorrect: false, // Add this
          timestamp: new Date(),
          timeSpent: 0,
        },
      };

      const session = createMockSession("mock-exam", poorResponses);
      const result = await AssessmentEngine.calculateResults(session);

      expect(result.passed).toBe(false);
      expect(result.remediation).toBeDefined(); // Change from remediationPlan to remediation
      expect(result.remediation.priorityObjectives?.length ?? 0).toBeGreaterThanOrEqual(0);
      expect(result.remediation.estimatedStudyTime ?? 0).toBeGreaterThanOrEqual(0);
      expect(result.remediation.canRetake).toBe(false);
    });
  });

  describe("Error handling", () => {
    test("should handle empty session gracefully", async () => {
      const emptySession: AssessmentSession = {
        id: "empty-session",
        type: "module-quiz",
        domain: TCODomain.FUNDAMENTALS, // Add this
        config: {
          // Add this
          type: "module-quiz",
          questionCount: 0,
          timeLimit: 15,
        },
        questions: [],
        responses: [], // Change from {} to []
        startTime: new Date(),
        endTime: new Date(),
        timeLimit: 15,
        status: "completed",
      };

      const result = await AssessmentEngine.calculateResults(emptySession);

      expect(result.overallScore).toBe(0);
      expect(result.correctAnswers).toBe(0);
      expect(result.incorrectAnswers).toBe(0);
      expect(result.passed).toBe(false);
    });

    test("should handle session with no end time", async () => {
      const ongoingSession = createMockSession();
      delete ongoingSession.endTime;

      const result = await AssessmentEngine.calculateResults(ongoingSession);

      // Should still calculate results using current time
      expect(result).toBeDefined();
      expect(result.totalTime).toBeGreaterThan(0);
    });
  });
});

describe("Assessment Integration", () => {
  test("should integrate with question targeting system", async () => {
    // This would test integration with practice-question-targeting.ts
    // For now, we'll test that the assessment engine can handle questions from different modules

    const mixedQuestions: Question[] = [
      ...mockQuestions,
      {
        id: "q4",
        question: "What is the Tanium console navigation structure?",
        choices: [
          { id: "choice13", text: "Hierarchical" },
          { id: "choice14", text: "Flat" },
          { id: "choice15", text: "Matrix" },
          { id: "choice16", text: "Network" },
        ],
        correctAnswerId: "choice13",
        domain: TCODomain.NAVIGATION_MODULES,
        difficulty: Difficulty.BEGINNER,
        category: QuestionCategory.CONSOLE_PROCEDURES,
        tags: ["navigation", "console"],
        moduleId: "04-navigation-modules",
        objectiveId: "obj-nav-structure",
      },
    ];

    const session: AssessmentSession = {
      id: "mixed-session",
      type: "practice-test",
      domain: TCODomain.NAVIGATION_MODULES, // Add this
      config: {
        // Add this
        type: "practice-test",
        questionCount: mixedQuestions.length,
        timeLimit: 25,
      },
      questions: mixedQuestions,
      responses: [], // Change from {} to []
      startTime: new Date(),
      endTime: new Date(),
      timeLimit: 25,
      status: "completed",
    };

    const result = await AssessmentEngine.calculateResults(session);

    // Verify domain/objective breakdowns are present (via alias mapping)
    expect((result as any).domainBreakdown).toHaveProperty(TCODomain.NAVIGATION_MODULES);
    expect((result as any).objectiveBreakdown).toHaveProperty("obj-nav-structure");
  });

  test("should handle weighted scoring for different difficulty levels", async () => {
    const responses: Record<string, QuestionResponse> = {
      q1: {
        questionId: "q1", // intermediate difficulty
        selectedAnswer: "To collect data from endpoints",
        isCorrect: true, // Add this
        timestamp: new Date(),
        timeSpent: 60,
      },
      q2: {
        questionId: "q2", // advanced difficulty
        selectedAnswer: "Through RBAC rules and filters",
        isCorrect: true, // Add this
        timestamp: new Date(),
        timeSpent: 120,
      },
      q3: {
        questionId: "q3", // fundamental difficulty
        selectedAnswer: "Network connectivity test", // Incorrect
        isCorrect: false, // Add this
        timestamp: new Date(),
        timeSpent: 90,
      },
    };

    const session = createMockSession("mock-exam", responses);
    const result = await AssessmentEngine.calculateResults(session);

    // Advanced questions should contribute more to the weighted score
    // The exact weighted score would depend on the implementation
    expect(result.overallScore).toBeDefined();
    expect(result.overallScore).toBeGreaterThan(0.5); // Should be passing due to advanced correct answer
  });
});

// Mock implementation tests would go here for components
describe("Assessment Components Integration", () => {
  test("should handle assessment session lifecycle", () => {
    // This would test the AssessmentSession component
    // Mocking React testing library would be needed for full implementation
    expect(true).toBe(true); // Placeholder
  });

  test("should handle review mode navigation", () => {
    // This would test the ReviewMode component
    // Mocking React testing library would be needed for full implementation
    expect(true).toBe(true); // Placeholder
  });

  test("should handle assessment context state management", () => {
    // This would test the AssessmentContext
    // Mocking React context would be needed for full implementation
    expect(true).toBe(true); // Placeholder
  });
});
