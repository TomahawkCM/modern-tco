import { Difficulty, type Question, QuestionCategory, TCODomain } from '@/types/exam';

/**
 * AI-Generated Questions
 *
 * Domain: asking_questions
 * Difficulty: intermediate
 * Count: 44
 * Generated: 2025-10-18T20:41:28.849Z
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedQuestions: Question[] = [
  {
    question:
      "As a Tanium operator, you've been asked to quickly determine which devices on your network are running an outdated version of a specific application to mitigate a potential security vulnerability. Your network consists of 10,000 endpoints. Which approach should you take to efficiently gather this information?",
    choices: [
      {
        id: 'a',
        text: 'Use the Asset module to export a list of all applications from each endpoint and manually check versions.',
      },
      {
        id: 'b',
        text: 'Construct a natural language query in the Interact module asking for the specific application version from all endpoints.',
      },
      {
        id: 'c',
        text: 'Deploy a script via the Deploy module to check and report on the specific application version.',
      },
      {
        id: 'd',
        text: 'Create a saved question within the Interact module to periodically check for the application version.',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Constructing a natural language query in the Interact module is the most efficient method to quickly gather this information across a large number of endpoints as it leverages Tanium's real-time data collection capabilities. Choice A (Asset) is incorrect because it involves manual checking and is not as efficient for real-time data. Choice C (Deploy) is incorrect as this method is more suited for taking actions, not for querying data. Choice D (Create a saved question) is not the most immediate solution given the scenario's urgency.",
    tags: [
      'interact-module',
      'natural-language-query',
      'application-versions',
      'security-vulnerability',
    ],
    id: 'ASKING-GEN-1760815151334-1',
  },
  {
    question:
      'Your team is tasked with verifying compliance with a new security policy requiring all company laptops to have a specific security software installed. You need to identify any non-compliant devices. Which is the best approach to accomplish this using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Navigate to the Asset module and filter for devices without the security software installed.',
      },
      {
        id: 'b',
        text: 'Use the Interact module to ask if the security software is installed on each device.',
      },
      {
        id: 'c',
        text: 'Configure a new sensor in the Interact module to continuously monitor the installation of the security software.',
      },
      {
        id: 'd',
        text: "Share a saved question in Interact that checks for the security software's installation status with your team.",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Using the Interact module to ask if the security software is installed allows you to quickly identify non-compliant devices across the organization. Choice A (Asset) is incorrect because the Asset module is more for inventory management and might not offer real-time compliance data. Choice C (Configure a new sensor) is incorrect because it's more complex and time-consuming than necessary for this task. Choice D (Share a saved question) is a good practice for collaboration but doesn't directly address the immediate need to identify non-compliant devices.",
    tags: ['interact-module', 'compliance-check', 'security-software', 'real-time-queries'],
    id: 'ASKING-GEN-1760815151334-2',
  },
  {
    question:
      'While preparing for a compliance audit, you need to verify which endpoints are running an unsupported version of their operating system. What is the most efficient way to gather this information using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Navigate to the Asset module to check for operating system versions',
      },
      {
        id: 'b',
        text: 'Use the Interact module to ask a natural language query for OS versions',
      },
      {
        id: 'c',
        text: 'Create a saved question in the Interact module for future use',
      },
      {
        id: 'd',
        text: 'Export a list of all applications from the Deploy module',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Interact is correct because it enables real-time querying of endpoint data using natural language, making it the fastest way to get current OS versions. Choice A (Asset) is incorrect because, while it provides detailed inventory data, it's not as immediate as using Interact. Choice C (Create a saved question) is a valuable tool but does not directly answer the initial audit preparation need. Choice D (Export from Deploy) is incorrect because the Deploy module is used for software distribution, not for querying endpoint data.",
    tags: ['interact-module', 'natural-language-query', 'compliance-audit', 'os-versions'],
    id: 'ASKING-GEN-1760819850347-1',
  },
  {
    question:
      "Your company is undergoing a network reconfiguration, and you've been tasked with identifying all endpoints with a specific, outdated firewall application. How should you proceed to gather this information effectively in Tanium?",
    choices: [
      {
        id: 'a',
        text: 'Use the Asset module to filter endpoints based on installed applications',
      },
      {
        id: 'b',
        text: 'Ask a natural language query in the Interact module for the specific firewall application',
      },
      {
        id: 'c',
        text: 'Deploy a script via the Deploy module to list all installed applications',
      },
      {
        id: 'd',
        text: 'Create a custom sensor in the Interact module to detect the firewall application',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Interact is correct because it allows for fast, real-time querying of endpoint data, including installed applications, using natural language queries. Choice A (Asset) can provide installed application data but may not offer the immediate, targeted query capability that Interact does. Choice C (Deploy) is incorrect because while it can execute scripts, it's not the ideal choice for simply querying data. Choice D (Create a custom sensor) could potentially solve the issue but requires more time and expertise than directly asking via Interact.",
    tags: [
      'interact-module',
      'natural-language-query',
      'installed-applications',
      'network-reconfiguration',
    ],
    id: 'ASKING-GEN-1760819850347-2',
  },
  {
    question:
      'To improve endpoint security, your team decides to audit all machines running a specific version of Java. Which approach should you take to efficiently collect this information using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Query the specific Java version using a saved question in the Interact module',
      },
      {
        id: 'b',
        text: 'Export a report of installed applications from the Asset module',
      },
      {
        id: 'c',
        text: 'Utilize the Trends module to create a dashboard for Java versions',
      },
      {
        id: 'd',
        text: 'Directly navigate to the Reports module and generate a new report for Java installations',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      'A saved question in the Interact module is correct because it allows for quick, efficient querying of endpoints for specific software versions, including Java. Choice B (Asset) provides a comprehensive view of installed applications but lacks the immediacy and direct querying capabilities of Interact. Choice C (Trends) is useful for visualizing data over time but not for the immediate, targeted querying required for a security audit. Choice D (Reports) can generate detailed reports but is more cumbersome for quick, targeted queries than using a saved question.',
    tags: ['interact-module', 'saved-questions', 'software-versions', 'endpoint-security'],
    id: 'ASKING-GEN-1760819850347-3',
  },
  {
    question:
      'During a major incident response, you need to quickly determine which endpoints are communicating with a known malicious IP address. What is the most effective way to use Tanium to identify these endpoints?',
    choices: [
      {
        id: 'a',
        text: 'Configure a new alert in the Threat Response module for the IP address',
      },
      {
        id: 'b',
        text: 'Ask a real-time sensor question in the Interact module for connections to the IP address',
      },
      {
        id: 'c',
        text: 'Review network activity reports in the Asset module',
      },
      {
        id: 'd',
        text: 'Use the Connect module to search for the IP address in collected data',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      'Asking a real-time sensor question in the Interact module is the most effective way to quickly identify endpoints communicating with a malicious IP, as it allows for immediate querying of live endpoint data. Choice A (Threat Response) is more focused on configuring alerts for detection, not immediate querying. Choice C (Asset) provides detailed network and inventory data but not in real-time. Choice D (Connect) is used for data integration and export, not for live endpoint querying.',
    tags: ['interact-module', 'real-time-queries', 'incident-response', 'malicious-IP-address'],
    id: 'ASKING-GEN-1760819850347-4',
  },
  {
    question:
      'You are tasked with optimizing the performance of Tanium questions to reduce load on your network. Which strategy would best achieve this without sacrificing the quality of your endpoint data?',
    choices: [
      {
        id: 'a',
        text: 'Limit the scope of your questions to target only relevant endpoints',
      },
      {
        id: 'b',
        text: 'Increase the question timeout settings to reduce network congestion',
      },
      {
        id: 'c',
        text: 'Use broad, non-specific questions to gather as much data as possible in one query',
      },
      {
        id: 'd',
        text: 'Rely exclusively on the Asset module for endpoint data collection',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Best Practices',
    explanation:
      'Limiting the scope of your questions to target only the relevant endpoints is effective for optimizing question performance because it reduces unnecessary network traffic and processing load. Choice B (Increase timeout settings) could potentially reduce concurrent loads but might lead to longer wait times and does not optimize the question itself. Choice C (Use broad questions) would likely increase network and endpoint load, contrary to the goal. Choice D (Rely on Asset) ignores the capabilities of real-time querying and optimization strategies available in the Interact module.',
    tags: [
      'question-performance',
      'network-optimization',
      'targeted-queries',
      'endpoint-data-quality',
    ],
    id: 'ASKING-GEN-1760819850347-5',
  },
  {
    question:
      'Your organization needs to ensure compliance with a new data protection regulation that requires all endpoints to have encryption software installed. How would you use Tanium to verify compliance across all endpoints?',
    choices: [
      {
        id: 'a',
        text: 'Generate a compliance report using the Compliance module',
      },
      {
        id: 'b',
        text: 'Ask a question in the Interact module about the presence of encryption software',
      },
      {
        id: 'c',
        text: 'Deploy encryption software to non-compliant endpoints using the Deploy module',
      },
      {
        id: 'd',
        text: 'Create a dashboard in the Trends module to track encryption software installations over time',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module about the presence of encryption software is the most direct and efficient way to verify compliance, as it allows for real-time querying of endpoint data. Choice A (Compliance) is useful for ongoing compliance management but may not offer the immediate, direct querying capability. Choice C (Deploy) assumes non-compliance and doesn't verify the current state. Choice D (Trends) is beneficial for monitoring trends over time but doesn't provide the real-time compliance status.",
    tags: [
      'interact-module',
      'compliance-verification',
      'encryption-software',
      'real-time-querying',
    ],
    id: 'ASKING-GEN-1760819850347-6',
  },
  {
    question:
      'To streamline IT operations, you want to create a list of all endpoints that have not rebooted in the last 30 days. Which Tanium feature should you use to efficiently gather this information?',
    choices: [
      {
        id: 'a',
        text: 'Configure a scheduled report in the Reports module to track uptime',
      },
      {
        id: 'b',
        text: 'Ask a natural language question in the Interact module for system uptime',
      },
      {
        id: 'c',
        text: 'Use the Asset module to filter endpoints by last reboot date',
      },
      {
        id: 'd',
        text: 'Set up an alert in the Threat Response module for endpoints with long uptimes',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a natural language question in the Interact module for system uptime is the most efficient way to identify endpoints that haven't rebooted in the last 30 days, due to its capability for real-time, targeted querying. Choice A (Reports) can provide historical data but is not as immediate or flexible for specific queries. Choice C (Asset) provides detailed inventory information but might not offer the same level of query flexibility and immediacy. Choice D (Threat Response) is focused on security incidents and not suited for operational queries like system uptime.",
    tags: ['system-uptime', 'interact-module', 'natural-language-query', 'IT-operations'],
    id: 'ASKING-GEN-1760819850347-7',
  },
  {
    question:
      "You've been asked to assess the risk of outdated software on your network. Which approach allows you to efficiently identify all endpoints with software versions that are no longer supported?",
    choices: [
      {
        id: 'a',
        text: 'Navigate to the Asset module and manually check software versions',
      },
      {
        id: 'b',
        text: 'Create a custom sensor in the Interact module to detect outdated software',
      },
      {
        id: 'c',
        text: 'Ask a saved question in the Interact module that targets software versions',
      },
      {
        id: 'd',
        text: 'Utilize the Vulnerability Management module to scan for outdated software',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      'Asking a saved question in the Interact module that targets software versions is an efficient way to identify endpoints with unsupported software, as it allows for the direct querying of specific information across numerous endpoints quickly. Choice A (Asset) provides detailed inventory information but might not be as efficient for targeting specific unsupported software versions. Choice B (Create a custom sensor) could be effective but requires additional time and expertise. Choice D (Vulnerability Management) focuses more on vulnerabilities than on the presence of specific software versions.',
    tags: ['interact-module', 'saved-questions', 'outdated-software', 'risk-assessment'],
    id: 'ASKING-GEN-1760819850347-8',
  },
  {
    question:
      'You need to quickly determine the primary user of each endpoint in your environment for a software license audit. What is the most effective way to accomplish this using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Check the user login history in the Asset module',
      },
      {
        id: 'b',
        text: 'Ask a real-time question in the Interact module for the last logged-in user',
      },
      {
        id: 'c',
        text: 'Export user data from the Connect module to analyze externally',
      },
      {
        id: 'd',
        text: 'Review user session data in the Threat Response module',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a real-time question in the Interact module for the last logged-in user is the most effective way to quickly determine the primary user of each endpoint, as it allows for immediate, targeted querying across the environment. Choice A (Asset) offers detailed endpoint data but lacks the immediacy of Interact. Choice C (Connect) is designed for data integration and export, not quick querying. Choice D (Threat Response) focuses on security analysis, which doesn't directly apply to a software license audit.",
    tags: ['interact-module', 'real-time-queries', 'software-license-audit', 'last-logged-in-user'],
    id: 'ASKING-GEN-1760819850347-9',
  },
  {
    question:
      "In response to a security alert, you need to find all endpoints that have both specific vulnerable software installed and are running an outdated operating system version. What's the best way to use Tanium to identify these endpoints?",
    choices: [
      {
        id: 'a',
        text: 'Combine two saved questions in the Interact module, one for the software and one for the OS version',
      },
      {
        id: 'b',
        text: 'Use the Vulnerability Management module to generate a report combining both criteria',
      },
      {
        id: 'c',
        text: 'Ask a single, complex question in the Interact module that includes both conditions',
      },
      {
        id: 'd',
        text: 'Create a custom dashboard in the Trends module to monitor both vulnerabilities over time',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a single, complex question in the Interact module that includes both conditions (vulnerable software and outdated OS version) is the best way to efficiently identify affected endpoints, as it leverages Tanium's ability to handle complex queries in real-time. Choice A (Combine two saved questions) is less efficient as it requires correlating data from separate queries. Choice B (Vulnerability Management) can identify vulnerabilities but might not allow for the specific, combined query. Choice D (Trends) is useful for monitoring but not for immediate identification in response to an alert.",
    tags: [
      'interact-module',
      'security-alert',
      'vulnerable-software',
      'outdated-os',
      'complex-queries',
    ],
    id: 'ASKING-GEN-1760819850347-10',
  },
  {
    question:
      'As part of your security audit, you need to verify that all endpoints are running a firewall. To do this, you decide to leverage Tanium to query the status across your network. Which approach ensures an accurate and comprehensive result?',
    choices: [
      {
        id: 'a',
        text: 'Use the Deploy module to enforce firewall policies',
      },
      {
        id: 'b',
        text: 'Use a saved question in the Interact module that checks for firewall status',
      },
      {
        id: 'c',
        text: "Navigate to the Asset module to manually check each endpoint's compliance status",
      },
      {
        id: 'd',
        text: 'Create a custom sensor in the Interact module to query firewall status',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      'Using a saved question in the Interact module that checks for firewall status is correct because it allows for real-time querying of endpoint states using predefined logic, ensuring both speed and accuracy. Choice A is incorrect because the Deploy module is intended for executing actions, not for querying state. Choice C is incorrect because the Asset module, while useful for inventory, does not offer the real-time query capabilities of Interact. Choice D is incorrect because creating a custom sensor might be unnecessary when a suitable sensor already exists in the sensor library.',
    tags: ['interact-module', 'firewall-status', 'saved-questions', 'sensor-library'],
    id: 'ASKING-GEN-1760819924197-1',
  },
  {
    question:
      'You are tasked with optimizing the performance of Tanium questions to ensure they return results within 10 seconds, even in a large environment with over 10,000 endpoints. What is the best practice for constructing your Tanium question?',
    choices: [
      {
        id: 'a',
        text: 'Ask broad questions to gather comprehensive data for analysis',
      },
      {
        id: 'b',
        text: 'Utilize specific, targeted sensors available in the sensor library',
      },
      {
        id: 'c',
        text: 'Include multiple sensors in one question to reduce the number of questions asked',
      },
      {
        id: 'd',
        text: 'Ask questions in natural language without specifying sensors',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Best Practices',
    explanation:
      'Utilizing specific, targeted sensors from the sensor library is correct because it reduces the amount of data to be processed and returned, thereby improving question performance. Choice A is incorrect because broad questions can increase processing time and load, leading to longer response times. Choice C is incorrect because including multiple sensors in one question might increase processing time rather than reduce it. Choice D is incorrect because asking questions without specifying sensors can lead to ambiguous results and increased processing time due to the need for Tanium to interpret the query.',
    tags: ['question-performance', 'sensor-library', 'question-construction', 'best-practices'],
    id: 'ASKING-GEN-1760819924197-2',
  },
  {
    question:
      "Your company's policy requires all desktops to run antivirus software. You've been asked to verify compliance across 3,000 endpoints. Which sensor query in the Interact module would you use to effectively gather this information?",
    choices: [
      {
        id: 'a',
        text: 'List all installed applications and filter for antivirus software manually',
      },
      {
        id: 'b',
        text: "Query endpoints for 'Is Antivirus Active' sensor",
      },
      {
        id: 'c',
        text: "Check the 'Operating System' sensor for security features",
      },
      {
        id: 'd',
        text: "Use the 'Computer Name' sensor to identify desktops first",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Querying endpoints for the 'Is Antivirus Active' sensor is correct because it directly answers the question of whether antivirus software is active on each endpoint, providing a straightforward and efficient way to verify compliance. Choice A is incorrect because it involves unnecessary manual filtering. Choice C is incorrect because the 'Operating System' sensor does not provide information on antivirus software. Choice D is incorrect because the 'Computer Name' sensor identifies desktops but does not provide information on antivirus software status.",
    tags: ['interact-module', 'antivirus-compliance', 'sensor-questions', 'real-time-queries'],
    id: 'ASKING-GEN-1760819924197-3',
  },
  {
    question:
      'You are collaborating with the network team to troubleshoot a suspected network segment issue affecting client communication with Tanium. They require a quick assessment of IP addresses for all endpoints in the affected segment. Which sensor would be most appropriate to use for an immediate query?',
    choices: [
      {
        id: 'a',
        text: "Use the 'Computer Name' sensor",
      },
      {
        id: 'b',
        text: "Use the 'IP Address' sensor",
      },
      {
        id: 'c',
        text: "Use the 'Installed Applications' sensor",
      },
      {
        id: 'd',
        text: "Use the 'Operating System' sensor",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'IP Address' sensor is correct because it directly queries for the information required by the network team, providing a quick and accurate assessment of the IP addresses for all endpoints in the specified network segment. Choice A is incorrect because the Computer Name provides identification but not IP address information. Choice C is incorrect because Installed Applications does not provide network-related information. Choice D is incorrect because the Operating System sensor, while important, does not directly provide IP address data.",
    tags: ['interact-module', 'network-troubleshooting', 'ip-address-query', 'sensor-questions'],
    id: 'ASKING-GEN-1760819924197-4',
  },
  {
    question:
      'To enhance security measures, your organization requires a monthly audit of operating system versions across all endpoints. You are tasked with setting up this recurring audit using Tanium. What is the most efficient way to automate this process?',
    choices: [
      {
        id: 'a',
        text: "Manually ask a question using the 'Operating System' sensor every month",
      },
      {
        id: 'b',
        text: "Create a saved question using the 'Operating System' sensor and schedule a monthly report",
      },
      {
        id: 'c',
        text: 'Use the Deploy module to install a reporting tool on endpoints',
      },
      {
        id: 'd',
        text: "Schedule a script through the Connect module to query the 'Operating System' sensor monthly",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Best Practices',
    explanation:
      "Creating a saved question using the 'Operating System' sensor and scheduling a monthly report is correct because it automates the process, ensuring consistency and accuracy in the audit without manual intervention each month. Choice A is incorrect because it requires manual effort each month, which is not efficient. Choice C is incorrect because the Deploy module's purpose is to execute actions, not to generate reports. Choice D is incorrect because while the Connect module can automate data transfer processes, the practice of setting up a saved question and automated reporting is more direct and efficient for this purpose.",
    tags: ['saved-questions', 'operating-system-audit', 'scheduling-reports', 'best-practices'],
    id: 'ASKING-GEN-1760819924197-5',
  },
  {
    question:
      'During a compliance check, you discover that several endpoints are not reporting their installed software inventory accurately. You need to determine whether this is due to an issue with the endpoints or the query being used. What is the best first step to troubleshoot this issue?',
    choices: [
      {
        id: 'a',
        text: 'Reboot the endpoints to refresh their state',
      },
      {
        id: 'b',
        text: 'Verify the syntax and logic of the question being used',
      },
      {
        id: 'c',
        text: 'Immediately use the Deploy module to reinstall the Tanium client',
      },
      {
        id: 'd',
        text: 'Manually check the software inventory on a few endpoints for verification',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Troubleshooting',
    explanation:
      'Verifying the syntax and logic of the question being used is correct because errors in question construction can lead to inaccurate or incomplete data being returned. This step ensures that the issue is not due to how the question is asked before investigating potential endpoint issues. Choice A is incorrect because rebooting the endpoints does not address potential issues with the question itself. Choice C is incorrect because reinstalling the Tanium client is a more drastic step that should be taken only if client issues are confirmed. Choice D is incorrect because manual checks are time-consuming and do not directly address potential issues with the question logic.',
    tags: ['troubleshooting', 'question-construction', 'software-inventory', 'compliance-check'],
    id: 'ASKING-GEN-1760819924197-6',
  },
  {
    question:
      'Your organization is planning to deploy a new application across all Windows 10 endpoints. Before deployment, you need to ensure that a prerequisite application is installed on these endpoints. Which query would most effectively confirm the presence of this prerequisite application?',
    choices: [
      {
        id: 'a',
        text: "Ask 'Get Installed Applications' filtered by 'Operating System' for Windows 10",
      },
      {
        id: 'b',
        text: "Ask 'List all applications' and manually search for the prerequisite application",
      },
      {
        id: 'c',
        text: "Use the 'Computer Name' sensor to list all Windows 10 devices first",
      },
      {
        id: 'd',
        text: "Directly query 'Is [Prerequisite Application] Installed' on all endpoints",
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking 'Get Installed Applications' filtered by 'Operating System' for Windows 10 is correct because it directly targets the endpoints of interest and checks for the specific application, making the process efficient and accurate. Choice B is incorrect because manually searching through all listed applications is time-consuming and prone to error. Choice C is incorrect because listing all Windows 10 devices does not verify the installation of the prerequisite application. Choice D is incorrect because creating a direct query for '[Prerequisite Application] Installed' might not be feasible if a specific sensor for the application does not exist.",
    tags: ['interact-module', 'application-deployment', 'windows-10', 'installed-applications'],
    id: 'ASKING-GEN-1760819924197-7',
  },
  {
    question:
      'In preparation for an upcoming security audit, you need to quickly identify endpoints that are missing critical security patches. What is the most efficient way to use Tanium to accomplish this task?',
    choices: [
      {
        id: 'a',
        text: "Manually check each endpoint's patch level in the Asset module",
      },
      {
        id: 'b',
        text: "Use the 'Patch List' sensor to identify missing patches across endpoints",
      },
      {
        id: 'c',
        text: 'Deploy a script via the Deploy module to check for missing patches',
      },
      {
        id: 'd',
        text: 'Create a dashboard in the Trends module to track patch levels over time',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Patch List' sensor to identify missing patches across endpoints is correct because it allows for a real-time, centralized view of patch compliance, enabling quick identification of vulnerabilities. Choice A is incorrect because manually checking each endpoint's patch level is inefficient and not scalable. Choice C is incorrect because deploying a script to check for missing patches, while potentially effective, is more time-consuming and complex than using an existing sensor. Choice D is incorrect because creating a dashboard tracks patch levels over time but does not offer the immediate identification of missing patches needed for an urgent security audit.",
    tags: ['interact-module', 'security-audit', 'patch-management', 'real-time-queries'],
    id: 'ASKING-GEN-1760819924197-8',
  },
  {
    question:
      'After deploying a new security tool via Tanium, you need to verify that it has been installed successfully on all targeted endpoints. Which approach will give you the most immediate and accurate results?',
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
        text: 'Review the Action History in the Deploy module for success rates',
      },
      {
        id: 'd',
        text: 'Email the users to confirm installation',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Installed Applications' sensor in the Interact module is correct because it provides a real-time verification of the software's presence on each endpoint, ensuring that the deployment has been successful. Choice A is incorrect because while the Deploy module shows deployment status, it does not confirm successful installation or presence of the software on the endpoint. Choice C is incorrect because reviewing the Action History for success rates indicates deployment progress but may not verify actual installation success. Choice D is incorrect because relying on user confirmation is inefficient and may not accurately reflect installation success across all endpoints.",
    tags: [
      'interact-module',
      'software-verification',
      'installed-applications',
      'deployment-validation',
    ],
    id: 'ASKING-GEN-1760819924197-9',
  },
  {
    question:
      'Your team needs to assess the usage of a specific software application across the enterprise to decide on renewing its license. You are responsible for gathering data on how often the application is used. Which question construction in the Interact module would provide the most relevant data?',
    choices: [
      {
        id: 'a',
        text: "Ask for 'Installed Applications' to see if the application is present on endpoints",
      },
      {
        id: 'b',
        text: "Use the 'Application Usage' sensor to determine how frequently the application is used",
      },
      {
        id: 'c',
        text: "Query the 'Computer Name' sensor to identify endpoints for manual follow-up",
      },
      {
        id: 'd',
        text: "Check 'Operating System' versions to ensure compatibility with the software",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Application Usage' sensor to determine how frequently the application is used is correct because it specifically measures application usage frequency, providing the exact data needed for the license renewal decision. Choice A is incorrect because knowing the application is installed does not provide data on usage frequency. Choice C is incorrect because identifying endpoints via the 'Computer Name' sensor does not yield information on application usage. Choice D is incorrect because checking 'Operating System' versions addresses compatibility, not usage frequency.",
    tags: ['interact-module', 'application-usage', 'license-management', 'sensor-questions'],
    id: 'ASKING-GEN-1760819924197-10',
  },
  {
    question:
      "You're tasked with identifying all endpoints that haven’t been rebooted in the last 30 days for a routine maintenance check. Which approach ensures the most accurate and immediate results?",
    choices: [
      {
        id: 'a',
        text: 'Use the Asset module to filter endpoints based on last boot time',
      },
      {
        id: 'b',
        text: 'Craft a natural language question in the Interact module asking for system uptime',
      },
      {
        id: 'c',
        text: 'Deploy a script via the Management module to report system uptime',
      },
      {
        id: 'd',
        text: 'Schedule a report in the Reporting module for system reboots',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Crafting a question in the Interact module using natural language to ask for system uptime ensures you get real-time, accurate data across all endpoints. Choice A (Asset) is incorrect because Asset might not have up-to-the-minute data on system reboots. Choice C (Management) is incorrect because it's primarily used for enforcing configurations, not querying current state. Choice D (Reporting) is incorrect because it is used for generating reports from existing data, which may not be real-time or accurate for this purpose.",
    tags: ['interact-module', 'natural-language-query', 'system-uptime', 'practical-application'],
    id: 'ASKING-GEN-1760819995280-1',
  },
  {
    question:
      'During a compliance audit, you need to quickly find out which endpoints do not have a specific software application installed. What is the most efficient way to gather this information?',
    choices: [
      {
        id: 'a',
        text: 'Use the Patch module to see which patches are missing',
      },
      {
        id: 'b',
        text: 'Ask a saved question in the Interact module about installed applications',
      },
      {
        id: 'c',
        text: 'Create a new sensor in the Authoring module to detect the software',
      },
      {
        id: 'd',
        text: 'Run a report in the Trends module on software installations',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a saved question in the Interact module about installed applications allows for immediate and specific insight into which endpoints are missing the software, leveraging the vast sensor library without needing to create new ones. Choice A (Patch) is incorrect because it's focused on patching status, not software installations. Choice C (Authoring) is incorrect because it requires time to develop and test a new sensor, which is not efficient for immediate needs. Choice D (Trends) is incorrect because it provides historical data analysis, not real-time compliance status.",
    tags: ['interact-module', 'compliance-audit', 'installed-applications', 'sensor-library'],
    id: 'ASKING-GEN-1760819995280-2',
  },
  {
    question:
      "You're investigating a network performance issue and suspect a large number of endpoints might be running an outdated network driver. How would you identify these endpoints efficiently?",
    choices: [
      {
        id: 'a',
        text: 'Query the Asset module for endpoints with outdated network drivers',
      },
      {
        id: 'b',
        text: 'Use the Deploy module to update network drivers on all endpoints',
      },
      {
        id: 'c',
        text: 'Craft a question in the Interact module for the network driver version',
      },
      {
        id: 'd',
        text: 'Look up the network driver in the Software Catalog module',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Crafting a question in the Interact module for the network driver version allows for quick, targeted identification of endpoints with outdated drivers by using real-time data. Choice A (Asset) is incorrect because it might not have the most current information on driver versions. Choice B (Deploy) is incorrect because updating drivers without identifying which need it can be inefficient and disruptive. Choice D (Software Catalog) is incorrect because it's more about managing known applications and not for querying endpoint specifics.",
    tags: ['interact-module', 'network-performance', 'driver-version', 'efficiency'],
    id: 'ASKING-GEN-1760819995280-3',
  },
  {
    question:
      'In preparation for a security audit, you need to verify that all company laptops are encrypted. Which method allows you to gather this information most effectively?',
    choices: [
      {
        id: 'a',
        text: 'Run a report in the Trends module on encryption status',
      },
      {
        id: 'b',
        text: 'Deploy an action using the Management module to enforce encryption',
      },
      {
        id: 'c',
        text: 'Ask a question in the Interact module about the encryption status of the disk',
      },
      {
        id: 'd',
        text: 'Check the Compliance module for encryption policy adherence',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      'Asking a question in the Interact module about the encryption status of the disk allows for direct assessment of encryption across laptops in real-time, providing immediate insight for audit preparation. Choice A (Trends) is incorrect because it focuses on historical data trends over time, not current encryption status. Choice B (Management) is incorrect because it enforces configurations rather than reports on them. Choice D (Compliance) is incorrect because it assesses adherence to policies, which might not directly reveal encryption status.',
    tags: ['interact-module', 'security-audit', 'disk-encryption', 'real-time-insight'],
    id: 'ASKING-GEN-1760819995280-4',
  },
  {
    question:
      "Your organization requires a monthly check for unauthorized software installations on all endpoints. What's the most efficient way to perform this check?",
    choices: [
      {
        id: 'a',
        text: 'Schedule a custom action in the Deploy module to uninstall unauthorized software',
      },
      {
        id: 'b',
        text: 'Set up a recurring saved question in the Interact module for installed applications',
      },
      {
        id: 'c',
        text: 'Create a compliance rule in the Compliance module for software installations',
      },
      {
        id: 'd',
        text: 'Configure a monthly report in the Trends module for new software detections',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      'Setting up a recurring saved question in the Interact module for installed applications allows for consistent, automated checks on software installations across all endpoints, providing immediate and actionable data. Choice A (Deploy) is incorrect because it acts on the issue directly without providing visibility. Choice C (Compliance) is incorrect because while it can enforce policies, it may not offer the detailed, immediate insight needed for all unauthorized installations. Choice D (Trends) is incorrect because it provides historical analysis rather than real-time monitoring.',
    tags: [
      'interact-module',
      'unauthorized-software',
      'recurring-checks',
      'installed-applications',
    ],
    id: 'ASKING-GEN-1760819995280-5',
  },
  {
    question:
      'You notice an unusual network activity spike and need to quickly determine which endpoints are running a specific, high-network-usage application. What is the fastest way to get this information?',
    choices: [
      {
        id: 'a',
        text: 'Examine network traffic logs in the Connect module',
      },
      {
        id: 'b',
        text: 'Use the Asset module to filter by application installation',
      },
      {
        id: 'c',
        text: 'Craft a natural language query in the Interact module asking about the application',
      },
      {
        id: 'd',
        text: 'Deploy a policy with the Management module to limit application network usage',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Crafting a natural language query in the Interact module asking about the application allows for immediate identification of endpoints running the specified application, leveraging Tanium's real-time data collection capabilities. Choice A (Connect) is incorrect because it's designed for exporting data to external systems, not querying endpoint status. Choice B (Asset) is incorrect because it may not provide real-time application usage data. Choice D (Management) is incorrect because it addresses the symptom rather than identifying the cause.",
    tags: ['interact-module', 'network-activity', 'natural-language-query', 'real-time-data'],
    id: 'ASKING-GEN-1760819995280-6',
  },
  {
    question:
      'After deploying a new application, you need to confirm it has been successfully installed on all targeted endpoints across the organization. Which approach should you take to verify the installations?',
    choices: [
      {
        id: 'a',
        text: 'Check the Deploy module for action status',
      },
      {
        id: 'b',
        text: 'Ask a question in the Interact module about the application’s installation status',
      },
      {
        id: 'c',
        text: 'Review the application deployment report in the Trends module',
      },
      {
        id: 'd',
        text: 'Monitor the installation progress in the Asset module',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module about the application’s installation status enables you to quickly verify successful installations across all targeted endpoints, using the power of real-time interrogation. Choice A (Deploy) is incorrect because while it indicates action taken, it doesn't confirm installation status. Choice C (Trends) is incorrect because it focuses on historical analysis, not immediate verification. Choice D (Asset) is incorrect because it provides a broader inventory view, not specific installation verification.",
    tags: [
      'interact-module',
      'application-installation',
      'real-time-verification',
      'practical-application',
    ],
    id: 'ASKING-GEN-1760819995280-7',
  },
  {
    question:
      "You're tasked with ensuring all endpoints are compliant with the latest corporate security policy, which includes running a specific version of antivirus software. What's the most direct way to verify compliance?",
    choices: [
      {
        id: 'a',
        text: 'Create a dashboard in the Trends module to track antivirus versions',
      },
      {
        id: 'b',
        text: 'Deploy antivirus software updates using the Management module',
      },
      {
        id: 'c',
        text: 'Ask a question in the Interact module regarding the antivirus version',
      },
      {
        id: 'd',
        text: 'Set up a compliance rule in the Compliance module for antivirus version',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module regarding the antivirus version allows for an immediate and specific assessment of compliance with the security policy across all endpoints. Choice A (Trends) is incorrect because it visualizes data over time, not immediate compliance status. Choice B (Management) is incorrect because it assumes non-compliance and doesn't verify the current state. Choice D (Compliance) is incorrect because, while it can enforce policies, asking directly provides faster verification.",
    tags: [
      'interact-module',
      'security-policy-compliance',
      'antivirus-version',
      'real-time-assessment',
    ],
    id: 'ASKING-GEN-1760819995280-8',
  },
  {
    question:
      'During a system-wide update, you need to confirm that no endpoints are left behind due to being offline. Which method provides the most accurate assessment?',
    choices: [
      {
        id: 'a',
        text: 'Review endpoint last seen timestamps in the Asset module',
      },
      {
        id: 'b',
        text: 'Query the Connect module for offline endpoint reports',
      },
      {
        id: 'c',
        text: 'Craft a question in the Interact module asking for the last check-in time',
      },
      {
        id: 'd',
        text: 'Use the Management module to track the deployment status',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      'Crafting a question in the Interact module asking for the last check-in time provides a real-time, accurate view of which endpoints may have missed the update due to being offline. Choice A (Asset) is incorrect because it may not reflect the most current status. Choice B (Connect) is incorrect because Connect is focused on data integration, not endpoint status. Choice D (Management) is incorrect because it shows action status but not whether endpoints were offline during the update.',
    tags: ['interact-module', 'system-update', 'offline-endpoints', 'real-time-assessment'],
    id: 'ASKING-GEN-1760819995280-9',
  },
  {
    question:
      "You need to quickly determine which endpoints are running an outdated operating system version in preparation for an upcoming software deployment. What's the most efficient approach?",
    choices: [
      {
        id: 'a',
        text: 'Deploy a script via the Management module to update operating systems',
      },
      {
        id: 'b',
        text: 'Create a report in the Trends module showing OS versions over time',
      },
      {
        id: 'c',
        text: 'Ask a question in the Interact module about current operating system versions',
      },
      {
        id: 'd',
        text: 'Configure an alert in the Connect module for outdated OS detections',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module about current operating system versions allows for an immediate and comprehensive understanding of which endpoints need updates before the software deployment. Choice A (Management) is incorrect because it focuses on taking action rather than assessing the current state. Choice B (Trends) is incorrect because it tracks changes over time, not the current status. Choice D (Connect) is incorrect because it's used for data integration and alerts, not for querying endpoint information directly.",
    tags: [
      'interact-module',
      'operating-system-version',
      'software-deployment-prep',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760819995280-10',
  },
  {
    question:
      'A manager asks you to provide a list of all installed software on remote workstations in the accounting department to verify compliance with software licensing agreements. Which approach would you use to gather this information quickly?',
    choices: [
      {
        id: 'a',
        text: 'Use the Deploy module to run a script on the endpoints',
      },
      {
        id: 'b',
        text: 'Use the Asset module to check the software inventory',
      },
      {
        id: 'c',
        text: "Ask a question in the Interact module using the 'Installed Applications' sensor",
      },
      {
        id: 'd',
        text: 'Configure a report in the Trends module listing the software',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module using the 'Installed Applications' sensor is correct because it allows for real-time querying of endpoint data, specifically software installations, which is essential for compliance checks. Choice A (Deploy) is incorrect because it's used for executing actions, not querying data. Choice B (Asset) is incorrect because it might not provide real-time data, depending on the last scan. Choice D (Trends) is incorrect because it visualizes trends over time, rather than providing a specific list of installed applications.",
    tags: [
      'interact-module',
      'installed-applications-sensor',
      'compliance',
      'software-inventory',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760820069441-1',
  },
  {
    question:
      'Your team is troubleshooting network connectivity issues on a subset of endpoints. You need to quickly identify the IP addresses and operating systems of the affected machines. Which Tanium module and sensors would best serve this purpose?',
    choices: [
      {
        id: 'a',
        text: "Interact module using 'IP Address' and 'Operating System' sensors",
      },
      {
        id: 'b',
        text: 'Asset module to review detailed network properties',
      },
      {
        id: 'c',
        text: 'Trends module to analyze historical operating system data',
      },
      {
        id: 'd',
        text: 'Connect module to export endpoint configurations',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "The Interact module using 'IP Address' and 'Operating System' sensors is the best choice because it allows for real-time querying of specific endpoint data, which is crucial for troubleshooting. Choice B (Asset) is incorrect because, although it provides in-depth endpoint data, it may not offer the real-time response needed for troubleshooting. Choice C (Trends) is incorrect as it focuses on historical data analysis, not current endpoint status. Choice D (Connect) is incorrect because it is designed for data export, not for querying real-time endpoint data.",
    tags: [
      'interact-module',
      'IP-address-sensor',
      'operating-system-sensor',
      'network-troubleshooting',
      'real-time-queries',
    ],
    id: 'ASKING-GEN-1760820069441-2',
  },
  {
    question:
      "You've been asked to generate a report on the uptime of all endpoints in the organization to identify any machines that have not been rebooted in over 30 days. Which approach should you take to collect the necessary data?",
    choices: [
      {
        id: 'a',
        text: 'Use the Trends module to analyze uptime trends',
      },
      {
        id: 'b',
        text: "Ask a question in the Interact module with the 'Uptime' sensor",
      },
      {
        id: 'c',
        text: 'Deploy a script via the Deploy module to record uptime',
      },
      {
        id: 'd',
        text: 'Utilize the Asset module to pull historical uptime data',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module with the 'Uptime' sensor is the most direct and efficient method to obtain current uptime information across all endpoints. This approach provides real-time data, which is essential for identifying machines exceeding the 30-day threshold. Choice A (Trends) is incorrect because it focuses on visualizing historical data trends rather than providing specific current data points. Choice C (Deploy) is incorrect as it's mainly used for executing scripts or actions, which is unnecessary for this requirement. Choice D (Asset) is incorrect because, although it offers comprehensive endpoint data, it may not provide the real-time uptime status needed for this task.",
    tags: [
      'interact-module',
      'uptime-sensor',
      'endpoint-management',
      'real-time-queries',
      'system-uptime',
    ],
    id: 'ASKING-GEN-1760820069441-3',
  },
  {
    question:
      "In preparation for an upcoming audit, you need to verify that all company laptops are running the latest version of your organization's security software. Which method would you employ to confirm the software version across all laptops?",
    choices: [
      {
        id: 'a',
        text: 'Run a report in the Trends module for installed security software versions',
      },
      {
        id: 'b',
        text: 'Deploy the latest security software version to all laptops using the Deploy module',
      },
      {
        id: 'c',
        text: "Ask a question in the Interact module using the 'Installed Applications' sensor, filtering for the security software",
      },
      {
        id: 'd',
        text: 'Check the Asset module for the latest security software deployment status',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module using the 'Installed Applications' sensor and filtering for the security software is the most effective way to quickly confirm the software version across all laptops. This approach allows for real-time verification specific to the audit's requirements. Choice A (Trends) is incorrect because it visualizes data trends rather than providing discrete data points. Choice B (Deploy) is incorrect as it pertains to action execution, not data verification. Choice D (Asset) is incorrect because, while it provides asset management capabilities, it may not offer the detailed, real-time data needed for audit preparation.",
    tags: [
      'interact-module',
      'installed-applications-sensor',
      'audit-preparation',
      'security-software',
      'real-time-verification',
    ],
    id: 'ASKING-GEN-1760820069441-4',
  },
  {
    question:
      'To improve security posture, you need to identify all endpoints that do not have the firewall enabled. Which sensor and module would provide this information most efficiently?',
    choices: [
      {
        id: 'a',
        text: "Use the 'Firewall Status' sensor in the Interact module",
      },
      {
        id: 'b',
        text: 'Check the Asset module for endpoints with disabled firewalls',
      },
      {
        id: 'c',
        text: 'Configure the Trends module to track firewall enablement trends',
      },
      {
        id: 'd',
        text: 'Employ the Deploy module to query firewall status on each endpoint',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Firewall Status' sensor in the Interact module is the most direct and efficient way to identify endpoints without an enabled firewall. This method provides real-time data critical for immediate security posture improvements. Choice B (Asset) is incorrect because it might not offer the up-to-the-minute status of endpoint firewalls. Choice C (Trends) is incorrect as it focuses on historical data rather than the current configuration status. Choice D (Deploy) is incorrect because Deploy is intended for executing actions on endpoints, not for querying their status.",
    tags: [
      'interact-module',
      'firewall-status-sensor',
      'security-posture',
      'endpoint-security',
      'real-time-data',
    ],
    id: 'ASKING-GEN-1760820069441-5',
  },
  {
    question:
      'During a compliance audit, you need to demonstrate that all endpoints are running a specific set of processes deemed critical for operational security. Which Tanium module and functionality should you utilize to confirm this compliance requirement?',
    choices: [
      {
        id: 'a',
        text: 'Generate a report in the Trends module showing historical process data',
      },
      {
        id: 'b',
        text: 'Use the Asset module to list all currently running processes',
      },
      {
        id: 'c',
        text: "Ask a question in the Interact module using the 'Running Processes' sensor",
      },
      {
        id: 'd',
        text: 'Deploy a custom script via the Deploy module to audit the processes',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module using the 'Running Processes' sensor is the most efficient and effective method to verify that endpoints are running the required processes for compliance. This approach provides real-time, actionable data. Choice A (Trends) is incorrect because it focuses on historical data, not the current state of endpoint processes. Choice B (Asset) is incorrect as it may not offer the level of detail or immediacy required for a compliance audit. Choice D (Deploy) is incorrect because it involves executing actions rather than querying data, which is not necessary for this compliance check.",
    tags: [
      'interact-module',
      'running-processes-sensor',
      'compliance-audit',
      'operational-security',
      'real-time-verification',
    ],
    id: 'ASKING-GEN-1760820069441-6',
  },
  {
    question:
      'You are tasked with optimizing the performance of your Tanium deployment by reducing the load on endpoints during peak business hours. Which strategy would be most effective for managing the timing of your questions?',
    choices: [
      {
        id: 'a',
        text: 'Configure question throttling in the Interact module settings',
      },
      {
        id: 'b',
        text: 'Use the Saved Questions feature to schedule questions for off-peak hours',
      },
      {
        id: 'c',
        text: 'Deploy questions using the Deploy module for better timing control',
      },
      {
        id: 'd',
        text: 'Utilize the Connect module to batch question results and reduce endpoint load',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Best Practices',
    explanation:
      'Using the Saved Questions feature to schedule questions for off-peak hours is the most effective strategy for reducing endpoint load during business hours, as it allows for precise timing control without sacrificing data collection. Choice A (Configure question throttling) is incorrect because, while it can reduce load, it does not address the issue of peak business hours specifically. Choice C (Deploy) is incorrect since the Deploy module is not designed for querying data. Choice D (Connect) is incorrect because its primary function is data export, not question management or endpoint load balancing.',
    tags: [
      'interact-module',
      'question-performance-optimization',
      'saved-questions-management',
      'endpoint-load',
      'off-peak-scheduling',
    ],
    id: 'ASKING-GEN-1760820069441-7',
  },
  {
    question:
      'After deploying a new application across your organization, you need to confirm its installation on all endpoints. Which Tanium module and sensors would give you the most accurate and up-to-date information?',
    choices: [
      {
        id: 'a',
        text: 'Employ the Asset module to review the latest deployment reports',
      },
      {
        id: 'b',
        text: "Ask a question in the Interact module using the 'Installed Applications' sensor",
      },
      {
        id: 'c',
        text: 'Use the Connect module to export installation data for analysis',
      },
      {
        id: 'd',
        text: "Schedule a report in the Trends module to track the application's deployment over time",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Asking a question in the Interact module using the 'Installed Applications' sensor is the most direct method to confirm the application's installation on all endpoints, providing real-time, actionable data. Choice A (Asset) is incorrect because it provides a static view that might not be up-to-the-minute. Choice C (Connect) is incorrect as it is intended for exporting data rather than querying it in real-time. Choice D (Trends) is incorrect because it visualizes historical data, which isn't ideal for immediate verification of a recent deployment.",
    tags: [
      'interact-module',
      'installed-applications-sensor',
      'application-deployment',
      'real-time-verification',
      'endpoint-compliance',
    ],
    id: 'ASKING-GEN-1760820069441-8',
  },
  {
    question:
      'During an incident response, you need to quickly determine the last user logged into a set of endpoints suspected to be compromised. Which approach in Tanium would yield this information most effectively?',
    choices: [
      {
        id: 'a',
        text: 'Access the Asset module for detailed user profiles and login history',
      },
      {
        id: 'b',
        text: "Use the 'Last Logged In User' sensor in the Interact module",
      },
      {
        id: 'c',
        text: 'Configure the Connect module to pull login reports from endpoints',
      },
      {
        id: 'd',
        text: 'Deploy a custom sensor via the Deploy module to track user logins',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Last Logged In User' sensor in the Interact module is the most efficient way to quickly gather the needed information, as it provides real-time data on user activity, crucial for incident response. Choice A (Asset) is incorrect because, while comprehensive, it may not offer the immediacy required in an incident response scenario. Choice C (Connect) is incorrect as it is designed for data export, not immediate data querying. Choice D (Deploy) is incorrect because deploying a custom sensor is not as direct or as quick as using an existing sensor in the Interact module.",
    tags: [
      'interact-module',
      'last-logged-in-user-sensor',
      'incident-response',
      'real-time-data',
      'user-activity',
    ],
    id: 'ASKING-GEN-1760820069441-9',
  },
  {
    question:
      'To enforce corporate security policies, you need to identify endpoints with unauthorized VPN software installed. Which strategy using Tanium would allow you to accurately identify these endpoints?',
    choices: [
      {
        id: 'a',
        text: 'Set up a compliance report in the Trends module for VPN installations',
      },
      {
        id: 'b',
        text: 'Deploy a software inventory tool using the Deploy module',
      },
      {
        id: 'c',
        text: "Use the 'Installed Applications' sensor in the Interact module, filtering for VPN software",
      },
      {
        id: 'd',
        text: 'Configure the Asset module to flag endpoints with VPN software',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Practical Scenarios',
    explanation:
      "Using the 'Installed Applications' sensor in the Interact module, with a filter for VPN software, is the most direct and efficient way to identify endpoints with unauthorized VPN installations, providing immediate and actionable data. Choice A (Trends) is incorrect because it focuses on historical data analysis rather than real-time detection. Choice B (Deploy) is incorrect as deploying a tool is more complex and time-consuming than directly querying endpoints. Choice D (Asset) is incorrect because, although it offers detailed inventory data, it may not provide the immediate, filtered results that the Interact module can.",
    tags: [
      'interact-module',
      'installed-applications-sensor',
      'VPN-software',
      'security-policy-enforcement',
      'real-time-detection',
    ],
    id: 'ASKING-GEN-1760820069441-10',
  },
  {
    question:
      "As part of an audit, you are required to identify all endpoints running a specific outdated application, 'AppX', across your organization's network of 10,000 endpoints. Your task is to accomplish this efficiently, ensuring minimal impact on network performance. Which approach should you take to gather this data?",
    choices: [
      {
        id: 'a',
        text: "Use the Interact module to ask for 'Installed Applications' from all endpoints.",
      },
      {
        id: 'b',
        text: "Deploy a custom sensor via the Manage module to scan for 'AppX'.",
      },
      {
        id: 'c',
        text: "Use the Asset module to filter endpoints by the 'Installed Applications' sensor.",
      },
      {
        id: 'd',
        text: "Create a saved question within the Interact module specifically looking for 'AppX'.",
      },
    ],
    correctAnswerId: 'd',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Best Practices',
    explanation:
      "Creating a saved question within the Interact module specifically looking for 'AppX' is correct because it allows for efficient, targeted querying with minimal network impact. Choice A is incorrect because asking about all 'Installed Applications' from all endpoints could generate significant network traffic and data to sift through. Choice B is incorrect because deploying a custom sensor for a single application check is less efficient than using existing sensors. Choice C is incorrect because the Asset module is better for reviewing data already gathered and doesn't directly support the creation of custom queries for live data.",
    tags: [
      'Interact-module',
      'saved-questions-management',
      'best-practices',
      'efficiency',
      'network-performance',
    ],
    id: 'ASKING-GEN-1760820088629-1',
  },
  {
    question:
      'Your team has noticed a discrepancy in reported IP addresses, suspecting that multiple endpoints might be sharing the same IP due to a DHCP configuration error. You need to quickly identify any such endpoints to prevent potential network conflicts. Which question construction best supports this investigation?',
    choices: [
      {
        id: 'a',
        text: "Ask for 'IP Address' from all endpoints and manually compare results.",
      },
      {
        id: 'b',
        text: "Use the 'Group by' feature with the 'IP Address' sensor in the Interact module.",
      },
      {
        id: 'c',
        text: "Query the 'Network Interfaces' sensor for duplicate IP addresses.",
      },
      {
        id: 'd',
        text: "Export all 'IP Address' sensor data to a CSV file for external analysis.",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Asking Questions',
    difficulty: 'Intermediate',
    category: 'Question Performance Optimization',
    explanation:
      "'Group by' feature with the 'IP Address' sensor in the Interact module is correct because it efficiently organizes the data, making it easier to spot duplicates directly within Tanium. Choice A is incorrect as manually comparing results from all endpoints is time-consuming and prone to error. Choice C is incorrect because the 'Network Interfaces' sensor may provide too much unnecessary detail for this specific task. Choice D is incorrect as exporting data for external analysis is less efficient and bypasses the real-time analysis capabilities of Tanium.",
    tags: [
      'Interact-module',
      'question-construction',
      'IP-addresses',
      'network-conflicts',
      'data-organization',
    ],
    id: 'ASKING-GEN-1760820088629-2',
  },
];

export default generatedQuestions;
