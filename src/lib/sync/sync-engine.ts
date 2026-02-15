/**
 * Sync Engine Module (L-012)
 *
 * Core sync engine that handles full and delta sync modes,
 * conflict detection and resolution, and bidirectional data sync.
 */

import type { Table } from "dexie";
import { db } from "../budget-db";
import type {
  EntityType,
  SyncEntity,
  VectorClock,
  Operation,
  ChangeSet,
  ConflictPayload,
  FieldConflict,
  MergeResult,
} from "./types";

// ============================================================================
// Constants
// ============================================================================

const HIGH_PRIORITY_ENTITIES: EntityType[] = [
  "accounts",
  "transactions",
  "categories",
  "budgets",
  "subscriptions",
];

const MEDIUM_PRIORITY_ENTITIES: EntityType[] = [
  "receipts",
  "loans",
  "loanPayments",
  "futurePurchases",
  "investments",
  "portfolios",
  "investmentHoldings",
  "investmentTransactions",
];

const LOW_PRIORITY_ENTITIES: EntityType[] = ["retirementPlans", "importMappings", "importMetadata"];

export const ALL_ENTITY_TYPES: EntityType[] = [
  ...HIGH_PRIORITY_ENTITIES,
  ...MEDIUM_PRIORITY_ENTITIES,
  ...LOW_PRIORITY_ENTITIES,
];

// Fields that require manual resolution on conflict
const CRITICAL_FIELDS: Record<string, string[]> = {
  transactions: ["amount"],
  accounts: ["balance"],
  budgets: ["amount"],
  loans: ["balance", "interestRate"],
};

// ============================================================================
// Sync Engine Class
// ============================================================================

export interface SyncEngineConfig {
  deviceId: string;
  autoResolve?: boolean; // Use LWW for automatic resolution
  preferLocal?: boolean; // When auto-resolving, prefer local changes
}

export interface SyncResult {
  success: boolean;
  entitiesSynced: number;
  conflictsDetected: number;
  conflictsResolved: number;
  conflictsPending: ConflictPayload[];
  errors: SyncError[];
  duration: number;
}

export interface SyncError {
  entity: EntityType;
  id: string;
  error: string;
}

export class SyncEngine {
  private deviceId: string;
  private autoResolve: boolean;
  private preferLocal: boolean;
  private vectorClock: VectorClock;
  private changeLog: Map<string, Operation[]>;
  private pendingConflicts: ConflictPayload[];

  constructor(config: SyncEngineConfig) {
    this.deviceId = config.deviceId;
    this.autoResolve = config.autoResolve ?? true;
    this.preferLocal = config.preferLocal ?? false;
    this.vectorClock = {};
    this.changeLog = new Map();
    this.pendingConflicts = [];
  }

  // ==========================================================================
  // Full Sync
  // ==========================================================================

  /**
   * Perform a full sync - get all data from remote device
   */
  async performFullSync(
    remoteEntities: Partial<Record<EntityType, SyncEntity[]>>
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      entitiesSynced: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      conflictsPending: [],
      errors: [],
      duration: 0,
    };

    try {
      // Process entities in priority order
      for (const entityType of ALL_ENTITY_TYPES) {
        const entities = remoteEntities[entityType];
        if (!entities || entities.length === 0) continue;

        const entityResult = await this.syncEntities(entityType, entities, "full");
        result.entitiesSynced += entityResult.synced;
        result.conflictsDetected += entityResult.conflicts.length;

        if (this.autoResolve) {
          const resolved = await this.autoResolveConflicts(entityType, entityResult.conflicts);
          result.conflictsResolved += resolved;
        } else {
          result.conflictsPending.push(...entityResult.conflicts);
        }

        result.errors.push(...entityResult.errors);
      }

      this.pendingConflicts = result.conflictsPending;
    } catch (error) {
      result.success = false;
      result.errors.push({
        entity: "accounts",
        id: "",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  // ==========================================================================
  // Delta Sync
  // ==========================================================================

  /**
   * Perform a delta sync - only sync changes since last sync
   */
  async performDeltaSync(remoteChanges: ChangeSet[], since: number): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      entitiesSynced: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      conflictsPending: [],
      errors: [],
      duration: 0,
    };

    try {
      for (const changeSet of remoteChanges) {
        const entityResult = await this.applyChanges(changeSet);
        result.entitiesSynced += entityResult.synced;
        result.conflictsDetected += entityResult.conflicts.length;

        if (this.autoResolve) {
          const resolved = await this.autoResolveConflicts(
            changeSet.entity,
            entityResult.conflicts
          );
          result.conflictsResolved += resolved;
        } else {
          result.conflictsPending.push(...entityResult.conflicts);
        }

        result.errors.push(...entityResult.errors);
      }

      this.pendingConflicts = result.conflictsPending;
    } catch (error) {
      result.success = false;
      result.errors.push({
        entity: "accounts",
        id: "",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  // ==========================================================================
  // Get Local Changes
  // ==========================================================================

  /**
   * Get local changes since a timestamp for delta sync
   */
  async getLocalChanges(since: number): Promise<ChangeSet[]> {
    const changes: ChangeSet[] = [];

    for (const entityType of ALL_ENTITY_TYPES) {
      const table = this.getTable(entityType);
      if (!table) continue;

      const operations: Operation[] = [];

      // Get all entities updated since the timestamp
      const entities = await table
        .filter((entity) => {
          const updatedAt =
            entity.updatedAt instanceof Date ? entity.updatedAt.getTime() : entity.updatedAt;
          return updatedAt > since;
        })
        .toArray();

      for (const entity of entities) {
        const updatedAt =
          entity.updatedAt instanceof Date ? entity.updatedAt.getTime() : entity.updatedAt;

        operations.push({
          type: "update", // We don't track create vs update separately
          id: entity.id,
          data: this.serializeEntity(entityType, entity),
          version: entity.version || 1,
          timestamp: updatedAt,
        });
      }

      if (operations.length > 0) {
        changes.push({ entity: entityType, operations });
      }
    }

    return changes;
  }

  /**
   * Get all local data for full sync
   */
  async getLocalData(): Promise<Partial<Record<EntityType, SyncEntity[]>>> {
    const data: Partial<Record<EntityType, SyncEntity[]>> = {};

    for (const entityType of ALL_ENTITY_TYPES) {
      const table = this.getTable(entityType);
      if (!table) continue;

      const entities = await table.toArray();
      const syncEntities: SyncEntity[] = entities.map((entity) => ({
        id: entity.id,
        data: this.serializeEntity(entityType, entity),
        updatedAt:
          entity.updatedAt instanceof Date
            ? entity.updatedAt.getTime()
            : entity.updatedAt || Date.now(),
        version: entity.version || 1,
        deviceId: this.deviceId,
      }));

      if (syncEntities.length > 0) {
        data[entityType] = syncEntities;
      }
    }

    return data;
  }

  // ==========================================================================
  // Apply Changes
  // ==========================================================================

  private async syncEntities(
    entityType: EntityType,
    remoteEntities: SyncEntity[],
    mode: "full" | "delta"
  ): Promise<{
    synced: number;
    conflicts: ConflictPayload[];
    errors: SyncError[];
  }> {
    const result = { synced: 0, conflicts: [] as ConflictPayload[], errors: [] as SyncError[] };
    const table = this.getTable(entityType);

    if (!table) {
      result.errors.push({
        entity: entityType,
        id: "",
        error: `Unknown entity type: ${entityType}`,
      });
      return result;
    }

    for (const remoteEntity of remoteEntities) {
      try {
        // Handle soft deletes (tombstones)
        if (remoteEntity.deletedAt) {
          await this.handleDeletion(entityType, remoteEntity);
          result.synced++;
          continue;
        }

        // Check for existing local entity
        const localEntity = await table.get(remoteEntity.id);

        if (!localEntity) {
          // New entity - just create it
          await this.createEntity(entityType, remoteEntity);
          result.synced++;
        } else {
          // Existing entity - check for conflicts
          const conflict = this.detectConflict(entityType, localEntity, remoteEntity);

          if (conflict) {
            result.conflicts.push(conflict);
          } else {
            // No conflict - update if remote is newer
            const localUpdatedAt =
              localEntity.updatedAt instanceof Date
                ? localEntity.updatedAt.getTime()
                : localEntity.updatedAt;

            if (remoteEntity.updatedAt > localUpdatedAt) {
              await this.updateEntity(entityType, remoteEntity);
              result.synced++;
            }
          }
        }
      } catch (error) {
        result.errors.push({
          entity: entityType,
          id: remoteEntity.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return result;
  }

  private async applyChanges(changeSet: ChangeSet): Promise<{
    synced: number;
    conflicts: ConflictPayload[];
    errors: SyncError[];
  }> {
    const result = { synced: 0, conflicts: [] as ConflictPayload[], errors: [] as SyncError[] };
    const table = this.getTable(changeSet.entity);

    if (!table) {
      result.errors.push({
        entity: changeSet.entity,
        id: "",
        error: `Unknown entity type: ${changeSet.entity}`,
      });
      return result;
    }

    for (const operation of changeSet.operations) {
      try {
        switch (operation.type) {
          case "create":
            await table.add(this.deserializeEntity(changeSet.entity, operation.data!));
            result.synced++;
            break;

          case "update":
            const localEntity = await table.get(operation.id);
            if (localEntity) {
              const remoteEntity: SyncEntity = {
                id: operation.id,
                data: operation.data!,
                updatedAt: operation.timestamp,
                version: operation.version,
                deviceId: this.deviceId,
              };

              const conflict = this.detectConflict(changeSet.entity, localEntity, remoteEntity);
              if (conflict) {
                result.conflicts.push(conflict);
              } else {
                await table.update(
                  operation.id,
                  this.deserializeEntity(changeSet.entity, operation.data!)
                );
                result.synced++;
              }
            } else {
              // Entity doesn't exist locally, create it
              await table.add(this.deserializeEntity(changeSet.entity, operation.data!));
              result.synced++;
            }
            break;

          case "delete":
            await table.delete(operation.id);
            result.synced++;
            break;
        }
      } catch (error) {
        result.errors.push({
          entity: changeSet.entity,
          id: operation.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return result;
  }

  // ==========================================================================
  // Conflict Detection
  // ==========================================================================

  private detectConflict(
    entityType: EntityType,
    localEntity: Record<string, unknown>,
    remoteEntity: SyncEntity
  ): ConflictPayload | null {
    const localUpdatedAt =
      localEntity.updatedAt instanceof Date
        ? localEntity.updatedAt.getTime()
        : (localEntity.updatedAt as number);

    const remoteUpdatedAt = remoteEntity.updatedAt;

    // If updates are within 1 second of each other, check for actual differences
    const timeDiff = Math.abs(localUpdatedAt - remoteUpdatedAt);
    const hasTimeConflict = timeDiff < 1000;

    if (!hasTimeConflict) {
      // Clear winner based on time
      return null;
    }

    // Check if data is actually different
    const localData = this.serializeEntity(entityType, localEntity);
    const remoteData = remoteEntity.data;

    const hasDifferences = this.hasDataDifferences(localData, remoteData);

    if (!hasDifferences) {
      // Same data, no conflict
      return null;
    }

    // Check for critical field conflicts
    const criticalFields = CRITICAL_FIELDS[entityType] || [];
    const hasCriticalConflict = criticalFields.some(
      (field) => localData[field] !== remoteData[field]
    );

    if (hasCriticalConflict && !this.autoResolve) {
      // Critical conflict requires manual resolution
      return {
        entity: entityType,
        id: remoteEntity.id,
        localVersion: {
          id: localEntity.id as string,
          data: localData,
          updatedAt: localUpdatedAt,
          version: (localEntity.version as number) || 1,
          deviceId: this.deviceId,
        },
        remoteVersion: remoteEntity,
      };
    }

    return null;
  }

  private hasDataDifferences(
    local: Record<string, unknown>,
    remote: Record<string, unknown>
  ): boolean {
    const localKeys = Object.keys(local);
    const remoteKeys = Object.keys(remote);

    // Ignore metadata fields
    const ignoreFields = ["id", "createdAt", "updatedAt", "version", "deviceId"];

    for (const key of localKeys) {
      if (ignoreFields.includes(key)) continue;
      if (JSON.stringify(local[key]) !== JSON.stringify(remote[key])) {
        return true;
      }
    }

    for (const key of remoteKeys) {
      if (ignoreFields.includes(key)) continue;
      if (!localKeys.includes(key)) {
        return true;
      }
    }

    return false;
  }

  // ==========================================================================
  // Conflict Resolution
  // ==========================================================================

  private async autoResolveConflicts(
    entityType: EntityType,
    conflicts: ConflictPayload[]
  ): Promise<number> {
    let resolved = 0;

    for (const conflict of conflicts) {
      try {
        const resolution = this.determineResolution(conflict);
        await this.applyResolution(entityType, conflict, resolution);
        resolved++;
      } catch (error) {
        console.error("Failed to auto-resolve conflict:", error);
      }
    }

    return resolved;
  }

  private determineResolution(conflict: ConflictPayload): "keep_local" | "keep_remote" | "merge" {
    const { localVersion, remoteVersion } = conflict;

    // Try field-level merge first
    const mergeResult = this.attemptFieldMerge(localVersion.data, remoteVersion.data);

    if (mergeResult.conflicts.length === 0) {
      return "merge";
    }

    // Fall back to LWW (Last Write Wins)
    if (this.preferLocal) {
      return localVersion.updatedAt >= remoteVersion.updatedAt ? "keep_local" : "keep_remote";
    } else {
      return remoteVersion.updatedAt >= localVersion.updatedAt ? "keep_remote" : "keep_local";
    }
  }

  private attemptFieldMerge(
    local: Record<string, unknown>,
    remote: Record<string, unknown>
  ): MergeResult {
    const merged: Record<string, unknown> = {};
    const conflicts: FieldConflict[] = [];
    const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

    for (const key of allKeys) {
      if (local[key] === undefined) {
        // Field only exists in remote
        merged[key] = remote[key];
      } else if (remote[key] === undefined) {
        // Field only exists in local
        merged[key] = local[key];
      } else if (JSON.stringify(local[key]) === JSON.stringify(remote[key])) {
        // Same value
        merged[key] = local[key];
      } else {
        // Conflict
        conflicts.push({
          field: key,
          localValue: local[key],
          remoteValue: remote[key],
          resolution: "manual",
        });
        // For automatic merge, use the more recent value
        merged[key] = remote[key];
      }
    }

    return { merged, conflicts };
  }

  private async applyResolution(
    entityType: EntityType,
    conflict: ConflictPayload,
    resolution: "keep_local" | "keep_remote" | "merge"
  ): Promise<void> {
    const table = this.getTable(entityType);
    if (!table) return;

    let dataToApply: Record<string, unknown>;

    switch (resolution) {
      case "keep_local":
        // Nothing to do, local data stays
        return;

      case "keep_remote":
        dataToApply = conflict.remoteVersion.data;
        break;

      case "merge":
        const mergeResult = this.attemptFieldMerge(
          conflict.localVersion.data,
          conflict.remoteVersion.data
        );
        dataToApply = mergeResult.merged;
        break;
    }

    await table.update(conflict.id, this.deserializeEntity(entityType, dataToApply));
  }

  /**
   * Manually resolve a conflict
   */
  async resolveConflict(
    entityType: EntityType,
    conflictId: string,
    resolution: "keep_local" | "keep_remote" | "merge",
    mergedData?: Record<string, unknown>
  ): Promise<boolean> {
    const conflict = this.pendingConflicts.find(
      (c) => c.entity === entityType && c.id === conflictId
    );

    if (!conflict) return false;

    const table = this.getTable(entityType);
    if (!table) return false;

    try {
      if (resolution === "merge" && mergedData) {
        await table.update(conflictId, this.deserializeEntity(entityType, mergedData));
      } else if (resolution === "keep_remote") {
        await table.update(
          conflictId,
          this.deserializeEntity(entityType, conflict.remoteVersion.data)
        );
      }
      // keep_local requires no action

      // Remove from pending
      this.pendingConflicts = this.pendingConflicts.filter(
        (c) => !(c.entity === entityType && c.id === conflictId)
      );

      return true;
    } catch (error) {
      console.error("Failed to resolve conflict:", error);
      return false;
    }
  }

  // ==========================================================================
  // Entity Operations
  // ==========================================================================

  private async createEntity(entityType: EntityType, syncEntity: SyncEntity): Promise<void> {
    const table = this.getTable(entityType);
    if (!table) return;

    const entity = this.deserializeEntity(entityType, syncEntity.data);
    entity.id = syncEntity.id;
    entity.version = syncEntity.version;
    entity.updatedAt = new Date(syncEntity.updatedAt);

    await table.add(entity);
  }

  private async updateEntity(entityType: EntityType, syncEntity: SyncEntity): Promise<void> {
    const table = this.getTable(entityType);
    if (!table) return;

    const entity = this.deserializeEntity(entityType, syncEntity.data);
    entity.version = syncEntity.version;
    entity.updatedAt = new Date(syncEntity.updatedAt);

    await table.update(syncEntity.id, entity);
  }

  private async handleDeletion(entityType: EntityType, syncEntity: SyncEntity): Promise<void> {
    const table = this.getTable(entityType);
    if (!table) return;

    await table.delete(syncEntity.id);
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  private getTable(entityType: EntityType): Table | null {
    const tableMap: Record<string, Table | undefined> = {
      accounts: db.accounts,
      transactions: db.transactions,
      categories: db.categories,
      budgets: db.budgets,
      receipts: db.receipts,
      subscriptions: db.subscriptions,
      loans: db.loans,
      loanPayments: db.loanPayments,
      futurePurchases: db.futurePurchases,
      retirementPlans: db.retirementPlans,
      importMappings: db.importMappings,
      importMetadata: db.importHistory,
    };

    return tableMap[entityType] || null;
  }

  private serializeEntity(
    entityType: EntityType,
    entity: Record<string, unknown>
  ): Record<string, unknown> {
    const serialized = { ...entity };

    // Convert Date objects to timestamps
    for (const [key, value] of Object.entries(serialized)) {
      if (value instanceof Date) {
        serialized[key] = value.getTime();
      } else if (value instanceof Blob) {
        // Skip blobs for now (receipts will need special handling)
        delete serialized[key];
      }
    }

    return serialized;
  }

  private deserializeEntity(
    entityType: EntityType,
    data: Record<string, unknown>
  ): Record<string, unknown> {
    const entity = { ...data };

    // Convert timestamps back to Date objects for known date fields
    const dateFields = [
      "createdAt",
      "updatedAt",
      "date",
      "startDate",
      "endDate",
      "targetDate",
      "nextPaymentDate",
      "nextBillingDate",
    ];

    for (const field of dateFields) {
      if (entity[field] && typeof entity[field] === "number") {
        entity[field] = new Date(entity[field]);
      }
    }

    return entity;
  }

  // ==========================================================================
  // Vector Clock Operations
  // ==========================================================================

  getVectorClock(): VectorClock {
    return { ...this.vectorClock };
  }

  updateVectorClock(remoteClock: VectorClock): void {
    for (const [deviceId, timestamp] of Object.entries(remoteClock)) {
      this.vectorClock[deviceId] = Math.max(this.vectorClock[deviceId] || 0, timestamp);
    }
  }

  incrementClock(): void {
    this.vectorClock[this.deviceId] = (this.vectorClock[this.deviceId] || 0) + 1;
  }

  // ==========================================================================
  // Pending Conflicts
  // ==========================================================================

  getPendingConflicts(): ConflictPayload[] {
    return [...this.pendingConflicts];
  }

  clearPendingConflicts(): void {
    this.pendingConflicts = [];
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createSyncEngine(config: SyncEngineConfig): SyncEngine {
  return new SyncEngine(config);
}

export default SyncEngine;
