import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * Refining Questions & Targeting Questions
 * 45 questions for the Refining Questions & Targeting domain
 */

export const refiningQuestions: Question[] = [
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
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
    category: "Troubleshooting",
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
    category: "Practical Scenarios",
    explanation:
      "Least privilege principles require limiting access to the minimum necessary for job functions. Users should only have access to computer groups that contain systems they need to manage or monitor for their specific role. This minimizes security risk and prevents accidental impact on unrelated systems.",
    tags: ["least-privilege", "rbac", "security"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "blueprint/operator-competencies",
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
    category: "Practical Scenarios",
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
    category: "Troubleshooting",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
    explanation:
      "The most secure and appropriate approach is to create a content set containing Linux-relevant sensors, packages, and tools, combined with a computer group that only includes Linux servers. This implements least privilege by restricting both what the team can do and where they can do it.",
    tags: ["role-design", "linux-administration", "least-privilege"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "blueprint/operator-competencies",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
    explanation:
      "A dynamic group using patch-related sensors provides the most accurate and maintainable solution. It automatically updates as patch status changes, requires no manual maintenance, and ensures the group always reflects current patch state. Static approaches require manual updates and are prone to becoming outdated.",
    tags: ["patch-management", "dynamic-groups", "security-targeting"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "university/tco-foundations",
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
    category: "Practical Scenarios",
    explanation:
      "Option C provides the most precise targeting by combining OS filtering (Windows), computer type (Workstation to exclude servers), and domain status (not empty to ensure domain membership). This ensures actions target only the intended system types.",
    tags: ["domain-targeting", "workstation-filtering", "precise-targeting"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "university/tco-foundations",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
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
    category: "Troubleshooting",
    explanation:
      "Different RBAC permissions can exist for sensors used in queries versus actions. A user might have query permissions for sensors but lack the action permissions needed to target the same systems, causing targeting failures even though the filter works in queries.",
    tags: ["sensor-permissions", "action-targeting", "rbac-troubleshooting"],
    studyGuideRef: "tco-study-path/rbac",
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
    category: "Practical Scenarios",
    explanation:
      "Option B focuses specifically on systems missing Critical or Important patches, which directly addresses the urgent patch deployment requirement based on severity classification. This provides targeted filtering for high-priority vulnerabilities.",
    tags: ["vulnerability-management", "patch-priority", "critical-patches"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "blueprint/security-considerations",
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
    category: "Practical Scenarios",
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
    category: "Troubleshooting",
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
    category: "Practical Scenarios",
    explanation:
      "Content sets assigned to the user's role determine which sensors (and other Tanium objects) a user can access. Content sets define the 'what' in RBAC - what data and tools users can use.",
    tags: ["sensor-permissions", "content-sets", "rbac-basics"],
    studyGuideRef: "tco-study-path/rbac",
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
    category: "Practical Scenarios",
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
    category: "Troubleshooting",
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
    category: "Practical Scenarios",
    explanation:
      "Filter groups allow operators to create reusable filter criteria that can be applied to multiple questions and actions, promoting consistency and efficiency in targeting specific sets of endpoints.",
    tags: ["filter-groups", "reusable-criteria", "targeting-efficiency"],
    studyGuideRef: "tco-study-path/rbac",
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
    category: "Practical Scenarios",
    explanation:
      "Using OR logic with critical security conditions (missing critical patches OR outdated antivirus) captures systems with any immediate security risks. This ensures no high-risk systems are missed, as either condition alone warrants immediate attention.",
    tags: ["security-groups", "risk-assessment", "boolean-logic"],
    studyGuideRef: "tco-study-path/rbac",
    officialRef: "blueprint/security-considerations",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
    explanation:
      "Multiple specific filters combining OS type, installed software, and server roles provide the most reliable targeting. This approach uses concrete system attributes rather than naming conventions that may change or be inconsistent across environments.",
    tags: ["filtering", "server-targeting", "reliability", "multi-criteria"],
    studyGuideRef: "tco-study-path/filtering-advanced",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
    explanation:
      "Roles have a many-to-many relationship with users. Multiple users can have the same role, and each user can have multiple roles. This flexible assignment model allows for granular permission management across different functional areas.",
    tags: ["rbac", "role-relationships", "user-assignment", "many-to-many"],
    studyGuideRef: "tco-study-path/rbac-relationships",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
    explanation:
      "A single filter with logical AND operators for all conditions is most efficient. This approach: Operating System contains 'Windows' and RAM is less than '8000' and Computer Group does not contain 'Development' processes all criteria simultaneously with optimal performance.",
    tags: ["complex-filtering", "logical-operators", "multiple-criteria", "efficiency"],
    studyGuideRef: "tco-study-path/complex-filtering",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
    explanation:
      "White spaces require quotation marks in Tanium questions. The syntax 'Computer Name contains \" DBserver \"' properly handles spaces before and after the string 'DBserver' by enclosing the entire search string including spaces in quotes.",
    tags: ["white-spaces", "special-characters", "string-matching", "quotation-marks"],
    studyGuideRef: "tco-study-path/whitespace-handling",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
    explanation:
      "Dynamic computer groups with environment-based filters and progressive deployment plans provide the most controlled rollout. Dynamic groups automatically update membership based on criteria, and deployment plans enable phased rollouts with success criteria before proceeding to the next phase.",
    tags: ["targeting-strategy", "progressive-deployment", "dynamic-groups", "environment-phasing"],
    studyGuideRef: "tco-study-path/progressive-deployment",
    officialRef: "platform/deployment-strategies",
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
    category: "Troubleshooting",
    explanation:
      "Dynamic groups depend on real-time sensor data. Inconsistent membership often indicates connectivity issues, sensor update delays, or endpoint reporting problems. Checking endpoint connectivity and sensor update frequency addresses the root cause of membership fluctuations.",
    tags: ["dynamic-groups", "troubleshooting", "connectivity", "sensor-updates"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/computer-group-troubleshooting",
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
    category: "Practical Scenarios",
    explanation:
      "Dynamic computer groups automatically update their membership based on specified criteria such as operating system, IP range, or other endpoint attributes. Members are added or removed automatically as endpoint characteristics change.",
    tags: ["dynamic-groups", "computer-groups", "targeting", "automation"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/dynamic-groups",
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
    category: "Practical Scenarios",
    explanation:
      "The correct syntax uses AND logic to combine multiple criteria and 'does not contain' for exclusions. This ensures the group includes Windows systems that are servers but specifically excludes domain controllers.",
    tags: ["computer-groups", "filtering", "windows-servers", "exclusion-logic"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/computer-group-criteria",
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
    category: "Practical Scenarios",
    explanation:
      "Using multiple exclusions with AND logic provides the most precise filtering. This approach ensures the group captures Windows workstations while explicitly excluding both servers and domain controllers, preventing accidental inclusion of systems that shouldn't receive workstation-specific patches.",
    tags: ["computer-groups", "exclusion-filtering", "patch-management", "workstations"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/computer-group-exclusion-logic",
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
    category: "Practical Scenarios",
    explanation:
      "The primary advantage of static computer groups is predictable, controlled membership that doesn't change automatically. This is important for scenarios where consistent group membership is required, such as specific deployment testing or compliance requirements.",
    tags: ["static-groups", "computer-groups", "membership-control", "predictability"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/static-vs-dynamic-groups",
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
    category: "Troubleshooting",
    explanation:
      "Comprehensive investigation includes checking network connectivity (affects IP reporting), verifying IP address sensor accuracy (ensures correct IP detection), and validating OS detection (confirms Windows identification). This systematic approach identifies why expected endpoints aren't being captured.",
    tags: ["computer-groups", "ip-addressing", "troubleshooting", "sensor-validation"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/computer-group-troubleshooting-advanced",
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
    category: "Practical Scenarios",
    explanation:
      "Using multiple AND conditions with exclusion logic provides precise targeting. This approach captures servers, excludes development environments, and includes only critical priority systems, ensuring emergency patches reach the right endpoints while avoiding test systems.",
    tags: ["emergency-patching", "critical-servers", "targeting-precision", "exclusion-logic"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/emergency-targeting-criteria",
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
    category: "Practical Scenarios",
    explanation:
      "'does not contain' is the filtering operator used in computer group criteria to exclude endpoints that match specific values. For example, 'Operating System does not contain Server' excludes all server operating systems.",
    tags: ["filtering-operators", "exclusion", "computer-groups", "does-not-contain"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/filtering-operators",
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
    category: "Practical Scenarios",
    explanation:
      "Snapshot-based dynamic groups capture membership at specific points in time (quarterly) while maintaining the benefits of dynamic criteria. This provides stable membership during compliance periods while ensuring accuracy through periodic updates based on current endpoint states.",
    tags: ["compliance-scanning", "group-stability", "snapshot-groups", "audit-consistency"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/snapshot-dynamic-groups",
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
    category: "Practical Scenarios",
    explanation:
      "Role-based dynamic groups with vulnerability-specific criteria provide comprehensive coverage while maintaining management efficiency. Priority levels ensure critical systems receive appropriate attention, and dynamic membership adapts to changing endpoint roles and vulnerability status.",
    tags: ["vulnerability-management", "group-strategy", "role-based-groups", "priority-levels"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/vulnerability-group-strategy",
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
    category: "Practical Scenarios",
    explanation:
      "There is no specific limit to the number of criteria in a computer group definition. The practical limit depends on system performance and query complexity, but the platform supports multiple complex criteria combinations for precise endpoint targeting.",
    tags: ["computer-groups", "criteria-limits", "system-performance", "targeting-limits"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/computer-group-limits",
  },
  {
    id: "TCO-RQ-0046",
    question:
      "When creating computer groups for multi-site deployments, what approach ensures consistent targeting across different network environments?",
    choices: [
      {
        id: "a",
        text: "Use IP address ranges specific to each site location",
      },
      {
        id: "b",
        text: "Implement site-based criteria with standardized naming conventions and role-based filters",
      },
      {
        id: "c",
        text: "Create separate groups for each site with manual endpoint assignment",
      },
      {
        id: "d",
        text: "Use hostname patterns that include site identifiers",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Site-based criteria with standardized naming conventions and role-based filters ensure consistent targeting logic across different network environments. This approach adapts to network variations while maintaining predictable group membership based on business functions rather than just network topology.",
    tags: [
      "multi-site-deployment",
      "site-based-criteria",
      "standardized-naming",
      "cross-environment",
    ],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/multi-site-targeting",
  },
  {
    id: "TCO-RQ-0047",
    question:
      "A computer group targeting 'Windows 10 workstations with less than 8GB RAM' for memory upgrade planning becomes unreliable. What systematic approach improves group accuracy?",
    choices: [
      {
        id: "a",
        text: "Switch to manual endpoint selection for hardware inventory",
      },
      {
        id: "b",
        text: "Validate sensor data accuracy, verify RAM detection methods, implement data quality checks",
      },
      {
        id: "c",
        text: "Create separate groups for different RAM sizes",
      },
      {
        id: "d",
        text: "Use approximate targeting with broader RAM ranges",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Improving group accuracy requires validating sensor data accuracy for hardware detection, verifying RAM detection methods across different hardware types, and implementing data quality checks to identify reporting inconsistencies. This systematic approach addresses the root cause of unreliable hardware-based targeting.",
    tags: ["hardware-targeting", "sensor-validation", "data-quality", "memory-detection"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/hardware-targeting-accuracy",
  },
  {
    id: "TCO-RQ-0048",
    question:
      "When designing computer groups for patch management cycles, what strategy best accommodates testing phases and rollback capabilities?",
    choices: [
      {
        id: "a",
        text: "Deploy patches to all systems simultaneously",
      },
      {
        id: "b",
        text: "Create tiered groups with test rings, staged deployment criteria, and rollback-enabled membership",
      },
      {
        id: "c",
        text: "Use random selection for patch testing",
      },
      {
        id: "d",
        text: "Apply patches only during maintenance windows",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Tiered groups with test rings provide controlled patch testing progression, staged deployment criteria ensure systematic rollout, and rollback-enabled membership allows quick recovery if issues arise. This strategy balances safety, testing rigor, and operational efficiency.",
    tags: ["patch-management", "test-rings", "staged-deployment", "rollback-capability"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/patch-deployment-strategy",
  },
  {
    id: "TCO-RQ-0049",
    question:
      "For compliance reporting that requires precise endpoint counts, what computer group configuration provides the most reliable membership tracking?",
    choices: [
      {
        id: "a",
        text: "Dynamic groups with frequent membership updates",
      },
      {
        id: "b",
        text: "Static groups with scheduled validation and audit trail logging",
      },
      {
        id: "c",
        text: "Manual endpoint lists updated by administrators",
      },
      {
        id: "d",
        text: "Hybrid groups that combine static and dynamic elements",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Static groups with scheduled validation provide the most reliable membership tracking for compliance reporting. Scheduled validation ensures accuracy while maintaining consistent counts, and audit trail logging provides the documentation required for compliance verification and historical tracking.",
    tags: ["compliance-reporting", "membership-tracking", "static-groups", "audit-trails"],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/compliance-group-management",
  },
  {
    id: "TCO-RQ-0050",
    question:
      "When troubleshooting a computer group that shows zero members despite appropriate criteria, what diagnostic sequence most efficiently identifies the issue?",
    choices: [
      {
        id: "a",
        text: "Recreate the group with simplified criteria",
      },
      {
        id: "b",
        text: "Verify sensor availability, test individual criteria components, validate data freshness, check permissions",
      },
      {
        id: "c",
        text: "Switch to static group management",
      },
      {
        id: "d",
        text: "Wait for sensor data to refresh automatically",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REFINING_QUESTIONS,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Systematic diagnosis involves verifying sensor availability (ensures data sources are working), testing individual criteria components (isolates specific problems), validating data freshness (confirms recent updates), and checking permissions (ensures access to required data). This comprehensive approach efficiently identifies the root cause of zero membership issues.",
    tags: [
      "zero-membership",
      "diagnostic-sequence",
      "sensor-availability",
      "systematic-troubleshooting",
    ],
    studyGuideRef: "tco-study-path/targeting",
    officialRef: "console/zero-membership-troubleshooting",
  },
];

export const refiningQuestionMetadata = {
  domain: TCODomain.RQ,
  totalQuestions: 50,
  difficultyBreakdown: {
    beginner: 13,
    intermediate: 22,
    advanced: 15,
  },
};
