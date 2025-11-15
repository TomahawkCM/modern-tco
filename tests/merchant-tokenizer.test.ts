/**
 * Unit Tests for Merchant Token Extraction Module
 * Tests BMO-specific parsing, generic extraction, token validation, and edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  extractMerchantToken,
  batchExtractMerchantTokens,
  getUniqueMerchantTokens,
  type BankType,
} from '@/lib/merchant-tokenizer';

describe('Merchant Token Extraction Module', () => {
  // ========================================
  // BMO [OP] Online Purchase Format
  // ========================================
  describe('BMO [OP] Online Purchase Format', () => {
    it('should extract merchant from SKIPTHEDISHES transaction', () => {
      const description = '[OP] ONLINE PURCHASE  1AUG2025SKIPTHEDISHES MB';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('SKIPTHEDISHES');
    });

    it('should extract merchant from OPENAI CHATGPT transaction', () => {
      const description = '[OP] ONLINE PURCHASE  4NOV2025OPENAI CHATGPT';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('OPENAI CHATGPT');
    });

    it('should extract merchant and remove province code', () => {
      const description = '[OP] ONLINE PURCHASE  15JUL2025NETFLIX ON';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('NETFLIX');
    });

    it('should extract merchant and remove trailing numbers', () => {
      const description = '[OP] ONLINE PURCHASE  20DEC2025AMAZON 123';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('AMAZON');
    });

    it('should handle multi-word merchants', () => {
      const description = '[OP] ONLINE PURCHASE  10MAR2025APPLE MUSIC BC';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('APPLE MUSIC');
    });

    it('should return null for generic ONLINE PURCHASE', () => {
      const description = '[OP] ONLINE PURCHASE  1AUG2025ONLINE PURCHASE MB';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBeNull();
    });

    it('should return null for generic PURCHASE', () => {
      const description = '[OP] ONLINE PURCHASE  1AUG2025PURCHASE AB';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBeNull();
    });
  });

  // ========================================
  // BMO [PR] Physical Purchase Format
  // ========================================
  describe('BMO [PR] Physical Purchase Format', () => {
    it('should extract merchant from physical purchase', () => {
      const description = '[PR] PEMBRIDGE INS  #123 AB';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('PEMBRIDGE INS');
    });

    it('should remove location info after multiple spaces', () => {
      const description = '[PR] TIM HORTONS  EDMONTON AB';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('TIM HORTONS');
    });

    it('should handle transaction with # number', () => {
      const description = '[PR] SAFEWAY #260  CALGARY AB';
      const token = extractMerchantToken(description, 'bmo');

      // Should remove the #260 suffix and location
      expect(token).toBe('SAFEWAY');
    });

    it('should remove province code at end', () => {
      const description = '[PR] STARBUCKS BC';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('STARBUCKS');
    });

    it('should remove CAN country code', () => {
      const description = '[PR] WALMART CAN';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('WALMART');
    });
  });

  // ========================================
  // Generic Vendor Extraction
  // ========================================
  describe('Generic Vendor Extraction (Non-BMO)', () => {
    it('should extract merchant from generic description', () => {
      const description = 'PURCHASE AMAZON.COM';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('AMAZON.COM');
    });

    it('should remove PAYMENT prefix', () => {
      const description = 'PAYMENT NETFLIX';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('NETFLIX');
    });

    it('should remove DEBIT prefix', () => {
      const description = 'DEBIT UBER EATS';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('UBER EATS');
    });

    it('should remove POS prefix', () => {
      const description = 'POS STARBUCKS';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('STARBUCKS');
    });

    it('should remove transaction IDs', () => {
      const description = 'AMAZON #123456';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('AMAZON');
    });

    it('should remove dates in DDMonYY format', () => {
      const description = 'NETFLIX 4NOV25';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('NETFLIX');
    });

    it('should remove dates in MM/DD/YYYY format', () => {
      const description = 'SPOTIFY 11/07/2025';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('SPOTIFY');
    });

    it('should remove dates in YYYY-MM-DD format', () => {
      const description = 'APPLE 2025-11-07';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('APPLE');
    });

    it('should remove province codes', () => {
      const description = 'TIM HORTONS AB';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('TIM HORTONS');
    });

    it('should remove CANADA suffix', () => {
      const description = 'WALMART CANADA';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('WALMART');
    });

    it('should remove city names', () => {
      const description = 'SAFEWAY EDMONTON';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('SAFEWAY');
    });

    it('should remove long alphanumeric reference codes', () => {
      const description = 'AMAZON ABC123456789';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('AMAZON');
    });
  });

  // ========================================
  // Generic Token Filtering
  // ========================================
  describe('Generic Token Filtering', () => {
    const genericTokens = [
      'ONLINE PURCHASE',
      'PURCHASE',
      'PAYMENT',
      'TRANSFER',
      'DEBIT',
      'CREDIT',
      'WITHDRAWAL',
      'DEPOSIT',
      'ATM',
      'INTERAC',
      'E-TRANSFER',
      'ETRANSFER',
      'CHEQUE',
      'CHECK',
      'FEE',
      'CHARGE',
      'REFUND',
    ];

    genericTokens.forEach((genericToken) => {
      it(`should return null for generic token: ${genericToken}`, () => {
        const token = extractMerchantToken(genericToken, 'generic');
        expect(token).toBeNull();
      });
    });

    it('should return null for all-numeric tokens', () => {
      const token = extractMerchantToken('123456789', 'generic');
      expect(token).toBeNull();
    });

    it('should return null for mostly numeric tokens', () => {
      const token = extractMerchantToken('12345 ABC', 'generic');
      expect(token).toBeNull();
    });

    it('should accept tokens with some numbers (e.g., "7-ELEVEN")', () => {
      const token = extractMerchantToken('7-ELEVEN', 'generic');
      expect(token).toBe('7-ELEVEN');
    });
  });

  // ========================================
  // Edge Cases & Validation
  // ========================================
  describe('Edge Cases & Validation', () => {
    it('should return null for empty string', () => {
      const token = extractMerchantToken('', 'generic');
      expect(token).toBeNull();
    });

    it('should return null for whitespace-only string', () => {
      const token = extractMerchantToken('   ', 'generic');
      expect(token).toBeNull();
    });

    it('should return null for tokens shorter than 3 characters', () => {
      const token = extractMerchantToken('AB', 'generic');
      expect(token).toBeNull();
    });

    it('should accept 3-character tokens', () => {
      const token = extractMerchantToken('ABC STORE', 'generic');
      expect(token).toBe('ABC STORE');
    });

    it('should normalize case to uppercase', () => {
      const token = extractMerchantToken('netflix', 'generic');
      expect(token).toBe('NETFLIX');
    });

    it('should handle mixed case', () => {
      const token = extractMerchantToken('OpenAI ChatGPT', 'bmo');
      expect(token).toBe('OPENAI CHATGPT');
    });

    it('should trim leading and trailing whitespace', () => {
      const token = extractMerchantToken('  AMAZON  ', 'generic');
      expect(token).toBe('AMAZON');
    });

    it('should collapse multiple spaces into one', () => {
      const description = 'UBER     EATS';
      const token = extractMerchantToken(description, 'generic');
      expect(token).toBe('UBER EATS');
    });
  });

  // ========================================
  // Real-World Examples
  // ========================================
  describe('Real-World Transaction Examples', () => {
    it('should handle typical food delivery service', () => {
      const descriptions = [
        '[OP] ONLINE PURCHASE  1AUG2025SKIPTHEDISHES MB',
        '[OP] ONLINE PURCHASE  15SEP2025UBER EATS ON',
        '[OP] ONLINE PURCHASE  20OCT2025DOORDASH BC',
      ];

      const tokens = descriptions.map((d) => extractMerchantToken(d, 'bmo'));

      expect(tokens).toEqual(['SKIPTHEDISHES', 'UBER EATS', 'DOORDASH']);
    });

    it('should handle subscription services', () => {
      const descriptions = [
        '[OP] ONLINE PURCHASE  4NOV2025NETFLIX',
        '[OP] ONLINE PURCHASE  10DEC2025SPOTIFY',
        '[OP] ONLINE PURCHASE  15JAN2026AMAZON PRIME',
      ];

      const tokens = descriptions.map((d) => extractMerchantToken(d, 'bmo'));

      expect(tokens).toEqual(['NETFLIX', 'SPOTIFY', 'AMAZON PRIME']);
    });

    it('should handle software/SaaS subscriptions', () => {
      const descriptions = [
        '[OP] ONLINE PURCHASE  4NOV2025OPENAI CHATGPT',
        '[OP] ONLINE PURCHASE  10DEC2025GITHUB',
        '[OP] ONLINE PURCHASE  15JAN2026MICROSOFT 365',
      ];

      const tokens = descriptions.map((d) => extractMerchantToken(d, 'bmo'));

      // Note: "365" is removed as a trailing number (same logic that removes store IDs)
      expect(tokens).toEqual(['OPENAI CHATGPT', 'GITHUB', 'MICROSOFT']);
    });

    it('should handle insurance payments', () => {
      const description = '[PR] PEMBRIDGE INS  #123 AB';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('PEMBRIDGE INS');
    });

    it('should handle gas stations', () => {
      const descriptions = [
        '[PR] SHELL  EDMONTON AB',
        '[PR] ESSO  CALGARY AB',
        '[PR] PETRO-CAN  TORONTO ON',
      ];

      const tokens = descriptions.map((d) => extractMerchantToken(d, 'bmo'));

      expect(tokens).toEqual(['SHELL', 'ESSO', 'PETRO-CAN']);
    });

    it('should handle grocery stores', () => {
      const descriptions = [
        '[PR] SAFEWAY  #260 AB',
        '[PR] SOBEYS  ON',
        '[PR] WALMART  CANADA',
      ];

      const tokens = descriptions.map((d) => extractMerchantToken(d, 'bmo'));

      expect(tokens).toEqual(['SAFEWAY', 'SOBEYS', 'WALMART']);
    });
  });

  // ========================================
  // Batch Operations
  // ========================================
  describe('batchExtractMerchantTokens()', () => {
    it('should extract tokens for multiple descriptions', () => {
      const descriptions = [
        '[OP] ONLINE PURCHASE  1AUG2025NETFLIX',
        '[OP] ONLINE PURCHASE  4NOV2025SPOTIFY',
        '[PR] AMAZON  #123',
      ];

      const results = batchExtractMerchantTokens(descriptions, 'bmo');

      expect(results.size).toBe(3);
      expect(results.get(descriptions[0])).toBe('NETFLIX');
      expect(results.get(descriptions[1])).toBe('SPOTIFY');
      expect(results.get(descriptions[2])).toBe('AMAZON');
    });

    it('should handle mix of valid and invalid tokens', () => {
      const descriptions = [
        '[OP] ONLINE PURCHASE  1AUG2025NETFLIX',
        '[OP] ONLINE PURCHASE  1AUG2025PURCHASE', // Generic
        '[PR] AMAZON  #123',
        '', // Empty
      ];

      const results = batchExtractMerchantTokens(descriptions, 'bmo');

      expect(results.size).toBe(4);
      expect(results.get(descriptions[0])).toBe('NETFLIX');
      expect(results.get(descriptions[1])).toBeNull(); // Generic token
      expect(results.get(descriptions[2])).toBe('AMAZON');
      expect(results.get(descriptions[3])).toBeNull(); // Empty
    });

    it('should return empty map for empty array', () => {
      const results = batchExtractMerchantTokens([]);

      expect(results.size).toBe(0);
    });
  });

  // ========================================
  // Unique Token Extraction
  // ========================================
  describe('getUniqueMerchantTokens()', () => {
    it('should return unique tokens only', () => {
      const descriptions = [
        '[OP] ONLINE PURCHASE  1AUG2025NETFLIX',
        '[OP] ONLINE PURCHASE  15SEP2025NETFLIX', // Duplicate
        '[OP] ONLINE PURCHASE  4NOV2025SPOTIFY',
        '[PR] AMAZON  #123',
      ];

      const tokens = getUniqueMerchantTokens(descriptions, 'bmo');

      expect(tokens.size).toBe(3);
      expect(tokens.has('NETFLIX')).toBe(true);
      expect(tokens.has('SPOTIFY')).toBe(true);
      expect(tokens.has('AMAZON')).toBe(true);
    });

    it('should filter out null/invalid tokens', () => {
      const descriptions = [
        '[OP] ONLINE PURCHASE  1AUG2025NETFLIX',
        '[OP] ONLINE PURCHASE  1AUG2025PURCHASE', // Generic
        '', // Empty
        '[PR] AMAZON  #123',
      ];

      const tokens = getUniqueMerchantTokens(descriptions, 'bmo');

      expect(tokens.size).toBe(2);
      expect(tokens.has('NETFLIX')).toBe(true);
      expect(tokens.has('AMAZON')).toBe(true);
      expect(tokens.has('PURCHASE')).toBe(false);
    });

    it('should return empty set for all invalid tokens', () => {
      const descriptions = [
        'PURCHASE',
        'PAYMENT',
        '',
        '   ',
        '123',
      ];

      const tokens = getUniqueMerchantTokens(descriptions, 'generic');

      expect(tokens.size).toBe(0);
    });

    it('should return empty set for empty array', () => {
      const tokens = getUniqueMerchantTokens([]);

      expect(tokens.size).toBe(0);
    });
  });

  // ========================================
  // Bank Type Parameter
  // ========================================
  describe('Bank Type Parameter', () => {
    it('should use BMO-specific parsing when bankType="bmo"', () => {
      const description = '[OP] ONLINE PURCHASE  1AUG2025NETFLIX ON';
      const token = extractMerchantToken(description, 'bmo');

      expect(token).toBe('NETFLIX');
    });

    it('should use generic parsing when bankType="generic"', () => {
      const description = 'PURCHASE NETFLIX';
      const token = extractMerchantToken(description, 'generic');

      expect(token).toBe('NETFLIX');
    });

    it('should default to generic when bankType not specified', () => {
      const description = 'PURCHASE AMAZON';
      const token = extractMerchantToken(description);

      expect(token).toBe('AMAZON');
    });
  });

  // ========================================
  // Privacy & Security
  // ========================================
  describe('Privacy & Security Validation', () => {
    it('should not expose raw transaction data in token', () => {
      const description = '[OP] ONLINE PURCHASE  1AUG2025NETFLIX ON #987654321';
      const token = extractMerchantToken(description, 'bmo');

      // Token should not contain transaction IDs or sensitive data
      expect(token).toBe('NETFLIX');
      expect(token).not.toContain('987654321');
      expect(token).not.toContain('#');
    });

    it('should normalize to prevent data leakage', () => {
      const description = '[OP] ONLINE PURCHASE  1AUG2025OPENAI john.doe@example.com';
      const token = extractMerchantToken(description, 'bmo');

      // Should extract just the merchant, not email (though basic normalization won't catch all PII)
      expect(token).toBeTruthy();
      expect(token).not.toContain('@');
    });
  });
});
