import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";

/**
 * Reporting & Data Export Questions
 * 33 questions for the Reporting & Data Export domain
 */

export const reportingQuestions: Question[] = [
  {
    id: "TCO-RD-0001",
    question: "What are the most common export formats available for Tanium query results?",
    choices: [
      {
        id: "a",
        text: "DOC, PPT, XLS, PDF",
      },
      {
        id: "b",
        text: "CSV, JSON, XML, PDF",
      },
      {
        id: "c",
        text: "TXT, RTF, HTML, ZIP",
      },
      {
        id: "d",
        text: "SQL, DAT, LOG, BAK",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "Tanium supports CSV (for spreadsheet analysis), JSON (for programmatic processing), XML (for structured data exchange), and PDF (for presentation reports) as the primary export formats for query results and reports.",
    tags: ["export-formats", "data-export", "reporting"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0002",
    question:
      "You need to export system inventory data for analysis in Excel. Which export format would be most appropriate?",
    choices: [
      {
        id: "a",
        text: "JSON for structured data processing",
      },
      {
        id: "b",
        text: "CSV for easy import into Excel spreadsheets",
      },
      {
        id: "c",
        text: "XML for data exchange with other systems",
      },
      {
        id: "d",
        text: "PDF for presentation to management",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "CSV (Comma Separated Values) format is ideal for Excel analysis as it can be directly opened in Excel, maintains data structure in rows and columns, and allows for easy sorting, filtering, and analysis of the inventory data.",
    tags: ["csv-export", "excel-analysis", "data-format"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0003",
    question: "What is the primary benefit of using scheduled reports in Tanium?",
    choices: [
      {
        id: "a",
        text: "Reports run faster when scheduled",
      },
      {
        id: "b",
        text: "Automated generation and distribution of regular reports",
      },
      {
        id: "c",
        text: "Scheduled reports use fewer system resources",
      },
      {
        id: "d",
        text: "Reports can only be exported when scheduled",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "Scheduled reports provide automation for generating and distributing regular reports without manual intervention. This ensures stakeholders receive consistent, timely reports for compliance, management, or operational purposes.",
    tags: ["scheduled-reports", "automation", "report-distribution"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0004",
    question:
      "A large data export (50,000+ records) keeps timing out during the export process. What is the most effective solution?",
    choices: [
      {
        id: "a",
        text: "Increase browser timeout settings to allow longer exports",
      },
      {
        id: "b",
        text: "Break the export into smaller chunks using time periods or computer groups",
      },
      {
        id: "c",
        text: "Switch to a different export format that handles large datasets better",
      },
      {
        id: "d",
        text: "Export during off-peak hours when the system is less busy",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Breaking large exports into smaller, manageable chunks is the most reliable solution for handling large datasets. This can be done by filtering results by time periods, computer groups, or other criteria to create multiple smaller exports that are less likely to timeout.",
    tags: ["large-exports", "performance", "data-management"],
  },
  {
    id: "TCO-RD-0005",
    question: "When validating exported data quality, what should be your first verification step?",
    choices: [
      {
        id: "a",
        text: "Check if the file opens correctly in the target application",
      },
      {
        id: "b",
        text: "Verify the record count matches the console display",
      },
      {
        id: "c",
        text: "Confirm all special characters are properly encoded",
      },
      {
        id: "d",
        text: "Test the data import process in the destination system",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Verifying that the exported record count matches what was displayed in the console ensures data completeness and is the most fundamental quality check. If record counts don't match, there may be export truncation or filtering issues that need to be addressed before proceeding with other quality checks.",
    tags: ["data-validation", "quality-assurance", "export-verification"],
    officialRef: "university/reporting-essentials",
  },
  {
    id: "TCO-RD-0006",
    question:
      "You need to create a compliance report showing software inventory across all systems. Which approach provides the most effective reporting workflow?",
    choices: [
      {
        id: "a",
        text: "Export individual queries for each software category and combine manually",
      },
      {
        id: "b",
        text: "Create a comprehensive saved question and export to CSV for analysis",
      },
      {
        id: "c",
        text: "Use the Asset module's automated inventory reports with scheduled export",
      },
      {
        id: "d",
        text: "Query each system individually and aggregate the results",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "The Asset module's automated inventory reports are specifically designed for comprehensive software compliance reporting. They provide structured, consistent data with built-in scheduling and export capabilities, making them more efficient than manual query aggregation approaches.",
    tags: ["compliance-reporting", "software-inventory", "automated-reports"],
    officialRef: "module/asset",
  },
  {
    id: "TCO-RD-0007",
    question:
      "A scheduled report that previously worked correctly now generates empty results. What is the most systematic troubleshooting approach?",
    choices: [
      {
        id: "a",
        text: "Recreate the scheduled report with the same parameters",
      },
      {
        id: "b",
        text: "Check if the underlying data sources and computer group memberships have changed",
      },
      {
        id: "c",
        text: "Increase the report timeout settings to allow more processing time",
      },
      {
        id: "d",
        text: "Switch to manual report generation to bypass scheduling issues",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "When a previously working scheduled report generates empty results, the most likely cause is changes in underlying data sources (sensors, computer groups, or filter criteria). Systematic troubleshooting should verify that the data sources still exist and contain expected data before investigating other potential causes.",
    tags: ["report-troubleshooting", "scheduled-reports", "data-source-validation"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0008",
    question:
      "You need to export query results containing special characters and international text. Which export format best preserves character encoding?",
    choices: [
      {
        id: "a",
        text: "CSV with UTF-8 encoding",
      },
      {
        id: "b",
        text: "Plain text with ASCII encoding",
      },
      {
        id: "c",
        text: "XML with default encoding",
      },
      {
        id: "d",
        text: "PDF format for universal compatibility",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "CSV with UTF-8 encoding provides the best support for special characters and international text while maintaining compatibility with most analysis tools. UTF-8 can represent any character in the Unicode standard, making it ideal for international deployments.",
    tags: ["character-encoding", "international-text", "utf8"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0009",
    question: "What is the benefit of using the JSON export format for Tanium data?",
    choices: [
      {
        id: "a",
        text: "Smallest file size for storage efficiency",
      },
      {
        id: "b",
        text: "Best compatibility with spreadsheet applications",
      },
      {
        id: "c",
        text: "Structured format ideal for programmatic processing and APIs",
      },
      {
        id: "d",
        text: "Human-readable format for management reports",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "JSON format provides a structured, machine-readable format that's ideal for programmatic processing, API integration, and automated data processing workflows. It maintains data structure and relationships better than flat formats like CSV.",
    tags: ["json-format", "programmatic-processing", "apis"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0010",
    question:
      "A compliance report must include historical data showing system changes over time. What export and analysis approach is most effective?",
    choices: [
      {
        id: "a",
        text: "Export current data and manually compare with previous exports",
      },
      {
        id: "b",
        text: "Use scheduled exports with timestamps and automated comparison tools",
      },
      {
        id: "c",
        text: "Query historical sensors and export trend data in structured format",
      },
      {
        id: "d",
        text: "Export raw data and use external business intelligence tools for analysis",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Querying historical sensors and exporting trend data in a structured format provides the most comprehensive approach for compliance reporting. Historical sensors capture system changes over time, and structured exports enable effective trend analysis and compliance validation.",
    tags: ["historical-data", "compliance-reporting", "trend-analysis"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0011",
    question:
      "What is the primary advantage of scheduling reports instead of generating them manually?",
    choices: [
      {
        id: "a",
        text: "Scheduled reports execute faster than manual reports",
      },
      {
        id: "b",
        text: "Scheduled reports provide automated, consistent data delivery without manual intervention",
      },
      {
        id: "c",
        text: "Scheduled reports have access to more data than manual reports",
      },
      {
        id: "d",
        text: "Scheduled reports use fewer system resources",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "Scheduled reports provide automated, consistent data delivery without requiring manual intervention, ensuring stakeholders receive regular updates and reducing the operational burden on administrators.",
    tags: ["scheduled-reports", "automation", "consistency"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0012",
    question:
      "You need to create a report that combines data from multiple Tanium modules. What approach is most effective?",
    choices: [
      {
        id: "a",
        text: "Export data from each module separately and combine manually",
      },
      {
        id: "b",
        text: "Create a unified query that spans multiple data sources and export as a single dataset",
      },
      {
        id: "c",
        text: "Use the reporting module's cross-module query capabilities",
      },
      {
        id: "d",
        text: "Schedule separate reports and use external tools for combination",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Using the reporting module's cross-module query capabilities provides the most integrated approach, ensuring data consistency, reducing manual effort, and maintaining relationships between different data sources.",
    tags: ["cross-module-reporting", "unified-queries", "data-integration"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0013",
    question:
      "A critical compliance report export process has been failing intermittently with timeout errors. What systematic approach ensures reliable report generation?",
    choices: [
      {
        id: "a",
        text: "Increase timeout settings and retry failed exports",
      },
      {
        id: "b",
        text: "Implement a multi-stage approach: data collection, processing, and export with error handling",
      },
      {
        id: "c",
        text: "Schedule reports during off-peak hours only",
      },
      {
        id: "d",
        text: "Break down into smaller reports and manually combine results",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Implementing a multi-stage approach with data collection, processing, and export phases, combined with proper error handling and retry logic, provides the most robust solution for reliable report generation. This allows for recovery at specific stages and better troubleshooting.",
    tags: ["report-reliability", "error-handling", "multi-stage-processing"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0014",
    question:
      "You need to export data that will be imported into a business intelligence tool for executive reporting. Which format and considerations are most appropriate?",
    choices: [
      {
        id: "a",
        text: "CSV format with descriptive column headers and clean data formatting",
      },
      {
        id: "b",
        text: "JSON format with nested data structures for complex relationships",
      },
      {
        id: "c",
        text: "XML format with detailed metadata and schema definitions",
      },
      {
        id: "d",
        text: "PDF format for consistent presentation across different systems",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "CSV format with descriptive column headers and clean data formatting is most appropriate for business intelligence tools. Most BI tools have excellent CSV import capabilities, and the format is simple, widely supported, and efficient for tabular data analysis.",
    tags: ["business-intelligence", "executive-reporting", "data-formatting"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0015",
    question: "What is the primary benefit of using templates when creating reports in Tanium?",
    choices: [
      {
        id: "a",
        text: "Templates execute faster than custom reports",
      },
      {
        id: "b",
        text: "Templates provide standardized formatting and consistent structure across reports",
      },
      {
        id: "c",
        text: "Templates can access more data sources than custom reports",
      },
      {
        id: "d",
        text: "Templates are automatically scheduled for regular generation",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "Templates provide standardized formatting and consistent structure across reports, ensuring uniformity in presentation and making reports easier to understand and compare.",
    tags: ["report-templates", "standardization", "consistency"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0016",
    question:
      "A critical monthly compliance report export fails during peak business hours but succeeds during off-peak times. What systematic approach resolves this issue?",
    choices: [
      {
        id: "a",
        text: "Move the report schedule to off-peak hours permanently",
      },
      {
        id: "b",
        text: "Analyze system resource utilization, implement resource optimization, and consider report segmentation",
      },
      {
        id: "c",
        text: "Increase server memory and CPU allocation",
      },
      {
        id: "d",
        text: "Switch to manual report generation to avoid scheduling conflicts",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "A systematic approach involves analyzing system resource utilization during peak vs off-peak times, implementing optimization techniques (query tuning, caching), and potentially segmenting large reports into smaller chunks. This addresses root causes rather than just avoiding the problem.",
    tags: ["resource-optimization", "peak-load-handling", "report-segmentation"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0017",
    question:
      "You need to create a report showing security patch compliance over the last 90 days. What data and format combination is most effective?",
    choices: [
      {
        id: "a",
        text: "Current patch status exported to PDF for executive review",
      },
      {
        id: "b",
        text: "Historical patch data with timestamps exported to CSV for trend analysis",
      },
      {
        id: "c",
        text: "Real-time patch queries exported to JSON for system integration",
      },
      {
        id: "d",
        text: "Scheduled patch reports exported to XML for compliance systems",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Historical patch data with timestamps exported to CSV provides the best combination for 90-day compliance reporting. The historical data shows trends over time, timestamps enable chronological analysis, and CSV format supports easy analysis in spreadsheets or BI tools.",
    tags: ["historical-reporting", "patch-compliance", "trend-analysis"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0018",
    question: "What is the primary advantage of using the PDF export format for reports?",
    choices: [
      {
        id: "a",
        text: "PDF files are smaller than other formats",
      },
      {
        id: "b",
        text: "PDF preserves formatting and layout for consistent presentation",
      },
      {
        id: "c",
        text: "PDF files can be edited more easily than other formats",
      },
      {
        id: "d",
        text: "PDF format loads faster in web browsers",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "PDF format preserves formatting and layout, ensuring consistent presentation across different systems, devices, and viewing applications. This makes it ideal for formal reports and executive presentations.",
    tags: ["pdf-format", "formatting-preservation", "consistent-presentation"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0019",
    question:
      "A compliance officer needs weekly reports showing data changes and requires full audit trails. What reporting architecture best meets these requirements?",
    choices: [
      {
        id: "a",
        text: "Weekly scheduled reports with current data snapshots",
      },
      {
        id: "b",
        text: "Daily incremental reports showing only changes since previous report",
      },
      {
        id: "c",
        text: "Automated reporting system with baseline snapshots, change detection, and audit logging",
      },
      {
        id: "d",
        text: "Monthly comprehensive reports with detailed system inventories",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "An automated reporting system with baseline snapshots, change detection, and audit logging provides the most comprehensive solution. It captures baseline states, identifies changes over time, maintains audit trails, and can generate weekly summaries while preserving historical context.",
    tags: ["audit-trails", "change-detection", "automated-reporting"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0020",
    question:
      "You need to export large datasets (100,000+ records) reliably. What approach minimizes export failures?",
    choices: [
      {
        id: "a",
        text: "Export during off-peak hours with maximum timeout settings",
      },
      {
        id: "b",
        text: "Segment the export into smaller chunks based on time periods or system groups",
      },
      {
        id: "c",
        text: "Use compressed file formats to reduce export size",
      },
      {
        id: "d",
        text: "Export to multiple formats simultaneously for redundancy",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Segmenting large exports into smaller chunks based on time periods, system groups, or other criteria is the most reliable approach. This reduces memory usage, network timeouts, and provides recovery options if individual segments fail.",
    tags: ["large-datasets", "export-reliability", "data-segmentation"],
    officialRef: "module/reporting",
  },
  {
    id: "TCO-RD-0021",
    question:
      "When building reports in the Asset module, which approach provides the most comprehensive data export capability?",
    choices: [
      {
        id: "a",
        text: "Use only default report templates with standard fields",
      },
      {
        id: "b",
        text: "Create custom reports with multiple data sources and configurable field selection",
      },
      {
        id: "c",
        text: "Export raw sensor data directly without report formatting",
      },
      {
        id: "d",
        text: "Use preset dashboard widgets for data visualization only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Custom reports with multiple data sources and configurable field selection provide the most comprehensive export capability. This allows combining data from various Tanium solutions and selecting specific fields needed for analysis.",
    tags: ["asset-module", "report-building", "data-export", "custom-reports"],
    studyGuideRef: "tco-study-path/asset-reporting",
    officialRef: "platform/asset-reports",
  },
  {
    id: "TCO-RD-0022",
    question:
      "Which module provides the primary interface for exploring endpoint data across Tanium solutions and creating custom reports?",
    choices: [
      {
        id: "a",
        text: "Interact module",
      },
      {
        id: "b",
        text: "Deploy module",
      },
      {
        id: "c",
        text: "Reporting module",
      },
      {
        id: "d",
        text: "Administration module",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: "Console Procedures",
    explanation:
      "The Reporting module provides the primary interface for exploring endpoint data across Tanium solutions and creating custom reports and charts. It consolidates data from multiple Tanium solutions into unified reporting capabilities.",
    tags: ["reporting-module", "data-exploration", "custom-reports", "interface"],
    studyGuideRef: "tco-study-path/reporting-overview",
  },
  {
    id: "TCO-RD-0023",
    question:
      "When exporting deployment status data for analysis, which information provides the most comprehensive audit trail?",
    choices: [
      {
        id: "a",
        text: "Action names and completion times only",
      },
      {
        id: "b",
        text: "Deployment details including status, issuer, and endpoint-specific results",
      },
      {
        id: "c",
        text: "Ring progression metrics only",
      },
      {
        id: "d",
        text: "Package file checksums and versions",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Deployment details including status, issuer, and endpoint-specific results provide the most comprehensive audit trail. This includes who issued the action, when it was deployed, current status, and individual endpoint outcomes needed for complete auditing and troubleshooting.",
    tags: ["audit-trail", "deployment-status", "export-data", "comprehensive-reporting"],
    studyGuideRef: "tco-study-path/deployment-auditing",
  },
  {
    id: "TCO-RD-0024",
    question:
      "What is the most common method for exporting Asset report data to external applications?",
    choices: [
      {
        id: "a",
        text: "Direct database connection",
      },
      {
        id: "b",
        text: "CSV file format with clipboard copy/paste",
      },
      {
        id: "c",
        text: "API integration only",
      },
      {
        id: "d",
        text: "XML export to file system",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "CSV file format with clipboard copy/paste is the most common method. You can copy data from an Asset report table to the clipboard and paste it into applications that can interpret CSV format, making it easily accessible for external analysis.",
    tags: ["csv-export", "asset-data", "clipboard", "external-applications"],
    studyGuideRef: "tco-study-path/asset-export",
  },
  {
    id: "TCO-RD-0025",
    question:
      "When configuring Asset to export data to external destinations, which types of integrations are supported?",
    choices: [
      {
        id: "a",
        text: "Only Tanium Connect",
      },
      {
        id: "b",
        text: "Tanium Connect, Flexera, and ServiceNow",
      },
      {
        id: "c",
        text: "Flexera and ServiceNow only",
      },
      {
        id: "d",
        text: "Any JDBC-compatible system",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Asset supports export to Tanium Connect, Flexera, and ServiceNow as external destinations. These integrations allow for automated data sharing with IT service management and asset management platforms.",
    tags: ["external-integrations", "tanium-connect", "flexera", "servicenow"],
    studyGuideRef: "tco-study-path/asset-integrations",
  },
  {
    id: "TCO-RD-0026",
    question:
      "When configuring automated CSV export from Asset module, what is the correct approach to ensure data quality validation before external distribution?",
    choices: [
      {
        id: "a",
        text: "Export all data immediately without validation to maintain real-time synchronization",
      },
      {
        id: "b",
        text: "Configure data validation rules, test export samples, verify field completeness before scheduling",
      },
      {
        id: "c",
        text: "Rely on the external system to validate imported data quality",
      },
      {
        id: "d",
        text: "Export only when manually triggered to avoid automation errors",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Proper CSV export workflow includes configuring validation rules to check data completeness, testing export samples to verify format consistency, and ensuring field completeness before scheduling automated exports. This prevents distributing incomplete or malformed data.",
    tags: ["csv-export", "data-validation", "quality-assurance", "automation"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/data-export-validation",
  },
  {
    id: "TCO-RD-0027",
    question:
      "Which export format provides the most structured data for automated processing by external systems?",
    choices: [
      {
        id: "a",
        text: "CSV",
      },
      {
        id: "b",
        text: "PDF",
      },
      {
        id: "c",
        text: "JSON",
      },
      {
        id: "d",
        text: "TXT",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "JSON (JavaScript Object Notation) provides the most structured, machine-readable format for automated processing. It maintains data types, hierarchical relationships, and is easily parsed by most programming languages and external systems.",
    tags: ["json-export", "data-formats", "automation", "structured-data"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/export-formats",
  },
  {
    id: "TCO-RD-0028",
    question:
      "When setting up automated XML export for compliance reporting, what validation should be performed before scheduling the export?",
    choices: [
      {
        id: "a",
        text: "Test XML schema validation, verify data completeness, confirm field mappings",
      },
      {
        id: "b",
        text: "Check only that the file exports without errors",
      },
      {
        id: "c",
        text: "Verify the export runs within the specified time window",
      },
      {
        id: "d",
        text: "Ensure the file size meets minimum requirements",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Comprehensive XML export validation includes schema validation to ensure proper structure, data completeness verification to confirm all required fields are populated, and field mapping confirmation to ensure data aligns with compliance requirements.",
    tags: ["xml-export", "schema-validation", "compliance-reporting", "data-validation"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/xml-export-validation",
  },
  {
    id: "TCO-RD-0029",
    question:
      "A scheduled CSV export for asset reporting shows incomplete data compared to manual exports. What systematic approach best identifies and resolves this discrepancy?",
    choices: [
      {
        id: "a",
        text: "Compare export timestamps, verify scheduling service status, validate data source availability",
      },
      {
        id: "b",
        text: "Increase the export frequency to capture more data",
      },
      {
        id: "c",
        text: "Switch to manual exports exclusively",
      },
      {
        id: "d",
        text: "Reduce the data scope to improve reliability",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Systematic troubleshooting involves comparing export timestamps to identify timing issues, verifying the scheduling service is running properly, and validating that data sources are available when automated exports run. This approach identifies root causes of incomplete data.",
    tags: ["scheduled-exports", "troubleshooting", "data-completeness", "automation"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/scheduled-export-troubleshooting",
  },
  {
    id: "TCO-RD-0030",
    question:
      "For regulatory compliance reporting, what approach ensures exported data maintains integrity and auditability?",
    choices: [
      {
        id: "a",
        text: "Export data multiple times to verify consistency",
      },
      {
        id: "b",
        text: "Use digital signatures, timestamps, and maintain export audit logs",
      },
      {
        id: "c",
        text: "Save exports in multiple file formats simultaneously",
      },
      {
        id: "d",
        text: "Encrypt all export files regardless of content sensitivity",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Regulatory compliance requires digital signatures for data integrity verification, timestamps for audit trail establishment, and comprehensive export audit logs to track when, what, and by whom data was exported.",
    tags: ["compliance-reporting", "data-integrity", "audit-trails", "digital-signatures"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/compliance-export-requirements",
  },
  {
    id: "TCO-RD-0031",
    question: "What is the primary purpose of the Asset module in Tanium?",
    choices: [
      {
        id: "a",
        text: "Deploy packages to endpoints",
      },
      {
        id: "b",
        text: "Create and execute natural language questions",
      },
      {
        id: "c",
        text: "Generate comprehensive endpoint inventory and reports",
      },
      {
        id: "d",
        text: "Manage user accounts and permissions",
      },
    ],
    correctAnswerId: "c",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.BEGINNER,
    category: "Practical Scenarios",
    explanation:
      "The Asset module is specifically designed to generate comprehensive endpoint inventory and reports, providing detailed information about hardware, software, configurations, and compliance status across all managed endpoints.",
    tags: ["asset-module", "inventory", "endpoint-reporting", "module-purpose"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/module-overview",
  },
  {
    id: "TCO-RD-0032",
    question:
      "Automated PDF report generation fails intermittently with memory errors. What investigation approach best identifies the underlying cause?",
    choices: [
      {
        id: "a",
        text: "Analyze report size, server memory usage, concurrent report generation, and processing timeouts",
      },
      {
        id: "b",
        text: "Reduce report frequency to avoid resource conflicts",
      },
      {
        id: "c",
        text: "Switch all reports to CSV format to reduce memory usage",
      },
      {
        id: "d",
        text: "Restart the reporting service daily to clear memory",
      },
    ],
    correctAnswerId: "a",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Systematic investigation involves analyzing report size (large reports consume more memory), server memory usage patterns, concurrent report generation conflicts, and processing timeouts. This comprehensive approach identifies whether the issue is related to resource constraints, timing conflicts, or processing limits.",
    tags: ["pdf-reports", "memory-errors", "troubleshooting", "resource-analysis"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/pdf-report-troubleshooting",
  },
  {
    id: "TCO-RD-0033",
    question:
      "When configuring automated data export to external SIEM systems, what approach ensures reliable data delivery and error handling?",
    choices: [
      {
        id: "a",
        text: "Send exports immediately when generated without validation",
      },
      {
        id: "b",
        text: "Implement retry logic, delivery confirmation, and failure alerting",
      },
      {
        id: "c",
        text: "Export only during off-peak hours to avoid conflicts",
      },
      {
        id: "d",
        text: "Use email delivery for all automated exports",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Troubleshooting",
    explanation:
      "Reliable external SIEM integration requires retry logic for failed deliveries, delivery confirmation to verify receipt, and failure alerting to notify administrators of export problems. This ensures critical security data reaches monitoring systems consistently.",
    tags: ["siem-integration", "automated-export", "retry-logic", "delivery-confirmation"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/siem-integration-best-practices",
  },
  {
    id: "TCO-RD-0034",
    question:
      "When building multi-source reports combining Asset and Deploy module data, what approach ensures data consistency across modules?",
    choices: [
      {
        id: "a",
        text: "Run separate reports and manually combine results",
      },
      {
        id: "b",
        text: "Use temporal synchronization to align data collection times and verify endpoint correlation",
      },
      {
        id: "c",
        text: "Export only from the primary data source to avoid conflicts",
      },
      {
        id: "d",
        text: "Use different export formats for each module",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Multi-source reporting requires temporal synchronization to ensure data represents the same time period across modules, and endpoint correlation verification to confirm the same systems are being reported on consistently.",
    tags: ["multi-source-reporting", "data-consistency", "temporal-synchronization"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/multi-module-reporting",
  },
  {
    id: "TCO-RD-0035",
    question:
      "What is the recommended approach for archiving historical report data while maintaining query performance?",
    choices: [
      {
        id: "a",
        text: "Keep all historical data in the primary database",
      },
      {
        id: "b",
        text: "Implement data tiering with recent data in primary storage and archived data in secondary storage",
      },
      {
        id: "c",
        text: "Delete old data after 30 days to maintain performance",
      },
      {
        id: "d",
        text: "Store historical data only in exported file formats",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Data tiering maintains query performance by keeping frequently accessed recent data in primary storage while moving historical data to secondary storage systems that can still be queried when needed.",
    tags: ["data-archiving", "performance-optimization", "data-tiering"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/data-archiving",
  },
  {
    id: "TCO-RD-0036",
    question:
      "When generating reports for different stakeholder groups (IT, security, executive), what customization approach is most efficient?",
    choices: [
      {
        id: "a",
        text: "Create completely separate reporting systems for each group",
      },
      {
        id: "b",
        text: "Use role-based report templates with customizable content filtering and formatting",
      },
      {
        id: "c",
        text: "Generate one comprehensive report for all stakeholders",
      },
      {
        id: "d",
        text: "Require each group to create their own custom reports",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Role-based report templates with customizable content filtering allow efficient report generation while ensuring each stakeholder group receives relevant information in their preferred format without duplicating infrastructure.",
    tags: ["role-based-reporting", "stakeholder-customization", "template-efficiency"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/role-based-templates",
  },
  {
    id: "TCO-RD-0037",
    question:
      "A critical compliance report export process experiences data corruption during large dataset transfers. What systematic troubleshooting approach identifies the root cause?",
    choices: [
      {
        id: "a",
        text: "Reduce dataset size and re-export immediately",
      },
      {
        id: "b",
        text: "Verify data integrity at source, test export in segments, validate transfer mechanisms",
      },
      {
        id: "c",
        text: "Switch to a different export format",
      },
      {
        id: "d",
        text: "Increase server memory allocation",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Systematic troubleshooting involves verifying source data integrity first, testing export in smaller segments to isolate where corruption occurs, and validating all transfer mechanisms including network, storage, and format conversion processes.",
    tags: ["data-corruption", "systematic-troubleshooting", "large-datasets"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/data-corruption-troubleshooting",
  },
  {
    id: "TCO-RD-0038",
    question:
      "When implementing automated report distribution via email, what security measures should be included?",
    choices: [
      {
        id: "a",
        text: "Use plain text email for compatibility",
      },
      {
        id: "b",
        text: "Implement encrypted email transmission, secure attachment handling, and recipient verification",
      },
      {
        id: "c",
        text: "Send reports only during business hours",
      },
      {
        id: "d",
        text: "Include all report data in the email body",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Automated email distribution of reports requires encrypted transmission to protect data in transit, secure attachment handling to prevent malware, and recipient verification to ensure reports reach authorized personnel only.",
    tags: ["email-distribution", "security-measures", "encrypted-transmission"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/secure-email-distribution",
  },
  {
    id: "TCO-RD-0039",
    question:
      "What approach ensures exported data quality when integrating with downstream analytics platforms?",
    choices: [
      {
        id: "a",
        text: "Export all available data without filtering",
      },
      {
        id: "b",
        text: "Implement data quality validation, standardized field formatting, and integration testing",
      },
      {
        id: "c",
        text: "Let the analytics platform handle all data validation",
      },
      {
        id: "d",
        text: "Use only manual exports to ensure accuracy",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Quality integration requires data validation rules to catch inconsistencies, standardized field formatting for compatibility, and comprehensive integration testing to verify end-to-end data flow accuracy.",
    tags: ["data-quality", "analytics-integration", "validation-rules"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/analytics-integration",
  },
  {
    id: "TCO-RD-0040",
    question:
      "When troubleshooting slow report generation performance, what sequence of analysis provides the most comprehensive diagnosis?",
    choices: [
      {
        id: "a",
        text: "Check only database query execution times",
      },
      {
        id: "b",
        text: "Analyze data source queries, processing logic, formatting operations, and export mechanisms",
      },
      {
        id: "c",
        text: "Increase server resources immediately",
      },
      {
        id: "d",
        text: "Reduce report scope without analysis",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Comprehensive performance diagnosis requires analyzing the entire report generation pipeline: data source query efficiency, processing logic optimization, formatting operation performance, and export mechanism throughput.",
    tags: ["performance-troubleshooting", "report-generation", "comprehensive-analysis"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/performance-diagnosis",
  },
  {
    id: "TCO-RD-0041",
    question:
      "What validation approach ensures exported dashboard data accurately represents real-time system status?",
    choices: [
      {
        id: "a",
        text: "Export data immediately when dashboard updates",
      },
      {
        id: "b",
        text: "Implement timestamp synchronization, data freshness validation, and consistency checking",
      },
      {
        id: "c",
        text: "Use cached data for consistent export timing",
      },
      {
        id: "d",
        text: "Export only static historical data",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Real-time dashboard export validation requires timestamp synchronization to ensure data collection timing, data freshness validation to verify currency, and consistency checking to confirm dashboard and export data match.",
    tags: ["real-time-data", "dashboard-export", "data-synchronization"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/real-time-export-validation",
  },
  {
    id: "TCO-RD-0042",
    question:
      "When implementing cross-platform report sharing, what compatibility considerations are most critical?",
    choices: [
      {
        id: "a",
        text: "Use only proprietary formats for security",
      },
      {
        id: "b",
        text: "Ensure character encoding, date formatting, and field separator standards compatibility",
      },
      {
        id: "c",
        text: "Share reports only within the same operating system",
      },
      {
        id: "d",
        text: "Convert all reports to image formats",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Cross-platform compatibility requires attention to character encoding (UTF-8 for international characters), standardized date formatting (ISO 8601), and consistent field separators to ensure reports display correctly across different systems.",
    tags: ["cross-platform", "compatibility", "encoding-standards"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/cross-platform-compatibility",
  },
  {
    id: "TCO-RD-0043",
    question:
      "What approach ensures effective report version control when multiple team members modify report templates?",
    choices: [
      {
        id: "a",
        text: "Allow only one person to modify templates",
      },
      {
        id: "b",
        text: "Implement template versioning, change tracking, and approval workflows",
      },
      {
        id: "c",
        text: "Create duplicate templates for each modifier",
      },
      {
        id: "d",
        text: "Use only default system templates",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Effective template management requires versioning to track changes over time, change tracking to identify who modified what, and approval workflows to ensure quality control before template deployment.",
    tags: ["version-control", "template-management", "change-tracking"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/template-version-control",
  },
  {
    id: "TCO-RD-0044",
    question:
      "When generating reports that include sensitive data, what data protection approach balances security with operational needs?",
    choices: [
      {
        id: "a",
        text: "Exclude all sensitive data from reports",
      },
      {
        id: "b",
        text: "Implement role-based data redaction, encrypted storage, and audit logging",
      },
      {
        id: "c",
        text: "Include all data with password protection only",
      },
      {
        id: "d",
        text: "Generate reports manually for all sensitive data",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Balancing security with operational needs requires role-based data redaction to show only authorized information, encrypted storage for data at rest, and comprehensive audit logging to track access to sensitive reports.",
    tags: ["data-protection", "role-based-security", "sensitive-data"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/sensitive-data-reporting",
  },
  {
    id: "TCO-RD-0045",
    question:
      "What testing approach validates automated report accuracy before production deployment?",
    choices: [
      {
        id: "a",
        text: "Deploy immediately and fix issues as they arise",
      },
      {
        id: "b",
        text: "Implement data validation testing, format verification, and comparison with known-good outputs",
      },
      {
        id: "c",
        text: "Test only with sample data",
      },
      {
        id: "d",
        text: "Rely on user feedback for validation",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Production readiness requires comprehensive testing including data validation to verify correctness, format verification to ensure proper structure, and comparison with known-good outputs to confirm accuracy.",
    tags: ["testing-approach", "production-deployment", "validation-testing"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/report-testing",
  },
  {
    id: "TCO-RD-0046",
    question:
      "When implementing disaster recovery for reporting systems, what backup strategy ensures minimal data loss?",
    choices: [
      {
        id: "a",
        text: "Daily backups of report outputs only",
      },
      {
        id: "b",
        text: "Comprehensive backup of report templates, data sources, scheduling configurations, and historical outputs",
      },
      {
        id: "c",
        text: "Weekly backups of the reporting database",
      },
      {
        id: "d",
        text: "Manual export of critical reports only",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Comprehensive disaster recovery requires backing up all reporting system components: templates for report structure, data sources for content, scheduling configurations for automation, and historical outputs for reference and compliance.",
    tags: ["disaster-recovery", "backup-strategy", "business-continuity"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/disaster-recovery",
  },
  {
    id: "TCO-RD-0047",
    question:
      "What approach optimizes report storage costs while maintaining accessibility for regulatory requirements?",
    choices: [
      {
        id: "a",
        text: "Delete old reports after one year",
      },
      {
        id: "b",
        text: "Implement tiered storage with compression, archiving policies, and retrieval mechanisms",
      },
      {
        id: "c",
        text: "Store everything in premium high-speed storage",
      },
      {
        id: "d",
        text: "Print reports for physical storage",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Cost optimization while meeting regulatory requirements involves tiered storage for different access patterns, compression to reduce storage footprint, archiving policies for aging data, and reliable retrieval mechanisms for compliance audits.",
    tags: ["storage-optimization", "regulatory-compliance", "cost-management"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/storage-optimization",
  },
  {
    id: "TCO-RD-0048",
    question:
      "When troubleshooting inconsistent report data between different export formats, what analysis sequence identifies the root cause?",
    choices: [
      {
        id: "a",
        text: "Compare only the final output files",
      },
      {
        id: "b",
        text: "Verify source data query, analyze format conversion logic, validate export processing pipelines",
      },
      {
        id: "c",
        text: "Regenerate reports in all formats simultaneously",
      },
      {
        id: "d",
        text: "Use only one export format to avoid inconsistencies",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Troubleshooting",
    explanation:
      "Systematic analysis involves verifying the source data query is consistent across formats, analyzing format-specific conversion logic for differences, and validating each export processing pipeline to identify where discrepancies are introduced.",
    tags: ["data-consistency", "format-troubleshooting", "export-analysis"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/export-consistency-troubleshooting",
  },
  {
    id: "TCO-RD-0049",
    question:
      "What monitoring approach provides early warning of reporting system performance degradation?",
    choices: [
      {
        id: "a",
        text: "Wait for user complaints about slow reports",
      },
      {
        id: "b",
        text: "Implement performance metrics tracking, trend analysis, and proactive alerting",
      },
      {
        id: "c",
        text: "Check system performance monthly",
      },
      {
        id: "d",
        text: "Monitor only during business hours",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.INTERMEDIATE,
    category: "Practical Scenarios",
    explanation:
      "Proactive monitoring requires tracking key performance metrics (query times, export durations, resource usage), trend analysis to identify gradual degradation, and automated alerting when thresholds are exceeded.",
    tags: ["performance-monitoring", "proactive-alerting", "trend-analysis"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/performance-monitoring",
  },
  {
    id: "TCO-RD-0050",
    question:
      "When implementing federated reporting across multiple Tanium sites, what synchronization approach ensures consistent data presentation?",
    choices: [
      {
        id: "a",
        text: "Generate reports independently at each site",
      },
      {
        id: "b",
        text: "Implement centralized template management, synchronized data collection, and unified formatting standards",
      },
      {
        id: "c",
        text: "Use different report formats for each site",
      },
      {
        id: "d",
        text: "Manually coordinate report generation timing",
      },
    ],
    correctAnswerId: "b",
    domain: TCODomain.REPORTING_DATA_EXPORT,
    difficulty: Difficulty.ADVANCED,
    category: "Practical Scenarios",
    explanation:
      "Federated reporting consistency requires centralized template management for uniform structure, synchronized data collection timing across sites, and unified formatting standards to ensure comparable data presentation regardless of originating site.",
    tags: ["federated-reporting", "multi-site", "data-synchronization"],
    studyGuideRef: "tco-study-path/reporting",
    officialRef: "asset/federated-reporting",
  },
];

export const reportingQuestionMetadata = {
  domain: TCODomain.RD,
  totalQuestions: 50,
  difficultyBreakdown: {
    beginner: 12,
    intermediate: 25,
    advanced: 13,
  },
};
