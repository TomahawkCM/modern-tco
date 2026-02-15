/**
 * Encrypted LAN Sync Connection (L-013)
 *
 * Wraps SyncConnection with ECDH key exchange and AES-256-GCM encryption.
 * All sync messages are encrypted before transmission.
 */

import type { SyncMessage, SyncEventListener, VectorClock } from "./lan-sync";
import { SyncConnection, ConnectionPool } from "./lan-sync-connection";
import {
  generateKeyPair,
  importPublicKey,
  deriveSharedSecret,
  deriveAESKey,
  encrypt,
  decryptToString,
  getOrCreateKeyPair,
  cacheSessionKeys,
  getCachedSessionKeys,
  clearSessionKeys,
  generateSessionId,
  type KeyPair,
  type SessionKeys,
  type EncryptedMessage,
} from "./lan-sync-encryption";
import { serializeMessage, deserializeMessage, SyncError } from "./lan-sync";

// ============================================================================
// Types
// ============================================================================

export interface EncryptedConnectionConfig {
  deviceId: string;
  deviceName: string;
  vectorClock: VectorClock;
  /** Existing key pair or will be generated */
  keyPair?: KeyPair;
}

export interface HandshakeResult {
  success: boolean;
  sessionId: string;
  remotePublicKey: string;
  error?: string;
}

// ============================================================================
// Encrypted Sync Connection
// ============================================================================

/**
 * Encrypted wrapper for SyncConnection
 * Handles key exchange and message encryption/decryption
 */
export class EncryptedSyncConnection {
  private connection: SyncConnection;
  private keyPair: KeyPair | null = null;
  private sessionKeys: SessionKeys | null = null;
  private config: EncryptedConnectionConfig;
  private eventListeners: Set<SyncEventListener> = new Set();

  constructor(config: EncryptedConnectionConfig) {
    this.config = config;
    this.connection = new SyncConnection(config.deviceId, config.deviceName, config.vectorClock);

    // Forward events from underlying connection
    this.connection.addEventListener((event) => {
      this.eventListeners.forEach((listener) => {
        try {
          listener(event);
        } catch {
          // Ignore listener errors
        }
      });
    });
  }

  // ==========================================================================
  // Key Management
  // ==========================================================================

  /**
   * Initialize or load the key pair for this device
   */
  async initializeKeys(): Promise<KeyPair> {
    if (this.config.keyPair) {
      this.keyPair = this.config.keyPair;
    } else {
      this.keyPair = await getOrCreateKeyPair(this.config.deviceId);
    }
    return this.keyPair;
  }

  /**
   * Get the public key for sharing with other devices
   */
  getPublicKey(): string | null {
    return this.keyPair?.publicKeyBase64 || null;
  }

  /**
   * Establish session keys with a remote device
   */
  async establishSessionKeys(
    remotePublicKeyBase64: string,
    sessionId?: string
  ): Promise<SessionKeys> {
    if (!this.keyPair) {
      throw new SyncError("Keys not initialized", "ENCRYPTION_ERROR");
    }

    const sid = sessionId || generateSessionId();

    // Import remote public key
    const remotePublicKey = await importPublicKey(remotePublicKeyBase64);

    // Derive shared secret using ECDH
    const sharedSecret = await deriveSharedSecret(this.keyPair.privateKey, remotePublicKey);

    // Generate salt for key derivation
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive separate keys for encryption and decryption
    const encryptKey = await deriveAESKey(sharedSecret, salt, `session-${sid}-encrypt`);
    const decryptKey = await deriveAESKey(sharedSecret, salt, `session-${sid}-decrypt`);

    this.sessionKeys = {
      sessionId: sid,
      encryptKey,
      decryptKey,
      establishedAt: new Date(),
      remotePublicKey: remotePublicKeyBase64,
    };

    // Cache for future use
    cacheSessionKeys(this.config.deviceId, this.sessionKeys);

    return this.sessionKeys;
  }

  // ==========================================================================
  // Connection Lifecycle
  // ==========================================================================

  /**
   * Connect to a remote device with key exchange
   */
  async connect(url: string, remotePublicKey?: string): Promise<HandshakeResult> {
    // Ensure keys are initialized
    if (!this.keyPair) {
      await this.initializeKeys();
    }

    // Connect underlying WebSocket
    await this.connection.connect(url);

    // If we have the remote public key, establish session keys
    if (remotePublicKey) {
      const sessionId = generateSessionId();
      await this.establishSessionKeys(remotePublicKey, sessionId);

      return {
        success: true,
        sessionId,
        remotePublicKey,
      };
    }

    // Return success but keys will need to be established separately
    return {
      success: true,
      sessionId: "",
      remotePublicKey: "",
    };
  }

  /**
   * Perform key exchange handshake
   * Call this after connect() if remote public key wasn't provided
   */
  async performKeyExchange(remotePublicKeyBase64: string): Promise<SessionKeys> {
    return this.establishSessionKeys(remotePublicKeyBase64);
  }

  /**
   * Disconnect and clear session keys
   */
  async disconnect(reason: "user_request" | "timeout" | "error" = "user_request"): Promise<void> {
    // Clear session keys from cache
    if (this.sessionKeys) {
      clearSessionKeys(this.config.deviceId);
      this.sessionKeys = null;
    }

    await this.connection.disconnect(reason);
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.connection.isConnected;
  }

  /**
   * Check if encryption is active
   */
  get isEncrypted(): boolean {
    return this.sessionKeys !== null;
  }

  // ==========================================================================
  // Encrypted Message Handling
  // ==========================================================================

  /**
   * Send an encrypted message
   */
  async sendEncryptedMessage<T>(message: SyncMessage<T>): Promise<void> {
    if (!this.sessionKeys) {
      throw new SyncError("Session keys not established", "ENCRYPTION_ERROR");
    }

    // Serialize the message
    const serialized = serializeMessage(message);

    // Encrypt the serialized message
    const encrypted = await encrypt(this.sessionKeys.encryptKey, serialized);

    // Create an encrypted wrapper message
    const encryptedMessage: SyncMessage<EncryptedMessage> = {
      version: 1,
      messageId: message.messageId,
      type: message.type,
      timestamp: message.timestamp,
      deviceId: message.deviceId,
      encrypted: true,
      payload: encrypted,
    };

    await this.connection.sendMessage(encryptedMessage);
  }

  /**
   * Send an encrypted message without waiting for acknowledgment
   */
  sendEncryptedMessageNoWait<T>(message: SyncMessage<T>): void {
    if (!this.sessionKeys) {
      throw new SyncError("Session keys not established", "ENCRYPTION_ERROR");
    }

    // For fire-and-forget, we need to encrypt synchronously
    // Since Web Crypto is async, we queue the encryption
    this.encryptAndSend(message).catch((error) => {
      console.error("Failed to send encrypted message:", error);
    });
  }

  private async encryptAndSend<T>(message: SyncMessage<T>): Promise<void> {
    if (!this.sessionKeys) return;

    const serialized = serializeMessage(message);
    const encrypted = await encrypt(this.sessionKeys.encryptKey, serialized);

    const encryptedMessage: SyncMessage<EncryptedMessage> = {
      version: 1,
      messageId: message.messageId,
      type: message.type,
      timestamp: message.timestamp,
      deviceId: message.deviceId,
      encrypted: true,
      payload: encrypted,
    };

    this.connection.sendMessageNoWait(encryptedMessage);
  }

  /**
   * Decrypt a received message
   */
  async decryptMessage<T>(encryptedPayload: EncryptedMessage): Promise<SyncMessage<T>> {
    if (!this.sessionKeys) {
      throw new SyncError("Session keys not established", "ENCRYPTION_ERROR");
    }

    // Decrypt the payload
    const decrypted = await decryptToString(this.sessionKeys.decryptKey, encryptedPayload);

    // Parse the decrypted message
    return deserializeMessage(decrypted) as SyncMessage<T>;
  }

  /**
   * Check if a message is encrypted and decrypt if needed
   */
  async processIncomingMessage<T>(
    message: SyncMessage<T | EncryptedMessage>
  ): Promise<SyncMessage<T>> {
    if (message.encrypted && this.sessionKeys) {
      // Message is encrypted, decrypt it
      return this.decryptMessage<T>(message.payload as EncryptedMessage);
    }

    // Message is not encrypted, return as-is
    return message as SyncMessage<T>;
  }

  // ==========================================================================
  // Event Handling
  // ==========================================================================

  /**
   * Add event listener
   */
  addEventListener(listener: SyncEventListener): void {
    this.eventListeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: SyncEventListener): void {
    this.eventListeners.delete(listener);
  }

  // ==========================================================================
  // Session Info
  // ==========================================================================

  /**
   * Get session information
   */
  getSessionInfo(): {
    sessionId: string | null;
    establishedAt: Date | null;
    isEncrypted: boolean;
  } {
    return {
      sessionId: this.sessionKeys?.sessionId || null,
      establishedAt: this.sessionKeys?.establishedAt || null,
      isEncrypted: this.isEncrypted,
    };
  }

  /**
   * Destroy connection and clear all keys
   */
  destroy(): void {
    if (this.sessionKeys) {
      clearSessionKeys(this.config.deviceId);
      this.sessionKeys = null;
    }
    this.keyPair = null;
    this.connection.destroy();
    this.eventListeners.clear();
  }
}

// ============================================================================
// Encrypted Connection Pool
// ============================================================================

/**
 * Manages multiple encrypted peer connections
 */
export class EncryptedConnectionPool {
  private connections: Map<string, EncryptedSyncConnection> = new Map();
  private eventListeners: Set<SyncEventListener> = new Set();
  private keyPair: KeyPair | null = null;

  constructor(
    private deviceId: string,
    private deviceName: string,
    private getVectorClock: () => VectorClock
  ) {}

  /**
   * Initialize keys for the pool
   */
  async initializeKeys(): Promise<KeyPair> {
    this.keyPair = await getOrCreateKeyPair(this.deviceId);
    return this.keyPair;
  }

  /**
   * Get public key for sharing
   */
  getPublicKey(): string | null {
    return this.keyPair?.publicKeyBase64 || null;
  }

  /**
   * Get connection by device ID
   */
  getConnection(deviceId: string): EncryptedSyncConnection | undefined {
    return this.connections.get(deviceId);
  }

  /**
   * Get all active connections
   */
  getActiveConnections(): EncryptedSyncConnection[] {
    return Array.from(this.connections.values()).filter((c) => c.isConnected);
  }

  /**
   * Connect to a new device with encryption
   */
  async connect(
    remoteDeviceId: string,
    url: string,
    remotePublicKey: string
  ): Promise<EncryptedSyncConnection> {
    // Ensure keys are initialized
    if (!this.keyPair) {
      await this.initializeKeys();
    }

    // Check for existing connection
    const existing = this.connections.get(remoteDeviceId);
    if (existing?.isConnected) {
      return existing;
    }

    // Create new encrypted connection
    const connection = new EncryptedSyncConnection({
      deviceId: this.deviceId,
      deviceName: this.deviceName,
      vectorClock: this.getVectorClock(),
      keyPair: this.keyPair!,
    });

    // Forward events
    connection.addEventListener((event) => {
      this.eventListeners.forEach((listener) => {
        try {
          listener({ ...event, deviceId: remoteDeviceId });
        } catch {
          // Ignore listener errors
        }
      });
    });

    // Connect with encryption
    await connection.connect(url, remotePublicKey);

    // Store connection
    this.connections.set(remoteDeviceId, connection);

    return connection;
  }

  /**
   * Disconnect from a device
   */
  async disconnect(deviceId: string): Promise<void> {
    const connection = this.connections.get(deviceId);
    if (connection) {
      await connection.disconnect();
      this.connections.delete(deviceId);
    }
  }

  /**
   * Disconnect from all devices
   */
  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.connections.keys()).map((id) => this.disconnect(id));
    await Promise.all(promises);
  }

  /**
   * Broadcast encrypted message to all connected devices
   */
  async broadcast<T>(message: SyncMessage<T>): Promise<Map<string, Error | null>> {
    const results = new Map<string, Error | null>();

    const promises = this.getActiveConnections().map(async (connection) => {
      const deviceId = connection.getSessionInfo().sessionId || "unknown";
      try {
        await connection.sendEncryptedMessage(message);
        results.set(deviceId, null);
      } catch (error) {
        results.set(deviceId, error as Error);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Add event listener
   */
  addEventListener(listener: SyncEventListener): void {
    this.eventListeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: SyncEventListener): void {
    this.eventListeners.delete(listener);
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    total: number;
    connected: number;
    encrypted: number;
  } {
    const connections = Array.from(this.connections.values());
    return {
      total: connections.length,
      connected: connections.filter((c) => c.isConnected).length,
      encrypted: connections.filter((c) => c.isEncrypted).length,
    };
  }

  /**
   * Destroy pool and all connections
   */
  destroy(): void {
    Array.from(this.connections.values()).forEach((connection) => {
      connection.destroy();
    });
    this.connections.clear();
    this.eventListeners.clear();
    this.keyPair = null;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default EncryptedSyncConnection;
