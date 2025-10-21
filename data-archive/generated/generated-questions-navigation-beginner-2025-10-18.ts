import { Difficulty, type Question, QuestionCategory, TCODomain } from '@/types/exam';

/**
 * AI-Generated Questions
 *
 * Domain: navigation
 * Difficulty: beginner
 * Count: 40
 * Generated: 2025-10-18T20:49:35.733Z
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedQuestions: Question[] = [
  {
    question:
      "You're setting up a dashboard for a new security analyst who needs to monitor endpoint compliance and security posture regularly. Which Tanium module allows you to create and customize this dashboard?",
    choices: [
      {
        id: 'a',
        text: 'Deploy module for action management',
      },
      {
        id: 'b',
        text: 'Trends module for visualizing data over time',
      },
      {
        id: 'c',
        text: 'Interact module for real-time data querying',
      },
      {
        id: 'd',
        text: 'Connect module for external data sharing',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Trends module is correct because it offers capabilities for visualizing and monitoring data over time, which is ideal for creating dashboards related to endpoint compliance and security posture. Choice A (Deploy) is incorrect because it's used for managing and distributing software or patches, not for monitoring or visualization. Choice C (Interact) is incorrect because, although it queries real-time data, it does not focus on dashboard customization. Choice D (Connect) is incorrect because it's used for exporting data to external systems, not for dashboard creation.",
    tags: ['trends-module', 'dashboard-customization', 'data-visualization', 'security-posture'],
    id: 'NAVIGA-GEN-1760810876510-1',
  },
  {
    question:
      'Your team needs to export detailed endpoint hardware and software data to a centralized IT asset management system every day. Which Tanium module is best suited for automating this data export?',
    choices: [
      {
        id: 'a',
        text: 'Connect module for data integration',
      },
      {
        id: 'b',
        text: 'Trends module for historical analysis',
      },
      {
        id: 'c',
        text: 'Deploy module for software distribution',
      },
      {
        id: 'd',
        text: 'Interact module for querying endpoints',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'Connect module is correct because it enables automated data export to external systems, making it suitable for integration with an IT asset management system. Choice B (Trends) is incorrect because it specializes in visualizing and monitoring data over time, not exporting it. Choice C (Deploy) is incorrect because it is used for managing and executing software or patch distribution across endpoints. Choice D (Interact) is incorrect because it is primarily for real-time data querying, not automated data export.',
    tags: ['connect-module', 'data-export', 'it-asset-management', 'automation'],
    id: 'NAVIGA-GEN-1760810876510-2',
  },
  {
    question:
      'A compliance officer requires a monthly report on the patch status of all endpoints across the organization. Which Tanium module should you use to automate the generation and delivery of this report?',
    choices: [
      {
        id: 'a',
        text: 'Deploy module for executing patch actions',
      },
      {
        id: 'b',
        text: 'Reporting module for scheduled report creation',
      },
      {
        id: 'c',
        text: 'Connect module for external data sharing',
      },
      {
        id: 'd',
        text: 'Trends module for data visualization',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Reporting module is correct because it offers functionality for creating, scheduling, and delivering customized reports, which is ideal for compliance reporting needs. Choice A (Deploy) is incorrect because it focuses on executing actions, such as patch distribution, rather than reporting. Choice C (Connect) is incorrect because it's used for exporting data to external systems, not for creating scheduled reports. Choice D (Trends) is incorrect because it's more focused on visualizing data over time within the console, not on generating scheduled reports.",
    tags: ['reporting-module', 'scheduled-reports', 'compliance-reporting', 'patch-status'],
    id: 'NAVIGA-GEN-1760810876510-3',
  },
  {
    question:
      'Your organization is implementing a new policy requiring all endpoints to have the latest antivirus definitions. You need to verify compliance across 10,000 endpoints. Which Tanium module would you use to perform this check?',
    choices: [
      {
        id: 'a',
        text: 'Asset module for inventory management',
      },
      {
        id: 'b',
        text: 'Interact module for real-time querying',
      },
      {
        id: 'c',
        text: 'Deploy module for distributing antivirus updates',
      },
      {
        id: 'd',
        text: 'Connect module for exporting compliance data',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'Interact module is correct because it enables real-time querying of endpoint data, including antivirus definition status, across the entire network. Choice A (Asset) is incorrect because it primarily manages inventory data, which may not provide the real-time compliance status required. Choice C (Deploy) is incorrect because it is used for distributing software or updates, not for querying compliance status. Choice D (Connect) is incorrect because it focuses on exporting data, not on performing real-time compliance checks.',
    tags: ['interact-module', 'real-time-querying', 'antivirus-compliance', 'endpoint-management'],
    id: 'NAVIGA-GEN-1760810876510-4',
  },
  {
    question:
      'You have been asked to ensure that all users can only access modules relevant to their roles. What is the first step in configuring module access control within the Tanium Console?',
    choices: [
      {
        id: 'a',
        text: 'Customize dashboard settings for each user',
      },
      {
        id: 'b',
        text: 'Assign users to roles with specific module permissions',
      },
      {
        id: 'c',
        text: 'Configure the Connect module for role-based data export',
      },
      {
        id: 'd',
        text: 'Update the Trends module to restrict data visualization',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Assigning users to roles with specific module permissions is correct because Tanium uses role-based access control (RBAC) to manage module access, ensuring users can only use modules relevant to their responsibilities. Choice A (Customize dashboard settings for each user) is incorrect because dashboard customization affects the user interface but does not restrict module access. Choice C (Configure the Connect module for role-based data export) is incorrect because this module's configuration is for data export, not access control. Choice D (Update the Trends module to restrict data visualization) is incorrect because restricting access in Trends does not control overall module access.",
    tags: ['module-permissions', 'role-based-access-control', 'rbac', 'user-management'],
    id: 'NAVIGA-GEN-1760810876510-5',
  },
  {
    question:
      'Your organization requires a daily export of endpoint security logs to a third-party analytics platform for advanced analysis. Which Tanium module should be configured to automate this process?',
    choices: [
      {
        id: 'a',
        text: 'Reporting module for creating security reports',
      },
      {
        id: 'b',
        text: 'Connect module for data integration and export',
      },
      {
        id: 'c',
        text: 'Trends module for tracking security log trends',
      },
      {
        id: 'd',
        text: 'Deploy module for distributing security tools',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "The Connect module is correct because it specializes in integrating Tanium data with external systems, allowing for automated data exports like security logs to analytics platforms. Choice A (Reporting) is incorrect because it's focused on internal report generation, not external data export. Choice C (Trends) is incorrect because it visualizes and tracks data trends within Tanium, not for exporting. Choice D (Deploy) is incorrect because it's used for distributing software or scripts, not for data export.",
    tags: ['connect-module', 'data-export', 'security-logs', 'third-party-integration'],
    id: 'NAVIGA-GEN-1760810876510-6',
  },
  {
    question:
      'After a recent security breach, your CISO wants to enhance the visibility of real-time endpoint data across the network to detect threats faster. Which Tanium module will provide the necessary capabilities to meet this requirement?',
    choices: [
      {
        id: 'a',
        text: 'Asset module for endpoint inventory management',
      },
      {
        id: 'b',
        text: 'Interact module for real-time data querying',
      },
      {
        id: 'c',
        text: 'Trends module for visualizing endpoint data trends',
      },
      {
        id: 'd',
        text: 'Reporting module for generating security reports',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'Interact module is correct because it provides the capability to ask questions and receive real-time data from endpoints across the network, which is essential for rapid threat detection. Choice A (Asset) is incorrect because, while it manages endpoint inventory, it does not focus on real-time data collection. Choice C (Trends) is incorrect because it visualizes data over time rather than providing real-time analysis. Choice D (Reporting) is incorrect because it generates reports based on historical data, not real-time monitoring.',
    tags: ['interact-module', 'real-time-data', 'threat-detection', 'endpoint-visibility'],
    id: 'NAVIGA-GEN-1760810876510-7',
  },
  {
    question:
      'In preparation for an upcoming audit, your team needs to demonstrate the ability to quickly identify and report on non-compliant endpoints within the network. Which Tanium module will best facilitate this task?',
    choices: [
      {
        id: 'a',
        text: 'Deploy module for compliance enforcement',
      },
      {
        id: 'b',
        text: 'Reporting module for generating compliance reports',
      },
      {
        id: 'c',
        text: 'Connect module for sharing data with auditors',
      },
      {
        id: 'd',
        text: 'Interact module for querying endpoint compliance status',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'The Reporting module is correct because it is specifically designed for creating and distributing detailed reports, which can include compliance status across endpoints, making it ideal for audit preparation. Choice A (Deploy) is incorrect because its primary function is to execute actions for compliance enforcement, not reporting. Choice C (Connect) is incorrect because, although it can share data with external systems or auditors, it does not focus on the generation of compliance reports. Choice D (Interact) is incorrect because, while it can query endpoint status, it does not by itself facilitate the creation of reports.',
    tags: [
      'reporting-module',
      'compliance-reports',
      'audit-preparation',
      'non-compliant-endpoints',
    ],
    id: 'NAVIGA-GEN-1760810876510-8',
  },
  {
    question:
      "Your organization is transitioning to a hybrid work model, and you're tasked with configuring Tanium to monitor both on-premise and remote endpoints effectively. Which module should you prioritize for configuring to ensure continuous visibility?",
    choices: [
      {
        id: 'a',
        text: 'Connect module for remote data integration',
      },
      {
        id: 'b',
        text: 'Interact module for versatile endpoint querying',
      },
      {
        id: 'c',
        text: 'Trends module for tracking endpoint status over time',
      },
      {
        id: 'd',
        text: 'Reporting module for remote endpoint analysis',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Interact module is correct because its ability to query endpoints in real-time is essential for maintaining visibility over both on-premise and remote endpoints in a hybrid work model. Choice A (Connect) is incorrect because it primarily facilitates data integration with external systems, not endpoint visibility. Choice C (Trends) is incorrect because it focuses on visualizing data trends over time, which is not directly related to the immediate challenge of configuring for hybrid visibility. Choice D (Reporting) is incorrect because it's more focused on creating reports from existing data rather than enabling real-time visibility.",
    tags: ['interact-module', 'hybrid-work-model', 'endpoint-visibility', 'real-time-querying'],
    id: 'NAVIGA-GEN-1760810876510-9',
  },
  {
    question:
      'You need to ensure that the executive team can view monthly security performance metrics without accessing the full Tanium Console. Which module allows you to configure custom views that can be securely shared with non-Tanium users?',
    choices: [
      {
        id: 'a',
        text: 'Connect module for secure data sharing',
      },
      {
        id: 'b',
        text: 'Trends module for creating data-driven dashboards',
      },
      {
        id: 'c',
        text: 'Reporting module for generating and distributing reports',
      },
      {
        id: 'd',
        text: 'Interact module for ad-hoc data querying',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "The Reporting module is correct because it allows the creation and automatic distribution of custom reports, which can include security performance metrics, to users who don't have direct access to the Tanium Console. Choice A (Connect) is incorrect because its primary function is to integrate with external systems for data export, not to create views or reports for non-Tanium users. Choice B (Trends) is incorrect because, although it can create dashboards, these are not designed for distribution outside the Tanium Console. Choice D (Interact) is incorrect because it is intended for real-time querying within the console, not for creating distributable views or reports.",
    tags: ['reporting-module', 'security-performance-metrics', 'custom-reports', 'secure-sharing'],
    id: 'NAVIGA-GEN-1760810876510-10',
  },
  {
    question:
      'As an IT administrator, you need to customize the Tanium dashboard to highlight critical security alerts and system health metrics for a quick overview. Which Tanium module allows you to personalize the dashboard view according to these needs?',
    choices: [
      {
        id: 'a',
        text: 'Deploy module for action initiation and tracking',
      },
      {
        id: 'b',
        text: 'Interact module for real-time data querying',
      },
      {
        id: 'c',
        text: 'Dashboard module for visual customization',
      },
      {
        id: 'd',
        text: 'Connect module for data export configurations',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "The Dashboard module is correct because it provides functionality for users to customize and view various widgets that monitor critical alerts and system health, allowing for a quick and comprehensive overview tailored to specific needs. Choice A (Deploy) is incorrect because it's used to initiate and track actions across endpoints, not for dashboard customization. Choice B (Interact) is incorrect as it's designed for real-time querying of data, not for dashboard aesthetics. Choice D (Connect) is incorrect because it focuses on configuring the exportation of data to external systems, not customizing dashboard views.",
    tags: [
      'dashboard-customization',
      'module-overview',
      'visual-customization',
      'user-interface-elements',
    ],
    id: 'NAVIGA-GEN-1760820429209-1',
  },
  {
    question:
      'You are tasked with exporting historical endpoint data to create compliance reports for an audit. The reports need to illustrate trends over the past year. Which module in Tanium should you use to gather and visualize this data?',
    choices: [
      {
        id: 'a',
        text: 'Trends module for historical data visualization',
      },
      {
        id: 'b',
        text: 'Connect module for data export tasks',
      },
      {
        id: 'c',
        text: 'Interact module for real-time data querying',
      },
      {
        id: 'd',
        text: 'Reporting module for scheduled report generation',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Trends is correct because it specializes in collecting, visualizing, and analyzing historical data over specified periods, making it ideal for audit compliance reporting that requires trend analysis. Choice B (Connect) is incorrect because, while it can export data to external systems, it doesn't specialize in historical trend visualization. Choice C (Interact) is incorrect as it's tailored for real-time querying, not historical data analysis. Choice D (Reporting) is incorrect because, although it can generate reports, it does not focus on visualizing trends over time like the Trends module.",
    tags: ['trends-module', 'historical-data', 'compliance-reporting', 'data-visualization'],
    id: 'NAVIGA-GEN-1760820429209-2',
  },
  {
    question:
      'A new compliance requirement mandates that all endpoint security settings be regularly reported and analyzed for gaps. Which Tanium module would you configure to schedule and automate these security reports?',
    choices: [
      {
        id: 'a',
        text: 'Reporting module for creating and managing reports',
      },
      {
        id: 'b',
        text: 'Interact module for ad-hoc security queries',
      },
      {
        id: 'c',
        text: 'Connect module for external data sharing',
      },
      {
        id: 'd',
        text: 'Deploy module for configuring security policies',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "The Reporting module is correct because it is specifically designed for creating, scheduling, and managing reports, including those for security settings compliance, which meets the requirement for regular analysis and reporting. Choice B (Interact) is incorrect because it's used for real-time data querying, not for scheduling reports. Choice C (Connect) is incorrect as it focuses on exporting data rather than report generation. Choice D (Deploy) is incorrect because it's used for enforcing and managing security policies on endpoints, not for reporting on them.",
    tags: ['reporting-module', 'scheduled-reports', 'compliance-management', 'security-settings'],
    id: 'NAVIGA-GEN-1760820429209-3',
  },
  {
    question:
      'To enhance operational efficiency, your organization seeks to automate the export of Tanium data to a third-party business intelligence tool. Which module would be most effective for automating this data export process?',
    choices: [
      {
        id: 'a',
        text: 'Connect module for automated data exports',
      },
      {
        id: 'b',
        text: 'Deploy module for managing application deployments',
      },
      {
        id: 'c',
        text: 'Interact module for querying endpoint data',
      },
      {
        id: 'd',
        text: 'Trends module for analyzing data trends',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Connect is correct because it's specifically designed to automate the export of Tanium data to external systems, including business intelligence tools, which aligns with the organization's goal of enhancing operational efficiency through automation. Choice B (Deploy) is incorrect because it's focused on managing and deploying actions and software, not data export. Choice C (Interact) is incorrect as it's used for real-time data querying within Tanium, not for exporting data. Choice D (Trends) is incorrect because it's intended for internal visualization and analysis of data trends, not for exporting data.",
    tags: ['connect-module', 'data-export', 'automated-processes', 'business-intelligence'],
    id: 'NAVIGA-GEN-1760820429209-4',
  },
  {
    question:
      'The security team wants to ensure that only users with specific roles can access sensitive data collected by Tanium. Which area of the Tanium console should you configure to manage these access controls?',
    choices: [
      {
        id: 'a',
        text: 'User Interface Preferences for personalized views',
      },
      {
        id: 'b',
        text: 'Module Permissions and Access for role-based access control',
      },
      {
        id: 'c',
        text: 'Connect module for configuring data exports',
      },
      {
        id: 'd',
        text: 'Dashboard module for customizing views',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Module Permissions and Access is correct because it allows administrators to define and manage role-based access controls, ensuring that only users with the appropriate roles can view or interact with sensitive data. Choice A (User Interface Preferences) is incorrect as it deals with personalizing the console view, not restricting data access. Choice C (Connect) is incorrect because, while it manages data exports, it doesn't control access to the data within Tanium. Choice D (Dashboard) is incorrect because it's for view customization, not for managing access permissions.",
    tags: ['module-permissions', 'access-control', 'role-based-access', 'security-management'],
    id: 'NAVIGA-GEN-1760820429209-5',
  },
  {
    question:
      'You need to quickly identify which endpoints are running an outdated version of a critical software to address a recent security vulnerability. Which Tanium module would you use to perform this task efficiently?',
    choices: [
      {
        id: 'a',
        text: 'Deploy module to push updates',
      },
      {
        id: 'b',
        text: 'Interact module for querying endpoint data',
      },
      {
        id: 'c',
        text: 'Asset module to review endpoint inventories',
      },
      {
        id: 'd',
        text: 'Trends module for analyzing version distributions',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Interact is correct because it enables administrators to ask real-time questions across all endpoints to quickly identify which ones are running outdated software, addressing security vulnerabilities efficiently. Choice A (Deploy) is incorrect because Deploy is used to execute actions such as software updates, not for identifying which endpoints need updates. Choice C (Asset) is incorrect because, while useful for reviewing inventories, it does not offer the immediate querying capabilities of Interact. Choice D (Trends) is incorrect as it's focused on analyzing data trends over time, not for real-time data querying.",
    tags: ['interact-module', 'real-time-queries', 'endpoint-data', 'security-vulnerabilities'],
    id: 'NAVIGA-GEN-1760820429209-6',
  },
  {
    question:
      'Your organization requires a monthly analysis of patch compliance trends to improve security posture. Which Tanium module will provide the best capabilities for visualizing these trends over time?',
    choices: [
      {
        id: 'a',
        text: 'Trends module for visualizing data over time',
      },
      {
        id: 'b',
        text: 'Deploy module for compliance action tracking',
      },
      {
        id: 'c',
        text: 'Reporting module for generating compliance reports',
      },
      {
        id: 'd',
        text: 'Connect module for exporting compliance data',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Trends is correct because it's specifically designed to visualize and analyze data over time, making it suitable for monthly analysis of patch compliance trends to enhance security posture. Choice B (Deploy) is incorrect as it's focused on executing and tracking compliance actions, not on data visualization. Choice C (Reporting) is incorrect because, while it can generate detailed compliance reports, it does not specialize in visual trend analysis. Choice D (Connect) is incorrect as it's used for exporting data, not visualizing trends.",
    tags: ['trends-module', 'data-visualization', 'patch-compliance', 'security-posture'],
    id: 'NAVIGA-GEN-1760820429209-7',
  },
  {
    question:
      'To ensure effective incident response, your organization intends to streamline the process of exporting Tanium data to your incident response platform. Which module facilitates the seamless integration and export of Tanium data to external platforms?',
    choices: [
      {
        id: 'a',
        text: 'Connect module for seamless data integration',
      },
      {
        id: 'b',
        text: 'Deploy module for response actions',
      },
      {
        id: 'c',
        text: 'Interact module for incident data querying',
      },
      {
        id: 'd',
        text: 'Asset module for asset management',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Connect is correct because it's designed to automate the integration and export of Tanium data to external platforms, such as an incident response platform, streamlining the data sharing process for effective incident response. Choice B (Deploy) is incorrect as it's aimed at executing response actions rather than integrating with external systems. Choice C (Interact) is incorrect because it's used mainly for querying data within Tanium, not for exporting. Choice D (Asset) is incorrect as it focuses on asset management within Tanium, not on data export.",
    tags: ['connect-module', 'data-export', 'incident-response', 'external-integration'],
    id: 'NAVIGA-GEN-1760820429209-8',
  },
  {
    question:
      'You are configuring the Tanium console for a new team of security analysts. They need quick access to view endpoint security configurations and vulnerability statuses across the network. Which module should you emphasize for this purpose?',
    choices: [
      {
        id: 'a',
        text: 'Deploy module for security configurations management',
      },
      {
        id: 'b',
        text: 'Interact module for real-time endpoint data',
      },
      {
        id: 'c',
        text: 'Asset module for comprehensive endpoint inventory',
      },
      {
        id: 'd',
        text: 'Trends module for historical vulnerability analysis',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Interact is correct because it allows security analysts to quickly query real-time data about endpoint security configurations and vulnerability statuses, providing immediate insights necessary for security assessments. Choice A (Deploy) is incorrect as it's intended for managing security configurations, not for querying data. Choice C (Asset) is incorrect because, although it provides a comprehensive inventory, it does not specialize in the real-time querying of security configurations. Choice D (Trends) is incorrect as it focuses on historical data analysis, not real-time data access.",
    tags: ['interact-module', 'real-time-data', 'endpoint-security', 'vulnerability-status'],
    id: 'NAVIGA-GEN-1760820429209-9',
  },
  {
    question:
      "Following a directive to improve data sharing between Tanium and your organization's ticketing system, you are tasked with setting up a process to automatically create tickets based on specific Tanium alerts. Which module will you use to automate this integration?",
    choices: [
      {
        id: 'a',
        text: 'Connect module for automating data workflows',
      },
      {
        id: 'b',
        text: 'Deploy module for managing alert actions',
      },
      {
        id: 'c',
        text: 'Interact module for alert querying',
      },
      {
        id: 'd',
        text: 'Trends module for tracking alert trends',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Connect is correct because it enables the automation of data workflows between Tanium and external systems, like a ticketing system, allowing for automatic ticket creation based on specific alerts. Choice B (Deploy) is incorrect as it's focused on managing and executing actions on endpoints, not data integration. Choice C (Interact) is incorrect because it's used for querying data and obtaining information on alerts, not for automating workflows. Choice D (Trends) is incorrect as it provides analysis on data trends over time, not direct integration capabilities.",
    tags: ['connect-module', 'data-automation', 'ticketing-system-integration', 'alert-management'],
    id: 'NAVIGA-GEN-1760820429209-10',
  },
  {
    question:
      "As a new IT analyst, you're tasked with customizing the Tanium dashboard to better monitor security compliance across your network. You want to add widgets that display real-time data on patch management and antivirus status. Which module allows you to customize the dashboard with these widgets?",
    choices: [
      {
        id: 'a',
        text: 'Deploy for managing and monitoring patches',
      },
      {
        id: 'b',
        text: 'Interact for real-time data querying',
      },
      {
        id: 'c',
        text: 'Trends for historical and real-time data visualization',
      },
      {
        id: 'd',
        text: 'Connect for data export and integration',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Trends is correct because it allows the creation and customization of dashboards using widgets that can visualize both historical and real-time data, suitable for monitoring security compliance. Choice A (Deploy) is incorrect as it's primarily for executing actions, not dashboard customization. Choice B (Interact) is incorrect because, although it queries real-time data, it doesn't support dashboard customization. Choice D (Connect) is incorrect because its main function is data export and integration, not dashboard visualization.",
    tags: ['dashboard-customization', 'trends-module', 'real-time-data', 'security-compliance'],
    id: 'NAVIGA-GEN-1760820499644-1',
  },
  {
    question:
      'Your manager asks you to configure a system that automatically sends endpoint security status reports to the compliance team every Friday. Which Tanium module should you utilize to schedule and automate these reports?',
    choices: [
      {
        id: 'a',
        text: 'Trends for visual data representation',
      },
      {
        id: 'b',
        text: 'Reporting for generating and scheduling reports',
      },
      {
        id: 'c',
        text: 'Interact for real-time interrogation',
      },
      {
        id: 'd',
        text: 'Connect for data export and sharing',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Reporting is correct because it's specifically designed for creating, managing, and scheduling reports, which can be automatically sent to specified recipients, such as the compliance team. Choice A (Trends) is incorrect because it focuses on dashboard visualizations rather than report scheduling. Choice C (Interact) is incorrect as it's used for asking questions to endpoints in real-time, not for report generation. Choice D (Connect) is incorrect because, though it can export data, its primary function isn't report scheduling.",
    tags: ['reporting-module', 'schedule-reports', 'compliance-reporting', 'automated-reports'],
    id: 'NAVIGA-GEN-1760820499644-2',
  },
  {
    question:
      "While reviewing your organization's security posture, you realize the need to export real-time threat intelligence data to your external threat analysis tool. Which Tanium module would best facilitate this continuous data export?",
    choices: [
      {
        id: 'a',
        text: 'Trends for data visualization',
      },
      {
        id: 'b',
        text: 'Deploy to execute security tools',
      },
      {
        id: 'c',
        text: 'Interact for querying real-time data',
      },
      {
        id: 'd',
        text: 'Connect for external system integration',
      },
    ],
    correctAnswerId: 'd',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Connect is correct because it is designed to integrate Tanium data with external systems, allowing for the continuous export of real-time threat intelligence to other tools. Choice A (Trends) is incorrect because it's tailored for internal data visualization rather than external data export. Choice B (Deploy) is incorrect as it's used for executing actions rather than data integration. Choice C (Interact) is incorrect because, while it can query real-time data, it doesn't facilitate data export.",
    tags: ['connect-module', 'data-export', 'threat-intelligence', 'system-integration'],
    id: 'NAVIGA-GEN-1760820499644-3',
  },
  {
    question:
      'To improve operational efficiency, your team decides to monitor the performance of all deployed applications across the enterprise network. You need to visualize application performance trends over the last quarter. Which Tanium module should you leverage for this task?',
    choices: [
      {
        id: 'a',
        text: 'Connect for historical data export',
      },
      {
        id: 'b',
        text: 'Deploy for application management',
      },
      {
        id: 'c',
        text: 'Trends for historical data visualization',
      },
      {
        id: 'd',
        text: 'Reporting for custom report generation',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Trends is correct because it specializes in visualizing historical and real-time data, making it suitable for monitoring application performance trends over time. Choice A (Connect) is incorrect because, although it can export data, it does not specialize in visualizing trends. Choice B (Deploy) is incorrect since it's more focused on the management and distribution of software rather than performance monitoring. Choice D (Reporting) is incorrect because, while it can generate reports, it's not as adept at visualizing trends as the Trends module.",
    tags: ['trends-module', 'application-performance', 'historical-data', 'data-visualization'],
    id: 'NAVIGA-GEN-1760820499644-4',
  },
  {
    question:
      "During a routine security audit, it's discovered that several endpoints are not compliant with the latest security policies. You are tasked with identifying and mitigating these compliance issues swiftly. Which Tanium module enables you to both identify non-compliant endpoints and take corrective actions?",
    choices: [
      {
        id: 'a',
        text: 'Interact for real-time identification',
      },
      {
        id: 'b',
        text: 'Deploy for executing remediation actions',
      },
      {
        id: 'c',
        text: 'Comply for compliance assessment and remediation',
      },
      {
        id: 'd',
        text: 'Connect for data analysis',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'Comply is correct because it is specifically designed for assessing compliance against policies and executing remediation actions on non-compliant endpoints. Choice A (Interact) is incorrect because, while it can identify non-compliant endpoints in real-time, it does not offer remediation features. Choice B (Deploy) is incorrect because, although it can execute actions, it lacks compliance assessment capabilities. Choice D (Connect) is incorrect because it focuses on data export and integration, not compliance management.',
    tags: ['comply-module', 'security-audit', 'compliance-management', 'remediation-actions'],
    id: 'NAVIGA-GEN-1760820499644-5',
  },
  {
    question:
      'Your organization plans to migrate several business-critical applications to a new platform. You need to ensure minimal disruption during this process by closely monitoring the performance and availability of these applications. Which Tanium module should you use to track and visualize this performance data over time?',
    choices: [
      {
        id: 'a',
        text: 'Asset for inventory management',
      },
      {
        id: 'b',
        text: 'Trends for performance data visualization',
      },
      {
        id: 'c',
        text: 'Deploy for application deployment',
      },
      {
        id: 'd',
        text: 'Connect for external performance monitoring',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Trends is correct because it is the best fit for visualizing application performance data over time, which is crucial for ensuring minimal disruption during the migration. Choice A (Asset) is incorrect as it's more focused on inventory management than performance monitoring. Choice C (Deploy) is incorrect since its primary function is deploying software, not monitoring performance. Choice D (Connect) is incorrect because, while it can export data for external monitoring, it lacks the internal visualization capabilities of Trends.",
    tags: [
      'trends-module',
      'application-migration',
      'performance-monitoring',
      'data-visualization',
    ],
    id: 'NAVIGA-GEN-1760820499644-6',
  },
  {
    question:
      'After implementing a new security policy, your team needs to ensure that all endpoints are in compliance. You want to generate a report detailing the current compliance status of each endpoint and schedule it for monthly review meetings. Which Tanium module would be most appropriate for this task?',
    choices: [
      {
        id: 'a',
        text: 'Connect for compliance data export',
      },
      {
        id: 'b',
        text: 'Comply for compliance assessment and reporting',
      },
      {
        id: 'c',
        text: 'Deploy for managing security configurations',
      },
      {
        id: 'd',
        text: 'Interact for querying endpoint status',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Comply is correct because it offers compliance assessment features and the capability to generate and schedule compliance reports, fitting the need to monitor endpoints for policy compliance. Choice A (Connect) is incorrect as it focuses on data export, not compliance reporting. Choice C (Deploy) is incorrect because it's used for software distribution and configuration management, not compliance assessment. Choice D (Interact) is incorrect as it's intended for real-time querying, not for generating scheduled reports.",
    tags: ['comply-module', 'compliance-reporting', 'security-policy', 'scheduled-reports'],
    id: 'NAVIGA-GEN-1760820499644-7',
  },
  {
    question:
      "You're configuring Tanium to improve your organization's operational awareness. You need a module that lets team members view endpoint health, user activity, and security alerts in a customizable interface. Which module best supports creating such a comprehensive operations dashboard?",
    choices: [
      {
        id: 'a',
        text: 'Trends for customizable data dashboards',
      },
      {
        id: 'b',
        text: 'Interact for detailed endpoint queries',
      },
      {
        id: 'c',
        text: 'Asset for endpoint inventory management',
      },
      {
        id: 'd',
        text: 'Connect for integrating alert data',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'Trends is correct because it allows users to create customizable dashboards that can display a wide range of operational data, including endpoint health, user activity, and security alerts. Choice B (Interact) is incorrect because, while it can provide detailed endpoint data, it does not offer dashboard customization. Choice C (Asset) is incorrect as it focuses on inventory management rather than operational awareness. Choice D (Connect) is incorrect because its primary function is data integration, not dashboard creation.',
    tags: ['trends-module', 'operations-dashboard', 'endpoint-health', 'security-alerts'],
    id: 'NAVIGA-GEN-1760820499644-8',
  },
  {
    question:
      'Your company is enhancing its endpoint security measures. As part of this initiative, you are tasked with periodically reviewing all installed software across endpoints to identify and remediate unauthorized applications. Which Tanium module would be most effective for this continuous monitoring and management?',
    choices: [
      {
        id: 'a',
        text: 'Asset for tracking software inventory',
      },
      {
        id: 'b',
        text: 'Deploy for managing software distribution',
      },
      {
        id: 'c',
        text: 'Interact for on-demand software queries',
      },
      {
        id: 'd',
        text: 'Protect for setting security policies',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'Asset is correct because it specializes in inventory management, including tracking installed software across endpoints, which aids in identifying unauthorized applications for remediation. Choice B (Deploy) is incorrect since it focuses on software distribution rather than identification and monitoring of installed software. Choice C (Interact) is incorrect because, although it can be used for querying software, it does not offer continuous monitoring capabilities. Choice D (Protect) is incorrect as it is designed for enforcing security policies, not for software inventory management.',
    tags: [
      'asset-module',
      'software-inventory',
      'unauthorized-applications',
      'continuous-monitoring',
    ],
    id: 'NAVIGA-GEN-1760820499644-9',
  },
  {
    question:
      'In preparation for an upcoming security audit, your team needs to ensure that all endpoints are configured according to the latest security standards. You plan to use Tanium to quickly identify any endpoints that do not meet these standards. Which Tanium module would best enable you to assess and report on the compliance status of your endpoints?',
    choices: [
      {
        id: 'a',
        text: 'Protect for endpoint protection',
      },
      {
        id: 'b',
        text: 'Comply for compliance assessment and reporting',
      },
      {
        id: 'c',
        text: 'Deploy for adjusting endpoint configurations',
      },
      {
        id: 'd',
        text: 'Interact for real-time endpoint querying',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Comply is correct because it provides the tools for assessing the compliance of endpoints against security standards and generating reports on their status, which is essential for preparing for security audits. Choice A (Protect) is incorrect because it focuses on protecting endpoints from threats, not on compliance reporting. Choice C (Deploy) is incorrect as it's used for changing configurations, not for compliance assessment. Choice D (Interact) is incorrect since it's used for querying endpoints in real-time, not for comprehensive compliance assessment and reporting.",
    tags: ['comply-module', 'security-audit', 'compliance-assessment', 'reporting'],
    id: 'NAVIGA-GEN-1760820499644-10',
  },
  {
    question:
      "As a new Tanium operator, you're tasked with customizing the dashboard to include widgets that show the status of critical vulnerabilities across the network. Which module allows you to customize the dashboard with this specific data visualization?",
    choices: [
      {
        id: 'a',
        text: 'Connect module for external data feeds',
      },
      {
        id: 'b',
        text: 'Deploy module for executing vulnerability scans',
      },
      {
        id: 'c',
        text: 'Trends module to create and display widgets',
      },
      {
        id: 'd',
        text: 'Reporting module to generate vulnerability reports',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Trends is correct because it enables the creation and display of customizable data visualizations and widgets on the dashboard, including real-time monitoring of critical vulnerabilities. Choice A (Connect) is incorrect because it's used for exporting data out of Tanium, not for dashboard customization. Choice B (Deploy) is incorrect as it's focused on executing actions, such as vulnerability scans, not visualizing data. Choice D (Reporting) is incorrect because, although it generates detailed reports, it doesn't offer real-time dashboard widgets.",
    tags: [
      'dashboard-customization',
      'trends-module',
      'data-visualization',
      'critical-vulnerabilities',
    ],
    id: 'NAVIGA-GEN-1760820575581-1',
  },
  {
    question:
      'You have been asked to export a list of all installed software on endpoints to a CSV file for audit purposes. Which Tanium module will you use to accomplish this task without requiring any external system integration?',
    choices: [
      {
        id: 'a',
        text: 'Deploy module for software management',
      },
      {
        id: 'b',
        text: 'Connect module for direct data export',
      },
      {
        id: 'c',
        text: 'Interact module for querying endpoint data',
      },
      {
        id: 'd',
        text: 'Asset module to access the software inventory',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'Connect is correct because it facilitates the direct export of data from Tanium, allowing operators to generate reports in formats such as CSV for audit purposes without the need for external system integration. Choice A (Deploy) is incorrect as it is used for software distribution and not for data export. Choice C (Interact) is incorrect because, although it can query endpoint data, it does not directly export data to files. Choice D (Asset) is incorrect because, while it provides detailed inventory data, the module itself does not export data to files.',
    tags: ['connect-module', 'data-export', 'audit-compliance', 'csv-report'],
    id: 'NAVIGA-GEN-1760820575581-2',
  },
  {
    question:
      "Your manager requests a monthly report showing the compliance status of all endpoints against the company's security baseline. Which module should you configure to automatically generate and send this report?",
    choices: [
      {
        id: 'a',
        text: 'Trends module for compliance visualization',
      },
      {
        id: 'b',
        text: 'Reporting module for scheduled report delivery',
      },
      {
        id: 'c',
        text: 'Connect module for external report sharing',
      },
      {
        id: 'd',
        text: 'Interact module to manually query compliance data',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Reporting is correct because it allows creating, scheduling, and automatically sending detailed reports about various metrics, including compliance status against security baselines, directly via email or other means. Choice A (Trends) is incorrect because it focuses on visualizing data within the Tanium platform, not on sending reports. Choice C (Connect) is incorrect because, although it can export data, it's more suited for continuous data feeds rather than scheduled reports. Choice D (Interact) is incorrect because it's used for ad-hoc queries and does not offer scheduling or automated report sending capabilities.",
    tags: ['reporting-module', 'scheduled-reports', 'compliance-status', 'security-baseline'],
    id: 'NAVIGA-GEN-1760820575581-3',
  },
  {
    question:
      "You're configuring access permissions for a new team member in the Tanium console. The member needs to query endpoints for real-time data but should not have the ability to execute actions. Which module permissions should you assign to them?",
    choices: [
      {
        id: 'a',
        text: 'Interact module with read-only access',
      },
      {
        id: 'b',
        text: 'Deploy module with execute permissions',
      },
      {
        id: 'c',
        text: 'Connect module with export permissions',
      },
      {
        id: 'd',
        text: 'Trends module with view-only access',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Interact with read-only access is correct because it allows the team member to query endpoints for real-time data without the ability to execute actions, aligning with the specified access requirements. Choice B (Deploy) is incorrect as it focuses on executing actions, which the new team member should not do. Choice C (Connect) is incorrect because it's related to data export capabilities, not querying for real-time data. Choice D (Trends) is incorrect because it's for data visualization and does not offer the query capabilities described.",
    tags: ['module-permissions', 'real-time-data', 'interact-module', 'access-control'],
    id: 'NAVIGA-GEN-1760820575581-4',
  },
  {
    question:
      'After deploying Tanium to a new region, you notice that some endpoints are not reporting as expected. To troubleshoot, you decide to check the connection status of these endpoints from the Tanium console. Which module should you use to view the current connection status?',
    choices: [
      {
        id: 'a',
        text: 'Deploy module to check deployment status',
      },
      {
        id: 'b',
        text: 'Connect module to verify data exports',
      },
      {
        id: 'c',
        text: 'Asset module to review endpoint connection status',
      },
      {
        id: 'd',
        text: 'Interact module to query endpoint health',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Troubleshooting',
    explanation:
      'Asset is correct because it provides comprehensive inventory data, including the connection status of endpoints, which is crucial for troubleshooting issues with endpoints not reporting as expected. Choice A (Deploy) is incorrect because it focuses on the management and distribution of software, not on monitoring connection statuses. Choice B (Connect) is incorrect as it deals with exporting data to external systems rather than endpoint health. Choice D (Interact) could potentially be used to query health, but Asset gives a more direct overview of connection statuses without crafting specific questions.',
    tags: ['asset-module', 'endpoint-connection-status', 'troubleshooting', 'endpoint-health'],
    id: 'NAVIGA-GEN-1760820575581-5',
  },
  {
    question:
      "You're planning to integrate Tanium data with your company's business intelligence (BI) tools to analyze endpoint security trends over time. Which module would be most appropriate for setting up this integration?",
    choices: [
      {
        id: 'a',
        text: 'Trends module for visualizing data within Tanium',
      },
      {
        id: 'b',
        text: 'Connect module to export data to BI tools',
      },
      {
        id: 'c',
        text: 'Interact module for real-time data querying',
      },
      {
        id: 'd',
        text: 'Asset module for inventory management',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Best Practices',
    explanation:
      "Connect is correct because it specializes in exporting Tanium data out of the system, making it suitable for integration with external BI tools for further analysis. Choice A (Trends) is incorrect because it focuses on visualizing data within the Tanium platform, not for exporting. Choice C (Interact) is incorrect because, although it queries real-time data, it does not facilitate direct integration or export to BI tools. Choice D (Asset) is incorrect since it's geared towards inventory management and does not support data export functions tailored for BI tool integration.",
    tags: ['connect-module', 'data-export', 'bi-tools-integration', 'endpoint-security-trends'],
    id: 'NAVIGA-GEN-1760820575581-6',
  },
  {
    question:
      'In preparation for an upcoming security audit, you need to ensure that you can provide historical data on endpoint security posture changes over the past year. Which module would be most effective for gathering this historical data?',
    choices: [
      {
        id: 'a',
        text: 'Reporting module for generating past reports',
      },
      {
        id: 'b',
        text: 'Trends module to visualize historical data trends',
      },
      {
        id: 'c',
        text: 'Connect module for historical data export',
      },
      {
        id: 'd',
        text: 'Interact module for querying current endpoint data',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Best Practices',
    explanation:
      "Trends is correct because it's specifically designed to visualize and analyze historical data trends, including changes in endpoint security posture over time, which is vital for security audits. Choice A (Reporting) is incorrect because, while it can generate reports based on data, it may not effectively visualize trends over a period as required for audits. Choice C (Connect) is incorrect as it focuses on exporting current or real-time data, not analyzing historical trends. Choice D (Interact) is incorrect because it's used for querying current data, not for reviewing historical changes.",
    tags: ['trends-module', 'historical-data', 'security-posture', 'security-audit-preparation'],
    id: 'NAVIGA-GEN-1760820575581-7',
  },
  {
    question:
      'Your company is enforcing a new policy where all endpoints must have a specific software installed. You need to check which endpoints do not comply with this policy. Which Tanium module will provide you with this capability?',
    choices: [
      {
        id: 'a',
        text: 'Deploy module to enforce software installations',
      },
      {
        id: 'b',
        text: 'Interact module to query endpoints for the software',
      },
      {
        id: 'c',
        text: 'Asset module for comprehensive software inventory',
      },
      {
        id: 'd',
        text: 'Connect module to export compliance data',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'Interact is correct because it allows operators to query all endpoints in real-time to check for the presence of specific software, thereby identifying non-compliance with the new policy effectively. Choice A (Deploy) is incorrect because, while it can enforce software installations, it does not provide a mechanism to query or check compliance. Choice C (Asset) provides a comprehensive inventory but may not offer the immediate, real-time querying capability that Interact does. Choice D (Connect) is incorrect because it is geared towards exporting data rather than querying endpoints for compliance.',
    tags: ['interact-module', 'software-compliance', 'endpoint-querying', 'policy-enforcement'],
    id: 'NAVIGA-GEN-1760820575581-8',
  },
  {
    question:
      "You've been tasked with reducing the time spent by your team on manual data gathering for compliance reports. Which Tanium module would best automate this process, allowing for scheduled data collection and report generation?",
    choices: [
      {
        id: 'a',
        text: 'Connect module for automated data export',
      },
      {
        id: 'b',
        text: 'Reporting module for automatic report generation',
      },
      {
        id: 'c',
        text: 'Interact module for real-time data collection',
      },
      {
        id: 'd',
        text: 'Deploy module for deploying reporting tools',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Best Practices',
    explanation:
      "Reporting is correct because it allows for the automation of data collection and report generation, which can be scheduled at regular intervals, thereby reducing manual effort and ensuring timely compliance reporting. Choice A (Connect) is incorrect because, although it can automate data export, it does not generate reports. Choice C (Interact) is incorrect as it's geared towards real-time data collection rather than automated reporting. Choice D (Deploy) is incorrect because it's used for deploying software and tools, not for generating or scheduling reports.",
    tags: [
      'reporting-module',
      'automated-reporting',
      'compliance-reports',
      'scheduled-data-collection',
    ],
    id: 'NAVIGA-GEN-1760820575581-9',
  },
  {
    question:
      'You are configuring the Tanium console for a group of new users who will only need to view reports and dashboards without the capability to make changes. Which user interface element should you focus on to restrict their access appropriately?',
    choices: [
      {
        id: 'a',
        text: 'Dashboard customization settings',
      },
      {
        id: 'b',
        text: 'Module permissions for read-only access',
      },
      {
        id: 'c',
        text: 'Console settings for general access control',
      },
      {
        id: 'd',
        text: 'User roles and access levels in the settings menu',
      },
    ],
    correctAnswerId: 'd',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "User roles and access levels in the settings menu is correct because adjusting these settings allows you to define what each user or group of users can see and do within the Tanium console, ensuring that new users can view reports and dashboards without making unauthorized changes. Choice A (Dashboard customization settings) is incorrect as it pertains to the visual arrangement rather than access control. Choice B (Module permissions for read-only access) is partially correct but too specific and doesn't encompass the broader user role configuration. Choice C (Console settings for general access control) is too broad and doesn't directly address the need to set up specific user roles and access levels.",
    tags: ['user-interface-elements', 'user-roles', 'access-levels', 'module-permissions'],
    id: 'NAVIGA-GEN-1760820575581-10',
  },
];

export default generatedQuestions;
