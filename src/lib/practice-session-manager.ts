import {
  type PracticeSession,
  type PracticeSessionConfig,
  PracticeSessionState,
  type PracticeSessionSummary,
  type PracticeProgress,
  type PracticeQuestion,
} from "@/types/practice-session";
import { type Question, TCODomain, type Difficulty } from "@/types/exam";
import { createId } from "@paralleldrive/cuid2";
import { defaultDifficultyRecord } from '@/lib/difficulty';

export class PracticeSessionManager {
  private session: PracticeSession | null = null;
  private onProgressUpdate?: any;
  private onSessionComplete?: any;

  constructor(onProgressUpdate?: any, onSessionComplete?: any) {
    this.onProgressUpdate = onProgressUpdate;
    this.onSessionComplete = onSessionComplete;
  }

  public setProgressCallback(cb: any) {
    this.onProgressUpdate = cb;
  }

  public setCompleteCallback(cb: any) {
    this.onSessionComplete = cb;
  }

  async startSession(
    config: PracticeSessionConfig,
    userId: string,
    questions: Question[]
  ): Promise<PracticeSession> {
    if (this.session && this.session.currentQuestionIndex < this.session.questions.length - 1) {
      throw new Error("Another practice session is already in progress");
    }

    // Shuffle questions for variety
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, config.questionCount);

    // Convert to practice questions
    const practiceQuestions: PracticeQuestion[] = selectedQuestions.map((q, index) => ({
      ...q,
      sessionId: createId(),
      questionIndex: index,
    }));

    this.session = {
      id: createId(),
      moduleId: config.moduleId,
      userId,
      config,
      questions: practiceQuestions,
      currentQuestionIndex: 0,
      answers: {},
      startedAt: new Date(),
      score: 0,
      correctCount: 0,
      totalQuestions: practiceQuestions.length,
      timeSpent: 0,
      passed: false,
      attempts: 1,
    };

    return this.session;
  }

  getCurrentSession(): PracticeSession | null {
    return this.session;
  }

  getCurrentQuestion(): PracticeQuestion | null {
    if (!this.session || this.session.currentQuestionIndex >= this.session.questions.length) {
      return null;
    }
    return this.session.questions[this.session.currentQuestionIndex];
  }

  answerQuestion(questionId: string, choiceId: string): boolean {
    if (!this.session) {
      throw new Error("No active practice session");
    }

    const question = this.session.questions.find((q) => q.id === questionId);
    if (!question) {
      throw new Error("Question not found in current session");
    }

    // Record the answer
    const answeredAt = new Date();
    question.userAnswer = choiceId;
    question.answeredAt = answeredAt;
    question.isCorrect = choiceId === question.correctAnswerId;

    // Calculate time spent on this question
    const questionStartTime = this.session.startedAt.getTime() + this.session.timeSpent * 1000;
    question.timeSpent = Math.floor((answeredAt.getTime() - questionStartTime) / 1000);

    // Update session answers
    this.session.answers[questionId] = choiceId;

    // Update session statistics
    if (question.isCorrect) {
      this.session.correctCount++;
    }

    this.session.score = Math.round(
      (this.session.correctCount / this.session.totalQuestions) * 100
    );
    this.session.timeSpent += question.timeSpent;

    return question.isCorrect;
  }

  nextQuestion(): PracticeQuestion | null {
    if (!this.session) {
      throw new Error("No active practice session");
    }

    if (this.session.currentQuestionIndex < this.session.questions.length - 1) {
      this.session.currentQuestionIndex++;
      return this.getCurrentQuestion();
    }

    // Session completed
    this.completeSession();
    return null;
  }

  previousQuestion(): PracticeQuestion | null {
    if (!this.session) {
      throw new Error("No active practice session");
    }

    if (this.session.currentQuestionIndex > 0) {
      this.session.currentQuestionIndex--;
      return this.getCurrentQuestion();
    }

    return null;
  }

  canGoToPrevious(): boolean {
    return this.session !== null && this.session.currentQuestionIndex > 0;
  }

  canGoToNext(): boolean {
    if (!this.session) return false;

    const currentQuestion = this.getCurrentQuestion();
    return currentQuestion?.userAnswer !== undefined;
  }

  jumpToQuestion(index: number): PracticeQuestion | null {
    if (!this.session || index < 0 || index >= this.session.questions.length) {
      return null;
    }

    this.session.currentQuestionIndex = index;
    return this.getCurrentQuestion();
  }

  private completeSession(): void {
    if (!this.session) return;

    this.session.completedAt = new Date();
    this.session.passed = this.session.score >= this.session.config.passingScore;

    // Generate session summary
    const summary = this.generateSessionSummary();

    // Notify completion
    if (this.onSessionComplete) {
      this.onSessionComplete(summary);
    }
  }

  private generateSessionSummary(): PracticeSessionSummary {
    if (!this.session) {
      throw new Error("No active session to summarize");
    }

    // Calculate domain breakdown
    const domainValues = Object.values(TCODomain) as TCODomain[];
    const domainBreakdown: Record<
      TCODomain,
      { correct: number; total: number; percentage: number }
    > = domainValues.reduce((acc, d) => {
      acc[d] = { correct: 0, total: 0, percentage: 0 };
      return acc;
    }, {} as Record<TCODomain, { correct: number; total: number; percentage: number }>);

    // Calculate difficulty breakdown
    const difficultyBreakdown: Record<
      Difficulty,
      { correct: number; total: number; percentage: number }
    > = defaultDifficultyRecord(() => ({ correct: 0, total: 0, percentage: 0 }));

    // Process questions
    this.session.questions.forEach((question) => {
      // Domain stats
      domainBreakdown[question.domain].total++;
      if (question.isCorrect) {
        domainBreakdown[question.domain].correct++;
      }

      // Difficulty stats
      difficultyBreakdown[question.difficulty].total++;
      if (question.isCorrect) {
        difficultyBreakdown[question.difficulty].correct++;
      }
    });

    // Calculate percentages
    Object.values(domainBreakdown).forEach((domain) => {
      domain.percentage = domain.total > 0 ? Math.round((domain.correct / domain.total) * 100) : 0;
    });

    Object.values(difficultyBreakdown).forEach((difficulty) => {
      difficulty.percentage =
        difficulty.total > 0 ? Math.round((difficulty.correct / difficulty.total) * 100) : 0;
    });

    // Identify improvement and strong areas
    const improvementAreas: string[] = [];
    const strongAreas: string[] = [];

    Object.entries(domainBreakdown).forEach(([domain, stats]) => {
      if (stats.total > 0) {
        if (stats.percentage < 70) {
          improvementAreas.push(domain);
        } else if (stats.percentage >= 85) {
          strongAreas.push(domain);
        }
      }
    });

    return {
      sessionId: this.session.id,
      score: this.session.score,
      correctCount: this.session.correctCount,
      totalQuestions: this.session.totalQuestions,
      timeSpent: this.session.timeSpent,
      passed: this.session.passed,
      domainBreakdown,
      difficultyBreakdown,
      improvementAreas,
      strongAreas,
    };
  }

  getSessionProgress(): { current: number; total: number; percentage: number } {
    if (!this.session) {
      return { current: 0, total: 0, percentage: 0 };
    }

    const answeredQuestions = this.session.questions.filter(
      (q) => q.userAnswer !== undefined
    ).length;
    return {
      current: answeredQuestions,
      total: this.session.totalQuestions,
      percentage: Math.round((answeredQuestions / this.session.totalQuestions) * 100),
    };
  }

  getSessionState(): PracticeSessionState {
    if (!this.session) {
      return PracticeSessionState.NOT_STARTED;
    }

    if (this.session.completedAt) {
      return PracticeSessionState.COMPLETED;
    }

    return PracticeSessionState.IN_PROGRESS;
  }

  abandonSession(): void {
    if (this.session && !this.session.completedAt) {
      this.session.completedAt = new Date();
      // Don't mark as passed for abandoned sessions
      this.session = null;
    }
  }

  resetSession(): void {
    this.session = null;
  }
}
