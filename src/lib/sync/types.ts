/**
 * LAN Sync Type Definitions
 * Phase 7: LAN Sync Feature
 */

// ============================================================================
// Device Discovery Types
// ============================================================================

/**
 * Information stored in QR code for pairing
 */
export interface PairingQRData {
  version: 1;
  ip: string; // e.g., "192.168.1.100"
  port: number; // e.g., 8765
  code: string; // 6-digit pairing code
  pubKey: string; // ECDH public key (base64)
  deviceName: string; // e.g., "Rob's Phone"
  timestamp: number; // For expiry check (5 minutes)
}

/**
 * Paired device stored in IndexedDB
 */
export interface PairedDevice {
  id: string; // UUID
  deviceId: string; // Remote device's unique ID
  deviceName: string; // Human-readable name
  publicKey: string; // Stored public key for future connections
  lastSyncAt: Date | null; // Last successful sync timestamp
  lastSeenAt: Date; // Last connection timestamp
  lastIP: string; // Last known IP address
  lastPort: number; // Last known port
  trustLevel: "trusted" | "pending" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * This device's identity
 */
export interface DeviceIdentity {
  id: string; // This device's unique ID
  deviceName: string; // User-configurable name
  privateKey?: string; // ECDH private key (encrypted storage)
  publicKey: string; // ECDH public key
  createdAt: Date;
}

// ============================================================================
// Sync Protocol Types (from L-002)
// ============================================================================

export type SyncMessageType =
  | "HELLO"
  | "HELLO_ACK"
  | "SYNC_REQUEST"
  | "SYNC_RESPONSE"
  | "PUSH_CHANGES"
  | "PUSH_ACK"
  | "CONFLICT"
  | "CONFLICT_RESOLUTION"
  | "HEARTBEAT"
  | "GOODBYE";

/**
 * Message envelope for all sync messages
 */
export interface SyncMessage {
  version: 1;
  messageId: string;
  type: SyncMessageType;
  timestamp: number;
  deviceId: string;
  encrypted: boolean;
  payload: string | object;
}

/**
 * HELLO message payload
 */
export interface HelloPayload {
  deviceName: string;
  deviceId: string;
  pairingCode?: string; // 6-digit code (first-time only)
  publicKey: string; // ECDH public key (base64)
  protocolVersion: number; // Current: 1
  appVersion: string;
}

/**
 * HELLO_ACK message payload
 */
export interface HelloAckPayload {
  accepted: boolean;
  deviceName: string;
  deviceId: string;
  publicKey: string;
  sessionKey?: string; // Encrypted with shared secret
  reason?: string; // If not accepted
}

/**
 * Syncable entity types
 */
export type EntityType =
  | "accounts"
  | "transactions"
  | "categories"
  | "budgets"
  | "receipts"
  | "subscriptions"
  | "loans"
  | "loanPayments"
  | "futurePurchases"
  | "retirementPlans"
  | "investments"
  | "portfolios"
  | "investmentHoldings"
  | "investmentTransactions"
  | "importMappings"
  | "importMetadata";

/**
 * Vector clock for conflict detection
 */
export interface VectorClock {
  [deviceId: string]: number;
}

/**
 * Sync entity wrapper
 */
export interface SyncEntity {
  id: string;
  data: Record<string, unknown>;
  updatedAt: number;
  deletedAt?: number; // Soft delete timestamp (tombstone)
  version: number; // Incrementing version for OCC
  deviceId: string; // Device that made the change
}

/**
 * SYNC_REQUEST payload
 */
export interface SyncRequestPayload {
  mode: "full" | "delta";
  entities: EntityType[];
  since?: number; // Timestamp for delta sync
  vectorClock?: VectorClock;
}

/**
 * SYNC_RESPONSE payload
 */
export interface SyncResponsePayload {
  mode: "full" | "delta";
  entities: {
    [K in EntityType]?: SyncEntity[];
  };
  vectorClock: VectorClock;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Change operation
 */
export interface Operation {
  type: "create" | "update" | "delete";
  id: string;
  data?: Record<string, unknown>;
  version: number;
  timestamp: number;
}

/**
 * Change set for a single entity type
 */
export interface ChangeSet {
  entity: EntityType;
  operations: Operation[];
}

/**
 * PUSH_CHANGES payload
 */
export interface PushChangesPayload {
  changes: ChangeSet[];
  vectorClock: VectorClock;
}

/**
 * Rejected change info
 */
export interface RejectedChange {
  id: string;
  entity: EntityType;
  reason: "version_conflict" | "validation_error" | "unknown";
  currentVersion?: number;
  currentData?: Record<string, unknown>;
}

/**
 * PUSH_ACK payload
 */
export interface PushAckPayload {
  accepted: string[];
  rejected: RejectedChange[];
  vectorClock: VectorClock;
}

/**
 * CONFLICT payload
 */
export interface ConflictPayload {
  entity: EntityType;
  id: string;
  localVersion: SyncEntity;
  remoteVersion: SyncEntity;
}

/**
 * CONFLICT_RESOLUTION payload
 */
export interface ConflictResolutionPayload {
  entity: EntityType;
  id: string;
  resolution: "keep_local" | "keep_remote" | "merge";
  mergedData?: Record<string, unknown>;
  newVersion: number;
}

/**
 * HEARTBEAT payload
 */
export interface HeartbeatPayload {
  timestamp: number;
  pendingChanges: number;
}

/**
 * GOODBYE payload
 */
export interface GoodbyePayload {
  reason: "user_request" | "timeout" | "error";
  finalVectorClock: VectorClock;
}

// ============================================================================
// Connection State Types
// ============================================================================

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "handshaking"
  | "connected"
  | "syncing"
  | "error";

export interface ConnectionInfo {
  state: ConnectionState;
  remoteDeviceId?: string;
  remoteDeviceName?: string;
  connectedAt?: Date;
  lastMessageAt?: Date;
  error?: string;
}

// ============================================================================
// Sync Status Types
// ============================================================================

export interface SyncStatus {
  lastSyncAt: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
  lastError?: string;
  lastErrorAt?: Date;
}

export interface DeviceSyncStatus extends SyncStatus {
  deviceId: string;
  deviceName: string;
  isOnline: boolean;
  vectorClock: VectorClock;
}

// ============================================================================
// Merge Result Types
// ============================================================================

/**
 * Field-level conflict during merge
 */
export interface FieldConflict {
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  resolution: "local" | "remote" | "manual";
}

/**
 * Result of a field-level merge attempt
 */
export interface MergeResult {
  merged: Record<string, unknown>;
  conflicts: FieldConflict[];
}
