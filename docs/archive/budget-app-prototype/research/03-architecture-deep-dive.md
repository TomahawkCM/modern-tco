# Architecture Deep Dive: Offline-to-Online Transition

## Design Philosophy

**Local-first, cloud-enhanced**: IndexedDB remains the primary data store in BOTH modes. The cloud adds sync, collaboration, and backup — it never replaces local storage. If the network disappears, the app works exactly as before.

**Key principle**: The future of web apps is local-first — the local device acts as the primary source of truth, the UI is driven by local state in real time, and the network is an optimization rather than a requirement.

## Dual-Mode Architecture

### Feature Flag System

The existing feature flag system at `src/config/features.ts` gates all online features:

```typescript
export const APP_MODE = "standalone" as AppMode; // Change to "online" for cloud version

export const FEATURES = {
  // Always on (standalone)
  multiProfiles: true,
  pinAuthentication: true,
  privatePublicBudgets: true,
  activityLogging: true,
  localExport: true,

  // Online-only (gated by APP_MODE)
  aiFeatures: APP_MODE === "online",
  chatbot: APP_MODE === "online",
  cloudSync: APP_MODE === "online",
  familyInvites: APP_MODE === "online",
  cloudBackup: APP_MODE === "online",
  realTimeCollab: APP_MODE === "online",

  // Experimental
  webMCP: false,
};
```

Every online feature checks `isFeatureEnabled()` or `isOnlineMode()` before rendering or executing.

## Cloud Sync Architecture

### Existing Infrastructure (What We Reuse)

| Module          | Path                               | What It Does                                                  | Status           |
| --------------- | ---------------------------------- | ------------------------------------------------------------- | ---------------- |
| SyncEngine      | `src/lib/sync/sync-engine.ts`      | Vector clock sync, conflict resolution, field-level merge     | Production-ready |
| OfflineManager  | `src/lib/sync/offline-manager.ts`  | Change queuing, exponential backoff, localStorage persistence | Production-ready |
| DeviceDiscovery | `src/lib/sync/device-discovery.ts` | QR pairing, ECDH keypairs, device trust levels                | Production-ready |
| Sync Types      | `src/lib/sync/types.ts`            | 16 entity types, vector clocks, 16 message types              | Production-ready |
| LANSyncContext  | `src/contexts/LANSyncContext.tsx`  | React context for sync state, device management hooks         | Production-ready |
| Supabase Client | `src/utils/supabase/client.ts`     | Browser Supabase client (singleton)                           | Production-ready |
| Supabase Server | `src/utils/supabase/server.ts`     | Server-side Supabase client                                   | Production-ready |
| Auth Context    | `src/contexts/AuthContext.tsx`     | Supabase auth + offline fallback                              | Production-ready |

### New Module: Cloud Transport

**File**: `src/lib/sync/cloud-transport.ts`

This is the central new module. It plugs into the existing `SyncEngine` as a transport layer, alongside the existing LAN WebSocket transport:

```
SyncEngine (existing)
  ├── LAN Transport (existing) — WebSocket, QR pairing
  └── Cloud Transport (NEW) — Supabase REST + Realtime
```

**Responsibilities**:

- **Pull**: `GET /rest/v1/budget_*?updated_at=gt.{last_sync_timestamp}` — fetch changes since last sync
- **Push**: `POST /rest/v1/budget_*` with upsert (ON CONFLICT) — upload local changes
- **Notify**: Broadcast on Supabase Realtime channel that new data is available
- **Listen**: Subscribe to Realtime channel for remote change notifications
- **Presence**: Track which devices are online via Supabase Presence

### Sync Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────┐
│  UI Action  │────▶│  Dexie.js    │────▶│  Change Hook    │────▶│ SyncEngine  │
│ (add tx)    │     │  (IndexedDB) │     │  (middleware)   │     │ (existing)  │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────┬──────┘
                                                                        │
                                          ┌─────────────────────────────┤
                                          │                             │
                                 Online? ─┤                    Offline? ─┤
                                          │                             │
                              ┌───────────▼──────────┐    ┌────────────▼─────────┐
                              │  Cloud Transport     │    │  OfflineManager      │
                              │  1. POST to Supabase │    │  1. Queue change     │
                              │  2. Broadcast notify │    │  2. Persist to       │
                              │  3. Wait for ACK     │    │     localStorage     │
                              └──────────────────────┘    │  3. Retry on reconnect│
                                                          └──────────────────────┘
```

**Remote change flow** (when another device changes data):

1. Supabase Realtime broadcasts notification: `{ type: "CHANGE", entity: "transactions", count: 3 }`
2. Cloud Transport receives notification
3. Triggers delta sync: pulls only changed records since `last_sync_at`
4. SyncEngine runs conflict detection (vector clocks + field-level merge)
5. Non-conflicting changes applied to IndexedDB
6. Conflicting changes queued in `pendingConflicts` for UI resolution

### Supabase Realtime Channels

```
Channel: household:{household_id}
├── Broadcast: change notifications (low bandwidth)
│   { type: "CHANGE", entity: "transactions", device_id: "abc", count: 3 }
│   { type: "CHANGE", entity: "budgets", device_id: "abc", count: 1 }
│
├── Presence: online device tracking
│   { device_id: "abc", user_name: "Rob", device_type: "phone", last_active: "..." }
│   { device_id: "def", user_name: "Rob", device_type: "laptop", last_active: "..." }
│
└── PostgreSQL Changes: server-authoritative updates (billing, admin actions)
```

### Why Not PowerSync / RxDB?

We considered three pluggable sync engines:

| Option                    | Pros                                                | Cons                                           | Decision                    |
| ------------------------- | --------------------------------------------------- | ---------------------------------------------- | --------------------------- |
| **PowerSync**             | Best offline support, bucket-based partial sync     | Additional dependency, overlaps our SyncEngine | Skip — we already have sync |
| **RxDB**                  | IndexedDB-focused, Supabase plugin exists           | Requires migrating from Dexie.js to RxDB       | Skip — massive migration    |
| **Custom (our approach)** | Uses existing SyncEngine, no new deps, full control | We build the cloud transport ourselves         | **Chosen**                  |

**Rationale**: Our SyncEngine already handles vector clocks, field-level merge, critical field detection, and LWW fallback. The only missing piece is a cloud transport layer — a well-defined, bounded module (~500-800 lines).

## Database Design

### IndexedDB Schema (Current)

The existing schema at `src/lib/budget-db.ts` defines 35+ tables across 21 schema versions:

**Core Financial** (5 tables):

- `accounts` — Bank accounts (checking, savings, credit)
- `transactions` — Income and expenses
- `categories` — Budget categories
- `budgets` — Budget rules and amounts
- `subscriptions` — Recurring subscriptions

**Debt & Investment** (8 tables):

- `loans`, `loanPayments` — Debt tracking
- `investmentAccounts`, `holdings`, `portfolios` — Investment tracking
- `investmentTransactions` — Investment activity
- `futurePurchases` — Planned purchases
- `retirementPlans` — Retirement planning

**Import & Matching** (4 tables):

- `importMappings` — CSV column mappings per bank
- `importedFITIDs` — Deduplication for OFX imports
- `merchantCorrections` — User corrections to AI categorization
- `merchantRules` — Auto-categorization rules

**Planning & Analysis** (8 tables):

- `netWorthSnapshots` — Historical net worth
- `debtScenarios` — Saved debt payoff scenarios
- `paycheckPlans` — Paycheck allocation plans
- `properties` — Real estate tracking
- `eventBudgets`, `eventBudgetCategories` — Event/project budgets
- `splitPeople`, `expenseSplits` — Expense splitting
- `budgetRollovers` — Budget rollover amounts

**System** (6 tables):

- `profiles` — Multi-user profiles
- `activityLog` — Audit trail (500 entries)
- `gamificationState` — Streaks, badges, XP
- `inAppNotifications` — In-app notifications
- `receipts` — Receipt images/PDFs
- `pairedDevices` — LAN sync devices

### Supabase PostgreSQL Schema

Every IndexedDB table is mirrored to a `budget_*` table in PostgreSQL with these additions:

```sql
-- Common pattern for every budget_* table
CREATE TABLE budget_transactions (
  -- Original fields from IndexedDB (matching src/types/budget.ts)
  id TEXT PRIMARY KEY,
  amount NUMERIC(15,2) NOT NULL,
  description TEXT,
  category TEXT,
  date TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')),
  account_id TEXT REFERENCES budget_accounts(id),
  merchant TEXT,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT false,
  tags TEXT[],
  -- ... all other fields from Transaction type

  -- CLOUD ADDITIONS (on every table)
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,          -- Optimistic concurrency control
  device_id TEXT NOT NULL,             -- Origin device for sync
  deleted_at TIMESTAMPTZ,             -- Soft delete tombstone
  encrypted_blob JSONB,               -- Zero-knowledge mode (entire row encrypted)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_tx_household_updated ON budget_transactions(household_id, updated_at);
CREATE INDEX idx_tx_household_date ON budget_transactions(household_id, date);
CREATE INDEX idx_tx_category ON budget_transactions(household_id, category);
CREATE INDEX idx_tx_deleted ON budget_transactions(household_id, deleted_at) WHERE deleted_at IS NOT NULL;
```

### New Cloud-Only Tables

```sql
-- HOUSEHOLD (multi-tenant container)
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Budget',
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  encryption_mode TEXT DEFAULT 'standard'
    CHECK (encryption_mode IN ('standard', 'e2e', 'zero_knowledge')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- HOUSEHOLD MEMBERS (roles and permissions)
CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  display_name TEXT,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(household_id, user_id)
);

-- BILLING (Stripe integration)
CREATE TABLE billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  household_id UUID REFERENCES households(id),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'family')),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'unpaid')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SYNC METADATA (per device per household)
CREATE TABLE sync_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT, -- phone, tablet, laptop, desktop
  last_sync_at TIMESTAMPTZ,
  vector_clock JSONB DEFAULT '{}',
  sync_version INTEGER DEFAULT 0,
  UNIQUE(household_id, device_id)
);

-- E2E KEY STORE (encrypted key material)
CREATE TABLE encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  device_id TEXT,
  wrapped_dek BYTEA NOT NULL,           -- Data Encryption Key wrapped with device public key
  dek_version INTEGER DEFAULT 1,
  public_key BYTEA,                      -- ECDH public key for this device
  created_at TIMESTAMPTZ DEFAULT now()
);

-- USER PREFERENCES (cloud-synced settings)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  locale TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'USD',
  theme TEXT DEFAULT 'system',
  personality_mode TEXT DEFAULT 'professional',
  seniors_mode BOOLEAN DEFAULT false,
  notification_preferences JSONB DEFAULT '{}',
  ai_preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Conflict Resolution

### Existing Implementation (from `src/lib/sync/sync-engine.ts`)

The SyncEngine implements a sophisticated conflict resolution strategy:

**1. Field-Level Merge** (non-conflicting changes merge automatically):

- Device A changes `description` of a transaction
- Device B changes `category` of the same transaction
- Result: Both changes applied (no conflict)

**2. Critical Field Detection**:

```typescript
const CRITICAL_FIELDS = {
  transactions: ["amount"],
  accounts: ["balance"],
  budgets: ["amount"],
  loans: ["balance", "interestRate"],
};
```

When two devices change a critical field simultaneously, manual resolution is required.

**3. Last-Write-Wins (LWW) Fallback**:
When field-level merge fails and the field isn't critical, LWW resolves automatically. Configurable: prefer local or remote changes.

**4. Vector Clocks**:
Per-device logical timestamps (`{ "device_a": 5, "device_b": 3 }`) for causal ordering. Concurrent changes detected when neither clock dominates the other.

### Cloud-Specific Additions

**Server timestamp authority**: Supabase `updated_at DEFAULT now()` provides a global clock reference to break ties when device clocks have drifted.

**Tombstone cleanup**: Server-side scheduled function (Supabase pg_cron) removes records with `deleted_at` older than 30 days:

```sql
SELECT cron.schedule('cleanup-tombstones', '0 3 * * *',
  $$DELETE FROM budget_transactions WHERE deleted_at < now() - interval '30 days'$$
);
```

**Conflict resolution UI**: The existing `pendingConflicts` array on `SyncEngine` surfaces in a new `ConflictResolutionDialog` component:

```
┌──────────────────────────────────────────┐
│ Conflict: Transaction Amount             │
│                                          │
│ "Coffee at Starbucks"                    │
│                                          │
│ Your phone:  $5.50  (Feb 22, 10:15am)  │
│ Your laptop: $4.50  (Feb 22, 10:14am)  │
│                                          │
│   [Keep $5.50]  [Keep $4.50]  [Custom]  │
└──────────────────────────────────────────┘
```

## Encryption Architecture

### Existing Implementation (from `src/lib/encryption.ts`)

- **Algorithm**: AES-256-GCM via Web Crypto API
- **Key derivation**: PBKDF2 with 100,000 iterations
- **Key source**: Device fingerprint (browser properties, canvas, timezone, screen)
- **Encrypted fields**: `description`, `amount` (with `hashAmount()` for searchable encrypted values)
- **Detection**: Encrypted values prefixed with `encrypted:`
- **Storage**: Keys in sessionStorage/localStorage

### Three Tiers for Online Mode

#### Tier 1: Standard (Default)

- Data stored in plaintext on Supabase
- Supabase handles encryption at rest (AES-256)
- Simplest setup, full server-side AI access
- Best for: Most users who trust the service

#### Tier 2: E2E Encrypted

- Data encrypted client-side before upload to Supabase
- Server stores only ciphertext
- Keys derived from user password via PBKDF2 (100K iterations)

**Key management**:

```
User Password
    │
    ▼ PBKDF2 (100K iterations, random salt)
Master Key (256-bit AES key)
    │
    ▼ AES-KW (Key Wrapping)
Data Encryption Key (DEK) — per household
    │
    ▼ AES-256-GCM
Encrypted financial data
```

**Multi-device key sharing**:

1. Device A generates ECDH keypair (reuses `src/lib/sync/device-discovery.ts` pattern)
2. Device B generates ECDH keypair
3. Device A wraps DEK with Device B's public key → stores in `encryption_keys` table
4. Device B unwraps DEK with its private key → can now decrypt data

**Key rotation on password change**:

- Re-derive Master Key from new password
- Re-wrap DEK with new Master Key
- No need to re-encrypt all data (only the key wrapping changes)

#### Tier 3: Zero-Knowledge

- Even metadata (category names, merchant names) is encrypted
- Server sees only UUIDs and timestamps
- `encrypted_blob JSONB` column stores the entire row as encrypted JSON
- No server-side search or AI — everything runs client-side
- User provides own OpenAI API key for AI features

**Recovery key**: 12-word BIP39 mnemonic generated at E2E/ZK setup. User stores offline. If password forgotten, recovery key can derive the Master Key.

## Row-Level Security (RLS)

### Policy Pattern

Every `budget_*` table gets three policies:

```sql
-- 1. Household-scoped read access (all roles)
CREATE POLICY "household_read" ON budget_transactions FOR SELECT
USING (household_id IN (SELECT user_household_ids()));

-- 2. Write access (owner, admin, member)
CREATE POLICY "household_write" ON budget_transactions
FOR INSERT WITH CHECK (
  household_id IN (
    SELECT household_id FROM household_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
  )
);

-- 3. Delete access (owner, admin only)
CREATE POLICY "household_delete" ON budget_transactions FOR DELETE
USING (
  household_id IN (
    SELECT household_id FROM household_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);
```

### Performance Optimization

The `household_members` lookup runs on every query. We optimize with a security definer function:

```sql
-- Cached household lookup (STABLE = cacheable within transaction)
CREATE OR REPLACE FUNCTION user_household_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT household_id FROM household_members
  WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
$$;
```

### Billing Enforcement

RLS policies also enforce subscription limits:

```sql
-- Viewer role for expired subscriptions
CREATE OR REPLACE FUNCTION user_can_write()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM billing_subscriptions
    WHERE user_id = auth.uid()
    AND status IN ('active', 'trialing')
  )
$$;
```

## API Rate Limiting & Abuse Prevention

| Tier   | API Calls/min | AI Messages/day | SimpleFIN Sync | Max Transactions  |
| ------ | ------------- | --------------- | -------------- | ----------------- |
| Free   | 100           | 5               | N/A            | Unlimited (local) |
| Pro    | 1,000         | Unlimited       | Every 4 hours  | Unlimited         |
| Family | 1,000         | Unlimited       | Every 4 hours  | Unlimited         |

**Implementation**: Supabase Edge Functions or Next.js middleware with Redis-backed sliding window counters.

**Abuse signals**:

- > 1M transactions per household (likely bot)
- > 100 devices per household
- > 10,000 API calls per hour
- Rapid account creation from same IP

## Performance Targets

| Metric                 | Target     | Strategy                                |
| ---------------------- | ---------- | --------------------------------------- |
| First Contentful Paint | < 1.5s     | Next.js SSR, dynamic imports            |
| Time to Interactive    | < 3s       | Code splitting, lazy load below-fold    |
| Cloud sync latency     | < 2s       | Realtime notification + REST delta sync |
| Offline capability     | 100%       | IndexedDB primary, service worker cache |
| Local DB query         | < 50ms     | Dexie.js indexed queries                |
| Cloud DB query         | < 200ms    | Supabase with proper indexes            |
| AI response            | < 5s       | Streaming SSE responses                 |
| Initial bundle         | < 500KB JS | Tree shaking, dynamic imports           |
| Lighthouse score       | > 90       | Performance budget in CI                |

## GDPR & Privacy Compliance

### Required Features

| Requirement                   | Implementation                                                      |
| ----------------------------- | ------------------------------------------------------------------- |
| **Data processing agreement** | Displayed during signup, acceptance timestamp stored                |
| **Right to access**           | "Export all my data" button (extend existing `localExport`)         |
| **Right to erasure**          | "Delete my account" flow → 30-day grace period → permanent deletion |
| **Data portability**          | Export in CSV, JSON, OFX formats                                    |
| **Cookie consent**            | Essential only (Supabase auth). PostHog requires opt-in consent     |
| **Privacy policy**            | Document all data flows: Supabase, OpenAI, Stripe, SimpleFIN        |
| **Sub-processor list**        | Public page listing all third-party services with DPAs              |

### Sub-Processor Registry

| Service   | Purpose                  | Data Shared                                            | DPA |
| --------- | ------------------------ | ------------------------------------------------------ | --- |
| Supabase  | Database, auth, realtime | All financial data (standard mode) or ciphertext (E2E) | Yes |
| OpenAI    | AI chatbot, insights     | Financial context snapshots (never stored)             | Yes |
| Stripe    | Billing                  | Email, payment method                                  | Yes |
| SimpleFIN | Bank sync                | Bank access tokens (encrypted)                         | Yes |
| PostHog   | Analytics                | Usage events (no financial data, opt-in)               | Yes |

## Testing Strategy

### Unit Tests (Vitest)

- Cloud transport: mock Supabase client, test sync flow
- Encryption: E2E encryption/decryption round-trips
- Migration: IndexedDB-to-Supabase data transformation
- RLS simulation: verify queries fail without auth
- AI tools: verify tool parameter validation
- Financial context assembly: verify snapshot accuracy

### Integration Tests (Vitest + Supabase Local)

- Spin up Supabase local via Docker (docker MCP available)
- Test actual RLS policies with different user roles
- Test Realtime subscriptions and broadcasts
- Test concurrent write conflict resolution
- Test household member invitation flow

### E2E Tests (Playwright)

- Offline-to-online migration flow
- Multi-device sync (two browser contexts)
- AI chatbot conversation with tool calling
- Family member invitation and acceptance
- Subscription upgrade and downgrade
- Data export and import
- E2E encryption toggle and data verification
- Accessibility audit (axe-core)

### Load Tests

- 10,000 concurrent users per Supabase instance
- 100 transactions/second per household
- 50 devices on same Realtime channel
- Sync queue drain under high contention

## Sources

- [PowerSync: Offline-First for Supabase](https://www.powersync.com/blog/bringing-offline-first-to-supabase)
- [RxDB Supabase Replication Plugin](https://rxdb.info/replication-supabase.html)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Realtime Getting Started](https://supabase.com/docs/guides/realtime/getting_started)
- [Supabase Security Retro 2025](https://supaexplorer.com/dev-notes/supabase-security-2025-whats-new-and-how-to-stay-secure.html)
- [Supabase pg_crdt (experimental CRDTs)](https://supabase.com/blog/postgres-crdt)
- [Offline-First Frontend Apps 2025 — LogRocket](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [Supabase Best Practices](https://www.leanware.co/insights/supabase-best-practices)
- [Downsides of Offline-First — RxDB](https://rxdb.info/downsides-of-offline-first.html)
