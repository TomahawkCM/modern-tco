/**
 * AES-256-GCM encryption / decryption with key rotation support.
 *
 * Uses ENCRYPTION_KEY (current) for all new encryptions.
 * Uses ENCRYPTION_KEY_PREVIOUS (comma-separated) as fallback for decryption,
 * enabling zero-downtime key rotation.
 *
 * Key rotation workflow:
 * 1. Generate a new 64-char hex key
 * 2. Set ENCRYPTION_KEY_PREVIOUS to the old key(s)
 * 3. Set ENCRYPTION_KEY to the new key
 * 4. Deploy — new data encrypted with new key, old data still decryptable
 * 5. (Optional) Re-encrypt old data with `reEncrypt()` then remove old keys
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTED_PREFIX = "enc:";
const ENCODED_PREFIX = "b64:";

function parseHexKey(hex: string): Buffer {
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== 32) {
    throw new Error(
      `Encryption key must be a 64-character hex string (32 bytes), got ${hex.length} chars`
    );
  }
  return buf;
}

/**
 * Get the current (primary) encryption key.
 * Returns null only in non-production when ENCRYPTION_KEY is unset.
 */
function getCurrentKey(): Buffer | null {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) return null;
  return parseHexKey(hex);
}

/**
 * Get all decryption keys: current key first, then previous keys.
 * Decryption tries each key in order until one succeeds.
 */
function getAllKeys(): Buffer[] {
  const keys: Buffer[] = [];

  const current = getCurrentKey();
  if (current) keys.push(current);

  const previous = process.env.ENCRYPTION_KEY_PREVIOUS;
  if (previous) {
    for (const hex of previous.split(",")) {
      const trimmed = hex.trim();
      if (trimmed) keys.push(parseHexKey(trimmed));
    }
  }

  return keys;
}

/**
 * Encrypt a plaintext string with the current key.
 * Returns "enc:<iv>:<authTag>:<ciphertext>" (all hex).
 * In dev without ENCRYPTION_KEY, returns "b64:<base64>" (not secure).
 */
export function encrypt(plaintext: string): string {
  const key = getCurrentKey();
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ENCRYPTION_KEY is required in production");
    }
    return ENCODED_PREFIX + Buffer.from(plaintext, "utf-8").toString("base64");
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return (
    ENCRYPTED_PREFIX +
    iv.toString("hex") +
    ":" +
    authTag.toString("hex") +
    ":" +
    encrypted.toString("hex")
  );
}

/**
 * Decrypt a string previously encrypted with `encrypt()`.
 * Tries the current key first, then all previous keys for rotation support.
 */
export function decrypt(ciphertext: string): string {
  if (ciphertext.startsWith(ENCODED_PREFIX)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ENCRYPTION_KEY is required in production");
    }
    return Buffer.from(ciphertext.slice(ENCODED_PREFIX.length), "base64").toString("utf-8");
  }

  if (!ciphertext.startsWith(ENCRYPTED_PREFIX)) {
    throw new Error("Invalid encrypted value: missing prefix");
  }

  const payload = ciphertext.slice(ENCRYPTED_PREFIX.length);
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted value format");
  }

  const [ivHex, authTagHex, dataHex] = parts as [string, string, string];
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");

  const keys = getAllKeys();
  if (keys.length === 0) {
    throw new Error("ENCRYPTION_KEY is required to decrypt AES-encrypted values");
  }

  // Try each key in order (current first, then previous)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    try {
      const decipher = createDecipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
      });
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString("utf-8");
    } catch {
      // Wrong key — try next one
      if (i === keys.length - 1) {
        throw new Error(
          "Decryption failed: none of the configured encryption keys could decrypt this value"
        );
      }
    }
  }

  // Unreachable, but TypeScript needs it
  throw new Error("Decryption failed");
}

/**
 * Re-encrypt a value with the current key.
 * Use during key rotation to migrate data from old keys to the new key.
 * Returns the original ciphertext if it's already encrypted with the current key.
 */
export function reEncrypt(ciphertext: string): string {
  const plaintext = decrypt(ciphertext);
  return encrypt(plaintext);
}

/**
 * Check whether the encryption subsystem is properly configured.
 * Returns true if ENCRYPTION_KEY is set and valid, or if in development mode.
 */
export function isEncryptionConfigured(): boolean {
  try {
    const key = getCurrentKey();
    if (key) return true;
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}
