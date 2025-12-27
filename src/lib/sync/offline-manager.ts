/**
 * Offline Manager Module
 * Phase 7: LAN Sync - L-014
 *
 * Handles offline scenarios, change queuing, and automatic reconnection
 * for LAN sync functionality.
 */

import type {
  ChangeSet,
  SyncEntity,
  EntityType,
} from './types';

// ============================================================================
// Constants
// ============================================================================

const QUEUE_STORAGE_KEY = 'budget-app-sync-queue';
const RETRY_INTERVALS = [1000, 2000, 5000, 10000, 30000, 60000]; // Exponential backoff
const MAX_QUEUE_SIZE = 1000; // Maximum pending changes before forced sync
const QUEUE_PERSIST_INTERVAL = 5000; // Persist queue every 5 seconds

// ============================================================================
// Types
// ============================================================================

export interface QueuedChange {
  id: string;
  entityType: EntityType;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: SyncEntity | null;
  timestamp: number;
  retryCount: number;
  targetDeviceId?: string; // If targeting specific device, otherwise broadcast
}

export interface OfflineManagerConfig {
  onOnline?: () => void;
  onOffline?: () => void;
  onQueueChange?: (queue: QueuedChange[]) => void;
  onReconnectAttempt?: (attempt: number, maxAttempts: number) => void;
  onSyncRequired?: (queue: QueuedChange[]) => Promise<void>;
}

export interface OfflineStatus {
  isOnline: boolean;
  isLANAvailable: boolean;
  queuedChanges: number;
  lastOnlineAt: Date | null;
  reconnectAttempt: number;
}

// ============================================================================
// Offline Manager Class
// ============================================================================

export class OfflineManager {
  private queue: QueuedChange[] = [];
  private isOnline = true;
  private isLANAvailable = false;
  private lastOnlineAt: Date | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private persistTimer: ReturnType<typeof setInterval> | null = null;
  private config: OfflineManagerConfig;

  constructor(config: OfflineManagerConfig = {}) {
    this.config = config;
    this.loadQueue();
    this.setupNetworkListeners();
    this.startPersistTimer();
  }

  // ==========================================================================
  // Network Status
  // ==========================================================================

  /**
   * Set up listeners for network status changes
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    // Browser online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Initial status
    this.isOnline = navigator.onLine;
    if (this.isOnline) {
      this.lastOnlineAt = new Date();
    }
  }

  /**
   * Handle coming online
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.lastOnlineAt = new Date();
    this.reconnectAttempt = 0;

    this.config.onOnline?.();

    // Attempt to sync queued changes
    if (this.queue.length > 0) {
      this.processSyncQueue();
    }
  }

  /**
   * Handle going offline
   */
  private handleOffline(): void {
    this.isOnline = false;
    this.stopReconnect();
    this.config.onOffline?.();
  }

  /**
   * Set LAN availability status (called when sync connection status changes)
   */
  setLANAvailable(available: boolean): void {
    const wasAvailable = this.isLANAvailable;
    this.isLANAvailable = available;

    if (!wasAvailable && available) {
      // LAN just became available
      this.reconnectAttempt = 0;
      if (this.queue.length > 0) {
        this.processSyncQueue();
      }
    } else if (wasAvailable && !available) {
      // LAN just became unavailable
      this.startReconnectTimer();
    }
  }

  /**
   * Get current offline status
   */
  getStatus(): OfflineStatus {
    return {
      isOnline: this.isOnline,
      isLANAvailable: this.isLANAvailable,
      queuedChanges: this.queue.length,
      lastOnlineAt: this.lastOnlineAt,
      reconnectAttempt: this.reconnectAttempt,
    };
  }

  // ==========================================================================
  // Change Queue
  // ==========================================================================

  /**
   * Queue a change for later sync
   */
  queueChange(change: Omit<QueuedChange, 'id' | 'timestamp' | 'retryCount'>): void {
    const queuedChange: QueuedChange = {
      ...change,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    // Check if we already have a pending change for this entity
    const existingIndex = this.queue.findIndex(
      (c) => c.entityType === change.entityType && c.entityId === change.entityId
    );

    if (existingIndex >= 0) {
      // Replace existing change with newer one
      // If delete + create, the delete wins; if update + update, latest wins
      const existing = this.queue[existingIndex];
      
      if (existing.operation === 'delete' && change.operation !== 'delete') {
        // Keep the delete (entity was deleted, subsequent changes are moot)
        return;
      }
      
      if (change.operation === 'delete') {
        // Delete supersedes all
        this.queue[existingIndex] = queuedChange;
      } else {
        // Merge updates
        this.queue[existingIndex] = queuedChange;
      }
    } else {
      // Add new change
      this.queue.push(queuedChange);
    }

    // Enforce max queue size
    if (this.queue.length > MAX_QUEUE_SIZE) {
      // Remove oldest low-priority changes
      this.queue.sort((a, b) => b.timestamp - a.timestamp);
      this.queue = this.queue.slice(0, MAX_QUEUE_SIZE);
    }

    this.config.onQueueChange?.(this.queue);

    // If LAN is available, try to sync immediately
    if (this.isLANAvailable && this.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Queue multiple changes as a batch
   */
  queueChanges(changes: Omit<QueuedChange, 'id' | 'timestamp' | 'retryCount'>[]): void {
    changes.forEach((change) => this.queueChange(change));
  }

  /**
   * Get all queued changes
   */
  getQueue(): QueuedChange[] {
    return [...this.queue];
  }

  /**
   * Get queued changes for a specific entity type
   */
  getQueuedChangesForType(entityType: EntityType): QueuedChange[] {
    return this.queue.filter((c) => c.entityType === entityType);
  }

  /**
   * Remove a change from the queue (after successful sync)
   */
  removeFromQueue(changeId: string): void {
    this.queue = this.queue.filter((c) => c.id !== changeId);
    this.config.onQueueChange?.(this.queue);
  }

  /**
   * Remove multiple changes from the queue
   */
  removeFromQueueBatch(changeIds: string[]): void {
    const idSet = new Set(changeIds);
    this.queue = this.queue.filter((c) => !idSet.has(c.id));
    this.config.onQueueChange?.(this.queue);
  }

  /**
   * Clear the entire queue
   */
  clearQueue(): void {
    this.queue = [];
    this.config.onQueueChange?.(this.queue);
    this.persistQueue();
  }

  /**
   * Mark a change as failed (increment retry count)
   */
  markChangeFailed(changeId: string): void {
    const change = this.queue.find((c) => c.id === changeId);
    if (change) {
      change.retryCount++;
    }
  }

  /**
   * Convert queue to ChangeSet format for sync engine
   */
  queueToChangeSets(): ChangeSet[] {
    const grouped = new Map<EntityType, QueuedChange[]>();

    // Group by entity type
    for (const change of this.queue) {
      const existing = grouped.get(change.entityType) || [];
      existing.push(change);
      grouped.set(change.entityType, existing);
    }

    // Convert to ChangeSets
    const changeSets: ChangeSet[] = [];

    for (const [entityType, changes] of grouped) {
      const operations = changes.map((change) => ({
        type: change.operation,
        id: change.entityId,
        data: change.data ? (change.data as unknown as Record<string, unknown>) : undefined,
        version: 1, // Will be updated by sync engine
        timestamp: change.timestamp,
      }));

      if (operations.length > 0) {
        changeSets.push({
          entity: entityType,
          operations,
        });
      }
    }

    return changeSets;
  }

  // ==========================================================================
  // Queue Persistence
  // ==========================================================================

  /**
   * Load queue from storage
   */
  private loadQueue(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.queue = [];
    }
  }

  /**
   * Persist queue to storage
   */
  private persistQueue(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  }

  /**
   * Start periodic queue persistence
   */
  private startPersistTimer(): void {
    if (typeof window === 'undefined') return;

    this.persistTimer = setInterval(() => {
      this.persistQueue();
    }, QUEUE_PERSIST_INTERVAL);
  }

  // ==========================================================================
  // Reconnection
  // ==========================================================================

  /**
   * Start reconnection timer with exponential backoff
   */
  private startReconnectTimer(): void {
    if (this.reconnectTimer) return;
    if (!this.isOnline) return;

    const interval = RETRY_INTERVALS[
      Math.min(this.reconnectAttempt, RETRY_INTERVALS.length - 1)
    ];

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.attemptReconnect();
    }, interval);
  }

  /**
   * Attempt to reconnect
   */
  private async attemptReconnect(): Promise<void> {
    if (!this.isOnline) return;

    this.reconnectAttempt++;
    this.config.onReconnectAttempt?.(
      this.reconnectAttempt,
      RETRY_INTERVALS.length
    );

    // The actual reconnection is handled by the sync connection manager
    // This just triggers the callback
    // If reconnection fails, startReconnectTimer will be called again
    // from the sync connection manager

    // If we've exceeded max attempts, slow down significantly
    if (this.reconnectAttempt >= RETRY_INTERVALS.length) {
      // After max retries, wait 5 minutes between attempts
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.attemptReconnect();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Stop reconnection attempts
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Reset reconnection attempts (call after successful connection)
   */
  resetReconnectAttempts(): void {
    this.reconnectAttempt = 0;
    this.stopReconnect();
  }

  // ==========================================================================
  // Sync Queue Processing
  // ==========================================================================

  /**
   * Process the sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.queue.length === 0) return;
    if (!this.isOnline || !this.isLANAvailable) return;

    try {
      await this.config.onSyncRequired?.(this.queue);
    } catch (error) {
      console.error('Failed to process sync queue:', error);
      // Will retry on next opportunity
    }
  }

  /**
   * Manually trigger sync queue processing
   */
  async triggerSync(): Promise<void> {
    await this.processSyncQueue();
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Clean up resources
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }

    this.stopReconnect();

    if (this.persistTimer) {
      clearInterval(this.persistTimer);
      this.persistTimer = null;
    }

    // Final persist
    this.persistQueue();
  }
}

// ============================================================================
// Factory Function
// ============================================================================

let offlineManagerInstance: OfflineManager | null = null;

/**
 * Get or create the singleton offline manager
 */
export function getOfflineManager(config?: OfflineManagerConfig): OfflineManager {
  if (!offlineManagerInstance) {
    offlineManagerInstance = new OfflineManager(config);
  }
  return offlineManagerInstance;
}

/**
 * Create a new offline manager (for testing or isolation)
 */
export function createOfflineManager(config?: OfflineManagerConfig): OfflineManager {
  return new OfflineManager(config);
}

// ============================================================================
// React Hook Helpers
// ============================================================================

/**
 * Create an observable wrapper for React integration
 */
export interface OfflineStateObserver {
  subscribe: (callback: (status: OfflineStatus) => void) => () => void;
  getStatus: () => OfflineStatus;
}

export function createOfflineStateObserver(manager: OfflineManager): OfflineStateObserver {
  const listeners = new Set<(status: OfflineStatus) => void>();

  // Re-configure manager to notify listeners
  const originalConfig = (manager as unknown as { config: OfflineManagerConfig }).config;
  
  const notifyAll = () => {
    const status = manager.getStatus();
    listeners.forEach((listener) => listener(status));
  };

  Object.assign(originalConfig, {
    onOnline: () => {
      originalConfig.onOnline?.();
      notifyAll();
    },
    onOffline: () => {
      originalConfig.onOffline?.();
      notifyAll();
    },
    onQueueChange: (queue: QueuedChange[]) => {
      originalConfig.onQueueChange?.(queue);
      notifyAll();
    },
  });

  return {
    subscribe: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    getStatus: () => manager.getStatus(),
  };
}

// ============================================================================
// Exports
// ============================================================================

export default OfflineManager;
