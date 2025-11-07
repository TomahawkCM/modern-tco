import { Difficulty, type Question, QuestionCategory, TCODomain } from '@/types/exam';

/**
 * AI-Generated Questions
 *
 * Domain: asking_questions
 * Difficulty: advanced
 * Count: 39
 * Generated: 2025-10-18T20:45:56.464Z
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedQuestions: Question[] = [
  {
    question:
      'As part of a compliance initiative, your team needs to identify all endpoints running an out-of-date version of a specific application. This task requires not only pinpointing the exact version number but also determining which machines are non-compliant, across thousands of endpoints. Your goal is to accomplish this with minimal impact on network and endpoint performance. Which approach would best achieve this objective?',
    choices: [
      {
        id: 'a',
        text: 'Construct a detailed question using the Interact module with a sensor that checks for the specific application and version.',
      },
      {
        id: 'b',
        text: 'Use the Deploy module to run a script on all endpoints that reports back the application version.',
      },
      {
        id: 'c',
        text: 'Create a saved question in the Interact module that frequently checks for the application version on all endpoints.',
      },
      {
        id: 'd',
        text: 'Leverage the Trends module to visualize endpoints with the application and manually check for version compliance.',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Choice A is correct because it utilizes the Interact module's capability to ask real-time, targeted questions using sensors, minimizing performance impact by avoiding unnecessary data collection and network traffic. Choice B (Deploy) is incorrect because running scripts on all endpoints can be intrusive and less efficient for simple data collection tasks. Choice C (Saved question) is incorrect because frequently checking all endpoints without need can adversely affect network and endpoint performance. Choice D (Trends) is incorrect because while it can visualize data, it does not directly facilitate the identification of non-compliant versions without prior data gathering.",
    tags: [
      'interact-module',
      'application-version-check',
      'compliance-initiative',
      'sensor-questions',
      'network-performance',
    ],
    id: 'ASKING-GEN-1760815170848-1',
  },
  {
    question:
      'As a security analyst, you are tasked with identifying all endpoints that are running an outdated version of a proprietary software. Your company has over 10,000 endpoints globally. Which approach should you take to gather this information efficiently?',
    choices: [
      {
        id: 'a',
        text: "Use the Interact module to ask a question using the 'Installed Applications' sensor",
      },
      {
        id: 'b',
        text: 'Manually check each endpoint using remote desktop tools',
      },
      {
        id: 'c',
        text: 'Deploy a script across all endpoints to report software versions',
      },
      {
        id: 'd',
        text: 'Consult the company’s asset management database',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the Interact module with the 'Installed Applications' sensor is correct because it allows you to efficiently query all endpoints for software versions in real-time. Choice B is incorrect due to being impractical and time-consuming for such a large number of endpoints. Choice C is incorrect because deploying scripts is more suited for actions, not for efficient data gathering. Choice D is incorrect because the asset management database might not have up-to-the-minute data for all endpoints.",
    tags: ['interact-module', 'installed-applications-sensor', 'efficiency', 'real-time-queries'],
    id: 'ASKING-GEN-1760820148267-1',
  },
  {
    question:
      "Your organization is facing compliance issues with unpatched operating systems. You need to quickly find out which endpoints are running an unpatched version of Windows 10. What's the best way to achieve this?",
    choices: [
      {
        id: 'a',
        text: "Query the 'OS Version' sensor in the Interact module",
      },
      {
        id: 'b',
        text: 'Use the Trends module to analyze historical patching data',
      },
      {
        id: 'c',
        text: 'Export OS version data from the Asset module',
      },
      {
        id: 'd',
        text: 'Send an email to all users asking them to report their OS version',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Querying the 'OS Version' sensor in the Interact module is correct because it allows you to quickly assess the patch level of Windows 10 across all endpoints. Choice B is incorrect as Trends is better suited for analyzing historical data over time, not for real-time compliance checks. Choice C is incorrect because the Asset module may not provide the granularity needed for patch-level compliance. Choice D is incorrect because relying on user reports is inefficient and unreliable for compliance purposes.",
    tags: ['interact-module', 'os-version-sensor', 'compliance', 'real-time-queries'],
    id: 'ASKING-GEN-1760820148267-2',
  },
  {
    question:
      'In preparation for an audit, you need to verify that all company laptops have encryption enabled. Which approach should you utilize to confirm this across thousands of endpoints?',
    choices: [
      {
        id: 'a',
        text: 'Deploy a custom script to check encryption status on each endpoint',
      },
      {
        id: 'b',
        text: "Ask a question using the 'BitLocker Status' sensor in the Interact module",
      },
      {
        id: 'c',
        text: "Review each laptop's configuration manually",
      },
      {
        id: 'd',
        text: 'Generate a report from the Asset module detailing laptop configurations',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question using the 'BitLocker Status' sensor in the Interact module is correct as it allows for efficient, real-time verification of encryption status across all laptops. Choice A is inefficient for checking a single configuration aspect across thousands of endpoints. Choice C is impractical and not feasible due to the large number of laptops. Choice D, while useful for asset management, may not offer the real-time or detailed encryption status data required for audit preparation.",
    tags: [
      'interact-module',
      'bitlocker-status-sensor',
      'encryption-verification',
      'audit-preparation',
    ],
    id: 'ASKING-GEN-1760820148267-3',
  },
  {
    question:
      'Your team is investigating a security breach and needs to identify endpoints that communicated with a known malicious IP address over the past week. What is the most effective way to gather this information?',
    choices: [
      {
        id: 'a',
        text: 'Analyze firewall logs manually for connections to the IP address',
      },
      {
        id: 'b',
        text: "Use the Interact module to ask about 'Network Connections' sensor data",
      },
      {
        id: 'c',
        text: 'Deploy network monitoring tools on all endpoints',
      },
      {
        id: 'd',
        text: 'Consult the historical data in the Trends module for network activities',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the Interact module to ask about 'Network Connections' sensor data is the most effective approach as it allows for real-time querying of endpoints for specific IP connections. Choice A, while viable, is less efficient as it involves manual log analysis. Choice C is not practical for immediate needs and involves significant setup. Choice D might not have the granularity or the immediacy required to identify specific IP address communications.",
    tags: [
      'interact-module',
      'network-connections-sensor',
      'security-breach-investigation',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760820148267-4',
  },
  {
    question:
      'During a compliance audit, you are asked to provide a list of all endpoints with a specific, non-compliant configuration setting. What is the most effective method to collect this information?',
    choices: [
      {
        id: 'a',
        text: "Manually check each endpoint's configuration",
      },
      {
        id: 'b',
        text: 'Use the Asset module to generate a report based on known configurations',
      },
      {
        id: 'c',
        text: 'Ask a question using a relevant sensor in the Interact module',
      },
      {
        id: 'd',
        text: 'Send out a survey to all employees to report their configuration settings',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      'Asking a question using a relevant sensor in the Interact module is the most effective method as it allows for immediate, real-time querying of endpoint configurations across the enterprise. Choice A is highly impractical for a large number of endpoints. Choice B, while useful for asset management, may not provide the real-time or detailed compliance data required. Choice D is unreliable and inefficient for gathering accurate configuration settings.',
    tags: ['interact-module', 'compliance-audit', 'configuration-check', 'real-time-queries'],
    id: 'ASKING-GEN-1760820148267-5',
  },
  {
    question:
      'You suspect that a recent security update is causing system instability on several endpoints. How can you quickly determine which endpoints have the update installed?',
    choices: [
      {
        id: 'a',
        text: "Review the patch management system's deployment history",
      },
      {
        id: 'b',
        text: "Use the Interact module to ask about the 'Installed Updates' sensor",
      },
      {
        id: 'c',
        text: 'Manually log into each suspected endpoint to check installed updates',
      },
      {
        id: 'd',
        text: 'Consult the system administrators to provide a list of updated endpoints',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the Interact module to ask about the 'Installed Updates' sensor is the most efficient way to quickly determine which endpoints have the specific update, as it allows for real-time querying across all endpoints. Choice A could provide some information but lacks the immediacy and may not be up-to-date. Choice C is too time-consuming and not practical for a large number of endpoints. Choice D relies on others and might delay the investigation.",
    tags: [
      'interact-module',
      'installed-updates-sensor',
      'system-instability',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760820148267-6',
  },
  {
    question:
      'You are planning a software upgrade across the organization and need to ensure that all endpoints meet the minimum hardware requirements. What is the fastest way to ascertain this information?',
    choices: [
      {
        id: 'a',
        text: 'Send an email to all users asking them to self-report their hardware specs',
      },
      {
        id: 'b',
        text: "Use the Interact module to ask questions using the 'Hardware Details' sensor",
      },
      {
        id: 'c',
        text: 'Manually inspect each endpoint for hardware specifications',
      },
      {
        id: 'd',
        text: 'Review the reports in the Asset module for hardware inventory',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the Interact module to ask questions using the 'Hardware Details' sensor is the fastest and most efficient method to check hardware specifications across all endpoints in real-time. Choice A is unreliable and may not provide accurate information. Choice C is impractical due to the time and effort required for a large number of endpoints. Choice D might not provide the most up-to-date information or the specific details needed for the software upgrade.",
    tags: ['interact-module', 'hardware-details-sensor', 'software-upgrade', 'real-time-queries'],
    id: 'ASKING-GEN-1760820148267-7',
  },
  {
    question:
      'Your company is implementing a strict data protection policy, and you need to ensure no endpoints are running unauthorized cloud storage software. Which approach should you use to identify violations?',
    choices: [
      {
        id: 'a',
        text: 'Conduct physical inspections of all endpoints',
      },
      {
        id: 'b',
        text: "Use the Interact module to query the 'Installed Applications' sensor",
      },
      {
        id: 'c',
        text: 'Implement network traffic monitoring to detect cloud storage usage',
      },
      {
        id: 'd',
        text: 'Send a compliance questionnaire to all employees',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the Interact module to query the 'Installed Applications' sensor is the most direct and efficient method to identify any unauthorized cloud storage software installed on endpoints across the organization. Choice A is highly impractical and disruptive. Choice C, while useful for monitoring ongoing usage, may not effectively identify already installed applications. Choice D is not reliable for ensuring compliance across all endpoints.",
    tags: [
      'interact-module',
      'installed-applications-sensor',
      'data-protection-policy',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760820148267-8',
  },
  {
    question:
      "Following a directive to reduce software licensing costs, you are tasked with identifying unused software that can be uninstalled. What's the most effective way to find software that hasn't been used in over 90 days?",
    choices: [
      {
        id: 'a',
        text: 'Ask the Finance department for recent software usage reports',
      },
      {
        id: 'b',
        text: 'Deploy a usage tracking tool on all endpoints',
      },
      {
        id: 'c',
        text: "Use the Interact module to query the 'Software Usage' sensor",
      },
      {
        id: 'd',
        text: 'Manually inspect each endpoint for last used dates on applications',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the Interact module to query the 'Software Usage' sensor is the most efficient and accurate way to identify software that hasn’t been used in over 90 days across all endpoints. Choice A may not provide the detailed, endpoint-specific usage data needed. Choice B involves unnecessary complexity and deployment time. Choice D is impractical for a large number of endpoints and would take an excessive amount of time.",
    tags: [
      'interact-module',
      'software-usage-sensor',
      'licensing-costs-reduction',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760820148267-9',
  },
  {
    question:
      "You're tasked with ensuring all devices are compliant with the latest security policies, specifically that all endpoints have firewall enabled. Which method should you employ to verify compliance?",
    choices: [
      {
        id: 'a',
        text: 'Review network security policies and firewall configurations manually',
      },
      {
        id: 'b',
        text: "Query the 'Firewall Status' sensor in the Interact module",
      },
      {
        id: 'c',
        text: 'Send out a compliance checklist to all department heads',
      },
      {
        id: 'd',
        text: 'Check the compliance module for endpoints non-compliance reports',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Querying the 'Firewall Status' sensor in the Interact module is the most direct and efficient way to verify that all endpoints have their firewalls enabled in compliance with the latest security policies. Choice A is time-consuming and not scalable. Choice C relies on self-reporting and does not ensure the accuracy needed for security compliance. Choice D, while useful for tracking compliance, may not provide the immediate or detailed real-time status of firewall enablement.",
    tags: [
      'interact-module',
      'firewall-status-sensor',
      'security-policy-compliance',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760820148267-10',
  },
  {
    question:
      'As the IT compliance officer, you are tasked with ensuring all laptops within your organization are running Windows 10 or newer. You need to gather this information from 3,000 endpoints scattered globally. Which approach will yield the most accurate results?',
    choices: [
      {
        id: 'a',
        text: 'Use the Asset module to check the operating system of each device',
      },
      {
        id: 'b',
        text: "Utilize the Interact module with a 'Get Operating System' sensor",
      },
      {
        id: 'c',
        text: 'Export a list of endpoints from the Deploy module and manually check each one',
      },
      {
        id: 'd',
        text: 'Ask the IT department to send a survey to all employees asking for their OS version',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      'Interact is correct because it allows for real-time querying of endpoint data using natural language, providing the most accurate and timely results. Choice A (Asset) is incorrect because, while it can provide this information, it may not be as real-time as Interact. Choice C (Deploy) is incorrect because Deploy is used for executing changes, not for querying data. Choice D (survey) is highly impractical and unlikely to yield accurate technical data.',
    tags: ['interact-module', 'OS-verification', 'real-time-queries', 'sensor-questions'],
    id: 'ASKING-GEN-1760820222236-1',
  },
  {
    question:
      "Your organization is undergoing a software audit and you've been asked to provide a list of all installed applications on endpoints within specific IP range. Which module and feature should you use to efficiently gather this information?",
    choices: [
      {
        id: 'a',
        text: 'Deploy module to execute a script that gathers installed applications',
      },
      {
        id: 'b',
        text: "Interact module with a custom question using the 'Installed Applications' sensor",
      },
      {
        id: 'c',
        text: 'Connect module to create a data export of applications from previously gathered data',
      },
      {
        id: 'd',
        text: 'Asset module to filter endpoints by IP range and review stored applications data',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Interact is correct because it allows custom questions tailored to specific requirements such as IP range and installed applications sensor for real-time data retrieval. Choice A (Deploy) is incorrect because it's primarily for executing actions rather than querying data. Choice C (Connect) is incorrect because while it can export data, it may not provide the real-time, targeted data needed for an audit. Choice D (Asset) can provide this information but may not offer the same level of custom querying flexibility as Interact.",
    tags: [
      'interact-module',
      'installed-applications-sensor',
      'custom-questions',
      'software-audit',
    ],
    id: 'ASKING-GEN-1760820222236-2',
  },
  {
    question:
      'During a security incident, you need to quickly identify all endpoints that have a specific, unauthorized application installed. Which step should you take first to accomplish this using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Create a new package in the Deploy module to uninstall the application',
      },
      {
        id: 'b',
        text: "Use the Interact module to ask a question using the 'Installed Applications' sensor with the application name",
      },
      {
        id: 'c',
        text: 'Set up a new Connect workflow to alert on the presence of the application across endpoints',
      },
      {
        id: 'd',
        text: 'Leverage the Trends module to analyze historical installation data',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Interact is correct because it provides the ability to ask real-time questions across the network using specific sensors like 'Installed Applications', quickly identifying unauthorized software. Choice A (Deploy) is premature as it assumes all endpoints need the application uninstalled without first identifying those affected. Choice C (Connect) is not the first step in an incident response scenario focused on identification. Choice D (Trends) is for analyzing trends over time, not for real-time identification.",
    tags: [
      'security-incident-response',
      'interact-module',
      'installed-applications-sensor',
      'real-time-identification',
    ],
    id: 'ASKING-GEN-1760820222236-3',
  },
  {
    question:
      'To optimize the performance of your Tanium deployment, you need to reduce the load on the network caused by frequent questions. Which best practice should you follow when constructing questions in the Interact module?',
    choices: [
      {
        id: 'a',
        text: 'Ask broad questions to gather as much data as possible in a single query',
      },
      {
        id: 'b',
        text: 'Use specific, targeted questions to minimize the data returned',
      },
      {
        id: 'c',
        text: 'Increase the timeout setting for questions to allow more time for responses',
      },
      {
        id: 'd',
        text: 'Limit questions to those that can be answered by offline endpoints',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Using specific, targeted questions is correct because it minimizes the amount of data being transferred, reducing network load and improving performance. Choice A (broad questions) is incorrect because it would increase the network load by gathering unnecessary data. Choice C (increasing timeout) would not affect network load and could lead to longer wait times for results. Choice D (limiting to offline endpoints) is impractical as most questions require real-time data from online endpoints.',
    tags: [
      'question-construction-best-practices',
      'interact-module',
      'performance-optimization',
      'network-load-reduction',
    ],
    id: 'ASKING-GEN-1760820222236-4',
  },
  {
    question:
      'You are working on documenting the network security posture and need to know the operating systems versions across all endpoints. Which type of sensor question in the Interact module would provide this information most effectively?',
    choices: [
      {
        id: 'a',
        text: 'A broad question asking for all installed software',
      },
      {
        id: 'b',
        text: "A question using the 'Operating System' sensor with no specific parameters",
      },
      {
        id: 'c',
        text: 'A detailed question targeting each known operating system version',
      },
      {
        id: 'd',
        text: 'A saved question from a previous similar inquiry, if available',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "A question using the 'Operating System' sensor with no specific parameters is correct as it directly targets the data needed without overcomplicating the query. Choice A (all installed software) is incorrect because it would return excessive, irrelevant data, complicating analysis. Choice C (targeting each version) is inefficient compared to a single sensor that can return all necessary data. Choice D (using a saved question) might be effective but assumes a prior, exactly relevant question exists; it does not represent a primary strategy.",
    tags: [
      'operating-system-sensor',
      'real-time-queries',
      'interact-module',
      'network-security-posture',
    ],
    id: 'ASKING-GEN-1760820222236-5',
  },
  {
    question:
      'In preparation for an upcoming audit, you need to verify the patch status of a critical application across all endpoints. Given the importance of accuracy and timeliness, which question should you pose in the Interact module?',
    choices: [
      {
        id: 'a',
        text: 'Has the latest critical patch been installed on all endpoints?',
      },
      {
        id: 'b',
        text: 'What is the current version of the critical application on each endpoint?',
      },
      {
        id: 'c',
        text: 'List all installed patches on each endpoint.',
      },
      {
        id: 'd',
        text: 'How many endpoints are missing the latest critical patch?',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Asking for the current version of the critical application on each endpoint is correct because it provides specific, actionable data relevant to verifying compliance with the audit's requirements. Choice A (has the patch been installed) is too binary and lacks the detail needed for an audit. Choice C (list all installed patches) may provide too much irrelevant information, and Choice D (how many are missing the patch) assesses impact but doesn't identify specific non-compliant endpoints.",
    tags: [
      'interact-module',
      'audit-preparation',
      'critical-application-patching',
      'question-construction-best-practices',
    ],
    id: 'ASKING-GEN-1760820222236-6',
  },
  {
    question:
      "You've been tasked with improving the response time for questions asked in the Interact module across a global network of 10,000 endpoints. Which of the following strategies should you prioritize to achieve this goal?",
    choices: [
      {
        id: 'a',
        text: 'Increase the number of concurrent questions allowed within the system settings',
      },
      {
        id: 'b',
        text: 'Optimize question syntax to be as specific and targeted as possible',
      },
      {
        id: 'c',
        text: 'Deploy additional Tanium servers in various geographical regions',
      },
      {
        id: 'd',
        text: 'Encourage users to ask more questions to improve system caching',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Optimizing question syntax to be specific and targeted is correct because it ensures that questions are efficiently processed, reducing load and improving response times. Choice A (increasing concurrent questions) could exacerbate system load, potentially worsening performance. Choice C (deploying additional servers) may help but is a more complex and costly solution. Choice D (encouraging more questions) is incorrect as increased load without strategic optimization would likely degrade performance.',
    tags: [
      'question-performance-optimization',
      'interact-module',
      'efficient-question-syntax',
      'global-network-management',
    ],
    id: 'ASKING-GEN-1760820222236-7',
  },
  {
    question:
      'After a recent update to your Tanium platform, you notice that saved questions in the Interact module are not returning expected results. What is the most effective first step to troubleshoot this issue?',
    choices: [
      {
        id: 'a',
        text: 'Recreate all saved questions from scratch to ensure compatibility with the new version',
      },
      {
        id: 'b',
        text: 'Check the Tanium knowledge base for known issues related to the update',
      },
      {
        id: 'c',
        text: 'Directly modify the underlying sensor expressions used by the saved questions',
      },
      {
        id: 'd',
        text: 'Review the saved questions for syntax errors or deprecated sensors',
      },
    ],
    correctAnswerId: 'd',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Troubleshooting',
    explanation:
      "Reviewing the saved questions for syntax errors or deprecated sensors is the most efficient first step, as updates may affect sensor functionality or syntax compatibility. Recreating all saved questions (Choice A) is unnecessarily time-consuming without first identifying the specific issue. While checking the Tanium knowledge base (Choice B) is helpful, it's more effective after confirming the issue isn't with question construction. Modifying sensor expressions (Choice C) without understanding if they are the cause could introduce new issues.",
    tags: [
      'saved-questions-management',
      'interact-module-troubleshooting',
      'sensor-expressions',
      'update-impact-assessment',
    ],
    id: 'ASKING-GEN-1760820222236-8',
  },
  {
    question:
      'Your team needs to assess the compliance status of security policies on endpoints in a specific region. You decide to use the Interact module to gather the required data. Which best practice will ensure your question retrieves accurate and comprehensive results?',
    choices: [
      {
        id: 'a',
        text: 'Use broad questions to capture a wide range of data points',
      },
      {
        id: 'b',
        text: 'Segment the question by region using sensor parameters for targeted results',
      },
      {
        id: 'c',
        text: 'Ask separate questions for each policy to simplify data analysis',
      },
      {
        id: 'd',
        text: 'Rely on default sensors without customization to ensure standardization',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Segmenting the question by region using sensor parameters is correct because it ensures that the question is both targeted and relevant, yielding more accurate results for compliance assessment. Choice A (broad questions) risks gathering irrelevant data and increasing analysis complexity. Asking separate questions for each policy (Choice C) can fragment data and make comprehensive compliance assessment more difficult. Relying solely on default sensors (Choice D) may not capture all necessary compliance information, as customization can often provide more precise insights.',
    tags: [
      'question-construction-best-practices',
      'regional-data-segmentation',
      'interact-module',
      'compliance-assessment',
    ],
    id: 'ASKING-GEN-1760820222236-9',
  },
  {
    question:
      "To facilitate a more collaborative environment among your IT security team, you're encouraged to share useful Tanium questions related to endpoint security posture. What is the most effective way to share these questions within the Interact module?",
    choices: [
      {
        id: 'a',
        text: 'Email the question syntax directly to team members',
      },
      {
        id: 'b',
        text: "Use the 'Share' functionality within Interact to grant access to the question",
      },
      {
        id: 'c',
        text: 'Print out the questions and distribute them during team meetings',
      },
      {
        id: 'd',
        text: "Manually recreate the question on each team member's account",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      "Using the 'Share' functionality within Interact is the most effective way to share questions, as it grants direct access to the question within the platform, ensuring accuracy and immediate availability. Emailing syntax (Choice A) risks transcription errors and lacks integration. Printing out questions (Choice C) is impractical and does not provide interactive access. Manually recreating the question (Choice D) is inefficient and prone to inconsistencies.",
    tags: [
      'question-sharing-and-collaboration',
      'interact-module',
      'security-posture-assessment',
      'team-collaboration',
    ],
    id: 'ASKING-GEN-1760820222236-10',
  },
  {
    question:
      "As part of a compliance audit, you're tasked with identifying all endpoints running a deprecated version of a software package quickly. How would you construct your question in the Interact module to achieve this?",
    choices: [
      {
        id: 'a',
        text: 'List all installed applications and then manually filter the results.',
      },
      {
        id: 'b',
        text: "Use the 'Installed Applications' sensor with filters for the specific software and version.",
      },
      {
        id: 'c',
        text: "Ask for 'All Software' and export the results to a CSV for analysis.",
      },
      {
        id: 'd',
        text: 'Query each endpoint individually using the software package name.',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Installed Applications' sensor with specific filters for the software package and its version is the most direct and efficient approach, as it leverages Tanium's capability to return precise data in real time. Choice A is incorrect because manually filtering results is inefficient for large datasets. Choice C is incorrect because exporting to a CSV for analysis is not as efficient as filtering directly in Tanium. Choice D is incorrect because querying each endpoint individually is highly inefficient and not scalable.",
    tags: ['interact-module', 'sensor-questions', 'software-compliance', 'question-construction'],
    id: 'ASKING-GEN-1760820291790-1',
  },
  {
    question:
      "Your team is preparing for an internal audit of security tools across the organization's endpoints. You need to verify the presence of a specific antivirus software across different operating systems. Which approach best utilizes Tanium's capabilities?",
    choices: [
      {
        id: 'a',
        text: "Use the 'Installed Applications' sensor with an added condition for operating system type.",
      },
      {
        id: 'b',
        text: 'Create a saved question for each operating system, asking about the antivirus software installation.',
      },
      {
        id: 'c',
        text: 'Ask a broad question about all security software and manually sift through the results.',
      },
      {
        id: 'd',
        text: 'Export the list of all applications from the Asset module and use external tools to filter the data.',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Installed Applications' sensor with a condition for the operating system type is the most efficient method as it allows for targeted queries that return specific results across multiple OS types in real time. Choice B is incorrect because it creates unnecessary work by managing multiple saved questions. Choice C is incorrect as it requires manual data sifting, which is time-consuming. Choice D is incorrect because leveraging external tools for what Tanium can do internally is inefficient and unnecessarily complex.",
    tags: ['interact-module', 'sensor-questions', 'security-audit', 'question-construction'],
    id: 'ASKING-GEN-1760820291790-2',
  },
  {
    question:
      'In response to a recent security breach, you must quickly identify endpoints that have not rebooted in the last 30 days to apply critical patches. Which method ensures the fastest and most accurate results with Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Review the Asset module for last reboot times and sort the data.',
      },
      {
        id: 'b',
        text: "Use the 'Last Reboot' sensor in Interact with a filter for >30 days.",
      },
      {
        id: 'c',
        text: 'Deploy a script via the Deploy module to check the last reboot time.',
      },
      {
        id: 'd',
        text: "Ask for 'System Uptime' and calculate the reboot date manually for each endpoint.",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Last Reboot' sensor with a >30 days filter in the Interact module is the most direct, accurate, and efficient way to identify endpoints that meet the criteria, leveraging Tanium's real-time querying capability. Choice A is incorrect because although the Asset module contains useful information, it's not as efficient for real-time, targeted queries. Choice C is incorrect as deploying scripts is less efficient and more disruptive than querying with sensors. Choice D is incorrect because manual calculations for each endpoint are highly inefficient compared to using sensor capabilities.",
    tags: ['interact-module', 'sensor-questions', 'security-patching', 'question-optimization'],
    id: 'ASKING-GEN-1760820291790-3',
  },
  {
    question:
      "During a security incident, you're tasked with identifying which endpoints are communicating with a suspicious IP address. Which approach should you take to gather this information accurately using Tanium?",
    choices: [
      {
        id: 'a',
        text: "Query the 'Network Connections' sensor for all traffic, then manually search for the IP.",
      },
      {
        id: 'b',
        text: "Use the 'IP Address' sensor to list all IP addresses on each endpoint.",
      },
      {
        id: 'c',
        text: "Configure the 'Network Connections' sensor with a filter for the suspicious IP address.",
      },
      {
        id: 'd',
        text: 'Export network logs from the Asset module and analyze them externally.',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Configuring the 'Network Connections' sensor with a filter for the suspicious IP address is the most efficient and direct way to identify relevant endpoints, utilizing Tanium's real-time data collection and analysis capabilities. Choice A is incorrect because it involves unnecessary manual effort in sifting through all traffic. Choice B is incorrect because the 'IP Address' sensor identifies endpoint IP addresses, not external communications. Choice D is incorrect because external analysis is less efficient and bypasses Tanium's inbuilt capabilities for real-time analysis.",
    tags: ['interact-module', 'sensor-questions', 'incident-response', 'question-optimization'],
    id: 'ASKING-GEN-1760820291790-4',
  },
  {
    question:
      'After deploying a new application across the enterprise, you need to quickly verify its installation on Windows 10 machines only. What is the most efficient query construction in the Interact module for this task?',
    choices: [
      {
        id: 'a',
        text: "Use the 'Installed Applications' sensor with a filter for 'Windows 10' under operating system type.",
      },
      {
        id: 'b',
        text: "Ask for 'All Applications' and then use the results to manually check for the application on Windows 10 machines.",
      },
      {
        id: 'c',
        text: "Deploy a script to all endpoints to report back on the application's installation status.",
      },
      {
        id: 'd',
        text: "Query the 'Computer Name' and 'Installed Applications' separately, then cross-reference.",
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Installed Applications' sensor with a specific filter for 'Windows 10' under the operating system type is the most direct and efficient method for verifying the application's installation on target machines, leveraging Tanium's capability for detailed and targeted querying. Choice B is incorrect because it involves unnecessary manual effort and time. Choice C is incorrect because deploying scripts is less efficient and more intrusive compared to using a built-in sensor. Choice D is incorrect because it complicates the process by requiring manual cross-referencing of data.",
    tags: [
      'interact-module',
      'sensor-questions',
      'application-verification',
      'question-construction',
    ],
    id: 'ASKING-GEN-1760820291790-6',
  },
  {
    question:
      "You're tasked with improving the speed of query responses within the Tanium environment. Which approach to question construction in the Interact module is most effective for this goal?",
    choices: [
      {
        id: 'a',
        text: 'Ask questions using broad sensors and later narrow down the results.',
      },
      {
        id: 'b',
        text: 'Utilize specific sensors and apply filters to refine your questions.',
      },
      {
        id: 'c',
        text: 'Schedule regular queries throughout the day to distribute the load.',
      },
      {
        id: 'd',
        text: 'Increase the number of saved questions for repeated use.',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Utilizing specific sensors and applying filters to refine your questions is the most effective method for improving query response times. This approach ensures that only relevant data is queried, reducing the load on the network and endpoints. Choice A is incorrect because broad questions can overwhelm endpoints and the network with unnecessary data. Choice C is incorrect because while distributing the load is helpful, it does not inherently speed up individual query responses. Choice D is incorrect because increasing the number of saved questions does not directly impact the speed of query responses.',
    tags: [
      'interact-module',
      'question-performance-optimization',
      'sensor-questions',
      'best-practices',
    ],
    id: 'ASKING-GEN-1760820291790-7',
  },
  {
    question:
      'Your organization requires a weekly report of all endpoints that have not been updated to the latest operating system version. Which approach allows for the most efficient creation of this report using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Manually ask for the OS version of all endpoints each week.',
      },
      {
        id: 'b',
        text: "Use the 'OS Version' sensor with a filter for the latest version and save the question.",
      },
      {
        id: 'c',
        text: 'Extract all endpoint data to an external database and use SQL queries for analysis.',
      },
      {
        id: 'd',
        text: "Schedule a recurring question using the 'OS Version' sensor without any filters.",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      "Using the 'OS Version' sensor with a filter for the latest version and saving the question is the most efficient and effective method for creating this report. It utilizes Tanium's real-time capabilities and allows for automated, consistent data collection. Choice A is incorrect because it is time-consuming and prone to inconsistency. Choice C is incorrect because it involves unnecessary complexity and potential delays. Choice D is incorrect because it lacks the specificity needed for the report, requiring additional manual filtering.",
    tags: ['interact-module', 'saved-questions-management', 'reporting', 'sensor-questions'],
    id: 'ASKING-GEN-1760820291790-8',
  },
  {
    question:
      'In the wake of a cyber threat alert, you need to identify all endpoints with a specific vulnerable application installed. What is the best practice for utilizing the Interact module to locate these endpoints efficiently?',
    choices: [
      {
        id: 'a',
        text: "Query for 'Installed Applications' and apply a filter for the application name in the results page.",
      },
      {
        id: 'b',
        text: 'Run a broad question on all applications and sift through the results manually for the vulnerable application.',
      },
      {
        id: 'c',
        text: 'Use a custom sensor that directly queries for the vulnerable application by name and version.',
      },
      {
        id: 'd',
        text: 'Export a list of all applications from the Asset module and search for the vulnerable application externally.',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      "Using a custom sensor that directly queries for the vulnerable application by name and version is the most efficient approach, as it leverages Tanium's ability to gather specific information quickly and accurately. Choice A is less efficient because it requires filtering after the fact, which can be time-consuming. Choice B is incorrect due to the manual effort required to sift through possibly vast amounts of data. Choice D is incorrect because it takes the analysis outside of Tanium, which is less efficient and effective than using Tanium's built-in capabilities.",
    tags: ['interact-module', 'custom-sensors', 'vulnerability-management', 'best-practices'],
    id: 'ASKING-GEN-1760820291790-9',
  },
  {
    question:
      "You need to collaborate with your organization's compliance team to regularly review endpoints for unauthorized software installations. How should you manage and share these queries in Tanium for optimal teamwork and efficiency?",
    choices: [
      {
        id: 'a',
        text: 'Email the compliance team the query results as a CSV file weekly.',
      },
      {
        id: 'b',
        text: 'Create a shared saved question within Tanium for the compliance team to access.',
      },
      {
        id: 'c',
        text: 'Instruct the compliance team to ask you for the query results as needed.',
      },
      {
        id: 'd',
        text: 'Print and distribute hard copies of the query results to the compliance team.',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Creating a shared saved question within Tanium for the compliance team to access is the best approach for collaboration and efficiency. It allows for real-time access to data, automation of data collection, and eliminates the need for manual distribution of information. Choice A is inefficient and does not allow for real-time collaboration. Choice C is not scalable and increases the workload unnecessarily. Choice D is the least efficient method, being both environmentally unfriendly and impractical for timely updates.',
    tags: ['interact-module', 'question-sharing', 'collaboration', 'saved-questions-management'],
    id: 'ASKING-GEN-1760820291790-10',
  },
  {
    question:
      "As a security analyst, you're tasked with identifying all endpoints running a vulnerable version of software X before an upcoming audit. How would you construct a question in Tanium to find these endpoints effectively?",
    choices: [
      {
        id: 'a',
        text: "Use a basic sensor like 'Installed Applications' with the software name as a parameter.",
      },
      {
        id: 'b',
        text: 'Directly input the name of the software into the natural language query interface.',
      },
      {
        id: 'c',
        text: "Craft a compound question using the 'Installed Applications' sensor, specifying both the software name and version.",
      },
      {
        id: 'd',
        text: 'Ask a saved question from the library without modification.',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Question Construction',
    explanation:
      "Crafting a compound question using the 'Installed Applications' sensor with specific parameters for both software name and version is the most effective method to pinpoint vulnerable endpoints. Choice A is incorrect because it lacks specificity regarding the software version. Choice B is incorrect as directly inputting the software name does not leverage the full capabilities of Tanium's sensors. Choice D is incorrect because a saved question may not be tailored to the specific software and version in question.",
    tags: [
      'natural-language-query',
      'sensor-library',
      'question-construction',
      'vulnerable-software-detection',
    ],
    id: 'ASKING-GEN-1760820356262-1',
  },
  {
    question:
      'Your team needs to optimize the performance of Tanium questions to ensure minimal impact on network and endpoint resources during peak business hours. What strategy should be used when constructing questions?',
    choices: [
      {
        id: 'a',
        text: "Limit questions to use sensors tagged as 'Performance Impact: Low' only.",
      },
      {
        id: 'b',
        text: "Always include 'and' operators to narrow down the scope of questions.",
      },
      {
        id: 'c',
        text: 'Schedule heavy questions outside of peak hours and use result caching.',
      },
      {
        id: 'd',
        text: 'Ask broad questions to collect all possible data in one query.',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      "Scheduling heavy questions outside of peak hours and utilizing result caching where possible is a strategic approach to minimize network and endpoint load, ensuring that business operations are not disrupted. Choice A is incorrect because limiting to low-impact sensors might not meet the data collection needs. Choice B is incorrect as simply using 'and' operators does not inherently optimize performance. Choice D is incorrect because broad questions can significantly increase the load on endpoints and the network, contrary to the goal of optimization.",
    tags: ['question-performance', 'sensor-questions', 'result-caching', 'optimization-strategies'],
    id: 'ASKING-GEN-1760820356262-2',
  },
  {
    question:
      'When tasked with determining the cause of slow question responses in the Tanium Interact module, what initial step should you take?',
    choices: [
      {
        id: 'a',
        text: 'Check the network bandwidth between the Tanium server and endpoints.',
      },
      {
        id: 'b',
        text: 'Review the complexity and construction of the question being asked.',
      },
      {
        id: 'c',
        text: 'Increase the server resources allocated to the Tanium instance.',
      },
      {
        id: 'd',
        text: 'Immediately restart the Tanium server to clear potential bottlenecks.',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Troubleshooting',
    explanation:
      'Reviewing the complexity and construction of the question being asked is a critical first step in diagnosing slow question responses, as poorly constructed or overly complex questions can significantly impact performance. Choice A is incorrect because network bandwidth issues typically affect more than just question response times. Choice C is incorrect as increasing server resources might not address inefficiencies in question construction. Choice D is incorrect because restarting the server is a drastic action that should only be considered after other troubleshooting steps have been exhausted.',
    tags: [
      'interact-module',
      'question-construction',
      'performance-optimization',
      'troubleshooting',
    ],
    id: 'ASKING-GEN-1760820356262-3',
  },
  {
    question:
      "You're collaborating on cybersecurity threat analysis and need to share a specific question with colleagues that identifies endpoints with an outdated operating system. What is the best method to share this question for reuse and collaboration within Tanium?",
    choices: [
      {
        id: 'a',
        text: 'Export the question results as a CSV and email it to colleagues.',
      },
      {
        id: 'b',
        text: "Use the 'Save Question' feature and share the link with your team.",
      },
      {
        id: 'c',
        text: "Manually recreate the question in each colleague's Tanium account.",
      },
      {
        id: 'd',
        text: 'Instruct colleagues to independently create the same question.',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Question Sharing',
    explanation:
      "Using the 'Save Question' feature and sharing the link with your team is the most efficient and effective method for collaboration, as it ensures consistency and saves time. Choice A is incorrect because it only shares the results, not the question itself, limiting collaborative efforts. Choice C is inefficient as it requires unnecessary duplication of effort. Choice D is prone to errors or variations in question construction, leading to potentially inconsistent data collection.",
    tags: ['question-sharing', 'collaboration', 'save-question', 'cybersecurity-analysis'],
    id: 'ASKING-GEN-1760820356262-4',
  },
  {
    question:
      'In preparing for a compliance audit, you need to ensure all endpoints are running a specific, secure configuration. Which type of Tanium question would be most effective for verifying compliance across your endpoints?',
    choices: [
      {
        id: 'a',
        text: 'A broad question that covers all device configurations.',
      },
      {
        id: 'b',
        text: 'A question using a custom sensor designed to check for the specific configuration.',
      },
      {
        id: 'c',
        text: 'A general question about the most recent user login times.',
      },
      {
        id: 'd',
        text: 'Questions that only target the operating system version.',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      'Using a question that leverages a custom sensor designed to check for the specific secure configuration is the most direct and accurate method for verifying compliance, as it can precisely evaluate the configuration against the compliance requirements. Choice A is incorrect because broad questions may return excess information, making it harder to determine compliance. Choice C is irrelevant to checking for specific configurations. Choice D is too narrow, focusing only on the operating system version and not the full scope of secure configurations required for compliance.',
    tags: ['compliance-audit', 'custom-sensors', 'question-construction', 'security-configuration'],
    id: 'ASKING-GEN-1760820356262-5',
  },
  {
    question:
      'Your organization is facing issues with unauthorized software installations. You need to create a Tanium question that can identify all endpoints with a specific unauthorized application. What is the most efficient way to construct this question?',
    choices: [
      {
        id: 'a',
        text: 'Ask a broad question about all installed applications and manually sift through the results.',
      },
      {
        id: 'b',
        text: 'Create a custom sensor that specifically detects the unauthorized application.',
      },
      {
        id: 'c',
        text: "Use the 'Installed Applications' sensor with the application name as a filter.",
      },
      {
        id: 'd',
        text: 'Query for all software installations and compare them against a whitelist.',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Question Construction',
    explanation:
      "Utilizing the 'Installed Applications' sensor with the specific application name as a filter is the most direct and efficient way to identify endpoints with the unauthorized application, as it precisely targets the information needed without unnecessary data processing. Choice A is inefficient and time-consuming. Choice B, while feasible, may not be necessary if the 'Installed Applications' sensor can already accomplish the task. Choice D is overly broad and requires additional steps to compare against a whitelist, increasing complexity and effort.",
    tags: ['unauthorized-software', 'sensor-questions', 'question-efficiency', 'best-practices'],
    id: 'ASKING-GEN-1760820356262-6',
  },
  {
    question:
      "To optimize your Tanium environment for faster question responses, you decide to review commonly asked questions and their performance. You notice that questions about 'Installed Applications' across all endpoints take significantly longer to return results. How can you optimize this question for better performance?",
    choices: [
      {
        id: 'a',
        text: 'Segment the question by operating system to reduce the scope.',
      },
      {
        id: 'b',
        text: "Increase the Tanium server's hardware resources.",
      },
      {
        id: 'c',
        text: 'Ask the question during off-peak hours to reduce load.',
      },
      {
        id: 'd',
        text: 'Use a more specific sensor that targets the application of interest.',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Performance Optimization',
    explanation:
      'Segmenting the question by operating system can significantly reduce the scope and improve response times by targeting a subset of endpoints at a time, thus reducing the load and complexity of data processing. Choice B may help overall performance but does not address the inefficiency of the question itself. Choice C could reduce network load but does not improve the efficiency of the question. Choice D is also effective, but its feasibility depends on whether there is a more specific sensor available for the application of interest.',
    tags: [
      'question-performance',
      'sensor-questions',
      'operating-system-segmentation',
      'optimization-techniques',
    ],
    id: 'ASKING-GEN-1760820356262-7',
  },
  {
    question:
      'During an incident response, you need to quickly identify which endpoints have communicated with a known malicious IP address in the last 24 hours. Which approach would yield the most accurate results in Tanium?',
    choices: [
      {
        id: 'a',
        text: "Use the 'Network Connections' sensor with the malicious IP as a parameter.",
      },
      {
        id: 'b',
        text: 'Ask a broad question about all network connections and filter the results.',
      },
      {
        id: 'c',
        text: 'Deploy a script to each endpoint to check for connections to the malicious IP.',
      },
      {
        id: 'd',
        text: 'Consult the saved questions library for a similar past inquiry.',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Network Connections' sensor with the specific malicious IP as a parameter is the most direct and efficient way to identify affected endpoints. This targeted approach minimizes response time and maximizes accuracy in a critical situation. Choice B is less efficient as it involves unnecessary data processing. Choice C, while potentially effective, is more time-consuming and could delay response efforts. Choice D may not provide a question tailored specifically to the current incident and IP address.",
    tags: ['incident-response', 'malicious-IP', 'sensor-questions', 'real-time-queries'],
    id: 'ASKING-GEN-1760820356262-8',
  },
  {
    question:
      'A compliance officer needs to verify if all company laptops have encryption enabled to meet data protection regulations. What is the most efficient question construction in Tanium to achieve this?',
    choices: [
      {
        id: 'a',
        text: "Query the 'Device Type' sensor and then manually check encryption for each laptop.",
      },
      {
        id: 'b',
        text: "Use the 'Encryption Status' sensor for devices identified as laptops.",
      },
      {
        id: 'c',
        text: "Create a compound question that combines 'Device Type = Laptop' and 'Encryption Status' sensors.",
      },
      {
        id: 'd',
        text: 'Ask for all installed security applications and filter for encryption tools.',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Advanced',
    category: 'Question Construction',
    explanation:
      "Constructing a compound question that uses both the 'Device Type = Laptop' and 'Encryption Status' sensors in a single query is the most efficient method for determining compliance. This approach directly targets the specific requirement, reducing the time and steps needed to analyze the data. Choice A is inefficient as it separates the data collection into two steps. Choice B misses the critical step of identifying the device as a laptop. Choice D is indirect and may not accurately identify all laptops with encryption enabled, as it relies on identifying installed software which may not cover all encryption methods.",
    tags: [
      'compliance-verification',
      'encryption-status',
      'efficient-questioning',
      'sensor-combination',
    ],
    id: 'ASKING-GEN-1760820356262-9',
  },
];

export default generatedQuestions;
