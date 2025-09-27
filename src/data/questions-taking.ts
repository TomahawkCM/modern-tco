import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * Taking Action - Packages & Actions Questions
 * 34 questions for the Taking Action - Packages & Actions domain
 */

export const takingQuestions: Question[] = [
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
    category: "Practical Scenarios",
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
    category: "Console Procedures",
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
    category: "Console Procedures",
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
    category: "Troubleshooting",
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
    category: "Practical Scenarios",
    explanation:
      "Packages requiring elevated privileges need the Tanium Client to be running with appropriate administrative rights on the target systems. Without proper privileges, the package execution will fail regardless of other factors like disk space or bandwidth.",
    tags: ["elevated-privileges", "client-permissions", "deployment"],
    studyGuideRef: "tco-study-path/packages",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
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
    category: "Troubleshooting",
    explanation:
      "Domain controllers typically have enhanced security restrictions and may require specific privileges or have policies that prevent certain operations. The fact that 90% succeeded suggests the package works, but domain controllers have special requirements that need to be addressed.",
    tags: ["domain-controllers", "security-restrictions", "deployment-troubleshooting"],
    studyGuideRef: "tco-study-path/packages",
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
    category: "Console Procedures",
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
    category: "Practical Scenarios",
    explanation:
      "A package is a pre-built template containing the scripts and parameters needed to perform tasks, while an action is a specific instance of executing that package against targeted systems with configured parameters.",
    tags: ["packages-vs-actions", "deployment-concepts", "templates"],
    studyGuideRef: "tco-study-path/packages",
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
    category: "Troubleshooting",
    explanation:
      "A 'Success' status with no visible changes suggests the action executed without errors but didn't perform the expected operations. Examining output logs and package logic helps identify whether the package detected existing conditions, encountered environmental issues, or has logic flaws that prevent the intended changes.",
    tags: ["action-verification", "package-logic", "success-troubleshooting"],
    studyGuideRef: "tco-study-path/packages",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
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
    category: "Troubleshooting",
    explanation:
      "Analyzing failure patterns by grouping errors, system types, and environmental factors provides the most actionable insights. This systematic analysis can reveal common root causes, environmental issues, or system-specific problems that can be addressed before retry attempts.",
    tags: ["failure-analysis", "pattern-recognition", "deployment-troubleshooting"],
    studyGuideRef: "tco-study-path/packages",
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
    category: "Practical Scenarios",
    explanation:
      "When modifying system files, confirming that the package has been tested and that critical system files are backed up is most critical. This ensures the ability to recover from any unintended consequences and validates the package functionality before widespread deployment.",
    tags: ["system-files", "backup-procedures", "pre-deployment-testing"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "blueprint/security-considerations",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
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
    category: "Troubleshooting",
    explanation:
      "Inconsistent results across similar systems require comprehensive analysis of system differences (hardware, OS, patches), network factors (routing, firewalls, bandwidth), and action execution details (logs, errors, timing). Each factor can contribute to deployment inconsistencies.",
    tags: ["deployment-inconsistencies", "systematic-analysis", "multi-factor-troubleshooting"],
    studyGuideRef: "tco-study-path/packages",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
    explanation:
      "Emergency approval procedures that allow immediate deployment while ensuring post-deployment review and documentation provide the best balance between urgent security needs and governance requirements. This maintains accountability while enabling rapid response.",
    tags: ["emergency-procedures", "security-response", "governance-balance"],
    studyGuideRef: "tco-study-path/packages",
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
    category: "Practical Scenarios",
    explanation:
      "Registry changes affecting boot behavior require careful handling: thorough non-production testing to validate functionality, phased deployment to limit risk exposure, and registry backup/rollback procedures in case changes cause boot issues.",
    tags: ["registry-changes", "boot-behavior", "risk-mitigation"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "blueprint/security-considerations",
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
    category: "Practical Scenarios",
    explanation:
      "Versioned toolsets consolidate configuration actions and eliminate timing errors between when a solution configuration is made and when it reaches endpoints. This greatly reduces installation time and improves targeting flexibility.",
    tags: ["endpoint-configuration", "toolsets", "configuration-management", "timing"],
    studyGuideRef: "tco-study-path/endpoint-configuration",
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
    category: "Practical Scenarios",
    explanation:
      "A pilot deployment with progressive rollout and success criteria minimizes risk while enabling rapid response. This allows validation of package effectiveness on a small group before broader deployment, with automatic progression based on success metrics.",
    tags: ["incident-response", "deployment-strategy", "risk-management", "progressive-rollout"],
    studyGuideRef: "tco-study-path/incident-response",
    officialRef: "platform/progressive-deployment",
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
    category: "Practical Scenarios",
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
    category: "Troubleshooting",
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
    category: "Practical Scenarios",
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
    category: "Troubleshooting",
    explanation:
      "Tanium Client logs on affected endpoints contain the detailed action execution information needed for troubleshooting. Each time a Client receives an action message, execution details and results are logged locally, making Client logs the primary source for package troubleshooting.",
    tags: ["action-logs", "client-logs", "troubleshooting", "package-debugging"],
    studyGuideRef: "tco-study-path/action-logging",
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
    category: "Practical Scenarios",
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
    category: "Practical Scenarios",
    explanation:
      "30 endpoints is typically recommended as the minimum target for the final ring in progressive deployment. This provides sufficient coverage to validate success before full deployment while maintaining manageable scope for the final phase.",
    tags: ["progressive-deployment", "ring-sizing", "deployment-planning", "endpoint-targets"],
    studyGuideRef: "tco-study-path/deployment-sizing",
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
    category: "Console Procedures",
    explanation:
      "Multi-tier approval workflows require approvals from different levels of authority before actions can proceed. Even with proper permissions, the action waits until all required approvals in the configured workflow are obtained.",
    tags: ["approval-workflow", "multi-tier", "deployment", "troubleshooting"],
    studyGuideRef: "tco-study-path/actions",
    officialRef: "deploy/approval-workflows",
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
    category: "Practical Scenarios",
    explanation:
      "'Running' status indicates that the action is actively executing on target endpoints. The package is being deployed and installed on the systems in the target group.",
    tags: ["action-status", "package-deployment", "running", "execution"],
    studyGuideRef: "tco-study-path/actions",
    officialRef: "deploy/action-status-definitions",
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
    category: "Practical Scenarios",
    explanation:
      "Effective deployment monitoring includes real-time progress tracking to identify issues early, error log review to understand any failures, and sample endpoint verification to confirm successful installation before full completion.",
    tags: ["deployment-monitoring", "progress-tracking", "error-logs", "endpoint-verification"],
    studyGuideRef: "tco-study-path/actions",
    officialRef: "deploy/deployment-monitoring",
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
    category: "Practical Scenarios",
    explanation:
      "Package deployment configuration requires the package file location, target computer group specification, deployment schedule (immediate or scheduled), and success criteria definition to determine when deployment is considered complete.",
    tags: ["package-deployment", "configuration", "target-groups", "deployment-schedule"],
    studyGuideRef: "tco-study-path/actions",
    officialRef: "deploy/package-configuration",
  },
  {
    id: "TCO-TA-0035",
    question:
      "When using Tanium Endpoint Configuration, what is the primary advantage of using a baseline configuration approach?",
    choices: [
      {
        id: "a",
        text: "It reduces the number of packages needed for deployment",
      },
      {
        id: "b",
        text: "It provides a standardized configuration state that can be consistently applied and maintained",
      },
      {
        id: "c",
        text: "It automatically updates configurations when new versions are available",
      },
      {
        id: "d",
        text: "It eliminates the need for approval workflows",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Baseline configuration provides a standardized configuration state that can be consistently applied across endpoints and maintained over time. This ensures configuration consistency and simplifies management of large endpoint populations.",
    tags: [
      "endpoint-configuration",
      "baseline-configuration",
      "standardization",
      "configuration-management",
    ],
    studyGuideRef: "tco-study-path/endpoint-configuration",
  },
  {
    id: "TCO-TA-0036",
    question:
      "You need to deploy a configuration change that requires system services to be restarted in a specific order. What deployment approach ensures proper sequencing?",
    choices: [
      {
        id: "a",
        text: "Deploy multiple packages simultaneously and let the system handle sequencing",
      },
      {
        id: "b",
        text: "Create a single package that handles the entire sequence with proper dependencies",
      },
      {
        id: "c",
        text: "Deploy packages individually with manual timing between each deployment",
      },
      {
        id: "d",
        text: "Use scheduled deployments with different time intervals for each package",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Creating a single package that handles the entire sequence with proper dependencies ensures reliable sequencing and reduces the risk of timing issues that could occur with multiple separate deployments or manual coordination.",
    tags: ["service-sequencing", "deployment-dependencies", "service-restart", "package-design"],
    studyGuideRef: "tco-study-path/packages",
    officialRef: "university/advanced-packaging",
  },
  {
    id: "TCO-TA-0037",
    question:
      "When deploying packages during a maintenance window, what scheduling consideration is most important for minimizing business impact?",
    choices: [
      {
        id: "a",
        text: "Deploy all packages at the exact start of the maintenance window",
      },
      {
        id: "b",
        text: "Stagger deployments based on system criticality and recovery time requirements",
      },
      {
        id: "c",
        text: "Deploy packages in alphabetical order by system name",
      },
      {
        id: "d",
        text: "Deploy to the largest system groups first to maximize efficiency",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Staggering deployments based on system criticality and recovery time requirements ensures that less critical systems are updated first, allowing time for validation before updating critical systems, and provides buffer time for recovery if issues occur.",
    tags: [
      "maintenance-window",
      "deployment-scheduling",
      "business-impact",
      "criticality-assessment",
    ],
    studyGuideRef: "tco-study-path/deployment-planning",
  },
  {
    id: "TCO-TA-0038",
    question:
      "An action deployment shows partial success with some endpoints reporting 'Action Stopped'. What is the most likely cause and appropriate response?",
    choices: [
      {
        id: "a",
        text: "Network timeout - increase timeout settings and retry",
      },
      {
        id: "b",
        text: "Manual intervention or system shutdown interrupted the action - investigate and resume as appropriate",
      },
      {
        id: "c",
        text: "Package corruption - re-upload the package and redeploy",
      },
      {
        id: "d",
        text: "Insufficient privileges - escalate permissions and retry",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "'Action Stopped' typically indicates that the action was manually interrupted or the system was shut down during execution. Investigation is needed to determine if the interruption was intentional and whether it's safe to resume the action.",
    tags: ["action-stopped", "manual-intervention", "deployment-interruption", "troubleshooting"],
    studyGuideRef: "tco-study-path/action-troubleshooting",
  },
  {
    id: "TCO-TA-0039",
    question:
      "When creating a custom package for software deployment, what validation step is most critical before production use?",
    choices: [
      {
        id: "a",
        text: "Verify package file size is optimized for network transmission",
      },
      {
        id: "b",
        text: "Test the package in a controlled environment that mirrors production",
      },
      {
        id: "c",
        text: "Confirm the package is digitally signed",
      },
      {
        id: "d",
        text: "Validate that all required approvals are configured",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Testing the package in a controlled environment that mirrors production is critical to validate functionality, identify potential issues, and ensure the package works correctly with the target environment's specific configurations and dependencies.",
    tags: [
      "custom-packages",
      "testing-validation",
      "controlled-environment",
      "pre-production-testing",
    ],
    studyGuideRef: "tco-study-path/package-development",
    officialRef: "university/package-testing",
  },
  {
    id: "TCO-TA-0040",
    question:
      "What is the primary purpose of the 'Distribute over time' option in action deployment?",
    choices: [
      {
        id: "a",
        text: "To ensure all endpoints receive the action simultaneously",
      },
      {
        id: "b",
        text: "To reduce network congestion and server load by spreading deployment over a specified duration",
      },
      {
        id: "c",
        text: "To provide time for manual approval at each stage",
      },
      {
        id: "d",
        text: "To allow for automatic rollback if issues are detected",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "The 'Distribute over time' option spreads action deployment across a specified time period to reduce network congestion and server load, preventing system overload when deploying to large numbers of endpoints.",
    tags: ["distribute-over-time", "network-optimization", "load-balancing", "deployment-settings"],
    studyGuideRef: "tco-study-path/deployment-optimization",
  },
  {
    id: "TCO-TA-0041",
    question:
      "During a security incident, you need to deploy a containment action to affected systems. What deployment strategy balances speed with risk management?",
    choices: [
      {
        id: "a",
        text: "Deploy to all affected systems simultaneously for maximum speed",
      },
      {
        id: "b",
        text: "Use a small pilot deployment first, then rapid progressive rollout with monitoring",
      },
      {
        id: "c",
        text: "Deploy only to the most critical systems first",
      },
      {
        id: "d",
        text: "Wait for full testing and approval before any deployment",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "A small pilot deployment followed by rapid progressive rollout with monitoring provides the best balance during security incidents. It validates the containment action works correctly while enabling rapid deployment to contain the threat across all affected systems.",
    tags: ["security-incident", "containment-actions", "pilot-deployment", "incident-response"],
    studyGuideRef: "tco-study-path/incident-response",
    officialRef: "blueprint/security-response",
  },
  {
    id: "TCO-TA-0042",
    question:
      "What information should you document when an action deployment experiences unexpected results?",
    choices: [
      {
        id: "a",
        text: "Only the final success/failure statistics",
      },
      {
        id: "b",
        text: "Action details, target systems, error patterns, environmental factors, and resolution steps",
      },
      {
        id: "c",
        text: "Just the error messages from failed systems",
      },
      {
        id: "d",
        text: "The time and date of the deployment only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Comprehensive documentation including action details, target systems, error patterns, environmental factors, and resolution steps provides valuable information for future troubleshooting and helps build organizational knowledge for similar situations.",
    tags: [
      "deployment-documentation",
      "troubleshooting-records",
      "knowledge-management",
      "incident-analysis",
    ],
    studyGuideRef: "tco-study-path/deployment-management",
  },
  {
    id: "TCO-TA-0043",
    question:
      "When deploying a package that requires network connectivity to external resources, what validation should be performed first?",
    choices: [
      {
        id: "a",
        text: "Verify that all target endpoints have internet access",
      },
      {
        id: "b",
        text: "Test connectivity from target endpoints to required external resources and validate firewall rules",
      },
      {
        id: "c",
        text: "Confirm the external resources are available from the Tanium server",
      },
      {
        id: "d",
        text: "Check that the package contains all necessary files for offline operation",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Testing connectivity from target endpoints to required external resources and validating firewall rules ensures that the package will be able to access necessary external resources during execution, preventing failures due to network restrictions.",
    tags: ["external-resources", "network-validation", "firewall-rules", "connectivity-testing"],
    studyGuideRef: "tco-study-path/network-requirements",
  },
  {
    id: "TCO-TA-0044",
    question:
      "What is the best practice for handling sensitive parameters in package configurations?",
    choices: [
      {
        id: "a",
        text: "Hard-code sensitive values directly in the package for security",
      },
      {
        id: "b",
        text: "Use parameter encryption and secure credential management systems",
      },
      {
        id: "c",
        text: "Store sensitive parameters in plain text files on the Tanium server",
      },
      {
        id: "d",
        text: "Include sensitive parameters in deployment documentation only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Console Procedures",
    explanation:
      "Using parameter encryption and secure credential management systems protects sensitive information while allowing packages to access required credentials securely during execution. This follows security best practices for credential management.",
    tags: [
      "sensitive-parameters",
      "parameter-encryption",
      "credential-management",
      "security-practices",
    ],
    studyGuideRef: "tco-study-path/security-configuration",
    officialRef: "blueprint/credential-security",
  },
  {
    id: "TCO-TA-0045",
    question:
      "A package deployment succeeds on Windows systems but fails on Linux systems with permission errors. What is the most systematic approach to resolve this?",
    choices: [
      {
        id: "a",
        text: "Increase timeout settings for Linux systems only",
      },
      {
        id: "b",
        text: "Analyze the package scripts for platform-specific permission requirements and adjust accordingly",
      },
      {
        id: "c",
        text: "Deploy the package with elevated privileges on all systems",
      },
      {
        id: "d",
        text: "Create separate packages for Windows and Linux systems",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Analyzing the package scripts for platform-specific permission requirements allows for understanding the root cause and implementing appropriate solutions, such as adjusting file permissions, using sudo correctly, or modifying script execution methods for Linux environments.",
    tags: ["cross-platform", "permission-errors", "linux-windows", "platform-specific"],
    studyGuideRef: "tco-study-path/cross-platform-deployment",
  },
  {
    id: "TCO-TA-0046",
    question:
      "When performing a rollback of a failed configuration change, what validation step is most important before executing the rollback action?",
    choices: [
      {
        id: "a",
        text: "Verify that the rollback package has been approved by management",
      },
      {
        id: "b",
        text: "Confirm the rollback action will restore the system to the known good state and won't cause additional issues",
      },
      {
        id: "c",
        text: "Check that all systems are online and responsive",
      },
      {
        id: "d",
        text: "Ensure the rollback is scheduled during maintenance hours",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Confirming that the rollback action will restore the system to the known good state without causing additional issues is critical. This includes verifying that the rollback is compatible with any changes that occurred since the original deployment and won't conflict with other system configurations.",
    tags: ["rollback-procedures", "validation", "known-good-state", "change-management"],
    studyGuideRef: "tco-study-path/rollback-procedures",
    officialRef: "university/rollback-best-practices",
  },
  {
    id: "TCO-TA-0047",
    question:
      "What is the primary benefit of using Tanium's action groups feature when deploying packages?",
    choices: [
      {
        id: "a",
        text: "It reduces the package file size for transmission",
      },
      {
        id: "b",
        text: "It allows coordinated deployment of multiple related actions with dependency management",
      },
      {
        id: "c",
        text: "It automatically approves actions that are grouped together",
      },
      {
        id: "d",
        text: "It compresses multiple packages into a single deployment file",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Action groups allow coordinated deployment of multiple related actions with dependency management, ensuring that actions execute in the proper sequence and that dependencies are satisfied before execution.",
    tags: ["action-groups", "coordinated-deployment", "dependency-management", "multi-action"],
    studyGuideRef: "tco-study-path/action-groups",
  },
  {
    id: "TCO-TA-0048",
    question:
      "During a large-scale software deployment, you notice that some endpoints are consistently failing while others in the same network succeed. What analysis approach provides the most insight?",
    choices: [
      {
        id: "a",
        text: "Compare hardware specifications between successful and failed endpoints",
      },
      {
        id: "b",
        text: "Analyze system characteristics, patch levels, installed software, and local configurations",
      },
      {
        id: "c",
        text: "Review network latency measurements between server and endpoints",
      },
      {
        id: "d",
        text: "Check antivirus logs for potential interference",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Analyzing system characteristics, patch levels, installed software, and local configurations provides comprehensive insight into why some endpoints fail consistently. This systematic approach can identify missing prerequisites, conflicting software, or configuration differences that affect deployment success.",
    tags: ["deployment-failures", "system-analysis", "endpoint-comparison", "failure-patterns"],
    studyGuideRef: "tco-study-path/deployment-troubleshooting",
  },
  {
    id: "TCO-TA-0049",
    question:
      "What is the recommended approach when a package requires specific user context or interactive elements during deployment?",
    choices: [
      {
        id: "a",
        text: "Deploy during business hours when users are logged in",
      },
      {
        id: "b",
        text: "Redesign the package to run in system context without user interaction, or use staged deployment with user notification",
      },
      {
        id: "c",
        text: "Require users to manually initiate the package installation",
      },
      {
        id: "d",
        text: "Deploy only to systems where users are currently active",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Redesigning the package to run in system context without user interaction provides the most reliable deployment. If user interaction is absolutely necessary, staged deployment with user notification allows for controlled installation while maintaining automation where possible.",
    tags: ["user-context", "interactive-deployment", "system-context", "package-design"],
    studyGuideRef: "tco-study-path/package-development",
    officialRef: "university/context-deployment",
  },
  {
    id: "TCO-TA-0050",
    question:
      "When troubleshooting action deployment issues, what information from the Tanium Client logs is most valuable for root cause analysis?",
    choices: [
      {
        id: "a",
        text: "Only the final success or failure status",
      },
      {
        id: "b",
        text: "Error messages, execution timestamps, return codes, and system environment details",
      },
      {
        id: "c",
        text: "Network connectivity status only",
      },
      {
        id: "d",
        text: "User activity during action execution",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.TAKING_ACTION,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Troubleshooting",
    explanation:
      "Error messages, execution timestamps, return codes, and system environment details provide comprehensive information for root cause analysis. This information helps identify what went wrong, when it occurred, what the system returned, and the environmental conditions during execution.",
    tags: ["client-logs", "root-cause-analysis", "error-messages", "troubleshooting-data"],
    studyGuideRef: "tco-study-path/log-analysis",
  },
];

export const takingQuestionMetadata = {
  domain: TCODomain.TA,
  totalQuestions: 50,
  difficultyBreakdown: {
    beginner: 11,
    intermediate: 25,
    advanced: 14,
  },
};
