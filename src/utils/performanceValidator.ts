/**
 * Performance Validator for TCO Question Bank System
 * Tests system performance with current and projected question loads
 */

import { questionBank } from "@/data/sample-questions";
import { validateQuestionBank } from "./questionBankValidator";
import { TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

interface PerformanceMetrics {
  loadTime: number;
  searchTime: number;
  filterTime: number;
  validationTime: number;
  memoryUsage: number;
  questionCount: number;
}

interface PerformanceTestResult {
  current: PerformanceMetrics;
  projected200: PerformanceMetrics;
  scalabilityScore: number;
  bottlenecks: string[];
  recommendations: string[];
}

/**
 * Run comprehensive performance tests on question bank system
 */
export function runPerformanceTests(): PerformanceTestResult {
  console.log("🚀 Running TCO Question Bank Performance Tests...");

  // Test current question bank performance
  const currentMetrics = testCurrentPerformance();

  // Project performance for 200 questions
  const projected200Metrics = projectPerformanceFor200Questions();

  // Calculate scalability score
  const scalabilityScore = calculateScalabilityScore(currentMetrics, projected200Metrics);

  // Identify bottlenecks
  const bottlenecks = identifyBottlenecks(currentMetrics, projected200Metrics);

  // Generate recommendations
  const recommendations = generateRecommendations(bottlenecks, scalabilityScore);

  return {
    current: currentMetrics,
    projected200: projected200Metrics,
    scalabilityScore,
    bottlenecks,
    recommendations,
  };
}

function testCurrentPerformance(): PerformanceMetrics {
  const startMemory = getMemoryUsage();

  // Test question bank loading
  const loadStart = performance.now();
  const questions = [...questionBank];
  const loadTime = performance.now() - loadStart;

  // Test domain filtering
  const searchStart = performance.now();
  const _askingQuestions = questions.filter((q) => q.domain === TCODomain.ASKING_QUESTIONS);
  const searchTime = performance.now() - searchStart;

  // Test complex filtering (multiple criteria)
  const filterStart = performance.now();
  const _complexFilter = questions.filter(
    (q) =>
      q.difficulty === Difficulty.INTERMEDIATE &&
      q.category === QuestionCategory.CONSOLE_PROCEDURES &&
      q.explanation &&
      q.explanation.length > 100
  );
  const filterTime = performance.now() - filterStart;

  // Test validation performance
  const validationStart = performance.now();
  const _validationResult = validateQuestionBank();
  const validationTime = performance.now() - validationStart;

  const endMemory = getMemoryUsage();
  const memoryUsage = endMemory - startMemory;

  return {
    loadTime,
    searchTime,
    filterTime,
    validationTime,
    memoryUsage,
    questionCount: questions.length,
  };
}

function projectPerformanceFor200Questions(): PerformanceMetrics {
  const currentCount = questionBank.length;
  const targetCount = 200;
  const scalingFactor = targetCount / currentCount;

  // Linear scaling for most operations
  const current = testCurrentPerformance();

  return {
    loadTime: current.loadTime * scalingFactor,
    searchTime: current.searchTime * scalingFactor,
    filterTime: current.filterTime * Math.pow(scalingFactor, 1.2), // Slightly non-linear
    validationTime: current.validationTime * Math.pow(scalingFactor, 1.1),
    memoryUsage: current.memoryUsage * scalingFactor,
    questionCount: targetCount,
  };
}

function calculateScalabilityScore(
  current: PerformanceMetrics,
  projected: PerformanceMetrics
): number {
  // Score based on projected performance thresholds
  let score = 100;

  // Deduct points for slow operations
  if (projected.loadTime > 100) score -= 10;
  if (projected.searchTime > 50) score -= 15;
  if (projected.filterTime > 75) score -= 10;
  if (projected.validationTime > 200) score -= 15;
  if (projected.memoryUsage > 50) score -= 10; // MB

  return Math.max(score, 0);
}

function identifyBottlenecks(current: PerformanceMetrics, projected: PerformanceMetrics): string[] {
  const bottlenecks: string[] = [];

  if (projected.loadTime > 100) {
    bottlenecks.push("Question bank initialization exceeds 100ms target");
  }

  if (projected.searchTime > 50) {
    bottlenecks.push("Domain filtering exceeds 50ms target");
  }

  if (projected.filterTime > 75) {
    bottlenecks.push("Complex filtering operations need optimization");
  }

  if (projected.validationTime > 200) {
    bottlenecks.push("Validation system needs performance optimization");
  }

  if (projected.memoryUsage > 50) {
    bottlenecks.push("Memory usage projection exceeds reasonable limits");
  }

  return bottlenecks;
}

function generateRecommendations(bottlenecks: string[], scalabilityScore: number): string[] {
  const recommendations: string[] = [];

  if (scalabilityScore >= 90) {
    recommendations.push("✅ System shows excellent scalability for 200 questions");
    recommendations.push("Consider implementing caching for optimal performance");
  } else if (scalabilityScore >= 75) {
    recommendations.push("⚠️ System adequate but could benefit from optimization");
    recommendations.push("Implement lazy loading for question bank initialization");
    recommendations.push("Add indexing for faster domain/category filtering");
  } else {
    recommendations.push("🚨 Significant performance optimization required");
    recommendations.push("Implement virtual scrolling for large question sets");
    recommendations.push("Add database-style indexing for filtering operations");
    recommendations.push("Consider question bank segmentation by domain");
  }

  if (bottlenecks.includes("Question bank initialization exceeds 100ms target")) {
    recommendations.push("Implement lazy loading and code splitting");
  }

  if (bottlenecks.includes("Domain filtering exceeds 50ms target")) {
    recommendations.push("Create domain-indexed question maps");
  }

  if (bottlenecks.includes("Complex filtering operations need optimization")) {
    recommendations.push("Pre-compute common filter combinations");
  }

  return recommendations;
}

// Type for Chrome's memory API extension
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

function getMemoryUsage(): number {
  // Simplified memory usage estimation
  if (typeof performance !== "undefined") {
    const perfWithMemory = performance as PerformanceWithMemory;
    if (perfWithMemory.memory) {
      return perfWithMemory.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }
  return 0;
}

/**
 * Generate performance report as formatted text
 */
export function generatePerformanceReport(): string {
  const results = runPerformanceTests();

  let report = `# TCO Question Bank Performance Report\\n\\n`;
  report += `**Test Date**: ${new Date().toISOString().split("T")[0]}\\n`;
  report += `**System Status**: ${results.scalabilityScore >= 90 ? "✅ Excellent" : results.scalabilityScore >= 75 ? "⚠️ Good" : "🚨 Needs Optimization"}\\n`;
  report += `**Scalability Score**: ${results.scalabilityScore}/100\\n\\n`;

  report += `## Current Performance (${results.current.questionCount} questions)\\n\\n`;
  report += `- **Load Time**: ${results.current.loadTime.toFixed(2)}ms\\n`;
  report += `- **Search Time**: ${results.current.searchTime.toFixed(2)}ms\\n`;
  report += `- **Filter Time**: ${results.current.filterTime.toFixed(2)}ms\\n`;
  report += `- **Validation Time**: ${results.current.validationTime.toFixed(2)}ms\\n`;
  report += `- **Memory Usage**: ${results.current.memoryUsage.toFixed(2)}MB\\n\\n`;

  report += `## Projected Performance (200 questions)\\n\\n`;
  report += `- **Load Time**: ${results.projected200.loadTime.toFixed(2)}ms ${results.projected200.loadTime <= 100 ? "✅" : "⚠️"}\\n`;
  report += `- **Search Time**: ${results.projected200.searchTime.toFixed(2)}ms ${results.projected200.searchTime <= 50 ? "✅" : "⚠️"}\\n`;
  report += `- **Filter Time**: ${results.projected200.filterTime.toFixed(2)}ms ${results.projected200.filterTime <= 75 ? "✅" : "⚠️"}\\n`;
  report += `- **Validation Time**: ${results.projected200.validationTime.toFixed(2)}ms ${results.projected200.validationTime <= 200 ? "✅" : "⚠️"}\\n`;
  report += `- **Memory Usage**: ${results.projected200.memoryUsage.toFixed(2)}MB ${results.projected200.memoryUsage <= 50 ? "✅" : "⚠️"}\\n\\n`;

  if (results.bottlenecks.length > 0) {
    report += `## Identified Bottlenecks\\n\\n`;
    results.bottlenecks.forEach((bottleneck) => {
      report += `- ${bottleneck}\\n`;
    });
    report += `\\n`;
  }

  report += `## Recommendations\\n\\n`;
  results.recommendations.forEach((rec) => {
    report += `- ${rec}\\n`;
  });

  return report;
}
