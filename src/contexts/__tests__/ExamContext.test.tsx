/**
 * ExamContext Unit Tests
 *
 * Comprehensive test suite for ExamContext state management
 * Aligned with actual ExamContext API (reducer-based, ExamMode enum, string IDs)
 */

import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ExamProvider, useExam } from "../ExamContext";
import { ExamMode } from "@/types/exam";
import type { Question } from "@/types/exam";

// Mock dependencies
const mockUseAuth = vi.fn();
const mockUseIncorrectAnswers = vi.fn();
const mockUseDatabase = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/contexts/IncorrectAnswersContext", () => ({
  useIncorrectAnswers: () => mockUseIncorrectAnswers(),
}));

vi.mock("@/hooks/useDatabase", () => ({
  useDatabase: (...args: unknown[]) => mockUseDatabase(...args),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

vi.mock("@/lib/examLogic", () => ({
  getAllAvailableQuestions: () => [],
  getDatabaseWeightedQuestions: vi.fn(),
  getMockExamQuestions: vi.fn(),
  getPracticeQuestions: vi.fn(),
}));

// Test data factory
const createMockQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: `q-${Math.random().toString(36).slice(2)}`,
  domain: "Asking Questions" as any,
  question: "What is Tanium?",
  choices: [
    { id: "0", text: "Option A" },
    { id: "1", text: "Option B" },
    { id: "2", text: "Option C" },
    { id: "3", text: "Option D" },
  ],
  correctAnswerId: "0",
  difficulty: "medium" as any,
  category: "conceptual" as any,
  explanation: "Test explanation",
  ...overrides,
});

// Wrapper component for hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ExamProvider>{children}</ExamProvider>
);

describe("ExamContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
    });

    mockUseIncorrectAnswers.mockReturnValue({
      addIncorrectAnswer: vi.fn(),
      clearIncorrectAnswers: vi.fn(),
    });

    mockUseDatabase.mockReturnValue({
      insertExamSession: vi.fn().mockResolvedValue({ id: "db-session-1" }),
      updateExamSession: vi.fn().mockResolvedValue({}),
      insertUserProgress: vi.fn().mockResolvedValue({}),
      getExamSessions: vi.fn().mockResolvedValue([]),
    });
  });

  describe("Initial State", () => {
    it("should provide default exam state", () => {
      const { result } = renderHook(() => useExam(), { wrapper });

      expect(result.current.state.currentSession).toBeNull();
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBeNull();
    });

    it("should provide all required context methods", () => {
      const { result } = renderHook(() => useExam(), { wrapper });

      expect(result.current.startExam).toBeDefined();
      expect(result.current.answerQuestion).toBeDefined();
      expect(result.current.finishExam).toBeDefined();
      expect(result.current.nextQuestion).toBeDefined();
      expect(result.current.previousQuestion).toBeDefined();
      expect(result.current.toggleMarkForReview).toBeDefined();
      expect(result.current.getScore).toBeDefined();
      expect(result.current.resetExam).toBeDefined();
    });
  });

  describe("startExam", () => {
    it("should initialize exam with practice mode", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion(), createMockQuestion()];

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, questions);
      });

      // startExam dispatches START_EXAM after a 500ms setTimeout
      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(result.current.state.currentSession).not.toBeNull();
      expect(result.current.state.currentSession?.mode).toBe(ExamMode.PRACTICE);
      expect(result.current.state.currentSession?.questions).toHaveLength(2);
      expect(result.current.state.currentSession?.currentIndex).toBe(0);
      expect(result.current.state.currentSession?.completed).toBe(false);

      vi.useRealTimers();
    });

    it("should initialize exam with mock mode", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = Array.from({ length: 75 }, (_, i) =>
        createMockQuestion({ id: `q-${i}` })
      );

      await act(async () => {
        result.current.startExam(ExamMode.MOCK, questions);
      });

      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(result.current.state.currentSession?.mode).toBe(ExamMode.MOCK);
      expect(result.current.state.currentSession?.questions).toHaveLength(75);

      vi.useRealTimers();
    });
  });

  describe("answerQuestion", () => {
    it("should record answer for a question", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const q = createMockQuestion({ id: "q1" });

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, [q]);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.answerQuestion("q1", "2");
      });

      expect(result.current.state.currentSession?.answers["q1"]).toBe("2");

      vi.useRealTimers();
    });

    it("should allow changing answer", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const q = createMockQuestion({ id: "q1" });

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, [q]);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.answerQuestion("q1", "1");
      });
      expect(result.current.state.currentSession?.answers["q1"]).toBe("1");

      act(() => {
        result.current.answerQuestion("q1", "3");
      });
      expect(result.current.state.currentSession?.answers["q1"]).toBe("3");

      vi.useRealTimers();
    });

    it("should record answers for multiple questions", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [
        createMockQuestion({ id: "q1" }),
        createMockQuestion({ id: "q2" }),
        createMockQuestion({ id: "q3" }),
      ];

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, questions);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.answerQuestion("q1", "0");
        result.current.answerQuestion("q2", "1");
        result.current.answerQuestion("q3", "2");
      });

      expect(result.current.state.currentSession?.answers).toEqual({
        q1: "0",
        q2: "1",
        q3: "2",
      });

      vi.useRealTimers();
    });
  });

  describe("Navigation", () => {
    it("should navigate to next question", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion(), createMockQuestion()];

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, questions);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(0);

      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(1);

      vi.useRealTimers();
    });

    it("should not navigate past last question", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion()];

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, questions);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(0);

      vi.useRealTimers();
    });

    it("should navigate to previous question", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion(), createMockQuestion()];

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, questions);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.nextQuestion();
      });
      expect(result.current.state.currentSession?.currentIndex).toBe(1);

      act(() => {
        result.current.previousQuestion();
      });
      expect(result.current.state.currentSession?.currentIndex).toBe(0);

      vi.useRealTimers();
    });

    it("should not navigate before first question", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion()];

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, questions);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.previousQuestion();
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(0);

      vi.useRealTimers();
    });
  });

  describe("Mark for Review", () => {
    it("should mark question for review", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const q = createMockQuestion({ id: "q1" });

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, [q]);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.toggleMarkForReview("q1");
      });

      expect(result.current.state.currentSession?.markedForReview).toContain("q1");

      vi.useRealTimers();
    });

    it("should unmark question for review", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const q = createMockQuestion({ id: "q1" });

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, [q]);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.toggleMarkForReview("q1");
      });
      expect(result.current.state.currentSession?.markedForReview).toContain("q1");

      act(() => {
        result.current.toggleMarkForReview("q1");
      });
      expect(result.current.state.currentSession?.markedForReview).not.toContain("q1");

      vi.useRealTimers();
    });
  });

  describe("finishExam", () => {
    it("should finish exam and mark as completed", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [
        createMockQuestion({ id: "q1", correctAnswerId: "0" }),
        createMockQuestion({ id: "q2", correctAnswerId: "1" }),
      ];

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, questions);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.answerQuestion("q1", "0"); // Correct
        result.current.answerQuestion("q2", "2"); // Incorrect
      });

      act(() => {
        result.current.finishExam();
      });

      expect(result.current.state.currentSession?.completed).toBe(true);
      expect(result.current.state.currentSession?.endTime).toBeTruthy();
      expect(result.current.state.currentSession?.score).toBe(50); // 1/2

      vi.useRealTimers();
    });

    it("should calculate correct score", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [
        createMockQuestion({ id: "q1", correctAnswerId: "0" }),
        createMockQuestion({ id: "q2", correctAnswerId: "1" }),
        createMockQuestion({ id: "q3", correctAnswerId: "2" }),
        createMockQuestion({ id: "q4", correctAnswerId: "3" }),
      ];

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, questions);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.answerQuestion("q1", "0"); // Correct
        result.current.answerQuestion("q2", "1"); // Correct
        result.current.answerQuestion("q3", "0"); // Incorrect
        result.current.answerQuestion("q4", "3"); // Correct
      });

      act(() => {
        result.current.finishExam();
      });

      expect(result.current.state.currentSession?.score).toBe(75); // 3/4
      expect(result.current.state.currentSession?.completed).toBe(true);

      vi.useRealTimers();
    });
  });

  describe("resetExam", () => {
    it("should reset exam state", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion()];

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, questions);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(result.current.state.currentSession).not.toBeNull();

      act(() => {
        result.current.resetExam();
      });

      expect(result.current.state.currentSession).toBeNull();

      vi.useRealTimers();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty question list", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, []);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(result.current.state.currentSession?.questions).toHaveLength(0);

      vi.useRealTimers();
    });

    it("should handle rapid state changes", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [
        createMockQuestion({ id: "q1" }),
        createMockQuestion({ id: "q2" }),
      ];

      await act(async () => {
        result.current.startExam(ExamMode.PRACTICE, questions);
      });
      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        result.current.answerQuestion("q1", "0");
        result.current.nextQuestion();
        result.current.answerQuestion("q2", "1");
        result.current.previousQuestion();
        result.current.answerQuestion("q1", "2");
      });

      expect(result.current.state.currentSession?.answers["q1"]).toBe("2");
      expect(result.current.state.currentSession?.answers["q2"]).toBe("1");

      vi.useRealTimers();
    });
  });

  describe("Context Provider Error Handling", () => {
    it("should throw error when useExam is used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useExam());
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });
});
