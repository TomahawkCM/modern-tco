/**
 * Budget App Encryption Layer
 * Client-side encryption for sensitive transaction data using Web Crypto API
 *
 * Uses AES-GCM encryption for authenticated encryption
 * Generates device-derived encryption keys (no password required)
 *
 * Privacy: All encryption/decryption happens client-side, keys never leave the device
 *
 * Offline Mode: Uses device fingerprint for automatic key derivation
 */

const ENCRYPTION_KEY_STORAGE = 'budget-app-encryption-key';
const KEY_DERIVATION_SALT_STORAGE = 'budget-app-key-salt';
const DEVICE_FINGERPRINT_STORAGE = 'budget-app-device-fp';

/**
 * Generate a device fingerprint for automatic key derivation
 * This creates a unique identifier based on browser/device properties
 * Note: This is not a tracking fingerprint - it's only used locally for encryption
 */
async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // Browser properties
  if (typeof navigator !== 'undefined') {
    components.push(navigator.userAgent);
    components.push(navigator.language);
    components.push(navigator.platform || 'unknown');
    components.push(navigator.hardwareConcurrency?.toString() || '0');
    components.push((navigator as any).deviceMemory?.toString() || '0');
  }

  // Screen properties
  if (typeof screen !== 'undefined') {
    components.push(`${screen.width}x${screen.height}`);
    components.push(screen.colorDepth?.toString() || '24');
    components.push(`${screen.availWidth}x${screen.availHeight}`);
  }

  // Timezone
  try {
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    components.push('UTC');
  }

  // Canvas fingerprint (minimal, privacy-friendly)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('BudgetApp', 2, 2);
      components.push(canvas.toDataURL().slice(-50));
    }
  } catch {
    components.push('no-canvas');
  }

  // Combine and hash
  const combined = components.join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create a stable device fingerprint
 * Stored in localStorage for consistency across sessions
 */
async function getDeviceFingerprint(): Promise<string> {
  try {
    // Check for stored fingerprint first (for consistency)
    const stored = localStorage.getItem(DEVICE_FINGERPRINT_STORAGE);
    if (stored) {
      return stored;
    }

    // Generate new fingerprint
    const fingerprint = await generateDeviceFingerprint();
    localStorage.setItem(DEVICE_FINGERPRINT_STORAGE, fingerprint);
    return fingerprint;
  } catch (error) {
    console.warn('[Encryption] Failed to generate device fingerprint, using fallback');
    // Fallback to a random but stable identifier
    const fallback = crypto.getRandomValues(new Uint8Array(32));
    const fallbackStr = Array.from(fallback).map(b => b.toString(16).padStart(2, '0')).join('');
    try {
      localStorage.setItem(DEVICE_FINGERPRINT_STORAGE, fallbackStr);
    } catch {
      // Storage may be unavailable
    }
    return fallbackStr;
  }
}

export interface EncryptionResult {
  encrypted: string; // Base64-encoded encrypted data
  iv: string; // Base64-encoded initialization vector
}

export interface EncryptionKey {
  key: CryptoKey;
  salt: Uint8Array;
}

/**
 * Generate a device-derived encryption key
 * Uses PBKDF2 with device fingerprint for automatic key derivation
 * No password required - encryption is transparent to the user
 */
export async function generateEncryptionKey(
  password?: string
): Promise<EncryptionKey> {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Use device fingerprint for automatic key derivation (offline mode)
  // Falls back to password if provided (for future use cases)
  let keyMaterial: string;
  if (password) {
    keyMaterial = password;
  } else {
    // Device-derived key - no password needed
    keyMaterial = await getDeviceFingerprint();
  }

  // Import fingerprint/password as key material
  const keyMaterialBuffer = new TextEncoder().encode(keyMaterial);
  const importedKey = await crypto.subtle.importKey(
    'raw',
    keyMaterialBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256',
    },
    importedKey,
    {
      name: 'AES-GCM',
      length: 256, // 256-bit key
    },
    false, // Not extractable
    ['encrypt', 'decrypt']
  );

  return { key, salt };
}

/**
 * Get or create encryption key
 * Uses device fingerprint for automatic key derivation
 * Stores salt in localStorage (safe to store, key is derived from fingerprint + salt)
 */
export async function getOrCreateEncryptionKey(
  password?: string
): Promise<CryptoKey> {
  try {
    // Try to load existing key from storage
    const storedSalt = localStorage.getItem(KEY_DERIVATION_SALT_STORAGE);

    if (storedSalt && !password) {
      // Use stored salt + device fingerprint to recreate key
      const saltArray = Uint8Array.from(atob(storedSalt), c => c.charCodeAt(0));

      // Get device fingerprint for key derivation
      const fingerprint = await getDeviceFingerprint();
      const keyMaterialBuffer = new TextEncoder().encode(fingerprint);

      const importedKey = await crypto.subtle.importKey(
        'raw',
        keyMaterialBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltArray,
          iterations: 100000,
          hash: 'SHA-256',
        },
        importedKey,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['encrypt', 'decrypt']
      );

      return key;
    } else {
      // Generate new key (uses device fingerprint automatically)
      const { key, salt } = await generateEncryptionKey(password);

      // Store salt (safe to store, not the actual key)
      const saltBase64 = btoa(String.fromCharCode(...salt));
      localStorage.setItem(KEY_DERIVATION_SALT_STORAGE, saltBase64);

      return key;
    }
  } catch (error) {
    console.error('[Encryption] Error getting encryption key:', error);
    throw new Error('Failed to initialize encryption key');
  }
}

/**
 * Encrypt sensitive data using AES-GCM
 */
export async function encryptData(
  data: string,
  key?: CryptoKey
): Promise<EncryptionResult> {
  try {
    const encryptionKey = key || await getOrCreateEncryptionKey();
    
    // Generate random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    
    // Convert data to ArrayBuffer
    const dataBuffer = new TextEncoder().encode(data);
    
    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128, // 128-bit authentication tag
      },
      encryptionKey,
      dataBuffer
    );
    
    // Convert to base64 for storage
    const encryptedBase64 = btoa(
      String.fromCharCode(...new Uint8Array(encryptedBuffer))
    );
    const ivBase64 = btoa(String.fromCharCode(...iv));
    
    return {
      encrypted: encryptedBase64,
      iv: ivBase64,
    };
  } catch (error) {
    console.error('[Encryption] Error encrypting data:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(
  encryptedData: string,
  iv: string,
  key?: CryptoKey
): Promise<string> {
  try {
    const encryptionKey = key || await getOrCreateEncryptionKey();
    
    // Convert from base64
    const encryptedArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    
    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
        tagLength: 128,
      },
      encryptionKey,
      encryptedArray
    );
    
    // Convert back to string
    const decrypted = new TextDecoder().decode(decryptedBuffer);
    
    return decrypted;
  } catch (error) {
    console.error('[Encryption] Error decrypting data:', error);
    throw new Error('Failed to decrypt data. Key may have changed or data is corrupted.');
  }
}

/**
 * Encrypt transaction description
 */
export async function encryptTransactionDescription(
  description: string
): Promise<{ encrypted: string; iv: string }> {
  if (!description) {
    return { encrypted: '', iv: '' };
  }
  
  return await encryptData(description);
}

/**
 * Decrypt transaction description
 */
export async function decryptTransactionDescription(
  encrypted: string,
  iv: string
): Promise<string> {
  if (!encrypted || !iv) {
    return '';
  }
  
  try {
    return await decryptData(encrypted, iv);
  } catch (error) {
    console.error('[Encryption] Failed to decrypt description:', error);
    return '[Decryption Error]';
  }
}

/**
 * Encrypt transaction amount
 * Amounts are stored as strings to preserve precision
 */
export async function encryptAmount(amount: number): Promise<{ encrypted: string; iv: string }> {
  const amountString = amount.toString();
  return await encryptData(amountString);
}

/**
 * Decrypt transaction amount
 */
export async function decryptAmount(
  encrypted: string,
  iv: string
): Promise<number> {
  if (!encrypted || !iv) {
    return 0;
  }
  
  try {
    const decrypted = await decryptData(encrypted, iv);
    return parseFloat(decrypted);
  } catch (error) {
    console.error('[Encryption] Failed to decrypt amount:', error);
    return 0;
  }
}

/**
 * Generate hash of amount for searching (one-way)
 * Useful for searching without decrypting
 */
export async function hashAmount(amount: number): Promise<string> {
  const amountString = amount.toString();
  const encoder = new TextEncoder();
  const data = encoder.encode(amountString);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Check if encryption is enabled and available
 */
export function isEncryptionAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if Web Crypto API is available
  if (!crypto || !crypto.subtle) {
    return false;
  }
  
  // Check privacy settings
  try {
    const settings = localStorage.getItem('budget-app-privacy-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.enableEncryption === true;
    }
  } catch (error) {
    console.warn('[Encryption] Failed to check privacy settings:', error);
  }
  
  return false;
}

/**
 * Clear encryption key (for testing or key rotation)
 */
export function clearEncryptionKey(): void {
  localStorage.removeItem(KEY_DERIVATION_SALT_STORAGE);
  localStorage.removeItem(ENCRYPTION_KEY_STORAGE);
}

/**
 * Disable encryption (doesn't decrypt existing data, just stops using encryption)
 */
export function disableEncryption(): void {
  // Note: This doesn't decrypt existing encrypted data
  // It just clears the encryption key so new data won't be encrypted
  // Existing encrypted data will remain encrypted until encryption is re-enabled
  clearEncryptionKey();
}

/**
 * Enable encryption by generating and storing encryption key
 */
export async function enableEncryption(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Encryption can only be enabled in the browser');
  }

  // Check if Web Crypto API is available
  if (!crypto || !crypto.subtle) {
    throw new Error('Web Crypto API is not available in this browser');
  }

  // Generate and store encryption key
  await getOrCreateEncryptionKey();
}

/**
 * Check if encryption is enabled in privacy settings
 */
export function isEncryptionEnabled(): boolean {
  return isEncryptionAvailable();
}

/**
 * Encrypt a transaction object
 */
export async function encryptTransaction(
  transaction: { description?: string; amount?: number }
): Promise<{
  encryptedDescription?: string;
  encryptedAmount?: string;
  encryptionIv?: string;
  amountHash?: string;
}> {
  const result: {
    encryptedDescription?: string;
    encryptedAmount?: string;
    encryptionIv?: string;
    amountHash?: string;
  } = {};

  // Encrypt description if present
  if (transaction.description) {
    const descResult = await encryptTransactionDescription(transaction.description);
    result.encryptedDescription = descResult.encrypted;
    result.encryptionIv = descResult.iv; // Use description IV as primary IV
  }

  // Encrypt amount if present
  if (transaction.amount !== undefined) {
    const amountResult = await encryptAmount(transaction.amount);
    result.encryptedAmount = amountResult.encrypted;
    // If no description IV, use amount IV
    if (!result.encryptionIv) {
      result.encryptionIv = amountResult.iv;
    }
    // Generate hash for searching
    result.amountHash = await hashAmount(transaction.amount);
  }

  return result;
}

/**
 * Decrypt a transaction object
 */
export async function decryptTransaction<T extends {
  encryptedDescription?: string;
  encryptedAmount?: string;
  encryptionIv?: string;
  description?: string;
  amount?: number;
}>(transaction: T): Promise<T> {
  // Start with a copy of the original transaction
  const result = { ...transaction };

  // If encrypted, decrypt and replace encrypted fields
  if (transaction.encryptedDescription && transaction.encryptionIv) {
    result.description = await decryptTransactionDescription(
      transaction.encryptedDescription,
      transaction.encryptionIv
    ) as any;
  }

  if (transaction.encryptedAmount && transaction.encryptionIv) {
    result.amount = await decryptAmount(
      transaction.encryptedAmount,
      transaction.encryptionIv
    ) as any;
  }

  return result;
}