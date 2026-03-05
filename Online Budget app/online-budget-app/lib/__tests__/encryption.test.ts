import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { randomBytes } from "crypto";
import { encrypt, decrypt, reEncrypt, isEncryptionConfigured } from "@/lib/encryption";

// Generate deterministic test keys
const KEY_A = randomBytes(32).toString("hex"); // 64 hex chars
const KEY_B = randomBytes(32).toString("hex");
const KEY_C = randomBytes(32).toString("hex");

function setEnv(vars: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("lib/encryption", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restore env after each test
    process.env = { ...originalEnv };
  });

  describe("encrypt / decrypt roundtrip", () => {
    beforeEach(() => {
      setEnv({ ENCRYPTION_KEY: KEY_A, ENCRYPTION_KEY_PREVIOUS: undefined });
    });

    it("encrypts and decrypts a simple string", () => {
      const plaintext = "access-sandbox-12345";
      const encrypted = encrypt(plaintext);
      expect(encrypted).toMatch(/^enc:/);
      expect(encrypted).not.toContain(plaintext);
      expect(decrypt(encrypted)).toBe(plaintext);
    });

    it("encrypts and decrypts unicode text", () => {
      const plaintext = "Hello 世界 🌍 café résumé";
      const encrypted = encrypt(plaintext);
      expect(decrypt(encrypted)).toBe(plaintext);
    });

    it("encrypts and decrypts an empty string", () => {
      const encrypted = encrypt("");
      expect(decrypt(encrypted)).toBe("");
    });

    it("encrypts and decrypts a long string", () => {
      const plaintext = "x".repeat(10000);
      const encrypted = encrypt(plaintext);
      expect(decrypt(encrypted)).toBe(plaintext);
    });

    it("produces different ciphertexts for the same plaintext (random IV)", () => {
      const plaintext = "same-text";
      const a = encrypt(plaintext);
      const b = encrypt(plaintext);
      expect(a).not.toBe(b);
      expect(decrypt(a)).toBe(plaintext);
      expect(decrypt(b)).toBe(plaintext);
    });
  });

  describe("ciphertext format", () => {
    beforeEach(() => {
      setEnv({ ENCRYPTION_KEY: KEY_A, ENCRYPTION_KEY_PREVIOUS: undefined });
    });

    it("uses enc: prefix with 3 hex parts", () => {
      const encrypted = encrypt("test");
      expect(encrypted.startsWith("enc:")).toBe(true);
      const parts = encrypted.slice(4).split(":");
      expect(parts).toHaveLength(3);
      // IV = 12 bytes = 24 hex chars
      expect(parts[0]).toHaveLength(24);
      // Auth tag = 16 bytes = 32 hex chars
      expect(parts[1]).toHaveLength(32);
      // Data is variable length
      expect(parts[2]!.length).toBeGreaterThan(0);
    });
  });

  describe("dev fallback (no ENCRYPTION_KEY)", () => {
    beforeEach(() => {
      setEnv({
        ENCRYPTION_KEY: undefined,
        ENCRYPTION_KEY_PREVIOUS: undefined,
        NODE_ENV: "development",
      });
    });

    it("uses b64: prefix in dev", () => {
      const encrypted = encrypt("dev-test");
      expect(encrypted.startsWith("b64:")).toBe(true);
      expect(decrypt(encrypted)).toBe("dev-test");
    });
  });

  describe("production enforcement", () => {
    beforeEach(() => {
      setEnv({
        ENCRYPTION_KEY: undefined,
        ENCRYPTION_KEY_PREVIOUS: undefined,
        NODE_ENV: "production",
      });
    });

    it("throws on encrypt without key in production", () => {
      expect(() => encrypt("secret")).toThrow("ENCRYPTION_KEY is required in production");
    });

    it("throws on decrypt of b64: value in production", () => {
      expect(() => decrypt("b64:dGVzdA==")).toThrow("ENCRYPTION_KEY is required in production");
    });
  });

  describe("key rotation", () => {
    it("decrypts data encrypted with the previous key", () => {
      // Encrypt with KEY_A
      setEnv({ ENCRYPTION_KEY: KEY_A, ENCRYPTION_KEY_PREVIOUS: undefined });
      const encrypted = encrypt("rotate-me");

      // Rotate: KEY_B is current, KEY_A is previous
      setEnv({ ENCRYPTION_KEY: KEY_B, ENCRYPTION_KEY_PREVIOUS: KEY_A });
      expect(decrypt(encrypted)).toBe("rotate-me");
    });

    it("encrypts new data with the current key (not previous)", () => {
      setEnv({ ENCRYPTION_KEY: KEY_B, ENCRYPTION_KEY_PREVIOUS: KEY_A });
      const encrypted = encrypt("new-data");

      // Can decrypt with just KEY_B (no previous needed)
      setEnv({ ENCRYPTION_KEY: KEY_B, ENCRYPTION_KEY_PREVIOUS: undefined });
      expect(decrypt(encrypted)).toBe("new-data");
    });

    it("supports multiple previous keys (comma-separated)", () => {
      // Encrypt with KEY_A (oldest)
      setEnv({ ENCRYPTION_KEY: KEY_A, ENCRYPTION_KEY_PREVIOUS: undefined });
      const encryptedA = encrypt("data-a");

      // Encrypt with KEY_B (middle)
      setEnv({ ENCRYPTION_KEY: KEY_B, ENCRYPTION_KEY_PREVIOUS: undefined });
      const encryptedB = encrypt("data-b");

      // KEY_C is current, KEY_B and KEY_A are previous
      setEnv({ ENCRYPTION_KEY: KEY_C, ENCRYPTION_KEY_PREVIOUS: `${KEY_B},${KEY_A}` });
      expect(decrypt(encryptedA)).toBe("data-a");
      expect(decrypt(encryptedB)).toBe("data-b");
    });

    it("fails when no key matches", () => {
      setEnv({ ENCRYPTION_KEY: KEY_A, ENCRYPTION_KEY_PREVIOUS: undefined });
      const encrypted = encrypt("secret");

      // Use completely different keys
      setEnv({ ENCRYPTION_KEY: KEY_B, ENCRYPTION_KEY_PREVIOUS: KEY_C });
      expect(() => decrypt(encrypted)).toThrow("none of the configured encryption keys");
    });
  });

  describe("reEncrypt", () => {
    it("re-encrypts from old key to current key", () => {
      // Encrypt with KEY_A
      setEnv({ ENCRYPTION_KEY: KEY_A, ENCRYPTION_KEY_PREVIOUS: undefined });
      const original = encrypt("migrate-me");

      // Rotate to KEY_B
      setEnv({ ENCRYPTION_KEY: KEY_B, ENCRYPTION_KEY_PREVIOUS: KEY_A });
      const reEncrypted = reEncrypt(original);

      // Verify re-encrypted data works with only the new key
      setEnv({ ENCRYPTION_KEY: KEY_B, ENCRYPTION_KEY_PREVIOUS: undefined });
      expect(decrypt(reEncrypted)).toBe("migrate-me");

      // And the old ciphertext no longer decrypts without the old key
      expect(() => decrypt(original)).toThrow();
    });
  });

  describe("isEncryptionConfigured", () => {
    it("returns true when key is set", () => {
      setEnv({ ENCRYPTION_KEY: KEY_A });
      expect(isEncryptionConfigured()).toBe(true);
    });

    it("returns true in dev without key", () => {
      setEnv({ ENCRYPTION_KEY: undefined, NODE_ENV: "development" });
      expect(isEncryptionConfigured()).toBe(true);
    });

    it("returns false in production without key", () => {
      setEnv({ ENCRYPTION_KEY: undefined, NODE_ENV: "production" });
      expect(isEncryptionConfigured()).toBe(false);
    });

    it("returns false with invalid key", () => {
      setEnv({ ENCRYPTION_KEY: "not-a-valid-hex-key" });
      expect(isEncryptionConfigured()).toBe(false);
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      setEnv({ ENCRYPTION_KEY: KEY_A, ENCRYPTION_KEY_PREVIOUS: undefined });
    });

    it("rejects invalid prefix", () => {
      expect(() => decrypt("garbage-data")).toThrow("missing prefix");
    });

    it("rejects malformed encrypted value", () => {
      expect(() => decrypt("enc:onlytwoparts")).toThrow("Invalid encrypted value format");
    });

    it("rejects tampered ciphertext (auth tag verification)", () => {
      const encrypted = encrypt("tamper-test");
      // Flip a character in the data portion
      const parts = encrypted.split(":");
      const data = parts[3]!;
      const tampered = data[0] === "a" ? "b" + data.slice(1) : "a" + data.slice(1);
      parts[3] = tampered;
      expect(() => decrypt(parts.join(":"))).toThrow();
    });

    it("rejects invalid key length", () => {
      setEnv({ ENCRYPTION_KEY: "abcd1234" }); // too short
      expect(() => encrypt("test")).toThrow("64-character hex string");
    });
  });
});
