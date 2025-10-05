/**
 * ProgressContext Unit Tests
 *
 * Comprehensive test suite for ProgressContext state management
 * Target: 100% coverage for progress tracking workflow
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ProgressProvider, useProgress } from '../ProgressContext';
import { TCODomain } from '@/types/exam';

// Mock dependencies
const mockUseAuth = jest.fn(() => ({ user: null }));
const mockUseDatabase = jest.fn(() => ({
  upsertUserStatistics: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/hooks/useDatabase', () => ({
  useDatabase: () => mockUseDatabase(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Wrapper component for hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProgressProvider>{children}</ProgressProvider>
);

describe('ProgressContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should provide default progress state', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.state.progress).toEqual(
        expect.objectContaining({
          totalQuestions: 0,
          correctAnswers: 0,
          sessionCount: 0,
          studyStreak: 0,
          lastStudyDate: null,
          hoursStudied: 0,
          averageScore: 0,
          examReadiness: 'Poor',
          achievements: [],
          weeklyGoal: 5,
          weeklyProgress: 0,
          reviewStreak: 0,
          lastReviewDate: null,
          longestReviewStreak: 0,
        })
      );
    });

    it('should initialize all TCO domains with zero stats', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      const domains = [
        TCODomain.ASKING_QUESTIONS,
        TCODomain.REFINING_QUESTIONS,
        TCODomain.REFINING_TARGETING,
        TCODomain.TAKING_ACTION,
        TCODomain.NAVIGATION_MODULES,
        TCODomain.REPORTING_EXPORT,
      ];

      domains.forEach((domain) => {
        expect(result.current.state.progress.domainScores[domain]).toEqual({
          score: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          timeSpent: 0,
        });
      });
    });

    it('should provide all required context methods', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.updateSessionStats).toBeDefined();
      expect(result.current.updateReviewStreak).toBeDefined();
      expect(result.current.setWeeklyGoal).toBeDefined();
      expect(result.current.getOverallStats).toBeDefined();
      expect(result.current.getDomainStats).toBeDefined();
      expect(result.current.getWeeklyProgress).toBeDefined();
      expect(result.current.resetProgress).toBeDefined();
    });
  });

  describe('updateSessionStats', () => {
    it('should update overall statistics correctly', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(80, 10, 300); // 80% score, 10 questions, 300 seconds
      });

      const stats = result.current.getOverallStats();
      expect(stats.totalQuestions).toBe(10);
      expect(stats.averageScore).toBe(80);
      expect(stats.hoursStudied).toBeCloseTo(0.08, 1); // 300 seconds ≈ 0.083 hours
    });

    it('should calculate average score across multiple sessions', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(100, 10, 300);
        result.current.updateSessionStats(60, 10, 300);
      });

      const stats = result.current.getOverallStats();
      expect(stats.totalQuestions).toBe(20);
      expect(stats.averageScore).toBe(80); // (100% + 60%) / 2 = 80%
    });

    it('should update domain-specific statistics when domain is provided', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(90, 10, 300, TCODomain.ASKING_QUESTIONS);
      });

      const domainStats = result.current.getDomainStats();
      const askingQuestions = domainStats.find(
        (d) => d.domain === TCODomain.ASKING_QUESTIONS
      );

      expect(askingQuestions).toMatchObject({
        score: 90,
        questionsAnswered: 10,
        correctAnswers: 9,
        timeSpent: 300,
        percentage: 90,
      });
    });

    it('should increment session count', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(80, 10, 300);
        result.current.updateSessionStats(70, 5, 150);
      });

      expect(result.current.state.progress.sessionCount).toBe(2);
    });

    it('should calculate exam readiness based on average score', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      // Test Poor readiness (< 60%)
      act(() => {
        result.current.updateSessionStats(50, 10, 300);
      });
      expect(result.current.state.progress.examReadiness).toBe('Poor');

      // Test Fair readiness (60-74%)
      act(() => {
        result.current.resetProgress();
        result.current.updateSessionStats(70, 10, 300);
      });
      expect(result.current.state.progress.examReadiness).toBe('Fair');

      // Test Good readiness (75-84%)
      act(() => {
        result.current.resetProgress();
        result.current.updateSessionStats(80, 10, 300);
      });
      expect(result.current.state.progress.examReadiness).toBe('Good');

      // Test Excellent readiness (≥ 85%)
      act(() => {
        result.current.resetProgress();
        result.current.updateSessionStats(90, 10, 300);
      });
      expect(result.current.state.progress.examReadiness).toBe('Excellent');
    });

    it('should track recent sessions (max 10)', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.updateSessionStats(80, 5, 100, TCODomain.ASKING_QUESTIONS);
        }
      });

      expect(result.current.state.progress.recentSessions?.length).toBe(10);
    });
  });

  describe('Study Streak Management', () => {
    beforeEach(() => {
      // Mock Date for predictable streak testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-04T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should initialize streak on first session', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(80, 10, 300);
      });

      expect(result.current.state.progress.studyStreak).toBe(1);
      expect(result.current.state.progress.lastStudyDate).toBe('2025-10-04');
    });

    it('should increment streak on consecutive days', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      // Day 1
      act(() => {
        result.current.updateSessionStats(80, 10, 300);
      });

      // Day 2
      act(() => {
        jest.setSystemTime(new Date('2025-10-05T12:00:00Z'));
        result.current.updateSessionStats(80, 10, 300);
      });

      expect(result.current.state.progress.studyStreak).toBe(2);
    });

    it('should reset streak if day is skipped', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      // Day 1
      act(() => {
        result.current.updateSessionStats(80, 10, 300);
      });

      // Day 3 (skipped Day 2)
      act(() => {
        jest.setSystemTime(new Date('2025-10-06T12:00:00Z'));
        result.current.updateSessionStats(80, 10, 300);
      });

      expect(result.current.state.progress.studyStreak).toBe(1);
    });

    it('should maintain streak if multiple sessions on same day', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(80, 10, 300);
        result.current.updateSessionStats(75, 5, 150);
      });

      expect(result.current.state.progress.studyStreak).toBe(1);
    });
  });

  describe('Review Streak Management', () => {
    it('should update review streak', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateReviewStreak(5, 5);
      });

      expect(result.current.state.progress.reviewStreak).toBe(5);
      expect(result.current.state.progress.longestReviewStreak).toBe(5);
    });

    it('should update longest review streak', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateReviewStreak(5, 5);
        result.current.updateReviewStreak(10, 10);
      });

      expect(result.current.state.progress.reviewStreak).toBe(10);
      expect(result.current.state.progress.longestReviewStreak).toBe(10);
    });

    it('should not decrease longest streak when current streak is lower', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateReviewStreak(10, 10);
        result.current.updateReviewStreak(3, 3);
      });

      expect(result.current.state.progress.reviewStreak).toBe(3);
      expect(result.current.state.progress.longestReviewStreak).toBe(10);
    });

    it('should update lastReviewDate when review streak is updated', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      const today = new Date().toISOString().split('T')[0];

      act(() => {
        result.current.updateReviewStreak(1, 1);
      });

      expect(result.current.state.progress.lastReviewDate).toBe(today);
    });
  });

  describe('Achievement System', () => {
    it('should award "Perfect Score" achievement on 100% score', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(100, 10, 300);
      });

      expect(result.current.state.progress.achievements).toContain('Perfect Score');
    });

    it('should award "Week Warrior" achievement on 7-day streak', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        // Manually set streak to 7 by updating multiple days
        jest.useFakeTimers();
        for (let i = 0; i < 7; i++) {
          jest.setSystemTime(new Date(`2025-10-${4 + i}T12:00:00Z`));
          result.current.updateSessionStats(80, 10, 300);
        }
        jest.useRealTimers();
      });

      expect(result.current.state.progress.achievements).toContain('Week Warrior');
    });

    it('should award "Centurion" achievement on 100 questions', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.updateSessionStats(80, 10, 300);
        }
      });

      expect(result.current.state.progress.achievements).toContain('Centurion');
    });

    it('should award review streak achievements', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      // 7-day review streak
      act(() => {
        result.current.updateReviewStreak(7, 7);
      });
      expect(result.current.state.progress.achievements).toContain(
        'Review Warrior - 7 Day Streak'
      );

      // 30-day review streak
      act(() => {
        result.current.updateReviewStreak(30, 30);
      });
      expect(result.current.state.progress.achievements).toContain(
        'Review Master - 30 Day Streak'
      );

      // 100-day review streak
      act(() => {
        result.current.updateReviewStreak(100, 100);
      });
      expect(result.current.state.progress.achievements).toContain(
        'Review Legend - 100 Day Streak'
      );
    });

    it('should not add duplicate achievements', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(100, 10, 300);
        result.current.updateSessionStats(100, 5, 150);
      });

      const perfectScores = result.current.state.progress.achievements.filter(
        (a) => a === 'Perfect Score'
      );
      expect(perfectScores).toHaveLength(1);
    });
  });

  describe('Weekly Goal Management', () => {
    it('should set weekly goal', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.setWeeklyGoal(10);
      });

      const weeklyProgress = result.current.getWeeklyProgress();
      expect(weeklyProgress.goal).toBe(10);
    });

    it('should track weekly progress', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.setWeeklyGoal(5);
        result.current.updateSessionStats(80, 10, 300);
        result.current.updateSessionStats(75, 5, 150);
      });

      const weeklyProgress = result.current.getWeeklyProgress();
      expect(weeklyProgress.current).toBe(2);
      expect(weeklyProgress.percentage).toBe(40); // 2/5 * 100
    });

    it('should calculate percentage correctly for over-goal progress', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.setWeeklyGoal(3);
        for (let i = 0; i < 5; i++) {
          result.current.updateSessionStats(80, 5, 100);
        }
      });

      const weeklyProgress = result.current.getWeeklyProgress();
      expect(weeklyProgress.current).toBe(5);
      expect(weeklyProgress.percentage).toBeGreaterThan(100);
    });
  });

  describe('Statistics Getters', () => {
    it('should return overall stats', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(85, 20, 1200);
      });

      const stats = result.current.getOverallStats();
      expect(stats).toEqual({
        totalQuestions: 20,
        averageScore: 85,
        studyStreak: 1,
        hoursStudied: 0.3, // 1200 seconds = 0.333 hours, rounded to 0.3
        readinessLevel: 'Excellent',
      });
    });

    it('should return domain stats', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(90, 10, 300, TCODomain.ASKING_QUESTIONS);
        result.current.updateSessionStats(80, 15, 450, TCODomain.REFINING_QUESTIONS);
      });

      const domainStats = result.current.getDomainStats();

      const askingQuestions = domainStats.find(
        (d) => d.domain === TCODomain.ASKING_QUESTIONS
      );
      expect(askingQuestions).toMatchObject({
        score: 90,
        questionsAnswered: 10,
        correctAnswers: 9,
        timeSpent: 300,
        percentage: 90,
      });

      const refiningQuestions = domainStats.find(
        (d) => d.domain === TCODomain.REFINING_QUESTIONS
      );
      expect(refiningQuestions).toMatchObject({
        score: 80,
        questionsAnswered: 15,
        correctAnswers: 12,
        timeSpent: 450,
        percentage: 80,
      });
    });

    it('should return weekly progress', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.setWeeklyGoal(10);
        result.current.updateSessionStats(80, 10, 300);
        result.current.updateSessionStats(75, 10, 300);
        result.current.updateSessionStats(90, 10, 300);
      });

      const weeklyProgress = result.current.getWeeklyProgress();
      expect(weeklyProgress).toEqual({
        current: 3,
        goal: 10,
        percentage: 30,
      });
    });
  });

  describe('Progress Persistence', () => {
    it('should save progress to localStorage', async () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(85, 10, 300);
      });

      await waitFor(() => {
        const saved = localStorage.getItem('tco-progress');
        expect(saved).toBeTruthy();
        const progress = JSON.parse(saved!);
        expect(progress.totalQuestions).toBe(10);
        expect(progress.averageScore).toBe(85);
      });
    });

    it('should load progress from localStorage on mount', () => {
      const mockProgress = {
        totalQuestions: 50,
        correctAnswers: 40,
        sessionCount: 5,
        studyStreak: 3,
        lastStudyDate: '2025-10-03',
        hoursStudied: 2.5,
        averageScore: 80,
        examReadiness: 'Good',
        domainScores: {},
        achievements: ['Perfect Score'],
        weeklyGoal: 5,
        weeklyProgress: 3,
        timeSpent: 9000,
        reviewStreak: 2,
        lastReviewDate: '2025-10-03',
        longestReviewStreak: 2,
      };

      localStorage.setItem('tco-progress', JSON.stringify(mockProgress));

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.state.progress.totalQuestions).toBe(50);
      expect(result.current.state.progress.averageScore).toBe(80);
      expect(result.current.state.progress.achievements).toContain('Perfect Score');
    });
  });

  describe('Reset Progress', () => {
    it('should reset all progress to initial state', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(85, 20, 600);
        result.current.setWeeklyGoal(10);
        result.current.updateReviewStreak(5, 5);
      });

      act(() => {
        result.current.resetProgress();
      });

      expect(result.current.state.progress).toMatchObject({
        totalQuestions: 0,
        correctAnswers: 0,
        sessionCount: 0,
        studyStreak: 0,
        hoursStudied: 0,
        averageScore: 0,
        examReadiness: 'Poor',
        achievements: [],
        weeklyGoal: 5,
        weeklyProgress: 0,
        reviewStreak: 0,
      });
    });

    it('should remove progress from localStorage', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(85, 20, 600);
      });

      act(() => {
        result.current.resetProgress();
      });

      expect(localStorage.getItem('tco-progress')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero questions gracefully', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      const stats = result.current.getOverallStats();
      expect(stats.averageScore).toBe(0);
      expect(stats.totalQuestions).toBe(0);
    });

    it('should handle domain stats with zero questions', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      const domainStats = result.current.getDomainStats();
      domainStats.forEach((domain) => {
        expect(domain.percentage).toBe(0);
        expect(domain.questionsAnswered).toBe(0);
      });
    });

    it('should handle negative time values gracefully', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(80, 10, -100);
      });

      const stats = result.current.getOverallStats();
      expect(stats.hoursStudied).toBeGreaterThanOrEqual(0);
    });

    it('should handle scores above 100%', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateSessionStats(150, 10, 300);
      });

      const stats = result.current.getOverallStats();
      expect(stats.totalQuestions).toBe(10);
      // System should handle gracefully (capped or allowed)
    });
  });

  describe('Context Provider Error Handling', () => {
    it('should throw error when useProgress is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useProgress());
      }).toThrow('useProgress must be used within a ProgressProvider');

      consoleSpy.mockRestore();
    });
  });
});
