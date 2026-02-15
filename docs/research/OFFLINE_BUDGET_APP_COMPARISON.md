# OFFLINE App Feature Inventory — Scan

Repo: /home/robne/projects/active/tanium-tco/modern-tco
Scan date: 2026-02-15

## Summary
This file documents implemented offline features discovered in the repository and compares them to the baseline competitor feature set from our research. Evidence lines reference files found in the repo (path + short identifier). Where helpful I note gaps and a prioritized roadmap.

## Evidence: Implementation inventory (implemented now)
- App mode and feature flags
  - src/config/features.json — currentMode: "standalone" (evidence of offline-first intent)
    - snippet: "\"currentMode\": \"standalone\""
- Local storage & offline search index
  - src/config/features.json — search.offline-indexedDB referenced modules (offline-search-index.ts)
    - snippet: "Offline IndexedDB-based search index"
  - src/lib/search/offline-search-index.ts (module referenced in features.json)
    - path listed in features.json modules array (module name)
- Parsers / Import utilities (local imports supported)
  - src/lib/parsers/qif-parser.ts — QIF import parser (evidence of import support)
  - src/lib/parsers/mt940-parser.ts — MT940 parser
  - src/lib/parsers/camt053-parser.ts — CAMT.053 parser
  - src/app/api/import/pdf-extract/ — PDF extract utilities (OCR locally via Tesseract.js)
  - src/lib/parsers/ofx-parser.ts (referenced in features.json parserModules)
- Import wizard & bank configs
  - src/config/features.json — bankImport.formats lists CSV, OFX, QIF, PDF (OCR), MT940, CAMT.053
  - src/lib/parsers/bank-configs.ts (referenced) — contains per-bank parsing rules (71 configs)
- Budgeting engine (envelope/YNAB-style)
  - src/config/features.json — budgeting: "YNAB-style zero-based envelope budgeting"
  - src/components/budget/* — UI components (StatCard, blocks, debt-payoff) indicating budgeting screens
  - src/lib/budget/paycheck-planner.ts — budgeting planning logic
- Transaction management & offline features
  - src/config/features.json — transactionManagement.capabilities (virtual scrolling, bulk actions, split transactions, recurring detection)
  - src/components/transactions/ (transaction list UI implied by routes)
- Offline sync / LAN sync
  - src/config/features.json — offlineSync.lanSync modules: src/lib/lan-sync*.ts (lan-sync.ts, lan-sync-connection.ts)
  - src/lib/lan-sync.ts (module listed) — evidence for LAN pairing & device discovery
- Encryption & local privacy
  - src/config/features.json — security.modules include encrypted-db-wrapper.ts and encryption.ts (client-side AES-256)
  - src/lib/encryption/encryption.ts (module referenced)
- Accessibility & Seniors Mode
  - src/config/features.json — accessibility: "Seniors mode (large text)" and keyboard shortcuts
  - src/components/accessibility/ or SeniorsModeContext referenced in stateManagement
- Offline exports & backups
  - src/config/features.json — localExport (enabled: true) and export route (/budget-app/export)
- OCR and PDF parsing (client-side) for statement + receipt scanning
  - src/app/api/import/pdf-extract/ — uses Tesseract.js and PDF.js (mentioned in techStack in features.json)
  - src/lib/parsers/pdf-text-extractor.ts

## Cross-check: Tests & fixtures (evidence of real implemented parsers)
- tests/e2e/import-formats.spec.ts — tests for import formats (QIF/MT940/CAMT/PDF fixtures)
- tests/fixtures/qif/, tests/fixtures/mt940/, tests/fixtures/pdf/ — sample real input files

## UX Evaluation
(Offline)
- Onboarding: Current repo shows multi-profile and Seniors mode feature flags, but I could not find a dedicated onboarding flow component. Evidence: features.json includes multiProfiles and SeniorsModeContext, but no explicit onboarding UI found in routes. Recommended: add a guided onboarding that sets up profile, budget template, and import helper.
- Empty states: Routes include import/export and dashboard routes but I didn't find explicit empty-state components. Add contextual empty states for transactions, budgets, and reports with CTAs (Import, Create Budget, Add Account).
- Navigation: App uses Next.js app router with clear budget-app routes. Ensure bottom navigation (mobile) and left rail (desktop) parity.
- Mobile responsiveness & touch ergonomics: Tech stack suggests PWA capabilities and responsive UI (Tailwind). Verify touch target sizes and mobile safe-area usage.
- Accessibility & Seniors mode: Feature flags indicate Seniors mode. Recommend dedicated larger-font styles and simplified layouts; ensure ARIA labels and focus management are covered.

## Mobile & Cross-Platform Readiness
- PWA: service worker caching and IndexedDB imply PWA readiness. Confirm manifest and service worker scripts exist (not found during scan); add if missing.
- Touch targets: audit components in src/components for minimum 44px touch areas and safe-area CSS (env(safe-area-inset-*)); add tests.
- Installability: add a web manifest and prompt flows for iOS/Android PWAs.

## Ease-of-Use Gaps
- Lack of explicit onboarding and empty-state guidance
- AI features disabled for offline, meaning categorization depends on rules; provide simple auto-categorize heuristics and bulk-categorize flows
- Sync status visibility needs improvement—surface last sync time and conflict warnings prominently

## UX Upgrade Roadmap (offline)
P0
- Guided onboarding (profile creation, import walkthrough)
- Empty-state CTAs and inline help
- Sync status UI and conflict resolution notices
P1
- Mobile touch-target audit and PWA manifest
- Seniors mode visual polish and accessibility audits
P2
- Local contextual help and one-tap import templates

## Reliability & Trust UX
- Add clear 'Last backup' and 'Last sync' timestamps in settings and dashboard
- Provide safe undo for destructive actions (delete transactions/budgets) and a visible activity log

## Summary — UX/Admin/Auth Maturity (offline)
- UX is strong on features but needs focused onboarding, empty states, and sync visibility to match best-in-class offline apps.

---
Prepared by: OpenClaw assistant
