/**
 * Module 3 Practice Integration
 * Extends practice question targeting for the expanded 9-section structure
 */

import {
  Module3Section,
  MODULE_3_SECTIONS,
  createSectionPracticeTargeting,
  type SectionMetadata
} from "@/lib/module3-section-definitions";
import { PracticeQuestionTargeting } from "@/lib/practice-question-targeting";
import { TCODomain, type Question, type PracticeTargeting } from "@/types/exam";

/**
 * Enhanced practice targeting for Module 3 sections
 */
export interface Module3PracticeConfig {
  sectionId: Module3Section;
  includePrerequisites?: boolean;
  includeRelatedSections?: boolean;
  adaptiveDifficulty?: boolean;
  focusOnGaps?: boolean;
}

/**
 * Get targeted questions for a specific Module 3 section
 */
export function getModule3SectionQuestions(
  allQuestions: Question[],
  sectionId: Module3Section,
  config?: Module3PracticeConfig
): Question[] {
  const section = MODULE_3_SECTIONS[sectionId];
  if (!section) {
    console.warn(`Invalid section ID: ${sectionId}`);
    return [];
  }

  // Start with base targeting for the section
  const targeting = createSectionPracticeTargeting(sectionId);

  // Include prerequisites if requested
  if (config?.includePrerequisites && section.prerequisites) {
    const prereqTags = section.prerequisites.map(
      prereqId => MODULE_3_SECTIONS[prereqId].primaryTag
    );
    targeting.optionalTags = [...targeting.optionalTags, ...prereqTags];
  }

  // Include related sections if requested
  if (config?.includeRelatedSections) {
    const relatedSections = getRelatedSections(sectionId);
    const relatedTags = relatedSections.map(s => s.primaryTag);
    targeting.optionalTags = [...targeting.optionalTags, ...relatedTags];
  }

  // Get questions using the targeting system
  const pool = PracticeQuestionTargeting.getTargetedQuestions(allQuestions, targeting);

  // Apply adaptive difficulty if requested
  if (config?.adaptiveDifficulty) {
    return applyAdaptiveDifficulty(pool.questions, section.difficulty);
  }

  return pool.questions;
}

/**
 * Get related sections based on content similarity
 */
function getRelatedSections(sectionId: Module3Section): SectionMetadata[] {
  const relatedMap: Record<Module3Section, Module3Section[]> = {
    [Module3Section.PACKAGE_VALIDATION]: [
      Module3Section.DEPENDENCY_MANAGEMENT,
      Module3Section.ERROR_HANDLING
    ],
    [Module3Section.DEPLOYMENT_STRATEGIES]: [
      Module3Section.SCHEDULING_AUTOMATION,
      Module3Section.BATCH_OPERATIONS
    ],
    [Module3Section.ERROR_HANDLING]: [
      Module3Section.ROLLBACK_PROCEDURES,
      Module3Section.PACKAGE_VALIDATION
    ],
    [Module3Section.ROLLBACK_PROCEDURES]: [
      Module3Section.ERROR_HANDLING,
      Module3Section.PERFORMANCE_MONITORING
    ],
    [Module3Section.PERFORMANCE_MONITORING]: [
      Module3Section.BATCH_OPERATIONS,
      Module3Section.ROLLBACK_PROCEDURES
    ],
    [Module3Section.SECURITY_CONSIDERATIONS]: [
      Module3Section.DEPLOYMENT_STRATEGIES,
      Module3Section.DEPENDENCY_MANAGEMENT
    ],
    [Module3Section.BATCH_OPERATIONS]: [
      Module3Section.PERFORMANCE_MONITORING,
      Module3Section.DEPLOYMENT_STRATEGIES
    ],
    [Module3Section.SCHEDULING_AUTOMATION]: [
      Module3Section.DEPLOYMENT_STRATEGIES,
      Module3Section.BATCH_OPERATIONS
    ],
    [Module3Section.DEPENDENCY_MANAGEMENT]: [
      Module3Section.PACKAGE_VALIDATION,
      Module3Section.SECURITY_CONSIDERATIONS
    ]
  };

  const relatedIds = relatedMap[sectionId] || [];
  return relatedIds.map(id => MODULE_3_SECTIONS[id]);
}

/**
 * Apply adaptive difficulty based on section level
 */
function applyAdaptiveDifficulty(
  questions: Question[],
  baseDifficulty: "Beginner" | "Intermediate" | "Advanced"
): Question[] {
  const difficultyDistribution = {
    Beginner: { beginner: 0.6, intermediate: 0.3, advanced: 0.1 },
    Intermediate: { beginner: 0.2, intermediate: 0.6, advanced: 0.2 },
    Advanced: { beginner: 0.1, intermediate: 0.3, advanced: 0.6 }
  };

  const distribution = difficultyDistribution[baseDifficulty];
  const totalQuestions = questions.length;

  // Group questions by difficulty
  const byDifficulty = {
    beginner: questions.filter(q => q.difficulty === "Beginner"),
    intermediate: questions.filter(q => q.difficulty === "Intermediate"),
    advanced: questions.filter(q => q.difficulty === "Advanced")
  };

  // Calculate target counts
  const targets = {
    beginner: Math.floor(totalQuestions * distribution.beginner),
    intermediate: Math.floor(totalQuestions * distribution.intermediate),
    advanced: Math.ceil(totalQuestions * distribution.advanced)
  };

  // Select questions based on targets
  const selected: Question[] = [];

  Object.entries(targets).forEach(([difficulty, count]) => {
    const available = byDifficulty[difficulty as keyof typeof byDifficulty];
    const toSelect = Math.min(count, available.length);
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, toSelect));
  });

  // Fill remaining slots if needed
  while (selected.length < totalQuestions && selected.length < questions.length) {
    const remaining = questions.filter(q => !selected.includes(q));
    if (remaining.length === 0) break;
    selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }

  return selected.sort(() => Math.random() - 0.5); // Final shuffle
}

/**
 * Create a comprehensive Module 3 practice session
 */
export interface Module3PracticeSession {
  sections: Module3Section[];
  questionsPerSection: number;
  randomizeOrder: boolean;
  focusOnWeakAreas: boolean;
  timeLimit?: number; // in minutes
}

/**
 * Build a complete Module 3 practice session
 */
export function buildModule3PracticeSession(
  allQuestions: Question[],
  config: Module3PracticeSession
): {
  questions: Question[];
  sectionBreakdown: Record<Module3Section, number>;
  estimatedTime: number;
} {
  const sessionQuestions: Question[] = [];
  const sectionBreakdown: Partial<Record<Module3Section, number>> = {};

  // Process each requested section
  config.sections.forEach(sectionId => {
    const section = MODULE_3_SECTIONS[sectionId];
    if (!section) return;

    // Adjust question count based on gaps if focusing on weak areas
    let targetCount = config.questionsPerSection;
    if (config.focusOnWeakAreas) {
      const gapRatio = 1 - (section.currentQuestionCount / section.questionTargetCount);
      targetCount = Math.ceil(config.questionsPerSection * (1 + gapRatio * 0.5));
    }

    // Get questions for this section
    const sectionQuestions = getModule3SectionQuestions(allQuestions, sectionId, {
      sectionId,
      includeRelatedSections: config.sections.length === 1, // Include related if single section
      adaptiveDifficulty: true
    });

    // Limit to target count
    const selected = sectionQuestions.slice(0, targetCount);
    sessionQuestions.push(...selected);
    sectionBreakdown[sectionId] = selected.length;
  });

  // Randomize order if requested
  if (config.randomizeOrder) {
    sessionQuestions.sort(() => Math.random() - 0.5);
  }

  // Calculate estimated time (1.5 minutes per question average)
  const estimatedTime = Math.ceil(sessionQuestions.length * 1.5);

  return {
    questions: sessionQuestions,
    sectionBreakdown: sectionBreakdown as Record<Module3Section, number>,
    estimatedTime
  };
}

/**
 * Get practice recommendations based on current progress
 */
export function getModule3PracticeRecommendations(
  userProgress: Record<Module3Section, { completed: number; accuracy: number }>
): {
  prioritySections: Module3Section[];
  recommendedSessionType: "focused" | "comprehensive" | "review";
  suggestedDuration: number;
} {
  // Identify weak sections (accuracy < 70% or completion < 50%)
  const weakSections = Object.entries(userProgress)
    .filter(([_, progress]) => progress.accuracy < 0.7 || progress.completed < 0.5)
    .map(([sectionId]) => sectionId as Module3Section);

  // Identify sections with no attempts
  const unattemptedSections = Object.entries(MODULE_3_SECTIONS)
    .filter(([sectionId]) => !userProgress[sectionId as Module3Section])
    .map(([sectionId]) => sectionId as Module3Section);

  let prioritySections: Module3Section[];
  let recommendedSessionType: "focused" | "comprehensive" | "review";
  let suggestedDuration: number;

  if (unattemptedSections.length > 3) {
    // Many unattempted sections - comprehensive learning needed
    prioritySections = unattemptedSections.slice(0, 3);
    recommendedSessionType = "comprehensive";
    suggestedDuration = 45;
  } else if (weakSections.length > 0) {
    // Focus on weak areas
    prioritySections = weakSections.slice(0, 2);
    recommendedSessionType = "focused";
    suggestedDuration = 30;
  } else {
    // General review
    prioritySections = Object.keys(MODULE_3_SECTIONS).slice(0, 3) as Module3Section[];
    recommendedSessionType = "review";
    suggestedDuration = 20;
  }

  return {
    prioritySections,
    recommendedSessionType,
    suggestedDuration
  };
}

/**
 * Create section-aware practice targeting
 */
export function createModule3PracticeTargeting(
  sections: Module3Section[],
  options?: {
    minQuestionsPerSection?: number;
    maxQuestionsPerSection?: number;
    includeCrossSectionQuestions?: boolean;
  }
): PracticeTargeting {
  const allTags: string[] = [];
  const allObjectives: string[] = [];

  sections.forEach(sectionId => {
    const section = MODULE_3_SECTIONS[sectionId];
    if (section) {
      allTags.push(section.primaryTag, ...section.tags);
      allObjectives.push(...section.learningObjectives.map(obj => obj.split(":")[0]));
    }
  });

  // Remove duplicates
  const uniqueTags = [...new Set(allTags)];
  const uniqueObjectives = [...new Set(allObjectives)];

  return {
    moduleId: "module-taking-action",
    primaryDomain: TCODomain.TAKING_ACTION,
    targetObjectives: uniqueObjectives,
    requiredTags: sections.map(s => MODULE_3_SECTIONS[s].primaryTag),
    optionalTags: uniqueTags,
    minQuestions: (options?.minQuestionsPerSection || 5) * sections.length,
    idealQuestions: (options?.maxQuestionsPerSection || 10) * sections.length,
    fallbackStrategy: options?.includeCrossSectionQuestions ? "mixed-content" : "expand-domain"
  };
}