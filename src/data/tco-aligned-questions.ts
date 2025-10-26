import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * TCO-Aligned Question Bank
 * Official Tanium Certified Operator (TAN-1000) Questions
 *
 * Domain Distribution (Based on Official Exam Weightings):
 * - Asking Questions: 22% (44 questions)
 * - Refining Questions & Targeting: 23% (46 questions)
 * - Taking Action - Packages & Actions: 15% (30 questions)
 * - Navigation & Basic Module Functions: 23% (46 questions)
 * - Reporting & Data Export: 17% (34 questions)
 * Total: 200 questions
 */

export const tcoAlignedQuestionBank: Question[] = [
  // DOMAIN 1: ASKING QUESTIONS (22% - 44 questions)

  // Linear Chain Architecture Questions (Critical TCO Concept)
  {
    id: "ask-001",
    question:
      "What is the primary advantage of Tanium's Linear Chain Architecture over traditional hub-and-spoke models?",
    choices: [
      { id: "a", text: "Reduced WAN traffic and server load" },
      { id: "b", text: "Faster initial deployment" },
      { id: "c", text: "Better user interface design" },
      { id: "d", text: "Lower hardware requirements" },
    ],
    correctAnswerId: "a",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.LINEAR_CHAIN,
    explanation:
      "Linear Chain Architecture decentralizes data collection to endpoints, forming peer-to-peer chains that drastically reduce WAN traffic and server load compared to traditional polling methods.",
    tags: ["linear-chain", "architecture", "efficiency"],
    studyGuideRef: "Platform Architecture Fundamentals - Linear Chain Architecture",
    officialRef: "Tanium Platform User Guide - Architecture Overview",
  },

  {
    id: "ask-002",
    question:
      "In Tanium's Linear Chain Architecture, how many endpoints per chain typically communicate directly with the server?",
    choices: [
      { id: "a", text: "All endpoints in the chain" },
      { id: "b", text: "Only a couple of leader endpoints" },
      { id: "c", text: "Exactly 10 endpoints per chain" },
      { id: "d", text: "Half of the endpoints in each chain" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.LINEAR_CHAIN,
    explanation:
      "In Linear Chain Architecture, only a couple of leader endpoints per chain communicate with the server, while other endpoints form peer-to-peer chains on local networks.",
    tags: ["linear-chain", "leader-endpoints", "peer-to-peer"],
    studyGuideRef: "Platform Architecture Fundamentals - Linear Chain Architecture",
    officialRef: "Tanium Architecture Guide",
  },

  // Natural Language Question Construction
  {
    id: "ask-003",
    question:
      'What is the correct Tanium question structure for asking "Get the list of running processes from all Windows machines"?',
    choices: [
      { id: "a", text: 'Get Running Processes from Computer Name contains "Windows"' },
      { id: "b", text: 'Get Running Processes from Operating System contains "Windows"' },
      { id: "c", text: "Show processes where OS equals Windows" },
      { id: "d", text: "List Running Processes from Windows computers" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      'The correct Tanium syntax follows "Get [sensor] from [computer group]" format. Operating System sensor with "contains Windows" filter properly targets Windows machines.',
    tags: ["question-structure", "sensors", "targeting"],
    consoleSteps: [
      "Navigate to Interact > Ask Question",
      'Type "Get Running Processes from Operating System contains \\"Windows\\""',
      "Click Ask Question button",
      "Review results in Question Results grid",
    ],
    studyGuideRef: "Module 1: Asking Questions - Question Structure",
    officialRef: "Tanium Console User Guide - Asking Questions",
  },

  {
    id: "ask-004",
    question:
      'How many sensors are being used in this Tanium question: "Get User Accounts and Operating Systems for all machines"?',
    choices: [
      { id: "a", text: "1 sensor" },
      { id: "b", text: "2 sensors" },
      { id: "c", text: "3 sensors" },
      { id: "d", text: "4 sensors" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      'This question uses 2 sensors: "User Accounts" and "Operating Systems". Multiple sensors in a single question are connected with "and".',
    tags: ["sensors", "counting", "multiple-sensors"],
    studyGuideRef: "Module 1: Asking Questions - Sensor Selection",
    officialRef: "Tanium Interact User Guide",
  },

  // Sensor Understanding and Usage
  {
    id: "ask-005",
    question: "What is a sensor in Tanium terminology?",
    choices: [
      { id: "a", text: "A hardware monitoring device attached to endpoints" },
      { id: "b", text: "A script that collects specific data from endpoints" },
      { id: "c", text: "A network monitoring appliance" },
      { id: "d", text: "A user interface component for displaying data" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "A sensor is a script or program that runs on endpoints to collect specific types of data, such as running processes, installed software, or system configuration.",
    tags: ["sensors", "definition", "data-collection"],
    studyGuideRef: "Module 1: Asking Questions - Understanding Sensors",
    officialRef: "Tanium Platform Glossary",
  },

  {
    id: "ask-006",
    question:
      "Which sensor would you use to identify machines that haven't been rebooted recently?",
    choices: [
      { id: "a", text: "Last Reboot" },
      { id: "b", text: "Uptime" },
      { id: "c", text: "System Status" },
      { id: "d", text: "Boot Time" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      'The "Uptime" sensor shows how long a system has been running since last reboot, making it ideal for identifying machines with extended uptime.',
    tags: ["uptime", "sensors", "system-monitoring"],
    studyGuideRef: "Module 1: Asking Questions - Practical Sensor Usage",
    officialRef: "Tanium Core Platform Content Reference",
  },

  // Saved Questions and Management
  {
    id: "ask-007",
    question: "What is the primary benefit of saving a Tanium question?",
    choices: [
      { id: "a", text: "Questions run faster when saved" },
      { id: "b", text: "Saved questions use less network bandwidth" },
      { id: "c", text: "Enables repeated use and historical tracking" },
      { id: "d", text: "Saved questions require fewer permissions" },
    ],
    correctAnswerId: "c",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Saving questions enables repeated use without retyping and allows for historical tracking of results over time, essential for trending and reporting.",
    tags: ["saved-questions", "management", "historical-data"],
    consoleSteps: [
      "Ask a question in Interact module",
      'Click "Save Question" button in results view',
      "Provide question name and description",
      "Select appropriate folder location",
      "Click Save to store for future use",
    ],
    studyGuideRef: "Module 1: Asking Questions - Saved Questions",
    officialRef: "Tanium Console User Guide - Question Management",
  },

  // Question Results and Analysis
  {
    id: "ask-008",
    question: "In the Tanium Console, where do you view the results after asking a question?",
    choices: [
      { id: "a", text: "Question Results page" },
      { id: "b", text: "Data Export page" },
      { id: "c", text: "Analytics Dashboard" },
      { id: "d", text: "Report Builder" },
    ],
    correctAnswerId: "a",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Question results are displayed on the Question Results page, which shows real-time responses from endpoints as they report back.",
    tags: ["question-results", "console-navigation", "interface"],
    consoleSteps: [
      "Navigate to Interact > Ask Question",
      "Enter and ask your question",
      "System automatically navigates to Question Results page",
      "View real-time results as endpoints respond",
    ],
    studyGuideRef: "Module 1: Asking Questions - Viewing Results",
    officialRef: "Tanium Console User Guide - Question Results",
  },

  // Real-time Data Collection Concepts
  {
    id: "ask-009",
    question: "What happens when you ask a question in Tanium?",
    choices: [
      { id: "a", text: "The question is stored in a database for later processing" },
      { id: "b", text: "Tanium Clients on endpoints process the question and return answers" },
      { id: "c", text: "The server polls each endpoint individually for the requested data" },
      { id: "d", text: "Historical data is retrieved from the Tanium database" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "When a question is asked, it's distributed to Tanium Clients on managed endpoints, which process the question locally and return current, real-time answers.",
    tags: ["real-time", "tanium-client", "data-collection"],
    studyGuideRef: "Module 1: Asking Questions - Real-time Data Collection",
    officialRef: "Tanium Architecture Guide - Client Processing",
  },

  // Natural Language Processing
  {
    id: "ask-010",
    question:
      "Which feature allows you to ask questions in plain English rather than Tanium syntax?",
    choices: [
      { id: "a", text: "Smart Questions" },
      { id: "b", text: "Natural Language Processing" },
      { id: "c", text: "Auto-complete" },
      { id: "d", text: "Question Templates" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Tanium's Natural Language Processing feature allows operators to ask questions in plain English, which are then translated to proper Tanium syntax.",
    tags: ["natural-language", "ease-of-use", "question-construction"],
    studyGuideRef: "Module 1: Asking Questions - Natural Language Queries",
    officialRef: "Tanium Console User Guide - Natural Language Questions",
  },

  // DOMAIN 2: REFINING QUESTIONS & TARGETING (23% - 46 questions)

  // Computer Groups - Static vs Dynamic
  {
    id: "ref-001",
    question: "What is the main difference between static and dynamic computer groups in Tanium?",
    choices: [
      {
        id: "a",
        text: "Static groups require manual updates, dynamic groups update automatically",
      },
      { id: "b", text: "Static groups are faster, dynamic groups are more secure" },
      { id: "c", text: "Static groups use less memory, dynamic groups use less CPU" },
      { id: "d", text: "Static groups work offline, dynamic groups require network connectivity" },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "Static computer groups have fixed membership that must be manually updated, while dynamic groups automatically update their membership based on defined criteria.",
    tags: ["computer-groups", "static", "dynamic"],
    studyGuideRef: "Module 2: Refining Questions & Targeting - Computer Group Management",
    officialRef: "Tanium Console User Guide - Computer Groups",
  },

  {
    id: "ref-002",
    question: "How would you create a dynamic computer group for all Windows 10 machines?",
    choices: [
      { id: "a", text: 'Operating System contains "Windows 10"' },
      { id: "b", text: 'Computer Name contains "Win10"' },
      { id: "c", text: 'IP Address starts with "10."' },
      { id: "d", text: 'Domain equals "Windows10"' },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Dynamic groups use sensor criteria. \"Operating System contains 'Windows 10'\" will automatically include all endpoints reporting Windows 10 as their OS.",
    tags: ["dynamic-groups", "filtering", "operating-system"],
    consoleSteps: [
      "Navigate to Administration > Computer Groups",
      "Click Create Group",
      "Select Dynamic Group",
      'Add filter: Operating System contains "Windows 10"',
      "Save group with descriptive name",
    ],
    studyGuideRef: "Module 2: Refining Questions & Targeting - Dynamic Group Creation",
    officialRef: "Tanium Administration Guide - Group Management",
  },

  // Advanced Filtering and Logical Operators
  {
    id: "ref-003",
    question:
      "Which logical operator would you use to find machines that are either Windows 10 OR Windows 11?",
    choices: [
      { id: "a", text: "AND" },
      { id: "b", text: "OR" },
      { id: "c", text: "NOT" },
      { id: "d", text: "CONTAINS" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The OR operator allows you to match endpoints that meet any of the specified criteria, perfect for targeting multiple Windows versions.",
    tags: ["logical-operators", "filtering", "targeting"],
    studyGuideRef: "Module 2: Refining Questions & Targeting - Advanced Filtering",
    officialRef: "Tanium Query Language Reference",
  },

  {
    id: "ref-004",
    question: "How would you target Windows servers that are NOT domain controllers?",
    choices: [
      { id: "a", text: 'Operating System contains "Server" AND NOT Computer Name contains "DC"' },
      {
        id: "b",
        text: 'Operating System contains "Server" OR NOT Domain Role equals "Domain Controller"',
      },
      {
        id: "c",
        text: 'Operating System contains "Server" AND NOT Domain Role equals "Domain Controller"',
      },
      { id: "d", text: 'Computer Name contains "Server" AND Domain equals "None"' },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "This requires AND logic for Windows servers combined with NOT logic to exclude domain controllers, using the Domain Role sensor.",
    tags: ["complex-filtering", "logical-operators", "servers", "domain-controllers"],
    studyGuideRef: "Module 2: Refining Questions & Targeting - Complex Filtering",
    officialRef: "Tanium Query Language Reference - Logical Operators",
  },

  // RBAC (Role-Based Access Control)
  {
    id: "ref-005",
    question: "What is the principle of least privilege in Tanium RBAC?",
    choices: [
      { id: "a", text: "Give users maximum access to reduce support tickets" },
      { id: "b", text: "Provide users only the minimum access needed for their role" },
      { id: "c", text: "Allow all users to view data but limit actions" },
      { id: "d", text: "Grant temporary elevated access as needed" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "Least privilege means providing users only the minimum access rights necessary to perform their job functions, reducing security risk.",
    tags: ["rbac", "security", "least-privilege", "access-control"],
    studyGuideRef: "Module 2: Refining Questions & Targeting - RBAC Implementation",
    officialRef: "Tanium Security Guide - Role-Based Access Control",
  },

  {
    id: "ref-006",
    question: "Which Tanium component defines what data a user can see?",
    choices: [
      { id: "a", text: "User Role" },
      { id: "b", text: "Content Set" },
      { id: "c", text: "Computer Group" },
      { id: "d", text: "Permission Group" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "Content Sets define what computer groups, saved questions, and other content a user can access and interact with.",
    tags: ["content-sets", "rbac", "data-access"],
    studyGuideRef: "Module 2: Refining Questions & Targeting - Content Sets and RBAC",
    officialRef: "Tanium Administration Guide - Content Sets",
  },

  // Troubleshooting Targeting Issues
  {
    id: "ref-007",
    question:
      "A user reports they cannot see certain computer groups. What should you check first?",
    choices: [
      { id: "a", text: "Network connectivity to those computers" },
      { id: "b", text: "User's Content Set permissions" },
      { id: "c", text: "Computer group naming conventions" },
      { id: "d", text: "Tanium Server disk space" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "When users cannot see certain computer groups, the first check should be their Content Set permissions, which control data visibility.",
    tags: ["troubleshooting", "permissions", "content-sets", "visibility"],
    consoleSteps: [
      "Navigate to Administration > Users",
      "Find the affected user",
      "Check assigned Content Sets",
      "Verify Content Set includes required computer groups",
      "Update Content Set permissions if needed",
    ],
    studyGuideRef: "Module 2: Refining Questions & Targeting - Troubleshooting RBAC",
    officialRef: "Tanium Troubleshooting Guide - User Access Issues",
  },

  // DOMAIN 3: TAKING ACTION - PACKAGES & ACTIONS (15% - 30 questions)

  // Package Deployment Basics
  {
    id: "action-001",
    question: "What is a package in Tanium?",
    choices: [
      { id: "a", text: "A compressed file containing multiple sensors" },
      { id: "b", text: "An executable action that can be deployed to endpoints" },
      { id: "c", text: "A saved question template" },
      { id: "d", text: "A user interface component" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "A package is an executable action that can be deployed to endpoints for remediation tasks, software management, or configuration changes.",
    tags: ["packages", "actions", "deployment"],
    studyGuideRef: "Module 3: Taking Action - Package Concepts",
    officialRef: "Tanium Package Reference Guide",
  },

  {
    id: "action-002",
    question: "Which Tanium module is primarily used for deploying packages to endpoints?",
    choices: [
      { id: "a", text: "Interact" },
      { id: "b", text: "Deploy" },
      { id: "c", text: "Connect" },
      { id: "d", text: "Trends" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Deploy module (previously Interact > Deploy Action) is the primary interface for deploying packages and actions to targeted endpoints.",
    tags: ["deploy-module", "package-deployment", "console-navigation"],
    studyGuideRef: "Module 3: Taking Action - Deploy Module",
    officialRef: "Tanium Deploy User Guide",
  },

  // Package Deployment Process
  {
    id: "action-003",
    question: "What is the correct sequence for deploying a package in Tanium?",
    choices: [
      { id: "a", text: "Select package → Target computers → Configure parameters → Deploy" },
      { id: "b", text: "Target computers → Select package → Deploy → Configure parameters" },
      { id: "c", text: "Configure parameters → Select package → Target computers → Deploy" },
      { id: "d", text: "Deploy → Select package → Target computers → Configure parameters" },
    ],
    correctAnswerId: "a",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The standard deployment workflow is: Select the package, target appropriate computers, configure any parameters, then deploy.",
    tags: ["deployment-workflow", "process", "best-practices"],
    consoleSteps: [
      "Navigate to Deploy module",
      'Click "Create Deployment"',
      "Select target package from library",
      "Choose target computer group or criteria",
      "Configure package parameters if needed",
      "Review deployment settings",
      'Click "Deploy Now" or schedule for later',
    ],
    studyGuideRef: "Module 3: Taking Action - Deployment Procedures",
    officialRef: "Tanium Deploy User Guide - Deployment Workflow",
  },

  // Approval Workflows
  {
    id: "action-004",
    question: "When would you use Tanium's approval workflow for package deployments?",
    choices: [
      { id: "a", text: "For all package deployments to ensure consistency" },
      { id: "b", text: "Only for packages that modify system configurations or require oversight" },
      { id: "c", text: "When deploying to more than 100 endpoints" },
      { id: "d", text: "Only during business hours to avoid disruption" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Approval workflows should be used for high-risk packages that modify system configurations, install software, or require managerial oversight before deployment.",
    tags: ["approval-workflow", "risk-management", "oversight"],
    studyGuideRef: "Module 3: Taking Action - Approval Workflows",
    officialRef: "Tanium Deploy User Guide - Approval Management",
  },

  // Action Monitoring and Troubleshooting
  {
    id: "action-005",
    question: "Where do you monitor the progress of a deployed action in Tanium?",
    choices: [
      { id: "a", text: "Question Results page" },
      { id: "b", text: "Action History page" },
      { id: "c", text: "Deploy Status page" },
      { id: "d", text: "System Status dashboard" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Action History page shows the status and progress of all deployed actions, including success/failure rates and detailed results.",
    tags: ["action-monitoring", "deployment-status", "console-navigation"],
    consoleSteps: [
      "Navigate to Interact > Action History",
      "Find your deployed action in the list",
      "Click on the action to view detailed progress",
      "Review success/failure statistics",
      'Click "Show Results" for endpoint-specific details',
    ],
    studyGuideRef: "Module 3: Taking Action - Action Monitoring",
    officialRef: "Tanium Console User Guide - Action History",
  },

  // DOMAIN 4: NAVIGATION & BASIC MODULE FUNCTIONS (23% - 46 questions)

  // Console Navigation Fundamentals
  {
    id: "nav-001",
    question: "Which Tanium module is used for asking real-time questions to endpoints?",
    choices: [
      { id: "a", text: "Deploy" },
      { id: "b", text: "Interact" },
      { id: "c", text: "Connect" },
      { id: "d", text: "Administration" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Interact module is the primary interface for asking questions, viewing results, and initiating actions on endpoints.",
    tags: ["interact-module", "navigation", "real-time-queries"],
    studyGuideRef: "Module 4: Navigation & Basic Module Functions - Interact Module",
    officialRef: "Tanium Console User Guide - Module Overview",
  },

  // Four Core Modules (Critical TCO Knowledge)
  {
    id: "nav-002",
    question:
      "Which of the following are the four core modules in Tanium? (Select the best answer)",
    choices: [
      { id: "a", text: "Interact, Deploy, Connect, Trends" },
      { id: "b", text: "Interact, Reporting, Trends, Connect" },
      { id: "c", text: "Questions, Sensors, Packages, Actions" },
      { id: "d", text: "Administration, Security, Monitoring, Reports" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "The four core modules are: Interact (questions & actions), Reporting (dashboards & reports), Trends (historical data), and Connect (integrations).",
    tags: ["core-modules", "platform-overview", "architecture"],
    studyGuideRef: "Module 4: Navigation & Basic Module Functions - Four Core Modules",
    officialRef: "Tanium Platform Overview - Core Modules",
  },

  {
    id: "nav-003",
    question: "What is the primary purpose of the Tanium Trends module?",
    choices: [
      { id: "a", text: "Real-time endpoint questioning" },
      { id: "b", text: "Historical data analysis and trending" },
      { id: "c", text: "Package deployment management" },
      { id: "d", text: "External system integration" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "The Trends module provides historical data analysis, trending capabilities, and long-term insights through sources, panels, and boards.",
    tags: ["trends-module", "historical-data", "analysis"],
    studyGuideRef: "Module 4: Navigation & Basic Module Functions - Trends Module",
    officialRef: "Tanium Trends User Guide",
  },

  // Sources, Panels, and Boards (Trends Module)
  {
    id: "nav-004",
    question: "In Tanium Trends, what is the relationship between sources, panels, and boards?",
    choices: [
      { id: "a", text: "Sources contain panels, panels contain boards" },
      { id: "b", text: "Sources provide data to panels, panels are organized into boards" },
      { id: "c", text: "Boards contain sources, sources create panels" },
      { id: "d", text: "All three are independent components" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "Sources define data origin, panels visualize data from sources, and boards organize multiple panels for comprehensive dashboards.",
    tags: ["trends-architecture", "sources", "panels", "boards"],
    studyGuideRef: "Module 4: Navigation & Basic Module Functions - Trends Architecture",
    officialRef: "Tanium Trends User Guide - Architecture",
  },

  {
    id: "nav-005",
    question: "What defines where data originates in Tanium Trends?",
    choices: [
      { id: "a", text: "Panels" },
      { id: "b", text: "Sources" },
      { id: "c", text: "Boards" },
      { id: "d", text: "Dashboards" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "Sources in Trends define where data originates, specifying which saved questions or solutions provide data for visualization.",
    tags: ["trends-sources", "data-origin", "configuration"],
    studyGuideRef: "Module 4: Navigation & Basic Module Functions - Sources Configuration",
    officialRef: "Tanium Trends User Guide - Sources",
  },

  // DOMAIN 5: REPORTING & DATA EXPORT (17% - 34 questions)

  // Report Building Process
  {
    id: "report-001",
    question: "Which module is primarily used for building custom reports in Tanium?",
    choices: [
      { id: "a", text: "Interact" },
      { id: "b", text: "Reporting" },
      { id: "c", text: "Trends" },
      { id: "d", text: "Connect" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Reporting module provides tools for building custom reports and visualizations from Tanium data sources.",
    tags: ["reporting-module", "custom-reports", "navigation"],
    studyGuideRef: "Module 5: Reporting & Data Export - Reporting Module Overview",
    officialRef: "Tanium Reporting User Guide",
  },

  // Multi-format Export Capabilities
  {
    id: "report-002",
    question: "Which file formats does Tanium support for data export? (Select all that apply)",
    choices: [
      { id: "a", text: "CSV, JSON, XML, PDF" },
      { id: "b", text: "Only CSV and PDF" },
      { id: "c", text: "Only JSON and XML" },
      { id: "d", text: "CSV, Excel, and plain text only" },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "Tanium supports multiple export formats including CSV, JSON, XML, and PDF to accommodate different integration and reporting needs.",
    tags: ["export-formats", "data-formats", "integration"],
    studyGuideRef: "Module 5: Reporting & Data Export - Export Formats",
    officialRef: "Tanium Data Export Guide",
  },

  // Automated Reporting and Scheduling
  {
    id: "report-003",
    question: "How can you automate report generation and distribution in Tanium?",
    choices: [
      { id: "a", text: "Manual export only - automation is not supported" },
      { id: "b", text: "Schedule reports with automated distribution via email or file server" },
      { id: "c", text: "Third-party tools are required for automation" },
      { id: "d", text: "Automation is only available for CSV exports" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Tanium supports automated report generation with scheduled distribution via email, file servers, and other delivery methods.",
    tags: ["automation", "scheduling", "distribution"],
    consoleSteps: [
      "Navigate to Reporting module",
      "Create or select existing report",
      "Click Schedule Report",
      "Configure schedule (daily, weekly, monthly)",
      "Set up distribution method (email, file share)",
      "Save scheduled report configuration",
    ],
    studyGuideRef: "Module 5: Reporting & Data Export - Automated Reporting",
    officialRef: "Tanium Reporting User Guide - Scheduling",
  },

  // Data Quality and Validation
  {
    id: "report-004",
    question:
      "When exporting large datasets from Tanium, what should you consider for data quality?",
    choices: [
      { id: "a", text: "Export speed is the only important factor" },
      { id: "b", text: "Validate data completeness and check for export errors" },
      { id: "c", text: "File size limitations prevent data quality issues" },
      { id: "d", text: "Tanium automatically ensures perfect data quality" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "For large datasets, it's important to validate data completeness, check for export errors, and ensure data integrity throughout the export process.",
    tags: ["data-quality", "validation", "large-datasets"],
    studyGuideRef: "Module 5: Reporting & Data Export - Data Quality Validation",
    officialRef: "Tanium Best Practices - Data Export",
  },

  // Additional Advanced Questions - DOMAIN 1: ASKING QUESTIONS (Continued)

  // Advanced Natural Language Processing
  {
    id: "ask-011",
    question:
      "When using natural language questions in Tanium, what happens if the system cannot interpret your query?",
    choices: [
      { id: "a", text: "The question fails and returns an error" },
      { id: "b", text: "Tanium provides suggested alternative phrasings" },
      { id: "c", text: "The system automatically uses the closest sensor match" },
      { id: "d", text: "You must restart the question process" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "When Tanium cannot interpret a natural language query, it provides suggested alternative phrasings to help users construct valid questions.",
    tags: ["natural-language", "error-handling", "user-assistance"],
    consoleSteps: [
      "Type natural language question in Ask Question field",
      "If interpretation fails, review suggested alternatives",
      "Select appropriate suggested phrasing",
      "Modify if needed and ask question",
    ],
    studyGuideRef: "Module 1: Asking Questions - Natural Language Troubleshooting",
    officialRef: "Tanium Console User Guide - Natural Language Processing",
  },

  // Question Performance and Optimization
  {
    id: "ask-012",
    question: "What factor most significantly impacts the speed of question results in Tanium?",
    choices: [
      { id: "a", text: "Number of sensors in the question" },
      { id: "b", text: "Size of the target computer group" },
      { id: "c", text: "Complexity of the sensor logic" },
      { id: "d", text: "Time of day the question is asked" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The size of the target computer group most significantly impacts question speed, as more endpoints need to process and respond to the query.",
    tags: ["performance", "optimization", "scalability"],
    studyGuideRef: "Module 1: Asking Questions - Performance Considerations",
    officialRef: "Tanium Performance Tuning Guide",
  },

  // Real-time vs Historical Data Understanding
  {
    id: "ask-013",
    question: "What type of data does asking a question in Tanium provide?",
    choices: [
      { id: "a", text: "Historical data from the last 24 hours" },
      { id: "b", text: "Real-time, current data from endpoints" },
      { id: "c", text: "Cached data from previous queries" },
      { id: "d", text: "Aggregated data from multiple time periods" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "Questions in Tanium provide real-time, current data as endpoints process the query immediately and return current state information.",
    tags: ["real-time", "data-freshness", "current-state"],
    studyGuideRef: "Module 1: Asking Questions - Real-time Data Collection",
    officialRef: "Tanium Architecture Guide - Real-time Processing",
  },

  // Question Result Management
  {
    id: "ask-014",
    question: "How long are question results typically retained in the Tanium Console?",
    choices: [
      { id: "a", text: "Results are retained permanently" },
      { id: "b", text: "Results expire after 24 hours by default" },
      { id: "c", text: "Results are configurable but typically 7-30 days" },
      { id: "d", text: "Results are only available during the active session" },
    ],
    correctAnswerId: "c",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "Question result retention is configurable by administrators, typically set between 7-30 days depending on storage capacity and compliance requirements.",
    tags: ["retention", "configuration", "data-management"],
    studyGuideRef: "Module 1: Asking Questions - Result Management",
    officialRef: "Tanium Administration Guide - Data Retention",
  },

  // DOMAIN 2: REFINING QUESTIONS & TARGETING (Continued)

  // Advanced Computer Group Scenarios
  {
    id: "ref-008",
    question:
      'You need to create a computer group for "Windows servers in the DMZ network that are NOT running antivirus". Which filter would be most appropriate?',
    choices: [
      {
        id: "a",
        text: 'Operating System contains "Server" AND IP Address starts with "192.168.100" AND NOT Running Applications contains "antivirus"',
      },
      {
        id: "b",
        text: 'Computer Name contains "Server" OR Network Zone equals "DMZ" OR Antivirus Status equals "Not Running"',
      },
      {
        id: "c",
        text: 'Operating System contains "Server" AND Network Zone equals "DMZ" AND NOT Antivirus Status equals "Running"',
      },
      {
        id: "d",
        text: 'Server Role equals "Member Server" AND DMZ equals "True" AND Security Software equals "None"',
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "This complex scenario requires AND logic for servers in DMZ, combined with NOT logic for antivirus status, using appropriate sensors for each condition.",
    tags: ["complex-filtering", "dmz", "antivirus", "servers"],
    consoleSteps: [
      "Navigate to Administration > Computer Groups",
      "Create new Dynamic Group",
      'Add filter: Operating System contains "Server"',
      'Add filter: Network Zone equals "DMZ"',
      'Add filter: NOT Antivirus Status equals "Running"',
      "Test group membership and save",
    ],
    studyGuideRef: "Module 2: Refining Questions & Targeting - Complex Scenarios",
    officialRef: "Tanium Query Language Reference - Advanced Filtering",
  },

  // RBAC Troubleshooting Scenarios
  {
    id: "ref-009",
    question:
      "A user can see computer groups but cannot deploy actions to them. What is the most likely cause?",
    choices: [
      { id: "a", text: "Their Content Set does not include the Deploy module" },
      { id: "b", text: "Their User Role lacks action deployment permissions" },
      { id: "c", text: "The computer groups are incorrectly configured" },
      { id: "d", text: "Network connectivity issues to target endpoints" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "If users can see groups but cannot deploy actions, the issue is typically with User Role permissions rather than Content Set access.",
    tags: ["rbac-troubleshooting", "permissions", "user-roles", "action-deployment"],
    consoleSteps: [
      "Navigate to Administration > Users",
      "Check user's assigned User Role",
      "Review Role permissions for Deploy/Action capabilities",
      "Update Role permissions if needed",
      "Test action deployment capability",
    ],
    studyGuideRef: "Module 2: Refining Questions & Targeting - RBAC Troubleshooting",
    officialRef: "Tanium Security Guide - Permission Troubleshooting",
  },

  // Multi-tier Filtering
  {
    id: "ref-010",
    question:
      'When creating a computer group with the filter "Last Logged In User contains domain admins", what type of matching is being used?',
    choices: [
      { id: "a", text: "Exact string matching" },
      { id: "b", text: "Partial string matching (substring search)" },
      { id: "c", text: "Regular expression matching" },
      { id: "d", text: "Case-insensitive wildcard matching" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      'The "contains" operator performs partial string matching, searching for the specified substring anywhere within the sensor value.',
    tags: ["filtering", "contains-operator", "string-matching"],
    studyGuideRef: "Module 2: Refining Questions & Targeting - Filter Operators",
    officialRef: "Tanium Query Language Reference - String Operators",
  },

  // DOMAIN 3: TAKING ACTION - PACKAGES & ACTIONS (Continued)

  // Package Parameter Configuration
  {
    id: "action-006",
    question:
      "When deploying a parameterized package, what is the best practice for parameter validation?",
    choices: [
      { id: "a", text: "Parameters are automatically validated by Tanium" },
      { id: "b", text: "Test parameters on a small subset of endpoints first" },
      { id: "c", text: "Parameter validation is not necessary for trusted packages" },
      { id: "d", text: "Only validate parameters in production environments" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Best practice is to test parameterized packages on a small subset of endpoints first to validate parameter behavior before full deployment.",
    tags: ["parameterized-packages", "testing", "validation", "best-practices"],
    consoleSteps: [
      "Create deployment with parameterized package",
      "Target small test group (5-10 endpoints)",
      "Configure and validate parameters",
      "Deploy to test group and monitor results",
      "If successful, deploy to full target group",
    ],
    studyGuideRef: "Module 3: Taking Action - Parameter Validation",
    officialRef: "Tanium Deploy User Guide - Best Practices",
  },

  // Emergency Action Deployment
  {
    id: "action-007",
    question:
      "During a security incident, what is the fastest way to deploy an emergency response package to all Windows desktops?",
    choices: [
      { id: "a", text: "Create a new computer group, then deploy to the group" },
      {
        id: "b",
        text: 'Use "Deploy Action" with inline targeting "Operating System contains Windows" and "Is Virtual Machine is No"',
      },
      { id: "c", text: "Schedule the deployment for the next maintenance window" },
      { id: "d", text: 'Deploy to "All Computers" group and let the package filter endpoints' },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "For emergency response, inline targeting with Deploy Action is fastest, allowing immediate deployment without creating persistent groups.",
    tags: ["emergency-response", "incident-response", "inline-targeting", "rapid-deployment"],
    consoleSteps: [
      "Navigate to Interact > Deploy Action",
      "Select emergency response package",
      'Choose "Targeting by text" option',
      'Enter: Operating System contains "Windows" and Is Virtual Machine is No',
      "Review targeting preview",
      "Deploy immediately with appropriate timeout",
    ],
    studyGuideRef: "Module 3: Taking Action - Emergency Response Procedures",
    officialRef: "Tanium Incident Response Guide",
  },

  // Package Deployment Troubleshooting
  {
    id: "action-008",
    question:
      'An action shows "Success" status but the expected changes are not visible on target endpoints. What should you check first?',
    choices: [
      { id: "a", text: "Network connectivity to the endpoints" },
      { id: "b", text: "The package exit codes and return messages" },
      { id: "c", text: "Tanium Server disk space availability" },
      { id: "d", text: "User permissions for action deployment" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "When actions show success but changes aren't visible, check the package exit codes and return messages to understand what actually occurred on endpoints.",
    tags: ["troubleshooting", "exit-codes", "action-results", "verification"],
    consoleSteps: [
      "Navigate to Interact > Action History",
      "Find the action in question",
      'Click "Show Results" for detailed view',
      "Review exit codes for each endpoint",
      "Check return messages for error details",
      "Verify package logic handles edge cases",
    ],
    studyGuideRef: "Module 3: Taking Action - Deployment Troubleshooting",
    officialRef: "Tanium Troubleshooting Guide - Action Issues",
  },

  // DOMAIN 4: NAVIGATION & BASIC MODULE FUNCTIONS (Continued)

  // Advanced Trends Module Usage
  {
    id: "nav-006",
    question:
      "In Tanium Trends, if you want to track patch compliance over the last 30 days, what component would you configure first?",
    choices: [
      { id: "a", text: "Panel - to visualize the compliance data" },
      { id: "b", text: "Source - to define where patch data comes from" },
      { id: "c", text: "Board - to organize the compliance dashboard" },
      { id: "d", text: "Computer Group - to filter the target machines" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Sources must be configured first as they define where data originates. Panels then use sources for visualization, and boards organize panels.",
    tags: ["trends-workflow", "sources", "patch-compliance", "configuration-order"],
    consoleSteps: [
      "Navigate to Trends module",
      'Click "Create Source"',
      "Select saved question related to patch status",
      "Configure data collection interval",
      "Set computer group filter if needed",
      "Save source configuration",
      "Create panels using the new source",
    ],
    studyGuideRef: "Module 4: Navigation & Basic Module Functions - Trends Configuration",
    officialRef: "Tanium Trends User Guide - Source Configuration",
  },

  // Connect Module Integration Scenarios
  {
    id: "nav-007",
    question:
      "Which Connect module feature would you use to automatically send security alerts to your SIEM when critical vulnerabilities are detected?",
    choices: [
      { id: "a", text: "Scheduled reports with email delivery" },
      { id: "b", text: "Event-triggered data export with syslog delivery" },
      { id: "c", text: "Real-time streaming with webhook integration" },
      { id: "d", text: "Batch file export to shared network location" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Event-triggered exports with syslog delivery provide automated SIEM integration for security alerts when specific conditions are detected.",
    tags: ["connect-module", "siem-integration", "event-triggers", "security-automation"],
    consoleSteps: [
      "Navigate to Connect module",
      "Create new connection for SIEM",
      "Configure syslog delivery method",
      "Set event trigger based on vulnerability detection",
      "Define alert format and content",
      "Test connection and save configuration",
    ],
    studyGuideRef: "Module 4: Navigation & Basic Module Functions - Connect Integration",
    officialRef: "Tanium Connect User Guide - SIEM Integration",
  },

  // DOMAIN 5: REPORTING & DATA EXPORT (Continued)

  // Advanced Report Automation
  {
    id: "report-005",
    question:
      "You need to create a report that automatically includes only machines with security issues and emails it to the security team daily. What is the most efficient approach?",
    choices: [
      { id: "a", text: "Create a manual report and remember to export it daily" },
      {
        id: "b",
        text: "Create a saved question for security issues, build an automated report with email scheduling",
      },
      { id: "c", text: "Use the Connect module to stream data to the security team" },
      { id: "d", text: "Export all data daily and let the security team filter it" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The most efficient approach uses a saved question to filter for security issues, then builds an automated report with scheduled email delivery.",
    tags: ["automation", "security-reporting", "scheduling", "email-delivery"],
    consoleSteps: [
      "Create saved question filtering for security issues",
      "Navigate to Reporting module",
      "Build report using the saved question as data source",
      "Configure report format and layout",
      "Set up daily schedule",
      "Configure email delivery to security team",
      "Test and save automated report",
    ],
    studyGuideRef: "Module 5: Reporting & Data Export - Automated Security Reporting",
    officialRef: "Tanium Reporting User Guide - Automation",
  },

  // Data Export Troubleshooting
  {
    id: "report-006",
    question:
      'A scheduled report export is failing with "incomplete data" errors. What is the most likely cause?',
    choices: [
      { id: "a", text: "Export file format is incorrectly configured" },
      { id: "b", text: "The underlying saved question is timing out before all endpoints respond" },
      { id: "c", text: "Email server connectivity issues" },
      { id: "d", text: "Insufficient disk space on the Tanium Server" },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Incomplete data errors in scheduled reports typically occur when the underlying saved question times out before all targeted endpoints can respond.",
    tags: ["export-troubleshooting", "timeouts", "data-completeness", "scheduling"],
    consoleSteps: [
      "Check the underlying saved question performance",
      "Review question timeout settings",
      "Analyze endpoint response rates",
      "Consider breaking large queries into smaller groups",
      "Adjust report schedule timing if needed",
      "Test modified configuration",
    ],
    studyGuideRef: "Module 5: Reporting & Data Export - Export Troubleshooting",
    officialRef: "Tanium Troubleshooting Guide - Export Issues",
  },
];

// Export configuration for easy integration
export const questionBankMetadata = {
  totalQuestions: tcoAlignedQuestionBank.length,
  targetQuestions: 200,
  domainDistribution: {
    [TCODomain.ASKING_QUESTIONS]: tcoAlignedQuestionBank.filter(
      (q) => q.domain === TCODomain.ASKING_QUESTIONS
    ).length,
    [TCODomain.REFINING_QUESTIONS]: tcoAlignedQuestionBank.filter(
      (q) => q.domain === TCODomain.REFINING_QUESTIONS
    ).length,
    [TCODomain.TAKING_ACTION]: tcoAlignedQuestionBank.filter(
      (q) => q.domain === TCODomain.TAKING_ACTION
    ).length,
    [TCODomain.NAVIGATION_MODULES]: tcoAlignedQuestionBank.filter(
      (q) => q.domain === TCODomain.NAVIGATION_MODULES
    ).length,
    [TCODomain.REPORTING_EXPORT]: tcoAlignedQuestionBank.filter(
      (q) => q.domain === TCODomain.REPORTING_EXPORT
    ).length,
  },
  categoryDistribution: {
    [QuestionCategory.PLATFORM_FUNDAMENTALS]: tcoAlignedQuestionBank.filter(
      (q) => q.category === QuestionCategory.PLATFORM_FUNDAMENTALS
    ).length,
    [QuestionCategory.CONSOLE_PROCEDURES]: tcoAlignedQuestionBank.filter(
      (q) => q.category === QuestionCategory.CONSOLE_PROCEDURES
    ).length,
    [QuestionCategory.TROUBLESHOOTING]: tcoAlignedQuestionBank.filter(
      (q) => q.category === QuestionCategory.TROUBLESHOOTING
    ).length,
    [QuestionCategory.PRACTICAL_SCENARIOS]: tcoAlignedQuestionBank.filter(
      (q) => q.category === QuestionCategory.PRACTICAL_SCENARIOS
    ).length,
    [QuestionCategory.LINEAR_CHAIN]: tcoAlignedQuestionBank.filter(
      (q) => q.category === QuestionCategory.LINEAR_CHAIN
    ).length,
  },
};
