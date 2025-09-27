/**
 * Question Bank Validator for TCO Exam System
 * Validates question bank integrity, distribution, and quality
 */

import {
  type Question,
  TCODomain,
  Difficulty,
  QuestionCategory,
  TCO_DOMAIN_WEIGHTS,
} from "@/types/exam";
import { questionBank, combinedQuestionBankMetadata } from "@/data/sample-questions";

export interface ValidationResult {
  isValid: boolean;
  totalQuestions: number;
  domainDistribution: Record<TCODomain, number>;
  domainPercentages: Record<TCODomain, number>;
  categoryDistribution: Record<QuestionCategory, number>;
  difficultyDistribution: Record<Difficulty, number>;
  issues: ValidationIssue[];
  recommendations: string[];
}

export interface ValidationIssue {
  severity: "error" | "warning" | "info";
  category: "domain" | "quality" | "structure" | "metadata";
  message: string;
  affectedQuestions?: string[];
}

/**
 * Comprehensive validation of the TCO question bank
 */
export function validateQuestionBank(): ValidationResult {
  const issues: ValidationIssue[] = [];
  const recommendations: string[] = [];

  // Basic validation
  const totalQuestions = questionBank.length;

  // Domain distribution analysis
  const domainCounts = Object.values(TCODomain).reduce(
    (acc, domain) => {
      acc[domain] = questionBank.filter((q) => q.domain === domain).length;
      return acc;
    },
    {} as Record<TCODomain, number>
  );

  const domainPercentages = Object.entries(domainCounts).reduce(
    (acc, [domain, count]) => {
      acc[domain as TCODomain] = Math.round((count / totalQuestions) * 100);
      return acc;
    },
    {} as Record<TCODomain, number>
  );

  // Category distribution analysis
  const categoryDistribution = Object.values(QuestionCategory).reduce(
    (acc, category) => {
      acc[category] = questionBank.filter((q) => q.category === category).length;
      return acc;
    },
    {} as Record<QuestionCategory, number>
  );

  // Difficulty distribution analysis
  const difficultyDistribution = Object.values(Difficulty).reduce(
    (acc, difficulty) => {
      acc[difficulty] = questionBank.filter((q) => q.difficulty === difficulty).length;
      return acc;
    },
    {} as Record<Difficulty, number>
  );

  // Validation checks

  // 1. Total question count validation
  if (totalQuestions < 200) {
    issues.push({
      severity: "warning",
      category: "structure",
      message: `Question bank has ${totalQuestions} questions. Target is 200 for comprehensive coverage.`,
    });
    recommendations.push(`Add ${200 - totalQuestions} more questions to reach target coverage`);
  }

  // 2. Domain distribution validation (compared to official exam weights)
  Object.entries(TCO_DOMAIN_WEIGHTS).forEach(([domain, targetWeight]) => {
    const actualPercentage = domainPercentages[domain as TCODomain];
    const difference = Math.abs(actualPercentage - targetWeight);

    if (difference > 5) {
      issues.push({
        severity: difference > 10 ? "error" : "warning",
        category: "domain",
        message: `Domain "${domain}" distribution is ${actualPercentage}%, target is ${targetWeight}% (difference: ${difference}%)`,
      });
    }
  });

  // 3. Question quality validation
  const questionsWithoutExplanations = questionBank.filter(
    (q) => !q.explanation || q.explanation.trim().length === 0
  );
  if (questionsWithoutExplanations.length > 0) {
    issues.push({
      severity: "warning",
      category: "quality",
      message: `${questionsWithoutExplanations.length} questions lack explanations`,
      affectedQuestions: questionsWithoutExplanations.map((q) => q.id),
    });
  }

  const questionsWithoutStudyRef = questionBank.filter((q) => !q.studyGuideRef);
  if (questionsWithoutStudyRef.length > 0) {
    issues.push({
      severity: "info",
      category: "quality",
      message: `${questionsWithoutStudyRef.length} questions lack study guide references`,
      affectedQuestions: questionsWithoutStudyRef.map((q) => q.id),
    });
  }

  // 4. Linear Chain Architecture validation (critical TCO content)
  const linearChainQuestions = questionBank.filter(
    (q) => q.category === QuestionCategory.LINEAR_CHAIN
  );
  if (linearChainQuestions.length < 3) {
    issues.push({
      severity: "error",
      category: "domain",
      message: `Only ${linearChainQuestions.length} Linear Chain Architecture questions found. This is critical TCO content.`,
    });
    recommendations.push(
      "Add more Linear Chain Architecture questions - this is fundamental TCO knowledge"
    );
  }

  // 5. Console procedures validation
  const consoleProcedureQuestions = questionBank.filter(
    (q) => q.category === QuestionCategory.CONSOLE_PROCEDURES
  );
  if (consoleProcedureQuestions.length < 20) {
    issues.push({
      severity: "warning",
      category: "quality",
      message: `Only ${consoleProcedureQuestions.length} console procedure questions. TCO emphasizes hands-on skills.`,
    });
    recommendations.push("Add more console procedure questions with step-by-step validation");
  }

  // 6. Troubleshooting scenarios validation
  const troubleshootingQuestions = questionBank.filter(
    (q) => q.category === QuestionCategory.TROUBLESHOOTING
  );
  if (troubleshootingQuestions.length < 15) {
    issues.push({
      severity: "warning",
      category: "quality",
      message: `Only ${troubleshootingQuestions.length} troubleshooting questions. More diagnostic scenarios needed.`,
    });
    recommendations.push("Add more troubleshooting scenarios with diagnostic procedures");
  }

  // 7. Difficulty distribution validation
  const beginnerPercentage = (difficultyDistribution[Difficulty.BEGINNER] / totalQuestions) * 100;
  const advancedPercentage = (difficultyDistribution[Difficulty.ADVANCED] / totalQuestions) * 100;

  if (beginnerPercentage > 50) {
    issues.push({
      severity: "warning",
      category: "quality",
      message: `${beginnerPercentage.toFixed(1)}% beginner questions. TCO requires intermediate-advanced skills.`,
    });
    recommendations.push("Balance difficulty distribution toward intermediate and advanced levels");
  }

  if (advancedPercentage < 20) {
    issues.push({
      severity: "warning",
      category: "quality",
      message: `Only ${advancedPercentage.toFixed(1)}% advanced questions. TCO tests professional competency.`,
    });
    recommendations.push("Add more advanced scenario questions for operator-level skills");
  }

  // 8. Question ID uniqueness validation
  const questionIds = questionBank.map((q) => q.id);
  const duplicateIds = questionIds.filter((id, index) => questionIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    issues.push({
      severity: "error",
      category: "structure",
      message: `Duplicate question IDs found: ${duplicateIds.join(", ")}`,
    });
  }

  // 9. Choice validation
  questionBank.forEach((question) => {
    if (question.choices.length !== 4) {
      issues.push({
        severity: "error",
        category: "structure",
        message: `Question ${question.id} has ${question.choices.length} choices, expected 4`,
        affectedQuestions: [question.id],
      });
    }

    const correctChoice = question.choices.find((c) => c.id === question.correctAnswerId);
    if (!correctChoice) {
      issues.push({
        severity: "error",
        category: "structure",
        message: `Question ${question.id} has invalid correctAnswerId: ${question.correctAnswerId}`,
        affectedQuestions: [question.id],
      });
    }
  });

  // Generate recommendations based on analysis
  if (issues.filter((i) => i.severity === "error").length === 0) {
    recommendations.push("Question bank structure is valid and ready for testing");
  }

  if (totalQuestions >= 50) {
    recommendations.push("Consider implementing adaptive difficulty based on user performance");
  }

  const isValid = issues.filter((i) => i.severity === "error").length === 0;

  return {
    isValid,
    totalQuestions,
    domainDistribution: domainCounts,
    domainPercentages,
    categoryDistribution,
    difficultyDistribution,
    issues,
    recommendations,
  };
}

/**
 * Generate a validation report as formatted text
 */
export function generateValidationReport(): string {
  const result = validateQuestionBank();

  let report = `# TCO Question Bank Validation Report\n\n`;
  report += `**Total Questions**: ${result.totalQuestions}\n`;
  report += `**Validation Status**: ${result.isValid ? "✅ PASSED" : "❌ FAILED"}\n\n`;

  report += `## Domain Distribution\n\n`;
  Object.entries(result.domainDistribution).forEach(([domain, count]) => {
    const percentage = result.domainPercentages[domain as TCODomain];
    const target = TCO_DOMAIN_WEIGHTS[domain as TCODomain];
    const status = Math.abs(percentage - target) <= 5 ? "✅" : "⚠️";
    report += `- **${domain}**: ${count} questions (${percentage}%) ${status} Target: ${target}%\n`;
  });

  report += `\n## Category Distribution\n\n`;
  Object.entries(result.categoryDistribution).forEach(([category, count]) => {
    const percentage = ((count / result.totalQuestions) * 100).toFixed(1);
    report += `- **${category}**: ${count} questions (${percentage}%)\n`;
  });

  report += `\n## Difficulty Distribution\n\n`;
  Object.entries(result.difficultyDistribution).forEach(([difficulty, count]) => {
    const percentage = ((count / result.totalQuestions) * 100).toFixed(1);
    report += `- **${difficulty}**: ${count} questions (${percentage}%)\n`;
  });

  if (result.issues.length > 0) {
    report += `\n## Issues Found\n\n`;
    result.issues.forEach((issue) => {
      const emoji = issue.severity === "error" ? "❌" : issue.severity === "warning" ? "⚠️" : "ℹ️";
      report += `${emoji} **${issue.severity.toUpperCase()}** (${issue.category}): ${issue.message}\n`;
    });
  }

  if (result.recommendations.length > 0) {
    report += `\n## Recommendations\n\n`;
    result.recommendations.forEach((rec) => {
      report += `- ${rec}\n`;
    });
  }

  return report;
}

/**
 * Get questions by domain for balanced practice sessions
 */
export function getQuestionsByDomain(domain: TCODomain, limit?: number): Question[] {
  const domainQuestions = questionBank.filter((q) => q.domain === domain);
  return limit ? domainQuestions.slice(0, limit) : domainQuestions;
}

/**
 * Get questions by difficulty for progressive learning
 */
export function getQuestionsByDifficulty(difficulty: Difficulty, limit?: number): Question[] {
  const difficultyQuestions = questionBank.filter((q) => q.difficulty === difficulty);
  return limit ? difficultyQuestions.slice(0, limit) : difficultyQuestions;
}

/**
 * Get a balanced mix of questions for practice sessions
 */
export function getBalancedQuestionSet(count: number = 20): Question[] {
  const questionsPerDomain = Math.floor(count / Object.keys(TCODomain).length);
  const balanced: Question[] = [];

  Object.values(TCODomain).forEach((domain) => {
    const domainQuestions = getQuestionsByDomain(domain, questionsPerDomain);
    balanced.push(...domainQuestions);
  });

  // Fill remaining slots with random questions if needed
  while (balanced.length < count && balanced.length < questionBank.length) {
    const remainingQuestions = questionBank.filter((q) => !balanced.includes(q));
    if (remainingQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
      balanced.push(remainingQuestions[randomIndex]);
    } else {
      break;
    }
  }

  return balanced.slice(0, count);
}
