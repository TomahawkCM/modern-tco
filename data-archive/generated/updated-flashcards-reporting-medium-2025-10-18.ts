import type { CreateFlashcardLibraryCard } from "@/types/flashcard-library";

/**
 * Updated Flashcards - Spec Kit Compliant
 *
 * Domain: reporting
 * Difficulty: medium
 * Count: 20 (removed 1 easy-difficulty card)
 * Updated: 2025-10-18
 * Transformation: Phase 5 methodology applied
 * Changes:
 *   - Removed card 5 (marked easy, belongs in beginner set)
 *   - Updated 6 cards from hard → medium difficulty
 *   - All cards transformed to conversational tone
 *   - Added real-world analogies to all concept cards
 *   - Enhanced hints with practical context
 *   - Updated study guide refs to tco-study-path format
 *   - Organized into 7 clear categories
 *   - Added "Why this matters" context
 */

// ═══════════════════════════════════════════════════════════════════════════
// DATA EXPORT (4 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const dataExportCards: CreateFlashcardLibraryCard[] = [
  {
    front: "How do you export Tanium report data to CSV?",
    back: "It's just like saving an Excel file! Look at your report results, click the export icon (usually a download symbol), and select CSV format. The file downloads to your computer and you can open it in Excel, Google Sheets, or any spreadsheet app. Perfect for sharing with teams who don't use Tanium!",
    hint: "Think about the download/export button in most apps...",
    domain: "reporting",
    category: "syntax",
    difficulty: "medium",
    tags: ["data-export", "CSV-format", "report-management", "file-export"],
    study_guide_ref: "tco-study-path/reporting/data-export",
    source: "ai_generated",
  },
  {
    front: "Why use JSON format for exporting Tanium data?",
    back: "JSON is like a universal translator for modern apps! It's lightweight, human-readable, and works perfectly with web applications, APIs, and cloud services. If you're sending Tanium data to a web dashboard, ticketing system, or SIEM, JSON makes integration smooth and easy. Think of it as the language modern systems prefer to speak!",
    hint: "Think about web applications and APIs...",
    domain: "reporting",
    category: "terminology",
    difficulty: "medium",
    tags: ["JSON", "data-export", "integration", "web-apps"],
    study_guide_ref: "tco-study-path/reporting/export-formats",
    source: "ai_generated",
  },
  {
    front: "How do you fix data displaying wrong in exported reports?",
    back: "Three-step troubleshooting: (1) Check if the export format is compatible (CSV for Excel, JSON for web apps), (2) Make sure all necessary data fields are included in the export, (3) Look for filter or query errors that might be cutting off data. It's like troubleshooting a printer - check the file format, check what's selected, check for errors!",
    hint: "Start with: format compatibility → field inclusion → query errors...",
    domain: "reporting",
    category: "troubleshooting",
    difficulty: "medium",
    tags: ["export-issues", "data-display", "troubleshooting", "debugging"],
    study_guide_ref: "tco-study-path/reporting/troubleshooting-exports",
    source: "ai_generated",
  },
  {
    front: "What happens if you don't use filters on large report exports?",
    back: "Three bad outcomes: (1) You get MASSIVE files with tons of irrelevant data, (2) Tanium's performance tanks (slow for everyone!), (3) Finding what you actually need becomes like finding a needle in a haystack. Always filter first! It's like taking a photo - zoom in on what matters, don't photograph the entire city when you want one building.",
    hint: "Think about data volume, performance impact, and usability...",
    domain: "reporting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["data-filters", "system-performance", "data-analysis", "optimization"],
    study_guide_ref: "tco-study-path/reporting/large-exports",
    source: "ai_generated",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// CONNECT INTEGRATION (3 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const connectIntegrationCards: CreateFlashcardLibraryCard[] = [
  {
    front: "What is Tanium Connect and why use it?",
    back: "Connect is Tanium's data highway to the outside world! It automatically shares Tanium data with external systems like SIEMs (Splunk, QRadar), ticketing (ServiceNow), or databases. Instead of manually exporting data, Connect creates automated workflows that keep your other tools fed with fresh Tanium data 24/7. Set it once, forget it!",
    hint: "Think about automated data sharing with external systems...",
    domain: "reporting",
    category: "terminology",
    difficulty: "medium",
    tags: ["Connect", "integration", "external-systems", "automation"],
    study_guide_ref: "tco-study-path/reporting/connect-basics",
    source: "ai_generated",
  },
  {
    front: "How does Connect improve data analytics?",
    back: "It's like building a bridge between Tanium and your analytics tools! Connect seamlessly transfers endpoint data to platforms like Splunk, Tableau, or Power BI, where you can do advanced analysis, create dashboards, and get actionable insights. Instead of manually moving data around, Connect does it automatically so analysts always have fresh data to work with!",
    hint: "Think about automatic data flow to analytics platforms...",
    domain: "reporting",
    category: "terminology",
    difficulty: "medium",
    tags: ["Connect", "data-analytics", "data-transfer", "automation"],
    study_guide_ref: "tco-study-path/reporting/connect-analytics",
    source: "ai_generated",
  },
  {
    front: "How do you optimize Connect for large data exports?",
    back: "Three strategies: (1) Filter data by relevance (don't export everything!), (2) Use filters to manage data volume (only critical endpoints or specific timeframes), (3) Schedule exports during off-peak hours (like 2 AM) so you don't slow down Tanium during business hours. It's like scheduling large downloads overnight!",
    hint: "Think about filtering, volume control, and timing...",
    domain: "reporting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["Connect", "large-scale-exports", "optimization", "performance"],
    study_guide_ref: "tco-study-path/reporting/connect-optimization",
    source: "ai_generated",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULED REPORTS (4 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const scheduledReportsCards: CreateFlashcardLibraryCard[] = [
  {
    front: "Why schedule reports instead of running them manually?",
    back: "Three big wins: (1) You get automated updates on endpoint health without lifting a finger, (2) Perfect for compliance - reports run on schedule whether you remember or not, (3) Catch anomalies faster because reports run regularly, not just when you think about it. It's like setting up automated bill pay vs. remembering to pay each month!",
    hint: "Think about automation benefits - consistency, compliance, detection...",
    domain: "reporting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["scheduling", "automation", "report-management", "compliance"],
    study_guide_ref: "tco-study-path/reporting/scheduled-reports",
    source: "ai_generated",
  },
  {
    front: "What should you consider when scheduling automated reports?",
    back: "Balance three factors: (1) Relevance - does this report matter right now? (2) Frequency - daily compliance check vs. weekly health report, (3) System performance - don't schedule 50 heavy reports at 9 AM! Optimize timing to get timely insights WITHOUT killing Tanium's performance. It's like scheduling meetings - consider importance, frequency, and everyone's availability!",
    hint: "Think about relevance, timing, and system impact...",
    domain: "reporting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["report-automation", "scheduling", "optimization", "performance"],
    study_guide_ref: "tco-study-path/reporting/scheduling-strategy",
    source: "ai_generated",
  },
  {
    front: "How do you troubleshoot a failed scheduled report?",
    back: "Three-step checklist: (1) Check report configurations (is everything set correctly?), (2) Verify data sources are accessible (sensors working? endpoints online?), (3) Check network permissions and schedules (firewall blocking? right time zone?). It's like troubleshooting a missed alarm - check settings, check clock, check if phone was off!",
    hint: "Start with: config → data sources → network/permissions...",
    domain: "reporting",
    category: "troubleshooting",
    difficulty: "medium",
    tags: ["scheduled-reports", "troubleshooting", "configuration", "diagnostics"],
    study_guide_ref: "tco-study-path/reporting/troubleshooting-scheduled",
    source: "ai_generated",
  },
  {
    front: "How do you diagnose errors in scheduled report automation?",
    back: "Three investigation steps: (1) Review log files for error messages (what failed and why?), (2) Check report configuration AND automation settings (schedule correct? filters working?), (3) Verify network connectivity and permissions (can Tanium reach the data? do you have access?). It's like detective work - look at the evidence, check the setup, verify access!",
    hint: "Think about: logs → configuration → connectivity...",
    domain: "reporting",
    category: "troubleshooting",
    difficulty: "medium",
    tags: ["scheduled-report", "error-diagnosis", "log-files", "debugging"],
    study_guide_ref: "tco-study-path/reporting/error-diagnosis",
    source: "ai_generated",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// REPORT SHARING (2 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const reportSharingCards: CreateFlashcardLibraryCard[] = [
  {
    front: "How do you share a report with other users?",
    back: "It's like sharing a Google Doc! Go to report settings, click 'Share', then pick which users or groups need access. You can share with individuals (Bob from Security) or entire teams (Help Desk group). This gives them permission to view and run the report themselves - no more emailing CSV files back and forth!",
    hint: "Think about report settings and selecting users/groups...",
    domain: "reporting",
    category: "syntax",
    difficulty: "medium",
    tags: ["report-sharing", "user-management", "report-settings", "permissions"],
    study_guide_ref: "tco-study-path/reporting/sharing-reports",
    source: "ai_generated",
  },
  {
    front: "How should you share sensitive reports?",
    back: "Follow the least privilege principle! Only share with people who NEED it for their job - not everyone on the team. If the report contains security vulnerabilities or compliance issues, limit access to Security and Compliance teams only. It's like giving out building keys - the janitor doesn't need access to the server room!",
    hint: "Think about minimum necessary access and data security...",
    domain: "reporting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["report-sharing", "data-security", "least-privilege", "compliance"],
    study_guide_ref: "tco-study-path/reporting/secure-sharing",
    source: "ai_generated",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// REPORT TEMPLATES (3 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const reportTemplatesCards: CreateFlashcardLibraryCard[] = [
  {
    front: "What are report templates and why use them?",
    back: "They're like PowerPoint templates for Tanium reports! Pre-built formats that make creating reports super fast and ensure everyone follows the same structure. Instead of building each report from scratch, pick a template (like 'Security Compliance' or 'System Health'), plug in your data, done! Saves time AND keeps reporting consistent across your organization.",
    hint: "Think about pre-built formats that save time and ensure consistency...",
    domain: "reporting",
    category: "terminology",
    difficulty: "medium",
    tags: ["report-templates", "report-creation", "standardization", "efficiency"],
    study_guide_ref: "tco-study-path/reporting/using-templates",
    source: "ai_generated",
  },
  {
    front: "How do you choose the right report template?",
    back: "Ask three questions: (1) What info do I need? (compliance data vs. performance metrics), (2) Who's reading this? (executives need summaries, techs need details), (3) How should data look? (tables vs. charts vs. dashboards). Match the template to your needs - it's like picking the right presentation template for your audience!",
    hint: "Think about: information needs, audience, and visualization style...",
    domain: "reporting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["report-templates", "selection-criteria", "data-visualization", "audience"],
    study_guide_ref: "tco-study-path/reporting/selecting-templates",
    source: "ai_generated",
  },
  {
    front: "Why are templates useful for compliance reporting?",
    back: "Three reasons: (1) Standardized formats that auditors recognize and expect, (2) Built-in sections that meet regulatory requirements (you won't forget anything!), (3) Streamlined process - no rebuilding the wheel each month. It's like using a tax form - the structure is already there, you just fill in your numbers. Consistent, complete, compliant!",
    hint: "Think about standardization, regulatory requirements, and consistency...",
    domain: "reporting",
    category: "terminology",
    difficulty: "medium",
    tags: ["report-templates", "compliance-reporting", "standardization", "audit"],
    study_guide_ref: "tco-study-path/reporting/compliance-templates",
    source: "ai_generated",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DATA VISUALIZATION (3 cards)
// ═══════════════════════════════════════════════════════════════════════════

export const dataVisualizationCards: CreateFlashcardLibraryCard[] = [
  {
    front: "How do you add charts and graphs to Tanium reports?",
    back: "It's built right into the report builder! Select your data, then choose from charts (bar, line, pie), graphs, or tables. Configure what you want to show (like 'endpoints by OS version') and Tanium turns your boring data into visual insights. It's like Excel pivot charts - transform spreadsheets into something people actually WANT to look at!",
    hint: "Think about the report builder and selecting visualization types...",
    domain: "reporting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["data-visualization", "report-builder", "charts-graphs", "visual-insights"],
    study_guide_ref: "tco-study-path/reporting/creating-visualizations",
    source: "ai_generated",
  },
  {
    front: "Why customize data visualizations in reports?",
    back: "Three big benefits: (1) Enhanced comprehension - people understand charts faster than tables, (2) Quicker decisions - spot trends and problems at a glance, (3) Tailored insights - executives see summaries, techs see details. It's like the difference between reading a phone book vs. looking at a map - same info, WAY easier to use!",
    hint: "Think about comprehension, decision speed, and audience needs...",
    domain: "reporting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["data-visualization", "customization", "audience-insights", "decision-making"],
    study_guide_ref: "tco-study-path/reporting/why-visualize",
    source: "ai_generated",
  },
  {
    front: "How do you make data visualizations easier to understand?",
    back: "Three strategies: (1) Clear labeling - say what each axis/color means! (2) Right chart type - use pie charts for parts-of-whole, line charts for trends, bar charts for comparisons, (3) Color coding - highlight critical issues in red, good status in green. It's like designing road signs - make them clear, use the right symbols, and use color to communicate urgency!",
    hint: "Think about: labels, chart selection, and color coding...",
    domain: "reporting",
    category: "best_practices",
    difficulty: "medium",
    tags: ["data-visualization", "interpretability", "chart-selection", "best-practices"],
    study_guide_ref: "tco-study-path/reporting/effective-visualizations",
    source: "ai_generated",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// REPORT CREATION (1 card)
// ═══════════════════════════════════════════════════════════════════════════

export const reportCreationCards: CreateFlashcardLibraryCard[] = [
  {
    front: "How do you create a report from a Tanium question?",
    back: "Three-step process: (1) Start with a saved question OR ask a new one (like 'Get Operating System from all machines'), (2) Configure how results should display (table? chart? filters?), (3) Save it as a report for future use. It's like creating a YouTube playlist - pick the content, arrange it how you want, save it to watch again later!",
    hint: "Think about: question → display options → save...",
    domain: "reporting",
    category: "syntax",
    difficulty: "medium",
    tags: ["report-creation", "saved-questions", "configuration", "workflow"],
    study_guide_ref: "tco-study-path/reporting/creating-reports",
    source: "ai_generated",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const reportingMediumFlashcards: CreateFlashcardLibraryCard[] = [
  ...dataExportCards, // 4 cards
  ...connectIntegrationCards, // 3 cards
  ...scheduledReportsCards, // 4 cards
  ...reportSharingCards, // 2 cards
  ...reportTemplatesCards, // 3 cards
  ...dataVisualizationCards, // 3 cards
  ...reportCreationCards, // 1 card
];

export const reportingMediumFlashcardsMetadata = {
  domain: "reporting",
  totalCards: 20,
  removedCards: 1,
  updatedAt: "2025-10-18",
  specKitCompliant: true,
  categories: {
    dataExport: 4,
    connectIntegration: 3,
    scheduledReports: 4,
    reportSharing: 2,
    reportTemplates: 3,
    dataVisualization: 3,
    reportCreation: 1,
  },
  changes: [
    "Removed card 5 (easy difficulty - 'What formats are supported for data export')",
    "Updated 6 cards from hard → medium difficulty (cards 8, 9, 10, 16, 17, 20)",
    "Transformed all 20 cards with conversational, student-first tone",
    "Added real-world analogies to ALL cards (Excel files, data highways, PowerPoint templates)",
    "Enhanced hints with practical, contextual guidance",
    "Updated study guide references to tco-study-path format",
    "Organized into 7 clear categories for better learning flow",
    "Added 'Why this matters' context to complex concepts",
    "Improved troubleshooting cards with step-by-step checklists",
    "Fixed formal language (How can you export → How do you export)",
  ],
  keyAnalogies: [
    "CSV export = saving Excel file",
    "Connect integration = data highway/automated bridge",
    "Scheduled reports = automated bill pay",
    "Report templates = PowerPoint templates",
    "Data visualization = turning spreadsheets into charts",
    "Report sharing = Google Docs permissions",
    "JSON format = universal translator for apps",
    "Data filters = coffee filters / camera zoom",
    "Troubleshooting = detective work / fixing alarms",
    "Least privilege = building access keys",
  ],
  originalFile: "generated-flashcards-reporting-medium-2025-10-11.ts",
  importScript: "scripts/bulk-import-flashcards.ts",
};

export default reportingMediumFlashcards;
