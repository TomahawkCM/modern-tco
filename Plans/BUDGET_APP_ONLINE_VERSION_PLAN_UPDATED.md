# Budget App Online Version Plan (Updated with Competitive Research)

> **SUPERSEDED**: This document has been merged into `Plans/BUDGET_APP_AUTHORITATIVE_PLAN.md` (2026-02-05). The 8 research epics from this document are now integrated into the appropriate phases of the authoritative plan. Kept for historical reference.

**Last updated:** 2026-02-05

This document **preserves the original plan** and adds a research-backed set of improvements that target the biggest gaps users report across major budgeting competitors (bank sync reliability, household sharing, multi-currency, forward cash-flow, subscriptions, portability, accessibility, and security transparency).

---

## New Findings: Where Competitors Still Fall Short (and How We Win)

### 1) Reliability: Bank Sync Is Still the #1 Churn Driver
**Observed market gap**
- Users frequently quit budgeting apps due to delayed/missing transactions and opaque “sync broke” situations.

**Improvements to add**
- **Sync Health Dashboard** (per institution): last successful pull, current status, known outages, retry controls, and a “what changed” log.
- **Manual-first fallback that doesn’t feel like a downgrade**: instant CSV import, drag‑drop, receipt capture, and quick-entry flows.
- **Reconciliation Autopilot**: guided fixes for mismatched balances (pending vs posted, duplicates, transfer pairing, splits, and hidden fees).

**Why this matters**
- Even the best UX loses if the data is flaky. Reliability + transparency becomes a moat.

---

### 2) True Couples & Family Budgeting (Not “Share My Login”)
**Observed market gap**
- Many apps treat “partner sharing” as full access, which doesn’t work for real households with privacy boundaries.

**Improvements to add**
- **Selective sharing model**: share accounts/categories/budgets/time ranges with role-based access (view/edit/approve).
- **Mine / Yours / Ours** default views: practical household workflows from day one.
- **Audit trail + rollback**: see who changed what and undo mistakes safely.
- **Approvals that feel lightweight**: thresholds + “approve/deny/ask later” with notes/receipts.

---

### 3) Global-First Multi‑Currency Done Properly
**Observed market gap**
- Multi-currency remains poorly supported in mainstream budgeting apps; many users resort to separate budgets or hacks.

**Improvements to add**
- **Single-budget multi-currency** with:
  - transaction currency + settlement currency + stored historical FX rate
  - base-currency rollups for net worth and reports
  - “travel mode” display currency switching
- **FX transparency** everywhere: show rate source/date in tooltips and reconciliation.

---

### 4) Forward Cash‑Flow That’s Actually Useful (Your Daily “Decision Screen”)
**Observed market gap**
- Competitors often excel at “what happened” but underdeliver on “what will happen” and “what if I do this?”

**Improvements to add**
- **Safe‑to‑Spend** + **Bills Due** + **Projected Balance** on one screen.
- **Confidence bands** (best/worst/expected) and clear explanations (income variability, seasonal categories).
- **Decision mode**: “If I buy this today, what breaks?” with instant answers.

---

### 5) Subscription Killer Mode (Money Saved is the Hook)
**Observed market gap**
- Subscription tracking exists, but *actionability* is weak: people want cancel guidance, price increase alerts, and annualized impact.

**Improvements to add**
- **Recurring detection + overlap detection** with “annualized cost shock”
- **Price increase alerts** and “unused subscription” nudges (when signals exist)
- **Cancellation guidance**: merchant-specific steps, tracked status, and evidence vault

---

### 6) Radical Portability (Users Don’t Want Another Mint Situation)
**Observed market gap**
- Users are increasingly sensitive to vendor lock-in and data loss. Exports/imports are often incomplete.

**Improvements to add**
- **Leave-any-time promise**: perfect CSV/JSON exports + scheduled encrypted backups.
- **Importers** for major apps (structured mapping + category normalization).
- **Automations gallery**: webhooks/API recipes (alerts, approvals, logging to sheets, etc.).

---

### 7) Accessibility & “Senior‑Grade” Usability (Underserved Segment)
**Observed market gap**
- Most budget apps are built for finance enthusiasts, not beginners/seniors.

**Improvements to add**
- **Accessibility Mode**: large text, high contrast, simplified navigation, bigger tap targets.
- **Plain-language labels** and an optional “guided monthly close” wizard (review → categorize → confirm → done).
- **Voice entry** (“Add $45 groceries”) and strong undo/rollback patterns.

---

### 8) Security as a Product (Not a Checkbox)
You already aim for zero‑knowledge E2E. To make it world-class, add:
- **Public security model + threat model**
- **Independent audit** (publish summary)
- **Encrypted attachments vault** (receipts, PDFs, warranties)
- **Passkeys by default** with user-friendly recovery

---

## “Best in the World” North Star (Short List)

If you prioritize only the highest-leverage improvements, focus on:

1. **Trust**: zero‑knowledge E2E + exports + backups + sync transparency  
2. **Daily clarity**: Safe‑to‑Spend + Bills + Projected cashflow in one place  
3. **Household-first**: real Mine/Yours/Ours with selective sharing + approvals  
4. **Global-first**: real multi‑currency in a single budget  
5. **Money saved**: subscription killer + quantified savings  
6. **Accessibility**: senior-grade mode + guided monthly close + voice

---

## How to Integrate These Findings Into Your Existing Plan

### Add/upgrade these epics (recommended)
- **EPIC: Data Reliability & Reconciliation**
  - Sync health + retry + outage comms
  - Reconciliation Autopilot
  - Offline/manual import excellence

- **EPIC: Household & Permissions**
  - Selective sharing (accounts/categories/time ranges)
  - Mine/Yours/Ours
  - Audit trail + rollback
  - Approval workflows

- **EPIC: Global Multi-Currency**
  - Currency model + historical FX storage
  - Rollups + reporting + travel mode

- **EPIC: Cashflow & Decision Mode**
  - Single daily dashboard
  - What-if simulator + confidence bands

- **EPIC: Subscriptions & Savings**
  - Recurring detection + annualized impact
  - Price change alerts
  - Cancel guidance + evidence vault

- **EPIC: Accessibility**
  - Accessibility mode
  - Guided monthly close
  - Voice entry

- **EPIC: Security Transparency**
  - Threat model + audit path
  - Passkeys + recovery
  - Encrypted attachments vault

## Phase-by-Phase Upgrade Notes (Quick Mapping)

This mapping is designed to fit your existing phases without rewriting everything:

### Phase 1: Foundations
- Add **Data Reliability & Reconciliation** acceptance criteria early (sync health logging, retries, and manual fallback).
- Ensure schema supports **multi-currency** (even if UI ships later).

### Phase 2: Collaboration & Permissions
- Prioritize **Mine/Yours/Ours** and **selective sharing** as a first-class workflow.
- Add **audit trail + rollback** as non-negotiable.

### Phase 3: Intelligence & Automation
- Implement **Decision Mode** + confidence bands.
- Expand subscription intelligence to include annualized impact and price changes.
- Publish an **Automations gallery** to show off webhooks/API value.

### Phase 4: Trust & Polish
- Ship **Accessibility Mode** and guided monthly close as a flagship differentiator.
- Publish security model and plan for third‑party audit.

---

# Original Plan (Unmodified)

# Budget App Online Version: World-Class Implementation Plan

## Vision Statement

Transform the privacy-first offline budget app into **the ProtonMail of personal finance** - a cloud-enabled platform with true E2E encryption where even we cannot read user data, combined with best-in-class family collaboration and AI features.

---

## What Makes This BETTER Than YNAB/Mint/Monarch

| Differentiator | Competitors | Our Online Version |
|----------------|-------------|-------------------|
| **Data Privacy** | Cloud-stored, company can read | E2E encrypted, zero-knowledge |
| **Offline Mode** | View-only or none | Full functionality |
| **Family Roles** | All-or-nothing access | Granular permissions per account |
| **Open Data** | Limited export | Full API, webhooks, any format |
| **AI Privacy** | Data mined for training | Local-first ML, opt-in only |
| **Self-Hosting** | SaaS only | Optional Docker deployment |
| **Net Worth Tracking** | Fragmented across apps (Empower for investments, YNAB for budgets) | Unified E2E encrypted dashboard — accounts, investments, real estate, crypto in one view |
| **Investment + Budget** | Empower does investments, YNAB does budgets — pick one | Both in one app with encrypted data and holistic financial picture |
| **Subscription Killer** | Rocket Money detects subscriptions but stores data in their cloud | Privacy-first subscription detection, overlap alerts, and cancellation — data never leaves your device |
| **Cash Flow Projection** | Simplifi's unique feature, cloud-only | 12-month projection with what-if scenarios, E2E encrypted |
| **Passkey Auth** | Most use passwords or basic 2FA | FIDO2/WebAuthn passkeys + zero-knowledge encryption — modern auth meets true privacy |
| **Multiple Methodologies** | YNAB = zero-based only, EveryDollar = envelope only | Zero-based, envelope, 50/30/20, pay-yourself-first — all in one app, switch anytime |
| **True Multi-Currency** | YNAB can't do multi-currency natively; Monarch limited | 160+ currencies with travel mode, historical exchange rates, crypto stablecoins |
| **113 Languages** | Most competitors support <10 languages | Full RTL support, locale-specific formatting, 113 locales from day one |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Devices                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Browser   │  │   Mobile    │  │   Desktop   │         │
│  │  (PWA/Web)  │  │  (PWA/App)  │  │   (Electron)│         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          ▼                                  │
│         ┌────────────────────────────────────┐             │
│         │     Local Layer (Privacy Core)      │             │
│         │  ┌─────────────────────────────┐   │             │
│         │  │ IndexedDB (Dexie.js)        │   │             │
│         │  │ - All financial data        │   │             │
│         │  │ - AES-256 encrypted         │   │             │
│         │  │ - Works 100% offline        │   │             │
│         │  └─────────────────────────────┘   │             │
│         │  ┌─────────────────────────────┐   │             │
│         │  │ TensorFlow.js (Local ML)    │   │             │
│         │  │ - Categorization            │   │             │
│         │  │ - Predictions               │   │             │
│         │  │ - Anomaly detection         │   │             │
│         │  └─────────────────────────────┘   │             │
│         └────────────────┬───────────────────┘             │
└──────────────────────────┼──────────────────────────────────┘
                           │ E2E Encrypted Sync
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloud Layer (Supabase)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  encrypted_budget_data (BLOBS - we can't read)      │   │
│  │  - Server only sees: entity_type, vector_clock      │   │
│  │  - All financial data = encrypted payload           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Metadata Tables (NOT encrypted)                     │   │
│  │  - cloud_users, user_devices, family_groups         │   │
│  │  - subscriptions, bank_connections, webhooks        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Supabase Realtime                                   │   │
│  │  - Push sync notifications                          │   │
│  │  - Multi-device coordination                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation (Weeks 1-8) - MVP

### 1.1 E2E Encryption Architecture

**Extend**: `src/lib/encryption/budget-encryption.ts`

**New Files**:
- `src/lib/auth/cloud-auth.ts` - Supabase Auth wrapper
- `src/lib/auth/key-derivation.ts` - Password → Master Key → Device Keys
- `src/lib/auth/recovery-key.ts` - 24-word recovery phrase generation
- `src/lib/encryption/cloud-encryption.ts` - Cloud-specific E2E

**Key Derivation Flow**:
```
User Password ──PBKDF2──▶ Master Key (never leaves device)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Device Key A         Device Key B
              (Browser)            (Mobile)
```

**Recovery**: 24-word mnemonic phrase (like crypto wallets)

### 1.2 Cloud Database Schema

**Supabase Tables**:

```sql
-- User accounts (minimal, not financial data)
cloud_users (id, email, display_name, subscription_tier, locale, timezone)

-- Device registration for E2E key exchange
user_devices (id, user_id, device_name, public_key, trusted, last_active_at)

-- ALL financial data stored as encrypted blobs
encrypted_budget_data (
  id, user_id, device_id,
  encrypted_payload,      -- AES-GCM encrypted
  encryption_iv,
  entity_type,            -- 'transaction', 'account', etc.
  entity_id,              -- Local IndexedDB ID
  vector_clock,           -- For conflict resolution
  server_updated_at
)

-- Sync coordination
sync_state (user_id, device_id, last_sync_at, vector_clock)
```

### 1.3 Cloud Sync Engine

**Reuse**: `src/lib/sync/sync-engine.ts` (vector clocks, conflict resolution)

**New Files**:
- `src/lib/sync/cloud-sync-engine.ts` - Orchestration
- `src/lib/sync/cloud-transport.ts` - Supabase Realtime transport
- `src/lib/sync/encrypted-payload.ts` - Encrypt before cloud, decrypt after

**Sync Flow**:
1. Local change → Encrypt → Queue
2. Online → Push encrypted blobs to Supabase
3. Supabase Realtime → Notify other devices
4. Other devices → Pull → Decrypt → Merge with local

### 1.4 Subscription & Billing

**Stripe Integration**:
- `src/lib/stripe/subscription-manager.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/components/budget/pricing/PricingPage.tsx`

**Tiers**: See [Updated Tier Table](#pricing-tiers) below.

### 1.5 Passkey Authentication

**FIDO2/WebAuthn passkeys as primary auth method** alongside existing password + biometric.

**New Files**:
- `src/lib/auth/passkey-auth.ts` - WebAuthn registration & authentication
- `src/lib/auth/passkey-recovery.ts` - Recovery code generation & verification
- `src/app/api/auth/passkey/register/route.ts` - Registration endpoint
- `src/app/api/auth/passkey/authenticate/route.ts` - Authentication endpoint
- `src/components/budget/auth/PasskeySetup.tsx` - UI for passkey enrollment

**Features**:
- FIDO2/WebAuthn passkey creation and login
- Hardware security key support (YubiKey, Titan) as optional backup
- Cross-device passkey via QR code + Bluetooth proximity (CTAP 2.2 hybrid transport)
- Recovery codes for app access (separate from 24-word mnemonic for E2E data decryption)
- Phased migration: opt-in → encourage → default for new users → deprecate passwords

### 1.6 Safe-to-Spend Engine

**Core Calculation**:
```
(Available Balance) - (Upcoming Bills) - (Savings Goals) - (Reserved for Budgets) = Safe to Spend
```

**New Files**:
- `src/lib/budget/safe-to-spend.ts` - Core calculation engine
- `src/components/budget/dashboard/SafeToSpendWidget.tsx` - Prominent dashboard widget

**Features**:
- Real-time recalculation on every transaction
- Includes pending transactions from bank sync
- Configurable look-ahead period (7/14/30 days)
- Color-coded status: green (comfortable), yellow (tight), red (over budget)
- Drill-down to see what's reserved and why

### 1.7 Budget Methodology Selector

**Support multiple budgeting approaches in one app**:

**New Files**:
- `src/lib/budget/methodology-engine.ts` - Core methodology logic
- `src/components/budget/onboarding/MethodologyQuiz.tsx` - Onboarding selection
- `src/components/budget/settings/MethodologySwitcher.tsx` - Switch anytime

**Methodologies**:
- **Zero-based** (YNAB-style): Every dollar gets a job
- **Envelope** (Goodbudget-style): Allocate to virtual envelopes
- **50/30/20 rule**: Needs / Wants / Savings split
- **Pay-yourself-first**: Set savings target, spend the rest freely

**Behavior**:
- User selects during onboarding; can switch anytime
- Dashboard, reports, and recommendations adapt to chosen methodology
- Historical data preserved when switching methods

### 1.8 Multi-Currency Engine

**New Files**:
- `src/lib/currency/exchange-rate-service.ts` - Rate fetching & caching
- `src/lib/currency/multi-currency-engine.ts` - Conversion & storage logic
- `src/lib/currency/travel-mode.ts` - Temporary base currency override
- `src/components/budget/settings/CurrencySettings.tsx` - Currency configuration

**Features**:
- Base currency for storage/calculation + display currency toggle
- Store both transaction-date and settlement-date exchange rates for historical accuracy
- Real-time rates via Exchange Rates API or Fixer.io (updated every 60 seconds)
- Support 160+ currencies including crypto stablecoins (USDC, USDT)
- Net worth rolls up to base currency with transparent conversion
- Hover/tooltip shows exact rate applied per transaction
- Travel mode: temporarily switch primary display currency when abroad
- Exchange gain/loss tracking (realized on settlement, unrealized on revaluation)

### 1.9 Multi-Language & Localization

**Carry forward existing 113 locale support from offline app**.

**Features**:
- Full RTL support for Arabic, Hebrew, Farsi, Urdu (CSS `direction: rtl` + auto-layout mirroring)
- Locale-specific: date formats, number separators, currency symbol placement
- Web fonts with RTL character support (Noto Sans)
- User can override locale defaults (e.g., Western vs Eastern Arabic numerals)
- All new online features must be i18n-ready from day one

**Existing Infrastructure**:
- `src/i18n/messages/` — 113 locale files already implemented
- RTL detection and layout system already in place

---

## Phase 2: Bank Sync (Weeks 9-12)

### 2.1 Complete SimpleFIN

**Existing Files to Complete**:
- `src/lib/simplefin/client.ts` - API client (80% done)
- `src/lib/simplefin/sync.ts` - Transaction sync

**New Files**:
- `src/lib/simplefin/account-matcher.ts`
- `src/lib/simplefin/ui/ConnectionWizard.tsx`
- `src/app/budget-app/connections/page.tsx`

### 2.2 Plaid Integration (Premium)

**New Files**:
- `src/lib/plaid/client.ts`
- `src/lib/plaid/link-handler.ts`
- `src/app/api/plaid/link/route.ts`
- `src/app/api/plaid/webhook/route.ts`

**Database**:
```sql
bank_connections (
  id, user_id, provider,
  encrypted_credentials,  -- E2E encrypted access tokens
  institution_name, status, last_sync_at
)
```

### 2.3 Subscription Detection & Cancellation

**New Files**:
- `src/lib/subscriptions/subscription-detector.ts` - Recurring charge scanner
- `src/lib/subscriptions/overlap-detector.ts` - Duplicate service detection
- `src/lib/subscriptions/cancellation-guide.ts` - Cancellation flow engine
- `src/components/budget/subscriptions/SubscriptionManager.tsx` - Management UI
- `src/components/budget/subscriptions/PriceAlertBanner.tsx` - Price increase alerts

**Features**:
- Scan transaction history for recurring charges (weekly, monthly, annual patterns)
- Flag hidden/forgotten subscriptions with last-use detection
- Overlap detection ("you pay for Spotify AND Apple Music")
- One-click cancellation flow (via API where available, or guided step-by-step instructions)
- Price increase alerts when a subscription charges more than previous period
- Annual cost summary: "You spend $X/year on subscriptions"

### 2.4 Credit Score Integration

**New Files**:
- `src/lib/credit/credit-score-service.ts` - Bureau API integration
- `src/components/budget/credit/CreditScoreDashboard.tsx` - Score display & trends
- `src/components/budget/credit/ScoreFactors.tsx` - Factors breakdown

**Features**:
- Free credit score via TransUnion/Equifax API
- Score trend history with monthly tracking
- Factors affecting score (utilization, payment history, age of accounts, etc.)
- Alerts on significant score changes (+/- 20 points)
- FCRA compliance: adverse action notices, consent flows, dispute procedures

---

## Phase 3: Family & Collaboration (Weeks 13-16)

### 3.1 Family Groups

**Database**:
```sql
family_groups (id, name, owner_id, invite_code)

family_members (
  id, family_id, user_id, role,
  permissions,              -- JSON: ['view_all', 'edit_own', ...]
  can_see_all_accounts,
  visible_accounts,         -- UUID array
  spending_limit
)

shared_budgets (budget_entity_id, family_id, shared_by)
```

**Roles**:
- **Owner**: Full control, billing, can delete group
- **Admin**: Manage members, see all, edit all
- **Member**: See shared, edit own transactions
- **Viewer**: Read-only access to shared items
- **Child**: Limited view, spending limits, approval workflow

### 3.2 Couple-Specific Features

**Components**:
- `src/components/budget/family/JointAccountView.tsx`
- `src/components/budget/family/SplitBillTracker.tsx`
- `src/components/budget/family/SpendingApprovalWorkflow.tsx`
- `src/components/budget/family/ActivityFeed.tsx`

**Features**:
- Joint vs Individual account views
- "Who owes whom" tracking
- Approval workflow for purchases over threshold
- Shared budget goals with contribution tracking

### 3.3 Financial Wellness Score

**New Files**:
- `src/lib/wellness/financial-wellness-score.ts` - Composite score engine
- `src/components/budget/wellness/WellnessScoreDashboard.tsx` - Score display
- `src/components/budget/wellness/ImprovementTips.tsx` - Personalized tips

**Composite Score (0-100)** based on:
- Emergency fund coverage (3-6 months expenses)
- Debt-to-income ratio
- Savings rate (% of income saved)
- Budget adherence (staying within limits)
- Net worth trend (growing vs declining)
- Retirement readiness (on track for goals)

**Features**:
- Historical tracking with monthly snapshots
- Personalized improvement tips based on weakest factors
- Family members can opt to share scores with household
- Milestone celebrations when score improves

### 3.4 Savings Challenges

**New Files**:
- `src/lib/challenges/savings-challenge-engine.ts` - Challenge logic
- `src/components/budget/challenges/ChallengeCard.tsx` - Challenge UI
- `src/components/budget/challenges/Leaderboard.tsx` - Family leaderboard

**Challenge Types**:
- "No-spend weekend" — track zero discretionary spending
- "52-week challenge" — save incrementally each week ($1, $2, $3...)
- "Round-up savings" — round every purchase to nearest dollar, save difference
- Custom household challenges with configurable rules

**Features**:
- Progress leaderboard for family members
- Celebration animations on milestones
- Challenge history and streak tracking
- Opt-in competitive or collaborative modes

---

## Phase 4: Superior AI (Weeks 17-20)

### 4.1 Enhanced Local ML

**Extend**: `src/lib/analytics/lstm-predictive-spending.ts`

**New Capabilities**:
- Improved categorization accuracy (target: 95%+)
- Bill negotiation suggestions
- Subscription overlap detection
- Savings opportunity finder
- Smart goal recommendations

### 4.2 Federated Learning (Opt-In)

**Architecture**:
```
User Device                          Cloud
    │                                  │
    │  Local model training            │
    │  on user's data                  │
    │           │                      │
    │           ▼                      │
    │  Add differential privacy        │
    │  (noise to gradients)            │
    │           │                      │
    │           └──────────────────────▶  Aggregate anonymous
    │                                     model improvements
    │           ◀──────────────────────┤
    │  Receive improved model          │
    │  (no raw data shared)            │
    │                                  │
```

**Files**:
- `src/lib/ai/federated-learning.ts`
- `src/lib/ai/differential-privacy.ts`
- `src/components/budget/settings/AIPrivacySettings.tsx`

### 4.3 AI Money Coach

**New Files**:
- `src/lib/ai/money-coach.ts` - Conversational advisor engine
- `src/components/budget/ai/MoneyCoachChat.tsx` - Chat UI
- `src/app/api/ai/coach/route.ts` - Coach API endpoint

**Built on existing chatbot infrastructure** (`src/contexts/ChatbotContext.tsx`).

**Answers questions like**:
- "Can I afford this $500 purchase?"
- "Should I pay down debt or invest?"
- "How do I save $10,000 by December?"
- "What's the best way to reduce my grocery spending?"

**Privacy-first**: Runs analysis on local data, sends only anonymized context to Claude API (already integrated via `@anthropic-ai/sdk`). No raw transaction data leaves the device.

### 4.4 Behavioral Nudge Engine

**New Files**:
- `src/lib/notifications/nudge-engine.ts` - Context-aware notification logic
- `src/lib/notifications/nudge-timing.ts` - Engagement-optimized timing
- `src/components/budget/nudges/NudgeBanner.tsx` - In-app nudge display

**Context-aware smart notifications**:
- "You've used 80% of your dining budget with 12 days left"
- "Your electric bill was 40% higher than usual — want to investigate?"
- "You saved $200 more this month — streak: 3 months!"
- "Payday is tomorrow — ready to allocate your budget?"
- "You haven't reviewed transactions in 5 days — 12 pending"

**Timing**: Optimized based on user engagement patterns (when they typically open the app, response rates to past nudges).

### 4.5 Margin Finder

**New Files**:
- `src/lib/ai/margin-finder.ts` - Savings opportunity scanner
- `src/components/budget/ai/MarginFinderReport.tsx` - Results display

**Features**:
- Scans transaction history for one-time and recurring savings opportunities
- Identifies: unused subscriptions, better-rate alternatives, spending pattern improvements
- Quantified savings estimates per recommendation
- EveryDollar reports users find an average of $3,015 in breathing room using similar analysis
- Monthly "money found" report with actionable recommendations

---

## Phase 5: Wealth Tracking (Weeks 21-24)

### 5.1 Investment Portfolio Tracking

**New Files**:
- `src/lib/investments/portfolio-tracker.ts` - Portfolio aggregation engine
- `src/lib/investments/performance-calculator.ts` - TWR, IRR calculations
- `src/components/budget/investments/PortfolioDashboard.tsx` - Portfolio view
- `src/components/budget/investments/AssetAllocation.tsx` - Allocation visualization
- `src/components/budget/investments/DividendTracker.tsx` - Dividend/distribution tracking

**Features**:
- Broker integrations (Fidelity, Schwab, Vanguard, E*TRADE via Plaid/SimpleFIN investment feeds)
- Portfolio performance metrics (Time-Weighted Return, Internal Rate of Return)
- Asset allocation visualization with target vs actual
- Rebalancing suggestions based on target allocation
- Dividend/distribution tracking with reinvestment detection

### 5.2 Net Worth Dashboard

**New Files**:
- `src/lib/net-worth/net-worth-calculator.ts` - Aggregation engine
- `src/components/budget/net-worth/NetWorthDashboard.tsx` - Main dashboard
- `src/components/budget/net-worth/MilestoneTracker.tsx` - Milestone celebrations

**Features**:
- Aggregate all asset types: bank accounts, investments, real estate, crypto
- Subtract all liabilities: loans, credit cards, BNPL obligations
- Historical trend chart (monthly snapshots)
- Milestone celebrations ("You crossed $100K net worth!")
- Breakdown by asset class with drill-down
- Year-over-year comparison

### 5.3 Cash Flow Projection

**New Files**:
- `src/lib/projections/cash-flow-projector.ts` - Projection engine
- `src/lib/projections/what-if-scenario.ts` - Scenario modeling
- `src/components/budget/projections/CashFlowChart.tsx` - Projection visualization
- `src/components/budget/projections/WhatIfPanel.tsx` - Scenario builder

**Features**:
- 12-month forward projection based on:
  - Recurring income
  - Recurring bills
  - Subscription costs
  - Average discretionary spending
  - Seasonal patterns (holiday spending, tax season, etc.)
- "What-if" scenarios: "If I cancel these subscriptions..." / "If I get a $5K raise..." / "If I pay off this loan..."
- Confidence bands showing best/worst/expected case

### 5.4 Crypto & Digital Asset Tracking

**New Files**:
- `src/lib/crypto/crypto-tracker.ts` - Exchange & wallet integration
- `src/lib/crypto/cost-basis.ts` - Tax lot tracking
- `src/components/budget/crypto/CryptoPortfolio.tsx` - Crypto dashboard

**Features**:
- Exchange API integration (Coinbase, Binance, Kraken)
- Wallet address monitoring for self-custody assets
- Cost basis tracking for tax purposes (FIFO, LIFO, specific lot)
- Include in net worth calculation
- Price alerts for significant movements

### 5.5 Real Estate Tracking

**New Files**:
- `src/lib/real-estate/property-tracker.ts` - Property value engine
- `src/components/budget/real-estate/PropertyCard.tsx` - Property display

**Features**:
- Zillow/Redfin API for automated home value estimates (US properties)
- Manual entry for non-US properties or properties without API coverage
- Mortgage balance tracking with amortization schedule
- Equity calculation (estimated value - remaining mortgage)
- Include in net worth with asset class breakdown

---

## Phase 6: Open Platform (Weeks 25-27)

### 6.1 Public API

**Endpoints** (`src/app/api/v2/`):
```
Accounts:     GET/POST /accounts, GET/PUT/DELETE /accounts/:id
Transactions: GET/POST /transactions, GET/PUT/DELETE /transactions/:id
Budgets:      GET/POST /budgets, GET/PUT/DELETE /budgets/:id
Categories:   GET /categories
Reports:      GET /reports/spending, /reports/trends, /reports/health
Webhooks:     POST/DELETE /webhooks
```

**Authentication**: Bearer tokens (API keys) with scopes

### 6.2 Webhooks

**Events**:
- `transaction.created`, `transaction.updated`
- `budget.exceeded`, `budget.warning`
- `account.balance_changed`
- `bank_sync.completed`, `bank_sync.failed`

**Database**:
```sql
webhooks (id, user_id, url, secret, events[], active)
webhook_deliveries (id, webhook_id, event_type, payload, status)
```

### 6.3 Data Portability

**Export**: JSON, CSV, YNAB format, PDF reports
**Import**: YNAB, Mint, Quicken QIF, generic CSV

### 6.4 Open Banking Compliance

**New Files**:
- `src/lib/compliance/open-banking.ts` - Regulatory compliance engine
- `src/components/budget/settings/ConsentDashboard.tsx` - Consumer consent management

**Features**:
- PSD3 (EU) compliance for European open banking standards
- CFPB Section 1033 (US) compliance — standardized API access to 14,000+ institutions (effective April 2026)
- Consumer consent management dashboard: view, revoke, and manage data sharing permissions
- Standardized data format compliance for cross-platform portability

---

## Phase 7: Tax & Financial Tools (Weeks 28-30)

### 7.1 Tax Optimization

**New Files**:
- `src/lib/tax/tax-categorizer.ts` - Tax category tagging
- `src/lib/tax/estimated-tax-tracker.ts` - Quarterly tax calculator
- `src/lib/tax/deduction-finder.ts` - Missed deduction scanner
- `src/components/budget/tax/TaxSummaryReport.tsx` - Year-end report
- `src/components/budget/tax/QuarterlyTracker.tsx` - Self-employed quarterly view

**Features**:
- Tax category tagging for transactions (business expense, medical, charitable, etc.)
- Quarterly estimated tax tracker for self-employed users
- Year-end tax summary report with category totals
- Deduction finder: scans transactions for commonly missed deductions
- Export for accountant or TurboTax/H&R Block import

### 7.2 Bill Negotiation Service

**New Files**:
- `src/lib/bills/negotiation-service.ts` - Negotiation flow engine
- `src/components/budget/bills/NegotiationDashboard.tsx` - Bill management UI

**Features**:
- Partner with negotiation service or build concierge team
- Auto-detect negotiable bills (phone, cable, internet, insurance)
- Track savings achieved through negotiations
- Revenue model: percentage of savings achieved (win-win)
- History of past negotiations and results

### 7.3 HSA/FSA Tracking

**New Files**:
- `src/lib/tax/hsa-fsa-tracker.ts` - Contribution & expense tracking
- `src/components/budget/tax/HSAFSADashboard.tsx` - Account dashboard

**Features**:
- Contribution limit tracking (annual IRS limits)
- Eligible expense auto-categorization from transaction history
- FSA use-it-or-lose-it deadline reminders with countdown
- Tax advantage calculations: show tax savings from using HSA/FSA
- Carryover and grace period tracking

### 7.4 BNPL Tracking

**New Files**:
- `src/lib/debt/bnpl-tracker.ts` - BNPL detection and tracking
- `src/components/budget/debt/BNPLDashboard.tsx` - BNPL overview

**Features**:
- Auto-detect Afterpay/Klarna/Affirm installments from transaction patterns
- Track total BNPL obligations as liability (included in net worth)
- Payment schedule visualization with upcoming due dates
- Alert when a new BNPL would push debt-to-income ratio too high
- Total cost calculation (including any interest/fees)

---

## Phase 8: Polish & Launch (Weeks 31-33)

### 8.1 Push Notifications

**Files**:
- `src/lib/notifications/push-manager.ts`
- `src/lib/notifications/notification-preferences.ts`
- Enhanced service worker for push

**Notification Types**:
- Budget exceeded/warning
- Large transaction alert
- Bill due reminder
- Unusual spending detected
- Family member activity (if enabled)

### 8.2 Mobile Optimization

- React Native wrapper for App Store presence
- Deep linking for notifications
- Biometric authentication
- Widget support (iOS/Android)

### 8.3 Behavioral Onboarding

**New Files**:
- `src/components/budget/onboarding/OnboardingFlow.tsx` - Guided setup
- `src/components/budget/onboarding/DailyTip.tsx` - Daily financial tips
- `src/lib/onboarding/progressive-disclosure.ts` - Feature gating logic

**Features**:
- Budget methodology quiz during signup (feeds into 1.7 Methodology Selector)
- Guided setup tailored to chosen method with sample data
- Daily financial tips (like EveryDollar's daily lessons) — contextual to user activity
- Progressive feature disclosure: don't overwhelm new users with every feature at once
- "Getting started" checklist with celebration on completion

### 8.4 Swipe-to-Review

**New Files**:
- `src/components/budget/transactions/SwipeReview.tsx` - Swipe gesture UI
- `src/lib/gestures/swipe-handler.ts` - Touch/gesture detection

**Features**:
- Quick swipe gestures for transaction approval/categorization
- Left = flag for review, Right = approve, Up = split transaction
- Reduces daily transaction review friction to seconds
- Batch mode: rapid-fire review of pending transactions
- Keyboard shortcuts for desktop equivalent

### 8.5 Wearable Widgets

**New Files**:
- `src/lib/wearables/widget-data-provider.ts` - Widget data API
- Watch app templates for Apple Watch / Wear OS

**Features**:
- Apple Watch / Wear OS glanceable widgets
- Safe-to-spend amount at a glance
- Recent transactions list
- Budget status (over/under for top categories)
- Quick transaction entry from wrist

---

## Phase 9: Growth & Community (Weeks 34-36)

### 9.1 Social Benchmarking (Opt-In)

**New Files**:
- `src/lib/community/anonymous-benchmarking.ts` - Anonymized comparison engine
- `src/components/budget/community/BenchmarkDashboard.tsx` - Comparison UI

**Features**:
- Anonymous comparison to similar households (geography, income bracket, household size)
- "You spend 20% less on groceries than peers"
- "Your savings rate is in the top 25% for your income bracket"
- Privacy-first: only aggregated, anonymized data leaves device
- Opt-in with granular controls (which categories to share)
- No individual data ever exposed — minimum cohort size enforced

### 9.2 Financial Education

**New Files**:
- `src/lib/education/contextual-lessons.ts` - Behavior-triggered micro-lessons
- `src/components/budget/education/MicroLesson.tsx` - Lesson card UI
- `src/lib/education/knowledge-base.ts` - Financial education content

**Features**:
- Contextual micro-lessons tied to user behavior
- "You paid $45 in overdraft fees this year — here's how to avoid them"
- "Your credit utilization is 78% — learn why 30% is the target"
- Knowledge base integrated with AI Money Coach chatbot
- Progressive curriculum from basics to advanced topics
- Bookmark and revisit past lessons

### 9.3 Voice Commands

**New Files**:
- `src/lib/voice/speech-to-text.ts` - Voice input processing
- `src/lib/voice/command-parser.ts` - Intent recognition
- `src/components/budget/voice/VoiceButton.tsx` - Voice input UI

**Features**:
- "How much did I spend on groceries this month?" via speech-to-text
- "Add a $45 transaction at Costco" — hands-free transaction entry
- Accessibility improvement for all users (vision impaired, mobility limited)
- Works with Web Speech API (browser-native, no external service required)
- Fallback to text input on unsupported browsers

---

## Critical Implementation Files

| Existing File | Purpose | Modifications Needed |
|---------------|---------|---------------------|
| `src/lib/budget-db.ts` | IndexedDB schema | Keep as-is (local cache) |
| `src/lib/encryption/budget-encryption.ts` | AES-GCM encryption | Extend for cloud keys |
| `src/lib/sync/sync-engine.ts` | Vector clock sync | Add cloud transport |
| `src/lib/sync/offline-manager.ts` | Change queue | Connect to cloud sync |
| `src/lib/simplefin/client.ts` | Bank API | Complete implementation |
| `src/contexts/ProfileContext.tsx` | Multi-profile | Extend for family |
| `src/contexts/AuthContext.tsx` | Authentication | Add cloud auth mode |

---

## Pricing Tiers

| Feature | Free | Premium $5.99/mo | Family $11.99/mo |
|---------|------|-------------------|-------------------|
| Accounts | 3 | Unlimited | Unlimited |
| Bank Connections | 1 | 5 | 10 |
| Devices | 1 | 5 | 10 |
| Family Members | 1 | 1 | 6 |
| API Access | No | Yes | Yes |
| Investment Tracking | 1 brokerage | Unlimited | Unlimited |
| Crypto Tracking | No | Yes | Yes |
| Credit Score | No | Yes | Yes |
| Bill Negotiation | No | Yes | Yes |
| Tax Reports | No | Yes | Yes |
| AI Money Coach | Basic | Full | Full |
| Cash Flow Projection | 3 months | 12 months | 12 months |
| Currencies | 3 | 160+ | 160+ |
| Languages | All 113 | All 113 | All 113 |
| Travel Mode | No | Yes | Yes |
| Priority Support | No | Yes | Yes |

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Foundation | 8 weeks | MVP: Auth, passkeys, E2E encryption, cloud sync, billing, safe-to-spend, budget methods |
| 2. Bank Sync | 4 weeks | SimpleFIN + Plaid, subscription detection, credit score |
| 3. Family | 4 weeks | Groups, permissions, couple features, wellness score, savings challenges |
| 4. AI | 4 weeks | Enhanced ML, federated learning, AI coach, nudges, margin finder |
| 5. Wealth | 4 weeks | Investments, net worth, cash flow projection, crypto, real estate |
| 6. Platform | 3 weeks | API, webhooks, export/import, open banking compliance |
| 7. Tax & Tools | 3 weeks | Tax optimization, bill negotiation, HSA/FSA, BNPL |
| 8. Launch | 3 weeks | Notifications, onboarding, swipe-to-review, wearables |
| 9. Growth | 3 weeks | Social benchmarking, education, voice commands |
| **Total** | **36 weeks** | |

---

## Verification Plan

### Testing Strategy
1. **E2E Encryption**: Verify server cannot decrypt data
2. **Sync**: Multi-device conflict resolution tests
3. **Offline**: Full functionality without network
4. **Family**: Permission enforcement across all endpoints
5. **API**: Rate limiting, auth, payload validation

### Security Audit
- Third-party audit of encryption implementation
- Penetration testing before launch
- Bug bounty program post-launch

### Performance Benchmarks
- Sync latency < 2 seconds
- Offline-to-online transition seamless
- Handle 100k+ transactions per account

---

## Success Metrics

| Metric | Target |
|--------|--------|
| E2E encryption coverage | 100% of financial data |
| Offline functionality | 100% feature parity |
| Sync conflict rate | < 0.1% |
| API uptime | 99.9% |
| Premium conversion | 5% of free users |
| Family plan adoption | 20% of premium |
| Net worth tracking adoption | 70% of active users |
| Investment account connections | 40% of premium users |
| Subscription savings per user | $50+/month average |
| Financial wellness score usage | 60% weekly check-in |
| AI coach conversations/week | 3+ per active user |
| Safe-to-spend daily views | 80% of active users |
| 90-day retention rate | 65%+ (vs. industry avg ~40%) |
| Cash flow projection usage | 50% of premium users |

---

## API & Technology Appendix

### Investment Tracking — Recommended Stack

| Option | Use Case | Cost | Data |
|--------|----------|------|------|
| **Plaid Investments** (primary) | Holdings + transactions | Custom subscription | 2,400+ institutions, 24mo history, cost basis |
| **MX** (alternative) | Higher accuracy analytics | Custom | 10,000+ institutions, 92% accuracy |
| **SimpleFIN** (budget option) | Basic tracking | $15/year | 90-day history, daily updates |
| **SnapTrade** (active investing) | Trade execution | Custom | 40+ brokerages |

> Note: Direct broker APIs (Fidelity, Schwab) remain B2B only. US Section 1033 (April 2026) will expand standardized access.

### Passkey Authentication — Implementation Plan

- **Library**: SimpleWebAuthn (`@simplewebauthn/server` + `@simplewebauthn/browser`) — TypeScript-first, free, 2-4 week integration
- **Supabase**: No native passkey support — handle WebAuthn in custom Next.js API routes, use Supabase only for session management
- **Browser support**: 95% global coverage, no critical gaps
- **Migration**: Phased rollout — opt-in (weeks 1-4) → encourage (weeks 5-12) → default for new users (weeks 13-24) → deprecate passwords (months 6-18)
- **Recovery**: Recovery codes for app access + 24-word mnemonic for E2E data decryption (keep separate)
- **Cross-device**: QR code + Bluetooth proximity (CTAP 2.2 hybrid transport)
- **Hardware keys**: YubiKey/Titan support as optional high-security backup

### Credit Score — Recommended Stack

| Option | Use Case | Cost | Complexity |
|--------|----------|------|-----------|
| **Plaid LendScore** (if using Plaid) | Cash flow-based score | Per-API-call | Low — already integrated |
| **iSoftpull** (standalone) | All 3 bureaus, single API | Per-pull ($1-5) | **Lowest** |
| **SavvyMoney** (at scale) | Embedded credit tool | Volume-based | Moderate |

> Note: FCRA compliance mandatory — adverse action notices, consent flows, dispute procedures. Credit Karma model (free via referral commissions) viable only at 50K+ MAU.

### Exchange Rates — Recommended Stack

| Option | Update Frequency | Historical | Free Tier | Best For |
|--------|-----------------|-----------|-----------|----------|
| **Exchange Rates API** (primary) | Every 60 seconds | Yes | 100 req/month | Real-time accuracy |
| **Fixer.io** (alternative) | Every 60 seconds | Back to 1999 | Limited | Deep historical data |
| **ExchangeRate-API** (budget) | Real-time | 30+ years | Yes | Relaxed quota |
| **Open Exchange Rates** | Real-time | Yes | Yes | Commodity rates (gold, silver, BTC) |

**Architecture**: Store both transaction-date rate and settlement-date rate per foreign transaction. Base currency for all calculations; display currency user-selectable. Travel mode = temporary base currency override.
