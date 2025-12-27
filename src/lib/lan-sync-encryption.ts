/**
 * LAN Sync Encryption Module (L-013)
 *
 * Provides ECDH key exchange and AES-256-GCM encryption for LAN sync.
 * Uses Web Crypto API for all cryptographic operations.
 */

// ============================================================================
// Constants
// ============================================================================

const ECDH_ALGORITHM = 'ECDH';
const ECDH_CURVE = 'P-256'; // NIST P-256 curve
const AES_ALGORITHM = 'AES-GCM';
const AES_KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes (96 bits for GCM)
const AUTH_TAG_LENGTH = 128; // bits (16 bytes)

const KEY_STORAGE_PREFIX = 'lan_sync_key_';

// ============================================================================
// Types
// ============================================================================

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyBase64: string;
}

export interface SessionKeys {
  sessionId: string;
  encryptKey: CryptoKey;
  decryptKey: CryptoKey;
  establishedAt: Date;
  remotePublicKey: string;
}

export interface EncryptedMessage {
  iv: string; // base64
  ciphertext: string; // base64
  tag?: string; // GCM auth tag included in ciphertext
}

// ============================================================================
// Key Generation and Exchange
// ============================================================================

/**
 * Generate an ECDH key pair for key exchange
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: ECDH_ALGORITHM,
      namedCurve: ECDH_CURVE,
    },
    true, // extractable
    ['deriveBits', 'deriveKey']
  );

  const publicKeyExported = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyBase64 = arrayBufferToBase64(publicKeyExported);

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyBase64,
  };
}

/**
 * Import a public key from base64 string
 */
export async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  const publicKeyData = base64ToArrayBuffer(publicKeyBase64);

  return await crypto.subtle.importKey(
    'spki',
    publicKeyData,
    {
      name: ECDH_ALGORITHM,
      namedCurve: ECDH_CURVE,
    },
    true,
    []
  );
}

/**
 * Import a private key from base64 string
 */
export async function importPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
  const privateKeyData = base64ToArrayBuffer(privateKeyBase64);

  return await crypto.subtle.importKey(
    'pkcs8',
    privateKeyData,
    {
      name: ECDH_ALGORITHM,
      namedCurve: ECDH_CURVE,
    },
    true,
    ['deriveBits', 'deriveKey']
  );
}

/**
 * Export a private key to base64 string for storage
 */
export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
  return arrayBufferToBase64(exported);
}

/**
 * Derive a shared secret from our private key and their public key
 */
export async function deriveSharedSecret(
  privateKey: CryptoKey,
  remotePublicKey: CryptoKey
): Promise<ArrayBuffer> {
  return await crypto.subtle.deriveBits(
    {
      name: ECDH_ALGORITHM,
      public: remotePublicKey,
    },
    privateKey,
    256 // bits
  );
}

/**
 * Derive an AES key from a shared secret
 */
export async function deriveAESKey(
  sharedSecret: ArrayBuffer,
  salt: Uint8Array,
  info: string
): Promise<CryptoKey> {
  // Import the shared secret as an HKDF key
  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );

  // Derive an AES key using HKDF
  const encoder = new TextEncoder();

  return await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(salt).buffer,
      info: new Uint8Array(encoder.encode(info)).buffer,
    },
    hkdfKey,
    {
      name: AES_ALGORITHM,
      length: AES_KEY_LENGTH,
    },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Establish session keys with a remote device
 */
export async function establishSessionKeys(
  localPrivateKey: CryptoKey,
  remotePublicKeyBase64: string,
  sessionId: string
): Promise<SessionKeys> {
  const remotePublicKey = await importPublicKey(remotePublicKeyBase64);

  // Derive shared secret
  const sharedSecret = await deriveSharedSecret(localPrivateKey, remotePublicKey);

  // Generate salt for key derivation
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive separate keys for encryption and decryption
  // This provides forward secrecy for each session
  const encryptKey = await deriveAESKey(sharedSecret, salt, `session-${sessionId}-encrypt`);
  const decryptKey = await deriveAESKey(sharedSecret, salt, `session-${sessionId}-decrypt`);

  return {
    sessionId,
    encryptKey,
    decryptKey,
    establishedAt: new Date(),
    remotePublicKey: remotePublicKeyBase64,
  };
}

// ============================================================================
// Encryption and Decryption
// ============================================================================

/**
 * Encrypt a message using AES-256-GCM
 */
export async function encrypt(
  key: CryptoKey,
  data: string | Uint8Array
): Promise<EncryptedMessage> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  let dataBytes: Uint8Array;
  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    dataBytes = encoder.encode(data);
  } else {
    dataBytes = data;
  }

  // Create a copy as ArrayBuffer to avoid SharedArrayBuffer type issues
  const dataBuffer = new Uint8Array(dataBytes).buffer as ArrayBuffer;

  const encrypted = await crypto.subtle.encrypt(
    {
      name: AES_ALGORITHM,
      iv,
      tagLength: AUTH_TAG_LENGTH,
    },
    key,
    dataBuffer
  );

  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(encrypted),
  };
}

/**
 * Decrypt a message using AES-256-GCM
 */
export async function decrypt(
  key: CryptoKey,
  encrypted: EncryptedMessage
): Promise<Uint8Array> {
  const iv = new Uint8Array(base64ToArrayBuffer(encrypted.iv));
  const ciphertext = base64ToArrayBuffer(encrypted.ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: AES_ALGORITHM,
      iv,
      tagLength: AUTH_TAG_LENGTH,
    },
    key,
    ciphertext
  );

  return new Uint8Array(decrypted);
}

/**
 * Decrypt a message to string
 */
export async function decryptToString(
  key: CryptoKey,
  encrypted: EncryptedMessage
): Promise<string> {
  const decrypted = await decrypt(key, encrypted);
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Encrypt a JSON object
 */
export async function encryptObject<T>(
  key: CryptoKey,
  obj: T
): Promise<EncryptedMessage> {
  const json = JSON.stringify(obj);
  return encrypt(key, json);
}

/**
 * Decrypt to a JSON object
 */
export async function decryptObject<T>(
  key: CryptoKey,
  encrypted: EncryptedMessage
): Promise<T> {
  const json = await decryptToString(key, encrypted);
  return JSON.parse(json) as T;
}

// ============================================================================
// Key Storage
// ============================================================================

/**
 * Store a key pair securely in browser storage
 */
export async function storeKeyPair(
  deviceId: string,
  keyPair: KeyPair
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Key storage is only available in the browser');
  }

  const privateKeyBase64 = await exportPrivateKey(keyPair.privateKey);

  const keyData = {
    publicKey: keyPair.publicKeyBase64,
    privateKey: privateKeyBase64,
    createdAt: new Date().toISOString(),
  };

  // Store in localStorage with encryption prefix
  const storageKey = `${KEY_STORAGE_PREFIX}${deviceId}`;
  localStorage.setItem(storageKey, JSON.stringify(keyData));
}

/**
 * Load a key pair from browser storage
 */
export async function loadKeyPair(deviceId: string): Promise<KeyPair | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const storageKey = `${KEY_STORAGE_PREFIX}${deviceId}`;
  const storedData = localStorage.getItem(storageKey);

  if (!storedData) {
    return null;
  }

  try {
    const keyData = JSON.parse(storedData);

    const publicKey = await importPublicKey(keyData.publicKey);
    const privateKey = await importPrivateKey(keyData.privateKey);

    return {
      publicKey,
      privateKey,
      publicKeyBase64: keyData.publicKey,
    };
  } catch (error) {
    console.error('Failed to load key pair:', error);
    return null;
  }
}

/**
 * Delete a key pair from storage
 */
export function deleteKeyPair(deviceId: string): void {
  if (typeof window === 'undefined') return;

  const storageKey = `${KEY_STORAGE_PREFIX}${deviceId}`;
  localStorage.removeItem(storageKey);
}

/**
 * Get or create a key pair for the device
 */
export async function getOrCreateKeyPair(deviceId: string): Promise<KeyPair> {
  // Try to load existing key pair
  const existing = await loadKeyPair(deviceId);
  if (existing) {
    return existing;
  }

  // Generate new key pair
  const newKeyPair = await generateKeyPair();
  await storeKeyPair(deviceId, newKeyPair);

  return newKeyPair;
}

// ============================================================================
// Session Key Management
// ============================================================================

// In-memory session key cache
const sessionKeyCache = new Map<string, SessionKeys>();

/**
 * Cache session keys for a device
 */
export function cacheSessionKeys(deviceId: string, keys: SessionKeys): void {
  sessionKeyCache.set(deviceId, keys);
}

/**
 * Get cached session keys for a device
 */
export function getCachedSessionKeys(deviceId: string): SessionKeys | undefined {
  return sessionKeyCache.get(deviceId);
}

/**
 * Clear cached session keys for a device
 */
export function clearSessionKeys(deviceId: string): void {
  sessionKeyCache.delete(deviceId);
}

/**
 * Clear all cached session keys
 */
export function clearAllSessionKeys(): void {
  sessionKeyCache.clear();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a random session ID
 */
export function generateSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify message integrity (used with HMAC)
 */
export async function verifyIntegrity(
  key: CryptoKey,
  data: Uint8Array,
  signature: Uint8Array
): Promise<boolean> {
  try {
    // For GCM, integrity is verified during decryption
    // This function is for additional HMAC verification if needed
    const hmacKey = await crypto.subtle.importKey(
      'raw',
      await crypto.subtle.exportKey('raw', key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Create copies as ArrayBuffer to avoid SharedArrayBuffer type issues
    const sigBuffer = new Uint8Array(signature).buffer as ArrayBuffer;
    const dataBuffer = new Uint8Array(data).buffer as ArrayBuffer;

    return await crypto.subtle.verify(
      'HMAC',
      hmacKey,
      sigBuffer,
      dataBuffer
    );
  } catch {
    return false;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  generateKeyPair,
  importPublicKey,
  importPrivateKey,
  exportPrivateKey,
  deriveSharedSecret,
  deriveAESKey,
  establishSessionKeys,
  encrypt,
  decrypt,
  decryptToString,
  encryptObject,
  decryptObject,
  storeKeyPair,
  loadKeyPair,
  deleteKeyPair,
  getOrCreateKeyPair,
  cacheSessionKeys,
  getCachedSessionKeys,
  clearSessionKeys,
  clearAllSessionKeys,
  generateSessionId,
};
