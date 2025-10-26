/**
 * Module 3 Assessment Engine
 * Enhanced assessment system for the expanded 9-section structure
 */

import {
  Module3Section,
  MODULE_3_SECTIONS,
  getSectionCoverage
} from "@/lib/module3-section-definitions";
import type { Question, TCODomain } from "@/types/exam";

/**
 * Module 3 specific assessment configuration
 */
export interface Module3AssessmentConfig {
  sectionWeights?: Partial<Record<Module3Section, number>>;
  passingThreshold?: number;
  requireAllSections?: boolean;
  adaptiveScoring?: boolean;
  penalizeGaps?: boolean;
}

/**
 * Assessment result for a specific section
 */
export interface SectionAssessmentResult {
  sectionId: Module3Section;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
  timeSpent: number;
  score: number;
  passed: boolean;
  objectivesMet: string[];
  objectivesMissed: string[];
  recommendations: string[];
}

/**
 * Complete Module 3 assessment result
 */
export interface Module3AssessmentResult {
  overallScore: number;
  overallAccuracy: number;
  totalTimeSpent: number;
  passed: boolean;
  sectionResults: Record<Module3Section, SectionAssessmentResult>;
  strengths: Module3Section[];
  weaknesses: Module3Section[];
  gapsIdentified: Module3Section[];
  recommendations: {
    priorityAreas: Module3Section[];
    suggestedStudyTime: number;
    nextSteps: string[];
  };
  certificationReadiness: {
    score: number;
    areas: Record<Module3Section, "strong" | "adequate" | "needs_improvement">;
    overallReadiness: "ready" | "almost_ready" | "needs_work";
  };
}

/**
 * Enhanced Module 3 Assessment Engine
 */
export class Module3AssessmentEngine {
  private static readonly DEFAULT_SECTION_WEIGHTS: Record<Module3Section, number> = {
    [Module3Section.PACKAGE_VALIDATION]: 0.12,
    [Module3Section.DEPLOYMENT_STRATEGIES]: 0.18,
    [Module3Section.ERROR_HANDLING]: 0.15,
    [Module3Section.ROLLBACK_PROCEDURES]: 0.10,
    [Module3Section.PERFORMANCE_MONITORING]: 0.15,
    [Module3Section.SECURITY_CONSIDERATIONS]: 0.12,
    [Module3Section.BATCH_OPERATIONS]: 0.08,
    [Module3Section.SCHEDULING_AUTOMATION]: 0.08,
    [Module3Section.DEPENDENCY_MANAGEMENT]: 0.02
  };

  private static readonly PASSING_THRESHOLDS: Record<Module3Section, number> = {
    [Module3Section.PACKAGE_VALIDATION]: 0.75,
    [Module3Section.DEPLOYMENT_STRATEGIES]: 0.80,
    [Module3Section.ERROR_HANDLING]: 0.85,
    [Module3Section.ROLLBACK_PROCEDURES]: 0.80,
    [Module3Section.PERFORMANCE_MONITORING]: 0.75,
    [Module3Section.SECURITY_CONSIDERATIONS]: 0.85,
    [Module3Section.BATCH_OPERATIONS]: 0.70,
    [Module3Section.SCHEDULING_AUTOMATION]: 0.75,
    [Module3Section.DEPENDENCY_MANAGEMENT]: 0.75
  };

  /**
   * Assess a complete Module 3 session
   */
  static assessModule3Session(
    sessionData: {
      responses: Array<{
        questionId: string;
        sectionId: Module3Section;
        correct: boolean;
        timeSpent: number;
        objectiveIds: string[];
      }>;
      totalTimeSpent: number;
    },
    config: Module3AssessmentConfig = {}
  ): Module3AssessmentResult {
    const {
      sectionWeights = this.DEFAULT_SECTION_WEIGHTS,
      passingThreshold = 0.75,
      requireAllSections = false,
      adaptiveScoring = true,
      penalizeGaps = true
    } = config;

    // Group responses by section
    const responsesBySection = this.groupResponsesBySection(sessionData.responses);

    // Calculate section results
    const sectionResults: Partial<Record<Module3Section, SectionAssessmentResult>> = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    Object.entries(responsesBySection).forEach(([sectionId, responses]) => {
      const section = sectionId as Module3Section;
      const result = this.assessSection(section, responses, config);
      sectionResults[section] = result;

      const weight = sectionWeights[section] || this.DEFAULT_SECTION_WEIGHTS[section];
      totalWeightedScore += result.score * weight;
      totalWeight += weight;
    });

    // Handle sections with no responses (gaps)
    const attemptedSections = new Set(Object.keys(responsesBySection) as Module3Section[]);
    const gapsIdentified = Object.keys(MODULE_3_SECTIONS)
      .filter(sectionId => !attemptedSections.has(sectionId as Module3Section))
      .map(sectionId => sectionId as Module3Section);

    // Apply gap penalty if enabled
    if (penalizeGaps && gapsIdentified.length > 0) {
      const gapPenalty = gapsIdentified.length * 0.05; // 5% penalty per missing section
      totalWeightedScore = Math.max(0, totalWeightedScore - gapPenalty);
    }

    // Calculate overall metrics
    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    const totalQuestions = sessionData.responses.length;
    const correctAnswers = sessionData.responses.filter(r => r.correct).length;
    const overallAccuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;

    // Determine pass/fail
    const passed = this.determineOverallPass(
      sectionResults as Record<Module3Section, SectionAssessmentResult>,
      overallScore,
      passingThreshold,
      requireAllSections
    );

    // Identify strengths and weaknesses
    const { strengths, weaknesses } = this.analyzeStrengthsAndWeaknesses(
      sectionResults as Record<Module3Section, SectionAssessmentResult>
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      sectionResults as Record<Module3Section, SectionAssessmentResult>,
      gapsIdentified,
      overallScore
    );

    // Assess certification readiness
    const certificationReadiness = this.assessCertificationReadiness(
      sectionResults as Record<Module3Section, SectionAssessmentResult>,
      overallScore
    );

    return {
      overallScore,
      overallAccuracy,
      totalTimeSpent: sessionData.totalTimeSpent,
      passed,
      sectionResults: sectionResults as Record<Module3Section, SectionAssessmentResult>,
      strengths,
      weaknesses,
      gapsIdentified,
      recommendations,
      certificationReadiness
    };
  }

  /**
   * Assess performance in a specific section
   */
  private static assessSection(
    sectionId: Module3Section,
    responses: Array<{
      questionId: string;
      correct: boolean;
      timeSpent: number;
      objectiveIds: string[];
    }>,
    config: Module3AssessmentConfig
  ): SectionAssessmentResult {
    const section = MODULE_3_SECTIONS[sectionId];
    const questionsAttempted = responses.length;
    const questionsCorrect = responses.filter(r => r.correct).length;
    const accuracy = questionsAttempted > 0 ? questionsCorrect / questionsAttempted : 0;
    const timeSpent = responses.reduce((sum, r) => sum + r.timeSpent, 0);

    // Calculate adaptive score
    let score = accuracy;
    if (config.adaptiveScoring) {
      score = this.calculateAdaptiveScore(accuracy, timeSpent, questionsAttempted, section);
    }

    // Determine pass/fail for section
    const threshold = this.PASSING_THRESHOLDS[sectionId];
    const passed = score >= threshold;

    // Analyze learning objectives
    const allObjectiveIds = responses.flatMap(r => r.objectiveIds);
    const correctObjectiveIds = responses
      .filter(r => r.correct)
      .flatMap(r => r.objectiveIds);

    const objectivesMet = [...new Set(correctObjectiveIds)];
    const objectivesMissed = section.learningObjectives
      .map(obj => obj.split(":")[0])
      .filter(objId => !objectivesMet.includes(objId));

    // Generate section-specific recommendations
    const recommendations = this.generateSectionRecommendations(
      sectionId,
      accuracy,
      objectivesMissed,
      timeSpent,
      questionsAttempted
    );

    return {
      sectionId,
      questionsAttempted,
      questionsCorrect,
      accuracy,
      timeSpent,
      score,
      passed,
      objectivesMet,
      objectivesMissed,
      recommendations
    };
  }

  /**
   * Calculate adaptive score based on performance and context
   */
  private static calculateAdaptiveScore(
    accuracy: number,
    timeSpent: number,
    questionCount: number,
    section: any
  ): number {
    let adaptiveScore = accuracy;

    // Time efficiency bonus/penalty
    const expectedTimePerQuestion = 90; // 1.5 minutes
    const actualTimePerQuestion = questionCount > 0 ? timeSpent / questionCount : 0;
    const timeRatio = expectedTimePerQuestion / Math.max(actualTimePerQuestion, 30);

    if (timeRatio > 1.2) {
      // Completed faster than expected with good accuracy
      adaptiveScore += 0.05;
    } else if (timeRatio < 0.8) {
      // Took longer than expected
      adaptiveScore -= 0.02;
    }

    // Difficulty adjustment
    if (section.difficulty === "Advanced") {
      adaptiveScore += 0.03; // Bonus for advanced sections
    } else if (section.difficulty === "Beginner") {
      adaptiveScore -= 0.01; // Slight penalty for beginner sections
    }

    // Question coverage bonus
    const targetQuestions = section.questionTargetCount;
    if (questionCount >= targetQuestions * 0.8) {
      adaptiveScore += 0.02; // Bonus for comprehensive coverage
    }

    return Math.min(1.0, Math.max(0.0, adaptiveScore));
  }

  /**
   * Group responses by section
   */
  private static groupResponsesBySection(
    responses: Array<{
      questionId: string;
      sectionId: Module3Section;
      correct: boolean;
      timeSpent: number;
      objectiveIds: string[];
    }>
  ): Record<string, Array<{
    questionId: string;
    correct: boolean;
    timeSpent: number;
    objectiveIds: string[];
  }>> {
    const grouped: Record<string, any[]> = {};

    responses.forEach(response => {
      const { sectionId, ...responseData } = response;
      if (!grouped[sectionId]) {
        grouped[sectionId] = [];
      }
      grouped[sectionId].push(responseData);
    });

    return grouped;
  }

  /**
   * Determine overall pass/fail status
   */
  private static determineOverallPass(
    sectionResults: Record<Module3Section, SectionAssessmentResult>,
    overallScore: number,
    passingThreshold: number,
    requireAllSections: boolean
  ): boolean {
    if (overallScore < passingThreshold) {
      return false;
    }

    if (requireAllSections) {
      return Object.values(sectionResults).every(result => result.passed);
    }

    // At least 70% of attempted sections must pass
    const attemptedSections = Object.values(sectionResults);
    const passedSections = attemptedSections.filter(result => result.passed);
    return passedSections.length >= attemptedSections.length * 0.7;
  }

  /**
   * Analyze strengths and weaknesses
   */
  private static analyzeStrengthsAndWeaknesses(
    sectionResults: Record<Module3Section, SectionAssessmentResult>
  ): { strengths: Module3Section[]; weaknesses: Module3Section[] } {
    const sections = Object.entries(sectionResults);

    const strengths = sections
      .filter(([_, result]) => result.score >= 0.85)
      .map(([sectionId]) => sectionId as Module3Section);

    const weaknesses = sections
      .filter(([_, result]) => result.score < 0.65)
      .map(([sectionId]) => sectionId as Module3Section);

    return { strengths, weaknesses };
  }

  /**
   * Generate comprehensive recommendations
   */
  private static generateRecommendations(
    sectionResults: Record<Module3Section, SectionAssessmentResult>,
    gapsIdentified: Module3Section[],
    overallScore: number
  ): Module3AssessmentResult["recommendations"] {
    const priorityAreas: Module3Section[] = [];
    const nextSteps: string[] = [];

    // Add gaps as highest priority
    priorityAreas.push(...gapsIdentified);

    // Add weak sections
    Object.entries(sectionResults).forEach(([sectionId, result]) => {
      if (result.score < 0.65) {
        priorityAreas.push(sectionId as Module3Section);
      }
    });

    // Calculate suggested study time
    let suggestedStudyTime = 0;
    priorityAreas.forEach(sectionId => {
      const section = MODULE_3_SECTIONS[sectionId];
      suggestedStudyTime += section.estimatedTime * 2; // Double the base time for review
    });

    // Generate next steps
    if (overallScore >= 0.85) {
      nextSteps.push("Focus on maintaining strong performance");
      nextSteps.push("Consider advanced practice scenarios");
    } else if (overallScore >= 0.75) {
      nextSteps.push("Review weak areas identified above");
      nextSteps.push("Practice with similar questions");
    } else {
      nextSteps.push("Comprehensive review of fundamentals needed");
      nextSteps.push("Focus on understanding core concepts");
      nextSteps.push("Seek additional study resources");
    }

    return {
      priorityAreas: priorityAreas.slice(0, 3), // Top 3 priorities
      suggestedStudyTime,
      nextSteps
    };
  }

  /**
   * Generate section-specific recommendations
   */
  private static generateSectionRecommendations(
    sectionId: Module3Section,
    accuracy: number,
    objectivesMissed: string[],
    timeSpent: number,
    questionCount: number
  ): string[] {
    const recommendations: string[] = [];
    const section = MODULE_3_SECTIONS[sectionId];

    if (accuracy < 0.6) {
      recommendations.push(`Review fundamental concepts in ${section.title}`);
      recommendations.push("Practice with easier questions first");
    } else if (accuracy < 0.8) {
      recommendations.push(`Focus on specific learning objectives: ${objectivesMissed.join(", ")}`);
      recommendations.push("Practice with similar question types");
    }

    if (timeSpent / questionCount > 120) { // More than 2 minutes per question
      recommendations.push("Work on improving response time");
      recommendations.push("Practice time management strategies");
    }

    if (objectivesMissed.length > 0) {
      recommendations.push(`Study these specific objectives: ${objectivesMissed.join(", ")}`);
    }

    return recommendations;
  }

  /**
   * Assess certification readiness
   */
  private static assessCertificationReadiness(
    sectionResults: Record<Module3Section, SectionAssessmentResult>,
    overallScore: number
  ): Module3AssessmentResult["certificationReadiness"] {
    const areas: Record<Module3Section, "strong" | "adequate" | "needs_improvement"> =
      {} as Record<Module3Section, "strong" | "adequate" | "needs_improvement">;

    Object.entries(sectionResults).forEach(([sectionId, result]) => {
      if (result.score >= 0.85) {
        areas[sectionId as Module3Section] = "strong";
      } else if (result.score >= 0.70) {
        areas[sectionId as Module3Section] = "adequate";
      } else {
        areas[sectionId as Module3Section] = "needs_improvement";
      }
    });

    let overallReadiness: "ready" | "almost_ready" | "needs_work";
    if (overallScore >= 0.85) {
      overallReadiness = "ready";
    } else if (overallScore >= 0.75) {
      overallReadiness = "almost_ready";
    } else {
      overallReadiness = "needs_work";
    }

    return {
      score: Math.round(overallScore * 100),
      areas,
      overallReadiness
    };
  }
}