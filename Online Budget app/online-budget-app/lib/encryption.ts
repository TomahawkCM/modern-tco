/**
 * Simple AES-256-GCM encryption / decryption for sensitive tokens.
 *
 * Uses the ENCRYPTION_KEY env var (hex-encoded 32-byte key).
 * If ENCRYPTION_KEY is not set, falls back to a reversible base64 encoding
 * with a prefix so we can distinguish encrypted vs. encoded values later.
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTED_PREFIX = "enc:";
const ENCODED_PREFIX = "b64:";

function getEncryptionKey(): Buffer | null {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) return null;
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return buf;
}

/**
 * Encrypt a plaintext string.
 * Returns a prefixed string: "enc:<iv>:<authTag>:<ciphertext>" (all hex)
 * or "b64:<base64>" when no ENCRYPTION_KEY is configured.
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ENCRYPTION_KEY is required in production");
    }
    // Fallback: base64 encode (not secure, but allows development without key)
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
 */
export function decrypt(ciphertext: string): string {
  if (ciphertext.startsWith(ENCODED_PREFIX)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ENCRYPTION_KEY is required in production");
    }
    // Fallback: base64 decode
    return Buffer.from(ciphertext.slice(ENCODED_PREFIX.length), "base64").toString("utf-8");
  }

  if (!ciphertext.startsWith(ENCRYPTED_PREFIX)) {
    throw new Error("Invalid encrypted value: missing prefix");
  }

  const key = getEncryptionKey();
  if (!key) {
    throw new Error("ENCRYPTION_KEY is required to decrypt AES-encrypted values");
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

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString("utf-8");
}
