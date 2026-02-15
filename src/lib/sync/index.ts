/**
 * LAN Sync Module
 * Phase 7: LAN Sync Feature
 *
 * Export all sync-related functionality
 */

// Types
export type * from "./types";

// Device Discovery
export {
  DeviceDiscovery,
  generatePairingCode,
  generateUUID,
  getLocalIP,
  checkReachability,
  getDeviceIdentity,
  updateDeviceName,
  generatePairingQRData,
  validatePairingQRData,
  isPairingExpired,
  parsePairingQRCode,
  validateManualConnection,
  getPairedDevices,
  getPairedDevice,
  savePairedDevice,
  updateDeviceSyncStatus,
  removePairedDevice,
  blockDevice,
  unblockDevice,
  isDeviceTrusted,
  startPairingSession,
  verifyPairingCode,
  endPairingSession,
  getActivePairingSession,
} from "./device-discovery";

export type { ManualConnectionInfo } from "./device-discovery";

// Sync Engine
export { SyncEngine, createSyncEngine, ALL_ENTITY_TYPES } from "./sync-engine";

export type { SyncEngineConfig, SyncResult, SyncError } from "./sync-engine";

// Offline Manager
export {
  OfflineManager,
  getOfflineManager,
  createOfflineManager,
  createOfflineStateObserver,
} from "./offline-manager";

export type {
  QueuedChange,
  OfflineManagerConfig,
  OfflineStatus,
  OfflineStateObserver,
} from "./offline-manager";
