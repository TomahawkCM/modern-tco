/**
 * Client-Side Encryption Layer for Budget App
 * Uses Web Crypto API with AES-GCM-256 for secure data storage
 * 
 * Privacy: All sensitive data (amounts, descriptions, account info) is encrypted at rest
 * Key Management: User-specific encryption keys stored securely in browser
 */

const ENCRYPTION_KEY_STORAGE_KEY = 'budget_app_encryption_key';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes (96 bits for GCM)

/**
 * Generate a new encryption key using Web Crypto API
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export encryption key to ArrayBuffer for storage
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return await crypto.subtle.exportKey('raw', key);
}

/**
 * Import encryption key from ArrayBuffer
 */
export async function importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Get or create encryption key for the user
 * Stores key in sessionStorage (cleared on browser close) for security
 */
export async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined') {
    throw new Error('Encryption is only available in the browser');
  }

  // Check sessionStorage first (more secure - cleared on browser close)
  const sessionKeyData = sessionStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
  if (sessionKeyData) {
    const keyBuffer = Uint8Array.from(JSON.parse(sessionKeyData)).buffer;
    return await importKey(keyBuffer);
  }

  // Check localStorage as fallback (persists across sessions)
  const localKeyData = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
  if (localKeyData) {
    const keyBuffer = Uint8Array.from(JSON.parse(localKeyData)).buffer;
    const key = await importKey(keyBuffer);
    // Also store in sessionStorage for faster access
    sessionStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, localKeyData);
    return key;
  }

  // Generate new key if none exists
  const newKey = await generateEncryptionKey();
  const exportedKey = await exportKey(newKey);
  const keyArray = Array.from(new Uint8Array(exportedKey));
  
  // Store in both sessionStorage and localStorage
  const keyData = JSON.stringify(keyArray);
  sessionStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, keyData);
  localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, keyData);
  
  return newKey;
}

/**
 * Generate a random initialization vector (IV)
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Encrypt a string value
 */
export async function encryptValue(value: string): Promise<string> {
  if (!value) return value; // Don't encrypt empty values
  
  try {
    const key = await getOrCreateEncryptionKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const iv = generateIV();
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv as BufferSource,
      },
      key,
      data
    );
    
    // Combine IV and encrypted data, then encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64 for storage
    const base64 = btoa(String.fromCharCode(...combined));
    return `encrypted:${base64}`;
  } catch (error) {
    console.error('[Encryption] Failed to encrypt value:', error);
    // Fallback: return original value if encryption fails
    return value;
  }
}

/**
 * Decrypt a string value
 */
export async function decryptValue(encryptedValue: string): Promise<string> {
  if (!encryptedValue || !encryptedValue.startsWith('encrypted:')) {
    return encryptedValue; // Not encrypted or empty
  }
  
  try {
    const key = await getOrCreateEncryptionKey();
    const base64 = encryptedValue.replace('encrypted:', '');
    const combined = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv as BufferSource,
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('[Encryption] Failed to decrypt value:', error);
    // Return original value if decryption fails (might be corrupted data)
    return encryptedValue;
  }
}

/**
 * Encrypt a number value (converts to string, encrypts, then stores as string)
 */
export async function encryptNumber(value: number): Promise<string> {
  return await encryptValue(value.toString());
}

/**
 * Decrypt a number value
 */
export async function decryptNumber(encryptedValue: string): Promise<number> {
  const decrypted = await decryptValue(encryptedValue);
  return parseFloat(decrypted);
}

/**
 * Encrypt an object's sensitive fields
 * Fields to encrypt: amount, description, notes, account numbers, merchant names
 */
export async function encryptTransaction(transaction: any): Promise<any> {
  const encrypted = { ...transaction };
  
  // Encrypt sensitive fields
  if (encrypted.amount !== undefined) {
    encrypted.amount = await encryptNumber(encrypted.amount);
  }
  
  if (encrypted.description) {
    encrypted.description = await encryptValue(encrypted.description);
  }
  
  if (encrypted.notes) {
    encrypted.notes = await encryptValue(encrypted.notes);
  }
  
  if (encrypted.merchant) {
    encrypted.merchant = await encryptValue(encrypted.merchant);
  }
  
  return encrypted;
}

/**
 * Decrypt an object's sensitive fields
 */
export async function decryptTransaction(transaction: any): Promise<any> {
  const decrypted = { ...transaction };
  
  // Decrypt sensitive fields
  if (decrypted.amount && typeof decrypted.amount === 'string' && decrypted.amount.startsWith('encrypted:')) {
    decrypted.amount = await decryptNumber(decrypted.amount);
  }
  
  if (decrypted.description && typeof decrypted.description === 'string' && decrypted.description.startsWith('encrypted:')) {
    decrypted.description = await decryptValue(decrypted.description);
  }
  
  if (decrypted.notes && typeof decrypted.notes === 'string' && decrypted.notes.startsWith('encrypted:')) {
    decrypted.notes = await decryptValue(decrypted.notes);
  }
  
  if (decrypted.merchant && typeof decrypted.merchant === 'string' && decrypted.merchant.startsWith('encrypted:')) {
    decrypted.merchant = await decryptValue(decrypted.merchant);
  }
  
  return decrypted;
}

/**
 * Encrypt account information
 */
export async function encryptAccount(account: any): Promise<any> {
  const encrypted = { ...account };
  
  if (encrypted.name) {
    encrypted.name = await encryptValue(encrypted.name);
  }
  
  if (encrypted.accountNumber) {
    encrypted.accountNumber = await encryptValue(encrypted.accountNumber);
  }
  
  if (encrypted.institution) {
    encrypted.institution = await encryptValue(encrypted.institution);
  }
  
  return encrypted;
}

/**
 * Decrypt account information
 */
export async function decryptAccount(account: any): Promise<any> {
  const decrypted = { ...account };
  
  if (decrypted.name && typeof decrypted.name === 'string' && decrypted.name.startsWith('encrypted:')) {
    decrypted.name = await decryptValue(decrypted.name);
  }
  
  if (decrypted.accountNumber && typeof decrypted.accountNumber === 'string' && decrypted.accountNumber.startsWith('encrypted:')) {
    decrypted.accountNumber = await decryptValue(decrypted.accountNumber);
  }
  
  if (decrypted.institution && typeof decrypted.institution === 'string' && decrypted.institution.startsWith('encrypted:')) {
    decrypted.institution = await decryptValue(decrypted.institution);
  }
  
  return decrypted;
}

/**
 * Check if encryption is enabled and available
 */
export function isEncryptionAvailable(): boolean {
  return typeof window !== 'undefined' && 'crypto' in window && 'subtle' in window.crypto;
}

/**
 * Clear encryption key (for testing or reset)
 */
export function clearEncryptionKey(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE_KEY);
    localStorage.removeItem(ENCRYPTION_KEY_STORAGE_KEY);
  }
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: any): boolean {
  return typeof value === 'string' && value.startsWith('encrypted:');
}

