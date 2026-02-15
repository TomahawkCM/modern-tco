/**
 * Offline Sync React Hook
 * Phase 7: LAN Sync - L-014
 *
 * Provides React integration for offline sync management
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  type OfflineManager,
  getOfflineManager,
  createOfflineStateObserver,
  type OfflineStatus,
  type QueuedChange,
  type OfflineManagerConfig,
} from "@/lib/sync/offline-manager";
import type { EntityType, SyncEntity } from "@/lib/sync/types";

// ============================================================================
// Types
// ============================================================================

export interface UseOfflineSyncOptions {
  /** Auto-initialize on mount */
  autoInit?: boolean;
  /** Callback when sync is needed */
  onSyncRequired?: (queue: QueuedChange[]) => Promise<void>;
  /** Callback when online status changes */
  onOnlineChange?: (isOnline: boolean) => void;
  /** Callback when reconnection is attempted */
  onReconnectAttempt?: (attempt: number, maxAttempts: number) => void;
}

export interface UseOfflineSyncResult {
  /** Current offline status */
  status: OfflineStatus;
  /** Queue a change for sync */
  queueChange: (
    entityType: EntityType,
    entityId: string,
    operation: "create" | "update" | "delete",
    data?: SyncEntity | null
  ) => void;
  /** Get all queued changes */
  getQueue: () => QueuedChange[];
  /** Clear the sync queue */
  clearQueue: () => void;
  /** Remove a specific change from queue */
  removeFromQueue: (changeId: string) => void;
  /** Mark a change as synced (remove from queue) */
  markSynced: (changeIds: string[]) => void;
  /** Manually trigger sync */
  triggerSync: () => Promise<void>;
  /** Set LAN availability */
  setLANAvailable: (available: boolean) => void;
  /** Reset reconnection attempts */
  resetReconnect: () => void;
  /** Is the app currently online? */
  isOnline: boolean;
  /** Is LAN sync available? */
  isLANAvailable: boolean;
  /** Number of pending changes */
  pendingCount: number;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useOfflineSync(options: UseOfflineSyncOptions = {}): UseOfflineSyncResult {
  const { autoInit = true, onSyncRequired, onOnlineChange, onReconnectAttempt } = options;

  const managerRef = useRef<OfflineManager | null>(null);
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isLANAvailable: false,
    queuedChanges: 0,
    lastOnlineAt: null,
    reconnectAttempt: 0,
  });

  // Initialize manager
  useEffect(() => {
    if (!autoInit) return;

    const config: OfflineManagerConfig = {
      onOnline: () => {
        onOnlineChange?.(true);
      },
      onOffline: () => {
        onOnlineChange?.(false);
      },
      onQueueChange: (queue) => {
        setStatus((prev) => ({
          ...prev,
          queuedChanges: queue.length,
        }));
      },
      onReconnectAttempt: (attempt, max) => {
        onReconnectAttempt?.(attempt, max);
        setStatus((prev) => ({
          ...prev,
          reconnectAttempt: attempt,
        }));
      },
      onSyncRequired: async (queue) => {
        await onSyncRequired?.(queue);
      },
    };

    const manager = getOfflineManager(config);
    managerRef.current = manager;

    // Create observer for status updates
    const observer = createOfflineStateObserver(manager);
    const unsubscribe = observer.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    // Set initial status
    setStatus(manager.getStatus());

    return () => {
      unsubscribe();
    };
  }, [autoInit, onSyncRequired, onOnlineChange, onReconnectAttempt]);

  // Queue a change
  const queueChange = useCallback(
    (
      entityType: EntityType,
      entityId: string,
      operation: "create" | "update" | "delete",
      data?: SyncEntity | null
    ) => {
      managerRef.current?.queueChange({
        entityType,
        entityId,
        operation,
        data: data ?? null,
      });
    },
    []
  );

  // Get queue
  const getQueue = useCallback(() => {
    return managerRef.current?.getQueue() ?? [];
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    managerRef.current?.clearQueue();
  }, []);

  // Remove from queue
  const removeFromQueue = useCallback((changeId: string) => {
    managerRef.current?.removeFromQueue(changeId);
  }, []);

  // Mark synced
  const markSynced = useCallback((changeIds: string[]) => {
    managerRef.current?.removeFromQueueBatch(changeIds);
  }, []);

  // Trigger sync
  const triggerSync = useCallback(async () => {
    await managerRef.current?.triggerSync();
  }, []);

  // Set LAN availability
  const setLANAvailable = useCallback((available: boolean) => {
    managerRef.current?.setLANAvailable(available);
    setStatus((prev) => ({
      ...prev,
      isLANAvailable: available,
    }));
  }, []);

  // Reset reconnect
  const resetReconnect = useCallback(() => {
    managerRef.current?.resetReconnectAttempts();
    setStatus((prev) => ({
      ...prev,
      reconnectAttempt: 0,
    }));
  }, []);

  return {
    status,
    queueChange,
    getQueue,
    clearQueue,
    removeFromQueue,
    markSynced,
    triggerSync,
    setLANAvailable,
    resetReconnect,
    isOnline: status.isOnline,
    isLANAvailable: status.isLANAvailable,
    pendingCount: status.queuedChanges,
  };
}

// ============================================================================
// Utility Hook for Simple Status
// ============================================================================

/**
 * Simple hook that just returns online/offline status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// ============================================================================
// Exports
// ============================================================================

export default useOfflineSync;
