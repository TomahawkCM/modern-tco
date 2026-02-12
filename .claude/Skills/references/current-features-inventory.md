# Budget App — Current Features Inventory (Offline)

Quick-scan checklist for gap analysis. `[x]` = shipped, `[~]` = partial, `[ ]` = missing/planned.
Planned items show target phase: `[ ] Feature name (P#)`.

**Source**: `docs/BUDGET_APP_FEATURES.md`, codebase exploration.
**Stack**: Next.js 16, React 19, TypeScript 5.9, IndexedDB (Dexie.js), Supabase.
**Scale**: 36 routes, 195+ budget .tsx files, 17 AI modules, 114 locales, 71+ bank configs.
**Codebase**: 961 .ts/.tsx files, 286,564 LOC total (verified 2026-02-05).
**Authoritative plan**: `Plans/BUDGET_APP_AUTHORITATIVE_PLAN.md`

---

## Budgeting

- [x] Envelope / zero-based budgeting (YNAB-style)
- [x] Category groups (hierarchical)
- [x] Rollover unused budget
- [x] Savings goals with progress tracking
- [x] Overspending alerts (real-time)
- [x] 50/30/20 budget analyzer (calculator)
- [ ] Multiple methodology selector — zero-based, envelope, 50/30/20, pay-yourself-first (P1)
- [ ] Safe-to-spend engine (P1)

## Transactions

- [x] Virtual scrolling (100K+ transactions)
- [x] Bulk actions (multi-select categorize, delete, tag)
- [x] Split transactions across categories
- [x] Recurring transaction detection
- [x] Quick categorize (keyboard-driven)
- [x] World-class search (fuzzy, structured queries, NLP, autocomplete, offline index)
- [x] Command palette (Cmd/Ctrl+K)
- [ ] Swipe-to-review — mobile gesture for rapid categorization (P8)

## Bank Import

- [x] 71+ pre-configured CSV bank formats (11 regions)
- [x] OFX/QFX parsing
- [x] PDF OCR extraction (Tesseract.js + PDF.js)
- [x] AI bank format auto-detection
- [x] AI column auto-mapping
- [x] Fuzzy duplicate detection
- [x] YNAB full migration wizard
- [~] SimpleFIN integration — ~80% complete (P2)
- [ ] Plaid integration — premium tier (P2)
- [ ] Receipt scanning — local OCR via Tesseract.js 6.0.1, privacy-first (P2)
- [ ] Sync health dashboard — per-institution status, retry controls (P2)
- [ ] Reconciliation autopilot — guided balance fixes, duplicate/transfer pairing (P2)

## AI / ML

- [x] Smart categorization (rule-based + AI)
- [x] Merchant tokenization and learning
- [x] LSTM predictive spending
- [x] Anomaly detection
- [x] AI chatbot (OpenAI GPT-4)
- [x] Smart transaction enrichment
- [x] Smart error recovery
- [x] Natural language import
- [ ] Federated learning — privacy-preserving model improvement (P4)
- [ ] AI money coach — conversational advisor (P4)
- [ ] Behavioral nudge engine — context-aware smart notifications (P4)
- [ ] Margin finder — savings opportunity scanner (P4)

## Analytics & Insights

- [x] Financial health score (0-100, 6 weighted factors)
- [x] Trend forecasting (extrapolation)
- [x] Spending heatmap (calendar view)
- [x] Sankey diagrams (money flow)
- [x] Category breakdown reports
- [x] Income vs expenses tracking
- [x] Weekly insights (Friday review)
- [x] Recurring transaction detector
- [x] Overspending detector
- [ ] Cash flow projection — 12-month forward, Monte Carlo simulation, what-if scenarios (P5)
- [ ] Safe-to-spend real-time widget (P1)
- [ ] Financial wellness score — composite 0-100 with improvement tips (P3)

## Financial Calculators

- [x] Emergency fund calculator
- [x] Savings goal calculator (compound interest)
- [x] Debt payoff calculator (snowball vs avalanche)
- [x] Subscription cost analyzer
- [x] 50/30/20 budget analyzer
- [ ] Tax categorization and deduction finder (P7)
- [ ] HSA/FSA tracker with contribution limits and deadlines (P7)
- [ ] Quarterly estimated tax tracker for self-employed (P7)
- [ ] Canadian tax integration — RRSP/TFSA/RESP/FHSA tracking, HST/GST per-province (P7)

## Accounts & Assets

- [x] Multiple account types (checking, savings, investments, loans)
- [x] Investment portfolio page
- [x] Loan management with amortization
- [x] Subscription tracking page
- [ ] Crypto & digital asset tracking — exchange API + wallet monitoring (P5)
- [ ] Real estate tracking — Zillow/Redfin API + manual (P5)
- [ ] Unified net worth dashboard — all asset classes aggregated (P5)
- [ ] BNPL tracking — auto-detect installments as liabilities (P7)

## Dashboard

- [x] 7 built-in widgets (balances, transactions, budgets, income/expenses, categories, trends, bills)
- [x] Drag-and-drop widget editing
- [x] 4 layout presets (Minimal, Standard, Detailed, Analytics)
- [x] Widget size controls (S/M/L/XL)
- [x] Layout persistence (localStorage)

## Security & Privacy

- [x] AES-256 client-side encryption
- [x] Zero-knowledge architecture (local-first)
- [x] Encrypted IndexedDB wrapper
- [x] Encryption migration utilities
- [ ] E2E encrypted cloud sync — Supabase Realtime transport (P1)
- [ ] FIDO2/WebAuthn passkeys (P1)
- [ ] 24-word recovery phrase for E2E data decryption (P1)
- [ ] E2E encrypted document vault — receipts, tax docs, warranties (P6)
- [ ] Public threat model + security audit (P1)

## Sync & Collaboration

- [x] LAN peer-to-peer sync (21KB context)
- [ ] Cloud sync engine — Supabase Realtime, vector clocks (P1)
- [ ] Family groups — roles, permissions, spending limits (P3)
- [ ] Couple-specific features — joint accounts, split bills, approval workflow (P3)
- [ ] Savings challenges — family leaderboard, streak tracking (P3)
- [ ] Gamification — badges, streaks, milestone celebrations (P3)

## Internationalization

- [x] 114 locales with full translations (1,200+ keys)
- [x] 72+ currencies (ISO 4217, zero-decimal handling)
- [x] RTL support (Arabic, Hebrew, Farsi, Urdu)
- [x] Locale-aware formatting (dates, numbers, currency symbols)
- [ ] True multi-currency engine — 160+ currencies, travel mode, exchange gain/loss (P1)

## Accessibility

- [x] WCAG 2.1 AA compliance
- [x] Full keyboard navigation
- [x] Seniors mode (larger text, simplified UI)
- [ ] Voice commands — speech-to-text, hands-free entry (P9)
- [ ] Screen reader optimization audit

## Notifications

- [x] In-app notifications
- [x] Calendar/ICS export
- [ ] Push notifications — service worker, deep linking (P8)
- [ ] Smart nudges — context-aware, timing-optimized (P4)

## Data Portability

- [x] JSON/CSV export
- [x] YNAB import
- [x] PDF report export
- [ ] Public API — REST, bearer tokens, scopes (P6)
- [ ] Webhooks — transaction, budget, sync events (P6)
- [ ] Mint/Quicken QIF import (P6)
- [ ] Open banking compliance — Section 1033 (on hold), PSD3, Canadian open banking (P6)
- [ ] Smart rules engine — if-then automation for categories, alerts, transfers (P6)

## Platform

- [x] Progressive Web App (PWA)
- [x] Offline-first (full functionality)
- [ ] Mobile native — React Native wrapper, app store presence (P8)
- [ ] Self-hosted Docker deployment — $49/yr tier (P9)
- [ ] Wearable widgets — Apple Watch, Wear OS (P8)
- [ ] Browser extension
