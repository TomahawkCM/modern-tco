# Budget App Online Version: Authoritative Implementation Plan

**Date**: 2026-02-05 | **Status**: Active | **Version**: 2.0 (expanded)

---

## Document Status

This is the **single authoritative plan** for the Budget App online version. It reconciles and supersedes the following documents:

| Superseded Document                                | Role Going Forward                                                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `BUDGET_APP_ONLINE_VERSION_PLAN.md` (root)         | Original engineering blueprint. Archived — all content merged here.                                                  |
| `Plans/BUDGET_APP_ONLINE_VERSION_PLAN_UPDATED.md`  | Research epics + original plan. Archived — epics integrated into phases below.                                       |
| `Plans/BUDGET_APP_COMPLETE_IMPLEMENTATION_PLAN.md` | Competitive research + condensed plan. **Keep as research reference only** — competitive data lives there, not here. |
| `Plans/BUDGET_APP_UI_UX_PLAN_2026.md`              | UI/UX design direction. Archived — design specs integrated into Pre-Phase 0 and Phase 8.                             |

**Competitive research** is referenced, not embedded. See `Plans/BUDGET_APP_COMPLETE_IMPLEMENTATION_PLAN.md` for competitor profiles, pricing intelligence, and market analysis.

---

## Codebase Facts (Verified 2026-02-05)

| Metric                                | Actual                                                            | Previously Claimed     |
| ------------------------------------- | ----------------------------------------------------------------- | ---------------------- |
| Total LOC (.ts/.tsx in src/)          | **286,564**                                                       | 75K+ (wrong)           |
| Total files (.ts/.tsx in src/)        | **961**                                                           | 250+ (wrong)           |
| Budget-app page routes                | **36** page.tsx                                                   | 35 (minor)             |
| Budget-related .tsx files             | **195** (72 in components/budget/ + 14 subdirs + page components) | 149 (undercounted)     |
| Locale files (src/i18n/messages/)     | **114** (113 language variants + base)                            | 113 (off by one)       |
| Glossary files (src/i18n/glossaries/) | **16** language-specific glossaries                               | Not previously counted |
| AI/ML modules                         | **17**                                                            | 17 (correct)           |
| Bank CSV formats                      | **71+** across 11 regions                                         | 71+ (correct)          |
| Tesseract.js                          | **6.0.1** in package.json                                         | Confirmed              |
| Vite                                  | **7.1.6** in package.json                                         | Confirmed              |
| Current stack                         | Next.js 16 + React 19 + TypeScript 5.9 + shadcn/ui + Tailwind     | Confirmed              |

**Impact**: Migration effort estimates based on "75K LOC / 250 files" understate actual scope by ~3-4x. The portable code estimate (~27K LOC / 36% of 75K) needs recalculation against 286K LOC actual. The 27K LOC of framework-agnostic `src/lib/` code represents ~9% of total, not 36%.

---

## Vision Statement

Transform the privacy-first offline budget app into **the ProtonMail of personal finance** — a cloud-enabled platform with true E2E encryption where even we cannot read user data, combined with best-in-class family collaboration and AI features.

**Positioning**: Global-first with deep Canadian support. Lead with 114-locale breadth; showcase Canada as one market among many. Do NOT frame as "Built for Canada" — this undermines the global advantage.

---

## Competitive Differentiators

| Differentiator             | Competitors                                            | Our Online Version                                                  |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| **Data Privacy**           | Cloud-stored, company can read                         | E2E encrypted, zero-knowledge                                       |
| **Offline Mode**           | View-only or none                                      | Full functionality                                                  |
| **Family Roles**           | All-or-nothing access                                  | Granular permissions per account                                    |
| **Open Data**              | Limited export                                         | Full API, webhooks, any format                                      |
| **AI Privacy**             | Data mined for training                                | Local-first ML, opt-in only                                         |
| **Self-Hosting**           | SaaS only                                              | Optional Docker deployment                                          |
| **Net Worth Tracking**     | Fragmented (Empower for investments, YNAB for budgets) | Unified E2E encrypted dashboard                                     |
| **Subscription Killer**    | Rocket Money stores data in their cloud                | Privacy-first detection, overlap alerts, cancellation               |
| **Cash Flow Projection**   | Simplifi's unique feature, cloud-only                  | 12-month Monte Carlo projection with what-if, E2E encrypted         |
| **Passkey Auth**           | Most use passwords or basic 2FA                        | FIDO2/WebAuthn passkeys + zero-knowledge encryption                 |
| **Multiple Methodologies** | YNAB = zero-based, EveryDollar = envelope              | Zero-based, envelope, 50/30/20, pay-yourself-first                  |
| **True Multi-Currency**    | YNAB no multi-currency; Monarch limited                | 160+ currencies with travel mode, historical FX, crypto stablecoins |
| **114 Locales**            | Most competitors <10 languages                         | Full RTL support, locale-specific formatting, 16 glossaries         |
| **Receipt Scanning**       | Monarch just shipped (cloud-only)                      | Local OCR via Tesseract.js — privacy-first, already in codebase     |
| **Document Vault**         | No competitor offers encrypted doc storage             | E2E encrypted receipts, tax docs, warranties                        |
| **Canadian Tax**           | No competitor covers RRSP/TFSA/RESP/FHSA/HST           | Deep Canadian tax-advantaged account support                        |

---

## Updated Competitor Intelligence (Feb 2026)

> Full competitor profiles and pricing tables are in `Plans/BUDGET_APP_COMPLETE_IMPLEMENTATION_PLAN.md`. This section captures **updates since initial research** and newly discovered intelligence.

### Pricing Shifts (Significant)

- **PocketGuard**: Removed free tier entirely. Annual price jumped from $34.99 (2023) to $74.99 (2026). Monthly is now $12.99. This is a major churn event — former free users are looking for alternatives.
- **EveryDollar**: Relaunched January 2026 with "Margin Finder" (identifies $3,015 avg overspending), personalized plans, daily lessons, live group coaching. Premium remains $17.99/mo ($79.99/yr).
- **Goodbudget**: Premium increased to $10/mo ($80/yr). Still no bank sync.
- **Our position**: At $5.99/mo we undercut PocketGuard by 54%, EveryDollar by 67%, and match Simplifi's price point while offering E2E encryption none of them have.

### Monarch Money — Deep UI/UX Analysis

- **607 UI screens + 34 marketing screens** catalogued on NicelyDone design reference site
- Independent web and mobile dashboard customization
- Sankey diagrams for spending flow visualization (we already have this)
- Investment tracking launched but still limited — no allocation tracking, difficulty tracking investment income
- AI Assistant improving but not yet at the level of dedicated AI finance apps
- Key UX pattern: Monthly review swipe-through for quick cash flow/expense insights

### EveryDollar Relaunch (January 2026 — NEW)

- **Margin Finder**: Scans budget to find $3,015 average breathing room in 15 minutes
- **Live group coaching**: Dave Ramsey methodology groups
- **Daily lessons**: Contextual financial education tied to budget activity
- **Paycheck planning**: Allocate specific paychecks to specific budget categories
- **Competitive response**: Our Phase 4 Margin Finder + AI Coach covers the same ground with privacy-first approach

### AI Finance Agent Landscape (Rapidly Evolving)

| App           | Funding                  | Key Innovation                            | Threat Level         |
| ------------- | ------------------------ | ----------------------------------------- | -------------------- |
| Mine/MoneyGPT | $14M Series A (Jan 2026) | AI agent learning spending habits         | MEDIUM               |
| Tendi.ai      | Undisclosed              | CFP exam-trained advisor, FHI 0-100       | LOW (niche)          |
| Arta AI       | Undisclosed              | Agentic portfolio management, RAG         | LOW (wealth-focused) |
| ElektraFi     | Undisclosed              | Unprompted financial recommendations      | MEDIUM               |
| Cleo          | $140M+ total             | Gen-Z focused AI chatbot, savings account | MEDIUM               |

---

## Feature Prioritization Matrix (Effort x Strategic Impact)

Prioritized view of major features across all phases. Use this to guide within-phase sequencing and resource allocation.

**Strategic impact** scoring: addresses TRAILING gap vs Tier 1 (+1), exploits UNIQUE differentiator (+1), supports a planned phase (+1), strong user demand signal (+1), privacy-compatible without trade-offs (+1). Max = 5.

| Feature                          | Phase | Effort | Strategic Impact                                               | Priority             | Rationale                                                      |
| -------------------------------- | ----- | ------ | -------------------------------------------------------------- | -------------------- | -------------------------------------------------------------- |
| E2E encrypted cloud sync         | P1    | High   | 5 (UNIQUE + demand + privacy + phase + TRAILING gap)           | **Do first**         | Core differentiator; everything else depends on it             |
| Passkey authentication           | P1    | Medium | 4 (demand + privacy + phase + regulatory timing)               | **Do first**         | Market timing — 87% adoption planned, regulatory mandates 2026 |
| Safe-to-spend engine             | P1    | Low    | 4 (TRAILING + demand + phase + privacy)                        | **Do first**         | Low effort, high daily engagement (80% target)                 |
| Multi-currency engine            | P1    | Medium | 4 (UNIQUE + demand + TRAILING vs Lunch Money + privacy)        | **Do first**         | Key differentiator for expat/global market                     |
| Budget methodology selector      | P1    | Low    | 3 (UNIQUE + phase + privacy)                                   | **Do first**         | Low effort, unique 4-method offering                           |
| Plaid bank sync                  | P2    | High   | 5 (TRAILING + demand + phase + privacy-compatible + retention) | **Plan into phase**  | #1 missing feature; complex integration                        |
| Receipt scanning (local OCR)     | P2    | Low    | 4 (PARITY + UNIQUE privacy angle + phase + demand)             | **Do first**         | Foundation exists (Tesseract.js); privacy differentiator       |
| Subscription detection           | P2    | Medium | 3 (TRAILING + demand + phase)                                  | **Plan into phase**  | Port existing code + enhance                                   |
| Credit score integration         | P2    | Medium | 3 (TRAILING + demand + phase)                                  | **Plan into phase**  | Monarch, Simplifi have this                                    |
| Family sharing (mine/yours/ours) | P3    | High   | 5 (TRAILING + demand + phase + privacy + UNIQUE depth)         | **Plan into phase**  | Go deeper than Monarch's basic version                         |
| Financial wellness score         | P3    | Low    | 3 (LEADING + phase + demand)                                   | **Do first**         | Port existing 666 LOC; enhance                                 |
| AI money coach (Claude)          | P4    | Medium | 4 (TRAILING + demand + phase + UNIQUE privacy angle)           | **Plan into phase**  | Privacy-first AI is the differentiator                         |
| Federated learning               | P4    | High   | 2 (phase + privacy concerns)                                   | **Defer**            | Complex privacy engineering; defer until user base justifies   |
| Investment tracking              | P5    | High   | 4 (TRAILING + demand + phase + privacy)                        | **Plan into phase**  | Empower far ahead; close the gap                               |
| Cash flow Monte Carlo            | P5    | Medium | 3 (TRAILING + phase + UNIQUE encryption)                       | **Plan into phase**  | Upgrade over Simplifi's basic version                          |
| Public API + webhooks            | P6    | Medium | 3 (TRAILING + demand + phase)                                  | **Plan into phase**  | Lunch Money has this; developer community wants it             |
| E2E document vault               | P6    | Medium | 4 (UNIQUE + phase + privacy + demand)                          | **Plan into phase**  | Exploits zero-knowledge moat                                   |
| Rules engine                     | P6    | Medium | 3 (TRAILING + demand + phase)                                  | **Plan into phase**  | Simplifi, Lunch Money shipped this                             |
| Canadian tax (RRSP/TFSA)         | P7    | Medium | 4 (UNIQUE + demand + unserved market + phase)                  | **Plan into phase**  | Zero competition in this niche                                 |
| Native mobile app                | P8    | High   | 4 (TRAILING + demand + phase + retention)                      | **Plan into phase**  | Required for mainstream adoption                               |
| Self-hosted Docker               | P9    | Medium | 3 (PARITY + demand + niche + phase)                            | **Do if convenient** | Compete with Actual Budget's self-hosting                      |
| Social benchmarking              | P9    | Medium | 2 (demand + phase)                                             | **Do if convenient** | Privacy complexity high; demand uncertain                      |

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

## Phase Dependency Map

Features have implicit dependencies across phases. This table makes them explicit to prevent blocked work and identify the critical path.

```
Pre-Phase 0 (Migration)
    │
    ▼
Phase 1 (Foundation) ─────────────────────────────────────────┐
    │ E2E encryption ──────────────────────────────────────┐   │
    │ Cloud sync engine ───────────────────────────────┐   │   │
    │ Multi-currency ─────────────────────────────┐    │   │   │
    │ Passkey auth ──────────┐                    │    │   │   │
    ▼                        │                    │    │   │   │
Phase 2 (Bank Sync)          │                    │    │   │   │
    │ Receipt scanning ──────┼────────────────────┼────┼───┼──→ Phase 6 (Document vault)
    │ Subscription detection │                    │    │   │
    │ Plaid integration ─────┼───────────────────→│    │   │
    ▼                        │                    │    │   │
Phase 3 (Family)             │                    │    │   │
    │ Family groups ─────────┼──── needs P1 E2E ──┼────┘   │
    │ Gamification ──────────┼──── leaderboards need shared state
    ▼                        │                    │        │
Phase 4 (AI)                 │                    │        │
    │ AI coach ──────────────┼──── needs P1 auth  │        │
    │ Federated learning ────┼──── needs P3 user base     │
    ▼                        │                    │        │
Phase 5 (Wealth)             │                    │        │
    │ Investment tracking ───┼──── needs P2 Plaid │        │
    │ Net worth ─────────────┼──── needs P1 multi-currency │
    │ Cash flow Monte Carlo  │                    │        │
    ▼                        │                    │        │
Phase 6 (Platform)           │                    │        │
    │ Document vault ────────┼──── needs P1 E2E + P2 receipts
    │ Rules engine ──────────┼──── needs P1 sync  │        │
    │ Open banking ──────────┼──── needs P2 Plaid │        │
    ▼                        │                    │        │
Phase 7 (Tax) ───────────────┼──── needs P5 investments   │
    ▼                        │                    │        │
Phase 8 (Polish) ────────────┼──── needs P1-P7 stable     │
    ▼                        │                    │        │
Phase 9 (Growth) ────────────┘──── needs P1-P8 complete    │
```

### Critical Path

The critical path runs through: **Pre-Phase 0 -> P1 (E2E encryption + sync) -> P2 (Plaid) -> P3 (family) -> P5 (wealth) -> P6 (platform)**. Delays in P1 encryption block nearly everything downstream.

### Key Dependencies

| Dependent Feature             | Depends On                                  | Phase Dependency | Notes                                   |
| ----------------------------- | ------------------------------------------- | ---------------- | --------------------------------------- |
| Cloud sync (P1)               | Migration (P0)                              | P0 -> P1         | New Vite app must exist first           |
| Plaid bank sync (P2)          | E2E encryption (P1)                         | P1 -> P2         | Credentials must be encrypted           |
| Receipt scanning storage (P2) | Encryption (P1)                             | P1 -> P2         | Receipts encrypted before storage       |
| Family groups (P3)            | E2E sync (P1)                               | P1 -> P3         | Key sharing protocol required           |
| Family leaderboards (P3)      | Sync engine (P1)                            | P1 -> P3         | Shared state needs encrypted sync       |
| AI coach (P4)                 | Auth system (P1)                            | P1 -> P4         | User session required for context       |
| Federated learning (P4)       | User base (P3+)                             | P3 -> P4         | Minimum 100 participants per round      |
| Investment tracking (P5)      | Plaid (P2)                                  | P2 -> P5         | Plaid Investments API                   |
| Net worth dashboard (P5)      | Multi-currency (P1)                         | P1 -> P5         | Roll up across currencies               |
| Document vault (P6)           | E2E encryption (P1) + Receipt scanning (P2) | P1+P2 -> P6      | Encrypted storage + receipt feed        |
| Rules engine (P6)             | Sync engine (P1)                            | P1 -> P6         | Cross-device rules need sync            |
| Open banking (P6)             | Plaid (P2)                                  | P2 -> P6         | Section 1033 / PSD3 build on bank sync  |
| Tax features (P7)             | Investment tracking (P5)                    | P5 -> P7         | Tax-loss harvesting needs holdings data |
| Canadian tax (P7)             | Document vault (P6)                         | P6 -> P7         | CRA receipt storage                     |
| Native mobile (P8)            | All P1-P7 features stable                   | P1-P7 -> P8      | Wrap feature-complete web app           |
| Self-hosted (P9)              | Full application (P1-P8)                    | P1-P8 -> P9      | Docker wraps the complete product       |
| Social benchmarking (P9)      | User base + differential privacy (P4)       | P4 -> P9         | Needs minimum cohort sizes              |

### Parallelizable Work

Despite sequential dependencies, some work within phases can run in parallel:

- **P1**: Passkey auth and multi-currency engine can be built independently of E2E sync
- **P2**: Receipt scanning (local OCR) and subscription detection don't depend on Plaid
- **P3**: Financial wellness score (port existing code) can ship before family features
- **P5**: Cash flow Monte Carlo doesn't depend on Plaid investments
- **P7**: Canadian tax features and BNPL tracking are independent of each other

---

## UI/UX Design System ("Cyber-Soft")

### Design Philosophy

"Cyber-Soft" — the high-security confidence of ProtonMail combined with the emotional engagement of modern fintech. Every screen communicates: "Your data is locked down, but managing it feels delightful."

### Color System (Mantine Custom Theme)

```typescript
// theme/budget-theme.ts
import { createTheme, MantineColorsTuple } from "@mantine/core";

const income: MantineColorsTuple = [
  "#E3F8FF",
  "#B5ECFF",
  "#7DDBFF",
  "#45C8FF",
  "#1AB5FF",
  "#0099E6",
  "#007ACC",
  "#005C99",
  "#003D66",
  "#001F33",
];
const expense: MantineColorsTuple = [
  "#FFE3F0",
  "#FFB5D4",
  "#FF7DB5",
  "#FF4596",
  "#FF1A7A",
  "#E6005E",
  "#CC0052",
  "#990040",
  "#66002B",
  "#330015",
];
const savings: MantineColorsTuple = [
  "#E3FFF0",
  "#B5FFD9",
  "#7DFFBE",
  "#45FFA3",
  "#1AFF88",
  "#00E66E",
  "#00CC62",
  "#009949",
  "#006631",
  "#003318",
];

export const budgetTheme = createTheme({
  primaryColor: "teal",
  colors: { income, expense, savings },
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "JetBrains Mono, Fira Code, monospace",
  defaultRadius: "md",
  cursorType: "pointer",
  respectReducedMotion: true,
  other: {
    seniorsFontMultiplier: 1.0, // 1.25 in Seniors Mode
    seniorsMinTouchTarget: "52px", // 44px standard WCAG
  },
});
```

### Typography Scale

| Use                   | Font           | Size            | Weight | Line Height |
| --------------------- | -------------- | --------------- | ------ | ----------- |
| Page title            | Inter          | 28px / 1.75rem  | 700    | 1.3         |
| Section header        | Inter          | 22px / 1.375rem | 600    | 1.4         |
| Card title            | Inter          | 18px / 1.125rem | 600    | 1.4         |
| Body text             | Inter          | 16px / 1rem     | 400    | 1.6         |
| Currency values       | JetBrains Mono | 16px / 1rem     | 500    | 1.4         |
| Large currency (hero) | JetBrains Mono | 32px / 2rem     | 700    | 1.2         |
| Labels / metadata     | Inter          | 14px / 0.875rem | 400    | 1.5         |
| Small / captions      | Inter          | 12px / 0.75rem  | 400    | 1.5         |

**Seniors Mode**: All sizes multiply by `var(--seniors-font-multiplier)` (default 1.0, seniors 1.25).

### Core Layout (Mantine AppShell v7)

```
+------------------------------------------------------+
| Header: Logo | Privacy Toggle | Search(Cmd+K) | User |
+----------+-------------------------------------------+
| Navbar   | Main Content Area                         |
|          |                                           |
| * Dash   | +---------+ +---------+ +---------+      |
| * Accts  | |Safe-to- | |Bills Due| |Projected|      |
| * Trans  | |Spend    | |This Week| |Balance  |      |
| * Budget | |(Ring)   | |(List)   | |(Chart)  |      |
| * Report | +---------+ +---------+ +---------+      |
| * Invest |                                           |
| * Goals  | +-------------------------------------+   |
| * Subs   | | Recent Transactions (VirtualTable)  |   |
| * Import | +-------------------------------------+   |
|          |                                           |
| -------- | +----------+ +------------------+         |
| Sync *   | |Spending  | |Monthly Trend     |         |
| AI Coach | |by Cat.   | |(Area chart)      |         |
|          | +----------+ +------------------+         |
+----------+-------------------------------------------+
| Footer: v1.0 | Sync status | Encryption lock icon   |
+------------------------------------------------------+
```

**Mobile**: Navbar becomes bottom tab bar. Top 5 items as tabs; overflow in "More" drawer.

### Key Component Specifications

#### Safe-to-Spend Dial (Central Dashboard Widget)

**Component**: Mantine `RingProgress` with custom `sections` array

```typescript
interface SafeToSpendProps {
  available: number; // Remaining safe-to-spend
  budgeted: number; // Reserved for active budgets
  upcomingBills: number; // Bills due in look-ahead period
  totalBalance: number; // Account balance
  lookAheadDays: 7 | 14 | 30;
  currency: string;
  locale: string;
}
```

- **Segments**: Green (available, >=30%), Yellow (budgeted), Orange (upcoming bills), Red (<=0%)
- **Center**: Large JetBrains Mono currency display with privacy blur class
- **Interaction**: Click segment -> breakdown Drawer; outer ring drag -> change look-ahead
- **Animation**: framer-motion count-up on mount (500ms spring), segment transitions (200ms)
- **Size**: 200px diameter desktop, 160px mobile

#### Transaction Review Inbox ("Swipe-to-Review")

**Mobile (gesture-based with react-spring useDrag)**:

- Swipe right (>100px) -> Approve (green flash + haptic)
- Swipe left (>100px) -> Flag for review (amber flash)
- Swipe up (>80px) -> Split transaction (modal opens)
- Tap -> Detailed edit view

**Desktop keyboard shortcuts**:
| Key | Action |
|-----|--------|
| Right / A | Approve |
| Left / F | Flag for review |
| Up / S | Split |
| Enter | Open detail view |
| Space | Next transaction |
| Esc | Exit review mode |

- **Emotional ROI tags**: Mantine Badge chips — Joy (green), Regret (red), Essential (blue), Routine (gray)
- **Batch mode**: Progress bar showing reviewed/total, "Review all" rapid-fire button

#### Privacy Toggle

- **Location**: Header ActionIcon with lock/unlock icon
- **Shortcut**: Ctrl+Shift+P (Win/Linux), Cmd+Shift+P (macOS)
- **Scope**: All `.financial-value` elements — currency, account names, balances, chart labels
- **CSS**: `filter: blur(8px); transition: filter 200ms ease;`
- **State**: PrivacyContext + localStorage persistence
- **Visual**: Lock icon state change, subtle indicator dot when active

#### Scenario Slider (Cash Flow Time Machine)

- **Component**: Mantine Slider over Recharts AreaChart
- **Confidence bands**: Semi-transparent fill (15% opacity best/worst, 40% expected)
- **What-if**: Popover to add events ("Cancel Netflix $15/mo", "New salary $5K/mo")
- **Recalculation**: Debounced 150ms, Web Worker for Monte Carlo
- **Range toggle**: 3 / 6 / 12 months

#### AI Coach Panel

- **Collapsed**: Icon + badge at bottom of sidebar
- **Expanded**: Slide-out Drawer from right (mobile: full-screen modal)
- **Context-aware**: Reads current page for relevant suggestions
- **Action buttons**: "Apply suggestion", "Dismiss", "Tell me more"

### Dark Mode Colors

| Element           | Light                    | Dark                            |
| ----------------- | ------------------------ | ------------------------------- |
| Background        | `#FAFAFA`                | `#1A1B1E`                       |
| Surface (card)    | `#FFFFFF`                | `#25262B`                       |
| Surface hover     | `#F8F9FA`                | `#2C2E33`                       |
| Border            | `#DEE2E6`                | `#373A40`                       |
| Text primary      | `#212529`                | `#C1C2C5`                       |
| Text secondary    | `#868E96`                | `#909296`                       |
| Income            | `#0099E6`                | `#1AB5FF`                       |
| Expense           | `#E6005E`                | `#FF1A7A`                       |
| Savings           | `#00CC62`                | `#1AFF88`                       |
| Glassmorphism bg  | `rgba(255,255,255,0.85)` | `rgba(26,27,30,0.85)`           |
| Card glow (hover) | none                     | `0 0 20px rgba(20,184,166,0.1)` |

### Animation Guidelines

- **Page transitions**: AnimatePresence fade (150ms)
- **Card enter**: Fade up (translateY 20px, opacity 0->1, 300ms spring)
- **Widget updates**: Number count-up (500ms spring, overshoot 0.05)
- **Gesture feedback**: Spring physics (tension 200, friction 20)
- **Loading**: Mantine Skeleton matching final layout
- **Celebrations**: canvas-confetti on milestones
- **Reduced motion**: All animations in useReducedMotion() guard

### Accessibility (WCAG 2.2 AA+)

| Requirement      | Implementation                                |
| ---------------- | --------------------------------------------- |
| Touch targets    | 44px default, 48px seniors, 52px primary      |
| Focus indicators | 3px ring, 2px offset, high contrast           |
| Reduced motion   | All in useReducedMotion() guard               |
| Screen reader    | aria-label + chart table fallback             |
| Keyboard nav     | Full traversal + skip-to-content              |
| Color blind      | Icon + label always paired with color         |
| RTL              | Mantine dir="rtl" + logical CSS properties    |
| Contrast         | 4.5:1 body, 3:1 large (Lighthouse + axe-core) |
| Zoom/reflow      | Responsive design + relative units at 200%    |

### Responsive Breakpoints

| Mantine breakpoint | Width   | Layout                                      |
| ------------------ | ------- | ------------------------------------------- |
| xs                 | 0+      | Single column, bottom tabs, stacked widgets |
| sm                 | 576px+  | Single column, hamburger sidebar            |
| md                 | 768px+  | Two-column, compact sidebar (icons)         |
| lg                 | 992px+  | Two-column, full sidebar (icons + labels)   |
| xl                 | 1200px+ | Three-column (sidebar + main + aside)       |

---

## Pre-Phase 0: Tech Stack Migration (React + Vite + Mantine)

The online version will be a **new application** built on React + Vite + Mantine UI, carrying forward business logic from the current Next.js 16 app.

### Migration Strategy

1. **New repo/project** using Vite + React + Mantine template
2. **Port business logic directly**: All `src/lib/` modules are framework-agnostic TypeScript — they port as-is
3. **Rebuild UI components**: Replace shadcn/ui components with Mantine equivalents (100+ components available)
4. **Replace Tailwind with Mantine styles**: CSS-in-JS with built-in dark mode, responsive utilities, RTL support
5. **Replace next-intl with Mantine i18n** or standalone react-intl
6. **Routing**: Replace Next.js App Router with React Router (or TanStack Router)
7. **SSR consideration**: Vite + React is SPA-first. Landing/marketing pages may need separate SSR solution

### What Ports Directly (No Rewrite Needed)

| Module                    | LOC             | Notes                          |
| ------------------------- | --------------- | ------------------------------ |
| `src/lib/encryption/`     | 889             | Pure crypto, no framework deps |
| `src/lib/sync/`           | 2,273           | WebRTC/sync logic              |
| `src/lib/simplefin/`      | 1,649           | API client                     |
| `src/lib/ai/`             | 9,186           | All 17 AI modules              |
| `src/lib/analytics/`      | 2,930           | Analytics engine               |
| `src/lib/categorization/` | 902             | ML categorizer                 |
| `src/lib/parsers/`        | 5,967           | CSV/OFX/PDF parsers            |
| `src/lib/budget-db.ts`    | 2,293           | IndexedDB schema (Dexie.js)    |
| `src/types/`              | 895             | Type definitions               |
| `src/i18n/messages/`      | 114 files       | Locale JSON files              |
| `src/i18n/glossaries/`    | 16 files        | Language-specific glossaries   |
| **Total portable**        | **~27,000 LOC** | **~9% of 286K total codebase** |

**Corrected migration scope**: 27K LOC ports as-is. The remaining ~260K LOC includes 195+ budget components, 36 routes, 8+ API routes, 18 React contexts, all CSS, and the entire LMS application. The budget app rebuild is the priority; the LMS stays on Next.js.

### What Needs Rebuilding

- **195+ budget React components** (shadcn/ui → Mantine)
- **36 page routes** (Next.js App Router → React Router)
- **8+ API routes** (Next.js API → Express/Fastify/Hono backend or serverless functions)
- **React contexts** (port with minor changes)
- **All CSS** (Tailwind → Mantine styling system)

### UI/UX Design Direction ("Cyber-Soft" Aesthetic)

- **Dark mode primary** with deep charcoals — Mantine has native dark theme
- **Color coding**: Electric Blue (income), Neon Magenta (expenses), Emerald Green (savings)
- **Typography**: Inter (UI) + JetBrains Mono (data/currency) — Mantine supports custom fonts
- **Framer Motion micro-animations** — compatible with Vite/React
- **Recharts** for visualizations — compatible with Vite/React
- **RingProgress** (Safe-to-Spend Dial) — Mantine built-in component
- **Privacy Toggle** — global header blur for currency values in public spaces
- **Swipe-to-Review** — react-spring or framer-motion gestures
- **Scenario Slider** — WASM-powered timeline projecting bank balances 3-12 months

### Migration Decision Record

**Decision**: Build the online version as a new React + Vite + Mantine application rather than evolving the existing Next.js 16 codebase.

**Options evaluated**:

1. **Full migration to React + Vite + Mantine** (chosen): New repo, port business logic (~27K LOC as-is), rebuild UI layer. Benefits: Vite's sub-500ms cold starts, Mantine's 100+ components with native dark mode/RTL/CSS-in-JS, SPA architecture suited to offline-first PWA, clean break from 260K LOC of Next.js-specific code (SSR, App Router, API routes). Cost: Rebuilding 195+ budget components and 36 routes on a new UI framework.

2. **Incremental migration (keep Next.js, swap components gradually)**: Replace shadcn/ui with Mantine component-by-component while staying on Next.js. Benefits: Lower risk, ships incrementally, no big-bang rewrite. Costs: Next.js SSR adds complexity for an offline-first app that doesn't need it; Tailwind and Mantine CSS-in-JS would coexist awkwardly during transition; App Router patterns diverge from the SPA model the online version needs. This approach could deliver ~80% of the UI benefit at ~20% of the cost but would leave architectural debt (SSR overhead, hybrid styling, unnecessary API routes).

3. **Stay on Next.js + shadcn/ui entirely**: Add cloud features to the existing codebase. Benefits: Zero migration cost, ship cloud features immediately. Costs: The LMS and budget app share a Next.js monolith — adding cloud infrastructure (Supabase sync, Stripe billing, Plaid) to this shared codebase increases coupling. The budget app's offline-first needs conflict with Next.js's server-centric model.

**Why Vite + Mantine won**: The online version is fundamentally an offline-first SPA with cloud sync bolted on. Next.js optimizes for the opposite pattern (server-first with client hydration). Starting fresh avoids retrofitting SSR patterns the budget app doesn't need, gives a clean Mantine theme system (vs. hybrid Tailwind/Mantine), and separates the budget app from the LMS cleanly. The ~27K LOC of portable business logic means the "rewrite" is really a UI rebuild, not a logic rewrite.

**If the full migration proves too costly**: Fall back to Option 2 (incremental). The portable `src/lib/` modules are the same in both paths.

### Migration Risk Assessment

> **WARNING**: This migration is the single largest engineering effort. Rebuilding 195+ components and 36 routes on a new framework while maintaining feature parity is a major undertaking. The cost must be weighed against the benefits (Vite speed, Mantine components, SPA architecture). Consider whether an incremental approach (keep Next.js, swap shadcn components gradually) could deliver 80% of the benefit at 20% of the cost.

---

## Phase 1: Foundation — MVP

### 1.1 E2E Encryption Architecture

**Extend**: `src/lib/encryption/budget-encryption.ts` (514 LOC)

**New Files**:

- `lib/auth/cloud-auth.ts` — Supabase Auth wrapper
- `lib/auth/key-derivation.ts` — Password → Master Key → Device Keys
- `lib/auth/recovery-key.ts` — 24-word recovery phrase generation
- `lib/encryption/cloud-encryption.ts` — Cloud-specific E2E

**Key Derivation Flow**:

```
User Password ──PBKDF2──▶ Master Key (never leaves device)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Device Key A         Device Key B
              (Browser)            (Mobile)
```

**Recovery**: 24-word mnemonic phrase (BIP39-style)

**Security Transparency** (from research epics):

- Publish public security model + threat model before launch
- Plan for independent third-party audit (publish summary)
- Passkeys by default with user-friendly recovery

### 1.2 Cloud Database Schema (Supabase)

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

**Reuse**: Port `src/lib/sync/sync-engine.ts` (794 LOC) — vector clocks, conflict resolution

**New Files**:

- `lib/sync/cloud-sync-engine.ts` — Orchestration
- `lib/sync/cloud-transport.ts` — Supabase Realtime transport
- `lib/sync/encrypted-payload.ts` — Encrypt before cloud, decrypt after

**Sync Flow**:

1. Local change → Encrypt → Queue
2. Online → Push encrypted blobs to Supabase
3. Supabase Realtime → Notify other devices
4. Other devices → Pull → Decrypt → Merge with local

**Data Reliability** (from research epics):

- Add sync health logging, retry logic, and manual fallback from Phase 1
- Ensure schema supports multi-currency from day one (even if UI ships later)

### 1.4 Subscription & Billing (Stripe)

- `lib/stripe/subscription-manager.ts`
- API: `stripe/webhook` endpoint

**Tiers**: See [Pricing Tiers](#pricing-tiers) section.

### 1.5 Passkey Authentication (CRITICAL — market timing)

**Library**: SimpleWebAuthn (`@simplewebauthn/server` + `@simplewebauthn/browser`)

**Why now**: 87% industry adoption planned, regulatory mandates in UAE/India/Philippines (2026)

**New Files**:

- `lib/auth/passkey-auth.ts` — WebAuthn registration & authentication
- `lib/auth/passkey-recovery.ts` — Recovery code generation & verification
- API: `auth/passkey/register`, `auth/passkey/authenticate`
- `PasskeySetup.tsx` — UI for passkey enrollment

**Features**:

- FIDO2/WebAuthn passkey creation and login
- Hardware security key support (YubiKey, Titan) as optional backup
- Cross-device passkey via QR code + Bluetooth proximity (CTAP 2.2 hybrid transport)
- Recovery codes for app access (separate from 24-word mnemonic for E2E data decryption)
- Phased migration: opt-in → encourage → default for new users → deprecate passwords
- Browser support: 95% global coverage

### 1.6 Safe-to-Spend Engine (HIGH user demand)

**Why prioritize**: PocketGuard's core differentiator, Simplifi's standout feature, 80% target daily views

**Core Calculation**:

```
(Available Balance) - (Upcoming Bills) - (Savings Goals) - (Reserved for Budgets) = Safe to Spend
```

**New Files**:

- `lib/budget/safe-to-spend.ts` — Core calculation engine
- `SafeToSpendWidget.tsx` — Mantine RingProgress dashboard widget

**Features**:

- Real-time recalculation on every transaction
- Includes pending transactions from bank sync
- Configurable look-ahead period (7/14/30 days)
- Color-coded status: green (comfortable), yellow (tight), red (over budget)
- Drill-down to see what's reserved and why

**Daily Dashboard Integration** (from research epics):

- Safe-to-Spend + Bills Due + Projected Balance on one screen
- Confidence bands (best/worst/expected) with clear explanations

### 1.7 Budget Methodology Selector

**Support multiple budgeting approaches in one app** (no competitor offers all four):

**New Files**:

- `lib/budget/methodology-engine.ts` — Core methodology logic
- `MethodologyQuiz.tsx` — Onboarding selection
- `MethodologySwitcher.tsx` — Switch anytime

**Methodologies**:

- **Zero-based** (YNAB-style): Every dollar gets a job
- **Envelope** (Goodbudget-style): Allocate to virtual envelopes
- **50/30/20 rule**: Needs / Wants / Savings split
- **Pay-yourself-first**: Set savings target, spend the rest freely

### 1.8 Multi-Currency Engine (UNIQUE differentiator)

**New Files**:

- `lib/currency/exchange-rate-service.ts` — Rate fetching & caching
- `lib/currency/multi-currency-engine.ts` — Conversion & storage logic
- `lib/currency/travel-mode.ts` — Temporary base currency override
- `CurrencySettings.tsx` — Currency configuration

**Features**:

- Base currency + display currency toggle
- Store both transaction-date and settlement-date exchange rates
- Real-time rates via Exchange Rates API or Fixer.io (updated every 60 seconds)
- 160+ currencies including crypto stablecoins (USDC, USDT)
- Net worth rolls up to base currency with transparent conversion
- Hover/tooltip shows exact rate applied per transaction
- Travel mode: temporarily switch primary display currency when abroad
- Exchange gain/loss tracking (realized on settlement, unrealized on revaluation)
- **FX transparency everywhere** (from research epics): show rate source/date in tooltips and reconciliation

### 1.9 Multi-Language & Localization

**Carry forward all 114 locale files + 16 glossaries from offline app**.

**Features**:

- Full RTL support for Arabic, Hebrew, Farsi, Urdu (CSS `direction: rtl` + auto-layout mirroring)
- Locale-specific: date formats, number separators, currency symbol placement
- Web fonts with RTL character support (Noto Sans)
- User can override locale defaults (e.g., Western vs Eastern Arabic numerals)
- All new online features must be i18n-ready from day one

**Existing infrastructure to port**:

- `src/i18n/messages/` — 114 locale files
- `src/i18n/glossaries/` — 16 glossary files (ja-JP, ko-KR, ar-SA, zh-CN, etc.)
- `src/i18n/utils/` — formatDate, formatCurrency, formatNumber utilities
- RTL detection and layout system

---

## Phase 2: Bank Sync

### 2.1 Complete SimpleFIN

**Current**: ~80% complete (`src/lib/simplefin/client.ts` — 502 LOC)

**Action**: Port and complete, add account matcher + connection wizard

### 2.2 Plaid Integration (Premium)

**Note**: Section 1033 is **on hold** — court injunction (Oct 2025), CFPB reversing course, new rulemaking in progress. Original April 2026 deadline will NOT be met. Plaid remains the primary US bank sync path.

**New Files**:

- `lib/plaid/client.ts`
- `lib/plaid/link-handler.ts`
- API: `plaid/link`, `plaid/webhook`

```sql
bank_connections (
  id, user_id, provider,
  encrypted_credentials,  -- E2E encrypted access tokens
  institution_name, status, last_sync_at
)
```

### 2.3 Sync Health Dashboard (NEW — from research epics)

**Why**: Monarch just shipped connection health dashboard; bank sync reliability is #1 churn driver

**Features**:

- Per-institution status: last successful pull, current status, known outages
- Retry controls with "what changed" log
- Manual-first fallback that doesn't feel like a downgrade (instant CSV import, drag-drop, receipt capture, quick-entry flows)

### 2.4 Reconciliation Autopilot (NEW — from research epics)

**Features**:

- Guided fixes for mismatched balances
- Pending vs posted transaction handling
- Duplicate detection and transfer pairing
- Split transaction resolution
- Hidden fee identification

### 2.5 Subscription Detection & Cancellation

**Reuse**: Port `src/lib/analytics/recurring-detector.ts` (209 LOC)

**New Files**:

- `lib/subscriptions/subscription-detector.ts` — Recurring charge scanner
- `lib/subscriptions/overlap-detector.ts` — Duplicate service detection
- `lib/subscriptions/cancellation-guide.ts` — Cancellation flow engine
- `SubscriptionManager.tsx` — Management UI
- `PriceAlertBanner.tsx` — Price increase alerts

**Features**:

- Scan transaction history for recurring charges (weekly, monthly, annual patterns)
- Flag hidden/forgotten subscriptions with last-use detection
- Overlap detection ("you pay for Spotify AND Apple Music")
- Cancellation guidance: merchant-specific steps, tracked status, evidence vault
- Price increase alerts when a subscription charges more than previous period
- **Annualized cost shock** (from research epics): show annual total impact prominently

### 2.6 Receipt Scanning with Local OCR (NEW — from Grok review)

**Why**: Monarch just shipped receipt scanning (cloud-based). We can do it privacy-first with Tesseract.js 6.0.1 already in package.json.

**Features**:

- Camera/file upload for receipts
- Local OCR via Tesseract.js (no data leaves device)
- Extract merchant, date, total, line items where possible
- Auto-match to existing transactions
- Store scanned receipts in encrypted document vault (Phase 6)

### 2.7 Credit Score Integration

**Stack**: iSoftpull (standalone, $1-5/pull) or Plaid LendScore (if using Plaid)

**Features**:

- Score trend history with monthly tracking
- Factors breakdown (utilization, payment history, etc.)
- Alerts on significant changes (+/- 20 points)
- FCRA compliance: adverse action notices, consent flows, dispute procedures

---

## Phase 3: Family & Collaboration

### 3.1 Family Groups with Selective Sharing

**Mine/Yours/Ours** as a first-class workflow (Monarch just shipped basic version — we go deeper):

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

**Roles**: Owner, Admin, Member, Viewer, Child

**Granular permissions** (from research epics):

- Share by account, category, time range
- **Audit trail + rollback** (non-negotiable): see who changed what, undo safely
- Lightweight approval workflows: thresholds + approve/deny/ask-later with notes/receipts

### 3.2 Couple-Specific Features

- Joint vs Individual account views
- "Who owes whom" tracking
- Approval workflow for purchases over threshold
- Shared budget goals with contribution tracking

### 3.3 Financial Wellness Score

**Reuse**: Port `src/lib/analytics/health-score.ts` (666 LOC)

**Composite Score (0-100)**:

- Emergency fund coverage (3-6 months)
- Debt-to-income ratio
- Savings rate (% of income)
- Budget adherence
- Net worth trend
- Retirement readiness

### 3.4 Savings Challenges & Gamification (ENHANCED — from Grok review)

**Challenge Types**:

- "No-spend weekend" — track zero discretionary spending
- "52-week challenge" — save incrementally
- "Round-up savings" — round to nearest dollar, save difference
- Custom household challenges with configurable rules

**Gamification additions**:

- Badges for financial milestones (debt-free, emergency fund complete, savings streaks)
- Streak tracking with visual progress
- Family leaderboard
- Celebration animations on milestones
- Opt-in competitive or collaborative modes

**Note**: The LMS already has a full badge system (27 badges, 6 levels) — reuse patterns and infrastructure.

**Privacy Architecture Notes (Gamification & Leaderboards)**:

- Family leaderboards require shared state (scores, streaks, rankings). With zero-knowledge encryption, the server cannot compute rankings from encrypted data.
- **Solution**: Client-side leaderboard computation. Each family member's device decrypts all shared scores locally and computes rankings in-browser. Scores are stored as encrypted blobs in the shared family group; devices pull, decrypt, rank, and display.
- **Trade-off**: Leaderboard updates are not real-time — they refresh when a family member's device syncs and decrypts. Acceptable for daily/weekly challenge cadence.
- **Alternative (if real-time needed)**: Scores only (not transaction data) could be stored unencrypted as opt-in metadata. This weakens the zero-knowledge guarantee for score data specifically. Document this trade-off and let users choose.

---

## Phase 4: Superior AI

### 4.1 AI Money Coach (Claude API)

**Reuse**: Port `src/contexts/ChatbotContext.tsx` (13KB), existing `@anthropic-ai/sdk` integration

**Privacy-first**: Local data analysis, anonymized context to Claude API. No raw transaction data leaves device.

**Competitive urgency**: Mine/MoneyGPT ($14M Series A), Tendi.ai, ElektraFi all shipping AI agents.

### 4.2 Enhanced Local ML

**Extend**: Port `src/lib/analytics/lstm-predictive-spending.ts` (478 LOC)

- Improved categorization accuracy (target: 95%+)
- Savings opportunity finder
- Smart goal recommendations

### 4.3 Behavioral Nudge Engine

**Port**: `src/lib/analytics/weekly-insights.ts` (706 LOC), `overspending-detector.ts` (159 LOC)

Context-aware smart notifications with engagement-optimized delivery timing.

### 4.4 Margin Finder + Decision Mode (ENHANCED — from research epics)

**Decision Mode**: "If I buy this today, what breaks?" — instant answer with confidence bands.

**Margin Finder**: Scans for savings opportunities (EveryDollar reports $3,015 avg found).

### 4.5 Federated Learning (Opt-In)

**Port**: `src/lib/collective-learning-service.ts` (553 LOC) as foundation

Differential privacy, model aggregation, gradient noise. All opt-in.

**Privacy Architecture Notes (Federated Learning)**:

- Gradient sharing in federated learning can leak information about underlying data (gradient inversion attacks). The plan mentions "differential privacy, gradient noise" but must specify concrete parameters.
- **Epsilon budget**: Target epsilon <= 8.0 per training round (moderate privacy guarantee). Lower epsilon = stronger privacy but slower model convergence. Start conservative (epsilon = 4.0) and relax only with evidence.
- **Gradient clipping**: Clip per-sample gradients to bounded L2 norm before adding noise. Prevents outlier transactions from dominating updates.
- **Secure aggregation**: Use secure multi-party computation (MPC) for gradient aggregation so the server never sees individual gradients — only the aggregated model update.
- **Minimum participation threshold**: Require minimum 100 participants per round to prevent de-anonymization. If user base is too small, defer federated learning entirely and use local-only ML.

---

## Phase 5: Wealth Tracking

### 5.1 Investment Portfolio Tracking

**Stack**: Plaid Investments (primary) or SimpleFIN investment feeds

**Features**:

- TWR/IRR calculations
- Asset allocation visualization with target vs actual
- Rebalancing suggestions
- Dividend/distribution tracking with reinvestment detection

### 5.2 Net Worth Dashboard

**Features**:

- Aggregate all asset types: bank accounts, investments, real estate, crypto
- Subtract liabilities: loans, credit cards, BNPL obligations
- Historical trend chart (monthly snapshots)
- Milestone celebrations
- Year-over-year comparison

### 5.3 Cash Flow Projection with Monte Carlo (ENHANCED — from Grok review)

**Port**: `src/lib/analytics/trend-forecasting.ts` (227 LOC) as foundation

**Features**:

- 12-month forward projection
- **Monte Carlo simulation** for confidence bands (upgrade from simple best/worst/expected)
- Income variability modeling, seasonal category patterns
- What-if scenarios: "If I cancel these subscriptions..." / "If I get a $5K raise..." / "If I pay off this loan..."
- Competitive edge: Simplifi has basic projection — we add Monte Carlo + E2E encryption

### 5.4 Crypto & Real Estate Tracking

- Crypto: Exchange APIs (Coinbase, Binance, Kraken) + wallet monitoring + cost basis (FIFO, LIFO, specific lot)
- Real estate: Zillow/Redfin API (US) + manual entry (all markets), equity calculation, mortgage tracking

---

## Phase 6: Open Platform

### 6.1 Public API (REST v2)

Bearer token auth with scopes. Endpoints for Accounts, Transactions, Budgets, Categories, Reports, Webhooks.

### 6.2 Webhooks

Events: transaction.created, transaction.updated, budget.exceeded, budget.warning, account.balance_changed, bank_sync.completed, bank_sync.failed

### 6.3 Data Portability (from research epics: "Leave-Any-Time Promise")

- **Export**: JSON, CSV, YNAB format, PDF reports, scheduled encrypted backups
- **Import**: YNAB (port existing 4,782 LOC wizard), Mint, Quicken QIF, generic CSV
- **Importers** for major apps with structured mapping + category normalization
- **Automations gallery**: webhooks/API recipes (alerts, approvals, logging to sheets)

### 6.4 E2E Encrypted Document Vault (NEW — from Grok review)

**Why**: Exploits the zero-knowledge moat. Natural extension of existing encryption infrastructure.

**Features**:

- Store receipts, tax documents, warranties, contracts
- E2E encrypted (same key infrastructure as financial data)
- Link documents to transactions, accounts, or tax categories
- Search by document type, date, merchant
- Receipt scanning (Phase 2.6) stores directly to vault

**Privacy impact**: Documents encrypted client-side before upload. Server stores opaque blobs. Same zero-knowledge guarantee as financial data.

### 6.5 Smart Rules Engine & Automation (NEW — from Grok review)

**Why**: Simplifi added "advanced automation rules". Users want "if-then" logic for recurring tasks.

**Features**:

- If-then rules for auto-categorization ("Uber Eats → Dining Out")
- Threshold alerts ("Notify if any transaction > $500")
- Auto-transfer rules ("Round up to nearest $5, move difference to savings")
- Conditional notifications ("If dining budget > 80%, send alert")
- Rule templates for common patterns

**Privacy Architecture Notes (Rules Engine)**:

- If rules run client-side only, they cannot trigger on events from other family members' devices (e.g., "notify me when partner spends > $200").
- **Solution for single-user rules**: Fully client-side. Rules evaluate against the local decrypted database. No privacy impact.
- **Solution for cross-device family rules**: Rules are stored as encrypted config in the shared family group. Each device evaluates rules against its own decrypted data after sync. Notifications are generated locally — the server never evaluates rules or sees trigger conditions.
- **Limitation**: Cross-device rules have latency equal to sync interval. A "notify when partner spends > $200" rule fires when the partner's transaction syncs to your device, not in real-time. Document this limitation in UX.
- **What we cannot do**: Server-side rule evaluation (would require the server to decrypt data, breaking zero-knowledge). Time-based triggers without an active client (e.g., "remind me at 9am") require the device to be online — use service worker scheduling with offline fallback.

### 6.6 Open Banking Compliance

**Section 1033 (US)**: On hold — court injunction, CFPB reversing course. Do NOT depend on this for bank sync strategy. Build API-ready architecture but don't block on compliance.

**PSD3 (EU)**: Political agreement reached (Nov 2025), formal adoption expected mid-2026. Compliance likely H2 2027 or early 2028. Plan Phase 6 to align with this timeline.

**Canadian Consumer-Driven Banking** (NEW — from Grok review): Canada's open banking framework is progressing. Build architecture to support Canadian open banking when it arrives.

**Consumer consent dashboard**: View, revoke, manage data sharing permissions.

---

## Phase 7: Tax & Financial Tools

### 7.1 Tax Optimization

**Features**:

- Tax category tagging for transactions
- Quarterly estimated tax tracker for self-employed
- Year-end tax summary report
- Deduction finder: scans for commonly missed deductions
- Export for accountant or TurboTax/H&R Block import

### 7.2 Canadian Tax Integration (NEW — from Grok review)

**Why**: Genuinely unserved by US-centric competitors. Unique differentiator for the Canadian market.

**Features**:

- **RRSP tracking**: Contribution room, deduction limit, carry-forward amounts
- **TFSA tracking**: Lifetime contribution room, over-contribution alerts
- **RESP tracking**: Government grant eligibility (CESG), lifetime limits
- **FHSA tracking**: $8,000 annual limit, $40,000 lifetime (visual progress bar)
- **HST/GST per-province tagging**: Auto-tag sales tax based on merchant province
- Receipt vault integration for CRA-eligible expenses (T2200, donation receipts)
- Tax-loss harvesting suggestions for investment accounts

**Positioning**: This is a showcase market feature, not the product's identity. The app remains global-first with 114 locales. Canada gets deep tax support; other countries get equivalent features as demand materializes.

### 7.3 HSA/FSA Tracking (US)

- Contribution limit tracking (annual IRS limits)
- Eligible expense auto-categorization
- FSA use-it-or-lose-it deadline reminders
- Tax advantage calculations

### 7.4 BNPL Tracking

- Auto-detect Afterpay/Klarna/Affirm installments
- Track total BNPL obligations as liability (included in net worth)
- Payment schedule visualization
- Alert when new BNPL pushes debt-to-income too high

### 7.5 Bill Negotiation Service

- Partner with negotiation service or build concierge team
- Auto-detect negotiable bills (phone, cable, internet, insurance)
- Track savings achieved
- Revenue model: percentage of savings (start with detection only, defer full service)

---

## Phase 8: Polish & Launch

### 8.1 Push Notifications

Service worker push, deep linking, configurable preferences.

### 8.2 Mobile Optimization

React Native wrapper for App Store presence, biometric auth, widget support.

### 8.3 Behavioral Onboarding

- Budget methodology quiz during signup
- Guided setup tailored to chosen method
- Progressive feature disclosure
- "Getting started" checklist with celebration

### 8.4 Accessibility Mode (from research epics)

**Why**: Most budget apps are built for finance enthusiasts, not beginners/seniors. Underserved segment.

**Features**:

- Large text, high contrast, simplified navigation, bigger tap targets
- Plain-language labels
- **Guided monthly close** wizard: review → categorize → confirm → done
- Voice entry ("Add $45 groceries") via Web Speech API
- Strong undo/rollback patterns
- Screen reader optimization audit

**Note**: The existing codebase already has a SeniorsModeContext (8KB). Port and extend.

### 8.5 Swipe-to-Review

Tinder-style transaction inbox: Left = flag, Right = approve, Up = split. Desktop keyboard shortcuts.

### 8.6 Wearable Widgets

Apple Watch / Wear OS: Safe-to-spend glance, recent transactions, budget status.

---

## Phase 9: Growth & Community

### 9.1 Social Benchmarking (Opt-In)

Anonymous comparison to similar households. Privacy-first: only aggregated, anonymized data. Minimum cohort size enforced.

**Privacy Architecture Notes (Social Benchmarking)**:

- Anonymized aggregation requires some computation over user data. The server cannot read encrypted financial data, so naive server-side aggregation breaks zero-knowledge.
- **Solution: Local-only aggregation with differential privacy**. Users opt in to share aggregate statistics (not raw data). The client computes local summaries (e.g., "spending in dining: $X/mo", "savings rate: Y%") and adds calibrated Laplace noise before uploading. The server aggregates noisy statistics only.
- **Minimum cohort size**: Enforce k-anonymity with k >= 50. Do not display benchmarks for demographic segments with fewer than 50 participants. This prevents inference attacks on small groups.
- **What is shared**: Only pre-defined aggregate metrics with noise, never raw transactions, account names, or merchant data. Users can preview exactly what will be shared before opting in.
- **Homomorphic encryption alternative**: Considered but rejected for v1. HE libraries (SEAL, TFHE) add significant client-side computation overhead and bundle size. Revisit if user demand for real-time benchmarks exceeds what differential privacy can provide.

### 9.2 Contextual Financial Education (Micro-Lessons)

Behavior-triggered micro-lessons tied to user activity. Knowledge base integrated with AI Money Coach.

**Note**: The repository contains an entire LMS (59 routes, 200+ questions, spaced repetition). Do NOT build a second education system. If full education features are desired, repurpose the existing LMS infrastructure. Phase 9 education is limited to contextual micro-lessons within the budget app.

### 9.3 Voice Commands

Web Speech API, hands-free transaction entry, accessibility improvement. Browser-native, no external service.

### 9.4 Self-Hosted Docker Deployment

**Pricing**: $49/year self-hosted tier (from Grok review)

**Why**: Captures the Actual Budget / Firefly III audience who want self-hosting + more features. Actual Budget is $84/yr cloud; our $49/yr self-hosted is compelling.

**Features**:

- Docker Compose one-click deployment
- Bring-your-own Supabase or SQLite local mode
- Auto-updates with opt-out
- Community support via GitHub Discussions

---

## Don't Do List

Items explicitly evaluated and rejected. Revisit only with strong new evidence.

| Item                                      | Reason for Rejection                                                                                                                                                                                                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kids/teen financial literacy module**   | Scope creep — this is essentially building Greenlight/GoHenry. Requires custodial account logic, age-gated UX, parental controls, chore tracking. Defer to post-launch or separate product.                                                                                            |
| **HouseSigma API integration**            | HouseSigma does not have a documented public API. The URL cited in Grok's response (`housesigma.com/api`) appears fabricated. Canadian property tracking should use manual entry.                                                                                                      |
| **Canadian Black Book vehicle tracking**  | Extremely niche — serves only Canadian car owners. The plan already has vehicle tracking via Kelley Blue Book (US). Premature to add a second provider for one country.                                                                                                                |
| **Financial Education Hub (full system)** | The repository already contains an entire LMS with 59 routes, 200+ questions, 11.6h of content, spaced repetition, gamification, video analytics, interactive labs, and mock exams. Building a second education system is redundant. Use contextual micro-lessons (Phase 9.2) instead. |
| **"Built for Canada" product framing**    | Undermines the 114-locale global advantage. Position as "global-first with deep Canadian support." Lead with i18n breadth, showcase Canada as one market among many.                                                                                                                   |
| **Unverified statistics**                 | "70% of Canadians cite tax complexity as budgeting pain" — no source, likely hallucinated. Do not use in marketing or planning without verification.                                                                                                                                   |

---

## Pricing Tiers

| Feature              | Free        | Premium $5.99/mo | Family $11.99/mo | Self-Hosted $49/yr       |
| -------------------- | ----------- | ---------------- | ---------------- | ------------------------ |
| Accounts             | 3           | Unlimited        | Unlimited        | Unlimited                |
| Bank Connections     | 1           | 5                | 10               | N/A (self-managed)       |
| Devices              | 1           | 5                | 10               | Unlimited                |
| Family Members       | 1           | 1                | 6                | Unlimited                |
| API Access           | No          | Yes              | Yes              | Yes                      |
| Investment Tracking  | 1 brokerage | Unlimited        | Unlimited        | Unlimited                |
| Crypto Tracking      | No          | Yes              | Yes              | Yes                      |
| Credit Score         | No          | Yes              | Yes              | No (3rd-party API)       |
| Bill Negotiation     | No          | Yes              | Yes              | No                       |
| Tax Reports          | No          | Yes              | Yes              | Yes                      |
| AI Money Coach       | Basic       | Full             | Full             | Full (bring own API key) |
| Cash Flow Projection | 3 months    | 12 months        | 12 months        | 12 months                |
| Currencies           | 3           | 160+             | 160+             | 160+                     |
| Languages            | All 114     | All 114          | All 114          | All 114                  |
| Travel Mode          | No          | Yes              | Yes              | Yes                      |
| Document Vault       | No          | 1GB              | 5GB              | Unlimited (self-hosted)  |
| Rules Engine         | 3 rules     | Unlimited        | Unlimited        | Unlimited                |
| Priority Support     | No          | Yes              | Yes              | Community only           |

---

## Critical Files to Port (Priority Order)

| File                                            | LOC       | Port Complexity        | Phase |
| ----------------------------------------------- | --------- | ---------------------- | ----- |
| `src/lib/budget-db.ts`                          | 2,293     | Low (Dexie.js)         | 0     |
| `src/types/budget.ts`                           | 658       | Low (pure types)       | 0     |
| `src/lib/encryption/budget-encryption.ts`       | 514       | Low (Web Crypto API)   | 1     |
| `src/lib/encryption/encrypted-db-wrapper.ts`    | 134       | Low                    | 1     |
| `src/lib/sync/sync-engine.ts`                   | 794       | Medium (WebRTC)        | 1     |
| `src/lib/sync/offline-manager.ts`               | 540       | Low                    | 1     |
| `src/lib/simplefin/client.ts`                   | 502       | Low                    | 2     |
| `src/lib/simplefin/sync.ts`                     | 524       | Low                    | 2     |
| `src/lib/analytics/recurring-detector.ts`       | 209       | Low                    | 2     |
| `src/lib/analytics/health-score.ts`             | 666       | Low                    | 3     |
| `src/lib/ai/` (all 17 modules)                  | 9,186     | Low-Medium             | 4     |
| `src/lib/analytics/lstm-predictive-spending.ts` | 478       | Medium (TF.js)         | 4     |
| `src/lib/analytics/trend-forecasting.ts`        | 227       | Low                    | 5     |
| `src/lib/parsers/csv-parser.ts`                 | 2,753     | Low                    | 2     |
| `src/lib/parsers/pdf-ocr-parser.ts`             | 709       | Low                    | 2     |
| `src/contexts/ChatbotContext.tsx`               | ~13KB     | Medium (React context) | 4     |
| `src/i18n/messages/`                            | 114 files | Low (JSON)             | 0     |
| `src/i18n/glossaries/`                          | 16 files  | Low (JSON)             | 0     |

---

## Verification Plan

### Testing Strategy

1. **E2E Encryption**: Verify server cannot decrypt data (test that attempts server-side decryption — must fail)
2. **Sync**: Multi-device conflict resolution tests with vector clock edge cases
3. **Offline**: Full functionality tests with network disabled
4. **Family**: Permission enforcement across all endpoints (positive and negative tests)
5. **API**: Rate limiting, auth, payload validation, scope enforcement
6. **Migration**: Compare feature parity between old Next.js app and new Vite app per phase
7. **Privacy**: Verify new features (gamification, document vault, rules engine) work with E2E encryption

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

- Playwright visual regression tests (port existing infrastructure)
- Cross-browser: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome Android
- Screen readers: NVDA, VoiceOver
- RTL layout verification for Arabic, Hebrew, Farsi, Urdu

---

## Success Metrics

| Metric                         | Target                              |
| ------------------------------ | ----------------------------------- |
| E2E encryption coverage        | 100% of financial data              |
| Offline functionality          | 100% feature parity                 |
| Sync conflict rate             | < 0.1%                              |
| API uptime                     | 99.9%                               |
| Premium conversion             | 5% of free users                    |
| Family plan adoption           | 20% of premium                      |
| Self-hosted adoption           | 5% of total users                   |
| Net worth tracking adoption    | 70% of active users                 |
| Subscription savings per user  | $50+/month average                  |
| Financial wellness score usage | 60% weekly check-in                 |
| AI coach conversations/week    | 3+ per active user                  |
| Safe-to-spend daily views      | 80% of active users                 |
| 90-day retention rate          | 65%+ (vs. industry avg ~40%)        |
| Document vault uploads         | 30% of premium users within 90 days |

---

## API & Technology Appendix

### Investment Tracking

| Option                          | Use Case                  | Cost     | Data                                          |
| ------------------------------- | ------------------------- | -------- | --------------------------------------------- |
| **Plaid Investments** (primary) | Holdings + transactions   | Custom   | 2,400+ institutions, 24mo history, cost basis |
| **MX** (alternative)            | Higher accuracy analytics | Custom   | 10,000+ institutions, 92% accuracy            |
| **SimpleFIN** (budget option)   | Basic tracking            | $15/year | 90-day history, daily updates                 |

### Credit Score

| Option                               | Use Case                  | Cost      |
| ------------------------------------ | ------------------------- | --------- |
| **iSoftpull** (standalone)           | All 3 bureaus, single API | $1-5/pull |
| **Plaid LendScore** (if using Plaid) | Cash flow-based score     | Per-call  |

> FCRA compliance mandatory. Credit Karma model viable only at 50K+ MAU.

### Exchange Rates

| Option                           | Update Frequency | Historical   | Free Tier     |
| -------------------------------- | ---------------- | ------------ | ------------- |
| **Exchange Rates API** (primary) | Every 60 seconds | Yes          | 100 req/month |
| **Fixer.io** (alternative)       | Every 60 seconds | Back to 1999 | Limited       |
| **ExchangeRate-API** (budget)    | Real-time        | 30+ years    | Yes           |

**Architecture**: Store both transaction-date rate and settlement-date rate. Base currency for calculations; display currency user-selectable. Travel mode = temporary base currency override.

### Passkey Authentication

- **Library**: SimpleWebAuthn — TypeScript-first, free
- **Supabase**: No native passkey support — custom WebAuthn routes
- **Browser support**: 95% global coverage
- **Recovery**: Recovery codes (app access) + 24-word mnemonic (E2E data) — keep separate
- **Hardware keys**: YubiKey/Titan as optional backup

---

## Infrastructure & Deployment

### Production Deployment Architecture

```
+---------------------------------------------------------------------+
|                        Production Stack                              |
|                                                                      |
|  +------------------+    +------------------+    +--------------+    |
|  | Cloudflare Pages |    | Cloudflare       |    | Supabase     |    |
|  | (SPA hosting)    |    | Workers (API)    |    | (Database)   |    |
|  |                  |    |                  |    |              |    |
|  | - Vite build     |    | - Hono.js API    |    | - PostgreSQL |    |
|  | - Global CDN     |    | - Auth endpoints |    | - RLS        |    |
|  | - Custom domain  |    | - Stripe webhook |    | - Realtime   |    |
|  | - Free SSL       |    | - Plaid proxy    |    | - Auth       |    |
|  | - Unlimited BW   |    | - AI proxy       |    | - Storage    |    |
|  +------------------+    +------------------+    +--------------+    |
|                                                                      |
|  +------------------+    +------------------+    +--------------+    |
|  | Stripe           |    | Plaid            |    | Anthropic    |    |
|  | (Billing)        |    | (Bank sync)      |    | (AI Coach)   |    |
|  +------------------+    +------------------+    +--------------+    |
|                                                                      |
|  +------------------+    +------------------+    +--------------+    |
|  | PostHog          |    | Sentry           |    | Resend       |    |
|  | (Analytics +     |    | (Error tracking  |    | (Email)      |    |
|  |  Feature Flags)  |    |  + Performance)  |    |              |    |
|  +------------------+    +------------------+    +--------------+    |
+---------------------------------------------------------------------+
```

### Self-Hosted Architecture (Docker Compose)

```
+----------------------------------------------------------+
| Docker Compose (single VPS / home server)                |
|                                                          |
|  +----------+  +------------+  +--------------+          |
|  | Nginx    |  | Hono API   |  | PostgreSQL   |          |
|  | (reverse |  | (Node.js)  |  | (local)      |          |
|  |  proxy)  |  |            |  |              |          |
|  +----------+  +------------+  +--------------+          |
|                                                          |
|  +----------+  +------------+                            |
|  | Supabase |  | Redis      |                            |
|  | (self-   |  | (sessions  |                            |
|  |  hosted) |  |  + cache)  |                            |
|  +----------+  +------------+                            |
+----------------------------------------------------------+
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "22" }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration

  visual-regression:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:visual
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: snyk/actions/node@master
        env: { SNYK_TOKEN: "${{ secrets.SNYK_TOKEN }}" }

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: [lint-and-test, visual-regression]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: cloudflare/wrangler-action@v3
        with: { command: "pages deploy dist --project-name=budget-app-preview" }

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [lint-and-test, visual-regression, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: cloudflare/wrangler-action@v3
        with: { command: "pages deploy dist --project-name=budget-app" }
      - run: cd api && npx wrangler deploy # Deploy API workers
      - uses: supabase/setup-cli@v1
      - run: supabase db push --linked # Run migrations
```

### Database Migration Workflow (Supabase CLI)

```bash
supabase migration new add_family_groups   # Create migration
supabase db reset                          # Test locally
supabase db push --linked --target staging # Push to staging
supabase db push --linked                  # Push to production
```

**Rules**: Never manual SQL in production. Always migration files. PR review includes migration review. Rollback = reverse migration.

### Feature Flags (PostHog)

PostHog provides feature flags + A/B testing in one platform (already used for analytics).

```typescript
// lib/feature-flags.ts
export const FeatureFlags = {
  AI_COACH_ENABLED: "ai-coach-enabled",
  PASSKEY_AUTH: "passkey-auth",
  FAMILY_SHARING: "family-sharing",
  MONTE_CARLO: "monte-carlo-projection",
  DOCUMENT_VAULT: "document-vault",
  RULES_ENGINE: "rules-engine",
  CREDIT_SCORE: "credit-score",
  SWIPE_REVIEW: "swipe-review",
} as const;
```

**Rollout strategy**: Internal (team-only) -> Beta (5% premium) -> Wider beta (25%) -> GA (100%) -> Remove flag.

### Monitoring Stack

**PostHog** (product analytics, feature flags, A/B tests) + **Sentry** (error tracking, performance monitoring)

#### Sentry Configuration (Privacy-First)

```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true, // PRIVACY: mask all text in replays
      maskAllInputs: true, // PRIVACY: mask all inputs
      blockAllMedia: true, // PRIVACY: block all media
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.5,
  beforeSend(event) {
    // CRITICAL: Strip financial data from error reports
    if (event.extra) {
      delete event.extra.transactions;
      delete event.extra.balances;
      delete event.extra.accounts;
    }
    return event;
  },
});
```

#### PostHog Configuration (Privacy-First)

```typescript
posthog.init(key, {
  person_profiles: "identified_only", // Only track signed-in users
  autocapture: false, // No automatic click tracking
  disable_session_recording: true, // No session recording by default
  sanitize_properties: (props) => {
    delete props.amount;
    delete props.balance;
    return props;
  },
});
```

#### Alerting Rules

| Alert               | Condition          | Channel           | Severity |
| ------------------- | ------------------ | ----------------- | -------- |
| Error rate spike    | >5% in 5 min       | PagerDuty + Slack | P1       |
| Sync failures       | >1% in 15 min      | Slack             | P2       |
| API latency         | P95 > 2s for 5 min | Slack             | P2       |
| Deploy failure      | CI fails on main   | Slack + email     | P1       |
| Stripe webhook fail | 3 consecutive      | PagerDuty         | P1       |
| DB connection pool  | >80% utilization   | Slack             | P2       |
| SSL cert expiry     | <14 days           | Email             | P3       |

### Environment Management

| Environment    | Purpose       | Infra              | Database            |
| -------------- | ------------- | ------------------ | ------------------- |
| **local**      | Development   | Vite dev server    | Local Supabase      |
| **preview**    | PR review     | CF Pages preview   | Supabase branch     |
| **staging**    | Pre-prod test | CF Pages staging   | Supabase staging    |
| **production** | Live users    | CF Pages + Workers | Supabase production |

### Security Infrastructure

| Layer          | Implementation                       |
| -------------- | ------------------------------------ |
| Transport      | TLS 1.3 (Cloudflare)                 |
| Authentication | Supabase Auth + WebAuthn passkeys    |
| Authorization  | Supabase RLS per table               |
| Secrets        | CF Workers secrets (API keys)        |
| Dependencies   | Snyk in CI + Dependabot              |
| CSP            | Content Security Policy via CF Rules |
| Rate limiting  | CF WAF + Hono rate limiter           |
| CORS           | Strict origin allowlist              |
| Audit trail    | admin actions -> audit_log table     |

### Cost Estimates (Monthly)

| Service            | Free Tier         | 10K users | 100K users   |
| ------------------ | ----------------- | --------- | ------------ |
| Cloudflare Pages   | Free              | Free      | Free         |
| Cloudflare Workers | 100K req/day free | $5        | $25          |
| Supabase           | 50K MAU free      | $25 (Pro) | $599 (Team)  |
| Stripe             | 2.9% + 30c/txn    | ~$180     | ~$1,800      |
| Plaid              | 100 items free    | ~$500     | ~$5,000      |
| Sentry             | 5K errors free    | $26       | $80          |
| PostHog            | 1M events free    | Free      | $450         |
| Resend             | 3K emails free    | $20       | $50          |
| Anthropic          | Pay-per-use       | ~$200     | ~$2,000      |
| **Total**          | **$0**            | **~$960** | **~$10,000** |

**Revenue projections**: 10K users at 5% premium ($5.99/mo) = $2,995/mo. 100K users = $29,950/mo. Healthy margins at both scales.

---

## Component Migration Map (shadcn/ui -> Mantine)

| shadcn Component | Mantine Equivalent             | Notes                                    |
| ---------------- | ------------------------------ | ---------------------------------------- |
| Accordion        | Accordion                      | Direct                                   |
| Alert            | Alert                          | Direct                                   |
| AlertDialog      | Modal (confirm)                | `modals.openConfirmModal()`              |
| Avatar           | Avatar                         | Direct                                   |
| Badge            | Badge                          | Direct                                   |
| Button           | Button                         | CVA variants -> `variant` prop           |
| Calendar         | DatePicker                     | `@mantine/dates`                         |
| Card             | Card / Paper                   | Paper for simple, Card for structured    |
| Carousel         | Carousel                       | `@mantine/carousel` (same Embla engine)  |
| Chart            | Recharts (keep)                | Framework-agnostic, no migration         |
| Checkbox         | Checkbox                       | Direct                                   |
| Collapsible      | Collapse                       | Direct                                   |
| Combobox         | Combobox / Select (searchable) | Built-in searchable                      |
| Command (Cmd+K)  | Spotlight                      | `@mantine/spotlight`                     |
| ContextMenu      | Menu (right-click)             | Menu with trigger                        |
| DataTable        | Table + @tanstack/react-table  | Keep TanStack, wrap in Mantine           |
| DatePicker       | DatePickerInput                | `@mantine/dates`                         |
| Dialog           | Modal                          | Direct                                   |
| Drawer           | Drawer                         | Direct                                   |
| DropdownMenu     | Menu                           | Direct                                   |
| Form             | useForm (@mantine/form)        | Or keep react-hook-form                  |
| HoverCard        | HoverCard                      | Direct                                   |
| Input            | TextInput                      | Built-in label/error                     |
| NavigationMenu   | NavLink                        | Nested children support                  |
| Pagination       | Pagination                     | Direct                                   |
| Popover          | Popover                        | Direct                                   |
| Progress         | Progress / RingProgress        | Both available                           |
| RadioGroup       | Radio.Group                    | Direct                                   |
| ScrollArea       | ScrollArea                     | Direct                                   |
| Select           | Select                         | Direct with search                       |
| Separator        | Divider                        | Direct                                   |
| Sheet            | Drawer                         | Sheet = Drawer                           |
| Skeleton         | Skeleton                       | Direct                                   |
| Slider           | Slider                         | Direct                                   |
| Switch           | Switch                         | Direct                                   |
| Table            | Table                          | Direct                                   |
| Tabs             | Tabs                           | Direct                                   |
| Textarea         | Textarea                       | Direct                                   |
| Toast            | Notifications                  | `@mantine/notifications` (more powerful) |
| Tooltip          | Tooltip                        | Direct                                   |

**Custom components** (not in Mantine, need Framer Motion): 3d-card, animated-testimonials, background-beams, bento-grid, floating-navbar, hero-parallax, infinite-moving-cards, meteors, sparkles, text-generate-effect (all landing page / decorative only).

---

## API Layer Migration (Next.js API -> Hono.js)

| Next.js Route                | Hono Equivalent                | Handler                   |
| ---------------------------- | ------------------------------ | ------------------------- |
| `api/import/analyze-columns` | `POST /api/import/columns`     | analyzeColumns            |
| `api/import/analyze-error`   | `POST /api/import/error`       | analyzeImportError        |
| `api/bank/detect`            | `POST /api/bank/detect`        | detectBankFormat          |
| `api/chat`                   | `POST /api/chat`               | aiChatHandler             |
| `api/calendar/ics`           | `GET /api/calendar/ics`        | generateICS               |
| `api/merchants/resolve`      | `POST /api/merchants/resolve`  | resolveMerchant           |
| `api/merchants/feedback`     | `POST /api/merchants/feedback` | merchantFeedback          |
| `api/email/send`             | `POST /api/email/send`         | sendEmail                 |
| `api/email/unsubscribe`      | `GET /api/email/unsubscribe`   | handleUnsubscribe         |
| **(NEW)** auth/passkey/\*    | `POST /api/auth/passkey/*`     | Passkey registration/auth |
| **(NEW)** stripe/webhook     | `POST /api/stripe/webhook`     | Stripe handler            |
| **(NEW)** sync/\*            | `POST /api/sync/*`             | Cloud sync                |
| **(NEW)** plaid/\*           | `POST /api/plaid/*`            | Plaid Link/webhook        |
| **(NEW)** family/\*          | `POST /api/family/*`           | Family groups             |

**Hono architecture outline**:

```typescript
// api/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";

const app = new Hono();
app.use("/api/*", cors());
app.use("/api/*", jwt({ secret: env.JWT_SECRET }));
app.route("/api/auth", authRoutes);
app.route("/api/sync", syncRoutes);
app.route("/api/import", importRoutes);
app.route("/api/chat", chatRoutes);
app.route("/api/stripe", stripeRoutes);
app.route("/api/plaid", plaidRoutes);
app.route("/api/family", familyRoutes);
app.route("/api/merchants", merchantRoutes);
export default app;
```

---

## Updated Competitor Intelligence (Feb 2026 Addendum)

### PocketGuard Pricing Collapse

- **Old**: Free tier, $34.99/yr premium
- **New (2026)**: No free tier, $74.99/yr ($12.99/mo)
- **Action**: Target PocketGuard refugees with our free tier + $5.99/mo premium (54% cheaper)

### EveryDollar Relaunch (January 2026)

- **Margin Finder**: $3,015 avg overspending identified in 15 minutes
- **Live group coaching**: Dave Ramsey methodology groups ($17.99/mo)
- **Daily micro-lessons**: Contextual financial education
- **Our response**: Phase 4 Margin Finder + AI Coach covers same ground privately

### Monarch Money UI Intelligence

- **607 UI screens** catalogued (NicelyDone design reference)
- Independent web + mobile dashboard customization
- Monthly review swipe-through for cash flow insights
- Investment tracking still limited (no allocation view)
- **Insight**: Monarch's success is from polish, not features. Our UI must match quality.

---

## Sources

Competitive research data sourced from `Plans/BUDGET_APP_COMPLETE_IMPLEMENTATION_PLAN.md` (see Sources section in that document for full URL list).

Codebase statistics verified against live repository on 2026-02-05.

### Additional Sources (v2.0 Expansion)

- [PocketGuard Pricing 2026](https://pocketguard.com/pricing/)
- [EveryDollar Review 2026 - NerdWallet](https://www.nerdwallet.com/finance/learn/everydollar-app-review)
- [Monarch UI Screens - NicelyDone](https://nicelydone.club/apps/monarch)
- [Mantine v7 Changelog](https://mantine.dev/changelog/7-0-0/)
- [Mantine Theme Object](https://mantine.dev/theming/theme-object/)
- [Supabase CI/CD Docs](https://supabase.com/docs/guides/deployment)
- [PostHog vs Sentry](https://posthog.com/blog/posthog-vs-sentry)
- [Cloudflare Pages Vite Deploy](https://vite.dev/guide/static-deploy)
- [Hono + React + Vite + Cloudflare](https://github.com/ARAldhafeeri/hono-react-vite-cloudflare)
- [Supabase Stripe Sync](https://supabase.com/)
