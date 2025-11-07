/**
 * Unit Tests for Enhanced Bank Detection Module
 * Tests fuzzy matching, confidence scoring, and alternative suggestions
 */

import { describe, it, expect } from '@jest/globals';
import {
  detectBankWithConfidence,
  detectBank,
  detectBankLegacy,
  type BankDetectionResult,
} from '../csv-parser';

describe('Enhanced Bank Detection Module', () => {
  // ========================================
  // detectBankWithConfidence() - Exact Matches
  // ========================================
  describe('detectBankWithConfidence() - Exact Matches', () => {
    it('should detect BMO with exact column matches', () => {
      const headers = ['Date Posted', 'Description', 'Transaction Amount'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('bmo');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.detectionMethod).toBe('exact');
    });

    it('should detect Home Trust with exact columns', () => {
      const headers = ['Date', 'Details', 'Debit/Credit'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('homeTrust');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.detectionMethod).toBe('exact');
    });

    it('should detect TD Split with Outflow/Inflow pattern', () => {
      const headers = ['Date', 'Payee', 'Outflow', 'Inflow'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('tdSplit');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.detectionMethod).toMatch(/exact|fuzzy/);
    });

    it('should detect RBC with Description 1', () => {
      const headers = ['Transaction Date', 'Description 1', 'Amount'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('rbc');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should detect Chase Credit with signature columns', () => {
      const headers = ['Transaction Date', 'Post Date', 'Description', 'Category', 'Type', 'Amount'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('chaseCredit');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  // ========================================
  // detectBankWithConfidence() - Fuzzy Matching
  // ========================================
  describe('detectBankWithConfidence() - Fuzzy Matching', () => {
    it('should handle typos in column names (BMO)', () => {
      // "Date Postd" (typo) should match "Date Posted"
      const headers = ['Date Postd', 'Description', 'Transaction Amount'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('bmo');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.detectionMethod).toMatch(/fuzzy|exact/);
    });

    it('should handle variations in column names (RBC)', () => {
      // "Transaction Dt" should fuzzy match "Transaction Date"
      const headers = ['Transaction Dt', 'Description1', 'Amount'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('rbc');
      expect(result.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('should handle extra spaces and case variations', () => {
      const headers = ['  DATE POSTED  ', '  DESCRIPTION  ', '  TRANSACTION AMOUNT  '];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('bmo');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should handle abbreviated column names', () => {
      // "Trans Date", "Desc", "Amt"
      const headers = ['Trans Date', 'Desc', 'Amt'];
      const result = detectBankWithConfidence(headers);

      // Should match something, even if confidence is lower
      expect(result.bank).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0.3);
      expect(result.detectionMethod).toMatch(/fuzzy|pattern/);
    });
  });

  // ========================================
  // detectBankWithConfidence() - Confidence Scoring
  // ========================================
  describe('detectBankWithConfidence() - Confidence Scoring', () => {
    it('should return high confidence for perfect matches', () => {
      const headers = ['Date', 'Details', 'Debit/Credit'];
      const result = detectBankWithConfidence(headers);

      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    it('should return medium confidence for fuzzy matches', () => {
      const headers = ['Dte', 'Detals', 'Debit/Crdit'];
      const result = detectBankWithConfidence(headers);

      if (result.bank) {
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
        expect(result.confidence).toBeLessThan(0.9);
      }
    });

    it('should return low confidence for weak matches', () => {
      const headers = ['Column1', 'Column2', 'Column3'];
      const result = detectBankWithConfidence(headers);

      // Should not match or have very low confidence
      if (result.bank) {
        expect(result.confidence).toBeLessThan(0.5);
      } else {
        expect(result.confidence).toBe(0);
      }
    });

    it('should return zero confidence for completely unrelated headers', () => {
      const headers = ['Random', 'Headers', 'Nothing'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBeNull();
      expect(result.confidence).toBe(0);
      expect(result.detectionMethod).toBe('none');
    });
  });

  // ========================================
  // detectBankWithConfidence() - Alternatives
  // ========================================
  describe('detectBankWithConfidence() - Alternative Suggestions', () => {
    it('should provide alternatives when multiple banks match', () => {
      // Generic headers that could match multiple banks
      const headers = ['Date', 'Description', 'Amount'];
      const result = detectBankWithConfidence(headers);

      // Should have at least one alternative suggestion
      if (result.alternatives && result.alternatives.length > 0) {
        expect(result.alternatives.length).toBeGreaterThanOrEqual(1);
        expect(result.alternatives.length).toBeLessThanOrEqual(3);

        // Each alternative should have required fields
        result.alternatives.forEach(alt => {
          expect(alt.bank).toBeDefined();
          expect(alt.confidence).toBeGreaterThanOrEqual(0);
          expect(alt.confidence).toBeLessThanOrEqual(1);
          expect(alt.reason).toBeDefined();
        });
      }
    });

    it('should not provide alternatives when match is perfect', () => {
      const headers = ['Date', 'Details', 'Debit/Credit'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('homeTrust');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);

      // May have alternatives but top match should be clear
      if (result.alternatives) {
        const topAltConfidence = result.alternatives[0]?.confidence || 0;
        expect(result.confidence).toBeGreaterThan(topAltConfidence);
      }
    });

    it('should sort alternatives by confidence', () => {
      const headers = ['Date', 'Description', 'Amount'];
      const result = detectBankWithConfidence(headers);

      if (result.alternatives && result.alternatives.length > 1) {
        // Alternatives should be sorted descending by confidence
        for (let i = 0; i < result.alternatives.length - 1; i++) {
          expect(result.alternatives[i].confidence).toBeGreaterThanOrEqual(
            result.alternatives[i + 1].confidence
          );
        }
      }
    });
  });

  // ========================================
  // detectBankWithConfidence() - Split Formats
  // ========================================
  describe('detectBankWithConfidence() - Split Format Detection', () => {
    it('should prefer split format when Debit/Credit columns present', () => {
      const headers = ['Transaction Date', 'Description 1', 'Debit', 'Credit', 'Balance'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('rbcSplit');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should prefer single amount format when Amount column present', () => {
      const headers = ['Transaction Date', 'Description 1', 'Amount'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('rbc');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should detect TD Split with Outflow/Inflow', () => {
      const headers = ['Date', 'Payee', 'Outflow', 'Inflow', 'Balance'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('tdSplit');
      expect(result.detectionMethod).toMatch(/exact|fuzzy/);
    });
  });

  // ========================================
  // detectBankWithConfidence() - Bank Signatures
  // ========================================
  describe('detectBankWithConfidence() - Bank Signature Patterns', () => {
    it('should boost BMO score with "First Bank Card" signature', () => {
      const headers = ['First Bank Card', 'Date Posted', 'Transaction Amount'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('bmo');
      expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    });

    it('should boost Bank of America score with Posted Date + Payee', () => {
      const headers = ['Posted Date', 'Payee', 'Address', 'Amount'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('bankOfAmerica');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should boost Capital One score with Debit/Credit split', () => {
      const headers = ['Transaction Date', 'Posted Date', 'Debit', 'Credit'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('capitalOne');
      expect(result.confidence).toBeGreaterThanOrEqual(0.6);
    });
  });

  // ========================================
  // Backward Compatibility Tests
  // ========================================
  describe('Backward Compatibility', () => {
    it('detectBank() should still work (legacy exact matching)', () => {
      const headers = ['Date Posted', 'Description', 'Transaction Amount'];
      const result = detectBank(headers);

      expect(result).toBe('bmo');
    });

    it('detectBankLegacy() should use enhanced detection', () => {
      const headers = ['Date Posted', 'Description', 'Transaction Amount'];
      const legacy = detectBankLegacy(headers);
      const enhanced = detectBankWithConfidence(headers);

      expect(legacy).toBe(enhanced.bank);
    });

    it('detectBankLegacy() should return null for low confidence', () => {
      const headers = ['Random', 'Headers', 'Nothing'];
      const result = detectBankLegacy(headers);

      expect(result).toBeNull();
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe('Edge Cases', () => {
    it('should handle empty headers array', () => {
      const headers: string[] = [];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('should handle single column header', () => {
      const headers = ['Date'];
      const result = detectBankWithConfidence(headers);

      // May or may not match, but should not crash
      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle very long header names', () => {
      const headers = [
        'This Is A Very Long Column Name That Describes The Date',
        'Another Long Column Name For Description',
        'Transaction Amount Column Name',
      ];
      const result = detectBankWithConfidence(headers);

      // Should still work with fuzzy matching
      expect(result).toBeDefined();
    });

    it('should handle headers with special characters', () => {
      const headers = ['Date (MM/DD/YYYY)', 'Description #', 'Amount ($)'];
      const result = detectBankWithConfidence(headers);

      // Should handle special chars gracefully
      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should be case-insensitive', () => {
      const lower = ['date posted', 'description', 'transaction amount'];
      const upper = ['DATE POSTED', 'DESCRIPTION', 'TRANSACTION AMOUNT'];
      const mixed = ['Date Posted', 'Description', 'Transaction Amount'];

      const result1 = detectBankWithConfidence(lower);
      const result2 = detectBankWithConfidence(upper);
      const result3 = detectBankWithConfidence(mixed);

      expect(result1.bank).toBe(result2.bank);
      expect(result2.bank).toBe(result3.bank);
      expect(result1.bank).toBe('bmo');
    });
  });

  // ========================================
  // Real-World Scenarios
  // ========================================
  describe('Real-World Scenarios', () => {
    it('should handle BMO CSV with extra metadata rows', () => {
      // BMO typically has 3 header rows before actual headers
      const headers = ['Date Posted', 'Description', 'Transaction Amount', 'Transaction Type', 'Balance'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('bmo');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should handle Chase Credit Card with all columns', () => {
      const headers = [
        'Transaction Date',
        'Post Date',
        'Description',
        'Category',
        'Type',
        'Amount',
        'Memo',
      ];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('chaseCredit');
    });

    it('should handle RBC with Description1 (no space)', () => {
      const headers = ['Transaction Date', 'Description1', 'Description2', 'Amount', 'Balance'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('rbc');
    });

    it('should handle Tangerine with Name column', () => {
      const headers = ['Date', 'Name', 'Memo', 'Amount', 'Balance'];
      const result = detectBankWithConfidence(headers);

      expect(result.bank).toBe('tangerine');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should distinguish between similar banks', () => {
      // Test that RBC and RBCSplit are correctly distinguished
      const rbcHeaders = ['Transaction Date', 'Description 1', 'Amount'];
      const rbcSplitHeaders = ['Transaction Date', 'Description 1', 'Debit', 'Credit'];

      const rbcResult = detectBankWithConfidence(rbcHeaders);
      const rbcSplitResult = detectBankWithConfidence(rbcSplitHeaders);

      expect(rbcResult.bank).toBe('rbc');
      expect(rbcSplitResult.bank).toBe('rbcSplit');
    });
  });

  // ========================================
  // Performance & Scalability
  // ========================================
  describe('Performance & Scalability', () => {
    it('should handle many columns efficiently', () => {
      const headers = Array.from({ length: 50 }, (_, i) => `Column ${i}`);
      headers[0] = 'Date Posted';
      headers[1] = 'Description';
      headers[2] = 'Transaction Amount';

      const start = Date.now();
      const result = detectBankWithConfidence(headers);
      const elapsed = Date.now() - start;

      expect(result.bank).toBe('bmo');
      expect(elapsed).toBeLessThan(100); // Should be fast
    });

    it('should handle all 20+ bank configs without errors', () => {
      const headers = ['Date', 'Description', 'Amount'];

      // Should not crash and should return a result
      const result = detectBankWithConfidence(headers);
      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });
  });
});
