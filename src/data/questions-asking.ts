import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * Asking Questions Questions
 * 43 questions for the Asking Questions domain
 */

export const askingQuestions: Question[] = [
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
    id: "TCO-AQ-0047",
    question:
      "When creating complex questions with nested filtering criteria, what approach ensures optimal query performance and accuracy?",
    choices: [
      {
        id: "a",
        text: "Use as many sensors as possible in a single question for comprehensive data collection",
      },
      {
        id: "b",
        text: "Structure filters logically with most selective criteria first, and validate sensor compatibility",
      },
      {
        id: "c",
        text: "Always use the broadest possible filters to capture maximum endpoints",
      },
      {
        id: "d",
        text: "Avoid filtering altogether and process results manually",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Structuring filters logically with the most selective criteria first reduces the dataset early in the query process, improving performance. Validating sensor compatibility ensures accurate results by confirming sensors work well together and provide meaningful combined data.",
    tags: [
      "complex-questions",
      "query-optimization",
      "filtering-performance",
      "sensor-compatibility",
    ],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/query-optimization",
  },
  {
    id: "TCO-AQ-0048",
    question:
      "What sensor would be most appropriate for identifying endpoints that may have been compromised based on suspicious network connections?",
    choices: [
      {
        id: "a",
        text: "IP Address sensor",
      },
      {
        id: "b",
        text: "Network Connections sensor",
      },
      {
        id: "c",
        text: "Computer Name sensor",
      },
      {
        id: "d",
        text: "Operating System sensor",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "The Network Connections sensor provides information about active network connections, including remote addresses and ports. This is essential for identifying suspicious network activity that might indicate compromise, such as connections to known malicious IPs or unusual outbound connections.",
    tags: [
      "network-connections",
      "security-investigation",
      "compromise-detection",
      "suspicious-activity",
    ],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/network-connections-sensor",
  },
  {
    id: "TCO-AQ-0049",
    question:
      "When troubleshooting a question that returns inconsistent results across multiple executions, what systematic approach identifies the root cause?",
    choices: [
      {
        id: "a",
        text: "Immediately recreate the question with different sensors",
      },
      {
        id: "b",
        text: "Check sensor data refresh rates, validate filtering logic, verify endpoint connectivity patterns",
      },
      {
        id: "c",
        text: "Run the question more frequently to average out inconsistencies",
      },
      {
        id: "d",
        text: "Switch to static computer groups for consistent targeting",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.TROUBLESHOOTING,
    explanation:
      "Systematic troubleshooting involves checking sensor data refresh rates (may affect timing), validating filtering logic for edge cases, and verifying endpoint connectivity patterns that could cause intermittent results. This approach identifies whether inconsistencies are due to data timing, query logic, or network issues.",
    tags: [
      "inconsistent-results",
      "systematic-troubleshooting",
      "sensor-refresh-rates",
      "connectivity-patterns",
    ],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/question-troubleshooting",
  },
  {
    id: "TCO-AQ-0050",
    question:
      "For incident response scenarios requiring immediate endpoint data collection, what question design approach ensures fastest response time?",
    choices: [
      {
        id: "a",
        text: "Create comprehensive questions with all available sensors for complete data",
      },
      {
        id: "b",
        text: "Use targeted questions with specific sensors and precise filtering for immediate critical data",
      },
      {
        id: "c",
        text: "Rely on saved questions regardless of incident context",
      },
      {
        id: "d",
        text: "Query all endpoints simultaneously with broad filters",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "For incident response, targeted questions with specific sensors and precise filtering provide the fastest response time by focusing on immediately critical data. This approach minimizes query processing time, network overhead, and result complexity while delivering essential information quickly for rapid decision-making.",
    tags: ["incident-response", "targeted-questions", "response-time", "critical-data"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/incident-response-questioning",
  },
  {
    id: "TCO-AQ-0051",
    question:
      "When creating saved questions for compliance auditing, what documentation approach ensures consistent interpretation and execution?",
    choices: [
      {
        id: "a",
        text: "Include minimal documentation to avoid confusion",
      },
      {
        id: "b",
        text: "Document question purpose, expected results format, compliance requirements, and execution frequency",
      },
      {
        id: "c",
        text: "Rely on self-explanatory question names only",
      },
      {
        id: "d",
        text: "Create separate documentation files outside the Tanium system",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Comprehensive documentation including question purpose, expected results format, compliance requirements, and execution frequency ensures consistent interpretation and execution. This approach supports compliance auditing by providing clear context, expectations, and usage guidelines for audit personnel.",
    tags: ["compliance-auditing", "saved-questions", "documentation", "consistent-execution"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/compliance-question-documentation",
  },
  {
    id: "TCO-AQ-0052",
    question:
      "What sensor combination provides the most comprehensive view of software installation status for license compliance reporting?",
    choices: [
      {
        id: "a",
        text: "Installed Applications sensor only",
      },
      {
        id: "b",
        text: "Installed Applications, Running Processes, and File System Analysis sensors combined",
      },
      {
        id: "c",
        text: "Registry entries sensor only",
      },
      {
        id: "d",
        text: "Process list and service status sensors combined",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Combining Installed Applications (for registered software), Running Processes (for active usage), and File System Analysis (for unregistered installations) provides the most comprehensive view for license compliance. This combination captures installed software, usage patterns, and potential shadow IT installations that might not appear in standard application lists.",
    tags: [
      "license-compliance",
      "software-installation",
      "comprehensive-analysis",
      "multi-sensor-approach",
    ],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/license-compliance-sensors",
  },
  {
    id: "TCO-AQ-0053",
    question:
      "When designing questions for regular health monitoring, what sensor selection strategy balances comprehensive coverage with system performance?",
    choices: [
      {
        id: "a",
        text: "Use all available sensors to capture maximum data",
      },
      {
        id: "b",
        text: "Select essential health indicators with efficient sensors and implement scheduled execution",
      },
      {
        id: "c",
        text: "Avoid regular monitoring to prevent system overhead",
      },
      {
        id: "d",
        text: "Use only the fastest sensors regardless of data relevance",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: QuestionCategory.PRACTICAL_SCENARIOS,
    explanation:
      "Selecting essential health indicators with efficient sensors and implementing scheduled execution balances comprehensive monitoring with system performance. This approach focuses on key metrics (CPU, memory, disk, connectivity) while using optimized sensors and timing to minimize system impact during regular monitoring cycles.",
    tags: ["health-monitoring", "sensor-selection", "performance-balance", "scheduled-execution"],
    studyGuideRef: "tco-study-path/sensors",
    officialRef: "interact/health-monitoring-strategy",
  },
];

export const askingQuestionMetadata = {
  domain: TCODomain.AQ,
  totalQuestions: 50,
  difficultyBreakdown: {
    beginner: 17,
    intermediate: 22,
    advanced: 11,
  },
};
