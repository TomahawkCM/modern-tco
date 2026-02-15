/**
 * LAN Sync Connection Manager (L-010)
 *
 * Handles WebSocket connections for peer-to-peer sync.
 * Manages connection lifecycle, message queuing, and reconnection.
 */

import type {
  SyncMessage,
  SyncSession,
  SyncSessionState,
  PendingMessage,
  VectorClock,
  SyncEventType,
  SyncEvent,
  SyncEventListener,
} from "./lan-sync";

import {
  CONNECTION_TIMEOUT,
  MESSAGE_TIMEOUT,
  HEARTBEAT_INTERVAL,
  RETRY_ATTEMPTS,
  RETRY_BACKOFF_BASE,
  serializeMessage,
  deserializeMessage,
  createHeartbeatMessage,
  createGoodbyeMessage,
  generateMessageId,
  SyncError,
} from "./lan-sync";

// ============================================================================
// Connection Manager
// ============================================================================

/**
 * WebSocket connection wrapper with retry and heartbeat
 */
export class SyncConnection {
  private ws: WebSocket | null = null;
  private session: SyncSession | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private messageTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private eventListeners: Set<SyncEventListener> = new Set();
  private reconnectAttempts = 0;
  private isClosing = false;

  constructor(
    private deviceId: string,
    private deviceName: string,
    private vectorClock: VectorClock
  ) {}

  // ==========================================================================
  // Connection Lifecycle
  // ==========================================================================

  /**
   * Connect to a remote device
   */
  async connect(url: string): Promise<void> {
    if (this.ws) {
      throw new SyncError("Already connected", "SYNC_IN_PROGRESS");
    }

    this.isClosing = false;
    this.updateState("connecting");

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.ws?.close();
        reject(new SyncError("Connection timeout", "CONNECTION_TIMEOUT"));
      }, CONNECTION_TIMEOUT);

      try {
        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.reconnectAttempts = 0;
          this.initSession();
          this.startHeartbeat();
          this.updateState("handshaking");
          this.emit("device_connected", { url });
          resolve();
        };

        this.ws.onerror = (event) => {
          clearTimeout(timeout);
          this.handleError(event);
          reject(new SyncError("Connection failed", "CONNECTION_FAILED"));
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          this.handleClose(event);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(new SyncError("Failed to create WebSocket", "CONNECTION_FAILED", error));
      }
    });
  }

  /**
   * Disconnect from remote device
   */
  async disconnect(reason: "user_request" | "timeout" | "error" = "user_request"): Promise<void> {
    if (!this.ws || this.isClosing) return;

    this.isClosing = true;
    this.updateState("disconnecting");

    // Send GOODBYE message
    try {
      const goodbye = createGoodbyeMessage(this.deviceId, reason, this.vectorClock);
      await this.sendMessage(goodbye);
    } catch {
      // Ignore send errors during disconnect
    }

    // Clean up
    this.cleanup();
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get current session
   */
  get currentSession(): SyncSession | null {
    return this.session;
  }

  /**
   * Get session state
   */
  get state(): SyncSessionState {
    return this.session?.state || "connecting";
  }

  // ==========================================================================
  // Message Handling
  // ==========================================================================

  /**
   * Send a message and wait for acknowledgment
   */
  async sendMessage<T>(message: SyncMessage<T>): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new SyncError("Not connected", "NO_ACTIVE_SESSION");
    }

    const serialized = serializeMessage(message);

    return new Promise((resolve, reject) => {
      // Set timeout for acknowledgment
      const timeout = setTimeout(() => {
        this.messageTimeouts.delete(message.messageId);
        this.session?.pendingMessages.delete(message.messageId);
        reject(new SyncError("Message timeout", "MESSAGE_TIMEOUT"));
      }, MESSAGE_TIMEOUT);

      this.messageTimeouts.set(message.messageId, timeout);

      // Track pending message
      if (this.session) {
        this.session.pendingMessages.set(message.messageId, {
          messageId: message.messageId,
          sentAt: Date.now(),
          retries: 0,
          message: message as SyncMessage,
        });
      }

      try {
        this.ws!.send(serialized);

        // For fire-and-forget messages, resolve immediately
        if (["HEARTBEAT", "GOODBYE"].includes(message.type)) {
          clearTimeout(timeout);
          this.messageTimeouts.delete(message.messageId);
          resolve();
        } else {
          // Will be resolved when ack received
          // Store resolve/reject for later
          this.pendingResolvers.set(message.messageId, { resolve, reject });
        }
      } catch (error) {
        clearTimeout(timeout);
        this.messageTimeouts.delete(message.messageId);
        reject(new SyncError("Send failed", "CONNECTION_FAILED", error));
      }
    });
  }

  private pendingResolvers: Map<
    string,
    {
      resolve: () => void;
      reject: (error: Error) => void;
    }
  > = new Map();

  /**
   * Send message without waiting (fire-and-forget)
   */
  sendMessageNoWait<T>(message: SyncMessage<T>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new SyncError("Not connected", "NO_ACTIVE_SESSION");
    }

    const serialized = serializeMessage(message);
    this.ws.send(serialized);
  }

  /**
   * Acknowledge a received message
   */
  acknowledgeMessage(messageId: string): void {
    const resolver = this.pendingResolvers.get(messageId);
    if (resolver) {
      resolver.resolve();
      this.pendingResolvers.delete(messageId);
    }

    const timeout = this.messageTimeouts.get(messageId);
    if (timeout) {
      clearTimeout(timeout);
      this.messageTimeouts.delete(messageId);
    }

    this.session?.pendingMessages.delete(messageId);
  }

  /**
   * Handle incoming message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data =
        typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data);

      const message = deserializeMessage(data);

      // Update session timestamp
      if (this.session) {
        this.session.lastMessageAt = new Date();
      }

      // Emit message event for handlers
      this.emit("message_received" as SyncEventType, {
        message,
        deviceId: message.deviceId,
      });

      // Handle specific message types
      switch (message.type) {
        case "HEARTBEAT":
          // Update last seen time
          break;

        case "GOODBYE":
          this.handleRemoteDisconnect(message);
          break;

        default:
          // Let external handlers process other messages
          break;
      }
    } catch (error) {
      this.emit("error", {
        error: error instanceof Error ? error.message : "Failed to parse message",
      });
    }
  }

  /**
   * Handle remote disconnect
   */
  private handleRemoteDisconnect(message: SyncMessage): void {
    this.emit("device_disconnected", {
      deviceId: message.deviceId,
      reason: "remote_goodbye",
    });
    this.cleanup();
  }

  // ==========================================================================
  // Connection Events
  // ==========================================================================

  /**
   * Handle WebSocket error
   */
  private handleError(event: Event): void {
    this.emit("error", {
      error: "WebSocket error",
      event,
    });
    this.updateState("error");
  }

  /**
   * Handle WebSocket close
   */
  private handleClose(event: CloseEvent): void {
    if (this.isClosing) {
      // Intentional close
      this.emit("device_disconnected", {
        reason: "intentional",
        code: event.code,
      });
    } else {
      // Unexpected close - attempt reconnect
      this.emit("device_disconnected", {
        reason: "unexpected",
        code: event.code,
      });
      this.attemptReconnect();
    }

    this.cleanup();
  }

  /**
   * Attempt to reconnect after unexpected disconnect
   */
  private async attemptReconnect(): Promise<void> {
    if (this.isClosing || this.reconnectAttempts >= RETRY_ATTEMPTS) {
      this.emit("sync_failed", {
        reason: "max_retries_exceeded",
        attempts: this.reconnectAttempts,
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = RETRY_BACKOFF_BASE * Math.pow(2, this.reconnectAttempts - 1);

    await new Promise((resolve) => setTimeout(resolve, delay));

    // Emit event for external handler to trigger reconnect
    this.emit("status_changed", {
      state: "reconnecting",
      attempt: this.reconnectAttempts,
    });
  }

  // ==========================================================================
  // Session Management
  // ==========================================================================

  /**
   * Initialize new session
   */
  private initSession(): void {
    this.session = {
      sessionId: generateMessageId(),
      deviceId: this.deviceId,
      deviceName: this.deviceName,
      startedAt: new Date(),
      lastMessageAt: new Date(),
      state: "connecting",
      vectorClock: { ...this.vectorClock },
      pendingMessages: new Map(),
    };
  }

  /**
   * Update session state
   */
  updateState(state: SyncSessionState): void {
    if (this.session) {
      this.session.state = state;
      this.emit("status_changed", { state });
    }
  }

  /**
   * Update vector clock
   */
  updateVectorClock(clock: VectorClock): void {
    this.vectorClock = clock;
    if (this.session) {
      this.session.vectorClock = clock;
    }
  }

  // ==========================================================================
  // Heartbeat
  // ==========================================================================

  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Send heartbeat message
   */
  private sendHeartbeat(): void {
    if (!this.isConnected) return;

    try {
      const pendingChanges = this.session?.pendingMessages.size || 0;
      const heartbeat = createHeartbeatMessage(this.deviceId, pendingChanges);
      this.sendMessageNoWait(heartbeat);
    } catch {
      // Ignore heartbeat send errors
    }
  }

  // ==========================================================================
  // Event System
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

  /**
   * Emit event to all listeners
   */
  private emit(type: SyncEventType | "message_received", data?: unknown): void {
    const event: SyncEvent = {
      type: type as SyncEventType,
      timestamp: new Date(),
      deviceId: this.session?.deviceId,
      data,
    };

    Array.from(this.eventListeners).forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Ignore listener errors
      }
    });
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Clean up all resources
   */
  private cleanup(): void {
    this.stopHeartbeat();

    // Clear all timeouts
    Array.from(this.messageTimeouts.values()).forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.messageTimeouts.clear();

    // Reject all pending resolvers
    Array.from(this.pendingResolvers.values()).forEach((resolver) => {
      resolver.reject(new SyncError("Connection closed", "NO_ACTIVE_SESSION"));
    });
    this.pendingResolvers.clear();

    // Close WebSocket
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, "Normal closure");
      }
      this.ws = null;
    }

    this.session = null;
  }

  /**
   * Destroy connection manager
   */
  destroy(): void {
    this.isClosing = true;
    this.cleanup();
    this.eventListeners.clear();
  }
}

// ============================================================================
// Connection Pool (for multi-device support)
// ============================================================================

/**
 * Manages multiple peer connections
 */
export class ConnectionPool {
  private connections: Map<string, SyncConnection> = new Map();
  private eventListeners: Set<SyncEventListener> = new Set();

  constructor(
    private deviceId: string,
    private deviceName: string,
    private getVectorClock: () => VectorClock
  ) {}

  /**
   * Get connection by device ID
   */
  getConnection(deviceId: string): SyncConnection | undefined {
    return this.connections.get(deviceId);
  }

  /**
   * Get all active connections
   */
  getActiveConnections(): SyncConnection[] {
    return Array.from(this.connections.values()).filter((c) => c.isConnected);
  }

  /**
   * Connect to a new device
   */
  async connect(deviceId: string, url: string): Promise<SyncConnection> {
    // Check for existing connection
    const existing = this.connections.get(deviceId);
    if (existing?.isConnected) {
      return existing;
    }

    // Create new connection
    const connection = new SyncConnection(this.deviceId, this.deviceName, this.getVectorClock());

    // Forward events
    connection.addEventListener((event) => {
      this.emitEvent({
        ...event,
        deviceId,
      });
    });

    // Connect
    await connection.connect(url);

    // Store connection
    this.connections.set(deviceId, connection);

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
   * Broadcast message to all connected devices
   */
  async broadcast<T>(message: SyncMessage<T>): Promise<Map<string, Error | null>> {
    const results = new Map<string, Error | null>();

    const promises = this.getActiveConnections().map(async (connection) => {
      try {
        await connection.sendMessage(message);
        results.set(connection.currentSession?.deviceId || "", null);
      } catch (error) {
        results.set(connection.currentSession?.deviceId || "", error as Error);
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
   * Emit event to all listeners
   */
  private emitEvent(event: SyncEvent): void {
    Array.from(this.eventListeners).forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Ignore listener errors
      }
    });
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    total: number;
    connected: number;
    connecting: number;
    error: number;
  } {
    const connections = Array.from(this.connections.values());
    return {
      total: connections.length,
      connected: connections.filter((c) => c.isConnected).length,
      connecting: connections.filter((c) => c.state === "connecting").length,
      error: connections.filter((c) => c.state === "error").length,
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
  }
}

// ============================================================================
// Exports
// ============================================================================

export default SyncConnection;
