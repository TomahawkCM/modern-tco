import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

const updateSessionStatsMock = vi.fn();

vi.mock("@/contexts/ProgressContext", () => ({
  useProgress: () => ({
    updateSessionStats: updateSessionStatsMock,
    state: { progress: { recentSessions: [] } },
    getDomainStats: () => [],
    setWeeklyGoal: () => {},
    getOverallStats: () => ({
      totalQuestions: 0,
      averageScore: 0,
      studyStreak: 0,
      hoursStudied: 0,
      readinessLevel: "Poor",
    }),
    getWeeklyProgress: () => ({ current: 0, goal: 5, percentage: 0 }),
    resetProgress: () => {},
  }),
}));

vi.mock("@/contexts/ExamContext", () => ({
  useExam: () => ({
    state: {
      isLoading: false,
      currentSession: {
        completed: true,
        score: 72,
        questions: [
          { id: "q1", correctAnswerId: "a" },
          { id: "q2", correctAnswerId: "b" },
        ],
        answers: { q1: "a", q2: "b" },
        startTime: new Date(Date.now() - 90_000),
        endTime: new Date(),
      },
    },
    startExam: vi.fn(),
    answerQuestion: vi.fn(),
    nextQuestion: vi.fn(),
    previousQuestion: vi.fn(),
    finishExam: vi.fn(),
    resetExam: vi.fn(),
    getCurrentQuestion: () => null,
    getProgress: () => ({ current: 2, total: 2, percentage: 100 }),
    getScore: () => 72,
  }),
}));

vi.mock("@/lib/analytics", () => ({
  analytics: { capture: vi.fn(), pageview: vi.fn(), init: () => true },
}));

import MockPage from "@/app/mock/page";

describe("MockPage progress integration", () => {
  it("calls updateSessionStats when a mock session completes", async () => {
    render(<MockPage />);
    await waitFor(() => {
      expect(updateSessionStatsMock).toHaveBeenCalled();
    });
  });
});
