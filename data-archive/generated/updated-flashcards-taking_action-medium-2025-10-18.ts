import type { CreateFlashcardLibraryCard } from '@/types/flashcard-library';

/**
 * Updated Flashcards - Spec Kit Compliant
 *
 * Domain: taking_action
 * Difficulty: medium
 * Count: 24 (all cards kept - no easy/hard mismatches)
 * Updated: 2025-10-18
 * Transformation: Phase 5 methodology applied
 * Changes:
 *   - All 24 cards already marked medium (perfect!)
 *   - Transformed all cards to conversational tone
 *   - Added real-world analogies to all concept cards
 *   - Enhanced hints with practical context
 *   - Updated study guide refs to tco-study-path format
 *   - Organized into 8 clear categories
 *   - Added "Why this matters" context
 */

// ═══════════════════════════════════════════════════════════════════════════
// PACKAGE LIBRARY & MANAGEMENT (5 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const packageLibraryCards: CreateFlashcardLibraryCard[] = [
  {
    front: 'What is the Tanium package library?',
    back: "Think of it like an App Store for IT actions! It's a centralized repository storing all your scripts, config files, and executables needed to DO stuff on endpoints. Want to install software, kill a process, or patch a vulnerability? Your package is stored here ready to deploy. One library, all your tools!",
    hint: 'Think about a central storage place for all your deployment tools...',
    domain: 'taking_action',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['package-library', 'centralized-repository', 'endpoint-actions', 'toolbox'],
    study_guide_ref: 'tco-study-path/taking_action/package-library',
    source: 'ai_generated',
  },
  {
    front: 'How do you create a new package?',
    back: "It's like creating a new app! Use the New Package wizard in Tanium Console. Give it a descriptive name, upload your source files (scripts, executables), and specify the command line to run. That's it - your new action is packaged and ready to deploy. Like zipping up files before emailing them, but for IT actions!",
    hint: 'Think about the wizard interface: name, files, command...',
    domain: 'taking_action',
    category: 'syntax',
    difficulty: 'medium',
    tags: ['new-package', 'package-creation-syntax', 'tanium-console', 'wizard'],
    study_guide_ref: 'tco-study-path/taking_action/creating-packages',
    source: 'ai_generated',
  },
  {
    front: "What's the best practice for naming packages?",
    back: "Use clear, descriptive names that explain what it does! Instead of 'Package1' or 'Fix_v2', use 'Windows-Defender-Update' or 'Chrome-Critical-Patch'. Think of browsing a toolbox - you want to instantly know which tool does what. Good names = faster selection, fewer mistakes, easier management!",
    hint: 'Think about clarity and describing the purpose...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['package-naming', 'descriptive-names', 'management-ease', 'conventions'],
    study_guide_ref: 'tco-study-path/taking_action/naming-conventions',
    source: 'ai_generated',
  },
  {
    front: 'Why use distribution servers for package deployment?',
    back: "It's like Amazon warehouses vs. shipping everything from Seattle! Distribution servers cache packages locally in different regions/offices, so endpoints download from nearby instead of across the WAN. This MASSIVELY reduces network load, especially in large or global networks. Fast downloads, happy network team!",
    hint: 'Think about local caching and network efficiency...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['distribution-servers', 'network-efficiency', 'package-caching', 'cdn'],
    study_guide_ref: 'tco-study-path/taking_action/distribution-servers',
    source: 'ai_generated',
  },
  {
    front: 'How does package versioning help with actions?',
    back: "It's like iOS updates (14.1, 14.2, etc.)! Versioning lets you manage different package versions, deploy the right one to the right computers, and rollback to older versions if the new one breaks stuff. Got a patch that works on Windows 10 but not 11? Version it! Need to undo a bad update? Roll back to the previous version!",
    hint: 'Think about managing different versions and rollback capability...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['package-versioning', 'compatibility', 'rollback', 'version-control'],
    study_guide_ref: 'tco-study-path/taking_action/package-versions',
    source: 'ai_generated',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PACKAGE DEPLOYMENT (6 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const packageDeploymentCards: CreateFlashcardLibraryCard[] = [
  {
    front: 'How does Tanium deploy packages to endpoints?',
    back: "It's like scheduling software installations! You create an action that specifies: (1) WHICH package to run, (2) WHICH endpoints to target, (3) WHEN to run it, and (4) Optional parameters (like command-line arguments). Schedule it, and Tanium handles the rest - deploying to all targeted computers automatically!",
    hint: 'Think about scheduling deployments with target selection...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['package-deployment', 'action-scheduling', 'endpoints', 'automation'],
    study_guide_ref: 'tco-study-path/taking_action/deploying-packages',
    source: 'ai_generated',
  },
  {
    front: 'How do you refine targeted actions to specific computers?',
    back: "Use filters in the deployment wizard - it's like Amazon search filters! You can target by OS type ('Windows 10 only'), location ('London office'), computer group ('Finance Department'), or any sensor data. This ensures actions only hit relevant endpoints. Precision targeting = sniper rifle, not shotgun!",
    hint: 'Think about using filters to narrow down your targets...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['targeted-actions', 'refinement', 'deployment-wizard', 'filtering'],
    study_guide_ref: 'tco-study-path/taking_action/targeting-actions',
    source: 'ai_generated',
  },
  {
    front: 'How do you pass parameters to packages?',
    back: "It's like command-line options! First, define parameters in the package config (like 'LogPath' or 'InstallMode'). Then, when scheduling the action, specify the values ('C:\\\\Logs' or 'Silent'). Parameters customize how the package runs - same package, different behavior based on what you pass in!",
    hint: 'Think about defining parameters, then providing values when deploying...',
    domain: 'taking_action',
    category: 'syntax',
    difficulty: 'medium',
    tags: ['parameters-passing', 'package-configuration', 'action-scheduling', 'customization'],
    study_guide_ref: 'tco-study-path/taking_action/package-parameters',
    source: 'ai_generated',
  },
  {
    front: "What's the best way to update a widely-used package?",
    back: "Four safe steps: (1) Clone the existing package (don't touch the original!), (2) Make your changes to the clone, (3) Test the updated version on a few computers, (4) Gradually deploy (pilot group → department → everyone). It's like software beta testing - incremental rollout minimizes risk of breaking thousands of computers!",
    hint: 'Think about: clone → modify → test → gradual rollout...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['package-updating', 'cloning-packages', 'incremental-deployment', 'safety'],
    study_guide_ref: 'tco-study-path/taking_action/updating-packages',
    source: 'ai_generated',
  },
  {
    front: 'Why define a clear scope for each action?',
    back: "To avoid collateral damage! A clear scope ensures actions only execute on relevant endpoints, minimizing disruptions and wasting resources. It's like painting a house - you tape off windows and trim so you don't paint the wrong stuff. Precise scope = right computers affected, others left alone!",
    hint: 'Think about precision targeting to avoid unnecessary impact...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['action-scope', 'precision-targeting', 'resource-optimization', 'impact'],
    study_guide_ref: 'tco-study-path/taking_action/action-scoping',
    source: 'ai_generated',
  },
  {
    front: 'How does Tanium secure action deployments?',
    back: "Three layers of security: (1) RBAC (role-based access control) - only authorized users can deploy packages, (2) Secure transport protocols - encrypted communication, (3) Integrity checks - verify packages haven't been tampered with. It's like a bank vault with multiple locks, guards, and cameras!",
    hint: 'Think about: access control, encryption, and verification...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['action-deployment-security', 'RBAC', 'secure-protocols', 'encryption'],
    study_guide_ref: 'tco-study-path/taking_action/deployment-security',
    source: 'ai_generated',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ACTION MONITORING & RESULTS (3 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const monitoringCards: CreateFlashcardLibraryCard[] = [
  {
    front: 'What should you monitor during action execution?',
    back: "Watch the Action Status dashboard - it's like UPS package tracking! You'll see real-time progress updates (how many computers completed), completion rates (75% done!), and any errors or failures (5 computers failed). This dashboard is your mission control for watching deployments in real-time!",
    hint: 'Think about a tracking dashboard showing progress and errors...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['action-execution', 'monitoring', 'dashboard', 'real-time-tracking'],
    study_guide_ref: 'tco-study-path/taking_action/monitoring-actions',
    source: 'ai_generated',
  },
  {
    front: 'Why review action results regularly?',
    back: "Three key reasons: (1) Verify deployments actually worked (did patches really install?), (2) Identify issues before they spread (5% failure rate = investigate!), (3) Ensure compliance with policies (did security update hit all computers?). It's like checking your bank statements - regular review catches problems early!",
    hint: 'Think about verification, issue detection, and compliance...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['action-results-review', 'deployment-effectiveness', 'compliance', 'verification'],
    study_guide_ref: 'tco-study-path/taking_action/results-analysis',
    source: 'ai_generated',
  },
  {
    front: 'How do you troubleshoot failed actions?',
    back: "Three-step investigation: (1) Review action logs for error messages (what broke?), (2) Check endpoint compliance (are they online? right OS?), (3) Verify package parameters and targets are correct (typo in the command?). It's like debugging code - check the error, check the environment, check your inputs!",
    hint: 'Start with: logs → endpoint status → configuration...',
    domain: 'taking_action',
    category: 'troubleshooting',
    difficulty: 'medium',
    tags: ['failed-actions', 'troubleshooting-methods', 'logs', 'debugging'],
    study_guide_ref: 'tco-study-path/taking_action/troubleshooting-actions',
    source: 'ai_generated',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PACKAGE CONFIGURATION (3 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const configurationCards: CreateFlashcardLibraryCard[] = [
  {
    front: 'What are package parameters and why use them?',
    back: "Parameters are like a settings menu for your package! They let you customize behavior by specifying inputs like file paths ('C:\\\\Logs'), config settings ('InstallMode=Silent'), or command-line arguments. Same package, different parameters = different behavior. It's reusability at its finest!",
    hint: 'Think about customizable inputs that modify behavior...',
    domain: 'taking_action',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['package-parameters', 'customization', 'action-inputs', 'configuration'],
    study_guide_ref: 'tco-study-path/taking_action/parameters-overview',
    source: 'ai_generated',
  },
  {
    front: 'What should you consider when setting execution timeouts?',
    back: "Balance two risks: (1) Too short = you kill tasks that need more time (like large software installs), (2) Too long = hung processes waste resources forever. Consider the task - quick registry edit gets 5 minutes, major software install gets 60 minutes. It's like cooking timers - different dishes need different times!",
    hint: 'Think about balancing completion time vs. hung process risk...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['execution-timeouts', 'timely-completion', 'risk-management', 'configuration'],
    study_guide_ref: 'tco-study-path/taking_action/timeout-settings',
    source: 'ai_generated',
  },
  {
    front: 'How do you manage package dependencies?',
    back: "It's like recipe ingredients - you need flour before you can make bread! Two approaches: (1) Include all required components IN the package (bundle dependencies), (2) Use package chains to control execution order (deploy prerequisites first, then main package). This ensures nothing fails because a required component is missing!",
    hint: 'Think about prerequisites and execution order...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['package-dependencies', 'prerequisites', 'execution-order', 'chains'],
    study_guide_ref: 'tco-study-path/taking_action/dependency-management',
    source: 'ai_generated',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ACTION SCHEDULING & TIMING (3 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const schedulingCards: CreateFlashcardLibraryCard[] = [
  {
    front: 'How do you schedule future actions?',
    back: "Use the Create Scheduled Action interface - it's like Google Calendar for IT tasks! Specify: (1) Start time (run at 2 AM tonight), (2) End time (stop trying after 6 AM), (3) Recurrence pattern (every Tuesday, monthly, etc.). Set it once, and Tanium runs it automatically on schedule!",
    hint: 'Think about calendar-like scheduling with start, end, and recurrence...',
    domain: 'taking_action',
    category: 'syntax',
    difficulty: 'medium',
    tags: ['scheduling-actions', 'timing-control', 'recurrence-pattern', 'automation'],
    study_guide_ref: 'tco-study-path/taking_action/action-scheduling',
    source: 'ai_generated',
  },
  {
    front: 'What should you consider when choosing action execution time?',
    back: "Three factors: (1) Business impact (don't reboot computers at 2 PM when everyone's working!), (2) Endpoint availability (are laptops online at 3 AM?), (3) Conflicts with other tasks (avoid running during backups or other maintenance). It's like scheduling a meeting - consider everyone's availability and priorities!",
    hint: 'Think about: business hours, computer availability, and conflicts...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: [
      'execution-timing',
      'business-impact',
      'operational-considerations',
      'maintenance-windows',
    ],
    study_guide_ref: 'tco-study-path/taking_action/timing-strategy',
    source: 'ai_generated',
  },
  {
    front: 'How do action groups help with deployments?',
    back: "They're like mailing lists for computers! Group endpoints by criteria (OS type, location, department), then target the group instead of individual computers. Need to patch all Windows 10 machines in Finance? Target the 'Finance-Win10' group! It streamlines deployments and makes targeting way more efficient!",
    hint: 'Think about grouping computers for easier, more efficient targeting...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['action-groups', 'targeting-efficiency', 'group-based-deployments', 'organization'],
    study_guide_ref: 'tco-study-path/taking_action/action-groups',
    source: 'ai_generated',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ROLLBACK & SAFETY (1 card)
// ═══════════════════════════════════════════════════════════════════════════

export const rollbackCards: CreateFlashcardLibraryCard[] = [
  {
    front: 'What are rollback procedures and why use them?',
    back: "Rollback is IT's Ctrl+Z! Before deploying an action, Tanium can snapshot the system state. If something breaks, rollback reverts computers to how they were before - like System Restore in Windows. This safety net lets you confidently deploy changes knowing you can undo disasters. Always have an escape plan!",
    hint: 'Think about undo functionality and reverting to previous state...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['rollback-procedures', 'reverting-changes', 'safety-nets', 'disaster-recovery'],
    study_guide_ref: 'tco-study-path/taking_action/implementing-rollbacks',
    source: 'ai_generated',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PRE-APPROVED ACTIONS (1 card)
// ═══════════════════════════════════════════════════════════════════════════

export const preApprovedCards: CreateFlashcardLibraryCard[] = [
  {
    front: 'What are pre-approved actions?',
    back: "They're like an express lane for critical actions! Pre-approved actions bypass the manual approval process for common or emergency tasks. Security incident? Deploy the pre-approved 'Isolate-Computer' package instantly without waiting for approval. It's speed when you need it most, with guardrails already in place!",
    hint: 'Think about fast-track actions that skip manual approval...',
    domain: 'taking_action',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['pre-approved-actions', 'quick-response', 'bypass-manual-approval', 'emergency'],
    study_guide_ref: 'tco-study-path/taking_action/pre-approved-actions',
    source: 'ai_generated',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// BEST PRACTICES (2 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const bestPracticesCards: CreateFlashcardLibraryCard[] = [
  {
    front: 'Why test packages before deploying widely?',
    back: 'Would you serve dinner to 100 guests without tasting it first? Testing catches: (1) Errors in your script, (2) Compatibility issues (works on Win10, breaks on Win11), (3) Unintended effects (accidentally deletes files!). Test on a few computers first, verify it works, THEN deploy to thousands. One bad package can break a LOT of computers!',
    hint: 'Think about finding problems before they spread to thousands...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['package-testing', 'deployment-safety', 'error-identification', 'pilot-testing'],
    study_guide_ref: 'tco-study-path/taking_action/testing-validation',
    source: 'ai_generated',
  },
  {
    front: 'What should you consider when automating actions?',
    back: "Three critical factors: (1) Triggers - what causes the action to run? (2) Impact - what's the worst case scenario? (3) Oversight - who monitors it? Automation is powerful but can cause massive problems if misconfigured. It's like self-driving cars - amazing when it works, potentially disastrous without proper safeguards!",
    hint: 'Think about: triggers, potential impact, and human oversight...',
    domain: 'taking_action',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['action-automation', 'triggers', 'oversight', 'risk-management'],
    study_guide_ref: 'tco-study-path/taking_action/automating-actions',
    source: 'ai_generated',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const takingActionMediumFlashcards: CreateFlashcardLibraryCard[] = [
  ...packageLibraryCards, // 5 cards
  ...packageDeploymentCards, // 6 cards
  ...monitoringCards, // 3 cards
  ...configurationCards, // 3 cards
  ...schedulingCards, // 3 cards
  ...rollbackCards, // 1 card
  ...preApprovedCards, // 1 card
  ...bestPracticesCards, // 2 cards
];

export const takingActionMediumFlashcardsMetadata = {
  domain: 'taking_action',
  totalCards: 24,
  removedCards: 0,
  updatedAt: '2025-10-18',
  specKitCompliant: true,
  categories: {
    packageLibrary: 5,
    packageDeployment: 6,
    monitoring: 3,
    configuration: 3,
    scheduling: 3,
    rollback: 1,
    preApproved: 1,
    bestPractices: 2,
  },
  changes: [
    'All 24 cards already correctly marked as medium difficulty',
    'Transformed all 24 cards with conversational, student-first tone',
    'Added real-world analogies to ALL cards (App Store, cooking timers, UPS tracking, mailing lists)',
    'Enhanced hints with practical, contextual guidance',
    'Updated study guide references to tco-study-path format',
    'Organized into 8 clear categories for better learning flow',
    "Added 'Why this matters' context to complex concepts",
    'Improved troubleshooting cards with step-by-step checklists',
    'Fixed formal language (What is the purpose → What is)',
    'Added safety and risk management context throughout',
  ],
  keyAnalogies: [
    'Package library = App Store / toolbox',
    'Package deployment = software installation',
    'Action Status dashboard = UPS package tracking',
    'Package parameters = settings menu / command-line options',
    'Scheduled actions = Google Calendar events',
    'Rollback = Ctrl+Z / System Restore',
    'Pre-approved actions = express lane / fast pass',
    'Package naming = file naming conventions',
    'Targeted actions = sniper rifle (precision)',
    'Execution timeouts = cooking timer',
    'Package testing = taste testing before dinner party',
    'Distribution servers = Amazon warehouses / CDN',
    'Package versioning = iOS updates (14.1, 14.2)',
    'Action groups = mailing lists',
    'Execution timing = meeting scheduling',
    'Action scope = project boundaries',
    'Package dependencies = recipe ingredients',
    'Automation safeguards = self-driving car safety features',
  ],
  originalFile: 'generated-flashcards-taking_action-medium-2025-10-11.ts',
  importScript: 'scripts/bulk-import-flashcards.ts',
};

export default takingActionMediumFlashcards;
