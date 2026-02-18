import { Difficulty, type Question, QuestionCategory, TCODomain } from "@/types/exam";

/**
 * AI-Generated Questions
 *
 * Domain: refining_targeting
 * Difficulty: intermediate
 * Count: 42
 * Generated: 2025-10-18T21:08:04.221Z
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedQuestions: Question[] = [
  {
    question:
      "Your organization requires a dynamic computer group for all devices not running the latest version of your antivirus software. This group will be used to target updates. Which filter logic should you use to create this group?",
    choices: [
      {
        id: "a",
        text: "Antivirus version equals latest version",
      },
      {
        id: "b",
        text: "Antivirus version does not equal latest version",
      },
      {
        id: "c",
        text: "Antivirus status is up-to-date",
      },
      {
        id: "d",
        text: "Antivirus update timestamp is older than one week",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice B is correct because filtering devices where the antivirus version does not equal the latest version will accurately capture all endpoints needing updates. Choice A is incorrect because it would target devices already updated. Choice C is incorrect as 'up-to-date' status may not accurately reflect the specific version requirement. Choice D is incorrect because the timestamp might not accurately reflect the current version status.",
    tags: [
      "dynamic-computer-groups",
      "advanced-filtering",
      "antivirus-updates",
      "group-membership-management",
    ],
    id: "REFINI-GEN-1760813354981-1",
  },
  {
    question:
      "You're tasked with optimizing query performance for a recurring check that targets endpoints in specific geographic locations. Which approach should you use to minimize impact on the network?",
    choices: [
      {
        id: "a",
        text: "Execute queries during off-peak hours",
      },
      {
        id: "b",
        text: "Create a static computer group for each location",
      },
      {
        id: "c",
        text: "Use Boolean logic in filters to exclude non-relevant endpoints",
      },
      {
        id: "d",
        text: "Increase the query timeout setting",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Choice C is correct because using Boolean logic in filters to specifically exclude non-relevant endpoints can significantly reduce the scope and thus the performance impact of a query. Choice A is incorrect as querying during off-peak hours doesn't necessarily optimize performance, just reduces business impact. Choice B is incorrect because static groups require manual updating and may not reflect current endpoint status accurately. Choice D is incorrect as increasing the timeout does not optimize performance; it merely allows longer for responses.",
    tags: [
      "filter-performance-optimization",
      "boolean-logic",
      "query-optimization",
      "advanced-filtering",
    ],
    id: "REFINI-GEN-1760813354981-2",
  },
  {
    question:
      "An IT administrator needs to apply a critical update to endpoints running a specific version of an application vulnerable to a recent exploit. However, the administrator wants to exclude servers to prevent potential service disruption. Which method should be used to accurately target these endpoints?",
    choices: [
      {
        id: "a",
        text: "Create a dynamic computer group based on application version and exclude endpoints with 'Server' in their name",
      },
      {
        id: "b",
        text: "Target all endpoints and manually exclude servers based on their IP addresses",
      },
      {
        id: "c",
        text: "Use advanced filtering with Boolean logic to include the specific application version and exclude server operating systems",
      },
      {
        id: "d",
        text: "Deploy the update to all endpoints and rely on the application's installer to skip servers",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice C is correct because using advanced filtering with Boolean logic allows precise targeting by including endpoints with the specific vulnerable application version while excluding those running server operating systems, thus mitigating risk to critical infrastructure. Choice A is incorrect as relying on naming conventions is error-prone and not all servers may follow the same naming pattern. Choice B is incorrect because manual IP exclusion is labor-intensive and prone to error. Choice D is incorrect because it assumes the installer's logic matches the targeting needs, which might not be the case, leading to potential disruptions.",
    tags: [
      "advanced-filtering",
      "critical-updates",
      "boolean-logic",
      "targeting-specific-endpoints",
    ],
    id: "REFINI-GEN-1760813354981-3",
  },
  {
    question:
      "Your team must ensure compliance reports only include data from endpoints within the EU to adhere to GDPR requirements. Which scoping method should be used to configure this within Tanium?",
    choices: [
      {
        id: "a",
        text: "Apply geographical filters based on IP address ranges specific to the EU",
      },
      {
        id: "b",
        text: "Use RBAC to restrict user access to non-EU endpoints",
      },
      {
        id: "c",
        text: "Manually create a static group for EU endpoints and update it regularly",
      },
      {
        id: "d",
        text: "Configure content set scoping to include only endpoints within the EU",
      },
    ],
    correctAnswerId: "d",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Choice D is correct because configuring content set scoping to specifically include endpoints within the EU allows for precise and manageable control over which data is included in compliance reports, directly aligning with GDPR requirements. Choice A is incorrect because IP address ranges may not accurately represent geographical locations and can change. Choice B is incorrect as RBAC restricts user actions, not data in reports. Choice C is incorrect because manually updating static groups is labor-intensive and prone to error.",
    tags: [
      "content-set-scoping",
      "GDPR-compliance",
      "geographical-targeting",
      "compliance-reporting",
    ],
    id: "REFINI-GEN-1760813354981-4",
  },
  {
    question:
      "In response to a detected malware outbreak, you need to quickly identify all endpoints that have not run a full antivirus scan in the past 7 days. Which Tanium feature should you use to target these endpoints for immediate scanning?",
    choices: [
      {
        id: "a",
        text: "Deploy a saved question using sensor data",
      },
      {
        id: "b",
        text: "Use the Asset module to filter by last scan date",
      },
      {
        id: "c",
        text: "Create a dynamic computer group based on last scan date",
      },
      {
        id: "d",
        text: "Configure a Connect workflow to alert on scan dates",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice C is correct because creating a dynamic computer group based on the last scan date allows for automatic updating and targeting of endpoints that meet the criteria, facilitating swift action to mitigate the malware outbreak. Choice A is incorrect because deploying a saved question provides information but doesn't facilitate immediate action. Choice B is incorrect as the Asset module provides a broader overview rather than real-time targeting capabilities. Choice D is incorrect because while Connect can alert on conditions, it's not the most direct method for targeting and acting upon specific endpoint criteria.",
    tags: ["dynamic-computer-groups", "malware-response", "antivirus-scans", "endpoint-targeting"],
    id: "REFINI-GEN-1760813354981-5",
  },
  {
    question:
      "Your company's security policy requires that all endpoints in the finance department are part of a dedicated computer group for specific security policies. The membership of this group changes frequently. What is the most efficient way to manage this group?",
    choices: [
      {
        id: "a",
        text: "Manually update the group membership at regular intervals",
      },
      {
        id: "b",
        text: "Use a dynamic computer group based on user department attributes",
      },
      {
        id: "c",
        text: "Assign a team member to update the group membership daily",
      },
      {
        id: "d",
        text: "Create a static group and update it based on monthly reports",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Choice B is correct because using a dynamic computer group that automatically updates based on user department attributes ensures that the group always reflects the current membership of the finance department without the need for manual intervention. Choice A is inefficient and prone to being outdated. Choice C is labor-intensive and does not guarantee real-time accuracy. Choice D, while somewhat automated, still relies on periodic manual updating, making it less efficient than a dynamic group.",
    tags: [
      "dynamic-computer-groups",
      "group-membership-management",
      "security-policy",
      "finance-department-security",
    ],
    id: "REFINI-GEN-1760813354981-6",
  },
  {
    question:
      "After deploying a new application across your network, you need to verify its installation on a specific set of endpoints defined by their role in the organization. Which Tanium feature allows for the most precise targeting of these endpoints?",
    choices: [
      {
        id: "a",
        text: "Static computer groups based on endpoint roles",
      },
      {
        id: "b",
        text: "Dynamic computer groups with filters for the application's presence",
      },
      {
        id: "c",
        text: "Direct targeting of endpoints based on IP address",
      },
      {
        id: "d",
        text: "Role-Based Access Control (RBAC) settings for application visibility",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice B is correct because dynamic computer groups with filters set to detect the presence of the new application can automatically adjust membership as the application is installed or removed, providing real-time verification. Choice A is less efficient due to the manual updating required. Choice C is not practical for targeting based on software presence. Choice D is incorrect as RBAC pertains to user access and permissions within Tanium, not endpoint software verification.",
    tags: [
      "dynamic-computer-groups",
      "application-verification",
      "endpoint-targeting",
      "role-based-targeting",
    ],
    id: "REFINI-GEN-1760813354981-7",
  },
  {
    question:
      "To improve network security posture, you decide to segment endpoints into groups based on operating system versions. This strategy is to prioritize patching efforts. Which type of computer group is most suitable for this task?",
    choices: [
      {
        id: "a",
        text: "Static computer groups updated quarterly",
      },
      {
        id: "b",
        text: "Dynamic computer groups based on OS version sensors",
      },
      {
        id: "c",
        text: "Static computer groups with manual daily updates",
      },
      {
        id: "d",
        text: "Dynamic computer groups based on last login date",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Choice B is correct because dynamic computer groups automatically adjust membership based on operating system version sensor data, ensuring that patching efforts can be accurately and efficiently prioritized. Choice A is incorrect because static groups require manual updating and may become quickly outdated. Choice C is labor-intensive and impractical. Choice D is irrelevant to the task of segmenting endpoints for patching based on OS versions.",
    tags: [
      "dynamic-computer-groups",
      "operating-system-version",
      "patching-strategy",
      "network-security-posture",
    ],
    id: "REFINI-GEN-1760813354981-8",
  },
  {
    question:
      "You need to enforce stricter security policies on endpoints used by the executive team. You decide to create a dedicated computer group for these devices. What is the most effective method to ensure this group accurately reflects the current executive team's endpoint usage?",
    choices: [
      {
        id: "a",
        text: "Manually assign endpoints to the group based on device names",
      },
      {
        id: "b",
        text: "Use RBAC to automatically assign executive endpoints to the group",
      },
      {
        id: "c",
        text: "Create a dynamic group based on user login names associated with the executive team",
      },
      {
        id: "d",
        text: "Schedule a weekly script to update the group based on asset management data",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Choice C is correct because creating a dynamic group that automatically updates based on user login names associated with the executive team ensures the group accurately and efficiently reflects the current devices in use without manual intervention. Choice A is prone to being outdated due to manual processes. Choice B is incorrect because RBAC controls access within Tanium, not dynamic group membership. Choice D is inefficient and may not provide real-time accuracy due to the delay in updates.",
    tags: [
      "dynamic-computer-groups",
      "executive-team-security",
      "user-based-targeting",
      "security-policy",
    ],
    id: "REFINI-GEN-1760813354981-9",
  },
  {
    question:
      "Following a security breach, you must identify all endpoints with a specific vulnerable software version installed. The list of affected endpoints changes daily. Which method provides the most efficient ongoing identification of these endpoints?",
    choices: [
      {
        id: "a",
        text: "Manually check each endpoint daily using the Interact module",
      },
      {
        id: "b",
        text: "Configure a Connect workflow to email a daily report of affected endpoints",
      },
      {
        id: "c",
        text: "Create a dynamic computer group based on the presence of the vulnerable software version",
      },
      {
        id: "d",
        text: "Use the Deploy module to uninstall the software from all endpoints",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Choice C is correct because creating a dynamic computer group that updates based on the presence of the specific vulnerable software version allows for efficient and ongoing identification of affected endpoints. Choice A is impractical and labor-intensive. Choice B, while automated, provides information post-factum and does not aid in real-time identification. Choice D is a mitigation step but does not aid in identifying affected endpoints.",
    tags: [
      "dynamic-computer-groups",
      "vulnerable-software-identification",
      "security-breach-response",
      "ongoing-monitoring",
    ],
    id: "REFINI-GEN-1760813354981-10",
  },
  {
    question:
      "You're configuring a new dynamic computer group to identify endpoints that haven't reported back in over 24 hours. Which filter criteria should you use to ensure accurate targeting?",
    choices: [
      {
        id: "a",
        text: "Last login time exceeds 24 hours",
      },
      {
        id: "b",
        text: "Last check-in time exceeds 24 hours",
      },
      {
        id: "c",
        text: "Operating system installation date exceeds 24 hours",
      },
      {
        id: "d",
        text: "Endpoint encryption status is enabled",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Last check-in time exceeding 24 hours is correct because it directly relates to the frequency of endpoint communication with the Tanium server, identifying inactive devices. Choice A (Last login time exceeds 24 hours) is incorrect because it refers to user activity, not endpoint communication status. Choice C (Operating system installation date exceeds 24 hours) is irrelevant for tracking active communication. Choice D (Endpoint encryption status is enabled) is unrelated to communication frequency.",
    tags: [
      "dynamic-computer-groups",
      "endpoint-management",
      "filter-criteria",
      "targeting-endpoints",
    ],
    id: "REFINI-GEN-1760821502721-1",
  },
  {
    question:
      "During a security audit, you need to quickly identify all endpoints running Windows 10 version 1809 that haven't been patched in the last 90 days. What's the most efficient way to filter your query?",
    choices: [
      {
        id: "a",
        text: "Use basic filtering for Windows 10 and manually check each for patch dates",
      },
      {
        id: "b",
        text: "Employ Boolean logic in filters combining OS version and patch date",
      },
      {
        id: "c",
        text: "Query each endpoint individually for its OS version and last patch date",
      },
      {
        id: "d",
        text: "Create a static group for Windows 10 endpoints and manually update patch dates",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Using Boolean logic in filters to combine OS version and patch date is the most efficient method, as it allows for precise targeting of endpoints matching both criteria simultaneously. Choice A (basic filtering for Windows 10) lacks the specific patch date criteria. Choice C (query each endpoint individually) is highly inefficient. Choice D (create a static group) doesn't dynamically update or utilize patch date information effectively.",
    tags: ["advanced-filtering", "boolean-logic", "security-audit", "efficient-querying"],
    id: "REFINI-GEN-1760821502721-2",
  },
  {
    question:
      "You're tasked with deploying a new software only to laptops within your organization. How do you best target these endpoints?",
    choices: [
      {
        id: "a",
        text: "Query all endpoints and manually select those identified as laptops",
      },
      {
        id: "b",
        text: "Use a dynamic group based on hardware type for targeting",
      },
      {
        id: "c",
        text: "Deploy the software to all endpoints and rely on installer checks",
      },
      {
        id: "d",
        text: "Create a static group and regularly update it with laptop endpoints",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Using a dynamic group based on hardware type for targeting is the most efficient, as it automatically updates and accurately targets only laptops. Choice A (query all endpoints manually) is time-consuming and prone to error. Choice C (deploy software to all endpoints) is not efficient and could lead to unnecessary resource usage. Choice D (create a static group) requires manual updates, making it less efficient than a dynamic group.",
    tags: [
      "dynamic-computer-groups",
      "software-deployment",
      "endpoint-targeting",
      "hardware-type-filtering",
    ],
    id: "REFINI-GEN-1760821502721-3",
  },
  {
    question:
      "A new regulation requires all endpoints within certain departments to have specific security software installed. How would you ensure compliance using Tanium?",
    choices: [
      {
        id: "a",
        text: "Manually check each department's endpoints for the software",
      },
      {
        id: "b",
        text: "Utilize RBAC to restrict access to the software to compliant departments",
      },
      {
        id: "c",
        text: "Create dynamic groups based on department and software presence, then target missing installations",
      },
      {
        id: "d",
        text: "Deploy the security software globally and assume compliance",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Creating dynamic groups based on department and software presence allows for precise targeting and automated compliance checks by identifying endpoints within specific departments that lack the required software. Choice A (manually checking) is inefficient and error-prone. Choice B (using RBAC) manages user access but doesn't ensure software installation. Choice D (global deployment) may not meet department-specific requirements.",
    tags: ["dynamic-computer-groups", "RBAC", "security-compliance", "software-installation"],
    id: "REFINI-GEN-1760821502721-4",
  },
  {
    question:
      "To optimize performance when targeting a large set of endpoints for a critical update, what filter optimization technique should you apply?",
    choices: [
      {
        id: "a",
        text: "Use broad, non-specific filters to capture the largest audience",
      },
      {
        id: "b",
        text: "Implement specific, criteria-based filters to minimize query scope",
      },
      {
        id: "c",
        text: "Target all endpoints, then manually exclude non-relevant ones",
      },
      {
        id: "d",
        text: "Query endpoints in batches based on geographic location",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Implementing specific, criteria-based filters to minimize query scope is the most efficient approach, as it reduces the amount of data processed and focuses on relevant endpoints, improving performance. Choice A (broad filters) would unnecessarily increase the query's scope. Choice C (target all, then exclude) is inefficient and resource-intensive. Choice D (query in batches) can be useful but doesn't inherently optimize performance like specific filtering does.",
    tags: [
      "filter-performance-optimization",
      "critical-update",
      "endpoint-targeting",
      "query-efficiency",
    ],
    id: "REFINI-GEN-1760821502721-5",
  },
  {
    question:
      "When setting up a new content set for a team that only manages mobile devices, what scoping strategy ensures they only interact with relevant endpoints?",
    choices: [
      {
        id: "a",
        text: "Scope the content set to include all endpoints, relying on users to select mobile devices",
      },
      {
        id: "b",
        text: "Use RBAC to limit user actions to mobile-device management tasks only",
      },
      {
        id: "c",
        text: "Scope the content set specifically to dynamic groups of mobile devices",
      },
      {
        id: "d",
        text: "Create a new user role for mobile device management without specific scoping",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Scoping the content set specifically to dynamic groups of mobile devices ensures that the team only accesses and interacts with relevant endpoints, enhancing efficiency and reducing the risk of unintended actions on non-relevant endpoints. Choice A (scope to include all endpoints) lacks precision and increases risk. Choice B (use RBAC for task limitation) doesn't inherently limit visibility or interaction with endpoint types. Choice D (create a new user role) addresses user permissions but not content set scoping to endpoint type.",
    tags: ["content-set-scoping", "mobile-device-management", "RBAC", "dynamic-computer-groups"],
    id: "REFINI-GEN-1760821502721-7",
  },
  {
    question:
      "Your organization requires a hierarchy of computer groups to manage endpoints by geographic region, OS type, and department. What is the first step in creating an effective group structure?",
    choices: [
      {
        id: "a",
        text: "Create a static group for each OS type within every department",
      },
      {
        id: "b",
        text: "Establish top-level dynamic groups based on geographic location",
      },
      {
        id: "c",
        text: "Assign all endpoints to a single, large dynamic group for initial sorting",
      },
      {
        id: "d",
        text: "Implement RBAC to manage user access by geographic region first",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Advanced Concepts",
    explanation:
      "Establishing top-level dynamic groups based on geographic location is an effective first step because it allows for broad categorization of endpoints, which can then be further refined by OS type and department. This hierarchical approach enables efficient and targeted management. Choice A (create a static group for each OS type) preempts geographic and departmental considerations. Choice C (assign to a single group) lacks the structured approach necessary for efficient management. Choice D (implement RBAC first) addresses user access, not the structuring of endpoint groups.",
    tags: ["computer-group-hierarchy", "geographic-targeting", "dynamic-vs-static-groups", "RBAC"],
    id: "REFINI-GEN-1760821502721-8",
  },
  {
    question:
      "For an upcoming audit, you need to ensure all endpoints in the Finance department are part of a specific computer group. What approach allows for the most efficient management of group membership?",
    choices: [
      {
        id: "a",
        text: "Manually add and remove endpoints based on employee role changes",
      },
      {
        id: "b",
        text: "Use a dynamic group with filters based on departmental attributes",
      },
      {
        id: "c",
        text: "Create a static group and periodically review its membership for accuracy",
      },
      {
        id: "d",
        text: "Implement a script to update group memberships based on network activity logs",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Using a dynamic group with filters based on departmental attributes is the most efficient approach, as it automatically updates memberships based on real-time endpoint data, ensuring that all relevant endpoints are continuously included without manual intervention. Choice A (manual addition/removal) is labor-intensive and prone to error. Choice C (create a static group) requires manual updates, making it less efficient. Choice D (script based on network logs) is complex and may not accurately reflect departmental membership.",
    tags: [
      "dynamic-computer-groups",
      "group-membership-management",
      "departmental-targeting",
      "audit-compliance",
    ],
    id: "REFINI-GEN-1760821502721-9",
  },
  {
    question:
      "To minimize network impact while targeting endpoints for a large-scale software deployment across multiple departments, which targeting strategy should you employ?",
    choices: [
      {
        id: "a",
        text: "Deploy the software to one department at a time, based on network usage patterns",
      },
      {
        id: "b",
        text: "Use a broad filter to target all endpoints simultaneously for efficiency",
      },
      {
        id: "c",
        text: "Create dynamic groups by department with deployment schedules staggered by time zone",
      },
      {
        id: "d",
        text: "Rely on endpoint self-reporting to determine the optimal deployment window for each",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Creating dynamic groups by department with deployment schedules staggered by time zone allows for a controlled, efficient distribution that minimizes network impact by spreading the load. This targeted approach ensures timely updates while respecting departmental and geographic differences. Choice A (one department at a time) could unnecessarily prolong the deployment process. Choice B (broad filter for all endpoints) risks significant network strain. Choice D (endpoint self-reporting) lacks the predictability and control needed for large-scale deployments.",
    tags: [
      "software-deployment",
      "targeting-strategy",
      "network-impact-minimization",
      "dynamic-computer-groups",
    ],
    id: "REFINI-GEN-1760821502721-10",
  },
  {
    question:
      "You are tasked with ensuring that only endpoints in the HR department can access a sensitive HR management tool. You need to dynamically group these endpoints for targeted management. Which approach should you use to create this group?",
    choices: [
      {
        id: "a",
        text: "Static computer group based on current HR endpoint list",
      },
      {
        id: "b",
        text: "Dynamic computer group based on department attribute",
      },
      {
        id: "c",
        text: "Manual assignment of endpoints to the HR tool access list",
      },
      {
        id: "d",
        text: "Use RBAC to assign tool access to HR department users",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Dynamic computer group based on department attribute is correct because it allows the group to update automatically as endpoints change or new HR endpoints are added, ensuring that all relevant devices are targeted without manual intervention. Choice A is incorrect because static groups do not update automatically, requiring manual adjustments. Choice C is incorrect because manual assignment isn't practical for dynamic environments and doesn't leverage Tanium's capabilities. Choice D is incorrect as RBAC controls user access within Tanium, not endpoint access to specific tools.",
    tags: [
      "dynamic-computer-groups",
      "RBAC",
      "targeting-specific-endpoints",
      "group-membership-management",
    ],
    id: "REFINI-GEN-1760821571026-1",
  },
  {
    question:
      "A cybersecurity analyst needs to apply a critical patch to all endpoints running a specific version of an application vulnerable to a recent exploit. Which approach ensures only the affected endpoints are targeted for the patch?",
    choices: [
      {
        id: "a",
        text: "Use a static computer group of all endpoints and manually select the affected ones",
      },
      {
        id: "b",
        text: "Create a dynamic computer group with filters for the application and version number",
      },
      {
        id: "c",
        text: "Deploy the patch to all endpoints and rely on the install conditions to target the correct ones",
      },
      {
        id: "d",
        text: "Email users with instructions on how to manually check for the application version and apply the patch if needed",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Creating a dynamic computer group with filters for the application and version number is correct because it automatically targets the specific endpoints that match the vulnerability criteria, ensuring accurate and efficient patching. Choice A is incorrect as it requires manual effort and is prone to error. Choice C is inefficient and risky, as unnecessary deployment to non-affected endpoints can lead to unwanted issues. Choice D is highly unreliable and does not leverage Tanium's capabilities for automated patch management.",
    tags: [
      "dynamic-computer-groups",
      "advanced-filtering",
      "targeting-specific-endendpoints",
      "patch-management",
    ],
    id: "REFINI-GEN-1760821571026-2",
  },
  {
    question:
      "Your organization requires that only IT administrators have the ability to execute actions on endpoints within the IT department. Which Tanium feature should you configure to meet this requirement?",
    choices: [
      {
        id: "a",
        text: "Dynamic computer groups based on the IT department attribute",
      },
      {
        id: "b",
        text: "Content set scoping to limit access to IT-related sensors and packages",
      },
      {
        id: "c",
        text: "RBAC to define roles and permissions for IT administrators",
      },
      {
        id: "d",
        text: "Static computer groups for all IT endpoints",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "RBAC to define roles and permissions for IT administrators is correct because it directly controls who can perform what actions on which endpoints, aligning with the requirement to restrict execution capabilities to IT administrators for IT department endpoints. Choice A is incorrect as dynamic groups target endpoints based on attributes but do not restrict actions based on user roles. Choice B is incorrect because content set scoping limits access to content but does not link this access to specific user roles or departments. Choice D is incorrect as static computer groups would not automatically update and do not inherently restrict action permissions to specific user roles.",
    tags: ["RBAC", "role-based-access-control", "security-best-practices", "user-permissions"],
    id: "REFINI-GEN-1760821571026-3",
  },
  {
    question:
      "You're optimizing Tanium for performance and need to ensure that questions run efficiently across thousands of endpoints. Which technique should you primarily focus on to improve question performance?",
    choices: [
      {
        id: "a",
        text: "Limit questions to use only sensor data already collected",
      },
      {
        id: "b",
        text: "Use boolean logic in filters to refine question results",
      },
      {
        id: "c",
        text: "Increase the frequency of scheduled question collections",
      },
      {
        id: "d",
        text: "Deploy additional Tanium modules to collect more data",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Using boolean logic in filters to refine question results is correct because it enables more precise targeting of endpoints, reducing the amount of data processed and consequently improving question performance. Choice A is partially correct but limiting questions to only pre-collected sensor data might not always be feasible for real-time needs. Choice C is incorrect as increasing the frequency of question collections could actually degrade performance by adding load to the network and endpoints. Choice D is incorrect because deploying additional modules increases system demands, potentially worsening performance instead of improving it.",
    tags: [
      "filter-performance-optimization",
      "boolean-logic-filters",
      "efficiency",
      "question-optimization",
    ],
    id: "REFINI-GEN-1760821571026-4",
  },
  {
    question:
      "During a compliance audit, you need to identify endpoints that do not have the required security software installed. To automate this process for future audits, which type of computer group should you create?",
    choices: [
      {
        id: "a",
        text: "A static computer group for endpoints identified in the first audit",
      },
      {
        id: "b",
        text: "A dynamic computer group based on the presence of the security software",
      },
      {
        id: "c",
        text: "Manual tagging of non-compliant endpoints after each audit",
      },
      {
        id: "d",
        text: "A dynamic computer group based on user department regardless of software presence",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "A dynamic computer group based on the presence of the security software is correct because it allows for automatic updates to group membership as endpoints become compliant or fall out of compliance, facilitating ongoing audit readiness. Choice A is incorrect as it requires manual update after each audit, making it ineffective for continuous compliance monitoring. Choice C is also incorrect due to the manual effort involved, which does not leverage Tanium's capabilities for automation. Choice D is incorrect as it groups endpoints based on an unrelated criterion, which doesn't address the compliance requirement.",
    tags: [
      "dynamic-computer-groups",
      "compliance-auditing",
      "security-software-verification",
      "automated-targeting",
    ],
    id: "REFINI-GEN-1760821571026-5",
  },
  {
    question:
      "To minimize network impact, you've been asked to target a software deployment to only those laptops within the sales department that do not already have the software installed. What is the best way to configure this targeting in Tanium?",
    choices: [
      {
        id: "a",
        text: "Create a static computer group for sales department laptops and manually remove those with the software installed",
      },
      {
        id: "b",
        text: "Use advanced filtering techniques to create a dynamic group targeting sales laptops without the software",
      },
      {
        id: "c",
        text: "Deploy the software to all endpoints and rely on the installer to check if it's already installed",
      },
      {
        id: "d",
        text: "Apply RBAC to restrict software deployment to users in the sales department",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Using advanced filtering techniques to create a dynamic group targeting sales laptops without the software is correct because it precisely targets the necessary endpoints without unnecessary network impact, automatically updating as endpoints' status change. Choice A is inefficient and error-prone due to manual management. Choice C assumes the installer's efficiency but can still cause unnecessary network traffic. Choice D misinterprets RBAC's purpose, which controls user access within Tanium rather than targeting endpoints for actions.",
    tags: [
      "advanced-filtering-techniques",
      "dynamic-computer-groups",
      "software-deployment",
      "network-optimization",
    ],
    id: "REFINI-GEN-1760821571026-6",
  },
  {
    question:
      "You need to ensure that only endpoints running Windows 10 or newer are included in a computer group for a Windows 10-specific configuration policy. Which approach will effectively automate this membership?",
    choices: [
      {
        id: "a",
        text: "Static computer group updated monthly with new Windows 10 endpoints",
      },
      {
        id: "b",
        text: "Dynamic computer group with a filter for the operating system version",
      },
      {
        id: "c",
        text: "Manual tagging of Windows 10 endpoints by the IT team",
      },
      {
        id: "d",
        text: "Creating a user group for employees using Windows 10 and newer systems",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "A dynamic computer group with a filter for the operating system version is correct because it allows for the automatic update of group membership based on the operating system criteria, ensuring that only compatible endpoints are targeted. Choice A is not practical as it requires constant manual updates. Choice C is labor-intensive and inefficient for large deployments. Choice D confuses user groups with computer groups; the requirement is to target endpoints, not users, based on the operating system.",
    tags: [
      "dynamic-computer-groups",
      "operating-system-version",
      "configuration-policy-targeting",
      "automated-group-management",
    ],
    id: "REFINI-GEN-1760821571026-7",
  },
  {
    question:
      "Your company is deploying Tanium to a new geography and must ensure endpoints in this region can only be managed by local administrators. What is the most effective way to configure this?",
    choices: [
      {
        id: "a",
        text: "Create a static computer group for the region and assign it to local administrators",
      },
      {
        id: "b",
        text: "Utilize RBAC to create roles specific to the region and assign these to local administrators",
      },
      {
        id: "c",
        text: "Use content set scoping to restrict access to sensors and actions for the new geography",
      },
      {
        id: "d",
        text: "Configure dynamic computer groups to automatically include endpoints from the new geography based on IP range",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Utilizing RBAC to create roles specific to the region and assign these to local administrators is correct because it ensures that only designated local administrators have the authority to manage endpoints in the new geography, providing precise access control based on the organizational structure. Choice A does not inherently restrict management capabilities to local administrators. Choice C, while helpful for access control to content, does not specifically restrict endpoint management to local admins. Choice D automates group membership based on geography but does not address the need to restrict management capabilities.",
    tags: ["RBAC", "regional-deployment", "local-administrators", "access-control"],
    id: "REFINI-GEN-1760821571026-8",
  },
  {
    question:
      "In preparation for a security audit, you need to quickly identify all endpoints that have not run a full antivirus scan within the last 7 days. Which approach will best achieve this?",
    choices: [
      {
        id: "a",
        text: "Schedule a daily question asking for the last scan date and manually check responses",
      },
      {
        id: "b",
        text: "Create a dynamic computer group based on the last antivirus scan date",
      },
      {
        id: "c",
        text: "Deploy a script via the Tanium platform to initiate a scan on all endpoints",
      },
      {
        id: "d",
        text: "Use content set scoping to restrict endpoints not scanned in the last 7 days from accessing sensitive data",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Creating a dynamic computer group based on the last antivirus scan date is correct because it allows for automated, real-time tracking of endpoints meeting the specified criteria, facilitating rapid identification and remediation. Choice A is inefficient and prone to human error. Choice C addresses ensuring scans are run but doesn't directly help in identifying which endpoints are non-compliant. Choice D misapplies content set scoping, which doesn't serve to identify non-compliant endpoints but rather restricts access based on compliance status.",
    tags: [
      "dynamic-computer-groups",
      "antivirus-scan",
      "security-audit-preparation",
      "compliance-checking",
    ],
    id: "REFINI-GEN-1760821571026-9",
  },
  {
    question:
      "To support regulatory compliance, you must ensure that only endpoints with encrypted hard drives are allowed network access to sensitive financial systems. How can you best configure Tanium to continuously enforce this policy?",
    choices: [
      {
        id: "a",
        text: "Create a static computer group for endpoints with encrypted drives and review it monthly",
      },
      {
        id: "b",
        text: "Deploy a package to encrypt drives on all endpoints and assume compliance",
      },
      {
        id: "c",
        text: "Configure a dynamic computer group based on hard drive encryption status",
      },
      {
        id: "d",
        text: "Manually check each endpoint's encryption status and restrict network access accordingly",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Configuring a dynamic computer group based on hard drive encryption status is correct because it automates the process of identifying and managing endpoints that meet the compliance requirements, ensuring continuous enforcement without manual intervention. Choice A is not effective for continuous compliance as it requires manual updates. Choice B assumes deployment success and compliance but does not verify the current state. Choice D is impractically labor-intensive and does not leverage Tanium's capabilities for automation and real-time visibility.",
    tags: [
      "dynamic-computer-groups",
      "hard-drive-encryption",
      "regulatory-compliance",
      "automated-policy-enforcement",
    ],
    id: "REFINI-GEN-1760821571026-10",
  },
  {
    question:
      "You are configuring a new dynamic computer group in Tanium to include only Windows 10 endpoints that have not reported in the last 24 hours. What filter combination will accurately target the desired endpoints?",
    choices: [
      {
        id: "a",
        text: "Operating System contains 'Windows 10' AND Last Reported > 24 hours",
      },
      {
        id: "b",
        text: "Operating System equals 'Windows 10' AND Last Reported < 24 hours",
      },
      {
        id: "c",
        text: "Operating System regex 'Windows 10' AND Last Reported = 24 hours",
      },
      {
        id: "d",
        text: "Operating System contains 'Windows 10' AND Last Reported > 24 hours ago",
      },
    ],
    correctAnswerId: "d",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice D is correct because the filter 'Operating System contains 'Windows 10' AND Last Reported > 24 hours ago' accurately targets Windows 10 endpoints that haven't checked in for over a day. Choice A is incorrect because the '> 24 hours' operator is not correctly specified for time-based filters in Tanium. Choice B is incorrect because '< 24 hours' would incorrectly target endpoints that have reported in the last 24 hours. Choice C is incorrect because 'regex' and '= 24 hours' do not correctly apply to the criteria specified for targeting the endpoints.",
    tags: [
      "dynamic-computer-groups",
      "advanced-filtering",
      "boolean-logic-filters",
      "group-membership-management",
    ],
    id: "REFINI-GEN-1760821656147-1",
  },
  {
    question:
      "As part of an audit, you're tasked with identifying endpoints running unauthorized software. You decide to create a computer group for ongoing monitoring. Which approach ensures the group dynamically updates as new endpoints meet the criteria?",
    choices: [
      {
        id: "a",
        text: "Create a static group and manually update it weekly.",
      },
      {
        id: "b",
        text: "Create a dynamic group based on the software signature.",
      },
      {
        id: "c",
        text: "Use RBAC to restrict access to the unauthorized software.",
      },
      {
        id: "d",
        text: "Scope content to specific endpoints already identified.",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice B is correct because creating a dynamic group based on the software signature will ensure the group automatically updates when new endpoints meet the defined criteria (i.e., running unauthorized software). Choice A is incorrect because static groups do not dynamically update, requiring manual revision. Choice C is incorrect because using RBAC to restrict access does not help in identifying or grouping endpoints with unauthorized software. Choice D is incorrect because scoping content to specific endpoints only limits content execution and does not dynamically update group membership based on criteria.",
    tags: ["computer-groups", "dynamic-groups", "RBAC", "content-set-scoping"],
    id: "REFINI-GEN-1760821656147-2",
  },
  {
    question:
      "You're tasked with deploying a critical update to all endpoints, but you need to exclude servers due to their unique environment. Which targeting strategy in Tanium should you use to accurately deploy the update?",
    choices: [
      {
        id: "a",
        text: "Deploy to all endpoints and manually exclude servers based on a list.",
      },
      {
        id: "b",
        text: "Use a dynamic group excluding endpoints with 'Server' in their OS name.",
      },
      {
        id: "c",
        text: "Target all endpoints then retract the action from servers.",
      },
      {
        id: "d",
        text: "Apply the update to a static group created for desktop endpoints.",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice B is correct because using a dynamic group that excludes endpoints with 'Server' in their operating system name allows for precise targeting while dynamically updating as endpoints join or leave the criteria. Choice A is incorrect because manually excluding servers is error-prone and inefficient. Choice C is incorrect because retracting actions is not a recommended deployment strategy due to potential inconsistencies and timing issues. Choice D is incorrect because a static group does not dynamically update, potentially missing new desktop endpoints or including outdated ones.",
    tags: [
      "targeting-specific-endpoints",
      "dynamic-groups",
      "deployment-exclusion",
      "computer-group-hierarchy",
    ],
    id: "REFINI-GEN-1760821656147-3",
  },
  {
    question:
      "Your organization requires deploying a security tool only to laptops. To accomplish this, you need to create a computer group for laptops using Tanium. Which attribute should primarily be used to distinguish laptops from desktops?",
    choices: [
      {
        id: "a",
        text: "Operating system version",
      },
      {
        id: "b",
        text: "Chassis type",
      },
      {
        id: "c",
        text: "CPU model",
      },
      {
        id: "d",
        text: "Installed applications",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice B is correct because the chassis type attribute can be used to distinguish laptops from desktops, as it directly relates to the physical form factor of the device. Choice A is incorrect because the operating system version does not reliably indicate whether a device is a laptop or desktop. Choice C is incorrect because the CPU model may be used in both laptops and desktops and does not distinguish between them. Choice D is incorrect because installed applications may vary widely and do not provide a clear basis for distinguishing device types.",
    tags: [
      "dynamic-computer-groups",
      "endpoint-attributes",
      "targeting-specific-endpoints",
      "filter-performance-optimization",
    ],
    id: "REFINI-GEN-1760821656147-4",
  },
  {
    question:
      "You need to optimize a Tanium question that targets endpoints requiring a specific patch. The initial question takes too long to return results due to the large number of endpoints. Which strategy would most effectively optimize the filter performance?",
    choices: [
      {
        id: "a",
        text: "Increase the client cache size on each endpoint.",
      },
      {
        id: "b",
        text: "Use boolean logic to combine filters efficiently.",
      },
      {
        id: "c",
        text: "Target the question to all endpoints and filter results manually.",
      },
      {
        id: "d",
        text: "Ask the question during off-peak hours to reduce network load.",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice B is correct because using boolean logic to combine filters efficiently can significantly reduce the number of evaluated endpoints and speed up query response times. Choice A is incorrect because increasing the client cache size may affect local resource usage but does not directly optimize the performance of filtering in questions. Choice C is incorrect because targeting all endpoints and manually filtering results post-query is inefficient and does not leverage Tanium's capabilities to refine targeting. Choice D is incorrect because while asking questions during off-peak hours may reduce network load, it does not optimize the filter's performance or decrease the time to return results.",
    tags: [
      "filter-performance-optimization",
      "boolean-logic-filters",
      "advanced-filtering-techniques",
      "targeting-specific-endpoints",
    ],
    id: "REFINI-GEN-1760821656147-5",
  },
  {
    question:
      "After a security incident, you are tasked with identifying endpoints that accessed a specific malicious domain. You decide to use Tanium to query endpoints for DNS query logs. To minimize performance impact, what filter should you apply to narrow down the search?",
    choices: [
      {
        id: "a",
        text: "Time of last DNS query matches the incident time frame.",
      },
      {
        id: "b",
        text: "Endpoints with network connectivity in the last 24 hours.",
      },
      {
        id: "c",
        text: "Operating system type to limit to Windows endpoints.",
      },
      {
        id: "d",
        text: "DNS query matches the specific malicious domain.",
      },
    ],
    correctAnswerId: "d",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice D is correct because applying a filter that directly targets the DNS query matching the specific malicious domain will most efficiently narrow down the search to relevant endpoints. Choice A is incorrect because time of the last DNS query may not be specific enough to identify interactions with the malicious domain. Choice B is incorrect as having network connectivity in the last 24 hours is too broad and includes many endpoints not relevant to the incident. Choice C is incorrect because limiting to Windows endpoints does not directly correlate to accessing a specific domain and unnecessarily excludes non-Windows devices that could be affected.",
    tags: [
      "advanced-filtering-techniques",
      "filter-performance-optimization",
      "targeting-specific-endpoints",
      "boolean-logic-in-filters",
    ],
    id: "REFINI-GEN-1760821656147-6",
  },
  {
    question:
      "You've been asked to ensure that only members of the IT department can view and manage endpoints within the IT subnet. Which Tanium feature should you employ to achieve this requirement?",
    choices: [
      {
        id: "a",
        text: "Create a dynamic group for IT subnet endpoints and assign it to the IT user role.",
      },
      {
        id: "b",
        text: "Use RBAC to create a role specifically for the IT department with scoped access to the IT subnet.",
      },
      {
        id: "c",
        text: "Configure a static group for IT subnet endpoints and manually assign access to IT department members.",
      },
      {
        id: "d",
        text: "Implement content set scoping to limit IT department users' access to relevant tools and sensors.",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice B is correct because using Role-Based Access Control (RBAC) to create a role for the IT department with specific access to the IT subnet endpoints is the most direct and effective way to ensure that only IT department members can view and manage those endpoints. Choice A is incorrect because while creating a dynamic group is useful for organizing endpoints, groups alone do not control access permissions. Choice C is incorrect because a static group requires manual updates and, like Choice A, does not inherently control access. Choice D is incorrect because content set scoping is more about limiting access to content within Tanium rather than controlling which endpoints a user can view or manage.",
    tags: ["RBAC", "content-set-scoping", "dynamic-computer-groups", "computer-group-hierarchy"],
    id: "REFINI-GEN-1760821656147-7",
  },
  {
    question:
      "A recent policy change requires that all finance department computers must have a specific security software installed. To enforce this policy, you need to regularly identify finance computers lacking the software. Which Tanium feature should you utilize to automate this process?",
    choices: [
      {
        id: "a",
        text: "Configure a dynamic group for finance computers without the software.",
      },
      {
        id: "b",
        text: "Create a static group of all finance computers and check manually.",
      },
      {
        id: "c",
        text: "Employ RBAC to restrict finance users from using computers without the software.",
      },
      {
        id: "d",
        text: "Use content set scoping to limit the visibility of the software only to finance computers.",
      },
    ],
    correctAnswerId: "a",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice A is correct because configuring a dynamic group to include finance computers without the specified security software allows for automatic updating as endpoints fall in or out of compliance with the new policy. Choice B is incorrect because a static group does not dynamically update based on the installation status of the software, requiring manual checks. Choice C is incorrect because while RBAC can restrict user actions, it does not automate the process of identifying non-compliant computers. Choice D is incorrect because content set scoping controls access to Tanium content; it does not identify compliance with software installation policies.",
    tags: ["dynamic-computer-groups", "group-membership-management", "RBAC", "content-set-scoping"],
    id: "REFINI-GEN-1760821656147-8",
  },
  {
    question:
      "In preparation for a compliance audit, you need to ensure that only devices compliant with corporate security standards can access sensitive data. Which approach allows you to dynamically manage access based on compliance status?",
    choices: [
      {
        id: "a",
        text: "Manually update access permissions based on monthly compliance reports.",
      },
      {
        id: "b",
        text: "Use a dynamic group based on compliance status to automatically adjust access.",
      },
      {
        id: "c",
        text: "Configure RBAC to grant access based on user roles, not device compliance.",
      },
      {
        id: "d",
        text: "Implement a static group of devices known to be compliant and update quarterly.",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice B is correct because using a dynamic group that adjusts membership based on compliance status ensures that only compliant devices can access sensitive data, automating the management process. Choice A is incorrect because manually updating permissions is time-consuming and prone to error, making it inadequate for dynamic compliance requirements. Choice C is incorrect because RBAC based on user roles does not address device compliance. Choice D is incorrect because a static group would not automatically update with compliance status changes, rendering it ineffective for real-time compliance enforcement.",
    tags: ["dynamic-computer-groups", "compliance-audit", "RBAC", "group-membership-management"],
    id: "REFINI-GEN-1760821656147-9",
  },
  {
    question:
      "You're implementing a policy to automatically isolate endpoints detected with a known vulnerability until they are patched. What Tanium feature should you utilize to automate the isolation of vulnerable endpoints?",
    choices: [
      {
        id: "a",
        text: "Create a static group for endpoints with the vulnerability and isolate manually.",
      },
      {
        id: "b",
        text: "Employ RBAC to limit network access for users of vulnerable endpoints.",
      },
      {
        id: "c",
        text: "Use a dynamic group based on vulnerability detection to trigger isolation policies.",
      },
      {
        id: "d",
        text: "Apply content set scoping to prevent execution of any applications on vulnerable endpoints.",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice C is correct because using a dynamic group that automatically includes endpoints detected with a known vulnerability enables the triggering of isolation policies for those endpoints without manual intervention. Choice A is incorrect because a static group requires manual updating and does not facilitate automatic isolation. Choice B is incorrect because employing RBAC to limit network access based on user roles does not directly correlate with the dynamic nature of vulnerabilities on endpoints. Choice D is incorrect because content set scoping limits access to Tanium content and does not directly enable the isolation of vulnerable endpoints.",
    tags: ["dynamic-computer-groups", "vulnerability-management", "RBAC", "content-set-scoping"],
    id: "REFINI-GEN-1760821656147-10",
  },
  {
    question:
      "You are tasked with ensuring only devices within the marketing department receive a new software deployment. To accurately target these devices, you decide to create a computer group. Considering the dynamic nature of the department's device roster, which type of computer group should you create?",
    choices: [
      {
        id: "a",
        text: "A static computer group based on device names",
      },
      {
        id: "b",
        text: "A dynamic computer group based on user department attributes",
      },
      {
        id: "c",
        text: "A static computer group based on IP addresses",
      },
      {
        id: "d",
        text: "A dynamic computer group based on installed applications",
      },
    ],
    correctAnswerId: "b",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "A dynamic computer group based on user department attributes is correct because it automatically updates its membership based on the defined criteria, thus accurately reflecting the current state of the marketing department's devices. Choice A is incorrect because static groups do not update automatically, making them unsuitable for departments with changing device rosters. Choice C is incorrect for the same reason as A and also because IP addresses can change and may not accurately reflect departmental membership. Choice D is incorrect because installed applications are not a reliable indicator of departmental membership.",
    tags: [
      "dynamic-computer-groups",
      "targeting-specific-endpoints",
      "group-membership-management",
    ],
    id: "REFINI-GEN-1760821684026-1",
  },
  {
    question:
      "Your organization requires a weekly report on endpoints missing critical security updates. To optimize performance, you need to create a saved question targeting only Windows machines with a specific vulnerability. Which of the following filter clauses should you use to refine your targeting?",
    choices: [
      {
        id: "a",
        text: "Operating System contains 'Windows' AND Vulnerability ID equals '12345'",
      },
      {
        id: "b",
        text: "Operating System starts with 'Win' OR Vulnerability ID equals '12345'",
      },
      {
        id: "c",
        text: "Operating System regex 'Win.*' AND Vulnerability ID not equals '12345'",
      },
      {
        id: "d",
        text: "Operating System contains 'Linux' AND Vulnerability ID equals '12345'",
      },
    ],
    correctAnswerId: "a",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Choice A is correct because it precisely targets Windows machines that match a specific vulnerability by using 'contains' and 'equals', which are both efficient and accurate filter types for this scenario. Choice B is incorrect as the 'OR' operator would broaden the target unnecessarily, potentially including non-Windows devices or devices without the specific vulnerability. Choice C is incorrect because the 'not equals' operator would exclude the relevant vulnerability, and regex could be less efficient. Choice D is incorrect as it targets Linux machines, not Windows.",
    tags: [
      "advanced-filtering-techniques",
      "boolean-logic-in-filters",
      "filter-performance-optimization",
    ],
    id: "REFINI-GEN-1760821684026-2",
  },
  {
    question:
      "As part of a new security directive, you need to ensure that only senior IT administrators can modify the configurations of Tanium's core modules. Which Tanium feature should you configure to enforce this requirement?",
    choices: [
      {
        id: "a",
        text: "Configure static computer groups for IT administrators",
      },
      {
        id: "b",
        text: "Set up dynamic computer groups with RBAC criteria",
      },
      {
        id: "c",
        text: "Implement Role-Based Access Control (RBAC) with specific permissions",
      },
      {
        id: "d",
        text: "Adjust content set scoping to restrict module access",
      },
    ],
    correctAnswerId: "c",
    domain: "Refining Questions & Targeting",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Implementing Role-Based Access Control (RBAC) with specific permissions is correct because it allows you to define precise access controls based on user roles, ensuring that only senior IT administrators have the necessary permissions to modify core module configurations. Choice A is incorrect because static computer groups control endpoint groupings, not user permissions. Choice B is incorrect for a similar reason; while it involves dynamic grouping, it's relevant to endpoints and not user access management. Choice D is incorrect because content set scoping is related to the visibility and management of content within Tanium, not user permissions.",
    tags: ["RBAC", "role-based-access-control", "module-configurations"],
    id: "REFINI-GEN-1760821684026-3",
  },
];

export default generatedQuestions;
