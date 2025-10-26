import React from 'react';
import { render, waitFor } from '@testing-library/react';

const updateSessionStatsMock = jest.fn();

jest.mock('@/contexts/ProgressContext', () => ({
  useProgress: () => ({
    updateSessionStats: updateSessionStatsMock,
    state: { progress: { recentSessions: [] } },
    getDomainStats: () => [],
    setWeeklyGoal: () => {},
    getOverallStats: () => ({ totalQuestions: 0, averageScore: 0, studyStreak: 0, hoursStudied: 0, readinessLevel: 'Poor' }),
    getWeeklyProgress: () => ({ current: 0, goal: 5, percentage: 0 }),
    resetProgress: () => {},
  }),
}));

jest.mock('@/contexts/ExamContext', () => ({
  useExam: () => ({
    state: {
      isLoading: false,
      currentSession: {
        completed: true,
        score: 72,
        questions: [ { id: 'q1', correctAnswerId: 'a' }, { id: 'q2', correctAnswerId: 'b' } ],
        answers: { q1: 'a', q2: 'b' },
        startTime: new Date(Date.now() - 90_000),
        endTime: new Date(),
      },
    },
    startExam: jest.fn(),
    answerQuestion: jest.fn(),
    nextQuestion: jest.fn(),
    previousQuestion: jest.fn(),
    finishExam: jest.fn(),
    resetExam: jest.fn(),
    getCurrentQuestion: () => null,
    getProgress: () => ({ current: 2, total: 2, percentage: 100 }),
    getScore: () => 72,
  }),
}));

jest.mock('@/lib/analytics', () => ({ analytics: { capture: jest.fn(), pageview: jest.fn(), init: () => true } }));

import MockPage from '@/app/mock/page';

describe('MockPage progress integration', () => {
  it('calls updateSessionStats when a mock session completes', async () => {
    render(<MockPage />);
    await waitFor(() => {
      expect(updateSessionStatsMock).toHaveBeenCalled();
    });
  });
});

