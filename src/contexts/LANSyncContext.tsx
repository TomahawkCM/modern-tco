/**
 * LAN Sync Context (L-015)
 *
 * Provides global state management for LAN sync functionality.
 * Tracks sync status, connected devices, and sync health.
 */

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  PairedDevice,
  VectorClock,
  SyncEventListener,
  SyncEvent,
} from '@/lib/lan-sync';
import { DeviceManager, type LocalDeviceInfo } from '@/lib/lan-sync-devices';
import {
  EncryptedConnectionPool,
  type EncryptedSyncConnection,
} from '@/lib/lan-sync-encrypted-connection';

// ============================================================================
// Types
// ============================================================================

export type SyncHealth = 'healthy' | 'warning' | 'error' | 'offline';
export type DeviceConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'error';

export interface DeviceSyncStatus {
  deviceId: string;
  deviceName: string;
  connectionState: DeviceConnectionState;
  lastSyncAt: Date | null;
  pendingChanges: number;
  lastError?: string;
  lastErrorAt?: Date;
  isOnline: boolean;
}

export interface SyncAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  deviceId?: string;
  timestamp: Date;
  dismissed: boolean;
}

export interface SyncStats {
  totalDevices: number;
  connectedDevices: number;
  pendingChanges: number;
  lastSyncAt: Date | null;
  health: SyncHealth;
}

export interface LANSyncState {
  isEnabled: boolean;
  isInitialized: boolean;
  localDevice: LocalDeviceInfo | null;
  pairedDevices: PairedDevice[];
  deviceStatuses: Map<string, DeviceSyncStatus>;
  vectorClock: VectorClock;
  alerts: SyncAlert[];
  isSyncing: boolean;
  lastGlobalSyncAt: Date | null;
  health: SyncHealth;
  error: string | null;
}

// ============================================================================
// Actions
// ============================================================================

type LANSyncAction =
  | { type: 'INITIALIZE'; localDevice: LocalDeviceInfo }
  | { type: 'SET_ENABLED'; enabled: boolean }
  | { type: 'SET_PAIRED_DEVICES'; devices: PairedDevice[] }
  | { type: 'ADD_PAIRED_DEVICE'; device: PairedDevice }
  | { type: 'REMOVE_PAIRED_DEVICE'; deviceId: string }
  | { type: 'UPDATE_DEVICE_STATUS'; deviceId: string; status: Partial<DeviceSyncStatus> }
  | { type: 'SET_DEVICE_CONNECTION_STATE'; deviceId: string; state: DeviceConnectionState }
  | { type: 'UPDATE_VECTOR_CLOCK'; clock: VectorClock }
  | { type: 'ADD_ALERT'; alert: SyncAlert }
  | { type: 'DISMISS_ALERT'; alertId: string }
  | { type: 'CLEAR_ALERTS' }
  | { type: 'SET_SYNCING'; isSyncing: boolean }
  | { type: 'SYNC_COMPLETED'; deviceId: string }
  | { type: 'SYNC_FAILED'; deviceId: string; error: string }
  | { type: 'SET_HEALTH'; health: SyncHealth }
  | { type: 'SET_ERROR'; error: string | null };

// ============================================================================
// Initial State
// ============================================================================

const initialState: LANSyncState = {
  isEnabled: false,
  isInitialized: false,
  localDevice: null,
  pairedDevices: [],
  deviceStatuses: new Map(),
  vectorClock: {},
  alerts: [],
  isSyncing: false,
  lastGlobalSyncAt: null,
  health: 'offline',
  error: null,
};

// ============================================================================
// Reducer
// ============================================================================

function lanSyncReducer(state: LANSyncState, action: LANSyncAction): LANSyncState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isInitialized: true,
        localDevice: action.localDevice,
        health: 'healthy',
      };

    case 'SET_ENABLED':
      return {
        ...state,
        isEnabled: action.enabled,
        health: action.enabled ? state.health : 'offline',
      };

    case 'SET_PAIRED_DEVICES': {
      const newStatuses = new Map(state.deviceStatuses);
      action.devices.forEach((device) => {
        if (!newStatuses.has(device.id)) {
          newStatuses.set(device.id, {
            deviceId: device.id,
            deviceName: device.name,
            connectionState: 'disconnected',
            lastSyncAt: device.lastSyncAt || null,
            pendingChanges: 0,
            isOnline: false,
          });
        }
      });
      return {
        ...state,
        pairedDevices: action.devices,
        deviceStatuses: newStatuses,
      };
    }

    case 'ADD_PAIRED_DEVICE': {
      const newStatuses = new Map(state.deviceStatuses);
      newStatuses.set(action.device.id, {
        deviceId: action.device.id,
        deviceName: action.device.name,
        connectionState: 'disconnected',
        lastSyncAt: action.device.lastSyncAt || null,
        pendingChanges: 0,
        isOnline: false,
      });
      return {
        ...state,
        pairedDevices: [...state.pairedDevices, action.device],
        deviceStatuses: newStatuses,
      };
    }

    case 'REMOVE_PAIRED_DEVICE': {
      const newStatuses = new Map(state.deviceStatuses);
      newStatuses.delete(action.deviceId);
      return {
        ...state,
        pairedDevices: state.pairedDevices.filter((d) => d.id !== action.deviceId),
        deviceStatuses: newStatuses,
      };
    }

    case 'UPDATE_DEVICE_STATUS': {
      const newStatuses = new Map(state.deviceStatuses);
      const existing = newStatuses.get(action.deviceId);
      if (existing) {
        newStatuses.set(action.deviceId, { ...existing, ...action.status });
      }
      return {
        ...state,
        deviceStatuses: newStatuses,
        health: calculateHealth(newStatuses),
      };
    }

    case 'SET_DEVICE_CONNECTION_STATE': {
      const newStatuses = new Map(state.deviceStatuses);
      const existing = newStatuses.get(action.deviceId);
      if (existing) {
        newStatuses.set(action.deviceId, {
          ...existing,
          connectionState: action.state,
          isOnline: action.state === 'connected' || action.state === 'syncing',
        });
      }
      return {
        ...state,
        deviceStatuses: newStatuses,
        health: calculateHealth(newStatuses),
      };
    }

    case 'UPDATE_VECTOR_CLOCK':
      return {
        ...state,
        vectorClock: action.clock,
      };

    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.alert, ...state.alerts].slice(0, 50), // Keep last 50 alerts
      };

    case 'DISMISS_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.alertId ? { ...a, dismissed: true } : a
        ),
      };

    case 'CLEAR_ALERTS':
      return {
        ...state,
        alerts: [],
      };

    case 'SET_SYNCING':
      return {
        ...state,
        isSyncing: action.isSyncing,
      };

    case 'SYNC_COMPLETED': {
      const newStatuses = new Map(state.deviceStatuses);
      const existing = newStatuses.get(action.deviceId);
      if (existing) {
        newStatuses.set(action.deviceId, {
          ...existing,
          lastSyncAt: new Date(),
          connectionState: 'connected',
          lastError: undefined,
          lastErrorAt: undefined,
        });
      }
      return {
        ...state,
        deviceStatuses: newStatuses,
        lastGlobalSyncAt: new Date(),
        isSyncing: false,
        health: 'healthy',
      };
    }

    case 'SYNC_FAILED': {
      const newStatuses = new Map(state.deviceStatuses);
      const existing = newStatuses.get(action.deviceId);
      if (existing) {
        newStatuses.set(action.deviceId, {
          ...existing,
          connectionState: 'error',
          lastError: action.error,
          lastErrorAt: new Date(),
        });
      }
      return {
        ...state,
        deviceStatuses: newStatuses,
        isSyncing: false,
        health: calculateHealth(newStatuses),
      };
    }

    case 'SET_HEALTH':
      return {
        ...state,
        health: action.health,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        health: action.error ? 'error' : state.health,
      };

    default:
      return state;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateHealth(deviceStatuses: Map<string, DeviceSyncStatus>): SyncHealth {
  const statuses = Array.from(deviceStatuses.values());
  if (statuses.length === 0) return 'offline';

  const hasError = statuses.some((s) => s.connectionState === 'error');
  const allOffline = statuses.every((s) => !s.isOnline);
  const someOffline = statuses.some((s) => !s.isOnline);

  if (hasError) return 'error';
  if (allOffline) return 'offline';
  if (someOffline) return 'warning';
  return 'healthy';
}

function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Context
// ============================================================================

interface LANSyncContextValue {
  state: LANSyncState;
  // Initialization
  initialize: () => Promise<void>;
  setEnabled: (enabled: boolean) => void;
  // Device management
  addDevice: (device: PairedDevice) => void;
  removeDevice: (deviceId: string) => Promise<void>;
  refreshPairedDevices: () => Promise<void>;
  // Connection management
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnectFromDevice: (deviceId: string) => Promise<void>;
  disconnectAll: () => Promise<void>;
  // Sync operations
  syncWithDevice: (deviceId: string) => Promise<void>;
  syncAll: () => Promise<void>;
  // Alerts
  dismissAlert: (alertId: string) => void;
  clearAlerts: () => void;
  // Stats
  getStats: () => SyncStats;
  // Device manager reference
  deviceManager: DeviceManager | null;
  // Connection pool reference
  connectionPool: EncryptedConnectionPool | null;
}

const LANSyncContext = createContext<LANSyncContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface LANSyncProviderProps {
  children: ReactNode;
  /** Auto-initialize on mount */
  autoInit?: boolean;
}

export function LANSyncProvider({ children, autoInit = true }: LANSyncProviderProps) {
  const [state, dispatch] = useReducer(lanSyncReducer, initialState);

  // Create device manager and connection pool
  const deviceManager = useMemo(() => new DeviceManager(), []);
  const connectionPoolRef = React.useRef<EncryptedConnectionPool | null>(null);

  // Get current vector clock
  const getVectorClock = useCallback(() => state.vectorClock, [state.vectorClock]);

  // Initialize
  const initialize = useCallback(async () => {
    try {
      // Get or create local device
      const localDevice = await deviceManager.getOrCreateLocalDevice();
      dispatch({ type: 'INITIALIZE', localDevice });

      // Load paired devices
      const pairedDevices = await deviceManager.getPairedDevices();
      dispatch({ type: 'SET_PAIRED_DEVICES', devices: pairedDevices });

      // Create connection pool
      connectionPoolRef.current = new EncryptedConnectionPool(
        localDevice.deviceId,
        localDevice.deviceName,
        getVectorClock
      );

      // Initialize encryption keys
      await connectionPoolRef.current.initializeKeys();

      // Set up event listeners
      connectionPoolRef.current.addEventListener(handleSyncEvent);
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        error: error instanceof Error ? error.message : 'Failed to initialize',
      });
    }
  }, [deviceManager, getVectorClock]);

  // Handle sync events
  const handleSyncEvent: SyncEventListener = useCallback((event: SyncEvent) => {
    switch (event.type) {
      case 'device_connected':
        if (event.deviceId) {
          dispatch({
            type: 'SET_DEVICE_CONNECTION_STATE',
            deviceId: event.deviceId,
            state: 'connected',
          });
          dispatch({
            type: 'ADD_ALERT',
            alert: {
              id: generateAlertId(),
              type: 'success',
              title: 'Device Connected',
              message: `Connected to device`,
              deviceId: event.deviceId,
              timestamp: new Date(),
              dismissed: false,
            },
          });
        }
        break;

      case 'device_disconnected':
        if (event.deviceId) {
          dispatch({
            type: 'SET_DEVICE_CONNECTION_STATE',
            deviceId: event.deviceId,
            state: 'disconnected',
          });
        }
        break;

      case 'sync_completed':
        if (event.deviceId) {
          dispatch({ type: 'SYNC_COMPLETED', deviceId: event.deviceId });
        }
        break;

      case 'sync_failed':
        if (event.deviceId) {
          const error = (event.data as { error?: string })?.error || 'Unknown error';
          dispatch({ type: 'SYNC_FAILED', deviceId: event.deviceId, error });
          dispatch({
            type: 'ADD_ALERT',
            alert: {
              id: generateAlertId(),
              type: 'error',
              title: 'Sync Failed',
              message: error,
              deviceId: event.deviceId,
              timestamp: new Date(),
              dismissed: false,
            },
          });
        }
        break;

      case 'conflict_detected':
        dispatch({
          type: 'ADD_ALERT',
          alert: {
            id: generateAlertId(),
            type: 'warning',
            title: 'Sync Conflict',
            message: 'A conflict was detected and needs resolution',
            deviceId: event.deviceId,
            timestamp: new Date(),
            dismissed: false,
          },
        });
        break;

      case 'error':
        dispatch({
          type: 'ADD_ALERT',
          alert: {
            id: generateAlertId(),
            type: 'error',
            title: 'Sync Error',
            message: (event.data as { error?: string })?.error || 'An error occurred',
            deviceId: event.deviceId,
            timestamp: new Date(),
            dismissed: false,
          },
        });
        break;
    }
  }, []);

  // Enable/disable sync
  const setEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_ENABLED', enabled });
  }, []);

  // Add device
  const addDevice = useCallback((device: PairedDevice) => {
    dispatch({ type: 'ADD_PAIRED_DEVICE', device });
  }, []);

  // Remove device
  const removeDevice = useCallback(
    async (deviceId: string) => {
      // Disconnect first
      if (connectionPoolRef.current) {
        await connectionPoolRef.current.disconnect(deviceId);
      }
      // Remove from storage
      await deviceManager.removePairedDevice(deviceId);
      dispatch({ type: 'REMOVE_PAIRED_DEVICE', deviceId });
    },
    [deviceManager]
  );

  // Refresh paired devices
  const refreshPairedDevices = useCallback(async () => {
    const pairedDevices = await deviceManager.getPairedDevices();
    dispatch({ type: 'SET_PAIRED_DEVICES', devices: pairedDevices });
  }, [deviceManager]);

  // Connect to device
  const connectToDevice = useCallback(
    async (deviceId: string) => {
      const device = state.pairedDevices.find((d) => d.id === deviceId);
      if (!device || !connectionPoolRef.current) return;

      dispatch({
        type: 'SET_DEVICE_CONNECTION_STATE',
        deviceId,
        state: 'connecting',
      });

      try {
        const url = `ws://${device.lastKnownIp}:${device.lastKnownPort}`;
        await connectionPoolRef.current.connect(deviceId, url, device.publicKey);

        dispatch({
          type: 'SET_DEVICE_CONNECTION_STATE',
          deviceId,
          state: 'connected',
        });
      } catch (error) {
        dispatch({
          type: 'SYNC_FAILED',
          deviceId,
          error: error instanceof Error ? error.message : 'Connection failed',
        });
      }
    },
    [state.pairedDevices]
  );

  // Disconnect from device
  const disconnectFromDevice = useCallback(async (deviceId: string) => {
    if (connectionPoolRef.current) {
      await connectionPoolRef.current.disconnect(deviceId);
    }
    dispatch({
      type: 'SET_DEVICE_CONNECTION_STATE',
      deviceId,
      state: 'disconnected',
    });
  }, []);

  // Disconnect all
  const disconnectAll = useCallback(async () => {
    if (connectionPoolRef.current) {
      await connectionPoolRef.current.disconnectAll();
    }
    state.pairedDevices.forEach((device) => {
      dispatch({
        type: 'SET_DEVICE_CONNECTION_STATE',
        deviceId: device.id,
        state: 'disconnected',
      });
    });
  }, [state.pairedDevices]);

  // Sync with device
  const syncWithDevice = useCallback(
    async (deviceId: string) => {
      const connection = connectionPoolRef.current?.getConnection(deviceId);
      if (!connection || !connection.isConnected) {
        throw new Error('Device not connected');
      }

      dispatch({
        type: 'SET_DEVICE_CONNECTION_STATE',
        deviceId,
        state: 'syncing',
      });
      dispatch({ type: 'SET_SYNCING', isSyncing: true });

      // Actual sync will be handled by the sync engine
      // This is a placeholder - sync engine integration will complete this
    },
    []
  );

  // Sync all
  const syncAll = useCallback(async () => {
    dispatch({ type: 'SET_SYNCING', isSyncing: true });

    const activeConnections = connectionPoolRef.current?.getActiveConnections() || [];
    await Promise.all(
      activeConnections.map((conn) => {
        const sessionInfo = conn.getSessionInfo();
        if (sessionInfo.sessionId) {
          return syncWithDevice(sessionInfo.sessionId);
        }
        return Promise.resolve();
      })
    );

    dispatch({ type: 'SET_SYNCING', isSyncing: false });
  }, [syncWithDevice]);

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    dispatch({ type: 'DISMISS_ALERT', alertId });
  }, []);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    dispatch({ type: 'CLEAR_ALERTS' });
  }, []);

  // Get stats
  const getStats = useCallback((): SyncStats => {
    const statuses = Array.from(state.deviceStatuses.values());
    return {
      totalDevices: statuses.length,
      connectedDevices: statuses.filter((s) => s.isOnline).length,
      pendingChanges: statuses.reduce((sum, s) => sum + s.pendingChanges, 0),
      lastSyncAt: state.lastGlobalSyncAt,
      health: state.health,
    };
  }, [state.deviceStatuses, state.lastGlobalSyncAt, state.health]);

  // Auto-initialize
  useEffect(() => {
    if (autoInit && !state.isInitialized) {
      initialize();
    }
  }, [autoInit, state.isInitialized, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      connectionPoolRef.current?.destroy();
    };
  }, []);

  const value: LANSyncContextValue = {
    state,
    initialize,
    setEnabled,
    addDevice,
    removeDevice,
    refreshPairedDevices,
    connectToDevice,
    disconnectFromDevice,
    disconnectAll,
    syncWithDevice,
    syncAll,
    dismissAlert,
    clearAlerts,
    getStats,
    deviceManager,
    connectionPool: connectionPoolRef.current,
  };

  return <LANSyncContext.Provider value={value}>{children}</LANSyncContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useLANSync(): LANSyncContextValue {
  const context = useContext(LANSyncContext);
  if (!context) {
    throw new Error('useLANSync must be used within a LANSyncProvider');
  }
  return context;
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Get sync status for a specific device
 */
export function useDeviceSyncStatus(deviceId: string): DeviceSyncStatus | null {
  const { state } = useLANSync();
  return state.deviceStatuses.get(deviceId) || null;
}

/**
 * Get overall sync stats
 */
export function useSyncStats(): SyncStats {
  const { getStats } = useLANSync();
  return getStats();
}

/**
 * Get active alerts
 */
export function useSyncAlerts(): SyncAlert[] {
  const { state } = useLANSync();
  return state.alerts.filter((a) => !a.dismissed);
}

/**
 * Check if any sync is in progress
 */
export function useIsSyncing(): boolean {
  const { state } = useLANSync();
  return state.isSyncing;
}

/**
 * Get sync health status
 */
export function useSyncHealth(): SyncHealth {
  const { state } = useLANSync();
  return state.health;
}

export default LANSyncContext;
