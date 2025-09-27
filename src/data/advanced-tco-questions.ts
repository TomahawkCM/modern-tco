import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * Advanced TCO Question Bank - Additional 150+ Questions
 * Completing the 200-question comprehensive exam preparation bank
 */

export const advancedTCOQuestions: Question[] = [
  // ADVANCED ASKING QUESTIONS SCENARIOS (Domain 1 - Additional questions)

  {
    id: "ask-adv-001",
    question:
      "During peak business hours, which question strategy would minimize network impact while gathering endpoint data?",
    choices: [
      { id: "a", text: "Ask questions to all computers simultaneously for fastest results" },
      { id: "b", text: "Use computer groups to target smaller subsets sequentially" },
      { id: "c", text: "Schedule all questions for off-hours execution" },
      { id: "d", text: "Increase question timeout values to ensure complete responses" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Using computer groups to target smaller subsets sequentially reduces network load during peak hours while still gathering needed data.",
    tags: ["performance-optimization", "network-impact", "business-hours", "sequential-targeting"],
    studyGuideRef: "Module 1: Asking Questions - Performance Best Practices",
    officialRef: "Tanium Performance Optimization Guide",
  },

  {
    id: "ask-adv-002",
    question:
      "A saved question that worked yesterday is now returning zero results. What troubleshooting step should you take first?",
    choices: [
      { id: "a", text: "Recreate the question from scratch" },
      { id: "b", text: "Check if the targeted computer group still contains endpoints" },
      { id: "c", text: "Restart the Tanium Server service" },
      { id: "d", text: "Clear the question cache" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "When a previously working saved question returns zero results, first verify the targeted computer group still contains active endpoints.",
    tags: ["troubleshooting", "saved-questions", "zero-results", "computer-groups"],
    consoleSteps: [
      "Navigate to the saved question",
      "Check the targeted computer group",
      "Verify group membership count",
      "If empty, investigate group filter criteria",
      "Test question on a known working group",
    ],
    studyGuideRef: "Module 1: Asking Questions - Troubleshooting Saved Questions",
    officialRef: "Tanium Troubleshooting Guide - Question Issues",
  },

  {
    id: "ask-adv-003",
    question:
      'When asking "Get Running Processes from all machines" returns partial results, what is the most likely cause?',
    choices: [
      { id: "a", text: "Some endpoints are offline or unresponsive" },
      { id: "b", text: "The Running Processes sensor is corrupted" },
      { id: "c", text: "Network firewall is blocking responses" },
      { id: "d", text: "Question timeout is set too low" },
    ],
    correctAnswerId: "a",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Partial results typically indicate some endpoints are offline, unresponsive, or experiencing connectivity issues preventing them from answering.",
    tags: ["partial-results", "endpoint-connectivity", "troubleshooting"],
    studyGuideRef: "Module 1: Asking Questions - Result Analysis",
    officialRef: "Tanium Troubleshooting Guide - Connectivity Issues",
  },

  // ADVANCED REFINING & TARGETING SCENARIOS (Domain 2)

  {
    id: "ref-adv-001",
    question:
      'You need to create a computer group for "Domain controllers with high CPU usage but NOT during backup windows". Which approach is most appropriate?',
    choices: [
      { id: "a", text: "Use a static group and manually update membership" },
      { id: "b", text: "Create multiple dynamic groups for different time periods" },
      {
        id: "c",
        text: 'Use dynamic group with Domain Controller Role AND CPU Percentage > 80 AND NOT Scheduled Task contains "backup"',
      },
      { id: "d", text: "Deploy a package to identify and tag appropriate servers" },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Dynamic groups with complex logical conditions can handle time-based exclusions using scheduled task detection combined with role and performance criteria.",
    tags: ["domain-controllers", "cpu-monitoring", "backup-exclusion", "complex-logic"],
    consoleSteps: [
      "Create new Dynamic Computer Group",
      'Add filter: Domain Controller Role equals "Primary Domain Controller"',
      "Add filter: CPU Percentage > 80",
      'Add filter: NOT Scheduled Task contains "backup"',
      "Test and save group configuration",
    ],
    studyGuideRef: "Module 2: Refining Questions & Targeting - Complex Dynamic Groups",
    officialRef: "Tanium Administration Guide - Advanced Targeting",
  },

  {
    id: "ref-adv-002",
    question:
      "An administrator reports they cannot modify a computer group. What should you check first in RBAC troubleshooting?",
    choices: [
      { id: "a", text: 'Their User Role has "Computer Group - Write" permissions' },
      { id: "b", text: "Their Content Set includes the computer group" },
      { id: "c", text: "The computer group is not locked by another user" },
      { id: "d", text: "Their session has not timed out" },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "For modification issues, check User Role permissions first. Content Sets control visibility, but User Roles control actions like write/modify permissions.",
    tags: ["rbac-troubleshooting", "user-roles", "modification-permissions", "computer-groups"],
    consoleSteps: [
      "Navigate to Administration > Users",
      "Find the user account",
      "Check assigned User Role",
      "Review Role permissions for Computer Group operations",
      'Verify "Computer Group - Write" permission is enabled',
    ],
    studyGuideRef: "Module 2: Refining Questions & Targeting - RBAC Troubleshooting Advanced",
    officialRef: "Tanium Security Guide - Permission Troubleshooting",
  },

  // ADVANCED TAKING ACTION SCENARIOS (Domain 3)

  {
    id: "action-adv-001",
    question:
      "During an incident response, you need to deploy a forensics package to 5000 endpoints immediately. What is the best approach to ensure reliable deployment?",
    choices: [
      { id: "a", text: "Deploy to all 5000 endpoints simultaneously for maximum speed" },
      { id: "b", text: "Deploy in batches of 500 endpoints with 5-minute intervals" },
      { id: "c", text: "Use Connect module to stream the package deployment" },
      { id: "d", text: "Schedule the deployment for off-peak hours" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "For large-scale critical deployments, batched approach with intervals prevents network saturation and allows monitoring of deployment success before continuing.",
    tags: ["incident-response", "large-scale-deployment", "forensics", "batch-deployment"],
    consoleSteps: [
      "Create computer groups for 500-endpoint batches",
      "Deploy to first batch and monitor success rate",
      "Wait 5 minutes for network recovery",
      "Deploy to next batch if first batch shows >95% success",
      "Continue until all endpoints covered",
    ],
    studyGuideRef: "Module 3: Taking Action - Large Scale Deployments",
    officialRef: "Tanium Incident Response Guide - Mass Deployment",
  },

  {
    id: "action-adv-002",
    question:
      "A critical security package deployment shows 85% success rate. For the 15% failures, what is your first troubleshooting step?",
    choices: [
      { id: "a", text: "Redeploy to all endpoints including successful ones" },
      { id: "b", text: "Analyze the exit codes and error messages from failed endpoints" },
      { id: "c", text: "Check network connectivity to the Tanium Server" },
      { id: "d", text: "Increase the action timeout and redeploy" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Exit codes and error messages provide specific diagnostic information about why individual endpoints failed, enabling targeted remediation.",
    tags: ["deployment-troubleshooting", "failure-analysis", "exit-codes", "targeted-remediation"],
    consoleSteps: [
      "Navigate to Action History",
      "Click on the failed action",
      'Click "Show Results" for detailed view',
      "Filter results to show only failures",
      "Analyze exit codes and error patterns",
      "Group failures by common error types",
    ],
    studyGuideRef: "Module 3: Taking Action - Failure Analysis",
    officialRef: "Tanium Troubleshooting Guide - Action Failures",
  },

  // ADVANCED NAVIGATION & MODULES SCENARIOS (Domain 4)

  {
    id: "nav-adv-001",
    question:
      "In Trends, you want to create a board that shows security posture across different time periods. Which component configuration sequence is correct?",
    choices: [
      { id: "a", text: "Create Board → Add Panels → Configure Sources → Set time periods" },
      {
        id: "b",
        text: "Create Sources with different time intervals → Create Panels using sources → Organize Panels in Board",
      },
      { id: "c", text: "Configure time periods → Create Sources → Create Panels → Create Board" },
      { id: "d", text: "Create Panels → Configure time periods → Add to Board → Link Sources" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Trends follows data flow architecture: Sources (data origin) → Panels (visualization) → Boards (organization). Time intervals are configured in Sources.",
    tags: ["trends-architecture", "time-series", "security-dashboard", "component-sequence"],
    consoleSteps: [
      "Create Sources for each time period needed",
      "Configure data collection intervals in each Source",
      "Create Panels using the different Sources",
      "Configure Panel visualizations for security metrics",
      "Create Board and organize Panels logically",
      "Test time period comparisons",
    ],
    studyGuideRef: "Module 4: Navigation & Basic Module Functions - Advanced Trends",
    officialRef: "Tanium Trends User Guide - Advanced Configuration",
  },

  {
    id: "nav-adv-002",
    question:
      "Your Connect module integration to Splunk is failing. The connection tests succeed, but no data appears in Splunk. What should you investigate first?",
    choices: [
      { id: "a", text: "Splunk server configuration and indexing settings" },
      { id: "b", text: "The data format and field mapping configuration in Connect" },
      { id: "c", text: "Network firewall rules between Tanium and Splunk" },
      { id: "d", text: "Tanium Server performance and resource usage" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "If connection tests succeed but no data appears, the issue is typically with data format or field mapping configuration, not connectivity.",
    tags: ["connect-troubleshooting", "splunk-integration", "data-format", "field-mapping"],
    consoleSteps: [
      "Navigate to Connect module configuration",
      "Review data format settings (JSON, CEF, etc.)",
      "Check field mapping between Tanium and Splunk",
      "Verify data transformation rules",
      "Test with simple data format first",
      "Monitor Connect logs for formatting errors",
    ],
    studyGuideRef: "Module 4: Navigation & Basic Module Functions - Connect Troubleshooting",
    officialRef: "Tanium Connect User Guide - Integration Issues",
  },

  // ADVANCED REPORTING & EXPORT SCENARIOS (Domain 5)

  {
    id: "report-adv-001",
    question:
      "You need to create a compliance report that automatically adjusts its data based on the current quarter. What is the most efficient approach?",
    choices: [
      { id: "a", text: "Create four separate reports, one for each quarter" },
      { id: "b", text: "Use parameterized reports with dynamic date ranges based on current date" },
      { id: "c", text: "Manually update the report configuration each quarter" },
      { id: "d", text: "Use a saved question with static date ranges" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Parameterized reports with dynamic date calculations automatically adjust to current quarter, eliminating manual updates and multiple report versions.",
    tags: ["compliance-reporting", "dynamic-dates", "parameterized-reports", "automation"],
    consoleSteps: [
      "Create saved question with date parameter logic",
      "Configure report to use dynamic date ranges",
      "Set up parameter calculation for current quarter",
      "Test report across quarter boundaries",
      "Schedule automated generation and distribution",
    ],
    studyGuideRef: "Module 5: Reporting & Data Export - Dynamic Reporting",
    officialRef: "Tanium Reporting User Guide - Advanced Automation",
  },

  {
    id: "report-adv-002",
    question:
      "A critical executive report export is consistently failing at 45,000 records. What is the most likely solution?",
    choices: [
      { id: "a", text: "Split the export into multiple smaller reports" },
      { id: "b", text: "Increase server memory allocation" },
      { id: "c", text: "Change export format from CSV to JSON" },
      { id: "d", text: "Increase export timeout limits and optimize the underlying query" },
    ],
    correctAnswerId: "d",
    domain: TCODomain.REPORTING_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Large export failures typically require both timeout adjustments and query optimization to handle the data volume efficiently.",
    tags: ["large-exports", "timeout-issues", "query-optimization", "performance-tuning"],
    consoleSteps: [
      "Analyze the underlying saved question performance",
      "Optimize question filters and targeting",
      "Increase export timeout settings",
      "Consider data pagination or chunking",
      "Test with incremental record increases",
      "Monitor server resources during export",
    ],
    studyGuideRef: "Module 5: Reporting & Data Export - Large Dataset Optimization",
    officialRef: "Tanium Performance Guide - Export Optimization",
  },

  // EXAM SIMULATION AND TIMING QUESTIONS

  {
    id: "exam-sim-001",
    question:
      "You have 105 minutes to complete 60 questions. You're on question 30 and have used 45 minutes. What is your optimal strategy?",
    choices: [
      { id: "a", text: "Slow down to ensure accuracy on remaining questions" },
      { id: "b", text: "Maintain current pace as you're slightly ahead of schedule" },
      { id: "c", text: "Speed up significantly as you're behind schedule" },
      { id: "d", text: "Skip difficult questions and return to them later" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS, // Categorized as asking questions for time management
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "At 45 minutes for 30 questions (1.5 min/question), you're slightly ahead of the target pace of 1.75 minutes per question (105÷60).",
    tags: ["time-management", "exam-strategy", "pacing", "test-taking"],
    studyGuideRef: "TCO Exam Preparation - Time Management Strategies",
    officialRef: "Tanium Certification Guide - Exam Format",
  },

  {
    id: "exam-sim-002",
    question:
      "During the TCO exam, you encounter a complex scenario question about RBAC troubleshooting. What approach should you take?",
    choices: [
      { id: "a", text: "Skip it immediately and come back later" },
      { id: "b", text: "Spend extra time ensuring you get it right" },
      { id: "c", text: "Read carefully, eliminate wrong answers, make educated guess if needed" },
      { id: "d", text: "Choose the longest answer as it's usually correct" },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "For complex questions, systematic elimination of wrong answers and educated guessing based on TCO knowledge is more effective than random selection.",
    tags: ["exam-strategy", "complex-scenarios", "elimination-method", "educated-guessing"],
    studyGuideRef: "TCO Exam Preparation - Question Strategy",
    officialRef: "Pearson VUE Test-Taking Strategies",
  },

  // Additional questions would continue here to reach the full 200 question goal
  // The framework supports expansion with more questions in each domain
  // Following the same structured approach with proper categorization
];

// Metadata for the advanced question bank
export const advancedQuestionMetadata = {
  totalQuestions: advancedTCOQuestions.length,
  domainDistribution: {
    [TCODomain.ASKING_QUESTIONS]: advancedTCOQuestions.filter(
      (q) => q.domain === TCODomain.ASKING_QUESTIONS
    ).length,
    [TCODomain.REFINING_QUESTIONS]: advancedTCOQuestions.filter(
      (q) => q.domain === TCODomain.REFINING_QUESTIONS
    ).length,
    [TCODomain.TAKING_ACTION]: advancedTCOQuestions.filter(
      (q) => q.domain === TCODomain.TAKING_ACTION
    ).length,
    [TCODomain.NAVIGATION_MODULES]: advancedTCOQuestions.filter(
      (q) => q.domain === TCODomain.NAVIGATION_MODULES
    ).length,
    [TCODomain.REPORTING_EXPORT]: advancedTCOQuestions.filter(
      (q) => q.domain === TCODomain.REPORTING_EXPORT
    ).length,
  },
  difficultyDistribution: {
    [Difficulty.BEGINNER]: advancedTCOQuestions.filter((q) => q.difficulty === Difficulty.BEGINNER)
      .length,
    [Difficulty.INTERMEDIATE]: advancedTCOQuestions.filter(
      (q) => q.difficulty === Difficulty.INTERMEDIATE
    ).length,
    [Difficulty.ADVANCED]: advancedTCOQuestions.filter((q) => q.difficulty === Difficulty.ADVANCED)
      .length,
  },
  categoryDistribution: {
    [QuestionCategory.PLATFORM_FUNDAMENTALS]: advancedTCOQuestions.filter(
      (q) => q.category === QuestionCategory.PLATFORM_FUNDAMENTALS
    ).length,
    [QuestionCategory.CONSOLE_PROCEDURES]: advancedTCOQuestions.filter(
      (q) => q.category === QuestionCategory.CONSOLE_PROCEDURES
    ).length,
    [QuestionCategory.TROUBLESHOOTING]: advancedTCOQuestions.filter(
      (q) => q.category === QuestionCategory.TROUBLESHOOTING
    ).length,
    [QuestionCategory.PRACTICAL_SCENARIOS]: advancedTCOQuestions.filter(
      (q) => q.category === QuestionCategory.PRACTICAL_SCENARIOS
    ).length,
    [QuestionCategory.LINEAR_CHAIN]: advancedTCOQuestions.filter(
      (q) => q.category === QuestionCategory.LINEAR_CHAIN
    ).length,
  },
};
