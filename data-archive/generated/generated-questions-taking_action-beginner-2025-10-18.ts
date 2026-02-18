import { Difficulty, type Question, QuestionCategory, TCODomain } from "@/types/exam";

/**
 * AI-Generated Questions
 *
 * Domain: taking_action
 * Difficulty: beginner
 * Count: 30
 * Generated: 2025-10-18T21:28:30.747Z
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedQuestions: Question[] = [
  {
    question:
      "You're tasked with deploying a new security tool across all endpoints. The tool's installer requires specific configuration parameters for each department. How should you deploy this package to ensure correct configuration?",
    choices: [
      {
        id: "a",
        text: "Use a single package with hardcoded parameters.",
      },
      {
        id: "b",
        text: "Create individual packages for each department.",
      },
      {
        id: "c",
        text: "Deploy a general package and manually configure each endpoint.",
      },
      {
        id: "d",
        text: "Utilize package parameters and deploy a customizable package.",
      },
    ],
    correctAnswerId: "d",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Utilizing package parameters and deploying a customizable package is correct because it allows you to specify different configurations for the security tool based on departmental needs in a scalable manner. Choice A is incorrect because hardcoding parameters lacks the flexibility needed for department-specific configurations. Choice B is incorrect due to the unnecessary overhead of maintaining multiple packages. Choice C is incorrect as manual configuration is not scalable or efficient for large numbers of endpoints.",
    tags: ["package-deployment-workflows", "package-parameters", "scalability", "configuration"],
    id: "TAKING-GEN-1760816457611-1",
  },
  {
    question:
      "A critical update needs to be applied outside of business hours to avoid disrupting users. How should you schedule this action in Tanium?",
    choices: [
      {
        id: "a",
        text: "Schedule the action immediately and inform users.",
      },
      {
        id: "b",
        text: "Manually initiate the action after business hours.",
      },
      {
        id: "c",
        text: "Use the action scheduling feature to deploy during off-peak hours.",
      },
      {
        id: "d",
        text: "Deploy the action with no schedule and rely on endpoint availability.",
      },
    ],
    correctAnswerId: "c",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Using the action scheduling feature to deploy during off-peak hours is correct because it ensures the critical update is applied without disrupting users, by automating the deployment time. Choice A is incorrect as it disregards the need to avoid business hour disruptions. Choice B is inefficient and not scalable for large environments. Choice D lacks control and predictability in ensuring the update is applied at a convenient time.",
    tags: [
      "action-scheduling",
      "action-execution-monitoring",
      "update-deployment",
      "non-disruptive-updates",
    ],
    id: "TAKING-GEN-1760816457611-2",
  },
  {
    question:
      "After deploying a package to update a software across the network, you notice it caused issues on several endpoints. What is the most efficient way to address this situation?",
    choices: [
      {
        id: "a",
        text: "Manually uninstall the software on affected endpoints.",
      },
      {
        id: "b",
        text: "Deploy a new package to revert the update on all endpoints.",
      },
      {
        id: "c",
        text: "Use the rollback feature in Tanium to undo the action.",
      },
      {
        id: "d",
        text: "Wait for the next update hoping it resolves the issues.",
      },
    ],
    correctAnswerId: "c",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Using the rollback feature in Tanium to undo the action is the most efficient way to address this situation because it allows you to quickly revert changes on affected endpoints without manually uninstalling software or deploying another package. Choice A is not scalable or efficient. Choice B creates additional workload and may not address individual endpoint issues. Choice D is not a proactive approach to resolving the immediate issues.",
    tags: [
      "rollback-and-recovery-procedures",
      "action-execution-monitoring",
      "software-update",
      "issue-resolution",
    ],
    id: "TAKING-GEN-1760816457611-3",
  },
  {
    question:
      "Your team needs to regularly deploy a custom script to monitor endpoint health, but wants to minimize administrative overhead. What is the best approach to achieve this?",
    choices: [
      {
        id: "a",
        text: "Deploy the script manually each time.",
      },
      {
        id: "b",
        text: "Develop a package in Tanium with the script and set it as pre-approved.",
      },
      {
        id: "c",
        text: "Share the script with end-users for self-installation.",
      },
      {
        id: "d",
        text: "Request IT support to install the script on demand.",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Developing a package in Tanium with the script and setting it as pre-approved is the best approach because it streamlines the deployment process, reduces administrative overhead, and ensures the script is consistently applied across endpoints. Choice A is not efficient for regular deployments. Choice C risks non-compliance and varied execution outcomes. Choice D is inefficient and creates unnecessary bottlenecks in the deployment process.",
    tags: [
      "package-development-basics",
      "pre-approved-actions",
      "script-deployment",
      "administrative-efficiency",
    ],
    id: "TAKING-GEN-1760816457611-4",
  },
  {
    question:
      "To enhance security, your organization decides to regularly change local administrator passwords on all endpoints. Which Tanium package deployment feature should you leverage to accomplish this?",
    choices: [
      {
        id: "a",
        text: "Deploy a generic package for password updates",
      },
      {
        id: "b",
        text: "Utilize dynamic package parameters for password inputs",
      },
      {
        id: "c",
        text: "Rely on endpoint users to manually update passwords",
      },
      {
        id: "d",
        text: "Schedule a recurring manual action for IT staff to update passwords",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Utilizing dynamic package parameters for password inputs is correct because it allows you to securely and efficiently deploy variable information, like new passwords, to endpoints as part of a package deployment, ensuring all endpoints are updated in a controlled manner. Choice A lacks the necessary flexibility for secure password handling. Choice C offloads critical security tasks to end-users, increasing the risk of non-compliance. Choice D is not scalable or efficient for large organizations.",
    tags: [
      "package-parameters",
      "dynamic-configuration",
      "security-enhancement",
      "password-management",
    ],
    id: "TAKING-GEN-1760816457612-5",
  },
  {
    question:
      "A department has requested the installation of custom software that requires approval each time before deployment. Which configuration should you use to manage this requirement in Tanium?",
    choices: [
      {
        id: "a",
        text: "Set the package as pre-approved for automatic deployment.",
      },
      {
        id: "b",
        text: "Configure an action approval workflow for each deployment.",
      },
      {
        id: "c",
        text: "Deploy the software manually to control installation times.",
      },
      {
        id: "d",
        text: "Use the Connect module to automate software deployment approvals.",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Configuring an action approval workflow for each deployment is correct because it ensures that each instance of the software installation is reviewed and authorized, meeting the department's requirement for controlled deployment. Choice A does not satisfy the need for approval before each installation. Choice C is not scalable or efficient for regular deployments. Choice D is incorrect because the Connect module is designed for integration and data export tasks, not for managing deployment approvals.",
    tags: [
      "action-approval-workflows",
      "custom-software-deployment",
      "controlled-installation",
      "review-and-authorization",
    ],
    id: "TAKING-GEN-1760816457612-6",
  },
  {
    question:
      "During a routine check, you discover a package deployed to several endpoints did not execute as expected due to incorrect parameters. What is your immediate next step to correct this?",
    choices: [
      {
        id: "a",
        text: "Redeploy the package with the correct parameters to all endpoints.",
      },
      {
        id: "b",
        text: "Manually correct the parameters on each affected endpoint.",
      },
      {
        id: "c",
        text: "Revert the action using Tanium's rollback feature, then redeploy.",
      },
      {
        id: "d",
        text: "Inform the affected department to manually fix the issue.",
      },
    ],
    correctAnswerId: "c",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Reverting the action using Tanium's rollback feature, then redeploying with the correct parameters is the immediate next step because it ensures that any changes made by the initial deployment are safely undone before applying the correct configuration, reducing the risk of further issues. Choice A might not resolve any problems created by the initial incorrect deployment. Choice B is not efficient or scalable. Choice D offloads the resolution process to affected departments, which is not practical.",
    tags: [
      "rollback-and-recovery-procedures",
      "action-execution-monitoring",
      "corrective-actions",
      "deployment-accuracy",
    ],
    id: "TAKING-GEN-1760816457612-7",
  },
  {
    question:
      "Your organization requires that all deployed actions be monitored for execution status and results. What is the best practice in Tanium for achieving this?",
    choices: [
      {
        id: "a",
        text: "Check the status manually on each endpoint.",
      },
      {
        id: "b",
        text: "Use the Dashboard module to create custom views of action statuses.",
      },
      {
        id: "c",
        text: "Rely on endpoint users to report completion and issues.",
      },
      {
        id: "d",
        text: "Utilize the action execution monitoring features within Tanium.",
      },
    ],
    correctAnswerId: "d",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Utilizing the action execution monitoring features within Tanium is the best practice because these features are specifically designed to provide real-time status updates and results of deployed actions across all endpoints, ensuring efficient oversight and issue resolution. Choice A is impractical and not scalable. Choice B, while useful for certain visualizations, does not offer the same level of detail and immediacy. Choice C is unreliable and does not provide the necessary oversight.",
    tags: ["action-execution-monitoring", "best-practices", "real-time-updates", "efficiency"],
    id: "TAKING-GEN-1760816457612-8",
  },
  {
    question:
      "To ensure compliance, you need to deploy a security configuration update monthly. Which feature should you use to automate this process in Tanium?",
    choices: [
      {
        id: "a",
        text: "Create a one-time action for each monthly update.",
      },
      {
        id: "b",
        text: "Develop a manual process for IT to follow each month.",
      },
      {
        id: "c",
        text: "Schedule a recurring action for automatic deployment.",
      },
      {
        id: "d",
        text: "Use the Connect module to send reminders to the IT team.",
      },
    ],
    correctAnswerId: "c",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Scheduling a recurring action for automatic deployment is correct because it allows you to automate the process of deploying security configuration updates, ensuring compliance without manual intervention each month. Choice A does not automate the process and requires setting up a new action each month. Choice B is prone to human error and inefficient. Choice D uses Connect in a way that addresses communication but doesn't solve the need for automation in deployment.",
    tags: ["action-scheduling", "compliance", "security-configuration-update", "automation"],
    id: "TAKING-GEN-1760816457612-9",
  },
  {
    question:
      "You are planning to deploy a new software package across the organization. To minimize disruptions, you need to ensure the software is only installed outside of business hours. However, your organization operates in multiple time zones. How should you configure the deployment?",
    choices: [
      {
        id: "a",
        text: "Schedule the deployment manually in each time zone.",
      },
      {
        id: "b",
        text: "Use Tanium's action scheduling to target endpoints based on local time zones.",
      },
      {
        id: "c",
        text: "Deploy immediately and allow endpoints to install at next availability.",
      },
      {
        id: "d",
        text: "Require users to initiate the software installation themselves.",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Using Tanium's action scheduling to target endpoints based on local time zones is correct because it allows you to automate the deployment process while ensuring installations occur during off-hours in each time zone, minimizing disruptions. Choice A is inefficient and prone to error. Choice C does not guarantee the installation will happen outside of business hours. Choice D offloads responsibility to end-users, leading to potential non-compliance and varied installation times.",
    tags: [
      "action-scheduling",
      "time-zone-management",
      "software-deployment",
      "minimizing-disruptions",
    ],
    id: "TAKING-GEN-1760816457612-10",
  },
  {
    question:
      "You're planning to deploy a new software package to all endpoints within your organization. The deployment must occur outside of business hours to minimize impact on user productivity. Which feature should you use to schedule this deployment?",
    choices: [
      {
        id: "a",
        text: "Action scheduling to specify the deployment time",
      },
      {
        id: "b",
        text: "Package parameters to set installation times",
      },
      {
        id: "c",
        text: "Action approval workflows to delay deployment",
      },
      {
        id: "d",
        text: "Pre-approved actions to automate deployment timing",
      },
    ],
    correctAnswerId: "a",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Action scheduling is correct because it allows you to specify the exact time and date for deployment, ensuring it occurs outside of business hours. Choice B (Package parameters) is incorrect because package parameters configure aspects of the package itself, not the timing of its deployment. Choice C (Action approval workflows) is incorrect because these workflows are for approving actions, not scheduling them. Choice D (Pre-approved actions) is incorrect because they allow certain actions to proceed without approval, not to schedule them for a specific time.",
    tags: ["action-scheduling", "software-deployment", "package-deployment", "business-hours"],
    id: "TAKING-GEN-1760822834245-1",
  },
  {
    question:
      "After deploying a package to update a critical application across multiple endpoints, you notice that the application fails to start on several machines. Which action should you take first to mitigate this issue?",
    choices: [
      {
        id: "a",
        text: "Use the Deploy module to re-execute the update package",
      },
      {
        id: "b",
        text: "Initiate a rollback procedure to revert the changes",
      },
      {
        id: "c",
        text: "Monitor the action execution in real-time for errors",
      },
      {
        id: "d",
        text: "Modify the package parameters to correct the issue",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Initiating a rollback procedure is correct because it quickly reverts the changes made by the problematic package, potentially restoring the critical application's functionality. Choice A (Use the Deploy module) is incorrect because simply re-executing the update package does not address the underlying problem. Choice C (Monitor the action execution) is incorrect because it helps identify issues but does not resolve the immediate problem. Choice D (Modify the package parameters) is incorrect because while it might prevent future issues, it does not address the immediate need to restore application functionality.",
    tags: ["rollback-procedures", "update-package", "critical-application", "package-deployment"],
    id: "TAKING-GEN-1760822834245-2",
  },
  {
    question:
      "Your team needs to deploy a security patch to address a new vulnerability. The patch must only be applied to affected endpoints running a specific version of an operating system. Which approach should you take to ensure accurate targeting?",
    choices: [
      {
        id: "a",
        text: "Use package parameters to define OS version requirements",
      },
      {
        id: "b",
        text: "Develop a custom sensor to identify affected endpoints",
      },
      {
        id: "c",
        text: "Apply the patch globally and rely on rollback if needed",
      },
      {
        id: "d",
        text: "Configure action approval workflows to manually select endpoints",
      },
    ],
    correctAnswerId: "a",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Using package parameters to define OS version requirements is correct because it ensures that the patch is only deployed to endpoints that meet the specific criteria, reducing the risk of unintended consequences. Choice B (Develop a custom sensor) is incorrect because while sensors are used to gather data, package parameters are the correct tool for controlling deployment based on specific criteria. Choice C (Apply the patch globally) is incorrect because it unnecessarily risks impacting non-affected systems. Choice D (Configure action approval workflows) is incorrect because this process is too manual and doesn't guarantee that only affected systems are targeted.",
    tags: ["package-parameters", "security-patch", "OS-version", "accurate-targeting"],
    id: "TAKING-GEN-1760822834245-3",
  },
  {
    question:
      "A critical update needs to be deployed immediately during business hours. However, your organization requires that all actions must be approved by the IT security team before execution. Which feature can ensure timely deployment while adhering to this policy?",
    choices: [
      {
        id: "a",
        text: "Configure pre-approved actions for the update",
      },
      {
        id: "b",
        text: "Use action scheduling to deploy after hours",
      },
      {
        id: "c",
        text: "Submit a manual request to the IT security team",
      },
      {
        id: "d",
        text: "Implement an automatic rollback in case of failure",
      },
    ],
    correctAnswerId: "a",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Configuring pre-approved actions for the update is correct because it allows the IT security team to approve the deployment method in advance, ensuring the critical update can be executed immediately without waiting for additional approvals. Choice B (Use action scheduling) is incorrect because the update needs to be deployed immediately, not after hours. Choice C (Submit a manual request) is incorrect because it could delay the deployment process. Choice D (Implement an automatic rollback) is incorrect because while it addresses failure, it does not solve the problem of obtaining timely approval.",
    tags: ["pre-approved-actions", "critical-update", "IT-security-approval", "timely-deployment"],
    id: "TAKING-GEN-1760822834245-4",
  },
  {
    question:
      "You've deployed a new security tool across the network, but you need to verify its installation status on all endpoints. Which Tanium module allows you to monitor the action execution progress in real-time?",
    choices: [
      {
        id: "a",
        text: "Deploy module for detailed execution reports",
      },
      {
        id: "b",
        text: "Interact module to ask real-time questions",
      },
      {
        id: "c",
        text: "Asset module for a comprehensive inventory check",
      },
      {
        id: "d",
        text: "Connect module to export installation status data",
      },
    ],
    correctAnswerId: "a",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "The Deploy module is correct because it provides detailed reports on the execution progress of actions, allowing you to monitor the deployment of new security tools in real-time. Choice B (Interact module) is incorrect because, while it can ask real-time questions, it does not provide detailed execution reports. Choice C (Asset module) is incorrect because it provides a static inventory check, not real-time monitoring. Choice D (Connect module) is incorrect because it's designed to export data, not monitor action execution.",
    tags: ["deploy-module", "execution-monitoring", "security-tool", "real-time-progress"],
    id: "TAKING-GEN-1760822834245-5",
  },
  {
    question:
      "In preparation for a software audit, you need to ensure that all devices in your network are running the latest version of a specific software. There's a package in the Tanium library that updates the software. Before deploying, what should you do first to minimize disruptions?",
    choices: [
      {
        id: "a",
        text: "Configure action approval workflows for the IT department",
      },
      {
        id: "b",
        text: "Use action scheduling to deploy the package during off-peak hours",
      },
      {
        id: "c",
        text: "Review and adjust package parameters to meet network needs",
      },
      {
        id: "d",
        text: "Apply pre-approved actions for immediate deployment",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Using action scheduling to deploy the package during off-peak hours is correct because it allows you to plan the deployment for a time when it is least likely to disrupt users or critical business processes. Choice A (Configure action approval workflows) is incorrect because while necessary for compliance, it doesn't address the timing of deployment. Choice C (Review and adjust package parameters) is incorrect because it focuses on the configuration of the package rather than minimizing disruptions. Choice D (Apply pre-approved actions) is incorrect because immediate deployment without considering timing could cause disruptions.",
    tags: ["action-scheduling", "software-audit", "minimize-disruptions", "package-deployment"],
    id: "TAKING-GEN-1760822834245-6",
  },
  {
    question:
      "After deploying a custom package to your endpoints, you realize that a critical mistake was made in the package configuration, potentially harming the system performance. Which recovery procedure should you immediately initiate?",
    choices: [
      {
        id: "a",
        text: "Deploy a new package with the correct configuration",
      },
      {
        id: "b",
        text: "Initiate a rollback procedure to revert the deployment",
      },
      {
        id: "c",
        text: "Use the Connect module to notify stakeholders",
      },
      {
        id: "d",
        text: "Modify action approval workflows to prevent future mistakes",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Initiating a rollback procedure is correct because it allows you to quickly revert the changes made by the faulty package, reducing the risk of system performance issues. Choice A (Deploy a new package) is incorrect because it might not address the immediate concern of the potentially harmful configuration already in place. Choice C (Use the Connect module) is incorrect because, while important for communication, it doesn't mitigate the issue. Choice D (Modify action approval workflows) is incorrect because it addresses future process improvements rather than the immediate need to recover from the mistake.",
    tags: [
      "rollback-procedure",
      "package-configuration",
      "system-performance",
      "recovery-procedure",
    ],
    id: "TAKING-GEN-1760822834245-7",
  },
  {
    question:
      "A recent update to an essential business application has caused compatibility issues on several endpoints. You need to remove this update quickly. Which Tanium feature allows you to reverse the action on specific endpoints?",
    choices: [
      {
        id: "a",
        text: "Deploy a corrective package targeting affected endpoints",
      },
      {
        id: "b",
        text: "Utilize the rollback feature to revert the endpoints to their previous state",
      },
      {
        id: "c",
        text: "Adjust package parameters for future deployments to avoid similar issues",
      },
      {
        id: "d",
        text: "Implement action approval workflows to review future updates more thoroughly",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Utilizing the rollback feature to revert the endpoints to their previous state is correct because it provides a quick and efficient method to undo the problematic update, directly addressing the compatibility issues. Choice A (Deploy a corrective package) is incorrect because it addresses the problem indirectly and might not be as quick as a rollback. Choice C (Adjust package parameters) is incorrect because it addresses future preventive measures rather than the current issue. Choice D (Implement action approval workflows) is incorrect because it's a governance measure, not a remedial action for the current problem.",
    tags: [
      "rollback-feature",
      "compatibility-issues",
      "business-application-update",
      "specific-endpoints",
    ],
    id: "TAKING-GEN-1760822834245-8",
  },
  {
    question:
      "You have been tasked with deploying a security configuration across all laptops in the organization. The deployment must only target laptops that are currently online to ensure immediate compliance. Which approach should you use to accurately target these devices?",
    choices: [
      {
        id: "a",
        text: "Deploy the package globally and rely on the Connect module for feedback",
      },
      {
        id: "b",
        text: "Use action scheduling to attempt deployment during typical business hours",
      },
      {
        id: "c",
        text: "Leverage real-time sensor data to target only online laptops",
      },
      {
        id: "d",
        text: "Configure package parameters to identify and target laptop devices only",
      },
    ],
    correctAnswerId: "c",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Leveraging real-time sensor data to target only online laptops is correct because it ensures that the security configuration is deployed immediately to devices that are currently active, meeting the requirement for immediate compliance. Choice A (Deploy the package globally) is incorrect because it does not specifically target online laptops. Choice B (Use action scheduling) is incorrect because it does not guarantee that the laptops targeted will be online. Choice D (Configure package parameters) is incorrect because while it can help identify laptops, it does not ensure they are online at the time of deployment.",
    tags: [
      "real-time-sensor-data",
      "security-configuration",
      "online-laptops",
      "immediate-compliance",
    ],
    id: "TAKING-GEN-1760822834245-9",
  },
  {
    question:
      "Your organization requires that all deployed packages must be reviewed and approved by two separate departments before execution. Which Tanium feature should you configure to comply with this internal policy?",
    choices: [
      {
        id: "a",
        text: "Configure action approval workflows with multi-stage approvals",
      },
      {
        id: "b",
        text: "Set up pre-approved actions for each department",
      },
      {
        id: "c",
        text: "Use the Deploy module to manually request approvals",
      },
      {
        id: "d",
        text: "Implement rollback procedures for unapproved actions",
      },
    ],
    correctAnswerId: "a",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Configuring action approval workflows with multi-stage approvals is correct because it allows you to set up a process that meets the organization's requirement for reviews by two separate departments before any package deployment. Choice B (Set up pre-approved actions) is incorrect because it bypasses the need for approval at the time of deployment. Choice C (Use the Deploy module to manually request approvals) is incorrect because it does not automate the approval process as required by the policy. Choice D (Implement rollback procedures) is incorrect because it addresses the aftermath of an unapproved action rather than the approval process itself.",
    tags: [
      "action-approval-workflows",
      "multi-stage-approvals",
      "internal-policy",
      "package-deployment",
    ],
    id: "TAKING-GEN-1760822834245-10",
  },
  {
    question:
      "You've been tasked with deploying a new software package to all endpoints within your organization. However, you must ensure that deployment only occurs outside of business hours to prevent disruption. Which feature should you use to schedule the deployment?",
    choices: [
      {
        id: "a",
        text: "Package Instant Execution",
      },
      {
        id: "b",
        text: "Action Approval Workflow",
      },
      {
        id: "c",
        text: "Scheduled Actions",
      },
      {
        id: "d",
        text: "Pre-approved Actions",
      },
    ],
    correctAnswerId: "c",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Scheduled Actions is correct because it allows you to specify a time for deployment, ensuring it occurs outside of business hours. Choice A (Package Instant Execution) is incorrect because it executes immediately without scheduling. Choice B (Action Approval Workflow) is incorrect because it's used for approving actions, not scheduling them. Choice D (Pre-approved Actions) is incorrect because it refers to actions that are pre-approved for execution without scheduling capabilities.",
    tags: [
      "action-scheduling",
      "package-deployment",
      "deployment-workflows",
      "practical-application",
    ],
    id: "TAKING-GEN-1760822910625-1",
  },
  {
    question:
      "A critical update needs to be rolled back from a group of endpoints due to unexpected issues. What is the first step you should take to initiate the rollback process?",
    choices: [
      {
        id: "a",
        text: "Deploy a new package to overwrite the update",
      },
      {
        id: "b",
        text: "Use the Revert feature in the Deploy module",
      },
      {
        id: "c",
        text: "Contact Tanium Support for rollback assistance",
      },
      {
        id: "d",
        text: "Execute a rollback script through Scheduled Actions",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Use the Revert feature in the Deploy module is correct because it's designed to rollback actions or packages directly from the Tanium Console. Choice A (Deploy a new package to overwrite the update) is incorrect because it introduces more complexity and potential errors. Choice C (Contact Tanium Support for rollback assistance) is incorrect as the first step since Tanium provides direct rollback capabilities. Choice D (Execute a rollback script through Scheduled Actions) is incorrect because using the Deploy module's Revert feature is more straightforward and designed for this purpose.",
    tags: ["rollback-procedures", "deploy-module", "action-execution", "practical-application"],
    id: "TAKING-GEN-1760822910625-2",
  },
  {
    question:
      "While preparing to deploy a critical security update, you notice the package requires specific configuration parameters for different endpoint groups. How can you ensure the correct parameters are used for each deployment?",
    choices: [
      {
        id: "a",
        text: "Modify the package for each group and create separate actions",
      },
      {
        id: "b",
        text: "Use the same action and manually adjust parameters for each endpoint",
      },
      {
        id: "c",
        text: "Use package parameters and configuration templates",
      },
      {
        id: "d",
        text: "Deploy the package without parameters and configure manually post-deployment",
      },
    ],
    correctAnswerId: "c",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Use package parameters and configuration templates is correct because it allows for the customization of deployment parameters for different groups without creating multiple packages. Choice A (Modify the package for each group and create separate actions) is incorrect because it's inefficient and prone to error. Choice B (Use the same action and manually adjust parameters for each endpoint) is incorrect due to impracticality with large numbers of endpoints. Choice D (Deploy the package without parameters and configure manually post-deployment) is incorrect because it negates the benefits of automated deployment and increases workload.",
    tags: [
      "package-parameters",
      "configuration-templates",
      "package-deployment",
      "practical-application",
    ],
    id: "TAKING-GEN-1760822910625-3",
  },
  {
    question:
      "Your team has developed a new internal tool that needs to be rapidly deployed across all endpoints. You need to monitor the execution of this action closely to ensure success. Which Tanium feature should you use to monitor the action execution?",
    choices: [
      {
        id: "a",
        text: "The Reports Dashboard",
      },
      {
        id: "b",
        text: "Action Execution Monitoring in the Deploy module",
      },
      {
        id: "c",
        text: "Scheduled Actions log",
      },
      {
        id: "d",
        text: "Asset module for endpoint status",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Action Execution Monitoring in the Deploy module is correct because it provides real-time feedback and status updates on the execution of actions across endpoints. Choice A (The Reports Dashboard) is incorrect because, while useful for summaries, it may not provide the granular, real-time execution data needed. Choice C (Scheduled Actions log) is incorrect because it's more about when actions are scheduled, not the real-time execution status. Choice D (Asset module for endpoint status) is incorrect because the Asset module focuses on inventory, not action execution.",
    tags: [
      "action-execution-monitoring",
      "deploy-module",
      "real-time-monitoring",
      "practical-application",
    ],
    id: "TAKING-GEN-1760822910625-4",
  },
  {
    question:
      "A package deployment to a remote office failed due to network issues, and you need to ensure it is executed again once the network is stable. What is the most efficient way to set up this deployment?",
    choices: [
      {
        id: "a",
        text: "Manually monitor the network and redeploy when stable",
      },
      {
        id: "b",
        text: "Use Pre-approved Actions for automatic re-execution",
      },
      {
        id: "c",
        text: "Configure Action Approval Workflows for immediate redeployment",
      },
      {
        id: "d",
        text: "Schedule the action with retry options for network failure",
      },
    ],
    correctAnswerId: "d",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Schedule the action with retry options for network failure is correct because it automates the redeployment process in the event of network issues, reducing manual monitoring and intervention. Choice A (Manually monitor the network and redeploy when stable) is incorrect because it's inefficient and time-consuming. Choice B (Use Pre-approved Actions for automatic re-execution) is incorrect because pre-approved actions do not specifically address network instability. Choice C (Configure Action Approval Workflows for immediate redeployment) is incorrect because approval workflows manage deployment permissions, not network-related retry logic.",
    tags: ["action-scheduling", "network-issues", "retry-options", "package-deployment"],
    id: "TAKING-GEN-1760822910625-5",
  },
  {
    question:
      "Your organization requires that all deployed actions must be approved by a senior IT administrator to ensure compliance with internal policies. Which Tanium feature enables this workflow?",
    choices: [
      {
        id: "a",
        text: "Deploy module with administrator-only access",
      },
      {
        id: "b",
        text: "Scheduled Actions with mandatory review",
      },
      {
        id: "c",
        text: "Action Approval Workflow",
      },
      {
        id: "d",
        text: "Pre-approved Actions list with admin oversight",
      },
    ],
    correctAnswerId: "c",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Action Approval Workflow is correct because it introduces a mandatory step of approval by designated personnel before an action is executed, aligning with the need for compliance with internal policies. Choice A (Deploy module with administrator-only access) is incorrect because it limits access but doesn't enforce a review or approval step. Choice B (Scheduled Actions with mandatory review) is incorrect because while scheduling is a feature, it doesn't inherently require a review. Choice D (Pre-approved Actions list with admin oversight) is incorrect because it pre-approves actions without the need for each one to be reviewed, which doesn't meet the compliance requirement.",
    tags: ["action-approval-workflows", "IT-administrator", "compliance", "internal-policies"],
    id: "TAKING-GEN-1760822910625-6",
  },
  {
    question:
      "After deploying a package, you realize it was configured incorrectly for a subset of endpoints, causing performance issues. What is the best immediate action to mitigate the impact while you prepare a corrected package?",
    choices: [
      {
        id: "a",
        text: "Use the Revert feature in the Deploy module",
      },
      {
        id: "b",
        text: "Immediately power off affected endpoints",
      },
      {
        id: "c",
        text: "Deploy a script to manually stop the service",
      },
      {
        id: "d",
        text: "Schedule a future action to correct the package",
      },
    ],
    correctAnswerId: "a",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Use the Revert feature in the Deploy module is correct because it allows you to quickly undo the deployment, mitigating any negative impacts from the misconfigured package. Choice B (Immediately power off affected endpoints) is incorrect because it's a drastic action that could cause data loss or other issues. Choice C (Deploy a script to manually stop the service) is incorrect because it requires additional time and effort, which may not be immediate. Choice D (Schedule a future action to correct the package) is incorrect because it doesn't address the immediate impact of the misconfiguration.",
    tags: ["rollback-procedures", "deploy-module", "package-configuration", "immediate-action"],
    id: "TAKING-GEN-1760822910625-7",
  },
  {
    question:
      "You are preparing to deploy a new version of an application across your organization. To minimize risk, you decide to deploy the package to a small group of test endpoints first. Which Tanium feature should you use to accomplish this?",
    choices: [
      {
        id: "a",
        text: "Deploy to All Endpoints with immediate effect",
      },
      {
        id: "b",
        text: "Use Action Targeting to select the test group",
      },
      {
        id: "c",
        text: "Pre-approved Actions for the test group",
      },
      {
        id: "d",
        text: "Action Approval Workflow targeting all endpoints",
      },
    ],
    correctAnswerId: "b",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Use Action Targeting to select the test group is correct because it allows you to specifically choose which endpoints receive the deployment, enabling controlled and safe testing. Choice A (Deploy to All Endpoints with immediate effect) is incorrect because it would apply the deployment across the entire organization, not just a test group. Choice C (Pre-approved Actions for the test group) is incorrect because while it could be used for expedited deployment, it doesn't inherently limit the deployment to a test group. Choice D (Action Approval Workflow targeting all endpoints) is incorrect because it focuses on the approval process, not on selecting a specific group for testing.",
    tags: ["action-targeting", "test-group", "package-deployment", "controlled-testing"],
    id: "TAKING-GEN-1760822910625-8",
  },
  {
    question:
      "You've noticed that certain critical actions are delayed due to the approval process, which affects your organization's security posture. What Tanium feature can you use to expedite the deployment of these critical actions?",
    choices: [
      {
        id: "a",
        text: "Scheduled Actions for immediate execution",
      },
      {
        id: "b",
        text: "Deploy module with elevated privileges",
      },
      {
        id: "c",
        text: "Pre-approved Actions",
      },
      {
        id: "d",
        text: "Action Approval Workflow with auto-approval settings",
      },
    ],
    correctAnswerId: "c",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Pre-approved Actions is correct because it allows specific actions to be designated in advance for immediate execution without the delay of the approval process, ensuring that critical security deployments can be expedited. Choice A (Scheduled Actions for immediate execution) is incorrect because while scheduling is useful, it doesn't bypass approval processes. Choice B (Deploy module with elevated privileges) is incorrect because having elevated privileges does not affect the approval process for actions. Choice D (Action Approval Workflow with auto-approval settings) is incorrect because while it could theoretically reduce delays, it doesn't specifically pre-approve actions for instant deployment like the Pre-approved Actions feature does.",
    tags: ["pre-approved-actions", "critical-actions", "expedited-deployment", "security-posture"],
    id: "TAKING-GEN-1760822910625-9",
  },
  {
    question:
      "Before deploying a complex new software package, you need to ensure it doesn’t adversely affect endpoint performance across your network. What strategy should you employ using Tanium to ensure the package is safe and performance-friendly?",
    choices: [
      {
        id: "a",
        text: "Deploy the package during off-hours to minimize impact",
      },
      {
        id: "b",
        text: "Monitor endpoints with the Asset module post-deployment",
      },
      {
        id: "c",
        text: "Use the Lab module to test the package in a controlled environment",
      },
      {
        id: "d",
        text: "Immediately revert the package if any issues are reported",
      },
    ],
    correctAnswerId: "c",
    domain: "Taking Action",
    difficulty: "Beginner",
    category: "Practical Scenarios",
    explanation:
      "Use the Lab module to test the package in a controlled environment is correct because it allows for the evaluation of the package's impact on performance without risking the broader network's stability. Choice A (Deploy the package during off-hours to minimize impact) is incorrect because it doesn't prevent potential issues, only mitigates the timing of impact. Choice B (Monitor endpoints with the Asset module post-deployment) is incorrect because it's reactive, not proactive. Choice D (Immediately revert the package if any issues are reported) is incorrect because it addresses issues after deployment, not before.",
    tags: ["lab-module", "package-testing", "endpoint-performance", "controlled-environment"],
    id: "TAKING-GEN-1760822910625-10",
  },
];

export default generatedQuestions;
