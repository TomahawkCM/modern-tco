import { Difficulty, type Question, QuestionCategory, TCODomain } from '@/types/exam';

/**
 * AI-Generated Questions
 *
 * Domain: taking_action
 * Difficulty: advanced
 * Count: 30
 * Generated: 2025-10-18T21:33:38.555Z
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedQuestions: Question[] = [
  {
    question:
      'Your organization is planning to deploy a new security patch across all endpoints. The patch requires a system reboot, which must happen outside of business hours to avoid disruption. How should you schedule the action in Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Configure the package for immediate execution without specifying a maintenance window',
      },
      {
        id: 'b',
        text: 'Use Action Groups to target only devices currently online and active',
      },
      {
        id: 'c',
        text: 'Set the package to only execute during predefined maintenance windows',
      },
      {
        id: 'd',
        text: 'Deploy the patch manually on each endpoint to ensure precise timing',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Setting the package to execute only during predefined maintenance windows is correct because it ensures the action is only performed outside of business hours, avoiding disruption. Choice A is incorrect because immediate execution could disrupt user operations during business hours. Choice B is incorrect because targeting only online and active devices doesn't address the need to avoid business hour disruptions. Choice D is incorrect because manual deployment is not scalable or practical for a large number of endpoints.",
    tags: [
      'action-scheduling',
      'maintenance-windows',
      'package-deployment',
      'practical-application',
    ],
    id: 'TAKING-GEN-1760816528583-1',
  },
  {
    question:
      'A critical application is failing to start on multiple endpoints after a recent package deployment. What is the most efficient first step to troubleshoot and potentially roll back the deployment using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Query endpoints for application logs using Interact',
      },
      {
        id: 'b',
        text: 'Immediately use Deploy to roll back the package',
      },
      {
        id: 'c',
        text: 'Monitor the action execution status in Deploy for errors',
      },
      {
        id: 'd',
        text: 'Re-deploy the package to ensure it was not a transient issue',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Troubleshooting',
    explanation:
      'Monitoring the action execution status in Deploy for errors is the most efficient first step because it provides immediate insights into any errors or issues with the deployment, which is essential for troubleshooting. Choice A is incorrect because querying application logs may not immediately identify deployment-related issues. Choice B is incorrect because rolling back immediately without understanding the issue may not resolve the underlying problem. Choice D is incorrect because re-deploying without investigating could exacerbate the issue.',
    tags: [
      'action-execution-monitoring',
      'rollback-procedures',
      'troubleshooting-steps',
      'package-deployment',
    ],
    id: 'TAKING-GEN-1760816528583-2',
  },
  {
    question:
      'You are tasked with deploying a software update that requires specific configurations on each endpoint. The configurations vary by department. Which approach allows you to dynamically assign package parameters during deployment in Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Create a unique package for each department with hardcoded parameters',
      },
      {
        id: 'b',
        text: 'Use pre-approved actions with fixed parameters for simplicity',
      },
      {
        id: 'c',
        text: 'Leverage variables in the package to assign parameters based on device groups',
      },
      {
        id: 'd',
        text: 'Deploy the package globally and manually configure each endpoint post-deployment',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Leveraging variables in the package to assign parameters based on device groups is the best approach as it allows for dynamic configuration and efficient, targeted deployment without manual intervention. Choice A is incorrect because it is not scalable or efficient to create and manage multiple unique packages. Choice B is incorrect as pre-approved actions with fixed parameters do not offer the flexibility required for varying departmental configurations. Choice D is incorrect because it is highly inefficient and prone to errors to manually configure each endpoint post-deployment.',
    tags: ['package-parameters', 'dynamic-configuration', 'efficient-deployment', 'best-practices'],
    id: 'TAKING-GEN-1760816528583-3',
  },
  {
    question:
      'Following a policy update, your organization requires all software deployments to be approved by the IT security team before execution. How can you implement this requirement in Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Manually email the IT security team for approval of each package',
      },
      {
        id: 'b',
        text: "Utilize Tanium's built-in action approval workflow for packages",
      },
      {
        id: 'c',
        text: "Deploy packages only during IT security's scheduled review meetings",
      },
      {
        id: 'd',
        text: "Create a custom script that requires IT security's digital signature for each package",
      },
    ],
    correctAnswerId: 'b',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      "Utilizing Tanium's built-in action approval workflow for packages is the most efficient and scalable way to implement the new policy requirement, ensuring all deployments are reviewed and approved by the IT security team. Choice A is inefficient and not scalable. Choice C does not ensure compliance with the policy for every deployment. Choice D is unnecessarily complex and not a built-in feature of Tanium, making it more difficult to maintain.",
    tags: ['action-approval-workflows', 'IT-security', 'policy-compliance', 'best-practices'],
    id: 'TAKING-GEN-1760816528583-4',
  },
  {
    question:
      'Your team needs to roll out a new compliance policy package across the enterprise. The IT director requests a pilot deployment to 5% of endpoints to evaluate the impact. What is the best way to achieve this in Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Create a dynamic device group for 5% of endpoints and deploy the package to this group',
      },
      {
        id: 'b',
        text: 'Deploy the package globally but limit the action to pause after reaching 5%',
      },
      {
        id: 'c',
        text: 'Manually select endpoints that make up roughly 5% of the total and deploy individually',
      },
      {
        id: 'd',
        text: 'Use pre-approved actions for all endpoints but manually execute on 5% for the pilot phase',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Creating a dynamic device group for 5% of endpoints and deploying the package to this group is the most efficient and controlled method to conduct a pilot deployment. This approach ensures that exactly 5% of endpoints are targeted without manual intervention. Choice B is incorrect because it cannot precisely control the deployment to exactly 5% of endpoints. Choice C is not scalable or efficient. Choice D misinterprets the use of pre-approved actions, which does not help in controlling the deployment scale.',
    tags: ['pilot-deployment', 'dynamic-device-groups', 'compliance-policy', 'best-practices'],
    id: 'TAKING-GEN-1760816528583-5',
  },
  {
    question:
      'You are updating a critical package that requires specific user input for successful deployment. How can you ensure the package parameters are correctly configured for different users in Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Configure the package to prompt the user for input upon execution',
      },
      {
        id: 'b',
        text: 'Hardcode the most common parameters and adjust manually for exceptions',
      },
      {
        id: 'c',
        text: 'Utilize saved questions to dynamically assign parameters based on user profiles',
      },
      {
        id: 'd',
        text: 'Create separate packages for each set of user-defined parameters',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Utilizing saved questions to dynamically assign parameters based on user profiles allows for the most flexible and accurate delivery of the critical package across diverse user requirements in Tanium. Choice A is incorrect because Tanium packages do not support interactive prompts for user input upon execution. Choice B is inefficient and does not guarantee accuracy for all users. Choice D is not scalable or practical for managing a critical package that requires user-specific configurations.',
    tags: ['package-parameters', 'user-input', 'dynamic-assignment', 'best-practices'],
    id: 'TAKING-GEN-1760816528583-6',
  },
  {
    question:
      "In the process of deploying a new application across your organization's endpoints, you discover that the package fails to install on devices running an older operating system version. What is the first action you should take in Tanium to address this issue?",
    choices: [
      {
        id: 'a',
        text: 'Update the package to exclude the incompatible OS version using conditions',
      },
      {
        id: 'b',
        text: 'Manually uninstall the package from the affected endpoints',
      },
      {
        id: 'c',
        text: 'Deploy an OS update package to the affected endpoints first',
      },
      {
        id: 'd',
        text: 'Contact Tanium support for a custom solution to the compatibility issue',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Troubleshooting',
    explanation:
      'Updating the package to exclude the incompatible OS version using conditions is the most effective first action, as it prevents future deployment issues by ensuring the package only installs on compatible devices. Choice B is reactive and does not prevent future occurrences. Choice C might not be feasible for all endpoints due to policy or technical limitations. Choice D should be a later step if the issue cannot be resolved internally.',
    tags: ['package-deployment', 'OS-compatibility', 'troubleshooting', 'conditional-deployment'],
    id: 'TAKING-GEN-1760816528583-7',
  },
  {
    question:
      'You need to ensure that a security package is deployed only after receiving the latest asset data from all endpoints. Which configuration in Tanium ensures this dependency is met?',
    choices: [
      {
        id: 'a',
        text: 'Schedule the security package to deploy after the asset data collection task',
      },
      {
        id: 'b',
        text: 'Create a saved question that verifies asset data recency before deploying',
      },
      {
        id: 'c',
        text: 'Use workflow automation to trigger the security package deployment upon asset data update',
      },
      {
        id: 'd',
        text: 'Manually verify asset data recency and then initiate the security package deployment',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Using workflow automation to trigger the security package deployment upon asset data update is the most efficient and reliable method to ensure the dependency is met. This automation ensures the package deployment is contingent upon the most recent asset data being received, reducing manual errors and oversight. Choice A does not guarantee the asset data will be up-to-date at the time of deployment. Choice B is less efficient and may not be entirely reliable. Choice D is not scalable and is prone to human error.',
    tags: [
      'workflow-automation',
      'dependency-management',
      'security-package-deployment',
      'best-practices',
    ],
    id: 'TAKING-GEN-1760816528583-8',
  },
  {
    question:
      'After deploying a network configuration update package to a set of endpoints, your team notices network connectivity issues on those devices. How should you use Tanium to quickly mitigate the impact?',
    choices: [
      {
        id: 'a',
        text: 'Deploy a package that rolls back the network settings to their previous state',
      },
      {
        id: 'b',
        text: 'Immediately halt all ongoing and future deployments of the package',
      },
      {
        id: 'c',
        text: 'Manually access each affected endpoint to revert the changes',
      },
      {
        id: 'd',
        text: 'Send a broadcast message to users instructing them to avoid network-intensive tasks',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Troubleshooting',
    explanation:
      'Deploying a package that rolls back the network settings to their previous state is the quickest and most efficient way to mitigate the impact on the affected endpoints. This approach ensures a consistent and immediate resolution across all impacted devices. Choice B does not resolve the issue for already affected endpoints. Choice C is highly inefficient and not feasible for a large number of endpoints. Choice D does not rectify the underlying problem and only serves as a temporary and partial mitigation.',
    tags: ['rollback-procedures', 'network-configuration', 'troubleshooting', 'quick-mitigation'],
    id: 'TAKING-GEN-1760816528583-9',
  },
  {
    question:
      'Your organization requires all deployed packages to have a rollback plan in case of failure. What is the most effective way to ensure compliance with this policy in Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Document manual rollback steps for every package and store externally',
      },
      {
        id: 'b',
        text: 'Develop a corresponding rollback package for each deployment package',
      },
      {
        id: 'c',
        text: "Rely on Tanium's built-in rollback functionality for all packages",
      },
      {
        id: 'd',
        text: 'Only select packages from the Tanium library that include automatic rollback features',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Developing a corresponding rollback package for each deployment package is the most effective way to ensure compliance with the rollback policy. This approach provides a ready-to-execute solution to quickly revert changes made by the original package if necessary. Choice A is not efficient and increases the risk of errors during the manual rollback process. Choice C may not apply to every package, as not all packages have built-in rollback capabilities. Choice D limits the selection and might not meet all deployment needs.',
    tags: ['rollback-planning', 'package-development', 'policy-compliance', 'best-practices'],
    id: 'TAKING-GEN-1760816528583-10',
  },
  {
    question:
      "You're planning to deploy a new security tool across all endpoints. Before full deployment, you want to test it on a group of 100 endpoints. What is the best approach to configure this action in Tanium?",
    choices: [
      {
        id: 'a',
        text: 'Create a single package with conditional logic for select endpoints',
      },
      {
        id: 'b',
        text: 'Deploy the package directly, selecting all endpoints',
      },
      {
        id: 'c',
        text: 'Configure a pre-approved action limited to the test group',
      },
      {
        id: 'd',
        text: 'Use the Deploy module with manual approval for each endpoint',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      'Configuring a pre-approved action limited to the test group is correct because it allows for controlled deployment to a targeted set of endpoints, ensuring that the new tool is tested in a controlled environment before wider deployment. Choice A is incorrect because creating a package with conditional logic adds unnecessary complexity for testing purposes. Choice B is incorrect as it risks deploying the tool to all endpoints without initial testing. Choice D is incorrect because manual approval for each endpoint is inefficient for testing on 100 endpoints.',
    tags: [
      'package-deployment-workflows',
      'pre-approved-actions',
      'action-approval-workflows',
      'controlled-deployment',
    ],
    id: 'TAKING-GEN-1760823133546-1',
  },
  {
    question:
      "After deploying a package to update a critical application across the organization's endpoints, you realized the update is causing system crashes. What is the immediate step you should take using Tanium?",
    choices: [
      {
        id: 'a',
        text: 'Use the Connect module to alert the IT department',
      },
      {
        id: 'b',
        text: 'Deploy a rollback action from the package library',
      },
      {
        id: 'c',
        text: 'Configure a new package to uninstall the update',
      },
      {
        id: 'd',
        text: 'Pause the action to prevent further deployments',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      'Deploying a rollback action from the package library is correct because it allows for the quickest reversal of the problematic update, directly addressing the issue of system crashes. Choice A is incorrect because alerting the IT department does not resolve the immediate problem. Choice C is incorrect as configuring a new package would take additional time, prolonging the issue. Choice D is incorrect because pausing the action prevents further deployments but does not address the crashes already caused.',
    tags: [
      'rollback-and-recovery-procedures',
      'action-execution-monitoring',
      'package-library-overview',
      'troubleshooting',
    ],
    id: 'TAKING-GEN-1760823133546-2',
  },
  {
    question:
      'You need to schedule a software deployment that can only occur outside of business hours to minimize disruption. Which feature should you utilize in Tanium to ensure this happens?',
    choices: [
      {
        id: 'a',
        text: 'Configure a maintenance window within the Deploy module',
      },
      {
        id: 'b',
        text: 'Use the Interact module to target endpoints offline',
      },
      {
        id: 'c',
        text: 'Set up action scheduling for the deployment package',
      },
      {
        id: 'd',
        text: 'Create a saved question in Interact to identify idle endpoints',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      'Setting up action scheduling for the deployment package is correct because it allows you to specify exactly when the software deployment should occur, ensuring it only happens outside of business hours. Choice A is incorrect because configuring a maintenance window within the Deploy module is not a feature for scheduling specific actions. Choice B is incorrect as using the Interact module targets endpoints based on current status, not scheduling future actions. Choice D is incorrect because creating a saved question to identify idle endpoints does not facilitate the scheduling of an action.',
    tags: [
      'action-scheduling',
      'package-parameters-and-configuration',
      'deployment-workflows',
      'minimizing-disruption',
    ],
    id: 'TAKING-GEN-1760823133546-3',
  },
  {
    question:
      'To comply with regulatory requirements, you must ensure all actions taken on endpoints are approved by at least two team members before execution. How can you configure this in Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Enable dual approval in the Deploy module settings',
      },
      {
        id: 'b',
        text: 'Set up a custom workflow in the Connect module',
      },
      {
        id: 'c',
        text: 'Utilize the action approval workflow with configured approvers',
      },
      {
        id: 'd',
        text: 'Create a policy in Interact requiring manual action approval',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Utilizing the action approval workflow with configured approvers is correct because it allows for the specification of an approval process, including requiring multiple approvers, which meets the regulatory requirement for dual approval before any action is executed. Choice A is incorrect because there is no setting for enabling dual approval in the Deploy module. Choice B is incorrect as the Connect module is focused on data export and integration, not action approval workflows. Choice D is incorrect because Interact policies do not directly manage action approval processes.',
    tags: [
      'action-approval-workflows',
      'regulatory-compliance',
      'package-deployment-workflows',
      'security-best-practices',
    ],
    id: 'TAKING-GEN-1760823133546-4',
  },
  {
    question:
      "Your organization is rolling out a new security policy that requires the encryption of sensitive data on all laptops. You've created a package for this task. Before deployment, you need to ensure the package only runs on laptops, not desktops. How can you achieve this?",
    choices: [
      {
        id: 'a',
        text: 'Create a dynamic group for laptops and target the package to this group',
      },
      {
        id: 'b',
        text: 'Configure the package parameters to detect the system type before running',
      },
      {
        id: 'c',
        text: 'Use the Asset module to manually select laptops for the action',
      },
      {
        id: 'd',
        text: 'Create a saved question in Interact identifying laptops and deploy to the results',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      'Creating a dynamic group for laptops and targeting the package to this group is correct because it ensures the action will only execute on devices identified as laptops, automating the targeting process and adhering to the new policy requirements. Choice B is incorrect because although configuring package parameters is a valid approach, it does not inherently target laptops. Choice C is incorrect as manual selection is inefficient and prone to error. Choice D is incorrect because although creating a saved question can identify laptops, it is less efficient than using dynamic groups for targeting.',
    tags: [
      'package-parameters-and-configuration',
      'dynamic-grouping',
      'policy-enforcement',
      'data-encryption',
    ],
    id: 'TAKING-GEN-1760823133546-5',
  },
  {
    question:
      "You've received reports that a deployed package is not completing successfully on several endpoints. Upon investigation, you discover that the package requires a higher privilege level than what is currently configured. Which adjustment should you make in Tanium to resolve this issue?",
    choices: [
      {
        id: 'a',
        text: 'Modify the action to run with elevated privileges',
      },
      {
        id: 'b',
        text: 'Recreate the package with default administrator privileges',
      },
      {
        id: 'c',
        text: 'Use the Connect module to modify endpoint privilege levels',
      },
      {
        id: 'd',
        text: 'Adjust the endpoint configuration from the Asset module',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Troubleshooting',
    explanation:
      "Modifying the action to run with elevated privileges is correct because it directly addresses the issue by ensuring the package has the necessary permissions to complete successfully on all targeted endpoints. Choice B is incorrect because recreating the package does not specifically address the action's privilege level. Choice C is incorrect as the Connect module is intended for data export and integration, not modifying endpoint privileges. Choice D is incorrect because the Asset module is used for inventory management, not for adjusting endpoint privilege levels.",
    tags: [
      'action-execution-monitoring',
      'privilege-level-adjustment',
      'troubleshooting',
      'package-parameters-and-configuration',
    ],
    id: 'TAKING-GEN-1760823133546-6',
  },
  {
    question:
      'In preparation for a critical audit, you need to deploy a specialized monitoring tool across your network. However, due to strict change control policies, any deployment must first be reviewed and approved by your security team. What is the most efficient way to handle this in Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Submit the package for approval through the action approval workflow',
      },
      {
        id: 'b',
        text: 'Directly deploy the package and notify the security team for retroactive approval',
      },
      {
        id: 'c',
        text: 'Create a pre-approved action, specifying the security team as approvers',
      },
      {
        id: 'd',
        text: 'Manually email the package details to the security team for informal approval',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Best Practices',
    explanation:
      'Submitting the package for approval through the action approval workflow is correct because it ensures compliance with the strict change control policies by requiring review and approval before deployment. Choice B is incorrect because deploying a package before obtaining approval violates the established change control policies. Choice C is incorrect because pre-approved actions are typically used for actions that do not require additional approval steps. Choice D is incorrect because informal approval does not provide the necessary documentation or compliance with the change control policies.',
    tags: [
      'action-approval-workflows',
      'change-control-policies',
      'security-compliance',
      'package-deployment',
    ],
    id: 'TAKING-GEN-1760823133546-7',
  },
  {
    question:
      'You are tasked with deploying a critical update that needs to happen simultaneously across all endpoints to maintain system integrity. Which scheduling option should you select for this action in Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Staggered deployment to manage network load',
      },
      {
        id: 'b',
        text: 'Immediate execution upon approval',
      },
      {
        id: 'c',
        text: 'Scheduled during off-peak hours',
      },
      {
        id: 'd',
        text: 'Simultaneous deployment to all targeted endpoints',
      },
    ],
    correctAnswerId: 'd',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      'Selecting simultaneous deployment to all targeted endpoints is correct because it ensures that the critical update is applied uniformly across the network, maintaining system integrity and preventing discrepancies in software versions. Choice A is incorrect because staggered deployment would not meet the requirement for simultaneous updating. Choice B is incorrect because immediate execution upon approval does not guarantee synchronized deployment across all endpoints. Choice C is incorrect because scheduling during off-peak hours does not specify the deployment must be simultaneous.',
    tags: [
      'action-scheduling',
      'critical-update-deployment',
      'system-integrity',
      'deployment-strategies',
    ],
    id: 'TAKING-GEN-1760823133546-8',
  },
  {
    question:
      'Your company is deploying Tanium to a new environment. You need to create a custom package to install proprietary software on all endpoints. What is the first step in developing this package correctly?',
    choices: [
      {
        id: 'a',
        text: 'Draft the package script to define installation commands',
      },
      {
        id: 'b',
        text: 'Consult the package library for similar existing packages',
      },
      {
        id: 'c',
        text: 'Gather software installation requirements from the development team',
      },
      {
        id: 'd',
        text: 'Configure endpoint groups to specify deployment targets',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Advanced Concepts',
    explanation:
      'Gathering software installation requirements from the development team is correct because understanding the installation needs and specifications is crucial before creating a custom package. This ensures that the package will be developed to meet the exact requirements of the proprietary software. Choice A is incorrect because drafting the package script should occur after understanding the installation requirements. Choice B is incorrect because consulting the package library, while helpful, is secondary to understanding the specific needs of the software being deployed. Choice D is incorrect because configuring endpoint groups is a later step, after the package has been developed.',
    tags: [
      'package-development-basics',
      'software-installation',
      'custom-package-creation',
      'requirements-gathering',
    ],
    id: 'TAKING-GEN-1760823133546-9',
  },
  {
    question:
      'Following a successful package deployment, you notice that some endpoints are not reporting the expected state. You suspect the issue might be related to the package parameters not being correctly applied. How can you verify and rectify this situation using Tanium?',
    choices: [
      {
        id: 'a',
        text: 'Review the action log for execution errors',
      },
      {
        id: 'b',
        text: 'Adjust the package parameters and redeploy',
      },
      {
        id: 'c',
        text: 'Use the Connect module to export and analyze endpoint data',
      },
      {
        id: 'd',
        text: 'Conduct a live session with affected endpoints to troubleshoot',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Troubleshooting',
    explanation:
      'Reviewing the action log for execution errors is correct because it provides detailed information on the deployment process, including whether the package parameters were applied correctly. This step is crucial for identifying and understanding the root cause of the issue. Choice B is incorrect because adjusting the package parameters without understanding the problem could lead to further issues. Choice C is incorrect as the Connect module is primarily used for exporting data, which may not directly help in troubleshooting package parameter issues. Choice D is incorrect because conducting a live session is more suitable for in-depth troubleshooting and should be considered after reviewing the action logs.',
    tags: [
      'action-execution-monitoring',
      'troubleshooting',
      'package-parameters-and-configuration',
      'error-analysis',
    ],
    id: 'TAKING-GEN-1760823133546-10',
  },
  {
    question:
      'Your organization is planning to deploy a new software package across all endpoints. You are tasked with configuring the package parameters in Tanium to ensure a silent installation with no end-user interaction. Which configuration option should you select for this deployment?',
    choices: [
      {
        id: 'a',
        text: '/S /v/qn for a Windows MSI package',
      },
      {
        id: 'b',
        text: '-quiet -agreeToLicense yes for a macOS pkg',
      },
      {
        id: 'c',
        text: 'Use the default parameters provided by Tanium',
      },
      {
        id: 'd',
        text: 'Enable user interaction for installation confirmation',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "/S /v/qn is the correct choice because it configures the Windows MSI installer to run silently without user interaction, which is necessary for enterprise-wide deployments where minimal disruption is desired. Choice B is incorrect because it's specific to macOS installations, not Windows. Choice C is incorrect as default parameters might not always ensure a silent installation. Choice D is incorrect because enabling user interaction contradicts the requirement for no end-user interaction.",
    tags: [
      'package-parameters',
      'silent-installation',
      'deployment-workflows',
      'package-configuration',
    ],
    id: 'TAKING-GEN-1760823218400-1',
  },
  {
    question:
      'As part of a security compliance initiative, you need to schedule the deployment of a critical update package to all endpoints. However, the update must only be applied outside of business hours to minimize disruption. Which Tanium feature should you use to schedule this action?',
    choices: [
      {
        id: 'a',
        text: 'Set the execution time within the Deploy module',
      },
      {
        id: 'b',
        text: 'Configure a maintenance window in the Administration module',
      },
      {
        id: 'c',
        text: 'Utilize the Scheduled Actions feature in the Actions module',
      },
      {
        id: 'd',
        text: 'Apply the update immediately and monitor with the Asset module',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Utilizing the Scheduled Actions feature in the Actions module is correct because it allows for the precise scheduling of package deployments to occur during specified times, fulfilling the requirement to only update outside of business hours. Choice A is incorrect because the Deploy module does not directly allow for scheduling based on business hours. Choice B is incorrect as configuring a maintenance window in the Administration module affects the entire system's availability, not specific action execution. Choice D is incorrect because deploying immediately does not meet the requirement to avoid business hours and monitoring with Asset does not influence deployment timing.",
    tags: [
      'action-scheduling',
      'critical-updates',
      'compliance-initiative',
      'minimizing-disruption',
    ],
    id: 'TAKING-GEN-1760823218400-2',
  },
  {
    question:
      'During a routine audit, you discover that a deployed package to update custom software on endpoints is causing system instability. Which Tanium feature should you use to quickly rollback the changes made by this package on all affected endpoints?',
    choices: [
      {
        id: 'a',
        text: 'Deploy a new package with the previous software version',
      },
      {
        id: 'b',
        text: 'Use the Revert option in the Actions module',
      },
      {
        id: 'c',
        text: 'Apply a saved snapshot from the Asset module',
      },
      {
        id: 'd',
        text: 'Initiate a recovery procedure in the Administration module',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Deploying a new package with the previous version of the software is the correct approach to effectively rollback the changes because it allows for the precise reversion to a stable state across all affected endpoints. Choice B is incorrect as the Actions module does not offer a direct 'Revert' option for deployed packages. Choice C is incorrect because the Asset module does not handle software deployments or rollbacks. Choice D is incorrect as the Administration module's recovery procedures are not designed for rolling back specific software updates.",
    tags: ['rollback-procedures', 'system-instability', 'package-deployment', 'recovery'],
    id: 'TAKING-GEN-1760823218400-3',
  },
  {
    question:
      "You are tasked with deploying a security tool across your organization's endpoints. To ensure compliance, it's crucial that every device receives the package. Which strategy should you adopt to monitor the execution status of this action at scale?",
    choices: [
      {
        id: 'a',
        text: "Manually check each endpoint's compliance status",
      },
      {
        id: 'b',
        text: 'Use the Dashboard module for real-time action monitoring',
      },
      {
        id: 'c',
        text: 'Rely on user feedback to report installation success',
      },
      {
        id: 'd',
        text: 'Configure alerts within the Actions module for failed deployments',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      'Using the Dashboard module for real-time action monitoring is the correct strategy because it provides a comprehensive and scalable way to track the deployment status across all endpoints, ensuring that you can quickly identify and address any issues with the deployment. Choice A is impractical and inefficient at scale. Choice C is unreliable as user feedback may not be accurate or timely. Choice D, while helpful, only notifies you of failures and does not give a complete overview of the deployment status.',
    tags: [
      'action-execution-monitoring',
      'security-tool-deployment',
      'real-time-monitoring',
      'dashboard-module',
    ],
    id: 'TAKING-GEN-1760823218400-4',
  },
  {
    question:
      "Your organization has a strict policy that all software deployments must be approved by the IT security team before execution. You've been asked to deploy a new application across the network. What is the first step you should take to comply with this policy using Tanium?",
    choices: [
      {
        id: 'a',
        text: 'Directly deploy the package and notify the IT security team',
      },
      {
        id: 'b',
        text: 'Submit the action for approval through the Actions module',
      },
      {
        id: 'c',
        text: "Configure the package as a 'Pre-approved' action",
      },
      {
        id: 'd',
        text: 'Create a custom workflow in the Administration module for approval',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Submitting the action for approval through the Actions module is the correct first step because it adheres to the organizational policy of requiring IT security team approval before any software deployment. This process ensures that the deployment is compliant with security policies. Choice A is incorrect because it bypasses the approval process. Choice C is incorrect because configuring the package as 'Pre-approved' circumvents the requirement for this specific deployment to be reviewed. Choice D is incorrect as creating a custom workflow is unnecessary when the existing approval process in the Actions module meets the requirement.",
    tags: ['action-approval-workflows', 'IT-security-team', 'compliance', 'software-deployment'],
    id: 'TAKING-GEN-1760823218400-5',
  },
  {
    question:
      'In preparation for a major system update, you need to ensure that all endpoints can be recovered to their current state if the update causes issues. Which Tanium feature allows you to create a baseline snapshot of endpoints before deploying the update?',
    choices: [
      {
        id: 'a',
        text: 'Use the Snapshot feature in the Asset module',
      },
      {
        id: 'b',
        text: 'Configure a pre-action snapshot in the Deploy module',
      },
      {
        id: 'c',
        text: 'Initiate a full backup using the Administration module',
      },
      {
        id: 'd',
        text: 'Employ the Protect module to create restore points',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Configuring a pre-action snapshot in the Deploy module is the correct approach because it allows you to capture the state of endpoints before the update is deployed. This ensures that you have a baseline to revert to in case of any issues. Choice A is incorrect because the Asset module's Snapshot feature does not create a recoverable state of endpoints. Choice C is incorrect as the Administration module does not handle endpoint backups. Choice D is incorrect because, although the Protect module is related to security and protection, it does not specifically create system restore points.",
    tags: [
      'rollback-and-recovery-procedures',
      'system-update',
      'baseline-snapshot',
      'deploy-module',
    ],
    id: 'TAKING-GEN-1760823218400-6',
  },
  {
    question:
      'After deploying a package to update a critical application across your network, you notice that a small subset of endpoints failed to receive the update. Which Tanium feature would be most effective for troubleshooting and identifying why these endpoints did not get updated?',
    choices: [
      {
        id: 'a',
        text: 'The Logs section in the Administration module',
      },
      {
        id: 'b',
        text: 'The Client Status dashboard in the Interact module',
      },
      {
        id: 'c',
        text: 'The Action History report in the Actions module',
      },
      {
        id: 'd',
        text: 'The Deployment Status tool in the Deploy module',
      },
    ],
    correctAnswerId: 'c',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "The Action History report in the Actions module is the most effective for troubleshooting in this scenario because it provides detailed information about each action's execution status, including successes, partial successes, and failures. This allows you to quickly identify why specific endpoints did not receive the update. Choice A is less effective because the Administration module's logs are more generalized. Choice B does not give detailed action execution reports. Choice D, while relevant, does not offer the granular failure analysis provided by the Action History report.",
    tags: ['troubleshooting', 'critical-application-update', 'action-history', 'deployment-issues'],
    id: 'TAKING-GEN-1760823218400-7',
  },
  {
    question:
      "You are tasked with creating a custom package to deploy a proprietary application across your organization's endpoints. Which of the following is a crucial step in the package development process for ensuring the package can be deployed successfully?",
    choices: [
      {
        id: 'a',
        text: 'Define custom sensors to monitor the deployment',
      },
      {
        id: 'b',
        text: 'Test the package on a subset of endpoints before full deployment',
      },
      {
        id: 'c',
        text: 'Configure all endpoints to accept unsigned packages',
      },
      {
        id: 'd',
        text: 'Require manual installation confirmation from users',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Testing the package on a subset of endpoints before full deployment is a crucial step in ensuring that any issues can be identified and resolved in a controlled environment, minimizing the risk of widespread problems. Choice A, while useful, does not directly ensure the package's successful deployment. Choice C is insecure as it compromises the endpoint security by accepting unsigned packages. Choice D is impractical for large-scale deployments and contradicts the aim of automating package deployments.",
    tags: [
      'package-development-basics',
      'proprietary-application-deployment',
      'pre-deployment-testing',
      'package-success',
    ],
    id: 'TAKING-GEN-1760823218400-8',
  },
  {
    question:
      'Your company requires that all deployed packages be reviewed and approved by a senior IT administrator before they are executed. You have a package ready for deployment. What is the best practice to ensure this package is handled according to company policy in Tanium?',
    choices: [
      {
        id: 'a',
        text: "Set the package as 'Pre-approved' and notify the senior IT administrator",
      },
      {
        id: 'b',
        text: 'Submit the package for approval via the pre-configured approval workflow',
      },
      {
        id: 'c',
        text: 'Directly email the package details to the senior IT administrator for manual review',
      },
      {
        id: 'd',
        text: 'Deploy the package and provide a report of the action to the senior IT administrator',
      },
    ],
    correctAnswerId: 'b',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      "Submitting the package for approval via the pre-configured approval workflow is the best practice to ensure compliance with company policy. This process ensures an organized and auditable method for obtaining necessary approvals before deployment. Choice A circumvents the review process by prematurely marking the package as 'Pre-approved.' Choice C lacks formality and tracking, making it less reliable. Choice D is contrary to company policy as it involves deploying the package before obtaining approval.",
    tags: [
      'action-approval-workflows',
      'IT-administrator-review',
      'company-policy',
      'package-deployment',
    ],
    id: 'TAKING-GEN-1760823218400-9',
  },
  {
    question:
      'In an effort to minimize network impact during package deployments, you need to schedule the deployment of a large update package to thousands of endpoints across various geographical locations. Which Tanium feature should you leverage to efficiently manage the deployment timing?',
    choices: [
      {
        id: 'a',
        text: 'Use the Phased Deployment feature in the Deploy module',
      },
      {
        id: 'b',
        text: 'Schedule staggered deployment times in the Actions module',
      },
      {
        id: 'c',
        text: 'Configure bandwidth throttling in the Administration module',
      },
      {
        id: 'd',
        text: 'Implement regional deployment groups in the Management module',
      },
    ],
    correctAnswerId: 'a',
    domain: 'Taking Action',
    difficulty: 'Advanced',
    category: 'Practical Scenarios',
    explanation:
      'Using the Phased Deployment feature in the Deploy module is the most efficient way to manage the deployment timing, as it allows for the update package to be rolled out in controlled stages. This helps to minimize network impact by distributing the load over time. Choice B, while possible, does not provide the same level of control and automation as the Phased Deployment feature. Choice C is relevant for controlling network usage but does not address timing management. Choice D could help manage deployments but does not offer the same precision and ease of use as the Phased Deployment feature.',
    tags: ['phased-deployment', 'network-impact', 'deployment-timing', 'geographical-locations'],
    id: 'TAKING-GEN-1760823218400-10',
  },
];

export default generatedQuestions;
