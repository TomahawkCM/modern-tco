import React from 'react';
import { render, waitFor } from '@testing-library/react';

// Track calls
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
        score: 80,
        questions: [ { id: 'q1', correctAnswerId: 'a' } ],
        answers: { q1: 'a' },
        startTime: new Date(Date.now() - 30_000),
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
    getProgress: () => ({ current: 1, total: 1, percentage: 100 }),
    getScore: () => 80,
  }),
}));

// Silence analytics
jest.mock('@/lib/analytics', () => ({ analytics: { capture: jest.fn(), pageview: jest.fn(), init: () => true } }));

import PracticePage from '@/app/practice/page';

describe('PracticePage progress integration', () => {
  it('calls updateSessionStats when a session completes', async () => {
    render(<PracticePage />);
    await waitFor(() => {
      expect(updateSessionStatsMock).toHaveBeenCalled();
    });
  });
});

