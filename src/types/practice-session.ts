import type { Question, TCODomain, Difficulty, QuestionCategory } from "./exam";

export interface PracticeSessionConfig {
  moduleId: string;
  domain?: TCODomain;
  difficulty?: Difficulty;
  category?: QuestionCategory;
  tags?: string[];
  questionCount: number;
  passingScore: number; // Percentage needed to unlock assessment
  timeLimit?: number; // Optional time limit in seconds
}

export interface PracticeQuestion extends Question {
  sessionId: string;
  questionIndex: number;
  userAnswer?: string;
  isCorrect?: boolean;
  answeredAt?: Date;
  timeSpent?: number;
}

export interface PracticeSession {
  id: string;
  moduleId: string;
  userId: string;
  config: PracticeSessionConfig;
  questions: PracticeQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  startedAt: Date;
  completedAt?: Date;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
  attempts: number;
}

export enum PracticeSessionState {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
}

export interface PracticeSessionSummary {
  sessionId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
  domainBreakdown: Record<
    TCODomain,
    {
      correct: number;
      total: number;
      percentage: number;
    }
  >;
  difficultyBreakdown: Record<
    Difficulty,
    {
      correct: number;
      total: number;
      percentage: number;
    }
  >;
  improvementAreas: string[];
  strongAreas: string[];
}

export interface PracticeProgress {
  moduleId: string;
  userId: string;
  totalSessions: number;
  bestScore: number;
  averageScore: number;
  totalTimeSpent: number;
  questionsAnswered: number;
  questionsCorrect: number;
  overallAccuracy: number;
  canProceedToAssessment: boolean;
  lastSessionDate: Date;
  streakDays: number;
}
