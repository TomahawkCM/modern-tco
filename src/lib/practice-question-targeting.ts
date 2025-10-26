/**
 * Practice Question Targeting System (Phase 6.1)
 * Handles targeted question filtering, safe fallbacks, and domain distribution
 */

import {
  type Difficulty,
  TCODomain,
  TCO_DOMAIN_WEIGHTS,
  type PracticeTargeting,
  type Question,
  type QuestionFilter,
  type QuestionPool,
} from "@/types/exam";
import { defaultDifficultyRecord } from './difficulty';

/**
 * Core question targeting and filtering utilities
 */
export class PracticeQuestionTargeting {
  /**
   * Get targeted questions for a specific module with safe fallbacks
   */
  static getTargetedQuestions(
    allQuestions: Question[],
    targeting: PracticeTargeting
  ): QuestionPool {
    // Stage 1: Exact targeting (ideal case)
    let pool = this.applyExactTargeting(allQuestions, targeting);

    // Stage 2: Check if we have minimum questions
    if (pool.questions.length >= targeting.minQuestions) {
      return this.buildQuestionPool(pool.questions, "exact-match");
    }

    // Stage 3: Apply fallback strategies
    switch (targeting.fallbackStrategy) {
      case "expand-domain":
        pool = this.expandToDomain(allQuestions, targeting);
        break;

      case "reduce-specificity":
        pool = this.reduceSpecificity(allQuestions, targeting);
        break;

      case "mixed-content":
        pool = this.getMixedContent(allQuestions, targeting);
        break;
    }

    // Stage 4: Final validation and pool construction
    const finalPool = this.buildQuestionPool(pool.questions, pool.fallbackUsed);

    return finalPool;
  }

  /**
   * Apply exact targeting criteria (Stage 1)
   */
  private static applyExactTargeting(
    questions: Question[],
    targeting: PracticeTargeting
  ): { questions: Question[]; fallbackUsed?: string } {
    let filtered = questions.filter((question) => {
      // Primary domain match
      if (question.domain !== targeting.primaryDomain) {
        return false;
      }

      // Module ID match (if available)
      if (targeting.moduleId && question.moduleId && question.moduleId !== targeting.moduleId) {
        return false;
      }

      // Required tags match
      if (targeting.requiredTags.length > 0) {
        const questionTags = question.tags || [];
        const hasRequiredTags = targeting.requiredTags.every((tag) => questionTags.includes(tag));
        if (!hasRequiredTags) {
          return false;
        }
      }

      // Objective match (if available)
      if (targeting.targetObjectives.length > 0 && question.objectiveIds) {
        const hasTargetObjective = targeting.targetObjectives.some((objective) =>
          question.objectiveIds!.includes(objective)
        );
        if (!hasTargetObjective) {
          return false;
        }
      }

      return true;
    });

    // Shuffle for variety
    filtered = this.shuffleArray([...filtered]);

    // Limit to ideal count if we have enough
    if (filtered.length > targeting.idealQuestions) {
      filtered = filtered.slice(0, targeting.idealQuestions);
    }

    return { questions: filtered };
  }

  /**
   * Expand to domain-level questions (Fallback Strategy 1)
   */
  private static expandToDomain(
    questions: Question[],
    targeting: PracticeTargeting
  ): { questions: Question[]; fallbackUsed: string } {
    let domainQuestions = questions.filter((q) => q.domain === targeting.primaryDomain);

    // Prefer questions with optional tags
    if (targeting.optionalTags.length > 0) {
      const withOptionalTags = domainQuestions.filter((q) => {
        const questionTags = q.tags || [];
        return targeting.optionalTags.some((tag) => questionTags.includes(tag));
      });

      if (withOptionalTags.length > 0) {
        domainQuestions = withOptionalTags;
      }
    }

    domainQuestions = this.shuffleArray(domainQuestions);

    return {
      questions: domainQuestions.slice(0, targeting.idealQuestions),
      fallbackUsed: "expand-domain",
    };
  }

  /**
   * Reduce specificity gradually (Fallback Strategy 2)
   */
  private static reduceSpecificity(
    questions: Question[],
    targeting: PracticeTargeting
  ): { questions: Question[]; fallbackUsed: string } {
    // Step 1: Drop objective requirements but keep domain + required tags
    let filtered = questions.filter((question) => {
      if (question.domain !== targeting.primaryDomain) return false;

      if (targeting.requiredTags.length > 0) {
        const questionTags = question.tags || [];
        return targeting.requiredTags.every((tag) => questionTags.includes(tag));
      }

      return true;
    });

    if (filtered.length >= targeting.minQuestions) {
      return {
        questions: this.shuffleArray(filtered).slice(0, targeting.idealQuestions),
        fallbackUsed: "reduced-specificity-objectives",
      };
    }

    // Step 2: Keep domain, drop some required tags
    if (targeting.requiredTags.length > 1) {
      const partialTags = targeting.requiredTags.slice(
        0,
        Math.ceil(targeting.requiredTags.length / 2)
      );

      filtered = questions.filter((question) => {
        if (question.domain !== targeting.primaryDomain) return false;

        const questionTags = question.tags || [];
        return partialTags.some((tag) => questionTags.includes(tag));
      });

      if (filtered.length >= targeting.minQuestions) {
        return {
          questions: this.shuffleArray(filtered).slice(0, targeting.idealQuestions),
          fallbackUsed: "reduced-specificity-tags",
        };
      }
    }

    // Step 3: Domain only
    filtered = questions.filter((q) => q.domain === targeting.primaryDomain);

    return {
      questions: this.shuffleArray(filtered).slice(0, targeting.idealQuestions),
      fallbackUsed: "reduced-specificity-domain-only",
    };
  }

  /**
   * Get mixed content from multiple domains (Fallback Strategy 3)
   */
  private static getMixedContent(
    questions: Question[],
    targeting: PracticeTargeting
  ): { questions: Question[]; fallbackUsed: string } {
    const primaryDomainQuestions = questions.filter((q) => q.domain === targeting.primaryDomain);

    // Get questions from related domains based on TCO weights
    const relatedDomains = Object.entries(TCO_DOMAIN_WEIGHTS)
      .filter(([domain]) => domain !== targeting.primaryDomain)
      .sort(([, weightA], [, weightB]) => weightB - weightA) // Sort by weight descending
      .slice(0, 2) // Top 2 related domains
      .map(([domain]) => domain as TCODomain);

    const relatedQuestions = questions.filter((q) => relatedDomains.includes(q.domain));

    // Distribute questions: 70% primary domain, 30% related
    const primaryCount = Math.ceil(targeting.idealQuestions * 0.7);
    const relatedCount = targeting.idealQuestions - primaryCount;

    const selectedPrimary = this.shuffleArray(primaryDomainQuestions).slice(0, primaryCount);
    const selectedRelated = this.shuffleArray(relatedQuestions).slice(0, relatedCount);

    const mixedQuestions = this.shuffleArray([...selectedPrimary, ...selectedRelated]);

    return {
      questions: mixedQuestions,
      fallbackUsed: "mixed-content",
    };
  }

  /**
   * Build comprehensive question pool with metadata
   */
  private static buildQuestionPool(questions: Question[], fallbackUsed?: string): QuestionPool {
    const domainValues = Object.values(TCODomain) as TCODomain[];
    const domainDistribution: Record<TCODomain, number> = domainValues.reduce(
      (acc, d) => {
        acc[d] = 0;
        return acc;
      },
      {} as Record<TCODomain, number>
    );

    const difficultyDistribution: Record<Difficulty, number> =
      defaultDifficultyRecord(() => 0);

    questions.forEach((question) => {
      domainDistribution[question.domain]++;
      difficultyDistribution[question.difficulty]++;
    });

    const isEmpty = questions.length === 0;
    const hasMinimumQuestions = questions.length >= 5; // Configurable minimum

    // Determine fallback recommendation
    let recommendedFallback: QuestionPool["recommendedFallback"];
    if (isEmpty) {
      recommendedFallback = "mixed-content";
    } else if (!hasMinimumQuestions) {
      recommendedFallback = "expand-criteria";
    } else if (fallbackUsed && fallbackUsed !== "exact-match") {
      recommendedFallback = "use-similar-modules";
    }

    return {
      questions,
      totalCount: questions.length,
      domainDistribution,
      difficultyDistribution,
      isEmpty,
      hasMinimumQuestions,
      recommendedFallback,
    };
  }

  /**
   * Apply general question filters (for QuestionsContext integration)
   */
  static applyQuestionFilter(questions: Question[], filter: QuestionFilter): Question[] {
    let filtered = [...questions];

    // Domain filtering
    if (filter.domains && filter.domains.length > 0) {
      filtered = filtered.filter((q) => filter.domains!.includes(q.domain));
    }

    // Difficulty filtering
    if (filter.difficulties && filter.difficulties.length > 0) {
      filtered = filtered.filter((q) => filter.difficulties!.includes(q.difficulty));
    }

    // Category filtering
    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter((q) => filter.categories!.includes(q.category));
    }

    // Tag filtering
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((q) => {
        const questionTags = q.tags || [];
        return filter.tags!.some((tag) => questionTags.includes(tag));
      });
    }

    // Module filtering
    if (filter.moduleIds && filter.moduleIds.length > 0) {
      filtered = filtered.filter((q) => q.moduleId && filter.moduleIds!.includes(q.moduleId));
    }

    // Objective filtering
    if (filter.objectiveIds && filter.objectiveIds.length > 0) {
      filtered = filtered.filter((q) => {
        if (!q.objectiveIds) return false;
        return filter.objectiveIds!.some((objective) => q.objectiveIds!.includes(objective));
      });
    }

    // Concept level filtering
    if (filter.conceptLevels && filter.conceptLevels.length > 0) {
      filtered = filtered.filter(
        (q) => q.conceptLevel && filter.conceptLevels!.includes(q.conceptLevel)
      );
    }

    // Maintain domain distribution if requested
    if (filter.maintainDistribution && filter.limit) {
      filtered = this.maintainDomainDistribution(filtered, filter.limit);
    }

    // Apply limit
    if (filter.limit && !filter.maintainDistribution) {
      filtered = this.shuffleArray(filtered).slice(0, filter.limit);
    }

    return filtered;
  }

  /**
   * Maintain proportional domain distribution when limiting questions
   */
  private static maintainDomainDistribution(
    questions: Question[],
    targetCount: number
  ): Question[] {
    if (questions.length <= targetCount) {
      return this.shuffleArray(questions);
    }

    const domainValues = Object.values(TCODomain) as TCODomain[];
    const domainGroups: Record<TCODomain, Question[]> = domainValues.reduce((acc, d) => {
      acc[d] = [];
      return acc;
    }, {} as Record<TCODomain, Question[]>);

    // Group questions by domain
    questions.forEach((q) => {
      domainGroups[q.domain].push(q);
    });

    const result: Question[] = [];
    const domains = Object.keys(domainGroups) as TCODomain[];

    // Calculate questions per domain based on TCO weights
    domains.forEach((domain) => {
      const domainQuestions = domainGroups[domain];
      if (domainQuestions.length === 0) return;

      const weight = TCO_DOMAIN_WEIGHTS[domain] / 100;
      const targetForDomain = Math.round(targetCount * weight);
      const availableForDomain = Math.min(targetForDomain, domainQuestions.length);

      const selectedFromDomain = this.shuffleArray(domainQuestions).slice(0, availableForDomain);

      result.push(...selectedFromDomain);
    });

    // If we're short, fill from largest available pools
    while (result.length < targetCount) {
      const remainingNeeded = targetCount - result.length;
      const availableQuestions = questions.filter((q) => !result.includes(q));

      if (availableQuestions.length === 0) break;

      const shuffled = this.shuffleArray(availableQuestions);
      result.push(...shuffled.slice(0, remainingNeeded));
    }

    return this.shuffleArray(result).slice(0, targetCount);
  }

  /**
   * Utility: Shuffle array using Fisher-Yates algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Create practice targeting configuration for a module
 */
export function createPracticeTargeting(
  moduleId: string,
  domain: TCODomain,
  objectives: string[],
  options?: {
    requiredTags?: string[];
    optionalTags?: string[];
    minQuestions?: number;
    idealQuestions?: number;
    fallbackStrategy?: PracticeTargeting["fallbackStrategy"];
  }
): PracticeTargeting {
  return {
    moduleId,
    primaryDomain: domain,
    targetObjectives: objectives,
    requiredTags: options?.requiredTags || [],
    optionalTags: options?.optionalTags || [],
    minQuestions: options?.minQuestions || 5,
    idealQuestions: options?.idealQuestions || 15,
    fallbackStrategy: options?.fallbackStrategy || "expand-domain",
  };
}

// Bind static method to preserve `this` context when imported as a standalone function
export const getTargetedQuestions = PracticeQuestionTargeting.getTargetedQuestions.bind(
  PracticeQuestionTargeting
);
export default PracticeQuestionTargeting;
