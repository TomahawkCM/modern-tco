# Multi-Device Sync — Deep Dive

## Overview

Multi-device sync allows a single user to access and modify their budget data from any device (phone, tablet, laptop, desktop) with changes propagating automatically. This is a **Phase 1 (MVP)** deliverable and the core value proposition of the online version.

## What's Already Built

The codebase has a production-ready sync infrastructure originally designed for LAN sync. Nearly all of it applies directly to cloud sync:

### Sync Engine (`src/lib/sync/sync-engine.ts` — 800+ lines)

**Class**: `SyncEngine`

**Configuration**:

```typescript
interface SyncEngineConfig {
  deviceId: string; // Unique ID for this device
  autoResolve?: boolean; // Use LWW for automatic resolution (default: true)
  preferLocal?: boolean; // When auto-resolving, prefer local changes (default: false)
}
```

**Core Methods**:
| Method | Purpose |
|--------|---------|
| `performFullSync(remoteEntities)` | First-time sync — downloads everything from cloud |
| `performDeltaSync(remoteChanges, since)` | Incremental sync — only changes since last sync |
| `getLocalChanges(since)` | Get changes made locally since a timestamp |
| `getLocalData()` | Get all local data for full sync upload |
| `getPendingConflicts()` | Get conflicts awaiting manual resolution |
| `resolveConflict(id, resolution)` | Resolve a pending conflict |

**Supported Entity Types** (16 types, priority-ordered):

- **High priority** (sync first): accounts, transactions, categories, budgets, subscriptions
- **Medium priority**: receipts, loans, loanPayments, futurePurchases, investments, portfolios, investmentHoldings, investmentTransactions
- **Low priority** (sync last): retirementPlans, importMappings, importMetadata

### Offline Manager (`src/lib/sync/offline-manager.ts`)

Handles the scenario where a user makes changes while offline:

- Queues changes in localStorage (max 1,000 pending changes)
- Exponential backoff retry: 1s → 2s → 5s → 10s → 30s → 60s
- Monitors network status via `navigator.onLine`
- Auto-drains queue when connectivity is restored
- Changes have expiration to prevent stale data from syncing

### Sync Types (`src/lib/sync/types.ts` — 312 lines)

Complete type system:

- `SyncEntity` — wrapper for any syncable record (id, data, updatedAt, version, deviceId, deletedAt)
- `VectorClock` — `{ [deviceId: string]: number }` for causal ordering
- `ChangeSet` — batch of operations for an entity type
- `Operation` — create, update, or delete with version and timestamp
- `ConflictPayload` — local vs remote versions of a conflicting entity
- `MergeResult` — result of field-level merge with per-field conflict details
- `ConnectionState` — disconnected → connecting → handshaking → connected → syncing → error

### Device Discovery (`src/lib/sync/device-discovery.ts`)

- QR code pairing with 6-digit code (5-minute expiry)
- Manual IP:port entry
- ECDH keypair generation for encrypted communication
- Device trust levels: trusted, pending, blocked
- Device fingerprinting

### LANSyncContext (`src/contexts/LANSyncContext.tsx`)

React context with hooks:

- `useLANSync()` — main hook for sync operations
- `useDeviceSyncStatus()` — per-device status
- `useSyncStats()` — overall sync statistics
- `useSyncHealth()` — health indicator
- `useIsSyncing()` — is sync in progress?

---

## Cloud Sync Architecture

### What We Build (New)

**One new module**: `src/lib/sync/cloud-transport.ts`

This module implements the same transport interface as the LAN WebSocket transport but communicates via Supabase REST API + Realtime channels.

### Detailed Sync Flow

#### Scenario 1: User Adds Transaction on Phone (Online)

```
Timeline:
────────────────────────────────────────────────────────────────

Phone:
  T+0ms    User taps "Add Expense: $50 at Costco"
  T+5ms    Transaction saved to IndexedDB (Dexie.js)
  T+10ms   UI updates immediately (optimistic update)
  T+15ms   Dexie middleware hook captures change
  T+20ms   Change serialized to ChangeSet format
  T+50ms   POST /rest/v1/budget_transactions (upsert)
  T+200ms  Supabase stores record, returns 201
  T+210ms  Broadcast on Realtime channel:
           { type: "CHANGE", entity: "transactions",
             device_id: "phone_abc", count: 1 }

Laptop:
  T+250ms  Receives Realtime broadcast notification
  T+260ms  Triggers delta sync: GET /rest/v1/budget_transactions
           ?household_id=eq.{id}&updated_at=gt.{last_sync}
  T+400ms  Receives new transaction from Supabase
  T+410ms  SyncEngine.performDeltaSync() processes change
  T+415ms  No conflict (entity doesn't exist locally) → created
  T+420ms  Transaction saved to IndexedDB
  T+425ms  React context triggers re-render
  T+430ms  UI shows new transaction

Total: ~430ms end-to-end
```

#### Scenario 2: User Edits Transaction on Phone While Offline

```
Timeline:
────────────────────────────────────────────────────────────────

Phone (OFFLINE):
  T+0ms    User changes transaction amount from $50 to $55
  T+5ms    IndexedDB updated immediately
  T+10ms   UI updates (optimistic)
  T+15ms   Dexie middleware captures change
  T+20ms   OfflineManager.queueChange() — saved to localStorage
  T+25ms   Sync status indicator shows "1 pending change"

... Time passes, phone reconnects ...

Phone (BACK ONLINE):
  T+60min  navigator.onLine fires
  T+60min  OfflineManager.processSyncQueue() starts
  T+60min  POST /rest/v1/budget_transactions (upsert with version check)
  T+60min  Supabase accepts (version matches) → 200 OK
  T+60min  Broadcast notification to all devices
  T+60min  Sync status indicator: "Synced ✓"
  T+60min  Queue cleared from localStorage
```

#### Scenario 3: Conflict — Two Devices Edit Same Transaction

```
Timeline:
────────────────────────────────────────────────────────────────

Phone (OFFLINE):
  T+0ms    Changes amount: $50 → $55

Laptop (ONLINE):
  T+30sec  Changes category: "Food" → "Groceries"
  T+30sec  Uploaded to Supabase

Phone (BACK ONLINE):
  T+5min   processSyncQueue() uploads amount change ($55)
  T+5min   Delta sync pulls laptop's category change

  SyncEngine.detectConflict():
    - Updates within 1 second of each other?
      No — 5 min apart. Clear time winner.
    - BUT both changed the same record...

  SyncEngine field-level merge:
    - Phone changed: amount ($50 → $55)          ← phone wins
    - Laptop changed: category (Food → Groceries) ← laptop wins
    - Different fields! Auto-merged. No conflict.

  Result: amount=$55, category="Groceries"
  Both devices get the merged version.
```

#### Scenario 4: Critical Conflict — Two Devices Change Amount

```
Timeline:
────────────────────────────────────────────────────────────────

Phone (OFFLINE):
  T+0ms    Changes amount: $50 → $55

Laptop (OFFLINE):
  T+10sec  Changes amount: $50 → $48

Both come online at ~T+5min:

  SyncEngine.detectConflict():
    - Both changed the "amount" field
    - "amount" is in CRITICAL_FIELDS for transactions
    - autoResolve = true → LWW resolves automatically
      (whichever device's change has the later timestamp wins)

  OR if autoResolve = false:
    - Conflict queued in pendingConflicts[]
    - UI shows conflict resolution dialog:

    ┌──────────────────────────────────────────┐
    │  Conflict: Transaction Amount            │
    │                                          │
    │  "Costco" — Feb 22, 2026                │
    │                                          │
    │  📱 Your phone:  $55.00  (10:15am)      │
    │  💻 Your laptop: $48.00  (10:15am)      │
    │                                          │
    │  [Keep $55.00]  [Keep $48.00]  [Custom]  │
    └──────────────────────────────────────────┘
```

#### Scenario 5: Initial Setup — First Cloud Sync (Migration)

```
Timeline:
────────────────────────────────────────────────────────────────

User clicks "Enable Cloud Sync" in Settings:

  T+0      Sign up / sign in to Supabase
  T+5sec   Choose encryption tier (Standard / E2E / Zero-Knowledge)
  T+10sec  SyncEngine.getLocalData() collects all IndexedDB data
  T+15sec  Data serialized to SyncEntity format

  Progress UI:
  ┌──────────────────────────────────────────┐
  │  Uploading your data to the cloud...     │
  │                                          │
  │  ████████████████░░░░░░  72%             │
  │                                          │
  │  Accounts:      5/5     ✓                │
  │  Transactions:  894/1,247  ⟳             │
  │  Categories:    13/13   ✓                │
  │  Budgets:       8/8     ✓                │
  │  Subscriptions: 6/6     ✓                │
  │  Receipts:      12/45   ⟳                │
  │                                          │
  │  [Cancel]                                │
  └──────────────────────────────────────────┘

  T+2min   Upload complete
  T+2min   Checksum verification (SHA-256 of all records)
  T+2min   "Cloud sync enabled! ✓"

  From now on:
  - Every local change syncs to cloud automatically
  - Other devices can sign in and pull the data
```

### Sync Status UI

Users always need to know the state of their data. A sync status indicator appears in the app header:

```
States:

✓ Synced          — All data up to date across devices
⟳ Syncing...      — Sync in progress (with progress indicator)
⚠️ 3 pending       — Changes queued (offline)
❌ Sync error      — Last sync failed (tap to retry)
📱 2 devices online — Presence indicator (Family plan)
```

**Detailed sync panel** (tap on status indicator):

```
┌──────────────────────────────────────────┐
│  Sync Status                      [×]    │
│                                          │
│  Last synced: 2 minutes ago              │
│  Pending changes: 0                      │
│                                          │
│  Devices:                                │
│  📱 Rob's Phone       Online   ✓ Synced  │
│  💻 Rob's Laptop      Online   ✓ Synced  │
│  📱 Sarah's Phone     Offline  ⚠️ 3h ago │
│                                          │
│  [Sync Now]  [Sync Settings]             │
└──────────────────────────────────────────┘
```

### Edge Cases & How We Handle Them

#### 1. Large Dataset Sync (10,000+ Transactions)

- **Problem**: Full sync of 10K+ records is slow and may timeout
- **Solution**: Paginated sync — upload/download in batches of 500 records with progress indicator. Use cursor-based pagination (existing `nextCursor` in `SyncResponsePayload`).

#### 2. Receipt/Image Sync

- **Problem**: Receipts are binary blobs (images, PDFs) — expensive to sync
- **Solution**: Receipts sync separately from transactional data. Low priority in entity ordering. Store in Supabase Storage (not PostgreSQL). Sync thumbnails first, full images on demand.

#### 3. Stale Offline Queue

- **Problem**: User goes offline for weeks, comes back with outdated changes
- **Solution**: Changes in OfflineManager have expiration. Stale changes (>7 days old) trigger a full sync instead of delta, with conflict resolution for any divergent data.

#### 4. Browser Storage Limits (IndexedDB)

- **Problem**: Apple Safari deletes IndexedDB data after 7 days of no visits
- **Solution**: Show "Return within 7 days to keep your local data" warning for Safari users. In online mode, this is less critical because cloud has the authoritative copy — the app simply re-downloads on next visit.

#### 5. Slow Network / Timeout

- **Problem**: Sync fails midway on slow connections
- **Solution**: Checkpoint system tracks sync progress per entity type. On failure, resume from last successful checkpoint rather than restarting. OfflineManager's exponential backoff handles retries.

#### 6. Multiple Tabs Open

- **Problem**: User has the app open in two browser tabs
- **Solution**: Use BroadcastChannel API to coordinate between tabs. Only one tab syncs at a time (elected via tab leader election). Changes in one tab propagate to other tabs via IndexedDB observer.

#### 7. Clock Skew Between Devices

- **Problem**: Device clocks are not perfectly synchronized
- **Solution**: Server timestamp (`updated_at DEFAULT now()` in Supabase) is the authoritative time source. Client timestamps are used for local ordering only. Vector clocks handle causal ordering independent of wall clock time.

#### 8. Network Partition During Family Sync

- **Problem**: Family member's device is offline, makes changes, other members keep working
- **Solution**: Each device maintains its own vector clock entry. When the offline device reconnects, the SyncEngine merges all changes using the vector clock to determine causal ordering. Field-level merge resolves most conflicts automatically.

### Performance Targets

| Metric                     | Target                       | Measurement                                           |
| -------------------------- | ---------------------------- | ----------------------------------------------------- |
| Delta sync latency         | < 2 seconds                  | Time from change on Device A to UI update on Device B |
| Full sync (1,000 records)  | < 10 seconds                 | Time to upload/download complete dataset              |
| Full sync (10,000 records) | < 60 seconds                 | Paginated with progress indicator                     |
| Offline queue drain        | < 30 seconds for 100 changes | Time to process pending queue on reconnect            |
| Conflict detection         | < 100ms                      | Time to run conflict detection on a batch             |
| Realtime notification      | < 500ms                      | Time from Supabase broadcast to client receipt        |

### Supabase Realtime Configuration

```typescript
// One channel per household
const channel = supabase.channel(`household:${householdId}`, {
  config: {
    broadcast: { self: false }, // Don't echo back to sender
    presence: { key: deviceId }, // Track device presence
  },
});

// Listen for change notifications
channel.on("broadcast", { event: "sync_change" }, (payload) => {
  // payload: { entity: "transactions", device_id: "abc", count: 3 }
  // Trigger delta sync for the changed entity type
  syncEngine.performDeltaSync(/* ... */);
});

// Track which devices are online
channel.on("presence", { event: "sync" }, () => {
  const onlineDevices = channel.presenceState();
  // Update UI with online device count
});

// Announce this device's presence
channel.subscribe(async (status) => {
  if (status === "SUBSCRIBED") {
    await channel.track({
      device_id: deviceId,
      device_name: deviceName,
      device_type: "phone", // or 'laptop', 'tablet', 'desktop'
      online_at: new Date().toISOString(),
    });
  }
});
```

### Testing Multi-Device Sync

#### Unit Tests (Vitest)

- Cloud transport: mock Supabase client, verify REST calls and Realtime subscriptions
- Conflict detection: test all scenarios (no conflict, field-level merge, critical field conflict, LWW resolution)
- Offline queue: test enqueue, dequeue, expiration, retry backoff
- Vector clock: test causal ordering with concurrent changes

#### Integration Tests (Vitest + Supabase Local)

- Full sync round-trip: upload from Device A, download to Device B, verify identical data
- Delta sync: change on A, verify only changed records arrive at B
- Concurrent edits: simultaneous changes on A and B, verify correct merge
- Offline + reconnect: queue changes, restore connection, verify drain + sync

#### E2E Tests (Playwright)

- Two browser contexts simulating two devices
- Add transaction on Context A, verify it appears on Context B
- Go offline on Context A (intercept network), make changes, reconnect, verify sync
- Trigger conflict, verify resolution dialog appears and works

## Sources

- [Offline Sync & Conflict Resolution Patterns — Practical Guide (Feb 2026)](https://www.sachith.co.uk/offline-sync-conflict-resolution-patterns-architecture-trade%E2%80%91offs-practical-guide-feb-19-2026/)
- [Designing a Robust Data Synchronization System for Multi-Device Mobile Applications](https://medium.com/@engineervishvnath/designing-a-robust-data-synchronization-system-for-multi-device-mobile-applications-c0b23e4fc0cb)
- [A Design Guide for Building Offline First Apps — Hasura](https://hasura.io/blog/design-guide-to-offline-first-apps)
- [Designing Offline-First Web Apps — A List Apart](https://alistapart.com/article/offline-first/)
- [Complete Guide to Offline-First Architecture — droidcon](https://www.droidcon.com/2025/12/16/the-complete-guide-to-offline-first-architecture-in-android/)
- [Offline Data Synchronization in Mobile Apps](https://www.ideas2it.com/blogs/offline-sync-native-apps)
