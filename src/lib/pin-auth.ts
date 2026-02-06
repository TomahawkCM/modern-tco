/**
 * PIN Authentication Module
 * Secure PIN hashing and verification using Web Crypto API
 *
 * Security Features:
 * - PBKDF2 with SHA-256 for key derivation
 * - 100,000 iterations for brute-force resistance
 * - Random salt per profile (256 bits)
 * - Timing-safe comparison
 */

// Number of PBKDF2 iterations (OWASP recommends 100,000+ for PBKDF2-SHA256)
const PBKDF2_ITERATIONS = 100000;

// Salt length in bytes (32 bytes = 256 bits)
const SALT_LENGTH = 32;

// Derived key length in bytes (32 bytes = 256 bits)
const KEY_LENGTH = 32;

/**
 * Check if Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.crypto?.subtle !== undefined
  );
}

/**
 * Generate a cryptographically secure random salt
 * @returns Base64-encoded salt string
 */
export async function generatePINSalt(): Promise<string> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }

  const saltBuffer = new Uint8Array(SALT_LENGTH);
  window.crypto.getRandomValues(saltBuffer);

  return bufferToBase64(saltBuffer);
}

/**
 * Hash a PIN using PBKDF2-SHA256
 * @param pin The PIN to hash (4-6 digits)
 * @param salt Base64-encoded salt
 * @returns Base64-encoded hash
 */
export async function hashPIN(pin: string, salt: string): Promise<string> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API is not available');
  }

  // Convert PIN to bytes
  const encoder = new TextEncoder();
  const pinBuffer = encoder.encode(pin);

  // Convert salt from base64 to bytes
  const saltBuffer = base64ToBuffer(salt);

  // Import PIN as key material
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    pinBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive the hash using PBKDF2
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8 // bits
  );

  return bufferToBase64(new Uint8Array(derivedBits));
}

/**
 * Verify a PIN against a stored hash
 * @param pin The PIN to verify
 * @param salt Base64-encoded salt
 * @param expectedHash Base64-encoded expected hash
 * @returns True if PIN matches
 */
export async function verifyPIN(
  pin: string,
  salt: string,
  expectedHash: string
): Promise<boolean> {
  try {
    const computedHash = await hashPIN(pin, salt);

    // Timing-safe comparison to prevent timing attacks
    return timingSafeEqual(computedHash, expectedHash);
  } catch {
    return false;
  }
}

/**
 * Validate PIN format and security requirements
 * @param pin The PIN to validate
 * @returns Validation result with error message if invalid
 */
export function isPINValid(pin: string): { valid: boolean; error?: string } {
  // Must be 4-6 digits
  if (!/^\d{4,6}$/.test(pin)) {
    return {
      valid: false,
      error: 'PIN must be 4-6 digits',
    };
  }

  // Check for sequential digits (ascending)
  const sequentialAsc = ['1234', '2345', '3456', '4567', '5678', '6789', '0123'];
  for (const seq of sequentialAsc) {
    if (pin.includes(seq)) {
      return {
        valid: false,
        error: 'PIN cannot contain sequential digits like 1234',
      };
    }
  }

  // Check for sequential digits (descending)
  const sequentialDesc = ['4321', '5432', '6543', '7654', '8765', '9876', '3210'];
  for (const seq of sequentialDesc) {
    if (pin.includes(seq)) {
      return {
        valid: false,
        error: 'PIN cannot contain sequential digits like 4321',
      };
    }
  }

  // Check for repeated digits (e.g., 1111, 2222)
  if (/^(\d)\1{3,}$/.test(pin)) {
    return {
      valid: false,
      error: 'PIN cannot be all the same digit',
    };
  }

  // Check for common weak PINs
  const weakPINs = [
    '0000',
    '1111',
    '2222',
    '3333',
    '4444',
    '5555',
    '6666',
    '7777',
    '8888',
    '9999',
    '1234',
    '4321',
    '1212',
    '2121',
    '1010',
    '0101',
    '0000',
    '1122',
    '2211',
    '1221',
    '2112',
    '123456',
    '654321',
  ];

  if (weakPINs.includes(pin)) {
    return {
      valid: false,
      error: 'This PIN is too common. Please choose a stronger PIN.',
    };
  }

  return { valid: true };
}

/**
 * Generate a PIN setup result with salt and hash
 * @param pin The PIN to set up
 * @returns Object with salt and hash, or error
 */
export async function setupPIN(
  pin: string
): Promise<
  { success: true; salt: string; hash: string } | { success: false; error: string }
> {
  const validation = isPINValid(pin);
  if (!validation.valid) {
    return { success: false, error: validation.error || 'Invalid PIN' };
  }

  try {
    const salt = await generatePINSalt();
    const hash = await hashPIN(pin, salt);

    return { success: true, salt, hash };
  } catch (error) {
    console.error('Error setting up PIN:', error);
    return { success: false, error: 'Failed to set up PIN. Please try again.' };
  }
}

// ========================
// Helper Functions
// ========================

/**
 * Convert ArrayBuffer/Uint8Array to base64 string
 */
function bufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/**
 * Timing-safe string comparison
 * Prevents timing attacks by ensuring comparison takes constant time
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to maintain constant time
    // Use a as reference to compare against
    let result = a.length ^ b.length;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return result === 0;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// ========================
// Brute Force Protection
// ========================

// Maximum failed attempts before lockout
export const MAX_FAILED_ATTEMPTS = 3;

// Lockout duration in milliseconds (30 seconds)
export const LOCKOUT_DURATION_MS = 30000;

// Auto-lock timeout in milliseconds (15 minutes)
export const AUTO_LOCK_TIMEOUT_MS = 15 * 60 * 1000;

/**
 * Check if user is currently locked out
 * @param lockoutUntil Timestamp when lockout ends (null if not locked)
 * @returns True if currently locked out
 */
export function isLockedOut(lockoutUntil: Date | null): boolean {
  if (!lockoutUntil) return false;
  return new Date() < lockoutUntil;
}

/**
 * Get remaining lockout time in seconds
 * @param lockoutUntil Timestamp when lockout ends
 * @returns Remaining seconds (0 if not locked)
 */
export function getRemainingLockoutSeconds(lockoutUntil: Date | null): number {
  if (!lockoutUntil) return 0;

  const remaining = lockoutUntil.getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / 1000));
}

/**
 * Calculate lockout end time based on failed attempts
 * @param failedAttempts Number of consecutive failed attempts
 * @returns Lockout end timestamp, or null if no lockout needed
 */
export function calculateLockoutUntil(failedAttempts: number): Date | null {
  if (failedAttempts < MAX_FAILED_ATTEMPTS) {
    return null;
  }

  // Progressive lockout: base duration * (attempts - threshold + 1)
  const multiplier = failedAttempts - MAX_FAILED_ATTEMPTS + 1;
  const lockoutMs = LOCKOUT_DURATION_MS * multiplier;

  return new Date(Date.now() + lockoutMs);
}

/**
 * Check if auto-lock should trigger based on last activity
 * @param lastActivity Timestamp of last user activity
 * @returns True if session should be locked
 */
export function shouldAutoLock(lastActivity: Date): boolean {
  const elapsed = Date.now() - lastActivity.getTime();
  return elapsed >= AUTO_LOCK_TIMEOUT_MS;
}
