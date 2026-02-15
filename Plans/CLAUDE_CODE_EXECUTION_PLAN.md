# Budget App Online Version — Claude Code CLI Execution Plan

**Version**: 3.0 | **Date**: 2026-02-09 | **Status**: Ready to Execute
**Source Documents**: `BUDGET_APP_AUTHORITATIVE_PLAN.md` (v2.0) + Competitive Gap Analysis (Feb 2026)

---

## Companion Documents

| Document | Purpose |
|----------|---------|
| **This file** | Feature specs, data models, acceptance criteria — WHAT to build |
| **`UI_UX_CROSS_PLATFORM_ADDENDUM.md`** | Layouts, animations, mobile patterns, platform rules — HOW it should look and feel |

⚠️ **CRITICAL**: Read `UI_UX_CROSS_PLATFORM_ADDENDUM.md` before building ANY component. It contains mobile-first layouts, touch targets, animation tokens, iOS/Android PWA requirements, empty states, loading skeletons, and accessibility rules that apply to every single screen. Without it, the app will feel like a desktop web app crammed onto a phone.

---

## How to Use This File

This document is designed for **Claude Code CLI** execution. Each phase is self-contained with:
- **Context**: Why this feature matters competitively
- **Files to create/modify**: Exact paths and module names
- **Implementation spec**: What to build, data structures, logic
- **Acceptance criteria**: How to verify it works
- **Dependencies**: What must exist before this can start

**Execution pattern**: Feed this file to Claude Code with `claude --file CLAUDE_CODE_EXECUTION_PLAN.md` or reference it as project context. Work through phases sequentially. Within each phase, features marked `[PARALLEL]` can be built simultaneously.

---

## Tech Stack Reference

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + Vite 7.x + TypeScript 5.9 | SPA, offline-first |
| UI Framework | Mantine v7 | Replaces shadcn/ui + Tailwind |
| Routing | React Router v7 or TanStack Router | Replaces Next.js App Router |
| State | Zustand or Jotai | Lightweight, TypeScript-first |
| Local DB | IndexedDB via Dexie.js | All financial data lives here |
| Cloud DB | Supabase (PostgreSQL) | Only encrypted blobs + metadata |
| API | Hono.js on Cloudflare Workers | Replaces Next.js API routes |
| Auth | Supabase Auth + SimpleWebAuthn | Passkey-first |
| Payments | Stripe | Subscription billing |
| Bank Sync | Plaid (primary) + SimpleFIN (budget) | E2E encrypted credentials |
| AI | Anthropic Claude API + TensorFlow.js (local) | Privacy-first AI |
| Hosting | Cloudflare Pages (SPA) + Workers (API) | Global CDN, free tier |
| Monitoring | PostHog (analytics) + Sentry (errors) | Privacy-safe config |
| Email | Resend | Transactional + weekly recaps |
| Charts | Recharts | Framework-agnostic, carries forward |
| Animations | Framer Motion | Micro-interactions, page transitions |
| i18n | react-intl or custom | Port 114 locale files + 16 glossaries |

---

## Portable Code from Existing Codebase (~27K LOC)

These modules port directly with zero or minimal changes:

```
src/lib/encryption/budget-encryption.ts    (514 LOC)  → lib/encryption/
src/lib/encryption/encrypted-db-wrapper.ts (134 LOC)  → lib/encryption/
src/lib/sync/sync-engine.ts               (794 LOC)  → lib/sync/
src/lib/sync/offline-manager.ts           (540 LOC)  → lib/sync/
src/lib/simplefin/client.ts               (502 LOC)  → lib/simplefin/
src/lib/simplefin/sync.ts                 (524 LOC)  → lib/simplefin/
src/lib/analytics/recurring-detector.ts   (209 LOC)  → lib/analytics/
src/lib/analytics/health-score.ts         (666 LOC)  → lib/analytics/
src/lib/analytics/trend-forecasting.ts    (227 LOC)  → lib/analytics/
src/lib/analytics/lstm-predictive-spending.ts (478 LOC) → lib/analytics/
src/lib/analytics/weekly-insights.ts      (706 LOC)  → lib/analytics/
src/lib/analytics/overspending-detector.ts (159 LOC) → lib/analytics/
src/lib/ai/ (17 modules)                  (9,186 LOC) → lib/ai/
src/lib/parsers/csv-parser.ts             (2,753 LOC) → lib/parsers/
src/lib/parsers/pdf-ocr-parser.ts         (709 LOC)  → lib/parsers/
src/lib/categorization/                   (902 LOC)  → lib/categorization/
src/lib/budget-db.ts                      (2,293 LOC) → lib/budget-db.ts
src/types/budget.ts                       (658 LOC)  → types/budget.ts
src/types/                                (895 LOC)  → types/
src/i18n/messages/ (114 files)                       → i18n/messages/
src/i18n/glossaries/ (16 files)                      → i18n/glossaries/
src/lib/collective-learning-service.ts    (553 LOC)  → lib/ai/
src/contexts/ChatbotContext.tsx           (~13KB)    → contexts/ (needs React adaptation)
```

---

## Pre-Phase 0: Project Scaffolding & Migration

### Context
New React + Vite + Mantine application. The existing Next.js 16 app (286K LOC) stays as the offline version. This is a clean build carrying forward ~27K LOC of business logic.

### 0.1 Project Initialization

**Create**:
```
budget-app-online/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker stub
│   ├── icons/                 # PWA icons (192x192, 512x512, maskable, apple-touch-icon-180)
│   ├── splash/                # iOS splash screens (all device sizes)
│   └── favicon.svg
├── src/
│   ├── main.tsx               # App entry
│   ├── App.tsx                # Root with providers
│   ├── router.tsx             # Route definitions
│   ├── vite-env.d.ts
│   ├── components/            # Mantine-based UI components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx   # Mantine AppShell (sidebar + header + content)
│   │   │   ├── Sidebar.tsx    # Navigation sidebar (desktop) / bottom tabs (mobile)
│   │   │   ├── Header.tsx     # Logo, privacy toggle, search, user menu
│   │   │   └── Footer.tsx     # Version, sync status, encryption indicator
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── budget/
│   │   ├── accounts/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── onboarding/
│   │   └── shared/            # Reusable components (currency display, category picker, etc.)
│   ├── lib/                   # Ported business logic (27K LOC)
│   │   ├── encryption/
│   │   ├── sync/
│   │   ├── ai/
│   │   ├── analytics/
│   │   ├── parsers/
│   │   ├── categorization/
│   │   ├── budget/            # NEW: budget engine, methodology, safe-to-spend
│   │   ├── currency/          # NEW: multi-currency engine
│   │   ├── auth/              # NEW: passkey auth, key derivation
│   │   ├── plaid/             # NEW: bank sync
│   │   ├── stripe/            # NEW: billing
│   │   ├── subscriptions/     # NEW: subscription detection
│   │   ├── family/            # NEW: family sharing
│   │   └── notifications/     # NEW: push notifications
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── PrivacyContext.tsx
│   │   ├── SyncContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── SeniorsModeContext.tsx  # Port from existing 8KB context
│   │   └── BudgetContext.tsx
│   ├── hooks/                 # Custom hooks
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript types (port existing)
│   ├── i18n/                  # Port 114 locales + 16 glossaries
│   │   ├── messages/
│   │   ├── glossaries/
│   │   └── utils/
│   └── theme/
│       └── budget-theme.ts    # Mantine custom theme ("Cyber-Soft")
├── api/                       # Hono.js API (Cloudflare Workers)
│   ├── src/
│   │   ├── index.ts           # Hono app entry
│   │   ├── routes/
│   │   │   ├── auth.ts        # Passkey registration/authentication
│   │   │   ├── sync.ts        # Cloud sync endpoints
│   │   │   ├── stripe.ts      # Stripe webhooks
│   │   │   ├── plaid.ts       # Plaid Link/webhooks
│   │   │   ├── family.ts      # Family group management
│   │   │   ├── import.ts      # CSV/OFX import analysis
│   │   │   ├── merchants.ts   # Merchant resolution
│   │   │   ├── email.ts       # Email send/unsubscribe
│   │   │   └── ai.ts          # AI coach proxy
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT/passkey verification
│   │   │   └── rate-limit.ts
│   │   └── lib/               # Server-side utilities
│   └── wrangler.toml          # Cloudflare Workers config
├── supabase/
│   └── migrations/            # Database migrations
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                   # Playwright
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD pipeline
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

### 0.2 Mantine Theme ("Cyber-Soft")

**Create**: `src/theme/budget-theme.ts`

> ⚠️ See `UI_UX_CROSS_PLATFORM_ADDENDUM.md` Section 7 for full dark/light color mapping and Section 6 for animation token definitions. Both must be embedded in the theme.

```typescript
import { createTheme, MantineColorsTuple } from '@mantine/core';

const income: MantineColorsTuple = [
  '#E3F8FF','#B5ECFF','#7DDBFF','#45C8FF','#1AB5FF',
  '#0099E6','#007ACC','#005C99','#003D66','#001F33'
];
const expense: MantineColorsTuple = [
  '#FFE3F0','#FFB5D4','#FF7DB5','#FF4596','#FF1A7A',
  '#E6005E','#CC0052','#990040','#66002B','#330015'
];
const savings: MantineColorsTuple = [
  '#E3FFF0','#B5FFD9','#7DFFBE','#45FFA3','#1AFF88',
  '#00E66E','#00CC62','#009949','#006631','#003318'
];

export const budgetTheme = createTheme({
  primaryColor: 'teal',
  colors: { income, expense, savings },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
  defaultRadius: 'md',
  cursorType: 'pointer',
  respectReducedMotion: true,
  other: {
    seniorsFontMultiplier: 1.0,      // 1.25 in Seniors Mode
    seniorsMinTouchTarget: '52px',
  },
});
```

**Typography scale**: Inter for UI (16px body, 28px titles), JetBrains Mono for currency values.
**Dark mode**: Primary mode. Deep charcoals (#1A1B1E bg, #25262B surfaces). See authoritative plan lines 423-437 for full dark/light color table.

### 0.3 Core Route Structure

**Create**: `src/router.tsx`

> ⚠️ Every route must have: mobile layout (375px+), tablet layout (768px+), desktop layout (992px+), loading skeleton, empty state, and error state. See `UI_UX_CROSS_PLATFORM_ADDENDUM.md` Section 2 for platform-specific layouts.

Define these routes (mapped from existing 36 Next.js page routes):

```
/                          → Dashboard (safe-to-spend, bills, recent transactions)
/accounts                  → Account list & balances
/accounts/:id              → Account detail
/transactions              → Transaction list (filterable, searchable)
/transactions/:id          → Transaction detail/edit
/budget                    → Budget overview (methodology-aware)
/budget/create             → Create/edit budget categories
/reports                   → Reports hub (spending, income, trends)
/reports/spending          → Spending breakdown
/reports/income            → Income analysis
/reports/trends            → Trend charts
/reports/net-worth         → Net worth dashboard
/goals                     → Savings goals
/goals/:id                 → Goal detail
/subscriptions             → Subscription manager
/investments               → Investment portfolio
/import                    → CSV/OFX import wizard
/import/scan               → Receipt scanner (OCR)
/loans                     → Loan tracking
/calculators               → Financial calculators
/settings                  → App settings
/settings/categories       → Category management (with emoji)
/settings/accounts         → Account management
/settings/family           → Family sharing settings
/settings/notifications    → Notification preferences
/settings/privacy          → Privacy & security
/settings/export           → Data export
/settings/methodology      → Budget method switcher
/onboarding                → First-time setup wizard
/onboarding/methodology    → Budget method quiz
/ai-coach                  → AI Money Coach chat
/vault                     → Document vault (Phase 6)
/tax                       → Tax tools (Phase 7)
```

### 0.4 Port Business Logic

**Action**: Copy the 27K LOC of portable modules from the existing codebase into `src/lib/`, `src/types/`, and `src/i18n/`. Verify each module compiles standalone (no Next.js, no shadcn, no Tailwind imports). Fix any framework-specific imports.

**Acceptance criteria**:
- [ ] `npm run type-check` passes with all ported modules
- [ ] All 114 locale files load correctly
- [ ] Dexie.js IndexedDB schema initializes in browser
- [ ] Encryption module encrypts/decrypts a test payload
- [ ] CSV parser processes a sample Canadian bank CSV

### 0.5 Port Seniors Mode Context

**Port**: `src/contexts/SeniorsModeContext.tsx` (8KB from existing codebase)

This provides: font size multiplier (1.0 default, 1.25 seniors), enlarged touch targets, simplified navigation, high contrast mode. Available from Phase 1 as a setting toggle.

**Acceptance criteria**:
- [ ] Toggle in settings changes font sizes globally
- [ ] Touch targets meet 52px minimum in seniors mode
- [ ] All interactive elements remain accessible

---

## Phase 1: Foundation — MVP

**Goal**: Launchable product with E2E encryption, cloud sync, authentication, safe-to-spend, budget methodologies with rollover, multi-currency, onboarding, and basic PWA.

### 1.1 E2E Encryption Architecture

**Port & extend**: `src/lib/encryption/budget-encryption.ts` (514 LOC)

**Create**:
- `lib/auth/key-derivation.ts` — PBKDF2: password → master key → device keys
- `lib/auth/recovery-key.ts` — BIP39-style 24-word mnemonic generation
- `lib/encryption/cloud-encryption.ts` — Encrypt before cloud upload, decrypt after download

**Key derivation flow**:
```
User Password ──PBKDF2 (600K iterations, SHA-256)──▶ Master Key (never leaves device)
                                                          │
                                                ┌─────────┴─────────┐
                                                ▼                   ▼
                                          Device Key A         Device Key B
                                          (Browser)            (Mobile)
```

**Recovery**: 24-word mnemonic phrase (BIP39 wordlist). Stored by user offline. Separate from passkey recovery codes (passkey recovery = app access, mnemonic = data decryption).

**Security requirements**:
- AES-256-GCM for all financial data encryption
- Master key never transmitted — only encrypted data leaves device
- Server stores opaque blobs — zero-knowledge architecture
- IV (initialization vector) unique per encryption operation
- Publish threat model before launch

**Acceptance criteria**:
- [ ] Encrypt a transaction object → encrypted blob is indistinguishable from random data
- [ ] Decrypt with correct key → original transaction restored exactly
- [ ] Decrypt with wrong key → fails with clear error
- [ ] Server-side test: attempt to read `encrypted_payload` column → only sees binary blob
- [ ] Recovery: 24-word mnemonic restores master key on new device

---

### 1.2 Cloud Database Schema (Supabase)

**Create**: `supabase/migrations/001_initial_schema.sql`

```sql
-- User accounts (minimal metadata, NOT financial data)
CREATE TABLE cloud_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'family', 'self_hosted')),
  locale TEXT DEFAULT 'en-US',
  timezone TEXT DEFAULT 'UTC',
  base_currency TEXT DEFAULT 'CAD',
  budget_methodology TEXT DEFAULT 'zero_based' CHECK (budget_methodology IN ('zero_based', 'envelope', 'fifty_thirty_twenty', 'pay_yourself_first')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  seniors_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device registration for E2E key exchange
CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cloud_users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  public_key TEXT NOT NULL,
  device_type TEXT, -- 'browser', 'mobile', 'desktop'
  trusted BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALL financial data stored as encrypted blobs (zero-knowledge)
CREATE TABLE encrypted_budget_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cloud_users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES user_devices(id),
  encrypted_payload BYTEA NOT NULL,        -- AES-256-GCM encrypted
  encryption_iv BYTEA NOT NULL,            -- Unique per operation
  entity_type TEXT NOT NULL,               -- 'transaction', 'account', 'budget', 'category', 'goal', 'subscription', 'rule'
  entity_id TEXT NOT NULL,                 -- Local IndexedDB ID
  vector_clock JSONB NOT NULL DEFAULT '{}', -- For conflict resolution
  is_deleted BOOLEAN DEFAULT FALSE,        -- Soft delete for sync
  server_created_at TIMESTAMPTZ DEFAULT NOW(),
  server_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync coordination
CREATE TABLE sync_state (
  user_id UUID REFERENCES cloud_users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES user_devices(id) ON DELETE CASCADE,
  last_sync_at TIMESTAMPTZ,
  vector_clock JSONB NOT NULL DEFAULT '{}',
  sync_status TEXT DEFAULT 'idle', -- 'idle', 'syncing', 'error'
  PRIMARY KEY (user_id, device_id)
);

-- Passkey credentials (WebAuthn)
CREATE TABLE passkey_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cloud_users(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  public_key BYTEA NOT NULL,
  counter BIGINT DEFAULT 0,
  device_type TEXT, -- 'platform', 'cross-platform'
  transports TEXT[], -- 'usb', 'ble', 'nfc', 'internal', 'hybrid'
  backed_up BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Stripe subscription tracking
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cloud_users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'trialing'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank connections (credentials E2E encrypted)
CREATE TABLE bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cloud_users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'plaid', 'simplefin'
  encrypted_credentials BYTEA, -- E2E encrypted access tokens
  encryption_iv BYTEA,
  institution_name TEXT,
  institution_id TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'error', 'disconnected', 'pending_reauth'
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family groups
CREATE TABLE family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES cloud_users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES cloud_users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer', 'child')),
  permissions JSONB DEFAULT '["view_own", "edit_own"]',
  can_see_all_accounts BOOLEAN DEFAULT FALSE,
  visible_accounts UUID[] DEFAULT '{}',
  spending_limit NUMERIC,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Webhook registrations (Phase 6)
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cloud_users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cloud_users(id),
  family_id UUID REFERENCES family_groups(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE cloud_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_budget_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_own_data ON cloud_users FOR ALL USING (id = auth.uid());
CREATE POLICY devices_own_data ON user_devices FOR ALL USING (user_id = auth.uid());
CREATE POLICY budget_own_data ON encrypted_budget_data FOR ALL USING (user_id = auth.uid());
CREATE POLICY sync_own_data ON sync_state FOR ALL USING (user_id = auth.uid());
CREATE POLICY subs_own_data ON subscriptions FOR ALL USING (user_id = auth.uid());
CREATE POLICY bank_own_data ON bank_connections FOR ALL USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_budget_data_user_type ON encrypted_budget_data(user_id, entity_type);
CREATE INDEX idx_budget_data_updated ON encrypted_budget_data(server_updated_at);
CREATE INDEX idx_sync_state_user ON sync_state(user_id);
CREATE INDEX idx_bank_connections_user ON bank_connections(user_id);
```

**Acceptance criteria**:
- [ ] `supabase db reset` runs cleanly
- [ ] RLS policies prevent cross-user data access
- [ ] Encrypted payload column stores binary, not readable text

---

### 1.3 Cloud Sync Engine

**Port**: `src/lib/sync/sync-engine.ts` (794 LOC) — vector clocks, conflict resolution
**Port**: `src/lib/sync/offline-manager.ts` (540 LOC) — offline queue

**Create**:
- `lib/sync/cloud-sync-engine.ts` — Orchestration (encrypt → queue → push → receive → decrypt → merge)
- `lib/sync/cloud-transport.ts` — Supabase Realtime transport layer
- `lib/sync/encrypted-payload.ts` — Encrypt entity before cloud, decrypt after
- `lib/sync/conflict-resolver.ts` — Vector clock comparison, last-write-wins with user override option
- `contexts/SyncContext.tsx` — React context exposing sync status, last sync time, manual sync trigger

**Sync flow**:
1. Local change in IndexedDB → encrypt entity → add to outbound queue
2. When online → push encrypted blobs to Supabase `encrypted_budget_data` table
3. Supabase Realtime channel → notify other devices of new data
4. Other devices → pull new blobs → decrypt → merge with local IndexedDB using vector clocks
5. Conflict → show user both versions, let them choose (or auto-resolve with LWW)

**Sync health logging**: Every sync attempt logged with status, duration, entities synced, errors. Exposed in Settings > Sync Status.

**Acceptance criteria**:
- [ ] Create transaction on Device A → appears on Device B within 5 seconds
- [ ] Create transaction offline → comes online → syncs automatically
- [ ] Concurrent edits on two devices → conflict detected → user can choose winner
- [ ] Sync latency < 2 seconds for normal operations
- [ ] Sync health dashboard shows last sync time, status, and error details

---

### 1.4 Passkey Authentication [PARALLEL]

**Library**: `@simplewebauthn/server` + `@simplewebauthn/browser`

**Create**:
- `lib/auth/passkey-auth.ts` — WebAuthn registration & authentication flows
- `lib/auth/passkey-recovery.ts` — Recovery code generation (8 codes, each single-use)
- `api/src/routes/auth.ts` — Server endpoints: `/register-options`, `/register-verify`, `/login-options`, `/login-verify`
- `components/auth/PasskeySetup.tsx` — Enrollment UI with biometric prompt
- `components/auth/LoginScreen.tsx` — Passkey login with fallback to recovery code
- `components/auth/RecoverySetup.tsx` — Display and confirm recovery codes

**Important**: Passkey recovery codes (for app access) are SEPARATE from the 24-word mnemonic (for E2E data decryption). Users must save both.

**Acceptance criteria**:
- [ ] Register passkey on Chrome, Firefox, Safari
- [ ] Login with Face ID / Touch ID / Windows Hello
- [ ] Hardware security key (YubiKey) works as backup
- [ ] Recovery code successfully grants app access when passkey unavailable
- [ ] 24-word mnemonic restores encryption keys on new device

---

### 1.5 Subscription & Billing (Stripe) [PARALLEL]

**Create**:
- `lib/stripe/subscription-manager.ts` — Create/update/cancel subscriptions
- `api/src/routes/stripe.ts` — Webhook handler for subscription events
- `components/settings/BillingSettings.tsx` — Plan selection, payment method, invoice history

**Pricing tiers**:

| Feature | Free | Premium $5.99/mo | Family $11.99/mo | Self-Hosted $49/yr |
|---------|------|-------------------|-------------------|--------------------|
| Accounts | 3 | Unlimited | Unlimited | Unlimited |
| Bank Connections | 1 | 5 | 10 | N/A |
| Devices | 1 | 5 | 10 | Unlimited |
| Family Members | 1 | 1 | 6 | Unlimited |
| Currencies | 3 | 160+ | 160+ | 160+ |
| Languages | All 114 | All 114 | All 114 | All 114 |
| AI Money Coach | Basic | Full | Full | Full (BYOK) |
| Cash Flow Projection | 3 months | 12 months | 12 months | 12 months |
| Document Vault | No | 1GB | 5GB | Unlimited |
| Rules Engine | 3 rules | Unlimited | Unlimited | Unlimited |

**Acceptance criteria**:
- [ ] Stripe Checkout opens for plan upgrade
- [ ] Webhook correctly updates `subscriptions` table on payment
- [ ] Downgrade to free tier enforces limits (max 3 accounts)
- [ ] Cancel at period end works correctly

---

### 1.6 Safe-to-Spend Engine

**Create**:
- `lib/budget/safe-to-spend.ts` — Core calculation engine
- `components/dashboard/SafeToSpendWidget.tsx` — Mantine RingProgress with drill-down

**Core calculation**:
```
Safe to Spend = (Available Balance)
              - (Upcoming Bills in look-ahead period)
              - (Savings Goal contributions due)
              - (Reserved for active budget categories)
```

**Features**:
- Real-time recalculation on every transaction or budget change
- Configurable look-ahead period: 7 / 14 / 30 days
- Color-coded: Green (≥30% of income remaining), Yellow (10-30%), Red (<10%)
- Center display: Large JetBrains Mono currency with privacy blur CSS class
- Click any segment → Drawer showing breakdown of what's reserved and why
- **Per-category "remaining" view** (the "Partials" / "In My Pocket" concept): Each variable budget category shows a mini progress bar with spent/remaining. This appears below the ring chart as a scrollable list.

**Widget spec** (Mantine RingProgress):
```typescript
interface SafeToSpendProps {
  available: number;
  budgeted: number;
  upcomingBills: number;
  totalBalance: number;
  lookAheadDays: 7 | 14 | 30;
  currency: string;
  locale: string;
  categoryBreakdown: Array<{
    name: string;
    emoji: string;
    spent: number;
    budgeted: number;
    remaining: number;
    percentUsed: number; // For progress bar color
  }>;
}
```

**Acceptance criteria**:
- [ ] Widget shows correct safe-to-spend amount
- [ ] Changing look-ahead period recalculates immediately
- [ ] Adding a transaction updates the widget in real-time
- [ ] Per-category progress bars show green/yellow/red accurately
- [ ] Privacy toggle blurs all currency values
- [ ] 80% daily view target: widget is the first thing users see on dashboard

---

### 1.7 Budget Methodology Engine with Rollover

**Create**:
- `lib/budget/methodology-engine.ts` — Core methodology logic
- `lib/budget/rollover-engine.ts` — Budget carry-over logic
- `lib/budget/event-budget.ts` — Event/project budget engine
- `components/onboarding/MethodologyQuiz.tsx` — 3-question quiz to recommend a method
- `components/budget/MethodologySwitcher.tsx` — Switch anytime in settings
- `components/budget/BudgetCategoryEditor.tsx` — Create/edit categories with emoji, rollover toggle
- `components/budget/EventBudgetCreator.tsx` — Create event/project budgets

**Methodologies**:

| Method | How It Works | Rollover Default |
|--------|-------------|-----------------|
| **Zero-based** | Every dollar gets a job. Assign income to categories. | Yes (unspent rolls forward) |
| **Envelope** | Virtual envelopes. When empty, stop spending. | No (envelope resets) |
| **50/30/20** | Auto-split: 50% needs, 30% wants, 20% savings. | No (percentage-based) |
| **Pay-yourself-first** | Set savings target first, spend remainder freely. | N/A (only savings tracked) |

**Rollover logic** (`rollover-engine.ts`):
```typescript
interface RolloverConfig {
  enabled: boolean;
  mode: 'same_category' | 'savings_pool' | 'expire';
  maxRollover?: number;  // Cap rollover amount (optional)
  sinkingFund?: boolean; // Intentional multi-month saving
}

// Per-category rollover calculation
function calculateRollover(
  category: BudgetCategory,
  previousMonthSpent: number,
  previousMonthBudgeted: number,
  config: RolloverConfig
): number {
  if (!config.enabled) return 0;
  const unspent = previousMonthBudgeted - previousMonthSpent;
  if (unspent <= 0) return 0; // Overspent, no rollover
  if (config.maxRollover) return Math.min(unspent, config.maxRollover);
  return unspent;
}
```

**Budget types**:
```typescript
type BudgetType = 'monthly' | 'event' | 'project';

interface EventBudget {
  id: string;
  name: string;
  type: 'event' | 'project';
  totalBudget: number;
  startDate: Date;
  endDate?: Date;           // Optional for projects
  categories: BudgetCategory[];
  spent: number;
  remaining: number;
  archived: boolean;
  sharedWithFamily: boolean; // For family project budgets
}
```

**Custom categories with emoji**:
```typescript
interface BudgetCategory {
  id: string;
  name: string;
  emoji: string;           // User-selected emoji
  color: string;           // Mantine color key
  budgeted: number;
  spent: number;
  rolloverConfig: RolloverConfig;
  type: 'fixed' | 'variable'; // Variable categories show progress bars
  parentId?: string;       // For sub-categories
  sortOrder: number;
}
```

**Acceptance criteria**:
- [ ] Methodology quiz recommends a method in 3 questions
- [ ] All 4 methods produce correct budget views
- [ ] Rollover correctly carries unspent amounts into next month
- [ ] Rollover can be toggled per category
- [ ] Sinking fund mode accumulates over multiple months
- [ ] Event budget tracks total spend vs goal with start/end dates
- [ ] Custom categories accept emoji and persist across sessions
- [ ] User can switch methodology anytime without losing data

---

### 1.8 Multi-Currency Engine [PARALLEL]

**Create**:
- `lib/currency/exchange-rate-service.ts` — Rate fetching, caching (60-second refresh)
- `lib/currency/multi-currency-engine.ts` — Conversion, storage, gain/loss tracking
- `lib/currency/travel-mode.ts` — Temporary base currency override
- `components/settings/CurrencySettings.tsx` — Base/display currency config

**Features**:
- 160+ currencies including crypto stablecoins (USDC, USDT)
- Base currency for calculations, display currency user-selectable
- Store both transaction-date and settlement-date exchange rates
- Hover/tooltip shows exact rate applied per transaction
- Travel mode: temporarily switch display currency when abroad
- Exchange gain/loss tracking (realized on settlement, unrealized on revaluation)
- Net worth rolls up to base currency with transparent conversion

**Rate sources**: Exchange Rates API (primary, 100 free req/month) → Fixer.io (fallback) → ExchangeRate-API (budget fallback)

**Acceptance criteria**:
- [ ] Convert CAD → USD → EUR correctly using live rates
- [ ] Rates cache for 60 seconds, refresh automatically
- [ ] Transaction stores rate at time of entry
- [ ] Net worth correctly aggregates multi-currency accounts
- [ ] Travel mode switches display currency without changing stored data

---

### 1.9 Onboarding Flow (MOVED from Phase 8 — Critical for retention)

**Create**:
- `components/onboarding/OnboardingWizard.tsx` — 4-step guided setup
- `components/onboarding/IncomeSetup.tsx` — Monthly income input
- `components/onboarding/CategoryPicker.tsx` — Pick top 5-8 categories (pre-populated chips with emoji)
- `components/onboarding/GoalSetup.tsx` — Optional first savings goal
- `components/onboarding/PaycheckSetup.tsx` — Define pay schedule

**Flow** (target: value in under 2 minutes):

1. **Choose your method** → MethodologyQuiz (3 questions → recommendation)
2. **Set your income** → Monthly income input. If irregular, option to define pay schedule (weekly/bi-weekly/semi-monthly/monthly/irregular)
3. **Pick your categories** → Pre-populated chips with emoji based on chosen methodology. User can add/remove/rename. Top defaults: 🏠 Housing, 🛒 Groceries, 🚗 Transportation, 🍽️ Dining, 💡 Utilities, 🎬 Entertainment, 💊 Health, 👕 Shopping
4. **Set a goal** (optional) → "What are you saving for?" with amount and target date

**Paycheck planning** (optional, within step 2):
```typescript
interface PaySchedule {
  frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'irregular';
  nextPayDate: Date;
  amount: number;           // Net pay per paycheck
  allocations: Array<{      // Which categories get funded from this paycheck
    categoryId: string;
    amount: number;
  }>;
}
```

**Skip option**: Power users can skip onboarding entirely and go straight to dashboard.
**Progressive disclosure**: Advanced features (investment tracking, document vault, AI coach) appear as locked/teaser cards that unlock based on usage or plan upgrade.

**Acceptance criteria**:
- [ ] New user completes onboarding in under 2 minutes
- [ ] Dashboard shows meaningful data immediately after onboarding
- [ ] Safe-to-spend widget populated from onboarding inputs
- [ ] Skip option works without errors
- [ ] Paycheck allocation correctly assigns income to categories per pay period

---

### 1.10 PWA Foundation [PARALLEL]

**Create**:
- `public/manifest.json` — Web app manifest with icons, theme color, display: standalone
- `public/sw.js` — Service worker: cache app shell, handle offline, background sync queue
- `public/splash/` — iOS splash screens for all device sizes (iPhone SE through 16 Pro Max)
- `lib/notifications/push-manager.ts` — VAPID-based push notification registration
- `lib/notifications/notification-scheduler.ts` — Schedule local notifications (bill reminders, budget alerts)
- `components/shared/IOSInstallBanner.tsx` — Educational "Add to Home Screen" banner for iOS
- `components/shared/AndroidInstallPrompt.tsx` — Custom install prompt intercepting `beforeinstallprompt`
- `components/shared/OfflineIndicator.tsx` — Subtle status dot (🟢🟡🔴) in header/footer

> ⚠️ See `UI_UX_CROSS_PLATFORM_ADDENDUM.md` Section 12 for full iOS meta tags, splash screen media queries, and state preservation implementation.

**PWA manifest**:
```json
{
  "name": "Budget App",
  "short_name": "Budget",
  "description": "Privacy-first budget tracking with E2E encryption",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1A1B1E",
  "theme_color": "#14B8A6",
  "orientation": "any",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Required HTML meta tags** (for iOS PWA):
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Budget">
<meta name="theme-color" content="#14B8A6">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png">
```

**Service worker capabilities**:
- Cache-first for app shell (HTML, JS, CSS, fonts) — instant cold launch even offline
- Network-first for API calls with offline fallback to cached responses
- Background sync: queue transactions added offline, push when back online
- Push notifications: bill reminders, budget alerts, weekly recap
- Precache critical routes on install for offline-first experience

**iOS-specific handling**:
- State preservation: Save route + scroll position + form state to IndexedDB on `visibilitychange` → restore on relaunch
- Custom install banner: Show after 2+ sessions, educate user to tap Share → "Add to Home Screen"
- Push notifications require home screen install (iOS 16.4+) — show instructional prompt
- Handle iOS back gesture (swipe from left edge) — don't conflict with app gestures

**Android-specific handling**:
- Intercept `beforeinstallprompt` event → show custom install banner at moment of engagement (after first budget created, not on first visit)
- Badge API: Show unread notification count on home screen icon
- Chrome mini-infobar: Suppress default, use custom timing

**Offline experience**:
- Subtle dot indicator in header: 🟢 Connected/synced, 🟡 Syncing, 🔴 Offline, ⚪ Never connected
- NEVER show a full-screen "you're offline" banner — the app works offline, don't make it feel broken
- All data operations work against local IndexedDB — sync is background enhancement
- AI Coach degrades gracefully: show pre-computed insights, disable Claude API queries with message "AI features available when online"

**Acceptance criteria**:
- [ ] "Add to Home Screen" prompt appears on mobile browsers
- [ ] App opens in standalone mode (no browser chrome)
- [ ] App works fully offline (can add transactions, view budget)
- [ ] Offline transactions sync when connection restored
- [ ] Push notification received for test bill reminder (iOS 16.4+, Chrome, Firefox)

---

### 1.11 Near-Budget Limit Alerts [PARALLEL]

**Create**:
- `lib/budget/alert-engine.ts` — Threshold monitoring per category
- `components/shared/BudgetAlertBanner.tsx` — In-app alert banner

**Logic**:
```typescript
interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  emoji: string;
  threshold: number;      // Default 80%, configurable per category
  currentPercent: number;
  remaining: number;
  alertType: 'warning' | 'exceeded';
}

function checkBudgetAlerts(categories: BudgetCategory[]): BudgetAlert[] {
  return categories
    .filter(c => c.budgeted > 0)
    .map(c => ({
      categoryId: c.id,
      categoryName: c.name,
      emoji: c.emoji,
      threshold: c.alertThreshold || 0.8,
      currentPercent: c.spent / c.budgeted,
      remaining: c.budgeted - c.spent,
      alertType: c.spent >= c.budgeted ? 'exceeded' : 'warning'
    }))
    .filter(a => a.currentPercent >= a.threshold);
}
```

**Delivery**: In-app banner on dashboard + optional push notification (if PWA installed).

**Acceptance criteria**:
- [ ] Alert appears when spending hits 80% of category budget
- [ ] Alert upgrades to "exceeded" when 100% reached
- [ ] Threshold configurable per category in settings
- [ ] Push notification sent if enabled
- [ ] Alert dismissible but reappears on next threshold crossing

---

### 1.12 Recurring Transaction Templates [PARALLEL]

**Create**:
- `lib/budget/recurring-templates.ts` — Template engine
- `components/transactions/RecurringTemplateManager.tsx` — Create/edit/list templates
- `components/transactions/PendingRecurringList.tsx` — Confirm or skip pending recurring items

**Data model**:
```typescript
interface RecurringTemplate {
  id: string;
  payee: string;
  amount: number;
  currency: string;
  categoryId: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  nextDueDate: Date;
  autoConfirm: boolean;    // Auto-create or require manual confirmation
  reminderDaysBefore: number; // Notify N days before due
  isActive: boolean;
  notes?: string;
}
```

**Behavior**: Templates auto-generate transactions as "pending" on their due date. User confirms or adjusts the amount. Feeds into Safe-to-Spend as "upcoming obligations."

**Acceptance criteria**:
- [ ] Create a monthly rent template → generates pending transaction on the 1st
- [ ] Pending transaction appears in Safe-to-Spend upcoming bills
- [ ] User can confirm (exact amount) or adjust before finalizing
- [ ] Reminder push notification fires N days before due date

---

## Phase 2: Bank Sync & Data Import

**Goal**: Connect to real bank accounts, import historical data, scan receipts, detect subscriptions, and deliver weekly recaps. Ship swipe-to-review and bulk re-categorization here — users need these the moment real data flows in.

**Dependencies**: Phase 1 complete (encryption, sync, auth must exist)

### 2.1 Plaid Integration (Premium)

**Create**:
- `lib/plaid/client.ts` — Plaid API client
- `lib/plaid/link-handler.ts` — Plaid Link token creation and exchange
- `api/src/routes/plaid.ts` — Server endpoints: `/link-token`, `/exchange-token`, `/webhook`
- `components/accounts/PlaidLinkButton.tsx` — "Connect Bank" button launching Plaid Link

**Security**: Access tokens stored E2E encrypted in `bank_connections` table. Server never sees decrypted tokens.

**Acceptance criteria**:
- [ ] Plaid Link opens in sandbox mode
- [ ] Access token stored encrypted in Supabase
- [ ] Transactions imported and appear in transaction list
- [ ] Webhook handles new transactions pushed by Plaid

### 2.2 SimpleFIN Completion

**Port**: `src/lib/simplefin/client.ts` (502 LOC), `src/lib/simplefin/sync.ts` (524 LOC) — ~80% complete

**Action**: Port, complete, add account matcher + connection wizard.

### 2.3 Sync Health Dashboard

**Create**:
- `components/settings/SyncHealthDashboard.tsx` — Per-institution status, retry controls, error log

### 2.4 Reconciliation Autopilot

**Create**:
- `lib/budget/reconciliation.ts` — Guided fixes for mismatched balances
- `components/transactions/ReconciliationWizard.tsx`

**Features**: Pending vs posted handling, duplicate detection, transfer pairing, split resolution, hidden fee identification.

### 2.5 Subscription Detection & Cancellation

**Port**: `src/lib/analytics/recurring-detector.ts` (209 LOC)

**Create**:
- `lib/subscriptions/subscription-detector.ts` — Scan for recurring charges
- `lib/subscriptions/overlap-detector.ts` — "You pay for Spotify AND Apple Music"
- `lib/subscriptions/cost-per-use.ts` — "Netflix costs $4.50/show this month"
- `components/subscriptions/SubscriptionManager.tsx`
- `components/subscriptions/PriceAlertBanner.tsx` — Price increase alerts

**Enhancement**: Add cost-per-use calculations. Reframe subscriptions from "cost" to "value."

### 2.6 Receipt Scanning (Local OCR)

**Port**: Tesseract.js 6.0.1 already in package.json. Port `src/lib/parsers/pdf-ocr-parser.ts` (709 LOC).

**Features**: Camera/file upload, local OCR (no data leaves device), extract merchant/date/total/line items, auto-match to existing transactions.

### 2.7 Credit Score Integration

**Stack**: iSoftpull (standalone) or Plaid LendScore. FCRA compliance required.

### 2.8 Swipe-to-Review Transaction Inbox (MOVED from Phase 8)

**Create**:
- `components/transactions/SwipeReview.tsx` — Tinder-style transaction review
- `lib/budget/review-engine.ts` — Track reviewed/unreviewed status

**Mobile (gesture-based)**:
- Swipe right (>100px) → Approve (green flash + haptic)
- Swipe left (>100px) → Flag for review (amber flash)
- Swipe up (>80px) → Split transaction (modal opens)
- Tap → Detailed edit view

**Desktop keyboard shortcuts**: Right/A = Approve, Left/F = Flag, Up/S = Split, Enter = Detail, Space = Next, Esc = Exit

**Batch mode**: Progress bar (reviewed/total), "Review All" rapid-fire mode.

### 2.9 Bulk Re-Categorization (MOVED from Phase 6)

**Create**:
- `components/transactions/BulkCategorizer.tsx` — Multi-select → apply category
- `lib/budget/merchant-rules.ts` — "Always categorize [merchant] as [category]"

**Features**:
- Select multiple transactions → change category for all at once
- "Always categorize Starbucks as ☕ Coffee" → creates a quick rule
- Quick rules evaluate immediately on new transactions — no need to wait for full Rules Engine (Phase 6)
- Split transaction support: "This Amazon order was $30 Groceries + $20 Household"

### 2.10 Weekly Spending Recap (MOVED from Phase 4)

**Create**:
- `lib/notifications/weekly-recap.ts` — Generate recap data
- `components/dashboard/WeeklyRecap.tsx` — In-app recap card
- `api/src/routes/email.ts` — Send recap email via Resend

**Recap contents**:
1. Total spending this week vs. same week last month
2. Top 3 spending categories with amounts
3. Notable transactions (largest, unusual, new merchants)
4. Upcoming bills in next 7 days
5. Safe-to-spend update
6. One actionable insight ("You spent 40% more on dining than last week")

**Delivery**: In-app card on Monday dashboard + optional email + optional push notification.

### 2.11 Refund Tracking

**Create**:
- `lib/budget/refund-tracker.ts` — Link refunds to original transactions

**Features**: Mark transaction as "expecting refund" → auto-match when refund arrives → net out in reports (show both gross and net views).

### 2.12 Push Notifications Infrastructure (MOVED from Phase 8)

Expand the PWA push foundation from Phase 1.10:
- Bill reminder notifications (N days before due)
- Budget alert notifications (80% threshold)
- Weekly recap notification
- Configurable notification preferences per type
- Deep linking: tap notification → goes to relevant screen

---

## Phase 3: Family & Collaboration

**Dependencies**: Phase 1 E2E encryption + sync engine

### 3.1 Family Groups with Selective Sharing

Implement the `family_groups` and `family_members` schema from Phase 1.2.

**Roles**: Owner, Admin, Member, Viewer, Child
**Views**: "My accounts" / "Partner's accounts" / "Household" toggle
**Privacy controls**: Each member chooses which accounts to share

### 3.2 Couple-Specific Features

- Joint vs Individual account views
- Transaction tagging: tag partner to review a charge
- **Transaction comment threads**: Lightweight comment/reply on transactions ("Why was this $200?" → "Bulk buy for the party")
- **Expense splitting**: Per-transaction split with configurable ratios (50/50, 70/30, custom, by-item). Running "who owes whom" balance with settlement tracking.
- Approval workflow for purchases over configurable threshold
- Shared budget goals with individual contribution tracking
- Monthly summary: combined household spending report

### 3.3 Financial Wellness Score

**Port**: `src/lib/analytics/health-score.ts` (666 LOC)

Composite score (0-100): Emergency fund, debt-to-income, savings rate, budget adherence, net worth trend, retirement readiness.

### 3.4 Gamification & Streaks

**Challenge types**: No-spend weekend, 52-week challenge, round-up savings, custom household challenges.

**Streak system** (the Duolingo mechanic):
```typescript
interface StreakConfig {
  type: 'daily_log' | 'daily_review' | 'daily_check_safe_to_spend';
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  freezesRemaining: number; // 2 per month
  freezesUsed: number;
}
```

**Badges**: Debt-free, emergency fund complete, savings streaks (7/30/90/365 days), under budget N months, first budget created, first receipt scanned, etc.

**Family leaderboard**: Client-side computed (each device decrypts shared scores locally, ranks, displays). Not real-time — refreshes on sync.

**Celebrations**: canvas-confetti on milestones.

### 3.5 Seasonal Budget Templates

Pre-built event budget templates offered contextually:
- 🎄 Holiday Budget (November) — gifts, decorations, travel, food, parties
- 🏫 Back to School (August) — supplies, clothes, activities
- ☀️ Summer Travel (May) — flights, hotels, activities, dining
- 📋 Tax Season (March) — software, accountant fees, estimated payments
- 🏡 Spring Home (April) — repairs, garden, deep clean
- 🎃 Halloween (September) — costumes, decorations, candy

Templates are Event Budgets (from 1.7) with pre-configured categories and suggested amounts based on last year's spending (if available).

---

## Phase 4: Superior AI

**Dependencies**: Phase 1 auth + Phase 2 data (need real transactions for AI to analyze)

### 4.1 AI Money Coach (Claude API)

**Port**: `src/contexts/ChatbotContext.tsx` (~13KB)

**Privacy-first architecture**: Local data analysis runs in browser. Only anonymized, summarized context sent to Claude API. Never raw transactions, account names, or merchant data.

**Natural language queries** (the Copilot differentiator):
- "How much did I spend on dining this quarter?"
- "Am I on track for my savings goal?"
- "What if I cancel these 3 subscriptions?"
- "Compare my spending this month to last month"

Query parser maps natural language → IndexedDB lookups → formatted answer. Claude API used for complex interpretation and personalized advice.

### 4.2 Enhanced Local ML

**Port**: `src/lib/analytics/lstm-predictive-spending.ts` (478 LOC)

Improved auto-categorization (target: 95%+). User corrections train local model. Merchant-level rules learned automatically.

### 4.3 Behavioral Nudge Engine

**Port**: `src/lib/analytics/weekly-insights.ts` (706 LOC), `overspending-detector.ts` (159 LOC)

**Spending velocity alerts** (new): Alert when spending pace exceeds 1.5x trailing 3-month average for any category. "You're spending on dining 2x faster than your usual pace."

### 4.4 Margin Finder + Decision Mode

**Decision Mode**: "If I buy this $800 TV today, what breaks?" → instant answer showing which categories go over budget, impact on savings goals, and cash flow projection.

**Margin Finder**: Scan entire budget for savings opportunities. Show total potential savings with specific suggestions.

### 4.5 Federated Learning (Opt-In)

**Port**: `src/lib/collective-learning-service.ts` (553 LOC)

Epsilon ≤ 8.0 per round, gradient clipping, secure aggregation. Minimum 100 participants per round — defer if user base too small.

---

## Phase 5: Wealth Tracking

**Dependencies**: Phase 2 Plaid + Phase 1 multi-currency

### 5.1 Investment Portfolio Tracking
TWR/IRR calculations, asset allocation visualization, rebalancing suggestions, dividend tracking.

### 5.2 Net Worth Dashboard
Aggregate all assets minus liabilities. Monthly trend chart. Milestone celebrations. Year-over-year comparison.

**Dashboard customization** (new — implement here or Phase 1):
Widget-based drag-and-drop dashboard. Users pick 4-8 widgets from: Safe-to-Spend, Bills Due, Budget Status, Recent Transactions, Net Worth, Spending by Category, Cash Flow Projection, Goals Progress, Subscription Total, Financial Wellness Score, Weekly Recap. Layout saved per device.

### 5.3 Cash Flow Monte Carlo Projection
**Port**: `src/lib/analytics/trend-forecasting.ts` (227 LOC)

12-month projection with confidence bands. What-if scenarios. Combine with AI coach for conversational what-if: "What happens if I pay an extra $200/month on my student loan?"

### 5.4 Crypto & Real Estate
Crypto exchange APIs + wallet monitoring + cost basis. Real estate: Zillow/Redfin (US) + manual entry (all markets).

---

## Phase 6: Open Platform

### 6.1 Public API (REST v2)
Bearer token auth with scopes. Endpoints for all resources.

### 6.2 Webhooks
Events: transaction.created, budget.exceeded, bank_sync.completed, etc.

### 6.3 Data Portability ("Leave-Any-Time Promise")
Export: JSON, CSV, YNAB format, PDF reports. Import: YNAB, Mint, Quicken QIF, generic CSV.

### 6.4 E2E Encrypted Document Vault
Store receipts, tax docs, warranties. Same encryption as financial data. Link to transactions.

### 6.5 Smart Rules Engine & Automation
Full if-then rules (expands quick merchant rules from Phase 2.9): Auto-categorization, threshold alerts, auto-transfer, conditional notifications. Cross-device family rules evaluate locally after sync.

### 6.6 Open Banking Compliance
Section 1033 (US): On hold. PSD3 (EU): Expected mid-2026. Canadian Consumer-Driven Banking: Architecture-ready.

---

## Phase 7: Tax & Financial Tools

### 7.1 Tax Optimization
Tax category tagging, quarterly estimated tax tracker, year-end summary, deduction finder, TurboTax export.

### 7.2 Canadian Tax Integration
RRSP/TFSA/RESP/FHSA tracking with contribution room. HST/GST per-province tagging. Receipt vault integration for CRA expenses.

### 7.3 HSA/FSA Tracking (US)
Contribution limits, eligible expense auto-categorization, FSA use-it-or-lose-it reminders.

### 7.4 BNPL Tracking
Auto-detect installments, track as liability in net worth, payment schedule visualization.

### 7.5 Bill Negotiation Service
Detect negotiable bills, track savings. Revenue: percentage of savings.

---

## Phase 8: Polish & Launch

### 8.1 Mobile Optimization
React Native wrapper for App Store. Biometric auth. Home screen widget (safe-to-spend glance).

### 8.2 Advanced Accessibility
Voice entry ("Add $45 groceries") via Web Speech API. Guided monthly close wizard. Screen reader audit. (Note: Basic seniors mode already shipped in Phase 1.)

### 8.3 Emotional ROI Tags (Enhancement to Swipe-to-Review)
Add Mantine Badge chips to transactions: Joy (green), Regret (red), Essential (blue), Routine (gray). Users tag during review. Reports show spending by emotional category.

### 8.4 Wearable Widgets
Apple Watch / Wear OS: Safe-to-spend glance, recent transactions.

---

## Phase 9: Growth & Community

### 9.1 Social Benchmarking (Opt-In)
Anonymous comparison to similar households. Differential privacy, k-anonymity ≥ 50.

### 9.2 Contextual Micro-Lessons
Behavior-triggered financial education. NOT a full LMS — the existing LMS stays separate.

### 9.3 Voice Commands
Web Speech API, hands-free transaction entry.

### 9.4 Self-Hosted Docker Deployment
Docker Compose, bring-your-own Supabase or SQLite. $49/yr.

### 9.5 Carbon Footprint Tracking (Monitor)
Emerging trend. MCC-based emission estimates per transaction. Don't build now — add architecture hook for future.

---

## Don't Do List

| Item | Reason |
|------|--------|
| Kids/teen financial literacy module | Scope creep — essentially building Greenlight. Defer to separate product. |
| HouseSigma API integration | No documented public API. Use manual entry for Canadian property. |
| Full education hub | Existing LMS (59 routes, 200+ questions) already exists. Use micro-lessons only. |
| "Built for Canada" branding | Undermines 114-locale global advantage. Position as global-first. |
| Carbon footprint v1 | Too early. Monitor and add architecture hook only. |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Onboarding completion | 80%+ of new signups |
| Time to first budget | < 2 minutes |
| Safe-to-spend daily views | 80% of active users |
| 90-day retention rate | 65%+ (industry avg ~40%) |
| Premium conversion | 5% of free users |
| Family plan adoption | 20% of premium |
| Weekly recap open rate | 50%+ |
| AI coach conversations/week | 3+ per active user |
| Sync conflict rate | < 0.1% |
| API uptime | 99.9% |
| Lighthouse PWA score | 100 |
| Lighthouse Performance (mobile) | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Bundle size (gzipped JS) | < 200KB initial |
| First Contentful Paint (4G mobile) | < 1.5s |
| Largest Contentful Paint (4G mobile) | < 2.5s |
| Vite dev cold start | < 500ms |
| iOS PWA install rate | Track via custom banner |
| Android PWA install rate | Track via beforeinstallprompt |
| Cross-device sync success | > 99.9% |
| Offline transaction queue drain | 100% on reconnect |

---

## Execution Notes for Claude Code CLI

### Build Order for Every Component
1. **Read the UI/UX Addendum** (`UI_UX_CROSS_PLATFORM_ADDENDUM.md`) for the component's layout at each breakpoint
2. **Build mobile (375px) first** — then expand to tablet and desktop
3. **Define TypeScript interfaces** before any implementation
4. **Include ALL states**: default, hover, active, disabled, loading (skeleton), empty, error
5. **Test on iPhone SE (375px)** as the minimum supported viewport

### Cross-Platform Rules (Non-Negotiable)
1. **Touch targets**: 44px minimum on all tappable elements, 48px recommended, 52px in seniors mode
2. **Safe areas**: Use `env(safe-area-inset-*)` for iOS notch/Dynamic Island/home indicator
3. **Bottom navigation**: 5-tab bar on mobile with "More" overflow — persistent, fixed position
4. **Bottom sheets**: Use Mantine Drawer position="bottom" for all mobile detail views — NOT full modals
5. **FAB**: Floating Action Button (56px) bottom-right for primary action (Add Transaction)
6. **Keyboard handling**: `inputMode="decimal"` for currency, auto-dismiss on outside tap, scroll into view
7. **iOS PWA**: apple-mobile-web-app-capable, splash screens, state preservation on suspend/resume
8. **Android PWA**: Intercept `beforeinstallprompt`, custom install banner after first budget created
9. **Offline indicator**: Subtle color dot (🟢🟡🔴), NEVER a full-screen "you're offline" banner
10. **Optimistic updates**: Every write shows in UI instantly before sync confirms

### Design Quality Rules
1. **Skeleton screens** for every data-dependent view — NEVER a spinner
2. **Empty states** designed for every screen — icon + message + CTA, never a blank page
3. **Animations**: Use tokens from addendum Section 6 — never hardcode duration/easing values
4. **Reduced motion**: Every animation wrapped in `useReducedMotion()` guard
5. **Dark mode primary**: Design dark first, light second — dark mode gets glassmorphism + glow effects
6. **Progressive disclosure**: Show simple view by default, reveal complexity on user action
7. **Mantine components over custom**: Use built-in Mantine components before building custom ones
8. **8px spacing grid**: All spacing uses multiples of 8 (8, 16, 24, 32, 48, 64)

### Architecture Rules
1. **Privacy by default**: Every new feature must work with E2E encryption. If it requires server to read data, redesign.
2. **Offline-first**: Every feature must work without network. Sync is an enhancement, not a requirement.
3. **i18n from day one**: All user-facing strings go through i18n. No hardcoded English.
4. **RTL support**: CSS logical properties only (`margin-inline-start` not `margin-left`)
5. **Feature flags**: Wrap every new feature in PostHog feature flag. Roll out incrementally.
6. **Accessibility**: aria labels, keyboard nav, screen reader testing on every component.
7. **Test encryption early**: E2E encryption bugs are the hardest to debug post-launch.
8. **Port before build**: Check if existing codebase has a module before writing from scratch. 27K LOC of portable code is already written.
9. **Code split routes**: Every page is `React.lazy()`. Heavy libraries (Tesseract.js, TF.js, Recharts) loaded on demand.
10. **Performance budgets**: < 200KB gzipped JS, < 1.5s FCP on 4G, Lighthouse ≥ 90 mobile.
