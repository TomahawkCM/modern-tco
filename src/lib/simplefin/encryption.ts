/**
 * SimpleFIN Token Encryption
 *
 * Provides secure encryption/decryption for SimpleFIN access URLs.
 * Uses Web Crypto API with AES-GCM for authenticated encryption.
 *
 * Security Notes:
 * - Access URLs contain credentials and must be stored encrypted
 * - Uses per-token IVs for semantic security
 * - Key should be derived from user-specific secret or stored securely
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for GCM

// =============================================================================
// TYPE HELPERS
// =============================================================================

/**
 * Convert Uint8Array to proper ArrayBuffer for Web Crypto API
 * Handles TypeScript's strict BufferSource typing
 */
function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  // If already backed by own buffer, return a copy to avoid SharedArrayBuffer issues
  if (data.byteOffset === 0 && data.byteLength === data.buffer.byteLength) {
    return data.buffer.slice(0) as ArrayBuffer;
  }
  // Otherwise, create new buffer from the specific view
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

// =============================================================================
// KEY MANAGEMENT
// =============================================================================

/**
 * Derive encryption key from password/secret
 * Uses PBKDF2 for key derivation
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random encryption key
 * For server-side storage with secure key management
 */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export key to raw format for storage
 */
export async function exportKey(key: CryptoKey): Promise<Uint8Array> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

/**
 * Import key from raw format
 */
export async function importKey(keyData: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    toArrayBuffer(keyData),
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

// =============================================================================
// ENCRYPTION/DECRYPTION
// =============================================================================

/**
 * Encrypt access URL
 *
 * @param accessUrl - The SimpleFIN access URL to encrypt
 * @param key - CryptoKey for encryption
 * @returns Object with encrypted data and IV (both as base64)
 */
export async function encryptAccessUrl(
  accessUrl: string,
  key: CryptoKey
): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(accessUrl);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: toArrayBuffer(iv),
    },
    key,
    toArrayBuffer(data)
  );

  // Convert to base64 for storage
  return {
    encrypted: bufferToBase64(new Uint8Array(encryptedBuffer)),
    iv: bufferToBase64(iv),
  };
}

/**
 * Decrypt access URL
 *
 * @param encrypted - Base64 encrypted data
 * @param iv - Base64 IV
 * @param key - CryptoKey for decryption
 * @returns Decrypted access URL
 */
export async function decryptAccessUrl(
  encrypted: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const encryptedData = base64ToBuffer(encrypted);
  const ivData = base64ToBuffer(iv);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: toArrayBuffer(ivData),
    },
    key,
    toArrayBuffer(encryptedData)
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert Uint8Array to base64 string
 */
function bufferToBase64(buffer: Uint8Array): string {
  // Browser environment
  if (typeof btoa !== 'undefined') {
    return btoa(String.fromCharCode(...buffer));
  }
  // Node.js environment
  return Buffer.from(buffer).toString('base64');
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToBuffer(base64: string): Uint8Array {
  // Browser environment
  if (typeof atob !== 'undefined') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  // Node.js environment
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

/**
 * Generate random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Convert salt to/from base64 for storage
 */
export function saltToBase64(salt: Uint8Array): string {
  return bufferToBase64(salt);
}

export function base64ToSalt(base64: string): Uint8Array {
  return base64ToBuffer(base64);
}

// =============================================================================
// HIGH-LEVEL API
// =============================================================================

/**
 * Secure storage manager for SimpleFIN credentials
 *
 * Usage:
 * ```typescript
 * const storage = new SecureTokenStorage(userSecret);
 * await storage.initialize();
 *
 * // Store access URL
 * const { encrypted, iv, salt } = await storage.store(accessUrl);
 *
 * // Retrieve access URL
 * const accessUrl = await storage.retrieve(encrypted, iv);
 * ```
 */
export class SecureTokenStorage {
  private secret: string;
  private key: CryptoKey | null = null;
  private salt: Uint8Array | null = null;

  constructor(secret: string) {
    this.secret = secret;
  }

  /**
   * Initialize with existing or new salt
   */
  async initialize(existingSalt?: string): Promise<string> {
    if (existingSalt) {
      this.salt = base64ToSalt(existingSalt);
    } else {
      this.salt = generateSalt();
    }

    this.key = await deriveKey(this.secret, this.salt);
    return saltToBase64(this.salt);
  }

  /**
   * Encrypt and store access URL
   */
  async store(accessUrl: string): Promise<{
    encrypted: string;
    iv: string;
    salt: string;
  }> {
    if (!this.key || !this.salt) {
      throw new Error('Storage not initialized. Call initialize() first.');
    }

    const { encrypted, iv } = await encryptAccessUrl(accessUrl, this.key);
    return {
      encrypted,
      iv,
      salt: saltToBase64(this.salt),
    };
  }

  /**
   * Decrypt and retrieve access URL
   */
  async retrieve(encrypted: string, iv: string): Promise<string> {
    if (!this.key) {
      throw new Error('Storage not initialized. Call initialize() first.');
    }

    return decryptAccessUrl(encrypted, iv, this.key);
  }

  /**
   * Test if decryption works (validate credentials)
   */
  async validate(encrypted: string, iv: string): Promise<boolean> {
    try {
      await this.retrieve(encrypted, iv);
      return true;
    } catch {
      return false;
    }
  }
}

export default SecureTokenStorage;
