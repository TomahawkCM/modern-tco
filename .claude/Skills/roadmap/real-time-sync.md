---
name: real-time-sync
description: Use when implementing cloud sync, conflict resolution, multi-device data flow, or offline-to-online synchronization.
---

# Real-Time Sync

## Overview

Implements multi-device sync using Supabase real-time subscriptions with CRDT-based conflict resolution. Handles the offline→online transition, sync queues, optimistic updates, and LAN sync integration. All synced data remains encrypted — the server only sees ciphertext.

## When to Use

- Implementing cloud sync for budget data
- Building conflict resolution for concurrent edits
- Creating offline queue that syncs when online
- Integrating LAN sync with cloud sync
- Monitoring sync health and retry strategies
- Handling optimistic updates with rollback

## Core Principles

- **Encrypted sync** — Only ciphertext travels over the network; server never sees plaintext
- **Offline-first** — App works fully offline; sync is enhancement when online
- **Last-write-wins + CRDT** — Simple fields use LWW, collections use CRDT merge
- **Optimistic updates** — UI updates immediately, syncs in background
- **Retry with backoff** — Failed syncs retry with exponential backoff (1s, 2s, 4s, 8s, max 60s)

## Workflow

### Step 1: Sync Architecture

```
┌──────────────────────────────────┐
│           Client A               │
│  IndexedDB (encrypted) ──┐      │
│  Sync Queue ──────────────┤     │
│  Real-time Listener ◄─────┤     │
└───────────────────────────┤─────┘
                            │
                   ┌────────▼────────┐
                   │   Supabase      │
                   │   (ciphertext   │
                   │    only)        │
                   └────────┬────────┘
                            │
┌───────────────────────────┤─────┐
│           Client B        │     │
│  Real-time Listener ◄─────┤     │
│  Sync Queue ──────────────┤     │
│  IndexedDB (encrypted) ──┘     │
└──────────────────────────────────┘
```

### Step 2: Sync Queue for Offline Changes

```ts
interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  encryptedData: string;    // Already encrypted before queuing
  timestamp: string;        // ISO timestamp
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

class SyncQueue {
  async enqueue(item: Omit<SyncQueueItem, 'id' | 'retryCount' | 'status'>): Promise<void> {
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      retryCount: 0,
      status: 'pending',
    };
    await this.store.put('sync-queue', queueItem);
    this.processQueue(); // Try immediately if online
  }

  async processQueue(): Promise<void> {
    if (!navigator.onLine) return;

    const pending = await this.store.getAll('sync-queue');
    const sorted = pending
      .filter(i => i.status !== 'syncing')
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    for (const item of sorted) {
      try {
        item.status = 'syncing';
        await this.store.put('sync-queue', item);
        await this.syncToServer(item);
        await this.store.delete('sync-queue', item.id);
      } catch (error) {
        item.status = 'failed';
        item.retryCount++;
        await this.store.put('sync-queue', item);
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, item.retryCount), 60000);
        setTimeout(() => this.processQueue(), delay);
        break;
      }
    }
  }
}
```

### Step 3: Supabase Real-Time Subscriptions

```ts
import { createClient } from '@supabase/supabase-js';

function useRealtimeSync(userId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  useEffect(() => {
    const channel = supabase
      .channel('budget-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'encrypted_records',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
            case 'UPDATE':
              // Decrypt and merge into local store
              handleIncomingChange(payload.new);
              break;
            case 'DELETE':
              handleIncomingDelete(payload.old.id);
              break;
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);
}
```

### Step 4: Conflict Resolution (LWW + CRDT)

```ts
interface SyncRecord {
  id: string;
  encryptedData: string;
  updatedAt: string;      // ISO timestamp
  vectorClock: Record<string, number>;  // {deviceA: 3, deviceB: 2}
  deleted: boolean;
}

function resolveConflict(local: SyncRecord, remote: SyncRecord): SyncRecord {
  // Compare vector clocks
  const localDominates = Object.entries(local.vectorClock).every(
    ([device, count]) => count >= (remote.vectorClock[device] || 0)
  );
  const remoteDominates = Object.entries(remote.vectorClock).every(
    ([device, count]) => count >= (local.vectorClock[device] || 0)
  );

  if (localDominates) return local;
  if (remoteDominates) return remote;

  // Concurrent edits — use LWW (last write wins) by timestamp
  return local.updatedAt > remote.updatedAt ? local : remote;
}
```

### Step 5: Optimistic Updates

```ts
function useOptimisticUpdate<T>() {
  const [optimisticData, setOptimisticData] = useState<T[]>([]);

  const optimisticUpdate = async (
    update: () => T[],
    syncFn: () => Promise<void>
  ) => {
    // Apply immediately to UI
    const newData = update();
    setOptimisticData(newData);

    try {
      // Sync in background
      await syncFn();
    } catch (error) {
      // Rollback on failure
      setOptimisticData(prev => prev); // Revert
      toast.error('Sync failed. Changes saved locally.');
    }
  };

  return { optimisticData, optimisticUpdate };
}
```

### Step 6: Sync Health Monitoring

```tsx
function SyncHealthIndicator() {
  const { queueSize, lastSyncTime, isOnline, syncErrors } = useSyncHealth();

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'h-2 w-2 rounded-full',
        isOnline && queueSize === 0 ? 'bg-green-500' :
        isOnline && queueSize > 0 ? 'bg-yellow-500' :
        'bg-red-500'
      )} />
      <span className="text-xs text-muted-foreground">
        {isOnline ? (queueSize > 0 ? `Syncing ${queueSize} changes...` : 'Synced') : 'Offline'}
      </span>
    </div>
  );
}
```

## Key Files

| File | Role |
|------|------|
| `src/lib/encryption/encrypted-db-wrapper.ts` | Encrypted local storage |
| `src/lib/lan-sync*.ts` | LAN sync modules |
| `src/contexts/` | Data contexts with sync integration |
| `src/app/api/` | API routes for sync endpoints |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Syncing plaintext data | Always encrypt before enqueuing for sync |
| No offline queue | Changes made offline must queue for later sync |
| Ignoring conflicts | Implement vector clocks + LWW resolution |
| Retry without backoff | Use exponential backoff (max 60s) |
| UI blocks during sync | Use optimistic updates; sync in background |
| No sync health indicator | Show sync status to user |

## Validation Checklist

- [ ] All synced data is encrypted (ciphertext only on server)
- [ ] Offline changes queued and synced when online
- [ ] Conflict resolution handles concurrent edits
- [ ] Optimistic updates with rollback on failure
- [ ] Exponential backoff for failed syncs
- [ ] Sync health indicator visible to user
- [ ] Real-time subscriptions working for multi-device
- [ ] LAN sync integration doesn't conflict with cloud sync

## Related Skills

- `e2e-encryption` — encryption patterns for synced data
- `supabase-patterns` — Supabase real-time and RLS
- `plaid-integration` — synced bank data
- `family-sharing` — shared data sync between family members
