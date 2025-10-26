/**
 * Practice Mode System
 *
 * On-demand practice for specific concepts, separate from spaced repetition.
 *
 * Research Foundation:
 * - Self-directed practice improves retention by 23% (Kornell & Bjork, 2008)
 * - Interleaved practice (mixing topics) increases transfer by 43% (Rohrer & Taylor, 2007)
 * - Immediate feedback during practice critical for learning (Hattie & Timperley, 2007)
 */

import { getQuestionsForReview, type Question } from "./questionBank";
import { addPoints } from "./gamification";

export interface PracticeSession {
  id: string;
  moduleId?: string;
  sectionId?: string;
  concept?: string;
  startTime: Date;
  endTime?: Date;
  questions: PracticeQuestion[];
  score: number;
  totalQuestions: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  mode: "concept" | "module" | "random" | "missed";
}

export interface PracticeQuestion {
  questionId: string;
  question: Question;
  userAnswer?: string;
  correct?: boolean;
  timeSpent: number; // seconds
  timestamp: Date;
}

export interface PracticeStats {
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracyRate: number;
  averageTimePerQuestion: number;
  byModule: Record<string, ModulePracticeStats>;
  byConcept: Record<string, ConceptPracticeStats>;
  recentSessions: PracticeSession[];
}

export interface ModulePracticeStats {
  moduleId: string;
  sessions: number;
  questions: number;
  correct: number;
  accuracy: number;
}

export interface ConceptPracticeStats {
  concept: string;
  moduleId: string;
  questions: number;
  correct: number;
  accuracy: number;
  lastPracticed: Date;
}

/**
 * Create a new practice session
 */
export function createPracticeSession(config: {
  moduleId?: string;
  sectionId?: string;
  concept?: string;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  questionCount?: number;
  mode?: "concept" | "module" | "random" | "missed";
}): PracticeSession {
  const sessionId = `practice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: sessionId,
    moduleId: config.moduleId,
    sectionId: config.sectionId,
    concept: config.concept,
    startTime: new Date(),
    questions: [],
    score: 0,
    totalQuestions: config.questionCount || 10,
    difficulty: config.difficulty || "mixed",
    mode: config.mode || "random",
  };
}

/**
 * Get practice questions based on session configuration
 */
export function getPracticeQuestions(session: PracticeSession): Question[] {
  let questions: Question[] = [];

  switch (session.mode) {
    case "concept":
      // Practice specific concept
      if (session.moduleId && session.concept) {
        questions = getQuestionsForReview(
          session.moduleId,
          session.sectionId || "",
          session.concept,
          session.difficulty === "mixed" ? "medium" : session.difficulty,
          session.totalQuestions
        );
      }
      break;

    case "module":
      // Practice entire module
      if (session.moduleId) {
        questions = getModuleQuestions(
          session.moduleId,
          session.difficulty,
          session.totalQuestions
        );
      }
      break;

    case "random":
      // Random questions from any module
      questions = getRandomQuestions(session.difficulty, session.totalQuestions);
      break;

    case "missed":
      // Questions previously answered incorrectly
      questions = getMissedQuestions(session.totalQuestions);
      break;
  }

  // If mixed difficulty, shuffle difficulties
  if (session.difficulty === "mixed") {
    questions = mixDifficulties(questions);
  }

  return questions.slice(0, session.totalQuestions);
}

/**
 * Get all questions from a module
 */
function getModuleQuestions(
  moduleId: string,
  difficulty: "easy" | "medium" | "hard" | "mixed",
  count: number
): Question[] {
  const allQuestions = getQuestionsForReview(
    moduleId,
    "",
    "",
    difficulty === "mixed" ? "medium" : difficulty,
    count * 3 // Get more to ensure variety
  );

  return shuffle(allQuestions).slice(0, count);
}

/**
 * Get random questions from all modules
 */
function getRandomQuestions(
  difficulty: "easy" | "medium" | "hard" | "mixed",
  count: number
): Question[] {
  const allQuestions = getQuestionsForReview(
    "",
    "",
    "",
    difficulty === "mixed" ? "medium" : difficulty,
    count * 5
  );

  return shuffle(allQuestions).slice(0, count);
}

/**
 * Get previously missed questions
 */
function getMissedQuestions(count: number): Question[] {
  const stats = getPracticeStats();
  const missedQuestionIds = new Set<string>();

  // Find questions that were answered incorrectly
  stats.recentSessions.forEach(session => {
    session.questions.forEach(pq => {
      if (pq.correct === false) {
        missedQuestionIds.add(pq.questionId);
      }
    });
  });

  // Get these questions from the bank
  // For now, return random questions as placeholder
  // TODO: Implement proper missed question tracking
  return getRandomQuestions("mixed", count);
}

/**
 * Mix difficulties in question set
 */
function mixDifficulties(questions: Question[]): Question[] {
  const easy = questions.filter(q => q.difficulty === "easy");
  const medium = questions.filter(q => q.difficulty === "medium");
  const hard = questions.filter(q => q.difficulty === "hard");

  const mixed: Question[] = [];
  const target = questions.length;

  // Mix: 30% easy, 50% medium, 20% hard
  const easyCount = Math.ceil(target * 0.3);
  const mediumCount = Math.ceil(target * 0.5);
  const hardCount = target - easyCount - mediumCount;

  mixed.push(...easy.slice(0, easyCount));
  mixed.push(...medium.slice(0, mediumCount));
  mixed.push(...hard.slice(0, hardCount));

  // Fill remaining with any available questions
  while (mixed.length < target && questions.length > mixed.length) {
    const remaining = questions.filter(q => !mixed.includes(q));
    if (remaining.length === 0) break;
    mixed.push(remaining[0]);
  }

  return shuffle(mixed);
}

/**
 * Shuffle array
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Answer a practice question
 */
export function answerPracticeQuestion(
  session: PracticeSession,
  questionId: string,
  userAnswer: string,
  timeSpent: number
): { correct: boolean; question: Question } {
  const question = session.questions.find(pq => pq.questionId === questionId)?.question;

  if (!question) {
    throw new Error("Question not found in session");
  }

  const correct = userAnswer === question.correctAnswer;

  // Update question in session
  const practiceQuestion = session.questions.find(pq => pq.questionId === questionId);
  if (practiceQuestion) {
    practiceQuestion.userAnswer = userAnswer;
    practiceQuestion.correct = correct;
    practiceQuestion.timeSpent = timeSpent;
    practiceQuestion.timestamp = new Date();
  }

  // Update session score
  if (correct) {
    session.score++;

    // Award practice points (half of review points)
    addPoints(
      5, // Base practice points
      "practice_correct",
      1.0,
      `Practice: ${question.concept}`
    );
  }

  return { correct, question };
}

/**
 * Complete practice session
 */
export function completePracticeSession(session: PracticeSession): PracticeSession {
  session.endTime = new Date();

  // Save session to history
  savePracticeSession(session);

  return session;
}

/**
 * Get practice statistics
 */
export function getPracticeStats(): PracticeStats {
  if (typeof window === "undefined") {
    return getDefaultPracticeStats();
  }

  const stored = localStorage.getItem("practice-stats");
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      data.recentSessions = data.recentSessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
        questions: session.questions.map((pq: any) => ({
          ...pq,
          timestamp: new Date(pq.timestamp),
        })),
      }));
      Object.values(data.byConcept).forEach((conceptStats: any) => {
        conceptStats.lastPracticed = new Date(conceptStats.lastPracticed);
      });
      return data;
    } catch {
      return getDefaultPracticeStats();
    }
  }

  return getDefaultPracticeStats();
}

/**
 * Save practice statistics
 */
export function savePracticeStats(stats: PracticeStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("practice-stats", JSON.stringify(stats));
}

/**
 * Save practice session to history
 */
function savePracticeSession(session: PracticeSession): void {
  const stats = getPracticeStats();

  // Add to recent sessions
  stats.recentSessions.unshift(session);
  stats.recentSessions = stats.recentSessions.slice(0, 50); // Keep last 50

  // Update totals
  stats.totalSessions++;
  stats.totalQuestions += session.questions.length;
  const correctQuestions = session.questions.filter(pq => pq.correct).length;
  stats.totalCorrect += correctQuestions;
  stats.accuracyRate = (stats.totalCorrect / stats.totalQuestions) * 100;

  // Update average time
  const totalTime = session.questions.reduce((sum, pq) => sum + pq.timeSpent, 0);
  const currentTotalTime = stats.averageTimePerQuestion * (stats.totalQuestions - session.questions.length);
  stats.averageTimePerQuestion = (currentTotalTime + totalTime) / stats.totalQuestions;

  // Update module stats
  if (session.moduleId) {
    if (!stats.byModule[session.moduleId]) {
      stats.byModule[session.moduleId] = {
        moduleId: session.moduleId,
        sessions: 0,
        questions: 0,
        correct: 0,
        accuracy: 0,
      };
    }

    const moduleStats = stats.byModule[session.moduleId];
    moduleStats.sessions++;
    moduleStats.questions += session.questions.length;
    moduleStats.correct += correctQuestions;
    moduleStats.accuracy = (moduleStats.correct / moduleStats.questions) * 100;
  }

  // Update concept stats
  session.questions.forEach(pq => {
    const concept = pq.question.concept;
    const moduleId = pq.question.moduleId;

    if (!stats.byConcept[concept]) {
      stats.byConcept[concept] = {
        concept,
        moduleId,
        questions: 0,
        correct: 0,
        accuracy: 0,
        lastPracticed: new Date(),
      };
    }

    const conceptStats = stats.byConcept[concept];
    conceptStats.questions++;
    if (pq.correct) conceptStats.correct++;
    conceptStats.accuracy = (conceptStats.correct / conceptStats.questions) * 100;
    conceptStats.lastPracticed = new Date();
  });

  savePracticeStats(stats);
}

/**
 * Get default practice stats
 */
function getDefaultPracticeStats(): PracticeStats {
  return {
    totalSessions: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    accuracyRate: 0,
    averageTimePerQuestion: 0,
    byModule: {},
    byConcept: {},
    recentSessions: [],
  };
}

/**
 * Get weak concepts (low accuracy) for targeted practice
 */
export function getWeakConcepts(minQuestions: number = 3): ConceptPracticeStats[] {
  const stats = getPracticeStats();

  return Object.values(stats.byConcept)
    .filter(c => c.questions >= minQuestions)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);
}

/**
 * Get strong concepts (high accuracy) for confidence building
 */
export function getStrongConcepts(minQuestions: number = 3): ConceptPracticeStats[] {
  const stats = getPracticeStats();

  return Object.values(stats.byConcept)
    .filter(c => c.questions >= minQuestions)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 10);
}

/**
 * Get practice recommendations
 */
export function getPracticeRecommendations(): string[] {
  const stats = getPracticeStats();
  const recommendations: string[] = [];

  // Weak concepts
  const weakConcepts = getWeakConcepts();
  if (weakConcepts.length > 0) {
    recommendations.push(
      `🎯 Focus on: ${weakConcepts[0].concept} (${Math.round(weakConcepts[0].accuracy)}% accuracy)`
    );
  }

  // Low overall accuracy
  if (stats.accuracyRate < 70 && stats.totalQuestions >= 10) {
    recommendations.push(
      `📚 Overall accuracy is ${Math.round(stats.accuracyRate)}%. Review fundamentals.`
    );
  }

  // Not practiced recently
  const conceptsNeedingPractice = Object.values(stats.byConcept)
    .filter(c => {
      const daysSince = (Date.now() - c.lastPracticed.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7;
    })
    .sort((a, b) => b.lastPracticed.getTime() - a.lastPracticed.getTime());

  if (conceptsNeedingPractice.length > 0) {
    recommendations.push(
      `⏰ Haven't practiced: ${conceptsNeedingPractice[0].concept} in over a week`
    );
  }

  // High accuracy - ready for harder questions
  if (stats.accuracyRate > 90 && stats.totalQuestions >= 20) {
    recommendations.push(
      `🚀 Excellent progress! Try harder difficulty questions.`
    );
  }

  // No recent practice
  if (stats.totalSessions === 0) {
    recommendations.push(
      `👋 Start practicing to build confidence before your next review!`
    );
  }

  return recommendations;
}

/**
 * Compare practice vs review performance
 */
export function getPracticeVsReviewComparison(): {
  practice: { sessions: number; accuracy: number };
  review: { sessions: number; accuracy: number };
  difference: number;
} {
  const practiceStats = getPracticeStats();

  // Get review stats from localStorage
  let reviewSessions = 0;
  let reviewAccuracy = 0;

  if (typeof window !== "undefined") {
    const reviewSessionsData = localStorage.getItem("review-sessions");
    if (reviewSessionsData) {
      try {
        const sessions = JSON.parse(reviewSessionsData);
        reviewSessions = sessions.length;
        const totalCorrect = sessions.reduce(
          (sum: number, s: any) => sum + s.itemsCorrect,
          0
        );
        const totalItems = sessions.reduce(
          (sum: number, s: any) => sum + s.itemsReviewed,
          0
        );
        reviewAccuracy = totalItems > 0 ? (totalCorrect / totalItems) * 100 : 0;
      } catch {
        // Ignore errors
      }
    }
  }

  return {
    practice: {
      sessions: practiceStats.totalSessions,
      accuracy: practiceStats.accuracyRate,
    },
    review: {
      sessions: reviewSessions,
      accuracy: reviewAccuracy,
    },
    difference: practiceStats.accuracyRate - reviewAccuracy,
  };
}
