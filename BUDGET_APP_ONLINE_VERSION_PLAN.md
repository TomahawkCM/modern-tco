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

**Tiers**:

| Feature | Free | Premium $4.99/mo | Family $9.99/mo |
|---------|------|------------------|-----------------|
| Accounts | 3 | Unlimited | Unlimited |
| Bank Connections | 1 | 5 | 10 |
| Devices | 1 | 5 | 10 |
| Family Members | 1 | 1 | 6 |
| API Access | No | Yes | Yes |
| Priority Support | No | Yes | Yes |

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

---

## Phase 5: Open Platform (Weeks 21-23)

### 5.1 Public API

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

### 5.2 Webhooks

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

### 5.3 Data Portability

**Export**: JSON, CSV, YNAB format, PDF reports
**Import**: YNAB, Mint, Quicken QIF, generic CSV

---

## Phase 6: Polish & Launch (Week 24)

### 6.1 Push Notifications

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

### 6.2 Mobile Optimization

- React Native wrapper for App Store presence
- Deep linking for notifications
- Biometric authentication
- Widget support (iOS/Android)

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

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Foundation | 8 weeks | MVP: Auth, E2E encryption, cloud sync, billing |
| 2. Bank Sync | 4 weeks | SimpleFIN + Plaid integration |
| 3. Family | 4 weeks | Groups, permissions, couple features |
| 4. AI | 4 weeks | Enhanced ML, federated learning |
| 5. Platform | 3 weeks | API, webhooks, export/import |
| 6. Launch | 1 week | Notifications, polish, deployment |
| **Total** | **24 weeks** | |

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
