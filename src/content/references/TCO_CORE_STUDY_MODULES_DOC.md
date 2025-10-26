# Tanium TCO — Core Study Modules Documentation

Purpose

- Authoritative summary of the six core study modules (00–05) used in the TCO curriculum.
- Includes module metadata, prerequisites, time, objectives focus, labs mapping, and recommended flow.

Scope

- Core modules only: Foundation, Asking Questions, Refining Questions & Targeting, Taking Action, Navigation & Basic Module Functions, Reporting & Data Export.

## Jump To

- Module 00 — Foundation
  - [Section 1 — What is Tanium? (45m)](/study/platform-foundation#section-1-what-is-tanium-45-minutes)
  - [Section 2 — Platform Terminology (45m)](/study/platform-foundation#section-2-platform-terminology-45-minutes)
  - [Section 3 — Client-Server Communication (30m)](/study/platform-foundation#section-3-client-server-communication-30-minutes)
  - [Section 4 — Console Tour (45m)](/study/platform-foundation#section-4-console-tour-45-minutes)
  - [Section 5 — Why Tanium is Efficient (15m)](/study/platform-foundation#section-5-why-tanium-is-efficient-15-minutes)

- Module 01 — Asking Questions
  - [Domain Overview](/study/asking-questions#domain-overview)
  - [Core Concepts](/study/asking-questions#core-concepts)
  - [Interactive Learning](/study/asking-questions#interactive-learning)
  - [Saved Question Management](/study/asking-questions#saved-question-management)
  - [Hands-On Lab Preview](/study/asking-questions#hands-on-lab-preview)
  - [Key Takeaways](/study/asking-questions#key-takeaways)

- Module 02 — Refining Questions & Targeting
  - [Key Concepts](/study/refining-questions-targeting#key-concepts)
  - [Advanced Filtering Deep Dive](/study/refining-questions-targeting#advanced-filtering-deep-dive)
  - [Computer Groups Mastery](/study/refining-questions-targeting#computer-groups-mastery)
  - [RBAC Deep Dive](/study/refining-questions-targeting#rbac-deep-dive)
  - [Targeting Safety Procedures](/study/refining-questions-targeting#targeting-safety-procedures)
  - [Performance Optimization](/study/refining-questions-targeting#performance-optimization)
  - [Practice](/study/refining-questions-targeting#practice) · [Assess](/study/refining-questions-targeting#assess) · [Labs](/study/refining-questions-targeting#labs)

- Module 03 — Taking Action
  - [Package Basics (25m)](/study/taking-action-packages-actions#package-basics-25-minutes)
  - [Action Deployment (20m)](/study/taking-action-packages-actions#action-deployment-20-minutes)
  - [Exit Codes and Troubleshooting (15m)](/study/taking-action-packages-actions#exit-codes-and-troubleshooting-15-minutes)
  - [Scheduled Actions (15m)](/study/taking-action-packages-actions#scheduled-actions-15-minutes)
  - [Basic Rollback (10m)](/study/taking-action-packages-actions#basic-rollback-10-minutes)

- Module 04 — Navigation & Basic Module Functions
  - [Section 1 — Console Layout Deep Dive (45m)](/study/navigation-basic-modules#section-1-console-layout-deep-dive-45-minutes)
  - [Section 2 — Module Decision Framework (60m)](/study/navigation-basic-modules#section-2-module-decision-framework-interact-vs-trends-vs-reporting-vs-connect-60-minutes)
  - [Section 3 — Module-Specific Procedures (75m)](/study/navigation-basic-modules#section-3-module-specific-procedures-75-minutes)
  - [Section 4 — Navigation Efficiency & Power User Techniques (30m)](/study/navigation-basic-modules#section-4-navigation-efficiency-and-power-user-techniques-30-minutes)
  - [Section 5 — Troubleshooting Navigation & Performance (20m)](/study/navigation-basic-modules#section-5-troubleshooting-navigation-and-performance-issues-20-minutes)
  - More: Sections 6–12

- Module 05 — Reporting & Data Export
  - [Section A — Report Building Fundamentals (45m)](/study/reporting-data-export#section-a-report-building-fundamentals-45-minutes)
  - [Section B — Advanced Reporting Features (60m)](/study/reporting-data-export#section-b-advanced-reporting-features-60-minutes)
  - [Section C — Scheduling and Distribution (45m)](/study/reporting-data-export#section-c-scheduling-and-distribution-45-minutes)
  - [Section D — Data Export Procedures (60m)](/study/reporting-data-export#section-d-data-export-procedures-60-minutes)
  - [Section E — Troubleshooting Export Operations (30m)](/study/reporting-data-export#section-e-troubleshooting-export-operations-30-minutes)
  - Supplemental: [F](/study/reporting-data-export#section-f-enterprise-report-architecture-45-minutes) · [G](/study/reporting-data-export#section-g-advanced-security-and-compliance-40-minutes) · [H](/study/reporting-data-export#section-h-real-world-implementation-case-studies-35-minutes) · [I](/study/reporting-data-export#section-i-advanced-troubleshooting-scenarios-30-minutes)

---

## Learning Path

Order

- 00 → 01 → 02 → 03 → 04 → 05

Notes

- 00 Foundation is a prerequisite orientation (blueprintWeight: 0). It prepares learners for domains 1–5.
- Modules 1–5 align to the TCO exam blueprint with indicated blueprintWeight.

---

## Module Catalog

- Module 00 — Tanium Platform Foundation
  - File: `src/content/modules/00-tanium-platform-foundation.mdx`
  - id: `module-tanium-platform-foundation`
  - domainSlug: `platform-foundation`
  - difficulty: Beginner
  - estimatedTime: 180 min
  - blueprintWeight: 0
  - status: published | version: 1 | lastUpdated: 2024-09-24
  - Focus: architecture, terminology (sensors/questions/actions/packages/modules), client-server communication model, console basics, performance/scalability rationale
  - Units (5):
    - Section 1 — What is Tanium? (45m): `/study/platform-foundation#section-1-what-is-tanium-45-minutes`
    - Section 2 — Platform Terminology (45m): `/study/platform-foundation#section-2-platform-terminology-45-minutes`
    - Section 3 — Client-Server Communication (30m): `/study/platform-foundation#section-3-client-server-communication-30-minutes`
    - Section 4 — Console Tour (45m): `/study/platform-foundation#section-4-console-tour-45-minutes`
    - Section 5 — Why Tanium is Efficient (15m): `/study/platform-foundation#section-5-why-tanium-is-efficient-15-minutes`

- Module 01 — Asking Questions
  - File: `src/content/modules/01-asking-questions.mdx`
  - id: `tco-asking-questions`
  - domainSlug: `asking-questions`
  - difficulty: Beginner
  - estimatedTime: 45 min
  - blueprintWeight: 0.22
  - status: published | version: 1 | lastUpdated: 2024-09-05
  - Focus: natural language query construction, sensor library fundamentals, saved questions, interpreting results and troubleshooting performance
  - Primary units (6):
    - Domain Overview: `/study/asking-questions#domain-overview`
    - Core Concepts: `/study/asking-questions#core-concepts`
    - Interactive Learning: `/study/asking-questions#interactive-learning`
    - Saved Question Management: `/study/asking-questions#saved-question-management`
    - Hands-On Lab Preview: `/study/asking-questions#hands-on-lab-preview`
    - Key Takeaways: `/study/asking-questions#key-takeaways`
  - Additional sections: Sensor Deep Dive, Query Patterns Library, Advanced Sensor Deep Dive (see headings within module)

- Module 02 — Refining Questions & Targeting
  - File: `src/content/modules/02-refining-questions-targeting.mdx`
  - id: `module-refining-questions-targeting`
  - domainSlug: `refining-questions-targeting`
  - difficulty: Intermediate
  - estimatedTime: 90 min
  - blueprintWeight: 0.23
  - prerequisites: `module-asking-questions`
  - status: published | version: 2 | lastUpdated: 2025-10-04
  - Focus: RBAC/content sets, dynamic vs. static groups, advanced filtering (AND/OR/NOT), targeting safety and validation
  - Primary units (6):
    - Key Concepts: `/study/refining-questions-targeting#key-concepts`
    - Advanced Filtering Deep Dive: `/study/refining-questions-targeting#advanced-filtering-deep-dive`
    - Computer Groups Mastery: `/study/refining-questions-targeting#computer-groups-mastery`
    - RBAC Deep Dive: `/study/refining-questions-targeting#rbac-deep-dive`
    - Targeting Safety Procedures: `/study/refining-questions-targeting#targeting-safety-procedures`
    - Performance Optimization: `/study/refining-questions-targeting#performance-optimization`
  - Additional: Practice, Assess, Labs quick links — `/study/refining-questions-targeting#practice`, `/study/refining-questions-targeting#assess`, `/study/refining-questions-targeting#labs`

- Module 03 — Taking Action — Packages & Actions
  - File: `src/content/modules/03-taking-action-packages-actions.mdx`
  - id: `module-taking-action`
  - domainSlug: `taking-action-packages-actions`
  - difficulty: Intermediate
  - estimatedTime: 120 min
  - blueprintWeight: 0.15
  - prerequisites: `module-refining-questions-targeting`
  - status: published | version: 1 | lastUpdated: 2025-09-24
  - Focus: deploying basic packages, parameters, monitoring actions and exit codes, simple rollback procedures
  - Units (5):
    - Package Basics (25m): `/study/taking-action-packages-actions#package-basics-25-minutes`
    - Action Deployment (20m): `/study/taking-action-packages-actions#action-deployment-20-minutes`
    - Exit Codes and Troubleshooting (15m): `/study/taking-action-packages-actions#exit-codes-and-troubleshooting-15-minutes`
    - Scheduled Actions (15m): `/study/taking-action-packages-actions#scheduled-actions-15-minutes`
    - Basic Rollback (10m): `/study/taking-action-packages-actions#basic-rollback-10-minutes`

- Module 04 — Navigation & Basic Module Functions
  - File: `src/content/modules/04-navigation-basic-modules.mdx`
  - id: `module-navigation-basic-modules`
  - domainSlug: `navigation-basic-modules`
  - difficulty: Beginner
  - estimatedTime: 210 min
  - blueprintWeight: 0.23
  - prerequisites: `platform-client-basics`
  - status: published | version: 2 | lastUpdated: 2025-09-24
  - Focus: console layout, navigation methods/shortcuts, Interact/Trends/Reporting/Connect workflows, panel management, troubleshooting
  - Core units (5 of 12):
    - Section 1 — Console Layout Deep Dive (45m): `/study/navigation-basic-modules#section-1-console-layout-deep-dive-45-minutes`
    - Section 2 — Module Decision Framework (60m): `/study/navigation-basic-modules#section-2-module-decision-framework-interact-vs-trends-vs-reporting-vs-connect-60-minutes`
    - Section 3 — Module-Specific Procedures (75m): `/study/navigation-basic-modules#section-3-module-specific-procedures-75-minutes`
    - Section 4 — Navigation Efficiency & Power User Techniques (30m): `/study/navigation-basic-modules#section-4-navigation-efficiency-and-power-user-techniques-30-minutes`
    - Section 5 — Troubleshooting Navigation & Performance (20m): `/study/navigation-basic-modules#section-5-troubleshooting-navigation-and-performance-issues-20-minutes`
  - Additional sections (6–12):
    - Section 6 — Administrative Workflows (40m): `/study/navigation-basic-modules#section-6-administrative-workflows-40-minutes`
    - Section 7 — Integration Strategies (30m): `/study/navigation-basic-modules#section-7-integration-strategies-30-minutes`
    - Section 8 — Best Practices and Pitfalls (20m): `/study/navigation-basic-modules#section-8-best-practices-and-pitfalls-20-minutes`
    - Section 9 — Enterprise Console Operations (45m): `/study/navigation-basic-modules#section-9-enterprise-console-operations-45-minutes`
    - Section 10 — Complex Module Integration Patterns (50m): `/study/navigation-basic-modules#section-10-complex-module-integration-patterns-50-minutes`
    - Section 11 — Real-World Case Studies (40m): `/study/navigation-basic-modules#section-11-real-world-case-studies-40-minutes`
    - Section 12 — Advanced Troubleshooting Scenarios (35m): `/study/navigation-basic-modules#section-12-advanced-troubleshooting-scenarios-35-minutes`

- Module 05 — Reporting & Data Export
  - File: `src/content/modules/05-reporting-data-export.mdx`
  - id: `module-reporting-data-export`
  - domainSlug: `reporting-data-export`
  - difficulty: Intermediate
  - estimatedTime: 180 min
  - blueprintWeight: 0.17
  - prerequisites: `module-navigation-basic-modules`
  - status: published | version: 2 | lastUpdated: 2025-09-24
  - Focus: report building fundamentals, data sources, filtering/parameters, scheduling, export formats and automation, troubleshooting performance/quality
  - Core units (5):
    - Section A — Report Building Fundamentals (45m): `/study/reporting-data-export#section-a-report-building-fundamentals-45-minutes`
    - Section B — Advanced Reporting Features (60m): `/study/reporting-data-export#section-b-advanced-reporting-features-60-minutes`
    - Section C — Scheduling and Distribution (45m): `/study/reporting-data-export#section-c-scheduling-and-distribution-45-minutes`
    - Section D — Data Export Procedures (60m): `/study/reporting-data-export#section-d-data-export-procedures-60-minutes`
    - Section E — Troubleshooting Export Operations (30m): `/study/reporting-data-export#section-e-troubleshooting-export-operations-30-minutes`
  - Supplemental units (4):
    - Section F — Enterprise Report Architecture (45m): `/study/reporting-data-export#section-f-enterprise-report-architecture-45-minutes`
    - Section G — Advanced Security and Compliance (40m): `/study/reporting-data-export#section-g-advanced-security-and-compliance-40-minutes`
    - Section H — Real-World Implementation Case Studies (35m): `/study/reporting-data-export#section-h-real-world-implementation-case-studies-35-minutes`
    - Section I — Advanced Troubleshooting Scenarios (30m): `/study/reporting-data-export#section-i-advanced-troubleshooting-scenarios-30-minutes`

---

## Labs Mapping

- Refining Questions & Targeting (Module 02)
  - `src/content/labs/refining-targeting/RT-101-dynamic-groups.md`
  - `src/content/labs/refining-targeting/RT-201-advanced-filtering.md`
  - `src/content/labs/refining-targeting/RT-301-scope-validation.md`

- Navigation & Basic Module Functions (Module 04)
  - `src/content/labs/navigation-modules/NM-101-console-navigation-essentials.md`
  - `src/content/labs/navigation-modules/NM-201-module-workflows.md`
  - `src/content/labs/navigation-modules/NM-301-shortcuts-accessibility.md`

- Asking Questions (Module 01), Taking Action (Module 03), Reporting (Module 05)
  - Practice is embedded via interactive components and exercises within module content.

---

## Components Used in Modules

- `MicroQuizMDX` — Inline knowledge checks with explanations.
- `PracticeButton` — Links to labs or guided practice segments in content.
- `QueryPlayground` — Interactive query exercises with expected inputs/outputs.
- Progress surfaces — Section and module progress integrated into study views.

---

## Maintenance Notes

- Keep front‑matter fields (`estimatedTime`, `prerequisites`, `tags`, `blueprintWeight`, `status`, `lastUpdated`) accurate.
- Avoid breaking changes to `id`, `domainSlug`, and section anchors to preserve deep links and progress tracking.
- When adding new labs, place under `src/content/labs/<module>/` and reference via `PracticeButton` from the module content.
