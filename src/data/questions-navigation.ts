import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * Navigation & Basic Module Functions Questions
 * 45 questions for the Navigation & Basic Module Functions domain
 */

export const navigationQuestions: Question[] = [
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Module access in Tanium is controlled by user roles and permissions. If a user can access some modules but not others, it indicates a role permission issue rather than a technical problem. The user's role needs to be updated to include Deploy module access permissions.",
    tags: ["module-access", "permissions", "troubleshooting"],
    studyGuideRef: "tco-study-path/rbac",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Grayed out or missing menu options typically indicate insufficient permissions. The systematic approach is to review the user's role assignments and ensure they have appropriate permissions for the features they need to access. This is an RBAC configuration issue rather than a technical problem.",
    tags: ["interface-troubleshooting", "permissions", "menu-access"],
    studyGuideRef: "tco-study-path/rbac",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "The Tanium Console home page dashboard provides a system overview including client connectivity status, recent activities, key performance metrics, and system health indicators to give operators a quick view of overall system state.",
    tags: ["dashboard", "system-overview", "home-page"],
    officialRef: "university/tco-foundations",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Dashboard customization is typically accessed directly from the dashboard interface through customization controls, allowing users to add, remove, or rearrange widgets and information panels according to their role and preferences.",
    tags: ["dashboard-customization", "personalization", "user-interface"],
    officialRef: "university/tco-foundations",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "A systematic analysis using browser developer tools to examine network requests, JavaScript performance, and system resources provides the most comprehensive approach to identifying whether the issue is client-side, network-related, or server-side.",
    tags: ["performance-troubleshooting", "console-performance", "systematic-analysis"],
    studyGuideRef: "tco-study-path/troubleshooting",
    officialRef: "university/tco-foundations",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "Help documentation and user guides are typically accessed through the Help menu or Help icon (often a question mark symbol) which provides links to user guides, documentation, and support resources.",
    tags: ["help-documentation", "user-guides", "support-resources"],
    officialRef: "university/tco-foundations",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Global console performance optimization requires analyzing network latency and bandwidth between locations and the server, browser optimization techniques, and potentially implementing CDN or caching solutions to improve content delivery to remote locations.",
    tags: ["global-performance", "network-optimization", "console-access"],
    studyGuideRef: "tco-study-path/troubleshooting",
    officialRef: "university/tco-foundations",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Performance issues occurring only during business hours typically involve multiple factors: server resource utilization (CPU, memory), network bandwidth and concurrent users, database performance under load, and client-side rendering. A systematic analysis of all factors is needed to identify the bottleneck.",
    tags: ["performance-analysis", "peak-load", "multi-factor-troubleshooting"],
    studyGuideRef: "tco-study-path/troubleshooting",
    officialRef: "university/tco-foundations",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Using module tabs allows you to keep multiple modules (like Deploy for action monitoring, Asset for system status) open simultaneously and switch between them efficiently without losing context or having to reload interfaces.",
    tags: ["multi-module", "deployment-monitoring", "navigation-efficiency"],
    officialRef: "university/tco-foundations",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "Execution Success Rate is recommended over Minimum Endpoints for dynamic deployment plans. The randomness of targeting makes it difficult to predict endpoint counts, making success rate a more reliable progression criterion.",
    tags: ["deployment-plans", "progression-criteria", "success-rate", "dynamic-targeting"],
    studyGuideRef: "tco-study-path/deployment-progression",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Asset > Reports > Build is the correct navigation path for accessing report building functionality within the Asset module. This provides access to custom report creation tools and data source selection.",
    tags: ["navigation", "asset-module", "report-building", "interface"],
    studyGuideRef: "tco-study-path/asset-navigation",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Write - Tanium uses the most permissive effective permissions. When a user has conflicting permissions from different sources (groups vs. direct assignment), the system grants the highest level of access available from any source.",
    tags: ["rbac", "permission-inheritance", "effective-permissions", "conflict-resolution"],
    studyGuideRef: "tco-study-path/rbac-inheritance",
    officialRef: "platform/permissions-model",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Ring Deployment Status page provides visibility into ring-based (adaptive) deployment status and progress. This page shows deployment details, ring progression, and endpoint-level status for troubleshooting deployment issues.",
    tags: ["navigation", "ring-deployments", "status-monitoring", "console-interface"],
    studyGuideRef: "tco-study-path/deployment-navigation",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The report table with right-click context menu allows direct copying of report data to the clipboard. This provides quick access to copy selected data in CSV format for pasting into external applications.",
    tags: ["report-interface", "clipboard-copy", "right-click-menu", "data-access"],
    studyGuideRef: "tco-study-path/report-interface",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "The Administration module provides the primary interface for platform administration and system configuration. This module contains user management, global settings, and system-wide configuration options.",
    tags: ["administration-module", "platform-admin", "system-config", "module-functions"],
    studyGuideRef: "tco-study-path/module-overview",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Asset module is specifically designed for endpoint inventory management and generating comprehensive asset reports. It provides detailed information about hardware, software, and configuration data across managed endpoints.",
    tags: ["asset-module", "inventory", "console-navigation", "reporting"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/asset-module-overview",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "The proper sequence is to create the user account first, then assign the appropriate Deploy user role, configure any additional RBAC permissions needed, and finally test access to verify the configuration is working correctly.",
    tags: ["user-management", "deploy-module", "rbac", "administration"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/user-management-workflow",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The Deploy module Actions view displays a comprehensive overview including action name, current status, progress percentage, start time, target endpoint count, and other key deployment metrics for all recent actions.",
    tags: ["deploy-module", "action-status", "console-navigation", "deployment"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "deploy/actions-overview",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Effective dashboard customization involves organizing widgets based on how frequently tasks are performed and the criticality of information needed for operations. This approach optimizes workflow efficiency and reduces time spent navigating to find essential information.",
    tags: ["dashboard-customization", "workflow-optimization", "console-navigation", "efficiency"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/dashboard-customization",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "The Administration module is the centralized location for managing user accounts, role assignments, permission configuration, and other system-wide administrative tasks in the Tanium console.",
    tags: ["administration-module", "user-management", "roles", "permissions"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/administration-module",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The efficient workflow uses logical navigation sequence (Deploy for deployment status, Asset for inventory review, Interact for question creation) combined with bookmark shortcuts for frequently accessed functions within each module.",
    tags: ["console-navigation", "workflow-efficiency", "module-navigation", "productivity"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/efficient-navigation-workflows",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "The Administration module is where RBAC configuration occurs, including content sets, role assignments, and permissions management. This module provides centralized security and access control configuration.",
    tags: ["administration-module", "rbac", "content-sets", "permissions"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/rbac-configuration",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Best practice involves using environment-specific URLs with clear visual indicators (different colors, headers) and confirmation prompts for critical actions. This prevents accidental actions in the wrong environment, especially important for production systems.",
    tags: ["multi-environment", "navigation-safety", "environment-indicators", "best-practices"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/multi-environment-management",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The logical training sequence starts with Administration (foundational setup), Interact (data collection), Deploy (action execution), and Asset (reporting), demonstrating how modules work together in typical operational workflows while building knowledge progressively.",
    tags: ["operator-training", "module-relationships", "workflow-sequence", "knowledge-building"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/training-workflows",
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
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "The Interact module's primary function is to create questions and collect data from endpoints using natural language queries. It serves as the main interface for real-time data collection and endpoint interrogation.",
    tags: ["interact-module", "natural-language", "data-collection", "module-function"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "interact/module-overview",
  },
  {
    id: "TCO-NB-0046",
    question:
      "When configuring console timeout settings for security compliance, what approach balances user productivity with security requirements?",
    choices: [
      {
        id: "a",
        text: "Set very short timeouts (5 minutes) to maximize security",
      },
      {
        id: "b",
        text: "Configure role-based timeout policies with longer timeouts for active operations",
      },
      {
        id: "c",
        text: "Disable timeouts completely to avoid disrupting workflows",
      },
      {
        id: "d",
        text: "Use the same timeout settings for all users regardless of role",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Role-based timeout policies allow shorter timeouts for high-privilege users while providing longer timeouts during active operations. This approach maintains security compliance while minimizing disruption to legitimate workflows and critical tasks.",
    tags: [
      "security-compliance",
      "timeout-configuration",
      "role-based-policies",
      "user-productivity",
    ],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/timeout-configuration",
  },
  {
    id: "TCO-NB-0047",
    question:
      "What is the most effective method to navigate between different Tanium sites when managing a multi-site deployment from a single console?",
    choices: [
      {
        id: "a",
        text: "Open separate browser windows for each site",
      },
      {
        id: "b",
        text: "Use the site selector dropdown with visual site indicators and context switching",
      },
      {
        id: "c",
        text: "Log in and out of each site separately",
      },
      {
        id: "d",
        text: "Use different user accounts for each site",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "The site selector dropdown provides the most effective navigation method, offering visual site indicators, seamless context switching, and maintaining session state. This approach is designed specifically for multi-site management efficiency.",
    tags: ["multi-site-management", "site-selector", "context-switching", "navigation-efficiency"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/multi-site-navigation",
  },
  {
    id: "TCO-NB-0048",
    question:
      "When customizing module permissions for a security analyst role, what combination provides appropriate access without excessive privileges?",
    choices: [
      {
        id: "a",
        text: "Full administrative access to all modules",
      },
      {
        id: "b",
        text: "Read access to Interact and Asset, limited deployment permissions, no user management",
      },
      {
        id: "c",
        text: "Access only to the Asset module for report generation",
      },
      {
        id: "d",
        text: "Deployment permissions only for security-related packages",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Security analysts need read access to Interact and Asset for investigation and reporting, limited deployment permissions for security response actions, but should not have user management capabilities. This follows the principle of least privilege while enabling security functions.",
    tags: ["security-analyst", "least-privilege", "role-permissions", "access-control"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/security-role-permissions",
  },
  {
    id: "TCO-NB-0049",
    question:
      "During console maintenance windows, what preparation steps ensure minimal disruption to ongoing operations?",
    choices: [
      {
        id: "a",
        text: "Perform maintenance immediately without user notification",
      },
      {
        id: "b",
        text: "Notify users, complete active deployments, enable maintenance mode, document changes",
      },
      {
        id: "c",
        text: "Schedule maintenance only during business hours for immediate support",
      },
      {
        id: "d",
        text: "Disable all user access permanently during any maintenance",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Proper maintenance preparation involves user notification for planning, allowing active deployments to complete to prevent failures, enabling maintenance mode for graceful degradation, and documenting changes for troubleshooting and rollback purposes.",
    tags: [
      "maintenance-windows",
      "change-management",
      "operational-continuity",
      "user-communication",
    ],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/maintenance-procedures",
  },
  {
    id: "TCO-NB-0050",
    question:
      "When implementing console access monitoring for compliance purposes, what logging approach provides comprehensive audit trails without impacting performance?",
    choices: [
      {
        id: "a",
        text: "Log every mouse click and keyboard input for complete tracking",
      },
      {
        id: "b",
        text: "Log authentication events, module access, critical actions, and data exports with timestamp correlation",
      },
      {
        id: "c",
        text: "Log only failed access attempts to minimize storage requirements",
      },
      {
        id: "d",
        text: "Record screen capture videos of all console sessions",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.NAVIGATION_BASIC_MODULE_FUNCTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.CONSOLE_PROCEDURES,
    explanation:
      "Effective compliance logging focuses on authentication events, module access patterns, critical actions (deployments, configuration changes), and data exports with timestamp correlation. This provides comprehensive audit trails while maintaining system performance and avoiding excessive data storage.",
    tags: ["compliance-logging", "audit-trails", "access-monitoring", "performance-optimization"],
    studyGuideRef: "tco-study-path/navigation",
    officialRef: "console/compliance-logging",
  },
];

export const navigationQuestionMetadata = {
  domain: TCODomain.NB,
  totalQuestions: 50,
  difficultyBreakdown: {
    beginner: 18,
    intermediate: 23,
    advanced: 9,
  },
};
