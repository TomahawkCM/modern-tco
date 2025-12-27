/**
 * LAN Sync Module (L-010)
 *
 * Core module for peer-to-peer local network synchronization.
 * Uses WebSocket for communication with ECDH key exchange and AES-256-GCM encryption.
 *
 * @see /docs/LAN_SYNC_PROTOCOL.md for complete protocol specification
 * @see /docs/LAN_DISCOVERY_RESEARCH.md for discovery approach
 * @see /docs/WEBRTC_VS_WEBSOCKET_EVALUATION.md for transport decision
 */

// ============================================================================
// Protocol Constants
// ============================================================================

export const PROTOCOL_VERSION = 1;
export const APP_VERSION = '1.0.0';
export const DEFAULT_SYNC_PORT = 8765;

// Timing constants (milliseconds)
export const CONNECTION_TIMEOUT = 30000;
export const MESSAGE_TIMEOUT = 10000;
export const HEARTBEAT_INTERVAL = 30000;
export const SYNC_INTERVAL_ACTIVE = 5000;
export const SYNC_INTERVAL_IDLE = 60000;
export const RETRY_ATTEMPTS = 3;
export const RETRY_BACKOFF_BASE = 1000;

// Payload limits
export const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB
export const MAX_ENTITIES_PER_PAGE = 500;
export const RECEIPT_STREAM_THRESHOLD = 100 * 1024; // 100KB

// Tombstone retention (30 days)
export const TOMBSTONE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

// ============================================================================
// Entity Types
// ============================================================================

/**
 * All syncable entity types in the Budget App
 */
export type EntityType =
  | 'accounts'
  | 'transactions'
  | 'categories'
  | 'budgets'
  | 'receipts'
  | 'subscriptions'
  | 'loans'
  | 'loanPayments'
  | 'futurePurchases'
  | 'retirementPlans'
  | 'investments'
  | 'portfolios'
  | 'investmentHoldings'
  | 'investmentTransactions'
  | 'importMappings'
  | 'importMetadata';

/**
 * Entity priority for sync ordering
 */
export const ENTITY_PRIORITY: Record<EntityType, 'high' | 'medium' | 'low'> = {
  accounts: 'high',
  transactions: 'high',
  categories: 'high',
  budgets: 'high',
  subscriptions: 'high',
  receipts: 'medium',
  loans: 'medium',
  loanPayments: 'medium',
  futurePurchases: 'medium',
  investments: 'medium',
  portfolios: 'medium',
  investmentHoldings: 'medium',
  investmentTransactions: 'medium',
  retirementPlans: 'low',
  importMappings: 'low',
  importMetadata: 'low',
};

/**
 * All entity types in sync order
 */
export const ALL_ENTITY_TYPES: EntityType[] = [
  'accounts',
  'categories',
  'budgets',
  'transactions',
  'subscriptions',
  'receipts',
  'loans',
  'loanPayments',
  'futurePurchases',
  'investments',
  'portfolios',
  'investmentHoldings',
  'investmentTransactions',
  'retirementPlans',
  'importMappings',
  'importMetadata',
];

// ============================================================================
// Message Types
// ============================================================================

/**
 * All sync protocol message types
 */
export type SyncMessageType =
  | 'HELLO'
  | 'HELLO_ACK'
  | 'SYNC_REQUEST'
  | 'SYNC_RESPONSE'
  | 'PUSH_CHANGES'
  | 'PUSH_ACK'
  | 'CONFLICT'
  | 'CONFLICT_RESOLUTION'
  | 'HEARTBEAT'
  | 'GOODBYE';

/**
 * Base message envelope for all protocol messages
 */
export interface SyncMessage<T = unknown> {
  version: typeof PROTOCOL_VERSION;
  messageId: string;
  type: SyncMessageType;
  timestamp: number;
  deviceId: string;
  encrypted: boolean;
  payload: T | string; // String when encrypted
}

// ============================================================================
// Handshake Messages
// ============================================================================

/**
 * HELLO payload - sent by initiator to start connection
 */
export interface HelloPayload {
  deviceName: string;
  deviceId: string;
  pairingCode?: string; // 6-digit code for first-time pairing
  publicKey: string; // ECDH public key (base64)
  protocolVersion: number;
  appVersion: string;
}

/**
 * HELLO_ACK payload - response from responder
 */
export interface HelloAckPayload {
  accepted: boolean;
  deviceName: string;
  deviceId: string;
  publicKey: string; // ECDH public key for key exchange
  sessionKey?: string; // Encrypted session key
  reason?: string; // Rejection reason
}

// ============================================================================
// Sync Request/Response
// ============================================================================

/**
 * SYNC_REQUEST payload
 */
export interface SyncRequestPayload {
  mode: 'full' | 'delta';
  entities: EntityType[];
  since?: number; // Timestamp for delta sync
  vectorClock?: VectorClock;
}

/**
 * SYNC_RESPONSE payload
 */
export interface SyncResponsePayload {
  mode: 'full' | 'delta';
  entities: Partial<Record<EntityType, SyncEntity[]>>;
  vectorClock: VectorClock;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Sync entity wrapper with metadata
 */
export interface SyncEntity {
  id: string;
  data: Record<string, unknown>;
  updatedAt: number;
  deletedAt?: number; // Soft delete (tombstone)
  version: number;
  deviceId: string;
}

// ============================================================================
// Push Changes
// ============================================================================

/**
 * PUSH_CHANGES payload
 */
export interface PushChangesPayload {
  changes: ChangeSet[];
  vectorClock: VectorClock;
}

/**
 * Group of operations for an entity type
 */
export interface ChangeSet {
  entity: EntityType;
  operations: Operation[];
}

/**
 * Single data operation
 */
export interface Operation {
  type: 'create' | 'update' | 'delete';
  id: string;
  data?: Record<string, unknown>;
  version: number;
  timestamp: number;
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
 * Rejected change with reason
 */
export interface RejectedChange {
  id: string;
  entity: EntityType;
  reason: 'version_conflict' | 'validation_error' | 'unknown';
  currentVersion?: number;
  currentData?: Record<string, unknown>;
}

// ============================================================================
// Conflict Resolution
// ============================================================================

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
  resolution: 'keep_local' | 'keep_remote' | 'merge';
  mergedData?: Record<string, unknown>;
  newVersion: number;
}

/**
 * Field-level conflict details
 */
export interface FieldConflict {
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  resolution: 'local' | 'remote' | 'manual';
}

/**
 * Result of field-level merge
 */
export interface MergeResult {
  merged: Record<string, unknown>;
  conflicts: FieldConflict[];
}

// ============================================================================
// Connection Management
// ============================================================================

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
  reason: 'user_request' | 'timeout' | 'error';
  finalVectorClock: VectorClock;
}

// ============================================================================
// Vector Clock
// ============================================================================

/**
 * Vector clock for conflict detection
 * Maps device IDs to logical timestamps
 */
export interface VectorClock {
  [deviceId: string]: number;
}

/**
 * Compare two vector clocks
 * @returns 'dominates' if a > b, 'dominated' if b > a, 'concurrent' if neither
 */
export function compareVectorClocks(
  a: VectorClock,
  b: VectorClock
): 'dominates' | 'dominated' | 'concurrent' | 'equal' {
  const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));

  let aGreater = false;
  let bGreater = false;

  for (const key of allKeys) {
    const aVal = a[key] || 0;
    const bVal = b[key] || 0;

    if (aVal > bVal) aGreater = true;
    if (bVal > aVal) bGreater = true;
  }

  if (aGreater && !bGreater) return 'dominates';
  if (bGreater && !aGreater) return 'dominated';
  if (!aGreater && !bGreater) return 'equal';
  return 'concurrent';
}

/**
 * Merge two vector clocks, taking max of each component
 */
export function mergeVectorClocks(a: VectorClock, b: VectorClock): VectorClock {
  const result: VectorClock = { ...a };
  for (const [key, val] of Object.entries(b)) {
    result[key] = Math.max(result[key] || 0, val);
  }
  return result;
}

/**
 * Increment vector clock for a device
 */
export function incrementVectorClock(
  clock: VectorClock,
  deviceId: string
): VectorClock {
  return {
    ...clock,
    [deviceId]: (clock[deviceId] || 0) + 1,
  };
}

// ============================================================================
// Device & Session Types
// ============================================================================

/**
 * Trust level for paired devices
 */
export type TrustLevel = 'paired' | 'trusted' | 'blocked';

/**
 * Paired device information stored in IndexedDB
 */
export interface PairedDevice {
  id: string;
  name: string;
  publicKey: string; // ECDH public key (base64)
  pairedAt: Date;
  lastSyncAt?: Date;
  trustLevel: TrustLevel;
  lastKnownIp?: string;
  lastKnownPort?: number;
}

/**
 * Active sync session
 */
export interface SyncSession {
  sessionId: string;
  deviceId: string;
  deviceName: string;
  startedAt: Date;
  lastMessageAt: Date;
  state: SyncSessionState;
  vectorClock: VectorClock;
  pendingMessages: Map<string, PendingMessage>;
}

/**
 * Sync session states
 */
export type SyncSessionState =
  | 'connecting'
  | 'handshaking'
  | 'syncing'
  | 'idle'
  | 'disconnecting'
  | 'error';

/**
 * Message awaiting acknowledgment
 */
export interface PendingMessage {
  messageId: string;
  sentAt: number;
  retries: number;
  message: SyncMessage;
}

// ============================================================================
// Pairing Types
// ============================================================================

/**
 * QR code pairing data
 */
export interface PairingQRData {
  version: typeof PROTOCOL_VERSION;
  ip: string;
  port: number;
  code: string; // 6-digit pairing code
  pubKey: string; // ECDH public key (base64)
  deviceName: string;
  timestamp: number;
}

/**
 * Generate 6-digit pairing code
 */
export function generatePairingCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, '0');
}

/**
 * Generate unique device ID
 */
export function generateDeviceId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate message ID (UUID v4)
 */
export function generateMessageId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// Sync Status & Events
// ============================================================================

/**
 * Overall sync status
 */
export interface SyncStatus {
  enabled: boolean;
  isHostMode: boolean;
  connectedDevices: number;
  lastSyncAt?: Date;
  pendingChanges: number;
  currentState: SyncManagerState;
  error?: string;
}

/**
 * Sync manager states
 */
export type SyncManagerState =
  | 'disabled'
  | 'starting'
  | 'hosting'
  | 'connecting'
  | 'syncing'
  | 'idle'
  | 'error';

/**
 * Sync event types
 */
export type SyncEventType =
  | 'status_changed'
  | 'device_connected'
  | 'device_disconnected'
  | 'sync_started'
  | 'sync_completed'
  | 'sync_failed'
  | 'conflict_detected'
  | 'changes_received'
  | 'changes_sent'
  | 'error';

/**
 * Sync event payload
 */
export interface SyncEvent {
  type: SyncEventType;
  timestamp: Date;
  deviceId?: string;
  data?: unknown;
}

/**
 * Sync event listener
 */
export type SyncEventListener = (event: SyncEvent) => void;

// ============================================================================
// Message Factory
// ============================================================================

/**
 * Create a new sync message
 */
export function createMessage<T>(
  type: SyncMessageType,
  deviceId: string,
  payload: T,
  encrypted = false
): SyncMessage<T> {
  return {
    version: PROTOCOL_VERSION,
    messageId: generateMessageId(),
    type,
    timestamp: Date.now(),
    deviceId,
    encrypted,
    payload,
  };
}

/**
 * Create HELLO message
 */
export function createHelloMessage(
  deviceId: string,
  deviceName: string,
  publicKey: string,
  pairingCode?: string
): SyncMessage<HelloPayload> {
  return createMessage('HELLO', deviceId, {
    deviceName,
    deviceId,
    pairingCode,
    publicKey,
    protocolVersion: PROTOCOL_VERSION,
    appVersion: APP_VERSION,
  });
}

/**
 * Create HELLO_ACK message
 */
export function createHelloAckMessage(
  deviceId: string,
  deviceName: string,
  publicKey: string,
  accepted: boolean,
  reason?: string
): SyncMessage<HelloAckPayload> {
  return createMessage('HELLO_ACK', deviceId, {
    accepted,
    deviceName,
    deviceId,
    publicKey,
    reason,
  });
}

/**
 * Create SYNC_REQUEST message
 */
export function createSyncRequestMessage(
  deviceId: string,
  mode: 'full' | 'delta',
  entities: EntityType[],
  vectorClock?: VectorClock,
  since?: number
): SyncMessage<SyncRequestPayload> {
  return createMessage('SYNC_REQUEST', deviceId, {
    mode,
    entities,
    since,
    vectorClock,
  });
}

/**
 * Create PUSH_CHANGES message
 */
export function createPushChangesMessage(
  deviceId: string,
  changes: ChangeSet[],
  vectorClock: VectorClock
): SyncMessage<PushChangesPayload> {
  return createMessage('PUSH_CHANGES', deviceId, {
    changes,
    vectorClock,
  });
}

/**
 * Create HEARTBEAT message
 */
export function createHeartbeatMessage(
  deviceId: string,
  pendingChanges: number
): SyncMessage<HeartbeatPayload> {
  return createMessage('HEARTBEAT', deviceId, {
    timestamp: Date.now(),
    pendingChanges,
  });
}

/**
 * Create GOODBYE message
 */
export function createGoodbyeMessage(
  deviceId: string,
  reason: GoodbyePayload['reason'],
  vectorClock: VectorClock
): SyncMessage<GoodbyePayload> {
  return createMessage('GOODBYE', deviceId, {
    reason,
    finalVectorClock: vectorClock,
  });
}

// ============================================================================
// Serialization
// ============================================================================

/**
 * Serialize message to JSON string
 */
export function serializeMessage(message: SyncMessage): string {
  const json = JSON.stringify(message);
  if (json.length > MAX_MESSAGE_SIZE) {
    throw new SyncError('Message exceeds maximum size', 'MESSAGE_TOO_LARGE');
  }
  return json;
}

/**
 * Deserialize JSON string to message
 */
export function deserializeMessage(data: string): SyncMessage {
  try {
    const message = JSON.parse(data) as SyncMessage;

    // Validate required fields
    if (
      message.version !== PROTOCOL_VERSION ||
      !message.messageId ||
      !message.type ||
      !message.timestamp ||
      !message.deviceId
    ) {
      throw new SyncError('Invalid message format', 'INVALID_MESSAGE');
    }

    return message;
  } catch (error) {
    if (error instanceof SyncError) throw error;
    throw new SyncError('Failed to parse message', 'PARSE_ERROR');
  }
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Sync error codes
 */
export type SyncErrorCode =
  | 'CONNECTION_FAILED'
  | 'CONNECTION_TIMEOUT'
  | 'MESSAGE_TIMEOUT'
  | 'MESSAGE_TOO_LARGE'
  | 'INVALID_MESSAGE'
  | 'PARSE_ERROR'
  | 'ENCRYPTION_ERROR'
  | 'DECRYPTION_ERROR'
  | 'INVALID_PAIRING_CODE'
  | 'DEVICE_BLOCKED'
  | 'VERSION_MISMATCH'
  | 'SYNC_IN_PROGRESS'
  | 'NO_ACTIVE_SESSION'
  | 'UNKNOWN_ERROR';

/**
 * Custom sync error class
 */
export class SyncError extends Error {
  constructor(
    message: string,
    public code: SyncErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

// ============================================================================
// Tombstone Management
// ============================================================================

/**
 * Tombstone record for soft deletes
 */
export interface Tombstone {
  id: string;
  entity: EntityType;
  deletedAt: number;
  deletedBy: string; // Device ID
}

/**
 * Check if tombstone should be purged
 */
export function shouldPurgeTombstone(tombstone: Tombstone): boolean {
  return Date.now() - tombstone.deletedAt > TOMBSTONE_RETENTION_MS;
}

/**
 * Create tombstone for deleted entity
 */
export function createTombstone(
  id: string,
  entity: EntityType,
  deviceId: string
): Tombstone {
  return {
    id,
    entity,
    deletedAt: Date.now(),
    deletedBy: deviceId,
  };
}

// ============================================================================
// Merge Strategies
// ============================================================================

/**
 * Merge strategy by entity type
 */
export const MERGE_STRATEGIES: Record<EntityType, 'lww' | 'field_merge'> = {
  accounts: 'lww',
  transactions: 'field_merge',
  categories: 'lww',
  budgets: 'field_merge',
  receipts: 'lww',
  subscriptions: 'lww',
  loans: 'field_merge',
  loanPayments: 'lww',
  futurePurchases: 'field_merge',
  retirementPlans: 'lww',
  investments: 'lww',
  portfolios: 'field_merge',
  investmentHoldings: 'lww',
  investmentTransactions: 'lww',
  importMappings: 'lww',
  importMetadata: 'lww',
};

/**
 * Fields that require manual resolution (amount/money fields)
 */
export const MANUAL_RESOLUTION_FIELDS: Partial<Record<EntityType, string[]>> = {
  transactions: ['amount'],
  budgets: ['amount', 'rollover'],
  loans: ['principal', 'interestRate'],
  futurePurchases: ['targetAmount', 'currentSaved'],
};

/**
 * Last-Write-Wins merge
 */
export function mergeWithLWW(
  local: SyncEntity,
  remote: SyncEntity
): SyncEntity {
  return local.updatedAt >= remote.updatedAt ? local : remote;
}

/**
 * Field-level merge for complex entities
 */
export function mergeWithFieldMerge(
  local: SyncEntity,
  remote: SyncEntity,
  entityType: EntityType
): MergeResult {
  const merged: Record<string, unknown> = {};
  const conflicts: FieldConflict[] = [];

  const allKeys = Array.from(new Set([
    ...Object.keys(local.data),
    ...Object.keys(remote.data),
  ]));

  const manualFields = MANUAL_RESOLUTION_FIELDS[entityType] || [];

  for (const key of allKeys) {
    const localVal = local.data[key];
    const remoteVal = remote.data[key];

    // Skip metadata fields
    if (['id', 'updatedAt', 'version', 'deviceId'].includes(key)) {
      continue;
    }

    // Same value - no conflict
    if (JSON.stringify(localVal) === JSON.stringify(remoteVal)) {
      merged[key] = localVal;
      continue;
    }

    // Only one side has value
    if (localVal === undefined) {
      merged[key] = remoteVal;
      continue;
    }
    if (remoteVal === undefined) {
      merged[key] = localVal;
      continue;
    }

    // Conflict - check if manual resolution required
    if (manualFields.includes(key)) {
      conflicts.push({
        field: key,
        localValue: localVal,
        remoteValue: remoteVal,
        resolution: 'manual',
      });
      // Keep local value pending manual resolution
      merged[key] = localVal;
    } else {
      // Auto-resolve with LWW for this field
      merged[key] = local.updatedAt >= remote.updatedAt ? localVal : remoteVal;
      conflicts.push({
        field: key,
        localValue: localVal,
        remoteValue: remoteVal,
        resolution: local.updatedAt >= remote.updatedAt ? 'local' : 'remote',
      });
    }
  }

  return { merged, conflicts };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get local IP addresses (requires user to provide)
 * Note: Browsers cannot detect local IP automatically anymore
 */
export function formatConnectionUrl(ip: string, port: number): string {
  return `ws://${ip}:${port}/sync`;
}

/**
 * Parse connection URL
 */
export function parseConnectionUrl(url: string): { ip: string; port: number } | null {
  try {
    const match = url.match(/wss?:\/\/([^:]+):(\d+)/);
    if (match) {
      return {
        ip: match[1],
        port: parseInt(match[2], 10),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Encode QR data to JSON string
 */
export function encodePairingQR(data: PairingQRData): string {
  return JSON.stringify(data);
}

/**
 * Decode QR data from JSON string
 */
export function decodePairingQR(encoded: string): PairingQRData | null {
  try {
    const data = JSON.parse(encoded) as PairingQRData;
    if (
      data.version !== PROTOCOL_VERSION ||
      !data.ip ||
      !data.port ||
      !data.code ||
      !data.pubKey ||
      !data.deviceName
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Check if pairing QR is expired (10 minutes)
 */
export function isPairingQRExpired(data: PairingQRData): boolean {
  const TEN_MINUTES = 10 * 60 * 1000;
  return Date.now() - data.timestamp > TEN_MINUTES;
}

// ============================================================================
// Exports Summary
// ============================================================================

export type {
  // Re-export main types for easy importing
};

/**
 * Default export with all utilities
 */
const LANSync = {
  // Constants
  PROTOCOL_VERSION,
  APP_VERSION,
  DEFAULT_SYNC_PORT,
  ALL_ENTITY_TYPES,
  ENTITY_PRIORITY,
  MERGE_STRATEGIES,

  // Vector clock operations
  compareVectorClocks,
  mergeVectorClocks,
  incrementVectorClock,

  // Message factory
  createMessage,
  createHelloMessage,
  createHelloAckMessage,
  createSyncRequestMessage,
  createPushChangesMessage,
  createHeartbeatMessage,
  createGoodbyeMessage,

  // Serialization
  serializeMessage,
  deserializeMessage,

  // Pairing
  generatePairingCode,
  generateDeviceId,
  generateMessageId,
  encodePairingQR,
  decodePairingQR,
  isPairingQRExpired,

  // Merge strategies
  mergeWithLWW,
  mergeWithFieldMerge,

  // Tombstones
  createTombstone,
  shouldPurgeTombstone,

  // Utilities
  formatConnectionUrl,
  parseConnectionUrl,
};

// ============================================================================
// Re-export Encryption Module
// ============================================================================

export * from './lan-sync-encryption';
export * from './lan-sync-encrypted-connection';

export default LANSync;
