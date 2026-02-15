/**
 * LAN Sync Device Manager (L-010)
 *
 * Manages paired devices and sync state in IndexedDB.
 * Handles device trust, pairing history, and sync metadata.
 */

import Dexie, { type Table } from "dexie";
import type { PairedDevice, TrustLevel, VectorClock, Tombstone, EntityType } from "./lan-sync";
import { generateDeviceId, TOMBSTONE_RETENTION_MS, shouldPurgeTombstone } from "./lan-sync";

// ============================================================================
// Database Schema
// ============================================================================

/**
 * Local device info stored in IndexedDB
 */
export interface LocalDeviceInfo {
  id: string;
  deviceId: string;
  deviceName: string;
  createdAt: Date;
  publicKey?: string;
  privateKey?: string; // Encrypted in IndexedDB
}

/**
 * Sync metadata for tracking changes
 */
export interface SyncMetadata {
  id: string;
  deviceId: string;
  lastSyncAt: Date;
  vectorClock: VectorClock;
  pendingChangesCount: number;
}

/**
 * Change log entry for delta sync
 */
export interface ChangeLogEntry {
  id: string;
  entityType: EntityType;
  entityId: string;
  operation: "create" | "update" | "delete";
  timestamp: number;
  deviceId: string;
  version: number;
  data?: Record<string, unknown>;
  synced: boolean;
}

/**
 * Conflict record for manual resolution
 */
export interface ConflictRecord {
  id: string;
  entityType: EntityType;
  entityId: string;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
  localVersion: number;
  remoteVersion: number;
  localDeviceId: string;
  remoteDeviceId: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: "keep_local" | "keep_remote" | "merge";
  mergedData?: Record<string, unknown>;
}

// ============================================================================
// Sync Database
// ============================================================================

/**
 * IndexedDB database for sync metadata
 */
export class SyncDatabase extends Dexie {
  localDevice!: Table<LocalDeviceInfo>;
  pairedDevices!: Table<PairedDevice>;
  syncMetadata!: Table<SyncMetadata>;
  changeLog!: Table<ChangeLogEntry>;
  tombstones!: Table<Tombstone>;
  conflicts!: Table<ConflictRecord>;

  constructor() {
    super("BudgetAppSync");

    this.version(1).stores({
      localDevice: "id",
      pairedDevices: "id, trustLevel, pairedAt",
      syncMetadata: "id, deviceId, lastSyncAt",
      changeLog: "id, entityType, entityId, timestamp, synced, [entityType+entityId]",
      tombstones: "id, entity, deletedAt",
      conflicts: "id, entityType, entityId, createdAt, resolvedAt",
    });
  }
}

// Singleton database instance
let syncDb: SyncDatabase | null = null;

/**
 * Get sync database instance
 */
export function getSyncDb(): SyncDatabase {
  if (!syncDb) {
    syncDb = new SyncDatabase();
  }
  return syncDb;
}

// ============================================================================
// Device Manager
// ============================================================================

/**
 * Manages local and paired devices
 */
export class DeviceManager {
  private db: SyncDatabase;
  private localDevice: LocalDeviceInfo | null = null;

  constructor() {
    this.db = getSyncDb();
  }

  // ==========================================================================
  // Local Device
  // ==========================================================================

  /**
   * Initialize or get local device
   */
  async getOrCreateLocalDevice(defaultName?: string): Promise<LocalDeviceInfo> {
    if (this.localDevice) {
      return this.localDevice;
    }

    // Try to load from DB
    const existing = await this.db.localDevice.get("local");
    if (existing) {
      this.localDevice = existing;
      return existing;
    }

    // Create new device
    const newDevice: LocalDeviceInfo = {
      id: "local",
      deviceId: generateDeviceId(),
      deviceName: defaultName || this.generateDefaultDeviceName(),
      createdAt: new Date(),
    };

    await this.db.localDevice.put(newDevice);
    this.localDevice = newDevice;

    return newDevice;
  }

  /**
   * Update local device name
   */
  async updateDeviceName(name: string): Promise<void> {
    const device = await this.getOrCreateLocalDevice();
    device.deviceName = name;
    await this.db.localDevice.put(device);
    this.localDevice = device;
  }

  /**
   * Store key pair for local device
   */
  async storeKeyPair(publicKey: string, privateKey: string): Promise<void> {
    const device = await this.getOrCreateLocalDevice();
    device.publicKey = publicKey;
    device.privateKey = privateKey; // Should be encrypted before storage
    await this.db.localDevice.put(device);
    this.localDevice = device;
  }

  /**
   * Generate default device name
   */
  private generateDefaultDeviceName(): string {
    const platform = this.detectPlatform();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${platform}-${random}`;
  }

  /**
   * Detect platform for device naming
   */
  private detectPlatform(): string {
    if (typeof navigator === "undefined") return "Device";

    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes("iphone")) return "iPhone";
    if (ua.includes("ipad")) return "iPad";
    if (ua.includes("android")) return "Android";
    if (ua.includes("mac")) return "Mac";
    if (ua.includes("windows")) return "Windows";
    if (ua.includes("linux")) return "Linux";

    return "Device";
  }

  // ==========================================================================
  // Paired Devices
  // ==========================================================================

  /**
   * Get all paired devices
   */
  async getPairedDevices(): Promise<PairedDevice[]> {
    return this.db.pairedDevices.toArray();
  }

  /**
   * Get paired device by ID
   */
  async getPairedDevice(deviceId: string): Promise<PairedDevice | undefined> {
    return this.db.pairedDevices.get(deviceId);
  }

  /**
   * Get devices by trust level
   */
  async getDevicesByTrust(trustLevel: TrustLevel): Promise<PairedDevice[]> {
    return this.db.pairedDevices.where("trustLevel").equals(trustLevel).toArray();
  }

  /**
   * Get trusted devices (not blocked)
   */
  async getTrustedDevices(): Promise<PairedDevice[]> {
    return this.db.pairedDevices.where("trustLevel").anyOf(["paired", "trusted"]).toArray();
  }

  /**
   * Add or update paired device
   */
  async savePairedDevice(device: PairedDevice): Promise<void> {
    await this.db.pairedDevices.put(device);
  }

  /**
   * Add new paired device
   */
  async addPairedDevice(deviceId: string, name: string, publicKey: string): Promise<PairedDevice> {
    const device: PairedDevice = {
      id: deviceId,
      name,
      publicKey,
      pairedAt: new Date(),
      trustLevel: "paired",
    };

    await this.db.pairedDevices.put(device);
    return device;
  }

  /**
   * Update device trust level
   */
  async updateTrustLevel(deviceId: string, trustLevel: TrustLevel): Promise<void> {
    await this.db.pairedDevices.update(deviceId, { trustLevel });
  }

  /**
   * Update last sync time for device
   */
  async updateLastSync(deviceId: string): Promise<void> {
    await this.db.pairedDevices.update(deviceId, {
      lastSyncAt: new Date(),
    });
  }

  /**
   * Update device connection info
   */
  async updateConnectionInfo(deviceId: string, ip: string, port: number): Promise<void> {
    await this.db.pairedDevices.update(deviceId, {
      lastKnownIp: ip,
      lastKnownPort: port,
    });
  }

  /**
   * Block a device
   */
  async blockDevice(deviceId: string): Promise<void> {
    await this.updateTrustLevel(deviceId, "blocked");
  }

  /**
   * Unblock a device
   */
  async unblockDevice(deviceId: string): Promise<void> {
    await this.updateTrustLevel(deviceId, "paired");
  }

  /**
   * Remove paired device
   */
  async removePairedDevice(deviceId: string): Promise<void> {
    await this.db.pairedDevices.delete(deviceId);
    // Also clean up related sync metadata
    await this.db.syncMetadata.where("deviceId").equals(deviceId).delete();
  }

  /**
   * Check if device is trusted
   */
  async isDeviceTrusted(deviceId: string): Promise<boolean> {
    const device = await this.getPairedDevice(deviceId);
    return device !== undefined && device.trustLevel !== "blocked";
  }

  // ==========================================================================
  // Sync Metadata
  // ==========================================================================

  /**
   * Get sync metadata for device
   */
  async getSyncMetadata(deviceId: string): Promise<SyncMetadata | undefined> {
    return this.db.syncMetadata.get(deviceId);
  }

  /**
   * Update sync metadata
   */
  async updateSyncMetadata(
    deviceId: string,
    vectorClock: VectorClock,
    pendingChangesCount = 0
  ): Promise<void> {
    const metadata: SyncMetadata = {
      id: deviceId,
      deviceId,
      lastSyncAt: new Date(),
      vectorClock,
      pendingChangesCount,
    };
    await this.db.syncMetadata.put(metadata);
  }

  /**
   * Get current vector clock
   */
  async getVectorClock(): Promise<VectorClock> {
    const device = await this.getOrCreateLocalDevice();
    const metadata = await this.getSyncMetadata(device.deviceId);
    return metadata?.vectorClock || { [device.deviceId]: 0 };
  }

  /**
   * Update vector clock
   */
  async updateVectorClock(clock: VectorClock): Promise<void> {
    const device = await this.getOrCreateLocalDevice();
    await this.updateSyncMetadata(device.deviceId, clock);
  }

  /**
   * Increment local vector clock
   */
  async incrementVectorClock(): Promise<VectorClock> {
    const device = await this.getOrCreateLocalDevice();
    const current = await this.getVectorClock();
    const newClock = {
      ...current,
      [device.deviceId]: (current[device.deviceId] || 0) + 1,
    };
    await this.updateVectorClock(newClock);
    return newClock;
  }
}

// ============================================================================
// Change Log Manager
// ============================================================================

/**
 * Manages change log for delta sync
 */
export class ChangeLogManager {
  private db: SyncDatabase;

  constructor() {
    this.db = getSyncDb();
  }

  /**
   * Log a change
   */
  async logChange(
    entityType: EntityType,
    entityId: string,
    operation: "create" | "update" | "delete",
    deviceId: string,
    version: number,
    data?: Record<string, unknown>
  ): Promise<void> {
    const entry: ChangeLogEntry = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      operation,
      timestamp: Date.now(),
      deviceId,
      version,
      data,
      synced: false,
    };

    await this.db.changeLog.put(entry);
  }

  /**
   * Get unsynced changes
   */
  async getUnsyncedChanges(): Promise<ChangeLogEntry[]> {
    return this.db.changeLog.where("synced").equals(0).toArray();
  }

  /**
   * Get changes since timestamp
   */
  async getChangesSince(timestamp: number): Promise<ChangeLogEntry[]> {
    return this.db.changeLog.where("timestamp").above(timestamp).sortBy("timestamp");
  }

  /**
   * Get changes for entity
   */
  async getChangesForEntity(entityType: EntityType, entityId: string): Promise<ChangeLogEntry[]> {
    return this.db.changeLog
      .where("[entityType+entityId]")
      .equals([entityType, entityId])
      .sortBy("timestamp");
  }

  /**
   * Mark changes as synced
   */
  async markAsSynced(changeIds: string[]): Promise<void> {
    await this.db.changeLog.where("id").anyOf(changeIds).modify({ synced: true });
  }

  /**
   * Clean up old synced changes (keep last 30 days)
   */
  async cleanupOldChanges(): Promise<number> {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return this.db.changeLog
      .where("synced")
      .equals(1)
      .and((entry) => entry.timestamp < cutoff)
      .delete();
  }

  /**
   * Get pending changes count
   */
  async getPendingCount(): Promise<number> {
    return this.db.changeLog.where("synced").equals(0).count();
  }
}

// ============================================================================
// Tombstone Manager
// ============================================================================

/**
 * Manages tombstones for soft deletes
 */
export class TombstoneManager {
  private db: SyncDatabase;

  constructor() {
    this.db = getSyncDb();
  }

  /**
   * Create tombstone for deleted entity
   */
  async createTombstone(
    entityType: EntityType,
    entityId: string,
    deviceId: string
  ): Promise<Tombstone> {
    const tombstone: Tombstone = {
      id: entityId,
      entity: entityType,
      deletedAt: Date.now(),
      deletedBy: deviceId,
    };

    await this.db.tombstones.put(tombstone);
    return tombstone;
  }

  /**
   * Get tombstone for entity
   */
  async getTombstone(entityId: string): Promise<Tombstone | undefined> {
    return this.db.tombstones.get(entityId);
  }

  /**
   * Get all tombstones
   */
  async getAllTombstones(): Promise<Tombstone[]> {
    return this.db.tombstones.toArray();
  }

  /**
   * Get tombstones for entity type
   */
  async getTombstonesForType(entityType: EntityType): Promise<Tombstone[]> {
    return this.db.tombstones.where("entity").equals(entityType).toArray();
  }

  /**
   * Check if entity is tombstoned
   */
  async isDeleted(entityId: string): Promise<boolean> {
    const tombstone = await this.getTombstone(entityId);
    return tombstone !== undefined;
  }

  /**
   * Purge expired tombstones
   */
  async purgeExpiredTombstones(): Promise<number> {
    const cutoff = Date.now() - TOMBSTONE_RETENTION_MS;
    return this.db.tombstones.where("deletedAt").below(cutoff).delete();
  }

  /**
   * Remove tombstone (for undoing delete)
   */
  async removeTombstone(entityId: string): Promise<void> {
    await this.db.tombstones.delete(entityId);
  }
}

// ============================================================================
// Conflict Manager
// ============================================================================

/**
 * Manages sync conflicts
 */
export class ConflictManager {
  private db: SyncDatabase;

  constructor() {
    this.db = getSyncDb();
  }

  /**
   * Record a conflict
   */
  async recordConflict(
    entityType: EntityType,
    entityId: string,
    localData: Record<string, unknown>,
    remoteData: Record<string, unknown>,
    localVersion: number,
    remoteVersion: number,
    localDeviceId: string,
    remoteDeviceId: string
  ): Promise<ConflictRecord> {
    const conflict: ConflictRecord = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      localData,
      remoteData,
      localVersion,
      remoteVersion,
      localDeviceId,
      remoteDeviceId,
      createdAt: new Date(),
    };

    await this.db.conflicts.put(conflict);
    return conflict;
  }

  /**
   * Get unresolved conflicts
   */
  async getUnresolvedConflicts(): Promise<ConflictRecord[]> {
    return this.db.conflicts.filter((c) => !c.resolvedAt).sortBy("createdAt");
  }

  /**
   * Get conflicts for entity
   */
  async getConflictsForEntity(entityType: EntityType, entityId: string): Promise<ConflictRecord[]> {
    return this.db.conflicts
      .where("[entityType+entityId]")
      .equals([entityType, entityId])
      .toArray();
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    conflictId: string,
    resolution: "keep_local" | "keep_remote" | "merge",
    mergedData?: Record<string, unknown>
  ): Promise<void> {
    await this.db.conflicts.update(conflictId, {
      resolvedAt: new Date(),
      resolution,
      mergedData,
    });
  }

  /**
   * Get conflict count
   */
  async getUnresolvedCount(): Promise<number> {
    return this.db.conflicts.filter((c) => !c.resolvedAt).count();
  }

  /**
   * Clean up old resolved conflicts (keep last 7 days)
   */
  async cleanupOldConflicts(): Promise<number> {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.db.conflicts.where("resolvedAt").below(cutoff).delete();
  }
}

// ============================================================================
// Singleton Instances
// ============================================================================

let deviceManager: DeviceManager | null = null;
let changeLogManager: ChangeLogManager | null = null;
let tombstoneManager: TombstoneManager | null = null;
let conflictManager: ConflictManager | null = null;

/**
 * Get device manager singleton
 */
export function getDeviceManager(): DeviceManager {
  if (!deviceManager) {
    deviceManager = new DeviceManager();
  }
  return deviceManager;
}

/**
 * Get change log manager singleton
 */
export function getChangeLogManager(): ChangeLogManager {
  if (!changeLogManager) {
    changeLogManager = new ChangeLogManager();
  }
  return changeLogManager;
}

/**
 * Get tombstone manager singleton
 */
export function getTombstoneManager(): TombstoneManager {
  if (!tombstoneManager) {
    tombstoneManager = new TombstoneManager();
  }
  return tombstoneManager;
}

/**
 * Get conflict manager singleton
 */
export function getConflictManager(): ConflictManager {
  if (!conflictManager) {
    conflictManager = new ConflictManager();
  }
  return conflictManager;
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  getDeviceManager,
  getChangeLogManager,
  getTombstoneManager,
  getConflictManager,
  getSyncDb,
};
