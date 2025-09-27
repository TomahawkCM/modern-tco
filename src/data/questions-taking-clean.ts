import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * Taking Action - Packages & Actions Questions
 * 50 questions for the Taking Action - Packages & Actions domain
 */

export const takingQuestions: Question[] = [
  {
    id: "TCO-TA-0001",
    question: "What is a package in the Tanium platform?",
    choices: [
      {
        id: "a",
        text: "A compressed file containing multiple sensors",
      },
      {
        id: "b",
        text: "A pre-built action template that performs specific tasks on endpoints",
      },
      {
        id: "c",
        text: "A configuration file that defines user permissions",
      },
      {
        id: "d",
        text: "A report template for data visualization",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "A package in Tanium is a pre-built action template that contains the necessary components (scripts, parameters, etc.) to perform specific tasks on endpoints such as software installation, system configuration, or data collection.",
    tags: ["packages", "actions", "deployment"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-TA-0002",
    question:
      "You need to restart a specific service on a group of servers. What is the correct workflow for this action?",
    choices: [
      {
        id: "a",
        text: "Create a new package, test it, then deploy to production servers immediately",
      },
      {
        id: "b",
        text: "Select the appropriate restart service package, configure parameters, target the server group, and deploy with proper approval",
      },
      {
        id: "c",
        text: "Use Interact to query the service status, then manually restart on each server",
      },
      {
        id: "d",
        text: "Deploy the package to all computers to ensure comprehensive coverage",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Console Procedures",
    explanation:
      "The proper workflow involves selecting an existing restart service package, configuring it with the correct service name parameters, targeting only the appropriate server group, and following proper approval workflows before deployment. This ensures controlled, targeted action execution.",
    tags: ["package-deployment", "service-restart", "workflow"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "university/action-deployment",
  },
  {
    id: "TCO-TA-0050",
    question:
      "When troubleshooting action deployment issues, what information from the Tanium Client logs is most valuable for root cause analysis?",
    choices: [
      {
        id: "a",
        text: "Only the final success or failure status",
      },
      {
        id: "b",
        text: "Error messages, execution timestamps, return codes, and system environment details",
      },
      {
        id: "c",
        text: "Network connectivity status only",
      },
      {
        id: "d",
        text: "User activity during action execution",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Troubleshooting",
    explanation:
      "Error messages, execution timestamps, return codes, and system environment details provide comprehensive information for root cause analysis. This information helps identify what went wrong, when it occurred, what the system returned, and the environmental conditions during execution.",
    tags: ["client-logs", "root-cause-analysis", "error-messages", "troubleshooting-data"],
    studyGuideRef: "tco-study-path/log-analysis",
  },
];

export const takingQuestionMetadata = {
  domain: TCODomain.TA,
  totalQuestions: 50,
  difficultyBreakdown: {
    beginner: 11,
    intermediate: 25,
    advanced: 14,
  },
};
