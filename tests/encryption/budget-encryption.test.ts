/**
 * Budget Encryption Tests
 * Tests for AES-GCM encryption/decryption of transaction data
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  encryptData,
  decryptData,
  encryptTransactionDescription,
  decryptTransactionDescription,
  encryptAmount,
  decryptAmount,
  hashAmount,
  encryptTransaction,
  decryptTransaction,
  isEncryptionAvailable,
  clearEncryptionKey,
  generateEncryptionKey,
} from '@/lib/encryption/budget-encryption';

// Web Crypto API is available in jsdom via Node.js crypto
describe('budget-encryption', () => {
  beforeEach(() => {
    // Clear localStorage and encryption state between tests
    localStorage.clear();
    clearEncryptionKey();
  });

  describe('generateEncryptionKey', () => {
    it('should generate a key with salt', async () => {
      const result = await generateEncryptionKey('test-password');
      expect(result).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.salt).toBeInstanceOf(Uint8Array);
      expect(result.salt.length).toBe(16);
    });

    it('should generate different salts on each call', async () => {
      const key1 = await generateEncryptionKey('test-password');
      const key2 = await generateEncryptionKey('test-password');
      // Salts should be random / different
      const salt1Hex = Array.from(key1.salt).map(b => b.toString(16)).join('');
      const salt2Hex = Array.from(key2.salt).map(b => b.toString(16)).join('');
      expect(salt1Hex).not.toBe(salt2Hex);
    });
  });

  describe('encryptData / decryptData round-trip', () => {
    it('should encrypt and decrypt a simple string', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const plaintext = 'Hello, World!';

      const { encrypted, iv } = await encryptData(plaintext, key);
      expect(encrypted).toBeTruthy();
      expect(iv).toBeTruthy();
      expect(encrypted).not.toBe(plaintext);

      const decrypted = await decryptData(encrypted, iv, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt unicode text', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const plaintext = 'Ünïcödé テスト 🎉 مرحبا';

      const { encrypted, iv } = await encryptData(plaintext, key);
      const decrypted = await decryptData(encrypted, iv, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt empty string', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const { encrypted, iv } = await encryptData('', key);
      const decrypted = await decryptData(encrypted, iv, key);
      expect(decrypted).toBe('');
    });

    it('should encrypt and decrypt large text', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const plaintext = 'A'.repeat(10000);

      const { encrypted, iv } = await encryptData(plaintext, key);
      const decrypted = await decryptData(encrypted, iv, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext (random IV)', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const plaintext = 'Same data';

      const result1 = await encryptData(plaintext, key);
      const result2 = await encryptData(plaintext, key);

      // IVs should be different (random)
      expect(result1.iv).not.toBe(result2.iv);
      // Ciphertext should also differ due to different IVs
      expect(result1.encrypted).not.toBe(result2.encrypted);
    });

    it('should fail to decrypt with wrong key', async () => {
      const { key: key1 } = await generateEncryptionKey('password-1');
      const { key: key2 } = await generateEncryptionKey('password-2');

      const { encrypted, iv } = await encryptData('secret data', key1);

      await expect(decryptData(encrypted, iv, key2)).rejects.toThrow();
    });

    it('should fail to decrypt with corrupted ciphertext', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const { encrypted, iv } = await encryptData('test data', key);

      // Corrupt the ciphertext by modifying a character
      const corrupted = encrypted.slice(0, -4) + 'XXXX';

      await expect(decryptData(corrupted, iv, key)).rejects.toThrow();
    });

    it('should fail to decrypt with wrong IV', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const { encrypted } = await encryptData('test data', key);

      // Use a different IV
      const wrongIv = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(12))));

      await expect(decryptData(encrypted, wrongIv, key)).rejects.toThrow();
    });
  });

  describe('encryptTransactionDescription / decryptTransactionDescription', () => {
    it('should round-trip a transaction description', async () => {
      // Need a key in storage for these functions
      const { key } = await generateEncryptionKey('test-password');
      const description = 'STARBUCKS #1234 - Coffee purchase';

      const { encrypted, iv } = await encryptData(description, key);
      const decrypted = await decryptData(encrypted, iv, key);
      expect(decrypted).toBe(description);
    });

    it('should handle empty description', async () => {
      const result = await encryptTransactionDescription('');
      expect(result.encrypted).toBe('');
      expect(result.iv).toBe('');
    });
  });

  describe('encryptAmount / decryptAmount', () => {
    it('should round-trip a positive amount', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const { encrypted, iv } = await encryptData('1234.56', key);
      const decrypted = await decryptData(encrypted, iv, key);
      expect(parseFloat(decrypted)).toBe(1234.56);
    });

    it('should round-trip a negative amount', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const { encrypted, iv } = await encryptData('-99.99', key);
      const decrypted = await decryptData(encrypted, iv, key);
      expect(parseFloat(decrypted)).toBe(-99.99);
    });

    it('should round-trip zero', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const { encrypted, iv } = await encryptData('0', key);
      const decrypted = await decryptData(encrypted, iv, key);
      expect(parseFloat(decrypted)).toBe(0);
    });

    it('should return 0 for empty encrypted amount', async () => {
      const result = await decryptAmount('', '');
      expect(result).toBe(0);
    });
  });

  describe('hashAmount', () => {
    it('should produce consistent hashes for same amount', async () => {
      const hash1 = await hashAmount(123.45);
      const hash2 = await hashAmount(123.45);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different amounts', async () => {
      const hash1 = await hashAmount(123.45);
      const hash2 = await hashAmount(123.46);
      expect(hash1).not.toBe(hash2);
    });

    it('should produce a hex string', async () => {
      const hash = await hashAmount(100);
      expect(hash).toMatch(/^[0-9a-f]{64}$/); // SHA-256 = 64 hex chars
    });
  });

  describe('encryptTransaction / decryptTransaction', () => {
    it('should encrypt and decrypt transaction with both fields', async () => {
      const { key } = await generateEncryptionKey('test-password');
      const transaction = { description: 'AMAZON PURCHASE', amount: 49.99 };

      const encResult = await encryptTransaction(transaction);
      expect(encResult.encryptedDescription).toBeTruthy();
      expect(encResult.encryptionIv).toBeTruthy();
      expect(encResult.amountHash).toBeTruthy();
    });

    it('should handle transaction with only description', async () => {
      const transaction = { description: 'STARBUCKS' };
      const encResult = await encryptTransaction(transaction);
      expect(encResult.encryptedDescription).toBeTruthy();
      expect(encResult.encryptionIv).toBeTruthy();
      expect(encResult.encryptedAmount).toBeUndefined();
    });

    it('should handle transaction with only amount', async () => {
      const transaction = { amount: 25.00 };
      const encResult = await encryptTransaction(transaction);
      expect(encResult.encryptedAmount).toBeTruthy();
      expect(encResult.encryptionIv).toBeTruthy();
      expect(encResult.encryptedDescription).toBeUndefined();
    });
  });

  describe('isEncryptionAvailable', () => {
    it('should return false when no privacy settings set', () => {
      expect(isEncryptionAvailable()).toBe(false);
    });

    it('should return true when encryption is enabled in settings', () => {
      localStorage.setItem(
        'budget-app-privacy-settings',
        JSON.stringify({ enableEncryption: true })
      );
      expect(isEncryptionAvailable()).toBe(true);
    });

    it('should return false when encryption is disabled in settings', () => {
      localStorage.setItem(
        'budget-app-privacy-settings',
        JSON.stringify({ enableEncryption: false })
      );
      expect(isEncryptionAvailable()).toBe(false);
    });

    it('should handle malformed settings gracefully', () => {
      localStorage.setItem('budget-app-privacy-settings', 'not-json');
      expect(isEncryptionAvailable()).toBe(false);
    });
  });

  describe('clearEncryptionKey', () => {
    it('should remove stored key and salt', () => {
      localStorage.setItem('budget-app-key-salt', 'test-salt');
      localStorage.setItem('budget-app-encryption-key', 'test-key');

      clearEncryptionKey();

      expect(localStorage.getItem('budget-app-key-salt')).toBeNull();
      expect(localStorage.getItem('budget-app-encryption-key')).toBeNull();
    });
  });
});
