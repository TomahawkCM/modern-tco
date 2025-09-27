import { supabase } from "@/lib/supabase";
import {
  Choice,
  Difficulty,
  QuestionCategory,
  TCODomain,
  TCO_DOMAIN_WEIGHTS,
  type ExamSession,
  type Question,
} from "@/types/exam";
import { ALL_DIFFICULTIES } from "./difficulty";
import { Tables } from "@/types/supabase";
import {
  getAllQuestions,
  getQuestionsByDomain,
  getWeightedRandomQuestions,
} from "./questionLoader";

export interface QuestionFilter {
  domains?: TCODomain[];
  difficulties?: Difficulty[];
  tags?: string[];
  excludeAnswered?: boolean;
  answeredQuestions?: string[];
}

export interface AdaptiveSettings {
  focusOnWeakAreas: boolean;
  difficultyProgression: boolean;
  spaceRepetition: boolean;
  minDifficulty?: Difficulty;
  maxDifficulty?: Difficulty;
}

/**
 * Shuffles array in place using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Filters questions based on provided criteria
 */
export function filterQuestions(questions: Question[], filter: QuestionFilter): Question[] {
  let filtered = [...questions];

  if (filter.domains && filter.domains.length > 0) {
    filtered = filtered.filter((q) => filter.domains!.includes(q.domain));
  }

  if (filter.difficulties && filter.difficulties.length > 0) {
    filtered = filtered.filter((q) => filter.difficulties!.includes(q.difficulty));
  }

  if (filter.tags && filter.tags.length > 0) {
    filtered = filtered.filter((q) => filter.tags!.some((tag) => q.tags?.includes(tag)));
  }

  if (filter.excludeAnswered && filter.answeredQuestions) {
    filtered = filtered.filter((q) => !filter.answeredQuestions!.includes(q.id));
  }

  return filtered;
}

/**
 * Gets questions for practice mode using centralized database
 */
export function getPracticeQuestions(
  domains?: TCODomain[],
  count: number = 10,
  difficulties?: Difficulty[]
): Question[] {
  let questions: Question[];

  if (domains && domains.length > 0) {
    // Get questions from specific domains
    questions = domains.flatMap((domain) => getQuestionsByDomain(domain));
  } else {
    // Get all questions
    questions = getAllQuestions();
  }

  // Filter by difficulty if specified
  if (difficulties && difficulties.length > 0) {
    questions = questions.filter((q) => difficulties.includes(q.difficulty));
  }

  return shuffleArray(questions).slice(0, count);
}

/**
 * Gets questions for mock exam using weighted selection from Supabase database
 */
export async function getDatabaseWeightedQuestions(count: number = 65): Promise<Question[]> {
  try {
    // Fetch all questions from Supabase
    const { data: allQuestions, error } = await supabase.from("questions").select("*");

    if (error) {
      console.error("Error fetching questions from database:", error);
      // Fallback to static questions
      return getWeightedRandomQuestions(count);
    }

    if (!allQuestions || allQuestions.length === 0) {
      console.warn("No questions found in database, using static fallback");
      return getWeightedRandomQuestions(count);
    }

    // Convert database questions to our Question type and group by domain
    const questionsByDomain: Record<string, Question[]> = {};

    allQuestions.forEach((dbQuestionData) => {
      const dbQuestion = dbQuestionData as Tables<"questions">; // Explicitly cast here
      // Convert database format to our Question interface
      const question: Question = {
        id: dbQuestion.id,
        question: dbQuestion.question,
        choices: (dbQuestion.options as unknown as Choice[]) || [],
        correctAnswerId: dbQuestion.correct_answer?.toString() || "0",
        domain: dbQuestion.domain as TCODomain,
        difficulty: dbQuestion.difficulty as Difficulty,
        category: dbQuestion.category as QuestionCategory,
        explanation: dbQuestion.explanation || undefined,
        tags: dbQuestion.tags || [],
        studyGuideRef: dbQuestion.study_guide_ref || undefined,
        reference: dbQuestion.reference || undefined,
      };

      if (!questionsByDomain[question.domain]) {
        questionsByDomain[question.domain] = [];
      }
      questionsByDomain[question.domain].push(question);
    });

    // Calculate weighted distribution
    const totalWeight = Object.values(TCO_DOMAIN_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    const selectedQuestions: Question[] = [];

    // Select questions based on domain weights
    Object.entries(TCO_DOMAIN_WEIGHTS).forEach(([domain, weight]) => {
      const domainQuestions = questionsByDomain[domain] || [];
      if (domainQuestions.length === 0) {
        console.warn(`No questions found for domain: ${domain}`);
        return;
      }

      const domainQuestionCount = Math.round((weight / totalWeight) * count);
      const shuffledDomainQuestions = shuffleArray([...domainQuestions]);
      const selectedFromDomain = shuffledDomainQuestions.slice(0, domainQuestionCount);

      selectedQuestions.push(...selectedFromDomain);
    });

    // Fill remaining slots if needed
    if (selectedQuestions.length < count) {
      const usedIds = new Set(selectedQuestions.map((q) => q.id));
      const remainingQuestions = allQuestions
        .map((dbQData) => {
          const dbQ = dbQData as Tables<"questions">; // Explicitly cast here
          return {
            id: dbQ.id,
            question: dbQ.question,
            choices: (dbQ.options as unknown as Choice[]) || [],
            correctAnswerId: dbQ.correct_answer?.toString() || "0",
            domain: dbQ.domain as TCODomain,
            difficulty: dbQ.difficulty as Difficulty,
            category: dbQ.category as QuestionCategory,
            explanation: dbQ.explanation || undefined,
            tags: dbQ.tags || [],
            studyGuideRef: dbQ.study_guide_ref || undefined,
            reference: dbQ.reference || undefined,
          } as Question;
        })
        .filter((q) => !usedIds.has(q.id));

      const needed = count - selectedQuestions.length;
      const shuffledRemaining = shuffleArray(remainingQuestions);
      selectedQuestions.push(...shuffledRemaining.slice(0, needed));
    }

    // Final shuffle and return exact count
    const finalQuestions = shuffleArray(selectedQuestions).slice(0, count);
    console.log(
      `Selected ${finalQuestions.length} questions for mock exam from ${allQuestions.length} total database questions`
    );

    return finalQuestions;
  } catch (error) {
    console.error("Error in getDatabaseWeightedQuestions:", error);
    // Fallback to static questions
    return getWeightedRandomQuestions(count);
  }
}

/**
 * Gets questions for mock exam using weighted selection (static fallback)
 */
export function getMockExamQuestions(count: number = 65): Question[] {
  return getWeightedRandomQuestions(count);
}

/**
 * Gets all available questions from centralized database
 */
export function getAllAvailableQuestions(): Question[] {
  return getAllQuestions();
}

/**
 * Gets questions by domain from centralized database
 */
export function getDomainQuestions(domain: TCODomain): Question[] {
  return getQuestionsByDomain(domain);
}

/**
 * Selects questions for adaptive practice based on user performance
 */
export function selectAdaptiveQuestions(
  userPerformance: Record<string, { correct: boolean; attempts: number; lastAttempt: Date }>,
  count: number,
  settings: AdaptiveSettings = {
    focusOnWeakAreas: true,
    difficultyProgression: true,
    spaceRepetition: true,
  }
): Question[] {
  // Use centralized question database instead of passed parameter
  const allQuestions = getAllQuestions();
  let selectedQuestions: Question[] = [];

  if (settings.focusOnWeakAreas) {
    // Find questions user has answered incorrectly or not at all
    const weakQuestions = allQuestions.filter((q) => {
      const performance = userPerformance[q.id];
      return !performance || !performance.correct || performance.attempts > 1;
    });

    // Prioritize questions from weak domains
    const weakDomains = getWeakDomains(allQuestions, userPerformance);
    const weakDomainQuestions = weakQuestions.filter((q) => weakDomains.includes(q.domain));

    selectedQuestions.push(...weakDomainQuestions.slice(0, Math.ceil(count * 0.6)));
  }

  if (settings.spaceRepetition) {
    // Add questions based on spaced repetition intervals
    const spaceRepetitionQuestions = getSpacedRepetitionQuestions(allQuestions, userPerformance);
    const remaining = count - selectedQuestions.length;
    selectedQuestions.push(...spaceRepetitionQuestions.slice(0, remaining));
  }

  // Fill remaining slots with random questions
  if (selectedQuestions.length < count) {
    const usedIds = new Set(selectedQuestions.map((q) => q.id));
    const remainingQuestions = allQuestions.filter((q) => !usedIds.has(q.id));
    const remaining = count - selectedQuestions.length;
    selectedQuestions.push(...shuffleArray(remainingQuestions).slice(0, remaining));
  }

  // Apply difficulty progression if enabled
  if (settings.difficultyProgression) {
    selectedQuestions = applyDifficultyProgression(selectedQuestions, settings);
  }

  return shuffleArray(selectedQuestions).slice(0, count);
}

/**
 * Identifies domains where user performance is below average
 */
function getWeakDomains(questions: Question[], userPerformance: Record<string, any>): TCODomain[] {
  const domainStats = new Map<TCODomain, { correct: number; total: number }>();

  questions.forEach((q) => {
    const performance = userPerformance[q.id];
    if (performance) {
      const stats = domainStats.get(q.domain) || { correct: 0, total: 0 };
      stats.total++;
      if (performance.correct) stats.correct++;
      domainStats.set(q.domain, stats);
    }
  });

  const weakDomains: TCODomain[] = [];
  for (const [domain, stats] of domainStats) {
    const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
    if (accuracy < 0.7) {
      // Less than 70% accuracy
      weakDomains.push(domain);
    }
  }

  return weakDomains;
}

/**
 * Gets questions that should be reviewed based on spaced repetition algorithm
 */
function getSpacedRepetitionQuestions(
  questions: Question[],
  userPerformance: Record<string, { correct: boolean; attempts: number; lastAttempt: Date }>
): Question[] {
  const now = new Date();
  const spacedQuestions: Question[] = [];

  questions.forEach((q) => {
    const performance = userPerformance[q.id];
    if (!performance) return;

    const daysSinceLastAttempt = Math.floor(
      (now.getTime() - performance.lastAttempt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Simple spaced repetition intervals: 1, 3, 7, 14, 30 days
    const intervals = [1, 3, 7, 14, 30];
    const intervalIndex = Math.min(performance.attempts - 1, intervals.length - 1);
    const nextReviewInterval = intervals[intervalIndex];

    if (daysSinceLastAttempt >= nextReviewInterval) {
      spacedQuestions.push(q);
    }
  });

  return spacedQuestions;
}

/**
 * Applies difficulty progression to question selection
 */
function applyDifficultyProgression(questions: Question[], settings: AdaptiveSettings): Question[] {
  if (settings.minDifficulty && settings.maxDifficulty) {
    const difficultyOrder = ALL_DIFFICULTIES;
    const minIndex = difficultyOrder.indexOf(settings.minDifficulty);
    const maxIndex = difficultyOrder.indexOf(settings.maxDifficulty);

    return questions.filter((q) => {
      const qIndex = difficultyOrder.indexOf(q.difficulty);
      return qIndex >= minIndex && qIndex <= maxIndex;
    });
  }

  return questions;
}

/**
 * Calculates exam score and detailed results
 */
export function calculateExamResults(session: ExamSession): {
  score: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  domainBreakdown: Record<TCODomain, { correct: number; total: number; percentage: number }>;
  timeSpent: number;
  efficiency: number;
} {
  const { questions, answers, startTime, endTime } = session;
  const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswerId).length;
  const totalCount = questions.length;
  const score = Math.round((correctCount / totalCount) * 100);
  const passed = score >= 70; // 70% passing threshold

  // Domain breakdown
  const domainBreakdown: Record<TCODomain, { correct: number; total: number; percentage: number }> =
    Object.fromEntries(
      Object.values(TCODomain).map((domain) => [domain, { correct: 0, total: 0, percentage: 0 }])
    ) as Record<TCODomain, { correct: number; total: number; percentage: number }>;

  questions.forEach((q) => {
    domainBreakdown[q.domain].total++;
    if (answers[q.id] === q.correctAnswerId) {
      domainBreakdown[q.domain].correct++;
    }
  });

  Object.keys(domainBreakdown).forEach((domain) => {
    const stats = domainBreakdown[domain as TCODomain];
    stats.percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  });

  // Time and efficiency calculations
  const timeSpent = endTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0; // seconds
  const averageTimePerQuestion = timeSpent / totalCount;
  const efficiency = Math.round((correctCount / (timeSpent / 60)) * 100) / 100; // correct answers per minute

  return {
    score,
    passed,
    correctCount,
    totalCount,
    domainBreakdown,
    timeSpent,
    efficiency,
  };
}

/**
 * Generates study recommendations based on performance
 */
export function generateStudyRecommendations(
  userPerformance: Record<string, any>,
  recentSessions: ExamSession[]
): {
  focusDomains: TCODomain[];
  recommendedDifficulty: Difficulty;
  studyTips: string[];
  nextSteps: string[];
} {
  // Use centralized question database
  const questions = getAllQuestions();
  const weakDomains = getWeakDomains(questions, userPerformance);

  // Analyze recent performance trend
  const recentScores = recentSessions
    .slice(-5)
    .map((s) =>
      Math.round(
        (s.questions.filter((q) => s.answers[q.id] === q.correctAnswerId).length /
          s.questions.length) *
          100
      )
    );

  const averageRecentScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length || 0;

  let recommendedDifficulty: Difficulty = Difficulty.INTERMEDIATE;
  if (averageRecentScore < 60) {
    recommendedDifficulty = Difficulty.BEGINNER;
  } else if (averageRecentScore > 85) {
    recommendedDifficulty = Difficulty.ADVANCED;
  }

  const studyTips: string[] = [];
  const nextSteps: string[] = [];

  if (weakDomains.length > 0) {
    studyTips.push(`Focus on your weakest domains: ${weakDomains.join(", ")}`);
    nextSteps.push(`Take domain-specific practice tests for ${weakDomains[0]}`);
  }

  if (averageRecentScore < 70) {
    studyTips.push("Review explanations carefully for incorrect answers");
    nextSteps.push("Complete at least 20 practice questions daily");
  } else if (averageRecentScore > 85) {
    studyTips.push("You're performing well! Focus on consistency");
    nextSteps.push("Take a full-length mock exam to test readiness");
  }

  return {
    focusDomains: weakDomains,
    recommendedDifficulty,
    studyTips,
    nextSteps,
  };
}

/**
 * Validates exam session data
 */
export function validateExamSession(session: ExamSession): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!session.questions || session.questions.length === 0) {
    errors.push("Exam session must contain questions");
  }

  if (!session.startTime) {
    errors.push("Exam session must have a start time");
  }

  if (session.completed && !session.endTime) {
    errors.push("Completed exam session must have an end time");
  }

  const answeredQuestions = Object.keys(session.answers);
  const invalidAnswers = answeredQuestions.filter(
    (questionId) => !session.questions.find((q) => q.id === questionId)
  );

  if (invalidAnswers.length > 0) {
    errors.push(`Invalid answers found for questions: ${invalidAnswers.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper to transform database question object to application-level Question
function transformDatabaseQuestion(dbQ: Tables<"questions">): Question {
  const choices = (dbQ.options as unknown as Choice[]) || []; // Assume options is JSON and parse it to Choice[]
  const tags = (dbQ.tags as string[]) || []; // Assume tags is JSON and parse it to string[]

  return {
    id: dbQ.id,
    question: dbQ.question,
    choices,
    correctAnswerId: dbQ.correct_answer?.toString() || "0",
    domain: dbQ.domain as TCODomain,
    difficulty: dbQ.difficulty as Difficulty,
    category: dbQ.category as QuestionCategory,
    explanation: dbQ.explanation || undefined,
    tags,
    studyGuideRef: dbQ.study_guide_ref || undefined,
    reference: dbQ.reference || undefined, // Include reference property
  };
}
