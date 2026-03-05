# Budget App Online Version — Complete Implementation Plan

> **NOTE**: The implementation plan in this document has been superseded by `Plans/BUDGET_APP_AUTHORITATIVE_PLAN.md` (2026-02-05). **This document is retained as the competitive research reference** — the authoritative plan references it for competitor profiles, pricing intelligence, and market analysis. The codebase statistics in the executive summary below are incorrect (see authoritative plan for corrected figures).

**Date**: 2026-02-05 | **Research type**: Full sweep (baseline) | **Stack migration**: React + Vite + Mantine UI

---

## Executive Summary

- **Current state**: Feature-complete offline app (75K+ LOC, 250+ files, 35 routes, 149 components, 17 AI modules, 114 locales) on Next.js 16 + shadcn/ui + Tailwind
- **Target**: "ProtonMail of personal finance" — cloud-enabled E2E encrypted platform with family collaboration, AI coaching, and wealth tracking
- **Tech migration**: Next.js 16 + shadcn/ui → React + Vite + Mantine UI (confirmed by user)
- **Competitive moat**: Zero-knowledge E2E encryption + 114 locales + offline-first — no competitor matches all three
- **Market timing**: Section 1033 delayed (court injunction), PSD3 agreed (compliance ~H2 2027), passkeys at tipping point, AI finance agents exploding

---

## Competitive Research Report — 2026-02-05

### Changes Since Last Report

Baseline report — no prior data.

### New Competitor Developments

#### YNAB ($14.99/mo or $109/yr)

- **New features**: Spotlight (attention dashboard), UK Open Banking via Apple Wallet, loan planner, templates, cost-of-living calculator, mobile redesign, duplicate account detection
- **Pricing**: Raised to $109/yr (from $99), sharing with up to 6 people included
- **Sentiment**: Still considered gold standard for zero-based budgeting; price complaints persist but loyalty strong
- **Privacy**: No E2E encryption, cloud-stored data readable by YNAB

#### Monarch Money ($14.99/mo or $99.99/yr)

- **New features**: AI Assistant, reimagined goals, equity tracking, receipt scanning, retail sync extension (Amazon + Target), credit score tracking, connection health dashboard, "yours/mine/ours" couple labels
- **Pricing**: Promotional $50/yr for new users (NEWYEAR2026), no free tier
- **Sentiment**: Rapidly growing, considered "YNAB with superpowers"; couples features and investment tracking praised
- **Key gap**: No offline mode, no E2E encryption, US-centric

#### Copilot Money ($13/mo or $95/yr)

- **New features**: Transaction AI categorization, budget rebalancing, web app launched, Amazon/Venmo integrations, improved bank connections
- **Pricing**: Premium pricing justified by Apple Editor's Choice award
- **Critical gap**: Android STILL not available (promised since 2023, not delivered as of Feb 2026)
- **Opportunity**: Every Android user is a potential customer for us

#### Rocket Money ($7-14/mo pay-what-you-want)

- **New features**: Custom categories, transaction rules, chat with expert, smart savings account
- **Moat**: Subscription cancellation + bill negotiation (35-60% success fee), 10M+ users, $2.5B claimed savings
- **Privacy**: Standard cloud security, data used for service features

#### Simplifi by Quicken ($3.99-5.99/mo)

- **New features**: Advanced automation rules, customizable dashboard, Kelley Blue Book vehicle tracking, credit score (VantageScore 3.0)
- **Pricing**: Most affordable mainstream option ($47.88-71.88/yr)
- **Unique**: Cash flow projection is core feature, investment tracking included, LifeHub bundle

#### Actual Budget (Free self-host / $7/mo cloud)

- **2026 roadmap**: Plugin system (first plugins = bank sync providers), goals UI improvements
- **E2E encryption**: Already optional, password-derived keys, one-way activation
- **Threat level**: Growing open-source community, YNAB refugees adopting, closest privacy competitor
- **Gap vs us**: No AI/ML, limited mobile, no multi-currency, smaller feature set

#### Lunch Money ($5/mo pay-what-you-want, min $60/yr from Mar 2026)

- **Strengths**: Native multi-currency (160+), developer API, automation rules, crypto tracking, solo-developer transparency
- **Unique**: Pay-what-you-want pricing, 100% customer-funded, no investors
- **Threat**: Closest multi-currency competitor, growing in expat/digital nomad market

#### Emerging AI Finance Apps (NEW ENTRANTS)

- **Mine/MoneyGPT**: $14M Series A (Jan 2026), AI agent learning spending habits, targeting young adults
- **Tendi.ai**: AI financial advisor, Financial Health Index (0-100), trained specifically on CFP exam content
- **Arta AI**: Agentic investment system with RAG, function calling, convex optimization
- **ElektraFi**: Unprompted recommendations monitoring account data
- **Trend**: AI personal finance market $1B (2025) → projected $3.7B by 2033 (18.1% CAGR)

### Feature Gap Analysis

#### Where We Lead (UNIQUE advantages)

| Feature                          | Our Advantage                                | Nearest Competitor           |
| -------------------------------- | -------------------------------------------- | ---------------------------- |
| Zero-knowledge E2E encryption    | Full AES-256-GCM, client-side only           | Actual Budget (optional E2E) |
| 114 locale i18n + RTL            | Production-ready, 1200+ keys                 | YNAB (~10 languages)         |
| Offline-first full functionality | Complete feature parity offline              | No competitor matches        |
| AI/ML modules (17)               | LSTM, anomaly detection, NLP, categorization | Copilot (AI categorization)  |
| Bank format support (71+ CSV)    | Auto-detection, OCR, PDF parsing             | Monarch (Plaid only)         |
| LAN peer-to-peer sync            | Zero-cloud multi-device                      | No competitor offers this    |

#### Where We Trail (gaps to close)

| Feature                   | Leader                          | Gap Severity | Recommended Phase |
| ------------------------- | ------------------------------- | ------------ | ----------------- |
| Live bank sync (Plaid)    | Monarch, YNAB, Copilot          | HIGH         | Phase 2           |
| Couples/family sharing    | Monarch ("yours/mine/ours")     | HIGH         | Phase 3           |
| Investment tracking       | Empower, Monarch                | HIGH         | Phase 5           |
| Native mobile app         | Copilot (iOS), all neobanks     | HIGH         | Phase 8           |
| Credit score tracking     | Monarch, Simplifi, Rocket Money | MEDIUM       | Phase 2           |
| Subscription cancellation | Rocket Money (10M users)        | MEDIUM       | Phase 2           |
| AI conversational coach   | Mine/MoneyGPT, Tendi, Copilot   | MEDIUM       | Phase 4           |
| Cash flow projection      | Simplifi (core feature)         | MEDIUM       | Phase 5           |
| Receipt scanning          | Monarch (just added)            | LOW          | Already have OCR  |

### Pricing Intelligence

| Competitor      | Free              | Paid Monthly | Annual   | Notable                |
| --------------- | ----------------- | ------------ | -------- | ---------------------- |
| YNAB            | 34-day trial      | $14.99       | $109     | Up to 6 people sharing |
| Monarch         | 7-day trial       | $14.99       | $99.99   | Promo $50 first year   |
| Copilot         | 30-day trial      | $13.00       | $95      | Apple-only             |
| Rocket Money    | Yes (limited)     | $7-14 (PWYW) | ~$84-168 | Bill negotiation free  |
| Simplifi        | 30-day trial      | N/A          | $71.88   | Annual only            |
| EveryDollar     | Yes (manual)      | $17.99       | $131.88  | Most expensive         |
| PocketGuard     | Yes (ads)         | $7.99        | $34.99   | Cheapest premium       |
| Goodbudget      | Yes (limited)     | $8.00        | $65      | No bank sync           |
| Actual Budget   | Free (self-host)  | $7.00        | $84      | Open-source            |
| Lunch Money     | 30-day trial      | $5+ (PWYW)   | $60+     | Min increasing         |
| **Our planned** | **Yes (3 accts)** | **$5.99**    | **~$72** | **E2E encrypted**      |

**Assessment**: Our $5.99/mo pricing is competitive — positioned below YNAB/Monarch/Copilot premium tier, in line with Simplifi, and above the budget tier (PocketGuard, Lunch Money). The E2E encryption differentiator justifies the price point. Family tier at $11.99/mo is well below YNAB's $109/yr for 6 people.

### User Sentiment Insights

- **#1 switching trigger**: Price increases (YNAB $84→$109 drove significant churn)
- **#2 switching trigger**: Bank sync reliability (delayed/missing transactions)
- **Privacy demand**: 60% of users willing to pay premium for data protection (surveys)
- **Privacy gap**: 60% of top 20 budgeting apps share user data (Incogni research)
- **Multi-currency pain**: Expats/travelers consistently frustrated by limited support
- **Couples**: Growing demand for "mine/yours/ours" — Monarch just shipped it
- **Self-hosting**: Significant niche demand (Actual Budget, Firefly III communities)

### Geographic Opportunities

| Market      | Local Competition       | Our i18n Coverage  | Demand Signal                        | Priority |
| ----------- | ----------------------- | ------------------ | ------------------------------------ | -------- |
| India       | Paytm-adjacent, growing | Hindi, Tamil, etc. | 54% smartphone, high growth          | HIGH     |
| Brazil      | Weak local competition  | Portuguese         | 5th largest app market               | HIGH     |
| Indonesia   | Emerging                | Bahasa Indonesia   | Mobile-first banking surge           | MEDIUM   |
| Philippines | Minimal                 | Filipino, Tagalog  | Strong remittance market             | MEDIUM   |
| Turkey      | Limited                 | Turkish            | Currency volatility = budgeting need | MEDIUM   |
| Nigeria     | Mobile money focus      | English, Hausa     | Underbanked population               | LOW      |

### Technology & Regulatory Updates

#### Section 1033 (US Open Banking)

- **Status**: Effectively on hold. Court injunction (Oct 2025), CFPB reversing course, new rulemaking in progress
- **Impact**: Original April 2026 deadline will NOT be met. Compliance likely pushed to 2027+
- **Action**: De-risk by NOT depending on Section 1033 for bank sync strategy. Plaid/SimpleFIN remain primary paths

#### PSD3 (EU Open Banking)

- **Status**: Political agreement reached (Nov 2025), formal adoption expected mid-2026
- **Compliance**: H2 2027 or early 2028
- **Impact**: Standardized APIs across EU member states, dashboard for data permissions
- **Action**: Plan Phase 6 (Open Platform) to align with PSD3 compliance timeline

#### Passkeys / FIDO2

- **Status**: At tipping point. 87% of companies deploying or planning. Gartner: main auth method by 2027
- **Banking adoption**: Revolut, Ubank deployed. UAE/India/Philippines have regulatory deadlines (2026)
- **Quantum-safe**: COSE standard now includes post-quantum Dilithium signatures
- **Action**: Phase 1 passkey implementation is well-timed. Use SimpleWebAuthn library

#### AI Finance Agents

- **Status**: Explosion of AI-first finance products (Mine, Tendi, ElektraFi, Arta AI)
- **Market**: $1B (2025) → $3.7B (2033) projected
- **Action**: Phase 4 AI features are critical — differentiate with privacy-first local ML + Claude API

---

## Implementation Plan

### Pre-Phase 0: Tech Stack Migration (React + Vite + Mantine)

This is the foundational decision. The online version will be a **new application** built on React + Vite + Mantine UI, carrying forward the business logic from the current Next.js app.

#### Migration Strategy

1. **New repo/project** using Vite + React + Mantine template
2. **Port business logic directly**: All `src/lib/` modules (encryption, sync, AI, analytics, parsers, etc.) are framework-agnostic TypeScript — they port as-is
3. **Rebuild UI components**: Replace 55+ shadcn/ui components with Mantine equivalents (100+ components available in Mantine)
4. **Replace Tailwind with Mantine styles**: Mantine uses CSS-in-JS with built-in dark mode, responsive utilities, and RTL support
5. **Replace next-intl with Mantine's i18n** or standalone react-intl
6. **Routing**: Replace Next.js App Router with React Router (or TanStack Router)
7. **SSR consideration**: Vite + React is SPA-first. Landing/marketing pages may need separate SSR solution (or Vite SSR plugin)

#### What Ports Directly (No Rewrite Needed)

- `src/lib/encryption/` (889 LOC) — pure crypto, no framework deps
- `src/lib/sync/` (2,273 LOC) — WebRTC/sync logic
- `src/lib/simplefin/` (1,649 LOC) — API client
- `src/lib/ai/` (9,186 LOC) — all AI modules
- `src/lib/analytics/` (2,930 LOC) — analytics engine
- `src/lib/categorization/` (902 LOC) — ML categorizer
- `src/lib/parsers/` (5,967 LOC) — CSV/OFX/PDF parsers
- `src/lib/budget-db.ts` (2,293 LOC) — IndexedDB schema (Dexie.js)
- `src/types/` (895 LOC) — type definitions
- `src/i18n/messages/` — 114 locale JSON files

**Estimated portable code: ~27,000 LOC (36% of codebase)**

#### What Needs Rebuilding

- All 149 React components (shadcn → Mantine)
- 35 page routes (Next.js App Router → React Router)
- 8 API routes (Next.js API → Express/Fastify/Hono backend or serverless functions)
- Contexts (React contexts port with minor changes)
- CSS (Tailwind → Mantine styling system)

#### UI/UX Plan Integration ("Cyber-Soft" Aesthetic)

The UI/UX plan specifies:

- **Dark mode primary** with deep charcoals — Mantine has native dark theme
- **Color coding**: Electric Blue (income), Neon Magenta (expenses), Emerald Green (savings) — custom Mantine theme
- **Typography**: Inter (UI) + JetBrains Mono (data) — Mantine supports custom fonts
- **Framer Motion micro-animations** — compatible with Vite/React
- **Recharts** for visualizations — compatible with Vite/React
- **RingProgress** (Safe-to-Spend Dial) — Mantine has `RingProgress` component built-in
- **Privacy Toggle** (blur values) — custom implementation on Mantine
- **Swipe-to-Review** (Tinder-style) — react-spring or framer-motion gestures

### Phase 1: Foundation (MVP)

**Priority order** (informed by competitive research):

#### 1.1 E2E Encryption Architecture

- **Extend**: Port `src/lib/encryption/budget-encryption.ts` (514 LOC)
- **New**: `lib/auth/cloud-auth.ts`, `lib/auth/key-derivation.ts`, `lib/auth/recovery-key.ts`
- **Key derivation**: Password → PBKDF2 → Master Key → Device Keys
- **Recovery**: 24-word mnemonic (BIP39-style)

#### 1.2 Passkey Authentication (CRITICAL — market timing)

- **Library**: SimpleWebAuthn (`@simplewebauthn/server` + `@simplewebauthn/browser`)
- **Why now**: 87% industry adoption planned, regulatory mandates in UAE/India/Philippines (2026)
- **Supabase**: Custom WebAuthn routes (no native passkey support), Supabase for session management
- **Rollout**: Opt-in → encourage → default for new users → deprecate passwords

#### 1.3 Cloud Sync Engine

- **Reuse**: Port `src/lib/sync/sync-engine.ts` (794 LOC) — vector clocks, conflict resolution
- **New**: `lib/sync/cloud-sync-engine.ts`, `lib/sync/cloud-transport.ts`
- **Transport**: Supabase Realtime for push notifications
- **Flow**: Local change → Encrypt → Queue → Push blob → Realtime notify → Pull → Decrypt → Merge

#### 1.4 Safe-to-Spend Engine (HIGH user demand)

- **Why prioritize**: PocketGuard's core differentiator, Simplifi's standout feature, 80% target daily views
- **New**: `lib/budget/safe-to-spend.ts`, `SafeToSpendWidget` (Mantine RingProgress)
- **Calculation**: Available Balance - Upcoming Bills - Savings Goals - Reserved Budgets

#### 1.5 Budget Methodology Selector

- **New**: `lib/budget/methodology-engine.ts`
- **Methods**: Zero-based, Envelope, 50/30/20, Pay-yourself-first
- **Competitive advantage**: No competitor offers all four in one app

#### 1.6 Multi-Currency Engine (UNIQUE differentiator)

- **New**: `lib/currency/exchange-rate-service.ts`, `lib/currency/multi-currency-engine.ts`
- **Support**: 160+ currencies + crypto stablecoins
- **FX**: Exchange Rates API (primary), historical rate storage, travel mode
- **Why Phase 1**: Lunch Money is only competitor with native multi-currency; our 114 locales make this a natural moat

#### 1.7 Subscription & Billing (Stripe)

- **Tiers**: Free (3 accounts, 1 device) / Premium $5.99/mo / Family $11.99/mo
- **Competitive positioning**: Below YNAB ($14.99), Monarch ($14.99), Copilot ($13), EveryDollar ($17.99)

#### 1.8 Cloud Database Schema (Supabase)

- `cloud_users`, `user_devices`, `encrypted_budget_data`, `sync_state`
- All financial data stored as encrypted blobs — zero-knowledge

### Phase 2: Bank Sync (Post-MVP)

#### 2.1 Complete SimpleFIN

- **Current**: ~80% complete (`src/lib/simplefin/client.ts` — 502 LOC)
- **Action**: Port and complete, add account matcher + connection wizard

#### 2.2 Plaid Integration (Premium)

- **Note**: Section 1033 delayed — Plaid remains primary US bank sync path
- **New**: `lib/plaid/client.ts`, `lib/plaid/link-handler.ts`

#### 2.3 Subscription Detection & Cancellation

- **Reuse**: Port `src/lib/analytics/recurring-detector.ts` (209 LOC)
- **New**: Overlap detector, price change alerts, cancellation guides, annualized cost summary
- **Competitive response**: Rocket Money's core moat — we can't match their negotiation service but can match detection + guidance

#### 2.4 Credit Score Integration

- **Stack**: iSoftpull (standalone, $1-5/pull) or Plaid LendScore (if using Plaid)
- **FCRA compliance**: Mandatory — adverse action notices, consent flows, dispute procedures

#### 2.5 Sync Health Dashboard (from Updated Plan)

- **Why**: Monarch just shipped connection health dashboard; bank sync reliability is #1 churn driver
- **New**: Per-institution status, retry controls, "what changed" log

### Phase 3: Family & Collaboration

#### 3.1 Family Groups with Selective Sharing

- **Mine/Yours/Ours** as first-class workflow (Monarch just shipped basic version)
- **Roles**: Owner, Admin, Member, Viewer, Child
- **Granular permissions**: Share by account, category, time range
- **Audit trail + rollback**: See who changed what, undo safely

#### 3.2 Approval Workflows

- **Spending thresholds** with approve/deny/ask-later
- **Lightweight**: Must not feel like corporate expense management

#### 3.3 Financial Wellness Score

- **Composite 0-100**: Emergency fund, debt-to-income, savings rate, budget adherence, net worth trend
- **Competitive**: Tendi.ai has Financial Health Index — we already have `health-score.ts` (666 LOC) to port

#### 3.4 Savings Challenges

- No-spend weekend, 52-week challenge, round-up savings
- Family leaderboard, streaks, celebrations

### Phase 4: Superior AI

#### 4.1 AI Money Coach (Claude API)

- **Reuse**: Port `src/contexts/ChatbotContext.tsx` (13KB), existing `@anthropic-ai/sdk` integration
- **Privacy-first**: Local data analysis, anonymized context to Claude API
- **Competitive urgency**: Mine/MoneyGPT, Tendi.ai, ElektraFi all shipping AI agents

#### 4.2 Behavioral Nudge Engine

- **Port**: `src/lib/analytics/weekly-insights.ts` (706 LOC), `overspending-detector.ts` (159 LOC)
- **New**: Context-aware timing, engagement-optimized delivery

#### 4.3 Margin Finder + Decision Mode

- **Decision Mode** (from Updated Plan): "If I buy this today, what breaks?"
- **Confidence bands**: Best/worst/expected based on income variability, seasonal categories
- **Margin Finder**: Scans for savings opportunities (EveryDollar reports $3,015 avg found)

#### 4.4 Federated Learning (Opt-In)

- **Port**: `src/lib/collective-learning-service.ts` (553 LOC) as foundation
- **New**: Differential privacy, model aggregation, gradient noise

### Phase 5: Wealth Tracking

#### 5.1 Investment Portfolio Tracking

- **Stack**: Plaid Investments (primary) or SimpleFIN investment feeds
- **Features**: TWR/IRR calculations, asset allocation, rebalancing suggestions, dividend tracking

#### 5.2 Net Worth Dashboard

- **Aggregate**: Bank accounts, investments, real estate, crypto minus liabilities
- **Historical**: Monthly snapshots, milestones, year-over-year comparison

#### 5.3 Cash Flow Projection

- **Port**: `src/lib/analytics/trend-forecasting.ts` (227 LOC) as foundation
- **New**: 12-month forward projection, what-if scenarios, confidence bands
- **Competitive**: Simplifi's standout feature — we add E2E encryption

#### 5.4 Crypto & Real Estate Tracking

- Crypto: Exchange APIs (Coinbase, Binance, Kraken) + wallet monitoring + cost basis
- Real estate: Zillow/Redfin API (US) + manual entry, equity calculation

### Phase 6: Open Platform

#### 6.1 Public API (REST v2)

- Bearer token auth with scopes
- Accounts, Transactions, Budgets, Categories, Reports, Webhooks

#### 6.2 Data Portability

- **Export**: JSON, CSV, YNAB format, PDF reports
- **Import**: YNAB (port existing 4,782 LOC wizard), Mint, Quicken QIF
- **"Leave-any-time promise"**: Scheduled encrypted backups

#### 6.3 Open Banking Compliance

- **Section 1033**: Monitor — currently on hold, build API to be ready when it lands
- **PSD3**: Target compliance by H2 2027 (aligned with EU timeline)
- **Consumer consent dashboard**: View, revoke, manage data sharing permissions

### Phase 7: Tax & Financial Tools

- Tax categorization + deduction finder + quarterly tracker
- HSA/FSA tracking with contribution limits and deadlines
- BNPL detection and tracking as liabilities
- Bill negotiation service (partner or concierge team)

### Phase 8: Polish & Launch

- Push notifications (service worker)
- Mobile optimization (React Native wrapper for app store presence)
- Behavioral onboarding (methodology quiz, progressive disclosure, daily tips)
- Swipe-to-review (Tinder-style transaction inbox from UI/UX plan)
- Wearable widgets (Apple Watch / Wear OS)

### Phase 9: Growth & Community

- Anonymous social benchmarking (opt-in, anonymized, minimum cohort size)
- Financial education micro-lessons (contextual, behavior-triggered)
- Voice commands (Web Speech API, "Add $45 groceries")
- Self-hosted Docker deployment

---

## Recommended Phase Adjustments (Based on Research)

### Elevate to Phase 1 (Market urgency)

1. **Safe-to-Spend**: Multiple competitors have it, high daily engagement metric
2. **Multi-Currency**: Lunch Money is only real competitor here; our 114 locales make this a natural pairing
3. **Passkeys**: Regulatory deadlines in 2026 (UAE, India, Philippines), 87% industry planning adoption

### Add New Items

1. **Sync Health Dashboard** (Phase 2) — Monarch shipped it, #1 churn driver for bank sync
2. **Decision Mode** (Phase 4/5) — "If I buy this, what breaks?" — no competitor has this
3. **Connection Health** per institution (Phase 2) — transparency builds trust
4. **Receipt scanning** (Phase 2) — Monarch just added, we have OCR foundation to port

### Defer / De-risk

1. **Section 1033 compliance** — court injunction means no urgency; build API-ready but don't block on it
2. **PSD3 compliance** — H2 2027 earliest; plan during Phase 6 development
3. **Bill negotiation service** — requires partnerships/team, not pure tech; start with detection only
4. **Crypto tracking** — nice-to-have, not a differentiator; Lunch Money already has it

---

## Verification Plan

### Testing Strategy

1. **E2E Encryption**: Verify server cannot decrypt data (write test that attempts server-side decryption — must fail)
2. **Sync**: Multi-device conflict resolution tests with vector clock edge cases
3. **Offline**: Full functionality tests with network disabled
4. **Family**: Permission enforcement across all API endpoints (positive and negative tests)
5. **API**: Rate limiting, auth, payload validation, scope enforcement
6. **Migration**: Compare feature parity between old Next.js app and new Vite app per phase

### Performance Benchmarks

- Sync latency < 2 seconds
- Vite dev server cold start < 500ms
- Production bundle size < 500KB initial load
- Handle 100k+ transactions per account (virtual scrolling)
- Offline-to-online transition seamless

### Security

- Third-party audit of encryption implementation before launch
- Penetration testing before public beta
- Publish threat model and security documentation (differentiator)
- Bug bounty program post-launch

### Browser & Device Testing

- Playwright visual regression tests (port existing test infrastructure)
- Cross-browser: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome Android
- Screen readers: NVDA, VoiceOver
- RTL layout verification for Arabic, Hebrew, Farsi, Urdu

---

## Critical Files to Port (Priority Order)

| File                                            | LOC       | Port Complexity                   | Phase |
| ----------------------------------------------- | --------- | --------------------------------- | ----- |
| `src/lib/budget-db.ts`                          | 2,293     | Low (Dexie.js, no framework deps) | 0     |
| `src/types/budget.ts`                           | 658       | Low (pure types)                  | 0     |
| `src/lib/encryption/budget-encryption.ts`       | 514       | Low (Web Crypto API)              | 1     |
| `src/lib/encryption/encrypted-db-wrapper.ts`    | 134       | Low                               | 1     |
| `src/lib/sync/sync-engine.ts`                   | 794       | Medium (WebRTC)                   | 1     |
| `src/lib/sync/offline-manager.ts`               | 540       | Low                               | 1     |
| `src/lib/simplefin/client.ts`                   | 502       | Low                               | 2     |
| `src/lib/simplefin/sync.ts`                     | 524       | Low                               | 2     |
| `src/lib/analytics/recurring-detector.ts`       | 209       | Low                               | 2     |
| `src/lib/analytics/health-score.ts`             | 666       | Low                               | 3     |
| `src/lib/ai/` (all 17 modules)                  | 9,186     | Low-Medium                        | 4     |
| `src/lib/analytics/lstm-predictive-spending.ts` | 478       | Medium (TF.js)                    | 4     |
| `src/lib/analytics/trend-forecasting.ts`        | 227       | Low                               | 5     |
| `src/lib/parsers/csv-parser.ts`                 | 2,753     | Low                               | 2     |
| `src/lib/parsers/pdf-ocr-parser.ts`             | 709       | Low                               | 2     |
| `src/contexts/ChatbotContext.tsx`               | ~13KB     | Medium (React context)            | 4     |
| `src/i18n/messages/`                            | 114 files | Low (JSON, no deps)               | 0     |

---

## Sources

### Competitor Research

- [YNAB Pricing](https://www.ynab.com/pricing)
- [YNAB What's New](https://www.ynab.com/whats-new)
- [Monarch Money Pricing](https://www.monarch.com/pricing)
- [Monarch What's New](https://www.monarch.com/whats-new)
- [Copilot Money Review 2026 - Money with Katie](https://moneywithkatie.com/copilot-review-a-budgeting-app-that-finally-gets-it-right/)
- [Copilot Money Pricing](https://copilot.money/pricing/)
- [Rocket Money Features](https://www.rocketmoney.com/)
- [Simplifi Winter 2026 Updates](https://www.quicken.com/blog/quicken-simplifi-winter-2026-updates/)
- [Actual Budget 2026 Roadmap](https://actualbudget.org/blog/roadmap-for-2026/)
- [Lunch Money Features](https://lunchmoney.app/features)
- [Lunch Money Pricing](https://lunchmoney.app/pricing)

### Market & Sentiment

- [Best Budget Apps 2026 - NerdWallet](https://www.nerdwallet.com/finance/learn/best-budget-apps)
- [Best Budgeting Apps 2026 - Engadget](https://www.engadget.com/apps/best-budgeting-apps-120036303.html)
- [YNAB Alternatives - Rob Berger](https://robberger.com/ynab-alternatives/)
- [Budget App Privacy Research - Incogni](https://blog.incogni.com/budgeting-apps-research/)
- [Mine Raises $14M for AI Finance Agent - PYMNTS](https://www.pymnts.com/news/investment-tracker/2026/mine-raises-14-million-and-launches-ai-personal-finance-agent/)

### Regulatory & Technology

- [CFPB Section 1033 Status - Consumer Finance Law Monitor](https://www.consumerfinancialserviceslawmonitor.com/2025/07/cfpb-section-1033-open-banking-rule-stayed-as-cfpb-initiates-new-rulemaking/)
- [PSD3 Political Agreement - European Parliament](https://www.europarl.europa.eu/news/en/press-room/20251121IPR31540/payment-services-deal-more-protection-from-online-fraud-and-hidden-fees)
- [Passkey Adoption 2026 - Techpression](https://techpression.com/ditching-the-password-everything-you-need-to-know-about-passkeys-in-2026/)
- [FIDO2 Quantum-Safe - Wultra](https://www.wultra.com/blog/passkeys-and-fido2-quietly-became-quantum-safe-heres-what-changed)
- [Personal Finance App Market Size - Business Research Insights](https://www.businessresearchinsights.com/market-reports/personal-finance-app-market-117811)

### Stack Migration

- [Mantine + Vite Guide](https://mantine.dev/guides/vite/)
- [Best React UI Libraries 2026 - Builder.io](https://www.builder.io/blog/react-component-libraries-2026)
