import type { CreateFlashcardLibraryCard } from '@/types/flashcard-library';

/**
 * Updated Medium Flashcards - Navigation & Basic Modules (Module 4)
 *
 * Domain: navigation
 * Difficulty: medium
 * Count: 26 (22 updated + 4 new to replace Deploy cards)
 * Updated: 2025-10-17
 * Spec Kit Compliant: YES
 * Based on: Module 4 plain language transformation
 *
 * Changes from original (2025-10-11):
 * - Removed 6 Deploy module cards (wrong module!)
 * - Added 4 new cards covering console navigation and module selection
 * - Updated all cards for conversational tone and analogies
 * - Enhanced hints with practical context
 * - Added "Why this matters" elements to complex concepts
 */

export const generatedFlashcards: CreateFlashcardLibraryCard[] = [
  // ===== INTERACT MODULE CARDS (7) =====
  {
    front: 'Which module do you use to ask real-time questions across all your computers?',
    back: 'Interact - Think of it like calling people on the phone. You ask a question and get immediate answers from all your computers right now. Use it when you need to investigate something happening TODAY.',
    hint: 'Think about which module gets you answers in real-time...',
    domain: 'navigation',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['interact-module', 'real-time-queries', 'module-selection'],
    study_guide_ref: 'tco-study-path/navigation/module-selection',
    source: 'ai_generated',
  },
  {
    front: "What's the difference between a Saved Question and an Ad Hoc Question in Interact?",
    back: "Saved Questions are like bookmarks - you save them for recurring use (like 'Show me unpatched servers'). Ad Hoc Questions are one-time custom queries for specific situations. Think: Saved = reusable template, Ad Hoc = one-time investigation.",
    hint: 'Think about reusability - do you use it once or many times?',
    domain: 'navigation',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['interact-module', 'saved-questions', 'ad-hoc-questions', 'best-practices'],
    study_guide_ref: 'tco-study-path/navigation/interact-procedures',
    source: 'ai_generated',
  },
  {
    front: 'What are sensors in the Interact module and why do they matter?',
    back: "Sensors are like data collectors on each computer. Each sensor grabs a specific piece of information (like 'Operating System' or 'Running Processes'). You combine sensors to build questions. Think of them as building blocks for your investigations.",
    hint: 'Think about the building blocks you use to create questions...',
    domain: 'navigation',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['interact-module', 'sensors', 'data-collection', 'question-building'],
    study_guide_ref: 'tco-study-path/navigation/interact-procedures',
    source: 'ai_generated',
  },
  {
    front: 'What is the Sensor Library in Interact and why should you keep it updated?',
    back: 'The Sensor Library is your collection of all available sensors (data collectors). Keeping it updated means you get new sensors as Tanium adds features, giving you more ways to ask questions. Old sensors might miss new OS versions or security threats!',
    hint: 'Think about your toolbox - new tools help you do more jobs!',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['interact-module', 'sensor-library', 'maintenance', 'best-practices'],
    study_guide_ref: 'tco-study-path/navigation/interact-procedures',
    source: 'ai_generated',
  },
  {
    front: 'How does the Question Builder in Interact make your life easier?',
    back: 'Question Builder is a graphical interface (point-and-click) that helps you build complex questions without memorizing syntax. Pick sensors from a list, add filters with dropdowns, preview results. Like using a form instead of writing code!',
    hint: 'Think about GUI vs typing commands...',
    domain: 'navigation',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['interact-module', 'question-builder', 'user-interface', 'efficiency'],
    study_guide_ref: 'tco-study-path/navigation/interact-procedures',
    source: 'ai_generated',
  },
  {
    front: 'When would you use Interact instead of Trends?',
    back: "Use Interact when you need RIGHT NOW data for investigation (like 'Is malware running on any computer this second?'). Use Trends when you need to see patterns over time (like 'Has disk usage been growing for the last month?'). Interact = phone call, Trends = DVR.",
    hint: 'Think about NOW vs HISTORY...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['interact-module', 'trends-module', 'module-selection', 'decision-framework'],
    study_guide_ref: 'tco-study-path/navigation/module-decision',
    source: 'ai_generated',
  },
  {
    front:
      "You're building a multi-sensor question in Interact and it keeps timing out. What's the most likely fix?",
    back: "Start by limiting your scope with computer groups! Instead of querying all 10,000 computers, target 100 Windows Servers. Also add a result limit (like 'limit 500'). Test small, then scale up. Most timeouts = too broad scope.",
    hint: 'Think about targeting fewer computers...',
    domain: 'navigation',
    category: 'troubleshooting',
    difficulty: 'medium',
    tags: ['interact-module', 'performance', 'troubleshooting', 'optimization'],
    study_guide_ref: 'tco-study-path/navigation/troubleshooting',
    source: 'ai_generated',
  },

  // ===== TRENDS MODULE CARDS (5) =====
  {
    front: "What's the main purpose of the Trends module?",
    back: "Trends is like a security camera DVR - it records historical data so you can see what happened over days, weeks, or months. Use it to spot patterns (like 'disk space growing'), track compliance over time, or prove something WAS a problem before.",
    hint: 'Think about recording history over time...',
    domain: 'navigation',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['trends-module', 'historical-data', 'data-analysis', 'module-selection'],
    study_guide_ref: 'tco-study-path/navigation/module-decision',
    source: 'ai_generated',
  },
  {
    front: 'What are the key steps to create a custom dashboard in Trends?',
    back: '1) Choose your data source (saved question or sensor), 2) Pick chart type (line for trends, bar for comparisons, heat map for patterns), 3) Set refresh interval (how often to update), 4) Add alerts if needed. Then save and share!',
    hint: 'Think about the workflow: data → visualization → alerts...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['trends-module', 'dashboard', 'data-visualization', 'procedures'],
    study_guide_ref: 'tco-study-path/navigation/trends-procedures',
    source: 'ai_generated',
  },
  {
    front: 'How do you ensure your Trends data is accurate?',
    back: "Three things: 1) Keep sensors updated (old sensors = wrong data), 2) Verify your data sources are configured correctly (pointing to right questions), 3) Validate against known baselines (does '500 servers online' match reality?). If it looks weird, investigate!",
    hint: 'Think about data quality checks...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['trends-module', 'data-accuracy', 'quality-assurance', 'validation'],
    study_guide_ref: 'tco-study-path/navigation/trends-procedures',
    source: 'ai_generated',
  },
  {
    front: 'Why should you configure Data Purge Settings in Trends?',
    back: "Storage costs money and old data slows things down! Data Purge Settings automatically delete data older than X days (like 'delete anything older than 90 days'). Balance: keep enough history for trends, but don't hoard forever. Most teams keep 60-90 days.",
    hint: 'Think about storage management and performance...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['trends-module', 'data-purge', 'storage-management', 'performance'],
    study_guide_ref: 'tco-study-path/navigation/trends-procedures',
    source: 'ai_generated',
  },
  {
    front:
      "You want to turn a useful Interact question into ongoing monitoring in Trends. What's the workflow?",
    back: 'This is THE power workflow: 1) Test your question in Interact first, 2) Save the question, 3) In Trends, create a panel using that saved question as the data source, 4) Set refresh schedule (hourly/daily), 5) Add an alert if it crosses a threshold. Now it monitors automatically!',
    hint: 'Think Interact → Save → Trends → Monitor...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['trends-module', 'interact-module', 'workflow', 'integration'],
    study_guide_ref: 'tco-study-path/navigation/integration-strategies',
    source: 'ai_generated',
  },

  // ===== REPORTING MODULE CARDS (4) =====
  {
    front: "What's the main purpose of the Reporting module?",
    back: "Reporting is like PowerPoint for Tanium data - it makes your data look professional for people who don't use Tanium (like executives, auditors, or other departments). Use it to create scheduled reports, dashboards, and formatted exports.",
    hint: 'Think about presenting data to non-technical audiences...',
    domain: 'navigation',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['reporting-module', 'data-reporting', 'module-selection'],
    study_guide_ref: 'tco-study-path/navigation/module-decision',
    source: 'ai_generated',
  },
  {
    front: 'What are the key steps to create a new report in the Reporting module?',
    back: "1) Select report type (dashboard, detailed list, summary), 2) Choose data source (saved questions or direct query), 3) Add filters (like 'only show critical servers'), 4) Format it (charts, tables, layout), 5) Name it, save it, optionally schedule it. Like building a presentation!",
    hint: 'Think about the workflow: type → data → filters → format → save...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['reporting-module', 'report-creation', 'procedures'],
    study_guide_ref: 'tco-study-path/navigation/reporting-procedures',
    source: 'ai_generated',
  },
  {
    front: 'When should you use Reporting instead of just exporting from Interact?',
    back: "Use Reporting when: 1) You need it automatically (scheduled weekly/monthly), 2) You need it formatted nicely for executives, 3) You need to combine data from multiple sources, 4) Recipients don't have Tanium access. Use Interact export for quick one-time data pulls.",
    hint: 'Think about automation and presentation...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['reporting-module', 'interact-module', 'module-selection', 'decision-framework'],
    study_guide_ref: 'tco-study-path/navigation/module-decision',
    source: 'ai_generated',
  },
  {
    front:
      'Your boss needs a compliance report showing patch status for the last 6 months. Which modules do you use and in what order?',
    back: 'Use Trends → Reporting workflow: 1) Trends shows historical patch compliance over 6 months (line chart), 2) Reporting turns that into an executive dashboard with summary, trend graph, and current status. Trends = data, Reporting = presentation.',
    hint: 'Think about historical data presentation...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['reporting-module', 'trends-module', 'workflow', 'compliance'],
    study_guide_ref: 'tco-study-path/navigation/integration-strategies',
    source: 'ai_generated',
  },

  // ===== CONNECT MODULE CARDS (4) =====
  {
    front: "What's the main purpose of the Connect module?",
    back: 'Connect is like a data bridge - it automatically sends Tanium data to your other business tools (Splunk, ServiceNow, data warehouses, etc.). Use it for real-time integration so other systems get Tanium data without manual exports.',
    hint: 'Think about bridging Tanium to other tools...',
    domain: 'navigation',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['connect-module', 'data-export', 'integration', 'module-selection'],
    study_guide_ref: 'tco-study-path/navigation/module-decision',
    source: 'ai_generated',
  },
  {
    front:
      'How do you set up Tanium to automatically send security events to your SIEM using Connect?',
    back: '1) Create a connection in Connect (specify your SIEM as destination), 2) Choose data source (which Tanium questions to send), 3) Configure filters (only send HIGH/CRITICAL severity), 4) Map fields (Tanium field names → SIEM field names), 5) Test with 10 events, then enable!',
    hint: 'Think about the pipeline: source → filter → transform → destination...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['connect-module', 'siem-integration', 'data-export', 'procedures'],
    study_guide_ref: 'tco-study-path/navigation/connect-procedures',
    source: 'ai_generated',
  },
  {
    front:
      "What's the main benefit of using Connect for data export instead of manual CSV exports?",
    back: 'Automation! Connect runs 24/7 automatically - no human needed. Manual exports = someone has to remember to do it, human error risk, delays. Connect = consistent, timely, error-free delivery. Plus it can filter and transform data before sending.',
    hint: 'Think about automation vs manual work...',
    domain: 'navigation',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['connect-module', 'automation', 'data-export', 'efficiency'],
    study_guide_ref: 'tco-study-path/navigation/module-decision',
    source: 'ai_generated',
  },
  {
    front: 'How do you validate that your Connect pipeline is exporting data correctly?',
    back: 'Three validation steps: 1) Check source data in Tanium (does it have 100 events?), 2) Check destination (did it receive 100 events?), 3) Spot check a few records (do field values match?). Also monitor error rates - more than 5% errors = investigate!',
    hint: 'Think about source → destination validation...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['connect-module', 'data-validation', 'quality-assurance', 'troubleshooting'],
    study_guide_ref: 'tco-study-path/navigation/connect-procedures',
    source: 'ai_generated',
  },

  // ===== CONSOLE NAVIGATION CARDS (4) =====
  {
    front: 'How do you customize your Tanium Console dashboard for your specific role?',
    back: 'Create a workspace! Add panels showing the data YOU need (security analyst = threat panels, IT ops = server health panels). Resize them, arrange side-by-side, save the workspace. Now it loads automatically when you log in!',
    hint: 'Think about personalized workspace layouts...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['console', 'dashboard-customization', 'user-interface', 'workspace'],
    study_guide_ref: 'tco-study-path/navigation/console-layout',
    source: 'ai_generated',
  },
  {
    front: 'What role do labels play in organizing your Tanium dashboards and why do they matter?',
    back: "Labels are like folder names - they help you categorize and organize your saved items. Use clear labels like 'Security_Critical' or 'Daily_Checks' so you (and your team!) can find things fast. Good labels = efficient navigation, bad labels = wasting time searching.",
    hint: 'Think about organizing and finding things quickly...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['console', 'labels', 'organization', 'efficiency'],
    study_guide_ref: 'tco-study-path/navigation/best-practices',
    source: 'ai_generated',
  },
  {
    front: 'How do user permissions affect your experience in the Tanium Console?',
    back: "Permissions control what you can see and do. If you don't have 'Interact' permissions, that module won't even appear! If you can't create actions, buttons will be grayed out. Most 'I can't see X' problems = permission issue. Check with your admin!",
    hint: 'Think about access control and visibility...',
    domain: 'navigation',
    category: 'terminology',
    difficulty: 'medium',
    tags: ['console', 'permissions', 'access-control', 'user-experience'],
    study_guide_ref: 'tco-study-path/navigation/admin-workflows',
    source: 'ai_generated',
  },
  {
    front: 'Why is understanding the console UI elements important for efficiency?',
    back: "Knowing where things are saves HOURS every week! If you know keyboard shortcuts (Ctrl+Shift+S for search), module locations, and panel management, you work 2-3x faster. It's like knowing your way around a city vs using GPS every time - speed comes from familiarity.",
    hint: 'Think about navigation speed and productivity...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['console', 'user-interface', 'navigation-efficiency', 'keyboard-shortcuts'],
    study_guide_ref: 'tco-study-path/navigation/efficiency-techniques',
    source: 'ai_generated',
  },

  // ===== INTEGRATION & WORKFLOWS CARDS (2) =====
  {
    front:
      'You need to investigate a security incident, monitor it for 30 days, and send weekly reports to your boss. Which modules and in what order?',
    back: 'The detective workflow: 1) Interact (find the threat NOW), 2) Trends (create a panel monitoring for 30 days + alert), 3) Reporting (weekly executive summary dashboard). Each module does its specialty: Interact = investigate, Trends = monitor, Reporting = communicate.',
    hint: 'Think about the investigation → monitoring → reporting flow...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['workflow', 'integration', 'module-selection', 'multi-module'],
    study_guide_ref: 'tco-study-path/navigation/integration-strategies',
    source: 'ai_generated',
  },
  {
    front: "What's the best practice for testing a new Connect pipeline before enabling it?",
    back: 'Test small first! Start with 10-20 test events, verify they arrive correctly at the destination. Check: 1) Events sent = events received (count), 2) Field mapping correct (spot check data), 3) No errors in logs. If good, enable with rate limiting (start 100/hour, then scale up).',
    hint: 'Think about gradual rollout and validation...',
    domain: 'navigation',
    category: 'best_practices',
    difficulty: 'medium',
    tags: ['connect-module', 'testing', 'validation', 'deployment'],
    study_guide_ref: 'tco-study-path/navigation/connect-procedures',
    source: 'ai_generated',
  },
];

export const navigationMediumFlashcardsMetadata = {
  domain: 'navigation',
  source: 'updated_for_spec_kit_compliance',
  difficulty: 'medium',
  totalCards: 26,
  interactCards: 7,
  trendsCards: 5,
  reportingCards: 4,
  connectCards: 4,
  consoleCards: 4,
  workflowCards: 2,
  updatedAt: '2025-10-17',
  specKitCompliant: true,
  basedOn: 'module_4_plain_language_transformation',
  changes: [
    'Removed 6 Deploy module cards (wrong module for Module 4)',
    'Added 4 new console navigation and workflow cards',
    'Updated all cards with conversational tone',
    'Added analogies (phone call, DVR, PowerPoint, bridge)',
    'Enhanced hints with practical context',
    "Added 'Why this matters' elements to backs",
    'Aligned with Module 4 transformation patterns',
  ],
};

export default generatedFlashcards;
