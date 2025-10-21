import { Difficulty, type Question, QuestionCategory, TCODomain } from '@/types/exam';

/**
 * AI-Generated Questions
 *
 * Domain: asking_questions
 * Difficulty: beginner
 * Count: 44
 * Generated: 2025-10-18T20:36:23.844Z
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedQuestions: Question[] = [
  {
    question:
      "You've been tasked with identifying machines in your organization that are running an outdated version of Google Chrome because a new security vulnerability has been announced. Your goal is to get this information as quickly as possible to mitigate any potential security risks. Which of the following approaches should you take to accomplish this task?",
    choices: [
      {
        id: 'a',
        text: 'Use the Deploy module to uninstall the outdated Google Chrome versions.',
      },
      {
        id: 'b',
        text: "Navigate to the Asset module to manually check each machine's installed applications.",
      },
      {
        id: 'c',
        text: 'Utilize a saved question in the Interact module that queries for installed versions of Google Chrome.',
      },
      {
        id: 'd',
        text: 'Create a new sensor in the Manage module to detect Google Chrome versions.',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Utilizing a saved question in the Interact module for querying installed versions of Google Chrome is correct because it allows for rapid, real-time querying across all endpoints to identify outdated versions effectively. Choice A (Deploy) is incorrect because the Deploy module is intended for executing actions, such as installing or uninstalling software, but not for querying data. Choice B (Asset) is incorrect because manually checking each machine's installed applications in the Asset module is time-consuming and not practical for immediate results. Choice D (Create a new sensor) is incorrect because it requires time to develop and test a new sensor, whereas a saved question can provide immediate results.",
    tags: ['interact-module', 'saved-questions', 'installed-applications', 'sensor-library'],
    id: 'ASKING-GEN-1760818779032-1',
  },
  {
    question:
      'Your company is preparing for an internal audit and needs to verify that all endpoints are running the latest operating system version to comply with IT security policies. You are assigned to find this information efficiently and accurately. What is the best way to proceed using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Export a list of all endpoints from the Trends module for manual verification.',
      },
      {
        id: 'b',
        text: 'Ask a natural language query in the Interact module about OS versions on all endpoints.',
      },
      {
        id: 'c',
        text: 'Configure a new dashboard in the Trends module to monitor OS versions.',
      },
      {
        id: 'd',
        text: 'Consult the Asset module for detailed reports on installed operating systems.',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'Asking a natural language query in the Interact module about OS versions on all endpoints is correct because it enables you to quickly gather and assess the data required for the audit in real-time. Choice A (Trends) is incorrect because exporting a list for manual verification is time-consuming and not efficient for immediate needs. Choice C (Trends dashboard) is incorrect because, while useful for ongoing monitoring, it does not provide the immediate, detailed comparison needed for audit prep. Choice D (Asset) is incorrect because, although Asset offers detailed reports, the Interact module provides faster access to real-time data for this specific compliance check.',
    tags: ['interact-module', 'natural-language-query', 'operating-systems', 'audit-compliance'],
    id: 'ASKING-GEN-1760818779032-2',
  },
  {
    question:
      "You're tasked with identifying which devices in your organization are running an outdated version of a critical software package. To accomplish this quickly, you decide to use Tanium. Which approach will provide you with the most efficient and accurate results?",
    choices: [
      {
        id: 'a',
        text: 'Navigate to the Asset module and filter by software version.',
      },
      {
        id: 'b',
        text: "Use the Interact module to ask, 'Get Installed Applications from all machines'.",
      },
      {
        id: 'c',
        text: 'Create a saved question in the Interact module for repeated use.',
      },
      {
        id: 'd',
        text: 'Deploy a script via the Deploy module to each endpoint to report software versions.',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Best Practices',
    explanation:
      'Creating a saved question in the Interact module for repeated use is correct because it allows for efficient, on-demand access to updated information across all endpoints without having to reconstruct the question each time. Choice A (Asset) is incorrect because while it can provide software inventory, it may not offer the real-time precision or the specific focus on versions that a custom query in Interact would. Choice B (Interact with a broad question) is less efficient as it does not directly focus on the outdated software version, potentially returning overwhelming amounts of data. Choice D (Deploy) is incorrect because it involves unnecessary complexity and resource use for a task that can be accomplished more efficiently with a query.',
    tags: [
      'saved-questions-management',
      'interact-module',
      'question-construction-best-practices',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760818967748-1',
  },
  {
    question:
      "Your organization's compliance policy requires regular checks on the encryption status of all endpoints. You need to verify which devices are compliant. Which method in Tanium will help you gather this information most effectively?",
    choices: [
      {
        id: 'a',
        text: 'Export a list of all devices from the Asset module and manually check each one.',
      },
      {
        id: 'b',
        text: "Use the Interact module to construct a question using the 'Encryption Status' sensor.",
      },
      {
        id: 'c',
        text: 'Configure the Trends module to create a dashboard showing encryption status over time.',
      },
      {
        id: 'd',
        text: 'Set up an alert in Protect to notify you of non-compliant devices.',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Using the Interact module to construct a question with the 'Encryption Status' sensor is correct because it provides an immediate, real-time view of the encryption status across all endpoints. Choice A (Asset) is incorrect because exporting and manually checking is time-consuming and not efficient for real-time compliance checks. Choice C (Trends) is incorrect for this scenario because, although it offers valuable historical data, it doesn't provide the immediate status check required for compliance verification. Choice D (Protect) is incorrect as it's more focused on response actions for non-compliance rather than querying existing status across all devices.",
    tags: ['interact-module', 'encryption-status', 'compliance-checks', 'sensor-questions'],
    id: 'ASKING-GEN-1760818967748-2',
  },
  {
    question:
      'As part of a security audit, you need to quickly identify which endpoints are running a specific, vulnerable version of an application. You remember that Tanium can provide this information in real-time. How should you proceed to obtain accurate information efficiently?',
    choices: [
      {
        id: 'a',
        text: 'Directly access the database backend of Tanium to query installed applications.',
      },
      {
        id: 'b',
        text: "Use the 'Installed Applications' sensor in the Interact module with specific version criteria.",
      },
      {
        id: 'c',
        text: 'Navigate to the Reports module and generate a new report based on application versions.',
      },
      {
        id: 'd',
        text: 'Email all users asking them to report their installed application versions.',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Installed Applications' sensor in the Interact module with specific version criteria is the best approach because it allows for targeted, real-time queries across all endpoints for the specific application and version in question. Choice A (Database access) is incorrect and not recommended as it bypasses the efficiencies and safety measures built into the Tanium platform. Choice C (Reports) is less efficient for immediate needs because it's geared towards generating historical and aggregated data. Choice D (Emailing users) is the least efficient and reliable method for gathering accurate and immediate information across all endpoints.",
    tags: [
      'interact-module',
      'installed-applications-sensor',
      'real-time-queries',
      'security-audit',
    ],
    id: 'ASKING-GEN-1760818967748-3',
  },
  {
    question:
      'As a new IT administrator, you are tasked with verifying the installation status of a critical security application across all endpoints. Which approach would you take to quickly gather this information using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Navigate to the Asset module to manually check each endpoint',
      },
      {
        id: 'b',
        text: "Use the Interact module with a natural language query for 'Installed Applications'",
      },
      {
        id: 'c',
        text: 'Configure a new sensor in the Deploy module to detect the application',
      },
      {
        id: 'd',
        text: 'Review the saved questions in the Reports module for application installation status',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Choice B (Interact module with a natural language query for 'Installed Applications') is correct because it allows you to ask real-time questions and get immediate results across all endpoints. Choice A is incorrect as the Asset module provides a broad inventory overview but is not optimal for specific queries. Choice C is incorrect because the Deploy module is used for executing actions, not for querying data. Choice D is incorrect as the Reports module is primarily for analyzing historical data, not for querying real-time installation statuses.",
    tags: [
      'Interact-module',
      'natural-language-query',
      'installed-applications',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760819583458-1',
  },
  {
    question:
      'Your team is planning a network upgrade and needs to ensure no critical security software will be incompatible after the change. Which step should you take first using Tanium to identify potentially affected software?',
    choices: [
      {
        id: 'a',
        text: 'Check the Trends module for historical usage of security software',
      },
      {
        id: 'b',
        text: "Ask a saved question in Interact about 'Security Software Versions'",
      },
      {
        id: 'c',
        text: 'Deploy a script via the Deploy module to scan for incompatible software',
      },
      {
        id: 'd',
        text: 'Use Connect to export current software data for manual analysis',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Choice B (Ask a saved question in Interact about 'Security Software Versions') is correct because it leverages Tanium's ability to quickly gather real-time data across endpoints, which is essential for identifying software compatibility pre-upgrade. Choice A is incorrect since the Trends module focuses on historical data, not current software versions. Choice C is incorrect because deploying scripts for this purpose is less efficient and not the primary function of the Deploy module. Choice D is incorrect as Connect is used for data export rather than direct interrogation of endpoints.",
    tags: ['Interact-module', 'saved-questions', 'security-software', 'network-upgrade'],
    id: 'ASKING-GEN-1760819583458-2',
  },
  {
    question:
      'During an audit, you need to demonstrate that all endpoints comply with a new security policy by having a specific firewall setting enabled. Which Tanium module and feature should you utilize to gather this compliance information?',
    choices: [
      {
        id: 'a',
        text: 'Deploy module with configuration management to enforce settings',
      },
      {
        id: 'b',
        text: "Interact module using a 'Firewall Settings' sensor query",
      },
      {
        id: 'c',
        text: 'Asset module to check the inventory for firewall settings',
      },
      {
        id: 'd',
        text: 'Comply module to compare settings against compliance standards',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Choice B (Interact module using a 'Firewall Settings' sensor query) is correct because it allows for an immediate, real-time check of the specific setting across all endpoints. Choice A is incorrect because while the Deploy module can enforce settings, it doesn't provide a compliance check. Choice C is incorrect because the Asset module gives a broad overview rather than detailed settings information. Choice D, while relevant for compliance, is incorrect because it assumes the setting has been previously defined as a compliance standard, which may not always be the case.",
    tags: ['Interact-module', 'sensor-query', 'firewall-settings', 'audit-compliance'],
    id: 'ASKING-GEN-1760819583458-3',
  },
  {
    question:
      'A recent security breach investigation requires you to quickly identify all endpoints running an outdated version of a specific software. How would you use Tanium to find this information effectively?',
    choices: [
      {
        id: 'a',
        text: 'Set up a software inventory report in the Asset module',
      },
      {
        id: 'b',
        text: 'Create a custom sensor in the Develop module to detect the software version',
      },
      {
        id: 'c',
        text: "Use the Interact module to ask about 'Installed Applications' and filter for the software",
      },
      {
        id: 'd',
        text: 'Launch a compliance check in the Comply module for the software version',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Choice C (Use the Interact module to ask about 'Installed Applications' and filter for the software) is correct because it allows for real-time querying of all endpoints to identify specific software versions quickly. Choice A is incorrect as Asset module reports provide broader inventory information, not specific version checks. Choice B is incorrect because creating a custom sensor is not necessary when existing sensors can achieve this. Choice D is incorrect because the Comply module focuses on compliance with policies, not identifying outdated software versions.",
    tags: ['Interact-module', 'Installed-Applications', 'security-breach', 'software-version'],
    id: 'ASKING-GEN-1760819583458-4',
  },
  {
    question:
      'You need to ensure that all laptops in your organization are running Windows 10 version 20H2 or newer for a compliance requirement. Which method would you choose to verify this using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Deploy a configuration policy in the Manage module for Windows 10',
      },
      {
        id: 'b',
        text: "Query the 'Operating System' sensor in the Interact module",
      },
      {
        id: 'c',
        text: 'Export a list of all devices from the Asset module and manually check',
      },
      {
        id: 'd',
        text: 'Set up a new dashboard in Trends to track Windows 10 versions',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Choice B (Query the 'Operating System' sensor in the Interact module) is correct because it allows for precise and immediate querying of the operating system versions across all laptops. Choice A is incorrect because the Manage module's configuration policies are not designed for querying or reporting on OS versions. Choice C is incorrect as it is very time-consuming and not practical for quick verification across many devices. Choice D is incorrect because Trends is for analyzing data over time, not for querying specific, current data points.",
    tags: ['Interact-module', 'Operating-System-sensor', 'Windows-10', 'compliance-requirement'],
    id: 'ASKING-GEN-1760819583458-5',
  },
  {
    question:
      "To improve network security, you've been tasked with finding all endpoints that haven't rebooted in the last 30 days. Which Tanium feature would best accomplish this task?",
    choices: [
      {
        id: 'a',
        text: 'Configure a new dashboard in Trends showing uptime statistics',
      },
      {
        id: 'b',
        text: "Use the 'Last Reboot' sensor in the Interact module to query endpoints",
      },
      {
        id: 'c',
        text: 'Deploy a mandatory reboot policy via the Manage module',
      },
      {
        id: 'd',
        text: 'Review endpoint activity in the Asset module for reboot records',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Choice B (Use the 'Last Reboot' sensor in the Interact module to query endpoints) is correct because it directly queries the last reboot time of endpoints, allowing for an immediate assessment of reboot compliance. Choice A is incorrect as Trends would provide historical data but lacks the immediacy and specificity required for this task. Choice C is incorrect because it enforces action without providing current status information. Choice D is incorrect as the Asset module does not specifically track or display last reboot times as directly as querying with a sensor does.",
    tags: ['Interact-module', 'Last-Reboot-sensor', 'network-security', 'endpoint-management'],
    id: 'ASKING-GEN-1760819583458-6',
  },
  {
    question:
      'Your organization requires a weekly report of all newly installed software across the enterprise to monitor for unauthorized applications. What is the most efficient way to use Tanium for this task?',
    choices: [
      {
        id: 'a',
        text: 'Set up a recurring export of installed applications via the Connect module',
      },
      {
        id: 'b',
        text: "Manually ask a question in the Interact module about 'Installed Applications' each week",
      },
      {
        id: 'c',
        text: 'Develop a custom sensor to detect new installations within the last week',
      },
      {
        id: 'd',
        text: 'Regularly review the Asset module for changes in application inventory',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Choice A (Set up a recurring export of installed applications via the Connect module) is correct because it automates the process of gathering and exporting data on installed applications, making weekly reporting efficient and consistent. Choice B is incorrect because manually asking each week is time-consuming and prone to inconsistencies. Choice C is incorrect because while developing a custom sensor is possible, it's more complex and unnecessary when existing functionality suffices. Choice D is incorrect as regularly reviewing the Asset module is less efficient and does not automate report generation.",
    tags: [
      'Connect-module',
      'Installed-Applications',
      'unauthorized-applications',
      'weekly-report',
    ],
    id: 'ASKING-GEN-1760819583458-7',
  },
  {
    question:
      'After updating company-wide firewall settings, you need to verify that all devices are compliant with the new policy. Which Tanium capability should you leverage for this verification?',
    choices: [
      {
        id: 'a',
        text: 'Use the Comply module to run a compliance check against the new firewall settings',
      },
      {
        id: 'b',
        text: "Query endpoints using the 'Firewall Status' sensor in the Interact module",
      },
      {
        id: 'c',
        text: 'Check the Manage module for devices not applying the firewall policy',
      },
      {
        id: 'd',
        text: 'Review network traffic in the Connect module for non-compliant activity',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Choice B (Query endpoints using the 'Firewall Status' sensor in the Interact module) is correct because it allows for an immediate and specific verification of the firewall status on all devices. Choice A is incorrect because the Comply module, while useful for compliance checks, is not as direct for real-time, specific firewall policy verification. Choice C is incorrect because the Manage module's focus is on configuration and policy application, not on verifying policy compliance. Choice D is incorrect as the Connect module is geared towards data integration and export, not direct compliance verification.",
    tags: ['Interact-module', 'Firewall-Status-sensor', 'firewall-settings', 'policy-compliance'],
    id: 'ASKING-GEN-1760819583458-8',
  },
  {
    question:
      'While preparing for a major operating system upgrade across the company, you need to identify which endpoints are running an outdated OS version. How would you accomplish this using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Deploy a script with the Deploy module to update OS versions',
      },
      {
        id: 'b',
        text: "Query the 'Operating System Version' sensor in the Interact module",
      },
      {
        id: 'c',
        text: 'Generate a report in the Reports module based on OS inventory',
      },
      {
        id: 'd',
        text: 'Use the Trends module to visualize endpoints with older OS versions',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Choice B (Query the 'Operating System Version' sensor in the Interact module) is the most direct and efficient way to identify endpoints with outdated OS versions, providing real-time data across the enterprise. Choice A is incorrect because deploying a script does not identify or report on OS versions, it enforces a change. Choice C is incorrect as generating a report is less immediate and may not easily identify specific outdated versions. Choice D is incorrect because Trends focuses on data over time and is less suited for identifying specific, current operating system versions.",
    tags: ['Interact-module', 'Operating-System-Version-sensor', 'OS-upgrade', 'real-time-data'],
    id: 'ASKING-GEN-1760819583458-9',
  },
  {
    question:
      "To enhance endpoint security, you're tasked with ensuring all company devices have antivirus software installed. Which Tanium feature would best enable you to confirm the installation status across the network?",
    choices: [
      {
        id: 'a',
        text: 'Set a compliance policy in the Comply module for antivirus installation',
      },
      {
        id: 'b',
        text: 'Deploy antivirus software universally using the Deploy module',
      },
      {
        id: 'c',
        text: "Ask about 'Installed Applications' in the Interact module and filter for antivirus",
      },
      {
        id: 'd',
        text: 'Analyze historical installation data in the Trends module',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Choice C (Ask about 'Installed Applications' in the Interact module and filter for antivirus) is correct because it directly queries current installation status across all devices for immediate verification. Choice A is incorrect because setting a compliance policy does not verify current installation status. Choice B is incorrect as deploying software does not provide information on what is already installed. Choice D is incorrect because analyzing historical data does not offer a current view of installation status across the network.",
    tags: ['Interact-module', 'Installed-Applications', 'antivirus-software', 'endpoint-security'],
    id: 'ASKING-GEN-1760819583458-10',
  },
  {
    question:
      "You're tasked with identifying which endpoints are running Windows 10 within your network to plan an upgrade to Windows 11. Your objective is to get this information quickly and accurately. Which method should you use?",
    choices: [
      {
        id: 'a',
        text: 'Use the Deploy module to initiate an OS upgrade script',
      },
      {
        id: 'b',
        text: 'Navigate to the Asset module to filter for Windows 10 devices',
      },
      {
        id: 'c',
        text: "Ask a question in the Interact module using the 'Operating System' sensor",
      },
      {
        id: 'd',
        text: 'Configure the Trends module to track Windows 10 usage over time',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module using the 'Operating System' sensor is correct because it allows for real-time querying of endpoint operating systems, quickly identifying Windows 10 machines. Choice A (Deploy) is incorrect because it's used for executing actions, not for querying data. Choice B (Asset) is incorrect as it might not provide real-time data. Choice D (Trends) is incorrect because it visualizes data over time rather than providing an immediate list of endpoints.",
    tags: ['interact-module', 'operating-system-sensor', 'windows-upgrade', 'real-time-queries'],
    id: 'ASKING-GEN-1760819657789-1',
  },
  {
    question:
      'During a compliance audit, you need to verify if all desktops in your organization have a specific application installed. How can you efficiently gather this information using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Create a new sensor in the Author module to detect the application',
      },
      {
        id: 'b',
        text: "Utilize the 'Installed Applications' sensor in the Interact module",
      },
      {
        id: 'c',
        text: 'Deploy a script via the Deploy module to check for the application',
      },
      {
        id: 'd',
        text: 'Review historical application data in the Trends module',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Utilizing the 'Installed Applications' sensor in the Interact module is correct because it allows for querying all endpoints about installed applications in real-time, which is efficient for compliance checks. Choice A (Author) is incorrect because creating a new sensor is unnecessary when an existing sensor meets the requirement. Choice C (Deploy) is incorrect as it's meant for executing actions, not for information gathering. Choice D (Trends) is incorrect because it provides historical data visualization, not real-time compliance auditing.",
    tags: [
      'interact-module',
      'compliance-audit',
      'installed-applications-sensor',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760819657789-2',
  },
  {
    question:
      "You're investigating a potential security breach and need to quickly determine the last logged-in user on all endpoints in a specific subnet. Which approach will provide you with the fastest results?",
    choices: [
      {
        id: 'a',
        text: 'Configure a new dashboard in the Trends module for user login analysis',
      },
      {
        id: 'b',
        text: 'Execute a script via the Deploy module to report last logged-in users',
      },
      {
        id: 'c',
        text: "Ask a question using the 'Last Logged In User' sensor in the Interact module",
      },
      {
        id: 'd',
        text: 'Create a report in the Connect module focusing on user login events',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question using the 'Last Logged In User' sensor in the Interact module is correct because it provides real-time information on user logins across endpoints, which is crucial for a swift security investigation. Choice A (Trends) is incorrect because it's focused on historical data analysis. Choice B (Deploy) is incorrect as it involves action execution rather than direct querying. Choice D (Connect) is incorrect because it's meant for exporting data to external systems, not for immediate querying.",
    tags: [
      'interact-module',
      'last-logged-in-user-sensor',
      'security-investigation',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760819657789-3',
  },
  {
    question:
      'Your IT department wants to improve the efficiency of identifying outdated software on endpoints to mitigate vulnerabilities. What is the most effective way to achieve this using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Schedule a recurring job in the Deploy module to update software',
      },
      {
        id: 'b',
        text: "Use the 'Installed Applications' sensor in the Interact module for real-time data",
      },
      {
        id: 'c',
        text: 'Analyze historical software data in the Trends module',
      },
      {
        id: 'd',
        text: 'Export installed software reports using the Connect module',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Installed Applications' sensor in the Interact module for real-time data is correct because it allows the IT department to quickly identify and address vulnerabilities by knowing which software versions are installed. Choice A (Deploy) is incorrect as its main function is to execute actions, not for data querying. Choice C (Trends) is incorrect because it visualizes historical data, which might not reflect the current software status. Choice D (Connect) is incorrect because it focuses on data export for external analysis, not immediate action.",
    tags: [
      'interact-module',
      'vulnerability-mitigation',
      'installed-applications-sensor',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760819657789-4',
  },
  {
    question:
      'The network team has reported intermittent connectivity issues on several endpoints. They need to know the current IP addresses of these machines for troubleshooting. How should you proceed to assist them?',
    choices: [
      {
        id: 'a',
        text: 'Direct them to the Asset module to look up endpoint inventory',
      },
      {
        id: 'b',
        text: "Ask a question in the Interact module using the 'IP Address' sensor",
      },
      {
        id: 'c',
        text: 'Initiate a network scan using the Deploy module',
      },
      {
        id: 'd',
        text: 'Generate an IP address report in the Connect module',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module using the 'IP Address' sensor is correct because it provides instantaneous, current IP address information, which is essential for resolving connectivity issues quickly. Choice A (Asset) is incorrect because, while it does contain inventory data, it might not reflect the most current IP addresses. Choice C (Deploy) is incorrect as it's used for executing actions rather than gathering information. Choice D (Connect) is incorrect because it's designed for exporting data, not for immediate troubleshooting needs.",
    tags: ['interact-module', 'ip-address-sensor', 'network-troubleshooting', 'real-time-queries'],
    id: 'ASKING-GEN-1760819657789-5',
  },
  {
    question:
      'Your organization has deployed a new security policy requiring all PCs to run antivirus software. How can you best verify compliance across all endpoints?',
    choices: [
      {
        id: 'a',
        text: 'Manually check each PC for installed antivirus software',
      },
      {
        id: 'b',
        text: 'Deploy an antivirus check script using the Deploy module',
      },
      {
        id: 'c',
        text: "Ask a question in the Interact module using the 'Installed Applications' sensor",
      },
      {
        id: 'd',
        text: 'Generate a compliance report in the Trends module',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module using the 'Installed Applications' sensor is correct because it efficiently checks for the presence of antivirus software across all endpoints, ensuring compliance with the new security policy. Choice A (Manual check) is incorrect due to its impracticality for large numbers of endpoints. Choice B (Deploy) is incorrect as it executes actions rather than queries. Choice D (Trends) is incorrect because it focuses on historical data analysis, not real-time compliance checks.",
    tags: [
      'interact-module',
      'security-policy-compliance',
      'installed-applications-sensor',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760819657789-6',
  },
  {
    question:
      'In preparation for a network upgrade, you need to assess the current operating system versions on all endpoints. Which approach offers the most efficient path to this information?',
    choices: [
      {
        id: 'a',
        text: 'Schedule a scan in the Deploy module to gather OS data',
      },
      {
        id: 'b',
        text: 'Check the Asset module for a list of operating systems',
      },
      {
        id: 'c',
        text: "Use the 'Operating System' sensor in the Interact module for a quick query",
      },
      {
        id: 'd',
        text: 'Review OS version trends in the Trends module',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Operating System' sensor in the Interact module for a quick query is correct as it allows for the immediate identification of operating system versions across all endpoints, facilitating efficient network upgrade planning. Choice A (Deploy) is incorrect because it's primarily for executing actions, not querying data. Choice B (Asset) might not offer real-time data. Choice D (Trends) provides historical trend data, which isn't the goal for a pre-upgrade assessment.",
    tags: ['interact-module', 'operating-system-sensor', 'network-upgrade', 'real-time-queries'],
    id: 'ASKING-GEN-1760819657789-7',
  },
  {
    question:
      'Following a directive to ensure all laptops are encrypted, you need to determine which ones need attention. How can you identify laptops without encryption using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Generate an encryption report in the Connect module',
      },
      {
        id: 'b',
        text: 'Ask a question in the Interact module with a custom sensor for encryption status',
      },
      {
        id: 'c',
        text: 'Configure an encryption status dashboard in the Trends module',
      },
      {
        id: 'd',
        text: 'Deploy an encryption verification tool using the Deploy module',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module with a custom sensor for encryption status is correct because it directly queries the encryption status in real-time, enabling quick identification of non-compliant laptops. Choice A (Connect) is incorrect because it's designed for data export, not live status checks. Choice C (Trends) is incorrect due to its focus on visualizing historical data. Choice D (Deploy) is incorrect because it pertains to executing actions, not querying current statuses.",
    tags: ['interact-module', 'encryption-status', 'security-compliance', 'real-time-queries'],
    id: 'ASKING-GEN-1760819657789-8',
  },
  {
    question:
      'The compliance team needs to verify if all endpoints have the latest internal security tool installed. Which method allows you to quickly gather this information?',
    choices: [
      {
        id: 'a',
        text: 'Create a compliance report in the Trends module',
      },
      {
        id: 'b',
        text: 'Deploy the security tool using the Deploy module and verify installation',
      },
      {
        id: 'c',
        text: "Ask a question in the Interact module using the 'Installed Applications' sensor",
      },
      {
        id: 'd',
        text: "Check for the security tool in the Asset module's software inventory",
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module using the 'Installed Applications' sensor is correct because it allows for real-time verification of the security tool's presence on all endpoints, efficiently ensuring compliance. Choice A (Trends) is incorrect as it shows historical trends, not current installations. Choice B (Deploy) is incorrect because while it's used for deployment, it doesn't verify existing installations. Choice D (Asset) might not provide real-time verification.",
    tags: [
      'interact-module',
      'compliance-verification',
      'installed-applications-sensor',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760819657789-9',
  },
  {
    question:
      "You've been asked to help improve network security by identifying endpoints with an outdated operating system. What's the most direct way to find this information?",
    choices: [
      {
        id: 'a',
        text: 'Analyze operating system trends in the Trends module',
      },
      {
        id: 'b',
        text: 'Deploy an OS update script through the Deploy module',
      },
      {
        id: 'c',
        text: "Use the 'Operating System' sensor in the Interact module to query for versions",
      },
      {
        id: 'd',
        text: 'Export a list of all operating systems from the Connect module',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Operating System' sensor in the Interact module to query for versions is correct because it allows for quick identification of outdated operating systems across endpoints, aiding in network security enhancements. Choice A (Trends) is incorrect as it provides historical data that may not be up-to-date. Choice B (Deploy) is incorrect because it's used for action execution, not data querying. Choice D (Connect) is incorrect because it's more about data export than immediate, actionable querying.",
    tags: ['interact-module', 'operating-system-sensor', 'network-security', 'real-time-queries'],
    id: 'ASKING-GEN-1760819657789-10',
  },
  {
    question:
      "You're tasked with verifying that all laptops in the organization are running Windows 10 or newer. Which approach would yield the most accurate results?",
    choices: [
      {
        id: 'a',
        text: 'Use the Asset module to filter endpoints by OS version',
      },
      {
        id: 'b',
        text: 'Navigate to Reports and generate a custom OS report',
      },
      {
        id: 'c',
        text: 'Construct a natural language query in the Interact module',
      },
      {
        id: 'd',
        text: 'Create a saved question in the Interact module for repeated use',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Constructing a natural language query in the Interact module is the most direct and efficient method for obtaining real-time OS version data from all laptops. Choice A (Asset) is incorrect because while it provides detailed inventory data, it's not as focused on real-time querying. Choice B (Reports) is incorrect because generating a report is less efficient for real-time data. Choice D (Create a saved question) is an effective strategy for repeated use, but initially, constructing a query provides the needed information more directly.",
    tags: ['Interact-module', 'natural-language-query', 'OS-version', 'practical-application'],
    id: 'ASKING-GEN-1760819722228-1',
  },
  {
    question:
      'A critical vulnerability has been announced, and you need to find out which endpoints have a specific application installed to assess your exposure. What is the best way to quickly gather this information?',
    choices: [
      {
        id: 'a',
        text: 'Deploy a script via the Deploy module to list installed applications',
      },
      {
        id: 'b',
        text: 'Use the Asset module to pull a report on installed applications',
      },
      {
        id: 'c',
        text: "Ask a question using the Interact module with the 'Installed Applications' sensor",
      },
      {
        id: 'd',
        text: 'Configure the Trends module to track installation trends over time',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module using the 'Installed Applications' sensor is the most efficient method to get real-time data on application installations across endpoints. Choice A (Deploy) is incorrect because it executes actions rather than queries. Choice B (Asset) provides comprehensive inventory data but may not be as real-time or targeted as required. Choice D (Trends) is incorrect because it's designed for visualizing data over time, not for immediate querying.",
    tags: [
      'Interact-module',
      'installed-applications',
      'vulnerability-assessment',
      'sensor-questions',
    ],
    id: 'ASKING-GEN-1760819722228-2',
  },
  {
    question:
      "During a security audit, you're asked to provide a list of all endpoints with their respective IP addresses and operating system versions. Which feature should you use to efficiently gather this data?",
    choices: [
      {
        id: 'a',
        text: 'Configure a dashboard in the Trends module for ongoing monitoring',
      },
      {
        id: 'b',
        text: 'Create a detailed report in the Asset module',
      },
      {
        id: 'c',
        text: "Utilize the 'IP Address' and 'Operating System' sensors in a combined query in Interact",
      },
      {
        id: 'd',
        text: 'Export data from the Connect module for external analysis',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Utilizing the 'IP Address' and 'Operating System' sensors in a combined query in Interact is the most direct way to quickly gather this specific data across all endpoints. Choice A (Trends) is incorrect because it's more suited for monitoring trends over time rather than querying specific data points. Choice B (Asset) provides comprehensive inventory information but is less efficient for this specific query. Choice D (Connect) is designed for exporting data to external systems, not for direct querying within Tanium.",
    tags: ['Interact-module', 'IP-address', 'operating-system', 'sensor-questions'],
    id: 'ASKING-GEN-1760819722228-3',
  },
  {
    question:
      'You need to optimize a frequently asked question in Tanium to reduce its response time and load on the network. What best practice should you follow?',
    choices: [
      {
        id: 'a',
        text: "Increase the question's timeout settings to allow more time for responses",
      },
      {
        id: 'b',
        text: 'Narrow the scope of the question using more specific sensor parameters',
      },
      {
        id: 'c',
        text: 'Ask the question during off-peak hours to reduce network congestion',
      },
      {
        id: 'd',
        text: 'Save the question with a broad scope to ensure all possible data points are captured',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Best Practices',
    explanation:
      "Narrowing the scope of the question using more specific sensor parameters is the best practice to optimize performance, as it reduces the amount of data being processed and transmitted. Choice A (Increase timeout settings) might allow more time for responses but does not reduce the load. Choice C (Ask during off-peak hours) could reduce network congestion but doesn't improve the question's efficiency. Choice D (Save with a broad scope) would likely increase the response time and load, contrary to the goal of optimization.",
    tags: [
      'question-optimization',
      'sensor-parameters',
      'performance-improvement',
      'best-practices',
    ],
    id: 'ASKING-GEN-1760819722228-4',
  },
  {
    question:
      'Your team is planning to upgrade all computers within the organization to the latest operating system version. To prepare, you need to identify which computers are currently running an outdated version. Which sensor should you use in Tanium to find this information quickly?',
    choices: [
      {
        id: 'a',
        text: 'Computer Model',
      },
      {
        id: 'b',
        text: 'Operating System',
      },
      {
        id: 'c',
        text: 'Installed Applications',
      },
      {
        id: 'd',
        text: 'Last Logged In User',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "The 'Operating System' sensor is the correct choice to quickly identify the current OS version on all computers, which will help determine which ones are outdated. Choice A (Computer Model) provides hardware information but not OS version details. Choice C (Installed Applications) would list applications but not the OS version. Choice D (Last Logged In User) provides user account information, which is not relevant to identifying OS versions.",
    tags: ['Interact-module', 'operating-system', 'OS-upgrade', 'sensor-usage'],
    id: 'ASKING-GEN-1760819722228-5',
  },
  {
    question:
      'You have been asked to ensure that all endpoints are compliant with a new security policy which requires a specific configuration in the firewall settings. Which approach would you use in Tanium to verify compliance across all endpoints?',
    choices: [
      {
        id: 'a',
        text: 'Run a compliance scan using the Compliance module',
      },
      {
        id: 'b',
        text: 'Ask a real-time question in the Interact module about firewall settings',
      },
      {
        id: 'c',
        text: 'Deploy a configuration script using the Deploy module',
      },
      {
        id: 'd',
        text: 'Create a report in the Asset module detailing firewall configurations',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Asking a real-time question in the Interact module about firewall settings is the most efficient way to verify compliance with the new security policy across all endpoints. Choice A (Compliance module) is designed for assessing compliance but is more structured and may not offer the immediate, customizable insight of the Interact module. Choice C (Deploy) is incorrect because it's used for changing configurations rather than verifying them. Choice D (Asset module) provides inventory data but isn't tailored for real-time compliance checks on specific settings.",
    tags: ['Interact-module', 'security-policy', 'firewall-settings', 'compliance-verification'],
    id: 'ASKING-GEN-1760819722228-6',
  },
  {
    question:
      'A recent security breach investigation requires you to quickly identify all endpoints that accessed a specific malicious domain over the last 30 days. Which Tanium module will provide you with the fastest access to this information?',
    choices: [
      {
        id: 'a',
        text: 'Use Trends to analyze historical access data',
      },
      {
        id: 'b',
        text: 'Query endpoints in real-time with the Interact module',
      },
      {
        id: 'c',
        text: 'Review logs in the Trace module for domain access',
      },
      {
        id: 'd',
        text: 'Export network access logs using the Connect module',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      'Querying endpoints in real-time with the Interact module is the most effective way to identify recent access to a specific domain, as it allows for direct, ad-hoc questioning of endpoint activities. Choice A (Trends) is useful for analyzing patterns over time but may not offer the immediate, detailed insight required. Choice C (Trace) provides detailed forensic data, which could be relevant but is not the most direct method for this query. Choice D (Connect) is focused on exporting data rather than querying endpoint activities.',
    tags: ['Interact-module', 'real-time-query', 'security-breach', 'domain-access'],
    id: 'ASKING-GEN-1760819722228-7',
  },
  {
    question:
      'After deploying a new software, you need to confirm it has been installed across all targeted endpoints. Which Tanium feature should you use to verify the software installation?',
    choices: [
      {
        id: 'a',
        text: 'Check the deployment status in the Deploy module',
      },
      {
        id: 'b',
        text: "Use the 'Installed Applications' sensor in the Interact module",
      },
      {
        id: 'c',
        text: 'Create a new software report in the Asset module',
      },
      {
        id: 'd',
        text: 'Monitor installation trends in the Trends module',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Installed Applications' sensor in the Interact module is the most accurate method for verifying software installation in real-time across all targeted endpoints. Choice A (Deploy module) can indicate deployment status but doesn't confirm actual installation. Choice C (Asset module) provides a comprehensive inventory but may not be as up-to-date. Choice D (Trends module) is more about observing trends over time than verifying specific installations.",
    tags: [
      'Interact-module',
      'installed-applications',
      'software-verification',
      'real-time-checks',
    ],
    id: 'ASKING-GEN-1760819722228-8',
  },
  {
    question:
      'You need to gather information on the last time each endpoint received an update. Which sensor in Tanium would provide this information most effectively?',
    choices: [
      {
        id: 'a',
        text: 'Last User Login',
      },
      {
        id: 'b',
        text: 'Operating System Build',
      },
      {
        id: 'c',
        text: 'Last Update Time',
      },
      {
        id: 'd',
        text: 'BIOS Version',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "The 'Last Update Time' sensor in Tanium directly provides the information required to understand when each endpoint last received an update, making it the most effective choice. Choice A (Last User Login) indicates when a user last logged in, not when the system was updated. Choice B (Operating System Build) could show the OS version but not the specific time of the last update. Choice D (BIOS Version) gives BIOS information, which is unrelated to software updates.",
    tags: ['Interact-module', 'last-update-time', 'system-updates', 'sensor-usage'],
    id: 'ASKING-GEN-1760819722228-9',
  },
  {
    question:
      "To streamline your operational tasks, you're interested in automating the process of checking for unauthorized software installations weekly. What is the best approach for setting up this automated check in Tanium?",
    choices: [
      {
        id: 'a',
        text: 'Schedule a weekly deployment in the Deploy module to uninstall unauthorized software',
      },
      {
        id: 'b',
        text: "Create a recurring saved question in the Interact module for the 'Installed Applications' sensor",
      },
      {
        id: 'c',
        text: 'Configure the Asset module to automatically alert for new installations',
      },
      {
        id: 'd',
        text: 'Utilize the Trends module to monitor installation patterns regularly',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Best Practices',
    explanation:
      "Creating a recurring saved question in the Interact module for the 'Installed Applications' sensor is the best approach to automatically check for unauthorized software installations on a weekly basis. This method directly queries endpoint data for real-time accuracy and automation. Choice A (Deploy) is more about response action rather than proactive querying. Choice C (Asset) could track installations but doesn't offer the same level of automation for specific checks. Choice D (Trends) is useful for observing patterns over time but lacks the specificity for automated checks on unauthorized installations.",
    tags: ['Interact-module', 'automated-checks', 'unauthorized-software', 'best-practices'],
    id: 'ASKING-GEN-1760819722228-10',
  },
  {
    question:
      "You're tasked with identifying outdated software on all employee laptops to mitigate security risks. Which Tanium module and feature should you use to gather this information efficiently?",
    choices: [
      {
        id: 'a',
        text: "Interact module using the 'Installed Applications' sensor",
      },
      {
        id: 'b',
        text: 'Comply module to run compliance checks against known vulnerabilities',
      },
      {
        id: 'c',
        text: 'Deploy module to update software across endpoints',
      },
      {
        id: 'd',
        text: 'Asset module to manually review installed applications',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Interact using the 'Installed Applications' sensor is correct because it allows you to query all endpoints for a list of installed software, identifying which versions are out of date. Choice B (Comply) is incorrect because it focuses on compliance and vulnerabilities, not directly on software versions. Choice C (Deploy) is incorrect because it's used for taking action, not for querying data. Choice D (Asset) is incorrect because manual review is not efficient for this scale.",
    tags: [
      'interact-module',
      'installed-applications-sensor',
      'software-inventory',
      'security-risks',
    ],
    id: 'ASKING-GEN-1760819783700-1',
  },
  {
    question:
      'To improve incident response times, you need to quickly identify which endpoints are running a specific, vulnerable version of an application. What is the best approach using Tanium?',
    choices: [
      {
        id: 'a',
        text: "Use the 'Installed Applications' sensor with specific version parameters in Interact",
      },
      {
        id: 'b',
        text: 'Deploy a script via the Deploy module to each endpoint for version verification',
      },
      {
        id: 'c',
        text: 'Create a custom sensor in Trace to monitor application versions',
      },
      {
        id: 'd',
        text: 'Configure Asset to alert on specified software versions',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Installed Applications' sensor with version parameters in Interact is the best approach because it allows for efficient, real-time querying of endpoint data to identify specific application versions. Choice B (Deploy) is incorrect as it involves unnecessary script deployment for a task that can be accomplished with a query. Choice C (Trace) is incorrect because Trace is used for historical data and live tracking, not for querying static details. Choice D (Asset) is incorrect because, while Asset can track installed software, it's not as direct or efficient for this specific query as using Interact.",
    tags: [
      'interact-module',
      'installed-applications-sensor',
      'incident-response',
      'vulnerable-applications',
    ],
    id: 'ASKING-GEN-1760819783700-2',
  },
  {
    question:
      'You receive a directive to verify the operating system versions across the organization to ensure they meet the latest compliance standards. Which Tanium feature would you utilize to accomplish this?',
    choices: [
      {
        id: 'a',
        text: 'Deploy custom scripts using Deploy to gather OS data',
      },
      {
        id: 'b',
        text: "Use the 'Operating System' sensor in Interact for real-time data",
      },
      {
        id: 'c',
        text: 'Review Asset for historical operating system data',
      },
      {
        id: 'd',
        text: 'Configure Connect to import OS version data from an external database',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Operating System' sensor in Interact for real-time data is the most efficient and direct method for verifying OS versions across the organization. Choice A (Deploy) is incorrect because deploying custom scripts is more complex and less efficient for this task. Choice C (Asset) is incorrect because Asset may not provide the real-time data needed for immediate compliance verification. Choice D (Connect) is incorrect because importing data from an external database is not as direct or real-time as querying endpoints directly.",
    tags: ['interact-module', 'operating-system-sensor', 'compliance-standards', 'real-time-data'],
    id: 'ASKING-GEN-1760819783700-3',
  },
  {
    question:
      'After a security breach, you need to find all endpoints that have SSH enabled. Which approach will yield the fastest and most accurate results?',
    choices: [
      {
        id: 'a',
        text: 'Run a compliance check in Comply for SSH configurations',
      },
      {
        id: 'b',
        text: "Query endpoints using the 'Listening Ports' sensor in Interact",
      },
      {
        id: 'c',
        text: 'Deploy a configuration script via Deploy to disable SSH',
      },
      {
        id: 'd',
        text: 'Manually check endpoints listed in the Asset module',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Querying endpoints using the 'Listening Ports' sensor in Interact is the most efficient method to find all endpoints with SSH enabled, as it provides real-time, accurate data on open ports. Choice A (Comply) is incorrect because compliance checks are more about measuring against standards, not identifying specific service configurations. Choice C (Deploy) is incorrect because deploying a script to disable SSH doesn't help identify which systems had it enabled. Choice D (Asset) is incorrect because manual checks are time-consuming and not feasible for real-time data gathering.",
    tags: ['interact-module', 'listening-ports-sensor', 'security-breach', 'SSH-configuration'],
    id: 'ASKING-GEN-1760819783700-4',
  },
  {
    question:
      "You are planning to enhance your network's security by identifying all devices that lack the latest antivirus version. Which sensor in Interact would you primarily use for this purpose?",
    choices: [
      {
        id: 'a',
        text: 'Compliance Status',
      },
      {
        id: 'b',
        text: 'Installed Applications detailed',
      },
      {
        id: 'c',
        text: 'Antivirus Status',
      },
      {
        id: 'd',
        text: 'Software Inventory',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "The 'Installed Applications detailed' sensor in Interact is the best choice for identifying devices without the latest antivirus version, as it can provide detailed information on all software, including versions, installed on endpoints. Choice A (Compliance Status) is incorrect because it generally provides a pass or fail status against defined compliance checks, not specific version details. Choice C (Antivirus Status) might seem correct but typically provides status (enabled/disabled) rather than detailed version info. Choice D (Software Inventory) is a broader sensor that might not offer the detailed version data needed for this task.",
    tags: [
      'interact-module',
      'installed-applications-sensor',
      'antivirus-version',
      'network-security',
    ],
    id: 'ASKING-GEN-1760819783700-5',
  },
  {
    question:
      'Your team needs to audit the use of administrative privileges across the network. Which sensor would you utilize in Interact to identify users logged in with admin rights?',
    choices: [
      {
        id: 'a',
        text: 'User Privileges',
      },
      {
        id: 'b',
        text: 'Logged in Users',
      },
      {
        id: 'c',
        text: 'Administrator Check',
      },
      {
        id: 'd',
        text: 'User Account Details',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "The 'User Privileges' sensor in Interact is specifically designed to audit and report on the privilege level of users, including whether they are logged in with administrative rights. Choice B (Logged in Users) is incorrect because it reports on which users are logged in but not their privilege levels. Choice C (Administrator Check) sounds plausible but isn't a specific sensor in Tanium. Choice D (User Account Details) provides broader details on user accounts, not specifically on the privilege level.",
    tags: ['interact-module', 'user-privileges-sensor', 'administrative-rights', 'network-audit'],
    id: 'ASKING-GEN-1760819783700-6',
  },
  {
    question:
      "You've been asked to ensure all endpoints are running Windows 10 version 1903 or later. Which sensor query in Interact will accurately return this information?",
    choices: [
      {
        id: 'a',
        text: 'Windows Version',
      },
      {
        id: 'b',
        text: 'Operating System',
      },
      {
        id: 'c',
        text: 'OS Details',
      },
      {
        id: 'd',
        text: 'Windows 10 Version Check',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "The 'OS Details' sensor in Interact is the most suitable for determining if endpoints are running a specific version of Windows 10, as it provides comprehensive information about the operating system, including the version number. Choice A (Windows Version) provides a version, but not with the specificity needed. Choice B (Operating System) gives the OS type but not the detailed version. Choice D (Windows 10 Version Check) is not a standard sensor name in Tanium, making it a less accurate option.",
    tags: ['interact-module', 'OS-details-sensor', 'Windows-10-version', 'endpoint-compliance'],
    id: 'ASKING-GEN-1760819783700-7',
  },
  {
    question:
      'In preparation for a company-wide audit, you need to collect data on all installed software and hardware configurations across endpoints. Which Tanium feature should you use for a comprehensive overview?',
    choices: [
      {
        id: 'a',
        text: "Deploy the 'Hardware Inventory' sensor through Interact",
      },
      {
        id: 'b',
        text: 'Use Asset for a detailed endpoint inventory report',
      },
      {
        id: 'c',
        text: "Query 'Installed Applications' and 'Hardware Details' sensors separately in Interact",
      },
      {
        id: 'd',
        text: 'Configure Comply to generate a compliance report on hardware and software',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Using Asset for a detailed endpoint inventory report is the most comprehensive and efficient approach for collecting data on installed software and hardware configurations, as it is specifically designed for asset management and inventory tracking. Choice A (Deploy the 'Hardware Inventory' sensor through Interact) and Choice C (Query 'Installed Applications' and 'Hardware Details' sensors separately in Interact) are less efficient as they involve querying individual sensors. Choice D (Comply) is incorrect because it focuses on compliance status, not inventory detail.",
    tags: ['asset-module', 'endpoint-inventory', 'installed-software', 'hardware-configurations'],
    id: 'ASKING-GEN-1760819783700-8',
  },
  {
    question:
      'Your company is transitioning to remote work and needs to ensure all remote employees have encrypted hard drives. What is the most direct way to verify this using Tanium?',
    choices: [
      {
        id: 'a',
        text: "Query the 'BitLocker Status' sensor in Interact",
      },
      {
        id: 'b',
        text: 'Deploy a script via Deploy module to check encryption status',
      },
      {
        id: 'c',
        text: 'Check the Asset module for hardware encryption capabilities',
      },
      {
        id: 'd',
        text: 'Create a custom sensor in Protect to monitor encryption status',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    category: 'Practical Scenarios',
    explanation:
      "Querying the 'BitLocker Status' sensor in Interact is the most direct and efficient way to verify that remote employees have encrypted hard drives, providing real-time status information. Choice B (Deploy) is less efficient for this specific verification as it involves unnecessary scripting. Choice C (Asset) might offer hardware capability data but won't confirm if encryption is actively enabled. Choice D (Protect) involves more complexity than necessary for simply verifying encryption status.",
    tags: ['interact-module', 'BitLocker-status-sensor', 'remote-work', 'drive-encryption'],
    id: 'ASKING-GEN-1760819783700-9',
  },
];

export default generatedQuestions;
