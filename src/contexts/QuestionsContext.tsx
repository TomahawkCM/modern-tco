/**
 * Questions Context
 * Provides questions data from Supabase to the entire application
 */

"use client";

import {
  clearQuestionsCache,
  fetchQuestions,
  fetchQuestionsByCategory,
  fetchQuestionsByDifficulty,
  fetchQuestionsByDomain,
  fetchQuestionsWithFilters,
  loadQuestionsWithFallback,
  searchQuestions,
  subscribeToQuestions,
} from "@/services/questionsService";
import { Difficulty, QuestionCategory, TCODomain, type Question } from "@/types/exam";
import { defaultDifficultyRecord } from '@/lib/difficulty';
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface QuestionsContextType {
  questions: Question[];
  loading: boolean;
  error: string | null;
  totalQuestions: number;

  // Fetch methods
  refreshQuestions: (forceRefresh?: boolean) => Promise<void>;
  getQuestionsByDomain: (domain: TCODomain) => Promise<Question[]>;
  getQuestionsByDifficulty: (difficulty: Difficulty) => Promise<Question[]>;
  getQuestionsByCategory: (category: QuestionCategory) => Promise<Question[]>;
  getQuestionsWithFilters: (filters: {
    domains?: TCODomain[];
    difficulties?: Difficulty[];
    categories?: QuestionCategory[];
    tags?: string[];
    limit?: number;
  }) => Promise<Question[]>;
  searchQuestionsByText: (searchText: string) => Promise<Question[]>;

  // Assessment methods
  getAssessmentQuestions: (config: {
    type: string;
    moduleId?: string;
    domainFilter?: TCODomain;
    count: number;
  }) => Promise<Question[]>;

  // Utility methods
  getRandomQuestions: (
    count: number,
    filters?: {
      domains?: TCODomain[];
      difficulties?: Difficulty[];
      categories?: QuestionCategory[];
    }
  ) => Question[];
  getQuestionById: (id: string) => Question | undefined;

  // Statistics
  domainDistribution: Record<TCODomain, number>;
  difficultyDistribution: Record<Difficulty, number>;
  categoryDistribution: Record<QuestionCategory, number>;
}

const QuestionsContext = createContext<QuestionsContextType | null>(null);

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = typeof window !== 'undefined' ? usePathname() : null;

  // Only load questions on routes that actually need the full bank.
  // This avoids fetching hundreds of questions on pages like /welcome, /mock, /review.
  const shouldLoad = React.useMemo(() => {
    const p = (pathname || "").toLowerCase();
    // Load on admin editor and study/content areas; defer elsewhere
    return [
      "/admin", "/study", "/learn", "/learning", "/modules", "/assessments", "/kb",
    ].some((prefix) => p.startsWith(prefix));
  }, [pathname]);

  const loadInitialQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the fallback loader which tries Supabase first, then static data
      const loadedQuestions = await loadQuestionsWithFallback();
      setQuestions(loadedQuestions);
    } catch (err) {
      console.error("Failed to load questions:", err);
      setError("Failed to load questions. Please try again.");
      // Even on error, try to have some questions available
      try {
        const { questionBank } = await import("@/data/sample-questions");
        setQuestions(questionBank);
      } catch {
        setQuestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load questions only when needed
  useEffect(() => {
    if (!shouldLoad) {
      setLoading(false);
      return;
    }

    let unsub: { unsubscribe: () => void } | null = null;
    loadInitialQuestions();

    // Subscribe to real-time updates only when loading is enabled
    unsub = subscribeToQuestions((payload) => {
      console.log("Questions updated:", payload);
      loadInitialQuestions();
    });

    return () => {
      try { unsub?.unsubscribe(); } catch {}
    };
  }, [loadInitialQuestions, shouldLoad]);

  const refreshQuestions = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      if (forceRefresh) {
        clearQuestionsCache();
      }
      const freshQuestions = await fetchQuestions(forceRefresh);
      setQuestions(freshQuestions);
    } catch (err) {
      console.error("Failed to refresh questions:", err);
      setError("Failed to refresh questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  const getQuestionsByDomain = useCallback(
    async (domain: TCODomain) => {
      try {
        return await fetchQuestionsByDomain(domain);
      } catch (err) {
        console.error(`Failed to fetch questions for domain ${domain}:`, err);
        // Fall back to filtering cached questions
        return questions.filter((q) => q.domain === domain);
      }
    },
    [questions]
  );

  const getQuestionsByDifficulty = useCallback(
    async (difficulty: Difficulty) => {
      try {
        return await fetchQuestionsByDifficulty(difficulty);
      } catch (err) {
        console.error(`Failed to fetch questions for difficulty ${difficulty}:`, err);
        // Fall back to filtering cached questions
        return questions.filter((q) => q.difficulty === difficulty);
      }
    },
    [questions]
  );

  const getQuestionsByCategory = useCallback(
    async (category: QuestionCategory) => {
      try {
        return await fetchQuestionsByCategory(category);
      } catch (err) {
        console.error(`Failed to fetch questions for category ${category}:`, err);
        // Fall back to filtering cached questions
        return questions.filter((q) => q.category === category);
      }
    },
    [questions]
  );

  const getQuestionsWithFilters = useCallback(
    async (filters: {
      domains?: TCODomain[];
      difficulties?: Difficulty[];
      categories?: QuestionCategory[];
      tags?: string[];
      limit?: number;
    }) => {
      try {
        return await fetchQuestionsWithFilters(filters);
      } catch (err) {
        console.error("Failed to fetch filtered questions:", err);
        // Fall back to filtering cached questions
        let filtered = [...questions];

        if (filters.domains && filters.domains.length > 0) {
          filtered = filtered.filter((q) => filters.domains!.includes(q.domain));
        }

        if (filters.difficulties && filters.difficulties.length > 0) {
          filtered = filtered.filter((q) => filters.difficulties!.includes(q.difficulty));
        }

        if (filters.categories && filters.categories.length > 0) {
          filtered = filtered.filter((q) => filters.categories!.includes(q.category));
        }

        if (filters.tags && filters.tags.length > 0) {
          filtered = filtered.filter(
            (q) => q.tags && filters.tags!.some((tag) => q.tags!.includes(tag))
          );
        }

        if (filters.limit) {
          filtered = filtered.slice(0, filters.limit);
        }

        return filtered;
      }
    },
    [questions]
  );

  const searchQuestionsByText = useCallback(
    async (searchText: string) => {
      try {
        return await searchQuestions(searchText);
      } catch (err) {
        console.error(`Failed to search questions for "${searchText}":`, err);
        // Fall back to searching cached questions
        const lowerSearch = searchText.toLowerCase();
        return questions.filter(
          (q) =>
            q.question.toLowerCase().includes(lowerSearch) ||
            q.explanation?.toLowerCase().includes(lowerSearch)
        );
      }
    },
    [questions]
  );

  const getRandomQuestions = useCallback(
    (
      count: number,
      filters?: {
        domains?: TCODomain[];
        difficulties?: Difficulty[];
        categories?: QuestionCategory[];
      }
    ): Question[] => {
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return [];
      }

      let pool = [...questions];

      // Apply filters if provided
      if (filters) {
        if (filters.domains && filters.domains.length > 0) {
          pool = pool.filter((q) => filters.domains!.includes(q.domain));
        }

        if (filters.difficulties && filters.difficulties.length > 0) {
          pool = pool.filter((q) => filters.difficulties!.includes(q.difficulty));
        }

        if (filters.categories && filters.categories.length > 0) {
          pool = pool.filter((q) => filters.categories!.includes(q.category));
        }
      }

      // Shuffle and take requested count
      const shuffled = pool.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    },
    [questions]
  );

  const getAssessmentQuestions = useCallback(
    async (config: {
      type: string;
      moduleId?: string;
      domainFilter?: TCODomain;
      count: number;
    }) => {
      try {
        // Start with all questions
        let assessmentQuestions = [...questions];

        // Apply domain filter if provided
        if (config.domainFilter) {
          assessmentQuestions = assessmentQuestions.filter((q) => q.domain === config.domainFilter);
        }

        // Apply module-specific filtering if moduleId is provided
        if (config.moduleId) {
          // Filter questions based on module ID (could be in tags or custom property)
          assessmentQuestions = assessmentQuestions.filter(
            (q) =>
              q.tags?.includes(config.moduleId!) || q.tags?.includes(`module-${config.moduleId}`)
          );
        }

        // For different assessment types, apply different strategies
        switch (config.type) {
          case "practice":
            // Mix of difficulties for practice
            assessmentQuestions = assessmentQuestions.sort(() => Math.random() - 0.5);
            break;
          case "mock_exam":
            // Balanced distribution for mock exams
            const difficulties = [
              Difficulty.BEGINNER,
              Difficulty.INTERMEDIATE,
              Difficulty.ADVANCED,
            ];
            const questionsPerDifficulty = Math.ceil(config.count / difficulties.length);
            let balancedQuestions: Question[] = [];

            difficulties.forEach((difficulty) => {
              const difficultyQuestions = assessmentQuestions
                .filter((q) => q.difficulty === difficulty)
                .sort(() => Math.random() - 0.5)
                .slice(0, questionsPerDifficulty);
              balancedQuestions = balancedQuestions.concat(difficultyQuestions);
            });

            assessmentQuestions = balancedQuestions.sort(() => Math.random() - 0.5);
            break;
          case "final_exam":
            // More advanced questions for final exam
            assessmentQuestions = assessmentQuestions
              .filter(
                (q) =>
                  q.difficulty === Difficulty.INTERMEDIATE || q.difficulty === Difficulty.ADVANCED
              )
              .sort(() => Math.random() - 0.5);
            break;
          default:
            // Default random selection
            assessmentQuestions = assessmentQuestions.sort(() => Math.random() - 0.5);
        }

        // Return the requested number of questions
        return assessmentQuestions.slice(0, config.count);
      } catch (err) {
        console.error("Failed to get assessment questions:", err);
        // Fallback to random selection
        return getRandomQuestions(
          config.count,
          config.domainFilter ? { domains: [config.domainFilter] } : undefined
        );
      }
    },
    [questions, getRandomQuestions]
  );

  const getQuestionById = useCallback(
    (id: string): Question | undefined => {
      return questions.find((q) => q.id === id);
    },
    [questions]
  );

  // Calculate distributions
  const domainDistribution = React.useMemo(() => {
    const dist: Record<TCODomain, number> = {
      [TCODomain.ASKING_QUESTIONS]: 0,
      [TCODomain.REFINING_QUESTIONS]: 0,
      [TCODomain.REFINING_TARGETING]: 0,
      [TCODomain.TAKING_ACTION]: 0,
      [TCODomain.NAVIGATION_MODULES]: 0,
      [TCODomain.REPORTING_EXPORT]: 0,
      [TCODomain.SECURITY]: 0,
      [TCODomain.FUNDAMENTALS]: 0,
      [TCODomain.TROUBLESHOOTING]: 0,
    };

    if (questions && Array.isArray(questions)) {
      questions.forEach((q) => {
        if (q.domain in dist) {
          dist[q.domain]++;
        }
      });
    }

    return dist;
  }, [questions]);

  const difficultyDistribution = React.useMemo(() => {
    const dist: Record<Difficulty, number> = defaultDifficultyRecord(() => 0);

    if (questions && Array.isArray(questions)) {
      questions.forEach((q) => {
        if (q.difficulty in dist) {
          dist[q.difficulty]++;
        }
      });
    }

    return dist;
  }, [questions]);

  const categoryDistribution = React.useMemo(() => {
    const dist: Record<QuestionCategory, number> = {
      [QuestionCategory.PLATFORM_FUNDAMENTALS]: 0,
      [QuestionCategory.CONSOLE_PROCEDURES]: 0,
      [QuestionCategory.TROUBLESHOOTING]: 0,
      [QuestionCategory.PRACTICAL_SCENARIOS]: 0,
      [QuestionCategory.LINEAR_CHAIN]: 0,
    };

    if (questions && Array.isArray(questions)) {
      questions.forEach((q) => {
        if (q.category in dist) {
          dist[q.category]++;
        }
      });
    }

    return dist;
  }, [questions]);

  const value: QuestionsContextType = {
    questions,
    loading,
    error,
    totalQuestions: questions ? questions.length : 0,
    refreshQuestions,
    getQuestionsByDomain,
    getQuestionsByDifficulty,
    getQuestionsByCategory,
    getQuestionsWithFilters,
    searchQuestionsByText,
    getAssessmentQuestions,
    getRandomQuestions,
    getQuestionById,
    domainDistribution,
    difficultyDistribution,
    categoryDistribution,
  };

  return <QuestionsContext.Provider value={value}>{children}</QuestionsContext.Provider>;
}

export function useQuestions() {
  const context = useContext(QuestionsContext);
  if (!context) {
    throw new Error("useQuestions must be used within a QuestionsProvider");
  }
  return context;
}
