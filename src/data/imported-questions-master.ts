import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * Complete Imported Question Bank
 * Imported from legacy TCO questions_master.json
 * Total: 200 questions
 *
 * Distribution:
 * Asking Questions: 43 questions
 * Refining Questions & Targeting: 45 questions
 * Taking Action - Packages & Actions: 34 questions
 * Navigation & Basic Module Functions: 45 questions
 * Reporting & Data Export: 33 questions
 */

export const importedQuestionBank: Question[] = [
  {
    id: "TCO-AQ-0001",
    question: "What is the primary module used to ask real-time questions of Tanium endpoints?",
    choices: [
      {
        id: "a",
        text: "Deploy",
      },
      {
        id: "b",
        text: "Interact",
      },
      {
        id: "c",
        text: "Asset",
      },
      {
        id: "d",
        text: "Connect",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PLATFORM_FUNDAMENTALS,
    explanation:
      "Interact is the console module specifically designed for asking questions of endpoints in real time using natural language. Deploy is for action execution, Asset is for inventory management, and Connect is for data export to external systems.",
    tags: ["interact-module", "real-time-queries", "basic-concepts"],
    studyGuideRef: "tco-study-path/interact-overview",
  },
  {
    id: "TCO-AQ-0002",
    question:
      "When constructing a natural language query to find Windows systems with high CPU usage, which syntax correctly filters for systems with CPU usage greater than 80%?",
    choices: [
      {
        id: "a",
        text: "Get Computer Name from Windows machines with CPU Usage > 80%",
      },
      {
        id: "b",
        text: 'Get Computer Name from machines with Operating System contains "Windows" and CPU Usage is greater than "80"',
      },
      {
        id: "c",
        text: "Select Computer Name where OS = Windows and CPU > 80",
      },
      {
        id: "d",
        text: "Find computers with Windows and high CPU usage",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option B uses correct Tanium natural language syntax with 'from machines with' for filtering conditions. The syntax requires 'contains' for partial string matching and 'is greater than' for numeric comparisons with quoted values. Option A uses SQL-like syntax which Tanium doesn't support. Option C uses SQL SELECT syntax. Option D is too vague and not proper Tanium query syntax.",
    tags: ["natural-language", "query-syntax", "filtering", "cpu-usage"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "university/interact-mastery",
  },
  {
    id: "TCO-AQ-0003",
    question: "What are sensors in the Tanium platform?",
    choices: [
      {
        id: "a",
        text: "Hardware devices that monitor network traffic",
      },
      {
        id: "b",
        text: "Scripts or queries that run on endpoints to retrieve data",
      },
      {
        id: "c",
        text: "Configuration files that define user permissions",
      },
      {
        id: "d",
        text: "Reports that summarize system performance",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Sensors are scripts or queries that execute on endpoints to collect and return specific data such as CPU usage, installed programs, registry keys, etc. They are not hardware devices, configuration files, or reports.",
    tags: ["sensors", "data-collection", "endpoints"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-AQ-0004",
    question:
      "You want to find all machines running a specific service called 'TaniumClient'. Which natural language query would be most appropriate?",
    choices: [
      {
        id: "a",
        text: 'Get Computer Name and Service Status from machines with Service Name contains "TaniumClient"',
      },
      {
        id: "b",
        text: "Find TaniumClient service on all computers",
      },
      {
        id: "c",
        text: "Get TaniumClient from machines with Service Running",
      },
      {
        id: "d",
        text: "Show me computers running TaniumClient service",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option A uses proper Tanium syntax with 'Get' followed by the desired data columns, 'from machines with' for filtering, and 'contains' for partial string matching. This query will return both the computer names and service status for machines where the service name contains 'TaniumClient'. The other options don't follow proper Tanium natural language syntax.",
    tags: ["services", "natural-language", "query-construction"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "university/interact-mastery",
  },
  {
    id: "TCO-AQ-0005",
    question:
      "A query 'Get Computer Name from machines with Operating System contains \"Windows\"' returns no results, but you know Windows machines exist in your environment. What is the most likely troubleshooting approach?",
    choices: [
      {
        id: "a",
        text: "The query syntax is incorrect and needs to be rewritten",
      },
      {
        id: "b",
        text: "Check client connectivity and ensure target machines are online",
      },
      {
        id: "c",
        text: "Windows machines don't support the Operating System sensor",
      },
      {
        id: "d",
        text: "Add quotation marks around Windows for proper string matching",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "When a syntactically correct query returns no results despite knowing systems should match, the most common issue is client connectivity. Offline clients cannot respond to queries. The syntax in the question is correct, Windows machines do support the Operating System sensor, and quotation marks are already properly used.",
    tags: ["troubleshooting", "client-connectivity", "query-results"],
    studyGuideRef: "tco-study-path/troubleshooting",
  },
  {
    id: "TCO-RQ-0001",
    question: "What are the two main types of computer groups in Tanium?",
    choices: [
      {
        id: "a",
        text: "Local and Remote groups",
      },
      {
        id: "b",
        text: "Dynamic and Static groups",
      },
      {
        id: "c",
        text: "Active and Inactive groups",
      },
      {
        id: "d",
        text: "Public and Private groups",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Tanium supports Dynamic groups (membership determined automatically by filter criteria) and Static groups (membership manually defined and maintained). These are the two fundamental group types for organizing and targeting endpoints.",
    tags: ["computer-groups", "dynamic-groups", "static-groups"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RQ-0002",
    question:
      "You want to create a dynamic computer group for all Windows 10 workstations with less than 4GB of RAM. What filter criteria would be appropriate?",
    choices: [
      {
        id: "a",
        text: 'Operating System = "Windows 10" AND Computer Type = "Workstation" AND RAM < "4000"',
      },
      {
        id: "b",
        text: 'Operating System contains "Windows 10" and Computer Type equals "Workstation" and RAM is less than "4000"',
      },
      {
        id: "c",
        text: "OS = Win10 & Type = Desktop & Memory < 4GB",
      },
      {
        id: "d",
        text: "Windows 10 computers with low memory",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option B uses correct Tanium filter syntax with 'contains' for partial string matching on OS, 'equals' for exact computer type matching, and 'is less than' for numeric RAM comparison with proper quoting. Option A uses SQL-like syntax, Option C uses abbreviated terms and symbols not supported by Tanium, and Option D is not proper filter syntax.",
    tags: ["dynamic-groups", "filter-criteria", "targeting"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-RQ-0003",
    question: "What does RBAC stand for in the context of Tanium security?",
    choices: [
      {
        id: "a",
        text: "Role-Based Access Control",
      },
      {
        id: "b",
        text: "Rule-Based Authentication Check",
      },
      {
        id: "c",
        text: "Remote Backup Access Control",
      },
      {
        id: "d",
        text: "Resource-Based Application Control",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "RBAC stands for Role-Based Access Control, which is the security model Tanium uses to control what users can access and what actions they can perform based on their assigned roles and permissions.",
    tags: ["rbac", "security", "access-control"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RQ-0004",
    question:
      "A dynamic computer group is not updating its membership despite meeting the defined criteria. What would be the most systematic troubleshooting approach?",
    choices: [
      {
        id: "a",
        text: "Recreate the group with the same criteria",
      },
      {
        id: "b",
        text: "Check if the sensor data is current and clients are reporting properly",
      },
      {
        id: "c",
        text: "Convert the group to a static group and add members manually",
      },
      {
        id: "d",
        text: "Wait 24 hours for the automatic group refresh cycle",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Dynamic groups depend on current sensor data from clients. If clients aren't reporting updated data or are offline, group membership won't update properly. Checking sensor data freshness and client connectivity is the most systematic first step. Recreating the group doesn't address the root cause, converting to static defeats the purpose, and there's no standard 24-hour refresh cycle.",
    tags: ["dynamic-groups", "troubleshooting", "group-membership"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RQ-0005",
    question:
      "When implementing least privilege principles in Tanium, what should be the primary focus for computer group assignments?",
    choices: [
      {
        id: "a",
        text: "Assign users to as many groups as possible for maximum flexibility",
      },
      {
        id: "b",
        text: "Give users access only to the computer groups necessary for their job functions",
      },
      {
        id: "c",
        text: "Create one large group containing all computers for simplicity",
      },
      {
        id: "d",
        text: "Avoid using computer groups and rely on individual computer targeting",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Least privilege principles require limiting access to the minimum necessary for job functions. Users should only have access to computer groups that contain systems they need to manage or monitor for their specific role. This minimizes security risk and prevents accidental impact on unrelated systems.",
    tags: ["least-privilege", "rbac", "security"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "blueprint/operator-competencies",
  },
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
    category: QuestionCategory.PRACTICAL_SCENARIOS,
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
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The proper workflow involves selecting an existing restart service package, configuring it with the correct service name parameters, targeting only the appropriate server group, and following proper approval workflows before deployment. This ensures controlled, targeted action execution.",
    tags: ["package-deployment", "service-restart", "workflow"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "university/action-deployment",
  },
  {
    id: "TCO-TA-0003",
    question: "What is the purpose of approval workflows in Tanium action deployment?",
    choices: [
      {
        id: "a",
        text: "To automatically distribute actions faster across the network",
      },
      {
        id: "b",
        text: "To provide authorization controls and prevent unauthorized actions",
      },
      {
        id: "c",
        text: "To compress action data for more efficient transmission",
      },
      {
        id: "d",
        text: "To schedule actions for execution during maintenance windows",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Approval workflows provide authorization controls to ensure that actions are reviewed and authorized by appropriate personnel before execution. This prevents unauthorized or potentially harmful actions from being deployed to endpoints.",
    tags: ["approval-workflows", "authorization", "security"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-TA-0004",
    question:
      "An action deployment shows 80% success rate with 20% failures. What should be your first troubleshooting step?",
    choices: [
      {
        id: "a",
        text: "Immediately retry the action on all failed endpoints",
      },
      {
        id: "b",
        text: "Examine the error messages and failure patterns to identify common causes",
      },
      {
        id: "c",
        text: "Increase the action timeout settings and redeploy",
      },
      {
        id: "d",
        text: "Convert the failed endpoints to a static group for later retry",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "The first step should always be to analyze the failure patterns and error messages to understand why the action failed. This analysis can reveal common issues like insufficient permissions, missing dependencies, or platform incompatibilities that need to be addressed before retry attempts.",
    tags: ["action-troubleshooting", "failure-analysis", "error-handling"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-TA-0005",
    question:
      "When deploying a package that requires elevated privileges, what should you verify before deployment?",
    choices: [
      {
        id: "a",
        text: "The target computers have sufficient disk space",
      },
      {
        id: "b",
        text: "The Tanium Client is running with appropriate administrative rights",
      },
      {
        id: "c",
        text: "The network bandwidth can support the package size",
      },
      {
        id: "d",
        text: "The package is digitally signed by Microsoft",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Packages requiring elevated privileges need the Tanium Client to be running with appropriate administrative rights on the target systems. Without proper privileges, the package execution will fail regardless of other factors like disk space or bandwidth.",
    tags: ["elevated-privileges", "client-permissions", "deployment"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-NB-0001",
    question:
      "Which navigation menu provides access to the main Tanium modules like Interact, Deploy, and Asset?",
    choices: [
      {
        id: "a",
        text: "The top toolbar",
      },
      {
        id: "b",
        text: "The main menu (hamburger icon)",
      },
      {
        id: "c",
        text: "The user settings dropdown",
      },
      {
        id: "d",
        text: "The help documentation links",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The main menu, typically represented by a hamburger icon (three horizontal lines), provides access to all primary Tanium modules including Interact, Deploy, Asset, Administration, and others. This is the primary navigation method in the Tanium Console.",
    tags: ["console-navigation", "main-menu", "interface"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0002",
    question:
      "You need to quickly switch between the Interact module and Deploy module multiple times. What is the most efficient navigation method?",
    choices: [
      {
        id: "a",
        text: "Use the main menu to navigate to each module every time",
      },
      {
        id: "b",
        text: "Open both modules in separate browser tabs",
      },
      {
        id: "c",
        text: "Use the module tabs at the top of the interface for quick switching",
      },
      {
        id: "d",
        text: "Use browser bookmarks for each module",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Module tabs at the top of the Tanium Console interface provide the fastest way to switch between recently used modules. Once modules are opened, they remain accessible via tabs for quick navigation without going through the main menu repeatedly.",
    tags: ["navigation-efficiency", "module-tabs", "workflow"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0003",
    question: "Where would you find user account settings and preferences in the Tanium Console?",
    choices: [
      {
        id: "a",
        text: "Main Menu > Administration",
      },
      {
        id: "b",
        text: "Top-right corner user name dropdown",
      },
      {
        id: "c",
        text: "Main Menu > Settings",
      },
      {
        id: "d",
        text: "Help menu > Preferences",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "User account settings and preferences are accessed by clicking on the user name in the top-right corner of the Tanium Console, which opens a dropdown menu with options like Settings, Preferences, and Logout.",
    tags: ["user-settings", "preferences", "interface"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0004",
    question:
      "You want to view detailed information about a specific computer in your environment. Which module and section would be most appropriate?",
    choices: [
      {
        id: "a",
        text: "Interact > Ask a Question",
      },
      {
        id: "b",
        text: "Asset > Computer Details",
      },
      {
        id: "c",
        text: "Deploy > Action History",
      },
      {
        id: "d",
        text: "Administration > Computer Groups",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Asset module's Computer Details section provides comprehensive information about individual computers including hardware specifications, software inventory, network configuration, and system details. This is the dedicated area for detailed computer information.",
    tags: ["asset-module", "computer-details", "system-information"],
    officialRef: "module/asset",
  },
  {
    id: "TCO-NB-0005",
    question:
      "A user reports they cannot access the Deploy module, but they can see Interact and Asset. What is the most likely cause and resolution?",
    choices: [
      {
        id: "a",
        text: "The Deploy module is not installed, contact Tanium support for licensing",
      },
      {
        id: "b",
        text: "Check the user's role permissions to ensure Deploy module access is granted",
      },
      {
        id: "c",
        text: "The user's browser needs to be updated to support the Deploy interface",
      },
      {
        id: "d",
        text: "Clear browser cache and cookies to resolve the interface issue",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Module access in Tanium is controlled by user roles and permissions. If a user can access some modules but not others, it indicates a role permission issue rather than a technical problem. The user's role needs to be updated to include Deploy module access permissions.",
    tags: ["module-access", "permissions", "troubleshooting"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RD-0001",
    question: "What are the most common export formats available for Tanium query results?",
    choices: [
      {
        id: "a",
        text: "DOC, PPT, XLS, PDF",
      },
      {
        id: "b",
        text: "CSV, JSON, XML, PDF",
      },
      {
        id: "c",
        text: "TXT, RTF, HTML, ZIP",
      },
      {
        id: "d",
        text: "SQL, DAT, LOG, BAK",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Tanium supports CSV (for spreadsheet analysis), JSON (for programmatic processing), XML (for structured data exchange), and PDF (for presentation reports) as the primary export formats for query results and reports.",
    tags: ["export-formats", "data-export", "reporting"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0002",
    question:
      "You need to export system inventory data for analysis in Excel. Which export format would be most appropriate?",
    choices: [
      {
        id: "a",
        text: "JSON for structured data processing",
      },
      {
        id: "b",
        text: "CSV for easy import into Excel spreadsheets",
      },
      {
        id: "c",
        text: "XML for data exchange with other systems",
      },
      {
        id: "d",
        text: "PDF for presentation to management",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "CSV (Comma Separated Values) format is ideal for Excel analysis as it can be directly opened in Excel, maintains data structure in rows and columns, and allows for easy sorting, filtering, and analysis of the inventory data.",
    tags: ["csv-export", "excel-analysis", "data-format"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0003",
    question: "What is the primary benefit of using scheduled reports in Tanium?",
    choices: [
      {
        id: "a",
        text: "Reports run faster when scheduled",
      },
      {
        id: "b",
        text: "Automated generation and distribution of regular reports",
      },
      {
        id: "c",
        text: "Scheduled reports use fewer system resources",
      },
      {
        id: "d",
        text: "Reports can only be exported when scheduled",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Scheduled reports provide automation for generating and distributing regular reports without manual intervention. This ensures stakeholders receive consistent, timely reports for compliance, management, or operational purposes.",
    tags: ["scheduled-reports", "automation", "report-distribution"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0004",
    question:
      "A large data export (50,000+ records) keeps timing out during the export process. What is the most effective solution?",
    choices: [
      {
        id: "a",
        text: "Increase browser timeout settings to allow longer exports",
      },
      {
        id: "b",
        text: "Break the export into smaller chunks using time periods or computer groups",
      },
      {
        id: "c",
        text: "Switch to a different export format that handles large datasets better",
      },
      {
        id: "d",
        text: "Export during off-peak hours when the system is less busy",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Breaking large exports into smaller, manageable chunks is the most reliable solution for handling large datasets. This can be done by filtering results by time periods, computer groups, or other criteria to create multiple smaller exports that are less likely to timeout.",
    tags: ["large-exports", "performance", "data-management"],
  },
  {
    id: "TCO-RD-0005",
    question: "When validating exported data quality, what should be your first verification step?",
    choices: [
      {
        id: "a",
        text: "Check if the file opens correctly in the target application",
      },
      {
        id: "b",
        text: "Verify the record count matches the console display",
      },
      {
        id: "c",
        text: "Confirm all special characters are properly encoded",
      },
      {
        id: "d",
        text: "Test the data import process in the destination system",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Verifying that the exported record count matches what was displayed in the console ensures data completeness and is the most fundamental quality check. If record counts don't match, there may be export truncation or filtering issues that need to be addressed before proceeding with other quality checks.",
    tags: ["data-validation", "quality-assurance", "export-verification"],
    officialRef: "university/reporting-essentials",
  },
  {
    id: "TCO-AQ-0006",
    question:
      "You need to find all machines that have a specific registry key. Which natural language query structure is correct?",
    choices: [
      {
        id: "a",
        text: "Get Computer Name from machines with Registry Key exists 'HKLM\\Software\\MyApp'",
      },
      {
        id: "b",
        text: "Get Computer Name from all machines with Registry Key contains 'MyApp'",
      },
      {
        id: "c",
        text: "Get Computer Name and Registry Key from machines with Registry Key Path equals 'HKLM\\Software\\MyApp'",
      },
      {
        id: "d",
        text: "Find registry MyApp on all computers",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option C uses proper Tanium syntax for registry queries with both the computer name and registry key data. 'Registry Key Path equals' is the correct operator for exact registry path matching. Options A and B use incorrect registry syntax, and Option D is not proper Tanium query format.",
    tags: ["registry-queries", "natural-language", "system-configuration"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "university/interact-mastery",
  },
  {
    id: "TCO-AQ-0007",
    question: "What is the purpose of saved questions in Tanium?",
    choices: [
      {
        id: "a",
        text: "To automatically deploy actions to endpoints",
      },
      {
        id: "b",
        text: "To store frequently used queries for reuse and sharing",
      },
      {
        id: "c",
        text: "To schedule reports for regular generation",
      },
      {
        id: "d",
        text: "To backup query results for compliance purposes",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Saved questions allow operators to store frequently used queries for easy reuse and sharing with team members. This improves efficiency and ensures consistent query formatting across the organization.",
    tags: ["saved-questions", "query-reuse", "collaboration"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-AQ-0008",
    question:
      "A complex query with multiple filters returns inconsistent results across different runs. What is the most systematic troubleshooting approach?",
    choices: [
      {
        id: "a",
        text: "Simplify the query by removing all filters and add them back one by one",
      },
      {
        id: "b",
        text: "Check if the underlying sensor data is stable and clients are consistently reporting",
      },
      {
        id: "c",
        text: "Increase the query timeout to allow more time for data collection",
      },
      {
        id: "d",
        text: "Switch to using static computer groups instead of dynamic filtering",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Inconsistent results from the same query typically indicate unstable underlying data or client reporting issues. Before modifying the query structure, it's essential to verify that the sensor data is consistent and clients are reporting reliably. This addresses the root cause rather than symptoms.",
    tags: ["query-troubleshooting", "data-consistency", "client-reporting"],
    studyGuideRef: "tco-study-path/troubleshooting",
  },
  {
    id: "TCO-AQ-0009",
    question:
      "When constructing a query to find installed software, which approach provides the most comprehensive results?",
    choices: [
      {
        id: "a",
        text: "Get Installed Applications from all machines",
      },
      {
        id: "b",
        text: "Get Installed Applications and Application Version from all machines",
      },
      {
        id: "c",
        text: "Get Installed Applications, Application Version, and Install Date from all machines",
      },
      {
        id: "d",
        text: "Get Software List from machines with Applications installed",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option C provides the most comprehensive software inventory by including application names, versions, and installation dates. This information is crucial for patch management, license compliance, and security assessments. The additional data fields provide context for decision-making without significantly impacting query performance.",
    tags: ["software-inventory", "comprehensive-queries", "data-collection"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "university/interact-mastery",
  },
  {
    id: "TCO-RQ-0006",
    question:
      "You need to create a computer group for servers in a specific subnet (192.168.10.0/24) running Windows Server. What filter criteria would be most effective?",
    choices: [
      {
        id: "a",
        text: "IP Address starts with '192.168.10' and Operating System contains 'Server'",
      },
      {
        id: "b",
        text: "IP Address contains '192.168.10' and OS equals 'Windows Server'",
      },
      {
        id: "c",
        text: "IP Address matches '192.168.10.*' and Operating System contains 'Windows Server'",
      },
      {
        id: "d",
        text: "Subnet equals '192.168.10.0/24' and Computer Type equals 'Server'",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option A uses the most reliable approach with 'starts with' for IP address matching (ensuring correct subnet) and 'contains' for OS matching (covering various Windows Server versions). The other options either use incorrect operators or non-standard sensor names.",
    tags: ["subnet-filtering", "server-targeting", "ip-address-matching"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-RQ-0007",
    question:
      "A user has been granted access to a computer group but cannot see any computers in it during question targeting. What is the most likely cause?",
    choices: [
      {
        id: "a",
        text: "The computer group is empty or the filter criteria don't match any systems",
      },
      {
        id: "b",
        text: "The user lacks Sensor read permissions for the computer discovery sensors",
      },
      {
        id: "c",
        text: "The computer group is configured as static but needs to be dynamic",
      },
      {
        id: "d",
        text: "The user's session has expired and needs to be refreshed",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Even with computer group access, users need appropriate sensor permissions to see the computers within those groups. Without sensor read permissions, the group appears empty during targeting. This is a common RBAC configuration issue that's often overlooked.",
    tags: ["rbac-troubleshooting", "sensor-permissions", "group-visibility"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RQ-0008",
    question: "What is the difference between a content set and a computer group in Tanium RBAC?",
    choices: [
      {
        id: "a",
        text: "Content sets define what data users can access, computer groups define which systems they can target",
      },
      {
        id: "b",
        text: "Content sets are dynamic, computer groups are static",
      },
      {
        id: "c",
        text: "Content sets are for administrators, computer groups are for operators",
      },
      {
        id: "d",
        text: "There is no difference, they are interchangeable terms",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Content sets control access to Tanium objects like sensors, packages, and saved questions (what data/tools users can access), while computer groups control which endpoints users can target with their queries and actions (which systems they can affect).",
    tags: ["content-sets", "computer-groups", "rbac-concepts"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RQ-0009",
    question:
      "When implementing role-based access control for a team that manages only Linux servers, what is the most appropriate configuration?",
    choices: [
      {
        id: "a",
        text: "Create a content set with Linux-specific sensors and a computer group containing all Linux servers",
      },
      {
        id: "b",
        text: "Give the team full administrator access but train them to only target Linux systems",
      },
      {
        id: "c",
        text: "Create separate roles for each individual Linux server in the environment",
      },
      {
        id: "d",
        text: "Use a single dynamic group that includes all servers regardless of operating system",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The most secure and appropriate approach is to create a content set containing Linux-relevant sensors, packages, and tools, combined with a computer group that only includes Linux servers. This implements least privilege by restricting both what the team can do and where they can do it.",
    tags: ["role-design", "linux-administration", "least-privilege"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "blueprint/operator-competencies",
  },
  {
    id: "TCO-TA-0006",
    question:
      "You need to deploy a security patch that requires a system reboot. What is the recommended deployment approach?",
    choices: [
      {
        id: "a",
        text: "Deploy the patch to all systems simultaneously for fastest remediation",
      },
      {
        id: "b",
        text: "Use a phased deployment starting with a small test group before broader rollout",
      },
      {
        id: "c",
        text: "Schedule the deployment for business hours to ensure IT staff availability",
      },
      {
        id: "d",
        text: "Deploy only to critical servers first, then workstations later",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Phased deployment is the recommended approach for patches requiring reboots. Starting with a small test group allows verification of successful installation and system stability before broader deployment, reducing risk of widespread outages.",
    tags: ["phased-deployment", "security-patches", "risk-management"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "university/action-deployment",
  },
  {
    id: "TCO-TA-0007",
    question:
      "What information should you verify before deploying a package to production systems?",
    choices: [
      {
        id: "a",
        text: "Only the package name and target systems",
      },
      {
        id: "b",
        text: "Package parameters, target systems, and approval status",
      },
      {
        id: "c",
        text: "Target systems and deployment schedule only",
      },
      {
        id: "d",
        text: "Package version and user permissions only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Before deployment, operators should verify the package parameters are correct for the intended task, the target systems are appropriate, and any required approvals have been obtained. This prevents deployment errors and unauthorized actions.",
    tags: ["pre-deployment", "verification", "deployment-checklist"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-TA-0008",
    question:
      "A package deployment completed successfully on 90% of targets but failed on domain controllers. What is the most likely cause and solution?",
    choices: [
      {
        id: "a",
        text: "Network connectivity issues - retry the deployment immediately",
      },
      {
        id: "b",
        text: "Insufficient privileges or security restrictions on domain controllers - review package requirements",
      },
      {
        id: "c",
        text: "Package is incompatible with server operating systems - modify the package",
      },
      {
        id: "d",
        text: "Domain controllers are too busy - schedule deployment for off-hours",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Domain controllers typically have enhanced security restrictions and may require specific privileges or have policies that prevent certain operations. The fact that 90% succeeded suggests the package works, but domain controllers have special requirements that need to be addressed.",
    tags: ["domain-controllers", "security-restrictions", "deployment-troubleshooting"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-NB-0006",
    question:
      "You need to monitor real-time action progress across multiple deployments. Which navigation path and interface feature is most efficient?",
    choices: [
      {
        id: "a",
        text: "Deploy > Scheduled Actions > Refresh page manually every few minutes",
      },
      {
        id: "b",
        text: "Deploy > Action History > Filter by deployment status",
      },
      {
        id: "c",
        text: "Deploy > Real-time Actions Dashboard with auto-refresh enabled",
      },
      {
        id: "d",
        text: "Administration > System Status > View deployment metrics",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Real-time Actions Dashboard in the Deploy module provides live monitoring of multiple deployments with auto-refresh capabilities, eliminating the need for manual page refreshes and providing the most efficient view of active deployment progress.",
    tags: ["deployment-monitoring", "real-time-dashboard", "interface-efficiency"],
    officialRef: "module/deploy",
  },
  {
    id: "TCO-NB-0007",
    question:
      "Where in the Tanium Console can you view and manage system-wide configuration settings?",
    choices: [
      {
        id: "a",
        text: "Main Menu > Settings",
      },
      {
        id: "b",
        text: "Main Menu > Administration > Configuration",
      },
      {
        id: "c",
        text: "User dropdown > System Preferences",
      },
      {
        id: "d",
        text: "Help menu > System Configuration",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "System-wide configuration settings are accessed through Main Menu > Administration > Configuration, which provides access to platform settings, client configuration, bandwidth throttles, and other system-level configurations.",
    tags: ["administration", "system-configuration", "console-navigation"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0008",
    question:
      "A user reports that certain menu options appear grayed out or missing in their Tanium Console interface. What is the systematic approach to resolve this?",
    choices: [
      {
        id: "a",
        text: "Clear browser cache and instruct user to refresh the page",
      },
      {
        id: "b",
        text: "Check user's role permissions and content set assignments for the missing features",
      },
      {
        id: "c",
        text: "Verify the user is connecting from an authorized network location",
      },
      {
        id: "d",
        text: "Restart the Tanium services and have the user reconnect",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Grayed out or missing menu options typically indicate insufficient permissions. The systematic approach is to review the user's role assignments and ensure they have appropriate permissions for the features they need to access. This is an RBAC configuration issue rather than a technical problem.",
    tags: ["interface-troubleshooting", "permissions", "menu-access"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RD-0006",
    question:
      "You need to create a compliance report showing software inventory across all systems. Which approach provides the most effective reporting workflow?",
    choices: [
      {
        id: "a",
        text: "Export individual queries for each software category and combine manually",
      },
      {
        id: "b",
        text: "Create a comprehensive saved question and export to CSV for analysis",
      },
      {
        id: "c",
        text: "Use the Asset module's automated inventory reports with scheduled export",
      },
      {
        id: "d",
        text: "Query each system individually and aggregate the results",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Asset module's automated inventory reports are specifically designed for comprehensive software compliance reporting. They provide structured, consistent data with built-in scheduling and export capabilities, making them more efficient than manual query aggregation approaches.",
    tags: ["compliance-reporting", "software-inventory", "automated-reports"],
    officialRef: "module/asset",
  },
  {
    id: "TCO-RD-0007",
    question:
      "A scheduled report that previously worked correctly now generates empty results. What is the most systematic troubleshooting approach?",
    choices: [
      {
        id: "a",
        text: "Recreate the scheduled report with the same parameters",
      },
      {
        id: "b",
        text: "Check if the underlying data sources and computer group memberships have changed",
      },
      {
        id: "c",
        text: "Increase the report timeout settings to allow more processing time",
      },
      {
        id: "d",
        text: "Switch to manual report generation to bypass scheduling issues",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "When a previously working scheduled report generates empty results, the most likely cause is changes in underlying data sources (sensors, computer groups, or filter criteria). Systematic troubleshooting should verify that the data sources still exist and contain expected data before investigating other potential causes.",
    tags: ["report-troubleshooting", "scheduled-reports", "data-source-validation"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-AQ-0010",
    question:
      "In Tanium natural language queries, what operator is used for partial string matching?",
    choices: [
      {
        id: "a",
        text: "equals",
      },
      {
        id: "b",
        text: "contains",
      },
      {
        id: "c",
        text: "matches",
      },
      {
        id: "d",
        text: "includes",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The 'contains' operator is used in Tanium for partial string matching, allowing you to find text that includes a specific substring regardless of what comes before or after it.",
    tags: ["query-operators", "string-matching", "contains"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-AQ-0011",
    question:
      "You want to find all machines where a specific process is NOT running. Which query construction is correct?",
    choices: [
      {
        id: "a",
        text: "Get Computer Name from machines with Process Name does not contain 'myprocess.exe'",
      },
      {
        id: "b",
        text: "Get Computer Name from machines where Process Name != 'myprocess.exe'",
      },
      {
        id: "c",
        text: "Get Computer Name from machines with Running Processes excludes 'myprocess.exe'",
      },
      {
        id: "d",
        text: "Get Computer Name from machines with Process Name not equals 'myprocess.exe'",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option A uses the correct Tanium syntax for negation with 'does not contain'. This will return computers where the specified process is not found in the running processes list. The other options use incorrect operators or syntax not supported by Tanium's natural language parser.",
    tags: ["negation-queries", "process-monitoring", "query-construction"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "university/interact-mastery",
  },
  {
    id: "TCO-AQ-0012",
    question:
      "A query returns different result counts when run multiple times within a short period. What factors could cause this behavior?",
    choices: [
      {
        id: "a",
        text: "Network latency affecting query transmission speed",
      },
      {
        id: "b",
        text: "Client registration changes or endpoints going online/offline between queries",
      },
      {
        id: "c",
        text: "Tanium server load causing processing delays",
      },
      {
        id: "d",
        text: "Browser caching affecting result display",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Variable result counts for the same query typically indicate changes in the client population - endpoints coming online, going offline, or registering/unregistering with the Tanium server. This directly affects which systems can respond to queries. Network latency, server load, and browser caching don't typically change actual result counts.",
    tags: ["query-variability", "client-registration", "result-consistency"],
    studyGuideRef: "tco-study-path/troubleshooting",
  },
  {
    id: "TCO-RQ-0010",
    question: "What is the primary advantage of using dynamic computer groups over static groups?",
    choices: [
      {
        id: "a",
        text: "Dynamic groups consume less system resources",
      },
      {
        id: "b",
        text: "Dynamic groups automatically update membership based on current system state",
      },
      {
        id: "c",
        text: "Dynamic groups can be shared between multiple users",
      },
      {
        id: "d",
        text: "Dynamic groups support more complex naming conventions",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Dynamic groups automatically update their membership based on current sensor data and defined filter criteria, ensuring that group membership reflects the current state of systems without manual maintenance.",
    tags: ["dynamic-groups", "automation", "group-benefits"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RQ-0011",
    question:
      "A user with proper RBAC permissions reports seeing inconsistent computer group memberships when targeting different queries. What is the most likely root cause?",
    choices: [
      {
        id: "a",
        text: "The user's browser session has expired and needs refresh",
      },
      {
        id: "b",
        text: "Different sensors have different update frequencies and client reporting schedules",
      },
      {
        id: "c",
        text: "The computer groups are misconfigured and need to be recreated",
      },
      {
        id: "d",
        text: "The Tanium server is experiencing performance issues",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Inconsistent group memberships across different queries typically result from sensors having different collection schedules and update frequencies. Some sensors update more frequently than others, leading to temporal inconsistencies in group membership based on which sensors are used for filtering.",
    tags: ["sensor-schedules", "group-consistency", "temporal-data"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RQ-0012",
    question:
      "You need to create a computer group for workstations that are missing critical security patches. What approach provides the most accurate and maintainable solution?",
    choices: [
      {
        id: "a",
        text: "Create a static group and manually add computers after running patch queries",
      },
      {
        id: "b",
        text: "Create a dynamic group using patch-related sensors with appropriate filter criteria",
      },
      {
        id: "c",
        text: "Use the Asset module to generate a list and import it as a computer group",
      },
      {
        id: "d",
        text: "Create multiple static groups for each patch and combine them manually",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "A dynamic group using patch-related sensors provides the most accurate and maintainable solution. It automatically updates as patch status changes, requires no manual maintenance, and ensures the group always reflects current patch state. Static approaches require manual updates and are prone to becoming outdated.",
    tags: ["patch-management", "dynamic-groups", "security-targeting"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-TA-0009",
    question:
      "When deploying a package that collects sensitive data, what security considerations should be prioritized?",
    choices: [
      {
        id: "a",
        text: "Encrypt the package file during transmission only",
      },
      {
        id: "b",
        text: "Ensure proper approval workflows, secure transmission, and secure data handling at rest",
      },
      {
        id: "c",
        text: "Deploy only during business hours when security staff are available",
      },
      {
        id: "d",
        text: "Limit deployment to a single computer group to reduce exposure",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Comprehensive security for sensitive data collection requires approval workflows for authorization, secure transmission to protect data in transit, and secure handling of collected data at rest. This provides defense in depth for sensitive information throughout the entire collection process.",
    tags: ["data-security", "sensitive-data", "approval-workflows"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "blueprint/security-considerations",
  },
  {
    id: "TCO-TA-0010",
    question: "What is the primary difference between a package and an action in Tanium?",
    choices: [
      {
        id: "a",
        text: "Packages are for data collection, actions are for system changes",
      },
      {
        id: "b",
        text: "Packages are the templates, actions are the specific instances of execution",
      },
      {
        id: "c",
        text: "Packages require approval, actions are automatically approved",
      },
      {
        id: "d",
        text: "Packages run on servers, actions run on endpoints",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "A package is a pre-built template containing the scripts and parameters needed to perform tasks, while an action is a specific instance of executing that package against targeted systems with configured parameters.",
    tags: ["packages-vs-actions", "deployment-concepts", "templates"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-NB-0009",
    question:
      "You need to quickly access system administration functions. Which navigation path is most direct?",
    choices: [
      {
        id: "a",
        text: "Main Menu > Settings > System Administration",
      },
      {
        id: "b",
        text: "Main Menu > Administration",
      },
      {
        id: "c",
        text: "User dropdown > Administrative Tools",
      },
      {
        id: "d",
        text: "Help Menu > System Configuration",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Main Menu > Administration provides direct access to all system administration functions including user management, computer groups, content sets, platform settings, and other administrative tools.",
    tags: ["administration", "navigation", "system-management"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0010",
    question: "What type of information is displayed on the Tanium Console home page dashboard?",
    choices: [
      {
        id: "a",
        text: "Only recent query results",
      },
      {
        id: "b",
        text: "System overview including client status, recent activities, and key metrics",
      },
      {
        id: "c",
        text: "User activity logs and audit trail",
      },
      {
        id: "d",
        text: "Scheduled maintenance and system notifications only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Tanium Console home page dashboard provides a system overview including client connectivity status, recent activities, key performance metrics, and system health indicators to give operators a quick view of overall system state.",
    tags: ["dashboard", "system-overview", "home-page"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-RD-0008",
    question:
      "You need to export query results containing special characters and international text. Which export format best preserves character encoding?",
    choices: [
      {
        id: "a",
        text: "CSV with UTF-8 encoding",
      },
      {
        id: "b",
        text: "Plain text with ASCII encoding",
      },
      {
        id: "c",
        text: "XML with default encoding",
      },
      {
        id: "d",
        text: "PDF format for universal compatibility",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "CSV with UTF-8 encoding provides the best support for special characters and international text while maintaining compatibility with most analysis tools. UTF-8 can represent any character in the Unicode standard, making it ideal for international deployments.",
    tags: ["character-encoding", "international-text", "utf8"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0009",
    question: "What is the benefit of using the JSON export format for Tanium data?",
    choices: [
      {
        id: "a",
        text: "Smallest file size for storage efficiency",
      },
      {
        id: "b",
        text: "Best compatibility with spreadsheet applications",
      },
      {
        id: "c",
        text: "Structured format ideal for programmatic processing and APIs",
      },
      {
        id: "d",
        text: "Human-readable format for management reports",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "JSON format provides a structured, machine-readable format that's ideal for programmatic processing, API integration, and automated data processing workflows. It maintains data structure and relationships better than flat formats like CSV.",
    tags: ["json-format", "programmatic-processing", "apis"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-AQ-0013",
    question:
      "When querying for file information, which approach provides the most comprehensive security-relevant data?",
    choices: [
      {
        id: "a",
        text: "Get File Name from machines with File Path contains 'suspicious'",
      },
      {
        id: "b",
        text: "Get File Name, File Size, and File Hash from machines with File Path contains 'critical'",
      },
      {
        id: "c",
        text: "Get File Name, File Size, File Hash, and File Modified Date from machines with File Path contains 'system'",
      },
      {
        id: "d",
        text: "Get File Details from machines with Files exist",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option C provides the most comprehensive security-relevant data by including file name (identity), size (integrity check), hash (fingerprint for malware detection), and modification date (timeline analysis). This combination supports threat detection, forensic analysis, and compliance requirements.",
    tags: ["file-analysis", "security-data", "comprehensive-queries"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "blueprint/security-considerations",
  },
  {
    id: "TCO-AQ-0014",
    question: "What information does the Computer Name sensor provide in Tanium queries?",
    choices: [
      {
        id: "a",
        text: "The IP address of the endpoint",
      },
      {
        id: "b",
        text: "The hostname or NetBIOS name of the system",
      },
      {
        id: "c",
        text: "The domain membership status",
      },
      {
        id: "d",
        text: "The MAC address of the primary network adapter",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Computer Name sensor returns the hostname or NetBIOS name of the system, which is the primary identifier used to distinguish between different endpoints in query results.",
    tags: ["computer-name", "system-identification", "sensors"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-RQ-0013",
    question:
      "You want to target only domain-joined Windows workstations for a specific action. What filter combination is most effective?",
    choices: [
      {
        id: "a",
        text: "Operating System contains 'Windows' and Computer Type equals 'Workstation'",
      },
      {
        id: "b",
        text: "Operating System contains 'Windows' and Domain contains 'corp'",
      },
      {
        id: "c",
        text: "Operating System contains 'Windows' and Computer Type equals 'Workstation' and Domain is not empty",
      },
      {
        id: "d",
        text: "Domain Status equals 'Joined' and OS Family equals 'Windows'",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option C provides the most precise targeting by combining OS filtering (Windows), computer type (Workstation to exclude servers), and domain status (not empty to ensure domain membership). This ensures actions target only the intended system types.",
    tags: ["domain-targeting", "workstation-filtering", "precise-targeting"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-TA-0011",
    question:
      "An action shows 'Success' status but the intended changes are not visible on target systems. What is the most systematic troubleshooting approach?",
    choices: [
      {
        id: "a",
        text: "Immediately retry the action on all systems",
      },
      {
        id: "b",
        text: "Examine action output logs and verify the package logic for the specific environment",
      },
      {
        id: "c",
        text: "Increase action timeout and redeploy",
      },
      {
        id: "d",
        text: "Check network connectivity between server and clients",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "A 'Success' status with no visible changes suggests the action executed without errors but didn't perform the expected operations. Examining output logs and package logic helps identify whether the package detected existing conditions, encountered environmental issues, or has logic flaws that prevent the intended changes.",
    tags: ["action-verification", "package-logic", "success-troubleshooting"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-NB-0011",
    question:
      "You need to customize your dashboard to show the most relevant information for your role. Where would you configure these settings?",
    choices: [
      {
        id: "a",
        text: "Main Menu > Administration > Dashboard Settings",
      },
      {
        id: "b",
        text: "User dropdown > Preferences > Dashboard Configuration",
      },
      {
        id: "c",
        text: "Home page dashboard > Customize Dashboard or similar personalization options",
      },
      {
        id: "d",
        text: "Main Menu > Settings > Interface Customization",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Dashboard customization is typically accessed directly from the dashboard interface through customization controls, allowing users to add, remove, or rearrange widgets and information panels according to their role and preferences.",
    tags: ["dashboard-customization", "personalization", "user-interface"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-RD-0010",
    question:
      "A compliance report must include historical data showing system changes over time. What export and analysis approach is most effective?",
    choices: [
      {
        id: "a",
        text: "Export current data and manually compare with previous exports",
      },
      {
        id: "b",
        text: "Use scheduled exports with timestamps and automated comparison tools",
      },
      {
        id: "c",
        text: "Query historical sensors and export trend data in structured format",
      },
      {
        id: "d",
        text: "Export raw data and use external business intelligence tools for analysis",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Querying historical sensors and exporting trend data in a structured format provides the most comprehensive approach for compliance reporting. Historical sensors capture system changes over time, and structured exports enable effective trend analysis and compliance validation.",
    tags: ["historical-data", "compliance-reporting", "trend-analysis"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-AQ-0015",
    question: "Which sensor provides information about currently logged-in users?",
    choices: [
      {
        id: "a",
        text: "User Account",
      },
      {
        id: "b",
        text: "Logged In Users",
      },
      {
        id: "c",
        text: "Active Sessions",
      },
      {
        id: "d",
        text: "Current User",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The 'Logged In Users' sensor provides information about users currently logged into the system, including interactive and service logons.",
    tags: ["logged-in-users", "user-sessions", "sensors"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-AQ-0016",
    question:
      "You need to find systems with a specific Windows service running. Which query structure is correct?",
    choices: [
      {
        id: "a",
        text: "Get Computer Name from machines with Service Name equals 'servicename' and Service Status equals 'Running'",
      },
      {
        id: "b",
        text: "Get Computer Name from machines with Services contains 'servicename=running'",
      },
      {
        id: "c",
        text: "Get Computer Name and Service Status from machines with Service Name contains 'servicename'",
      },
      {
        id: "d",
        text: "Get Service Information from machines with Running Services contains 'servicename'",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option A uses the correct syntax to find systems with a specific service that is currently running. It combines two filters: the service name match and the running status check, ensuring precise results.",
    tags: ["service-queries", "service-status", "running-services"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "university/interact-mastery",
  },
  {
    id: "TCO-AQ-0017",
    question:
      "A sensor query for CPU usage returns varying results on the same machine within minutes. What is the most likely explanation?",
    choices: [
      {
        id: "a",
        text: "The sensor is malfunctioning and needs to be reset",
      },
      {
        id: "b",
        text: "CPU usage naturally fluctuates based on current system activity",
      },
      {
        id: "c",
        text: "Network latency is affecting sensor data transmission",
      },
      {
        id: "d",
        text: "The query syntax is incorrect causing measurement errors",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "CPU usage is a dynamic metric that naturally varies based on current system activity, running processes, and workload. Seeing different values within minutes is expected behavior, not an error condition.",
    tags: ["dynamic-sensors", "cpu-usage", "system-metrics"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-RQ-0014",
    question: "What is a content set in Tanium RBAC?",
    choices: [
      {
        id: "a",
        text: "A group of computers with similar configurations",
      },
      {
        id: "b",
        text: "A collection of sensors, packages, and other Tanium objects that define what users can access",
      },
      {
        id: "c",
        text: "A set of predefined queries for common tasks",
      },
      {
        id: "d",
        text: "A configuration template for new user accounts",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "A content set is a collection of Tanium objects (sensors, packages, saved questions, etc.) that defines what data and tools users can access. Content sets are assigned to roles to control user capabilities.",
    tags: ["content-sets", "rbac", "access-control"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RQ-0015",
    question:
      "You need to create a filter for systems that have been offline for more than 7 days. Which approach is most effective?",
    choices: [
      {
        id: "a",
        text: "Last Seen is less than '7 days ago'",
      },
      {
        id: "b",
        text: "Last Contact is greater than '7 days'",
      },
      {
        id: "c",
        text: "Last Seen is greater than '7' and Time Unit equals 'days'",
      },
      {
        id: "d",
        text: "Online Status does not equal 'Online' and Last Contact is older than 7 days",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option A uses the correct syntax with 'Last Seen is less than' and a relative time reference '7 days ago' to identify systems that haven't been seen within the last 7 days. This is the standard approach for offline system identification.",
    tags: ["offline-systems", "time-filters", "last-seen"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-RQ-0016",
    question:
      "A computer group filter works correctly in queries but fails when used for action targeting. What is the most likely cause?",
    choices: [
      {
        id: "a",
        text: "The filter syntax is valid for queries but not for actions",
      },
      {
        id: "b",
        text: "The underlying sensors have different permissions for queries versus actions",
      },
      {
        id: "c",
        text: "Actions require additional approval even with proper group targeting",
      },
      {
        id: "d",
        text: "The computer group membership hasn't refreshed since the last sensor update",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Different RBAC permissions can exist for sensors used in queries versus actions. A user might have query permissions for sensors but lack the action permissions needed to target the same systems, causing targeting failures even though the filter works in queries.",
    tags: ["sensor-permissions", "action-targeting", "rbac-troubleshooting"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-TA-0012",
    question: "What is the purpose of action approval in Tanium?",
    choices: [
      {
        id: "a",
        text: "To optimize action performance and execution speed",
      },
      {
        id: "b",
        text: "To provide oversight and prevent unauthorized or harmful actions",
      },
      {
        id: "c",
        text: "To schedule actions for execution during maintenance windows",
      },
      {
        id: "d",
        text: "To compress action data for efficient network transmission",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Action approval provides oversight and authorization controls to prevent unauthorized or potentially harmful actions from being executed on endpoints. This ensures proper governance and risk management.",
    tags: ["action-approval", "oversight", "governance"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-TA-0013",
    question:
      "You need to deploy a configuration change that must be applied in a specific sequence across different server tiers. What deployment strategy is most appropriate?",
    choices: [
      {
        id: "a",
        text: "Deploy to all servers simultaneously for consistency",
      },
      {
        id: "b",
        text: "Use multiple separate actions with manual timing between each tier",
      },
      {
        id: "c",
        text: "Create a coordinated deployment plan with dependencies and sequencing",
      },
      {
        id: "d",
        text: "Deploy to each server individually to ensure proper sequencing",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Creating a coordinated deployment plan with dependencies and sequencing ensures proper order of execution across server tiers while maintaining automation and reducing the risk of manual timing errors.",
    tags: ["deployment-sequencing", "server-tiers", "coordinated-deployment"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "university/action-deployment",
  },
  {
    id: "TCO-TA-0014",
    question:
      "A package deployment shows 'Completed' status but with mixed success/failure results. What analysis approach provides the most actionable insights?",
    choices: [
      {
        id: "a",
        text: "Focus on the overall completion percentage and retry failed systems",
      },
      {
        id: "b",
        text: "Analyze failure patterns by grouping errors, system types, and environmental factors",
      },
      {
        id: "c",
        text: "Compare execution times between successful and failed deployments",
      },
      {
        id: "d",
        text: "Review network connectivity logs for systems that failed",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Analyzing failure patterns by grouping errors, system types, and environmental factors provides the most actionable insights. This systematic analysis can reveal common root causes, environmental issues, or system-specific problems that can be addressed before retry attempts.",
    tags: ["failure-analysis", "pattern-recognition", "deployment-troubleshooting"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-NB-0012",
    question:
      "What information is typically displayed in the client status section of the Tanium Console?",
    choices: [
      {
        id: "a",
        text: "Only the total number of connected clients",
      },
      {
        id: "b",
        text: "Client count, online status, version information, and health indicators",
      },
      {
        id: "c",
        text: "User login history and session information",
      },
      {
        id: "d",
        text: "Network bandwidth utilization for client communications",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The client status section displays comprehensive information including client count, online/offline status, version information, and health indicators to provide operators with a complete view of endpoint connectivity.",
    tags: ["client-status", "system-health", "dashboard"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0013",
    question:
      "You need to manage user accounts and permissions. Which navigation path leads to user management functions?",
    choices: [
      {
        id: "a",
        text: "Main Menu > Settings > User Management",
      },
      {
        id: "b",
        text: "Main Menu > Administration > Users",
      },
      {
        id: "c",
        text: "User dropdown > Account Management",
      },
      {
        id: "d",
        text: "Main Menu > Security > Access Control",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "User management functions including user accounts, roles, and permissions are accessed through Main Menu > Administration > Users (or similar path depending on Tanium version).",
    tags: ["user-management", "administration", "navigation"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0014",
    question:
      "A user reports slow performance when navigating between modules in the Tanium Console. What systematic approach would identify the root cause?",
    choices: [
      {
        id: "a",
        text: "Clear browser cache and restart the browser",
      },
      {
        id: "b",
        text: "Test navigation performance with different browsers and network conditions",
      },
      {
        id: "c",
        text: "Analyze browser developer tools, network performance, and system resources",
      },
      {
        id: "d",
        text: "Upgrade the user's computer hardware and network connection",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "A systematic analysis using browser developer tools to examine network requests, JavaScript performance, and system resources provides the most comprehensive approach to identifying whether the issue is client-side, network-related, or server-side.",
    tags: ["performance-troubleshooting", "console-performance", "systematic-analysis"],
    studyGuideRef: "tco-study-path/troubleshooting",
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-RD-0011",
    question:
      "What is the primary advantage of scheduling reports instead of generating them manually?",
    choices: [
      {
        id: "a",
        text: "Scheduled reports execute faster than manual reports",
      },
      {
        id: "b",
        text: "Scheduled reports provide automated, consistent data delivery without manual intervention",
      },
      {
        id: "c",
        text: "Scheduled reports have access to more data than manual reports",
      },
      {
        id: "d",
        text: "Scheduled reports use fewer system resources",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Scheduled reports provide automated, consistent data delivery without requiring manual intervention, ensuring stakeholders receive regular updates and reducing the operational burden on administrators.",
    tags: ["scheduled-reports", "automation", "consistency"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0012",
    question:
      "You need to create a report that combines data from multiple Tanium modules. What approach is most effective?",
    choices: [
      {
        id: "a",
        text: "Export data from each module separately and combine manually",
      },
      {
        id: "b",
        text: "Create a unified query that spans multiple data sources and export as a single dataset",
      },
      {
        id: "c",
        text: "Use the reporting module's cross-module query capabilities",
      },
      {
        id: "d",
        text: "Schedule separate reports and use external tools for combination",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Using the reporting module's cross-module query capabilities provides the most integrated approach, ensuring data consistency, reducing manual effort, and maintaining relationships between different data sources.",
    tags: ["cross-module-reporting", "unified-queries", "data-integration"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0013",
    question:
      "A critical compliance report export process has been failing intermittently with timeout errors. What systematic approach ensures reliable report generation?",
    choices: [
      {
        id: "a",
        text: "Increase timeout settings and retry failed exports",
      },
      {
        id: "b",
        text: "Implement a multi-stage approach: data collection, processing, and export with error handling",
      },
      {
        id: "c",
        text: "Schedule reports during off-peak hours only",
      },
      {
        id: "d",
        text: "Break down into smaller reports and manually combine results",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Implementing a multi-stage approach with data collection, processing, and export phases, combined with proper error handling and retry logic, provides the most robust solution for reliable report generation. This allows for recovery at specific stages and better troubleshooting.",
    tags: ["report-reliability", "error-handling", "multi-stage-processing"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-AQ-0018",
    question:
      "You want to find systems that have NOT installed a specific security update. Which query approach is correct?",
    choices: [
      {
        id: "a",
        text: "Get Computer Name from machines with Installed Updates does not contain 'KB123456'",
      },
      {
        id: "b",
        text: "Get Computer Name from machines where Updates != 'KB123456'",
      },
      {
        id: "c",
        text: "Get Computer Name from machines with Security Updates excludes 'KB123456'",
      },
      {
        id: "d",
        text: "Get Computer Name from machines with Missing Updates contains 'KB123456'",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option A uses correct Tanium syntax for negation with 'does not contain' to find systems where the specific update KB123456 is not found in the installed updates list. This effectively identifies systems missing the update.",
    tags: ["missing-updates", "negation-queries", "security-patches"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "university/interact-mastery",
  },
  {
    id: "TCO-AQ-0019",
    question: "What is the function of the IP Address sensor in Tanium?",
    choices: [
      {
        id: "a",
        text: "To change the IP address of endpoints",
      },
      {
        id: "b",
        text: "To retrieve the current IP address configuration of systems",
      },
      {
        id: "c",
        text: "To monitor network bandwidth utilization",
      },
      {
        id: "d",
        text: "To configure network routing tables",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The IP Address sensor retrieves the current IP address configuration of systems, providing network identity information that can be used for targeting, filtering, and network analysis.",
    tags: ["ip-address", "network-information", "sensors"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-RQ-0017",
    question:
      "You need to create a computer group for systems requiring urgent patch deployment based on vulnerability severity. What filter approach is most effective?",
    choices: [
      {
        id: "a",
        text: "Operating System contains 'Windows' and Patch Level is less than 'current'",
      },
      {
        id: "b",
        text: "Missing Patches contains 'Critical' or Missing Patches contains 'Important'",
      },
      {
        id: "c",
        text: "Vulnerability Score is greater than '7' and Patch Status equals 'Missing'",
      },
      {
        id: "d",
        text: "Last Patch Date is less than '30 days ago'",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option B focuses specifically on systems missing Critical or Important patches, which directly addresses the urgent patch deployment requirement based on severity classification. This provides targeted filtering for high-priority vulnerabilities.",
    tags: ["vulnerability-management", "patch-priority", "critical-patches"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "blueprint/security-considerations",
  },
  {
    id: "TCO-TA-0015",
    question:
      "When deploying a package that modifies system files, what pre-deployment verification is most critical?",
    choices: [
      {
        id: "a",
        text: "Verify sufficient disk space on target systems",
      },
      {
        id: "b",
        text: "Confirm the package has been tested and backed up critical system files",
      },
      {
        id: "c",
        text: "Check network bandwidth availability for package distribution",
      },
      {
        id: "d",
        text: "Ensure all target systems are online and responsive",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "When modifying system files, confirming that the package has been tested and that critical system files are backed up is most critical. This ensures the ability to recover from any unintended consequences and validates the package functionality before widespread deployment.",
    tags: ["system-files", "backup-procedures", "pre-deployment-testing"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "blueprint/security-considerations",
  },
  {
    id: "TCO-NB-0015",
    question: "Where can you find help documentation and user guides within the Tanium Console?",
    choices: [
      {
        id: "a",
        text: "Main Menu > Documentation",
      },
      {
        id: "b",
        text: "Help menu or Help icon (usually ? symbol)",
      },
      {
        id: "c",
        text: "User dropdown > User Guide",
      },
      {
        id: "d",
        text: "Administration > Help Resources",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Help documentation and user guides are typically accessed through the Help menu or Help icon (often a question mark symbol) which provides links to user guides, documentation, and support resources.",
    tags: ["help-documentation", "user-guides", "support-resources"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-AQ-0020",
    question:
      "You need to query systems for network configuration details including DNS settings. Which sensor combination provides comprehensive network information?",
    choices: [
      {
        id: "a",
        text: "Get IP Address and Network Adapter from all machines",
      },
      {
        id: "b",
        text: "Get IP Address, DNS Servers, and Default Gateway from all machines",
      },
      {
        id: "c",
        text: "Get Network Configuration from machines with Network Adapters active",
      },
      {
        id: "d",
        text: "Get IP Address, Subnet Mask, DNS Servers, Default Gateway, and DHCP Status from all machines",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option D provides the most comprehensive network configuration information including IP address, subnet mask, DNS servers, default gateway, and DHCP status. This complete dataset supports network troubleshooting, compliance, and security assessments.",
    tags: ["network-configuration", "dns-settings", "comprehensive-queries"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "university/interact-mastery",
  },
  {
    id: "TCO-AQ-0021",
    question:
      "A sensor query for disk space returns 'No Results' on systems you know have the sensor installed. What troubleshooting sequence is most systematic?",
    choices: [
      {
        id: "a",
        text: "Restart the Tanium client service on affected systems",
      },
      {
        id: "b",
        text: "Verify sensor permissions, client connectivity, and sensor execution status",
      },
      {
        id: "c",
        text: "Recreate the query with different syntax",
      },
      {
        id: "d",
        text: "Check if the systems meet the sensor's operating system requirements",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "The most systematic approach is to verify sensor permissions (can the client execute the sensor), client connectivity (can responses reach the server), and sensor execution status (is the sensor running successfully). This covers the three main points of failure in sensor data collection.",
    tags: ["sensor-troubleshooting", "no-results", "systematic-diagnosis"],
    studyGuideRef: "tco-study-path/troubleshooting",
  },
  {
    id: "TCO-AQ-0022",
    question: "What does the Operating System sensor return in Tanium queries?",
    choices: [
      {
        id: "a",
        text: "Only the OS version number",
      },
      {
        id: "b",
        text: "The complete operating system name, version, and service pack information",
      },
      {
        id: "c",
        text: "Just the OS family (Windows, Linux, Mac)",
      },
      {
        id: "d",
        text: "The OS installation date",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Operating System sensor returns comprehensive operating system information including the complete OS name, version, and service pack information, providing detailed system identification.",
    tags: ["operating-system", "system-information", "sensors"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-RQ-0018",
    question:
      "You need to target development workstations that should be excluded from production actions. What computer group strategy is most effective?",
    choices: [
      {
        id: "a",
        text: "Create a 'Development Systems' group and exclude it from production action groups",
      },
      {
        id: "b",
        text: "Create separate user roles for development and production teams",
      },
      {
        id: "c",
        text: "Use naming conventions in computer names to identify development systems",
      },
      {
        id: "d",
        text: "Manually maintain a list of development systems in a static group",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Creating a 'Development Systems' group and explicitly excluding it from production action groups provides clear separation and prevents accidental targeting of development systems during production operations. This approach is scalable and maintainable.",
    tags: ["environment-separation", "production-safety", "exclusion-groups"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "blueprint/operator-competencies",
  },
  {
    id: "TCO-RQ-0019",
    question:
      "Multiple users report different computer group memberships when running the same saved question. What root cause analysis approach is most effective?",
    choices: [
      {
        id: "a",
        text: "Check if users have different RBAC permissions affecting their view of systems",
      },
      {
        id: "b",
        text: "Verify if the saved question uses sensors with different update frequencies",
      },
      {
        id: "c",
        text: "Examine if users are connected to different Tanium server instances",
      },
      {
        id: "d",
        text: "All of the above factors should be systematically investigated",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Different computer group memberships for the same saved question can result from multiple factors: RBAC permissions limiting visibility, sensor update frequency differences causing temporal inconsistencies, or users connecting to different server instances. A systematic investigation of all factors is required.",
    tags: ["group-inconsistencies", "multi-factor-analysis", "systematic-troubleshooting"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RQ-0020",
    question: "In Tanium RBAC, what determines which sensors a user can access?",
    choices: [
      {
        id: "a",
        text: "The user's computer group assignments",
      },
      {
        id: "b",
        text: "The content sets assigned to the user's role",
      },
      {
        id: "c",
        text: "The user's organizational unit in Active Directory",
      },
      {
        id: "d",
        text: "The Tanium server configuration settings",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Content sets assigned to the user's role determine which sensors (and other Tanium objects) a user can access. Content sets define the 'what' in RBAC - what data and tools users can use.",
    tags: ["sensor-permissions", "content-sets", "rbac-basics"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-TA-0016",
    question:
      "What is the difference between a scheduled action and an on-demand action in Tanium?",
    choices: [
      {
        id: "a",
        text: "Scheduled actions run faster than on-demand actions",
      },
      {
        id: "b",
        text: "Scheduled actions execute at predetermined times, on-demand actions execute immediately",
      },
      {
        id: "c",
        text: "Scheduled actions require approval, on-demand actions do not",
      },
      {
        id: "d",
        text: "Scheduled actions can target more systems than on-demand actions",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Scheduled actions are configured to execute at predetermined times or intervals, while on-demand actions execute immediately when triggered by an operator.",
    tags: ["scheduled-actions", "on-demand-actions", "timing"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-TA-0017",
    question:
      "You need to deploy a configuration script that must run with elevated privileges on domain controllers. What considerations are most important?",
    choices: [
      {
        id: "a",
        text: "Verify network connectivity and sufficient bandwidth",
      },
      {
        id: "b",
        text: "Confirm Tanium Client service privileges, test in non-production environment, and have rollback procedures",
      },
      {
        id: "c",
        text: "Schedule deployment during business hours for immediate support",
      },
      {
        id: "d",
        text: "Deploy to all domain controllers simultaneously for consistency",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "For elevated privilege deployments on critical infrastructure like domain controllers, it's essential to confirm that the Tanium Client has appropriate privileges, test thoroughly in non-production, and have rollback procedures ready in case of issues.",
    tags: ["domain-controllers", "elevated-privileges", "critical-infrastructure"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "blueprint/security-considerations",
  },
  {
    id: "TCO-TA-0018",
    question:
      "An action deployment shows inconsistent results across similar systems in the same subnet. What analysis approach provides the most insight?",
    choices: [
      {
        id: "a",
        text: "Compare system specifications and configurations between successful and failed systems",
      },
      {
        id: "b",
        text: "Analyze network topology and connectivity patterns",
      },
      {
        id: "c",
        text: "Review action logs and error messages for failure patterns",
      },
      {
        id: "d",
        text: "All of the above should be analyzed systematically",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Inconsistent results across similar systems require comprehensive analysis of system differences (hardware, OS, patches), network factors (routing, firewalls, bandwidth), and action execution details (logs, errors, timing). Each factor can contribute to deployment inconsistencies.",
    tags: ["deployment-inconsistencies", "systematic-analysis", "multi-factor-troubleshooting"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-NB-0016",
    question:
      "You need to quickly identify systems with connectivity issues from the console dashboard. Which indicators are most relevant?",
    choices: [
      {
        id: "a",
        text: "Total client count and version information only",
      },
      {
        id: "b",
        text: "Client online/offline status, last contact time, and communication errors",
      },
      {
        id: "c",
        text: "User login activity and session duration",
      },
      {
        id: "d",
        text: "Network bandwidth utilization statistics",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Client online/offline status, last contact time, and communication errors provide the most direct indicators of connectivity issues. These metrics help identify which systems are having trouble communicating with the Tanium server.",
    tags: ["connectivity-monitoring", "client-status", "dashboard-indicators"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0017",
    question: "What type of notifications are typically displayed in the Tanium Console?",
    choices: [
      {
        id: "a",
        text: "Only system error messages",
      },
      {
        id: "b",
        text: "System alerts, maintenance notifications, and important operational updates",
      },
      {
        id: "c",
        text: "User login activity logs",
      },
      {
        id: "d",
        text: "Network performance statistics only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Tanium Console displays various notifications including system alerts, maintenance notifications, important operational updates, and other relevant information that operators need to be aware of.",
    tags: ["notifications", "system-alerts", "operational-updates"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0018",
    question:
      "Users in different geographic locations report varying console performance. What factors should be analyzed to optimize global console access?",
    choices: [
      {
        id: "a",
        text: "Internet connection speed at each location only",
      },
      {
        id: "b",
        text: "Network latency, bandwidth, browser optimization, and potential CDN or caching solutions",
      },
      {
        id: "c",
        text: "Local computer specifications and memory availability",
      },
      {
        id: "d",
        text: "Tanium server CPU and memory utilization",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Global console performance optimization requires analyzing network latency and bandwidth between locations and the server, browser optimization techniques, and potentially implementing CDN or caching solutions to improve content delivery to remote locations.",
    tags: ["global-performance", "network-optimization", "console-access"],
    studyGuideRef: "tco-study-path/troubleshooting",
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-RD-0014",
    question:
      "You need to export data that will be imported into a business intelligence tool for executive reporting. Which format and considerations are most appropriate?",
    choices: [
      {
        id: "a",
        text: "CSV format with descriptive column headers and clean data formatting",
      },
      {
        id: "b",
        text: "JSON format with nested data structures for complex relationships",
      },
      {
        id: "c",
        text: "XML format with detailed metadata and schema definitions",
      },
      {
        id: "d",
        text: "PDF format for consistent presentation across different systems",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "CSV format with descriptive column headers and clean data formatting is most appropriate for business intelligence tools. Most BI tools have excellent CSV import capabilities, and the format is simple, widely supported, and efficient for tabular data analysis.",
    tags: ["business-intelligence", "executive-reporting", "data-formatting"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0015",
    question: "What is the primary benefit of using templates when creating reports in Tanium?",
    choices: [
      {
        id: "a",
        text: "Templates execute faster than custom reports",
      },
      {
        id: "b",
        text: "Templates provide standardized formatting and consistent structure across reports",
      },
      {
        id: "c",
        text: "Templates can access more data sources than custom reports",
      },
      {
        id: "d",
        text: "Templates are automatically scheduled for regular generation",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Templates provide standardized formatting and consistent structure across reports, ensuring uniformity in presentation and making reports easier to understand and compare.",
    tags: ["report-templates", "standardization", "consistency"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0016",
    question:
      "A critical monthly compliance report export fails during peak business hours but succeeds during off-peak times. What systematic approach resolves this issue?",
    choices: [
      {
        id: "a",
        text: "Move the report schedule to off-peak hours permanently",
      },
      {
        id: "b",
        text: "Analyze system resource utilization, implement resource optimization, and consider report segmentation",
      },
      {
        id: "c",
        text: "Increase server memory and CPU allocation",
      },
      {
        id: "d",
        text: "Switch to manual report generation to avoid scheduling conflicts",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "A systematic approach involves analyzing system resource utilization during peak vs off-peak times, implementing optimization techniques (query tuning, caching), and potentially segmenting large reports into smaller chunks. This addresses root causes rather than just avoiding the problem.",
    tags: ["resource-optimization", "peak-load-handling", "report-segmentation"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-AQ-0023",
    question: "What information does the RAM sensor provide in Tanium?",
    choices: [
      {
        id: "a",
        text: "Only total installed memory",
      },
      {
        id: "b",
        text: "Total installed memory and available memory",
      },
      {
        id: "c",
        text: "Memory usage by individual processes",
      },
      {
        id: "d",
        text: "Memory hardware specifications and vendor information",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The RAM sensor typically provides both total installed memory and available memory information, giving operators insight into both system capacity and current memory utilization.",
    tags: ["ram-sensor", "memory-information", "system-resources"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-AQ-0024",
    question:
      "You want to identify systems that may have malware based on unusual network connections. Which query approach is most effective?",
    choices: [
      {
        id: "a",
        text: "Get Computer Name from machines with Network Connections contains 'suspicious'",
      },
      {
        id: "b",
        text: "Get Computer Name, Process Name, and Network Connections from machines with Listening Ports is greater than '50'",
      },
      {
        id: "c",
        text: "Get Computer Name, Process Name, Network Connections, and Process Path from machines with Network Connections contains 'unknown'",
      },
      {
        id: "d",
        text: "Get Computer Name and Network Connections from machines with Active Connections exists",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option C provides the most comprehensive data for malware detection by including computer name, process name (what's making connections), network connections (where it's connecting), and process path (executable location). This combination helps identify suspicious network behavior and trace it back to specific executables.",
    tags: ["malware-detection", "network-analysis", "security-investigation"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "blueprint/security-considerations",
  },
  {
    id: "TCO-AQ-0025",
    question:
      "A query for installed software returns different applications on identical systems. What could cause this discrepancy?",
    choices: [
      {
        id: "a",
        text: "The systems are not actually identical despite appearing so",
      },
      {
        id: "b",
        text: "Software installation/uninstallation occurred between query runs",
      },
      {
        id: "c",
        text: "Different user contexts or software visibility settings",
      },
      {
        id: "d",
        text: "All of the above could contribute to this discrepancy",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "All factors can contribute: systems may have subtle differences (patches, configurations), software changes may occur between queries, and different user contexts or visibility settings can affect what software is detected. A comprehensive analysis of all factors is needed.",
    tags: ["software-inventory", "query-discrepancies", "multi-factor-analysis"],
    studyGuideRef: "tco-study-path/troubleshooting",
  },
  {
    id: "TCO-AQ-0026",
    question: "What is the purpose of the File Hash sensor in Tanium?",
    choices: [
      {
        id: "a",
        text: "To measure file size and storage usage",
      },
      {
        id: "b",
        text: "To generate cryptographic hashes for file integrity and identification",
      },
      {
        id: "c",
        text: "To count the number of files in a directory",
      },
      {
        id: "d",
        text: "To track file creation and modification dates",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The File Hash sensor generates cryptographic hashes (like MD5, SHA1, SHA256) for files, which can be used for file integrity verification, malware detection, and unique file identification.",
    tags: ["file-hash", "integrity-verification", "cryptographic-hashes"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-RQ-0021",
    question:
      "You need to create a dynamic group for systems that are both domain-joined AND have antivirus installed. What filter logic is correct?",
    choices: [
      {
        id: "a",
        text: "Domain is not empty OR Installed Applications contains 'antivirus'",
      },
      {
        id: "b",
        text: "Domain is not empty AND Installed Applications contains 'antivirus'",
      },
      {
        id: "c",
        text: "Domain Status equals 'Joined' OR Antivirus Status equals 'Installed'",
      },
      {
        id: "d",
        text: "Domain exists AND Security Software exists",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option B uses the correct AND logic to require both conditions: domain membership (Domain is not empty) AND antivirus presence (Installed Applications contains 'antivirus'). This ensures systems meet both security requirements.",
    tags: ["boolean-logic", "security-requirements", "combined-filters"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-RQ-0022",
    question:
      "A computer group designed for patch management shows inconsistent membership when different users view it. What systematic investigation approach is most effective?",
    choices: [
      {
        id: "a",
        text: "Check if users have different sensor permissions affecting group visibility",
      },
      {
        id: "b",
        text: "Verify patch sensor update schedules and data freshness across users' sessions",
      },
      {
        id: "c",
        text: "Examine if users belong to different RBAC computer group assignments",
      },
      {
        id: "d",
        text: "Investigate all above factors plus time zone differences and caching",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Inconsistent group membership views require comprehensive investigation of multiple factors: sensor permissions (affecting data visibility), sensor update schedules (causing temporal differences), RBAC assignments (limiting scope), and technical factors like time zones and caching that can affect when users see updates.",
    tags: ["group-inconsistencies", "patch-management", "comprehensive-troubleshooting"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-RQ-0023",
    question: "What is the primary purpose of filter groups in Tanium?",
    choices: [
      {
        id: "a",
        text: "To organize sensors by category",
      },
      {
        id: "b",
        text: "To create reusable filter criteria that can be applied to questions and actions",
      },
      {
        id: "c",
        text: "To manage user permissions and access control",
      },
      {
        id: "d",
        text: "To schedule automated queries and reports",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Filter groups allow operators to create reusable filter criteria that can be applied to multiple questions and actions, promoting consistency and efficiency in targeting specific sets of endpoints.",
    tags: ["filter-groups", "reusable-criteria", "targeting-efficiency"],
    studyGuideRef: "tco-study-path/rbac",
  },
  {
    id: "TCO-TA-0019",
    question:
      "You need to deploy a software update that requires verification of successful installation. What post-deployment validation approach is most reliable?",
    choices: [
      {
        id: "a",
        text: "Check action completion status in the Deploy module",
      },
      {
        id: "b",
        text: "Query target systems to verify the software version was updated",
      },
      {
        id: "c",
        text: "Review action logs for success messages",
      },
      {
        id: "d",
        text: "Wait for scheduled inventory scans to reflect changes",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Querying target systems to verify the actual software version provides the most reliable validation. This confirms that the software was not only deployed but actually installed correctly and is reporting the expected version.",
    tags: ["post-deployment", "validation", "software-updates"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "university/action-deployment",
  },
  {
    id: "TCO-TA-0020",
    question: "What does 'action status' indicate in the Tanium Deploy module?",
    choices: [
      {
        id: "a",
        text: "Only whether the action was approved",
      },
      {
        id: "b",
        text: "The current state of action execution including pending, running, completed, or failed",
      },
      {
        id: "c",
        text: "The number of systems targeted by the action",
      },
      {
        id: "d",
        text: "The user who initiated the action",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Action status indicates the current state of action execution, including states like pending (waiting to execute), running (currently executing), completed (finished successfully), or failed (encountered errors).",
    tags: ["action-status", "execution-states", "deployment-monitoring"],
    studyGuideRef: "tco-study-path/packages",
  },
  {
    id: "TCO-TA-0021",
    question:
      "An emergency security action needs to be deployed immediately but the normal approval workflow would cause dangerous delays. What approach balances urgency with governance?",
    choices: [
      {
        id: "a",
        text: "Bypass approvals entirely and deploy immediately",
      },
      {
        id: "b",
        text: "Use emergency approval procedures with post-deployment review and documentation",
      },
      {
        id: "c",
        text: "Deploy to a small test group first, then wait for approvals",
      },
      {
        id: "d",
        text: "Escalate to senior management for immediate approval override",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Emergency approval procedures that allow immediate deployment while ensuring post-deployment review and documentation provide the best balance between urgent security needs and governance requirements. This maintains accountability while enabling rapid response.",
    tags: ["emergency-procedures", "security-response", "governance-balance"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "blueprint/security-considerations",
  },
  {
    id: "TCO-NB-0019",
    question:
      "You need to customize the console interface to show only the modules relevant to your role. Where would you configure this?",
    choices: [
      {
        id: "a",
        text: "User dropdown > Interface Preferences",
      },
      {
        id: "b",
        text: "Main Menu > Administration > Module Configuration",
      },
      {
        id: "c",
        text: "This is controlled by RBAC permissions and cannot be customized by individual users",
      },
      {
        id: "d",
        text: "Main Menu > Settings > Module Display Options",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Module visibility in the Tanium Console is controlled by RBAC permissions assigned to users' roles. Individual users cannot customize which modules they see - this is determined by their role permissions to ensure proper access control.",
    tags: ["module-visibility", "rbac-control", "interface-customization"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0020",
    question:
      "What keyboard shortcut or method typically opens the main navigation menu in the Tanium Console?",
    choices: [
      {
        id: "a",
        text: "Ctrl+M",
      },
      {
        id: "b",
        text: "Clicking the hamburger menu icon (three horizontal lines)",
      },
      {
        id: "c",
        text: "Pressing the F1 key",
      },
      {
        id: "d",
        text: "Right-clicking anywhere in the interface",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The main navigation menu is typically accessed by clicking the hamburger menu icon (three horizontal lines), which is a standard web interface pattern used in the Tanium Console.",
    tags: ["navigation", "menu-access", "interface-interaction"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-NB-0021",
    question:
      "Multiple users report that certain console features load slowly only during business hours. What analysis approach identifies the root cause?",
    choices: [
      {
        id: "a",
        text: "Monitor server CPU and memory usage during peak vs off-peak hours",
      },
      {
        id: "b",
        text: "Analyze network bandwidth utilization and concurrent user load",
      },
      {
        id: "c",
        text: "Review database performance and query execution times",
      },
      {
        id: "d",
        text: "Systematically analyze all above factors plus client-side performance metrics",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Performance issues occurring only during business hours typically involve multiple factors: server resource utilization (CPU, memory), network bandwidth and concurrent users, database performance under load, and client-side rendering. A systematic analysis of all factors is needed to identify the bottleneck.",
    tags: ["performance-analysis", "peak-load", "multi-factor-troubleshooting"],
    studyGuideRef: "tco-study-path/troubleshooting",
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-RD-0017",
    question:
      "You need to create a report showing security patch compliance over the last 90 days. What data and format combination is most effective?",
    choices: [
      {
        id: "a",
        text: "Current patch status exported to PDF for executive review",
      },
      {
        id: "b",
        text: "Historical patch data with timestamps exported to CSV for trend analysis",
      },
      {
        id: "c",
        text: "Real-time patch queries exported to JSON for system integration",
      },
      {
        id: "d",
        text: "Scheduled patch reports exported to XML for compliance systems",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Historical patch data with timestamps exported to CSV provides the best combination for 90-day compliance reporting. The historical data shows trends over time, timestamps enable chronological analysis, and CSV format supports easy analysis in spreadsheets or BI tools.",
    tags: ["historical-reporting", "patch-compliance", "trend-analysis"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0018",
    question: "What is the primary advantage of using the PDF export format for reports?",
    choices: [
      {
        id: "a",
        text: "PDF files are smaller than other formats",
      },
      {
        id: "b",
        text: "PDF preserves formatting and layout for consistent presentation",
      },
      {
        id: "c",
        text: "PDF files can be edited more easily than other formats",
      },
      {
        id: "d",
        text: "PDF format loads faster in web browsers",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "PDF format preserves formatting and layout, ensuring consistent presentation across different systems, devices, and viewing applications. This makes it ideal for formal reports and executive presentations.",
    tags: ["pdf-format", "formatting-preservation", "consistent-presentation"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0019",
    question:
      "A compliance officer needs weekly reports showing data changes and requires full audit trails. What reporting architecture best meets these requirements?",
    choices: [
      {
        id: "a",
        text: "Weekly scheduled reports with current data snapshots",
      },
      {
        id: "b",
        text: "Daily incremental reports showing only changes since previous report",
      },
      {
        id: "c",
        text: "Automated reporting system with baseline snapshots, change detection, and audit logging",
      },
      {
        id: "d",
        text: "Monthly comprehensive reports with detailed system inventories",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "An automated reporting system with baseline snapshots, change detection, and audit logging provides the most comprehensive solution. It captures baseline states, identifies changes over time, maintains audit trails, and can generate weekly summaries while preserving historical context.",
    tags: ["audit-trails", "change-detection", "automated-reporting"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-AQ-0027",
    question:
      "You need to find systems with high CPU usage that also have specific processes running. Which query structure is most effective?",
    choices: [
      {
        id: "a",
        text: "Get Computer Name from machines with CPU Usage > 80 and Process Name contains 'specific_process'",
      },
      {
        id: "b",
        text: "Get Computer Name, CPU Usage, Process Name from machines with CPU Usage is greater than '80' and Running Processes contains 'specific_process'",
      },
      {
        id: "c",
        text: "Get Computer Name and CPU Usage from machines with High CPU Usage and Processes exist",
      },
      {
        id: "d",
        text: "Get System Performance from machines with CPU Problems and Process Issues",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option B uses correct Tanium syntax with 'is greater than' for numeric comparison, proper quoting, and 'contains' for process matching. It also returns all relevant data (computer name, CPU usage, and process name) for comprehensive analysis.",
    tags: ["performance-monitoring", "process-analysis", "combined-conditions"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "university/interact-mastery",
  },
  {
    id: "TCO-AQ-0028",
    question: "What type of data does the Process Name sensor return?",
    choices: [
      {
        id: "a",
        text: "Only the names of running processes",
      },
      {
        id: "b",
        text: "Process names along with their process IDs (PIDs)",
      },
      {
        id: "c",
        text: "Complete process information including memory usage",
      },
      {
        id: "d",
        text: "Process names, startup parameters, and execution paths",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Process Name sensor specifically returns the names of currently running processes on the system. Other sensors provide additional process details like PIDs, memory usage, or execution paths.",
    tags: ["process-name", "running-processes", "sensors"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-RQ-0024",
    question:
      "You need to create a computer group for systems that require immediate security attention. Which criteria combination is most appropriate?",
    choices: [
      {
        id: "a",
        text: "Systems with missing critical patches OR outdated antivirus definitions",
      },
      {
        id: "b",
        text: "Systems with missing critical patches AND outdated antivirus definitions",
      },
      {
        id: "c",
        text: "Systems with any missing patches AND any security software issues",
      },
      {
        id: "d",
        text: "Systems with high vulnerability scores OR compliance violations",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Using OR logic with critical security conditions (missing critical patches OR outdated antivirus) captures systems with any immediate security risks. This ensures no high-risk systems are missed, as either condition alone warrants immediate attention.",
    tags: ["security-groups", "risk-assessment", "boolean-logic"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "blueprint/security-considerations",
  },
  {
    id: "TCO-TA-0022",
    question:
      "You need to deploy a registry change that affects system boot behavior. What deployment precautions are most important?",
    choices: [
      {
        id: "a",
        text: "Deploy during business hours for immediate support",
      },
      {
        id: "b",
        text: "Test thoroughly in non-production, deploy in phases, and have registry backup/rollback procedures",
      },
      {
        id: "c",
        text: "Deploy to all systems simultaneously to maintain consistency",
      },
      {
        id: "d",
        text: "Use elevated privileges and maximum timeout settings",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Registry changes affecting boot behavior require careful handling: thorough non-production testing to validate functionality, phased deployment to limit risk exposure, and registry backup/rollback procedures in case changes cause boot issues.",
    tags: ["registry-changes", "boot-behavior", "risk-mitigation"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "blueprint/security-considerations",
  },
  {
    id: "TCO-NB-0022",
    question:
      "You need to monitor multiple ongoing deployments across different modules. What navigation strategy is most efficient?",
    choices: [
      {
        id: "a",
        text: "Use separate browser windows for each module",
      },
      {
        id: "b",
        text: "Navigate between modules using the main menu repeatedly",
      },
      {
        id: "c",
        text: "Use module tabs to keep multiple modules open and switch between them",
      },
      {
        id: "d",
        text: "Use browser bookmarks for direct access to each module",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Using module tabs allows you to keep multiple modules (like Deploy for action monitoring, Asset for system status) open simultaneously and switch between them efficiently without losing context or having to reload interfaces.",
    tags: ["multi-module", "deployment-monitoring", "navigation-efficiency"],
    officialRef: "university/tco-foundations",
  },
  {
    id: "TCO-RD-0020",
    question:
      "You need to export large datasets (100,000+ records) reliably. What approach minimizes export failures?",
    choices: [
      {
        id: "a",
        text: "Export during off-peak hours with maximum timeout settings",
      },
      {
        id: "b",
        text: "Segment the export into smaller chunks based on time periods or system groups",
      },
      {
        id: "c",
        text: "Use compressed file formats to reduce export size",
      },
      {
        id: "d",
        text: "Export to multiple formats simultaneously for redundancy",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Segmenting large exports into smaller chunks based on time periods, system groups, or other criteria is the most reliable approach. This reduces memory usage, network timeouts, and provides recovery options if individual segments fail.",
    tags: ["large-datasets", "export-reliability", "data-segmentation"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-AQ-0034",
    question: "What does the Last Reboot Time sensor tell you about a system?",
    choices: [
      {
        id: "a",
        text: "When the system was last shut down",
      },
      {
        id: "b",
        text: "When the system was last started or restarted",
      },
      {
        id: "c",
        text: "How long the system has been running continuously",
      },
      {
        id: "d",
        text: "When the system last received updates",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Last Reboot Time sensor indicates when the system was last started or restarted, providing information about system uptime and recent reboot activity.",
    tags: ["last-reboot", "system-uptime", "reboot-tracking"],
    studyGuideRef: "tco-study-path/sensors",
  },
  {
    id: "TCO-AQ-0035",
    question:
      "A sensor query for system uptime returns inconsistent values across multiple runs on the same systems. What factors should be investigated?",
    choices: [
      {
        id: "a",
        text: "System clock synchronization issues between endpoints and server",
      },
      {
        id: "b",
        text: "Sensor caching or update frequency settings affecting data freshness",
      },
      {
        id: "c",
        text: "Network latency causing timestamp variations during data collection",
      },
      {
        id: "d",
        text: "All of the above factors can contribute to uptime inconsistencies",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Uptime inconsistencies can result from multiple factors: clock synchronization issues (affecting timestamp accuracy), sensor caching/update frequency (causing stale data), and network latency (affecting collection timing). All factors should be investigated systematically.",
    tags: ["uptime-inconsistencies", "timing-issues", "multi-factor-troubleshooting"],
    studyGuideRef: "tco-study-path/troubleshooting",
  },
  {
    id: "TCO-AQ-0036",
    question:
      "You need to find systems that haven't been patched in the last 30 days. Which query structure is most appropriate?",
    choices: [
      {
        id: "a",
        text: "Get Computer Name from machines with Last Patch Date is less than '30 days ago'",
      },
      {
        id: "b",
        text: "Get Computer Name from machines with Last Patch Date is older than '30 days'",
      },
      {
        id: "c",
        text: "Get Computer Name and Last Patch Date from machines with Patch Age is greater than '30'",
      },
      {
        id: "d",
        text: "Get Computer Name from machines with Recent Patches does not exist",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Option A uses correct Tanium syntax with 'is less than' and relative time reference '30 days ago' to identify systems that haven't received patches within the specified timeframe. This is the standard approach for date-based filtering.",
    tags: ["patch-currency", "date-filtering", "maintenance-tracking"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "university/interact-mastery",
  },
  {
    id: "TCO-RQ-0025",
    question:
      "When deleting a computer group, what critical considerations must you evaluate before proceeding to avoid disrupting existing operations?",
    choices: [
      {
        id: "a",
        text: "Only verify that the group exists in the management interface",
      },
      {
        id: "b",
        text: "Check RBAC assignments, content associations, scheduled actions, and saved questions referencing the group",
      },
      {
        id: "c",
        text: "Ensure the group has no active endpoints before deletion",
      },
      {
        id: "d",
        text: "Confirm backup and recovery procedures are in place",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Before deleting a computer group, you must account for RBAC assignments (persona configurations), content associations (action groups, scheduled actions, saved questions), and scheduled content that targets the group. These dependencies continue to function based on the information provided at creation time, requiring careful review and modification.",
    tags: ["computer-groups", "rbac", "dependencies", "group-management"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "platform/computer-groups",
  },
  {
    id: "TCO-RQ-0026",
    question:
      "You need to create a filter for servers running critical applications. Which filtering approach provides the most reliable targeting?",
    choices: [
      {
        id: "a",
        text: "Use hostname patterns to identify server types",
      },
      {
        id: "b",
        text: "Create multiple specific filters combining OS type, installed software, and server roles",
      },
      {
        id: "c",
        text: "Filter based on IP address ranges only",
      },
      {
        id: "d",
        text: "Use computer names containing 'SRV' or 'SERVER'",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Multiple specific filters combining OS type, installed software, and server roles provide the most reliable targeting. This approach uses concrete system attributes rather than naming conventions that may change or be inconsistent across environments.",
    tags: ["filtering", "server-targeting", "reliability", "multi-criteria"],
    studyGuideRef: "tco-study-path/filtering-advanced",
  },
  {
    id: "TCO-NB-0023",
    question:
      "In the Tanium Console, which navigation path allows you to access deployment plan configurations for progressive action rollouts?",
    choices: [
      {
        id: "a",
        text: "Administration > Configuration > Deployment Plans",
      },
      {
        id: "b",
        text: "Interact > Actions > Deployment Plans",
      },
      {
        id: "c",
        text: "Deploy > Configuration > Plans",
      },
      {
        id: "d",
        text: "Actions > Deploy > Progressive Rollout",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Deploy > Configuration > Plans is the correct navigation path for accessing deployment plan configurations. Deployment plans enable progressive action rollouts with dynamic targeting and execution success rate criteria.",
    tags: ["navigation", "deployment-plans", "progressive-rollout", "deploy-module"],
    studyGuideRef: "tco-study-path/deploy-navigation",
    officialRef: "platform/deployment-plans",
  },
  {
    id: "TCO-NB-0024",
    question:
      "What is the recommended progression criteria for dynamic deployment plans instead of using Minimum Endpoints?",
    choices: [
      {
        id: "a",
        text: "Maximum Failure Rate",
      },
      {
        id: "b",
        text: "Execution Success Rate",
      },
      {
        id: "c",
        text: "Target Percentage",
      },
      {
        id: "d",
        text: "Ring Size Limit",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Execution Success Rate is recommended over Minimum Endpoints for dynamic deployment plans. The randomness of targeting makes it difficult to predict endpoint counts, making success rate a more reliable progression criterion.",
    tags: ["deployment-plans", "progression-criteria", "success-rate", "dynamic-targeting"],
    studyGuideRef: "tco-study-path/deployment-progression",
  },
  {
    id: "TCO-TA-0023",
    question:
      "When configuring Tanium Endpoint Configuration for solution deployment, what is the primary benefit of using versioned toolsets?",
    choices: [
      {
        id: "a",
        text: "Reduces network bandwidth usage",
      },
      {
        id: "b",
        text: "Consolidates configuration actions and eliminates timing errors",
      },
      {
        id: "c",
        text: "Provides automatic rollback capabilities",
      },
      {
        id: "d",
        text: "Enables offline configuration management",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Versioned toolsets consolidate configuration actions and eliminate timing errors between when a solution configuration is made and when it reaches endpoints. This greatly reduces installation time and improves targeting flexibility.",
    tags: ["endpoint-configuration", "toolsets", "configuration-management", "timing"],
    studyGuideRef: "tco-study-path/endpoint-configuration",
  },
  {
    id: "TCO-RD-0021",
    question:
      "When building reports in the Asset module, which approach provides the most comprehensive data export capability?",
    choices: [
      {
        id: "a",
        text: "Use only default report templates with standard fields",
      },
      {
        id: "b",
        text: "Create custom reports with multiple data sources and configurable field selection",
      },
      {
        id: "c",
        text: "Export raw sensor data directly without report formatting",
      },
      {
        id: "d",
        text: "Use preset dashboard widgets for data visualization only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Custom reports with multiple data sources and configurable field selection provide the most comprehensive export capability. This allows combining data from various Tanium solutions and selecting specific fields needed for analysis.",
    tags: ["asset-module", "report-building", "data-export", "custom-reports"],
    studyGuideRef: "tco-study-path/asset-reporting",
    officialRef: "platform/asset-reports",
  },
  {
    id: "TCO-RD-0022",
    question:
      "Which module provides the primary interface for exploring endpoint data across Tanium solutions and creating custom reports?",
    choices: [
      {
        id: "a",
        text: "Interact module",
      },
      {
        id: "b",
        text: "Deploy module",
      },
      {
        id: "c",
        text: "Reporting module",
      },
      {
        id: "d",
        text: "Administration module",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Reporting module provides the primary interface for exploring endpoint data across Tanium solutions and creating custom reports and charts. It consolidates data from multiple Tanium solutions into unified reporting capabilities.",
    tags: ["reporting-module", "data-exploration", "custom-reports", "interface"],
    studyGuideRef: "tco-study-path/reporting-overview",
  },
  {
    id: "TCO-NB-0025",
    question:
      "In the Asset module interface, which navigation path allows you to access report building functionality?",
    choices: [
      {
        id: "a",
        text: "Asset > Overview > Reports",
      },
      {
        id: "b",
        text: "Asset > Reports > Build",
      },
      {
        id: "c",
        text: "Reports > Asset > Create",
      },
      {
        id: "d",
        text: "Asset > Configuration > Report Builder",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Asset > Reports > Build is the correct navigation path for accessing report building functionality within the Asset module. This provides access to custom report creation tools and data source selection.",
    tags: ["navigation", "asset-module", "report-building", "interface"],
    studyGuideRef: "tco-study-path/asset-navigation",
  },
  {
    id: "TCO-AQ-0037",
    question:
      "When constructing a query to identify systems with specific software installed, which sensor combination provides the most reliable results?",
    choices: [
      {
        id: "a",
        text: "Installed Applications sensor only",
      },
      {
        id: "b",
        text: "Installed Applications and Running Processes sensors combined",
      },
      {
        id: "c",
        text: "Registry entries sensor only",
      },
      {
        id: "d",
        text: "File existence sensor only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Combining Installed Applications and Running Processes sensors provides the most reliable results for software identification. This approach captures both installed software (from Add/Remove Programs) and currently active processes, providing comprehensive software visibility.",
    tags: ["sensor-combination", "software-detection", "applications", "processes"],
    studyGuideRef: "tco-study-path/sensors-software",
  },
  {
    id: "TCO-TA-0024",
    question:
      "During a critical security incident, you need to deploy a remediation package to affected systems immediately. What deployment strategy minimizes risk while ensuring rapid response?",
    choices: [
      {
        id: "a",
        text: "Deploy to all systems simultaneously using maximum concurrency",
      },
      {
        id: "b",
        text: "Use a pilot deployment with small initial group, then progressive rollout with success criteria",
      },
      {
        id: "c",
        text: "Deploy only to high-priority systems first, then wait for manual verification",
      },
      {
        id: "d",
        text: "Use scheduled deployment during maintenance window only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "A pilot deployment with progressive rollout and success criteria minimizes risk while enabling rapid response. This allows validation of package effectiveness on a small group before broader deployment, with automatic progression based on success metrics.",
    tags: ["incident-response", "deployment-strategy", "risk-management", "progressive-rollout"],
    studyGuideRef: "tco-study-path/incident-response",
    officialRef: "platform/progressive-deployment",
  },
  {
    id: "TCO-NB-0026",
    question:
      "In role-based access control (RBAC), what is the correct order for configuring role components in the Tanium Console?",
    choices: [
      {
        id: "a",
        text: "Users → Roles → Permissions → Content Sets",
      },
      {
        id: "b",
        text: "Permissions → Content Sets → Roles → Users",
      },
      {
        id: "c",
        text: "Content Sets → Permissions → Roles → Users",
      },
      {
        id: "d",
        text: "Roles → Users → Content Sets → Permissions",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The correct order is Permissions → Content Sets → Roles → Users. This follows the logical hierarchy where permissions are defined first, then associated with content sets, combined into roles, and finally assigned to users and groups.",
    tags: ["rbac", "role-configuration", "permissions", "administration"],
    studyGuideRef: "tco-study-path/rbac-configuration",
  },
  {
    id: "TCO-NB-0027",
    question:
      "A user inherits 'read' permission from their user group but has 'write' permission directly assigned. What is the effective permission and why?",
    choices: [
      {
        id: "a",
        text: "Read only - group permissions override individual permissions",
      },
      {
        id: "b",
        text: "Write - individual permissions override group permissions",
      },
      {
        id: "c",
        text: "Write - Tanium uses most permissive effective permissions",
      },
      {
        id: "d",
        text: "No access - conflicting permissions result in denial",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Write - Tanium uses the most permissive effective permissions. When a user has conflicting permissions from different sources (groups vs. direct assignment), the system grants the highest level of access available from any source.",
    tags: ["rbac", "permission-inheritance", "effective-permissions", "conflict-resolution"],
    studyGuideRef: "tco-study-path/rbac-inheritance",
    officialRef: "platform/permissions-model",
  },
  {
    id: "TCO-RQ-0027",
    question:
      "When configuring content set permissions for a role, what does 'provided permission' automatically include?",
    choices: [
      {
        id: "a",
        text: "Only the exact permission specified",
      },
      {
        id: "b",
        text: "The specified permission plus all higher-level permissions",
      },
      {
        id: "c",
        text: "The specified permission plus required dependencies (e.g., write implies read)",
      },
      {
        id: "d",
        text: "All permissions within the content set",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Provided permissions automatically include required dependencies. For example, Action write permission automatically provides Package read permission, and Sensor write permission automatically provides Sensor read permission for the same content set.",
    tags: ["content-sets", "provided-permissions", "permission-dependencies", "rbac"],
    studyGuideRef: "tco-study-path/content-permissions",
  },
  {
    id: "TCO-RQ-0028",
    question: "In Tanium's RBAC model, what type of relationship exists between roles and users?",
    choices: [
      {
        id: "a",
        text: "One-to-one relationship",
      },
      {
        id: "b",
        text: "One-to-many relationship",
      },
      {
        id: "c",
        text: "Many-to-many relationship",
      },
      {
        id: "d",
        text: "Hierarchical relationship only",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Roles have a many-to-many relationship with users. Multiple users can have the same role, and each user can have multiple roles. This flexible assignment model allows for granular permission management across different functional areas.",
    tags: ["rbac", "role-relationships", "user-assignment", "many-to-many"],
    studyGuideRef: "tco-study-path/rbac-relationships",
  },
  {
    id: "TCO-TA-0025",
    question:
      "When a Tanium solution provides predefined roles, what additional configuration may be required for full functionality?",
    choices: [
      {
        id: "a",
        text: "Custom permission creation only",
      },
      {
        id: "b",
        text: "Content set assignments for solution-specific permissions",
      },
      {
        id: "c",
        text: "User group restructuring",
      },
      {
        id: "d",
        text: "Administrative approval for each role",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Some solution permissions require content set assignments to function properly. Predefined roles provide the framework, but content set assignments determine which specific resources the role can access within that solution.",
    tags: ["solution-roles", "content-sets", "predefined-roles", "configuration"],
    studyGuideRef: "tco-study-path/solution-permissions",
  },
  {
    id: "TCO-TA-0026",
    question:
      "When troubleshooting a failed deployment, what is the recommended sequence of investigation steps?",
    choices: [
      {
        id: "a",
        text: "Stop deployment → Review deployment details → Investigate endpoints → Re-issue action",
      },
      {
        id: "b",
        text: "Review deployment status → Pause deployment → Investigate affected endpoints → Resolve issues",
      },
      {
        id: "c",
        text: "Check action logs → Review targeting → Stop deployment → Contact support",
      },
      {
        id: "d",
        text: "Restart deployment → Check network connectivity → Review permissions → Wait for completion",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "The correct sequence is: Review deployment status and ring details → Pause/stop deployment if needed → List affected endpoints in Interact → Investigate specific endpoint issues → Resolve problems before resuming. This systematic approach prevents further issues while investigating root causes.",
    tags: [
      "deployment-troubleshooting",
      "investigation-sequence",
      "failure-analysis",
      "systematic-approach",
    ],
    studyGuideRef: "tco-study-path/deployment-troubleshooting",
    officialRef: "platform/ring-deployments",
  },
  {
    id: "TCO-TA-0027",
    question:
      "In the Ring Deployment Status page, what information helps identify the specific deployment when the Action Name shows 'Ring Deployment (ID: 12345, Ring Index: 2)'?",
    choices: [
      {
        id: "a",
        text: "The Ring Index number is the unique identifier",
      },
      {
        id: "b",
        text: "The deployment ID (12345) is unique per deployment across all rings",
      },
      {
        id: "c",
        text: "The Action Name contains the actual package name",
      },
      {
        id: "d",
        text: "The timestamp determines the deployment identity",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The deployment ID (12345 in this example) is unique per deployment and remains the same for all rings within a single adaptive deployment. The Ring Index identifies the specific ring within that deployment, but the deployment ID is the key identifier for the entire deployment.",
    tags: ["deployment-id", "ring-deployments", "identification", "action-naming"],
    studyGuideRef: "tco-study-path/deployment-identification",
  },
  {
    id: "TCO-TA-0028",
    question:
      "When reviewing action logs to troubleshoot a failed package, what is the primary location where action execution details are recorded?",
    choices: [
      {
        id: "a",
        text: "Tanium Server logs only",
      },
      {
        id: "b",
        text: "Tanium Client logs on affected endpoints",
      },
      {
        id: "c",
        text: "Console audit logs",
      },
      {
        id: "d",
        text: "Package repository logs",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Tanium Client logs on affected endpoints contain the detailed action execution information needed for troubleshooting. Each time a Client receives an action message, execution details and results are logged locally, making Client logs the primary source for package troubleshooting.",
    tags: ["action-logs", "client-logs", "troubleshooting", "package-debugging"],
    studyGuideRef: "tco-study-path/action-logging",
  },
  {
    id: "TCO-RD-0023",
    question:
      "When exporting deployment status data for analysis, which information provides the most comprehensive audit trail?",
    choices: [
      {
        id: "a",
        text: "Action names and completion times only",
      },
      {
        id: "b",
        text: "Deployment details including status, issuer, and endpoint-specific results",
      },
      {
        id: "c",
        text: "Ring progression metrics only",
      },
      {
        id: "d",
        text: "Package file checksums and versions",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Deployment details including status, issuer, and endpoint-specific results provide the most comprehensive audit trail. This includes who issued the action, when it was deployed, current status, and individual endpoint outcomes needed for complete auditing and troubleshooting.",
    tags: ["audit-trail", "deployment-status", "export-data", "comprehensive-reporting"],
    studyGuideRef: "tco-study-path/deployment-auditing",
  },
  {
    id: "TCO-NB-0028",
    question:
      "Which page in the Tanium Console provides visibility into ring-based deployment status and progress?",
    choices: [
      {
        id: "a",
        text: "Action History page",
      },
      {
        id: "b",
        text: "Ring Deployment Status page",
      },
      {
        id: "c",
        text: "Deployment Configuration page",
      },
      {
        id: "d",
        text: "Package Management page",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Ring Deployment Status page provides visibility into ring-based (adaptive) deployment status and progress. This page shows deployment details, ring progression, and endpoint-level status for troubleshooting deployment issues.",
    tags: ["navigation", "ring-deployments", "status-monitoring", "console-interface"],
    studyGuideRef: "tco-study-path/deployment-navigation",
  },
  {
    id: "TCO-AQ-0038",
    question:
      "When investigating deployment anomalies using Interact, what is the most effective approach for identifying affected endpoints?",
    choices: [
      {
        id: "a",
        text: "Query all endpoints and filter results manually",
      },
      {
        id: "b",
        text: "Use deployment details to identify specific endpoints, then query those endpoints in Interact",
      },
      {
        id: "c",
        text: "Search by package name across all systems",
      },
      {
        id: "d",
        text: "Query based on timestamp ranges only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Using deployment details to identify specific endpoints, then querying those endpoints in Interact is most effective. The Deployment Details page shows which endpoints had issues, allowing targeted investigation through Interact questions rather than broad queries.",
    tags: [
      "interact-investigation",
      "targeted-queries",
      "deployment-anomalies",
      "endpoint-identification",
    ],
    studyGuideRef: "tco-study-path/deployment-investigation",
  },
  {
    id: "TCO-RD-0024",
    question:
      "What is the most common method for exporting Asset report data to external applications?",
    choices: [
      {
        id: "a",
        text: "Direct database connection",
      },
      {
        id: "b",
        text: "CSV file format with clipboard copy/paste",
      },
      {
        id: "c",
        text: "API integration only",
      },
      {
        id: "d",
        text: "XML export to file system",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "CSV file format with clipboard copy/paste is the most common method. You can copy data from an Asset report table to the clipboard and paste it into applications that can interpret CSV format, making it easily accessible for external analysis.",
    tags: ["csv-export", "asset-data", "clipboard", "external-applications"],
    studyGuideRef: "tco-study-path/asset-export",
  },
  {
    id: "TCO-RD-0025",
    question:
      "When configuring Asset to export data to external destinations, which types of integrations are supported?",
    choices: [
      {
        id: "a",
        text: "Only Tanium Connect",
      },
      {
        id: "b",
        text: "Tanium Connect, Flexera, and ServiceNow",
      },
      {
        id: "c",
        text: "Flexera and ServiceNow only",
      },
      {
        id: "d",
        text: "Any JDBC-compatible system",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Asset supports export to Tanium Connect, Flexera, and ServiceNow as external destinations. These integrations allow for automated data sharing with IT service management and asset management platforms.",
    tags: ["external-integrations", "tanium-connect", "flexera", "servicenow"],
    studyGuideRef: "tco-study-path/asset-integrations",
  },
  {
    id: "TCO-RQ-0029",
    question:
      "When filtering Asset reports for export, what approach provides the most targeted data extraction?",
    choices: [
      {
        id: "a",
        text: "Export all data and filter externally",
      },
      {
        id: "b",
        text: "Use report filters and column selection before export",
      },
      {
        id: "c",
        text: "Apply filters after export in external system",
      },
      {
        id: "d",
        text: "Use separate queries for each data subset",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Using report filters and column selection before export provides the most targeted data extraction. This approach minimizes data transfer, reduces processing time, and ensures only relevant information is exported to external systems.",
    tags: ["report-filtering", "data-targeting", "export-optimization", "column-selection"],
    studyGuideRef: "tco-study-path/report-filtering",
  },
  {
    id: "TCO-RQ-0030",
    question:
      "You need to create a complex filter for systems that meet multiple criteria: Windows OS, less than 8GB RAM, and not in the 'Development' computer group. What is the most efficient approach?",
    choices: [
      {
        id: "a",
        text: "Create three separate questions and manually combine results",
      },
      {
        id: "b",
        text: "Use a single filter with logical AND operators for all conditions",
      },
      {
        id: "c",
        text: "Filter by OS first, then apply additional filters sequentially",
      },
      {
        id: "d",
        text: "Create nested computer groups for each condition",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "A single filter with logical AND operators for all conditions is most efficient. This approach: Operating System contains 'Windows' and RAM is less than '8000' and Computer Group does not contain 'Development' processes all criteria simultaneously with optimal performance.",
    tags: ["complex-filtering", "logical-operators", "multiple-criteria", "efficiency"],
    studyGuideRef: "tco-study-path/complex-filtering",
  },
  {
    id: "TCO-NB-0029",
    question:
      "In the Tanium Console, which navigation sequence allows you to access Asset export configuration settings?",
    choices: [
      {
        id: "a",
        text: "Asset > Settings > Export Configuration",
      },
      {
        id: "b",
        text: "Asset > Configuration > External Destinations",
      },
      {
        id: "c",
        text: "Administration > Asset > Export Settings",
      },
      {
        id: "d",
        text: "Asset > Reports > Export Options",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Asset > Configuration > External Destinations is the correct navigation path for accessing export configuration settings. This section allows configuration of integrations with external systems like Tanium Connect, Flexera, and ServiceNow.",
    tags: ["navigation", "asset-configuration", "export-settings", "external-destinations"],
    studyGuideRef: "tco-study-path/asset-configuration",
  },
  {
    id: "TCO-NB-0030",
    question:
      "Which Asset interface component allows direct copying of report data to the clipboard for external use?",
    choices: [
      {
        id: "a",
        text: "Export button in toolbar",
      },
      {
        id: "b",
        text: "Report table with right-click context menu",
      },
      {
        id: "c",
        text: "Download links in report footer",
      },
      {
        id: "d",
        text: "API endpoint for data access",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The report table with right-click context menu allows direct copying of report data to the clipboard. This provides quick access to copy selected data in CSV format for pasting into external applications.",
    tags: ["report-interface", "clipboard-copy", "right-click-menu", "data-access"],
    studyGuideRef: "tco-study-path/report-interface",
  },
  {
    id: "TCO-AQ-0039",
    question:
      "When searching for computer names containing quotation marks in the name, what is the correct syntax for escaping quotation marks in a Tanium question?",
    choices: [
      {
        id: "a",
        text: 'Get Computer Name from all machines with Computer Name contains "\\"test\\""',
      },
      {
        id: "b",
        text: 'Get Computer Name from all machines with Computer Name contains """test"""',
      },
      {
        id: "c",
        text: "Get Computer Name from all machines with Computer Name contains '\"test\"'",
      },
      {
        id: "d",
        text: 'Get Computer Name from all machines with Computer Name contains ["test"]',
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      'Use double quotation marks as an escape-character sequence for each instance of quotation marks in a text string. The syntax """test""" properly escapes the quotation marks within the search string.',
    tags: ["natural-language", "quotation-escaping", "special-characters", "query-syntax"],
    studyGuideRef: "tco-study-path/natural-language-escaping",
  },
  {
    id: "TCO-AQ-0040",
    question:
      "What characters require quotation marks when used in Tanium natural language questions?",
    choices: [
      {
        id: "a",
        text: "Only quotation marks and dollar signs",
      },
      {
        id: "b",
        text: "Periods, commas, colons, question marks, dollar signs, and white spaces",
      },
      {
        id: "c",
        text: "Only white spaces and special characters",
      },
      {
        id: "d",
        text: "All punctuation except hyphens and underscores",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      'The characters that require quotation marks in Tanium questions are: quotation marks ("), periods (.), commas (,), colons (:), question marks (?), dollar signs ($), and white spaces. These must be enclosed in quotes to be properly interpreted.',
    tags: ["natural-language", "special-characters", "quotation-requirements", "query-syntax"],
    studyGuideRef: "tco-study-path/special-characters",
  },
  {
    id: "TCO-AQ-0041",
    question:
      "What type of question allows real-time query creation and execution through the Tanium interface?",
    choices: [
      {
        id: "a",
        text: "Saved question",
      },
      {
        id: "b",
        text: "Dynamic question",
      },
      {
        id: "c",
        text: "Scheduled question",
      },
      {
        id: "d",
        text: "Parameterized question",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "A dynamic question is one that you create and issue in real-time through the Tanium interface. These questions are constructed interactively and executed immediately, as opposed to saved questions which are pre-configured.",
    tags: ["dynamic-questions", "question-types", "real-time-queries", "interactive"],
    studyGuideRef: "tco-study-path/question-types",
  },
  {
    id: "TCO-RQ-0031",
    question:
      "When creating a question to find computers with names containing a specific letter combination, what is the correct syntax structure?",
    choices: [
      {
        id: "a",
        text: 'Find Computer Name where name includes "letter_combination"',
      },
      {
        id: "b",
        text: 'Get Computer Name from all machines with Computer Name contains "letter_combination"',
      },
      {
        id: "c",
        text: 'Select Computer Name from endpoints containing "letter_combination"',
      },
      {
        id: "d",
        text: 'Query Computer Name with filter contains "letter_combination"',
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The correct syntax is 'Get Computer Name from all machines with Computer Name contains \"letter_combination\"'. This follows Tanium's natural language format: Get [sensor] from [targeting] with [filter condition].",
    tags: ["natural-language", "syntax-structure", "contains-operator", "question-format"],
    studyGuideRef: "tco-study-path/question-syntax",
  },
  {
    id: "TCO-RQ-0032",
    question:
      "You need to find computers with names that have blank spaces before and after a specific string. What query demonstrates the correct approach for handling white space in search criteria?",
    choices: [
      {
        id: "a",
        text: "Get Computer Name from all machines with Computer Name contains DBserver",
      },
      {
        id: "b",
        text: 'Get Computer Name from all machines with Computer Name contains " DBserver "',
      },
      {
        id: "c",
        text: "Get Computer Name from all machines with Computer Name contains [SPACE]DBserver[SPACE]",
      },
      {
        id: "d",
        text: "Get Computer Name from all machines with Computer Name contains %20DBserver%20",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "White spaces require quotation marks in Tanium questions. The syntax 'Computer Name contains \" DBserver \"' properly handles spaces before and after the string 'DBserver' by enclosing the entire search string including spaces in quotes.",
    tags: ["white-spaces", "special-characters", "string-matching", "quotation-marks"],
    studyGuideRef: "tco-study-path/whitespace-handling",
  },
  {
    id: "TCO-NB-0031",
    question:
      "Where in the Tanium Console can you view the results of questions issued to managed endpoints?",
    choices: [
      {
        id: "a",
        text: "Question History page",
      },
      {
        id: "b",
        text: "Question Results page",
      },
      {
        id: "c",
        text: "Query Output page",
      },
      {
        id: "d",
        text: "Endpoint Response page",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Question Results page displays the answers returned by Tanium Clients after processing questions. This page shows the data collected from endpoints in response to your queries.",
    tags: ["question-results", "navigation", "console-interface", "endpoint-responses"],
    studyGuideRef: "tco-study-path/question-results",
  },
  {
    id: "TCO-NB-0032",
    question:
      "In the Administration module, which section contains Global Settings for platform-wide configuration options?",
    choices: [
      {
        id: "a",
        text: "Administration > Platform Settings > Global",
      },
      {
        id: "b",
        text: "Administration > Configuration > Global Settings",
      },
      {
        id: "c",
        text: "Administration > System > Platform Configuration",
      },
      {
        id: "d",
        text: "Administration > Settings > System Wide",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Administration > Configuration > Global Settings contains the platform-wide configuration options. This section manages system-level settings that apply across the entire Tanium deployment.",
    tags: ["administration", "global-settings", "platform-configuration", "navigation"],
    studyGuideRef: "tco-study-path/administration-navigation",
  },
  {
    id: "TCO-NB-0033",
    question:
      "Which module provides the primary interface for platform administration and system configuration?",
    choices: [
      {
        id: "a",
        text: "Configuration module",
      },
      {
        id: "b",
        text: "Administration module",
      },
      {
        id: "c",
        text: "System module",
      },
      {
        id: "d",
        text: "Platform module",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Administration module provides the primary interface for platform administration and system configuration. This module contains user management, global settings, and system-wide configuration options.",
    tags: ["administration-module", "platform-admin", "system-config", "module-functions"],
    studyGuideRef: "tco-study-path/module-overview",
  },
  {
    id: "TCO-RQ-0033",
    question:
      "When configuring user access permissions, what is the most granular level at which you can control access to Tanium content?",
    choices: [
      {
        id: "a",
        text: "Module level only",
      },
      {
        id: "b",
        text: "Content set level with specific object permissions",
      },
      {
        id: "c",
        text: "Platform level only",
      },
      {
        id: "d",
        text: "Solution level only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Content set level with specific object permissions provides the most granular access control. Content sets contain related objects (sensors, packages, etc.) and permissions can be assigned at the individual object level within content sets.",
    tags: ["access-control", "content-sets", "granular-permissions", "object-level"],
    studyGuideRef: "tco-study-path/granular-permissions",
  },
  {
    id: "TCO-RQ-0034",
    question:
      "You need to create a targeting strategy for a critical update that should reach development systems first, then staging, then production in phases. What approach provides the most controlled rollout?",
    choices: [
      {
        id: "a",
        text: "Use static computer groups for each environment with manual action deployment",
      },
      {
        id: "b",
        text: "Create dynamic computer groups with environment-based filters and progressive deployment plans",
      },
      {
        id: "c",
        text: "Deploy to all systems simultaneously with different packages per environment",
      },
      {
        id: "d",
        text: "Use scheduled actions with different timing for each environment",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Dynamic computer groups with environment-based filters and progressive deployment plans provide the most controlled rollout. Dynamic groups automatically update membership based on criteria, and deployment plans enable phased rollouts with success criteria before proceeding to the next phase.",
    tags: ["targeting-strategy", "progressive-deployment", "dynamic-groups", "environment-phasing"],
    studyGuideRef: "tco-study-path/progressive-deployment",
    officialRef: "platform/deployment-strategies",
  },
  {
    id: "TCO-TA-0029",
    question:
      "When deploying actions to a large number of endpoints, what setting helps prevent network congestion and system overload?",
    choices: [
      {
        id: "a",
        text: "Deployment timeout settings",
      },
      {
        id: "b",
        text: "Bandwidth throttling and concurrency limits",
      },
      {
        id: "c",
        text: "Action retry intervals",
      },
      {
        id: "d",
        text: "Package compression settings",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Bandwidth throttling and concurrency limits help prevent network congestion and system overload during large deployments. These settings control how many endpoints receive actions simultaneously and limit network utilization.",
    tags: ["bandwidth-throttling", "concurrency-limits", "performance-tuning", "large-deployments"],
    studyGuideRef: "tco-study-path/deployment-performance",
  },
  {
    id: "TCO-TA-0030",
    question:
      "What is the minimum target number of endpoints typically recommended for the final ring in a progressive deployment?",
    choices: [
      {
        id: "a",
        text: "10 endpoints",
      },
      {
        id: "b",
        text: "50 endpoints",
      },
      {
        id: "c",
        text: "100 endpoints",
      },
      {
        id: "d",
        text: "30 endpoints",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "30 endpoints is typically recommended as the minimum target for the final ring in progressive deployment. This provides sufficient coverage to validate success before full deployment while maintaining manageable scope for the final phase.",
    tags: ["progressive-deployment", "ring-sizing", "deployment-planning", "endpoint-targets"],
    studyGuideRef: "tco-study-path/deployment-sizing",
  },
  {
    id: "TCO-RD-0026",
    question:
      "When configuring automated CSV export from Asset module, what is the correct approach to ensure data quality validation before external distribution?",
    choices: [
      {
        id: "a",
        text: "Export all data immediately without validation to maintain real-time synchronization",
      },
      {
        id: "b",
        text: "Configure data validation rules, test export samples, verify field completeness before scheduling",
      },
      {
        id: "c",
        text: "Rely on the external system to validate imported data quality",
      },
      {
        id: "d",
        text: "Export only when manually triggered to avoid automation errors",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Proper CSV export workflow includes configuring validation rules to check data completeness, testing export samples to verify format consistency, and ensuring field completeness before scheduling automated exports. This prevents distributing incomplete or malformed data.",
    tags: ["csv-export", "data-validation", "quality-assurance", "automation"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/data-export-validation",
  },
  {
    id: "TCO-RQ-0035",
    question:
      "A dynamic computer group with criteria 'Operating System contains Windows AND Last Seen within 7 days' shows inconsistent membership. Which troubleshooting approach best identifies the root cause?",
    choices: [
      {
        id: "a",
        text: "Check individual endpoint connectivity and sensor update frequency",
      },
      {
        id: "b",
        text: "Recreate the computer group with simpler criteria",
      },
      {
        id: "c",
        text: "Switch to static group management for better control",
      },
      {
        id: "d",
        text: "Increase the time window to 30 days",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Dynamic groups depend on real-time sensor data. Inconsistent membership often indicates connectivity issues, sensor update delays, or endpoint reporting problems. Checking endpoint connectivity and sensor update frequency addresses the root cause of membership fluctuations.",
    tags: ["dynamic-groups", "troubleshooting", "connectivity", "sensor-updates"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/computer-group-troubleshooting",
  },
  {
    id: "TCO-NB-0034",
    question:
      "Which Tanium console module is primarily used for viewing endpoint inventory and generating asset reports?",
    choices: [
      {
        id: "a",
        text: "Interact",
      },
      {
        id: "b",
        text: "Deploy",
      },
      {
        id: "c",
        text: "Asset",
      },
      {
        id: "d",
        text: "Administration",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Asset module is specifically designed for endpoint inventory management and generating comprehensive asset reports. It provides detailed information about hardware, software, and configuration data across managed endpoints.",
    tags: ["asset-module", "inventory", "console-navigation", "reporting"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/asset-module-overview",
  },
  {
    id: "TCO-AQ-0040",
    question:
      "When creating a saved question to find systems with specific registry values, what is the most efficient approach for future reuse?",
    choices: [
      {
        id: "a",
        text: "Create separate saved questions for each registry key",
      },
      {
        id: "b",
        text: "Use parameterized sensors with flexible registry path variables",
      },
      {
        id: "c",
        text: "Hardcode all registry paths in a single complex question",
      },
      {
        id: "d",
        text: "Manually type the full question each time",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Parameterized sensors with registry path variables provide flexibility and reusability. This approach allows the same saved question structure to be used for different registry keys by changing parameters, improving efficiency and maintainability.",
    tags: ["saved-questions", "registry", "parameterization", "reusability"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/parameterized-sensors",
  },
  {
    id: "TCO-NB-0035",
    question:
      "In the Administration module, what is the correct sequence to configure a new user with Deploy module access?",
    choices: [
      {
        id: "a",
        text: "Create user account → Assign Deploy user role → Configure RBAC permissions → Test access",
      },
      {
        id: "b",
        text: "Configure RBAC permissions → Create user account → Test access → Assign roles",
      },
      {
        id: "c",
        text: "Assign Deploy user role → Create user account → Configure permissions → Validate setup",
      },
      {
        id: "d",
        text: "Test access → Create user account → Assign roles → Configure RBAC",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The proper sequence is to create the user account first, then assign the appropriate Deploy user role, configure any additional RBAC permissions needed, and finally test access to verify the configuration is working correctly.",
    tags: ["user-management", "deploy-module", "rbac", "administration"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/user-management-workflow",
  },
  {
    id: "TCO-RQ-0036",
    question:
      "What type of computer group membership automatically updates based on specified criteria?",
    choices: [
      {
        id: "a",
        text: "Static computer group",
      },
      {
        id: "b",
        text: "Dynamic computer group",
      },
      {
        id: "c",
        text: "Manual computer group",
      },
      {
        id: "d",
        text: "Imported computer group",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Dynamic computer groups automatically update their membership based on specified criteria such as operating system, IP range, or other endpoint attributes. Members are added or removed automatically as endpoint characteristics change.",
    tags: ["dynamic-groups", "computer-groups", "targeting", "automation"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/dynamic-groups",
  },
  {
    id: "TCO-TA-0031",
    question:
      "During a critical security patch deployment, an action shows 'Waiting for Approval' status despite having proper permissions. What is the most likely cause and resolution?",
    choices: [
      {
        id: "a",
        text: "The approval workflow is configured with multiple tiers requiring additional approvals",
      },
      {
        id: "b",
        text: "Network connectivity issues are preventing approval communication",
      },
      {
        id: "c",
        text: "The package is corrupted and needs to be re-uploaded",
      },
      {
        id: "d",
        text: "Target endpoints are offline and cannot receive the action",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Multi-tier approval workflows require approvals from different levels of authority before actions can proceed. Even with proper permissions, the action waits until all required approvals in the configured workflow are obtained.",
    tags: ["approval-workflow", "multi-tier", "deployment", "troubleshooting"],
    studyGuideRef: "tco-study-path/actions",
    officialRef: "deploy/approval-workflows",
  },
  {
    id: "TCO-RD-0027",
    question:
      "Which export format provides the most structured data for automated processing by external systems?",
    choices: [
      {
        id: "a",
        text: "CSV",
      },
      {
        id: "b",
        text: "PDF",
      },
      {
        id: "c",
        text: "JSON",
      },
      {
        id: "d",
        text: "TXT",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "JSON (JavaScript Object Notation) provides the most structured, machine-readable format for automated processing. It maintains data types, hierarchical relationships, and is easily parsed by most programming languages and external systems.",
    tags: ["json-export", "data-formats", "automation", "structured-data"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/export-formats",
  },
  {
    id: "TCO-AQ-0041",
    question:
      "What sensor provides information about installed software applications on Windows endpoints?",
    choices: [
      {
        id: "a",
        text: "Computer Name",
      },
      {
        id: "b",
        text: "IP Address",
      },
      {
        id: "c",
        text: "Installed Applications",
      },
      {
        id: "d",
        text: "Operating System",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The 'Installed Applications' sensor specifically provides information about software applications installed on Windows endpoints, including version numbers, installation dates, and publisher information.",
    tags: ["installed-applications", "sensor", "software-inventory", "windows"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/installed-applications-sensor",
  },
  {
    id: "TCO-NB-0036",
    question:
      "When navigating to the Deploy module to check action status, what information is displayed in the main Actions view?",
    choices: [
      {
        id: "a",
        text: "Only completed actions from the last 24 hours",
      },
      {
        id: "b",
        text: "Action name, status, progress, start time, and target count",
      },
      {
        id: "c",
        text: "Detailed logs for each individual endpoint",
      },
      {
        id: "d",
        text: "Only failed actions requiring attention",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Deploy module Actions view displays a comprehensive overview including action name, current status, progress percentage, start time, target endpoint count, and other key deployment metrics for all recent actions.",
    tags: ["deploy-module", "action-status", "console-navigation", "deployment"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "deploy/actions-overview",
  },
  {
    id: "TCO-RQ-0037",
    question:
      "To create a computer group that includes Windows servers but excludes domain controllers, what is the correct criteria combination?",
    choices: [
      {
        id: "a",
        text: 'Operating System contains "Windows" AND Computer Role contains "Server" AND Computer Role does not contain "Domain Controller"',
      },
      {
        id: "b",
        text: 'Operating System contains "Windows Server" NOT "Domain Controller"',
      },
      {
        id: "c",
        text: 'Computer Role equals "Server" OR Computer Role equals "Member Server"',
      },
      {
        id: "d",
        text: 'Operating System contains "Windows" AND NOT Computer Role contains "Domain Controller"',
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The correct syntax uses AND logic to combine multiple criteria and 'does not contain' for exclusions. This ensures the group includes Windows systems that are servers but specifically excludes domain controllers.",
    tags: ["computer-groups", "filtering", "windows-servers", "exclusion-logic"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/computer-group-criteria",
  },
  {
    id: "TCO-TA-0032",
    question: "What does a package action status of 'Running' indicate?",
    choices: [
      {
        id: "a",
        text: "The action is waiting for approval",
      },
      {
        id: "b",
        text: "The action is currently executing on target endpoints",
      },
      {
        id: "c",
        text: "The action completed successfully on all endpoints",
      },
      {
        id: "d",
        text: "The action failed and requires troubleshooting",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "'Running' status indicates that the action is actively executing on target endpoints. The package is being deployed and installed on the systems in the target group.",
    tags: ["action-status", "package-deployment", "running", "execution"],
    studyGuideRef: "tco-study-path/actions",
    officialRef: "deploy/action-status-definitions",
  },
  {
    id: "TCO-NB-0037",
    question:
      "When customizing the Tanium console dashboard, what is the most effective way to prioritize information display for operational efficiency?",
    choices: [
      {
        id: "a",
        text: "Display all available modules and data feeds simultaneously",
      },
      {
        id: "b",
        text: "Organize widgets based on task frequency and criticality of information",
      },
      {
        id: "c",
        text: "Use the default dashboard configuration without modifications",
      },
      {
        id: "d",
        text: "Show only the most recent activity across all modules",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Effective dashboard customization involves organizing widgets based on how frequently tasks are performed and the criticality of information needed for operations. This approach optimizes workflow efficiency and reduces time spent navigating to find essential information.",
    tags: ["dashboard-customization", "workflow-optimization", "console-navigation", "efficiency"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/dashboard-customization",
  },
  {
    id: "TCO-AQ-0042",
    question:
      "When constructing a question with multiple sensors using AND operator, the results display shows unexpected grouping. What factors determine how Question Results page organizes multi-sensor data?",
    choices: [
      {
        id: "a",
        text: "Results are grouped alphabetically by sensor name",
      },
      {
        id: "b",
        text: "Results are grouped by the first sensor, then by subsequent sensors in sequence",
      },
      {
        id: "c",
        text: "Results are grouped by data type and then by collection timestamp",
      },
      {
        id: "d",
        text: "Results are grouped randomly to prevent performance issues",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "When using multiple sensors with AND operator, the Question Results page groups results by the first sensor specified, then by the next sensor, and so on in sequence. This hierarchical grouping helps organize complex multi-sensor query results logically.",
    tags: ["multi-sensor", "question-results", "grouping", "and-operator"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/multi-sensor-questions",
  },
  {
    id: "TCO-RQ-0038",
    question:
      "To create a computer group for patch management that includes workstations but excludes servers and domain controllers, what is the optimal filtering approach?",
    choices: [
      {
        id: "a",
        text: 'Operating System contains "Windows" AND Computer Role does not contain "Server" AND Computer Role does not contain "Domain Controller"',
      },
      {
        id: "b",
        text: 'Computer Role equals "Workstation" OR Computer Role equals "Client"',
      },
      {
        id: "c",
        text: 'Operating System contains "Windows" NOT "Server"',
      },
      {
        id: "d",
        text: "Use separate groups for each workstation type and combine manually",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Using multiple exclusions with AND logic provides the most precise filtering. This approach ensures the group captures Windows workstations while explicitly excluding both servers and domain controllers, preventing accidental inclusion of systems that shouldn't receive workstation-specific patches.",
    tags: ["computer-groups", "exclusion-filtering", "patch-management", "workstations"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/computer-group-exclusion-logic",
  },
  {
    id: "TCO-RD-0028",
    question:
      "When setting up automated XML export for compliance reporting, what validation should be performed before scheduling the export?",
    choices: [
      {
        id: "a",
        text: "Test XML schema validation, verify data completeness, confirm field mappings",
      },
      {
        id: "b",
        text: "Check only that the file exports without errors",
      },
      {
        id: "c",
        text: "Verify the export runs within the specified time window",
      },
      {
        id: "d",
        text: "Ensure the file size meets minimum requirements",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Comprehensive XML export validation includes schema validation to ensure proper structure, data completeness verification to confirm all required fields are populated, and field mapping confirmation to ensure data aligns with compliance requirements.",
    tags: ["xml-export", "schema-validation", "compliance-reporting", "data-validation"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/xml-export-validation",
  },
  {
    id: "TCO-TA-0033",
    question:
      "When deploying a package to a large endpoint group, what is the recommended approach to monitor deployment progress effectively?",
    choices: [
      {
        id: "a",
        text: "Wait for completion notification and check final results only",
      },
      {
        id: "b",
        text: "Monitor real-time progress, check error logs, verify sample endpoint status",
      },
      {
        id: "c",
        text: "Check deployment status once every hour until completion",
      },
      {
        id: "d",
        text: "Monitor only if deployment takes longer than expected",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Effective deployment monitoring includes real-time progress tracking to identify issues early, error log review to understand any failures, and sample endpoint verification to confirm successful installation before full completion.",
    tags: ["deployment-monitoring", "progress-tracking", "error-logs", "endpoint-verification"],
    studyGuideRef: "tco-study-path/actions",
    officialRef: "deploy/deployment-monitoring",
  },
  {
    id: "TCO-NB-0038",
    question:
      "Which console module provides centralized management of user accounts, roles, and permissions?",
    choices: [
      {
        id: "a",
        text: "Interact",
      },
      {
        id: "b",
        text: "Deploy",
      },
      {
        id: "c",
        text: "Asset",
      },
      {
        id: "d",
        text: "Administration",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Administration module is the centralized location for managing user accounts, role assignments, permission configuration, and other system-wide administrative tasks in the Tanium console.",
    tags: ["administration-module", "user-management", "roles", "permissions"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/administration-module",
  },
  {
    id: "TCO-AQ-0043",
    question:
      "When using parameterized sensors in saved questions, what is the best practice for parameter specification to ensure consistent results?",
    choices: [
      {
        id: "a",
        text: "Use default parameter values for all saved questions",
      },
      {
        id: "b",
        text: "Document parameter requirements and provide example values in question description",
      },
      {
        id: "c",
        text: "Avoid parameterized sensors in saved questions",
      },
      {
        id: "d",
        text: "Always use the most common parameter value",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Best practice for parameterized sensors includes documenting parameter requirements and providing example values in the question description. This ensures users understand what parameters are needed and can provide appropriate values for consistent, accurate results.",
    tags: ["parameterized-sensors", "saved-questions", "documentation", "best-practices"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/parameterized-sensor-best-practices",
  },
  {
    id: "TCO-RQ-0039",
    question:
      "What is the primary advantage of static computer groups over dynamic computer groups?",
    choices: [
      {
        id: "a",
        text: "Static groups automatically update membership",
      },
      {
        id: "b",
        text: "Static groups provide predictable, controlled membership that doesn't change automatically",
      },
      {
        id: "c",
        text: "Static groups require less administrative overhead",
      },
      {
        id: "d",
        text: "Static groups support more complex filtering criteria",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The primary advantage of static computer groups is predictable, controlled membership that doesn't change automatically. This is important for scenarios where consistent group membership is required, such as specific deployment testing or compliance requirements.",
    tags: ["static-groups", "computer-groups", "membership-control", "predictability"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/static-vs-dynamic-groups",
  },
  {
    id: "TCO-RD-0029",
    question:
      "A scheduled CSV export for asset reporting shows incomplete data compared to manual exports. What systematic approach best identifies and resolves this discrepancy?",
    choices: [
      {
        id: "a",
        text: "Compare export timestamps, verify scheduling service status, validate data source availability",
      },
      {
        id: "b",
        text: "Increase the export frequency to capture more data",
      },
      {
        id: "c",
        text: "Switch to manual exports exclusively",
      },
      {
        id: "d",
        text: "Reduce the data scope to improve reliability",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Systematic troubleshooting involves comparing export timestamps to identify timing issues, verifying the scheduling service is running properly, and validating that data sources are available when automated exports run. This approach identifies root causes of incomplete data.",
    tags: ["scheduled-exports", "troubleshooting", "data-completeness", "automation"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/scheduled-export-troubleshooting",
  },
  {
    id: "TCO-NB-0039",
    question:
      "When navigating between modules in the Tanium console, what is the most efficient workflow for checking deployment status, reviewing asset inventory, and creating new questions?",
    choices: [
      {
        id: "a",
        text: "Open separate browser tabs for each module",
      },
      {
        id: "b",
        text: "Use Deploy → Asset → Interact navigation sequence with bookmark shortcuts",
      },
      {
        id: "c",
        text: "Check all information from the main dashboard without module navigation",
      },
      {
        id: "d",
        text: "Use only keyboard shortcuts to switch between modules",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The efficient workflow uses logical navigation sequence (Deploy for deployment status, Asset for inventory review, Interact for question creation) combined with bookmark shortcuts for frequently accessed functions within each module.",
    tags: ["console-navigation", "workflow-efficiency", "module-navigation", "productivity"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/efficient-navigation-workflows",
  },
  {
    id: "TCO-AQ-0044",
    question:
      "In Tanium natural language queries, which operator is used to combine multiple filtering criteria?",
    choices: [
      {
        id: "a",
        text: "OR",
      },
      {
        id: "b",
        text: "AND",
      },
      {
        id: "c",
        text: "NOT",
      },
      {
        id: "d",
        text: "WITH",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The AND operator is used in Tanium natural language queries to combine multiple filtering criteria. For example, 'Get Computer Name from machines with Operating System contains Windows AND Last Seen within 1 day'.",
    tags: ["natural-language", "and-operator", "filtering", "query-syntax"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/natural-language-operators",
  },
  {
    id: "TCO-RQ-0040",
    question:
      "A computer group with criteria 'IP Address starts with 192.168.1 AND Operating System contains Windows' returns fewer members than expected. What investigation approach identifies potential issues?",
    choices: [
      {
        id: "a",
        text: "Check network connectivity, verify IP address sensor accuracy, validate OS detection",
      },
      {
        id: "b",
        text: "Simplify criteria to use only IP address filtering",
      },
      {
        id: "c",
        text: "Recreate the group with different criteria",
      },
      {
        id: "d",
        text: "Switch to static group management",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Comprehensive investigation includes checking network connectivity (affects IP reporting), verifying IP address sensor accuracy (ensures correct IP detection), and validating OS detection (confirms Windows identification). This systematic approach identifies why expected endpoints aren't being captured.",
    tags: ["computer-groups", "ip-addressing", "troubleshooting", "sensor-validation"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/computer-group-troubleshooting-advanced",
  },
  {
    id: "TCO-TA-0034",
    question: "What information is typically required when configuring a package for deployment?",
    choices: [
      {
        id: "a",
        text: "Only the package file location",
      },
      {
        id: "b",
        text: "Package file, target group, deployment schedule, and success criteria",
      },
      {
        id: "c",
        text: "Package file and administrator approval only",
      },
      {
        id: "d",
        text: "Target group and execution timeout only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Package deployment configuration requires the package file location, target computer group specification, deployment schedule (immediate or scheduled), and success criteria definition to determine when deployment is considered complete.",
    tags: ["package-deployment", "configuration", "target-groups", "deployment-schedule"],
    studyGuideRef: "tco-study-path/actions",
    officialRef: "deploy/package-configuration",
  },
  {
    id: "TCO-RD-0030",
    question:
      "For regulatory compliance reporting, what approach ensures exported data maintains integrity and auditability?",
    choices: [
      {
        id: "a",
        text: "Export data multiple times to verify consistency",
      },
      {
        id: "b",
        text: "Use digital signatures, timestamps, and maintain export audit logs",
      },
      {
        id: "c",
        text: "Save exports in multiple file formats simultaneously",
      },
      {
        id: "d",
        text: "Encrypt all export files regardless of content sensitivity",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Regulatory compliance requires digital signatures for data integrity verification, timestamps for audit trail establishment, and comprehensive export audit logs to track when, what, and by whom data was exported.",
    tags: ["compliance-reporting", "data-integrity", "audit-trails", "digital-signatures"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/compliance-export-requirements",
  },
  {
    id: "TCO-NB-0040",
    question:
      "When console performance degrades during peak usage, what systematic approach best identifies and resolves the bottlenecks?",
    choices: [
      {
        id: "a",
        text: "Restart all Tanium services immediately",
      },
      {
        id: "b",
        text: "Analyze client connections, server resource utilization, and database performance metrics",
      },
      {
        id: "c",
        text: "Reduce the number of active users accessing the console",
      },
      {
        id: "d",
        text: "Switch to a different browser or clear browser cache",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Systematic performance analysis involves examining client connections for network issues, server resource utilization for capacity problems, and database performance metrics for query bottlenecks. This comprehensive approach identifies the root cause of performance degradation.",
    tags: [
      "performance-troubleshooting",
      "console-optimization",
      "bottleneck-analysis",
      "system-monitoring",
    ],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/performance-troubleshooting",
  },
  {
    id: "TCO-RD-0031",
    question: "What is the primary purpose of the Asset module in Tanium?",
    choices: [
      {
        id: "a",
        text: "Deploy packages to endpoints",
      },
      {
        id: "b",
        text: "Create and execute natural language questions",
      },
      {
        id: "c",
        text: "Generate comprehensive endpoint inventory and reports",
      },
      {
        id: "d",
        text: "Manage user accounts and permissions",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Asset module is specifically designed to generate comprehensive endpoint inventory and reports, providing detailed information about hardware, software, configurations, and compliance status across all managed endpoints.",
    tags: ["asset-module", "inventory", "endpoint-reporting", "module-purpose"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/module-overview",
  },
  {
    id: "TCO-AQ-0045",
    question:
      "When creating a question to identify endpoints with a specific service running, what is the most efficient sensor selection approach?",
    choices: [
      {
        id: "a",
        text: "Use 'Installed Applications' sensor to find service executables",
      },
      {
        id: "b",
        text: "Use 'Running Services' sensor with service name filtering",
      },
      {
        id: "c",
        text: "Use 'Process List' sensor and filter by executable name",
      },
      {
        id: "d",
        text: "Create a custom sensor for service detection",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The 'Running Services' sensor is specifically designed to detect active services and supports filtering by service name. This is the most direct and efficient approach for identifying endpoints with specific services running.",
    tags: ["running-services", "sensor-selection", "service-detection", "efficiency"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/running-services-sensor",
  },
  {
    id: "TCO-RQ-0041",
    question:
      "To create a computer group for emergency patching that targets critical servers while excluding development systems, what criteria combination provides the most precise targeting?",
    choices: [
      {
        id: "a",
        text: "Computer Role contains 'Server' AND Environment does not contain 'Development' AND Priority contains 'Critical'",
      },
      {
        id: "b",
        text: "Operating System contains 'Server' NOT 'Development'",
      },
      {
        id: "c",
        text: "Computer Role equals 'Production Server'",
      },
      {
        id: "d",
        text: "Use manual endpoint selection for critical deployments",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Using multiple AND conditions with exclusion logic provides precise targeting. This approach captures servers, excludes development environments, and includes only critical priority systems, ensuring emergency patches reach the right endpoints while avoiding test systems.",
    tags: ["emergency-patching", "critical-servers", "targeting-precision", "exclusion-logic"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/emergency-targeting-criteria",
  },
  {
    id: "TCO-NB-0041",
    question:
      "In which console module would you configure content sets and role-based access control (RBAC) permissions?",
    choices: [
      {
        id: "a",
        text: "Interact",
      },
      {
        id: "b",
        text: "Deploy",
      },
      {
        id: "c",
        text: "Asset",
      },
      {
        id: "d",
        text: "Administration",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Administration module is where RBAC configuration occurs, including content sets, role assignments, and permissions management. This module provides centralized security and access control configuration.",
    tags: ["administration-module", "rbac", "content-sets", "permissions"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/rbac-configuration",
  },
  {
    id: "TCO-RD-0032",
    question:
      "Automated PDF report generation fails intermittently with memory errors. What investigation approach best identifies the underlying cause?",
    choices: [
      {
        id: "a",
        text: "Analyze report size, server memory usage, concurrent report generation, and processing timeouts",
      },
      {
        id: "b",
        text: "Reduce report frequency to avoid resource conflicts",
      },
      {
        id: "c",
        text: "Switch all reports to CSV format to reduce memory usage",
      },
      {
        id: "d",
        text: "Restart the reporting service daily to clear memory",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Systematic investigation involves analyzing report size (large reports consume more memory), server memory usage patterns, concurrent report generation conflicts, and processing timeouts. This comprehensive approach identifies whether the issue is related to resource constraints, timing conflicts, or processing limits.",
    tags: ["pdf-reports", "memory-errors", "troubleshooting", "resource-analysis"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/pdf-report-troubleshooting",
  },
  {
    id: "TCO-AQ-0046",
    question: "What does the 'Last Seen' sensor indicate about an endpoint?",
    choices: [
      {
        id: "a",
        text: "When the endpoint was last manually accessed by an administrator",
      },
      {
        id: "b",
        text: "When the endpoint last communicated with the Tanium server",
      },
      {
        id: "c",
        text: "When the endpoint was last restarted",
      },
      {
        id: "d",
        text: "When the endpoint last received a software update",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The 'Last Seen' sensor indicates when an endpoint last communicated with the Tanium server. This is crucial for determining endpoint connectivity and availability for questions and actions.",
    tags: ["last-seen", "sensor", "endpoint-communication", "connectivity"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/last-seen-sensor",
  },
  {
    id: "TCO-RQ-0042",
    question:
      "What filtering operator is used to exclude specific values in computer group criteria?",
    choices: [
      {
        id: "a",
        text: "NOT EQUALS",
      },
      {
        id: "b",
        text: "does not contain",
      },
      {
        id: "c",
        text: "EXCLUDE",
      },
      {
        id: "d",
        text: "MINUS",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "'does not contain' is the filtering operator used in computer group criteria to exclude endpoints that match specific values. For example, 'Operating System does not contain Server' excludes all server operating systems.",
    tags: ["filtering-operators", "exclusion", "computer-groups", "does-not-contain"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/filtering-operators",
  },
  {
    id: "TCO-NB-0042",
    question:
      "When managing multiple Tanium environments (development, staging, production), what navigation best practice ensures actions are performed in the correct environment?",
    choices: [
      {
        id: "a",
        text: "Use the same browser for all environments with different tabs",
      },
      {
        id: "b",
        text: "Use environment-specific URLs with clear visual indicators and confirmation prompts",
      },
      {
        id: "c",
        text: "Rely on muscle memory to distinguish between environments",
      },
      {
        id: "d",
        text: "Access all environments from the same bookmark",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Best practice involves using environment-specific URLs with clear visual indicators (different colors, headers) and confirmation prompts for critical actions. This prevents accidental actions in the wrong environment, especially important for production systems.",
    tags: ["multi-environment", "navigation-safety", "environment-indicators", "best-practices"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/multi-environment-management",
  },
  {
    id: "TCO-RD-0033",
    question:
      "When configuring automated data export to external SIEM systems, what approach ensures reliable data delivery and error handling?",
    choices: [
      {
        id: "a",
        text: "Send exports immediately when generated without validation",
      },
      {
        id: "b",
        text: "Implement retry logic, delivery confirmation, and failure alerting",
      },
      {
        id: "c",
        text: "Export only during off-peak hours to avoid conflicts",
      },
      {
        id: "d",
        text: "Use email delivery for all automated exports",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Reliable external SIEM integration requires retry logic for failed deliveries, delivery confirmation to verify receipt, and failure alerting to notify administrators of export problems. This ensures critical security data reaches monitoring systems consistently.",
    tags: ["siem-integration", "automated-export", "retry-logic", "delivery-confirmation"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/siem-integration-best-practices",
  },
  {
    id: "TCO-NB-0043",
    question:
      "During a security incident response, the console interface becomes slow and unresponsive. What systematic approach prioritizes critical access while maintaining investigation capabilities?",
    choices: [
      {
        id: "a",
        text: "Enable emergency access mode, prioritize essential users, implement temporary resource limits",
      },
      {
        id: "b",
        text: "Immediately restart all Tanium services to clear the issues",
      },
      {
        id: "c",
        text: "Switch to command-line tools exclusively during the incident",
      },
      {
        id: "d",
        text: "Wait for normal performance to resume before continuing investigation",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Incident response requires enabling emergency access mode for streamlined interface, prioritizing essential users (security team, incident responders), and implementing temporary resource limits to maintain system stability while preserving investigation capabilities.",
    tags: [
      "incident-response",
      "emergency-access",
      "console-performance",
      "resource-prioritization",
    ],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/emergency-response-procedures",
  },
  {
    id: "TCO-RQ-0043",
    question:
      "A computer group designed for quarterly compliance scanning shows membership fluctuations that affect audit consistency. What approach provides stable membership while maintaining accuracy?",
    choices: [
      {
        id: "a",
        text: "Convert to static group and manually update quarterly",
      },
      {
        id: "b",
        text: "Use snapshot-based dynamic groups with quarterly membership captures",
      },
      {
        id: "c",
        text: "Create separate groups for each compliance period",
      },
      {
        id: "d",
        text: "Disable automatic membership updates during audit periods",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Snapshot-based dynamic groups capture membership at specific points in time (quarterly) while maintaining the benefits of dynamic criteria. This provides stable membership during compliance periods while ensuring accuracy through periodic updates based on current endpoint states.",
    tags: ["compliance-scanning", "group-stability", "snapshot-groups", "audit-consistency"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/snapshot-dynamic-groups",
  },
  {
    id: "TCO-NB-0044",
    question:
      "When training new Tanium operators, what navigation workflow best demonstrates the relationship between modules and their primary functions?",
    choices: [
      {
        id: "a",
        text: "Start with Administration for user setup, then Interact for questions, Deploy for actions, Asset for reporting",
      },
      {
        id: "b",
        text: "Focus on one module until mastery before introducing others",
      },
      {
        id: "c",
        text: "Begin with the most complex module to establish baseline knowledge",
      },
      {
        id: "d",
        text: "Use only keyboard shortcuts to demonstrate efficiency",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The logical training sequence starts with Administration (foundational setup), Interact (data collection), Deploy (action execution), and Asset (reporting), demonstrating how modules work together in typical operational workflows while building knowledge progressively.",
    tags: ["operator-training", "module-relationships", "workflow-sequence", "knowledge-building"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/training-workflows",
  },
  {
    id: "TCO-RQ-0044",
    question:
      "For vulnerability management, what computer group strategy best balances comprehensive coverage with management efficiency?",
    choices: [
      {
        id: "a",
        text: "Create one group for all endpoints and apply universal vulnerability scanning",
      },
      {
        id: "b",
        text: "Use role-based dynamic groups with vulnerability-specific criteria and priority levels",
      },
      {
        id: "c",
        text: "Create separate static groups for each individual vulnerability",
      },
      {
        id: "d",
        text: "Manually assign endpoints to vulnerability groups based on risk assessment",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Role-based dynamic groups with vulnerability-specific criteria provide comprehensive coverage while maintaining management efficiency. Priority levels ensure critical systems receive appropriate attention, and dynamic membership adapts to changing endpoint roles and vulnerability status.",
    tags: ["vulnerability-management", "group-strategy", "role-based-groups", "priority-levels"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/vulnerability-group-strategy",
  },
  {
    id: "TCO-NB-0045",
    question: "What is the primary function of the Interact module in Tanium?",
    choices: [
      {
        id: "a",
        text: "Deploy packages and software to endpoints",
      },
      {
        id: "b",
        text: "Create questions and collect data from endpoints using natural language queries",
      },
      {
        id: "c",
        text: "Generate comprehensive asset and compliance reports",
      },
      {
        id: "d",
        text: "Manage user accounts and system configuration",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_MODULES,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Interact module's primary function is to create questions and collect data from endpoints using natural language queries. It serves as the main interface for real-time data collection and endpoint interrogation.",
    tags: ["interact-module", "natural-language", "data-collection", "module-function"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "interact/module-overview",
  },
  {
    id: "TCO-RQ-0045",
    question:
      "What is the maximum number of criteria that can be combined in a single computer group definition?",
    choices: [
      {
        id: "a",
        text: "5",
      },
      {
        id: "b",
        text: "10",
      },
      {
        id: "c",
        text: "20",
      },
      {
        id: "d",
        text: "No specific limit, depends on system performance",
      },
    ],
    correctAnswerId: "d",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "There is no specific limit to the number of criteria in a computer group definition. The practical limit depends on system performance and query complexity, but the platform supports multiple complex criteria combinations for precise endpoint targeting.",
    tags: ["computer-groups", "criteria-limits", "system-performance", "targeting-limits"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/computer-group-limits",
  },
];

export const importedQuestionBankMetadata = {
  totalQuestions: 200,
  importDate: "2025-08-30T19:17:01.151Z",
  source: "questions_master.json",
  domainDistribution: {
    "Asking Questions": 43,
    "Refining Questions & Targeting": 45,
    "Taking Action - Packages & Actions": 34,
    "Navigation & Basic Module Functions": 45,
    "Reporting & Data Export": 33,
  },
  difficultyDistribution: {
    [Difficulty.BEGINNER]: 65,
    [Difficulty.INTERMEDIATE]: 89,
    [Difficulty.ADVANCED]: 46,
  },
  categoryDistribution: {
    [QuestionCategory.PLATFORM_FUNDAMENTALS]: 1,
    [QuestionCategory.CONSOLE_PROCEDURES]: 34,
    [QuestionCategory.TROUBLESHOOTING]: 25,
    [QuestionCategory.PRACTICAL_SCENARIOS]: 140,
    [QuestionCategory.LINEAR_CHAIN]: 0,
  },
};

