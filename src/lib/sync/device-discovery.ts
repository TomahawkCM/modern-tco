/**
 * Device Discovery Module
 * Phase 7: LAN Sync - L-011
 *
 * Handles device pairing via QR codes and manual IP entry.
 * Stores paired device information in IndexedDB.
 */

import type {
  PairingQRData,
  PairedDevice,
  DeviceIdentity,
} from './types';

// ============================================================================
// Constants
// ============================================================================

const PAIRING_CODE_LENGTH = 6;
const PAIRING_CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_SYNC_PORT = 8765;
const DEVICE_STORAGE_KEY = 'budget-app-device-identity';
const PAIRED_DEVICES_KEY = 'budget-app-paired-devices';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a cryptographically secure 6-digit pairing code
 */
export function generatePairingCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const code = (array[0] % 1000000).toString().padStart(PAIRING_CODE_LENGTH, '0');
  return code;
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Get the local IP address (best effort for PWA)
 * Note: This uses WebRTC for IP detection, which may be blocked
 */
export async function getLocalIP(): Promise<string | null> {
  // In a PWA context, we can't directly access network interfaces
  // The user will need to find their IP manually or we provide guidance
  
  // Try WebRTC approach (may be blocked by browser privacy settings)
  try {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        pc.close();
        resolve(null);
      }, 1000);
      
      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        
        const candidateStr = event.candidate.candidate;
        const match = candidateStr.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
        
        if (match && !match[1].startsWith('127.')) {
          clearTimeout(timeout);
          pc.close();
          resolve(match[1]);
        }
      };
    });
  } catch {
    return null;
  }
}

/**
 * Check if an IP:port is reachable
 */
export async function checkReachability(
  ip: string,
  port: number,
  timeout = 3000
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Try to connect via fetch (will fail due to CORS but connection attempt is made)
    await fetch(`http://${ip}:${port}/ping`, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors',
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    // AbortError means timeout, other errors might indicate connection failed
    return false;
  }
}

// ============================================================================
// Device Identity Management
// ============================================================================

/**
 * Get or create this device's identity
 */
export async function getDeviceIdentity(): Promise<DeviceIdentity> {
  // Check localStorage first
  const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
  
  if (stored) {
    try {
      const identity = JSON.parse(stored);
      identity.createdAt = new Date(identity.createdAt);
      return identity;
    } catch {
      // Corrupted data, regenerate
    }
  }
  
  // Generate new identity
  const identity = await createDeviceIdentity();
  localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(identity));
  
  return identity;
}

/**
 * Create a new device identity with ECDH keypair
 */
async function createDeviceIdentity(): Promise<DeviceIdentity> {
  // Generate ECDH keypair using Web Crypto API
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true, // extractable
    ['deriveKey', 'deriveBits']
  );
  
  // Export public key
  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyArray = Array.from(new Uint8Array(publicKeyBuffer));
  const publicKey = btoa(String.fromCharCode.apply(null, publicKeyArray));

  // Export private key (store encrypted in production)
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privateKeyArray = Array.from(new Uint8Array(privateKeyBuffer));
  const privateKey = btoa(String.fromCharCode.apply(null, privateKeyArray));
  
  // Generate device name
  const deviceName = await generateDeviceName();
  
  return {
    id: generateUUID(),
    deviceName,
    publicKey,
    privateKey,
    createdAt: new Date(),
  };
}

/**
 * Generate a default device name based on platform
 */
async function generateDeviceName(): Promise<string> {
  const ua = navigator.userAgent;
  
  if (/iPhone|iPad|iPod/.test(ua)) {
    return 'iPhone';
  } else if (/Android/.test(ua)) {
    return 'Android Device';
  } else if (/Mac/.test(ua)) {
    return 'Mac';
  } else if (/Windows/.test(ua)) {
    return 'Windows PC';
  } else if (/Linux/.test(ua)) {
    return 'Linux Device';
  }
  
  return 'Budget App Device';
}

/**
 * Update device name
 */
export async function updateDeviceName(name: string): Promise<DeviceIdentity> {
  const identity = await getDeviceIdentity();
  identity.deviceName = name;
  localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(identity));
  return identity;
}

// ============================================================================
// QR Code Pairing
// ============================================================================

/**
 * Generate QR code data for pairing
 * This creates the data that should be encoded in the QR code
 */
export async function generatePairingQRData(
  ip?: string,
  port: number = DEFAULT_SYNC_PORT
): Promise<PairingQRData> {
  const identity = await getDeviceIdentity();
  
  // Try to auto-detect IP if not provided
  const localIP = ip || await getLocalIP() || '0.0.0.0';
  
  const qrData: PairingQRData = {
    version: 1,
    ip: localIP,
    port,
    code: generatePairingCode(),
    pubKey: identity.publicKey,
    deviceName: identity.deviceName,
    timestamp: Date.now(),
  };
  
  return qrData;
}

/**
 * Validate pairing QR data
 */
export function validatePairingQRData(data: unknown): data is PairingQRData {
  if (typeof data !== 'object' || data === null) return false;
  
  const qr = data as Record<string, unknown>;
  
  return (
    qr.version === 1 &&
    typeof qr.ip === 'string' &&
    typeof qr.port === 'number' &&
    typeof qr.code === 'string' &&
    qr.code.length === PAIRING_CODE_LENGTH &&
    typeof qr.pubKey === 'string' &&
    typeof qr.deviceName === 'string' &&
    typeof qr.timestamp === 'number'
  );
}

/**
 * Check if pairing data has expired
 */
export function isPairingExpired(data: PairingQRData): boolean {
  return Date.now() - data.timestamp > PAIRING_CODE_EXPIRY_MS;
}

/**
 * Parse QR code content
 */
export function parsePairingQRCode(content: string): PairingQRData | null {
  try {
    const data = JSON.parse(content);
    
    if (!validatePairingQRData(data)) {
      console.error('Invalid QR code data structure');
      return null;
    }
    
    if (isPairingExpired(data)) {
      console.error('QR code has expired');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to parse QR code:', error);
    return null;
  }
}

// ============================================================================
// Manual IP Entry
// ============================================================================

/**
 * Connection info from manual entry
 */
export interface ManualConnectionInfo {
  ip: string;
  port: number;
  pairingCode: string;
}

/**
 * Validate manual connection info
 */
export function validateManualConnection(info: ManualConnectionInfo): string | null {
  // Validate IP format
  const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipPattern.test(info.ip)) {
    return 'Invalid IP address format';
  }
  
  // Validate port
  if (info.port < 1 || info.port > 65535) {
    return 'Port must be between 1 and 65535';
  }
  
  // Validate pairing code
  if (!/^\d{6}$/.test(info.pairingCode)) {
    return 'Pairing code must be 6 digits';
  }
  
  return null;
}

// ============================================================================
// Paired Devices Storage (IndexedDB via localStorage for now)
// ============================================================================

/**
 * Get all paired devices
 */
export function getPairedDevices(): PairedDevice[] {
  const stored = localStorage.getItem(PAIRED_DEVICES_KEY);
  
  if (!stored) return [];
  
  try {
    const devices = JSON.parse(stored) as PairedDevice[];
    // Convert date strings back to Date objects
    return devices.map(d => ({
      ...d,
      lastSyncAt: d.lastSyncAt ? new Date(d.lastSyncAt) : null,
      lastSeenAt: new Date(d.lastSeenAt),
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Get a specific paired device by ID
 */
export function getPairedDevice(deviceId: string): PairedDevice | null {
  const devices = getPairedDevices();
  return devices.find(d => d.deviceId === deviceId) || null;
}

/**
 * Add or update a paired device
 */
export function savePairedDevice(device: Omit<PairedDevice, 'id' | 'createdAt' | 'updatedAt'>): PairedDevice {
  const devices = getPairedDevices();
  const existing = devices.find(d => d.deviceId === device.deviceId);
  
  const now = new Date();
  
  if (existing) {
    // Update existing device
    Object.assign(existing, {
      ...device,
      updatedAt: now,
    });
  } else {
    // Add new device
    const newDevice: PairedDevice = {
      id: generateUUID(),
      ...device,
      createdAt: now,
      updatedAt: now,
    };
    devices.push(newDevice);
  }
  
  localStorage.setItem(PAIRED_DEVICES_KEY, JSON.stringify(devices));
  
  return existing || devices[devices.length - 1];
}

/**
 * Update paired device sync status
 */
export function updateDeviceSyncStatus(
  deviceId: string,
  updates: Partial<Pick<PairedDevice, 'lastSyncAt' | 'lastSeenAt' | 'lastIP' | 'lastPort'>>
): void {
  const devices = getPairedDevices();
  const device = devices.find(d => d.deviceId === deviceId);
  
  if (device) {
    Object.assign(device, updates, { updatedAt: new Date() });
    localStorage.setItem(PAIRED_DEVICES_KEY, JSON.stringify(devices));
  }
}

/**
 * Remove a paired device
 */
export function removePairedDevice(deviceId: string): boolean {
  const devices = getPairedDevices();
  const index = devices.findIndex(d => d.deviceId === deviceId);
  
  if (index === -1) return false;
  
  devices.splice(index, 1);
  localStorage.setItem(PAIRED_DEVICES_KEY, JSON.stringify(devices));
  
  return true;
}

/**
 * Block a device
 */
export function blockDevice(deviceId: string): void {
  const devices = getPairedDevices();
  const device = devices.find(d => d.deviceId === deviceId);
  
  if (device) {
    device.trustLevel = 'blocked';
    device.updatedAt = new Date();
    localStorage.setItem(PAIRED_DEVICES_KEY, JSON.stringify(devices));
  }
}

/**
 * Unblock a device
 */
export function unblockDevice(deviceId: string): void {
  const devices = getPairedDevices();
  const device = devices.find(d => d.deviceId === deviceId);
  
  if (device) {
    device.trustLevel = 'trusted';
    device.updatedAt = new Date();
    localStorage.setItem(PAIRED_DEVICES_KEY, JSON.stringify(devices));
  }
}

/**
 * Check if a device is trusted
 */
export function isDeviceTrusted(deviceId: string): boolean {
  const device = getPairedDevice(deviceId);
  return device?.trustLevel === 'trusted';
}

// ============================================================================
// Active Pairing Session Management
// ============================================================================

interface ActivePairingSession {
  qrData: PairingQRData;
  createdAt: Date;
  expiresAt: Date;
}

let activePairingSession: ActivePairingSession | null = null;

/**
 * Start a new pairing session (host mode)
 */
export async function startPairingSession(
  ip?: string,
  port?: number
): Promise<PairingQRData> {
  const qrData = await generatePairingQRData(ip, port);
  
  activePairingSession = {
    qrData,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + PAIRING_CODE_EXPIRY_MS),
  };
  
  return qrData;
}

/**
 * Verify a pairing code against the active session
 */
export function verifyPairingCode(code: string): boolean {
  if (!activePairingSession) return false;
  
  if (new Date() > activePairingSession.expiresAt) {
    activePairingSession = null;
    return false;
  }
  
  return activePairingSession.qrData.code === code;
}

/**
 * End the current pairing session
 */
export function endPairingSession(): void {
  activePairingSession = null;
}

/**
 * Get the active pairing session
 */
export function getActivePairingSession(): ActivePairingSession | null {
  if (!activePairingSession) return null;
  
  if (new Date() > activePairingSession.expiresAt) {
    activePairingSession = null;
    return null;
  }
  
  return activePairingSession;
}

// ============================================================================
// Export all functions
// ============================================================================

export const DeviceDiscovery = {
  // Utility
  generatePairingCode,
  generateUUID,
  getLocalIP,
  checkReachability,
  
  // Device Identity
  getDeviceIdentity,
  updateDeviceName,
  
  // QR Code
  generatePairingQRData,
  validatePairingQRData,
  isPairingExpired,
  parsePairingQRCode,
  
  // Manual Entry
  validateManualConnection,
  
  // Paired Devices
  getPairedDevices,
  getPairedDevice,
  savePairedDevice,
  updateDeviceSyncStatus,
  removePairedDevice,
  blockDevice,
  unblockDevice,
  isDeviceTrusted,
  
  // Pairing Session
  startPairingSession,
  verifyPairingCode,
  endPairingSession,
  getActivePairingSession,
};

export default DeviceDiscovery;
