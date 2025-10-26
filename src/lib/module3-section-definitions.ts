/**
 * Module 3 Section Definitions - Taking Action Domain
 * Defines the expanded 9-section structure for enhanced content organization
 */

import { TCODomain } from "@/types/exam";

/**
 * Module 3 section identifiers
 */
export enum Module3Section {
  PACKAGE_VALIDATION = "package-validation",
  DEPLOYMENT_STRATEGIES = "deployment-strategies",
  ERROR_HANDLING = "error-handling",
  ROLLBACK_PROCEDURES = "rollback-procedures",
  PERFORMANCE_MONITORING = "performance-monitoring",
  SECURITY_CONSIDERATIONS = "security-considerations",
  BATCH_OPERATIONS = "batch-operations",
  SCHEDULING_AUTOMATION = "scheduling-automation",
  DEPENDENCY_MANAGEMENT = "dependency-management"
}

/**
 * Section metadata for Module 3
 */
export interface SectionMetadata {
  id: Module3Section;
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedTime: number; // in minutes
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  prerequisites?: Module3Section[];
  tags: string[];
  questionTargetCount: number;
  currentQuestionCount: number;
  primaryTag: string; // Database section tag
}

/**
 * Complete section definitions for Module 3
 */
export const MODULE_3_SECTIONS: Record<Module3Section, SectionMetadata> = {
  [Module3Section.PACKAGE_VALIDATION]: {
    id: Module3Section.PACKAGE_VALIDATION,
    title: "Package Validation",
    description: "Learn to validate package integrity, dependencies, and prerequisites before deployment",
    learningObjectives: [
      "PV1: Validate package integrity before deployment",
      "PV2: Verify package dependencies and prerequisites",
      "PV3: Handle validation failures effectively",
      "PV4: Implement automated validation workflows"
    ],
    estimatedTime: 20,
    difficulty: "Intermediate",
    tags: ["package-integrity", "validation-procedures", "testing-protocols", "checksum-verification"],
    questionTargetCount: 10,
    currentQuestionCount: 0,
    primaryTag: "taking-action-package-validation"
  },

  [Module3Section.DEPLOYMENT_STRATEGIES]: {
    id: Module3Section.DEPLOYMENT_STRATEGIES,
    title: "Advanced Deployment Strategies",
    description: "Master sophisticated deployment methodologies for enterprise environments",
    learningObjectives: [
      "ADS1: Design effective pilot group strategies",
      "ADS2: Implement geographic and time-zone aware deployments",
      "ADS3: Create precision targeting with layered filtering",
      "ADS4: Manage multi-domain deployment scenarios"
    ],
    estimatedTime: 30,
    difficulty: "Advanced",
    tags: ["pilot-groups", "time-zones", "layered-filtering", "multi-domain", "precise-targeting"],
    questionTargetCount: 15,
    currentQuestionCount: 8,
    primaryTag: "taking-action-deployment-strategies"
  },

  [Module3Section.ERROR_HANDLING]: {
    id: Module3Section.ERROR_HANDLING,
    title: "Error Handling & Recovery",
    description: "Comprehensive error detection, troubleshooting, and recovery procedures",
    learningObjectives: [
      "EH1: Identify and classify deployment errors",
      "EH2: Apply systematic troubleshooting procedures",
      "EH3: Implement intelligent retry mechanisms",
      "EH4: Protect critical infrastructure during failures"
    ],
    estimatedTime: 25,
    difficulty: "Intermediate",
    tags: ["troubleshooting", "failure-handling", "retry-logic", "error-handling", "root-cause-analysis"],
    questionTargetCount: 10,
    currentQuestionCount: 6,
    primaryTag: "taking-action-error-handling"
  },

  [Module3Section.ROLLBACK_PROCEDURES]: {
    id: Module3Section.ROLLBACK_PROCEDURES,
    title: "Rollback Procedures",
    description: "Design and execute effective rollback strategies for failed deployments",
    learningObjectives: [
      "RP1: Design comprehensive rollback strategies",
      "RP2: Implement state restoration procedures",
      "RP3: Execute emergency rollback procedures",
      "RP4: Validate rollback completion and success"
    ],
    estimatedTime: 20,
    difficulty: "Advanced",
    prerequisites: [Module3Section.ERROR_HANDLING],
    tags: ["rollback-strategies", "state-restoration", "recovery-procedures", "emergency-rollback"],
    questionTargetCount: 8,
    currentQuestionCount: 0,
    primaryTag: "taking-action-rollback-procedures"
  },

  [Module3Section.PERFORMANCE_MONITORING]: {
    id: Module3Section.PERFORMANCE_MONITORING,
    title: "Performance Monitoring",
    description: "Monitor and optimize deployment performance at scale",
    learningObjectives: [
      "PM1: Monitor system health and performance metrics",
      "PM2: Optimize resource usage for large-scale deployments",
      "PM3: Analyze scalability limits and bottlenecks",
      "PM4: Implement performance trend analysis"
    ],
    estimatedTime: 25,
    difficulty: "Intermediate",
    tags: ["monitoring", "performance", "scalability", "resource-usage", "system-health"],
    questionTargetCount: 10,
    currentQuestionCount: 6,
    primaryTag: "taking-action-performance-monitoring"
  },

  [Module3Section.SECURITY_CONSIDERATIONS]: {
    id: Module3Section.SECURITY_CONSIDERATIONS,
    title: "Security Considerations",
    description: "Implement security best practices during deployments",
    learningObjectives: [
      "SC1: Manage security boundaries and access controls",
      "SC2: Ensure compliance with data sovereignty requirements",
      "SC3: Implement proper authorization procedures",
      "SC4: Validate security policies during deployments"
    ],
    estimatedTime: 20,
    difficulty: "Advanced",
    tags: ["security-boundaries", "data-sovereignty", "access-control", "compliance", "gdpr"],
    questionTargetCount: 10,
    currentQuestionCount: 2,
    primaryTag: "taking-action-security-considerations"
  },

  [Module3Section.BATCH_OPERATIONS]: {
    id: Module3Section.BATCH_OPERATIONS,
    title: "Batch Operations",
    description: "Execute efficient bulk operations and mass deployments",
    learningObjectives: [
      "BO1: Design efficient bulk operation strategies",
      "BO2: Monitor and control batch operations",
      "BO3: Manage concurrent execution limits",
      "BO4: Optimize batch operations for enterprise scale"
    ],
    estimatedTime: 20,
    difficulty: "Intermediate",
    tags: ["bulk-operations", "mass-deployment", "batch-processing", "parallel-execution"],
    questionTargetCount: 10,
    currentQuestionCount: 0,
    primaryTag: "taking-action-batch-operations"
  },

  [Module3Section.SCHEDULING_AUTOMATION]: {
    id: Module3Section.SCHEDULING_AUTOMATION,
    title: "Scheduling & Automation",
    description: "Implement automated workflows and scheduling strategies",
    learningObjectives: [
      "SA1: Design automated deployment workflows",
      "SA2: Implement time-based scheduling strategies",
      "SA3: Manage dynamic group automation",
      "SA4: Integrate with enterprise management tools"
    ],
    estimatedTime: 25,
    difficulty: "Advanced",
    tags: ["automation", "scheduling", "workflow-orchestration", "dynamic-groups", "integration"],
    questionTargetCount: 10,
    currentQuestionCount: 1,
    primaryTag: "taking-action-scheduling-automation"
  },

  [Module3Section.DEPENDENCY_MANAGEMENT]: {
    id: Module3Section.DEPENDENCY_MANAGEMENT,
    title: "Dependency Management",
    description: "Track and manage operational dependencies effectively",
    learningObjectives: [
      "DM1: Identify and map operational dependencies",
      "DM2: Implement automated prerequisite checking",
      "DM3: Optimize execution order and dependency resolution",
      "DM4: Handle dependency failures gracefully"
    ],
    estimatedTime: 20,
    difficulty: "Intermediate",
    prerequisites: [Module3Section.PACKAGE_VALIDATION],
    tags: ["dependency-tracking", "prerequisite-validation", "execution-order", "dependency-resolution"],
    questionTargetCount: 8,
    currentQuestionCount: 0,
    primaryTag: "taking-action-dependency-management"
  }
};

/**
 * Get sections by difficulty level
 */
export function getSectionsByDifficulty(difficulty: "Beginner" | "Intermediate" | "Advanced"): SectionMetadata[] {
  return Object.values(MODULE_3_SECTIONS).filter(section => section.difficulty === difficulty);
}

/**
 * Get sections with missing questions (gaps)
 */
export function getSectionsWithGaps(): SectionMetadata[] {
  return Object.values(MODULE_3_SECTIONS).filter(
    section => section.currentQuestionCount < section.questionTargetCount
  );
}

/**
 * Get section coverage percentage
 */
export function getSectionCoverage(sectionId: Module3Section): number {
  const section = MODULE_3_SECTIONS[sectionId];
  if (!section || section.questionTargetCount === 0) return 0;
  return Math.round((section.currentQuestionCount / section.questionTargetCount) * 100);
}

/**
 * Get overall Module 3 coverage
 */
export function getOverallModule3Coverage(): {
  totalSections: number;
  completeSections: number;
  partialSections: number;
  emptySections: number;
  overallCoverage: number;
} {
  const sections = Object.values(MODULE_3_SECTIONS);
  const completeSections = sections.filter(s => s.currentQuestionCount >= s.questionTargetCount).length;
  const partialSections = sections.filter(s => s.currentQuestionCount > 0 && s.currentQuestionCount < s.questionTargetCount).length;
  const emptySections = sections.filter(s => s.currentQuestionCount === 0).length;

  const totalTarget = sections.reduce((sum, s) => sum + s.questionTargetCount, 0);
  const totalCurrent = sections.reduce((sum, s) => sum + s.currentQuestionCount, 0);
  const overallCoverage = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return {
    totalSections: sections.length,
    completeSections,
    partialSections,
    emptySections,
    overallCoverage
  };
}

/**
 * Create practice targeting for a specific section
 */
export function createSectionPracticeTargeting(sectionId: Module3Section) {
  const section = MODULE_3_SECTIONS[sectionId];

  return {
    moduleId: "module-taking-action",
    primaryDomain: TCODomain.TAKING_ACTION,
    targetObjectives: section.learningObjectives.map(obj => obj.split(":")[0]), // Extract objective IDs
    requiredTags: [section.primaryTag],
    optionalTags: section.tags,
    minQuestions: 5,
    idealQuestions: 15,
    fallbackStrategy: "expand-domain" as const
  };
}

/**
 * Get learning path for Module 3 (section order based on prerequisites)
 */
export function getModule3LearningPath(): Module3Section[] {
  // Topological sort based on prerequisites
  const path: Module3Section[] = [];
  const visited = new Set<Module3Section>();

  function visit(sectionId: Module3Section) {
    if (visited.has(sectionId)) return;

    const section = MODULE_3_SECTIONS[sectionId];
    if (section.prerequisites) {
      section.prerequisites.forEach(prereq => visit(prereq));
    }

    visited.add(sectionId);
    path.push(sectionId);
  }

  Object.keys(MODULE_3_SECTIONS).forEach(sectionId => {
    visit(sectionId as Module3Section);
  });

  return path;
}

/**
 * Estimate total study time for Module 3
 */
export function getModule3TotalTime(): {
  totalMinutes: number;
  formattedTime: string;
} {
  const totalMinutes = Object.values(MODULE_3_SECTIONS).reduce(
    (sum, section) => sum + section.estimatedTime,
    0
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedTime = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

  return { totalMinutes, formattedTime };
}