/**
 * ExamContext Unit Tests
 *
 * Comprehensive test suite for ExamContext state management
 * Target: 100% coverage for critical exam workflow
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { ExamMode, type Question } from '@/types/exam';
import { ExamProvider, useExam } from '../ExamContext';

// Mock dependencies
const mockUseAuth = jest.fn();
const mockUseIncorrectAnswers = jest.fn();
const mockUseDatabase = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/contexts/IncorrectAnswersContext', () => ({
  useIncorrectAnswers: () => mockUseIncorrectAnswers(),
}));

jest.mock('@/hooks/useDatabase', () => ({
  useDatabase: (...args: unknown[]) => mockUseDatabase(...args),
}));

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
      update: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

// Test data factory
const createMockQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: `q-${Math.random()}`,
  domain: 'asking-questions',
  question: 'What is Tanium?',
  choices: [
    { id: '0', text: 'Option A' },
    { id: '1', text: 'Option B' },
    { id: '2', text: 'Option C' },
    { id: '3', text: 'Option D' },
  ],
  correctAnswerId: '0',
  explanation: 'Test explanation',
  difficulty: 'medium',
  learningObjective: 'test-objective',
  ...overrides,
});

// Wrapper component for hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ExamProvider>{children}</ExamProvider>
);

describe('ExamContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
    });

    mockUseIncorrectAnswers.mockReturnValue({
      addIncorrectAnswer: jest.fn(),
      clearIncorrectAnswers: jest.fn(),
    });

    mockUseDatabase.mockReturnValue({
      insertExamSession: jest.fn().mockResolvedValue({ id: 'db-session-1' }),
      updateExamSession: jest.fn().mockResolvedValue({}),
      insertUserProgress: jest.fn().mockResolvedValue({}),
      getExamSessions: jest.fn().mockResolvedValue([]),
    });
  });

  describe('Initial State', () => {
    it('should provide default exam state', () => {
      const { result } = renderHook(() => useExam(), { wrapper });

      expect(result.current.state).toEqual({
        currentSession: null,
        isLoading: false,
        error: null,
      });
    });

    it('should provide all required context methods', () => {
      const { result } = renderHook(() => useExam(), { wrapper });

      expect(result.current.startExam).toBeDefined();
      expect(result.current.answerQuestion).toBeDefined();
      expect(result.current.finishExam).toBeDefined();
      expect(result.current.nextQuestion).toBeDefined();
      expect(result.current.previousQuestion).toBeDefined();
      expect(result.current.resetExam).toBeDefined();
      expect(result.current.getScore).toBeDefined();
      expect(result.current.getCurrentQuestion).toBeDefined();
      expect(result.current.getProgress).toBeDefined();
    });
  });

  describe('startExam', () => {
    it('should initialize exam with practice mode', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion(), createMockQuestion()];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      expect(result.current.state.currentSession?.mode).toBe(ExamMode.PRACTICE);
      expect(result.current.state.currentSession?.questions).toHaveLength(2);
      expect(result.current.state.currentSession?.currentIndex).toBe(0);
      expect(result.current.state.currentSession?.startTime).toBeTruthy();
      expect(result.current.state.currentSession?.completed).toBe(false);
    });

    it('should initialize exam with mock mode', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = Array.from({ length: 75 }, (_, i) => createMockQuestion({ id: `q-${i}` }));

      await act(async () => {
        await result.current.startExam(ExamMode.MOCK, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      expect(result.current.state.currentSession?.mode).toBe(ExamMode.MOCK);
      expect(result.current.state.currentSession?.questions).toHaveLength(75);
    });

    it('should reset previous exam state', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const q1 = createMockQuestion({ id: 'q1' });
      const q2 = createMockQuestion({ id: 'q2' });

      // Start first exam
      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, [q1]);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      // Answer a question
      act(() => {
        result.current.answerQuestion('q1', '0');
      });

      expect(result.current.state.currentSession?.answers).toHaveProperty('q1');

      // Start second exam - should reset
      await act(async () => {
        await result.current.startExam(ExamMode.MOCK, [q2]);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession?.answers).toEqual({});
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(0);
      expect(result.current.state.currentSession?.questions[0].id).toBe('q2');
    });
  });

  describe('answerQuestion', () => {
    it('should record answer for current question', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const q = createMockQuestion({ id: 'q1' });

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, [q]);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.answerQuestion('q1', '2');
      });

      expect(result.current.state.currentSession?.answers.q1).toBe('2');
    });

    it('should allow changing answer', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const q = createMockQuestion({ id: 'q1' });

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, [q]);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.answerQuestion('q1', '1');
      });

      expect(result.current.state.currentSession?.answers.q1).toBe('1');

      act(() => {
        result.current.answerQuestion('q1', '3');
      });

      expect(result.current.state.currentSession?.answers.q1).toBe('3');
    });

    it('should record answers for multiple questions', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [
        createMockQuestion({ id: 'q1' }),
        createMockQuestion({ id: 'q2' }),
        createMockQuestion({ id: 'q3' }),
      ];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.answerQuestion('q1', '0');
        result.current.answerQuestion('q2', '1');
        result.current.answerQuestion('q3', '2');
      });

      expect(result.current.state.currentSession?.answers).toEqual({
        q1: '0',
        q2: '1',
        q3: '2',
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to next question', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion(), createMockQuestion()];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(0);

      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(1);
    });

    it('should not navigate past last question', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion()];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(0);
    });

    it('should navigate to previous question', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion(), createMockQuestion()];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(1);

      act(() => {
        result.current.previousQuestion();
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(0);
    });

    it('should not navigate before first question', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion()];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.previousQuestion();
      });

      expect(result.current.state.currentSession?.currentIndex).toBe(0);
    });
  });

  describe('finishExam', () => {
    it('should finish exam and mark as completed', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [
        createMockQuestion({ id: 'q1', correctAnswerId: '0' }),
        createMockQuestion({ id: 'q2', correctAnswerId: '1' }),
      ];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.answerQuestion('q1', '0'); // Correct
        result.current.answerQuestion('q2', '2'); // Incorrect
      });

      act(() => {
        result.current.finishExam();
      });

      expect(result.current.state.currentSession?.completed).toBe(true);
      expect(result.current.state.currentSession?.endTime).toBeTruthy();
    });

    it('should calculate correct score', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [
        createMockQuestion({ id: 'q1', correctAnswerId: '0' }),
        createMockQuestion({ id: 'q2', correctAnswerId: '1' }),
        createMockQuestion({ id: 'q3', correctAnswerId: '2' }),
        createMockQuestion({ id: 'q4', correctAnswerId: '3' }),
      ];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.answerQuestion('q1', '0'); // Correct
        result.current.answerQuestion('q2', '1'); // Correct
        result.current.answerQuestion('q3', '0'); // Incorrect
        result.current.answerQuestion('q4', '3'); // Correct
      });

      act(() => {
        result.current.finishExam();
      });

      expect(result.current.state.currentSession?.score).toBe(75);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score with all correct answers', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [
        createMockQuestion({ id: 'q1', correctAnswerId: '0' }),
        createMockQuestion({ id: 'q2', correctAnswerId: '1' }),
      ];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.answerQuestion('q1', '0');
        result.current.answerQuestion('q2', '1');
      });

      const score = result.current.getScore();
      expect(score).toBe(100);
    });

    it('should calculate score with all incorrect answers', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [
        createMockQuestion({ id: 'q1', correctAnswerId: '0' }),
        createMockQuestion({ id: 'q2', correctAnswerId: '1' }),
      ];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.answerQuestion('q1', '2');
        result.current.answerQuestion('q2', '3');
      });

      const score = result.current.getScore();
      expect(score).toBe(0);
    });

    it('should calculate score with unanswered questions', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [
        createMockQuestion({ id: 'q1', correctAnswerId: '0' }),
        createMockQuestion({ id: 'q2', correctAnswerId: '1' }),
        createMockQuestion({ id: 'q3', correctAnswerId: '2' }),
      ];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.answerQuestion('q1', '0'); // Correct
        // Question 2 and 3 unanswered
      });

      const score = result.current.getScore();
      expect(score).toBe(100); // Based on answered questions only
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty question list with fallback', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, []);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      // ExamContext has fallback logic that loads default questions when empty array is provided
      expect(result.current.state.currentSession?.questions.length).toBeGreaterThan(0);
    });

    it('should handle rapid state changes', async () => {
      const { result } = renderHook(() => useExam(), { wrapper });
      const questions = [createMockQuestion({ id: 'q1' }), createMockQuestion({ id: 'q2' })];

      await act(async () => {
        await result.current.startExam(ExamMode.PRACTICE, questions);
      });

      await waitFor(() => {
        expect(result.current.state.currentSession).not.toBeNull();
      });

      act(() => {
        result.current.answerQuestion('q1', '0');
        result.current.nextQuestion();
        result.current.answerQuestion('q2', '1');
        result.current.previousQuestion();
        result.current.answerQuestion('q1', '2');
      });

      expect(result.current.state.currentSession?.answers.q1).toBe('2');
      expect(result.current.state.currentSession?.answers.q2).toBe('1');
    });
  });

  describe('Context Provider Error Handling', () => {
    it('should throw error when useExam is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useExam());
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });
});
