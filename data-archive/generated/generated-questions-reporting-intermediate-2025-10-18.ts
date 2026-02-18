import { Difficulty, type Question, QuestionCategory, TCODomain } from "@/types/exam";

/**
 * AI-Generated Questions
 *
 * Domain: reporting
 * Difficulty: intermediate
 * Count: 34
 * Generated: 2025-10-18T21:21:37.556Z
 * Model: OpenAI GPT-4 Turbo (gpt-4-turbo-preview)
 */

export const generatedQuestions: Question[] = [
  {
    question:
      "As an IT security analyst, you've been tasked with generating a weekly report on all detected malware incidents across your organization's endpoints. This report should include timestamps, endpoint names, and incident details. You need to automate this report to be sent to the security team every Monday. Which Tanium module will you use to accomplish this?",
    choices: [
      {
        id: "a",
        text: "Interact module to manually gather malware incidents",
      },
      {
        id: "b",
        text: "Trends module for visualizing data over time",
      },
      {
        id: "c",
        text: "Connect module to automate and distribute the report",
      },
      {
        id: "d",
        text: "Protect module for real-time malware protection",
      },
    ],
    correctAnswerId: "c",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect is correct because it allows for the automation of report generation and distribution, meeting the requirement of sending weekly reports. Choice A (Interact) is incorrect because it's primarily used for real-time data querying, not for automation and scheduling of reports. Choice B (Trends) is incorrect because, while it's useful for visual data over time, it doesn't directly support automated report distribution. Choice D (Protect) is incorrect because its focus is on providing real-time malware protection, not on reporting and data export.",
    tags: ["connect-module", "automated-reporting", "malware-incidents", "report-distribution"],
    id: "REPORT-GEN-1760815820867-1",
  },
  {
    question:
      "Your organization requires a monthly performance report that shows the average load and uptime of critical systems, formatted in XML for integration with your ITSM tool. The goal is to proactively manage system health and maintenance schedules. Which Tanium feature should you use to efficiently gather and format this data?",
    choices: [
      {
        id: "a",
        text: "Use Trends to visualize system performance over time",
      },
      {
        id: "b",
        text: "Configure Connect with an XML template for data export",
      },
      {
        id: "c",
        text: "Apply Asset for an inventory of system statuses",
      },
      {
        id: "d",
        text: "Deploy custom scripts to endpoints via Deploy module",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect with an XML template is correct because it allows for the configuration of data exports in specific formats, including XML, which meets the requirement for ITSM tool integration. Choice A (Trends) is incorrect because it's primarily for internal visualization, not for external data export. Choice C (Asset) is incorrect because, while it provides inventory data, it doesn't support custom export formats like XML directly. Choice D (Deploy) is incorrect because it's used for executing actions, not exporting data in specific formats.",
    tags: ["connect-module", "xml-export", "itsm-integration", "system-health-reporting"],
    id: "REPORT-GEN-1760815820867-2",
  },
  {
    question:
      "You are configuring Tanium to send alerts to your organization's SIEM system whenever unauthorized software is detected on any endpoint. Which Tanium module would best facilitate the real-time alerting and integration with external SIEM systems?",
    choices: [
      {
        id: "a",
        text: "Use Protect to block unauthorized software",
      },
      {
        id: "b",
        text: "Configure Interact to query for unauthorized software",
      },
      {
        id: "c",
        text: "Set up Connect destinations for SIEM integration",
      },
      {
        id: "d",
        text: "Implement Asset for inventory management of software",
      },
    ],
    correctAnswerId: "c",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect destinations is correct because it specializes in integrating Tanium data with external systems like SIEMs, facilitating real-time alerting on specific conditions such as unauthorized software detection. Choice A (Protect) is incorrect because it focuses on blocking threats, not alerting external systems. Choice B (Interact) is incorrect because, though it can query for unauthorized software, it does not directly handle integration or alerting with SIEM systems. Choice D (Asset) is incorrect because it is geared towards inventory management, not real-time alerting or SIEM integration.",
    tags: [
      "connect-destinations",
      "siem-integration",
      "real-time-alerting",
      "unauthorized-software-detection",
    ],
    id: "REPORT-GEN-1760815820867-3",
  },
  {
    question:
      "In order to comply with industry regulations, your organization needs to archive all endpoint security compliance reports for at least 5 years. You must ensure these reports are generated monthly and include detailed endpoint compliance statuses. Which combination of Tanium modules and features should you use to achieve this compliance requirement?",
    choices: [
      {
        id: "a",
        text: "Interact for monthly data collection and Trends for archiving",
      },
      {
        id: "b",
        text: "Connect for automated report generation and external archiving solutions",
      },
      {
        id: "c",
        text: "Asset for continuous compliance monitoring and Protect for archiving",
      },
      {
        id: "d",
        text: "Comply for compliance assessments and Connect for report distribution and archiving",
      },
    ],
    correctAnswerId: "d",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Comply and Connect combination is correct because Comply can assess and report on endpoint security compliance, while Connect can be used to automate the distribution of these reports and integrate with external archiving solutions to meet the 5-year requirement. Choice A (Interact and Trends) is incorrect because, while Interact can query compliance data, Trends does not support external archiving. Choice B (Connect alone) addresses report generation and distribution but lacks the compliance assessment ability on its own. Choice C (Asset and Protect) is incorrect because Asset focuses on inventory, and Protect on threat prevention, neither directly supports compliance reporting or long-term archiving.",
    tags: ["comply-module", "connect-module", "compliance-reporting", "data-archiving"],
    id: "REPORT-GEN-1760815820867-4",
  },
  {
    question:
      "You are tasked with automating the export of weekly vulnerability scan results from Tanium to a CSV file for analysis by your compliance team. Which approach allows you to meet this requirement most efficiently?",
    choices: [
      {
        id: "a",
        text: "Use the Deploy module to execute a weekly scan and script to generate a CSV file.",
      },
      {
        id: "b",
        text: "Configure the Connect module to schedule weekly exports in CSV format.",
      },
      {
        id: "c",
        text: "Manually run the Interact module each week and export the results.",
      },
      {
        id: "d",
        text: "Set up the Trends module to visualize data, then manually export to CSV.",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Configuring the Connect module to schedule weekly exports in CSV format is the most efficient solution as it automates both the data gathering and exporting processes. Choice A (Deploy) is incorrect because Deploy is used for executing actions, not for data exports. Choice C (Interact) is incorrect because it requires manual operation each week, which is not efficient. Choice D (Trends) is incorrect because Trends is for data visualization within Tanium, not for scheduled exports.",
    tags: [
      "scheduled-report-automation",
      "data-export-formats",
      "connect-integration",
      "report-creation",
    ],
    id: "REPORT-GEN-1760822343759-1",
  },
  {
    question:
      "A security analyst wants to share a custom report on recent endpoint security incidents with external consultants without giving them direct access to Tanium. What is the best way to regularly provide them with this report?",
    choices: [
      {
        id: "a",
        text: "Email the report manually after exporting it from the Interact module.",
      },
      {
        id: "b",
        text: "Use Connect to automatically send the report to a shared cloud storage location.",
      },
      {
        id: "c",
        text: "Create a temporary user account in Tanium for the consultants.",
      },
      {
        id: "d",
        text: "Print and mail the report to maintain data security.",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Using Connect to automatically send the report to a shared cloud storage location is the best way to regularly provide the report without needing manual intervention or compromising security. Choice A (Email) is manual and may not be secure. Choice C (Temporary user account) unnecessarily provides access to Tanium, which may not be secure or feasible. Choice D (Print and mail) is secure but inefficient and outdated.",
    tags: ["connect-integration", "report-sharing-and-distribution", "data-export"],
    id: "REPORT-GEN-1760822343759-2",
  },
  {
    question:
      "Your company requires all endpoint data exported from Tanium for analysis to be in JSON format to integrate with a custom analytics platform. Which module should you configure to ensure compatibility?",
    choices: [
      {
        id: "a",
        text: "Configure the Trends module to output data in JSON format.",
      },
      {
        id: "b",
        text: "Use the Connect module with a JSON data export configuration.",
      },
      {
        id: "c",
        text: "Manually convert CSV exports from the Interact module to JSON.",
      },
      {
        id: "d",
        text: "Set up a script within the Deploy module to convert and export data as JSON.",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Using the Connect module with a JSON data export configuration is the most direct and efficient way to ensure data exported from Tanium is in JSON format, meeting the integration requirements with the custom analytics platform. Choice A (Trends) is incorrect because Trends focuses on data visualization, not data export format. Choice C (Manual conversion) is inefficient and prone to errors. Choice D (Deploy script) is not the intended use of the Deploy module, which is designed for executing actions on endpoints, not data export or conversion.",
    tags: [
      "connect-integration",
      "data-export-formats",
      "json-export",
      "external-system-integration",
    ],
    id: "REPORT-GEN-1760822343759-3",
  },
  {
    question:
      "To comply with internal data retention policies, you are tasked with configuring Tanium to archive all reports older than six months. Which strategy will effectively automate this process?",
    choices: [
      {
        id: "a",
        text: "Use the Deploy module to create a script that deletes reports older than six months.",
      },
      {
        id: "b",
        text: "Set up Connect to automatically archive reports to an external storage location based on date.",
      },
      {
        id: "c",
        text: "Configure the Trends module to only display data from the last six months.",
      },
      {
        id: "d",
        text: "Manually review and archive reports on a semi-annual basis.",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Setting up Connect to automatically archive reports to an external storage location based on date is the most efficient and reliable method to comply with internal data retention policies. Choice A (Deploy) is incorrect because Deploy is intended for endpoint management, not data archiving. Choice C (Trends) does not actually archive data, it only affects data display. Choice D (Manual review) is inefficient and prone to human error.",
    tags: ["connect-integration", "data-retention-and-archiving", "report-automation"],
    id: "REPORT-GEN-1760822343759-4",
  },
  {
    question:
      "Your team needs to visualize endpoint compliance status over time to identify trends and potential security gaps. Which module and feature should you leverage for this requirement?",
    choices: [
      {
        id: "a",
        text: "Use the Interact module with dynamic question lists for periodic manual checks.",
      },
      {
        id: "b",
        text: "Configure the Trends module to create visual dashboards of compliance data.",
      },
      {
        id: "c",
        text: "Set up the Connect module to export data to an external BI tool for visualization.",
      },
      {
        id: "d",
        text: "Employ the Asset module to generate static compliance reports.",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Configuring the Trends module to create visual dashboards of compliance data allows for real-time visualization and trend analysis, meeting the requirement to identify patterns and potential security weaknesses efficiently. Choice A (Interact) is inefficient for trend analysis due to its manual nature. Choice C (Connect) externalizes the visualization process, which could introduce delays. Choice D (Asset) does not focus on dynamic or visual trend analysis.",
    tags: [
      "data-visualization-in-reports",
      "trends-module",
      "endpoint-compliance",
      "security-gaps-identification",
    ],
    id: "REPORT-GEN-1760822343759-5",
  },
  {
    question:
      "Your executive team requests a monthly report on the operational health and compliance of all endpoints, including out-of-compliance devices, to be integrated into the company's executive dashboard. Which Tanium module would best automate and facilitate this integration?",
    choices: [
      {
        id: "a",
        text: "Employ the Connect module to automate data export to the executive dashboard system.",
      },
      {
        id: "b",
        text: "Use the Trends module to visualize health and compliance data internally.",
      },
      {
        id: "c",
        text: "Leverage the Interact module for ad-hoc querying and manual report generation.",
      },
      {
        id: "d",
        text: "Configure the Asset module to track and report on endpoint inventory and compliance.",
      },
    ],
    correctAnswerId: "a",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Employing the Connect module to automate data export directly into the company's executive dashboard system is the most efficient approach for meeting the executive team's request. This method streamlines the process and ensures timely updates. Choice B (Trends) is primarily for internal data visualization, not for integrating with external systems. Choice C (Interact) requires manual effort and doesn't facilitate automation. Choice D (Asset) focuses on inventory and basic compliance but lacks the direct integration capabilities of Connect.",
    tags: [
      "connect-integration",
      "scheduled-report-automation",
      "executive-dashboard-integration",
      "compliance-reporting",
    ],
    id: "REPORT-GEN-1760822343759-6",
  },
  {
    question:
      "In planning for an upcoming security audit, you need to ensure that all exported reports from Tanium regarding endpoint vulnerabilities are available in XML format for the auditors' tools. Which Tanium feature should you configure to meet this requirement?",
    choices: [
      {
        id: "a",
        text: "Adjust the settings in the Interact module to export results in XML format.",
      },
      {
        id: "b",
        text: "Configure the Connect module to export vulnerability reports in XML format.",
      },
      {
        id: "c",
        text: "Use the Trends module to generate reports, then manually convert them to XML.",
      },
      {
        id: "d",
        text: "Set up automated emails with reports attached as XML files using the Deploy module.",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Configuring the Connect module to export vulnerability reports in XML format directly meets the requirement for the security audit, ensuring compatibility with the auditors' tools. Choice A (Interact) does not inherently provide XML export functionality. Choice C (Trends) involves unnecessary manual steps. Choice D (Deploy) is not designed for report generation or export, particularly in specific formats like XML.",
    tags: [
      "data-export-formats",
      "connect-integration",
      "vulnerability-reporting",
      "audit-preparation",
    ],
    id: "REPORT-GEN-1760822343759-7",
  },
  {
    question:
      "After integrating Tanium with your company's IT service management (ITSM) system using Connect, you notice that not all incident tickets are being created for detected issues. What is the first step you should take to troubleshoot this issue?",
    choices: [
      {
        id: "a",
        text: "Verify the Connect destination configuration matches the ITSM system's API requirements.",
      },
      {
        id: "b",
        text: "Increase the frequency of the scheduled reports within the Trends module.",
      },
      {
        id: "c",
        text: "Manually export and compare data from the Interact module to the ITSM system.",
      },
      {
        id: "d",
        text: "Reconfigure the Asset module to ensure all endpoints are accounted for in reports.",
      },
    ],
    correctAnswerId: "a",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Troubleshooting",
    explanation:
      "Verifying the Connect destination configuration matches the ITSM system's API requirements is the first logical step to troubleshoot the issue, as mismatches in configuration or API expectations can prevent successful data transmission and ticket creation. Choice B (Trends) is incorrect because the frequency of reports does not directly influence the issue at hand. Choice C (Manual export) is time-consuming and does not address the root cause. Choice D (Asset) is unrelated to the issue of integrating and creating tickets in the ITSM system.",
    tags: [
      "connect-destinations",
      "itsm-integration",
      "troubleshooting-connect",
      "incident-ticket-creation",
    ],
    id: "REPORT-GEN-1760822343759-8",
  },
  {
    question:
      "You are configuring a new report template in Tanium for endpoint security compliance that will be distributed company-wide. To ensure the report is easily accessible and understandable by all recipients, what is an essential feature to include?",
    choices: [
      {
        id: "a",
        text: "Complex graphs and charts to provide detailed analysis.",
      },
      {
        id: "b",
        text: "An executive summary section at the beginning of the report.",
      },
      {
        id: "c",
        text: "Technical jargon and detailed configuration settings.",
      },
      {
        id: "d",
        text: "Links to external documents for further reading.",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Including an executive summary section at the beginning of the report ensures that it is accessible and understandable by all recipients, regardless of their technical knowledge. This summary can provide a quick, clear overview of the report's findings. Choice A (Complex graphs) might not be easily understood by non-technical staff. Choice C (Technical jargon) would make the report inaccessible to those without specific technical knowledge. Choice D (Links to external documents) can be useful but does not ensure the report itself is easily understandable.",
    tags: ["report-templates", "report-distribution", "data-visualization", "executive-summary"],
    id: "REPORT-GEN-1760822343759-9",
  },
  {
    question:
      "Your organization requires the setup of a new Connect destination to send endpoint security state information to a SIEM system for real-time analysis. What key consideration should you prioritize to ensure the integration's success?",
    choices: [
      {
        id: "a",
        text: "Selecting a visually appealing data visualization format for the SIEM dashboard.",
      },
      {
        id: "b",
        text: "Ensuring the data export rate aligns with the SIEM system's ingestion capability.",
      },
      {
        id: "c",
        text: "Focusing solely on the export of high-severity incident data to minimize bandwidth.",
      },
      {
        id: "d",
        text: "Choosing the XML data format for all exports, regardless of the SIEM system's requirements.",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Ensuring the data export rate aligns with the SIEM system's ingestion capability is crucial to avoid overwhelming the SIEM system and to ensure timely and accurate analysis of security state information. Choice A (Visually appealing format) is less relevant since effectiveness, not aesthetics, is the priority. Choice C (High-severity data) could miss important context by excluding other security data. Choice D (XML format) disregards the importance of using a data format compatible with the SIEM system's requirements.",
    tags: ["connect-destinations", "siem-integration", "data-export-rate", "integration-success"],
    id: "REPORT-GEN-1760822343759-10",
  },
  {
    question:
      "You are tasked with creating a weekly report that shows all unpatched vulnerabilities across your networked devices. The report must be shared with your IT security team every Monday morning. Which Tanium module and feature should you use to automate this task?",
    choices: [
      {
        id: "a",
        text: "Connect module with scheduled report automation",
      },
      {
        id: "b",
        text: "Interact module with saved question results",
      },
      {
        id: "c",
        text: "Trends module with a scheduled dashboard",
      },
      {
        id: "d",
        text: "Protect module with email notifications",
      },
    ],
    correctAnswerId: "a",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect module with scheduled report automation is correct because it allows for the scheduling of reports on a regular basis, which can then be automatically shared with specified recipients like the IT security team. Choice B (Interact module with saved question results) is incorrect because, while it allows for real-time data queries, it does not have a built-in feature for scheduling and automating report distribution. Choice C (Trends module with a scheduled dashboard) is incorrect because Trends is more focused on visualizing and monitoring data over time rather than exporting or sharing reports. Choice D (Protect module with email notifications) is incorrect because Protect focuses on proactive security measures rather than reporting on vulnerabilities.",
    tags: [
      "scheduled-report-automation",
      "connect-module",
      "report-sharing-and-distribution",
      "data-export-formats",
    ],
    id: "REPORT-GEN-1760822415656-1",
  },
  {
    question:
      "Your company requires weekly exports of endpoint health metrics to be analyzed in an external business intelligence tool. The data must be in CSV format. Which Tanium feature should you configure to meet this requirement?",
    choices: [
      {
        id: "a",
        text: "Connect module with a CSV formatter",
      },
      {
        id: "b",
        text: "Export List from Interact module",
      },
      {
        id: "c",
        text: "Reports in Trends with a CSV download option",
      },
      {
        id: "d",
        text: "Protect module exporting directly to CSV",
      },
    ],
    correctAnswerId: "a",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect module with a CSV formatter is correct because Connect allows for the configuration of data exports in various formats, including CSV, which is ideal for analysis in external tools. Choice B (Export List from Interact module) is incorrect because, although it allows for data export, it lacks the scheduling and format customization capabilities of Connect. Choice C (Reports in Trends with a CSV download option) is incorrect because Trends focuses on visualization within Tanium, not external data exports. Choice D (Protect module exporting directly to CSV) is incorrect because Protect is used for threat response and management, not for exporting health metrics.",
    tags: ["connect-integration", "data-export-formats", "csv-export", "external-analysis"],
    id: "REPORT-GEN-1760822415656-2",
  },
  {
    question:
      "Your organization needs to automate the distribution of compliance reports to a third-party auditor every quarter. The reports should include detailed system configurations and compliance statuses in XML format. Which solution within Tanium would best accomplish this?",
    choices: [
      {
        id: "a",
        text: "Configuring email alerts within the Trends module",
      },
      {
        id: "b",
        text: "Using the Interact module to manually send the reports",
      },
      {
        id: "c",
        text: "Setting up Connect destinations to email the XML reports",
      },
      {
        id: "d",
        text: "Automating reports through the Protect module",
      },
    ],
    correctAnswerId: "c",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Setting up Connect destinations to email the XML reports is correct because Connect allows for the automated distribution of reports in specific formats, including XML, and can be scheduled to send these reports directly to third-party emails, such as an auditor. Choice A (Configuring email alerts within the Trends module) is incorrect because Trends primarily focuses on data visualization and alerting based on trends, not on exporting detailed reports. Choice B (Using the Interact module to manually send the reports) is incorrect because it relies on manual processes and does not support automated scheduling or XML format exports. Choice D (Automating reports through the Protect module) is incorrect because Protect is focused on security compliance and threat protection, not on the automated distribution of reports in XML format.",
    tags: [
      "connect-destinations",
      "report-sharing-and-distribution",
      "xml-export",
      "compliance-reports",
    ],
    id: "REPORT-GEN-1760822415656-3",
  },
  {
    question:
      "To improve incident response times, you need to configure Tanium to send real-time alerts to your SIEM whenever a new unmanaged device is detected on the network. Which Tanium module facilitates this integration?",
    choices: [
      {
        id: "a",
        text: "Interact module for real-time querying",
      },
      {
        id: "b",
        text: "Connect module with a SIEM integration",
      },
      {
        id: "c",
        text: "Discover module for device detection",
      },
      {
        id: "d",
        text: "Protect module for threat management",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect module with a SIEM integration is correct because Connect allows for the configuration of data streams to external systems, such as a SIEM, facilitating real-time alerts based on specific Tanium data, like the detection of unmanaged devices. Choice A (Interact module for real-time querying) is incorrect because while Interact can query real-time data, it does not directly facilitate external system integrations. Choice C (Discover module for device detection) is incorrect because, although Discover is used for detecting unmanaged devices, it does not by itself handle external system integrations. Choice D (Protect module for threat management) is incorrect because Protect focuses on managing threats within Tanium, not sending data to external systems.",
    tags: [
      "connect-module",
      "siem-integration",
      "real-time-alerts",
      "external-systems-integration",
    ],
    id: "REPORT-GEN-1760822415656-4",
  },
  {
    question:
      "After a recent audit, you're required to demonstrate how long endpoint data is retained within Tanium for compliance purposes. Which module and feature should you consult to find this information?",
    choices: [
      {
        id: "a",
        text: "Interact module and its question history",
      },
      {
        id: "b",
        text: "Connect module and its data retention settings",
      },
      {
        id: "c",
        text: "Trends module and its data archiving options",
      },
      {
        id: "d",
        text: "Asset module and its inventory retention settings",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Connect module and its data retention settings is correct because Connect directly manages how data is exported, stored, and retained, making it the best place to define and review retention policies for compliance. Choice A (Interact module and its question history) is incorrect because while Interact retains question history, it does not manage overall data retention policies. Choice C (Trends module and its data archiving options) is incorrect because Trends focuses on visual data trends over time, not on data retention settings. Choice D (Asset module and its inventory retention settings) is incorrect because Asset tracks endpoint inventory but does not control general data retention policies.",
    tags: [
      "data-retention-and-archiving",
      "connect-module",
      "compliance",
      "data-retention-settings",
    ],
    id: "REPORT-GEN-1760822415656-5",
  },
  {
    question:
      "You are preparing a presentation for the executive team on the effectiveness of the newly deployed endpoint protection solution. Which Tanium module should you use to create visual reports that highlight key metrics and trends?",
    choices: [
      {
        id: "a",
        text: "Trends module for data visualization",
      },
      {
        id: "b",
        text: "Connect module for external report sharing",
      },
      {
        id: "c",
        text: "Interact module for real-time data querying",
      },
      {
        id: "d",
        text: "Protect module for security posture insights",
      },
    ],
    correctAnswerId: "a",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Trends module for data visualization is correct because it's specifically designed to create visualizations and reports that can highlight key metrics and trends over time, making it ideal for presentations to executive teams. Choice B (Connect module for external report sharing) is incorrect because, while Connect can distribute data, it's not designed for creating visualizations. Choice C (Interact module for real-time data querying) is incorrect because, although it can provide real-time data, it does not specialize in data visualization. Choice D (Protect module for security posture insights) is incorrect because, despite offering valuable security insights, it does not focus on the creation of visual reports for presentations.",
    tags: [
      "data-visualization-in-reports",
      "trends-module",
      "report-templates",
      "executive-presentations",
    ],
    id: "REPORT-GEN-1760822415656-6",
  },
  {
    question:
      "To streamline IT operations, your team decides to integrate Tanium data with your IT service management (ITSM) platform to automatically create tickets based on specific Tanium alerts. Which Tanium feature is best suited for this task?",
    choices: [
      {
        id: "a",
        text: "Interact module with alert forwarding",
      },
      {
        id: "b",
        text: "Connect module with ITSM integration",
      },
      {
        id: "c",
        text: "Protect module with automated response actions",
      },
      {
        id: "d",
        text: "Trends module with alert dashboards",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect module with ITSM integration is correct because Connect is designed to facilitate the integration of Tanium data with external systems, including ITSM platforms, enabling the automatic creation of tickets based on specific criteria or alerts. Choice A (Interact module with alert forwarding) is incorrect because, while Interact can perform real-time queries and generate alerts, it does not natively integrate with ITSM platforms for ticket creation. Choice C (Protect module with automated response actions) is incorrect because Protect focuses on security responses rather than IT operations and service management. Choice D (Trends module with alert dashboards) is incorrect because Trends is designed for visualizing data trends over time, not for direct integration with ITSM systems.",
    tags: [
      "connect-integration",
      "itsm-integration",
      "automated-ticket-creation",
      "external-systems-integration",
    ],
    id: "REPORT-GEN-1760822415656-7",
  },
  {
    question:
      "Your organization demands a weekly security report that includes all new software installations on endpoints within the last 7 days. This report should be automatically emailed to the security team. Which Tanium solution will fulfill this requirement?",
    choices: [
      {
        id: "a",
        text: "Using the Trends module to track software installation trends",
      },
      {
        id: "b",
        text: "Setting up a Connect report with an email destination",
      },
      {
        id: "c",
        text: "Creating a saved question in Interact and manually sending results",
      },
      {
        id: "d",
        text: "Deploying a custom script via Deploy to gather and email reports",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Setting up a Connect report with an email destination is correct because Connect allows for the automated generation and distribution of reports based on specified criteria, including tracking new software installations, and can be configured to email these reports on a scheduled basis. Choice A (Using the Trends module to track software installation trends) is incorrect because Trends focuses on visualizing data rather than automating report distribution. Choice C (Creating a saved question in Interact and manually sending results) is incorrect because it relies on manual intervention to send the reports, not automation. Choice D (Deploying a custom script via Deploy to gather and email reports) is incorrect because Deploy is intended for taking actions on endpoints, not for generating and emailing reports.",
    tags: [
      "scheduled-report-automation",
      "report-sharing-and-distribution",
      "connect-module",
      "email-destination",
    ],
    id: "REPORT-GEN-1760822415656-8",
  },
  {
    question:
      "To comply with industry regulations, your organization must archive all endpoint activity data for a minimum of five years. Which Tanium feature allows you to configure long-term data retention policies?",
    choices: [
      {
        id: "a",
        text: "Interact module's query history settings",
      },
      {
        id: "b",
        text: "Connect module's data retention policies",
      },
      {
        id: "c",
        text: "Asset module's endpoint activity tracking",
      },
      {
        id: "d",
        text: "Trends module's data archiving options",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Best Practices",
    explanation:
      "Connect module's data retention policies is correct because the Connect module provides configurations for how long data is retained, making it possible to align with specific industry regulations regarding data archiving. Choice A (Interact module's query history settings) is incorrect because query history pertains to the retention of question results, not comprehensive endpoint activity data. Choice C (Asset module's endpoint activity tracking) is incorrect because, while it tracks endpoint data, it does not define data retention policies. Choice D (Trends module's data archiving options) is incorrect because Trends is geared towards visualizing data trends, not setting retention policies.",
    tags: [
      "data-retention-and-archiving",
      "connect-module",
      "data-retention-policies",
      "compliance",
    ],
    id: "REPORT-GEN-1760822415656-9",
  },
  {
    question:
      "In an effort to enhance security analysis, your team decides to export detailed endpoint threat data to a third-party analytics platform. The data should be exported in JSON format for compatibility. Which Tanium module and setup will achieve this?",
    choices: [
      {
        id: "a",
        text: "Connect module with a JSON data formatter",
      },
      {
        id: "b",
        text: "Interact module exporting question results as JSON",
      },
      {
        id: "c",
        text: "Trends module exporting dashboard data in JSON",
      },
      {
        id: "d",
        text: "Protect module with direct JSON export capabilities",
      },
    ],
    correctAnswerId: "a",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect module with a JSON data formatter is correct because it specifically supports the configuration of exports in various formats, including JSON, making it suitable for integration with third-party analytics platforms. Choice B (Interact module exporting question results as JSON) is incorrect because, while Interact can provide data, it lacks the enhanced formatting and scheduling capabilities of Connect. Choice C (Trends module exporting dashboard data in JSON) is incorrect because Trends focuses on data visualization within Tanium, not external data exports. Choice D (Protect module with direct JSON export capabilities) is incorrect because Protect is aimed at threat management within Tanium, not data exports.",
    tags: ["connect-integration", "data-export-formats", "json-export", "external-analysis"],
    id: "REPORT-GEN-1760822415656-10",
  },
  {
    question:
      "As part of your compliance reporting, you're tasked with automating the export of weekly security audit results to a CSV file for further analysis. Which Tanium module would streamline this process?",
    choices: [
      {
        id: "a",
        text: "Interact to manually export the results",
      },
      {
        id: "b",
        text: "Trends to visualize audit compliance over time",
      },
      {
        id: "c",
        text: "Connect to automate and schedule the report exports",
      },
      {
        id: "d",
        text: "Asset for endpoint inventory checks",
      },
    ],
    correctAnswerId: "c",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect is correct because it is designed to automate data exports in various formats, including CSV, and can be scheduled to run reports on a recurring basis. Choice A (Interact) is incorrect because it's mainly for real-time data queries and does not support automated scheduling. Choice B (Trends) is incorrect because it focuses on data visualization within Tanium, not exporting data. Choice D (Asset) is incorrect because it's used for inventory management and not for exporting compliance reports.",
    tags: ["connect-module", "csv-export", "automated-reports", "security-audit"],
    id: "REPORT-GEN-1760822497422-1",
  },
  {
    question:
      "Your organization requires a daily export of endpoint vulnerability data to be integrated with your external ITSM system for ticketing. Which Connect destination configuration should be used for this integration?",
    choices: [
      {
        id: "a",
        text: "Email destination with CSV attachments",
      },
      {
        id: "b",
        text: "ITSM destination using Connect",
      },
      {
        id: "c",
        text: "SIEM destination for real-time monitoring",
      },
      {
        id: "d",
        text: "Database destination to store historical data",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "ITSM destination using Connect is correct because it is specifically designed for integrating with ITSM systems, allowing for automated ticket generation based on the exported data. Choice A (Email destination with CSV attachments) is incorrect because it's less efficient for ticketing purposes and requires manual intervention. Choice C (SIEM destination for real-time monitoring) is incorrect as it's better suited for security event monitoring rather than ticket generation. Choice D (Database destination to store historical data) is incorrect because it's focused on data retention rather than direct integration with ITSM systems.",
    tags: ["connect-destinations", "itsm-integration", "data-export", "endpoint-vulnerability"],
    id: "REPORT-GEN-1760822497422-2",
  },
  {
    question:
      "To comply with regulatory standards, your team must archive all compliance report exports for a minimum of five years. Which feature should you consider to ensure data retention for this requirement?",
    choices: [
      {
        id: "a",
        text: "Connect destinations for immediate external transfer",
      },
      {
        id: "b",
        text: "Scheduled reports to generate daily archives",
      },
      {
        id: "c",
        text: "Data visualization in Trends for real-time monitoring",
      },
      {
        id: "d",
        text: "Report templates for standardized export formats",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Scheduled reports to generate daily archives is correct because it allows for automated creation of reports that can be stored externally to meet the five-year retention requirement. Choice A (Connect destinations for immediate external transfer) is incorrect because it focuses on real-time or scheduled data transfer without explicitly addressing long-term storage needs. Choice C (Data visualization in Trends for real-time monitoring) is incorrect because it's aimed at visual data analysis, not data retention. Choice D (Report templates for standardized export formats) is incorrect because it pertains to the format of reports, not their retention.",
    tags: ["data-retention", "scheduled-reports", "compliance-standards", "archive-reports"],
    id: "REPORT-GEN-1760822497422-3",
  },
  {
    question:
      "Your team needs to share weekly endpoint health reports with non-technical stakeholders in an easy-to-digest format. What is the best approach to meet this requirement?",
    choices: [
      {
        id: "a",
        text: "Export data in XML format for technical accuracy",
      },
      {
        id: "b",
        text: "Use Connect to send reports via email in PDF format",
      },
      {
        id: "c",
        text: "Schedule SQL queries to run and export data to IT",
      },
      {
        id: "d",
        text: "Visualize data in Trends and grant dashboard access",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Use Connect to send reports via email in PDF format is correct because it allows for the creation of visually appealing and digestible reports suitable for non-technical stakeholders and supports scheduling and automatic emailing. Choice A (Export data in XML format for technical accuracy) is incorrect because XML is a data-centric format that is not user-friendly for non-technical audiences. Choice C (Schedule SQL queries to run and export data to IT) is incorrect because it requires additional steps to convert data into a non-technical format. Choice D (Visualize data in Trends and grant dashboard access) is incorrect because, while visually appealing, it might require stakeholders to interact with the system directly, which could be challenging for non-technical users.",
    tags: ["connect-module", "report-sharing", "pdf-reports", "non-technical-stakeholders"],
    id: "REPORT-GEN-1760822497422-4",
  },
  {
    question:
      "To enhance security operations, your company wants to automatically export detected malware events from Tanium to a SIEM system in real-time. Which module and configuration should you use?",
    choices: [
      {
        id: "a",
        text: "Interact module with real-time sensor queries",
      },
      {
        id: "b",
        text: "Trends module for historical event analysis",
      },
      {
        id: "c",
        text: "Connect with a SIEM destination configured",
      },
      {
        id: "d",
        text: "Asset module for endpoint inventory tracking",
      },
    ],
    correctAnswerId: "c",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect with a SIEM destination configured is correct because Connect is specifically designed to automate and streamline the export of Tanium data to external systems like SIEMs in real-time or on a scheduled basis. Choice A (Interact module with real-time sensor queries) is incorrect because, while it can provide real-time data, it does not automate exports to external systems. Choice B (Trends module for historical event analysis) is incorrect because Trends is focused on visualizing and analyzing data within Tanium, not exporting it. Choice D (Asset module for endpoint inventory tracking) is incorrect because it's geared towards inventory management, not security event export.",
    tags: ["connect-module", "siem-integration", "malware-events", "real-time-export"],
    id: "REPORT-GEN-1760822497422-5",
  },
  {
    question:
      "You are tasked with configuring scheduled exports of network activity logs to an external database for long-term analysis and compliance. Which configuration in Tanium Connect should you prioritize to ensure data integrity during transfer?",
    choices: [
      {
        id: "a",
        text: "Enable compression to reduce bandwidth usage",
      },
      {
        id: "b",
        text: "Configure SSL encryption for data in transit",
      },
      {
        id: "c",
        text: "Use the email destination with password protection",
      },
      {
        id: "d",
        text: "Schedule exports during off-peak hours to reduce load",
      },
    ],
    correctAnswerId: "b",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Configure SSL encryption for data in transit is correct because it ensures that data is securely transferred from Tanium to the external database, protecting it from potential interception or tampering. Choice A (Enable compression to reduce bandwidth usage) is incorrect because, while it optimizes bandwidth, it does not address data integrity or security. Choice C (Use the email destination with password protection) is incorrect because it's not a secure method for transferring large datasets like network activity logs. Choice D (Schedule exports during off-peak hours to reduce load) is incorrect because it concerns system performance, not data integrity.",
    tags: ["connect-configuration", "data-integrity", "ssl-encryption", "network-activity-logs"],
    id: "REPORT-GEN-1760822497422-6",
  },
  {
    question:
      "Your management team requests a monthly report that combines endpoint hardware, software inventory, and vulnerability status into a single comprehensive view. Which Tanium feature should you leverage to create and distribute this report?",
    choices: [
      {
        id: "a",
        text: "Interact module for ad-hoc data collection",
      },
      {
        id: "b",
        text: "Trends for dynamic data visualization",
      },
      {
        id: "c",
        text: "Connect with custom SQL queries for data aggregation",
      },
      {
        id: "d",
        text: "Asset module for standardized reporting",
      },
    ],
    correctAnswerId: "c",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect with custom SQL queries for data aggregation is correct because it allows for the creation of complex data views by aggregating different types of data, which can then be exported or sent to various destinations, fulfilling the requirement for a comprehensive monthly report. Choice A (Interact module for ad-hoc data collection) is incorrect because it's primarily used for real-time querying and doesn't support complex data aggregation. Choice B (Trends for dynamic data visualization) is incorrect because, although it's excellent for visualization, it may not support the custom aggregation required for this report. Choice D (Asset module for standardized reporting) is incorrect because it focuses on inventory data and may not easily include customized vulnerability status information.",
    tags: ["connect-module", "sql-queries", "data-aggregation", "comprehensive-reporting"],
    id: "REPORT-GEN-1760822497422-7",
  },
  {
    question:
      "In preparing for a security audit, you need to ensure that all endpoint security reports are distributed to the audit team in a secure and accessible format. What is the best method to accomplish this using Tanium?",
    choices: [
      {
        id: "a",
        text: "Generate reports in Connect and upload them to a secure FTP",
      },
      {
        id: "b",
        text: "Email the reports directly from the Trends module",
      },
      {
        id: "c",
        text: "Configure Connect to send reports in encrypted PDF format",
      },
      {
        id: "d",
        text: "Share a link to the Interact module with the audit team",
      },
    ],
    correctAnswerId: "c",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Configure Connect to send reports in encrypted PDF format is correct because it ensures that reports are both secure, due to encryption, and accessible, being in PDF format. Choice A (Generate reports in Connect and upload them to a secure FTP) is incorrect because, while secure, it requires manual steps to upload reports and may not be as easily accessible to the audit team. Choice B (Email the reports directly from the Trends module) is incorrect as Trends doesn't offer encrypted email options. Choice D (Share a link to the Interact module with the audit team) is incorrect because it requires the audit team to have direct access to Tanium, which may not be feasible or secure.",
    tags: ["connect-reports", "secure-distribution", "encrypted-pdf", "security-audit"],
    id: "REPORT-GEN-1760822497422-8",
  },
  {
    question:
      "The IT department requires a custom dashboard that displays real-time data on patch compliance and software vulnerabilities across the network. Which Tanium module would you use to design this dashboard?",
    choices: [
      {
        id: "a",
        text: "Deploy for patch management activities",
      },
      {
        id: "b",
        text: "Interact for real-time querying of endpoints",
      },
      {
        id: "c",
        text: "Trends to create and share custom dashboards",
      },
      {
        id: "d",
        text: "Protect to manage vulnerability settings",
      },
    ],
    correctAnswerId: "c",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Trends to create and share custom dashboards is correct because it allows for the visualization of real-time and historical data in a customizable format, suitable for monitoring patch compliance and software vulnerabilities. Choice A (Deploy for patch management activities) is incorrect because Deploy is focused on executing patch management rather than visualizing data. Choice B (Interact for real-time querying of endpoints) is incorrect as it primarily serves for querying data, not for creating dashboards. Choice D (Protect to manage vulnerability settings) is incorrect because Protect is used for setting up vulnerability management policies, not for dashboard creation.",
    tags: ["trends-module", "custom-dashboards", "patch-compliance", "software-vulnerabilities"],
    id: "REPORT-GEN-1760822497422-9",
  },
  {
    question:
      "You need to automate the distribution of monthly device compliance reports to specific department heads within your organization. The report should include device compliance status, recent vulnerabilities found, and patch application success rates. Which solution within Tanium would you use to accomplish this task?",
    choices: [
      {
        id: "a",
        text: "Deploy to execute compliance checks on devices",
      },
      {
        id: "b",
        text: "Interact to manually query and compile data",
      },
      {
        id: "c",
        text: "Connect to automate report generation and distribution",
      },
      {
        id: "d",
        text: "Protect to assess vulnerabilities and patches",
      },
    ],
    correctAnswerId: "c",
    domain: "Report Generation and Data Export",
    difficulty: "Intermediate",
    category: "Practical Scenarios",
    explanation:
      "Connect to automate report generation and distribution is correct because it provides capabilities to not only generate reports based on specific data requirements but also to schedule these reports and distribute them to designated recipients automatically. Choice A (Deploy to execute compliance checks on devices) is incorrect because Deploy is used for action execution rather than reporting. Choice B (Interact to manually query and compile data) is incorrect as it involves manual processes and doesn't support automated distribution. Choice D (Protect to assess vulnerabilities and patches) is incorrect because while Protect helps in assessing vulnerabilities, it doesn't handle the automated generation and distribution of reports.",
    tags: [
      "connect-module",
      "automated-distribution",
      "device-compliance-reports",
      "report-generation",
    ],
    id: "REPORT-GEN-1760822497422-10",
  },
];

export default generatedQuestions;
