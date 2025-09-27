import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import ExamSimulator from '@/components/exam/ExamSimulator';
import { AssessmentEngine } from '@/lib/assessment/assessment-engine';
import { AnalyticsService } from '@/lib/services/analytics-service';

// Mock next/navigation pathname to avoid errors
vi.mock('next/navigation', async (orig) => {
  const actual = await (orig as any)();
  return { ...actual, usePathname: () => '/exam' };
});

// Provide minimal hook environment; vitest.setup.ts already mocks Auth

describe('ExamSimulator UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on localStorage
    const proto = Object.getPrototypeOf(window.localStorage);
    vi.spyOn(proto, 'setItem');
    vi.spyOn(proto, 'removeItem');
    (AnalyticsService as any).track = vi.fn().mockResolvedValue(undefined);
    (AssessmentEngine as any).initializeSession = vi.fn().mockResolvedValue({
      sessionId: 'session-1',
      questions: [
        {
          id: 'q1',
          question: 'Q1?',
          choices: [
            { id: 'a', text: 'A' },
            { id: 'b', text: 'B' },
          ],
          correctAnswerId: 'a',
          domain: 'Asking Questions',
          difficulty: 'Beginner',
          category: 'Platform Fundamentals',
        },
        {
          id: 'q2',
          question: 'Q2?',
          choices: [
            { id: 'a', text: 'A' },
            { id: 'b', text: 'B' },
          ],
          correctAnswerId: 'b',
          domain: 'Taking Action',
          difficulty: 'Beginner',
          category: 'Platform Fundamentals',
        },
      ],
    });
    (AssessmentEngine as any).calculateResults = vi.fn().mockResolvedValue({
      sessionId: 'session-1',
      overallScore: 0.8,
      correctAnswers: 1,
      incorrectAnswers: 1,
      totalQuestions: 2,
      timeSpent: 90,
      domainBreakdown: {
        'Asking Questions': { score: 1, correct: 1, total: 1 },
        'Taking Action': { score: 0, correct: 0, total: 1 },
      },
      passed: true,
      completedAt: new Date(),
      remediation: { overallRecommendation: '', objectiveRemediation: [], studyPlan: [], retakeEligibility: true },
    });
  });

  it('starts a session, shows timer, and tracks answer', async () => {
    render(<ExamSimulator />);

    fireEvent.click(screen.getByText(/Start Practice Test/i));

    await waitFor(() => expect((AssessmentEngine as any).initializeSession).toHaveBeenCalled());

    // Session UI appears
    expect(await screen.findByTestId('exam-session')).toBeInTheDocument();

    // Timer present
    expect(screen.getByLabelText(/Time remaining/i)).toBeInTheDocument();

    // Answer first question (should persist to localStorage)
    let radio = screen.getByRole('radio', { name: 'A' });
    fireEvent.click(radio);
    // mini-map present
    expect(screen.getByTestId('mini-map')).toBeInTheDocument();
    // Jump to question 2
    const items = screen.getAllByTestId('mini-map-item');
    fireEvent.click(items[1]);
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    // Answer second question incorrectly
    radio = screen.getByRole('radio', { name: 'A' });
    fireEvent.click(radio);
    // Go back and ensure persisted selection
    fireEvent.click(screen.getByText('Previous'));
    radio = screen.getByRole('radio', { name: 'A' });
    expect(radio).toBeChecked();
    // Jump to last and submit
    const items2 = screen.getAllByTestId('mini-map-item');
    fireEvent.click(items2[1]);
    fireEvent.click(screen.getByText('Submit Exam'));

    await waitFor(() => {
      expect((AnalyticsService as any).track).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'question_answered' })
      );
    });

    // Review appears with two items and actions
    expect(await screen.findByTestId('review-panel')).toBeInTheDocument();
    let reviewItems = await screen.findAllByTestId('review-item');
    expect(reviewItems.length).toBe(2);
    expect(screen.getByText('Retake Exam')).toBeInTheDocument();
    expect(screen.getByText('Back to start')).toBeInTheDocument();

    // Retake
    fireEvent.click(screen.getByText('Retake Exam'));
    await waitFor(() => expect((AssessmentEngine as any).initializeSession).toHaveBeenCalledTimes(2));
    expect(await screen.findByTestId('exam-session')).toBeInTheDocument();
    // Navigate to end and submit again
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Submit Exam'));
    await waitFor(() => expect(screen.getByTestId('review-panel')).toBeInTheDocument());

    // Back to start (should clear localStorage key)
    fireEvent.click(screen.getByText('Back to start'));
    await waitFor(() => expect(screen.queryByTestId('exam-session')).not.toBeInTheDocument());
    const proto = Object.getPrototypeOf(window.localStorage);
    expect((proto.removeItem as any)).toHaveBeenCalled();
  });
});
